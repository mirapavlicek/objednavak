<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProcedureResource;
use App\Models\Procedure;

class ProcedureController extends Controller
{
    public function index()
    {
        return ProcedureResource::collection(
            Procedure::orderBy('sort_order')->get()
        );
    }

    public function show(Procedure $procedure)
    {
        return ProcedureResource::make($procedure);
    }
}
