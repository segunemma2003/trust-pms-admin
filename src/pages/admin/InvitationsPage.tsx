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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Plus, User, Send, Loader2, RotateCcw, Search, Filter, RefreshCw, Clock, CheckCircle, AlertCircle } from "lucide-react";
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
import { 
  useInvitations, 
  useCreateInvitation, 
  useResendInvitation, 
  useTaskStatus,
  useCeleryStatus 
} from "@/hooks/useQueries";
import { toast } from "sonner";
import type { Invitation } from "@/services/api";

const InvitationsPage = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [resendingInvitationId, setResendingInvitationId] = useState<string | null>(null);
  const [trackingTaskId, setTrackingTaskId] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    invitationType: "owner" as "owner" | "user" | "admin",
    message: ""
  });
  const { user } = useAuth();

  // Use the custom hooks
  const { 
    data: invitationsData, 
    isLoading, 
    error, 
    refetch 
  } = useInvitations();
  
  const createInvitationMutation = useCreateInvitation();
  const resendInvitationMutation = useResendInvitation();
  
  // NEW: Task status tracking
  const { data: taskStatus } = useTaskStatus(trackingTaskId);
  const { data: celeryStatus } = useCeleryStatus();

  // Since the hook now returns the unwrapped data directly
  const invitations: Invitation[] = invitationsData?.results || [];

  const handleInputChange = (field: string, value: string) => {
    setInviteForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const result = await createInvitationMutation.mutateAsync({
        email: inviteForm.email,
        invitee_name: inviteForm.name,
        invitation_type: inviteForm.invitationType,
        personal_message: inviteForm.message || undefined
      });

      // Track the task if task_id is returned
      if (result?.task_id) {
        setTrackingTaskId(result.task_id);
      }

      // Reset form and close modal
      setIsInviteModalOpen(false);
      setInviteForm({ name: '', email: '', invitationType: 'owner', message: '' });
    } catch (error) {
      // Error handling is already done in the mutation
      console.error('Failed to create invitation:', error);
    }
  };

  // NEW: Updated resend function with real implementation
  const handleResendInvitation = async (invitationId: string) => {
    setResendingInvitationId(invitationId);
    try {
      const result = await resendInvitationMutation.mutateAsync(invitationId);
      
      // Track the resend task
      if (result?.task_id) {
        setTrackingTaskId(result.task_id);
      }
      
      // Show success message with reminder count
      if (result?.reminder_count) {
        toast.success(
          `Invitation resent successfully! (Reminder #${result.reminder_count})`,
          {
            description: result.can_send_more 
              ? `You can send ${3 - result.reminder_count} more reminders.`
              : 'This was the final reminder for this invitation.'
          }
        );
      }
    } catch (error) {
      // Error handling is already done in the mutation
      console.error('Failed to resend invitation:', error);
    } finally {
      setResendingInvitationId(null);
    }
  };

  // Filter invitations based on search and status
  const filteredInvitations = invitations.filter((invitation: Invitation) => {
    const matchesSearch = searchQuery === "" || 
      invitation.invitee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invitation.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invitation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "accepted":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "declined":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "expired":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInviterName = (invitation: Invitation) => {
    return invitation.invited_by_name || 'Admin';
  };

  // NEW: Get reminder status for invitation
  const getReminderStatus = (invitation: Invitation) => {
    if (invitation.reminder_count && invitation.reminder_count > 0) {
      return `${invitation.reminder_count} reminder${invitation.reminder_count > 1 ? 's' : ''} sent`;
    }
    return 'No reminders sent';
  };

  // NEW: Check if reminder can be sent
  const canSendReminder = (invitation: Invitation) => {
    return invitation.status === 'pending' && 
           invitation.can_send_reminder && 
           (invitation.reminder_count || 0) < 3;
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-airbnb-primary mx-auto mb-4" />
                <p className="text-airbnb-light">Loading invitations...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-2">Failed to load invitations</p>
                <p className="text-sm text-gray-500 mb-4">
                  {error.message?.includes('DOCTYPE') 
                    ? 'API returned HTML instead of JSON. Please check if the invitations endpoint is working correctly.'
                    : error.message || 'Unknown error occurred'
                  }
                </p>
                <Button 
                  onClick={() => refetch()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry
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
              <h1 className="text-2xl font-bold text-airbnb-dark">Invitations</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Manage user invitations and track their status
                {invitations.length > 0 && ` (${invitations.length} total)`}
              </p>
              {/* NEW: Celery status indicator */}
              {celeryStatus && (
                <div className="flex items-center gap-2 mt-2">
                  {celeryStatus.status === 'healthy' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-xs text-gray-500">
                    Email workers: {celeryStatus.status} ({celeryStatus.worker_count} active)
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-airbnb-primary hover:bg-airbnb-primary/90 flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Send Invitation
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-airbnb-primary" />
                      Invite User to Platform
                    </DialogTitle>
                    <DialogDescription>
                      Send an invitation to join the OIFYK platform. An email will be sent with registration instructions.
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
                        disabled={createInvitationMutation.isPending}
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
                        disabled={createInvitationMutation.isPending}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invitationType">User Type *</Label>
                      <Select 
                        value={inviteForm.invitationType} 
                        onValueChange={(value: "owner" | "user" | "admin") => handleInputChange("invitationType", value)}
                        disabled={createInvitationMutation.isPending}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Property Owner</SelectItem>
                          {/* <SelectItem value="user">Regular User</SelectItem> */}
                          {/* <SelectItem value="admin">Administrator</SelectItem> */}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {inviteForm.invitationType === 'owner' 
                          ? 'Can list and manage properties on the platform'
                          : inviteForm.invitationType === 'admin'
                          ? 'Full platform administration access'
                          : 'Can browse and book properties'
                        }
                      </p>
                    </div>
                    {/* <div className="space-y-2">
                      <Label htmlFor="message">Personal Message (Optional)</Label>
                      <Textarea
                        id="message"
                        value={inviteForm.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Add a personal message to the invitation..."
                        rows={3}
                        disabled={createInvitationMutation.isPending}
                      />
                    </div> */}
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
                        className="bg-airbnb-primary hover:bg-airbnb-primary/90"
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

          {/* NEW: Task Status Display */}
          {trackingTaskId && taskStatus && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  {taskStatus.ready ? (
                    taskStatus.successful ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )
                  ) : (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-blue-900">
                      {taskStatus.ready ? (
                        taskStatus.successful ? 'Email sent successfully!' : 'Email sending failed'
                      ) : 'Sending email...'}
                    </p>
                    {taskStatus.ready && taskStatus.result && (
                      <p className="text-sm text-blue-700">{taskStatus.result.message}</p>
                    )}
                    {taskStatus.ready && taskStatus.error && (
                      <p className="text-sm text-red-700">{taskStatus.error}</p>
                    )}
                  </div>
                  {taskStatus.ready && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTrackingTaskId(null)}
                    >
                      Dismiss
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Platform Invitations</CardTitle>
                  <CardDescription>
                    Track and manage all invitations sent to users
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search invitations..."
                      className="pl-8 w-full sm:w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-32">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredInvitations.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-airbnb-light mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-airbnb-dark mb-2">
                    {searchQuery || statusFilter !== "all" 
                      ? "No invitations found" 
                      : "No invitations sent yet"
                    }
                  </h3>
                  <p className="text-airbnb-light mb-4">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search criteria or filters."
                      : "Start by sending your first invitation to bring users to the platform."
                    }
                  </p>
                  {!searchQuery && statusFilter === "all" && (
                    <Button 
                      onClick={() => setIsInviteModalOpen(true)}
                      className="bg-airbnb-primary hover:bg-airbnb-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Send First Invitation
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {invitations.length}
                      </div>
                      <div className="text-sm text-blue-600">Total</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {invitations.filter((inv: Invitation) => inv.status === 'pending').length}
                      </div>
                      <div className="text-sm text-yellow-600">Pending</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {invitations.filter((inv: Invitation) => inv.status === 'accepted').length}
                      </div>
                      <div className="text-sm text-green-600">Accepted</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {invitations.filter((inv: Invitation) => inv.status === 'declined').length}
                      </div>
                      <div className="text-sm text-red-600">Declined</div>
                    </div>
                  </div>
                  {/* Invitations Table */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invitee</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reminders</TableHead>
                          <TableHead>Invited By</TableHead>
                          <TableHead>Sent Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvitations.map((invitation: Invitation) => {
                          return (
                            <TableRow key={invitation.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-airbnb-light" />
                                  {invitation.invitee_name || 'N/A'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-airbnb-light" />
                                  {invitation.email}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {invitation.invitation_type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusBadgeClass(invitation.status)}>
                                  {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                                </Badge>
                              </TableCell>
                              {/* NEW: Reminder status column */}
                              <TableCell>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Clock className="h-3 w-3" />
                                  {getReminderStatus(invitation)}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {getInviterName(invitation)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {formatDate(invitation.created_at)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {canSendReminder(invitation) && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleResendInvitation(invitation.id)}
                                      disabled={resendingInvitationId === invitation.id || resendInvitationMutation.isPending}
                                      className="hover:bg-airbnb-primary/10"
                                    >
                                      {resendingInvitationId === invitation.id ? (
                                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      ) : (
                                        <RotateCcw className="h-3 w-3 mr-1" />
                                      )}
                                      Resend
                                    </Button>
                                  )}
                                  {invitation.personal_message && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        toast.info(invitation.personal_message, {
                                          description: "Personal message from invitation",
                                          duration: 5000
                                        });
                                      }}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      View Message
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Pagination info */}
                  {filteredInvitations.length > 0 && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                      Showing {filteredInvitations.length} of {invitations.length} invitations
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default InvitationsPage;