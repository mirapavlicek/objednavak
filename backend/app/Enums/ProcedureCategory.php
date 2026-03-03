<?php

namespace App\Enums;

enum ProcedureCategory: string
{
    case Prevence = 'prevence';
    case Diagnostika = 'diagnostika';
    case Chirurgie = 'chirurgie';
    case Specialni = 'specialni';
    case Akutni = 'akutni';
    case Ostatni = 'ostatni';
}
