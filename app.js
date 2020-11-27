var express = require("express");
var app = express();
app.set("view engine","ejs");
app.set("views","views");
app.use(express.static("public"));

var port = process.env.PORT || 3000; //3000 là port để dev dưới local
app.listen(port, function(){ console.log("started!"); });

const nodemailer =  require('nodemailer');
var handlebars = require('handlebars');
var fs = require('fs');

var readHTMLFile = function(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html);
        }
    });
};

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true })



//multera
var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname+"/uploads")
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()  + "-" + file.originalname)
    }
});
var upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        console.log(file);
        if(file.mimetype=="image/png" || file.mimetype=="image/jpg" || file.mimetype=="image/jpeg"){
            cb(null, true)
        }else{
            return cb(new Error('Only image are allowed!'))
        }
    }
}).single("image");

//so1 so2
app.post("/ra-send-mail",urlencodedParser,function(req,res)
{
    var project = req.body.project;
    var dir = __dirname+'/Contents/'+ project +"/";
    var attachmentsList = req.body.attachments.split("|");
    readHTMLFile(dir+'contents.html', function(err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                username: "John Doe"
           };
           var htmlToSend = template(replacements);
          
            var emailto = req.body.mailto;
            var user = req.body.user;
            var pass = req.body.pass;
            var server = req.body.server;
            var subject = req.body.subject;
            var port = req.body.port;
            var attachments = [
                {  
                    filename: 'logo.jpg',
                    path: dir +'logo.jpg',
                    cid: 'logoimage'
                }
            ];
            // for(var item in attachmentsList)
            // {
            //   //  console.log(attachmentsList[item]);
            //     var attachment = {
            //         filename: attachmentsList[item],
            //         path: __dirname + "/uploads/" +attachmentsList[item],
            //         cid: 'image'+item
            //     };
            //     attachments.push(attachment);
            // }
            var message = {
                from: user,
                to: emailto,
                subject: subject,
                html: htmlToSend,
                attachments: attachments
            };
            
            var transport = nodemailer.createTransport({
                debug: true,
                host: server,
                post:port,
                auth: {
                    user: user, //Tài khoản gmail vừa tạo
                    pass: pass //Mật khẩu tài khoản gmail vừa tạo
                }
            });
            
            transport.sendMail(message, function(error, info) {
                var a = {"result":"success"};
                if(error){
                    a = {"result":error.message};
                }else{
                    a = {"result":info.response};
                }
                res.json(a);
            });
            transport.close();
    });
    
});
app.post('/upimage',urlencodedParser,function (req, res) {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          res.json({"result":0,"err":err});
        } else if (err) {
            res.json({"result":0,"err":err});
        }else{
            console.log("Upload is okay");
           // console.log(req.file.filename); // Thông tin file đã upload
            res.json({"result":1,"filename":req.file.path,"__dirname":__dirname});
        }

    });
});
app.get('/upimage',function (req, res) {
    res.render('upload')
});
app.post("/login",urlencodedParser,function(req,res)
{
    var project = req.body.project;
            var emailto = req.body.user;
            var user = req.body.user;
            var pass = req.body.pass;
            var server = req.body.server;
            var subject = "Thông Báo Đăng Nhập.";
            var port = req.body.port;
            var message = {
                from: user,
                to: emailto,
                subject: subject,
                html: "<p>Email đã đăng nhập vào app tương tác 3D!!</p>"
            };
            
            var transport = nodemailer.createTransport({
                debug: true,
                host: server,
                post:port,
                auth: {
                    user: user, //Tài khoản gmail vừa tạo
                    pass: pass //Mật khẩu tài khoản gmail vừa tạo
                }
            });
            
            transport.sendMail(message, function(error, info) {
                var a = {"result":"fail"};
                if(error){
                    a = {"result":"fail"};
                    //console.log(error.message);
                }else{
                    a = {"result":"success"};
                    console.log(info.response);
                    
                }
                
                res.json(a);
            });
            transport.close();
    
});
