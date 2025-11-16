// ===== localStorage utilities =====
const STORAGE_KEYS = {
    CART: 'bec_cart',
    COURSES: 'bec_courses'
};

function saveCartToStorage(cartMap) {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartMap));
}

function loadCartFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEYS.CART);
    return stored ? JSON.parse(stored) : {};
}

function saveCoursesToStorage(courses) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
}

function loadCoursesFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
    return stored ? JSON.parse(stored) : null;
}

function clearStorage() {
    localStorage.removeItem(STORAGE_KEYS.CART);
    localStorage.removeItem(STORAGE_KEYS.COURSES);
}

// ===== Vue 2 application =====
new Vue({
    el: '#app',
    data() {
        return {
            // expanded course list to meet module requirement (>=10 lessons)
            courses: [
                { id: 'c1', title: 'Python for Beginners', topic: 'Python', location: 'Hendon', category: 'programming', price: 24.99, instructor: 'A. Smith', rating: 4.7, spaces: 5 },
                { id: 'c2', title: 'Web Development Bootcamp', topic: 'Web', location: 'Colindale', category: 'programming', price: 39.99, instructor: 'B. Lee', rating: 4.8, spaces: 6 },
                { id: 'c3', title: 'Data Science with Python', topic: 'Data', location: 'Brent Cross', category: 'data', price: 49.99, instructor: 'C. Zhao', rating: 4.9, spaces: 4 },
                { id: 'c4', title: 'UI/UX Design Fundamentals', topic: 'Design', location: 'Golders Green', category: 'design', price: 19.99, instructor: 'D. Kumar', rating: 4.5, spaces: 7 },
                { id: 'c5', title: 'Intro to Machine Learning', topic: 'ML', location: 'Hendon', category: 'data', price: 59.99, instructor: 'E. Gomez', rating: 4.8, spaces: 3 },
                { id: 'c6', title: 'Business Analytics', topic: 'Business', location: 'Colindale', category: 'business', price: 29.99, instructor: 'F. Rossi', rating: 4.6, spaces: 8 },
                { id: 'c7', title: 'Advanced JavaScript', topic: 'JavaScript', location: 'Brent Cross', category: 'programming', price: 34.99, instructor: 'G. Patel', rating: 4.6, spaces: 5 },
                { id: 'c8', title: 'Databases with MongoDB', topic: 'Databases', location: 'Golders Green', category: 'data', price: 44.99, instructor: 'H. Wang', rating: 4.7, spaces: 6 },
                { id: 'c9', title: 'Responsive Web Design', topic: 'Design', location: 'Hendon', category: 'design', price: 22.99, instructor: 'I. Murphy', rating: 4.5, spaces: 9 },
                { id: 'c10', title: 'DevOps Essentials', topic: 'DevOps', location: 'Colindale', category: 'business', price: 49.99, instructor: 'J. Nasser', rating: 4.4, spaces: 4 }
            ],
            filters: {
                query: '',
                category: 'all',
                sort: 'popular'
            },
            cartMap: {}, // {id: {course, qty}}
            cartOpen: false
            ,
            // checkout fields
            checkoutName: '',
            checkoutPhone: ''
        }
    },
    computed: {
        filteredCourses() {
            const q = this.filters.query && this.filters.query.toLowerCase();
            let list = this.courses.filter(c => {
                const matchesQ = !q || c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
                const matchesCat = this.filters.category === 'all' || c.category === this.filters.category;
                return matchesQ && matchesCat;
            });
            if (this.filters.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
            if (this.filters.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
            if (this.filters.sort === 'newest') list = list.slice().reverse();
            return list;
        },
        cartEntries() {
            return Object.values(this.cartMap);
        },
        cartTotal() {
            return this.cartEntries.reduce((s, e) => s + e.course.price * e.qty, 0);
        },
        cartCount() {
            return this.cartEntries.reduce((s, e) => s + e.qty, 0);
        }
        ,
        validName() {
            return /^[A-Za-z\s]+$/.test(this.checkoutName.trim());
        },
        validPhone() {
            return /^\d+$/.test(this.checkoutPhone.trim());
        },
        canCheckout() {
            return this.validName && this.validPhone && this.cartCount > 0;
        }
    },
    watch: {
        cartCount(n) {
            // update header cart count
            const el = document.getElementById('cart-count');
            if (el) el.textContent = n;
            // enable/disable header cart button when cart is empty
            const cartBtn = document.getElementById('cart-btn');
            if (cartBtn) cartBtn.disabled = n === 0;
        }
    },
    methods: {
        addToCart(course) {
            // only add if there are spaces left
            if (course.spaces <= 0) return;
            const id = course.id;
            // decrement available spaces
            course.spaces -= 1;
            if (this.cartMap[id]) this.cartMap[id].qty += 1;
            else this.$set(this.cartMap, id, { course, qty: 1 });
            this.cartOpen = true;
        },
        changeQty(courseId, delta) {
            const entry = this.cartMap[courseId];
            if (!entry) return;
            // if decreasing, restore spaces to the course
            if (delta < 0) {
                entry.qty += delta;
                entry.course.spaces += 1; // restore one space
                if (entry.qty <= 0) this.$delete(this.cartMap, courseId);
            } else {
                // increasing qty: only if spaces available
                if (entry.course.spaces <= 0) return;
                entry.qty += delta;
                entry.course.spaces -= 1;
            }
        },
        checkout() {
            if (!this.canCheckout) {
                alert('Please provide a valid Name (letters only) and Phone (numbers only).');
                return;
            }
            const total = this.cartTotal.toFixed(2);
            // For prototype: show confirmation and clear cart (spaces already reduced when added)
            alert(`Order submitted. Thank you ${this.checkoutName.trim()}! Total: $${total}`);
            // clear cart
            this.cartMap = {};
            this.checkoutName = '';
            this.checkoutPhone = '';
            this.cartOpen = false;
        }
    },
    mounted() {
        // wire up header search input to filters.query
        const search = document.getElementById('search');
        if (search) {
            search.addEventListener('input', (e) => { this.filters.query = e.target.value; });
        }
        // initialize cart count element
        const el = document.getElementById('cart-count');
        if (el) el.textContent = this.cartCount;
        // wire up header cart button (header is outside #app so we attach manually)
        const cartBtn = document.getElementById('cart-btn');
        if (cartBtn) {
            // toggle cart view on each click
            cartBtn.addEventListener('click', () => { this.cartOpen = !this.cartOpen; });
            // initial disabled state when cart empty
            cartBtn.disabled = this.cartCount === 0;
        }
    }
});
