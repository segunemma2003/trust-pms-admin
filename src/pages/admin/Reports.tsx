import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
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
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";

const COLORS = ["#FF5A5F", "#00A699", "#FC642D", "#484848", "#767676"];

const Reports = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [propertiesData, setPropertiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) return;
      // Revenue analytics
      const revenueRes = await fetch(`/api/analytics/revenue_analytics/?start_date=2025-01-01&end_date=2025-12-31&group_by=month`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (revenueRes.ok) {
        const data = await revenueRes.json();
        setRevenueData(data.data.map((item: any) => ({ month: item.period, revenue: item.revenue })));
        setBookingData(data.data.map((item: any) => ({ month: item.period, bookings: item.bookings_count })));
      }
      // Property types
      const propertiesRes = await fetch(`/api/properties/?page=1&page_size=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (propertiesRes.ok) {
        const data = await propertiesRes.json();
        const typeCounts: Record<string, number> = {};
        (data.results || []).forEach((prop: any) => {
          const type = prop.property_type || 'Other';
          typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        setPropertiesData(Object.entries(typeCounts).map(([category, count]) => ({ category, count })));
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              Loading analytics...
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
              <h1 className="text-2xl font-bold text-airbnb-dark">Reports</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Analysis and statistics of platform activities
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Custom Range
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$25,820</div>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>12% from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">327</div>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>8% from last month</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Occupancy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">76%</div>
                <div className="flex items-center text-sm text-red-600 mt-1">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  <span>3% from last month</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="revenue" className="mt-6">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
            </TabsList>
            
            <TabsContent value="revenue" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue for the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#FF5A5F" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bookings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Statistics</CardTitle>
                  <CardDescription>Monthly bookings for the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bookingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="bookings" fill="#00A699" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="properties" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Types</CardTitle>
                    <CardDescription>Distribution of property categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={propertiesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="category" type="category" width={100} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#FF5A5F" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Property Locations</CardTitle>
                    <CardDescription>Distribution by city</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart width={400} height={300}>
                          <Pie
                            data={propertiesData}
                            dataKey="count"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            label
                          >
                            {propertiesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Reports;
