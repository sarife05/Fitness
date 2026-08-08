document.addEventListener("DOMContentLoaded", () => {
    loadWorkouts();
    loadExercises();

    const form = document.getElementById("itemForm");
    form.addEventListener("submit", saveItem);

    document.getElementById("workoutId").addEventListener("change", loadItems);
});

async function loadWorkouts() {
    const res = await fetch("/api/workouts");
    const data = await res.json();

    const select = document.getElementById("workoutId");
    select.innerHTML = '<option value="">Select workout</option>';

    data.workouts.forEach(workout => {
        select.innerHTML += `
            <option value="${workout._id}">
                ${workout.name}
            </option>
        `;
    });
}

async function loadExercises() {
    const res = await fetch("/api/exercises");
    const data = await res.json();

    const select = document.getElementById("exerciseId");
    select.innerHTML = '<option value="">Select exercise</option>';

    data.exercises.forEach(exercise => {
        select.innerHTML += `
            <option value="${exercise._id}">
                ${exercise.name}
            </option>
        `;
    });
}

async function loadItems() {
    const workoutId = document.getElementById("workoutId").value;

    if (!workoutId) return;

    const res = await fetch("/api/workouts/" + workoutId + "/items");
    const data = await res.json();

    const table = document.getElementById("itemTable");
    table.innerHTML = "";

    data.items.forEach(item => {
        table.innerHTML += `
            <tr>
                <td>${item.exerciseId?.name || item.exerciseId}</td>
                <td>${item.sets}</td>
                <td>${item.reps}</td>
                <td>${item.weight}</td>
                <td>
                    <button type="button" onclick="editItem('${item._id}')">Edit</button>
                    <button type="button" onclick="deleteItem('${item._id}')">Delete</button>
                </td>
            </tr>
        `;
    });
}

async function saveItem(e) {
    e.preventDefault();

    const workoutId = document.getElementById("workoutId").value;
    const itemId = document.getElementById("itemId").value;

    const body = {
        exerciseId: document.getElementById("exerciseId").value,
        sets: Number(document.getElementById("sets").value),
        reps: Number(document.getElementById("reps").value),
        weight: Number(document.getElementById("weight").value)
    };

    if (itemId) {
        await fetch("/api/workouts/" + workoutId + "/items/" + itemId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
    } else {
        await fetch("/api/workouts/" + workoutId + "/items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
    }

    document.getElementById("itemForm").reset();
    document.getElementById("itemId").value = "";

    loadItems();
}

async function editItem(id) {
    const workoutId = document.getElementById("workoutId").value;

    const res = await fetch("/api/workouts/" + workoutId + "/items");
    const data = await res.json();

    const item = data.items.find(i => i._id === id);

    document.getElementById("itemId").value = item._id;
    document.getElementById("exerciseId").value = item.exerciseId._id || item.exerciseId;
    document.getElementById("sets").value = item.sets;
    document.getElementById("reps").value = item.reps;
    document.getElementById("weight").value = item.weight;
}

async function deleteItem(id) {
    const workoutId = document.getElementById("workoutId").value;

    if (!confirm("Delete item?")) return;

    await fetch("/api/workouts/" + workoutId + "/items/" + id, {
        method: "DELETE"
    });

    loadItems();
}