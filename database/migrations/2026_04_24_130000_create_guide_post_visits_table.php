<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guide_post_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guide_post_id')->constrained()->cascadeOnDelete();
            $table->string('visitor_hash', 64);
            $table->string('device_type', 32)->nullable();
            $table->string('browser', 64)->nullable();
            $table->string('operating_system', 64)->nullable();
            $table->string('referrer_host')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('visited_at');
            $table->timestamps();

            $table->index(['guide_post_id', 'visited_at']);
            $table->index(['guide_post_id', 'visitor_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guide_post_visits');
    }
};
