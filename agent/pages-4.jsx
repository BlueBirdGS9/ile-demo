/* Ilé Agent — Find Work: brokerage marketplace, invites & applications */

function FwStat({ icon, children }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name={icon} style={{ width: 14, height: 14, color: 'var(--ink-400)' }} />{children}</span>;
}

function FindWork({ ctx }) {
  const me = window.AD.myProfile;
  const [open, setOpen] = useState(() => { try { return localStorage.getItem('grt_open_to_work') !== 'false'; } catch (e) { return true; } });
  const [area, setArea] = useState('All');
  const [invites, setInvites] = useState(() => window.AD.allInvites());
  const [handled, setHandled] = useState({});               // inviteId -> 'accepted' | 'declined'
  const [apps, setApps] = useState(() => window.AD.loadApplications());
  const [applying, setApplying] = useState(null);

  function setAvailability(v) { setOpen(v); try { localStorage.setItem('grt_open_to_work', String(v)); } catch (e) {} ctx.toast(v ? 'You\u2019re now visible to brokerages' : 'Marked as not available'); }

  function respondInvite(inv, action) {
    setHandled(prev => ({ ...prev, [inv.id]: action }));
    ctx.toast(action === 'accepted' ? 'Joined ' + inv.brokerage + ' \u2014 welcome aboard' : 'Invitation declined');
  }

  function submitApplication(broker, message) {
    const app = {
      id: 'app' + Date.now(), brokerageId: broker.id, brokerage: broker.name,
      name: me.name, agentTrust: me.trust, base: me.base, areas: me.areas,
      rating: me.rating, completed: me.completed, feeRange: moneyShort(me.feeMin) + '\u2013' + moneyShort(me.feeMax),
      message, when: 'Just now', status: 'pending'
    };
    setApps(window.AD.pushApplication(app));
    setApplying(null);
    ctx.toast('Application sent to ' + broker.name);
  }

  const pendingInvites = invites.filter(i => !handled[i.id]);
  const appliedIds = apps.map(a => a.brokerageId);
  const list = window.AD.brokerages.filter(b => area === 'All' || b.area === area);

  return (
    <div className="page">
      <PageHeader title="Find work" sub="Get discovered by verified brokerages, respond to invitations, and apply to agencies hiring in your area." />

      {/* Availability + profile summary */}
      <div className={"avail-card" + (open ? '' : ' off')} style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <TrustRing val={me.trust} size={60} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{me.name}</span><Vbadge state="verified" sm /></div>
            <div className="msg-snip" style={{ marginTop: 2 }}>{me.base} · {me.rating} rating · {me.completed} jobs</div>
            <div style={{ marginTop: 8 }}><SpecChips specialties={me.specialties} /></div>
          </div>
          <div className="avail-toggle">
            <div className="avail-label">{open ? 'Open to work' : 'Not available'}</div>
            <button className={"switch" + (open ? ' on' : '')} onClick={() => setAvailability(!open)} aria-label="Toggle availability"><span className="knob"></span></button>
          </div>
        </div>
      </div>

      {/* Invitations */}
      {pendingInvites.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <h3 className="section-head" style={{ display: 'block', marginBottom: 12 }}>Invitations <span className="tab-n tab-n--alert">{pendingInvites.length}</span></h3>
          <div className="grid" style={{ gap: 12 }}>
            {pendingInvites.map(inv => (
              <div key={inv.id} className="invite-card">
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div className="brk-logo"><Icon name="briefcase" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{inv.brokerage}</span><Vbadge state="verified" sm />{inv.live && <span className="chip chip--progress"><span className="dot"></span>New</span>}</div>
                      <span className="msg-time">{inv.when}</span>
                    </div>
                    <div className="msg-snip" style={{ marginTop: 3 }}>{inv.role} · {inv.area}{inv.from ? ' · ' + inv.from : ''}</div>
                    <p style={{ font: 'var(--text-sm)', color: 'var(--ink-600)', margin: '10px 0 0' }}>“{inv.message}”</p>
                    <div style={{ display: 'flex', gap: 14, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="fee-tag"><Icon name="wallet" />{inv.feeNote}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                      <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--ink-200)' }} onClick={() => respondInvite(inv, 'declined')}><Icon name="x" />Decline</button>
                      <button className="btn btn-primary btn-sm" onClick={() => ctx.requireVerified(() => respondInvite(inv, 'accepted'))}><Icon name="check" />Accept &amp; join</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brokerages hiring */}
      <h3 className="section-head" style={{ display: 'block', marginBottom: 12 }}>Brokerages hiring</h3>
      <div className="filterbar" style={{ marginBottom: 16, border: 'none', padding: 0, background: 'none', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['All', ...window.AD.brokerAreas].map(f => <button key={f} className={"toggle-pill" + (area === f ? ' on' : '')} onClick={() => setArea(f)} style={{ padding: '8px 14px' }}>{f}</button>)}
      </div>
      <div className="grid cols-2">
        {list.map(b => {
          const applied = appliedIds.includes(b.id);
          return (
            <div key={b.id} className="agent-card">
              <div className="ac-top">
                <div className="brk-logo"><Icon name="briefcase" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{b.name}</span>
                    {b.verified && <Vbadge state="verified" sm />}
                    {b.current && <span className="chip chip--paid"><span className="dot"></span>Your brokerage</span>}
                  </div>
                  <div className="msg-snip" style={{ marginTop: 2 }}>{b.area}{b.realtor ? ' · ' + b.realtor : ''}</div>
                  <div className="ac-stats" style={{ marginTop: 8 }}>
                    <FwStat icon="star"><b>{b.rating}</b> rating</FwStat>
                    <FwStat icon="users"><b>{b.agents}</b> agents</FwStat>
                    <FwStat icon="shieldCheck">Trust {b.trust}</FwStat>
                  </div>
                </div>
              </div>
              <p style={{ font: 'var(--text-sm)', color: 'var(--ink-600)', margin: 0, lineHeight: 1.55 }}>{b.blurb}</p>
              <div className="chip-row">
                <span className="area-chip"><Icon name="wallet" style={{ width: 12, height: 12 }} />{b.feeModel}</span>
                {b.openRoles > 0 && <span className="spec-chip">{b.openRoles} open role{b.openRoles > 1 ? 's' : ''}</span>}
              </div>
              <div className="ac-foot">
                {b.current ? (
                  <span style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', display: 'inline-flex', gap: 6, alignItems: 'center' }}><Icon name="check" style={{ width: 15, height: 15, color: 'var(--primary)' }} />Currently engaged</span>
                ) : (
                  <span style={{ font: 'var(--text-caption)', color: b.openRoles ? 'var(--primary)' : 'var(--ink-400)', fontWeight: 600 }}>{b.openRoles ? 'Hiring now' : 'No open roles'}</span>
                )}
                <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Message</button>
                  {!b.current && (applied
                    ? <button className="btn btn-secondary btn-sm" disabled style={{ opacity: .7 }}><Icon name="check" />Applied</button>
                    : <button className="btn btn-primary btn-sm" disabled={!b.openRoles} onClick={() => ctx.requireVerified(() => setApplying(b))}><Icon name="send" />Apply</button>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Applications sent */}
      {apps.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <h3 className="section-head" style={{ display: 'block', marginBottom: 12 }}>Applications sent</h3>
          <div className="grid" style={{ gap: 12 }}>
            {apps.map(a => (
              <div key={a.id} className="issue-card" style={{ cursor: 'default' }}>
                <div className="brk-logo" style={{ width: 42, height: 42 }}><Icon name="briefcase" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{a.brokerage}</div>
                    <span className="chip chip--progress"><span className="dot"></span>Awaiting response</span>
                  </div>
                  <div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)', marginTop: 4, display: 'inline-flex', gap: 5, alignItems: 'center' }}><Icon name="send" style={{ width: 13, height: 13, color: 'var(--primary)' }} />Applied {a.when}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {applying && <ApplyModal broker={applying} me={me} onClose={() => setApplying(null)} onSubmit={submitApplication} />}
    </div>
  );
}

/* ---------------- Apply modal ---------------- */
function ApplyModal({ broker, me, onClose, onSubmit }) {
  const [message, setMessage] = useState('Hi, I\u2019m a verified field agent covering ' + me.areas.slice(0, 3).join(', ') + '. ' + me.completed + ' jobs completed at a ' + me.rating + ' rating. I\u2019d love to join ' + broker.name + '.');
  const valid = message.trim();
  return (
    <div className="modal-scrim" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div><div className="modal-title">Apply to {broker.name}</div><div className="modal-sub">{broker.area} · {broker.feeModel}</div></div>
          <button className="modal-x" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <div className="avatar-block" style={{ marginBottom: 16 }}><TrustRing val={me.trust} size={44} /><div className="avatar-meta" style={{ marginLeft: 4 }}><span className="avatar-name">{me.name}</span><span className="avatar-role">{me.base} · {me.rating} rating · {me.completed} jobs</span></div><Vbadge state="verified" sm /></div>
          <Field label="Coverage areas"><AreaChips areas={me.areas} max={8} /></Field>
          <Field label="Message to brokerage" req hint="Your verified profile and ratings are shared automatically"><textarea className="input" rows={4} value={message} onChange={e => setMessage(e.target.value)} style={{ resize: 'vertical', minHeight: 90 }}></textarea></Field>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => onSubmit(broker, message.trim())}><Icon name="send" />Send application</button>
        </div>
      </div>
    </div>
  );
}

/* Shared chip helpers (mirrors the Realtor app) */
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

Object.assign(window, { FindWork, ApplyModal, AreaChips, SpecChips });
