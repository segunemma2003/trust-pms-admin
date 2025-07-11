import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Mail, 
  MoreHorizontal, 
  UserPlus, 
  Send, 
  Loader2, 
  Building, 
  Calendar, 
  RefreshCw, 
  X,
  User,
  Phone,
  MapPin,
  Eye,
  Star,
  DollarSign,
  Users,
  Home
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { userService, analyticsService, invitationService, propertyService } from "@/services/api";
import type { User as UserType } from "@/services/api";
import { usePropertiesByOwner } from "@/hooks/useQueries"; // Import the existing hook

// Define the extended user type with properties count
interface UserWithPropertiesCount extends UserType {
  properties_count: number;
}

const ManageOwners = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  const [isOwnerDetailsOpen, setIsOwnerDetailsOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Use the search users API to get owners
  const { 
    data: ownersResponse, 
    isLoading: ownersLoading, 
    error: ownersError,
    refetch: refetchOwners 
  } = useQuery({
    queryKey: ['owners'],
    queryFn: async () => {
      const result = await userService.getUsersByType('owner');
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  // Get dashboard metrics for stats
  const { 
    data: dashboardMetrics, 
    isLoading: metricsLoading 
  } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const result = await analyticsService.getDashboardMetrics();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  // Process owners data - handle both array and paginated response
  const owners: UserType[] = useMemo(() => {
    if (!ownersResponse) return [];
    
    // Handle both direct array and paginated response
    if (Array.isArray(ownersResponse)) {
      return ownersResponse;
    } else if (ownersResponse.results) {
      return ownersResponse.results;
    }
    
    return [];
  }, [ownersResponse]);

  const [propertyCounts, setPropertyCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!owners?.length) return;

    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      
      // Use Promise.all to fetch counts in parallel
      await Promise.all(
        owners.map(async (owner) => {
          try {
            const result = await propertyService.getPropertiesByOwner(owner.id);
            counts[owner.id] = result.data?.results?.length || 0;
          } catch (error) {
            console.error(`Failed to fetch properties for owner ${owner.id}:`, error);
            counts[owner.id] = 0;
          }
        })
      );

      setPropertyCounts(counts);
    };

    fetchCounts();
  }, [owners]);

  const ownersWithCounts = useMemo(() => {
    return owners.map(owner => ({
      ...owner,
      properties_count: propertyCounts[owner.id] || 0
    }));
  }, [owners, propertyCounts]);
  
  // Use dashboard metrics for stats
  const stats = {
    totalOwners: dashboardMetrics?.total_owners || 0,
    activeProperties: dashboardMetrics?.active_properties || 0,
    totalProperties: dashboardMetrics?.total_properties || 0,
    totalBookings: dashboardMetrics?.total_bookings || 0
  };

  // Filter owners based on search and status
  const filteredOwners = ownersWithCounts.filter((owner: UserWithPropertiesCount) => {
    const matchesSearch = searchQuery === "" || 
      owner.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || owner.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (field: string, value: string) => {
    setInviteForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await invitationService.createInvitation({
        email: inviteForm.email,
        invitee_name: inviteForm.name,
        invitation_type: 'owner',
        personal_message: inviteForm.message
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast.success('Invitation sent successfully!');
      setIsInviteModalOpen(false);
      setInviteForm({ name: '', email: '', message: '' });
      
      // Refetch owners to get updated data
      refetchOwners();
    } catch (error: any) {
      toast.error(`Failed to send invitation: ${error.message}`);
      console.error('Failed to send invitation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewOwnerDetails = (owner: any) => {
    setSelectedOwner(owner);
    setIsOwnerDetailsOpen(true);
  };

  const handleViewProperties = (ownerId: string) => {
    navigate(`/admin/properties?owner=${ownerId}`);
  };

  const handleResendInvitation = async (ownerId: string, ownerName: string) => {
    toast.info('Resend invitation is not implemented yet.');
  };

  const handleRefresh = () => {
    refetchOwners();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "suspended":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const loading = ownersLoading || metricsLoading;

  // Error handling
  if (ownersError && !loading) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Owners</h3>
                <p className="text-sm text-gray-600 mb-4">
                  There was an error loading the owners data. Please try again.
                </p>
                <Button onClick={handleRefresh} className="bg-airbnb-primary hover:bg-airbnb-primary/90">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-airbnb-primary mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Owners</h3>
                <p className="text-sm text-gray-600">
                  Fetching owner data and calculating metrics...
                </p>
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
              <h1 className="text-2xl font-bold text-airbnb-dark">Manage Owners</h1>
              <p className="text-sm text-airbnb-light mt-1">
                View and manage all property owners ({owners.length} total)
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
           
            </div>
          </div>

          {/* Owner Statistics - Updated to match your dashboard metrics response */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.totalOwners}</div>
                <div className="text-sm text-gray-600">Total Owners</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.activeProperties}</div>
                <div className="text-sm text-gray-600">Active</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.totalProperties}</div>
                <div className="text-sm text-gray-600">Properties</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-600">{stats.totalBookings}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Property Owners</CardTitle>
                  <CardDescription>
                    Manage owners and their properties on the platform
                  </CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search owners..."
                      className="pl-8 w-full sm:w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredOwners.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery || statusFilter !== "all" 
                      ? "No owners match your filters" 
                      : "No property owners yet"
                    }
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search criteria or filters to find owners." 
                      : "Start building your property network by inviting your first property owner to the platform."
                    }
                  </p>
                  {!searchQuery && statusFilter === "all" ? (
                    <Button 
                      onClick={() => setIsInviteModalOpen(true)}
                      className="bg-airbnb-primary hover:bg-airbnb-primary/90"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite First Owner
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setStatusFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Owner</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Properties</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOwners.map((owner: UserWithPropertiesCount) => {
                        const propertyCount = owner.properties_count;
                        
                        return (
                          <TableRow key={owner.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                  {owner.full_name?.charAt(0) || owner.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium">{owner.full_name || 'N/A'}</div>
                                  {owner.phone && (
                                    <div className="text-xs text-gray-500">{owner.phone}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="font-mono text-sm">{owner.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold">
                                  {owner.properties_count}
                                  {propertyCounts[owner.id] === undefined && (
                                    <Loader2 className="h-3 w-3 ml-1 animate-spin inline" />
                                  )}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {owner.properties_count === 1 ? 'property' : 'properties'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeClass(owner.status)}>
                                {owner.status.charAt(0).toUpperCase() + owner.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                {formatDate(owner.date_joined || owner.created_at || '')}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem 
                                    className="cursor-pointer"
                                  >
                                    <Link to={`/admin/owners/${owner.id}/properties`} className="cursor-pointer flex items-center w-full">
                                      <Building className="h-4 w-4 mr-2" />
                                      View Properties ({propertyCount})
                                    </Link>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {filteredOwners.length > 0 && (
                    <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
                      <div>
                        Showing {filteredOwners.length} of {owners.length} owners
                      </div>
                      {(searchQuery || statusFilter !== "all") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                          }}
                          className="text-airbnb-primary hover:text-airbnb-primary/80"
                        >
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ManageOwners;