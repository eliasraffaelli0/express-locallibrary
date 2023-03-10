const { nextTick } = require("async");
const Author = require("../models/author");
const Book = require("../models/book");
const async = require("async");
const {body, validationResult} = require("express-validator");
const mongoose = require('mongoose');

// Display list of all Authors.
exports.author_list = (req, res, next) => {
    Author.find()
    .sort([["family_name", "ascending"]])
    .exec(function(err, list_authors){
        if(err){
            return nextTick(err);
        }
        res.render("author_list",{
            title: "Author list",
            author_list: list_authors,
        });
    });
};

// Display detail page for a specific Author.
exports.author_detail = (req, res, next) => {
    async.parallel(
        {
            author(callback){
                Author.findById(req.params.id).exec(callback);
            },
            books(callback){
                Book.find({ author: req.params.id }, "title summary").exec(callback);
            },
        },
        (err, results) => {
            if(err){
                return next(err);
            }
            if(results.author== null){
                const err= new Error("Author not found");
                err.status = 404;
                return next(err);
            }
            res.render("author_detail", {
                title: "Author detail",
                author: results.author,
                books: results.books,
            });
        }
    );
};

// Display Author create form on GET.
exports.author_create_get = (req, res, next) => {
    res.render("author_form", {title: "Create author"});
};

// Handle Author create on POST.
exports.author_create_post = [
    body("first_name")
        .trim()
        .isLength({min:1})
        .escape()
        .withMessage("First name is required")
        .isAlphanumeric()
        .withMessage("First name has non-alphanumeric characters."),
    body("family_name")
        .trim()
        .isLength({min:1})
        .escape()
        .withMessage("Family name is required")
        .isAlphanumeric()
        .withMessage("First name has non-alphanumeric characters."),
    body("date_of_birth", "Invalid date of birth")
        .optional({checkFalsy: true})
        .isISO8601()
        .toDate(),
    body("date_of_death", "Invalid date of death")
        .optional({checkFalsy: true})
        .isISO8601()
        .toDate(),
    (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            res.render("author_form", {
                title: "Create author",
                author: req.body,
                errors: errors.array(),
            })
        }
        
        const author = new Author({ 
            first_name: req.body.first_name, 
            family_name: req.body.family_name, 
            date_of_birth: req.body.date_of_birth, 
            date_of_death: req.body.date_of_death
        });
        author.save((err)=>{
            if(err){
                return next(err);
            }
            res.redirect(author.url);
        })
    }
];

// Display Author delete form on GET.
exports.author_delete_get = (req, res, next) => {
    async.parallel(
        {
            author(callback){
                Author.findById(req.params.id).exec(callback);
            },
            authors_books(callback){
                Book.find({author: req.params.id}).exec(callback);
            },
        },

        (err, results) => {
            if(err){
                return next(err);
            }
            if(results.author==null){
                //no author finded
                res.redirect("/catalog/authors");
            }
            res.render("author_delete",{
                title: "Delete author",
                author: results.author,
                author_books: results.authors_books
            }); 
        }
    )
};

// Handle Author delete on POST.
exports.author_delete_post = (req, res, next) => {
    //the tutorial uses req.body.authorid but is not taking it as an Objectid and i don't know how to convert the string to an id so for now i'll use the id from the params
        console.log(req.params.id);
        console.log(mongoose.Types.ObjectId.isValid(req.params.id));
        console.log(req.body.authorid);
        console.log(mongoose.Types.ObjectId.isValid(req.body.authorid));
    
    async.parallel(
        {
            author(callback) {
            Author.findById(req.params.id).exec(callback);
            },
            authors_books(callback) {
            Book.find({ author: req.params.id }).exec(callback);
            },
        },
        (err, results) => {
            if (err) {
                return next(err);
            }
            // Success
            if (results.authors_books.length > 0) {
                // Author has books. Render in same way as for GET route.
                res.render("author_delete", {
                    title: "Delete Author",
                    author: results.author,
                    author_books: results.authors_books,
                });
                return;
            }
            // Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(req.params.id, (err) => {
            if (err) {
                return next(err);
            }
            // Success - go to author list
            res.redirect("/catalog/authors");
            });
        }
    );
};

// Display Author update form on GET.
exports.author_update_get = (req, res, next) => {
    Author.findById(req.params.id)
    .exec((err, author)=>{
        if(err){
            return next(err);
        }
        if(author==null){
            const err = new Error("Author not found");
            err.status = 404;
            return next(err);
        }
        res.render("author_form", {
            title: "Update author",
            author,
        });
    });
};

// Handle Author update on POST.
exports.author_update_post = [
    body("first_name")
        .trim()
        .isLength({min:1})
        .escape()
        .withMessage("First name is required")
        .isAlphanumeric()
        .withMessage("First name has non-alphanumeric characters."),
    body("family_name")
        .trim()
        .isLength({min:1})
        .escape()
        .withMessage("Family name is required")
        .isAlphanumeric()
        .withMessage("First name has non-alphanumeric characters."),
    body("date_of_birth", "Invalid date of birth")
        .optional({checkFalsy: true})
        .isISO8601()
        .toDate(),
    body("date_of_death", "Invalid date of death")
        .optional({checkFalsy: true})
        .isISO8601()
        .toDate(),
    (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            res.render("author_form", {
                title: "Create author",
                author: req.body,
                errors: errors.array(),
            })
        }
        
        const author = new Author({ 
            first_name: req.body.first_name, 
            family_name: req.body.family_name, 
            date_of_birth: req.body.date_of_birth, 
            date_of_death: req.body.date_of_death,
            _id: req.params.id,
        });

        Author.findByIdAndUpdate(req.params.id, author, {}, (err, theauthor)=>{
            if(err){
                return next(err);
            }
            res.redirect(theauthor.url);
        });
    }
];