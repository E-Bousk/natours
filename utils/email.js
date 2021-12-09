const nodemailer = require('nodemailer');

// On créer l'email et on l'envoie
const sendEmail = async options => {
  // 1) On crée un transporteur (service qui envoie l'email)
  // ['Gmail' fait partie des services connus de Nodemailer (donc pas besoin de le configurer manuellement)
  // (NOTE: dans Gmail, il faut activer l'option « less secure app » )]
  // Ici on utilise Mailtrap.io
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // 2) On définit les options de l'email
  const mailOptions = {
    from: 'Natours Bot <natours@noreply.io>',
    // « options » est l'argument que l'on passe depuis la fonction (« const sendEmail = options => { »)
    to: options.email,
    subject: options.subject,
    text: options.message
    // html: (on ne s'en sert pas ici)
  };

  // 3) envoyer l'email
  // cela retourne une promesse (donc c'est une fonction asynchrone) donc : AWAIT
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
