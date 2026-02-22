export const IDENTIFICATION_ACTIONS = [
  "짝다리를 짚고 서 있기",
  "팔짱을 끼고 벽에 기대기",
  "장미꽃 한 송이를 몸 뒤에 숨기고 있기",
  "책을 펼쳐서 읽는 척 하기",
  "이어폰 한 쪽만 꽂고 있기",
  "손가락으로 테이블 톡톡 두드리기",
  "턱을 괴고 창밖 바라보기",
  "양손으로 턱을 감싸고 앉아 있기",
  "핸드폰을 세워서 보고 있기",
  "고개를 살짝 기울이고 미소 짓기",
  "손목시계를 계속 확인하기",
  "양 발을 까딱까딱 하며 앉아 있기",
] as const;

export const IDENTIFICATION_ACTIONS_EN = [
  "Standing with weight on one leg",
  "Leaning against a wall with arms crossed",
  "Hiding a single rose behind your back",
  "Pretending to read an open book",
  "Wearing only one earphone",
  "Tapping the table with your fingers",
  "Resting your chin in your hand, gazing out the window",
  "Sitting with both hands cupping your chin",
  "Holding your phone upright and looking at it",
  "Tilting your head slightly and smiling",
  "Repeatedly checking your wristwatch",
  "Sitting while swinging both feet",
] as const;

export const IDENTIFICATION_ACTIONS_JA = [
  "片足重心で立つ",
  "腕を組んで壁にもたれる",
  "薔薇の花一本を背中に隠す",
  "本を開いて読む振りをする",
  "片方だけイヤホンをつける",
  "指でテーブルをトントン叩く",
  "頬杖をついて窓の外を眺める",
  "両手で顎を包んで座る",
  "スマホを縦に持って見る",
  "少し首を傾けて微笑む",
  "腕時計を何度も確認する",
  "両足をブラブラさせながら座る",
] as const;

/** 식별 행동을 로케일에 맞게 변환 (목록에 없는 AI 생성 텍스트는 원문 반환) */
export function localizeAction(action: string, locale: string): string {
  if (locale === "ko") return action;
  const idx = (IDENTIFICATION_ACTIONS as readonly string[]).indexOf(action);
  if (idx === -1) return action;
  const list = locale === "en" ? IDENTIFICATION_ACTIONS_EN : IDENTIFICATION_ACTIONS_JA;
  return list[idx] ?? action;
}
