document.addEventListener("DOMContentLoaded", () => {

    loadWorkouts();

    const form=document.getElementById("workoutForm");

    form.addEventListener("submit",saveWorkout);

});

async function loadWorkouts(){

    const response=await fetch("/api/workouts");

    const data=await response.json();

    const table=document.getElementById("workoutTable");

    table.innerHTML="";

    data.workouts.forEach(w=>{

        table.innerHTML+=`

<tr>

<td>${new Date(w.date).toLocaleDateString()}</td>

<td>${w.duration}</td>

<td>${w.notes||""}</td>

<td>

<button onclick="editWorkout('${w._id}')">

Edit

</button>

<button onclick="deleteWorkout('${w._id}')">

Delete

</button>

</td>

</tr>

`;

    });

}

async function saveWorkout(e){

    e.preventDefault();

    const id=document.getElementById("workoutId").value;

    const workout={

        date:document.getElementById("date").value,

        duration:Number(document.getElementById("duration").value),

        notes:document.getElementById("notes").value,

        items:[

        ]

    };

    if(id){

        await fetch("/api/workouts/"+id,{

            method:"PUT",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify(workout)

        });

    }else{

        await fetch("/api/workouts",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify(workout)

        });

    }

    document.getElementById("workoutForm").reset();

    document.getElementById("workoutId").value="";

    loadWorkouts();

}

async function editWorkout(id){

    const response=await fetch("/api/workouts/"+id);

    const data=await response.json();

    const w=data.workout;

    document.getElementById("workoutId").value=w._id;

    document.getElementById("date").value=w.date.substring(0,10);

    document.getElementById("duration").value=w.duration;

    document.getElementById("notes").value=w.notes;

}

async function deleteWorkout(id){

    if(!confirm("Delete workout?")) return;

    await fetch("/api/workouts/"+id,{

        method:"DELETE"

    });

    loadWorkouts();

}