const { httpClient, safeRequest } = require('../utils/httpClient');

const SEARCH_URL = 'https://search.openfoodfacts.org/search';

async function searchFoods(term) {
  const result = await safeRequest(
      () => httpClient.get(SEARCH_URL, {
        params: {
          q: term,
          page_size: 12,
          page: 1
        }
      }),
      'Nutrition database (Open Food Facts / Search-a-licious)'
  );

  if (!result.ok) {
    return { ok: false, error: result.error, foods: [] };
  }
  const products = result.data.hits || result.data.products || [];

  const foods = products
      .filter((product) => product.product_name) // skip incomplete/unnamed entries
      .map((product) => {
        const nutriments = product.nutriments || {};
        return {
          id: product.code || null,
          name: product.product_name,
          brand: product.brands || 'Unknown brand',
          image: product.image_front_small_url || product.image_url || null,
          caloriesPer100g: nutriments['energy-kcal_100g'] ?? null,
          proteinPer100g: nutriments['proteins_100g'] ?? null,
          carbsPer100g: nutriments['carbohydrates_100g'] ?? null,
          fatPer100g: nutriments['fat_100g'] ?? null,
          nutriScore: (product.nutriscore_grade || product.nutrition_grade_fr || null)
        };
      });

  return { ok: true, foods };
}

module.exports = { searchFoods };