import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Check,
  Save,
  Shield,
  BellRing,
  CreditCard,
  Mail,
  Key,
  Users,
  Lock,
  Globe,
  Loader2,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, apiClient, type User } from "@/services/api";

interface ProfileFormData {
  full_name: string;
  phone: string;
  email: string;
}

interface PasswordFormData {
  old_password: string;
  new_password: string;
}

const Settings = () => {
  const [profileTab, setProfileTab] = useState<ProfileFormData>({
    full_name: '',
    phone: '',
    email: '',
  });
  const [passwordTab, setPasswordTab] = useState<PasswordFormData>({
    old_password: '',
    new_password: '',
  });
  
  const { user, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  // Query for getting current user profile
  const { 
    data: currentUserResponse, 
    isLoading: profileLoading, 
    isError: profileError,
    error: profileErrorMessage,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const result = await userService.getCurrentUser();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  // Update profile form when user data loads
  useEffect(() => {
    if (currentUserResponse) {
      setProfileTab({
        full_name: currentUserResponse.full_name || '',
        phone: currentUserResponse.phone || '',
        email: currentUserResponse.email || '',
      });
    }
  }, [currentUserResponse]);

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { full_name?: string; phone?: string }) => {
      const result = await userService.updateUser(user?.id || '', updates);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success('Profile updated successfully!');
      refreshProfile?.();
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  // Mutation for changing password
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: PasswordFormData) => {
      // Using apiClient directly since there's no specific service method
      const response = await fetch(`${apiClient['baseURL']}/users/change_password/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_password: passwordData.old_password,
          new_password: passwordData.new_password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPasswordTab({ old_password: '', new_password: '' });
    },
    onError: (error: Error) => {
      toast.error(`Failed to change password: ${error.message}`);
    },
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileTab({ ...profileTab, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async () => {
    if (!profileTab.full_name.trim()) {
      toast.error('Full name is required');
      return;
    }

    updateProfileMutation.mutate({
      full_name: profileTab.full_name,
      phone: profileTab.phone,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordTab({ ...passwordTab, [e.target.name]: e.target.value });
  };

  const handlePasswordSave = async () => {
    if (!passwordTab.old_password.trim()) {
      toast.error('Current password is required');
      return;
    }
    
    if (!passwordTab.new_password.trim()) {
      toast.error('New password is required');
      return;
    }

    if (passwordTab.new_password.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    changePasswordMutation.mutate(passwordTab);
  };

  const handleSaveSettings = () => {
    // This would be for other settings tabs that don't have specific save buttons
    toast.success("Settings saved successfully!");
  };

  const handleRefreshProfile = () => {
    refetchProfile();
  };

  if (profileError) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="text-center py-8 text-red-600">
              <p className="mb-2">Error loading profile:</p>
              <p className="text-sm mb-4">
                {profileErrorMessage?.message?.includes('DOCTYPE') 
                  ? 'API returned HTML instead of JSON. Please check if the user profile endpoint is working correctly.'
                  : profileErrorMessage?.message || 'Unknown error occurred'
                }
              </p>
              <Button 
                variant="outline" 
                onClick={handleRefreshProfile}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
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
              <h1 className="text-2xl font-bold text-airbnb-dark">Platform Settings</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Configure platform settings and preferences
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex gap-2">
              {/* <Button
                variant="outline"
                onClick={handleRefreshProfile}
                disabled={profileLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${profileLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button> */}
              <Button
                className="bg-airbnb-primary hover:bg-airbnb-primary/90 flex items-center gap-2"
                onClick={handleSaveSettings}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="profile" className="mt-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Admin Profile</CardTitle>
                  <CardDescription>View and update your profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading profile...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input 
                          id="full_name" 
                          name="full_name" 
                          value={profileTab.full_name} 
                          onChange={handleProfileChange} 
                          disabled={updateProfileMutation.isPending}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          value={profileTab.email} 
                          disabled 
                          readOnly 
                          className="bg-gray-50"
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={profileTab.phone} 
                          onChange={handleProfileChange} 
                          disabled={updateProfileMutation.isPending}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      
                      {currentUserResponse && (
                        <div className="space-y-2">
                          <Label>User Type</Label>
                          <Input 
                            value={currentUserResponse.user_type?.charAt(0).toUpperCase() + currentUserResponse.user_type?.slice(1) || 'Unknown'} 
                            disabled 
                            readOnly 
                            className="bg-gray-50"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleProfileSave} 
                    disabled={updateProfileMutation.isPending || profileLoading} 
                    className="bg-airbnb-primary hover:bg-airbnb-primary/90"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Profile'
                    )}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="old_password">Current Password</Label>
                      <Input 
                        id="old_password" 
                        name="old_password" 
                        type="password" 
                        value={passwordTab.old_password} 
                        onChange={handlePasswordChange}
                        disabled={changePasswordMutation.isPending}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input 
                        id="new_password" 
                        name="new_password" 
                        type="password" 
                        value={passwordTab.new_password} 
                        onChange={handlePasswordChange}
                        disabled={changePasswordMutation.isPending}
                        placeholder="Enter new password"
                      />
                      <p className="text-xs text-muted-foreground">Password must be at least 6 characters long</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handlePasswordSave} 
                    disabled={changePasswordMutation.isPending} 
                    className="bg-airbnb-primary hover:bg-airbnb-primary/90"
                  >
                    {changePasswordMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      'Change Password'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="general" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Information</CardTitle>
                  <CardDescription>
                    Basic platform settings and information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platformName">Platform Name</Label>
                      <Input id="platformName" defaultValue="OIFYK" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Admin Email</Label>
                      <Input id="adminEmail" defaultValue="admin@oifyk.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input id="supportEmail" defaultValue="support@oifyk.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Contact Phone</Label>
                      <Input id="contactPhone" defaultValue="+1 (555) 123-4567" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Input id="address" defaultValue="123 Main Street, Suite 100, San Francisco, CA 94105" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Features & Restrictions</CardTitle>
                  <CardDescription>
                    Control platform features and restrictions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Owner Registrations</Label>
                      <p className="text-sm text-muted-foreground">Allow new owners to register on the platform</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable User Registrations</Label>
                      <p className="text-sm text-muted-foreground">Allow new users to register on the platform</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Manual Property Approval</Label>
                      <p className="text-sm text-muted-foreground">Require admin approval for new properties</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-airbnb-primary" />
                    <CardTitle>Security Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure platform security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for admin logins</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Password Requirements</Label>
                      <p className="text-sm text-muted-foreground">Enforce strong password policies</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>Session Timeout (minutes)</Label>
                    <Input type="number" defaultValue="60" min="5" max="240" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Reset Admin API Keys
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Security Audit Log
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BellRing className="h-5 w-5 text-airbnb-primary" />
                    <CardTitle>Notification Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure email and system notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New User Registrations</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications for new user signups</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Property Submissions</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications for new property submissions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payment Requests</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications for payment requests</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive important system notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="integrations" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-airbnb-primary" />
                    <CardTitle>Beds24 Integration</CardTitle>
                  </div>
                  <CardDescription>
                    Configure Beds24 API integration settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="beds24ApiKey">API Key</Label>
                    <Input id="beds24ApiKey" type="password" defaultValue="••••••••••••••••" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="beds24ProviderId">Provider ID</Label>
                    <Input id="beds24ProviderId" defaultValue="OIFYK_PLATFORM" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="beds24Endpoint">API Endpoint</Label>
                    <Input id="beds24Endpoint" defaultValue="https://api.beds24.com/v1" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automated Sync</Label>
                      <p className="text-sm text-muted-foreground">Enable automatic data synchronization</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Test Connection
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="billing" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-airbnb-primary" />
                    <CardTitle>Billing & Payment Settings</CardTitle>
                  </div>
                  <CardDescription>
                    Configure platform payment settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" defaultValue="OIFYK Ltd." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                    <Input id="taxId" defaultValue="US123456789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentProcessor">Default Payment Processor</Label>
                    <select
                      id="paymentProcessor"
                      className="w-full border border-input rounded-md h-10 px-3"
                      defaultValue="stripe"
                    >
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                      <option value="manual">Manual Bank Transfer</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Payments</Label>
                      <p className="text-sm text-muted-foreground">Process owner payments automatically</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;