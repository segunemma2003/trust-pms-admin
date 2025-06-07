
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Home, CreditCard } from "lucide-react";

const Policies = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-airbnb-primary to-airbnb-secondary text-white py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">Our Policies</h1>
            <p className="text-xl leading-relaxed">
              Clear guidelines that ensure a safe, trusted, and enjoyable experience 
              for all members of the OnlyIfYouKnow community.
            </p>
          </div>
        </section>

        {/* Policy Overview */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <Shield className="h-12 w-12 text-airbnb-primary mx-auto mb-4" />
                  <CardTitle>Trust & Safety</CardTitle>
                  <CardDescription>
                    Guidelines for maintaining trust within our network
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Users className="h-12 w-12 text-airbnb-primary mx-auto mb-4" />
                  <CardTitle>Community Standards</CardTitle>
                  <CardDescription>
                    Behavioral expectations for all platform members
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Home className="h-12 w-12 text-airbnb-primary mx-auto mb-4" />
                  <CardTitle>Property Guidelines</CardTitle>
                  <CardDescription>
                    Standards for listing and managing properties
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CreditCard className="h-12 w-12 text-airbnb-primary mx-auto mb-4" />
                  <CardTitle>Payment Terms</CardTitle>
                  <CardDescription>
                    Policies regarding payments and cancellations
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Detailed Policies */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Trust & Safety Policy</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h3>Verification Requirements</h3>
                <ul>
                  <li>All users must verify their identity through government-issued ID</li>
                  <li>Phone number and email verification required</li>
                  <li>Property owners must provide additional documentation</li>
                </ul>
                
                <h3>Trust Level Management</h3>
                <ul>
                  <li>Property owners define their own trust levels and criteria</li>
                  <li>Trust levels must be based on legitimate relationship factors</li>
                  <li>Discriminatory criteria are strictly prohibited</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Community Standards</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h3>Respectful Communication</h3>
                <ul>
                  <li>Maintain professional and respectful communication</li>
                  <li>No harassment, discrimination, or offensive language</li>
                  <li>Respond to messages within 24 hours when possible</li>
                </ul>
                
                <h3>Accurate Information</h3>
                <ul>
                  <li>Provide truthful and accurate profile information</li>
                  <li>Property listings must accurately represent the space</li>
                  <li>Report any safety concerns immediately</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h3>Listing Standards</h3>
                <ul>
                  <li>Properties must meet local safety and legal requirements</li>
                  <li>Accurate photos and descriptions required</li>
                  <li>Regular property maintenance and cleanliness standards</li>
                </ul>
                
                <h3>Approval Process</h3>
                <ul>
                  <li>All properties subject to admin review and approval</li>
                  <li>Integration with Beds24 system required for activation</li>
                  <li>Regular quality checks and guest feedback monitoring</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment & Cancellation Terms</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h3>Payment Processing</h3>
                <ul>
                  <li>Secure payment processing through approved providers</li>
                  <li>Trust-level discounts applied automatically at booking</li>
                  <li>Payments released to property owners after guest check-in</li>
                </ul>
                
                <h3>Cancellation Policy</h3>
                <ul>
                  <li>Cancellation terms defined by individual property owners</li>
                  <li>Free cancellation typically available within 24-48 hours</li>
                  <li>Emergency cancellations handled case-by-case</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Questions About Our Policies?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Our support team is here to help clarify any policy questions you may have.
            </p>
            <div className="text-lg">
              <p><strong>Email:</strong> support@onlyifyouknow.com</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Policies;
