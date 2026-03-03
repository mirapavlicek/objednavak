<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProcedureBlockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'label'      => $this->label,
            'timeFrom'   => substr($this->time_from, 0, 5),
            'timeTo'     => substr($this->time_to, 0, 5),
            'categories' => $this->category_list,
            'doctorIds'  => $this->doctors->pluck('id')->toArray(),
        ];
    }
}
