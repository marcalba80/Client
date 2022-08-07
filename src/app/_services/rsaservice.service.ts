import { Injectable } from '@angular/core';
import { db } from '../_domain/Data';
import { XatImpl } from '../_domain/XatImpl';
import { CryptService } from './crypt.service';
import { sendMsg, WebSocketService } from './web-socket.service';
import { Subject } from 'rxjs';

import { ChatRequest, 
  MESSAGE, 
  VALID_USER, 
  ERROR, 
  COMPLETED, 
  SEND_RSA,
  SEND_RND} from '../_payload/ChatRequest';

export const keySubject: Subject<XatImpl> = new Subject();

@Injectable({
  providedIn: 'root'
})
export class RSAService {

  constructor(private cryptService: CryptService) { }

  rcvRSAKey(msg: ChatRequest): void{
    let pKey: JsonWebKey = JSON.parse(msg.content);
    console.log("KeyRcv: " + JSON.stringify(pKey));
    db.xat.get({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}).then(val => {
      if(val == undefined){
        this.cryptService.generateRSAKey().then(key => {
          console.log("xatUndefined");
          console.log("KeyGenP: " + JSON.stringify(key.publicKey));
          console.log("KeyGenPr: " + JSON.stringify(key.privateKey));
          let rnd = this.cryptService.randomValues();
          db.xat.add(
            new XatImpl(msg.getUserFrom(), msg.getUserTo(), false, key.publicKey, key.privateKey, undefined, this.cryptService.decodeUTF8(rnd), '', '')
          );          
          sendMsg(new ChatRequest(SEND_RSA, msg.getUserTo(), msg.getUserFrom(), JSON.stringify(key.publicKey)));
          // this.keySubject.next(new XatImpl(msg.getUserFrom(), msg.getUserTo(), key.publicKey, key.privateKey, pKey, '', ''));
          keySubject.next(new XatImpl(msg.getUserFrom(), msg.getUserTo(), false, key.publicKey, key.privateKey, pKey, '', ''));
        });    
      }else{
        console.log("xatDefined");
        // db.xat.where({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}).modify({
        //   clauPublicaD: pKey,
        // });
        keySubject.next(new XatImpl(msg.getUserFrom(), msg.getUserTo(), true, val.clauPublicaO, val.clauPrivadaO, pKey, '', ''));
      }   
    });
    
    // this.keySubject.next(new XatImpl(msg.getUserFrom(), msg.getUserTo(), undefined, undefined, pKey, '', ''));
  }
}
