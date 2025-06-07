
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar,
  Check,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Filter,
  Loader2,
  User,
  X,
} from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock withdrawal request data
const initialWithdrawals = [
  {
    id: "1",
    owner: "John Doe",
    ownerId: "owner1",
    amount: 500.00,
    requestDate: "2025-05-18",
    bankName: "Chase Bank",
    accountName: "John Doe",
    accountNumber: "******1234",
    status: "pending",
  },
  {
    id: "2",
    owner: "Jane Smith",
    ownerId: "owner2",
    amount: 750.00,
    requestDate: "2025-05-17",
    bankName: "Bank of America",
    accountName: "Jane Smith",
    accountNumber: "******5678",
    status: "pending",
  },
  {
    id: "3",
    owner: "Mark Wilson",
    ownerId: "owner3",
    amount: 320.50,
    requestDate: "2025-05-16",
    bankName: "Wells Fargo",
    accountName: "Mark Wilson",
    accountNumber: "******9012",
    status: "processed",
  },
  {
    id: "4",
    owner: "Sarah Johnson",
    ownerId: "owner4",
    amount: 600.00,
    requestDate: "2025-05-15",
    bankName: "Citibank",
    accountName: "Sarah Johnson",
    accountNumber: "******3456",
    status: "processed",
  },
  {
    id: "5",
    owner: "Robert Brown",
    ownerId: "owner5",
    amount: 125.75,
    requestDate: "2025-05-14",
    bankName: "TD Bank",
    accountName: "Robert Brown",
    accountNumber: "******7890",
    status: "rejected",
  },
];

const PaymentRequests = () => {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<(typeof initialWithdrawals)[0] | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filteredWithdrawals = filterStatus
    ? withdrawals.filter(w => w.status === filterStatus)
    : withdrawals;

  const handleViewDetails = (withdrawal: (typeof withdrawals)[0]) => {
    setSelectedWithdrawal(withdrawal);
    setIsDetailDialogOpen(true);
  };

  const handleApprove = (id: string) => {
    setIsProcessing(true);

    // Simulate API request with timeout
    setTimeout(() => {
      const updatedWithdrawals = withdrawals.map(w => 
        w.id === id ? { ...w, status: "processed" } : w
      );
      
      setWithdrawals(updatedWithdrawals);
      toast.success("Payment request approved successfully");
      setIsProcessing(false);
      setIsDetailDialogOpen(false);
    }, 1500);
  };

  const handleReject = (id: string) => {
    setIsProcessing(true);

    // Simulate API request with timeout
    setTimeout(() => {
      const updatedWithdrawals = withdrawals.map(w => 
        w.id === id ? { ...w, status: "rejected" } : w
      );
      
      setWithdrawals(updatedWithdrawals);
      toast.success("Payment request rejected");
      setIsProcessing(false);
      setIsDetailDialogOpen(false);
    }, 1500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate total pending withdrawals
  const totalPendingAmount = withdrawals
    .filter(w => w.status === "pending")
    .reduce((acc, w) => acc + w.amount, 0);

  return (
    <Layout userType="admin" hideFooter>
      <div className="flex">
        <Sidebar type="admin" />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-airbnb-dark">Payment Requests</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Manage owner withdrawal requests
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {filterStatus ? `Filter: ${filterStatus}` : "Filter"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                    All Requests
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("pending")}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("processed")}>
                    Processed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus("rejected")}>
                    Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-full">
                      <Loader2 className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-amber-800 font-medium">Pending Requests</p>
                      <p className="text-xl font-bold text-amber-900">
                        {withdrawals.filter(w => w.status === "pending").length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Total Pending Amount</p>
                      <p className="text-xl font-bold text-blue-900">
                        {formatCurrency(totalPendingAmount)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-green-800 font-medium">Processed This Month</p>
                      <p className="text-xl font-bold text-green-900">
                        {withdrawals.filter(w => w.status === "processed").length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Withdrawal Requests
              </CardTitle>
              <CardDescription>
                Review and process owner payment requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Owner</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-airbnb-light" />
                          <span className="font-medium">{withdrawal.owner}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(withdrawal.amount)}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-airbnb-light" />
                        {formatDate(withdrawal.requestDate)}
                      </TableCell>
                      <TableCell>
                        {withdrawal.bankName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            withdrawal.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : withdrawal.status === "processed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(withdrawal)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Withdrawal Detail Dialog */}
          <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Withdrawal Request Details</DialogTitle>
                <DialogDescription>
                  Review and process payment request.
                </DialogDescription>
              </DialogHeader>
              
              {selectedWithdrawal && (
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-airbnb-light mb-1">Owner</p>
                      <p className="font-medium">{selectedWithdrawal.owner}</p>
                    </div>
                    <div>
                      <p className="text-sm text-airbnb-light mb-1">Request Date</p>
                      <p className="font-medium">{formatDate(selectedWithdrawal.requestDate)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-airbnb-light mb-1">Amount</p>
                    <p className="text-xl font-bold text-airbnb-primary">
                      {formatCurrency(selectedWithdrawal.amount)}
                    </p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md space-y-3">
                    <h4 className="font-medium">Bank Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-airbnb-light mb-1">Bank Name</p>
                        <p className="text-sm">{selectedWithdrawal.bankName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-airbnb-light mb-1">Account Number</p>
                        <p className="text-sm">{selectedWithdrawal.accountNumber}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-airbnb-light mb-1">Account Holder</p>
                      <p className="text-sm">{selectedWithdrawal.accountName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-airbnb-light" />
                    <span className="text-sm text-airbnb-light">Request ID: {selectedWithdrawal.id}</span>
                  </div>
                  
                  {selectedWithdrawal.status === "pending" && (
                    <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => handleReject(selectedWithdrawal.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </>
                        )}
                      </Button>
                      <Button
                        className="w-full sm:w-auto flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(selectedWithdrawal.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Approve Payment
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentRequests;
