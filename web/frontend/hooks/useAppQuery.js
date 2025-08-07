import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";

export function useAppQuery(url, options = {}) {
  const app = useAppBridge();
  const fetch = authenticatedFetch(app);

  return useQuery({
    queryKey: [url],
    queryFn: async () => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    ...options,
  });
}

export function useAppMutation(baseUrl, method = "POST") {
  const app = useAppBridge();
  const fetch = authenticatedFetch(app);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, data } = {}) => {
      const requestUrl = url || baseUrl;
      const response = await fetch(requestUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Request failed");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries();
    },
  });
}
