import BasePopover from '@/components/BasePopover'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSaveNotification } from '@/hooks/useNotifications';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from "zod";

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(8, 'Message must be at least 8 characters'),
});

type UserFormData = z.infer<typeof userSchema>;
function ContactAdminOrAcountant() {

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });
  const { mutateAsync: saveNotification, isPending } = useSaveNotification();

  const onSubmit = async (data: UserFormData) => {
    try {
      await saveNotification({
        message: data.message,
        type: "contact",
        email: data.email,
      });
      reset();
      toast.success("request sent successfully!");
    } catch (error) {
      console.error("Failed to send request: ", error);
    }
  };

  return (
    <BasePopover title='Request' >
      <div id="contact" className="flex items-center justify-center min-h-screen bg-transparent px-4 pt-4 shadow-lg">
        <div className="bg-white dark:bg-[#111827] shadow-lg rounded-2xl flex flex-col md:flex-row w-full max-w-[900px] md:h-[535px] overflow-hidden">
          {/* Contact Form Section */}
          <div className="flex flex-col justify-center items-center w-full md:w-1/2 max-w-lg bg-white dark:bg-[#111827] p-6">
            <h2 className="text-2xl font-bold mb-6">Contact Us</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  {...register("name", { required: "Name is required" })}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Invalid email address",
                    },
                  })}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Your message"
                  {...register("message", { required: "Message is required" })}
                  className={errors.message ? "border-red-500" : ""}
                  rows={4}
                />
                {errors.message && <p className="text-red-500 text-sm">{errors.message.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-sidebar-accent text-white" disabled={isPending}>
                {isPending ? "Sending..." : "Send request"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </BasePopover>
  )
}

export default ContactAdminOrAcountant