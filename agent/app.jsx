/* Ilé Agent — app shell & router */

function AgentApp() {
  const saved0 = (() => { try { return JSON.parse(localStorage.getItem('grt_agent') || '{}'); } catch (e) { return {}; } })();
  const [route, setRoute] = useState({ page: 'today', id: null });
  const [verified, setVerified] = useState(saved0.verified === true);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState('');
  const toastT = useRef(null);
  const pending = useRef(null);

  useEffect(() => { localStorage.setItem('grt_agent', JSON.stringify({ verified })); }, [verified]);

  function go(page, id) { setRoute({ page, id: id || null }); setDrawer(false); document.querySelector('.content')?.scrollTo(0, 0); }
  function flash(m) { setToast(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 2200); }

  /* Trust boundary: claiming field work, logging completed jobs (which release the
     field fee), and messaging require a verified identity. */
  function requireVerified(fn) { if (verified) { fn && fn(); return; } pending.current = fn || null; setVerifyOpen(true); }
  function openVerify() { pending.current = null; setVerifyOpen(true); }
  function completeVerify() {
    setVerified(true); setVerifyOpen(false);
    flash('Identity verified — full access unlocked');
    const fn = pending.current; pending.current = null;
    if (fn) setTimeout(fn, 360);
  }
  function resetVerify() { setVerified(false); flash('Reset to unverified (demo)'); }
  function signOut() { try { localStorage.removeItem('grt_onboard'); } catch (e) {} window.location.href = 'GetRentos Onboarding.html'; }
  const ctx = { route, go, toast: flash, verified, requireVerified, openVerify, resetVerify, signOut };

  let page;
  switch (route.page) {
    case 'today': page = <Today ctx={ctx} />; break;
    case 'schedule': page = <Schedule ctx={ctx} />; break;
    case 'tasks': page = <Tasks ctx={ctx} />; break;
    case 'leads': page = <Leads ctx={ctx} />; break;
    case 'listings': page = <Listings ctx={ctx} />; break;
    case 'findwork': page = <FindWork ctx={ctx} />; break;
    case 'earnings': page = <Earnings ctx={ctx} />; break;
    case 'messages': page = <Messages ctx={ctx} />; break;
    case 'settings': page = <Settings ctx={ctx} />; break;
    default: page = <Today ctx={ctx} />;
  }

  const badges = {
    messages: window.AD.threads.reduce((n, t) => n + t.unread, 0),
    tasks: window.AD.getTasks().filter(t => t.status !== 'Done').length,
    schedule: window.AD.viewings.filter(v => v.date === 'Today' && v.status !== 'Completed').length,
    findwork: window.AD.allInvites().length
  };

  return (
    <div className={"app" + (drawer ? " drawer-open" : "")}>
      <div className="drawer-scrim" onClick={() => setDrawer(false)}></div>
      <Sidebar route={route.page} onNav={go} badges={badges} verified={verified} onVerify={openVerify} />
      <div className="app-main">
        <TopBar onMenu={() => setDrawer(d => !d)} onNav={go} onSignOut={signOut} />
        <div className="content">
          {!verified && <VerifyBanner onVerify={openVerify} />}
          {page}
        </div>
      </div>
      <BottomNav nav={window.AD.nav} route={route.page} onNav={go} badges={badges} onMore={() => setDrawer(true)} />
      {verifyOpen && <VerifyModal onClose={() => setVerifyOpen(false)} onComplete={completeVerify} />}
      <div className={"toast" + (toast ? " show" : "")}>{toast}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AgentApp />);
