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
  Loader2,
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
import { useProperties, useUpdateProperty } from "@/hooks/useQueries";

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
  const { user } = useAuth();
  const { data: propertiesData, isLoading, error, refetch } = useProperties();
  const updatePropertyMutation = useUpdateProperty();

  const properties = propertiesData?.data?.results || [];

  const handleToggleVisibility = async (propertyId: string, isVisible: boolean) => {
    try {
      await updatePropertyMutation.mutateAsync({
        id: propertyId,
        updates: { is_visible: !isVisible }
      });
      
      // Refetch properties to get updated data
      refetch();
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      // Error is already handled by the mutation hook
    }
  };

  if (isLoading) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-red-600 mb-4">Failed to load properties</p>
                <Button onClick={() => refetch()} variant="outline">
                  Try Again
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
                Manage property visibility ({properties.length} properties)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {properties.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No properties found</p>
                </div>
              ) : (
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
                            {property.images?.[0] && (
                              <img 
                                src={property.images[0].image_url || property.images[0]} 
                                alt={property.title} 
                                className="w-10 h-10 rounded-md object-cover" 
                              />
                            )}
                            <span className="font-medium">{property.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{property.owner_name || 'N/A'}</TableCell>
                        <TableCell>
                          {property.city}
                          {property.state && `, ${property.state}`}
                        </TableCell>
                        <TableCell>
                          ${property.display_price || property.price_per_night}/night
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={property.status === 'active' ? 'default' : 'secondary'}
                            className={
                              property.status === 'active' 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {property.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleVisibility(property.id, property.status === 'active')}
                            disabled={updatePropertyMutation.isPending}
                          >
                            {updatePropertyMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                {property.status === 'active' ? (
                                  <>
                                    <Eye className="h-4 w-4 mr-1" />
                                    Hide
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-1" />
                                    Show
                                  </>
                                )}
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ManageProperties;