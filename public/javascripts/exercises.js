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

// ======================
// MY EXERCISES CRUD
// ======================

const crudTable = document.getElementById("crudExercises");

if (crudTable) {
    loadCrudExercises();
}

async function loadCrudExercises() {

    const response = await fetch("/api/exercises");
    const data = await response.json();

    crudTable.innerHTML = "";

    data.exercises.forEach(ex => {

        crudTable.innerHTML += `
        <tr>

            <td>${ex.name}</td>

            <td>${ex.muscleGroup}</td>

            <td>${ex.equipment}</td>

            <td>

                <button onclick="editCrudExercise('${ex._id}')">
                    Edit
                </button>

                <button onclick="deleteCrudExercise('${ex._id}')">
                    Delete
                </button>

            </td>

        </tr>
        `;

    });

}

const crudForm = document.getElementById("crudExerciseForm");

if (crudForm) {

    crudForm.addEventListener("submit", async function(e){

        e.preventDefault();

        const id=document.getElementById("crudId").value;

        const body={

            name:document.getElementById("crudName").value,

            muscleGroup:document.getElementById("crudMuscle").value,

            equipment:document.getElementById("crudEquipment").value

        };

        if(id){

            await fetch("/api/exercises/"+id,{
                method:"PUT",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(body)
            });

        }else{

            await fetch("/api/exercises",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify(body)
            });

        }

        this.reset();

        document.getElementById("crudId").value="";

        loadCrudExercises();

    });

}

async function editCrudExercise(id){

    const response=await fetch("/api/exercises/"+id);

    const data=await response.json();

    document.getElementById("crudId").value=data.exercise._id;
    document.getElementById("crudName").value=data.exercise.name;
    document.getElementById("crudMuscle").value=data.exercise.muscleGroup;
    document.getElementById("crudEquipment").value=data.exercise.equipment;

}

async function deleteCrudExercise(id){

    if(!confirm("Delete?")) return;

    await fetch("/api/exercises/"+id,{
        method:"DELETE"
    });

    loadCrudExercises();

}