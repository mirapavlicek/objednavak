<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'      => 'required|string|max:255',
            'email'     => 'nullable|email|max:255',
            'role'      => 'required|in:manager,reception,doctor',
            'pin'       => 'required|string|min:4|max:10',
            'doctor_id' => 'nullable|exists:doctors,id',
        ];
    }
}
