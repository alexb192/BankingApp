const express = require('express');
const app = express();
app.use(express.json());
const db = require('./src/db');

app.get('/', (req, res) => {
    res.send('Internal Banking API');
    // not sure what to use this for, as the api should be internal
})

app.post(`/createaccount/`, (req, res) => {
    // let client = {fname: req.fname, lname: req.lname, address: req.address, pnumber: req.pnumber};
    // db.openNewAccount(client);
    try {
        db.openNewAccount(req.body);
        res.sendStatus(200);
    } catch(e) { 
        res.sendStatus(500);
        res.send(e);
    }
})

app.post(`/withdraw/:cardNumber/:amount`, (req, res) => {
    let cardNumber = req.params.cardNumber;
    let amount = req.params.amount;

    try {
        db.withdraw(cardNumber, amount);
        console.log(`${cardNumber} has withdrawed $${amount}`);
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(500);
        res.send(e);
    }
});

app.post(`/deposit/:cardNumber/:amount`, (req, res) => {
    let cardNumber = req.params.cardNumber;
    let amount = parseInt(req.params.amount);
    let newBalance = 0;

    try {
        newBalance = db.deposit(cardNumber, amount);
        console.log(`${cardNumber} has deposited $${amount}`);
        // res.sendStatus(200);
        res.send(JSON.stringify(newBalance));
    } catch (e) {
        res.sendStatus(500);
        res.send(e);
    }
});


// so, what are we looking at for our banking API?
// business requirements:
// open a bank account
// close a bank account
// withdraw funds
// deposit funds
// transfer funds
// create a log in functionality later
// => api should only be accessible with a unique identifier to denote the account being used

app.listen(3000);