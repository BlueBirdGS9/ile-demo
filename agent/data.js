/* Ilé Agent — mock data (Nigerian market, field-ops under a brokerage) */
window.AD = (function () {
  const naira = n => '₦' + Number(n).toLocaleString('en-NG');

  /* Properties the agent is covering on behalf of the brokerage.
     `access` = how the agent physically gets in (set by the brokerage). */
  const listings = [
    { id: 'al1', title: '4-Bedroom Detached Duplex', type: 'Detached Duplex', area: 'Lekki Phase 1', city: 'Lagos', price: 185000000, beds: 4, baths: 5, deal: 'For Sale', image: 'Duplex · Lekki', key: 'In lockbox · 4471', address: '14 Admiralty Way, Lekki Phase 1',
      access: { method: 'lockbox', code: '4471', where: 'Lockbox clipped to the burglary gate, right of the main door.', contact: { name: 'Sunday (gateman)', phone: '+234 800 000 0001' }, notes: 'Tell security you’re from Prime Realty — your name is on the gate list.' } },
    { id: 'al2', title: '3-Bedroom Apartment', type: 'Apartment', area: 'Ikoyi', city: 'Lagos', price: 9500000, beds: 3, baths: 3, deal: 'For Rent', image: 'Apartment · Ikoyi', key: 'With concierge', address: '7 Bourdillon Rd, Ikoyi',
      access: { method: 'concierge', code: '', where: 'Collect the key from the lobby concierge on the ground floor.', contact: { name: 'Lobby concierge', phone: '+234 800 000 0002' }, notes: 'Sign the visitor key register on collection and return.' } },
    { id: 'al3', title: '5-Bedroom Luxury Villa', type: 'Villa', area: 'Banana Island', city: 'Lagos', price: 620000000, beds: 5, baths: 6, deal: 'For Sale', image: 'Villa · Banana Is.', key: 'Collect from office', address: '2 Ocean Parade, Banana Island',
      access: { method: 'office', code: '', where: 'Pick up keys from the Prime Realty office, 12 Adeola Odeku, Victoria Island.', contact: { name: 'Prime Realty front desk', phone: '+234 800 000 0003' }, notes: 'Keys must be returned to the office the same day by 6 PM.' } },
    { id: 'al4', title: '3-Bedroom Terrace', type: 'Terrace', area: 'Gwarinpa', city: 'Abuja', price: 95000000, beds: 3, baths: 4, deal: 'For Sale', image: 'Terrace · Gwarinpa', key: 'In lockbox · 2290', address: '11 Gwarinpa Estate, Abuja',
      access: { method: 'lockbox', code: '2290', where: 'Lockbox on the security post at the estate gate.', contact: { name: 'Estate security', phone: '+234 800 000 0004' }, notes: 'Sign in at the estate gate — clearance has been arranged in your name.' } }
  ];

  /* Viewings the agent is assigned to host */
  const viewings = [
    { id: 'av1', listingId: 'al2', lead: 'Adaeze Okonkwo', leadPhone: '+234 800 000 0005', date: 'Today', time: '10:00 AM', status: 'Upcoming', type: 'In person', fee: 8000 },
    { id: 'av2', listingId: 'al1', lead: 'Olu Adebayo', leadPhone: '+234 800 000 0006', date: 'Today', time: '12:30 PM', status: 'Upcoming', type: 'In person', fee: 10000 },
    { id: 'av3', listingId: 'al3', lead: 'Fatima Sani', leadPhone: '+234 800 000 0007', date: 'Today', time: '3:00 PM', status: 'Upcoming', type: 'In person', fee: 12000 },
    { id: 'av4', listingId: 'al4', lead: 'Zainab Yusuf', leadPhone: '+234 800 000 0008', date: 'Tomorrow', time: '11:00 AM', status: 'Upcoming', type: 'Virtual', fee: 6000 },
    { id: 'av5', listingId: 'al1', lead: 'Chioma Nwankwo', leadPhone: '+234 800 000 0009', date: 'Yesterday', time: '2:00 PM', status: 'Completed', type: 'In person', fee: 10000, outcome: 'Interested — requested second viewing' }
  ];

  /* Field tasks assigned by the brokerage */
  const tasks = [
    { id: 'at1', title: 'Photograph living areas', listingId: 'al3', type: 'Photos', priority: 'High', due: 'Today, 5 PM', status: 'To Do', fee: 15000, note: 'Wide-angle shots of all rooms + grounds for the new listing.' },
    { id: 'at2', title: 'Collect signed mandate', listingId: 'al1', type: 'Documents', priority: 'Medium', due: 'Today', status: 'In Progress', fee: 5000, note: 'Pick up sole-agency agreement from owner Hauwa Bello.' },
    { id: 'at3', title: 'Install for-sale signage', listingId: 'al4', type: 'Signage', priority: 'Low', due: 'Tomorrow', status: 'To Do', fee: 7000, note: 'Mount brokerage signboard at the estate gate.' },
    { id: 'at4', title: 'Key handover to escrow officer', listingId: 'al1', type: 'Handover', priority: 'High', due: 'Fri 06 Jun', status: 'To Do', fee: 8000, note: 'Hand over keys once deal completes and ownership transfers.' },
    { id: 'at5', title: 'Verify property condition', listingId: 'al2', type: 'Inspection', priority: 'Medium', due: 'Done', status: 'Done', fee: 9000, note: 'Pre-listing inspection completed and report filed.' }
  ];

  /* Leads assigned to the agent to follow up */
  const leads = [
    { id: 'ad1', name: 'Adaeze Okonkwo', listingId: 'al2', intent: 'Rent', phone: '+234 800 000 0005', status: 'Viewing booked', next: 'Host viewing today 10 AM', trust: 92, hot: true },
    { id: 'ad2', name: 'Olu Adebayo', listingId: 'al1', intent: 'Buy', phone: '+234 800 000 0006', status: 'Following up', next: 'Confirm 12:30 PM viewing', trust: 88, hot: true },
    { id: 'ad3', name: 'Fatima Sani', listingId: 'al3', intent: 'Buy', phone: '+234 800 000 0007', status: 'Following up', next: 'Send villa floor plan', trust: 90, hot: false },
    { id: 'ad4', name: 'Bashir Mohammed', listingId: 'al2', intent: 'Rent', phone: '+234 800 000 0010', status: 'New', next: 'Make first contact', trust: 72, hot: false }
  ];

  /* Agent earnings — per task / per viewing fees, released by brokerage */
  const payouts = [
    { id: 'ap1', label: 'Viewing · Ikoyi Apartment', date: '28 May 2026', amount: 10000, status: 'paid' },
    { id: 'ap2', label: 'Inspection · Ikoyi Apartment', date: '27 May 2026', amount: 9000, status: 'paid' },
    { id: 'ap3', label: 'Photos · Lekki Duplex', date: '24 May 2026', amount: 15000, status: 'paid' },
    { id: 'ap4', label: 'Viewing · Lekki Duplex', date: '22 May 2026', amount: 10000, status: 'paid' }
  ];

  const activity = [
    ['calendar', 'info', 'Viewing assigned', 'Host Fatima Sani at Banana Island Villa · 3 PM', '1h ago'],
    ['camera', 'gold', 'New task', 'Photograph living areas · Banana Island Villa', '3h ago'],
    ['wallet', 'green', 'Payout received', '₦10,000 released for Ikoyi viewing', '1d ago'],
    ['check', 'green', 'Task completed', 'Pre-listing inspection · Ikoyi Apartment', '2d ago'],
    ['users', 'info', 'Lead assigned', 'Bashir Mohammed — interested in Ikoyi Apartment', '2d ago']
  ];

  const threads = [
    { id: 'agt1', name: 'Ngozi Eze', role: 'Realtor · Prime Realty', trust: 94, last: 'Great, please confirm all three viewings today.', time: '20m', unread: 1,
      messages: [{ me: false, text: 'Morning Tobi — you have three viewings today. All keys sorted?', t: '08:10' }, { me: true, text: 'Yes, lockbox codes confirmed for Lekki and Banana Island.', t: '08:14' }, { me: false, text: 'Great, please confirm all three viewings today.', t: '08:16' }] },
    { id: 'agt2', name: 'Adaeze Okonkwo', role: 'Lead · Ikoyi viewing', trust: 92, last: 'See you at 10, thank you!', time: '45m', unread: 0,
      messages: [{ me: true, text: 'Hi Adaeze, confirming your viewing today at 10 AM at 7 Bourdillon Rd.', t: '09:00' }, { me: false, text: 'See you at 10, thank you!', t: '09:05' }] },
    { id: 'agt3', name: 'Ilé Support', role: 'Support', trust: 100, last: 'Your weekly payout summary is ready.', time: '1d', unread: 0,
      messages: [{ me: false, text: 'Your field-fee payouts for this week totalling ₦44,000 have been released by Prime Realty.', t: 'Yesterday' }] }
  ];

  const nav = [
    ['chart', 'Today', 'today'], ['calendar', 'Schedule', 'schedule'], ['clipboard', 'Tasks', 'tasks'],
    ['users', 'Leads', 'leads'], ['building', 'Listings', 'listings'], ['compass', 'Find Work', 'findwork'],
    ['wallet', 'Earnings', 'earnings'], ['message', 'Messages', 'messages'], ['settings', 'Settings', 'settings']
  ];

  const findListing = id => listings.find(l => l.id === id);
  const findLead = id => leads.find(l => l.id === id);

  /* ---- Marketplace: Tobi's profile, brokerages hiring, invites, applications ---- */
  const myProfile = { name: 'Tobi Adeniyi', base: 'Lagos — Island', areas: ['Lekki', 'Ikoyi', 'Banana Island', 'Victoria Island'], rating: 4.8, completed: 142, trust: 86, feeMin: 6000, feeMax: 15000, years: 2, specialties: ['Photos', 'Documents', 'Inspection', 'Signage', 'Handover'] };

  /* Brokerages on Ilé that engage field agents */
  const brokerages = [
    { id: 'br-prime', name: 'Prime Realty', area: 'Lagos — Island', realtor: 'Ngozi Eze', rating: 4.8, trust: 94, agents: 6, openRoles: 0, feeModel: 'Per-task + viewing fees', verified: true, current: true, blurb: 'Your current brokerage. Island-focused agency handling sales and lettings across Lekki, Ikoyi and Banana Island.' },
    { id: 'br-lekki', name: 'Lekki Prime Partners', area: 'Lagos — Island', rating: 4.9, trust: 92, agents: 8, openRoles: 2, feeModel: 'Per-task + completion bonus', verified: true, blurb: 'High-end island agency. Seeking experienced agents for luxury viewings and photography.' },
    { id: 'br-lagoshomes', name: 'Lagos Homes Ltd', area: 'Lagos — Mainland', rating: 4.6, trust: 89, agents: 12, openRoles: 3, feeModel: 'Per-task', verified: true, blurb: 'Large mainland brokerage with steady volume in Ikeja, Yaba and Surulere. Always hiring reliable field agents.' },
    { id: 'br-abuja', name: 'Abuja Property Hub', area: 'Abuja', rating: 4.7, trust: 90, agents: 9, openRoles: 2, feeModel: 'Retainer ₦80k/mo + fees', verified: true, blurb: 'Capital-region agency offering a monthly retainer plus per-task fees for committed agents.' },
    { id: 'br-coastal', name: 'Coastal Estates', area: 'Port Harcourt', rating: 4.5, trust: 86, agents: 5, openRoles: 1, feeModel: 'Per-task', verified: true, blurb: 'Growing Port Harcourt agency covering GRA and Trans-Amadi. Looking to add inspection-focused agents.' }
  ];
  const brokerAreas = ['Lagos — Island', 'Lagos — Mainland', 'Abuja', 'Port Harcourt'];

  /* Invitations seeded from other brokerages (independent of the live bridge) */
  const inviteSeed = [
    { id: 'inv-lh', brokerage: 'Lagos Homes Ltd', from: 'Folake Adeyemi', area: 'Lagos — Mainland', role: 'Field agent — Mainland coverage', feeNote: '₦7k–₦15k per task', message: 'We saw your ratings on Ilé and would love you to cover viewings and document pickups for our Ikeja stock.', when: '2d ago' },
    { id: 'inv-ab', brokerage: 'Abuja Property Hub', from: 'Bashir Mohammed', area: 'Abuja', role: 'Senior field agent', feeNote: '₦80k/mo retainer + fees', message: 'Expanding our Abuja team — your inspection record is exactly what we need. Open to relocating?', when: '4d ago' }
  ];

  /* Live bridge: invitations sent by realtors (Prime Realty / Ngozi) in the Realtor app */
  const INVITE_KEY = 'grt_invites';
  function brokerInvites() {
    try {
      return (JSON.parse(localStorage.getItem(INVITE_KEY)) || []).filter(i => i.status !== 'declined').map(i => ({
        id: i.id, brokerage: i.brokerage, from: i.from, area: i.area, role: i.role,
        feeNote: i.feeNote, message: i.message, when: i.when, live: true
      }));
    } catch (e) { return []; }
  }
  function allInvites() { return brokerInvites().concat(inviteSeed); }

  /* Live bridge: applications Tobi sends to brokerages (surface in the Realtor app) */
  const APPLICATION_KEY = 'grt_applications';
  function loadApplications() { try { return JSON.parse(localStorage.getItem(APPLICATION_KEY)) || []; } catch (e) { return []; } }
  function pushApplication(app) { const a = loadApplications(); a.unshift(app); try { localStorage.setItem(APPLICATION_KEY, JSON.stringify(a)); } catch (e) {} return a; }

  const findBrokerage = id => brokerages.find(b => b.id === id);

  /* Field tasks dispatched live from the Realtor (brokerage) app via shared storage */
  const FIELD_KEY = 'grt_field_tasks';
  function dispatched() { try { return (JSON.parse(localStorage.getItem(FIELD_KEY)) || []).map(t => ({ ...t })); } catch (e) { return []; } }
  function getTasks() { return dispatched().concat(tasks.map(t => ({ ...t }))); }

  /* ---- Property access: how the agent gets in, + a shared check-in/out log ---- */
  const ACCESS_META = {
    lockbox: { icon: 'lock', label: 'Lockbox' },
    caretaker: { icon: 'user', label: 'Caretaker' },
    estate: { icon: 'shieldCheck', label: 'Estate security' },
    concierge: { icon: 'user', label: 'Concierge' },
    office: { icon: 'building', label: 'Office pickup' },
    tenant: { icon: 'user', label: 'Tenant present' }
  };
  function accessMeta(method) { return ACCESS_META[method] || { icon: 'key', label: 'Key' }; }
  /* Access for a task = whatever the brokerage attached, else the property's own access */
  function taskAccess(t) { return (t && t.access) || (t && window.AD.findListing(t.listingId) || {}).access || null; }

  const ACCESS_LOG_KEY = 'grt_access_log';
  function accessLog() { try { return JSON.parse(localStorage.getItem(ACCESS_LOG_KEY)) || []; } catch (e) { return []; } }
  function logAccess(ev) { const a = accessLog(); a.unshift(Object.assign({ id: 'acc' + Date.now(), agent: 'Tobi Adeniyi', when: 'Just now' }, ev)); try { localStorage.setItem(ACCESS_LOG_KEY, JSON.stringify(a)); } catch (e) {} return a; }

  return { naira, listings, viewings, tasks, getTasks, dispatched, leads, payouts, activity, threads, nav, findListing, findLead,
    myProfile, brokerages, brokerAreas, inviteSeed, brokerInvites, allInvites, loadApplications, pushApplication, findBrokerage,
    ACCESS_META, accessMeta, taskAccess, accessLog, logAccess };
})();
