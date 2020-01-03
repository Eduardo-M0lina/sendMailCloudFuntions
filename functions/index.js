const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});
const config = require('./config');
const handlebars = require('handlebars');
const fs = require('fs');
const path  = require('path');

/**
* Here we're using Gmail to send 
*/
function generateTransport(){
    console.log("<---generateTransport--->");
    return nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: true,
      auth: {
          user: config.smtp.user,
          pass: config.smtp.password
      }
    })
}

function generateEmail(req, htmlToSend) {
    console.log("<---generateEmail--->");
    let from = req.body.from;
    let to = req.body.to;
    let subject = req.body.subject;
    let text = req.body.text;
    /*console.log("from -> "  + from);
    console.log("to -> "  + to);
    console.log("subject -> "  + subject);
    console.log("text -> "  + text);*/
    return {
      from: from,
      to: to,
      subject: subject,
      html: htmlToSend
    }
    /*return {
        from: 'Finaktiva <pruebas@Finaktiva.com>',
        to: 'ing.eduardomolina04@gmail.com',
        subject: '✔✔ Send Mail test ✔✔',
        html: `<h2>hola</h2>`
      }*/
}

function generateTemplate(templateName){
    console.log("<---generateTemplate--->");
    const filePath = path.join(__dirname, '/templates/'+templateName+'.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = {
        name: "Eduardo Molina"
    };
    return htmlToSend = template(replacements);
}

exports.sendMail = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        console.log("<---sendMail--->");
        let transporter = generateTransport();
        let htmlToSend = generateTemplate('Email-Confirmation');
        let mailOptions = generateEmail(req, htmlToSend);
        return transporter.sendMail(mailOptions, (erro, info) => {
            if(erro){
                let resp = {"code": 500,"res" : "error: " + error};
                return  res.status(500).jsonp(resp);
            }
            let resp = {"code":200,"res" : "Email sent","data" : req.body};
            return res.status(200).jsonp(resp);
        });
    });    
});