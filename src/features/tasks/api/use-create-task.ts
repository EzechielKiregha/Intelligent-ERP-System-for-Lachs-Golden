"use client"
import axiosdb from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { taskCreateSchema } from "../schemas";


export const useCreateTask = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof taskCreateSchema> ) => {
      const { data: response } = await axiosdb.post('/api/tasks', { ...data, workspaceId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { workspaceId }] });
    },
  });
};