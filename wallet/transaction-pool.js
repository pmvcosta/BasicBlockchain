const Transaction = require('./transaction');

class TransactionPool {
  constructor() {
    this.transactions = [];
  }

  updateOrAddTransaction(transaction) {
    //Check if transaction is to be updated or created from scratch
    let transactionWithId = this.transactions.find(
      (t) => t.id === transaction.id
    );

    if (transactionWithId) {
      //replace existing transaction with newer one with same id
      this.transactions[
        this.transactions.indexOf(transactionWithId)
      ] = transaction;
    } else {
      //Add a new transaction from scratch
      this.transactions.push(transaction);
    }
  }

  //check if there already exists a transaction with a given sender
  existingTransaction(address) {
    return this.transactions.find((t) => t.input.address === address);
  }

  //return any transaction within the array of transactions of this pool that
  // satisfies the following criteria
  //1. total ouput amount matches the original amount specified in input
  //2. verify the singature of every transaction
  validTransactions() {
    return this.transactions.filter((transaction) => {
      const outputTotal = transaction.outputs.reduce((total, output) => {
        return total + output.amount;
      }, 0); //initial value of outputTotal is 0

      //Check condition 1
      if (outputTotal !== transaction.input.amount) {
        console.log(`Invalid transaction from ${transaction.input.address}.`);
        return;
      }

      //Check condition 2
      if (!Transaction.verifyTransaction(transaction)) {
        console.log(`Invalid signature from ${transaction.input.address}.`);
        return;
      }

      //Return any transaction that passes both criteria
      return transaction;
    });
  }

  //Function responsible for clearing the local transaction pool
  clear() {
    this.transactions = [];
  }
}

module.exports = TransactionPool;
