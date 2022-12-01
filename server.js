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

app.get('/cocktails',getCocktails);




async function getCocktails(req, res){
  let url = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=Gin';
  try {
    let filteredList = await axios.get(url);
    // reutrn a list of drinks name in array Obj
    //let cleanUpData = filteredList.data.drinks[1].strDrink;
    console.log(filteredList.data);
    res.send(filteredList.data);
  } catch (e) {
    res.send('error');
  }
}

app.listen(PORT, () => console.log(`listening on ${PORT}`));
