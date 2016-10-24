var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var port = process.env.PORT ||  3000;
var crypto = require("crypto");
var path = require('path');
var config = require('./config'); // holds information about hosting
var Url = require('./models/Url.model'); //this holds our Schema model
var LookUp = require('./models/Lookup.model.js'); //this holds our Schema lookup
var db ='mongodb://heroku_0xrn515v:v09cpj5t25qtm73klv2poj5n5h@ds031157.mlab.com:31157/heroku_0xrn515v'

mongoose.connect(db)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/',function(req,res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
})

app.post('/api/shorten',function(req,res){
  var regex = /https:\/\/|http:\/\//
    //Check if the user input correctly with http or https format
    //if true, proceed. Otherwise, return a string with home direct link
  if(regex.test(req.body.long_url)){
    var longUrl = req.body.long_url;
    var shortUrl = ""
    //check if document (url) exist already in collection
    Url.findOne({
      long_url : longUrl
    })
      .exec(function(err,result){
        if (err) throw err
        else{
          //if the long url is in the collection, simply return the short_url
          if(result){
            LookUp.findOne({
              key: result._id
            })
              .exec(function(err,result){
                res.send({shortUrl: result.shortUrl,
                  shortUrlString: result.shortUrl })
              })
          }
          //if the long url isn't in the collection, make a new short_url for it
          else{
            var newUrl = new Url();
            newUrl.long_url = longUrl
            newUrl.save( function(err,result){
              if(err){
                console.log('error!')
              } else{
                var newLookUp = new LookUp();
                newLookUp.key = result._id;
                var id = crypto.randomBytes(2).toString('hex');
                newLookUp.shortUrl = id
                newLookUp.save( function( err, result){
                  if (err) throw err
                  else{
                    res.send({shortUrl: result.shortUrl})
                  }
                })
              }
            })
          }
        }
      })
  } else{
    res.send({shortUrl: "#"})
  }
})

//directs to the long URL that user requested from short-url
app.get('/:id', function(req, res){
  var shortenURL = req.params.id;
  LookUp.findOne({
    shortUrl: shortenURL
  })
    .exec(function(err,result){
      if (err) throw err;
      if (result === null){
        res.send({shortUrl: 'nope'})
      } else{
        Url.findOne({
          _id: result.key
        })
          .exec(function(err,resultLink){
            res.redirect(resultLink.long_url)
          })
      }

    })
});

app.listen(port,function(){
  console.log('listening in port', port);
})
