import { Component, OnInit } from '@angular/core';
import { ChatService } from '../_services/chat.service';
import { StorageService } from '../_services/storage.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  isLoggedIn = false;

  constructor(private storageService: StorageService, private chatService: ChatService) {
  }

  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();
  }

}
