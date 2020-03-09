const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.EMAILKEY)

const sendWelcomeEmail = (email,name) => {
    sgMail.send({
        to:email,
        from:'joshuva76@hotmail.co.uk',
        subject:'first sign up',
        text:`Welcome to the app, ${name}.`
    })
}
 
const sendCancelEmail = (email,name) => {
    sgMail.send({
        to:email,
        from:'joshuva76@hotmail.co.uk',
        subject:'Cancelling account',
        text:`thank your for being a part of my program, goodbye ${name}.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}