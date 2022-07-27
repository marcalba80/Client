import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  isLoggedIn = false;
  username?: string;
  showAdminBoard = false;
  showModeratorBoard = false;

  constructor(){

  }

  ngOnInit(): void {

  }

  logout(): void{
    
    window.location.reload();
  }
}
