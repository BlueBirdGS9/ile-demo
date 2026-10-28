/* Ilé Buyer — mock data (Nigerian market) */
window.BD = (function () {
  const naira = n => '₦' + Number(n).toLocaleString('en-NG');

  const listings = [
    { id: 'bp1', title: '4-Bedroom Detached Duplex', type: 'Detached Duplex', area: 'Lekki Phase 1', city: 'Lagos', price: 185000000, beds: 4, baths: 5, sqm: 420, verified: true, rating: 4.9, reviews: 18, owner: { name: 'Emeka Okafor', verified: true, trust: 95, since: '2020' }, amenities: ['C of O Title', '24/7 Power', 'Swimming Pool', 'BQ', 'CCTV & Smart Home', 'Fitted Kitchen'], desc: 'Brand-new, fully detached duplex with C of O in a serviced Lekki estate. Smart-home wiring, pool and private boys-quarters.', image: 'Detached Duplex · Lekki' },
    { id: 'bp2', title: '3-Bedroom Terrace', type: 'Terrace', area: 'Wuse 2', city: 'Abuja', price: 95000000, beds: 3, baths: 4, sqm: 260, verified: true, rating: 4.7, reviews: 12, owner: { name: 'Hauwa Bello', verified: true, trust: 88, since: '2021' }, amenities: ['Deed of Assignment', 'Estate Security', 'Parking', 'Borehole', 'Solar Backup'], desc: 'Contemporary terrace in central Wuse 2 with verified Deed of Assignment. Walkable to business district.', image: 'Terrace · Wuse 2' },
    { id: 'bp3', title: '5-Bedroom Luxury Villa', type: 'Villa', area: 'Ikoyi', city: 'Lagos', price: 420000000, beds: 5, baths: 6, sqm: 650, verified: true, rating: 5.0, reviews: 9, owner: { name: 'Folake Williams', verified: true, trust: 97, since: '2019' }, amenities: ['C of O Title', 'Waterfront', 'Cinema Room', 'Staff Quarters', 'Elevator', 'Private Jetty'], desc: 'Trophy waterfront villa in old Ikoyi with full C of O. Private jetty, home cinema and elevator across three floors.', image: 'Luxury Villa · Ikoyi' },
    { id: 'bp4', title: '3-Bedroom Apartment', type: 'Apartment', area: 'Maitama', city: 'Abuja', price: 78000000, beds: 3, baths: 3, sqm: 210, verified: true, rating: 4.6, reviews: 15, owner: { name: 'Sadiq Aliyu', verified: true, trust: 84, since: '2022' }, amenities: ['C of O Title', 'Gym', 'Concierge', '24/7 Power', 'Parking'], desc: 'Serviced apartment in a premium Maitama tower with gym and concierge. Ideal pied-à-terre or investment.', image: 'Apartment · Maitama' },
    { id: 'bp5', title: '4-Bedroom Semi-Detached', type: 'Semi-Detached', area: 'GRA', city: 'Port Harcourt', price: 62000000, beds: 4, baths: 4, sqm: 300, verified: false, rating: 4.3, reviews: 6, owner: { name: 'Ibrahim Sani', verified: false, trust: 61, since: '2023' }, amenities: ['Survey Plan', 'Estate Security', 'BQ', 'Parking'], desc: 'Spacious semi-detached in old GRA Port Harcourt. Survey plan available; title verification in progress.', image: 'Semi-Detached · PH GRA' },
    { id: 'bp6', title: '2-Bedroom Apartment', type: 'Apartment', area: 'Yaba', city: 'Lagos', price: 45000000, beds: 2, baths: 2, sqm: 120, verified: true, rating: 4.4, reviews: 11, owner: { name: 'Tunde Bakare', verified: true, trust: 79, since: '2022' }, amenities: ['Deed of Assignment', 'Prepaid Meter', 'Parking', 'Water Treatment'], desc: 'Smart, well-priced apartment near the tech hub. Verified Deed of Assignment — strong rental yield.', image: 'Apartment · Yaba' }
  ];

  const offers = [
    { id: 'of1', listingId: 'bp2', amount: 90000000, status: 'Countered', when: '26 May 2026', financing: 'Mortgage', counter: 93000000,
      thread: [
        { me: true, type: 'offer', amount: 90000000, text: 'Initial offer — financing via mortgage, 25% down.', t: '26 May, 10:20' },
        { me: false, type: 'msg', text: 'Thanks for your offer. The home has had strong interest.', t: '26 May, 14:02' },
        { me: false, type: 'counter', amount: 93000000, text: 'Counter-offer. Can close within 6 weeks.', t: '26 May, 14:05' }
      ] },
    { id: 'of2', listingId: 'bp4', amount: 75000000, status: 'Accepted', when: '20 May 2026', financing: 'Cash', counter: null,
      thread: [
        { me: true, type: 'offer', amount: 75000000, text: 'Cash offer, ready to proceed to escrow immediately.', t: '20 May, 09:00' },
        { me: false, type: 'accept', text: 'Offer accepted. Let’s proceed via Ilé escrow.', t: '20 May, 16:30' }
      ] },
    { id: 'of3', listingId: 'bp6', amount: 42000000, status: 'Submitted', when: '28 May 2026', financing: 'Mortgage', counter: null,
      thread: [{ me: true, type: 'offer', amount: 42000000, text: 'Offer below ask — flexible on closing date.', t: '28 May, 11:45' }] }
  ];

  const viewings = [
    { id: 'v1', listingId: 'bp1', date: 'Sat 31 May 2026', time: '11:00 AM', agent: 'Bisi Adeyemi', status: 'Confirmed' },
    { id: 'v2', listingId: 'bp3', date: 'Tue 03 Jun 2026', time: '2:00 PM', agent: 'Folake Williams', status: 'Pending' },
    { id: 'v3', listingId: 'bp4', date: 'Thu 22 May 2026', time: '10:30 AM', agent: 'Sadiq Aliyu', status: 'Completed' }
  ];

  // Alerts shown for a property the buyer is tracking (keyed by listing id)
  const watchAlerts = {
    bp1: { alert: 'Price dropped ₦5,000,000', kind: 'down' },
    bp3: { alert: 'New photos added', kind: 'info' },
    bp6: { alert: '2 other buyers viewing', kind: 'warn' }
  };
  // Properties the buyer is tracking by default (the user adds/removes more)
  const watchSeed = ['bp1', 'bp3', 'bp6'];

  // Escrow purchase (active) for accepted offer bp4
  const escrowMilestones = [
    { key: 'deposit', title: 'Deposit secured', desc: '10% deposit held in Ilé Escrow', amount: 7800000, state: 'done', date: '21 May 2026' },
    { key: 'verification', title: 'Title verification', desc: 'C of O cross-checked with land registry', state: 'active', date: 'In progress' },
    { key: 'final', title: 'Final payment', desc: 'Balance deposited to escrow on title clearance', amount: 70200000, state: 'todo', date: '' },
    { key: 'completion', title: 'Ownership transfer', desc: 'Funds released to seller, certificate issued', state: 'todo', date: '' }
  ];

  // Helper: a fully-completed milestone set for past purchases
  const doneSteps = (dep, bal, d1, d2) => [
    { key: 'deposit', title: 'Deposit secured', desc: '10% deposit held in Ilé Escrow', amount: dep, state: 'done', date: d1 },
    { key: 'verification', title: 'Title verification', desc: 'C of O cross-checked with land registry', state: 'done', date: d1 },
    { key: 'final', title: 'Final payment', desc: 'Balance deposited to escrow', amount: bal, state: 'done', date: d2 },
    { key: 'completion', title: 'Ownership transfer', desc: 'Funds released to seller, certificate issued', state: 'done', date: d2 }
  ];

  const transactions = [
    { id: 'tx1', listingId: 'bp4', stage: 'In Escrow', amount: 78000000, held: 7800000, started: '21 May 2026', seller: 'Sadiq Aliyu', milestones: escrowMilestones },
    { id: 'tx2', stage: 'Completed', amount: 52000000, held: 52000000, started: '10 Jan 2026', closed: '14 Feb 2026', seller: 'Bisi Adeyemi',
      prop: { title: '2-Bedroom Apartment', type: 'Apartment', area: 'Ikeja GRA', city: 'Lagos' },
      milestones: doneSteps(5200000, 46800000, '12 Jan 2026', '14 Feb 2026') },
    { id: 'tx3', stage: 'Completed', amount: 88000000, held: 88000000, started: '05 Aug 2025', closed: '19 Sep 2025', seller: 'Ngozi Eze',
      prop: { title: '3-Bedroom Terrace', type: 'Terrace', area: 'Gwarinpa', city: 'Abuja' },
      milestones: doneSteps(8800000, 79200000, '07 Aug 2025', '19 Sep 2025') }
  ];

  const documents = [
    { id: 'bd1', name: 'Offer Letter — Maitama Apartment', type: 'Offer', date: '20 May 2026', size: '210 KB', verified: true },
    { id: 'bd2', name: 'Escrow Agreement', type: 'Escrow', date: '21 May 2026', size: '340 KB', verified: true },
    { id: 'bd3', name: 'Deposit Receipt (₦7.8M)', type: 'Receipt', date: '21 May 2026', size: '180 KB', verified: true },
    { id: 'bd4', name: 'Certificate of Occupancy (copy)', type: 'Title', date: '22 May 2026', size: '2.1 MB', verified: false },
    { id: 'bd5', name: 'Purchase Agreement (draft)', type: 'Contract', date: '23 May 2026', size: '520 KB', verified: false }
  ];

  const threads = [
    { id: 'bt1', name: 'Sadiq Aliyu', role: 'Seller · Maitama', trust: 84, last: 'Title documents are with the registry now.', time: '3h', unread: 1,
      messages: [{ me: false, text: 'Congratulations on the accepted offer!', t: 'Wed 16:35' }, { me: true, text: 'Thank you. I have funded the escrow deposit.', t: 'Wed 17:00' }, { me: false, text: 'Title documents are with the registry now.', t: 'Thu 09:10' }] },
    { id: 'bt2', name: 'Bisi Adeyemi', role: 'Agent', trust: 81, last: 'Viewing confirmed for Saturday 11am.', time: '1d', unread: 0,
      messages: [{ me: true, text: 'Can we view the Lekki duplex this weekend?', t: 'Fri 10:00' }, { me: false, text: 'Viewing confirmed for Saturday 11am.', t: 'Fri 10:30' }] },
    { id: 'bt3', name: 'Ilé Escrow', role: 'Support', trust: 100, last: 'Your ₦7,800,000 deposit is secured.', time: '4d', unread: 0,
      messages: [{ me: false, text: 'Your ₦7,800,000 deposit is secured in escrow. Title verification has begun.', t: 'Sun 12:00' }] }
  ];

  const nav = [
    ['chart', 'Dashboard', 'dashboard'], ['compass', 'Discover', 'discover'], ['bookmark', 'Saved', 'saved'],
    ['scale', 'Compare', 'compare'], ['calendar', 'Viewings', 'viewings'], ['handshake', 'Offers', 'offers'],
    ['bank', 'Financing', 'financing'], ['layers', 'Transactions', 'transactions'], ['doc', 'Documents', 'documents'],
    ['message', 'Messages', 'messages'], ['eye', 'Watchlist', 'watchlist'], ['settings', 'Settings', 'settings']
  ];

  return { naira, listings, offers, viewings, watchAlerts, watchSeed, escrowMilestones, transactions, documents, threads, nav, find: id => listings.find(l => l.id === id), findOffer: id => offers.find(o => o.id === id), findTx: id => transactions.find(t => t.id === id) };
})();
