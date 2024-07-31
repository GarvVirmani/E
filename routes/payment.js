// const express = require('express');
// const router = express.Router();
// const request = require('request');
// const jsSHA = require('jssha');
// const {v4:uuid} = require('uuid')
// const {isLoggedIn} = require('../middleware')


// router.post('/payment_gateway/payumoney', isLoggedIn, (req, res) => {
//     req.body.txnid = uuid();//Here pass txnid and it should be different on every call
//     req.body.email = req.user.email;
//     req.body.firstname = req.user.username; //Here save all the details in pay object 
    
//     const pay = req.body;

//     const hashString = process.env.MERCHANT_KEY //store in in different file
//                         + '|' + pay.txnid
//                         + '|' + pay.amount 
//                         + '|' + pay.productinfo 
//                         + '|' + pay.firstname 
//                         + '|' + pay.email 
//                         + '|' + '||||||||||'
//                         + process.env.MERCHANT_SALT //store in in different file
   
//     const sha = new jsSHA('SHA-512', "TEXT");
//     sha.update(hashString);
//     //Getting hashed value from sha module
//     const hash = sha.getHash("HEX");
    
//     //We have to additionally pass merchant key to API so remember to include it.
//     pay.key = process.env.MERCHANT_KEY //store in in different file;
//     pay.surl = 'http://localhost:5000/payment/success';
//     pay.furl = 'http://localhost:5000/payment/fail';
//     pay.hash = hash;
//     //Making an HTTP/HTTPS call with request
//     request.post({
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         },
//         url: 'https://sandboxsecure.payu.in/_payment', //Testing url
//         form: pay
//     }, function (error, httpRes, body) {
//         if (error) 
//             res.send(
//                 {status: false, 
//                 message:error.toString()
//                 }
//             );

//         if (httpRes.statusCode === 200) {
//             res.send(body);
//         }

//         else if (httpRes.statusCode >= 300 && httpRes.statusCode <= 400) {
//             res.redirect(httpRes.headers.location.toString());
//         }
//     })
// });

// // success route
// router.post('/payment/success', (req, res) => {
//     res.send(req.body);
// })

// router.post('/payment/fail', (req, res) => {
//     res.send(req.body);
// })



// module.exports = router;

// Set your secret key. Remember to switch to your live secret key in production.
// See your keys here: https://dashboard.stripe.com/apikeys
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
router.use(express.static('public'));
router.use(express.urlencoded({extended:true}));
const YOUR_DOMAIN='http://localhost:5000';
router.post('/create-checkout-session',async (req,res)=>{
    const product=req.body;
    console.log(product);
        // Validation to check if productinfo and amount are present
        if (!product.productinfo || !product.amount) {
            return res.status(400).send('Product information or amount is missing');
        }
    const lineItems=[{
        price_data:{
            currency:"inr",
            product_data:{
                name:product.productinfo
            },
            unit_amount:product.amount*100,
        },
        quantity:1
    }
    ];
const session = await stripe.checkout.sessions.create({
  payment_method_types:['card'],
  line_items: lineItems,
  mode: 'payment',
  success_url: `${YOUR_DOMAIN}/success`,
  cancel_url: `${YOUR_DOMAIN}/cancel`,
});
    res.redirect(303,session.url);
});
// Success route
router.get('/success', (req, res) => {
    req.flash('success', 'Payment successful! Thank you for your purchase.');
    res.redirect('/');
});

// Cancel route
router.get('/cancel', (req, res) => {
    req.flash('error', 'Payment canceled. Please try again.');
    res.redirect('/');
});
module.exports = router;