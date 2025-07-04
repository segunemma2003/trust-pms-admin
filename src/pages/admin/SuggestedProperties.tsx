import { useState } from "react";
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
  Upload
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const SuggestedProperties = () => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isPropertyDetailOpen, setIsPropertyDetailOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [beds24Id, setBeds24Id] = useState("");
  const [showUploadReceipt, setShowUploadReceipt] = useState(false);

  const handleViewProperty = (property: any) => {
    setSelectedProperty(property);
    setIsPropertyDetailOpen(true);
  };

  const handleApproveDialog = (property: any) => {
    setSelectedProperty(property);
    setIsApprovalDialogOpen(true);
  };

  const handleRejectDialog = (property: any) => {
    setSelectedProperty(property);
    setIsRejectionDialogOpen(true);
  };

  const handleApproveProperty = () => {
    if (!beds24Id.trim()) {
      toast.error("Please enter a Beds24 property ID");
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsApprovalDialogOpen(false);
      toast.success(`Property "${selectedProperty.title}" has been approved`);
      // In a real app, you would make an API call to update the property status
    }, 1500);
  };

  const handleRejectProperty = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsRejectionDialogOpen(false);
      toast.success(`Property "${selectedProperty.title}" has been rejected`);
      // In a real app, you would make an API call to update the property status
    }, 1500);
  };

  const handleDownloadImage = (imageUrl: string, index: number) => {
    // In a real app, you would implement proper image downloading
    toast.success(`Downloading image ${index + 1}`);
    
    // Create a temporary link to download the image
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `property-${selectedProperty.id}-image-${index + 1}.jpg`;
    a.click();
  };

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
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Placeholder for API-based fetching */}
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
                      {selectedProperty.location}
                    </p>
                  </div>
                  
                  <Tabs defaultValue="info">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="info">Information</TabsTrigger>
                      <TabsTrigger value="images">Images</TabsTrigger>
                      <TabsTrigger value="trust-levels">Trust Levels</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="info" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium mb-1">Property Owner</p>
                          <p className="text-sm">{selectedProperty.owner.name}</p>
                          <p className="text-sm text-airbnb-light">{selectedProperty.owner.email}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Submitted On</p>
                          <p className="text-sm">
                            {new Date(selectedProperty.submittedAt).toLocaleDateString()}, 
                            {" " + new Date(selectedProperty.submittedAt).toLocaleTimeString()}
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
                          <p className="text-sm">${selectedProperty.price} per night</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">Capacity</p>
                          <p className="text-sm">
                            {selectedProperty.beds} beds • {selectedProperty.baths} baths • {selectedProperty.guests} guests
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-1">Amenities</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedProperty.amenities.map((amenity: string) => (
                            <Badge key={amenity} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="images">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {selectedProperty.images.map((image: string, index: number) => (
                          <div key={index} className="relative group">
                            <img 
                              src={image} 
                              alt={`${selectedProperty.title} - Image ${index + 1}`}
                              className="w-full h-48 object-cover rounded-md"
                            />
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDownloadImage(image, index)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="trust-levels">
                      <div className="space-y-4 mt-4">
                        <p className="text-sm">
                          The owner has defined the following trust levels and discounts:
                        </p>
                        
                        <div className="divide-y">
                          {selectedProperty.trustLevels.map((level: any) => (
                            <div key={level.name} className="flex justify-between items-center py-2">
                              <span className="font-medium">{level.name}</span>
                              <Badge variant="outline">{level.discount}% discount</Badge>
                            </div>
                          ))}
                        </div>
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
                  Create Beds24 property and generate voucher codes
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
                        <div>{selectedProperty?.owner.name}</div>
                        <div className="text-airbnb-light">Account:</div>
                        <div>**** 5678</div>
                        <div className="text-airbnb-light">Reference:</div>
                        <div>PROP-{selectedProperty?.id}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="space-y-2 mb-4">
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
                    
                    {selectedProperty && (
                      <div className="border rounded-md p-3 space-y-2 text-sm">
                        <p className="font-medium">Trust Level Vouchers to Create:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {selectedProperty.trustLevels.map((level: any) => (
                            <li key={level.name}>
                              {level.name}: {level.discount}% discount
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
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
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
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
                  disabled={isProcessing}
                >
                  {isProcessing ? (
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
