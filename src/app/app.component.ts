import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './_services/auth.service';
import { ChatService } from './_services/chat.service';
import { StorageService } from './_services/storage.service';
import { WebSocketService } from './_services/web-socket.service';

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
    private websocketService: WebSocketService,
    private router: Router){

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
        this.websocketService.disconnect();
        this.storageService.clean();
        localStorage.removeItem('selected');
        // this.router.navigate(['/login']).then(() => {
        window.location.reload();
        // });
      },
      error: err => {
        console.log(err);
      }
    });
    // this.storageService.clean();
    // this.authService.logout();
    // this.chatService.disconnect();
    // this.storageService.clean();
    // localStorage.removeItem('selected');
    // this.router.navigate(['/login']).then(() => {
      // window.location.reload();
    // });
  }
}
