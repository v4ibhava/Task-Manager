const nodemailer = require('nodemailer');

const sendTaskAssignmentEmail = async (assigneeEmail, assigneeName, taskTitle, taskDescription, assignedBy) => {
    // Skip if email credentials are not provided
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email service skipped: EMAIL_USER or EMAIL_PASS not configured in .env');
        return false;
    }

    try {
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"TMS Notifications" <${process.env.EMAIL_USER}>`,
            to: assigneeEmail,
            subject: `New Task Assigned: ${taskTitle}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #14b8a6;">Hello, ${assigneeName}!</h2>
                    <p>A new task has been assigned to you by <strong>${assignedBy}</strong>.</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #14b8a6; margin: 20px 0;">
                        <h3 style="margin-top: 0;">${taskTitle}</h3>
                        <p>${taskDescription || 'No description provided.'}</p>
                    </div>
                    <p>Please log in to the Task Management System to view more details and update the status.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #777;">This is an automated notification from your Task Management System. Please do not reply to this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendTaskAssignmentEmail };
