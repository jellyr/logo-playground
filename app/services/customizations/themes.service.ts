import { injectable } from "app/di";

export interface Theme {
  name: string;
  isDark: boolean;
  codeEditorThemeName: string;
  styleLinks: string[];
}

@injectable()
export class ThemesService {
  private readonly themes: Theme[] = [
    {
      name: "Default",
      isDark: false,
      codeEditorThemeName: "eclipse",
      styleLinks: [
        "content/css/bulma/bulmaswatch.default.min.css",
        "content/css/codemirror/themes/eclipse.css",
        "content/css/golden-layout/goldenlayout-light-theme.css"
      ]
    },
    {
      name: "Litera",
      isDark: false,
      codeEditorThemeName: "eclipse",
      styleLinks: [
        "content/css/bulma/bulmaswatch.litera.min.css",
        "content/css/codemirror/themes/eclipse.css",
        "content/css/golden-layout/goldenlayout-light-theme.css"
      ]
    },
    {
      name: "Slate",
      isDark: true,
      codeEditorThemeName: "abcdef",
      styleLinks: [
        "content/css/bulma/bulmaswatch.slate.min.css",
        "content/css/codemirror/themes/abcdef.css",
        "content/css/golden-layout/goldenlayout-dark-theme.css"
      ]
    },
    {
      name: "Yeti",
      isDark: false,
      codeEditorThemeName: "eclipse",
      styleLinks: [
        "content/css/bulma/bulmaswatch.yeti.min.css",
        "content/css/codemirror/themes/eclipse.css",
        "content/css/golden-layout/goldenlayout-light-theme.css"
      ]
    },
    {
      name: "Cyborg",
      isDark: true,
      codeEditorThemeName: "abcdef",
      styleLinks: [
        "content/css/bulma/bulmaswatch.cyborg.min.css",
        "content/css/codemirror/themes/abcdef.css",
        "content/css/golden-layout/goldenlayout-dark-theme.css"
      ]
    }
  ];

  getAllThemes() {
    return this.themes;
  }

  getTheme(themeName: string): Theme {
    const selectedTheme = this.themes.find(t => t.name === themeName);
    if (selectedTheme) {
      return selectedTheme;
    }
    return this.themes[0];
  }
}