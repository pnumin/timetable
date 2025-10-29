# PDF 다운로드 기능 패키지 설치 안내

## 필요한 작업

시간표 PDF 다운로드 기능을 사용하려면 다음 패키지를 설치해야 합니다.

## 설치 명령어

frontend 디렉토리에서 다음 명령어를 실행하세요:

```bash
cd frontend
npm install
```

이 명령어는 package.json에 추가된 다음 패키지들을 설치합니다:
- `jspdf`: ^2.5.1 - PDF 생성 라이브러리
- `html2canvas`: ^1.4.1 - HTML을 Canvas로 변환하는 라이브러리
- `@types/html2canvas`: ^1.0.0 - html2canvas 타입 정의 (devDependency)

## 설치 확인

설치가 완료되면 다음을 확인하세요:
1. `frontend/node_modules/jspdf` 디렉토리가 생성됨
2. `frontend/node_modules/html2canvas` 디렉토리가 생성됨
3. TypeScript 에러가 사라짐

## 사용 방법

설치 후 개발 서버를 재시작하세요:
```bash
npm run dev
```

그런 다음 시간표 출력 페이지(/print)에서 "📄 PDF 다운로드" 버튼을 클릭하면 PDF 파일이 생성됩니다.

## 문제 해결

### 패키지가 설치되지 않는 경우
```bash
# package-lock.json 삭제 후 재설치
rm package-lock.json
rm -rf node_modules
npm install
```

### TypeScript 에러가 계속되는 경우
```bash
# TypeScript 서버 재시작
# VS Code: Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

### 빌드 에러가 발생하는 경우
```bash
# 캐시 삭제 후 재빌드
npm run build
```
