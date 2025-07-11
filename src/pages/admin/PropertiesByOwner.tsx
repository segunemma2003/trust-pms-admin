import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { userService, propertyService } from "@/services/api";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, Home, MapPin, DollarSign, Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PropertiesByOwner = () => {
  const { ownerId } = useParams();
  const { data: owner } = useQuery({
    queryKey: ['owner', ownerId],
    queryFn: async () => {
      const result = await userService.getOwnerStats(ownerId!);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!ownerId
  });

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', ownerId],
    queryFn: async () => {
      const result = await propertyService.getPropertiesByOwner(ownerId!);
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    enabled: !!ownerId
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <Layout hideFooter>
      <div className="flex">
        <Sidebar type="admin" />
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">
                Properties for {owner?.full_name || 'Owner'}
              </h1>
              <p className="text-sm text-gray-500">
                {properties?.results.length || 0} properties found
              </p>
            </div>
            <div className="flex gap-2">
             
            
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Property List</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties?.results.map(property => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div className="font-medium">{property.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          {property.city}, {property.state}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          {property.display_price}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1">
                            <Home className="h-4 w-4 text-gray-500" />
                            {property.bedrooms}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            {property.max_guests}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {property.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {formatDate(property.created_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default PropertiesByOwner;