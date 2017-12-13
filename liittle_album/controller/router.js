
var file = require("./../modules/file");
var formidable = require("formidable");
var util = require("util");
var fs = require("fs");
var sd = require("silly-datetime");
var path = require("path");
// 首页面
exports.showIndex = function(req,res){
        file.getAllAlbums(function(err,albums){
           if(err){
               res.send("找不到该页面")
           }
            res.render("index",{
                albums:albums
            })
        })
}   

//理解层面一：： 相册页面  ===明白要获取的数据形式images:["/小狗/1.jpg","/小狗/2.jpg"]
// exports.showAlbum = function(req,res){
//     // 逻辑1遍历指定相册（根据前面app.use中设计的路由指定相册就是指req.params.albumName）中的所有图片；
//     var albumName = req.params.albumName;
//     // 具体业务 交给模块 modules去处理；获取图片信息后，去渲染album模板；
//     res.render("album",{
//         albumname:albumName,
//         images:["/小狗/1.jpg","/小狗/2.jpg"]
//         //作为一个领导，要明白，进行下一层业务之前，自己要获取的数据是什么样的；images:["/小狗/1.jpg","/小狗/2.jpg"]
//     })
// } 

/*------------------------------------------------重点总结
     渲染页面是在控制层（controller）去render; 控制层数据的获取是在模块层(modules)中去获取，
     在进入modules层之前，可以利用假定数据，在控制层render试一试，以便可以明确自己想要的数据形式，
     以及辨别视图层views是否工作正常； 

     即controller层，上面的领导是图层，下面的小兵是模块层；调动小兵(调用模块函数)去获取字典数据；将数据反馈上级视图层（返回渲染视图res.render("views",{dictionary})）
---------------------------------------------------*/

// 相册页面（承上启下的控制层）,

// 根据所要的数据形式images:["/小狗/1.jpg","/小狗/2.jpg"]，肯定需要一个函数，去获取指定相册目录下的图片，并将图片的链接，以上面既定的形式放到数组images中；这是一个i/o过程，


/*---------重点规律-
在modules层执行i/o的函数肯定是异步的；按照node的异步编程逻辑，这个异步函数要有一个callback参数，以便接收controller层传入的回调函数 ***(modules干完自己的活之后，还要把领导的活干喽)****；

回调函数中要有一个参数err，i/o遇到错误，err也是一种i/o的结果，
回调函数中还要有一个参数data，可以承接正常i/o的数据的结果,
自己的工作有了结果之后，下一步就是利用这些结果去 做领导的活；

即controller层在调用modules让其i/o数据时，一般要传入一个回调函数，告诉其i/o之后，要做什么；回调函数要能接收两个参数err,data 分别对应假如 i/o过程中出错，你紧接着要做什么，与顺利得到i/o结果之后，紧接着要做什么；这是一个固定的套路；形式如下：
    var file =require("./../modules/file");

    file.fn1([option],function(err,data){  //fn1为modules目录下file.js文件暴露的函数；
        紧接着要做的事；
        if(err){
            next();
            return;
        }
    })

-------------------------------------
还未进入modules层，相册都应该具体到如下的样子，上面安排的越是具体，下面的活越好干；
实际上如下：控制层就写好了；
exports.showAlbum = function(req,res,next){
    var albumname = req.params.albumName;
    file.getAllImagesByAlbumName(albumname,function(err,images,next){
        if(err){
            next();
            return;
        }
        res.render("album",{
        albumname:albumname,
        images:images
    })
    })
}
-------------------------*/ 
// 相册页面
exports.showAlbum = function(req,res,next){
    var albumname = req.params.albumName;
    file.getAllImagesByAlbumName(albumname,function(err,images){
        console.log(albumname);
        if(err){
            next();
            return;
        }
        res.render("album",{
            albumname:albumname,
            images:images
        })
    })
}

// 显示上传
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

// 接收表单post数据
exports.doPost = function(req,res,next){
 
    var form = new formidable.IncomingForm();
    // 利用这一步，其实表单中的数据，就已经接收完毕了；

    form.uploadDir = "./tempup";
    // 文件的上传路径配置，有个坑，需要填； 若我们在服务器上直接配置上传路径 form.uploadDir = "./uoloads/文件夹名字"的时候， 就会有一个问题----即用户的表单还没有提交上来（用户还没有选择上传的文件夹），我们不能提前将相册文件夹，帮用户选好（若在服务器上配置的是小强文件夹，而用户选择的是小兰文件夹，就没有办法放了）；  解决办法是：先将用户上传的文件，放到一个”中转文件夹中“，然后根据用户选择的相册名字，将其挪到正确的文件夹中；如先将文件的临时上传路径，设在根目录的tempup文件夹中；

    // 配置还之后，先调试一下，看能否上传到，指定临时路径；看到上传过来的没有后缀的文件之后，下一步就是集中精力，利用文件操作，将其转移到用户指定的文件夹之中；


    form.parse(req,function(err,fields,files){

        if(err){
            next();
            return;
        }
        /*图片上传尺寸的控制------------
        首先是获取上传文件的尺寸：
        var fileSize = parseInt(files.picture.size);
        接着根据文件尺寸做条件流：
        if(fileSize > 1024){
            //将文件删除；删除文件用fs.unlink();删除文件夹用fs.rmdir();
            

            fs.unlink(files.picture.path);
            res.send("图片应小于1M")
            return;
        }else{
            //执行下面转译文件操作；
        }
        
        ----------------------------*/ 
        var size = files.picture.size;
        if(size > 1024){
            fs.unlink(files.picture.path);
            res.send("图片应小于1M")
            return;
        }else{
        // console.log(fields);
        // console.log(files);

        // 文件当中有size属性（files.tupian.size），限制用户上传的图片的大小就是通过size属性来实现的，在开发过程中，有两种实现方式，第一种是先将文件传输到服务器上面，服务器检测文件大小，若文件大于限制，则直接将文件删除，并向用户反馈说文件太大； 第二是浏览器检测，说“你上传的图片太大了，但浏览器检测，需要提供足够的API，chrome有，IE没有；” 

        /*---------文件移动-------
        文件移动，主要是利用fs.rename()方法，需要传入两个参数oldpath与newpath
        oldpath可以通过files对象获取，利用files.tupian.path就可以获取；

        newpath主要有两大部分组成分别是路径目录与文件名：
            1.目录是由"./uploads/" + 用户指定的相册目录名--fiels.album(控件的name属性)两部分组成；
            
            2.文件名由时间戳、5位随机数、文件拓展名三部分组成；
                时间戳可以利用silly-datetime获取；
                var tt = sd.format(new Date(),"YYMMDDHHmmss");
                var ran = parseInt(Math.random()*89999 + 10000);
                var extname = path.extname(files.tupian.name);

        -------------**/ 
            var oldpath = files.picture.path;

            var tt = sd.format(new Date(),"YYYYMMDDHHmmss");
            var ran = parseInt(Math.random()*89999 + 10000);
            var extname = path.extname(files.picture.name);
            
            var newpath = "./uploads/" + fields.album +"/"+ tt + ran + extname;
            console.log(newpath);
            fs.rename(oldpath,newpath,function(err){
                if(err){
                    res.send("改名失败");
                    return;
                }
            })
        }

        return;
    })
}