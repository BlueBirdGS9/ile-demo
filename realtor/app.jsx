/* Ilé Realtor — app shell & router */

function RealtorApp() {
  const saved0 = (() => { try { return JSON.parse(localStorage.getItem('grt_realtor') || '{}'); } catch (e) { return {}; } })();
  const [route, setRoute] = useState({ page: 'dashboard', id: null });
  const [verified, setVerified] = useState(saved0.verified === true);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState('');
  const toastT = useRef(null);
  const pending = useRef(null);

  useEffect(() => { localStorage.setItem('grt_realtor', JSON.stringify({ verified })); }, [verified]);

  function go(page, id) { setRoute({ page, id: id || null }); setDrawer(false); document.querySelector('.content')?.scrollTo(0, 0); }
  function flash(m) { setToast(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 2200); }

  /* Trust boundary: publishing listings, taking on management, closing deals
     through escrow, and messaging require a verified identity. */
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

  const sidebarKey = { listingDetail: 'listings', dealDetail: 'deals', leadDetail: 'leads', agentDetail: 'agents', lettingsProperty: 'lettings' }[route.page] || route.page;

  let page;
  switch (route.page) {
    case 'dashboard': page = <RealtorDashboard ctx={ctx} />; break;
    case 'listings': page = <Listings ctx={ctx} />; break;
    case 'listingDetail': page = <ListingDetail ctx={ctx} id={route.id} />; break;
    case 'leads': page = <Leads ctx={ctx} />; break;
    case 'leadDetail': page = <LeadDetail ctx={ctx} id={route.id} />; break;
    case 'deals': page = <Deals ctx={ctx} />; break;
    case 'dealDetail': page = <DealDetail ctx={ctx} id={route.id} />; break;
    case 'viewings': page = <Viewings ctx={ctx} />; break;
    case 'fieldops': page = <FieldOps ctx={ctx} />; break;
    case 'lettings': page = <Lettings ctx={ctx} />; break;
    case 'lettingsProperty': page = <LettingProperty ctx={ctx} id={route.id} />; break;
    case 'agents': page = <Agents ctx={ctx} />; break;
    case 'agentDetail': page = <AgentDetail ctx={ctx} id={route.id} />; break;
    case 'performance': page = <Performance ctx={ctx} />; break;
    case 'messages': page = <Messages ctx={ctx} />; break;
    case 'documents': page = <Documents ctx={ctx} />; break;
    case 'settings': page = <Settings ctx={ctx} />; break;
    default: page = <RealtorDashboard ctx={ctx} />;
  }

  const badges = {
    messages: window.RT.threads.reduce((n, t) => n + t.unread, 0),
    leads: window.RT.leads.filter(l => l.stage === 'New').length,
    deals: window.RT.deals.filter(d => d.stage !== 'Completed').length
  };

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
      <BottomNav nav={window.RT.nav} route={sidebarKey} onNav={go} badges={badges} onMore={() => setDrawer(true)} />
      {verifyOpen && <VerifyModal onClose={() => setVerifyOpen(false)} onComplete={completeVerify} />}
      <div className={"toast" + (toast ? " show" : "")}>{toast}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<RealtorApp />);
