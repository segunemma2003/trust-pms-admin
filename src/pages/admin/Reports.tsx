import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Calendar, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { analyticsService, propertyService, type Property } from "@/services/api";

const COLORS = ["#FF5A5F", "#00A699", "#FC642D", "#484848", "#767676"];

interface RevenueData {
  month: string;
  revenue: number;
}

interface BookingData {
  month: string;
  bookings: number;
}

interface PropertyData {
  category: string;
  count: number;
}

const Reports = () => {
  const { user } = useAuth();
  
  // Query for revenue analytics
  const { 
    data: revenueResponse, 
    isLoading: revenueLoading, 
    isError: revenueError,
    error: revenueErrorMessage,
    refetch: refetchRevenue
  } = useQuery({
    queryKey: ['analytics', 'revenue'],
    queryFn: async () => {
      const result = await analyticsService.getRevenueAnalytics({
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        group_by: 'month'
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  // Query for properties data
  const { 
    data: propertiesResponse, 
    isLoading: propertiesLoading, 
    isError: propertiesError,
    error: propertiesErrorMessage,
    refetch: refetchProperties
  } = useQuery({
    queryKey: ['properties', 'analytics'],
    queryFn: async () => {
      const result = await propertyService.getProperties({
        page: 1,
        page_size: 1000
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 2,
  });

  // Process revenue data
  const revenueData: RevenueData[] = revenueResponse?.data?.map((item: any) => ({
    month: item.period || item.month || 'Unknown',
    revenue: item.revenue || 0
  })) || [];

  // Process booking data
  const bookingData: BookingData[] = revenueResponse?.data?.map((item: any) => ({
    month: item.period || item.month || 'Unknown',
    bookings: item.bookings_count || item.bookings || 0
  })) || [];

  // Process properties data
  const propertiesData: PropertyData[] = (() => {
    if (!propertiesResponse) return [];
    
    const properties = Array.isArray(propertiesResponse) 
      ? propertiesResponse 
      : propertiesResponse.results || [];
    
    // Since Property type doesn't have property_type, we'll categorize by other criteria
    const categoryCounts: Record<string, number> = {};
    
    properties.forEach((prop: Property) => {
      // Create categories based on available data
      let category = 'Other';
      
      // Categorize by bedrooms count
      if (prop.bedrooms >= 4) {
        category = 'Large (4+ beds)';
      } else if (prop.bedrooms >= 2) {
        category = 'Medium (2-3 beds)';
      } else if (prop.bedrooms === 1) {
        category = 'Small (1 bed)';
      } else {
        category = 'Studio';
      }
      
      // Alternative: categorize by price range
      // if (prop.display_price >= 200) {
      //   category = 'Luxury ($200+)';
      // } else if (prop.display_price >= 100) {
      //   category = 'Premium ($100-199)';
      // } else if (prop.display_price >= 50) {
      //   category = 'Standard ($50-99)';
      // } else {
      //   category = 'Budget (<$50)';
      // }
      
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count
    }));
  })();

  const isLoading = revenueLoading || propertiesLoading;
  const hasError = revenueError || propertiesError;
  const errorMessage = revenueErrorMessage?.message || propertiesErrorMessage?.message;

  const handleRefresh = () => {
    refetchRevenue();
    refetchProperties();
  };

  if (isLoading) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-airbnb-red" />
                <p className="text-airbnb-light">Loading analytics...</p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (hasError) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-2">Error loading analytics</p>
                <p className="text-airbnb-light text-sm mb-4">
                  {errorMessage?.includes('DOCTYPE') 
                    ? 'API returned HTML instead of JSON. Please check if the analytics endpoints are working correctly.'
                    : errorMessage || 'An unknown error occurred'
                  }
                </p>
                <Button 
                  onClick={handleRefresh} 
                  variant="outline"
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

  // Calculate summary metrics from the data
  const totalRevenue = revenueData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalBookings = bookingData.reduce((sum, item) => sum + (item.bookings || 0), 0);
  const totalProperties = propertiesData.reduce((sum, item) => sum + (item.count || 0), 0);

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
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {
                  // Placeholder for date range picker
                  alert('Date range picker - to be implemented');
                }}
              >
                <Calendar className="h-4 w-4" />
                Custom Range
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {
                  // Placeholder for export functionality
                  alert('Export functionality - to be implemented');
                }}
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
                <div className="text-2xl font-bold">
                  ${totalRevenue.toLocaleString()}
                </div>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>From {revenueData.length} months</span>
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
                <div className="text-2xl font-bold">{totalBookings.toLocaleString()}</div>
                <div className="flex items-center text-sm text-green-600 mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  <span>From {bookingData.length} months</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProperties.toLocaleString()}</div>
                <div className="flex items-center text-sm text-airbnb-light mt-1">
                  <span>Across {propertiesData.length} categories</span>
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
                  <CardDescription>Monthly revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {revenueData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [`${Number(value).toLocaleString()}`, 'Revenue']} 
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#FF5A5F" 
                            strokeWidth={2}
                            dot={{ fill: '#FF5A5F' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <p className="text-lg mb-2">No revenue data available</p>
                        <p className="text-sm">Revenue analytics will appear here when data is available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="bookings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Statistics</CardTitle>
                  <CardDescription>Monthly booking trends</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookingData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bookingData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => [Number(value).toLocaleString(), 'Bookings']} 
                          />
                          <Legend />
                          <Bar dataKey="bookings" fill="#00A699" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <p className="text-lg mb-2">No booking data available</p>
                        <p className="text-sm">Booking statistics will appear here when data is available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="properties" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Property Categories</CardTitle>
                    <CardDescription>Distribution by bedroom count</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {propertiesData.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart layout="vertical" data={propertiesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="category" type="category" width={120} />
                            <Tooltip 
                              formatter={(value) => [Number(value).toLocaleString(), 'Properties']} 
                            />
                            <Legend />
                            <Bar dataKey="count" fill="#FF5A5F" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-80 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <p className="text-lg mb-2">No property data available</p>
                          <p className="text-sm">Property categories will appear here when data is available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Property Distribution</CardTitle>
                    <CardDescription>Property breakdown by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {propertiesData.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={propertiesData}
                              dataKey="count"
                              nameKey="category"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              fill="#8884d8"
                              label={({ category, count }) => `${category}: ${count}`}
                            >
                              {propertiesData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={COLORS[index % COLORS.length]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [Number(value).toLocaleString(), 'Properties']} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-80 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <p className="text-lg mb-2">No property data available</p>
                          <p className="text-sm">Property distribution will appear here when data is available</p>
                        </div>
                      </div>
                    )}
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