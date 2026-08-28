import React from 'react';
import Empty from '../common/Empty';
import { getINR, money } from '../../utils/helpers';

export function Cart({ cart, updateQty, removeFromCart, close, checkout, openProduct }) {
  const total = cart.reduce((s, x) => s + getINR(x.price) * x.qty, 0);

  return (
    <div className="overlay" onClick={close}>
      <aside onClick={e => e.stopPropagation()}>
        <div className="drawerHead">
          <h2>Your cart ({cart.reduce((s, x) => s + x.qty, 0)})</h2>
          <button onClick={close} aria-label="Close cart">×</button>
        </div>

        <div className="cartList">
          {cart.map(x => (
            <div className="cartitem" key={x.id}>
              <div className="cartitemImg" onClick={() => openProduct(x)}>
                <img src={x.thumbnail} alt={x.title} loading="lazy" />
              </div>
              <div className="cartitemDetails">
                <b onClick={() => openProduct(x)}>{x.title}</b>
                
                <div className="cartPriceBreakdown">
                  <span className="cartUnit">{money(x.price)} each</span>
                  <span className="cartSubtotal">Subtotal: <strong>{money(x.price * x.qty)}</strong></span>
                </div>

                <div className="qtyControlRow">
                  <div className="qtyStepper">
                    <button
                      type="button"
                      className="qtyStepBtn"
                      onClick={() => updateQty(x.id, x.qty - 1)}
                      disabled={x.qty <= 1}
                      aria-label="Decrease quantity"
                    >−</button>
                    <span className="qtyValue">{x.qty}</span>
                    <button
                      type="button"
                      className="qtyStepBtn"
                      onClick={() => updateQty(x.id, x.qty + 1)}
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                  <button
                    type="button"
                    className="removeItemBtn"
                    onClick={() => removeFromCart(x.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!cart.length && <Empty />}
        </div>

        {cart.length > 0 && (
          <div className="cartbottom">
            <div className="cartSummaryRows">
              <div className="cartSummaryLine">
                <span>Items Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="cartSummaryLine">
                <span>Shipping</span>
                <span className="freeTag">FREE</span>
              </div>
              <div className="cartTotalRow">
                <b>Total Amount</b>
                <strong>₹{total.toLocaleString('en-IN')}</strong>
              </div>
            </div>
            <button className="buy" onClick={checkout}>Proceed to Checkout</button>
          </div>
        )}
      </aside>
    </div>
  );
}

export default Cart;
