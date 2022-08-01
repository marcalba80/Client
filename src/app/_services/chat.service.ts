import { Injectable } from '@angular/core';
import * as Stomp  from 'stompjs';
import * as SockJS from 'sockjs-client';
import { StorageService } from './storage.service';
import { ChatRequest, MESSAGE, VALID_USER } from '../_payload/ChatRequest';
import { db } from '../_domain/Data';
import { MissatgeImpl } from '../_domain/MissatgeImpl';
import { XatImpl } from '../_domain/XatImpl';

const CHAT_ENDP = 'http://localhost:8080/api/ws';
// const CHAT_URL = 'http://localhost:8080/api/chat';

export const stompClient = Stomp.over(new SockJS(CHAT_ENDP));

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // stompClient = Stomp.over(new SockJS(CHAT_ENDP));
  // stompClient = Stomp.over(new WebSocket(CHAT_ENDP))

  constructor(private storageService: StorageService) { }

  connect() {
    stompClient.connect({}, this.onConnect, this.onError);
  }

  private onConnect = () => {
    console.log("SockJS: Connected " + this.storageService.getUser().username);
    stompClient.subscribe("/user/" + this.storageService.getUser().username + "/queue/messages", this.onMessage);
  }

  private onError = (err: any) => {
    console.log(err);
  }

  private onMessage = (msg: any) => {
    // publicDecrypt(msg);
    // console.log("Missatge: " + JSON.parse(msg.body));
    let aux: ChatRequest = JSON.parse(msg.body);
    let missatge: ChatRequest = new ChatRequest(aux.type, aux.userFrom, aux.userTo, aux.content);
    // console.log("Object: "+ missatge.type)
    // const missatge: ChatRequest = msg.body;
    this.processMessage(missatge);
  }

  private processMessage(msg: ChatRequest): void{
    switch(msg.getType()){
      case VALID_USER:
        this.addXat(msg);
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

  private addXat(msg: ChatRequest): void{
    console.log("AddXat")
    db.xat.add(
      new XatImpl(msg.getUserTo(), '', '')
    );
  }

  private missatgeText(msg: ChatRequest): void {
    // if(db.xat.get(msg.getUserFrom()) == undefined){
    //   db.xat.add(
    //     new 
    //   )
    // }
    if(db.xat.get(msg.getUserFrom()) == undefined){
      db.xat.add(
        new XatImpl(msg.getUserFrom(), '', '')
      );
    }
    let missatge = new MissatgeImpl(msg, msg.getUserFrom());
    db.xat.update(msg.getUserFrom(), {
      lastMsg: missatge.text,
      lastDate: missatge.data
    })
    db.missatge.add(
      missatge
    );
    window.location.reload();
  }

  addUser(userTo: string): void{
    this.sendMessage(new ChatRequest(VALID_USER, this.storageService.getUser().username, userTo, ""));
  }

  sendMessage(chatRequest: ChatRequest): void{
    stompClient.send('/api/chat', {}, JSON.stringify(chatRequest));
  }

  disconnect() {
    if(stompClient != null){
      stompClient.disconnect(() => {
        console.log("SockJS: Disconnected");
      });
    }
  }
}
