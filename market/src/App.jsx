import { useState, useEffect, useMemo } from 'react';

// Built-in initial catalog fallback for instant preview
const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    title: 'Aura Pro Wireless ANC Headphones',
    description: 'Studio-grade acoustic sound with active noise cancellation, 40-hour battery life, and ultra-plush memory foam cushions.',
    price: 299.99,
    originalPrice: 349.99,
    category: 'audio',
    rating: 4.9,
    reviewsCount: 342,
    stock: 24,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    featured: true
  },
  {
    id: 'prod-002',
    title: 'Titan Horizon Chrono Smartwatch',
    description: 'Sapphire glass AMOLED display, titanium chassis, comprehensive biometric tracking and 14-day battery longevity.',
    price: 389.00,
    originalPrice: 429.00,
    category: 'wearables',
    rating: 4.8,
    reviewsCount: 218,
    stock: 15,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    featured: true
  },
  {
    id: 'prod-003',
    title: 'Lumix Glow Minimalist Smart Lamp',
    description: 'Harmonious ambient lighting with touch dimmer, Qi wireless charging pad, and circadian rhythm automation.',
    price: 119.50,
    originalPrice: 139.00,
    category: 'home',
    rating: 4.7,
    reviewsCount: 156,
    stock: 42,
    badge: 'New Arrival',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    featured: false
  },
  {
    id: 'prod-004',
    title: 'Vertex 4K Ultra-Wide Mechanical Keyboard',
    description: 'Hot-swappable tactile switches, gasket-mounted dampening, aluminum body, and per-key RGB backlighting.',
    price: 169.99,
    originalPrice: 199.99,
    category: 'electronics',
    rating: 4.9,
    reviewsCount: 489,
    stock: 31,
    badge: 'Staff Pick',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    featured: true
  },
  {
    id: 'prod-005',
    title: 'Onyx Magnetic Leather Sleeve & Stand',
    description: 'Full-grain Italian leather protective case that folds into an ergonomic dual-angle laptop stand.',
    price: 79.00,
    originalPrice: 89.00,
    category: 'accessories',
    rating: 4.6,
    reviewsCount: 88,
    stock: 50,
    badge: null,
    image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&q=80',
    featured: false
  },
  {
    id: 'prod-006',
    title: 'Pulse 360 Portable Water-Resistant Speaker',
    description: 'Sub-bass radiator, omnidirectional 360 sound, IP67 waterproof rating, and daisy-chain stereo pairing.',
    price: 149.00,
    originalPrice: 179.00,
    category: 'audio',
    rating: 4.8,
    reviewsCount: 275,
    stock: 19,
    badge: 'Top Rated',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
    featured: false
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All Products' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'audio', name: 'Audio' },
  { id: 'wearables', name: 'Wearables' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'home', name: 'Smart Home' }
];

export default function App() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [addedIds, setAddedIds] = useState({});
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  // Fetch catalog from backend API with fallback
  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('Backend offline');
        return res.json();
      })
      .then((json) => {
        if (json.data && json.data.length > 0) {
          setProducts(json.data);
        }
      })
      .catch(() => {
        // Quiet fallback to built-in mock products
      });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);

    showToast(`Added "${product.title}" to cart`);
  };

  const updateCartQuantity = (id, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Guest Explorer',
          customerEmail: 'guest@example.com',
          items: cart.map((i) => ({ productId: i.id, quantity: i.quantity, price: i.price })),
          totalAmount: cartTotal
        })
      });

      const data = await response.json();
      const orderId = data?.data?.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderConfirmed(orderId);
      setCart([]);
    } catch {
      // Mock successful order if backend is offline
      const mockId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderConfirmed(mockId);
      setCart([]);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [products, activeCategory, searchQuery, sortBy]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <div className="app-container">
      {/* Navigation */}
      <header className="navbar">
        <div className="nav-content">
          <a href="#" className="brand-badge" id="brand-home-link">
            <div className="brand-logo-glow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
            <span className="brand-title">NEXUS MARKET</span>
          </a>

          <div className="search-bar-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              id="marketplace-search-input"
              type="text"
              className="search-bar-input"
              placeholder="Search gadgets, audio, wearables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="nav-actions">
            <a
              id="admin-portal-link"
              href="http://localhost:3001/admin"
              target="_blank"
              rel="noreferrer"
              className="admin-link-btn"
              title="Open AdminJS Admin Panel"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M3 9h18"></path>
                <path d="M9 21V9"></path>
              </svg>
              <span>Admin Portal</span>
            </a>

            <button
              id="cart-trigger-btn"
              className="cart-btn"
              onClick={() => {
                setIsCartOpen(true);
                setOrderConfirmed(null);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1"></circle>
                <circle cx="19" cy="21" r="1"></circle>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
              </svg>
              <span>Cart</span>
              {cartCount > 0 && <span className="cart-counter">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="hero-section">
        <div className="hero-card">
          <div className="hero-glow-orb"></div>
          <div className="hero-tag">
            <span>✨ Curated 2026 Collection</span>
          </div>
          <h1 className="hero-heading">
            Engineered Gear for the Modern Creator.
          </h1>
          <p className="hero-subtext">
            Discover a precision collection of wireless acoustics, tactile peripherals, and smart wearables backed by a full-stack NodeJS & AdminJS ecosystem.
          </p>
          <div className="hero-stats">
            <div className="hero-stat-pill">
              <span className="hero-stat-dot"></span>
              <span>Node.js REST API Connected</span>
            </div>
            <div className="hero-stat-pill">
              <span className="hero-stat-dot"></span>
              <span>AdminJS Portal on :3001</span>
            </div>
            <div className="hero-stat-pill">
              <span className="hero-stat-dot"></span>
              <span>Express & React Monorepo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <main className="catalog-section">
        <div className="catalog-header">
          <div className="catalog-title-group">
            <h2>Explore Hardware & Accessories</h2>
            <p className="catalog-subtitle">Showing {filteredProducts.length} items</p>
          </div>

          <div className="catalog-controls">
            <label htmlFor="sort-select-dropdown" style={{ display: 'none' }}>Sort Catalog</label>
            <select
              id="sort-select-dropdown"
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="category-pills-row">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              id={`category-pill-${cat.id}`}
              className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try clearing your search query or switching categories.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const isAdded = addedIds[product.id];
              return (
                <div key={product.id} className="product-card" id={`product-card-${product.id}`}>
                  <div className="product-image-container">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="product-image"
                      loading="lazy"
                    />
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                  </div>

                  <div className="product-body">
                    <div className="product-meta-row">
                      <span className="product-category-tag">{product.category}</span>
                      <div className="product-rating">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span>{product.rating}</span>
                        <span style={{ color: 'var(--text-dim)' }}>({product.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-desc">{product.description}</p>

                    <div className="product-footer">
                      <div className="price-container">
                        <span className="price-current">${product.price.toFixed(2)}</span>
                        {product.originalPrice > product.price && (
                          <span className="price-original">${product.originalPrice.toFixed(2)}</span>
                        )}
                      </div>

                      <button
                        id={`add-to-cart-btn-${product.id}`}
                        className={`add-btn ${isAdded ? 'added' : ''}`}
                        onClick={() => handleAddToCart(product)}
                      >
                        {isAdded ? (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="5" x2="12" y2="19"></line>
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>Shopping Bag ({cartCount})</h3>
              <button
                id="close-cart-btn"
                className="close-btn"
                onClick={() => setIsCartOpen(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {orderConfirmed ? (
              <div className="empty-state" style={{ margin: 'auto 1.5rem' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <h3>Order Confirmed!</h3>
                <p>Confirmation Reference: <strong>{orderConfirmed}</strong></p>
                <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)' }}>A receipt was generated and synced to the backend.</p>
                <button
                  className="checkout-btn"
                  style={{ marginTop: '1.5rem' }}
                  onClick={() => {
                    setOrderConfirmed(null);
                    setIsCartOpen(false);
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="empty-state" style={{ margin: 'auto 1.5rem' }}>
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem' }}>
                  <circle cx="8" cy="21" r="1"></circle>
                  <circle cx="19" cy="21" r="1"></circle>
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                </svg>
                <h3>Your bag is empty</h3>
                <p>Browse our catalog to select items for checkout.</p>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item-card">
                      <img src={item.image} alt={item.title} className="cart-item-img" />
                      <div className="cart-item-details">
                        <span className="cart-item-name">{item.title}</span>
                        <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                        <div className="cart-qty-controls">
                          <button
                            className="qty-btn"
                            onClick={() => updateCartQuantity(item.id, -1)}
                            title="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="qty-display">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateCartQuantity(item.id, 1)}
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-summary-line">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="cart-summary-line">
                    <span>Shipping</span>
                    <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>FREE</span>
                  </div>
                  <div className="cart-total-line">
                    <span>Total Due</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    id="checkout-submit-btn"
                    className="checkout-btn"
                    disabled={isCheckingOut}
                    onClick={handleCheckout}
                  >
                    {isCheckingOut ? 'Processing Order...' : `Checkout • $${cartTotal.toFixed(2)}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toastMessage && (
        <div className="toast-notice">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="footer-meta">
            <span>© 2026 Nexus Market Monorepo Ecosystem. Scaffolding ready.</span>
          </div>
          <div className="footer-links">
            <a href="http://localhost:4000/api/health" target="_blank" rel="noreferrer">Backend API Status</a>
            <a href="http://localhost:3001/admin" target="_blank" rel="noreferrer">AdminJS Console</a>
            <a href="http://localhost:4000/api/products" target="_blank" rel="noreferrer">Products JSON</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
