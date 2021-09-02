const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const Blockchain = require('../blockchain');
const { INITIAL_BALANCE } = require('../config');

describe('Wallet', () => {
  let wallet;

  //variable to hold the transaction pool
  let tp;

  //variable to hold the blockchain
  let bc;

  beforeEach(() => {
    wallet = new Wallet();
    tp = new TransactionPool();
    bc = new Blockchain();
  });

  describe('creating a transaction', () => {
    let transaction;
    let sendAmount;
    let recipient;

    beforeEach(() => {
      sendAmount = 50;
      recipient = 'r4nd0m-4ddre355';
      transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);
    });

    describe('and doing the same transaction', () => {
      beforeEach(() => {
        //repeat the same transaction previously set up
        wallet.createTransaction(recipient, sendAmount, bc, tp);
      });

      it('doubles the `sendAmount` subtracted from the wallet balance', () => {
        expect(
          transaction.outputs.find(
            (output) => output.address === wallet.publicKey
          ).amount
        ).toEqual(wallet.balance - sendAmount * 2);
      });

      it('clones the `sendAmount` output for the recipient', () => {
        //the filter((output) => output.address === recipient) method
        // creates an array consisting only of the output objects whose
        // address match that of the recipient
        //the map((output) => output.amount) method takes entire array
        // produced by filter and creates a
        // new array consisting solely of the amount numbers
        expect(
          transaction.outputs
            .filter((output) => output.address === recipient)
            .map((output) => output.amount)
        ).toEqual([sendAmount, sendAmount]);
      });
    });
  });

  describe(`calculating a wallet's balance`, () => {
    let addBalance; //How much currency we are exchanging in each transaction
    let repeatAdd; //How many times transaction is repeated
    let senderWallet;

    beforeEach(() => {
      //tp.clear();//No point in doing this here
      senderWallet = new Wallet();
      addBalance = 100;
      repeatAdd = 3;

      //Adding a series of transactions to the chain
      for (let i = 0; i < repeatAdd; i++) {
        senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
      }

      bc.addBlock(tp.transactions);
    });

    it('calculates the balance for blockchain transactions matching the recipient', () => {
      expect(wallet.calculateBalance(bc)).toEqual(
        INITIAL_BALANCE + addBalance * repeatAdd
      );
    });

    it('calculates the balance for blockchain transactions matching the sender ', () => {
      expect(senderWallet.calculateBalance(bc)).toEqual(
        INITIAL_BALANCE - addBalance * repeatAdd
      );
    });

    describe('and the recipient conducts a transaction', () => {
      let subtractBalance;
      let recipientBalance;

      beforeEach(() => {
        tp.clear();
        subtractBalance = 60;
        recipientBalance = wallet.calculateBalance(bc);
        wallet.createTransaction(
          senderWallet.publicKey,
          subtractBalance,
          bc,
          tp
        );
        bc.addBlock(tp.transactions);
      });

      describe('and the sender sends another transaction to the recipient', () => {
        beforeEach(() => {
          tp.clear();
          senderWallet.createTransaction(wallet.publicKey, addBalance, bc, tp);
          bc.addBlock(tp.transactions);
        });

        it('calculate the recipient balance only using transactions since its most recent one', () => {
          expect(wallet.calculateBalance(bc)).toEqual(
            recipientBalance - subtractBalance + addBalance
          );
        });
      });
    });
  });
});
