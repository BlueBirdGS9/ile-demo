/* Ilé Seller — Offers received + negotiation, Valuation */

function Offers({ ctx }) {
  return (
    <div className="page">
      <PageHeader title="Offers received" sub="Review, negotiate and accept offers from verified buyers — securely through escrow." />
      <div className="grid" style={{ gap: 12 }}>
        {window.SD.offers.map(o => {
          const p = window.SD.find(o.listingId);
          const pct = Math.round((o.amount / p.price) * 100);
          return (
            <div key={o.id} className="issue-card" onClick={() => ctx.go('offer', o.id)}>
              <Avatar name={o.buyer} size="lg" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{o.buyer}</div><span className="tag"><Icon name="shieldCheck" style={{ width: 13, height: 13, color: 'var(--success)' }} />Trust {o.buyerTrust}</span></div>
                  {offerChip(o.status)}
                </div>
                <div className="pcard-loc" style={{ marginTop: 3 }}><Icon name="building" style={{ width: 14, height: 14 }} />{p.title} · {p.area}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-400)', fontWeight: 700 }}>Offer</div>
                    <span className="money" style={{ fontWeight: 700, color: 'var(--ink-900)', fontSize: '1.1rem' }}>{money(o.amount)}</span>
                    <span style={{ font: 'var(--text-caption)', color: pct >= 97 ? 'var(--success)' : pct >= 92 ? 'var(--gold-600)' : 'var(--ink-500)', marginLeft: 8, fontWeight: 600 }}>{pct}% of ask</span>
                    {o.counter && <span style={{ font: 'var(--text-caption)', color: 'var(--gold-600)', marginLeft: 10 }}>↳ you countered {moneyShort(o.counter)}</span>}
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
  const o0 = window.SD.findOffer(id) || window.SD.offers[0];
  const p = window.SD.find(o0.listingId);
  const [thread, setThread] = useState(o0.thread.slice());
  const [status, setStatus] = useState(o0.status);
  const [counter, setCounter] = useState('');
  const bodyRef = useRef(null);
  const pct = Math.round((o0.amount / p.price) * 100);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [thread]);

  function accept() {
    setThread(t => [...t, { me: true, type: 'accept', text: 'Offer accepted. Let\u2019s proceed to escrow.', t: 'Now' }]);
    setStatus('Accepted'); ctx.toast('Offer accepted');
  }
  function sendCounter() {
    const amt = Number(String(counter).replace(/[^\d]/g, ''));
    if (!amt) return;
    setThread(t => [...t, { me: true, type: 'counter', amount: amt, text: 'Counter-offer.', t: 'Now' }]);
    setStatus('Countered'); setCounter(''); ctx.toast('Counter-offer sent');
  }
  function decline() {
    setThread(t => [...t, { me: true, type: 'msg', text: 'Thank you for your offer; we won\u2019t be proceeding at this level.', t: 'Now' }]);
    setStatus('Rejected'); ctx.toast('Offer declined');
  }

  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('offers')}><Icon name="arrowLeft" />All offers</span>
      <div className="pd-grid">
        <div>
          <div className="card card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div><h2 className="page-title" style={{ fontSize: '1.4rem' }}>Negotiation</h2><div className="page-sub">{p.title} · offer from {o0.buyer}</div></div>
              {offerChip(status)}
            </div>
            <hr className="divider" style={{ margin: '14px 0' }} />
            <div className="nego" ref={bodyRef} style={{ maxHeight: 440, overflowY: 'auto' }}>
              {thread.map((e, i) => (
                <div key={i} className={"nego-event " + (e.me ? 'me' : 'them')}>
                  {e.type === 'msg'
                    ? <div className="msg-bubble">{e.text}<span className="ob-time" style={{ display: 'block', marginTop: 4, opacity: .7 }}>{e.t}</span></div>
                    : <div className={"offer-bubble" + (e.type === 'counter' ? ' counter' : e.type === 'accept' ? ' accept' : '')}>
                        <div className="ob-kind">{e.me ? 'You' : o0.buyer} · {e.type === 'counter' ? 'Counter-offer' : e.type === 'accept' ? 'Accepted' : 'Offer'}</div>
                        {e.amount ? <div className="ob-amt">{money(e.amount)}</div> : null}
                        <div className="ob-text">{e.text}</div>
                        <span className="ob-time">{e.t}</span>
                      </div>}
                </div>
              ))}
            </div>

            {status === 'Accepted' ? (
              <div className="trust-callout" style={{ marginTop: 16 }}><Icon name="check" style={{ color: 'var(--success)' }} /><p><b>Offer accepted.</b> Move the sale into escrow to secure the buyer's deposit and begin title verification.</p></div>
            ) : status === 'Rejected' ? (
              <div className="trust-callout" style={{ marginTop: 16 }}><Icon name="info" style={{ color: 'var(--ink-500)' }} /><p>You declined this offer. The buyer has been notified.</p></div>
            ) : (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--ink-100)' }}>
                <div style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-800)', marginBottom: 10 }}>Respond to {o0.buyer}'s offer of {money(o0.amount)}</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                  <button className="btn btn-primary" onClick={() => ctx.requireVerified(accept)}><Icon name="check" />Accept {moneyShort(o0.amount)}</button>
                  <button className="btn btn-ghost" style={{ border: '1px solid var(--ink-200)', color: 'var(--error-text)' }} onClick={decline}><Icon name="x" />Decline</button>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <div className="input-group" style={{ flex: 1, minWidth: 200 }}><span className="prefix">₦</span><input className="input" placeholder="Counter amount" value={counter} onChange={e => setCounter(e.target.value)} /></div>
                  <button className="btn btn-secondary" onClick={() => ctx.requireVerified(sendCounter)}><Icon name="handshake" />Send counter</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Offer summary</h3>
            {[['Asking price', money(p.price)], ['Offer', money(o0.amount) + ' (' + pct + '%)'], ['Financing', o0.financing], ['Closing', o0.closing], ['Received', o0.when]].map(r => (
              <div key={r[0]} className="settings-row" style={{ padding: '11px 0' }}><span style={{ font: 'var(--text-sm)', color: 'var(--ink-500)' }}>{r[0]}</span><span style={{ font: 'var(--text-sm)', fontWeight: 600, color: 'var(--ink-900)', fontFamily: /price|offer/i.test(r[0]) ? 'var(--font-mono)' : 'inherit' }}>{r[1]}</span></div>
            ))}
            {status === 'Accepted'
              ? <button className="btn btn-primary btn-block" style={{ marginTop: 14 }} onClick={() => ctx.go('transactions')}><Icon name="lock" />Proceed to escrow</button>
              : <button className="btn btn-secondary btn-block" style={{ marginTop: 14 }} onClick={() => ctx.go('propertyDetail', p.id)}>View property</button>}
          </div>
          <div className="card card-pad">
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Buyer</h3>
            <div className="avatar-block" style={{ marginBottom: 14 }}><Avatar name={o0.buyer} /><div className="avatar-meta"><span className="avatar-name">{o0.buyer}</span><span className="avatar-role">Verified buyer</span></div></div>
            <TrustRing val={o0.buyerTrust} size={48} label="Trust score" tier={o0.buyerTrust >= 85 ? 'Excellent' : 'Good'} />
            <button className="btn btn-secondary btn-block" style={{ marginTop: 16 }} onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Message buyer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Valuation ---------------- */
function Valuation({ ctx }) {
  const [sel, setSel] = useState(window.SD.listings[0].id);
  const p = window.SD.find(sel);
  const comps = window.SD.comparables[sel] || [];
  const avgPsm = comps.length ? Math.round(comps.reduce((s, c) => s + c.sold / c.sqm, 0) / comps.length) : 0;
  const est = avgPsm * p.sqm;
  const low = Math.round(est * 0.94);
  const high = Math.round(est * 1.06);
  // where the seller's asking price sits in the range (clamped 0–100)
  const posRaw = (p.price - low) / (high - low) * 100;
  const pos = Math.max(4, Math.min(96, posRaw));
  const verdict = p.price > high ? ['above', 'var(--warning-text)', 'Your asking price is above recent comparable sales — expect longer time on market or room to negotiate down.']
    : p.price < low ? ['below', 'var(--info-text)', 'Your asking price is below recent comparable sales — you may have room to increase it.']
    : ['at', 'var(--success)', 'Your asking price is in line with recent verified sales in this area — well positioned to sell.'];

  return (
    <div className="page">
      <PageHeader title="Valuation" sub="See how your asking price compares to recent verified sales nearby." />
      <Field label="Select a property">
        <select className="select" style={{ maxWidth: 420 }} value={sel} onChange={e => setSel(e.target.value)}>
          {window.SD.listings.map(l => <option key={l.id} value={l.id}>{l.title} · {l.area}</option>)}
        </select>
      </Field>

      <div className="val-grid" style={{ marginTop: 8 }}>
        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div className="section-head"><h3>Comparable sales</h3><span className="msg-snip">{p.area} · verified</span></div>
            <div className="table-wrap">
              <table className="dtable">
                <thead><tr><th>Property</th><th>Size</th><th className="money">Sold for</th><th className="money">₦/m²</th><th>When</th></tr></thead>
                <tbody>
                  {comps.map((c, i) => (
                    <tr key={i}>
                      <td data-label="Property"><div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{c.addr}</div><div className="msg-snip">{c.type}</div></td>
                      <td data-label="Size">{c.sqm} m²</td>
                      <td data-label="Sold for" className="money" style={{ fontWeight: 600 }}>{moneyShort(c.sold)}</td>
                      <td data-label="₦/m²" className="money">{moneyShort(Math.round(c.sold / c.sqm))}</td>
                      <td data-label="When" className="msg-snip">{c.when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="comp-note"><Icon name="info" /><span>Estimate based on the average ₦/m² of {comps.length} recent verified sale{comps.length === 1 ? '' : 's'}, adjusted for your {p.sqm}m² floor area.</span></p>
          </div>

          <div className="card card-pad">
            <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Your listing</h3></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{p.title}</div>
                <div className="pcard-loc" style={{ marginTop: 3 }}><Icon name="mapPin" />{p.area}, {p.city} · {p.sqm}m²</div>
              </div>
              <div style={{ textAlign: 'right' }}><div style={{ font: 'var(--text-micro)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-400)', fontWeight: 700 }}>Your asking</div><div className="money" style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--ink-900)' }}>{money(p.price)}</div></div>
            </div>
          </div>
        </div>

        <div className="val-result">
          <div className="vr-lbl">Estimated market value</div>
          <div className="vr-range">{moneyShort(low)} – {moneyShort(high)}</div>
          <div className="vr-mid">Midpoint ≈ {money(est)}</div>
          <div className="val-meter">
            <div className="fill" style={{ width: '100%' }}></div>
            <div className="pin" style={{ left: pos + '%' }} title="Your asking price"></div>
          </div>
          <div className="val-scale"><span>{moneyShort(low)}</span><span>{moneyShort(high)}</span></div>
          <div className="val-verdict">
            <b style={{ textTransform: 'capitalize' }}>{verdict[0]} market.</b> {verdict[2]}
          </div>
          <button className="btn btn-gold btn-lg btn-block" style={{ marginTop: 22 }} onClick={() => ctx.toast('Professional valuation requested')}><Icon name="gauge" />Request pro valuation</button>
          <p style={{ font: 'var(--text-micro)', color: 'rgba(255,255,255,.65)', marginTop: 12, textAlign: 'center' }}>Estimate only, from comparable sales. A professional valuation gives a certified figure.</p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Offers, OfferDetail, Valuation });
