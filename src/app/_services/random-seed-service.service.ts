import { Injectable } from '@angular/core';
import * as seedrandom from 'random-seed';
import { Subject } from 'rxjs';
import { XatImpl } from '../_domain/XatImpl';

export interface RSeed{
  user: string;
  rand: seedrandom.RandomSeed;
}

// export const randSubject: Subject<XatImpl> = new Subject();

@Injectable({
  providedIn: 'root'
})
export class RandomSeedService {
  rands: RSeed[] = [];

  constructor() { 
    // this.rands = [];
    let s = localStorage.getItem('seed');
    if (s)
      this.rands = JSON.parse(s);
  }

  async addRand(user: string, seed?: string): Promise<string>{
    return await new Promise<string>((resolve, reject) => {
      if(seed !== undefined){
        let n = this.rands.push({
          user: user,
          rand: seedrandom.create(seed)
        });
        localStorage.setItem('seed', JSON.stringify(this.rands));
        // console.log("AddSeed: " + this.rands[n-1].rand.string(32));
        resolve(this.rands[n-1].rand.string(32));
      }
      reject()
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

  async getRandString(user: string): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
      this.rands.forEach(val => {
        if(val.user == user){
          resolve(val.rand.string(32));
          localStorage.setItem('seed', JSON.stringify(this.rands));
        }
      })
      reject();
    })
    // this.rands.forEach(val => {
    //   if(val.user == user)
    //     return val.rand;
    //   else
    //     return undefined;
    // });
    // return undefined;
  }

  initRand(user: string): void {
    this.rands.forEach(val => {
      if (val.user == user)
        val.rand.initState();
    })
  }
}
