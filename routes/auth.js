const express = require('express');
const router = express.Router();
const { register,login,getMe} = require('../controllers/auth')
const { protect } = require('../middlewares/auth')

router.route('/me').get(protect,getMe)
router.route('/register').post(register)
router.route('/login').post(login)

module.exports = router;