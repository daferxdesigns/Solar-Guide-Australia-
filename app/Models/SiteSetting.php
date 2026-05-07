<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class SiteSetting extends Model
{
    protected $fillable = [
        'site_title',
        'site_tagline',
        'hero_title',
        'hero_subtitle',
        'default_seo_keywords',
        'default_seo_title',
        'default_seo_description',
        'google_site_verification_code',
        'default_og_image_path',
        'seo_indexing_enabled',
        'robots_txt_content',
        'sitemap_enabled',
        'sitemap_include_posts',
        'sitemap_include_pages',
        'sitemap_include_categories',
        'sitemap_extra_urls',
        'homepage_background_image_path',
        'homepage_page_id',
        'custom_homepage_enabled',
        'adsense_enabled',
        'adsense_display_ads',
        'adsense_auto_ads_enabled',
        'adsense_publisher_id',
        'adsense_verification_code',
        'adsense_header_slot',
        'adsense_in_article_slot',
        'adsense_sidebar_slot',
        'dynamic_menus_enabled',
        'mail_enabled',
        'mail_mailer',
        'mail_host',
        'mail_port',
        'mail_encryption',
        'mail_username',
        'mail_password_encrypted',
        'mail_from_address',
        'mail_from_name',
        'contact_notification_email',
        'footer_layout',
        'footer_background_mode',
        'footer_background_color',
        'footer_background_image_path',
        'footer_background_image_position',
        'footer_background_image_size',
        'footer_background_image_repeat',
        'captcha_enabled',
        'captcha_provider',
        'captcha_site_key',
        'captcha_secret_key',
        'captcha_forms',
    ];

    protected $appends = ['homepage_background_image_url', 'footer_background_image_url', 'default_og_image_url'];

    public static function current(): self
    {
        return static::query()->firstOrCreate(
            ['id' => 1],
            [
                'site_title' => 'Solar Support Australia',
                'site_tagline' => 'Australia-focused solar guides, troubleshooting help and energy updates.',
                'hero_title' => 'Solar installation guides and troubleshooting articles',
                'hero_subtitle' => 'Australia-focused solar guides for installers, admin teams, and solar system owners.',
                'default_seo_keywords' => 'solar guides Australia, inverter WiFi setup Australia, solar troubleshooting, solar battery rebate Australia, feed in tariff Australia, solar blog Australia',
                'default_seo_title' => 'Solar Support Australia | Solar Guides, Inverter Wi-Fi Help and Rebates',
                'default_seo_description' => 'Australia-focused solar guides, inverter Wi-Fi setup articles, troubleshooting help, battery rebate updates and solar policy news.',
                'seo_indexing_enabled' => true,
                'sitemap_enabled' => true,
                'sitemap_include_posts' => true,
                'sitemap_include_pages' => true,
                'sitemap_include_categories' => true,
                'adsense_enabled' => false,
                'adsense_display_ads' => false,
                'adsense_auto_ads_enabled' => false,
                'mail_enabled' => false,
                'mail_mailer' => 'smtp',
                'mail_host' => 'smtp.gmail.com',
                'mail_port' => 587,
                'mail_encryption' => 'tls',
                'mail_from_name' => 'Solar Support Australia',
                'contact_notification_email' => 'daferxdesigns@gmail.com',
                'footer_layout' => self::defaultFooterLayout(),
                'footer_background_mode' => 'color',
                'footer_background_color' => '#ffffff',
                'footer_background_image_position' => 'center center',
                'footer_background_image_size' => 'cover',
                'footer_background_image_repeat' => 'no-repeat',
                'captcha_enabled' => false,
                'captcha_provider' => 'recaptcha_v2',
                'captcha_forms' => [
                    'contact' => false,
                    'calculator' => false,
                    'chat' => false,
                    'comment' => false,
                    'subscribe' => false,
                ],
            ],
        );
    }

    protected function casts(): array
    {
        return [
            'adsense_enabled' => 'boolean',
            'adsense_display_ads' => 'boolean',
            'adsense_auto_ads_enabled' => 'boolean',
            'dynamic_menus_enabled' => 'boolean',
            'mail_enabled' => 'boolean',
            'mail_port' => 'integer',
            'footer_layout' => 'array',
            'captcha_enabled' => 'boolean',
            'captcha_forms' => 'array',
            'homepage_page_id' => 'integer',
            'custom_homepage_enabled' => 'boolean',
            'seo_indexing_enabled' => 'boolean',
            'sitemap_enabled' => 'boolean',
            'sitemap_include_posts' => 'boolean',
            'sitemap_include_pages' => 'boolean',
            'sitemap_include_categories' => 'boolean',
        ];
    }

    public function homepagePage(): BelongsTo
    {
        return $this->belongsTo(SitePage::class, 'homepage_page_id');
    }

    public function getHomepageBackgroundImageUrlAttribute(): ?string
    {
        if (!$this->homepage_background_image_path) {
            return null;
        }

        return Storage::disk('public')->url($this->homepage_background_image_path);
    }

    public function getFooterBackgroundImageUrlAttribute(): ?string
    {
        if (!$this->footer_background_image_path) {
            return null;
        }

        return Storage::disk('public')->url($this->footer_background_image_path);
    }

    public function getDefaultOgImageUrlAttribute(): ?string
    {
        if (!$this->default_og_image_path) {
            return null;
        }

        return Storage::disk('public')->url($this->default_og_image_path);
    }

    public static function defaultFooterLayout(): array
    {
        return [
            [
                'id' => 'brand',
                'type' => 'brand',
                'title' => 'Solar Support Australia',
                'body' => 'Practical solar guides, inverter Wi-Fi help, troubleshooting walkthroughs and Australia-focused solar updates for homeowners.',
                'enabled' => true,
            ],
            [
                'id' => 'quick-links',
                'type' => 'links',
                'title' => 'Quick links',
                'items' => [
                    ['label' => 'Home', 'url' => '/'],
                    ['label' => 'Blog', 'url' => '/guides#articles'],
                    ['label' => 'Contact us', 'url' => '/guides#contact'],
                ],
                'enabled' => true,
            ],
            [
                'id' => 'categories',
                'type' => 'categories',
                'title' => 'Popular categories',
                'limit' => 4,
                'enabled' => true,
            ],
            [
                'id' => 'subscribe',
                'type' => 'subscribe',
                'title' => 'Subscribe',
                'body' => 'Get practical solar tips, support updates, and new guide releases in your inbox.',
                'button_label' => 'Subscribe',
                'enabled' => true,
            ],
        ];
    }
}
