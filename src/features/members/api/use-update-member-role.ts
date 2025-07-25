"use client"
import { Role } from "@/generated/prisma";
import axiosdb from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateMemberRole = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: Role }) => {
      const { data } = await axiosdb.patch(`/api/members/${memberId}?workspaceId=${workspaceId}`, { role });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
    },
  });
};