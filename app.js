'use strict';
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const request = require('request-promise-native');
const express = require('express');
const targetURL = 'https://api.athenahealth.com/preview1';

module.exports = {
  /**
  * Initializes the main express application. Registers app-wide
  * middleware.
  *
  * @returns {Promise} A promise that resolves to the main express app.
  */
  init() {

    return new Promise(function(resolve, reject) {
      // Create our default app.
      const app = express();

      //support parsing of application/json type post data
      app.use(bodyParser.json());

      //support parsing of application/x-www-form-urlencoded post data
      app.use(bodyParser.urlencoded({ extended: true }));


      // Hacky, but register our UI routes here...
      // ------------------ PUBLIC ------------------
      app.get('/ping', function (req, res) {

        const reqOptions = {
          method: 'GET',
          uri: targetURL + '/195900/ping',
          qs: req.query,
          headers: {
            Authorization: req.get('Authorization')
            //Authorization: 'Bearer d3jh7539gndzsgm48qybktmx',
          },
          json: true,
        };
        request(reqOptions)
          .then((response) => {
            res.json(response);
          })
          .catch((err) => {
            console.log('died in get');
            console.log(err);
          });
      });

      return resolve(app);
    });
  },
};
