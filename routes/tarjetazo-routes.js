/*jshint esversion: 6 */

var express = require('express');
var mongoose = require('mongoose');
var Openpay = require('openpay');


// inicialización de variables
var app = express();
var Hospital = require('../models/hospital');
var mdAU = require('../middleware/autenticacion');
var openpay = new Openpay('mrhrh2xh74icxyp4ognu', 'sk_937a7fbd112445a6b2d605bedbf91d7f', false);



//----------------------------------------
// Recibir tarjetazo
//----------------------------------------
app.post('/', (req, res, next) => {
    var body = req.body;

    console.log('se recibe tarjetazo');
    console.log('token id: ' + body.token_id);

    var newCustomer = {
        "name": "John",
        "email": "johndoe@example.com",
        "last_name": "Doe",
        "address": {
            "city": "Queretaro",
            "state": "Queretaro",
            "line1": "Calle Morelos no 10",
            "line2": "col. san pablo",
            "postal_code": "76000",
            "country_code": "MX"
        },
        "phone_number": "44209087654"
    };

    openpay.customers.create(newCustomer, function(error, body) {
        console.log('creando cliente...');
        console.log('error:' + error); // null if no error occurred (status code != 200||201||204)
        console.log('body:' + JSON.stringify(body)); // contains the object returned if no error occurred (status code == 200||201||204)
    });

    var newCharge = {
        'source_id': body.token_id,
        'method': 'card',
        'amount': body.amount,
        'description': body.description,
        'device_session_id': 'mrhrh2xh74icxyp4ognu',
        'customer': {
            'name': body.name,
            'last_name': body.last_name,
            'phone_number': body.phone_number,
            'email': body.email
        }
    };
    openpay.charges.create(newCharge, function(error, body) {
        console.log('creando cargo...');
        console.log('error:' + JSON.stringify(error)); // null if no error occurred (status code != 200||201||204)
        console.log('body:' + JSON.stringify(body));
    });

    /*  var chargeRequest = {
        'source_id': body.token_id,
        'method': 'card',
        'amount': body.amount,
        'description': body.description,
        'device_session_id': 'mrhrh2xh74icxyp4ognu',
        'customer': {
            'name': body.name,
            'last_name': body.last_name,
            'phone_number': body.phone_number,
            'email': body.email
        }
    }

    // Opcional, si estamos usando puntos
    //chargeRequest.use_card_points = use_card_points;

    openpay.customers.charges.create(chargeRequest, function(error, charge) {
        error;
        charge;
    });
 */
});





module.exports = app;