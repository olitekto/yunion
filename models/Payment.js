const connection = require('../config/connection');

class Payment {


    static createPayment(idUser, product, price, result) {
        connection.query(
          `INSERT INTO paiements (idUser, product, price) VALUES (?, ?, ?)`,
          [idUser, product, price],
          function(err, res) {
            if (err) {
              console.log('error: ', err);
              result(err, null);
              return;
            }
            result(null, { id: res.insertId});
          }
        );
    }

    static checkYearSubscription(idUser, product, result) {
        connection.query('SELECT * FROM paiements WHERE idUser = ? AND product = ? ORDER BY id DESC LIMIT 1', [idUser,product], function (err, res) {
          if (err) {
            console.log('error: ', err);
            result(err, null);
            return;
          }
          result(null, res);
        });
    }
}

module.exports = Payment;