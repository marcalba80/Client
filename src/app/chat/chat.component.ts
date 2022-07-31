import { localizedString } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { db, Xat } from '../_domain/data';
import { ChatService } from '../_services/chat.service';
import { StorageService } from '../_services/storage.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  isLoggedIn = false;
  addUsername?: string;
  msg?: string;
  chats?: Xat[];

  constructor(private storageService: StorageService, private chatService: ChatService) {
  }

  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();
    db.xat.toArray().then(list => {
      this.chats = list;
    });
  }

  addUser(): void {

  }

  sendMsg(): void {

  }
}
