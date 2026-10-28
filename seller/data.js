/* Ilé Seller — mock data (Nigerian market, selling side) */
window.SD = (function () {
  const naira = n => '₦' + Number(n).toLocaleString('en-NG');

  /* The seller's own properties listed for sale */
  const listings = [
    { id: 'sl1', title: '4-Bedroom Detached Duplex', type: 'Detached Duplex', area: 'Lekki Phase 1', city: 'Lagos', price: 185000000, beds: 4, baths: 5, sqm: 420, verified: true, status: 'Under Offer', image: 'Detached Duplex · Lekki', views: 1284, saves: 86, enquiries: 18, listed: '12 Apr 2026', title_doc: 'C of O', amenities: ['C of O Title', '24/7 Power', 'Swimming Pool', 'BQ', 'CCTV & Smart Home', 'Fitted Kitchen'], desc: 'Brand-new fully detached duplex with C of O in a serviced Lekki estate. Smart-home wiring, pool and private boys-quarters.' },
    { id: 'sl2', title: '5-Bedroom Luxury Villa', type: 'Villa', area: 'Ikoyi', city: 'Lagos', price: 420000000, beds: 5, baths: 6, sqm: 650, verified: true, status: 'In Escrow', image: 'Luxury Villa · Ikoyi', views: 2140, saves: 142, enquiries: 11, listed: '20 Mar 2026', title_doc: 'C of O', amenities: ['C of O Title', 'Waterfront', 'Cinema Room', 'Staff Quarters', 'Elevator', 'Private Jetty'], desc: 'Trophy waterfront villa in old Ikoyi with full C of O. Private jetty, home cinema and elevator across three floors.' },
    { id: 'sl3', title: '3-Bedroom Apartment', type: 'Apartment', area: 'Yaba', city: 'Lagos', price: 45000000, beds: 3, baths: 2, sqm: 120, verified: true, status: 'Active', image: 'Apartment · Yaba', views: 718, saves: 41, enquiries: 9, listed: '18 May 2026', title_doc: 'Deed of Assignment', amenities: ['Deed of Assignment', 'Prepaid Meter', 'Parking', 'Water Treatment'], desc: 'Smart, well-priced apartment near the tech hub. Verified Deed of Assignment — strong rental yield.' },
    { id: 'sl4', title: '2-Bedroom Flat', type: 'Flat', area: 'Surulere', city: 'Lagos', price: 38000000, beds: 2, baths: 2, sqm: 95, verified: false, status: 'Draft', image: 'Flat · Surulere', views: 0, saves: 0, enquiries: 0, listed: '—', title_doc: 'Survey Plan', amenities: ['Survey Plan', 'Borehole', 'Parking'], desc: 'Renovated flat in central Surulere. Title verification in progress before listing goes live.' }
  ];

  /* Offers received from buyers */
  const offers = [
    { id: 'so1', listingId: 'sl1', buyer: 'Olu Adebayo', buyerTrust: 88, amount: 176000000, status: 'New', when: '28 May 2026', financing: 'Mortgage · pre-approved', closing: '6 weeks',
      thread: [
        { them: true, type: 'offer', amount: 176000000, text: 'Offer for the Lekki duplex — mortgage pre-approved, flexible on closing.', t: '28 May, 11:20' }
      ] },
    { id: 'so2', listingId: 'sl1', buyer: 'Chioma Nwankwo', buyerTrust: 86, amount: 170000000, status: 'Countered', when: '26 May 2026', financing: 'Cash', closing: '4 weeks', counter: 180000000,
      thread: [
        { them: true, type: 'offer', amount: 170000000, text: 'Cash offer, can close in 4 weeks.', t: '26 May, 09:05' },
        { me: true, type: 'msg', text: 'Thank you — we have strong interest at a higher level.', t: '26 May, 13:40' },
        { me: true, type: 'counter', amount: 180000000, text: 'Counter-offer. Happy to proceed quickly via escrow.', t: '26 May, 13:42' }
      ] },
    { id: 'so3', listingId: 'sl2', buyer: 'Fatima Sani', buyerTrust: 90, amount: 410000000, status: 'Accepted', when: '20 May 2026', financing: 'Cash', closing: '8 weeks', counter: null,
      thread: [
        { them: true, type: 'offer', amount: 410000000, text: 'Offer for the Ikoyi villa. Cash, ready to move to escrow.', t: '20 May, 10:00' },
        { me: true, type: 'accept', text: 'Accepted. Let\u2019s proceed through Ilé escrow.', t: '20 May, 15:30' }
      ] }
  ];

  /* Active escrow sale (the accepted Ikoyi villa) */
  const escrowMilestones = [
    { key: 'offer', title: 'Offer accepted', desc: '₦410M agreed with Fatima Sani', state: 'done', date: '20 May 2026' },
    { key: 'deposit', title: 'Buyer deposit secured', desc: '10% held in Ilé Escrow', amount: 41000000, state: 'done', date: '22 May 2026' },
    { key: 'verification', title: 'Title verification', desc: 'C of O cross-checked with land registry', state: 'active', date: 'In progress' },
    { key: 'final', title: 'Balance in escrow', desc: 'Buyer funds full balance on clearance', amount: 369000000, state: 'todo', date: '' },
    { key: 'completion', title: 'Transfer & proceeds released', desc: 'Ownership transfers, proceeds paid to you', state: 'todo', date: '' }
  ];

  const doneSteps = (dep, bal, d1, d2) => [
    { key: 'offer', title: 'Offer accepted', desc: 'Agreed with buyer', state: 'done', date: d1 },
    { key: 'deposit', title: 'Buyer deposit secured', desc: '10% held in Ilé Escrow', amount: dep, state: 'done', date: d1 },
    { key: 'verification', title: 'Title verification', desc: 'C of O cross-checked with land registry', state: 'done', date: d1 },
    { key: 'final', title: 'Balance in escrow', desc: 'Buyer funded full balance', amount: bal, state: 'done', date: d2 },
    { key: 'completion', title: 'Transfer & proceeds released', desc: 'Ownership transferred, proceeds paid to you', state: 'done', date: d2 }
  ];

  const transactions = [
    { id: 'stx1', listingId: 'sl2', stage: 'In Escrow', amount: 410000000, held: 41000000, fee: 6150000, started: '22 May 2026', buyer: 'Fatima Sani', milestones: escrowMilestones },
    { id: 'stx2', stage: 'Completed', amount: 96000000, held: 96000000, fee: 1440000, started: '02 Feb 2026', closed: '11 Mar 2026', buyer: 'Kelechi Obi',
      prop: { title: '3-Bedroom Terrace', type: 'Terrace', area: 'Gbagada', city: 'Lagos' },
      milestones: doneSteps(9600000, 86400000, '04 Feb 2026', '11 Mar 2026') }
  ];

  /* Valuation comparables by area (recent verified sales) */
  const comparables = {
    sl1: [
      { addr: '12 Admiralty Way, Lekki', type: '4-Bed Duplex', sqm: 400, sold: 178000000, when: 'Mar 2026' },
      { addr: '5 Chevron Drive, Lekki', type: '4-Bed Duplex', sqm: 440, sold: 192000000, when: 'Feb 2026' },
      { addr: '9 Freedom Way, Lekki', type: '5-Bed Duplex', sqm: 460, sold: 205000000, when: 'Jan 2026' }
    ],
    sl2: [
      { addr: '2 Bourdillon, Ikoyi', type: '5-Bed Villa', sqm: 620, sold: 398000000, when: 'Apr 2026' },
      { addr: '7 Gerrard Rd, Ikoyi', type: '5-Bed Villa', sqm: 680, sold: 445000000, when: 'Feb 2026' }
    ],
    sl3: [
      { addr: '14 Herbert Macaulay, Yaba', type: '3-Bed Apt', sqm: 118, sold: 43000000, when: 'Apr 2026' },
      { addr: '3 Commercial Ave, Yaba', type: '3-Bed Apt', sqm: 125, sold: 47500000, when: 'Mar 2026' }
    ],
    sl4: [
      { addr: '21 Adelabu St, Surulere', type: '2-Bed Flat', sqm: 90, sold: 36000000, when: 'Mar 2026' }
    ]
  };

  const documents = [
    { id: 'sd1', name: 'Certificate of Occupancy — Ikoyi Villa', type: 'Title', date: '18 Mar 2026', size: '2.4 MB', verified: true },
    { id: 'sd2', name: 'Sale Agreement — Fatima Sani', type: 'Contract', date: '20 May 2026', size: '480 KB', verified: true },
    { id: 'sd3', name: 'Escrow Agreement — Ikoyi Sale', type: 'Escrow', date: '22 May 2026', size: '340 KB', verified: true },
    { id: 'sd4', name: 'Deposit Confirmation (₦41M)', type: 'Receipt', date: '22 May 2026', size: '180 KB', verified: true },
    { id: 'sd5', name: 'C of O — Lekki Duplex', type: 'Title', date: '10 Apr 2026', size: '2.1 MB', verified: true },
    { id: 'sd6', name: 'Survey Plan — Surulere Flat', type: 'Title', date: '15 May 2026', size: '900 KB', verified: false }
  ];

  const threads = [
    { id: 'st1', name: 'Fatima Sani', role: 'Buyer · Ikoyi Villa', trust: 90, last: 'Looking forward to the title clearance.', time: '2h', unread: 1,
      messages: [{ me: true, text: 'Thank you for the offer — escrow is funded, we\u2019re moving to verification.', t: 'Wed 16:00' }, { me: false, text: 'Wonderful. Looking forward to the title clearance.', t: 'Wed 16:20' }] },
    { id: 'st2', name: 'Olu Adebayo', role: 'Buyer · Lekki Duplex', trust: 88, last: 'Is the price negotiable at all?', time: '5h', unread: 2,
      messages: [{ me: false, text: 'I love the Lekki duplex. Is the price negotiable at all?', t: 'Wed 11:00' }] },
    { id: 'st3', name: 'Ilé Escrow', role: 'Support', trust: 100, last: 'Title verification is underway with the registry.', time: '1d', unread: 0,
      messages: [{ me: false, text: 'The buyer\u2019s ₦41,000,000 deposit is secured. Title verification is underway with the registry.', t: 'Mon 10:00' }] }
  ];

  const nav = [
    ['chart', 'Dashboard', 'dashboard'], ['building', 'My Properties', 'properties'], ['handshake', 'Offers', 'offers'],
    ['gauge', 'Valuation', 'valuation'], ['layers', 'Transactions', 'transactions'], ['doc', 'Documents', 'documents'],
    ['message', 'Messages', 'messages'], ['settings', 'Settings', 'settings']
  ];

  const find = id => listings.find(l => l.id === id);
  const findOffer = id => offers.find(o => o.id === id);
  const findTx = id => transactions.find(t => t.id === id);

  return { naira, listings, offers, escrowMilestones, transactions, comparables, documents, threads, nav, find, findOffer, findTx };
})();
