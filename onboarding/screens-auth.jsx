/* Ilé Onboarding — Auth & Role screens */

/* ---------------- Splash (Welcome + role selection in one) ---------------- */
function SplashScreen({ data, setData, next, goSignin }) {
  const [sel, setSel] = useState(data.role || '');
  function choose(r) { setSel(r); setData({ role: r }); }
  return (
    <div className="ob-card ob-fade" style={{ maxWidth: 520 }}>
      <div className="ile-lockup" style={{ marginBottom: 18, textAlign: 'center' }}>
        <div className="ile-row" style={{ justifyContent: 'center' }}><span className="ile-mark" style={{ width: 20, height: 48 }}></span><span className="ile-word" style={{ fontSize: '1.9rem' }}>Ile</span></div>
      </div>
      <div className="ob-eyebrow">Welcome to Ilé</div>
      <h1 className="ob-title">What brings you to Ilé?</h1>
      <p className="ob-desc">Pick how you’ll use Ilé and we’ll set up the right workspace — you’ll be inside in under a minute.</p>

      <div className="role-grid">
        {ROLES.map(r => (
          <button key={r[0]} className={"role-card" + (sel === r[0] ? " sel" : "")} onClick={() => choose(r[0])}>
            <div className="role-ic"><Icon name={r[1]} /></div>
            <div className="role-meta"><h4>{r[0]}</h4><p>{r[2]}</p></div>
            <div className="role-check"><Icon name="check" /></div>
          </button>
        ))}
      </div>

      <button className="btn btn-primary btn-lg btn-block" disabled={!sel} onClick={next} style={{ marginTop: 22 }}>
        Continue as {sel || '…'}<Icon name="arrowRight" />
      </button>
      <button className="btn btn-ghost btn-block" style={{ marginTop: 10 }} onClick={goSignin}>I already have an account</button>
      <SecureNote>Licensed escrow partner · NDPR compliant</SecureNote>
    </div>
  );
}

/* ---------------- Sign Up ---------------- */
function SignUpScreen({ data, setData, next, back }) {
  const [method, setMethod] = useState('email');
  const [touched, setTouched] = useState(false);
  const emailOk = /\S+@\S+\.\S+/.test(data.email || '');
  const phoneOk = (data.phone || '').replace(/\D/g, '').length >= 10;
  const pwOk = (data.password || '').length >= 8;
  const valid = (method === 'email' ? emailOk : phoneOk) && pwOk;

  function submit() {
    setTouched(true);
    if (valid) next();
  }
  return (
    <div className="ob-card ob-fade">
      <button className="ob-back" onClick={back}><Icon name="arrowLeft" />Back</button>
      <div className="ob-eyebrow">Create your account</div>
      <h1 className="ob-title">One step and you’re in</h1>
      <p className="ob-desc">Create your account and head straight to your dashboard. You can verify your identity later, whenever you’re ready to transact.</p>

      <div className="oauth-row" style={{ marginBottom: 4, gridTemplateColumns: '1fr' }}>
        <button className="oauth-btn"><span className="oauth-mark" style={{ background: '#4285F4' }}>G</span>Google</button>
      </div>
      <div className="ob-or">or sign up with</div>

      <div className="seg-toggle">
        <button className={method === 'email' ? 'active' : ''} onClick={() => setMethod('email')}><Icon name="mail" />Email</button>
        <button className={method === 'phone' ? 'active' : ''} onClick={() => setMethod('phone')}><Icon name="phone" />Phone</button>
      </div>

      {method === 'email' ? (
        <Field label="Email address" req error={touched && !emailOk ? 'Enter a valid email address.' : ''}>
          <TextInput type="email" placeholder="you@example.com" value={data.email || ''}
            error={touched && !emailOk} onChange={e => setData({ email: e.target.value })} />
        </Field>
      ) : (
        <Field label="Phone number" req error={touched && !phoneOk ? 'Enter a valid Nigerian phone number.' : ''}>
          <TextInput type="tel" prefix="+234" placeholder="801 234 5678" value={data.phone || ''}
            error={touched && !phoneOk} onChange={e => setData({ phone: e.target.value })} />
        </Field>
      )}

      <Field label="Create password" req hint="At least 8 characters." error={touched && !pwOk ? 'Password must be at least 8 characters.' : ''}>
        <TextInput type="password" placeholder="••••••••" value={data.password || ''}
          error={touched && !pwOk} onChange={e => setData({ password: e.target.value })} />
      </Field>

      <button className="btn btn-primary btn-lg btn-block" onClick={submit} style={{ marginTop: 8 }}>
        Send verification code<Icon name="arrowRight" />
      </button>
      <SecureNote>By continuing you agree to our Terms & Privacy Policy.</SecureNote>
    </div>
  );
}

/* ---------------- OTP ---------------- */
function OtpScreen({ data, setData, next, back }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [secs, setSecs] = useState(42);
  const target = data.email ? data.email : '+234 ' + (data.phone || '801 234 5678');

  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [secs]);

  function verify() {
    if (code.replace(/\s/g, '').length < 6) { setError('Enter the full 6-digit code.'); return; }
    setError('');
    next();
  }
  return (
    <div className="ob-card ob-fade">
      <button className="ob-back" onClick={back}><Icon name="arrowLeft" />Back</button>
      <div className="ob-eyebrow">Create your account</div>
      <h1 className="ob-title">Enter your code</h1>
      <p className="ob-desc">We sent a 6-digit code to <b style={{ color: 'var(--ink-800)' }}>{target}</b>. Enter it below to confirm it’s really you.</p>

      <OtpInput value={code} onChange={v => { setCode(v); setError(''); }} error={!!error} />
      {error && <span className="field-error" style={{ marginTop: 4 }}><Icon name="alertCircle" />{error}</span>}

      <div style={{ marginTop: 18, font: 'var(--text-sm)', color: 'var(--ink-500)' }}>
        {secs > 0
          ? <span style={{ color: 'var(--ink-500)' }}>Resend code in <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-800)' }}>0:{String(secs).padStart(2, '0')}</b></span>
          : <button className="btn btn-ghost btn-sm" style={{ padding: 0, color: 'var(--primary)' }} onClick={() => setSecs(42)}>Resend code</button>}
      </div>

      <button className="btn btn-primary btn-lg btn-block" onClick={verify} style={{ marginTop: 24 }}>
        Verify & continue<Icon name="arrowRight" />
      </button>
      <SecureNote>Codes expire in 10 minutes and are single-use.</SecureNote>
    </div>
  );
}

/* ---------------- Roles (used by the splash) ---------------- */
const ROLES = [
  ['Renter', 'compass', 'Find and rent verified homes, pay rent in escrow, and manage your lease.'],
  ['Landlord', 'building', 'List units, screen tenants, collect rent and handle maintenance.'],
  ['Property Owner / Seller', 'store', 'Sell verified property with escrow-protected, documented transactions.'],
  ['Property Buyer', 'key', 'Discover, make offers and buy property safely through escrow.'],
  ['Realtor', 'briefcase', 'Manage listings, leads and deals; track commissions and your brokerage.'],
  ['Agent', 'users', 'Support viewings, leads and field operations on behalf of a brokerage.']
];

/* ---------------- Sign In (returning users) ---------------- */
function SignInScreen({ back, onCreate }) {
  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const idOk = method === 'email' ? /\S+@\S+\.\S+/.test(email) : phone.replace(/\D/g, '').length >= 10;
  const pwOk = password.length > 0;
  const valid = idOk && pwOk;

  function submit() {
    setTouched(true);
    if (valid) window.location.href = 'GetRentos Home.html';
  }
  return (
    <div className="ob-card ob-fade">
      <button className="ob-back" onClick={back}><Icon name="arrowLeft" />Back</button>
      <div className="ob-eyebrow">Welcome back</div>
      <h1 className="ob-title">Sign in to Ilé</h1>
      <p className="ob-desc">Enter your details to pick up where you left off — your workspaces, trust score and escrow activity are waiting.</p>

      <div className="oauth-row" style={{ marginBottom: 4, gridTemplateColumns: '1fr' }}>
        <button className="oauth-btn" onClick={() => window.location.href = 'GetRentos Home.html'}><span className="oauth-mark" style={{ background: '#4285F4' }}>G</span>Continue with Google</button>
      </div>
      <div className="ob-or">or sign in with</div>

      <div className="seg-toggle">
        <button className={method === 'email' ? 'active' : ''} onClick={() => setMethod('email')}><Icon name="mail" />Email</button>
        <button className={method === 'phone' ? 'active' : ''} onClick={() => setMethod('phone')}><Icon name="phone" />Phone</button>
      </div>

      {method === 'email' ? (
        <Field label="Email address" req error={touched && !idOk ? 'Enter a valid email address.' : ''}>
          <TextInput type="email" placeholder="you@example.com" value={email}
            error={touched && !idOk} onChange={e => setEmail(e.target.value)} />
        </Field>
      ) : (
        <Field label="Phone number" req error={touched && !idOk ? 'Enter a valid Nigerian phone number.' : ''}>
          <TextInput type="tel" prefix="+234" placeholder="801 234 5678" value={phone}
            error={touched && !idOk} onChange={e => setPhone(e.target.value)} />
        </Field>
      )}

      <Field label="Password" req error={touched && !pwOk ? 'Enter your password.' : ''}>
        <TextInput type="password" placeholder="••••••••" value={password}
          error={touched && !pwOk} onChange={e => setPassword(e.target.value)} />
      </Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -6, marginBottom: 6 }}>
        <button className="btn btn-ghost btn-sm" style={{ padding: 0, color: 'var(--primary)' }} onClick={() => {}}>Forgot password?</button>
      </div>

      <button className="btn btn-primary btn-lg btn-block" onClick={submit} style={{ marginTop: 8 }}>
        Sign in<Icon name="arrowRight" />
      </button>
      <div style={{ textAlign: 'center', marginTop: 16, font: 'var(--text-sm)', color: 'var(--ink-500)' }}>
        New to Ilé? <button className="btn btn-ghost btn-sm" style={{ padding: 0, color: 'var(--primary)', fontWeight: 600 }} onClick={onCreate}>Create an account</button>
      </div>
      <SecureNote>Protected by bank-grade encryption · NDPR compliant</SecureNote>
    </div>
  );
}

Object.assign(window, { SplashScreen, SignInScreen, SignUpScreen, OtpScreen, ROLES });
