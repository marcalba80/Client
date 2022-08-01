import { DatePipe, getLocaleDateFormat } from "@angular/common";
import { LOCALE_ID } from "@angular/core";
import { ChatRequest } from "../_payload/ChatRequest";
import { Missatge, db } from "./Data";
import { XatImpl } from "./XatImpl";


export class MissatgeImpl implements Missatge{
    idXat: string;
    usuariOrigen: string;
    usuariDesti: string;
    text: string;
    data?: string;
    hora?: string;

    constructor(private chatRequest: ChatRequest, private xat: string){
        this.idXat = xat;
        this.usuariOrigen = chatRequest.getUserFrom();
        this.usuariDesti = chatRequest.getUserTo();
        this.text = chatRequest.getContent();
        this.data = new DatePipe('es-ES').transform(new Date(), 'dd/MM/YYYY')?.toString();
        this.hora = new DatePipe('es-ES').transform(new Date(), 'hh:mm')?.toString();
    }

    // private updateChat(msg: ChatRequest): void{
    //     if(db.xat.get(msg.getUserFrom()) == undefined){
    //         db.xat.add(
    //           new XatImpl(msg.getUserFrom())
    //         );
    //       }
    //     db.xat.update(msg.getUserFrom(), {
    //         lastMsg: msg.getContent(),
    //         lastDate: getLocaleDateFormat('es-ES', FormatWidth.Short)
    //     })
    // }
}