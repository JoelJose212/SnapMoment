# Implementation Plan: 5-Step Photographer Onboarding & Billing

This plan implements a professional, 5-step onboarding wizard for photographers, culminating in a Razorpay payment and automated, branded PDF invoice generation.

## 1. The 5-Step Journey
Photographers will be redirected to this wizard immediately after signup. They will not be able to access the dashboard until all 5 steps are completed.

1.  **Welcome**: Account Creation (Basic Info: Name, Email, Phone, Studio, Password).
2.  **Studio Setup**: Detailed profile (Founded year, services, team size, **primary camera gear, and portfolio link**).
3.  **Choose Your Power**: Plan Selection (Comparing benefits of Free, Pro, and Studio).
4.  **The Agreement**: Terms & Conditions (Legal consent).
5.  **Activation**: **Razorpay** checkout + **Automated PDF Invoice** generation.

## 2. Proposed Technical Changes

### Backend Infrastructure
- **Models**: Add `onboarding_step`, `founded_year`, `services`, `team_size`, `primary_gear`, `portfolio_url`, `experience_level` to the Photographer model.
- **Invoicing**: A new service using `fpdf2` to generate professional PDF invoices upon payment.
- **Razorpay**: Integrations for Subscriptions, Orders, and Webhooks for real-time status updates.

### Frontend Onboarding Wizard
- **OnboardingWizard.tsx**: A multi-step UI with smooth transitions using Framer Motion.
- **ProtectedRoute**: Enforces that photographers complete all 5 steps before entering the event management area.

## 3. Implementation Steps
1.  **DB Update**: Add tracking fields for onboarding progress and studio profile.
2.  **Auth Update**: Include onboarding status in the login/signup response.
3.  **UI Build**: Create the 5-step wizard with plan cards and Razorpay integration.
4.  **Invoicing**: Implement the automated PDF generation logic.
5.  **Final Lockdown**: Secure the routes until payment is verified.

---
**Please verify this flow and I will start the implementation!**
