<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcedureResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'name'      => $this->name,
            'duration'  => $this->duration,
            'color'     => $this->color,
            'category'  => $this->category->value,
            'sortOrder' => $this->sort_order,
        ];
    }
}
