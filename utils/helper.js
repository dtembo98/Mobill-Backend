const jwt = require('jsonwebtoken');
const { v4 } = require('uuid');
const generatePayload = (amount, mobileWallet,reference) => {

  	const payload =  {
        amount: amount,
        currency: "ZMW",
        customerEmail: "mark@getsparco.com",
        customerFirstName: "Mark",
        customerLastName: "Musisha",
        customerPhone: "0979789839",
        merchantPublicKey: process.env.MERCHANT_PUBLIC_KEY,
        transactionName:"sell order",
        transactionReference: reference,
        wallet: mobileWallet,
        chargeMe: true,  
      }
    
	const encoded_payload = jwt.sign(payload, process.env.MERCHANT_SECRET_KEY);
	return encoded_payload;
};

module.exports = {
	generatePayload,
};