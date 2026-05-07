<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class SitePage extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'status',
        'excerpt',
        'content',
        'seo_title',
        'seo_description',
        'seo_keywords',
        'canonical_url',
        'featured_image_path',
        'featured_image_alt',
        'published_at',
        'created_by',
        'updated_by',
    ];

    protected $appends = [
        'featured_image_url',
        'public_url',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    public function getFeaturedImageUrlAttribute(): ?string
    {
        if (!$this->featured_image_path) {
            return null;
        }

        return Storage::disk('public')->url($this->featured_image_path);
    }

    public function getPublicUrlAttribute(): string
    {
        return route('pages.show', ['page' => $this->slug]);
    }

    public function scopePublished($query)
    {
        return $query
            ->where('status', 'published')
            ->where(function ($inner) {
                $inner->whereNull('published_at')->orWhere('published_at', '<=', now());
            });
    }
}
