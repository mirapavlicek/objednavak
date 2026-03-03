<?php
namespace App\Http\Requests;
use Illuminate\Foundation\Http\FormRequest;

class SendSmsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'phone'          => 'required|string|max:20',
            'message'        => 'required|string|max:640',
            'appointment_id' => 'nullable|exists:appointments,id',
            'template'       => 'nullable|in:confirm,reminder,cancel,ready,custom',
        ];
    }
}
