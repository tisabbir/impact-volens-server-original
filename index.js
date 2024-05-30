// requirements
const express = require('express');
const cors = require('cors')
require('dotenv').config();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//app
const app = express();

//port address
const port = process.env.PORT || 5000;

//middle wares 
app.use(cors({
    origin : ['http://localhost:5173', 'https://impact-volens.web.app', 'https://impact-volens.firebaseapp.com'],
    credentials : true,
}))
app.use(express.json())
app.use(cookieParser()) // client theke ana cookie server porar jonne eta middle ware hishebe kaj korbe


//my middlewares
const verifyToken = (req, res, next)=>{
    //

    const token = req?.cookies?.token;

    // console.log('from middle ware monsters', token);

    //token jodi na thake
    if(!token){
        return res.status(401).send({message : 'unauthorized access'})
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
        if(err){
            return res.status(401).send({message:'unauthorized'})
        }
        req.user = decoded;
        // console.log('middle monster',req.user);
        next();
    })

    // next();


    
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bq6unn4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const cookieOption = {
    httpOnly:true,
    sameSite:process.env.NODE_ENV === "production" ? "none" : "strict",
    secure:process.env.NODE_ENV === "production" ? true : false,
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // collection db
    const typesCollection = client.db('volunteeringDB').collection('typesCollection');
    const bannerCollection = client.db('volunteeringDB').collection('bannerCollection');
    const needCollection = client.db('volunteeringDB').collection('needCollection');
    const postCollection = client.db('volunteeringDB').collection('postCollection');
    const requestCollection = client.db('volunteeringDB').collection('requestCollection');
    const reviewCollection = client.db('volunteeringDB').collection('reviewCollection');


    //auth related codes

    app.post('/jwt', async(req, res)=>{
        const user = req.body;
       
        // console.log(user);

        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1h'})

        res
        .cookie('token', token, cookieOption )
        .send({success : true})
    })

    // app.post('/logout', async(req, res)=>{
    //     const user = req.body;
    //     res.clearCookie('token', {maxAge:0}).send({success:true})
    // })
    
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

    //add volunteer post
    // app.get('/post', async(req, res)=> {
        
    //     const posts = await postCollection.find().toArray();
    //     res.send(posts)
    // })

    app.get('/public', async(req, res)=> {
        
        const posts = await postCollection.find().toArray();
        res.send(posts)
    })

    app.get('/post', verifyToken, async(req, res)=> {
        
        // console.log('request er query', req.query?.email);
        // console.log('token jei bektir', req.user);

        if(req.query.email !== req.user.email){
            return res.status(403).send({message: 'forbidden access'})
        }

        let query = {};
        if (req.query?.email) {
            query = { email: req.query.email }
        }

        const posts = await postCollection.find(query).toArray();
        res.send(posts)
    })


    app.get('/post/:id', verifyToken, async(req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await postCollection.findOne(query);
        res.send(result);
    })

    app.post('/post', verifyToken, async(req, res)=>{
        const post = req.body;
        const result = await postCollection.insertOne(post);
        res.send(result);
    })

    //update posts
    app.put('/post/:id',verifyToken, async(req, res)=>{

        const id = req.params.id; 
        // console.log(id);
        const filter = {_id : new ObjectId(id)}
        const options = { upsert: true };
        const incomingPost = req.body;
        // console.log('incoming post', incomingPost);
        //updated value
        const updatePost = {
            $set: {
              
                title : incomingPost.updatedTitle,
                thumbnail : incomingPost.updatedThumbnail,
                description : incomingPost.updatedDescription,
                category : incomingPost.updatedCategory,
                location : incomingPost.updatedLocation,
                numberOfVolunteer : incomingPost.updatedNumberOfVolunteer,
                deadline : incomingPost.updatedDeadline,
              
            },
          };

          const result = await postCollection.updateOne(filter, updatePost,options)
          res.send(result)
    })

    //delete posts
    app.delete('/post/:id', async(req, res)=>{
        const id = req.params.id;
        const query = { _id : new ObjectId(id)}
        const result = await postCollection.deleteOne(query)
        res.send(result)
    })


    //volunteer Request

    app.get('/request', verifyToken, async(req, res)=> {
        // console.log('request er query', req.query?.email);
        // console.log('token ta kon user er?',req.user?.email);

        //jodi j user request korece se ebong jar token se ekoi bekti na hoy
        if(req.user.email !== req.query.email){
            return res.status(403).send({message: 'forbidden access'})
        }


        // console.log(req.query.email === req.user.email);
        //valo kotha j, token ta tomar, kintu tomak to ar sobar data dibo na, tomake dibo shudu tomar data
        //se jonne amar database theke tomar data gula filter korbo, kemne korbo ? query diye korbo.
        
        let query = {};
        if (req.query?.email) {
            query = { volunteerEmail: req.query.email }
        }

        // console.log('query', query);
        
        const requests = await requestCollection.find(query).toArray();
        res.send(requests)
    })

    app.post('/request', async(req, res)=>{
        const request = req.body;
        // console.log(request);
        const result = await requestCollection.insertOne(request);
        res.send(result);
    })

    //delete
    app.delete('/request/:id', async(req, res)=>{
        const id = req.params.id;
        const query = { _id : new ObjectId(id)}
        const result = await requestCollection.deleteOne(query)
        res.send(result)
    })

    //feedback related api
    app.get('/feedback/:id', async(req,res)=>{
        const id = req.params.id;
        const query = { _id : new ObjectId(id)}
        const result = await requestCollection.findOne(query)
        res.send(result)
    })

    app.get('/reviews', async(req,res)=>{
        const result = await reviewCollection.find().toArray();
        res.send(result);
    })

    app.post('/reviews', async(req,res)=>{
        const post = req.body;
        const result = await reviewCollection.insertOne(post);
        res.send(result);
    })


    



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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