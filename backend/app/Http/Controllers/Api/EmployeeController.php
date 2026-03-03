<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    public function index()
    {
        return EmployeeResource::collection(Employee::all());
    }

    public function store(StoreEmployeeRequest $request)
    {
        $employee = Employee::create($request->validated());
        return EmployeeResource::make($employee);
    }

    public function show(Employee $employee)
    {
        return EmployeeResource::make($employee);
    }

    public function update(Request $request, Employee $employee)
    {
        $request->validate([
            'name'      => 'sometimes|string|max:255',
            'email'     => 'nullable|email|max:255',
            'role'      => 'sometimes|in:manager,reception,doctor',
            'pin'       => 'sometimes|string|min:4|max:10',
            'doctor_id' => 'nullable|exists:doctors,id',
        ]);

        $employee->update($request->only(['name', 'email', 'role', 'pin', 'doctor_id']));
        return EmployeeResource::make($employee->fresh());
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return response()->json(['message' => 'Smazáno'], 200);
    }
}
