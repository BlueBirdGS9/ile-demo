/* Ilé Agent — Tasks, Leads, Listings */

function Tasks({ ctx }) {
  const [tasks, setTasks] = useState(() => window.AD.getTasks());
  const [filter, setFilter] = useState('All');
  const [openAccess, setOpenAccess] = useState(null);
  const filters = ['All', 'To Do', 'In Progress', 'Done'];

  function toggle(id) {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const done = t.status === 'Done';
      return { ...t, status: done ? 'To Do' : 'Done' };
    }));
    const t = tasks.find(x => x.id === id);
    if (t.status !== 'Done') ctx.toast('Task done · ' + money(t.fee) + ' fee released');
  }

  const list = tasks.filter(t => filter === 'All' || t.status === filter);
  const openFees = tasks.filter(t => t.status !== 'Done').reduce((s, t) => s + t.fee, 0);

  return (
    <div className="page">
      <PageHeader title="Tasks" sub={"Field jobs assigned by Prime Realty · " + money(openFees) + " in fees outstanding"} />
      <div className="filterbar" style={{ marginBottom: 18, border: 'none', padding: 0, background: 'none' }}>
        {filters.map(f => <button key={f} className={"toggle-pill" + (filter === f ? ' on' : '')} onClick={() => setFilter(f)} style={{ padding: '8px 14px' }}>{f}<span style={{ marginLeft: 6, opacity: .6, fontFamily: 'var(--font-mono)' }}>{f === 'All' ? tasks.length : tasks.filter(t => t.status === f).length}</span></button>)}
      </div>

      {list.length ? (
        <div className="grid" style={{ gap: 12 }}>
          {list.map(t => {
            const p = window.AD.findListing(t.listingId) || { title: t.propTitle || 'Property', area: t.propArea || '' };
            return (
              <div key={t.id} className={"task-card" + (t.status === 'Done' ? ' done' : '')}>
                <div className={"task-check" + (t.status === 'Done' ? ' on' : '')} onClick={() => toggle(t.id)}>{t.status === 'Done' && <Icon name="check" />}</div>
                <div className="task-ic"><Icon name={TASK_ICON[t.type] || 'clipboard'} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                    <div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)', textDecoration: t.status === 'Done' ? 'line-through' : 'none' }}>{t.title}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 'none' }}>{t.isNew && <span className="chip chip--progress"><span className="dot"></span>New</span>}<span className={"prio " + t.priority}>{t.priority}</span>{taskChip(t.status)}</div>
                  </div>
                  <div className="pcard-loc" style={{ marginTop: 4 }}><Icon name="building" style={{ width: 14, height: 14 }} />{p.title} · {p.area}</div>
                  {t.assignedBy && <div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', marginTop: 4, display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="shieldCheck" style={{ width: 13, height: 13, color: 'var(--primary)' }} />Assigned by {t.assignedBy} · {t.brokerage || 'Prime Realty'}</div>}
                  {t.note && <p style={{ font: 'var(--text-sm)', color: 'var(--ink-600)', margin: '8px 0 0' }}>{t.note}</p>}
                  <div style={{ display: 'flex', gap: 14, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="clock" style={{ width: 14, height: 14, color: 'var(--ink-400)' }} />Due {t.due}</span>
                    <span className="fee-tag"><Icon name="wallet" />{money(t.fee)}</span>
                    {window.AD.taskAccess(t) && <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--ink-200)' }} onClick={() => setOpenAccess(openAccess === t.id ? null : t.id)}><Icon name="key" />{openAccess === t.id ? 'Hide access' : 'Access & keys'}</button>}
                    {t.status !== 'Done' && <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => ctx.requireVerified(() => toggle(t.id))}><Icon name="check" />Mark done</button>}
                  </div>
                  {openAccess === t.id && window.AD.taskAccess(t) && <div style={{ marginTop: 12 }}><AccessPanel access={window.AD.taskAccess(t)} id={'task-' + t.id} title={p.title} /></div>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card"><EmptyState icon="clipboard" title={"No " + filter.toLowerCase() + " tasks"} desc="Tasks assigned to you by the brokerage will appear here." actions={<button className="btn btn-secondary btn-sm" onClick={() => setFilter('All')}>View all</button>} /></div>
      )}
    </div>
  );
}

/* ---------------- Leads ---------------- */
function Leads({ ctx }) {
  return (
    <div className="page">
      <PageHeader title="Leads" sub="Prospects assigned to you to follow up and convert into viewings." />
      <div className="grid" style={{ gap: 12 }}>
        {window.AD.leads.map(l => {
          const p = window.AD.findListing(l.listingId);
          return (
            <div key={l.id} className="issue-card" style={{ cursor: 'default' }}>
              <Avatar name={l.name} size="lg" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{l.name}</div>{l.hot && <span className="chip chip--overdue"><span className="dot"></span>Hot</span>}</div>
                  <Chip kind={l.status === 'Viewing booked' ? 'paid' : l.status === 'New' ? 'progress' : 'due'}>{l.status}</Chip>
                </div>
                <div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', marginTop: 3 }}>{l.intent} · {p.area} · {p.type} · Trust {l.trust}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ font: 'var(--text-sm)', color: 'var(--ink-700)', display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name="arrowRight" style={{ width: 15, height: 15, color: 'var(--primary)' }} />Next: {l.next}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--ink-200)' }} href={"tel:" + l.phone}><Icon name="phone" />Call</a>
                    <button className="btn btn-secondary btn-sm" onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Message</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Listings (read-only coverage) ---------------- */
function Listings({ ctx }) {
  return (
    <div className="page">
      <PageHeader title="Listings" sub="Properties you're covering for Prime Realty — keys, access and details." />
      <div className="grid cols-2">
        {window.AD.listings.map(l => (
          <div key={l.id} className="card card-pad">
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ width: 96, height: 72, borderRadius: 10, flex: 'none', display: 'grid', placeItems: 'center', background: 'repeating-linear-gradient(135deg,var(--ink-100),var(--ink-100) 10px,var(--ink-50) 10px,var(--ink-50) 20px)' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: '.58rem', color: 'var(--ink-400)' }}>{l.image}</span></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{l.title}</div><span className="chip chip--draft">{l.deal}</span></div>
                <div className="pcard-loc" style={{ marginTop: 3 }}><Icon name="mapPin" />{l.address}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 8, font: 'var(--text-caption)', color: 'var(--ink-500)' }}>
                  <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><Icon name="bed" style={{ width: 13, height: 13 }} />{l.beds}</span>
                  <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}><Icon name="bath" style={{ width: 13, height: 13 }} />{l.baths}</span>
                  <span className="money" style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--ink-700)' }}>{moneyShort(l.price)}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ink-100)', flexWrap: 'wrap' }}>
              <span className="tag" style={{ background: 'var(--green-50)', color: 'var(--primary)', border: 'none' }}><Icon name="key" style={{ width: 14, height: 14 }} />{l.key}</span>
              <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => ctx.toast('Opening directions…')}><Icon name="navigation" />Directions</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Tasks, Leads, Listings });
