import { Injectable } from '@angular/core';
import * as Stomp  from 'stompjs';
import * as SockJS from 'sockjs-client';
import { StorageService } from './storage.service';

const CHAT_ENDP = 'http://localhost:8080/api/ws';
// const CHAT_URL = 'http://localhost:8080/api/chat';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  sockjs = new SockJS(CHAT_ENDP);
  stompClient = Stomp.over(this.sockjs);
  

  constructor(private storageService: StorageService) { }

  connect() {
    this.stompClient.connect({}, this.onConnect, this.onError);
  }

  private onConnect(): void{
    this.stompClient.subscribe("/user/" + this.storageService.getUser().username + "/queue/messages", this.onMessage);
  }

  private onError(err: any): void{

  }

  private onMessage(msg: any): void{

  }

  disconnect() {
    if(this.stompClient != null){
      this.stompClient.disconnect(() => {
        console.log("SockJS: Disconnected");
      });
    }
  }
}
