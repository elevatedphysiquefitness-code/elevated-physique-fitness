'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import {
  UtensilsCrossed,
  Clock,
  Flame,
  Search,
  ChevronDown,
  ChevronUp,
  Users,
  ChefHat,
} from 'lucide-react';

interface Recipe {
  id: string;
  name: string;
  category: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  tags: string[];
}

const recipes: Recipe[] = [
  // ==================== BREAKFAST ====================
  {
    id: '1',
    name: 'Greek Yogurt Protein Bowl',
    category: ['breakfast', 'high-protein', 'quick'],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    calories: 380,
    protein: 35,
    carbs: 42,
    fat: 8,
    ingredients: [
      '1 cup Greek yogurt (plain, non-fat)',
      '1/2 cup mixed berries',
      '1 scoop vanilla protein powder',
      '2 tbsp granola',
      '1 tbsp honey',
      '1 tbsp chia seeds',
    ],
    instructions: [
      'Add Greek yogurt to a bowl.',
      'Mix in protein powder until smooth.',
      'Top with berries, granola, and chia seeds.',
      'Drizzle with honey and serve.',
    ],
    tags: ['quick', 'no-cook', 'meal-prep'],
  },
  {
    id: '2',
    name: 'Protein Pancakes',
    category: ['breakfast', 'high-protein'],
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    calories: 350,
    protein: 30,
    carbs: 35,
    fat: 8,
    ingredients: [
      '1 cup oats',
      '2 scoops vanilla protein powder',
      '1 banana',
      '2 eggs',
      '1/2 cup almond milk',
      '1 tsp baking powder',
      '1/4 tsp cinnamon',
      'Cooking spray',
    ],
    instructions: [
      'Blend oats into flour in a blender.',
      'Add all other ingredients and blend until smooth.',
      'Heat a non-stick pan over medium heat and spray with cooking spray.',
      'Pour 1/4 cup batter per pancake.',
      'Cook 2-3 minutes per side until golden.',
      'Serve with berries and a drizzle of maple syrup.',
    ],
    tags: ['meal-prep', 'kid-friendly'],
  },
  {
    id: '3',
    name: 'Overnight Oats',
    category: ['breakfast', 'meal-prep', 'quick'],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    calories: 380,
    protein: 20,
    carbs: 52,
    fat: 10,
    ingredients: [
      '1/2 cup rolled oats',
      '1/2 cup almond milk',
      '1/4 cup Greek yogurt',
      '1 scoop protein powder',
      '1 tbsp chia seeds',
      '1 tbsp almond butter',
      '1/2 cup mixed berries',
    ],
    instructions: [
      'Combine oats, milk, yogurt, and protein powder in a jar.',
      'Stir in chia seeds.',
      'Cover and refrigerate overnight (or at least 4 hours).',
      'In the morning, top with almond butter and berries.',
      'Eat cold or microwave for 1-2 minutes if desired.',
    ],
    tags: ['no-cook', 'meal-prep'],
  },
  {
    id: '4',
    name: 'Egg Muffins',
    category: ['breakfast', 'meal-prep', 'high-protein', 'low-carb'],
    prepTime: 10,
    cookTime: 25,
    servings: 6,
    calories: 120,
    protein: 10,
    carbs: 2,
    fat: 8,
    ingredients: [
      '8 large eggs',
      '1/4 cup milk',
      '1/2 cup diced bell peppers',
      '1/4 cup diced onions',
      '1/4 cup shredded cheese',
      '2 strips bacon, cooked and crumbled',
      'Salt and pepper to taste',
      'Cooking spray',
    ],
    instructions: [
      'Preheat oven to 350°F (175°C).',
      'Spray a 12-cup muffin tin with cooking spray.',
      'Whisk eggs and milk together with salt and pepper.',
      'Divide vegetables, cheese, and bacon among muffin cups.',
      'Pour egg mixture evenly into cups.',
      'Bake 20-25 minutes until eggs are set.',
      'Let cool 5 minutes before removing.',
      'Store in fridge for up to 5 days.',
    ],
    tags: ['keto', 'gluten-free', 'make-ahead'],
  },
  {
    id: '5',
    name: 'High-Calorie Bulking Smoothie',
    category: ['breakfast', 'snack', 'high-calorie', 'bulking', 'high-carb'],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    calories: 850,
    protein: 50,
    carbs: 95,
    fat: 28,
    ingredients: [
      '2 scoops protein powder',
      '2 bananas',
      '1 cup whole milk',
      '1/2 cup oats',
      '2 tbsp peanut butter',
      '2 tbsp honey',
      '1 tbsp olive oil',
      '1/2 cup ice',
    ],
    instructions: [
      'Add oats to blender and pulse to break down.',
      'Add all remaining ingredients.',
      'Blend on high for 2-3 minutes until smooth.',
      'Add more milk if too thick.',
      'Drink immediately or refrigerate for up to 24 hours.',
    ],
    tags: ['bulking', 'mass-gainer', 'quick'],
  },
  {
    id: '6',
    name: 'Loaded Breakfast Burrito',
    category: ['breakfast', 'high-calorie', 'high-protein', 'high-carb', 'bulking'],
    prepTime: 10,
    cookTime: 15,
    servings: 1,
    calories: 720,
    protein: 42,
    carbs: 58,
    fat: 35,
    ingredients: [
      '1 large flour tortilla (12 inch)',
      '3 whole eggs, scrambled',
      '3 oz breakfast sausage or bacon',
      '1/2 cup hash browns',
      '1/4 cup shredded cheese',
      '2 tbsp salsa',
      '1/4 avocado, sliced',
      'Salt and pepper to taste',
    ],
    instructions: [
      'Cook sausage or bacon in a skillet until done. Set aside.',
      'Cook hash browns until crispy.',
      'Scramble eggs with salt and pepper.',
      'Warm tortilla in microwave for 15 seconds.',
      'Layer eggs, meat, hash browns, cheese, salsa, and avocado.',
      'Fold burrito tightly and slice in half.',
      'Optional: grill seam-side down for a crispy exterior.',
    ],
    tags: ['filling', 'customizable', 'meal-prep'],
  },
  {
    id: '7',
    name: 'Peanut Butter Banana Toast Stack',
    category: ['breakfast', 'high-carb', 'high-calorie', 'quick'],
    prepTime: 5,
    cookTime: 5,
    servings: 1,
    calories: 650,
    protein: 22,
    carbs: 78,
    fat: 28,
    ingredients: [
      '3 slices whole grain bread',
      '3 tbsp peanut butter',
      '2 bananas, sliced',
      '2 tbsp honey',
      '1 tbsp chia seeds',
      'Dash of cinnamon',
    ],
    instructions: [
      'Toast bread slices to desired crispness.',
      'Spread 1 tbsp peanut butter on each slice.',
      'Top with banana slices.',
      'Drizzle with honey and sprinkle chia seeds.',
      'Add cinnamon on top.',
      'Stack or serve side by side.',
    ],
    tags: ['vegetarian', 'quick', 'energy'],
  },
  {
    id: '8',
    name: 'French Toast with Maple Syrup',
    category: ['breakfast', 'high-carb', 'high-calorie'],
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    calories: 580,
    protein: 18,
    carbs: 72,
    fat: 24,
    ingredients: [
      '4 slices thick brioche bread',
      '3 eggs',
      '1/2 cup whole milk',
      '1 tsp vanilla extract',
      '1/2 tsp cinnamon',
      '2 tbsp butter',
      '1/4 cup maple syrup',
      'Powdered sugar for dusting',
    ],
    instructions: [
      'Whisk eggs, milk, vanilla, and cinnamon in a shallow dish.',
      'Melt butter in a large skillet over medium heat.',
      'Dip bread slices in egg mixture, coating both sides.',
      'Cook 2-3 minutes per side until golden brown.',
      'Serve with maple syrup and powdered sugar.',
      'Add fresh berries or whipped cream if desired.',
    ],
    tags: ['indulgent', 'weekend', 'kid-friendly'],
  },
  // ==================== LUNCH ====================
  {
    id: '9',
    name: 'Grilled Chicken Salad',
    category: ['lunch', 'high-protein', 'low-carb'],
    prepTime: 15,
    cookTime: 15,
    servings: 2,
    calories: 420,
    protein: 45,
    carbs: 15,
    fat: 22,
    ingredients: [
      '8 oz chicken breast',
      '4 cups mixed greens',
      '1 cucumber, sliced',
      '1/2 cup cherry tomatoes',
      '1/4 cup feta cheese',
      '2 tbsp olive oil',
      '1 tbsp lemon juice',
      'Salt and pepper to taste',
    ],
    instructions: [
      'Season chicken with salt and pepper.',
      'Grill chicken for 6-7 minutes per side until cooked through.',
      'Let chicken rest for 5 minutes, then slice.',
      'Combine greens, cucumber, and tomatoes in a bowl.',
      'Top with sliced chicken and feta.',
      'Whisk olive oil and lemon juice for dressing.',
      'Drizzle dressing over salad and serve.',
    ],
    tags: ['meal-prep', 'gluten-free'],
  },
  {
    id: '10',
    name: 'Turkey Lettuce Wraps',
    category: ['lunch', 'dinner', 'low-carb', 'high-protein'],
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    calories: 280,
    protein: 32,
    carbs: 12,
    fat: 12,
    ingredients: [
      '1 lb ground turkey (93% lean)',
      '1 tbsp sesame oil',
      '3 cloves garlic, minced',
      '1 tbsp fresh ginger, grated',
      '3 tbsp low-sodium soy sauce',
      '1 tbsp rice vinegar',
      '1/4 cup green onions, sliced',
      '8 butter lettuce leaves',
      '1/4 cup shredded carrots',
    ],
    instructions: [
      'Heat sesame oil in a large skillet over medium-high heat.',
      'Add ground turkey and cook, breaking apart, for 5-7 minutes.',
      'Add garlic and ginger, cook 1 minute.',
      'Stir in soy sauce and rice vinegar.',
      'Cook another 2-3 minutes until sauce thickens.',
      'Remove from heat and stir in green onions.',
      'Spoon mixture into lettuce leaves and top with carrots.',
    ],
    tags: ['asian-inspired', 'meal-prep', 'gluten-free'],
  },
  {
    id: '11',
    name: 'Chicken Burrito Bowl',
    category: ['lunch', 'dinner', 'high-protein', 'meal-prep', 'high-carb'],
    prepTime: 20,
    cookTime: 20,
    servings: 4,
    calories: 580,
    protein: 45,
    carbs: 62,
    fat: 16,
    ingredients: [
      '1.5 lb chicken breast',
      '2 cups white rice',
      '1 can black beans, drained',
      '1 cup corn kernels',
      '1 cup pico de gallo',
      '1/2 cup shredded cheese',
      '1 avocado',
      '3 tbsp taco seasoning',
      'Lime wedges',
      'Sour cream for topping',
    ],
    instructions: [
      'Cook rice according to package directions.',
      'Season chicken generously with taco seasoning.',
      'Grill or pan-fry chicken 6-7 minutes per side. Let rest and slice.',
      'Warm black beans and corn in a pan.',
      'Divide rice among bowls.',
      'Top with chicken, beans, corn, pico de gallo, cheese, and avocado.',
      'Add sour cream and serve with lime wedges.',
    ],
    tags: ['mexican-inspired', 'customizable', 'filling'],
  },
  {
    id: '12',
    name: 'Loaded Tuna Sandwich',
    category: ['lunch', 'high-protein', 'quick'],
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    calories: 520,
    protein: 42,
    carbs: 45,
    fat: 18,
    ingredients: [
      '1 can (5 oz) tuna in water, drained',
      '2 tbsp Greek yogurt',
      '1 tbsp Dijon mustard',
      '2 slices whole grain bread',
      '1/4 avocado, mashed',
      'Lettuce and tomato',
      'Salt and pepper to taste',
    ],
    instructions: [
      'Mix tuna with Greek yogurt, mustard, salt, and pepper.',
      'Toast bread if desired.',
      'Spread mashed avocado on one slice.',
      'Add tuna mixture, lettuce, and tomato.',
      'Top with second slice and cut in half.',
    ],
    tags: ['quick', 'no-cook', 'office-friendly'],
  },
  {
    id: '13',
    name: 'Pasta Primavera with Chicken',
    category: ['lunch', 'dinner', 'high-carb', 'high-calorie', 'high-protein'],
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    calories: 680,
    protein: 45,
    carbs: 72,
    fat: 22,
    ingredients: [
      '12 oz penne pasta',
      '1 lb chicken breast, cubed',
      '2 cups mixed vegetables (zucchini, bell pepper, broccoli)',
      '3 cloves garlic, minced',
      '1 cup marinara sauce',
      '1/2 cup heavy cream',
      '1/2 cup parmesan cheese',
      '2 tbsp olive oil',
      'Fresh basil',
    ],
    instructions: [
      'Cook pasta according to package directions. Reserve 1/2 cup pasta water.',
      'Season chicken and cook in olive oil until browned, about 6 minutes.',
      'Add vegetables and garlic, cook 4-5 minutes.',
      'Add marinara sauce and cream, simmer 5 minutes.',
      'Toss pasta with sauce, adding pasta water if needed.',
      'Top with parmesan and fresh basil.',
    ],
    tags: ['italian', 'filling', 'family-friendly'],
  },
  {
    id: '14',
    name: 'Big Mac Salad Bowl',
    category: ['lunch', 'dinner', 'high-protein', 'low-carb'],
    prepTime: 15,
    cookTime: 15,
    servings: 2,
    calories: 450,
    protein: 38,
    carbs: 12,
    fat: 28,
    ingredients: [
      '1 lb ground beef (85% lean)',
      '4 cups shredded lettuce',
      '1/2 cup diced onion',
      '1/2 cup diced pickles',
      '1/2 cup shredded cheddar cheese',
      '1/4 cup thousand island dressing',
      '1 tbsp mustard',
      'Sesame seeds',
    ],
    instructions: [
      'Brown ground beef in a skillet, breaking apart. Drain fat.',
      'Season with salt, pepper, and a dash of garlic powder.',
      'Divide lettuce between bowls.',
      'Top with beef, onion, pickles, and cheese.',
      'Mix dressing with mustard and drizzle over salad.',
      'Sprinkle with sesame seeds.',
    ],
    tags: ['keto-friendly', 'comfort-food'],
  },
  // ==================== DINNER ====================
  {
    id: '15',
    name: 'Salmon with Roasted Vegetables',
    category: ['dinner', 'high-protein'],
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    calories: 520,
    protein: 42,
    carbs: 28,
    fat: 26,
    ingredients: [
      '2 salmon fillets (6 oz each)',
      '2 cups broccoli florets',
      '1 sweet potato, cubed',
      '2 tbsp olive oil',
      '1 lemon',
      '2 cloves garlic, minced',
      'Fresh dill',
      'Salt and pepper to taste',
    ],
    instructions: [
      'Preheat oven to 400°F (200°C).',
      'Toss broccoli and sweet potato with 1 tbsp olive oil, salt, and pepper.',
      'Spread on a baking sheet and roast for 15 minutes.',
      'Season salmon with remaining oil, garlic, salt, and pepper.',
      'Add salmon to the baking sheet with vegetables.',
      'Roast for another 12-15 minutes until salmon is cooked through.',
      'Squeeze lemon over salmon and garnish with dill.',
    ],
    tags: ['omega-3', 'one-pan'],
  },
  {
    id: '16',
    name: 'Beef Stir Fry',
    category: ['dinner', 'high-protein'],
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    calories: 380,
    protein: 35,
    carbs: 18,
    fat: 18,
    ingredients: [
      '1 lb sirloin steak, sliced thin',
      '2 cups broccoli florets',
      '1 bell pepper, sliced',
      '1 cup snap peas',
      '3 tbsp low-sodium soy sauce',
      '1 tbsp honey',
      '1 tbsp cornstarch',
      '2 tbsp vegetable oil',
      '3 cloves garlic, minced',
    ],
    instructions: [
      'Mix soy sauce, honey, and cornstarch in a small bowl.',
      'Heat oil in a wok or large skillet over high heat.',
      'Add beef and stir-fry 2-3 minutes until browned. Remove.',
      'Add vegetables and stir-fry 4-5 minutes until crisp-tender.',
      'Add garlic and cook 30 seconds.',
      'Return beef to pan and add sauce.',
      'Cook 2 minutes until sauce thickens.',
      'Serve over rice or cauliflower rice.',
    ],
    tags: ['asian-inspired', 'quick'],
  },
  {
    id: '17',
    name: 'Spaghetti and Meatballs',
    category: ['dinner', 'high-carb', 'high-calorie', 'high-protein', 'bulking'],
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    calories: 780,
    protein: 45,
    carbs: 85,
    fat: 28,
    ingredients: [
      '1 lb spaghetti',
      '1 lb ground beef',
      '1/2 lb Italian sausage',
      '1/2 cup breadcrumbs',
      '1/4 cup parmesan cheese',
      '1 egg',
      '2 cups marinara sauce',
      '2 tbsp olive oil',
      'Fresh basil and more parmesan for serving',
    ],
    instructions: [
      'Mix beef, sausage, breadcrumbs, parmesan, and egg. Form into meatballs.',
      'Brown meatballs in olive oil on all sides, about 8 minutes.',
      'Add marinara sauce, cover, and simmer 20 minutes.',
      'Meanwhile, cook spaghetti according to package directions.',
      'Serve meatballs and sauce over pasta.',
      'Garnish with fresh basil and extra parmesan.',
    ],
    tags: ['italian', 'comfort-food', 'family-favorite'],
  },
  {
    id: '18',
    name: 'Chicken Fried Rice',
    category: ['dinner', 'high-carb', 'high-calorie', 'high-protein'],
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    calories: 620,
    protein: 38,
    carbs: 68,
    fat: 20,
    ingredients: [
      '4 cups cooked jasmine rice (day-old works best)',
      '1 lb chicken breast, diced',
      '3 eggs, beaten',
      '1 cup frozen peas and carrots',
      '4 green onions, sliced',
      '4 tbsp soy sauce',
      '2 tbsp sesame oil',
      '3 cloves garlic, minced',
    ],
    instructions: [
      'Heat 1 tbsp oil in a wok over high heat.',
      'Cook chicken until golden, about 6 minutes. Remove and set aside.',
      'Scramble eggs in the wok, set aside with chicken.',
      'Add remaining oil and stir-fry vegetables 2 minutes.',
      'Add rice and stir-fry 3-4 minutes until slightly crispy.',
      'Add garlic and soy sauce, toss well.',
      'Return chicken and eggs, mix everything together.',
      'Top with green onions and serve.',
    ],
    tags: ['asian-inspired', 'meal-prep', 'one-pan'],
  },
  {
    id: '19',
    name: 'BBQ Pulled Pork with Mac and Cheese',
    category: ['dinner', 'high-calorie', 'high-carb', 'bulking'],
    prepTime: 15,
    cookTime: 240,
    servings: 6,
    calories: 920,
    protein: 52,
    carbs: 78,
    fat: 42,
    ingredients: [
      '3 lb pork shoulder',
      '1.5 cups BBQ sauce',
      '1 lb elbow macaroni',
      '4 cups shredded cheddar cheese',
      '2 cups whole milk',
      '4 tbsp butter',
      '1/4 cup flour',
      'Salt, pepper, paprika, garlic powder',
    ],
    instructions: [
      'Season pork with salt, pepper, paprika, and garlic powder.',
      'Place in slow cooker with 1/2 cup BBQ sauce and 1/2 cup water.',
      'Cook on low 8 hours or high 4 hours until fork-tender.',
      'Shred pork and mix with remaining BBQ sauce.',
      'For mac and cheese: cook pasta, make roux with butter and flour.',
      'Add milk gradually, then stir in cheese until melted.',
      'Combine pasta with cheese sauce.',
      'Serve pulled pork over mac and cheese.',
    ],
    tags: ['comfort-food', 'slow-cooker', 'bulking'],
  },
  {
    id: '20',
    name: 'Steak and Loaded Baked Potato',
    category: ['dinner', 'high-protein', 'high-calorie', 'high-carb', 'bulking'],
    prepTime: 10,
    cookTime: 60,
    servings: 2,
    calories: 950,
    protein: 58,
    carbs: 72,
    fat: 48,
    ingredients: [
      '2 ribeye steaks (10 oz each)',
      '2 large russet potatoes',
      '4 tbsp butter',
      '1/2 cup sour cream',
      '1 cup shredded cheddar cheese',
      '4 strips bacon, cooked and crumbled',
      'Chives for garnish',
      'Salt, pepper, garlic powder',
    ],
    instructions: [
      'Preheat oven to 400°F. Poke potatoes with fork and bake 45-60 minutes.',
      'Let steaks come to room temperature. Season generously.',
      'Heat cast iron skillet over high heat.',
      'Sear steaks 3-4 minutes per side for medium-rare.',
      'Rest steaks 5 minutes before serving.',
      'Split potatoes and fluff with fork.',
      'Load with butter, sour cream, cheese, bacon, and chives.',
      'Serve steak alongside loaded potato.',
    ],
    tags: ['steakhouse', 'indulgent', 'date-night'],
  },
  {
    id: '21',
    name: 'Shrimp Alfredo Pasta',
    category: ['dinner', 'high-protein', 'high-carb', 'high-calorie'],
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    calories: 720,
    protein: 42,
    carbs: 65,
    fat: 32,
    ingredients: [
      '1 lb fettuccine pasta',
      '1 lb large shrimp, peeled and deveined',
      '2 cups heavy cream',
      '1 cup parmesan cheese, grated',
      '4 cloves garlic, minced',
      '4 tbsp butter',
      'Fresh parsley',
      'Salt and pepper to taste',
    ],
    instructions: [
      'Cook pasta according to package directions. Reserve 1 cup pasta water.',
      'Season shrimp with salt and pepper.',
      'Melt butter in a large pan, cook shrimp 2-3 minutes per side. Remove.',
      'Add garlic to pan, cook 30 seconds.',
      'Add cream and bring to simmer. Cook 5 minutes until slightly thickened.',
      'Stir in parmesan until melted.',
      'Add pasta and shrimp, toss to coat. Add pasta water if needed.',
      'Garnish with parsley and serve.',
    ],
    tags: ['italian', 'indulgent', 'date-night'],
  },
  // ==================== HIGH-CARB MEALS ====================
  {
    id: '22',
    name: 'Chicken and Rice Power Bowl',
    category: ['lunch', 'dinner', 'high-carb', 'high-protein', 'bulking'],
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    calories: 750,
    protein: 55,
    carbs: 85,
    fat: 18,
    ingredients: [
      '12 oz chicken breast',
      '2 cups white rice',
      '1 cup black beans',
      '1 cup corn',
      '1/2 cup salsa',
      '1/4 cup Greek yogurt',
      'Lime juice',
      'Cilantro',
    ],
    instructions: [
      'Cook rice according to package directions.',
      'Season and grill chicken until cooked through.',
      'Slice chicken and set aside.',
      'Warm beans and corn.',
      'Divide rice between bowls.',
      'Top with chicken, beans, corn, salsa, and yogurt.',
      'Squeeze lime juice and garnish with cilantro.',
    ],
    tags: ['meal-prep', 'post-workout', 'bulking'],
  },
  {
    id: '23',
    name: 'Oatmeal with Fruit and Nuts',
    category: ['breakfast', 'high-carb', 'bulking'],
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    calories: 550,
    protein: 18,
    carbs: 82,
    fat: 18,
    ingredients: [
      '1 cup rolled oats',
      '2 cups milk',
      '1 banana, sliced',
      '1/4 cup walnuts',
      '2 tbsp honey',
      '2 tbsp raisins',
      '1/2 tsp cinnamon',
    ],
    instructions: [
      'Bring milk to a simmer in a pot.',
      'Add oats and cook 5-7 minutes, stirring occasionally.',
      'Transfer to bowl.',
      'Top with banana, walnuts, raisins, and cinnamon.',
      'Drizzle with honey and serve warm.',
    ],
    tags: ['vegetarian', 'filling', 'energy'],
  },
  {
    id: '24',
    name: 'Sweet Potato Hash with Eggs',
    category: ['breakfast', 'high-carb', 'high-protein'],
    prepTime: 10,
    cookTime: 25,
    servings: 2,
    calories: 520,
    protein: 24,
    carbs: 58,
    fat: 22,
    ingredients: [
      '2 large sweet potatoes, diced',
      '4 eggs',
      '1/2 lb breakfast sausage',
      '1 bell pepper, diced',
      '1/2 onion, diced',
      '2 tbsp olive oil',
      'Paprika, salt, pepper',
    ],
    instructions: [
      'Heat oil in a large skillet over medium heat.',
      'Add sweet potatoes and cook 15 minutes until tender.',
      'Add sausage, breaking apart, cook 5 minutes.',
      'Add bell pepper and onion, cook 5 more minutes.',
      'Make 4 wells and crack eggs into them.',
      'Cover and cook until eggs are set, about 4-5 minutes.',
      'Season with paprika, salt, and pepper.',
    ],
    tags: ['one-pan', 'weekend', 'filling'],
  },
  {
    id: '25',
    name: 'Teriyaki Chicken Rice Bowl',
    category: ['lunch', 'dinner', 'high-carb', 'high-protein'],
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    calories: 620,
    protein: 42,
    carbs: 75,
    fat: 14,
    ingredients: [
      '1.5 lb chicken thighs',
      '3 cups jasmine rice',
      '1/2 cup teriyaki sauce',
      '2 cups steamed broccoli',
      '1 cup edamame',
      '2 green onions, sliced',
      'Sesame seeds',
      '1 tbsp vegetable oil',
    ],
    instructions: [
      'Cook rice according to package directions.',
      'Cut chicken into bite-sized pieces.',
      'Cook chicken in oil until golden, about 8 minutes.',
      'Add teriyaki sauce and cook until glazed.',
      'Steam broccoli and edamame.',
      'Divide rice among bowls.',
      'Top with chicken, broccoli, and edamame.',
      'Garnish with green onions and sesame seeds.',
    ],
    tags: ['asian-inspired', 'meal-prep', 'family-friendly'],
  },
  // ==================== HIGH-CALORIE BULKING MEALS ====================
  {
    id: '26',
    name: 'Mass Gainer Oatmeal Bowl',
    category: ['breakfast', 'high-calorie', 'bulking', 'high-carb'],
    prepTime: 10,
    cookTime: 10,
    servings: 1,
    calories: 950,
    protein: 45,
    carbs: 120,
    fat: 32,
    ingredients: [
      '1.5 cups rolled oats',
      '2 cups whole milk',
      '2 scoops protein powder',
      '2 tbsp peanut butter',
      '1 banana',
      '2 tbsp honey',
      '1/4 cup granola',
      '2 tbsp chia seeds',
    ],
    instructions: [
      'Cook oats in milk until creamy.',
      'Stir in protein powder while hot.',
      'Transfer to bowl and add peanut butter.',
      'Top with sliced banana and granola.',
      'Drizzle honey and sprinkle chia seeds.',
      'Eat while warm for best results.',
    ],
    tags: ['bulking', 'mass-gainer', 'post-workout'],
  },
  {
    id: '27',
    name: 'Double Cheeseburger with Fries',
    category: ['lunch', 'dinner', 'high-calorie', 'bulking', 'high-protein'],
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    calories: 1100,
    protein: 62,
    carbs: 78,
    fat: 58,
    ingredients: [
      '1 lb ground beef (80/20)',
      '4 slices American cheese',
      '2 brioche buns',
      '2 large potatoes, cut into fries',
      'Lettuce, tomato, onion, pickles',
      'Ketchup, mustard, mayo',
      '3 tbsp olive oil',
      'Salt, pepper, garlic powder',
    ],
    instructions: [
      'Preheat oven to 425°F. Toss fries with oil and seasonings.',
      'Bake fries 25-30 minutes, flipping halfway.',
      'Form beef into 4 thin patties. Season well.',
      'Cook patties 3 minutes per side on high heat.',
      'Add cheese in last minute to melt.',
      'Toast buns and assemble with toppings.',
      'Serve burgers with fries.',
    ],
    tags: ['comfort-food', 'indulgent', 'bulking'],
  },
  {
    id: '28',
    name: 'Chicken Parmesan with Spaghetti',
    category: ['dinner', 'high-calorie', 'high-carb', 'high-protein', 'bulking'],
    prepTime: 20,
    cookTime: 30,
    servings: 4,
    calories: 880,
    protein: 58,
    carbs: 82,
    fat: 35,
    ingredients: [
      '4 chicken breasts, pounded thin',
      '12 oz spaghetti',
      '1 cup breadcrumbs',
      '1/2 cup parmesan cheese',
      '2 eggs, beaten',
      '2 cups marinara sauce',
      '1 cup mozzarella, shredded',
      '1/4 cup olive oil',
    ],
    instructions: [
      'Preheat oven to 400°F.',
      'Mix breadcrumbs with parmesan.',
      'Dip chicken in eggs, then breadcrumb mixture.',
      'Pan-fry chicken in oil until golden, about 4 minutes per side.',
      'Transfer to baking sheet, top with marinara and mozzarella.',
      'Bake 15 minutes until cheese is bubbly.',
      'Cook spaghetti and serve with extra marinara.',
      'Place chicken parm on top of pasta.',
    ],
    tags: ['italian', 'comfort-food', 'family-favorite'],
  },
  {
    id: '29',
    name: 'Carnitas Tacos with Rice and Beans',
    category: ['dinner', 'high-calorie', 'high-carb', 'high-protein', 'bulking'],
    prepTime: 15,
    cookTime: 240,
    servings: 6,
    calories: 850,
    protein: 48,
    carbs: 88,
    fat: 32,
    ingredients: [
      '3 lb pork shoulder',
      '8 flour tortillas',
      '2 cups Mexican rice',
      '1 can refried beans',
      '1 cup salsa verde',
      '1 onion, quartered',
      '4 cloves garlic',
      'Cumin, oregano, salt, pepper',
      'Cilantro, lime, onion for topping',
    ],
    instructions: [
      'Season pork generously with spices.',
      'Place in slow cooker with onion, garlic, and 1/2 cup water.',
      'Cook on low 8 hours or high 4 hours.',
      'Shred pork and broil 5 minutes for crispy edges.',
      'Cook Mexican rice according to package.',
      'Warm refried beans and tortillas.',
      'Assemble tacos with carnitas, salsa, cilantro, onion.',
      'Serve with rice and beans on the side.',
    ],
    tags: ['mexican', 'slow-cooker', 'feeding-a-crowd'],
  },
  {
    id: '30',
    name: 'Peanut Butter Protein Rice Cakes',
    category: ['snack', 'high-calorie', 'bulking', 'quick'],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    calories: 480,
    protein: 28,
    carbs: 48,
    fat: 22,
    ingredients: [
      '3 rice cakes',
      '3 tbsp peanut butter',
      '1 scoop protein powder (mixed thick)',
      '1 banana, sliced',
      '1 tbsp honey',
      'Cinnamon',
    ],
    instructions: [
      'Mix protein powder with minimal water to create thick paste.',
      'Spread peanut butter on each rice cake.',
      'Add layer of protein paste.',
      'Top with banana slices.',
      'Drizzle with honey and sprinkle cinnamon.',
    ],
    tags: ['no-cook', 'quick', 'pre-workout'],
  },
  // ==================== SNACKS & QUICK BITES ====================
  {
    id: '31',
    name: 'Protein Shake Smoothie',
    category: ['breakfast', 'snack', 'quick', 'high-protein'],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    calories: 350,
    protein: 35,
    carbs: 38,
    fat: 8,
    ingredients: [
      '1 scoop chocolate protein powder',
      '1 banana',
      '1 cup almond milk',
      '1 tbsp peanut butter',
      '1 tbsp cocoa powder',
      '1/2 cup ice',
      '1 tbsp honey (optional)',
    ],
    instructions: [
      'Add all ingredients to a blender.',
      'Blend on high for 1-2 minutes until smooth.',
      'Add more liquid if too thick.',
      'Pour into a glass and enjoy immediately.',
    ],
    tags: ['no-cook', 'quick'],
  },
  {
    id: '32',
    name: 'Cottage Cheese Snack Bowl',
    category: ['snack', 'high-protein', 'quick'],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    calories: 220,
    protein: 24,
    carbs: 15,
    fat: 7,
    ingredients: [
      '1 cup low-fat cottage cheese',
      '1/4 cup pineapple chunks',
      '2 tbsp sliced almonds',
      '1 tsp honey',
      'Dash of cinnamon',
    ],
    instructions: [
      'Add cottage cheese to a bowl.',
      'Top with pineapple and almonds.',
      'Drizzle with honey.',
      'Sprinkle with cinnamon and enjoy.',
    ],
    tags: ['no-cook', 'quick'],
  },
  {
    id: '33',
    name: 'Greek Yogurt Parfait',
    category: ['snack', 'breakfast', 'high-protein', 'quick'],
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    calories: 380,
    protein: 28,
    carbs: 45,
    fat: 10,
    ingredients: [
      '1 cup Greek yogurt',
      '1/2 cup granola',
      '1/2 cup mixed berries',
      '1 tbsp honey',
      '1 tbsp sliced almonds',
    ],
    instructions: [
      'Layer half the yogurt in a glass or bowl.',
      'Add half the granola and berries.',
      'Repeat layers.',
      'Drizzle with honey and top with almonds.',
    ],
    tags: ['no-cook', 'quick', 'kid-friendly'],
  },
  {
    id: '34',
    name: 'Trail Mix Energy Bites',
    category: ['snack', 'high-calorie', 'bulking', 'meal-prep'],
    prepTime: 15,
    cookTime: 0,
    servings: 12,
    calories: 180,
    protein: 6,
    carbs: 22,
    fat: 9,
    ingredients: [
      '1 cup rolled oats',
      '1/2 cup peanut butter',
      '1/3 cup honey',
      '1/2 cup chocolate chips',
      '1/4 cup dried cranberries',
      '1/4 cup sunflower seeds',
      '1 scoop vanilla protein powder',
    ],
    instructions: [
      'Mix all ingredients in a large bowl until combined.',
      'Refrigerate 30 minutes until firm.',
      'Roll into 12 balls.',
      'Store in fridge for up to 2 weeks.',
    ],
    tags: ['no-bake', 'meal-prep', 'portable'],
  },
  {
    id: '35',
    name: 'Avocado Toast with Eggs',
    category: ['breakfast', 'snack', 'high-protein', 'quick'],
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    calories: 450,
    protein: 20,
    carbs: 32,
    fat: 28,
    ingredients: [
      '2 slices sourdough bread',
      '1 ripe avocado',
      '2 eggs',
      'Red pepper flakes',
      'Salt and pepper',
      'Everything bagel seasoning',
      '1 tbsp olive oil',
    ],
    instructions: [
      'Toast bread until golden.',
      'Mash avocado with salt and pepper.',
      'Fry or poach eggs to preference.',
      'Spread avocado on toast.',
      'Top with eggs.',
      'Season with red pepper flakes and everything seasoning.',
    ],
    tags: ['quick', 'vegetarian', 'trendy'],
  },
  // ==================== VEGETARIAN OPTIONS ====================
  {
    id: '36',
    name: 'Quinoa Buddha Bowl',
    category: ['lunch', 'dinner', 'vegetarian', 'high-protein'],
    prepTime: 15,
    cookTime: 20,
    servings: 2,
    calories: 450,
    protein: 18,
    carbs: 55,
    fat: 18,
    ingredients: [
      '1 cup quinoa',
      '1 can chickpeas, drained and rinsed',
      '2 cups kale, chopped',
      '1 avocado, sliced',
      '1 cup roasted sweet potato',
      '2 tbsp tahini',
      '1 tbsp lemon juice',
      '1 tbsp maple syrup',
      'Salt and cumin to taste',
    ],
    instructions: [
      'Cook quinoa according to package directions.',
      'Season chickpeas with cumin and salt, roast at 400°F for 20 minutes.',
      'Massage kale with a drizzle of olive oil and lemon.',
      'Make dressing by whisking tahini, lemon juice, and maple syrup.',
      'Divide quinoa between bowls.',
      'Top with chickpeas, kale, sweet potato, and avocado.',
      'Drizzle with tahini dressing.',
    ],
    tags: ['vegan', 'plant-based'],
  },
  {
    id: '37',
    name: 'Black Bean Tacos',
    category: ['lunch', 'dinner', 'vegetarian', 'high-carb', 'high-protein'],
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    calories: 420,
    protein: 16,
    carbs: 62,
    fat: 14,
    ingredients: [
      '2 cans black beans, drained',
      '8 corn tortillas',
      '1 cup corn kernels',
      '1 cup pico de gallo',
      '1 avocado, diced',
      '1/2 cup cotija cheese',
      'Cumin, chili powder, garlic',
      'Lime wedges, cilantro',
    ],
    instructions: [
      'Season beans with cumin, chili, and garlic. Heat in pan.',
      'Warm tortillas in dry skillet.',
      'Heat corn kernels.',
      'Fill tortillas with beans and corn.',
      'Top with pico, avocado, and cheese.',
      'Garnish with cilantro and lime.',
    ],
    tags: ['mexican', 'vegan-option', 'quick'],
  },
  {
    id: '38',
    name: 'Tofu Stir Fry with Noodles',
    category: ['dinner', 'vegetarian', 'high-carb', 'high-protein'],
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    calories: 520,
    protein: 24,
    carbs: 58,
    fat: 22,
    ingredients: [
      '14 oz extra-firm tofu, pressed and cubed',
      '8 oz lo mein noodles',
      '2 cups mixed vegetables',
      '3 tbsp soy sauce',
      '2 tbsp hoisin sauce',
      '1 tbsp sesame oil',
      '3 cloves garlic, minced',
      '1 tbsp cornstarch',
    ],
    instructions: [
      'Press tofu, cut into cubes, toss with cornstarch.',
      'Fry tofu in oil until crispy on all sides. Set aside.',
      'Cook noodles according to package.',
      'Stir-fry vegetables until crisp-tender.',
      'Add garlic, soy sauce, and hoisin.',
      'Add noodles and tofu, toss to combine.',
      'Drizzle with sesame oil and serve.',
    ],
    tags: ['asian-inspired', 'vegan', 'filling'],
  },
  {
    id: '39',
    name: 'Caprese Pasta Salad',
    category: ['lunch', 'dinner', 'vegetarian', 'high-carb'],
    prepTime: 15,
    cookTime: 12,
    servings: 6,
    calories: 420,
    protein: 14,
    carbs: 52,
    fat: 18,
    ingredients: [
      '1 lb rotini pasta',
      '2 cups cherry tomatoes, halved',
      '8 oz fresh mozzarella, cubed',
      '1/2 cup fresh basil, chopped',
      '1/4 cup balsamic glaze',
      '3 tbsp olive oil',
      'Salt and pepper to taste',
    ],
    instructions: [
      'Cook pasta according to package. Rinse with cold water.',
      'Combine pasta, tomatoes, and mozzarella.',
      'Add olive oil and toss to coat.',
      'Season with salt and pepper.',
      'Drizzle with balsamic glaze.',
      'Top with fresh basil and serve.',
    ],
    tags: ['italian', 'cold-dish', 'potluck'],
  },
  {
    id: '40',
    name: 'Lentil Soup',
    category: ['lunch', 'dinner', 'vegetarian', 'high-protein', 'high-carb'],
    prepTime: 10,
    cookTime: 40,
    servings: 6,
    calories: 320,
    protein: 18,
    carbs: 48,
    fat: 6,
    ingredients: [
      '2 cups dried lentils',
      '1 onion, diced',
      '3 carrots, diced',
      '3 celery stalks, diced',
      '4 cloves garlic, minced',
      '6 cups vegetable broth',
      '1 can diced tomatoes',
      '2 tsp cumin',
      'Juice of 1 lemon',
    ],
    instructions: [
      'Sauté onion, carrots, and celery until soft.',
      'Add garlic and cumin, cook 1 minute.',
      'Add lentils, broth, and tomatoes.',
      'Bring to boil, then simmer 30-35 minutes.',
      'Add lemon juice before serving.',
      'Season with salt and pepper.',
      'Serve with crusty bread.',
    ],
    tags: ['vegan', 'soup', 'budget-friendly'],
  },
  // ==================== MORE HIGH PROTEIN OPTIONS ====================
  {
    id: '41',
    name: 'Grilled Flank Steak with Chimichurri',
    category: ['dinner', 'high-protein', 'low-carb'],
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    calories: 380,
    protein: 45,
    carbs: 4,
    fat: 20,
    ingredients: [
      '1.5 lb flank steak',
      '1 cup fresh parsley, chopped',
      '1/4 cup fresh oregano',
      '4 cloves garlic, minced',
      '1/4 cup red wine vinegar',
      '1/2 cup olive oil',
      'Red pepper flakes',
      'Salt and pepper',
    ],
    instructions: [
      'Mix parsley, oregano, garlic, vinegar, and oil for chimichurri.',
      'Season steak generously with salt and pepper.',
      'Grill over high heat 4-5 minutes per side for medium-rare.',
      'Let rest 10 minutes before slicing against the grain.',
      'Serve with chimichurri sauce on top.',
    ],
    tags: ['argentinian', 'grilling', 'keto-friendly'],
  },
  {
    id: '42',
    name: 'Baked Cod with Vegetables',
    category: ['dinner', 'high-protein', 'low-carb'],
    prepTime: 10,
    cookTime: 25,
    servings: 2,
    calories: 320,
    protein: 42,
    carbs: 12,
    fat: 12,
    ingredients: [
      '2 cod fillets (6 oz each)',
      '2 cups asparagus',
      '1 cup cherry tomatoes',
      '2 tbsp olive oil',
      '2 cloves garlic, minced',
      'Fresh thyme',
      '1 lemon',
      'Salt and pepper',
    ],
    instructions: [
      'Preheat oven to 400°F.',
      'Arrange asparagus and tomatoes on baking sheet.',
      'Drizzle with oil, season with salt and pepper.',
      'Place cod on top, season and add garlic.',
      'Bake 20-25 minutes until fish flakes easily.',
      'Squeeze lemon over and garnish with thyme.',
    ],
    tags: ['one-pan', 'healthy', 'light'],
  },
  {
    id: '43',
    name: 'Turkey Meatballs in Marinara',
    category: ['dinner', 'high-protein', 'meal-prep'],
    prepTime: 15,
    cookTime: 25,
    servings: 4,
    calories: 340,
    protein: 38,
    carbs: 18,
    fat: 14,
    ingredients: [
      '1.5 lb ground turkey',
      '1/2 cup breadcrumbs',
      '1/4 cup parmesan cheese',
      '1 egg',
      '2 cloves garlic, minced',
      '2 cups marinara sauce',
      'Italian seasoning',
      'Fresh basil',
    ],
    instructions: [
      'Preheat oven to 400°F.',
      'Mix turkey, breadcrumbs, parmesan, egg, garlic, and seasonings.',
      'Form into 16 meatballs.',
      'Bake on greased sheet 15 minutes.',
      'Transfer to pot with marinara, simmer 10 minutes.',
      'Serve over zucchini noodles or pasta.',
      'Top with fresh basil.',
    ],
    tags: ['italian', 'meal-prep', 'kid-friendly'],
  },
  {
    id: '44',
    name: 'Tuna Poke Bowl',
    category: ['lunch', 'dinner', 'high-protein', 'high-carb'],
    prepTime: 20,
    cookTime: 15,
    servings: 2,
    calories: 520,
    protein: 38,
    carbs: 58,
    fat: 16,
    ingredients: [
      '12 oz sushi-grade ahi tuna, cubed',
      '2 cups sushi rice',
      '1 avocado, sliced',
      '1 cucumber, sliced',
      '1/2 cup edamame',
      '3 tbsp soy sauce',
      '1 tbsp sesame oil',
      'Sesame seeds, green onion',
    ],
    instructions: [
      'Cook sushi rice according to package.',
      'Marinate tuna in soy sauce and sesame oil for 15 minutes.',
      'Divide rice between bowls.',
      'Arrange tuna, avocado, cucumber, and edamame on top.',
      'Drizzle with remaining marinade.',
      'Top with sesame seeds and green onion.',
    ],
    tags: ['hawaiian', 'fresh', 'trendy'],
  },
  {
    id: '45',
    name: 'Bison Burger',
    category: ['lunch', 'dinner', 'high-protein'],
    prepTime: 10,
    cookTime: 12,
    servings: 2,
    calories: 480,
    protein: 42,
    carbs: 28,
    fat: 22,
    ingredients: [
      '10 oz ground bison',
      '2 brioche buns',
      '2 slices cheddar cheese',
      'Lettuce, tomato, onion',
      '2 tbsp mayo',
      '1 tbsp Dijon mustard',
      'Salt, pepper, garlic powder',
    ],
    instructions: [
      'Form bison into 2 patties, season generously.',
      'Cook on high heat 4-5 minutes per side.',
      'Add cheese in last minute.',
      'Toast buns.',
      'Mix mayo and mustard for sauce.',
      'Assemble burgers with all toppings.',
    ],
    tags: ['lean-meat', 'grilling', 'high-protein'],
  },
];

const categories = [
  { id: 'all', label: 'All Recipes' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snacks' },
  { id: 'high-protein', label: 'High Protein' },
  { id: 'high-carb', label: 'High Carb' },
  { id: 'high-calorie', label: 'High Calorie' },
  { id: 'bulking', label: 'Bulking' },
  { id: 'low-carb', label: 'Low Carb' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'quick', label: 'Quick (< 20 min)' },
  { id: 'meal-prep', label: 'Meal Prep' },
];

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || recipe.category.includes(activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Recipe Library</h1>
        <p className="mt-2 text-grey-600">
          {recipes.length} healthy recipes with complete nutrition info
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-grey-400" />
        <input
          type="text"
          placeholder="Search recipes or ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-grey-300 rounded-lg focus:ring-2 focus:ring-cinnamon focus:border-cinnamon"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-chocolate text-white'
                : 'bg-biscotti/30 text-chocolate hover:bg-biscotti/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-grey-500 mb-4">{filteredRecipes.length} recipes found</p>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <Card key={recipe.id} className="overflow-hidden">
            {/* Recipe Header */}
            <div className="bg-gradient-to-r from-cinnamon to-chocolate p-6 text-white relative overflow-hidden">
              {/* EP Logo Pattern */}
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage: `url("/ep-icon.png")`,
                  backgroundSize: '50px 50px',
                  backgroundRepeat: 'repeat',
                  filter: 'brightness(2)',
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <ChefHat className="h-5 w-5" />
                  <span className="text-sm text-biscotti">
                    {recipe.category.slice(0, 2).map(c => c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')).join(', ')}
                  </span>
                </div>
                <h3 className="text-xl font-bold">{recipe.name}</h3>
              </div>
            </div>

            <CardContent className="p-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-grey-500 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Time</span>
                  </div>
                  <p className="font-bold text-black">{recipe.prepTime + recipe.cookTime}m</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-grey-500 text-sm">
                    <Flame className="h-4 w-4" />
                    <span>Cal</span>
                  </div>
                  <p className="font-bold text-black">{recipe.calories}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-grey-500 text-sm">
                    <Users className="h-4 w-4" />
                    <span>Serves</span>
                  </div>
                  <p className="font-bold text-black">{recipe.servings}</p>
                </div>
              </div>

              {/* Macros */}
              <div className="flex justify-between bg-biscotti/20 p-3 rounded-lg mb-4">
                <div className="text-center">
                  <p className="text-xs text-grey-500">Protein</p>
                  <p className="font-bold text-red-600">{recipe.protein}g</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-grey-500">Carbs</p>
                  <p className="font-bold text-tawny">{recipe.carbs}g</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-grey-500">Fat</p>
                  <p className="font-bold text-green-600">{recipe.fat}g</p>
                </div>
              </div>

              {/* Expand Button */}
              <button
                onClick={() => setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)}
                className="w-full py-2 text-cinnamon font-medium flex items-center justify-center gap-2 hover:bg-biscotti/20 rounded-lg transition-colors"
              >
                {expandedRecipe === recipe.id ? (
                  <>Hide Details <ChevronUp className="h-4 w-4" /></>
                ) : (
                  <>View Recipe <ChevronDown className="h-4 w-4" /></>
                )}
              </button>

              {/* Expanded Details */}
              {expandedRecipe === recipe.id && (
                <div className="mt-4 pt-4 border-t border-grey-200 space-y-4">
                  {/* Ingredients */}
                  <div>
                    <h4 className="font-bold text-black mb-2">Ingredients</h4>
                    <ul className="space-y-1">
                      {recipe.ingredients.map((ingredient, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-grey-600">
                          <span className="text-cinnamon mt-1">•</span>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h4 className="font-bold text-black mb-2">Instructions</h4>
                    <ol className="space-y-2">
                      {recipe.instructions.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-grey-600">
                          <span className="w-6 h-6 bg-chocolate text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {recipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-biscotti/30 text-chocolate text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <UtensilsCrossed className="h-12 w-12 text-grey-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-black mb-2">No recipes found</h3>
          <p className="text-grey-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
