/* -------------------------
   CONFIG & STATE
   ------------------------- */
const API_BASE = 'https://dummyjson.com';
let pageLimit = 12;          // number of products to fetch
let currentProducts = [];    // cache of last fetched products (for client-side filtering)
let currentCategory = '';
let currentQuery = '';

/* -------------------------
   DOM Refs
   ------------------------- */
const container = document.getElementById('mainShopContainer');
const loader = document.getElementById('loader');
const viewAllBtn = document.getElementById('viewAllBox');
const categorySelect = document.getElementById('categorySelect');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearFiltersBtn = document.getElementById('clearFilters');

/* -------------------------
   UTIL: create product card (links to product.html?id=)
   ------------------------- */
function createProductCard({ id, title, price, thumbnail, discountPercentage = 0, stock = 0, rating }) {
    // rating stars – simple text or icon count
    const saleTag = discountPercentage > 0 ? 'SALE' : '';
    const shortTitle = title.length > 60 ? title.slice(0, 57) + '...' : title;
    const query = new URLSearchParams({ id }).toString();

    return `
      <a href="product.html?${query}" class="block">
        <div class="product-card bg-white rounded-lg overflow-hidden shadow-md border border-gray-100 h-full flex flex-col">
          <div class="relative">
            <img src="${thumbnail}" alt="${escapeHtml(title)}" class="w-full h-48 object-cover">
            ${saleTag ? `<div class="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">${saleTag}</div>` : ''}
          </div>
          <div class="p-4 flex-1 flex flex-col">
            <h3 class="font-bold text-lg mb-1 truncate-2">${escapeHtml(shortTitle)}</h3>
            <div class="flex items-center mb-2">
              <div class="flex text-yellow-400">
                ${renderStars(Math.round(rating))}
              </div>
              <span class="text-gray-600 text-sm ml-2">(${stock} in stock)</span>
            </div>
            <div class="mt-auto flex items-center justify-between">
              <div>
                <span class="text-indigo-600 font-bold ml-2">$${price}</span>
              </div>
              <div class="text-sm text-gray-500">Rating ${rating}</div>
            </div>
          </div>
        </div>
      </a>
    `;
}

/* small helpers */
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
}
function renderStars(n){
    let out = '';
    for(let i=0;i<5;i++){
        out += i < n ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
    }
    return out;
}

/* -------------------------
   API: fetch categories & products
   ------------------------- */
async function fetchCategories() {
    try {
        const res = await fetch(`${API_BASE}/products/categories`);
        const cats = await res.json();
        // populate select
        categorySelect.innerHTML = `<option value="">All Categories</option>` + cats.map(c => `<option value="${c}">${capitalize(c)}</option>`).join('');
    } catch (e) {
        console.error('Failed to fetch categories', e);
    }
}

async function fetchProducts({ limit = pageLimit, category = '', q = '' } = {}) {
    // show loader
    loader.style.display = 'flex';
    container.innerHTML = '';

    try {
        let url = '';
        if (q) {
            // search endpoint
            url = `${API_BASE}/products/search?q=${encodeURIComponent(q)}&limit=${limit}`;
        } else if (category) {
            url = `${API_BASE}/products/category/${encodeURIComponent(category)}?limit=${limit}`;
        } else {
            url = `${API_BASE}/products?limit=${limit}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        // DummyJSON returns {products: [...] } for /products and /category, and {products: [...], total, ...} for search
        const products = data.products || [];
        currentProducts = products;
        renderProducts(products);
    } catch (err) {
        console.error('Fetch products failed', err);
        container.innerHTML = `<div class="col-span-full text-center text-red-500">Failed to load products.</div>`;
    } finally {
        loader.style.display = 'none';
    }
}

/* -------------------------
   Render
   ------------------------- */
function renderProducts(products) {
    if (!products || products.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center text-gray-600">No products found.</div>`;
        return;
    }
    let html = '';
    products.forEach(p => {
        html += createProductCard(p);
    });
    container.innerHTML = html;
}

/* -------------------------
   Actions / Events
   ------------------------- */
viewAllBtn.addEventListener('click', async () => {
    // increase pageLimit and fetch
    pageLimit += 12;
    await fetchProducts({ limit: pageLimit, category: currentCategory, q: currentQuery });
});

searchBtn.addEventListener('click', () => {
    const q = searchInput.value.trim();
    currentQuery = q;
    fetchProducts({ limit: pageLimit, q, category: currentCategory });
});
searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchBtn.click(); });

categorySelect.addEventListener('change', () => {
    currentCategory = categorySelect.value;
    // reset search query when category chosen? We'll keep both applying.
    fetchProducts({ limit: pageLimit, category: currentCategory, q: currentQuery });
});

clearFiltersBtn.addEventListener('click', () => {
    searchInput.value = '';
    categorySelect.value = '';
    currentQuery = '';
    currentCategory = '';
    pageLimit = 12;
    fetchProducts({ limit: pageLimit });
});

/* tiny helper */
function capitalize(s){ return s && s[0].toUpperCase() + s.slice(1); }

/* -------------------------
   Init
   ------------------------- */
(async function init(){
    await fetchCategories();
    await fetchProducts({ limit: pageLimit });
})();

/* -------------------------
   Mobile menu toggle (kept)
   ------------------------- */
document.getElementById('mobileMenuBtn').addEventListener('click', function() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
});


let cartItems = JSON.parse(localStorage.getItem("shop_cart")).length;
console.log(cartItems);
document.getElementById("cartCount").innerText = cartItems;
