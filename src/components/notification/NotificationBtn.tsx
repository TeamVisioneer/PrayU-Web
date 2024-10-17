import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RiNotification4Line } from "react-icons/ri";
import NotificationList from "./NotificationList";

const NotificationBtn = () => {
  return (
    <Popover>
      <PopoverTrigger>
        <div className="relative cursor-pointer">
          <div className="absolute top-0 right-0 w-[0.6rem] h-[0.6rem] bg-red-400 rounded-full text-center"></div>
          <RiNotification4Line size={22} />
        </div>
      </PopoverTrigger>
      <PopoverContent>
        <NotificationList />
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBtn;
