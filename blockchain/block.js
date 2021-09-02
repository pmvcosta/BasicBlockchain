const ChainUtil = require('../chain-util');
const { DIFFICULTY, MINE_RATE } = require('../config'); //Grab DIFFICULTY constant

class Block {
  constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
    this.timestamp = timestamp;
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty || DIFFICULTY; //The default value is DIFFICULTY
  }

  //Useful in debugging
  //substring returns only the characters between the indices specified, since
  //hashes are so long, and we don't need to see their full extent
  toString() {
    return `Block -
      Timestamp: ${this.timestamp}
      Last Hash: ${this.lastHash.substring(0, 10)}
      Hash: ${this.hash.substring(0, 10)}
      Nonce : ${this.nonce}
      Difficulty: ${this.difficulty}
      Data: ${this.data}`;
  }

  //static modifier means that, as long as Block module is imported
  // there is no need to create a new instance of it to
  //call the function
  //"this" represents an instance of the block class
  //default nonce value is 0
  static genesis() {
    return new this('Genesis time', '------', 'f1r57-h45h', [], 0, DIFFICULTY);
  }

  //Inputs are the last block, and the data we wish to store
  // in the new block being created
  static mineBlock(lastBlock, data) {
    let hash;
    let timestamp;
    const lastHash = lastBlock.hash;
    let { difficulty } = lastBlock; //Fetch difficulty varible from lastBlock
    let nonce = 0;

    //The computational work for mining
    do {
      nonce++; //Before or after hash?
      timestamp = Date.now();

      //Difficulty adjust based on the previous block, and time taken to mine it
      difficulty = Block.adjustDifficulty(lastBlock, timestamp);
      hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

    //Loop continues as long as generated hash doesnt have as many leading 0s
    // as the level of DIFFICULTY

    return new this(timestamp, lastHash, hash, data, nonce, difficulty);
  }

  //This function is called in a static way within mineBlock, thus
  // it must be static
  static adjustDifficulty(lastBlock, currentTime) {
    let { difficulty, timestamp } = lastBlock;

    //Difficulty adjustment: if the current time is bigger than the last block's
    // timestamp PLUS the MINE_RATE, it is too difficult, thus it must be lowered,
    // otherwise, it is too easy and must be raised
    //Maybe create a more robust adjustment system
    difficulty =
      timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1;
    return difficulty;
  }

  static hash(timestamp, lastHash, data, nonce, difficulty) {
    return ChainUtil.hash(
      `${timestamp}${lastHash}${data}${nonce}${difficulty}`
    ).toString();
  }

  static blockHash(block) {
    //Assign the values of the variables with the same
    // name that exist within "block"
    const { timestamp, lastHash, data, nonce, difficulty } = block;
    return Block.hash(timestamp, lastHash, data, nonce, difficulty);
  }
}

module.exports = Block;
