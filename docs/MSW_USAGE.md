# MSW 사용 방법

이 프로젝트는 개발 환경에서만 [Mock Service Worker](https://mswjs.io/)를 사용해 백엔드 호출을 가짜 API로 대체합니다. 운영(빌드) 번들에는 MSW 코드가 포함되지 않으므로 걱정하지 않아도 됩니다.

## 동작 방식

- 로컬 개발 시 `npm run mock`을 실행하면 `VITE_ENABLE_MSW=true` 상태로 Vite가 실행돼 브라우저가 MSW를 로드합니다.
- `npm run dev`를 쓰면 `VITE_ENABLE_MSW=false`라서 실제 백엔드를 그대로 호출합니다.
- `src/main.tsx`는 `import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true'`인 경우에만 `./mocks/browser`를 동적 import 하므로 프로덕션 번들에는 MSW 관련 코드가 포함되지 않습니다.
- 워커 스크립트는 `public/mockServiceWorker.js`에 있으며 버전 관리됩니다. `npm run mock`을 실행할 때 자동으로 활성화됩니다.

## 새로운 API를 목킹하는 절차

1. 필요하다면 `src/mocks/data.ts`에 더미 데이터나 헬퍼를 추가합니다.
2. `src/mocks/handlers` 폴더에 해당 도메인(books, cards 등)용 핸들러를 추가하거나 기존 파일에 http.get/post 등 핸들러를 추가합니다.
3. 새 핸들러 배열을 `src/mocks/handlers/index.ts`에 등록해야 워커가 인식합니다.
4. 실제 백엔드 응답 스펙을 그대로 따라야 하며 `createMockResponse` 등 공통 유틸을 활용하면 타입이 맞습니다.
5. 개발 서버가 워커 변경을 감지하지 않으면 `npm run mock`을 다시 실행합니다.

새로운 REST 엔드포인트가 추가될 때는 항상 프로덕션 코드에서 모킹 분기 없이 실제 fetch만 남기고, 위 과정을 통해 MSW 핸들러만 추가해 주세요.
