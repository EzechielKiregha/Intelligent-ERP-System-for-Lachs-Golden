"use client"

import axiosdb from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await axiosdb.get('/api/workspaces');
      // console.log("[Front Data] ", response.data.documents);
      return response.data.documents;
    },
  });
};