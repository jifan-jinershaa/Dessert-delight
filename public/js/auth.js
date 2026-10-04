(function () {
  'use strict';

  const API = '/api/auth';

  const protectedPages = [
    'index.html',
    'desserts.html',
    'cart.html',
    'order.html',
    'contact.html',
    'feedback.html',
    'history.html'
  ];

  const page = location.pathname.split('/').pop() || '';

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function parseResponse(response) {
    const text = await response.text();

    if (!text) {
      throw new Error(
        `Server returned an empty response (${response.status}).`
      );
    }

    try {
      return JSON.parse(text);
    } catch {
      console.error('Server returned non-JSON:', text);

      throw new Error(
        `Server returned an invalid response (${response.status}).`
      );
    }
  }

  async function getMe() {
    try {
      const response = await fetch(`${API}/me`, {
        credentials: 'include'
      });

      if (response.status === 401) {
        return null;
      }

      const data = await parseResponse(response);

      return data.user || null;
    } catch (error) {
      console.error('getMe error:', error);
      return null;
    }
  }

  async function logout() {
    try {
      await fetch(`${API}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } finally {
      location.href = '/login.html';
    }
  }

  function renderNav(user) {
    const target = document.getElementById('auth-nav-action');

    if (!target) return;

    if (user) {
      target.innerHTML = `
        <div class="user-menu">
          <span class="user-greeting">
            Hi, ${escapeHtml(user.name.split(' ')[0])}
          </span>

          <button
            class="btn btn-secondary btn-sm"
            id="logout-btn"
            type="button"
          >
            Logout
          </button>
        </div>
      `;

      document
        .getElementById('logout-btn')
        ?.addEventListener('click', logout);
    }
  }

  function showAuthMessage(message, type = 'error') {
    const box = document.getElementById('auth-message');

    if (!box) return;

    box.textContent = message;
    box.className = `auth-message ${type}`;
  }

  async function initLogin(form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const button = form.querySelector('button[type="submit"]');

      button.disabled = true;
      showAuthMessage('', '');

      try {
        const response = await fetch(`${API}/login`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: form.email.value.trim(),
            password: form.password.value
          })
        });

        const data = await parseResponse(response);

        if (!response.ok) {
          throw new Error(
            data.message || 'Invalid email or password.'
          );
        }

        showAuthMessage(
          'Login successful. Redirecting...',
          'success'
        );

        setTimeout(() => {
          location.href = '/index.html';
        }, 500);

      } catch (error) {
        console.error('Login error:', error);

        showAuthMessage(
          error.message || 'Unable to connect to the server.'
        );

        button.disabled = false;
      }
    });
  }

  async function initRegister(form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const button = form.querySelector('button[type="submit"]');

      button.disabled = true;
      showAuthMessage('', '');

      try {
        const response = await fetch(`${API}/register`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
            password: form.password.value
          })
        });

        const data = await parseResponse(response);

        if (!response.ok) {
          throw new Error(
            data.message || 'Unable to create account.'
          );
        }

        showAuthMessage(
          'Account created successfully. Redirecting...',
          'success'
        );

        setTimeout(() => {
          location.href = '/index.html';
        }, 500);

      } catch (error) {
        console.error('Registration error:', error);

        showAuthMessage(
          error.message || 'Unable to connect to the server.'
        );

        button.disabled = false;
      }
    });
  }

  async function prefillCheckout(user) {
    const name = document.getElementById('cust-name');
    const email = document.getElementById('cust-email');
    const phone = document.getElementById('cust-phone');

    if (name && !name.value) {
      name.value = user.name || '';
    }

    if (email && !email.value) {
      email.value = user.email || '';
    }

    if (phone && !phone.value) {
      phone.value = user.phone || '';
    }
  }

  async function loadHistory() {
    const loading = document.getElementById('history-loading');
    const empty = document.getElementById('history-empty');
    const list = document.getElementById('history-list');

    try {
      const response = await fetch('/api/orders/history', {
        credentials: 'include'
      });

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to load orders.'
        );
      }

      const orders = data.orders || [];

      if (loading) {
        loading.style.display = 'none';
      }

      if (!orders.length) {
        if (empty) {
          empty.style.display = 'block';
        }

        return;
      }

      list.innerHTML = orders.map(order => `
        <article class="history-card">

          <div class="history-card-top">

            <div>
              <span class="eyebrow">ORDER</span>

              <h3>
                ${escapeHtml(order.orderId)}
              </h3>

              <p>
                ${new Date(order.createdAt).toLocaleString('en-IN')}
              </p>
            </div>

            <span class="
              status-pill
              status-${String(order.status || 'Pending')
                .toLowerCase()
                .replace(/\s+/g, '-')}
            ">
              ${escapeHtml(order.status || 'Pending')}
            </span>

          </div>

          <div class="history-items">

            ${(order.items || []).map(item => `
              <div class="history-item">

                <span>
                  ${escapeHtml(item.name)}
                  × ${item.quantity}
                </span>

                <strong>
                  ₹${item.price * item.quantity}
                </strong>

              </div>
            `).join('')}

          </div>

          <div class="history-footer">

            <span>
              ${escapeHtml(order.paymentMethod || '')}
              ·
              ${escapeHtml(order.city || '')}
            </span>

            <strong>
              Total ₹${order.total}
            </strong>

          </div>

        </article>
      `).join('');

    } catch (error) {
      console.error('History error:', error);

      if (loading) {
        loading.textContent = error.message;
      }
    }
  }

  async function init() {

    const user = await getMe();

    if (page === 'login.html' && user) {
      location.replace('/index.html');
      return;
    }

    if (protectedPages.includes(page) && !user) {
      location.replace('/login.html');
      return;
    }

    renderNav(user);

    document
      .querySelectorAll('.auth-history-link')
      .forEach(element => {
        if (!user) {
          element.style.display = 'none';
        }
      });

    const loginForm =
      document.getElementById('login-form');

    const registerForm =
      document.getElementById('register-form');

    if (loginForm) {
      initLogin(loginForm);
    }

    if (registerForm) {
      initRegister(registerForm);
    }

    if (page === 'history.html' && user) {
      loadHistory();
    }

    if (page === 'order.html' && user) {
      prefillCheckout(user);
    }
  }

  document.addEventListener(
    'DOMContentLoaded',
    init
  );

})();