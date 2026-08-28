import React, { useState } from 'react';

export function Auth({ close, login }) {
  const [mode, setMode] = useState('password');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isHuman, setIsHuman] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function clearError() {
    if (errorMsg) setErrorMsg('');
  }

  function handlePasswordLogin(e) {
    e.preventDefault();
    clearError();

    if (!name.trim() || name.trim().length < 3) {
      return setErrorMsg('Please enter a valid username or email (minimum 3 characters).');
    }
    if (!password.trim() || password.trim().length < 4) {
      return setErrorMsg('Please enter a valid password (minimum 4 characters).');
    }
    if (!isHuman) {
      return setErrorMsg('Please check the "Are you human?" verification to log in.');
    }

    login({ name: name.trim(), provider: 'Username & Password' });
  }

  function handleSendOtp(e) {
    e.preventDefault();
    clearError();

    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      return setErrorMsg('Please enter a valid 10-digit Indian phone number.');
    }
    if (!isHuman) {
      return setErrorMsg('Please check the "Are you human?" verification to continue.');
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setOtpSent(true);
    setOtp('');
    setErrorMsg('');
  }

  function handleVerifyOtp(e) {
    e.preventDefault();
    clearError();

    if (!otp || otp.length !== 6) {
      return setErrorMsg('Please enter the complete 6-digit OTP.');
    }
    if (otp !== generatedOtp) {
      return setErrorMsg('Incorrect OTP! Please enter the demo code shown below.');
    }

    login({ name: 'User ' + phone.slice(-4), phone, provider: 'Phone' });
  }

  function handleSocialLogin(providerName, defaultUser) {
    if (!isHuman) {
      return setErrorMsg(`Please check the "Are you human?" box before continuing with ${providerName}.`);
    }
    login({ name: defaultUser, provider: providerName });
  }

  return (
    <div className="overlay" onClick={close}>
      <form
        className="auth"
        onSubmit={
          mode === 'password'
            ? handlePasswordLogin
            : mode === 'phone'
            ? otpSent
              ? handleVerifyOtp
              : handleSendOtp
            : e => e.preventDefault()
        }
        onClick={e => e.stopPropagation()}
      >
        <button type="button" className="x" onClick={close} aria-label="Close modal">×</button>
        <div className="logo">shopkart<span>+</span></div>
        <h2>{mode === 'phone' ? (otpSent ? 'Verify OTP' : 'Continue with phone number') : ''}</h2>

        {/* Visible Error Banner on wrong/invalid entries */}
        {errorMsg && (
          <div className="authErrorBanner">
            <span className="errorIcon">⚠️</span>
            <span className="errorText">{errorMsg}</span>
          </div>
        )}

        {mode === 'password' && (
          <>
            <input
              value={name}
              onChange={e => { setName(e.target.value); clearError(); }}
              placeholder="Username or email (min 3 chars)"
            />
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); clearError(); }}
              placeholder="Password (min 4 chars)"
            />

            {/* "Are you human?" Interactive Verification Checkbox */}
            <div
              className={`humanVerify ${isHuman ? 'verified' : ''}`}
              onClick={() => { setIsHuman(!isHuman); clearError(); }}
            >
              <div className="verifyCheckbox">
                <input
                  type="checkbox"
                  id="humanCheck"
                  checked={isHuman}
                  onChange={e => { setIsHuman(e.target.checked); clearError(); }}
                  onClick={e => e.stopPropagation()}
                />
                <span className="verifyCheckCustom">{isHuman ? '✓' : ''}</span>
              </div>
              <label htmlFor="humanCheck" className="verifyLabel">
                Are you human?
              </label>
              {isHuman && (
                <span className="verifyBadge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Verified
                </span>
              )}
            </div>

            <button className="loginPrimary" type="submit">Login</button>
          </>
        )}

        {mode === 'phone' && !otpSent && (
          <>
            <input
              inputMode="numeric"
              maxLength="10"
              value={phone}
              onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); clearError(); }}
              placeholder="Phone number (10 digits)"
            />

            {/* "Are you human?" Interactive Verification Checkbox */}
            <div
              className={`humanVerify ${isHuman ? 'verified' : ''}`}
              onClick={() => { setIsHuman(!isHuman); clearError(); }}
            >
              <div className="verifyCheckbox">
                <input
                  type="checkbox"
                  id="humanCheckPhone"
                  checked={isHuman}
                  onChange={e => { setIsHuman(e.target.checked); clearError(); }}
                  onClick={e => e.stopPropagation()}
                />
                <span className="verifyCheckCustom">{isHuman ? '✓' : ''}</span>
              </div>
              <label htmlFor="humanCheckPhone" className="verifyLabel">
                Are you human?
              </label>
              {isHuman && (
                <span className="verifyBadge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Verified
                </span>
              )}
            </div>

            <button className="loginPrimary" type="submit">Continue with phone number</button>
          </>
        )}

        {mode === 'phone' && otpSent && (
          <>
            <div className="otpPhone">OTP sent to +91 {phone}</div>
            <input
              inputMode="numeric"
              maxLength="6"
              value={otp}
              onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); clearError(); }}
              placeholder="Enter 6-digit OTP"
            />
            <div className="demoOtp">Demo OTP: <b>{generatedOtp}</b></div>
            <button className="loginPrimary" type="submit">Verify OTP & Login</button>
            <button type="button" className="resend" onClick={handleSendOtp}>Generate new OTP</button>
          </>
        )}

        {mode !== 'phone' && (
          <>
            <div className="or"><span>or</span></div>
            <button type="button" className="social phone" onClick={() => { setMode('phone'); setOtpSent(false); clearError(); }}>
              <b>☎</b> Continue with phone number
            </button>
            <button type="button" className="social google" onClick={() => handleSocialLogin('Google', 'Google User')}>
              <b>G</b> Continue with Google
            </button>
            <button type="button" className="social apple" onClick={() => handleSocialLogin('Apple', 'Apple User')}>
              <b></b> Continue with Apple
            </button>
            <button type="button" className="social ai" onClick={() => handleSocialLogin('AI Cart', 'AI User')}>
              <b>✦</b> Continue with AI Cart
            </button>
          </>
        )}

        {mode === 'phone' && (
          <button type="button" className="backAuth" onClick={() => { setMode('password'); setOtpSent(false); clearError(); }}>
            ← Back to username & password
          </button>
        )}
      </form>
    </div>
  );
}

export default Auth;
