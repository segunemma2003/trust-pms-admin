
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Calendar,
  CircleDollarSign, 
  CreditCard, 
  DollarSign,
  FileText,  
  Loader2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define the schema for withdrawal form
const withdrawalFormSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, {
    message: "Please enter a valid amount greater than 0.",
  }),
  bankName: z.string().min(2, {
    message: "Bank name must be at least 2 characters.",
  }),
  accountName: z.string().min(2, {
    message: "Account name must be at least 2 characters.",
  }),
  accountNumber: z.string().min(5, {
    message: "Please enter a valid account number.",
  }),
});

type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

// Mock transaction data
const initialTransactions = [
  { 
    id: "1", 
    type: "booking", 
    amount: 240.50, 
    date: "2025-05-15", 
    property: "Luxury Beach Villa", 
    status: "completed" 
  },
  { 
    id: "2", 
    type: "withdrawal", 
    amount: 500.00, 
    date: "2025-05-10", 
    property: null, 
    status: "processing" 
  },
  { 
    id: "3", 
    type: "booking", 
    amount: 180.75, 
    date: "2025-05-08", 
    property: "Mountain Cabin Retreat", 
    status: "completed" 
  },
  { 
    id: "4", 
    type: "withdrawal", 
    amount: 300.00, 
    date: "2025-05-02", 
    property: null, 
    status: "completed" 
  },
];

const Payments = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      amount: "",
      bankName: "",
      accountName: "",
      accountNumber: "",
    },
  });

  // Calculate balance
  const balance = transactions.reduce((acc, transaction) => {
    if (transaction.type === "booking") {
      return acc + transaction.amount;
    } else if (transaction.type === "withdrawal" && transaction.status !== "rejected") {
      return acc - transaction.amount;
    }
    return acc;
  }, 0);

  // Calculate pending withdrawals
  const pendingWithdrawals = transactions
    .filter(t => t.type === "withdrawal" && t.status === "processing")
    .reduce((acc, t) => acc + t.amount, 0);

  // Calculate available balance
  const availableBalance = balance - pendingWithdrawals;

  const onSubmitWithdrawal = (values: WithdrawalFormValues) => {
    setIsWithdrawing(true);

    // Simulate API request with timeout
    setTimeout(() => {
      const amount = parseFloat(values.amount);
      
      if (amount > availableBalance) {
        toast.error("Withdrawal amount exceeds available balance");
        setIsWithdrawing(false);
        return;
      }

      const newWithdrawal = {
        id: Date.now().toString(),
        type: "withdrawal",
        amount,
        date: new Date().toISOString().split('T')[0],
        property: null,
        status: "processing"
      };

      setTransactions([newWithdrawal, ...transactions]);
      toast.success("Withdrawal request submitted successfully");
      form.reset();
      setIsWithdrawing(false);
      setIsWithdrawDialogOpen(false);
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

  return (
    <Layout userType="owner" hideFooter>
      <div className="flex">
        <Sidebar type="owner" />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-airbnb-dark">Payments</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Manage your earnings and withdrawals
              </p>
            </div>
            
            <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0 bg-airbnb-primary hover:bg-airbnb-primary/90 flex items-center gap-2">
                  <ArrowDownCircle className="h-4 w-4" />
                  Request Withdrawal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Request Withdrawal</DialogTitle>
                  <DialogDescription>
                    Enter the amount you'd like to withdraw and your bank details.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitWithdrawal)} className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount to Withdraw</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input 
                                placeholder="0.00" 
                                className="pl-10" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-airbnb-light mt-1">
                            Available balance: {formatCurrency(availableBalance)}
                          </p>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter bank name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="accountName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Holder Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter account name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter account number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter className="mt-6">
                      <Button 
                        type="submit" 
                        disabled={isWithdrawing}
                        className="w-full"
                      >
                        {isWithdrawing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Request Withdrawal"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-airbnb-light">
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
                  <div className="h-12 w-12 bg-airbnb-primary/10 rounded-full flex items-center justify-center">
                    <CircleDollarSign className="h-6 w-6 text-airbnb-primary" />
                  </div>
                </div>
                <p className="text-xs text-airbnb-light mt-2">
                  All time earnings
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-airbnb-light">
                  Available Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatCurrency(availableBalance)}</div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ArrowDownCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-airbnb-light mt-2">
                  Ready to withdraw
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-airbnb-light">
                  Pending Withdrawals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatCurrency(pendingWithdrawals)}</div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-xs text-airbnb-light mt-2">
                  Being processed
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                Recent bookings and withdrawal requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.type === "booking" ? (
                            <ArrowUpCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDownCircle className="h-4 w-4 text-airbnb-primary" />
                          )}
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.type === "booking" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-airbnb-light" />
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>
                        {transaction.property || "Bank withdrawal"}
                      </TableCell>
                      <TableCell>
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
                <CardDescription>
                  Important information regarding payments
                </CardDescription>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <ul className="space-y-2 text-airbnb-light">
                  <li>Withdrawal requests are processed within 3-5 business days.</li>
                  <li>Minimum withdrawal amount is $50.00.</li>
                  <li>Make sure your bank details are correct before requesting a withdrawal.</li>
                  <li>All earnings from bookings are automatically added to your balance after guests check-in.</li>
                  <li>For any payment-related questions, please contact our support team.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payments;
