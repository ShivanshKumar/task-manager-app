const nodemailer = require('nodemailer');

const transporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });
}


const sendWelcomeEmail = (email, name) => {
    const transporterObject = transporter();

    return transporterObject.sendMail({
        from: `Task manager API <${process.env.EMAIL}>`,
        to: email,
        text: `Welcome to our service ${name}!`,
        html: `<b>Welcome to our service, ${name}<b/>`
    })
}





module.exports = {
    sendWelcomeEmail
}