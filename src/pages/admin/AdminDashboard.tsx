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
  const { user } = useAuth();

  const pieData = [
    { name: 'Owners', value: metrics?.totalOwners || 0 },
    { name: 'Users', value: (metrics?.totalUsers || 0) - (metrics?.totalOwners || 0) }
  ];
  const COLORS = ['#FF5A5F', '#00A699'];

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      const [metricsRes, activityRes, invitationsRes] = await Promise.all([
        fetch(`/api/analytics/dashboard_metrics/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/analytics/recent_activity/?limit=5`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`/api/invitations/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (activityRes.ok) setRecentActivity((await activityRes.json()).results || []);
      if (invitationsRes.ok) setInvitations((await invitationsRes.json()).results || []);
    };
    fetchDashboard();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      return;
    }
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
        invitation_type: inviteForm.invitationType,
        personal_message: inviteForm.message
      })
    });
    if (response.ok) {
      setIsInviteModalOpen(false);
      setInviteForm({ name: '', email: '', invitationType: 'owner', message: '' });
      // Optionally refetch invitations
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setInviteForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResendInvitation = async (invitationId: string) => {
    alert('Resend invitation is not implemented yet.');
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
                Overview of platform statistics and activities
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
              <Button variant="outline" className="flex items-center gap-2" asChild>
                <Link to="/admin/settings">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
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
                      <Label htmlFor="invitationType">User Type *</Label>
                      <Select 
                        value={inviteForm.invitationType} 
                        onValueChange={(value: "owner" | "user" | "admin") => handleInputChange("invitationType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Property Owner</SelectItem>
                          <SelectItem value="user">Regular User</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-airbnb-light">
                  Total Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{metrics?.totalProperties || 0}</div>
                  <div className="h-12 w-12 bg-airbnb-primary/10 rounded-full flex items-center justify-center">
                    <Home className="h-6 w-6 text-airbnb-primary" />
                  </div>
                </div>
                <p className="text-xs text-airbnb-light mt-2">
                  {metrics?.activeProperties || 0} active listings
                </p>
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
                  <div className="text-2xl font-bold">{metrics?.totalOwners || 0}</div>
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
                  Total Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{metrics?.totalBookings || 0}</div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <p className="text-xs text-airbnb-light mt-2">
                  This month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-airbnb-light">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-green-600 mt-2 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  Growing
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue for the past 5 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockRevenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#FF5A5F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Owners vs. Regular Users</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Users']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform activities</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/activity">View all</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity: any) => (
                      <div 
                        key={activity.id} 
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.action.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-airbnb-light">
                            {activity.user?.full_name || 'System'}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 bg-muted p-4 rounded-lg flex items-center gap-3">
            <HelpCircle className="h-5 w-5 text-airbnb-light" />
            <p className="text-sm text-airbnb-light">
              Need help with the admin dashboard? 
              <Link to="/help" className="text-airbnb-primary hover:underline ml-1">
                View the documentation
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;