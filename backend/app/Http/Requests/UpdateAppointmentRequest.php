<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'client_id'    => 'nullable|exists:clients,id',
            'pet_id'       => 'nullable|exists:pets,id',
            'manual_name'  => 'nullable|string|max:255',
            'manual_phone' => 'nullable|string|max:20',
            'manual_pet'   => 'nullable|string|max:255',
            'procedure_id' => 'sometimes|exists:procedures,id',
            'doctor_id'    => 'sometimes|exists:doctors,id',
            'date'         => 'sometimes|date',
            'time'         => 'sometimes|date_format:H:i',
            'duration'     => 'sometimes|integer|min:5|max:480',
            'note'         => 'nullable|string|max:2000',
        ];
    }
}
