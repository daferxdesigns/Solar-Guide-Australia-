<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('backup_snapshots', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('file_path');
            $table->unsignedBigInteger('size_bytes')->default(0);
            $table->unsignedTinyInteger('progress_percentage')->default(0);
            $table->string('status', 30)->default('ready')->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('restored_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('backup_snapshots');
    }
};
