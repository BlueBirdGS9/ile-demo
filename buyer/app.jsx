/* Ilé Buyer — app shell & router */

function BuyerApp() {
  const saved0 = (() => { try { return JSON.parse(localStorage.getItem('grt_buyer') || '{}'); } catch (e) { return {}; } })();
  const [route, setRoute] = useState({ page: 'dashboard', id: null });
  const [saved, setSaved] = useState(saved0.saved || ['bp1', 'bp3']);
  const [compareList, setCompareList] = useState(saved0.compareList || ['bp1', 'bp2']);
  const [watched, setWatched] = useState(saved0.watched || window.BD.watchSeed);
  const [verified, setVerified] = useState(saved0.verified === true);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState('');
  const toastT = useRef(null);
  const pending = useRef(null);

  useEffect(() => { localStorage.setItem('grt_buyer', JSON.stringify({ saved, compareList, watched, verified })); }, [saved, compareList, watched, verified]);

  function go(page, id) { setRoute({ page, id: id || null }); setDrawer(false); document.querySelector('.content')?.scrollTo(0, 0); }
  function toggleSave(id) { setSaved(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  function toggleCompare(id) { setCompareList(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  function toggleWatch(id) { setWatched(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }
  function flash(m) { setToast(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 2200); }

  /* Trust boundary: making offers, moving money through escrow, and messaging
     sellers require a verified identity. */
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

  const ctx = { route, go, saved, toggleSave, compareList, toggleCompare, watched, toggleWatch, toast: flash, verified, requireVerified, openVerify, resetVerify, signOut };

  const sidebarKey = { details: 'discover', offer: 'offers', makeoffer: 'offers', transactionDetail: 'transactions' }[route.page] || route.page;

  let page;
  switch (route.page) {
    case 'dashboard': page = <BuyDashboard ctx={ctx} />; break;
    case 'discover': page = <Discover ctx={ctx} />; break;
    case 'details': page = <BuyDetails ctx={ctx} id={route.id} />; break;
    case 'saved': page = <Saved ctx={ctx} />; break;
    case 'compare': page = <Compare ctx={ctx} />; break;
    case 'watchlist': page = <Watchlist ctx={ctx} />; break;
    case 'viewings': page = <Viewings ctx={ctx} />; break;
    case 'offers': page = <Offers ctx={ctx} />; break;
    case 'offer': page = <OfferDetail ctx={ctx} id={route.id} />; break;
    case 'makeoffer': page = <MakeOffer ctx={ctx} id={route.id} />; break;
    case 'financing': page = <Financing ctx={ctx} />; break;
    case 'transactions': page = <Transactions ctx={ctx} />; break;
    case 'transactionDetail': page = <TransactionDetail ctx={ctx} id={route.id} />; break;
    case 'documents': page = <BuyDocuments ctx={ctx} />; break;
    case 'messages': page = <BuyMessages ctx={ctx} />; break;
    case 'settings': page = <BuySettings ctx={ctx} />; break;
    default: page = <BuyDashboard ctx={ctx} />;
  }

  const badges = {
    messages: window.BD.threads.reduce((n, t) => n + t.unread, 0),
    offers: window.BD.offers.filter(o => o.status === 'Countered').length,
    watchlist: watched.filter(id => window.BD.watchAlerts[id]).length
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
      <BottomNav nav={window.BD.nav} route={sidebarKey} onNav={go} badges={badges} onMore={() => setDrawer(true)} />
      {verifyOpen && <VerifyModal onClose={() => setVerifyOpen(false)} onComplete={completeVerify} />}
      <div className={"toast" + (toast ? " show" : "")}>{toast}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<BuyerApp />);
