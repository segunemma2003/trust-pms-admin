
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, ChevronRight, LockKeyhole, Mail, User } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const UserOnboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission
      toast.success("Account created successfully!");
      // In a real app, this would be an API call to create the account
      setTimeout(() => {
        navigate("/");
      }, 1500);
    }
  };

  return (
    <Layout userType="user" hideFooter={true}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-airbnb-primary/10 to-white py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-airbnb-dark">Join OIFYK</h1>
            <p className="text-airbnb-light mt-2">Create your guest account</p>
          </div>
          
          <Card className="shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full ${currentStep >= 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                    {currentStep > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
                  </span>
                  <span className="text-sm">Account</span>
                </div>
                <div className="h-px bg-gray-200 flex-grow mx-2"></div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full ${currentStep >= 2 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                    {currentStep > 2 ? <CheckCircle2 className="h-4 w-4" /> : "2"}
                  </span>
                  <span className="text-sm">Verify</span>
                </div>
              </div>
              
              <CardTitle>
                {currentStep === 1 ? "Create Your Account" : "Verify Your Email"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 ? "Enter your information to sign up" : "Final step to complete your registration"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {currentStep === 1 && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="john.doe@example.com" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LockKeyhole className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  
                  {currentStep === 2 && (
                    <>
                      <div className="bg-muted p-4 rounded-md mb-4">
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Email</span>
                          <span className="text-sm">{form.getValues().email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Name</span>
                          <span className="text-sm">{form.getValues().firstName} {form.getValues().lastName}</span>
                        </div>
                      </div>
                      
                      <div className="text-center py-6">
                        <Mail className="h-12 w-12 mx-auto text-airbnb-primary mb-3" />
                        <h3 className="text-lg font-medium mb-2">Check Your Email</h3>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                          We've sent a verification link to{" "}
                          <strong>{form.getValues().email}</strong>. Please click the link to verify your email.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Didn't receive the email?
                          </p>
                          <button type="button" className="text-sm text-airbnb-primary mt-1 underline">
                            Resend verification email
                          </button>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="terms"
                            className="rounded border-gray-300"
                            required
                          />
                          <label htmlFor="terms" className="text-sm text-muted-foreground">
                            I agree to the <a href="#" className="text-airbnb-primary">Terms of Service</a> and <a href="#" className="text-airbnb-primary">Privacy Policy</a>
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between pt-4">
                    {currentStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(currentStep - 1)}
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      type="submit"
                      className={`${currentStep < 2 ? "" : "bg-green-600 hover:bg-green-700"} ml-auto`}
                    >
                      {currentStep < 2 ? (
                        <>
                          Continue <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        "Complete Setup"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an account? <a href="/login" className="text-airbnb-primary hover:underline">Sign in</a>
            </p>
            <p className="text-sm text-muted-foreground">
              Are you a property owner? <a href="/onboarding/owner" className="text-airbnb-primary hover:underline">Register as owner</a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserOnboarding;
