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
    heroLabel.textContent = 'Annual cost comparison';
    heroAmount.textContent = fmt(Math.abs(r.netDifference));
    heroAmount.style.color = '#ffffff';
    heroSub.innerHTML = 'Peepal costs <span style="color:#F27C22">' + fmt(Math.abs(r.netDifference)) + ' more</span> per year. Here is what changes.';
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
    setText('kpi-savings-label', 'ADDITIONAL INVESTMENT');
    setText('kpi-savings-abs', fmt(Math.abs(r.netDifference)));
    document.getElementById('kpi-savings-abs').style.color = 'var(--black)';
    setText('kpi-savings-pct-label', 'above current spend');
    setText('kpi-savings-pct', pct(r.diffPct));
  }

  // TTF
  if (inp.ttf.days > 0) {
    setText('kpi-ttf-current', inp.ttf.days + ' days');
    setText('kpi-ttf-peepal', r.newTTF + ' days');
    document.getElementById('kpi-ttf-card').classList.remove('hidden');
  }

  // --- VALUE STORY (shows when Peepal costs more) ---
  var valueSection = document.getElementById('value-story-section');
  if (!r.isNetSaving) {
    valueSection.classList.remove('hidden');
    var points = [];
    if (r.techAbsorbed > 0) points.push('₹' + Math.round(r.techAbsorbed / 100000) + 'L in recruitment tech costs are absorbed by Peepal under a standard engagement.');
    if (r.vacancySavings > 0) points.push('Vacancy cost drops by ' + fmt(r.vacancySavings) + ' from a 35% reduction in time to fill.');
    if (inp.ttf.days > 0) points.push('Time to fill drops from ' + inp.ttf.days + ' to ~' + r.newTTF + ' days. For niche roles, this may vary.');
    points.push('Your ' + inp.ta.recruiters + ' recruiter' + (inp.ta.recruiters > 1 ? 's' : '') + ' currently close ' + r.recruiterProductivity + ' hires per year each. Peepal handles ~80 hires per recruiter per year for standard roles, freeing your team for stakeholder work, offer experience, and internal mobility.');
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
  setText('cc-ta-peepal', fmt(r.currentTA));
  setText('cc-fee-peepal', fmt(r.netFee));
  setText('cc-vacancy-peepal', fmt(r.peepalVacancyCost));

  // --- INPUT SUMMARY ---
  setText('inp-company', company);
  setText('inp-industry', inp.company.industry || '--');
  setText('inp-size', inp.company.size || '--');
  setText('inp-recruiters', inp.ta.recruiters);
  setText('inp-ta-cost', fmt(inp.ta.annualCost));
  setText('inp-hires', r.totalHires);
  setText('inp-avg-ctc', fmt(r.avgCtc));
  setText('inp-exp', CONFIG.feeLabels[inp.hiring.expLevel] || '--');
  setText('inp-tech', fmt(inp.tech.annualSpend));
  setText('inp-ttf', inp.ttf.days + ' days');
  setText('inp-vacancy', r.tracksVacancy ? fmt(inp.vacancy.costPerDay) + '/day' : 'Not tracked');

  // --- METHODOLOGY ---
  setText('m-total-hires', r.totalHires);
  setText('m-fee-rate', CONFIG.feeLabels[inp.hiring.expLevel] || '10%');
  setText('m-ttf-reduction', Math.round(CONFIG.timeToFillReduction * 100) + '%');
  if (r.bulkDiscount > 0) {
    setText('m-bulk-discount', fmt(r.bulkDiscount) + ' applied');
  } else {
    setText('m-bulk-discount', 'Not applicable (under 100 hires)');
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
  var company = JSON.parse(localStorage.getItem('peepal_calc_inputs')).company.name || '';
  if (!name || !email) {
    document.getElementById('modal-name').style.borderColor = name ? '' : 'var(--error)';
    document.getElementById('modal-email').style.borderColor = email ? '' : 'var(--error)';
    return;
  }
  console.log('Lead captured:', { name: name, email: email, phone: phone, company: company, timestamp: new Date().toISOString() });
  hideLeadModal();
  window.print();
}
