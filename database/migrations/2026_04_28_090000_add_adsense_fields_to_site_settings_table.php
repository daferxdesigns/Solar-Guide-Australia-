<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->boolean('adsense_enabled')->default(false)->after('homepage_background_image_path');
            $table->boolean('adsense_auto_ads_enabled')->default(false)->after('adsense_enabled');
            $table->string('adsense_publisher_id')->nullable()->after('adsense_auto_ads_enabled');
            $table->string('adsense_verification_code')->nullable()->after('adsense_publisher_id');
            $table->string('adsense_header_slot')->nullable()->after('adsense_verification_code');
            $table->string('adsense_in_article_slot')->nullable()->after('adsense_header_slot');
            $table->string('adsense_sidebar_slot')->nullable()->after('adsense_in_article_slot');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn([
                'adsense_enabled',
                'adsense_auto_ads_enabled',
                'adsense_publisher_id',
                'adsense_verification_code',
                'adsense_header_slot',
                'adsense_in_article_slot',
                'adsense_sidebar_slot',
            ]);
        });
    }
};
