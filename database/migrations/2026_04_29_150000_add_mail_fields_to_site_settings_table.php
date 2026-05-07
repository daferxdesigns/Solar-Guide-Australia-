<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->boolean('mail_enabled')->default(false)->after('dynamic_menus_enabled');
            $table->string('mail_mailer')->nullable()->after('mail_enabled');
            $table->string('mail_host')->nullable()->after('mail_mailer');
            $table->unsignedInteger('mail_port')->nullable()->after('mail_host');
            $table->string('mail_encryption')->nullable()->after('mail_port');
            $table->string('mail_username')->nullable()->after('mail_encryption');
            $table->text('mail_password_encrypted')->nullable()->after('mail_username');
            $table->string('mail_from_address')->nullable()->after('mail_password_encrypted');
            $table->string('mail_from_name')->nullable()->after('mail_from_address');
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            $table->dropColumn([
                'mail_enabled',
                'mail_mailer',
                'mail_host',
                'mail_port',
                'mail_encryption',
                'mail_username',
                'mail_password_encrypted',
                'mail_from_address',
                'mail_from_name',
            ]);
        });
    }
};
