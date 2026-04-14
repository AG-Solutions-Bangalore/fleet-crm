import apiClient from "@/api/apiClient";
import { useState } from "react";

export function useApiMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trigger = async ({
    url,
    method = "get",
    data = null,
    params = null,
    headers = {},
    responseType = "json",
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient({
        url: `${url}`,
        method,
        data,
        params,
        responseType,
        headers: {
          ...headers,
        },
      });
      if (responseType == "blob") {
        return response.data;
      }
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
