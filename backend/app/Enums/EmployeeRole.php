<?php

namespace App\Enums;

enum EmployeeRole: string
{
    case Manager = 'manager';
    case Reception = 'reception';
    case Doctor = 'doctor';
}
