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
    // db.delete();
    let selected = localStorage.getItem('selected')?.toString();
    if(this.storageService.isLoggedIn()){
      this.chatService.connect();
      this.setChats(selected);
    }
    // localStorage.clear();
    console.log("Init sel: " + selected);
    // if(selected != null)
    //   this.restoreSel(selected);
  }

  private setChats(sel?: string){
      // db.xat.toArray().then(list => {
      db.xat.where({user2: this.storageService.getUser().username}).toArray(list => {
      list.forEach(chat => {
        console.log("setChat" + chat.user2);
        let xat = {c: chat, selected: false};
        this.chats.push(xat);
        if(chat.user1 == sel) this.selMsg(xat);
      })
    });
  }

  private setMsgs(chat: Xat){
    db.missatge.where({idXat1: chat.user1, idXat2: chat.user2})/*.equals({idXat1: chat.user1, idXat2: chat.user2})*/.sortBy('[data+hora]').then(list => {
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
    if(this.addUsername !== undefined)
      this.chatService.addUser(this.addUsername);
    // window.location.reload();
  }

  sendMsg(): void {
    console.log("sendMsg: "+ this.msg)
    if(this.msg !== undefined)
      this.chatService.sendText(this.msg, this.chatSelectedUser());
    window.location.reload();
  }

  selMsg(xat: Chats): void{
    console.log("selMsg Chat: " + xat.c.user1)
    this.chats.forEach(chat => {
      if(chat.c.user1 == xat.c.user1) chat.selected = true;
      else chat.selected = false;
    });
    // this.chats.forEach(chat => {
    //   console.log("selected: " + chat.selected);
    // });
    // chat.selected = true;
    
    this.msgs = [];
    // if(!xat.selected)
      this.setMsgs(xat.c);
    localStorage.setItem('selected', xat.c.user1);
  }

  // private restoreSel(userSel: string): void{
    
  //   this.chats.forEach(chat => {
  //     console.log("restUser " + chat.c.username);
  //     // if(chat.c.username == userSel) ;
  //   });
  // }

  chatSelectedUser(): string{
    let ret = "";
    this.chats.forEach(chat => {
      if(chat.selected){
        console.log("selected chat: " + chat.c.user1);
        ret = chat.c.user1;
      } 
    })
    return ret;
  }
}
