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

// Initial render
document.addEventListener("DOMContentLoaded", renderTasks);

// Timetable generation

timetableBtn.onclick = () => {
  timetableDiv.classList.remove("hidden");
  timetableTable.innerHTML = "";

  // days header
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  let header = "<tr><th>Time</th>" + days.map(d => `<th>${d}</th>`).join("") + "</tr>";
  timetableTable.insertAdjacentHTML("beforeend", header);

  // rows for 24h
  for (let h = 0; h < 24; h++) {
    let slot = ("0" + h).slice(-2) + ":00";
    let row = `<tr><td>${slot}</td>`;
    days.forEach(day => {
      let cellTask = tasks.find(t => {
        if (!t.date) return false;
        let d = new Date(t.date);
        let dayName = d.toLocaleDateString("en-US", { weekday: "long" });
        let hr = ("0" + d.getHours()).slice(-2) + ":00";
        return dayName === day && hr === slot;
      });
      row += `<td>${cellTask ? cellTask.text : ""}</td>`;
    });
    row += "</tr>";
    timetableTable.insertAdjacentHTML("beforeend", row);
  }
};

//  Save timetable as image
saveImageBtn.onclick = () => {
  html2canvas(timetableDiv).then(canvas => {
    let link = document.createElement("a");
    link.download = "timetable.png";
    link.href = canvas.toDataURL();
    link.click();
  });
};

//  Copy timetable image to clipboard
copyImageBtn.onclick = async () => {
  try {
    const canvas = await html2canvas(timetableDiv);
    const blob = await new Promise(res => canvas.toBlob(res));
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    alert("📋 Timetable copied to clipboard!");
  } catch (e) {
    console.error(e);
    alert("Copy failed. Please try saving instead.");
  }
};
