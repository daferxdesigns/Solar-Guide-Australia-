<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guide_posts', function (Blueprint $table) {
            $table->string('schema_type', 60)->nullable()->default('Article')->after('canonical_url');
            $table->json('schema_custom_json')->nullable()->after('schema_type');
        });
    }

    public function down(): void
    {
        Schema::table('guide_posts', function (Blueprint $table) {
            $table->dropColumn(['schema_type', 'schema_custom_json']);
        });
    }
};
