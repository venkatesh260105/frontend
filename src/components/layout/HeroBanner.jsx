import React from 'react';

export const defaultSlides = [
  ['Mega Electronics Sale', 'Up to 50% off on premium laptops & gadgets', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=80'],
  ['Fresh Fashion Deals', 'New trend styles starting from ₹499', 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80'],
  ['Home Essentials', 'Upgrade your living space for less', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80']
];

export function HeroBanner({ slides = defaultSlides, slide, setSlide, heroSideCats, setCat, setPage }) {
  return (
    <>
      <div className="heroContainer">
        <section className="heroGrid">
          <div className="heroMain">
            <img src={slides[slide][2]} alt={slides[slide][0]} />
            <div className="shade" />
            <div className="heroText">
              <small>LIMITED TIME OFFER</small>
              <h1>{slides[slide][0]}</h1>
              <p>{slides[slide][1]}</p>
              <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
                Shop deals →
              </button>
            </div>
            <button className="arr l" onClick={() => setSlide((slide + 2) % 3)} aria-label="Previous slide">‹</button>
            <button className="arr r" onClick={() => setSlide((slide + 1) % 3)} aria-label="Next slide">›</button>
            <div className="dots">
              {slides.map((_, i) => (
                <i key={i} className={i === slide ? 'on' : ''} onClick={() => setSlide(i)} />
              ))}
            </div>
          </div>
          <div className="heroSide">
            {heroSideCats.map(hc => (
              <button
                key={hc.cat}
                className="sideTile"
                style={{ backgroundImage: hc.img ? `url(${hc.img})` : 'none' }}
                onClick={() => { setCat(hc.cat); setPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                <span>{hc.cat.replaceAll('-', ' ')}</span>
                <em>Shop now →</em>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="trust">
        <b>🚚 Fast delivery<small>Eligible items across India</small></b>
        <b>↩️ Easy returns<small>Hassle-free 7-day policy</small></b>
        <b>🔒 Secure checkout<small>100% protected payments</small></b>
        <b>💬 24/7 support<small>Always ready to help</small></b>
      </section>
    </>
  );
}

export default HeroBanner;
