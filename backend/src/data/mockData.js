export const categories = [
  { id: 'all', name: 'All Products', icon: 'Grid' },
  { id: 'electronics', name: 'Electronics', icon: 'Laptop' },
  { id: 'audio', name: 'Audio & Sound', icon: 'Headphones' },
  { id: 'wearables', name: 'Smart Wearables', icon: 'Watch' },
  { id: 'accessories', name: 'Accessories', icon: 'Sparkles' },
  { id: 'home', name: 'Smart Home', icon: 'Home' }
];

export const brands = [
  'Aura',
  'Titan',
  'Lumix',
  'Vertex',
  'Onyx',
  'Pulse'
];

export const products = [
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

export const users = [
  {
    id: 'user-001',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    password: 'password123',
    savedPayments: [
      {
        id: 'pay-001',
        cardBrand: 'Visa',
        last4: '4242',
        cardholderName: 'Elena Rostova',
        expMonth: '12',
        expYear: '28',
        isDefault: true
      },
      {
        id: 'pay-002',
        cardBrand: 'Mastercard',
        last4: '8812',
        cardholderName: 'Elena Rostova',
        expMonth: '08',
        expYear: '27',
        isDefault: false
      }
    ]
  },
  {
    id: 'user-002',
    name: 'Marcus Sterling',
    username: 'marcus',
    email: 'marcus.s@example.com',
    password: 'password123',
    savedPayments: []
  },
  {
    id: 'user-003',
    name: 'Test Customer',
    username: 'testcustomer',
    email: 'customer@example.com',
    password: 'password123',
    savedPayments: []
  }
];

export const orders = [
  {
    id: 'ORD-9021',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@example.com',
    subtotal: 299.99,
    discountAmount: 0.0,
    taxAmount: 24.00,
    totalAmount: 323.99,
    paymentMethod: 'saved_card',
    cardLast4: '4242',
    isSubscription: false,
    receiptEmailed: true,
    status: 'delivered',
    createdAt: '2026-10-16T14:32:00Z',
    items: [
      { productId: 'prod-001', variant: 'Matte Obsidian', quantity: 1, price: 299.99 }
    ]
  },
  {
    id: 'ORD-9022',
    customerName: 'Marcus Sterling',
    customerEmail: 'marcus.s@example.com',
    subtotal: 468.00,
    discountAmount: 35.00,
    taxAmount: 34.64,
    totalAmount: 467.64,
    paymentMethod: 'card',
    cardLast4: '1099',
    isSubscription: false,
    receiptEmailed: true,
    status: 'processing',
    createdAt: '2026-10-18T09:15:00Z',
    items: [
      { productId: 'prod-002', variant: 'Raw Titanium', quantity: 1, price: 389.00 },
      { productId: 'prod-005', variant: 'Cognac Saddle', quantity: 1, price: 79.00 }
    ]
  }
];
