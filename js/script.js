/**
 * Dessert Delight - Client-Side Application Logic
 * Production-ready Vanilla JavaScript
 */

(function () {
  'use strict';

  // --- Global Constants & Storage Keys ---
  const CART_STORAGE_KEY = 'dessert_delight_cart';
  const API_BASE = '/api';

  // --- SVG Fallback Placeholder for resilient offline/network resilience ---
  const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 400' width='100%25' height='100%25'%3E%3Crect width='500' height='400' fill='%23EFE3D3'/%3E%3Ccircle cx='250' cy='180' r='70' fill='%23F3D9DC'/%3E%3Cpath d='M210,180 Q250,130 290,180 Q250,230 210,180 Z' fill='%23C9828D'/%3E%3Ccircle cx='250' cy='155' r='14' fill='%234A2C20'/%3E%3Ctext x='50%25' y='300' font-family='sans-serif' font-size='20' font-weight='600' fill='%234A2C20' text-anchor='middle'%3EDessert Delight%3C/text%3E%3Ctext x='50%25' y='328' font-family='sans-serif' font-size='14' fill='%23765548' text-anchor='middle'%3EFreshly Baked with Love%3C/text%3E%3C/svg%3E";

  // --- State Variables ---
  let allDesserts = [];
  let currentCategory = 'All';
  let searchQuery = '';
  let selectedRating = 5;

  // --- Cart Management ---
  function getCart() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read cart from localStorage', e);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      updateCartBadge();
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }

  function addToCart(dessert, quantity = 1) {
    const cart = getCart();
    const existingIndex = cart.findIndex((item) => item.id === dessert.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: dessert.id,
        name: dessert.name,
        category: dessert.category || '',
        price: Number(dessert.price),
        image: dessert.image || '',
        quantity: quantity,
      });
    }

    saveCart(cart);
    showToast(`✓ ${dessert.name} added to cart`, 'success');
  }

  function updateItemQuantity(id, delta) {
    let cart = getCart();
    const item = cart.find((item) => item.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter((item) => item.id !== id);
      showToast('Item removed from cart', 'info');
    }

    saveCart(cart);
    renderCartPage();
    renderCheckoutSummary();
  }

  function removeItemFromCart(id) {
    let cart = getCart();
    const itemToRemove = cart.find((item) => item.id === id);
    cart = cart.filter((item) => item.id !== id);
    saveCart(cart);
    if (itemToRemove) {
      showToast(`Removed "${itemToRemove.name}" from cart`, 'info');
    }
    renderCartPage();
    renderCheckoutSummary();
  }

  function clearCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartBadge();
  }

  function getCartTotals() {
    const cart = getCart();
    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const delivery = subtotal > 0 ? 40 : 0;
    const total = subtotal + delivery;
    return { subtotal, delivery, total };
  }

  function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach((b) => {
      b.textContent = totalItems;
      b.style.display = totalItems > 0 ? 'flex' : 'none';
    });
  }

  // --- Toast Notifications ---
  function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconHtml = '✓';
    if (type === 'error') iconHtml = '✕';
    if (type === 'info') iconHtml = 'ℹ';

    toast.innerHTML = `
      <span class="toast-icon">${iconHtml}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto dismiss after 3.5s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 350);
    }, 3500);
  }

  // --- Utility Functions ---
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let starsStr = '★'.repeat(fullStars);
    if (hasHalf) starsStr += '½';
    return `<span class="stars">${starsStr}</span>`;
  }

  // --- API Fetchers ---
  async function fetchDesserts() {
    try {
      const res = await fetch(`${API_BASE}/desserts`);
      if (!res.ok) throw new Error('Failed to load desserts from server');
      const data = await res.json();
      allDesserts = data.desserts || [];
      return allDesserts;
    } catch (err) {
      console.error('Error fetching desserts:', err);
      // Fallback sample if server error occurs
      return [];
    }
  }

  // --- Modal Logic for Dessert Details ---
  let modalSelectedQty = 1;

  function initModal() {
    let modal = document.getElementById('dessert-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'dessert-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-card">
          <button class="modal-close-btn" id="modal-close-btn" aria-label="Close dialog">&times;</button>
          <div class="modal-grid">
            <div class="modal-image-wrap">
              <img id="modal-img" src="" alt="" onerror="this.src='${FALLBACK_IMAGE}'">
            </div>
            <div class="modal-details">
              <span class="modal-category" id="modal-category"></span>
              <h3 class="modal-title" id="modal-title"></h3>
              <div class="card-rating" id="modal-rating" style="margin-bottom: 12px;"></div>
              <p class="modal-desc" id="modal-desc"></p>
              <div class="modal-price-row">
                <span class="modal-price" id="modal-price"></span>
              </div>
              <div class="modal-actions">
                <div class="qty-stepper">
                  <button type="button" class="qty-btn" id="modal-qty-minus">-</button>
                  <span class="qty-val" id="modal-qty-val">1</span>
                  <button type="button" class="qty-btn" id="modal-qty-plus">+</button>
                </div>
                <button type="button" class="btn btn-primary" id="modal-add-btn">
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Bind close events
      const closeBtn = document.getElementById('modal-close-btn');
      closeBtn.addEventListener('click', closeDessertModal);
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeDessertModal();
      });

      // Bind qty stepper inside modal
      document.getElementById('modal-qty-minus').addEventListener('click', () => {
        if (modalSelectedQty > 1) {
          modalSelectedQty--;
          document.getElementById('modal-qty-val').textContent = modalSelectedQty;
        }
      });
      document.getElementById('modal-qty-plus').addEventListener('click', () => {
        modalSelectedQty++;
        document.getElementById('modal-qty-val').textContent = modalSelectedQty;
      });
    }
  }

  function openDessertModal(dessert) {
    initModal();
    modalSelectedQty = 1;
    document.getElementById('modal-qty-val').textContent = '1';

    const modal = document.getElementById('dessert-modal');
    document.getElementById('modal-img').src = dessert.image || FALLBACK_IMAGE;
    document.getElementById('modal-img').alt = dessert.name;
    document.getElementById('modal-category').textContent = dessert.category;
    document.getElementById('modal-title').textContent = dessert.name;
    document.getElementById('modal-desc').textContent = dessert.description;
    document.getElementById('modal-price').textContent = `₹${dessert.price}`;
    document.getElementById('modal-rating').innerHTML = `
      ${renderStars(dessert.rating)}
      <span class="score">${dessert.rating}</span>
      <span>(${dessert.ratingCount} reviews)</span>
    `;

    const addBtn = document.getElementById('modal-add-btn');
    // Replace with fresh clone to drop old event listeners
    const newAddBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newAddBtn, addBtn);
    newAddBtn.addEventListener('click', () => {
      addToCart(dessert, modalSelectedQty);
      closeDessertModal();
    });

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDessertModal() {
    const modal = document.getElementById('dessert-modal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  // --- Rendering Cards ---
  function createDessertCardElement(dessert) {
    const card = document.createElement('div');
    card.className = 'dessert-card';
    card.dataset.id = dessert.id;

    card.innerHTML = `
      <div class="card-media" title="View details">
        <img src="${dessert.image || FALLBACK_IMAGE}" alt="${escapeHtml(dessert.name)}" loading="lazy" onerror="this.src='${FALLBACK_IMAGE}'">
        <span class="card-category-badge">${escapeHtml(dessert.category)}</span>
      </div>
      <div class="card-body">
        <div class="card-rating">
          ${renderStars(dessert.rating)}
          <span class="score">${dessert.rating}</span>
          <span>(${dessert.ratingCount})</span>
        </div>
        <h3 class="card-title">${escapeHtml(dessert.name)}</h3>
        <p class="card-desc">${escapeHtml(dessert.description)}</p>
        <div class="card-footer">
          <div class="card-price">₹${dessert.price} <span>/ serving</span></div>
          <button class="btn-add-cart" aria-label="Add ${escapeHtml(dessert.name)} to cart">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <span>Add</span>
          </button>
        </div>
      </div>
    `;

    // Click on media or title to open modal
    const media = card.querySelector('.card-media');
    const title = card.querySelector('.card-title');
    media.addEventListener('click', () => openDessertModal(dessert));
    title.addEventListener('click', () => openDessertModal(dessert));

    // Add to cart click
    const addBtn = card.querySelector('.btn-add-cart');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(dessert, 1);
    });

    return card;
  }

  // --- Home Page: Popular Desserts ---
  async function initHomePage() {
    const popularGrid = document.getElementById('popular-desserts-grid');
    if (!popularGrid) return;

    popularGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--color-medium-brown);">
        <p>Curating our chef's favorites...</p>
      </div>
    `;

    const desserts = await fetchDesserts();
    popularGrid.innerHTML = '';

    // Choose 6 top popular desserts (one from each category or highest rated)
    const featured = desserts.slice(0, 6);
    featured.forEach((dessert) => {
      popularGrid.appendChild(createDessertCardElement(dessert));
    });
  }

  // --- Desserts Page: Search, Filters & Grid ---
  async function initDessertsPage() {
    const grid = document.getElementById('desserts-catalog-grid');
    if (!grid) return;

    const searchInput = document.getElementById('dessert-search-input');
    const categoryPills = document.querySelectorAll('.filter-pill');
    const resultsCount = document.getElementById('results-count');

    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
        <p>Loading artisanal desserts...</p>
      </div>
    `;

    await fetchDesserts();

    function renderFiltered() {
      grid.innerHTML = '';

      let filtered = allDesserts;

      if (currentCategory !== 'All') {
        filtered = filtered.filter(
          (d) => d.category.toLowerCase() === currentCategory.toLowerCase()
        );
      }

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q) ||
            d.category.toLowerCase().includes(q)
        );
      }

      if (resultsCount) {
        resultsCount.textContent = `Showing ${filtered.length} dessert${filtered.length === 1 ? '' : 's'}`;
      }

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-icon">🍰</div>
            <h3>No desserts match your search</h3>
            <p>Try searching for another flavor or browse all categories.</p>
            <button class="btn btn-secondary" id="reset-filters-btn">Clear Filter</button>
          </div>
        `;
        const resetBtn = document.getElementById('reset-filters-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            currentCategory = 'All';
            searchQuery = '';
            if (searchInput) searchInput.value = '';
            categoryPills.forEach((p) => p.classList.toggle('active', p.dataset.category === 'All'));
            renderFiltered();
          });
        }
        return;
      }

      filtered.forEach((item) => {
        grid.appendChild(createDessertCardElement(item));
      });
    }

    // Category pills event binding
    categoryPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        categoryPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategory = pill.dataset.category;
        renderFiltered();
      });
    });

    // Live search with debounce
    let searchTimeout = null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          searchQuery = e.target.value;
          renderFiltered();
        }, 200);
      });
    }

    renderFiltered();
  }

  // --- Cart Page Rendering ---
  function renderCartPage() {
    const cartContainer = document.getElementById('cart-items-container');
    const summaryContainer = document.getElementById('cart-summary-box');
    if (!cartContainer) return;

    const cart = getCart();
    const { subtotal, delivery, total } = getCartTotals();

    if (cart.length === 0) {
      cartContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🍰</div>
          <h3>Your cart is waiting for something sweet.</h3>
          <p>Treat yourself or your loved ones with handcrafted desserts baked fresh today.</p>
          <a href="desserts.html" class="btn btn-primary">Explore Desserts</a>
        </div>
      `;
      if (summaryContainer) summaryContainer.style.display = 'none';
      return;
    }

    if (summaryContainer) summaryContainer.style.display = 'block';

    let tableHtml = `
      <div class="cart-table-header">
        <div>Dessert</div>
        <div>Price</div>
        <div>Quantity</div>
        <div>Total</div>
        <div></div>
      </div>
    `;

    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      tableHtml += `
        <div class="cart-item-row" data-id="${item.id}">
          <div class="cart-item-info">
            <img class="cart-item-thumb" src="${item.image || FALLBACK_IMAGE}" alt="${escapeHtml(item.name)}" onerror="this.src='${FALLBACK_IMAGE}'">
            <div>
              <div class="cart-item-category">${escapeHtml(item.category || 'Dessert')}</div>
              <div class="cart-item-title">${escapeHtml(item.name)}</div>
            </div>
          </div>
          <div>₹${item.price}</div>
          <div>
            <div class="qty-stepper">
              <button class="qty-btn btn-minus" aria-label="Decrease quantity" data-id="${item.id}">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn btn-plus" aria-label="Increase quantity" data-id="${item.id}">+</button>
            </div>
          </div>
          <div class="item-total-price">₹${itemTotal}</div>
          <div>
            <button class="btn-remove-item" aria-label="Remove item" data-id="${item.id}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    });

    cartContainer.innerHTML = tableHtml;

    // Attach event handlers for qty and remove
    cartContainer.querySelectorAll('.btn-plus').forEach((btn) => {
      btn.addEventListener('click', () => updateItemQuantity(btn.dataset.id, 1));
    });
    cartContainer.querySelectorAll('.btn-minus').forEach((btn) => {
      btn.addEventListener('click', () => updateItemQuantity(btn.dataset.id, -1));
    });
    cartContainer.querySelectorAll('.btn-remove-item').forEach((btn) => {
      btn.addEventListener('click', () => removeItemFromCart(btn.dataset.id));
    });

    // Update Summary Box
    if (summaryContainer) {
      document.getElementById('summary-subtotal').textContent = `₹${subtotal}`;
      document.getElementById('summary-delivery').textContent = `₹${delivery}`;
      document.getElementById('summary-total').textContent = `₹${total}`;
    }
  }

  // --- Checkout Page: Order Summary & Form Submission ---
  function renderCheckoutSummary() {
    const summaryList = document.getElementById('checkout-items-list');
    if (!summaryList) return;

    const cart = getCart();
    const { subtotal, delivery, total } = getCartTotals();

    const checkoutFormCard = document.getElementById('checkout-form-card');
    const emptyNotice = document.getElementById('checkout-empty-notice');

    if (cart.length === 0) {
      if (checkoutFormCard) checkoutFormCard.style.display = 'none';
      if (emptyNotice) emptyNotice.style.display = 'block';
      return;
    } else {
      if (checkoutFormCard) checkoutFormCard.style.display = 'block';
      if (emptyNotice) emptyNotice.style.display = 'none';
    }

    let itemsHtml = '';
    cart.forEach((item) => {
      itemsHtml += `
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.92rem;">
          <div>
            <span style="font-weight: 600; color: var(--color-dark-brown);">${escapeHtml(item.name)}</span>
            <span style="color: var(--color-text-muted); font-size: 0.82rem;"> &times; ${item.quantity}</span>
          </div>
          <span style="font-weight: 600; color: var(--color-dark-brown);">₹${item.price * item.quantity}</span>
        </div>
      `;
    });

    summaryList.innerHTML = itemsHtml;
    document.getElementById('checkout-subtotal').textContent = `₹${subtotal}`;
    document.getElementById('checkout-delivery').textContent = `₹${delivery}`;
    document.getElementById('checkout-total').textContent = `₹${total}`;
  }

  function initCheckoutPage() {
    const form = document.getElementById('checkout-form');
    if (!form) return;

    renderCheckoutSummary();

    // Toggle UPI box
    const upiRadio = document.getElementById('payment-upi');
    const codRadio = document.getElementById('payment-cod');
    const upiBox = document.getElementById('upi-preview-box');

    function toggleUpi() {
      if (upiRadio && upiRadio.checked) {
        if (upiBox) upiBox.classList.add('show');
      } else {
        if (upiBox) upiBox.classList.remove('show');
      }
    }

    if (upiRadio) upiRadio.addEventListener('change', toggleUpi);
    if (codRadio) codRadio.addEventListener('change', toggleUpi);

    // Form Submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const cart = getCart();
      if (cart.length === 0) {
        showToast('Your cart is empty. Please add desserts first.', 'error');
        return;
      }

      const submitBtn = document.getElementById('place-order-btn');
      const originalBtnText = submitBtn.innerHTML;

      const fullName = document.getElementById('cust-name').value.trim();
      const phone = document.getElementById('cust-phone').value.trim();
      const email = document.getElementById('cust-email').value.trim();
      const address = document.getElementById('cust-address').value.trim();
      const city = document.getElementById('cust-city').value.trim();
      const paymentMethod = upiRadio && upiRadio.checked ? 'UPI' : 'Cash on Delivery';

      if (!fullName || !phone || !email || !address || !city) {
        showToast('Please fill in all delivery and customer details.', 'error');
        return;
      }

      const { subtotal, delivery, total } = getCartTotals();

      const payload = {
        customer: {
          name: fullName,
          phone: phone,
          email: email,
        },
        address,
        city,
        paymentMethod,
        items: cart.map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        subtotal,
        delivery,
        total,
      };

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Processing Order...</span>';

        const res = await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to place order.');
        }

        // Success: Clear cart & show confirmation screen
        clearCart();

        const checkoutGrid = document.querySelector('.checkout-grid');
        const successCard = document.getElementById('order-success-screen');

        if (checkoutGrid) checkoutGrid.style.display = 'none';
        if (successCard) {
          document.getElementById('confirmed-order-id').textContent = data.order.orderId;
          document.getElementById('confirmed-cust-name').textContent = data.order.customer.name;
          document.getElementById('confirmed-cust-email').textContent = data.order.customer.email;
          document.getElementById('confirmed-total').textContent = `₹${data.order.total}`;
          document.getElementById('confirmed-payment').textContent = data.order.paymentMethod;
          successCard.style.display = 'block';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        showToast('🎉 Order placed successfully!', 'success');
      } catch (err) {
        console.error('Order error:', err);
        showToast(err.message || 'Error placing order. Please try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });
  }

  // --- Contact Page Form ---
  function initContactPage() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const subject = document.getElementById('contact-subject').value.trim();
      const message = document.getElementById('contact-message').value.trim();
      const submitBtn = document.getElementById('contact-submit-btn');

      if (!name || !email || !subject || !message) {
        showToast('Please complete all contact fields.', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        const res = await fetch(`${API_BASE}/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to send message.');
        }

        showToast('✓ Message sent! We will respond promptly.', 'success');
        form.reset();
      } catch (err) {
        console.error('Contact submit error:', err);
        showToast(err.message || 'Error sending message. Please try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    });
  }

  // --- Feedback Page: Stars, Form & Testimonial Feed ---
  async function initFeedbackPage() {
    const starContainer = document.getElementById('star-rating-picker');
    const form = document.getElementById('feedback-form');
    const testimonialsContainer = document.getElementById('testimonials-container');

    if (starContainer) {
      const stars = starContainer.querySelectorAll('span');
      function updateStarView(val) {
        stars.forEach((s) => {
          const starVal = Number(s.dataset.val);
          s.classList.toggle('active', starVal <= val);
        });
      }

      stars.forEach((star) => {
        star.addEventListener('mouseenter', () => {
          const hoverVal = Number(star.dataset.val);
          stars.forEach((s) => {
            s.classList.toggle('hover', Number(s.dataset.val) <= hoverVal);
          });
        });

        star.addEventListener('mouseleave', () => {
          stars.forEach((s) => s.classList.remove('hover'));
        });

        star.addEventListener('click', () => {
          selectedRating = Number(star.dataset.val);
          updateStarView(selectedRating);
        });
      });

      updateStarView(selectedRating);
    }

    // Load existing feedback
    if (testimonialsContainer) {
      try {
        const res = await fetch(`${API_BASE}/feedback`);
        if (res.ok) {
          const data = await res.json();
          renderTestimonials(data.feedback || []);
        }
      } catch (e) {
        console.warn('Could not load existing testimonials', e);
      }
    }

    function renderTestimonials(list) {
      if (!testimonialsContainer) return;
      testimonialsContainer.innerHTML = '';

      if (list.length === 0) {
        testimonialsContainer.innerHTML = `<p style="text-align: center; grid-column: 1 / -1; color: var(--color-text-muted);">Be the first to leave a review!</p>`;
        return;
      }

      list.forEach((item) => {
        const initial = (item.name || 'G')[0].toUpperCase();
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        card.innerHTML = `
          <div class="stars">${'★'.repeat(item.rating || 5)}</div>
          <p class="review-text">"${escapeHtml(item.feedback)}"</p>
          <div class="testimonial-author">
            <div class="author-avatar">${initial}</div>
            <div class="author-meta">
              <strong>${escapeHtml(item.name)}</strong>
              <span>Verified Customer</span>
            </div>
          </div>
        `;
        testimonialsContainer.appendChild(card);
      });
    }

    // Form submit
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('feedback-name').value.trim();
        const email = document.getElementById('feedback-email').value.trim();
        const comment = document.getElementById('feedback-text').value.trim();
        const submitBtn = document.getElementById('feedback-submit-btn');

        if (!name || !email || !comment) {
          showToast('Please provide your name, email, and feedback message.', 'error');
          return;
        }

        try {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting...';

          const res = await fetch(`${API_BASE}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              rating: selectedRating,
              feedback: comment,
            }),
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.message || 'Error submitting feedback.');
          }

          showToast('✓ Thank you for sharing your experience!', 'success');
          form.reset();
          selectedRating = 5;
          if (starContainer) {
            const stars = starContainer.querySelectorAll('span');
            stars.forEach((s) => s.classList.add('active'));
          }

          // Prepend newly added feedback to grid
          if (testimonialsContainer && data.feedback) {
            const initial = (data.feedback.name || 'G')[0].toUpperCase();
            const newCard = document.createElement('div');
            newCard.className = 'testimonial-card';
            newCard.innerHTML = `
              <div class="stars">${'★'.repeat(data.feedback.rating || 5)}</div>
              <p class="review-text">"${escapeHtml(data.feedback.feedback)}"</p>
              <div class="testimonial-author">
                <div class="author-avatar">${initial}</div>
                <div class="author-meta">
                  <strong>${escapeHtml(data.feedback.name)}</strong>
                  <span>Verified Customer</span>
                </div>
              </div>
            `;
            testimonialsContainer.insertBefore(newCard, testimonialsContainer.firstChild);
          }
        } catch (err) {
          console.error('Feedback submit error:', err);
          showToast(err.message || 'Failed to submit feedback.', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Feedback';
        }
      });
    }
  }

  // --- Navbar Mobile Menu & Sticky Header ---
  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const toggleBtn = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (toggleBtn && navLinks) {
      toggleBtn.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
          navLinks.classList.remove('mobile-open');
        }
      });
    }

    if (navbar) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      });
    }

    updateCartBadge();
  }

  // --- Initialize on DOM Loaded ---
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initHomePage();
    initDessertsPage();
    renderCartPage();
    initCheckoutPage();
    initContactPage();
    initFeedbackPage();
  });
})();
