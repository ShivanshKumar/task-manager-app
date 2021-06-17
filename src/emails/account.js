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
        subject: `Thanks for joining`,
        text: `Welcome to our service ${name}!`,
        html: `<b>Welcome to our service, ${name}<b/>`
    })
}


const sendDeleteEmail = (email,name) => {
    const transporterObject = transporter();

    return transporterObject.sendMail({
        from: `Task manager API <${process.env.EMAIL}>`,
        to: email,
        subject: `We're sorry to see you leave`,
        text: `We hope to see you again, ${name}!`,
        html: `<b>We hope to see you again, ${name}!<b/>`
    })
}


module.exports = {
    sendWelcomeEmail,
    sendDeleteEmail
}