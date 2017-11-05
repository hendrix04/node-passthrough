'use strict';
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const request = require('request-promise-native');
const express = require('express');
const storage = require('node-storage');
const store = new storage('./storage');
const targetURL = 'https://api.athenahealth.com/preview1';
const oauthURL = 'https://api.athenahealth.com/oauthpreview/token';
const key = '';
const secret = '';
const keysecret = new Buffer(key + ":" + secret).toString('base64');

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

      function passthrough(req, res) {
        const tokenage = store.get('age');
        if (typeof tokenage !== 'undefined'
          && (Date.now() - tokenage) < 3000000
        ) {
          makeCall(req, res);
        }
        else {
          const reqOptions = {
            method: 'POST',
            uri: oauthURL,
            form: {
              grant_type: 'client_credentials',
            },
            headers: {
              Authorization: 'Basic ' + keysecret,
            },
            json: true,
          };
          request(reqOptions)
            .then((response) => {
              store.put('age', Date.now());
              store.put('token', response.access_token);

              makeCall(req, res);
            })
            .catch((err) => {
              console.log('died in get');
              console.log(err);
            });
        }
      }

      function makeCall(req, res) {
        const reqOptions = {
          method: 'GET',
          uri: targetURL + req.originalUrl,
          headers: {
            Authorization: 'Bearer ' + store.get('token'),
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
      }

      // Hacky, but register our UI routes here...
      // ------------------ PUBLIC ------------------
      app.get('/*', function (req, res) {
        passthrough(req, res);
      });

      return resolve(app);
    });
  },
};
