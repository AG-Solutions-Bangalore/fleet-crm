import LoadingBar from "@/components/loader/loading-bar";
import { PANEL_CHECK } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/useApiMutation";
import { logout } from "@/store/auth/authSlice";
import { setCompanyDetails, setCompanyImage } from "@/store/auth/companySlice";
import { setShowUpdateDialog } from "@/store/auth/versionSlice";
import { persistor } from "@/store/store";
import { getAuthToken } from "@/utils/authToken";
import appLogout from "@/utils/logout";
import CryptoJS from "crypto-js";
import { createContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

export const ContextPanel = createContext();

const secretKey = import.meta.env.VITE_SECRET_KEY;
const validationKey = import.meta.env.VITE_SECRET_VALIDATION;

const AppProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const Logout = appLogout();
  const { trigger, loading } = useApiMutation();

  const reduxToken = useSelector((state) => state.auth.token);
  const token = getAuthToken(reduxToken);
  const localVersion = useSelector((state) => state.auth?.version);

  const [isPanelUp, setIsPanelUp] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const handleCriticalError = (msg) => {
    console.error(msg);
    dispatch(logout());
    persistor.purge();
    navigate("/maintenance");
  };

  const initializeApp = async () => {
    try {
      if (!secretKey || !validationKey) {
        throw new Error("Missing environment variables");
      }

      const panelRes = await trigger({ url: PANEL_CHECK.getPanelStatus });
      if (panelRes?.message !== "Success") {
        throw new Error("Panel check failed");
      }

      setIsPanelUp(true);

      if (panelRes?.code === 201) {
        dispatch(setCompanyDetails(panelRes.company_detils));
        dispatch(setCompanyImage(panelRes.image_url));
      }

      const serverVersion = panelRes?.version?.version_panel;
      if (token) {
        dispatch(
          setShowUpdateDialog({
            showUpdateDialog: localVersion !== serverVersion,
            version: serverVersion,
          }),
        );
      }

      const envRes = await trigger({ url: PANEL_CHECK.getEnvStatus });
      const computedHash = CryptoJS.MD5(validationKey).toString();

      if (envRes?.data !== computedHash) {
        throw new Error("Environment validation failed");
      }

      if (location.pathname === "/maintenance") {
        navigate("/");
      }

      setInitialized(true);
    } catch (error) {
      handleCriticalError(error.message);
    }
  };

  const pollPanelStatus = async () => {
    try {
      const res = await trigger({ url: PANEL_CHECK.getPanelStatus });
      if (res?.message !== "Success") {
        throw new Error();
      }
      setIsPanelUp(true);
    } catch {
      setIsPanelUp(false);
      Logout();
      navigate("/maintenance");
    }
  };
  if (loading) {
    <LoadingBar />;
  }
  useEffect(() => {
    initializeApp();
    const interval = setInterval(pollPanelStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!initialized) return null;

  return (
    <ContextPanel.Provider value={{ isPanelUp }}>
      {children}
    </ContextPanel.Provider>
  );
};

export default AppProvider;
