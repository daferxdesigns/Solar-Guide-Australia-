<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_writer_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('provider')->default('openai');
            $table->string('model')->default('gpt-5.2');
            $table->text('api_key_encrypted');
            $table->text('default_instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_writer_accounts');
    }
};
