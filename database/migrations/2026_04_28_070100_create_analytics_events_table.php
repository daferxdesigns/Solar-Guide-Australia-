<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_name', 64);
            $table->string('path')->nullable();
            $table->string('page_title')->nullable();
            $table->string('target')->nullable();
            $table->unsignedBigInteger('guide_post_id')->nullable();
            $table->unsignedBigInteger('guide_category_id')->nullable();
            $table->string('visitor_hash', 64)->nullable();
            $table->string('session_hash', 64)->nullable();
            $table->string('device_type', 32)->nullable();
            $table->string('browser', 64)->nullable();
            $table->string('operating_system', 64)->nullable();
            $table->string('referrer_host')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['event_name', 'occurred_at']);
            $table->index(['guide_post_id', 'occurred_at']);
            $table->index(['guide_category_id', 'occurred_at']);
            $table->index(['visitor_hash', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
    }
};
