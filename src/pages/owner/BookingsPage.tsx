
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Search, User, Filter, ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data for bookings
const bookings = [
  {
    id: "B001",
    guest: "Alice Johnson",
    property: "Luxury Beach House",
    checkIn: "2025-05-25",
    checkOut: "2025-05-28",
    guests: 4,
    amount: 1050,
    status: "confirmed",
    trustLevel: "Family"
  },
  {
    id: "B002",
    guest: "Michael Brown",
    property: "Mountain Cabin Retreat",
    checkIn: "2025-05-28",
    checkOut: "2025-06-01",
    guests: 2,
    amount: 720,
    status: "confirmed",
    trustLevel: "Friend"
  },
  {
    id: "B003",
    guest: "Sarah Miller",
    property: "Downtown Apartment",
    checkIn: "2025-06-05",
    checkOut: "2025-06-10",
    guests: 2,
    amount: 1200,
    status: "confirmed",
    trustLevel: "First Time"
  },
  {
    id: "B004",
    guest: "David Wilson",
    property: "Luxury Beach House",
    checkIn: "2025-06-15",
    checkOut: "2025-06-20",
    guests: 5,
    amount: 1750,
    status: "pending",
    trustLevel: "Family"
  },
  {
    id: "B005",
    guest: "Emma Davis",
    property: "Mountain Cabin Retreat",
    checkIn: "2025-06-22",
    checkOut: "2025-06-29",
    guests: 3,
    amount: 1260,
    status: "pending",
    trustLevel: "Acquaintance"
  },
  {
    id: "B006",
    guest: "James Wilson",
    property: "Luxury Beach House",
    checkIn: "2025-04-10",
    checkOut: "2025-04-15",
    guests: 4,
    amount: 1250,
    status: "completed",
    trustLevel: "Friend"
  },
  {
    id: "B007",
    guest: "Olivia Martin",
    property: "Downtown Apartment",
    checkIn: "2025-04-20",
    checkOut: "2025-04-25",
    guests: 2,
    amount: 950,
    status: "completed",
    trustLevel: "First Time"
  }
];

const BookingsPage = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  const upcomingBookings = bookings.filter(booking => booking.status === "confirmed" || booking.status === "pending");
  const pastBookings = bookings.filter(booking => booking.status === "completed");
  
  const filteredBookings = (activeTab === "upcoming" ? upcomingBookings : pastBookings)
    .filter(booking => 
      booking.guest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.checkIn).getTime();
      const dateB = new Date(b.checkIn).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <Layout userType="owner" hideFooter>
      <div className="flex">
        <Sidebar type="owner" />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-airbnb-dark">Bookings</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Manage and track all your property bookings
              </p>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Booking Management</CardTitle>
                  <CardDescription>
                    View and manage all your property bookings
                  </CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search bookings..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <TabsList>
                    <TabsTrigger value="upcoming">Upcoming Bookings</TabsTrigger>
                    <TabsTrigger value="past">Past Bookings</TabsTrigger>
                  </TabsList>
                  
                  <div className="mt-4 md:mt-0 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={toggleSortOrder}
                    >
                      Date {sortOrder === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      Filter
                    </Button>
                  </div>
                </div>
                
                <TabsContent value="upcoming">
                  {filteredBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-1">No Upcoming Bookings</h3>
                      <p className="text-sm text-muted-foreground">
                        You don't have any upcoming bookings at the moment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredBookings.map(booking => (
                        <div 
                          key={booking.id} 
                          className="border rounded-md p-4 flex flex-col md:flex-row items-start justify-between gap-4 animate-fade-in"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                className={
                                  booking.status === "confirmed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {booking.status === "confirmed" ? "Confirmed" : "Pending"}
                              </Badge>
                              <span className="text-sm font-medium">{booking.id}</span>
                            </div>
                            
                            <h3 className="font-medium">{booking.property}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                              <span className="mx-2">•</span>
                              <User className="h-3.5 w-3.5 mr-1" />
                              {booking.guests} guests
                            </div>
                          </div>
                          
                          <div className="w-full md:w-auto flex flex-col md:items-end gap-2">
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Guest: </span>
                                {booking.guest}
                              </div>
                              <Badge variant="outline">{booking.trustLevel}</Badge>
                            </div>
                            
                            <div className="font-medium">${booking.amount}</div>
                            
                            <div className="flex gap-2 w-full md:w-auto">
                              <Button variant="outline" size="sm" className="flex-1 md:flex-auto">
                                Details
                              </Button>
                              <Button size="sm" className="flex-1 md:flex-auto">
                                Contact
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="past">
                  {filteredBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-1">No Past Bookings</h3>
                      <p className="text-sm text-muted-foreground">
                        You don't have any past booking history.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredBookings.map(booking => (
                        <div 
                          key={booking.id} 
                          className="border rounded-md p-4 flex flex-col md:flex-row items-start justify-between gap-4 animate-fade-in"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Completed</Badge>
                              <span className="text-sm font-medium">{booking.id}</span>
                            </div>
                            
                            <h3 className="font-medium">{booking.property}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                              <span className="mx-2">•</span>
                              <User className="h-3.5 w-3.5 mr-1" />
                              {booking.guests} guests
                            </div>
                          </div>
                          
                          <div className="w-full md:w-auto flex flex-col md:items-end gap-2">
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Guest: </span>
                                {booking.guest}
                              </div>
                              <Badge variant="outline">{booking.trustLevel}</Badge>
                            </div>
                            
                            <div className="font-medium">${booking.amount}</div>
                            
                            <Button variant="outline" size="sm" className="w-full md:w-auto">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BookingsPage;
