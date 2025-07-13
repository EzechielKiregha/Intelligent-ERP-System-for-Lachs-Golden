"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRef } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { useUpdateWorkspace } from "../api/use-update-workspaces";
import { useQueryClient } from "@tanstack/react-query";
import { workspacesUpdateSchema } from "../schemas";
import { Workspace } from "@/hooks/type";

interface EditWorkspacesFormProps {
  onCancel?: () => void;
  initialValue: Workspace;
}

export default function EditWorkspacesForm({
  onCancel,
  initialValue,
}: EditWorkspacesFormProps) {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useUpdateWorkspace(initialValue.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof workspacesUpdateSchema>>({
    resolver: zodResolver(workspacesUpdateSchema),
    defaultValues: {
      name: initialValue.name,
      imageUrl: initialValue.images[0].url || "",
    },
  });

  async function onSubmit(values: z.infer<typeof workspacesUpdateSchema>) {
    const data = {
      ...values,
      imageUrl: values.imageUrl instanceof File ? values.imageUrl : "",
    };

    mutate(
      data,
      {
        onSuccess: ({ message }) => {
          queryClient.invalidateQueries({
            queryKey: ["workspaces", initialValue.id],
          });
          toast.success(message);
        },
        onError: ({ message }) => {
          toast.error(message);
        },
      }
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("imageUrl", file);
    }
  };
  return (
    <Card className="mt-4 bg-sidebar">
      <CardHeader className="flex items-center flex-row gap-x-4">
        <CardTitle className="text-lg">
          Edit &quot;{initialValue.name}&quot; workspace
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="Enter workspace name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-4">
                      {field.value ? (
                        <div className="relative size-20 rounded-full">
                          <Image
                            alt="Logo"
                            loader={() => `${field.value}`}
                            src={`${field.value}`}
                            fill
                            className="object-cover rounded-full"
                          />
                        </div>
                      ) : (
                        <div>
                          <Avatar className="size-20">
                            <AvatarFallback>
                              <ImageIcon className="size-10 text-neutral-500" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">Workspace Icon</p>
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG, SVG or JPEG, max 1MB
                        </p>
                        <input
                          title="file"
                          disabled={isPending}
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        {field.value ? (
                          <Button
                            variant={"destructive"}
                            type="button"
                            size={"sm"}
                            className="mt-2"
                            disabled={isPending}
                            onClick={() => {
                              field.onChange("");
                              if (fileInputRef.current) {
                                fileInputRef.current.value = "";
                              }
                            }}
                          >
                            <Trash2 />
                          </Button>
                        ) : (
                          <Button
                            variant={"outline"}
                            type="button"
                            size={"sm"}
                            className="mt-2"
                            disabled={isPending}
                            onClick={() => {
                              fileInputRef?.current?.click();
                            }}
                          >
                            <Upload />
                          </Button>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-3">
              {onCancel && (
                <Button
                  variant={"outline"}
                  disabled={isPending}
                  type="button"
                  className="font-bold"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              <Button disabled={isPending} type="submit" className="font-bold bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground">
                Save Workspace
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
