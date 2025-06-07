
import React from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit,
  BookOpen,
  Home
} from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "New York, USA",
    joinedDate: "January 2023",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
    trustLevel: "Verified",
    bio: "Travel enthusiast and digital nomad. I love exploring new places and meeting new people.",
    recentBookings: [
      {
        id: "1",
        property: "Luxury Apartment in Manhattan",
        dates: "June 10-15, 2023",
        status: "Completed"
      },
      {
        id: "2",
        property: "Beach House in Miami",
        dates: "August 5-12, 2023",
        status: "Upcoming"
      }
    ],
    savedProperties: [
      {
        id: "3",
        title: "Mountain Cabin in Colorado",
        location: "Denver, Colorado",
        price: 150
      },
      {
        id: "4",
        title: "City Loft in Chicago",
        location: "Chicago, Illinois",
        price: 120
      }
    ]
  };

  return (
    <Layout userType="user">
      <div className="oifyk-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="animate-fade-in">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Profile</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-col items-center pb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <Badge variant="outline" className="mt-2 flex items-center gap-1">
                    <Shield className="h-3 w-3" /> {user.trustLevel}
                  </Badge>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-airbnb-light" />
                    <div className="flex-1">
                      <p className="text-sm text-airbnb-light">Full name</p>
                      <p>{user.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-airbnb-light" />
                    <div className="flex-1">
                      <p className="text-sm text-airbnb-light">Email</p>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-airbnb-light" />
                    <div className="flex-1">
                      <p className="text-sm text-airbnb-light">Phone</p>
                      <p>{user.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-airbnb-light" />
                    <div className="flex-1">
                      <p className="text-sm text-airbnb-light">Location</p>
                      <p>{user.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-airbnb-light" />
                    <div className="flex-1">
                      <p className="text-sm text-airbnb-light">Joined</p>
                      <p>{user.joinedDate}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Button asChild variant="outline" className="flex items-center gap-2">
                    <Link to="/settings">
                      <Edit className="h-4 w-4" /> Edit Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Activity Section */}
          <div className="lg:col-span-2">
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl">Activity</CardTitle>
                <CardDescription>Your bookings and saved properties</CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="bookings">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="bookings" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Bookings
                    </TabsTrigger>
                    <TabsTrigger value="saved" className="flex items-center gap-2">
                      <Home className="h-4 w-4" /> Saved Properties
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="bookings" className="pt-4">
                    {user.recentBookings.length > 0 ? (
                      <div className="space-y-4">
                        {user.recentBookings.map(booking => (
                          <Card key={booking.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">{booking.property}</h4>
                                  <p className="text-sm text-airbnb-light">{booking.dates}</p>
                                </div>
                                <Badge variant={booking.status === "Completed" ? "outline" : "default"}>
                                  {booking.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <h3 className="text-lg font-medium">No bookings yet</h3>
                        <p className="text-airbnb-light mt-1">Start exploring properties to plan your next stay</p>
                        <Button className="mt-4" asChild>
                          <Link to="/">Explore Properties</Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="saved" className="pt-4">
                    {user.savedProperties.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.savedProperties.map(property => (
                          <Card key={property.id}>
                            <CardContent className="p-4">
                              <div>
                                <h4 className="font-medium">{property.title}</h4>
                                <p className="text-sm text-airbnb-light">{property.location}</p>
                                <p className="text-sm font-medium mt-2">${property.price} / night</p>
                              </div>
                              <Button variant="link" size="sm" asChild className="p-0 mt-2">
                                <Link to={`/properties/${property.id}`}>View details</Link>
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <h3 className="text-lg font-medium">No saved properties</h3>
                        <p className="text-airbnb-light mt-1">Save properties to find them easily later</p>
                        <Button className="mt-4" asChild>
                          <Link to="/">Explore Properties</Link>
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card className="mt-6 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl">About Me</CardTitle>
                <CardDescription>Your bio and interests</CardDescription>
              </CardHeader>
              
              <CardContent>
                <p>{user.bio}</p>
                <Button variant="outline" size="sm" className="mt-4 flex items-center gap-2">
                  <Edit className="h-4 w-4" /> Edit Bio
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
