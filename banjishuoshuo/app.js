var express = require("express");
var app = express();
var router = require("./router/router.js");
var session = require("express-session");

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

//模板引擎
app.set("view engine","ejs");

//静态页面
app.use(express.static("./public"));
app.use("/avartar/",express.static("./avartar"));


//路由表
app.get("/",router.showIndex);
// app.get("/",router.doRegist);

app.get("/regist",router.showRegist)

app.get("/login",router.showLogin)

app.post("/login",router.doLogin)

app.post("/doRegist",router.doRegist)
//监听端口
app.get("/jqform",router.jqform)
app.post("/jqform",router.dojqform)

app.get("/setavartar",router.showSetAvartar)
app.post("/dosetavartar",router.doSetAvartar)

app.get("/cut",router.showCut)
app.get("/docut",router.doCut)

app.post("/doshuoshuo",router.doShuoShuo)

app.get("/allshuoshuo",router.getAllShuoshuo)
app.get("/userinfo",router.getUserInfo)
 
app.get("/allshuoshuocount",router.getAllShuoshuoCount);

app.get("/user/:username",router.showUser);
app.get("/userlist",router.showUserList);

app.listen(3000);
