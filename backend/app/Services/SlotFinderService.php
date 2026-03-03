<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\ClinicConfig;
use App\Models\Doctor;
use App\Models\OpeningHour;
use App\Models\Procedure;
use App\Models\ProcedureBlock;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SlotFinderService
{
    /**
     * Find available appointment slots.
     * Port of findFreeSlots() from App.jsx lines 119-163.
     */
    public function findFreeSlots(
        string $procedureId,
        string $dateFrom,
        string $dateTo,
        ?int $doctorId = null,
        int $limit = 50
    ): array {
        $procedure = Procedure::findOrFail($procedureId);
        $duration = $procedure->duration;
        $category = $procedure->category->value;

        $slotInterval = (int) ClinicConfig::get('slot_interval', 5);
        $openingHours = OpeningHour::all()->keyBy('day_of_week');

        // Get eligible doctors
        if ($doctorId) {
            $doctors = Doctor::where('id', $doctorId)->get();
        } else {
            $doctors = Doctor::withSpecialization($category)->get();
        }

        if ($doctors->isEmpty()) {
            return [];
        }

        // Get procedure blocks with categories and doctor assignments
        $blocks = ProcedureBlock::with('doctors')->get();

        // Pre-compute relevant blocks per doctor
        $relevantBlocksByDoctor = [];
        foreach ($doctors as $doc) {
            $relevantBlocksByDoctor[$doc->id] = $blocks->filter(function ($block) use ($category, $doc) {
                $hasCategory = in_array($category, $block->category_list);
                $hasDoctor = $block->doctors->contains('id', $doc->id);
                return $hasCategory && $hasDoctor;
            });
        }

        // Get all non-excluded appointments in date range
        $appointments = Appointment::whereBetween('date', [$dateFrom, $dateTo])
            ->whereNotIn('status', ['rejected', 'no_show', 'completed'])
            ->get()
            ->groupBy(function ($apt) {
                return $apt->date->format('Y-m-d') . '_' . $apt->doctor_id;
            });

        $slots = [];
        $current = Carbon::parse($dateFrom);
        $end = Carbon::parse($dateTo);

        while ($current->lte($end) && count($slots) < $limit) {
            $dateStr = $current->format('Y-m-d');

            // Convert Carbon dayOfWeek (0=Sun) to our format (0=Mon)
            $dow = ($current->dayOfWeek + 6) % 7;
            $oh = $openingHours->get($dow);

            if (!$oh || $oh->is_closed) {
                $current->addDay();
                continue;
            }

            $openMin = $this->toMin($oh->open_time);
            $closeMin = $this->toMin($oh->close_time);

            foreach ($doctors as $doc) {
                if (count($slots) >= $limit) break;

                $key = $dateStr . '_' . $doc->id;
                $docApts = $appointments->get($key, collect());
                $docBlocks = $relevantBlocksByDoctor[$doc->id];

                for ($min = $openMin; $min + $duration <= $closeMin; $min += $slotInterval) {
                    if (count($slots) >= $limit) break;

                    // Check procedure block constraint
                    // If no relevant blocks exist, allow any time (no block restriction)
                    $inBlock = $docBlocks->isEmpty() || $docBlocks->contains(function ($block) use ($min, $duration) {
                        $blockFrom = $this->toMin($block->time_from);
                        $blockTo = $this->toMin($block->time_to);
                        return $min >= $blockFrom && ($min + $duration) <= $blockTo;
                    });

                    if (!$inBlock) continue;

                    // Check appointment conflicts (overlap check)
                    $conflict = $docApts->contains(function ($apt) use ($min, $duration) {
                        $aptStart = $this->toMin($apt->time);
                        $aptEnd = $aptStart + $apt->duration;
                        return $min < $aptEnd && ($min + $duration) > $aptStart;
                    });

                    if (!$conflict) {
                        $slots[] = [
                            'date'        => $dateStr,
                            'time'        => $this->fromMin($min),
                            'doctorId'    => $doc->id,
                            'doctorName'  => $doc->name,
                            'doctorColor' => $doc->color,
                            'duration'    => $duration,
                        ];
                    }
                }
            }

            $current->addDay();
        }

        return $slots;
    }

    private function toMin(string $time): int
    {
        [$h, $m] = explode(':', $time);
        return (int) $h * 60 + (int) $m;
    }

    private function fromMin(int $m): string
    {
        return sprintf('%02d:%02d', intdiv($m, 60), $m % 60);
    }
}
