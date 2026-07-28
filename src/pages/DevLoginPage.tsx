import { useState } from "react";
import { supabase } from "../../supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * 개발용 이메일 로그인.
 *
 * 서비스 로그인은 카카오·애플 OAuth 전용이라 로컬에서 로그인 뒤 화면을 열기 어렵다.
 * 이 페이지는 **개발 빌드에만 존재한다** — App.tsx가 `import.meta.env.DEV`일 때만 라우트를 등록하고,
 * prod·staging 번들에서는 통째로 빠진다. 실제 인증 흐름(카카오·애플)은 건드리지 않는다.
 *
 * 계정은 PrayU-Api의 `./scripts/seed-dev.sh`가 만든다.
 */

const SEED_PASSWORD = "prayu-dev-1234";
const SEED_ACCOUNTS = [
  { email: "dev1@prayu.local", name: "김기도", note: "그룹장 · 말씀카드 보유" },
  { email: "dev2@prayu.local", name: "이찬양", note: "멤버" },
  { email: "dev3@prayu.local", name: "박은혜", note: "멤버" },
];

const DevLoginPage = () => {
  const [email, setEmail] = useState(SEED_ACCOUNTS[0].email);
  const [password, setPassword] = useState(SEED_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const signIn = async (targetEmail: string, targetPassword: string) => {
    setError(null);
    setLoadingEmail(targetEmail);
    const { error } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password: targetPassword,
    });
    if (error) {
      setError(error.message);
      setLoadingEmail(null);
      return;
    }
    // 스토어가 세션을 처음부터 다시 읽도록 전체 이동한다
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col gap-6 p-5 pt-safe-top">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">개발용 로그인</h1>
        <p className="text-sm text-gray-500">
          개발 빌드에만 있는 화면입니다. 계정은 PrayU-Api의{" "}
          <code className="rounded bg-gray-100 px-1">./scripts/seed-dev.sh</code>
          로 만듭니다.
        </p>
      </header>

      <section className="flex flex-col gap-2">
        <p className="text-sm font-semibold">시드 계정</p>
        {SEED_ACCOUNTS.map((account) => (
          <Button
            key={account.email}
            variant="secondary"
            className="h-auto flex-col items-start gap-0.5 py-3"
            disabled={loadingEmail !== null}
            onClick={() => signIn(account.email, SEED_PASSWORD)}
          >
            <span className="font-semibold">
              {account.name}
              {loadingEmail === account.email && " · 로그인 중…"}
            </span>
            <span className="text-xs font-normal text-gray-500">
              {account.email} · {account.note}
            </span>
          </Button>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-sm font-semibold">직접 입력</p>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          autoComplete="off"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoComplete="off"
        />
        <Button
          disabled={loadingEmail !== null || !email || !password}
          onClick={() => signIn(email, password)}
        >
          로그인
        </Button>
      </section>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default DevLoginPage;
