import React, { useRef } from 'react';
import Card from './Card';

export function CategoryRow({ title, items, open, add, wish, wishIt }) {
  const track = useRef(null);

  function scroll(dir) {
    track.current?.scrollBy({ left: dir * 328, behavior: 'smooth' });
  }

  function magnet(e) {
    const b = e.currentTarget, r = b.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.4, y = (e.clientY - r.top - r.height / 2) * 0.4;
    b.style.transform = `translate(${x}px, ${y}px)`;
  }

  function unmagnet(e) {
    e.currentTarget.style.transform = 'translate(0,0)';
  }

  if (!items || !items.length) return null;

  return (
    <section className="carouselSection">
      <div className="title">
        <div>
          <small>SHOP THE CATEGORY</small>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="carouselWrap">
        <button className="carArrow l" onMouseMove={magnet} onMouseLeave={unmagnet} onClick={() => scroll(-1)} aria-label="Previous">‹</button>
        <div className="carouselTrack" ref={track}>
          {items.map((x, idx) => (
            <div className="carCard" key={x.id}>
              <Card p={x} index={idx} open={open} add={add} wish={wish} wishIt={wishIt} />
            </div>
          ))}
        </div>
        <button className="carArrow r" onMouseMove={magnet} onMouseLeave={unmagnet} onClick={() => scroll(1)} aria-label="Next">›</button>
      </div>
    </section>
  );
}

export default CategoryRow;
