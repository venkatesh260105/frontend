import React from 'react';

export function OrderConfirmationModal({ order, close, onTrack, onContinue }) {
  return (
    <div className="overlay" onClick={close}>
      <div className="confirmationModal" onClick={e => e.stopPropagation()}>
        <div className="confirmSuccessIcon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>

        <h2>Order Placed Successfully!</h2>
        <div className="confirmOrderId">
          Order ID: <b>#{order.id}</b>
        </div>
        <p className="confirmMsg">
          Thank you for your order, <b>{order.customer?.name}</b>. We have received your order and are getting it ready for shipment.
        </p>

        <div className="confirmCardDetails">
          <div className="confirmLine">
            <span>Date & Time</span>
            <b>{order.date}</b>
          </div>
          <div className="confirmLine">
            <span>Delivery To</span>
            <b>{order.shipping?.address}, {order.shipping?.city} ({order.shipping?.pincode})</b>
          </div>
          <div className="confirmLine">
            <span>Total Amount</span>
            <strong>₹{Number(order.total).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="confirmActions">
          <button className="buy trackOrderBtn" onClick={onTrack}>
            Track Order →
          </button>
          <button className="continueShopBtn" onClick={onContinue}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationModal;
