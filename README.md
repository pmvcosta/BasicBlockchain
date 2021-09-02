This my personal blockchain learning project. My primary goal is to progressively build upon the core concepts of a basic blockchain, making it more and more sophisticated as I learn and implement new concepts and approaches.
If you wish, you may also have free access to the code I will be working on, so feel free to build upon it yourself, and also suggest ways to improve the current iteration of the blockchain. I'm already aware of a wide range of possibilities to explore, so perhaps feedback from more experienced blockchain developers could help me narrow down the focus of my learning process :)

As per usual, if you wish to run this code yourself you'll need to start by using the

npm install

command in the command line within the project's directory. From there, you may also use the following commands:

npm run test

To run the tests as implemented in the .test.js files, to make sure the code is working properly

npm run dev

To create a dev build of the blockchain. I usually resort to this command alongside Postman, to test POST and GET requests within the blockchain.

For instance, a common test I run is as follows:

- In one instance of the command prompt I do:

npm run dev

initiating an instance with HTTP_PORT=3001 and P2P_PORT=5001.

- Then, in another command prompt instance, I do (since I am using Windows, for Linux it's easier to do simply \$ HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001 npm run dev):

set HTTP_PORT=3002
set P2P_PORT=5002
set PEERS=ws://localhost:5001
npm run dev

With this, I can now go on Postman and do, for instance:

GET request: localhost:3001/public-key (to get "User 1"'s public key')
POST request: localhost:3002/transact (to create a transaction. I write the body in JSON, containing 2 parameters: the recipient [which is the previously obtained public key] and the amount to transfer)
GET request: localhost:3001/transactions (or localhost:3002/transactions, should give the same result if all is working properly)
GET request: localhost:3001/mine-transactions (to validate the previous transaction(s))
GET request: localhost:3001/blocks (or localhost:3002/blocks [once again, the result should be the same] to see the newly added blocks)
GET request: localhost:3001/balance or localhost:3002/balance (to check out the balance of the 2 users, and make sure there are no anomalies)
