# WithU (위듀)

## 프로젝트 개요

WithU(위듀)는 연인들이 특별한 순간을 기록하고 기념할 수 있도록 돕는 커플 앱입니다.
연애 시작일부터 오늘까지의 D-Day를 계산하고, 다가오는 기념일을 알려주며, 추억(사진 + 메모)을 달력과 타임라인으로 관리할 수 있습니다.
또한 배너 광고를 통한 수익화를 지원합니다.

## 주요 기능

### 1. 핵심 기능

- **연애 시작일 입력**: 앱 첫 실행 시 연애 시작일을 입력 → 모든 기념일 계산의 기준
- **오늘 D-Day 표시**: 홈 화면 상단에 "오늘은 OOO일째" 자동 표시
- **기념일 자동 계산**: 100일, 200일, 1년 단위 등 주요 기념일 자동 표시 + 사용자가 직접 기념일 추가 가능
- **기념일 알림**: 주요 기념일이 다가오면 푸시 알림 제공 (알림 시점 사용자 설정 가능)

### 2. 추억 저장소

- **사진 + 메모 저장**: 특정 날짜에 사진 1장 + 메모 저장
- **달력 뷰**: 날짜별 저장된 기록을 한눈에 확인
- **타임라인 뷰**: 시간 순으로 추억 나열 → 연애 흐름을 한눈에 파악

### 3. UI/UX

- **홈 화면**
  - 상단: 오늘의 D-Day
  - 중간: 다가오는 기념일 목록
  - 하단: 고정 광고 배너
- **추억 화면**
  - 달력 뷰 / 타임라인 뷰 탭 전환
  - 날짜 선택 시 사진+메모 확인
- **전반적인 디자인**: 따뜻하고 감성적인 색감, 직관적 아이콘, 쉬운 내비게이션

### 4. 광고/수익화

- **하단 고정 배너 광고**: 모든 화면에 노출
- **보상형 광고 (선택 사항)**: 앨범 용량 추가 등 프리미엄 기능 시 자발적 광고 시청으로 제공

## 기술 스택 (초안)

- Expo + React Native
- TypeScript
- React Navigation
- Expo Notifications (푸시 알림)
- 로컬 DB (AsyncStorage or SQLite)
- AdMob (광고 수익화)

## 1차 목표 (MVP)

- 연애 시작일 입력 및 D-Day 계산
- 주요 기념일 자동 계산 및 알림
- 추억(사진+메모) 달력 저장/조회
- 하단 고정 배너 광고

# Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

## File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
gemini command:

### Examples:

**Single file analysis:**

````bash
  gemini -p "@src/main.py Explain this file's purpose and structure"

  Multiple files:
  gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"

  Entire directory:
  gemini -p "@src/ Summarize the architecture of this codebase"

  Multiple directories:
  gemini -p "@src/ @tests/ Analyze test coverage for the source code"

  Current directory and subdirectories:
  gemini -p "@./ Give me an overview of this entire project"

#
 Or use --all_files flag:
  gemini --all_files -p "Analyze the project structure and dependencies"

  Implementation Verification Examples

  Check if a feature is implemented:
  gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"

  Verify authentication implementation:
  gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"

  Check for specific patterns:
  gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"

  Verify error handling:
  gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"

  Check for rate limiting:
  gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"

  Verify caching strategy:
  gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"

  Check for specific security measures:
  gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"

  Verify test coverage for features:
  gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"

  When to Use Gemini CLI

  Use gemini -p when:
  - Analyzing entire codebases or large directories
  - Comparing multiple large files
  - Need to understand project-wide patterns or architecture
  - Current context window is insufficient for the task
  - Working with files totaling more than 100KB
  - Verifying if specific features, patterns, or security measures are implemented
  - Checking for the presence of certain coding patterns across the entire codebase

  Important Notes

  - Paths in @ syntax are relative to your current working directory when invoking gemini
  - The CLI will include file contents directly in the context
  - No need for --yolo flag for read-only analysis
  - Gemini's context window can handle entire codebases that would overflow Claude's context
  - When checking implementations, be specific about what you're looking for to get accurate results # Using Gemini CLI for Large Codebase Analysis


  When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
  context window. Use `gemini -p` to leverage Google Gemini's large context capacity.


  ## File and Directory Inclusion Syntax


  Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
   gemini command:


  ### Examples:


  **Single file analysis:**
  ```bash
  gemini -p "@src/main.py Explain this file's purpose and structure"


  Multiple files:
  gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"


  Entire directory:
  gemini -p "@src/ Summarize the architecture of this codebase"


  Multiple directories:
  gemini -p "@src/ @tests/ Analyze test coverage for the source code"


  Current directory and subdirectories:
  gemini -p "@./ Give me an overview of this entire project"
  # Or use --all_files flag:
  gemini --all_files -p "Analyze the project structure and dependencies"


  Implementation Verification Examples


  Check if a feature is implemented:
  gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"


  Verify authentication implementation:
  gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"


  Check for specific patterns:
  gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"


  Verify error handling:
  gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"


  Check for rate limiting:
  gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"


  Verify caching strategy:
  gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"


  Check for specific security measures:
  gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"


  Verify test coverage for features:
  gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"


  When to Use Gemini CLI


  Use gemini -p when:
  - Analyzing entire codebases or large directories
  - Comparing multiple large files
  - Need to understand project-wide patterns or architecture
  - Current context window is insufficient for the task
  - Working with files totaling more than 100KB
  - Verifying if specific features, patterns, or security measures are implemented
  - Checking for the presence of certain coding patterns across the entire codebase


  Important Notes


  - Paths in @ syntax are relative to your current working directory when invoking gemini
  - The CLI will include file contents directly in the context
  - No need for --yolo flag for read-only analysis
  - Gemini's context window can handle entire codebases that would overflow Claude's context
  - When checking implementations, be specific about what you're looking for to get accurate results
````
