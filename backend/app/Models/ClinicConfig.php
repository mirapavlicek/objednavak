<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClinicConfig extends Model
{
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'key',
        'value',
    ];

    /**
     * Get a config value by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $config = static::find($key);
        return $config ? $config->value : $default;
    }

    /**
     * Set a config value.
     */
    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => (string) $value]
        );
    }

    /**
     * Get all configs as an associative array.
     */
    public static function getAll(): array
    {
        return static::all()->pluck('value', 'key')->toArray();
    }
}
