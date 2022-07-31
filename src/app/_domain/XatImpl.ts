import { Xat } from "./Data";

export class XatImpl implements Xat{
    username: string;
    clauPublicaO?: string;
    clauPrivadaO?: string;
    clauPublicaD?: string;
    lastMsg?: string;
    lastDate?: string;

    constructor(username: string, 
        // clauPublicaO: string,
        // clauPrivadaO: string,
        // clauPublicaD: string,
        lastMsg: string, lastDate: string
        )
    {
        this.username = username;
        // this.clauPublicaO = clauPublicaO;
        // this.clauPrivadaO = clauPrivadaO;
        // this.clauPublicaD = clauPublicaD;
        this.lastMsg = lastMsg;
        this.lastDate = lastDate;
    }

}