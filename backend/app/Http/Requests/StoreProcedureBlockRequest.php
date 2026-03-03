<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreProcedureBlockRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'label'        => 'required|string|max:255',
            'time_from'    => 'required|date_format:H:i',
            'time_to'      => 'required|date_format:H:i|after:time_from',
            'categories'   => 'required|array|min:1',
            'categories.*' => 'in:prevence,diagnostika,chirurgie,specialni,akutni,ostatni',
            'doctor_ids'   => 'required|array|min:1',
            'doctor_ids.*' => 'exists:doctors,id',
        ];
    }
}
