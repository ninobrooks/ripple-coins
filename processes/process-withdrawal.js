//Reads withdrawals object, sends transactions
//TODO: handle address validation quirk
//TODO: re-examine self-tests
var bitcoin = require ('bitcoin'); //https://www.npmjs.org/package/bitcoin greatly simplifies interfacing with coin daemons
var coins = require ("./cryptocurrencies.json");//coin configurations
var coinDaemons = require ("./coin-daemons.js");
var transactions = require ("./lib/outgoing-bridge.js");
transactions.coinDaemons = coinDaemons; //validateAddress function needs coinDaemons object
var sep = '\n--------------------------------------------------------\n';
var logPrefix = 'process-withdrawal';

//begin test vars
runSelfTest = false;
testLevel = 0;
testSelect = 'tx'; //options: tx = test transactions. BE ON TESTNET.
//end test vars

//keeping this around since it also shows rpc methods available
function showCollection(objCollection){//shows properties of objects in a collection. Like port/host/userpass of each coin in cryptocurrencies.json
    console.log(logPrefix, 'selfTest!');
    for(var obj in objCollection){
        console.log(logPrefix, 'obj:' + obj, '\ncoins[obj]:\n', objCollection[obj],'\n');
        for (var propt in objCollection[obj]){
            console.log(logPrefix, 'obj[propt]:',propt, '\ncoins[obj[propt]]:' , objCollection[obj][propt],'\n');
        }
    }
}

function selfTest(testLevel, testSelect){ //has not been kept up. Some functions may have been renamed or expect different params
    if (testLevel > 0){
        console.log(sep, logPrefix, 'Checking to see if cryptocurrencies.json was loaded. Showing coins.',sep);
        showCollection(coins);
    }
    if (testLevel > 1){
        console.log(sep, logPrefix, 'Checking to see if bitcoin Clients were created. Showing coinDaemons and available methods', sep);
        showCollection(coinDaemons);
    }

    if (testSelect != ''){
        if (testSelect.indexOf('tx' >0)){
            console.log(sep, logPrefix, 'Testing coinDaemon method calls using an example transaction. THIS WILL SEND CRYPTO so you should be on testnet!!!', sep);
            coinProcessing(exampleTx, fnClearPending = function (){console.log(logPrefix, 'fnClearPending dummy function.');});
        }
    }
}

function coinProcessing(withdrawalSet, fnClearPending){//run transaction
    if (withdrawalSet.hasOwnProperty('withdrawals') != true){
        //console.log("No withdrawals found (withdrawalSet does not have property 'withdrawals')");
        console.log(logPrefix, 'ERROR: invalid withdrawalSet:', withdrawalSet);
        return false;
    }
    console.log(logPrefix, 'valid object:', withdrawalSet.hasOwnProperty('withdrawals'));
    for (i=0; i < withdrawalSet.withdrawals.length; i++){ //for each withdrawal
        currency = withdrawalSet.withdrawals[i].currency;
        address = withdrawalSet.withdrawals[i].external_account_id;
        if(coinDaemons.hasOwnProperty(currency)){ //if coinDaemon exists for the currency
            console.log(logPrefix, '[', currency, ']', 'on', coinDaemons[currency]['rpc']['opts'].port);//, '(obj:', coinDaemons[currency],')');//debug info
            transactions.validateAddress(withdrawalSet.withdrawals[i], fnClearPending, callback = function (withdrawalObj, validation, curr, addr){ //validate address
                console.log('validation:>>',validation);
                if (validation != true) {
                    console.log(logPrefix, 'address NOT VALIDATED. Validator returned false.')
                    //continue; //NEEEEEEEXT!
                }
                if (validation == true) {
                    console.log(logPrefix, 'address VALIDATED:', curr, addr);
                    transactions.sendTx(withdrawalObj, true, fnClearPending);
                    //fnClearPending(true); //callback is apiQuery(dest, callback, argsIn){
                }
            });
        }else{
        console.log(logPrefix, 'ERROR! Coin', withdrawalSet.withdrawals[i].currency, '(rTxId='+ withdrawalSet.withdrawals[i].ripple_transaction_id + ') does not exist in cryptocurrencies.json. Skipping.');
    //    continue;
        };
    }
return 0;
}




console.log(logPrefix, 'runSelfTest:', runSelfTest);
console.log(logPrefix, 'testLevel=', testLevel);
console.log(logPrefix, 'testSelect:', testSelect);

if (runSelfTest == true){
    this.fnClearPending = function (){console.log(logPrefix, 'fnClearPending dummy function.');}

    var exampleTx = require("./exampleTX.json");
    selfTest(testLevel, testSelect);
}

module.exports = {
    processThis : coinProcessing
}
