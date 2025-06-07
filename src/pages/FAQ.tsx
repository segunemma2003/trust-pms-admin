
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqData = [
    {
      question: "What is OnlyIfYouKnow?",
      answer: "OnlyIfYouKnow is a personalized property management platform that connects property owners with trusted users through a unique invitation-based system."
    },
    {
      question: "How do I get access to the platform?",
      answer: "Access to OnlyIfYouKnow is by invitation only. You need to be invited by an existing property owner or administrator to join the platform."
    },
    {
      question: "What types of properties are available?",
      answer: "Our platform features a curated selection of premium properties including vacation homes, luxury apartments, and unique accommodations from verified owners."
    },
    {
      question: "How does the booking process work?",
      answer: "Once you're invited and have access, you can browse available properties, check availability, and make bookings directly through the platform. Property owners will confirm your reservations."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we take privacy and security seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your consent."
    },
    {
      question: "How can property owners join the platform?",
      answer: "Property owners can apply to join by contacting our admin team. All owners go through a verification process before being approved to list their properties."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept major credit cards, debit cards, and secure payment methods. All transactions are processed through encrypted, secure payment gateways."
    },
    {
      question: "Can I cancel or modify my booking?",
      answer: "Cancellation and modification policies vary by property and are set by individual owners. Please check the specific property's cancellation policy before booking."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can contact our support team through the 'Contact Admin' page or reach out to your property owner directly for property-specific questions."
    },
    {
      question: "What happens if there's an issue with my stay?",
      answer: "If you experience any issues during your stay, please contact the property owner first. If the issue cannot be resolved, you can escalate it to our admin team for assistance."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about OnlyIfYouKnow platform
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Common Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="mt-12 text-center">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
                <p className="text-gray-600 mb-6">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <a
                  href="/contact-admin"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-airbnb-primary hover:bg-airbnb-primary/90 transition-colors"
                >
                  Contact Support
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
