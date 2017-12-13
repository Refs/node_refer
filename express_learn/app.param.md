## app.param()的使用方式：

express中app.param方法用于验证参数，我个人把它理解成类似对参数过滤的一个中间件。
在这里我来结合几个demo,加深大家对app.param方法的理解。

```js
var express = require('express');
var app = express();
app.param(function(param, option) {
  return function (req, res, next, val) {
    if (val == option) {
      next();   //
    }
    else {
     res.sendStatus(404);
    }
  }
});
app.param('id', 1337);
app.get('/user/:id', function (req, res) {
  res.send('参数通过检验');
});

app.listen(3000, function () {
  console.log('Ready');
});
```

在上述例子中，只有在地址栏输入http://localhost:3000/user/1337的情况下，页面才会显示“参数通过检验”。
也就是说app.params()可以对地址栏参数进行过滤，针对不同参数作出不同响应。
但是上述代码，在运行的时候会有这样的提示：
express deprecated router.param(fn):Refactor to use path params
demo1中示例的写法并不推荐，改成如下写法，提示就会消失：


```js
var express = require('express');
    var app = express();
    app.param('id', function (req, res, next, id) {
    if(req.params.id==1337){
      next();
    }
    else{
      res.sendStatus(404);
    }
    });
    app.param('id', 1337);
    app.get('/user/:id', function (req, res) {
      res.send('参数通过检验');
    });
    
    app.listen(3000, function () {
      console.log('Ready');
    });

```
