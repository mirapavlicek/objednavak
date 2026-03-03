<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'firstName' => $this->first_name,
            'lastName'  => $this->last_name,
            'phone'     => $this->phone,
            'email'     => $this->email,
            'passwordChangedAt' => $this->password_changed_at?->toISOString(),
            'pets'      => PetResource::collection($this->whenLoaded('pets')),
        ];
    }
}
