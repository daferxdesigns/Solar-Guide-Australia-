<?php

namespace App\Providers;

use App\Services\SiteMailSettingsService;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        app(SiteMailSettingsService::class)->applyRuntimeConfig();

        if (config('app.url')) {
            URL::forceRootUrl(config('app.url'));

            if (parse_url(config('app.url'), PHP_URL_SCHEME) === 'https') {
                URL::forceScheme('https');
            }
        }
    }
}
