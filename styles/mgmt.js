/* Ilé — shared Management mandate store (Landlord owner <-> Realtor manager)
   One source of truth in localStorage so both apps see the same delegation
   dial, approvals queue, and activity feed. Mirrors the grt_field_tasks bridge. */
window.MGMT = (function () {
  const KEY = 'grt_mgmt';
  const FEE_PCT = 10;                         // management fee on collected rent
  const naira = n => '\u20a6' + Number(n).toLocaleString('en-NG');
  const clone = o => JSON.parse(JSON.stringify(o));

  /* Chidi Nwosu delegates his Abuja portfolio to Prime Realty (Ngozi Eze).
     He stays on the ground in Lagos but can't be in Abuja, so the agency runs
     the tenancies while he watches everything through the oversight view. */
  const seed = {
    manager: { name: 'Ngozi Eze', agency: 'Prime Realty', trust: 94, phone: '+234 800 000 0003', since: 'Mar 2026' },
    owner: { name: 'Chidi Nwosu', trust: 92 },
    feePct: FEE_PCT,

    /* The delegation dial — how much the owner hands off vs. keeps sign-off on */
    dial: {
      maintThreshold: 50000,        // repairs under this are auto-approved by the manager
      tenantApproval: 'manual',     // 'auto' | 'manual' — new tenants need owner sign-off
      rentIncrease: 'manual',
      leaseRenewal: 'auto',
      notify: 'all'                 // 'all' | 'digest'
    },

    /* Properties under management — shared so both apps render identical rosters */
    properties: [
      { id: 'lp2', name: 'Gwarinpa Terraces', type: 'Terrace Duplex', area: 'Gwarinpa', city: 'Abuja', units: 4, rentPerUnit: 3600000,
        roll: [
          { unit: '1', tenant: 'Emeka Eze', trust: 81, verified: true, rent: 3600000, status: 'paid', escrow: 'released', due: '15 Jan 2027' },
          { unit: '2', tenant: 'Amina Yusuf', trust: 86, verified: true, rent: 3600000, status: 'paid', escrow: 'held', due: '08 Mar 2027' },
          { unit: '3', tenant: 'Sadiq Bello', trust: 74, verified: true, rent: 3600000, status: 'due', escrow: 'pending', due: '01 Jun 2026' },
          { unit: '4', tenant: 'Grace Udo', trust: 88, verified: true, rent: 3600000, status: 'paid', escrow: 'released', due: '22 Sep 2026' }
        ] },
      { id: 'lp4', name: 'Wuse Garden Court', type: 'Flat', area: 'Wuse 2', city: 'Abuja', units: 5, rentPerUnit: 2400000,
        roll: [
          { unit: '1', tenant: 'Aisha Lawal', trust: 83, verified: true, rent: 2400000, status: 'paid', escrow: 'released', due: '12 Oct 2026' },
          { unit: '2', tenant: 'Peter Eze', trust: 79, verified: true, rent: 2400000, status: 'paid', escrow: 'held', due: '30 Nov 2026' },
          { unit: '5', tenant: 'Hauwa Idris', trust: 70, verified: true, rent: 2400000, status: 'overdue', escrow: 'pending', due: '18 May 2026' },
          { unit: '3', tenant: null, status: 'vacant' },
          { unit: '4', tenant: null, status: 'vacant' }
        ] }
    ],

    /* Decisions waiting on the owner. The manager raises these; the owner
       approves/declines. Anything below the dial thresholds never appears here. */
    approvals: [
      { id: 'ap1', propId: 'lp2', propName: 'Gwarinpa Terraces', unit: '2', type: 'maintenance',
        title: 'Replace water heater', amount: 85000, by: 'Ngozi Eze', when: '2h ago', status: 'pending',
        detail: 'Tenant reported no hot water. AquaFix quoted \u20a685,000 for a new 100L heater incl. fitting \u2014 above your \u20a650,000 auto-approve limit, so it needs your nod.' },
      { id: 'ap2', propId: 'lp4', propName: 'Wuse Garden Court', unit: '3', type: 'tenant',
        title: 'New tenant for Unit 3', amount: 2400000, by: 'Ngozi Eze', when: '1d ago', status: 'pending',
        detail: 'Bashir Mohammed \u2014 trust 72, identity verified. Offered \u20a62,400,000/yr on a 12-month lease, references checked. You\u2019ve set new tenants to need your approval.' }
    ],

    /* Everything the manager has done, newest first. This IS the transparency
       layer — the owner sees it all without being in any tenant conversation. */
    feed: [
      { id: 'f1', propId: 'lp2', propName: 'Gwarinpa Terraces', unit: '1', icon: 'wallet', tone: 'green', title: 'Rent collected', detail: 'Emeka Eze paid \u20a63,600,000 \u00b7 held in Il\u00e9 escrow', when: '2d ago' },
      { id: 'f2', propId: 'lp2', propName: 'Gwarinpa Terraces', unit: '4', icon: 'wrench', tone: 'info', title: 'Repair completed', detail: 'Window latch fixed \u00b7 \u20a618,000 \u00b7 auto-approved (under your \u20a650k limit)', when: '3d ago' },
      { id: 'f3', propId: 'lp4', propName: 'Wuse Garden Court', unit: '5', icon: 'bell', tone: 'warn', title: 'Rent reminder sent', detail: 'Hauwa Idris \u00b7 9 days overdue \u00b7 manager is following up directly', when: '4d ago' },
      { id: 'f4', propId: 'lp2', propName: 'Gwarinpa Terraces', unit: '1', icon: 'message', tone: 'info', title: 'Tenant query handled', detail: 'Noise complaint about the estate generator \u2014 resolved with the facility office', when: '5d ago' },
      { id: 'f5', propId: 'lp4', propName: 'Wuse Garden Court', unit: null, icon: 'schedule', tone: 'info', title: 'Quarterly inspection completed', detail: 'Field agent Tobi Adeniyi \u00b7 all units in good condition \u00b7 report filed', when: '1w ago' },
      { id: 'f6', propId: null, propName: 'Portfolio', unit: null, icon: 'bank', tone: 'green', title: 'Payout remitted', detail: '\u20a66,480,000 net remitted to your account (after 10% management fee)', when: '1w ago' }
    ],

    /* Outgoing management requests from the owner to agencies. Pending until the
       agency accepts; on accept the property joins `properties` above. */
    requests: [],

    /* Properties the owner has OPENED to receive proposals. Agencies can only
       discover and pitch these — never the owner's other properties. */
    openProperties: [
      { id: 'lp3', name: 'Ikoyi Heights', type: 'Luxury Flats', area: 'Ikoyi', city: 'Lagos', region: 'Lagos — Island', units: 3, occupied: 2, rentPerUnit: 9500000, ownerName: 'Chidi Nwosu', ownerTrust: 92, when: '3d ago' }
    ],

    /* Proposals agencies have sent on opened properties (agency -> owner) */
    offers: [
      { id: 'of-seed1', propId: 'lp3', propName: 'Ikoyi Heights', agencyId: 'ag-cornerstone', agencyName: 'Cornerstone Property Mgmt', lead: 'Bola Adesanya', trust: 90, rating: 4.7, feePct: 8, services: ['Rent collection', 'Maintenance', 'Tenant sourcing', 'Inspections'], when: '2d ago', status: 'pending',
        message: 'We manage 14 units in Ikoyi already and can fill your vacant flat fast. 8% all-in, escrow-backed, with monthly statements.' },
      { id: 'of-seed2', propId: 'lp3', propName: 'Ikoyi Heights', agencyId: 'ag-meridian', agencyName: 'Meridian Realty Partners', lead: 'Tari George', trust: 95, rating: 5.0, feePct: 12, services: ['Rent collection', 'Maintenance', 'Tenant sourcing', 'Inspections', 'Legal & eviction', 'Concierge & furnishing'], when: '1d ago', status: 'pending',
        message: 'Ikoyi Heights is exactly our portfolio. White-glove management, 14-day average to let, and concierge-grade tenant care. Worth the 12%.' }
    ]
  };

  /* Directory of managing agencies the owner can compare and appoint.
     Prime Realty (self) is the agency whose Realtor app receives live requests. */
  const agencies = [
    { id: 'ag-prime', name: 'Prime Realty', self: true, lead: 'Ngozi Eze', cities: ['Lagos — Island', 'Lagos — Mainland', 'Abuja'], feePct: 10, trust: 94, managed: 48, occupancy: 96, daysToLet: 18, rating: 4.8, reviews: 124, verified: true,
      services: ['Rent collection', 'Maintenance', 'Tenant sourcing', 'Inspections', 'Legal & eviction'],
      blurb: 'Full-service island & capital agency. Escrow-backed rent, 24–48h maintenance SLAs and clear monthly owner statements. Your money never touches our hands — it flows owner-direct through Ilé escrow.' },
    { id: 'ag-cornerstone', name: 'Cornerstone Property Mgmt', lead: 'Bola Adesanya', cities: ['Lagos — Mainland', 'Lagos — Island'], feePct: 8, trust: 90, managed: 72, occupancy: 93, daysToLet: 24, rating: 4.7, reviews: 98, verified: true,
      services: ['Rent collection', 'Maintenance', 'Tenant sourcing', 'Inspections'],
      blurb: 'High-volume Lagos manager with a competitive fee. Strong maintenance network across the mainland; legal handled by referral rather than in-house.' },
    { id: 'ag-haven', name: 'Haven Estate Managers', lead: 'Aisha Bello', cities: ['Abuja'], feePct: 9, trust: 92, managed: 35, occupancy: 95, daysToLet: 20, rating: 4.9, reviews: 61, verified: true,
      services: ['Rent collection', 'Maintenance', 'Tenant sourcing', 'Inspections', 'Legal & eviction'],
      blurb: 'Boutique Abuja specialist. Smaller book, more attention per property — the highest owner rating in the capital.' },
    { id: 'ag-anchor', name: 'Anchor Lettings', lead: 'Ifeanyi Okoro', cities: ['Lagos — Mainland', 'Port Harcourt'], feePct: 7, trust: 86, managed: 90, occupancy: 89, daysToLet: 30, rating: 4.5, reviews: 140, verified: true,
      services: ['Rent collection', 'Maintenance'],
      blurb: 'Lowest fee on Ilé. A lean, hands-off rent-collection-and-repairs service — you keep tenant sourcing and legal yourself. Best for owners who want light-touch help.' },
    { id: 'ag-meridian', name: 'Meridian Realty Partners', lead: 'Tari George', cities: ['Lagos — Island'], feePct: 12, trust: 95, managed: 22, occupancy: 98, daysToLet: 14, rating: 5.0, reviews: 40, verified: true,
      services: ['Rent collection', 'Maintenance', 'Tenant sourcing', 'Inspections', 'Legal & eviction', 'Concierge & furnishing'],
      blurb: 'Premium, white-glove management for luxury island portfolios. Highest fee, fastest lets, near-perfect occupancy and concierge-grade tenant care.' }
  ];

  const agencyReviews = {
    'ag-prime': [['Folarin O. · 6 units', 5, 'Rent always on time, statements are crystal clear. I haven’t had to think about my Lekki flats in a year.'], ['Mrs Adeyemi · 3 units', 5, 'They filled two vacancies in under three weeks.']],
    'ag-cornerstone': [['Emeka N. · 12 units', 5, 'Best value in Lagos and maintenance is genuinely fast.'], ['Sandra U. · 4 units', 4, 'Great on rent collection — I just wish they handled legal in-house.']],
    'ag-haven': [['Alhaji Musa · 8 units', 5, 'Abuja through and through. Inspections are thorough and well-documented.'], ['Grace E. · 2 units', 5, 'Boutique attention, worth every naira.']],
    'ag-anchor': [['Tunde B. · 20 units', 4, 'Cheap and reliable for rent collection — you handle the rest, which suits me.'], ['Ngozi A. · 6 units', 4, 'Does exactly what it says, no frills.']],
    'ag-meridian': [['Chief Balogun · 5 units', 5, 'White-glove. My Banana Island homes are always let to top-tier tenants.'], ['Ada O. · 2 units', 5, 'Pricey but completely flawless.']]
  };

  function load() {
    try { const r = JSON.parse(localStorage.getItem(KEY)); return r && r.properties ? r : clone(seed); }
    catch (e) { return clone(seed); }
  }
  function save(m) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} return m; }
  function update(fn) { const m = load(); fn(m); return save(m); }

  /* convenience */
  function collectedThisCycle(m) {
    return (m || load()).properties.reduce((s, p) => s + (p.roll || []).filter(r => r.status === 'paid').reduce((a, r) => a + (r.rent || 0), 0), 0);
  }
  function occupancy(m) {
    const ps = (m || load()).properties;
    const units = ps.reduce((s, p) => s + p.units, 0);
    const occ = ps.reduce((s, p) => s + (p.roll || []).filter(r => r.tenant).length, 0);
    return { units, occ };
  }
  function pushFeed(m, ev) { m.feed.unshift(Object.assign({ id: 'f' + Date.now() }, ev)); }

  /* Owner sends a management request to an agency (one per property) */
  function pushRequest(m, req) { m.requests.unshift(Object.assign({ id: 'rq' + Date.now() + Math.random().toString(36).slice(2, 5) }, req)); }
  /* Agency accepts a request -> the property is onboarded into the managed portfolio */
  function onboardProperty(m, req) {
    if (!m.properties.some(p => p.id === req.property.id)) m.properties.push(Object.assign({ agencyName: req.agencyName }, req.property));
    pushFeed(m, { propId: req.property.id, propName: req.property.name, unit: null, icon: 'briefcase', tone: 'green', title: 'New property onboarded', detail: req.agencyName + ' accepted management of ' + req.property.name + ' · ' + req.property.units + ' units', when: 'Just now' });
  }
  const findAgency = id => agencies.find(a => a.id === id);

  /* Owner opens / closes a property to agency proposals */
  function openProperty(m, snapshot) { if (!m.openProperties.some(p => p.id === snapshot.id)) m.openProperties.unshift(snapshot); }
  function closeProperty(m, propId) { m.openProperties = m.openProperties.filter(p => p.id !== propId); m.offers = m.offers.filter(o => o.propId !== propId); }
  /* Agency sends a proposal on an opened property */
  function pushOffer(m, offer) { m.offers.unshift(Object.assign({ id: 'of' + Date.now() + Math.random().toString(36).slice(2, 5) }, offer)); }

  return { KEY, FEE_PCT, naira, seed, load, save, update, collectedThisCycle, occupancy, pushFeed, pushRequest, onboardProperty, agencies, agencyReviews, findAgency, openProperty, closeProperty, pushOffer };
})();
