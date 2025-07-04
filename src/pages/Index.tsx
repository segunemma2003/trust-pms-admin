import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PropertyCard from "@/components/ui/property-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MapPin, Search, Users, Shield, Calendar, ChevronDown, 
  ArrowRight, Minus, Plus, X 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [date, setDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  
  // Filter properties when search query changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement the logic to filter properties based on the query
  };

  const increment = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    setter(value + 1);
  };

  const decrement = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    if (value > 0) {
      setter(value - 1);
    }
  };

  const clearGuests = () => {
    setAdults(1);
    setChildren(0);
    setInfants(0);
  };

  const clearDates = () => {
    setDate(undefined);
    setEndDate(undefined);
  };
  
  return (
    <Layout>
      {/* Hero Section - Redesigned based on the image */}
      <section className="relative bg-white py-16 md:py-24 overflow-hidden animate-fade-in">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find exclusive stays
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Search through unique places shared by friends and their trusted circles.
            </p>
            
            {/* Search Form - Improved based on the reference images */}
            <div className="bg-white rounded-xl shadow-lg p-3 max-w-3xl mx-auto">
              <div className="grid gap-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex flex-col border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                    <label className="text-sm font-medium mb-1 text-left">Where?</label>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-airbnb-light mr-2" />
                      <Input 
                        placeholder="Destination"
                        className="border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="flex flex-col border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                        <label className="text-sm font-medium mb-1 text-left">When and for how long?</label>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-airbnb-light mr-2" />
                          <span className="text-sm text-airbnb-light">
                            {date && endDate 
                              ? `${format(date, "MMM d")} - ${format(endDate, "MMM d")}` 
                              : "Add dates"}
                          </span>
                          <ChevronDown className="h-4 w-4 text-airbnb-light ml-auto" />
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <div className="p-4 flex flex-col">
                        <div className="flex justify-between mb-4">
                          <h3 className="text-lg font-medium">Select dates</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-sm font-medium mb-1">Start date</p>
                            <CalendarComponent
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              className="pointer-events-auto"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-1">End date</p>
                            <CalendarComponent
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              className="pointer-events-auto"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {date && endDate 
                                ? `${format(date, "MMM d")} - ${format(endDate, "MMM d")}`
                                : "Select dates"}
                            </span>
                            <button 
                              onClick={clearDates} 
                              className="text-sm flex items-center text-airbnb-light hover:text-airbnb-dark"
                            >
                              <X className="h-3 w-3 mr-1" /> Clear dates
                            </button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="flex flex-col border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                        <label className="text-sm font-medium mb-1 text-left">Who?</label>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-airbnb-light mr-2" />
                          <span className="text-sm text-airbnb-light">
                            {adults + children + infants > 1 
                              ? `${adults + children + infants} guests` 
                              : "Add guests"}
                          </span>
                          <ChevronDown className="h-4 w-4 text-airbnb-light ml-auto" />
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="center">
                      <div className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Adults</h4>
                              <p className="text-sm text-airbnb-light">Age 13+</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="rounded-full h-8 w-8"
                                onClick={() => decrement(setAdults, adults)}
                                disabled={adults <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center">{adults}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="rounded-full h-8 w-8"
                                onClick={() => increment(setAdults, adults)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Children</h4>
                              <p className="text-sm text-airbnb-light">Ages 2–12</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="rounded-full h-8 w-8"
                                onClick={() => decrement(setChildren, children)}
                                disabled={children <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center">{children}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="rounded-full h-8 w-8"
                                onClick={() => increment(setChildren, children)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Infants</h4>
                              <p className="text-sm text-airbnb-light">Under 2</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="rounded-full h-8 w-8"
                                onClick={() => decrement(setInfants, infants)}
                                disabled={infants <= 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center">{infants}</span>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="rounded-full h-8 w-8"
                                onClick={() => increment(setInfants, infants)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="pt-2 flex justify-end">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={clearGuests}
                              className="text-sm"
                            >
                              <X className="h-3 w-3 mr-1" /> Clear guests
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button className="w-full md:w-auto md:self-end bg-airbnb-primary hover:bg-airbnb-primary/90 py-6 text-base">
                  <Search className="h-5 w-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-airbnb-primary/5 rounded-full blur-3xl z-0"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-airbnb-secondary/5 rounded-full blur-3xl z-0"></div>
      </section>
      
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Properties</h2>
            <Button variant="outline" asChild>
              <Link to="/properties">View all</Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
          
          {filteredProperties.length === 0 && (
            <div className="text-center py-10">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
          
          {filteredProperties.length > 6 && (
            <div className="text-center mt-8">
              <Button variant="outline" asChild className="hover:scale-105 transition-transform">
                <Link to="/properties" className="flex items-center gap-2">
                  View all properties
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
      
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How OnlyIfYouKnow Works</h2>
            <p className="text-lg text-gray-600">
              Our unique network connects trusted guests with quality properties
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-airbnb-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-airbnb-primary" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Trusted Network</h3>
              <p className="text-gray-600">
                Join an exclusive platform where property owners share their spaces with trusted circles
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-airbnb-secondary/10 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-airbnb-secondary" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Quality Connections</h3>
              <p className="text-gray-600">
                Connect with property owners in your network for authentic travel experiences
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-gray-900/10 rounded-full flex items-center justify-center mb-4">
                <MapPin className="h-8 w-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Book with Confidence</h3>
              <p className="text-gray-600">
                Browse quality properties and book seamlessly through our trusted platform
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-airbnb-primary/10 to-airbnb-secondary/10 rounded-xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Are you a property owner?
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Join OnlyIfYouKnow and manage your properties with our powerful tools. Share your spaces with trusted networks and create meaningful connections. Property owners are invited by our admin team.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" asChild>
                    <Link to="/contact-admin">Contact Admin</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/about">Learn more</Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative min-h-[300px] md:min-h-0">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Property management" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
