import { cn } from "@/lib/utils";
import useBaseStore from "@/stores/baseStore";
interface UserProfileProps {
  imgSize: string;
  fontSize: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  imgSize,
  fontSize,
}) => {
  const user = useBaseStore((state) => state.user);
  return (
    <div className="flex items-center gap-2">
      <img
        className={cn("rounded-full object-cover", imgSize)}
        src={user?.user_metadata.picture || "/images/defaultProfileImage.png"}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          e.currentTarget.src = "/images/defaultProfileImage.png";
        }}
      />
      <p className={cn("truncate", fontSize)}>내 기도카드</p>
    </div>
  );
};
