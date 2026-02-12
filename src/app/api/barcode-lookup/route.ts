import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('code');

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode is required' }, { status: 400 });
  }

  try {
    // Look up product from Open Food Facts
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      {
        headers: {
          'User-Agent': 'ElevatedPhysiqueFitness/1.0 (contact@elevatedphysiquefitness.com)',
        },
      }
    );

    const data = await response.json();

    if (data.status !== 1 || !data.product) {
      return NextResponse.json({
        found: false,
        error: 'Product not found'
      });
    }

    const product = data.product;
    const nutriments = product.nutriments || {};

    // Get serving size info
    let servingSize = product.serving_size || '';
    const servingQuantity = product.serving_quantity || 100;

    // Calculate per-serving values if available, otherwise use per 100g
    const hasServingData = nutriments['energy-kcal_serving'] !== undefined;

    let calories: number;
    let protein: number;
    let carbs: number;
    let fat: number;

    if (hasServingData) {
      calories = Math.round(nutriments['energy-kcal_serving'] || 0);
      protein = Math.round((nutriments.proteins_serving || 0) * 10) / 10;
      carbs = Math.round((nutriments.carbohydrates_serving || 0) * 10) / 10;
      fat = Math.round((nutriments.fat_serving || 0) * 10) / 10;
      if (!servingSize) {
        servingSize = `${servingQuantity}g`;
      }
    } else {
      // Use per 100g values
      calories = Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0);
      protein = Math.round((nutriments.proteins_100g || nutriments.proteins || 0) * 10) / 10;
      carbs = Math.round((nutriments.carbohydrates_100g || nutriments.carbohydrates || 0) * 10) / 10;
      fat = Math.round((nutriments.fat_100g || nutriments.fat || 0) * 10) / 10;
      servingSize = '100g';
    }

    // Get product name
    const name = product.product_name || product.product_name_en || 'Unknown Product';
    const brand = product.brands || '';

    return NextResponse.json({
      found: true,
      product: {
        name: brand ? `${brand} - ${name}` : name,
        brand,
        servingSize,
        calories,
        protein,
        carbs,
        fat,
        barcode,
        image: product.image_front_small_url || product.image_url || null,
      },
    });
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to look up product' },
      { status: 500 }
    );
  }
}
