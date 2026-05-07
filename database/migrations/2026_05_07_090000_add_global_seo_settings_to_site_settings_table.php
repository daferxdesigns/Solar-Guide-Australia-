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
            if (! Schema::hasColumn('site_settings', 'default_seo_title')) {
                $table->string('default_seo_title')->nullable()->after('default_seo_keywords');
            }

            if (! Schema::hasColumn('site_settings', 'default_seo_description')) {
                $table->text('default_seo_description')->nullable()->after('default_seo_title');
            }

            if (! Schema::hasColumn('site_settings', 'google_site_verification_code')) {
                $table->string('google_site_verification_code')->nullable()->after('default_seo_description');
            }

            if (! Schema::hasColumn('site_settings', 'default_og_image_path')) {
                $table->string('default_og_image_path')->nullable()->after('google_site_verification_code');
            }

            if (! Schema::hasColumn('site_settings', 'seo_indexing_enabled')) {
                $table->boolean('seo_indexing_enabled')->default(true)->after('default_og_image_path');
            }
        });

        DB::table('site_settings')
            ->whereNull('default_seo_title')
            ->update([
                'default_seo_title' => 'Solar Support Australia | Solar Guides, Inverter Wi-Fi Help and Rebates',
            ]);

        DB::table('site_settings')
            ->whereNull('default_seo_description')
            ->update([
                'default_seo_description' => 'Australia-focused solar guides, inverter Wi-Fi setup articles, troubleshooting help, battery rebate updates and solar policy news.',
            ]);

        DB::table('site_settings')
            ->whereNull('seo_indexing_enabled')
            ->update([
                'seo_indexing_enabled' => true,
            ]);
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $columns = [
                'default_seo_title',
                'default_seo_description',
                'google_site_verification_code',
                'default_og_image_path',
                'seo_indexing_enabled',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('site_settings', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
