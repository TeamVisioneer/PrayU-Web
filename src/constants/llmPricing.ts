/**
 * 어드민 대시보드의 LLM 비용 추정 단가 (USD / 1K tokens).
 *
 * 코드 상수라 단가가 바뀌면 배포가 필요하다. 대시보드 표시는 어디까지나 **추정치**이며
 * 정산 기준이 아니다 — 실제 청구는 각 제공자 콘솔을 본다.
 * 등록되지 않은 모델은 default로 계산된다.
 */
export const LLM_PRICE_PER_1K_TOKENS: Record<
  string,
  { prompt: number; completion: number }
> = {
  "gpt-4o-mini": { prompt: 0.00015, completion: 0.0006 },
  "gemini-2.0-flash-lite": { prompt: 0.000075, completion: 0.0003 },
  default: { prompt: 0.00015, completion: 0.0006 },
};
