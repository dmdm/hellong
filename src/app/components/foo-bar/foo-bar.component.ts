import {Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'app-foo-bar',
    templateUrl: './foo-bar.component.html',
    styleUrls: ['./foo-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooBarComponent implements OnInit {

    @Input() sidenav: any;
    @Input() appTitle: string;
    @Input() username: string;
    @Input() jwtTime: string;
    @Input() isLoggedIn: boolean;
    @Input() isDarkTheme: boolean;

    @Output() onRefreshJwt = new EventEmitter();
    @Output() onLogin = new EventEmitter();
    @Output() onLogout = new EventEmitter();
    @Output() onToggleDarkTheme = new EventEmitter();

    constructor() {
    }

    ngOnInit() {
    }

    refreshJwt() {
        this.onRefreshJwt.emit(true);
    }

    login() {
        this.onLogin.emit(true);
    }

    logout() {
        this.onLogout.emit(true);
    }

    toggleDarkTheme() {
        this.onToggleDarkTheme.emit(true);
    }
}
