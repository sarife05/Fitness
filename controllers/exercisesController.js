const { searchExercises } = require('../services/exercisesService');
async function getExercises(req, res) {
  const search = (req.query.search || '').trim();

  if (!search) {
    return res.status(400).json({ ok: false, error: 'Please provide a "search" query parameter, e.g. ?search=squat.' });
  }

  const result = await searchExercises(search);

  if (!result.ok) {
    return res.status(502).json({ ok: false, error: result.error });
  }

  return res.json({ ok: true, search, count: result.exercises.length, exercises: result.exercises });
}

module.exports = { getExercises };
