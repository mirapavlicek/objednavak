<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ConfigController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\PetController;
use App\Http\Controllers\Api\ProcedureBlockController;
use App\Http\Controllers\Api\ProcedureController;
use App\Http\Controllers\Api\PublicBookingController;
use App\Http\Controllers\Api\SlotController;
use App\Http\Controllers\Api\SmsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes (no auth)
|--------------------------------------------------------------------------
*/
Route::post('auth/login', [AuthController::class, 'login']);
Route::get('procedures', [ProcedureController::class, 'index']);

// Public booking portal
Route::prefix('public')->group(function () {
    Route::post('register', [PublicBookingController::class, 'register']);
    Route::post('login', [PublicBookingController::class, 'login']);
    Route::post('verify-2fa', [PublicBookingController::class, 'verifyTwoFactor']);
    Route::post('resend-2fa', [PublicBookingController::class, 'resendTwoFactor']);
    Route::post('forgot-password', [PublicBookingController::class, 'forgotPassword']);
    Route::post('reset-password', [PublicBookingController::class, 'resetPassword']);
    Route::get('procedures', [ProcedureController::class, 'index']);
    Route::get('doctors', [DoctorController::class, 'index']);
});

/*
|--------------------------------------------------------------------------
| Public portal (authenticated client)
|--------------------------------------------------------------------------
*/
Route::prefix('public')->middleware('auth:sanctum')->group(function () {
    Route::get('my-pets', [PublicBookingController::class, 'myPets']);
    Route::get('my-appointments', [PublicBookingController::class, 'myAppointments']);
    Route::post('booking-request', [PublicBookingController::class, 'bookingRequest']);
    Route::get('available-slots', [SlotController::class, 'available']);

    // Password & Profile
    Route::post('change-password', [PublicBookingController::class, 'changePassword']);
    Route::put('profile', [PublicBookingController::class, 'updateProfile']);

    // Pet CRUD
    Route::post('pets', [PublicBookingController::class, 'storePet']);
    Route::put('pets/{pet}', [PublicBookingController::class, 'updatePet']);
    Route::delete('pets/{pet}', [PublicBookingController::class, 'destroyPet']);

    // Cancel appointment
    Route::post('appointments/{appointment}/cancel', [PublicBookingController::class, 'cancelAppointment']);
});

/*
|--------------------------------------------------------------------------
| Employee authenticated routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    // Appointments
    Route::apiResource('appointments', AppointmentController::class);
    Route::put('appointments/{appointment}/action', [AppointmentController::class, 'action'])
        ->name('appointments.action');

    // Clients & Pets
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('pets', PetController::class);

    // Doctors
    Route::apiResource('doctors', DoctorController::class);

    // Procedure Blocks
    Route::apiResource('procedure-blocks', ProcedureBlockController::class);

    // Slots
    Route::get('slots/available', [SlotController::class, 'available']);

    // Calendar
    Route::get('calendar', [CalendarController::class, 'index']);

    // SMS
    Route::post('sms/send', [SmsController::class, 'send']);

    // Config (read for all authenticated, write for manager)
    Route::get('config', [ConfigController::class, 'index']);

    // Manager-only routes
    Route::middleware('role:manager')->group(function () {
        Route::put('config', [ConfigController::class, 'update']);
        Route::apiResource('employees', EmployeeController::class);
    });
});
