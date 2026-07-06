function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return '₹0';
  var abs = Math.abs(n);
  var sign = n < 0 ? '-' : '';
  if (abs >= 10000000) {
    var cr = abs / 10000000;
    if (cr >= 1000) return sign + '₹' + indianFormat(Math.round(cr)) + ' Cr';
    if (cr >= 100) return sign + '₹' + Math.round(cr) + ' Cr';
    if (cr >= 10) return sign + '₹' + cr.toFixed(1) + ' Cr';
    return sign + '₹' + cr.toFixed(2) + ' Cr';
  }
  if (abs >= 100000) {
    var l = abs / 100000;
    if (l >= 100) return sign + '₹' + Math.round(l) + ' L';
    if (l >= 10) return sign + '₹' + l.toFixed(1) + ' L';
    return sign + '₹' + l.toFixed(2) + ' L';
  }
  if (abs >= 1000) return sign + '₹' + indianFormat(Math.round(abs));
  return sign + '₹' + Math.round(abs);
}

function indianFormat(num) {
  var s = String(num);
  var last = s.substring(s.length - 3);
  var rest = s.substring(0, s.length - 3);
  if (rest !== '') last = ',' + last;
  return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + last;
}

function pct(n) { return Math.round(n * 100) + '%'; }
function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }

document.addEventListener('DOMContentLoaded', function() {
  var inputsRaw = localStorage.getItem('peepal_calc_inputs');
  var resultsRaw = localStorage.getItem('peepal_calc_results');
  if (!inputsRaw || !resultsRaw) { window.location.href = 'calculator.html'; return; }

  var inp = JSON.parse(inputsRaw);
  var r = JSON.parse(resultsRaw);
  var company = inp.company.name || 'Your Company';
  setText('result-company-name', company);

  // --- HERO ---
  var heroLabel = document.getElementById('hero-label');
  var heroAmount = document.getElementById('hero-savings');
  var heroSub = document.getElementById('hero-sub');

  if (r.isNetSaving) {
    heroLabel.textContent = 'Estimated annual savings with Peepal';
    heroAmount.textContent = fmt(r.netDifference);
    heroAmount.style.color = '#F27C22';
    heroSub.innerHTML = 'That is <span style="color:#F27C22">' + pct(r.diffPct) + '</span> of your current hiring spend';
  } else {
    heroLabel.textContent = 'Your hiring cost analysis';
    heroAmount.textContent = fmt(r.peepalTotal);
    heroAmount.style.color = '#F27C22';
    heroSub.innerHTML = 'Full-capacity RPO for all ' + r.totalHires + ' roles. See the breakdown below.';
  }

  // --- HERO HIGHLIGHT CARDS ---
  // Card 1: savings from closing unclosed roles
  if (r.unclosedRoles > 0 && r.unclosedSavings > 0) {
    setText('hh-unclosed-fee', fmt(r.unclosedSavings));
    setText('hh-unclosed-sub', 'You save ' + fmt(r.unclosedSavings) + ' on ' + r.unclosedRoles + ' roles');
  } else if (r.unclosedRoles > 0) {
    setText('hh-unclosed-fee', fmt(r.unclosedRoleFee));
    setText('hh-unclosed-sub', r.unclosedRoles + ' roles closed for ' + fmt(r.unclosedRoleFee));
  } else {
    setText('hh-unclosed-fee', '--');
    setText('hh-unclosed-sub', 'No unclosed roles entered');
    document.getElementById('hero-unclosed-card').style.opacity = '0.4';
  }
  // Card 2: total savings when Peepal handles all hiring
  if (r.isNetSaving) {
    setText('hh-total-savings', fmt(r.netDifference));
    setText('hh-total-sub', 'You save ' + pct(r.diffPct) + ' on your total hiring spend');
  } else {
    setText('hh-total-savings', fmt(r.peepalTotal));
    setText('hh-total-sub', 'All ' + r.totalHires + ' hires handled by Peepal');
  }

  // --- EXPLAIN FURTHER (Groq AI) ---
  var explanations = { unclosed: '', total: '' };

  function toggleExplain(btnId, bodyId, textId, type) {
    var btn = document.getElementById(btnId);
    var body = document.getElementById(bodyId);
    var textEl = document.getElementById(textId);

    btn.addEventListener('click', function() {
      var isOpen = btn.classList.contains('active');
      btn.classList.toggle('active');
      body.classList.toggle('hidden');

      // Generate on first open
      if (!isOpen && !explanations[type]) {
        textEl.innerHTML = 'Thinking<span class="loading-dots"></span>';
        generateExplanation(type, r, inp, function(text) {
          explanations[type] = text;
          textEl.textContent = text;
        });
      }
    });
  }

  toggleExplain('btn-explain-unclosed', 'explain-unclosed', 'explain-unclosed-text', 'unclosed');
  toggleExplain('btn-explain-total', 'explain-total', 'explain-total-text', 'total');

  // --- KPIs ---
  setText('kpi-current-cost', fmt(r.currentTotal));
  setText('kpi-peepal-cost', fmt(r.peepalTotal));
  setText('kpi-cph-current', fmt(r.currentCPH));
  setText('kpi-cph-peepal', fmt(r.peepalCPH));

  // Savings or delta card
  var savingsCard = document.getElementById('kpi-savings-card');
  if (r.isNetSaving) {
    setText('kpi-savings-label', 'ANNUAL SAVINGS');
    setText('kpi-savings-abs', fmt(r.netDifference));
    setText('kpi-savings-pct-label', 'of current spend');
    setText('kpi-savings-pct', pct(r.diffPct));
  } else {
    // Reframe: show what's included for the investment, not just the delta
    setText('kpi-savings-label', 'INCLUDES');
    var includes = [];
    if (r.techAbsorbed > 0) includes.push(fmt(r.techAbsorbed) + ' tech absorbed');
    if (r.vacancySavings > 0) includes.push(fmt(r.vacancySavings) + ' vacancy saved');
    includes.push('dedicated sourcing team');
    setText('kpi-savings-abs', includes[0] || 'Full sourcing stack');
    setText('kpi-savings-pct-label', includes.length > 1 ? '+ ' + (includes.length - 1) + ' more benefits' : 'included in engagement');
    setText('kpi-savings-pct', '');
  }

  // TTF
  if (inp.ttf.days > 0) {
    setText('kpi-ttf-current', inp.ttf.days + ' days');
    setText('kpi-ttf-peepal', r.newTTF + ' days');
    document.getElementById('kpi-ttf-card').classList.remove('hidden');
  }

  // --- VALUE STORY (always show - valuable for BD in both cases) ---
  var valueSection = document.getElementById('value-story-section');
  {
    valueSection.classList.remove('hidden');
    var points = [];
    points.push('Peepal takes over your full hiring function, replacing internal TA team, recruitment technology, and agency spend.');
    if (r.techAbsorbed > 0) points.push(fmt(r.techAbsorbed) + ' in recruitment tech costs are absorbed by Peepal under a standard engagement.');
    if (r.vacancySavings > 0) points.push('Vacancy cost drops by ' + fmt(r.vacancySavings) + ' from a 35% reduction in time to fill.');
    if (r.unclosedSavings > 0) points.push('Peepal closes your ' + r.unclosedRoles + ' unclosed roles, saving ' + fmt(r.unclosedSavings) + ' in vacancy costs.');
    if (inp.ttf.days > 0) points.push('Time to fill drops from ' + inp.ttf.days + ' to ~' + r.newTTF + ' days. For niche roles, this may vary.');
    points.push('Your ' + inp.ta.recruiters + ' recruiter' + (inp.ta.recruiters > 1 ? 's' : '') + ' currently close ' + r.recruiterProductivity + ' hires per year each. Peepal can handle up to ~80 hires per recruiter per year for standard roles if needed.');
    var valueList = document.getElementById('value-points');
    valueList.innerHTML = '';
    for (var i = 0; i < points.length; i++) {
      var li = document.createElement('li');
      li.textContent = points[i];
      valueList.appendChild(li);
    }
  }

  // --- CAPACITY ---
  setText('capacity-current-prod', r.recruiterProductivity);
  var capDesc = 'Your team currently closes ' + r.recruiterProductivity + ' hires per recruiter per year. ';
  capDesc += 'Peepal recruiters typically handle ~80 hires per recruiter per year for standard roles. ';
  capDesc += 'This varies for niche or senior positions where sourcing complexity is higher.';
  setText('capacity-desc', capDesc);

  // --- COST BREAKDOWN ---
  setText('cc-current-total', fmt(r.currentTotal));
  setText('cc-peepal-total', fmt(r.peepalTotal));
  setText('cc-ta-current', fmt(r.currentTA));
  setText('cc-tech-current', fmt(r.currentTech));
  setText('cc-vacancy-current', fmt(r.currentVacancyCost));
  setText('cc-fee-peepal', fmt(r.netFee));
  setText('cc-vacancy-peepal', fmt(r.peepalVacancyCost));
  // Unclosed roles rows
  if (r.unclosedRoles > 0) {
    setText('cc-unclosed-current', fmt(r.unclosedCost));
    document.getElementById('cc-unclosed-row').classList.remove('hidden');
    setText('cc-unclosed-peepal', fmt(r.peepalUnclosedCost));
    document.getElementById('cc-unclosed-peepal-row').classList.remove('hidden');
  }

  // --- INPUT SUMMARY ---
  setText('inp-company', company);
  setText('inp-industry', inp.company.industry || '--');
  setText('inp-size', inp.company.size || '--');
  setText('inp-recruiters', inp.ta.recruiters);
  setText('inp-ta-cost', fmt(inp.ta.annualCost));
  setText('inp-hires', r.totalHires);
  if (r.unclosedRoles > 0) {
    setText('inp-unclosed', r.unclosedRoles);
    document.getElementById('inp-unclosed-row').classList.remove('hidden');
  }
  setText('inp-avg-ctc', fmt(r.avgCtc));
  // Show experience level without revealing the fee percentage
  var expLabels = { junior: '0-5 years', mixed: 'Mixed levels', senior: '10+ years' };
  setText('inp-exp', expLabels[inp.hiring.expLevel] || '--');
  setText('inp-tech', fmt(inp.tech.annualSpend));
  setText('inp-ttf', inp.ttf.days + ' days');
  setText('inp-vacancy', r.tracksVacancy ? '₹' + Math.round(inp.vacancy.costPerDay).toLocaleString('en-IN') + '/day' : 'Not tracked');

  // --- METHODOLOGY ---
  setText('m-total-hires', r.totalHires);
  // Don't expose fee rates - show experience tier instead
  var tierLabels = { junior: 'Junior (0-5 yrs)', mixed: 'Mixed levels', senior: 'Senior (10+ yrs)' };
  setText('m-fee-rate', tierLabels[inp.hiring.expLevel] || 'Standard');
  setText('m-ttf-reduction', Math.round(CONFIG.timeToFillReduction * 100) + '%');
  if (r.bulkDiscount > 0) {
    setText('m-bulk-discount', fmt(r.bulkDiscount) + ' applied');
  } else {
    setText('m-bulk-discount', 'Not applicable (under 100 hires)');
  }
  if (r.unclosedRoles > 0) {
    setText('m-unclosed-rate', '80% closed by Peepal (' + r.unclosedRoles + ' roles)');
    document.getElementById('m-unclosed-row').classList.remove('hidden');
  }

  // --- SHARED STATE ---
  var _gateEmail = '';        // email from gate, carried to modal
  var _modalAction = 'print'; // 'print' or 'talk'

  // --- EMAIL GATE ---
  var gateEl = document.getElementById('email-gate');
  var contentEl = document.getElementById('results-content');
  if (gateEl && contentEl) {
    contentEl.classList.add('blurred');

    // Unlock button
    document.getElementById('btn-gate-unlock').addEventListener('click', function() {
      var email = document.getElementById('gate-email').value.trim();
      if (!email || email.indexOf('@') === -1) {
        document.getElementById('gate-email').style.borderColor = 'var(--error, #e24b4a)';
        return;
      }
      _gateEmail = email;
      unlockResults(email);
    });

    // Skip button -> show confirmation
    var skipBtn = document.getElementById('btn-gate-skip');
    var confirmEl = document.getElementById('gate-confirm');
    skipBtn.addEventListener('click', function() {
      skipBtn.style.display = 'none';
      confirmEl.classList.remove('hidden');
    });
    document.getElementById('btn-confirm-skip').addEventListener('click', function() {
      unlockResults(null);
    });
    document.getElementById('btn-confirm-back').addEventListener('click', function() {
      confirmEl.classList.add('hidden');
      skipBtn.style.display = '';
      document.getElementById('gate-email').focus();
    });
  }

  function unlockResults(email) {
    if (email) {
      var payload = buildLeadPayload(email, '', '', 'email-gate');
      sendLead(payload);
    }
    gateEl.classList.add('hidden');
    contentEl.classList.remove('blurred');
  }

  function ensureUnblurred() {
    if (gateEl) gateEl.classList.add('hidden');
    if (contentEl) contentEl.classList.remove('blurred');
  }

  // --- UNIFIED MODAL ---
  function openModal(action) {
    _modalAction = action;
    // Pre-fill email from gate if available
    var emailField = document.getElementById('modal-email');
    if (_gateEmail && !emailField.value) emailField.value = _gateEmail;
    // Context-aware labels
    var titleEl = document.getElementById('modal-title');
    var subEl = document.getElementById('modal-subtitle');
    var submitBtn = document.getElementById('btn-modal-submit');
    var skipBtn = document.getElementById('btn-modal-skip');
    var thanksEl = document.getElementById('modal-thanks');
    thanksEl.classList.add('hidden');
    if (action === 'talk') {
      titleEl.textContent = 'Talk to our team';
      subEl.textContent = 'Share your details and we\'ll reach out with a proposal.';
      submitBtn.textContent = 'Get in touch';
      skipBtn.style.display = 'none';
    } else {
      titleEl.textContent = 'Get your full report';
      subEl.textContent = 'Share your details and print immediately after.';
      submitBtn.textContent = 'Print my report';
      skipBtn.style.display = '';
    }
    document.getElementById('lead-modal').classList.add('visible');
    document.getElementById('modal-name').focus();
  }

  // Print report button
  document.getElementById('btn-print-trigger').addEventListener('click', function() {
    openModal('print');
  });

  // Talk to Peepal button
  document.getElementById('btn-talk-peepal').addEventListener('click', function() {
    openModal('talk');
  });

  // Modal submit
  document.getElementById('btn-modal-submit').addEventListener('click', function() {
    var name = document.getElementById('modal-name').value.trim();
    var email = document.getElementById('modal-email').value.trim();
    var phone = document.getElementById('modal-phone').value.trim();
    if (!name || !email) {
      document.getElementById('modal-name').style.borderColor = name ? '' : 'var(--error)';
      document.getElementById('modal-email').style.borderColor = email ? '' : 'var(--error)';
      return;
    }
    // Store for cross-fill
    _gateEmail = email;
    var source = _modalAction === 'talk' ? 'talk-to-peepal' : 'print-report';
    var payload = buildLeadPayload(email, name, phone, source);
    sendLead(payload);

    if (_modalAction === 'talk') {
      // Show thank you, auto-close after 2s
      document.getElementById('modal-thanks').classList.remove('hidden');
      setTimeout(function() {
        document.getElementById('lead-modal').classList.remove('visible');
        document.getElementById('modal-thanks').classList.add('hidden');
      }, 2000);
    } else {
      document.getElementById('lead-modal').classList.remove('visible');
      ensureUnblurred();
      window.print();
    }
  });

  // Modal skip (print only, hidden for talk)
  document.getElementById('btn-modal-skip').addEventListener('click', function() {
    document.getElementById('lead-modal').classList.remove('visible');
    ensureUnblurred();
    window.print();
  });

  // --- INTERCEPT Ctrl+P / Cmd+P ---
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
      e.preventDefault();
      openModal('print');
    }
  });

  // Also catch window.onbeforeprint for right-click > Print
  var _printAllowed = false;
  window.addEventListener('beforeprint', function(e) {
    if (!_printAllowed) {
      // Can't fully cancel beforeprint, but we ensure content is unblurred
      ensureUnblurred();
    }
  });
});

// --- GROQ AI EXPLANATIONS ---

// Cache so we can include in the sheet payload
var _explanationCache = { unclosed: '', total: '' };

function generateExplanation(type, r, inp, callback) {
  var endpoint = CONFIG.leadEndpoint;
  if (!endpoint || endpoint === 'YOUR_ENDPOINT_HERE') {
    callback('Configure your Apps Script endpoint in config.js to enable AI explanations.');
    return;
  }

  var prompt;
  if (type === 'unclosed') {
    prompt = 'You are explaining a simple cost calculation to a business leader in India. Keep it to 3 sentences max. Use plain language, no jargon.\n\n'
      + 'Their company had ' + r.unclosedRoles + ' roles that went unfilled last year. '
      + 'Each open role costs roughly ' + fmt(Math.round(inp.vacancy.costPerDay)) + ' per day in lost productivity. '
      + 'These roles stayed open for at least ' + Math.max(inp.ttf.days || 0, 90) + ' days. '
      + 'That cost them ' + fmt(r.unclosedCost) + ' in total. '
      + 'Peepal would close most of these roles, bringing that vacancy cost down to ' + fmt(r.peepalUnclosedCost) + ', '
      + 'saving ' + fmt(r.unclosedSavings) + '.\n\n'
      + 'Explain this simply. Start with "Your X unclosed roles..." Use the rupee figures provided. Do not use bullet points.';
  } else {
    prompt = 'You are explaining a hiring cost comparison to a business leader in India. Keep it to 4 sentences max. Use plain language, no jargon.\n\n'
      + 'Current annual hiring costs:\n'
      + '- TA team payroll: ' + fmt(r.currentTA) + '\n'
      + '- Recruitment technology: ' + fmt(r.currentTech) + '\n'
      + '- Vacancy cost (open roles losing productivity): ' + fmt(r.currentVacancyCost) + '\n'
      + (r.unclosedCost > 0 ? '- Unclosed roles vacancy: ' + fmt(r.unclosedCost) + '\n' : '')
      + '- Total: ' + fmt(r.currentTotal) + '\n\n'
      + 'With Peepal (takes over full hiring function, no TA or tech needed):\n'
      + '- Peepal fee (' + r.totalHires + ' hires x ' + fmt(r.avgCtc) + ' avg CTC x 8.33%): ' + fmt(r.netFee) + '\n'
      + (r.bulkDiscount > 0 ? '- Bulk discount applied: ' + fmt(r.bulkDiscount) + '\n' : '')
      + '- Reduced vacancy cost (35% faster hiring): ' + fmt(r.peepalVacancyCost) + '\n'
      + (r.peepalUnclosedCost > 0 ? '- Residual unclosed cost: ' + fmt(r.peepalUnclosedCost) + '\n' : '')
      + '- Total: ' + fmt(r.peepalTotal) + '\n\n'
      + (r.isNetSaving
        ? 'Net savings: ' + fmt(r.netDifference) + ' (' + Math.round(r.diffPct * 100) + '% less).\n'
        : 'Peepal costs ' + fmt(Math.abs(r.netDifference)) + ' more but replaces entire TA function.\n')
      + '\nExplain this comparison simply. Start with "Right now, your company spends..." Use the rupee figures provided. Do not use bullet points.';
  }

  // Proxy through Apps Script (Groq key is server-side)
  fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ _action: 'explain', prompt: prompt })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    var text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    text = text || 'Could not generate explanation.';
    _explanationCache[type] = text;
    callback(text);
  })
  .catch(function() {
    callback('Could not connect to AI service.');
  });
}

// --- LEAD COLLECTION HELPERS ---

function buildLeadPayload(email, name, phone, source) {
  var inp = JSON.parse(localStorage.getItem('peepal_calc_inputs') || '{}');
  var res = JSON.parse(localStorage.getItem('peepal_calc_results') || '{}');
  return {
    timestamp: new Date().toISOString(),
    email: email || '',
    name: name || '',
    phone: phone || '',
    company: (inp.company && inp.company.name) || '',
    industry: (inp.company && inp.company.industry) || '',
    companySize: (inp.company && inp.company.size) || '',
    source: source || 'rpo-calculator',
    // Inputs
    recruiters: inp.ta ? inp.ta.recruiters : '',
    taCost: inp.ta ? inp.ta.annualCost : '',
    annualHires: res.totalHires || '',
    unclosedRoles: res.unclosedRoles || 0,
    avgCtc: res.avgCtc || '',
    expLevel: res.expLevel || '',
    techSpend: inp.tech ? inp.tech.annualSpend : '',
    ttfDays: inp.ttf ? inp.ttf.days : '',
    vacancyCostPerDay: inp.vacancy ? inp.vacancy.costPerDay : '',
    // Current state
    currentTotal: res.currentTotal || '',
    currentTA: res.currentTA || '',
    currentTech: res.currentTech || '',
    currentVacancy: res.currentVacancyCost || '',
    currentUnclosed: res.unclosedCost || 0,
    cphCurrent: res.currentCPH || '',
    // Peepal
    peepalTotal: res.peepalTotal || '',
    peepalFee: res.netFee || '',
    bulkDiscount: res.bulkDiscount || 0,
    peepalVacancy: res.peepalVacancyCost || '',
    peepalUnclosed: res.peepalUnclosedCost || 0,
    cphPeepal: res.peepalCPH || '',
    newTTF: res.newTTF || '',
    // Result
    netSavings: res.netDifference || '',
    savingsPct: res.diffPct ? Math.round(res.diffPct * 100) + '%' : '',
    peepalWins: res.isNetSaving ? 'Yes' : 'No',
    vacancySavings: res.vacancySavings || '',
    unclosedSavings: res.unclosedSavings || 0,
    techAbsorbed: res.techAbsorbed || '',
    // AI explanations (if user clicked "explain further")
    explainUnclosed: _explanationCache.unclosed || '',
    explainTotal: _explanationCache.total || ''
  };
}

function sendLead(payload) {
  // Send to Google Sheet
  var endpoint = CONFIG.leadEndpoint;
  if (endpoint && endpoint !== 'YOUR_ENDPOINT_HERE') {
    fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
      mode: 'no-cors'
    }).catch(function() {});
  }
  // Always store locally as backup
  var leads = JSON.parse(localStorage.getItem('peepal_leads') || '[]');
  leads.push(payload);
  localStorage.setItem('peepal_leads', JSON.stringify(leads));
}

