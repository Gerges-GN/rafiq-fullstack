// Tourist Layout file
import { Outlet } from "react-router-dom";
import Loading from "./Loading";
import TouristNav from "./TouristNav";
import Footer from "./Footer";
import ChatWidget, { ChatProvider } from "../../Features/chat";

const Layout = () => {
  const user = true;

  return user ? (
    <div className="w-full flex flex-col min-h-screen">
      <TouristNav />
      <div className="flex-1 bg-slate-50">
        <ChatProvider>
          <Outlet />
          <ChatWidget />
        </ChatProvider>
      </div>
      <Footer />
    </div>
  ) : (
    <Loading height="h-screen" />
  );
};

export default Layout;
