import { useSelector } from "react-redux";
import { Toaster } from "sonner";
import ScrollToTop from "./components/common/scroll-to-top";
import SessionTimeoutTracker from "./components/session-timeout-tracker/session-timeout-tracker";
import AppRoutes from "./routes/app-routes";
import useAppLogout from "./utils/logout";


function App() {
  const time = useSelector((state) => state.auth.tokenExpireAt);
  const handleLogout = useAppLogout();

  return (
    <>
      {/* <DisabledRightClick /> */}
      <Toaster richColors position="top-right" />
      <ScrollToTop />
      <SessionTimeoutTracker expiryTime={time} onLogout={handleLogout} />
     
      <AppRoutes />
    </>
  );
}

export default App;
