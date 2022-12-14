require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const axios = require('axios');
const User = require('./model/User');

app.use(cors());
app.use(express.json());
const verifyUser = require('./auth');

//------connect to MongoDB------//
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Mongoose is connected');
});

const PORT = process.env.PORT || 3001;

app.get('/test', (req, res) => {
  res.send('test request received');
});

app.get('/getcocktails', getCocktails);
app.get('/displaycocktail', displayCocktail);


//get API data
async function getCocktails(req, res) {
  verifyUser(req, async (err, user) => {
    if (err) {
      console.log(err);
      res.send('invalid token');
    } else {
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
  });
}

//get the instruction
//first, loop over the ingredients, // if it's not null , get the measurement, push into array
//(oneCocktail.data.drinks[0].strMeasure[i] !== null) ? oneCocktail.data.drinks[0].strMeasure[i] : '' ;

async function displayCocktail(req, res) {
  let name = req.query.name;
  try {
    let oneCocktail = await axios(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${name}`);
    let cleanUpData = [];
    console.log(oneCocktail.data.drinks[0].strIngredient1);
    for (let i = 1; i <= 15; i++) {
      if (oneCocktail.data.drinks[0][`strIngredient${i}`] !== null) {
        cleanUpData.push((oneCocktail.data.drinks[0][`strMeasure${i}`] !== null) ? (oneCocktail.data.drinks[0][`strMeasure${i}`] + oneCocktail.data.drinks[0][`strIngredient${i}`]) : oneCocktail.data.drinks[0][`strIngredient${i}`]);
      }
    }
    let newDrink = {
      name: name,
      ingredients: cleanUpData,
      instruction: oneCocktail.data.drinks[0]['strInstructions'],
    };
    let result = new DrinkDetail(newDrink);
    res.send(result);
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

class DrinkDetail {
  constructor(drink) {
    this.name = drink.name;
    this.ingredients = drink.ingredients;//array
    this.instruction = drink.instruction;
  }
}

//CRUD

// / add new user document/object into mongoDB upon first login
// app.post('/users', newUser);
app.post('/users', async (req, res) => {
  verifyUser(req, async (err, user) => {
    if (err) {
      console.log(err);
      res.send('invalid token');
    } else {
      let newUser = await User.create(req.body);
      res.send(newUser);
    }
  });
});

// get info for all users (for testing purposes)
app.get('/users', getAllUsersData);

async function getAllUsersData(req, res) {
  try {
    let getUsers = await User.find();
    res.send(getUsers);
  } catch (e) {
    res.send('no data found').status(500);
  }
}

app.get('/users/:email', getUserData);

async function getUserData(req, res) {
  verifyUser(req, async (err, user) => {
    if (err) {
      console.log(err);
      res.send('invalid token');
    } else {
      try {
        let userEmail = req.params.email;
        let getUserByEmail = await User.findOne({ email: userEmail });
        res.send(getUserByEmail);
      } catch (e) {
        res.send('no data found').status(500);
      }
    }
  }
  );
}

// update user when they add/delete items from bar cart
// app.put('/users/:email', updateUser);
app.put('/users/:email', async (req, res) => {
  verifyUser(req, async (err, user) => {
    if (err) {
      console.log(err);
      res.send('invalid token');
    } else {
      try {
        let updatedData;
        //If barCartItems is a string, meaning it is a new input, 
        //... push it to existing data.
        //If barCartItems is an array, meaning the user delete one of existing ingredients inside the array,
        //... update to the database.
        if(typeof req.body.barCartItems === "string"){
          updatedData = await User.findOneAndUpdate({ email: req.params.email }, { $push : {barCartItems: req.body.barCartItems}});
        }else if (Array.isArray(req.body.barCartItems)){
          updatedData = await User.findOneAndUpdate({ email: req.params.email }, {barCartItems: req.body.barCartItems});
        }
        res.send(updatedData);
      } catch (e) {
        res.send(e.message).status(500);
      }
    }
  });
});

// app.patch('/users/:email', async (req, res) => {
//   verifyUser(req, async (err, user) => {
//     if (err) {
//       console.log(err);
//       res.send('invalid token');
//     } else {
//       try {
//         let updatedData = await User.findOneAndUpdate({ email: req.params.email }, {barCartItems: req.body.barCartItems});
//         // getUserData(req.params.email)
//         res.send(updatedData);
//       } catch (e) {
//         res.send(e.message).status(500);
//       }
//     }
//   });
// });


// if necessary, delete user's bar cart from MongoDB
// app.delete('/users/:email', deleteUser);
app.delete('/users/:email', async (req, res) => {
  verifyUser(req, async (err, user) => {
    if (err) {
      console.log(err);
      res.send('invalid token');
    } else {
      let deleted = await User.findOneAndDelete({ email: req.params.email });
      res.send('deleted' + deleted);
    }
  });
});


app.listen(PORT, () => console.log(`listening on ${PORT}`));
