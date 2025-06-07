import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PropertyCard from "@/components/ui/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, MapPin } from "lucide-react";
import { mockProperties } from "@/data/mockData";
import { Property } from "@/components/ui/property-card";

const AllProperties = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);
  
  // Filter properties when search query changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = query 
      ? mockProperties.filter(property => 
          property.title.toLowerCase().includes(query.toLowerCase()) ||
          property.location.toLowerCase().includes(query.toLowerCase())
        )
      : mockProperties;
    setFilteredProperties(filtered);
  };

  // Sort properties
  const handleSort = (value: string) => {
    setSortBy(value);
    let sorted = [...filteredProperties];
    
    switch (value) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        // For demo purposes, we'll just reverse the order
        sorted.reverse();
        break;
      default:
        // Featured - keep original order
        sorted = mockProperties.filter(p => 
          searchQuery ? 
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.location.toLowerCase().includes(searchQuery.toLowerCase())
          : true
        );
    }
    
    setFilteredProperties(sorted);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-white py-12 border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">All Properties</h1>
              <p className="text-xl text-gray-600">
                Discover unique stays from our trusted network
              </p>
            </div>
            
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by location or property name..."
                  className="pl-10 h-12"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="w-full md:w-48 h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" className="h-12 px-6">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div className="text-gray-600">
                {filteredProperties.length} properties found
                {searchQuery && (
                  <span> for "{searchQuery}"</span>
                )}
              </div>
            </div>
            
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or browse all properties
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setFilteredProperties(mockProperties);
                  }}
                >
                  Clear search
                </Button>
              </div>
            )}
            
            {/* Load More Button */}
            {filteredProperties.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load More Properties
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AllProperties;
