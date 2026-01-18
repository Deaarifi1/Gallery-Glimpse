document.addEventListener('DOMContentLoaded', () => {
  const LS_KEYS = {
    fav: 'gallery_favorites_v1',
    cart: 'gallery_cart_v1'
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

  const items = [
    { title: 'Abstract art painting - "the four cubes"', src: 'img/pexels-steve-johnson-2989090.png', collection: 'Abstract', description: 'A geometric composition built from layered blocks and sharp edges, exploring balance, rhythm, and depth through repetition.' },
    { title: 'Abstract art painting - "the two"', src: 'img/pexels-nick-collins-1293125.png', collection: 'Abstract', description: 'A minimal abstract dialogue: two dominant forms in contrast, playing with negative space and soft transitions.' },
    { title: 'Abstract art painting - "the three"', src: 'img/pexels-steve-johnson-3535542.png', collection: 'Abstract', description: 'A triadic arrangement that suggests motion and tension—three elements pulling the eye through color and texture.' },
    { title: 'Modern lines - "quiet city"', src: 'img/pexels-steve-johnson-3535542.png', collection: 'Modern', description: 'Modern lines and subtle contrasts, inspired by calm urban geometry.' },
    { title: 'Minimal strokes - "soft silence"', src: 'img/pexels-nick-collins-1293125.png', collection: 'Minimal', description: 'Minimalism with soft strokes and airy spacing—simple but expressive.' },
    { title: 'Nature palette - "green drift"', src: 'img/pexels-steve-johnson-2989090.png', collection: 'Nature', description: 'Earth tones and organic transitions that echo natural movement.' }
  ].map(it => ({ ...it, id: normalizeId(it.title, it.src) }));

  function getFavs() { return safeJSON.get(LS_KEYS.fav, []); }
  function setFavs(v) { safeJSON.set(LS_KEYS.fav, v); updateBadges(); }
  function getCart() { return safeJSON.get(LS_KEYS.cart, []); }
  function setCart(v) { safeJSON.set(LS_KEYS.cart, v); updateBadges(); }

  function isFavorited(id) { return getFavs().some(x => x.id === id); }

  // overlays
  const overlays = {
    fav: document.getElementById('favoritesOverlay'),
    cart: document.getElementById('cartOverlay'),
    painting: document.getElementById('paintingOverlay')
  };
  const openOverlay = (el) => { if (!el) return; el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false'); };
  const closeOverlay = (el) => { if (!el) return; el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); };

  document.querySelectorAll('[data-close-overlay]').forEach(btn => btn.addEventListener('click', () => closeOverlay(btn.closest('.overlay-screen'))));
  document.querySelectorAll('.overlay-screen').forEach(ov => ov.addEventListener('click', (e) => { if (e.target === ov) closeOverlay(ov); }));

  // painting modal
  const paintingTitle = document.getElementById('paintingTitle');
  const paintingImg = document.getElementById('paintingImg');
  const paintingDesc = document.getElementById('paintingDesc');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const toggleFavFromModal = document.getElementById('toggleFavFromModal');
  const addedMsg = document.getElementById('addedMsg');
  let activePainting = null;

  function openPainting(item) {
    activePainting = item;
    paintingTitle.textContent = item.title;
    paintingImg.src = item.src;
    paintingImg.alt = item.title;
    paintingDesc.textContent = item.description || '';
    addedMsg.style.display = 'none';
    toggleFavFromModal.textContent = isFavorited(item.id) ? 'Remove favorite' : 'Add to favorites';
    openOverlay(overlays.painting);
  }

  addToCartBtn.addEventListener('click', () => {
    if (!activePainting) return;
    const cart = getCart();
    if (!cart.some(x => x.id === activePainting.id)) setCart([...cart, activePainting]);
    addedMsg.style.display = 'block';
  });

  toggleFavFromModal.addEventListener('click', () => {
    if (!activePainting) return;
    const favs = getFavs();
    const exists = favs.some(f => f.id === activePainting.id);
    setFavs(exists ? favs.filter(f => f.id !== activePainting.id) : [...favs, activePainting]);
    toggleFavFromModal.textContent = isFavorited(activePainting.id) ? 'Remove favorite' : 'Add to favorites';
  });

  // render filters
  const filtersEl = document.getElementById('filters');
  const gridEl = document.getElementById('grid');
  const categories = ['All', ...Array.from(new Set(items.map(i => i.collection)))];

  function renderFilters(active='All') {
    filtersEl.innerHTML = '';
    categories.forEach(cat => {
      const b = document.createElement('button');
      b.className = 'filter-btn' + (cat===active ? ' active' : '');
      b.textContent = cat;
      b.addEventListener('click', () => { renderFilters(cat); renderGrid(cat); });
      filtersEl.appendChild(b);
    });
  }

  function renderGrid(active='All') {
    const list = active==='All' ? items : items.filter(i => i.collection === active);
    gridEl.innerHTML = '';
    list.forEach(it => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${it.src}" alt="${it.title}">
        <div class="body">
          <p class="title">${it.title}</p>
          <div class="actions">
            <button class="btn primary" type="button" data-view="${it.id}">View</button>
            <button class="btn" type="button" data-fav="${it.id}">${isFavorited(it.id) ? 'Unfavorite' : 'Favorite'}</button>
            <button class="btn" type="button" data-cart="${it.id}">Add to cart</button>
          </div>
        </div>
      `;
      gridEl.appendChild(card);
    });
  }

  // list overlays render
  function renderFavorites() {
    const list = document.getElementById('favoritesList');
    const empty = document.getElementById('favoritesEmpty');
    const favs = getFavs();
    list.innerHTML = '';
    empty.style.display = favs.length ? 'none' : 'block';
    favs.forEach(it => {
      const c = document.createElement('div');
      c.className='card';
      c.innerHTML = `
        <img src="${it.src}" alt="${it.title}">
        <div class="body">
          <p class="title">${it.title}</p>
          <div class="actions">
            <button class="btn primary" type="button" data-view="${it.id}">View</button>
            <button class="btn" type="button" data-unfav="${it.id}">Remove</button>
          </div>
        </div>`;
      list.appendChild(c);
    });
  }

  function renderCart() {
    const list = document.getElementById('cartList');
    const empty = document.getElementById('cartEmpty');
    const cart = getCart();
    list.innerHTML = '';
    empty.style.display = cart.length ? 'none' : 'block';
    cart.forEach(it => {
      const c = document.createElement('div');
      c.className='card';
      c.innerHTML = `
        <img src="${it.src}" alt="${it.title}">
        <div class="body">
          <p class="title">${it.title}</p>
          <div class="actions">
            <button class="btn primary" type="button" data-view="${it.id}">View</button>
            <button class="btn" type="button" data-uncart="${it.id}">Remove</button>
          </div>
        </div>`;
      list.appendChild(c);
    });
  }

  // delegated clicks
  document.body.addEventListener('click', (e) => {
    const v = e.target.closest && e.target.closest('[data-view]');
    if (v) {
      const it = items.find(x => x.id === v.getAttribute('data-view')) || getFavs().find(x => x.id===v.getAttribute('data-view')) || getCart().find(x => x.id===v.getAttribute('data-view'));
      if (it) openPainting(it);
      return;
    }

    const f = e.target.closest && e.target.closest('[data-fav]');
    if (f) {
      const id = f.getAttribute('data-fav');
      const it = items.find(x => x.id === id);
      if (!it) return;
      const favs = getFavs();
      const exists = favs.some(x => x.id===id);
      setFavs(exists ? favs.filter(x => x.id!==id) : [...favs, it]);
      renderGrid(getActiveFilter());
      renderFavorites();
      return;
    }

    const c = e.target.closest && e.target.closest('[data-cart]');
    if (c) {
      const id = c.getAttribute('data-cart');
      const it = items.find(x => x.id === id);
      if (!it) return;
      const cart = getCart();
      if (!cart.some(x=>x.id===id)) setCart([...cart, it]);
      renderCart();
      return;
    }

    const uf = e.target.closest && e.target.closest('[data-unfav]');
    if (uf) {
      const id = uf.getAttribute('data-unfav');
      setFavs(getFavs().filter(x => x.id !== id));
      renderFavorites();
      renderGrid(getActiveFilter());
      return;
    }

    const uc = e.target.closest && e.target.closest('[data-uncart]');
    if (uc) {
      const id = uc.getAttribute('data-uncart');
      setCart(getCart().filter(x => x.id !== id));
      renderCart();
      return;
    }
  });

  function getActiveFilter(){
    const b = document.querySelector('.filter-btn.active');
    return b ? b.textContent : 'All';
  }

  // navbar icon clicks
  document.querySelector('.header-icons .heart-icon')?.addEventListener('click', () => { renderFavorites(); openOverlay(overlays.fav); });
  document.querySelector('.header-icons .shopping-bag-icon')?.addEventListener('click', () => { renderCart(); openOverlay(overlays.cart); });

  // badges
  function setBadge(el, n){
    if (!el) return;
    el.textContent = String(n);
    el.style.display = n>0 ? 'inline-flex' : 'none';
  }
  function updateBadges(){
    const favN = getFavs().length;
    const cartN = getCart().length;
    document.getElementById('favCount').textContent = String(favN);
    document.getElementById('cartCount').textContent = String(cartN);
    setBadge(document.getElementById('wishlist-count'), favN);
    setBadge(document.getElementById('cart-count'), cartN);
  }

  // init
  renderFilters('All');
  renderGrid('All');
  renderFavorites();
  renderCart();
  updateBadges();
});