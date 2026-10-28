/* Ilé Renter — app shell & router */

function RenterApp() {
  const saved0 = (() => { try { return JSON.parse(localStorage.getItem('grt_renter') || '{}'); } catch (e) { return {}; } })();
  const [route, setRoute] = useState({ page: 'dashboard', id: null });
  const [saved, setSaved] = useState(saved0.saved || ['p3', 'p6']);
  const [compareList, setCompareList] = useState(saved0.compareList || ['p1', 'p2']);
  const [verified, setVerified] = useState(saved0.verified === true);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState('');
  const toastT = useRef(null);
  const pending = useRef(null);

  useEffect(() => { localStorage.setItem('grt_renter', JSON.stringify({ saved, compareList, verified })); }, [saved, compareList, verified]);

  function go(page, id) { setRoute({ page, id: id || null }); setDrawer(false); document.querySelector('.content')?.scrollTo(0, 0); }
  function toggleSave(id) { setSaved(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  function toggleCompare(id) { setCompareList(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  function flash(m) { setToast(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 2200); }

  /* Trust boundary: actions that move money, apply, or message owners require a
     verified identity. requireVerified runs the action if verified, otherwise opens
     the just-in-time verification sheet and runs it on success. */
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

  const ctx = { route, go, saved, toggleSave, compareList, toggleCompare, toast: flash, verified, requireVerified, openVerify, resetVerify, signOut };

  const sidebarKey = ['details', 'application', 'pay'].includes(route.page)
    ? { details: 'discover', application: 'discover', pay: 'payments' }[route.page]
    : route.page;

  let page;
  switch (route.page) {
    case 'dashboard': page = <Dashboard ctx={ctx} />; break;
    case 'discover': page = <Discover ctx={ctx} />; break;
    case 'details': page = <PropertyDetails ctx={ctx} id={route.id} />; break;
    case 'saved': page = <SavedCompare ctx={ctx} />; break;
    case 'applications': page = <Applications ctx={ctx} />; break;
    case 'application': page = <Application ctx={ctx} id={route.id} />; break;
    case 'lease': page = <Lease ctx={ctx} />; break;
    case 'payments': page = <Payments ctx={ctx} />; break;
    case 'pay': page = <PayFlow ctx={ctx} />; break;
    case 'maintenance': page = <Maintenance ctx={ctx} />; break;
    case 'messages': page = <Messages ctx={ctx} />; break;
    case 'documents': page = <Documents ctx={ctx} />; break;
    case 'reviews': page = <Reviews ctx={ctx} />; break;
    case 'settings': page = <Settings ctx={ctx} />; break;
    default: page = <Dashboard ctx={ctx} />;
  }

  const badges = { messages: 1, maintenance: window.RD.maintenance.filter(m => m.status !== 'Resolved').length };

  return (
    <div className={"app" + (drawer ? " drawer-open" : "")}>
      <div className="drawer-scrim" onClick={() => setDrawer(false)}></div>
      <Sidebar route={sidebarKey} onNav={go} badges={badges} verified={verified} onVerify={openVerify} />
      <div className="app-main">
        <TopBar onMenu={() => setDrawer(d => !d)} onNav={go} onSignOut={signOut} />
        <div className="content">
          {!verified && <VerifyBanner onVerify={openVerify} />}
          {page}
        </div>
      </div>
      <BottomNav nav={window.RD.nav} route={sidebarKey} onNav={go} badges={badges} onMore={() => setDrawer(true)} />
      {verifyOpen && <VerifyModal onClose={() => setVerifyOpen(false)} onComplete={completeVerify} />}
      <div className={"toast" + (toast ? " show" : "")}>{toast}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<RenterApp />);
