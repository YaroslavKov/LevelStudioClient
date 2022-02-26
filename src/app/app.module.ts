//Angular
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';
import {FlexLayoutModule} from '@angular/flex-layout';
import {HttpClientModule} from '@angular/common/http';
import {DragDropModule} from '@angular/cdk/drag-drop';

//External libraries
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {AudioContextModule} from 'angular-audio-context';

//Project components
import {StartPageComponent} from './start-page/start-page.component';
import {LogInFormComponent} from './log-in-form/log-in-form.component';
import {SignUpFormComponent} from './sign-up-form/sign-up-form.component';
import {MenuComponent} from './menu/menu.component';
import {AppRoutingModule} from './app-routing.module';

//Services
import {UserService} from './services/user-service'
import {LoggingService} from './services/logging-service'
import {MessageService} from './services/message-service'
import {MessageReceiver, MessageSender} from './interfaces/Message';

//Components
import {ErrorDialogComponent} from './error-dialog/error-dialog.component'
import {HttpClient} from "./services/Clients/HttpClient";
import {ProjectPageComponent} from './project-page/project-page.component';
import {NotFoundPageComponent} from './not-found-page/not-found-page.component';

import {MaterialComponentsModule} from './material-components-module'

const angularModules = [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    HttpClientModule,
    DragDropModule
]

const externalLibrariesModules = [
    FontAwesomeModule,
    AudioContextModule.forRoot('balanced')
]


const services = [
    UserService,
    LoggingService,
    MessageService,
    MessageSender,
    MessageReceiver,
    HttpClient
];

@NgModule({
    declarations: [
        MenuComponent,
        StartPageComponent,
        LogInFormComponent,
        SignUpFormComponent,
        ErrorDialogComponent,
        ProjectPageComponent,
        NotFoundPageComponent
    ],
    imports: [
        ...angularModules,
        ...externalLibrariesModules,
        MaterialComponentsModule,
        AppRoutingModule
    ],
    providers: [
        services
    ],
    bootstrap: [
        MenuComponent
    ]
})
export class AppModule {
}
