import { Profiles } from "supabase/types/tables";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  profile?: Profiles;
  imgSize: string;
  fontSize: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  profile,
  imgSize,
  fontSize,
}) => {
  return (
    <div className="flex items-center gap-2">
      <img
        className={cn("rounded-full object-cover", imgSize)}
        src={profile?.avatar_url || "/images/defaultProfileImage.png"}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.src = "/images/defaultProfileImage.png";
        }}
      />
      <p className={cn("truncate", fontSize)}>
        {profile?.full_name || "(알 수 없음)"}
      </p>
    </div>
  );
};
