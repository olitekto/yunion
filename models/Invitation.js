const connection = require('../config/connection');

class Invitation {

    static createInvitation(emailInvited, inviterId, associationId, status,codeInvite, result) {
        connection.query(
          `INSERT INTO invitations (emailInvited, inviterId, associationId, status, codeInvite) VALUES (?, ?, ?, ?, ?)`,
          [emailInvited, inviterId, associationId, status, codeInvite],
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

      static checkInvitationEligibility(emailInvited, result) {
        const status = 1;
        connection.query('SELECT * FROM invitations WHERE emailInvited = ? AND status = ?', [emailInvited,status], function (err, res) {
            if (err) {
              console.log('error: ', err);
              result(err, null);
              return;
            }
            result(null, res);
          });
      }

      static fetchInvitation(codeInvite, result) {
        // connection.query('SELECT * FROM invitations WHERE codeInvite = ? AND emailInvited = ?', [codeInvite,emailInvited], function (err, res) {
        //     if (err) {
        //       console.log('error: ', err);
        //       result(err, null);
        //       return;
        //     }
        //     result(null, res);
        //   });
        connection.query('SELECT * FROM invitations WHERE codeInvite = ?', [codeInvite], function (err, res) {
          if (err) {
            console.log('error: ', err);
            result(err, null);
            return;
          }
          result(null, res);
        });
      }

      static listInvitations(result) {
        connection.query('SELECT * FROM invitations', [], function (err, res) {
            if (err) {
              console.log('error: ', err);
              result(err, null);
              return;
            }
            result(null, res);
          });
      }

      static listInvitationsByAssociation(associationId, result) {
        connection.query('SELECT * FROM invitations WHERE associationId = ?', [associationId], function (err, res) {
            if (err) {
              console.log('error: ', err);
              result(err, null);
              return;
            }
            result(null, res);
          });
      }

      static validateInvitation(invitationId, result) {
        connection.query('UPDATE invitations SET status = 1 WHERE id = ?', [invitationId], function (err, res) {
            if (err) {
              console.log('error: ', err);
              result(err, null);
              return;
            }
            result(null, res);
          });
      }

}

module.exports = Invitation;