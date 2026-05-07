<?php

namespace App\Services;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;

class SiteMailSettingsService
{
    public function applyRuntimeConfig(): void
    {
        $settings = SiteSetting::current();

        if (! $settings->mail_enabled) {
            return;
        }

        $mailer = in_array($settings->mail_mailer, ['smtp', 'log'], true)
            ? $settings->mail_mailer
            : 'smtp';

        Config::set('mail.default', $mailer);

        if ($mailer === 'smtp') {
            Config::set('mail.mailers.smtp.host', $settings->mail_host ?: config('mail.mailers.smtp.host'));
            Config::set('mail.mailers.smtp.port', $settings->mail_port ?: config('mail.mailers.smtp.port'));
            Config::set('mail.mailers.smtp.encryption', $settings->mail_encryption ?: config('mail.mailers.smtp.encryption'));
            Config::set('mail.mailers.smtp.username', $settings->mail_username ?: config('mail.mailers.smtp.username'));
            Config::set('mail.mailers.smtp.password', $this->decryptPassword($settings->mail_password_encrypted));
        }

        $fromAddress = $this->validEmail($settings->mail_from_address) ?? $this->validEmail(config('mail.from.address'));

        if ($fromAddress) {
            Config::set('mail.from.address', $fromAddress);
        }

        if ($settings->mail_from_name) {
            Config::set('mail.from.name', $settings->mail_from_name);
        }
    }

    public function encryptPassword(?string $password): ?string
    {
        $password = trim((string) $password);

        return $password !== '' ? Crypt::encryptString($password) : null;
    }

    public function decryptPassword(?string $encrypted): ?string
    {
        if (! $encrypted) {
            return null;
        }

        try {
            return Crypt::decryptString($encrypted);
        } catch (\Throwable) {
            return null;
        }
    }

    private function validEmail(?string $value): ?string
    {
        $email = trim((string) $value);

        return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
    }
}
