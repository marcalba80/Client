import Dexie, { Table } from 'dexie';
import { XatImpl } from './XatImpl';

export interface Xat{
    username: string;
    clauPublicaO?: string;
    clauPrivadaO?: string;
    clauPublicaD?: string;
    lastMsg?: string;
    lastDate?: string;
}

export interface Missatge{
    id?: number;
    idXat: string;
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
        super('ngdexieliveQuery');
        this.version(4).stores({
            xat: 'username',
            missatge: '++id, idXat, [data+hora]',
        });
    }

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