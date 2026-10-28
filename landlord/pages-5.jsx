/* Ilé Landlord — Appoint a manager: discover, compare and appoint a managing
   agency, and choose which properties to delegate. The front of the funnel. */

const ISLAND_AREAS = ['Lekki', 'Ikoyi', 'Victoria Island', 'Banana Island', 'Oniru', 'VI'];
function regionOf(p) {
  if (p.city === 'Lagos') return ISLAND_AREAS.some(a => (p.area || '').includes(a)) ? 'Lagos — Island' : 'Lagos — Mainland';
  return p.city;
}
function agencyCovers(a, p) { return a.cities.includes(regionOf(p)); }

/* Build a management rent-roll for one of the owner's properties from LD data */
const SYNTH = [['Bola Martins', 84], ['Ngozi Umeh', 88], ['Yakubu Sani', 76], ['Chika Eze', 90], ['Tope Alabi', 81], ['Ruth Danjuma', 79]];
function buildRoll(p) {
  const src = window.LD.units[p.id];
  if (src && src.length) {
    return src.map(u => {
      const t = (window.LD.tenants || []).find(x => x.name === u.tenant);
      const occ = u.tenant && u.status !== 'Vacant';
      const pay = u.due || 'paid';
      return { unit: u.no, tenant: occ ? u.tenant : null, trust: occ ? (t ? t.trust : 82) : undefined, verified: occ ? (t ? t.verified : true) : false,
        rent: u.rent || p.rentPerUnit, status: occ ? pay : 'vacant', escrow: occ ? (pay === 'paid' ? 'held' : 'pending') : null, due: u.leaseEnd || '' };
    });
  }
  return Array.from({ length: p.units }, (_, i) => {
    const occ = i < (p.occupied != null ? p.occupied : p.units);
    const s = SYNTH[i % SYNTH.length];
    return { unit: String(i + 1), tenant: occ ? s[0] : null, trust: occ ? s[1] : undefined, verified: occ,
      rent: p.rentPerUnit, status: occ ? 'paid' : 'vacant', escrow: occ ? 'released' : null, due: occ ? '2026' : '' };
  });
}

function AgencyMetric({ value, label, tone }) {
  return <div className="ag-metric"><div className="agm-val" style={tone ? { color: tone } : null}>{value}</div><div className="agm-label">{label}</div></div>;
}

function AgencyCard({ a, ctx, onAppoint }) {
  return (
    <div className="agent-card">
      <div className="ac-top">
        <div onClick={() => ctx.go('agencyDetail', a.id)} style={{ cursor: 'pointer' }}><TrustRing val={a.trust} size={56} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="ac-name" onClick={() => ctx.go('agencyDetail', a.id)}>{a.name}</span>
            {a.verified && <Vbadge state="verified" sm />}
            {a.self && <span className="chip chip--escrow"><span className="dot"></span>On Ilé</span>}
          </div>
          <div className="msg-snip" style={{ marginTop: 2 }}>{a.cities.join(' · ')} · led by {a.lead}</div>
        </div>
        <div className="fee-big"><span className="fee-num">{a.feePct}%</span><span className="fee-cap">mgmt fee</span></div>
      </div>
      <div className="ag-metrics">
        <AgencyMetric value={a.managed} label="managed" />
        <AgencyMetric value={a.occupancy + '%'} label="occupancy" tone="var(--success)" />
        <AgencyMetric value={a.daysToLet + 'd'} label="avg to let" />
        <AgencyMetric value={'★ ' + a.rating.toFixed(1)} label={a.reviews + ' reviews'} tone="var(--gold-600)" />
      </div>
      <div className="chip-row">{a.services.map(s => <span key={s} className="spec-chip">{s}</span>)}</div>
      <div className="ac-foot">
        <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--ink-200)' }} onClick={() => ctx.go('agencyDetail', a.id)}>View profile</button>
        <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => onAppoint(a)}><Icon name="briefcase" />Appoint</button>
      </div>
    </div>
  );
}

function FindManager({ ctx }) {
  const [m] = useState(() => window.MGMT.load());
  const [tab, setTab] = useState('browse');
  const [region, setRegion] = useState('All');
  const [appointing, setAppointing] = useState(null);
  const regions = ['All', 'Lagos — Island', 'Lagos — Mainland', 'Abuja', 'Port Harcourt'];
  const list = window.MGMT.agencies.filter(a => region === 'All' || a.cities.includes(region));
  const openOffers = (m.offers || []).filter(o => o.status === 'pending').length;

  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('managed')}><Icon name="arrowLeft" />Managed properties</span>
      <PageHeader title="Appoint a managing agent" sub="Go find an agency yourself, or open a property and let verified agencies pitch to you." />

      <div className="mkt-tabs">
        <button className={"toggle-pill" + (tab === 'browse' ? ' on' : '')} onClick={() => setTab('browse')}>Browse agencies</button>
        <button className={"toggle-pill" + (tab === 'offers' ? ' on' : '')} onClick={() => setTab('offers')}>Invite offers{openOffers > 0 && <span className="tab-n tab-n--alert">{openOffers}</span>}</button>
      </div>

      {tab === 'browse' && (
        <div>
          <div className="oversight-note" style={{ marginBottom: 18 }}><Icon name="shieldCheck" style={{ color: 'var(--success)' }} />Every agency on Ilé is verified, and rent always flows to you through escrow — the manager never touches your money.</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {regions.map(r => <button key={r} className={"toggle-pill" + (region === r ? ' on' : '')} onClick={() => setRegion(r)} style={{ padding: '8px 14px' }}>{r}</button>)}
          </div>
          <div className="grid cols-2">
            {list.map(a => <AgencyCard key={a.id} a={a} ctx={ctx} onAppoint={setAppointing} />)}
          </div>
        </div>
      )}

      {tab === 'offers' && <InviteOffers ctx={ctx} />}

      {appointing && <AppointModal agency={appointing} managed={m.properties} onClose={() => setAppointing(null)} ctx={ctx} />}
    </div>
  );
}

function AgencyDetail({ ctx, id }) {
  const [m] = useState(() => window.MGMT.load());
  const a = window.MGMT.findAgency(id) || window.MGMT.agencies[0];
  const [appointing, setAppointing] = useState(false);
  const reviews = window.MGMT.agencyReviews[a.id] || [];

  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('findManager')}><Icon name="arrowLeft" />All agencies</span>
      <div className="pd-grid">
        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <TrustRing val={a.trust} size={64} label="Trust" tier={a.trust >= 92 ? 'Excellent' : 'Verified'} />
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><h2 className="page-title" style={{ fontSize: '1.3rem' }}>{a.name}</h2><Vbadge state="verified" /></div>
                <div className="page-sub" style={{ marginBottom: 0 }}>{a.cities.join(' · ')} · led by {a.lead}</div>
              </div>
              <div className="fee-big"><span className="fee-num">{a.feePct}%</span><span className="fee-cap">mgmt fee</span></div>
            </div>
            <div className="ag-metrics" style={{ marginTop: 16 }}>
              <AgencyMetric value={a.managed} label="properties managed" />
              <AgencyMetric value={a.occupancy + '%'} label="occupancy delivered" tone="var(--success)" />
              <AgencyMetric value={a.daysToLet + ' days'} label="avg time to let" />
              <AgencyMetric value={'★ ' + a.rating.toFixed(1)} label={a.reviews + ' owner reviews'} tone="var(--gold-600)" />
            </div>
            <button className="btn btn-primary btn-lg" style={{ marginTop: 18, width: '100%' }} onClick={() => setAppointing(true)}><Icon name="briefcase" />Appoint {a.name}</button>
          </div>

          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h3 className="section-head" style={{ display: 'block' }}>About</h3>
            <p style={{ font: 'var(--text-sm)', color: 'var(--ink-700)', margin: 0, lineHeight: 1.6 }}>{a.blurb}</p>
          </div>

          {reviews.length > 0 && (
            <div className="card card-pad">
              <h3 className="section-head" style={{ display: 'block' }}>Owner reviews</h3>
              <div className="feed">
                {reviews.map((r, i) => (
                  <div key={i} className="feed-item">
                    <div className="feed-ic tone-warn"><Icon name="star" /></div>
                    <div className="feed-txt">
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span className="msg-name">{r[0]}</span><span style={{ font: 'var(--text-micro)', fontFamily: 'var(--font-mono)', color: 'var(--gold-600)' }}>{'★'.repeat(r[1])}</span></div>
                      <div className="t" style={{ marginTop: 2 }}>“{r[2]}”</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Services included</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {['Rent collection', 'Maintenance', 'Tenant sourcing', 'Inspections', 'Legal & eviction', 'Concierge & furnishing'].map(s => {
                const on = a.services.includes(s);
                return <div key={s} className="svc-row"><Icon name={on ? 'check' : 'x'} style={{ color: on ? 'var(--success)' : 'var(--ink-300)', width: 16, height: 16 }} /><span style={{ color: on ? 'var(--ink-800)' : 'var(--ink-400)' }}>{s}</span></div>;
              })}
            </div>
          </div>
          <div className="card card-pad">
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>How your money moves</h3>
            <div className="svc-row"><Icon name="shieldCheck" style={{ color: 'var(--success)', width: 16, height: 16 }} /><span style={{ color: 'var(--ink-800)' }}>Tenant pays into Ilé escrow</span></div>
            <div className="svc-row"><Icon name="wallet" style={{ color: 'var(--ink-400)', width: 16, height: 16 }} /><span style={{ color: 'var(--ink-800)' }}>{a.feePct}% fee auto-deducted</span></div>
            <div className="svc-row"><Icon name="bank" style={{ color: 'var(--ink-400)', width: 16, height: 16 }} /><span style={{ color: 'var(--ink-800)' }}>Balance paid to your account</span></div>
          </div>
        </div>
      </div>
      {appointing && <AppointModal agency={a} managed={m.properties} onClose={() => setAppointing(false)} ctx={ctx} />}
    </div>
  );
}

/* Choose which properties to delegate + starting delegation terms */
function AppointModal({ agency, managed, onClose, ctx }) {
  const managedIds = (managed || []).map(p => p.id);
  const candidates = window.LD.properties.filter(p => !managedIds.includes(p.id));
  const [picked, setPicked] = useState(candidates.length === 1 ? [candidates[0].id] : []);
  const [maint, setMaint] = useState(50000);
  const [tenantApproval, setTenantApproval] = useState('manual');
  const [message, setMessage] = useState('I\u2019d like ' + agency.name + ' to manage the propert' + (candidates.length === 1 ? 'y' : 'ies') + ' below. Looking forward to working together.');
  const toggle = id => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const valid = picked.length > 0;

  function submit() {
    window.MGMT.update(mm => {
      picked.forEach(id => {
        const p = window.LD.properties.find(x => x.id === id);
        const property = { id: p.id, name: p.name, type: p.type, area: p.area, city: p.city, units: p.units, rentPerUnit: p.rentPerUnit, roll: buildRoll(p) };
        window.MGMT.pushRequest(mm, {
          ownerName: 'Chidi Nwosu', ownerTrust: 92, agencyId: agency.id, agencyName: agency.name,
          feePct: agency.feePct, property, dial: { maintThreshold: maint, tenantApproval }, message: message.trim(),
          when: 'Just now', status: 'pending'
        });
      });
    });
    onClose();
    ctx.toast('Request sent to ' + agency.name + (agency.self ? ' — they\u2019ll respond in-app' : ''));
    ctx.go('managed');
  }

  return (
    <div className="modal-scrim" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div><div className="modal-title">Appoint {agency.name}</div><div className="modal-sub">{agency.feePct}% management fee · {agency.services.length} services</div></div>
          <button className="modal-x" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <Field label="Which properties should they manage?" req>
            {candidates.length === 0 ? (
              <div className="oversight-note">All your properties are already under management.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {candidates.map(p => {
                  const on = picked.includes(p.id);
                  const covered = agencyCovers(agency, p);
                  return (
                    <div key={p.id} className={"appoint-pick" + (on ? ' on' : '')} onClick={() => toggle(p.id)}>
                      <div className={"pick-box" + (on ? ' on' : '')}>{on && <Icon name="check" />}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{p.name}</div>
                        <div className="msg-snip">{p.area}, {p.city} · {p.units} units · {moneyShort(p.rentPerUnit)}/unit</div>
                      </div>
                      {!covered && <span className="cover-warn" title="Outside this agency's usual coverage">Out of area</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </Field>

          <Field label="Starting delegation" hint="You can fine-tune this any time once they\u2019re appointed.">
            <div className="dial-row" style={{ paddingTop: 4 }}>
              <div style={{ flex: 1 }}><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>Auto-approve repairs under</div></div>
              <div className="seg">{[25000, 50000, 100000].map(v => <button key={v} type="button" className={"seg-btn" + (maint === v ? ' on' : '')} onClick={() => setMaint(v)}>₦{v / 1000}k</button>)}</div>
            </div>
            <div className="dial-row">
              <div style={{ flex: 1 }}><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>New tenants</div></div>
              <div className="seg">{[['auto', 'They decide'], ['manual', 'I approve']].map(([v, l]) => <button key={v} type="button" className={"seg-btn" + (tenantApproval === v ? ' on' : '')} onClick={() => setTenantApproval(v)}>{l}</button>)}</div>
            </div>
          </Field>

          <Field label="Message to the agency"><textarea className="input" rows={2} value={message} onChange={e => setMessage(e.target.value)} style={{ resize: 'vertical', minHeight: 60 }}></textarea></Field>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}><Icon name="send" />Send request{picked.length > 1 ? ' (' + picked.length + ')' : ''}</button>
        </div>
      </div>
    </div>
  );
}

/* Owner's outgoing requests — shown on the Managed page */
function OwnerRequests({ requests, ctx }) {
  const open = (requests || []).filter(r => r.status !== 'accepted');
  if (!open.length) return null;
  return (
    <div style={{ marginBottom: 26 }}>
      <div className="section-head" style={{ marginBottom: 12 }}><h3>Appointment requests</h3></div>
      <div className="grid" style={{ gap: 12 }}>
        {open.map(r => (
          <div key={r.id} className="issue-card" style={{ cursor: 'default', alignItems: 'flex-start' }}>
            <div className="mp-thumb"><Icon name="briefcase" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{r.property.name} → {r.agencyName}</div>
                {r.status === 'pending' ? <span className="chip chip--progress"><span className="dot"></span>Awaiting agency</span> : <span className="chip chip--overdue"><span className="dot"></span>Declined</span>}
              </div>
              <div className="msg-snip" style={{ marginTop: 3 }}>{r.property.units} units · {r.property.area}, {r.property.city} · {r.feePct}% fee · requested {r.when}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { FindManager, AgencyDetail, AppointModal, AgencyCard, OwnerRequests, buildRoll, regionOf, agencyCovers });
