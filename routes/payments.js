
const express = require('express');
const router = express.Router();
router.use(express.json());

const stripe = require('stripe')('sk_test_51MXCc2KHL9DhitlculMQvnJT58JnYJOQibbvLufuO0ynDSe81j7w9b8EqX0Eq6QuZz8NDdtnZoEQYdkNfVwpgOSP00z01BlcLi');
// This example sets up an endpoint using the Express framework.
// Watch this video to get started: https://youtu.be/rPR2aJ6XnAc.

router.post('/payment-sheet', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create();
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {apiVersion: '2022-11-15'}
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 100,
    currency: 'usd',
    customer: customer.id,
    payment_method_types: [
      'card'
    ],
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: 'pk_test_51MXCc2KHL9DhitlcrEWx2cqCCgxCh6FeIpKcqZXSrDg3ttaaeoERIRq6E0uGhTq95dqXyKClYv2zjHi5XcXjGH2R00OwhzSDA1'
  });
});



module.exports = router;