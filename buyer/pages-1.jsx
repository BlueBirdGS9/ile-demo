/* Ilé Buyer — Dashboard, Discover, Property Details */

function BuyDashboard({ ctx }) {
  const tx = window.BD.transactions[0];
  const txProp = window.BD.find(tx.listingId);
  const steps = window.BD.escrowMilestones;
  const doneCount = steps.filter(s => s.state === 'done').length;
  const activeOffers = window.BD.offers.filter(o => o.status !== 'Rejected');
  const upcoming = window.BD.viewings.filter(v => v.status !== 'Completed');

  return (
    <div className="page">
      <PageHeader title="Welcome back, Olu" sub="Your home-buying journey at a glance — every step protected by escrow." />

      <div className="grid cols-4" style={{ marginBottom: 22 }}>
        <Stat icon="layers" tone="escrow" label="Purchase" value="Active" foot={<span className="stat-delta">{txProp.area} · in escrow</span>} />
        <Stat icon="handshake" tone="gold" label="Offers" value={activeOffers.length} foot={<span className="link" onClick={() => ctx.go('offers')}>Review offers →</span>} />
        <Stat icon="bookmark" tone="green" label="Saved" value={ctx.saved.length} foot={<span className="link" onClick={() => ctx.go('saved')}>View shortlist →</span>} />
        <Stat icon="calendar" tone="info" label="Viewings" value={upcoming.length} foot={<span className="link" onClick={() => ctx.go('viewings')}>See schedule →</span>} />
      </div>

      <div className="dash-grid">
        <div>
          <div className="funds-banner" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="lbl">Funds held in escrow</div>
                <div className="amt">{money(tx.held)}</div>
                <div className="lock-row"><Icon name="lock" />Secured for {txProp.title}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="lbl">Purchase price</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, marginTop: 4 }}>{moneyShort(tx.amount)}</div>
                <div style={{ font: 'var(--text-caption)', color: 'rgba(255,255,255,.78)', marginTop: 2 }}>Started {tx.started}</div>
              </div>
            </div>
          </div>

          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div className="section-head"><h3>Purchase progress</h3><span className="link" onClick={() => ctx.go('transactionDetail', tx.id)}>Open transaction<Icon name="chevronRight" /></span></div>
            <Milestones steps={steps} />
          </div>

          <div className="card card-pad">
            <div className="section-head"><h3>Your offers</h3><span className="link" onClick={() => ctx.go('offers')}>All offers<Icon name="chevronRight" /></span></div>
            {activeOffers.map(o => {
              const p = window.BD.find(o.listingId);
              return (
                <div key={o.id} className="msg-row" onClick={() => ctx.go('offer', o.id)}>
                  <div className="feed-ic" style={{ background: 'var(--gold-100)', color: 'var(--gold-600)' }}><Icon name="handshake" /></div>
                  <div className="msg-meta"><div className="msg-name">{p.title}</div><div className="msg-snip">{money(o.amount)} · {o.financing} · {o.when}</div></div>
                  {offerChip(o.status)}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Upcoming viewings</h3><span className="link" onClick={() => ctx.go('viewings')}>All<Icon name="chevronRight" /></span></div>
            {upcoming.map(v => {
              const p = window.BD.find(v.listingId);
              return (
                <div key={v.id} className="msg-row" onClick={() => ctx.go('viewings')}>
                  <div className="feed-ic" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}><Icon name="calendar" /></div>
                  <div className="msg-meta"><div className="msg-name">{p.area} · {p.type}</div><div className="msg-snip">{v.date} · {v.time}</div></div>
                  <Chip kind={v.status === 'Confirmed' ? 'paid' : 'due'}>{v.status}</Chip>
                </div>
              );
            })}
          </div>

          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Watchlist alerts</h3><span className="link" onClick={() => ctx.go('watchlist')}>All<Icon name="chevronRight" /></span></div>
            {ctx.watched.filter(id => window.BD.watchAlerts[id]).map(id => {
              const p = window.BD.find(id);
              const w = window.BD.watchAlerts[id];
              const tone = w.kind === 'down' ? ['var(--success-bg)', 'var(--success)', 'trendDown'] : w.kind === 'warn' ? ['var(--warning-bg)', 'var(--warning-text)', 'eye'] : ['var(--info-bg)', 'var(--info-text)', 'info'];
              return (
                <div key={id} className="msg-row" onClick={() => ctx.go('details', id)}>
                  <div className="feed-ic" style={{ background: tone[0], color: tone[1] }}><Icon name={tone[2]} /></div>
                  <div className="msg-meta"><div className="msg-name">{p.area} · {p.type}</div><div className="msg-snip">{w.alert}</div></div>
                </div>
              );
            })}
          </div>

          <div className="escrow-explainer">
            <div className="chip chip--escrow" style={{ marginBottom: 12 }}><span className="dot"></span>Buy with confidence</div>
            <p style={{ font: 'var(--text-sm)', color: 'var(--ink-700)', margin: '0 0 14px', lineHeight: 1.5 }}>Your deposit and final payment are held by Ilé Escrow and released to the seller only once the title is verified and ownership transfers.</p>
            <button className="btn btn-secondary btn-block" onClick={() => ctx.go('financing')}><Icon name="calc" />Estimate my mortgage</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Discover ---------------- */
function Discover({ ctx }) {
  const [q, setQ] = useState('');
  const [city, setCity] = useState('All');
  const [budget, setBudget] = useState('Any');
  const [beds, setBeds] = useState('Any');
  const [type, setType] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 650); return () => clearTimeout(t); }, [q, city, budget, beds, type, verifiedOnly]);

  const brackets = { 'Any': [0, Infinity], 'Under ₦80M': [0, 80e6], '₦80M–₦150M': [80e6, 150e6], '₦150M–₦300M': [150e6, 300e6], 'Over ₦300M': [300e6, Infinity] };
  const [bmin, bmax] = brackets[budget];
  const list = window.BD.listings.filter(p =>
    (city === 'All' || p.city === city) &&
    (type === 'All' || p.type === type) &&
    (beds === 'Any' || p.beds >= +beds) &&
    p.price >= bmin && p.price <= bmax &&
    (!verifiedOnly || p.verified) &&
    (!q || (p.title + p.area + p.city).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="page">
      <PageHeader title="Discover homes for sale" sub="Every property is checked, and titles are cross-referenced with the land registry before listing." />
      <div className="filterbar">
        <div className="filter-search"><Icon name="search" /><input placeholder="Search by area, city or title…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <select className="filter-select" value={city} onChange={e => setCity(e.target.value)}>{['All', 'Lagos', 'Abuja', 'Port Harcourt'].map(c => <option key={c}>{c}</option>)}</select>
        <select className="filter-select" value={budget} onChange={e => setBudget(e.target.value)}>{Object.keys(brackets).map(c => <option key={c}>{c}</option>)}</select>
        <select className="filter-select" value={beds} onChange={e => setBeds(e.target.value)}>{[['Any', 'Any beds'], ['2', '2+ beds'], ['3', '3+ beds'], ['4', '4+ beds'], ['5', '5+ beds']].map(c => <option key={c[0]} value={c[0]}>{c[1]}</option>)}</select>
        <select className="filter-select" value={type} onChange={e => setType(e.target.value)}>{['All', 'Detached Duplex', 'Semi-Detached', 'Terrace', 'Villa', 'Apartment'].map(c => <option key={c}>{c}</option>)}</select>
        <button className={"toggle-pill" + (verifiedOnly ? " on" : "")} onClick={() => setVerifiedOnly(v => !v)}><span className="sw"></span>Verified title only</button>
      </div>

      <div className="results-bar">
        <div className="count"><b>{loading ? '—' : list.length}</b> homes for sale{city !== 'All' ? ' in ' + city : ''}</div>
        <div className="view-toggle">
          <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}><Icon name="grid" /></button>
          <button className={view === 'map' ? 'on' : ''} onClick={() => setView('map')}><Icon name="mapPin" /></button>
        </div>
      </div>

      {loading ? (
        <div className="grid cols-3">{[0, 1, 2, 3, 4, 5].map(i => (
          <div key={i} className="pcard"><Skeleton h={170} r={0} /><div className="pcard-body"><Skeleton w="55%" h={18} /><Skeleton w="80%" /><Skeleton w="50%" /><Skeleton w="70%" /></div></div>
        ))}</div>
      ) : view === 'map' ? (
        <div className="card" style={{ height: 460, position: 'relative', overflow: 'hidden', background: 'repeating-linear-gradient(135deg,var(--ink-100),var(--ink-100) 16px,var(--ink-50) 16px,var(--ink-50) 32px)' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div><div className="state-icon" style={{ background: 'var(--surface)', margin: '0 auto 10px' }}><Icon name="mapPin" /></div><div style={{ font: 'var(--text-h4)', color: 'var(--ink-700)' }}>Map view</div><div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>Pins for {list.length} homes for sale — drop your map provider here.</div></div>
          </div>
          {list.slice(0, 5).map((p, i) => <div key={p.id} style={{ position: 'absolute', top: (20 + i * 14) + '%', left: (18 + i * 15) + '%' }}><span className="chip chip--paid" style={{ boxShadow: 'var(--shadow-md)' }}>{moneyShort(p.price)}</span></div>)}
        </div>
      ) : list.length ? (
        <div className="grid cols-3">{list.map(p => <BuyCard key={p.id} p={p} saved={ctx.saved.includes(p.id)} onSave={ctx.toggleSave} onOpen={id => ctx.go('details', id)} />)}</div>
      ) : (
        <div className="card"><EmptyState icon="search" title="No homes match your filters" desc="Try widening your budget or removing a filter to see more verified listings." actions={<button className="btn btn-secondary btn-sm" onClick={() => { setQ(''); setCity('All'); setBudget('Any'); setBeds('Any'); setType('All'); setVerifiedOnly(false); }}>Clear filters</button>} /></div>
      )}
    </div>
  );
}

/* ---------------- Property Details ---------------- */
function BuyDetails({ ctx, id }) {
  const p = window.BD.find(id) || window.BD.listings[0];
  const monthly = Math.round((p.price * 0.75 * 0.013));
  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('discover')}><Icon name="arrowLeft" />Back to discover</span>
      <div className="pd-grid">
        <div>
          <div className="gallery">
            <div className="ph"><span>{p.type} — main photo</span></div>
            <div className="col2">
              <div className="ph"><span>interior</span></div>
              <div className="ph"><span>grounds<div className="more">+8 photos</div></span></div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 22, gap: 16 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <Vbadge state={p.verified ? 'verified' : 'pending'} />
                <span className="tag"><Icon name="star" style={{ width: 14, height: 14, color: 'var(--gold-500)' }} />{p.rating} · {p.reviews} reviews</span>
              </div>
              <h1 className="page-title" style={{ fontSize: '1.6rem' }}>{p.title}</h1>
              <div className="pcard-loc" style={{ marginTop: 4 }}><Icon name="mapPin" />{p.area}, {p.city}</div>
            </div>
            <div style={{ textAlign: 'right' }}><div className="money" style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--ink-900)' }}>{money(p.price)}</div><div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>for sale · {moneyShort(p.price)}</div></div>
          </div>

          <div className="pd-specs">
            <div className="pd-spec"><Icon name="bed" /><div className="v">{p.beds}</div><div className="k">Bedrooms</div></div>
            <div className="pd-spec"><Icon name="bath" /><div className="v">{p.baths}</div><div className="k">Bathrooms</div></div>
            <div className="pd-spec"><Icon name="ruler" /><div className="v">{p.sqm}m²</div><div className="k">Floor area</div></div>
            <div className="pd-spec"><Icon name="shieldCheck" /><div className="v">{p.amenities[0].split(' ')[0]}</div><div className="k">Title type</div></div>
          </div>

          <h3 className="section-head" style={{ display: 'block' }}>About this home</h3>
          <p style={{ font: 'var(--text-body)', color: 'var(--ink-600)', marginTop: 0 }}>{p.desc}</p>

          <h3 className="section-head" style={{ display: 'block', marginTop: 24 }}>Features &amp; title</h3>
          <div className="grid cols-2" style={{ gap: 0 }}>{p.amenities.map(a => <div key={a} className="amenity"><Icon name="check" />{a}</div>)}</div>

          <h3 className="section-head" style={{ display: 'block', marginTop: 24 }}>Trust &amp; verification</h3>
          <div className="trust-section">
            <div className="ts-head"><Icon name="shieldCheck" />Why you can trust this listing</div>
            <div className="grid cols-2">
              <div className="card card-pad" style={{ boxShadow: 'none' }}>
                <div className="avatar-block" style={{ marginBottom: 12 }}><Avatar name={p.owner.name} /><div className="avatar-meta"><span className="avatar-name">{p.owner.name}</span><span className="avatar-role">Seller · since {p.owner.since}</span></div></div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><TrustRing val={p.owner.trust} size={48} label="Seller trust" tier={p.owner.trust >= 85 ? 'Excellent' : 'Good'} /></div>
                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>{p.owner.verified && <Vbadge state="verified" sm />}<span className="tag">ID verified</span></div>
              </div>
              <div className="card card-pad" style={{ boxShadow: 'none' }}>
                <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                  {[[p.verified, 'Title cross-checked with land registry'], [true, 'Property inspected on-site'], [true, 'Escrow-eligible transaction'], [p.verified, 'No outstanding encumbrances found']].map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, font: 'var(--text-sm)', color: 'var(--ink-700)' }}>
                      <div style={{ width: 24, height: 24, borderRadius: 7, display: 'grid', placeItems: 'center', background: r[0] ? 'var(--success-bg)' : 'var(--ink-100)', color: r[0] ? 'var(--success)' : 'var(--ink-400)' }}><Icon name={r[0] ? 'check' : 'clock'} style={{ width: 14, height: 14 }} /></div>{r[1]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pd-action-card">
          <div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>Asking price</div>
          <div className="money" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--ink-900)' }}>{money(p.price)}</div>
          <div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', marginBottom: 16 }}>≈ {money(monthly)}/mo on a mortgage</div>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => ctx.requireVerified(() => ctx.go('makeoffer', p.id))}><Icon name="handshake" />Make an offer</button>
          <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={() => ctx.go('viewings')}><Icon name="schedule" />Schedule viewing</button>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--ink-200)' }} onClick={() => ctx.toggleSave(p.id)}><Icon name="heart" style={ctx.saved.includes(p.id) ? { color: 'var(--error)', fill: 'var(--error)' } : null} />{ctx.saved.includes(p.id) ? 'Saved' : 'Save'}</button>
            <button className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--ink-200)' }} onClick={() => { ctx.toggleCompare(p.id); ctx.toast('Added to compare'); }}><Icon name="scale" />Compare</button>
          </div>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 10, border: ctx.watched.includes(p.id) ? '1px solid var(--escrow)' : '1px solid var(--ink-200)', color: ctx.watched.includes(p.id) ? 'var(--escrow-text)' : null }} onClick={() => { const on = ctx.watched.includes(p.id); ctx.toggleWatch(p.id); ctx.toast(on ? 'Removed from watchlist' : 'Tracking — we’ll alert you on price & activity'); }}><Icon name="eye" style={ctx.watched.includes(p.id) ? { color: 'var(--escrow)' } : null} />{ctx.watched.includes(p.id) ? 'Tracking price' : 'Watch price'}</button>
          <button className="btn btn-ghost btn-block" style={{ marginTop: 10, border: '1px solid var(--ink-200)' }} onClick={() => ctx.go('financing')}><Icon name="calc" />Calculate mortgage</button>
          <div className="trust-callout" style={{ marginTop: 16 }}><Icon name="lock" /><p><b>Escrow-protected:</b> your deposit is held by Ilé and released to the seller only after the title is verified and ownership transfers to you.</p></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BuyDashboard, Discover, BuyDetails });
