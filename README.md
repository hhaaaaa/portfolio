# portfolio

코드 검사는 원본 프로젝트에서 이관한 ESLint 규칙을 사용합니다. 서식은 원본의 `.prettierrc`와 Prettier를 사용합니다. `npm run format -- <파일>`로 지정한 파일을 포맷하고, `npm run format:check -- <파일>`로 확인할 수 있습니다. 기존 파일 전체에 일괄 적용하지 않습니다.

하현의 기존 Jekyll 포트폴리오를 Next.js로 옮긴 프로젝트입니다. 2026-11-09에 공개된 한국어·영어 페이지의 콘텐츠와 스타일을 기준으로 합니다. 레거시를 기준점으로 만든 이후에 화면 구조와 콘텐츠를 개선할 예정입니다.

## 실행

Node.js 24.22.2와 npm을 사용합니다. 이 PC에서 프로젝트 전용 런타임이 준비되어 있다면:

```powershell
cd C:\Users\hha\Documents\GitHub\portfolio
.\scripts\npm-local.ps1 run dev
```

- 한국어: http://localhost:3000/
- 영어: http://localhost:3000/en/

다른 환경에서는 Node.js 24.22.2를 설치한 뒤 `npm ci`, `npm run dev`를 사용합니다. `.tools/`의 로컬 런타임은 Git에 포함하지 않습니다.

## 구조와 이관 기준

- `src/app/(ko)/`: 한국어 페이지와 `lang="ko"` 문서 레이아웃
- `src/app/(en)/en/`: 영어 페이지와 `lang="en"` 문서 레이아웃
- `src/data/legacy/{ko,en}.json`: 공개 페이지의 본문을 요소·속성·텍스트 구조로 이관한 데이터
- `src/views/Legacy/`: 위 데이터를 React 요소로 렌더링하고 내부 링크와 이미지의 배포 경로를 처리
- `public/assets/legacy.css`: 공개 사이트의 스타일시트 사본
- `public/images/profile_hha.jpg`: 공개 사이트의 프로필 이미지
- `scripts/import-legacy.py`: 저장된 공개 HTML 두 개를 구조화된 데이터로 변환하는 보조 스크립트

공개 사이트의 HTML을 기준으로 한국어·영어 본문을 각각 가져왔습니다. 연락처, 프로젝트 명칭과 영문 경력 설명에 로컬 Jekyll 소스와 차이가 있어 두 소스를 합쳐 임의로 바꾸지 않았습니다. 기존 배지에 대체 텍스트를 추가하고, 새 창으로 열리는 링크에는 `rel`을 추가했습니다. 화면 콘텐츠와 순서 자체는 원본을 유지합니다.

변환 데이터는 기준점 보존을 위한 중간 형태입니다. 콘텐츠를 바꾸려면 각 언어의 JSON을 수정할 수 있으며, 이후 개선 작업에서 프로젝트·경력별 도메인 데이터로 나눌 수 있습니다.

스타일은 기존과 마찬가지로 Google Fonts, Bootstrap, Font Awesome, shields.io 배지를 외부에서 불러옵니다. 인터넷이나 해당 서비스에 접근할 수 없는 환경에서는 폰트·배지·레이아웃에 차이가 생길 수 있습니다.

기존 페이지를 다시 가져올 때는 신뢰할 수 있는 로컬 HTML 파일을 전달합니다. 스크립트는 본문에서 허용된 요소와 속성만 추출하고 알려지지 않은 태그나 URL을 거부합니다.

```powershell
python scripts/import-legacy.py path/to/korean.html path/to/english.html
```

## 검사와 정적 내보내기

```powershell
.\scripts\npm-local.ps1 run check
.\scripts\npm-local.ps1 run build
```

빌드는 `out/`에 한국어와 영어 HTML을 생성합니다. `public/.nojekyll`도 출력에 포함됩니다. `/portfolio/` 같은 하위 경로에서 시험 배포할 때는 다음과 같이 빌드합니다.

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/portfolio'
.\scripts\npm-local.ps1 run build
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
```

화면 QA는 사용자가 진행합니다. 확인할 항목은 양 언어의 구성과 내용, 언어 전환, 이미지와 배지, 모바일·인쇄 화면입니다.

## Git 및 배포 상태

아직 원격 저장소 연결·커밋·배포를 수행하지 않았습니다. `.github/workflows/ci.yml`은 검사와 빌드를 수행하며, `.github/workflows/deploy-pages.yml`은 추후 기존 사용자 사이트 저장소에서 수동 실행하도록 준비된 설정입니다. 공개 사이트 교체 전에 실제 환경과 설정을 확인해야 합니다.
