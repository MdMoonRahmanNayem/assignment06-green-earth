// API endpoints
const API = {
  allPlants: 'https://openapi.programming-hero.com/api/plants',
  categories: 'https://openapi.programming-hero.com/api/categories',
  byCategory: (id) => `https://openapi.programming-hero.com/api/category/${id}`,
  plant: (id) => `https://openapi.programming-hero.com/api/plant/${id}`,
};

// State
const state = {
  categories: [],
  activeCategoryId: null, // null => All Trees
  cart: [],
};

// DOM
const categoryList = document.getElementById('categoryList');
const cardsGrid = document.getElementById('cardsGrid');
const spinner = document.getElementById('spinner');
const emptyState = document.getElementById('emptyState');
const cartList = document.getElementById('cartList');
const cartTotal = document.getElementById('cartTotal');

// Modal
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const modalImg = document.getElementById('modalImg');
const modalDesc = document.getElementById('modalDesc');
const modalCategory = document.getElementById('modalCategory');
const modalPrice = document.getElementById('modalPrice');

const showSpinner = (show = true) => spinner.classList.toggle('hidden', !show);
const taka = (n) => `৳${Number(n || 0)}`;

// Init
init();
async function init() {
  await loadCategories();   // /api/categories
  await loadTrees(null);    // /api/plants  (default)
}

// Load categories
async function loadCategories() {
  try {
    const res = await fetch(API.categories);
    const data = await res.json();
    state.categories = data?.categories || [];
    renderCategories(); // Active stays null => "All Trees"
  } catch (e) {
    categoryList.innerHTML = `<div class="text-red-600 text-sm">Failed to load categories.</div>`;
  }
}

// Render category buttons
function renderCategories() {
  categoryList.innerHTML = '';

  // All Trees
  const allBtn = document.createElement('button');
  allBtn.className = catBtnClass(state.activeCategoryId === null);
  allBtn.textContent = 'All Trees';
  allBtn.onclick = () => setActiveCategory(null);
  categoryList.appendChild(allBtn);

  // Real categories
  state.categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = catBtnClass(state.activeCategoryId === cat.id);
    btn.textContent = cat.category;
    btn.onclick = () => setActiveCategory(cat.id);
    categoryList.appendChild(btn);
  });
}

function catBtnClass(active) {
  return `w-full text-left rounded-lg px-4 py-2 transition
          ${active ? 'bg-[#15803D] text-white' : 'bg-gray-100 hover:bg-gray-200'}`;
}

async function setActiveCategory(id) {
  state.activeCategoryId = id;
  renderCategories();
  await loadTrees(id); // /api/category/{id} OR /api/plants
}

// Load trees
async function loadTrees(categoryId) {
  showSpinner(true);
  emptyState.classList.add('hidden');
  cardsGrid.innerHTML = '';

  try {
    const url = categoryId ? API.byCategory(categoryId) : API.allPlants;
    const res = await fetch(url);
    const data = await res.json();

    const plants = data?.data || data?.plants || data?.category || [];
    renderCards(plants);
  } catch (e) {
    cardsGrid.innerHTML = `<div class="col-span-full text-red-600">Failed to load trees.</div>`;
  } finally {
    showSpinner(false);
  }
}

// Render cards
function renderCards(plants) {
  cardsGrid.innerHTML = '';
  if (!plants || !plants.length) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  plants.forEach((p) => {
    const { id, name, image, description, category, price } = normalizePlant(p);

    const card = document.createElement('article');
    card.className = 'rounded-2xl bg-white shadow-sm p-4';

    card.innerHTML = `
      <div class="h-36 w-full rounded-xl bg-gray-100 overflow-hidden mb-3">
        <img src="${image || ''}" alt="${name}" class="w-full h-full object-cover">
      </div>
      <h3 class="font-semibold text-sm cursor-pointer hover:underline text-gray-900" data-id="${id}">${name}</h3>
      <p class="text-xs text-gray-500 mt-1 line-clamp-2">${description || ''}</p>

      <div class="flex items-center justify-between mt-3">
        <span class="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">${category || 'Tree'}</span>
        <span class="text-sm font-semibold">${taka(price)}</span>
      </div>

      <button class="w-full mt-3 px-4 py-2 rounded-xl bg-[#15803D] text-white hover:bg-[#136f34]">
        Add to Cart
      </button>
    `;

    // name → modal (/api/plant/{id})
    card.querySelector('[data-id]').addEventListener('click', () => openModal(id));
    // add to cart
    card.querySelector('button').addEventListener('click', () => addToCart({ id, name, price }));

    cardsGrid.appendChild(card);
  });
}

// Normalize plant object
function normalizePlant(p) {
  return {
    id: p.id || p.plantId || p._id || p?.plant_id || String(p?.name || Math.random()),
    name: p.name || p.title || 'Unknown Tree',
    image: p.image || p.img || '',
    description: p.description || p.desc || '',
    category: p.category || p.type || '',
    price: Number(p.price || 0),
  };
}

// Modal
async function openModal(id) {
  try {
    const res = await fetch(API.plant(id)); // /api/plant/{id}
    const data = await res.json();
    const p = normalizePlant(data?.plant || data?.data || {});
    modalTitle.textContent = p.name;
    modalImg.src = p.image || '';
    modalDesc.textContent = p.description || 'No description.';
    modalCategory.textContent = p.category || 'Tree';
    modalPrice.textContent = taka(p.price);
  } catch {
    modalTitle.textContent = 'Tree Details';
    modalImg.src = '';
    modalDesc.textContent = 'Failed to load details.';
    modalCategory.textContent = '';
    modalPrice.textContent = '';
  }
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
function closeModal() {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// Cart
function addToCart(item) {
  state.cart.push(item);
  renderCart();
}
function removeFromCart(index) {
  state.cart.splice(index, 1);
  renderCart();
}
function renderCart() {
  cartList.innerHTML = '';
  let total = 0;

  state.cart.forEach((it, idx) => {
    total += Number(it.price || 0);
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between rounded-xl bg-[#F1FAF3] px-3 py-2';
    li.innerHTML = `
      <div class="text-sm">
        <div class="font-medium">${it.name}</div>
        <div class="text-xs text-gray-500">${taka(it.price)} × 1</div>
      </div>
      <button class="w-6 h-6 grid place-items-center rounded-full bg-red-100 text-red-600 hover:bg-red-200">✕</button>
    `;
    li.querySelector('button').addEventListener('click', () => removeFromCart(idx));
    cartList.appendChild(li);
  });

  cartTotal.textContent = taka(total);
}
