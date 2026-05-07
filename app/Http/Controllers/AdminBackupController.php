<?php

namespace App\Http\Controllers;

use App\Models\BackupSnapshot;
use App\Services\BackupPortalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Response;
use Throwable;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AdminBackupController extends Controller
{
    public function __construct(private readonly BackupPortalService $backupPortalService) {}

    public function index(): InertiaResponse
    {
        return Inertia::render('Admin/Settings/Backups', [
            'backups' => BackupSnapshot::query()
                ->with('creator:id,name')
                ->latest()
                ->get()
                ->map(fn(BackupSnapshot $backup) => [
                    'id' => $backup->id,
                    'name' => $backup->name,
                    'status' => $backup->status,
                    'progress_percentage' => (int) $backup->progress_percentage,
                    'size_bytes' => $backup->size_bytes,
                    'notes' => $backup->notes,
                    'created_at' => $backup->created_at?->toIso8601String(),
                    'restored_at' => $backup->restored_at?->toIso8601String(),
                    'creator' => $backup->creator?->name,
                ])
                ->all(),
        ]);
    }

    public function store(): RedirectResponse
    {
        try {
            $this->backupPortalService->create(auth()->id());
        } catch (Throwable $exception) {
            return redirect()
                ->route('admin.settings.backups')
                ->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('admin.settings.backups')
            ->with('success', 'A full backup restore point was created successfully.');
    }

    public function download(BackupSnapshot $backup)
    {
        abort_unless(is_file($backup->file_path), 404);

        return Response::download($backup->file_path, basename($backup->file_path));
    }

    public function restore(BackupSnapshot $backup): RedirectResponse
    {
        try {
            $this->backupPortalService->restore($backup);
        } catch (Throwable $exception) {
            return redirect()
                ->route('admin.settings.backups')
                ->with('error', $exception->getMessage());
        }

        return redirect()
            ->route('admin.settings.backups')
            ->with('success', "Backup {$backup->name} was restored.");
    }

    public function destroy(BackupSnapshot $backup): RedirectResponse
    {
        if (is_file($backup->file_path)) {
            unlink($backup->file_path);
        }

        $backup->delete();

        return redirect()
            ->route('admin.settings.backups')
            ->with('success', "Backup {$backup->name} was deleted successfully.");
    }
}
