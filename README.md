# 📚 Veri Project

## Overview  
**Veri Project** is a personalized reading management web application designed for book lovers.  
Users can manage their personal bookshelf, track their reading progress,  
and create and share reading cards to record their thoughts and favorite quotes from books.  
With an intuitive interface and useful features, Veri Project enriches the overall reading experience.

---

## Features

### Personal Bookshelf Management:
- Add new books to your personal bookshelf.
- Set and manage reading status (Reading / Completed).
- Rate books and record your own score.
- Edit book information or remove books from the shelf.

### Reading Card Creation and Management:
- Create reading cards for your current reads to write reflections or memorable quotes.
- Download cards as images or share them on social media.
- View the list of your reading cards, see details, or delete them.

### User Profile and Statistics:
- View your profile information.
- Get insights into your reading habits such as number of books read and reading cards created.

### Book Exploration:
- Browse popular books and receive daily recommended books.
- Search books by title.

### Responsive Design:
- Optimized user experience across devices: mobile, tablet, and desktop.

---

## How to Use

### Access:
Open Veri Project in your web browser.

### Login:
Use Kakao or Naver social login to sign up and log in easily.

### Bookshelf Management:
- On the "My Bookshelf" page, click the `+ Add` button to register a new book.
- Click on a book to access its detail page, and modify rating or reading status.

### Reading Cards:
- In the book detail page, click the `+ Create Reading Card` button to write a new card.
- On the reading card page, check all your cards, view detailed content, download, share, or delete them.

---

https://veri.me.kr/login

## Project Structure

- `src/api/`: Defines functions and interfaces for backend API communication. (e.g., `bookApi.ts`, `cardApi.ts`, `memberApi.ts`, `auth.ts`)
- `src/components/`: Contains reusable UI components used across multiple pages. (e.g., `BookshelfList.tsx`, `ReadingCardItem.tsx`, `TabBar.tsx`)
- `src/pages/`: Includes main page components of the application. (e.g., `LoginPage.tsx`, `LibraryPage.tsx`, `MyBookshelfPage.tsx`, `BookDetailPage.tsx`, `ReadingCardPage.tsx`)
- `src/assets/`: Includes static resources such as images, icons, and global CSS files.
- `public/`: Contains static files that can be accessed directly during build.

---

## Feedback

Suggestions and feedback for **Veri Project** are always welcome!  
Please feel free to open an **Issue** or **Pull Request** if you have ideas or bug reports.

---

## License

This project was developed for educational and fan-made purposes only.  
All rights belong to the respective services and copyright holders.

# 📚 Veri Project

## 개요  
Veri Project는 독서 애호가들을 위한 개인 맞춤형 독서 관리 웹 애플리케이션입니다.  
사용자는 자신의 책장을 관리하고, 독서 진행 상황을 기록하며,  
책에 대한 감상과 인상을 독서 카드로 만들어 저장하고 공유할 수 있습니다.  
직관적인 인터페이스와 유용한 기능들로 독서 경험을 더욱 풍부하게 만들어줍니다.

---

## 주요 기능

### 개인 책장 관리:
- 새로운 책을 책장에 추가합니다.
- 책의 독서 상태(읽는 중, 읽기 완료)를 설정하고 관리합니다.
- 책에 별점을 부여하여 나만의 평점을 기록합니다.
- 책 정보를 수정하거나 책장에서 삭제할 수 있습니다.

### 독서 카드 생성 및 관리:
- 읽고 있는 책에 대한 독서 카드를 생성하여 감상, 인상 깊었던 구절 등을 기록합니다.
- 생성된 독서 카드를 이미지로 다운로드하거나 소셜 미디어에 공유할 수 있습니다.
- 독서 카드 목록을 확인하고, 개별 카드의 상세 내용을 조회하거나 삭제할 수 있습니다.

### 사용자 프로필 및 통계:
- 사용자 프로필 정보를 확인하고, 읽은 책의 수, 작성한 독서 카드의 수 등 독서 통계를 한눈에 볼 수 있습니다.

### 도서 탐색:
- 인기 도서 목록을 탐색하고, 오늘의 추천 도서를 받아볼 수 있습니다.
- 책 제목으로 원하는 책을 검색할 수 있습니다.

### 반응형 디자인:
- 모바일, 태블릿, 데스크톱 등 다양한 기기에서 최적화된 사용자 경험을 제공합니다.

---

## 게임 방법 (혹은 사용 방법)

### 접근:
웹 브라우저를 통해 Veri Project 웹 애플리케이션에 접속합니다.

### 로그인:
카카오 또는 네이버 소셜 로그인을 통해 간편하게 회원가입 및 로그인할 수 있습니다.

### 책장 관리:
- 나의 책장 페이지에서 `+ 등록하기` 버튼을 눌러 새로운 책을 추가합니다.
- 등록된 책을 클릭하여 상세 페이지로 이동하고, 별점이나 독서 상태를 변경할 수 있습니다.

### 독서 카드:
- 책 상세 페이지에서 `+ 독서카드 만들기` 버튼을 통해 새로운 독서 카드를 작성합니다.
- 독서카드 페이지에서 자신이 만든 모든 독서 카드를 확인하고, 각 카드를 클릭하여 상세 내용을 보거나 다운로드, 공유, 삭제할 수 있습니다.

---

## 프로젝트 구조

- `src/api/`: 백엔드 API와 통신하는 함수 및 인터페이스를 정의합니다. (예: bookApi.ts, cardApi.ts, memberApi.ts, auth.ts)
- `src/components/`: 여러 페이지에서 재사용되는 UI 컴포넌트들을 포함합니다. (예: BookshelfList.tsx, ReadingCardItem.tsx, TabBar.tsx)
- `src/pages/`: 애플리케이션의 주요 페이지 컴포넌트들을 포함합니다. (예: LoginPage.tsx, LibraryPage.tsx, MyBookshelfPage.tsx, BookDetailPage.tsx, ReadingCardPage.tsx)
- `src/assets/`: 이미지, 아이콘, 전역 CSS 파일 등 정적 자원들을 포함합니다.
- `public/`: 빌드 시 직접 접근 가능한 정적 파일들을 포함합니다.

---

## 피드백

Veri Project에 대한 제안이나 피드백은 언제든지 환영합니다!  
아이디어나 버그 리포트가 있다면 Issue나 Pull Request를 통해 알려주세요.

---

## 라이선스

이 프로젝트는 개인 학습 및 팬 제작 목적으로 개발되었습니다.  
모든 권리는 해당 서비스 및 저작권자에게 있습니다.

https://veri.me.kr/login