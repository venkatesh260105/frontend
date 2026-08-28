import React from 'react';
import Empty from '../common/Empty';
import { getINR, money } from '../../utils/helpers';
import { downloadOrdersJSON, downloadSingleOrderJSON } from '../../utils/storage';

export function Orders({ orders, cancelOrder, onTrackOrder, onAdvanceStage }) {
  return (
    <div className="orders">
      <div className="title">
        <div>
          <small>ACCOUNT</small>
          <h2>Your orders</h2>
        </div>
        <span>{orders.length} orders placed</span>
      </div>

      {/* JSON File Storage & Export Information Bar */}
      <div className="ordersStorageCard">
        <div className="storageInfoLeft">
          <div className="storageBadge">
            <span className="dot"></span> Live Saved in: <code>src/storage.json</code>
          </div>
          <p className="storageSub">
            Only your placed order details & items are saved into <b>src/storage.json</b>
          </p>
        </div>
        <div className="storageActionsRight">
          <button 
            className="jsonExportBtn primary" 
            onClick={downloadOrdersJSON}
            title="Download all orders as a clean JSON file"
          >
            📥 Download Orders (JSON)
          </button>
        </div>
      </div>

      {orders.map(o => (
        <div className="order" key={o.id}>
          <div className="orderTop">
            <div>
              <b>Order #{String(o.id)}</b>
              <span>Placed on {o.date}</span>
            </div>
            <div className="orderTopRight">
              <button 
                className="receiptJsonBtn" 
                onClick={() => downloadSingleOrderJSON(o)} 
                title="Download this order invoice as JSON"
              >
                📄 JSON Receipt
              </button>
              <em className={o.status === 'Cancelled' ? 'cancelled' : ''}>
                {o.status === 'Cancelled' ? '✕ Cancelled' : `✓ ${o.status}`}
              </em>
            </div>
          </div>

          <div className="orderItemsList">
            {o.items.map((x, idx) => (
              <div className="orderitem" key={idx}>
                <img src={x.thumbnail} alt={x.title} loading="lazy" />
                <div className="orderItemMeta">
                  <b>{x.title}</b>
                  <small>{money(x.price)} × {x.qty} = {money(getINR(x.price) * x.qty)}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="orderBottom">
            <div>
              <span className="orderTotalLabel">Total Amount: </span>
              <strong>₹{Number(o.total).toLocaleString('en-IN')}</strong>
            </div>

            <div className="orderActionsRow">
              <button className="trackBtn" onClick={() => onTrackOrder(o.id)}>
                📍 Track Order
              </button>
              {o.status !== 'Cancelled' && (
                <button className="cancelBtn" onClick={() => cancelOrder(o.id)}>Cancel order</button>
              )}
            </div>
          </div>
        </div>
      ))}
      {!orders.length && <Empty />}
    </div>
  );
}

export default Orders;
