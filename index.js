// requirements
const express = require('express');
const cors = require('cors')

//app
const app = express();

//port address
const port = process.env.PORT || 5000;

//middle wares 
app.use(cors())
app.use(express.json())


app.get('/', (req, res)=>{
    res.send('Volunteering is going on...')
})

app.listen(port, ()=>{
    console.log(`Impact Volens is running on port : ${port}`)})