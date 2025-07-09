"use client"

import axiosdb from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const response = await axiosdb.get('/api/workspaces');
      return response.data;
    },
  });
};