//This file contains methods relating to the utility side of cryptocurrencies
// such as key generation, hash generation and so on.

//ec stands for elliptic cryptography
//we require the elliptic module, in particular the ec class
// EC is a class. Instances of this class take one argument which defines
// which implementation of ec should be used
const EC = require('elliptic').ec;
const SHA256 = require('crypto-js/sha256');

//const uuidV1 = require('uuid/v1'); //there are multiple versions, v1 is timestamp-based
const { v1: uuidV1 } = require('uuid');
const ec = new EC('secp256k1'); // Same as the one used by BTC

class ChainUtil {
  static genKeyPair() {
    return ec.genKeyPair();
  }

  static id() {
    return uuidV1();
  }

  static hash(data) {
    return SHA256(JSON.stringify(data)).toString();
  }

  //returns a true or false value according to signature validity
  static verifySignature(publicKey, signature, dataHash) {
    return ec.keyFromPublic(publicKey, 'hex').verify(dataHash, signature);
  }
}

module.exports = ChainUtil;
