<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Http\Resources\ClientResource;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::with('pets');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('last_name', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return ClientResource::collection(
            $query->orderBy('last_name')->paginate(50)
        );
    }

    public function store(StoreClientRequest $request)
    {
        $client = Client::create($request->validated());
        return ClientResource::make($client->load('pets'));
    }

    public function show(Client $client)
    {
        return ClientResource::make($client->load('pets'));
    }

    public function update(UpdateClientRequest $request, Client $client)
    {
        $client->update($request->validated());
        return ClientResource::make($client->fresh('pets'));
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return response()->json(['message' => 'Smazáno'], 200);
    }
}
