/* Ilé Buyer — Saved, Compare, Watchlist, Viewings, Offers, Offer detail */

function Saved({ ctx }) {
  const saved = ctx.saved.map(id => window.BD.find(id)).filter(Boolean);
  return (
    <div className="page">
      <PageHeader title="Saved homes" sub="Your shortlist of properties to buy." actions={ctx.compareList.length >= 2 ? <button className="btn btn-secondary" onClick={() => ctx.go('compare')}><Icon name="scale" />Compare {ctx.compareList.length}</button> : null} />
      {saved.length ? (
        <div className="grid cols-3">{saved.map(p => (
          <div key={p.id}>
            <BuyCard p={p} saved onSave={ctx.toggleSave} onOpen={id => ctx.go('details', id)} />
            <button className={"btn btn-ghost btn-sm btn-block" + (ctx.compareList.includes(p.id) ? '' : '')} style={{ marginTop: 8, border: '1px solid var(--ink-200)', color: ctx.compareList.includes(p.id) ? 'var(--primary)' : 'var(--ink-600)' }} onClick={() => ctx.toggleCompare(p.id)}><Icon name="scale" />{ctx.compareList.includes(p.id) ? 'In comparison' : 'Add to compare'}</button>
          </div>
        ))}</div>
      ) : (
        <div className="card"><EmptyState icon="bookmark" title="No saved homes yet" desc="Tap the heart on any listing to save it here and build your shortlist." actions={<button className="btn btn-primary btn-sm" onClick={() => ctx.go('discover')}>Browse homes</button>} /></div>
      )}
    </div>
  );
}

function Compare({ ctx }) {
  const cmp = ctx.compareList.map(id => window.BD.find(id)).filter(Boolean);
  const estMonthly = p => Math.round(p.price * 0.75 * 0.013);
  const rows = [
    ['Price', p => money(p.price), 'min'],
    ['Type', p => p.type], ['Location', p => p.area + ', ' + p.city],
    ['Bedrooms', p => p.beds], ['Bathrooms', p => p.baths], ['Floor area', p => p.sqm + ' m²'],
    ['Est. mortgage / mo', p => money(estMonthly(p))], ['Title', p => p.amenities.find(a => /C of O|Deed|Survey/.test(a)) || '—'],
    ['Rating', p => p.rating + ' ★ (' + p.reviews + ')'], ['Verified title', p => p.verified ? '✓ Verified' : '— Pending'],
    ['Seller trust', p => p.owner.trust]
  ];
  const minPrice = cmp.length ? Math.min(...cmp.map(p => p.price)) : 0;
  return (
    <div className="page">
      <PageHeader title="Compare homes" sub="Weigh your shortlisted properties side by side." actions={cmp.length ? <button className="btn btn-ghost" style={{ border: '1px solid var(--ink-200)' }} onClick={() => cmp.forEach(p => ctx.toggleCompare(p.id))}>Clear comparison</button> : null} />
      {cmp.length >= 2 ? (
        <div className="compare-wrap">
          <table className="compare-table">
            <thead><tr><th></th>{cmp.map(p => <th key={p.id}><div style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{p.title}</div><div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>{p.area}</div></th>)}</tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r[0]}><th>{r[0]}</th>{cmp.map(p => <td key={p.id} className={r[2] === 'min' && p.price === minPrice ? 'best' : ''}>{r[1](p)}{r[2] === 'min' && p.price === minPrice ? ' · best value' : ''}</td>)}</tr>
              ))}
              <tr><th></th>{cmp.map(p => <td key={p.id}><div style={{ display: 'flex', gap: 6 }}><button className="btn btn-primary btn-sm" onClick={() => ctx.go('details', p.id)}>View</button><button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--ink-200)' }} onClick={() => ctx.toggleCompare(p.id)}><Icon name="x" /></button></div></td>)}</tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card"><EmptyState icon="scale" title="Add at least two homes to compare" desc="Save homes you like, then add them to the comparison from your shortlist." actions={<button className="btn btn-primary btn-sm" onClick={() => ctx.go('saved')}>Go to saved</button>} /></div>
      )}
    </div>
  );
}

function Watchlist({ ctx }) {
  const watched = ctx.watched.map(id => window.BD.find(id)).filter(Boolean);
  return (
    <div className="page">
      <PageHeader title="Watchlist" sub="Homes you're tracking — we'll alert you on price changes and activity." />
      {watched.length ? (
        <div className="grid" style={{ gap: 12 }}>
          {watched.map(p => {
            const w = window.BD.watchAlerts[p.id];
            const tone = !w ? null : w.kind === 'down' ? ['var(--success-bg)', 'var(--success)', 'trendDown'] : w.kind === 'warn' ? ['var(--warning-bg)', 'var(--warning-text)', 'eye'] : ['var(--info-bg)', 'var(--info-text)', 'info'];
            return (
              <div key={p.id} className="issue-card" onClick={() => ctx.go('details', p.id)}>
                <div style={{ width: 92, height: 68, borderRadius: 10, background: 'repeating-linear-gradient(135deg,var(--ink-100),var(--ink-100) 10px,var(--ink-50) 10px,var(--ink-50) 20px)', flex: 'none', display: 'grid', placeItems: 'center' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', color: 'var(--ink-400)' }}>{p.type}</span></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{p.title}</div><span className="money" style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{moneyShort(p.price)}</span></div>
                  <div className="pcard-loc" style={{ marginTop: 3 }}><Icon name="mapPin" />{p.area}, {p.city}</div>
                  <div className="tag" style={{ marginTop: 8, background: tone ? tone[0] : 'var(--ink-100)', color: tone ? tone[1] : 'var(--ink-500)', border: 'none' }}><Icon name={tone ? tone[2] : 'eye'} style={{ width: 14, height: 14 }} />{w ? w.alert : 'Tracking active — no changes yet'}</div>
                </div>
                <button className="icon-btn" title="Stop tracking" onClick={e => { e.stopPropagation(); ctx.toggleWatch(p.id); ctx.toast('Removed from watchlist'); }}><Icon name="eye" style={{ color: 'var(--escrow)' }} /></button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card"><EmptyState icon="eye" title="You're not tracking any homes yet" desc="Open any listing and tap “Watch price” to track it here — we'll alert you to price drops and new activity." actions={<button className="btn btn-primary btn-sm" onClick={() => ctx.go('discover')}><Icon name="compass" />Browse homes</button>} /></div>
      )}
    </div>
  );
}

function Viewings({ ctx }) {
  const [requesting, setRequesting] = useState(false);
  return (
    <div className="page">
      <PageHeader title="Viewings" sub="Inspect homes in person before you commit." actions={<button className="btn btn-primary" onClick={() => setRequesting(r => !r)}><Icon name={requesting ? 'x' : 'plus'} />{requesting ? 'Cancel' : 'Request a viewing'}</button>} />

      {requesting && (
        <div className="card card-pad" style={{ marginBottom: 22 }}>
          <h3 className="section-head" style={{ display: 'block' }}>Request a viewing</h3>
          <div className="grid cols-2">
            <Field label="Property" req><select className="select">{window.BD.listings.map(p => <option key={p.id}>{p.title} · {p.area}</option>)}</select></Field>
            <Field label="Preferred date"><input className="input" type="date" defaultValue="2026-06-05" /></Field>
            <Field label="Preferred time"><select className="select"><option>Morning (9–12)</option><option>Afternoon (12–4)</option><option>Evening (4–6)</option></select></Field>
            <Field label="Viewing type"><select className="select"><option>In person</option><option>Virtual walkthrough</option></select></Field>
          </div>
          <button className="btn btn-primary" onClick={() => { setRequesting(false); ctx.toast('Viewing requested'); }}><Icon name="send" />Send request</button>
        </div>
      )}

      <div className="grid" style={{ gap: 12 }}>
        {window.BD.viewings.map(v => {
          const p = window.BD.find(v.listingId);
          return (
            <div key={v.id} className="issue-card" onClick={() => ctx.go('details', v.listingId)}>
              <div className="issue-ic" style={{ background: v.status === 'Confirmed' ? 'var(--success-bg)' : v.status === 'Completed' ? 'var(--ink-100)' : 'var(--warning-bg)', color: v.status === 'Confirmed' ? 'var(--success)' : v.status === 'Completed' ? 'var(--ink-500)' : 'var(--warning-text)' }}><Icon name="calendar" /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}><div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{p.title}</div><Chip kind={v.status === 'Confirmed' ? 'paid' : v.status === 'Completed' ? 'resolved' : 'due'}>{v.status}</Chip></div>
                <div className="pcard-loc" style={{ marginTop: 3 }}><Icon name="mapPin" />{p.area}, {p.city}</div>
                <div style={{ display: 'flex', gap: 18, marginTop: 10, font: 'var(--text-sm)', color: 'var(--ink-600)', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="calendar" style={{ width: 15, height: 15, color: 'var(--ink-400)' }} />{v.date}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="clock" style={{ width: 15, height: 15, color: 'var(--ink-400)' }} />{v.time}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="user" style={{ width: 15, height: 15, color: 'var(--ink-400)' }} />{v.agent}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Offers ---------------- */
function Offers({ ctx }) {
  return (
    <div className="page">
      <PageHeader title="Offers" sub="Track and negotiate every offer you've made — all in one place." actions={<button className="btn btn-primary" onClick={() => ctx.go('discover')}><Icon name="plus" />New offer</button>} />
      <div className="grid" style={{ gap: 12 }}>
        {window.BD.offers.map(o => {
          const p = window.BD.find(o.listingId);
          return (
            <div key={o.id} className="issue-card" onClick={() => ctx.go('offer', o.id)}>
              <div style={{ width: 92, height: 68, borderRadius: 10, background: 'repeating-linear-gradient(135deg,var(--ink-100),var(--ink-100) 10px,var(--ink-50) 10px,var(--ink-50) 20px)', flex: 'none', display: 'grid', placeItems: 'center' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', color: 'var(--ink-400)' }}>{p.type}</span></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{p.title}</div>{offerChip(o.status)}</div>
                <div className="pcard-loc" style={{ marginTop: 3 }}><Icon name="mapPin" />{p.area}, {p.city}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-400)', fontWeight: 700 }}>Your offer</div>
                    <span className="money" style={{ fontWeight: 700, color: 'var(--ink-900)', fontSize: '1.05rem' }}>{money(o.amount)}</span>
                    {o.counter && <span style={{ font: 'var(--text-caption)', color: 'var(--gold-600)', marginLeft: 10 }}>↳ countered at {moneyShort(o.counter)}</span>}
                  </div>
                  <span className="msg-time">{o.financing} · {o.when}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OfferDetail({ ctx, id }) {
  const o0 = window.BD.findOffer(id) || window.BD.offers[0];
  const p = window.BD.find(o0.listingId);
  const [thread, setThread] = useState(o0.thread.slice());
  const [status, setStatus] = useState(o0.status);
  const [counter, setCounter] = useState('');
  const bodyRef = useRef(null);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [thread]);

  function sendCounter() {
    const amt = Number(String(counter).replace(/[^\d]/g, ''));
    if (!amt) return;
    setThread(t => [...t, { me: true, type: 'counter', amount: amt, text: 'Revised offer.', t: 'Now' }]);
    setStatus('Submitted'); setCounter(''); ctx.toast('Counter-offer sent');
  }
  function acceptCounter() {
    setThread(t => [...t, { me: true, type: 'accept', text: 'Accepted the counter-offer. Let\u2019s proceed to escrow.', t: 'Now' }]);
    setStatus('Accepted'); ctx.toast('Counter accepted');
  }

  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('offers')}><Icon name="arrowLeft" />All offers</span>
      <div className="pd-grid">
        <div>
          <div className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div><h2 className="page-title" style={{ fontSize: '1.4rem' }}>Negotiation</h2><div className="page-sub">{p.title} · {p.area}, {p.city}</div></div>
              {offerChip(status)}
            </div>
            <hr className="divider" style={{ margin: '14px 0' }} />
            <div className="nego" ref={bodyRef} style={{ maxHeight: 440, overflowY: 'auto' }}>
              {thread.map((e, i) => (
                <div key={i} className={"nego-event " + (e.me ? 'me' : 'them')}>
                  {e.type === 'msg'
                    ? <div className="msg-bubble">{e.text}<span className="ob-time" style={{ display: 'block', marginTop: 4, opacity: .7 }}>{e.t}</span></div>
                    : <div className={"offer-bubble" + (e.type === 'counter' ? ' counter' : e.type === 'accept' ? ' accept' : '')}>
                        <div className="ob-kind">{e.me ? 'You' : p.owner.name} · {e.type === 'counter' ? 'Counter-offer' : e.type === 'accept' ? 'Accepted' : 'Offer'}</div>
                        {e.amount ? <div className="ob-amt">{money(e.amount)}</div> : null}
                        <div className="ob-text">{e.text}</div>
                        <span className="ob-time">{e.t}</span>
                      </div>}
                </div>
              ))}
            </div>

            {status === 'Accepted' ? (
              <div className="trust-callout" style={{ marginTop: 16 }}><Icon name="check" style={{ color: 'var(--success)' }} /><p><b>Offer accepted.</b> Move the transaction into escrow to secure your deposit and begin title verification.</p></div>
            ) : status === 'Countered' ? (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--ink-100)' }}>
                <div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-800)', marginBottom: 10 }}>Respond to the counter of {money(o0.counter)}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-primary" onClick={acceptCounter}><Icon name="check" />Accept {moneyShort(o0.counter)}</button>
                  <div className="input-group" style={{ flex: 1, minWidth: 200 }}><span className="prefix">₦</span><input className="input" placeholder="Counter amount" value={counter} onChange={e => setCounter(e.target.value)} /></div>
                  <button className="btn btn-secondary" onClick={sendCounter}><Icon name="handshake" />Send counter</button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--ink-100)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <div className="input-group" style={{ flex: 1, minWidth: 200 }}><span className="prefix">₦</span><input className="input" placeholder="Revise your offer" value={counter} onChange={e => setCounter(e.target.value)} /></div>
                <button className="btn btn-primary" onClick={sendCounter}><Icon name="send" />Update offer</button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Offer summary</h3>
            {[['Asking price', money(p.price)], ['Your offer', money(o0.amount)], ['Financing', o0.financing], ['Submitted', o0.when]].map(r => (
              <div key={r[0]} className="settings-row" style={{ padding: '11px 0' }}><span style={{ font: 'var(--text-sm)', color: 'var(--ink-500)' }}>{r[0]}</span><span style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)', fontFamily: /price|offer/i.test(r[0]) ? 'var(--font-mono)' : 'inherit' }}>{r[1]}</span></div>
            ))}
            {status === 'Accepted'
              ? <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={() => ctx.go('transactions')}><Icon name="lock" />Proceed to escrow</button>
              : <button className="btn btn-secondary btn-block" style={{ marginTop: 14 }} onClick={() => ctx.go('details', p.id)}>View property</button>}
          </div>
          <div className="card card-pad">
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Seller</h3>
            <div className="avatar-block" style={{ marginBottom: 14 }}><Avatar name={p.owner.name} /><div className="avatar-meta"><span className="avatar-name">{p.owner.name}</span><span className="avatar-role">Verified seller</span></div></div>
            <TrustRing val={p.owner.trust} size={48} label="Trust score" tier={p.owner.trust >= 85 ? 'Excellent' : 'Good'} />
            <button className="btn btn-secondary btn-block" style={{ marginTop: 16 }} onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Message seller</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Saved, Compare, Watchlist, Viewings, Offers, OfferDetail });
