import { Injectable } from '@angular/core';
import * as Stomp  from 'stompjs';
import * as SockJS from 'sockjs-client';
import { StorageService } from './storage.service';
import { db } from '../_domain/Data';
import { MissatgeImpl } from '../_domain/MissatgeImpl';
import { XatImpl } from '../_domain/XatImpl';
import { Subject } from 'rxjs';
import { CryptService } from './crypt.service';
import { AuthRSA } from '../_helpers/AuthRSA';

import { ChatRequest, 
  MESSAGE, 
  VALID_USER, 
  ERROR, 
  COMPLETED, 
  SEND_RSA,
  SEND_RSA_ACK} from '../_payload/ChatRequest';

const CHAT_ENDP = 'http://localhost:8080/api/ws';
// const CHAT_URL = 'http://localhost:8080/api/chat';

export const stompClient = Stomp.over(new SockJS(CHAT_ENDP));

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // stompClient = Stomp.over(new SockJS(CHAT_ENDP));
  // stompClient = Stomp.over(new WebSocket(CHAT_ENDP))
  errorSubject: Subject<ChatRequest> = new Subject(); 
  keySubject: Subject<AuthRSA> = new Subject();
  
  // obser: Observable<any> = new Observable.;

  constructor(private storageService: StorageService, 
    private cryptService: CryptService) { 
    // this.errorSubject.complete();
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
    // publicDecrypt(msg);
    // console.log("Missatge: " + JSON.parse(msg.body));
    let aux: ChatRequest = JSON.parse(msg.body);
    let missatge: ChatRequest = new ChatRequest(aux.type, aux.userFrom, aux.userTo, aux.content);
    // console.log("Object: "+ missatge.type)
    // const missatge: ChatRequest = msg.body;
    this.processMessage(missatge);
  }

  private processMessage(msg: ChatRequest): void{
    console.log("Rcv: " + msg.type);
    switch(msg.getType()){
      case VALID_USER:
        this.addXat(msg);
        break;
      case SEND_RSA:
        this.rcvRSAKey(msg);
        break;
      case 4:
        break;
      case MESSAGE:
        this.missatgeText(msg);
        break;
      case ERROR:
        this.errorSubject.next(msg);
        break;
      case COMPLETED:
        this.errorSubject.complete();
        break;
    }
    // window.location.reload();
  }

  private addXat(msg: ChatRequest): void{
    console.log("AddXat: " + msg.getUserTo())
    // let key: JsonWebKeyPair; 
    this.cryptService.generateRSAKey().then(key =>{
      // key = res;
      console.log("KeyGen: " + key);
      db.xat.add(
        new XatImpl(msg.getUserTo(), msg.getUserFrom(), key.publicKey, key.privateKey, undefined, '', '')
      );
      this.sendMessage(new ChatRequest(SEND_RSA, msg.getUserFrom(), msg.getUserTo(), key.publicKey));
    });
    // db.xat.add(
      // new XatImpl(msg.getUserTo(), msg.getUserFrom(), key.publicKey, key.privateKey, undefined, '', '')
    // );
    /*.then(st => {

    }, err => {
      console.log("AddXatErr: " + err);
    });*/
    // window.location.reload();
  }

  private rcvRSAKey(msg: ChatRequest): void{
    let pKey: JsonWebKey = msg.content;
    console.log("KeyRcv: " + pKey);
    db.xat.get({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}).then(val => {
      if(val == undefined){
        this.cryptService.generateRSAKey().then(key => {
          console.log("xatUndefined");
        
          db.xat.add(
            new XatImpl(msg.getUserFrom(), msg.getUserTo(), key.publicKey, key.privateKey, undefined, '', '')
          );          
          this.sendMessage(new ChatRequest(SEND_RSA, msg.getUserTo(), msg.getUserFrom(), key.publicKey));
          // this.keySubject.next(new XatImpl(msg.getUserFrom(), msg.getUserTo(), key.publicKey, key.privateKey, pKey, '', ''));
          this.keySubject.next({
            xat: new XatImpl(msg.getUserFrom(), msg.getUserTo(), key.publicKey, key.privateKey, pKey, '', ''),
            userR: false});
        });    
      }else{
        console.log("xatDefined");
        // db.xat.where({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}).modify({
        //   clauPublicaD: pKey,
        // });
        this.keySubject.next({
          xat: new XatImpl(msg.getUserFrom(), msg.getUserTo(), val.clauPublicaO, val.clauPrivadaO, pKey, '', ''),
          userR: true});
      }   
    });
    
    // this.keySubject.next(new XatImpl(msg.getUserFrom(), msg.getUserTo(), undefined, undefined, pKey, '', ''));
  }

  private missatgeText(msg: ChatRequest): void {
    // if(db.xat.get(msg.getUserFrom()) == undefined){
    //   db.xat.add(
    //     new 
    //   )
    // }
    // if(db.xat.get(msg.getUserFrom()).then() == undefined){
    //   db.xat.add(
    //     new XatImpl(msg.getUserFrom(), '', '')
    //   );
    // }
    let missatge = new MissatgeImpl(msg, msg.getUserFrom(), msg.getUserTo());
    db.xat.get({user1: msg.getUserFrom(), user2: msg.getUserTo()}).then(item => {
      if(item == undefined){
        db.xat.add(
          new XatImpl(msg.getUserFrom(), msg.getUserTo(), undefined, undefined, undefined, missatge.text, missatge.data)
        );
      }
    });
    
    // db.xat.update({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}, {
    //   lastMsg: missatge.text,
    //   lastDate: missatge.data
    // });
    db.xat.where({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}).modify({
      lastMsg: missatge.text,
      lastDate: missatge.data
    });
    db.missatge.add(
      missatge
    );
    window.location.reload();
  }

  addUser(userTo: string): void{
    this.sendMessage(new ChatRequest(VALID_USER, this.storageService.getUser().username, userTo, ""));
  }

  sendText(text: string, userTo: string): void{
    console.log("sendMsg userTo: " + userTo);
    let missatge = new ChatRequest(MESSAGE, this.storageService.getUser().username, userTo, text);
    // let mf = new MissatgeImpl(missatge, missatge.getUserTo(), missatge.getUserFrom());
    if(userTo != "")
      this.sendMessage(missatge);
      // db.missatge.add(
      //   mf
      // );
      // db.xat.where({'user1': missatge.getUserTo(), 'user2': missatge.getUserFrom()}).modify({
      //     lastMsg: mf.text,
      //     lastDate: mf.data
      // });
      // db.xat.update({'user1': missatge.getUserTo(), 'user2': missatge.getUserFrom()}, {
      //   lastMsg: mf.text,
      //   lastDate: mf.data
      // })
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
