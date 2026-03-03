<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePetRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'client_id' => 'sometimes|exists:clients,id',
            'name'      => 'sometimes|string|max:255',
            'species'   => 'sometimes|string|max:50',
            'breed'     => 'nullable|string|max:255',
        ];
    }
}
