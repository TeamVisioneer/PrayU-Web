import React, { useEffect, useRef, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useBaseStore from "@/stores/baseStore";
import { BibleCard, Group, PrayCardWithProfiles } from "supabase/types/tables";
import { analyticsTrack } from "@/analytics/analytics";
import PrayCardWithBibleCard from "./PrayCardWithBibleCard";
import ShareButtonGroup from "../share/ShareButtonGroup";
import { searchBible } from "@/apis/bible";
import useBibleCard from "@/hooks/useBibleCard";
import { useSaveImage } from "@/hooks/useSaveImage";
import { createBibleCard } from "@/apis/bibleCard";
import BibleCardFixed from "./BibleCardFixed";
import { getISOTodayDateYMD } from "@/lib/utils";
import { PulseLoader } from "react-spinners";
import PrayCard from "./PrayCard";



interface NewPrayCardCompletionStepProps {
  selectedGroups: Group[];
}

// Animation variants for staggered child elements
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, delay: 0.3 },
  },
};

const NewPrayCardCompletionStep: React.FC<NewPrayCardCompletionStepProps> = ({
  selectedGroups,
}) => {
  const navigate = useNavigate();

  const user = useBaseStore((state) => state.user);
  // const targetGroup = useBaseStore((state) => state.targetGroup);
  const fetchUserPrayCardList = useBaseStore(
    (state) => state.fetchUserPrayCardList
  );

  const historyPrayCardList = useBaseStore(
    (state) => state.historyPrayCardList
  );

  const { saveImage } = useSaveImage();
  const { getRandomColors, getRandomRadiusStyle } = useBibleCard();
  
  const [DrawerOpen, setDrawerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [bibleCard, setBibleCard] = useState<BibleCard | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [radius, setRadius] = useState<string[]>([]);
  const [bibleReference, setBibleReference] = useState<string>("");
  const [bibleSentence, setBibleSentence] = useState<string>("");
  const bibleCardRef = useRef<HTMLDivElement>(null);
  const { year, month, day } = getISOTodayDateYMD();

  const handleComplete = async () => {
    // analyticsTrack("클릭_기도카드생성_그룹이동", { where: "완료페이지" });
    analyticsTrack("클릭_기도카드생성_내프로필", { where: "완료페이지" });
    if (!user) return;

    navigate("/profile/me");
  };

  const handleCreateBibleCard = async (prayCard: PrayCardWithProfiles | undefined) => {
      try {
        if (!prayCard || isCreating) return

        setIsCreating(true);
        const {bible, keywords} = await searchBible(
          `#일상: ${prayCard.life} #기도제목: ${prayCard.content}`
        );
        const { primary, secondary } = getRandomColors();
        const { borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius } = getRandomRadiusStyle();
  
        if (!bible || !keywords) {
          setIsCreating(false);
          return;
        }
        const targetBible = bible[0];
        const bibleSentence = targetBible.sentence;
        const bibleReference = targetBible.long_label === "시편" ? 
          `${targetBible.long_label} ${targetBible.chapter}편 ${targetBible.paragraph}절` : 
          `${targetBible.long_label} ${targetBible.chapter}장 ${targetBible.paragraph}절`;

        setKeywords(keywords);
        setColors([primary, secondary]);
        setRadius([borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius]);
        setBibleReference(bibleReference);
        setBibleSentence(bibleSentence);
        

        await new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        });
        
        const image_url = await saveImage(bibleCardRef, {
          storagePath: `BibleCard/`,
          fileName: `BibleCard_${Date.now()}.jpeg`,
          imageFormat: "jpeg",
          quality: 0.95,
          scale: 2,
        });

        const bibleCard = await createBibleCard({
          user_id: user?.id || null,
          name: user?.user_metadata.full_name || "",
          keywords: keywords,
          bible_reference: bibleReference,
          bible_sentence: bibleSentence,
          colors: [primary, secondary],
          radius: [borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius],
          image_url: image_url,
        });

        localStorage.setItem("bibleCard", JSON.stringify(bibleCard))
        setBibleCard(bibleCard);
        setIsCreating(false);
        return bibleCard
      } catch (error) {
        console.error("이미지 저장 중 오류:", error);
        setIsCreating(false);
        return null;
      }
    };


  useEffect(() => {
    if (user) fetchUserPrayCardList(user.id);
  }, [user, fetchUserPrayCardList]);

  useEffect(() => {
    const bibleCard = localStorage.getItem("bibleCard");
    if (bibleCard) {
      setBibleCard(JSON.parse(bibleCard));
    }
  }, [])


  const prayCard = historyPrayCardList?.[0];
  
  return (
    <div className="flex flex-col items-center h-full relative">
      {/* Dimmed overlay */}
      {/* <div className="fixed inset-0 bg-black/85 z-10" /> */}

      {/* Card container with spotlight effect */}
      <motion.div
        className="w-5/6 mx-auto relative z-20 my-5"
        variants={cardVariants}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 -m-6 bg-blue-400/20 rounded-3xl blur-xl"></div>

        {/* Card */}
        <div className="relative">
          {bibleCard 
            ? <PrayCardWithBibleCard prayCard={prayCard} bibleCard={bibleCard || undefined} />
            : <PrayCard prayCard={prayCard} isMoreBtn={false} editable={false} />
          }
        </div>
        
      </motion.div>

      <motion.div
        className="text-center relative z-20 mb-4"
        variants={itemVariants}
      >
        <motion.h1 className="text-2xl font-bold mb-1" variants={itemVariants}>
          기도카드 생성 완료!
        </motion.h1>
        <motion.p className="text-gray-500" variants={itemVariants}>
          {
          selectedGroups.length === 0 ? "" : 
          selectedGroups.length < 2
            ? `${selectedGroups[0]?.name} ` 
            : `${selectedGroups[0]?.name} 외 ${selectedGroups.length - 1}개의 `}
          그룹에 기도카드가 생성되었습니다.
        </motion.p>
      </motion.div>

    

      <motion.div
        className="relative z-20 w-3/4 flex flex-col gap-3"
        variants={itemVariants}
      > 
        <Button
          onClick={() => handleCreateBibleCard(prayCard)}
          disabled={isCreating}
          className="w-full py-6 text-base bg-blue-500 hover:bg-blue-600 disabled:opacity-70"
        >
          {isCreating ? <PulseLoader size={10} color="#f3f4f6" /> :"말씀카드 만들기"}
        </Button>
        <Button
          onClick={handleComplete}
          variant="ghost"
          className="w-full py-6 text-base"
        >
          나중에 하기
        </Button>
      </motion.div>
      <Drawer open={DrawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="bg-mainBg pb-7">
          <DrawerHeader className="px-6 pt-5 pb-4 text-center gap-2">
            <DrawerTitle className="text-[18px] font-bold text-[#222222]">
              말씀카드 공유하기
            </DrawerTitle>
            <DrawerDescription className="text-sm leading-relaxed text-[#919191]">
              말씀카드 이미지를 친구에게 공유하고 함께 기도해요
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-5 px-5">
            <div className="rounded-2xl border border-[#EEF1F4] bg-white shadow-sm">
              {/* 공유 버튼 그룹 */}
              <ShareButtonGroup where="NewPrayCardCompletionStep" />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

       {/* 숨겨진 캡처 전용 BibleCardFixed - 화면 밖에 배치 */}
      <div className="fixed -top-[100vh] -z-40 pointer-events-none">
        <div ref={bibleCardRef} className="w-[380px] aspect-[3/4]">
            <BibleCardFixed
              name={user?.user_metadata.full_name || ""}
              keywords={keywords}
              colors={colors}
              radius={radius}
              bibleReference={bibleReference}
              bibleSentence={bibleSentence}
              createdAt={`${year}.${month}.${day}`}
            />
        </div>
      </div>

    </div>
  );
};

export default NewPrayCardCompletionStep;
