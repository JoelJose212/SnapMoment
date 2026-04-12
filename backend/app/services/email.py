import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
import os
from app.config import settings

def send_invoice_email(to_email: str, photographer_name: str, pdf_path: str):
    if not settings.SMTP_USER or not settings.SMTP_PASS:
        print("SMTP credentials not set, skipping email...")
        return False

    try:
        msg = MIMEMultipart()
        msg['From'] = f"SnapMoment Billing <{settings.SMTP_USER}>"
        msg['To'] = to_email
        msg['Subject'] = f"Invoice for your SnapMoment Subscription - {photographer_name}"

        body = f"Hello {photographer_name},\n\nThank you for choosing SnapMoment! Attached is the invoice for your recent subscription. We are excited to help you capture and share memories.\n\nBest regards,\nThe SnapMoment Team"
        msg.attach(MIMEText(body, 'plain'))

        # Attachment
        filename = os.path.basename(pdf_path)
        with open(pdf_path, "rb") as attachment:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(attachment.read())
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f"attachment; filename= {filename}")
            msg.attach(part)

        # SMTP session
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASS)
        text = msg.as_string()
        server.sendmail(settings.SMTP_USER, to_email, text)
        
        # Also send a copy to Admin
        msg['To'] = settings.ADMIN_EMAIL
        msg['Subject'] = f"[ADMIN COPY] Invoice Generated for {photographer_name}"
        server.sendmail(settings.SMTP_USER, settings.ADMIN_EMAIL, msg.as_string())
        
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
