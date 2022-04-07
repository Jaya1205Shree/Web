const express = require('express');
const path = require('path');
const routes = require("./routes");

const app = express();
require("./db");

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

app.use(express.static('public'));
app.use('/css', express.static(path.join(__dirname,'public/css')));
app.use('/js', express.static(path.join(__dirname,'public/js')));
app.use("/images'",express.static(path.join(__dirname,'public/img')));

app.use(express.urlencoded({extended: false}));

app.use('/',routes);


module.exports = app;