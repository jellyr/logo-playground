import * as React from 'react';
import * as Color from 'color';
import { Button, Nav, Navbar, NavDropdown, MenuItem, NavItem, DropdownButton } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { stay } from 'app/utils/async-helpers';

import { LoginComponent } from 'app/ui/login.component'
import { PageLoadingIndicatorComponent } from 'app/ui/_generic/page-loading-indicator.component';
import { MessageTosterComponent } from "app/ui/_generic/message-toster.component";

import { ServiceLocator } from 'app/services/service-locator'
import { Routes } from 'app/routes';
import { LoginServiceHelpers, LoginCredentials, LoginStatus } from "app/services/login/login.service";

interface IMainComponentState {
    isLoading: boolean
    showLoginPage: boolean
}

interface IMainComponentProps {
}

export class MainComponent extends React.Component<IMainComponentProps, IMainComponentState> {
    private appConfig = ServiceLocator.resolve(x => x.appConfig);
    private currentUser = ServiceLocator.resolve(x => x.currentUser);
    private loginService = ServiceLocator.resolve(x => x.loginService);
    private notificationService = ServiceLocator.resolve(x => x.notificationService);

    constructor(props: IMainComponentProps) {
        super(props);

        this.state = {
            showLoginPage: false,
            isLoading: true
        }

        let loginStatus = LoginServiceHelpers.getInvalidLoginStatus('guest', '');
        loginStatus.userInfo.attributes.name = "Guest";
        loginStatus.userInfo.id = '0';
        this.currentUser.setLoginStatus(loginStatus, true);
    }

    onLogin = async (credentials: LoginCredentials): Promise<LoginStatus> => {
        let loginStatus = await this.loginService.login(credentials);
        if (loginStatus.isLoggedIn) {
            this.currentUser.setLoginStatus(loginStatus, credentials.rememberMe);
            this.setState({ showLoginPage: false });
        }
        return loginStatus;
    }

    componentDidMount() {
        this.loginService.subscribeToLoginRequest(() => {
            this.setState({ showLoginPage: true });
        })
        this.loginWithToken();
    }

    async loginWithToken() {
        this.setState({ isLoading: true });
        const storedSettings = this.currentUser.getLocalStoredUserSettings();
        if (storedSettings) {
            let loginStatus = await this.loginService.loginWithToken(storedSettings.authToken, storedSettings.login)
            this.currentUser.setLoginStatus(loginStatus, true);
        }
        this.setState({ isLoading: false });
    }

    render(): JSX.Element {
        const isDarkTheme = Color(window.getComputedStyle(document.body, undefined).backgroundColor || 'white').luminosity() < 0.3;
        return <PageLoadingIndicatorComponent isLoading={this.state.isLoading} className={`${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
            <MessageTosterComponent events={this.notificationService.getObservable()} />
            {
                this.state.isLoading
                    ? <div />
                    : this.state.showLoginPage
                        ? this.renderLoginComponent()
                        : this.props.children
            }
        </PageLoadingIndicatorComponent>
    }

    renderLoginComponent(): JSX.Element {
        if (this.state.isLoading) {
            return <div />
        }
        return <LoginComponent onSubmit={this.onLogin} />
    }
}