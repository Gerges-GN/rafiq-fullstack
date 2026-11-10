// Tourist Layout file
import { Outlet, useOutletContext } from "react-router-dom";
import TouristNav from "./TouristNav";
import Footer from "./Footer";
import ChatWidget, { ChatProvider } from "../../Features/chat";
import { useAuth } from "../../auth/AuthContext";

const Layout = () => {
  const outletUser = useOutletContext();
  const { user: authUser } = useAuth();
  const verifiedUser = outletUser || authUser;
  return (
    <div className="w-full flex flex-col min-h-screen">
      <TouristNav verifiedUser={verifiedUser} />
      <div className="flex-1 bg-slate-50">
        <ChatProvider>
          <Outlet context={verifiedUser} />
          <ChatWidget />
        </ChatProvider>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
