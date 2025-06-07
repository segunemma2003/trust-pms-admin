import { useParams } from "react-router-dom";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TrustLevelBadge from "@/components/ui/trust-level-badge";
import { Calendar as CalendarIcon, MapPin, Shield, Star, User, Users, Wifi, Coffee, Utensils, Car, CheckCircle2 } from "lucide-react";
import { mockProperties } from "@/data/mockData";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const property = mockProperties.find(p => p.id === id) || mockProperties[0];
  
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState(1);
  
  const handleBooking = () => {
    if (!date) {
      toast({
        title: "Please select a date",
        description: "You need to choose a check-in date to continue.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Booking initiated",
      description: "Your booking request has been received. Please check your email for confirmation.",
    });
  };
  
  const amenities = [
    { name: "Wi-Fi", icon: Wifi },
    { name: "Free parking", icon: Car },
    { name: "Coffee maker", icon: Coffee },
    { name: "Fully equipped kitchen", icon: Utensils },
  ];
  
  return (
    <Layout userType="user">
      <div className="oifyk-container py-8">
        <div className="flex flex-col gap-6">
          {/* Property Header */}
          <div>
            <h1 className="text-3xl font-bold text-airbnb-dark">{property.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-airbnb-primary mr-1" />
                <span className="font-medium">{property.rating}</span>
                <span className="text-airbnb-light ml-1">({property.reviewCount} reviews)</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-airbnb-light mr-1" />
                <span className="text-airbnb-light">{property.location}</span>
              </div>
            </div>
          </div>
          
          {/* Property Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg overflow-hidden aspect-[4/3]">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="rounded-lg overflow-hidden aspect-square">
                  <img
                    src={property.images[index % property.images.length]}
                    alt={`${property.title} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Property Content and Booking */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-airbnb-dark">
                    {property.beds} bedroom {property.baths} bathroom property
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-airbnb-light mr-1" />
                      <span className="text-airbnb-light">{property.beds * 2} guests</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-airbnb-light mr-1" />
                      <span className="text-airbnb-light">{property.sqft} sqft</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-b py-6 my-6">
                  <p className="text-airbnb-dark">
                    This beautiful property offers a perfect blend of comfort and luxury. Located in the heart of {property.location}, it provides easy access to local attractions, dining, and entertainment options.
                  </p>
                  <p className="text-airbnb-dark mt-4">
                    The property features {property.beds} bedrooms, {property.baths} bathrooms, a fully equipped kitchen, and comfortable living areas. Ideal for families, couples, or business travelers looking for a relaxing stay.
                  </p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-airbnb-dark mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <amenity.icon className="h-5 w-5 text-airbnb-light" />
                        <span className="text-airbnb-dark">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <Tabs defaultValue="reviews" className="w-full">
                  <TabsList>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="reviews" className="pt-4">
                    <div className="space-y-4">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="border-b pb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-airbnb-primary/20 flex items-center justify-center">
                              <User className="h-5 w-5 text-airbnb-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {index === 0 ? "John D." : index === 1 ? "Sarah M." : "Michael R."}
                              </div>
                              <div className="text-sm text-airbnb-light">
                                {index === 0 ? "April 2025" : index === 1 ? "March 2025" : "February 2025"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < 5 - index * 0.5 ? "text-airbnb-primary" : "text-gray-200"
                                }`}
                                fill={i < 5 - index * 0.5 ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                          <p className="mt-2 text-airbnb-dark">
                            {index === 0
                              ? "Amazing property! Everything was perfect and the location is excellent. Would definitely stay again."
                              : index === 1
                                ? "Very clean and comfortable space. The host was responsive and accommodating."
                                : "Great value for the price. The amenities were as described and the check-in process was smooth."}
                          </p>
                        </div>
                      ))}
                      
                      <Button variant="outline" className="w-full">
                        Show all {property.reviewCount} reviews
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="location" className="pt-4">
                    <div className="aspect-video w-full bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-airbnb-light" />
                      <span className="ml-2">Map placeholder</span>
                    </div>
                    <p className="text-airbnb-dark mb-4">
                      This property is located in {property.location}, offering easy access to local attractions and amenities.
                    </p>
                    <h4 className="font-medium mb-2">What's nearby:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-airbnb-secondary mr-2" />
                        <span>Downtown area - 0.5 miles</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-airbnb-secondary mr-2" />
                        <span>Beach access - 1.2 miles</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-airbnb-secondary mr-2" />
                        <span>Restaurants and shopping - 0.3 miles</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 text-airbnb-secondary mr-2" />
                        <span>Public transportation - 0.2 miles</span>
                      </li>
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="policies" className="pt-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">House Rules</h4>
                        <ul className="text-airbnb-dark space-y-1">
                          <li>Check-in: 3:00 PM - 8:00 PM</li>
                          <li>Checkout: 11:00 AM</li>
                          <li>No smoking</li>
                          <li>No parties or events</li>
                          <li>Pets allowed with prior approval</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Cancellation Policy</h4>
                        <p className="text-airbnb-dark">
                          Free cancellation up to 48 hours before check-in. Cancel within 48 hours of check-in and the first night is non-refundable.
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Health & Safety</h4>
                        <p className="text-airbnb-dark">
                          Property is cleaned with enhanced cleaning protocols. Covid-19 safety measures are in place.
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-2xl font-bold text-airbnb-dark">
                        ${property.price}
                      </span>
                      <span className="text-airbnb-light"> / night</span>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden mb-4">
                    <div className="grid grid-cols-2 divide-x">
                      <div className="p-3">
                        <div className="text-xs font-medium mb-1">CHECK-IN</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "MMM dd, yyyy") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                              disabled={(date) => date < new Date()}
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="p-3">
                        <div className="text-xs font-medium mb-1">GUESTS</div>
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setGuests(Math.max(1, guests - 1))}
                            disabled={guests <= 1}
                          >
                            -
                          </Button>
                          <span className="mx-3">{guests}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setGuests(Math.min(property.beds * 2, guests + 1))}
                            disabled={guests >= property.beds * 2}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-airbnb-primary hover:bg-airbnb-primary/90 mb-4"
                    onClick={handleBooking}
                  >
                    Book now
                  </Button>
                  
                  <div className="text-center text-sm text-airbnb-light mb-4">
                    You won't be charged yet
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <div>${property.price} x 1 night</div>
                      <div>${property.price}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div>Cleaning fee</div>
                      <div>$35</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div>Service fee</div>
                      <div>$25</div>
                    </div>
                    
                    <div className="border-t pt-3 flex justify-between font-bold">
                      <div>Total</div>
                      <div>${property.price + 60}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetails;
