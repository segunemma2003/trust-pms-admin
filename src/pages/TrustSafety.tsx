
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Lock, Users, Eye, AlertTriangle, Phone } from "lucide-react";

const TrustSafety = () => {
  const safetyFeatures = [
    {
      icon: Shield,
      title: "Verified Users",
      description: "All users are invited and vetted by existing community members, ensuring a trusted network."
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description: "All transactions are processed through encrypted, secure payment systems with fraud protection."
    },
    {
      icon: Users,
      title: "Community Standards",
      description: "Our community maintains high standards of respect, cleanliness, and responsible usage."
    },
    {
      icon: Eye,
      title: "Property Verification",
      description: "All properties are verified by our team and reviewed by community members."
    }
  ];

  const guidelines = [
    {
      title: "Respect Property",
      description: "Treat every property as if it were your own. Follow house rules and maintain cleanliness."
    },
    {
      title: "Communicate Clearly",
      description: "Maintain open and honest communication with property owners before, during, and after your stay."
    },
    {
      title: "Be Responsible",
      description: "Report any issues immediately and take responsibility for any damages or incidents."
    },
    {
      title: "Maintain Privacy",
      description: "Respect the privacy of property owners and other community members."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Trust & Safety
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              OnlyIfYouKnow is built on trust. Learn about our safety measures and community standards that keep our platform secure.
            </p>
          </div>

          {/* Safety Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Our Safety Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {safetyFeatures.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-airbnb-primary/10 rounded-full flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-airbnb-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Users className="h-6 w-6 mr-2 text-airbnb-primary" />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {guidelines.map((guideline, index) => (
                    <div key={index} className="border-l-4 border-airbnb-primary pl-4">
                      <h3 className="font-semibold text-lg mb-2">{guideline.title}</h3>
                      <p className="text-gray-600">{guideline.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Measures */}
          <div className="mb-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Lock className="h-6 w-6 mr-2 text-airbnb-primary" />
                  Security Measures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Data Protection</h3>
                  <p className="text-gray-600 mb-4">
                    We use industry-standard encryption to protect your personal information and payment details. 
                    Your data is stored securely and never shared with unauthorized parties.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">SSL Encryption</Badge>
                    <Badge variant="secondary">Secure Payments</Badge>
                    <Badge variant="secondary">Privacy Protected</Badge>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Invitation-Only Access</h3>
                  <p className="text-gray-600">
                    Our platform is invitation-only, which means every user has been vouched for by existing 
                    community members. This creates a trusted network of verified individuals.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Property Verification</h3>
                  <p className="text-gray-600">
                    All properties go through a verification process and are regularly reviewed by our 
                    community to ensure quality and safety standards are maintained.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Contact */}
          <div className="text-center">
            <Card>
              <CardContent className="pt-6">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
                <p className="text-gray-600 mb-6">
                  If you encounter any safety concerns or need immediate assistance, please contact us right away.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact-admin"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-airbnb-primary hover:bg-airbnb-primary/90 transition-colors"
                  >
                    Contact Admin
                  </a>
                  <a
                    href="tel:+1-555-0123"
                    className="inline-flex items-center px-6 py-3 border-2 border-airbnb-primary text-base font-medium rounded-md text-airbnb-primary bg-white hover:bg-airbnb-primary hover:text-white transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Emergency Line
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrustSafety;
