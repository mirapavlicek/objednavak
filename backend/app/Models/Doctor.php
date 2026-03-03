<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Doctor extends Model
{
    protected $fillable = [
        'name',
        'color',
    ];

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function procedureBlocks(): BelongsToMany
    {
        return $this->belongsToMany(ProcedureBlock::class, 'procedure_block_doctors');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get specialization categories as a collection.
     */
    public function specializations()
    {
        return DB::table('doctor_specializations')
            ->where('doctor_id', $this->id);
    }

    /**
     * Get specialization categories as an array of strings.
     */
    public function getSpecializationListAttribute(): array
    {
        return DB::table('doctor_specializations')
            ->where('doctor_id', $this->id)
            ->pluck('category')
            ->toArray();
    }

    /**
     * Sync specializations from an array of category strings.
     */
    public function syncSpecializations(array $categories): void
    {
        DB::table('doctor_specializations')
            ->where('doctor_id', $this->id)
            ->delete();

        $rows = array_map(fn($cat) => [
            'doctor_id' => $this->id,
            'category' => $cat,
        ], $categories);

        DB::table('doctor_specializations')->insert($rows);
    }

    /**
     * Scope to doctors with a specific specialization.
     */
    public function scopeWithSpecialization($query, string $category)
    {
        return $query->whereExists(function ($q) use ($category) {
            $q->select(DB::raw(1))
                ->from('doctor_specializations')
                ->whereColumn('doctor_specializations.doctor_id', 'doctors.id')
                ->where('doctor_specializations.category', $category);
        });
    }
}
