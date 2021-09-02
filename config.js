const DIFFICULTY = 3;
const MINE_RATE = 3000; //Target time between mining of blocks, in ms
const INITIAL_BALANCE = 500;
const MINING_REWARD = 50; //Fixed reward for successfully mining a block

//So MINE_RATE=3000 is 3s between mined blocks

module.exports = { DIFFICULTY, MINE_RATE, INITIAL_BALANCE, MINING_REWARD };
