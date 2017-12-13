# 小小相册Node.js实战

## 初始化工作环境 tag:v1.0

* 新建一个文件夹，并在文件夹中创建3个子文件夹，分别命名为modules controller views即MVC; 说白了mvc就是将东西放在一个文件夹里，以减少他们之间的耦合；彼此之间互相调用；

* 创建一个上传文件的文件夹uploads,一个呈递静态页面的文件夹pulic;一个存放模块的node_modules文件夹，一个app主文件app.js;

* 用npm init一个package.json文件；

* 创建一个jsconfig.json文件，方便智能提醒；使用typing初始化一个tds文件夹；

* 安装必要的node模块，以及tds文件；

* vscode中安装ejs语言支持插件；安装后可以使用emmet编辑ejs模板；


## 创建静态首页面 v2.0


* modules文件夹，是用来执行具体业务的，即最脏最累的活，要由modules文件夹去完成；
* app.js实际上就是一个中控中心，设置了一堆的东西app.set()，具体的路由交给函数去处理app.get("/",router.showIndex)，函数被写在了controller文件夹的包里；app.js是顶层，controller为控制层，modules为最底层的业务实现层；
* 谁在负责路由?app.js负责路由，controller中的router.js不负责路由，其只是函数的罗列，但是其罗列的就死**路由函数** 所以就起名为**路由函数**；

## getAllBum函数的封装 v3.0


## uploads 文件的上传（readme文件，就是可以出迷宫中的线团，一定要认真编写）

* 首先要配置views模板文件（index.ejs album.ejs）中的链接，即当点击"上传"时，可以发送至路由为"/uploads"的链接请求；

```js
        <li class="active"><a href="/">全部相册</a></li>
        <li><a href="/uploads">上传</a></li>
```

* 接着要去配置主入口文件(app.js)，创建一个中间件，用来处理 路由为"/uploads"的访问请求；处理函数为controll文件夹router.js文件中暴露的showUploads函数；

```js
        app.use("uploads", router.showUploads)

```

* 接着在router.js中暴露一个showUploads函数，该函数作为一个中间件，要有三个参数req,res,next; 函数主要用于插入模板数据，并渲染视图；其中模板放在视图层views中，数据由modules层函数i/o来获取；

```js
        exports.showUploads = function(req,res,next){
            渲染views页面
        }

```

* 接着去在views中去创建模板文件uploads.js 同样是去bootstrap中，去找组件；配置完模板之后，要检查模板的那一部分数据是动态的，其中选择上传文件夹控件的下拉列表中，列表各项的名字应该都是动态的，渲染时应为真实的相册文件夹名字；

```html
    <form role="form" style="width:40%;">
      <div class="form-group">
        <label for="exampleInputEmail1">选择文件夹</label>
        <select class="form-control">
             <!--<option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>-->
            <% for(var i=o, i<albums.length,i++){ %>
                  <option><%= albums[i] %></option>
            <% } %>
        </select>
      </div>
      <div class="form-group">
        <label for="exampleInputFile">选择图片</label>
        <input type="file" id="exampleInputFile">
      </div>
      <button type="submit" class="btn btn-default">上传</button>
    </form>
```

* 此时就可以中showUpload将视图模板渲染一下试试了，若需插入 模板字典 可以直接利用假数据去调试，目的是测试视图是否工作正常；

```js
        exports.showUploads = function(req,res,next){
            res.render("uploads",{
                albums:["小猫","小狗"]//测试用的假数据，有用函数i/o获得真实的；
                //测试模板字典数据（真实的由modules层的i/o函数获得）
            })
        }

```

* 视图假数据测试正常，"控制层" 就可以调动 "模块层" 去i/o获取真实的数据，获取的数据格式为"测试数据时用的数据格式"；此时有几个规律：
    - 控制层函数 去调动模块层函数 异步i/o，一般还要去传递一个 回到函数，以告诉 模块函数i/o到数据之后还要接着做什么（modules干完自己的活之后，还要把领导的活干喽）;**相应的控制层在调用modules函数时，要传一个回调函数过去，modules函数在定义时，要有一个能接受回调函数的callback参数**

    - 回调函数主要用于承接，modules函数异步i/o的结果，并执行i/o之后的业务；所以其在定义时要留参数去接收i/o的结果；参数一般有两个： 1.参数err，用来承接i/o过程中遇到的错误结果（错误也是一种结果）；2.参数data，可以承接正常i/o的数据的结果；

```js
        //controller/router.js
        exports.showUploads = function(req,res,next){
            file.getAlbumsArray(function(err,albumsArray){
                if(err){
                    next();
                    return;
                }
                res.render("uploads",{
                    albums:albumsArray
                })
            })
        }

```

* 接着讲精力，集中放在modules层，可以先用假数据测试一下controller层是否能正常工作；这就叫做层层把控；

```js
    //./modules/file.js
    exports.getAlbumsArray = function(callback){
        var albumsArray = ["小猫","小狗","小兰"];//要i/o真实获取的用来测试控制层的假数据
        callback(null,albumsArray);
        return;
    }

```

* 利用modules层函数i/o,获取真实的i/o数据；数据形式类似于测试数据["小猫","小狗","小兰"];

```js
    //./modules/file.js
   exports.getAlbumsArray = function(callback){
   fs.readdir("./uploads",function(err,files){
       if(err){
           callback(err,null);
           return;
       }
       var albumsArray = [];
       (function iterator(i){
           if(i = files.length){
               callback(null,albumsArray);
               return;
           }
           fs.stat("./uploads/"+files[i],function(err,stats){
               if(stats.isDirectory()){
                   albumsArray.push(files[i]);
               }
               iterator(i+1);
           })
       })(0);

   })
}
```
