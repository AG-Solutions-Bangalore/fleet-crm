import apiClient from "@/api/apiClient";
import { getAuthToken } from "@/utils/authToken";
import { useState } from "react";
import { useSelector } from "react-redux";

export function useApiMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reduxToken = useSelector((state) => state.auth.token);
  const token = getAuthToken(reduxToken);
  const trigger = async ({
    url,
    method = "get",
    data = null,
    params = null,
    headers = {},
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient({
        url,
        method,
        data,
        params,
        headers: {
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { trigger, loading, error };
}
