const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool', () => {
  let tp;
  let wallet;
  let transaction;
  let bc;

  beforeEach(() => {
    tp = new TransactionPool();
    wallet = new Wallet();
    bc = new Blockchain();

    //Previous implementation
    //transaction = Transaction.newTransaction(wallet, 'r4nd-4dr355', 30);
    //tp.updateOrAddTransaction(transaction);

    //Newest, shorter implementation
    transaction = wallet.createTransaction('r4nd-4ddre355', 30, bc, tp);
  });

  it('adds a transaction to the pool', () => {
    expect(tp.transactions.find((t) => t.id === transaction.id)).toEqual(
      transaction
    );
  });

  it('updates a transaction in the pool', () => {
    //Save a stringified version of the original transaction for comparison
    const oldTransaction = JSON.stringify(transaction);

    //update the transaction
    const newTransaction = transaction.update(wallet, 'n3xt-4ddre355', 20);
    tp.updateOrAddTransaction(newTransaction);
    expect(
      JSON.stringify(tp.transactions.find((t) => t.id === newTransaction.id))
    ).not.toEqual(oldTransaction);
  });

  it('clears transactions', () => {
    //clear the transaction pool
    tp.clear();

    //expect transaction pool to be equal to an empty array
    expect(tp.transactions).toEqual([]);
  });

  describe('mixing valid and corrupt transactions', () => {
    let validTransactions;

    beforeEach(() => {
      //Spreading out the elements of the already setup transaction pool into an
      // array of transactions
      validTransactions = [...tp.transactions];

      for (let i = 0; i < 6; i++) {
        wallet = new Wallet();
        transaction = wallet.createTransaction('r4nd-4ddre355', 30, bc, tp);

        //corrupt all even transactions
        if (i % 2 == 0) {
          transaction.input.amount = 99999;
        } else {
          //Collect non-corrupted transactions into the respective array
          validTransactions.push(transaction);
        }
      }
    });

    it('shows a difference between valid an corrupt transactions', () => {
      expect(JSON.stringify(tp.transactions)).not.toEqual(
        JSON.stringify(validTransactions)
      );
    });

    it('grabs valid transactions', () => {
      expect(tp.validTransactions()).toEqual(validTransactions);
    });
  });
});
