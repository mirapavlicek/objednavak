<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'clientId'     => $this->client_id,
            'petId'        => $this->pet_id,
            'manualName'   => $this->manual_name,
            'manualPhone'  => $this->manual_phone,
            'manualPet'    => $this->manual_pet,
            'procedureId'  => $this->procedure_id,
            'doctorId'     => $this->doctor_id,
            'date'         => $this->date->format('Y-m-d'),
            'time'         => substr($this->time, 0, 5),
            'duration'     => $this->duration,
            'status'       => $this->status->value,
            'note'         => $this->note,
            'createdBy'    => $this->created_by->value,
            'arrivalTime'  => $this->arrival_time ? substr($this->arrival_time, 0, 5) : null,
            'createdAt'    => $this->created_at?->toISOString(),
            'client'       => ClientResource::make($this->whenLoaded('client')),
            'pet'          => PetResource::make($this->whenLoaded('pet')),
            'doctor'       => DoctorResource::make($this->whenLoaded('doctor')),
            'procedure'    => ProcedureResource::make($this->whenLoaded('procedure')),
        ];
    }
}
