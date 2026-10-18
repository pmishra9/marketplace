import { useState, useEffect, useMemo, useRef } from 'react';

// Built-in initial catalog fallback
const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    title: 'Aura Pro Wireless ANC Headphones',
    brand: 'Aura',
    description: 'Studio-grade acoustic sound with active noise cancellation, 40-hour battery life, and ultra-plush memory foam cushions.',
    price: 299.99,
    originalPrice: 349.99,
    discountPercent: 14,
    category: 'audio',
    rating: 4.9,
    reviewsCount: 342,
    stock: 24,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    featured: true,
    variants: [
      { id: 'matte-obsidian', name: 'Matte Obsidian', inStock: true },
      { id: 'silver-platinum', name: 'Silver Platinum', inStock: true },
      { id: 'midnight-navy', name: 'Midnight Navy', inStock: true }
    ]
  },
  {
    id: 'prod-002',
    title: 'Titan Horizon Chrono Smartwatch',
    brand: 'Titan',
    description: 'Sapphire glass AMOLED display, titanium chassis, comprehensive biometric tracking and 14-day battery longevity.',
    price: 389.00,
    originalPrice: 429.00,
    discountPercent: 9,
    category: 'wearables',
    rating: 4.8,
    reviewsCount: 218,
    stock: 15,
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    featured: true,
    variants: [
      { id: 'raw-titanium', name: 'Raw Titanium', inStock: true },
      { id: 'stealth-dlc', name: 'Stealth DLC Black', inStock: true }
    ]
  },
  {
    id: 'prod-003',
    title: 'Lumix Glow Minimalist Smart Lamp',
    brand: 'Lumix',
    description: 'Harmonious ambient lighting with touch dimmer, Qi wireless charging pad, and circadian rhythm automation.',
    price: 119.50,
    originalPrice: 139.00,
    discountPercent: 14,
    category: 'home',
    rating: 4.7,
    reviewsCount: 156,
    stock: 42,
    badge: 'New Arrival',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    featured: false,
    variants: [
      { id: 'nordic-walnut', name: 'Nordic Walnut', inStock: true },
      { id: 'alabaster-white', name: 'Alabaster White', inStock: true }
    ]
  },
  {
    id: 'prod-004',
    title: 'Vertex 4K Ultra-Wide Mechanical Keyboard',
    brand: 'Vertex',
    description: 'Hot-swappable tactile switches, gasket-mounted dampening, aluminum body, and per-key RGB backlighting.',
    price: 169.99,
    originalPrice: 199.99,
    discountPercent: 15,
    category: 'electronics',
    rating: 4.9,
    reviewsCount: 489,
    stock: 31,
    badge: 'Staff Pick',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80',
    featured: true,
    variants: [
      { id: 'tactile-silent', name: 'Tactile Silent (Brown)', inStock: true },
      { id: 'linear-speed', name: 'Linear Speed (Red)', inStock: true },
      { id: 'clicky-crisp', name: 'Crisp Clicky (Blue)', inStock: true }
    ]
  },
  {
    id: 'prod-005',
    title: 'Onyx Magnetic Leather Sleeve & Stand',
    brand: 'Onyx',
    description: 'Full-grain Italian leather protective case that folds into an ergonomic dual-angle laptop stand.',
    price: 79.00,
    originalPrice: 89.00,
    discountPercent: 11,
    category: 'accessories',
    rating: 4.6,
    reviewsCount: 88,
    stock: 50,
    badge: null,
    image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&q=80',
    featured: false,
    variants: [
      { id: 'cognac-saddle', name: 'Cognac Saddle', inStock: true },
      { id: 'espresso-black', name: 'Espresso Black', inStock: true }
    ]
  },
  {
    id: 'prod-006',
    title: 'Pulse 360 Portable Water-Resistant Speaker',
    brand: 'Pulse',
    description: 'Sub-bass radiator, omnidirectional 360 sound, IP67 waterproof rating, and daisy-chain stereo pairing.',
    price: 149.00,
    originalPrice: 179.00,
    discountPercent: 17,
    category: 'audio',
    rating: 4.8,
    reviewsCount: 275,
    stock: 19,
    badge: 'Top Rated',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
    featured: false,
    variants: [
      { id: 'graphite-storm', name: 'Graphite Storm', inStock: true },
      { id: 'arctic-white', name: 'Arctic White', inStock: true },
      { id: 'forest-alpine', name: 'Forest Alpine', inStock: true }
    ]
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All Products' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'audio', name: 'Audio & Sound' },
  { id: 'wearables', name: 'Smart Wearables' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'home', name: 'Smart Home' }
];

const BRANDS = ['all', 'Aura', 'Titan', 'Lumix', 'Vertex', 'Onyx', 'Pulse'];

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const productPath = (product) => `/products/${encodeURIComponent(product.id)}/${slugify(product.title)}`;

const parseRoute = (pathname) => {
  const parts = pathname.split('/').filter(Boolean).map(decodeURIComponent);
  if (parts[0] === 'categories' && parts[1]) return { type: 'category', category: parts[1] };
  if (parts[0] === 'products' && parts[1]) return { type: 'product', productId: parts[1] };
  if (parts[0] === 'checkout') return { type: 'checkout' };
  return { type: 'home' };
};

export default function App() {
  // Catalog State
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname));
  const lastNonCheckoutPath = useRef(window.location.pathname === '/checkout' ? '/' : window.location.pathname);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeBrand, setActiveBrand] = useState('all');
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');

  // PDP Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pdpVariant, setPdpVariant] = useState(null);
  const [pdpQuantity, setPdpQuantity] = useState(1);
  const [isSubscribedOption, setIsSubscribedOption] = useState(false);

  // Cart & Drawer State
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Checkout & Customer Flow State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [authTab, setAuthTab] = useState('signup'); // 'signup' | 'signin' | 'authenticated'
  const [authFormData, setAuthFormData] = useState({ name: '', username: '', email: '', password: '' });
  const [paymentChoice, setPaymentChoice] = useState('new'); // 'saved' | 'new'
  const [selectedSavedCardId, setSelectedSavedCardId] = useState('');
  const [newCardData, setNewCardData] = useState({
    number: '',
    cardholderName: '',
    exp: '',
    cvc: '',
    saveForFuture: true
  });
  const [showConfirmPrompt, setShowConfirmPrompt] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const navigate = (path, replace = false) => {
    if (window.location.pathname !== path) {
      if (replace) window.history.replaceState({}, '', path);
      else window.history.pushState({}, '', path);
    }
    setRoute(parseRoute(path));
  };

  const openCheckout = () => {
    setConfirmedOrder(null);
    navigate('/checkout');
  };

  const closeCheckout = () => {
    navigate(lastNonCheckoutPath.current || '/', true);
  };

  // Fetch live products from backend
  useEffect(() => {
    fetch('/api/products')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data?.length > 0) {
          setProducts(json.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handlePopState = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (route.type !== 'checkout') {
      lastNonCheckoutPath.current = window.location.pathname;
    }
    setIsCheckoutOpen(route.type === 'checkout');

    if (route.type === 'category') {
      setActiveCategory(route.category);
    } else if (route.type === 'home') {
      setActiveCategory('all');
    }
  }, [route]);

  useEffect(() => {
    if (route.type !== 'product') {
      if (selectedProduct) setSelectedProduct(null);
      return;
    }
    if (selectedProduct?.id === route.productId) return;

    let cancelled = false;
    const product = products.find((item) => item.id === route.productId);
    const showProduct = (item) => {
      if (!item || cancelled) return;
      setSelectedProduct(item);
      setPdpVariant(item.variants?.[0]?.name || 'Standard');
      setPdpQuantity(1);
      setIsSubscribedOption(false);
    };

    if (product) {
      showProduct(product);
    } else {
      fetch(`/api/products/${encodeURIComponent(route.productId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => showProduct(json?.data))
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [route, products, selectedProduct]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Open Product Display Page
  const openPDP = (product) => {
    navigate(productPath(product));
  };

  const closePDP = () => {
    navigate(activeCategory === 'all' ? '/' : `/categories/${encodeURIComponent(activeCategory)}`, true);
  };

  // Add to Cart handler
  const handleAddToCart = (product, variantName = null, qty = 1, isSub = false) => {
    const chosenVariant = variantName || product.variants?.[0]?.name || 'Standard';
    const cartItemId = `${product.id}-${chosenVariant}-${isSub ? 'sub' : 'one'}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          cartItemId,
          chosenVariant,
          quantity: qty,
          isSubscription: isSub,
          price: isSub ? Number((product.price * 0.9).toFixed(2)) : product.price
        }
      ];
    });

    showToast(`Added ${qty}x ${product.title} (${chosenVariant}) to cart`);
  };

  // Direct checkout from PDP
  const handleBuyNowDirect = (product, variantName, qty, isSub = false) => {
    handleAddToCart(product, variantName, qty, isSub);
    closePDP();
    setIsCartOpen(false);
    openCheckout();
  };

  // Update Cart Quantities
  const updateCartQuantity = (cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const next = item.quantity + delta;
            return next > 0 ? { ...item, quantity: next } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Customer Auth Submissions
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = authTab === 'signup' ? '/api/auth/signup' : '/api/auth/signin';
    const payload = authTab === 'signup'
      ? authFormData
      : { username: authFormData.username, password: authFormData.password };
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.message || 'Unable to authenticate. Please check your details and try again.');
      }
      setCurrentUser(data.user);
      setSelectedSavedCardId(data.user.savedPayments?.find((payment) => payment.isDefault)?.id || data.user.savedPayments?.[0]?.id || '');
      setPaymentChoice(data.user.savedPayments?.length ? 'saved' : 'new');
      showToast(`Welcome, ${data.user.name}!`);
    } catch (error) {
      showToast(error.message || 'Unable to reach the account service. Please try again.');
    }
  };

  // Order Placement
  const handleFinalOrderPlacement = async () => {
    if (!currentUser) {
      showToast('Sign in or create an account before placing your order.');
      return;
    }

    const selectedCard = currentUser.savedPayments?.find((p) => p.id === selectedSavedCardId);
    const cardNumber = newCardData.number.replace(/\D/g, '');
    if (paymentChoice === 'saved' && !selectedCard) {
      showToast('Choose a saved payment method or enter a new card.');
      return;
    }
    if (paymentChoice === 'new' && (cardNumber.length < 12 || cardNumber.length > 19 || !/^\d{2}\/\d{2}$/.test(newCardData.exp) || !/^\d{3,4}$/.test(newCardData.cvc) || !newCardData.cardholderName.trim())) {
      showToast('Enter a valid cardholder name, card number, expiry date, and CVC.');
      return;
    }

    setIsSubmittingOrder(true);
    setShowConfirmPrompt(false);

    const cardLast4 = paymentChoice === 'saved' ? selectedCard.last4 : cardNumber.slice(-4);
    const paymentMethodName = paymentChoice === 'saved' ? `Saved Card (${selectedCard?.cardBrand || 'Card'})` : 'Credit Card';

    const orderPayload = {
      customerName: currentUser?.name || 'Guest Explorer',
      customerEmail: currentUser?.email || 'guest@example.com',
      userId: currentUser?.id,
      items: cart.map((i) => ({
        productId: i.id,
        variant: i.chosenVariant,
        quantity: i.quantity,
        price: i.price
      })),
      subtotal: cartTotals.subtotal,
      discountAmount: cartTotals.discountTotal,
      taxAmount: cartTotals.tax,
      totalAmount: cartTotals.total,
      paymentMethod: paymentMethodName,
      cardLast4,
      isSubscription: cart.some((i) => i.isSubscription),
      savePayment: paymentChoice === 'new' && newCardData.saveForFuture,
      cardDetails: paymentChoice === 'new' ? {
        brand: 'Visa',
        last4: cardLast4,
        cardholderName: newCardData.cardholderName || currentUser.name,
        expMonth: newCardData.exp.slice(0, 2),
        expYear: newCardData.exp.slice(3)
      } : undefined
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (!res.ok || !data.data) {
        throw new Error(data.message || 'The order could not be placed. Please try again.');
      }
      const confirmed = data.data;
      setConfirmedOrder(confirmed);
      setCart([]);
    } catch (error) {
      showToast(error.message || 'Unable to reach the order service. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Filter and Sort Catalog
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category Filter
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // Brand Filter
    if (activeBrand !== 'all') {
      list = list.filter((p) => (p.brand || '').toLowerCase() === activeBrand.toLowerCase());
    }

    // Discount Filter
    if (onlyDiscounted) {
      list = list.filter((p) => (p.discountPercent || 0) > 0 || (p.originalPrice && p.originalPrice > p.price));
    }

    // Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'relevance') {
      const query = searchQuery.trim().toLowerCase();
      const relevanceScore = (product) => {
        if (!query) return 0;
        const title = String(product.title || '').toLowerCase();
        const brand = String(product.brand || '').toLowerCase();
        const category = String(product.category || '').toLowerCase();
        const description = String(product.description || '').toLowerCase();
        if (title === query) return 100;
        if (title.startsWith(query)) return 80;
        if (title.includes(query)) return 60;
        if (brand.includes(query)) return 30;
        if (category.includes(query)) return 20;
        if (description.includes(query)) return 10;
        return 0;
      };

      list.sort((a, b) =>
        relevanceScore(b) - relevanceScore(a) ||
        Number(b.featured) - Number(a.featured) ||
        (b.rating || 0) - (a.rating || 0)
      );
    }

    return list;
  }, [products, activeCategory, activeBrand, onlyDiscounted, searchQuery, sortBy]);

  // Cart Calculations
  const cartTotals = useMemo(() => {
    const rawSubtotal = cart.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
    const effectiveSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const savings = Math.max(0, rawSubtotal - effectiveSubtotal);
    const tax = Number((effectiveSubtotal * 0.085).toFixed(2));
    const total = Number((effectiveSubtotal + tax).toFixed(2));
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      rawSubtotal: Number(rawSubtotal.toFixed(2)),
      subtotal: Number(effectiveSubtotal.toFixed(2)),
      discountTotal: Number(savings.toFixed(2)),
      tax,
      total,
      totalItems
    };
  }, [cart]);

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="nav-content">
          <a
            href="/"
            className="brand-badge"
            id="brand-home-link"
            onClick={(event) => {
              event.preventDefault();
              navigate('/');
            }}
          >
            <div className="brand-logo-glow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
            <span className="brand-title">NEXUS MARKET</span>
          </a>

          {/* Search bar */}
          <div className="search-bar-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              id="marketplace-search-input"
              type="text"
              className="search-bar-input"
              placeholder="Search by product name, brand, or specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Nav Actions */}
          <div className="nav-actions">
            {currentUser ? (
              <button
                className="user-account-badge"
                onClick={() => {
                  openCheckout();
                  setAuthTab('authenticated');
                }}
                title="Customer Profile & Saved Payments"
              >
                <div className="user-avatar-circle">{currentUser.name[0]}</div>
                <span>{currentUser.name}</span>
              </button>
            ) : (
              <button
                className="user-account-badge"
                onClick={() => {
                  openCheckout();
                  setAuthTab('signin');
                }}
              >
                <span>Sign In</span>
              </button>
            )}

            <button
              id="cart-trigger-btn"
              className="cart-btn"
              onClick={() => setIsCartOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1"></circle>
                <circle cx="19" cy="21" r="1"></circle>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
              </svg>
              <span>Cart</span>
              {cartTotals.totalItems > 0 && <span className="cart-counter">{cartTotals.totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-card">
          <div className="hero-glow-orb"></div>
          <div className="hero-tag">
            <span>✨ 2026 Collection • Product Variants & Direct Checkout</span>
          </div>
          <h1 className="hero-heading">
            Precision Gear for Creators & Engineers.
          </h1>
          <p className="hero-subtext">
            Explore premium acoustics, mechanical hardware, and smart chronographs with customizable variants, subscription savings, and instant checkout.
          </p>
          <div className="hero-stats">
            <div className="hero-stat-pill">
              <span className="hero-stat-dot"></span>
              <span>PostgreSQL & Prisma Sync</span>
            </div>
            <div className="hero-stat-pill">
              <span className="hero-stat-dot"></span>
              <span>Multiple Product Variants</span>
            </div>
            <div className="hero-stat-pill">
              <span className="hero-stat-dot"></span>
              <span>Itemized Order Receipts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Section */}
      <main className="catalog-section">
        {/* Category Pills Row */}
        <div className="category-pills-row">
          {CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              id={`category-pill-${cat.id}`}
              href={cat.id === 'all' ? '/' : `/categories/${encodeURIComponent(cat.id)}`}
              className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                event.preventDefault();
                navigate(cat.id === 'all' ? '/' : `/categories/${encodeURIComponent(cat.id)}`);
              }}
            >
              <span>{cat.name}</span>
            </a>
          ))}
        </div>

        {/* Filters & Sorting Toolbar */}
        <div className="filters-toolbar">
          <div className="filters-row">
            {/* Brand Filter */}
            <div className="brand-pills-wrap">
              <span className="filters-group-label">Brand:</span>
              {BRANDS.map((b) => (
                <button
                  key={b}
                  id={`filter-brand-${b}`}
                  className={`brand-pill ${activeBrand === b ? 'active' : ''}`}
                  onClick={() => setActiveBrand(b)}
                >
                  {b === 'all' ? 'All Brands' : b}
                </button>
              ))}
            </div>

            {/* Discount Filter Toggle */}
            <button
              id="filter-discount-toggle"
              className={`discount-toggle-btn ${onlyDiscounted ? 'active' : ''}`}
              onClick={() => setOnlyDiscounted(!onlyDiscounted)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="5" x2="5" y2="19"></line>
                <circle cx="6.5" cy="6.5" r="2.5"></circle>
                <circle cx="17.5" cy="17.5" r="2.5"></circle>
              </svg>
              <span>{onlyDiscounted ? 'Discounted Only (Active)' : 'Show Discounts Only'}</span>
            </button>

            {/* Sorting Dropdown */}
            <div className="catalog-controls">
              <span className="filters-group-label">Sort:</span>
              <select
                id="sort-select-dropdown"
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid View */}
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try resetting filters or adjusting your search query.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                id={`product-card-${product.id}`}
                onClick={() => openPDP(product)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image-container">
                  <img src={product.image} alt={product.title} className="product-image" loading="lazy" />
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  {product.discountPercent > 0 && (
                    <span className="pdp-discount-badge" style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem' }}>
                      -{product.discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="product-body">
                  <div className="product-meta-row">
                    <span className="pdp-brand-tag" style={{ margin: 0 }}>{product.brand}</span>
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

                    <a
                      href={productPath(product)}
                      id={`pdp-view-btn-${product.id}`}
                      className="add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                        e.preventDefault();
                        openPDP(product);
                      }}
                    >
                      <span>View & Customize</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ==========================================================================
          Product Display Page (PDP) Modal
          ========================================================================== */}
      {selectedProduct && (
        <div className="pdp-backdrop" onClick={closePDP}>
          <div className="pdp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="pdp-close-btn" onClick={closePDP} title="Close Product Details">
              ✕
            </button>

            <div className="pdp-body">
              {/* Product Picture Column */}
              <div className="pdp-image-col">
                <div className="pdp-main-image-wrap">
                  <img src={selectedProduct.image} alt={selectedProduct.title} className="pdp-main-image" />
                </div>
              </div>

              {/* Product Information Column */}
              <div className="pdp-info-col">
                <span className="pdp-brand-tag">{selectedProduct.brand}</span>
                <h2 className="pdp-title">{selectedProduct.title}</h2>

                <div className="pdp-rating-row">
                  <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>★ {selectedProduct.rating}</span>
                  <span style={{ color: 'var(--text-dim)' }}>• {selectedProduct.reviewsCount} customer reviews</span>
                  <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>• In Stock ({selectedProduct.stock} left)</span>
                </div>

                <div className="pdp-price-row">
                  <span className="pdp-price-current">
                    ${(isSubscribedOption ? selectedProduct.price * 0.9 : selectedProduct.price).toFixed(2)}
                  </span>
                  {selectedProduct.originalPrice > selectedProduct.price && (
                    <span className="pdp-price-original">${selectedProduct.originalPrice.toFixed(2)}</span>
                  )}
                  {selectedProduct.discountPercent > 0 && (
                    <span className="pdp-discount-badge">Save {selectedProduct.discountPercent}%</span>
                  )}
                </div>

                <p className="pdp-description">{selectedProduct.description}</p>

                {/* Show Product Variants */}
                {selectedProduct.variants?.length > 0 && (
                  <div>
                    <div className="pdp-section-label">
                      <span>Select Variant / Finish:</span>
                      <strong style={{ color: 'var(--accent-cyan)' }}>{pdpVariant}</strong>
                    </div>
                    <div className="variant-chips">
                      {selectedProduct.variants.map((v) => (
                        <button
                          key={v.id}
                          className={`variant-chip ${pdpVariant === v.name ? 'active' : ''}`}
                          onClick={() => setPdpVariant(v.name)}
                        >
                          {v.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Update Product Quantity */}
                <div className="pdp-section-label">
                  <span>Quantity:</span>
                </div>
                <div className="qty-stepper">
                  <button
                    className="qty-step-btn"
                    onClick={() => setPdpQuantity((q) => Math.max(1, q - 1))}
                  >
                    -
                  </button>
                  <span className="qty-step-val">{pdpQuantity}</span>
                  <button
                    className="qty-step-btn"
                    onClick={() => setPdpQuantity((q) => q + 1)}
                  >
                    +
                  </button>
                </div>

                {/* PDP Action Buttons */}
                <div className="pdp-actions-row">
                  <button
                    id="pdp-add-to-cart-btn"
                    className="btn-add-cart-large"
                    onClick={() => {
                      handleAddToCart(selectedProduct, pdpVariant, pdpQuantity, isSubscribedOption);
                      closePDP();
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="8" cy="21" r="1"></circle>
                      <circle cx="19" cy="21" r="1"></circle>
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                    </svg>
                    <span>Add to Cart</span>
                  </button>

                  <button
                    id="pdp-buy-now-btn"
                    className="btn-checkout-direct"
                    onClick={() => handleBuyNowDirect(selectedProduct, pdpVariant, pdpQuantity, isSubscribedOption)}
                  >
                    <span>Checkout Now</span>
                  </button>
                </div>

                {/* Subscribe Button / Option */}
                <div className="subscribe-card">
                  <div className="subscribe-card-text">
                    <h4>
                      <span>🔄</span> Subscribe & Save 10%
                    </h4>
                    <p>Auto-delivers monthly. Skip or cancel anytime with 1 click.</p>
                  </div>
                  <button
                    className="btn-subscribe-toggle"
                    onClick={() => setIsSubscribedOption(!isSubscribedOption)}
                  >
                    {isSubscribedOption ? '✓ Subscribed' : 'Select Subscription'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
          Cart Drawer
          ========================================================================== */}
      {isCartOpen && (
        <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>Shopping Bag ({cartTotals.totalItems})</h3>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>✕</button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-state" style={{ margin: 'auto 1.5rem' }}>
                <h3>Your bag is empty</h3>
                <p>Browse the catalog and add products with custom variants.</p>
              </div>
            ) : (
              <>
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div key={item.cartItemId} className="cart-item-card">
                      <img src={item.image} alt={item.title} className="cart-item-img" />
                      <div className="cart-item-details">
                        <span className="cart-item-name">{item.title}</span>
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)' }}>
                          Variant: {item.chosenVariant}
                          {item.isSubscription && <span style={{ color: '#34d399', marginLeft: '0.5rem' }}>• Monthly Sub</span>}
                        </div>
                        <span className="cart-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                        <div className="cart-qty-controls">
                          <button className="qty-btn" onClick={() => updateCartQuantity(item.cartItemId, -1)}>-</button>
                          <span className="qty-display">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => updateCartQuantity(item.cartItemId, 1)}>+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-summary-line">
                    <span>Subtotal</span>
                    <span>${cartTotals.subtotal.toFixed(2)}</span>
                  </div>
                  {cartTotals.discountTotal > 0 && (
                    <div className="cart-summary-line" style={{ color: '#34d399' }}>
                      <span>Discounts & Savings</span>
                      <span>-${cartTotals.discountTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="cart-summary-line">
                    <span>Est. Tax (8.5%)</span>
                    <span>${cartTotals.tax.toFixed(2)}</span>
                  </div>
                  <div className="cart-total-line">
                    <span>Total Due</span>
                    <span>${cartTotals.total.toFixed(2)}</span>
                  </div>
                  <button
                    id="cart-proceed-checkout-btn"
                    className="checkout-btn"
                    onClick={() => {
                      setIsCartOpen(false);
                      openCheckout();
                    }}
                  >
                    Proceed to Checkout • ${cartTotals.total.toFixed(2)}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ==========================================================================
          Checkout Page & Flow Modal
          ========================================================================== */}
      {isCheckoutOpen && (
        <div className="checkout-backdrop" onClick={() => !isSubmittingOrder && closeCheckout()}>
          <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-header">
              <h2>Checkout & Payment</h2>
              <button
                className="close-btn"
                onClick={closeCheckout}
                disabled={isSubmittingOrder}
              >
                ✕
              </button>
            </div>

            {confirmedOrder ? (
              /* Order Confirmation Screen */
              <div className="order-success-screen">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="9 12 12 15 16 10"></polyline>
                </svg>
                <h3>Thank you, {confirmedOrder.customerName}!</h3>
                <p style={{ color: 'var(--text-muted)' }}>Order ID: <strong>{confirmedOrder.id}</strong></p>

                {/* Email Receipt Confirmation Badge */}
                <div className="receipt-email-pill">
                  <span>✉️</span>
                  <span>{confirmedOrder.receiptEmailed ? 'Receipt emailed to:' : 'Receipt prepared for:'} <strong>{confirmedOrder.customerEmail}</strong></span>
                </div>

                <div className="receipt-items-table">
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>Order Receipt Summary:</div>
                  <div className="price-breakdown-row">
                    <span>Payment Method:</span>
                    <strong style={{ color: 'var(--text-main)' }}>{confirmedOrder.paymentMethod} (ending in {confirmedOrder.cardLast4 || '4242'})</strong>
                  </div>
                  <div className="price-breakdown-row">
                    <span>Items Count:</span>
                    <span>{confirmedOrder.items?.length || 0} item(s)</span>
                  </div>
                  <div className="price-breakdown-row">
                    <span>Tax Paid:</span>
                    <span>${Number(confirmedOrder.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="price-breakdown-row" style={{ color: '#34d399' }}>
                    <span>Savings Applied:</span>
                    <span>-${Number(confirmedOrder.discountAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="price-breakdown-total" style={{ margin: 0 }}>
                    <span>Total Charged:</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>${Number(confirmedOrder.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  className="checkout-btn"
                  onClick={() => {
                    closeCheckout();
                    setConfirmedOrder(null);
                  }}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="checkout-content-grid">
                {/* Form Pane */}
                <div className="checkout-form-pane">
                  {/* Step 1: Customer Auth / Sign-up */}
                  <div className="checkout-section-block">
                    <div className="checkout-section-title">
                      <span>1. Customer Information</span>
                      {currentUser && (
                        <button
                          style={{ background: 'none', color: 'var(--accent-cyan)', fontSize: '0.8rem', cursor: 'pointer' }}
                          onClick={() => {
                            setCurrentUser(null);
                            setAuthTab('signin');
                          }}
                        >
                          Switch Account
                        </button>
                      )}
                    </div>

                    {!currentUser ? (
                      <div>
                        <div className="auth-toggle-bar">
                          <button
                            className={`auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`}
                            onClick={() => setAuthTab('signup')}
                          >
                            Sign Up
                          </button>
                          <button
                            className={`auth-tab-btn ${authTab === 'signin' ? 'active' : ''}`}
                            onClick={() => setAuthTab('signin')}
                          >
                            Sign In
                          </button>
                        </div>

                        <form onSubmit={handleAuthSubmit}>
                          {authTab === 'signup' && (
                            <div className="input-field-group">
                              <label>Full Name</label>
                              <input
                                type="text"
                                required
                                placeholder="Elena Rostova"
                                value={authFormData.name}
                                onChange={(e) => setAuthFormData({ ...authFormData, name: e.target.value })}
                              />
                            </div>
                          )}
                          <div className="input-field-group">
                            <label>{authTab === 'signup' ? 'Username' : 'Username or Email'}</label>
                            <input
                              type="text"
                              required
                              autoComplete="username"
                              minLength={authTab === 'signup' ? 3 : undefined}
                              maxLength={authTab === 'signup' ? 32 : 254}
                              pattern={authTab === 'signup' ? '[A-Za-z0-9_]{3,32}' : undefined}
                              placeholder={authTab === 'signup' ? 'rabi' : 'rabi'}
                              value={authFormData.username}
                              onChange={(e) => setAuthFormData({ ...authFormData, username: e.target.value })}
                            />
                          </div>
                          {authTab === 'signup' && (
                            <div className="input-field-group">
                              <label>Email Address</label>
                              <input
                                type="email"
                                required
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={authFormData.email}
                                onChange={(e) => setAuthFormData({ ...authFormData, email: e.target.value })}
                              />
                            </div>
                          )}
                          <div className="input-field-group">
                            <label>Password</label>
                            <input
                              type="password"
                              required
                              autoComplete={authTab === 'signup' ? 'new-password' : 'current-password'}
                              placeholder="••••••••"
                              value={authFormData.password}
                              onChange={(e) => setAuthFormData({ ...authFormData, password: e.target.value })}
                            />
                          </div>
                          <button type="submit" className="add-btn" style={{ width: '100%', marginTop: '0.5rem' }}>
                            {authTab === 'signup' ? 'Create Account & Continue' : 'Sign In & Continue'}
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="user-avatar-circle" style={{ width: '38px', height: '38px', fontSize: '1rem' }}>
                          {currentUser.name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{currentUser.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{currentUser.email}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Payment Method */}
                  {cart.length > 0 ? <div className="checkout-section-block">
                    <div className="checkout-section-title">
                      <span>2. Payment Information</span>
                    </div>

                    {/* Saved Payment selection if user has cards */}
                    {currentUser?.savedPayments?.length > 0 && (
                      <div className="saved-payments-container">
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                          Saved Payment Methods:
                        </div>
                        {currentUser.savedPayments.map((card) => (
                          <div
                            key={card.id}
                            className={`saved-payment-card ${paymentChoice === 'saved' && selectedSavedCardId === card.id ? 'selected' : ''}`}
                            onClick={() => {
                              setPaymentChoice('saved');
                              setSelectedSavedCardId(card.id);
                            }}
                          >
                            <div className="payment-card-left">
                              <span className="card-brand-badge">{card.cardBrand}</span>
                              <span>•••• {card.last4}</span>
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Exp {card.expMonth}/{card.expYear}</span>
                            </div>
                            <input
                              type="radio"
                              name="paymentRadio"
                              checked={paymentChoice === 'saved' && selectedSavedCardId === card.id}
                              onChange={() => {}}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New Card Option */}
                    <div
                      className={`saved-payment-card ${paymentChoice === 'new' ? 'selected' : ''}`}
                      onClick={() => setPaymentChoice('new')}
                      style={{ marginBottom: '1rem' }}
                    >
                      <div className="payment-card-left">
                        <span className="card-brand-badge">NEW</span>
                        <span>Use New Credit or Debit Card</span>
                      </div>
                      <input
                        type="radio"
                        name="paymentRadio"
                        checked={paymentChoice === 'new'}
                        onChange={() => {}}
                      />
                    </div>

                    {paymentChoice === 'new' && (
                      <div>
                        <div className="input-field-group">
                          <label>Cardholder Name</label>
                          <input
                            type="text"
                            autoComplete="cc-name"
                            placeholder="Elena Rostova"
                            value={newCardData.cardholderName}
                            onChange={(e) => setNewCardData({ ...newCardData, cardholderName: e.target.value })}
                          />
                        </div>
                        <div className="input-field-group">
                          <label>Card Number</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            placeholder="4242 4242 4242 4242"
                            value={newCardData.number}
                            onChange={(e) => setNewCardData({ ...newCardData, number: e.target.value })}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div className="input-field-group">
                            <label>Expiry Date</label>
                            <input
                              type="text"
                              autoComplete="cc-exp"
                              placeholder="MM/YY"
                              value={newCardData.exp}
                              onChange={(e) => setNewCardData({ ...newCardData, exp: e.target.value })}
                            />
                          </div>
                          <div className="input-field-group">
                            <label>CVC</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="cc-csc"
                              placeholder="123"
                              value={newCardData.cvc}
                              onChange={(e) => setNewCardData({ ...newCardData, cvc: e.target.value })}
                            />
                          </div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={newCardData.saveForFuture}
                            onChange={(e) => setNewCardData({ ...newCardData, saveForFuture: e.target.checked })}
                          />
                          <span>Save this card for faster future checkouts</span>
                        </label>
                      </div>
                    )}
                  </div> : (
                    <div className="checkout-section-block">
                      <p style={{ color: 'var(--text-muted)' }}>Add an item to your cart before continuing to checkout.</p>
                    </div>
                  )}
                </div>

                {/* Summary Pane */}
                <div className="checkout-summary-pane">
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Order Price Summary</div>

                  {/* Items list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto' }}>
                    {cart.length === 0 ? <span style={{ color: 'var(--text-muted)' }}>No items in your cart yet.</span> : cart.map((item) => (
                      <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                            Variant: {item.chosenVariant} (x{item.quantity})
                          </div>
                        </div>
                        <span style={{ fontWeight: 700 }}>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Breakdown & Taxes */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                    <div className="price-breakdown-row">
                      <span>Items Subtotal</span>
                      <span>${cartTotals.rawSubtotal.toFixed(2)}</span>
                    </div>
                    {cartTotals.discountTotal > 0 && (
                      <div className="price-breakdown-row discount-row">
                        <span>Discounts Applied</span>
                        <span>-${cartTotals.discountTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="price-breakdown-row tax-row">
                      <span>Estimated Tax (8.5%)</span>
                      <span>${cartTotals.tax.toFixed(2)}</span>
                    </div>
                    <div className="price-breakdown-row">
                      <span>Shipping</span>
                      <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>FREE</span>
                    </div>
                    <div className="price-breakdown-total">
                      <span>Total Amount to Pay</span>
                      <span>${cartTotals.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Prompt for Confirmation Button */}
                  <button
                    id="checkout-confirm-prompt-btn"
                    className="checkout-btn"
                    title={!currentUser ? 'Sign in or create an account to continue' : undefined}
                    disabled={!currentUser || cart.length === 0}
                    onClick={() => setShowConfirmPrompt(true)}
                  >
                    Review & Confirm Order • ${cartTotals.total.toFixed(2)}
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation Prompt Dialog (Modal Prompt) */}
            {showConfirmPrompt && (
              <div className="confirm-prompt-overlay">
                <div className="confirm-prompt-box">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem' }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <h3>Confirm Your Order</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.75rem 0 1rem' }}>
                    You are placing an order for <strong>${cartTotals.total.toFixed(2)}</strong> ({cartTotals.totalItems} item(s)).
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
                    Demo checkout records the order but does not process a card payment.
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--accent-emerald)' }}>
                    ✓ An itemized receipt will be generated for {currentUser?.email || 'your email'}.
                  </p>
                  <div className="confirm-prompt-actions">
                    <button
                      className="btn-prompt-cancel"
                      onClick={() => setShowConfirmPrompt(false)}
                      disabled={isSubmittingOrder}
                    >
                      Go Back
                    </button>
                    <button
                      id="btn-authorize-final-order"
                      className="btn-prompt-confirm"
                      onClick={handleFinalOrderPlacement}
                      disabled={isSubmittingOrder}
                    >
                      {isSubmittingOrder ? 'Processing...' : 'Place Demo Order'}
                    </button>
                  </div>
                </div>
              </div>
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
            <span>© 2026 Nexus Market Monorepo Ecosystem • Specifications Implemented.</span>
          </div>
          <div className="footer-links">
            <a href="http://localhost:4000/api/health" target="_blank" rel="noreferrer">Backend API Status</a>
            <a href="http://localhost:4000/api/products" target="_blank" rel="noreferrer">Products API</a>
            <a href="http://localhost:4000/api/products/brands" target="_blank" rel="noreferrer">Brands API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
