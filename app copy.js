//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require("lodash");
const https = require("https");

//HAHA BBB

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-marcus:admin123@cluster0.fuhs6.mongodb.net/blogDB", {useNewUrlParser: true});

const userSchema = {
  email:String,
  password:String
};

const postSchema = {
  title: String,
  content: String
};

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

// API key: c32837850628358410d297d7ab7062b7
app.route("/")
  .get(function(req, res){

    Post.find({}, function(err, posts){
      res.render("home", {
        startingContent: homeStartingContent,
        posts: posts
        });
    });
    // res.sendFile(__dirname + "/");
  });

app.route("/weather_api")
  .get(function(req,res){
    res.render("weather_api");
  })

  .post(function(req,res){
    const query = req.body.cityName;
    const apiKey = "c32837850628358410d297d7ab7062b7";
    const unit = "metric";
    const url ="https://api.openweathermap.org/data/2.5/weather?q="+ query+"&appid="+apiKey+"&units="+ unit;
    // const url = "https://api.openweathermap.org/data/2.5/weather?q=hongkong&appid=c32837850628358410d297d7ab7062b7&units=metric";

    https.get(url,function(response){
      console.log(response.statusCode);
      console.log(req.body.cityName);

      response.on("data",function(data){
        const weatherData = JSON.parse(data);
        const temp = weatherData.main.temp;
        const weatherDescription = weatherData.weather[0].description;
        const icon = weatherData.weather[0].icon;
        const imageURL = "http://openweathermap.org/img/wn/"+icon+"@2x.png";

        res.render("weather_result",{query,temp,weatherDescription,imageURL});
        // res.set("content-Type","text/html");
        // res.write("<img src=" + imageURL + ">");
        // res.write("<h1>" + query + " is now</h1>");
        // res.write("<h1>" + temp + " °C and " + weatherDescription + "</h1>");
        // res.send();

        });
      })
    });

app.route("/compose")
  .get(function(req, res){
    res.render("compose");
    })
  .post(function(req, res){
    const post = new Post({
      title: req.body.postTitle,
      content: req.body.postBody
    });

    post.save(function(err){
      if (!err){
          res.redirect("/");
      }
    });
  });

app.get("/edit_post",function(req,res){
  res.render("edit_post");
});

  app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;
    Post.findOne({_id: requestedPostId}, function(err, post){
        res.render("post",{
          title:post.title,
          content:post.content
        });
    });
  });

app.get("/about_me", function(req, res){
  res.render("about_me", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.route("/register")
  .get(function(req,res){
    res.render("register");
  })

  .post(function(req,res){

    const newUser = new User({
      email: req.body.username,
      password: req.body.password
    });

    // if (newUser.password == newUser.confirm_password){
    //   newUser.save();
    //   res.redirect("blog");
    // } else{
    //   res.send("your password not match");
    // }


    newUser.save(function(err){
      if (err){
        console.log(err);
      } else{
        res.redirect("blog");
      }
    });
  });

app.route("/login")
  .get(function(req,res){
    res.render("login");
  })
  .post(function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username},function(err,foundUser){
      if (err){
        console.log(err);
      } else {
        if (foundUser){
          if (foundUser.password ===password){
            res.redirect("blog");
          } else{
            res.set("content-Type","text/html");
            res.write("<h1>your password is incorrect.</h1>");
            res.write("<h1>Please try again.</h1>");
            res.send();
          }
        } else{
          res.set("content-Type","text/html");
          res.write("<h1>your email is incorrect.</h1>");
          res.write("<h1>Please try again.</h1>");
          res.send();
        }
      }
    })
  });
app.route("/forgot_password")
  .get(function(req,res){
    res.render("forgot_password");
  })

  .patch(function(req,res){
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email:username},function(err,foundUser){
      if (err){
        console.log(err);
      } else {
        if (foundUser){
          if (foundUser.password ===password){
            res.redirect("blog");
          }
        }
      }
    })
  });

app.get("/blog",function(req,res){
  Post.find({}, function(err, posts){
    res.render("blog", {
      startingContent: homeStartingContent,
      posts: posts
      });
  });
});

let port = process.env.PORT;
if(port == null || port ==""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started Successfully");
});
