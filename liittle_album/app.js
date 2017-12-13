var router = require("./controller")
var express = require("express");
var app = express();

app.set("view engine", "ejs");

app.use(express.static("./public"))
app.use(express.static("./uploads"))

app.get("/",router.showIndex)

app.get("/:albumName",router.showAlbum)

app.get("/uploads",router.showUploads)

app.post("/uploads",router.doPost)

app.use(function(req,res){
    res.render("err"); 
})

app.listen(3000)