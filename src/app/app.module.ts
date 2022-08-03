import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

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

registerLocaleData(es);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ChatComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    httpInterceptorProviders,
    ChatService,
    StorageService,
    {provide: LOCALE_ID, useValue: 'es-*'},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
