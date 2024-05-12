// requirements
const express = require('express');
const cors = require('cors')
require('dotenv').config();
// require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

//app
const app = express();

//port address
const port = process.env.PORT || 5000;

//middle wares 
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bq6unn4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // collection db
    const typesCollection = client.db('volunteeringDB').collection('typesCollection');
    const bannerCollection = client.db('volunteeringDB').collection('bannerCollection');
    const needCollection = client.db('volunteeringDB').collection('needCollection');

    
    //types
    app.get('/types', async(req, res)=> {
        const types = await typesCollection.find().toArray();
        res.send(types)
    })

    //banners   
    app.get('/banners', async(req, res)=> {
        const types = await bannerCollection.find().toArray();
        res.send(types)
    })


    //need   
    app.get('/need', async(req, res)=> {
        const types = await needCollection.find().toArray();
        res.send(types)
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('Volunteering is going on...')
})

app.listen(port, ()=>{
    console.log(`Impact Volens is running on port : ${port}`)})