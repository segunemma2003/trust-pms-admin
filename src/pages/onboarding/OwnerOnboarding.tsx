import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent,
  CardDescription,
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
import { CheckCircle2, ChevronRight, LockKeyhole, Mail, User, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useValidateOnboardingToken } from "@/hooks/useQueries";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  
  phone: z.string().optional(),
  companyName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const OwnerOnboarding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
 const { signUp, signIn, user, userProfile } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const token = searchParams.get('token');
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useValidateOnboardingToken(token || '');
  

  console.log('🔍 OwnerOnboarding Debug:', {
  token: token,
  tokenLength: token?.length,
  tokenData: tokenData,
  tokenDataStringified: JSON.stringify(tokenData, null, 2), // ADD THIS LINE
  tokenLoading: tokenLoading,
  tokenError: tokenError
});

  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      companyName: ""
    },
  });

  // Also add debug logs in the getTokenData function:
const getTokenData = () => {
  console.log('🔍 getTokenData called:', { tokenError, tokenData });
  console.log('🔍 tokenData structure:', JSON.stringify(tokenData, null, 2));
  
  // Check if tokenError exists (from the hook)
  if (tokenError) {
    console.log('❌ getTokenData: tokenError exists, returning null');
    return null;
  }
  
  // Check if no tokenData
  if (!tokenData) {
    console.log('❌ getTokenData: no tokenData, returning null');
    return null;
  }
  
  // FIXED: Check if tokenData contains an error object WITH A NON-NULL ERROR
  if (tokenData && typeof tokenData === 'object' && 'error' in tokenData && tokenData.error !== null) {
    console.log('❌ getTokenData: tokenData contains error, returning null', tokenData.error);
    return null;
  }
  
  // Handle different possible data structures
  if (tokenData && 'data' in tokenData && Array.isArray(tokenData.data) && tokenData.data.length > 0) {
    console.log('✅ getTokenData: found data array format', tokenData.data[0]);
    return tokenData.data[0];
  }
  
  if (Array.isArray(tokenData) && tokenData.length > 0) {
    console.log('✅ getTokenData: found direct array format', tokenData[0]);
    return tokenData[0];
  }
  
  if (tokenData && typeof tokenData === 'object' && 'is_valid' in tokenData) {
    console.log('✅ getTokenData: found direct object format', tokenData);
    return tokenData;
  }
  
  console.log('❌ getTokenData: no valid format found, returning null');
  return null;
};
  const validTokenData = getTokenData();

  console.log('🔍 validTokenData result:', validTokenData);

  useEffect(() => {
  if (validTokenData && validTokenData.is_valid) {
    form.setValue('email', validTokenData.email);
  }
}, [validTokenData, form]);

// Redirect if no token or invalid token
useEffect(() => {
  if (!token) {
    toast.error('No invitation token provided');
    navigate('/login');
    return;
  }

  // Check for errors
  if (tokenError) {
    console.error('Token validation error:', tokenError);
    toast.error('Invalid or expired invitation token');
    navigate('/login');
    return;
  }

  // Only check validity after data is loaded and not loading
  if (!tokenLoading && tokenData) {
    if (!validTokenData || !validTokenData.is_valid) {
      toast.error('Invalid or expired invitation token');
      navigate('/login');
      return;
    }
  }
}, [token, tokenData, tokenError, tokenLoading, validTokenData, navigate]);

// Handle already authenticated users (keep this one as is)
useEffect(() => {
  // If user is already authenticated and this is not their onboarding flow,
  // redirect them to their dashboard
  if (user && userProfile && userProfile.onboarding_completed) {
    const dashboardPath = userProfile.user_type === 'owner' ? '/owner' : '/';
    navigate(dashboardPath);
    return;
  }
}, [user, userProfile, navigate]);


  // Helper function to update invitation status
  const updateInvitationStatus = async (invitationId: string, userId: string) => {
    try {
      console.log('Updating invitation status for:', { invitationId, userId });
      
      const { error: invitationUpdateError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_by: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (invitationUpdateError) {
        console.error('Failed to update invitation status:', invitationUpdateError);
        toast.warning('Account created successfully, but failed to update invitation status');
      } else {
        console.log('✅ Invitation status updated successfully');
      }

      // Also mark the onboarding token as used
      const { error: tokenUpdateError } = await supabase
        .from('onboarding_tokens')
        .update({
          used_at: new Date().toISOString(),
          used_by: userId
        })
        .eq('token', token);

      if (tokenUpdateError) {
        console.error('Failed to mark token as used:', tokenUpdateError);
      } else {
        console.log('✅ Token marked as used');
      }

    } catch (error) {
      console.error('Error updating invitation/token status:', error);
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
  if (currentStep < 3) {
    setCurrentStep(currentStep + 1);
  } else {
    // Final submission - create account
    if (!validTokenData) {
      toast.error('Invalid token data');
      return;
    }

    setLoading(true);

    try {
      const { email, user_type, invitation_id } = validTokenData;
      
      console.log('Starting registration process:', { email, user_type, invitation_id });

      // Step 1: Create user account
      const signUpResult = await signUp(email, values.password, {
        full_name: `${values.firstName} ${values.lastName}`,
        phone: values.phone || null,
        user_type,
        metadata: {
          company_name: values.companyName || null,
          onboarding_completed: true,
          invitation_token: token,
          invitation_id: invitation_id
        }
      });

      if (signUpResult.error) {
        console.error('SignUp error:', signUpResult.error);
        toast.error(signUpResult.error.message);
        return;
      }

      console.log('✅ Account created successfully');

      // Step 2: Sign in the user
      const signInResult = await signIn(email, values.password);
      
      if (signInResult.error) {
        console.error('SignIn error:', signInResult.error);
        toast.error('Account created but failed to sign in. Please try logging in manually.');
        navigate('/login');
        return;
      }

      console.log('✅ User signed in successfully');

      // Step 3: Get the current user to update invitation status
      if (invitation_id) {
        // Get the current user from Supabase auth
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser?.id) {
          await updateInvitationStatus(invitation_id, currentUser.id);
        } else {
          console.warn('⚠️  No user ID found after sign in, skipping invitation status update');
        }
      } else {
        console.warn('⚠️  No invitation_id found, skipping invitation status update');
      }

      // Step 4: Success and redirect
      toast.success('Welcome to OIFYK! Your account has been created successfully!');
      
      setTimeout(() => {
        navigate(user_type === 'owner' ? '/owner' : '/');
      }, 1500);

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  }
};

  // Loading state while validating token
  if (tokenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-airbnb-primary/10 to-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-airbnb-primary" />
          <p className="text-airbnb-light">Validating invitation...</p>
        </div>
      </div>
    );
  }

  // Error state - check for error OR invalid token data
  if (tokenError || !validTokenData || !validTokenData.is_valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-airbnb-primary/10 to-white">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
              <p className="text-gray-600 mb-4">
                This invitation token is invalid or has expired.
              </p>
              <Button onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // At this point, we know validTokenData exists and is valid
  const { email, user_type } = validTokenData;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-airbnb-primary/10 to-white py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-airbnb-dark">Welcome to OIFYK</h1>
          <p className="text-airbnb-light mt-2">
            Set up your {user_type} account
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Email: {email}
          </p>
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
                <span className="text-sm">Profile</span>
              </div>
              <div className="h-px bg-gray-200 flex-grow mx-2"></div>
              <div className="flex items-center gap-2">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full ${currentStep >= 3 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                  {currentStep > 3 ? <CheckCircle2 className="h-4 w-4" /> : "3"}
                </span>
                <span className="text-sm">Complete</span>
              </div>
            </div>
            
            <CardTitle>
              {currentStep === 1 ? "Create Your Account" : 
               currentStep === 2 ? "Complete Your Profile" :
               "Complete Registration"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 ? "Set up your account credentials" : 
               currentStep === 2 ? "Tell us more about yourself" :
               "Review and complete your registration"}
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
                              <Input 
                                placeholder="john.doe@example.com" 
                                className="pl-9 bg-gray-50" 
                                {...field} 
                                disabled
                              />
                            </div>
                          </FormControl>
                          <p className="text-xs text-gray-500">This email was provided in your invitation</p>
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
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+1 (555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {user_type === 'owner' && (
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Company LLC" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {user_type === 'owner' && (
                      <div className="space-y-2">
                        <Label>Property Types You Plan to List</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="border rounded-md p-3 cursor-pointer hover:bg-muted">
                            <h4 className="font-medium">Residential</h4>
                            <p className="text-xs text-muted-foreground">Homes, apartments, etc.</p>
                          </div>
                          <div className="border rounded-md p-3 cursor-pointer hover:bg-muted">
                            <h4 className="font-medium">Commercial</h4>
                            <p className="text-xs text-muted-foreground">Offices, retail spaces</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label>How did you hear about us?</Label>
                      <select
                        className="w-full border border-input rounded-md h-10 px-3"
                        defaultValue=""
                      >
                        <option value="" disabled>Please select...</option>
                        <option value="search">Search Engine</option>
                        <option value="friend">Friend/Referral</option>
                        <option value="social">Social Media</option>
                        <option value="ad">Advertisement</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </>
                )}
                
                {currentStep === 3 && (
                  <>
                    <div className="bg-muted p-4 rounded-md mb-4">
                      <h3 className="font-medium mb-2">Review Your Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">Account Type:</span>
                          <span className="capitalize">{user_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Email:</span>
                          <span>{form.getValues().email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Name:</span>
                          <span>{form.getValues().firstName} {form.getValues().lastName}</span>
                        </div>
                        {form.getValues().phone && (
                          <div className="flex justify-between">
                            <span className="font-medium">Phone:</span>
                            <span>{form.getValues().phone}</span>
                          </div>
                        )}
                        {form.getValues().companyName && (
                          <div className="flex justify-between">
                            <span className="font-medium">Company:</span>
                            <span>{form.getValues().companyName}</span>
                          </div>
                        )}
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
                          I agree to the <a href="#" className="text-airbnb-primary hover:underline">Terms of Service</a> and <a href="#" className="text-airbnb-primary hover:underline">Privacy Policy</a>
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
                      disabled={loading}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className={`${currentStep < 3 ? "" : "bg-green-600 hover:bg-green-700"} ml-auto`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : currentStep < 3 ? (
                      <>
                        Continue <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground">
          Need help? <a href="mailto:support@oifyk.com" className="text-airbnb-primary hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
};

export default OwnerOnboarding;