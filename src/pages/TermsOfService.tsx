
import Layout from "@/components/layout/Layout";

const TermsOfService = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Last updated: January 1, 2025
            </p>

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using OnlyIfYouKnow ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. These Terms of Service govern your use of the OnlyIfYouKnow website and mobile applications.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              OnlyIfYouKnow is a trust-based property rental platform that connects property owners with guests through personalized networks. Our service allows property owners to:
            </p>
            <ul>
              <li>List their properties for short-term rental</li>
              <li>Define custom trust levels for different user groups</li>
              <li>Offer personalized rates based on relationship trust levels</li>
              <li>Manage bookings and guest communications</li>
            </ul>

            <h2>3. User Accounts and Registration</h2>
            <h3>3.1 Account Creation</h3>
            <p>
              To use certain features of the Platform, you must register for an account. You may only create an account if:
            </p>
            <ul>
              <li>You are 18 years of age or older</li>
              <li>You have been invited by an existing member or admin</li>
              <li>You provide accurate, current, and complete information</li>
            </ul>

            <h3>3.2 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>

            <h2>4. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Impersonate any person or entity</li>
              <li>Transmit any harmful, offensive, or illegal content</li>
              <li>Interfere with the proper functioning of the Platform</li>
              <li>Create false trust level criteria based on protected characteristics</li>
            </ul>

            <h2>5. Property Listings</h2>
            <h3>5.1 Listing Requirements</h3>
            <p>Property owners must ensure their listings:</p>
            <ul>
              <li>Comply with all local laws and regulations</li>
              <li>Contain accurate and complete information</li>
              <li>Meet safety and habitability standards</li>
              <li>Are properly insured for short-term rental use</li>
            </ul>

            <h3>5.2 Trust Level Management</h3>
            <p>
              Property owners may define trust levels based on legitimate relationship factors. Discriminatory criteria based on protected characteristics are prohibited.
            </p>

            <h2>6. Booking and Payment</h2>
            <h3>6.1 Booking Process</h3>
            <p>
              When you make a booking, you enter into a contract directly with the property owner. OnlyIfYouKnow facilitates this transaction but is not a party to the rental agreement.
            </p>

            <h3>6.2 Payment Terms</h3>
            <ul>
              <li>Payment is due at the time of booking</li>
              <li>Trust-level discounts are applied automatically</li>
              <li>Cancellation terms are set by individual property owners</li>
            </ul>

            <h2>7. Trust and Safety</h2>
            <p>
              We maintain various trust and safety measures, including identity verification, review systems, and community standards enforcement. However, you acknowledge that we cannot guarantee the conduct of users or the accuracy of information provided.
            </p>

            <h2>8. Intellectual Property</h2>
            <p>
              The Platform and its content, features, and functionality are owned by OnlyIfYouKnow and are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2>9. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and protect your information.
            </p>

            <h2>10. Disclaimers</h2>
            <p>
              THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h2>11. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, ONLYIFYOUKNOW SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF THE PLATFORM.
            </p>

            <h2>12. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless OnlyIfYouKnow from and against any claims, damages, costs, and expenses arising from your use of the Platform or violation of these Terms.
            </p>

            <h2>13. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Platform at our sole discretion, without prior notice, for conduct that we believe violates these Terms or is harmful to other users.
            </p>

            <h2>14. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
            </p>

            <h2>15. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or through the Platform. Continued use of the Platform after changes constitutes acceptance of the new Terms.
            </p>

            <h2>16. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p>
              Email: legal@onlyifyouknow.com<br/>
              Phone: +1 (555) 123-4567<br/>
              Address: 123 Property Street, San Francisco, CA 94102
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
