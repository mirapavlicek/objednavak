<?php

namespace Database\Seeders;

use App\Models\Procedure;
use Illuminate\Database\Seeder;

class ProcedureSeeder extends Seeder
{
    public function run(): void
    {
        $procedures = [
            ['id' => 'vaccination',   'name' => 'Vakcinace',              'duration' => 15,  'color' => '#059669', 'category' => 'prevence',    'sort_order' => 1],
            ['id' => 'checkup',       'name' => 'Preventivní prohlídka',  'duration' => 20,  'color' => '#2563eb', 'category' => 'prevence',    'sort_order' => 2],
            ['id' => 'surgery_small', 'name' => 'Malý zákrok',            'duration' => 45,  'color' => '#dc2626', 'category' => 'chirurgie',   'sort_order' => 3],
            ['id' => 'surgery_large', 'name' => 'Velká operace',          'duration' => 120, 'color' => '#dc2626', 'category' => 'chirurgie',   'sort_order' => 4],
            ['id' => 'dental',        'name' => 'Dentální ošetření',      'duration' => 60,  'color' => '#d97706', 'category' => 'specialni',   'sort_order' => 5],
            ['id' => 'xray',          'name' => 'RTG',                    'duration' => 30,  'color' => '#7c3aed', 'category' => 'diagnostika', 'sort_order' => 6],
            ['id' => 'ultrasound',    'name' => 'Ultrazvuk',              'duration' => 30,  'color' => '#7c3aed', 'category' => 'diagnostika', 'sort_order' => 7],
            ['id' => 'blood_work',    'name' => 'Odběr krve',             'duration' => 15,  'color' => '#0891b2', 'category' => 'diagnostika', 'sort_order' => 8],
            ['id' => 'castration',    'name' => 'Kastrace / Sterilizace', 'duration' => 60,  'color' => '#dc2626', 'category' => 'chirurgie',   'sort_order' => 9],
            ['id' => 'dermatology',   'name' => 'Dermatologie',           'duration' => 30,  'color' => '#d97706', 'category' => 'specialni',   'sort_order' => 10],
            ['id' => 'emergency',     'name' => 'Akutní příjem',          'duration' => 20,  'color' => '#dc2626', 'category' => 'akutni',      'sort_order' => 11],
            ['id' => 'followup',      'name' => 'Kontrola',              'duration' => 15,  'color' => '#059669', 'category' => 'prevence',    'sort_order' => 12],
            ['id' => 'euthanasia',    'name' => 'Eutanazie',             'duration' => 45,  'color' => '#64748b', 'category' => 'specialni',   'sort_order' => 13],
            ['id' => 'other',         'name' => 'Jiné',                  'duration' => 20,  'color' => '#64748b', 'category' => 'ostatni',     'sort_order' => 14],
        ];

        foreach ($procedures as $proc) {
            Procedure::updateOrCreate(['id' => $proc['id']], $proc);
        }
    }
}
