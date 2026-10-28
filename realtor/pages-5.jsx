/* Ilé Realtor — Management (lettings under a management mandate)
   Ngozi runs Chidi's Abuja portfolio on his behalf: collects rent, handles
   tenants, and routes the big decisions back to the owner for approval. */

const letRentChip = s => s === 'paid' ? <Chip kind="paid">Paid</Chip> : s === 'due' ? <Chip kind="due">Due</Chip> : s === 'overdue' ? <Chip kind="overdue">Overdue</Chip> : <Chip kind="draft">Vacant</Chip>;
const letEscrowChip = e => e === 'released' ? <Chip kind="paid">Released</Chip> : e === 'held' ? <Chip kind="escrow">In escrow</Chip> : e === 'pending' ? <Chip kind="draft">Pending</Chip> : null;

function OwnerCard({ m, ctx }) {
  return (
    <div className="manager-card">
      <TrustRing val={m.owner.trust} size={56} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{m.owner.name}</span>
          <Vbadge state="verified" sm />
          <span className="chip chip--escrow"><span className="dot"></span>Property owner</span>
        </div>
        <div className="msg-snip" style={{ marginTop: 3 }}>You manage {m.properties.length} of their properties · {m.feePct}% management fee · since {m.manager.since}</div>
      </div>
      <button className="btn btn-secondary btn-sm" onClick={() => ctx.go('messages')}><Icon name="message" />Message owner</button>
    </div>
  );
}

const apIcon2 = t => ({ maintenance: 'wrench', tenant: 'user', rent: 'trend', lease: 'doc' }[t] || 'bell');

function RequestApprovalModal({ m, lockProp, onClose, onSubmit }) {
  const presets = {
    maintenance: { title: 'Repair / maintenance', amount: 85000, detail: 'Describe the issue and the vendor quote.' },
    tenant: { title: 'New tenant', amount: 2400000, detail: 'Applicant name, trust score and offer terms.' },
    rent: { title: 'Rent increase', amount: 0, detail: 'Proposed new rent and justification.' },
    lease: { title: 'Lease renewal', amount: 0, detail: 'Renewal terms for the owner to confirm.' }
  };
  const [type, setType] = useState('maintenance');
  const [propId, setPropId] = useState(lockProp ? lockProp.id : m.properties[0].id);
  const [unit, setUnit] = useState('');
  const [title, setTitle] = useState(presets.maintenance.title);
  const [amount, setAmount] = useState(presets.maintenance.amount);
  const [detail, setDetail] = useState('');
  const prop = lockProp || m.properties.find(p => p.id === propId);

  function pick(t) { setType(t); setTitle(presets[t].title); setAmount(presets[t].amount); }
  const valid = title.trim() && detail.trim();

  return (
    <div className="modal-scrim" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div><div className="modal-title">Request owner approval</div><div className="modal-sub">Sent to {m.owner.name}'s oversight inbox for a decision.</div></div>
          <button className="modal-x" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <Field label="Decision type" req>
            <div className="seg" style={{ display: 'flex', flexWrap: 'wrap' }}>
              {[['maintenance', 'Maintenance'], ['tenant', 'New tenant'], ['rent', 'Rent increase'], ['lease', 'Lease renewal']].map(([v, l]) => (
                <button key={v} type="button" className={"seg-btn" + (type === v ? ' on' : '')} onClick={() => pick(v)}>{l}</button>
              ))}
            </div>
          </Field>
          <div className="grid cols-2" style={{ gap: 12 }}>
            <Field label="Property" req>{lockProp ? <input className="input" value={lockProp.name} disabled /> : <select className="input" value={propId} onChange={e => { setPropId(e.target.value); setUnit(''); }}>{m.properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}</Field>
            <Field label="Unit"><select className="input" value={unit} onChange={e => setUnit(e.target.value)}><option value="">Whole property</option>{(prop.roll || []).map(r => <option key={r.unit} value={r.unit}>Unit {r.unit}{r.tenant ? ' · ' + r.tenant : ' · vacant'}</option>)}</select></Field>
          </div>
          <Field label="Summary" req><input className="input" value={title} onChange={e => setTitle(e.target.value)} /></Field>
          {(type === 'maintenance' || type === 'tenant' || type === 'rent') && <Field label={type === 'maintenance' ? 'Estimated cost (₦)' : type === 'tenant' ? 'Annual rent (₦)' : 'New annual rent (₦)'}><input className="input" type="number" value={amount} onChange={e => setAmount(+e.target.value)} /></Field>}
          <Field label="Details for the owner" req hint="Give them what they need to decide without having to ask."><textarea className="input" rows={3} value={detail} onChange={e => setDetail(e.target.value)} placeholder={presets[type].detail} style={{ resize: 'vertical', minHeight: 76 }}></textarea></Field>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => onSubmit({ type, propId, propName: prop.name, unit, title: title.trim(), amount: amount || 0, detail: detail.trim() })}><Icon name="send" />Send to owner</button>
        </div>
      </div>
    </div>
  );
}

function Lettings({ ctx }) {
  const [m, setM] = useState(() => window.MGMT.load());
  const [tab, setTab] = useState('clients');
  const reload = () => setM(window.MGMT.load());

  // Combined managed book across all owners (Chidi from the shared store + the agency's other clients)
  const collectedOf = p => (p.roll || []).filter(r => r.status === 'paid').reduce((a, r) => a + (r.rent || 0), 0);
  const chidiProps = (m.properties || []).map(p => ({ ...p, owner: p.owner || m.owner, feePct: p.feePct || m.feePct }));
  const extProps = (window.RT.externalClients || []).flatMap(c => c.properties.map(p => ({ ...p, owner: c.owner, feePct: c.feePct, since: c.since })));
  const allManaged = [...chidiProps, ...extProps];
  const units = allManaged.reduce((s, p) => s + p.units, 0);
  const occ = allManaged.reduce((s, p) => s + (p.roll || []).filter(r => r.tenant).length, 0);
  const collected = allManaged.reduce((s, p) => s + collectedOf(p), 0);
  const fee = allManaged.reduce((s, p) => s + Math.round(collectedOf(p) * (p.feePct || 10) / 100), 0);
  const clientMap = {};
  allManaged.forEach(p => { const k = p.owner.name; (clientMap[k] = clientMap[k] || { owner: p.owner, feePct: p.feePct, since: p.since, props: [] }).props.push(p); });
  const clients = Object.values(clientMap);
  const myApprovals = m.approvals;
  const pending = myApprovals.filter(a => a.status === 'pending');
  const incoming = (m.requests || []).filter(r => r.agencyId === 'ag-prime');
  const incomingPending = incoming.filter(r => r.status === 'pending');

  function decideRequest(req, accept) {
    window.MGMT.update(mm => {
      const t = mm.requests.find(x => x.id === req.id); if (t) t.status = accept ? 'accepted' : 'declined';
      if (accept) window.MGMT.onboardProperty(mm, req);
    });
    reload();
    ctx.toast(accept ? 'Onboarded ' + req.property.name + ' — now in your portfolio' : 'Request declined');
  }

  function remind(prop, r) {
    const onApp = (m.properties || []).some(x => x.id === prop.id);
    if (onApp) window.MGMT.update(mm => window.MGMT.pushFeed(mm, { propId: prop.id, propName: prop.name, unit: r.unit, icon: 'bell', tone: 'warn', title: 'Rent reminder sent', detail: r.tenant + ' · reminded about ' + r.status + ' rent', when: 'Just now' }));
    reload(); ctx.toast('Reminder sent to ' + r.tenant.split(' ')[0] + (onApp ? ' · logged for owner' : ''));
  }

  return (
    <div className="page">
      <PageHeader title="Management" sub="Properties you run on behalf of owners under a management mandate — across all your clients. Open a property to handle its tenants and route approvals to that owner." />

      <div className="grid cols-4" style={{ margin: '6px 0 22px' }}>
        <Stat icon="users" tone="info" label="Clients" value={clients.length} foot={<span className="stat-delta">{allManaged.length} properties · {units} units</span>} />
        <Stat icon="building" tone="green" label="Occupancy" value={occ + '/' + units} foot={<span className="stat-delta up">{Math.round(occ / units * 100)}% let</span>} />
        <Stat icon="wallet" tone="green" label="Rent collected" value={moneyShort(collected)} money foot={<span className="stat-delta">this cycle</span>} />
        <Stat icon="trend" tone="green" label="Your management fee" value={moneyShort(fee)} money foot={<span className="stat-delta up">across {clients.length} clients</span>} />
      </div>

      <div className="mkt-tabs">
        <button className={"toggle-pill" + (tab === 'clients' ? ' on' : '')} onClick={() => setTab('clients')}>Clients<span className="tab-n">{clients.length}</span></button>
        <button className={"toggle-pill" + (tab === 'roll' ? ' on' : '')} onClick={() => setTab('roll')}>Rent roll</button>
        <button className={"toggle-pill" + (tab === 'find' ? ' on' : '')} onClick={() => setTab('find')}>Find properties{(m.openProperties || []).filter(p => !(m.offers || []).some(o => o.propId === p.id && o.agencyId === 'ag-prime')).length > 0 && <span className="tab-n">{(m.openProperties || []).filter(p => !(m.offers || []).some(o => o.propId === p.id && o.agencyId === 'ag-prime')).length}</span>}</button>
        <button className={"toggle-pill" + (tab === 'incoming' ? ' on' : '')} onClick={() => setTab('incoming')}>New requests{incomingPending.length > 0 && <span className="tab-n tab-n--alert">{incomingPending.length}</span>}</button>
        <button className={"toggle-pill" + (tab === 'requests' ? ' on' : '')} onClick={() => setTab('requests')}>Owner requests{pending.length > 0 && <span className="tab-n tab-n--alert">{pending.length}</span>}</button>
      </div>

      {tab === 'clients' && (
        <div className="grid cols-2">
          {clients.map(c => {
            const cu = c.props.reduce((s, p) => s + p.units, 0);
            const co = c.props.reduce((s, p) => s + (p.roll || []).filter(r => r.tenant).length, 0);
            const cc = c.props.reduce((s, p) => s + collectedOf(p), 0);
            const onApp = (m.owner && m.owner.name === c.owner.name);
            return (
              <div key={c.owner.name} className="agent-card">
                <div className="ac-top">
                  <TrustRing val={c.owner.trust} size={50} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{c.owner.name}</span><Vbadge state="verified" sm />{onApp && <span className="chip chip--escrow"><span className="dot"></span>On Ilé</span>}</div>
                    <div className="msg-snip" style={{ marginTop: 2 }}>{c.props.length} propert{c.props.length === 1 ? 'y' : 'ies'} · {c.feePct}% fee{c.since ? ' · since ' + c.since : ''}</div>
                  </div>
                </div>
                <div className="ag-metrics">
                  <AgencyMetric value={cu} label="units" />
                  <AgencyMetric value={co + '/' + cu} label="let" tone="var(--success)" />
                  <AgencyMetric value={moneyShort(cc)} label="collected" />
                  <AgencyMetric value={moneyShort(Math.round(cc * c.feePct / 100))} label="your fee" tone="var(--success)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {c.props.map(p => { const po = (p.roll || []).filter(r => r.tenant).length; return (
                    <div key={p.id} className="client-prop client-prop--link" onClick={() => ctx.go('lettingsProperty', p.id)}>
                      <Icon name="building" style={{ width: 16, height: 16, color: 'var(--ink-400)' }} />
                      <span style={{ flex: 1, minWidth: 0, font: 'var(--text-sm)', color: 'var(--ink-800)', fontWeight: 600 }}>{p.name}</span>
                      <span style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>{p.area} · {po}/{p.units} let</span>
                      <Icon name="chevronRight" style={{ width: 15, height: 15, color: 'var(--ink-300)' }} />
                    </div>
                  ); })}
                </div>
                <div className="ac-foot">
                  <span style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>{onApp ? 'Owner on Ilé · full transparency' : 'Managed offline'}</span>
                  <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => ctx.go('messages')}><Icon name="message" />Message</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'roll' && (
        <div>
          <div className="oversight-note" style={{ marginBottom: 16 }}><Icon name="eye" style={{ color: 'var(--info-text)' }} />Each owner sees their own properties in real time. Rent flows through Ilé escrow; your fee is deducted automatically before payout.</div>
          {allManaged.map(p => (
            <div key={p.id} style={{ marginBottom: 22 }}>
              <div className="section-head" style={{ marginBottom: 10 }}><h3 style={{ fontSize: '1rem' }}>{p.name} <span style={{ font: 'var(--text-caption)', color: 'var(--ink-400)', fontWeight: 500 }}>· {p.area}, {p.city} · {p.owner.name}</span></h3><span className="link" onClick={() => ctx.go('lettingsProperty', p.id)}>Open<Icon name="chevronRight" /></span></div>
              <div className="table-wrap">
                <table className="dtable">
                  <thead><tr><th>Unit</th><th>Tenant</th><th>Trust</th><th className="money">Rent</th><th>Status</th><th>Escrow</th><th></th></tr></thead>
                  <tbody>{(p.roll || []).map(r => (
                    <tr key={r.unit}>
                      <td data-label="Unit" style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{p.name.split(' ')[0]} · {r.unit}</td>
                      <td data-label="Tenant" style={{ color: 'var(--ink-700)' }}>{r.tenant || <span style={{ color: 'var(--ink-400)' }}>Vacant</span>}</td>
                      <td data-label="Trust">{r.tenant ? <span className="trust-pill">{r.trust}</span> : '—'}</td>
                      <td data-label="Rent" className="money">{r.rent ? money(r.rent) : '—'}</td>
                      <td data-label="Status">{letRentChip(r.status)}</td>
                      <td data-label="Escrow">{r.tenant ? letEscrowChip(r.escrow) : '—'}</td>
                      <td>{!r.tenant ? <button className="btn btn-secondary btn-sm" onClick={() => ctx.go('lettingsProperty', p.id)}>Propose tenant</button> : (r.status === 'overdue' || r.status === 'due') ? <button className="btn btn-secondary btn-sm" onClick={() => remind(p, r)}><Icon name="bell" />Remind</button> : <span style={{ color: 'var(--ink-300)' }}>—</span>}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'find' && <WinMandates m={m} ctx={ctx} reload={reload} />}

      {tab === 'incoming' && (
        <div>
          <div className="oversight-note" style={{ marginBottom: 16 }}><Icon name="briefcase" style={{ color: 'var(--primary)' }} />Owners requesting {m.manager.agency} to manage their property. Accept to onboard it into your managed portfolio.</div>
          {incoming.length === 0 ? (
            <div className="card"><EmptyState icon="inbox" title="No new requests" desc="When a property owner appoints your agency through Ilé, their request lands here for you to accept." /></div>
          ) : (
            <div className="grid" style={{ gap: 12 }}>
              {incoming.map(req => {
                const occ = (req.property.roll || []).filter(r => r.tenant).length;
                const resolved = req.status !== 'pending';
                return (
                  <div key={req.id} className={"approval-card" + (resolved ? ' resolved' : '')}>
                    <div className="ap-ic tone-info"><Icon name="building" /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{req.property.name}</span>
                        <span className="ap-amount">{req.feePct}% fee</span>
                      </div>
                      <div className="msg-snip" style={{ marginTop: 3 }}>{req.property.area}, {req.property.city} · {req.property.units} units · {occ} let · from {req.ownerName} · {req.when}</div>
                      {req.message && <p style={{ font: 'var(--text-sm)', color: 'var(--ink-700)', margin: '10px 0 0', lineHeight: 1.55 }}>“{req.message}”</p>}
                      <div className="chip-row" style={{ marginTop: 10 }}>
                        <span className="area-chip"><Icon name="wrench" style={{ width: 12, height: 12 }} />Auto-approve under ₦{(req.dial.maintThreshold / 1000)}k</span>
                        <span className="area-chip"><Icon name="user" style={{ width: 12, height: 12 }} />New tenants: {req.dial.tenantApproval === 'auto' ? 'you decide' : 'owner approves'}</span>
                      </div>
                      {resolved ? (
                        <div style={{ marginTop: 12 }}><span className={"chip chip--" + (req.status === 'accepted' ? 'paid' : 'overdue')}><span className="dot"></span>{req.status === 'accepted' ? 'Onboarded into your portfolio' : 'You declined this'}</span></div>
                      ) : (
                        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                          <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--ink-200)' }} onClick={() => decideRequest(req, false)}><Icon name="x" />Decline</button>
                          <button className="btn btn-primary btn-sm" onClick={() => ctx.requireVerified(() => decideRequest(req, true))}><Icon name="check" />Accept &amp; onboard</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'requests' && (
        <div>
          <div className="oversight-note" style={{ marginBottom: 16 }}><Icon name="send" style={{ color: 'var(--primary)' }} />Decisions you've escalated to {m.owner.name}. Anything inside their delegation limits, you handle yourself — no request needed.</div>
          {myApprovals.length === 0 ? (
            <div className="card"><EmptyState icon="check" title="No open requests" desc="You're operating within owners' delegation settings. Open a property to raise a request when something exceeds those limits." actions={<button className="btn btn-secondary btn-sm" onClick={() => setTab('clients')}><Icon name="users" />Go to a property</button>} /></div>
          ) : (
            <div className="grid" style={{ gap: 12 }}>
              {myApprovals.map(ap => (
                <div key={ap.id} className={"approval-card" + (ap.status !== 'pending' ? ' resolved' : '')}>
                  <div className={"ap-ic tone-" + (ap.type === 'maintenance' ? 'warn' : ap.type === 'tenant' ? 'info' : 'green')}><Icon name={apIcon2(ap.type)} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{ap.title}</span>
                      {ap.amount ? <span className="ap-amount">{money(ap.amount)}</span> : null}
                    </div>
                    <div className="msg-snip" style={{ marginTop: 3 }}>{ap.propName}{ap.unit ? ' · Unit ' + ap.unit : ''} · {ap.when}</div>
                    <p style={{ font: 'var(--text-sm)', color: 'var(--ink-700)', margin: '10px 0 0', lineHeight: 1.55 }}>{ap.detail}</p>
                    <div style={{ marginTop: 12 }}>
                      {ap.status === 'pending'
                        ? <span className="chip chip--progress"><span className="dot"></span>Awaiting {m.owner.name.split(' ')[0]}'s decision</span>
                        : <span className={"chip chip--" + (ap.status === 'approved' ? 'paid' : 'overdue')}><span className="dot"></span>{ap.status === 'approved' ? 'Owner approved — clear to proceed' : 'Owner declined — on hold'}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

Object.assign(window, { Lettings, OwnerCard, RequestApprovalModal });
