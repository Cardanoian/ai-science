# 🔬 AI와 함께하는 나만의 과학 탐구 여행

> **혁신적인 AI 기반 과학 탐구학습 플랫폼**  
> 실시간 협업 보드 + 워크북 연동 + Google Gemini AI로 완성된 미래형 교육 도구

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI-orange)

## 📖 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [사용법](#-사용법)
- [프로젝트 구조](#-프로젝트-구조)
- [데이터베이스 설계](#-데이터베이스-설계)
- [API 문서](#-api-문서)
- [배포](#-배포)
- [기여하기](#-기여하기)
- [라이선스](#-라이선스)

## 🎯 프로젝트 소개

**AI와 함께하는 나만의 과학 탐구 여행**은 중학생들이 체계적이고 즐겁게 과학 탐구를 할 수 있도록 돕는 혁신적인 교육 플랫폼입니다.

### 🌟 **핵심 가치**

- **🤖 AI 학습 동반자**: Google Gemini AI가 개인 맞춤형 피드백 제공
- **👥 실시간 협업**: 학급 전체가 함께 참여하는 동시 학습 경험
- **📚 워크북 완벽 연동**: 기존 교육과정과 100% 호환
- **🎯 체계적 탐구**: 과학적 사고 과정을 단계별로 학습

### 🎓 **교육적 효과**

- **과학적 사고력** 향상
- **창의적 문제해결** 능력 개발
- **협업 및 소통** 역량 강화
- **AI 활용** 디지털 리터러시 증진

## ✨ 주요 기능

### 🏫 **교사 시스템**

- **📊 대시보드**: 수업 생성 및 관리
- **🔢 수업 코드**: 6자리 자동 생성 시스템
- **📱 QR 코드**: 간편한 수업 참여 링크
- **👥 참여자 관리**: 실시간 학생 현황 모니터링
- **📈 학습 추적**: 개별 학생의 탐구 진행 상황 확인

### 🎓 **학생 시스템**

- **⚡ 즉시 참여**: 수업 코드만으로 빠른 입장
- **🎨 실시간 보드**: 스티키 노트 기반 협업
- **🔬 AI 탐구**: 6단계 체계적 과학 탐구
- **📊 데이터 시각화**: 실험 결과 차트 생성
- **🎤 발표 준비**: AI 지원 발표 자료 제작

### 🤖 **AI 기능**

- **💡 주제 추천**: 개인 관심사 기반 맞춤형 제안
- **❓ 질문 개발**: 탐구 질문 생성 및 개선 조언
- **🧪 실험 설계**: 안전하고 실행 가능한 실험 방법 제시
- **📋 결과 분석**: 데이터 해석 및 결론 도출 지원
- **🎯 피드백**: 각 단계별 개선점 및 격려 메시지

### 📚 **6단계 탐구 과정**

1. **🔍 탐구 주제 찾기**: AI와 함께 관심사 기반 주제 선정
2. **❓ 탐구 질문과 가설**: 과학적 질문 만들기 및 가설 설정
3. **🧪 실험 계획하기**: 변인 통제 및 안전한 실험 설계
4. **📊 결과 정리 및 결론**: 데이터 분석 및 시각화
5. **🎤 탐구 발표 준비**: 발표 자료 및 대본 작성
6. **💭 성찰하기**: 학습 과정 돌아보기 및 차기 계획

## 🛠 기술 스택

### **Frontend**

- **⚛️ React 18** - 사용자 인터페이스
- **📘 TypeScript** - 타입 안전성
- **🎨 Tailwind CSS** - 스타일링
- **🖱️ react-draggable** - 드래그 앤 드롭
- **📊 recharts** - 데이터 시각화
- **🔔 react-hot-toast** - 알림 시스템

### **Backend & Database**

- **🗄️ Supabase** - PostgreSQL 데이터베이스
- **🔐 Supabase Auth** - 사용자 인증
- **⚡ Supabase Realtime** - 실시간 동기화
- **🔒 Row Level Security** - 데이터 보안

### **AI & Services**

- **🤖 Google Gemini 2.5 Flash** - AI 피드백 서비스
- **📱 QRCode.js** - QR 코드 생성

### **Development Tools**

- **⚡ Vite** - 빌드 도구
- **🔧 ESLint** - 코드 품질
- **💅 Prettier** - 코드 포매팅

## 🚀 시작하기

### 📋 **사전 요구사항**

- Node.js 18.0.0 이상
- npm 또는 yarn
- Supabase 계정
- Google AI Studio 계정 (Gemini API)

### 📦 **설치**

1. **리포지토리 클론**

```bash
git clone https://github.com/yourusername/science-research-app.git
cd science-research-app
```

2. **의존성 설치**

```bash
npm install
```

3. **환경 변수 설정**

```bash
cp .env.example .env
```

`.env` 파일을 열어 다음 정보를 입력:

```env
# Supabase 설정
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini AI 설정
VITE_GEMINI_API_KEY=your-gemini-api-key
```

4. **데이터베이스 설정**

- [Supabase 설정 가이드](docs/supabase-setup.md) 참조
- SQL 스키마 파일 실행: `database/schema.sql`

5. **개발 서버 실행**

```bash
npm run dev
```

앱이 `http://localhost:5173`에서 실행됩니다.

## 📱 사용법

### 👩‍🏫 **교사용 가이드**

1. **계정 생성 및 로그인**

   - 초기 화면에서 "선생님으로 로그인" 클릭
   - 이메일과 비밀번호로 회원가입/로그인

2. **수업 생성**

   - 대시보드에서 "새 수업 만들기" 클릭
   - 수업명, 설명, 배경색 설정
   - 6자리 수업 코드 자동 생성

3. **학생 초대**

   - 수업 코드를 학생들에게 공유
   - QR 코드 스캔으로 간편 참여 가능

4. **수업 진행**
   - 실시간 보드에서 학생 활동 모니터링
   - 학생들의 탐구 과정 확인 및 지도

### 🎓 **학생용 가이드**

1. **수업 참여**

   - 초기 화면에서 "수업 참여하기" 클릭
   - 선생님이 알려준 6자리 코드 입력
   - 이름 입력 후 수업 입장

2. **탐구 시작**

   - 보드 화면을 클릭해서 스티키 노트 생성
   - 노트를 클릭하여 AI 탐구학습 앱 실행

3. **6단계 탐구 진행**
   - AI의 도움을 받으며 단계별 진행
   - 실험 데이터로 차트 생성
   - 발표 자료 준비 및 다운로드

## 📁 프로젝트 구조

```
science-research-app/
├── public/                     # 정적 파일
├── src/
│   ├── components/            # React 컴포넌트
│   │   ├── auth/             # 인증 관련
│   │   ├── board/            # 보드 관련
│   │   ├── research/         # 탐구학습 관련
│   │   └── ui/               # 공통 UI
│   ├── controllers/          # 비즈니스 로직
│   ├── models/               # 데이터 모델
│   ├── services/             # 외부 서비스
│   ├── lib/                  # 유틸리티
│   └── types/                # TypeScript 타입
├── database/                 # 데이터베이스 스키마
├── docs/                     # 문서
└── tests/                    # 테스트 파일
```

### 🔧 **핵심 컴포넌트**

| 컴포넌트             | 설명                | 파일 위치                                 |
| -------------------- | ------------------- | ----------------------------------------- |
| **WelcomeScreen**    | 앱 시작 화면        | `src/components/WelcomeScreen.tsx`        |
| **TeacherDashboard** | 교사 대시보드       | `src/components/TeacherDashboard.tsx`     |
| **Board**            | 실시간 협업 보드    | `src/components/board/Board.tsx`          |
| **ResearchApp**      | AI 탐구학습 앱      | `src/components/research/ResearchApp.tsx` |
| **StepContent**      | 6단계 탐구 컴포넌트 | `src/components/research/steps/`          |

## 🗄 데이터베이스 설계

### **주요 테이블**

#### **boards** - 수업 관리

```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  teacher_id UUID REFERENCES auth.users(id),
  class_code VARCHAR(6) UNIQUE,
  background_color VARCHAR(7),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **notes** - 스티키 노트

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  board_id UUID REFERENCES boards(id),
  content TEXT NOT NULL,
  x_position INTEGER,
  y_position INTEGER,
  color VARCHAR(7),
  author_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **research_projects** - 탐구 프로젝트

```sql
CREATE TABLE research_projects (
  id UUID PRIMARY KEY,
  note_id UUID REFERENCES notes(id),
  title VARCHAR(255),
  student_name VARCHAR(100),
  current_step INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

자세한 스키마는 [`database/schema.sql`](database/schema.sql) 참조

## 📡 API 문서

### **주요 API 엔드포인트**

#### **인증**

- `POST /auth/signup` - 회원가입
- `POST /auth/signin` - 로그인
- `POST /auth/signout` - 로그아웃

#### **수업 관리**

- `GET /boards` - 수업 목록 조회
- `POST /boards` - 새 수업 생성
- `GET /boards/:id` - 수업 상세 조회
- `PUT /boards/:id` - 수업 정보 수정

#### **실시간 기능**

- WebSocket을 통한 실시간 데이터 동기화
- Supabase Realtime 구독

자세한 API 문서는 [API Documentation](docs/api.md) 참조

## 🎨 사용자 인터페이스

### **반응형 디자인**

- 📱 모바일 우선 설계
- 💻 데스크톱 최적화
- 🎨 다크/라이트 모드 지원

### **접근성**

- ♿ WCAG 2.1 AA 준수
- ⌨️ 키보드 네비게이션
- 🔊 스크린 리더 지원

## 🧪 테스트

```bash
# 단위 테스트 실행
npm run test

# 통합 테스트 실행
npm run test:integration

# E2E 테스트 실행
npm run test:e2e

# 커버리지 확인
npm run test:coverage
```

## 📈 성능 최적화

- **⚡ 코드 분할**: React.lazy를 통한 동적 임포트
- **🗜️ 이미지 최적화**: WebP 포맷 및 지연 로딩
- **💾 캐싱**: Service Worker 및 브라우저 캐시 활용
- **📊 번들 분석**: webpack-bundle-analyzer

## 🚀 배포

### **Vercel 배포**

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### **Netlify 배포**

```bash
# 빌드
npm run build

# dist 폴더를 Netlify에 업로드
```

### **Docker 배포**

```bash
# 이미지 빌드
docker build -t science-research-app .

# 컨테이너 실행
docker run -p 3000:3000 science-research-app
```

자세한 배포 가이드는 [배포 문서](docs/deployment.md) 참조

## 🤝 기여하기

프로젝트에 기여해주셔서 감사합니다!

### **기여 방법**

1. 포크 생성
2. 피처 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

### **개발 가이드라인**

- 코드 스타일: Prettier + ESLint 설정 준수
- 커밋 메시지: [Conventional Commits](https://conventionalcommits.org/) 규칙
- 테스트: 새 기능은 반드시 테스트 포함

자세한 내용은 [기여 가이드](CONTRIBUTING.md) 참조

## 🐛 버그 리포트

버그를 발견하셨나요? [Issues](https://github.com/yourusername/science-research-app/issues)에 다음 정보와 함께 신고해주세요:

- 운영체제 및 브라우저 정보
- 재현 단계
- 예상 동작 vs 실제 동작
- 스크린샷 (가능한 경우)

## 📞 지원 및 문의

- **📧 이메일**: support@science-research-app.com
- **💬 Discord**: [커뮤니티 서버 참여](https://discord.gg/science-research)
- **📖 문서**: [전체 문서 보기](https://docs.science-research-app.com)
- **🎥 튜토리얼**: [YouTube 채널](https://youtube.com/@science-research-app)

## 🏆 인정 및 감사

이 프로젝트는 다음 오픈소스 프로젝트들의 도움을 받았습니다:

- [React](https://reactjs.org/) - UI 라이브러리
- [Supabase](https://supabase.com/) - 백엔드 서비스
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크
- [Lucide React](https://lucide.dev/) - 아이콘 라이브러리

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

<div align="center">

**🔬 AI와 함께하는 나만의 과학 탐구 여행으로 미래의 과학자를 키워보세요!**

[**🚀 지금 시작하기**](https://science-research-app.vercel.app) | [**📖 문서 보기**](docs/) | [**💬 커뮤니티 참여**](https://discord.gg/science-research)

Made with ❤️ for Science Education

</div>
