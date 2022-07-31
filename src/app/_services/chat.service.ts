import { Injectable } from '@angular/core';
import * as Stomp  from 'stompjs';
import * as SockJS from 'sockjs-client';
import { StorageService } from './storage.service';
import { ChatRequest, MESSAGE, VALID_USER } from '../_payload/ChatRequest';
import { db } from '../_domain/data';
import { MissatgeImpl } from '../_domain/MissatgeImpl';
import { XatImpl } from '../_domain/XatImpl';
import { FormatWidth, getLocaleDateFormat } from '@angular/common';

const CHAT_ENDP = 'http://localhost:8080/api/ws';
// const CHAT_URL = 'http://localhost:8080/api/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  stompClient = Stomp.over(new SockJS(CHAT_ENDP));
  // stompClient = Stomp.over(new WebSocket(CHAT_ENDP))

  constructor(private storageService: StorageService) { }

  connect() {
    this.stompClient.connect({}, this.onConnect, this.onError);
  }

  private onConnect(): void{
    console.log("SockJS: Connected");
    this.stompClient.subscribe("/user/" + this.storageService.getUser().username + "/queue/messages", this.onMessage);
  }

  private onError(err: any): void{
    console.log(err);
  }

  private onMessage(msg: any): void{
    // publicDecrypt(msg);
    const missatge: ChatRequest = JSON.parse(msg);
    this.processMessage(missatge);
  }

  private processMessage(msg: ChatRequest): void{
    switch(msg.getType()){
      case VALID_USER:
        break;
      case 2:
        break;
      case 3:
        break;
      case 4:
        break;
      case MESSAGE:
        this.missatgeText(msg);
        break;
    }
    
  }

  private missatgeText(msg: ChatRequest): void {
    // if(db.xat.get(msg.getUserFrom()) == undefined){
    //   db.xat.add(
    //     new 
    //   )
    // }
    if(db.xat.get(msg.getUserFrom()) == undefined){
      db.xat.add(
        new XatImpl(msg.getUserFrom())
      );
    }
    db.xat.update(msg.getUserFrom(), {
      lastMsg: msg.getContent(),
      lastDate: getLocaleDateFormat('es-ES', FormatWidth.Short)
    })
    db.missatge.add(
      new MissatgeImpl(msg)
    );
    window.location.reload();
  }

  sendMessage(chatRequest: ChatRequest): void{
    this.stompClient.send('/api/chat', {}, JSON.stringify(chatRequest));
  }

  disconnect() {
    if(this.stompClient != null){
      this.stompClient.disconnect(() => {
        console.log("SockJS: Disconnected");
      });
    }
  }
}
