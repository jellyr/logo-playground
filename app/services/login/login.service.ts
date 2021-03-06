import { IAuthService } from "app/services/login/auth.service";
import { NotLoggenInStatus, ICurrentUserService } from "app/services/login/current-user.service";
import { IEventsTrackingService, EventAction } from "app/services/infrastructure/events-tracking.service";

export abstract class ILoginService {
  abstract tryLoginUserAutomatically(): Promise<void>;
  abstract signOut(): Promise<void>;
  abstract initLoginUI(): Promise<void>;
  abstract renderLoginUI(): JSX.Element[];
}

export class LoginService implements ILoginService {
  private currentLoginStatus = NotLoggenInStatus;

  constructor(
    private authService: IAuthService,
    private currentUserService: ICurrentUserService,
    private eventTracker: IEventsTrackingService
  ) {
    this.authService.loginStatusObservable.subscribe(status => {
      this.currentLoginStatus = status;
      this.currentUserService.setLoginStatus(status);
    });
  }

  async tryLoginUserAutomatically(): Promise<void> {
    await this.authService.init();
  }

  async initLoginUI(): Promise<void> {
    return this.authService.initLoginUI();
  }

  renderLoginUI(): JSX.Element[] {
    return [this.authService.renderLoginUI()];
  }

  async signOut(): Promise<void> {
    this.eventTracker.sendEvent(EventAction.userLogin, this.currentLoginStatus.userInfo.attributes.email);

    return this.authService.signOut();
  }
}
