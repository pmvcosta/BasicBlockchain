const Transaction = require('./transaction');
const Wallet = require('./index');
const { MINING_REWARD } = require('../config');

describe('Transaction', () => {
  let transaction;
  let wallet;
  let recipient;
  let amount;

  beforeEach(() => {
    wallet = new Wallet();
    amount = 50;
    recipient = 'r3c1p13nt';
    transaction = Transaction.newTransaction(wallet, recipient, amount);
  });

  it('outputs the `amount` subtracted from the wallet balance ', () => {
    //within the transaction outputs we will find the one that matches the output.address
    // which is equal to the wallet.publicKey
    //the amount transacted must be equal to the amount taken from the wallet
    expect(
      transaction.outputs.find((output) => output.address === wallet.publicKey)
        .amount
    ).toEqual(wallet.balance - amount);
  });

  it('outputs the `amount` added to the recipient ', () => {
    //the amount transacted must be equal to the amount given to the recipient
    expect(
      transaction.outputs.find((output) => output.address === recipient).amount
    ).toEqual(amount);
  });

  //Verifies that input object is created, and follows expect specifications
  it('inputs the balance of the wallet', () => {
    expect(transaction.input.amount).toEqual(wallet.balance);
  });

  it('validates a valid transaction', () => {
    expect(Transaction.verifyTransaction(transaction)).toBe(true);
  });

  it('invalidates an invalid transaction', () => {
    //start by messing with transcation output parameters
    transaction.outputs[0].amount = 500000;
    expect(Transaction.verifyTransaction(transaction)).toBe(false);
  });

  //New test "sub"-suite to test response to invalid transaction attempts
  describe('transacting an amount exceeding the balance', () => {
    beforeEach(() => {
      amount = 50000;
      transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it('does not create the invalid transactiom', () => {
      expect(transaction).toEqual(undefined);
    });
  });

  describe('updating a transaction', () => {
    let nextAmount;
    let nextRecipient;

    beforeEach(() => {
      nextAmount = 20;
      nextRecipient = 'n3xt-4ddre355';
      transaction = transaction.update(wallet, nextRecipient, nextAmount);
    });

    it(`subtracts the next amount from the sender's output`, () => {
      expect(
        transaction.outputs.find(
          (output) => output.address === wallet.publicKey
        ).amount
      ).toEqual(wallet.balance - amount - nextAmount);
    });

    it('outputs an amount for the next recipient', () => {
      expect(
        transaction.outputs.find((output) => output.address === nextRecipient)
          .amount
      ).toEqual(nextAmount);
    });
  });

  describe('creating a reward transaction', () => {
    beforeEach(() => {
      transaction = Transaction.rewardTransaction(
        wallet,
        Wallet.blockchainWallet()
      );
    });

    it(`rewards the miner's wallet`, () => {
      expect(
        transaction.outputs.find(
          (output) => output.address === wallet.publicKey
        ).amount
      ).toEqual(MINING_REWARD);
    });
  });
});
