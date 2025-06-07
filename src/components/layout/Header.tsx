
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, Search, User, Home, Settings, LogIn, Users, Bell, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type HeaderProps = {
  userType?: 'admin' | 'owner' | 'user' | undefined;
};

const Header = ({ userType }: HeaderProps) => {
  const isMobile = useIsMobile();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const { user, userProfile, signOut, isAnonymous } = useAuth();
  
  // Use auth context data if available, fallback to props
  const actualUserType = userProfile?.user_type || userType;
  
  const getPortalName = () => {
    switch(actualUserType) {
      case 'admin': return 'Admin Portal';
      case 'owner': return 'Owner Portal';
      case 'user': return 'User Portal';
      default: return null;
    }
  };

  const portalName = getPortalName();
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b shadow-sm">
      {/* Demo Badge */}
      {isAnonymous && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="oifyk-container flex items-center justify-center">
            <Badge variant="secondary" className="text-xs">
              Demo Mode - Exploring as {actualUserType}
            </Badge>
          </div>
        </div>
      )}
      
      <div className="oifyk-container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && actualUserType && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 sm:w-72">
                <nav className="flex flex-col gap-4 pt-4">
                  <Link to="/" className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted">
                    <Home size={18} />
                    Home
                  </Link>
                  {actualUserType === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted">
                      <Settings size={18} />
                      Admin Portal
                    </Link>
                  )}
                  {actualUserType === 'owner' && (
                    <Link to="/owner" className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted">
                      <Users size={18} />
                      Owner Portal
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          )}
          
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-airbnb-primary h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold">
              O
            </div>
            <span className="text-xl font-bold text-airbnb-dark">OnlyIfYouKnow</span>
          </Link>
          
          {portalName && (
            <div className="hidden md:flex items-center ml-2">
              <span className="text-sm text-airbnb-light px-2 py-1 bg-gray-100 rounded-full">
                {portalName}
              </span>
            </div>
          )}
        </div>
        
        {actualUserType === 'user' && (
          <div 
            className={cn(
              "hidden md:flex items-center transition-all duration-300 ease-in-out", 
              isSearchActive ? "w-[400px]" : "w-auto"
            )}
          >
            <Button 
              variant="outline" 
              className="rounded-full px-4 py-2 flex items-center gap-2"
              onClick={() => setIsSearchActive(!isSearchActive)}
            >
              <Search className="h-4 w-4" />
              {isSearchActive ? (
                <input 
                  className="border-none outline-none bg-transparent flex-1" 
                  placeholder="Search properties..." 
                  autoFocus
                  onBlur={() => setIsSearchActive(false)}
                />
              ) : (
                <span>Search properties</span>
              )}
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {!user && (
            <Link to="/login">
              <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Log In
              </Button>
            </Link>
          )}
          
          {user && (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-airbnb-primary rounded-full"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full bg-airbnb-dark text-white">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userProfile?.full_name || 'User'}
                        {isAnonymous && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Demo
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userProfile?.email || 'demo@example.com'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {actualUserType} Account
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Role-specific menu items */}
                  {actualUserType === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {actualUserType === 'owner' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/owner" className="cursor-pointer">
                          <Home className="mr-2 h-4 w-4" />
                          Owner Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/owner/properties" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          My Properties
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {!isAnonymous && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-airbnb-primary">
                    <LogOut className="mr-2 h-4 w-4" />
                    {isAnonymous ? 'Exit Demo' : 'Sign out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
