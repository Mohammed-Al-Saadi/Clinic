require("dotenv").config({ path: "./.env" });
const nodemailer = require("nodemailer");


const mailer = (email, text, subject) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAILPSW,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        text: text,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });

};

module.exports = mailer;



