<?php

return [
    // Auth
    'invalid_credentials'    => 'Invalid credentials',
    'old_password_wrong'     => 'Current password is incorrect',
    'password_changed'       => 'Password has been changed',
    'password_restored'      => 'Password has been reset. You can now log in.',

    // 2FA
    '2fa_required'           => '2fa_required',
    'invalid_code'           => 'Invalid code',
    'code_expired_login'     => 'Code expired. Please log in again.',
    'code_sent'              => 'Code sent',
    'wait_before_resend'     => 'Please wait before requesting another code',

    // Forgot / Reset
    'reset_code_sent'        => 'If the email exists, a code has been sent',
    'code_expired_reset'     => 'Code expired. Please request a new one.',

    // Profile
    'unauthorized'           => 'Unauthorized',

    // Pets
    'pet_deleted'            => 'Pet deleted',
    'pet_has_future_apts'    => 'Cannot delete pet with upcoming appointments',

    // Appointments
    'cannot_cancel'          => 'This appointment cannot be cancelled',

    // Email subjects
    'email_register_subject' => 'VetBook — Registration complete',
    'email_2fa_subject'      => 'VetBook — Login code',
    'email_2fa_resend'       => 'VetBook — New login code',
    'email_reset_subject'    => 'VetBook — Password reset',

    // Email bodies
    'email_greeting'         => 'Hello',
    'email_register_body'    => "Your VetBook account has been created.\n\nLogin credentials:\nEmail: :email\nPassword: :password\n\nPlease change your password after your first login.",
    'email_2fa_body'         => "Your VetBook login code: :code\n\nThe code is valid for 10 minutes.\n\nIf you did not attempt to log in, please ignore this email.",
    'email_2fa_resend_body'  => "Your new VetBook login code: :code\n\nThe code is valid for 10 minutes.",
    'email_reset_body'       => "Your VetBook password reset code: :code\n\nThe code is valid for 15 minutes.\n\nIf you did not request a password reset, please ignore this email.",
    'email_regards'          => "Best regards,\nYour veterinary clinic",
];
