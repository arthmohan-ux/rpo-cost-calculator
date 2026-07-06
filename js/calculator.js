function calculate(input) {
  var ta = input.ta;
  var hiring = input.hiring;
  var tech = input.tech;
  var ttf = input.ttf;
  var vacancy = input.vacancy;

  var totalHires = hiring.totalHires || 0;
  var unclosedRoles = hiring.unclosedRoles || 0;
  var avgCtc = hiring.avgCtc || 0;
  var feeRate = CONFIG.feeRates[hiring.expLevel] || CONFIG.feeRates.mixed;

  // --- TA REDUCTION ---
  // Peepal embeds into the hiring function, reducing internal TA headcount.
  // Reduction % scales with how much volume Peepal absorbs relative to team size.
  var ratio = ta.recruiters > 0 ? totalHires / ta.recruiters : 0;
  var taReductionPct;
  if (ratio >= 60) taReductionPct = CONFIG.taReduction.high;       // 75%
  else if (ratio >= 40) taReductionPct = CONFIG.taReduction.medium; // 65%
  else if (ratio >= 25) taReductionPct = CONFIG.taReduction.low;    // 55%
  else taReductionPct = CONFIG.taReduction.base;                    // 50%

  // --- CURRENT STATE ---
  var currentTA = ta.annualCost || 0;
  var currentTech = tech.annualSpend || 0;
  var tracksVacancy = vacancy.costPerDay > 0;
  var ttfDays = ttf.days || 0;

  // Vacancy cost for filled roles: each hire has an open period of TTF days
  var currentVacancyCost = tracksVacancy ? ttfDays * vacancy.costPerDay * totalHires : 0;

  // Unclosed roles: stayed open most of the year.
  // Each unclosed role costs vacancy rate for at least 90 days (conservative).
  var unclosedDays = Math.max(ttfDays, 90);
  var unclosedCost = tracksVacancy && unclosedRoles > 0 ? unclosedRoles * vacancy.costPerDay * unclosedDays : 0;

  var currentTotal = currentTA + currentTech + currentVacancyCost + unclosedCost;
  var currentCPH = totalHires > 0 ? currentTotal / totalHires : 0;

  // --- WITH PEEPAL ---
  // TA payroll reduces
  var retainedTA = Math.round(currentTA * (1 - taReductionPct));
  var taSavings = currentTA - retainedTA;

  // Tech goes to zero (absorbed by Peepal)
  // Peepal fee = hires x CTC x rate (flat 8.33%)
  var grossFee = totalHires * avgCtc * feeRate;

  // Bulk discount on gross fee
  var bulkDiscount = 0;
  for (var i = 0; i < CONFIG.bulkDiscounts.length; i++) {
    if (totalHires >= CONFIG.bulkDiscounts[i].threshold) {
      bulkDiscount = Math.round(grossFee * CONFIG.bulkDiscounts[i].rate);
      break;
    }
  }
  var netFee = Math.round(grossFee - bulkDiscount);

  // Reduced vacancy cost from TTF improvement
  var newTTF = Math.round(ttfDays * (1 - CONFIG.timeToFillReduction));
  var peepalVacancyCost = tracksVacancy ? newTTF * vacancy.costPerDay * totalHires : 0;

  // Unclosed roles with Peepal: 80% of previously unclosed roles now get filled
  var unclosedWithPeepal = Math.round(unclosedRoles * 0.2);
  var peepalUnclosedCost = tracksVacancy && unclosedWithPeepal > 0 ? unclosedWithPeepal * vacancy.costPerDay * unclosedDays : 0;

  // Peepal total = reduced TA + net fee + no tech + reduced vacancy + fewer unclosed
  var peepalTotal = retainedTA + netFee + peepalVacancyCost + peepalUnclosedCost;
  var peepalCPH = totalHires > 0 ? peepalTotal / totalHires : 0;

  // --- DIFFERENCE ---
  var netDifference = currentTotal - peepalTotal;
  var isNetSaving = netDifference > 0;
  var diffPct = currentTotal > 0 ? Math.abs(netDifference) / currentTotal : 0;

  // Component savings (for display)
  var vacancySavings = currentVacancyCost - peepalVacancyCost;
  var unclosedSavings = unclosedCost - peepalUnclosedCost;

  // Capacity
  var recruiterProductivity = ta.recruiters > 0 ? Math.round(totalHires / ta.recruiters) : 0;

  return {
    totalHires: totalHires,
    unclosedRoles: unclosedRoles,
    avgCtc: avgCtc,
    feeRate: feeRate,
    expLevel: hiring.expLevel,

    // Current
    currentTA: currentTA,
    currentTech: currentTech,
    currentVacancyCost: currentVacancyCost,
    unclosedCost: unclosedCost,
    currentTotal: currentTotal,
    currentCPH: currentCPH,

    // Peepal
    retainedTA: retainedTA,
    taSavings: taSavings,
    taReductionPct: taReductionPct,
    grossFee: grossFee,
    bulkDiscount: bulkDiscount,
    netFee: netFee,
    peepalVacancyCost: peepalVacancyCost,
    peepalUnclosedCost: peepalUnclosedCost,
    peepalTotal: peepalTotal,
    peepalCPH: peepalCPH,

    // Difference
    netDifference: netDifference,
    isNetSaving: isNetSaving,
    diffPct: diffPct,

    // Components
    techAbsorbed: currentTech,
    vacancySavings: vacancySavings,
    unclosedSavings: unclosedSavings,
    newTTF: newTTF,
    tracksVacancy: tracksVacancy,
    recruiterProductivity: recruiterProductivity
  };
}
