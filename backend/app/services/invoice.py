import os
from fpdf import FPDF
from datetime import datetime

def generate_invoice_pdf(name: str, studio_name: str, email: str, plan_name: str, amount_inr: int, payment_id: str) -> str:
    pdf = FPDF()
    pdf.add_page()
    
    # Header
    pdf.set_font("helvetica", style="B", size=24)
    pdf.cell(0, 15, "INVOICE", ln=True, align="R")
    
    pdf.set_font("helvetica", style="B", size=16)
    pdf.cell(0, 10, "SnapMoment Inc.", ln=True)
    pdf.set_font("helvetica", size=10)
    pdf.cell(0, 6, "billing@snapmoment.app", ln=True)
    
    pdf.ln(10)
    
    # Bill To
    pdf.set_font("helvetica", style="B", size=12)
    pdf.cell(0, 8, "Bill To:", ln=True)
    pdf.set_font("helvetica", size=10)
    pdf.cell(0, 6, f"{name}", ln=True)
    if studio_name:
        pdf.cell(0, 6, f"{studio_name}", ln=True)
    pdf.cell(0, 6, f"{email}", ln=True)
    
    pdf.ln(10)
    
    # Invoice details
    pdf.cell(0, 6, f"Date: {datetime.now().strftime('%Y-%m-%d')}", ln=True)
    pdf.cell(0, 6, f"Payment ID: {payment_id}", ln=True)
    
    pdf.ln(10)
    
    # Table header
    pdf.set_font("helvetica", style="B", size=12)
    pdf.cell(140, 10, "Description", border=1)
    pdf.cell(50, 10, "Amount (INR)", border=1, align="R", ln=True)
    
    # Table content
    pdf.set_font("helvetica", size=12)
    pdf.cell(140, 10, f"SnapMoment {plan_name.capitalize()} Subscription", border=1)
    pdf.cell(50, 10, f"{amount_inr}.00", border=1, align="R", ln=True)
    
    pdf.ln(10)
    pdf.set_font("helvetica", style="B", size=14)
    pdf.cell(140, 10, "Total:")
    pdf.cell(50, 10, f"INR {amount_inr}.00", align="R", ln=True)
    
    # Save
    invoice_dir = os.path.join(os.getcwd(), "invoices")
    os.makedirs(invoice_dir, exist_ok=True)
    file_path = os.path.join(invoice_dir, f"sm_invoice_{payment_id}.pdf")
    pdf.output(file_path)
    return file_path
