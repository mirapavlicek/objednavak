<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class StorePetRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'client_id' => 'required|exists:clients,id',
            'name'      => 'required|string|max:255',
            'species'   => 'required|string|max:50',
            'breed'     => 'nullable|string|max:255',
        ];
    }
}
