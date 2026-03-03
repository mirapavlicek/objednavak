<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PublicBookingRequest;
use App\Http\Resources\AppointmentResource;
use App\Http\Resources\ClientResource;
use App\Http\Resources\PetResource;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Doctor;
use App\Models\Pet;
use App\Models\Procedure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PublicBookingController extends Controller
{
    /**
     * Send email with fallback to PHP mail().
     * Shared hosting often has issues with Laravel Mail drivers,
     * so we try Laravel first, then fall back to native mail().
     */
    private function sendEmail(string $to, string $subject, string $body): void
    {
        // Try Laravel Mail first
        try {
            Mail::raw($body, function ($message) use ($to, $subject) {
                $message->to($to)->subject($subject);
            });
            Log::info("Email sent via Laravel Mail to {$to}");
            return;
        } catch (\Throwable $e) {
            Log::warning("Laravel Mail failed for {$to}: " . $e->getMessage());
        }

        // Fallback: PHP native mail()
        try {
            $fromAddress = config('mail.from.address', 'mira@alt64.cz');
            $fromName = config('mail.from.name', 'VetBook');
            $headers = implode("\r\n", [
                "From: {$fromName} <{$fromAddress}>",
                "Reply-To: {$fromAddress}",
                "Content-Type: text/plain; charset=UTF-8",
                "X-Mailer: VetBook/1.0",
            ]);

            $sent = @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);

            if ($sent) {
                Log::info("Email sent via PHP mail() to {$to}");
            } else {
                Log::warning("PHP mail() returned false for {$to}");
            }
        } catch (\Throwable $e) {
            Log::warning("PHP mail() failed for {$to}: " . $e->getMessage());
        }
    }

    /**
     * Build a full email body from translated parts.
     */
    private function buildEmailBody(string $greeting, string $body, string $regards): string
    {
        return "{$greeting},\n\n{$body}\n\n{$regards}";
    }

    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'phone'      => 'required|string|max:20',
            'email'      => 'required|email|unique:clients,email',
        ]);

        $password = Str::random(8);

        $client = Client::create([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'phone'      => $request->phone,
            'email'      => $request->email,
            'password'   => $password,
        ]);

        // Send welcome email with credentials
        $this->sendEmail(
            $client->email,
            __('messages.email_register_subject'),
            $this->buildEmailBody(
                __('messages.email_greeting') . ' ' . $client->first_name,
                __('messages.email_register_body', ['email' => $client->email, 'password' => $password]),
                __('messages.email_regards')
            )
        );

        return response()->json([
            'client' => ClientResource::make($client),
            'generatedPassword' => $password,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $client = Client::where('email', $request->email)->first();

        if (!$client || !$client->password || !Hash::check($request->password, $client->password)) {
            return response()->json(['message' => __('messages.invalid_credentials')], 401);
        }

        // 2FA: generate and send code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $client->two_factor_code = Hash::make($code);
        $client->two_factor_expires = now()->addMinutes(10);
        $client->save();

        $this->sendEmail(
            $client->email,
            __('messages.email_2fa_subject'),
            $this->buildEmailBody(
                __('messages.email_greeting'),
                __('messages.email_2fa_body', ['code' => $code]),
                __('messages.email_regards')
            )
        );

        return response()->json([
            'status' => __('messages.2fa_required'),
            'email' => $client->email,
        ]);
    }

    public function verifyTwoFactor(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ]);

        $client = Client::where('email', $request->email)->first();

        if (!$client || !$client->two_factor_code) {
            return response()->json(['message' => __('messages.invalid_code')], 422);
        }

        if ($client->two_factor_expires && $client->two_factor_expires->isPast()) {
            $client->update(['two_factor_code' => null, 'two_factor_expires' => null]);
            return response()->json(['message' => __('messages.code_expired_login')], 422);
        }

        if (!Hash::check($request->code, $client->two_factor_code)) {
            return response()->json(['message' => __('messages.invalid_code')], 422);
        }

        // Clear 2FA code
        $client->update(['two_factor_code' => null, 'two_factor_expires' => null]);

        // Issue token
        $client->tokens()->delete();
        $token = $client->createToken('public', ['public']);

        return response()->json([
            'token' => $token->plainTextToken,
            'client' => ClientResource::make($client->load('pets')),
            'mustChangePassword' => is_null($client->password_changed_at),
        ]);
    }

    public function resendTwoFactor(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $client = Client::where('email', $request->email)->first();

        if (!$client || !$client->two_factor_code) {
            return response()->json(['message' => __('messages.code_sent')]);
        }

        // Rate limit: don't resend if code is less than 60s old
        if ($client->two_factor_expires &&
            $client->two_factor_expires->subMinutes(9)->isFuture()) {
            return response()->json(['message' => __('messages.wait_before_resend')], 429);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $client->two_factor_code = Hash::make($code);
        $client->two_factor_expires = now()->addMinutes(10);
        $client->save();

        $this->sendEmail(
            $client->email,
            __('messages.email_2fa_resend'),
            $this->buildEmailBody(
                __('messages.email_greeting'),
                __('messages.email_2fa_resend_body', ['code' => $code]),
                __('messages.email_regards')
            )
        );

        return response()->json(['message' => __('messages.code_sent')]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $client = Client::where('email', $request->email)->first();

        // Always return 200 for security (don't reveal if email exists)
        if (!$client) {
            return response()->json(['message' => __('messages.reset_code_sent')]);
        }

        // Rate limit: don't resend if code is less than 60s old
        if ($client->reset_code_expires &&
            $client->reset_code_expires->subMinutes(14)->isFuture()) {
            return response()->json(['message' => __('messages.reset_code_sent')]);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $client->reset_code = Hash::make($code);
        $client->reset_code_expires = now()->addMinutes(15);
        $client->save();

        $this->sendEmail(
            $client->email,
            __('messages.email_reset_subject'),
            $this->buildEmailBody(
                __('messages.email_greeting'),
                __('messages.email_reset_body', ['code' => $code]),
                __('messages.email_regards')
            )
        );

        return response()->json(['message' => __('messages.reset_code_sent')]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'        => 'required|email',
            'code'         => 'required|string|size:6',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $client = Client::where('email', $request->email)->first();

        if (!$client || !$client->reset_code) {
            return response()->json(['message' => __('messages.invalid_code')], 422);
        }

        if ($client->reset_code_expires && $client->reset_code_expires->isPast()) {
            $client->update(['reset_code' => null, 'reset_code_expires' => null]);
            return response()->json(['message' => __('messages.code_expired_reset')], 422);
        }

        if (!Hash::check($request->code, $client->reset_code)) {
            return response()->json(['message' => __('messages.invalid_code')], 422);
        }

        $client->password = $request->new_password;
        $client->password_changed_at = now();
        $client->reset_code = null;
        $client->reset_code_expires = null;
        $client->save();

        // Revoke all tokens
        $client->tokens()->delete();

        return response()->json(['message' => __('messages.password_restored')]);
    }

    public function myPets(Request $request)
    {
        return PetResource::collection($request->user()->pets);
    }

    public function myAppointments(Request $request)
    {
        $appointments = Appointment::where('client_id', $request->user()->id)
            ->with(['pet', 'doctor', 'procedure'])
            ->orderByDesc('date')
            ->orderByDesc('time')
            ->limit(100)
            ->get();

        return AppointmentResource::collection($appointments);
    }

    public function bookingRequest(PublicBookingRequest $request)
    {
        $client = $request->user();
        $procedure = Procedure::findOrFail($request->procedure_id);

        $appointment = Appointment::create([
            'client_id'    => $client->id,
            'pet_id'       => $request->pet_id,
            'procedure_id' => $request->procedure_id,
            'doctor_id'    => $request->doctor_id ?: Doctor::first()->id,
            'date'         => $request->date,
            'time'         => $request->time,
            'duration'     => $procedure->duration,
            'status'       => 'pending',
            'note'         => $request->note,
            'created_by'   => 'public',
        ]);

        return AppointmentResource::make(
            $appointment->load(['client', 'pet', 'doctor', 'procedure'])
        );
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'old_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $client = $request->user();

        if (!Hash::check($request->old_password, $client->password)) {
            return response()->json(['message' => __('messages.old_password_wrong')], 422);
        }

        $client->password = $request->new_password;
        $client->password_changed_at = now();
        $client->save();

        return response()->json(['message' => __('messages.password_changed')]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'phone'      => 'required|string|max:20',
            'email'      => 'required|email|unique:clients,email,' . $request->user()->id,
        ]);

        $client = $request->user();
        $client->update($request->only(['first_name', 'last_name', 'phone', 'email']));

        return ClientResource::make($client->fresh());
    }

    public function storePet(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'species' => 'required|string|max:50',
            'breed'   => 'nullable|string|max:255',
        ]);

        $pet = $request->user()->pets()->create(
            $request->only(['name', 'species', 'breed'])
        );

        return PetResource::make($pet);
    }

    public function updatePet(Request $request, Pet $pet)
    {
        if ($pet->client_id !== $request->user()->id) {
            return response()->json(['message' => __('messages.unauthorized')], 403);
        }

        $request->validate([
            'name'    => 'required|string|max:255',
            'species' => 'required|string|max:50',
            'breed'   => 'nullable|string|max:255',
        ]);

        $pet->update($request->only(['name', 'species', 'breed']));

        return PetResource::make($pet->fresh());
    }

    public function destroyPet(Request $request, Pet $pet)
    {
        if ($pet->client_id !== $request->user()->id) {
            return response()->json(['message' => __('messages.unauthorized')], 403);
        }

        $hasFutureApts = $pet->appointments()
            ->whereDate('date', '>=', now()->format('Y-m-d'))
            ->whereNotIn('status', ['completed', 'rejected', 'no_show', 'cancelled'])
            ->exists();

        if ($hasFutureApts) {
            return response()->json([
                'message' => __('messages.pet_has_future_apts'),
            ], 422);
        }

        $pet->delete();

        return response()->json(['message' => __('messages.pet_deleted')]);
    }

    public function cancelAppointment(Request $request, Appointment $appointment)
    {
        if ($appointment->client_id !== $request->user()->id) {
            return response()->json(['message' => __('messages.unauthorized')], 403);
        }

        if (!in_array($appointment->status->value ?? $appointment->status, ['pending', 'confirmed'])) {
            return response()->json([
                'message' => __('messages.cannot_cancel'),
            ], 422);
        }

        $appointment->status = 'cancelled';
        $appointment->save();

        return AppointmentResource::make(
            $appointment->fresh(['client', 'pet', 'doctor', 'procedure'])
        );
    }
}
