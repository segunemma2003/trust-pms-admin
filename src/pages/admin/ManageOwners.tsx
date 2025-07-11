import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
  Check, 
  X, 
  UserPlus, 
  Send, 
  Loader2, 
  Building, 
  Calendar, 
  RefreshCw,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  Eye,
  MessageSquare,
  Settings
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  useUsersByType,
  useDashboardMetrics,
  useCreateInvitation,
  useResendInvitationByEmail,
  useUpdateOwnerStatus,
  useSendOwnerMessage,
  useProperties
} from "@/hooks/useQueries";

const ManageOwners = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<any>(null);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [messageForm, setMessageForm] = useState({
    subject: "",
    message: ""
  });

  const { user } = useAuth();

  // Use the existing hook to fetch owners (users with user_type == 'owner')
  const { 
    data: ownersData, 
    isLoading: ownersLoading, 
    error: ownersError,
    refetch: refetchOwners 
  } = useUsersByType('owner');

  const { 
    data: dashboardData, 
    isLoading: dashboardLoading 
  } = useDashboardMetrics();

  const { 
    data: propertiesData, 
    isLoading: propertiesLoading 
  } = useProperties();

  // Mutations
  const createInvitationMutation = useCreateInvitation();
  const resendInvitationMutation = useResendInvitationByEmail();
  const updateOwnerStatusMutation = useUpdateOwnerStatus();
  const sendMessageMutation = useSendOwnerMessage();

  // Process the owners data - handle different response formats
  const owners = useMemo(() => {
    if (!ownersData) return [];
    
    // Handle paginated response with results
    if (ownersData.results && Array.isArray(ownersData.results)) {
      return ownersData.results;
    }
    
    // Handle direct array response
    if (Array.isArray(ownersData)) {
      return ownersData;
    }
    
    // Handle nested data structure
    if (ownersData.data) {
      if (Array.isArray(ownersData.data.results)) {
        return ownersData.data.results;
      }
      if (Array.isArray(ownersData.data)) {
        return ownersData.data;
      }
    }
    
    return [];
  }, [ownersData]);

  // Process properties data for counting
  const properties = useMemo(() => {
    if (!propertiesData?.results) return [];
    return propertiesData.results;
  }, [propertiesData]);

  // Calculate enhanced stats
  const stats = useMemo(() => {
    console.log('Owners data:', ownersData); // Debug log
    console.log('Processed owners:', owners); // Debug log
    
    const totalOwners = owners.length;
    const activeOwners = owners.filter((o: any) => o.status === 'active').length;
    const pendingOwners = owners.filter((o: any) => o.status === 'pending').length;
    const verifiedOwners = owners.filter((o: any) => o.email_verified).length;
    
    return {
      totalOwners,
      activeOwners,
      pendingOwners,
      verifiedOwners,
      verificationRate: totalOwners > 0 ? Math.round((verifiedOwners / totalOwners) * 100) : 0,
      // Get additional stats from dashboard if available
      totalProperties: dashboardData?.total_properties || properties.length,
      activeProperties: dashboardData?.active_properties || properties.filter(p => p.status === 'active').length,
      totalBookings: dashboardData?.total_bookings || 0
    };
  }, [owners, dashboardData, properties, ownersData]);

  // Enhanced filtering - client-side since we're loading all owners
  const filteredOwners = useMemo(() => {
    return owners.filter((owner: any) => {
      // Search filter - check name and email
      const matchesSearch = !searchQuery || 
        owner.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        owner.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || owner.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [owners, searchQuery, statusFilter]);

  // Get property count for an owner
  const getOwnerPropertyCount = (ownerId: string) => {
    return properties.filter((property: any) => property.owner === ownerId).length;
  };

  const handleInputChange = (field: string, value: string) => {
    setInviteForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMessageInputChange = (field: string, value: string) => {
    setMessageForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createInvitationMutation.mutateAsync({
        email: inviteForm.email,
        invitee_name: inviteForm.name,
        invitation_type: 'owner',
        personal_message: inviteForm.message
      });
      
      setIsInviteModalOpen(false);
      setInviteForm({ name: '', email: '', message: '' });
      refetchOwners();
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOwner) return;

    try {
      await sendMessageMutation.mutateAsync({
        ownerId: selectedOwner.id,
        subject: messageForm.subject,
        message: messageForm.message
      });
      
      setIsMessageModalOpen(false);
      setMessageForm({ subject: '', message: '' });
      setSelectedOwner(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleResendInvitation = async (ownerEmail: string, ownerName: string) => {
    try {
      await resendInvitationMutation.mutateAsync({
        email: ownerEmail,
        invitationType: 'owner'
      });
    } catch (error) {
      console.error('Failed to resend invitation:', error);
    }
  };

  const handleStatusUpdate = async (ownerId: string, newStatus: string) => {
    try {
      await updateOwnerStatusMutation.mutateAsync({
        ownerId,
        status: newStatus
      });
      refetchOwners();
    } catch (error) {
      console.error('Failed to update owner status:', error);
    }
  };

  const handleOpenMessage = (owner: any) => {
    setSelectedOwner(owner);
    setMessageForm({
      subject: `Message from ${user?.full_name || 'OIFYK Admin'}`,
      message: `Hi ${owner.full_name || 'there'},\n\n`
    });
    setIsMessageModalOpen(true);
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

  const formatLastSeen = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
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

  const loading = ownersLoading || dashboardLoading || propertiesLoading;

  // Error handling
  if (ownersError && !loading) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Owners</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {ownersError.message || 'There was an error loading the owners data. Please try again.'}
                </p>
                <Button onClick={handleRefresh} className="bg-red-600 hover:bg-red-700">
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
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Owners</h3>
                <p className="text-sm text-gray-600">
                  Fetching owner data and platform statistics...
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
              <h1 className="text-2xl font-bold text-gray-900">Manage Owners</h1>
              <p className="text-sm text-gray-600 mt-1">
                View and manage all property owners ({stats.totalOwners} total)
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <Button 
                variant="outline"
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite New Owner
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-600" />
                      Invite Property Owner
                    </DialogTitle>
                    <DialogDescription>
                      Send an invitation to a potential property owner to join the OIFYK platform.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleInviteSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={inviteForm.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={inviteForm.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Personal Message (Optional)</Label>
                      <Textarea
                        id="message"
                        value={inviteForm.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Add a personal message to the invitation..."
                        rows={3}
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsInviteModalOpen(false)}
                        disabled={createInvitationMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={createInvitationMutation.isPending}
                      >
                        {createInvitationMutation.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Enhanced Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.totalOwners}</div>
                    <div className="text-sm text-gray-600">Total Owners</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.activeOwners}</div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.pendingOwners}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.verificationRate}%</div>
                    <div className="text-sm text-gray-600">Verified</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-indigo-600" />
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">{stats.totalProperties}</div>
                    <div className="text-sm text-gray-600">Properties</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">{stats.totalBookings}</div>
                    <div className="text-sm text-gray-600">Bookings</div>
                  </div>
                </div>
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
                      className="bg-blue-600 hover:bg-blue-700"
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
                        <TableHead>Contact</TableHead>
                        <TableHead>Properties</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Last Seen</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOwners.map((owner: any) => {
                        const propertyCount = getOwnerPropertyCount(owner.id);
                        
                        return (
                          <TableRow key={owner.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                  {owner.full_name?.charAt(0) || owner.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium">{owner.full_name || 'N/A'}</div>
                                  <div className="text-xs text-gray-500">
                                    ID: {owner.id.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span className="font-mono text-sm">{owner.email}</span>
                                </div>
                                {owner.phone && (
                                  <div className="text-xs text-gray-500">{owner.phone}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="font-semibold">{propertyCount}</span>
                                <span className="text-sm text-gray-500">
                                  {propertyCount === 1 ? 'property' : 'properties'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusBadgeClass(owner.status)}>
                                {owner.status.charAt(0).toUpperCase() + owner.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {owner.email_verified ? (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Check className="h-4 w-4" />
                                  <span className="text-sm font-medium">Yes</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-amber-600">
                                  <X className="h-4 w-4" />
                                  <span className="text-sm font-medium">Pending</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {formatLastSeen(owner.last_active_at)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                {formatDate(owner.date_joined || owner.created_at)}
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
                                    onClick={() => handleOpenMessage(owner)}
                                    className="cursor-pointer"
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => window.open(`/admin/all-properties?owner=${owner.id}`, '_blank')}
                                    className="cursor-pointer"
                                  >
                                    <Building className="h-4 w-4 mr-2" />
                                    View Properties ({propertyCount})
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  {owner.status === "pending" && (
                                    <DropdownMenuItem 
                                      onClick={() => handleResendInvitation(owner.email, owner.full_name || 'Owner')}
                                      className="cursor-pointer"
                                    >
                                      <UserPlus className="h-4 w-4 mr-2" />
                                      Resend Invitation
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => handleStatusUpdate(owner.id, owner.status === 'active' ? 'inactive' : 'active')}
                                    className="cursor-pointer"
                                  >
                                    {owner.status === 'active' ? (
                                      <>
                                        <X className="h-4 w-4 mr-2" />
                                        Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Activate
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/admin/users/${owner.id}`} className="cursor-pointer">
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Profile
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
                          className="text-blue-600 hover:text-blue-700"
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

          {/* Message Dialog */}
          <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Send Message to {selectedOwner?.full_name || selectedOwner?.email}
                </DialogTitle>
                <DialogDescription>
                  Send a message to this property owner through the platform.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={messageForm.subject}
                    onChange={(e) => handleMessageInputChange("subject", e.target.value)}
                    placeholder="Enter message subject"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={messageForm.message}
                    onChange={(e) => handleMessageInputChange("message", e.target.value)}
                    placeholder="Type your message..."
                    rows={6}
                    required
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsMessageModalOpen(false)}
                    disabled={sendMessageMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={sendMessageMutation.isPending}
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Message
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default ManageOwners;