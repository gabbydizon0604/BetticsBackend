const sgMail = require('@sendgrid/mail');
require('dotenv').config()

// Validate and set SendGrid API key
if (process.env.SENDGRID_API_KEY) {
    if (process.env.SENDGRID_API_KEY.startsWith('SG.')) {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        console.log('SendGrid API key configured successfully');
    } else {
        console.warn('Warning: SendGrid API key does not start with "SG." - emails may not work correctly');
        console.warn('Please check your SENDGRID_API_KEY environment variable');
        // Still set it in case it's a valid key with different format
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
} else {
    console.warn('Warning: SENDGRID_API_KEY environment variable is not set - email functionality will not work');
    console.warn('Set SENDGRID_API_KEY in your environment variables if you need email functionality');
}

module.exports = sgMail;