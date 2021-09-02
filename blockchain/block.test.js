const Block = require('./block');

describe('Block', () => {
  //Declare variables first, outside of befreEach, to avoid redeclaring them
  // every time a test runs. This way, beforeEach only assigns the variables,
  // instead of declaring them anew every time
  //For some reason, my editor doesn't like simulatneous declaration of
  // multiple variables -\(-_-)/-
  let data;
  let lastBlock;
  let block;
  beforeEach(() => {
    data = 'bar';
    lastBlock = Block.genesis();
    block = Block.mineBlock(lastBlock, data);
  });

  it('sets the `data` to match the input', () => {
    expect(block.data).toEqual(data);
  });

  it('sets the `lastHash` to match the hash of the last block', () => {
    expect(block.lastHash).toEqual(lastBlock.hash);
  });

  it('generates a hash mathcing the difficulty', () => {
    expect(block.hash.substring(0, block.difficulty)).toEqual(
      '0'.repeat(block.difficulty)
    );
    console.log(block.toString());
  });

  it('lowers difficulty for a slowly mined block', () => {
    expect(Block.adjustDifficulty(block, block.timestamp + 360000)).toEqual(
      block.difficulty - 1
    );
  });

  it('raises difficulty for a quickly mined block', () => {
    expect(Block.adjustDifficulty(block, block.timestamp + 1)).toEqual(
      block.difficulty + 1
    );
  });
});
