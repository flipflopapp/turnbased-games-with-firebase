
const PROJECT_ID = `your-project-id`;

// get this from firebase console

exports.databaseURL = `https://${PROJECT_ID}.firebaseio.com`;

// download this file form firebase admin setup

exports.serviceAccount = require('./PROJECT_ID-firebase-adminsdk.json');

// replace this with client config from firebase console

exports.clientConfig = {
  apiKey: 'API_KEY',
  authDomain: `${PROJECT_ID}.firebaseapp.com`,
  storageBucket: `${PROJECT_ID}.appspot.com`,
  messagingSenderId: `SENDER_ID`,
  databaseURL: exports.databaseURL,
};
