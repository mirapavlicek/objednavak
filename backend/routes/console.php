<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('sms:reminders')->everyMinute();
