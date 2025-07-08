import { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";

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

const ManageProperties = () => {
  const [properties, setProperties] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProperties = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const response = await fetch(`/api/properties/?page=1&page_size=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProperties(data.results || []);
      } else {
        setProperties([]);
      }
    };
    fetchProperties();
  }, []);

  const handleToggleVisibility = async (propertyId: string, isVisible: boolean) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const response = await fetch(`/api/properties/${propertyId}/toggle_visibility/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_visible: !isVisible }),
    });
    if (response.ok) {
      toast.success('Property visibility updated!');
      // Refresh properties
      const updated = properties.map((p: any) =>
        p.id === propertyId ? { ...p, is_visible: !isVisible } : p
      );
      setProperties(updated);
    } else {
      toast.error('Failed to update property visibility.');
    }
  };

  return (
    <Layout hideFooter>
      <div className="flex">
        <Sidebar type="admin" />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-airbnb-dark">Manage Properties</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Manage property visibility
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
                Manage property visibility
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
                  {properties.map((property: any) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img src={property.images?.[0] || ''} alt={property.title} className="w-10 h-10 rounded-md object-cover" />
                          <span>{property.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{property.owner_name || 'N/A'}</TableCell>
                      <TableCell>{property.city}, {property.state}</TableCell>
                      <TableCell>${property.display_price || property.price_per_night}/night</TableCell>
                      <TableCell>
                        <Badge className={property.is_visible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {property.is_visible ? 'Visible' : 'Hidden'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleVisibility(property.id, property.is_visible)}
                        >
                          {property.is_visible ? 'Hide' : 'Show'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ManageProperties;
