
const express = require('express');
const router = express.Router();
router.use(express.json());

const Payment = require('../models/Payment');

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


router.post('/pay', (req,res) => {
  Payment.createPayment(req.body.idUser, req.body.product, req.body.price, (err, payment) => {
    if (err) {
      console.log('error: ', err);
      res.status(200).send(err);
      return;
    }
    res.status(200).send(payment);
  });

});


function calculateAge(birthDate, currentDate) {
  const birthYear = birthDate.getFullYear();
  const currentYear = currentDate.getFullYear();
  let age = currentYear - birthYear;

  const birthMonth = birthDate.getMonth();
  const currentMonth = currentDate.getMonth();
  if (currentMonth < birthMonth) {
    age--;
  } else if (currentMonth === birthMonth) {
    const birthDay = birthDate.getDate();
    const currentDay = currentDate.getDate();
    if (currentDay < birthDay) {
      age--;
    }
  }

  return age;
}

router.post('/checkYearSubscription', (req,res) => {
  Payment.checkYearSubscription(req.body.idUser, req.body.product, (err, payment) => {
    if (err) {
      console.log('error: ', err);
      res.status(200).send(err);
      return;
    }
    if (payment.length == 0 ) {     
      res.status(200).send({ statusSouscription: false, descSouscription: "Souscription impayée"});
      return
    } 
    // checking if date of subcription is not expired
    const subscriptionDate = new Date(payment[0].date);
    const currentDate = new Date();
    const age = calculateAge(subscriptionDate, currentDate);
    if (age > 1) {
      res.status(200).send({ statusSouscription: false, descSouscription: "Souscription expirée"});
    } 
    res.status(200).send({ statusSouscription: true, descSouscription: "Souscription payée"});
  });

});



module.exports = router;