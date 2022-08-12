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
    
  }

  private addXat(msg: ChatRequest): void{
    console.log("AddXat: " + msg.getUserTo())
    
    db.xat.get({user1: msg.getUserTo(), user2: msg.getUserFrom()}).then(item => {
      if (item == undefined){
        this.cryptService.generateRSAKey().then(key =>{
          
          console.log("KeyGenP: " + JSON.stringify(key.publicKey));
          console.log("KeyGenPr: " + JSON.stringify(key.privateKey));
          
          db.xat.add(
            new XatImpl(msg.getUserTo(), msg.getUserFrom(), false, key.publicKey, key.privateKey, undefined, '', '')
          );
          this.sendMessage(new ChatRequest(SEND_RSA, msg.getUserFrom(), msg.getUserTo(), JSON.stringify(key.publicKey)));
        });
      }
    });    
  }

  private missatgeText(msg: ChatRequest): void {        
    let missatge = new MissatgeImpl(msg, msg.getUserFrom(), msg.getUserTo());

    this.randomseedService.getRandString(msg.getUserFrom()).then(key => {
      console.log("RKSeed: " + key);
      console.log("RKSeedG: " + key);
      console.log("RJsonSeedG: " + JSON.stringify(this.randomseedService.rands));
      // console.log("RMCiph: " + this.cryptService.encryptAESHMAC(msg.getContent(), key));
      
      missatge.text = this.cryptService.decryptAESHMAC(msg.getContent(), key);
      db.xat.where({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}).modify({
        lastMsg: missatge.text,
        lastDate: missatge.data
      });
      db.missatge.add(
        missatge
      );
      window.location.reload();
    },
    err => {
      console.log("GetString Error: " + err);
        this.randomseedService.addRand(msg.getUserFrom()).then(keyn => {
            console.log("KSeed: " + keyn);            
            console.log("JsonSeed: " + JSON.stringify(this.randomseedService.rands));
            // console.log("MCiph: " + this.cryptService.encryptAESHMAC(msg.getContent(), keyn));
            
            missatge.text = this.cryptService.decryptAESHMAC(msg.getContent(), keyn);
            db.xat.where({'user1': msg.getUserFrom(), 'user2': msg.getUserTo()}).modify({
              lastMsg: missatge.text,
              lastDate: missatge.data
            });
            db.missatge.add(
              missatge
            );
            window.location.reload();
          });
    });    
  }

  addUser(userTo: string): void{
    this.sendMessage(new ChatRequest(VALID_USER, this.storageService.getUser().username, userTo, ""));
  }

  sendText(text: string, userTo: string): void{
    console.log("sendMsg userTo: " + userTo);    
    this.randomseedService.getRandString(userTo).then(key => {
      console.log("KSeedG: " + key);
      console.log("JsonSeedG: " + JSON.stringify(this.randomseedService.rands));
      // console.log("MCiphG: " + this.cryptService.encryptAESHMAC(text, key));
      
      this.sendMessage(new ChatRequest(MESSAGE, this.storageService.getUser().username, userTo, 
        this.cryptService.encryptAESHMAC(text, key)));
    },
    err => {
      console.log("GetString Error: " + err);        
      this.randomseedService.addRand(userTo).then(keyn => {
        console.log("KSeed: " + keyn);
        console.log("JsonSeed: " + JSON.stringify(this.randomseedService.rands));
        // console.log("MCiph: " + this.cryptService.encryptAESHMAC(text, keyn));
        
        this.sendMessage(new ChatRequest(MESSAGE, this.storageService.getUser().username, userTo, 
          this.cryptService.encryptAESHMAC(text, keyn)));
      });        
    });    
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
