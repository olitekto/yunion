

var mysql = require('mysql');

// DB connexion
var connection = mysql.createPool({
    connectionLimit : 10,
    host     : 'sql.freedb.tech',
    user     : 'freedb_olivier',
    password : 'HWUe7k&#WdwPMM@',
    database : 'freedb_yunion_db'
  });
  
  connection.getConnection(function(err) {
      if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }
    
      //console.log('connected as id ' + connection.threadId);
  });

  module.exports = connection;