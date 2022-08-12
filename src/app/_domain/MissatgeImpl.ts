import { DatePipe } from "@angular/common";
import { ChatRequest } from "../_payload/ChatRequest";
import { Missatge, db } from "./Data";

export class MissatgeImpl implements Missatge{
    idXat1: string;
    idXat2: string;
    usuariOrigen: string;
    usuariDesti: string;
    text: string;
    data?: string;
    hora?: string;

    constructor(chatRequest: ChatRequest, user1: string, user2: string){
        this.idXat1 = user1;
        this.idXat2 = user2;
        this.usuariOrigen = chatRequest.getUserFrom();
        this.usuariDesti = chatRequest.getUserTo();
        this.text = chatRequest.getContent();
        this.data = new DatePipe('es-ES').transform(new Date(), 'dd/MM/YYYY')?.toString();
        this.hora = new DatePipe('es-ES').transform(new Date(), 'HH:mm')?.toString();
    }
}