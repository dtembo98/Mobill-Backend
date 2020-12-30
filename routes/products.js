const express = require('express');
const router = express.Router();
const { getProducts,addProduct} = require('../controllers/product')
router.route('/').get(getProducts).post(addProduct)
module.exports = router;