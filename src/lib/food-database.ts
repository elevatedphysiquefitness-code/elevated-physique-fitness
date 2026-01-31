// Comprehensive Food Database
// Includes common grocery items, restaurant foods, and whole foods

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
}

export const foodDatabase: FoodItem[] = [
  // ========================================
  // PROTEINS - Grocery Store
  // ========================================
  { id: 'chicken-breast-raw', name: 'Chicken Breast', category: 'Protein', servingSize: '4 oz (113g)', calories: 120, protein: 26, carbs: 0, fat: 1.5, tags: ['chicken', 'poultry', 'lean'] },
  { id: 'chicken-thigh', name: 'Chicken Thigh', category: 'Protein', servingSize: '4 oz (113g)', calories: 180, protein: 22, carbs: 0, fat: 10, tags: ['chicken', 'poultry'] },
  { id: 'ground-chicken', name: 'Ground Chicken', category: 'Protein', servingSize: '4 oz (113g)', calories: 170, protein: 20, carbs: 0, fat: 9, tags: ['chicken', 'ground'] },
  { id: 'ground-turkey-93', name: 'Ground Turkey (93% Lean)', category: 'Protein', servingSize: '4 oz (113g)', calories: 170, protein: 21, carbs: 0, fat: 9, tags: ['turkey', 'ground', 'lean'] },
  { id: 'ground-turkey-99', name: 'Ground Turkey (99% Lean)', category: 'Protein', servingSize: '4 oz (113g)', calories: 120, protein: 26, carbs: 0, fat: 1.5, tags: ['turkey', 'ground', 'extra lean'] },
  { id: 'turkey-breast-deli', name: 'Turkey Breast Deli Meat', category: 'Protein', servingSize: '2 oz (56g)', calories: 60, protein: 12, carbs: 2, fat: 0.5, tags: ['turkey', 'deli', 'lunch meat'] },
  { id: 'ground-beef-90', name: 'Ground Beef (90% Lean)', category: 'Protein', servingSize: '4 oz (113g)', calories: 200, protein: 23, carbs: 0, fat: 11, tags: ['beef', 'ground'] },
  { id: 'ground-beef-80', name: 'Ground Beef (80% Lean)', category: 'Protein', servingSize: '4 oz (113g)', calories: 280, protein: 20, carbs: 0, fat: 22, tags: ['beef', 'ground'] },
  { id: 'sirloin-steak', name: 'Sirloin Steak', category: 'Protein', servingSize: '4 oz (113g)', calories: 200, protein: 26, carbs: 0, fat: 10, tags: ['beef', 'steak'] },
  { id: 'ribeye-steak', name: 'Ribeye Steak', category: 'Protein', servingSize: '4 oz (113g)', calories: 310, protein: 24, carbs: 0, fat: 24, tags: ['beef', 'steak'] },
  { id: 'filet-mignon', name: 'Filet Mignon', category: 'Protein', servingSize: '4 oz (113g)', calories: 180, protein: 26, carbs: 0, fat: 8, tags: ['beef', 'steak', 'lean'] },
  { id: 'pork-chop', name: 'Pork Chop (Boneless)', category: 'Protein', servingSize: '4 oz (113g)', calories: 185, protein: 26, carbs: 0, fat: 8, tags: ['pork'] },
  { id: 'pork-tenderloin', name: 'Pork Tenderloin', category: 'Protein', servingSize: '4 oz (113g)', calories: 125, protein: 26, carbs: 0, fat: 2, tags: ['pork', 'lean'] },
  { id: 'bacon', name: 'Bacon', category: 'Protein', servingSize: '2 slices (16g)', calories: 90, protein: 6, carbs: 0, fat: 7, tags: ['pork', 'bacon'] },
  { id: 'turkey-bacon', name: 'Turkey Bacon', category: 'Protein', servingSize: '2 slices (28g)', calories: 60, protein: 4, carbs: 1, fat: 4.5, tags: ['turkey', 'bacon'] },
  { id: 'salmon-atlantic', name: 'Salmon (Atlantic)', category: 'Protein', servingSize: '4 oz (113g)', calories: 230, protein: 25, carbs: 0, fat: 14, tags: ['fish', 'salmon', 'omega-3'] },
  { id: 'salmon-sockeye', name: 'Salmon (Sockeye)', category: 'Protein', servingSize: '4 oz (113g)', calories: 190, protein: 24, carbs: 0, fat: 10, tags: ['fish', 'salmon', 'omega-3'] },
  { id: 'tilapia', name: 'Tilapia', category: 'Protein', servingSize: '4 oz (113g)', calories: 110, protein: 23, carbs: 0, fat: 2, tags: ['fish', 'lean', 'white fish'] },
  { id: 'cod', name: 'Cod', category: 'Protein', servingSize: '4 oz (113g)', calories: 90, protein: 20, carbs: 0, fat: 1, tags: ['fish', 'lean', 'white fish'] },
  { id: 'shrimp', name: 'Shrimp', category: 'Protein', servingSize: '4 oz (113g)', calories: 120, protein: 24, carbs: 1, fat: 2, tags: ['seafood', 'shellfish'] },
  { id: 'tuna-canned-water', name: 'Tuna (Canned in Water)', category: 'Protein', servingSize: '1 can (142g)', calories: 150, protein: 33, carbs: 0, fat: 1, tags: ['fish', 'tuna', 'canned'] },
  { id: 'tuna-steak', name: 'Tuna Steak (Ahi)', category: 'Protein', servingSize: '4 oz (113g)', calories: 130, protein: 28, carbs: 0, fat: 1, tags: ['fish', 'tuna'] },

  // Eggs & Dairy Proteins
  { id: 'eggs-whole', name: 'Eggs (Whole)', category: 'Protein', servingSize: '1 large', calories: 70, protein: 6, carbs: 0, fat: 5, tags: ['eggs', 'whole egg'] },
  { id: 'eggs-2-whole', name: 'Eggs (Whole)', category: 'Protein', servingSize: '2 large', calories: 140, protein: 12, carbs: 1, fat: 10, tags: ['eggs', 'whole egg'] },
  { id: 'eggs-3-whole', name: 'Eggs (Whole)', category: 'Protein', servingSize: '3 large', calories: 210, protein: 18, carbs: 1, fat: 15, tags: ['eggs', 'whole egg'] },
  { id: 'egg-whites', name: 'Egg Whites', category: 'Protein', servingSize: '3 large', calories: 50, protein: 11, carbs: 1, fat: 0, tags: ['eggs', 'egg whites', 'lean'] },
  { id: 'egg-whites-carton', name: 'Liquid Egg Whites', brand: 'Generic', category: 'Protein', servingSize: '1/2 cup (122g)', calories: 60, protein: 13, carbs: 1, fat: 0, tags: ['eggs', 'egg whites', 'lean'] },

  // ========================================
  // DAIRY
  // ========================================
  { id: 'greek-yogurt-plain-nonfat', name: 'Greek Yogurt (Plain, Nonfat)', category: 'Dairy', servingSize: '1 cup (227g)', calories: 130, protein: 23, carbs: 9, fat: 0, tags: ['yogurt', 'greek', 'protein'] },
  { id: 'greek-yogurt-plain-2pct', name: 'Greek Yogurt (Plain, 2%)', category: 'Dairy', servingSize: '1 cup (227g)', calories: 150, protein: 20, carbs: 8, fat: 4, tags: ['yogurt', 'greek', 'protein'] },
  { id: 'fage-0', name: 'Fage Total 0%', brand: 'Fage', category: 'Dairy', servingSize: '1 cup (227g)', calories: 120, protein: 22, carbs: 8, fat: 0, tags: ['yogurt', 'greek', 'protein'] },
  { id: 'chobani-nonfat', name: 'Chobani Greek Yogurt (Nonfat)', brand: 'Chobani', category: 'Dairy', servingSize: '1 container (150g)', calories: 90, protein: 15, carbs: 6, fat: 0, tags: ['yogurt', 'greek', 'protein'] },
  { id: 'oikos-triple-zero', name: 'Oikos Triple Zero', brand: 'Dannon', category: 'Dairy', servingSize: '1 container (150g)', calories: 90, protein: 15, carbs: 6, fat: 0, tags: ['yogurt', 'greek', 'protein'] },
  { id: 'cottage-cheese-lowfat', name: 'Cottage Cheese (2% Lowfat)', category: 'Dairy', servingSize: '1 cup (226g)', calories: 180, protein: 26, carbs: 8, fat: 5, tags: ['cottage cheese', 'protein'] },
  { id: 'cottage-cheese-nonfat', name: 'Cottage Cheese (Nonfat)', category: 'Dairy', servingSize: '1 cup (226g)', calories: 120, protein: 24, carbs: 10, fat: 0, tags: ['cottage cheese', 'protein', 'lean'] },
  { id: 'milk-whole', name: 'Whole Milk', category: 'Dairy', servingSize: '1 cup (244ml)', calories: 150, protein: 8, carbs: 12, fat: 8, tags: ['milk'] },
  { id: 'milk-2pct', name: '2% Milk', category: 'Dairy', servingSize: '1 cup (244ml)', calories: 120, protein: 8, carbs: 12, fat: 5, tags: ['milk'] },
  { id: 'milk-skim', name: 'Skim Milk', category: 'Dairy', servingSize: '1 cup (245ml)', calories: 80, protein: 8, carbs: 12, fat: 0, tags: ['milk', 'nonfat'] },
  { id: 'fairlife-2pct', name: 'Fairlife Milk (2%)', brand: 'Fairlife', category: 'Dairy', servingSize: '1 cup (240ml)', calories: 120, protein: 13, carbs: 6, fat: 4.5, tags: ['milk', 'high protein'] },
  { id: 'fairlife-skim', name: 'Fairlife Milk (Skim)', brand: 'Fairlife', category: 'Dairy', servingSize: '1 cup (240ml)', calories: 80, protein: 13, carbs: 6, fat: 0, tags: ['milk', 'high protein', 'nonfat'] },
  { id: 'cheese-cheddar', name: 'Cheddar Cheese', category: 'Dairy', servingSize: '1 oz (28g)', calories: 115, protein: 7, carbs: 0, fat: 9, tags: ['cheese'] },
  { id: 'cheese-mozzarella', name: 'Mozzarella Cheese', category: 'Dairy', servingSize: '1 oz (28g)', calories: 85, protein: 6, carbs: 1, fat: 6, tags: ['cheese'] },
  { id: 'cheese-parmesan', name: 'Parmesan Cheese', category: 'Dairy', servingSize: '1 oz (28g)', calories: 110, protein: 10, carbs: 1, fat: 7, tags: ['cheese'] },
  { id: 'cheese-string', name: 'String Cheese', category: 'Dairy', servingSize: '1 stick (28g)', calories: 80, protein: 7, carbs: 1, fat: 5, tags: ['cheese', 'snack'] },

  // ========================================
  // PROTEIN SUPPLEMENTS
  // ========================================
  { id: 'whey-protein-generic', name: 'Whey Protein Powder', category: 'Supplements', servingSize: '1 scoop (30g)', calories: 120, protein: 24, carbs: 3, fat: 1.5, tags: ['protein powder', 'whey', 'supplement'] },
  { id: 'optimum-nutrition-whey', name: 'Gold Standard Whey', brand: 'Optimum Nutrition', category: 'Supplements', servingSize: '1 scoop (31g)', calories: 120, protein: 24, carbs: 3, fat: 1.5, tags: ['protein powder', 'whey', 'supplement'] },
  { id: 'dymatize-iso100', name: 'ISO100 Whey Isolate', brand: 'Dymatize', category: 'Supplements', servingSize: '1 scoop (32g)', calories: 110, protein: 25, carbs: 1, fat: 0.5, tags: ['protein powder', 'whey', 'isolate', 'supplement'] },
  { id: 'premier-protein-shake', name: 'Premier Protein Shake', brand: 'Premier Protein', category: 'Supplements', servingSize: '1 bottle (340ml)', calories: 160, protein: 30, carbs: 5, fat: 3, tags: ['protein shake', 'ready to drink'] },
  { id: 'fairlife-protein-shake', name: 'Core Power Protein Shake', brand: 'Fairlife', category: 'Supplements', servingSize: '1 bottle (414ml)', calories: 170, protein: 26, carbs: 8, fat: 4.5, tags: ['protein shake', 'ready to drink'] },
  { id: 'casein-protein', name: 'Casein Protein Powder', category: 'Supplements', servingSize: '1 scoop (33g)', calories: 120, protein: 24, carbs: 3, fat: 1, tags: ['protein powder', 'casein', 'slow digesting'] },

  // ========================================
  // CARBOHYDRATES - Grains & Starches
  // ========================================
  { id: 'rice-white-cooked', name: 'White Rice (Cooked)', category: 'Carbs', servingSize: '1 cup (158g)', calories: 205, protein: 4, carbs: 45, fat: 0.5, tags: ['rice', 'grain'] },
  { id: 'rice-brown-cooked', name: 'Brown Rice (Cooked)', category: 'Carbs', servingSize: '1 cup (195g)', calories: 215, protein: 5, carbs: 45, fat: 2, tags: ['rice', 'grain', 'whole grain'] },
  { id: 'rice-jasmine', name: 'Jasmine Rice (Cooked)', category: 'Carbs', servingSize: '1 cup (158g)', calories: 205, protein: 4, carbs: 45, fat: 0.5, tags: ['rice', 'grain'] },
  { id: 'rice-basmati', name: 'Basmati Rice (Cooked)', category: 'Carbs', servingSize: '1 cup (158g)', calories: 210, protein: 5, carbs: 46, fat: 0.5, tags: ['rice', 'grain'] },
  { id: 'quinoa-cooked', name: 'Quinoa (Cooked)', category: 'Carbs', servingSize: '1 cup (185g)', calories: 220, protein: 8, carbs: 39, fat: 4, tags: ['quinoa', 'grain', 'complete protein'] },
  { id: 'oatmeal-cooked', name: 'Oatmeal (Cooked)', category: 'Carbs', servingSize: '1 cup (234g)', calories: 160, protein: 6, carbs: 27, fat: 3, tags: ['oats', 'oatmeal', 'breakfast'] },
  { id: 'oatmeal-dry', name: 'Oats (Dry)', category: 'Carbs', servingSize: '1/2 cup (40g)', calories: 150, protein: 5, carbs: 27, fat: 3, tags: ['oats', 'oatmeal', 'breakfast'] },
  { id: 'pasta-cooked', name: 'Pasta (Cooked)', category: 'Carbs', servingSize: '1 cup (140g)', calories: 220, protein: 8, carbs: 43, fat: 1, tags: ['pasta', 'noodles'] },
  { id: 'pasta-whole-wheat', name: 'Whole Wheat Pasta (Cooked)', category: 'Carbs', servingSize: '1 cup (140g)', calories: 175, protein: 7, carbs: 37, fat: 1, tags: ['pasta', 'whole grain'] },
  { id: 'bread-white', name: 'White Bread', category: 'Carbs', servingSize: '1 slice (28g)', calories: 75, protein: 2, carbs: 14, fat: 1, tags: ['bread'] },
  { id: 'bread-whole-wheat', name: 'Whole Wheat Bread', category: 'Carbs', servingSize: '1 slice (43g)', calories: 80, protein: 4, carbs: 15, fat: 1, tags: ['bread', 'whole grain'] },
  { id: 'ezekiel-bread', name: 'Ezekiel Bread', brand: 'Food for Life', category: 'Carbs', servingSize: '1 slice (34g)', calories: 80, protein: 4, carbs: 15, fat: 0.5, tags: ['bread', 'sprouted grain'] },
  { id: 'bagel-plain', name: 'Bagel (Plain)', category: 'Carbs', servingSize: '1 bagel (98g)', calories: 270, protein: 10, carbs: 53, fat: 1.5, tags: ['bagel', 'bread'] },
  { id: 'english-muffin', name: 'English Muffin', category: 'Carbs', servingSize: '1 muffin (57g)', calories: 130, protein: 5, carbs: 25, fat: 1, tags: ['bread', 'breakfast'] },
  { id: 'tortilla-flour', name: 'Flour Tortilla', category: 'Carbs', servingSize: '1 large (64g)', calories: 200, protein: 5, carbs: 33, fat: 5, tags: ['tortilla', 'wrap'] },
  { id: 'tortilla-corn', name: 'Corn Tortilla', category: 'Carbs', servingSize: '1 tortilla (26g)', calories: 55, protein: 1, carbs: 11, fat: 1, tags: ['tortilla'] },
  { id: 'tortilla-low-carb', name: 'Low Carb Tortilla', brand: 'Mission', category: 'Carbs', servingSize: '1 tortilla (45g)', calories: 70, protein: 5, carbs: 11, fat: 2.5, tags: ['tortilla', 'low carb'] },

  // Potatoes
  { id: 'potato-baked', name: 'Baked Potato', category: 'Carbs', servingSize: '1 medium (173g)', calories: 160, protein: 4, carbs: 37, fat: 0, tags: ['potato'] },
  { id: 'potato-russet', name: 'Russet Potato', category: 'Carbs', servingSize: '1 medium (213g)', calories: 170, protein: 5, carbs: 38, fat: 0, tags: ['potato'] },
  { id: 'sweet-potato', name: 'Sweet Potato', category: 'Carbs', servingSize: '1 medium (130g)', calories: 115, protein: 2, carbs: 27, fat: 0, tags: ['potato', 'sweet potato'] },
  { id: 'sweet-potato-large', name: 'Sweet Potato', category: 'Carbs', servingSize: '1 large (180g)', calories: 160, protein: 3, carbs: 37, fat: 0, tags: ['potato', 'sweet potato'] },

  // ========================================
  // FRUITS
  // ========================================
  { id: 'banana', name: 'Banana', category: 'Fruit', servingSize: '1 medium (118g)', calories: 105, protein: 1, carbs: 27, fat: 0, tags: ['banana', 'fruit'] },
  { id: 'apple', name: 'Apple', category: 'Fruit', servingSize: '1 medium (182g)', calories: 95, protein: 0, carbs: 25, fat: 0, tags: ['apple', 'fruit'] },
  { id: 'orange', name: 'Orange', category: 'Fruit', servingSize: '1 medium (131g)', calories: 60, protein: 1, carbs: 15, fat: 0, tags: ['orange', 'fruit', 'citrus'] },
  { id: 'strawberries', name: 'Strawberries', category: 'Fruit', servingSize: '1 cup (144g)', calories: 45, protein: 1, carbs: 11, fat: 0, tags: ['berries', 'fruit'] },
  { id: 'blueberries', name: 'Blueberries', category: 'Fruit', servingSize: '1 cup (148g)', calories: 85, protein: 1, carbs: 21, fat: 0, tags: ['berries', 'fruit'] },
  { id: 'raspberries', name: 'Raspberries', category: 'Fruit', servingSize: '1 cup (123g)', calories: 65, protein: 1, carbs: 15, fat: 1, tags: ['berries', 'fruit'] },
  { id: 'grapes', name: 'Grapes', category: 'Fruit', servingSize: '1 cup (151g)', calories: 105, protein: 1, carbs: 27, fat: 0, tags: ['grapes', 'fruit'] },
  { id: 'watermelon', name: 'Watermelon', category: 'Fruit', servingSize: '1 cup diced (152g)', calories: 45, protein: 1, carbs: 11, fat: 0, tags: ['melon', 'fruit'] },
  { id: 'mango', name: 'Mango', category: 'Fruit', servingSize: '1 cup (165g)', calories: 100, protein: 1, carbs: 25, fat: 0, tags: ['mango', 'fruit', 'tropical'] },
  { id: 'pineapple', name: 'Pineapple', category: 'Fruit', servingSize: '1 cup (165g)', calories: 80, protein: 1, carbs: 22, fat: 0, tags: ['pineapple', 'fruit', 'tropical'] },

  // ========================================
  // VEGETABLES
  // ========================================
  { id: 'broccoli', name: 'Broccoli', category: 'Vegetable', servingSize: '1 cup (91g)', calories: 30, protein: 3, carbs: 6, fat: 0, tags: ['broccoli', 'vegetable', 'green'] },
  { id: 'spinach-raw', name: 'Spinach (Raw)', category: 'Vegetable', servingSize: '2 cups (60g)', calories: 15, protein: 2, carbs: 2, fat: 0, tags: ['spinach', 'leafy green', 'salad'] },
  { id: 'spinach-cooked', name: 'Spinach (Cooked)', category: 'Vegetable', servingSize: '1 cup (180g)', calories: 40, protein: 5, carbs: 7, fat: 0, tags: ['spinach', 'leafy green'] },
  { id: 'kale', name: 'Kale', category: 'Vegetable', servingSize: '1 cup (67g)', calories: 35, protein: 2, carbs: 6, fat: 0, tags: ['kale', 'leafy green'] },
  { id: 'asparagus', name: 'Asparagus', category: 'Vegetable', servingSize: '1 cup (134g)', calories: 25, protein: 3, carbs: 5, fat: 0, tags: ['asparagus', 'vegetable'] },
  { id: 'green-beans', name: 'Green Beans', category: 'Vegetable', servingSize: '1 cup (125g)', calories: 35, protein: 2, carbs: 8, fat: 0, tags: ['green beans', 'vegetable'] },
  { id: 'carrots', name: 'Carrots', category: 'Vegetable', servingSize: '1 cup (128g)', calories: 50, protein: 1, carbs: 12, fat: 0, tags: ['carrots', 'vegetable'] },
  { id: 'bell-pepper', name: 'Bell Pepper', category: 'Vegetable', servingSize: '1 medium (119g)', calories: 25, protein: 1, carbs: 6, fat: 0, tags: ['pepper', 'vegetable'] },
  { id: 'cucumber', name: 'Cucumber', category: 'Vegetable', servingSize: '1 cup sliced (104g)', calories: 15, protein: 1, carbs: 3, fat: 0, tags: ['cucumber', 'vegetable', 'salad'] },
  { id: 'tomato', name: 'Tomato', category: 'Vegetable', servingSize: '1 medium (123g)', calories: 20, protein: 1, carbs: 5, fat: 0, tags: ['tomato', 'vegetable'] },
  { id: 'onion', name: 'Onion', category: 'Vegetable', servingSize: '1 medium (110g)', calories: 45, protein: 1, carbs: 11, fat: 0, tags: ['onion', 'vegetable'] },
  { id: 'mushrooms', name: 'Mushrooms', category: 'Vegetable', servingSize: '1 cup (96g)', calories: 20, protein: 3, carbs: 3, fat: 0, tags: ['mushroom', 'vegetable'] },
  { id: 'zucchini', name: 'Zucchini', category: 'Vegetable', servingSize: '1 cup (124g)', calories: 20, protein: 1, carbs: 4, fat: 0, tags: ['zucchini', 'squash', 'vegetable'] },
  { id: 'cauliflower', name: 'Cauliflower', category: 'Vegetable', servingSize: '1 cup (107g)', calories: 25, protein: 2, carbs: 5, fat: 0, tags: ['cauliflower', 'vegetable'] },
  { id: 'brussels-sprouts', name: 'Brussels Sprouts', category: 'Vegetable', servingSize: '1 cup (88g)', calories: 40, protein: 3, carbs: 8, fat: 0, tags: ['brussels sprouts', 'vegetable'] },
  { id: 'mixed-greens', name: 'Mixed Greens Salad', category: 'Vegetable', servingSize: '2 cups (85g)', calories: 15, protein: 1, carbs: 3, fat: 0, tags: ['salad', 'greens', 'vegetable'] },

  // ========================================
  // FATS & OILS
  // ========================================
  { id: 'avocado', name: 'Avocado', category: 'Fats', servingSize: '1/2 medium (68g)', calories: 115, protein: 1, carbs: 6, fat: 10, tags: ['avocado', 'healthy fat'] },
  { id: 'avocado-whole', name: 'Avocado', category: 'Fats', servingSize: '1 whole (136g)', calories: 230, protein: 3, carbs: 12, fat: 21, tags: ['avocado', 'healthy fat'] },
  { id: 'olive-oil', name: 'Olive Oil', category: 'Fats', servingSize: '1 tbsp (14g)', calories: 120, protein: 0, carbs: 0, fat: 14, tags: ['oil', 'healthy fat'] },
  { id: 'coconut-oil', name: 'Coconut Oil', category: 'Fats', servingSize: '1 tbsp (14g)', calories: 120, protein: 0, carbs: 0, fat: 14, tags: ['oil', 'coconut'] },
  { id: 'butter', name: 'Butter', category: 'Fats', servingSize: '1 tbsp (14g)', calories: 100, protein: 0, carbs: 0, fat: 11, tags: ['butter', 'dairy'] },
  { id: 'almonds', name: 'Almonds', category: 'Fats', servingSize: '1 oz (28g, ~23 nuts)', calories: 165, protein: 6, carbs: 6, fat: 14, tags: ['nuts', 'almonds', 'snack'] },
  { id: 'peanuts', name: 'Peanuts', category: 'Fats', servingSize: '1 oz (28g)', calories: 165, protein: 7, carbs: 5, fat: 14, tags: ['nuts', 'peanuts', 'snack'] },
  { id: 'cashews', name: 'Cashews', category: 'Fats', servingSize: '1 oz (28g)', calories: 155, protein: 5, carbs: 9, fat: 12, tags: ['nuts', 'cashews', 'snack'] },
  { id: 'walnuts', name: 'Walnuts', category: 'Fats', servingSize: '1 oz (28g)', calories: 185, protein: 4, carbs: 4, fat: 18, tags: ['nuts', 'walnuts', 'omega-3'] },
  { id: 'peanut-butter', name: 'Peanut Butter', category: 'Fats', servingSize: '2 tbsp (32g)', calories: 190, protein: 8, carbs: 6, fat: 16, tags: ['nut butter', 'peanut'] },
  { id: 'almond-butter', name: 'Almond Butter', category: 'Fats', servingSize: '2 tbsp (32g)', calories: 195, protein: 7, carbs: 6, fat: 18, tags: ['nut butter', 'almond'] },

  // ========================================
  // CHIPOTLE
  // ========================================
  { id: 'chipotle-chicken', name: 'Chipotle Chicken', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving (4oz)', calories: 180, protein: 32, carbs: 0, fat: 7, tags: ['chipotle', 'chicken', 'mexican'] },
  { id: 'chipotle-steak', name: 'Chipotle Steak', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving (4oz)', calories: 150, protein: 21, carbs: 1, fat: 6, tags: ['chipotle', 'steak', 'mexican'] },
  { id: 'chipotle-barbacoa', name: 'Chipotle Barbacoa', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving (4oz)', calories: 170, protein: 24, carbs: 2, fat: 7, tags: ['chipotle', 'beef', 'mexican'] },
  { id: 'chipotle-carnitas', name: 'Chipotle Carnitas', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving (4oz)', calories: 210, protein: 23, carbs: 0, fat: 12, tags: ['chipotle', 'pork', 'mexican'] },
  { id: 'chipotle-sofritas', name: 'Chipotle Sofritas', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving (4oz)', calories: 150, protein: 8, carbs: 9, fat: 10, tags: ['chipotle', 'tofu', 'vegan', 'mexican'] },
  { id: 'chipotle-white-rice', name: 'Chipotle White Rice', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving', calories: 210, protein: 4, carbs: 40, fat: 4, tags: ['chipotle', 'rice', 'mexican'] },
  { id: 'chipotle-brown-rice', name: 'Chipotle Brown Rice', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving', calories: 210, protein: 5, carbs: 36, fat: 6, tags: ['chipotle', 'rice', 'mexican'] },
  { id: 'chipotle-black-beans', name: 'Chipotle Black Beans', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving', calories: 130, protein: 8, carbs: 22, fat: 1, tags: ['chipotle', 'beans', 'mexican'] },
  { id: 'chipotle-pinto-beans', name: 'Chipotle Pinto Beans', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving', calories: 130, protein: 8, carbs: 22, fat: 1, tags: ['chipotle', 'beans', 'mexican'] },
  { id: 'chipotle-fajita-veggies', name: 'Chipotle Fajita Veggies', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving', calories: 20, protein: 1, carbs: 4, fat: 0, tags: ['chipotle', 'vegetables', 'mexican'] },
  { id: 'chipotle-cheese', name: 'Chipotle Cheese', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving', calories: 110, protein: 6, carbs: 1, fat: 9, tags: ['chipotle', 'cheese', 'mexican'] },
  { id: 'chipotle-sour-cream', name: 'Chipotle Sour Cream', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving', calories: 110, protein: 2, carbs: 2, fat: 9, tags: ['chipotle', 'mexican'] },
  { id: 'chipotle-guac', name: 'Chipotle Guacamole', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving', calories: 230, protein: 2, carbs: 8, fat: 22, tags: ['chipotle', 'guacamole', 'mexican'] },
  { id: 'chipotle-salsa-mild', name: 'Chipotle Fresh Tomato Salsa', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving', calories: 25, protein: 1, carbs: 4, fat: 0, tags: ['chipotle', 'salsa', 'mexican'] },
  { id: 'chipotle-salsa-medium', name: 'Chipotle Roasted Chili-Corn Salsa', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving', calories: 80, protein: 1, carbs: 15, fat: 1, tags: ['chipotle', 'salsa', 'mexican'] },
  { id: 'chipotle-salsa-hot', name: 'Chipotle Tomatillo Red-Chili Salsa', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 serving', calories: 30, protein: 1, carbs: 4, fat: 1, tags: ['chipotle', 'salsa', 'mexican'] },
  { id: 'chipotle-bowl-chicken', name: 'Chipotle Chicken Bowl (Complete)', brand: 'Chipotle', category: 'Restaurant', servingSize: '1 bowl', calories: 665, protein: 50, carbs: 70, fat: 22, tags: ['chipotle', 'bowl', 'mexican', 'meal'] },

  // ========================================
  // CHICK-FIL-A
  // ========================================
  { id: 'cfa-chicken-sandwich', name: 'Chick-fil-A Chicken Sandwich', brand: 'Chick-fil-A', category: 'Restaurant', servingSize: '1 sandwich', calories: 440, protein: 29, carbs: 40, fat: 19, tags: ['chick-fil-a', 'chicken', 'sandwich'] },
  { id: 'cfa-deluxe-sandwich', name: 'Chick-fil-A Deluxe Sandwich', brand: 'Chick-fil-A', category: 'Restaurant', servingSize: '1 sandwich', calories: 500, protein: 30, carbs: 42, fat: 22, tags: ['chick-fil-a', 'chicken', 'sandwich'] },
  { id: 'cfa-grilled-sandwich', name: 'Chick-fil-A Grilled Chicken Sandwich', brand: 'Chick-fil-A', category: 'Restaurant', servingSize: '1 sandwich', calories: 320, protein: 29, carbs: 36, fat: 6, tags: ['chick-fil-a', 'chicken', 'grilled', 'sandwich'] },
  { id: 'cfa-nuggets-8', name: 'Chick-fil-A Nuggets (8-count)', brand: 'Chick-fil-A', category: 'Restaurant', servingSize: '8 nuggets', calories: 260, protein: 27, carbs: 11, fat: 12, tags: ['chick-fil-a', 'nuggets', 'chicken'] },
  { id: 'cfa-nuggets-12', name: 'Chick-fil-A Nuggets (12-count)', brand: 'Chick-fil-A', category: 'Restaurant', servingSize: '12 nuggets', calories: 390, protein: 41, carbs: 16, fat: 18, tags: ['chick-fil-a', 'nuggets', 'chicken'] },
  { id: 'cfa-grilled-nuggets-8', name: 'Chick-fil-A Grilled Nuggets (8-count)', brand: 'Chick-fil-A', category: 'Restaurant', servingSize: '8 nuggets', calories: 130, protein: 25, carbs: 1, fat: 3, tags: ['chick-fil-a', 'nuggets', 'grilled', 'lean'] },
  { id: 'cfa-grilled-nuggets-12', name: 'Chick-fil-A Grilled Nuggets (12-count)', brand: 'Chick-fil-A', category: 'Restaurant', servingSize: '12 nuggets', calories: 200, protein: 38, carbs: 2, fat: 4, tags: ['chick-fil-a', 'nuggets', 'grilled', 'lean'] },
  { id: 'cfa-waffle-fries-medium', name: 'Chick-fil-A Waffle Fries (Medium)', brand: 'Chick-fil-A', category: 'Restaurant', servingSize: '1 medium', calories: 420, protein: 5, carbs: 45, fat: 24, tags: ['chick-fil-a', 'fries', 'side'] },
  { id: 'cfa-fruit-cup', name: 'Chick-fil-A Fruit Cup', brand: 'Chick-fil-A', category: 'Restaurant', servingSize: '1 medium', calories: 60, protein: 1, carbs: 16, fat: 0, tags: ['chick-fil-a', 'fruit', 'side', 'healthy'] },
  { id: 'cfa-side-salad', name: 'Chick-fil-A Side Salad', brand: 'Chick-fil-A', category: 'Restaurant', servingSize: '1 salad', calories: 80, protein: 5, carbs: 6, fat: 4, tags: ['chick-fil-a', 'salad', 'side'] },
  { id: 'cfa-cobb-salad', name: 'Chick-fil-A Cobb Salad (with Grilled Chicken)', brand: 'Chick-fil-A', category: 'Restaurant', servingSize: '1 salad', calories: 420, protein: 41, carbs: 20, fat: 21, tags: ['chick-fil-a', 'salad', 'meal'] },
  { id: 'cfa-market-salad', name: 'Chick-fil-A Market Salad (with Grilled Chicken)', brand: 'Chick-fil-A', category: 'Restaurant', servingSize: '1 salad', calories: 340, protein: 28, carbs: 26, fat: 14, tags: ['chick-fil-a', 'salad', 'meal'] },
  { id: 'cfa-egg-white-grill', name: 'Chick-fil-A Egg White Grill', brand: 'Chick-fil-A', category: 'Restaurant', servingSize: '1 sandwich', calories: 290, protein: 26, carbs: 30, fat: 7, tags: ['chick-fil-a', 'breakfast', 'egg'] },
  { id: 'cfa-greek-yogurt', name: 'Chick-fil-A Greek Yogurt Parfait', brand: 'Chick-fil-A', category: 'Restaurant', servingSize: '1 parfait', calories: 270, protein: 13, carbs: 45, fat: 5, tags: ['chick-fil-a', 'breakfast', 'yogurt'] },

  // ========================================
  // MCDONALD'S
  // ========================================
  { id: 'mcd-egg-mcmuffin', name: 'Egg McMuffin', brand: "McDonald's", category: 'Restaurant', servingSize: '1 sandwich', calories: 310, protein: 17, carbs: 30, fat: 13, tags: ['mcdonalds', 'breakfast', 'egg'] },
  { id: 'mcd-big-mac', name: 'Big Mac', brand: "McDonald's", category: 'Restaurant', servingSize: '1 sandwich', calories: 590, protein: 25, carbs: 46, fat: 34, tags: ['mcdonalds', 'burger'] },
  { id: 'mcd-quarter-pounder', name: 'Quarter Pounder with Cheese', brand: "McDonald's", category: 'Restaurant', servingSize: '1 sandwich', calories: 520, protein: 30, carbs: 42, fat: 26, tags: ['mcdonalds', 'burger'] },
  { id: 'mcd-mcdouble', name: 'McDouble', brand: "McDonald's", category: 'Restaurant', servingSize: '1 sandwich', calories: 400, protein: 22, carbs: 33, fat: 20, tags: ['mcdonalds', 'burger'] },
  { id: 'mcd-mcchicken', name: 'McChicken', brand: "McDonald's", category: 'Restaurant', servingSize: '1 sandwich', calories: 400, protein: 14, carbs: 39, fat: 21, tags: ['mcdonalds', 'chicken', 'sandwich'] },
  { id: 'mcd-nuggets-10', name: 'Chicken McNuggets (10-piece)', brand: "McDonald's", category: 'Restaurant', servingSize: '10 nuggets', calories: 420, protein: 25, carbs: 26, fat: 25, tags: ['mcdonalds', 'nuggets', 'chicken'] },
  { id: 'mcd-fries-medium', name: 'Medium Fries', brand: "McDonald's", category: 'Restaurant', servingSize: '1 medium', calories: 320, protein: 5, carbs: 43, fat: 15, tags: ['mcdonalds', 'fries', 'side'] },
  { id: 'mcd-fries-large', name: 'Large Fries', brand: "McDonald's", category: 'Restaurant', servingSize: '1 large', calories: 480, protein: 7, carbs: 65, fat: 23, tags: ['mcdonalds', 'fries', 'side'] },

  // ========================================
  // SUBWAY
  // ========================================
  { id: 'subway-turkey-6', name: 'Subway Turkey Breast 6"', brand: 'Subway', category: 'Restaurant', servingSize: '1 sub', calories: 270, protein: 18, carbs: 40, fat: 3.5, tags: ['subway', 'sandwich', 'turkey'] },
  { id: 'subway-chicken-6', name: 'Subway Grilled Chicken 6"', brand: 'Subway', category: 'Restaurant', servingSize: '1 sub', calories: 270, protein: 23, carbs: 39, fat: 4.5, tags: ['subway', 'sandwich', 'chicken'] },
  { id: 'subway-italian-bmt-6', name: 'Subway Italian B.M.T. 6"', brand: 'Subway', category: 'Restaurant', servingSize: '1 sub', calories: 370, protein: 17, carbs: 40, fat: 16, tags: ['subway', 'sandwich'] },
  { id: 'subway-veggie-delite-6', name: 'Subway Veggie Delite 6"', brand: 'Subway', category: 'Restaurant', servingSize: '1 sub', calories: 200, protein: 8, carbs: 37, fat: 2, tags: ['subway', 'sandwich', 'vegetarian'] },
  { id: 'subway-rotisserie-chicken', name: 'Subway Rotisserie Chicken 6"', brand: 'Subway', category: 'Restaurant', servingSize: '1 sub', calories: 320, protein: 26, carbs: 40, fat: 6, tags: ['subway', 'sandwich', 'chicken'] },

  // ========================================
  // STARBUCKS
  // ========================================
  { id: 'starbucks-protein-box', name: 'Starbucks Eggs & Cheese Protein Box', brand: 'Starbucks', category: 'Restaurant', servingSize: '1 box', calories: 470, protein: 25, carbs: 39, fat: 24, tags: ['starbucks', 'protein', 'snack'] },
  { id: 'starbucks-egg-bites-bacon', name: 'Starbucks Bacon & Gruyère Egg Bites', brand: 'Starbucks', category: 'Restaurant', servingSize: '2 bites', calories: 300, protein: 19, carbs: 9, fat: 20, tags: ['starbucks', 'breakfast', 'egg', 'keto'] },
  { id: 'starbucks-egg-bites-egg-white', name: 'Starbucks Egg White & Red Pepper Egg Bites', brand: 'Starbucks', category: 'Restaurant', servingSize: '2 bites', calories: 170, protein: 13, carbs: 11, fat: 8, tags: ['starbucks', 'breakfast', 'egg', 'healthy'] },
  { id: 'starbucks-turkey-bacon', name: 'Starbucks Turkey Bacon & Egg White Sandwich', brand: 'Starbucks', category: 'Restaurant', servingSize: '1 sandwich', calories: 230, protein: 17, carbs: 26, fat: 6, tags: ['starbucks', 'breakfast', 'sandwich'] },
  { id: 'starbucks-oatmeal', name: 'Starbucks Oatmeal', brand: 'Starbucks', category: 'Restaurant', servingSize: '1 serving', calories: 160, protein: 5, carbs: 28, fat: 3, tags: ['starbucks', 'breakfast', 'oatmeal'] },

  // ========================================
  // PANERA
  // ========================================
  { id: 'panera-greek-salad', name: 'Panera Greek Salad with Chicken', brand: 'Panera', category: 'Restaurant', servingSize: 'Full salad', calories: 400, protein: 32, carbs: 14, fat: 25, tags: ['panera', 'salad', 'chicken'] },
  { id: 'panera-asian-salad', name: 'Panera Asian Sesame Chicken Salad', brand: 'Panera', category: 'Restaurant', servingSize: 'Full salad', calories: 430, protein: 32, carbs: 34, fat: 20, tags: ['panera', 'salad', 'chicken'] },
  { id: 'panera-turkey-sandwich', name: 'Panera Turkey Sandwich', brand: 'Panera', category: 'Restaurant', servingSize: 'Whole sandwich', calories: 510, protein: 30, carbs: 50, fat: 22, tags: ['panera', 'sandwich', 'turkey'] },
  { id: 'panera-power-bowl', name: 'Panera Baja Power Bowl with Chicken', brand: 'Panera', category: 'Restaurant', servingSize: '1 bowl', calories: 450, protein: 36, carbs: 40, fat: 16, tags: ['panera', 'bowl', 'chicken', 'healthy'] },
  { id: 'panera-mediterranean-bowl', name: 'Panera Mediterranean Grain Bowl with Chicken', brand: 'Panera', category: 'Restaurant', servingSize: '1 bowl', calories: 510, protein: 33, carbs: 52, fat: 19, tags: ['panera', 'bowl', 'chicken'] },

  // ========================================
  // WINGSTOP
  // ========================================
  { id: 'wingstop-classic-plain', name: 'Wingstop Classic Wings (Plain, 6 pcs)', brand: 'Wingstop', category: 'Restaurant', servingSize: '6 wings', calories: 380, protein: 32, carbs: 0, fat: 28, tags: ['wingstop', 'wings', 'chicken'] },
  { id: 'wingstop-boneless-plain', name: 'Wingstop Boneless Wings (Plain, 6 pcs)', brand: 'Wingstop', category: 'Restaurant', servingSize: '6 wings', calories: 360, protein: 24, carbs: 24, fat: 18, tags: ['wingstop', 'wings', 'chicken'] },

  // ========================================
  // FIVE GUYS
  // ========================================
  { id: 'five-guys-burger', name: 'Five Guys Hamburger', brand: 'Five Guys', category: 'Restaurant', servingSize: '1 burger', calories: 700, protein: 39, carbs: 39, fat: 43, tags: ['five guys', 'burger'] },
  { id: 'five-guys-little-burger', name: 'Five Guys Little Hamburger', brand: 'Five Guys', category: 'Restaurant', servingSize: '1 burger', calories: 480, protein: 23, carbs: 39, fat: 26, tags: ['five guys', 'burger'] },

  // ========================================
  // TACO BELL
  // ========================================
  { id: 'taco-bell-crunchy-taco', name: 'Taco Bell Crunchy Taco', brand: 'Taco Bell', category: 'Restaurant', servingSize: '1 taco', calories: 170, protein: 8, carbs: 13, fat: 10, tags: ['taco bell', 'taco', 'mexican'] },
  { id: 'taco-bell-burrito-supreme', name: 'Taco Bell Burrito Supreme Beef', brand: 'Taco Bell', category: 'Restaurant', servingSize: '1 burrito', calories: 390, protein: 16, carbs: 40, fat: 18, tags: ['taco bell', 'burrito', 'mexican'] },
  { id: 'taco-bell-power-bowl', name: 'Taco Bell Power Bowl (Chicken)', brand: 'Taco Bell', category: 'Restaurant', servingSize: '1 bowl', calories: 460, protein: 26, carbs: 50, fat: 18, tags: ['taco bell', 'bowl', 'chicken', 'mexican'] },
  { id: 'taco-bell-quesadilla', name: 'Taco Bell Chicken Quesadilla', brand: 'Taco Bell', category: 'Restaurant', servingSize: '1 quesadilla', calories: 500, protein: 27, carbs: 37, fat: 27, tags: ['taco bell', 'quesadilla', 'chicken', 'mexican'] },

  // ========================================
  // PANDA EXPRESS
  // ========================================
  { id: 'panda-orange-chicken', name: 'Panda Express Orange Chicken', brand: 'Panda Express', category: 'Restaurant', servingSize: '1 entree', calories: 490, protein: 25, carbs: 51, fat: 21, tags: ['panda express', 'chicken', 'chinese'] },
  { id: 'panda-grilled-teriyaki', name: 'Panda Express Grilled Teriyaki Chicken', brand: 'Panda Express', category: 'Restaurant', servingSize: '1 entree', calories: 275, protein: 36, carbs: 14, fat: 9, tags: ['panda express', 'chicken', 'chinese', 'healthy'] },
  { id: 'panda-broccoli-beef', name: 'Panda Express Broccoli Beef', brand: 'Panda Express', category: 'Restaurant', servingSize: '1 entree', calories: 150, protein: 9, carbs: 13, fat: 7, tags: ['panda express', 'beef', 'chinese'] },
  { id: 'panda-string-bean-chicken', name: 'Panda Express String Bean Chicken Breast', brand: 'Panda Express', category: 'Restaurant', servingSize: '1 entree', calories: 210, protein: 15, carbs: 14, fat: 11, tags: ['panda express', 'chicken', 'chinese'] },
  { id: 'panda-fried-rice', name: 'Panda Express Fried Rice', brand: 'Panda Express', category: 'Restaurant', servingSize: '1 side', calories: 520, protein: 11, carbs: 82, fat: 16, tags: ['panda express', 'rice', 'chinese'] },
  { id: 'panda-steamed-rice', name: 'Panda Express Steamed White Rice', brand: 'Panda Express', category: 'Restaurant', servingSize: '1 side', calories: 380, protein: 7, carbs: 87, fat: 0, tags: ['panda express', 'rice', 'chinese'] },
  { id: 'panda-super-greens', name: 'Panda Express Super Greens', brand: 'Panda Express', category: 'Restaurant', servingSize: '1 side', calories: 90, protein: 6, carbs: 10, fat: 3, tags: ['panda express', 'vegetables', 'chinese', 'healthy'] },

  // ========================================
  // SNACKS & BARS
  // ========================================
  { id: 'rxbar', name: 'RXBar', brand: 'RXBar', category: 'Snacks', servingSize: '1 bar (52g)', calories: 210, protein: 12, carbs: 24, fat: 9, tags: ['protein bar', 'snack'] },
  { id: 'quest-bar', name: 'Quest Protein Bar', brand: 'Quest', category: 'Snacks', servingSize: '1 bar (60g)', calories: 200, protein: 21, carbs: 22, fat: 8, tags: ['protein bar', 'low carb', 'snack'] },
  { id: 'kind-bar', name: 'KIND Bar', brand: 'KIND', category: 'Snacks', servingSize: '1 bar (40g)', calories: 200, protein: 6, carbs: 17, fat: 15, tags: ['snack bar', 'nuts'] },
  { id: 'clif-bar', name: 'Clif Bar', brand: 'Clif', category: 'Snacks', servingSize: '1 bar (68g)', calories: 250, protein: 10, carbs: 44, fat: 6, tags: ['energy bar', 'snack'] },
  { id: 'built-bar', name: 'Built Bar', brand: 'Built', category: 'Snacks', servingSize: '1 bar (49g)', calories: 130, protein: 17, carbs: 15, fat: 4, tags: ['protein bar', 'low cal', 'snack'] },
  { id: 'rice-cakes', name: 'Rice Cakes', category: 'Snacks', servingSize: '2 cakes (18g)', calories: 70, protein: 1, carbs: 15, fat: 0, tags: ['rice cake', 'snack', 'low calorie'] },
  { id: 'beef-jerky', name: 'Beef Jerky', category: 'Snacks', servingSize: '1 oz (28g)', calories: 80, protein: 10, carbs: 5, fat: 2, tags: ['jerky', 'snack', 'protein'] },
  { id: 'turkey-jerky', name: 'Turkey Jerky', category: 'Snacks', servingSize: '1 oz (28g)', calories: 70, protein: 11, carbs: 4, fat: 1, tags: ['jerky', 'snack', 'protein', 'lean'] },

  // ========================================
  // BEVERAGES
  // ========================================
  { id: 'coffee-black', name: 'Black Coffee', category: 'Beverage', servingSize: '1 cup (240ml)', calories: 5, protein: 0, carbs: 0, fat: 0, tags: ['coffee', 'drink'] },
  { id: 'almond-milk', name: 'Almond Milk (Unsweetened)', category: 'Beverage', servingSize: '1 cup (240ml)', calories: 30, protein: 1, carbs: 1, fat: 2.5, tags: ['milk', 'almond', 'dairy-free'] },
  { id: 'oat-milk', name: 'Oat Milk', category: 'Beverage', servingSize: '1 cup (240ml)', calories: 120, protein: 3, carbs: 16, fat: 5, tags: ['milk', 'oat', 'dairy-free'] },
  { id: 'orange-juice', name: 'Orange Juice', category: 'Beverage', servingSize: '1 cup (240ml)', calories: 110, protein: 2, carbs: 26, fat: 0, tags: ['juice', 'fruit', 'drink'] },
  { id: 'gatorade', name: 'Gatorade', brand: 'Gatorade', category: 'Beverage', servingSize: '20 oz bottle', calories: 140, protein: 0, carbs: 36, fat: 0, tags: ['sports drink', 'electrolytes'] },
  { id: 'body-armor', name: 'Body Armor', brand: 'Body Armor', category: 'Beverage', servingSize: '16 oz bottle', calories: 70, protein: 0, carbs: 18, fat: 0, tags: ['sports drink', 'electrolytes'] },
];

// Search function with fuzzy matching
export function searchFoods(query: string): FoodItem[] {
  const lowerQuery = query.toLowerCase().trim();

  if (lowerQuery.length < 2) {
    return [];
  }

  const words = lowerQuery.split(/\s+/);

  // Score each food item
  const scoredResults = foodDatabase.map(food => {
    let score = 0;
    const nameL = food.name.toLowerCase();
    const brandL = (food.brand || '').toLowerCase();
    const categoryL = food.category.toLowerCase();
    const tagsL = food.tags.map(t => t.toLowerCase());

    // Exact name match = highest score
    if (nameL === lowerQuery) {
      score += 100;
    }
    // Name starts with query
    else if (nameL.startsWith(lowerQuery)) {
      score += 80;
    }
    // Name contains query
    else if (nameL.includes(lowerQuery)) {
      score += 60;
    }

    // Check each word
    for (const word of words) {
      if (nameL.includes(word)) score += 20;
      if (brandL.includes(word)) score += 15;
      if (categoryL.includes(word)) score += 10;
      if (tagsL.some(t => t.includes(word))) score += 8;
    }

    // Brand match bonus
    if (brandL && brandL.includes(lowerQuery)) {
      score += 30;
    }

    return { food, score };
  });

  // Filter and sort by score
  return scoredResults
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20)
    .map(r => r.food);
}
