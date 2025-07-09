"use client"

import { Member } from "@/generated/prisma";
import axiosdb from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface MemberWithUserData {
  members : Member[]
} 

export function useGetMembers(workspaceId: string){
  return useQuery({
    queryKey: ['members', workspaceId],
    queryFn: async () => {
      const response = await axiosdb.get<MemberWithUserData>(`/api/members?workspaceId=${workspaceId}`);
      return response.data.members;
    },
    enabled: !!workspaceId,
  });
};