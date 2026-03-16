// ─── DOM References ──────────────────────────────────
const taskInput = document.getElementById('taskInput');
const addBtn    = document.getElementById('addBtn');
const taskList  = document.getElementById('taskList');
const emptyMsg  = document.getElementById('emptyMsg');

// ─── Load tasks from localStorage on page load ───────
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
tasks.forEach(task => renderTask(task));
updateEmptyMsg();

// ─── Add Task ─────────────────────────────────────────
addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const task = {
    id: Date.now(),
    text,
    done: false,
  };

  tasks.push(task);
  saveTasks();
  renderTask(task);
  updateEmptyMsg();

  taskInput.value = '';
  taskInput.focus();
}

// ─── Render a Single Task Item ────────────────────────
function renderTask(task) {
  const li = document.createElement('li');
  li.classList.add('task-item');
  li.dataset.id = task.id;
  if (task.done) li.classList.add('done');

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.done;
  checkbox.addEventListener('change', () => toggleDone(task.id, li));

  // Task text span
  const span = document.createElement('span');
  span.classList.add('task-text');
  span.textContent = task.text;

  // Edit button
  const editBtn = document.createElement('button');
  editBtn.classList.add('btn-edit');
  editBtn.title = 'Edit task';
  editBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>`;
  editBtn.addEventListener('click', () => startEdit(task.id, li, span));

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('btn-delete');
  deleteBtn.title = 'Delete task';
  deleteBtn.innerHTML = `
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>`;
  deleteBtn.addEventListener('click', () => deleteTask(task.id, li));

  li.append(checkbox, span, editBtn, deleteBtn);
  taskList.appendChild(li);
}

// ─── Toggle Done ──────────────────────────────────────
function toggleDone(id, li) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  li.classList.toggle('done', task.done);
  saveTasks();
}

// ─── Inline Edit ──────────────────────────────────────
function startEdit(id, li, span) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.classList.add('task-edit-input');
  input.value = task.text;

  li.replaceChild(input, span);
  input.focus();

  function saveEdit() {
    const newText = input.value.trim();
    if (newText) {
      task.text = newText;
      span.textContent = newText;
      saveTasks();
    }
    li.replaceChild(span, input);
  }

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') {
      input.value = task.text; // revert
      input.blur();
    }
  });
}

// ─── Delete Task ──────────────────────────────────────
function deleteTask(id, li) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();

  // Fade out then remove
  li.style.transition = 'opacity 0.2s, transform 0.2s';
  li.style.opacity    = '0';
  li.style.transform  = 'translateX(10px)';
  setTimeout(() => {
    li.remove();
    updateEmptyMsg();
  }, 200);
}

// ─── Helpers ──────────────────────────────────────────
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateEmptyMsg() {
  emptyMsg.style.display = tasks.length === 0 ? 'block' : 'none';
}