/* Ilé Onboarding — app shell, state machine, progress */

const NEED_PROP = ['Landlord', 'Property Owner / Seller'];

/* Fast path to the dashboard: account + role only. Identity/property verification
   is repositioned as an optional, resumable track launched from the Welcome screen
   (and, in the apps, at the trust boundary — making an offer, listing a property,
   moving money). Reaching the dashboard is no longer gated behind full KYC. */
const CORE = ['splash', 'signup', 'otp', 'welcome'];
const VERIFY_ALL = ['id-legal', 'id-upload', 'id-selfie', 'id-status', 'prop-docs', 'prop-status', 'verified'];

function verifyOrder(role) {
  let v = ['id-legal', 'id-upload', 'id-selfie', 'id-status'];
  if (NEED_PROP.includes(role)) v = v.concat(['prop-docs', 'prop-status']);
  v.push('verified');
  return v;
}
function currentOrder(role, screen) {
  return VERIFY_ALL.includes(screen) ? verifyOrder(role) : CORE;
}
function buildPhases(role, screen) {
  if (VERIFY_ALL.includes(screen)) {
    const p = [{ key: 'Identity', screens: ['id-legal', 'id-upload', 'id-selfie', 'id-status'] }];
    if (NEED_PROP.includes(role)) p.push({ key: 'Property', screens: ['prop-docs', 'prop-status'] });
    p.push({ key: 'Verified', screens: ['verified'] });
    return p;
  }
  return [
    { key: 'Account', screens: ['signup', 'otp'] },
    { key: 'Ready', screens: ['welcome'] }
  ];
}

const BrandPanel = () => (
  <aside className="ob-brand">
    <div className="ob-logo">
      <span className="ile-mark"></span>
      <span className="ile-word">Ile</span>
    </div>
    <div className="ile-tagline" style={{ marginTop: 10 }}>Trust-Driven Property<br />Operating System</div>
    <div className="ob-brand-mid">
      <h1 className="ob-headline">Trust is the <em>foundation</em> of every deal.</h1>
      <p style={{ font: 'var(--text-body-lg)', color: 'rgba(255,255,255,.78)', margin: 0, maxWidth: '34ch' }}>
        Nigeria’s property platform where verification and escrow come standard — not as an afterthought.
      </p>
      <div className="ob-trust-list">
        {[['shieldCheck', 'KYC-verified members', 'Identity confirmed against NIMC for every user.'],
          ['lock', 'Escrow-protected payments', 'Funds move only when both sides hit their milestones.'],
          ['building', 'Verified properties', 'Documents cross-checked with the land registry.']].map((f, i) => (
          <div className="ob-trust-item" key={i}>
            <div className="ob-trust-ic"><Icon name={f[0]} /></div>
            <div><h4>{f[1]}</h4><p>{f[2]}</p></div>
          </div>
        ))}
      </div>
      <div className="ob-stat">
        <div><div className="n">₦8.4B+</div><div className="l">secured in escrow</div></div>
        <div><div className="n">100%</div><div className="l">verified listings</div></div>
        <div><div className="n">4.9★</div><div className="l">avg. trust rating</div></div>
      </div>
    </div>
  </aside>
);

function Progress({ phases, phaseIdx }) {
  return (
    <div className="ob-progress">
      <div className="ob-progress-row">
        <span className="ob-step-label"><b>{phases[phaseIdx]?.key}</b></span>
        <span className="ob-step-label">Step {phaseIdx + 1} of {phases.length}</span>
      </div>
      <div className="ob-segs">
        {phases.map((p, i) => (
          <div key={p.key} className={"ob-seg" + (i < phaseIdx ? " done" : i === phaseIdx ? " active" : "")}><div className="fill" /></div>
        ))}
      </div>
    </div>
  );
}

function Toast({ msg }) {
  return <div className={"toast" + (msg ? " show" : "")}>{msg}</div>;
}

function App() {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('grt_onboard') || '{}'); } catch (e) { return {}; } })();
  const [data, setDataRaw] = useState(saved.data || {});
  const [screen, setScreen] = useState(saved.screen || 'splash');
  const [toast, setToast] = useState('');

  useEffect(() => { localStorage.setItem('grt_onboard', JSON.stringify({ data, screen })); }, [data, screen]);

  const setData = patch => setDataRaw(d => ({ ...d, ...patch }));
  const order = currentOrder(data.role, screen);
  const phases = buildPhases(data.role, screen);

  const phaseIdx = (() => {
    const i = phases.findIndex(p => p.screens.includes(screen));
    return i < 0 ? 0 : i;
  })();

  function go(s) { window.scrollTo({ top: 0 }); setScreen(s); }
  function next() { const o = currentOrder(data.role, screen); const i = o.indexOf(screen); if (i < o.length - 1) go(o[i + 1]); }
  function back() {
    if (screen === 'id-legal') { go('welcome'); return; } // first verify step returns to Welcome
    const o = currentOrder(data.role, screen); const i = o.indexOf(screen); if (i > 0) go(o[i - 1]);
  }

  function flash(m) { setToast(m); setTimeout(() => setToast(''), 2600); }
  function restart() { setDataRaw({}); go('splash'); }

  const props = { data, setData, next, back };
  let view;
  switch (screen) {
    case 'splash': view = <SplashScreen {...props} goSignin={() => go('signin')} />; break;
    case 'signin': view = <SignInScreen back={() => go('splash')} onCreate={() => go('splash')} />; break;
    case 'signup': view = <SignUpScreen {...props} />; break;
    case 'otp': view = <OtpScreen {...props} />; break;
    case 'welcome': view = <WelcomeScreen data={data} goVerify={() => go('id-legal')} onEnter={() => flash('Building your ' + (data.role || 'role') + ' dashboard…')} />; break;
    case 'id-legal': view = <IdLegalScreen {...props} />; break;
    case 'id-upload': view = <IdUploadScreen {...props} />; break;
    case 'id-selfie': view = <SelfieScreen {...props} />; break;
    case 'id-status': view = <IdStatusScreen data={data} next={next} />; break;
    case 'prop-docs': view = <PropDocsScreen {...props} />; break;
    case 'prop-status': view = <PropStatusScreen next={next} />; break;
    case 'verified': view = <DoneScreen data={data} onEnter={() => flash('Building your ' + (data.role || 'role') + ' dashboard…')} onRestart={restart} />; break;
    default: view = <SplashScreen {...props} goSignin={() => go('signin')} />;
  }

  const showProgress = screen !== 'splash' && screen !== 'signin';

  return (
    <div className="ob-shell">
      <BrandPanel />
      <main className="ob-stage">
        <div className="ob-topbar">
          <div className="ob-logo">
            <span className="ile-mark"></span>
            <span className="ile-word" style={{ fontSize: '1.05rem' }}>Ile</span>
          </div>
          {showProgress && <span className="ob-step-label">Step {phaseIdx + 1} of {phases.length}</span>}
        </div>
        {showProgress && <Progress phases={phases} phaseIdx={phaseIdx} />}
        <div className="ob-scroll">{view}</div>
      </main>
      <Toast msg={toast} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
