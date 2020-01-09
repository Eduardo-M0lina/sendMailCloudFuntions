const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const cors = require('cors')({origin: true});
const config = require('./config');
const handlebars = require('handlebars');
const fs = require('fs');
const path  = require('path');

/**
 * Function export to cloud funtions
 */
exports.sendMail = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        console.log("<---sendMail--->");
        let transporter = generateTransport();
        let htmlToSend = generateTemplate(req.body);
        let mailOptions = generateEmail(req, htmlToSend);
        return transporter.sendMail(mailOptions, (error, info) => {
            if(error){
                let resp = {"code": 500,"res" : "error: " + error};
                return  res.status(500).jsonp(resp);
            }
            let resp = {"code":200,"res" : "Email sent","data" : req.body};
            return res.status(200).jsonp(resp);
        });
    });    
});

/**
* Here we're using mstp2go to send 
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

/**
 * Generate email body
 * @param {*} req 
 * @param {*} htmlToSend 
 */
function generateEmail(req, htmlToSend) {
    console.log("<---generateEmail--->");
    return {
      from: req.body.from,
      to: req.body.to,
      subject: req.body.subject,
      html: htmlToSend
    }
}

/**
 * Generate html with template
 * @param {*} request 
 */
function generateTemplate(request){
    console.log("<---generateTemplate--->");
    const filePath = path.join(__dirname, '/templates/'+request.templateName+'.html');
    const source = fs.readFileSync(filePath, 'utf-8').toString();
    const template = handlebars.compile(source);
    const replacements = generateDataTemplate(request);
    return htmlToSend = template(replacements);
}

/**
 * Select template
 * @param {*} request 
 */
function generateDataTemplate(request){
    console.log("<---replacements--->");
    let replacements;
    switch (request.templateName) {
        case 'email-confirmation':
            replacements = {
                name: request.data.name
            };
        break;
        case 'invitation-collaborators':
            replacements = {
                collaboratorName: request.data.collaboratorName,
                userName: request.data.userName,
                businessName: request.data.businessName
            };
        break;
        case 'provider-survey':
            replacements = {
                providerName: request.data.providerName,
                socialReason: request.data.socialReason
            };
        break;
        case 'customer-survey':
            replacements = {
                userName: request.data.userName,
                socialReason: request.data.socialReason
            };
        break;
        case 'authorization-central-partners':
            replacements = {
                userName: request.data.userName
            };
        break;
        case 'authorization-RL-exchanges':
            replacements = {
                userName: request.data.userName
            };
        break;
        default:
          console.log('No existe template');
      }
      return replacements;
}

