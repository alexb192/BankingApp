const express = require('express');
const app = express();
app.use(express.json());
const db = require('./src/db');
const { v4 } = require('uuid');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get('/api/', (req, res) => {
    res.send('Internal Banking API');
    // not sure what to use this for, as the api should be internal
})

// this is for api key handling

const verifyKey = (username, key) => {

    // search for a user with that key
    let matched = false;

    clients.forEach(client => {
        if (client.key === key && client.username === username)
        {
            matched = true;
        }
    })

    return matched;
}

// contains client = {username, key} objects
let clients = [{username: 'test', key: 'testkey'}];

app.post(`/api/createaccount/`, (req, res) => {
    // we don't need to verify a key
    try {
        if (req.body.username && req.body.password && req.body.fname && req.body.lname && req.body.address && req.body.pnumber)
        {
            db.openNewAccount(req.body);
            res.sendStatus(200);
        } else res.sendStatus(400);
    } catch(e) { 
        res.status(500).send(e);
    }
})

app.post(`/api/opennewcard/:username`, (req, res) => {

    // does the user have a valid key?
    if (!verifyKey(req.body.username, req.body.key))
    {
        res.sendStatus(401);
        return;
    }

    try {
        if (req.params.username)
        {
            db.openNewCard(req.params.username);
            res.sendStatus(200);
        } else (res.sendStatus(400));
    } catch (e) { 
        res.status(500).send(e);
    }
})

app.post(`/api/withdraw/:cardNumber/:amount`, async (req, res) => {
    let cardNumber = req.params.cardNumber;
    let amount = req.params.amount;
    let newBalance = 0;

    if (!verifyKey(req.body.username, req.body.key))
    {
        res.sendStatus(401);
        return;
    }

    try {
        newBalance = await db.withdraw(cardNumber, amount);
        res.status(200).send(JSON.stringify(newBalance));
    } catch (e) {
        res.status(500).send(e);
    }
});

app.post(`/api/deposit/:cardNumber/:amount`, async (req, res) => {
    let cardNumber = req.params.cardNumber;
    let amount = parseInt(req.params.amount);
    let newBalance = 0;

    if (!verifyKey(req.body.username, req.body.key))
    {
        res.sendStatus(401);
        return;
    }

    try {
        newBalance = await db.deposit(cardNumber, amount);
        res.status(200).send({newBalance: newBalance});
    } catch (e) {
        res.status(500).send(e);
    }
});

app.post(`/api/transfer/:sender/:receiver/:amount`, async (req, res) => {
    let sender = req.params.sender;
    let receiver = req.params.receiver;
    // just to avoid confusion, sender and receiver are card numbers.
    let amount = parseInt(req.params.amount);

    // does the user have a valid key?
    if (!verifyKey(req.body.username, req.body.key))
    {
        res.sendStatus(401);
        return;
    }

    try {
        await db.transfer(sender, receiver, amount);
        res.sendStatus(200);
    } catch(e) { res.status(500).send(e) }
});

app.get(`/api/gettransactions/:cardNumber/`, async (req, res) => {

    if (!verifyKey(req.body.username, req.body.key))
    {
        res.sendStatus(401);
        return;
    }

    db.getTransactions(req.params.cardNumber).then(transactions => {
        res.status(200).send((transactions));
    })
})

app.post(`/api/login`, async (req, res) => {

    let key = v4();

    if (req.body.username && req.body.password)
    {
        try {
            let successful = await db.Login(req.body.username, req.body.password);
            if (successful) 
            {
                clients.push({username: req.body.username, key: key})
                res.status(200).send({key: key});
            }
        } catch (e) { res.status(400).send(e) }

    }
})

app.post(`/api/getcards/:username`, async (req, res) => {
    
    if (!verifyKey(req.body.username, req.body.key))
    {
        res.sendStatus(401);
        return;
    }

    let cards = await db.getCards(req.params.username);
    res.send(cards);
})

// so, what are we looking at for our banking API?
// business requirements:
// open a bank account
// close a bank account
// withdraw funds
// deposit funds
// transfer funds
// create a log in functionality later
// => api should only be accessible with a unique identifier to denote the account being used

app.listen(8080);