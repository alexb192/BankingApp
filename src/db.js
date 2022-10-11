const mongoose = require('mongoose');
const UserSchema = require('../schemas/UserSchema');

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

    console.log((await accountModel.find({fname: fname, lname: lname})).length);
    
    if ((await accountModel.find({fname: fname, lname: lname})).length == 0)
    {
        // open a new account
        console.log(new Card(fname, lname, cardNumber));
        const newAccount = new accountModel({fname, lname, address, pnumber, cards: [new Card(fname, lname, cardNumber)]})
        await newAccount.save().then(doc => console.log(`${doc} has been saved`));
    } else {
        // create new card under that account (update)
        let queryResult = await accountModel.findOne({fname: fname, lname: lname});
        let tempCards = queryResult.cards;
        tempCards.push(new Card(fname, lname, cardNumber));
        console.log(tempCards[tempCards.length - 1].cardHolder)
        await accountModel.updateOne({fname: fname, lname: lname}, {cards: tempCards});
        
    }

}

let closeAccount = async (cardNumber) => {
    // this is a pretty dangerous function to have tbh but im just including it in the backend
    // let's just make a restriction on it that requires the funds to be at a complete 0.
    if (await accountModel.find({ cardNumber: cardNumber }, 'balance') == 0)
    {
        await accountModel.deleteOne({ cardNumber: cardNumber });
        console.log(`deleted ${cardNumber} successfully`);
    }
       
}


// closeAccount(8376562680277853);
// development data
let myClient = {
    fname: 'Acd',
    lname: 'Dood',
    address: '172 Neil Court',
    pnumber: '104650725'
}

openNewAccount(myClient);

module.exports = { openNewAccount };