let data = {};
let autoSaveTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  render();
  setupEvents();
});

async function loadData() {
  const res = await fetch('/data');
  data = await res.json();
}

function render() {
  document.body.className = data.theme || 'light';
  if (data.backgroundImage) {
    document.body.style.backgroundImage = `url(${data.backgroundImage})`;
  }

  const title = document.getElementById('title');
  title.textContent = data.title || 'Мои избранные';

  const grid = document.getElementById('circle-grid');
  grid.innerHTML = '';
  data.items.forEach((item, i) => {
    const circle = document.createElement('div');
    circle.classList.add('circle');

    if (item.img) {
      circle.innerHTML = `<a href="\${item.link}" target="_blank"><img src="\${item.img}" /></a>`;
    } else {
      circle.innerHTML = `<div class="plus">+</div>`;
      circle.onclick = () => addItem(i);
    }

    grid.appendChild(circle);
  });

  data.items.push({ img: null, link: "" });
}

function setupEvents() {
  document.getElementById('title').addEventListener('input', () => {
    data.title = document.getElementById('title').innerText;
    triggerSave();
  });

  document.getElementById('bg-upload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      document.body.style.backgroundImage = `url(\${reader.result})`;
      data.backgroundImage = reader.result;
      triggerSave();
    };
    reader.readAsDataURL(file);
  });
}

function setTheme(theme) {
  data.theme = theme;
  document.body.className = theme;
  triggerSave();
}

function addItem(index) {
  const link = prompt('Введите ссылку:');
  if (!link) return;

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.onchange = async () => {
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    const res = await fetch('/upload', { method: 'POST', body: formData });
    const result = await res.json();
    data.items[index] = { img: result.imgPath, link };
    triggerSave(true);
  };
  fileInput.click();
}

function triggerSave(immediate = false) {
  if (immediate) return save();

  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => save(), 1000);
}

function save() {
  fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  render();
}