document.addEventListener('DOMContentLoaded', function () {
  // ---------------- Slider ----------------
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const viewport = document.querySelector('.slider-viewport3');

  function getItemWidth() {
    const item = document.querySelector('.details3');
    if (!item) return 300;
    const itemStyle = window.getComputedStyle(item);
    const ml = parseFloat(itemStyle.marginLeft) || 0;
    const mr = parseFloat(itemStyle.marginRight) || 0;
    return item.offsetWidth + ml + mr;
  }

  if (nextBtn && viewport) nextBtn.addEventListener('click', () => viewport.scrollBy({ left: getItemWidth(), behavior: 'smooth' }));
  if (prevBtn && viewport) prevBtn.addEventListener('click', () => viewport.scrollBy({ left: -getItemWidth(), behavior: 'smooth' }));

  // ---------------- Storage ----------------
  const LS_KEYS = {
    fav: 'gallery_favorites_v1',
    cart: 'gallery_cart_v1',
    profile: 'gallery_profile_v1'
  };

  const safeJSON = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  function normalizeId(title, src) {
    return (title + '|' + src).toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function getPaintingItemsFromSlider() {
    const cards = Array.from(document.querySelectorAll('.details3'));
    return cards.map((card, idx) => {
      const img = card.querySelector('img');
      const titleEl = card.querySelector('p b');
      const title = titleEl ? titleEl.textContent.trim() : `Painting ${idx + 1}`;
      const src = img ? img.getAttribute('src') : '';
      const alt = img ? (img.getAttribute('alt') || title) : title;

      const descMap = {
        'the four cubes': 'A geometric composition built from layered blocks and sharp edges, exploring balance, rhythm, and depth through repetition.',
        'the two': 'A minimal abstract dialogue: two dominant forms in contrast, playing with negative space and soft transitions.',
        'the three': 'A triadic arrangement that suggests motion and tension—three elements pulling the eye through color and texture.',
        'the four': 'A variation on the “four” theme—structured shapes arranged to create a calm, architectural harmony.',
        'the five': 'A bolder arrangement with five focal accents, creating a lively cadence across the canvas.'
      };

      const m = title.toLowerCase().match(/"([^"]+)"/);
      const key = m ? m[1] : '';
      const description = descMap[key] || 'An abstract artwork that focuses on shape, texture, and contrast—inviting the viewer to interpret meaning through color and form.';

      return {
        id: normalizeId(title, src),
        title,
        src,
        alt,
        description,
        collection: 'Abstract'
      };
    });
  }

  const sliderItems = getPaintingItemsFromSlider();

  function getFavs() { return safeJSON.get(LS_KEYS.fav, []); }
  function setFavs(v) { safeJSON.set(LS_KEYS.fav, v); updateBadges(); }
  function getCart() { return safeJSON.get(LS_KEYS.cart, []); }
  function setCart(v) { safeJSON.set(LS_KEYS.cart, v); updateBadges(); }
  function getProfile() { return safeJSON.get(LS_KEYS.profile, { name: '', email: '', address: '' }); }
  function setProfile(v) { safeJSON.set(LS_KEYS.profile, v); }

  function isFavorited(id) { return getFavs().some(x => x.id === id); }

  // ---------------- Overlays open/close ----------------
  const overlays = {
    fav: document.getElementById('favoritesOverlay'),
    profile: document.getElementById('profileOverlay'),
    cart: document.getElementById('cartOverlay'),
    painting: document.getElementById('paintingOverlay')
  };

  function openOverlay(el) {
    if (!el) return;
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
  }

  function closeOverlay(el) {
    if (!el) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
  }

  document.querySelectorAll('[data-close-overlay]').forEach(btn => {
    btn.addEventListener('click', () => closeOverlay(btn.closest('.overlay-screen')));
  });

  document.querySelectorAll('.overlay-screen').forEach(ov => {
    ov.addEventListener('click', (e) => {
      if (e.target === ov) closeOverlay(ov);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const open = Array.from(document.querySelectorAll('.overlay-screen.is-open')).pop();
      if (open) closeOverlay(open);
    }
  });

  // ---------------- Favorites ----------------
  function toggleFavorite(item) {
    const favs = getFavs();
    const exists = favs.some(f => f.id === item.id);
    const next = exists ? favs.filter(f => f.id !== item.id) : [...favs, item];
    setFavs(next);
    renderFavorites();
  }

  // Favorites overlay render
  const favoritesList = document.getElementById('favoritesList');
  const favoritesEmpty = document.getElementById('favoritesEmpty');
  function renderFavorites() {
    if (!favoritesList || !favoritesEmpty) return;
    const favs = getFavs();
    favoritesList.innerHTML = '';
    favoritesEmpty.style.display = favs.length ? 'none' : 'block';

    favs.forEach((it) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${it.src}" alt="${it.alt || it.title}">
        <div class="card-body">
          <p class="card-title">${it.title}</p>
          <div class="card-actions">
            <button class="btn primary" type="button" data-open-painting="${it.id}">View</button>
            <button class="btn danger" type="button" data-remove-fav="${it.id}">Remove</button>
          </div>
        </div>
      `;
      favoritesList.appendChild(card);
    });
  }

  // ---------------- Cart ----------------
  const cartList = document.getElementById('cartList');
  const cartEmpty = document.getElementById('cartEmpty');
  function addToCart(item) {
    const cart = getCart();
    if (!cart.some(x => x.id === item.id)) {
      setCart([...cart, item]);
    }
    renderCart();
  }

  function removeFromCart(id) {
    setCart(getCart().filter(x => x.id !== id));
    renderCart();
  }

  function renderCart() {
    if (!cartList || !cartEmpty) return;
    const cart = getCart();
    cartList.innerHTML = '';
    cartEmpty.style.display = cart.length ? 'none' : 'block';

    cart.forEach((it) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${it.src}" alt="${it.alt || it.title}">
        <div class="card-body">
          <p class="card-title">${it.title}</p>
          <div class="card-actions">
            <button class="btn" type="button" data-open-painting="${it.id}">View</button>
            <button class="btn danger" type="button" data-remove-cart="${it.id}">Remove</button>
          </div>
        </div>
      `;
      cartList.appendChild(card);
    });
  }

  // ---------------- Painting modal ----------------
  const paintingTitle = document.getElementById('paintingTitle');
  const paintingImg = document.getElementById('paintingImg');
  const paintingDesc = document.getElementById('paintingDesc');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const toggleFavFromModal = document.getElementById('toggleFavFromModal');
  const addedMsg = document.getElementById('addedMsg');

  let activePainting = null;

  function openPaintingById(id) {
    const item = sliderItems.find(x => x.id === id);
    if (!item) return;

    activePainting = item;
    if (paintingTitle) paintingTitle.textContent = item.title;
    if (paintingImg) { paintingImg.src = item.src; paintingImg.alt = item.alt || item.title; }
    if (paintingDesc) paintingDesc.textContent = item.description || '';
    if (addedMsg) addedMsg.style.display = 'none';

    openOverlay(overlays.painting);

    if (toggleFavFromModal) {
      toggleFavFromModal.textContent = isFavorited(item.id) ? 'Remove favorite' : 'Add to favorites';
    }
  }

  // Hook "View Painting" buttons
  document.querySelectorAll('.details3 .button3').forEach((btn, idx) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const item = sliderItems[idx];
      if (item) openPaintingById(item.id);
    });
  });

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (!activePainting) return;
      addToCart(activePainting);
      if (addedMsg) addedMsg.style.display = 'block';
      updateBadges();
    });
  }

  if (toggleFavFromModal) {
    toggleFavFromModal.addEventListener('click', () => {
      if (!activePainting) return;
      toggleFavorite(activePainting);
      toggleFavFromModal.textContent = isFavorited(activePainting.id) ? 'Remove favorite' : 'Add to favorites';
      updateBadges();
    });
  }

  // Delegated handlers
  document.body.addEventListener('click', (e) => {
    const t = e.target;

    const openBtn = t.closest && t.closest('[data-open-painting]');
    if (openBtn) {
      e.preventDefault();
      openPaintingById(openBtn.getAttribute('data-open-painting'));
      return;
    }

    const rf = t.closest && t.closest('[data-remove-fav]');
    if (rf) {
      e.preventDefault();
      const id = rf.getAttribute('data-remove-fav');
      setFavs(getFavs().filter(x => x.id !== id));
      renderFavorites();
      updateBadges();
      return;
    }

    const rc = t.closest && t.closest('[data-remove-cart]');
    if (rc) {
      e.preventDefault();
      removeFromCart(rc.getAttribute('data-remove-cart'));
      updateBadges();
      return;
    }
  });

  // ---------------- Profile ----------------
  const profileForm = document.getElementById('profileForm');
  const resetProfile = document.getElementById('resetProfile');
  const profileSavedMsg = document.getElementById('profileSavedMsg');

  function loadProfileIntoForm() {
    const p = getProfile();
    const name = document.getElementById('pName');
    const email = document.getElementById('pEmail');
    const address = document.getElementById('pAddress');
    if (name) name.value = p.name || '';
    if (email) email.value = p.email || '';
    if (address) address.value = p.address || '';
  }

  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('pName')?.value || '',
        email: document.getElementById('pEmail')?.value || '',
        address: document.getElementById('pAddress')?.value || ''
      };
      setProfile(data);
      if (profileSavedMsg) {
        profileSavedMsg.style.display = 'block';
        setTimeout(() => (profileSavedMsg.style.display = 'none'), 1200);
      }
    });
  }

  if (resetProfile) {
    resetProfile.addEventListener('click', () => {
      setProfile({ name: '', email: '', address: '' });
      loadProfileIntoForm();
    });
  }

  // ---------------- Navbar icon clicks ----------------
  const headerHeart = document.querySelector('.header-icons .heart-icon');
  const headerUser  = document.querySelector('.header-icons .user-icon');
  const headerBag   = document.querySelector('.header-icons .shopping-bag-icon');

  if (headerHeart) headerHeart.addEventListener('click', () => { renderFavorites(); openOverlay(overlays.fav); });
  if (headerUser)  headerUser.addEventListener('click', () => { loadProfileIntoForm(); openOverlay(overlays.profile); });
  if (headerBag)   headerBag.addEventListener('click', () => { renderCart(); openOverlay(overlays.cart); });

  // Checkout / clear cart
  const clearCartBtn = document.getElementById('clearCartBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const checkoutMsg = document.getElementById('checkoutMsg');

  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      setCart([]);
      renderCart();
      updateBadges();
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (checkoutMsg) {
        checkoutMsg.style.display = 'block';
        setTimeout(() => (checkoutMsg.style.display = 'none'), 1400);
      }
      setCart([]);
      renderCart();
      updateBadges();
    });
  }

  // ---------------- Badges (navbar + overlay) ----------------
  function setBadge(el, n) {
    if (!el) return;
    el.textContent = String(n);
    el.style.display = n > 0 ? 'inline-flex' : 'none';
  }

  function updateBadges() {
    const favN = getFavs().length;
    const cartN = getCart().length;

    // overlay header badges
    const favCount = document.getElementById('favCount');
    const cartCount = document.getElementById('cartCount');
    if (favCount) favCount.textContent = String(favN);
    if (cartCount) cartCount.textContent = String(cartN);

    // navbar badges
    setBadge(document.getElementById('wishlist-count'), favN);
    setBadge(document.getElementById('cart-count'), cartN);
  }

  // Initial render
  updateBadges();
  renderFavorites();
  renderCart();
});