const connection = require('../config/connection');

class Association {
    
    static create(adminId, nom, siteWeb, purpose, neq, size, cover, logo, description, address, province, ville, postalCode, managersId, status, result) {
        connection.query(
          `INSERT INTO associations (adminId, nom, siteWeb, purpose, neq, size, cover, logo, description, address, province, ville, postalCode, managersId, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [adminId, nom, siteWeb, purpose, neq, size, cover, logo, description, address, province, ville, postalCode, managersId, status],
          function(err, res) {
            if (err) {
              console.log('error: ', err);
              result(err, null);
              return;
            }
    
            console.log('created association: ', { id: res.insertId});
            result(null, { id: res.insertId});
          }
        );
      }

    static fetchAssociation(associationId, result) {
      connection.query('SELECT * FROM associations WHERE id = ?', [associationId], function (err, res) {
          if (err) {
            console.log('error: ', err);
            result(err, null);
            return;
          }
          result(null, res[0]);
        });
    }

    static fetchAssociationAmountMembers(associationId, result) {

        connection.query('SELECT * FROM users WHERE associationId = ?', [associationId], function (err, res) {
          if (err) {
            console.log('error: ', err);
            result(err, null);
            return;
          }
          result(null, res.length);
        });
    }

    

    static validateAssociation(associationId, result) {
      connection.query('UPDATE associations SET status = 1 WHERE id = ?', [associationId], function (err, res) {
          if (err) {
            console.log('error: ', err);
            result(err, null);
            return;
          }
          result(null, res);
        });
    }

}

module.exports = Association;