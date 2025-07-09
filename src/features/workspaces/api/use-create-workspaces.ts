'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { put } from '@vercel/blob';
import axiosdb from '@/lib/axios';
import { Workspace } from '@/generated/prisma';

export const useCreateWorkspaces = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; imageUrl?: File | string; companyId: string }) => {

      const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
      if (!blobToken && data.imageUrl instanceof File) {
        throw new Error('Vercel Blob token is missing. Please configure NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN.');
      }

      let imageUrlString: string | undefined;
      let fileId: string | undefined;

      // Handle file upload to Vercel Blob if imageUrl is a File
      if (data.imageUrl instanceof File) {
        const blob = await put(`workspaces/${Date.now()}-${data.imageUrl.name}`, data.imageUrl, {
          access: 'public',
          token: blobToken,
        });
        imageUrlString = blob.url;
        fileId = blob.pathname;
      } else if (typeof data.imageUrl === 'string' && data.imageUrl) {
        imageUrlString = data.imageUrl; // Use provided URL if string
      }

      // Send JSON payload to API
      const response = await axiosdb.post<{
        success: true,
        message: 'Workspace created',
        data: Workspace,
      }>('/api/workspaces', {
        name: data.name,
        companyId: data.companyId,
        imageUrl: imageUrlString,
        fileId,
      });

      console.log("[Workspace] ", response.data.data)

      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
    onError: (error) => {
      console.error('Error creating workspace:', error);
    },
  });
};