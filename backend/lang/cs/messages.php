<?php

return [
    // Auth
    'invalid_credentials'    => 'Neplatné přihlašovací údaje',
    'old_password_wrong'     => 'Staré heslo je nesprávné',
    'password_changed'       => 'Heslo bylo změněno',
    'password_restored'      => 'Heslo bylo obnoveno. Nyní se můžete přihlásit.',

    // 2FA
    '2fa_required'           => '2fa_required',
    'invalid_code'           => 'Neplatný kód',
    'code_expired_login'     => 'Kód vypršel. Přihlaste se znovu.',
    'code_sent'              => 'Kód odeslán',
    'wait_before_resend'     => 'Počkejte prosím před dalším odesláním',

    // Forgot / Reset
    'reset_code_sent'        => 'Pokud email existuje, kód byl odeslán',
    'code_expired_reset'     => 'Kód vypršel. Požádejte o nový.',

    // Profile
    'unauthorized'           => 'Neautorizováno',

    // Pets
    'pet_deleted'            => 'Zvíře smazáno',
    'pet_has_future_apts'    => 'Nelze smazat zvíře s budoucími objednávkami',

    // Appointments
    'cannot_cancel'          => 'Tuto objednávku nelze zrušit',

    // Email subjects
    'email_register_subject' => 'VetBook — Registrace dokončena',
    'email_2fa_subject'      => 'VetBook — Přihlašovací kód',
    'email_2fa_resend'       => 'VetBook — Nový přihlašovací kód',
    'email_reset_subject'    => 'VetBook — Obnovení hesla',

    // Email bodies
    'email_greeting'         => 'Dobrý den',
    'email_register_body'    => "Váš účet ve VetBook byl vytvořen.\n\nPřihlašovací údaje:\nE-mail: :email\nHeslo: :password\n\nPo prvním přihlášení si prosím heslo změňte.",
    'email_2fa_body'         => "Váš přihlašovací kód pro VetBook: :code\n\nKód platí 10 minut.\n\nPokud jste se nepokoušeli přihlásit, ignorujte tento email.",
    'email_2fa_resend_body'  => "Váš nový přihlašovací kód pro VetBook: :code\n\nKód platí 10 minut.",
    'email_reset_body'       => "Váš kód pro obnovení hesla ve VetBook: :code\n\nKód platí 15 minut.\n\nPokud jste o obnovení hesla nežádali, ignorujte tento email.",
    'email_regards'          => "S pozdravem,\nVaše veterinární klinika",
];
