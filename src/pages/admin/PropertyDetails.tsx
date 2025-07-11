import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import { propertyService } from '@/services/api';
import type { Property } from '@/services/api';
import {
  Download,
  MapPin,
  Bed,
  Bath,
  Calendar,
  User,
  ArrowLeft,
  ExternalLink,
  Tag,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Type for handling both single property and paginated response
type PropertyResponse = Property | {
  count: number;
  next?: string;
  previous?: string;
  results: Property[];
};

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
  const [activeTab, setActiveTab] = useState("details");
  const { user } = useAuth();

  const { data: propertyResponse, isLoading, error } = useQuery<PropertyResponse>({
    queryKey: ['property', id],
    queryFn: async () => {
      const result = await propertyService.getPropertyById(id!);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });

  // Extract property from response - handle both single property and paginated response
  const property: Property | null = propertyResponse 
    ? ('results' in propertyResponse ? propertyResponse.results[0] : propertyResponse)
    : null;

  if (isLoading) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-airbnb-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Property</h3>
                <p className="text-sm text-gray-600">
                  Fetching property details...
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Property Not Found</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {error ? `Error: ${error.message}` : "The property you're looking for doesn't exist."}
                </p>
                <Button asChild variant="outline">
                  <Link to="/admin/all-properties">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Properties
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <div className="flex">
        <Sidebar type="admin" />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="flex items-center gap-1 mb-4"
              asChild
            >
              <Link to="/admin/all-properties">
                <ArrowLeft className="h-4 w-4" />
                Back to Properties
              </Link>
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-airbnb-dark">{property.title}</h1>
                <p className="text-sm text-airbnb-light flex items-center mt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {property.city}, {property.state}
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
                  <p className="text-lg font-medium">{property.bedrooms}</p>
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
                  <p className="text-lg font-medium">{property.bathrooms}</p>
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
                  <p className="text-lg font-medium">${property.display_price || property.price_per_night}/night</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
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
                    <p className="text-sm">{property.description || 'No description available'}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Owner</h3>
                      <p className="text-sm">{property.owner_name}</p>
                      <p className="text-xs text-airbnb-light">{property.owner || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Status</h3>
                      <Badge className={property.status === 'active' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {property.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities && property.amenities.length > 0 ? (
                        property.amenities.map((amenity: string, idx: number) => (
                          <Badge key={idx} variant="outline">{amenity}</Badge>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">No amenities listed</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Additional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-airbnb-light">Maximum Guests:</div>
                      <div>{property.max_guests}</div>
                      <div className="text-airbnb-light">Address:</div>
                      <div>{property.address || 'N/A'}</div>
                      <div className="text-airbnb-light">Postal Code:</div>
                      <div>{property.postal_code || 'N/A'}</div>
                      <div className="text-airbnb-light">Country:</div>
                      <div>{property.country}</div>
                      <div className="text-airbnb-light">Featured:</div>
                      <div>{property.is_featured ? 'Yes' : 'No'}</div>
                      <div className="text-airbnb-light">Total Bookings:</div>
                      <div>{property.booking_count || 0}</div>
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
                  {property.images && property.images.length > 0 ? (
                    <ImageGallery 
                      images={property.images.map((img: any) => img.image_url)} 
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No images available for this property
                    </div>
                  )}
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