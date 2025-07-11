import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
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
  ArrowUpRight, 
  Calendar, 
  HelpCircle, 
  Home, 
  MapPin, 
  Plus, 
  Settings, 
  ShoppingCart, 
  Users,
  Mail,
  Send,
  Loader2,
  RotateCcw
} from "lucide-react";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { analyticsService, invitationService } from "@/services/api";
import { 
  useInvitations, 
  useCreateInvitation, 
  useResendInvitation, 
  useTaskStatus,
  useCeleryStatus 
} from "@/hooks/useQueries";

const AdminDashboard = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    invitationType: "owner" as "owner" | "user" | "admin",
    message: ""
  });

  // Mock revenue data (you can replace this with real data from your analytics)
  const mockRevenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 22000 },
    { month: 'May', revenue: 25000 },
  ];

  // Local state and handlers for API-driven dashboard
  const [metrics, setMetrics] = useState<any>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [resendingInvitationId, setResendingInvitationId] = useState<string | null>(null);
  const [trackingTaskId, setTrackingTaskId] = useState<string | null>(null);
  const { user } = useAuth();
  const resendInvitationMutation = useResendInvitation();
  const pieData = [
    { name: 'Owners', value: metrics?.totalOwners || 0 },
    { name: 'Users', value: (metrics?.totalUsers || 0) - (metrics?.totalOwners || 0) }
  ];
  const COLORS = ['#FF5A5F', '#00A699'];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Use API client instead of direct fetch
        const [metricsResult, activityResult, invitationsResult] = await Promise.all([
          analyticsService.getDashboardMetrics(),
          analyticsService.getRecentActivity(5),
          invitationService.getInvitations()
        ]);
        
        if (metricsResult.data) setMetrics(metricsResult.data);
        if (activityResult.data) setRecentActivity(activityResult.data);
        if (invitationsResult.data) setInvitations(invitationsResult.data.results || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };
    
    fetchDashboard();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      return;
    }
    
    try {
      // Use API client instead of direct fetch
      const result = await invitationService.createInvitation({
        email: inviteForm.email,
        invitee_name: inviteForm.name,
        invitation_type: inviteForm.invitationType,
        personal_message: inviteForm.message
      });
      
      if (result.data) {
        setIsInviteModalOpen(false);
        setInviteForm({ name: '', email: '', invitationType: 'owner', message: '' });
        // Optionally refetch invitations
      }
    } catch (error) {
      console.error('Failed to send invitation:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setInviteForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const recentInvitations = invitations.slice(0, 3);
  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  if (!metrics) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-airbnb-primary" />
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
            <h1 className="text-2xl font-bold text-airbnb-dark">Admin Dashboard</h1>
            <p className="text-sm text-airbnb-light mt-1">
              Overview of platform statistics
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <Button variant="outline" className="flex items-center gap-2" asChild>
              <Link to="/admin/settings">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-airbnb-light">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{metrics.total_users}</div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-airbnb-light">
                Total Owners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{metrics.total_owners}</div>
                <div className="h-12 w-12 bg-airbnb-secondary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-airbnb-secondary" />
                </div>
              </div>
              <p className="text-xs text-airbnb-light mt-2">
                {pendingInvitations.length} pending invitations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-airbnb-light">
                Total Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{metrics.total_properties}</div>
                <div className="h-12 w-12 bg-airbnb-primary/10 rounded-full flex items-center justify-center">
                  <Home className="h-6 w-6 text-airbnb-primary" />
                </div>
              </div>
              <p className="text-xs text-airbnb-light mt-2">
                {metrics.active_properties} active listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-airbnb-light">
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{metrics.total_bookings}</div>
                <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-airbnb-light">
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">${metrics.monthly_revenue?.toLocaleString()}</div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-airbnb-light">
                Recent Signups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{metrics.recent_signups}</div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invitations */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Invitations</CardTitle>
                <CardDescription>Latest invitations sent</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/invitations">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvitations.length > 0 ? (
                  recentInvitations.map((invitation: any) => (
                    <div 
                      key={invitation.id} 
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{invitation.invitee_name || 'N/A'}</p>
                        <p className="text-xs text-airbnb-light">{invitation.email}</p>
                        <p className="text-xs text-gray-500 capitalize">{invitation.invitation_type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            invitation.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                            invitation.status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                        </span>
                        {invitation.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendInvitation(invitation.id)}
                            className="h-8 w-8 p-0"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No invitations sent yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </Layout>

  );
};

export default AdminDashboard;