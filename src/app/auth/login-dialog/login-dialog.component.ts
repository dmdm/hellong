import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {AuthService} from "../auth.service";


@Component({
    selector: 'app-login-dialog',
    templateUrl: './login-dialog.component.html',
    styleUrls: ['./login-dialog.component.scss'],
})
export class LoginDialogComponent implements OnInit {

    model = {
        username: '',
        password: ''
    };

    error: string;

    constructor(private dialogRef: MdDialogRef<LoginDialogComponent>, private auth:AuthService) {
    }

    ngOnInit() {
    }

    submit() {
        this.error = null;
        this.auth.login(this.model.username, this.model.password).subscribe(
            () => {
                this.dialogRef.close(true);
            },
            error => {
                if (error.status == 401 || error.status == 403) {
                    this.error = 'Wrong credentials.';
                }
                else {
                    this.error = `Unexpected network error (${error.status})`;
                }
            }
        );

    }
}
