// Clean Indian Currency (₹) formatting without decimals
export const getINR = n => Math.round(Number(n) > 500 ? Number(n) : Number(n) * 83.5);
export const money = n => '₹' + getINR(n).toLocaleString('en-IN');
