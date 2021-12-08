const express = require('express'); 
const app = express();

require('./models/participant.js');
require('./models/admin');
require('./models/speaker');
const mongoose = require('mongoose');
const Participant =  mongoose.model('Participant');
const Admin =  mongoose.model('Admin');
const Speaker =  mongoose.model('Speaker');

const auth = require('./middlewares/auth');
const verifyLogged = require('./middlewares/verifyLogged');

const jwt = require('jsonwebtoken');

var sanitize = require('mongo-sanitize');
const helmet = require("helmet");

app.use(express.urlencoded({extended: true}));
app.use(express.json())


const username = 'root'
const password = 'password123'

mongoose.connect(`mongodb://${username}:${password}@mongo:27017/vulnerable`)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('Could not connect to MongoDB', err));

app.post('/login', [verifyLogged], async (req, res) => {

  const user = await Admin.findOne({'email': req.body.email,'password': req.body.password});
  if (!user) return res.status(401).send('Invalid email or password.');
  
  const token = user.generateAuthToken();
  
  res.set('x-token', token);
  if (req.query.redirect_url) return res.redirect(req.query.redirect_url);   

  res.send({ message: 'Logged' });
});

app.get('/participants', auth, async (req, res) => {
  const participants = await Participant.find({}).select({ password: 0 });
  res.send({ participants });
});

app.get('/speakers', auth, async (req, res) => {
  const speakers = await Speaker.find({}).select({ password: 0 });
  res.send({ speakers });
});


/** App listening on port */
app.listen(3000, () => {
  console.log(`Vulnerable app listening at http://localhost:3000`);
});
