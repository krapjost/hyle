import { createI18nContext } from "@solid-primitives/i18n";

const dict: Record<string, Record<string, any>> = {
  en: {
    main: {
      intro: "Typewriter for novel author",
      ctaButton: "Start writing",
      feature: {
        one: "Auto syncronization with your own cloud storage.",
        two: "Typewriter view.",
        three: "Sentence Recommendation by your own preferred language.",
        four: "Component based Story management.",
        five: "Colaborative editing with your Editor.",
      },
    },
    project: {
      search: "Search ...",
      books: "Books",
      trash: "Trash",
      account: "Account",
      settings: "Settings",
      logout: "Logout",
    },
    editor: {
      default_title: "Untitled",
    },
    tooltip: {
      directory: {
        main: "Click to set directory.",
        sub: "This is your local root directory",
      },
      hideSidebar: {
        main: "Ctrl \\",
        sub: "Hide sidebar.",
      },
    },
  },
  ko: {
    main: {
      intro: "소설 작가들을 위한 타자기",
      ctaButton: "시작하기",
      feature: {
        one: "자동으로 클라우드 스토리지에 백업됩니다.",
        two: "글에 집중할 수 있도록 타자기처럼 스크롤을 고정할 수 있습니다.",
        three: "자주 사용하는 문장으로 자동완성을 추천해줍니다.",
        four: "이야기의 구성 요소를 세분화해 관리할 수 있습니다.",
        five: "편집자나 동료 작가들과 동시에 편집할 수 있습니다.",
      },
    },
    project: {
      search: "검색 ...",
      books: "프로젝트",
      trash: "휴지통",
      account: "계정",
      settings: "설정",
      logout: "로그아웃",
    },
    editor: {
      default_title: "제목없음",
    },
    tooltip: {
      private: {
        main: "해당 섹션 숨기기.",
        sub: "공개되지 않는 개인 글들입니다.",
      },
      hideSidebar: {
        main: "Ctrl \\",
        sub: "사이드바 숨기기.",
      },
    },
  },
};

export function getUserLocaleContext(): [
  template: (
    key: string,
    params?: Record<string, string>,
    defaultValue?: string
  ) => any,
  actions: {
    add(lang: string, table: Record<string, any>): void;
    locale: (lang?: string) => string;
    dict: (lang: string) => Record<string, Record<string, any>>;
  }
] {
  const lang = dict[navigator.language] ? navigator.language : "en";
  const context = createI18nContext(dict, lang);
  return context;
}
