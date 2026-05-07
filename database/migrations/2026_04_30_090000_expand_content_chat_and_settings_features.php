<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guide_posts', function (Blueprint $table) {
            $table->string('header_background_mode', 20)->nullable()->after('featured_image_alt');
            $table->string('header_background_color', 20)->nullable()->after('header_background_mode');
            $table->string('header_background_image_path')->nullable()->after('header_background_color');
            $table->string('header_background_image_position', 50)->nullable()->after('header_background_image_path');
            $table->string('header_background_image_size', 20)->nullable()->after('header_background_image_position');
            $table->string('header_background_image_repeat', 20)->nullable()->after('header_background_image_size');
            $table->unsignedTinyInteger('header_overlay_opacity')->default(72)->after('header_background_image_repeat');
            $table->softDeletes();
        });

        Schema::table('guide_post_comments', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('chat_conversations', function (Blueprint $table) {
            $table->softDeletes();
        });

        Schema::table('public_leads', function (Blueprint $table) {
            $table->string('form_name')->nullable()->after('source');
        });

        Schema::table('site_settings', function (Blueprint $table) {
            $table->json('footer_layout')->nullable()->after('mail_from_name');
            $table->string('footer_background_mode', 20)->nullable()->after('footer_layout');
            $table->string('footer_background_color', 20)->nullable()->after('footer_background_mode');
            $table->string('footer_background_image_path')->nullable()->after('footer_background_color');
            $table->string('footer_background_image_position', 50)->nullable()->after('footer_background_image_path');
            $table->string('footer_background_image_size', 20)->nullable()->after('footer_background_image_position');
            $table->string('footer_background_image_repeat', 20)->nullable()->after('footer_background_image_size');
            $table->boolean('captcha_enabled')->default(false)->after('footer_background_image_repeat');
            $table->string('captcha_provider', 20)->nullable()->after('captcha_enabled');
            $table->string('captcha_site_key')->nullable()->after('captcha_provider');
            $table->text('captcha_secret_key')->nullable()->after('captcha_site_key');
            $table->json('captcha_forms')->nullable()->after('captcha_secret_key');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn([
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
            ]);
        });

        Schema::table('public_leads', function (Blueprint $table) {
            $table->dropColumn('form_name');
        });

        Schema::table('chat_conversations', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('guide_post_comments', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('guide_posts', function (Blueprint $table) {
            $table->dropColumn([
                'header_background_mode',
                'header_background_color',
                'header_background_image_path',
                'header_background_image_position',
                'header_background_image_size',
                'header_background_image_repeat',
                'header_overlay_opacity',
            ]);
            $table->dropSoftDeletes();
        });
    }
};
