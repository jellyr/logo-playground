import * as React from "react";
import * as cn from "classnames";
import { _T } from "app/services/customizations/localization.service";

interface IComponentState {
  menuIsActive?: boolean;
}

interface IComponentProps {
  className?: string;
  isRunning: boolean;
  runProgram: () => void;
  stopProgram: () => void;
  existingProgramName?: string;
  revertChanges?: () => void;
  saveAsNew?: () => void;
  save?: () => void;
  onShareProgram: () => void;
  exportImage: () => void;
}

export class ProgramControlsMenuComponent extends React.Component<IComponentProps, IComponentState> {
  constructor(props: IComponentProps) {
    super(props);

    this.state = {};
  }

  programMenuClicked = () => {
    this.setState({ menuIsActive: !this.state.menuIsActive });
  };

  render(): JSX.Element | null {
    return (
      <div className="program-controls-menu-component">
        {!this.props.isRunning && (
          <button
            type="button"
            className="button is-success is-borderless"
            onClick={this.props.runProgram}
            title={_T("Execute the program") + " (F9)"}
          >
            {_T("Run")}
          </button>
        )}{" "}
        {this.props.isRunning && (
          <button
            type="button"
            className="button is-warning is-borderless"
            onClick={this.props.stopProgram}
            title={_T("Stop execution of the program")}
          >
            {_T("Stop")}
          </button>
        )}{" "}
        <div className={cn("dropdown is-right is-borderless", { "is-active": this.state.menuIsActive })}>
          <div className="dropdown-trigger">
            <button
              className="button is-light"
              aria-haspopup="true"
              aria-controls="dropdown-menu6"
              onClick={this.programMenuClicked}
            >
              <i className="fa fa-ellipsis-h" aria-hidden="true" />
            </button>
          </div>
          <div className="dropdown-menu" id="dropdown-menu6" role="menu">
            <div className="dropdown-content">
              {this.props.revertChanges && (
                <a
                  className="dropdown-item"
                  onClick={() => {
                    this.setState({ menuIsActive: false });
                    this.props.revertChanges && this.props.revertChanges();
                  }}
                >
                  <i className="fa fa-undo icon-fixed-width" aria-hidden="true" />
                  {_T("Revert changes")}
                </a>
              )}
              {this.props.saveAsNew && (
                <a
                  className="dropdown-item"
                  onClick={() => {
                    this.setState({ menuIsActive: false });
                    this.props.saveAsNew && this.props.saveAsNew();
                  }}
                >
                  <i className="fa fa-clone icon-fixed-width" aria-hidden="true" />
                  {_T("Save as ...")}
                </a>
              )}

              {(this.props.revertChanges || this.props.saveAsNew) && <hr className="dropdown-divider" />}

              {this.props.save && (
                <a
                  className="dropdown-item"
                  onClick={() => {
                    this.setState({ menuIsActive: false });
                    this.props.save && this.props.save();
                  }}
                >
                  <i className="fa fa-check-square-o icon-fixed-width" aria-hidden="true" />
                  {_T("Save")}
                </a>
              )}
              <a
                className="dropdown-item"
                onClick={() => {
                  this.setState({ menuIsActive: false });
                  this.props.onShareProgram();
                }}
              >
                <i className="fa fa-share-alt icon-fixed-width" aria-hidden="true" />
                {_T("Share")}
              </a>
              <hr className="dropdown-divider" />
              <a
                className="dropdown-item"
                onClick={() => {
                  this.setState({ menuIsActive: false });
                  this.props.exportImage();
                }}
              >
                <i className="fa fa-camera icon-fixed-width" aria-hidden="true" />
                {_T("Take screenshot")}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
