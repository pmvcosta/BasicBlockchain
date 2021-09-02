const Blockchain = require('./index');
const Block = require('./block');

describe('Blockchain', () => {
  let blockChain;
  let otherBlockChain;

  //Refreshes the instance of blockChain before each of the tests
  beforeEach(() => {
    blockChain = new Blockchain();
    otherBlockChain = new Blockchain();
  });

  it('begins with the genesis block', () => {
    expect(blockChain.chain[0]).toEqual(Block.genesis());
  });

  it('adds a new block', () => {
    const data = 'foo';
    blockChain.addBlock(data);

    expect(blockChain.chain[blockChain.chain.length - 1].data).toEqual(data);
  });

  //This only checks if the genesis block has the supposed content,
  // and if the hashes of the blocks match
  it('validates a valid chain', () => {
    otherBlockChain.addBlock('foo');
    expect(blockChain.isValidChain(otherBlockChain.chain)).toBe(true);
  });

  it('invalidates a chain with a corrupted genesis block', () => {
    otherBlockChain.chain[0].data = 'What it is not supposed to be!';
    expect(blockChain.isValidChain(otherBlockChain.chain)).toBe(false);
  });

  it('invalidates a corrupt chain', () => {
    otherBlockChain.addBlock('foo'); //add a new block

    //mess with new block's data
    otherBlockChain.chain[1].data =
      'Something Something, not the original data';
    expect(blockChain.isValidChain(otherBlockChain.chain)).toBe(false);
  });

  it('replaces chain with a valid one', () => {
    //Needs to be longer than the current chain
    //Add element to new chain
    otherBlockChain.addBlock('foo');

    //Ask for chain to be replaced
    blockChain.replaceChain(otherBlockChain.chain);

    //Verify that chain has been replaced
    //Issue: if the addBlock line above is removed, the test still returns true,
    // since both chains are made up of only the genesis block, despite the
    // chain not actually being replaced. Restructure test?
    expect(blockChain.chain).toEqual(otherBlockChain.chain);
  });

  it('does not replace chain with one that is equal or shorter length', () => {
    //Extend original chain
    blockChain.addBlock('banan');
    blockChain.replaceChain(otherBlockChain.chain);
    expect(blockChain.chain).not.toEqual(otherBlockChain.chain);
  });
});
