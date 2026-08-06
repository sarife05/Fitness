const { searchFoods } = require('../services/nutritionService');

async function getFoods(req, res) {
  const search = (req.query.search || '').trim();

  if (!search) {
    return res.status(400).json({ ok: false, error: 'Please provide a "search" query parameter, e.g. ?search=banana.' });
  }

  const result = await searchFoods(search);

  if (!result.ok) {
    return res.status(502).json({ ok: false, error: result.error });
  }

  return res.json({ ok: true, search, count: result.foods.length, foods: result.foods });
}

module.exports = { getFoods };
