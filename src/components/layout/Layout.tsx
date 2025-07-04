import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "@/contexts/AuthContext";

type LayoutProps = {
  children: ReactNode;
  hideFooter?: boolean;
};

const Layout = ({ children, hideFooter = false }: LayoutProps) => {
  const { userProfile } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default Layout;