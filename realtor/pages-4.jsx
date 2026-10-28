/* Ilé Realtor — Agent marketplace: your field team + a directory of verified agents to hire */

function AgentCardStat({ icon, children }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name={icon} style={{ width: 14, height: 14, color: 'var(--ink-400)' }} />{children}</span>;
}

function AreaChips({ areas, max = 4 }) {
  const shown = areas.slice(0, max);
  const extra = areas.length - shown.length;
  return (
    <div className="chip-row">
      {shown.map(a => <span key={a} className="area-chip"><Icon name="mapPin" style={{ width: 12, height: 12 }} />{a}</span>)}
      {extra > 0 && <span className="area-chip">+{extra}</span>}
    </div>
  );
}

function SpecChips({ specialties }) {
  return <div className="chip-row">{specialties.map(s => <span key={s} className="spec-chip">{s}</span>)}</div>;
}

function MktAgentCard({ a, ctx, onInvite, invited }) {
  return (
    <div className="agent-card">
      <div className="ac-top">
        <div onClick={() => ctx.go('agentDetail', a.id)} style={{ cursor: 'pointer' }}><TrustRing val={a.trust} size={58} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="ac-name" onClick={() => ctx.go('agentDetail', a.id)}>{a.name}</span>
            {a.verified && <Vbadge state="verified" sm />}
            {a.team && <span className="chip chip--paid"><span className="dot"></span>On your team</span>}
          </div>
          <div className="msg-snip" style={{ marginTop: 2 }}>{a.base} · {a.years} yr{a.years > 1 ? 's' : ''} experience</div>
          <div className="ac-stats" style={{ marginTop: 8 }}>
            <AgentCardStat icon="star"><b>{a.rating}</b> rating</AgentCardStat>
            <AgentCardStat icon="check"><b>{a.completed}</b> jobs</AgentCardStat>
            <AgentCardStat icon="clock">{a.response}</AgentCardStat>
          </div>
        </div>
      </div>
      <AreaChips areas={a.areas} />
      <SpecChips specialties={a.specialties} />
      <div className="ac-foot">
        <span className="rate-pill"><Icon name="wallet" style={{ width: 14, height: 14 }} />{moneyShort(a.feeMin)}–{moneyShort(a.feeMax)} / task</span>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--ink-200)' }} onClick={() => ctx.go('agentDetail', a.id)}>View profile</button>
          {a.team ? (
            <button className="btn btn-secondary btn-sm" onClick={() => ctx.go('fieldops')}><Icon name="plus" />Assign task</button>
          ) : invited ? (
            <button className="btn btn-secondary btn-sm" disabled style={{ opacity: .7 }}><Icon name="clock" />Invited</button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => onInvite(a)}><Icon name="userPlus" />Invite</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Agents({ ctx }) {
  const [tab, setTab] = useState('team');
  const [area, setArea] = useState('All');
  const [inviting, setInviting] = useState(null);
  const [invites, setInvites] = useState(() => window.RT.loadInvites());
  const [applicants, setApplicants] = useState(() => window.RT.loadApplicants());
  const [hired, setHired] = useState([]);

  const invitedSet = invites.map(i => i.agentId);
  const team = window.RT.teamRoster;
  const dir = window.RT.agentDirectory.filter(a => area === 'All' || a.base === area);

  function sendInvite(agent, payload) {
    const inv = {
      id: 'inv' + Date.now(), agentId: agent.id, agentName: agent.name,
      brokerage: 'Prime Realty', from: 'Ngozi Eze', area: payload.area,
      role: payload.role, feeNote: payload.feeNote, message: payload.message,
      when: 'Just now', status: 'pending'
    };
    setInvites(window.RT.pushInvite(inv));
    setInviting(null);
    ctx.toast('Invitation sent to ' + agent.name.split(' ')[0] + ' — delivered to their app');
  }

  function hire(app) {
    setHired(prev => [...prev, app.id]);
    ctx.toast(app.name.split(' ')[0] + ' added to your field team');
  }

  const pending = invites.filter(i => i.status === 'pending');

  return (
    <div className="page">
      <PageHeader title="Agents" sub="Your verified field team and the marketplace of agents you can engage for on-the-ground work." />

      <div className="mkt-tabs">
        <button className={"toggle-pill" + (tab === 'team' ? ' on' : '')} onClick={() => setTab('team')}>My team<span className="tab-n">{team.length}</span></button>
        <button className={"toggle-pill" + (tab === 'discover' ? ' on' : '')} onClick={() => setTab('discover')}>Discover<span className="tab-n">{window.RT.agentDirectory.length}</span></button>
        {applicants.length > 0 && <button className={"toggle-pill" + (tab === 'applicants' ? ' on' : '')} onClick={() => setTab('applicants')}>Applicants<span className="tab-n tab-n--alert">{applicants.filter(a => !hired.includes(a.id)).length}</span></button>}
      </div>

      {tab === 'team' && (
        <div>
          <div className="grid cols-2" style={{ marginBottom: pending.length ? 24 : 0 }}>
            {team.map(a => <MktAgentCard key={a.id} a={a} ctx={ctx} />)}
          </div>

          {pending.length > 0 && (
            <div>
              <h3 className="section-head" style={{ display: 'block', marginBottom: 12 }}>Pending invitations</h3>
              <div className="grid" style={{ gap: 12 }}>
                {pending.map(inv => (
                  <div key={inv.id} className="issue-card" style={{ cursor: 'default' }}>
                    <Avatar name={inv.agentName} size="lg" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{inv.agentName}</div>
                        <span className="chip chip--progress"><span className="dot"></span>Awaiting response</span>
                      </div>
                      <div className="msg-snip" style={{ marginTop: 3 }}>{inv.role} · {inv.area}</div>
                      <div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', marginTop: 6, display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="send" style={{ width: 13, height: 13, color: 'var(--primary)' }} />Invitation sent {inv.when}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'discover' && (
        <div>
          <div className="filterbar" style={{ marginBottom: 18, border: 'none', padding: 0, background: 'none', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', ...window.RT.agentAreas].map(f => <button key={f} className={"toggle-pill" + (area === f ? ' on' : '')} onClick={() => setArea(f)} style={{ padding: '8px 14px' }}>{f}</button>)}
          </div>
          {dir.length ? (
            <div className="grid cols-2">
              {dir.map(a => <MktAgentCard key={a.id} a={a} ctx={ctx} onInvite={setInviting} invited={invitedSet.includes(a.id)} />)}
            </div>
          ) : (
            <div className="card"><EmptyState icon="users" title="No agents in this area yet" desc="Try another location — our verified directory is growing across Nigeria." actions={<button className="btn btn-secondary btn-sm" onClick={() => setArea('All')}>View all areas</button>} /></div>
          )}
        </div>
      )}

      {tab === 'applicants' && (
        <div>
          <p style={{ font: 'var(--text-sm)', color: 'var(--ink-500)', marginTop: 0, marginBottom: 16 }}>Verified agents who applied to join Prime Realty through the marketplace.</p>
          <div className="grid" style={{ gap: 12 }}>
            {applicants.map(app => {
              const isHired = hired.includes(app.id);
              return (
                <div key={app.id} className="issue-card" style={{ cursor: 'default', alignItems: 'flex-start' }}>
                  <TrustRing val={app.agentTrust || 86} size={52} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{app.name}</div><Vbadge state="verified" sm /></div>
                      {isHired ? <span className="chip chip--paid"><span className="dot"></span>Added to team</span> : <span className="chip chip--draft"><span className="dot"></span>New applicant</span>}
                    </div>
                    <div className="msg-snip" style={{ marginTop: 3 }}>{app.base} · {app.rating} rating · {app.completed} jobs</div>
                    {app.areas && <div style={{ marginTop: 8 }}><AreaChips areas={app.areas} /></div>}
                    {app.message && <p style={{ font: 'var(--text-sm)', color: 'var(--ink-600)', margin: '10px 0 0' }}>“{app.message}”</p>}
                    <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => ctx.go('messages')}><Icon name="message" />Message</button>
                      {!isHired && <button className="btn btn-primary btn-sm" onClick={() => ctx.requireVerified(() => hire(app))}><Icon name="userPlus" />Add to team</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {inviting && <InviteAgentModal agent={inviting} onClose={() => setInviting(null)} onSend={sendInvite} />}
    </div>
  );
}

/* ---------------- Agent detail / profile ---------------- */
function AgentDetail({ ctx, id }) {
  const a = window.RT.findAgent(id) || window.RT.teamRoster[0];
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(window.RT.invitedIds().includes(a.id));
  const reviews = window.RT.agentReviews[a.id] || [];

  function sendInvite(agent, payload) {
    window.RT.pushInvite({
      id: 'inv' + Date.now(), agentId: agent.id, agentName: agent.name,
      brokerage: 'Prime Realty', from: 'Ngozi Eze', area: payload.area,
      role: payload.role, feeNote: payload.feeNote, message: payload.message,
      when: 'Just now', status: 'pending'
    });
    setInviting(false); setInvited(true);
    ctx.toast('Invitation sent to ' + agent.name.split(' ')[0] + ' — delivered to their app');
  }

  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('agents')}><Icon name="arrowLeft" />Back to agents</span>
      <div className="pd-grid">
        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <TrustRing val={a.trust} size={64} label="Trust" tier={a.trust >= 90 ? 'Excellent' : 'Verified'} />
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><h2 className="page-title" style={{ fontSize: '1.3rem' }}>{a.name}</h2><Vbadge state="verified" />{a.team && <span className="chip chip--paid"><span className="dot"></span>On your team</span>}</div>
                <div className="page-sub" style={{ marginBottom: 0 }}>{a.base} · {a.years} yr{a.years > 1 ? 's' : ''} experience · responds {a.response}</div>
              </div>
            </div>
            <div className="ac-stats" style={{ marginTop: 16, gap: 24 }}>
              <AgentCardStat icon="star"><b>{a.rating}</b> / 5 rating</AgentCardStat>
              <AgentCardStat icon="check"><b>{a.completed}</b> jobs completed</AgentCardStat>
              <span className="rate-pill"><Icon name="wallet" style={{ width: 14, height: 14 }} />{moneyShort(a.feeMin)}–{moneyShort(a.feeMax)} / task</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" style={{ flex: 1, minWidth: 130 }} onClick={() => ctx.go('messages')}><Icon name="message" />Message</button>
              {a.team ? (
                <button className="btn btn-primary" style={{ flex: 1, minWidth: 130 }} onClick={() => ctx.go('fieldops')}><Icon name="plus" />Assign task</button>
              ) : invited ? (
                <button className="btn btn-secondary" style={{ flex: 1, minWidth: 130 }} disabled><Icon name="clock" />Invitation sent</button>
              ) : (
                <button className="btn btn-primary" style={{ flex: 1, minWidth: 130 }} onClick={() => setInviting(true)}><Icon name="userPlus" />Invite to team</button>
              )}
            </div>
          </div>

          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h3 className="section-head" style={{ display: 'block' }}>About</h3>
            <p style={{ font: 'var(--text-sm)', color: 'var(--ink-700)', margin: 0, lineHeight: 1.6 }}>{a.bio}</p>
          </div>

          {reviews.length > 0 && (
            <div className="card card-pad">
              <h3 className="section-head" style={{ display: 'block' }}>Brokerage reviews</h3>
              <div className="feed">
                {reviews.map((r, i) => (
                  <div key={i} className="feed-item">
                    <div className="feed-ic" style={{ background: 'var(--gold-100)', color: 'var(--gold-600)' }}><Icon name="star" /></div>
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
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Coverage areas</h3>
            <AreaChips areas={a.areas} max={8} />
          </div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Services</h3>
            <SpecChips specialties={a.specialties} />
          </div>
          <div className="card card-pad">
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Verification</h3>
            {[['Identity', 'NIN verified'], ['Agent accreditation', 'Verified on Ilé'], ['Payout account', 'Linked & verified']].map(r => (
              <div key={r[0]} className="settings-row"><div><div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)' }}>{r[0]}</div><div className="msg-snip">{r[1]}</div></div><Vbadge state="verified" sm /></div>
            ))}
          </div>
        </div>
      </div>
      {inviting && <InviteAgentModal agent={a} onClose={() => setInviting(false)} onSend={sendInvite} />}
    </div>
  );
}

/* ---------------- Invite agent modal ---------------- */
function InviteAgentModal({ agent, onClose, onSend }) {
  const [f, setF] = useState({ role: 'Field agent — ' + agent.base.replace('Lagos — ', '') + ' coverage', feeNote: moneyShort(agent.feeMin) + '–' + moneyShort(agent.feeMax) + ' per task', message: 'Hi ' + agent.name.split(' ')[0] + ', we\u2019d like you to handle field work for Prime Realty listings in your area. Looking forward to working together.' });
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));
  const valid = f.role.trim() && f.message.trim();

  return (
    <div className="modal-scrim" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div><div className="modal-title">Invite {agent.name}</div><div className="modal-sub">Send an engagement invitation to join your field team.</div></div>
          <button className="modal-x" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="avatar-block" style={{ marginBottom: 16 }}><TrustRing val={agent.trust} size={44} /><div className="avatar-meta" style={{ marginLeft: 4 }}><span className="avatar-name">{agent.name}</span><span className="avatar-role">{agent.base} · {agent.rating} rating · {agent.completed} jobs</span></div><Vbadge state="verified" sm /></div>
          <Field label="Role / coverage" req><input className="input" value={f.role} onChange={e => set('role', e.target.value)} /></Field>
          <Field label="Fee arrangement" hint="Released to the agent through escrow on completion"><input className="input" value={f.feeNote} onChange={e => set('feeNote', e.target.value)} /></Field>
          <Field label="Message" req><textarea className="input" rows={3} value={f.message} onChange={e => set('message', e.target.value)} style={{ resize: 'vertical', minHeight: 72 }}></textarea></Field>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => onSend(agent, f)}><Icon name="send" />Send invitation</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Agents, AgentDetail, InviteAgentModal, MktAgentCard, AreaChips, SpecChips });
