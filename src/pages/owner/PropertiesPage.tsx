
import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Calendar, Bed, Bath, MapPin, Edit, Eye, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { mockProperties } from "@/data/mockData";
import TrustLevelBadge from "@/components/ui/trust-level-badge";

// Add default status to properties for rendering
const propertiesWithStatus = mockProperties.map(property => ({
  ...property,
  status: "active" // Default status for all properties
}));

const PropertiesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProperties, setFilteredProperties] = useState(propertiesWithStatus);
  
  // Filter properties when search query changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = query 
      ? propertiesWithStatus.filter(property => 
          property.title.toLowerCase().includes(query.toLowerCase()) ||
          property.location.toLowerCase().includes(query.toLowerCase())
        )
      : propertiesWithStatus;
    setFilteredProperties(filtered);
  };

  return (
    <Layout userType="owner" hideFooter>
      <div className="flex">
        <Sidebar type="owner" />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-airbnb-dark">My Properties</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Manage your listed properties
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                View Calendar
              </Button>
              <Button
                className="bg-airbnb-primary hover:bg-airbnb-primary/90 flex items-center gap-2"
                asChild
              >
                <Link to="/owner/suggest-property">
                  <Plus className="h-4 w-4" />
                  Suggest Property
                </Link>
              </Button>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>My Properties</CardTitle>
                  <CardDescription>
                    {filteredProperties.length} total properties
                  </CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search properties..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Property</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Beds / Baths</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Trust Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <img 
                              src={property.images[0]} 
                              alt={property.title} 
                              className="w-10 h-10 rounded-md object-cover" 
                            />
                            <span>{property.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {property.location}
                        </TableCell>
                        <TableCell>
                          {property.beds} <Bed className="inline h-3.5 w-3.5 mx-1" />
                          / {property.baths} <Bath className="inline h-3.5 w-3.5 mx-1" />
                        </TableCell>
                        <TableCell>${property.price}/night</TableCell>
                        <TableCell>
                          {property.trustLevel ? (
                            <TrustLevelBadge level={property.trustLevel} />
                          ) : (
                            <Badge variant="outline">Not set</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              property.status === "active"
                                ? "bg-green-100 text-green-800"
                                : property.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {property.status || "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Link
                                  to={`/properties/${property.id}`}
                                  className="flex items-center gap-2 w-full"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Property
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <div className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit Details
                                </div>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  Manage Availability
                                </div>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Suggested Properties</CardTitle>
              <CardDescription>
                Properties pending admin approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-md p-4 flex flex-col md:flex-row items-start gap-4">
                  <div className="w-full md:w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" 
                      alt="Suggested property"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-medium">Lakeside Retreat</h3>
                        <p className="text-sm text-airbnb-light flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          Lake Tahoe, CA
                        </p>
                      </div>
                      
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 text-xs text-airbnb-light">
                      <span>3 beds</span>
                      <span>•</span>
                      <span>2 baths</span>
                      <span>•</span>
                      <span>$250/night</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Button variant="outline" size="sm">Edit Submission</Button>
                      <Button variant="ghost" size="sm" className="text-red-500">
                        Cancel Request
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 mx-auto"
                    asChild
                  >
                    <Link to="/owner/suggest-property">
                      <Plus className="h-4 w-4" />
                      Suggest New Property
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default PropertiesPage;
