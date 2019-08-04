var Web3 = require('web3');
var BigNumber = require('bignumber.js');
let Tx = require('ethereumjs-tx');
//var web3 = new Web3(Web3.givenProvider || 'https://mainnet.infura.io');//mainnet
var web3 = new Web3(Web3.givenProvider || 'https://ropsten.infura.io/1c7b730f883e44f39134bc8a680efb9f');//testnet
var Accounts = require('web3-eth-accounts');
//var accounts = new Accounts('https://mainnet.infura.io');//mainnet
var accounts = new Accounts('https://ropsten.infura.io/1c7b730f883e44f39134bc8a680efb9f');//testnet
const safeJsonStringify = require('safe-json-stringify');
const numberToBN = require('number-to-bn');
var CircularJSON = require('circular-json');
const request = require('request');
const config1 = require('../configuration.js');
var value = 'myEthereum3222335'


getBalance = (address, cb) => {
  web3.eth.getBalance(address).then(amount => {
    console.log("amount==>>", amount)
    amount = new BigNumber(amount).dividedBy(new BigNumber(Math.pow(10, 18)))
    console.log("amountBigNo.==>>", amount)
    cb(null, amount)
  }).catch(err => {
    cb(null, err)
  })
}


getCurrentGasPrice = (cb) => {
  web3.eth.getGasPrice()
    .then((currentGasPrice) => {
      console.log("currentGasPrice===>>", currentGasPrice)
      return cb(currentGasPrice)
    })
}

estGas = (toAddr, fromAddr, value, cb) => {
  web3.eth.estimateGas({
    from: fromAddr,
    to: toAddr,
    value: value
  }).then((estmdGas) => {
    console.log(" Your estmdGas is ==>>", estmdGas)
    return cb(estmdGas)
  }).catch(console.log)
}

getTxnCountForNonce = (addr, cb) => {
  web3.eth.getTransactionCount(addr)
    .then((count) => {
      return cb(count)
    });
}

signTxn_transfer = (toAddr, fromAddr, value, key, cb) => {
  estGas(toAddr, fromAddr, value, (estmdGas) => {
    getCurrentGasPrice((currentGasPrice) => {
      getTxnCountForNonce(fromAddr, (hardCount) => {
        // this calculate fee automatically
        var fee_res = new BigNumber(estmdGas).multipliedBy(new BigNumber(2*1e9));
	var data = new BigNumber(value).minus(new BigNumber(fee_res));
	var actual_fee = new BigNumber(fee_res).dividedBy(new BigNumber(Math.pow(10, 18)))
        console.log("data@@@@@",data)
	console.log("***********",fee_res)
	console.log("actual fee can be ducted----",estmdGas * currentGasPrice)
        let rawTx = {
          nonce: web3.utils.toHex(hardCount),
          from: web3.utils.toHex(fromAddr),
//          gasPrice: web3.utils.toHex(5*1e9),
	  gasPrice: web3.utils.toHex(2*1e9),
          gas: web3.utils.toHex(estmdGas),
          to: web3.utils.toHex(toAddr),
          value: web3.utils.toHex(data)
        }
        // let rawTx = {
        //   nonce: web3.utils.toHex(hardCount),
        //   from: web3.utils.toHex(fromAddr),
        //   gasPrice: web3.utils.toHex(2 * 1e9),//this gas used for transaction (used ethereum for gas) 
        //   gas: web3.utils.toHex(21000),
        //   to: web3.utils.toHex(toAddr),
        //   value: web3.utils.toHex(value)
        // }
        var tx = new Tx(rawTx);
        tx.sign(key);
        let serializedTx = tx.serialize();
        console.log("serializedTx", serializedTx)
        let cbData = '0x' + serializedTx.toString('hex')
        console.log("cb Data is ", cbData)
        cb(cbData)
      })
    })
  })
}

signTxn = (toAddr, fromAddr, value, key, cb) => {
  estGas(toAddr, fromAddr, value, (estmdGas) => {
    getCurrentGasPrice((currentGasPrice) => {
      getTxnCountForNonce(fromAddr, (hardCount) => {
        // this calculate fee automatically
        let rawTx = {
          nonce: web3.utils.toHex(hardCount),
          from: web3.utils.toHex(fromAddr),
          gasPrice: web3.utils.toHex(5*1e9),
          gas: web3.utils.toHex(estmdGas),
          to: web3.utils.toHex(toAddr),
          value: web3.utils.toHex(value)
        }
        // let rawTx = {
        //   nonce: web3.utils.toHex(hardCount),
        //   from: web3.utils.toHex(fromAddr),
        //   gasPrice: web3.utils.toHex(2 * 1e9),//this gas used for transaction (used ethereum for gas) 
        //   gas: web3.utils.toHex(21000),
        //   to: web3.utils.toHex(toAddr),
        //   value: web3.utils.toHex(value)
        // }
        var tx = new Tx(rawTx);
        tx.sign(key);
        let serializedTx = tx.serialize();
        console.log("serializedTx", serializedTx)
        let cbData = '0x' + serializedTx.toString('hex')
        console.log("cb Data is ", cbData)
        cb(cbData)
      })
    })
  })
}


module.exports = {
  get_wallet: (req, res) => {
      if (req.headers.value == config1.jwtSecretKey) {
         if (!req.query.password) {
      return res.send({ code: 400, message: "Parameters Missing!!" })
    }
    var privateKey = web3.eth.accounts.wallet.create(1, req.body.password)
    //console.log("privatekey--------------" + CircularJSON.stringify(privateKey))
    var objInfo = privateKey.length - 1;
    //console.log("=====address>>====", privateKey[objInfo].address)

    var result = {
      address: privateKey[objInfo].address,
      privateKey: privateKey[objInfo].privateKey
    }
  return res.send({code : 200 , Result: result})
      }
      else{
        res.send({
                code: 500,
                message: 'Not authurised person'
            });
      }
   
    //return res.send({ code: 200, Result: result, Alert: "1) Do not lose it! It cannot be recovered if you lose it. 2) Do not share it! 3) Your funds will be stolen if you use this file on a malicious/phishing site. 4) Make a backup! 5)  Secure it like the millions of dollars it may one day be worth." })
  },


///////Getting an payment////////
  get_payment: (req, res) => {
     if (req.headers.value == config1.jwtSecretKey) {
         console.log("req.body1111======>>>", req.body)
    if (!req.body.privateKey || !req.body.fromAddr || !req.body.toAddr || !req.body.value) {
      return res.send({ code: 400, message: "Parameters Missing!!" })
    }
    getBalance(req.body.fromAddr, (err, result) => {
      console.log("result--->",result)
      //console.log("check balance ===>>", result > req.body.value)     
      if (err) {
        console.log("err34343",err)
        return res.send({ code: 500, message: "Internal server error" })
              } 
      else if(result == undefined){
  console.log("*****************")
  res.send({code:500,message:"Private key is Invalid!!"})
}              
      else if (result) {
        console.log("check balance ===>>", result)
        privateKey = (req.body.privateKey).split('0x')
        privateKey = privateKey[1]
        console.log("PrivateKey=======>>>", privateKey)
        var privateKey = new Buffer(privateKey, 'hex');
        console.log("=======>>>", privateKey)
        var amount = new BigNumber(req.body.value).multipliedBy(new BigNumber(Math.pow(10, 18)));
        signTxn(req.body.toAddr, req.body.fromAddr, amount, privateKey, (hash) => {
          if (hash) {
            console.log("hash=====>>", hash)
            web3.eth.sendSignedTransaction(hash).then((receipt) => {
              console.log('Transaction Hash---------->', receipt)
              //var fee_data = new BigNumber(receipt.gasUsed).dividedBy(new BigNumber(Math.pow(10, 9)));
            //  console.log("fee_data---->",fee_data)
    //var transactionFee = web3.eth.gasPrice * 21001;
    //web3.eth.getGasPrice().then((price) =>{
    var transactionFee = (5*1e9) * receipt.gasUsed;
    console.log("*************8",transactionFee)
    var fee_data = new BigNumber(transactionFee).dividedBy(new BigNumber(Math.pow(10,18 )));
              return res.send({ code: 200, txid: receipt.transactionHash, fee: fee_data })
            }).catch(err => {
              return res.send({ code: 500, message: "Insufficients Funds!!" })
            })
       // }) 
    }
        })
      } else {
        return res.send({ code: 500, message: "Internal server error" })
      }
    })
      }
      else{
        res.send({
                code: 500,
                message: 'Not authurised person'
            });
      }

 

  },

  ///////Getting an deposits////////
  get_deposits: function (req, res, ) {
     if (req.headers.value == config1.jwtSecretKey) {
      console.log("We are in Deposits Api")
    if (!req.query.address) {
      return res.send({ code: 400, message: "Parameters Missing!!" })
    }
    var dataString = {
      "name": req.query.address,
    }

    var options = {
      //url:'http://api.etherscan.io/api?module=account&action=txlist&address='+ req.query.address +'&sort=asc',//mainnet
      url: 'http://api-ropsten.etherscan.io/api?module=account&action=txlist&address=' + req.query.address + '&sort=desc',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataString)
    };

    function callback(error, response, body) {
      
      if (!error && response.statusCode == 200) {
        
        res.send({ code: 200, deposits: JSON.parse(body) })
      }
      else
        res.send({ code: 500, message: "Internal Sever Error" })
    }

    request(options, callback);

      }
      else{
        res.send({
                code: 500,
                message: 'Not authurised person'
            });
      }
    
  },

///////Getting an balance////////
  get_balance: (req, res) => {
     if (req.headers.value == config1.jwtSecretKey) {
        if (!req.query.address) {
      return res.send({ code: 400, message: "Parameters Missing!!" })
    }
    getBalance(req.query.address, (err, result) => {
      if (err) {
        return res.send({ code: 500, message: "Internal Sever Error" })
      } else {
        return res.send({ code: 200, balance: result })
      }
    })
      }
      else{
        res.send({
                code: 500,
                message: 'Not authurised person'
            });
      }
  
  },



///////Getting an transfer////////

get_transfer: (req, res) => {
   if (req.headers.value == config1.jwtSecretKey) {
    console.log("req.body======>>>", req.body)
  if (!req.body.privateKey || !req.body.fromAddr || !req.body.toAddr ) {
    return res.send({ code: 400, message: "Parameters Missing!!" })
  }
  getBalance(req.body.fromAddr, (err, result) => {
    console.log("balance_api---->",result)
    if (err) {
      console.log("err34343",err)
      return res.send({ code: 500, message: "Internal server error" })
            } 
    else if (result) {
      console.log("resultt----->",result)
      privateKey = (req.body.privateKey).split('0x')
      privateKey = privateKey[1]
      //console.log("=======>>>", privateKey)
      var privateKey = new Buffer(privateKey, 'hex');
      //console.log("=======>>>", privateKey)
      var amount = new BigNumber(result).multipliedBy(new BigNumber(Math.pow(10, 18)));
      console.log("**********",amount)
      // var current_fee = getCurrentGasPrice();
      // console.log("current_fee========>",current_fee)
      // var estGas_fee = estGas(req.body.toAddr, req.body.fromAddr, amount,cb);
      // console.log("estGas_fee====>",estGas_fee)
      // var amount_change = amount - 210000000000000000;
      //console.log("amount-change===>",amount_change)
      signTxn_transfer(req.body.toAddr, req.body.fromAddr, amount, privateKey, (hash) => {
        if (hash) {
          console.log("hash=====>>", hash)
          web3.eth.sendSignedTransaction(hash).then((receipt) => {
            console.log('Transaction Hash---------->', receipt)
            var fee_data = new BigNumber(receipt.gasUsed).dividedBy(new BigNumber(Math.pow(10, 9)));
            console.log("fee_data---->",fee_data)
    //var transactionFee = web3.eth.gasPrice * 21001;
  //  web3.eth.getGasPrice().then((price) =>{
                var transactionFee = (2*1e9) * receipt.gasUsed;
                console.log("*************8",transactionFee)
                var fee_data = new BigNumber(transactionFee).dividedBy(new BigNumber(Math.pow(10,18 )));
    var Sentamount_s= new BigNumber(amount).dividedBy(new BigNumber(Math.pow(10, 18)));
    var Sentamount= new BigNumber(Sentamount_s).minus(new BigNumber(fee_data));
            return res.send({ code: 200, txid: receipt.transactionHash, fee: fee_data , sent_amount:Sentamount })
          }).catch(err => {
            res.send({ responseCode: 500, responseMessage: "Insufficients Funds!!" })
          })
      // })
 }
      })
    } else {

      return res.send({ code: 500, message: "Internal server error" })
    }
  })
      }
      else{
        res.send({
                code: 500,
                message: 'Not authurised person'
            });
      }
  

},


//Details from the Transaction Id

get_details: (req, res) => {
   if (req.headers.value == config1.jwtSecretKey) {
     if (!req.query.txid) {
    return res.send({ responseCode: 400, responseMessage: "Parameters Missing!!" })
  }
  var command = {
    "jsonrpc": "2.0",
    "id": "1",
    "method": "eth_getTransactionByHash",
    "params": [
         req.query.txid
    ]
}
var options = {
    url: 'https://ropsten.infura.io/1c7b730f883e44f39134bc8a680efb9f/',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    form: JSON.stringify(command)
};
request(options, function (error, response, data) {
   const arr =[]
    const data_result = JSON.parse(data)
    const d_value = parseInt(data_result.result.value)
    var amount = new BigNumber(d_value).dividedBy(new BigNumber(Math.pow(10, 18)));    
    const d_gas = parseInt(data_result.result.gas)
    var fee = new BigNumber(d_gas).dividedBy(new BigNumber(Math.pow(10, 9)));
    
    arr.push({
      txid : data_result.result.hash,
      from : data_result.result.from,
      to : data_result.result.to,
      value : amount,
      gas : fee
    })
    if (!error && response.statusCode == 200) {
      
            res.send({ responseCode: 200, responseMessage: "Success", Details: arr })
          }
          else
            res.send({ responseCode: 500, responseMessage: "Internal Sever Error" })
        })

      }
      else{
        res.send({
                code: 500,
                message: 'Not authurised person'
            });
      }
 

 },

}
