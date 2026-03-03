<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Models\ClinicConfig;
use App\Services\SmsService;
use Illuminate\Console\Command;

class SendSmsReminders extends Command
{
    protected $signature = 'sms:reminders';
    protected $description = 'Send SMS reminders for upcoming appointments';

    public function handle(SmsService $smsService): int
    {
        if (!ClinicConfig::get('sms_on_reminder')) {
            $this->info('SMS reminders are disabled.');
            return 0;
        }

        $hours = (int) ClinicConfig::get('sms_reminder_hours', 24);
        $targetTime = now()->addHours($hours);
        $targetDate = $targetTime->format('Y-m-d');

        $appointments = Appointment::where('date', $targetDate)
            ->where('status', 'confirmed')
            ->whereDoesntHave('smsLogs', function ($q) {
                $q->where('template', 'reminder');
            })
            ->with(['client', 'pet', 'procedure'])
            ->get();

        $sent = 0;
        $failed = 0;

        foreach ($appointments as $apt) {
            try {
                $smsService->sendFromTemplate($apt, 'reminder');
                $sent++;
                $this->info("Reminder sent for appointment #{$apt->id}");
            } catch (\Exception $e) {
                $failed++;
                $this->error("Failed for #{$apt->id}: {$e->getMessage()}");
            }
        }

        $this->info("Done. Sent: {$sent}, Failed: {$failed}");
        return 0;
    }
}
