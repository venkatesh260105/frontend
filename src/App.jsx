import React, { useEffect, useMemo, useRef, useState } from 'react';
import localProducts from './data/products.json';
import { getINR } from './utils/helpers';
import { getCategoryIcon } from './utils/categoryIcons';
import { api } from './utils/api';
import { initStorageHelpers, syncWithDiskStorage, cleanOrderObject, cleanOrderItem } from './utils/storage';

import Header from './components/layout/Header';
import FlipkartCategoryBar from './components/layout/FlipkartCategoryBar';
import HeroBanner, { defaultSlides as slides } from './components/layout/HeroBanner';
import Footer from './components/layout/Footer';

import Card from './components/product/Card';
import CategoryRow from './components/product/CategoryRow';
import Product from './components/product/Product';

import Cart from './components/cart/Cart';
import CheckoutModal from './components/checkout/CheckoutModal';
import OrderConfirmationModal from './components/checkout/OrderConfirmationModal';

import Orders from './components/orders/Orders';
import OrderTracking from './components/orders/OrderTracking';
import Auth from './components/auth/Auth';
import Empty from './components/common/Empty';
import GatewayDashboard from './components/gateway/GatewayDashboard';

export function App() {
  const [gatewayOpen, setGatewayOpen] = useState(false);
  // Load products from local JSON dataset as primary instant source
  const [p, setP] = useState(() => localProducts || []);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [sel, setSel] = useState(null);
  const [page, setPage] = useState('home');
  const [slide, setSlide] = useState(0);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [wish, setWish] = useState(() => JSON.parse(localStorage.getItem('wish') || '[]'));
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('orders') || '[]'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [cartOpen, setCartOpen] = useState(false);
  const [auth, setAuth] = useState(false);
  const [toast, setToast] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [bump, setBump] = useState(false);

  // E-commerce checkout & tracking state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  // Dark/Light Theme state with full-screen celestial transition ripple
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sk-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  const [themeTransitioning, setThemeTransitioning] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sk-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeTransitioning(true);
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
    setTimeout(() => setThemeTransitioning(false), 700);
  };

  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  const bumpRef = useRef(true);

  useEffect(() => {
    if (bumpRef.current) {
      bumpRef.current = false;
      return;
    }
    if (!cartCount) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 700);
    return () => clearTimeout(t);
  }, [cartCount]);

  // Sync additional items from API if available, preserving local rich dataset
  useEffect(() => {
    api('/products?limit=100').then(x => {
      if (x && x.products && x.products.length) {
        setP(current => {
          const ids = new Set(current.map(item => item.id));
          const additions = x.products.filter(item => !ids.has(item.id));
          return [...current, ...additions];
        });
      }
    }).catch(() => {
      // Gracefully uses localProducts loaded at initial state
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wish', JSON.stringify(wish));
  }, [wish]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
    syncWithDiskStorage();
  }, [orders]);

  useEffect(() => {
    let t = setInterval(() => setSlide(x => (x + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Initialize storage helper utilities and sync with src/storage.json on disk
  useEffect(() => {
    initStorageHelpers();
    fetch('/api/load-storage')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
          localStorage.setItem('orders', JSON.stringify(data.orders));
        }
      })
      .catch(() => {});
  }, []);

  function note(x) {
    setToast(x);
    setTimeout(() => setToast(''), 2200);
  }

  const cats = useMemo(() => ['all', ...new Set(p.map(x => x.category))], [p]);

  // Results pipeline with Category, Search, Price Shortlist filter & Sort Order
  const results = useMemo(() => {
    let list = p.filter(x => {
      const matchesCat = (cat === 'all' || x.category === cat);
      const matchesSearch = !q || [x.title, x.description, x.brand, x.category].join(' ').toLowerCase().includes(q.toLowerCase());

      const inr = getINR(x.price);
      let matchesPrice = true;
      if (priceFilter === 'u1k') matchesPrice = inr < 1000;
      else if (priceFilter === '1k-5k') matchesPrice = inr >= 1000 && inr <= 5000;
      else if (priceFilter === '5k-20k') matchesPrice = inr >= 5000 && inr <= 20000;
      else if (priceFilter === '20k-50k') matchesPrice = inr >= 20000 && inr <= 50000;
      else if (priceFilter === 'a50k') matchesPrice = inr > 50000;

      return matchesCat && matchesSearch && matchesPrice;
    });

    if (sortBy === 'price-asc') {
      list.sort((a, b) => getINR(a.price) - getINR(b.price));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => getINR(b.price) - getINR(a.price));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return list;
  }, [p, q, cat, priceFilter, sortBy]);

  const heroSideCats = useMemo(() => cats.slice(1, 3).map(c => ({ cat: c, img: p.find(x => x.category === c)?.thumbnail })), [cats, p]);
  const rowCats = useMemo(() => cats.slice(1, 4), [cats]);

  function open(x) {
    setSel(x);
    setPage('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function add(x) {
    setCart(c => c.some(y => y.id === x.id) ? c.map(y => y.id === x.id ? { ...y, qty: y.qty + 1 } : y) : [...c, { ...x, qty: 1 }]);
    note('Added to cart');
  }

  function updateCartQty(id, newQty) {
    if (newQty < 1) return;
    setCart(c => c.map(item => item.id === id ? { ...item, qty: newQty } : item));
  }

  function removeFromCart(id) {
    setCart(c => c.filter(item => item.id !== id));
    note('Item removed from cart');
  }

  function wishIt(x) {
    const isLiked = wish.some(y => y.id === x.id);
    setWish(w => isLiked ? w.filter(y => y.id !== x.id) : [...w, x]);
    note(isLiked ? 'Removed from wishlist' : 'Saved to wishlist ❤️');
  }

  function startCheckout(itemsToCheckout) {
    const items = itemsToCheckout || cart;
    if (!items.length) return note('Cart is empty');
    setCheckoutItems(items);
    setCartOpen(false);
    setCheckoutOpen(true);
  }

  function handlePlaceOrder(deliveryDetails) {
    const orderId = 'SK' + Math.floor(10000 + Math.random() * 90000);
    const newOrder = cleanOrderObject({
      id: orderId,
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'Order Confirmed',
      stageIndex: 0,
      customer: {
        name: deliveryDetails.customer?.name || '',
        email: deliveryDetails.customer?.email || '',
        phone: deliveryDetails.customer?.phone || ''
      },
      shipping: {
        address: deliveryDetails.shipping?.address || '',
        city: deliveryDetails.shipping?.city || '',
        state: deliveryDetails.shipping?.state || '',
        pincode: deliveryDetails.shipping?.pincode || '',
        country: deliveryDetails.shipping?.country || 'India'
      },
      items: checkoutItems.map(cleanOrderItem),
      total: checkoutItems.reduce((s, x) => s + getINR(x.price) * x.qty, 0)
    });

    if (checkoutItems === cart || checkoutItems.length === cart.length) {
      setCart([]);
    } else {
      const checkoutIds = checkoutItems.map(i => i.id);
      setCart(c => c.filter(i => !checkoutIds.includes(i.id)));
    }

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    setCheckoutOpen(false);
    setConfirmedOrder(newOrder);
    setConfirmationOpen(true);
    note('Order placed successfully!');
  }

  function trackOrder(orderId) {
    setTrackingOrderId(orderId);
    setConfirmationOpen(false);
    setPage('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function advanceOrderStage(orderId) {
    const stages = ['Order Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    setOrders(os => os.map(o => {
      if (o.id === orderId && o.status !== 'Cancelled') {
        const nextIndex = Math.min(stages.length - 1, (o.stageIndex || 0) + 1);
        return { ...o, stageIndex: nextIndex, status: stages[nextIndex] };
      }
      return o;
    }));
    note('Order tracking status updated');
  }

  function cancelOrder(id) {
    setOrders(os => os.map(o => o.id === id ? { ...o, status: 'Cancelled', cancelledAt: new Date().toLocaleString() } : o));
    note('Order cancelled');
  }

  return (
    <>
      {/* Expanding Celestial Theme Transition Ripple Effect */}
      {themeTransitioning && <div className="themeRipplePortal" />}

      {/* Top Header */}
      <Header
        setPage={setPage}
        setCat={setCat}
        setPriceFilter={setPriceFilter}
        q={q}
        setQ={setQ}
        searchFocused={searchFocused}
        setSearchFocused={setSearchFocused}
        theme={theme}
        toggleTheme={toggleTheme}
        wishCount={wish.length}
        cartCount={cartCount}
        user={user}
        setUser={setUser}
        setAuth={setAuth}
        setCartOpen={setCartOpen}
        setGatewayOpen={setGatewayOpen}
        note={note}
      />

      {/* Flipkart-Style Top Category Navigation Bar */}
      <FlipkartCategoryBar
        cats={cats}
        cat={cat}
        setCat={setCat}
        setPriceFilter={setPriceFilter}
        setPage={setPage}
      />

      <main>
        {page === 'home' && (
          <>
            {/* 1. When 'All Offers' is selected (cat === 'all') and no active search query: Show Ads & Promotional Banner */}
            {cat === 'all' && !q && (
              <HeroBanner
                slides={slides}
                slide={slide}
                setSlide={setSlide}
                heroSideCats={heroSideCats}
                setCat={setCat}
                setPage={setPage}
              />
            )}

            {/* 2. When a Specific Category is Clicked (e.g. Laptop, Beauty, etc.): Clean Category Store Header without Ads */}
            {cat !== 'all' && !q && (
              <div className="categoryPageHeader">
                <div className="categoryBreadcrumbs">
                  <span onClick={() => { setCat('all'); setPriceFilter('all'); }}>All Offers</span>
                  <span>›</span>
                  <b>{cat.replaceAll('-', ' ')}</b>
                </div>

                <div className="categoryPageTitleRow">
                  <div className="catTitleLeft">
                    <span className="catHeaderIcon">{getCategoryIcon(cat)}</span>
                    <div>
                      <small className="catBadgeLabel">CATEGORY STORE</small>
                      <h1>{cat.replaceAll('-', ' ')}</h1>
                    </div>
                  </div>

                  <div className="catHeaderRight">
                    <span className="catCountBadge">{results.length} Products Available</span>
                    <button
                      className="backToAllBtn"
                      onClick={() => { setCat('all'); setPriceFilter('all'); }}
                    >
                      ← Back to All Offers & Ads
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Price Shortlist Filters & Sorting Bar */}
            <div className="filterSortBar">
              <div className="priceShortlistWrap">
                <span className="priceFilterLabel">Shortlist by Price:</span>
                <div className="priceChipsScroll">
                  {[
                    { id: 'all', label: 'All Prices' },
                    { id: 'u1k', label: 'Under ₹1,000' },
                    { id: '1k-5k', label: '₹1,000 - ₹5,000' },
                    { id: '5k-20k', label: '₹5,000 - ₹20,000' },
                    { id: '20k-50k', label: '₹20,000 - ₹50,000' },
                    { id: 'a50k', label: 'Above ₹50,000' }
                  ].map(pf => (
                    <button
                      key={pf.id}
                      type="button"
                      className={`priceChip ${priceFilter === pf.id ? 'active' : ''}`}
                      onClick={() => setPriceFilter(pf.id)}
                    >
                      {pf.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sortDropdownWrap">
                <label htmlFor="sortSelect">Sort by:</label>
                <select
                  id="sortSelect"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="sortSelect"
                >
                  <option value="featured">Featured Deals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Product Listing Section */}
            <section id="products">
              {cat === 'all' && (
                <div className="title">
                  <div>
                    <small>DISCOVER</small>
                    <h2>{q ? `Results for “${q}”` : 'Trending for you'}</h2>
                  </div>
                  <span>{results.length} products found</span>
                </div>
              )}

              {results.length ? (
                <div className="grid" key={cat + '|' + q + '|' + priceFilter + '|' + sortBy}>
                  {results.map((x, idx) => (
                    <Card key={x.id} p={x} index={idx} open={open} add={add} wish={wish} wishIt={wishIt} />
                  ))}
                </div>
              ) : (
                <Empty />
              )}
            </section>

            {/* Carousel rows only shown when browsing All Offers without active search & default price filter */}
            {cat === 'all' && !q && priceFilter === 'all' && rowCats.map(c => (
              <CategoryRow
                key={c}
                title={c.replaceAll('-', ' ')}
                items={p.filter(x => x.category === c).slice(0, 10)}
                open={open}
                add={add}
                wish={wish}
                wishIt={wishIt}
              />
            ))}
          </>
        )}

        {page === 'product' && sel && (
          <Product
            p={sel}
            open={open}
            add={add}
            buyNow={item => startCheckout([item])}
            wish={wish}
            wishIt={wishIt}
            related={p.filter(x => x.id !== sel.id && x.category === sel.category).slice(0, 8)}
          />
        )}

        {page === 'orders' && (
          <Orders
            orders={orders}
            cancelOrder={cancelOrder}
            onTrackOrder={trackOrder}
            onAdvanceStage={advanceOrderStage}
          />
        )}

        {page === 'tracking' && (
          <OrderTracking
            order={orders.find(o => o.id === trackingOrderId) || orders[0]}
            onBack={() => setPage('orders')}
            onAdvanceStage={advanceOrderStage}
            openProduct={open}
          />
        )}

        {page === 'wishlist' && (
          <>
            <div className="title">
              <div>
                <small>SAVED</small>
                <h2>Wishlist</h2>
              </div>
              <span>{wish.length} items</span>
            </div>
            {wish.length ? (
              <div className="grid">
                {wish.map((x, idx) => (
                  <Card key={x.id} p={x} index={idx} open={open} add={add} wish={wish} wishIt={wishIt} />
                ))}
              </div>
            ) : (
              <Empty />
            )}
          </>
        )}

        {page === 'categories' && (
          <div className="category">
            <h1>Shop by category</h1>
            <div className="catgrid">
              {cats.slice(1).map(c => (
                <button
                  key={c}
                  onClick={() => { setCat(c); setPriceFilter('all'); setPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <span className="catGridIcon">{getCategoryIcon(c)}</span>
                  {c.replaceAll('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Cart Drawer */}
      {cartOpen && (
        <Cart
          cart={cart}
          setCart={setCart}
          updateQty={updateCartQty}
          removeFromCart={removeFromCart}
          close={() => setCartOpen(false)}
          checkout={() => startCheckout(cart)}
          openProduct={p => { open(p); setCartOpen(false); }}
        />
      )}

      {/* Checkout / Delivery Form Modal */}
      {checkoutOpen && (
        <CheckoutModal
          items={checkoutItems}
          user={user}
          close={() => setCheckoutOpen(false)}
          onPlaceOrder={handlePlaceOrder}
        />
      )}

      {/* Order Confirmation Screen */}
      {confirmationOpen && confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          close={() => setConfirmationOpen(false)}
          onTrack={() => trackOrder(confirmedOrder.id)}
          onContinue={() => { setConfirmationOpen(false); setPage('home'); }}
        />
      )}

      {/* Auth Modal */}
      {auth && (
        <Auth
          close={() => setAuth(false)}
          login={u => {
            setUser(u);
            localStorage.setItem('user', JSON.stringify(u));
            setAuth(false);
            note('Welcome back, ' + u.name);
          }}
        />
      )}

      {/* API Gateway Console & Monitor Modal */}
      <GatewayDashboard
        isOpen={gatewayOpen}
        onClose={() => setGatewayOpen(false)}
      />

      {toast && <div className="toast">{toast}</div>}

      <button
        className={"floatCart" + (bump ? " bump" : "") + (cartCount ? " has" : "")}
        onClick={() => setCartOpen(true)}
        aria-label="Open cart"
      >
        <span className="fcIcon">🛒</span>
        {cartCount > 0 && <span className="fcCount">{cartCount}</span>}
        <span className="fcLabel">{bump ? 'Added to cart' : 'View cart'}</span>
      </button>
    </>
  );
}

export default App;
