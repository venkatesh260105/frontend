import React from 'react';
import Empty from '../common/Empty';
import { getINR, money } from '../../utils/helpers';

export function OrderTracking({ order, onBack, onAdvanceStage, openProduct }) {
  if (!order) {
    return (
      <div className="trackingEmpty">
        <button className="back" onClick={onBack}>← Back to orders</button>
        <Empty />
      </div>
    );
  }

  const stages = [
    { title: 'Order Confirmed', desc: 'Order verified and confirmed', icon: '✓' },
    { title: 'Processing', desc: 'Packed at warehouse', icon: '📦' },
    { title: 'Shipped', desc: 'In transit with courier', icon: '🚚' },
    { title: 'Out for Delivery', desc: 'Driver out for delivery', icon: '🛵' },
    { title: 'Delivered', desc: 'Delivered to recipient', icon: '🏠' }
  ];

  const currentStage = order.status === 'Cancelled' ? -1 : (order.stageIndex || 0);

  return (
    <div className="trackingPage">
      <div className="trackingTopBar">
        <button className="back" onClick={onBack}>← Back to all orders</button>
        <div className="trackingStatusHeader">
          <div>
            <small>REAL-TIME TRACKING</small>
            <h1>Order #{order.id}</h1>
          </div>
          <span className={`trackingStatusBadge ${order.status === 'Cancelled' ? 'cancelled' : 'active'}`}>
            {order.status === 'Cancelled' ? '✕ Cancelled' : `● ${order.status}`}
          </span>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="timelineCard">
        <h3>Order Progress</h3>
        
        {order.status === 'Cancelled' ? (
          <div className="cancelledBanner">
            <span>✕ This order was cancelled on {order.cancelledAt || order.date}</span>
          </div>
        ) : (
          <>
            <div className="timelineTrack">
              {stages.map((stage, idx) => {
                const isCompleted = idx <= currentStage;
                const isCurrent = idx === currentStage;

                return (
                  <div
                    key={idx}
                    className={`timelineStep ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                  >
                    <div className="stepIconWrapper">
                      <div className="stepIcon">{isCompleted ? stage.icon : idx + 1}</div>
                      {idx < stages.length - 1 && (
                        <div className={`stepConnector ${idx < currentStage ? 'filled' : ''}`} />
                      )}
                    </div>
                    <div className="stepInfo">
                      <b className="stepTitle">{stage.title}</b>
                      <small className="stepDesc">{stage.desc}</small>
                      {isCurrent && <span className="currentStepTag">Active Stage</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Tracking Progression Demo Control */}
            {currentStage < stages.length - 1 && (
              <div className="advanceStageDemo">
                <span>Demo tracking simulator:</span>
                <button
                  className="advanceBtn"
                  onClick={() => onAdvanceStage(order.id)}
                >
                  ⚡ Advance to next stage ({stages[currentStage + 1].title})
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details & Delivery Information Grid */}
      <div className="trackingDetailsGrid">
        <div className="trackingItemsCard">
          <h3>Items in this Shipment ({order.items?.length || 0})</h3>
          <div className="trackingItemList">
            {order.items?.map((item, idx) => (
              <div key={idx} className="trackingItemRow" onClick={() => openProduct(item)}>
                <img src={item.thumbnail} alt={item.title} />
                <div className="trackingItemInfo">
                  <b>{item.title}</b>
                  <span className="trackingItemQty">{money(item.price)} × {item.qty}</span>
                </div>
                <strong className="trackingItemSubtotal">{money(getINR(item.price) * item.qty)}</strong>
              </div>
            ))}
          </div>
          <div className="trackingTotalBreakdown">
            <div className="tbRow">
              <span>Subtotal</span>
              <span>₹{Number(order.total).toLocaleString('en-IN')}</span>
            </div>
            <div className="tbRow">
              <span>Express Delivery</span>
              <span className="freeGreen">FREE</span>
            </div>
            <div className="tbRow grandTotal">
              <b>Grand Total</b>
              <strong>₹{Number(order.total).toLocaleString('en-IN')}</strong>
            </div>
          </div>
        </div>

        <div className="trackingSideInfo">
          <div className="infoCard">
            <h3>Customer Details</h3>
            <p><b>Name:</b> {order.customer?.name || 'Customer'}</p>
            <p><b>Email:</b> {order.customer?.email || 'N/A'}</p>
            <p><b>Phone:</b> +91 {order.customer?.phone || 'N/A'}</p>
          </div>

          <div className="infoCard">
            <h3>Delivery Address</h3>
            <p className="addrStreet">{order.shipping?.address || 'Standard Address'}</p>
            <p>{order.shipping?.city}, {order.shipping?.state} - {order.shipping?.pincode}</p>
            <p>{order.shipping?.country || 'India'}</p>
            {order.shipping?.landmark && <p className="landmark"><b>Landmark:</b> {order.shipping.landmark}</p>}
          </div>

          <div className="infoCard paymentCard">
            <h3>Payment Status</h3>
            <div className="payBadge">✓ 100% Protected Demo Payment</div>
            <small>Order placed on {order.date}</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderTracking;
