<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDoctorRequest;
use App\Http\Resources\DoctorResource;
use App\Models\Doctor;
use Illuminate\Http\Request;

class DoctorController extends Controller
{
    public function index()
    {
        return DoctorResource::collection(Doctor::all());
    }

    public function store(StoreDoctorRequest $request)
    {
        $doctor = Doctor::create($request->only(['name', 'color']));
        $doctor->syncSpecializations($request->specializations);

        return DoctorResource::make($doctor);
    }

    public function show(Doctor $doctor)
    {
        return DoctorResource::make($doctor);
    }

    public function update(Request $request, Doctor $doctor)
    {
        $request->validate([
            'name'              => 'sometimes|string|max:255',
            'color'             => 'sometimes|string|max:7',
            'specializations'   => 'sometimes|array|min:1',
            'specializations.*' => 'in:prevence,diagnostika,chirurgie,specialni,akutni,ostatni',
        ]);

        $doctor->update($request->only(['name', 'color']));

        if ($request->has('specializations')) {
            $doctor->syncSpecializations($request->specializations);
        }

        return DoctorResource::make($doctor->fresh());
    }

    public function destroy(Doctor $doctor)
    {
        $doctor->delete();
        return response()->json(['message' => 'Smazáno'], 200);
    }
}
