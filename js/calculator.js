function calculate(input) {
  var ta = input.ta;
  var hiring = input.hiring;
  var tech = input.tech;
  var ttf = input.ttf;
  var vacancy = input.vacancy;

  var totalHires = hiring.totalHires || 0;
  var avgCtc = hiring.avgCtc || 0;
  var feeRate = CONFIG.feeRates[hiring.expLevel] || CONFIG.feeRates.mixed;

  // --- CURRENT STATE ---
  var currentTA = ta.annualCost || 0;
  var currentTech = tech.annualSpend || 0;
  var tracksVacancy = vacancy.tracksIt && vacancy.costPerDay > 0;
  var currentVacancyCost = tracksVacancy ? (ttf.days || 0) * (vacancy.costPerDay || 0) * totalHires : 0;
  var currentTotal = currentTA + currentTech + currentVacancyCost;
  var currentCPH = totalHires > 0 ? currentTotal / totalHires : 0;

  // --- WITH PEEPAL ---
  // TA payroll stays (client keeps their team)
  // Tech goes to zero (absorbed by Peepal)
  // Peepal fee = hires x CTC x rate
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
  var newTTF = Math.round((ttf.days || 0) * (1 - CONFIG.timeToFillReduction));
  var peepalVacancyCost = tracksVacancy ? newTTF * (vacancy.costPerDay || 0) * totalHires : 0;

  // Peepal total = TA stays + net fee + no tech + reduced vacancy
  var peepalTotal = currentTA + netFee + peepalVacancyCost;
  var peepalCPH = totalHires > 0 ? peepalTotal / totalHires : 0;

  // --- DIFFERENCE ---
  var netDifference = currentTotal - peepalTotal;
  var isNetSaving = netDifference > 0;
  var diffPct = currentTotal > 0 ? Math.abs(netDifference) / currentTotal : 0;

  // Vacancy savings (for display)
  var vacancySavings = currentVacancyCost - peepalVacancyCost;

  // Capacity
  var recruiterProductivity = ta.recruiters > 0 ? Math.round(totalHires / ta.recruiters) : 0;

  return {
    totalHires: totalHires,
    avgCtc: avgCtc,
    feeRate: feeRate,
    expLevel: hiring.expLevel,

    // Current
    currentTA: currentTA,
    currentTech: currentTech,
    currentVacancyCost: currentVacancyCost,
    currentTotal: currentTotal,
    currentCPH: currentCPH,

    // Peepal
    grossFee: grossFee,
    bulkDiscount: bulkDiscount,
    netFee: netFee,
    peepalVacancyCost: peepalVacancyCost,
    peepalTotal: peepalTotal,
    peepalCPH: peepalCPH,

    // Difference
    netDifference: netDifference,
    isNetSaving: isNetSaving,
    diffPct: diffPct,

    // Components
    techAbsorbed: currentTech,
    vacancySavings: vacancySavings,
    newTTF: newTTF,
    tracksVacancy: tracksVacancy,
    recruiterProductivity: recruiterProductivity
  };
}
