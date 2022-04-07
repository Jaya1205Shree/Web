const mysql = require('mysql');

const dbURI = "hms";

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:dbURI
});

db.connect((err) => {
    if(err) throw err;
    console.log("MySQL connected...");
});

module.exports = db;