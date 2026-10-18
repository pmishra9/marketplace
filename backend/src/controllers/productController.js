import { PrismaClient } from '@prisma/client';
import { products as fallbackProducts, categories as fallbackCategories, brands as fallbackBrands } from '../data/mockData.js';
import { normalizeUpc } from '../utils/upc.js';

const prisma = new PrismaClient();

export const getProducts = async (req, res) => {
  const { q, category, brand, discountOnly, sort } = req.query;

  try {
    const where = {};

    if (category && category !== 'all') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (brand && brand !== 'all') {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (discountOnly === 'true' || discountOnly === true) {
      where.discountPercent = { gt: 0 };
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } }
      ];
    }

    let orderBy = undefined;
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'name_asc') {
      orderBy = { title: 'asc' };
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

    if (brand && brand !== 'all') {
      results = results.filter((p) => (p.brand || '').toLowerCase() === brand.toLowerCase());
    }

    if (discountOnly === 'true' || discountOnly === true) {
      results = results.filter((p) => (p.discountPercent || 0) > 0 || (p.originalPrice && p.originalPrice > p.price));
    }

    if (q) {
      const term = q.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          (p.brand || '').toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      );
    }

    if (sort === 'price_asc') results.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') results.sort((a, b) => b.price - a.price);
    else if (sort === 'name_asc') results.sort((a, b) => a.title.localeCompare(b.title));
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

export const getBrands = async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      select: { brand: true },
      distinct: ['brand']
    });
    const brandsList = products.map((p) => p.brand).filter(Boolean);
    return res.json({ success: true, data: brandsList.length > 0 ? brandsList : fallbackBrands });
  } catch {
    return res.json({ success: true, data: fallbackBrands });
  }
};

export const createProduct = async (req, res) => {
  const { title, price, brand, category, description, image, stock, variants, discountPercent } = req.body;
  const upc = normalizeUpc(req.body.upc);

  if (!title || price === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Product title and price are required'
    });
  }

  if (upc === undefined) {
    return res.status(400).json({ success: false, message: 'UPC must be a valid 12-digit UPC-A code.' });
  }

  const newId = `prod-${Date.now().toString().slice(-4)}`;

  try {
    const newProduct = await prisma.product.create({
      data: {
        id: newId,
        title,
        upc,
        brand: brand || 'Nexus',
        description: description || '',
        price: Number(price),
        originalPrice: Number(price),
        discountPercent: Number(discountPercent || 0),
        category: category || 'accessories',
        rating: 5.0,
        reviewsCount: 1,
        stock: stock !== undefined ? Number(stock) : 10,
        badge: 'New',
        image: image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
        variants: variants || [],
        featured: false
      }
    });

    return res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    if (err.code === 'P2002') {
      const isUpcConflict = String(err.meta?.target || '').toLowerCase().includes('upc');
      return res.status(409).json({
        success: false,
        message: isUpcConflict ? 'A product with this UPC already exists.' : 'A product with this ID already exists.'
      });
    }
    console.error('Product could not be stored:', err.message);
    return res.status(503).json({ success: false, message: 'The product catalog is unavailable. Please try again.' });
  }
};
