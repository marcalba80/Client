import { Injectable } from '@angular/core';
import * as Stomp  from 'stompjs';
import * as SockJS from 'sockjs-client';
import { StorageService } from './storage.service';
import { ChatRequest } from '../_payload/ChatRequest';
import { ChatService } from './chat.service';

const CHAT_ENDP = 'http://localhost:8080/api/ws';

export const stompClient = Stomp.over(new SockJS(CHAT_ENDP));

export const sendMsg = (chatRequest: ChatRequest) => {
  stompClient.send('/api/chat', {}, JSON.stringify(chatRequest));
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  constructor(private storageService: StorageService, 
    private chatService: ChatService) { 

  }

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
    let aux: ChatRequest = JSON.parse(msg.body);
    let missatge: ChatRequest = new ChatRequest(aux.type, aux.userFrom, aux.userTo, aux.content);
    this.chatService.processMessage(missatge);
  }

  disconnect() {
    if(stompClient != null){
      stompClient.disconnect(() => {
        console.log("SockJS: Disconnected");
      });
    }
  }
}
