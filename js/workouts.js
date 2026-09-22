/* workouts.js — weekly training plan generator.
 * Adapts to goal, days/week, indoor vs outdoor, age and experience.
 */
(function (global) {
  'use strict';

  const SETS = {
    'fat-loss': { scheme: '3–4 sets × 10–15 reps', rest: '45–75 s rest', note: 'Keep rest short and the pace brisk to keep the heart rate up.' },
    recomp: { scheme: '3–4 sets × 8–12 reps', rest: '60–90 s rest', note: 'Leave 1–2 reps in reserve on every set.' },
    maintain: { scheme: '3 sets × 8–12 reps', rest: '60–90 s rest', note: 'Consistency beats intensity — train hard, recover harder.' },
    'lean-gain': { scheme: '4 sets × 6–10 reps', rest: '90–120 s rest', note: 'Add weight or a rep each week (progressive overload).' }
  };

  const INDOOR = {
    fullA: ['Goblet squat', 'Dumbbell bench press or push-ups', 'One-arm dumbbell row', 'Romanian deadlift', 'Front plank'],
    fullB: ['Bulgarian split squat', 'Seated overhead press', 'Lat pulldown or band row', 'Hip thrust', 'Dead bug'],
    fullC: ['Leg press or step-ups', 'Incline dumbbell press', 'Seated cable row', 'Leg curl', 'Side plank'],
    push: ['Bench press', 'Seated overhead press', 'Incline dumbbell press', 'Lateral raise', 'Triceps pushdown', 'Push-up burnout'],
    pull: ['Pull-up or lat pulldown', 'Barbell / dumbbell row', 'Seated cable row', 'Face pull', 'Dumbbell curl', 'Hanging knee raise'],
    legs: ['Barbell or goblet squat', 'Romanian deadlift', 'Leg press', 'Leg curl', 'Standing calf raise', 'Weighted plank'],
    upper: ['Bench press', 'Chest-supported row', 'Overhead press', 'Lat pulldown', 'Dumbbell curl', 'Overhead triceps extension'],
    lower: ['Squat', 'Romanian deadlift', 'Walking lunge', 'Leg curl', 'Calf raise', 'Cable crunch']
  };

  const OUTDOOR = {
    fullA: ['Bodyweight squat or jump squat', 'Park-bar pull-up', 'Bench push-up', 'Step-up on bench', 'Hill walk / jog'],
    fullB: ['Walking lunge', 'Incline push-up on bench', 'Sprinter / bear-crawl row under bar', 'Broad jump', 'Plank on grass'],
    fullC: ['Stair climb repeats', 'Dip on parallel bars', 'Australian pull-up (low bar)', 'Squat jump', 'Side plank'],
    push: ['Bench push-up variations', 'Dip on parallel bars', 'Pike push-up', 'Bench dip', 'Plank shoulder taps'],
    pull: ['Park-bar pull-up (all grips)', 'Australian row', 'Towel row on bar', 'Hanging knee raise', 'Sprint the straight'],
    legs: ['Walking lunge', 'Hill sprint', 'Broad jump', 'Stair climb', 'Calf raise on kerb'],
    upper: ['Pull-up', 'Push-up', 'Dips', 'Australian row', 'Plank to push-up'],
    lower: ['Walking lunge', 'Hill sprint repeat', 'Box jump on bench', 'Broad jump', 'Stair climb']
  };

  const CARDIO = {
    indoor: {
      fat: '25–35 min incline treadmill walk / cycle / rower at conversational pace',
      hiit: '15 min: 30 s hard on bike or rower / 60 s easy × 10',
      recovery: '20 min easy walk + 5 min yoga flow'
    },
    outdoor: {
      fat: '30–40 min brisk walk / easy jog / cycle in Zone 2',
      hiit: 'Hill sprints: 8 × 20 s hard up, walk down',
      recovery: '25 min easy walk + 10 min mobility in the park'
    }
  };

  const SPLITS = {
    1: ['fullA'],
    2: ['fullA', 'fullB'],
    3: ['fullA', 'fullB', 'fullC'],
    4: ['upper', 'lower', 'upper', 'lower'],
    5: ['push', 'pull', 'legs', 'upper', 'lower'],
    6: ['push', 'pull', 'legs', 'push', 'pull', 'legs'],
    7: ['push', 'pull', 'legs', 'upper', 'lower', 'cardio', 'mobility']
  };

  function switchSplit(days, experience) {
    if (days === 3 && experience !== 'beginner') return ['push', 'pull', 'legs'];
    if ((days === 4 || days === 5) && experience === 'beginner') {
      return days === 4 ? ['fullA', 'fullB', 'fullC', 'cardio'] : ['fullA', 'fullB', 'fullC', 'cardio', 'cardio'];
    }
    return SPLITS[days];
  }

  const LABELS = {
    push: { title: 'Push — chest, shoulders, triceps', type: 'strength' },
    pull: { title: 'Pull — back & biceps', type: 'strength' },
    legs: { title: 'Legs & core', type: 'strength' },
    upper: { title: 'Upper body', type: 'strength' },
    lower: { title: 'Lower body & core', type: 'strength' },
    fullA: { title: 'Full body A', type: 'strength' },
    fullB: { title: 'Full body B', type: 'strength' },
    fullC: { title: 'Full body C', type: 'strength' },
    cardio: { title: 'Conditioning', type: 'cardio' },
    mobility: { title: 'Mobility & recovery', type: 'recovery' }
  };

  function buildPlan({ goal, days, environment, age, experience }) {
    const env = environment === 'outdoor' ? 'outdoor' : environment === 'mixed' ? 'indoor' : 'indoor';
    const EX = env === 'outdoor' ? OUTDOOR : INDOOR;
    const card = CARDIO[env];
    const s = SETS[goal];

    // Mix environments: "mixed" users get outdoor cardio days.
    const outdoorCardio = environment === 'mixed' || environment === 'outdoor';

    if (!days || days < 1) {
      return {
        days: [],
        notes: [
          'No structured training days selected — start with 3 short sessions per week and build up.',
          `Daily movement target: 7,000–10,000 steps${age >= 60 ? ' and 10 minutes of mobility' : ''}.`
        ]
      };
    }

    const split = switchSplit(days, experience);
    const plan = [];
    let strengthIndex = 0;

    split.forEach((focus, i) => {
      const label = LABELS[focus];
      const blocks = [];

      if (focus === 'mobility') {
        blocks.push({ name: 'Flow', items: ["Cat-cow, world's greatest stretch, 90/90 hips — 2 rounds", 'Thoracic opener on wall — 2 × 8/side', 'Deep squat hold — 3 × 30 s', 'Hip flexor + hamstring stretch — 3 × 30 s', '10 min easy walk or cycle'] });
        plan.push({ day: i + 1, title: label.title, type: 'recovery', blocks, sets: '1–2 rounds, easy breathing' });
        return;
      }

      if (focus === 'cardio') {
        blocks.push({
          name: 'Session',
          items: [card.fat, goal === 'fat-loss' ? card.hiit : card.recovery, 'Finish with 5 min easy pace + stretching']
        });
        plan.push({ day: i + 1, title: label.title, type: 'cardio', blocks, sets: '40–50 min total' });
        return;
      }

      const main = EX[focus];
      blocks.push({
        name: 'Warm-up (5–8 min)',
        items: [env === 'outdoor'
          ? 'Brisk walk / easy jog + arm & leg swings'
          : '5 min bike, rower or treadmill + arm circles and leg swings', '2 light ramp-up sets of the first exercise']
      });
      blocks.push({
        name: 'Main work',
        items: main.map((ex, idx) => `${ex} — ${idx === main.length - 1 ? '3 × 30–45 s' : s.scheme}`)
      });
      blocks.push({
        name: 'Finisher',
        items: goal === 'fat-loss'
          ? [outdoorCardio ? '10 min brisk walk / jog intervals outdoors' : '10 min treadmill incline walk or bike sprints', 'Core circuit — 3 rounds']
          : goal === 'lean-gain'
            ? ['5 min easy walk to cool down', 'Optional: 1 set to near-failure on a lagging lift']
            : ['8–10 min Zone 2 (walk / cycle)', 'Core circuit — 2–3 rounds']
      });
      blocks.push({ name: 'Cool-down', items: ['3–5 min easy pace', 'Stretch the muscles you just trained — 30 s each'] });

      plan.push({ day: i + 1, title: label.title, type: 'strength', blocks, sets: s.scheme });
      strengthIndex++;
    });

    const notes = [s.note, `After each block, add a small progression: +1 rep or +2.5% load per week.`];

    if (goal === 'fat-loss') {
      notes.push(`Cardio: add 2 extra ${env === 'outdoor' ? 'outdoor Zone 2 sessions' : 'incline-walk or cycle sessions'} if fat loss stalls.`);
      notes.push('Step target: 8,000–10,000 steps daily — this is where most of the deficit comes from.');
    } else if (goal === 'lean-gain') {
      notes.push('Keep cardio short (1–2 × 20 min Zone 2) so it does not eat into recovery.');
      notes.push('Sleep 7–9 h; muscle is built outside the gym.');
    } else {
      notes.push('Log your lifts — if the top set feels easy, add load next week.');
    }

    if (age >= 50) notes.push('Age 50+: add 10 min of mobility before every session, warm up thoroughly and keep 1–2 reps in reserve.');
    if (age >= 65) notes.push('Age 65+: include balance work (single-leg stands, heel-to-toe walk) and prefer low-impact cardio like cycling or swimming.');
    if (experience === 'beginner') notes.push('Beginner: start with 2 sets per exercise in week 1 and build to the prescribed volume by week 4.');
    if (outdoorCardio) notes.push('Outdoor tip: train early morning or evening in summer, and carry water for anything over 40 min.');

    return { days: plan, notes };
  }

  global.Workouts = { buildPlan, SETS };
})(window);
