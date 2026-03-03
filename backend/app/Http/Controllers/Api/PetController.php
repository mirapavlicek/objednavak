<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePetRequest;
use App\Http\Requests\UpdatePetRequest;
use App\Http\Resources\PetResource;
use App\Models\Pet;
use Illuminate\Http\Request;

class PetController extends Controller
{
    public function index(Request $request)
    {
        $query = Pet::with('client');

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->client_id);
        }

        return PetResource::collection(
            $query->orderBy('name')->paginate(50)
        );
    }

    public function store(StorePetRequest $request)
    {
        $pet = Pet::create($request->validated());
        return PetResource::make($pet);
    }

    public function show(Pet $pet)
    {
        return PetResource::make($pet);
    }

    public function update(UpdatePetRequest $request, Pet $pet)
    {
        $pet->update($request->validated());
        return PetResource::make($pet->fresh());
    }

    public function destroy(Pet $pet)
    {
        $pet->delete();
        return response()->json(['message' => 'Smazáno'], 200);
    }
}
