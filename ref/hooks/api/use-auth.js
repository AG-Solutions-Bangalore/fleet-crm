import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);

  const token = useSelector((state) => state.auth?.token);
  const user = useSelector((state) => state.auth?.user);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    isAuthenticated: Boolean(token),
    user,
  };
};

export default useAuth;
