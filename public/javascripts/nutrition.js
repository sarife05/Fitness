document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('nutrition-search-form');
    const input = document.getElementById('food-term');
    const status = document.getElementById('nutrition-status');
    const results = document.getElementById('nutrition-results');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const term = input.value.trim();
        if (!term) return;

        status.textContent = 'Searching…';
        results.innerHTML = '';

        try {
            const response = await fetch(`/api/nutrition?search=${encodeURIComponent(term)}`);
            const data = await response.json();

            if (!data.ok) {
                status.textContent = data.error || 'Something went wrong.';
                return;
            }

            if (data.foods.length === 0) {
                status.textContent = `No results found for "${term}".`;
                return;
            }

            status.textContent = `Found ${data.count} result${data.count === 1 ? '' : 's'} for "${term}".`;
            results.innerHTML = data.foods.map(renderFoodCard).join('');
        } catch (err) {
            status.textContent = 'Could not reach the server. Please try again.';
        }
    });

    function renderFoodCard(food) {
        const image = food.image
            ? `<img src="${food.image}" alt="${escapeHtml(food.name)}" loading="lazy">`
            : '';
        return `
      <div class="card">
        ${image}
        <h3>${escapeHtml(food.name)}</h3>
        <p class="brand">${escapeHtml(food.brand)}</p>
        <ul class="macros">
          <li>Calories: ${food.caloriesPer100g ?? '—'} kcal/100g</li>
          <li>Protein: ${food.proteinPer100g ?? '—'} g</li>
          <li>Carbs: ${food.carbsPer100g ?? '—'} g</li>
          <li>Fat: ${food.fatPer100g ?? '—'} g</li>
        </ul>
        ${food.nutriScore ? `<span class="badge">Nutri-Score: ${escapeHtml(String(food.nutriScore).toUpperCase())}</span>` : ''}
      </div>
    `;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }
});