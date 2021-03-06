var chai = require('chai')
var should = chai.should()
var chaiHttp = require('chai-http')
var chaiJsonEqual = require('chai-json-equal')
var chaiFuzzy = require('chai-fuzzy')
var chaiLike = require('chai-like')
var app = require('../app')
var Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
var fs = require('fs')

chai.use(chaiHttp)
chai.use(chaiFuzzy)
chai.use(chaiJsonEqual)
chai.use(chaiLike)

describe('testing article api', function() {
  var idDummy = null
  var token = jwt.sign({ username: 'admin', _id: '59f7402ac7f8496fe760b8fa'}, process.env.JWT_KEY);
  before(function(done) {
    Blog.clear({}).then((removed) => {
      done()
    })
  });
  after(function() {
    Blog.clear({}).then((removed) => {

    })
  })
  describe('post new article route', function() {
    it('should return the inserted data', function(done) {
      chai.request(app).post('/api/article').attach("imageFile", fs.readFileSync("./fruitbowl.jpg"), "fruitbowl.jpg")
        .field("title", 'Title Baru')
        .field("content", 'Content Baru')
        .field("author", token).end(function(err, response) {
          response.status.should.equal(200)
          response.body.should.be.an('object')
          var insertedData = {
            title: 'Title Baru',
            content: 'Content Baru',
            author: '59f7402ac7f8496fe760b8fa',
          }
          response.body.should.like(insertedData);
          // response.body.should.have.property('_id')
          // response.body.should.have.property('title')
          // response.body.should.have.property('content')
          // response.body.should.have.property('author')
          // response.body.title.should.equal('Title Baru')
          // response.body.content.should.equal('Content Baru')
          // response.body.author.should.equal('Author Baru')
          idDummy = response.body._id
          done()
        })
    })
    it('should return error not enough param', function(done) {
      chai.request(app).post('/api/article').attach("imageFile", fs.readFileSync("./fruitbowl.jpg"), "fruitbowl.jpg")
        .field("title", 'Title Baru')
        .field("author", token).end(function(err, response) {
          response.status.should.equal(500)
          response.body.should.be.an('object')
          response.body.message.should.equal('Blog validation failed: content: Path `content` is required.')
          done()
        })
    })
    it('should return error jwt not valid', function(done) {
      chai.request(app).post('/api/article').attach("imageFile", fs.readFileSync("./fruitbowl.jpg"), "fruitbowl.jpg")
        .field("title", 'Title Baru')
        .field("content", 'Content Baru')
        .field("author", '59f7402ac78496fe760b8fa').end(function(err, response) {
          response.status.should.equal(500)
          response.body.should.be.an('object')
          response.body.message.should.equal('jwt malformed')
          done()
        })
    })
  })
  describe('get all article data', function() {
    it('should return all data', function(done) {
      chai.request(app).get('/api/article').end(function(err, response) {
        response.status.should.equal(200)
        response.body.should.be.an('array')
        response.body.should.have.lengthOf(1)
        var insertedData1 = {
          title: 'Title Baru',
          content: 'Content Baru',
          author: '59f7402ac7f8496fe760b8fa',
        }
        response.body[0].should.like(insertedData1);

        done()
      })
    })
  })
  describe('get all article data by user_id', function() {
    it('should return all article from user', function(done) {
      chai.request(app).get('/api/article/user/'+token).end(function(err, response) {
        response.status.should.equal(200)
        response.body.should.be.an('array')
        response.body.should.have.lengthOf(1)
        var insertedData1 = {
          title: 'Title Baru',
          content: 'Content Baru',
          author: '59f7402ac7f8496fe760b8fa',
        }
        response.body[0].should.like(insertedData1);

        done()
      })
    })
    it('should error jwt not valid', function(done) {
      chai.request(app).get('/api/article/user/59f7402ac7f496fe760b8fa').end(function(err, response) {
        response.status.should.equal(500)
        response.body.should.be.an('object')
        // response.body.message.should.equal('Cast to ObjectId failed for value "59f7402ac7f496fe760b8fa" at path "author" for model "Blog"')
        response.body.message.should.equal('jwt malformed')
        done()
      })
    })
  })
  describe('get one article data', function() {
    it('should return one data', function(done) {
      chai.request(app).get('/api/article/' + idDummy).end(function(err, response) {
        response.status.should.equal(200)
        response.body.should.be.an('object')
        var insertedData1 = {
          title: 'Title Baru',
          content: 'Content Baru',
          author: '59f7402ac7f8496fe760b8fa',
        }
        response.body.should.like(insertedData1);
        done()
      })
    })
    it('should not return data', function(done) {
      chai.request(app).get('/api/article/1').end(function(err, response) {
        response.status.should.equal(500)
        response.body.should.be.an('object')
        response.body.message.should.equal('Cast to ObjectId failed for value "1" at path "_id" for model "Blog"')
        done()
      })
    })
  })
  describe('update one article data', function() {
    it('should return updated data ', function(done) {
      chai.request(app).put('/api/article/' + idDummy).send({
        title: 'Title',
        content: 'Content'
      }).end(function(err, response) {
        response.status.should.equal(200)
        response.body.should.be.an('object')
        var insertedData1 = {
          title: 'Title',
          content: 'Content',
          author: '59f7402ac7f8496fe760b8fa',
        }
        response.body.should.like(insertedData1);
        done()
      })
    })
  })
  describe('delete one article data', function(){
    it('should return deleted data', function(done) {
      chai.request(app).delete('/api/article/' + idDummy).end(function(err, response) {
        response.status.should.equal(200)
        response.body.should.be.an('object')
        var insertedData1 = {
          title: 'Title',
          content: 'Content',
          author: '59f7402ac7f8496fe760b8fa',
        }
        response.body.should.like(insertedData1);
        done()
      })
    })
  })
})
