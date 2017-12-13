# 班级说说5

**没有时间就去挤时间，没有精力就靠打坐与入静来恢复精力，“夫物芸芸，各归其根，归根曰静，静曰复命”**

### v1.0 初始化工作空间；

### v2.0 班级说说初步结构规划
1.项目要求：不能转发的微博系统（班级说说）
* 可以注册、设置头像、登录、可以转发微博；
* 没有”关注“、"收听机制"，所有人的微博都可以被自己看见（像论坛），微博内容按时间排序（不存在”顶贴“）；
* 可以对一个微博进行”赞“、”评论“；

2.数据库要求：mongodb与nodejs比较活，根本不需要事先去设计数据库；数据库中需要有两个集合：一个是用来存放用户，一个是用来存放微博（帖子）；数据库没有必要规定那么死，都是想到什么就写什么，这也是mongodb的优势；
* user 集合用来存储用户的信息，里面的document举例如下

```js
{"_id":"fdasfas","username":"小明","password":"md5加密","avatar":"头像地址","sign":"一句话签名"}
//avarta(头像)数据库中是不可以存的，但数据库中，可以存放头像(avatar)的地址；
//username同一个集合中不能重复；；
```
* post集合用来存放用户发表的文章，举例如下：

```
{"id":"dfadfas","title":"标题","content":"内容","author":"小明","date":"日期"}
```
* 这时候有个问题，就是_评论_怎么存？
在以前的数据库中，如mysql就需要再建一个集合comment，每一个评论单独存放，然后用外键（外链）指向用户集合；而在我们的mongodb中，就不需要再新建一个集合，可以直接在post集合内的每条document中再插入一条field "comment";comment中存放的是数组，数组中又存放多条json，评论就存放在这一条条json中，形式如下：_这体现出了mongodb的优势，这也是全站开发中的一个大概念_； 除此之外，还可以在此document中插入一条field "zan",原理与上面类似；

```js
{"id":"dfadfas","title":"标题","content":"内容","author":"小明","date":"日期","comment":[{
    "content":"内容",
    "author":"评论人",
    "date":"时间"
    },{评论2}...],"zan":{"小明","小兰"}}
//同一个用户不可以重复点赞，所以赞里面存储的是用户名，且存之前要判断一下是否重复；
```

3.静态页面index.ejs

* 从bootstrap上扒来一个带有登陆的页面；点开后右键查看源码，将文本全部copy至index.ejs中；检查文本中的引用，并修改使其指向正确的css或js，遇到现工作空间内没有的css或js可在网页源码中右键下载；
![](http://baihua.xicp.cn/17-2-1/95172090-file_1485908976569_1629d.png)

![](http://baihua.xicp.cn/17-2-1/46839431-file_1485909442629_12fc.png)

* 导航条部分修改如下：在navbar-collapse区域；左侧留有“全部说说”与“我的说说”两个链接；留有两个接口“注册”与“登陆”；

```js
//index.ejs中
<div id="navbar" class="navbar-collapse collapse">
    <ul class="nav navbar-nav">
        <li class="active"><a href="#">全部说说</a></li>
        <li><a href="#">我的说说</a></li>
    </ul>  

    <ul class="nav navbar-nav navbar-right">
        <li><a href="#">注册</a></li>
        <li><a href="#">登录</a></li>
    </ul>
</div>
```

### v3.0注册业务
**现在自己过着苦行僧式的生活，心静就去学习，心乱了就去打坐入静**

> 注册并不包括头像，咱么的业务逻辑是先让用户注册上来，其注册完之后，是没有头像状态，有一个默认的、恶心的头像，然后其就会自然而然的去改头像

#### 做注册的页面 regist.ejs

* 首先更改首页面index.ejs中注册按钮的链接，当被点击时使其发送至"/regist"的请求；

    ```<li><a href="/regist">注册</a></li>
    ````
* 其次要在app.js中新建一个中间其，负责迎合（相应）注册链接请求，响应函数在控制层router中；

    ```
        app.get("/regist",showRegist)
    ```
* 请求的处理函数放在控制层router中；在router中暴露一个请求处理函数showRegist，函数运行之后，首先将注册页面渲染出来;

    ```
        exports.showRegist = function(req,res,next){
            res.render("regist")
        }
    ```
* 在views文件夹中创建注册页面regist.ejs; 这样在主页面点击注册按钮，就会显示注册页面；紧接着就是去bootstrap中去扒注册表单的模板；

```js
        <form role="form" class="col-md-6">
            <h1>欢迎注册</h1>                
            <div class="form-group">
                <label for="username">用户名</label>
                <input type="text" class="form-control" id="username" placeholder="用户名，且用户名不可以重复">
            </div>
            <div class="form-group">
                <label for="mima">Password</label>
                <input type="password" class="form-control" id="password" placeholder="密码至少六位">
            </div>
            <div class="checkbox">
                <label>
                    <input type="checkbox"> 我同意注册规定
                </label>
            </div>
            <button type="button" class="btn btn-default" id="zhuce">注册</button>
        </form>
```

* 用ajax提交用户填写的表单 

监听提交按钮，当用户点击时发送ajax请求，请求中携带用户填写的数据；

```js
//regist.ejs中
<script type="text/javascript">
    $("#zhuce").click(function(){
        $.post("/dopost",{"username":$("#username").val(),"password":$("password").val()},function(result){
            if(result.result = "1"){
                alert("用户注册成功");
            }else if(result.result = "-3"){
                alert("系统错误")
            }else if(result.result = "-1"){
                alert("用户名已存在")
            }
        })

    })
</script>
```
* 服务器相应ajax请求,首先要得到用户post过来的数据，然后判断用户名是否存在;若用户名已存在，则返回-1（ajax会收到返回的结果，并会根据这个结果，进行下一步的操作）；若用户名没有被占用，则将用户名对应的password利用md5加密，然后放入数据库，并返回1，这样等于是注册成功；

```js
//app.js中
app.post("/dopost",router.doRegist);
//router.js中
var formidable = require("formidable");
//引入mongodb的DAO层函数，mongodb都是用setting.js文件配置的，引入db.js时，也要将setting.js复制过来；
var db = require("./models/db.js")
//引入md5加密函数
var md5 = require("./models/md5.js")

exports.doRegist = function(req,res,next){
    //1.获取ajax发过来的请求数据；
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields) {

        var username = fields.username;
        var password = fields.password;
        //2.利用find函数，去查询数据库，筛选条件是username,
        db.find("user",{"username":username},function(err,result){
            if(err){
                res.json({"result":-3});//系统错误
                return;
            //3.若能查到result.length不等于0，则说明用户名已经被占用，则去返回-1;
            }else if(result.length != 0){
                res.json({"result":"-1"});
                return
            }
            //console.log(result.length);//0；现在可以证明用户名没有被占用；

            //4.若result.length等于0，则说明用户名未被占用，将密码加密后，将用户名与密码一起放到数据库中；
            password = md5(md5(password)+"2");//将password利用md5加密；

            //将用户名与加密之后的password插入到数据库之中；
            db.insertOne("user",{"username":username,"password":password},function(err,result){
                if(err){
                res.json({"result":-3});//系统错误
                return;
                };
                //5.注册成功，写入session;
                res.json({"result":"1"});
            })
        })
    });
}
```
* 用ajax接收来自服务器的相应；在页面中添加一个警告框组件，若服务器返回的是-1就将组件弹出；若服务器返回的是1,则跳转至首页面；

```html
        </div>
        <div class="row" id="failed">
          <div class="alert alert-danger col-md-6" role="alert">
            <a href="#" class="alert-link">用户名已被注册</a>
          </div>
        </div>
```

```js
        $("#zhuce").click(function(){
            //当页面表单控件获得焦点时，将所有的警告框重新隐藏掉；
             $("input").focus(function(){
                 $("#failed").fadeOut();
             })

             $.post("/doregist",{"username":$("#username").val(),"password":$("#password").val()},function(result){
                 console.log(result.result);
                 if(result.result == "-1"){
                     $("#failed").fadeIn();
                 };
                 if(result.result == "1"){
                    alert("注册成功，浏览器将自动跳转到首页");
                     window.location = "/";
                 }
             })
         })
```

* 注册成功之后，下一步就是要写入session;利用express-session模块；安装模块，并在顶层路由app.js中调用中间件：

```js
//app.js中
    var session = require("express-session");

    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }
    }))
```

```js
//router.js中
exports.doRegist = function(req,res,next){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields) {

        var username = fields.username;
        var password = fields.password;
        db.find("user",{"username":username},function(err,result){
            if(err){
                res.json({"result":-3});
                return;
            }else if(result.length != 0){
                res.json({"result":"-1"});
                return
            }

            password = md5(md5(password)+"2");

            db.insertOne("user",{"username":username,"password":password},function(err,result){
                if(err){
                res.json({"result":-3});
                return;
                };
                //用户注册成功之后，就要写入session,
                req.session.login = "1";
                req.session.username = "username";

                res.json({"result":"1"});
            })
        })
    });
}

```

* session写入的意义在于，ajax接收到服务器成功响应的"1"时，js会将我们引到"/"`window.location="/"`，且会重新向到地址"/"的请求，此次请求req.sesion中会带有我们session写入的数据（cookie），我们可以像类似`req.query.username`去获得`127.0.0.1:3000/?username=xiaoming`请求中**查询数据**的方式，利用`req.session.username`去获取请求中session数据。利用这个原理我们可以去完成，当链接跳转到首页时，原先首页面导航条中"注册"和"登陆"的部分变成"欢迎username"和"设置个人资料"；

```js
    //一点感悟，自己要做什么，首先改的都是视图层，想看一下改的成功不成功，有没有那个效果，都是先传一个假数据，若达到预先的效果，后面就专注于数据的获取；这一点体悟，很想自己以前学习javascript时，做运动或交互效果时，都是那个css数据去试，看看有没有效果；
    
    //1.首先更改一下index.ejs; 利用模板引擎传入的login值做一下判断，login为false则显示"注册"与"登陆",login 为true 则显示"欢迎username"与"设置个人信息"
        <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav">
                <li class="active"><a href="#">全部说说</a></li>
                <li><a href="#">我的说说</a></li>
            </ul>  
            <ul class="nav navbar-nav navbar-right">
                <% if(!login){  %>//前台并不能接受后台的数据，其只能接收模板引擎给的数据；
                    <li><a href="/regist">注册</a></li>
                    <li><a href="#">登录</a></li>
                <% else{  %>
                    <li><a href="/regist">欢迎<%= username %></a></li>
                    <li><a href="#">设置个人信息</a></li>
                <% } %>

            </ul>
         </div>
    //<% login %> 在ejs页面中，用<% %>将一个变量括起来，放在页面中的任意位置，可以用来调试模板中的变量
```

```js
    //2.利用假数据，在后台调试一下，看模板能否正常显示；
    exports.showIndex = function(req,res,next){
        res.render("index",{
            "login":true,
            "username":"小花花"
        })
    }
```

```js
    //3.获取真实的模板数据
exports.showIndex = function(req,res,next){
    // res.render("index");
    if(req.session.login == "1"){
        res.render("index",{
            "login": true,
            "username":req.session.username
        })
    }else {
        res.render("index",{
            "login":false,
            "username":""
        })
    }
}
```



 > 一点感悟，自己要做什么，首先改的都是视图层，想看一下改的成功不成功，有没有那个效果，都是先传一个假数据，若达到预先的效果，后面就专注于数据的获取；这一点体悟，很想自己以前学习javascript时，做运动或交互效果时，都是那个css数据去试，看看有没有效果；

### v4.0 登陆业务 

> 保持一个正确的做题习惯，**方正以前再做题的时候，总是先要思考一下，然后做出来之后，和参考的思路进行比对** 思路一定要清晰； 现在自己一直迟疑不定，就是自己面对自己所要做的事情，没有思考清楚，思考清晰之后，自己自然就会去做了；**做一个题能难死的症结所在；**

**与用户的第一次交互：**用户交互的入口是主页面的登陆按钮，用户点击之后会发送一个请求，服务器会接受到这个请求，并且会将登陆页面渲染出来；（全栈开发考虑的就是前后台的交互）；  因为上了那么多年网，所以后台的逻辑很简单，且很固化；

```js
    //1.主页面中要有用户提交登陆请求的入口；点击登陆按钮后，要能向后台发送登陆的请求；
    <ul class="nav navbar-nav navbar-right">
        <% if(!login){  %>
            <li><a href="/regist">注册</a></li>
            <li><a href="/login">登录</a></li>
        <% }else{  %>
            <li><a href="#">欢迎<%= username %></a></li>
            <li><a href="#">设置个人信息</a></li>
        <% } %>
    </ul>
    //2.后台服务器首先要能接收到前台发送过来的请求，并能相应处理；随后将登陆页面渲染出来；
    app.get("/login",router.login);

    exports.login = function(req,res,next){
        res.render("login");
    }
    //3.做一个前台模板，此时可以先随便创建一个login.ejs文件，以调试上述步骤；`html:5 tap  h1{我是测试页面} tap`而一般登陆页面都是直接拿着注册页面改的；先复制一份注册页面在浏览器中打开，边改边调试，体验还是很愉快的； **以前的体验是编写html文件，利用浏览器打开调试，现在的在后台服务器中渲染一个ejs文件，而后便修改这个文件内容，边刷新浏览器，体验和之前一样，这就回到了以前那种感觉，及写前台ejs模板并不是闭着眼睛写的，而是可视化的边写边看**
    


```
**与用户的第二次交互**：用户填写表单，填写完毕后点击登陆，前端js监听用户的登陆动作，当用户点击登陆按钮时，通过ajax的post请求，并携带用户表单数据；   后台响应并接受前台的post请求及其数据， 接受到前台数据之后，以前台填写的username作为检索条件去查询数据库，若检索的过程中出错则返回-3系统错误，检索到的数组长度为0则说明用户名不存在，则返回“-1”, 检索到的结果数组长度不为0，则接着去比对用户输入的密码与数据库中的密码，检索之前需要对密码进行md5处理，若比对不相同，则返回"-2"用户密码错误，若比对相同则加入session后返回“1”成功登陆，  前端ajax响应后台的返回，渲染前端警告框underscore模板，根据不同的服务器返回数据，填入不同的模板数据；

```js
    //用户点击login按钮，发送post 请求，携带表单数据
    $("#login").click(function(){
        $.post("/login",{"username":$("#username").val(),"password":$("#password").val()},function(result){

        })
    })


    //1.1.后台接收前台的post请求
    app.post("/login",router.doLogin)

    //1.2.后台响应前台的post请求
    exports.doLogin = function(req,res,next){
        //1.3.后台接收前台表单数据
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields) {
            var username = fields.username;
            var password = fields.password;
            //1.4.根据前台数据，检索数据库
            db.find("users",{"username":username},function(err,result){
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
                    res.json({"result":"1"})
                    return;
                }else{
                    //用户密码错误
                    res.json({"result":"-2"})
                }
            })

        })
    }

 //3.前台ajax响应后台的请求返回

    //3.1 前台underscore模板
    <script src="./public/js/underscore.js"></script>
    <script type="text/template" id="moban">
        <div class="alert alert-danger col-md-6" role="alert">
            <a href="#" class="alert-link">{{= alert_desc }}</a>
        </div>
    </script>
    //3.2 接收到请求返回时，响应返回 -- 渲染模板  此处应随便找一段内容调试一下前端模板，肯能否正确渲染；而后才考虑其内容以及后端的数据； 提示结果不是看页面屏幕上有没有显示，而是要看其html源码，看有没有加上去
    <script type="text/template" id="moban">
        <h1>我是前端模板</h1>
    </script>

    

    //3.5 给表单控件加事件，获取焦点是，清空failed的内容。
    $("input").focus(function(){
             $("#failed").html("");
    })

    $("#login").click(function(){
        $.post("/login",{"username":$("#username").val(),"password":$("#password").val()},function(result){
            //3.3.有错误则渲染警告框
            var compiled = _.template($("#moban").html());

            if(result.result = "-3"){
                var html = compiled({"alert_desc":"系统错误"});
                $("#failed").append($(html));
                return;
            }else if(result.result = "-2"){
                var html = compiled({"alert_desc":"用户密码错误"});
                $("#failed").append($(html));
                return;
            }else if(result.result = "-1"){
                var html = compiled({"alert_desc":"用户名不存在"});
                $("#failed").append($(html));
                return;
            }
            //3.4无错误则重定向到首页
            alert("登陆成功，点击回到首页面");
            window.location = "/";
            
        })
    })

```

> 正常的听课流程，1.都是先听一边，有个模糊的思路；2.再仔细思考一下形成具体的思路；3.再闭着眼睛（不管对不对）将完整的逻辑写出来；4.再放到程序中去调试；5.再对比参考答案以优化与改进；

### v5.0  ejs include动态共享页面

在各个页面中，ejs的上边框，重用性太高，index/login/regist.ejs页面都使用这个上边框，若修改其中一个页面的上边框，则其它页面都要修改，这在使用过程中，会有诸多不便，所以现在要用ejs include来共享上边框；

在各个页面中，**相似有要有区别**的使用方式；这是一个哲学；**要有相同：**每页面都有这一部分内容，所有就没有必要每个页面都去写这一部分的内容，这样做一是写起来方便，二是修改起来比较方便，修改一个页面相当于修改全部；  要有区别，如**描述当前所在位置时**主页的active按钮在“全部说说”，而登陆与注册页面的active就应该 登陆 与 注册上； 即要有静态的相同，又要有动态的不同，就是这样一个需求

新建一个文件夹，header.ejs里面写入要共享的内容； 在要使用共享内容的模板页面，通过<%- include relativePath %> 的语法将header.ejs引入，<%- 表示将未转义的值输出到模板中，使用其防止被双重转义； 而在各个页面中，表示页面当前位置的active是不相同的，所以这一部分应该是动态的，这一部分在页面模板上应体现为**变量**；后台服务器在渲染时，应去迎合这个变量，根据要渲染的页面but哦那个，为这个变量赋予不同的值，前台再根据后台传过来的值做判定，以确定active的位置； 这是老师的方法，虽然可行，但这种方法已经过时了，ejs关于include有更好的接口：<%- include("relativePath",{})%> 即在include的时候，就已经将不同的数据传输过去的了；

```js

    //1.新建header.ejs并写入要共享的内容；并将动态的内容（如表示页面当前位置的active）设置为变量
    <nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
      <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" href="#">班级说说</a>
        </div>

          <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav">
                <li <%if(active == "全部说说"){%>
                        class = "active"
                    <%}%>
                ><a href="#">全部说说</a></li>
                <li <%if(active == "我的说说"){%>
                        class = "active"
                    <%}%>
                ><a href="#">我的说说</a></li>
                <li <%if(active == "成员列表"){%>
                        class = "active"
                    <%}%>
                ><a href="#">成员列表</a></li>
            </ul>  

            <ul class="nav navbar-nav navbar-right">
                <% if(!login){  %>
                    <li <%if(active == "注册"){%>
                        class = "active"
                    <%}%>
                    ><a href="/regist">注册</a></li>
                    <li <%if(active == "登陆"){%>
                        class = "active"
                    <%}%>
                    
                    ><a href="/login">登录</a></li>
                <% }else{  %>
                    <li><a href="#">欢迎<%= username %></a></li>
                    <li><a href="#">设置个人信息</a></li>
                <% } %>
            </ul>
         </div>
        
      </div>
    </nav>

    // 2.不同的页面通过include的方法引入header.js ，在差异处理上，通过json向header.js传入不同的值，从而获得不同的解析内容；
    //主页
    <%- include("header.ejs",{"active":"全部说说"})%> 
    //login页
    <%- include("header.ejs",{"active":"登陆"})%> 
    //regist页
    <%- include("header.ejs",{"active":"注册"})%> //自己这样做，等于是在include的时候，解析

    //3.然后在render的时候传入本页面中的变量，即使用header.ejs的页面，如login.ejs中
        res.render("login.ejs",{
            "login":req.session.login == "1" ? true : false,
            "username":req.session.login = "1" ? req.session.username : ""
        })




    // 4.老师的做法是，本页面与引用的的页面统一解析填充
    //引入共享ejs
    <% include header.ejs %>
    //本页面与引用的的页面统一解析填充
    res.render("login.ejs",{
            "login":req.session.login == "1" ? true : false,
            "username":req.session.login = "1" ? req.session.username : "",
            "active":"登陆"
    })
    //其它页面和主页的解析方式是一样的
```

### v6.0 设置个人资料 之设置头像

ajax提交文件表单，可以利用jquery-form.js, 



设置头像这一bu最难，
* **初始头像**刚开始可以给每个用户都设置一个初始头像，图片文件名为moren.jpg，放到/avartar目录里面，然后将avartar目录给静态出来`app.use("/avartar",express.static("./avartar"))`因为以后要用来存放图片，名字很多容易造成域名冲突，所以要价格前缀

* **头像存储**将所有的注册用户，在注册的时候，都需要强行的在数据库中绑定一个不能改的field : avartar ,avartar中存储的是路径，刚开始路径中直接存moren.jpg就就行了（这是默认的）；这样每一位注册用户，在数据库中对应的document,就会多一个avartar属性，此属性对应用户头像的地址；修改图像实际上就是修改该属性对应的头像图片地址；这是一个原理；`{"_id":"sdfasdf","username":"sfasf","password":"fadfd=","avartar":"moren.jpg"}`

```js
exports.doRegist = function(req,res,next){
            /******/
            db.insertOne("user",{
                "username":username,
                "password":password,
                //这样每一位注册用户，在数据库中对应的document,就会多一个avartar属性，此属性对应用户头像的地址；
                "avartar":"moren.jpg"

                },function(err,result){
            /******/
            })
```

* **显示头像**：修改主页面，使其在主页面显示，已登陆用户的头像；
```js
    //index.ejs中
    //1.由于此时avartar文件夹已经被静态出来了，即直接输入localhost:3000/avartar.moren.jpg就可以访问moren这张图片；也就是说下面img中src中要填写的就是/avartar/moren.jpg;即用户的头像图片索引地址，对于用户来说，起始的索引都是一样的，都是/avartar/moren.jpg,但由于这个索引地址，后期用户可以通过“更改头像的接口进行更改，所以每个用户的索引地址都是不同的，这就要求此处填写的src值应该为一个ejs变量” 当呈递主页的时候，要传入这个avartar值，这个值就是用户数据库document中avartar属性对应的value；如用户document中avartar属性为moren.jpg，则填充之后的结果就是 img src="/avartar/moren.jpg" 
    <div class="jumbotron">
      <div class="container">
        <h1>Hello, world!
            //有session就显示头像，没缓存，就不显示头像；
              <% if(login){  %>
                    <img src="/avartar/<%=avartar%>" alt="">
              <%}%>
        </h1>

        <p>This is a template for a simple marketing or informational website. It includes a large callout called a jumbotron and three supporting pieces of content. Use it as a starting point to create something more unique.</p>
        <p><a class="btn btn-primary btn-lg" href="#" role="button">Learn more &raquo;</a></p>
      </div>
    </div>
```

```js
    //router.js中
    //2.渲染页面时，要填入avartar变量的真实值，是利用db.find函数，通过{"username":req.session.username}检索出来的document的avartar属性值；

    exports.showIndex = function(req,res,next){
        //2.1若用户已经登陆,呈现登陆过的页面
        if(req.session.login == 1){
            //检索数据库，用户document中属性avartar的值
            db.find("user",{"username":req.session.username},function(err,result){
                
                var avartar = result[0].avartar;
                res.render("index",{
                    "login":true,
                    "username":req.session.username,
                    "avartar":avartar 
                })
            })
        }else{
            //2.2若用户没有登陆，则呈现未登录状态的页面
            res.render("index",{
                "login":false
                //ejs文件中 使用avartar与username变量的前提都是login为true,当login为false的时候，不用传这两个值；
            })
        }
      
    }
```


* 个人头像的设置之头像图片上传业务： 

1.提供一个用户入口，用户点击可以发送到头像设置页的请求：127.0.0.1:3000/setavartar；

```js
    //index.js中
    <h1>Hello, world!
               <% if(login){  %>
                    <a href="/setavartar"><img src="/avartar/<%=avartar%>" alt=""></a>
              <%}%>
    </h1>
```

2.新建一个setavartar.ejs文件，作为头像设置页；当后台收到用户设置头像的请求时，将此页面渲染给用户；更改头像需要两个页面 ：一个是用来上传图片的页面(setavartar.ejs)，一个是用来剪切图片的页面(cut.ejs)（改自jcrop插件的demo页）；而之所以不用单个页面，原因在于利用ajax提交文件的实现太难，不过可以通过上面的插件jquery-form.js去突破；这个可以自己去尝试；

```js
    app.get("/setavartar",router.showSetAvartar)

    //设置头像页面的逻辑，与其它页面有所不同，因为在设置头像页面，用户的状态必须是登陆状态
    exports.showSetAvartar = function(req,res,next){
        if(req.session.login != 1){
            res.end("非法闯入，用户必须登陆");
            return;//这就破解了之前老大难的问题，即为什么进入被人的邮箱，却看不到别人的东西；原因在于必须是登陆状态；
        }
        res.render("setavartar",{
            "login":true,
            "username": req.session.username 
        })
    }
    //setavartar.ejs
    //此处应注意，button的type要为submit 点击后就可以发送，若用ajas发送请求，button的type就应该为button 用来点击触发事件；
    <form role="form" class="col-md-6" method="post" action="/dosetavartar" enctype="multipart/form-data">
        <h1>改头像</h1>                
        <div class="form-group">
            <label for="avartar">上传头像图片</label>
            <input type="file" class="form-control" id="avartar" name="avartar">
        </div>

        <button type="submit" class="btn btn-default">确定上传</button>
    </form>

```

3.服务器向用户渲染的是一个文件上传表单，选择好文件后，点击submit就会向指定action地址("/dosetavartar")发送post请求; 服务器接收并相应这个post请求；

> node中一共有三种路径：1.相对工作空间根目录的路径./表示工作空间根目录；2.相对与当前执行文件的路径，即利用relativepath插件直接ctrl+H出来的路径，3.是express.static静态出来的路径，这个路径是url;

```js
    //1.服务器接受post请求
    app.post("/dosetavartar",router.doSetAvartar)
    //2.服务器响应post请求
    exports.doSetAvartar = function(req,res,next){
        //3.解析用户post数据
        var form = new formidable.IncomingForm();
        //4.配置文件上传文件夹，此处有一个技巧：直接上传到"./avartar/"+req.session.name文件夹，数据库中用户名的不能重复的，这在用户注册的时候就已经被限制了，将用户上传的图片放到以用户名为名字的目录中，相当于将图片名封在了用户名的命名空间里，这样就可以避免图片引用路径重复的问题，若将上传的图片直接放到"./avartar"文件夹中，就要避免图片名重复，若在中间隔了一层用户名目录，就不用担心图片重复的问题； form.uploadDir = "./avartar/" + req.session.username ; 但是不能直接这样做，因为"./avartar/" + req.session.username 还不是一个目录，formidable不能自动帮我们去创建req.session,username这个目录(服务器会报 no such file or directory的错误)； 只能向将图片传到一个目录作为中转，然后通过fs模块 rename方法，转到目标目录中，rename方法，可以帮我们自动创建目录；
        form.uploadDir = "./avartar";
        //form.uploadDir = "./avartar/"+req.session.username;  no such file or directory
        //form.keepExtensions = false; 这一步没有什么意义，过会文件中专时还要改名；

        form.parse(req, function(err, fields, files) {
            //5.利用fs.raname()将中转文件移到目标文件夹，同时添加文件名，与拓展名，即fs.rename()同时做了三件事；
            //老师临时变卦了，直接将文件名字，改成用户名加文件原来的拓展名，这样简单省事；
            var oldPath = files.avartar.path;
            var extName = path.extname(files.avartar.name);
            var newPath = "./avartar/" + req.session.username + extName; 
            fs.rename(oldPath,newPath,function(err){
                if(err){
                    res.send("失败");
                    return;
                }
                //6. 改名成功后，我们让页面跳到下一个页面，而另外一个页面负责剪切；这一步没有保存到数据库，是因为每一个人的头像图片，都对应每一个人的用户名，什么时候保存到数据库都是来得及的；

                //7.跳转到切图的业务中去； 在跳转之前有一个技巧就是新建一个session属性，将图片的名字缓存一下,这样在跳转请求新页面的req.session中，可以去获取这一个值；
                // 旧页面向新页面跳转时，会发出一次请求，而请求中会携带旧页面的session,可以将旧页面的数据放到session中，以供新页面使用，这是一个逻辑；
                req.session.avartar = req.session.username + extName;

                res.redirect("/qie")
            })
        });
    }
```

* 个人头像设置之图片剪切业务

```js
    //1.接受业务
    app.get("/cut",router.showCut)
  
    //2.图片剪切页面 cut.ejs  正常情况下改自 老师做的jcrop小项目中的index.ejs 此处为了节省时间，直接将其复制过来，放到views中并改名为cut.ejs; 将小项目中的public文件夹直接覆盖到本项目的public文件夹； **ejs模板有一个接口变量avartar用来接收剪切图片的路径配置**

    <img src="/avartar/<%=avartar%>" id="target" alt="[Jcrop Example]"/>
    <div id="preview-pane">
        <div class="preview-container">
            <img src="/avartar/<%=avartar%>" class="jcrop-preview" alt="Preview"/>
        </div>
    </div>
    <input type="button" value="剪裁！！" id="btn">

    <script type="text/javascript">
        $("input").click(function () {
            var w = parseInt($(".jcrop-holder>div:first").css("width"));
            var h = parseInt($(".jcrop-holder>div:first").css("height"));
            var x = parseInt($(".jcrop-holder>div:first").css("left"));
            var y = parseInt($(".jcrop-holder>div:first").css("top"));

            $.get("/docut",{
                "w" : w,
                "h" : h,
                "x" : x,
                "y" : y
            },function(result){
                alert(result);
            });
        });
    </script>    
```

```js
    //3.呈递图片剪切页面 填充<%= avartar%>的变量值；
    exports.showCut = function(req,res,next){
        res.render("cut",{
            //在上传页面的处理函数中，将图片的名字已经存到了req.session.avartar属性中，此处可以直接拿过来使用；
            "avartar":req.session.avartar;
        })
    }

```

```js
    //用户在图片截切页面，选好剪切区域之后，点击剪切按钮，会先通过js获取剪切区域的顶点的坐标（xy值），以及所选区域的宽高（wh值），并会通过ajax的get请求，将这些值传递到后台服务器；图片会分为两次剪，第一次是用户剪，是假剪，目的是为了获取数据；第二次剪是真剪，是服务器剪，根据获取的数据，利用gm插件将图片剪裁；这就是剪图的逻辑；
    //1.服务器接收前台ajax的get请求
    app.get("/docut",router.doCut)
    //2.后台响应前台的get请求
    exports.duCut = function(req,res,next){
        //3.剪切图片
        var w = req.query.w;
        var h = req.query.h;
        var x = req.query.x;
        var = req.query.y;

        gm("/avartar/"+req.session.avartar)
            .crop(w,h,x,y)
            .resize(100,100,"!")
            .write("/avartar/"+req.session.avartar,function(err){
                if(err){
                    res.send("-1");
                    return;
                }
                //3.图片剪切成功之后，最终是将图片存放在，"./avartar"中，下一步就是更改当前用户document中的avartar属性，使其指向剪切的新图片（原先指向的是默认的图片），作为用户资料中的一部分，封存在用户的document中，这一步就是修改头像的本意；
                db.updateMany("user",{"username":"req.session.username"},{
                    $set:{"avartar":"req.session.avartar"},function(err,result){
                        if(err){
                            res.send("-1");
                            return;
                        }
                        //4.修改成功，向前台发送“1”,
                        res.send("1");
                    }
                })
                
        });
    }
    //5.前台ajax 收到数据“1”后定向到首页
    $.get("/docut",{
            "w" : w,
            "h" : h,
            "x" : x,
            "y" : y
        },function(result){
            if(result=="1"){
                //6.前台重定向到"/"后，会重新向"/"发送get请求，后台app.get("/",router.showIndex)接收到请求后会重新将页面渲染， 渲染中传入的数据"avartar":avartar，指向用户的头像，而现在这个头像已经被用户重新设置了，所以本次渲染的就是新的头像；
                window.location = "/";
            }
        });
```
* 使用req.session.login的几个坑；
 - 1.调试有session与cookies的代码很困难，因为每改变一次代码，nodemon就会将服务器重启，服务器重启后，就会将缓存清空；服务器上就不存在session，此时虽然用户浏览器中有session但是没法比对； 这一点是个“坑”自己尤为注意；
 - 2.在如下代码中：表达式"login":req.session.login == "1" ? req.session.username : "", 中的req.session.login == "1"这个表达式必须用()括起来，否则会造成req.session.login被修改为req.session.username的现象；自己就遇到了这个坑，试了n次，才找出原因；

```js
    exports.showCut = function(req,res,next){
    console.log(req.session.login);
    res.render("cut",{
        "login":(req.session.login == "1") ? true : false,

        "username":(req.session.login = "1") ? req.session.username : "",
        "avartar":req.session.avartar
    })
}
```

> 后台页面总体可以分为两大部分，有的是执行者，有的是呈递者，

### v7.0 数据库中 添加指定field的索引，以提高数据库的查询效率；

> Mongodb支持多种index类型，这相对于其他Nosql数据库而言具有很大的优势，它的索引类型比较接近SQL数据库，所以开发者在mongodb中使用索引将是非常便捷的。索引最大的作用就是提高query的查询性能，如果没有索引，mongodb需要scan整个collection的所有的documents，并筛选符合条件的document，如果有索引，那么query只需要遍历index中有限个索引条目即可，况且index中的条目是排序的，这对“order by”操作也非常有利。


```js
     //所有的js包，在被require的时候，都会被执行一次,这样当每次db.js被require的时候，init函数都会自动自行一次，为数据库创建一个index,index保存了指定field(username)的值，并按照filed(username)值的顺序排序
    init();
    function init(){
        //对数据库进行一个初始化
        _connectDB(function(err, db){
            if (err) {
                console.log(err);
                return;
            }
            db.collection('user').createIndex(
                { "username": 1},
                null,
                function(err, results) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    
                }
            );
        });
    }
    //查询的集合民，以及index指定的field值，提升为函数的接口层次，只需要每次做项目的时候，在init函数体内配置就可以了；
```

### v8.0 后台组建说说模板

* 未登陆的用户，没有发表说说的接口，已登陆用户要有发表说说的接口；

> 不同的页面，调用同样一个ajax;

> 用前台有什么好处，就可以提供各种服务；在前台去拼凑 json ;前台通过各种请求，去请求不同的json,然后前台收到不同的json,再拼合成一个大json, 将大json传到underscore模板中，进行无刷新渲染；

> 分页 后台要做的话 消耗很大，很大基本上做不过来；

> 每个人的名字都可以被点击，点击过就会进入目标人的页面里，就会罗列出目标人的所有说说；

> chrome浏览器的调试session的技巧，正常情况下一个浏览器，打开一个页面只能同时有一个session,而谷歌浏览器的隐身模式窗口，还可以打开另外一个session，即可以同时保有两个session（保有两个登陆用户）,两个用户名进行调试工作；即可以通过隐身窗口开小号，

> 在前台页面，关键是能提供这些接口，和实现这些接口的业务逻辑，至于样式是什么样的，不属于自己关心的范畴； **整个全栈，运转在后台，但根节还是在前台页面，页面中提供一些接口，与用户的鼠标与眼睛交互**抓住这个根，自己在迷宫中，在苦海泛舟中，才不会迷失太多；



> 要分清楚，弄明白页面中那一部分数据，直接写上的，而那一部分数据，是请求后台得到的， 


* 用户未登陆时，主页面有两个接口：注册接口与登陆表格接口，其中注册接口为一个按钮样式的链接(bootstrap)，点击之后可以直接跳转到注册页面；而登陆接口为一个表格，点击后可以直接登陆，这个表格是从login.ejs页面中直接截取的，包括三部分内容html、underscore模板、ajax逻辑；

* 若用户已经登陆,则首先应将用户名与用户头像在页面中渲染出来，其次要有用户发表说说的接口；

```html
    <!--1.用户未登陆时的用户状态-->
    <%if(login!="1"){%>
        <div class="row">
                <!--注册接口-->
                <div class="col-lg-6">
                    <h2>班级说说</h2>
                    <p>班级说说，是同学们交流的平台与园地</p>
                    <p><a class="btn btn-primary btn-lg" href="/regist" role="button">login &raquo;</a></p>
                </div>

                <!--登陆接口-->
                <form role="form" class="col-md-6">
                    <h2>欢迎登陆</h2>                
                    <div class="form-group">
                        <label for="username">用户名</label>
                        <input type="text" class="form-control" id="username" placeholder="用户名，且用户名不可以重复">
                    </div>
                    
                    <div class="form-group">
                        <label for="mima">Password</label>
                        <input type="password" class="form-control" id="password" placeholder="密码至少六位">
                    </div>
                    
                    <div class="checkbox">
                        <label>
                            <input type="checkbox"> 记住密码
                        </label>
                    </div>
                    <button type="button" class="btn btn-default" id="login">登陆</button>

                    
                    <div class="row" id="failed"> </div>    
                </form>
                <!--underscore模板-->
                <!--ajax逻辑-->
        </div>
    <%}else{%>
        <!--2.用户已登陆的状态-->
            <div class="row">
              <div class="col-md-2 col-md-offset-1">
                  <p><a href="/setavartar"><img src="/avartar/<%=avartar%>" alt=""></a></p>
                  <h2><%=username%></h2>
              </div>
              <div class="col-md-7 col-md-offset-1">
                <!--开放一个用户 填写说说内容与提交内容至后台的接口-->
                <textarea name="content" id="" cols="80" rows="10"></textarea>
                <p><button type="button" id="fabiao" class="btn btn-success btn-sm">发表说说</button></p>
              </div>
            </div>  
    <%}%>
```

* 完成说说发表的接口逻辑

```js
     //1.前台ajax接口，用户点击发送按钮，ajax会将用户在文本域输入的文本通过post方法向服务器指定url发送请求
     $("#fabiao").click(function(){
         $.post("/doshuoshuo",{"content":$("#content").val()},function(result){
             //接受后台ajx响应
             if(result=="1"){
                 alert("发表成功！")
             }else{
                 alert("发表失败，请联系管理员！")
             }


         })
     })
     //调试，点击按钮，观察一下控制台请求是否发出；

     //2.后台响应并处理，前台的ajax请求；
     app.post("/doshuoshuo",router.doShuoShuo);

     exports.doShuoShuo = function(req,res,next){
        //2.1 首先要保证是已登陆用户在操作
        if(req.session.login!="1"){
            res.send("必须保证用户为登陆状态");
            return;
        }

         //2.2利用formidable接受post数据
        var form = new formidable.IncomingForm();
        form.parse(req, function(err, fields,files){
            //2.3数据接收完毕后，将数据存储到数据库“shuoshuo”集合当中，document的field包括username data content；
            db.insertOne("shuoshuo",{"username":req.session.username,"date":new Date(),"content":fields.content},function(err,result){
                //2.4响应ajax请求
                if(err){
                    res.send("-3");
                    return;
                }
                res.send("1");
            })
        })
     }
```

* ejs模板页面显示说说的接口


```js

        //1.后台ejs模板（视图层）中的接口，是用来承接后台render的数据；显示说说本质上是显示数据库shuoshuo内的document，每一条说说都对应一条document; 控制层render的时候向ejs穿一个result数组，即db数据库的查询结果； ejs根据承接到的数组，去渲染显示区域；
        <%for(var i=0;i<result.length;i++){%>
            <div class="col-md-4">
              <h2><img width="50px" src="/avartar/<%=result[i].username%>.jpg"><%=result[i].username%></h2>
              <p><%=result[i].content%></p>
              <p><a class="btn btn-default" href="#" role="button">View details &raquo;</a></p>
            </div>
        <%}%>

        //现在这套模板是在后台执行的，也就是说不管有多少用户来访问，其执行的事情不纯粹（纯粹的是指只参与数据的逻辑与运算，不参与过多的业务），其都是利用后台的那一块cpu，执行一大堆for循环，利用ejs引擎组装成模板之后发给用户，所送给用户的好处，就是直接在页面上组建dom,在页面查看源码中，你将不能知道这一部分内容是从数据库中得来的；

```

```js
        //2.控制层获取说说集合中的document结果数组，并通过render将数据传递给ejs，而后ejs渲染页面
        db.find("shuoshuo",{},{"sort":{"date":-1}},function(err,result){
            //3.我们总是希望，数据最后插入的，显示在最前面;而db正常的查询结果中，最后插入的数据总是放在最后面，所以我们传入了配置json，用来配置数据顺序；
            res.render("index",{
                //*****
                "result":result;
            })
        })
```
### v9.0  前台组建说说模板

* 利用underscore在前端组建模板
 > 上述的方法，是在后台组建模板，浪费的是后台服务器的cpu；利用ajax是接受后台的数据，在前台利用underscore组建模板，是在访问用户前台执行的，用的是用户的cpu，那个效率高一看便知；

 >  用前台有什么好处，就可以提供各种服务；在前台去拼凑 json ;前台通过各种请求，去请求不同的json,然后前台收到不同的json,再拼合成一个大json, 将大json传到underscore模板中，进行无刷新渲染；

 > **ajax嵌套使用初步：**ajax嵌套有一个坑，就是ajax本身是异步，而此处必须使用同步嵌套否则就会出错，具体方法是传入同步参数，或使用迭代器，化异步为同步；  “我们通过ajax请求获取某个人的username之后，再次发起一个请求，查询某一个人的信息 ”  `for循环中不能有异步函数，因为函数异步完成之后，for循环中的i值就已经变过了； 解决办法一是将内部的异步函数变成同步，二是将for循环改成迭代器;`

 要有利用ajax，来暴露json的思路；不用担心路由很乱； 逻辑就是写一个服务，然后将所有的json，都暴露出来； 前后端通过json进行交互；

 db数据库虽然不支持外链，但可以通过ajax嵌套，一层服务套另外一层服务，从而实现一层数据套另外一层数据，曾而实现了数据的“外链”；

 请求的数据

 ```js
    //1将后台ejs模板转化为前台underscore模板

    //1.1原先在后台利用ejs组建的模板
    <div class="container">
        <div class="row">
        <%for(var i=0;i<result.length;i++){%>
            <div class="col-md-4">
              <h2><img width="50px" src="/avartar/<%=result[i].username%>.jpg"><%=result[i].username%></h2>
              <p><%=result[i].content%></p>
              <p><a class="btn btn-default" href="#" role="button">View details &raquo;</a></p>
            </div>
        <%}%>
        </div>
      </div>
    //1.2 用于在前台组建的underscore模板,underscore在行为上与ejs有一点不同（ejs是直接组建页面，underscore是组建节点，而后利用dom操作，来组建页面），ejs是直接组建页面，underscore是先将模板组建成dom节点，而后利用js的dom操作将节点插入或缀到页面某一个节点中，来组建页面； 要弄清这两条线的逻辑；
    <style type="text/css">
        .grid{
            height:200px;
        }
    </style>
    //浮动的盒子要有高，否则撑不开父亲；
    <div class="container">
        <div class="row" id="shuoshuo">
        </div>
    </div>
    <script type="text/template" id="moban">
        <div class="col-md-4 grid">
            <h2><img width="50px" src="/avartar/{{=avartar}}">{{=username}}</h2>
            <p>{{=content}}</p>
            <p><a class="btn btn-default" href="#" role="button">View details &raquo;</a></p>
        </div>
    </script>
 ```
 
 ```js
    //1.3利用假数据，来调试underscore模板是否能正常工作
    //模拟后台传来的json
    var result = {"result":[
        {"username":"小红","content":"我是强哥，班主任很信任我","avartar":"moren.jpg"},
        {"username":"小ming","content":"我是强哥f很信任我","avartar":"moren.jpg"},
        {"username":"小兰兰","content":"我是小兰兰，班主任很信任我","avartar":"moren.jpg"},
    ]}
    var compiled = _.template($("#moban").html());
    for(var i=0;i<result.result.length;i++){
        //组建节点
         var html = compiled(result.result[i]);//此处是一个技巧，就是前后端json的契合；underscore 组建节点需要传入json字典，而result.result[i]正好是一个json，且两个json的key值，完全契合；就可以直接拿来当字典用了；这一点用起来相当舒服；
         //组建页面
         $("#shuoshuo").append($(html));
    }
 ```

```js
    //1.4 获取真实的json数据 
    
    /*第一个坑 我们测试用的json是下面这种形式， 即说说的内容与用户的基本信息是放在同一个json中，
    `{"username":"小红","content":"我是强哥，班主任很信任我","avartar":"moren.jpg"}` 
    
    而真实的数据库document中,  用户基本信息与其说说内容分别位于不同的collection中不同的document中；

    {"_id" : ObjectId("5891c3eeccce5e15646aaafd"), "username" : "sdsd", "password": "MlvW3PpV5JrigJiXCMJVBg==","avartar":"moren.jpg"}
    { "_id" : ObjectId("589c697dbb2e1a187c379cad"), "username" : "小兰兰", "date" :ISODate("2017-02-09T13:07:09.979Z"), "content" : "fasdfasd" }
    
    underscore在组建节点模板时，需要三个key值，这三个值不同同时从一个数据库json去获得，需要同时向这两个document中去获取，即组建一次underscore模板，需要服务器暴露两个json；  （在关系型数据库中，可以通过外链，而在非关系型数据库中只能通过多次请求服务器，服务器多次暴露json,前台从多个json中获取数据，去组建模板）
    */

        var compiled = _.template($("#moban").val());
        //1.41 请求服务器暴露第一个json ; 获取shuoshuo集合的第0页document,内容包括用户名usernaem与说说内容content
        $.get("/allshuoshuo?page=0",function(result){
            //for(var i=1;i<result.length;i++){
                //1.42 ajax嵌套：我们识别出某一个人的username(result.r[i].username)之后，再一次发起请求，查询某一个人的信息（包括其对应的avartar）,
                //第二个坑 :我们现在是for循环中发送ajax异步请求：而`for循环中不能套异步函数，因为函数异步完成之后，for循环中的i值就已经变过了； 解决办法一是将内部的异步函数变成同步（通过传ajx参数），二是将for循环改成迭代器;` 而chorme不允许ajax发送同步请求，解释是说会影响用户体验，所以最终只有将for循环，改成迭代器；

                iterator(0);
                //从0开始迭代
                function iterator(i){
                    if(i==result.result[i].length){
                        return;
                        //迭代终止
                    }
                    //1.43请求服务器暴露第二个json;
                    $.get("/userinfo",function(result2){
                        //聚合两个json 为一个json ;
                        result.result[i].avartar=result2.result.avartar;
                        //利用聚合过的json，组建模板
                        var html = compiled(result.result[i]);
                        //dom操作
                        $("#shuoshuo").append($(html));
                        //向上迭代
                        iterator(i++);
                    })
                }
               
           // }
        })

        //后台逻辑
        //127.0.0.1:3000/allshuoshuo?page=0
        app.get("/allshuoshuo",router.AllShuoshuo);
        exports.AllShuoshuo = function(req,res,next){
            var page = req.query.page;
            db.find("shuoshuo",{},{"pageamount":9,"page":page,"sort":{"date":-1}},function(err,result){
                res.json({"result":r})
            })
        }
        //127.0.0.1:3000/userinfo?username=小红
        app.get("/userinfo",router.UserInfo);
        exports.UserInfo = function(req,res,next){
            var username = req.query.username;
            db.find("user",{"username":username},function(err,result){
              // res.json({"result":result});
              //但这样直接写，会出现一个问题，暴露的json是如下的形式`{"_id" : ObjectId("5891c3eeccce5e15646aaafd"), "username" : "sdsd", "password": "MlvW3PpV5JrigJiXCMJVBg==","avartar":"moren.jpg"}` json包含的用户信息中，含有用户的密码；即后台会直接暴露json，这样会被别人看作很不专业；解决办法是，在后台暴露json之前，将json处理一下；
              var result = {"_id":result._id,"username":result.username,"avartar":result.avartar};
              //即将要暴露的项，重新包裹成一个json，然后将这个json暴露出去；
              res.json({"result":result}); 
            })
        }

```

> 字典修饰功能介绍；字典就是一个json对象，字典修饰本质就是对这个json对象进行，增删改操作；如为json对象增加一条属性；字典修饰工作，实际上是将两个json对象，聚合成一个新的json对象， 然后underscore利用这个新的json对象，去组建模板节点；在关系型数据库中，这一步称为** 聚合**

```js
    var json1 = {"name":"xiaoli","age":"12"}
    var json2 = {"name":"xiaoli","hobby":"打球"}
    json2.hobby = json1.hobby;
    //json2 = {"name":"xiaoli","hobby":"打球","hobby":"打球"}
    var html = compiled(json2)
```

> 做了那么多，说白了，就是mongodb没有外链，有外链的话，早就做出来了；外链是关系型数据库的一个术语，当你从一个表中，想获取另外一个表的信息的时候，就需要外链，外链是延展表维度的一个方法； 但mongo太单薄，其仅仅依靠json 来存储数据，若同时需要多个表单的数据，只有再重新请求一下json

### v10.0 班级说说分页

1.得到数据的总数量，
2.根据得到的数据总数量，来计算一共可以显示多少页；

**前台毕竟要知道后台的一些事情，你得其一个网址**，你得给其一个网址； 后台提供一种服务，前台通过请求这种服务，来请后台去暴露某方面的一些数据；
```js
    //后台提供得到数据量的服务，前台只要去请求，后台就会去暴露" 数据总数量"；
    app.get("/allshuoshuocount",router.getAllShuoshuoCount);

    exports.getAllShuoshuoCount = function(req,res,next){
        db.getAllCount("shuoshuo",function(result){
            res.send(result.toString());
        })
    }
    //127.0.0.1:3000/allshuoshuocount   //37
```

3.得到的数据总数量，用于构建**分页按钮**
```js
    //分页逻辑
     <nav>
          <ul class="pagination">
                <li><a href="#">&laquo;</a></li>
                <% for (var i=1; i<=pageamount; i++){ %>
                    <li data-page="<%=i%>" class="yemaanniu"><a href="#"><%=i%></a></li>
                <% } %>
                <li class="next-btn"><a href="#">&raquo;</a></li>
          </ul>
    </nav>
```
```js
    //不用前端模板，利用ajax生做
    //<script type="text/javascript">
        $.get("/allshuoshuocount",function(result){
            //获取数据条数；
            var amonut = parseInt(result);
            //获取分页数
            var pageamount = Math.ceil(amount/10);
            //创建与分页数对等的按钮；
            for(var i=0;i<pageamount;i++){
                $(".pagination").append(" <li class='pageLi'><a href='#'>"+i+"</a></li>")
                /*
                    页码有了，但是链接不对，（没有点击按钮，刷新页面的功能）此时有两种处理方式，  
                    第一种：修改链接<a>的href地址，即点击链接，可以发送类似127.0.0.1:3000/allshuoshuo?page=0的请求
                    第二种；是为每个li绑定一个事件，当li被点击时，会触发某一个事件处理函数（可以调用其它的函数）；
                */
            }
            $(".pageLi").click(function(){
                //将点按钮之前前说说的内容清空
                $("#shuoshuo").html("");
                //将current active的位置改变一下
                $(this).addClass("active").siblings().removeClass("active");
                //按钮点击时调用内容挂靠函数；
                var page = $(this).index()-1;
                //$(this).index()是从1开始的，而页码条是从0开始的；
                getPage(page);
            })
        })
   // </script>

```

    1.获取数据总数
    2.根据数据总数，生成分页条
    3.为分页条，按钮添加点击事件
    4.事件处理函数

**点击按钮刷新页面时，需要将将前一次点击刷出来的内容清楚掉**事件函数执行后，原来的按钮刷出来的内容并没有消失，即你越点击，页面会越长； 但此处页面有一个坑点: 
**页面内容清除的瞬间，页面会向上弹**，感觉是在刷新整个页面，但实际上刷新的只有局部，这样用户体验很不好；原因在于区域没高，ajax页面刷新时，瞬间消失了；解决办法是给#shuoshuo加一个高，这样当期内部内容全部消失时，其有个高撑着，也不会向上弹；

```html
    #shuoshuo{
        height:500px;
    }
```

**current active** , $(this).addClass("active").siblines().removeClass("active");


```js
    getPage(0);
    //页面初次加载的时候，会调用getPage(0);
    function getPage(page){
        $("#shuoshuo").html("");
        //点击按钮刷新页面时，需要将将前一次点击刷出来的内容清楚掉
        var compiled = _.template($("#moban").val());
        $.get("/allshuoshuo?page="+page,function(result){
                iterator(0);
                function iterator(i){
                    if(i==result.result[i].length){
                        return;
                    }
                    $.get("/userinfo",function(result2){
                        result.result[i].avartar=result2.result.avartar;
                        var html = compiled(result.result[i]);
                        $("#shuoshuo").append($(html));
                        iterator(i++);
                    })
                }
        })
    }
      

```

### v11.0 个人主页

* 个人主页的静态模板 : 此步骤做到 输入：127.0.0.1:3000/user/小兰 就可进入小兰的主页

```js
    //主路由
    app.get("/user/:username",router.showUser);

    //后台逻辑
    exports.showUser = function(req,res,next){
        var user = req.params.username;
        db.find("shuoshuo",{"username":user},function(err,result){
             db.find("/user",{"username":user},function(err,result2){
                res.render("user"{
                    "login":(req.session.login == "1") : true ? false,
                    "username":(req.session.login == "1") : req.session.username ? "",
                    "user":user,
                    "usershuoshuo":result,
                    "useravartar":result2[0].avartar
                })
             })
        })
    }

    //页面ejs模板 改自login.ejs
    <style type="text/css">
        .one{ 
            border-bottom:1px solid #ccc;
        }
    </style>

    <%- include("./header.ejs",{"active":"登陆"}) %> //改点一

    <div class="container">
         <!--标题-->
         <img src="/avartar/<%=useravartar%>">
         <h1><%=user%></h1>
         <div class="row col-md-6">
         <!--显示个人的全部说说-->
            <%for(var i=0;i<usershuoshuo.length;i++){%>
                <div class="one">
                    <p><%=usershuoshuo[i].content%></p>
                    <p><%=usershuoshuo[i].date%></p>
                </div>
            <%}%>
         </div>
    </div>

```

* 点击进入**我的说说**，已登陆用户点击**我的说说**，即可以导向 127.0.0.1:3000/user/req.session.username, 即进入个人主页；

```js
        //header.ejs
        <ul class="nav navbar-nav">
            <li <% if(active == "全部说说"){%>
                    class = "active"
                <%}%>
            ><a href="#">全部说说</a></li>

            <% if(!login){  %>
                <li <% if(active == "我的说说"){%>
                        class = "active"
                    <%}%>
                ><a href="/user/<%=username%>">我的说说</a></li>
            <%}%>

            //用户未登陆，则header不显示**我的说说按钮**
            //用户若登陆，点击链接导向 指定url

            <li <% if(active == "成员列表"){%>
                    class = "active"
                <%}%>
            ><a href="#">成员列表</a></li>
        </ul>  
```

### v12.0 显示成员列表(显示所有的注册用户)

```js
    //主路由
    app.get("/userlist",router.getUserList);
    //处理函数
    exports.showUserList = function(req,res,next){
        db.find("user",{},function(err,result){
            res.render("userlist"{
                "login":(req.session.login == "1") : true ? false,
                "username":(req.session.login == "1") : req.session.username ? "",
                "userlist":result
            })
        })
    }

    //userlist.ejs；直接改自user.ejs
    <style type="text/css">
        .one{ 
            border-bottom:1px solid #ccc;
        }
    </style>

    <%- include("./header.ejs",{"active":"登陆"}) %> //改点一

    <div class="container">
         <!--标题-->
         <img src="/avartar/<%=useravartar%>">
         <h1>所有成员</h1>
         <div class="row col-md-6">
         <!--显示所有的已经注册用户-->
            <%for(var i=0;i<userlist.length;i++){%>
                <!--点击用户列表中的用户头像或姓名，可以直接进入对方主页-->
                <a target="_blank" href="/user/<%=userlist[i].username%>">
                    <div class="one">
                        <p><%=userlist[i].username%></p>
                        <p><img src="/avartar/<%=userlist[i].avartar%>"></p>
                    </div>
                </a>
            <%}%>
         </div>
    </div>

```