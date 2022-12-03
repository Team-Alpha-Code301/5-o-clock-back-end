require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');
const Drink = require('./model/Drink');
// const User = require('./model/User');

app.use(cors());
app.use(express.json());


//------connect to MongoDB------//
const mongoose = require('mongoose');
const User = require('./model/User');
mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Mongoose is connected');
});


const PORT = process.env.PORT || 3001;

// 1. get data from API
//set up schema
// 2. perform CRUD
// 3. set up Auth0

app.get('/test', (req, res) => {
  res.send('test request received');
});

app.get('/getcocktails', getCocktails);
app.get('/displaycocktail', displayCocktail);


//get API data
async function getCocktails(req, res) {
  let url = `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${req.query.i}`;
  try {
    let filteredList = await axios.get(url);
    let drinkList = filteredList.data.drinks.map(obj => new Drinks(obj));
    let displayDrinks = drinkList.slice(0, 20);
    res.send(displayDrinks);
  } catch (e) {
    res.send(e.error);
  }
}

async function displayCocktail(req, res) {
  let name = req.query.name;
  try { //ninja getting name, ingredients,and instructions
    let oneCocktail = await axios({
      method:'GET',
      url:`https://api.api-ninjas.com/v1/cocktail?name=${name}`,
      headers: {
        'X-Api-Key': process.env.NINJAS_KEY
      }
    });
    let matchName = oneCocktail.data.find(obj => obj.name.includes(name.toLowerCase()));
    res.send(new DrinkDetail(matchName));
  } catch (e) {
    res.send(e.error);
  }
}


class Drinks { //this is from cocktailDB
  constructor(drink) {
    this.id = drink.idDrink;
    this.name = drink.strDrink;
    this.src = drink.strDrinkThumb;
  }
}

class DrinkDetail {//this is from Ninja
  constructor(drink) {
    this.name = drink.name;
    this.ingredients= drink.ingredients;
    this.instruction = drink.instructions;
  }
}



//CRUD


// / add new user document/object into mongoDB upon first login
// app.post('/users', newUser);
app.post('/users',async (req, res)=>{
  let newUser = await User.create(req.body);
  res.send(newUser);
} );

// // pull user's info when they login after the first time
// app.get('/users/:email', getUserByEmail);
app.get('/users/:email', async (req,res) =>{

  let url = `${process.env.DB_URL}/users/${req.body}`;
  let getUserByEmail = await User.get(url);
  res.send(getUserByEmail);
});


// // update user when they add/delete items from bar cart
// app.put('/users/:email', updateUser);
app.put('/barcart/:id', async (req, res)=>{
  let drinkData = await User.findByIdAndUpdate(req.params.id, req.body);
  res.send(drinkData);
});


// // if necessary, delete user
// // app.delete('/users/:email', deleteUser);
app.delete('/barcart/:id',async (req, res)=> {
  let deleted = await User.findByIdAndDelete(req.params.id);
  res.send(deleted);
});





app.listen(PORT, () => console.log(`listening on ${PORT}`));
