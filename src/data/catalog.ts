import { FrontendItem, OSFirmwareItem } from '../types';

export const frontends: FrontendItem[] = [
  {
    "id": "daijisho",
    "name": "Daijishō",
    "shortDesc": "안드로이드 레트로 게임기를 위한 모던 오픈소스 런처. 내장 스크래퍼, 다양한 커뮤니티 테마, 홈 런처 대체 및 레트로어치브먼트 연동 지원.",
    "pricing": "Free & Open Source",
    "status": "Active",
    "supportedPlatforms": [
      "Android"
    ],
    "hasBuiltInScraper": true,
    "themeSupport": "Rich",
    "touchOptimized": true,
    "gamepadOptimized": true,
    "canReplaceHomeLauncher": true,
    "ratings": {
      "adoption": 5,
      "easeOfUse": 4,
      "activity": 4
    },
    "logoUrl": "https://avatars.githubusercontent.com/u/130823084?v=4",
    "coverImageUrl": "https://raw.githubusercontent.com/TapiocaFox/Daijishou/main/fastlane/metadata/android/en-US/images/featureGraphic.png",
    "screenshots": [],
    "officialUrl": "https://github.com/TapiocaFox/Daijishou",
    "downloadUrl": "https://play.google.com/store/apps/details?id=com.tapiocafox.daijishou",
    "githubRepo": "TapiocaFox/Daijishou"
  },
  {
    "id": "retroarch",
    "name": "RetroArch",
    "shortDesc": "에뮬레이션 생태계의 모듈형 통합 프론트엔드이자 코어 런처. 셰이더, 넷플레이, 내장 스크래퍼 및 전 플랫폼 지원.",
    "pricing": "Free & Open Source",
    "status": "Active",
    "supportedPlatforms": [
      "Android",
      "iOS",
      "Windows",
      "Linux",
      "macOS"
    ],
    "hasBuiltInScraper": true,
    "themeSupport": "Rich",
    "touchOptimized": true,
    "gamepadOptimized": true,
    "canReplaceHomeLauncher": false,
    "ratings": {
      "adoption": 5,
      "easeOfUse": 2,
      "activity": 5
    },
    "logoUrl": "https://avatars.githubusercontent.com/u/7994464?v=4",
    "coverImageUrl": "https://www.retroarch.com/images/banner.png",
    "screenshots": [],
    "officialUrl": "https://www.retroarch.com/",
    "downloadUrl": "https://www.retroarch.com/?page=platforms",
    "githubRepo": "libretro/RetroArch"
  },
  {
    "id": "beacon-launcher",
    "name": "Beacon Game Launcher",
    "shortDesc": "안드로이드 휴대용 기기와 컨트롤러에 최적화된 모던 유료 게임 런처. 빠른 자동 스크래핑과 군더더기 없는 미니멀 UI.",
    "pricing": "Paid",
    "status": "Active",
    "supportedPlatforms": [
      "Android"
    ],
    "hasBuiltInScraper": true,
    "themeSupport": "Rich",
    "touchOptimized": true,
    "gamepadOptimized": true,
    "canReplaceHomeLauncher": true,
    "ratings": {
      "adoption": 4,
      "easeOfUse": 5,
      "activity": 4
    },
    "logoUrl": "https://play-lh.googleusercontent.com/9k3xoQaMinZqR19EHHU5ZkrfikV9NQWvg8U8tWpiFFKbobUE_JkVc24frgqCfsbVaebJGjKwU0l3UfnmJBJdyfk",
    "coverImageUrl": "",
    "screenshots": [],
    "officialUrl": "https://play.google.com/store/apps/details?id=com.radikal.gamelauncher",
    "downloadUrl": "https://play.google.com/store/apps/details?id=com.radikal.gamelauncher"
  },
  {
    "id": "lemuroid",
    "name": "Lemuroid",
    "shortDesc": "Material You 디자인 기반의 올인원 안드로이드 Libretro 에뮬레이터 겸 프론트엔드. 롬 폴더 지정 즉시 자동 인덱싱 및 클라우드 세이브 지원.",
    "pricing": "Free & Open Source",
    "status": "Active",
    "supportedPlatforms": [
      "Android"
    ],
    "hasBuiltInScraper": true,
    "themeSupport": "Basic",
    "touchOptimized": true,
    "gamepadOptimized": true,
    "canReplaceHomeLauncher": false,
    "ratings": {
      "adoption": 4,
      "easeOfUse": 5,
      "activity": 4
    },
    "logoUrl": "https://play-lh.googleusercontent.com/hWs9NKnx1bqRK3x8l-e2KlvBbgOBWikkdYsIvSVtkOHNNwLxpxv6OI6V2v2IaDpEantdC97JnEQdIYAEhA4fRw",
    "coverImageUrl": "",
    "screenshots": [],
    "officialUrl": "https://github.com/swordfish90/Lemuroid",
    "downloadUrl": "https://play.google.com/store/apps/details?id=com.swordfish.lemuroid",
    "githubRepo": "swordfish90/Lemuroid"
  },
  {
    "id": "iisu",
    "name": "iiSU",
    "shortDesc": "안드로이드 휴대용 기기를 위한 비주얼 중심의 차세대 에뮬레이션 프론트엔드. 닌텐도 3DS 감성의 듀얼 씬 인터페이스와 애니메이션 위젯 지원.",
    "pricing": "Free",
    "status": "Active",
    "supportedPlatforms": [
      "Android"
    ],
    "hasBuiltInScraper": true,
    "themeSupport": "Rich",
    "touchOptimized": true,
    "gamepadOptimized": true,
    "canReplaceHomeLauncher": true,
    "ratings": {
      "adoption": 3,
      "easeOfUse": 3,
      "activity": 4
    },
    "logoUrl": "https://avatars.githubusercontent.com/u/235037752?v=4",
    "coverImageUrl": "",
    "screenshots": [],
    "officialUrl": "https://github.com/iisu-network/iiSU",
    "downloadUrl": "https://github.com/iisu-network/iiSU/releases",
    "githubRepo": "iisu-network/iiSU"
  },
  {
    "id": "neostation",
    "name": "NeoStation",
    "shortDesc": "가볍고 직관적인 모던 에뮬레이션 프론트엔드. 기기 간 세이브 파일을 실시간 동기화하는 NeoSync, RetroAchievements 및 ScreenScraper 지원.",
    "pricing": "Free & Open Source",
    "status": "Active",
    "supportedPlatforms": [
      "Android",
      "Windows"
    ],
    "hasBuiltInScraper": true,
    "themeSupport": "Rich",
    "touchOptimized": true,
    "gamepadOptimized": true,
    "canReplaceHomeLauncher": true,
    "ratings": {
      "adoption": 3,
      "easeOfUse": 4,
      "activity": 4
    },
    "logoUrl": "https://neostation.dev/favicon.png",
    "coverImageUrl": "",
    "screenshots": [],
    "officialUrl": "https://neostation.dev/",
    "downloadUrl": "https://github.com/misobadev/neostation-frontend/releases",
    "githubRepo": "misobadev/neostation-frontend"
  },
  {
    "id": "cocoon",
    "name": "Cocoon",
    "shortDesc": "안드로이드 휴대기기 및 듀얼 스크린에 특화된 커스텀 런처. 3DS 스타일 그리드/도크 UI, 디스코드 Rich Presence, RetroAchievements 및 위젯 지원.",
    "pricing": "Free & Open Source",
    "status": "Active",
    "supportedPlatforms": [
      "Android"
    ],
    "hasBuiltInScraper": true,
    "themeSupport": "Rich",
    "touchOptimized": true,
    "gamepadOptimized": true,
    "canReplaceHomeLauncher": true,
    "ratings": {
      "adoption": 3,
      "easeOfUse": 4,
      "activity": 4
    },
    "logoUrl": "https://cocoon-shell.com/logo.svg",
    "coverImageUrl": "https://cocoon-shell.com/images/news/3.0/banner.webp",
    "screenshots": [],
    "officialUrl": "https://cocoon-shell.com/",
    "downloadUrl": "https://github.com/inssekt/CocoonFE/releases",
    "githubRepo": "inssekt/CocoonFE"
  },
  {
    "id": "launchbox",
    "name": "LaunchBox",
    "shortDesc": "PC 및 안드로이드를 위한 프리미엄 게임 데이터베이스 런처. 화려한 Big Box 컨트롤러 UI, 커뮤니티 데이터베이스 스크래퍼 및 비디오 테마 지원.",
    "pricing": "Freemium",
    "status": "Active",
    "supportedPlatforms": [
      "Windows",
      "Android"
    ],
    "hasBuiltInScraper": true,
    "themeSupport": "Rich",
    "touchOptimized": true,
    "gamepadOptimized": true,
    "canReplaceHomeLauncher": true,
    "ratings": {
      "adoption": 5,
      "easeOfUse": 4,
      "activity": 5
    },
    "logoUrl": "https://www.launchbox-app.com/apple-touch-icon.png",
    "coverImageUrl": "",
    "screenshots": [],
    "officialUrl": "https://www.launchbox-app.com/",
    "downloadUrl": "https://www.launchbox-app.com/download"
  },
  {
    "id": "retrobat",
    "name": "RetroBat",
    "shortDesc": "윈도우 환경에서 EmulationStation과 RetroArch를 완벽 사전 구성해 제공하는 배포판. 별도 설정 없이 컨트롤러로 즉시 플레이 가능한 올인원 프론트엔드.",
    "pricing": "Free & Open Source",
    "status": "Active",
    "supportedPlatforms": [
      "Windows"
    ],
    "hasBuiltInScraper": true,
    "themeSupport": "Rich",
    "touchOptimized": false,
    "gamepadOptimized": true,
    "canReplaceHomeLauncher": false,
    "ratings": {
      "adoption": 4,
      "easeOfUse": 5,
      "activity": 4
    },
    "logoUrl": "https://avatars.githubusercontent.com/u/57745778?v=4",
    "coverImageUrl": "",
    "screenshots": [],
    "officialUrl": "https://www.retrobat.org/",
    "downloadUrl": "https://www.retrobat.org/",
    "githubRepo": "RetroBat-Team/retrobat-setup"
  },
  {
    "id": "es-de",
    "name": "ES-DE",
    "shortDesc": "멀티 플랫폼 컬렉션을 위한 완성형 에뮬레이션스테이션 프론트엔드. 독보적인 테마 커스터마이징, 내장 스크래퍼 및 전용 휴대기기/데스크톱 완벽 지원.",
    "pricing": "Free & Open Source",
    "status": "Active",
    "supportedPlatforms": [
      "Windows",
      "Linux",
      "macOS",
      "Android"
    ],
    "hasBuiltInScraper": true,
    "themeSupport": "Rich",
    "touchOptimized": false,
    "gamepadOptimized": true,
    "canReplaceHomeLauncher": false,
    "ratings": {
      "adoption": 5,
      "easeOfUse": 3,
      "activity": 5
    },
    "logoUrl": "https://gitlab.com/uploads/-/system/project/avatar/18817634/emulationstation_1024x1024.png?v=1789307732",
    "coverImageUrl": "",
    "screenshots": [],
    "officialUrl": "https://es-de.org/",
    "downloadUrl": "https://gitlab.com/es-de/emulationstation-de/-/releases"
  },
  {
    "id": "playnite",
    "name": "Playnite",
    "shortDesc": "PC 및 에뮬레이션 라이브러리를 위한 강력한 오픈소스 게임 매니저 및 런처. Steam/Epic/GOG 자동 연동, TV 전체화면 모드, 방대한 플러그인 생태계 제공.",
    "pricing": "Free & Open Source",
    "status": "Active",
    "supportedPlatforms": [
      "Windows"
    ],
    "hasBuiltInScraper": true,
    "themeSupport": "Rich",
    "touchOptimized": false,
    "gamepadOptimized": true,
    "canReplaceHomeLauncher": false,
    "ratings": {
      "adoption": 5,
      "easeOfUse": 4,
      "activity": 5
    },
    "logoUrl": "https://playnite.link/applogo.png",
    "coverImageUrl": "",
    "screenshots": [],
    "officialUrl": "https://playnite.link/",
    "downloadUrl": "https://playnite.link/",
    "githubRepo": "JosefNemec/Playnite"
  }
];

export const osFirmwares: OSFirmwareItem[] = [];
