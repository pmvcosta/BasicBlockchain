const Websocket = require('ws');

//The HTTP_PORT is for the API, this one is for websocketss
const P2P_PORT = process.env.P2P_PORT || 5001;

//This checks if a "peers" environment variable has been set
// Assume this peers env variable is a string that contains a list of the
// websocket addresses that the websocket should connect to, as a peer
// if PEERS env variable exists it is split into an array containing the
// specified websocket addresses, otherwise it is set to an empty array
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];

const MESSAGE_TYPES = {
  chain: 'CHAIN',
  transaction: 'TRANSACTION',
  clear_transactions: 'CLEAR_TRANSACTIONS',
};

//Example of command line input, specifying the HTTP and P2P ports,
// and the peers:
//$ HTTP_PORT=3002 P2P_PORT=5003 PEERS=ws://localhost:5001,
//  ws://localhost:5002 npm run dev

class P2pServer {
  //Each P2P server is given a blockchain so it can then be shared among the
  // peers as each of them mine new blocks
  constructor(blockchain, transactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.sockets = [];

    //sockets Contains a list of the connected websocket servers that connect
    // to this one
  }

  //listen() takes care of starting and creating the server
  listen() {
    //Server() is statically used, as there is no need to create
    // a Websocket instance to call this function
    const server = new Websocket.Server({ port: P2P_PORT });

    //Create an event listener, that listens for incoming types of messages
    // The first argument specifies the type of event we are listening
    // out for. By listening to connection events we can fire specific
    // code whenever a new socket connects to this server
    // In order to interact with that socket we are given a callback function
    // whose parameter is the socket object created due to the connection
    server.on('connection', (socket) => this.connectSocket(socket));

    //The following function will handle later instances of the application
    // connecting to peers that are specified when they're started
    this.connectToPeers();

    console.log(`Listening for P2P connections on: ${P2P_PORT}`);
  }

  connectToPeers() {
    //For each item in the peers array:
    peers.forEach((peer) => {
      //What a peer (address) looks like --> ws://localhost:5001
      //Socket created manually from each of the peer addresses
      const socket = new Websocket(peer);

      //Event listener, listening for the 'open' event
      // because when we specify our peers for this application
      // we might not have started the websocket server at
      // localhost:5001, if that's a listed peer
      // but by doing the following we can run some code if that server
      // is started later even though it was specified as a peer prior
      // to that
      socket.on('open', () => this.connectSocket(socket));
    });
  }

  //Helper function to push this socket to our array of sockets
  connectSocket(socket) {
    this.sockets.push(socket);
    console.log('Socket Connected');

    //Since all sockets run through here, the message handler
    //can be attached here
    this.messageHandler(socket);

    //Still have to send the message
    //Have to stringify it since send only accepts strings
    this.sendChain(socket);
  }

  //Have to get sockets to synchronize their blockchains with eachother
  // Get our sockets to communicate and send the blockchain specific
  // data we use the send method of the socket object, it allows to send
  // an event to the relevant socket containing a stringified message
  //We will be sending message events to sockets, and also making sure
  // sockets are prepared to handle these events. This handling is achieved
  // via an event listener:
  messageHandler(socket) {
    socket.on('message', (message) => {
      const data = JSON.parse(message);

      //when data is more than 1 item, they can be accessed using data.thing

      //the data type determines how messageHandler proceeds
      switch (data.type) {
        case MESSAGE_TYPES.chain:
          this.blockchain.replaceChain(data.chain);
          break;
        case MESSAGE_TYPES.transaction:
          this.transactionPool.updateOrAddTransaction(data.transaction);
          break;
        case MESSAGE_TYPES.clear_transactions:
          this.transactionPool.clear();

          //when a websocket receives a message of type clear_transactions
          // it calls the transactionPool.clear() method to clear
          // their local transaction pools
          break;
      }
    });
  }

  //To avoid confusion between instances of sending a blockchain and sending
  // a transaction, types were associated with each case, which determines how
  // messageHandler handles them

  //sendChain() was modified to include a type: and chain: fields, to account
  // for the introduction of types associated with messages
  //Same goes for sendTransaction()
  sendChain(socket) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPES.chain,
        chain: this.blockchain.chain,
      })
    );
  }

  syncChains() {
    this.sockets.forEach((socket) => {
      this.sendChain(socket);
    });
  }

  sendTransaction(socket, transaction) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPES.transaction,
        transaction, //Same as transaction: transaction
      })
    );
  }

  //Only a single newly introduced transaction is sent to the peers
  broadcastTransaction(transaction) {
    this.sockets.forEach((socket) => this.sendTransaction(socket, transaction));
  }

  //goes over all sockets and sends the clear_transactions message to all
  broadcastClearTransactions() {
    this.sockets.forEach((socket) =>
      socket.send(
        JSON.stringify({
          type: MESSAGE_TYPES.clear_transactions,
        })
      )
    );
  }
}

module.exports = P2pServer;
