const products = [
	{ id: 'linen-shirt', name: 'The Sunday Linen Shirt', category: 'Clothing', price: 88, detail: 'Washed linen · Oat', label: 'A NEW FAVORITE', color: 'oat', image: 'photo-1598554747436-c9293d6a588f' },
	{ id: 'market-tote', name: 'The Market Tote', category: 'Accessories', price: 54, detail: 'Recycled cotton · Tomato', label: 'GOOD THINGS INSIDE', color: 'red', image: 'photo-1590874103328-eac38a683ce7' },
	{ id: 'everyday-knit', name: 'The Everyday Knit', category: 'Clothing', price: 124, detail: 'Organic cotton · Moss', label: 'MADE TO KEEP', color: 'green', image: 'photo-1576566588028-4147f3842f27' },
	{ id: 'sculpted-vase', name: 'Sculpted Form Vase', category: 'Objects', price: 68, detail: 'Hand-finished stoneware', label: 'SMALL BATCH', color: 'blue', image: 'photo-1578500494198-246f612d3b3d' },
	{ id: 'weekend-trouser', name: 'The Weekend Trouser', category: 'Clothing', price: 112, detail: 'Soft twill · Olive', label: '', color: 'olive', image: 'photo-1506629905607-d9a4dc8c581b' },
	{ id: 'little-hoops', name: 'Little Gold Hoops', category: 'Accessories', price: 72, detail: 'Recycled sterling silver · 18k gold plate', label: 'EVERYDAY GOLD', color: 'gold', image: 'photo-1535632066927-ab7c9ab60908' },
	{ id: 'soft-throw', name: 'The Soft Landing Throw', category: 'Objects', price: 138, detail: 'Recycled cotton · Rust', label: '', color: 'rust', image: 'photo-1600210492486-724fe5c67fb0' },
	{ id: 'canvas-sneaker', name: 'The Go-Anywhere Sneaker', category: 'Accessories', price: 96, detail: 'Organic canvas · Chalk', label: 'BESTSELLER', color: 'chalk', image: 'photo-1525966222134-fcfa99b8ae77' }
].map((product) => ({ ...product, imageUrl: `https://images.unsplash.com/${product.image}?auto=format&fit=crop&w=720&q=82` }));

const state = { category: 'All', query: '', cart: [], favorites: new Set(), toastTimer: null };
const productGrid = document.querySelector('#product-grid');
const emptyState = document.querySelector('#empty-state');
const cartDrawer = document.querySelector('#cart-drawer');

function money(amount) {
	return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function renderProducts(list = getVisibleProducts()) {
	productGrid.innerHTML = list.map((product, index) => `
		<article class="product-card" style="animation-delay:${Math.min(index * 45, 270)}ms">
			<div class="product-image-wrap">
				<img class="product-image" src="${product.imageUrl}" alt="${product.name}" loading="lazy">
				${product.label ? `<span class="product-label">${product.label}</span>` : ''}
				<button class="favorite-button ${state.favorites.has(product.id) ? 'is-favorite' : ''}" data-favorite="${product.id}" aria-label="${state.favorites.has(product.id) ? 'Remove from' : 'Add to'} favorites" aria-pressed="${state.favorites.has(product.id)}"><i data-lucide="heart"></i></button>
				<button class="quick-add" data-add="${product.id}"><span>Add to bag</span><i data-lucide="plus"></i></button>
			</div>
			<div class="product-meta"><span class="product-name">${product.name}</span><span class="product-price">${money(product.price)}</span></div>
			<div class="product-detail">${product.detail}</div>
		</article>`).join('');
	productGrid.hidden = list.length === 0;
	emptyState.hidden = list.length > 0;
	document.querySelector('#total-count').textContent = String(products.length).padStart(2, '0');
	if (window.lucide) window.lucide.createIcons();
}

function getVisibleProducts() {
	const query = state.query.trim().toLowerCase();
	let list = products.filter((product) => (state.category === 'All' || product.category === state.category)
		&& (!query || `${product.name} ${product.category} ${product.detail} ${product.color} ${product.label}`.toLowerCase().includes(query)));
	const sort = document.querySelector('#sort-select').value;
	if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
	if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
	return list;
}

function refreshProducts() {
	renderProducts();
	document.querySelectorAll('.filter-chip').forEach((button) => {
		const selected = button.dataset.filter === state.category;
		button.classList.toggle('selected', selected);
		button.setAttribute('aria-pressed', String(selected));
	});
}

function addToCart(id) {
	const existing = state.cart.find((item) => item.id === id);
	if (existing) existing.quantity += 1;
	else state.cart.push({ id, quantity: 1 });
	renderCart();
	const product = products.find((item) => item.id === id);
	showToast(`${product.name} added to your bag`);
}

function renderCart() {
	const count = state.cart.reduce((total, item) => total + item.quantity, 0);
	const subtotal = state.cart.reduce((total, item) => total + products.find((product) => product.id === item.id).price * item.quantity, 0);
	document.querySelector('#bag-count').textContent = count;
	document.querySelector('#drawer-count').textContent = `(${count})`;
	document.querySelector('#cart-subtotal').textContent = money(subtotal);
	document.querySelector('#cart-empty').hidden = count > 0;
	document.querySelector('#cart-footer').hidden = count === 0;
	document.querySelector('#cart-items').innerHTML = state.cart.map((item) => {
		const product = products.find((entry) => entry.id === item.id);
		return `<div class="cart-line"><img src="${product.imageUrl}" alt=""><div class="cart-line-info"><span class="cart-line-name">${product.name}</span><span class="cart-line-category">${product.category} · ${money(product.price)}</span><div class="quantity-control"><button data-quantity="-1" data-id="${product.id}" aria-label="Decrease ${product.name} quantity">−</button><span>${item.quantity}</span><button data-quantity="1" data-id="${product.id}" aria-label="Increase ${product.name} quantity">+</button></div></div><div class="cart-line-end"><span>${money(product.price * item.quantity)}</span><button class="remove-item" data-remove="${product.id}">Remove</button></div></div>`;
	}).join('');
}

function showCart(open) {
	document.body.classList.toggle('cart-open', open);
	cartDrawer.setAttribute('aria-hidden', String(!open));
	if (open) document.querySelector('#close-cart').focus();
	else document.querySelector('#bag-button').focus();
}

function showToast(message) {
	const toast = document.querySelector('#toast');
	toast.textContent = message;
	toast.classList.add('visible');
	clearTimeout(state.toastTimer);
	state.toastTimer = setTimeout(() => toast.classList.remove('visible'), 2300);
}

function styleWithAI() {
	const input = document.querySelector('#stylist-input');
	const prompt = input.value.trim();
	if (!prompt) {
		input.focus();
		input.placeholder = 'Tell me what you have in mind and I’ll find a match';
		return;
	}
	const text = prompt.toLowerCase();
	const priceMatch = text.match(/(?:under|below|less than|around|budget of)\s*\$?\s*(\d+)/);
	const budget = priceMatch ? Number(priceMatch[1]) : Infinity;
	let category = 'All';
	if (/shirt|dress|knit|trouser|clothes|wear|outfit|top/.test(text)) category = 'Clothing';
	else if (/bag|shoe|sneaker|jewel|jewelry|earring|accessor/.test(text)) category = 'Accessories';
	else if (/home|room|vase|throw|decor|living/.test(text)) category = 'Objects';
	const color = ['oat', 'red', 'green', 'blue', 'olive', 'gold', 'rust', 'chalk'].find((name) => text.includes(name));
	state.category = category;
	state.query = color || '';
	document.querySelector('#search-input').value = state.query;
	refreshProducts();
	const matches = getVisibleProducts().filter((product) => product.price <= budget);
	renderProducts(matches);
	const response = document.querySelector('#stylist-response');
	const intro = category === 'All' ? 'A little of everything' : `A ${category.toLowerCase()} edit`;
	const reason = color ? ` in ${color}` : budget < Infinity ? `, all under ${money(budget)}` : '';
	response.innerHTML = matches.length
		? `<strong>Your edit is ready.</strong> ${intro}${reason}: ${matches.slice(0, 3).map((item) => item.name).join(', ')}. Take a look below.`
		: `<strong>Let's try another angle.</strong> I couldn't find a match for that combination just yet. Try a category, color, or a different budget.`;
	response.hidden = false;
	document.querySelector('#shop').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('.filter-chip').forEach((button) => button.addEventListener('click', () => {
	state.category = button.dataset.filter;
	state.query = '';
	document.querySelector('#search-input').value = '';
	document.querySelector('#stylist-response').hidden = true;
	refreshProducts();
}));

document.querySelectorAll('[data-category-link]').forEach((link) => link.addEventListener('click', () => {
	state.category = link.dataset.categoryLink;
	state.query = '';
	refreshProducts();
}));

document.querySelector('#sort-select').addEventListener('change', refreshProducts);
document.querySelector('#search-input').addEventListener('input', (event) => {
	state.query = event.target.value;
	renderProducts();
});
document.querySelector('#clear-search').addEventListener('click', () => {
	document.querySelector('#search-input').value = '';
	state.query = '';
	renderProducts();
});
document.querySelector('.search-toggle').addEventListener('click', () => {
	const row = document.querySelector('#search-row');
	row.hidden = !row.hidden;
	if (!row.hidden) document.querySelector('#search-input').focus();
});
document.querySelector('#stylist-submit').addEventListener('click', styleWithAI);
document.querySelector('#stylist-input').addEventListener('keydown', (event) => {
	if (event.key === 'Enter') styleWithAI();
});
document.querySelector('#reset-filters').addEventListener('click', () => {
	state.category = 'All';
	state.query = '';
	document.querySelector('#search-input').value = '';
	refreshProducts();
});

productGrid.addEventListener('click', (event) => {
	const addButton = event.target.closest('[data-add]');
	const favoriteButton = event.target.closest('[data-favorite]');
	if (addButton) addToCart(addButton.dataset.add);
	if (favoriteButton) {
		const { favorite } = favoriteButton.dataset;
		if (state.favorites.has(favorite)) state.favorites.delete(favorite);
		else state.favorites.add(favorite);
		renderProducts();
		showToast(state.favorites.has(favorite) ? 'Saved to your favorites' : 'Removed from your favorites');
	}
});

document.querySelector('#bag-button').addEventListener('click', () => showCart(true));
document.querySelector('#close-cart').addEventListener('click', () => showCart(false));
document.querySelector('#drawer-backdrop').addEventListener('click', () => showCart(false));
document.querySelector('#continue-shopping').addEventListener('click', () => showCart(false));
document.querySelector('#cart-items').addEventListener('click', (event) => {
	const quantityButton = event.target.closest('[data-quantity]');
	const removeButton = event.target.closest('[data-remove]');
	if (removeButton) state.cart = state.cart.filter((item) => item.id !== removeButton.dataset.remove);
	if (quantityButton) {
		const item = state.cart.find((entry) => entry.id === quantityButton.dataset.id);
		item.quantity += Number(quantityButton.dataset.quantity);
		if (item.quantity < 1) state.cart = state.cart.filter((entry) => entry.id !== item.id);
	}
	renderCart();
});
document.querySelector('.checkout-button').addEventListener('click', () => showToast('Checkout is coming soon'));
document.querySelector('.account-button').addEventListener('click', () => showToast('Your account is coming soon'));
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && document.body.classList.contains('cart-open')) showCart(false);
});

renderProducts();
renderCart();
if (window.lucide) window.lucide.createIcons();
