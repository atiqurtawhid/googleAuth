const express = require("express")
const app = express()
const ejs = require("ejs")
const mongoose = require("mongoose")
const session = require('express-session')
const MongoStore = require('connect-mongo')
const passport = require("passport")
const bcrypt = require("bcryptjs")
const GOOGLE_CLIENT_ID = "835671367751-vqdve9scm0biv4v3jql8k6oqr0veo78v.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET="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"
const GoogleStrategy = require('passport-google-oauth20').Strategy;
//const LocalStrategy= require("passport-local").Strategy
app.set("view engine", "ejs")
app.use(express.urlencoded({extended:true}))
app.use(express.json())


// create Schema

const googleSchema =new mongoose.Schema({
	username:{
		type:String,
		require:true,
		unique:true
	},
	googleId:{
		type:String,
		require:true
	},
	createAt:{
		type:Date,
		default:Date.now()
	}
	
})

// create model

const googleModel = new mongoose.model("googleAuth", googleSchema)



// db connection

const dbConnect = async()=>{
	await mongoose.connect("mongodb+srv://atiqur:atiqnishe@cluster0.ng8c3nf.mongodb.net/google-auth-test-db")
	.then(()=>{
		console.log("google db is connected")
	})
	
	
	.catch((error)=>{
		console.log("google db is not connected")
		console.log(error)
	})
	
}


// dbConnect call

dbConnect();




// create session cokie db connection and store



app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
store: MongoStore.create({
    mongoUrl: 'mongodb+srv://atiqur:atiqnishe@cluster0.ng8c3nf.mongodb.net/google-auth-test-db',
    collectionName:"session"// See below for details
  })
  
  
  
}))

// initialize 

app.use(passport.initialize())
app.use(passport.session())

// passport local authentication

/*

passport.use(new LocalStrategy(
  (username, password, done)=> {
  	try{
  		
  		const user= googleModel.findOne({username:username})
  		if(!user){
  			return done(null, false)
  		}
  		
  		if(!bcrypt.compare(password, user.password)){
  			return done(null, false)
  		}
  		
  	}
  	catch(error){
  		return done(error)
  	}
  }
));


*/


// passport Google auth 



passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  (accessToken, refreshToken, profile, cb)=> {
   
   googleModel.findOne({googleId:profile.id}, (err,user)=>{
   	
   	if(err) return cb(err, nul)
   	
   	if(!user){
   		let newUser= new googleModel({
   			googleId:profile.id,
   			username:profile.displayName
   		})
   		newUser.save();
   		return cb(null, newUser)
   	}
   	else{
   		return cb(null, user)
   	}
   
   
   })
   
   
    
    
    
    
  }
));







		//serializeUser
		
		
	passport.serializeUser((user, done)=> {
	  done(null, user.id);
	});


	//deserializeUser
	

	passport.deserializeUser(async(id,done)=>{
		try{
			const user = await googleModel.findById(id)
			console.log("id", user)
			done(null, user)
		}
		catch(error){
			done(error, false)
		}
	})













app.get("/", (req,res)=>{
	res.render("home")
})

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', successRedirect:"/profile" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });






app.get("/login", (req,res)=>{
	res.render("login")
})









app.get("/profile", (req,res)=>{
	res.render("profile", {username:req.user.username})
})


module.exports=app;

