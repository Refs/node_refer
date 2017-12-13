var formidable = require("formidable");
var db = require("./../models/db.js");
var md5 = require("./../models/md5.js");
var fs = require("fs");
var path = require("path");
var gm = require("gm");

//显示首页
exports.showIndex = function(req,res,next){
        //若用户已经登陆,呈现登陆的页面
      
        // console.log(req.session.login);
        // console.log(req.session.avartar);

        if(req.session.login == 1){
            //检索数据库，用户document中属性avartar的值
            db.find("user",{"username":req.session.username},function(err,result){
                var avartar = result[0].avartar;
                //再次嵌套db result名字与上面的名字重复了， 所以改名字为result2, 
                db.find("shuoshuo",{},function(err,result2){
                     console.log(result);
                     res.render("index",{
                    "login":true,
                    "username":req.session.username || "moren",
                    "avartar":avartar,
                    "result":result2
                    })
                })
            })
        }else{
            //若用户没有登陆，则呈现未登录状态的页面
            res.render("index",{
                "login":false,
                //ejs文件中 使用avartar与username变量的前提都是login为true,当login为false的时候，不用传这两个值；
                "result":[]
            })
        }
}

// 显示注册页面
exports.showRegist = function(req,res,next){
    res.render("regist",{
         "login":req.session.login == "1" ? true : false,
         "username":req.session.login = "1" ? req.session.username : ""
    });
}

//处理用户注册
exports.doRegist = function(req,res,next){
    //得到用户填写的数据；
    //查询用户名是否存在
    //若用户名不存在，则将用户存起来；
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields) {
        var username = fields.username;
        var password = fields.password;
        
        db.find("user",{"username":username},function(err,result){
            if(err){
                res.json({"result":"-3"});//系统错误
                return;
            }else if(result.length != 0){
                res.json({"result":"-1"});
                return;
            }
            console.log(result.length);//0；现在可以证明用户名没有被占用；

            password = md5(md5(password)+"2");//将password利用md5加密；

            //将用户名与加密之后的password插入到数据库之中；
            db.insertOne("user",{
                "username":username,
                "password":password,
                "avartar":"moren.jpg"
            },function(err,result){
                if(err){
                res.json({"result":"-3"});//系统错误
                return;
                };
                req.session.login = "1";
                req.session.username = username;
                res.json({"result":"1"});
            })
        })
    });
    
}

//登陆业务
exports.showLogin = function(req,res,next){
    res.render("login",{
            "login":req.session.login == "1" ? true : false,
            "username":req.session.login = "1" ? req.session.username : ""
    });
}

 

//处理登陆表单
exports.doLogin = function(req,res,next){
    //1.3.后台接收前台表单数据
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields) {
        var username = fields.username;
        var password = fields.password;
        db.find("user",{"username":username},function(err,result){
         
            //系统错误
            if(err){
                res.json({"result":"-3"})
                return;
            };
            //用户名不存在
            if(result.length == 0){
                res.json({"result":"-1"})
                return;
            }
            //转化密码为md5
            password = md5(md5(password)+"2");
            if (password == result[0].password){
                //成功登陆
                req.session.login = "1";
                req.session.username = username;
                res.json({"result":"1"})
                return;
            }else{
                //用户密码错误
                res.json({"result":"-2"})
                return;
            }
        })

    })
};

exports.jqform = function(req,res,next){
    res.render("jqform")
}

exports.dojqform = function(req,res,next){
     var form = new formidable.IncomingForm();
     form.parse(req,function(err,fields,files){
         console.log(files);
         res.json({"result":"1"});
     })
}

exports.showSetAvartar = function(req,res,next){
    console.log(req.session.login);
    res.render("setavartar",{
        "login": (req.session.login == "1") ? true : false,
        "username":(req.session.login = "1") ? req.session.username : ""
    })
}
exports.doSetAvartar = function(req,res,next){
    console.log(req.session.login);
    var form = new formidable.IncomingForm();
    form.uploadDir = "./avartar/";
    form.parse(req, function(err, fields, files) {
        var oldPath = files.avartar.path;
        var extName = path.extname(files.avartar.name);
        var newPath = "./avartar/"+ req.session.username + extName;

        fs.rename(oldPath,newPath,function(err){
            if(err){
                res.send(err);
                return;
            }
            //req.session.login = "1";
            req.session.avartar = req.session.username + extName;
            res.redirect("/cut")
        }) 
    });
}

exports.showCut = function(req,res,next){
    console.log(req.session.login);
    res.render("cut",{
        "login":(req.session.login == "1") ? true : false,
        "username":(req.session.login = "1") ? req.session.username : "",
        "avartar":req.session.avartar
    })
}
 
exports.doCut = function(req,res,next){
    var filename = req.session.avartar;
    var x = req.query.x;
    var y = req.query.y;
    var w = req.query.w;
    var h = req.query.h;
     gm("./avartar/"+ req.session.avartar)
        .crop(w,h,x,y)
        .resize(100,100,"!")
        .write("./avartar/"+ req.session.avartar,function(err){
            if(err){
                console.log(err);
            }
            db.updateMany("user",{"username":req.session.username},{
                $set:{"avartar":req.session.avartar}
            },function(err,result){
                if(err){
                    res.send("-1");
                }
                res.send("1");
            })
            
    });
}

exports.doShuoShuo = function(req,res,next){

    //必须保证登陆
    if(req.session.login != "1"){
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    //得到用户填写的东西
     var form = new formidable.IncomingForm();
     form.parse(req, function(err, fields,files){
        db.insertOne("shuoshuo",{"username":req.session.username,"date":new Date(),"content":fields.content},function(err,result){
            if(err){
                res.send("-3");
                return;
            }
            
            res.send("1");
        })

     })
}

exports.getAllShuoshuo = function(req,res,next){
    var page = req.query.page;
    db.find("shuoshuo",{},{"pageamount":3,"page":page,"sort":{"date":-1}},function(err,result){
        if(err){
            res.send(err);
            return;
        }
        res.json({"result":result})
    })
}

exports.getUserInfo = function(req,res,next){
    var username = req.query.username;
    db.find("user",{"username":username},function(err,result){
        if(err){
            res.send(err);
            return;
        }
        if(result.length!=0){
            var result = {
                "username":result[0].username,
                "avartar":result[0].avartar
            }
            res.json({"result":result});
        }
       
    })
}

exports.getAllShuoshuoCount = function(req,res,next){
        db.getAllCount("shuoshuo",function(result){
            res.send(result.toString());
        })
}

exports.showUser = function(req,res,next){
    var user = req.params.username;
    db.find("shuoshuo",{"username":user},function(err,result){
        db.find("user",{"username":user},function(err,result2){
            res.render("user",{
            "login":(req.session.login == "1") ? true : false,
            "username":(req.session.login == "1") ? req.session.username : "",
            "user":user,
            "usershuoshuo":result,
            "useravartar":result2[0].avartar
            })
        })
    })
}

exports.showUserList = function(req,res,next){
    db.find("user",{},function(err,result){
        res.render("userlist",{
            "login":(req.session.login == "1") ? true : false,
            "username":(req.session.login == "1") ? true :false,
            "userlist":result
        })
    })
}