<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\ClinicConfig;
use App\Models\SmsLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * Send an SMS message.
     */
    public function send(string $phone, string $message, ?int $appointmentId = null, ?string $template = null): SmsLog
    {
        $apiKey = ClinicConfig::get('sms_api_key');

        if (!$apiKey) {
            throw new \RuntimeException('SMS API klíč není nakonfigurován');
        }

        // Normalize phone number to +420 format
        $normalizedPhone = $this->normalizePhone($phone);

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'x-api-key' => $apiKey,
        ])->post('https://api.smsmngr.com/v2/message', [
            'body' => $message,
            'to' => [['phone_number' => $normalizedPhone]],
        ]);

        $data = $response->json();
        $success = !empty($data['accepted']);

        if (!$success) {
            Log::warning('SMS failed', ['phone' => $normalizedPhone, 'response' => $data]);
        }

        return SmsLog::create([
            'appointment_id' => $appointmentId,
            'phone' => $normalizedPhone,
            'message' => $message,
            'template' => $template,
            'status' => $success ? 'sent' : 'failed',
            'external_id' => $data['accepted'][0]['message_id'] ?? null,
        ]);
    }

    /**
     * Send SMS from a template for a given appointment.
     */
    public function sendFromTemplate(Appointment $appointment, string $templateId): SmsLog
    {
        $appointment->loadMissing(['client', 'pet', 'procedure']);

        $phone = $appointment->client?->phone ?? $appointment->manual_phone;
        if (!$phone) {
            throw new \RuntimeException('Klient nemá telefonní číslo');
        }

        $petName = $appointment->pet?->name ?? $appointment->manual_pet ?? 'pacient';
        $procName = $appointment->procedure?->name ?? 'vyšetření';
        $dateStr = $appointment->date->format('d.m.Y');
        $time = substr($appointment->time, 0, 5);
        $clinicName = ClinicConfig::get('clinic_name', 'VetBook');

        $templates = [
            'confirm'  => "Potvrzujeme Vasi objednavku {$procName} pro {$petName} dne {$dateStr} v {$time}. {$clinicName}.",
            'reminder' => "Pripominame termin {$procName} pro {$petName} dne {$dateStr} v {$time}. {$clinicName}.",
            'cancel'   => "Vas termin {$dateStr} v {$time} pro {$petName} byl zrusen. Kontaktujte nas pro novy termin. {$clinicName}.",
            'ready'    => "Vysledky vysetreni pro {$petName} jsou pripraveny k vyzvednuti. {$clinicName}.",
        ];

        $message = $templates[$templateId] ?? throw new \RuntimeException("Neznámá šablona: {$templateId}");

        return $this->send($phone, $message, $appointment->id, $templateId);
    }

    private function normalizePhone(string $phone): string
    {
        $cleaned = preg_replace('/[\s\-]/', '', $phone);

        if (str_starts_with($cleaned, '+420')) {
            return $cleaned;
        }
        if (str_starts_with($cleaned, '420')) {
            return '+' . $cleaned;
        }

        return '+420' . $cleaned;
    }
}
