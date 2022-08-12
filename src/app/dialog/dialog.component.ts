import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { db, Xat } from '../_domain/Data';
import { ChatService } from '../_services/chat.service';

export interface DialogData {
  xat: Xat;
  key: string;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  // styleUrls: ['./dialog.component.css']
})
export class DialogComponent {

  constructor(public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
      
     }

  onNoClick(): void{
    console.log("CloseDialog")
    db.xat.where({'user1': this.data.xat.user1, 'user2': this.data.xat.user2}).delete();
    this.dialogRef.close();
  }

  iguals(){
    // console.log("KIguals");
    db.xat.where({'user1': this.data.xat.user1, 'user2': this.data.xat.user2}).modify({
      clauPublicaD: this.data.xat.clauPublicaD,
      userIni: this.data.xat.userIni
    });
  }
}
