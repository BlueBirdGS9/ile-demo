/* Ilé Landlord — Rent Collection, Maintenance Ops, Financials */

function RentCollection({ ctx }) {
  const [tab, setTab] = useState('current');
  const rows = window.LD.rentRows;
  const collected = rows.filter(r => r.status === 'paid').reduce((s, r) => s + r.amount, 0);
  const outstanding = rows.filter(r => r.status !== 'paid').reduce((s, r) => s + r.amount, 0);
  const inEscrow = rows.filter(r => r.escrow === 'held').reduce((s, r) => s + r.amount, 0);

  const escrowChip = e => e === 'released' ? <Chip kind="paid">Released</Chip> : e === 'held' ? <Chip kind="escrow">In escrow</Chip> : <Chip kind="draft">Pending</Chip>;

  return (
    <div className="page">
      <PageHeader title="Rent collection" sub="Track payments, escrow releases and payouts across your portfolio." />
      <div className="grid cols-3" style={{ marginBottom: 22 }}>
        <Stat icon="check" tone="green" label="Collected this cycle" value={moneyShort(collected)} money foot={<span className="stat-delta up">{rows.filter(r => r.status === 'paid').length} payments</span>} />
        <Stat icon="clock" tone="warn" label="Outstanding" value={moneyShort(outstanding)} money foot={<span className="stat-delta down">2 tenants</span>} />
        <Stat icon="lock" tone="info" label="Held in escrow" value={moneyShort(inEscrow)} money foot={<span className="stat-delta">Awaiting release</span>} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className={"toggle-pill" + (tab === 'current' ? " on" : "")} onClick={() => setTab('current')} style={{ padding: '8px 14px' }}>Current cycle</button>
        <button className={"toggle-pill" + (tab === 'payouts' ? " on" : "")} onClick={() => setTab('payouts')} style={{ padding: '8px 14px' }}>Payout history</button>
      </div>

      {tab === 'current' ? (
        <div className="table-wrap">
          <table className="dtable">
            <thead><tr><th>Tenant</th><th>Unit</th><th className="money">Amount</th><th>Due date</th><th>Rent</th><th>Escrow</th><th></th></tr></thead>
            <tbody>{rows.map(r => (
              <tr key={r.id}>
                <td data-label="Tenant" style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{r.tenant}</td>
                <td data-label="Unit" style={{ color: 'var(--ink-500)' }}>{r.unit}</td>
                <td data-label="Amount" className="money">{money(r.amount)}</td>
                <td data-label="Due date" style={{ color: 'var(--ink-500)' }}>{r.due}</td>
                <td data-label="Rent">{rentChip(r.status)}</td>
                <td data-label="Escrow">{escrowChip(r.escrow)}</td>
                <td>{r.escrow === 'held' ? <button className="btn btn-primary btn-sm" onClick={() => ctx.requireVerified(() => ctx.toast('Escrow release requested'))}>Release</button> : r.status === 'overdue' ? <button className="btn btn-secondary btn-sm" onClick={() => ctx.go('messages')}>Remind</button> : <span style={{ color: 'var(--ink-300)' }}>—</span>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="dtable">
            <thead><tr><th>Date</th><th>Property</th><th className="money">Amount</th><th>Reference</th><th>Status</th></tr></thead>
            <tbody>{window.LD.payouts.map(p => (
              <tr key={p.id}><td data-label="Date" style={{ color: 'var(--ink-500)' }}>{p.date}</td><td data-label="Property" style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{p.property}</td><td data-label="Amount" className="money">{money(p.amount)}</td><td data-label="Reference" style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-500)' }}>{p.ref}</td><td data-label="Status"><Chip kind="paid">Completed</Chip></td></tr>
            ))}</tbody>
          </table>
        </div>
      )}

      <div className="escrow-explainer" style={{ marginTop: 22 }}>
        <div className="chip chip--escrow" style={{ marginBottom: 10 }}><span className="dot"></span>How payouts work</div>
        <p style={{ font: 'var(--text-sm)', color: 'var(--ink-700)', margin: 0 }}>When a tenant pays, funds are held in <b>Ilé Escrow</b> until move-in is confirmed. Once released, payouts reach your verified bank account within 1–2 business days. This protects both you and your tenants from disputes.</p>
      </div>
    </div>
  );
}

/* ---------------- Maintenance Operations ---------------- */
const STAGES = ['New', 'Assigned', 'In Progress', 'Resolved'];

function MaintenanceOps({ ctx }) {
  const [items, setItems] = useState(window.LD.maintenance);
  const [sel, setSel] = useState(null);
  const [assigning, setAssigning] = useState(null);

  function assign(id, vendor) {
    setItems(items.map(m => m.id === id ? { ...m, vendor, status: 'Assigned' } : m));
    setAssigning(null); ctx.toast('Vendor assigned · ' + vendor);
  }
  function advance(id) {
    setItems(items.map(m => { if (m.id !== id) return m; const i = STAGES.indexOf(m.status); return { ...m, status: STAGES[Math.min(i + 1, 3)], sla: STAGES[Math.min(i + 1, 3)] === 'Resolved' ? 0 : m.sla }; }));
  }

  if (sel) {
    const m = items.find(i => i.id === sel);
    const stageIdx = STAGES.indexOf(m.status);
    return (
      <div className="page" style={{ maxWidth: 760 }}>
        <span className="link" style={{ marginBottom: 14 }} onClick={() => setSel(null)}><Icon name="arrowLeft" />All requests</span>
        <div className="card card-pad">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div><h2 className="page-title" style={{ fontSize: '1.4rem' }}>{m.title}</h2><div className="page-sub">{m.property} · {m.tenant}</div></div>
            <div style={{ display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end' }}><span className={"prio " + m.priority}><span className="pd"></span>{m.priority} priority</span><SLA hours={m.sla} /></div>
          </div>
          <div className="track" style={{ margin: '28px 0' }}>
            {STAGES.map((s, i) => <div key={s} className={"track-node" + (i < stageIdx ? " done" : i === stageIdx ? " active" : "")}><div className="track-line"></div><div className="track-dot">{i < stageIdx ? <Icon name="check" /> : i === stageIdx ? <span style={{ width: 7, height: 7, borderRadius: 99, background: 'currentColor' }}></span> : i + 1}</div><div className="track-label">{s}</div></div>)}
          </div>
          <hr className="divider" />
          <p style={{ font: 'var(--text-sm)', color: 'var(--ink-700)', marginTop: 16 }}>{m.desc}</p>
          <div className="grid cols-2" style={{ marginTop: 8 }}>
            <div><div style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-400)', fontWeight: 700, marginBottom: 6 }}>Category</div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{m.category}</div></div>
            <div><div style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-400)', fontWeight: 700, marginBottom: 6 }}>Vendor</div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{m.vendor || 'Not yet assigned'}</div></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            {!m.vendor && <button className="btn btn-primary" onClick={() => setAssigning(m.id)}><Icon name="users" />Assign vendor</button>}
            {m.status !== 'Resolved' && <button className="btn btn-secondary" onClick={() => advance(m.id)}>Advance to {STAGES[Math.min(stageIdx + 1, 3)]}<Icon name="arrowRight" /></button>}
            <button className="btn btn-ghost" style={{ border: '1px solid var(--ink-200)' }} onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Message tenant</button>
          </div>
        </div>
        {assigning && <AssignModal onClose={() => setAssigning(null)} onAssign={v => assign(m.id, v)} />}
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="Maintenance operations" sub="Triage incoming issues, assign vendors and track SLAs." />
      <div className="grid cols-4" style={{ marginBottom: 22 }}>
        {STAGES.map(s => { const n = items.filter(m => m.status === s).length; return <Stat key={s} icon={s === 'Resolved' ? 'check' : s === 'New' ? 'inbox' : s === 'Assigned' ? 'users' : 'wrench'} tone={s === 'Resolved' ? 'green' : s === 'New' ? 'info' : 'warn'} label={s} value={n} />; })}
      </div>
      <div className="grid" style={{ gap: 12 }}>
        {items.map(m => {
          const stageIdx = STAGES.indexOf(m.status);
          return (
            <div key={m.id} className="issue-card" onClick={() => setSel(m.id)}>
              <div className="issue-ic"><Icon name="wrench" /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{m.title}</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className={"prio " + m.priority}><span className="pd"></span>{m.priority}</span><SLA hours={m.sla} /><Chip kind={m.status === 'Resolved' ? 'resolved' : m.status === 'In Progress' ? 'progress' : m.status === 'New' ? 'due' : 'progress'}>{m.status}</Chip></div>
                </div>
                <div className="msg-snip" style={{ marginTop: 3 }}>{m.property} · {m.tenant} · {m.vendor || 'Unassigned'}</div>
                <div className="track" style={{ marginTop: 12, maxWidth: 420 }}>{STAGES.map((s, i) => <div key={s} className={"track-node" + (i < stageIdx ? " done" : i === stageIdx ? " active" : "")}><div className="track-line"></div><div className="track-dot" style={{ width: 20, height: 20 }}>{i < stageIdx ? <Icon name="check" style={{ width: 11, height: 11 }} /> : null}</div><div className="track-label" style={{ fontSize: '.6rem' }}>{s}</div></div>)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssignModal({ onClose, onAssign }) {
  const [v, setV] = useState('');
  return (
    <div className="modal-scrim" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head"><div><div className="modal-title">Assign a vendor</div><div className="modal-sub">Choose a verified service provider.</div></div><button className="modal-x" onClick={onClose}><Icon name="x" /></button></div>
        <div className="modal-body">
          {window.LD.vendors.map(vn => (
            <div key={vn} className={"pay-method" + (v === vn ? " sel" : "")} onClick={() => setV(vn)} style={{ marginBottom: 8 }}>
              <div className="pm-ic"><Icon name="wrench" /></div><div className="pm-meta"><div className="pm-name">{vn}</div><div className="pm-sub">Verified vendor</div></div><div className="radio-dot"></div>
            </div>
          ))}
        </div>
        <div className="modal-foot"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!v} onClick={() => onAssign(v)}>Assign vendor</button></div>
      </div>
    </div>
  );
}

/* ---------------- Financials ---------------- */
function Financials({ ctx }) {
  const annualIncome = window.LD.properties.reduce((s, p) => s + p.rentPerUnit * p.occupied, 0);
  const totalExpense = window.LD.expenses.reduce((s, e) => s + e.amount, 0);
  const net = annualIncome - totalExpense;
  const expColors = ['var(--green-600)', 'var(--green-400)', 'var(--gold-500)', 'var(--info)', 'var(--ink-300)'];
  return (
    <div className="page">
      <PageHeader title="Financials" sub="Income, expenses and net position across your portfolio." actions={<button className="btn btn-secondary"><Icon name="download" />Export report</button>} />
      <div className="grid cols-3" style={{ marginBottom: 22 }}>
        <Stat icon="trend" tone="green" label="Annual income" value={moneyShort(annualIncome)} money foot={<span className="stat-delta up"><Icon name="trend" style={{ width: 12, height: 12 }} />+12% YoY</span>} />
        <Stat icon="wallet" tone="warn" label="Annual expenses" value={moneyShort(totalExpense)} money foot={<span className="stat-delta">5 categories</span>} />
        <Stat icon="bank" tone="info" label="Net income" value={moneyShort(net)} money foot={<span className="stat-delta up">{Math.round(net / annualIncome * 100)}% margin</span>} />
      </div>
      <div className="dash-grid">
        <div className="card card-pad">
          <div className="section-head"><h3>Monthly revenue</h3></div>
          <BarChart data={window.LD.revenue} fmt={v => '₦' + v + 'M'} />
        </div>
        <div className="card card-pad">
          <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Expense breakdown</h3></div>
          <div className="stack">{window.LD.expenses.map((e, i) => <div key={e.cat} style={{ width: e.pct + '%', background: expColors[i] }} title={e.cat}></div>)}</div>
          <div className="legend">
            {window.LD.expenses.map((e, i) => (
              <div key={e.cat} className="legend-row"><span className="legend-sw" style={{ background: expColors[i] }}></span><span className="lr-name">{e.cat}</span><span className="lr-val">{moneyShort(e.amount)}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RentCollection, MaintenanceOps, Financials, AssignModal });
