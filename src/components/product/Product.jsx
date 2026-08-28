import React, { useEffect, useState } from 'react';
import WishlistHeartIcon from '../icons/WishlistHeartIcon';
import Card from './Card';
import { getINR, money } from '../../utils/helpers';

export function Product({ p, open, add, buyNow, wish, wishIt, related }) {
  const [selectedImg, setSelectedImg] = useState(p.images?.[0] || p.thumbnail);
  const isLiked = wish.some(x => x.id === p.id);
  const inrPrice = getINR(p.price);
  const originalInr = p.discountPercentage > 0 ? Math.round(inrPrice / (1 - p.discountPercentage / 100)) : inrPrice;

  useEffect(() => {
    setSelectedImg(p.images?.[0] || p.thumbnail);
  }, [p]);

  return (
    <div className="productViewWrap">
      <button className="back" onClick={() => window.history.back ? window.history.back() : window.scrollTo(0, 0)}>
        ← Continue shopping
      </button>
      
      <div className="product">
        <div className="productGallery">
          <div className="mainimg">
            <img
              src={selectedImg}
              alt={p.title}
              loading="eager"
              decoding="async"
              onError={e => {
                if (e.target.src !== p.thumbnail) {
                  e.target.src = p.thumbnail;
                }
              }}
            />
          </div>
          {p.images && p.images.length > 1 && (
            <div className="thumbRow">
              {p.images.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`thumbBtn ${selectedImg === img ? 'active' : ''}`}
                  onClick={() => setSelectedImg(img)}
                >
                  <img src={img} alt={`${p.title} preview ${idx + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="productInfo">
          <small className="productCategory">{p.brand || p.category}</small>
          <h1>{p.title}</h1>
          <div className="rating">★ {p.rating ? p.rating.toFixed(1) : '4.5'} · {p.stock} available in stock</div>
          <div className="priceGroup">
            <h2>{money(p.price)}</h2>
            {p.discountPercentage > 0 && <del>₹{originalInr.toLocaleString('en-IN')}</del>}
            {p.discountPercentage > 0 && <span className="saveBadge">Save {Math.round(p.discountPercentage)}%</span>}
          </div>
          <p className="productDesc">{p.description}</p>
          <div className="perks">
            <span>✓ Free Express Delivery Across India</span>
            <span>✓ 7-Day Hassle-Free Return Guarantee</span>
            <span>✓ 100% Authentic & Quality Inspected</span>
          </div>
          <div className="buyrow">
            <button className="add big" onClick={() => add(p)}>Add to cart</button>
            <button className="buy" onClick={() => buyNow({ ...p, qty: 1 })}>Buy now</button>
            <button
              className={`productWishBtn ${isLiked ? 'liked' : ''}`}
              onClick={() => wishIt(p)}
              aria-label={isLiked ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <WishlistHeartIcon liked={isLiked} />
              <span>{isLiked ? 'Saved' : 'Wishlist'}</span>
            </button>
          </div>
        </div>
      </div>

      {related && related.length > 0 && (
        <div className="relatedSection">
          <div className="title">
            <div>
              <small>RECOMMENDED</small>
              <h2>Related products</h2>
            </div>
          </div>
          <div className="grid">
            {related.map((x, idx) => (
              <Card key={x.id} p={x} index={idx} open={open} add={add} wish={wish} wishIt={wishIt} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Product;
