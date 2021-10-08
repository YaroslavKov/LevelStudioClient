import {Component, EventEmitter, ViewChild} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {AbstractControl, FormControl, Validators} from '@angular/forms';
import {SignUpFormData} from "../interfaces/SignUpFormData";

@Component({
    selector: 'app-sign-up-form',
    templateUrl: './sign-up-form.component.html',
    styleUrls: ['./sign-up-form.component.scss']
})
export class SignUpFormComponent {
    @ViewChild('password') password: any;
    submitEmitter = new EventEmitter();
    lastName: string | undefined;
    isConfirmation: boolean = false;

    //region Controls
    emailControl = new FormControl("", [
        Validators.required,
        Validators.email
    ]);
    passwordControl = new FormControl("", [
        Validators.required,
        Validators.minLength(6)
    ]);
    passwordConfirmControl = new FormControl("", [
        Validators.required,
        (control: AbstractControl) => {
            return control.value === this.password?.nativeElement?.value ? null : {equalityDisrupted: {value: control.value}};
        }
    ]);
    firstNameControl = new FormControl("", [
        Validators.required
    ]);
    formControls = [
        this.emailControl,
        this.passwordControl,
        this.passwordConfirmControl,
        this.firstNameControl
    ]

    //endregion

    constructor(
        public dialogRef: MatDialogRef<SignUpFormComponent>) {
    }

    public disableSpinner() {
        this.isConfirmation = false;
    }

    onClose() {
        this.dialogRef.close();
    }

    onSecondNameChanged(action: any) {
        this.lastName = action.target.value;
    }

    onConfirm() {
        this.formControls.forEach(control => control.markAsTouched())
        if (!this.formControls.some(control => control.invalid)) {
            const emitData: SignUpFormData = {
                email: this.emailControl.value,
                password: this.passwordControl.value,
                firstName: this.firstNameControl.value,
                lastName: this.lastName
            };
            this.submitEmitter.emit(emitData);
            this.isConfirmation = true;
        }
    }
}
