import { Xat } from "./Data";

export class XatImpl implements Xat{
    user1: string;
    user2: string;
    clauPublicaO?: string;
    clauPrivadaO?: string;
    clauPublicaD?: string;
    lastMsg?: string;
    lastDate?: string;

    constructor(user1: string, 
        user2: string,
        // clauPublicaO: string,
        // clauPrivadaO: string,
        // clauPublicaD: string,
        lastMsg: string, lastDate?: string
        )
    {
        this.user1 = user1;
        this.user2 = user2;
        // this.clauPublicaO = clauPublicaO;
        // this.clauPrivadaO = clauPrivadaO;
        // this.clauPublicaD = clauPublicaD;
        this.lastMsg = lastMsg;
        this.lastDate = lastDate;
    }

}