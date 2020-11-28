const nodemailer = require ('nodemailer');

async function sendMail ({ from, to, subject, text, html })  {

   

     let transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: false, // true for 465, false for other ports
          auth: {
              user: process.env.MAIL_USER, // generated ethereal user
              pass: process.env.MAIL_PASS 
          },
         });
    console.log('ok');

    let info = await transporter.sendMail({
        from,
        to,
        subject ,
        text,
        html

    });

    console.log(info);

}

module.exports = sendMail ;
//xsmtpsib-cd78b3809f1e8c82bc030da09e0407dcb2e5ef0acf3b7aef83025b82b7461cb1-sy2HkgNAGKP4vL1S