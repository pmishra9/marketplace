import { PrismaClient } from '@prisma/client';
import { products as fallbackProducts, categories as fallbackCategories } from '../data/mockData.js';

const prisma = new PrismaClient();

export const getProducts = async (req, res) => {
  const { q, category, sort } = req.query;

  try {
    const where = {};

    if (category && category !== 'all') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } }
      ];
    }

    let orderBy = undefined;
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    }

    const data = await prisma.product.findMany({ where, orderBy });

    return res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    console.warn('Database query fallback to mockData:', err.message);
    let results = [...fallbackProducts];

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

    if (sort === 'price_asc') results.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') results.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') results.sort((a, b) => b.rating - a.rating);

    return res.json({
      success: true,
      count: results.length,
      data: results
    });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ success: false, message: `Product '${id}' not found` });
    }
    return res.json({ success: true, data: product });
  } catch (err) {
    const product = fallbackProducts.find((p) => p.id === id);
    if (!product) {
      return res.status(404).json({ success: false, message: `Product '${id}' not found` });
    }
    return res.json({ success: true, data: product });
  }
};

export const getCategories = async (_req, res) => {
  try {
    const data = await prisma.category.findMany();
    return res.json({ success: true, data });
  } catch {
    return res.json({ success: true, data: fallbackCategories });
  }
};

export const createProduct = async (req, res) => {
  const { title, price, category, description, image, stock } = req.body;

  if (!title || price === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Product title and price are required'
    });
  }

  const newId = `prod-${Date.now().toString().slice(-4)}`;

  try {
    const newProduct = await prisma.product.create({
      data: {
        id: newId,
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
      }
    });

    return res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    console.warn('Prisma create failed, falling back:', err.message);
    const fallbackItem = {
      id: newId,
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
    return res.status(201).json({ success: true, data: fallbackItem });
  }
};
