var express = require('express')
var app = express()

var MongoClient = require('mongodb').MongoClient;
var url =  "mongodb+srv://hieunt:EarthDefender@cluster0.vwoqw.mongodb.net/test";

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

var hbs = require('hbs')
app.set('view engine','hbs')

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:false}))

app.get('/',async (req,res)=>{
    let client= await MongoClient.connect(url);
    let dbo = client.db("ASM2");
    let results = await dbo.collection("product").find({}).toArray();
    res.render('home',{model:results})
})
app.get('/new',(req,res)=>{
    res.render('newProduct')
})
app.post('/insert',async (req,res)=>{
    let client= await MongoClient.connect(url);
    //Set database to insert
    let dbo = client.db("ASM2");
    let nameInput = req.body.productName;
    let priceInput = req.body.price;
    let colorInput = req.body.color;
    let stockInput = req.body.stock;
    let newProduct = {productName : nameInput, price:priceInput, color:colorInput, stock:stockInput};
    //Call the insert function
    await dbo.collection("product").insertOne(newProduct);
   
    let results = await dbo.collection("product").find({}).toArray();
    res.render('home',{model:results})
})
app.get('/search',async (req,res)=>{
    res.render('searchProduct')
})
app.post('/searchProduct',async (req,res)=>{
    let client= await MongoClient.connect(url);
    //Set database to insert
    let dbo = client.db("ASM2");
    let nameInput = req.body.productName;
    
    let results = await dbo.collection("product").find({$or : [{productName : new RegExp(nameInput, 'i')}, {color : new RegExp(nameInput, 'i')}]}).toArray();
    if (nameInput.length() > 3) res.render('home',{model:results})
})
app.get('/delete',async (req,res)=>{
    let id = req.query.pid;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id":ObjectID(id)};    

    let client= await MongoClient.connect(url);
    let dbo = client.db("ASM2");

    await dbo.collection("product").deleteOne(condition);
    res.redirect('/');
})

//update
app.get('/edit', async(req,res)=>{
    let id = req.query.pid;
    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id":ObjectID(id)}; 

    let client= await MongoClient.connect(url);
    let dbo = client.db("ASM2");
    let prod = await dbo.collection("product").findOne(condition);
    res.render('edit',{model:prod});
})
app.post('/update',async (req,res)=>{
    let client= await MongoClient.connect(url);
    let dbo = client.db("ASM2");

    let idInput = req.body.pid;
    let nameInput = req.body.productName;
    let priceInput = req.body.price;
    let colorInput = req.body.color;
    let stockInput = req.body.stock; 

    var ObjectID = require('mongodb').ObjectID;
    let condition = {"_id":ObjectID(idInput)}; 

    let updateProduct ={$set : {productName : nameInput, price:priceInput, color: colorInput, stock: stockInput}};
    await dbo.collection("product").updateOne(condition,updateProduct);
    res.redirect('/');
})

var PORT = process.env.PORT || 5000
app.listen(PORT);
console.log("Server is running at " + PORT)