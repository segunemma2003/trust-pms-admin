import { useState, useEffect } from "react";
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
import { Search, Mail, MoreHorizontal, Check, X, UserPlus, Send, Loader2, Building, Calendar, RefreshCw } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const ManageOwners = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [owners, setOwners] = useState([]);
  const [stats, setStats] = useState({ totalOwners: 0, activeOwners: 0, pendingOwners: 0, totalProperties: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOwners = async () => {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const response = await fetch(`/api/users/search/?user_type=owner&page=1&page_size=100`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOwners(data.results || []);
        setStats({
          totalOwners: data.count || 0,
          activeOwners: (data.results || []).filter((o: any) => o.status === 'active').length,
          pendingOwners: (data.results || []).filter((o: any) => o.status === 'pending').length,
          totalProperties: 0 // Optionally fetch from /api/properties/ and count by owner
        });
      } else {
        setOwners([]);
        setStats({ totalOwners: 0, activeOwners: 0, pendingOwners: 0, totalProperties: 0 });
      }
      setLoading(false);
    };
    fetchOwners();
  }, []);

  // Filter owners based on search and status
  const filteredOwners = (owners || []).filter((owner: any) => {
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
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const response = await fetch(`/api/invitations/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: inviteForm.email,
        invitee_name: inviteForm.name,
        invitation_type: 'owner',
        personal_message: inviteForm.message
      })
    });
    if (response.ok) {
      toast.success('Invitation sent successfully!');
      setIsInviteModalOpen(false);
      setInviteForm({ name: '', email: '', message: '' });
    } else {
      toast.error('Failed to send invitation.');
    }
  };

  const handleResendInvitation = async (ownerId: string, ownerName: string) => {
    toast.info('Resend invitation is not implemented yet.');
  };

  const handleSendMessage = (ownerName: string, ownerEmail: string) => {
    window.location.href = `mailto:${ownerEmail}?subject=Message from OIFYK Admin&body=Hi ${ownerName},%0D%0A%0D%0A`;
  };

  const handleViewProperties = (ownerId: string) => {
    window.open(`/admin/all-properties?owner=${ownerId}`, '_blank');
  };

  const handleRefresh = () => {
    window.location.reload();
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
                  Fetching owner data and calculating property counts...
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
                View and manage all property owners ({owners?.length || 0} total)
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
                  <Button className="bg-airbnb-primary hover:bg-airbnb-primary/90 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite New Owner
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-airbnb-primary" />
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
                    
                    {/* <div className="space-y-2">
                      <Label htmlFor="message">Personal Message (Optional)</Label>
                      <Textarea
                        id="message"
                        value={inviteForm.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Add a personal message to the invitation..."
                        rows={3}
                      />
                    </div> */}
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsInviteModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-airbnb-primary hover:bg-airbnb-primary/90"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Owner Statistics */}
          {!loading && stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalOwners}</div>
                  <div className="text-sm text-gray-600">Total Owners</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{stats.activeOwners}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingOwners}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalProperties}</div>
                  <div className="text-sm text-gray-600">Properties</div>
                </CardContent>
              </Card>
            </div>
          )}

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
                        <TableHead>Verified</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOwners.map((owner) => (
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
                              <span className="font-semibold">{owner.property_count}</span>
                              <span className="text-sm text-gray-500">
                                {owner.property_count === 1 ? 'property' : 'properties'}
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
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {formatDate(owner.created_at)}
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
                                  onClick={() => handleSendMessage(owner.full_name || 'Owner', owner.email)}
                                  className="cursor-pointer"
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleViewProperties(owner.id)}
                                  className="cursor-pointer"
                                >
                                  <Building className="h-4 w-4 mr-2" />
                                  View Properties ({owner.property_count})
                                </DropdownMenuItem>
                                {owner.status === "pending" && (
                                  <DropdownMenuItem 
                                    onClick={() => handleResendInvitation(owner.id, owner.full_name || 'Owner')}
                                    className="cursor-pointer"
                                  >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Resend Invitation
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/users/${owner.id}`} className="cursor-pointer">
                                    <Check className="h-4 w-4 mr-2" />
                                    View Profile
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredOwners.length > 0 && (
                    <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
                      <div>
                        Showing {filteredOwners.length} of {owners?.length || 0} owners
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