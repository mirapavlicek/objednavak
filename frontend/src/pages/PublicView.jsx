import { useState, useEffect, useCallback } from 'react';
import { theme, FONT, MONO, PROCEDURES, STATUSES } from '../utils/constants';
import { getTomorrow } from '../utils/time';
import { Btn, Input, Select, Card, Modal, Icon } from '../components/ui';
import StatusBadge from '../components/ui/StatusBadge';
import InlineSlotPicker from '../components/appointments/InlineSlotPicker';
import {
  publicRegister, publicLogin, getMyPets, getMyAppointments,
  submitBookingRequest, getPublicDoctors,
  changePassword, updateProfile, createPet, updatePet, deletePet,
  cancelAppointment, verifyTwoFactor, resendTwoFactor,
  forgotPassword, resetPassword,
} from '../api/publicPortal';
import { useTranslation } from '../i18n/translations';

export default function PublicView() {
  const { t, lang, setLang, speciesOptions, tabs } = useTranslation();

  // Auth state
  const [step, setStep] = useState(() => localStorage.getItem('vetbook_public_token') ? 'loading' : 'login');
  const [client, setClient] = useState(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data
  const [myPets, setMyPets] = useState([]);
  const [myApts, setMyApts] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Login/Register
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [regResult, setRegResult] = useState(null);
  const [regError, setRegError] = useState('');

  // Booking
  const [form, setForm] = useState({ petId: '', procedureId: '', date: getTomorrow(), time: '', note: '', doctorId: '' });
  const [saving, setSaving] = useState(false);

  // Modals & UI
  const [petModal, setPetModal] = useState(null);
  const [petForm, setPetForm] = useState({ name: '', species: '', breed: '' });
  const [petError, setPetError] = useState('');
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [profileError, setProfileError] = useState('');

  // Password change
  const [pwForm, setPwForm] = useState({ old: '', new_: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // 2FA
  const [twoFaEmail, setTwoFaEmail] = useState('');
  const [twoFaCode, setTwoFaCode] = useState(['', '', '', '', '', '']);
  const [twoFaError, setTwoFaError] = useState('');
  const [twoFaCountdown, setTwoFaCountdown] = useState(0);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Forgot / Reset password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [resetForm, setResetForm] = useState({ code: '', newPassword: '', confirm: '' });
  const [resetError, setResetError] = useState('');

  // Notification toast
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (notification) {
      const tm = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(tm);
    }
  }, [notification]);

  // 2FA countdown (10 min)
  useEffect(() => {
    if (twoFaCountdown <= 0) return;
    const tm = setInterval(() => setTwoFaCountdown(c => c <= 1 ? 0 : c - 1), 1000);
    return () => clearInterval(tm);
  }, [twoFaCountdown > 0]);

  // Resend cooldown (60s)
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const tm = setInterval(() => setResendCountdown(c => c <= 1 ? 0 : c - 1), 1000);
    return () => clearInterval(tm);
  }, [resendCountdown > 0]);

  const loadData = useCallback(async () => {
    try {
      const [petsRes, aptsRes, docsRes] = await Promise.all([
        getMyPets(), getMyAppointments(), getPublicDoctors(),
      ]);
      setMyPets(petsRes.data.data || petsRes.data || []);
      setMyApts(aptsRes.data.data || aptsRes.data || []);
      setDoctors(docsRes.data.data || docsRes.data || []);
    } catch {
      localStorage.removeItem('vetbook_public_token');
      setStep('login');
    }
  }, []);

  useEffect(() => {
    if (step === 'loading') {
      (async () => {
        try {
          const [petsRes, aptsRes, docsRes] = await Promise.all([
            getMyPets(), getMyAppointments(), getPublicDoctors(),
          ]);
          setMyPets(petsRes.data.data || petsRes.data || []);
          setMyApts(aptsRes.data.data || aptsRes.data || []);
          setDoctors(docsRes.data.data || docsRes.data || []);
          setStep('app');
        } catch {
          localStorage.removeItem('vetbook_public_token');
          setStep('login');
        }
      })();
    }
  }, [step]);

  // --- Handlers ---

  const handleLogin = async () => {
    setLoginError('');
    try {
      const res = await publicLogin(loginEmail, loginPass);
      if (res.data.status === '2fa_required') {
        setTwoFaEmail(res.data.email);
        setTwoFaCode(['', '', '', '', '', '']);
        setTwoFaError('');
        setTwoFaCountdown(600);
        setResendCountdown(60);
        setStep('2fa');
      } else {
        localStorage.setItem('vetbook_public_token', res.data.token);
        setClient(res.data.client);
        if (res.data.mustChangePassword) {
          setMustChangePassword(true);
          setStep('password');
        } else {
          await loadData();
          setStep('app');
        }
      }
    } catch (err) {
      setLoginError(err.response?.data?.message || t('invalidCredentials'));
    }
  };

  const handleVerify2FA = async () => {
    setTwoFaError('');
    const code = twoFaCode.join('');
    if (code.length !== 6) {
      setTwoFaError(t('enter6digitCode'));
      return;
    }
    try {
      const res = await verifyTwoFactor(twoFaEmail, code);
      localStorage.setItem('vetbook_public_token', res.data.token);
      setClient(res.data.client);
      if (res.data.mustChangePassword) {
        setMustChangePassword(true);
        setStep('password');
      } else {
        await loadData();
        setStep('app');
      }
    } catch (err) {
      setTwoFaError(err.response?.data?.message || t('invalidCode'));
      setTwoFaCode(['', '', '', '', '', '']);
    }
  };

  const handleResend2FA = async () => {
    try {
      await resendTwoFactor(twoFaEmail);
      setTwoFaCountdown(600);
      setResendCountdown(60);
      setTwoFaCode(['', '', '', '', '', '']);
      setNotification({ type: 'success', message: t('newCodeSent') });
    } catch (err) {
      setTwoFaError(err.response?.data?.message || t('resendFailed'));
    }
  };

  const handleForgotPassword = async () => {
    setForgotError('');
    if (!forgotEmail) {
      setForgotError(t('enterEmail'));
      return;
    }
    try {
      await forgotPassword(forgotEmail);
      setForgotSent(true);
      setStep('reset');
    } catch (err) {
      setForgotError(err.response?.data?.message || t('error'));
    }
  };

  const handleResetPassword = async () => {
    setResetError('');
    if (resetForm.newPassword !== resetForm.confirm) {
      setResetError(t('passwordsDontMatch'));
      return;
    }
    if (resetForm.newPassword.length < 6) {
      setResetError(t('passwordTooShort'));
      return;
    }
    try {
      await resetPassword({
        email: forgotEmail,
        code: resetForm.code,
        new_password: resetForm.newPassword,
        new_password_confirmation: resetForm.confirm,
      });
      setNotification({ type: 'success', message: t('passwordRestored') });
      setResetForm({ code: '', newPassword: '', confirm: '' });
      setForgotSent(false);
      setStep('login');
    } catch (err) {
      setResetError(err.response?.data?.message || t('invalidCode'));
    }
  };

  const handleRegister = async () => {
    setRegError('');
    try {
      const res = await publicRegister({
        first_name: regForm.firstName,
        last_name: regForm.lastName,
        phone: regForm.phone,
        email: regForm.email,
      });
      setRegResult(res.data);
    } catch (err) {
      setRegError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat().join(', ') || t('registerError'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vetbook_public_token');
    setClient(null);
    setMyPets([]);
    setMyApts([]);
    setStep('login');
  };

  const handleChangePassword = async () => {
    setPwError('');
    if (pwForm.new_ !== pwForm.confirm) {
      setPwError(t('passwordsDontMatch'));
      return;
    }
    if (pwForm.new_.length < 6) {
      setPwError(t('passwordTooShort'));
      return;
    }
    try {
      await changePassword({
        old_password: pwForm.old,
        new_password: pwForm.new_,
        new_password_confirmation: pwForm.confirm,
      });
      setMustChangePassword(false);
      setPwForm({ old: '', new_: '', confirm: '' });
      if (step === 'password') {
        await loadData();
        setStep('app');
        setNotification({ type: 'success', message: t('passwordChanged') });
      } else {
        setPwSuccess(t('passwordChangedShort'));
        setTimeout(() => setPwSuccess(''), 3000);
      }
    } catch (err) {
      setPwError(err.response?.data?.message || t('changePasswordError'));
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await submitBookingRequest({
        pet_id: form.petId,
        procedure_id: form.procedureId,
        doctor_id: form.doctorId || null,
        date: form.date,
        time: form.time,
        note: form.note,
      });
      setForm({ petId: '', procedureId: '', date: getTomorrow(), time: '', note: '', doctorId: '' });
      await loadData();
      setActiveTab('dashboard');
      setNotification({ type: 'success', message: t('bookingSubmitted') });
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || t('bookingError') });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePet = async () => {
    setPetError('');
    if (!petForm.name || !petForm.species) {
      setPetError(t('fillNameAndSpecies'));
      return;
    }
    try {
      if (petModal.mode === 'add') {
        await createPet({ name: petForm.name, species: petForm.species, breed: petForm.breed || null });
      } else {
        await updatePet(petModal.pet.id, { name: petForm.name, species: petForm.species, breed: petForm.breed || null });
      }
      await loadData();
      setPetModal(null);
      setNotification({ type: 'success', message: petModal.mode === 'add' ? t('petAdded') : t('petEdited') });
    } catch (err) {
      setPetError(err.response?.data?.message || t('error'));
    }
  };

  const handleDeletePet = async (pet) => {
    if (!confirm(t('confirmDeletePet', { name: pet.name }))) return;
    try {
      await deletePet(pet.id);
      await loadData();
      setNotification({ type: 'success', message: t('petDeleted', { name: pet.name }) });
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || t('cannotDelete') });
    }
  };

  const handleCancelApt = async (apt) => {
    if (!confirm(t('confirmCancelApt'))) return;
    try {
      await cancelAppointment(apt.id);
      await loadData();
      setNotification({ type: 'success', message: t('aptCancelled') });
    } catch (err) {
      setNotification({ type: 'error', message: err.response?.data?.message || t('cannotCancel') });
    }
  };

  const handleSaveProfile = async () => {
    setProfileError('');
    try {
      const res = await updateProfile({
        first_name: profileForm.firstName,
        last_name: profileForm.lastName,
        phone: profileForm.phone,
        email: profileForm.email,
      });
      setClient(res.data.data || res.data);
      setProfileEdit(false);
      setNotification({ type: 'success', message: t('profileSaved') });
    } catch (err) {
      setProfileError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat().join(', ') || t('error'));
    }
  };

  // --- Computed ---

  const today = new Date().toISOString().split('T')[0];
  const upcomingApts = myApts.filter(a =>
    a.date >= today && ['pending', 'confirmed', 'arrived', 'in_progress'].includes(a.status)
  ).sort((a, b) => a.date === b.date ? (a.time || '').localeCompare(b.time || '') : a.date.localeCompare(b.date));

  const pastApts = myApts.filter(a =>
    a.date < today || ['completed', 'rejected', 'no_show', 'cancelled'].includes(a.status)
  ).sort((a, b) => b.date === a.date ? (b.time || '').localeCompare(a.time || '') : b.date.localeCompare(a.date));

  const upcomingLabel = upcomingApts.length === 0 ? t('noUpcoming')
    : upcomingApts.length === 1 ? t('upcomingOne', { count: 1 })
    : upcomingApts.length < 5 ? t('upcomingFew', { count: upcomingApts.length })
    : t('upcomingMany', { count: upcomingApts.length });

  // --- Language switcher ---

  const LangSwitcher = () => (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 8 }}>
      {['cs', 'en'].map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: '3px 10px', fontSize: 12, fontWeight: lang === l ? 700 : 400,
            fontFamily: FONT, border: `1.5px solid ${lang === l ? theme.accent : theme.border}`,
            borderRadius: 12, cursor: 'pointer',
            background: lang === l ? theme.accent : 'transparent',
            color: lang === l ? 'white' : theme.textSecondary,
            transition: 'all 0.15s',
          }}
        >
          {l === 'cs' ? '🇨🇿 CZ' : '🇬🇧 EN'}
        </button>
      ))}
    </div>
  );

  // --- Render helpers ---

  const AptRow = ({ apt, showCancel }) => {
    const proc = PROCEDURES.find(p => p.id === apt.procedureId);
    const canCancel = showCancel && ['pending', 'confirmed'].includes(apt.status);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: theme.radiusSm, border: `1px solid ${theme.borderLight}`, background: theme.surface }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, minWidth: 90, color: theme.text }}>
          {apt.date}<br /><span style={{ color: theme.textSecondary }}>{apt.time}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {apt.pet?.name || '—'} — {proc?.name || apt.procedureId}
          </div>
          {apt.doctor && <div style={{ fontSize: 12, color: theme.textSecondary }}>{apt.doctor.name}</div>}
          {apt.note && <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.note}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <StatusBadge status={apt.status} />
          {canCancel && (
            <Btn variant="ghost" size="sm" onClick={() => handleCancelApt(apt)}
              style={{ color: theme.danger, fontSize: 11, padding: '2px 8px' }}>{t('cancelBtn')}</Btn>
          )}
        </div>
      </div>
    );
  };

  // --- RENDER ---

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, fontFamily: FONT }}>
      {/* Toast notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 2000,
          padding: '10px 20px', borderRadius: theme.radius,
          background: notification.type === 'success' ? theme.successLight : theme.dangerLight,
          color: notification.type === 'success' ? theme.success : theme.danger,
          border: `1.5px solid ${notification.type === 'success' ? theme.success : theme.danger}30`,
          fontSize: 14, fontWeight: 600, fontFamily: FONT,
          boxShadow: theme.shadowMd, animation: 'slideUp 0.3s ease-out',
        }}>
          {notification.type === 'success' ? '✓' : '!'} {notification.message}
        </div>
      )}

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🐾</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>VetBook</h1>
          <p style={{ color: theme.textSecondary, fontSize: 15 }}>{t('subtitle')}</p>
          <LangSwitcher />
        </div>

        {/* LOADING */}
        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: 40, color: theme.textMuted }}>{t('loading')}</div>
        )}

        {/* LOGIN */}
        {step === 'login' && (
          <Card title={t('loginTitle')} accent={theme.accent}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label={t('email')} required icon="user" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder={t('emailPlaceholder')}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              <Input label={t('password')} required type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder={t('passwordPlaceholder')}
                onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              {loginError && <div style={{ padding: 10, background: theme.dangerLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.danger }}>{loginError}</div>}
              <Btn onClick={handleLogin} style={{ width: '100%' }}>{t('loginBtn')}</Btn>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: theme.textMuted }}>
                <span onClick={() => { setForgotEmail(loginEmail); setForgotError(''); setForgotSent(false); setStep('forgot'); }}
                  style={{ color: theme.textSecondary, cursor: 'pointer' }}>{t('forgotPasswordLink')}</span>
                <span>
                  <span onClick={() => setStep('register')} style={{ color: theme.accent, cursor: 'pointer', fontWeight: 600 }}>{t('registerLink')}</span>
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* REGISTER */}
        {step === 'register' && !regResult && (
          <Card title={t('registerTitle')} accent={theme.accent}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}><Input label={t('firstName')} required value={regForm.firstName} onChange={e => setRegForm({ ...regForm, firstName: e.target.value })} /></div>
                <div style={{ flex: 1 }}><Input label={t('lastName')} required value={regForm.lastName} onChange={e => setRegForm({ ...regForm, lastName: e.target.value })} /></div>
              </div>
              <Input label={t('phone')} required icon="phone" placeholder="+420 ..." value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} />
              <Input label={t('email')} required icon="user" placeholder={t('emailPlaceholder')} value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
              {regError && <div style={{ padding: 10, background: theme.dangerLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.danger }}>{regError}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <Btn variant="ghost" onClick={() => setStep('login')}>{t('back')}</Btn>
                <Btn onClick={handleRegister} style={{ flex: 1 }} disabled={!regForm.firstName || !regForm.lastName || !regForm.phone || !regForm.email}>{t('registerBtn')}</Btn>
              </div>
            </div>
          </Card>
        )}

        {/* REGISTER SUCCESS */}
        {step === 'register' && regResult && (
          <Card title={t('registerDoneTitle')} accent={theme.success}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 40 }}>✅</div>
              <p style={{ fontSize: 14, color: theme.textSecondary }}>{t('accountCreatedFor')} <strong>{regResult.client?.firstName} {regResult.client?.lastName}</strong></p>
              <div style={{ padding: 14, background: theme.successLight, borderRadius: theme.radius, border: `1.5px solid ${theme.success}30` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.success, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{t('yourPassword')}</div>
                <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 800, color: theme.text, letterSpacing: '0.1em', padding: '8px 0', userSelect: 'all' }}>{regResult.generatedPassword}</div>
                <div style={{ fontSize: 11, color: theme.textSecondary, marginTop: 4 }}>{t('passwordNote')}</div>
              </div>
              <Btn onClick={() => { setRegResult(null); setStep('login'); setLoginEmail(regForm.email); }} style={{ width: '100%' }}>{t('loginNow')}</Btn>
            </div>
          </Card>
        )}

        {/* 2FA VERIFICATION */}
        {step === '2fa' && (
          <Card title={t('twoFaTitle')} accent={theme.accent}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: 12, background: theme.accentLight || '#eff6ff', borderRadius: theme.radiusSm, fontSize: 13, color: theme.accent }}
                dangerouslySetInnerHTML={{ __html: t('twoFaInfo', { email: twoFaEmail }) }} />

              {/* 6-digit code input */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{t('verificationCode')}</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  {twoFaCode.map((digit, i) => (
                    <input
                      key={i}
                      id={`2fa-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      style={{
                        width: 44, height: 52, textAlign: 'center', fontSize: 22, fontWeight: 700,
                        fontFamily: MONO, border: `2px solid ${digit ? theme.accent : theme.border}`,
                        borderRadius: theme.radiusSm, outline: 'none', background: theme.surface,
                        transition: 'border-color 0.15s',
                      }}
                      onFocus={e => e.target.select()}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (!val && !e.nativeEvent.inputType?.includes('delete')) return;
                        const newCode = [...twoFaCode];
                        newCode[i] = val.slice(-1);
                        setTwoFaCode(newCode);
                        if (val && i < 5) document.getElementById(`2fa-${i + 1}`)?.focus();
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Backspace' && !twoFaCode[i] && i > 0) {
                          const newCode = [...twoFaCode];
                          newCode[i - 1] = '';
                          setTwoFaCode(newCode);
                          document.getElementById(`2fa-${i - 1}`)?.focus();
                        }
                        if (e.key === 'Enter' && twoFaCode.join('').length === 6) handleVerify2FA();
                      }}
                      onPaste={e => {
                        e.preventDefault();
                        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                        if (pasted.length > 0) {
                          const newCode = [...twoFaCode];
                          for (let j = 0; j < 6; j++) newCode[j] = pasted[j] || '';
                          setTwoFaCode(newCode);
                          const focusIdx = Math.min(pasted.length, 5);
                          document.getElementById(`2fa-${focusIdx}`)?.focus();
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Countdown */}
              {twoFaCountdown > 0 && (
                <div style={{ textAlign: 'center', fontSize: 12, color: twoFaCountdown < 60 ? theme.danger : theme.textMuted, fontFamily: MONO }}>
                  {t('codeExpiresIn')} {Math.floor(twoFaCountdown / 60)}:{String(twoFaCountdown % 60).padStart(2, '0')}
                </div>
              )}
              {twoFaCountdown === 0 && step === '2fa' && (
                <div style={{ textAlign: 'center', fontSize: 12, color: theme.danger }}>
                  {t('codeExpired')}
                </div>
              )}

              {twoFaError && <div style={{ padding: 10, background: theme.dangerLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.danger }}>{twoFaError}</div>}

              <Btn onClick={handleVerify2FA} style={{ width: '100%' }}
                disabled={twoFaCode.join('').length !== 6}>{t('verifyBtn')}</Btn>

              <div style={{ textAlign: 'center', fontSize: 13 }}>
                {resendCountdown > 0 ? (
                  <span style={{ color: theme.textMuted }}>{t('resendIn', { seconds: resendCountdown })}</span>
                ) : (
                  <span onClick={handleResend2FA} style={{ color: theme.accent, cursor: 'pointer', fontWeight: 600 }}>{t('resendNow')}</span>
                )}
              </div>

              <div style={{ textAlign: 'center' }}>
                <span onClick={() => setStep('login')} style={{ fontSize: 12, color: theme.textMuted, cursor: 'pointer' }}>{t('backToLogin')}</span>
              </div>
            </div>
          </Card>
        )}

        {/* FORGOT PASSWORD */}
        {step === 'forgot' && (
          <Card title={t('forgotTitle')} accent={theme.warning}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: 12, background: theme.warningLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.warning }}>
                {t('forgotInfo')}
              </div>
              <Input label={t('email')} required icon="user" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder={t('emailPlaceholder')}
                onKeyDown={e => e.key === 'Enter' && handleForgotPassword()} />
              {forgotError && <div style={{ padding: 10, background: theme.dangerLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.danger }}>{forgotError}</div>}
              <Btn onClick={handleForgotPassword} style={{ width: '100%' }} disabled={!forgotEmail}>{t('sendCodeBtn')}</Btn>
              <div style={{ textAlign: 'center' }}>
                <span onClick={() => setStep('login')} style={{ fontSize: 13, color: theme.textMuted, cursor: 'pointer' }}>{t('backToLogin')}</span>
              </div>
            </div>
          </Card>
        )}

        {/* RESET PASSWORD */}
        {step === 'reset' && (
          <Card title={t('resetTitle')} accent={theme.accent}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: 12, background: theme.accentLight || '#eff6ff', borderRadius: theme.radiusSm, fontSize: 13, color: theme.accent }}
                dangerouslySetInnerHTML={{ __html: t('resetInfo', { email: forgotEmail }) }} />
              <Input label={t('codeFromEmail')} required value={resetForm.code} onChange={e => setResetForm({ ...resetForm, code: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                placeholder="123456" style={{ fontFamily: MONO, fontSize: 18, letterSpacing: '0.15em', textAlign: 'center' }} />
              <Input label={t('newPassword')} required type="password" value={resetForm.newPassword} onChange={e => setResetForm({ ...resetForm, newPassword: e.target.value })} />
              <Input label={t('newPasswordAgain')} required type="password" value={resetForm.confirm} onChange={e => setResetForm({ ...resetForm, confirm: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleResetPassword()} />
              {resetError && <div style={{ padding: 10, background: theme.dangerLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.danger }}>{resetError}</div>}
              <Btn onClick={handleResetPassword} style={{ width: '100%' }}
                disabled={!resetForm.code || !resetForm.newPassword || !resetForm.confirm}>{t('setNewPasswordBtn')}</Btn>
              <div style={{ textAlign: 'center' }}>
                <span onClick={() => { setForgotSent(false); setStep('forgot'); }} style={{ fontSize: 13, color: theme.textMuted, cursor: 'pointer' }}>{t('resendCode')}</span>
                {' · '}
                <span onClick={() => setStep('login')} style={{ fontSize: 13, color: theme.textMuted, cursor: 'pointer' }}>{t('backToLogin')}</span>
              </div>
            </div>
          </Card>
        )}

        {/* FORCED PASSWORD CHANGE */}
        {step === 'password' && (
          <Card title={t('forcedPwTitle')} accent={theme.warning}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: 12, background: theme.warningLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.warning }}>
                {t('forcedPwInfo')}
              </div>
              <Input label={t('currentPassword')} required type="password" value={pwForm.old} onChange={e => setPwForm({ ...pwForm, old: e.target.value })} />
              <Input label={t('newPassword')} required type="password" value={pwForm.new_} onChange={e => setPwForm({ ...pwForm, new_: e.target.value })} />
              <Input label={t('newPasswordAgain')} required type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleChangePassword()} />
              {pwError && <div style={{ padding: 10, background: theme.dangerLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.danger }}>{pwError}</div>}
              <Btn onClick={handleChangePassword} style={{ width: '100%' }} disabled={!pwForm.old || !pwForm.new_ || !pwForm.confirm}>{t('changePasswordBtn')}</Btn>
            </div>
          </Card>
        )}

        {/* ===== DASHBOARD (app) ===== */}
        {step === 'app' && (
          <>
            {/* Tab navigation */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: theme.surface, padding: 4, borderRadius: theme.radius, border: `1px solid ${theme.border}` }}>
              {tabs.map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                  flex: 1, padding: '10px 4px', fontSize: 13, fontWeight: 600, fontFamily: FONT,
                  border: 'none', borderRadius: theme.radiusSm, cursor: 'pointer',
                  background: activeTab === tab.key ? theme.accent : 'transparent',
                  color: activeTab === tab.key ? 'white' : theme.textSecondary,
                  transition: 'all 0.15s',
                }}>
                  <span style={{ marginRight: 4 }}>{tab.icon}</span>{tab.label}
                </button>
              ))}
            </div>

            {/* TAB: Dashboard */}
            {activeTab === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Card accent={theme.accent}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>
                    {t('greeting', { name: client?.firstName || (lang === 'cs' ? 'zákazníku' : 'customer') })}
                  </div>
                  <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>
                    {upcomingLabel}
                  </div>
                </Card>

                <Card title={`${t('upcomingTitle')} (${upcomingApts.length})`}
                  action={<Btn size="sm" onClick={() => setActiveTab('book')}>+ {t('bookNow')}</Btn>}>
                  {upcomingApts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: theme.textMuted, fontSize: 13 }}>
                      {t('noUpcomingApts')}
                      <div style={{ marginTop: 8 }}>
                        <Btn size="sm" onClick={() => setActiveTab('book')}>{t('bookNow')}</Btn>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {upcomingApts.map(a => <AptRow key={a.id} apt={a} showCancel />)}
                    </div>
                  )}
                </Card>

                {pastApts.length > 0 && (
                  <Card title={`${t('historyTitle')} (${pastApts.length})`}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {pastApts.slice(0, 10).map(a => <AptRow key={a.id} apt={a} />)}
                      {pastApts.length > 10 && (
                        <div style={{ textAlign: 'center', fontSize: 12, color: theme.textMuted, padding: 8 }}>
                          {t('moreApts', { count: pastApts.length - 10 })}
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* TAB: Pets */}
            {activeTab === 'pets' && (
              <Card title={`${t('myPetsTitle')} (${myPets.length})`}
                action={<Btn size="sm" onClick={() => { setPetForm({ name: '', species: '', breed: '' }); setPetError(''); setPetModal({ mode: 'add' }); }}>{t('addBtn')}</Btn>}>
                {myPets.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: theme.textMuted, fontSize: 13 }}>
                    {t('noPetsYet')}
                    <div style={{ marginTop: 8 }}>
                      <Btn size="sm" onClick={() => { setPetForm({ name: '', species: '', breed: '' }); setPetError(''); setPetModal({ mode: 'add' }); }}>{t('addPetBtn')}</Btn>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {myPets.map(pet => (
                      <div key={pet.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: theme.radiusSm, border: `1px solid ${theme.borderLight}` }}>
                        <div style={{ fontSize: 24 }}>🐾</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{pet.name}</div>
                          <div style={{ fontSize: 12, color: theme.textSecondary }}>{pet.species}{pet.breed ? ` — ${pet.breed}` : ''}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <Btn variant="ghost" size="sm" onClick={() => {
                            setPetForm({ name: pet.name, species: pet.species, breed: pet.breed || '' });
                            setPetError('');
                            setPetModal({ mode: 'edit', pet });
                          }}>{t('editBtn')}</Btn>
                          <Btn variant="ghost" size="sm" onClick={() => handleDeletePet(pet)}
                            style={{ color: theme.danger }}>{t('deleteBtn')}</Btn>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* TAB: Booking */}
            {activeTab === 'book' && (
              <Card title={t('bookingTitle')} accent={theme.accent}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {myPets.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: theme.textMuted, fontSize: 13 }}>
                      {t('addPetFirst')}
                      <div style={{ marginTop: 8 }}>
                        <Btn size="sm" onClick={() => setActiveTab('pets')}>{t('addPetBtn')}</Btn>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Select label={t('selectAnimal')} required value={form.petId} onChange={e => setForm({ ...form, petId: e.target.value })}>
                        <option value="">{t('selectAnimalPlaceholder')}</option>
                        {myPets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
                      </Select>
                      <Select label={t('selectProcedure')} required value={form.procedureId} onChange={e => setForm({ ...form, procedureId: e.target.value, time: '' })}>
                        <option value="">{t('selectProcedurePlaceholder')}</option>
                        {['prevence', 'diagnostika', 'chirurgie', 'specialni', 'ostatni'].map(cat =>
                          <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
                            {PROCEDURES.filter(p => p.category === cat && p.id !== 'emergency').map(p =>
                              <option key={p.id} value={p.id}>{p.name} ({p.duration} min)</option>
                            )}
                          </optgroup>
                        )}
                      </Select>
                      <Select label={t('preferredDoctor')} value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>
                        <option value="">{t('noPreference')}</option>
                        {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </Select>

                      {form.procedureId && (
                        <InlineSlotPicker
                          procedureId={form.procedureId}
                          doctorId={form.doctorId}
                          selectedDate={form.date}
                          selectedTime={form.time}
                          onSelect={s => setForm({ ...form, date: s.date, time: s.time, doctorId: s.doctorId || form.doctorId })}
                        />
                      )}

                      {form.time && (
                        <div style={{ padding: 10, background: theme.successLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.success, fontWeight: 600 }}>
                          {t('selectedSlot')} <span style={{ fontFamily: MONO }}>{form.date} {form.time}</span>
                          {form.doctorId && doctors.length > 0 && <span> — {doctors.find(d => String(d.id) === String(form.doctorId))?.name}</span>}
                        </div>
                      )}

                      <Input label={t('problemDescription')} textarea icon="edit" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} placeholder={t('problemPlaceholder')} />
                      <div style={{ padding: 12, background: theme.warningLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.warning }}
                        dangerouslySetInnerHTML={{ __html: t('bookingWarning') }} />
                      <Btn icon="send" disabled={!form.petId || !form.procedureId || !form.time || saving} onClick={handleSubmit} style={{ width: '100%' }}>
                        {saving ? t('submitting') : t('submitBooking')}
                      </Btn>
                    </>
                  )}
                </div>
              </Card>
            )}

            {/* TAB: Profile */}
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Card title={t('profileTitle')}>
                  {!profileEdit ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700 }}>{client?.firstName} {client?.lastName}</div>
                        <div style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>{client?.phone}</div>
                        <div style={{ fontSize: 13, color: theme.textSecondary }}>{client?.email}</div>
                      </div>
                      <Btn variant="ghost" size="sm" onClick={() => {
                        setProfileForm({
                          firstName: client?.firstName || '',
                          lastName: client?.lastName || '',
                          phone: client?.phone || '',
                          email: client?.email || '',
                        });
                        setProfileError('');
                        setProfileEdit(true);
                      }}>{t('editBtn')}</Btn>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1 }}><Input label={t('firstName')} required value={profileForm.firstName} onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} /></div>
                        <div style={{ flex: 1 }}><Input label={t('lastName')} required value={profileForm.lastName} onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} /></div>
                      </div>
                      <Input label={t('phone')} required value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                      <Input label={t('email')} required value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
                      {profileError && <div style={{ padding: 10, background: theme.dangerLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.danger }}>{profileError}</div>}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Btn variant="ghost" onClick={() => setProfileEdit(false)}>{t('cancelEditBtn')}</Btn>
                        <Btn onClick={handleSaveProfile} style={{ flex: 1 }}>{t('saveProfileBtn')}</Btn>
                      </div>
                    </div>
                  )}
                </Card>

                <Card title={t('changePasswordTitle')}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <Input label={t('currentPassword')} required type="password" value={pwForm.old} onChange={e => setPwForm({ ...pwForm, old: e.target.value })} />
                    <Input label={t('newPassword')} required type="password" value={pwForm.new_} onChange={e => setPwForm({ ...pwForm, new_: e.target.value })} />
                    <Input label={t('newPasswordAgain')} required type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} />
                    {pwError && <div style={{ padding: 10, background: theme.dangerLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.danger }}>{pwError}</div>}
                    {pwSuccess && <div style={{ padding: 10, background: theme.successLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.success }}>{pwSuccess}</div>}
                    <Btn onClick={handleChangePassword} disabled={!pwForm.old || !pwForm.new_ || !pwForm.confirm}>{t('changePasswordBtn')}</Btn>
                  </div>
                </Card>

                <Btn variant="ghost" onClick={handleLogout} style={{ width: '100%' }}>
                  {t('logoutBtn')}
                </Btn>
              </div>
            )}
          </>
        )}

        {/* Pet Modal */}
        {petModal && (
          <Modal title={petModal.mode === 'add' ? t('addPetTitle') : t('editPetTitle')} onClose={() => setPetModal(null)}
            footer={<>
              <Btn variant="ghost" onClick={() => setPetModal(null)}>{t('cancelModalBtn')}</Btn>
              <Btn onClick={handleSavePet}>{t('saveBtn')}</Btn>
            </>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label={t('petName')} required value={petForm.name} onChange={e => setPetForm({ ...petForm, name: e.target.value })} placeholder={t('petNamePlaceholder')} />
              <Select label={t('species')} required value={petForm.species} onChange={e => setPetForm({ ...petForm, species: e.target.value })}>
                <option value="">{t('selectSpecies')}</option>
                {speciesOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
              <Input label={t('breed')} value={petForm.breed} onChange={e => setPetForm({ ...petForm, breed: e.target.value })} placeholder={t('breedPlaceholder')} />
              {petError && <div style={{ padding: 10, background: theme.dangerLight, borderRadius: theme.radiusSm, fontSize: 13, color: theme.danger }}>{petError}</div>}
            </div>
          </Modal>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 32, paddingBottom: 20 }}>
          <a href="/admin" style={{ fontSize: 12, color: theme.textMuted, textDecoration: 'none' }}>
            {t('employeeLogin')}
          </a>
        </div>
      </div>
    </div>
  );
}
