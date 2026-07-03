function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return '₹0';
  var abs = Math.abs(n);
  var sign = n < 0 ? '-' : '';
  if (abs >= 10000000) {
    var crVal = abs / 10000000;
    if (crVal >= 1000) return sign + '₹' + indianFormat(Math.round(crVal)) + ' Cr';
    if (crVal >= 100) return sign + '₹' + Math.round(crVal) + ' Cr';
    if (crVal >= 10) return sign + '₹' + crVal.toFixed(1) + ' Cr';
    return sign + '₹' + crVal.toFixed(2) + ' Cr';
  }
  if (abs >= 100000) {
    var lVal = abs / 100000;
    if (lVal >= 100) return sign + '₹' + Math.round(lVal) + ' L';
    if (lVal >= 10) return sign + '₹' + lVal.toFixed(1) + ' L';
    return sign + '₹' + lVal.toFixed(2) + ' L';
  }
  if (abs >= 1000) return sign + '₹' + indianFormat(Math.round(abs));
  return sign + '₹' + Math.round(abs);
}

function indianFormat(num) {
  var str = String(num);
  var lastThree = str.substring(str.length - 3);
  var remaining = str.substring(0, str.length - 3);
  if (remaining !== '') lastThree = ',' + lastThree;
  return remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
}

function pct(n) { return Math.round(n * 100) + '%'; }
function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }

document.addEventListener('DOMContentLoaded', function() {
  var inputsRaw = localStorage.getItem('peepal_calc_inputs');
  var resultsRaw = localStorage.getItem('peepal_calc_results');
  if (!inputsRaw || !resultsRaw) { window.location.href = 'calculator.html'; return; }

  var inp = JSON.parse(inputsRaw);
  var r = JSON.parse(resultsRaw);
  var companyName = inp.company.name || 'Your Company';
  setText('result-company-name', companyName);

  // Hero
  if (r.totalSavings < 0) {
    document.querySelector('.results-hero .savings-label').textContent = 'Based on these inputs, Peepal would cost more than your current model.';
    setText('hero-savings', fmt(Math.abs(r.totalSavings)));
    document.querySelector('.results-hero .savings-amount').style.color = '#888';
    setText('hero-pct', Math.round(Math.abs(r.savingsPct) * 100) + '% above current spend');
    document.querySelector('.results-hero .savings-pct').style.color = 'rgba(255,255,255,0.5)';
  } else {
    setText('hero-savings', fmt(r.totalSavings));
    setText('hero-pct', pct(r.savingsPct));
  }

  // KPIs
  setText('kpi-current-cost', fmt(r.currentTotalHiringCost));
  setText('kpi-peepal-cost', fmt(r.estimatedRPOCost));
  setText('kpi-savings-abs', fmt(r.totalSavings));
  setText('kpi-savings-pct', pct(r.savingsPct));
  setText('kpi-cph-current', fmt(r.currentCostPerHire));
  setText('kpi-cph-peepal', fmt(r.newCostPerHire));

  // TTF
  if (inp.ttf.days > 0) {
    setText('kpi-ttf-current', inp.ttf.days + ' days');
    setText('kpi-ttf-peepal', r.newTTF + ' days');
    document.getElementById('kpi-ttf-card').classList.remove('hidden');
  }

  // Capacity unlock
  setText('capacity-current-prod', r.recruiterProductivityCurrent);
  setText('capacity-total-hires', r.totalHires);
  var capDesc = 'Your team currently closes ' + r.recruiterProductivityCurrent + ' hires per recruiter per year. ';
  capDesc += 'With Peepal embedded, our recruiters typically handle ~80 hires per recruiter per year across standard roles. ';
  capDesc += 'This number can vary for niche or senior positions where sourcing complexity is higher.';
  setText('capacity-desc', capDesc);

  // TTF note
  var ttfNote = document.getElementById('ttf-note');
  if (ttfNote && inp.ttf.days > 0) {
    ttfNote.textContent = 'Peepal typically reduces time to fill by ~35% for standard roles. Niche or highly specialized roles may take longer depending on market availability.';
  }

  // Cost comparison
  setText('cc-current-total', fmt(r.currentTotalHiringCost));
  setText('cc-peepal-total', fmt(r.estimatedRPOCost));
  setText('cc-payroll', fmt(r.breakdownCurrentCost.payroll));
  setText('cc-tech', fmt(r.breakdownCurrentCost.tech));
  setText('cc-vacancy', fmt(r.breakdownCurrentCost.vacancy));
  setText('cc-service-fee', fmt(r.breakdownPeepalCost.serviceFee));

  // Input summary
  setText('inp-company', companyName);
  setText('inp-industry', inp.company.industry || '--');
  setText('inp-size', inp.company.size || '--');
  setText('inp-recruiters', inp.ta.recruiters);
  setText('inp-ta-cost', fmt(inp.ta.annualCost));
  setText('inp-hires', r.totalHires);
  setText('inp-avg-ctc', fmt(r.avgCtc));
  setText('inp-tech', fmt(inp.tech.annualSpend));
  setText('inp-ttf', inp.ttf.days + ' days');
  setText('inp-vacancy', r.tracksVacancy ? fmt(inp.vacancy.costPerDay) + '/day' : 'Not tracked');

  // Methodology
  setText('m-ttf-reduction', Math.round(CONFIG.timeToFillReduction * 100) + '%');
  setText('m-fee-rate', Math.round((CONFIG.blendedFeeRate || 0.10) * 100) + '%');
  setText('m-total-hires', r.totalHires);

  // Bulk discount note
  if (r.bulkDiscount > 0) {
    setText('m-bulk-discount', fmt(r.bulkDiscount) + ' applied');
  } else {
    setText('m-bulk-discount', 'Not applicable (under 100 hires)');
  }

  // Print
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
