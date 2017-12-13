
var fs = require("fs");

exports.getAllAlbums = function(callback){
   fs.readdir("./uploads",function(err,files){//fs中的路径，都是相对于工作空间根目录的路径；
       if(err){
           callback(err,null)
       }
       var albums = []; //函数要返回的文件夹；
       (function iterator(i){
           if(i == files.length){
              
               callback(null,albums);
            //    console.log(albums);//将最终迭代结果，打印出来，看一下；
               return ;
           }
           fs.stat("./uploads/"+files[i],function(err,stats){
               if(err){throw err};
               if(stats.isDirectory()){
                    albums.push(files[i]);
               }
              iterator(i+1);
           })
       })(0);
   })
}

// 通过目录名，得到目录下的所有图片；
exports.getAllImagesByAlbumName = function(album,callback){
    fs.readdir("./uploads/"+album,function(err,files){
        if(err){
            callback(err,null);
            return;
        };
        var images = [];
        (function iterator(i){
            if(i == files.length){
                callback(null,images);
                return;
            };
            fs.stat("./uploads/"+ album + "/" +files[i],function(err,stats){
                if(err){
                   callback(err,null);
                    return;
                };
                if(stats.isFile()){
                    images.push("/"+album+ "/" +files[i])
                };
                iterator(i+1);
            })
            
        })(0);
    })
}

exports.getAlbumsArray = function(callback){
   fs.readdir("./uploads",function(err,files){
       if(err){
           callback(err,null);
           return;
       }
       var albumsArray = [];
       (function iterator(i){
           if(i == files.length){
               callback(null,albumsArray);
               return;
           }
           fs.stat("./uploads/"+files[i],function(err,stats){
               if(err){
                   callback(err,null);
                   return;
               }
               if(stats.isDirectory()){
                   albumsArray.push(files[i]);
               }
               iterator(i+1);
           })
       })(0);

   })
}