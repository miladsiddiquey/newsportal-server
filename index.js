const express = require('express')
const bodyParser = require('body-parser');
// const ObjectID= require('mongodb').ObjectID;
// let ObjectId = require('mongodb').ObjectID;
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const cors = require('cors');
const { MongoClient,ObjectId } = require('mongodb');
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.c3tkh.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('topNewsImg'));
app.use(fileUpload());

const port = 5000




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const topNewsCollection = client.db("newsportalD").collection("topNews");
  console.log('database connected');

app.post('/addNews', (req, res) => {
  const file = req.files.file;
  const title = req.body.title;
  const name = req.body.name;
  const category = req.body.category;
  const shortDis = req.body.shortDis;
  const description = req.body.description;
  const filePath = `${__dirname}/topNewsImg/${file.name}`
  console.log(file,title,name,category,shortDis,description);
  file.mv(filePath,err =>{
    if(err){
      console.log(err);
       res.status(500).send({msg: 'failed to upload Image'});

    }
    const newImg = fs.readFileSync(filePath);
    const encImg = newImg.toString('base64');

    let image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer(encImg, 'base64')
    };


    topNewsCollection.insertOne({name, title, category,shortDis, description, image})
    .then(result => {
      fs.remove(filePath, error =>{
        if(error){
          console.log(error)
          res.status(500).send({msg: 'failed to upload Image'});
        }
        res.send(result.insertedCount>0)
      })
      
    })
  })
  
})

app.get('/topNewsData',(req, res) =>{
  topNewsCollection.find({})
  .toArray((err, documents) =>{
    res.send(documents);
  })
})

// technology page api
app.get('/technologyNews',(req, res) =>{
  topNewsCollection.find({category:"1"})
  .toArray((err, documents) =>{
    res.send(documents);
  })
})

//single data api
app.get('/news/:id',async(req, res) =>{
  const news = await topNewsCollection.findOne({_id:ObjectId(req.params.id)})
  res.json(news);
})



});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})