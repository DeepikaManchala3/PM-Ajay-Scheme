const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' or configure host/port for others
    auth: {
        user: process.env.EMAIL_USER, // Generated ethereal user
        pass: process.env.EMAIL_PASS, // Generated ethereal password
    },
});

exports.sendActivationEmail = async (req, res) => {
    const { name, email, work_assigned, agency_officer } = req.body;

    if (!email || !name) {
        return res.status(400).json({ success: false, error: 'Email and Name are required' });
    }

    const mailOptions = {
        from: process.env.EMAIL_USER, // sender address
        to: email, // list of receivers
        subject: 'Agency Activation Notification - PM-AJAY', // Subject line
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Agency Activation Successful</h2>
                <p>Dear <strong>${name}</strong>,</p>
                <p>We are pleased to inform you that your agency has been successfully <strong>ACTIVATED</strong> in the PM-AJAY Dashboard.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #34495e;">Details:</h3>
                    <p><strong>Agency Name:</strong> ${name}</p>
                    <p><strong>Officer In-Charge:</strong> ${agency_officer}</p>
                    <p><strong>Work Assigned:</strong> ${work_assigned}</p>
                    <p><strong>Status:</strong> <span style="color: green; font-weight: bold;">Active</span></p>
                </div>

                <p>You can now proceed with your assigned tasks.</p>
                
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #7f8c8d;">This is an automated message from the PM-AJAY Portal. Please do not reply to this email.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        res.status(200).json({ success: true, message: 'Email sent successfully', messageId: info.messageId });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: 'Failed to send email', details: error.message });
    }
};
