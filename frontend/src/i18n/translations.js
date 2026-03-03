/**
 * VetBook i18n — Czech + English translations for public portal.
 * Usage: import { useTranslation } from '../i18n/translations';
 *        const { t, lang, setLang } = useTranslation();
 *        t('login')  →  'Přihlášení' | 'Sign In'
 */
import { useState, useCallback, useMemo } from 'react';

const translations = {
  cs: {
    // App
    subtitle: 'Online objednání na vyšetření',
    loading: 'Načítání...',
    employeeLogin: 'Přihlášení pro zaměstnance',

    // Login
    loginTitle: 'Přihlášení',
    email: 'E-mail',
    password: 'Heslo',
    emailPlaceholder: 'vas@email.cz',
    passwordPlaceholder: 'Vaše heslo',
    loginBtn: 'Přihlásit se',
    forgotPasswordLink: 'Zapomenuté heslo?',
    registerLink: 'Zaregistrujte se',
    invalidCredentials: 'Neplatné údaje',

    // Register
    registerTitle: 'Registrace nového klienta',
    firstName: 'Jméno',
    lastName: 'Příjmení',
    phone: 'Telefon',
    registerBtn: 'Zaregistrovat',
    back: 'Zpět',
    registerError: 'Chyba registrace',

    // Register success
    registerDoneTitle: 'Registrace dokončena',
    accountCreatedFor: 'Účet vytvořen pro',
    yourPassword: 'Vaše heslo',
    passwordNote: 'Heslo si zapište nebo vyfoťte. Zaslali jsme ho i na váš e-mail.',
    loginNow: 'Přihlásit se',

    // 2FA
    twoFaTitle: 'Ověření přihlášení',
    twoFaInfo: 'Na e-mail <strong>:email</strong> jsme odeslali 6-místný ověřovací kód.',
    verificationCode: 'Ověřovací kód',
    enter6digitCode: 'Zadejte 6-místný kód',
    codeExpiresIn: 'Kód vyprší za',
    codeExpired: 'Kód vypršel. Odešlete nový.',
    verifyBtn: 'Ověřit',
    resendIn: 'Odeslat znovu (:seconds s)',
    resendNow: 'Odeslat nový kód',
    newCodeSent: 'Nový kód odeslán na email',
    resendFailed: 'Nepodařilo se odeslat kód',
    backToLogin: 'Zpět na přihlášení',
    invalidCode: 'Neplatný kód',

    // Forgot password
    forgotTitle: 'Zapomenuté heslo',
    forgotInfo: 'Zadejte e-mail a my vám pošleme kód pro obnovení hesla.',
    enterEmail: 'Zadejte email',
    sendCodeBtn: 'Odeslat kód',

    // Reset password
    resetTitle: 'Obnovení hesla',
    resetInfo: 'Na <strong>:email</strong> jsme odeslali kód. Zadejte ho spolu s novým heslem.',
    codeFromEmail: '6-místný kód z e-mailu',
    newPassword: 'Nové heslo (min. 6 znaků)',
    newPasswordAgain: 'Nové heslo znovu',
    setNewPasswordBtn: 'Nastavit nové heslo',
    resendCode: 'Odeslat kód znovu',
    passwordRestored: 'Heslo obnoveno. Přihlaste se.',
    passwordsDontMatch: 'Hesla se neshodují',
    passwordTooShort: 'Heslo musí mít alespoň 6 znaků',

    // Forced password change
    forcedPwTitle: 'Nastavte si nové heslo',
    forcedPwInfo: 'Pro bezpečnost si prosím změňte automaticky vygenerované heslo.',
    currentPassword: 'Aktuální heslo',
    changePasswordBtn: 'Změnit heslo',
    passwordChanged: 'Heslo úspěšně změněno',
    passwordChangedShort: 'Heslo bylo změněno',
    changePasswordError: 'Chyba při změně hesla',

    // Tabs
    tabDashboard: 'Přehled',
    tabPets: 'Mazlíčci',
    tabBook: 'Objednat',
    tabProfile: 'Profil',

    // Dashboard
    greeting: 'Dobrý den, :name!',
    upcomingOne: 'Máte :count nadcházející objednávku.',
    upcomingFew: 'Máte :count nadcházející objednávky.',
    upcomingMany: 'Máte :count nadcházejících objednávek.',
    noUpcoming: 'Nemáte žádné nadcházející objednávky.',
    upcomingTitle: 'Nadcházející objednávky',
    noUpcomingApts: 'Žádné nadcházející objednávky.',
    bookNow: 'Objednat se',
    historyTitle: 'Historie',
    moreApts: 'a dalších :count objednávek...',
    cancelBtn: 'Zrušit',

    // Pets
    myPetsTitle: 'Moji mazlíčci',
    noPetsYet: 'Zatím nemáte žádné zvíře.',
    addPetBtn: 'Přidat zvíře',
    addBtn: '+ Přidat',
    editBtn: 'Upravit',
    deleteBtn: 'Smazat',
    addPetTitle: 'Přidat zvíře',
    editPetTitle: 'Upravit zvíře',
    petName: 'Jméno',
    petNamePlaceholder: 'Rex',
    species: 'Druh',
    selectSpecies: '— vyberte —',
    breed: 'Plemeno (nepovinné)',
    breedPlaceholder: 'Labrador',
    cancelModalBtn: 'Zrušit',
    saveBtn: 'Uložit',
    fillNameAndSpecies: 'Vyplňte jméno a druh',
    petAdded: 'Zvíře přidáno',
    petEdited: 'Zvíře upraveno',
    confirmDeletePet: 'Opravdu chcete smazat :name?',
    petDeleted: ':name smazán/a',
    cannotDelete: 'Nelze smazat',

    // Species
    speciesDog: 'Pes',
    speciesCat: 'Kočka',
    speciesRabbit: 'Králík',
    speciesGuineaPig: 'Morče',
    speciesParrot: 'Papoušek',
    speciesSnake: 'Had',
    speciesOther: 'Ostatní',

    // Booking
    bookingTitle: 'Žádost o termín',
    addPetFirst: 'Nejprve přidejte zvíře v záložce Mazlíčci.',
    selectAnimal: 'Zvíře',
    selectAnimalPlaceholder: '— vyberte —',
    selectProcedure: 'Procedura',
    selectProcedurePlaceholder: '— vyberte typ vyšetření —',
    preferredDoctor: 'Preferovaný lékař (nepovinné)',
    noPreference: 'Bez preference',
    selectedSlot: '✓ Vybraný termín:',
    problemDescription: 'Popis problému',
    problemPlaceholder: 'Popište příznaky...',
    bookingWarning: '⚠️ Jedná se o <strong>žádost</strong> — termín potvrdí recepce.',
    submitBooking: 'Odeslat žádost',
    submitting: 'Odesílám...',
    bookingSubmitted: 'Žádost o termín odeslána!',
    bookingError: 'Chyba při odesílání',
    confirmCancelApt: 'Opravdu chcete zrušit tuto objednávku?',
    aptCancelled: 'Objednávka zrušena',
    cannotCancel: 'Nelze zrušit',

    // Profile
    profileTitle: 'Můj profil',
    cancelEditBtn: 'Zrušit',
    saveProfileBtn: 'Uložit',
    profileSaved: 'Profil uložen',
    changePasswordTitle: 'Změna hesla',
    logoutBtn: 'Odhlásit se',
    error: 'Chyba',
  },
  en: {
    // App
    subtitle: 'Online veterinary appointment booking',
    loading: 'Loading...',
    employeeLogin: 'Employee login',

    // Login
    loginTitle: 'Sign In',
    email: 'Email',
    password: 'Password',
    emailPlaceholder: 'your@email.com',
    passwordPlaceholder: 'Your password',
    loginBtn: 'Sign In',
    forgotPasswordLink: 'Forgot password?',
    registerLink: 'Register',
    invalidCredentials: 'Invalid credentials',

    // Register
    registerTitle: 'New Client Registration',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone',
    registerBtn: 'Register',
    back: 'Back',
    registerError: 'Registration error',

    // Register success
    registerDoneTitle: 'Registration Complete',
    accountCreatedFor: 'Account created for',
    yourPassword: 'Your password',
    passwordNote: 'Write down or screenshot your password. We also sent it to your email.',
    loginNow: 'Sign In',

    // 2FA
    twoFaTitle: 'Login Verification',
    twoFaInfo: 'We sent a 6-digit verification code to <strong>:email</strong>.',
    verificationCode: 'Verification code',
    enter6digitCode: 'Enter the 6-digit code',
    codeExpiresIn: 'Code expires in',
    codeExpired: 'Code expired. Send a new one.',
    verifyBtn: 'Verify',
    resendIn: 'Resend (:seconds s)',
    resendNow: 'Send new code',
    newCodeSent: 'New code sent to email',
    resendFailed: 'Failed to send code',
    backToLogin: 'Back to login',
    invalidCode: 'Invalid code',

    // Forgot password
    forgotTitle: 'Forgot Password',
    forgotInfo: 'Enter your email and we will send you a reset code.',
    enterEmail: 'Enter email',
    sendCodeBtn: 'Send Code',

    // Reset password
    resetTitle: 'Reset Password',
    resetInfo: 'We sent a code to <strong>:email</strong>. Enter it along with your new password.',
    codeFromEmail: '6-digit code from email',
    newPassword: 'New password (min. 6 characters)',
    newPasswordAgain: 'Confirm new password',
    setNewPasswordBtn: 'Set New Password',
    resendCode: 'Resend code',
    passwordRestored: 'Password reset. You can now sign in.',
    passwordsDontMatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters',

    // Forced password change
    forcedPwTitle: 'Set a New Password',
    forcedPwInfo: 'For security, please change your auto-generated password.',
    currentPassword: 'Current password',
    changePasswordBtn: 'Change Password',
    passwordChanged: 'Password changed successfully',
    passwordChangedShort: 'Password has been changed',
    changePasswordError: 'Error changing password',

    // Tabs
    tabDashboard: 'Dashboard',
    tabPets: 'Pets',
    tabBook: 'Book',
    tabProfile: 'Profile',

    // Dashboard
    greeting: 'Hello, :name!',
    upcomingOne: 'You have :count upcoming appointment.',
    upcomingFew: 'You have :count upcoming appointments.',
    upcomingMany: 'You have :count upcoming appointments.',
    noUpcoming: 'No upcoming appointments.',
    upcomingTitle: 'Upcoming Appointments',
    noUpcomingApts: 'No upcoming appointments.',
    bookNow: 'Book Now',
    historyTitle: 'History',
    moreApts: 'and :count more...',
    cancelBtn: 'Cancel',

    // Pets
    myPetsTitle: 'My Pets',
    noPetsYet: 'You have no pets yet.',
    addPetBtn: 'Add Pet',
    addBtn: '+ Add',
    editBtn: 'Edit',
    deleteBtn: 'Delete',
    addPetTitle: 'Add Pet',
    editPetTitle: 'Edit Pet',
    petName: 'Name',
    petNamePlaceholder: 'Rex',
    species: 'Species',
    selectSpecies: '— select —',
    breed: 'Breed (optional)',
    breedPlaceholder: 'Labrador',
    cancelModalBtn: 'Cancel',
    saveBtn: 'Save',
    fillNameAndSpecies: 'Fill in name and species',
    petAdded: 'Pet added',
    petEdited: 'Pet updated',
    confirmDeletePet: 'Are you sure you want to delete :name?',
    petDeleted: ':name deleted',
    cannotDelete: 'Cannot delete',

    // Species
    speciesDog: 'Dog',
    speciesCat: 'Cat',
    speciesRabbit: 'Rabbit',
    speciesGuineaPig: 'Guinea Pig',
    speciesParrot: 'Parrot',
    speciesSnake: 'Snake',
    speciesOther: 'Other',

    // Booking
    bookingTitle: 'Appointment Request',
    addPetFirst: 'First add a pet in the Pets tab.',
    selectAnimal: 'Pet',
    selectAnimalPlaceholder: '— select —',
    selectProcedure: 'Procedure',
    selectProcedurePlaceholder: '— select procedure type —',
    preferredDoctor: 'Preferred doctor (optional)',
    noPreference: 'No preference',
    selectedSlot: '✓ Selected slot:',
    problemDescription: 'Problem description',
    problemPlaceholder: 'Describe symptoms...',
    bookingWarning: '⚠️ This is a <strong>request</strong> — the reception will confirm the appointment.',
    submitBooking: 'Submit Request',
    submitting: 'Submitting...',
    bookingSubmitted: 'Appointment request submitted!',
    bookingError: 'Error submitting request',
    confirmCancelApt: 'Are you sure you want to cancel this appointment?',
    aptCancelled: 'Appointment cancelled',
    cannotCancel: 'Cannot cancel',

    // Profile
    profileTitle: 'My Profile',
    cancelEditBtn: 'Cancel',
    saveProfileBtn: 'Save',
    profileSaved: 'Profile saved',
    changePasswordTitle: 'Change Password',
    logoutBtn: 'Sign Out',
    error: 'Error',
  },
};

/**
 * Simple translation hook.
 * Stores language in localStorage('vetbook_lang'), default 'cs'.
 */
export function useTranslation() {
  const [lang, setLangState] = useState(() => localStorage.getItem('vetbook_lang') || 'cs');

  const setLang = useCallback((newLang) => {
    localStorage.setItem('vetbook_lang', newLang);
    setLangState(newLang);
  }, []);

  const t = useCallback((key, params) => {
    let str = translations[lang]?.[key] || translations.cs[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`:${k}`, v);
      });
    }
    return str;
  }, [lang]);

  const speciesOptions = useMemo(() => [
    { value: 'pes', label: t('speciesDog') },
    { value: 'kočka', label: t('speciesCat') },
    { value: 'králík', label: t('speciesRabbit') },
    { value: 'morče', label: t('speciesGuineaPig') },
    { value: 'papoušek', label: t('speciesParrot') },
    { value: 'had', label: t('speciesSnake') },
    { value: 'ostatní', label: t('speciesOther') },
  ], [lang, t]);

  const tabs = useMemo(() => [
    { key: 'dashboard', label: t('tabDashboard'), icon: '🏠' },
    { key: 'pets', label: t('tabPets'), icon: '🐾' },
    { key: 'book', label: t('tabBook'), icon: '📅' },
    { key: 'profile', label: t('tabProfile'), icon: '👤' },
  ], [lang, t]);

  return { t, lang, setLang, speciesOptions, tabs };
}

export default translations;
