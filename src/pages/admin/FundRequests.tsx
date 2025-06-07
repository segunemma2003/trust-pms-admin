
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CreditCard,
  Upload,
  Check,
  X,
  Loader2,
  Calendar,
  ChevronDown,
  FileText,
  Download,
  User,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock fund requests data
const fundRequests = [
  {
    id: "FR001",
    owner: {
      id: "owner1",
      name: "John Smith",
      email: "john@example.com"
    },
    amount: 1250,
    status: "pending",
    requestDate: "2025-05-15T10:30:00Z",
    properties: ["Luxury Beach House"],
    bankDetails: {
      accountName: "John Smith",
      accountNumber: "**** 4587",
      bankName: "Chase Bank",
      routingNumber: "****9876",
      swiftCode: "CHASUS33"
    }
  },
  {
    id: "FR002",
    owner: {
      id: "owner2",
      name: "Sarah Johnson",
      email: "sarah@example.com"
    },
    amount: 850,
    status: "approved",
    requestDate: "2025-05-12T14:15:00Z",
    processedDate: "2025-05-13T09:30:00Z",
    properties: ["Mountain Retreat Cabin"],
    bankDetails: {
      accountName: "Sarah Johnson",
      accountNumber: "**** 7891",
      bankName: "Bank of America",
      routingNumber: "****1234",
      swiftCode: "BOFAUS3N"
    },
    receipt: "https://images.unsplash.com/photo-1572376313139-36b0ebaed396?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  },
  {
    id: "FR003",
    owner: {
      id: "owner3",
      name: "Michael Brown",
      email: "michael@example.com"
    },
    amount: 1840,
    status: "rejected",
    requestDate: "2025-05-10T16:45:00Z",
    processedDate: "2025-05-11T11:20:00Z",
    properties: ["Downtown Luxury Apartment", "Seaside Cottage"],
    bankDetails: {
      accountName: "Michael Brown",
      accountNumber: "**** 5432",
      bankName: "Wells Fargo",
      routingNumber: "****5678",
      swiftCode: "WFBIUS6S"
    },
    rejectionReason: "Incorrect bank information provided. Please update your banking details and resubmit."
  },
  {
    id: "FR004",
    owner: {
      id: "owner4",
      name: "Emily Davis",
      email: "emily@example.com"
    },
    amount: 980,
    status: "pending",
    requestDate: "2025-05-16T08:15:00Z",
    properties: ["Forest Cabin", "City Studio"],
    bankDetails: {
      accountName: "Emily Davis",
      accountNumber: "**** 3456",
      bankName: "Citibank",
      routingNumber: "****2345",
      swiftCode: "CITIUS33"
    }
  },
  {
    id: "FR005",
    owner: {
      id: "owner5",
      name: "James Wilson",
      email: "james@example.com"
    },
    amount: 1450,
    status: "approved",
    requestDate: "2025-05-08T11:30:00Z",
    processedDate: "2025-05-09T14:15:00Z",
    properties: ["Lakefront Cottage"],
    bankDetails: {
      accountName: "James Wilson",
      accountNumber: "**** 7890",
      bankName: "TD Bank",
      routingNumber: "****3456",
      swiftCode: "TDOMCATT"
    },
    receipt: "https://images.unsplash.com/photo-1661956602868-6ae368943878?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
  }
];

const FundRequests = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isRejectionOpen, setIsRejectionOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };
  
  const handleApproveDialog = (request: any) => {
    setSelectedRequest(request);
    setIsApprovalOpen(true);
  };
  
  const handleRejectDialog = (request: any) => {
    setSelectedRequest(request);
    setIsRejectionOpen(true);
  };
  
  const handleViewReceipt = (request: any) => {
    setSelectedRequest(request);
    setIsReceiptOpen(true);
  };
  
  const handleApproveRequest = () => {
    if (!receiptFile) {
      toast.error("Please upload a payment receipt");
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsApprovalOpen(false);
      toast.success(`Payment for ${selectedRequest.owner.name} has been approved`);
      // In a real app, you would update the request status via API
    }, 1500);
  };
  
  const handleRejectRequest = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsRejectionOpen(false);
      toast.success(`Payment request from ${selectedRequest.owner.name} has been rejected`);
      // In a real app, you would update the request status via API
    }, 1500);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };
  
  // Apply filters
  const filteredRequests = fundRequests.filter(request => 
    (searchQuery === "" || 
      request.owner.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      request.id.toLowerCase().includes(searchQuery.toLowerCase())
    ) && 
    (statusFilter === null || request.status === statusFilter)
  );

  return (
    <Layout userType="admin" hideFooter>
      <div className="flex">
        <Sidebar type="admin" />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-airbnb-dark">Fund Requests</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Review and process payment requests from owners
              </p>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Payment Requests</CardTitle>
                  <CardDescription>
                    {filteredRequests.length} total requests
                  </CardDescription>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full md:w-auto flex items-center justify-between gap-2">
                        <span>Status: {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : 'All'}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                        All
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("approved")}>
                        Approved
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>
                        Rejected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{request.owner.name}</span>
                          <span className="text-xs text-muted-foreground">{request.owner.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>${request.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        {new Date(request.requestDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            request.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : request.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {request.properties.length === 1 
                          ? request.properties[0] 
                          : `${request.properties[0]} +${request.properties.length - 1}`
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {request.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleApproveDialog(request)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleRejectDialog(request)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          {request.status === "approved" && request.receipt && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReceipt(request)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Request Details Dialog */}
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Payment Request Details</DialogTitle>
                <DialogDescription>
                  {selectedRequest && `Request ID: ${selectedRequest.id}`}
                </DialogDescription>
              </DialogHeader>
              
              {selectedRequest && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Owner</p>
                      <p className="text-base">{selectedRequest.owner.name}</p>
                      <p className="text-xs text-airbnb-light">{selectedRequest.owner.email}</p>
                    </div>
                    <Badge
                      className={
                        selectedRequest.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : selectedRequest.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Request Details</p>
                    <div className="border rounded-md divide-y">
                      <div className="flex justify-between py-2 px-3">
                        <span className="text-airbnb-light">Amount</span>
                        <span className="font-medium">${selectedRequest.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 px-3">
                        <span className="text-airbnb-light">Request Date</span>
                        <span>{new Date(selectedRequest.requestDate).toLocaleDateString()}</span>
                      </div>
                      {selectedRequest.processedDate && (
                        <div className="flex justify-between py-2 px-3">
                          <span className="text-airbnb-light">Processed Date</span>
                          <span>{new Date(selectedRequest.processedDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Properties</p>
                    <div className="border rounded-md p-3">
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedRequest.properties.map((property: string, index: number) => (
                          <li key={index} className="text-sm">
                            {property}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium mb-1">Bank Information</p>
                    <div className="border rounded-md divide-y">
                      <div className="flex justify-between py-2 px-3">
                        <span className="text-airbnb-light">Account Name</span>
                        <span>{selectedRequest.bankDetails.accountName}</span>
                      </div>
                      <div className="flex justify-between py-2 px-3">
                        <span className="text-airbnb-light">Account Number</span>
                        <span>{selectedRequest.bankDetails.accountNumber}</span>
                      </div>
                      <div className="flex justify-between py-2 px-3">
                        <span className="text-airbnb-light">Bank Name</span>
                        <span>{selectedRequest.bankDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between py-2 px-3">
                        <span className="text-airbnb-light">Routing Number</span>
                        <span>{selectedRequest.bankDetails.routingNumber}</span>
                      </div>
                      <div className="flex justify-between py-2 px-3">
                        <span className="text-airbnb-light">Swift Code</span>
                        <span>{selectedRequest.bankDetails.swiftCode}</span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedRequest.status === "rejected" && selectedRequest.rejectionReason && (
                    <div>
                      <p className="text-sm font-medium mb-1">Rejection Reason</p>
                      <div className="border rounded-md p-3 bg-red-50 text-red-800 text-sm">
                        {selectedRequest.rejectionReason}
                      </div>
                    </div>
                  )}
                  
                  {selectedRequest.status === "approved" && selectedRequest.receipt && (
                    <div>
                      <p className="text-sm font-medium mb-1">Payment Receipt</p>
                      <div className="border rounded-md p-3">
                        <Button 
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-2"
                          onClick={() => handleViewReceipt(selectedRequest)}
                        >
                          <FileText className="h-4 w-4" />
                          View Receipt
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <DialogFooter>
                <Button onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Approval Dialog */}
          <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Approve Payment Request</DialogTitle>
                <DialogDescription>
                  Complete payment and upload receipt for confirmation
                </DialogDescription>
              </DialogHeader>
              
              {selectedRequest && (
                <div className="space-y-4 py-2">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium">Payment Information</h3>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm">
                      <div className="text-airbnb-light">Amount:</div>
                      <div className="font-medium">${selectedRequest.amount.toLocaleString()}</div>
                      
                      <div className="text-airbnb-light">To Account Name:</div>
                      <div>{selectedRequest.bankDetails.accountName}</div>
                      
                      <div className="text-airbnb-light">Bank Name:</div>
                      <div>{selectedRequest.bankDetails.bankName}</div>
                      
                      <div className="text-airbnb-light">Account Number:</div>
                      <div>{selectedRequest.bankDetails.accountNumber}</div>
                      
                      <div className="text-airbnb-light">Routing Number:</div>
                      <div>{selectedRequest.bankDetails.routingNumber}</div>
                      
                      <div className="text-airbnb-light">Swift Code:</div>
                      <div>{selectedRequest.bankDetails.swiftCode}</div>
                      
                      <div className="text-airbnb-light">Reference:</div>
                      <div>OIFYK-{selectedRequest.id}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="receipt">Upload Payment Receipt</Label>
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
                        onChange={handleFileChange}
                      />
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => document.getElementById('receipt-upload')?.click()}
                      >
                        Select File
                      </Button>
                      {receiptFile && (
                        <p className="mt-2 text-sm text-green-600">
                          {receiptFile.name} ({(receiptFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsApprovalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleApproveRequest} 
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Confirm Payment
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Rejection Dialog */}
          <Dialog open={isRejectionOpen} onOpenChange={setIsRejectionOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reject Payment Request</DialogTitle>
                <DialogDescription>
                  Please provide a reason for rejecting this payment request
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                  <textarea
                    id="rejection-reason"
                    rows={4}
                    placeholder="Explain why this payment request is being rejected..."
                    className="w-full border border-input rounded-md p-3 resize-none"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsRejectionOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleRejectRequest} 
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Reject Request'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Receipt View Dialog */}
          <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Payment Receipt</DialogTitle>
                <DialogDescription>
                  {selectedRequest && `Request ID: ${selectedRequest.id}`}
                </DialogDescription>
              </DialogHeader>
              
              {selectedRequest && selectedRequest.receipt && (
                <div className="space-y-4">
                  <div className="border rounded-md overflow-hidden">
                    <img 
                      src={selectedRequest.receipt} 
                      alt="Payment Receipt" 
                      className="w-full h-auto"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <span className="text-airbnb-light">Payment Date: </span>
                      <span>{new Date(selectedRequest.processedDate).toLocaleDateString()}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => toast.success("Receipt downloaded successfully")}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button onClick={() => setIsReceiptOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default FundRequests;
