import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule, MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { httpInterceptorProviders } from './_helpers/http.interceptor';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChatComponent } from './chat/chat.component';
import { ProfileComponent } from './profile/profile.component';

import es from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { ChatService } from './_services/chat.service';
import { StorageService } from './_services/storage.service';
import { AuthService } from './_services/auth.service';
import { CryptService } from './_services/crypt.service';
import { DialogComponent } from './dialog/dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { WebSocketService } from './_services/web-socket.service';
import { RandomSeedService } from './_services/random-seed-service.service';

registerLocaleData(es);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ChatComponent,
    ProfileComponent,
    DialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatDialogModule,
    MatButtonModule
  ],
  providers: [
    httpInterceptorProviders,
    ChatService,
    StorageService,
    AuthService,
    CryptService,
    WebSocketService,
    RandomSeedService,
    {provide: LOCALE_ID, useValue: 'es-*'},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
