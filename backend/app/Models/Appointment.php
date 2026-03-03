<?php

namespace App\Models;

use App\Enums\AppointmentStatus;
use App\Enums\CreatedBy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Appointment extends Model
{
    protected $fillable = [
        'client_id',
        'pet_id',
        'manual_name',
        'manual_phone',
        'manual_pet',
        'procedure_id',
        'doctor_id',
        'date',
        'time',
        'duration',
        'status',
        'note',
        'created_by',
        'arrival_time',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'duration' => 'integer',
            'status' => AppointmentStatus::class,
            'created_by' => CreatedBy::class,
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function pet(): BelongsTo
    {
        return $this->belongsTo(Pet::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function procedure(): BelongsTo
    {
        return $this->belongsTo(Procedure::class);
    }

    public function smsLogs(): HasMany
    {
        return $this->hasMany(SmsLog::class);
    }

    /**
     * Get time as HH:MM string.
     */
    public function getTimeHmAttribute(): string
    {
        return substr($this->time, 0, 5);
    }

    /**
     * Get arrival_time as HH:MM string.
     */
    public function getArrivalTimeHmAttribute(): ?string
    {
        return $this->arrival_time ? substr($this->arrival_time, 0, 5) : null;
    }
}
