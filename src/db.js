const mongoose = require('mongoose');
const UserSchema = require('../schemas/UserSchema');


// build our model to be able to access the database
const accountModel = mongoose.model('BankAccount', UserSchema);


async function main() { 
    await mongoose.connect('mongodb://localhost:27017/BirtwistleBank')
};
main().catch(err => console.log(err))
// connect to our database


// so, what are we looking at for our banking API?
// business requirements:
// open a bank account
// close a bank account
// withdraw funds
// deposit funds
// transfer funds
// create a log in functionality later
// => api should only be accessible with a unique identifier to denote the account being used

// generic class for attributing holder information to a card
class CardHolder {
    constructor(fname, lname)
    {
        this.fname = fname;
        this.lname = lname;
    }
}

// generic class for constructing new bank accounts to be stored in the database.
class Card {
    constructor(fname, lname, cardNumber)
    {
        this.cardHolder = new CardHolder(fname, lname);
        this.cardNumber = cardNumber;
        this.balance = 0;
    }
}

class Transaction {
    constructor(sender, receiver, amount)
    {
        this.sender = { fname: sender.fname, lname: sender.lname };
        this.receiver = { fname: receiver.fname, lname: receiver.lname };
        this.amount = amount;
        this.date = new Date();
    }
}

let getUser = async(id) => {
    let res = await accountModel.find({_id: id});
    res.forEach(user => {
        console.log(user);
    })
    return res;
}

let openNewAccount = async (client) => {

    let {username, password, fname, lname, address, pnumber} = client;

    try 
    {
        if ((await accountModel.find({"username": username})).length == 0)
        {
            // if that user doesn't already exist then open a new account
            const newAccount = new accountModel({username, password, fname, lname, address, pnumber, cards: []})
            await newAccount.save();
        }
    } catch (e) { console.log(e) }

}

let openNewCard = async (username) => {
    
    try {
        let cardNumber = Math.floor(Math.random() * 10000000000000000)
        // create new card under that account (update)
        let queryResult = await accountModel.findOne({username: username});
        let tempCards = queryResult.cards;
        tempCards.push(new Card(queryResult.fname, queryResult.lname, cardNumber));
        await accountModel.updateOne({username: username}, {cards: tempCards});
    } catch (e) { console.log(e) }


}

let closeAccount = async (cardNumber) => {
    // removes a card from an account

    try {
        let res = await accountModel.findOne({cardNumber: cardNumber});
        for (let i = 0; i < res.cards.length; i++)
        {
            if (res.cards[i].cardNumber === cardNumber && res.cards[i].balance === 0)
            {
                // found the card we need to delete, and its balance is at 0
                res.cards.splice(i, 1);
                // splice out the card we need to delete, save it in database
                await accountModel.updateOne({ "cards.cardNumber": cardNumber }, { cards: res.cards });
            }
        }
    } catch (e) { console.log(e) }
    
    // query for the account that owns the card specified by cardNumber
    // just saying -- this won't really work with my dual-owned cards idea haha... maybe i can fix this query later
    // maybe i can verify that card.cardHolder.fname === user.fname && card.cardHolder.lname === user.lname
    // i'll implement it later.

    // this might not be useful... just to tell the page we were successful in deleting it i guess
    return true

}

let withdraw = async (cardNumber, amount) => {
    try {
        if (amount < 0)
        {
            // this function just doesn't make sense if amount is negative
            return;
        }

        let res = await accountModel.findOne({"cards.cardNumber": cardNumber});
        for (let i = 0; i < res.cards.length; i++)
        {
            if (res.cards[i].cardNumber === cardNumber && res.cards[i].balance > amount)
            {
                // only allow to withdraw if they have more than the amount being withdrawed
                res.cards[i].balance -= amount;
                res.cards[i].transactions.push(new Transaction(res.cards[i].cardHolder, res.cards[i].cardHolder, 0 - amount))
                await accountModel.updateOne({ "cards.cardNumber": cardNumber }, { cards: res.cards });
                // return the new balance
                return res.cards[i].balance;
            }
        }
    } catch(e) { console.log(e) }
}

let deposit = async (cardNumber, amount) => {
    try {
        if (amount < 0)
        {
            // this function just doesnt make any sense if the amount is negative
            return
        }

        let res = await accountModel.findOne({"cards.cardNumber": cardNumber});
        for (let i = 0; i < res.cards.length; i++)
        {
            if (res.cards[i].cardNumber === cardNumber)
            {
                res.cards[i].balance += amount;
                res.cards[i].transactions.push(new Transaction(res.cards[i].cardHolder, res.cards[i].cardHolder, amount));
                await accountModel.updateOne({ "cards.cardNumber": cardNumber }, { cards: res.cards });
                // return the new balance
                return res.cards[i].balance;
            }
        }
    } catch(e) { console.log(e) }
}

let transfer = async (senderCardNumber, receiverCardNumber, amount) => {

    try {

        if (amount < 0)
        {
            // we can't take someones money with this function, only give... haha
            return;
        }

        let sender = await accountModel.findOne({"cards.cardNumber": senderCardNumber});
        let receiver = await accountModel.findOne({"cards.cardNumber": receiverCardNumber});


        for (let i = 0; i < sender.cards.length; i++)
        {

            if (sender.cards[i].cardNumber === senderCardNumber)
            {
                // we need to make sure that the sender actually has enough money to make this transaction
                if (sender.cards[i].balance < amount) return;
                // this line of code is very important !!!! 

                sender.cards[i].balance -= amount;
                sender.cards[i].transactions.push(new Transaction({fname: sender.fname, lname: sender.lname}, {fname: receiver.fname, lname: receiver.lname}, 0 - amount));
                await accountModel.updateOne({"cards.cardNumber": senderCardNumber}, {cards: sender.cards});
            }
        }

        for (let i = 0; i < receiver.cards.length; i++)
        {
            if (receiver.cards[i].cardNumber === receiverCardNumber)
            {
                receiver.cards[i].balance += amount;
                receiver.cards[i].transactions.push(new Transaction({fname: sender.fname, lname: sender.lname}, {fname: receiver.fname, lname: receiver.lname}, amount));
                await accountModel.updateOne({"cards.cardNumber": receiverCardNumber}, {cards: receiver.cards});
            }
        }
        
    } catch (e) { console.log(e) }
}

const getTransactions = async (cardNumber) => {
    let res = await accountModel.findOne({"cards.cardNumber": cardNumber});

    for (let i = 0; i < res.cards.length; i++)
    {
        if (res.cards[i].cardNumber === cardNumber);
        {
            return res.cards[i].transactions;
        }
    }
}


// development data
// let myClient = {
//     fname: 'King',
//     lname: 'Testgod',
//     address: '172 Neil Court',
//     pnumber: '104650725'
// }

// openNewAccount(myClient);
// closeAccount('7524347521163179');
// deposit('1928118405280019', 50000);
// withdraw('5237880601718106', 123);
// transfer('1928118405280019', '5393236545602653', 5000)
// getUser('32425933');

module.exports = { openNewAccount, openNewCard, closeAccount, deposit, withdraw, transfer, getTransactions };