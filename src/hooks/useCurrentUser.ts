// src/hooks/useCurrentUser.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await axios.get('/api/me');
      if (!res.status) throw new Error("Failed to fetch user");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
