/**
 * API Gateway & ShopKart+ JSON Database Manager
 * Manages the 6 core database tables from the API Gateway System Design:
 * 1. Users
 * 2. APIs
 * 3. Requests
 * 4. Tokens
 * 5. Rate Limits
 * 6. Logs
 * + Plus Orders
 * 
 * Persists everything to `src/storage.json` through the Vite dev middleware.
 */

import { getINR } from './helpers.js';
import initialDb from '../storage.json' with { type: 'json' };

export const STORAGE_KEYS = {
  DATABASE: 'ag_gateway_db',
  ORDERS: 'orders'
};

// Safe localStorage reader
export function safeGetJSON(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

// Safe localStorage writer
export function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write failed:', e);
  }
}

// Clean order item to contain essential product order details
export function cleanOrderItem(item) {
  const price = getINR(item.price);
  const qty = Number(item.qty || item.quantity || 1);
  return {
    id: item.id,
    title: item.title || item.productName || '',
    price: price,
    qty: qty,
    total: price * qty,
    thumbnail: item.thumbnail || ''
  };
}

// Clean full order object
export function cleanOrderObject(order) {
  const items = (order.items || order.orderedProducts || []).map(cleanOrderItem);
  const total = order.total || order.totalAmount || items.reduce((s, x) => s + x.total, 0);

  return {
    id: order.id || order.orderId || '',
    date: order.date || order.orderDate || new Date().toLocaleString('en-IN'),
    status: order.status || order.orderStatus || 'Order Confirmed',
    stageIndex: order.stageIndex !== undefined ? order.stageIndex : 0,
    customer: {
      name: order.customer?.name || '',
      email: order.customer?.email || '',
      phone: order.customer?.phone || ''
    },
    shipping: {
      address: order.shipping?.address || order.shippingAddress?.address || '',
      city: order.shipping?.city || order.shippingAddress?.city || '',
      state: order.shipping?.state || order.shippingAddress?.state || '',
      pincode: order.shipping?.pincode || order.shippingAddress?.pincode || '',
      country: order.shipping?.country || order.shippingAddress?.country || 'India'
    },
    items: items,
    total: total
  };
}

// Get the full 6-table Gateway Database from localStorage or fallback to initial storage.json
export function getGatewayDatabase() {
  const localDb = safeGetJSON(STORAGE_KEYS.DATABASE, null);
  const localOrders = safeGetJSON(STORAGE_KEYS.ORDERS, null);

  let db = localDb || initialDb || {};

  // Ensure all 6 tables + orders exist
  db = {
    users: db.users || initialDb.users || [],
    apis: db.apis || initialDb.apis || [],
    tokens: db.tokens || initialDb.tokens || [],
    rate_limits: db.rate_limits || initialDb.rate_limits || [],
    requests: db.requests || initialDb.requests || [],
    logs: db.logs || initialDb.logs || [],
    orders: localOrders && localOrders.length > 0 ? localOrders.map(cleanOrderObject) : (db.orders || initialDb.orders || []).map(cleanOrderObject)
  };

  return db;
}

// Save complete gateway database
export function saveGatewayDatabase(db) {
  safeSetJSON(STORAGE_KEYS.DATABASE, db);
  if (db.orders) {
    safeSetJSON(STORAGE_KEYS.ORDERS, db.orders);
  }
  syncWithDiskStorage(db);
}

// Backwards-compatible orders database getter
export function getOrdersDatabase() {
  const db = getGatewayDatabase();
  return {
    orders: db.orders || []
  };
}

// Synchronize all 6 tables and orders directly to `src/storage.json` on disk
export async function syncWithDiskStorage(customDb = null) {
  const data = customDb || getGatewayDatabase();
  try {
    const response = await fetch('/api/save-storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data, null, 2)
    });
    if (response.ok) {
      // Synced successfully
    }
  } catch (err) {
    // Non-critical background sync
  }
  return data;
}

// Append a request and its log to the respective tables
export function recordGatewayActivity({ user_id = 'anonymous', api_id = 'api_01', endpoint = '/api/products', status = '200 OK', response_time_ms = 15, details = '' }) {
  const db = getGatewayDatabase();
  const timestamp = new Date().toISOString();
  const requestId = 'req_' + Math.random().toString(36).substring(2, 9);
  const logId = 'log_' + Math.random().toString(36).substring(2, 9);

  const requestRecord = {
    request_id: requestId,
    user_id: user_id,
    api_id: api_id,
    endpoint: endpoint,
    token_id: user_id !== 'anonymous' ? 'tok_' + user_id.slice(-4) : 'none',
    timestamp: timestamp,
    status: status
  };

  const logRecord = {
    log_id: logId,
    request_id: requestId,
    status: status,
    response_time_ms: Math.round(response_time_ms),
    created_at: timestamp,
    details: details || `Route ${endpoint} executed with status ${status}`
  };

  // Keep last 50 requests & logs for fast JSON performance
  db.requests = [requestRecord, ...(db.requests || [])].slice(0, 50);
  db.logs = [logRecord, ...(db.logs || [])].slice(0, 50);

  saveGatewayDatabase(db);
  return { requestRecord, logRecord };
}

// Download complete JSON database
export function downloadGatewayJSON() {
  const db = getGatewayDatabase();
  const timestamp = new Date().toISOString().slice(0, 10);
  return triggerJSONDownload(db, `api_gateway_database_${timestamp}.json`);
}

// Helper to trigger browser JSON file download
export function triggerJSONDownload(data, filename = 'storage.json') {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Download failed:', err);
    return false;
  }
}

// Download clean orders JSON file
export function downloadOrdersJSON() {
  const data = getOrdersDatabase();
  const timestamp = new Date().toISOString().slice(0, 10);
  return triggerJSONDownload(data, `orders_${timestamp}.json`);
}

// Download single order receipt JSON
export function downloadSingleOrderJSON(order) {
  const cleanOrder = cleanOrderObject(order);
  return triggerJSONDownload(cleanOrder, `order_${cleanOrder.id}.json`);
}

// Initialize on page load
export function initStorageHelpers() {
  if (typeof window === 'undefined') return;
  window.downloadOrders = downloadOrdersJSON;
  window.downloadGatewayDB = downloadGatewayJSON;
  window.syncDisk = syncWithDiskStorage;
  syncWithDiskStorage();
}
