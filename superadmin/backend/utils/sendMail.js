const nodemailer = require('nodemailer');

async function sendMail(name, email, filePath) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,            // 👈 replace this
      pass: process.env.EMAIL_PASS                // 👈 use app password
    }
  });

  await transporter.sendMail({
    from: '"Certificate Team" <priyasweety@gmail.com>',
    to: email,
    subject: 'Your Certificate',
    text: `Hi ${name}, please find your certificate attached.`,
    attachments: [{ filename: `${name}.pdf`, path: filePath }]
  });

  console.log(`Email sent to ${email}`);
}

module.exports = { sendMail };