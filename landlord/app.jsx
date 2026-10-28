/* Ilé Landlord — app shell & router */

function LandlordApp() {
  const saved0 = (() => { try { return JSON.parse(localStorage.getItem('grt_landlord') || '{}'); } catch (e) { return {}; } })();
  const [route, setRoute] = useState({ page: 'dashboard', id: null });
  const [verified, setVerified] = useState(saved0.verified === true);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState('');
  const toastT = useRef(null);
  const pending = useRef(null);

  useEffect(() => { localStorage.setItem('grt_landlord', JSON.stringify({ verified })); }, [verified]);

  function go(page, id) { setRoute({ page, id: id || null }); setDrawer(false); document.querySelector('.content')?.scrollTo(0, 0); }
  function flash(m) { setToast(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 2200); }

  /* Trust boundary: listing units, approving applications, collecting rent through
     escrow, and messaging require a verified identity. */
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

  const sidebarKey = route.page === 'addProperty' ? 'properties' : (route.page === 'managedProperty' || route.page === 'findManager' || route.page === 'agencyDetail') ? 'managed' : route.page;

  let page;
  switch (route.page) {
    case 'dashboard': page = <Dashboard ctx={ctx} />; break;
    case 'properties': page = <Properties ctx={ctx} />; break;
    case 'managed': page = <Managed ctx={ctx} />; break;
    case 'managedProperty': page = <ManagedPropertyDetail ctx={ctx} id={route.id} />; break;
    case 'findManager': page = <FindManager ctx={ctx} />; break;
    case 'agencyDetail': page = <AgencyDetail ctx={ctx} id={route.id} />; break;
    case 'addProperty': page = <AddProperty ctx={ctx} />; break;
    case 'tenants': page = <Tenants ctx={ctx} />; break;
    case 'applications': page = <Applications ctx={ctx} />; break;
    case 'rent': page = <RentCollection ctx={ctx} />; break;
    case 'maintenance': page = <MaintenanceOps ctx={ctx} />; break;
    case 'financials': page = <Financials ctx={ctx} />; break;
    case 'messages': page = <Messages ctx={ctx} />; break;
    case 'documents': page = <Documents ctx={ctx} />; break;
    case 'settings': page = <Settings ctx={ctx} />; break;
    default: page = <Dashboard ctx={ctx} />;
  }

  const badges = { messages: 1, applications: window.LD.applications.filter(a => a.status === 'New').length, maintenance: window.LD.maintenance.filter(m => m.status !== 'Resolved').length };

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
      <BottomNav nav={window.LD.nav} route={sidebarKey} onNav={go} badges={badges} onMore={() => setDrawer(true)} />
      {verifyOpen && <VerifyModal onClose={() => setVerifyOpen(false)} onComplete={completeVerify} />}
      <div className={"toast" + (toast ? " show" : "")}>{toast}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<LandlordApp />);
