<?php

use Illuminate\Support\Facades\Route;

// SPA fallback — serves the React app for all non-API routes
Route::get('/{any?}', function () {
    $path = public_path('app.html');
    if (file_exists($path)) {
        return response()->file($path);
    }
    // Dev mode: redirect to Vite dev server
    return redirect('http://localhost:5173');
})->where('any', '.*');
