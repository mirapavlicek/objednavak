<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreAppointmentRequest extends FormRequest
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
            'procedure_id' => 'required|exists:procedures,id',
            'doctor_id'    => 'nullable|exists:doctors,id',
            'date'         => 'required|date',
            'time'         => 'required|date_format:H:i',
            'duration'     => 'required|integer|min:5|max:480',
            'status'       => 'sometimes|in:pending,confirmed,arrived',
            'note'         => 'nullable|string|max:2000',
            'created_by'   => 'sometimes|in:reception,public',
            'arrival_time' => 'nullable|date_format:H:i',
        ];
    }
}
