document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('exercise-search-form');
    const input = document.getElementById('exercise-term');
    const status = document.getElementById('exercise-status');
    const results = document.getElementById('exercise-results');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const term = input.value.trim();
        if (!term) return;

        status.textContent = 'Searching…';
        results.innerHTML = '';

        try {
            const response = await fetch(`/api/exercise-search?search=${encodeURIComponent(term)}`);
            const data = await response.json();

            if (!data.ok) {
                status.textContent = data.error || 'Something went wrong.';
                return;
            }

            if (data.exercises.length === 0) {
                status.textContent = `No results found for "${term}".`;
                return;
            }

            status.textContent = `Found ${data.count} result${data.count === 1 ? '' : 's'} for "${term}".`;
            results.innerHTML = data.exercises.map(renderExerciseCard).join('');
        } catch (err) {
            status.textContent = 'Could not reach the server. Please try again.';
        }
    });

    function renderExerciseCard(exercise) {
        const image = exercise.thumbnail
            ? `<img src="${exercise.thumbnail}" alt="${escapeHtml(exercise.name)}" loading="lazy">`
            : '';
        return `
      <div class="card">
        ${image}
        <h3>${escapeHtml(exercise.name)}</h3>
        ${exercise.category ? `<span class="badge">${escapeHtml(exercise.category)}</span>` : ''}
      </div>
    `;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }
});