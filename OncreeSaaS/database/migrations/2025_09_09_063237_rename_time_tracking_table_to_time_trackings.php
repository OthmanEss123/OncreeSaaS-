<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('time_tracking') && !Schema::hasTable('time_trackings')) {
            Schema::rename('time_tracking', 'time_trackings');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('time_trackings') && !Schema::hasTable('time_tracking')) {
            Schema::rename('time_trackings', 'time_tracking');
        }
    }
};
