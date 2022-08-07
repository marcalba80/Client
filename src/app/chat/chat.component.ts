import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { db, Missatge, Xat } from '../_domain/Data';
import { MissatgeImpl } from '../_domain/MissatgeImpl';
import { ChatRequest, MESSAGE } from '../_payload/ChatRequest';
import { ChatService } from '../_services/chat.service';
import { CryptService } from '../_services/crypt.service';
import { RandomSeedService } from '../_services/random-seed-service.service';
import { RndService } from '../_services/rnd-service.service';
import { keySubject } from '../_services/rsaservice.service';
import { StorageService } from '../_services/storage.service';
import { WebSocketService } from '../_services/web-socket.service';

export interface Chats{
  c: Xat;
  selected: boolean;
}

export interface Msgs{
  m: Missatge;
  isIncoming: boolean;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  addUsername?: string;
  msg?: string;
  // chats: {c: Xat, selected: boolean}[];
  // msgs: {m: Missatge, isIncoming: boolean}[];
  chats: Chats[];
  msgs: Msgs[];
  errorChat: boolean = false;
  errorMsg?: string;
  
  constructor(private storageService: StorageService, 
    private cdRef: ChangeDetectorRef,
    private zone: NgZone,
    public dialog: MatDialog,
    private websocketService: WebSocketService,
    private chatService: ChatService,
    private rndService: RndService,
    private cryptService: CryptService,
    private randomseedService: RandomSeedService,
    ) {
    
    this.chats = [];
    this.msgs = [];
    // this.errorChat = false;
  }

  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();
    db.resetDatabase();
    // db.delete();
    
    let selected = localStorage.getItem('selected')?.toString();
    if(this.storageService.isLoggedIn()){
      this.websocketService.connect();
      this.setChats(selected);
    }
    // localStorage.clear();
    console.log("Init sel: " + selected);
    // if(selected != null)
    //   this.restoreSel(selected);
    this.errorSub();
    this.keySub();
    this.randSub();
  }

  private keySub(): void {
    // let auth: AuthRSA;
    keySubject.subscribe({
      next: res => {
        // auth = res;
        let key = this.cryptService.hashM(res.userIni, res.clauPublicaO, res.clauPublicaD);
        console.log("KeyH: " + key);
        this.zone.run(() => {
          const dialogRef = this.dialog.open(DialogComponent, {
            width: 'auto',
            // height: '500px',
            data: {
              xat: res,
              key: key
            }
          });
          dialogRef.afterClosed().subscribe(ret => {
            // if (auth.xat.clauPublicaD !== undefined)
            //   this.chatService.sendRnd(auth.xat.user1, auth.xat.clauPublicaD);
            db.xat.get({'user1': res.user1, 'user2': res.user2}).then(val => {
              if(val !== undefined && val.clauPublicaD !== undefined)
              this.rndService.sendRnd(val?.user1, val?.clauPublicaD);
            });
            // this.randomseedService.addRand(res.user1, this.cryptService.hashX(
            //   res.userIni,
            //   res.clauPublicaO,
            //   res.clauPublicaD,
            //   res.randA, res.randB
            // ));
            window.location.reload();
          });
        });
        
      },
      error: err => {

      },
      complete: () => {
        
      }
    });
  }

  private randSub(): void {
    // randSubject.subscribe({
    //   next: res => {
    //     // this.randomseedService.addRand(res.user1, this.cryptService.hashX(
    //     //   res.userIni,
    //     //   res.clauPublicaO,
    //     //   res.clauPublicaD,
    //     //   res.randA, res.randB
    //     // ));
    //   }
    // });
  }

  private errorSub(): void {
    this.chatService.errorSubject.subscribe({
      next: res => {
        this.errorChat = true;
        this.errorMsg = res.content;
        console.log("SubjectN");
        this.cdRef.detectChanges();
      },
      error: err => {
        console.log("SubjectE");
      },
      complete: () =>{
        console.log("SubjectC")
        this.errorChat = false;
        if(this.msg !== undefined)
          this.sendCompleted(this.msg, this.chatSelectedUser())
// Descomentar!!          
        // window.location.reload();
      }
    });
  }

  ngOnDestroy(){
    this.chatService.errorSubject.unsubscribe();
    keySubject.unsubscribe();
  }

  private setChats(sel?: string){
      // db.xat.toArray().then(list => {
      console.log("setChat " + sel);
      db.xat.where({user2: this.storageService.getUser().username}).toArray(list => {
      list.forEach(chat => {        
        let xat = {c: chat, selected: false};
        this.chats.push(xat);
        if(chat.user1 == sel) this.selMsg(xat);
      })
    });
  }

  private setMsgs(chat: Xat){
    db.missatge.where({idXat1: chat.user1, idXat2: chat.user2})/*.equals({idXat1: chat.user1, idXat2: chat.user2})*/.sortBy('[data+hora]').then(list => {
      list.forEach(msg => {
        this.msgs.push({
          m: msg,
          isIncoming: this.storageService.getUser().username != msg.usuariOrigen
        })
      })
    });
  }

  addUser(): void {
    console.log("AddUser " + this.addUsername)
    if(this.addUsername !== undefined)
      this.chatService.addUser(this.addUsername);
    // window.location.reload();
  }

  sendMsg(): void {
    console.log("sendMsg: "+ this.msg)
    if(this.msg !== undefined){
      this.chatService.sendText(this.msg, this.chatSelectedUser());
      // window.location.reload();
      
    }
  }

  private sendCompleted(text: string, userTo: string): void{
    let missatge = new ChatRequest(MESSAGE, this.storageService.getUser().username, userTo, text);
    let mf = new MissatgeImpl(missatge, missatge.getUserTo(), missatge.getUserFrom());
    db.missatge.add(
      mf
    );
    db.xat.where({'user1': missatge.getUserTo(), 'user2': missatge.getUserFrom()}).modify({
        lastMsg: mf.text,
        lastDate: mf.data
    });
  }

  selMsg(xat: Chats): void{
    console.log("selMsg Chat: " + xat.c.user1)
    this.chats.forEach(chat => {
      if(chat.c.user1 == xat.c.user1) chat.selected = true;
      else chat.selected = false;
    });
    // this.chats.forEach(chat => {
    //   console.log("selected: " + chat.selected);
    // });
    // chat.selected = true;
    this.errorChat = false;
    this.msgs = [];
    // if(!xat.selected)
      this.setMsgs(xat.c);
    localStorage.setItem('selected', xat.c.user1);
  }

  // private restoreSel(userSel: string): void{
    
  //   this.chats.forEach(chat => {
  //     console.log("restUser " + chat.c.username);
  //     // if(chat.c.username == userSel) ;
  //   });
  // }

  chatSelectedUser(): string{
    let ret = "";
    this.chats.forEach(chat => {
      if(chat.selected){
        console.log("selected chat: " + chat.c.user1);
        ret = chat.c.user1;
      } 
    })
    return ret;
  }
}
