<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsEvent extends Model
{
    protected $fillable = [
        'event_name',
        'path',
        'page_title',
        'target',
        'guide_post_id',
        'guide_category_id',
        'visitor_hash',
        'session_hash',
        'device_type',
        'browser',
        'operating_system',
        'referrer_host',
        'ip_address',
        'user_agent',
        'metadata',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'occurred_at' => 'datetime',
        ];
    }
}
