<?php

namespace Database\Seeders;

use App\Models\ClinicConfig;
use App\Models\Doctor;
use App\Models\OpeningHour;
use App\Models\ProcedureBlock;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DefaultConfigSeeder extends Seeder
{
    public function run(): void
    {
        // Clinic config key-value pairs
        $configs = [
            'clinic_name'          => 'Veterinární klinika VetBook',
            'slot_interval'        => '5',
            'acute_buffer_slots'   => '3',
            'acute_buffer_spacing' => '90',
            'sms_api_key'          => '',
            'sms_sender'           => '',
            'sms_on_confirm'       => '1',
            'sms_on_reminder'      => '1',
            'sms_on_cancel'        => '0',
            'sms_reminder_hours'   => '24',
        ];

        foreach ($configs as $key => $value) {
            ClinicConfig::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        // Opening hours (0=mon, 6=sun)
        $hours = [
            ['day_of_week' => 0, 'open_time' => '07:30', 'close_time' => '18:00', 'is_closed' => false], // Mon
            ['day_of_week' => 1, 'open_time' => '07:30', 'close_time' => '18:00', 'is_closed' => false], // Tue
            ['day_of_week' => 2, 'open_time' => '07:30', 'close_time' => '18:00', 'is_closed' => false], // Wed
            ['day_of_week' => 3, 'open_time' => '07:30', 'close_time' => '18:00', 'is_closed' => false], // Thu
            ['day_of_week' => 4, 'open_time' => '07:30', 'close_time' => '16:00', 'is_closed' => false], // Fri
            ['day_of_week' => 5, 'open_time' => '08:00', 'close_time' => '12:00', 'is_closed' => false], // Sat
            ['day_of_week' => 6, 'open_time' => null,    'close_time' => null,    'is_closed' => true],  // Sun
        ];

        foreach ($hours as $h) {
            OpeningHour::updateOrCreate(['day_of_week' => $h['day_of_week']], $h);
        }

        // Doctors
        $doctors = [
            ['name' => 'MVDr. Jan Novák',      'color' => '#2563eb', 'specs' => ['chirurgie', 'diagnostika', 'prevence', 'specialni', 'akutni', 'ostatni']],
            ['name' => 'MVDr. Petra Králová',   'color' => '#059669', 'specs' => ['prevence', 'diagnostika', 'specialni', 'ostatni']],
            ['name' => 'MVDr. Tomáš Veselý',    'color' => '#d97706', 'specs' => ['chirurgie', 'diagnostika', 'akutni']],
        ];

        foreach ($doctors as $d) {
            $doctor = Doctor::updateOrCreate(['name' => $d['name']], [
                'color' => $d['color'],
            ]);
            $doctor->syncSpecializations($d['specs']);
        }

        // Procedure blocks
        $blocks = [
            ['label' => 'Ranní prevence',       'time_from' => '07:30', 'time_to' => '10:00', 'categories' => ['prevence'],                                    'doctor_ids' => [1, 2]],
            ['label' => 'Chirurgie',             'time_from' => '10:00', 'time_to' => '13:00', 'categories' => ['chirurgie'],                                   'doctor_ids' => [1, 3]],
            ['label' => 'Odpolední ambulance',   'time_from' => '13:00', 'time_to' => '16:00', 'categories' => ['prevence', 'diagnostika', 'specialni', 'ostatni'], 'doctor_ids' => [1, 2]],
            ['label' => 'Diagnostika',           'time_from' => '08:00', 'time_to' => '12:00', 'categories' => ['diagnostika'],                                 'doctor_ids' => [2, 3]],
        ];

        foreach ($blocks as $b) {
            $block = ProcedureBlock::updateOrCreate(['label' => $b['label']], [
                'time_from' => $b['time_from'],
                'time_to' => $b['time_to'],
            ]);
            $block->syncCategories($b['categories']);
            $block->doctors()->sync($b['doctor_ids']);
        }
    }
}
