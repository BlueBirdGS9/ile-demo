/* Ilé Realtor — Win mandates: discover properties owners have opened to offers
   and pitch to manage them. Only opened properties are visible (no cold-pitch). */

function AgencyMetric({ value, label, tone }) {
  return <div className="ag-metric"><div className="agm-val" style={tone ? { color: tone } : null}>{value}</div><div className="agm-label">{label}</div></div>;
}

function ProposalModal({ prop, agency, onClose, onSubmit }) {
  const [feePct, setFeePct] = useState(agency.feePct);
  const [message, setMessage] = useState('We\u2019d love to manage ' + prop.name + '. ' + agency.name + ' covers ' + prop.region + ' with escrow-backed rent and clear monthly statements.');
  const valid = message.trim() && feePct > 0;
  return (
    <div className="modal-scrim" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div><div className="modal-title">Pitch for {prop.name}</div><div className="modal-sub">{prop.area}, {prop.city} · {prop.units} units · owner {prop.ownerName}</div></div>
          <button className="modal-x" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="oversight-note" style={{ marginBottom: 16 }}><Icon name="eye" style={{ color: 'var(--info-text)' }} />Your verified profile, track record and rating are shared with the owner automatically.</div>
          <Field label="Your management fee" req hint="Owners compare offers on fee and services — price competitively.">
            <div className="seg">{[7, 8, 10, 12].map(v => <button key={v} type="button" className={"seg-btn" + (feePct === v ? ' on' : '')} onClick={() => setFeePct(v)}>{v}%</button>)}</div>
          </Field>
          <Field label="Services you'll provide">
            <div className="chip-row">{agency.services.map(s => <span key={s} className="spec-chip">{s}</span>)}</div>
          </Field>
          <Field label="Pitch to the owner" req><textarea className="input" rows={3} value={message} onChange={e => setMessage(e.target.value)} style={{ resize: 'vertical', minHeight: 80 }}></textarea></Field>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => onSubmit({ feePct, message: message.trim() })}><Icon name="send" />Send proposal</button>
        </div>
      </div>
    </div>
  );
}

function WinMandates({ m, ctx, reload }) {
  const [region, setRegion] = useState('All');
  const [pitching, setPitching] = useState(null);
  const agency = window.MGMT.agencies.find(a => a.id === 'ag-prime');
  const regions = ['All', 'Lagos — Island', 'Lagos — Mainland', 'Abuja', 'Port Harcourt'];
  const open = (m.openProperties || []).filter(p => region === 'All' || p.region === region);
  const myOffer = pid => (m.offers || []).find(o => o.propId === pid && o.agencyId === 'ag-prime');

  function sendProposal(prop, payload) {
    window.MGMT.update(mm => window.MGMT.pushOffer(mm, {
      propId: prop.id, propName: prop.name, agencyId: 'ag-prime', agencyName: agency.name,
      lead: agency.lead, trust: agency.trust, rating: agency.rating, feePct: payload.feePct,
      services: agency.services, message: payload.message, when: 'Just now', status: 'pending'
    }));
    setPitching(null); reload();
    ctx.toast('Proposal sent to ' + prop.ownerName.split(' ')[0]);
  }

  return (
    <div>
      <div className="oversight-note" style={{ marginBottom: 16 }}><Icon name="compass" style={{ color: 'var(--primary)' }} />Properties owners have opened to offers. Pitch to win the management mandate — you only see properties owners have made available.</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {regions.map(r => <button key={r} className={"toggle-pill" + (region === r ? ' on' : '')} onClick={() => setRegion(r)} style={{ padding: '8px 14px' }}>{r}</button>)}
      </div>
      {open.length === 0 ? (
        <div className="card"><EmptyState icon="inbox" title="No open properties here" desc="When an owner opens a property to offers in your coverage area, it appears here to pitch." /></div>
      ) : (
        <div className="grid cols-2">
          {open.map(p => {
            const mine = myOffer(p.id);
            return (
              <div key={p.id} className="agent-card">
                <div className="ac-top">
                  <div className="mp-thumb"><Icon name="building" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{p.name}</span></div>
                    <div className="msg-snip" style={{ marginTop: 2 }}>{p.area}, {p.city} · {p.region}</div>
                  </div>
                </div>
                <div className="ag-metrics">
                  <AgencyMetric value={p.units} label="units" />
                  <AgencyMetric value={p.occupied + '/' + p.units} label="let" tone="var(--success)" />
                  <AgencyMetric value={moneyShort(p.rentPerUnit)} label="rent / unit" />
                  <AgencyMetric value={p.ownerTrust} label="owner trust" tone="var(--gold-600)" />
                </div>
                <div className="ac-foot">
                  <span style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>Owner: {p.ownerName} · opened {p.when}</span>
                  <div style={{ marginLeft: 'auto' }}>
                    {mine
                      ? <span className={"chip chip--" + (mine.status === 'accepted' ? 'paid' : mine.status === 'declined' ? 'overdue' : 'progress')}><span className="dot"></span>{mine.status === 'accepted' ? 'You won this' : mine.status === 'declined' ? 'Not selected' : 'Proposal sent · ' + mine.feePct + '%'}</span>
                      : <button className="btn btn-primary btn-sm" onClick={() => ctx.requireVerified(() => setPitching(p))}><Icon name="send" />Send proposal</button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {pitching && <ProposalModal prop={pitching} agency={agency} onClose={() => setPitching(null)} onSubmit={p => sendProposal(pitching, p)} />}
    </div>
  );
}

/* ---------------- Managed property detail (realtor side) ---------------- */
const lpRent = s => s === 'paid' ? <Chip kind="paid">Paid</Chip> : s === 'due' ? <Chip kind="due">Due</Chip> : s === 'overdue' ? <Chip kind="overdue">Overdue</Chip> : <Chip kind="draft">Vacant</Chip>;
const lpEscrow = e => e === 'released' ? <Chip kind="paid">Released</Chip> : e === 'held' ? <Chip kind="escrow">In escrow</Chip> : e === 'pending' ? <Chip kind="draft">Pending</Chip> : null;
const lpApIcon = t => ({ maintenance: 'wrench', tenant: 'user', rent: 'trend', lease: 'doc' }[t] || 'bell');
function lpFeedRow(ev, i) {
  return (
    <div key={ev.id || i} className="feed-item">
      <div className={"feed-ic tone-" + (ev.tone || 'info')}><Icon name={ev.icon || 'info'} /></div>
      <div className="feed-txt">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span className="msg-name">{ev.title}</span><span className="msg-time" style={{ flex: 'none' }}>{ev.when}</span></div>
        <div className="t" style={{ marginTop: 2 }}>{ev.detail}</div>
      </div>
    </div>
  );
}

function findManagedProperty(id) {
  const m = window.MGMT.load();
  const cp = (m.properties || []).find(x => x.id === id);
  if (cp) return { prop: cp, owner: cp.owner || m.owner, feePct: cp.feePct || m.feePct, onApp: true, since: m.manager.since, m };
  for (const c of (window.RT.externalClients || [])) {
    const ep = c.properties.find(x => x.id === id);
    if (ep) return { prop: ep, owner: c.owner, feePct: c.feePct, onApp: false, since: c.since, m };
  }
  return null;
}

function LettingProperty({ ctx, id }) {
  const [, bump] = useState(0);
  const reload = () => bump(n => n + 1);
  const [requesting, setRequesting] = useState(false);
  const found = findManagedProperty(id);
  if (!found) return <div className="page"><span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('lettings')}><Icon name="arrowLeft" />Management</span><div className="card"><EmptyState icon="inbox" title="Property not found" desc="It may no longer be under your management." /></div></div>;
  const { prop, owner, feePct, onApp, since, m } = found;
  const roll = prop.roll || [];
  const occ = roll.filter(r => r.tenant).length;
  const collected = roll.filter(r => r.status === 'paid').reduce((s, r) => s + (r.rent || 0), 0);
  const fee = Math.round(collected * feePct / 100);
  const approvals = onApp ? (m.approvals || []).filter(a => a.propId === id) : [];
  const feed = onApp ? (m.feed || []).filter(f => f.propId === id) : [];

  function remind(r) {
    if (onApp) window.MGMT.update(mm => window.MGMT.pushFeed(mm, { propId: id, propName: prop.name, unit: r.unit, icon: 'bell', tone: 'warn', title: 'Rent reminder sent', detail: r.tenant + ' · reminded about ' + r.status + ' rent', when: 'Just now' }));
    reload(); ctx.toast('Reminder sent to ' + r.tenant.split(' ')[0] + (onApp ? ' · logged for owner' : ''));
  }
  function submitRequest(p) {
    window.MGMT.update(mm => mm.approvals.unshift({ id: 'ap' + Date.now(), propId: id, propName: prop.name, unit: p.unit, type: p.type, title: p.title, detail: p.detail, amount: p.amount, by: m.manager.name, when: 'Just now', status: 'pending' }));
    setRequesting(false); reload(); ctx.toast('Sent to ' + owner.name.split(' ')[0] + ' for approval');
  }

  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('lettings')}><Icon name="arrowLeft" />Management</span>
      <div className="page-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><h1 className="page-title">{prop.name}</h1><Vbadge state="verified" /></div>
          <p className="page-sub">{prop.area}, {prop.city} · {prop.type} · {prop.units} units · for {owner.name}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Message owner</button>
          {onApp && <button className="btn btn-primary" onClick={() => ctx.requireVerified(() => setRequesting(true))}><Icon name="send" />Request approval</button>}
        </div>
      </div>

      <div className="manager-card" style={{ marginBottom: 22 }}>
        <TrustRing val={owner.trust} size={50} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{owner.name}</span><Vbadge state="verified" sm />{onApp ? <span className="chip chip--escrow"><span className="dot"></span>On Ilé</span> : <span className="chip chip--draft"><span className="dot"></span>Managed offline</span>}</div>
          <div className="msg-snip" style={{ marginTop: 2 }}>{feePct}% management fee{since ? ' · since ' + since : ''} · {onApp ? 'sees this property live; approvals route to them in-app' : 'no owner app — coordinate directly'}</div>
        </div>
      </div>

      <div className="grid cols-4" style={{ marginBottom: 22 }}>
        <Stat icon="building" tone="info" label="Units" value={prop.units} foot={<span className="stat-delta">{occ} let · {prop.units - occ} vacant</span>} />
        <Stat icon="users" tone="green" label="Occupancy" value={occ + '/' + prop.units} foot={<span className="stat-delta up">{Math.round(occ / prop.units * 100)}% let</span>} />
        <Stat icon="wallet" tone="green" label="Collected" value={moneyShort(collected)} money foot={<span className="stat-delta">this cycle</span>} />
        <Stat icon="trend" tone="green" label="Your fee" value={moneyShort(fee)} money foot={<span className="stat-delta">{feePct}% of collected</span>} />
      </div>

      <div className="section-head" style={{ marginBottom: 12 }}><h3>Rent roll</h3></div>
      <div className="table-wrap" style={{ marginBottom: 24 }}>
        <table className="dtable">
          <thead><tr><th>Unit</th><th>Tenant</th><th>Trust</th><th className="money">Rent</th><th>Status</th><th>Escrow</th><th></th></tr></thead>
          <tbody>{roll.map(r => (
            <tr key={r.unit}>
              <td data-label="Unit" style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{prop.name.split(' ')[0]} · {r.unit}</td>
              <td data-label="Tenant" style={{ color: 'var(--ink-700)' }}>{r.tenant || <span style={{ color: 'var(--ink-400)' }}>Vacant</span>}</td>
              <td data-label="Trust">{r.tenant ? <span className="trust-pill">{r.trust}</span> : '—'}</td>
              <td data-label="Rent" className="money">{r.rent ? money(r.rent) : '—'}</td>
              <td data-label="Status">{lpRent(r.status)}</td>
              <td data-label="Escrow">{r.tenant ? lpEscrow(r.escrow) : '—'}</td>
              <td>{!r.tenant ? (onApp ? <button className="btn btn-secondary btn-sm" onClick={() => setRequesting(true)}>Propose tenant</button> : <span style={{ color: 'var(--ink-300)' }}>—</span>) : (r.status === 'overdue' || r.status === 'due') ? <button className="btn btn-secondary btn-sm" onClick={() => remind(r)}><Icon name="bell" />Remind</button> : <span style={{ color: 'var(--ink-300)' }}>—</span>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {onApp ? (
        <div className="grid cols-2" style={{ gap: 20, alignItems: 'start' }}>
          <div>
            <div className="section-head" style={{ marginBottom: 12 }}><h3 style={{ fontSize: '1rem' }}>Approvals for this property</h3></div>
            {approvals.length ? (
              <div className="grid" style={{ gap: 12 }}>{approvals.map(ap => (
                <div key={ap.id} className={"approval-card" + (ap.status !== 'pending' ? ' resolved' : '')}>
                  <div className={"ap-ic tone-" + (ap.type === 'maintenance' ? 'warn' : ap.type === 'tenant' ? 'info' : 'green')}><Icon name={lpApIcon(ap.type)} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}><span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{ap.title}</span>{ap.amount ? <span className="ap-amount">{money(ap.amount)}</span> : null}</div>
                    <div className="msg-snip" style={{ marginTop: 3 }}>{ap.unit ? 'Unit ' + ap.unit + ' · ' : ''}{ap.when}</div>
                    <div style={{ marginTop: 10 }}>{ap.status === 'pending' ? <span className="chip chip--progress"><span className="dot"></span>Awaiting {owner.name.split(' ')[0]}</span> : <span className={"chip chip--" + (ap.status === 'approved' ? 'paid' : 'overdue')}><span className="dot"></span>{ap.status === 'approved' ? 'Approved — clear to proceed' : 'Declined — on hold'}</span>}</div>
                  </div>
                </div>
              ))}</div>
            ) : <div className="card"><EmptyState icon="check" title="Nothing pending" desc="Raise a request when something exceeds this owner's delegation limits." actions={<button className="btn btn-primary btn-sm" onClick={() => setRequesting(true)}><Icon name="send" />Request approval</button>} /></div>}
          </div>
          <div>
            <div className="section-head" style={{ marginBottom: 12 }}><h3 style={{ fontSize: '1rem' }}>Activity the owner sees</h3></div>
            <div className="card card-pad">{feed.length ? <div className="feed">{feed.map(lpFeedRow)}</div> : <EmptyState icon="inbox" title="No activity yet" desc="Your actions on this property appear here for the owner." />}</div>
          </div>
        </div>
      ) : (
        <div className="oversight-note"><Icon name="user" style={{ color: 'var(--ink-400)' }} />{owner.name} manages offline — there's no owner app to share live activity or route approvals to. Coordinate with them directly.</div>
      )}

      {requesting && <RequestApprovalModal m={m} lockProp={prop} onClose={() => setRequesting(false)} onSubmit={submitRequest} />}
    </div>
  );
}

Object.assign(window, { WinMandates, ProposalModal, LettingProperty });
