/*
    index where all the features called and server initalized..
*/

require('dotenv').config();
var express = require("express");
var bodyParser = require("body-parser");
var cors = require("cors");
var app = express();
const Web3 = require("web3");
const config = process.env;
const web3 = new Web3(
  "https://polygon-mumbai.g.alchemy.com/v2/rFNf5Y01JRUI7CZe2x5qmrr3af1BsJ14"
);
const toDoListAbi = require("./abi/ToDoList.json");
const ToDoListContract = new web3.eth.Contract(
    toDoListAbi.abi,
    config.TODOLISTCONTRACTADDRESS
  );
const account = web3.eth.accounts.privateKeyToAccount(config.PRIVATE_KEY)

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use('/api',routes)

app.get("/getTodo", async (req, res) => {
    try{
        const result = await ToDoListContract.methods.getTodo().call();
        res.status(500).json({ result });
    }catch(error){
        res.status(200).json({ error });
    }
 
});

app.get("/getTodoByIndex", async (req, res) => {
    const getIndex = req.query.index;
    try{
        const result = await ToDoListContract.methods.getTodoByIndex(getIndex).call();
        console.log("result is",result)
        res.status(500).json({ result });
    }catch(error){
        res.status(200).json({ "error":error.data });
    }
 
});

app.post("/setTodo", async (req, res) => {
    const newToDo = req.body.newTask;
    console.log("newToDo", newToDo);
    console.log("account address ", account.address);
  
    try {
      const nonce = await web3.eth.getTransactionCount(account.address, 'latest'); // get latest nonce
      console.log("nonce", nonce);
      const gasEstimate = await ToDoListContract.methods.setTodo(newToDo).estimateGas(); // estimate gas
      console.log("gas estimate", gasEstimate);
  
      ///create transaction
      const tx = {
        from: account.address,
        to: '0x1ddd54d000d1f4fFF432e1B9f8e98b37c1d29465',
        nonce: nonce,
        gas: gasEstimate,
        data: ToDoListContract.methods.setTodo(newToDo).encodeABI()
      };
  
      const signedTx = await web3.eth.accounts.signTransaction(tx, config.PRIVATE_KEY);
      const hash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  
      console.log("The hash of your transaction is: ", hash, "\n Check Alchemy's Mempool to view the status of your transaction!");
      res.send({"transaction Hash":hash.transactionHash});
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error });
    }
  });
app.delete("/deleteToDo",async(req,res)=>{
    const deleteToDoIndex = req.body.deleteIndex;
    console.log("deleteToDoIndex", deleteToDoIndex);
  
    try {
      const nonce = await web3.eth.getTransactionCount(account.address, 'latest'); // get latest nonce
      console.log("nonce", nonce);
      const gasEstimate = await ToDoListContract.methods.deleteToDo(deleteToDoIndex).estimateGas(); // estimate gas
      console.log("gas estimate", gasEstimate);
  
      ///create transaction
      const tx = {
        from: account.address,
        to: '0x1ddd54d000d1f4fFF432e1B9f8e98b37c1d29465',
        nonce: nonce,
        gas: gasEstimate,
        data: ToDoListContract.methods.deleteToDo(deleteToDoIndex).encodeABI()
      };
  
      const signedTx = await web3.eth.accounts.signTransaction(tx, config.PRIVATE_KEY);
      const hash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  
      console.log("The hash of your delete transaction is: ", hash);
      res.send({"transaction Hash":hash.transactionHash});
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error });
    }

})

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

var server = app.listen(4000, (server) =>
  console.log("Server Listening in port 8000")
);

console.log(server.address());
