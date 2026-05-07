<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->enum('type', ['page', 'category', 'manual']); // Type of menu item
            $table->string('url')->nullable(); // For manual links
            $table->unsignedBigInteger('page_id')->nullable(); // For pages
            $table->unsignedBigInteger('category_id')->nullable(); // For categories
            $table->unsignedBigInteger('parent_id')->nullable(); // For hierarchical menus
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Foreign keys
            $table->foreign('parent_id')->references('id')->on('menus')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('guide_categories')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
