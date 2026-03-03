<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\Client;
use App\Models\Pet;
use App\Models\Appointment;
use App\Models\Doctor;
use Database\Seeders\ProcedureSeeder;
use Database\Seeders\DefaultConfigSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(ProcedureSeeder::class);
        $this->seed(DefaultConfigSeeder::class);
    }

    private function createEmployeeAndLogin(string $role = 'manager'): string
    {
        $employee = Employee::create([
            'name'  => 'Test User',
            'email' => 'test@klinika.cz',
            'role'  => $role,
            'pin'   => '1234',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@klinika.cz',
            'pin'   => '1234',
        ]);

        $response->assertStatus(200);

        return $response->json('token');
    }

    // --- Auth ---

    public function test_employee_can_login_with_pin(): void
    {
        Employee::create([
            'name'  => 'Admin',
            'email' => 'admin@klinika.cz',
            'role'  => 'manager',
            'pin'   => '1234',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@klinika.cz',
            'pin'   => '1234',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'employee']);
    }

    public function test_login_fails_with_wrong_pin(): void
    {
        Employee::create([
            'name'  => 'Admin',
            'email' => 'admin@klinika.cz',
            'role'  => 'manager',
            'pin'   => '1234',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'admin@klinika.cz',
            'pin'   => '9999',
        ]);

        $response->assertStatus(401);
    }

    public function test_me_returns_user(): void
    {
        $token = $this->createEmployeeAndLogin();

        $response = $this->getJson('/api/auth/me', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonFragment(['email' => 'test@klinika.cz']);
    }

    // --- Procedures ---

    public function test_procedures_are_public(): void
    {
        $response = $this->getJson('/api/procedures');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    // --- Config ---

    public function test_config_returns_data(): void
    {
        $token = $this->createEmployeeAndLogin();

        $response = $this->getJson('/api/config', [
            'Authorization' => "Bearer {$token}",
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    // --- Clients CRUD ---

    public function test_clients_crud(): void
    {
        $token = $this->createEmployeeAndLogin();
        $headers = ['Authorization' => "Bearer {$token}"];

        // Create
        $response = $this->postJson('/api/clients', [
            'first_name' => 'Jana',
            'last_name'  => 'Nová',
            'phone'      => '602111222',
            'email'      => 'jana@test.cz',
        ], $headers);
        $response->assertStatus(201);
        $clientId = $response->json('data.id');

        // Read list
        $response = $this->getJson('/api/clients', $headers);
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');

        // Read single
        $response = $this->getJson("/api/clients/{$clientId}", $headers);
        $response->assertStatus(200)
            ->assertJsonFragment(['firstName' => 'Jana']);

        // Update
        $response = $this->putJson("/api/clients/{$clientId}", [
            'first_name' => 'Jana',
            'last_name'  => 'Upravená',
            'phone'      => '602111222',
        ], $headers);
        $response->assertStatus(200)
            ->assertJsonFragment(['lastName' => 'Upravená']);

        // Delete
        $response = $this->deleteJson("/api/clients/{$clientId}", [], $headers);
        $response->assertStatus(200);
    }

    // --- Pets CRUD ---

    public function test_pets_crud(): void
    {
        $token = $this->createEmployeeAndLogin();
        $headers = ['Authorization' => "Bearer {$token}"];

        $client = Client::create([
            'first_name' => 'Petr',
            'last_name'  => 'Test',
            'phone'      => '603222333',
        ]);

        // Create
        $response = $this->postJson('/api/pets', [
            'client_id' => $client->id,
            'name'      => 'Rex',
            'species'   => 'Pes',
            'breed'     => 'Labrador',
        ], $headers);
        $response->assertStatus(201);
        $petId = $response->json('data.id');

        // Read
        $response = $this->getJson('/api/pets', $headers);
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');

        // Delete
        $response = $this->deleteJson("/api/pets/{$petId}", [], $headers);
        $response->assertStatus(200);
    }

    // --- Appointments ---

    public function test_appointment_lifecycle(): void
    {
        $token = $this->createEmployeeAndLogin();
        $headers = ['Authorization' => "Bearer {$token}"];

        Doctor::create(['name' => 'MVDr. Novák', 'color' => '#3b82f6']);

        $client = Client::create([
            'first_name' => 'Jana',
            'last_name'  => 'Test',
            'phone'      => '602111222',
        ]);
        $pet = Pet::create([
            'client_id' => $client->id,
            'name'      => 'Rex',
            'species'   => 'Pes',
        ]);

        // Create appointment
        $response = $this->postJson('/api/appointments', [
            'client_id'    => $client->id,
            'pet_id'       => $pet->id,
            'procedure_id' => 'checkup',
            'doctor_id'    => 1,
            'date'         => now()->format('Y-m-d'),
            'time'         => '09:00',
            'duration'     => 20,
            'status'       => 'pending',
            'created_by'   => 'reception',
        ], $headers);
        $response->assertStatus(201);
        $aptId = $response->json('data.id');

        // Status transitions: pending → confirmed → arrived → in_progress → completed
        $this->putJson("/api/appointments/{$aptId}/action", ['action' => 'confirm'], $headers)
            ->assertStatus(200)
            ->assertJsonFragment(['status' => 'confirmed']);

        $this->putJson("/api/appointments/{$aptId}/action", ['action' => 'arrive'], $headers)
            ->assertStatus(200)
            ->assertJsonFragment(['status' => 'arrived']);

        $this->putJson("/api/appointments/{$aptId}/action", ['action' => 'start'], $headers)
            ->assertStatus(200)
            ->assertJsonFragment(['status' => 'in_progress']);

        $this->putJson("/api/appointments/{$aptId}/action", ['action' => 'complete'], $headers)
            ->assertStatus(200)
            ->assertJsonFragment(['status' => 'completed']);

        // Read today's appointments
        $response = $this->getJson('/api/appointments?date=' . now()->format('Y-m-d'), $headers);
        $response->assertStatus(200);
    }

    // --- Available Slots ---

    public function test_available_slots(): void
    {
        $token = $this->createEmployeeAndLogin();
        $headers = ['Authorization' => "Bearer {$token}"];

        Doctor::create(['name' => 'MVDr. Novák', 'color' => '#3b82f6']);

        $response = $this->getJson('/api/slots/available?' . http_build_query([
            'procedure_id' => 'checkup',
            'date_from'    => now()->addDay()->format('Y-m-d'),
            'date_to'      => now()->addDays(3)->format('Y-m-d'),
        ]), $headers);

        $response->assertStatus(200);
    }

    // --- Public Portal ---

    public function test_public_register_and_login(): void
    {
        // Register
        $response = $this->postJson('/api/public/register', [
            'first_name' => 'Karel',
            'last_name'  => 'Nový',
            'phone'      => '608999888',
            'email'      => 'karel@test.cz',
        ]);
        $response->assertStatus(201)
            ->assertJsonStructure(['client', 'generatedPassword']);

        $password = $response->json('generatedPassword');

        // Login
        $response = $this->postJson('/api/public/login', [
            'email'    => 'karel@test.cz',
            'password' => $password,
        ]);
        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'client']);
    }

    // --- Unauthenticated access ---

    public function test_unauthenticated_returns_401(): void
    {
        $this->getJson('/api/appointments')->assertStatus(401);
        $this->getJson('/api/clients')->assertStatus(401);
        $this->getJson('/api/config')->assertStatus(401);
    }

    // --- Role-based access ---

    public function test_non_manager_cannot_access_employees(): void
    {
        $token = $this->createEmployeeAndLogin('reception');
        $headers = ['Authorization' => "Bearer {$token}"];

        $this->getJson('/api/employees', $headers)->assertStatus(403);
    }
}
