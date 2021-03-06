const ChainUtil = require('../chain-util');
const Transaction = require('./transaction');
const { INITIAL_BALANCE } = require('../config');

class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ChainUtil.genKeyPair();

    //getPublic() is a method of genKeyPair which returns the public key
    // generated for this key pair
    //We then encode into hexadecimal string code
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  toString() {
    return `Wallet -
    publicKey: ${this.publicKey.toString()}
    balance: ${this.balance}`;
  }

  //keyPair is generated by the "ec" package, and it also comes with a sign
  // function associated with it
  sign(dataHash) {
    return this.keyPair.sign(dataHash);
  }

  //function to generate new transactions based on a recipient address and
  // an amount. Also checks if a transaction from this wallet already exists
  // within a transaction pool and replaces that with an updated transaction
  createTransaction(recipient, amount, blockchain, transactionPool) {
    //recalculate the balance before each transaction
    this.balance = this.calculateBalance(blockchain);

    //avoid creating transactions exceeding the current balance
    if (amount > this.balance) {
      console.log(`Amount ${amount} exceeds current balance ${this.balance}`);
      return;
    }

    //check if a transaction from this sender already exists in a the
    // transaction pool; this is why existingTransaction() was created
    // within transactionPool
    let transaction = transactionPool.existingTransaction(this.publicKey);

    if (transaction) {
      //if transaction exist we want to update it with the recipient and Amount
      // this does not replace it in the pool
      transaction.update(this, recipient, amount);
    } else {
      transaction = Transaction.newTransaction(this, recipient, amount);
      transactionPool.updateOrAddTransaction(transaction);
    }

    return transaction;
  }

  //REVISIT THIS FUNCTION!!!!
  calculateBalance(blockchain) {
    let balance = this.balance;
    let transactions = [];

    //Iterate over blocks of the blockchain
    //Inside each block, iterate over the transactions and place them in an
    // array
    blockchain.chain.forEach((block) =>
      block.data.forEach((transaction) => {
        transactions.push(transaction);
      })
    );

    //Obtain all transactions matching the user's address
    const walletInputTs = transactions.filter(
      (transaction) => transaction.input.address === this.publicKey
    );

    let startTime = 0;

    //Make sure the array isn't empty
    if (walletInputTs.length > 0) {
      //get the most recent transaction within the transactions matching the
      // user's address
      const recentInputT = walletInputTs.reduce((prev, current) =>
        prev.input.timestamp > current.input.timestamp ? prev : current
      );

      balance = recentInputT.outputs.find(
        (output) => output.address === this.publicKey
      ).amount;
      startTime = recentInputT.input.timestamp;
    }

    transactions.forEach((transaction) => {
      if (transaction.input.timestamp > startTime) {
        transaction.outputs.find((output) => {
          if (output.address === this.publicKey) {
            balance += output.amount;
          }
        });
      }
    });

    return balance;
  }

  static blockchainWallet() {
    const blockchainWallet = new this(); //new wallet
    blockchainWallet.address = 'blockchain-wallet';
    return blockchainWallet;
  }
}

module.exports = Wallet;
