import React from 'react';
import WishlistHeartIcon from '../icons/WishlistHeartIcon';

export function Header({
  setPage,
  setCat,
  setPriceFilter,
  q,
  setQ,
  searchFocused,
  setSearchFocused,
  theme,
  toggleTheme,
  wishCount,
  cartCount,
  user,
  setUser,
  setAuth,
  setCartOpen,
  setGatewayOpen,
  note
}) {
  return (
    <header>
      <button className="hamb" onClick={() => setPage('categories')} aria-label="Open categories menu">☰</button>
      <div className="logo" onClick={() => { setCat('all'); setPriceFilter('all'); setPage('home'); }}>shopkart<span>+</span></div>

      <div className={"search" + (searchFocused ? " expand" : "")}>
        <span className="searchIcon">⌕</span>
        <input
          value={q}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          onChange={e => { setQ(e.target.value); setPage('home'); }}
          placeholder="Search for products, brands and more..."
        />
        {q && <button className="clearSearch" onClick={() => setQ('')} aria-label="Clear search">×</button>}
      </div>

      <nav>
        {/* Enhanced Day/Night Celestial Switcher with Animation */}
        <button
          className={`celestialSwitch ${theme}`}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Daylight Mode ☀️' : 'Switch to Cyber Night Mode 🌙'}
          aria-label="Toggle dark/light theme"
        >
          <div className="switchTrack">
            <div className="celestialOrb">
              <span className="sunIcon">☀️</span>
              <span className="moonIcon">🌙</span>
            </div>
            <div className="starField">
              <i className="star s1">✦</i>
              <i className="star s2">·</i>
            </div>
          </div>
          <small className="switchLabel">{theme === 'dark' ? 'Night' : 'Day'}</small>
        </button>

        <button className="iconBtn gwNavBtn" onClick={() => setGatewayOpen && setGatewayOpen(true)} title="Open API Gateway System Monitor & 6 Tables" aria-label="Open API Gateway Console">
          <span className="gwNavBadge">🛡️</span>
          <small className="gwNavText">Gateway</small>
        </button>

        <button className="iconBtn" onClick={() => setPage('orders')} aria-label="View orders">
          <span>📦</span>
          <small>Orders</small>
        </button>
        <button className="iconBtn wishlistNavBtn" onClick={() => setPage('wishlist')} aria-label="View wishlist">
          <span className="navWishIcon">
            <WishlistHeartIcon liked={wishCount > 0} />
          </span>
          <small>Wishlist {wishCount > 0 ? `(${wishCount})` : ''}</small>
        </button>
        <button className="iconBtn cartNavBtn" onClick={() => setCartOpen(true)} aria-label="Open cart">
          <span>🛒</span>
          <small>Cart {cartCount > 0 ? `(${cartCount})` : ''}</small>
        </button>
        {user ? (
          <div className="userProfile">
            <span className="welcomeUser">Hi, {user.name}</span>
            <button className="logoutBtn" onClick={() => { setUser(null); localStorage.removeItem('user'); note('Logged out'); }}>Logout</button>
          </div>
        ) : (
          <button className="loginHeader" onClick={() => setAuth(true)}>Login</button>
        )}
      </nav>
    </header>
  );
}

export default Header;
