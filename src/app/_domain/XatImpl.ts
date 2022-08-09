import { Xat } from "./Data";

export class XatImpl implements Xat{
    user1: string;
    user2: string;
    userIni: boolean;
    clauPublicaO?: JsonWebKey;
    clauPrivadaO?: JsonWebKey;
    clauPublicaD?: JsonWebKey;
    randA?: string;
    randB?: string;
    lastMsg?: string;
    lastDate?: string;

    constructor(user1: string, 
        user2: string,
        userIni: boolean,
        clauPublicaO?: JsonWebKey,
        clauPrivadaO?: JsonWebKey,
        clauPublicaD?: JsonWebKey,
        // randA?: string,
        lastMsg?: string, lastDate?: string
        )
    {
        this.user1 = user1;
        this.user2 = user2;
        this.userIni = userIni;
        this.clauPublicaO = clauPublicaO;
        this.clauPrivadaO = clauPrivadaO;
        this.clauPublicaD = clauPublicaD;
        // this.randA = randA;
        this.lastMsg = lastMsg;
        this.lastDate = lastDate;
    }

    // setRandA(rand: string){
    //     this.randA = rand;
    // }

    // setRandB(rand: string){
    //     this.randB = rand;
    // }
}