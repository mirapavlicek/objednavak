<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DoctorResource;
use App\Http\Resources\EmployeeResource;
use App\Http\Resources\ProcedureBlockResource;
use App\Models\ClinicConfig;
use App\Models\Doctor;
use App\Models\Employee;
use App\Models\OpeningHour;
use App\Models\ProcedureBlock;
use Illuminate\Http\Request;

class ConfigController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => [
                'clinicName'         => ClinicConfig::get('clinic_name', 'VetBook'),
                'slotInterval'       => (int) ClinicConfig::get('slot_interval', 5),
                'acuteBufferSlots'   => (int) ClinicConfig::get('acute_buffer_slots', 3),
                'acuteBufferSpacing' => (int) ClinicConfig::get('acute_buffer_spacing', 90),
                'smsApiKey'          => ClinicConfig::get('sms_api_key'),
                'smsSender'          => ClinicConfig::get('sms_sender'),
                'smsOnConfirm'       => (bool) ClinicConfig::get('sms_on_confirm', true),
                'smsOnReminder'      => (bool) ClinicConfig::get('sms_on_reminder', true),
                'smsOnCancel'        => (bool) ClinicConfig::get('sms_on_cancel', false),
                'smsReminderHours'   => (int) ClinicConfig::get('sms_reminder_hours', 24),
                'openingHours'       => $this->getOpeningHours(),
                'doctors'            => DoctorResource::collection(Doctor::all()),
                'procedureBlocks'    => ProcedureBlockResource::collection(ProcedureBlock::with('doctors')->get()),
                'employees'          => EmployeeResource::collection(Employee::all()),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $allowed = [
            'clinic_name', 'slot_interval', 'acute_buffer_slots',
            'acute_buffer_spacing', 'sms_api_key', 'sms_sender',
            'sms_on_confirm', 'sms_on_reminder', 'sms_on_cancel',
            'sms_reminder_hours',
        ];

        foreach ($request->only($allowed) as $key => $value) {
            ClinicConfig::set($key, $value);
        }

        if ($request->has('opening_hours')) {
            foreach ($request->opening_hours as $dow => $hours) {
                OpeningHour::updateOrCreate(
                    ['day_of_week' => $dow],
                    [
                        'open_time'  => $hours['open'] ?? null,
                        'close_time' => $hours['close'] ?? null,
                        'is_closed'  => empty($hours['open']),
                    ]
                );
            }
        }

        return $this->index();
    }

    private function getOpeningHours(): array
    {
        $dayMap = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        $hours = [];

        foreach (OpeningHour::orderBy('day_of_week')->get() as $oh) {
            $key = $dayMap[$oh->day_of_week] ?? null;
            if (!$key) continue;

            $hours[$key] = $oh->is_closed ? null : [
                'open'  => substr($oh->open_time, 0, 5),
                'close' => substr($oh->close_time, 0, 5),
            ];
        }

        return $hours;
    }
}
