"use client"

import { Member, Role } from "@/generated/prisma";
import axiosdb from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface M {
  name: string | null;
  id: string;
  userId: string;
  email: string | null;
  workspaceId: string;
  role: Role;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useGetMembersSwitcher({ userId }: { userId?: string }) {
  return useQuery({
    queryKey: ['members', 'user', userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await axiosdb.get(
        `/api/members?userId=${userId}`
      );
      return res.data.members;
    },
    enabled: !!userId,
  });
}

export function useGetMembers(workspaceId: string){
  return useQuery({
    queryKey: ['members', workspaceId],
    queryFn: async () => {
      const res = await axiosdb.get(`/api/members?workspaceId=${workspaceId}`);
      // console.log('Members data:', res.data.members);
      return res.data.members;
    },
    enabled: !!workspaceId,
  });
};