<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Nepřihlášen'], 401);
        }

        $userRole = $user->role->value ?? $user->role ?? null;

        if (!$userRole || !in_array($userRole, $roles)) {
            return response()->json(['message' => 'Nedostatečná oprávnění'], 403);
        }

        return $next($request);
    }
}
