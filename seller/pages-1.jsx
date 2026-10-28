/* Ilé Seller — Dashboard, My Properties, Property detail */

function SellDashboard({ ctx }) {
  const tx = window.SD.transactions[0];
  const txProp = window.SD.find(tx.listingId);
  const steps = window.SD.escrowMilestones;
  const newOffers = window.SD.offers.filter(o => o.status === 'New');
  const liveListings = window.SD.listings.filter(l => l.status !== 'Draft' && l.status !== 'Sold');
  const totalViews = window.SD.listings.reduce((s, l) => s + l.views, 0);
  const netProceeds = tx.amount - tx.fee;

  return (
    <div className="page">
      <PageHeader title="Welcome back, Yewande" sub="Your sales at a glance — every transaction protected by escrow until ownership transfers." />

      <div className="grid cols-4" style={{ marginBottom: 22 }}>
        <Stat icon="layers" tone="escrow" label="Active sale" value="In escrow" foot={<span className="stat-delta">{txProp.area} · {moneyShort(tx.amount)}</span>} />
        <Stat icon="handshake" tone="gold" label="New offers" value={newOffers.length} foot={<span className="link" onClick={() => ctx.go('offers')}>Review offers →</span>} />
        <Stat icon="building" tone="green" label="Listed" value={liveListings.length} foot={<span className="link" onClick={() => ctx.go('properties')}>My properties →</span>} />
        <Stat icon="eye" tone="info" label="Total views" value={totalViews.toLocaleString()} foot={<span className="stat-delta up"><Icon name="trend" />+18% this week</span>} />
      </div>

      <div className="dash-grid">
        <div>
          <div className="proceeds-banner" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="lbl">Net proceeds on completion</div>
                <div className="amt">{money(netProceeds)}</div>
                <div className="cpill"><Icon name="lock" />{money(tx.held)} buyer deposit secured</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="lbl">Sale price</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>{moneyShort(tx.amount)}</div>
                <div style={{ font: 'var(--text-caption)', color: 'rgba(255,255,255,.78)', marginTop: 2 }}>minus {money(tx.fee)} fee</div>
              </div>
            </div>
          </div>

          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div className="section-head"><h3>Sale progress</h3><span className="link" onClick={() => ctx.go('transactionDetail', tx.id)}>Open transaction<Icon name="chevronRight" /></span></div>
            <Milestones steps={steps} />
          </div>

          <div className="card card-pad">
            <div className="section-head"><h3>Recent offers</h3><span className="link" onClick={() => ctx.go('offers')}>All offers<Icon name="chevronRight" /></span></div>
            {window.SD.offers.map(o => {
              const p = window.SD.find(o.listingId);
              return (
                <div key={o.id} className="msg-row" onClick={() => ctx.go('offer', o.id)}>
                  <Avatar name={o.buyer} />
                  <div className="msg-meta"><div className="msg-name">{o.buyer} · <span style={{ color: 'var(--ink-500)', fontWeight: 400 }}>{p.area}</span></div><div className="msg-snip">{money(o.amount)} · {o.financing}</div></div>
                  {offerChip(o.status)}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Listing performance</h3><span className="link" onClick={() => ctx.go('properties')}>All<Icon name="chevronRight" /></span></div>
            {liveListings.map(l => (
              <div key={l.id} className="msg-row" onClick={() => ctx.go('propertyDetail', l.id)}>
                <div className="feed-ic" style={{ background: 'var(--ink-100)', color: 'var(--ink-500)' }}><Icon name="building" /></div>
                <div className="msg-meta"><div className="msg-name">{l.area} · {l.type}</div><div className="msg-snip"><Icon name="eye" style={{ width: 12, height: 12, verticalAlign: '-2px' }} /> {l.views.toLocaleString()} · {l.enquiries} enquiries</div></div>
                {statusChip(l.status)}
              </div>
            ))}
          </div>

          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Pricing health</h3></div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div className="donut" style={{ '--val': 92, '--color': 'var(--primary)', width: 92, height: 92 }}><div className="inner" style={{ width: 66, height: 66 }}><div><b style={{ fontSize: '1rem' }}>92</b><span style={{ display: 'block' }}>at market</span></div></div></div>
              <div style={{ flex: 1, font: 'var(--text-sm)', color: 'var(--ink-600)' }}>Your listings are priced close to recent verified sales in their areas. <span className="link" onClick={() => ctx.go('valuation')}>Open valuation →</span></div>
            </div>
          </div>

          <div className="card card-pad" style={{ background: 'var(--surface-sunken)', boxShadow: 'none' }}>
            <div className="chip chip--escrow" style={{ marginBottom: 12 }}><span className="dot"></span>Sell with confidence</div>
            <p style={{ font: 'var(--text-sm)', color: 'var(--ink-700)', margin: '0 0 14px', lineHeight: 1.5 }}>Buyers' funds are held in Ilé Escrow and released to you only once the title is verified and ownership transfers — no chasing payment.</p>
            <button className="btn btn-secondary btn-block" onClick={() => ctx.go('valuation')}><Icon name="gauge" />Value a property</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- My Properties ---------------- */
function MyProperties({ ctx }) {
  const [tab, setTab] = useState('All');
  const [adding, setAdding] = useState(false);
  const tabs = ['All', 'Active', 'Under Offer', 'In Escrow', 'Draft'];
  const list = window.SD.listings.filter(l => tab === 'All' || l.status === tab);

  function addListing(listing) {
    window.SD.listings.unshift(listing);
    setAdding(false);
    ctx.toast('Saved to Drafts — publish when ready');
    ctx.go('propertyDetail', listing.id);
  }

  return (
    <div className="page">
      <PageHeader title="My properties" sub="Manage the homes you're selling — track interest and offers." actions={<button className="btn btn-primary" onClick={() => ctx.requireVerified(() => setAdding(true))}><Icon name="plus" />List a property</button>} />
      {adding && <ListingForm onClose={() => setAdding(false)} onAdd={addListing} />}
      <div className="filterbar" style={{ marginBottom: 18, border: 'none', padding: 0, background: 'none' }}>
        {tabs.map(t => <button key={t} className={"toggle-pill" + (tab === t ? ' on' : '')} onClick={() => setTab(t)} style={{ padding: '8px 14px' }}>{t}<span style={{ marginLeft: 6, opacity: .6, fontFamily: 'var(--font-mono)' }}>{t === 'All' ? window.SD.listings.length : window.SD.listings.filter(l => l.status === t).length}</span></button>)}
      </div>
      {list.length ? (
        <div className="grid cols-3">{list.map(p => <SellCard key={p.id} p={p} onOpen={id => ctx.go('propertyDetail', id)} />)}</div>
      ) : (
        <div className="card"><EmptyState icon="building" title={"No " + tab.toLowerCase() + " properties"} desc="Properties with this status will show here." actions={<button className="btn btn-secondary btn-sm" onClick={() => setTab('All')}>View all</button>} /></div>
      )}
    </div>
  );
}

/* ---------------- Property detail ---------------- */
function PropertyDetail({ ctx, id }) {
  const p = window.SD.find(id) || window.SD.listings[0];
  const relatedOffers = window.SD.offers.filter(o => o.listingId === p.id);
  const conversion = p.views ? ((p.enquiries / p.views) * 100).toFixed(1) : '0';
  const [editing, setEditing] = useState(false);
  const [, setTick] = useState(0);
  const photos = p.photos || [];
  const isDraft = p.status === 'Draft';

  function saveEdit(updated) {
    Object.assign(p, updated);
    setEditing(false);
    setTick(t => t + 1);
    ctx.toast('Listing updated');
  }

  function publish() {
    Object.assign(p, { status: 'Active', listed: 'Just now' });
    setTick(t => t + 1);
    ctx.toast('Listing published — now visible to buyers');
  }

  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('properties')}><Icon name="arrowLeft" />Back to my properties</span>
      {isDraft && (
        <div className="draft-banner">
          <div className="db-ic"><Icon name="edit" /></div>
          <div className="db-txt">
            <div className="db-title">This listing is a draft</div>
            <div className="db-sub">It isn’t visible to buyers yet. {photos.length ? '' : 'Add photos and '}Publish when you’re ready to go live.</div>
          </div>
          <button className="btn btn-primary" onClick={() => ctx.requireVerified(publish)}><Icon name="check" />Publish listing</button>
        </div>
      )}
      <div className="pd-grid">
        <div>
          <div className="gallery">
            <div className="ph" style={photos[0] ? { backgroundImage: 'url(' + photos[0] + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : null}>{!photos[0] && <span>{p.type} — main photo</span>}</div>
            <div className="col2">
              <div className="ph" style={photos[1] ? { backgroundImage: 'url(' + photos[1] + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : null}>{!photos[1] && <span>interior</span>}</div>
              <div className="ph" style={photos[2] ? { backgroundImage: 'url(' + photos[2] + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : null}>{!photos[2] && <span>grounds</span>}{photos.length > 3 && <div className="more">+{photos.length - 3} photos</div>}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 20, gap: 16 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>{statusChip(p.status)}{p.verified ? <Vbadge state="verified" sm /> : <Vbadge state="pending" sm />}</div>
              <h1 className="page-title" style={{ fontSize: '1.5rem' }}>{p.title}</h1>
              <div className="pcard-loc" style={{ marginTop: 4 }}><Icon name="mapPin" />{p.area}, {p.city}</div>
            </div>
            <div style={{ textAlign: 'right' }}><div className="money" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink-900)' }}>{money(p.price)}</div><div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>asking · listed {p.listed}</div></div>
          </div>

          <div className="pd-specs">
            <div className="pd-spec"><Icon name="bed" /><div className="v">{p.beds}</div><div className="k">Bedrooms</div></div>
            <div className="pd-spec"><Icon name="bath" /><div className="v">{p.baths}</div><div className="k">Bathrooms</div></div>
            <div className="pd-spec"><Icon name="ruler" /><div className="v">{p.sqm}m²</div><div className="k">Floor area</div></div>
            <div className="pd-spec"><Icon name="shieldCheck" /><div className="v" style={{ fontSize: '.9rem' }}>{p.title_doc}</div><div className="k">Title</div></div>
          </div>

          <h3 className="section-head" style={{ display: 'block', marginTop: 8 }}>Description</h3>
          <p style={{ font: 'var(--text-body)', color: 'var(--ink-600)', marginTop: 0 }}>{p.desc}</p>

          <h3 className="section-head" style={{ display: 'block', marginTop: 24 }}>Offers on this property ({relatedOffers.length})</h3>
          {relatedOffers.length ? relatedOffers.map(o => (
            <div key={o.id} className="msg-row" onClick={() => ctx.go('offer', o.id)}>
              <Avatar name={o.buyer} />
              <div className="msg-meta"><div className="msg-name">{o.buyer}</div><div className="msg-snip">{money(o.amount)} · {o.financing}</div></div>
              {offerChip(o.status)}
            </div>
          )) : <p style={{ font: 'var(--text-sm)', color: 'var(--ink-500)' }}>No offers yet on this property.</p>}
        </div>

        <div>
          <div className="pd-action-card" style={{ marginBottom: 20 }}>
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Performance</h3>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 16 }}>
              <div className="donut" style={{ '--val': Math.min(100, conversion * 8), '--color': 'var(--primary)', width: 100, height: 100 }}><div className="inner" style={{ width: 72, height: 72 }}><div><b style={{ fontSize: '1.1rem' }}>{conversion}%</b><span style={{ display: 'block' }}>enquiry rate</span></div></div></div>
              <div style={{ flex: 1 }}>
                {[['Views', p.views.toLocaleString()], ['Saves', p.saves], ['Enquiries', p.enquiries], ['Offers', relatedOffers.length]].map(r => (
                  <div key={r[0]} style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--text-sm)', padding: '5px 0' }}><span style={{ color: 'var(--ink-500)' }}>{r[0]}</span><b style={{ fontFamily: 'var(--font-mono)' }}>{r[1]}</b></div>
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-block" onClick={() => ctx.toast('Listing boosted')}><Icon name="trend" />Boost listing</button>
            <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={() => ctx.go('valuation')}><Icon name="gauge" />Check valuation</button>
            {isDraft
              ? <button className="btn btn-primary btn-block" style={{ marginTop: 10 }} onClick={() => ctx.requireVerified(publish)}><Icon name="check" />Publish listing</button>
              : null}
            <button className="btn btn-ghost btn-block" style={{ marginTop: 10, border: '1px solid var(--ink-200)' }} onClick={() => setEditing(true)}><Icon name="edit" />Edit listing</button>
          </div>
          <div className="card card-pad">
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Features &amp; title</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{p.amenities.map(a => <div key={a} className="amenity"><Icon name="check" />{a}</div>)}</div>
          </div>
        </div>
      </div>
      {editing && <ListingForm edit={p} onClose={() => setEditing(false)} onSave={saveEdit} />}
    </div>
  );
}

/* ---------------- Photo uploader (real file read → data URLs) ---------------- */
function PhotoUploader({ photos, onChange }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  function addFiles(files) {
    const imgs = [...files].filter(f => f.type.startsWith('image/'));
    if (!imgs.length) return;
    Promise.all(imgs.map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = e => res(e.target.result);
      r.readAsDataURL(f);
    }))).then(urls => onChange([...photos, ...urls]));
  }
  return (
    <div>
      <div className="photo-grid">
        {photos.map((src, i) => (
          <div key={i} className="photo-thumb" style={{ backgroundImage: 'url(' + src + ')' }}>
            {i === 0 && <span className="photo-cover">Cover</span>}
            <button type="button" className="photo-del" title="Remove photo" onClick={() => onChange(photos.filter((_, j) => j !== i))}><Icon name="x" /></button>
          </div>
        ))}
        <button type="button" className={"photo-add" + (drag ? ' drag' : '')} onClick={() => inputRef.current.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}>
          <Icon name="camera" /><span>{photos.length ? 'Add more' : 'Add photos'}</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

/* ---------------- List / Edit a property for sale ---------------- */
function ListingForm({ onClose, onAdd, onSave, edit }) {
  const [f, setF] = useState(edit
    ? { ...edit, price: String(edit.price), photos: edit.photos || [] }
    : { title: '', type: 'Detached Duplex', area: '', city: 'Lagos', price: '', beds: 3, baths: 2, title_doc: 'C of O', desc: '', photos: [] });
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));
  const priceNum = Number(String(f.price).replace(/[^\d]/g, '')) || 0;
  const valid = f.title.trim() && f.area.trim() && priceNum > 0;

  function submit() {
    if (!valid) return;
    if (edit) {
      onSave({ ...edit, ...f, price: priceNum, beds: Number(f.beds), baths: Number(f.baths), photos: f.photos });
      return;
    }
    onAdd({
      id: 'sl' + Date.now(), title: f.title.trim(), type: f.type, area: f.area.trim(), city: f.city,
      price: priceNum, beds: Number(f.beds), baths: Number(f.baths), sqm: 0,
      verified: false, status: 'Draft', image: f.type + ' · ' + f.area.trim(),
      photos: f.photos, views: 0, saves: 0, enquiries: 0, listed: 'Just now',
      title_doc: f.title_doc, amenities: [f.title_doc], desc: f.desc.trim() || 'No description added yet.'
    });
  }

  return (
    <div className="modal-scrim" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div><div className="modal-title">{edit ? 'Edit listing' : 'List a property'}</div><div className="modal-sub">{edit ? 'Update the details for this property.' : 'New listings start as a draft you can publish later.'}</div></div>
          <button className="modal-x" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <Field label="Title" req><input className="input" value={f.title} onChange={e => set('title', e.target.value)} placeholder="e.g. 4-Bedroom Detached Duplex" autoFocus /></Field>
          <div className="grid cols-2">
            <Field label="Type"><select className="select" value={f.type} onChange={e => set('type', e.target.value)}>{['Detached Duplex', 'Semi-Detached', 'Terrace', 'Apartment', 'Flat', 'Villa', 'Bungalow', 'Land'].map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Title document"><select className="select" value={f.title_doc} onChange={e => set('title_doc', e.target.value)}><option>C of O</option><option>Deed of Assignment</option><option>Survey Plan</option></select></Field>
            <Field label="Area" req><input className="input" value={f.area} onChange={e => set('area', e.target.value)} placeholder="e.g. Lekki Phase 1" /></Field>
            <Field label="City"><select className="select" value={f.city} onChange={e => set('city', e.target.value)}><option>Lagos</option><option>Abuja</option><option>Port Harcourt</option></select></Field>
            <Field label="Bedrooms"><select className="select" value={f.beds} onChange={e => set('beds', e.target.value)}>{[0, 1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}</select></Field>
            <Field label="Bathrooms"><select className="select" value={f.baths} onChange={e => set('baths', e.target.value)}>{[0, 1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}</select></Field>
          </div>
          <Field label="Asking price" req><div className="input-group"><span className="prefix">₦</span><input className="input" inputMode="numeric" value={f.price} onChange={e => set('price', e.target.value.replace(/[^\d]/g, ''))} placeholder="0" /></div></Field>
          <Field label="Description"><textarea className="input" rows="3" value={f.desc} onChange={e => set('desc', e.target.value)} placeholder="Highlight what makes this property stand out…" style={{ resize: 'vertical' }} /></Field>
          <Field label="Photos" hint="The first photo becomes the cover. Drag images in, or click to browse."><PhotoUploader photos={f.photos} onChange={ph => set('photos', ph)} /></Field>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}><Icon name={edit ? 'check' : 'plus'} />{edit ? 'Save changes' : 'Create listing'}</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SellDashboard, MyProperties, PropertyDetail, PhotoUploader, ListingForm });
