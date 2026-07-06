var TOTAL_STEPS = 6;
var currentStep = 1;
var completedSteps = {};

var TRANSITION_MESSAGES = {
  1: function() {
    return 'Got it. Setting up your profile...';
  },
  2: function() {
    var bench = getBenchmark();
    var recruiters = parseInt(document.getElementById('recruiters').value) || 0;
    var taCost = parseFloat(document.getElementById('ta-cost').value) || 0;
    if (recruiters > 0 && taCost > 0) return 'Team of ' + recruiters + ' at ' + fmtApprox(taCost * 100000) + '/year logged. Let\'s look at your hiring volume.';
    return 'Got it. Calculating your current hiring cost...';
  },
  3: function() {
    var total = parseInt(document.getElementById('total-hires-input').value) || 0;
    return 'You are planning ' + total + ' hires this year. Running your comparison...';
  },
  4: function() { return 'Tech spend logged. Peepal absorbs this under a standard engagement.'; }
};

function getIndustry() { return document.getElementById('industry').value || 'your sector'; }

function getBenchmark() {
  var industry = document.getElementById('industry').value;
  var sizeEl = document.querySelector('input[name="company_size"]:checked');
  if (!sizeEl) return null;
  var size = sizeEl.value;
  if (industry && size && CONFIG.benchmarks[industry] && CONFIG.benchmarks[industry][size]) return CONFIG.benchmarks[industry][size];
  return null;
}

function fmtApprox(n) {
  if (!n || isNaN(n)) return '₹0';
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + ' Cr';
  if (n >= 100000) return '₹' + (n / 100000).toFixed(0) + ' L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

function getTTFDays() {
  var checked = document.querySelector('input[name="ttf_preset"]:checked');
  if (!checked) return 0;
  if (checked.value === 'custom') return parseInt(document.getElementById('ttf-custom-val').value) || 0;
  return parseInt(checked.value);
}

function validateStep(step) {
  clearErrors();
  var valid = true;
  if (step === 1) {
    if (!document.getElementById('company-name').value.trim()) { showError('company-name', 'Required'); valid = false; }
    if (!document.getElementById('industry').value) { showError('industry', 'Select an industry'); valid = false; }
    if (!document.querySelector('input[name="company_size"]:checked')) { showError('company-size-group', 'Select a size'); valid = false; }
  }
  if (step === 2) {
    if (!(parseInt(document.getElementById('recruiters').value) >= 1)) { showError('recruiters', 'Enter at least 1'); valid = false; }
    if (!(parseFloat(document.getElementById('ta-cost').value) > 0)) { showError('ta-cost', 'Enter your team cost'); valid = false; }
  }
  if (step === 3) {
    if (!(parseInt(document.getElementById('total-hires-input').value) >= 1)) { showError('total-hires-input', 'Enter number of hires'); valid = false; }
    if (!(parseFloat(document.getElementById('avg-ctc').value) > 0)) { showError('avg-ctc', 'Enter average CTC'); valid = false; }
    if (!document.querySelector('input[name="exp_level"]:checked')) { showError('exp-level-group', 'Select experience level'); valid = false; }
  }
  if (step === 5) {
    var checked = document.querySelector('input[name="ttf_preset"]:checked');
    if (!checked) { showError('ttf-presets-group', 'Select a time to fill'); valid = false; }
    else if (checked.value === 'custom') {
      if (!(parseInt(document.getElementById('ttf-custom-val').value) >= 61)) { showError('ttf-custom-val', 'Enter a value above 60'); valid = false; }
    }
  }
  return valid;
}

function showError(fieldId, msg) {
  var field = document.getElementById(fieldId);
  if (field) field.classList.add('has-error');
  var errEl = document.createElement('span');
  errEl.className = 'text-error field-error';
  errEl.textContent = msg;
  var parent = field ? (field.closest('.field') || field.parentElement) : document.querySelector('[data-step="' + currentStep + '"]');
  if (parent) parent.appendChild(errEl);
}

function clearErrors() {
  var els = document.querySelectorAll('.has-error');
  for (var i = 0; i < els.length; i++) els[i].classList.remove('has-error');
  var errs = document.querySelectorAll('.field-error');
  for (var i = 0; i < errs.length; i++) errs[i].remove();
}

function updateProgressBar() {
  var pct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
  document.querySelector('.progress-bar-fill').style.width = pct + '%';
  document.querySelector('.step-label').textContent = 'Step ' + currentStep + ' of ' + TOTAL_STEPS;
  var dots = document.querySelectorAll('.step-dot');
  for (var i = 0; i < dots.length; i++) {
    dots[i].classList.remove('active', 'completed');
    if (i + 1 === currentStep) dots[i].classList.add('active');
    else if (completedSteps[i + 1]) dots[i].classList.add('completed');
  }
}

function autoFillVacancyCost() {
  var industry = document.getElementById('industry').value || 'Other';
  var expEl = document.querySelector('input[name="exp_level"]:checked');
  var expLevel = expEl ? expEl.value : 'mixed';
  var avgCtc = (parseFloat(document.getElementById('avg-ctc').value) || 12) * 100000;
  var multipliers = CONFIG.vacancyMultipliers[industry] || CONFIG.vacancyMultipliers['Other'];
  var multiplier = multipliers[expLevel] || multipliers.mixed;
  // Daily CTC equivalent × industry multiplier, rounded to nearest 500
  var dailyCTC = avgCtc / 260;
  var vacancyCost = Math.round((dailyCTC * multiplier) / 500) * 500;
  var field = document.getElementById('vacancy-cost-day');
  // Only auto-fill if user hasn't manually edited it
  if (!field.dataset.userEdited) {
    field.value = vacancyCost;
  }
  // Update hint with explanation
  var hint = document.getElementById('vacancy-hint');
  if (hint) {
    hint.textContent = 'Based on ' + fmtApprox(avgCtc) + ' CTC in ' + industry + ' (' + multiplier + 'x daily salary). Adjust if needed.';
  }
}

function showStep(step) {
  var cards = document.querySelectorAll('.step-card');
  for (var i = 0; i < cards.length; i++) cards[i].classList.remove('active');
  var target = document.querySelector('.step-card[data-step="' + step + '"]');
  if (target) target.classList.add('active');
  currentStep = step;
  updateProgressBar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (step === 5) updateTTFBenchmark();
  if (step === 6) autoFillVacancyCost();
}

function showTransitionMessage(step, callback) {
  var msgFn = TRANSITION_MESSAGES[step];
  if (!msgFn) { callback(); return; }
  var overlay = document.getElementById('progress-overlay');
  document.getElementById('overlay-msg').textContent = msgFn();
  overlay.classList.add('visible');
  setTimeout(function() { overlay.classList.remove('visible'); setTimeout(callback, 200); }, 1400);
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  completedSteps[currentStep] = true;
  var next = currentStep + 1;
  if (next > TOTAL_STEPS) { goToResults(); return; }
  if (TRANSITION_MESSAGES[currentStep]) {
    showTransitionMessage(currentStep, function() { showStep(next); });
  } else { showStep(next); }
}

function prevStep() { if (currentStep > 1) showStep(currentStep - 1); }
function jumpToStep(step) { if (completedSteps[step] || step === currentStep) showStep(step); }

function updateTTFBenchmark() {
  var bench = getBenchmark();
  var chip = document.getElementById('ttf-benchmark-chip');
  if (bench && chip) {
    chip.textContent = 'Companies like yours typically take ' + bench.ttf + ' days';
    chip.classList.remove('hidden');
  }
}

function collectInputs() {
  var parseLakh = function(id) { return (parseFloat(document.getElementById(id).value) || 0) * 100000; };
  return {
    company: {
      name: document.getElementById('company-name').value.trim(),
      industry: document.getElementById('industry').value,
      size: document.querySelector('input[name="company_size"]:checked').value
    },
    ta: {
      recruiters: parseInt(document.getElementById('recruiters').value) || 0,
      annualCost: parseLakh('ta-cost')
    },
    hiring: {
      totalHires: parseInt(document.getElementById('total-hires-input').value) || 0,
      unclosedRoles: parseInt(document.getElementById('unclosed-roles').value) || 0,
      avgCtc: (parseFloat(document.getElementById('avg-ctc').value) || 0) * 100000,
      expLevel: document.querySelector('input[name="exp_level"]:checked').value
    },
    tech: { annualSpend: parseLakh('tech-spend') },
    ttf: { days: getTTFDays() },
    vacancy: {
      tracksIt: true,
      costPerDay: parseFloat(document.getElementById('vacancy-cost-day').value) || 0
    }
  };
}

function goToResults() {
  if (!validateStep(currentStep)) return;
  var inputs = collectInputs();
  var results = calculate(inputs);
  localStorage.setItem('peepal_calc_inputs', JSON.stringify(inputs));
  localStorage.setItem('peepal_calc_results', JSON.stringify(results));
  window.location.href = 'results.html';
}

document.addEventListener('DOMContentLoaded', function() {
  var dots = document.querySelectorAll('.step-dot');
  for (var i = 0; i < dots.length; i++) (function(idx) { dots[idx].addEventListener('click', function() { jumpToStep(idx + 1); }); })(i);
  var nextBtns = document.querySelectorAll('.btn-next');
  for (var i = 0; i < nextBtns.length; i++) nextBtns[i].addEventListener('click', nextStep);
  var backBtns = document.querySelectorAll('.btn-back');
  for (var i = 0; i < backBtns.length; i++) backBtns[i].addEventListener('click', prevStep);
  var resultsBtn = document.getElementById('btn-results');
  if (resultsBtn) resultsBtn.addEventListener('click', goToResults);
  var ttfRadios = document.querySelectorAll('input[name="ttf_preset"]');
  for (var i = 0; i < ttfRadios.length; i++) ttfRadios[i].addEventListener('change', function() {
    document.getElementById('ttf-custom-wrap').classList.toggle('hidden', this.value !== 'custom');
  });
  // Track if user manually edits the vacancy cost field
  var vacField = document.getElementById('vacancy-cost-day');
  if (vacField) vacField.addEventListener('input', function() { this.dataset.userEdited = 'true'; });
  updateProgressBar();
});
