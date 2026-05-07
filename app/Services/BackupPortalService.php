<?php

namespace App\Services;

use App\Models\BackupSnapshot;
use RuntimeException;
use ZipArchive;

class BackupPortalService
{
    public function create(?int $userId = null): BackupSnapshot
    {
        $timestamp = now()->format('Ymd-His');
        $name = "site-backup-{$timestamp}";
        $backupRoot = storage_path('app/private/backups');
        $workspace = storage_path("app/private/backup-work/{$name}");
        $projectSnapshot = $workspace . '/project';
        $databaseDir = $workspace . '/database';
        $archivePath = "{$backupRoot}/{$name}.zip";

        $this->ensureDirectory($backupRoot);
        $this->ensureDirectory($projectSnapshot);
        $this->ensureDirectory($databaseDir);

        $snapshot = BackupSnapshot::query()->create([
            'name' => $name,
            'file_path' => $archivePath,
            'size_bytes' => 0,
            'status' => 'creating',
            'progress_percentage' => 0,
            'created_by' => $userId,
            'notes' => 'Preparing backup workspace.',
        ]);

        try {
            $this->updateProgress($snapshot, 10, 'creating', 'Preparing backup workspace.');
            $this->writeDatabaseDump("{$databaseDir}/database.sql");
            $this->updateProgress($snapshot, 35, 'creating', 'Database dump created.');
            $this->writeManifest("{$workspace}/manifest.json");
            $this->updateProgress($snapshot, 50, 'creating', 'Manifest prepared.');
            $this->copyProject($projectSnapshot);
            $this->updateProgress($snapshot, 78, 'creating', 'Project files copied.');
            $this->createArchive($workspace, $archivePath);
            $this->updateProgress($snapshot, 95, 'creating', 'Archive created.');

            $snapshot->forceFill([
                'size_bytes' => is_file($archivePath) ? (filesize($archivePath) ?: 0) : 0,
                'status' => 'ready',
                'progress_percentage' => 100,
                'notes' => 'Full site backup with project files, uploads, environment settings, and database dump.',
            ])->save();

            return $snapshot->fresh();
        } catch (\Throwable $exception) {
            $snapshot->forceFill([
                'status' => 'failed',
                'notes' => $exception->getMessage(),
            ])->save();

            throw $exception;
        } finally {
            $this->deleteDirectory($workspace);
        }
    }

    public function restore(BackupSnapshot $snapshot): void
    {
        if (!is_file($snapshot->file_path)) {
            throw new RuntimeException('The selected backup archive could not be found.');
        }

        $restoreRoot = storage_path('app/private/backup-restore/' . $snapshot->id . '-' . now()->format('Ymd-His'));
        $projectPath = $restoreRoot . '/project';
        $databaseDumpPath = $restoreRoot . '/database/database.sql';

        $snapshot->forceFill([
            'status' => 'restoring',
            'notes' => 'Restore in progress.',
        ])->save();

        try {
            $this->ensureDirectory($restoreRoot);
            $this->extractArchive($snapshot->file_path, $restoreRoot);

            if (!is_file($databaseDumpPath)) {
                throw new RuntimeException('The backup archive is missing its database dump.');
            }

            $this->importDatabaseDump($databaseDumpPath);
            $this->restoreProject($projectPath);

            $snapshot->forceFill([
                'status' => 'ready',
                'restored_at' => now(),
                'notes' => 'Backup restored successfully.',
            ])->save();
        } catch (\Throwable $exception) {
            $snapshot->forceFill([
                'status' => 'failed',
                'notes' => $exception->getMessage(),
            ])->save();

            throw $exception;
        } finally {
            $this->deleteDirectory($restoreRoot);
        }
    }

    private function writeDatabaseDump(string $destination): void
    {
        $command = $this->resolveMysqlBinary('mysqldump.exe');
        $database = config('database.connections.mysql.database');
        $username = config('database.connections.mysql.username');
        $password = (string) config('database.connections.mysql.password');
        $host = config('database.connections.mysql.host');
        $port = (string) config('database.connections.mysql.port');

        $parts = [
            $this->quote($command),
            '--host=' . $this->quote($host),
            '--port=' . $this->quote($port),
            '--user=' . $this->quote($username),
            '--skip-comments',
            '--single-transaction',
            '--routines',
            '--triggers',
        ];

        if ($password !== '') {
            $parts[] = '--password=' . $this->quote($password);
        }

        $parts[] = $this->quote($database);
        $parts[] = '> ' . $this->quote($destination);

        $this->runShellCommand(implode(' ', $parts));
    }

    private function importDatabaseDump(string $source): void
    {
        $command = $this->resolveMysqlBinary('mysql.exe');
        $database = config('database.connections.mysql.database');
        $username = config('database.connections.mysql.username');
        $password = (string) config('database.connections.mysql.password');
        $host = config('database.connections.mysql.host');
        $port = (string) config('database.connections.mysql.port');

        $parts = [
            $this->quote($command),
            '--host=' . $this->quote($host),
            '--port=' . $this->quote($port),
            '--user=' . $this->quote($username),
        ];

        if ($password !== '') {
            $parts[] = '--password=' . $this->quote($password);
        }

        $parts[] = $this->quote($database);
        $parts[] = '< ' . $this->quote($source);

        $this->runShellCommand(implode(' ', $parts));
    }

    private function writeManifest(string $destination): void
    {
        file_put_contents($destination, json_encode([
            'created_at' => now()->toIso8601String(),
            'app_name' => config('app.name'),
            'database' => config('database.connections.mysql.database'),
            'project_root' => base_path(),
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }

    private function copyProject(string $destination): void
    {
        $source = base_path();
        $excluded = [
            '.git',
            'node_modules',
            'public/storage',
            'storage/app/private/backups',
            'storage/app/private/backup-work',
            'storage/app/private/backup-restore',
            'storage/logs',
            'storage/framework/cache',
            'storage/framework/sessions',
            'storage/framework/testing',
            'storage/framework/views',
        ];

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($source, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $item) {
            $path = $item->getPathname();
            $relativePath = ltrim(str_replace('\\', '/', substr($path, strlen($source))), '/');

            if ($relativePath === '') {
                continue;
            }

            foreach ($excluded as $skip) {
                if ($relativePath === $skip || str_starts_with($relativePath, $skip . '/')) {
                    continue 2;
                }
            }

            $target = $destination . '/' . $relativePath;

            if ($item->isLink()) {
                continue;
            }

            if ($item->isDir()) {
                $this->ensureDirectory($target);
                continue;
            }

            $this->ensureDirectory(dirname($target));
            copy($path, $target);
        }
    }

    private function restoreProject(string $source): void
    {
        if (!is_dir($source)) {
            throw new RuntimeException('The backup archive does not contain a project snapshot.');
        }

        $destination = base_path();
        $excluded = [
            'public/storage',
            'storage/app/private/backups',
            'storage/app/private/backup-work',
            'storage/app/private/backup-restore',
        ];

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($source, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $item) {
            $path = $item->getPathname();
            $relativePath = ltrim(str_replace('\\', '/', substr($path, strlen($source))), '/');

            if ($relativePath === '') {
                continue;
            }

            foreach ($excluded as $skip) {
                if ($relativePath === $skip || str_starts_with($relativePath, $skip . '/')) {
                    continue 2;
                }
            }

            $target = $destination . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);

            if ($item->isLink()) {
                continue;
            }

            if ($item->isDir()) {
                $this->ensureDirectory($target);
                continue;
            }

            $this->ensureDirectory(dirname($target));
            copy($path, $target);
        }
    }

    private function createArchive(string $source, string $destination): void
    {
        $zip = new ZipArchive();

        if ($zip->open($destination, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Unable to create the backup archive.');
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($source, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $item) {
            $path = $item->getPathname();
            $relativePath = ltrim(str_replace('\\', '/', substr($path, strlen($source))), '/');

            if ($item->isDir()) {
                $zip->addEmptyDir($relativePath);
                continue;
            }

            $zip->addFile($path, $relativePath);
        }

        $zip->close();
    }

    private function extractArchive(string $archivePath, string $destination): void
    {
        $zip = new ZipArchive();

        if ($zip->open($archivePath) !== true) {
            throw new RuntimeException('Unable to open the selected backup archive.');
        }

        $zip->extractTo($destination);
        $zip->close();
    }

    private function resolveMysqlBinary(string $binary): string
    {
        $configured = env('MYSQL_BIN_PATH');

        if (is_string($configured) && $configured !== '') {
            $candidate = rtrim($configured, '\\/') . DIRECTORY_SEPARATOR . $binary;
            if (is_file($candidate)) {
                return $candidate;
            }
        }

        $candidates = array_merge(
            glob('C:/laragon/bin/mysql/*/bin/' . $binary) ?: [],
            glob('E:/Development/laragon/bin/mysql/*/bin/' . $binary) ?: []
        );

        if ($candidates !== []) {
            rsort($candidates);
            return $candidates[0];
        }

        return $binary;
    }

    private function runShellCommand(string $command): void
    {
        exec($command . ' 2>&1', $output, $exitCode);

        if ($exitCode !== 0) {
            throw new RuntimeException(implode(PHP_EOL, $output) ?: 'The backup command failed.');
        }
    }

    private function ensureDirectory(string $path): void
    {
        if (!is_dir($path) && !mkdir($path, 0777, true) && !is_dir($path)) {
            throw new RuntimeException("Unable to create directory: {$path}");
        }
    }

    private function deleteDirectory(string $path): void
    {
        if (!is_dir($path)) {
            return;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($iterator as $item) {
            if ($item->isDir()) {
                rmdir($item->getPathname());
                continue;
            }

            unlink($item->getPathname());
        }

        rmdir($path);
    }

    private function quote(string $value): string
    {
        return '"' . str_replace('"', '\"', $value) . '"';
    }

    private function updateProgress(BackupSnapshot $snapshot, int $percentage, string $status = 'creating', ?string $notes = null): void
    {
        $snapshot->progress_percentage = $percentage;
        $snapshot->status = $status;
        if ($notes !== null) {
            $snapshot->notes = $notes;
        }
        $snapshot->save();
    }
}
