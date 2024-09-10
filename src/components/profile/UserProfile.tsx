import { Profiles } from "supabase/types/tables";

interface UserProfileProps {
  profile: Profiles;
}

export const UserProfile: React.FC<UserProfileProps> = ({ profile }) => {
  return (
    <div className="flex items-center gap-2">
      <img
        className="w-6 h-6 rounded-full border object-cover"
        src={profile.avatar_url || "/images/defaultProfileImage.png"}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.src = "/images/defaultProfileImage.png";
        }}
      />
      <p className="font-medium">{profile.full_name}</p>
    </div>
  );
};
