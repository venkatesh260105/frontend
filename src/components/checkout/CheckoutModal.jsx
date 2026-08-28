import React, { useState } from 'react';
import { getINR } from '../../utils/helpers';

export function CheckoutModal({ items, user, close, onPlaceOrder }) {
  const total = items.reduce((s, x) => s + getINR(x.price) * x.qty, 0);

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    landmark: ''
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.fullName.trim()) return alert('Please enter your full name');
    if (!formData.email.trim() || !formData.email.includes('@')) return alert('Please enter a valid email address');
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) return alert('Please enter a valid 10-digit phone number');
    if (!formData.address.trim()) return alert('Please enter your delivery address');
    if (!formData.city.trim()) return alert('Please enter your city');
    if (!formData.state.trim()) return alert('Please enter your state');
    if (!/^\d{6}$/.test(formData.pincode.replace(/\D/g, ''))) return alert('Please enter a valid 6-digit Pincode');

    onPlaceOrder({
      customer: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone
      },
      shipping: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country,
        landmark: formData.landmark
      }
    });
  }

  return (
    <div className="overlay" onClick={close}>
      <div className="checkoutModal" onClick={e => e.stopPropagation()}>
        <button type="button" className="x" onClick={close} aria-label="Close checkout">×</button>
        
        <div className="checkoutHeader">
          <div className="logo">shopkart<span>+</span></div>
          <h2>Delivery & Order Details</h2>
          <p>Please enter your information to complete your order</p>
        </div>

        <form className="checkoutForm" onSubmit={handleSubmit}>
          <div className="formSection">
            <h3>Customer Information</h3>
            <div className="formGroup">
              <label>Full Name *</label>
              <input
                required
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="formRow">
              <div className="formGroup">
                <label>Email Address *</label>
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                />
              </div>
              <div className="formGroup">
                <label>Phone Number *</label>
                <input
                  required
                  inputMode="numeric"
                  maxLength="10"
                  name="phone"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                  placeholder="10-digit mobile number"
                />
              </div>
            </div>
          </div>

          <div className="formSection">
            <h3>Delivery Information</h3>
            <div className="formGroup">
              <label>Delivery Address *</label>
              <input
                required
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House / Flat No, Street, Area"
              />
            </div>

            <div className="formRow">
              <div className="formGroup">
                <label>City *</label>
                <input
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                />
              </div>
              <div className="formGroup">
                <label>State *</label>
                <input
                  required
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                />
              </div>
            </div>

            <div className="formRow">
              <div className="formGroup">
                <label>Pincode *</label>
                <input
                  required
                  inputMode="numeric"
                  maxLength="6"
                  name="pincode"
                  value={formData.pincode}
                  onChange={e => setFormData(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                  placeholder="6-digit pincode"
                />
              </div>
              <div className="formGroup">
                <label>Country *</label>
                <input
                  required
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                />
              </div>
            </div>

            <div className="formGroup">
              <label>Landmark (Optional)</label>
              <input
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="e.g. Near City Park / Opposite Metro Station"
              />
            </div>
          </div>

          {/* Order Summary in Modal */}
          <div className="checkoutSummaryBox">
            <div className="summaryRow">
              <span>Items Total ({items.reduce((s, x) => s + x.qty, 0)} items)</span>
              <strong>₹{total.toLocaleString('en-IN')}</strong>
            </div>
            <div className="summaryRow">
              <span>Express Delivery</span>
              <strong className="freeGreen">FREE</strong>
            </div>
            <div className="summaryRow totalRow">
              <span>Total Payable</span>
              <strong className="totalAccent">₹{total.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <button type="submit" className="loginPrimary placeOrderBtn">
            Place Order • ₹{total.toLocaleString('en-IN')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CheckoutModal;
