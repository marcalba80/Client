import { FormatWidth, getLocaleDateFormat, getLocaleTimeFormat } from "@angular/common";
import { ChatRequest } from "../_payload/ChatRequest";
import { db, Missatge } from "./data";
import { XatImpl } from "./XatImpl";


export class MissatgeImpl implements Missatge{
    idXat: string;
    usuariOrigen: string;
    usuariDesti: string;
    text: string;
    data: string;
    hora: string;

    constructor(private chatRequest: ChatRequest){
        this.idXat = chatRequest.getUserFrom();
        this.usuariOrigen = chatRequest.getUserFrom();
        this.usuariDesti = chatRequest.getUserTo();
        this.text = chatRequest.getContent();
        this.data = getLocaleDateFormat('es-ES', FormatWidth.Short);
        this.hora = getLocaleTimeFormat('es-ES', FormatWidth.Short);
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