import { products, categories } from '../data/mockData.js';

let productList = [...products];

export const getProducts = (req, res) => {
  const { q, category, sort } = req.query;
  let results = [...productList];

  if (category && category !== 'all') {
    results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (q) {
    const term = q.toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
    );
  }

  if (sort === 'price_asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  }

  res.json({
    success: true,
    count: results.length,
    data: results
  });
};

export const getProductById = (req, res) => {
  const { id } = req.params;
  const product = productList.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: `Product with ID '${id}' not found`
    });
  }

  res.json({
    success: true,
    data: product
  });
};

export const getCategories = (_req, res) => {
  res.json({
    success: true,
    data: categories
  });
};

export const createProduct = (req, res) => {
  const { title, price, category, description, image, stock } = req.body;

  if (!title || price === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Product title and price are required'
    });
  }

  const newProduct = {
    id: `prod-${Date.now().toString().slice(-4)}`,
    title,
    description: description || '',
    price: Number(price),
    originalPrice: Number(price),
    category: category || 'accessories',
    rating: 5.0,
    reviewsCount: 1,
    stock: stock !== undefined ? Number(stock) : 10,
    badge: 'New',
    image: image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    featured: false
  };

  productList.unshift(newProduct);

  res.status(201).json({
    success: true,
    data: newProduct
  });
};
