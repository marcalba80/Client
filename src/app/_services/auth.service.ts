import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginRequest } from '../_payload/LoginRequest';
import { LogoutRequest } from '../_payload/LogoutRequest';
import { SignupRequest } from '../_payload/SignupRequest';

const AUTH_API = 'http://localhost:8080/api/auth/';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(username: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signin',
      new LoginRequest(username, password),
      httpOptions
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signup',
      new SignupRequest(username, email, password),
      httpOptions
    );
  }

  logout(username?: string): Observable<any> {
    return this.http.post(AUTH_API + 'signout', new LogoutRequest(username), httpOptions);
  }
}
