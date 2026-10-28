/* Ilé Seller — app shell & router */

function SellerApp() {
  const saved0 = (() => { try { return JSON.parse(localStorage.getItem('grt_seller') || '{}'); } catch (e) { return {}; } })();
  const [route, setRoute] = useState({ page: 'dashboard', id: null });
  const [verified, setVerified] = useState(saved0.verified === true);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState('');
  const toastT = useRef(null);
  const pending = useRef(null);

  useEffect(() => { localStorage.setItem('grt_seller', JSON.stringify({ verified })); }, [verified]);

  function go(page, id) { setRoute({ page, id: id || null }); setDrawer(false); document.querySelector('.content')?.scrollTo(0, 0); }
  function flash(m) { setToast(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 2200); }

  /* Trust boundary: listing, accepting offers, moving money through escrow, and
     messaging buyers require a verified identity. */
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

  const sidebarKey = { propertyDetail: 'properties', offer: 'offers', transactionDetail: 'transactions' }[route.page] || route.page;

  let page;
  switch (route.page) {
    case 'dashboard': page = <SellDashboard ctx={ctx} />; break;
    case 'properties': page = <MyProperties ctx={ctx} />; break;
    case 'propertyDetail': page = <PropertyDetail ctx={ctx} id={route.id} />; break;
    case 'offers': page = <Offers ctx={ctx} />; break;
    case 'offer': page = <OfferDetail ctx={ctx} id={route.id} />; break;
    case 'valuation': page = <Valuation ctx={ctx} />; break;
    case 'transactions': page = <Transactions ctx={ctx} />; break;
    case 'transactionDetail': page = <TransactionDetail ctx={ctx} id={route.id} />; break;
    case 'documents': page = <SellDocuments ctx={ctx} />; break;
    case 'messages': page = <SellMessages ctx={ctx} />; break;
    case 'settings': page = <SellSettings ctx={ctx} />; break;
    default: page = <SellDashboard ctx={ctx} />;
  }

  const badges = {
    messages: window.SD.threads.reduce((n, t) => n + t.unread, 0),
    offers: window.SD.offers.filter(o => o.status === 'New').length
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
      <BottomNav nav={window.SD.nav} route={sidebarKey} onNav={go} badges={badges} onMore={() => setDrawer(true)} />
      {verifyOpen && <VerifyModal onClose={() => setVerifyOpen(false)} onComplete={completeVerify} />}
      <div className={"toast" + (toast ? " show" : "")}>{toast}</div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<SellerApp />);
