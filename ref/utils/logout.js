import { logout } from "@/store/auth/authSlice";
import { persistor } from "@/store/store";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const useAppLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.clear();

      await persistor.flush();

      dispatch(logout());

      navigate("/", { replace: true });

      setTimeout(() => {
        persistor.purge();
      }, 500);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return handleLogout;
};

export default useAppLogout;
