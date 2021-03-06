const express = require('express');
const morgan = require('morgan');
const redis = require('redis');
const bodyParser = require('body-parser');
const app = express();
const path =require('path');
let client = redis.createClient(6379,'127.0.0.1');

app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(function(req,res,next){
    req.cache = client;
    next();
});
app.set('views', path.join(__dirname,'views'));
app.set('view engine','pug');

app.get('/',function(req,res){
    res.render('index', {title:"Hey",message:"Hello"});
});

app.post('/profile',function(req,res,next){
    req.accepts('application/json');
    let key = req.body.name;
    let value = JSON.stringify(req.body);
    console.log(key);
    console.log(value);
    req.cache.set(key,value,function(err,data){
         if(err){
               console.log(err);
               res.send("error "+err);
               return;
         }
         req.cache.expire(key,10);
         res.json(value);
         //console.log(value);
    });
})
app.get('/profile/:name',function(req,res,next){
    var key = req.params.name; 
    console.log(key);
    req.cache.get(key,function(err,data){
         if(err){
               console.log(err);
               res.send("error "+err);
               return;
         }
         var value = JSON.parse(data);
	 console.log(value);
         res.json(value);
    });
});

app.listen(3000,()=>{
    console.log("port 3000")
})
