
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, Home, Settings, Shield, User, Plus, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { mockProperties, mockTrustLevels } from "@/data/mockData";
import TrustLevelBadge from "@/components/ui/trust-level-badge";

const OwnerDashboard = () => {
  // We're using the mock data for this MVP
  const ownerProperties = mockProperties.slice(0, 3);
  
  return (
    <Layout userType="owner" hideFooter>
      <div className="flex">
        <Sidebar type="owner" />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-airbnb-dark">Owner Dashboard</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Manage your properties and trust network
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
             <Button variant="outline" className="flex items-center gap-2" asChild>
                <Link to="/owner/settings">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </Button>

               <Button className="bg-airbnb-primary hover:bg-airbnb-primary/90 flex items-center gap-2" asChild>
                <Link to="/owner/suggest-property">
                  <Plus className="h-4 w-4" />
                  Suggest Property
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-airbnb-light">
                  My Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{ownerProperties.length}</div>
                  <div className="h-12 w-12 bg-airbnb-primary/10 rounded-full flex items-center justify-center">
                    <Home className="h-6 w-6 text-airbnb-primary" />
                  </div>
                </div>
                <p className="text-xs text-airbnb-light mt-2">
                  {ownerProperties.length} active listings
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-airbnb-light">
                  Trust Levels
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{mockTrustLevels.length}</div>
                  <div className="h-12 w-12 bg-airbnb-secondary/10 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-airbnb-secondary" />
                  </div>
                </div>
                <p className="text-xs text-airbnb-light mt-2">
                  Custom discount levels
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-airbnb-light">
                  Network Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">24</div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-xs text-airbnb-light mt-2">
                  Trusted contacts in network
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-airbnb-light">
                  Next Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">7</div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-airbnb-light mt-2">
                  Upcoming in next 30 days
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>My Properties</CardTitle>
                  <CardDescription>
                    Manage your listed properties
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/owner/properties">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ownerProperties.map((property) => (
                    <div key={property.id} className="flex flex-col md:flex-row items-start gap-4 p-4 bg-muted rounded-lg">
                      <div className="w-full md:w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={property.images[0]} 
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <h3 className="text-base font-medium">{property.title}</h3>
                          
                          <div className="flex items-center gap-2">
                            {property.trustLevel && (
                              <TrustLevelBadge level={property.trustLevel} />
                            )}
                            
                            <span className="text-sm font-medium">${property.price}/night</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-airbnb-light flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {property.location}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-2 text-xs text-airbnb-light">
                          <span>{property.beds} beds</span>
                          <span>•</span>
                          <span>{property.baths} baths</span>
                          {property.sqft && (
                            <>
                              <span>•</span>
                              <span>{property.sqft} sqft</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm">Availability</Button>
                          <Button variant="ghost" size="sm" className="text-airbnb-primary">
                            Set Trust Levels
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Trust Levels</CardTitle>
                <CardDescription>
                  Customize discounts by trust level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTrustLevels.map((level) => (
                    <div key={level.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrustLevelBadge level={level.level as 1 | 2 | 3 | 4 | 5} />
                        <span className="text-sm">{level.name}</span>
                      </div>
                      <div className="text-sm font-medium">{level.discount}% off</div>
                    </div>
                  ))}
                  
                  <Button className="w-full mt-2" variant="outline" asChild>
                    <Link to="/owner/trust-levels">Manage Trust Levels</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upcoming Bookings</CardTitle>
                  <CardDescription>Next 7 days</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/owner/bookings">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-airbnb-primary/10 rounded-full flex items-center justify-center">
                          <CalendarIcon className="h-5 w-5 text-airbnb-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {i === 1 ? 'Luxury Beach Villa' : i === 2 ? 'Downtown Apartment' : 'Mountain Retreat'}
                          </p>
                          <p className="text-xs text-airbnb-light">
                            {i === 1 ? 'May 25 - May 28, 2025' : i === 2 ? 'May 27 - June 2, 2025' : 'May 30 - June 5, 2025'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium">
                          {i === 1 ? 'John D.' : i === 2 ? 'Sarah M.' : 'Robert P.'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" className="flex items-center justify-start gap-2 h-14">
                    <Plus className="h-4 w-4" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Add Property</p>
                      <p className="text-xs text-airbnb-light">List a new property</p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="flex items-center justify-start gap-2 h-14">
                    <Calendar className="h-4 w-4" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Update Calendar</p>
                      <p className="text-xs text-airbnb-light">Manage availability</p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="flex items-center justify-start gap-2 h-14">
                    <Shield className="h-4 w-4" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Trust Settings</p>
                      <p className="text-xs text-airbnb-light">Manage discounts</p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="flex items-center justify-start gap-2 h-14">
                    <User className="h-4 w-4" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Add Contact</p>
                      <p className="text-xs text-airbnb-light">Expand network</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OwnerDashboard;
