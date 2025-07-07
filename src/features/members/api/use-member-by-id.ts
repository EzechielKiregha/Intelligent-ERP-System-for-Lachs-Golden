"use client"
import axiosdb from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetMemberById = (memberId: string, workspaceId: string) => {
  return useQuery({
    queryKey: ['member', memberId, workspaceId],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/members/${memberId}?workspaceId=${workspaceId}`);
      return data.data;
    },
    enabled: !!memberId && !!workspaceId,
  });
};