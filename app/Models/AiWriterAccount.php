<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

class AiWriterAccount extends Model
{
    protected $fillable = [
        'name',
        'provider',
        'model',
        'api_key_encrypted',
        'default_instructions',
        'is_active',
        'sort_order',
        'last_used_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'last_used_at' => 'datetime',
        ];
    }

    public function setApiKey(?string $apiKey): void
    {
        $apiKey = trim((string) $apiKey);

        if ($apiKey !== '') {
            $this->api_key_encrypted = Crypt::encryptString($apiKey);
        }
    }

    public function apiKey(): ?string
    {
        if (! $this->api_key_encrypted) {
            return null;
        }

        try {
            return Crypt::decryptString($this->api_key_encrypted);
        } catch (\Throwable) {
            return null;
        }
    }

    public function maskedApiKey(): string
    {
        $apiKey = $this->apiKey();

        if (! $apiKey) {
            return 'Not saved';
        }

        return Str::mask($apiKey, '*', 8, max(strlen($apiKey) - 12, 0));
    }
}
