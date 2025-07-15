import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, MapPin, Download, Filter, Star, MoreHorizontal, ChevronDown, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { propertyService, type Property } from "@/services/api";
import { toast } from "sonner";

type SortDirection = "asc" | "desc";
type SortField = "title" | "city" | "price_per_night" | "status" | "created_at";

interface PropertyFilters {
  search?: string;
  status?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  page_size?: number;
}

const AllProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  
  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  const { user } = useAuth();


   const formatStatus = (status?: string) => {
    if (!status || typeof status !== 'string') return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };


  const formatLocation = (city?: string, state?: string) => {
    const cityText = city || 'Unknown';
    const stateText = state || 'Unknown';
    return `${cityText}, ${stateText}`;
  };

  // Fetch properties with current filters
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: PropertyFilters = {
        page: currentPage,
        page_size: pageSize,
      };
      
      // Add search filter
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      
      // Add status filter
      if (statusFilter) {
        filters.status = statusFilter;
      }
      
      // Note: The API doesn't support sorting yet, but we'll prepare for it
      // In a real implementation, you'd add sorting to the API filters
      
      const response = await propertyService.getProperties(filters);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setProperties(response.data.results);
        setTotalCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch properties');
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch properties when filters change
  useEffect(() => {
    fetchProperties();
  }, [currentPage, pageSize, searchQuery, statusFilter]);

  // Debounced search handler
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page when searching
      } else {
        fetchProperties();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    
    // For now, we'll sort client-side since API doesn't support it
    const sortedProperties = [...properties].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (field) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "city":
          aValue = a.city.toLowerCase();
          bValue = b.city.toLowerCase();
          break;
        case "price_per_night":
          aValue = a.price_per_night || 0;
          bValue = b.price_per_night || 0;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "created_at":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    setProperties(sortedProperties);
  };

  const getStatusBadgeColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };


  const handleExport = async () => {
    try {
      // In a real implementation, you'd call an export endpoint
      toast.info('Export functionality coming soon');
    } catch (error) {
      toast.error('Failed to export properties');
    }
  };

  const handleDownloadImages = async (propertyId: string) => {
    try {
      // In a real implementation, you'd call an endpoint to download property images
      toast.info('Image download functionality coming soon');
    } catch (error) {
      toast.error('Failed to download images');
    }
  };

  if (loading && properties.length === 0) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading properties...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && properties.length === 0) {
    return (
      <Layout hideFooter>
        <div className="flex">
          <Sidebar type="admin" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Properties</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchProperties}>Retry</Button>
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
              <h1 className="text-2xl font-bold text-airbnb-dark">All Properties</h1>
              <p className="text-sm text-airbnb-light mt-1">
                View and manage all properties in the platform
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" className="flex items-center gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Property Listings
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </CardTitle>
                  <CardDescription>
                    {totalCount} total properties
                  </CardDescription>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search properties..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full md:w-auto flex items-center justify-between gap-2">
                        <span>Status: {statusFilter || 'All'}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleStatusFilter(null)}>
                        All
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusFilter("active")}>
                        Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusFilter("draft")}>
                        Draft
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusFilter("inactive")}>
                        Inactive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px] cursor-pointer" onClick={() => handleSort("title")}>
                        Property {sortField === "title" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("city")}>
                        Location {sortField === "city" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("price_per_night")}>
                        Price {sortField === "price_per_night" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead>Details</TableHead>
                      {/* <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                        Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead> */}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            {property.images && property.images.length > 0 ? (
                              <img 
                                src={property.images[0].image_url} 
                                alt={property.title || 'Untitled Property'}
                                className="w-10 h-10 rounded-md object-cover" 
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center">
                                <MapPin className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{property.title || 'Untitled Property'}</div>
                             {property.bedrooms || 0} bed, {property.bathrooms || 0} bath
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{property.owner_name || 'Unknown Owner'}</TableCell>

                         <TableCell className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatLocation(property.city, property.state)}</span>
                          </TableCell>
                        <TableCell>
                         {property.display_price ? `${property.display_price}/night` : 'N/A'}
                        </TableCell>
                          <TableCell>
                          <div className="text-sm">
                            <div>{property.max_guests || 0} guests max</div>
                            <div className="text-gray-500">{property.booking_count || 0} bookings</div>
                          </div>
                        </TableCell>
                        {/* <TableCell>
                           <Badge className={getStatusBadgeColor(property.status)}>
                            {formatStatus(property.status)}
                          </Badge>
                        </TableCell> */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Link
                                  to={`/admin/properties/${property.id}`}
                                  className="flex items-center gap-2 w-full"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem onClick={() => handleDownloadImages(property.id)}>
                                <div className="flex items-center gap-2">
                                  <Download className="h-4 w-4" />
                                  Download Images
                                </div>
                              </DropdownMenuItem> */}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {properties.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No properties found matching your criteria.</p>
                  </div>
                )}
              </div>
              
              {/* Pagination */}
              {totalCount > pageSize && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-gray-500">
                    Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} properties
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage * pageSize >= totalCount}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AllProperties;