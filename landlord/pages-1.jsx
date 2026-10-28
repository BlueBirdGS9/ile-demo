/* Ilé Landlord — Dashboard, Properties, Tenants */

function Dashboard({ ctx }) {
  const occ = Math.round(window.LD.totalOccupied / window.LD.totalUnits * 100);
  const rentDue = window.LD.rentRows.filter(r => r.status !== 'paid').reduce((s, r) => s + r.amount, 0);
  const openMaint = window.LD.maintenance.filter(m => m.status !== 'Resolved').length;
  const monthRevenue = 23700000;
  return (
    <div className="page">
      <PageHeader title="Portfolio overview" sub="Good morning, Chidi. Here’s how your properties are performing." actions={<button className="btn btn-primary" onClick={() => ctx.requireVerified(() => ctx.go('addProperty'))}><Icon name="plus" />Add property</button>} />

      <div className="grid cols-4" style={{ marginBottom: 22 }}>
        <Stat icon="building" tone="green" label="Total properties" value={window.LD.properties.length} foot={<span className="stat-delta">{window.LD.totalUnits} units total</span>} />
        <Stat icon="users" tone="info" label="Active tenants" value={window.LD.totalOccupied} foot={<span className="stat-delta up"><Icon name="trend" style={{ width: 12, height: 12 }} />{occ}% occupancy</span>} />
        <Stat icon="wallet" tone="warn" label="Rent due / overdue" value={moneyShort(rentDue)} money foot={<span className="stat-delta down">2 tenants outstanding</span>} />
        <Stat icon="wrench" tone="gold" label="Open maintenance" value={openMaint} foot={<span className="stat-delta">1 high priority</span>} />
      </div>

      <div className="dash-grid">
        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div className="section-head"><h3>Revenue (last 6 months)</h3><div className="kpi-inline"><div><span className="v money" style={{ color: 'var(--primary)' }}>{moneyShort(monthRevenue)}</span></div></div></div>
            <BarChart data={window.LD.revenue} fmt={v => '₦' + v + 'M'} />
          </div>

          <div className="card card-pad">
            <div className="section-head"><h3>Rent collection status</h3><span className="link" onClick={() => ctx.go('rent')}>Manage<Icon name="chevronRight" /></span></div>
            <div className="table-wrap">
              <table className="dtable">
                <thead><tr><th>Tenant</th><th>Unit</th><th className="money">Amount</th><th>Status</th></tr></thead>
                <tbody>{window.LD.rentRows.slice(0, 4).map(r => (
                  <tr key={r.id} onClick={() => ctx.go('rent')}><td data-label="Tenant" style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{r.tenant}</td><td data-label="Unit" style={{ color: 'var(--ink-500)' }}>{r.unit}</td><td data-label="Amount" className="money">{money(r.amount)}</td><td data-label="Status">{rentChip(r.status)}</td></tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="card card-pad" style={{ marginBottom: 20, textAlign: 'center' }}>
            <div className="section-head" style={{ justifyContent: 'flex-start' }}><h3 style={{ fontSize: '1rem' }}>Occupancy</h3></div>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 14px' }}>
              <div className="donut" style={{ '--val': occ, '--color': 'var(--primary)' }}><div className="inner"><b>{occ}%</b><span>Occupied</span></div></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, font: 'var(--text-caption)' }}>
              <span style={{ color: 'var(--ink-600)' }}><b style={{ color: 'var(--ink-900)', fontFamily: 'var(--font-mono)' }}>{window.LD.totalOccupied}</b> occupied</span>
              <span style={{ color: 'var(--ink-600)' }}><b style={{ color: 'var(--ink-900)', fontFamily: 'var(--font-mono)' }}>{window.LD.totalUnits - window.LD.totalOccupied}</b> vacant</span>
            </div>
          </div>

          <div className="card card-pad">
            <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Recent activity</h3></div>
            <div className="feed">
              {window.LD.activity.map((a, i) => (
                <div key={i} className="feed-item">
                  <div className="feed-ic" style={{ background: a[1] === 'green' ? 'var(--green-50)' : a[1] === 'info' ? 'var(--info-bg)' : 'var(--warning-bg)', color: a[1] === 'green' ? 'var(--primary)' : a[1] === 'info' ? 'var(--info-text)' : 'var(--warning-text)' }}><Icon name={a[0]} /></div>
                  <div className="feed-txt"><div className="t"><b>{a[2]}</b></div><div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>{a[3]}</div><div className="time">{a[4]}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Properties + Unit management ---------------- */
function Properties({ ctx }) {
  const [sel, setSel] = useState(null);
  if (sel) return <PropertyDetail ctx={ctx} id={sel} onBack={() => setSel(null)} />;
  return (
    <div className="page">
      <PageHeader title="Properties" sub="Manage your buildings and the units inside them." actions={<button className="btn btn-primary" onClick={() => ctx.requireVerified(() => ctx.go('addProperty'))}><Icon name="plus" />Add property</button>} />
      <div className="grid cols-3">
        {window.LD.properties.map(p => {
          const occ = Math.round(p.occupied / p.units * 100);
          return (
            <div key={p.id} className="ptile" onClick={() => setSel(p.id)}>
              <div className="ptile-media" style={p.photos && p.photos.length ? { backgroundImage: 'url(' + p.photos[0] + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : null}>{!(p.photos && p.photos.length) && <span>{p.image}</span>}<div style={{ position: 'absolute', top: 10, left: 10 }}>{p.verified ? <Vbadge state="verified" sm /> : <Vbadge state="pending" sm />}</div></div>
              <div className="ptile-body">
                <div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{p.name}</div>
                <div className="pcard-loc" style={{ marginTop: 3 }}><Icon name="mapPin" />{p.area}, {p.city}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, font: 'var(--text-caption)', color: 'var(--ink-600)' }}>
                  <span>{p.occupied}/{p.units} units occupied</span><span style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{occ}%</span>
                </div>
                <div className="occ-bar"><div className="fill" style={{ width: occ + '%' }}></div></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--ink-100)' }}>
                  <div><div style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink-400)' }}>Annual / unit</div><div className="money" style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{moneyShort(p.rentPerUnit)}</div></div>
                  <span className="link">Manage units<Icon name="chevronRight" /></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PropertyDetail({ ctx, id, onBack }) {
  const p = window.LD.findProp(id);
  const units = window.LD.units[id] || [{ no: '1', beds: 3, tenant: 'Emeka Eze', status: 'Occupied', rent: p.rentPerUnit, due: 'paid', leaseEnd: '12 Jan 2027' }];
  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={onBack}><Icon name="arrowLeft" />All properties</span>
      <PageHeader title={p.name} sub={p.type + ' · ' + p.area + ', ' + p.city} actions={<><button className="btn btn-secondary" onClick={() => ctx.go('findManager')}><Icon name="briefcase" />Put under management</button><button className="btn btn-primary"><Icon name="plus" />Add unit</button></>} />
      <div className="grid cols-4" style={{ marginBottom: 22 }}>
        <Stat icon="grid" tone="green" label="Total units" value={p.units} />
        <Stat icon="users" tone="info" label="Occupied" value={p.occupied} />
        <Stat icon="key" tone="warn" label="Vacant" value={p.units - p.occupied} />
        <Stat icon="wallet" tone="gold" label="Annual income" value={moneyShort(p.rentPerUnit * p.occupied)} money />
      </div>
      <div className="section-head"><h3>Units</h3><div>{p.verified ? <Vbadge state="verified" /> : <Vbadge state="pending" />}</div></div>
      <div className="table-wrap">
        <table className="dtable">
          <thead><tr><th>Unit</th><th>Beds</th><th>Tenant</th><th className="money">Rent / yr</th><th>Rent status</th><th>Lease ends</th></tr></thead>
          <tbody>{units.map(u => (
            <tr key={u.no} onClick={() => u.tenant && ctx.go('tenants')}>
              <td data-label="Unit" style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{u.no}</td>
              <td data-label="Beds">{u.beds}</td>
              <td data-label="Tenant">{u.tenant ? <Avatar name={u.tenant} /> : <span style={{ color: 'var(--ink-400)' }}>—</span>}</td>
              <td data-label="Rent / yr" className="money">{money(u.rent)}</td>
              <td data-label="Rent status">{u.status === 'Vacant' ? <span className="chip chip--draft"><span className="dot"></span>Vacant</span> : rentChip(u.due)}</td>
              <td data-label="Lease ends" style={{ color: 'var(--ink-500)' }}>{u.leaseEnd || '—'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Photo uploader (real file read → data URLs) ---------------- */
function PhotoUploader({ photos, onChange }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  function addFiles(files) {
    const imgs = [...files].filter(f => f.type.startsWith('image/'));
    if (!imgs.length) return;
    Promise.all(imgs.map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = e => res(e.target.result);
      r.readAsDataURL(f);
    }))).then(urls => onChange([...photos, ...urls]));
  }
  return (
    <div>
      <div className="photo-grid">
        {photos.map((src, i) => (
          <div key={i} className="photo-thumb" style={{ backgroundImage: 'url(' + src + ')' }}>
            {i === 0 && <span className="photo-cover">Cover</span>}
            <button type="button" className="photo-del" title="Remove photo" onClick={() => onChange(photos.filter((_, j) => j !== i))}><Icon name="x" /></button>
          </div>
        ))}
        <button type="button" className={"photo-add" + (drag ? ' drag' : '')} onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}>
          <Icon name="camera" /><span>{photos.length ? 'Add more' : 'Add photos'}</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

/* ---------------- Add Property form ---------------- */
function AddProperty({ ctx }) {
  const [done, setDone] = useState(false);
  const [f, setF] = useState({ name: '', type: 'Apartment Block', city: 'Lagos', area: '', units: '', rentPerUnit: '', address: '', photos: [] });
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));
  const unitsNum = Number(String(f.units).replace(/[^\d]/g, '')) || 0;
  const rentNum = Number(String(f.rentPerUnit).replace(/[^\d]/g, '')) || 0;
  const valid = f.name.trim() && f.area.trim() && unitsNum > 0;

  function submit() {
    if (!valid) return;
    const id = 'lp' + Date.now();
    window.LD.properties.unshift({
      id, name: f.name.trim(), type: f.type, area: f.area.trim(), city: f.city,
      units: unitsNum, occupied: 0, verified: false, rentPerUnit: rentNum,
      image: f.type + ' · ' + f.area.trim(), photos: f.photos
    });
    window.LD.units[id] = Array.from({ length: unitsNum }, (_, i) => ({
      no: String(i + 1), beds: '—', tenant: null, status: 'Vacant', rent: rentNum, due: null, leaseEnd: null
    }));
    setDone(true);
  }

  if (done) return (
    <div className="page" style={{ maxWidth: 540 }}>
      <div className="card card-pad" style={{ textAlign: 'center', padding: 40 }}>
        <div className="status-badge ok" style={{ width: 80, height: 80, margin: '0 auto 16px', background: 'var(--success-bg)', color: 'var(--success)', borderRadius: '50%', display: 'grid', placeItems: 'center' }}><Icon name="check" style={{ width: 38, height: 38 }} /></div>
        <h2 className="page-title" style={{ fontSize: '1.5rem' }}>{f.name.trim()} added</h2>
        <p className="page-sub" style={{ marginBottom: 20 }}>It’s now in your portfolio with {unitsNum} {unitsNum === 1 ? 'unit' : 'units'}, pending verification. We’ll cross-check the documents with the land registry — it earns a <b>Verified</b> badge within 24–48 hours.</p>
        <button className="btn btn-primary" onClick={() => ctx.go('properties')}>Back to properties</button>
      </div>
    </div>
  );
  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('properties')}><Icon name="arrowLeft" />Cancel</span>
      <PageHeader title="Add a property" sub="List a new building. Verified properties earn tenant trust and qualify for escrow." />
      <div className="card card-pad">
        <h3 className="section-head" style={{ display: 'block' }}>Property details</h3>
        <div className="grid cols-2">
          <Field label="Property name" req><input className="input" value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Admiralty Court" /></Field>
          <Field label="Property type"><select className="select" value={f.type} onChange={e => set('type', e.target.value)}>{['Apartment Block', 'Terrace Duplex', 'Detached Duplex', 'Block of Flats', 'Bungalow'].map(t => <option key={t}>{t}</option>)}</select></Field>
          <Field label="City"><select className="select" value={f.city} onChange={e => set('city', e.target.value)}><option>Lagos</option><option>Abuja</option><option>Port Harcourt</option></select></Field>
          <Field label="Area / neighbourhood" req><input className="input" value={f.area} onChange={e => set('area', e.target.value)} placeholder="e.g. Lekki Phase 1" /></Field>
          <Field label="Number of units" req><input className="input" inputMode="numeric" value={f.units} onChange={e => set('units', e.target.value.replace(/[^\d]/g, ''))} placeholder="6" /></Field>
          <Field label="Annual rent per unit"><div className="input-group"><span className="prefix">₦</span><input className="input" inputMode="numeric" value={f.rentPerUnit} onChange={e => set('rentPerUnit', e.target.value.replace(/[^\d]/g, ''))} placeholder="4,800,000" /></div></Field>
        </div>
        <Field label="Full address"><input className="input" value={f.address} onChange={e => set('address', e.target.value)} placeholder="Street, area, city" /></Field>

        <h3 className="section-head" style={{ display: 'block', marginTop: 8 }}>Property photos</h3>
        <Field label="" hint="The first photo becomes the cover shown across your portfolio. Drag images in, or click to browse."><PhotoUploader photos={f.photos} onChange={ph => set('photos', ph)} /></Field>

        <h3 className="section-head" style={{ display: 'block', marginTop: 8 }}>Ownership documents</h3>
        <div className="trust-callout" style={{ marginBottom: 14 }}><Icon name="shieldCheck" /><p>Upload your <b>C of O</b> and one other ownership document. Verified properties get 3× more enquiries.</p></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {['Certificate of Occupancy (C of O)', 'Deed of Assignment / Survey Plan'].map(d => <MiniUpload key={d} label={d} />)}
        </div>
        <button className="btn btn-primary btn-lg" style={{ marginTop: 20 }} disabled={!valid} onClick={submit}>Submit for verification<Icon name="arrowRight" /></button>
      </div>
    </div>
  );
}

function MiniUpload({ label }) {
  const [s, setS] = useState('idle');
  return s === 'idle'
    ? <div className="upload" style={{ padding: 16 }} onClick={() => { setS('up'); setTimeout(() => setS('done'), 1100); }}><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-800)' }}><Icon name="file" style={{ width: 17, height: 17, verticalAlign: '-3px', marginRight: 6, color: 'var(--primary)' }} />Upload {label}</div></div>
    : <div className="file-row"><div className="file-ic"><Icon name="file" /></div><div className="file-meta"><div className="file-name">{label}</div><div className="file-sub">{s === 'up' ? 'Uploading…' : <><Icon name="check" style={{ width: 14, height: 14, color: 'var(--success)' }} />Uploaded</>}</div>{s === 'up' && <div className="file-bar"><div className="fill" style={{ width: '100%' }} /></div>}</div></div>;
}

/* ---------------- Tenants ---------------- */
function Tenants({ ctx }) {
  const [sel, setSel] = useState(null);
  const [filter, setFilter] = useState('All');
  if (sel) return <TenantProfile ctx={ctx} id={sel} onBack={() => setSel(null)} />;
  const list = window.LD.tenants.filter(t => filter === 'All' || (filter === 'Paid' && t.status === 'paid') || (filter === 'Outstanding' && t.status !== 'paid'));
  return (
    <div className="page">
      <PageHeader title="Tenants" sub="Everyone renting across your portfolio." actions={<button className="btn btn-secondary"><Icon name="download" />Export</button>} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {['All', 'Paid', 'Outstanding'].map(f => <button key={f} className={"toggle-pill" + (filter === f ? " on" : "")} onClick={() => setFilter(f)} style={{ padding: '8px 14px' }}>{f}</button>)}
      </div>
      <div className="table-wrap">
        <table className="dtable">
          <thead><tr><th>Tenant</th><th>Unit</th><th>Trust</th><th className="money">Rent / yr</th><th>Status</th><th>Since</th></tr></thead>
          <tbody>{list.map(t => (
            <tr key={t.id} onClick={() => setSel(t.id)}>
              <td data-label="Tenant"><div className="avatar-block"><Avatar name={t.name} /><div className="avatar-meta"><span className="avatar-name">{t.name}{t.verified && <Icon name="shieldCheck" style={{ width: 13, height: 13, color: 'var(--success)', verticalAlign: '-2px', marginLeft: 4 }} />}</span></div></div></td>
              <td data-label="Unit" style={{ color: 'var(--ink-500)' }}>{t.unit}</td>
              <td data-label="Trust"><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: t.trust >= 85 ? 'var(--success-text)' : t.trust >= 65 ? 'var(--gold-600)' : 'var(--error-text)' }}>{t.trust}</span></td>
              <td data-label="Rent / yr" className="money">{money(t.rent)}</td>
              <td data-label="Status">{rentChip(t.status)}</td>
              <td data-label="Since" style={{ color: 'var(--ink-500)' }}>{t.since}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

function TenantProfile({ ctx, id, onBack }) {
  const t = window.LD.findTenant(id);
  return (
    <div className="page" style={{ maxWidth: 860 }}>
      <span className="link" style={{ marginBottom: 14 }} onClick={onBack}><Icon name="arrowLeft" />All tenants</span>
      <div className="profile-head" style={{ marginBottom: 22 }}>
        <div className="avatar avatar--lg" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>{t.name.split(' ').map(s => s[0]).join('')}</div>
        <div style={{ flex: 1 }}><div className="ph-name">{t.name}</div><div className="ph-sub">{t.unit} · Tenant since {t.since}</div></div>
        <div style={{ textAlign: 'right' }}><div style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'rgba(255,255,255,.7)' }}>Trust score</div><div style={{ font: 'var(--text-h1)', fontFamily: 'var(--font-mono)', color: '#fff' }}>{t.trust}</div></div>
      </div>
      <div className="grid cols-3" style={{ marginBottom: 22 }}>
        <div className="card card-pad"><div className="stat-label">Verification</div><div style={{ marginTop: 8 }}>{t.verified ? <Vbadge state="verified" /> : <Vbadge state="unverified" />}</div></div>
        <div className="card card-pad"><div className="stat-label">Rent status</div><div style={{ marginTop: 8 }}>{rentChip(t.status)}</div></div>
        <div className="card card-pad"><div className="stat-label">Maintenance requests</div><div className="stat-value" style={{ fontSize: '1.4rem' }}>{t.maintHistory}</div></div>
      </div>
      <div className="grid cols-2">
        <div className="card card-pad">
          <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Contact</h3>
          {[['phone', t.phone], ['mail', t.email]].map(c => <div key={c[1]} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', font: 'var(--text-sm)', color: 'var(--ink-700)' }}><Icon name={c[0]} style={{ width: 17, height: 17, color: 'var(--ink-400)' }} />{c[1]}</div>)}
          <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Message tenant</button>
        </div>
        <div className="card card-pad">
          <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Payment history</h3>
          {t.payHistory.map((h, i) => <div key={i} className="settings-row"><div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{h[0]}</div></div><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span className="money" style={{ fontWeight: 600 }}>{money(h[1])}</span>{rentChip(h[2])}</div></div>)}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, Properties, AddProperty, Tenants, MiniUpload, PhotoUploader });
