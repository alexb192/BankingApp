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


let openNewAccount = async (client) => {
    let cardNumber = Math.floor(Math.random() * 10000000000000000)
    // let cardNumber = 1234123412341234;

    // modeling the type of tuple we want inserted in the db
    let {fname, lname, address, pnumber} = client;

    try 
    {
        if ((await accountModel.find({fname: fname, lname: lname})).length == 0)
        {
            // open a new account
            const newAccount = new accountModel({fname, lname, address, pnumber, cards: [new Card(fname, lname, cardNumber)]})
            await newAccount.save().then(doc => console.log(`${doc} has been saved`));
        } else {
            // create new card under that account (update)
            let queryResult = await accountModel.findOne({fname: fname, lname: lname});
            let tempCards = queryResult.cards;
            tempCards.push(new Card(fname, lname, cardNumber));
            await accountModel.updateOne({fname: fname, lname: lname}, {cards: tempCards});
        }
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
                await accountModel.updateOne({ cardNumber: cardNumber }, { cards: res.cards });
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
        let res = await accountModel.findOne({cardNumber: cardNumber});
        for (let i = 0; i < res.cards.length; i++)
        {
            if (res.cards[i].cardNumber === cardNumber && res.cards[i].balance > amount)
            {
                // only allow to withdraw if they have more than the amount being withdrawed
                res.cards[i].balance -= amount;
                await accountModel.updateOne({ cardNumber: cardNumber }, { cards: res.cards });
                // return the new balance
                return res.cards[i].balance;
            }
        }
    } catch(e) { console.log(e) }
}

let deposit = async (cardNumber, amount) => {
    try {
        let res = await accountModel.findOne({cardNumber: cardNumber});
        for (let i = 0; i < res.cards.length; i++)
        {
            if (res.cards[i].cardNumber === cardNumber)
            {
                res.cards[i].balance += amount;
                await accountModel.updateOne({ cardNumber: cardNumber }, { cards: res.cards });
                // return the new balance
                return res.cards[i].balance;
            }
        }
    } catch(e) { console.log(e) }
}


// development data
let myClient = {
    fname: 'Transaction',
    lname: 'Test',
    address: '172 Neil Court',
    pnumber: '104650725'
}

// openNewAccount(myClient);
// closeAccount('7524347521163179');
// deposit('5237880601718106', 500);
// withdraw('5237880601718106', 123);

module.exports = { openNewAccount };