'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { put } from '@vercel/blob';
import { z } from 'zod';

// Schema for validation (aligned with form and API)
export const projectCreateSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  imageUrl: z.union([z.instanceof(File), z.string().url(), z.literal('')]).optional(),
});

export const useCreateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: z.infer<typeof projectCreateSchema>) => {
      // Verify token exists before attempting upload
      const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
      if (!blobToken && data.imageUrl instanceof File) {
        throw new Error('Vercel Blob token is missing. Please configure NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN.');
      }

      let imageUrlString: string | undefined;
      let fileId: string | undefined;

      // Upload file to Vercel Blob if imageUrl is a File
      if (data.imageUrl instanceof File) {
        const blob = await put(`projects/${Date.now()}-${data.imageUrl.name}`, data.imageUrl, {
          access: 'public',
          token: blobToken,
        });
        imageUrlString = blob.url;
        fileId = blob.pathname;
      } else if (typeof data.imageUrl === 'string' && data.imageUrl) {
        imageUrlString = data.imageUrl;
      }

      // Send JSON payload to API
      const response = await axios.post('/api/projects', {
        name: data.name,
        workspaceId,
        imageUrl: imageUrlString,
        fileId,
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
    onError: (error) => {
      console.error('Error creating project:', error);
    },
  });
};