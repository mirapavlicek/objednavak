<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class AvailableSlotsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'procedure_id' => 'required|exists:procedures,id',
            'date_from'    => 'required|date',
            'date_to'      => 'required|date|after_or_equal:date_from',
            'doctor_id'    => 'nullable|exists:doctors,id',
            'limit'        => 'nullable|integer|min:1|max:200',
        ];
    }
}
