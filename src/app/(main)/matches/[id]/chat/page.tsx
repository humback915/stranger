import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMessages } from "@/actions/chat";
import ChatWindow from "@/components/chat/ChatWindow";
import { ROUTES } from "@/lib/constants/routes";

interface ChatPageProps {
  params: { id: string };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const matchId = parseInt(params.id, 10);

  if (isNaN(matchId)) {
    redirect(ROUTES.MATCHES);
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  // 매칭 조회 및 권한 확인
  const { data: match } = await supabase
    .from("matches")
    .select("id, user_a_id, user_b_id, status")
    .eq("id", matchId)
    .single();

  if (!match) {
    redirect(ROUTES.MATCHES);
  }

  const isParticipant =
    match.user_a_id === user.id || match.user_b_id === user.id;

  if (!isParticipant || match.status !== "accepted") {
    redirect(ROUTES.MATCHES);
  }

  const partnerId =
    match.user_a_id === user.id ? match.user_b_id : match.user_a_id;

  // 파트너 프로필 조회
  const { data: partnerProfile } = await supabase
    .from("profiles")
    .select("nickname, gender")
    .eq("id", partnerId)
    .single();

  // 초기 메시지 로드
  const { messages } = await getMessages(matchId);

  return (
    <div className="flex h-[100dvh] flex-col bg-stranger-dark">
      {/* 헤더 */}
      <div className="flex items-center gap-3 border-b border-stranger-mid px-4 py-3">
        <a
          href={ROUTES.MATCHES}
          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-stranger-light"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <div>
          <p className="text-sm font-semibold text-stranger-light">
            {partnerProfile?.nickname ?? "상대방"}
          </p>
          <p className="text-xs text-gray-400">
            {partnerProfile?.gender === "male" ? "남성" : partnerProfile?.gender === "female" ? "여성" : ""}
          </p>
        </div>
      </div>

      {/* 채팅 윈도우 */}
      <ChatWindow
        matchId={matchId}
        currentUserId={user.id}
        partnerId={partnerId}
        initialMessages={messages}
      />
    </div>
  );
}
