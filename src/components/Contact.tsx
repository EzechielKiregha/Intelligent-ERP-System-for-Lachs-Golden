"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSaveNotification } from "@/hooks/useNotifications";
import { toast } from "sonner";

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(8, 'Message must be at least 8 characters'),
});

type UserFormData = z.infer<typeof userSchema>;

export default function ContactPage() {
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
      toast.success("Message sent successfully!");
    } catch (error) {
      console.error("Failed to send notification:", error);
    }
  };

  return (
    <div id="contact" className="flex items-center justify-center min-h-screen bg-transparent px-4 pt-4 shadow-lg">
      <div className="bg-white dark:bg-[#111827] shadow-lg rounded-2xl flex flex-col md:flex-row w-full max-w-[900px] md:h-[535px] overflow-hidden">
        {/* Google Map Section */}
        <div className="w-full md:w-1/2 h-[200px] md:h-full">
          <iframe
            className="w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15950.297170402976!2d30.058585!3d-1.944072!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42596b27c3b%3A0xadf2d2f8b055b2d7!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1697051234567"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
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
              {isPending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}