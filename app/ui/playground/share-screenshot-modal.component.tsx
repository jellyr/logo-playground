import * as React from 'react';
import * as cn from 'classnames'
import * as clipboard from 'clipboard';
import { Button, ButtonGroup, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton, Modal, OverlayTrigger } from 'react-bootstrap';
import { AlertMessageComponent } from "app/ui/_generic/alert-message.component";
import { ProgressIndicatorComponent } from "app/ui/_generic/progress-indicator.component";

import { _T } from "app/services/customizations/localization.service";
import { ServiceLocator } from "app/services/service-locator";

interface IComponentState {
    errorMessage: string
    isSavingInProgress: boolean
    imgUrl?: string
}

interface IComponentProps {
    imageBase64: string
    onClose: () => void
}

export class ShareScreenshotModalComponent extends React.Component<IComponentProps, IComponentState> {
    private imageUploadService = ServiceLocator.resolve(x => x.imageUploadService);
    private clipboardInstance: clipboard;

    constructor(props: IComponentProps) {
        super(props);

        this.state = {
            errorMessage: '',
            isSavingInProgress: true,
        }
    }

    async componentDidMount() {
        this.clipboardInstance = new clipboard('.btn-clipboard-img-url');

        try {
            const link = await this.imageUploadService.doUpload(this.props.imageBase64);
            this.setState({
                isSavingInProgress: false,
                imgUrl: link
            })
        }
        catch (ex) {
            this.setState({
                isSavingInProgress: false,
                errorMessage: _T("Sorry, error has occured")
            })
        }
    }

    componentWillUnmount() {
        if (this.clipboardInstance) {
            this.clipboardInstance.destroy();
        }
    }

    render(): JSX.Element {
        return (
            <Modal show={true} animation={false} onHide={this.props.onClose} backdrop='static' >
                <Modal.Header closeButton>
                    <Modal.Title>{_T("Screenshot")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-sm-12">
                            {
                                this.state.isSavingInProgress
                                && <ProgressIndicatorComponent isLoading={this.state.isSavingInProgress} />
                            }
                            {
                                this.state.errorMessage
                                && <AlertMessageComponent message={this.state.errorMessage} type="danger" />
                            }
                            {
                                this.state.imgUrl &&
                                <div>
                                    <input id="foo" type="text" className="form-control" value={this.state.imgUrl}
                                        spellCheck={false} autoComplete="off" autoCorrect="off" autoCapitalize="off"
                                    />
                                    <img className="img-responsive" src={this.state.imgUrl} style={{ width: 600, height: 400 }} />
                                </div>
                            }
                        </div>
                    </div>
                    <br />
                </Modal.Body>
                <Modal.Footer>
                    {
                        this.state.imgUrl &&
                        <button type="button" className="btn btn-primary btn-clipboard-img-url" data-clipboard-target="#foo">
                            <span>{_T("Copy link to clipboard")}</span>
                        </button>
                    }
                    <button type="button" className="btn btn-link" onClick={this.props.onClose}>
                        <span>{_T("Close")}</span>
                    </button>
                </Modal.Footer>
            </Modal>
        );
    }
}