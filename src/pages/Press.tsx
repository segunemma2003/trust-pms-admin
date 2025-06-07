
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, ExternalLink } from "lucide-react";

const Press = () => {
  const pressReleases = [
    {
      title: "OnlyIfYouKnow Launches Revolutionary Trust-Based Rental Platform",
      date: "March 15, 2024",
      excerpt: "New platform allows property owners to offer personalized rates based on relationship trust levels.",
      category: "Product Launch"
    },
    {
      title: "OnlyIfYouKnow Secures $10M Series A Funding",
      date: "January 20, 2024", 
      excerpt: "Funding will accelerate platform development and expand trusted network capabilities.",
      category: "Funding"
    },
    {
      title: "The Future of Personalized Property Rentals",
      date: "December 5, 2023",
      excerpt: "CEO discusses how trust-based networks are transforming the vacation rental industry.",
      category: "Interview"
    }
  ];

  const mediaKit = [
    {
      name: "Company Logo (PNG)",
      description: "High-resolution OnlyIfYouKnow logos in various formats",
      size: "2.3 MB"
    },
    {
      name: "Brand Guidelines",
      description: "Complete brand identity and usage guidelines",
      size: "1.8 MB"
    },
    {
      name: "Executive Photos",
      description: "Professional headshots of key team members",
      size: "5.2 MB"
    },
    {
      name: "Product Screenshots",
      description: "Platform interface and feature screenshots",
      size: "8.7 MB"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-airbnb-primary to-airbnb-secondary text-white py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">Press & Media</h1>
            <p className="text-xl leading-relaxed mb-8">
              Get the latest news, updates, and resources about OnlyIfYouKnow's 
              mission to revolutionize property rentals through trust-based networks.
            </p>
            <Button variant="secondary" size="lg">
              Download Media Kit
            </Button>
          </div>
        </section>

        {/* Press Contact */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Media Contact</h2>
              <div className="text-lg text-gray-600">
                <p>For press inquiries, interviews, or additional information:</p>
                <p className="mt-2">
                  <strong>Email:</strong> press@onlyifyouknow.com<br />
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recent News */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Recent News</h2>
            <div className="space-y-6">
              {pressReleases.map((release, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{release.category}</Badge>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {release.date}
                          </span>
                        </div>
                        <CardTitle className="text-xl">{release.title}</CardTitle>
                        <CardDescription className="text-base mt-2">
                          {release.excerpt}
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Read More
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Media Kit */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Media Kit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mediaKit.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        <span className="text-sm text-gray-500">{item.size}</span>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Company Facts */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Company Facts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-airbnb-primary mb-2">2024</div>
                <div className="text-gray-600">Founded</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-airbnb-primary mb-2">50+</div>
                <div className="text-gray-600">Team Members</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-airbnb-primary mb-2">1000+</div>
                <div className="text-gray-600">Properties</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-airbnb-primary mb-2">25+</div>
                <div className="text-gray-600">Cities</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Press;
