import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userService, analyticsService } from "@/services/api";
import { usePropertiesByOwner } from "@/hooks/useQueries";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Calendar, User, Phone, Mail, Home, Star, Loader2, RefreshCw } from "lucide-react";

const OwnerDetails = () => {
  const { ownerId } = useParams();

  // Fetch owner profile data (user info)
  const { 
    data: ownerProfile, 
    isLoading: profileLoading, 
    error: profileError,
    refetch: refetchProfile
  } = useQuery({
    queryKey: ['owner-profile', ownerId],
    queryFn: async () => {
      // Since there's no specific getOwnerById endpoint, we'll use search
      const result = await userService.getUsersByType('owner');
      if (result.error) throw new Error(result.error);
      
      const owners = Array.isArray(result.data) ? result.data : result.data?.results || [];
      const owner = owners.find((o: any) => o.id === ownerId);
      
      if (!owner) {
        throw new Error('Owner not found');
      }
      
      return owner;
    },
    enabled: !!ownerId
  });

  // Fetch owner stats data
  const { 
    data: ownerStats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useQuery({
    queryKey: ['owner-stats', ownerId],
    queryFn: async () => {
      const result = await userService.getOwnerStats(ownerId!);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!ownerId
  });

  // Fetch owner's properties
  const { 
    data: propertiesData, 
    isLoading: propertiesLoading 
  } = usePropertiesByOwner(ownerId);

  const isLoading = profileLoading || statsLoading;
  const hasError = profileError || statsError;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "suspended": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-airbnb-primary mx-auto mb-4" />
                <p className="text-airbnb-light">Loading owner information...</p>
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
                <p className="text-red-600 mb-2">Failed to load owner details</p>
                <p className="text-sm text-gray-500 mb-4">
                  {profileError?.message || statsError?.message || 'Unknown error occurred'}
                </p>
                <Button 
                  onClick={() => {
                    refetchProfile();
                  }}
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

  if (!ownerProfile) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Owner not found</p>
                <Button asChild>
                  <Link to="/admin/owners">Back to Owners</Link>
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Owner Details</h1>
            <Button asChild>
              <Link to="/admin/owners">Back to Owners</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{ownerProfile.full_name || 'N/A'}</CardTitle>
                  <Badge variant="outline" className={getStatusBadgeClass(ownerProfile.status)}>
                    {ownerProfile.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{ownerProfile.email}</span>
                </div>
                {ownerProfile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{ownerProfile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Joined: {formatDate(ownerProfile.date_joined || ownerProfile.created_at)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      {ownerStats?.properties_count || propertiesData?.results?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Total Properties</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      {ownerStats?.active_properties_count || 
                       propertiesData?.results?.filter(p => p.status === 'active').length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Active</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  asChild
                >
                  <Link to={`/admin/owners/${ownerId}/properties`}>
                    View All Properties
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Bookings:</span>
                  <span>{ownerStats?.total_bookings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span>${ownerStats?.total_revenue?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Approval Rate:</span>
                  <span>{ownerStats?.approval_rate || 0}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Properties Section */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Properties</CardTitle>
            </CardHeader>
            <CardContent>
              {propertiesLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading properties...</span>
                </div>
              ) : propertiesData?.results && propertiesData.results.length > 0 ? (
                propertiesData.results.slice(0, 5).map(property => (
                  <div key={property.id} className="py-3 border-b last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{property.title}</div>
                        <div className="text-sm text-gray-500">
                          {property.city}, {property.state}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.bedrooms} bed • {property.bathrooms} bath • {property.max_guests} guests
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant="outline" className={getStatusBadgeClass(property.status)}>
                          {property.status}
                        </Badge>
                        <div className="text-sm font-medium">
                          ${property.display_price || property.price_per_night}/night
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No properties found for this owner
                </div>
              )}
              
              {propertiesData?.results && propertiesData.results.length > 5 && (
                <div className="mt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/admin/owners/${ownerId}/properties`}>
                      View All {propertiesData.results.length} Properties
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default OwnerDetails;