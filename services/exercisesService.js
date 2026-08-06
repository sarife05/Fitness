const { httpClient, safeRequest } = require('../utils/httpClient');
const WGER_BASE = 'https://wger.de/api/v2';
const ENGLISH_LANGUAGE_ID = 2;
async function searchExercises(term) {
  const result = await safeRequest(
      () => httpClient.get(`${WGER_BASE}/exerciseinfo/`, {
        params: {
          name__exact: term,
          language__code: 'en',
          limit: 20,
          format: 'json'
        }
      }),
      'Exercise database (wger)'
  );

  if (!result.ok) {
    return { ok: false, error: result.error, exercises: [] };
  }

  const results = result.data.results || [];

  const exercises = results.map((exercise) => {
    const translations = exercise.translations || [];
    const translation =
        translations.find((t) => t.language === ENGLISH_LANGUAGE_ID) || translations[0] || {};

    const images = exercise.images || [];
    const mainImage = images.find((img) => img.is_main) || images[0] || null;

    return {
      id: exercise.id ?? null,
      name: translation.name || 'Unnamed exercise',
      category: exercise.category ? exercise.category.name : null,
      image: mainImage ? mainImage.image : null,
      thumbnail: mainImage?.thumbnails?.small || (mainImage ? mainImage.image : null)
    };
  });

  return { ok: true, exercises };
}

module.exports = { searchExercises };