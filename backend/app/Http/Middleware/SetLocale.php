<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class SetLocale
{
    public function handle(Request $request, Closure $next)
    {
        $locale = $request->header('Accept-Language', config('app.locale'));

        // Parse Accept-Language: "cs", "en", "cs-CZ", "en-US,en;q=0.9"
        $locale = strtolower(substr($locale, 0, 2));

        if (in_array($locale, ['cs', 'en'])) {
            app()->setLocale($locale);
        }

        return $next($request);
    }
}
