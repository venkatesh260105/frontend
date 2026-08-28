# 🌟 ShopKart+ Advanced — Quick Easy Reference (தமிழில் எளிய விளக்கம்)

Intha file-la ungaloda **ShopKart+** project-oda ella files & components-um romba easy-ah line number oda explain pannirukkom. Unga code-la edhuvume change pannala.

---

## 📁 File Structure Overview

1. [**`index.html`**](file:///c:/Users/Venkatesh%20K/Downloads/shopkart-advanced-premium-marketplace/frontend/index.html) -> Main web page skeleton & Dark/Light mode pre-loader.
2. [**`package.json`**](file:///c:/Users/Venkatesh%20K/Downloads/shopkart-advanced-premium-marketplace/frontend/package.json) -> Project libraries (React 18 + Vite).
3. [**`vite.config.js`**](file:///c:/Users/Venkatesh%20K/Downloads/shopkart-advanced-premium-marketplace/frontend/vite.config.js) -> Vite React bundler configuration.
4. [**`src/data/products.json`**](file:///c:/Users/Venkatesh%20K/Downloads/shopkart-advanced-premium-marketplace/frontend/src/data/products.json) -> Offline-la products display aagura local dataset.
5. [**`src/styles.css`**](file:///c:/Users/Venkatesh%20K/Downloads/shopkart-advanced-premium-marketplace/frontend/src/styles.css) -> Theme colors, Dark mode, Animations, Glassmorphism styles.
6. [**`src/App.jsx`**](file:///c:/Users/Venkatesh%20K/Downloads/shopkart-advanced-premium-marketplace/frontend/src/App.jsx) -> Complete React Application Logic & State Orchestrator.
7. [**`src/main.jsx`**](file:///c:/Users/Venkatesh%20K/Downloads/shopkart-advanced-premium-marketplace/frontend/src/main.jsx) -> Entry point mounting App.


---

## 🔍 `src/main.jsx` — Component-wise Breakdown

### 1. Helper Functions (Line 14 – Line 77)
- **`getINR(n)` (Line 14)**: Price-ah Indian Rupee (₹)-ku convert pannum (USD price * 83.5).
- **`money(n)` (Line 15)**: `₹1,24,999` nu Indian currency format-la comma pottu kaattum.
- **`getCategoryIcon(c)` (Line 17)**: Category-ku thagundhamari Emoji icon return pannum (laptop 💻, phone 📱, shoes 👟, etc.).
- **`WishlistHeartIcon` (Line 39)**: Heart icon SVG — like pannum bothu animated red-pink gradient fill aagum.
- **`api(p)` (Line 70)**: 1 minute-ku 40 requests mela poga koodathu nu protect panra rate-limited API caller.

---

### 2. `App` Main Container Component (Line 79 – Line 693)
Idhu thaan root component. Idhula irukkura main States:
- `p`: Products list (first `products.json`-la irundhu load aagum, appuram DummyJSON API-la sync aagum).
- `q`: Search box-la type panra text.
- `cat`: Select panna Category (`all`, `laptops`, `smartphones`, etc.).
- `cart`: Cart-la irukka items array (`localStorage`-la save aagum).
- `wish`: Wishlist-la irukka items array.
- `orders`: Order panna items history list.
- `user`: Logged-in user details (`null` na guest user).
- `page`: Ippo endha screen-la irukkom (`home`, `wishlist`, `orders`, `tracking`).
- `theme`: Dark mode ah illa Light mode ah nu manage pannum.

#### Important Functions in `App`:
- `add(x)`: Product-ah Cart-la add pannum.
- `wishIt(x)`: Wishlist-la add / remove (toggle) pannum.
- `handlePlaceOrder(details)`: Order place panni unique Order ID (`SK12345`) generate panni `orders` state-la podum.
- `advanceOrderStage(orderId)`: Order tracking-la stage-ah munnetra simulation button (`Confirmed` -> `Packed` -> `Shipped` -> `Out for Delivery` -> `Delivered`).
- `cancelOrder(id)`: Order-ah cancel panni status-ah update pannum.

---

### 3. `Card` Component (Line 695 – Line 750)
- Oru single product card.
- Image hover zoom effect, Rating star, INR price, Discount badge (`% OFF`), Wishlist Heart button, and "Add to Cart" button irukkum.

---

### 4. `CategoryRow` Component (Line 752 – Line 792)
- Horizontal-ah scroll aagura Category slider (left & right arrow buttons oda).

---

### 5. `Product` Single Product Detail Page (Line 794 – Line 891)
- Oru product-ah click pannum bothu open aagura Full Detail View.
- **Features**:
  - Image Gallery (Thumbnail click panna main image maarum).
  - ⭐ Ratings & Customer Reviews.
  - **Add to Cart** & **Buy Now** buttons.
  - Same category-la irukura **Related Products** carousel.

---

### 6. `Cart` Drawer Component (Line 893 – Line 974)
- Right side-la irundhu slide aagi vara cart panel.
- Item quantity increase `(+)` / decrease `(-)` / remove panra options.
- Order total calculation & "Proceed to Checkout" button.

---

### 7. `CheckoutModal` Component (Line 976 – Line 1172)
- Order place panra Checkout popup.
- **Inputs**: Name, Mobile, Address, City, Pincode.
- **Payment Options**: Cash on Delivery (COD), UPI (GPay/PhonePe), Cards / Netbanking.
- "Place Order" click panna `handlePlaceOrder()` call aagum.

---

### 8. `OrderConfirmationModal` Component (Line 1174 – Line 1222)
- Order successfully placed aana piragu vara Success Popup.
- Animated green tick, Order ID, and "Track Order" button.

---

### 9. `OrderTracking` Component (Line 1224 – Line 1368)
- 5-Stage Live Order Tracking Timeline:
  1. `Order Confirmed` 📦
  2. `Processing` 🏭
  3. `Shipped` 🚚
  4. `Out for Delivery` 🛵
  5. `Delivered` 🎉
- Idhula irukkura **"Advance Delivery Stage"** button-ah click panni real-time-la stages progress aaguradha test pannalam.

---

### 10. `Orders` Component (Line 1370 – Line 1425)
- "My Orders" screen.
- Past orders list, status badge, "Track Order" button & "Cancel Order" button.

---

### 11. `Auth` Component (Line 1427 – Line 1611)
- Login & Register modal.
- Form type panna thevai illama direct-ah **"1-Click Guest Demo Login"** button irukku.

---

### 12. `Empty` Component (Line 1613 – Line 1622)
- Cart, Wishlist, illa Search-la edhum illana "No items found" nu kaatura clean placeholder.

---

## 🎨 `src/styles.css` Overview

1. **Theme Colors (Lines 6 - 72)**:
   - `[data-theme="light"]`: Modern daylight white & soft blue.
   - `[data-theme="dark"]`: Cyber-luxe obsidian black with glowing borders.
2. **Glassmorphism**: Header and popups-ku `backdrop-filter: blur(16px)` use pannirukkom.
3. **Responsive Design**: Mobile, Tablet, and Desktop-ku thagundhamari automatic Grid & Flexbox layouts.
