import { Component } from '@angular/core';
import { AuthService } from './_services/auth.service';
import { ChatService } from './_services/chat.service';
import { StorageService } from './_services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isLoggedIn = false;
  username?: string;
  // showAdminBoard = false;
  // showModeratorBoard = false;

  constructor(private storageService: StorageService, 
    private authService: AuthService,
    private chatService: ChatService){

  }

  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();

    if(this.isLoggedIn){
      const user = this.storageService.getUser();
      this.username = user.username;
    }
  }

  logout(): void{
    this.authService.logout(this.username).subscribe({
      next: res => {
        console.log(res);
        this.chatService.disconnect();
        this.storageService.clean();
      },
      error: err => {
        console.log(err);
      },
      complete: () => {
        this.chatService.disconnect();
        this.storageService.clean();
      }
    });
    window.location.reload();
  }
}
