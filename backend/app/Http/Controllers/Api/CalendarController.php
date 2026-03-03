<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'mode' => 'sometimes|in:day,week,month',
            'date' => 'sometimes|date',
        ]);

        $mode = $request->get('mode', 'week');
        $date = Carbon::parse($request->get('date', today()));

        $query = Appointment::with(['client', 'pet', 'doctor', 'procedure'])
            ->whereNotIn('status', ['rejected', 'no_show']);

        switch ($mode) {
            case 'day':
                $query->whereDate('date', $date->format('Y-m-d'));
                break;
            case 'week':
                $monday = $date->copy()->startOfWeek(Carbon::MONDAY);
                $sunday = $monday->copy()->addDays(6);
                $query->whereDate('date', '>=', $monday->format('Y-m-d'))
                      ->whereDate('date', '<=', $sunday->format('Y-m-d'));
                break;
            case 'month':
                $start = $date->copy()->startOfMonth()->startOfWeek(Carbon::MONDAY);
                $end = $date->copy()->endOfMonth()->endOfWeek(Carbon::SUNDAY);
                $query->whereDate('date', '>=', $start->format('Y-m-d'))
                      ->whereDate('date', '<=', $end->format('Y-m-d'));
                break;
        }

        return AppointmentResource::collection(
            $query->orderBy('date')->orderBy('time')->get()
        );
    }
}
