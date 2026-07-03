var CONFIG = {
  feeRates: {
    junior: 0.0833,
    mixed: 0.10,
    senior: 0.125
  },

  feeLabels: {
    junior: '8.33% (0-5 yrs)',
    mixed: '10% (mixed levels)',
    senior: '12.5% (10+ yrs)'
  },

  bulkDiscounts: [
    { threshold: 200, rate: 0.10 },
    { threshold: 150, rate: 0.08 },
    { threshold: 100, rate: 0.05 }
  ],

  timeToFillReduction: 0.35,
  techCoveredByPeepal: true,

  benchmarks: {
    "BFSI / Fintech": {
      "<100": { cph: 65000, ttf: 52 }, "100-500": { cph: 72000, ttf: 58 },
      "500-2000": { cph: 80000, ttf: 62 }, "2000+": { cph: 90000, ttf: 68 }
    },
    "Technology": {
      "<100": { cph: 70000, ttf: 48 }, "100-500": { cph: 82000, ttf: 55 },
      "500-2000": { cph: 95000, ttf: 60 }, "2000+": { cph: 110000, ttf: 65 }
    },
    "Healthcare / Med Tech": {
      "<100": { cph: 60000, ttf: 50 }, "100-500": { cph: 68000, ttf: 56 },
      "500-2000": { cph: 75000, ttf: 62 }, "2000+": { cph: 85000, ttf: 70 }
    },
    "Manufacturing / Industrial": {
      "<100": { cph: 55000, ttf: 45 }, "100-500": { cph: 62000, ttf: 52 },
      "500-2000": { cph: 70000, ttf: 58 }, "2000+": { cph: 78000, ttf: 64 }
    },
    "Professional Services": {
      "<100": { cph: 65000, ttf: 50 }, "100-500": { cph: 74000, ttf: 56 },
      "500-2000": { cph: 82000, ttf: 62 }, "2000+": { cph: 92000, ttf: 68 }
    },
    "Other": {
      "<100": { cph: 62000, ttf: 50 }, "100-500": { cph: 70000, ttf: 55 },
      "500-2000": { cph: 78000, ttf: 60 }, "2000+": { cph: 88000, ttf: 65 }
    }
  }
};
