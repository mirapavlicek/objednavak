<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SendSmsRequest;
use App\Services\SmsService;

class SmsController extends Controller
{
    public function send(SendSmsRequest $request, SmsService $smsService)
    {
        try {
            $log = $smsService->send(
                $request->phone,
                $request->message,
                $request->appointment_id,
                $request->template
            );

            return response()->json([
                'success' => $log->status === 'sent',
                'smsLog' => [
                    'id' => $log->id,
                    'status' => $log->status,
                    'externalId' => $log->external_id,
                ],
            ]);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
