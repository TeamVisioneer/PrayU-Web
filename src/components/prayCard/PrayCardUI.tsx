import { MemberWithProfiles, PrayCard } from "supabase/types/tables";

interface PrayCardProps {
  member: MemberWithProfiles | undefined;
  prayCard: PrayCard | undefined;
}

const PrayCardUI: React.FC<PrayCardProps> = ({ member, prayCard }) => {
  return (
    <div className="flex flex-col h-full p-5 bg-blue-50 rounded-2xl">
      <div className="flex items-center gap-2">
        <img
          src={member?.profiles.avatar_url || ""}
          className="w-5 h-5 rounded-full"
        />
        <div className="text-sm">{member?.profiles.full_name}</div>
      </div>
      <div className="flex h-full justify-center items-center">
        {prayCard?.content}
      </div>
    </div>
  );
};

export default PrayCardUI;
