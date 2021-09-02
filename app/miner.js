const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

class Miner {
  //Every miner works in relation to a blockchain, with transactions from a given
  // transaction pool and with rewards being deposited in their wallets
  // and they communicate with other miners via a p2pServer
  constructor(blockchain, transactionPool, wallet, p2pServer) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  //Primary function, that first grabs transactions from the pool
  //then takes those transactions and creates a block with them
  //then tells the p2pServer to synchronize the chains to include the new
  //block and to clear the transaction pool of the transactions that were
  //incorporated within the block
  mine() {
    //method that determines which transactions are valid
    const validTransactions = this.transactionPool.validTransactions();

    //include a reward for the miner
    validTransactions.push(
      Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
    );

    //create a block consisting of the valid transactions
    const block = this.blockchain.addBlock(validTransactions);

    //synchronize the chains in the p2p server
    this.p2pServer.syncChains();

    //clear transaction pool (local)
    this.transactionPool.clear();
    this.p2pServer.broadcastClearTransactions();

    //broadcast to every miner to clear their transaction pools
    //want other classes to access the block generated from this class
    return block;
  }
}

module.exports = Miner;
