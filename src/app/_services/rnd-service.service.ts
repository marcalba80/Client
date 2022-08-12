import { Injectable } from '@angular/core';
import { db } from '../_domain/Data';
import { ChatRequest, SEND_RND } from '../_payload/ChatRequest';
import { CryptService } from './crypt.service';
import { StorageService } from './storage.service';
import { sendMsg } from './web-socket.service';

@Injectable({
  providedIn: 'root'
})
export class RndService {

  constructor(private cryptService: CryptService,
    private storageService: StorageService) { }

  rcvRnd(msg: ChatRequest): void{
    console.log("RcvRnd: " + msg.content);
    db.xat.get({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}).then(val => {
      if (val?.clauPrivadaO !== undefined){
        
        // let str: string = JSON.stringify(msg.content);
        // console.log("str: " + str);        
        let msgCiph: Uint8Array = this.cryptService.StrToArray(msg.content);
        console.log("Content: " + msgCiph);
        console.log("KeyD: " + JSON.stringify(val.clauPrivadaO))
        this.cryptService.decryptRSA(msgCiph, val.clauPrivadaO).then(res => {
        
          console.log("KeyDecr: " + this.cryptService.decodeUTF8(res));
          db.xat.where({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}).modify({
            randB: this.cryptService.decodeUTF8(res),
          });
                   
        });
      }
    });
  }

  sendRnd(userTo: string, key: JsonWebKey): void{
    
    let rnd = this.cryptService.randomValues();
    console.log("RndGen: " + this.cryptService.decodeUTF8(rnd));
    db.xat.where({'user1': userTo, 'user2': this.storageService.getUser().username}).modify({
      randA: this.cryptService.decodeUTF8(rnd),
    });
    db.xat.get({'user1': userTo, 'user2': this.storageService.getUser().username}).then(val => {
      if(val?.randA !== undefined)
        this.cryptService.encryptRSA(this.cryptService.encodeUTF8(val?.randA), key).then(res => {
          console.log("encr: " + res.toString());
          sendMsg(new ChatRequest(SEND_RND, this.storageService.getUser().username, userTo, res.toString()));
        });
    })
    // console.log("KeyE: " + rnd)
    // console.log("length: " + this.cryptService.encodeUTF8("Hola").length)        
  }
}
