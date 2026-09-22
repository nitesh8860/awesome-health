/* Smoke tests — run with: node tests/run.js
 * Loads the browser modules under a tiny window shim and checks the maths.
 */
'use strict';

const fs = require('fs');
const path = require('path');

global.window = global;
const root = path.join(__dirname, '..');
['foods', 'nutrition', 'meals', 'workouts'].forEach((f) => require(path.join(root, 'js', f + '.js')));

let failures = 0;
let checks = 0;

function ok(cond, label, extra) {
  checks++;
  if (cond) return;
  failures++;
  console.error(`  ✗ ${label}${extra ? ' — ' + extra : ''}`);
}

function near(actual, expected, tol, label) {
  const diff = Math.abs(actual - expected);
  ok(diff <= tol, label, `got ${actual.toFixed(1)}, expected ${expected.toFixed(1)} ±${tol}`);
}

const PROFILES = [
  { name: 'veg male cut', input: { age: 29, gender: 'male', weight: 74, height: 176, neck: 38, waist: 84, hip: 96, activity: 'moderate', environment: 'mixed', diet: 'veg', goal: 'fat-loss', days: 4, experience: 'intermediate' } },
  { name: 'veg female sedentary cut', input: { age: 34, gender: 'female', weight: 82, height: 162, neck: 33, waist: 92, hip: 108, activity: 'sedentary', environment: 'indoor', diet: 'veg', goal: 'fat-loss', days: 3, experience: 'beginner' } },
  { name: 'nonveg male lean bulk', input: { age: 22, gender: 'male', weight: 61, height: 180, neck: null, waist: null, hip: null, activity: 'very', environment: 'outdoor', diet: 'nonveg', goal: 'lean-gain', days: 6, experience: 'advanced' } },
  { name: 'eggitarian female senior maintain', input: { age: 68, gender: 'female', weight: 68, height: 158, neck: 34, waist: 88, hip: 102, activity: 'light', environment: 'indoor', diet: 'eggitarian', goal: 'maintain', days: 0, experience: 'beginner' } },
  { name: 'veg female outdoor recomp', input: { age: 45, gender: 'female', weight: 60, height: 165, neck: 31, waist: 74, hip: 95, activity: 'light', environment: 'outdoor', diet: 'veg', goal: 'recomp', days: 5, experience: 'intermediate' } }
];

/* ---------- nutrition ---------- */
for (const { name, input } of PROFILES) {
  const r = Nutrition.compute(input);
  const kcal = r.protein * 4 + r.carbs * 4 + r.fat * 9;
  near(kcal, r.targetKcal, 5, `${name}: macros add up to the calorie target`);
  ok(r.protein > 0 && r.carbs > 0 && r.fat > 0, `${name}: macros are positive`);
  ok(r.bodyFat > 3 && r.bodyFat < 60, `${name}: body fat in range`);
  ok(r.leanMass > 0 && r.leanMass < input.weight, `${name}: lean mass is sane`);
  ok(r.tdee > r.bmr, `${name}: TDEE exceeds BMR`);
  ok(r.targetKcal >= r.bmr * 1.0 || input.goal !== 'fat-loss', `${name}: deficit never drops below BMR`);
  ok(r.micros.length >= 20, `${name}: micronutrient list present`);
  ok(r.targetKcal % 10 === 0, `${name}: target calories rounded`);
}

// Known Navy-method values (men) — waist 84, neck 38, height 176 should be ~16%.
near(Nutrition.navyBodyFat({ gender: 'male', height: 176, neck: 38, waist: 84 }), 16, 1.5, 'US Navy male body fat ≈ 16%');
// Women need hip, men do not.
ok(Nutrition.navyBodyFat({ gender: 'female', height: 165, neck: 31, waist: 74 }) === null, 'women need a hip measurement');
ok(Nutrition.navyBodyFat({ gender: 'female', height: 165, neck: 31, waist: 74, hip: 95 }) !== null, 'women with all measurements compute');

// Micronutrient rules
const iron = (r) => r.micros.find((m) => m.name === 'Iron').amount;
const cal = (r) => r.micros.find((m) => m.name === 'Calcium').amount;
ok(iron(Nutrition.compute(PROFILES[1].input)) === 18, 'iron 18 mg for a menstruating woman');
ok(iron(Nutrition.compute(PROFILES[3].input)) === 8, 'iron 8 mg for a woman past 51');
ok(cal(Nutrition.compute(PROFILES[3].input)) === 1200, 'calcium 1200 mg for a woman past 50');

/* ---------- meals ---------- */
for (const { name, input } of PROFILES) {
  const r = Nutrition.compute(input);
  const plan = Meals.buildPlan(r, 7);
  ok(plan.length === 7, `${name}: 7 days of meals`);
  ok(plan.every((d) => d.meals.length === 4), `${name}: 4 meals a day`);
  for (const day of plan) {
    near(day.totals.kcal, r.targetKcal, r.targetKcal * 0.05, `${name}: day ${day.day} calories`);
    ok(day.totals.p >= r.protein * 0.75, `${name}: day ${day.day} protein ≥75% of target`, `${Math.round(day.totals.p)} vs ${Math.round(r.protein)}`);
    for (const meal of day.meals) {
      for (const item of meal.items) {
        ok(item.grams >= 3 && item.grams <= 400, `${name}: portion for ${item.name} is sane`, `${item.grams} g`);
        ok(Meals.macrosOf([[item.id, item.grams]]).kcal > 0, `${name}: ${item.name} contributes calories`);
      }
    }
  }
}

// Every template in every pool must be usable.
for (const [diet, slots] of Object.entries(Meals.POOLS)) {
  for (const [slot, list] of Object.entries(slots)) {
    for (const template of list) {
      for (const [id] of template.items) {
        ok(!!global.FOODS[id], `${diet}/${slot} "${template.name}" references a real food`, id);
      }
    }
  }
}

/* ---------- workouts ---------- */
for (let days = 0; days <= 7; days++) {
  for (const environment of ['indoor', 'mixed', 'outdoor']) {
    const w = Workouts.buildPlan({ goal: 'fat-loss', days, environment, age: 30, experience: 'intermediate' });
    ok(w.days.length === days, `${days}d ${environment}: number of sessions matches`);
    ok(w.notes.length > 0, `${days}d ${environment}: coach notes present`);
    w.days.forEach((d) => ok(d.blocks.length > 0 && d.title, `${days}d ${environment}: day ${d.day} has content`));
  }
}

/* ---------- page wiring ---------- */
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8');
const ids = new Set([...app.matchAll(/\$\('([a-zA-Z0-9_-]+)'\)/g)].map((m) => m[1]));
for (const id of ids) {
  ok(html.includes(`id="${id}"`), `index.html contains #${id}`);
}
for (const asset of ['css/styles.css', 'js/foods.js', 'js/nutrition.js', 'js/meals.js', 'js/workouts.js', 'js/app.js']) {
  ok(fs.existsSync(path.join(root, asset)), `${asset} exists`);
  ok(html.includes(asset), `index.html links ${asset}`);
}

/* ---------- UI integration (minimal DOM shim) ---------- */
const FIELDS = {
  age: '29', gender: 'male', weight: '74', height: '176', neck: '38', waist: '84', hip: '96',
  activity: 'moderate', environment: 'mixed', diet: 'veg', goal: 'fat-loss', days: '4',
  experience: 'intermediate'
};
const nodes = new Map();
function makeNode(id) {
  return {
    id,
    value: FIELDS[id] || '',
    innerHTML: '',
    textContent: '',
    // Mirrors the `hidden` attribute in index.html for #results and #errors.
    hidden: id === 'results' || id === 'errors',
    _on: {},
    addEventListener(type, fn) { (this._on[type] = this._on[type] || []).push(fn); },
    dispatch(type, ev) { (this._on[type] || []).forEach((fn) => fn(ev || { preventDefault() {} })); },
    reset() {},
    scrolled: false,
    scrollIntoView() { this.scrolled = true; }
  };
}
global.document = {
  _ready: [],
  addEventListener(type, fn) { if (type === 'DOMContentLoaded') this._ready.push(fn); },
  getElementById(id) {
    if (!nodes.has(id)) nodes.set(id, makeNode(id));
    return nodes.get(id);
  }
};
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
global.print = () => {};

require(path.join(root, 'js', 'app.js'));
document._ready.forEach((fn) => fn());

const $ = (id) => document.getElementById(id);
ok($('results').hidden === true, 'UI: first visit shows the inputs, not the results');
ok($('summary').innerHTML === '', 'UI: nothing rendered before calculating');

// Pressing the button renders the plan.
$('intake').dispatch('submit');
ok($('results').hidden === false, 'UI: renders after Calculate');
ok($('summary').innerHTML.includes('Daily calories'), 'UI: summary rendered');
ok($('macros').innerHTML.includes('Protein'), 'UI: macros rendered');
ok($('micros').innerHTML.includes('Vitamin B12'), 'UI: micronutrients rendered');
ok($('meals').innerHTML.includes('Day 7'), 'UI: 7-day meal plan rendered');
ok($('workouts').innerHTML.includes('Day 1'), 'UI: workout plan rendered');
ok(!$('summary').innerHTML.includes('undefined') && !$('summary').innerHTML.includes('NaN'), 'UI: no undefined/NaN in summary');
ok(!$('meals').innerHTML.includes('NaN') && !$('workouts').innerHTML.includes('NaN'), 'UI: no NaN in plan');

// Invalid input is rejected instead of crashing.
$('age').value = '5';
$('intake').dispatch('submit');
ok($('errors').hidden === false, 'UI: invalid age shows an error');
ok($('results').hidden === true, 'UI: results hidden while invalid');

// Reset and example buttons.
$('resetBtn').dispatch('click');
ok($('errors').hidden === true, 'UI: reset clears errors');
$('demoBtn').dispatch('click');
ok($('results').hidden === false, 'UI: example button recalculates');
ok(Number($('weight').value) === 74, 'UI: example fills the form');

// Changing diet must change the plan, not the numbers.
$('diet').value = 'nonveg';
$('intake').dispatch('submit');
const nonvegMeals = $('meals').innerHTML;
ok(nonvegMeals.includes('Chicken') || nonvegMeals.includes('Egg'), 'UI: non-veg plan uses non-veg foods');

// A returning visitor (saved inputs) gets the plan rendered without the page
// jumping past the input block.
$('results').scrolled = false;
global.localStorage = {
  getItem: () => JSON.stringify(FIELDS),
  setItem() {},
  removeItem() {}
};
const appPath = require.resolve(path.join(root, 'js', 'app.js'));
delete require.cache[appPath];
const before = document._ready.length;
require(appPath);
document._ready.slice(before).forEach((fn) => fn());
ok($('results').hidden === false, 'UI: saved inputs render the plan on load');
ok($('results').scrolled === false, 'UI: load does not jump past the inputs');
$('intake').dispatch('submit');
ok($('results').scrolled === true, 'UI: pressing Calculate scrolls to the plan');

/* ---------- report ---------- */
if (failures) {
  console.error(`\n${failures}/${checks} checks failed`);
  process.exit(1);
}
console.log(`✓ all ${checks} checks passed`);
