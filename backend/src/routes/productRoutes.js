import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
  getBrands,
  createProduct
} from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.post('/', createProduct);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/:id', getProductById);

export default router;
