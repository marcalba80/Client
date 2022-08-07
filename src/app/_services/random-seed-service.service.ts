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
  rands: RSeed[];

  constructor() { 
    this.rands = [];
  }

  addRand(user: string, seed?: string): void{
    if(seed !== undefined)
    this.rands.push({
      user: user,
      rand: seedrandom.create(seed)
    })
  }

  getRand(user: string): seedrandom.RandomSeed | undefined {
    this.rands.forEach(val => {
      if(val.user == user)
        return val.rand;
      else
        return undefined;
    });
    return undefined;
  }

  initRand(user: string): void {
    this.rands.forEach(val => {
      if (val.user == user)
        val.rand.initState();
    })
  }
}
