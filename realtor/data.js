/* Ilé Realtor — mock data (Nigerian market) */
window.RT = (function () {
  const naira = n => '₦' + Number(n).toLocaleString('en-NG');

  /* Realtor's managed inventory — mix of sale & rent */
  const listings = [
    { id: 'rl1', title: '4-Bedroom Detached Duplex', type: 'Detached Duplex', deal: 'For Sale', area: 'Lekki Phase 1', city: 'Lagos', price: 185000000, beds: 4, baths: 5, sqm: 420, verified: true, status: 'Under Offer', image: 'Duplex · Lekki', views: 1284, enquiries: 18, listed: '12 Apr 2026', owner: 'Hauwa Bello', access: { method: 'lockbox', code: '4471', where: 'Lockbox clipped to the burglary gate, right of the main door.', contact: { name: 'Sunday (gateman)', phone: '+234 800 000 0001' }, notes: 'Tell security you’re from Prime Realty — the agent’s name is on the gate list.' } },
    { id: 'rl2', title: '3-Bedroom Apartment', type: 'Apartment', deal: 'For Rent', area: 'Ikoyi', city: 'Lagos', price: 9500000, beds: 3, baths: 3, sqm: 210, verified: true, status: 'Active', image: 'Apartment · Ikoyi', views: 962, enquiries: 24, listed: '03 May 2026', owner: 'Folake Adeyemi', access: { method: 'concierge', code: '', where: 'Collect the key from the lobby concierge on the ground floor.', contact: { name: 'Lobby concierge', phone: '+234 800 000 0002' }, notes: 'Sign the visitor key register on collection and return.' } },
    { id: 'rl3', title: '5-Bedroom Luxury Villa', type: 'Villa', deal: 'For Sale', area: 'Banana Island', city: 'Lagos', price: 620000000, beds: 5, baths: 6, sqm: 720, verified: true, status: 'Active', image: 'Villa · Banana Is.', views: 2140, enquiries: 11, listed: '20 Mar 2026', owner: 'Chief Okoro', access: { method: 'office', code: '', where: 'Pick up keys from the Prime Realty office, 12 Adeola Odeku, Victoria Island.', contact: { name: 'Prime Realty front desk', phone: '+234 800 000 0003' }, notes: 'Keys must be returned to the office the same day by 6 PM.' } },
    { id: 'rl4', title: '2-Bedroom Flat', type: 'Flat', deal: 'For Rent', area: 'Wuse 2', city: 'Abuja', price: 4200000, beds: 2, baths: 2, sqm: 120, verified: false, status: 'Draft', image: 'Flat · Wuse 2', views: 0, enquiries: 0, listed: '—', owner: 'Bashir Mohammed', access: { method: 'estate', code: '5520', where: 'Lockbox on the security post at the estate gate.', contact: { name: 'Estate security', phone: '+234 800 000 0004' }, notes: 'Sign in at the gate — clearance arranged in the agent’s name.' } },
    { id: 'rl5', title: 'Detached Bungalow', type: 'Bungalow', deal: 'For Sale', area: 'GRA', city: 'Port Harcourt', price: 78000000, beds: 3, baths: 3, sqm: 280, verified: true, status: 'Sold', image: 'Bungalow · GRA', views: 1540, enquiries: 21, listed: '02 Feb 2026', owner: 'Ngozi Eze', access: { method: 'caretaker', code: '', where: 'The on-site caretaker will open up for you.', contact: { name: 'Mr Effiong (caretaker)', phone: '+234 800 000 0013' }, notes: 'Call ahead 30 minutes before arriving.' } },
    { id: 'rl6', title: '3-Bedroom Terrace', type: 'Terrace', deal: 'For Sale', area: 'Gwarinpa', city: 'Abuja', price: 95000000, beds: 3, baths: 4, sqm: 260, verified: true, status: 'Active', image: 'Terrace · Gwarinpa', views: 718, enquiries: 9, listed: '18 May 2026', owner: 'Tunde Bakare', access: { method: 'lockbox', code: '2290', where: 'Lockbox on the security post at the estate gate.', contact: { name: 'Estate security', phone: '+234 800 000 0004' }, notes: 'Sign in at the estate gate — clearance has been arranged in your name.' } }
  ];

  /* Lead pipeline — CRM */
  const STAGES = ['New', 'Contacted', 'Viewing', 'Offer', 'Closed'];
  const leads = [
    { id: 'le1', name: 'Olu Adebayo', stage: 'Offer', listingId: 'rl1', budget: 185000000, intent: 'Buy', trust: 88, phone: '+234 800 000 0006', email: 'olu.adebayo@example.com', source: 'Ilé Search', last: 'Submitted offer at ₦176M', when: '2h ago', value: 5550000, hot: true },
    { id: 'le2', name: 'Adaeze Okonkwo', stage: 'Viewing', listingId: 'rl2', budget: 10000000, intent: 'Rent', trust: 92, phone: '+234 800 000 0005', email: 'adaeze.o@example.com', source: 'Referral', last: 'Viewing booked for Sat 10am', when: '5h ago', value: 950000, hot: true },
    { id: 'le3', name: 'Emeka Eze', stage: 'New', listingId: 'rl3', budget: 600000000, intent: 'Buy', trust: 81, phone: '+234 800 000 0012', email: 'emeka.e@example.com', source: 'Instagram Ad', last: 'Enquired about the villa', when: '1d ago', value: 18600000, hot: false },
    { id: 'le4', name: 'Zainab Yusuf', stage: 'Contacted', listingId: 'rl6', budget: 95000000, intent: 'Buy', trust: 84, phone: '+234 800 000 0008', email: 'zainab.y@example.com', source: 'Ilé Search', last: 'Called — wants weekend viewing', when: '1d ago', value: 2850000, hot: false },
    { id: 'le5', name: 'Bashir Mohammed', stage: 'New', listingId: 'rl2', budget: 9000000, intent: 'Rent', trust: 72, phone: '+234 800 000 0010', email: 'bashir.m@example.com', source: 'Walk-in', last: 'Asked for floor plan', when: '2d ago', value: 900000, hot: false },
    { id: 'le6', name: 'Fatima Sani', stage: 'Viewing', listingId: 'rl3', budget: 650000000, intent: 'Buy', trust: 90, phone: '+234 800 000 0007', email: 'fatima.s@example.com', source: 'Referral', last: 'Second viewing requested', when: '3d ago', value: 19500000, hot: true },
    { id: 'le7', name: 'Chioma Nwankwo', stage: 'Contacted', listingId: 'rl1', budget: 180000000, intent: 'Buy', trust: 86, phone: '+234 800 000 0009', email: 'chioma.n@example.com', source: 'Ilé Search', last: 'Sent comparable listings', when: '4d ago', value: 5400000, hot: false },
    { id: 'le8', name: 'Kelechi Obi', stage: 'Closed', listingId: 'rl5', budget: 78000000, intent: 'Buy', trust: 79, phone: '+234 800 000 0011', email: 'kelechi.o@example.com', source: 'Instagram Ad', last: 'Deal closed — commission paid', when: '1w ago', value: 2340000, hot: false }
  ];

  /* Deals — escrow-backed transactions w/ commission */
  const deals = [
    { id: 'd1', listingId: 'rl5', buyer: 'Kelechi Obi', salePrice: 78000000, commissionPct: 3, stage: 'Completed', escrow: 'released', closed: '23 May 2026', started: '02 Apr 2026' },
    { id: 'd2', listingId: 'rl1', buyer: 'Olu Adebayo', salePrice: 176000000, commissionPct: 3, stage: 'In Escrow', escrow: 'held', closed: '—', started: '28 May 2026' },
    { id: 'd3', listingId: 'rl2', buyer: 'Adaeze Okonkwo', salePrice: 9500000, commissionPct: 10, stage: 'Closing', escrow: 'pending', closed: '—', started: '26 May 2026' }
  ];

  const dealMilestones = {
    d2: [
      { key: 'offer', title: 'Offer accepted', desc: '₦176M agreed', state: 'done', date: '28 May 2026' },
      { key: 'deposit', title: 'Deposit in escrow', desc: '10% secured', state: 'done', date: '29 May 2026' },
      { key: 'verification', title: 'Title verification', desc: 'Registry check', state: 'active', date: 'In progress' },
      { key: 'final', title: 'Balance & transfer', desc: 'Funds released', state: 'todo', date: '' },
      { key: 'commission', title: 'Commission released', desc: 'Your 3% fee', state: 'todo', date: '' }
    ]
  };

  /* Viewings the realtor is hosting */
  const viewings = [
    { id: 'v1', leadId: 'le2', listingId: 'rl2', date: 'Sat 31 May', time: '10:00 AM', status: 'Confirmed', type: 'In person' },
    { id: 'v2', leadId: 'le6', listingId: 'rl3', date: 'Sat 31 May', time: '1:00 PM', status: 'Confirmed', type: 'In person' },
    { id: 'v3', leadId: 'le4', listingId: 'rl6', date: 'Sun 01 Jun', time: '11:30 AM', status: 'Requested', type: 'Virtual' },
    { id: 'v4', leadId: 'le1', listingId: 'rl1', date: 'Mon 02 Jun', time: '4:00 PM', status: 'Confirmed', type: 'In person' }
  ];

  /* Commission earnings by month (₦ millions) */
  const earnings = [
    { m: 'Dec', v: 2.1 }, { m: 'Jan', v: 4.8 }, { m: 'Feb', v: 3.2 }, { m: 'Mar', v: 6.5 }, { m: 'Apr', v: 5.1 }, { m: 'May', v: 8.3 }
  ];

  /* Source attribution for leads */
  const sources = [
    { cat: 'Ilé Search', count: 38, pct: 44 },
    { cat: 'Referrals', count: 19, pct: 22 },
    { cat: 'Instagram Ads', count: 15, pct: 17 },
    { cat: 'Walk-in', count: 9, pct: 10 },
    { cat: 'Other', count: 6, pct: 7 }
  ];

  const activity = [
    ['handshake', 'gold', 'New offer received', 'Olu Adebayo offered ₦176M on Lekki Duplex', '2h ago'],
    ['users', 'info', 'New lead assigned', 'Emeka Eze enquired about Banana Island Villa', '1d ago'],
    ['shieldCheck', 'green', 'Commission released', '₦2,340,000 released to your account · Bungalow sale', '1w ago'],
    ['calendar', 'info', 'Viewing confirmed', 'Adaeze Okonkwo · Ikoyi Apartment · Sat 10am', '5h ago'],
    ['trend', 'green', 'Listing trending', 'Banana Island Villa passed 2,000 views', '2d ago']
  ];

  const threads = [
    { id: 'rt0', name: 'Chidi Nwosu', role: 'Owner · Managed portfolio', trust: 92, last: 'Go ahead on the Unit 2 water heater.', time: '20m', unread: 0,
      messages: [{ me: true, text: 'Monthly update on your Abuja portfolio: all rent collected except Wuse Unit 5, which I’m chasing. Quarterly inspection passed.', t: 'Mon 10:00' }, { me: false, text: 'Thanks Ngozi. Go ahead on the Unit 2 water heater.', t: 'Mon 10:15' }, { me: true, text: 'Done — AquaFix booked for Thursday. I’ll log it to your activity feed.', t: 'Mon 10:18' }] },
    { id: 'rt1', name: 'Olu Adebayo', role: 'Lead · Buyer', trust: 88, last: 'Can we revise to ₦178M?', time: '1h', unread: 2,
      messages: [{ me: false, text: 'I love the Lekki duplex. Is the price negotiable?', t: 'Mon 09:00' }, { me: true, text: 'The owner is open to reasonable offers. What did you have in mind?', t: 'Mon 09:30' }, { me: false, text: 'Can we revise to ₦178M?', t: 'Mon 10:05' }] },
    { id: 'rt2', name: 'Hauwa Bello', role: 'Owner · Lekki Duplex', trust: 90, last: 'Yes, proceed with the offer.', time: '3h', unread: 0,
      messages: [{ me: true, text: 'We have an offer of ₦176M from a verified buyer. Shall I proceed?', t: 'Mon 11:00' }, { me: false, text: 'Yes, proceed with the offer.', t: 'Mon 11:20' }] },
    { id: 'rt3', name: 'Ilé Support', role: 'Support', trust: 100, last: 'Your commission payout is processing.', time: '1w', unread: 0,
      messages: [{ me: false, text: 'Commission of ₦2,340,000 from the Port Harcourt sale has been released and is processing to your account.', t: 'Fri 14:00' }] }
  ];

  const documents = [
    { id: 'rd1', name: 'Sole Agency Agreement — Lekki Duplex', type: 'Mandate', date: '12 Apr 2026', size: '380 KB', verified: true },
    { id: 'rd2', name: 'Offer Letter — Olu Adebayo', type: 'Offer', date: '28 May 2026', size: '210 KB', verified: true },
    { id: 'rd3', name: 'Commission Statement — Q2 2026', type: 'Financial', date: '01 May 2026', size: '640 KB', verified: true },
    { id: 'rd4', name: 'C of O — Banana Island Villa', type: 'Title', date: '20 Mar 2026', size: '2.6 MB', verified: true },
    { id: 'rd5', name: 'Tenancy Agreement — Ikoyi Apartment', type: 'Lease', date: '03 May 2026', size: '440 KB', verified: false }
  ];

  const nav = [
    ['chart', 'Dashboard', 'dashboard'], ['building', 'Listings', 'listings'], ['users', 'Leads', 'leads'],
    ['handshake', 'Deals', 'deals'], ['briefcase', 'Management', 'lettings'], ['calendar', 'Viewings', 'viewings'], ['clipboard', 'Field Ops', 'fieldops'],
    ['userPlus', 'Agents', 'agents'], ['trend', 'Performance', 'performance'], ['message', 'Messages', 'messages'], ['doc', 'Documents', 'documents'], ['settings', 'Settings', 'settings']
  ];

  /* ---- Field-ops: the brokerage's field agent + the work it dispatches ---- */
  const fieldAgent = { name: 'Tobi Adeniyi', role: 'Field Agent', brokerage: 'Prime Realty', trust: 88, phone: '+234 800 000 0014', since: 'Jan 2025', completed: 142, rating: 4.8 };

  /* Task presets — drive the assign form's defaults */
  const taskTypes = [
    { type: 'Photos', icon: 'camera', fee: 15000, title: 'Photograph property' },
    { type: 'Documents', icon: 'doc', fee: 5000, title: 'Collect signed documents' },
    { type: 'Inspection', icon: 'shieldCheck', fee: 12000, title: 'Pre-listing inspection' },
    { type: 'Measurement', icon: 'ruler', fee: 8000, title: 'Measure & verify floor area' },
    { type: 'Signage', icon: 'signpost', fee: 7000, title: 'Install for-sale signage' },
    { type: 'Handover', icon: 'key', fee: 8000, title: 'Key handover' }
  ];

  /* Work already dispatched to the field agent (mirrors what shows in the Agent app) */
  const fieldTaskSeed = [
    { id: 'ft-s1', title: 'Photograph living areas', type: 'Photos', listingId: 'rl3', propTitle: '5-Bedroom Luxury Villa', propArea: 'Banana Island', priority: 'High', due: 'Today, 5 PM', status: 'To Do', fee: 15000, note: 'Wide-angle shots of all rooms + grounds for the new listing.', assignedBy: 'Ngozi Eze', when: '3h ago' },
    { id: 'ft-s2', title: 'Collect signed mandate', type: 'Documents', listingId: 'rl1', propTitle: '4-Bedroom Detached Duplex', propArea: 'Lekki Phase 1', priority: 'Medium', due: 'Today', status: 'In Progress', fee: 5000, note: 'Pick up sole-agency agreement from owner Hauwa Bello.', assignedBy: 'Ngozi Eze', when: '1d ago' },
    { id: 'ft-s3', title: 'Install for-sale signage', type: 'Signage', listingId: 'rl4', propTitle: '2-Bedroom Flat', propArea: 'Wuse 2', priority: 'Low', due: 'Tomorrow', status: 'To Do', fee: 7000, note: 'Mount brokerage signboard at the estate gate.', assignedBy: 'Ngozi Eze', when: '1d ago' },
    { id: 'ft-s4', title: 'Verify property condition', type: 'Inspection', listingId: 'rl2', propTitle: '3-Bedroom Apartment', propArea: 'Ikoyi', priority: 'Medium', due: 'Done', status: 'Done', fee: 9000, note: 'Pre-listing inspection completed and report filed.', assignedBy: 'Ngozi Eze', when: '2d ago' }
  ];

  const FIELD_KEY = 'grt_field_tasks';
  function loadDispatched() { try { return JSON.parse(localStorage.getItem(FIELD_KEY)) || []; } catch (e) { return []; } }
  function pushDispatched(t) { const arr = loadDispatched(); arr.unshift(t); try { localStorage.setItem(FIELD_KEY, JSON.stringify(arr)); } catch (e) {} return arr; }
  function allFieldTasks() { return loadDispatched().concat(fieldTaskSeed); }

  /* ---- Agent marketplace: your field team + a directory of verified agents to hire ---- */
  const SPECIALTIES = ['Photos', 'Viewings', 'Inspection', 'Documents', 'Measurement', 'Signage', 'Handover'];

  /* Agents already engaged by Prime Realty (Tobi is the brokerage's field agent) */
  const teamRoster = [
    { id: 'ag-tobi', name: 'Tobi Adeniyi', base: 'Lagos — Island', areas: ['Lekki', 'Ikoyi', 'Banana Island', 'Victoria Island'], rating: 4.8, completed: 142, trust: 88, feeMin: 6000, feeMax: 15000, response: 'within 30 min', years: 2, verified: true, since: 'Jan 2025', team: true, specialties: ['Photos', 'Documents', 'Inspection', 'Signage', 'Handover'], bio: 'Reliable island-based field agent. Handles viewings, photography and document pickups across Lekki and Ikoyi. Your primary field agent since January 2025.' }
  ];

  /* Verified agents available to invite onto your team */
  const agentDirectory = [
    { id: 'ag-amaka', name: 'Amaka Obi', base: 'Lagos — Island', areas: ['Lekki', 'Ikoyi', 'Victoria Island'], rating: 4.9, completed: 212, trust: 92, feeMin: 8000, feeMax: 18000, response: 'within 1 hr', years: 3, verified: true, specialties: ['Photos', 'Viewings', 'Inspection'], bio: 'Premium island agent specialising in high-end property photography and buyer viewings. Strong track record on luxury listings in Ikoyi and Banana Island.' },
    { id: 'ag-chinwe', name: 'Chinwe Okafor', base: 'Lagos — Mainland', areas: ['Yaba', 'Ikeja', 'Surulere', 'Maryland'], rating: 4.8, completed: 134, trust: 90, feeMin: 6000, feeMax: 14000, response: 'within 2 hrs', years: 2, verified: true, specialties: ['Viewings', 'Photos', 'Measurement'], bio: 'Mainland generalist with deep Ikeja and Yaba coverage. Fast on viewings and floor-area verification for rental stock.' },
    { id: 'ag-musa', name: 'Musa Ibrahim', base: 'Abuja', areas: ['Wuse 2', 'Maitama', 'Gwarinpa', 'Asokoro'], rating: 4.7, completed: 165, trust: 88, feeMin: 7000, feeMax: 15000, response: 'within 1 hr', years: 4, verified: true, specialties: ['Documents', 'Signage', 'Handover'], bio: 'Abuja field agent trusted with document collection and key handovers on escrow-backed sales across Maitama and Wuse.' },
    { id: 'ag-halima', name: 'Halima Sani', base: 'Abuja', areas: ['Maitama', 'Asokoro', 'Jabi'], rating: 4.9, completed: 188, trust: 93, feeMin: 9000, feeMax: 20000, response: 'within 45 min', years: 5, verified: true, specialties: ['Photos', 'Viewings', 'Inspection'], bio: 'Senior Abuja agent. Five years of inspections and luxury viewings, with the highest trust score in the capital directory.' },
    { id: 'ag-emeka', name: 'Emeka Nwankwo', base: 'Port Harcourt', areas: ['GRA', 'Trans-Amadi', 'Woji'], rating: 4.6, completed: 98, trust: 84, feeMin: 6000, feeMax: 12000, response: 'within 3 hrs', years: 3, verified: true, specialties: ['Inspection', 'Documents', 'Signage'], bio: 'Port Harcourt coverage for inspections and signage. Dependable on GRA and Trans-Amadi assignments.' },
    { id: 'ag-funke', name: 'Funke Bello', base: 'Lagos — Mainland', areas: ['Gbagada', 'Magodo', 'Ojodu'], rating: 4.7, completed: 76, trust: 86, feeMin: 5000, feeMax: 13000, response: 'within 2 hrs', years: 2, verified: true, specialties: ['Viewings', 'Documents', 'Measurement'], bio: 'Up-and-coming mainland agent covering Gbagada and Magodo. Strong on weekend viewings and tenancy paperwork.' }
  ];

  /* Brokerage areas used for the directory filter */
  const agentAreas = ['Lagos — Island', 'Lagos — Mainland', 'Abuja', 'Port Harcourt'];

  /* Seeded reviews shown on an agent's profile */
  const agentReviews = {
    'ag-amaka': [['Prime Realty', 5, 'Shot our Banana Island villa beautifully — listing views doubled.'], ['Lekki Prime Partners', 5, 'Always early to viewings, very professional with buyers.']],
    'ag-musa': [['Abuja Property Hub', 5, 'Handled three key handovers flawlessly. Completely trustworthy.'], ['Prime Realty', 4, 'Solid on documents, occasionally slow to confirm.']],
    'ag-halima': [['Abuja Property Hub', 5, 'Best agent in Abuja. Inspections are thorough and well-documented.']],
    'ag-chinwe': [['Lagos Homes Ltd', 5, 'Covers the whole mainland for us. Reliable every time.']],
    'ag-emeka': [['Coastal Estates', 4, 'Good Port Harcourt coverage, fair rates.']],
    'ag-funke': [['Lagos Homes Ltd', 5, 'Great with weekend rental viewings.']],
    'ag-tobi': [['Prime Realty', 5, 'Our go-to field agent — fast, reliable, and great with owners.']]
  };

  /* Invitations the realtor has sent (bridge to the Agent app) */
  const INVITE_KEY = 'grt_invites';
  function loadInvites() { try { return JSON.parse(localStorage.getItem(INVITE_KEY)) || []; } catch (e) { return []; } }
  function pushInvite(inv) { const a = loadInvites(); a.unshift(inv); try { localStorage.setItem(INVITE_KEY, JSON.stringify(a)); } catch (e) {} return a; }
  function invitedIds() { return loadInvites().map(i => i.agentId); }

  /* Applications agents have sent to Prime Realty (bridge FROM the Agent app) */
  const APPLICATION_KEY = 'grt_applications';
  function loadApplicants() { try { return (JSON.parse(localStorage.getItem(APPLICATION_KEY)) || []).filter(a => a.brokerage === 'Prime Realty'); } catch (e) { return []; } }

  const findListing = id => listings.find(l => l.id === id);
  const findLead = id => leads.find(l => l.id === id);
  const findDeal = id => deals.find(d => d.id === id);
  const findAgent = id => teamRoster.concat(agentDirectory).find(a => a.id === id);
  const commission = d => Math.round(d.salePrice * d.commissionPct / 100);

  /* Other owners whose properties Prime Realty also manages (no landlord app of
     their own — demo of the agency's multi-client managed book). Chidi Nwosu's
     managed properties live in the shared MGMT store; these sit alongside them. */
  const externalClients = [
    { owner: { name: 'Hauwa Bello', trust: 90 }, since: 'Nov 2025', feePct: 10, properties: [
      { id: 'ext1', name: 'Oniru Apartments', type: 'Apartment', area: 'Oniru', city: 'Lagos', units: 4, rentPerUnit: 6500000, roll: [
        { unit: 'A1', tenant: 'Bisi Afolabi', trust: 87, verified: true, rent: 6500000, status: 'paid', escrow: 'held', due: '14 Feb 2027' },
        { unit: 'A2', tenant: 'Kunle Ojo', trust: 80, verified: true, rent: 6500000, status: 'paid', escrow: 'released', due: '02 Sep 2026' },
        { unit: 'B1', tenant: 'Zara Mohammed', trust: 84, verified: true, rent: 6500000, status: 'due', escrow: 'pending', due: '01 Jun 2026' },
        { unit: 'B2', tenant: 'Daniel Okeke', trust: 78, verified: true, rent: 6500000, status: 'paid', escrow: 'held', due: '20 Nov 2026' }
      ] }
    ] },
    { owner: { name: 'Folarin Okonkwo', trust: 88 }, since: 'Aug 2025', feePct: 8, properties: [
      { id: 'ext2', name: 'Yaba Court', type: 'Block of Flats', area: 'Yaba', city: 'Lagos', units: 6, rentPerUnit: 3200000, roll: [
        { unit: '1', tenant: 'Segun Bello', trust: 82, verified: true, rent: 3200000, status: 'paid', escrow: 'released', due: '11 Jan 2027' },
        { unit: '2', tenant: 'Ada Nwosu', trust: 86, verified: true, rent: 3200000, status: 'paid', escrow: 'held', due: '28 Apr 2027' },
        { unit: '3', tenant: 'Ibrahim Sani', trust: 75, verified: true, rent: 3200000, status: 'overdue', escrow: 'pending', due: '15 May 2026' },
        { unit: '4', tenant: 'Joy Eke', trust: 88, verified: true, rent: 3200000, status: 'paid', escrow: 'released', due: '09 Oct 2026' },
        { unit: '5', tenant: null, status: 'vacant' },
        { unit: '6', tenant: 'Musa Garba', trust: 79, verified: true, rent: 3200000, status: 'paid', escrow: 'held', due: '03 Dec 2026' }
      ] }
    ] }
  ];

  return {
    naira, listings, STAGES, leads, deals, dealMilestones, viewings, earnings, sources, activity, threads, documents, nav,
    fieldAgent, taskTypes, fieldTaskSeed, loadDispatched, pushDispatched, allFieldTasks,
    SPECIALTIES, teamRoster, agentDirectory, agentAreas, agentReviews,
    loadInvites, pushInvite, invitedIds, loadApplicants,
    findListing, findLead, findDeal, findAgent, commission, externalClients
  };
})();
