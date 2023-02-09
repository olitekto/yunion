const express = require('express');
const app = express();
var cors = require('cors');
app.use(cors());
//var mysql = require('mysql');

//import routes
const usersRoute = require('./routes/users');
app.use('/users', usersRoute);


const invitationsRoute = require('./routes/invitations');
app.use('/invitations', invitationsRoute);

const associationsRoute = require('./routes/associations');
app.use('/associations', associationsRoute);


// routes



app.get('/', (req,res) => {
    res.send("we are on home x");
});

app.post('/test', (req,res) => {
    console.log(req.body.title);
})

 
app.listen('3000');