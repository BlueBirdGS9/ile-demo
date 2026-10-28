/* Ilé Design System — render dynamic content */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

  /* ---------- TOC ---------- */
  var toc = [
    { group: 'Foundations', items: [['color','Color'],['type','Typography'],['spacing','Spacing & Shape'],['icons','Iconography']] },
    { group: 'Components', items: [['buttons','Buttons & Inputs'],['trust','Verification & Trust'],['property','Property Card'],['escrow','Escrow Timeline'],['states','Loading / Empty / Error'],['nav-modal','Navigation & Modal']] }
  ];
  var tocEl = $('#toc');
  toc.forEach(function (g) {
    var grp = el('<div class="toc-group"><h4>' + g.group + '</h4></div>');
    g.items.forEach(function (it) {
      var a = el('<a class="toc-link" href="#' + it[0] + '">' + it[1] + '</a>');
      grp.appendChild(a);
    });
    tocEl.appendChild(grp);
  });

  /* ---------- Toast / copy ---------- */
  var toastT;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 1600);
  }

  /* ---------- Color swatches ---------- */
  var brand = [['--green-50','#ECF6F1'],['--green-100','#D2EBE1'],['--green-200','#A6D6C4'],['--green-300','#6FBBA1'],['--green-400','#389C7E'],['--green-500','#167F62'],['--green-600','#0E5A47'],['--green-700','#0B4839'],['--green-800','#08372B'],['--green-900','#052019'],['--gold-500','#B8862F']];
  var ink = [['--ink-900','#14201B'],['--ink-700','#3A453F'],['--ink-500','#6A756F'],['--ink-400','#8B958F'],['--ink-300','#B6BFB9'],['--ink-200','#DCE2DE'],['--ink-100','#EEF1EF'],['--ink-50','#F5F7F5'],['--paper','#FBFCFB'],['--surface','#FFFFFF']];
  var sem = [['--success','#15935F'],['--success-bg','#E6F5EE'],['--warning','#C77D0A'],['--warning-bg','#FBF0DC'],['--error','#CF3B36'],['--error-bg','#FBE9E8'],['--info','#2563B8'],['--info-bg','#E7F0FB'],['--escrow','#5B3FD6'],['--escrow-bg','#ECE8FB']];
  function renderSwatches(target, arr) {
    var c = $(target);
    arr.forEach(function (s) {
      var border = (s[1] === '#FFFFFF' || s[1] === '#FBFCFB' || s[1] === '#F5F7F5') ? ';border:1px solid var(--ink-150)' : '';
      var card = el('<div class="sw-card"><div class="sw-chip" style="background:' + s[1] + border + '"></div><div class="sw-info"><div class="sw-name">' + s[0].replace('--','') + '</div><div class="sw-hex">' + s[1] + '</div></div></div>');
      card.onclick = function () { navigator.clipboard && navigator.clipboard.writeText('var(' + s[0] + ')'); toast('Copied  var(' + s[0] + ')'); };
      c.appendChild(card);
    });
  }
  renderSwatches('#sw-brand', brand);
  renderSwatches('#sw-ink', ink);
  renderSwatches('#sw-sem', sem);

  /* ---------- Type scale ---------- */
  var typeScale = [
    ['Display','44 / 700','var(--text-display)','Find a home you can trust'],
    ['Heading 1','32 / 700','var(--text-h1)','Your rent is due in 6 days'],
    ['Heading 2','24 / 700','var(--text-h2)','Escrow-protected payment'],
    ['Heading 3','20 / 600','var(--text-h3)','Verified landlord · Lekki Phase 1'],
    ['Heading 4','17 / 600','var(--text-h4)','3-Bedroom Apartment'],
    ['Body Large','18 / 400','var(--text-body-lg)','Trust is the core of every transaction.'],
    ['Body','15 / 400','var(--text-body)','Your deposit is held securely until both parties confirm.'],
    ['Caption','13 / 500','var(--text-caption)','Last verified 12 May 2026'],
    ['Mono · figures','15 / IBM Plex','font:var(--text-body);font-family:var(--font-mono)','₦4,250,000.00']
  ];
  var ts = $('#type-scale');
  typeScale.forEach(function (t) {
    ts.appendChild(el('<div class="type-row"><div class="type-meta"><b>' + t[0] + '</b>' + t[1] + '</div><div style="font:' + t[2] + ';color:var(--ink-900)">' + t[3] + '</div></div>'));
  });

  /* ---------- Spacing ---------- */
  var sp = [['--sp-1',4],['--sp-2',8],['--sp-3',12],['--sp-4',16],['--sp-5',20],['--sp-6',24],['--sp-8',32],['--sp-10',40],['--sp-12',48],['--sp-16',64]];
  var spc = $('#sp-scale');
  sp.forEach(function (s) {
    spc.appendChild(el('<div class="sp-row"><span class="sp-label">' + s[0].replace('--','') + ' · ' + s[1] + 'px</span><div class="sp-bar" style="width:' + s[1] + 'px"></div></div>'));
  });

  /* ---------- Radii + shadows ---------- */
  var radii = [['sm','6px'],['md','10px'],['lg','14px'],['xl','20px'],['2xl','28px'],['pill','999px']];
  var rc = $('#radii');
  radii.forEach(function (r) { rc.appendChild(el('<div class="box-demo" style="border-radius:var(--r-' + r[0] + ')">' + r[1] + '</div>')); });
  var shadows = [['xs','--shadow-xs'],['sm','--shadow-sm'],['md','--shadow-md'],['lg','--shadow-lg']];
  var shc = $('#shadows');
  shadows.forEach(function (s) { shc.appendChild(el('<div class="box-demo" style="box-shadow:var(' + s[1] + ');border-radius:10px;border-color:transparent">shadow-' + s[0] + '</div>')); });

  /* ---------- Icons ---------- */
  var ig = $('#icon-grid');
  Object.keys(window.ICONS).forEach(function (name) {
    ig.appendChild(el('<div class="icon-cell">' + window.icon(name) + '<span>' + name + '</span></div>'));
  });

  /* ---------- Verification badges ---------- */
  var vb = $('#vbadges');
  vb.appendChild(el('<span class="vbadge vbadge--verified">' + window.icon('shieldCheck') + 'Verified</span>'));
  vb.appendChild(el('<span class="vbadge vbadge--pending">' + window.icon('clock') + 'Pending review</span>'));
  vb.appendChild(el('<span class="vbadge vbadge--unverified">' + window.icon('shield') + 'Unverified</span>'));

  /* ---------- Chips ---------- */
  var chips = [['paid','Paid'],['due','Due'],['overdue','Overdue'],['progress','In progress'],['resolved','Resolved'],['escrow','In escrow'],['draft','Draft']];
  var ch = $('#chips');
  chips.forEach(function (c) { ch.appendChild(el('<span class="chip chip--' + c[0] + '"><span class="dot"></span>' + c[1] + '</span>')); });

  /* ---------- Avatars ---------- */
  var avs = [['AO','Adaeze Okonkwo','Renter','green'],['CN','Chidi Nwosu','Landlord','gold'],['BA','Bisi Adeyemi','Realtor','info']];
  var av = $('#avatars');
  avs.forEach(function (a) {
    var bg = a[3] === 'gold' ? 'background:var(--gold-100);color:var(--gold-600)' : a[3] === 'info' ? 'background:var(--info-bg);color:var(--info-text)' : '';
    av.appendChild(el('<div class="avatar-block"><div class="avatar" style="' + bg + '">' + a[0] + '</div><div class="avatar-meta"><span class="avatar-name">' + a[1] + '</span><span class="avatar-role">' + a[2] + '</span></div></div>'));
  });

  /* ---------- Trust scores ---------- */
  function trustRing(val, tier, color) {
    return '<div class="trust"><div class="trust-ring" style="--val:' + val + ';--score-color:' + color + ';position:relative"><div class="inner">' + val + '</div></div><div class="trust-meta"><span class="trust-label">Trust score</span><span class="trust-tier">' + tier + '</span></div></div>';
  }
  var trs = $('#trust-scores');
  trs.appendChild(el(trustRing(92, 'Excellent', 'var(--success)')));
  trs.appendChild(el(trustRing(74, 'Good', 'var(--gold-500)')));
  trs.appendChild(el(trustRing(38, 'At risk', 'var(--error)')));

  /* ---------- Property card states ---------- */
  function propCardSuccess() {
    return '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(248px,1fr))">' +
      pcard('3-Bedroom Apartment','Lekki Phase 1, Lagos','₦4,800,000','/yr', true, true) +
      pcard('2-Bedroom Flat','Wuse 2, Abuja','₦2,400,000','/yr', false, false) +
      pcard('Detached Duplex','GRA, Port Harcourt','₦7,200,000','/yr', true, true) +
      '</div>';
  }
  function pcard(title, loc, price, per, verified, saved) {
    return '<div class="pcard"><div class="pcard-media"><div class="pcard-img" style="background:repeating-linear-gradient(135deg,var(--ink-100),var(--ink-100) 10px,var(--ink-50) 10px,var(--ink-50) 20px);display:grid;place-items:center"><span style="font-family:var(--font-mono);font-size:.7rem;color:var(--ink-400)">property photo</span></div>' +
      '<div class="pcard-tags">' + (verified ? '<span class="vbadge vbadge--verified" style="background:rgba(255,255,255,.95)">' + window.icon('shieldCheck') + 'Verified</span>' : '<span class="vbadge vbadge--pending" style="background:rgba(255,255,255,.95)">' + window.icon('clock') + 'Pending</span>') +
      '<button class="pcard-fav' + (saved ? ' is-saved' : '') + '">' + window.icon('heart') + '</button></div></div>' +
      '<div class="pcard-body"><div class="pcard-price">' + price + '<span class="per">' + per + '</span></div>' +
      '<div class="pcard-title">' + title + '</div>' +
      '<div class="pcard-loc">' + window.icon('mapPin') + loc + '</div>' +
      '<div class="pcard-specs"><span>' + window.icon('bed') + '3 Beds</span><span>' + window.icon('bath') + '3 Baths</span><span>' + window.icon('ruler') + '180m²</span></div></div></div>';
  }
  function propCardLoading() {
    var one = '<div class="pcard"><div class="skeleton" style="aspect-ratio:16/11;border-radius:0"></div><div class="pcard-body"><div class="skeleton sk-line" style="width:55%;height:18px"></div><div class="skeleton sk-line" style="width:80%"></div><div class="skeleton sk-line" style="width:50%"></div><div class="skeleton sk-line" style="width:70%;margin-top:8px"></div></div></div>';
    return '<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(248px,1fr))">' + one + one + one + '</div>';
  }
  function propCardEmpty() {
    return '<div class="state state--empty"><div class="state-icon">' + window.icon('search') + '</div><div class="state-title">No properties match your filters</div><div class="state-desc">Try widening your budget range or removing a filter to see more verified listings.</div><div class="state-actions"><button class="btn btn-secondary btn-sm">Clear filters</button><button class="btn btn-primary btn-sm">Save this search</button></div></div>';
  }
  function propCardError() {
    return '<div class="state state--error"><div class="state-icon">' + window.icon('wifiOff') + '</div><div class="state-title">Couldn\'t load listings</div><div class="state-desc">Check your connection and try again. Your filters and saved homes are safe.</div><div class="state-actions"><button class="btn btn-primary btn-sm">Retry</button></div></div>';
  }
  var pStates = { success: propCardSuccess, loading: propCardLoading, empty: propCardEmpty, error: propCardError };
  function renderPState(s) { $('#pcard-stage').innerHTML = pStates[s](); }
  renderPState('success');

  /* state tabs (generic) */
  document.querySelectorAll('.state-tabs').forEach(function (tabs) {
    tabs.addEventListener('click', function (e) {
      var btn = e.target.closest('.state-tab'); if (!btn) return;
      tabs.querySelectorAll('.state-tab').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (tabs.dataset.target === 'pcard-stage') renderPState(btn.dataset.state);
    });
  });

  /* ---------- Escrow demo ---------- */
  var steps = [
    ['done','Offer accepted','Both parties agreed terms','12 May, 09:24'],
    ['done','Deposit to escrow','₦4,250,000 secured by Ilé','12 May, 11:08'],
    ['active','Document verification','Title & C of O under review','In progress'],
    ['todo','Final payment','Balance released on completion',''],
    ['todo','Ownership transfer','Certificate issued to buyer','']
  ];
  var ed = $('#escrow-demo');
  steps.forEach(function (s) {
    var nodeInner = s[0] === 'done' ? window.icon('check') : s[0] === 'active' ? '<span class="dot" style="width:8px;height:8px;background:var(--escrow);border-radius:50%"></span>' : '';
    ed.appendChild(el('<div class="escrow-step escrow-step--' + s[0] + '"><div class="escrow-rail"><div class="escrow-node">' + nodeInner + '</div><div class="escrow-line"></div></div><div class="escrow-body"><div class="escrow-title">' + s[1] + '</div><div class="escrow-desc">' + s[2] + '</div>' + (s[3] ? '<div class="escrow-time">' + s[3] + '</div>' : '') + '</div></div>'));
  });

  /* ---------- Empty + Error demos in states section ---------- */
  var stateDemos = document.querySelectorAll('#states .demo');
  stateDemos[1].innerHTML = propCardEmpty();
  stateDemos[2].innerHTML = '<div class="state state--error"><div class="state-icon">' + window.icon('alertCircle') + '</div><div class="state-title">Payment failed</div><div class="state-desc">Your bank declined the transfer. No funds left your account. Try another method.</div><div class="state-actions"><button class="btn btn-secondary btn-sm">Change method</button><button class="btn btn-primary btn-sm">Try again</button></div></div>';

  /* ---------- Demo sidebar ---------- */
  var navItems = [
    ['compass','Discover',false,''],['bookmark','Saved',false,''],['file','Applications',false,''],
    ['key','My Lease',true,''],['wallet','Payments',false,'1'],['wrench','Maintenance',false,''],
    ['message','Messages',false,'3'],['doc','Documents',false,''],['star','Reviews',false,''],['settings','Settings',false,'']
  ];
  var sb = $('#demo-sidebar');
  sb.appendChild(el('<div class="sidebar-brand"><span class="ile-mark"></span><span class="ile-word">Ile</span></div>'));
  var nav = el('<nav class="nav"></nav>');
  nav.appendChild(el('<div class="nav-section">Renter</div>'));
  navItems.forEach(function (n) {
    var badge = n[3] ? '<span class="badge">' + n[3] + '</span>' : '';
    nav.appendChild(el('<a class="nav-item' + (n[2] ? ' active' : '') + '">' + window.icon(n[0]) + n[1] + badge + '</a>'));
  });
  sb.appendChild(nav);
  var foot = el('<div style="padding:12px;border-top:1px solid var(--ink-100)"></div>');
  foot.appendChild(el('<div class="avatar-block" style="padding:6px 10px"><div class="avatar avatar--sm">AO</div><div class="avatar-meta"><span class="avatar-name">Adaeze O.</span><span class="avatar-role">Trust 92 · Verified</span></div></div>'));
  sb.appendChild(foot);

  /* ---------- Scrollspy ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc-link'));
  var secs = links.map(function (l) { return document.getElementById(l.getAttribute('href').slice(1)); });
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (l) { l.classList.remove('active'); });
        var i = secs.indexOf(e.target);
        if (i >= 0) links[i].classList.add('active');
      }
    });
  }, { rootMargin: '-10% 0px -80% 0px' });
  secs.forEach(function (s) { if (s) obs.observe(s); });

  links.forEach(function (l) {
    l.addEventListener('click', function (e) {
      e.preventDefault();
      var t = document.getElementById(l.getAttribute('href').slice(1));
      if (t) window.scrollTo({ top: t.offsetTop - 8, behavior: 'smooth' });
    });
  });

  /* close modal on scrim click */
  $('#demoModal').addEventListener('click', function (e) { if (e.target === this) this.style.display = 'none'; });
})();
