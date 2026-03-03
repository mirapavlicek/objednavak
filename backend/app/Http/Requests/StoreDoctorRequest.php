<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreDoctorRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'              => 'required|string|max:255',
            'color'             => 'required|string|max:7',
            'specializations'   => 'required|array|min:1',
            'specializations.*' => 'in:prevence,diagnostika,chirurgie,specialni,akutni,ostatni',
        ];
    }
}
