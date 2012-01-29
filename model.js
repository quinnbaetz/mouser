var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var linePos = 0;


var model = function(host, port) {
    this.db= new Db('sample', new Server(host, port, {auto_reconnect: true}, {}));
    this.db.open(function(err){
        console.log('Connected?', err)
    });
};



model.prototype.addPost = function(id, comment) {
  this.getCollection(function(error, article_collection) {
    if( error ){
        console.log("error posting")
    } else {
       console.log(id);
       console.log(article_collection.find({_id: id}));
      article_collection.update(
        {_id: id},
        {"$push": {comments: comment}},
        {"upsert": true},
        function(error){
            console.log("pushed on a comment", error);
        });
    }
  });
};

model.prototype.getPosts = function(id, callback) {
    this.getCollection(function(error, article_collection) {
        if( error ){
            callback(error)
        }else {
          article_collection.findOne({_id: id}, function(error, result) {
            if( error ) callback(error)
            else callback(null, result)
          });
        }
      });
  };
//getCollection

model.prototype.getCollection= function(callback) {
  this.db.collection('comments', function(error, article_collection) {
    if( error ) callback(error);
    else callback(null, article_collection);
  });
};

exports.db = model;
