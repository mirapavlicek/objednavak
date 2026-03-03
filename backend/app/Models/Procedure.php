<?php

namespace App\Models;

use App\Enums\ProcedureCategory;
use Illuminate\Database\Eloquent\Model;

class Procedure extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'name',
        'duration',
        'color',
        'category',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'duration' => 'integer',
            'sort_order' => 'integer',
            'category' => ProcedureCategory::class,
        ];
    }
}
