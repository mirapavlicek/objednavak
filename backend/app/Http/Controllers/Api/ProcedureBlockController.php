<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProcedureBlockRequest;
use App\Http\Resources\ProcedureBlockResource;
use App\Models\ProcedureBlock;
use Illuminate\Http\Request;

class ProcedureBlockController extends Controller
{
    public function index()
    {
        return ProcedureBlockResource::collection(
            ProcedureBlock::with('doctors')->get()
        );
    }

    public function store(StoreProcedureBlockRequest $request)
    {
        $block = ProcedureBlock::create($request->only(['label', 'time_from', 'time_to']));
        $block->syncCategories($request->categories);
        $block->doctors()->sync($request->doctor_ids);

        return ProcedureBlockResource::make($block->load('doctors'));
    }

    public function show(ProcedureBlock $procedureBlock)
    {
        return ProcedureBlockResource::make($procedureBlock->load('doctors'));
    }

    public function update(Request $request, ProcedureBlock $procedureBlock)
    {
        $request->validate([
            'label'        => 'sometimes|string|max:255',
            'time_from'    => 'sometimes|date_format:H:i',
            'time_to'      => 'sometimes|date_format:H:i',
            'categories'   => 'sometimes|array|min:1',
            'categories.*' => 'in:prevence,diagnostika,chirurgie,specialni,akutni,ostatni',
            'doctor_ids'   => 'sometimes|array|min:1',
            'doctor_ids.*' => 'exists:doctors,id',
        ]);

        $procedureBlock->update($request->only(['label', 'time_from', 'time_to']));

        if ($request->has('categories')) {
            $procedureBlock->syncCategories($request->categories);
        }
        if ($request->has('doctor_ids')) {
            $procedureBlock->doctors()->sync($request->doctor_ids);
        }

        return ProcedureBlockResource::make($procedureBlock->fresh()->load('doctors'));
    }

    public function destroy(ProcedureBlock $procedureBlock)
    {
        $procedureBlock->delete();
        return response()->json(['message' => 'Smazáno'], 200);
    }
}
