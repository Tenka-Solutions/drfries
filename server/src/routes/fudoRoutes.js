import { Router } from 'express';
import {
  createFudoItem,
  createFudoOrder,
  createFudoSale,
  getFudoCatalog,
  getFudoCategoriesList,
  getFudoHealth,
  getFudoProducts,
  getFudoProductsDebug,
} from '../controllers/fudoController.js';

const router = Router();

router.get('/health', getFudoHealth);
router.get('/categories', getFudoCategoriesList);
router.get('/catalog', getFudoCatalog);
router.get('/products', getFudoProducts);
router.get('/products/raw', getFudoProductsDebug);
router.post('/create-order', createFudoOrder);
router.post('/items', createFudoItem);
router.post('/sales', createFudoSale);

export default router;
