import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { db } from '../_domain/Data';
import { MissatgeImpl } from '../_domain/MissatgeImpl';
import { XatImpl } from '../_domain/XatImpl';
import { CryptService } from './crypt.service';
import { RandomSeedService } from './random-seed-service.service';
import { RndService } from './rnd-service.service';
import { RSAService } from './rsaservice.service';
import { StorageService } from './storage.service';
import { sendMsg } from './web-socket.service';
import { ChatRequest, 
  MESSAGE, 
  VALID_USER, 
  ERROR, 
  COMPLETED, 
  SEND_RSA,
  SEND_RND} from '../_payload/ChatRequest';
  

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  errorSubject: Subject<ChatRequest> = new Subject(); 
  // keySubject: Subject<AuthRSA> = new Subject();

  constructor(private rsaService: RSAService,
    private rndService: RndService,
    private cryptService: CryptService,
    private storageService: StorageService,
    private randomseedService : RandomSeedService) { }

  processMessage(msg: ChatRequest): void{
    console.log("Rcv: " + msg.type);
    switch(msg.getType()){
      case VALID_USER:
        this.addXat(msg);
        break;
      case SEND_RSA:
        this.rsaService.rcvRSAKey(msg);
        break;
      case SEND_RND:
        this.rndService.rcvRnd(msg);
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
    db.xat.get({user1: msg.getUserTo(), user2: msg.getUserFrom()}).then(item => {
      if (item == undefined){
        this.cryptService.generateRSAKey().then(key =>{
          // key = res;
          console.log("KeyGenP: " + JSON.stringify(key.publicKey));
          console.log("KeyGenPr: " + JSON.stringify(key.privateKey));
          let rnd = this.cryptService.randomValues();
          db.xat.add(
            new XatImpl(msg.getUserTo(), msg.getUserFrom(), false, key.publicKey, key.privateKey, undefined, this.cryptService.decodeUTF8(rnd), '', '')
          );
          this.sendMessage(new ChatRequest(SEND_RSA, msg.getUserFrom(), msg.getUserTo(), JSON.stringify(key.publicKey)));
        });
      }
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
          new XatImpl(msg.getUserFrom(), msg.getUserTo(), false, undefined, undefined, undefined, missatge.text, missatge.data)
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
// Descomentar!!
    // window.location.reload();
  }

  addUser(userTo: string): void{
    this.sendMessage(new ChatRequest(VALID_USER, this.storageService.getUser().username, userTo, ""));
  }

  sendText(text: string, userTo: string): void{
    console.log("sendMsg userTo: " + userTo);

    if(this.randomseedService.getRand(userTo) == undefined){
      db.xat.get({'user1': userTo, 'user2': this.storageService.getUser().username}).then(ret =>{
        this.randomseedService.addRand(userTo, this.cryptService.hashX(
          ret?.userIni, 
          ret?.clauPublicaO, 
          ret?.clauPublicaD, 
          ret?.randA, ret?.randB));
      })
    }

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
    sendMsg(chatRequest);
  }
  
}
