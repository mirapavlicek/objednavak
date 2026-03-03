<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Client;
use App\Models\Employee;
use App\Models\Pet;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // Clients
        $c1 = Client::create(['first_name' => 'Jana',  'last_name' => 'Nováková',   'phone' => '602111222', 'email' => 'jana@email.cz']);
        $c2 = Client::create(['first_name' => 'Petr',  'last_name' => 'Dvořák',     'phone' => '603222333', 'email' => 'petr@email.cz']);
        $c3 = Client::create(['first_name' => 'Marie', 'last_name' => 'Svobodová',  'phone' => '604333444', 'email' => 'marie@email.cz']);
        $c4 = Client::create(['first_name' => 'Tomáš', 'last_name' => 'Černý',      'phone' => '605444555', 'email' => 'tomas@email.cz']);

        // Pets
        $p1 = Pet::create(['client_id' => $c1->id, 'name' => 'Rex',    'species' => 'Pes',    'breed' => 'Německý ovčák']);
        $p2 = Pet::create(['client_id' => $c1->id, 'name' => 'Mícka',  'species' => 'Kočka',  'breed' => 'Britská']);
        $p3 = Pet::create(['client_id' => $c2->id, 'name' => 'Bety',   'species' => 'Pes',    'breed' => 'Labrador']);
        $p4 = Pet::create(['client_id' => $c3->id, 'name' => 'Mourek', 'species' => 'Kočka',  'breed' => 'Domácí']);
        $p5 = Pet::create(['client_id' => $c4->id, 'name' => 'Ťapka',  'species' => 'Pes',    'breed' => 'Jezevčík']);

        // Demo appointments (today + tomorrow)
        $today = now()->format('Y-m-d');
        $tomorrow = now()->addDay()->format('Y-m-d');

        Appointment::create([
            'client_id' => $c1->id, 'pet_id' => $p1->id,
            'procedure_id' => 'vaccination', 'doctor_id' => 1,
            'date' => $today, 'time' => '09:00', 'duration' => 15,
            'status' => 'confirmed', 'created_by' => 'reception',
        ]);

        Appointment::create([
            'client_id' => $c2->id, 'pet_id' => $p3->id,
            'procedure_id' => 'checkup', 'doctor_id' => 2,
            'date' => $today, 'time' => '09:30', 'duration' => 20,
            'status' => 'confirmed', 'created_by' => 'reception',
        ]);

        Appointment::create([
            'client_id' => $c3->id, 'pet_id' => $p4->id,
            'procedure_id' => 'surgery_small', 'doctor_id' => 1,
            'date' => $today, 'time' => '10:30', 'duration' => 45,
            'status' => 'pending', 'created_by' => 'public',
            'note' => 'Kočka kulhá na pravou přední',
        ]);

        Appointment::create([
            'client_id' => $c4->id, 'pet_id' => $p5->id,
            'procedure_id' => 'dental', 'doctor_id' => 1,
            'date' => $tomorrow, 'time' => '14:00', 'duration' => 60,
            'status' => 'confirmed', 'created_by' => 'reception',
        ]);

        Appointment::create([
            'client_id' => $c1->id, 'pet_id' => $p2->id,
            'procedure_id' => 'blood_work', 'doctor_id' => 3,
            'date' => $tomorrow, 'time' => '08:30', 'duration' => 15,
            'status' => 'pending', 'created_by' => 'public',
        ]);

        // Employees (PINs will be hashed automatically by the model cast)
        Employee::create(['name' => 'Admin',               'email' => 'admin@klinika.cz',   'role' => 'manager',   'pin' => '1234']);
        Employee::create(['name' => 'Jana Recepční',       'email' => 'jana@klinika.cz',    'role' => 'reception', 'pin' => '5678']);
        Employee::create(['name' => 'MVDr. Jan Novák',     'email' => 'novak@klinika.cz',   'role' => 'doctor',    'pin' => '1111', 'doctor_id' => 1]);
        Employee::create(['name' => 'MVDr. Petra Králová', 'email' => 'kralova@klinika.cz', 'role' => 'doctor',    'pin' => '2222', 'doctor_id' => 2]);
        Employee::create(['name' => 'MVDr. Tomáš Veselý',  'email' => 'vesely@klinika.cz',  'role' => 'doctor',    'pin' => '3333', 'doctor_id' => 3]);
    }
}
