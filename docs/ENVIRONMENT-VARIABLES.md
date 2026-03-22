# ENVIRONMENT-VARIABLES.md

## 로컬 개발용

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## 원칙

- `NEXT_PUBLIC_*`는 브라우저 노출 가능
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용
- `.env.local`은 git에 커밋하지 않음

## 점검 포인트

- 로컬과 Vercel 값이 일치하는지
- Preview/Production 환경을 분리할지
- Auth Redirect URL이 환경별로 올바른지
