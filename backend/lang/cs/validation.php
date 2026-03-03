<?php

return [
    'accepted'             => 'Pole :attribute musí být přijato.',
    'active_url'           => 'Pole :attribute není platnou URL adresou.',
    'after'                => 'Pole :attribute musí být datum po :date.',
    'after_or_equal'       => 'Pole :attribute musí být datum :date nebo pozdější.',
    'alpha'                => 'Pole :attribute může obsahovat pouze písmena.',
    'alpha_dash'           => 'Pole :attribute může obsahovat pouze písmena, číslice, pomlčky a podtržítka.',
    'alpha_num'            => 'Pole :attribute může obsahovat pouze písmena a číslice.',
    'array'                => 'Pole :attribute musí být pole.',
    'before'               => 'Pole :attribute musí být datum před :date.',
    'before_or_equal'      => 'Pole :attribute musí být datum :date nebo dřívější.',
    'between'              => [
        'numeric' => 'Pole :attribute musí být mezi :min a :max.',
        'file'    => 'Pole :attribute musí být mezi :min a :max kilobajty.',
        'string'  => 'Pole :attribute musí mít mezi :min a :max znaky.',
        'array'   => 'Pole :attribute musí mít mezi :min a :max položkami.',
    ],
    'boolean'              => 'Pole :attribute musí být true nebo false.',
    'confirmed'            => 'Potvrzení pole :attribute se neshoduje.',
    'date'                 => 'Pole :attribute není platné datum.',
    'date_equals'          => 'Pole :attribute musí být datum :date.',
    'date_format'          => 'Pole :attribute neodpovídá formátu :format.',
    'different'            => 'Pole :attribute a :other musí být odlišné.',
    'digits'               => 'Pole :attribute musí mít :digits číslic.',
    'digits_between'       => 'Pole :attribute musí mít mezi :min a :max číslicemi.',
    'email'                => 'Pole :attribute musí být platná e-mailová adresa.',
    'ends_with'            => 'Pole :attribute musí končit jednou z hodnot: :values.',
    'exists'               => 'Zvolená hodnota pro :attribute je neplatná.',
    'file'                 => 'Pole :attribute musí být soubor.',
    'filled'               => 'Pole :attribute musí být vyplněno.',
    'gt'                   => [
        'numeric' => 'Pole :attribute musí být větší než :value.',
        'file'    => 'Pole :attribute musí být větší než :value kilobajtů.',
        'string'  => 'Pole :attribute musí mít více než :value znaků.',
        'array'   => 'Pole :attribute musí mít více než :value položek.',
    ],
    'gte'                  => [
        'numeric' => 'Pole :attribute musí být větší nebo rovno :value.',
        'file'    => 'Pole :attribute musí být větší nebo rovno :value kilobajtů.',
        'string'  => 'Pole :attribute musí mít alespoň :value znaků.',
        'array'   => 'Pole :attribute musí mít alespoň :value položek.',
    ],
    'image'                => 'Pole :attribute musí být obrázek.',
    'in'                   => 'Zvolená hodnota pro :attribute je neplatná.',
    'in_array'             => 'Pole :attribute neexistuje v :other.',
    'integer'              => 'Pole :attribute musí být celé číslo.',
    'ip'                   => 'Pole :attribute musí být platná IP adresa.',
    'json'                 => 'Pole :attribute musí být platný JSON řetězec.',
    'lt'                   => [
        'numeric' => 'Pole :attribute musí být menší než :value.',
        'file'    => 'Pole :attribute musí být menší než :value kilobajtů.',
        'string'  => 'Pole :attribute musí mít méně než :value znaků.',
        'array'   => 'Pole :attribute musí mít méně než :value položek.',
    ],
    'lte'                  => [
        'numeric' => 'Pole :attribute musí být menší nebo rovno :value.',
        'file'    => 'Pole :attribute musí být menší nebo rovno :value kilobajtů.',
        'string'  => 'Pole :attribute musí mít nejvýše :value znaků.',
        'array'   => 'Pole :attribute nesmí mít více než :value položek.',
    ],
    'max'                  => [
        'numeric' => 'Pole :attribute nesmí být větší než :max.',
        'file'    => 'Pole :attribute nesmí být větší než :max kilobajtů.',
        'string'  => 'Pole :attribute nesmí mít více než :max znaků.',
        'array'   => 'Pole :attribute nesmí mít více než :max položek.',
    ],
    'mimes'                => 'Pole :attribute musí být soubor typu: :values.',
    'mimetypes'            => 'Pole :attribute musí být soubor typu: :values.',
    'min'                  => [
        'numeric' => 'Pole :attribute musí být alespoň :min.',
        'file'    => 'Pole :attribute musí mít alespoň :min kilobajtů.',
        'string'  => 'Pole :attribute musí mít alespoň :min znaků.',
        'array'   => 'Pole :attribute musí mít alespoň :min položek.',
    ],
    'not_in'               => 'Zvolená hodnota pro :attribute je neplatná.',
    'not_regex'            => 'Formát pole :attribute je neplatný.',
    'numeric'              => 'Pole :attribute musí být číslo.',
    'present'              => 'Pole :attribute musí být přítomno.',
    'regex'                => 'Formát pole :attribute je neplatný.',
    'required'             => 'Pole :attribute je povinné.',
    'required_if'          => 'Pole :attribute je povinné, pokud :other je :value.',
    'required_unless'      => 'Pole :attribute je povinné, pokud :other není :values.',
    'required_with'        => 'Pole :attribute je povinné, pokud je přítomno :values.',
    'required_with_all'    => 'Pole :attribute je povinné, pokud jsou přítomny :values.',
    'required_without'     => 'Pole :attribute je povinné, pokud není přítomno :values.',
    'required_without_all' => 'Pole :attribute je povinné, pokud nejsou přítomny žádné z :values.',
    'same'                 => 'Pole :attribute a :other se musí shodovat.',
    'size'                 => [
        'numeric' => 'Pole :attribute musí být :size.',
        'file'    => 'Pole :attribute musí mít :size kilobajtů.',
        'string'  => 'Pole :attribute musí mít :size znaků.',
        'array'   => 'Pole :attribute musí obsahovat :size položek.',
    ],
    'starts_with'          => 'Pole :attribute musí začínat jednou z hodnot: :values.',
    'string'               => 'Pole :attribute musí být řetězec.',
    'timezone'             => 'Pole :attribute musí být platná časová zóna.',
    'unique'               => 'Hodnota pole :attribute je již obsazena.',
    'url'                  => 'Formát pole :attribute je neplatný.',
    'uuid'                 => 'Pole :attribute musí být platný UUID.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    */

    'custom' => [
        'code' => [
            'required' => 'Zadejte ověřovací kód.',
            'size'     => 'Kód musí mít přesně :size znaků.',
        ],
        'email' => [
            'required' => 'Zadejte e-mailovou adresu.',
            'email'    => 'Zadejte platnou e-mailovou adresu.',
            'unique'   => 'Tento e-mail je již registrován.',
        ],
        'password' => [
            'required' => 'Zadejte heslo.',
            'min'      => 'Heslo musí mít alespoň :min znaků.',
        ],
        'new_password' => [
            'required'  => 'Zadejte nové heslo.',
            'min'       => 'Heslo musí mít alespoň :min znaků.',
            'confirmed' => 'Hesla se neshodují.',
        ],
        'old_password' => [
            'required' => 'Zadejte aktuální heslo.',
        ],
        'first_name' => [
            'required' => 'Zadejte jméno.',
        ],
        'last_name' => [
            'required' => 'Zadejte příjmení.',
        ],
        'phone' => [
            'required' => 'Zadejte telefonní číslo.',
        ],
        'name' => [
            'required' => 'Zadejte jméno zvířete.',
        ],
        'species' => [
            'required' => 'Vyberte druh zvířete.',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    */

    'attributes' => [
        'email'        => 'e-mail',
        'password'     => 'heslo',
        'old_password' => 'aktuální heslo',
        'new_password' => 'nové heslo',
        'first_name'   => 'jméno',
        'last_name'    => 'příjmení',
        'phone'        => 'telefon',
        'name'         => 'jméno',
        'species'      => 'druh',
        'breed'        => 'plemeno',
        'code'         => 'kód',
        'date'         => 'datum',
        'time'         => 'čas',
        'note'         => 'poznámka',
    ],
];
