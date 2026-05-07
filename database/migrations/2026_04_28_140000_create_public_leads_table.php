<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('public_leads', function (Blueprint $table) {
            $table->id();
            $table->string('source', 50);
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('address_line_1')->nullable();
            $table->string('suburb')->nullable();
            $table->string('state', 20)->nullable();
            $table->string('postcode', 12)->nullable();
            $table->text('message')->nullable();
            $table->json('payload')->nullable();
            $table->json('result_summary')->nullable();
            $table->timestamp('emailed_at')->nullable();
            $table->timestamps();

            $table->index(['source', 'created_at']);
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('public_leads');
    }
};
