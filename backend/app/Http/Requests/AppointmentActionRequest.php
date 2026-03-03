<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class AppointmentActionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'action' => 'required|in:confirm,reject,arrive,start,complete,no_show',
        ];
    }
}
