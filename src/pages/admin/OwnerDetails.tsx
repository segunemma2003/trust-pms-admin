import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userService, analyticsService } from "@/services/api";
import { usePropertiesByOwner } from "@/hooks/useQueries";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Calendar, User, Phone, Mail, Home, Star } from "lucide-react";

const OwnerDetails = () => {
  const { ownerId } = useParams();
  const { data: owner, isLoading, error } = useQuery({
    queryKey: ['owner', ownerId],
    queryFn: async () => {
      const result = await userService.getOwnerStats(ownerId!);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!ownerId
  });

  const { data: properties } = usePropertiesByOwner(ownerId);

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

      {/* Loader */}
      {isLoading && (
        <div className="text-center py-10 text-gray-500">Loading owner information...</div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-center py-10 text-red-500">Failed to load owner details. Please try again.</div>
      )}

      {/* Owner Info Content */}
      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* ...cards remain unchanged... */}
          </div>

          {/* Recent Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Properties</CardTitle>
            </CardHeader>
            <CardContent>
              {properties?.results.slice(0, 3).map(property => (
                <div key={property.id} className="py-3 border-b last:border-b-0">
                  <div className="font-medium">{property.title}</div>
                  <div className="text-sm text-gray-500">
                    {property.city}, {property.state}
                  </div>
                  <Badge variant="outline" className="mt-1">
                    {property.status}
                  </Badge>
                </div>
              ))}
              {properties?.results.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No properties found for this owner
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  </div>
</Layout>


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
                  <CardTitle>{owner?.full_name || 'N/A'}</CardTitle>
                  <Badge variant="outline" className={getStatusBadgeClass(owner?.status)}>
                    {owner?.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{owner?.email}</span>
                </div>
                {owner?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{owner.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Joined: {formatDate(owner?.date_joined)}</span>
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
                    <div className="text-2xl font-bold">{properties?.results.length || 0}</div>
                    <div className="text-sm text-gray-500">Total Properties</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">
                      {properties?.results.filter(p => p.status === 'active').length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Active</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  asChild
                >
                  <Link to={`/admin/properties?owner=${ownerId}`}>
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
                  <span>{owner?.total_bookings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span>${owner?.total_revenue?.toLocaleString() || 0}</span>
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
              {properties?.results.slice(0, 3).map(property => (
                <div key={property.id} className="py-3 border-b last:border-b-0">
                  <div className="font-medium">{property.title}</div>
                  <div className="text-sm text-gray-500">
                    {property.city}, {property.state}
                  </div>
                  <Badge variant="outline" className="mt-1">
                    {property.status}
                  </Badge>
                </div>
              ))}
              {properties?.results.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No properties found for this owner
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

// Helper functions
const formatDate = (dateString: string) => {
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

export default OwnerDetails;