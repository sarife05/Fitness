const API="/api/exercises";

const table=document.getElementById("exerciseTable");
const form=document.getElementById("exerciseForm");

load();

async function load(){

    const response=await fetch(API);

    const data=await response.json();

    table.innerHTML="";

    data.exercises.forEach(ex=>{

        table.innerHTML+=`
        <tr>

        <td>${ex.name}</td>

        <td>${ex.muscleGroup}</td>

        <td>${ex.equipment}</td>

        <td>

        <button onclick="editExercise('${ex._id}')">

        Edit

        </button>

        <button onclick="deleteExercise('${ex._id}')">

        Delete

        </button>

        </td>

        </tr>
        `;

    });

}

form.addEventListener("submit",saveExercise);

async function saveExercise(e){

    e.preventDefault();

    const id=document.getElementById("exerciseId").value;

    const body={

        name:document.getElementById("name").value,

        muscleGroup:document.getElementById("muscleGroup").value,

        equipment:document.getElementById("equipment").value

    };

    if(id){

        await fetch(API+"/"+id,{
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(body)
        });

    }else{

        await fetch(API,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify(body)
        });

    }

    form.reset();

    document.getElementById("exerciseId").value="";

    load();

}

async function editExercise(id){

    const response=await fetch(API+"/"+id);

    const data=await response.json();

    const ex=data.exercise;

    document.getElementById("exerciseId").value=ex._id;

    document.getElementById("name").value=ex.name;

    document.getElementById("muscleGroup").value=ex.muscleGroup;

    document.getElementById("equipment").value=ex.equipment;

}

async function deleteExercise(id){

    if(!confirm("Delete this exercise?")) return;

    await fetch(API+"/"+id,{
        method:"DELETE"
    });

    load();

}