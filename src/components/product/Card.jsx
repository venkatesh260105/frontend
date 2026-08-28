import React from 'react';
import WishlistHeartIcon from '../icons/WishlistHeartIcon';
import { getINR, money } from '../../utils/helpers';

export function Card({ p, index = 0, open, add, wish, wishIt }) {
  const isLiked = wish.some(x => x.id === p.id);
  const inrPrice = getINR(p.price);
  const originalInr = p.discountPercentage > 0 ? Math.round(inrPrice / (1 - p.discountPercentage / 100)) : inrPrice;
  const styleVariant = (index % 6) + 1;

  return (
    <article className={`card card-style-${styleVariant}`}>
      <div className="pic" onClick={() => open(p)}>
        <img
          src={p.thumbnail}
          alt={p.title}
          loading="lazy"
          decoding="async"
          onError={e => {
            if (p.images && p.images[0] && e.target.src !== p.images[0]) {
              e.target.src = p.images[0];
            }
          }}
        />
        
        {/* Custom Redesigned Wishlist Button with SVG & Animation */}
        <button
          type="button"
          className={`wishlistBtn ${isLiked ? 'liked' : ''}`}
          onClick={e => {
            e.stopPropagation();
            wishIt(p);
          }}
          aria-label={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <WishlistHeartIcon liked={isLiked} />
        </button>

        {p.discountPercentage > 10 && (
          <label className="discountTag">-{Math.round(p.discountPercentage)}%</label>
        )}
      </div>

      <div className="body">
        <small className="cardCategory">{p.brand || p.category}</small>
        <h3 onClick={() => open(p)} title={p.title}>{p.title}</h3>
        <div className="rating">
          ★ {p.rating ? p.rating.toFixed(1) : '4.5'} <span>({p.stock} in stock)</span>
        </div>
        <div className="priceRow">
          <strong>{money(p.price)}</strong>
          {p.discountPercentage > 0 && <del>₹{originalInr.toLocaleString('en-IN')}</del>}
        </div>
        <button type="button" className="add" onClick={() => add(p)}>
          Add to cart
        </button>
      </div>
    </article>
  );
}

export default Card;
