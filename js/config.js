var CONFIG = {
  feeRates: {
    junior: 0.0833,
    mixed: 0.0833,
    senior: 0.0833
  },

  feeLabels: {
    junior: '0-5 yrs',
    mixed: 'Mixed levels',
    senior: '10+ yrs'
  },

  // Auto-filled vacancy cost per day (₹) by industry × experience level
  // Formula base: (avgCTC / 260 working days) × industry multiplier
  // These are the multipliers applied to daily CTC equivalent
  vacancyMultipliers: {
    'BFSI / Fintech':             { junior: 1.8, mixed: 2.2, senior: 2.8 },
    'Technology':                  { junior: 2.0, mixed: 2.5, senior: 3.0 },
    'Healthcare / Med Tech':       { junior: 1.6, mixed: 2.0, senior: 2.5 },
    'Manufacturing / Industrial':  { junior: 1.4, mixed: 1.8, senior: 2.2 },
    'Professional Services':       { junior: 1.6, mixed: 2.0, senior: 2.5 },
    'Other':                       { junior: 1.5, mixed: 1.9, senior: 2.4 }
  },

  bulkDiscounts: [
    { threshold: 200, rate: 0.10 },
    { threshold: 150, rate: 0.08 },
    { threshold: 100, rate: 0.05 }
  ],

  timeToFillReduction: 0.35,
  techCoveredByPeepal: true,

  // Google Apps Script web app URL (handles lead collection + Groq AI proxy)
  // Deploy appscript-Code.gs following its setup instructions and paste URL here
  leadEndpoint: 'https://script.google.com/macros/s/AKfycbwlcTlqU5338k6-uamyKXNWcKhkEbyXisKAToqFEKmYl9l9dAS60NnZ2a0NTSOCuXo8/exec',


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
