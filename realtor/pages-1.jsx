/* Ilé Realtor — Dashboard, Listings, Listing detail */

function RealtorDashboard({ ctx }) {
  const released = window.RT.deals.filter(d => d.escrow === 'released').reduce((s, d) => s + window.RT.commission(d), 0);
  const pipelineComm = window.RT.deals.filter(d => d.escrow !== 'released').reduce((s, d) => s + window.RT.commission(d), 0);
  const activeListings = window.RT.listings.filter(l => l.status === 'Active' || l.status === 'Under Offer').length;
  const openLeads = window.RT.leads.filter(l => l.stage !== 'Closed').length;
  const liveDeals = window.RT.deals.filter(d => d.stage !== 'Completed').length;
  const hotLeads = window.RT.leads.filter(l => l.hot && l.stage !== 'Closed');

  return (
    <div className="page">
      <PageHeader title="Welcome back, Ngozi" sub="Your brokerage at a glance — listings, pipeline and commission, all escrow-protected." />

      <div className="grid cols-4" style={{ marginBottom: 22 }}>
        <Stat icon="building" tone="info" label="Listings" value={activeListings} foot={<span className="link" onClick={() => ctx.go('listings')}>Manage listings →</span>} />
        <Stat icon="users" tone="gold" label="Open leads" value={openLeads} foot={<span className="stat-delta up"><Icon name="trend" />{hotLeads.length} hot this week</span>} />
        <Stat icon="handshake" tone="escrow" label="Live deals" value={liveDeals} foot={<span className="link" onClick={() => ctx.go('deals')}>Track deals →</span>} />
        <Stat icon="wallet" tone="green" label="Commission" value={moneyShort(released)} money foot={<span className="stat-delta up"><Icon name="trend" />+38% vs last yr</span>} />
      </div>

      <div className="dash-grid">
        <div>
          <div className="comm-banner" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="lbl">Commission released to you</div>
                <div className="amt">{money(released)}</div>
                <div className="pill-row">
                  <span className="cpill"><Icon name="lock" />{money(pipelineComm)} in escrow pipeline</span>
                  <span className="cpill"><Icon name="shieldCheck" />Escrow-protected</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="lbl">This month</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 700, marginTop: 4 }}>₦8.3M</div>
                <div style={{ font: 'var(--text-caption)', color: 'rgba(255,255,255,.78)', marginTop: 2 }}>3 deals closing</div>
              </div>
            </div>
          </div>

          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div className="section-head"><h3>Hot leads</h3><span className="link" onClick={() => ctx.go('leads')}>Full pipeline<Icon name="chevronRight" /></span></div>
            {hotLeads.map(l => {
              const p = window.RT.findListing(l.listingId);
              return (
                <div key={l.id} className="msg-row" onClick={() => ctx.go('leadDetail', l.id)}>
                  <Avatar name={l.name} />
                  <div className="msg-meta"><div className="msg-name">{l.name} · <span style={{ color: 'var(--ink-500)', fontWeight: 400 }}>{l.intent}</span></div><div className="msg-snip">{l.last} · {p.area}</div></div>
                  <div style={{ textAlign: 'right' }}><Chip kind={l.stage === 'Offer' ? 'progress' : 'due'}>{l.stage}</Chip><div className="msg-time" style={{ marginTop: 4 }}>{l.when}</div></div>
                </div>
              );
            })}
          </div>

          <div className="card card-pad">
            <div className="section-head"><h3>Recent activity</h3></div>
            <div className="feed">
              {window.RT.activity.map((a, i) => (
                <div key={i} className="feed-item">
                  <div className="feed-ic" style={{ background: a[1] === 'green' ? 'var(--green-50)' : a[1] === 'gold' ? 'var(--gold-100)' : a[1] === 'warn' ? 'var(--warning-bg)' : 'var(--info-bg)', color: a[1] === 'green' ? 'var(--primary)' : a[1] === 'gold' ? 'var(--gold-600)' : a[1] === 'warn' ? 'var(--warning-text)' : 'var(--info-text)' }}><Icon name={a[0]} /></div>
                  <div className="feed-txt"><div className="t"><b>{a[2]}</b></div><div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>{a[3]}</div><div className="time">{a[4]}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Commission trend</h3></div>
            <BarChart data={window.RT.earnings} fmt={v => '₦' + v + 'M'} />
          </div>

          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Today's viewings</h3><span className="link" onClick={() => ctx.go('viewings')}>All<Icon name="chevronRight" /></span></div>
            {window.RT.viewings.filter(v => v.date.includes('31 May')).map(v => {
              const p = window.RT.findListing(v.listingId);
              const lead = window.RT.findLead(v.leadId);
              return (
                <div key={v.id} className="msg-row" onClick={() => ctx.go('viewings')}>
                  <div className="feed-ic" style={{ background: 'var(--info-bg)', color: 'var(--info-text)' }}><Icon name="calendar" /></div>
                  <div className="msg-meta"><div className="msg-name">{lead.name}</div><div className="msg-snip">{p.area} · {v.time}</div></div>
                  <Chip kind="paid">{v.status}</Chip>
                </div>
              );
            })}
          </div>

          <div className="card card-pad">
            <div className="section-head"><h3 style={{ fontSize: '1rem' }}>Top listings</h3><span className="link" onClick={() => ctx.go('listings')}>All<Icon name="chevronRight" /></span></div>
            {window.RT.listings.filter(l => l.views > 0).sort((a, b) => b.views - a.views).slice(0, 3).map(l => (
              <div key={l.id} className="msg-row" onClick={() => ctx.go('listingDetail', l.id)}>
                <div className="feed-ic" style={{ background: 'var(--ink-100)', color: 'var(--ink-500)' }}><Icon name="building" /></div>
                <div className="msg-meta"><div className="msg-name">{l.area} · {l.type}</div><div className="msg-snip"><Icon name="eye" style={{ width: 12, height: 12, verticalAlign: '-2px' }} /> {l.views.toLocaleString()} · {l.enquiries} enquiries</div></div>
                <span className="money" style={{ fontWeight: 700, fontSize: '.82rem' }}>{moneyShort(l.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Listings ---------------- */
function Listings({ ctx }) {
  const [tab, setTab] = useState('All');
  const [view, setView] = useState('grid');
  const [adding, setAdding] = useState(false);
  const [, setTick] = useState(0);
  const tabs = ['All', 'Active', 'Under Offer', 'Sold', 'Draft'];
  const list = window.RT.listings.filter(l => tab === 'All' || l.status === tab);

  function addListing(listing) {
    window.RT.listings.unshift(listing);
    setAdding(false);
    ctx.toast('Saved to Drafts — publish when ready');
    ctx.go('listingDetail', listing.id);
  }

  return (
    <div className="page">
      <PageHeader title="Listings" sub="Manage your inventory — track views, enquiries and status." actions={<button className="btn btn-primary" onClick={() => ctx.requireVerified(() => setAdding(true))}><Icon name="plus" />Add listing</button>} />

      {adding && <AddListingModal onClose={() => setAdding(false)} onAdd={addListing} />}

      <div className="results-bar" style={{ marginBottom: 18 }}>
        <div className="filterbar" style={{ marginBottom: 0, border: 'none', padding: 0, background: 'none' }}>
          {tabs.map(t => <button key={t} className={"toggle-pill" + (tab === t ? ' on' : '')} onClick={() => setTab(t)} style={{ padding: '8px 14px' }}>{t}<span style={{ marginLeft: 6, opacity: .6, fontFamily: 'var(--font-mono)' }}>{t === 'All' ? window.RT.listings.length : window.RT.listings.filter(l => l.status === t).length}</span></button>)}
        </div>
        <div className="view-toggle">
          <button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}><Icon name="grid" /></button>
          <button className={view === 'list' ? 'on' : ''} onClick={() => setView('list')}><Icon name="list" /></button>
        </div>
      </div>

      {!list.length ? (
        <div className="card"><EmptyState icon="building" title={"No " + tab.toLowerCase() + " listings"} desc="Listings you add or that match this status will show here." actions={<button className="btn btn-primary btn-sm" onClick={() => setTab('All')}>View all</button>} /></div>
      ) : view === 'grid' ? (
        <div className="grid cols-3">{list.map(l => <ListingCard key={l.id} l={l} onOpen={id => ctx.go('listingDetail', id)} />)}</div>
      ) : (
        <div className="table-wrap">
          <table className="dtable">
            <thead><tr><th>Property</th><th>Type</th><th className="money">Price</th><th>Views</th><th>Enquiries</th><th>Status</th></tr></thead>
            <tbody>
              {list.map(l => (
                <tr key={l.id} onClick={() => ctx.go('listingDetail', l.id)} style={{ cursor: 'pointer' }}>
                  <td data-label="Property"><div style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{l.title}</div><div className="msg-snip">{l.area}, {l.city}</div></td>
                  <td data-label="Type">{l.deal}</td>
                  <td data-label="Price" className="money" style={{ fontWeight: 600 }}>{moneyShort(l.price)}</td>
                  <td data-label="Views">{l.views.toLocaleString()}</td>
                  <td data-label="Enquiries">{l.enquiries}</td>
                  <td data-label="Status">{statusChip(l.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- Listing detail ---------------- */
function ListingDetail({ ctx, id }) {
  const l = window.RT.findListing(id) || window.RT.listings[0];
  const relatedLeads = window.RT.leads.filter(x => x.listingId === l.id);
  const conversion = l.views ? ((l.enquiries / l.views) * 100).toFixed(1) : '0';
  const [editing, setEditing] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [, setTick] = useState(0);

  function saveEdit(updated) {
    Object.assign(l, updated);
    setEditing(false);
    setTick(t => t + 1);
    ctx.toast('Listing updated');
  }

  function publish() {
    Object.assign(l, { status: 'Active', listed: 'Just now' });
    setTick(t => t + 1);
    ctx.toast('Listing published — now visible to buyers');
  }

  const photos = l.photos || [];
  const isDraft = l.status === 'Draft';

  return (
    <div className="page">
      <span className="link" style={{ marginBottom: 14 }} onClick={() => ctx.go('listings')}><Icon name="arrowLeft" />Back to listings</span>
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
            <div className="ph" style={photos[0] ? { backgroundImage: 'url(' + photos[0] + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : null}>{!photos[0] && <span>{l.type} — main photo</span>}</div>
            <div className="col2">
              <div className="ph" style={photos[1] ? { backgroundImage: 'url(' + photos[1] + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : null}>{!photos[1] && <span>interior</span>}</div>
              <div className="ph" style={photos[2] ? { backgroundImage: 'url(' + photos[2] + ')', backgroundSize: 'cover', backgroundPosition: 'center' } : null}>{!photos[2] && <span>grounds</span>}{photos.length > 3 && <div className="more">+{photos.length - 3} photos</div>}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 20, gap: 16 }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>{statusChip(l.status)}<span className="chip chip--draft">{l.deal}</span>{l.verified && <Vbadge state="verified" sm />}</div>
              <h1 className="page-title" style={{ fontSize: '1.5rem' }}>{l.title}</h1>
              <div className="pcard-loc" style={{ marginTop: 4 }}><Icon name="mapPin" />{l.area}, {l.city}</div>
            </div>
            <div style={{ textAlign: 'right' }}><div className="money" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink-900)' }}>{moneyShort(l.price)}</div><div style={{ font: 'var(--text-caption)', color: 'var(--ink-500)' }}>{l.deal === 'For Rent' ? 'per year' : 'asking price'}</div></div>
          </div>

          <div className="pd-specs">
            <div className="pd-spec"><Icon name="bed" /><div className="v">{l.beds}</div><div className="k">Bedrooms</div></div>
            <div className="pd-spec"><Icon name="bath" /><div className="v">{l.baths}</div><div className="k">Bathrooms</div></div>
            <div className="pd-spec"><Icon name="ruler" /><div className="v">{l.sqm}m²</div><div className="k">Floor area</div></div>
            <div className="pd-spec"><Icon name="calendar" /><div className="v" style={{ fontSize: '.9rem' }}>{l.listed}</div><div className="k">Listed</div></div>
          </div>

          <h3 className="section-head" style={{ display: 'block', marginTop: 8 }}>Interested leads ({relatedLeads.length})</h3>
          {relatedLeads.length ? relatedLeads.map(le => (
            <div key={le.id} className="msg-row" onClick={() => ctx.go('leadDetail', le.id)}>
              <Avatar name={le.name} />
              <div className="msg-meta"><div className="msg-name">{le.name}</div><div className="msg-snip">{le.last}</div></div>
              <Chip kind={le.stage === 'Offer' ? 'progress' : le.stage === 'Closed' ? 'paid' : 'due'}>{le.stage}</Chip>
            </div>
          )) : <p style={{ font: 'var(--text-sm)', color: 'var(--ink-500)' }}>No leads yet on this listing.</p>}
        </div>

        <div>
          <div className="pd-action-card" style={{ marginBottom: 20 }}>
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Performance</h3>
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', marginBottom: 16 }}>
              <div className="donut" style={{ '--val': Math.min(100, conversion * 8), '--color': 'var(--primary)', width: 100, height: 100 }}><div className="inner" style={{ width: 72, height: 72 }}><div><b style={{ fontSize: '1.1rem' }}>{conversion}%</b><span style={{ display: 'block' }}>enquiry rate</span></div></div></div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--text-sm)', padding: '5px 0' }}><span style={{ color: 'var(--ink-500)' }}>Views</span><b style={{ fontFamily: 'var(--font-mono)' }}>{l.views.toLocaleString()}</b></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--text-sm)', padding: '5px 0' }}><span style={{ color: 'var(--ink-500)' }}>Enquiries</span><b style={{ fontFamily: 'var(--font-mono)' }}>{l.enquiries}</b></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--text-sm)', padding: '5px 0' }}><span style={{ color: 'var(--ink-500)' }}>Leads</span><b style={{ fontFamily: 'var(--font-mono)' }}>{relatedLeads.length}</b></div>
              </div>
            </div>
            {isDraft && <button className="btn btn-primary btn-block" onClick={() => ctx.requireVerified(publish)}><Icon name="check" />Publish listing</button>}
            <button className={"btn btn-block" + (isDraft ? " btn-secondary" : " btn-primary")} style={isDraft ? { marginTop: 10 } : null} onClick={() => ctx.toast('Listing promoted')}><Icon name="trend" />Boost this listing</button>
            <button className="btn btn-secondary btn-block" style={{ marginTop: 10 }} onClick={() => setEditing(true)}><Icon name="edit" />Edit listing</button>
            <button className="btn btn-ghost btn-block" style={{ marginTop: 10, border: '1px solid var(--ink-200)' }} onClick={() => ctx.requireVerified(() => setAssigning(true))}><Icon name="clipboard" />Assign field task</button>
            <button className="btn btn-ghost btn-block" style={{ marginTop: 10, border: '1px solid var(--ink-200)' }} onClick={() => ctx.toast('Share link copied')}><Icon name="copy" />Copy share link</button>
          </div>
          <div className="card card-pad">
            <h3 className="section-head" style={{ display: 'block', fontSize: '1rem' }}>Owner</h3>
            <div className="avatar-block"><Avatar name={l.owner} /><div className="avatar-meta"><span className="avatar-name">{l.owner}</span><span className="avatar-role">Property owner</span></div></div>
            <button className="btn btn-secondary btn-block" style={{ marginTop: 14 }} onClick={() => ctx.requireVerified(() => ctx.go('messages'))}><Icon name="message" />Message owner</button>
          </div>
        </div>
      </div>
      {editing && <AddListingModal edit={l} onClose={() => setEditing(false)} onSave={saveEdit} />}
      {assigning && <AssignTaskModal listingId={l.id} onClose={() => setAssigning(false)} onAdd={() => { setAssigning(false); ctx.toast('Field task assigned to ' + window.RT.fieldAgent.name); }} />}
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

/* ---------------- Add / Edit Listing modal ---------------- */
function AddListingModal({ onClose, onAdd, onSave, edit }) {
  const [f, setF] = useState(edit
    ? { ...edit, price: String(edit.price), photos: edit.photos || [] }
    : { title: '', type: 'Apartment', deal: 'For Sale', area: '', city: 'Lagos', price: '', beds: 3, baths: 2, photos: [] });
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
      id: 'rl' + Date.now(), title: f.title.trim(), type: f.type, deal: f.deal,
      area: f.area.trim(), city: f.city, price: priceNum, beds: Number(f.beds), baths: Number(f.baths),
      sqm: 0, verified: false, status: 'Draft', image: f.type + ' · ' + f.area.trim(),
      photos: f.photos, views: 0, enquiries: 0, listed: 'Just now', owner: 'Ngozi Eze'
    });
  }

  return (
    <div className="modal-scrim" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div><div className="modal-title">{edit ? 'Edit listing' : 'Add a listing'}</div><div className="modal-sub">{edit ? 'Update the details for this property.' : 'New listings start as a draft you can publish later.'}</div></div>
          <button className="modal-x" onClick={onClose}><Icon name="x" /></button>
        </div>
        <div className="modal-body">
          <Field label="Title" req><input className="input" value={f.title} onChange={e => set('title', e.target.value)} placeholder="e.g. 4-Bedroom Detached Duplex" autoFocus /></Field>
          <div className="grid cols-2">
            <Field label="Type"><select className="select" value={f.type} onChange={e => set('type', e.target.value)}>{['Apartment', 'Flat', 'Detached Duplex', 'Terrace', 'Villa', 'Bungalow', 'Land'].map(t => <option key={t}>{t}</option>)}</select></Field>
            <Field label="Listing type"><select className="select" value={f.deal} onChange={e => set('deal', e.target.value)}><option>For Sale</option><option>For Rent</option></select></Field>
            <Field label="Area" req><input className="input" value={f.area} onChange={e => set('area', e.target.value)} placeholder="e.g. Lekki Phase 1" /></Field>
            <Field label="City"><select className="select" value={f.city} onChange={e => set('city', e.target.value)}><option>Lagos</option><option>Abuja</option><option>Port Harcourt</option></select></Field>
            <Field label="Bedrooms"><select className="select" value={f.beds} onChange={e => set('beds', e.target.value)}>{[0, 1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}</select></Field>
            <Field label="Bathrooms"><select className="select" value={f.baths} onChange={e => set('baths', e.target.value)}>{[0, 1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}</select></Field>
          </div>
          <Field label={f.deal === 'For Rent' ? 'Annual rent' : 'Price'} req><div className="input-group"><span className="prefix">₦</span><input className="input" inputMode="numeric" value={f.price} onChange={e => set('price', e.target.value.replace(/[^\d]/g, ''))} placeholder="0" /></div></Field>
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

Object.assign(window, { RealtorDashboard, Listings, ListingDetail, AddListingModal, PhotoUploader });
