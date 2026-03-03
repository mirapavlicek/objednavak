<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\DB;

class ProcedureBlock extends Model
{
    protected $fillable = [
        'label',
        'time_from',
        'time_to',
    ];

    public function doctors(): BelongsToMany
    {
        return $this->belongsToMany(Doctor::class, 'procedure_block_doctors');
    }

    /**
     * Get category list as array of strings.
     */
    public function getCategoryListAttribute(): array
    {
        return DB::table('procedure_block_categories')
            ->where('procedure_block_id', $this->id)
            ->pluck('category')
            ->toArray();
    }

    /**
     * Sync categories from an array of category strings.
     */
    public function syncCategories(array $categories): void
    {
        DB::table('procedure_block_categories')
            ->where('procedure_block_id', $this->id)
            ->delete();

        $rows = array_map(fn($cat) => [
            'procedure_block_id' => $this->id,
            'category' => $cat,
        ], $categories);

        DB::table('procedure_block_categories')->insert($rows);
    }

    /**
     * Scope to blocks containing a specific category.
     */
    public function scopeWithCategory($query, string $category)
    {
        return $query->whereExists(function ($q) use ($category) {
            $q->select(DB::raw(1))
                ->from('procedure_block_categories')
                ->whereColumn('procedure_block_categories.procedure_block_id', 'procedure_blocks.id')
                ->where('procedure_block_categories.category', $category);
        });
    }
}
