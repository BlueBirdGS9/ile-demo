/* Ilé Landlord — Invite offers: open a property to proposals and let verified
   agencies compete. Agencies can only see properties the owner has opened. */

function OfferCard({ offer, onAccept, onDecline }) {
  const resolved = offer.status !== 'pending';
  return (
    <div className={"offer-card" + (offer.status === 'accepted' ? ' is-accepted' : offer.status === 'declined' ? ' is-declined' : '')}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <TrustRing val={offer.trust} size={46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}><span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{offer.agencyName}</span><Vbadge state="verified" sm /></div>
            <div className="fee-big"><span className="fee-num" style={{ fontSize: '1.2rem' }}>{offer.feePct}%</span><span className="fee-cap">fee</span></div>
          </div>
          <div className="msg-snip" style={{ marginTop: 2 }}>{offer.lead} · ★ {offer.rating.toFixed(1)} · {offer.services.length} services</div>
        </div>
      </div>
      <div className="chip-row" style={{ marginTop: 10 }}>{offer.services.map(s => <span key={s} className="spec-chip">{s}</span>)}</div>
      {offer.message && <p style={{ font: 'var(--text-sm)', color: 'var(--ink-700)', margin: '10px 0 0', lineHeight: 1.5 }}>“{offer.message}”</p>}
      {resolved ? (
        <div style={{ marginTop: 12 }}><span className={"chip chip--" + (offer.status === 'accepted' ? 'paid' : 'overdue')}><span className="dot"></span>{offer.status === 'accepted' ? 'Appointed' : 'Declined'}</span></div>
      ) : (
        <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--ink-200)' }} onClick={() => onDecline(offer)}><Icon name="x" />Decline</button>
          <button className="btn btn-primary btn-sm" onClick={() => onAccept(offer)}><Icon name="check" />Accept &amp; appoint</button>
        </div>
      )}
    </div>
  );
}

function InviteOffers({ ctx }) {
  const [m, setM] = useState(() => window.MGMT.load());
  const reload = () => setM(window.MGMT.load());

  const managedIds = (m.properties || []).map(p => p.id);
  const openIds = (m.openProperties || []).map(p => p.id);
  const candidates = window.LD.properties.filter(p => !managedIds.includes(p.id) && !openIds.includes(p.id));

  function openProp(p) {
    window.MGMT.update(mm => window.MGMT.openProperty(mm, { id: p.id, name: p.name, type: p.type, area: p.area, city: p.city, region: regionOf(p), units: p.units, occupied: p.occupied, rentPerUnit: p.rentPerUnit, ownerName: 'Chidi Nwosu', ownerTrust: 92, when: 'Just now' }));
    reload(); ctx.toast(p.name + ' opened to offers — verified agencies can now pitch');
  }
  function closeProp(p) { window.MGMT.update(mm => window.MGMT.closeProperty(mm, p.id)); reload(); ctx.toast(p.name + ' closed to offers'); }
  function declineOffer(o) { window.MGMT.update(mm => { const t = mm.offers.find(x => x.id === o.id); if (t) t.status = 'declined'; }); reload(); ctx.toast('Offer declined'); }
  function acceptOffer(o) {
    window.MGMT.update(mm => {
      mm.offers.forEach(x => { if (x.propId === o.propId) x.status = x.id === o.id ? 'accepted' : 'declined'; });
      const p = window.LD.properties.find(x => x.id === o.propId);
      const property = { id: p.id, name: p.name, type: p.type, area: p.area, city: p.city, units: p.units, rentPerUnit: p.rentPerUnit, roll: buildRoll(p) };
      window.MGMT.onboardProperty(mm, { property, agencyName: o.agencyName });
      mm.openProperties = mm.openProperties.filter(x => x.id !== o.propId);
    });
    reload(); ctx.toast(o.agencyName + ' appointed — ' + o.propName + ' is now managed');
  }

  return (
    <div>
      <div className="oversight-note" style={{ marginBottom: 18 }}><Icon name="shieldCheck" style={{ color: 'var(--success)' }} />Agencies only see properties you open here — never the rest of your portfolio. Close a listing any time to stop new offers.</div>

      {candidates.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <div className="section-head" style={{ marginBottom: 12 }}><h3 style={{ fontSize: '1rem' }}>Open a property to offers</h3></div>
          <div className="grid" style={{ gap: 10 }}>
            {candidates.map(p => (
              <div key={p.id} className="managed-prop" style={{ cursor: 'default' }}>
                <div className="mp-thumb"><Icon name="building" /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{p.name}</div>
                  <div className="msg-snip" style={{ marginTop: 2 }}>{p.area}, {p.city} · {p.units} units · {p.occupied}/{p.units} let</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => openProp(p)}><Icon name="send" />Open to offers</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {m.openProperties.length === 0 ? (
        <div className="card"><EmptyState icon="inbox" title="No properties open to offers" desc="Open a property above to let verified agencies pitch to manage it — then compare their fees and services side by side." /></div>
      ) : (
        m.openProperties.map(op => {
          const offers = m.offers.filter(o => o.propId === op.id);
          const pending = offers.filter(o => o.status === 'pending');
          return (
            <div key={op.id} style={{ marginBottom: 26 }}>
              <div className="open-head">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}><span style={{ font: 'var(--text-h4)', color: 'var(--ink-900)' }}>{op.name}</span><span className="chip chip--progress"><span className="dot"></span>Receiving offers</span></div>
                  <div className="msg-snip" style={{ marginTop: 2 }}>{op.area}, {op.city} · {op.units} units · opened {op.when} · {pending.length} offer{pending.length === 1 ? '' : 's'} to compare</div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--ink-200)' }} onClick={() => closeProp(op)}>Close listing</button>
              </div>
              {offers.length === 0 ? (
                <div className="oversight-note" style={{ marginTop: 12 }}><Icon name="clock" style={{ color: 'var(--ink-400)' }} />No offers yet — verified agencies covering {op.region} will see this and pitch.</div>
              ) : (
                <div className="grid cols-2" style={{ marginTop: 12 }}>
                  {offers.sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1) || a.feePct - b.feePct).map(o => <OfferCard key={o.id} offer={o} onAccept={acceptOffer} onDecline={declineOffer} />)}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

Object.assign(window, { InviteOffers, OfferCard });
