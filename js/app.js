/* app.js — form handling + rendering. */
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const num = (id) => {
    const v = parseFloat($(id).value);
    return isNaN(v) ? null : v;
  };
  const f0 = (n) => Math.round(n).toLocaleString('en-IN');
  const f1 = (n) => (Math.round(n * 10) / 10).toLocaleString('en-IN');
  const pct = (n) => Math.round(n * 100);

  /* ---------- form <-> storage ---------- */
  const FIELDS = ['age', 'gender', 'weight', 'height', 'neck', 'waist', 'hip',
    'activity', 'environment', 'diet', 'goal', 'days', 'experience'];

  function readForm() {
    return {
      age: num('age'),
      gender: $('gender').value,
      weight: num('weight'),
      height: num('height'),
      neck: num('neck'),
      waist: num('waist'),
      hip: num('hip'),
      activity: $('activity').value,
      environment: $('environment').value,
      diet: $('diet').value,
      goal: $('goal').value,
      days: parseInt($('days').value, 10),
      experience: $('experience').value
    };
  }

  function saveForm() {
    try { localStorage.setItem('ah-input', JSON.stringify(readForm())); } catch (e) { /* ignore */ }
  }

  function restoreForm() {
    try {
      const raw = localStorage.getItem('ah-input');
      if (!raw) return false;
      const data = JSON.parse(raw);
      FIELDS.forEach((k) => {
        if (data[k] == null || data[k] === '') return;
        if ($(k)) $(k).value = data[k];
      });
      return true;
    } catch (e) { return false; }
  }

  /* ---------- validation ---------- */
  function validate(v) {
    const errors = [];
    if (!v.age || v.age < 14 || v.age > 100) errors.push('Enter an age between 14 and 100.');
    if (!v.weight || v.weight < 30 || v.weight > 300) errors.push('Enter a weight between 30 and 300 kg.');
    if (!v.height || v.height < 120 || v.height > 230) errors.push('Enter a height between 120 and 230 cm.');
    if (v.neck != null && (v.neck < 20 || v.neck > 80)) errors.push('Neck looks out of range (20–80 cm).');
    if (v.waist != null && (v.waist < 40 || v.waist > 200)) errors.push('Waist looks out of range (40–200 cm).');
    if (v.hip != null && (v.hip < 50 || v.hip > 200)) errors.push('Hip looks out of range (50–200 cm).');
    return errors;
  }

  /* ---------- render pieces ---------- */
  function statCard(label, value, unit, sub, tone) {
    return `<div class="stat ${tone ? 'tone-' + tone : ''}">
      <span class="stat-label">${label}</span>
      <span class="stat-value">${value}<small>${unit || ''}</small></span>
      ${sub ? `<span class="stat-sub">${sub}</span>` : ''}
    </div>`;
  }

  function macroRow(name, grams, kcal, share, color) {
    return `<div class="macro-row">
      <div class="macro-head">
        <span><b>${name}</b> <em>${f0(grams)} g</em></span>
        <span>${f0(kcal)} kcal · ${pct(share)}%</span>
      </div>
      <div class="bar"><i style="width:${Math.min(100, pct(share))}%;background:${color}"></i></div>
    </div>`;
  }

  function renderSummary(r, input) {
    const calTone = r.goal.kcalAdj < 0 ? 'good' : r.goal.kcalAdj > 0 ? 'warn' : 'neutral';
    return `
    <div class="stats-grid">
      ${statCard('Daily calories', f0(r.targetKcal), ' kcal', r.goal.label, calTone)}
      ${statCard('TDEE (maintenance)', f0(r.tdee), ' kcal', `${f0(r.annual)} kcal / year`)}
      ${statCard('BMR', f0(r.bmr), ' kcal', r.bmrFormula)}
      ${statCard('BMI', f1(r.bmi), '', r.bmiCategory.label, r.bmiCategory.tone)}
      ${statCard('Body fat', f1(r.bodyFat), ' %', r.bodyFatCategory.label, r.bodyFatCategory.tone)}
      ${statCard('Lean body mass', f1(r.leanMass), ' kg', `Fat mass ${f1(r.fatMass)} kg`)}
    </div>

    <div class="callout">
      <strong>Body-fat source:</strong> ${r.bodyFatSource}.
      ${r.waist ? `<strong>Waist : height</strong> ${f1(r.waistToHeight * 100)}% ${r.waistToHeight < 0.5 ? '(healthy &lt; 50%)' : '(aim below 50%)'}.` : ''}
      ${r.waistToHip ? `<strong>Waist : hip</strong> ${f1(r.waistToHip * 100)}% (healthy ${input.gender === 'male' ? '&lt; 95%' : '&lt; 85%'}).` : ''}
      Healthy weight range for your height: <strong>${f1(r.healthyMin)}–${f1(r.healthyMax)} kg</strong>.
    </div>

    ${r.kcalAdjusted ? `<div class="callout warn-callout">⚠️ Your deficit was capped — the plan will not go below your BMR (${f0(r.bmr)} kcal) or the safe minimum. Add movement (steps/cardio) to create the deficit instead of cutting food further.</div>` : ''}

    <div class="micro-quick">
      <span><b>${f0(r.fiber)} g</b> fibre</span>
      <span><b>${f0(r.waterMl)} ml</b> water</span>
      <span><b>${f0(r.protein / input.weight)} g/kg</b> protein</span>
      <span><b>${Math.min(100, r.actFactor / 1.9 * 100).toFixed(0)}%</b> activity level</span>
    </div>`;
  }

  function renderMacros(r) {
    const proteinKcal = r.protein * 4, carbKcal = r.carbs * 4, fatKcal = r.fat * 9;
    return `
    <div class="macro-cards">
      <div class="macro-card"><span>Calories</span><b>${f0(r.targetKcal)}</b><em>kcal / day</em></div>
      <div class="macro-card p"><span>Protein</span><b>${f0(r.protein)} g</b><em>${f0(proteinKcal)} kcal</em></div>
      <div class="macro-card c"><span>Carbs</span><b>${f0(r.carbs)} g</b><em>${f0(carbKcal)} kcal</em></div>
      <div class="macro-card f"><span>Fat</span><b>${f0(r.fat)} g</b><em>${f0(fatKcal)} kcal</em></div>
    </div>
    <div class="macro-rows">
      ${macroRow('Protein', r.protein, proteinKcal, r.macroSplit.protein, 'linear-gradient(90deg,#4ade80,#22d3ee)')}
      ${macroRow('Carbs', r.carbs, carbKcal, r.macroSplit.carbs, 'linear-gradient(90deg,#60a5fa,#a78bfa)')}
      ${macroRow('Fat', r.fat, fatKcal, r.macroSplit.fat, 'linear-gradient(90deg,#fbbf24,#fb7185)')}
    </div>
    <p class="hint">Protein target is set from ${r.bodyFatSource.includes('Navy') ? 'lean body mass' : 'body weight'} for your goal (${r.goal.label}). Spread it across 3–5 meals of 25–40 g for best muscle protein synthesis.</p>`;
  }

  function renderMicros(r) {
    const rows = r.micros.map((m) => `
      <tr>
        <td>${m.name}${m.note ? `<div class="micro-note">${m.note}</div>` : ''}</td>
        <td class="num"><b>${m.amount}</b> ${m.unit}</td>
        <td class="src">${m.sources}</td>
      </tr>`).join('');

    const flags = r.dietFlags.length
      ? `<div class="flags">
          <h4>Watch-outs for your diet type</h4>
          ${r.dietFlags.map((f) => `<div class="flag"><b>${f.title}</b><span>${f.text}</span></div>`).join('')}
        </div>`
      : `<div class="flags"><h4>Diet check</h4><div class="flag"><b>Good variety</b><span>Animal foods cover B12, iron, zinc and omega-3 — keep at least 2 fish servings a week for EPA/DHA.</span></div></div>`;

    return `<div class="table-wrap">
      <table class="micro-table">
        <thead><tr><th>Micronutrient</th><th class="num">Daily target</th><th>Best sources</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>${flags}`;
  }

  function renderMeals(plan, r) {
    const days = plan.map((d) => {
      const totals = d.totals;
      const meals = d.meals.map((m) => `
        <div class="meal">
          <div class="meal-head">
            <h5>${m.icon} ${m.slot} <small>${m.name}</small></h5>
            <span class="meal-kcal">${f0(m.totals.kcal)} kcal · P ${f0(m.totals.p)} · C ${f0(m.totals.c)} · F ${f0(m.totals.f)}</span>
          </div>
          <ul class="items">
            ${m.items.map((i) => `<li><span>${i.name}${i.added ? ' <em class="topup">protein top-up</em>' : ''}</span><b>${i.grams} g</b></li>`).join('')}
          </ul>
        </div>`).join('');

      return `<details class="day" ${d.day === 1 ? 'open' : ''}>
        <summary>
          <span class="day-name">Day ${d.day}</span>
          <span class="day-macros">${f0(totals.kcal)} kcal · P ${f0(totals.p)} g · C ${f0(totals.c)} g · F ${f0(totals.f)} g · Fibre ${f0(totals.fiber)} g</span>
        </summary>
        <div class="meals">${meals}</div>
      </details>`;
    }).join('');

    return `<p class="hint">Built for a <b>${r.input.diet === 'veg' ? 'vegetarian' : r.input.diet === 'eggitarian' ? 'eggitarian' : 'non-vegetarian'}</b>
      plan at <b>${f0(r.targetKcal)} kcal/day</b> — portions are solved to hit your calories and protein, so grams can look precise.
      Swap any item for a similar one (paneer ↔ tofu, rice ↔ roti, chicken ↔ fish, whey ↔ 2 eggs).
      Items marked <em class="topup">protein top-up</em> were added purely to reach your protein target — mix them into the dish or eat them on the side.</p>${days}`;
  }

  function renderWorkouts(w, r) {
    const days = w.days.length
      ? w.days.map((d) => `
        <div class="wday">
          <div class="wday-head">
            <span class="wbadge ${d.type}">${d.type}</span>
            <h5>Day ${d.day} — ${d.title}</h5>
            <span class="whint">${d.sets}</span>
          </div>
          ${d.blocks.map((b) => `
            <div class="block">
              <div class="block-name">${b.name}</div>
              <ul>${b.items.map((i) => `<li>${i}</li>`).join('')}</ul>
            </div>`).join('')}
        </div>`).join('')
      : '<p class="hint">No training days selected.</p>';

    return `<p class="hint">${r.input.days} session${r.input.days === 1 ? '' : 's'}/week ·
      ${r.input.environment === 'outdoor' ? 'outdoor-first' : r.input.environment === 'mixed' ? 'mixed indoor + outdoor' : 'indoor-friendly'} ·
      ${r.input.experience} level. Rest 48 h before training the same muscle group again.</p>
      ${days}
      <div class="flags"><h4>Coach notes</h4>
        ${w.notes.map((n) => `<div class="flag"><b>•</b><span>${n}</span></div>`).join('')}
      </div>`;
  }

  /* ---------- main ---------- */
  function calculate({ scroll = true } = {}) {
    const input = readForm();
    const errors = validate(input);
    const errBox = $('errors');

    if (errors.length) {
      errBox.innerHTML = errors.map((x) => `<div>${x}</div>`).join('');
      errBox.hidden = false;
      $('results').hidden = true;
      return;
    }
    errBox.hidden = true;
    saveForm();

    const r = window.Nutrition.compute(input);

    const mealPlan = window.Meals.buildPlan(r, 7);
    const workouts = window.Workouts.buildPlan({
      goal: input.goal,
      days: input.days,
      environment: input.environment,
      age: input.age,
      experience: input.experience
    });

    $('summary').innerHTML = renderSummary(r, input);
    $('macros').innerHTML = renderMacros(r);
    $('micros').innerHTML = renderMicros(r);
    $('meals').innerHTML = renderMeals(mealPlan, r);
    $('workouts').innerHTML = renderWorkouts(workouts, r);

    $('results').hidden = false;
    if (scroll) $('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function reset() {
    $('intake').reset();
    $('results').hidden = true;
    $('errors').hidden = true;
    try { localStorage.removeItem('ah-input'); } catch (e) { /* ignore */ }
  }

  function demo() {
    Object.entries({
      age: 29, gender: 'male', weight: 74, height: 176, neck: 38, waist: 84, hip: 96,
      activity: 'moderate', environment: 'mixed', diet: 'veg', goal: 'fat-loss', days: 4, experience: 'intermediate'
    }).forEach(([k, v]) => { if ($(k)) $(k).value = v; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    const restored = restoreForm();
    $('intake').addEventListener('submit', (e) => { e.preventDefault(); calculate(); });
    $('intake').addEventListener('change', saveForm);
    $('resetBtn').addEventListener('click', reset);
    $('demoBtn').addEventListener('click', () => { demo(); calculate(); });
    $('printBtn').addEventListener('click', () => window.print());

    // Live day-count label
    const days = $('days');
    const updateDays = () => { $('daysOut').textContent = days.value + ' session' + (days.value === '1' ? '' : 's') + ' / week'; };
    days.addEventListener('input', updateDays);
    updateDays();

    // Returning visitors get their plan rendered immediately — without the page
    // jumping past the inputs.
    if (restored) calculate({ scroll: false });
  });
})();
