<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add index on name column for faster search
            $table->index('name');
            // Add index on id column (usually auto-indexed, but explicit for clarity)
            $table->index('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop indexes in reverse order
            $table->dropIndex(['id']);
            $table->dropIndex(['name']);
        });
    }
};
