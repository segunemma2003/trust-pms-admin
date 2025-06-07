
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
import {
  Check,
  ChevronDown,
  ExternalLink,
  Eye,
  Home,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Define the schema for voucher form
const voucherFormSchema = z.object({
  voucherCode: z.string().min(3, {
    message: "Voucher code must be at least 3 characters.",
  }),
  discountPercent: z.string().refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num > 0 && num <= 100;
  }, {
    message: "Discount must be between 1 and 100 percent.",
  }),
  trustLevel: z.string().min(1, {
    message: "Trust level must be selected.",
  }),
});

type VoucherFormValues = z.infer<typeof voucherFormSchema>;

// Mock properties data
const initialProperties = [
  {
    id: "1",
    title: "Luxury Beach Villa",
    owner: "John Doe",
    location: "Miami, FL",
    pricePerNight: 250,
    status: "pending",
    submittedAt: "2025-05-15",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "2",
    title: "Mountain Cabin Retreat",
    owner: "Sarah Wilson",
    location: "Aspen, CO",
    pricePerNight: 180,
    status: "approved",
    submittedAt: "2025-05-10",
    imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "3",
    title: "Downtown Apartment",
    owner: "Mark Johnson",
    location: "New York, NY",
    pricePerNight: 210,
    status: "pending",
    submittedAt: "2025-05-18",
    imageUrl: "https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  },
];

// Mock trust levels for dropdown
const trustLevels = [
  { id: "1", name: "Family", level: 5 },
  { id: "2", name: "Close Friends", level: 4 },
  { id: "3", name: "Friends", level: 3 },
  { id: "4", name: "Acquaintances", level: 2 },
  { id: "5", name: "First Time", level: 1 },
];

const ManageProperties = () => {
  const [properties, setProperties] = useState(initialProperties);
  const [selectedProperty, setSelectedProperty] = useState<(typeof initialProperties)[0] | null>(null);
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState(false);

  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherFormSchema),
    defaultValues: {
      voucherCode: "",
      discountPercent: "",
      trustLevel: "",
    },
  });

  const handleApprove = (property: (typeof initialProperties)[0]) => {
    setSelectedProperty(property);
    setIsVoucherDialogOpen(true);
  };

  const submitVoucher = (values: VoucherFormValues) => {
    if (!selectedProperty) return;

    // In a real app, this would create vouchers in Beds24 and update the property status

    // Update property status to approved
    const updatedProperties = properties.map((p) => 
      p.id === selectedProperty.id ? { ...p, status: "approved" } : p
    );
    
    setProperties(updatedProperties);
    toast.success(`Property approved and voucher created: ${values.voucherCode}`);
    
    setIsVoucherDialogOpen(false);
    form.reset();
  };

  const handleReject = (id: string) => {
    // In a real app, this would update the property status via API
    const updatedProperties = properties.map((p) => 
      p.id === id ? { ...p, status: "rejected" } : p
    );
    
    setProperties(updatedProperties);
    toast.success("Property rejected");
  };

  return (
    <Layout userType="admin" hideFooter>
      <div className="flex">
        <Sidebar type="admin" />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-airbnb-dark">Manage Properties</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Review and approve property submissions
              </p>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property Submissions
              </CardTitle>
              <CardDescription>
                Review owner-suggested properties and create vouchers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={property.imageUrl}
                            alt={property.title}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                          <span className="font-medium">{property.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{property.owner}</TableCell>
                      <TableCell>{property.location}</TableCell>
                      <TableCell>${property.pricePerNight}/night</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            property.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : property.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {property.status === "pending" ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleApprove(property)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleReject(property.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="flex items-center gap-2">
                                <ExternalLink className="h-4 w-4" />
                                View on Beds24
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Voucher Creation Dialog */}
          <Dialog open={isVoucherDialogOpen} onOpenChange={setIsVoucherDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Discount Vouchers</DialogTitle>
                <DialogDescription>
                  Create vouchers for each trust level for "{selectedProperty?.title}"
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(submitVoucher)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="trustLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trust Level</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            {...field}
                          >
                            <option value="">Select a trust level</option>
                            {trustLevels.map(level => (
                              <option key={level.id} value={level.id}>
                                {level.name} (Level {level.level})
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="voucherCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Voucher Code</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. FAMILY20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discountPercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Percentage</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Input 
                                type="number" 
                                placeholder="0" 
                                {...field} 
                              />
                              <span className="ml-2">%</span>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter className="mt-6">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsVoucherDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Create & Approve</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default ManageProperties;
