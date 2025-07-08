import { useState } from "react";
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Eye, 
  Check, 
  X, 
  MapPin, 
  Loader2, 
  Bed, 
  Bath, 
  User,
  Download,
  Upload,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { 
  useApproveProperty, 
  useRejectProperty
} from "@/hooks/useQueries";
import { propertyService, type Property } from "@/services/api";

const SuggestedProperties = () => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isPropertyDetailOpen, setIsPropertyDetailOpen] = useState(false);
  const [beds24Id, setBeds24Id] = useState("");
  const [showUploadReceipt, setShowUploadReceipt] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const { user } = useAuth();

  // Fetch properties - using general properties query with client-side filtering
  // since getPropertiesByStatus doesn't actually filter by status in the API
  const { 
    data: allPropertiesResponse, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['properties', 'pending_approval'],
    queryFn: async () => {
      const result = await propertyService.getProperties();
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    staleTime: 30000, // Cache for 30 seconds
    retry: 2, // Retry failed requests 2 times
  });

  // Mutations for approval and rejection
  const approvePropertyMutation = useApproveProperty();
  const rejectPropertyMutation = useRejectProperty();

  // Extract and filter properties array from the response
  const suggestedProperties = React.useMemo(() => {
    if (!allPropertiesResponse?.data) return [];
    
    // Debug logging to help troubleshoot API response structure
    console.log('API Response:', allPropertiesResponse);
    
    let properties = [];
    
    // Handle both array response and paginated response
    if (Array.isArray(allPropertiesResponse.data)) {
      properties = allPropertiesResponse.data;
    } else if (allPropertiesResponse.data?.results) {
      properties = allPropertiesResponse.data.results;
    } else {
      console.warn('Unexpected API response structure:', allPropertiesResponse.data);
      return [];
    }
    
    // Filter for properties that need approval
    // Since the API doesn't filter by status, we'll filter client-side
    const filtered = properties.filter(property => 
      property.status === 'pending_approval' || 
      property.status === 'draft' ||
      property.status === 'pending'
    );
    
    console.log('Filtered properties:', filtered);
    return filtered;
  }, [allPropertiesResponse]);

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsPropertyDetailOpen(true);
  };

  const handleApproveDialog = (property: Property) => {
    setSelectedProperty(property);
    setBeds24Id("");
    setApprovalNotes("");
    setShowUploadReceipt(false);
    setIsApprovalDialogOpen(true);
  };

  const handleRejectDialog = (property: Property) => {
    setSelectedProperty(property);
    setRejectionReason("");
    setIsRejectionDialogOpen(true);
  };

  const handleApproveProperty = async () => {
    if (!selectedProperty) return;

    if (!beds24Id.trim()) {
      toast.error("Please enter a Beds24 property ID");
      return;
    }

    try {
      await approvePropertyMutation.mutateAsync({
        propertyId: selectedProperty.id,
        notes: `Beds24 ID: ${beds24Id}${approvalNotes ? ` | Notes: ${approvalNotes}` : ''}`
      });
      
      setIsApprovalDialogOpen(false);
      setBeds24Id("");
      setApprovalNotes("");
      setShowUploadReceipt(false);
      
      // Refetch the properties list to update the UI
      refetch();
    } catch (error) {
      console.error('Failed to approve property:', error);
    }
  };

  const handleRejectProperty = async () => {
    if (!selectedProperty) return;

    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await rejectPropertyMutation.mutateAsync({
        propertyId: selectedProperty.id,
        reason: rejectionReason
      });
      
      setIsRejectionDialogOpen(false);
      setRejectionReason("");
      
      // Refetch the properties list to update the UI
      refetch();
    } catch (error) {
      console.error('Failed to reject property:', error);
    }
  };

  const handleDownloadImage = (imageUrl: string, index: number) => {
    // Create a temporary link to download the image
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `property-${selectedProperty?.id}-image-${index + 1}.jpg`;
    a.target = '_blank';
    a.click();
    toast.success(`Downloading image ${index + 1}`);
  };

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return {
          className: "bg-yellow-100 text-yellow-800",
          text: "Pending Approval"
        };
      case 'approved_pending_beds24':
        return {
          className: "bg-blue-100 text-blue-800",
          text: "Approved - Pending Beds24"
        };
      case 'active':
        return {
          className: "bg-green-100 text-green-800",
          text: "Active"
        };
      case 'rejected':
        return {
          className: "bg-red-100 text-red-800",
          text: "Rejected"
        };
      default:
        return {
          className: "bg-gray-100 text-gray-800",
          text: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString()}`;
  };

  if (isLoading) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading suggested properties...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="text-center py-8 text-red-600">
              <p className="mb-2">Error loading properties:</p>
              <p className="text-sm mb-4">
                {error?.message?.includes('DOCTYPE') 
                  ? 'API returned HTML instead of JSON. Please check if the API endpoint is working correctly.'
                  : error?.message || 'Unknown error occurred'
                }
              </p>
              <Button 
                variant="outline" 
                onClick={() => refetch()} 
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-airbnb-dark">Suggested Properties</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Review and approve property submissions from owners
                {Array.isArray(suggestedProperties) && suggestedProperties.length > 0 && ` (${suggestedProperties.length} properties)`}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <span className="mt-2 block">Loading properties...</span>
              </div>
            ) : !Array.isArray(suggestedProperties) || suggestedProperties.length === 0 ? (
              <div className="text-center py-8 text-airbnb-light">
                {!Array.isArray(suggestedProperties) 
                  ? "Error loading properties data."
                  : "No properties pending approval found."
                }
              </div>
            ) : (
              suggestedProperties.map((property: Property) => {
                const statusProps = getStatusBadgeProps(property.status);
                
                return (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-64 h-48 md:h-auto">
                        <img 
                          src={property.images?.[0]?.image_url || '/placeholder-property.jpg'} 
                          alt={property.title} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-property.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                          <div>
                            <h3 className="text-xl font-bold">{property.title}</h3>
                            <p className="text-sm text-airbnb-light flex items-center mt-1">
                              <MapPin className="h-3.5 w-3.5 mr-1" />
                              {property.city}, {property.state}, {property.country}
                            </p>
                          </div>
                          <Badge className={`${statusProps.className} mt-2 md:mt-0 self-start`}>
                            {statusProps.text}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-3">
                          <div className="flex items-center text-sm">
                            <Bed className="h-4 w-4 mr-1 text-airbnb-light" />
                            {property.bedrooms} beds
                          </div>
                          <div className="flex items-center text-sm">
                            <Bath className="h-4 w-4 mr-1 text-airbnb-light" />
                            {property.bathrooms} baths
                          </div>
                          <div className="flex items-center text-sm">
                            <User className="h-4 w-4 mr-1 text-airbnb-light" />
                            {property.max_guests} guests
                          </div>
                          <div className="text-sm font-medium">
                            ${property.display_price || property.price_per_night}/night
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 text-sm">
                          <strong>Owner:</strong> {property.owner_name}
                        </div>
                        <div className="line-clamp-2 text-sm mt-3">
                          {property.description}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewProperty(property)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleRejectDialog(property)}
                            disabled={rejectPropertyMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveDialog(property)}
                            disabled={approvePropertyMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
          
          {/* Property Detail Dialog */}
          <Dialog open={isPropertyDetailOpen} onOpenChange={setIsPropertyDetailOpen}>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Property Details</DialogTitle>
                <DialogDescription>
                  Review all details of the property submission
                </DialogDescription>
              </DialogHeader>
              
              {selectedProperty && (
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                  <div>
                    <h3 className="text-lg font-medium mb-2">{selectedProperty.title}</h3>
                    <p className="text-sm text-airbnb-light flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      {selectedProperty.address ? `${selectedProperty.address}, ` : ''}
                      {selectedProperty.city}, {selectedProperty.state}, {selectedProperty.country}
                      {selectedProperty.postal_code ? ` ${selectedProperty.postal_code}` : ''}
                    </p>
                  </div>
                  
                  <Tabs defaultValue="info">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="info">Information</TabsTrigger>
                      <TabsTrigger value="images">Images</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="info" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Property Owner</p>
                          <p className="text-sm">{selectedProperty.owner_name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Submitted On</p>
                          <p className="text-sm">
                            {formatDateTime(selectedProperty.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Description</p>
                        <p className="text-sm">{selectedProperty.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Price</p>
                          <p className="text-sm">
                            ${selectedProperty.display_price || selectedProperty.price_per_night} per night
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">Capacity</p>
                          <p className="text-sm">
                            {selectedProperty.bedrooms} beds • {selectedProperty.bathrooms} baths • {selectedProperty.max_guests} guests
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Status</p>
                        <Badge className={getStatusBadgeProps(selectedProperty.status).className}>
                          {getStatusBadgeProps(selectedProperty.status).text}
                        </Badge>
                      </div>
                      
                      {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Amenities</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedProperty.amenities.map((amenity: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {amenity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedProperty.latitude && selectedProperty.longitude && (
                        <div>
                          <p className="text-sm font-medium mb-1">Coordinates</p>
                          <p className="text-sm">
                            Lat: {selectedProperty.latitude}, Lng: {selectedProperty.longitude}
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="images">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {selectedProperty.images && selectedProperty.images.length > 0 ? (
                          selectedProperty.images.map((image, index) => (
                            <div key={image.id || index} className="relative group">
                              <img 
                                src={image.image_url} 
                                alt={`${selectedProperty.title} - Image ${index + 1}`}
                                className="w-full h-48 object-cover rounded-md"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder-property.jpg';
                                }}
                              />
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDownloadImage(image.image_url, index)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                              {image.is_primary && (
                                <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                                  Primary
                                </Badge>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 text-center py-8 text-gray-500">
                            No images available for this property
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              <DialogFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsPropertyDetailOpen(false)}
                >
                  Close
                </Button>
                
                <div className="flex-1 flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => {
                      setIsPropertyDetailOpen(false);
                      handleRejectDialog(selectedProperty);
                    }}
                    disabled={rejectPropertyMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setIsPropertyDetailOpen(false);
                      handleApproveDialog(selectedProperty);
                    }}
                    disabled={approvePropertyMutation.isPending}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Approval Dialog */}
          <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Approve Property</DialogTitle>
                <DialogDescription>
                  Create Beds24 property and approve the listing
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {showUploadReceipt ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="font-medium">Upload Payment Receipt</h3>
                      <p className="text-sm text-airbnb-light mt-1">
                        Upload proof of payment for property setup
                      </p>
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-airbnb-light mb-2" />
                      <p className="text-sm text-airbnb-light">
                        Drag and drop a file or click to browse
                      </p>
                      <input 
                        type="file" 
                        className="hidden" 
                        id="receipt-upload"
                        accept="image/*,.pdf" 
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => document.getElementById('receipt-upload')?.click()}
                      >
                        Select File
                      </Button>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h4 className="text-sm font-medium">Payment Details:</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-xs">
                        <div className="text-airbnb-light">Amount:</div>
                        <div>$99.00</div>
                        <div className="text-airbnb-light">Recipient:</div>
                        <div>{selectedProperty?.owner_name}</div>
                        <div className="text-airbnb-light">Reference:</div>
                        <div>PROP-{selectedProperty?.id}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="beds24-id">Beds24 Property ID</Label>
                      <Input
                        id="beds24-id"
                        placeholder="Enter Beds24 property ID"
                        value={beds24Id}
                        onChange={(e) => setBeds24Id(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        After creating the property in Beds24, enter its ID here
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="approval-notes">Notes (Optional)</Label>
                      <textarea
                        id="approval-notes"
                        rows={3}
                        placeholder="Add any notes about the approval..."
                        className="w-full border border-input rounded-md p-3 resize-none"
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                {showUploadReceipt ? (
                  <div className="flex justify-between w-full">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowUploadReceipt(false)}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={() => {
                        toast.success("Receipt uploaded successfully!");
                        setIsApprovalDialogOpen(false);
                        setShowUploadReceipt(false);
                      }}
                    >
                      Complete
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between w-full">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsApprovalDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <div className="space-x-2">
                      <Button 
                        variant="outline"
                        onClick={() => setShowUploadReceipt(true)}
                      >
                        Upload Payment Receipt
                      </Button>
                      <Button 
                        onClick={handleApproveProperty} 
                        disabled={approvePropertyMutation.isPending}
                      >
                        {approvePropertyMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Approve'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Rejection Dialog */}
          <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reject Property</DialogTitle>
                <DialogDescription>
                  Please provide a reason for rejecting this property
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                  <textarea
                    id="rejection-reason"
                    rows={4}
                    placeholder="Explain why this property is being rejected..."
                    className="w-full border border-input rounded-md p-3 resize-none"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsRejectionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleRejectProperty} 
                  disabled={rejectPropertyMutation.isPending}
                >
                  {rejectPropertyMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Reject Property'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default SuggestedProperties;