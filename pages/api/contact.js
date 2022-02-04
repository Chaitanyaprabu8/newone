import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(req, res) {
  try {
     //console.log("REQ.BODY", req.body);
    await sendgrid.send({
      to: `${req.body.toemail}`, // Your email where you'll receive emails
      from: `${req.body.email}`, // your website email address here
      subject: `${req.body.subject}`,
      html: `${req.body.html}`,
    });
  } catch (error) {
    // console.log(error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }

  return res.status(200).json({ error: "" });
}

export default sendEmail;