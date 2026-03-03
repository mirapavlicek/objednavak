<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class Client extends Model
{
    use HasApiTokens;

    protected $fillable = [
        'first_name',
        'last_name',
        'phone',
        'email',
        'password',
        'password_changed_at',
        'reset_code',
        'reset_code_expires',
        'two_factor_code',
        'two_factor_expires',
    ];

    protected $hidden = [
        'password',
        'reset_code',
        'two_factor_code',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'password_changed_at' => 'datetime',
            'reset_code_expires' => 'datetime',
            'two_factor_expires' => 'datetime',
        ];
    }

    public function pets(): HasMany
    {
        return $this->hasMany(Pet::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
