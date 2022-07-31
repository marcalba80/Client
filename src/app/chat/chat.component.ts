import { Component, OnInit } from '@angular/core';
import { db, Missatge, Xat } from '../_domain/Data';
import { ChatService } from '../_services/chat.service';
import { StorageService } from '../_services/storage.service';

export interface Chats{
  c: Xat;
  selected: boolean;
}

export interface Msgs{
  m: Missatge;
  isIncoming: boolean;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  isLoggedIn = false;
  addUsername?: string;
  msg?: string;
  // chats: {c: Xat, selected: boolean}[];
  // msgs: {m: Missatge, isIncoming: boolean}[];
  chats: Chats[];
  msgs: Msgs[];

  constructor(private storageService: StorageService, private chatService: ChatService) {
    this.chats = [];
    this.msgs = [];
  }

  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();
    // db.resetDatabase();
    // db.xat.add(new XatImpl('Sample', 'Hola', 'Avui'));
    // db.missatge.add(new MissatgeImpl(
    //   new ChatRequest(5, 'user', 'Sample', 'Hola Sample'), 'Sample'
    // ));
    // db.missatge.add(new MissatgeImpl(
    //   new ChatRequest(5, 'Sample', 'user', 'Hola User'), 'Sample'
    // ));
    this.setChats();
  }

  private setChats(){
    db.xat.toArray().then(list => {
      list.forEach(chat => {
        this.chats.push({
          c: chat,
          selected: false
        });
      })
    });
  }

  private setMsgs(chat: Xat){
    db.missatge.where('idXat').equals(chat.username).sortBy('[data+hora]').then(list => {
      list.forEach(msg => {
        this.msgs.push({
          m: msg,
          isIncoming: this.storageService.getUser().username != msg.usuariOrigen
        })
      })
    });
  }

  addUser(): void {
    console.log("AddUser " + this.addUsername)
  }

  sendMsg(): void {
    console.log("sendMsg: "+ this.msg)
  }

  selMsg(chat: Chats): void{
    console.log("selMsg Chat: " + chat.c.username)
    this.chats.forEach(chat => {
      chat.selected = false;
    });
    chat.selected = true;
    this.setMsgs(chat.c);
  }
}
