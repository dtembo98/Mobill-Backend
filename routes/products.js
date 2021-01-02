const express = require('express');
const router = express.Router();
const { getProducts,getProduct,addProduct,buyProduct,productHook,salesStatus,getSales,productImageUpload} = require('../controllers/product')

router.route('/buy/:barcode').post(buyProduct)
router.route('/').get(getProducts).post(addProduct)
router.route('/hook').post(productHook)
router.route('/status/:saleId').get(salesStatus)
router.route('/sales').get(getSales)
router.route('/uploads').post(productImageUpload)
router.route('/:id').get(getProduct)
module.exports = router;