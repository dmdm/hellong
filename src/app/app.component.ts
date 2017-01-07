import {Component, ChangeDetectionStrategy} from '@angular/core';
import {Observable} from "rxjs";
import {Title} from "@angular/platform-browser";
import {Router} from "@angular/router";
import {Store} from "@ngrx/store";
import * as fromRoot from './core/store.reducers';
import {RcService} from "./core/rc.service";
import {AuthService} from "./auth/auth.service";
import {MdDialog, MdDialogRef} from '@angular/material';
import {LoginDialogComponent} from "./auth/login-dialog/login-dialog.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    //changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

    username$: Observable<string>;
    jwtTime$: Observable<Date|null>;
    isLoggedIn$: Observable<boolean>;
    isDarkTheme: boolean = true;
    appTitle: string;

    constructor(private rc: RcService,
                private store: Store<fromRoot.State>,
                private auth: AuthService,
                private titleService: Title,
                private router: Router,
                private dialog: MdDialog) {
    }

    ngOnInit() {
        this.titleService.setTitle(this.rc.appTitle);
        this.appTitle = this.rc.appTitle;
        this.username$ = this.store.select(fromRoot.getUsername).map(username => username ? username : 'Nobody');
        this.jwtTime$ = this.store.select(fromRoot.getJwtTime).map(time => time ? time : null);
        this.isLoggedIn$ = this.auth.isLoggedIn;
    }

    refreshJwt() {
        this.auth.refreshJwt().subscribe(
            resp => console.debug('JWT refreshed'),
            error => console.error('Failed to refresh JWT:', error)
        );
    }

    openLoginDialog() {
        let dialogRef = this.dialog.open(LoginDialogComponent);
        dialogRef.afterClosed().subscribe(result => {
            console.debug('Login dialog result:', result);
        });
    }

    logout() {
        this.auth.logout();
        this.router.navigate(['/']);
    }

    toggleDarkTheme() {
        this.isDarkTheme = !this.isDarkTheme;
    }
}
