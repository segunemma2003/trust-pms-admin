
import Layout from "@/components/layout/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              Last updated: January 1, 2025
            </p>

            <h2>1. Introduction</h2>
            <p>
              OnlyIfYouKnow ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Information You Provide</h3>
            <ul>
              <li><strong>Account Information:</strong> Name, email address, phone number, profile photo</li>
              <li><strong>Identity Verification:</strong> Government-issued ID, address verification</li>
              <li><strong>Payment Information:</strong> Credit card details, billing address (processed by third-party providers)</li>
              <li><strong>Property Information:</strong> Property details, photos, availability, pricing</li>
              <li><strong>Communications:</strong> Messages between users, support communications</li>
            </ul>

            <h3>2.2 Information Automatically Collected</h3>
            <ul>
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
              <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
              <li><strong>Location Data:</strong> Approximate location based on IP address (with consent)</li>
              <li><strong>Cookies and Tracking:</strong> See our Cookie Policy for details</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and maintain our platform services</li>
              <li>Process bookings and payments</li>
              <li>Verify user identity and prevent fraud</li>
              <li>Manage trust levels and personalized pricing</li>
              <li>Communicate with you about your account and bookings</li>
              <li>Improve our services and user experience</li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2>4. Information Sharing and Disclosure</h2>
            <h3>4.1 With Other Users</h3>
            <p>
              We share limited information with other users as necessary for bookings, including:
            </p>
            <ul>
              <li>Profile information (name, photo, basic details)</li>
              <li>Contact information (after booking confirmation)</li>
              <li>Trust level status (as defined by property owners)</li>
            </ul>

            <h3>4.2 With Service Providers</h3>
            <p>We share data with trusted third parties who help us operate our platform:</p>
            <ul>
              <li>Payment processors (Stripe, PayPal)</li>
              <li>Identity verification services</li>
              <li>Cloud hosting providers (AWS, Google Cloud)</li>
              <li>Analytics providers</li>
              <li>Customer support tools</li>
            </ul>

            <h3>4.3 Legal Requirements</h3>
            <p>
              We may disclose your information when required by law or to protect our rights, safety, or the rights and safety of others.
            </p>

            <h2>5. Trust Level Privacy</h2>
            <p>
              Our trust level system is designed with privacy in mind:
            </p>
            <ul>
              <li>Property owners define trust levels without accessing personal details</li>
              <li>Trust level criteria must be based on legitimate, non-discriminatory factors</li>
              <li>You can view your trust level status with each property owner</li>
              <li>Trust level data is encrypted and access-controlled</li>
            </ul>

            <h2>6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your data:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and testing</li>
              <li>Access controls and authentication requirements</li>
              <li>Employee training on data protection</li>
            </ul>

            <h2>7. Data Retention</h2>
            <p>
              We retain your personal data only as long as necessary for the purposes outlined in this policy:
            </p>
            <ul>
              <li>Account data: Until account deletion</li>
              <li>Booking data: 7 years for tax and legal purposes</li>
              <li>Communication data: 3 years</li>
              <li>Analytics data: 2 years (anonymized)</li>
            </ul>

            <h2>8. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to certain processing activities</li>
              <li><strong>Restriction:</strong> Request limitation of processing</li>
            </ul>

            <h2>9. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers, including:
            </p>
            <ul>
              <li>Standard Contractual Clauses</li>
              <li>Adequacy decisions by relevant authorities</li>
              <li>Certification schemes</li>
            </ul>

            <h2>10. Children's Privacy</h2>
            <p>
              Our platform is not intended for children under 18. We do not knowingly collect personal information from children under 18. If we become aware of such collection, we will delete the information immediately.
            </p>

            <h2>11. Updates to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through our platform. The "Last updated" date at the top of this policy indicates when it was last revised.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <p>
              Email: privacy@onlyifyouknow.com<br/>
              Phone: +1 (555) 123-4567<br/>
              Address: 123 Property Street, San Francisco, CA 94102
            </p>

            <h2>13. Regional Specific Rights</h2>
            <h3>13.1 California Residents (CCPA)</h3>
            <p>
              California residents have additional rights under the California Consumer Privacy Act, including the right to know what personal information is collected and how it's used.
            </p>

            <h3>13.2 European Residents (GDPR)</h3>
            <p>
              European residents have rights under the General Data Protection Regulation, including the right to data portability and the right to lodge complaints with supervisory authorities.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
