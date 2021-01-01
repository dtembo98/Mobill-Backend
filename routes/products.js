const express = require('express');
const router = express.Router();
const { getProducts,getProduct,addProduct,buyProduct,productHook,salesStatus,getSales} = require('../controllers/product')

router.route('/buy/:barcode').post(buyProduct)
router.route('/').get(getProducts).post(addProduct)
router.route('/hook').post(productHook)
router.route('/status').post(salesStatus)
router.route('/sales').get(getSales)
router.route('/:id').get(getProduct)
module.exports = router;