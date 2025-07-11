'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/lib/axios';
import { put } from '@vercel/blob';
import { z } from 'zod';
import { Project } from '@/generated/prisma';

// Schema for validation (aligned with form and API)
export const projectCreateSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  imageUrl: z.union([z.instanceof(File), z.string().url(), z.literal('')]).optional(),
});

interface P {
  name: string;
  id: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useCreateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: z.infer<typeof projectCreateSchema>) => {
      // Verify token exists before attempting upload
      const blobToken = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
      if (!blobToken && data.imageUrl instanceof File) {
        throw new Error('Vercel Blob token is missing. Please configure NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN.');
      }
      let response : P
      if (data.imageUrl instanceof File){
        const blob = await put(`workspaces/${Date.now()}-${data.imageUrl.name}`, data.imageUrl, {
          access: 'public',
          token: blobToken,
        });
        
        // Send JSON payload to API
        const responseIf = await axios.post('/api/projects', {
          name: data.name,
          workspaceId,
          url: blob.url,
          pathname: blob.pathname,
          contentType: data.imageUrl.type,
          size: data.imageUrl.size,
        });
        response = responseIf.data.data
      } else {
        const responseElse = await axios.post('/api/projects', {
          name: data.name,
          workspaceId,
          url: "blob.url",
          pathname: "blob.pathname",
          contentType: "data.imageUrl.type",
          size: 0,
        }
      )
      response = responseElse.data.data
    }
    return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
    onError: (error) => {
      console.error('Error creating project:', error);
    },
  });
};