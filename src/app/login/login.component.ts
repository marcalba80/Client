import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { db } from '../_domain/Data';
import { AuthService } from '../_services/auth.service';
import { ChatService } from '../_services/chat.service';
import { StorageService } from '../_services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';

  constructor(private authService: AuthService, 
    private storageService: StorageService,
    private chatService: ChatService,
    private router: Router){}

  ngOnInit(): void {
    if(this.storageService.isLoggedIn()){
      this.isLoggedIn = true;
      
    }
  }

  onSubmit(): void {
    const { username, password } = this.form;

    this.authService.login(username, password).subscribe({
      next: data => {
        this.storageService.saveUser(data);

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.reloadPage();
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    });
  }

  reloadPage(): void {
    this.router.navigate(['/chat']).then(() => {
      db.xat.toArray().then(list => {
        list.forEach(item => {
          this.chatService.iniSeed(item.user1);
        })
      });
      window.location.reload();
    });
  }
}
