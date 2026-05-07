<?php

namespace App\Http\Controllers;

use App\Models\AnalyticsEvent;
use App\Models\AiWriterAccount;
use App\Models\GuideCategory;
use App\Models\GuidePost;
use App\Models\GuidePostComment;
use App\Models\GuidePostVisit;
use App\Models\SiteSetting;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $since = now()->subDays(30);
        $settings = SiteSetting::current();
        $integrationStatuses = $this->integrationStatuses($settings);

        $dailyTraffic = collect(range(0, 13))
            ->map(function (int $offset) use ($since) {
                $day = $since->copy()->addDays($offset);

                return [
                    'date' => $day->format('Y-m-d'),
                    'label' => $day->format('d M'),
                    'views' => GuidePostVisit::query()->whereDate('visited_at', $day)->count(),
                    'clicks' => AnalyticsEvent::query()->where('event_name', 'click')->whereDate('occurred_at', $day)->count(),
                ];
            })
            ->all();

        return Inertia::render('dashboard', [
            'stats' => [
                'posts' => GuidePost::count(),
                'published_posts' => GuidePost::where('status', 'published')->count(),
                'categories' => GuideCategory::count(),
                'comments_pending' => GuidePostComment::where('status', 'pending')->count(),
                'users' => User::count(),
                'visits_30d' => GuidePostVisit::query()->where('visited_at', '>=', $since)->count(),
                'unique_visitors_30d' => GuidePostVisit::query()->where('visited_at', '>=', $since)->distinct('visitor_hash')->count('visitor_hash'),
                'clicks_30d' => AnalyticsEvent::query()->where('event_name', 'click')->where('occurred_at', '>=', $since)->count(),
            ],
            'integrationHealth' => [
                'score' => $this->readinessScore($integrationStatuses),
                'ready' => collect($integrationStatuses)->where('state', 'active')->count(),
                'total' => count($integrationStatuses),
                'items' => $integrationStatuses,
            ],
            'dailyTraffic' => $dailyTraffic,
            'topPosts' => GuidePost::query()
                ->with('category:id,name')
                ->withCount('visits')
                ->orderByDesc('visits_count')
                ->limit(5)
                ->get()
                ->map(fn (GuidePost $post) => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'visits' => $post->visits_count,
                    'category' => $post->category?->name,
                ])
                ->all(),
            'recentComments' => GuidePostComment::query()
                ->with('post:id,title')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (GuidePostComment $comment) => [
                    'id' => $comment->id,
                    'author_name' => $comment->author_name,
                    'status' => $comment->status,
                    'post_title' => $comment->post?->title,
                    'created_at' => Carbon::parse($comment->created_at)->toIso8601String(),
                ])
                ->all(),
        ]);
    }

    private function integrationStatuses(SiteSetting $settings): array
    {
        return [
            $this->adsenseStatus($settings),
            $this->mailStatus($settings),
            $this->captchaStatus($settings),
            $this->aiWriterStatus(),
        ];
    }

    private function readinessScore(array $statuses): int
    {
        if (count($statuses) === 0) {
            return 0;
        }

        $points = collect($statuses)->sum(fn (array $status) => match ($status['state']) {
            'active' => 1,
            'attention' => 0.5,
            default => 0,
        });

        return (int) round(($points / count($statuses)) * 100);
    }

    private function adsenseStatus(SiteSetting $settings): array
    {
        $headerScriptClient = 'ca-pub-1888856810233457';
        $publisherId = trim((string) $settings->adsense_publisher_id);
        $clientId = $publisherId !== '' ? $publisherId : $headerScriptClient;
        $enabled = (bool) $settings->adsense_enabled;
        $hasClient = preg_match('/^ca-pub-\d+$/', $clientId) === 1;
        $ready = $enabled && $hasClient;

        return [
            'id' => 'adsense',
            'title' => 'Google AdSense',
            'status' => $ready ? 'Active' : ($enabled ? 'Needs client ID' : 'Off'),
            'state' => $ready ? 'active' : ($enabled ? 'attention' : 'inactive'),
            'description' => $ready
                ? 'AdSense header script is installed and ready for Google to detect.'
                : 'Turn on AdSense and add the publisher client ID before ads can run reliably.',
            'href' => route('admin.settings.adsense', absolute: false),
            'facts' => [
                'Client: '.$clientId,
                (bool) $settings->adsense_auto_ads_enabled ? 'Auto ads on' : 'Auto ads off',
                (bool) $settings->adsense_display_ads ? 'Manual slots visible' : 'Manual slots hidden',
            ],
            'checks' => [
                ['label' => 'AdSense enabled', 'ok' => $enabled],
                ['label' => 'Header script installed', 'ok' => true],
                ['label' => 'Publisher client detected', 'ok' => $hasClient],
            ],
        ];
    }

    private function mailStatus(SiteSetting $settings): array
    {
        $enabled = (bool) $settings->mail_enabled;
        $mailer = $settings->mail_mailer ?: 'smtp';
        $usesSmtp = $mailer === 'smtp';
        $hasServer = filled($settings->mail_host) && filled($settings->mail_port);
        $hasCredentials = ! $usesSmtp || (filled($settings->mail_username) && filled($settings->mail_password_encrypted));
        $hasFromAddress = filter_var((string) $settings->mail_from_address, FILTER_VALIDATE_EMAIL) !== false;
        $ready = $enabled && (($usesSmtp && $hasServer && $hasCredentials && $hasFromAddress) || $mailer === 'log');

        return [
            'id' => 'mail',
            'title' => 'Mail SMTP',
            'status' => $ready ? 'Connected' : ($enabled ? 'Needs setup' : 'Off'),
            'state' => $ready ? 'active' : ($enabled ? 'attention' : 'inactive'),
            'description' => $ready
                ? 'Outgoing mail is configured for forms, notifications, and admin test emails.'
                : 'Complete the SMTP server, saved password, and From address to make email dependable.',
            'href' => route('admin.settings.mail', absolute: false),
            'facts' => [
                $usesSmtp ? 'SMTP: '.($settings->mail_host ?: 'missing host').':'.($settings->mail_port ?: 'missing port') : 'Mailer: '.$mailer,
                $hasFromAddress ? 'From: '.$settings->mail_from_address : 'From address missing',
                $hasCredentials ? 'Credentials saved' : 'Credentials missing',
            ],
            'checks' => [
                ['label' => 'Mail enabled', 'ok' => $enabled],
                ['label' => 'Server configured', 'ok' => $usesSmtp ? $hasServer : true],
                ['label' => 'Sender address valid', 'ok' => $hasFromAddress],
                ['label' => 'Password saved', 'ok' => $hasCredentials],
            ],
        ];
    }

    private function captchaStatus(SiteSetting $settings): array
    {
        $enabled = (bool) $settings->captcha_enabled;
        $forms = collect((array) $settings->captcha_forms)
            ->filter(fn ($value) => (bool) $value)
            ->keys()
            ->values();
        $hasKeys = filled($settings->captcha_site_key) && filled($settings->captcha_secret_key);
        $protectsForms = $forms->isNotEmpty();
        $ready = $enabled && $hasKeys && $protectsForms;

        return [
            'id' => 'captcha',
            'title' => 'Captcha',
            'status' => $ready ? 'Protecting forms' : ($enabled ? 'Needs keys' : 'Off'),
            'state' => $ready ? 'active' : ($enabled ? 'attention' : 'inactive'),
            'description' => $ready
                ? 'Captcha is enabled on selected public forms to reduce spam submissions.'
                : 'Enable Captcha, add both keys, and select the public forms you want protected.',
            'href' => route('admin.settings.captcha', absolute: false),
            'facts' => [
                'Provider: '.($settings->captcha_provider ?: 'not selected'),
                $hasKeys ? 'Site and secret keys saved' : 'Keys missing',
                $protectsForms ? $forms->count().' forms protected' : 'No forms protected',
            ],
            'checks' => [
                ['label' => 'Captcha enabled', 'ok' => $enabled],
                ['label' => 'Keys saved', 'ok' => $hasKeys],
                ['label' => 'Forms selected', 'ok' => $protectsForms],
            ],
        ];
    }

    private function aiWriterStatus(): array
    {
        $activeAccounts = AiWriterAccount::query()->where('is_active', true)->count();
        $totalAccounts = AiWriterAccount::query()->count();
        $ready = $activeAccounts > 0;

        return [
            'id' => 'ai-writer',
            'title' => 'AI Writer',
            'status' => $ready ? 'Ready' : 'No accounts',
            'state' => $ready ? 'active' : 'inactive',
            'description' => $ready
                ? 'The post editor can generate article drafts using saved OpenAI accounts.'
                : 'Add an OpenAI API account before using ChatGPT drafting in Add Post.',
            'href' => route('admin.settings.ai-writer', absolute: false),
            'facts' => [
                $activeAccounts.' active accounts',
                $totalAccounts.' total saved',
                'Available in Create and Edit Post',
            ],
            'checks' => [
                ['label' => 'Account saved', 'ok' => $totalAccounts > 0],
                ['label' => 'Account active', 'ok' => $activeAccounts > 0],
                ['label' => 'Post editor connected', 'ok' => true],
            ],
        ];
    }
}
