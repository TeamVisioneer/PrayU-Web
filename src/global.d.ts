// globals.d.ts
declare global {
  interface Window {
    fbq: (...args: any[]) => void; // fbq 함수에 대한 정의
  }
}

// 이 파일을 모듈로 취급
export {};
