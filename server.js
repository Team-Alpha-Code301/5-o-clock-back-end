require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');

app.use(cors());
app.use(express.json());


//------connect to MongoDB------//
// const mongoose = require('mongoose');
// mongoose.connect(process.env.DB_URL);

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function () {
//   console.log('Mongoose is connected');
// });


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
  let id = req.query.id;
  console.log(id);
  let url = `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`;
  try {
    let oneCocktail = await axios.get(url);
    let displayAdrink = new DrinkDetail(oneCocktail.data);
    res.send(displayAdrink);
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
    this.id = drink.idDrink;
    this.name = drink.strDrink;
    this.src = drink.strDrinkThumb;
    this.instruction =drink.strInstructions;
  }
}






app.listen(PORT, () => console.log(`listening on ${PORT}`));
