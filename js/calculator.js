function calculate(input) {
  var ta = input.ta;
  var hiring = input.hiring;
  var tech = input.tech;
  var ttf = input.ttf;
  var vacancy = input.vacancy;

  var totalHires = hiring.totalHires || 0;
  var avgCtc = hiring.avgCtc || 0;
  var blendedFeeRate = CONFIG.blendedFeeRate || 0.10;

  // Current internal cost (no branding)
  var currentInternalCost = (ta.annualCost || 0) + (tech.annualSpend || 0);

  // Current cost per hire
  var currentCostPerHire = totalHires > 0 ? currentInternalCost / totalHires : 0;

  // Vacancy cost
  var tracksVacancy = vacancy.tracksIt && vacancy.costPerDay > 0;
  var currentVacancyCost = tracksVacancy ? (ttf.days || 0) * (vacancy.costPerDay || 0) * totalHires : 0;

  // Current total hiring cost
  var currentTotalHiringCost = currentInternalCost + currentVacancyCost;

  // Gross Peepal fee
  var grossPeepalFee = totalHires * avgCtc * blendedFeeRate;

  // Bulk discount
  var bulkDiscount = 0;
  for (var i = 0; i < CONFIG.bulkDiscounts.length; i++) {
    if (totalHires >= CONFIG.bulkDiscounts[i].threshold) {
      bulkDiscount = Math.round(grossPeepalFee * CONFIG.bulkDiscounts[i].rate);
      break;
    }
  }

  // Tech absorbed
  var techSavings = CONFIG.techCoveredByPeepal ? (tech.annualSpend || 0) : 0;

  // TTF reduction and vacancy savings
  var newTTF = Math.round((ttf.days || 0) * (1 - CONFIG.timeToFillReduction));
  var newVacancyCost = tracksVacancy ? newTTF * (vacancy.costPerDay || 0) * totalHires : 0;
  var vacancySavings = currentVacancyCost - newVacancyCost;

  // Estimated RPO cost (simple: fee minus bulk discount)
  var estimatedRPOCost = Math.max(0, Math.round(grossPeepalFee - bulkDiscount));

  // Total savings
  var totalSavings = currentTotalHiringCost - estimatedRPOCost + techSavings + vacancySavings;
  var savingsPct = currentTotalHiringCost > 0 ? totalSavings / currentTotalHiringCost : 0;

  // Capacity unlock
  var recruiterProductivityCurrent = ta.recruiters > 0 ? Math.round(totalHires / ta.recruiters) : 0;
  var newCostPerHire = totalHires > 0 ? estimatedRPOCost / totalHires : 0;

  return {
    totalHires: totalHires,
    avgCtc: avgCtc,
    blendedFeeRate: blendedFeeRate,
    currentInternalCost: currentInternalCost,
    currentCostPerHire: currentCostPerHire,
    currentVacancyCost: currentVacancyCost,
    currentTotalHiringCost: currentTotalHiringCost,
    grossPeepalFee: grossPeepalFee,
    bulkDiscount: bulkDiscount,
    techSavings: techSavings,
    newTTF: newTTF,
    newVacancyCost: newVacancyCost,
    vacancySavings: vacancySavings,
    estimatedRPOCost: estimatedRPOCost,
    totalSavings: totalSavings,
    savingsPct: savingsPct,
    recruiterProductivityCurrent: recruiterProductivityCurrent,
    newCostPerHire: newCostPerHire,
    tracksVacancy: tracksVacancy,
    breakdownCurrentCost: {
      payroll: ta.annualCost || 0,
      tech: tech.annualSpend || 0,
      vacancy: currentVacancyCost
    },
    breakdownPeepalCost: {
      serviceFee: estimatedRPOCost,
      thirdParty: 0
    }
  };
}
