
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, MapPin, Heart } from "lucide-react";

const About = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-airbnb-primary to-airbnb-secondary text-white py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">About OnlyIfYouKnow</h1>
            <p className="text-xl leading-relaxed">
              A personalized property rental platform that connects trusted networks 
              and rewards relationships with exclusive access and special rates.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                To revolutionize property rentals by building trust-based networks where 
                relationships matter and everyone benefits from personalized experiences.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Shield className="h-12 w-12 text-airbnb-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Trust</h3>
                  <p className="text-gray-600">
                    Building authentic relationships through verified networks and transparent interactions.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Users className="h-12 w-12 text-airbnb-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Community</h3>
                  <p className="text-gray-600">
                    Fostering connections between property owners and guests within trusted circles.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <MapPin className="h-12 w-12 text-airbnb-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Quality</h3>
                  <p className="text-gray-600">
                    Curating exceptional properties and experiences for our exclusive network.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Heart className="h-12 w-12 text-airbnb-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Personal</h3>
                  <p className="text-gray-600">
                    Delivering personalized experiences that reflect individual relationships and trust levels.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Story</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p>
                OnlyIfYouKnow was born from a simple observation: the best travel experiences 
                often come through personal recommendations from people we trust. Whether it's 
                a friend's vacation home, a colleague's investment property, or a family member's 
                guest house, these personal connections create opportunities for authentic, 
                meaningful stays.
              </p>
              <p>
                We recognized that traditional rental platforms treat all guests the same, 
                regardless of their relationship to the property owner. OnlyIfYouKnow changes 
                this by allowing property owners to create personalized trust levels and offer 
                exclusive rates to people within their network.
              </p>
              <p>
                Today, OnlyIfYouKnow serves as a bridge between property owners and their 
                trusted circles, creating a rental ecosystem built on relationships, trust, 
                and mutual benefit.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;
