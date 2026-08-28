export function getCategoryIcon(c) {
  const cat = (c || '').toLowerCase();
  if (cat === 'all') return '🏪';
  if (cat.includes('laptop')) return '💻';
  if (cat.includes('phone') || cat.includes('mobile') || cat.includes('smartphone')) return '📱';
  if (cat.includes('fragrance') || cat.includes('perfume')) return '🧴';
  if (cat.includes('beauty') || cat.includes('skin') || cat.includes('cosmetic')) return '💄';
  if (cat.includes('grocer') || cat.includes('food')) return '🛒';
  if (cat.includes('home') || cat.includes('furnitur') || cat.includes('decor')) return '🛋️';
  if (cat.includes('watch')) return '⌚';
  if (cat.includes('shirt') || cat.includes('dress') || cat.includes('top') || cat.includes('cloth') || cat.includes('fashion')) return '👕';
  if (cat.includes('shoe') || cat.includes('footwear')) return '👟';
  if (cat.includes('sunglass') || cat.includes('glass')) return '🕶️';
  if (cat.includes('jewel') || cat.includes('bag')) return '👜';
  if (cat.includes('tablet')) return '📲';
  if (cat.includes('motor') || cat.includes('auto') || cat.includes('vehicle')) return '🚗';
  if (cat.includes('light')) return '💡';
  if (cat.includes('sport')) return '⚽';
  if (cat.includes('kitchen')) return '🍳';
  return '📦';
}
