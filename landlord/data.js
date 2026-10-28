/* Ilé Landlord — mock data (Nigerian market) */
window.LD = (function () {
  const naira = n => '₦' + Number(n).toLocaleString('en-NG');

  const properties = [
    { id: 'lp1', name: 'Admiralty Court', type: 'Apartment Block', area: 'Lekki Phase 1', city: 'Lagos', units: 6, occupied: 5, verified: true, rentPerUnit: 4800000, image: 'Apartment Block · Lekki' },
    { id: 'lp2', name: 'Gwarinpa Terraces', type: 'Terrace Duplex', area: 'Gwarinpa', city: 'Abuja', units: 4, occupied: 4, verified: true, rentPerUnit: 3600000, image: 'Terrace · Gwarinpa' },
    { id: 'lp3', name: 'Ikoyi Heights', type: 'Luxury Flats', area: 'Ikoyi', city: 'Lagos', units: 3, occupied: 2, verified: true, rentPerUnit: 9500000, image: 'Luxury Flats · Ikoyi' },
    { id: 'lp4', name: 'Wuse Garden Court', type: 'Flat', area: 'Wuse 2', city: 'Abuja', units: 5, occupied: 3, verified: false, rentPerUnit: 2400000, image: 'Flats · Wuse 2' }
  ];

  const units = {
    lp1: [
      { no: 'A1', beds: 3, tenant: 'Adaeze Okonkwo', status: 'Occupied', rent: 4800000, due: 'paid', leaseEnd: '31 Jul 2026' },
      { no: 'A2', beds: 3, tenant: 'Tunde Bakare', status: 'Occupied', rent: 4800000, due: 'paid', leaseEnd: '14 Sep 2026' },
      { no: 'B1', beds: 2, tenant: 'Zainab Yusuf', status: 'Occupied', rent: 4200000, due: 'due', leaseEnd: '02 Jun 2026' },
      { no: 'B2', beds: 2, tenant: 'Kelechi Obi', status: 'Occupied', rent: 4200000, due: 'overdue', leaseEnd: '20 Aug 2026' },
      { no: 'C1', beds: 3, tenant: 'Fatima Sani', status: 'Occupied', rent: 4800000, due: 'paid', leaseEnd: '11 Nov 2026' },
      { no: 'C2', beds: 3, tenant: null, status: 'Vacant', rent: 4800000, due: '', leaseEnd: '' }
    ]
  };

  const tenants = [
    { id: 't1', name: 'Adaeze Okonkwo', unit: 'Admiralty Court · A1', trust: 92, verified: true, status: 'paid', rent: 4800000, since: 'Aug 2025', phone: '+234 800 000 0005', email: 'adaeze.o@example.com', payHistory: [['Aug 2025', 4800000, 'paid'], ['Deposit', 2400000, 'paid']], maintHistory: 2 },
    { id: 't2', name: 'Tunde Bakare', unit: 'Admiralty Court · A2', trust: 78, verified: true, status: 'paid', rent: 4800000, since: 'Sep 2024', phone: '+234 800 000 0010', email: 'tunde.b@example.com', payHistory: [['Sep 2025', 4800000, 'paid']], maintHistory: 0 },
    { id: 't3', name: 'Zainab Yusuf', unit: 'Admiralty Court · B1', trust: 84, verified: true, status: 'due', rent: 4200000, since: 'Jun 2025', phone: '+234 800 000 0008', email: 'zainab.y@example.com', payHistory: [['Jun 2025', 4200000, 'paid']], maintHistory: 1 },
    { id: 't4', name: 'Kelechi Obi', unit: 'Admiralty Court · B2', trust: 58, verified: false, status: 'overdue', rent: 4200000, since: 'Aug 2025', phone: '+234 800 000 0011', email: 'kelechi.o@example.com', payHistory: [['Aug 2025', 4200000, 'overdue']], maintHistory: 0 },
    { id: 't5', name: 'Fatima Sani', unit: 'Admiralty Court · C1', trust: 90, verified: true, status: 'paid', rent: 4800000, since: 'Nov 2024', phone: '+234 800 000 0007', email: 'fatima.s@example.com', payHistory: [['Nov 2025', 4800000, 'paid']], maintHistory: 0 },
    { id: 't6', name: 'Emeka Eze', unit: 'Gwarinpa Terraces · 1', trust: 81, verified: true, status: 'paid', rent: 3600000, since: 'Jan 2025', phone: '+234 800 000 0012', email: 'emeka.e@example.com', payHistory: [['Jan 2026', 3600000, 'paid']], maintHistory: 1 }
  ];

  // rent collection rows
  const rentRows = [
    { id: 'r1', tenant: 'Adaeze Okonkwo', unit: 'Admiralty Court · A1', amount: 4800000, due: '01 Aug 2026', status: 'paid', escrow: 'released' },
    { id: 'r2', tenant: 'Tunde Bakare', unit: 'Admiralty Court · A2', amount: 4800000, due: '14 Sep 2026', status: 'paid', escrow: 'released' },
    { id: 'r3', tenant: 'Zainab Yusuf', unit: 'Admiralty Court · B1', amount: 4200000, due: '02 Jun 2026', status: 'due', escrow: 'pending' },
    { id: 'r4', tenant: 'Kelechi Obi', unit: 'Admiralty Court · B2', amount: 4200000, due: '20 May 2026', status: 'overdue', escrow: 'pending' },
    { id: 'r5', tenant: 'Fatima Sani', unit: 'Admiralty Court · C1', amount: 4800000, due: '11 Nov 2026', status: 'paid', escrow: 'held' },
    { id: 'r6', tenant: 'Emeka Eze', unit: 'Gwarinpa Terraces · 1', amount: 3600000, due: '15 Jan 2027', status: 'paid', escrow: 'released' }
  ];

  const payouts = [
    { id: 'po1', date: '02 Aug 2025', amount: 4800000, property: 'Admiralty Court · A1', ref: 'GRT-PO-88201', status: 'completed' },
    { id: 'po2', date: '16 Sep 2025', amount: 4800000, property: 'Admiralty Court · A2', ref: 'GRT-PO-88455', status: 'completed' },
    { id: 'po3', date: '12 Nov 2025', amount: 4800000, property: 'Admiralty Court · C1', ref: 'GRT-PO-89102', status: 'completed' },
    { id: 'po4', date: '18 Jan 2026', amount: 3600000, property: 'Gwarinpa Terraces · 1', ref: 'GRT-PO-90233', status: 'completed' }
  ];

  const maintenance = [
    { id: 'lm1', title: 'Leaking kitchen tap', property: 'Admiralty Court · A1', tenant: 'Adaeze Okonkwo', category: 'Plumbing', status: 'In Progress', priority: 'Medium', created: '22 May 2026', sla: 36, vendor: 'AquaFix Services', desc: 'Cold water tap drips continuously even when closed.' },
    { id: 'lm2', title: 'AC not cooling (living room)', property: 'Admiralty Court · B1', tenant: 'Zainab Yusuf', category: 'HVAC', status: 'Assigned', priority: 'High', created: '25 May 2026', sla: 8, vendor: 'CoolAir Technicians', desc: 'Split unit runs but blows warm air.' },
    { id: 'lm3', title: 'Broken window latch', property: 'Gwarinpa Terraces · 1', tenant: 'Emeka Eze', category: 'Structural', status: 'New', priority: 'Low', created: '28 May 2026', sla: 70, vendor: null, desc: 'Bedroom window will not lock fully.' },
    { id: 'lm4', title: 'Faulty gate intercom', property: 'Admiralty Court · C1', tenant: 'Fatima Sani', category: 'Security', status: 'Resolved', priority: 'Medium', created: '04 May 2026', sla: 0, vendor: 'Estate Facility', desc: 'Intercom at main gate not connecting.' }
  ];

  const applications = [
    { id: 'la1', applicant: 'Chioma Nwankwo', unit: 'Admiralty Court · C2', trust: 88, verified: true, income: 1800000, when: '27 May 2026', status: 'New' },
    { id: 'la2', applicant: 'Bashir Mohammed', unit: 'Wuse Garden Court · 3', trust: 72, verified: true, income: 950000, when: '24 May 2026', status: 'Reviewing' },
    { id: 'la3', applicant: 'Grace Effiong', unit: 'Wuse Garden Court · 4', trust: 65, verified: false, income: 720000, when: '21 May 2026', status: 'New' }
  ];

  const vendors = ['AquaFix Services', 'CoolAir Technicians', 'BrightSpark Electricals', 'Estate Facility', 'SecureFix Locks', 'GreenThumb Gardens'];

  // revenue by month (₦ '000)
  const revenue = [
    { m: 'Dec', v: 14.4 }, { m: 'Jan', v: 18.0 }, { m: 'Feb', v: 14.4 }, { m: 'Mar', v: 19.2 },
    { m: 'Apr', v: 14.4 }, { m: 'May', v: 23.7 }
  ];
  const expenses = [
    { cat: 'Maintenance & repairs', amount: 1850000, pct: 42 },
    { cat: 'Service charge', amount: 1200000, pct: 27 },
    { cat: 'Property tax', amount: 680000, pct: 15 },
    { cat: 'Insurance', amount: 420000, pct: 10 },
    { cat: 'Other', amount: 280000, pct: 6 }
  ];

  const activity = [
    ['wallet', 'green', 'Rent payment received', 'Fatima Sani paid ₦4,800,000 · Admiralty Court C1', '2h ago'],
    ['file', 'info', 'New rental application', 'Chioma Nwankwo applied for Admiralty Court C2', '5h ago'],
    ['wrench', 'warn', 'Maintenance assigned', 'CoolAir Technicians assigned to AC issue · B1', '1d ago'],
    ['shieldCheck', 'green', 'Escrow released', '₦4,800,000 released to your payout account', '2d ago'],
    ['alertTriangle', 'warn', 'Rent overdue', 'Kelechi Obi · Admiralty Court B2 · 9 days late', '2d ago']
  ];

  const threads = [
    { id: 'lt0', name: 'Ngozi Eze', role: 'Managing agent · Prime Realty', trust: 94, last: 'Approved the water heater — AquaFix booked for Thursday.', time: '30m', unread: 1,
      messages: [{ me: false, text: 'Quick update on Gwarinpa Terraces: all rent in except Unit 3, which I’m chasing. Quarterly inspection passed.', t: 'Mon 10:00' }, { me: true, text: 'Thanks Ngozi. Go ahead on the Unit 2 water heater.', t: 'Mon 10:15' }, { me: false, text: 'Approved the water heater — AquaFix booked for Thursday.', t: 'Mon 10:18' }] },    { id: 'lt1', name: 'Adaeze Okonkwo', role: 'Tenant · A1', trust: 92, last: 'Thank you, the plumber came today.', time: '1h', unread: 1,
      messages: [{ me: false, text: 'Hello, the kitchen tap is still dripping.', t: 'Mon 09:00' }, { me: true, text: 'I have assigned AquaFix Services. They will come Thursday.', t: 'Mon 09:20' }, { me: false, text: 'Thank you, the plumber came today.', t: 'Thu 14:10' }] },
    { id: 'lt2', name: 'Kelechi Obi', role: 'Tenant · B2', trust: 58, last: 'I will pay by Friday, sorry for the delay.', time: '6h', unread: 0,
      messages: [{ me: true, text: 'Hi Kelechi, your rent is 9 days overdue. Please advise.', t: 'Tue 10:00' }, { me: false, text: 'I will pay by Friday, sorry for the delay.', t: 'Tue 16:30' }] },
    { id: 'lt3', name: 'Ilé Support', role: 'Support', trust: 100, last: 'Your payout of ₦4,800,000 is on the way.', time: '2d', unread: 0,
      messages: [{ me: false, text: 'Your escrow release was approved. Payout of ₦4,800,000 is processing.', t: 'Sat 11:00' }] }
  ];

  const documents = [
    { id: 'ld1', name: 'Certificate of Occupancy — Admiralty Court', type: 'Title', date: '12 Jan 2024', size: '2.4 MB', verified: true },
    { id: 'ld2', name: 'Tenancy Agreement — A1 (Adaeze)', type: 'Lease', date: '28 Jul 2025', size: '420 KB', verified: true },
    { id: 'ld3', name: 'Property Insurance Certificate', type: 'Insurance', date: '01 Mar 2026', size: '310 KB', verified: true },
    { id: 'ld4', name: 'Q1 2026 Income Statement', type: 'Financial', date: '02 Apr 2026', size: '880 KB', verified: true }
  ];

  const nav = [
    ['chart', 'Portfolio', 'dashboard'], ['building', 'Properties', 'properties'], ['briefcase', 'Managed', 'managed'], ['users', 'Tenants', 'tenants'],
    ['file', 'Applications', 'applications'], ['wallet', 'Rent Collection', 'rent'], ['wrench', 'Maintenance', 'maintenance'],
    ['trend', 'Financials', 'financials'], ['message', 'Messages', 'messages'], ['doc', 'Documents', 'documents'], ['settings', 'Settings', 'settings']
  ];

  const totalUnits = properties.reduce((s, p) => s + p.units, 0);
  const totalOccupied = properties.reduce((s, p) => s + p.occupied, 0);

  return { naira, properties, units, tenants, rentRows, payouts, maintenance, applications, vendors, revenue, expenses, activity, threads, documents, nav, totalUnits, totalOccupied, findTenant: id => tenants.find(t => t.id === id), findProp: id => properties.find(p => p.id === id) };
})();
