<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AppointmentActionRequest;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Appointment::with(['client', 'pet', 'doctor', 'procedure']);

        if ($request->filled('date')) {
            $query->whereDate('date', $request->date);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('doctor_id')) {
            $query->where('doctor_id', $request->doctor_id);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }
        if ($request->filled('created_by')) {
            $query->where('created_by', $request->created_by);
        }

        $appointments = $query->orderBy('date')->orderBy('time')->paginate(100);

        return AppointmentResource::collection($appointments);
    }

    public function store(StoreAppointmentRequest $request)
    {
        $appointment = Appointment::create($request->validated());

        return AppointmentResource::make(
            $appointment->load(['client', 'pet', 'doctor', 'procedure'])
        );
    }

    public function show(Appointment $appointment)
    {
        return AppointmentResource::make(
            $appointment->load(['client', 'pet', 'doctor', 'procedure'])
        );
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment)
    {
        $appointment->update($request->validated());

        return AppointmentResource::make(
            $appointment->fresh(['client', 'pet', 'doctor', 'procedure'])
        );
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();
        return response()->json(['message' => 'Smazáno'], 200);
    }

    /**
     * Handle status transitions: confirm, reject, arrive, start, complete, no_show
     */
    public function action(AppointmentActionRequest $request, Appointment $appointment)
    {
        $action = $request->validated()['action'];

        $transitions = [
            'confirm'  => ['from' => ['pending'],              'to' => 'confirmed'],
            'reject'   => ['from' => ['pending', 'confirmed'], 'to' => 'rejected'],
            'arrive'   => ['from' => ['confirmed'],            'to' => 'arrived'],
            'start'    => ['from' => ['arrived'],              'to' => 'in_progress'],
            'complete' => ['from' => ['in_progress'],          'to' => 'completed'],
            'no_show'  => ['from' => ['confirmed', 'arrived'], 'to' => 'no_show'],
        ];

        $transition = $transitions[$action] ?? null;
        if (!$transition) {
            return response()->json(['message' => 'Neplatná akce'], 422);
        }

        if (!in_array($appointment->status->value, $transition['from'])) {
            return response()->json([
                'message' => "Nelze provést '{$action}' ze stavu '{$appointment->status->value}'",
            ], 422);
        }

        $appointment->status = $transition['to'];

        if ($action === 'arrive') {
            $appointment->arrival_time = now()->format('H:i');
        }

        $appointment->save();

        return AppointmentResource::make(
            $appointment->fresh(['client', 'pet', 'doctor', 'procedure'])
        );
    }
}
