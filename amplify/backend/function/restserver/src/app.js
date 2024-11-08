/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/


/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	LOCALSTORAGE_KEY
	NODE_BASE_PATH
	CALL_BACK_URL_PORT
Amplify Params - DO NOT EDIT */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Replace these with your values
const { OAuth2Client } = require('google-auth-library');
 
const CLID= 'krRm8HbsGJdajy3oFTKH1XVnK7X3LnUBWqPHiDPNgx12eiXXAzgLfYFR4vwSBSmtERYrJb7Pb2FRomUqek4CwgaVeZLZQuMQJQ';
 
const CSRET = '87gm8qXusd2mKGaPpricTFxGKZSYGkMqKnez9o2riv1uofpN'
const REDIRECT_URI = 'https://tjfh2jct45.execute-api.ap-south-1.amazonaws.com/dev/api/auth/google'
//'http://localhost:3000/dev/api/auth/external/google/callback/login'// 'http://localhost:3000/auth/google/callback';

// https://tjfh2jct45.execute-api.ap-south-1.amazonaws.com/dev/api/auth/google
const express = require('express')
const bs58 = require('bs58');
const decodedclidBase58 = Buffer.from(bs58.decode(CLID)).toString('utf-8');
const decodedcsrectBase58 = Buffer.from(bs58.decode(CSRET)).toString('utf-8');

const client = new OAuth2Client(CLID, CSRET, REDIRECT_URI);

const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')

// declare a new express app
const app = express()
app.use(bodyParser.json())

app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

/*
app.get('/', (req, res) => {
  
});*/
/**********************
 * Example get method *
 **********************/

app.get('/api', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
  //res.send(`<h1>Google Auth Example</h1><a href="/auth/google">Sign in with Google</a>`);
});



app.get('/api/auth/google', (req, res) => {
  const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
  });
  console.log("authUrl "+authUrl)
  res.redirect(authUrl);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  
  const oauth2 = google.oauth2({
      auth: client,
      version: 'v2',
  });
  
  const userInfo = await oauth2.userinfo.get();
  
  // Store user info in session
  req.session.user = userInfo.data;
  res.json({success: `logged out ${userInfo.data.name}`,message: 'success'});
  // res.send(`<h1>Welcome, ${userInfo.data.name}</h1><a href="/logout">Logout</a>`);
});

app.get('/api/logout', (req, res) => {
  req.session = null; // Clear the session
  res.redirect('/api');
});
/**
app.get('/api/*', function(req, res) {
  // Add your code here
  res.json({success: 'get call succeed!', url: req.url});
});
*/
/****************************
* Example post method *
****************************/
/**
app.post('/api', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});

app.post('/api/*', function(req, res) {
  // Add your code here
  res.json({success: 'post call succeed!', url: req.url, body: req.body})
});
*/
/****************************
* Example put method *
****************************/
/**
app.put('/api', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});

app.put('/api/*', function(req, res) {
  // Add your code here
  res.json({success: 'put call succeed!', url: req.url, body: req.body})
});
*/
/****************************
* Example delete method *
****************************/
/**
app.delete('/api', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});

app.delete('/api/*', function(req, res) {
  // Add your code here
  res.json({success: 'delete call succeed!', url: req.url});
});
*/
app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
