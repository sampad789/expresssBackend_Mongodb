const express = require('express');

const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const mongoose = require('mongoose');

const app = express();
//Removing promise eroors in the terminal   
mongoose.Promise=  global.Promise;

//connecting to mongoose 
mongoose.connect('mongodb://localhost/vidjot-dev')
    .then(() => console.log('MOngodb connected....'))
    .catch(err => console.log(err));

//Loading the models 
require('./models/Idea');
const Idea = mongoose.model('ideas');

//Handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Express body påarser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Express method-override middleware
app.use(methodOverride('_method'))

// HOw middleware works 
app.use(function (req, res, next) {
    req.name = 'Sam';
    next();

});



//Index route -- the home 
app.get('/', (req, res) => {
    const title = 'Welcome '
    res.render('index', {
        title: title
    })
})

//About route -- another route
app.get('/about', (req, res) => {
    res.render('about')
})


// Idea index page -Index route 

app.get('/ideas', (req,res) => {
    Idea.find({})
    .sort({date:'desc'})
    .then(ideas => {
        res.render('ideas/index' ,{
            ideas:ideas
        });
    });
});     

// Add idea form route ie, ideas/add
app.get('/ideas/add', (req, res) => {
    res.render('ideas/add')
})


// Edit Idea form 
app.get('/ideas/edit/:id', (req, res) => {
    Idea.findOne({
        _id : req.params.id
    })
    .then(idea => {
        res.render('ideas/edit',{
            idea:idea
        });
    });
   
});

//procesing the form request && EROOR HANDLING 
app.post('/ideas', (req, res) => {
    let errors = [];
    if (!req.body.title) {
        errors.push({ text: 'Please add a title' });
    }
    if (!req.body.details) {
        errors.push({ text: 'Please add some details ' });
    }
    if (!req.body.name) {
        errors.push({ text: 'Please add your Name' });
    }
    if (errors.length > 0) {
        res.render('ideas/add', {
            errors: errors,
            title: req.body.title,
            details: req.body.details,
            name: req.body.name,

        });
    } else {
        const newUser = {
            title: req.body.title,
            details: req.body.details,
            name: req.body.name
        }
        new Idea(newUser)
            .save()
            .then(idea => {
                res.redirect('/ideas')
            })
    }

});

//Edit process Form
app.put('/ideas/:id',(req,res) =>{ 
    Idea.findOne({
        _id : req.params.id
    })
    .then(idea => {
       //Setting new values
       idea.title=req.body.title;
       idea.details=req.body.details;
       idea.name=req.body.name;

       idea.save()
       .then(idea =>{
           res.redirect('/ideas');
       });  
    });     
} );
// DELETE the idea 
    app.delete('/ideas/:id',(req,res)=>{
        Idea.remove({_id:req.params.id})
        .then(()=>{
            res.redirect('/ideas');
        });
    });

const port = 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);

});