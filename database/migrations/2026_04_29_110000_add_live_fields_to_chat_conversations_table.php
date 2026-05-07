<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chat_conversations', function (Blueprint $table) {
            $table->string('visitor_phone', 50)->nullable()->after('visitor_email');
            $table->timestamp('visitor_last_seen_at')->nullable()->after('last_message_at');
            $table->timestamp('admin_last_seen_at')->nullable()->after('visitor_last_seen_at');
            $table->timestamp('visitor_typing_at')->nullable()->after('admin_last_seen_at');
            $table->timestamp('admin_typing_at')->nullable()->after('visitor_typing_at');
        });
    }

    public function down(): void
    {
        Schema::table('chat_conversations', function (Blueprint $table) {
            $table->dropColumn([
                'visitor_phone',
                'visitor_last_seen_at',
                'admin_last_seen_at',
                'visitor_typing_at',
                'admin_typing_at',
            ]);
        });
    }
};
