//Create web server
var express = require('express');
var router = express.Router();
//Import comment model
var Comment = require('../models/comment');
//Import article model
var Article = require('../models/article');
//Import user model
var User = require('../models/user');
//Import auth
var auth = require('../config/auth');
//Import is admin
var isAdmin = auth.isAdmin;

//Get comments
router.get('/', isAdmin, function(req, res){
    Comment.find(function(err, comments){
        if(err){
            return console.log(err);
        }
        res.render('admin/comments', {
            comments: comments
        });
    });
});

//Get add comment
router.get('/add-comment', isAdmin, function(req, res){
    var articleSlug = req.query.article;
    Article.findOne({slug: articleSlug}, function(err, article){
        if(err){
            return console.log(err);
        }
        res.render('admin/add_comment', {
            article: article
        });
    });
});

//Post add comment
router.post('/add-comment', isAdmin, function(req, res){
    req.checkBody('comment', 'Comment must have a value').notEmpty();
    var articleSlug = req.query.article;
    var comment = new Comment({
        comment: req.body.comment,
        user: req.user._id,
        article: articleSlug
    });
    var errors = req.validationErrors();
    if(errors){
        Article.findOne({slug: articleSlug}, function(err, article){
            if(err){
                return console.log(err);
            }
            res.render('admin/add_comment', {
                errors: errors,
                article: article
            });
        });
    }else{
        comment.save(function(err){
            if(err){
                return console.log(err);
            }
            req.flash('success', 'Comment added');
            res.redirect('/admin/comments');
        });
    }
});

//Get edit comment
router.get('/edit-comment/:id', isAdmin, function(req, res){
    Comment.findById(req.params.id, function(err, comment){
        if(err){
            return console.log(err);
        }
        res.render('admin/edit_comment', {
            comment: comment
        });
    });
});

//Post edit comment
router.post('/edit-comment/:id', isAdmin, function(req, res){
    req.checkBody('comment', 'Comment must have a value').notEmpty();
    var comment = {
        comment: req.body.comment
    };
    var errors = req.validationErrors();