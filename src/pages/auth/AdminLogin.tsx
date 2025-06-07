// src/pages/auth/AdminLogin.tsx - Fixed with proper redirect handling
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

const AdminLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signInAnonymously, user, userProfile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handle redirect after successful authentication
  useEffect(() => {
    // console.log(user);
    console.log(userProfile);
    console.log('AdminLogin useEffect:', { loading, user: !!user, userProfile, userType: userProfile?.user_type });
    
    if (!loading && user && userProfile) {
      console.log('User authenticated, type:', userProfile.user_type);
      if (userProfile.user_type === 'admin') {
        console.log('Redirecting admin to /admin');
        navigate('/admin', { replace: true });
      } else {
        console.log('Non-admin user, redirecting to /login');
        // Non-admin user logged in, redirect to main login
        navigate('/login', { replace: true });
      }
    }
  }, [user, userProfile, loading, navigate]);

  // Show loading while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // If we already have an admin user, redirect immediately
  if (user && userProfile && userProfile.user_type === 'admin') {
    return <Navigate to="/admin" replace />
  }
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Invalid input",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Admin login failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Admin login successful",
          description: "Welcome to the admin portal.",
        });
        // Don't navigate here - let the useEffect handle it after auth state updates
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      await signInAnonymously('admin');
      toast({
        title: "Demo admin access granted",
        description: "You're now exploring as a demo administrator",
      });
      // Don't navigate here - let the useEffect handle it
    } catch (error) {
      toast({
        title: "Demo failed",
        description: "Failed to start admin demo mode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDemoLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-red-600 h-10 w-10 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">OnlyIfYouKnow Admin</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-300 mt-2">Secure administrative access</p>
        </div>
        
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Administrator Login</CardTitle>
            <CardDescription className="text-slate-300">
              Access the internal admin portal with your credentials
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-white">Email</Label>
                <Input 
                  id="admin-email" 
                  type="email" 
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-white">Password</Label>
                <div className="relative">
                  <Input 
                    id="admin-password" 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-slate-600/50"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading || demoLoading}
                type="submit"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Access Admin Portal"
                )}
              </Button>

              {/* Demo Mode Section */}
              {/* <div className="w-full">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-slate-800 text-slate-400">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4 bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:text-white"
                  onClick={handleDemoLogin}
                  disabled={isLoading || demoLoading}
                >
                  {demoLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading Demo...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Try Admin Demo
                    </>
                  )}
                </Button>
              </div> */}
              
              {/* <div className="text-center">
                <Link 
                  to="/" 
                  className="text-sm text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to main site
                </Link>
              </div> */}
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center mt-8">
          <p className="text-xs text-slate-400">
            This is a secure administrative area. All access is logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;