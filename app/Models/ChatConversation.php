<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChatConversation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'session_id',
        'visitor_name',
        'visitor_email',
        'visitor_phone',
        'status',
        'last_message_at',
        'visitor_last_seen_at',
        'admin_last_seen_at',
        'visitor_typing_at',
        'admin_typing_at',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'visitor_last_seen_at' => 'datetime',
            'admin_last_seen_at' => 'datetime',
            'visitor_typing_at' => 'datetime',
            'admin_typing_at' => 'datetime',
        ];
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }
}
