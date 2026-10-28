/* Ilé Realtor — Leads pipeline (kanban), Lead detail, Viewings */

function Leads({ ctx }) {
  const [leads, setLeads] = useState(window.RT.leads.map(l => ({ ...l })));
  const [view, setView] = useState('board');
  const [adding, setAdding] = useState(false);

  function addLead(lead) {
    window.RT.leads.unshift(lead);            // persist so the detail page + nav can find it
    setLeads(prev => [lead, ...prev]);
    setAdding(false);
    ctx.toast('Lead added to pipeline');
  }

  function move(id, dir) {
    setLeads(prev => prev.map(l => {
      if (l.id !== id) return l;
      const i = window.RT.STAGES.indexOf(l.stage);
      const ni = Math.max(0, Math.min(window.RT.STAGES.length - 1, i + dir));
      return { ...l, stage: window.RT.STAGES[ni] };
    }));
    ctx.toast('Lead moved');
  }

  const totalValue = leads.filter(l => l.stage !== 'Closed').reduce((s, l) => s + l.value, 0);

  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <PageHeader title="Lead pipeline" sub={"Potential commission in play: " + money(totalValue)} actions={<div style={{ display: 'flex', gap: 10 }}><div className="view-toggle"><button className={view === 'board' ? 'on' : ''} onClick={() => setView('board')}><Icon name="grid" /></button><button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}><Icon name="list" /></button></div><button className="btn btn-primary" onClick={() => setAdding(true)}><Icon name="plus" />Add lead</button></div>} />

      {adding && <AddLeadModal onClose={() => setAdding(false)} onAdd={addLead} />}

      {view === 'board' ? (
        <div className="kanban">
          {window.RT.STAGES.map(stage => {
            const col = leads.filter(l => l.stage === stage);
            const stageVal = col.reduce((s, l) => s + l.value, 0);
            return (
              <div key={stage} className={"kan-col " + stage.toLowerCase()}>
                <div className="kan-head">
                  <div className="kt"><span className="swatch"></span>{stage}</div>
                  <span className="kcount">{col.length}</span>
                </div>
                <div style={{ font: 'var(--text-micro)', color: 'var(--ink-400)', fontFamily: 'var(--font-mono)', margin: '-6px 2px 10px' }}>{stageVal ? money(stageVal) : '—'}</div>
                <div className="kan-body">
                  {col.map(l => {
                    const p = window.RT.findListing(l.listingId);
                    const i = window.RT.STAGES.indexOf(stage);
                    return (
                      <div key={l.id} className={"lead-card" + (l.hot ? " hot" : "")} onClick={() => ctx.go('leadDetail', l.id)}>
                        {l.hot && <span className="hot-flag"><Icon name="fire" /></span>}
                        <div className="lc-top"><Avatar name={l.name} size="sm" /><div><div className="lc-name">{l.name}</div><div className="lc-intent">{l.intent} · Trust {l.trust}</div></div></div>
                        <div className="lc-prop"><Icon name="building" />{p.area} · {moneyShort(p.price)}</div>
                        <div className="lc-foot">
                          <span className="lc-val">{moneyShort(l.value)} fee</span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="icon-btn" style={{ width: 26, height: 26 }} disabled={i === 0} onClick={e => { e.stopPropagation(); move(l.id, -1); }}><Icon name="arrowLeft" /></button>
                            <button className="icon-btn" style={{ width: 26, height: 26 }} disabled={i === window.RT.STAGES.length - 1} onClick={e => { e.stopPropagation(); move(l.id, 1); }}><Icon name="arrowRight" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {!col.length && <div style={{ font: 'var(--text-caption)', color: 'var(--ink-400)', textAlign: 'center', padding: '18px 0' }}>No leads</div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="dtable">
            <thead><tr><th>Lead</th><th>Intent</th><th>Listing</th><th>Stage</th><th className="money">Potential fee</th><th>Last activity</th></tr></thead>
            <tbody>
              {leads.map(l => {
                const p = window.RT.findListing(l.listingId);
                return (
                  <tr key={l.id} onClick={() => ctx.go('leadDetail', l.id)} style={{ cursor: 'pointer' }}>
                    <td data-label="Lead"><div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Avatar name={l.name} size="sm" />{l.name}{l.hot && <Icon name="fire" style={{ width: 14, height: 14, color: 'var(--error)' }} />}</div></td>
                    <td data-label="Intent">{l.intent}</td>
                    <td data-label="Listing">{p.area} · {p.type}</td>
                    <td data-label="Stage"><Chip kind={l.stage === 'Closed' ? 'paid' : l.stage === 'Offer' ? 'progress' : 'due'}>{l.stage}</Chip></td>
                    <td data-label="Potential fee" className="money" style={{ fontWeight: 600 }}>{moneyShort(l.value)}</td>
                    <td data-label="Last activity" className="msg-snip">{l.when}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- Lead detail ---------------- */
function LeadDetail({ ctx, id }) {
  const l = window.RT.findLead(id) || window.RT.leads[0];
  const p = window.RT.findListing(l.listingId);
  const stageIdx = window.RT.STAGES.indexOf(l.stage);

  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('leads')}><Icon name="arrowLeft" />Back to pipeline</span>
      <div className="pd-grid">
        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Avatar name={l.name} size="lg" />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><h2 className="page-title" style={{ fontSize: '1.3rem' }}>{l.name}</h2>{l.hot && <span className="chip chip--overdue"><Icon name="fire" style={{ width: 13, height: 13 }} />Hot lead</span>}</div>
                <div className="page-sub" style={{ marginBottom: 0 }}>Looking to {l.intent.toLowerCase()} · Budget {moneyShort(l.budget)} · via {l.source}</div>
              </div>
              <TrustRing val={l.trust} size={52} label="Trust" tier={l.trust >= 85 ? 'Excellent' : 'Good'} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <a className="btn btn-secondary" style={{ flex: 1 }} href={"tel:" + l.phone}><Icon name="phone" />Call</a>
              <a className="btn btn-secondary" style={{ flex: 1 }} href={"mailto:" + l.email}><Icon name="mail" />Email</a>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Message</button>
            </div>
          </div>

          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h3 className="section-head" style={{ display: 'block' }}>Pipeline stage</h3>
            <div className="milestones">
              {window.RT.STAGES.map((s, i) => (
                <div key={s} className={"ms " + (i < stageIdx ? 'done' : i === stageIdx ? 'active' : 'todo')}>
                  <div className="ms-line"></div>
                  <div className="ms-node">{i < stageIdx ? <Icon name="check" /> : i === stageIdx ? <Icon name="flag" /> : <Icon name="user" />}</div>
                  <div className="ms-title">{s}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-pad">
            <h3 className="section-head" style={{ display: 'block' }}>Activity</h3>
            <div className="feed">
              {[[l.last, l.when], ['Lead created from ' + l.source, l.when], ['Matched to ' + p.title, l.when]].map((a, i) => (
                <div key={i} className="feed-item">
                  <div className="feed-ic" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}><Icon name={i === 0 ? 'message' : i === 1 ? 'user' : 'building'} /></div>
                  <div className="feed-txt"><div className="t">{a[0]}</div><div className="time">{a[1]}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Interested in</h3>
            <div className="msg-row" onClick={() => ctx.go('listingDetail', p.id)} style={{ cursor: 'pointer' }}>
              <div className="feed-ic" style={{ background: 'var(--ink-100)', color: 'var(--ink-500)' }}><Icon name="building" /></div>
              <div className="msg-meta"><div className="msg-name">{p.title}</div><div className="msg-snip">{p.area} · {moneyShort(p.price)}</div></div>
              <Icon name="chevronRight" style={{ color: 'var(--ink-400)' }} />
            </div>
            <button className="btn btn-secondary btn-block" style={{ marginTop: 12 }} onClick={() => ctx.go('viewings')}><Icon name="schedule" />Schedule viewing</button>
          </div>
          <div className="card card-pad">
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Potential commission</h3>
            <div className="comm-tag" style={{ fontSize: '1.1rem', padding: '8px 14px' }}><Icon name="wallet" />{money(l.value)}</div>
            <p style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', marginTop: 10, marginBottom: 0 }}>Estimated fee if this lead closes at budget. Released to you through escrow on completion.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Viewings ---------------- */
function Viewings({ ctx }) {
  const [extra, setExtra] = useState([]);
  const [scheduling, setScheduling] = useState(false);
  const all = [...window.RT.viewings, ...extra];
  const groups = all.reduce((acc, v) => { (acc[v.date] = acc[v.date] || []).push(v); return acc; }, {});

  function schedule(v) {
    setExtra(prev => [...prev, v]);
    setScheduling(false);
    ctx.toast('Viewing scheduled');
  }

  return (
    <div className="page">
      <PageHeader title="Viewings" sub="Your hosting schedule across all listings." actions={<button className="btn btn-primary" onClick={() => setScheduling(true)}><Icon name="plus" />Schedule viewing</button>} />
      {scheduling && <ScheduleViewingModal onClose={() => setScheduling(false)} onSchedule={schedule} />}
      {Object.entries(groups).map(([date, items]) => (
        <div key={date} style={{ marginBottom: 22 }}>
          <div style={{ font: 'var(--text-sm)', fontWeight: 700, color: 'var(--ink-700)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="calendar" style={{ width: 16, height: 16, color: 'var(--ink-400)' }} />{date}</div>
          <div className="grid" style={{ gap: 12 }}>
            {items.map(v => {
              const p = window.RT.findListing(v.listingId);
              const lead = window.RT.findLead(v.leadId);
              return (
                <div key={v.id} className="issue-card" onClick={() => ctx.go('leadDetail', v.leadId)}>
                  <div className="issue-ic" style={{ background: v.status === 'Confirmed' ? 'var(--success-bg)' : 'var(--warning-bg)', color: v.status === 'Confirmed' ? 'var(--success)' : 'var(--warning-text)' }}><Icon name="calendar" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}><div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{p.title}</div><Chip kind={v.status === 'Confirmed' ? 'paid' : 'due'}>{v.status}</Chip></div>
                    <div className="pcard-loc" style={{ marginTop: 3 }}><Icon name="mapPin" />{p.area}, {p.city}</div>
                    <div style={{ display: 'flex', gap: 18, marginTop: 10, font: 'var(--text-sm)', color: 'var(--ink-600)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="clock" style={{ width: 15, height: 15, color: 'var(--ink-400)' }} />{v.time}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="user" style={{ width: 15, height: 15, color: 'var(--ink-400)' }} />{lead.name}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="eye" style={{ width: 15, height: 15, color: 'var(--ink-400)' }} />{v.type}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Add Lead modal ---------------- */
function AddLeadModal({ onClose, onAdd }) {
  const [f, setF] = useState({ name: '', phone: '', email: '', intent: 'Buy', listingId: window.RT.listings[0].id, budget: '', source: 'Ilé Search' });
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));
  const budgetNum = Number(String(f.budget).replace(/[^\d]/g, '')) || 0;
  const valid = f.name.trim() && f.listingId && budgetNum > 0;

  function submit() {
    if (!valid) return;
    const value = Math.round(budgetNum * (f.intent === 'Buy' ? 0.03 : 0.10));
    onAdd({
      id: 'le' + Date.now(), name: f.name.trim(), stage: 'New', listingId: f.listingId,
      budget: budgetNum, intent: f.intent, trust: 75,
      phone: f.phone.trim() || '—', email: f.email.trim() || '—', source: f.source,
      last: 'Lead created manually', when: 'Just now', value, hot: false
    });
  }

  return (
    <div className="modal-scrim" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div><div className="modal-title">Add a lead</div><div className="modal-sub">Capture a new prospect into your pipeline.</div></div>
          <button className="modal-x" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <Field label="Full name" req><input className="input" value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Aisha Bello" autoFocus /></Field>
          <div className="grid cols-2">
            <Field label="Phone"><input className="input" value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="+234 …" /></Field>
            <Field label="Email"><input className="input" type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="name@example.com" /></Field>
            <Field label="Intent"><select className="select" value={f.intent} onChange={e => set('intent', e.target.value)}><option>Buy</option><option>Rent</option></select></Field>
            <Field label="Source"><select className="select" value={f.source} onChange={e => set('source', e.target.value)}><option>Ilé Search</option><option>Referral</option><option>Instagram Ad</option><option>Walk-in</option><option>Other</option></select></Field>
          </div>
          <Field label="Interested in" req><select className="select" value={f.listingId} onChange={e => set('listingId', e.target.value)}>{window.RT.listings.map(p => <option key={p.id} value={p.id}>{p.title} · {p.area} · {moneyShort(p.price)}</option>)}</select></Field>
          <Field label="Budget" req hint={budgetNum ? 'Est. commission ' + money(Math.round(budgetNum * (f.intent === 'Buy' ? 0.03 : 0.10))) : 'Drives your potential fee'}><div className="input-group"><span className="prefix">₦</span><input className="input" inputMode="numeric" value={f.budget} onChange={e => set('budget', e.target.value.replace(/[^\d]/g, ''))} placeholder="0" /></div></Field>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}><Icon name="plus" />Add lead</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Schedule Viewing modal ---------------- */
function ScheduleViewingModal({ onClose, onSchedule }) {
  const [f, setF] = useState({ leadId: window.RT.leads[0].id, listingId: window.RT.leads[0].listingId, date: 'Sat 31 May', time: '10:00 AM', type: 'In person' });
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  function submit() {
    onSchedule({ id: 'v' + Date.now(), leadId: f.leadId, listingId: f.listingId, date: f.date, time: f.time, status: 'Requested', type: f.type });
  }

  return (
    <div className="modal-scrim" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div><div className="modal-title">Schedule a viewing</div><div className="modal-sub">Book a property tour with a lead.</div></div>
          <button className="modal-x" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <Field label="Lead" req><select className="select" value={f.leadId} onChange={e => { const lead = window.RT.findLead(e.target.value); set('leadId', e.target.value); set('listingId', lead.listingId); }}>{window.RT.leads.map(l => <option key={l.id} value={l.id}>{l.name} · {l.intent}</option>)}</select></Field>
          <Field label="Property" req><select className="select" value={f.listingId} onChange={e => set('listingId', e.target.value)}>{window.RT.listings.map(p => <option key={p.id} value={p.id}>{p.title} · {p.area}</option>)}</select></Field>
          <div className="grid cols-2">
            <Field label="Date"><select className="select" value={f.date} onChange={e => set('date', e.target.value)}><option>Sat 31 May</option><option>Sun 01 Jun</option><option>Mon 02 Jun</option><option>Tue 03 Jun</option></select></Field>
            <Field label="Time"><select className="select" value={f.time} onChange={e => set('time', e.target.value)}><option>10:00 AM</option><option>11:30 AM</option><option>1:00 PM</option><option>4:00 PM</option></select></Field>
          </div>
          <Field label="Type"><select className="select" value={f.type} onChange={e => set('type', e.target.value)}><option>In person</option><option>Virtual</option></select></Field>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}><Icon name="calendar" />Schedule</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Field Ops (dispatch work to the field agent) ---------------- */
const RT_TASK_ICON = { Photos: 'camera', Documents: 'doc', Inspection: 'shieldCheck', Measurement: 'ruler', Signage: 'signpost', Handover: 'key' };
const RT_ACC_LABEL = { lockbox: 'Lockbox', caretaker: 'Caretaker', estate: 'Estate security', concierge: 'Concierge', office: 'Office pickup', tenant: 'Tenant present' };
function rtAccessLog() { try { return JSON.parse(localStorage.getItem('grt_access_log')) || []; } catch (e) { return []; } }
const rtTaskChip = s => ({ 'To Do': <Chip kind="draft">To do</Chip>, 'In Progress': <Chip kind="progress">In progress</Chip>, Done: <Chip kind="paid">Done</Chip> }[s] || <Chip kind="draft">{s}</Chip>);

function FieldOps({ ctx }) {
  const [tasks, setTasks] = useState(() => window.RT.allFieldTasks());
  const [modal, setModal] = useState(false);
  const fa = window.RT.fieldAgent;
  const accessLog = rtAccessLog();

  function onAdd(t) { setTasks(prev => [t, ...prev]); setModal(false); ctx.toast('Task assigned to ' + fa.name + ' — sent to their app'); }

  const open = tasks.filter(t => t.status !== 'Done');
  const outstanding = open.reduce((s, t) => s + t.fee, 0);

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <PageHeader title="Field Ops" sub="Dispatch on-the-ground work — photos, document pickups, inspections — to your field agent." />
        <button className="btn btn-primary" onClick={() => ctx.requireVerified(() => setModal(true))}><Icon name="plus" />Assign task</button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 22, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <TrustRing val={fa.trust} size={62} tier="Verified" />
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{fa.name}</span><Vbadge state="verified" sm /></div>
          <div className="msg-snip">{fa.role} · {fa.brokerage} · since {fa.since}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, font: 'var(--text-sm)', color: 'var(--ink-600)', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="check" style={{ width: 15, height: 15, color: 'var(--primary)' }} />{fa.completed} jobs done</span>
            <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="star" style={{ width: 15, height: 15, color: 'var(--gold, #C8951B)' }} />{fa.rating} rating</span>
            <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="phone" style={{ width: 15, height: 15, color: 'var(--ink-400)' }} />{fa.phone}</span>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Message</button>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 22 }}>
        <Stat icon="clipboard" tone="gold" label="Open tasks" value={open.length} foot={<span className="stat-delta">assigned to {fa.name.split(' ')[0]}</span>} />
        <Stat icon="check" tone="green" label="Completed" value={tasks.filter(t => t.status === 'Done').length} foot={<span className="stat-delta">field jobs done</span>} />
        <Stat icon="wallet" tone="escrow" label="Fees outstanding" value={moneyShort(outstanding)} money foot={<span className="stat-delta">released on completion</span>} />
      </div>

      {accessLog.length > 0 && (
        <div className="card card-pad" style={{ marginBottom: 22 }}>
          <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Property access log</h3><span style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>agent check-ins, logged for security</span></div>
          <div className="feed">
            {accessLog.slice(0, 6).map(e => (
              <div key={e.id} className="feed-item">
                <div className="feed-ic" style={{ background: e.event === 'checkout' ? 'var(--green-50)' : 'var(--info-bg)', color: e.event === 'checkout' ? 'var(--primary)' : 'var(--info-text)' }}><Icon name={e.event === 'checkout' ? 'check' : 'lock'} /></div>
                <div className="feed-txt"><div className="t"><b>{e.agent}</b> {e.event === 'checkout' ? 'secured & checked out of' : 'checked in to'} {e.propTitle || 'a property'}</div><div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>{e.label}{e.label ? ' · ' : ''}{e.when}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid" style={{ gap: 12 }}>
        {tasks.map(t => (
          <div key={t.id} className={"issue-card" + (t.status === 'Done' ? ' done' : '')} style={{ cursor: 'default', alignItems: 'flex-start' }}>
            <div className="issue-ic" style={{ background: t.status === 'Done' ? 'var(--green-50)' : 'var(--gold-50, #FBF3DE)', color: t.status === 'Done' ? 'var(--primary)' : 'var(--gold-700, #8A6A12)' }}><Icon name={RT_TASK_ICON[t.type] || 'clipboard'} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)', textDecoration: t.status === 'Done' ? 'line-through' : 'none' }}>{t.title}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 'none' }}>{t.isNew && <span className="chip chip--progress"><span className="dot"></span>Sent</span>}<span className={"prio " + t.priority}>{t.priority}</span>{rtTaskChip(t.status)}</div>
              </div>
              <div className="pcard-loc" style={{ marginTop: 4 }}><Icon name="building" style={{ width: 14, height: 14 }} />{t.propTitle} · {t.propArea}</div>
              {t.access && t.access.method && <div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', marginTop: 5, display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="key" style={{ width: 13, height: 13, color: 'var(--primary)' }} />Access: {RT_ACC_LABEL[t.access.method] || 'Key'}{t.access.code ? ' · code set' : ''}</div>}
              {t.note && <p style={{ font: 'var(--text-sm)', color: 'var(--ink-600)', margin: '8px 0 0' }}>{t.note}</p>}
              <div style={{ display: 'flex', gap: 14, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="clock" style={{ width: 14, height: 14, color: 'var(--ink-400)' }} />Due {t.due}</span>
                <span style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="wallet" style={{ width: 14, height: 14, color: 'var(--ink-400)' }} />{money(t.fee)} fee</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modal && <AssignTaskModal onClose={() => setModal(false)} onAdd={onAdd} />}
    </div>
  );
}

/* ---------------- Assign Task modal ---------------- */
function AssignTaskModal({ onClose, onAdd, listingId }) {
  const preset = window.RT.taskTypes[0];
  const accFromListing = l => { const a = (l && l.access) || {}; return { method: a.method || 'lockbox', code: a.code || '', where: a.where || '', contactName: (a.contact && a.contact.name) || '', contactPhone: (a.contact && a.contact.phone) || '', notes: a.notes || '' }; };
  const [f, setF] = useState({ listingId: listingId || window.RT.listings[0].id, type: preset.type, title: preset.title, priority: 'Medium', due: 'Today', fee: String(preset.fee), note: '' });
  const [acc, setAcc] = useState(() => accFromListing(window.RT.findListing(listingId || window.RT.listings[0].id)));
  const setAccF = (k, v) => setAcc(p => ({ ...p, [k]: v }));
  useEffect(() => { setAcc(accFromListing(window.RT.findListing(f.listingId))); }, [f.listingId]);
  const ACC_LABELS = { lockbox: 'Lockbox', caretaker: 'Caretaker', estate: 'Estate security', concierge: 'Concierge', office: 'Office pickup', tenant: 'Tenant present' };
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));
  const feeNum = Number(String(f.fee).replace(/[^\d]/g, '')) || 0;
  const valid = f.title.trim() && f.listingId && feeNum > 0;
  const fa = window.RT.fieldAgent;

  function pickType(type) {
    const t = window.RT.taskTypes.find(x => x.type === type) || preset;
    setF(prev => ({ ...prev, type, title: t.title, fee: String(t.fee) }));
  }

  function submit() {
    if (!valid) return;
    const p = window.RT.findListing(f.listingId);
    const task = {
      id: 'ft' + Date.now(), title: f.title.trim(), type: f.type, listingId: f.listingId,
      propTitle: p.title, propArea: p.area, priority: f.priority, due: f.due,
      status: 'To Do', fee: feeNum, note: f.note.trim(), assignedBy: 'Ngozi Eze',
      brokerage: 'Prime Realty', when: 'Just now', isNew: true,
      access: { method: acc.method, code: acc.code.trim(), where: acc.where.trim(), contact: { name: acc.contactName.trim(), phone: acc.contactPhone.trim() }, notes: acc.notes.trim() }
    };
    window.RT.pushDispatched(task);
    onAdd(task);
  }

  return (
    <div className="modal-scrim" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div><div className="modal-title">Assign a field task</div><div className="modal-sub">Dispatch on-the-ground work to {fa.name}, your field agent.</div></div>
          <button className="modal-x" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <Field label="Property" req><select className="select" value={f.listingId} onChange={e => set('listingId', e.target.value)}>{window.RT.listings.map(p => <option key={p.id} value={p.id}>{p.title} · {p.area}</option>)}</select></Field>
          <Field label="Task type" req>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {window.RT.taskTypes.map(t => <button key={t.type} type="button" className={"toggle-pill" + (f.type === t.type ? ' on' : '')} onClick={() => pickType(t.type)} style={{ padding: '8px 12px', display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name={t.icon} style={{ width: 15, height: 15 }} />{t.type}</button>)}
            </div>
          </Field>
          <Field label="Task title" req><input className="input" value={f.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Photograph living areas" /></Field>
          <div className="grid cols-2">
            <Field label="Priority"><select className="select" value={f.priority} onChange={e => set('priority', e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></Field>
            <Field label="Due"><select className="select" value={f.due} onChange={e => set('due', e.target.value)}><option>Today</option><option>Today, 5 PM</option><option>Tomorrow</option><option>This week</option><option>Fri 06 Jun</option><option>Next week</option></select></Field>
          </div>
          <Field label="Agent fee" req hint="Released to the agent on completion"><div className="input-group"><span className="prefix">₦</span><input className="input" inputMode="numeric" value={f.fee} onChange={e => set('fee', e.target.value.replace(/[^\d]/g, ''))} placeholder="0" /></div></Field>
          <Field label="Instructions"><textarea className="input" rows={2} value={f.note} onChange={e => set('note', e.target.value)} placeholder="What exactly should the agent do on-site?" style={{ resize: 'vertical', minHeight: 56 }}></textarea></Field>

          <div className="section-head" style={{ display: 'block', margin: '10px 0 10px' }}><h3 style={{ fontSize: '.95rem' }}>How the agent gets in</h3></div>
          <p style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', margin: '-6px 0 12px' }}>Prefilled from the property. The code stays hidden in the agent’s app until they check in on arrival.</p>
          <div className="grid cols-2">
            <Field label="Access method"><select className="select" value={acc.method} onChange={e => setAccF('method', e.target.value)}>{Object.keys(ACC_LABELS).map(mth => <option key={mth} value={mth}>{ACC_LABELS[mth]}</option>)}</select></Field>
            {(acc.method === 'lockbox' || acc.method === 'estate') && <Field label="Lockbox code"><input className="input" value={acc.code} onChange={e => setAccF('code', e.target.value)} placeholder="e.g. 4471" /></Field>}
          </div>
          <Field label="Where to find it"><input className="input" value={acc.where} onChange={e => setAccF('where', e.target.value)} placeholder="e.g. Lockbox on the burglary gate, right of the door" /></Field>
          <div className="grid cols-2">
            <Field label="On-site contact"><input className="input" value={acc.contactName} onChange={e => setAccF('contactName', e.target.value)} placeholder="e.g. Sunday (gateman)" /></Field>
            <Field label="Contact phone"><input className="input" value={acc.contactPhone} onChange={e => setAccF('contactPhone', e.target.value)} placeholder="+234…" /></Field>
          </div>
          <Field label="Access notes"><textarea className="input" rows={2} value={acc.notes} onChange={e => setAccF('notes', e.target.value)} placeholder="Gate clearance, parking, dog, etc." style={{ resize: 'vertical', minHeight: 48 }}></textarea></Field>
          <div className="avatar-block" style={{ marginTop: 4 }}><Avatar name={fa.name} /><div className="avatar-meta"><span className="avatar-name">{fa.name}</span><span className="avatar-role">{fa.role} · {fa.brokerage}</span></div><Vbadge state="verified" sm /></div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}><Icon name="send" />Assign to {fa.name.split(' ')[0]}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Leads, LeadDetail, Viewings, AddLeadModal, ScheduleViewingModal, FieldOps, AssignTaskModal });
