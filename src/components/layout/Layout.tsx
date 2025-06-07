// src/components/layout/Layout.tsx - Updated with auth integration
import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

type LayoutProps = {
  children: ReactNode;
  userType?: 'admin' | 'owner' | 'user';
  hideFooter?: boolean;
};

const Layout = ({ children, userType, hideFooter = false }: LayoutProps) => {
  const { userProfile, isAnonymous } = useAuth();
  
  // Use auth context user type if available, fallback to props
  const actualUserType = userProfile?.user_type || userType;
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header userType={actualUserType} />
      <main className="flex-1">
        {/* Demo Mode Notification */}
        {isAnonymous && (
          <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
            <div className="max-w-7xl mx-auto">
              <Alert className="border-blue-200 bg-transparent">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  You're in demo mode as a <span className="font-medium capitalize">{actualUserType}</span>. 
                  Features like email sending are simulated, and data changes won't be saved permanently.
                  <button 
                    onClick={() => window.location.href = '/login'}
                    className="ml-2 underline hover:no-underline"
                  >
                    Exit demo
                  </button>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;