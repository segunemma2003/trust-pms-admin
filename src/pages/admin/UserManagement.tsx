import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Mail, MoreHorizontal, UserPlus, Shield, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/api";
import { useCreateInvitation } from "@/hooks/useQueries";

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const createInvitationMutation = useCreateInvitation();

  // Use React Query to fetch users with search
  const { 
    data: usersResponse, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ['users', 'search', searchQuery],
    queryFn: async () => {
      const result = await userService.getUsers();
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Filter results based on search query if provided
      let users = result.data || [];
      if (searchQuery.trim()) {
        users = users.filter(user => 
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      return users;
    },
    enabled: true, // Always enabled, but will filter based on search
    staleTime: 30000, // Cache for 30 seconds
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleInviteUser = () => {
    // You can implement a modal here or redirect to invite page
    // For now, just show a success message
    toast.success("Invite user feature - implement invitation modal!");
  };

  const handleSendMessage = (userId: string) => {
    toast.info(`Send message to user ${userId} - implement messaging feature`);
  };

  const handleChangeRole = (userId: string) => {
    toast.info(`Change role for user ${userId} - implement role change feature`);
  };

  const handleResendInvitation = (userEmail: string) => {
    // This would typically be for pending users
    toast.info(`Resend invitation to ${userEmail} - implement resend feature`);
  };

  // Map API user type to display format
  const getUserTypeDisplay = (userType: string) => {
    return userType.charAt(0).toUpperCase() + userType.slice(1);
  };

  // Map API status to display format and determine badge color
  const getStatusBadgeProps = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'active':
        return {
          className: "bg-green-100 text-green-800",
          text: "Active"
        };
      case 'inactive':
        return {
          className: "bg-red-100 text-red-800",
          text: "Inactive"
        };
      default:
        return {
          className: "bg-gray-100 text-gray-800",
          text: getUserTypeDisplay(status)
        };
    }
  };

  // Map user type to badge color
  const getUserTypeBadgeProps = (userType: string) => {
    switch (userType) {
      case 'admin':
        return "bg-purple-100 text-purple-800";
      case 'owner':
        return "bg-blue-100 text-blue-800";
      case 'user':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Layout hideFooter>
      <div className="flex">
        <Sidebar type="admin" />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-airbnb-dark">User Management</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Manage all users across the platform
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <Button
                className="bg-airbnb-primary hover:bg-airbnb-primary/90 flex items-center gap-2"
                onClick={handleInviteUser}
                disabled={createInvitationMutation.isPending}
              >
                {createInvitationMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Invite New User
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Platform Users</CardTitle>
                  <CardDescription>
                    Manage all registered users
                    {usersResponse && ` (${usersResponse.length} users)`}
                  </CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading users...</span>
                </div>
              )}

              {isError && (
                <div className="text-center py-8 text-red-600">
                  <p>Error loading users: {error?.message || 'Unknown error'}</p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()} 
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </div>
              )}

              {!isLoading && !isError && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersResponse && usersResponse.length > 0 ? (
                      usersResponse.map((userData) => {
                        const statusProps = getStatusBadgeProps(userData.status);
                        
                        return (
                          <TableRow key={userData.id}>
                            <TableCell className="font-medium">
                              {userData.full_name || 'N/A'}
                            </TableCell>
                            <TableCell>{userData.email}</TableCell>
                            <TableCell>
                              <Badge className={getUserTypeBadgeProps(userData.user_type)}>
                                {getUserTypeDisplay(userData.user_type)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusProps.className}>
                                {statusProps.text}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDate(userData.date_joined)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    className="flex items-center gap-2"
                                    onClick={() => handleSendMessage(userData.id)}
                                  >
                                    <Mail className="h-4 w-4" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="flex items-center gap-2"
                                    onClick={() => handleChangeRole(userData.id)}
                                  >
                                    <Shield className="h-4 w-4" />
                                    Change Role
                                  </DropdownMenuItem>
                                  {userData.status === 'inactive' && (
                                    <DropdownMenuItem 
                                      className="flex items-center gap-2"
                                      onClick={() => handleResendInvitation(userData.email)}
                                    >
                                      <Mail className="h-4 w-4" />
                                      Resend Invitation
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          {searchQuery ? 'No users found matching your search.' : 'No users found.'}
                        </TableCell>
                      </TableRow>
                    )}
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

export default UserManagement;