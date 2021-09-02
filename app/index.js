const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain'); //imports the index.js file within
const P2pServer = require('./p2p-server');
const Miner = require('./miner');

//Want access to the wallet class as each user will be given one
const Wallet = require('../wallet');

//We want transaction pool to be shared, and not local
// It needs to be synchronized among the various users
const TransactionPool = require('../wallet/transaction-pool');

//For an API, we should define the port at which we will be listening for
// requests
const HTTP_PORT = process.env.HTTP_PORT || 3001;

//If we run multiple instances of the same applicaton on the same machine
// they will be unable to share the same port
// Need to specify multiple ports to run code and applications on via the
// command line
//With the above reference process.env.HTTP_PORT, we can do the following in
// the command line:
// $ HTTP_PORT=3002 npm run dev, and thus specify a port for the application to
// run on

//Call the default express function. Creates an express applicaton with
// lots of functionalities
const app = express();
const bc = new Blockchain();

const wallet = new Wallet();
const tp = new TransactionPool();

const p2pServer = new P2pServer(bc, tp);

//create a miner instance for each user
const miner = new Miner(bc, tp, wallet, p2pServer);

//To use the body-parser JSON middleware function
// we use the app.use() function to the relevant function
// which is json()
app.use(bodyParser.json());

//1st parameter is the endpoint we want our API
// to expose, we call it blocks
//req is request, res is response
//These two objects are automatically filled
// by express with info to interact with users, info they're sending
// and to send info to them
app.get('/blocks', (req, res) => {
  res.json(bc.chain);
});

//Create first post request method
//The endpoint will be ./mine which will be used by users
// when they want to add some data to the blockchain
app.post('/mine', (req, res) => {
  //Make a new block
  const block = bc.addBlock(req.body.data);

  //data that we want to pass in req.body.data  because when
  // users make a post request to this endpoint, express
  // automatically creates a body object for this request,which
  // contains the other objects and data users send through a JSON
  // post request to this endpoint

  console.log(`New block added: ${block.toString()}`);

  //synchronize chains whenever new block is added
  p2pServer.syncChains();

  //Respond back with updated blockchain containing the
  // block with the data sent by the user
  //We already have a blocks endpoint, so we just have to
  // redirect to that endpoint to get the same res.json(bc.chain)

  res.redirect('/blocks');
});

//Create an endpoint to return the transactions within a user's
// transaction pool
app.get('/transactions', (req, res) => {
  //return the json form of the tp.transactions object
  res.json(tp.transactions);
});

//Need the equivalent endpoint that allows user to submit transactions
app.post('/transact', (req, res) => {
  //receive the recipient's address and amount to transfer as arguments
  const { recipient, amount } = req.body;
  const transaction = wallet.createTransaction(recipient, amount, bc, tp);

  //broadcast the transaction to the peers
  p2pServer.broadcastTransaction(transaction);

  //redirect to the existing transactions endpoint, so that user can immediately
  // see the new transactions array within the pool, containing their newly
  // submitted transaction
  res.redirect('/transactions');
});

//create an endpoint to activate the mine function within the Mine instance
app.get('/mine-transactions', (req, res) => {
  const block = miner.mine();
  console.log(`New block has been added: ${block.toString()}`);

  //user is redirected to see the history of blocks as well as their newly
  // added block
  res.redirect('/blocks');
});

//Method to expose a user's public key (which is also their address), so as to
// allow other users to create transactions to this user
app.get('/public-key', (req, res) => {
  res.json({ publicKey: wallet.publicKey });
});

//Method to return a user's balance at any moment
app.get('/balance', (req, res) => {
  //wallet.balance = wallet.calculateBalance(bc);
  //res.json({ balance: wallet.balance });
  res.json({ balance: wallet.calculateBalance(bc) });
});

//make sure app is running:
app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));

//Start up our instance with listen(). This starts the websocket server
// in this blockchain application instance
p2pServer.listen();
