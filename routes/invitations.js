const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const Invitation = require('../models/Invitation');
const Association = require('../models/Association');
const User = require('../models/User');

router.use(express.json());


// router.get('/', (req,res) => {
//     console.log(generateRandomAlphaNumericString(6))
//     res.send("we are on invitations");
// });


router.post('/sendInvitation', (req,res) => {

    Invitation.checkInvitationEligibility(req.body.emailInvited, (err,invitStatus) => {
        if (err) {
            console.log('error: ', err);
            res.status(200).send(err);
            return;
        }
        if (invitStatus.length > 0 ) {     
            res.status(200).send({ error: 4, desc: "Cet utilisateur est déjà membre d'un groupe"});
            return;
        } 
        const codeInvite = generateRandomAlphaNumericString(6);

        Association.fetchAssociation(req.body.associationId, (err,assoc) => {

            if (err) {
                console.log('error: ', err);
                res.status(200).send(err);
                return;
            }

            // Create a transporter object
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
                to: req.body.emailInvited,
                subject: 'Invitation Yunion',
                html: `
                <div style="width:400px;height:auto;margin:0 auto;border:5px solid #3ab3f9; text-align:center; padding:20px">
                <img width="200" height="90" alt="Yunion logo" src="https://api.yunion.ca/general-assets/yunion-full-logo.png">
            <p style="color:#5e6061">Vous avez été invité à rejoindre le groupe <strong> ${assoc.nom} </Strong> </p>
            <img style="border:3px solid #3ab3f9; border-radius:50px" width="90" height="90" alt="Yunion logo" src="https://api.yunion.ca/associations-logos/${assoc.logo}">
            <p style="color:#5e6061">Votre code est:</p>
                    <p> <strong style="color:#3ab3f9;font-weight:bold;font-size:30px">${codeInvite}</strong></p>
                    
                    </div>
                `
            };

            
            Invitation.createInvitation(req.body.emailInvited,req.body.inviterId, req.body.associationId, 0, codeInvite, (err,invit) => {
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
                        res.status(200).send(invit);
                    }
                });
                

            });
            
        });



        

    });
  
   
});

function generateRandomAlphaNumericString(length) {
    return crypto.randomBytes(Math.ceil(length/2))
      .toString('hex') // convert to hexadecimal format
      .slice(0,length) // return required number of characters
      .toUpperCase();   // capital letters
}

// fetch invitation

router.post('/fetchInvitation', (req,res) => {

    let assocObj = null;
    let userObj = null;
    Invitation.fetchInvitation(req.body.codeInvite, (err,invit) => {
        if (err) {
            console.log('error: ', err);
            res.status(200).send(err);
            return;
        }
        if (invit.length > 0) {
            // fetch association
            Association.fetchAssociation(invit[0].associationId, (err,assoc) => {

                if (err) {
                    console.log('error: ', err);
                    res.status(200).send(err);
                    return;
                }
                
                // fetch amount 
                Association.fetchAssociationAmountMembers(invit[0].associationId, (err,amount) => {

                    if (err) {
                        console.log('error: ', err);
                        res.status(200).send(err);
                        return;
                    }
                    const amountObj = {members:amount}
                    assocObj = { association: {...assoc,...amountObj}};

                    // fetch admin
                    User.fetch(invit[0].inviterId, (err,user) => {

                        if (err) {
                            console.log('error: ', err);
                            res.status(200).send(err);
                            return;
                        }
                        userObj = { admin: user};
                        res.status(200).send({...invit[0], ...assocObj, ...userObj});
                    });
                });
                
                
            });
        } else {
            res.status(200).send({ error: 4, desc: "Le code est invalide"});
        }
    });

});


// list invitations

router.get('/', (req,res) => {

    Invitation.listInvitations( (err,invits) => {

        if (err) {
            console.log('error: ', err);
            res.status(200).send(err);
            return;
        }
        res.status(200).send(invits);
    });

});

router.get('/association/:id', (req,res) => {

    Invitation.listInvitationsByAssociation(req.params.id, (err,invits) => {

        if (err) {
            console.log('error: ', err);
            res.status(200).send(err);
            return;
        }
        res.status(200).send(invits);
    });

});


// func update status invitation

router.patch('/validateInvitation', (req,res) => {

    Invitation.validateInvitation(req.body.invitationId, (err,invit) => {

        if (err) {
            console.log('error: ', err);
            res.status(200).send(err);
            return;
        }
        if (invit.affectedRows > 0) {
            res.status(200).send({id: req.body.invitationId});
        } else {
            res.status(200).send({ error: 4, desc: "Mise à jour impossible"});
        }
    });
 });


module.exports = router;