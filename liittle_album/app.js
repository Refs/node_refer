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

// 监听的端口号，其实exppress只是提供了一个顶层的路由，与顶层的中间件
app.listen(3000)