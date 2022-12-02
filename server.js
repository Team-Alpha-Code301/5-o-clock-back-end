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


//create drink / ingredient ?
app.post('/barcart',async (req, res)=>{
  let result = await Drink.create(req.body);
  res.send(result);
} );


//update ingredient?
app.put('/barcart/:id', async (req, res)=>{
  let drinkData = await Drink.findByIdAndUpdate(req.params.id, req.body);
  res.send(drinkData);
});


//delete ingredient / drink?
app.delete('/barcart/:id',async (req, res)=> {
  let deleted = await Drink.findByIdAndDelete(req.params.id);
  res.send('deleted');
});





app.listen(PORT, () => console.log(`listening on ${PORT}`));
