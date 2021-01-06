const express = require('express');
const router = express.Router();
const { getProducts,getProduct,addProduct,buyProduct,productHook,salesStatus,getSales,productImageUpload,getProductByCode} = require('../controllers/product')
const { protect } = require('../middlewares/auth')

router.route('/buy/:barcode').post(protect,buyProduct)
router.route('/barcode/:barcode').get(protect,getProductByCode)
router.route('/').get(protect,getProducts).post(protect,addProduct)
router.route('/hook').post(productHook)
router.route('/status/:saleId').get(protect,salesStatus)
router.route('/sales').get(protect,getSales)
router.route('/uploads').post(protect,productImageUpload)
router.route('/:id').get(protect,getProduct)
module.exports = router;