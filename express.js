var express = require('express');
var app = express();

var oneDay = 86400000;

app.use(express.static(__dirname + '/dist', {maxAge: oneDay}));

app.listen(80)
