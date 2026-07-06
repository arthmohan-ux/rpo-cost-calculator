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
  // Card 1: cost to close unclosed roles
  if (r.unclosedRoles > 0) {
    setText('hh-unclosed-fee', fmt(r.unclosedRoleFee));
    setText('hh-unclosed-sub', r.unclosedRoles + ' roles at ' + fmt(r.avgCtc) + ' avg CTC');
  } else {
    setText('hh-unclosed-fee', '--');
    setText('hh-unclosed-sub', 'No unclosed roles entered');
    document.getElementById('hero-unclosed-card').style.opacity = '0.4';
  }
  // Card 2: total savings when Peepal handles everything
  if (r.isNetSaving) {
    setText('hh-total-savings', fmt(r.netDifference));
    setText('hh-total-sub', 'You save ' + pct(r.diffPct) + ' vs current spend');
  } else {
    setText('hh-total-savings', fmt(r.netFee));
    setText('hh-total-sub', 'For all ' + r.totalHires + ' hires at 8.33% of CTC');
  }

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
    if (r.unclosedSavings > 0) points.push(fmt(r.unclosedSavings) + ' saved by closing ' + Math.round(r.unclosedRoles * 0.8) + ' of ' + r.unclosedRoles + ' previously unfilled roles.');
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

  // --- EMAIL GATE ---
  var gateEl = document.getElementById('email-gate');
  var contentEl = document.getElementById('results-content');
  if (gateEl && contentEl) {
    contentEl.classList.add('blurred');
    document.getElementById('btn-gate-unlock').addEventListener('click', function() {
      var email = document.getElementById('gate-email').value.trim();
      if (!email || email.indexOf('@') === -1) {
        document.getElementById('gate-email').style.borderColor = 'var(--error, #e24b4a)';
        return;
      }
      unlockResults(email);
    });
    document.getElementById('btn-gate-skip').addEventListener('click', function() {
      unlockResults(null);
    });
  }

  function unlockResults(email) {
    if (email) {
      var inp = JSON.parse(localStorage.getItem('peepal_calc_inputs') || '{}');
      var gateData = {
        email: email,
        company: (inp.company && inp.company.name) || '',
        timestamp: new Date().toISOString(),
        source: 'rpo-calculator-gate'
      };
      var LEAD_ENDPOINT = 'YOUR_ENDPOINT_HERE';
      if (LEAD_ENDPOINT !== 'YOUR_ENDPOINT_HERE') {
        fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gateData), mode: 'no-cors' }).catch(function() {});
      }
      var leads = JSON.parse(localStorage.getItem('peepal_leads') || '[]');
      leads.push(gateData);
      localStorage.setItem('peepal_leads', JSON.stringify(leads));
    }
    gateEl.classList.add('hidden');
    contentEl.classList.remove('blurred');
  }

  // --- PRINT ---
  document.getElementById('btn-print-trigger').addEventListener('click', showLeadModal);
  document.getElementById('btn-modal-submit').addEventListener('click', submitLead);
  document.getElementById('btn-modal-skip').addEventListener('click', function() { hideLeadModal(); window.print(); });
});

function showLeadModal() { document.getElementById('lead-modal').classList.add('visible'); document.getElementById('modal-name').focus(); }
function hideLeadModal() { document.getElementById('lead-modal').classList.remove('visible'); }
function submitLead() {
  var name = document.getElementById('modal-name').value.trim();
  var email = document.getElementById('modal-email').value.trim();
  var phone = document.getElementById('modal-phone').value.trim();
  var inp = JSON.parse(localStorage.getItem('peepal_calc_inputs') || '{}');
  var res = JSON.parse(localStorage.getItem('peepal_calc_results') || '{}');
  var company = (inp.company && inp.company.name) || '';
  if (!name || !email) {
    document.getElementById('modal-name').style.borderColor = name ? '' : 'var(--error)';
    document.getElementById('modal-email').style.borderColor = email ? '' : 'var(--error)';
    return;
  }
  var leadData = {
    name: name,
    email: email,
    phone: phone,
    company: company,
    industry: (inp.company && inp.company.industry) || '',
    companySize: (inp.company && inp.company.size) || '',
    annualHires: res.totalHires || '',
    avgCtc: res.avgCtc ? Math.round(res.avgCtc / 100000) + 'L' : '',
    currentTotal: res.currentTotal ? fmt(res.currentTotal) : '',
    peepalTotal: res.peepalTotal ? fmt(res.peepalTotal) : '',
    isNetSaving: res.isNetSaving ? 'Yes' : 'No',
    timestamp: new Date().toISOString(),
    source: 'rpo-calculator'
  };

  // Send to configured endpoint (replace YOUR_ENDPOINT_HERE with your
  // Google Apps Script web app URL or Formspree endpoint)
  var LEAD_ENDPOINT = 'YOUR_ENDPOINT_HERE';
  if (LEAD_ENDPOINT !== 'YOUR_ENDPOINT_HERE') {
    fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
      mode: 'no-cors'
    }).catch(function() {});
  }

  // Always store locally as backup
  var leads = JSON.parse(localStorage.getItem('peepal_leads') || '[]');
  leads.push(leadData);
  localStorage.setItem('peepal_leads', JSON.stringify(leads));

  hideLeadModal();
  window.print();
}
