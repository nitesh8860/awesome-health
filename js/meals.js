/* meals.js — meal template pools + 7-day plan generator.
 * Each template is scaled so the meal lands on its calorie target;
 * templates are built macro-appropriate, so the scaled macros follow.
 */
(function (global) {
  'use strict';

  const SLOTS = [
    { key: 'breakfast', label: 'Breakfast', ratio: 0.25, icon: '🌅' },
    { key: 'lunch', label: 'Lunch', ratio: 0.35, icon: '☀️' },
    { key: 'snack', label: 'Snack', ratio: 0.12, icon: '🍎' },
    { key: 'dinner', label: 'Dinner', ratio: 0.28, icon: '🌙' }
  ];

  const M = (name, items) => ({ name, items });

  const VEG = {
    breakfast: [
      M('Masala oats with milk & banana', [['oats', 55], ['milk', 200], ['almonds', 12], ['banana', 100]]),
      M('Poha with peanuts & curd', [['poha', 65], ['mixedVeg', 120], ['peanuts', 12], ['curd', 120]]),
      M('Idli + sambar + coconut chutney', [['rava', 60], ['sambar', 150], ['coconut', 15], ['curd', 100]]),
      M('Paneer bhurji with roti', [['paneer', 100], ['atta', 60], ['tomato', 60], ['ghee', 5]]),
      M('Besan chilla + curd', [['besan', 60], ['tomato', 50], ['curd', 130], ['ghee', 5]]),
      M('Vegetable upma with nuts', [['rava', 60], ['mixedVeg', 130], ['peanuts', 15], ['curd', 100]]),
      M('Quinoa veggie bowl', [['quinoaCooked', 200], ['mixedVeg', 130], ['tofu', 80], ['oliveOil', 6]])
    ],
    lunch: [
      M('Dal, rice, sabzi & salad', [['toorDal', 200], ['riceCooked', 150], ['mixedVeg', 150], ['cucumber', 100], ['ghee', 5]]),
      M('Rajma chawal with curd', [['rajma', 200], ['riceCooked', 150], ['cucumber', 100], ['curd', 100]]),
      M('Chole with roti & palak', [['chole', 200], ['atta', 90], ['spinach', 150], ['oliveOil', 6]]),
      M('Paneer curry, roti & broccoli', [['paneer', 110], ['atta', 80], ['broccoli', 150], ['oliveOil', 8]]),
      M('Soya chunk curry with rice', [['soyaChunks', 40], ['riceCooked', 150], ['mixedVeg', 150], ['oliveOil', 8]]),
      M('Moong dal khichdi with curd', [['moongDal', 180], ['riceCooked', 140], ['curd', 120], ['ghee', 6]]),
      M('Tofu quinoa stir-fry', [['tofu', 150], ['quinoaCooked', 180], ['mixedVeg', 150], ['oliveOil', 8]])
    ],
    snack: [
      M('Sprout chaat', [['sprouts', 150], ['tomato', 60], ['cucumber', 60]]),
      M('Roasted chana + apple', [['chanaRoasted', 35], ['apple', 150]]),
      M('Peanuts + banana', [['peanuts', 20], ['banana', 100]]),
      M('Curd with flax & honey', [['curd', 180], ['flax', 10], ['honey', 8]]),
      M('Roasted makhana', [['makhana', 25], ['ghee', 4]]),
      M('Whey shake with milk', [['whey', 22], ['milkToned', 250]])
    ],
    dinner: [
      M('Paneer tikka, roti & salad', [['paneer', 120], ['atta', 60], ['cucumber', 120], ['oliveOil', 6]]),
      M('Dal, roti & palak sabzi', [['toorDal', 200], ['atta', 75], ['spinach', 150], ['ghee', 4]]),
      M('Soya-veg curry with roti', [['soyaChunks', 40], ['atta', 60], ['mixedVeg', 200], ['oliveOil', 6]]),
      M('Rajma with rice & salad', [['rajma', 180], ['riceCooked', 130], ['mixedVeg', 150], ['cucumber', 80]]),
      M('Tofu bowl with quinoa', [['tofu', 140], ['quinoaCooked', 170], ['broccoli', 150], ['oliveOil', 6]]),
      M('Khichdi with curd', [['moongDal', 150], ['riceCooked', 130], ['curd', 150], ['ghee', 5]])
    ]
  };

  const EGG = {
    breakfast: [
      M('3-egg bhurji with roti & milk', [['egg', 150], ['atta', 55], ['milk', 200]]),
      M('Boiled eggs, oats & banana', [['egg', 150], ['oats', 45], ['banana', 100]]),
      M('Egg-white omelette + toast', [['eggWhite', 180], ['breadWW', 80], ['egg', 50], ['orange', 150]]),
      M('Masala egg dosa', [['egg', 150], ['rava', 55], ['sambar', 150]]),
      M('Egg & veggie scramble bowl', [['egg', 150], ['mixedVeg', 150], ['oats', 35], ['oliveOil', 5]])
    ],
    lunch: [
      M('Egg curry with rice & salad', [['egg', 150], ['riceCooked', 150], ['mixedVeg', 150], ['cucumber', 100]]),
      M('Boiled eggs, dal & rice', [['egg', 150], ['toorDal', 180], ['riceCooked', 140], ['spinach', 120]]),
      M('Egg bhurji with roti & curd', [['egg', 150], ['atta', 80], ['curd', 120], ['cucumber', 100]]),
      M('Egg & soya curry with rice', [['egg', 100], ['soyaChunks', 30], ['riceCooked', 150], ['mixedVeg', 150]])
    ],
    snack: [
      M('Boiled eggs + apple', [['egg', 100], ['apple', 150]]),
      M('Egg & curd protein bowl', [['egg', 100], ['greekYogurt', 150], ['honey', 8]]),
      M('Whey shake with milk', [['whey', 22], ['milkToned', 250]])
    ],
    dinner: [
      M('Egg bhurji, roti & salad', [['egg', 150], ['atta', 60], ['cucumber', 120], ['oliveOil', 5]]),
      M('Egg curry with quinoa', [['egg', 150], ['quinoaCooked', 170], ['broccoli', 150]]),
      M('Omelette, dal & roti', [['egg', 120], ['toorDal', 180], ['atta', 60], ['spinach', 120]])
    ]
  };

  const NONVEG = {
    breakfast: [
      M('3 eggs, oats & milk', [['egg', 150], ['oats', 45], ['milk', 200]]),
      M('Chicken-egg white omelette + toast', [['chickenBreast', 80], ['egg', 100], ['breadWW', 80]]),
      M('Egg bhurji with roti', [['egg', 150], ['atta', 60], ['tomato', 60], ['ghee', 4]]),
      M('Greek yogurt, eggs & fruit', [['egg', 100], ['greekYogurt', 180], ['banana', 100], ['almonds', 12]])
    ],
    lunch: [
      M('Grilled chicken, rice & salad', [['chickenBreast', 160], ['riceCooked', 160], ['mixedVeg', 150], ['oliveOil', 8]]),
      M('Fish curry with rice', [['fish', 180], ['riceCooked', 160], ['mixedVeg', 150], ['cucumber', 100]]),
      M('Chicken tikka with roti & palak', [['chickenBreast', 160], ['atta', 80], ['spinach', 150], ['oliveOil', 6]]),
      M('Tuna salad with quinoa', [['tuna', 150], ['quinoaCooked', 180], ['mixedVeg', 150], ['oliveOil', 8]]),
      M('Prawn curry with rice', [['prawns', 160], ['riceCooked', 160], ['mixedVeg', 150], ['coconut', 12]])
    ],
    snack: [
      M('Boiled eggs + apple', [['egg', 100], ['apple', 150]]),
      M('Whey shake with milk', [['whey', 22], ['milkToned', 250]]),
      M('Roasted chana + carrot sticks', [['chanaRoasted', 30], ['carrot', 120]])
    ],
    dinner: [
      M('Grilled chicken, roti & broccoli', [['chickenBreast', 150], ['atta', 60], ['broccoli', 150], ['oliveOil', 6]]),
      M('Fish with quinoa & veg', [['salmon', 140], ['quinoaCooked', 170], ['mixedVeg', 150]]),
      M('Chicken curry with roti & salad', [['chickenThigh', 150], ['atta', 60], ['cucumber', 120], ['spinach', 120]]),
      M('Mutton curry (lean) with roti', [['mutton', 120], ['atta', 60], ['mixedVeg', 180]])
    ]
  };

  const POOLS = { veg: VEG, eggitarian: EGG, nonveg: NONVEG };

  /* Merge veg picks with animal options so vegetarian-curious users still
   * see variety; eggs/meat pools already provide their own signature meals. */
  function poolFor(diet, slot) {
    if (diet === 'veg') return VEG[slot];
    if (diet === 'eggitarian') return EGG[slot].concat(VEG[slot].slice(0, 3));
    return NONVEG[slot].concat(VEG[slot].slice(0, 2));
  }

  function macrosOf(items) {
    let kcal = 0, p = 0, c = 0, f = 0, fiber = 0;
    for (const [id, grams] of items) {
      const food = global.FOODS[id];
      if (!food) continue;
      const k = grams / 100;
      kcal += food.kcal * k;
      p += food.p * k;
      c += food.c * k;
      f += food.f * k;
      fiber += food.fiber * k;
    }
    return { kcal, p, c, f, fiber };
  }

  /* Whole foods used to top a meal up when the template cannot reach its
   * protein target. Ordered leanest-first; the builder picks the first one
   * that still fits the meal's remaining fat budget. */
  const PROTEIN_ADDONS = {
    veg: {
      breakfast: ['greekYogurt', 'whey'],
      lunch: ['soyaChunks', 'tofu', 'greekYogurt', 'paneer', 'whey'],
      snack: ['whey'],
      dinner: ['tofu', 'soyaChunks', 'greekYogurt', 'paneer', 'whey']
    },
    eggitarian: {
      breakfast: ['eggWhite', 'egg'],
      lunch: ['eggWhite', 'egg'],
      snack: ['whey'],
      dinner: ['eggWhite', 'egg']
    },
    nonveg: {
      breakfast: ['eggWhite', 'egg'],
      lunch: ['tuna', 'chickenBreast', 'fish', 'egg'],
      snack: ['whey'],
      dinner: ['chickenBreast', 'fish', 'tuna', 'egg']
    }
  };
  const FILLER = 'peanuts';
  const ADDON_CAP = { soyaChunks: 60, whey: 40, paneer: 120, tofu: 250, egg: 200, eggWhite: 250, chickenBreast: 220, fish: 220, tuna: 180, greekYogurt: 250 };

  const step5 = (g) => Math.max(5, Math.round(g / 5) * 5);

  // Sensible portion limits so the maths never produces 20 g of rice or 8 g of ghee.
  function absFloor(f) {
    if (f.f >= 80) return 3;                              // oil, ghee
    if (f.f >= 40) return 8;                              // nuts, seeds
    const starch = f.c >= 15 && (f.c * 4) / f.kcal >= 0.6; // grain, tuber, fruit
    if (starch || f.c >= 40 || f.f >= 15 || f.p >= 12) return 25;
    return 5;
  }
  function absCeil(f) {
    if (f.f >= 80) return 20;
    if (f.f >= 40) return 45;
    const starch = f.c >= 15 && (f.c * 4) / f.kcal >= 0.6;
    if (starch || f.c >= 40) return 300;
    if (f.f >= 15) return 160;
    if (f.p >= 12) return 250;
    return 400;
  }
  // Portions may shrink to 60% of the recipe amount, but never past the absolute
  // floor — and never grow beyond 2× the recipe or the absolute ceiling.
  // Low-calorie produce / salad / curd items are frozen: they carry the meal,
  // and trimming them would produce "5 g of cucumber".
  const isProduce = (f) => f.f <= 15 && f.c < 15 && f.p < 12 && f.kcal <= 70;
  const lower = (it, f) => (isProduce(f)
    ? (it.ref || it.grams)
    : Math.max(3, Math.min(absFloor(f), step5((it.ref || it.grams) * 0.6))));
  const upper = (it, f) => (isProduce(f)
    ? (it.ref || it.grams)
    : Math.max(lower(it, f), Math.min(absCeil(f), step5((it.ref || it.grams) * 2))));

  /* A food only counts as a tunable source of a macro when it is genuinely
   * dense in it — this stops the maths from "fixing" protein by inflating atta
   * or rice. */
  const MACRO_SCORE = {
    // lean protein: at least 30% of its calories come from protein
    p: (f) => (f.p >= 10 && (f.p * 4) / f.kcal >= 0.3 ? f.p : 0),
    // starch: carbs that are not mostly legume protein (poha/oats beat rajma)
    c: (f) => Math.max(0, f.c - 2.5 * f.p),
    f: (f) => (f.f >= 30 ? f.f : 0)
  };

  /* Trim (or grow) the most movable items until the food list hits a target.
   * Moves carbs first, then fat, then protein, then produce. */
  function fitCalories(items, targetKcal) {
    const order = (f) => (MACRO_SCORE.c(f) > 0 ? 0 : f.f >= 30 ? 1 : MACRO_SCORE.p(f) ? 2 : 3);
    for (let pass = 0; pass < 18; pass++) {
      const gap = targetKcal - macrosOf(items.map((i) => [i.id, i.grams])).kcal;
      if (Math.abs(gap) <= Math.max(25, targetKcal * 0.03)) return;
      let moved = false;
      const cands = items
        .map((i) => ({ i, f: global.FOODS[i.id] }))
        .filter((x) => x.f)
        .sort((a, b) => order(a.f) - order(b.f) || b.f.kcal - a.f.kcal);
      for (const { i, f } of cands) {
        const next = i.grams + gap / (f.kcal / 100);
        const clamped = step5(Math.min(upper(i, f), Math.max(lower(i, f), next)));
        if (clamped !== i.grams) { i.grams = clamped; moved = true; break; }
      }
      if (!moved) return;
    }
  }

  function toItems(raw) {
    return raw.map((i) => ({
      id: i.id, name: global.FOODS[i.id].name, grams: i.grams, added: !!i.added
    }));
  }
  const totalsOf = (raw) => macrosOf(raw.map((i) => [i.id, i.grams]));

  /* Build one meal: fill small templates, scale to the calorie target, then
   * move protein / fat / carbs towards their targets within real-world
   * portion limits, finishing with a converging calorie pass. */
  function buildMeal(template, T, diet, slotKey) {
    const items = template.items.map(([id, grams]) => ({ id, grams }));
    const macros = () => totalsOf(items);
    const add = (id, grams) => {
      if (!grams) return;
      const ex = items.find((i) => i.id === id);
      if (ex) { ex.grams += grams; return ex; }
      const it = { id, grams, added: true };
      items.push(it);
      return it;
    };

    // 1. Very light templates (e.g. sprout chaat) get a calorie-dense whole food
    //    instead of being inflated to a silly portion size.
    let m = macros();
    if (m.kcal < T.kcal * 0.65) {
      const f = global.FOODS[FILLER];
      add(FILLER, Math.min(45, step5((T.kcal * 0.75 - m.kcal) / (f.kcal / 100))));
      m = macros();
    }

    // 2. Scale everything to the meal's calorie target and remember the recipe
    //    amount, which sets the portion limits from here on.
    const factor = Math.min(2.0, Math.max(0.5, T.kcal / m.kcal));
    items.forEach((i) => { i.grams = step5(i.grams * factor); i.ref = i.grams; });

    const tune = (key, target) => {
      for (let pass = 0; pass < 6; pass++) {
        const gap = target - macros()[key];
        if (Math.abs(gap) < 4) return;
        const cands = items
          .map((it) => ({ it, f: global.FOODS[it.id] }))
          .filter((x) => MACRO_SCORE[key](x.f) > 0)
          .sort((a, b) => MACRO_SCORE[key](b.f) - MACRO_SCORE[key](a.f));
        let moved = false;
        for (const { it, f } of cands) {
          const next = it.grams + gap / (f[key] / 100);
          const clamped = step5(Math.min(upper(it, f), Math.max(lower(it, f), next)));
          if (clamped !== it.grams) { it.grams = clamped; moved = true; break; }
        }
        if (!moved) return;
      }
    };

    tune('f', T.f);          // trim / add fat first so the protein add-on fits
    tune('p', T.p);

    // 3. Still short on protein? Add the leanest source that fits the fat budget.
    const pGap = T.p - macros().p;
    if (pGap > 8) {
      const fatBudget = Math.max(6, T.f - macros().f);
      const options = PROTEIN_ADDONS[diet][slotKey];
      let chosen = options[options.length - 1];
      for (const id of options) {
        const f = global.FOODS[id];
        const grams = Math.min(ADDON_CAP[id] || 200, step5(pGap / (f.p / 100)));
        if ((grams * f.f) / 100 <= fatBudget) { chosen = id; break; }
      }
      const f = global.FOODS[chosen];
      add(chosen, Math.min(ADDON_CAP[chosen] || 200, step5(pGap / (f.p / 100))));
      tune('f', T.f);            // the add-on may have pushed fat over
      tune('p', T.p);
    }

    tune('c', T.c);
    fitCalories(items, T.kcal);

    return { name: template.name, items: toItems(items), _raw: items, totals: totalsOf(items) };
  }

  function buildPlan(metrics, days = 7) {
    const { input, targetKcal, protein, carbs, fat } = metrics;
    const plan = [];
    for (let d = 0; d < days; d++) {
      const meals = SLOTS.map((slot, si) => {
        const pool = poolFor(input.diet, slot.key);
        const idx = (d + si * 2) % pool.length;
        const T = {
          kcal: targetKcal * slot.ratio,
          p: protein * slot.ratio,
          c: carbs * slot.ratio,
          f: fat * slot.ratio
        };
        return {
          slot: slot.label,
          icon: slot.icon,
          ratio: slot.ratio,
          targetKcal: T.kcal,
          ...buildMeal(pool[idx], T, input.diet, slot.key)
        };
      });
      sumDay(meals);

      // Day-level correction: if the four meals still drift, nudge the largest
      // meal so the whole day lands on the calorie target.
      const dayKcal = meals.reduce((a, m) => a + m.totals.kcal, 0);
      if (Math.abs(targetKcal - dayKcal) > targetKcal * 0.02) {
        const big = meals.reduce((a, m) => (m.totals.kcal > a.totals.kcal ? m : a), meals[0]);
        fitCalories(big._raw, big.totals.kcal + (targetKcal - dayKcal));
        big.items = toItems(big._raw);
        big.totals = totalsOf(big._raw);
        sumDay(meals);
      }

      plan.push({ day: d + 1, meals, totals: meals._totals });
    }
    return plan;
  }

  function sumDay(meals) {
    const t = { kcal: 0, p: 0, c: 0, f: 0, fiber: 0 };
    for (const m of meals) {
      t.kcal += m.totals.kcal; t.p += m.totals.p;
      t.c += m.totals.c; t.f += m.totals.f; t.fiber += m.totals.fiber;
    }
    meals._totals = t;
    return t;
  }

  global.Meals = { SLOTS, buildPlan, macrosOf, POOLS };
})(window);
