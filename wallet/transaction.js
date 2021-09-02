const ChainUtil = require('../chain-util');
const { MINING_REWARD } = require('../config');

class Transaction {
  constructor() {
    this.id = ChainUtil.id();
    this.input = null;
    this.outputs = [];
  }

  update(senderWallet, recipient, amount) {
    //find the previous identical transaction (fromt the same sender address)
    const senderOutput = this.outputs.find(
      (output) => output.address === senderWallet.publicKey
    );

    //Amount sent cannot exceed balance left over after the previous transaction
    if (amount > senderOutput.amount) {
      console.log(`Amount ${amount} exceeds balance.`);
      return;
    }

    senderOutput.amount = senderOutput.amount - amount;
    this.outputs.push({ amount, address: recipient });

    //generate a new, valid signature
    Transaction.signTransaction(this, senderWallet);

    return this;
  }

  //create a "reward-transaction" based on given outputs, and on
  // a senderWallet to generate a signature
  //This is to be used for rewardign miners
  static transactionWithOutputs(senderWallet, outputs) {
    const transaction = new this();

    //Include the 2 output transactions in the transactions array
    transaction.outputs.push(...outputs);

    //sign the transaction
    Transaction.signTransaction(transaction, senderWallet);
    return transaction;
  }

  static newTransaction(senderWallet, recipient, amount) {
    //make sure users don't create transactions of values exceeding their
    // current balance
    if (amount > senderWallet.balance) {
      console.log(`Amount ${amount} exceeds balance.`);
      return;
    }

    //Previous implementation, without transactionWithOutputs
    //"..." is the spread operator allowing us to push 2 objects
    /*
    const transaction = new this(); //creates new instance of Transaction
    transaction.outputs.push(
      ...[
        {
          amount: senderWallet.balance - amount,
          address: senderWallet.publicKey,
        },
        { amount, address: recipient },
      ]
    );

    //Calling signTransaction in a static manner, everytime a transaction
    // is created
    Transaction.signTransaction(transaction, senderWallet);

    return transaction;
    */

    //New implementation, with transactionWithOutputs

    return Transaction.transactionWithOutputs(senderWallet, [
      {
        amount: senderWallet.balance - amount,
        address: senderWallet.publicKey,
      },
      { amount, address: recipient },
    ]);
  }

  //blockchainWallet is a special wallet that will generate signatures to
  // confirm and authenticate reward transactions
  // The miner cannot be the one to sign off the reward transaction, it must be
  // the blockchain itself that approves rewards
  static rewardTransaction(minerWallet, blockchainWallet) {
    return Transaction.transactionWithOutputs(blockchainWallet, [
      {
        amount: MINING_REWARD,
        address: minerWallet.publicKey,
      },
    ]);
  }

  static signTransaction(transaction, senderWallet) {
    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(ChainUtil.hash(transaction.outputs)),
    };
  }

  static verifyTransaction(transaction) {
    return ChainUtil.verifySignature(
      transaction.input.address,
      transaction.input.signature,
      ChainUtil.hash(transaction.outputs)
    );
  }
}

module.exports = Transaction;
