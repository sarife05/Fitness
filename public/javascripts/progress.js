document.addEventListener("DOMContentLoaded",()=>{

    loadProgress();

    document
        .getElementById("progressForm")
        .addEventListener("submit",saveProgress);

});

async function loadProgress(){

    const res=await fetch("/api/progress");

    const data=await res.json();

    const table=document.getElementById("progressTable");

    table.innerHTML="";

    data.entries.forEach(p=>{

        table.innerHTML+=`

<tr>

<td>${new Date(p.date).toLocaleDateString()}</td>

<td>${p.bodyWeight}</td>

<td>${p.target??""}</td>

<td>${p.notes??""}</td>

<td>

<button onclick="editProgress('${p._id}')">

Edit

</button>

<button onclick="deleteProgress('${p._id}')">

Delete

</button>

</td>

</tr>

`;

    });

}

async function saveProgress(e){

    e.preventDefault();

    const id=document.getElementById("progressId").value;

    const body={

        date:document.getElementById("date").value,

        bodyWeight:Number(document.getElementById("bodyWeight").value),

        target:Number(document.getElementById("target").value)||undefined,

        notes:document.getElementById("notes").value

    };

    if(id){

        await fetch("/api/progress/"+id,{

            method:"PUT",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(body)

        });

    }else{

        await fetch("/api/progress",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(body)

        });

    }

    document.getElementById("progressForm").reset();

    document.getElementById("progressId").value="";

    loadProgress();

}

async function editProgress(id){

    const res=await fetch("/api/progress/"+id);

    const data=await res.json();

    const p=data.entry;

    document.getElementById("progressId").value=p._id;

    document.getElementById("date").value=p.date.substring(0,10);

    document.getElementById("bodyWeight").value=p.bodyWeight;

    document.getElementById("target").value=p.target??"";

    document.getElementById("notes").value=p.notes??"";

}

async function deleteProgress(id){

    if(!confirm("Delete progress?")) return;

    await fetch("/api/progress/"+id,{
        method:"DELETE"
    });

    loadProgress();

}