@php
    $siteSettings = \App\Models\SiteSetting::current();
    $pageProps = $page['props'] ?? [];
    $seo = is_array($pageProps['seo'] ?? null) ? $pageProps['seo'] : [];
    $seoTitle = trim((string) ($seo['title'] ?? $siteSettings->default_seo_title ?? $siteSettings->site_title ?? config('app.name', 'Laravel')));
    $seoDescription = trim((string) ($seo['description'] ?? $siteSettings->default_seo_description ?? $siteSettings->site_tagline ?? ''));
    $seoKeywords = trim((string) ($seo['keywords'] ?? $siteSettings->default_seo_keywords ?? ''));
    $seoCanonical = trim((string) ($seo['canonical_url'] ?? url()->current()));
    $seoImage = trim((string) ($seo['image'] ?? $siteSettings->default_og_image_url ?? ''));
    $seoType = trim((string) ($seo['type'] ?? 'website'));
    $seoSiteName = trim((string) ($seo['site_name'] ?? $siteSettings->site_title ?? config('app.name', 'Laravel')));
    $seoRobots = trim((string) ($seo['robots'] ?? (($siteSettings->seo_indexing_enabled ?? true) ? 'index, follow, max-image-preview:large' : 'noindex, nofollow')));
    $seoSchemas = [];

    if (is_array($seo['schema'] ?? null)) {
        $seoSchemas = array_is_list($seo['schema']) ? $seo['schema'] : [$seo['schema']];
    }
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ $seoTitle }}</title>
        @if($seoDescription)
            <meta inertia="description" name="description" content="{{ $seoDescription }}">
        @endif
        @if($seoKeywords)
            <meta inertia="keywords" name="keywords" content="{{ $seoKeywords }}">
        @endif
        <meta inertia="robots" name="robots" content="{{ $seoRobots }}">
        <link inertia="canonical" rel="canonical" href="{{ $seoCanonical }}">
        <meta property="og:site_name" content="{{ $seoSiteName }}">
        <meta inertia="og:title" property="og:title" content="{{ $seoTitle }}">
        @if($seoDescription)
            <meta inertia="og:description" property="og:description" content="{{ $seoDescription }}">
        @endif
        <meta inertia="og:type" property="og:type" content="{{ $seoType }}">
        <meta inertia="og:url" property="og:url" content="{{ $seoCanonical }}">
        @if($seoImage)
            <meta inertia="og:image" property="og:image" content="{{ $seoImage }}">
            <meta name="twitter:card" content="summary_large_image">
        @else
            <meta name="twitter:card" content="summary">
        @endif
        <meta name="twitter:title" content="{{ $seoTitle }}">
        @if($seoDescription)
            <meta name="twitter:description" content="{{ $seoDescription }}">
        @endif
        @if(($seo['published_time'] ?? null) && $seoType === 'article')
            <meta property="article:published_time" content="{{ $seo['published_time'] }}">
        @endif
        @if(($seo['modified_time'] ?? null) && $seoType === 'article')
            <meta property="article:modified_time" content="{{ $seo['modified_time'] }}">
        @endif
        @if($siteSettings->google_site_verification_code)
            <meta name="google-site-verification" content="{{ $siteSettings->google_site_verification_code }}">
        @endif
        @if($siteSettings->adsense_verification_code)
            <meta name="google-adsense-account" content="{{ $siteSettings->adsense_verification_code }}">
        @endif
        @foreach($seoSchemas as $schema)
            @if(is_array($schema) && count($schema) > 0)
                <script type="application/ld+json">{!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}</script>
            @endif
        @endforeach

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1888856810233457" crossorigin="anonymous"></script>

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
