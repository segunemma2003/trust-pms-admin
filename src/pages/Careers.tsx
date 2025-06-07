
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users } from "lucide-react";

const Careers = () => {
  const openPositions = [
    {
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA / Remote",
      type: "Full-time",
      description: "Join our team to build the next generation of trust-based rental platform interfaces."
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "San Francisco, CA",
      type: "Full-time", 
      description: "Lead product strategy for our innovative trust-level management system."
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      description: "Help property owners and guests maximize their OnlyIfYouKnow experience."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-airbnb-primary to-airbnb-secondary text-white py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">Join Our Team</h1>
            <p className="text-xl leading-relaxed mb-8">
              Help us revolutionize property rentals by building meaningful connections 
              and trust-based experiences.
            </p>
            <Button variant="secondary" size="lg">
              View Open Positions
            </Button>
          </div>
        </section>

        {/* Why Work With Us */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why OnlyIfYouKnow?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Users className="h-12 w-12 text-airbnb-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Impact</h3>
                  <p className="text-gray-600">
                    Work on products that genuinely improve how people connect and travel.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <MapPin className="h-12 w-12 text-airbnb-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Flexibility</h3>
                  <p className="text-gray-600">
                    Remote-first culture with flexible working arrangements.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="h-12 w-12 text-airbnb-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Growth</h3>
                  <p className="text-gray-600">
                    Continuous learning opportunities and career development support.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Open Positions</h2>
            <div className="space-y-6">
              {openPositions.map((position, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{position.title}</CardTitle>
                        <CardDescription className="text-lg mt-1">
                          {position.department}
                        </CardDescription>
                      </div>
                      <Button>Apply Now</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">
                        <MapPin className="h-3 w-3 mr-1" />
                        {position.location}
                      </Badge>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {position.type}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{position.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Don't See a Perfect Fit?</h2>
            <p className="text-xl text-gray-600 mb-8">
              We're always looking for talented individuals who share our vision. 
              Send us your resume and let's start a conversation.
            </p>
            <Button size="lg">
              Send Us Your Resume
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Careers;
