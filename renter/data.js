/* Ilé Renter — mock data (Nigerian market) */
window.RD = (function () {
  const naira = n => '₦' + n.toLocaleString('en-NG');

  const properties = [
    { id: 'p1', title: '3-Bedroom Apartment', type: 'Apartment', area: 'Lekki Phase 1', city: 'Lagos', price: 4800000, beds: 3, baths: 3, sqm: 180, furnished: true, pet: false, verified: true, rating: 4.8, reviews: 24, distance: '2.1 km', owner: { name: 'Chidi Nwosu', verified: true, trust: 92, since: '2021' }, amenities: ['24/7 Power', 'Borehole + Treatment', 'Estate Security', 'Parking (2 cars)', 'POP Ceiling', 'Fitted Kitchen'], desc: 'Bright, newly-renovated 3-bedroom apartment in a serviced estate. Constant power, treated water and gated security. Walking distance to schools and shopping.' },
    { id: 'p2', title: '2-Bedroom Flat', type: 'Flat', area: 'Wuse 2', city: 'Abuja', price: 2400000, beds: 2, baths: 2, sqm: 120, furnished: false, pet: true, verified: true, rating: 4.6, reviews: 17, distance: '4.8 km', owner: { name: 'Hauwa Bello', verified: true, trust: 86, since: '2022' }, amenities: ['Estate Security', 'Borehole', 'Parking', 'Balcony'], desc: 'Spacious 2-bedroom flat in a quiet, well-maintained estate in the heart of Wuse 2. Pet-friendly with a generous balcony.' },
    { id: 'p3', title: 'Detached Duplex', type: 'Duplex', area: 'GRA', city: 'Port Harcourt', price: 7200000, beds: 4, baths: 5, sqm: 320, furnished: true, pet: true, verified: true, rating: 4.9, reviews: 31, distance: '6.2 km', owner: { name: 'Emeka Okafor', verified: true, trust: 95, since: '2020' }, amenities: ['24/7 Power', 'Swimming Pool', 'BQ', 'CCTV', 'Garden', 'Parking (4 cars)'], desc: 'Luxurious detached duplex with private garden, pool and boys-quarters. Premium GRA location with round-the-clock security.' },
    { id: 'p4', title: 'Mini Flat (Studio)', type: 'Studio', area: 'Yaba', city: 'Lagos', price: 1200000, beds: 1, baths: 1, sqm: 55, furnished: false, pet: false, verified: false, rating: 4.2, reviews: 9, distance: '1.4 km', owner: { name: 'Tunde Bakare', verified: false, trust: 61, since: '2023' }, amenities: ['Prepaid Meter', 'Water', 'Tiled Floors'], desc: 'Compact, affordable studio close to the tech hub and university. Ideal for young professionals and students.' },
    { id: 'p5', title: '3-Bedroom Terrace', type: 'Terrace', area: 'Gwarinpa', city: 'Abuja', price: 3600000, beds: 3, baths: 4, sqm: 200, furnished: false, pet: true, verified: true, rating: 4.7, reviews: 21, distance: '9.0 km', owner: { name: 'Ngozi Eze', verified: true, trust: 88, since: '2021' }, amenities: ['Estate Security', '24/7 Power', 'Parking', 'BQ', 'Borehole'], desc: 'Modern terrace duplex in the largest estate in West Africa. Family-friendly with playgrounds and constant utilities.' },
    { id: 'p6', title: '4-Bedroom Semi-Detached', type: 'Duplex', area: 'Ikeja GRA', city: 'Lagos', price: 6500000, beds: 4, baths: 4, sqm: 280, furnished: true, pet: false, verified: true, rating: 4.8, reviews: 28, distance: '7.3 km', owner: { name: 'Funke Adekunle', verified: true, trust: 90, since: '2020' }, amenities: ['24/7 Power', 'CCTV', 'BQ', 'Fitted Kitchen', 'Parking (3 cars)', 'Garden'], desc: 'Elegant semi-detached duplex in prestigious Ikeja GRA. Fully fitted and serviced with excellent security.' },
    { id: 'p7', title: '1-Bedroom Apartment', type: 'Apartment', area: 'Maitama', city: 'Abuja', price: 2800000, beds: 1, baths: 2, sqm: 90, furnished: true, pet: false, verified: true, rating: 4.5, reviews: 14, distance: '5.1 km', owner: { name: 'Sadiq Aliyu', verified: true, trust: 84, since: '2022' }, amenities: ['24/7 Power', 'Gym', 'Parking', 'Concierge'], desc: 'Serviced 1-bedroom in a premium Maitama tower with gym and concierge. All-inclusive, move-in ready.' },
    { id: 'p8', title: '2-Bedroom Bungalow', type: 'Bungalow', area: 'New GRA', city: 'Port Harcourt', price: 1900000, beds: 2, baths: 2, sqm: 110, furnished: false, pet: true, verified: false, rating: 4.1, reviews: 6, distance: '8.7 km', owner: { name: 'Ibrahim Sani', verified: false, trust: 58, since: '2024' }, amenities: ['Water', 'Parking', 'Fenced Compound'], desc: 'Affordable standalone bungalow with private compound and parking. Quiet residential neighbourhood.' }
  ];

  const lease = {
    propertyId: 'p1', title: '3-Bedroom Apartment', address: '14 Admiralty Way, Lekki Phase 1, Lagos',
    landlord: 'Chidi Nwosu', landlordTrust: 92, status: 'Active',
    start: '01 Aug 2025', end: '31 Jul 2026', rent: 4800000, deposit: 2400000,
    renewal: 'Auto-renew offer 60 days before expiry', nextDue: '2026-08-01', nextAmount: 4800000
  };

  const payments = [
    { id: 'pay1', period: 'Aug 2025 – Jul 2026', amount: 4800000, date: '28 Jul 2025', status: 'paid', method: 'Bank Transfer', ref: 'GRT-PAY-20259' },
    { id: 'pay2', period: 'Security Deposit', amount: 2400000, date: '28 Jul 2025', status: 'paid', method: 'Bank Transfer', ref: 'GRT-PAY-20231' },
    { id: 'pay3', period: 'Aug 2026 – Jul 2027 (Renewal)', amount: 4800000, date: 'Due 01 Aug 2026', status: 'due', method: '—', ref: '—' }
  ];

  const maintenance = [
    { id: 'm1', title: 'Leaking kitchen tap', category: 'Plumbing', status: 'In Progress', created: '22 May 2026', vendor: 'AquaFix Services', desc: 'Cold water tap drips continuously even when fully closed.', photos: 1 },
    { id: 'm2', title: 'AC not cooling (living room)', category: 'Electrical / HVAC', status: 'Assigned', created: '25 May 2026', vendor: 'CoolAir Technicians', desc: 'Split unit runs but blows warm air. Possibly low on gas.', photos: 2 },
    { id: 'm3', title: 'Faulty gate intercom', category: 'Security', status: 'Resolved', created: '04 May 2026', vendor: 'Estate Facility', desc: 'Intercom at main gate not connecting to apartment.', photos: 0 }
  ];

  const threads = [
    { id: 't1', name: 'Chidi Nwosu', role: 'Landlord', trust: 92, last: 'The plumber will come on Thursday morning.', time: '2h', unread: 1,
      messages: [
        { me: false, text: 'Hello Adaeze, I received your maintenance request for the kitchen tap.', t: 'Mon 09:12' },
        { me: true, text: 'Thank you! It has been dripping for two days now.', t: 'Mon 09:30' },
        { me: false, text: 'No problem. I have assigned AquaFix Services.', t: 'Mon 09:34' },
        { me: false, text: 'The plumber will come on Thursday morning.', t: 'Mon 09:35' }
      ] },
    { id: 't2', name: 'Ilé Support', role: 'Support', trust: 100, last: 'Your escrow deposit was confirmed ✓', time: '1d', unread: 0,
      messages: [
        { me: false, text: 'Your escrow deposit of ₦2,400,000 was confirmed and is held securely.', t: 'Sun 14:02' },
        { me: true, text: 'Great, thank you for confirming.', t: 'Sun 14:20' }
      ] },
    { id: 't3', name: 'Bisi Adeyemi', role: 'Agent', trust: 81, last: 'Would Saturday 2pm work for the viewing?', time: '3d', unread: 0,
      messages: [
        { me: false, text: 'Hi! I can arrange a viewing for the Wuse 2 flat.', t: 'Fri 11:00' },
        { me: false, text: 'Would Saturday 2pm work for the viewing?', t: 'Fri 11:01' }
      ] }
  ];

  const documents = [
    { id: 'd1', name: 'Tenancy Agreement 2025–2026', type: 'Lease', date: '28 Jul 2025', size: '420 KB', verified: true },
    { id: 'd2', name: 'Rent Payment Receipt', type: 'Receipt', date: '28 Jul 2025', size: '180 KB', verified: true },
    { id: 'd3', name: 'Security Deposit Receipt', type: 'Receipt', date: '28 Jul 2025', size: '176 KB', verified: true },
    { id: 'd4', name: 'Property Inspection Report', type: 'Report', date: '30 Jul 2025', size: '1.2 MB', verified: true },
    { id: 'd5', name: 'Escrow Confirmation Letter', type: 'Escrow', date: '28 Jul 2025', size: '120 KB', verified: true }
  ];

  const nav = [
    ['chart', 'Dashboard', 'dashboard'], ['compass', 'Discover', 'discover'], ['bookmark', 'Saved', 'saved'], ['file', 'Applications', 'applications'],
    ['key', 'My Lease', 'lease'], ['wallet', 'Payments', 'payments'], ['wrench', 'Maintenance', 'maintenance'],
    ['message', 'Messages', 'messages'], ['doc', 'Documents', 'documents'], ['star', 'Reviews', 'reviews'], ['settings', 'Settings', 'settings']
  ];

  return { naira, properties, lease, payments, maintenance, threads, documents, nav, find: id => properties.find(p => p.id === id) };
})();
