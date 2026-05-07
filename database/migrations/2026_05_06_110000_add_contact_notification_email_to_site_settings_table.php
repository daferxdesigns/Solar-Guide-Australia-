<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            if (!Schema::hasColumn('site_settings', 'contact_notification_email')) {
                $table->string('contact_notification_email')
                    ->nullable()
                    ->after('mail_from_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('site_settings', function (Blueprint $table) {
            if (Schema::hasColumn('site_settings', 'contact_notification_email')) {
                $table->dropColumn('contact_notification_email');
            }
        });
    }
};
