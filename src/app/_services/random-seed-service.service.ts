import { Injectable } from '@angular/core';
import * as seedrandom from 'random-seed';
import { Subject } from 'rxjs';
import { db } from '../_domain/Data';
import { XatImpl } from '../_domain/XatImpl';
import { CryptService } from './crypt.service';
import { StorageService } from './storage.service';

export interface RSeed{
  user: string;
  iter: number;
  rand: seedrandom.RandomSeed;
}

// export const randSubject: Subject<XatImpl> = new Subject();

@Injectable({
  providedIn: 'root'
})
export class RandomSeedService {
  rands: RSeed[] = [];

  constructor(private storageService: StorageService,
    private cryptService: CryptService) { 
    // this.rands = [];
    // let s = localStorage.getItem('seed');
    // if (s)
    //   this.rands = JSON.parse(s);
  }

  async addRand(user: string): Promise<string>{
    return await new Promise<string>((resolve, reject) => {
      console.log("addRand: " + user);
      // if(seed !== undefined){
      this.getSeed(user).then(seed => {
        
        
        let n = this.rands.push({
          user: user,
          rand: seedrandom.create(seed),
          iter: 1
        });
        
        // console.log("AddSeed: " + this.rands[n-1].rand.string(32));
        // console.log("RandFIni: " + this.rands[0].rand.toString());
        resolve(this.rands[n-1].rand.string(32));
        this.rands[n-1].iter = this.rands[n-1].iter + 1;
        localStorage.setItem('seed', JSON.stringify(this.rands));
      },
      err => {
        console.log(err);
      });
      // }
      // reject();
    });
    // if(seed !== undefined){
    //   let n = this.rands.push({
    //     user: user,
    //     rand: seedrandom.create(seed)
    //   });
    //   localStorage.setItem('seed', JSON.stringify(this.rands));
    //   console.log("AddSeed: " + this.rands[this.rands.length-1].rand.string(32));
    //   return this.rands[n].rand;
    // }
  }

  async getRandString(user: string, seed?: string): Promise<string> {
    let finded = false;
    return await new Promise<string>((resolve, reject) => {
      this.rands.forEach((val, index) => {
        if(val.user == user){
          finded = true;
          console.log("R1 " + val.iter);
          if(val.rand == undefined){
            console.log("R12 " + val.rand);
            // this.delElem(user, seed);
            this.getSeed(user).then(seed => {
              console.log("SeedRandomGen: " + seed);
              val.rand = seedrandom.create(seed);
              // val.iter = 4;
              console.log("R13 " + val.rand);
              
              resolve(this.recString(val.rand, val.iter));
              val.iter = val.iter + 1;
            });
            
          }else{
          console.log("RandF: " + val.iter);
          
          resolve(val.rand.string(32));
          val.iter = val.iter + 1;
          }
          localStorage.setItem('seed', JSON.stringify(this.rands));
        }
        
      });
      if(!finded)
          reject("No trobat");
      if(this.rands.length == 0)
        reject("Rands buit");
    });
    // this.rands.forEach(val => {
    //   if(val.user == user)
    //     return val.rand;
    //   else
    //     return undefined;
    // });
    // return undefined;
  }

  private delElem(user: string){
    let aux: RSeed[] = [];
    this.rands.forEach(val =>{
      if(val.user != user) aux.push(val);
    });
    this.rands = aux;
  }

  private getSeed(userTo: string): Promise<string>{
    console.log("getSeed " + this.storageService.getUser().username);
    return new Promise<string>((resolved, rejected) => {
      db.xat.get({'user1': userTo, 'user2': this.storageService.getUser().username}).then(ret => {
        this.cryptService.hashX(
          ret?.userIni, 
          ret?.clauPublicaO, 
          ret?.clauPublicaD, 
          ret?.randA, ret?.randB).then(seed => {
            resolved(seed);
          });
      },
      err => {
        rejected();
      });
    });
    // return undefined;
  }

  initRand(user: string): void {
    this.rands.forEach(val => {
      if (val.user == user)
        val.iter = 1;
        val.rand.initState();
        localStorage.setItem('seed', JSON.stringify(this.rands));
    })
  }

  recString(rand: seedrandom.RandomSeed, iter: number): string {
    console.log("iter: " + iter);
    if(iter == 1) return rand.string(32);
    else{
      rand.string(32);
      return this.recString(rand, iter-1);
    }
  }
}
