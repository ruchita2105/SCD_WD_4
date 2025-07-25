// ======================
// Load tasks from storage
// ======================
let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
let editIndex = null;
let deleteIndex = null;

// ======================
// DOM References
// ======================
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const categoryInput = document.getElementById("categoryInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
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

// ======================
// Save and Render
// ======================
function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function render() {
  taskList.innerHTML = "";
  const searchVal = searchInput.value.toLowerCase();
  const catVal = filterSelect.value;

  tasks.forEach((t, i) => {
    if (!t.text.toLowerCase().includes(searchVal)) return;
    if (catVal !== "All" && t.cat !== catVal) return;

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

    li.querySelector(".complete").onclick = () => {
      tasks[i].done = !tasks[i].done;
      save();
      render();
    };
    li.querySelector(".edit").onclick = () => {
      editIndex = i;
      editInput.value = tasks[i].text;
      editModal.style.display = "flex";
    };
    li.querySelector(".delete").onclick = () => {
      deleteIndex = i;
      deleteModal.style.display = "flex";
    };

    li.draggable = true;
    li.addEventListener("dragstart", e => e.dataTransfer.setData("text/plain", i));
    li.addEventListener("dragover", e => e.preventDefault());
    li.addEventListener("drop", e => {
      e.preventDefault();
      const from = +e.dataTransfer.getData("text/plain");
      const moved = tasks.splice(from, 1)[0];
      tasks.splice(i, 0, moved);
      save();
      render();
    });

    taskList.appendChild(li);
  });

  const doneCount = tasks.filter(t => t.done).length;
  progressText.textContent = `${doneCount} of ${tasks.length} completed`;
  progressFill.style.width = tasks.length ? (doneCount / tasks.length) * 100 + "%" : "0%";
  if (tasks.length && doneCount === tasks.length) triggerConfetti();
}

// ======================
// Add Task
// ======================
addBtn.onclick = () => {
  const txt = taskInput.value.trim();
  if (!txt) {
    alert("Enter a task!");
    return;
  }
  tasks.push({
    text: txt,
    date: taskDate.value,
    cat: categoryInput.value,
    done: false
  });
  taskInput.value = "";
  taskDate.value = "";
  save();
  render();
};

// ======================
// Modals
// ======================
saveEdit.onclick = () => {
  if (editIndex !== null) {
    tasks[editIndex].text = editInput.value.trim();
    save();
    render();
  }
  editModal.style.display = "none";
};
cancelEdit.onclick = () => editModal.style.display = "none";

confirmDelete.onclick = () => {
  if (deleteIndex !== null) {
    tasks.splice(deleteIndex, 1);
    save();
    render();
  }
  deleteModal.style.display = "none";
};
cancelDelete.onclick = () => deleteModal.style.display = "none";

// ======================
// Filter and Search
// ======================
searchInput.oninput = render;
filterSelect.onchange = render;

// ======================
// Dark Mode
// ======================
themeSwitch.onchange = () => {
  document.body.classList.toggle("dark", themeSwitch.checked);
};

// ======================
// Confetti Animation
// ======================
function triggerConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";
  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    r: Math.random() * 6 + 2,
    dx: Math.random() * 2 - 1,
    dy: Math.random() * 2 + 1,
    color: `hsl(${Math.random() * 360},70%,60%)`
  }));
  let frame = 0;
  (function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }
    });
    if (frame < 120) requestAnimationFrame(animate);
    else canvas.style.display = "none";
  })();
}

// ======================
// Timetable Generator
// ======================
timetableBtn.onclick = () => {
  timetableDiv.classList.remove("hidden");
  timetableTable.innerHTML = "";

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  let header = `<tr><th>Time</th>${days.map(d => `<th>${d}</th>`).join("")}</tr>`;
  timetableTable.insertAdjacentHTML("beforeend", header);

  for (let h = 0; h < 24; h++) {
    let slot = ("0" + h).slice(-2) + ":00";
    let row = `<tr><td>${slot}</td>`;
    days.forEach(day => {
      let match = tasks.find(t => {
        if (!t.date) return false;
        let d = new Date(t.date);
        let dayName = d.toLocaleDateString("en-US", { weekday: "long" });
        let hr = ("0" + d.getHours()).slice(-2) + ":00";
        return dayName === day && hr === slot;
      });
      row += `<td>${match ? match.text : ""}</td>`;
    });
    row += "</tr>";
    timetableTable.insertAdjacentHTML("beforeend", row);
  }
};

// ======================
// Save as Image
// ======================
saveImageBtn.onclick = () => {
  html2canvas(timetableDiv).then(canvas => {
    const link = document.createElement("a");
    link.download = "timetable.png";
    link.href = canvas.toDataURL();
    link.click();
  });
};

// ======================
// Copy to Clipboard
// ======================
copyImageBtn.onclick = async () => {
  try {
    const canvas = await html2canvas(timetableDiv);
    const blob = await new Promise(res => canvas.toBlob(res));
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    alert("📋 Timetable copied to clipboard!");
  } catch (e) {
    console.error(e);
    alert("Copy failed, try saving instead.");
  }
};

// ======================
// Initial Render
// ======================
document.addEventListener("DOMContentLoaded", render);
