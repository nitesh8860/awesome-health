/* nutrition.js — all health / nutrition math.
 * Pure functions, exposed on window.Nutrition (no bundler needed).
 */
(function (global) {
  'use strict';

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const round = (v, step) => Math.round(v / step) * step;

  const ACTIVITY = {
    sedentary: { label: 'Sedentary — desk job, little movement', factor: 1.2 },
    light: { label: 'Lightly active — 1–3 workouts / week', factor: 1.375 },
    moderate: { label: 'Moderately active — 3–5 workouts / week', factor: 1.55 },
    very: { label: 'Very active — 6–7 workouts / week', factor: 1.725 },
    athlete: { label: 'Athlete — 2 sessions / day', factor: 1.9 }
  };

  const ENVIRONMENT = {
    indoor: { label: 'Mostly indoor', factor: 1.0 },
    mixed: { label: 'Mixed indoor / outdoor', factor: 1.02 },
    outdoor: { label: 'Mostly outdoor', factor: 1.05 }
  };

  const GOALS = {
    'fat-loss': { label: 'Lose fat', kcalAdj: -0.2, lbm: 2.4, bw: 1.8 },
    recomp: { label: 'Recomp / tone up', kcalAdj: -0.08, lbm: 2.2, bw: 1.7 },
    maintain: { label: 'Maintain weight', kcalAdj: 0, lbm: 2.0, bw: 1.6 },
    'lean-gain': { label: 'Build muscle (lean bulk)', kcalAdj: 0.12, lbm: 2.2, bw: 1.6 }
  };

  /* ---------- Body composition ---------- */

  // US Navy circumference method.
  function navyBodyFat({ gender, height, neck, waist, hip }) {
    if (!height || !neck || !waist) return null;
    const lg = Math.log10;
    if (gender === 'female') {
      if (!hip) return null;
      const inner = waist + hip - neck;
      if (inner <= 0) return null;
      const bf = 495 / (1.29579 - 0.35004 * lg(inner) + 0.221 * lg(height)) - 450;
      return clamp(bf, 5, 60);
    }
    const inner = waist - neck;
    if (inner <= 0) return null;
    const bf = 495 / (1.0324 - 0.19077 * lg(inner) + 0.15456 * lg(height)) - 450;
    return clamp(bf, 2, 60);
  }

  // Deurenberg BMI-based estimate — fallback when no tape measurements.
  function bmiBodyFat({ gender, bmi, age }) {
    const bf = 1.2 * bmi + 0.23 * age - 10.8 * (gender === 'male' ? 1 : 0) - 5.4;
    return clamp(bf, 3, 60);
  }

  function bmiCategory(bmi) {
    if (bmi < 16) return { label: 'Severely underweight', tone: 'warn' };
    if (bmi < 18.5) return { label: 'Underweight', tone: 'warn' };
    if (bmi < 25) return { label: 'Healthy range', tone: 'good' };
    if (bmi < 30) return { label: 'Overweight', tone: 'warn' };
    if (bmi < 35) return { label: 'Obese class I', tone: 'bad' };
    if (bmi < 40) return { label: 'Obese class II', tone: 'bad' };
    return { label: 'Obese class III', tone: 'bad' };
  }

  function bfCategory(gender, bf) {
    const t = gender === 'male'
      ? [[5, 'Essential only', 'warn'], [6, 'Athletic', 'good'], [14, 'Fitness', 'good'], [18, 'Average', 'warn'], [25, 'High', 'bad'], [Infinity, 'Very high', 'bad']]
      : [[13, 'Essential only', 'warn'], [14, 'Athletic', 'good'], [21, 'Fitness', 'good'], [25, 'Average', 'warn'], [32, 'High', 'bad'], [Infinity, 'Very high', 'bad']];
    for (const [limit, label, tone] of t) if (bf < limit) return { label, tone };
    return { label: 'Very high', tone: 'bad' };
  }

  // Mifflin-St Jeor — best when body fat is unknown.
  function mifflin({ gender, weight, height, age }) {
    return 10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161);
  }

  // Katch-McArdle — best when lean mass is known.
  const katch = (lbmKg) => 370 + 21.6 * lbmKg;

  /* ---------- Micronutrient targets (US DRI based) ---------- */

  function microTargets({ gender, age, environment, activity, weight, fiber, waterMl }) {
    const male = gender === 'male';
    const over50 = age >= 51;
    const over70 = age >= 71;

    const list = [
      { name: 'Vitamin A', amount: male ? 900 : 700, unit: 'µg RAE', sources: 'Carrot, spinach, pumpkin, eggs, dairy' },
      { name: 'Vitamin C', amount: male ? 90 : 75, unit: 'mg', sources: 'Amla, guava, orange, capsicum, tomato' },
      { name: 'Vitamin D', amount: over70 ? 20 : 15, unit: 'µg (600–800 IU)', sources: 'Sunlight, fortified milk, fish, egg yolk' },
      { name: 'Vitamin E', amount: 15, unit: 'mg', sources: 'Almonds, sunflower seeds, olive oil' },
      { name: 'Vitamin K', amount: male ? 120 : 90, unit: 'µg', sources: 'Leafy greens, broccoli, cabbage' },
      { name: 'Vitamin B1 (thiamine)', amount: male ? 1.2 : 1.1, unit: 'mg', sources: 'Whole grains, dal, peanuts, pork' },
      { name: 'Vitamin B2 (riboflavin)', amount: male ? 1.3 : 1.1, unit: 'mg', sources: 'Milk, curd, eggs, almonds' },
      { name: 'Vitamin B3 (niacin)', amount: male ? 16 : 14, unit: 'mg NE', sources: 'Chicken, fish, peanuts, whole grains' },
      { name: 'Vitamin B6', amount: over50 ? (male ? 1.7 : 1.5) : 1.3, unit: 'mg', sources: 'Chickpeas, banana, potato, poultry' },
      { name: 'Vitamin B12', amount: 2.4, unit: 'µg', sources: 'Eggs, dairy, meat, fortified cereals' },
      { name: 'Folate', amount: 400, unit: 'µg DFE', sources: 'Green leafy veg, dal, sprouts, citrus' },
      { name: 'Calcium', amount: (gender === 'female' && over50) || (male && over70) ? 1200 : 1000, unit: 'mg', sources: 'Milk, curd, paneer, ragi, sesame' },
      { name: 'Iron', amount: gender === 'female' && !over50 ? 18 : 8, unit: 'mg', sources: 'Meat, liver, spinach, rajma, jaggery' },
      { name: 'Magnesium', amount: male ? (age <= 30 ? 400 : 420) : (age <= 30 ? 310 : 320), unit: 'mg', sources: 'Nuts, seeds, whole grains, dark chocolate' },
      { name: 'Zinc', amount: male ? 11 : 8, unit: 'mg', sources: 'Meat, eggs, pumpkin seeds, cashews' },
      { name: 'Potassium', amount: male ? 3400 : 2600, unit: 'mg', sources: 'Banana, coconut water, potato, curd' },
      { name: 'Sodium', amount: 2300, unit: 'mg (stay under)', sources: 'Salt, packaged food — limit processed items' },
      { name: 'Phosphorus', amount: 700, unit: 'mg', sources: 'Dairy, meat, whole grains' },
      { name: 'Iodine', amount: 150, unit: 'µg', sources: 'Iodised salt, seafood, dairy' },
      { name: 'Selenium', amount: 55, unit: 'µg', sources: 'Brazil nuts, eggs, fish' },
      { name: 'Choline', amount: male ? 550 : 425, unit: 'mg', sources: 'Eggs, soy, peanuts' },
      { name: 'Omega-3 (EPA+DHA)', amount: 1.2, unit: 'g', sources: 'Fish, flaxseed, chia, walnuts' },
      { name: 'Fibre', amount: Math.round(fiber), unit: 'g', sources: 'Whole grains, dal, vegetables, fruit' },
      { name: 'Water', amount: Math.round(waterMl), unit: 'ml', sources: 'Plain water, coconut water, buttermilk' }
    ];

    if (environment === 'indoor' && activity !== 'athlete') {
      const d = list.find((m) => m.name.startsWith('Vitamin D'));
      d.note = 'You are mostly indoors — 15 min of midday sun or a supplement is worth discussing.';
    }
    return list;
  }

  function dietFlags(diet) {
    if (diet === 'nonveg') return [];
    const flags = [
      { title: 'Vitamin B12', text: 'Plant foods contain almost no B12. Use fortified milk/cereal or a supplement (2.4 µg/day).' },
      { title: 'Iron', text: 'Plant iron is poorly absorbed — pair dal/spinach with vitamin C (lemon, amla, orange).' },
      { title: 'Zinc', text: 'Soak, sprout and ferment grains/legumes to improve zinc absorption.' },
      { title: 'Omega-3', text: 'Add 1 tbsp flaxseed or 2 walnuts daily; consider an algae-oil supplement for EPA/DHA.' },
      { title: 'Protein quality', text: 'Combine cereals + pulses (roti + dal, rice + rajma) to get all essential amino acids.' }
    ];
    if (diet === 'eggitarian') flags.shift(); // eggs cover B12
    return flags;
  }

  /* ---------- Main ---------- */

  function compute(input) {
    const { gender, age, weight, height, neck, waist, hip, activity, environment, diet, goal } = input;

    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    const bmiCat = bmiCategory(bmi);

    const navyBf = navyBodyFat({ gender, height, neck, waist, hip });
    const estBf = bmiBodyFat({ gender, bmi, age });
    const bodyFat = navyBf != null ? navyBf : estBf;
    const bfSource = navyBf != null ? 'US Navy tape method' : 'BMI-based estimate (add waist/neck for accuracy)';
    const bfCat = bfCategory(gender, bodyFat);

    const leanMass = weight * (1 - bodyFat / 100);
    const fatMass = weight - leanMass;

    const bmrMifflin = mifflin({ gender, weight, height, age });
    const bmrKatch = katch(leanMass);
    const bmr = navyBf != null ? bmrKatch : bmrMifflin;
    const bmrFormula = navyBf != null ? 'Katch-McArdle (uses lean mass)' : 'Mifflin-St Jeor';

    const actFactor = ACTIVITY[activity].factor;
    const envFactor = ENVIRONMENT[environment].factor;
    const tdee = bmr * actFactor * envFactor;

    const g = GOALS[goal];
    let targetKcal = tdee * (1 + g.kcalAdj);
    const floorKcal = gender === 'male' ? 1500 : 1200;
    const minKcal = Math.max(floorKcal, bmr);
    let kcalAdjusted = false;
    if (targetKcal < minKcal) {
      targetKcal = minKcal;
      kcalAdjusted = true;
    }
    targetKcal = round(targetKcal, 10);

    // Macros
    const proteinG = (navyBf != null ? leanMass * g.lbm : weight * g.bw);
    let protein = Math.min(proteinG, (targetKcal * 0.4) / 4);
    let fat = (targetKcal * 0.27) / 9;
    // Keep fat inside a healthy band, but let big calorie targets breathe so the
    // carbs do not have to absorb an unrealistic share.
    const fatCeil = Math.max(weight * 1.2, (targetKcal * 0.28) / 9);
    fat = clamp(fat, weight * 0.5, fatCeil);
    let carbs = (targetKcal - protein * 4 - fat * 9) / 4;
    if (carbs < 80) {
      const overflow = (80 - carbs) * 4;
      fat = Math.max(weight * 0.5, fat - overflow / 9);
      carbs = (targetKcal - protein * 4 - fat * 9) / 4;
    }

    const fiber = Math.max(25, (14 * targetKcal) / 1000);
    let waterMl = weight * 35;
    if (environment === 'outdoor') waterMl += 500;
    else if (environment === 'mixed') waterMl += 250;
    if (activity === 'very' || activity === 'athlete') waterMl += 350;
    waterMl = round(waterMl, 50);

    const macroSplit = {
      protein: (protein * 4) / targetKcal,
      carbs: (carbs * 4) / targetKcal,
      fat: (fat * 9) / targetKcal
    };

    const healthyMin = 18.5 * heightM * heightM;
    const healthyMax = 24.9 * heightM * heightM;

    return {
      input,
      bmi,
      bmiCategory: bmiCat,
      bodyFat,
      bodyFatSource: bfSource,
      bodyFatCategory: bfCat,
      leanMass,
      fatMass,
      bmr,
      bmrMifflin,
      bmrKatch,
      bmrFormula,
      tdee,
      actFactor,
      envFactor,
      annual: tdee * 365,
      targetKcal,
      goal: g,
      kcalAdjusted,
      protein,
      carbs,
      fat,
      fiber,
      waterMl,
      macroSplit,
      healthyMin,
      healthyMax,
      waistToHeight: waist ? waist / height : null,
      waistToHip: waist && hip ? waist / hip : null,
      micros: microTargets({ gender, age, environment, activity, weight, fiber, waterMl }),
      dietFlags: dietFlags(diet)
    };
  }

  global.Nutrition = {
    compute, ACTIVITY, ENVIRONMENT, GOALS, navyBodyFat, bmiBodyFat,
    microTargets, clamp, round
  };
})(window);
