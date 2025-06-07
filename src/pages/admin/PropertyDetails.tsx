
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Download,
  MapPin,
  Bed,
  Bath,
  Calendar,
  User,
  ArrowLeft,
  ExternalLink,
  Tag
} from "lucide-react";
import { mockProperties } from "@/data/mockData";

// Component for image gallery with download buttons
const ImageGallery = ({ images }: { images: string[] }) => {
  const handleDownload = (url: string, index: number) => {
    // In a real app, this would trigger an actual download
    toast.success(`Downloading image ${index + 1}`);
    
    // Create a temporary link to download the image
    const a = document.createElement('a');
    a.href = url;
    a.download = `property-image-${index + 1}.jpg`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img 
              src={image} 
              alt={`Property image ${index + 1}`} 
              className="w-full h-48 md:h-64 object-cover rounded-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDownload(image, index)}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const property = mockProperties.find(p => p.id === id);
  const [activeTab, setActiveTab] = useState("details");
  
  if (!property) {
    return (
      <Layout userType="admin" hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
              <p className="text-airbnb-light mb-4">
                The property you're looking for doesn't exist or has been removed.
              </p>
              <Button asChild>
                <Link to="/admin/properties">View All Properties</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Use default values for missing properties to avoid TypeScript errors
  const propertyDescription = "This beautiful property offers a serene getaway with modern amenities and stunning views.";
  const propertyType = "Villa";
  const propertyMaxGuests = 6;
  const propertyAmenities = ["WiFi", "Pool", "Kitchen", "Parking", "Air Conditioning"];
  
  return (
    <Layout userType="admin" hideFooter>
      <div className="flex">
        <Sidebar type="admin" />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="flex items-center gap-1 mb-4"
              asChild
            >
              <Link to="/admin/properties">
                <ArrowLeft className="h-4 w-4" />
                Back to Properties
              </Link>
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-airbnb-dark">{property.title}</h1>
                <p className="text-sm text-airbnb-light flex items-center mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {property.location}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => toast.success("Beds24 Property Link Copied!")}
                >
                  <ExternalLink className="h-4 w-4" />
                  View on Beds24
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-airbnb-primary/10 rounded-full flex items-center justify-center">
                  <Bed className="h-5 w-5 text-airbnb-primary" />
                </div>
                <div>
                  <p className="text-sm text-airbnb-light">Beds</p>
                  <p className="text-lg font-medium">{property.beds}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-airbnb-secondary/10 rounded-full flex items-center justify-center">
                  <Bath className="h-5 w-5 text-airbnb-secondary" />
                </div>
                <div>
                  <p className="text-sm text-airbnb-light">Baths</p>
                  <p className="text-lg font-medium">{property.baths}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Tag className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-airbnb-light">Price</p>
                  <p className="text-lg font-medium">${property.price}/night</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="trust-levels">Trust Levels</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Property Information</CardTitle>
                  <CardDescription>
                    Detailed information about this property
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm">{propertyDescription}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Owner</h3>
                      <p className="text-sm">John Doe</p>
                      <p className="text-xs text-airbnb-light">john.doe@example.com</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Status</h3>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {propertyAmenities.map((amenity, index) => (
                        <Badge key={index} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-airbnb-light">Property Type:</div>
                      <div>{propertyType}</div>
                      <div className="text-airbnb-light">Maximum Guests:</div>
                      <div>{propertyMaxGuests}</div>
                      <div className="text-airbnb-light">Beds24 ID:</div>
                      <div>BD24-{Math.floor(1000 + Math.random() * 9000)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="images">
              <Card>
                <CardHeader>
                  <CardTitle>Property Images</CardTitle>
                  <CardDescription>
                    View and download all property images
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageGallery images={property.images} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="trust-levels">
              <Card>
                <CardHeader>
                  <CardTitle>Trust Levels & Discounts</CardTitle>
                  <CardDescription>
                    View trust levels and associated discounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Family</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">25%</div>
                          <p className="text-xs text-airbnb-light">Discount</p>
                          <div className="mt-2 text-xs text-airbnb-light">
                            Voucher Code: <Badge variant="outline">FAMILY25</Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Friends</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">15%</div>
                          <p className="text-xs text-airbnb-light">Discount</p>
                          <div className="mt-2 text-xs text-airbnb-light">
                            Voucher Code: <Badge variant="outline">FRIEND15</Badge>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">First Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">5%</div>
                          <p className="text-xs text-airbnb-light">Discount</p>
                          <div className="mt-2 text-xs text-airbnb-light">
                            Voucher Code: <Badge variant="outline">FIRST5</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">Trust Level Assignment</h3>
                      <p className="text-sm">
                        The owner has assigned 15 users to various trust levels:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                        <Badge variant="outline" className="flex items-center justify-center gap-1">
                          <User className="h-3 w-3" />
                          8 Family members
                        </Badge>
                        <Badge variant="outline" className="flex items-center justify-center gap-1">
                          <User className="h-3 w-3" />
                          5 Friends
                        </Badge>
                        <Badge variant="outline" className="flex items-center justify-center gap-1">
                          <User className="h-3 w-3" />
                          2 First timers
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>
                    Recent booking history for this property
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className="border rounded-md p-4 flex flex-col md:flex-row justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-airbnb-light" />
                            <span className="font-medium">May {20 + i} - May {25 + i}, 2025</span>
                          </div>
                          <div className="mt-1 text-sm">
                            <span className="text-airbnb-light">Guest: </span>
                            {i === 1 ? "Alice Johnson" : i === 2 ? "James Smith" : "Emma Brown"}
                          </div>
                          <div className="mt-1 text-sm">
                            <span className="text-airbnb-light">Trust Level: </span>
                            {i === 1 ? "Family" : i === 2 ? "Friend" : "First Time"}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge variant={i === 1 ? "default" : (i === 2 ? "secondary" : "outline")}>
                            {i === 1 ? "Confirmed" : i === 2 ? "Upcoming" : "Completed"}
                          </Badge>
                          <div className="mt-1 font-medium">
                            ${180 - i * 20}
                          </div>
                          <div className="text-xs text-airbnb-light mt-1">
                            {i === 1 ? "25% discount" : i === 2 ? "15% discount" : "5% discount"}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full">
                      View All Bookings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetails;
