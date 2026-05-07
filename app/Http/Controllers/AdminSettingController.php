<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\SiteSetting;
use App\Models\ChatConversation;
use App\Models\GuidePost;
use App\Models\GuidePostComment;
use App\Models\SitePage;
use App\Services\SiteMailSettingsService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingController extends Controller
{
    public function edit(): RedirectResponse
    {
        return redirect()->route('admin.settings.general');
    }

    public function general(): Response
    {
        $settings = SiteSetting::current();

        return Inertia::render('Admin/Settings/General', [
            'settings' => [
                'site_title' => $settings->site_title ?? '',
                'site_tagline' => $settings->site_tagline ?? '',
                'hero_title' => $settings->hero_title ?? '',
                'hero_subtitle' => $settings->hero_subtitle ?? '',
                'homepage_background_image_url' => $settings->homepage_background_image_url,
                'homepage_page_id' => $settings->homepage_page_id,
                'custom_homepage_enabled' => (bool) $settings->custom_homepage_enabled,
            ],
            'homepageOptions' => SitePage::query()
                ->latest('updated_at')
                ->get(['id', 'title', 'slug', 'status'])
                ->map(fn (SitePage $page) => [
                    'id' => $page->id,
                    'title' => $page->title,
                    'slug' => $page->slug,
                    'status' => $page->status,
                ])
                ->all(),
        ]);
    }

    public function updateGeneral(Request $request): RedirectResponse
    {
        $settings = SiteSetting::current();

        $validated = $request->validate([
            'site_title' => ['required', 'string', 'max:255'],
            'site_tagline' => ['nullable', 'string', 'max:255'],
            'hero_title' => ['required', 'string', 'max:255'],
            'hero_subtitle' => ['nullable', 'string', 'max:2000'],
            'homepage_background_image' => ['nullable', 'image', 'max:6144'],
            'remove_homepage_background_image' => ['nullable', 'boolean'],
            'homepage_page_id' => ['nullable', 'exists:site_pages,id'],
            'custom_homepage_enabled' => ['nullable', 'boolean'],
        ]);

        if (($validated['remove_homepage_background_image'] ?? false) && $settings->homepage_background_image_path) {
            Storage::disk('public')->delete($settings->homepage_background_image_path);
            $settings->homepage_background_image_path = null;
        }

        if ($request->hasFile('homepage_background_image')) {
            if ($settings->homepage_background_image_path) {
                Storage::disk('public')->delete($settings->homepage_background_image_path);
            }

            $settings->homepage_background_image_path = $request->file('homepage_background_image')->store('guides/site-settings', 'public');
        }

        $settings->fill([
            'site_title' => trim((string) $validated['site_title']),
            'site_tagline' => $this->nullableString($validated['site_tagline'] ?? null),
            'hero_title' => trim((string) $validated['hero_title']),
            'hero_subtitle' => $this->nullableString($validated['hero_subtitle'] ?? null),
            'homepage_page_id' => $validated['homepage_page_id'] ?? null,
            'custom_homepage_enabled' => (bool) ($validated['custom_homepage_enabled'] ?? false),
        ]);
        $settings->save();

        return back()->with('success', 'General site settings updated.');
    }

    public function seo(): Response
    {
        $settings = SiteSetting::current();

        return Inertia::render('Admin/Settings/Seo', [
            'settings' => [
                'default_seo_title' => $settings->default_seo_title ?? '',
                'default_seo_description' => $settings->default_seo_description ?? '',
                'default_seo_keywords' => $settings->default_seo_keywords ?? '',
                'google_site_verification_code' => $settings->google_site_verification_code ?? '',
                'default_og_image_url' => $settings->default_og_image_url,
                'seo_indexing_enabled' => (bool) ($settings->seo_indexing_enabled ?? true),
                'robots_txt_content' => $settings->robots_txt_content ?: $this->defaultRobotsContent(),
                'sitemap_enabled' => (bool) ($settings->sitemap_enabled ?? true),
                'sitemap_include_posts' => (bool) ($settings->sitemap_include_posts ?? true),
                'sitemap_include_pages' => (bool) ($settings->sitemap_include_pages ?? true),
                'sitemap_include_categories' => (bool) ($settings->sitemap_include_categories ?? true),
                'sitemap_extra_urls' => $settings->sitemap_extra_urls ?? '',
            ],
            'endpoints' => [
                'robots_url' => route('robots'),
                'sitemap_url' => route('sitemap'),
            ],
        ]);
    }

    public function updateSeo(Request $request): RedirectResponse
    {
        $settings = SiteSetting::current();

        $validated = $request->validate([
            'default_seo_title' => ['nullable', 'string', 'max:255'],
            'default_seo_description' => ['nullable', 'string', 'max:1000'],
            'default_seo_keywords' => ['nullable', 'string', 'max:2000'],
            'google_site_verification_code' => ['nullable', 'string', 'max:1000'],
            'seo_indexing_enabled' => ['nullable', 'boolean'],
            'default_og_image' => ['nullable', 'image', 'max:6144'],
            'remove_default_og_image' => ['nullable', 'boolean'],
            'robots_txt_content' => ['nullable', 'string', 'max:10000'],
            'sitemap_enabled' => ['nullable', 'boolean'],
            'sitemap_include_posts' => ['nullable', 'boolean'],
            'sitemap_include_pages' => ['nullable', 'boolean'],
            'sitemap_include_categories' => ['nullable', 'boolean'],
            'sitemap_extra_urls' => ['nullable', 'string', 'max:20000'],
        ]);

        if (($validated['remove_default_og_image'] ?? false) && $settings->default_og_image_path) {
            Storage::disk('public')->delete($settings->default_og_image_path);
            $settings->default_og_image_path = null;
        }

        if ($request->hasFile('default_og_image')) {
            if ($settings->default_og_image_path) {
                Storage::disk('public')->delete($settings->default_og_image_path);
            }

            $settings->default_og_image_path = $request->file('default_og_image')->store('guides/site-settings', 'public');
        }

        $settings->fill([
            'default_seo_title' => $this->nullableString($validated['default_seo_title'] ?? null),
            'default_seo_description' => $this->nullableString($validated['default_seo_description'] ?? null),
            'default_seo_keywords' => $this->nullableString($validated['default_seo_keywords'] ?? null),
            'google_site_verification_code' => $this->googleVerificationCode($validated['google_site_verification_code'] ?? null),
            'seo_indexing_enabled' => (bool) ($validated['seo_indexing_enabled'] ?? false),
            'robots_txt_content' => $this->nullableString($validated['robots_txt_content'] ?? null),
            'sitemap_enabled' => (bool) ($validated['sitemap_enabled'] ?? false),
            'sitemap_include_posts' => (bool) ($validated['sitemap_include_posts'] ?? false),
            'sitemap_include_pages' => (bool) ($validated['sitemap_include_pages'] ?? false),
            'sitemap_include_categories' => (bool) ($validated['sitemap_include_categories'] ?? false),
            'sitemap_extra_urls' => $this->normalizedExtraSitemapUrls($validated['sitemap_extra_urls'] ?? null),
        ]);
        $settings->save();

        return back()->with('success', 'SEO and crawling settings updated.');
    }

    public function adsense(): Response
    {
        $settings = SiteSetting::current();

        return Inertia::render('Admin/Settings/Adsense', [
            'settings' => [
                'adsense_enabled' => (bool) $settings->adsense_enabled,
                'adsense_display_ads' => (bool) $settings->adsense_display_ads,
                'adsense_auto_ads_enabled' => (bool) $settings->adsense_auto_ads_enabled,
                'adsense_publisher_id' => $settings->adsense_publisher_id ?? '',
                'adsense_verification_code' => $settings->adsense_verification_code ?? '',
                'adsense_header_slot' => $settings->adsense_header_slot ?? '',
                'adsense_in_article_slot' => $settings->adsense_in_article_slot ?? '',
                'adsense_sidebar_slot' => $settings->adsense_sidebar_slot ?? '',
            ],
        ]);
    }

    public function updateAdsense(Request $request): RedirectResponse
    {
        $settings = SiteSetting::current();

        $validated = $request->validate([
            'adsense_enabled' => ['nullable', 'boolean'],
            'adsense_display_ads' => ['nullable', 'boolean'],
            'adsense_auto_ads_enabled' => ['nullable', 'boolean'],
            'adsense_publisher_id' => ['nullable', 'string', 'max:255'],
            'adsense_verification_code' => ['nullable', 'string', 'max:255'],
            'adsense_header_slot' => ['nullable', 'string', 'max:255'],
            'adsense_in_article_slot' => ['nullable', 'string', 'max:255'],
            'adsense_sidebar_slot' => ['nullable', 'string', 'max:255'],
        ]);

        $settings->fill([
            'adsense_enabled' => (bool) ($validated['adsense_enabled'] ?? false),
            'adsense_display_ads' => (bool) ($validated['adsense_display_ads'] ?? false),
            'adsense_auto_ads_enabled' => (bool) ($validated['adsense_auto_ads_enabled'] ?? false),
            'adsense_publisher_id' => $this->nullableString($validated['adsense_publisher_id'] ?? null),
            'adsense_verification_code' => $this->nullableString($validated['adsense_verification_code'] ?? null),
            'adsense_header_slot' => $this->nullableString($validated['adsense_header_slot'] ?? null),
            'adsense_in_article_slot' => $this->nullableString($validated['adsense_in_article_slot'] ?? null),
            'adsense_sidebar_slot' => $this->nullableString($validated['adsense_sidebar_slot'] ?? null),
        ]);
        $settings->save();

        return back()->with('success', 'Google AdSense settings updated.');
    }

    public function mail(SiteMailSettingsService $mailSettingsService): Response
    {
        $settings = SiteSetting::current();

        return Inertia::render('Admin/Settings/Mail', [
            'settings' => [
                'mail_enabled' => (bool) $settings->mail_enabled,
                'mail_mailer' => $settings->mail_mailer ?? 'smtp',
                'mail_host' => $settings->mail_host ?? 'smtp.gmail.com',
                'mail_port' => $settings->mail_port ?? 587,
                'mail_encryption' => $settings->mail_encryption ?? 'tls',
                'mail_username' => $settings->mail_username ?? '',
                'mail_password' => $mailSettingsService->decryptPassword($settings->mail_password_encrypted) ?? '',
                'mail_from_address' => $settings->mail_from_address ?? '',
                'mail_from_name' => $settings->mail_from_name ?? ($settings->site_title ?? 'Solar Support Australia'),
                'contact_notification_email' => $settings->contact_notification_email ?? 'daferxdesigns@gmail.com',
            ],
        ]);
    }

    public function updateMail(Request $request, SiteMailSettingsService $mailSettingsService): RedirectResponse
    {
        $settings = SiteSetting::current();

        $validated = $request->validate([
            'mail_enabled' => ['nullable', 'boolean'],
            'mail_mailer' => ['nullable', 'in:smtp,log'],
            'mail_host' => ['nullable', 'string', 'max:255'],
            'mail_port' => ['nullable', 'integer', 'between:1,65535'],
            'mail_encryption' => ['nullable', 'in:tls,ssl'],
            'mail_username' => ['nullable', 'string', 'max:255'],
            'mail_password' => ['nullable', 'string', 'max:255'],
            'mail_from_address' => ['nullable', 'email', 'max:255'],
            'mail_from_name' => ['nullable', 'string', 'max:255'],
            'contact_notification_email' => ['nullable', 'email', 'max:255'],
        ]);

        $settings->fill([
            'mail_enabled' => (bool) ($validated['mail_enabled'] ?? false),
            'mail_mailer' => $this->nullableString($validated['mail_mailer'] ?? 'smtp') ?? 'smtp',
            'mail_host' => $this->nullableString($validated['mail_host'] ?? null),
            'mail_port' => $validated['mail_port'] ?? null,
            'mail_encryption' => $this->nullableString($validated['mail_encryption'] ?? null),
            'mail_username' => $this->nullableString($validated['mail_username'] ?? null),
            'mail_from_address' => $this->nullableString($validated['mail_from_address'] ?? null),
            'mail_from_name' => $this->nullableString($validated['mail_from_name'] ?? null),
            'contact_notification_email' => $this->nullableString($validated['contact_notification_email'] ?? null),
        ]);

        if (array_key_exists('mail_password', $validated) && trim((string) $validated['mail_password']) !== '') {
            $settings->mail_password_encrypted = $mailSettingsService->encryptPassword($validated['mail_password']);
        }

        $settings->save();

        return back()->with('success', 'Mail SMTP settings updated.');
    }

    public function testMail(Request $request, SiteMailSettingsService $mailSettingsService): RedirectResponse
    {
        $settings = SiteSetting::current();

        if (!$settings->mail_enabled) {
            return back()->with('error', 'Mail is not enabled.');
        }

        $mailSettingsService->applyRuntimeConfig();
        $recipient = filter_var((string) $settings->mail_from_address, FILTER_VALIDATE_EMAIL)
            ? $settings->mail_from_address
            : filter_var((string) $settings->mail_username, FILTER_VALIDATE_EMAIL);

        if (! $recipient) {
            return back()->with('error', 'Set a valid From address or SMTP username email before sending a test email.');
        }

        try {
            Mail::raw('This is a test email from your Solar Guide site.', function ($message) use ($recipient) {
                $message->to($recipient)
                        ->subject('Test Email from Solar Guide');
            });

            return back()->with('success', 'Test email sent successfully.');
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();

            // Provide better error messages for common issues
            if (str_contains($settings->mail_host, 'gmail.com') && str_contains($errorMessage, 'BadCredentials')) {
                $errorMessage = 'Authentication failed. For Gmail, you must use an App Password instead of your regular password. Visit https://myaccount.google.com/apppasswords to generate one.';
            } elseif (str_contains($errorMessage, 'Connection could not be established')) {
                $errorMessage = 'Could not connect to the SMTP server. Please check the host and port settings.';
            } elseif (str_contains($errorMessage, 'Expected response code')) {
                $errorMessage = 'SMTP server rejected the connection. Please verify your username, password, and SMTP settings.';
            }

            return back()->with('error', 'Failed to send test email: ' . $errorMessage);
        }
    }

    public function menus(): Response
    {
        $settings = SiteSetting::current();

        return Inertia::render('Admin/Settings/Menus', [
            'settings' => [
                'dynamic_menus_enabled' => (bool) $settings->dynamic_menus_enabled,
            ],
            'menuStats' => [
                'total' => Menu::count(),
                'active' => Menu::where('is_active', true)->count(),
                'top_level' => Menu::whereNull('parent_id')->count(),
            ],
        ]);
    }

    public function updateMenus(Request $request): RedirectResponse
    {
        $settings = SiteSetting::current();

        $validated = $request->validate([
            'dynamic_menus_enabled' => ['nullable', 'boolean'],
        ]);

        $settings->fill([
            'dynamic_menus_enabled' => (bool) ($validated['dynamic_menus_enabled'] ?? false),
        ]);
        $settings->save();

        return back()->with('success', 'Menu settings updated.');
    }

    public function footer(): Response
    {
        $settings = SiteSetting::current();

        return Inertia::render('Admin/Settings/Footer', [
            'settings' => [
                'footer_layout' => $settings->footer_layout ?: SiteSetting::defaultFooterLayout(),
                'footer_background_mode' => $settings->footer_background_mode ?? 'color',
                'footer_background_color' => $settings->footer_background_color ?? '#ffffff',
                'footer_background_image_url' => $settings->footer_background_image_url,
                'footer_background_image_position' => $settings->footer_background_image_position ?? 'center center',
                'footer_background_image_size' => $settings->footer_background_image_size ?? 'cover',
                'footer_background_image_repeat' => $settings->footer_background_image_repeat ?? 'no-repeat',
            ],
        ]);
    }

    public function updateFooter(Request $request): RedirectResponse
    {
        $settings = SiteSetting::current();

        $validated = $request->validate([
            'footer_layout' => ['nullable', 'array'],
            'footer_background_mode' => ['nullable', 'in:color,image'],
            'footer_background_color' => ['nullable', 'string', 'max:20'],
            'footer_background_image' => ['nullable', 'image', 'max:6144'],
            'remove_footer_background_image' => ['nullable', 'boolean'],
            'footer_background_image_position' => ['nullable', 'string', 'max:50'],
            'footer_background_image_size' => ['nullable', 'in:cover,contain,auto,100% 100%'],
            'footer_background_image_repeat' => ['nullable', 'in:no-repeat,repeat,repeat-x,repeat-y'],
        ]);

        if (($validated['remove_footer_background_image'] ?? false) && $settings->footer_background_image_path) {
            Storage::disk('public')->delete($settings->footer_background_image_path);
            $settings->footer_background_image_path = null;
        }

        if ($request->hasFile('footer_background_image')) {
            if ($settings->footer_background_image_path) {
                Storage::disk('public')->delete($settings->footer_background_image_path);
            }

            $settings->footer_background_image_path = $request->file('footer_background_image')->store('guides/site-settings', 'public');
        }

        $settings->fill([
            'footer_layout' => array_values($validated['footer_layout'] ?? SiteSetting::defaultFooterLayout()),
            'footer_background_mode' => $validated['footer_background_mode'] ?? 'color',
            'footer_background_color' => $this->nullableString($validated['footer_background_color'] ?? '#ffffff') ?? '#ffffff',
            'footer_background_image_position' => $validated['footer_background_image_position'] ?? 'center center',
            'footer_background_image_size' => $validated['footer_background_image_size'] ?? 'cover',
            'footer_background_image_repeat' => $validated['footer_background_image_repeat'] ?? 'no-repeat',
        ]);
        $settings->save();

        return back()->with('success', 'Footer builder updated.');
    }

    public function captcha(): Response
    {
        $settings = SiteSetting::current();

        return Inertia::render('Admin/Settings/Captcha', [
            'settings' => [
                'captcha_enabled' => (bool) $settings->captcha_enabled,
                'captcha_provider' => $settings->captcha_provider ?? 'recaptcha_v2',
                'captcha_site_key' => $settings->captcha_site_key ?? '',
                'captcha_secret_key' => $settings->captcha_secret_key ?? '',
                'captcha_forms' => $settings->captcha_forms ?? [
                    'contact' => false,
                    'calculator' => false,
                    'chat' => false,
                    'comment' => false,
                    'subscribe' => false,
                ],
            ],
        ]);
    }

    public function updateCaptcha(Request $request): RedirectResponse
    {
        $settings = SiteSetting::current();

        $validated = $request->validate([
            'captcha_enabled' => ['nullable', 'boolean'],
            'captcha_provider' => ['nullable', 'in:recaptcha_v2,recaptcha_v3'],
            'captcha_site_key' => ['nullable', 'string', 'max:255'],
            'captcha_secret_key' => ['nullable', 'string', 'max:2000'],
            'captcha_forms' => ['nullable', 'array'],
        ]);

        $settings->fill([
            'captcha_enabled' => (bool) ($validated['captcha_enabled'] ?? false),
            'captcha_provider' => $validated['captcha_provider'] ?? 'recaptcha_v2',
            'captcha_site_key' => $this->nullableString($validated['captcha_site_key'] ?? null),
            'captcha_secret_key' => $this->nullableString($validated['captcha_secret_key'] ?? null),
            'captcha_forms' => $validated['captcha_forms'] ?? [
                'contact' => false,
                'calculator' => false,
                'chat' => false,
                'comment' => false,
                'subscribe' => false,
            ],
        ]);
        $settings->save();

        return back()->with('success', 'Captcha settings updated.');
    }

    public function deletedContent(): Response
    {
        return Inertia::render('Admin/Settings/DeletedContent', [
            'deletedPosts' => GuidePost::onlyTrashed()
                ->latest('deleted_at')
                ->take(50)
                ->get(['id', 'title', 'slug', 'deleted_at'])
                ->map(fn (GuidePost $post) => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'deleted_at' => $post->deleted_at?->toIso8601String(),
                ])
                ->all(),
            'deletedComments' => GuidePostComment::onlyTrashed()
                ->latest('deleted_at')
                ->take(50)
                ->get(['id', 'author_name', 'author_email', 'content', 'deleted_at'])
                ->map(fn (GuidePostComment $comment) => [
                    'id' => $comment->id,
                    'author_name' => $comment->author_name,
                    'author_email' => $comment->author_email,
                    'content' => $comment->content,
                    'deleted_at' => $comment->deleted_at?->toIso8601String(),
                ])
                ->all(),
            'deletedChats' => ChatConversation::onlyTrashed()
                ->latest('deleted_at')
                ->take(50)
                ->get(['id', 'visitor_name', 'visitor_email', 'status', 'deleted_at'])
                ->map(fn (ChatConversation $conversation) => [
                    'id' => $conversation->id,
                    'visitor_name' => $conversation->visitor_name,
                    'visitor_email' => $conversation->visitor_email,
                    'status' => $conversation->status,
                    'deleted_at' => $conversation->deleted_at?->toIso8601String(),
                ])
                ->all(),
        ]);
    }

    private function nullableString(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value !== '' ? $value : null;
    }

    private function googleVerificationCode(?string $value): ?string
    {
        $value = $this->nullableString($value);

        if (! $value) {
            return null;
        }

        if (preg_match('/content=["\']([^"\']+)["\']/i', $value, $matches)) {
            return trim($matches[1]);
        }

        return $value;
    }

    private function defaultRobotsContent(): string
    {
        return implode("\n", [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin/',
            'Disallow: /dashboard',
            'Disallow: /login',
            'Disallow: /register',
            '',
            'Sitemap: {sitemap_url}',
        ]);
    }

    private function normalizedExtraSitemapUrls(?string $value): ?string
    {
        $lines = preg_split('/\R/', (string) $value) ?: [];
        $urls = collect($lines)
            ->map(fn (string $line) => trim($line))
            ->filter()
            ->unique()
            ->values();

        return $urls->isNotEmpty() ? $urls->implode("\n") : null;
    }
}
