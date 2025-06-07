
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  Users,
  Map,
  FileText,
  Settings,
  Shield,
  Book,
  Bell,
  User,
  Calendar,
  CreditCard,
  LayoutDashboard,
  Building,
  Eye
} from 'lucide-react';

type SidebarProps = {
  type: 'admin' | 'owner';
};

const Sidebar = ({ type }: SidebarProps) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  
  const adminLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Owners', icon: Users, path: '/admin/owners' },
    { name: 'Users', icon: User, path: '/admin/users' },
    { name: 'Invitations', icon: FileText, path: '/admin/invitations' },
    { name: 'All Properties', icon: Building, path: '/admin/all-properties' },
    { name: 'Suggested Properties', icon: Map, path: '/admin/suggested-properties' },
    { name: 'Fund Requests', icon: CreditCard, path: '/admin/fund-requests' },
    { name: 'Reports', icon: Book, path: '/admin/reports' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];
  
  const ownerLinks = [
    { name: 'Dashboard', icon: Home, path: '/owner' },
    { name: 'My Properties', icon: Building, path: '/owner/properties' },
    { name: 'Suggest Property', icon: Map, path: '/owner/suggest-property' },
    { name: 'Trust Levels', icon: Shield, path: '/owner/trust-levels' },
    { name: 'My Network', icon: Users, path: '/owner/network' },
    { name: 'Bookings', icon: Calendar, path: '/owner/bookings' },
    { name: 'Payments', icon: CreditCard, path: '/owner/payments' },
    { name: 'Settings', icon: Settings, path: '/owner/settings' },
  ];
  
  const links = type === 'admin' ? adminLinks : ownerLinks;
  
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r p-4">
      <div className="mb-6 px-2">
        <h2 className="font-bold text-lg text-airbnb-dark">
          {type === 'admin' ? 'Admin Portal' : 'Owner Portal'}
        </h2>
        <p className="text-sm text-airbnb-light mt-1">
          {type === 'admin' 
            ? 'Manage platform and users' 
            : 'Manage your properties'
          }
        </p>
      </div>
      
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              "flex items-center px-4 py-3 text-sm rounded-lg transition-colors",
              isActive(link.path)
                ? "bg-airbnb-primary/10 text-airbnb-primary font-medium"
                : "text-airbnb-light hover:bg-gray-100"
            )}
          >
            <link.icon className="h-5 w-5 mr-3" />
            {link.name}
          </Link>
        ))}
      </nav>
      
      <div className="mt-auto pt-4 border-t">
        <Link
          to="/help"
          className="flex items-center px-4 py-3 text-sm rounded-lg text-airbnb-light hover:bg-gray-100"
        >
          <Bell className="h-5 w-5 mr-3" />
          Help & Support
        </Link>
        <Link
          to="/"
          className="flex items-center px-4 py-3 text-sm rounded-lg text-airbnb-light hover:bg-gray-100"
          target="_blank"
        >
          <Eye className="h-5 w-5 mr-3" />
          View Public Site
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
