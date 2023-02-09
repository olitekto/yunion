
const express = require('express');
const router = express.Router();
const Association = require('../models/Association');

router.use(express.json());

router.post('/registerAssociation', (req,res) => {


    Association.create(req.body.adminId, req.body.nom, req.body.siteWeb, req.body.purpose, req.body.neq, req.body.size, req.body.cover, req.body.logo, req.body.description, req.body.address, req.body.province, req.body.ville, req.body.postalCode, req.body.managersId , req.body.status, (err,association) => {

        if (err) {
            console.log('error: ', err);
            res.status(200).send(err);
            return;
          }

          res.status(200).send(association);
    });

});


router.get('/:id', (req,res) => {

    Association.fetchAssociation(req.params.id, (err,assoc) => {

        if (err) {
            console.log('error: ', err);
            res.status(200).send(err);
            return;
        }
        res.status(200).send(assoc);
    });

});


router.patch('/validateAssociation', async (req,res) => {

    Association.validateAssociation(req.body.associationId, (err,invit) => {

        if (err) {
            console.log('error: ', err);
            res.status(200).send(err);
            return;
        }
        if (invit.affectedRows > 0) {
            res.status(200).send({id: req.body.associationId});
        } else {
            res.status(200).send({ error: 4, desc: "Mise à jour impossible"});
        }
    });
 });

module.exports = router;