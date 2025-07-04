import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, MapPin, Download, Filter, Star, MoreHorizontal, ChevronDown } from "lucide-react";
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

type SortDirection = "asc" | "desc";
type SortField = "title" | "location" | "price" | "rating" | "status";

const AllProperties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const [properties, setProperties] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProperties = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      let url = `/api/properties/?page=1&page_size=100`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (sortField) url += `&ordering=${sortDirection === 'asc' ? '' : '-'}${sortField}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProperties(data.results || []);
      } else {
        setProperties([]);
      }
    };
    fetchProperties();
  }, [searchQuery, statusFilter, sortField, sortDirection]);
  
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
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Property Listings</CardTitle>
                  <CardDescription>
                    {properties.length} total properties
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
                      <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                        All
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                        Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
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
                      <TableHead className="cursor-pointer" onClick={() => handleSort("location")}>
                        Location {sortField === "location" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
                        Price {sortField === "price" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("rating")}>
                        Rating {sortField === "rating" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                        Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <img 
                              src={property.images[0]} 
                              alt={property.title} 
                              className="w-10 h-10 rounded-md object-cover" 
                            />
                            <span>{property.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{property.owner}</TableCell>
                        <TableCell className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {property.location}
                        </TableCell>
                        <TableCell>${property.price}/night</TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-yellow-400" />
                          {property.rating || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              property.status === "active"
                                ? "bg-green-100 text-green-800"
                                : property.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                          </Badge>
                        </TableCell>
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
                                  to={`/properties/${property.id}`}
                                  className="flex items-center gap-2 w-full"
                                >
                                  <Eye className="h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <div className="flex items-center gap-2">
                                  <Download className="h-4 w-4" />
                                  Download Images
                                </div>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AllProperties;
