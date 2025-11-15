// Sample courses data
const COURSES = [
    { id: 'c1', title: 'Python for Beginners', category: 'programming', price: 24.99, instructor: 'A. Smith', rating: 4.7 },
    { id: 'c2', title: 'Web Development Bootcamp', category: 'programming', price: 39.99, instructor: 'B. Lee', rating: 4.8 },
    { id: 'c3', title: 'Data Science with Python', category: 'data', price: 49.99, instructor: 'C. Zhao', rating: 4.9 },
    { id: 'c4', title: 'UI/UX Design Fundamentals', category: 'design', price: 19.99, instructor: 'D. Kumar', rating: 4.5 },
    { id: 'c5', title: 'Intro to Machine Learning', category: 'data', price: 59.99, instructor: 'E. Gomez', rating: 4.8 },
    { id: 'c6', title: 'Business Analytics', category: 'business', price: 29.99, instructor: 'F. Rossi', rating: 4.6 }
];

// Simple in-memory cart
const cart = new Map();

function fmt(n) { return Number(n).toFixed(2) }

function renderCourses(list) {
    const el = document.getElementById('courses');
    el.innerHTML = '';
    list.forEach(c => {
        const card = document.createElement('article');
        card.className = 'course-card';
        card.innerHTML = `
      <div class="course-media">${c.title.split(' ')[0]}</div>
      <div class="course-body">
        <div class="course-title">${c.title}</div>
        <div class="course-meta">${c.instructor} • ${c.category} • ⭐ ${c.rating}</div>
        <div class="course-actions">
          <div class="price">$${fmt(c.price)}</div>
          <div>
            <button class="add-btn" data-id="${c.id}">Add to cart</button>
          </div>
        </div>
      </div>
    `;
        el.appendChild(card);
    });
}

function updateCartCount() {
    const count = Array.from(cart.values()).reduce((s, v) => s + v.qty, 0);
    document.getElementById('cart-count').textContent = count;
}

function openCart(open = true) {
    const cartEl = document.getElementById('cart');
    if (open) {
        cartEl.classList.add('open');
        cartEl.setAttribute('aria-hidden', 'false');
    } else {
        cartEl.classList.remove('open');
        cartEl.setAttribute('aria-hidden', 'true');
    }
}

function renderCart() {
    const itemsEl = document.getElementById('cart-items');
    itemsEl.innerHTML = '';
    let total = 0;
    cart.forEach((entry, id) => {
        total += entry.qty * entry.course.price;
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.innerHTML = `
      <div>
        <div style="font-weight:600">${entry.course.title}</div>
        <div style="font-size:.9rem;color:#6b7280">${entry.course.instructor}</div>
      </div>
      <div style="text-align:right">
        <div>$${fmt(entry.course.price)}</div>
        <div style="font-size:.9rem;margin-top:6px">
          <button data-id="${id}" class="qty-decrease">-</button>
          <span style="padding:0 8px">${entry.qty}</span>
          <button data-id="${id}" class="qty-increase">+</button>
        </div>
      </div>
    `;
        itemsEl.appendChild(row);
    });
    document.getElementById('cart-total').textContent = fmt(total);
    updateCartCount();
}

function addToCart(courseId) {
    const course = COURSES.find(c => c.id === courseId);
    if (!course) return;
    const existing = cart.get(courseId);
    if (existing) { existing.qty += 1; }
    else { cart.set(courseId, { course, qty: 1 }); }
    renderCart();
    openCart(true);
}

function changeQty(courseId, delta) {
    const entry = cart.get(courseId);
    if (!entry) return;
    entry.qty += delta;
    if (entry.qty <= 0) cart.delete(courseId);
    renderCart();
}

// Search + Filters
function applyFilters() {
    const q = document.getElementById('search').value.toLowerCase();
    const cat = document.getElementById('category-filter').value;
    const sort = document.getElementById('sort-filter').value;
    let list = COURSES.filter(c => {
        const matchesQ = q === '' || c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
        const matchesCat = cat === 'all' || c.category === cat;
        return matchesQ && matchesCat;
    });
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'newest') list = list.reverse();
    renderCourses(list);
}

// Event wiring
document.addEventListener('click', (e) => {
    if (e.target.matches('.add-btn')) addToCart(e.target.dataset.id);
    if (e.target.matches('#cart-btn')) openCart(true);
    if (e.target.matches('#close-cart')) openCart(false);
    if (e.target.matches('.qty-increase')) changeQty(e.target.dataset.id, 1);
    if (e.target.matches('.qty-decrease')) changeQty(e.target.dataset.id, -1);
    if (e.target.matches('#checkout-btn')) alert('Checkout not implemented in this prototype');
});

document.getElementById('search').addEventListener('input', applyFilters);
document.getElementById('category-filter').addEventListener('change', applyFilters);
document.getElementById('sort-filter').addEventListener('change', applyFilters);

// Initial render
renderCourses(COURSES);
renderCart();
