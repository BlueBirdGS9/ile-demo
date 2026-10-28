/* Ilé Landlord — Managed properties (oversight of a delegated management mandate)
   The owner hands tenant-facing operations to Prime Realty but keeps full
   visibility: an approvals inbox, an activity feed, and a delegation dial. */

function ManagerCard({ m, ctx }) {
  const mg = m.manager;
  return (
    <div className="manager-card">
      <TrustRing val={mg.trust} size={56} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{mg.agency}</span>
          <Vbadge state="verified" sm />
          <span className="chip chip--escrow"><span className="dot"></span>Managing agent</span>
        </div>
        <div className="msg-snip" style={{ marginTop: 3 }}>{mg.name} · your point of contact · managing since {mg.since}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Message manager</button>
      </div>
    </div>
  );
}

function feedRow(ev, i) {
  return (
    <div key={ev.id || i} className="feed-item">
      <div className={"feed-ic tone-" + (ev.tone || 'info')}><Icon name={ev.icon || 'info'} /></div>
      <div className="feed-txt">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
          <span className="msg-name">{ev.title}</span>
          <span className="msg-time" style={{ flex: 'none' }}>{ev.when}</span>
        </div>
        <div className="t" style={{ marginTop: 2 }}>{ev.detail}</div>
        {ev.propName && <div className="feed-tag">{ev.propName}{ev.unit ? ' · Unit ' + ev.unit : ''}</div>}
      </div>
    </div>
  );
}

const apIcon = t => ({ maintenance: 'wrench', tenant: 'user', rent: 'trend', lease: 'doc' }[t] || 'bell');

function ApprovalCard({ ap, onApprove, onDecline }) {
  const resolved = ap.status !== 'pending';
  return (
    <div className={"approval-card" + (resolved ? ' resolved' : '')}>
      <div className={"ap-ic tone-" + (ap.type === 'maintenance' ? 'warn' : ap.type === 'tenant' ? 'info' : 'green')}><Icon name={apIcon(ap.type)} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{ap.title}</span>
          {ap.amount ? <span className="ap-amount">{money(ap.amount)}</span> : null}
        </div>
        <div className="msg-snip" style={{ marginTop: 3 }}>{ap.propName}{ap.unit ? ' · Unit ' + ap.unit : ''} · raised by {ap.by} · {ap.when}</div>
        <p style={{ font: 'var(--text-sm)', color: 'var(--ink-700)', margin: '10px 0 0', lineHeight: 1.55 }}>{ap.detail}</p>
        {resolved ? (
          <div style={{ marginTop: 12 }}>
            <span className={"chip chip--" + (ap.status === 'approved' ? 'paid' : 'overdue')}><span className="dot"></span>{ap.status === 'approved' ? 'You approved this' : 'You declined this'}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--ink-200)' }} onClick={() => onDecline(ap)}><Icon name="x" />Decline</button>
            <button className="btn btn-primary btn-sm" onClick={() => onApprove(ap)}><Icon name="check" />Approve</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* The delegation dial — the heart of "hands-off but informed" */
function Seg({ value, options, onChange }) {
  return (
    <div className="seg">
      {options.map(o => <button key={o.v} className={"seg-btn" + (value === o.v ? ' on' : '')} onClick={() => onChange(o.v)}>{o.label}</button>)}
    </div>
  );
}

function DelegationDial({ dial, onSet }) {
  const rows = [
    { key: 'maintThreshold', label: 'Auto-approve repairs under', hint: 'The manager handles repairs below this limit without asking you. Anything higher comes to your approvals inbox.',
      control: <Seg value={dial.maintThreshold} onChange={v => onSet('maintThreshold', v)} options={[{ v: 25000, label: '₦25k' }, { v: 50000, label: '₦50k' }, { v: 100000, label: '₦100k' }, { v: 250000, label: '₦250k' }]} /> },
    { key: 'tenantApproval', label: 'New tenants', hint: 'Whether the manager can let a vacant unit to a verified applicant, or needs your sign-off first.',
      control: <Seg value={dial.tenantApproval} onChange={v => onSet('tenantApproval', v)} options={[{ v: 'auto', label: 'Manager decides' }, { v: 'manual', label: 'I approve' }]} /> },
    { key: 'rentIncrease', label: 'Rent increases', hint: 'Adjusting rent at renewal.',
      control: <Seg value={dial.rentIncrease} onChange={v => onSet('rentIncrease', v)} options={[{ v: 'auto', label: 'Manager decides' }, { v: 'manual', label: 'I approve' }]} /> },
    { key: 'leaseRenewal', label: 'Lease renewals', hint: 'Renewing an existing tenant on the same terms.',
      control: <Seg value={dial.leaseRenewal} onChange={v => onSet('leaseRenewal', v)} options={[{ v: 'auto', label: 'Manager decides' }, { v: 'manual', label: 'I approve' }]} /> },
    { key: 'notify', label: 'Keep me informed', hint: 'How often routine activity reaches you. Approvals always notify you immediately.',
      control: <Seg value={dial.notify} onChange={v => onSet('notify', v)} options={[{ v: 'all', label: 'Every update' }, { v: 'digest', label: 'Weekly digest' }]} /> }
  ];
  return (
    <div className="card card-pad">
      <div className="section-head" style={{ marginBottom: 6 }}><h3 style={{ fontSize: '1rem' }}>Delegation settings</h3></div>
      <p style={{ font: 'var(--text-sm)', color: 'var(--ink-500)', margin: '0 0 8px' }}>Set how much Prime Realty handles on its own versus what needs your approval. Changes apply across your managed portfolio.</p>
      {rows.map(r => (
        <div key={r.key} className="dial-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r.label}</div>
            <div className="msg-snip" style={{ marginTop: 2 }}>{r.hint}</div>
          </div>
          <div style={{ flex: 'none' }}>{r.control}</div>
        </div>
      ))}
    </div>
  );
}

function Managed({ ctx }) {
  const [m, setM] = useState(() => window.MGMT.load());
  const [tab, setTab] = useState('approvals');
  const reload = () => setM(window.MGMT.load());

  const pending = m.approvals.filter(a => a.status === 'pending');
  const resolved = m.approvals.filter(a => a.status !== 'pending');
  const { units, occ } = window.MGMT.occupancy(m);
  const collected = window.MGMT.collectedThisCycle(m);
  const net = Math.round(collected * (1 - m.feePct / 100));

  function resolve(ap, status) {
    window.MGMT.update(mm => {
      const t = mm.approvals.find(x => x.id === ap.id); if (t) t.status = status;
      window.MGMT.pushFeed(mm, {
        propId: ap.propId, propName: ap.propName, unit: ap.unit,
        icon: status === 'approved' ? 'check' : 'x', tone: status === 'approved' ? 'green' : 'warn',
        title: status === 'approved' ? 'You approved: ' + ap.title : 'You declined: ' + ap.title,
        detail: status === 'approved' ? 'Prime Realty has been cleared to proceed.' : 'Prime Realty has been notified to hold.',
        when: 'Just now'
      });
    });
    reload();
    ctx.toast(status === 'approved' ? 'Approved — your manager can proceed' : 'Declined — manager notified');
  }
  function setDial(k, v) { window.MGMT.update(mm => { mm.dial[k] = v; }); reload(); ctx.toast('Delegation updated'); }

  return (
    <div className="page">
      <PageHeader title="Managed properties" sub="Your Abuja portfolio is run by Prime Realty. You stay out of day-to-day tenant contact — but see and approve everything that matters." actions={<button className="btn btn-primary" onClick={() => ctx.go('findManager')}><Icon name="briefcase" />Appoint a manager</button>} />

      <ManagerCard m={m} ctx={ctx} />

      <OwnerRequests requests={m.requests} ctx={ctx} />

      <div className="grid cols-4" style={{ margin: '22px 0' }}>
        <Stat icon="briefcase" tone="info" label="Under management" value={m.properties.length} foot={<span className="stat-delta">{units} units total</span>} />
        <Stat icon="users" tone="green" label="Occupancy" value={occ + '/' + units} foot={<span className="stat-delta up">{Math.round(occ / units * 100)}% let</span>} />
        <Stat icon="wallet" tone="green" label="Collected this cycle" value={moneyShort(collected)} money foot={<span className="stat-delta">via Ilé escrow</span>} />
        <Stat icon="bank" tone="info" label="Net to you" value={moneyShort(net)} money foot={<span className="stat-delta">after {m.feePct}% fee</span>} />
      </div>

      <div className="section-head" style={{ marginBottom: 12 }}><h3>Properties under management</h3></div>
      <div className="grid cols-2" style={{ marginBottom: 26 }}>
        {m.properties.map(p => {
          const o = (p.roll || []).filter(r => r.tenant).length;
          const due = (p.roll || []).filter(r => r.status === 'overdue' || r.status === 'due').length;
          return (
            <div key={p.id} className="managed-prop" onClick={() => ctx.go('managedProperty', p.id)}>
              <div className="mp-thumb"><Icon name="building" /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{p.name}</span><Vbadge state="verified" sm />{p.agencyName && p.agencyName !== m.manager.agency && <span className="chip chip--draft"><span className="dot"></span>{p.agencyName}</span>}</div>
                <div className="msg-snip" style={{ marginTop: 2 }}>{p.area}, {p.city} · {p.type}</div>
                <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap', font: 'var(--text-caption)', color: 'var(--ink-600)' }}>
                  <span><b style={{ color: 'var(--ink-900)' }}>{o}/{p.units}</b> let</span>
                  {due > 0 ? <span style={{ color: 'var(--gold-600)' }}>{due} rent item{due > 1 ? 's' : ''} open</span> : <span style={{ color: 'var(--success)' }}>All rent current</span>}
                </div>
              </div>
              <Icon name="chevronRight" style={{ color: 'var(--ink-300)', flex: 'none' }} />
            </div>
          );
        })}
      </div>

      <div className="mkt-tabs">
        <button className={"toggle-pill" + (tab === 'approvals' ? ' on' : '')} onClick={() => setTab('approvals')}>Needs your approval{pending.length > 0 && <span className="tab-n tab-n--alert">{pending.length}</span>}</button>
        <button className={"toggle-pill" + (tab === 'activity' ? ' on' : '')} onClick={() => setTab('activity')}>Activity</button>
        <button className={"toggle-pill" + (tab === 'delegation' ? ' on' : '')} onClick={() => setTab('delegation')}>Delegation</button>
      </div>

      {tab === 'approvals' && (
        <div>
          {pending.length === 0 && resolved.length === 0 ? (
            <div className="card"><EmptyState icon="check" title="Nothing needs you right now" desc="Prime Realty is handling everything within the limits you set. You'll be notified the moment a decision needs your sign-off." /></div>
          ) : (
            <div className="grid" style={{ gap: 12 }}>
              {pending.length === 0 && <div className="oversight-note"><Icon name="check" style={{ color: 'var(--success)' }} />You're all caught up — no decisions waiting.</div>}
              {pending.map(ap => <ApprovalCard key={ap.id} ap={ap} onApprove={a => ctx.requireVerified(() => resolve(a, 'approved'))} onDecline={a => resolve(a, 'declined')} />)}
              {resolved.length > 0 && <div className="section-head" style={{ margin: '12px 0 0' }}><h3 style={{ fontSize: '.95rem' }}>Recently decided</h3></div>}
              {resolved.map(ap => <ApprovalCard key={ap.id} ap={ap} />)}
            </div>
          )}
        </div>
      )}

      {tab === 'activity' && (
        <div className="card card-pad">
          <div className="oversight-note" style={{ marginBottom: 14 }}><Icon name="eye" style={{ color: 'var(--info-text)' }} />Everything your manager does, as it happens. You're an observer here — tenants never contact you directly.</div>
          <div className="feed">{m.feed.map(feedRow)}</div>
        </div>
      )}

      {tab === 'delegation' && <DelegationDial dial={m.dial} onSet={setDial} />}
    </div>
  );
}

/* ---------------- Managed property detail ---------------- */
function ManagedPropertyDetail({ ctx, id }) {
  const [m] = useState(() => window.MGMT.load());
  const [observing, setObserving] = useState(null);
  const p = m.properties.find(x => x.id === id) || m.properties[0];
  const roll = p.roll || [];
  const o = roll.filter(r => r.tenant).length;
  const collected = roll.filter(r => r.status === 'paid').reduce((s, r) => s + (r.rent || 0), 0);
  const propFeed = m.feed.filter(f => f.propId === p.id);
  const escrowChip = e => e === 'released' ? <Chip kind="paid">Released</Chip> : e === 'held' ? <Chip kind="escrow">In escrow</Chip> : <Chip kind="draft">Pending</Chip>;

  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('managed')}><Icon name="arrowLeft" />Managed properties</span>
      <div className="page-head">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><h1 className="page-title">{p.name}</h1><Vbadge state="verified" /><span className="chip chip--escrow"><span className="dot"></span>Managed by {m.manager.agency}</span></div>
          <p className="page-sub">{p.area}, {p.city} · {p.type} · {p.units} units</p>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 22 }}>
        <Stat icon="users" tone="green" label="Occupancy" value={o + '/' + p.units} foot={<span className="stat-delta up">{Math.round(o / p.units * 100)}% let</span>} />
        <Stat icon="wallet" tone="green" label="Collected this cycle" value={moneyShort(collected)} money />
        <Stat icon="bank" tone="info" label="Net to you" value={moneyShort(Math.round(collected * (1 - m.feePct / 100)))} money foot={<span className="stat-delta">after {m.feePct}% fee</span>} />
      </div>

      <div className="section-head" style={{ marginBottom: 12 }}><h3>Rent roll</h3></div>
      <div className="table-wrap" style={{ marginBottom: 24 }}>
        <table className="dtable">
          <thead><tr><th>Unit</th><th>Tenant</th><th>Trust</th><th className="money">Rent</th><th>Status</th><th>Escrow</th><th></th></tr></thead>
          <tbody>{roll.map(r => (
            <tr key={r.unit}>
              <td data-label="Unit" style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{p.name.split(' ')[0]} · {r.unit}</td>
              <td data-label="Tenant" style={{ color: 'var(--ink-700)' }}>{r.tenant || <span style={{ color: 'var(--ink-400)' }}>Vacant</span>}</td>
              <td data-label="Trust">{r.tenant ? <span className="trust-pill">{r.trust}</span> : '—'}</td>
              <td data-label="Rent" className="money">{r.rent ? money(r.rent) : '—'}</td>
              <td data-label="Status">{r.tenant ? rentChip(r.status) : <Chip kind="draft">Vacant</Chip>}</td>
              <td data-label="Escrow">{r.tenant ? escrowChip(r.escrow) : '—'}</td>
              <td>{r.tenant ? <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--ink-200)' }} onClick={() => setObserving(r)}><Icon name="eye" />View thread</button> : <button className="btn btn-secondary btn-sm" onClick={() => ctx.go('messages')}>Ask manager</button>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <div className="section-head" style={{ marginBottom: 12 }}><h3>Activity at this property</h3></div>
      {propFeed.length ? <div className="card card-pad"><div className="feed">{propFeed.map(feedRow)}</div></div> : <div className="card"><EmptyState icon="inbox" title="No recent activity" desc="Updates from your manager for this property will appear here." /></div>}

      {observing && <ObserverModal tenant={observing} manager={m.manager} prop={p} onClose={() => setObserving(null)} ctx={ctx} />}
    </div>
  );
}

/* Observer view — owner can READ the manager<->tenant thread but isn't a participant */
function ObserverModal({ tenant, manager, prop, onClose, ctx }) {
  const thread = [
    { who: 'tenant', name: tenant.tenant, text: 'Good morning, the kitchen tap in ' + prop.name.split(' ')[0] + ' ' + tenant.unit + ' is dripping again.', t: 'Mon 08:40' },
    { who: 'manager', name: manager.name, text: 'Morning. Noted — I\u2019ll send AquaFix this week and confirm a time with you.', t: 'Mon 09:05' },
    { who: 'tenant', name: tenant.tenant, text: 'Thank you. Mornings work best.', t: 'Mon 09:12' },
    { who: 'manager', name: manager.name, text: 'AquaFix will come Thursday 9–11am. I\u2019ll keep the owner updated.', t: 'Tue 16:30' }
  ];
  return (
    <div className="modal-scrim" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div><div className="modal-title">{tenant.tenant} · {prop.name.split(' ')[0]} {tenant.unit}</div><div className="modal-sub">Conversation handled by {manager.agency}</div></div>
          <button className="modal-x" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="observer-banner"><Icon name="eye" />Observer view — your manager handles all tenant contact. You can read this for transparency; you're not part of the conversation.</div>
        <div className="modal-body" style={{ background: 'var(--ink-25, var(--ink-50))' }}>
          {thread.map((msg, i) => (
            <div key={i} className={"obs-msg" + (msg.who === 'manager' ? ' from-mgr' : '')}>
              <div className="obs-who">{msg.who === 'manager' ? manager.name + ' · manager' : msg.name + ' · tenant'}</div>
              <div className="obs-bubble">{msg.text}</div>
              <div className="obs-time">{msg.t}</div>
            </div>
          ))}
        </div>
        <div className="modal-foot">
          <span style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', flex: 1 }}>Need something changed? Message your manager.</span>
          <button className="btn btn-secondary" onClick={() => { onClose(); ctx.go('messages'); }}><Icon name="message" />Message manager</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Managed, ManagedPropertyDetail, ManagerCard, ApprovalCard, DelegationDial, ObserverModal });
