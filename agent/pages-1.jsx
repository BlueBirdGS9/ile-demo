/* Ilé Agent — Today, Schedule */

function Today({ ctx }) {
  const todayViews = window.AD.viewings.filter(v => v.date === 'Today');
  const next = todayViews.find(v => v.status !== 'Completed') || todayViews[0];
  const nextProp = next && window.AD.findListing(next.listingId);
  const openTasks = window.AD.getTasks().filter(t => t.status !== 'Done');
  const weekEarned = window.AD.payouts.reduce((s, p) => s + p.amount, 0);
  const leadsToFollow = window.AD.leads.filter(l => l.status !== 'Viewing booked').length;

  return (
    <div className="page">
      <PageHeader title="Good morning, Tobi" sub="Friday, 30 May 2026 · here's your day with Prime Realty." />

      {next && (
        <div className="nextup" style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div className="ey">Next up · {next.time}</div>
              <div className="ttl">{next.type} viewing — {nextProp.area}</div>
              <div style={{ font: 'var(--text-sm)', color: 'rgba(255,255,255,.85)' }}>{nextProp.title} · hosting {next.lead}</div>
              <div className="meta">
                <span><Icon name="mapPin" />{nextProp.address}</span>
                <span><Icon name="key" />{nextProp.key}</span>
              </div>
              <div className="acts">
                <button className="btn btn-gold" onClick={() => ctx.go('schedule')}><Icon name="check" />Check in</button>
                <a className="btn btn-secondary" href={"tel:" + next.leadPhone}><Icon name="phone" />Call {next.lead.split(' ')[0]}</a>
                <button className="btn btn-ghost" style={{ color: '#fff', border: '1px solid rgba(255,255,255,.4)' }} onClick={() => ctx.toast('Opening directions…')}><Icon name="navigation" />Directions</button>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}><div className="ey">Field fee</div><div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>{money(next.fee)}</div></div>
          </div>
        </div>
      )}

      <div className="grid cols-4" style={{ marginBottom: 22 }}>
        <Stat icon="calendar" tone="info" label="Viewings today" value={todayViews.length} foot={<span className="link" onClick={() => ctx.go('schedule')}>View schedule →</span>} />
        <Stat icon="clipboard" tone="gold" label="Open tasks" value={openTasks.length} foot={<span className="link" onClick={() => ctx.go('tasks')}>Open tasks →</span>} />
        <Stat icon="users" tone="green" label="Follow-ups" value={leadsToFollow} foot={<span className="link" onClick={() => ctx.go('leads')}>View leads →</span>} />
        <Stat icon="wallet" tone="escrow" label="Earned (wk)" value={moneyShort(weekEarned)} money foot={<span className="stat-delta up"><Icon name="trend" />4 payouts</span>} />
      </div>

      <div className="dash-grid">
        <div className="card card-pad">
          <div className="section-head"><h3>Today's schedule</h3><span className="link" onClick={() => ctx.go('schedule')}>Full schedule<Icon name="chevronRight" /></span></div>
          <div className="timeline">
            {todayViews.map((v, i) => {
              const p = window.AD.findListing(v.listingId);
              const cls = v.status === 'Completed' ? 'done' : i === todayViews.findIndex(x => x.status !== 'Completed') ? 'now' : '';
              const [hm, ap] = v.time.split(' ');
              return (
                <div key={v.id} className={"tl-row " + cls}>
                  <div className="tl-time">{hm}<span className="ap">{ap}</span></div>
                  <div className="tl-track"></div>
                  <div className="tl-dot"></div>
                  <div className="tl-card" onClick={() => ctx.go('schedule')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                      <div style={{ font: 'var(--text-sm)', fontWeight: 700, color: 'var(--ink-900)' }}>{p.area} · {p.type}</div>
                      {viewChip(v.status)}
                    </div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 6, font: 'var(--text-caption)', color: 'var(--ink-500)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="user" style={{ width: 13, height: 13 }} />{v.lead}</span>
                      <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="mapPin" style={{ width: 13, height: 13 }} />{p.area}</span>
                      <span className="fee-tag" style={{ marginLeft: 'auto' }}><Icon name="wallet" />{money(v.fee)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Tasks due</h3><span className="link" onClick={() => ctx.go('tasks')}>All<Icon name="chevronRight" /></span></div>
            {openTasks.slice(0, 3).map(t => {
              const p = window.AD.findListing(t.listingId) || { title: t.propTitle || 'Property', area: t.propArea || '' };
              return (
                <div key={t.id} className="msg-row" onClick={() => ctx.go('tasks')}>
                  <div className="feed-ic" style={{ background: 'var(--green-50)', color: 'var(--primary)' }}><Icon name={TASK_ICON[t.type] || 'clipboard'} /></div>
                  <div className="msg-meta"><div className="msg-name">{t.title}</div><div className="msg-snip">{p.area} · due {t.due}</div></div>
                  <span className={"prio " + t.priority}>{t.priority}</span>
                </div>
              );
            })}
          </div>

          <div className="card card-pad">
            <div className="section-head"><h3 style={{ fontSize: '1rem' }}>From your brokerage</h3><span className="link" onClick={() => ctx.go('messages')}>Open<Icon name="chevronRight" /></span></div>
            <div className="avatar-block" style={{ marginBottom: 12 }}><Avatar name="Ngozi Eze" color="gold" /><div className="avatar-meta"><span className="avatar-name">Ngozi Eze</span><span className="avatar-role">Realtor · Prime Realty</span></div></div>
            <div className="bubble them" style={{ maxWidth: '100%', marginLeft: 0 }}>Great, please confirm all three viewings today.<span className="bt">20m ago</span></div>
            <button className="btn btn-secondary btn-block" style={{ marginTop: 14 }} onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Reply</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Schedule ---------------- */
function Schedule({ ctx }) {
  const [views, setViews] = useState(window.AD.viewings.map(v => ({ ...v })));
  const [logging, setLogging] = useState(null);
  const [outcome, setOutcome] = useState('');

  function advance(id) {
    setViews(prev => prev.map(v => {
      if (v.id !== id) return v;
      const nextStatus = v.status === 'Upcoming' ? 'Checked-in' : 'Completed';
      return { ...v, status: nextStatus };
    }));
    const v = views.find(x => x.id === id);
    if (v.status === 'Upcoming') ctx.toast('Checked in — viewing started');
    else { setLogging(id); }
  }
  function saveOutcome(id) {
    setViews(prev => prev.map(v => v.id === id ? { ...v, outcome: outcome || 'Completed' } : v));
    setLogging(null); setOutcome(''); ctx.toast('Outcome logged · fee released');
  }

  const groups = views.reduce((acc, v) => { (acc[v.date] = acc[v.date] || []).push(v); return acc; }, {});
  const order = ['Today', 'Tomorrow', 'Yesterday'];
  const keys = Object.keys(groups).sort((a, b) => order.indexOf(a) - order.indexOf(b));

  return (
    <div className="page">
      <PageHeader title="Schedule" sub="Every viewing you're hosting — check in on arrival, then log the outcome to release your fee." />
      {keys.map(date => (
        <div key={date} style={{ marginBottom: 24 }}>
          <div style={{ font: 'var(--text-sm)', fontWeight: 700, color: 'var(--ink-700)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Icon name="calendar" style={{ width: 16, height: 16, color: 'var(--ink-400)' }} />{date}</div>
          <div className="grid" style={{ gap: 12 }}>
            {groups[date].map(v => {
              const p = window.AD.findListing(v.listingId);
              return (
                <div key={v.id} className="issue-card" style={{ cursor: 'default', flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', gap: 14 }}>
                    <div className="issue-ic" style={{ background: v.status === 'Completed' ? 'var(--success-bg)' : v.status === 'Checked-in' ? 'var(--info-bg)' : 'var(--warning-bg)', color: v.status === 'Completed' ? 'var(--success)' : v.status === 'Checked-in' ? 'var(--info-text)' : 'var(--warning-text)' }}><Icon name="calendar" /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}><div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{p.title}</div>{viewChip(v.status)}</div>
                      <div className="pcard-loc" style={{ marginTop: 3 }}><Icon name="mapPin" />{p.address}</div>
                      <div style={{ display: 'flex', gap: 16, marginTop: 10, font: 'var(--text-sm)', color: 'var(--ink-600)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="clock" style={{ width: 15, height: 15, color: 'var(--ink-400)' }} />{v.time}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="user" style={{ width: 15, height: 15, color: 'var(--ink-400)' }} />{v.lead}</span>
                        <span className="fee-tag" style={{ marginLeft: 'auto' }}><Icon name="wallet" />{money(v.fee)}</span>
                      </div>
                      {v.outcome && <div className="trust-callout" style={{ marginTop: 12 }}><Icon name="check" style={{ color: 'var(--success)' }} /><p>{v.outcome}</p></div>}
                    </div>
                  </div>

                  {v.status !== 'Completed' && p.access && <div style={{ marginTop: 14 }}><AccessPanel access={p.access} id={v.id} title={p.title} /></div>}

                  {logging === v.id ? (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ink-100)' }}>
                      <Field label="Log viewing outcome"><textarea className="textarea" rows="2" placeholder="e.g. Buyer interested, requested a second viewing" value={outcome} onChange={e => setOutcome(e.target.value)}></textarea></Field>
                      <div style={{ display: 'flex', gap: 10 }}><button className="btn btn-primary" onClick={() => ctx.requireVerified(() => saveOutcome(v.id))}><Icon name="check" />Submit &amp; release fee</button><button className="btn btn-ghost" style={{ border: '1px solid var(--ink-200)' }} onClick={() => setLogging(null)}>Cancel</button></div>
                    </div>
                  ) : v.status !== 'Completed' ? (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--ink-100)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <a className="btn btn-secondary btn-sm" href={"tel:" + v.leadPhone}><Icon name="phone" />Call lead</a>
                      <button className="btn btn-secondary btn-sm" onClick={() => ctx.toast('Opening directions…')}><Icon name="navigation" />Directions</button>
                      <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => ctx.requireVerified(() => advance(v.id))}><Icon name="check" />{v.status === 'Upcoming' ? 'Check in' : 'Complete & log'}</button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { Today, Schedule });
