import * as React from "react";
import * as $ from "jquery"; //required for goldenLayout
import * as goldenLayout from "golden-layout";
import { Subject, BehaviorSubject } from "rxjs";

import "./golden-layout.component.scss";

interface Newable<T> {
  new (...args: any[]): T;
}
export type GoldenLayoutConfig = goldenLayout.Config;

export interface IPanelConfig<T, P> {
  componentName: string;
  componentType: Newable<T>;
  props: P;
  title: BehaviorSubject<string>;
}

interface IComponentState {}

interface IComponentProps {
  panels: IPanelConfig<any, any>[];
  defaultLayoutConfigJSON: string;
  initialLayoutConfigJSON: string;
  onLayoutChange(newConfigJSON: string): void;
  panelsReloadCheck(oldPanels: IPanelConfig<any, any>[], newPanels: IPanelConfig<any, any>[]): boolean;
}

export class GoldenLayoutComponent extends React.Component<IComponentProps, IComponentState> {
  private layout: goldenLayout;
  private stateChangedTimer: any;
  private stateLastJSON: string;

  constructor(props: IComponentProps) {
    super(props);
  }

  shouldComponentUpdate() {
    return false;
  }

  componentDidMount() {
    this.initLayout(this.props);
    window.addEventListener("resize", this.onWindowResize);
  }

  componentWillUnmount() {
    //console.log('page-layout unmount')
    if (this.layout) {
      this.layout.destroy();
    }
    window.removeEventListener("resize", this.onWindowResize);
  }

  componentWillReceiveProps(nextProps: IComponentProps) {
    if (this.props.panelsReloadCheck(this.props.panels, nextProps.panels)) {
      this.initLayout(nextProps);
    }
  }

  onWindowResize = () => {
    if (window.matchMedia && window.matchMedia("only screen and (max-width: 760px)").matches) {
      /* Skip window resizing on mobile devices - bacause we should have browser full screen anyway
       and resizing is occuring due to on-screen keyboard toggling
       */
      return;
    }
    if (this.layout) {
      this.layout.updateSize();
    }
  };

  initLayout(props: IComponentProps) {
    setTimeout(() => {
      try {
        this.initLayoutWithConfig(props, props.initialLayoutConfigJSON);
      } catch (ex) {
        this.initLayoutWithConfig(props, props.defaultLayoutConfigJSON);
      }
    }, 0);
  }

  initLayoutWithConfig(props: IComponentProps, configJSON: string) {
    if (!configJSON) {
      throw new Error("config should be not empty JSON");
    }
    const config = this.layout ? this.layout.toConfig() : JSON.parse(configJSON);
    for (const panel of props.panels) {
      const panelConfig = this.getGoldenLayoutConfigItem(panel.componentName, config);
      (panelConfig as any).props = panel.props;
      (panelConfig as any).componentState = {};
    }
    config.settings = {
      showMaximiseIcon: false,
      showPopoutIcon: false,
      showCloseIcon: false
    };
    config.dimensions = {
      headerHeight: 32
    };
    const element = this.refs["container"] as any;
    if (this.layout) {
      this.layout.destroy();
    }
    this.layout = new goldenLayout(config, element);
    for (const panel of props.panels) {
      this.layout.registerComponent(panel.componentName, panel.componentType);
    }
    this.layout.init();
    this.layout.on("stateChanged", this.onStateChanged);

    this.setPanelTitles(props);
  }

  private setPanelTitles(props: IComponentProps) {
    for (const panel of props.panels) {
      const panelContentItem = this.findGoldenLayoutContentItem(this.layout.root, panel.componentName);
      if (!panelContentItem) {
        console.log("Error: cannot find panel in layout: " + panelContentItem);
        return;
      }
      panelContentItem.setTitle(panel.title.value);
      panel.title.subscribe(newTitle => {
        panelContentItem.setTitle(newTitle);
      });
    }
  }

  onStateChanged = () => {
    if (this.stateChangedTimer) {
      clearTimeout(this.stateChangedTimer);
    }
    this.stateChangedTimer = setTimeout(this.stateChangeHandler, 500);
  };

  stateChangeHandler = () => {
    const config = this.layout.toConfig();
    // erase props from config layout
    for (const panel of this.props.panels) {
      const panelConfig = this.findGoldenLayoutConfigItem(panel.componentName, config.content);
      if (panelConfig) {
        (panelConfig as any).props = undefined;
        (panelConfig as any).componentState = undefined;
      }
    }
    const json = JSON.stringify(config);
    if (this.stateLastJSON != json) {
      this.stateLastJSON = json;
      this.props.onLayoutChange(json);
    }
  };

  render(): JSX.Element {
    return <div className="golden-layout-component" ref="container" />;
  }

  private getGoldenLayoutConfigItem(type: string, config: goldenLayout.Config): goldenLayout.ItemConfigType {
    const item = this.findGoldenLayoutConfigItem(type, config.content);
    if (item) {
      return item;
    } else {
      throw new Error(`Cannot find element ${type} in golden layout config`);
    }
  }

  private findGoldenLayoutContentItem(
    root: goldenLayout.ContentItem,
    componentName: string
  ): goldenLayout.ContentItem | undefined {
    if (!root) {
      return undefined;
    }
    if ((root.config as any).component === componentName) {
      return root;
    }

    for (const child of root.contentItems) {
      const val = this.findGoldenLayoutContentItem(child, componentName);
      if (val) {
        return val;
      }
    }

    return undefined;
  }

  private findGoldenLayoutConfigItem(
    componentName: string,
    content?: goldenLayout.ItemConfigType[]
  ): goldenLayout.ItemConfigType | undefined {
    if (content) {
      for (const item of content) {
        if ((item as any).component === componentName) {
          return item;
        }
        if (item.content) {
          const res = this.findGoldenLayoutConfigItem(componentName, item.content);
          if (res) {
            return res;
          }
        }
      }
    }
    return undefined;
  }
}
