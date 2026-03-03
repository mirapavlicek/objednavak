<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $employee = Employee::where('email', $request->email)->first();

        if (!$employee || !Hash::check($request->pin, $employee->pin)) {
            return response()->json(['message' => 'Neplatné přihlašovací údaje'], 401);
        }

        // Revoke old tokens
        $employee->tokens()->delete();

        $token = $employee->createToken('vetbook', [$employee->role->value]);

        return response()->json([
            'token' => $token->plainTextToken,
            'employee' => [
                'id'       => $employee->id,
                'name'     => $employee->name,
                'email'    => $employee->email,
                'role'     => $employee->role->value,
                'doctorId' => $employee->doctor_id,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Odhlášeno']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id'       => $user->id,
            'name'     => $user->name,
            'email'    => $user->email,
            'role'     => $user->role->value,
            'doctorId' => $user->doctor_id,
        ]);
    }
}
