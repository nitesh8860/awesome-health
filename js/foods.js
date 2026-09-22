/* foods.js — macro data per 100 g (cooked where noted). Values are rounded
 * USDA/IFCT-style references, good enough for meal-plan estimation.
 */
(function (global) {
  'use strict';

  const F = (name, kcal, p, c, f, fiber) => ({ name, kcal, p, c, f, fiber: fiber || 0 });

  global.FOODS = {
    /* Grains & starches */
    oats: F('Rolled oats (dry)', 389, 16.9, 66.3, 6.9, 10.6),
    poha: F('Poha / flattened rice (dry)', 350, 6.6, 77.0, 1.2, 1.5),
    rava: F('Rava / semolina (dry)', 360, 12.7, 72.8, 1.1, 3.9),
    atta: F('Whole-wheat flour (atta)', 340, 13.0, 71.0, 2.5, 11.0),
    riceCooked: F('Rice, cooked', 130, 2.7, 28.0, 0.3, 0.4),
    brownRiceCooked: F('Brown rice, cooked', 123, 2.7, 25.6, 1.0, 1.6),
    quinoaCooked: F('Quinoa, cooked', 120, 4.4, 21.3, 1.9, 2.8),
    breadWW: F('Whole-wheat bread', 247, 13.0, 41.0, 3.4, 6.0),
    potato: F('Potato, boiled', 77, 2.0, 17.0, 0.1, 1.8),
    sweetPotato: F('Sweet potato, boiled', 86, 1.6, 20.1, 0.1, 3.0),
    makhana: F('Makhana / fox nuts', 347, 9.7, 76.9, 0.1, 7.0),

    /* Pulses & legumes (cooked) */
    toorDal: F('Toor dal, cooked', 116, 7.0, 20.0, 0.4, 4.0),
    moongDal: F('Moong dal, cooked', 105, 7.0, 19.0, 0.4, 3.0),
    rajma: F('Rajma, cooked', 127, 8.7, 22.8, 0.5, 6.4),
    chole: F('Chole / chickpeas, cooked', 164, 8.9, 27.4, 2.6, 7.6),
    sprouts: F('Moong sprouts', 30, 3.0, 5.9, 0.2, 1.8),
    soyaChunks: F('Soya chunks (dry)', 345, 52.0, 33.0, 0.5, 13.0),
    besan: F('Besan / gram flour', 387, 22.0, 58.0, 6.0, 10.0),
    tofu: F('Tofu', 144, 15.7, 4.3, 8.7, 2.3),

    /* Dairy & eggs */
    paneer: F('Paneer', 265, 18.0, 1.2, 21.0, 0),
    curd: F('Curd / dahi', 61, 3.5, 4.7, 3.3, 0),
    greekYogurt: F('Hung curd / Greek yogurt', 97, 9.0, 3.9, 5.0, 0),
    milk: F('Milk, full-fat', 61, 3.2, 4.8, 3.3, 0),
    milkToned: F('Milk, toned', 50, 3.4, 5.0, 1.5, 0),
    whey: F('Whey protein isolate', 370, 80.0, 8.0, 4.0, 0),
    egg: F('Egg, whole', 155, 13.0, 1.1, 11.0, 0),
    eggWhite: F('Egg white', 52, 11.0, 0.7, 0.2, 0),

    /* Meat & fish */
    chickenBreast: F('Chicken breast, grilled', 165, 31.0, 0, 3.6, 0),
    chickenThigh: F('Chicken thigh, cooked', 209, 26.0, 0, 11.0, 0),
    fish: F('Fish (rohu / tilapia)', 97, 16.6, 0, 3.0, 0),
    salmon: F('Salmon', 208, 20.0, 0, 13.0, 0),
    tuna: F('Tuna, canned in water', 116, 26.0, 0, 1.0, 0),
    prawns: F('Prawns', 99, 24.0, 0.2, 0.3, 0),
    mutton: F('Mutton / lamb, cooked', 258, 25.0, 0, 17.0, 0),

    /* Nuts, seeds, fats */
    almonds: F('Almonds', 579, 21.0, 21.6, 49.9, 12.5),
    peanuts: F('Peanuts', 567, 25.8, 16.1, 49.2, 8.5),
    walnuts: F('Walnuts', 654, 15.2, 13.7, 65.2, 6.7),
    flax: F('Flaxseed', 534, 18.3, 28.9, 42.2, 27.3),
    chia: F('Chia seeds', 486, 16.5, 42.1, 30.7, 34.4),
    chanaRoasted: F('Roasted chana', 364, 19.0, 58.0, 5.0, 12.0),
    ghee: F('Ghee', 900, 0, 0, 100.0, 0),
    oliveOil: F('Olive / mustard oil', 884, 0, 0, 100.0, 0),
    coconut: F('Fresh coconut', 354, 3.3, 15.2, 33.5, 9.0),
    honey: F('Honey / jaggery', 304, 0.3, 82.4, 0, 0),

    /* Fruit & veg */
    banana: F('Banana', 89, 1.1, 22.8, 0.3, 2.6),
    apple: F('Apple', 52, 0.3, 13.8, 0.2, 2.4),
    orange: F('Orange', 47, 0.9, 11.8, 0.1, 2.4),
    guava: F('Guava', 68, 2.6, 14.3, 1.0, 5.4),
    dates: F('Dates', 282, 2.5, 75.0, 0.4, 8.0),
    spinach: F('Spinach', 23, 2.9, 3.6, 0.4, 2.2),
    mixedVeg: F('Mixed vegetables', 40, 2.0, 8.0, 0.3, 3.0),
    broccoli: F('Broccoli', 34, 2.8, 6.6, 0.4, 2.6),
    tomato: F('Tomato', 18, 0.9, 3.9, 0.2, 1.2),
    cucumber: F('Cucumber / salad', 15, 0.7, 3.6, 0.1, 0.5),
    carrot: F('Carrot', 41, 0.9, 9.6, 0.2, 2.8),
    sambar: F('Sambar', 45, 2.5, 6.0, 1.0, 1.5)
  };
})(window);
