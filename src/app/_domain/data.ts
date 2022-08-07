import Dexie, { Table } from 'dexie';
import { XatImpl } from './XatImpl';

export interface Xat{
    id?: number;
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
}

export interface Missatge{
    id?: number;
    idXat1: string;
    idXat2: string;
    usuariOrigen: string;
    usuariDesti: string;
    text: string;
    data?: string;
    hora?: string;
}

export class AppDB extends Dexie{
    xat!: Table<Xat, string>;
    missatge!: Table<Missatge, number>;

    constructor(){
        super('DBTexSec');
        this.version(1).stores({
            xat: '++id, user1, user2',
            missatge: '++id, [idXat1+idXat2], [data+hora]',
        });
        // this.version(4).stores({
        //     xat: 'username',
        //     missatge: '++id, idXat, [data+hora]',
        // });
        // this.resetDatabase().then(db => {
        //     this.version(1).stores({
        //         xat: 'user1, user2',
        //         missatge: '++id, idXat1, idXat2, [data+hora]',
        //     });
        // })
    }

    // private recreate(){
    //     return db.delete().then(() => db.open());
    // }

    async resetDatabase() {
        // await db.transaction('rw', 'Xat', 'Missatge', () => {
        //     this.xat.clear();
        //     this.missatge.clear();
        // });
        this.xat.clear();
        this.missatge.clear();
    }
}

export const db = new AppDB();
