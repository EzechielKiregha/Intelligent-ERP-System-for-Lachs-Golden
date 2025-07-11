import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MemberAvatarProps {
  name?: string | null;
  img?: string;
  color: string;
  className?: string;
  textClassName?: string;
}

export default function MemberAvatar({
  name,
  img,
  color,
  className,
  textClassName,
}: MemberAvatarProps) {
  return (
    <Avatar
      className={cn(
        "size-12 border transition-all hover:opacity-75 cursor-pointer",
        className
      )}
    >
      <AvatarImage src={img} alt={name as string} />
      <AvatarFallback
        style={{
          backgroundColor: color,
        }}
        className={cn("font-bold text-lg", textClassName)}
      >
        {name?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
