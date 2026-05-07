<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GuidePostVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'guide_post_id',
        'visitor_hash',
        'device_type',
        'browser',
        'operating_system',
        'referrer_host',
        'ip_address',
        'user_agent',
        'visited_at',
    ];

    protected function casts(): array
    {
        return [
            'visited_at' => 'datetime',
        ];
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(GuidePost::class, 'guide_post_id');
    }
}
