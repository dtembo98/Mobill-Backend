const express = require('express');
const router = express.Router();
const { getProducts,getProduct,addProduct} = require('../controllers/product')
router.route('/').get(getProducts).post(addProduct)
router.route('/:id').get(getProduct)
module.exports = router;