import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Group } from "supabase/types/tables";
import { ChevronsUpDown } from "lucide-react";
interface GroupDropdownProps {
  userGroupList: Group[];
  targetGroup?: Group;
}

export default function GroupDropdown({
  userGroupList,
  targetGroup,
}: GroupDropdownProps) {
  const [selectedGroup, setSelectedGroup] = useState(
    targetGroup?.id.toString()
  );

  const handleClickGroup = (group: Group) => {
    setSelectedGroup(group.id.toString());
    window.location.href = `/group/${group.id}`;
  };

  return (
    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
      <SelectTrigger className="max-w-full w-auto p-0 bg-none border-none bg-mainBg font-bold text-[#222222] text-xl gap-1 truncate">
        <SelectValue placeholder="참여 그룹" />
        <ChevronsUpDown size={20} className="opacity-50 shrink-0" />
      </SelectTrigger>
      <SelectContent className="w-52">
        <SelectGroup>
          <SelectLabel className="text-base">참여 그룹</SelectLabel>
          {userGroupList.map((group) => (
            <div className="truncate" onClick={() => handleClickGroup(group)}>
              <SelectItem key={group.id} value={group.id.toString()}>
                {group.name}
              </SelectItem>
            </div>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
