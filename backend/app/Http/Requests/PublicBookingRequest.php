<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class PublicBookingRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'pet_id'       => 'required|exists:pets,id',
            'procedure_id' => 'required|exists:procedures,id',
            'doctor_id'    => 'nullable|exists:doctors,id',
            'date'         => 'required|date|after_or_equal:today',
            'time'         => 'required|date_format:H:i',
            'note'         => 'nullable|string|max:2000',
        ];
    }
}
