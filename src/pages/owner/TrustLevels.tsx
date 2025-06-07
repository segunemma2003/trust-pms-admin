
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import TrustLevelBadge from "@/components/ui/trust-level-badge";
import { mockTrustLevels } from "@/data/mockData";
import { InfoIcon, Plus, Shield, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TrustLevels = () => {
  const { toast } = useToast();
  const [trustLevels, setTrustLevels] = useState(mockTrustLevels);
  
  const handleDeleteLevel = (id: string) => {
    if (trustLevels.length <= 1) {
      toast({
        title: "Cannot delete",
        description: "You must have at least one trust level.",
        variant: "destructive",
      });
      return;
    }
    
    setTrustLevels(trustLevels.filter(level => level.id !== id));
    toast({
      title: "Trust level deleted",
      description: "The trust level has been successfully removed.",
    });
  };
  
  return (
    <Layout userType="owner" hideFooter>
      <div className="flex">
        <Sidebar type="owner" />
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-airbnb-dark">Trust Levels</h1>
              <p className="text-sm text-airbnb-light mt-1">
                Manage trust levels and personalized discounts
              </p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0 bg-airbnb-primary hover:bg-airbnb-primary/90 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Trust Level
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Trust Level</DialogTitle>
                  <DialogDescription>
                    Add a new trust level with custom discount.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right col-span-1">Name</FormLabel>
                    <Input className="col-span-3" placeholder="Enter level name" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right col-span-1">Level</FormLabel>
                    <div className="flex items-center gap-2 col-span-3">
                      <Input 
                        type="number" 
                        className="w-20" 
                        min="1" 
                        max="5" 
                        defaultValue="3" 
                      />
                      <span className="text-sm text-airbnb-light">(1-5)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right col-span-1">Discount</FormLabel>
                    <div className="flex items-center gap-2 col-span-3">
                      <Input 
                        type="number" 
                        className="w-20" 
                        min="0" 
                        max="50" 
                        defaultValue="10" 
                      />
                      <span className="text-sm text-airbnb-light">%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <FormLabel className="text-right col-span-1 pt-2">Description</FormLabel>
                    <Textarea 
                      className="col-span-3" 
                      placeholder="Enter a brief description" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <FormLabel className="text-right col-span-1 pt-2">Criteria</FormLabel>
                    <Textarea 
                      className="col-span-3" 
                      placeholder="Enter criteria for this level" 
                    />
                  </div>
                </form>
                <DialogFooter>
                  <Button variant="outline" className="mr-2">Cancel</Button>
                  <Button 
                    onClick={() => {
                      toast({
                        title: "Trust level created",
                        description: "The new trust level has been successfully added.",
                      });
                    }}
                  >
                    Create Level
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                About Trust Levels
              </CardTitle>
              <CardDescription>
                Customize discounts for different guests based on your relationship with them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg flex items-center gap-4 mb-4">
                <div className="bg-airbnb-primary/10 rounded-full p-2">
                  <InfoIcon className="h-5 w-5 text-airbnb-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">What are trust levels?</h3>
                  <p className="text-sm text-airbnb-light mt-1">
                    Trust levels allow you to offer personalized discounts to different guests based on your trust relationship. For example, offer bigger discounts to family and friends, and smaller ones to new guests.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center overflow-x-auto py-2 gap-3 mb-4">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div 
                    key={level}
                    className={`flex flex-col items-center p-2 rounded-lg min-w-16 ${
                      level === 3 ? 'bg-oifyk-100 border border-oifyk-300' : ''
                    }`}
                  >
                    <TrustLevelBadge level={level as 1 | 2 | 3 | 4 | 5} size="lg" />
                    <span className="text-xs text-airbnb-light mt-1">Level {level}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            {trustLevels.map((level) => (
              <Card key={level.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <TrustLevelBadge level={level.level as 1 | 2 | 3 | 4 | 5} size="lg" />
                    <div>
                      <CardTitle>{level.name}</CardTitle>
                      <CardDescription>Level {level.level}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-airbnb-primary mr-2">
                      {level.discount}%
                    </span>
                    <span className="text-sm text-airbnb-light">discount</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-airbnb-light">{level.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-1">Criteria</h4>
                      <p className="text-sm text-airbnb-light">{level.criteria}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-3">Discount Rate</h4>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Slider 
                            defaultValue={[level.discount]} 
                            max={50} 
                            step={1} 
                            className="w-full" 
                          />
                        </div>
                        <div className="flex items-center gap-2 min-w-[80px]">
                          <Input
                            type="number"
                            className="w-16 h-8"
                            defaultValue={level.discount}
                            min={0}
                            max={50}
                          />
                          <span className="text-airbnb-light">%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button variant="outline">Edit</Button>
                      <Button 
                        variant="ghost" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteLevel(level.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button className="bg-airbnb-primary hover:bg-airbnb-primary/90">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrustLevels;
