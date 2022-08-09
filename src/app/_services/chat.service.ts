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
  SEND_RND,
  SEED_INI} from '../_payload/ChatRequest';
  

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
      case SEED_INI:
        this.rcvSeedIni(msg);
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
          // let rnd = this.cryptService.randomValues();
          db.xat.add(
            new XatImpl(msg.getUserTo(), msg.getUserFrom(), false, key.publicKey, key.privateKey, undefined, '', '')
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

    this.randomseedService.getRandString(msg.getUserFrom()).then(key => {
      console.log("RKSeed: " + key);
      console.log("RMCiph: " + this.cryptService.encryptAESHMAC(msg.getContent(), key));
      missatge.text = this.cryptService.decryptAESHMAC(msg.getContent(), key);
      db.xat.where({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}).modify({
        lastMsg: missatge.text,
        lastDate: missatge.data
      });
      db.missatge.add(
        missatge
      );
    },
    err => {
      db.xat.get({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}).then(ret =>{
        this.randomseedService.addRand(msg.getUserFrom(), this.cryptService.hashX(
          ret?.userIni, 
          ret?.clauPublicaO, 
          ret?.clauPublicaD, 
          ret?.randA, ret?.randB)).then(keyn => {
            console.log("MCiph: " + this.cryptService.encryptAESHMAC(msg.getContent(), keyn));
            missatge.text = this.cryptService.decryptAESHMAC(msg.getContent(), keyn);
            db.xat.where({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}).modify({
              lastMsg: missatge.text,
              lastDate: missatge.data
            });
            db.missatge.add(
              missatge
            );
          });
      });
    });

    // db.xat.get({user1: msg.getUserFrom(), user2: msg.getUserTo()}).then(item => {
    //   if(item == undefined){
    //     db.xat.add(
    //       new XatImpl(msg.getUserFrom(), msg.getUserTo(), false, undefined, undefined, undefined, missatge.text, missatge.data)
    //     );
    //   }
    // });
    
    // db.xat.update({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}, {
    //   lastMsg: missatge.text,
    //   lastDate: missatge.data
    // });
    // db.xat.where({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}).modify({
    //   lastMsg: missatge.text,
    //   lastDate: missatge.data
    // });
    // db.missatge.add(
    //   missatge
    // );
// Descomentar!!
    // window.location.reload();
  }

  addUser(userTo: string): void{
    this.sendMessage(new ChatRequest(VALID_USER, this.storageService.getUser().username, userTo, ""));
  }

  sendText(text: string, userTo: string): void{
    console.log("sendMsg userTo: " + userTo);

    this.randomseedService.getRandString(userTo).then(key => {
      console.log("KSeed: " + key);
      console.log("MCiph: " + this.cryptService.encryptAESHMAC(text, key));
      this.sendMessage(new ChatRequest(MESSAGE, this.storageService.getUser().username, userTo, 
        this.cryptService.encryptAESHMAC(text, key)));
    },
    err => {
      db.xat.get({'user1': userTo, 'user2': this.storageService.getUser().username}).then(ret =>{
        this.randomseedService.addRand(userTo, this.cryptService.hashX(
          ret?.userIni, 
          ret?.clauPublicaO, 
          ret?.clauPublicaD, 
          ret?.randA, ret?.randB)).then(keyn => {
            console.log("KSeed: " + keyn);
            console.log("MCiph: " + this.cryptService.encryptAESHMAC(text, keyn));
            this.sendMessage(new ChatRequest(MESSAGE, this.storageService.getUser().username, userTo, 
              this.cryptService.encryptAESHMAC(text, keyn)));
          });
      });
    });
    // if(prng == undefined){
    //   db.xat.get({'user1': userTo, 'user2': this.storageService.getUser().username}).then(ret =>{
    //     this.randomseedService.addRand(userTo, this.cryptService.hashX(
    //       ret?.userIni, 
    //       ret?.clauPublicaO, 
    //       ret?.clauPublicaD, 
    //       ret?.randA, ret?.randB));
    //   })
    // }

    // let missatge = new ChatRequest(MESSAGE, this.storageService.getUser().username, userTo, text);
    // let mf = new MissatgeImpl(missatge, missatge.getUserTo(), missatge.getUserFrom());
    // if(userTo != "")
    //   this.sendMessage(missatge);
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

  rcvSeedIni(msg: ChatRequest){
    this.randomseedService.initRand(msg.userFrom);
  }

  iniSeed(user: string): void{
    this.randomseedService.initRand(user);
    sendMsg(new ChatRequest(SEED_INI, this.storageService.getUser().username, user, ""));
  }

  sendMessage(chatRequest: ChatRequest): void{
    sendMsg(chatRequest);
  }
  
}
