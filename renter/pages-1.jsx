/* Ilé Renter — Dashboard, Discover, Property Details */

function useCountdown(dateStr) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, new Date(dateStr).getTime() - now);
  const d = Math.floor(diff / 86400000), h = Math.floor(diff / 3600000) % 24, m = Math.floor(diff / 60000) % 60, s = Math.floor(diff / 1000) % 60;
  return { d, h, m, s };
}

function Dashboard({ ctx }) {
  const L = window.RD.lease;
  const cd = useCountdown(L.nextDue);
  const openIssues = window.RD.maintenance.filter(m => m.status !== 'Resolved');
  return (
    <div className="page">
      <PageHeader title="Welcome back, Adaeze" sub="Here’s what’s happening with your home today." />

      <div className="grid cols-4" style={{ marginBottom: 22 }}>
        <Stat icon="key" tone="green" label="Lease status" value="Active" foot={<span className="stat-delta up">{L.start} – {L.end}</span>} />
        <Stat icon="wallet" tone="gold" label="Next rent due" value={money(L.nextAmount)} money foot={<span className="stat-delta down"><Icon name="clock" style={{ width: 12, height: 12 }} />in {cd.d} days</span>} />
        <Stat icon="wrench" tone="warn" label="Open maintenance" value={openIssues.length} foot={<span className="stat-delta">{openIssues.length ? 'Being handled' : 'All clear'}</span>} />
        <Stat icon="message" tone="info" label="Unread messages" value="1" foot={<span className="link" onClick={() => ctx.go('messages')}>Open inbox →</span>} />
      </div>

      <div className="dash-grid">
        <div>
          <div className="lease-hero" style={{ marginBottom: 20 }}>
            <div className="eyebrow">Your current home</div>
            <h2>{L.title}</h2>
            <div className="addr"><Icon name="mapPin" />{L.address}</div>
            <div className="lease-row">
              <div><div className="k">Annual rent</div><div className="v">{money(L.rent)}</div></div>
              <div><div className="k">Deposit (escrow)</div><div className="v">{money(L.deposit)}</div></div>
              <div><div className="k">Landlord</div><div className="v" style={{ fontFamily: 'var(--font-sans)', fontSize: '.95rem' }}>{L.landlord}</div></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-gold" onClick={() => ctx.requireVerified(() => ctx.go('pay'))}><Icon name="wallet" />Pay rent</button>
              <button className="btn btn-secondary" style={{ background: 'rgba(255,255,255,.12)', borderColor: 'rgba(255,255,255,.24)', color: '#fff' }} onClick={() => ctx.go('lease')}>View lease</button>
            </div>
          </div>

          <div className="card card-pad">
            <div className="section-head"><h3>Active maintenance</h3><span className="link" onClick={() => ctx.go('maintenance')}>View all<Icon name="chevronRight" /></span></div>
            {openIssues.length ? openIssues.map(m => (
              <div key={m.id} className="msg-row" onClick={() => ctx.go('maintenance')}>
                <div className="feed-ic" style={{ background: 'var(--warning-bg)', color: 'var(--warning-text)' }}><Icon name="wrench" /></div>
                <div className="msg-meta"><div className="msg-name">{m.title}</div><div className="msg-snip">{m.category} · {m.vendor}</div></div>
                <Chip kind={m.status === 'In Progress' ? 'progress' : 'due'}>{m.status}</Chip>
              </div>
            )) : <EmptyState icon="check" title="No open issues" desc="Everything’s in good shape. Report a problem any time." />}
          </div>
        </div>

        <div>
          <div className="countdown-card" style={{ marginBottom: 20 }}>
            <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Rent due in</h3><Chip kind="due">Upcoming</Chip></div>
            <div className="cd-units">
              {[['Days', cd.d], ['Hrs', cd.h], ['Min', cd.m], ['Sec', cd.s]].map(u => <div key={u[0]} className="cd-unit"><b>{String(u[1]).padStart(2, '0')}</b><span>{u[0]}</span></div>)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <div><div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>Amount</div><div className="money" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink-900)' }}>{money(L.nextAmount)}</div></div>
              <button className="btn btn-primary btn-sm" onClick={() => ctx.requireVerified(() => ctx.go('pay'))}>Pay via escrow</button>
            </div>
          </div>

          <div className="card card-pad">
            <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Recent messages</h3><span className="link" onClick={() => ctx.go('messages')}>All<Icon name="chevronRight" /></span></div>
            {window.RD.threads.slice(0, 3).map(t => (
              <div key={t.id} className="msg-row" onClick={() => ctx.go('messages')}>
                <Avatar name={t.name} color={t.role === 'Support' ? 'info' : t.role === 'Agent' ? 'gold' : null} />
                <div className="msg-meta"><div className="msg-name">{t.name}{t.unread ? <span className="badge" style={{ background: 'var(--error)', color: '#fff', fontSize: '.6rem', padding: '0 5px', borderRadius: 99 }}>{t.unread}</span> : null}</div><div className="msg-snip">{t.last}</div></div>
                <span className="msg-time">{t.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, tone, label, value, money: isMoney, foot }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <div><div className="stat-label">{label}</div><div className={"stat-value" + (isMoney ? " money" : "")}>{value}</div></div>
        <div className={"stat-ic " + tone}><Icon name={icon} /></div>
      </div>
      {foot}
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
  const [furnished, setFurnished] = useState(false);
  const [pet, setPet] = useState(false);
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, [q, city, budget, beds, type, furnished, pet]);

  const budgetMax = { 'Any': Infinity, 'Under ₦2M': 2000000, '₦2M–₦4M': 4000000, '₦4M–₦7M': 7000000, 'Over ₦7M': Infinity }[budget];
  const budgetMin = budget === 'Over ₦7M' ? 7000000 : budget === '₦4M–₦7M' ? 4000000 : budget === '₦2M–₦4M' ? 2000000 : 0;
  const list = window.RD.properties.filter(p =>
    (city === 'All' || p.city === city) &&
    (type === 'All' || p.type === type) &&
    (beds === 'Any' || p.beds >= +beds) &&
    p.price <= budgetMax && p.price >= budgetMin &&
    (!furnished || p.furnished) && (!pet || p.pet) &&
    (!q || (p.title + p.area + p.city).toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="page">
      <PageHeader title="Discover homes" sub="Every listing is checked. Look for the Verified badge for extra peace of mind." />
      <div className="filterbar">
        <div className="filter-search"><Icon name="search" /><input placeholder="Search by area, city or title…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <select className="filter-select" value={city} onChange={e => setCity(e.target.value)}>{['All', 'Lagos', 'Abuja', 'Port Harcourt'].map(c => <option key={c}>{c}</option>)}</select>
        <select className="filter-select" value={budget} onChange={e => setBudget(e.target.value)}>{['Any', 'Under ₦2M', '₦2M–₦4M', '₦4M–₦7M', 'Over ₦7M'].map(c => <option key={c}>{c}</option>)}</select>
        <select className="filter-select" value={beds} onChange={e => setBeds(e.target.value)}>{[['Any', 'Any beds'], ['1', '1+ beds'], ['2', '2+ beds'], ['3', '3+ beds'], ['4', '4+ beds']].map(c => <option key={c[0]} value={c[0]}>{c[1]}</option>)}</select>
        <select className="filter-select" value={type} onChange={e => setType(e.target.value)}>{['All', 'Apartment', 'Flat', 'Duplex', 'Terrace', 'Studio', 'Bungalow'].map(c => <option key={c}>{c}</option>)}</select>
        <button className={"toggle-pill" + (furnished ? " on" : "")} onClick={() => setFurnished(f => !f)}><span className="sw"></span>Furnished</button>
        <button className={"toggle-pill" + (pet ? " on" : "")} onClick={() => setPet(f => !f)}><span className="sw"></span>Pet friendly</button>
      </div>

      <div className="results-bar">
        <div className="count"><b>{loading ? '—' : list.length}</b> verified homes{city !== 'All' ? ' in ' + city : ''}</div>
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
            <div><div className="state-icon" style={{ background: 'var(--surface)', margin: '0 auto 10px' }}><Icon name="mapPin" /></div><div style={{ font: 'var(--text-h4)', color: 'var(--ink-700)' }}>Map view</div><div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>Pins for {list.length} verified homes — drop your map provider here.</div></div>
          </div>
          {list.slice(0, 5).map((p, i) => <div key={p.id} style={{ position: 'absolute', top: (20 + i * 14) + '%', left: (18 + i * 15) + '%' }}><span className="chip chip--paid" style={{ boxShadow: 'var(--shadow-md)' }}>{money(p.price)}</span></div>)}
        </div>
      ) : list.length ? (
        <div className="grid cols-3">{list.map(p => <PropertyCard key={p.id} p={p} saved={ctx.saved.includes(p.id)} onSave={ctx.toggleSave} onOpen={id => ctx.go('details', id)} />)}</div>
      ) : (
        <div className="card"><EmptyState icon="search" title="No homes match your filters" desc="Try widening your budget or removing a filter to see more verified listings." actions={<button className="btn btn-secondary btn-sm" onClick={() => { setQ(''); setCity('All'); setBudget('Any'); setBeds('Any'); setType('All'); setFurnished(false); setPet(false); }}>Clear filters</button>} /></div>
      )}
    </div>
  );
}

/* ---------------- Property Details ---------------- */
function PropertyDetails({ ctx, id }) {
  const p = window.RD.find(id) || window.RD.properties[0];
  const monthly = Math.round(p.price / 12);
  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('discover')}><Icon name="arrowLeft" />Back to discover</span>
      <div className="pd-grid">
        <div>
          <div className="gallery">
            <div className="ph"><span>{p.type} — main photo</span></div>
            <div className="col2">
              <div className="ph"><span>interior</span></div>
              <div className="ph"><span>exterior<div className="more">+6 photos</div></span></div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 22, gap: 16 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <Vbadge state={p.verified ? 'verified' : 'unverified'} />
                <span className="tag"><Icon name="star" style={{ width: 14, height: 14, color: 'var(--gold-500)' }} />{p.rating} · {p.reviews} reviews</span>
              </div>
              <h1 className="page-title" style={{ fontSize: '1.6rem' }}>{p.title}</h1>
              <div className="pcard-loc" style={{ marginTop: 4 }}><Icon name="mapPin" />{p.area}, {p.city} · {p.distance} from you</div>
            </div>
            <div style={{ textAlign: 'right' }}><div className="money" style={{ fontSize: '1.7rem', fontWeight: 600, color: 'var(--ink-900)' }}>{money(p.price)}</div><div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>per year · {money(monthly)}/mo</div></div>
          </div>

          <div className="pd-specs">
            <div className="pd-spec"><Icon name="bed" /><div className="v">{p.beds}</div><div className="k">Bedrooms</div></div>
            <div className="pd-spec"><Icon name="bath" /><div className="v">{p.baths}</div><div className="k">Bathrooms</div></div>
            <div className="pd-spec"><Icon name="ruler" /><div className="v">{p.sqm}m²</div><div className="k">Floor area</div></div>
            <div className="pd-spec"><Icon name="key" /><div className="v">{p.furnished ? 'Yes' : 'No'}</div><div className="k">Furnished</div></div>
          </div>

          <h3 className="section-head" style={{ display: 'block' }}>About this home</h3>
          <p style={{ font: 'var(--text-body)', color: 'var(--ink-600)', marginTop: 0 }}>{p.desc}</p>

          <h3 className="section-head" style={{ display: 'block', marginTop: 24 }}>Amenities</h3>
          <div className="grid cols-2" style={{ gap: 0 }}>{p.amenities.map(a => <div key={a} className="amenity"><Icon name="check" />{a}</div>)}</div>

          <h3 className="section-head" style={{ display: 'block', marginTop: 24 }}>Trust &amp; verification</h3>
          <div className="trust-section">
            <div className="ts-head"><Icon name="shieldCheck" />Why you can trust this listing</div>
            <div className="grid cols-2">
              <div className="card card-pad" style={{ boxShadow: 'none' }}>
                <div className="avatar-block" style={{ marginBottom: 12 }}><Avatar name={p.owner.name} /><div className="avatar-meta"><span className="avatar-name">{p.owner.name}</span><span className="avatar-role">Owner · since {p.owner.since}</span></div></div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><TrustRing val={p.owner.trust} size={48} label="Owner trust" tier={p.owner.trust >= 85 ? 'Excellent' : 'Good'} /></div>
                <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>{p.owner.verified && <Vbadge state="verified" sm />}<span className="tag">ID verified</span></div>
              </div>
              <div className="card card-pad" style={{ boxShadow: 'none' }}>
                <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                  {[[p.verified, 'Property documents verified'], [true, 'Address confirmed on-site'], [true, 'Escrow-eligible transaction'], [p.verified, 'Land registry cross-checked']].map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, font: 'var(--text-sm)', color: 'var(--ink-700)' }}>
                      <div className="ri-ic ok" style={{ width: 24, height: 24, background: r[0] ? 'var(--success-bg)' : 'var(--ink-100)', color: r[0] ? 'var(--success)' : 'var(--ink-400)' }}><Icon name={r[0] ? 'check' : 'clock'} style={{ width: 14, height: 14 }} /></div>{r[1]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pd-action-card">
          <div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>Annual rent</div>
          <div className="money" style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--ink-900)' }}>{money(p.price)}</div>
          <div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', marginBottom: 16 }}>≈ {money(monthly)} per month</div>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => ctx.requireVerified(() => ctx.go('application', p.id))}>Apply to rent<Icon name="arrowRight" /></button>
          <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }}><Icon name="schedule" />Schedule viewing</button>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button className={"btn btn-ghost" + (ctx.saved.includes(p.id) ? '' : '')} style={{ flex: 1, border: '1px solid var(--ink-200)' }} onClick={() => ctx.toggleSave(p.id)}><Icon name="heart" style={ctx.saved.includes(p.id) ? { color: 'var(--error)', fill: 'var(--error)' } : null} />{ctx.saved.includes(p.id) ? 'Saved' : 'Save'}</button>
            <button className="btn btn-ghost" style={{ flex: 1, border: '1px solid var(--ink-200)' }} onClick={() => { ctx.toggleCompare(p.id); ctx.toast('Added to compare'); }}><Icon name="scale" />Compare</button>
          </div>
          <div className="trust-callout" style={{ marginTop: 16 }}><Icon name="lock" /><p><b>Escrow-protected:</b> your first payment is held by Ilé and released to the landlord only after you confirm move-in.</p></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, Discover, PropertyDetails, Stat });
