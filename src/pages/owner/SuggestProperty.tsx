
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Home, ImagePlus, Loader2, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const propertyFormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters long",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters long",
  }),
  location: z.string().min(3, {
    message: "Location must be at least 3 characters long",
  }),
  address: z.string().min(5, {
    message: "Please provide a complete address",
  }),
  pricePerNight: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, {
    message: "Price must be a positive number",
  }),
  bedrooms: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, {
    message: "Bedrooms must be a positive number",
  }),
  bathrooms: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, {
    message: "Bathrooms must be a positive number",
  }),
  maxGuests: z.string().refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0, {
    message: "Max guests must be a positive number",
  }),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

const SuggestProperty = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]); 
  const navigate = useNavigate();
  
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      address: "",
      pricePerNight: "",
      bedrooms: "",
      bathrooms: "",
      maxGuests: "",
    },
  });

  const onSubmit = (values: PropertyFormValues) => {
    if (imageUrls.length === 0) {
      toast.error("Please upload at least one image of your property");
      return;
    }
    
    setIsSubmitting(true);

    // Simulate API request with timeout
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Property suggested successfully! Awaiting admin approval.");

      // In a real app, redirect after property has been saved to the database
      navigate("/owner/properties");
    }, 1500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Process multiple images
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setImageUrls(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Layout userType="owner" hideFooter>
      <div className="flex">
        <Sidebar type="owner" />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-airbnb-dark">Suggest a Property</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Submit your property details for approval
              </p>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property Details
              </CardTitle>
              <CardDescription>
                Provide comprehensive information about your property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter property title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe your property" 
                                className="min-h-32" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="City, Country" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Address</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Street address" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="pricePerNight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price per Night</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="$" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <FormItem>
                        <FormLabel>Property Images</FormLabel>
                        <FormDescription>Upload multiple images of your property (max 10)</FormDescription>
                        
                        <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 bg-muted">
                          {imageUrls.length > 0 ? (
                            <div className="w-full">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                                {imageUrls.map((url, index) => (
                                  <div key={index} className="relative group">
                                    <img 
                                      src={url} 
                                      alt={`Property image ${index + 1}`} 
                                      className="h-24 w-full object-cover rounded" 
                                    />
                                    <Button 
                                      type="button"
                                      size="icon"
                                      variant="destructive"
                                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => removeImage(index)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                              
                              {imageUrls.length < 10 && (
                                <div className="flex justify-center">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm"
                                    className="mt-2 flex items-center gap-1"
                                    asChild
                                  >
                                    <label htmlFor="images-upload" className="cursor-pointer">
                                      <ImagePlus className="h-4 w-4" /> Add more images
                                    </label>
                                  </Button>
                                  <Input
                                    id="images-upload"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={imageUrls.length >= 10}
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              <ImagePlus className="h-10 w-10 text-airbnb-light mb-2" />
                              <p className="text-sm text-airbnb-light mb-2">Upload property images</p>
                              <Input
                                id="images-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                className="w-full max-w-xs"
                              />
                              <p className="text-xs text-airbnb-light mt-2">
                                You can select multiple images at once
                              </p>
                            </>
                          )}
                        </div>
                        {imageUrls.length > 0 && (
                          <p className="text-xs text-airbnb-light mt-2">
                            {imageUrls.length} of 10 images uploaded
                          </p>
                        )}
                      </FormItem>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="bedrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bedrooms</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="bathrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bathrooms</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="maxGuests"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Guests</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <p className="text-sm text-yellow-800 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Your property will be reviewed by an admin before being listed on the platform.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-airbnb-primary hover:bg-airbnb-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Property"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SuggestProperty;
