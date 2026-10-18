export const categories = [
  { id: 'all', name: 'All Products', icon: 'Grid' },
  { id: 'electronics', name: 'Electronics', icon: 'Laptop' },
  { id: 'audio', name: 'Audio & Sound', icon: 'Headphones' },
  { id: 'wearables', name: 'Smart Wearables', icon: 'Watch' },
  { id: 'accessories', name: 'Accessories', icon: 'Sparkles' },
  { id: 'home', name: 'Smart Home', icon: 'Home' }
];

export const products = [
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

export const orders = [
  {
    id: 'ORD-9021',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@example.com',
    items: [
      { productId: 'prod-001', quantity: 1, price: 299.99 }
    ],
    totalAmount: 299.99,
    status: 'delivered',
    createdAt: '2026-10-16T14:32:00Z'
  },
  {
    id: 'ORD-9022',
    customerName: 'Marcus Sterling',
    customerEmail: 'marcus.s@example.com',
    items: [
      { productId: 'prod-002', quantity: 1, price: 389.00 },
      { productId: 'prod-005', quantity: 1, price: 79.00 }
    ],
    totalAmount: 468.00,
    status: 'processing',
    createdAt: '2026-10-18T09:15:00Z'
  }
];
