// Load tasks 
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let editIndex = null;
let deleteIndex = null;

// DOM elements
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const categoryInput = document.getElementById("categoryInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const themeSwitch = document.getElementById("themeSwitch");

const editModal = document.getElementById("editModal");
const editInput = document.getElementById("editInput");
const saveEdit = document.getElementById("saveEdit");
const cancelEdit = document.getElementById("cancelEdit");

const deleteModal = document.getElementById("deleteModal");
const confirmDelete = document.getElementById("confirmDelete");
const cancelDelete = document.getElementById("cancelDelete");

const timetableBtn = document.getElementById("generateTimetable");
const timetableDiv = document.getElementById("timetable");
const timetableTable = document.getElementById("timetableTable");
const saveImageBtn = document.getElementById("saveImage");
const copyImageBtn = document.getElementById("copyImage");

// Save to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render tasks
function renderTasks() {
  taskList.innerHTML = "";
// Get search value
  const searchVal = searchInput.value.toLowerCase();

  tasks.forEach((t, i) => {
    // Apply filters
    if (!t.text.toLowerCase().includes(searchVal)) return;


    const li = document.createElement("li");
    if (t.done) li.classList.add("completed");

    li.innerHTML = `
      <span>
        <strong>${t.text}</strong><br>
        <small>${t.cat}${t.date ? " – " + new Date(t.date).toLocaleString() : ""}</small>
      </span>
      <div class="actions">
        <button class="complete">✔</button>
        <button class="edit">✎</button>
        <button class="delete">🗑</button>
      </div>
    `;

    // Mark complete
    li.querySelector(".complete").onclick = () => {
      tasks[i].done = !tasks[i].done;
      saveTasks();
      renderTasks();
    };

    // Edit
    li.querySelector(".edit").onclick = () => {
      editIndex = i;
      editInput.value = tasks[i].text;
      editModal.style.display = "flex";
    };

    // Delete
    li.querySelector(".delete").onclick = () => {
      deleteIndex = i;
      deleteModal.style.display = "flex";
    };

    taskList.appendChild(li);
  });

  // Update progress
  const doneCount = tasks.filter(t => t.done).length;
  progressText.textContent = `${doneCount} of ${tasks.length} completed`;
  progressFill.style.width = tasks.length ? (doneCount / tasks.length) * 100 + "%" : "0%";
}

// Add a task
addBtn.onclick = () => {
  const text = taskInput.value.trim();
  if (!text) {
    alert("Please enter a task");
    return;
  }

  const newTask = {
    text: text,
    date: taskDate.value,
    cat: categoryInput.value,
    done: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks(); 

  // Reset fields
  taskInput.value = "";
  taskDate.value = "";
};

// Edit modal
saveEdit.onclick = () => {
  if (editIndex !== null) {
    tasks[editIndex].text = editInput.value.trim();
    saveTasks();
    renderTasks();
  }
  editModal.style.display = "none";
};
cancelEdit.onclick = () => (editModal.style.display = "none");

// Delete modal
confirmDelete.onclick = () => {
  if (deleteIndex !== null) {
    tasks.splice(deleteIndex, 1);
    saveTasks();
    renderTasks();
  }
  deleteModal.style.display = "none";
};
cancelDelete.onclick = () => (deleteModal.style.display = "none");

// Filters
searchInput.oninput = renderTasks;

// Dark mode toggle
themeSwitch.onchange = () => {
  document.body.classList.toggle("dark", themeSwitch.checked);
};

// Generate timetable
timetableBtn.onclick = () => {
  timetableBtn.onclick = () => {
  timetableDiv.classList.remove("hidden");
  timetableTable.innerHTML = "";

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  let header = `<tr><th>Time</th>${days.map(d=>`<th>${d}</th>`).join("")}</tr>`;
  timetableTable.insertAdjacentHTML("beforeend", header);

  for (let h = 0; h < 24; h++) {
    let slot = ("0"+h).slice(-2)+":00";
    let row = `<tr><td>${slot}</td>`;
    days.forEach(day => {
      const match = tasks.find(t => {
        if (!t.date) return false;
        const d = new Date(t.date);
        return d.toLocaleDateString('en-US',{weekday:'long'})===day &&("0"+d.getHours()).slice(-2)+":00" === slot;
      });
      row += `<td>${match?match.text:""}</td>`;
    });
    row += `</tr>`;
    timetableTable.insertAdjacentHTML("beforeend", row);
  }
};

saveImageBtn.onclick = () => {
  html2canvas(timetableDiv).then(canvas=>{
    let link=document.createElement('a');
    link.download="timetable.png";
    link.href=canvas.toDataURL();
    link.click();
  });
};

copyImageBtn.onclick = async () => {
  try {
    const canvas = await html2canvas(timetableDiv);
    const blob = await new Promise(res=>canvas.toBlob(res));
    await navigator.clipboard.write([new ClipboardItem({"image/png":blob})]);
    alert("Timetable copied!");
  } catch(e){alert("Copy failed.");}
};

function triggerConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";
  const parts = Array.from({length:100},()=>({
    x: Math.random()*canvas.width,
    y: Math.random()*-canvas.height,
    r: Math.random()*6+2,
    dx: Math.random()*2-1,
    dy: Math.random()*2+1,
    color:`hsl(${Math.random()*360},70%,60%)`
  }));
  let frame=0;
  (function anim(){
    frame++;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    parts.forEach(p=>{
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.color;
      ctx.fill();
      p.x+=p.dx; p.y+=p.dy;
      if(p.y>canvas.height){p.y=-10; p.x=Math.random()*canvas.width;}
    });
    if(frame<120) requestAnimationFrame(anim);
    else canvas.style.display="none";
  })();
// Initial render
document.addEventListener("DOMContentLoaded", renderTasks);
}
}
