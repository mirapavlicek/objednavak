<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AvailableSlotsRequest;
use App\Services\SlotFinderService;

class SlotController extends Controller
{
    public function available(AvailableSlotsRequest $request, SlotFinderService $slotFinder)
    {
        $slots = $slotFinder->findFreeSlots(
            $request->procedure_id,
            $request->date_from,
            $request->date_to,
            $request->doctor_id ? (int) $request->doctor_id : null,
            $request->integer('limit', 50)
        );

        return response()->json(['data' => $slots]);
    }
}
