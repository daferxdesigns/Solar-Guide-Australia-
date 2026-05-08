<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class GuidePost extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'guide_category_id',
        'user_id',
        'title',
        'slug',
        'status',
        'is_featured',
        'featured_image_path',
        'featured_image_alt',
        'header_background_mode',
        'header_background_color',
        'header_background_image_path',
        'header_background_image_position',
        'header_background_image_size',
        'header_background_image_repeat',
        'header_overlay_opacity',
        'excerpt',
        'seo_title',
        'seo_description',
        'seo_keywords',
        'canonical_url',
        'schema_type',
        'schema_custom_json',
        'content',
        'published_at',
    ];

    protected $appends = ['featured_image_url', 'header_background_image_url'];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'header_overlay_opacity' => 'integer',
            'schema_custom_json' => 'array',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(GuideCategory::class, 'guide_category_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function visits(): HasMany
    {
        return $this->hasMany(GuidePostVisit::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(GuidePostComment::class);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query
            ->where('status', 'published')
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function getFeaturedImageUrlAttribute(): ?string
    {
        if (!$this->featured_image_path) {
            return null;
        }

        return Storage::disk('public')->url($this->featured_image_path);
    }

    public function getHeaderBackgroundImageUrlAttribute(): ?string
    {
        if (!$this->header_background_image_path) {
            return null;
        }

        return Storage::disk('public')->url($this->header_background_image_path);
    }
}
