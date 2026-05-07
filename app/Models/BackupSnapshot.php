<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BackupSnapshot extends Model
{
    protected $fillable = [
        'name',
        'file_path',
        'size_bytes',
        'status',
        'created_by',
        'restored_at',
        'notes',
        'progress_percentage',
    ];

    protected function casts(): array
    {
        return [
            'restored_at' => 'datetime',
            'progress_percentage' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
