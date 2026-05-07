<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            if (! Schema::hasColumn('site_settings', 'robots_txt_content')) {
                $table->text('robots_txt_content')->nullable()->after('seo_indexing_enabled');
            }

            if (! Schema::hasColumn('site_settings', 'sitemap_enabled')) {
                $table->boolean('sitemap_enabled')->default(true)->after('robots_txt_content');
            }

            if (! Schema::hasColumn('site_settings', 'sitemap_include_posts')) {
                $table->boolean('sitemap_include_posts')->default(true)->after('sitemap_enabled');
            }

            if (! Schema::hasColumn('site_settings', 'sitemap_include_pages')) {
                $table->boolean('sitemap_include_pages')->default(true)->after('sitemap_include_posts');
            }

            if (! Schema::hasColumn('site_settings', 'sitemap_include_categories')) {
                $table->boolean('sitemap_include_categories')->default(true)->after('sitemap_include_pages');
            }

            if (! Schema::hasColumn('site_settings', 'sitemap_extra_urls')) {
                $table->text('sitemap_extra_urls')->nullable()->after('sitemap_include_categories');
            }
        });

        DB::table('site_settings')->update([
            'sitemap_enabled' => true,
            'sitemap_include_posts' => true,
            'sitemap_include_pages' => true,
            'sitemap_include_categories' => true,
        ]);
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $columns = [
                'robots_txt_content',
                'sitemap_enabled',
                'sitemap_include_posts',
                'sitemap_include_pages',
                'sitemap_include_categories',
                'sitemap_extra_urls',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('site_settings', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
