<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mission extends Model
{
    use HasFactory;
    protected $fillable = ['client_id', 'consultant_id', 'service_id', 'start_date', 'end_date', 'status'];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function consultant()
    {
        return $this->belongsTo(Consultant::class);
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }
    public function consultants()
    {
        return $this->belongsToMany(Consultant::class, 'time_trackings')
                    ->withPivot(['hours', 'date', 'notes']);
    }

    public function timeTrackings()
    {
        return $this->hasMany(TimeTracking::class);
    }
}
