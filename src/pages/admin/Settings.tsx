
import { useState } from "react";
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
  Globe
} from "lucide-react";

const Settings = () => {
  const [saving, setSaving] = useState(false);
  
  const handleSaveSettings = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved successfully!");
    }, 1000);
  };

  return (
    <Layout userType="admin" hideFooter>
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
            
            <div className="mt-4 md:mt-0">
              <Button
                className="bg-airbnb-primary hover:bg-airbnb-primary/90 flex items-center gap-2"
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="animate-spin">...</span>
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="general" className="mt-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            
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
