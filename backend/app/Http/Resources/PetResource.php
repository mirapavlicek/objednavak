<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'clientId' => $this->client_id,
            'name'     => $this->name,
            'species'  => $this->species,
            'breed'    => $this->breed,
        ];
    }
}
