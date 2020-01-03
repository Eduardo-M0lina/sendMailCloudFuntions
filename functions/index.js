const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});
const config = require('./config');

/**
* Here we're using Gmail to send 
*/
function generateTransport(){
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

function generateEmail(req) {
    console.log("<---generateEmail--->" );
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
      html: text
    }
    /*return {
        from: 'Finaktiva <pruebas@Finaktiva.com>',
        to: 'ing.eduardomolina04@gmail.com',
        subject: '✔✔ Send Mail test ✔✔',
        html: `<h2>hola</h2>`
      }*/
  }


exports.sendMail = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        console.log("<---sendMail--->" );
        let transporter = generateTransport();
        let mailOptions = generateEmail(req);
        // returning result
        return transporter.sendMail(mailOptions, (erro, info) => {
            if(erro){
                let resp = {"code": 500,"res" : "error: " + error};
                return  res.status(500).jsonp(resp);
                //return res.status(500).send({ msg: erro.toString() });
            }
            let resp = {"code":200,"res" : "Email sent","data" : req.body};
            return res.status(200).jsonp(resp);
            //return res.send('Sended');
        });
    });    
});