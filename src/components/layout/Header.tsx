import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, User, Settings, LogOut, Bell } from "lucide-react";
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

const Header = () => {
  const isMobile = useIsMobile();
  const { user, userProfile, signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b shadow-sm">
      <div className="oifyk-container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 sm:w-72">
                <nav className="flex flex-col gap-4 pt-4">
                  <Link to="/admin" className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted">
                    <Settings size={18} />
                    Dashboard
                  </Link>
                  <Link to="/admin/invitations" className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted">
                    <User size={18} />
                    Invitations
                  </Link>
                  <Link to="/admin/properties" className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted">
                    <Settings size={18} />
                    Properties
                  </Link>
                  <Link to="/admin/users" className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted">
                    <User size={18} />
                    Users
                  </Link>
                  <Link to="/admin/reports" className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted">
                    <Settings size={18} />
                    Reports
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          )}
          
          <Link to="/admin" className="flex items-center gap-2">
            <div className="bg-red-600 h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold">
              O
            </div>
            <span className="text-xl font-bold text-gray-900">OnlyIfYouKnow</span>
          </Link>
          
          <div className="hidden md:flex items-center ml-2">
            <span className="text-sm text-gray-600 px-2 py-1 bg-gray-100 rounded-full">
              Admin Portal
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full bg-gray-900 text-white">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userProfile?.full_name || 'Admin User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userProfile?.email || 'admin@example.com'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Administrator
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/admin/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
                <User className="h-4 w-4" />
                Admin Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;