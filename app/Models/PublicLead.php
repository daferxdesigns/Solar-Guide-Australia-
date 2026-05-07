<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PublicLead extends Model
{
    protected $fillable = [
        'source',
        'form_name',
        'name',
        'email',
        'phone',
        'address_line_1',
        'suburb',
        'state',
        'postcode',
        'message',
        'payload',
        'result_summary',
        'emailed_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'result_summary' => 'array',
            'emailed_at' => 'datetime',
        ];
    }
}
