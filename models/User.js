
const connection = require('../config/connection');

// define the User model
class User {
  constructor(id, nom, prenom) {
    this.id = id;
    this.name = nom;
    this.email = prenom;
  }

  static fetch(id, result) {

    connection.query('SELECT * FROM users WHERE id = ?', [id], function (err, res) {
      if (err) {
        console.log('error: ', err);
        result(err, null);
        return;
      }
      result(null, res[0]);
    });

  }

  static login(email, pwd, result) {

    connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email,pwd], function (err, res) {
      if (err) {
        console.log('error: ', err);
        result(err, null);
        return;
      }
      result(null, res);
    });

  }

  static checkEmail(email, result) {

   // connection.connect();

    connection.query('SELECT * FROM users WHERE email = ?', [email], function (err, res) {
      if (err) {
        console.log('error: ', err);
        result(err, null);
        return;
      }
      result(null, res);
    });

   // connection.end();
  }

  static create(nom, prenom, gender, birthdate, country, address, province, city,citizenshipStatus, phone1, phone2,relationshipParent, nameParent, phoneParent, deliveryDateID,expirationDateID, password, email, roleUser,associationId, result) {
    connection.query(
      `INSERT INTO users (nom, prenom, gender, birthdate, country, address, province, city,citizenshipStatus, phone1, phone2, relationshipParent, nameParent, phoneParent, deliveryDateID, expirationDateID, password, email, roleUser, associationId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nom, prenom, gender, birthdate, country, address, province, city,citizenshipStatus,phone1, phone2,relationshipParent, nameParent, phoneParent, deliveryDateID, expirationDateID, password, email, roleUser, associationId],
      function(err, res) {
        if (err) {
          console.log('error: ', err);
          result(err, null);
          return;
        }

        console.log('created user: ', { id: res.insertId, name: nom, email: prenom });
        result(null, { id: res.insertId, name: nom, email: email });
      }
    );
  }

  static createOTP(email, code, result) {
    connection.query(
      `INSERT INTO otp (email, code) VALUES (?, ?)`,
      [email, code],
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

  static checkOTP(email, code, result) {
    connection.query('SELECT * FROM otp WHERE email = ? AND code = ? ORDER BY id DESC LIMIT 1', [email,code], function (err, res) {
      if (err) {
        console.log('error: ', err);
        result(err, null);
        return;
      }
      result(null, res);
    });
  }
  

}

module.exports = User;