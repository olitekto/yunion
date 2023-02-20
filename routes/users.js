const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const moment = require('moment');
const router = express.Router();

const User = require('../models/User');
const Payment = require('../models/Payment');

const Flutterwave = require('flutterwave-node-v3');

const fileUpload = require('express-fileupload')

router.use(fileUpload())

router.use(express.json());


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

// create a new user

router.get('/', (req,res) => {

    // Install with: npm i flutterwave-node-v3

    res.send("We are on home");
});

router.post('/login', (req,res) => {

  // check email first

  User.checkEmail(req.body.email,(err,user) => {
    if (err) {
      console.log('error: ', err);
      res.status(200).send(err);
      return;
    }

    if (user.length == 0 ) { 
      // no user found
      res.status(200).send({ error: 4, desc: "User not found"});
    } else {
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if(result) {

          Payment.checkYearSubscription(user[0].id, "Yearly-subscription", (err, payment) => {
            if (err) {
              res.status(200).send(err);
              return;
            }
            if (payment.length == 0 ) {     
              const subscriptionObj = { statusSouscription: false, descSouscription: "Souscription impayée"};
              res.status(200).send({...user[0],...subscriptionObj});
              return
            } 
            // checking if date of subcription is not expired
            const subscriptionDate = new Date(payment[0].date);
            const currentDate = new Date();
            const age = calculateAge(subscriptionDate, currentDate);
            if (age > 1) {
              const subscriptionObj = { statusSouscription: false, descSouscription: "Souscription expirée"};
              res.status(200).send({...user[0],...subscriptionObj});
              return
            } 
            const subscriptionObj ={ statusSouscription: true, descSouscription: "Souscription payée"};
            res.status(200).send({...user[0],...subscriptionObj});
          });

          
        } else {
          res.status(200).send({ error: 5, desc: "Incorrect password"});
        }
      });
    } 
   });
});


router.post('/checkEmail', (req,res) => {
    User.checkEmail(req.body.email,(err,user) => {
      if (err) {
        console.log('error: ', err);
        res.status(200).send(err);
        return;
      }

      console.log('found user: ', user.length);
      if (user.length == 0 ) {     
        res.status(200).send({ error: 4, desc: "User not found"});
        return
      } 
      console.log(user[0].id)
      res.status(200).send({id: user[0].id, email: user[0].email});
     });
});

router.post('/uploadFiles', (req,res) => {
    const pp = req.files.photo;
    const kyc = req.files.kyc;
    pp.mv('./users-photos/'+'pp-'+req.body.id+'.png', function(err, result)  {
      if (err) {
        res.status(200).send(err);
        return;
      }
    });
    kyc.mv('./kyc-photos/'+'kyc-'+req.body.id+'.png', function(err, result)  {
      if (err) {
        res.status(200).send(err);
        return;
      }
    });
    res.status(200).send({ success: true , desc: "File uploaded successfully"});
});

router.post('/registerMember', (req,res) => {

  // check if email is already used
  User.checkEmail(req.body.email,(err,user) => {
    if (err) {
      console.log('error: ', err);
      res.status(200).send(err);
      return;
    }

    if (user.length == 0 ) { 
      // if email is free    
      var birthdate = new Date(req.body.birthdate);
      var deliveryDateID = new Date(req.body.deliveryDateID);
      var expirationDateID = new Date(req.body.expirationDateID);
    
      const password = req.body.password;
      //const salt = crypto.randomBytes(16).toString('hex');
      //const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
      bcrypt.hash(password,  10, function(err, hash){
        if (err) {
            //res.json({error:err});
            res.status(500).send({ error: err});
        }
        User.create(req.body.nom, req.body.prenom, req.body.gender, birthdate, req.body.country, req.body.address, req.body.province,req.body.city, req.body.citizenshipStatus, req.body.phone1, req.body.phone2, req.body.relationshipParent, req.body.nameParent, req.body.phoneParent, deliveryDateID,expirationDateID, hash, req.body.email, req.body.associationId, req.body.roleUser, (err, user) => {
          if (err) {
            console.log('error: ', err);
            res.status(200).send(err);
            return;
          }
          console.log('created user: ', user);
          res.status(200).send(user);
        });
       })
    
        
    } else {
      // email in use
      res.status(200).send({ error: 4, desc: "This email is already registered"});
    } 
   });

  });

  router.post('/sendOTP', (req,res) => {

    let random4Digits = Math.floor(Math.random() * 9000) + 1000;

    // send mail
    // Create a transporter object
    // const transporter = nodemailer.createTransport({
    //   service: 'hotmail',
    //   auth: {
    //       user: 'olivierdesign@live.fr',
    //       pass: 'designer91'
    //   }
    // });
    // akJFs7NyHC_#
    var transporter = nodemailer.createTransport({
      name: 'yunion',
      host: 'yunion.ca',
      port: 465,
      secure: true,
      auth: {
          user: 'noreply@yunion.ca',
          pass: 'akJFs7NyHC_#'
      }
     });
    // Define the email options
    const mailOptions = {
      from: 'noreply@yunion.ca',
      to: req.body.email,
      subject: 'Votre code de validation Yunion',
      html: `
      <div style="width:400px;height:auto;margin:0 auto;border:5px solid #3ab3f9; text-align:center; padding:20px">
  <img width="200" height="90" alt="Yunion logo" src="https://api.yunion.ca/general-assets/yunion-full-logo.png">
    <p style="color:#5e6061;margin-top:40px">Votre code OTP est:</p>
          <p> <strong style="color:#3ab3f9;font-weight:bold;font-size:30px">${random4Digits}</strong></p>
          <p style="color:#5e6061">Ne partagez ce code avec personne. Ce code est valide pour 5 minutes.</p>
  <p style="color:#b8bfc5;font-size:13px">Copyright © 2023 Yunion Ltd.</p>
          </div>
      `
    };

   

    // save in DB
    User.createOTP(req.body.email,random4Digits,(err,otpObj) => {
      if (err) {
        console.log('error: ', err);
        res.status(200).send(err);
        return;
      }
       // Send the email
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
            res.status(200).send(err);
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).send(otpObj);
        }
      });
     });
});

router.post('/checkOTP', (req,res) => {
    User.checkOTP(req.body.email,req.body.otp,(err,otpObj) => {
      if (err) {
        console.log('error: ', err);
        res.status(200).send(err);
        return;
      }
      if (otpObj.length == 0 ) { 
        res.status(200).send({ error: 4, desc: "Le code est invalide"});
      } else {
        // check for validity
        let date1 = moment(otpObj[0].date);
        let date2 = moment();
        let diff = date2.diff(date1, 'minutes');

        if (diff > 5) {
            res.status(200).send({ error: 5, desc: "Votre code a expiré"});
        } else {
          res.status(200).send({id: otpObj[0].id});
        }     
      }
    });
 
});

 
router.get('/:id', (req,res) => {

  User.fetch(req.params.id, (err,user) => {

      if (err) {
          console.log('error: ', err);
          res.status(200).send(err);
          return;
      }
      res.status(200).send(user);
  });

});


// router.get('/registerMember', (req,res) => {
//     let post = {nom:"Ange",prenom:"Bat"}
//     let sql = 'INSERT INTO users SET ?'
//     let query = connection.query(sql, post, (err,result) => {
//       if(err) throw err;
//       console.log(result);
//       res.send("inserted");
//     })
//   });


  module.exports = router;