'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { put } from '@vercel/blob';
import { z } from 'zod';

export const workspacesCreateSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  imageUrl: z.union([z.instanceof(File), z.string().url(), z.literal('')]).optional(),
  companyId: z.string().optional(),
});

interface W {
  name: string;
  companyId: string;
  id: string;
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useCreateWorkspaces = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: z.infer<typeof workspacesCreateSchema>) => {
      const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
      if (!blobToken && data.imageUrl instanceof File) {
        throw new Error('Vercel Blob token is missing. Please configure NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN.');
      }
      let response : W 
      if (data.imageUrl instanceof File) {
        const blob = await put(`workspaces/${Date.now()}-${data.imageUrl.name}`, data.imageUrl, {
          access: 'public',
          token: blobToken,
        });
        const responseIf = await axios.post('/api/workspaces', {
          name: data.name,
          companyId: data.companyId,
          url: blob.url,
          pathname: blob.pathname,
          contentType: data.imageUrl.type,
          size: data.imageUrl.size,
        })
        response = responseIf.data.data
      } else {
        const responseElse = await axios.post('/api/workspaces', {
          name: data.name,
          companyId: data.companyId,
          url: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
          pathname: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
          contentType: "https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png",
          size: 10000, // Default size if no image is provided
        }
      )
        response = responseElse.data.data
      }
      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
    onError: (error) => {
      console.error('Error creating workspace:', error);
    },
  });
};