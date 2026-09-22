# Vital — health & fitness webapp

One page that turns body stats + lifestyle into a complete plan: body-fat %, TDEE, calorie target, macros, micronutrient targets, a 7-day meal plan and a weekly workout plan.

No build step, no dependencies, no tracking. Open `index.html` and it works.

```bash
# just open it
open index.html

# or serve it (any static server)
python3 -m http.server 8080
```

## Input

| Group | Fields |
| --- | --- |
| About you | age, sex, weight (kg), height (cm) |
| Body measurements *(optional)* | neck, waist, hip (cm) → real body-fat % instead of an estimate |
| Lifestyle | activity level, indoor / mixed / outdoor, diet (veg / eggitarian / non-veg) |
| Training | goal (lose fat / recomp / maintain / lean bulk), sessions per week, experience |

Inputs are validated and remembered in `localStorage`. There is also a **Fill example** button.

## Output

1. **Your numbers** — daily calories, TDEE, BMR, BMI, body-fat %, lean mass, waist ratios, healthy weight range.
2. **Calories & macros** — protein / carbs / fat in grams, kcal and % of intake.
3. **Micronutrient targets** — 24 DRIs (vitamins, minerals, fibre, water, omega-3) adjusted for sex and age, each with food sources, plus diet-specific watch-outs (B12, iron, zinc, omega-3 for vegetarians).
4. **7-day meal plan** — four meals per day, vegetarian / eggitarian / non-vegetarian, each with grams per food and per-meal macros.
5. **Weekly workout plan** — split from your available days, indoor or outdoor exercise selection, sets/reps/rest by goal, cardio volume, plus age- and experience-specific coaching notes.

## The maths

| Quantity | Method |
| --- | --- |
| Body fat % | US Navy circumference method (Katch for men uses neck + waist; women add hip). Falls back to a BMI + age estimate when measurements are missing. |
| BMR | Katch-McArdle (`370 + 21.6 × lean kg`) when body fat is known, else Mifflin-St Jeor |
| TDEE | BMR × activity factor (1.2 → 1.9) × environment factor (indoor 1.00 / mixed 1.02 / outdoor 1.05) |
| Calorie target | TDEE adjusted by goal: −20% fat loss, −8% recomp, 0% maintain, +12% lean bulk; floored at BMR and the safe minimum (1500 / 1200 kcal) |
| Protein | g per kg lean mass (2.4 cutting → 2.2 bulking) or per kg body weight when lean mass is unknown, capped at 40% of calories |
| Fat / carbs | fat ≈27% of calories within a healthy per-kg band; carbs fill the remainder (minimum 80 g) |
| Fibre / water | 14 g per 1000 kcal · 35 ml/kg + adjustments for heat and activity |
| Micronutrients | US DRI intakes, adjusted for sex, age 51+ / 71+ and diet type |
| Meals | Each template is scaled to the calorie target, then starch / fat / protein portions are solved (within real-world portion limits) so the meal also hits its macro shares. A day-level pass keeps the four meals on the daily calorie target. |
| Workouts | Split from days/week and experience; exercise bank swapped per environment; sets, reps, rest and cardio volume driven by goal |

## Project layout

```
index.html          markup + form
css/styles.css      dark theme, responsive, print/PDF friendly
js/foods.js         macro data per 100 g (~90 foods, Indian + global)
js/nutrition.js     body composition, BMR, TDEE, macros, micronutrient targets  (pure)
js/meals.js         meal template pools + the plan solver                       (pure)
js/workouts.js      training split and session builder                          (pure)
js/app.js           form handling, validation, rendering
tests/run.js        smoke tests (maths + a minimal-DOM UI pass)
```

The `js/` modules are plain scripts that attach to `window`, so the page runs straight from the filesystem. `nutrition.js`, `meals.js` and `workouts.js` are pure functions — no DOM — which is why they can be tested in Node.

## Tests

```bash
node tests/run.js
```

* 5 profiles (veg / eggitarian / non-veg, cut / recomp / maintain / bulk, sedentary → athlete) — macros must add up to the calorie target, deficits never drop below BMR, TDEE > BMR.
* US Navy body-fat reference values; women require a hip measurement.
* Age/sex micronutrient rules (iron 18 mg for menstruating women, 8 mg past 51; calcium 1200 mg past 50).
* 7-day plans: 5 % calorie accuracy per day, ≥75 % of the protein target, sane portion sizes, every template referencing a real food.
* Workouts for 0–7 days × 3 environments.
* UI: every `#id` used by `app.js` exists in `index.html`, the page renders without `NaN`/`undefined`, invalid input shows an error, diet switching works, and saved inputs render without scrolling.
* CSS regression guards for the layout bugs found during development: a floated `<legend>` collapses the field grids to 0 px, and number inputs need `min-width: 0` inside grid tracks or the page scrolls sideways below ~800 px.

The layout is verified in headless Chrome from 1600 px down to 320 px (no horizontal scroll, no collapsed field grids, no clipped text, no unusably small controls).

## Disclaimer

Estimates for educational use — not medical advice. Formulas carry ±10 % error, and meal macros are estimates from food tables. Consult a doctor or dietitian before starting a diet or training programme, especially with a medical condition, during pregnancy, or while on medication.
