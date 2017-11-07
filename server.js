// server.js
// where your node app starts

// init project
var express = require('express');
var shortid = require("shortid")
var urlvalid = require("tldjs")
var app = express();
var mongo = require("mongodb").MongoClient
var config = require("./config")
var url = "mongodb://" + config.db.host + "/" + config.db.name

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(express.static("views"));



app.get("/new/:url(*)", function(req, res){
  
  mongo.connect(url, function(err, db){
    var collection = db.collection("urls")
    var url = req.params.url
    console.log("connected")
    
    if(err){console.error(err)}
    if(urlvalid.parse(url).tldExists && urlvalid.parse(url).isValid){
      console.log(urlvalid.parse(url).tldExists)
      collection.findOne({"url": url}, {short: 1, _id: 0}, function(err, data){
        if(data != null){
          console.log("old")
          res.json({url: url, short:"https://url-shortening.glitch.me/"+data.short})
          db.close()
        }
        else {
          console.log("new")
          var newid = shortid.generate()
          res.json({url: url,short: "https://url-shortening.glitch.me/"+newid})
          collection.insert([{url: url, short: newid}])
          db.close()
          
        }
      })
    }
    else {
      res.json({error: "Wrong url format, make sure you have a valid protocol and real site"})
    }
  })
})

app.get("/:short", function(req, res){
  var shortlink = req.params.short
  mongo.connect(url, function(err, db){
    var collection = db.collection("urls")
    
    if(err){console.error(err)}
    else {      
      collection.findOne({"short": shortlink}, {url: 1, _id: 0}, function(err, data){
        if(err){
          res.json({error: "URL not found"})
        }
        else {
          res.redirect(data.url)
        }
      })
    }
    db.close()
  })
})

function newLink (db, callback){ 
}

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/index.html');
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
