import { Injectable } from '@angular/core';
import rsa from 'js-crypto-rsa';
import { JsonWebKeyPair } from 'js-crypto-rsa/dist/typedef';
import * as crypt from 'crypto-js';
import { pseudoRandomBytes, randomBytes } from 'crypto';

export interface MCiph{
  iv: string;
  m: string;
  c: string;
  cW: string;
}

const charact = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890,./;'[]\=-)(*&^%$#@!~`";

@Injectable({
  providedIn: 'root'
})
export class CryptService {

  constructor() { }

  generateRSAKey(): Promise<JsonWebKeyPair>{
    return rsa.generateKey(2048);
  }

  hashM(userR: boolean, keyP1?: JsonWebKey, keyP2?: JsonWebKey): string | undefined{
    if(keyP1 !== undefined && keyP2 !== undefined){
      const k1 = keyP1.n?.toString();
      const k2 = keyP2.n?.toString();
      console.log("K1: " + keyP1.n);
      console.log("K2: " + keyP2.n);
      if(k1 !== undefined && k2 !== undefined)
        if(userR)
          return crypt.SHA1(k1.concat(k2)).toString();
        else
          return crypt.SHA1(k2.concat(k1)).toString();
    }
    return undefined;
  }

  hashX(userR?: boolean, keyP1?: JsonWebKey, keyP2?: JsonWebKey, 
    randA?: string, randB?: string): string | undefined{
    if(keyP1 !== undefined && keyP2 !== undefined
      && randA !== undefined && randB !== undefined){
      const k1 = keyP1.n?.toString();
      const k2 = keyP2.n?.toString();
      console.log("K1: " + keyP1.n);
      console.log("K2: " + keyP2.n);
      if(k1 !== undefined && k2 !== undefined)
        if(userR){
          console.log("HashRand: " + crypt.SHA256(k1 + k2 + randA + randB).toString());
          return crypt.SHA256(k1 + k2 + randA + randB).toString();
        }  
        else{
          console.log("HashRand: " + crypt.SHA256(k2 + k1 + randB + randA).toString());
          return crypt.SHA256(k2 + k1 + randB + randA).toString();
        }
    }
    return undefined;
  }

  async encryptRSA(msg: Uint8Array, key: JsonWebKey): Promise<Uint8Array> {
    console.log("encode: " + JSON.stringify(msg))
    return await rsa.encrypt(msg, key);
    // .then(res =>{
    //   console.log("Crypt: " + res);
    //   return res
    // })
    // return undefined;
  }

  async decryptRSA(msg: Uint8Array, key: JsonWebKey): Promise<Uint8Array> {
    return await rsa.decrypt(msg, key);
    // .then(res =>{
    //   return res;
    // })
    // return undefined;
  }

  encryptAESHMAC(msg: string, key: string): string{
    // crypt.HmacSHA256
    console.log("encrK: " + key);
    let keyarr: Uint8Array = this.encodeUTF8(key);
    let keyarr1: Uint8Array = keyarr.subarray(0, 16);
    let keyarr2: Uint8Array = keyarr.subarray(16, 32);

    let iv8: Uint8Array = this.randomValues16();
    // let iv: crypt.lib.WordArray = crypt.enc.Utf8.parse(this.decodeUTF8(iv8));
    let iv: crypt.lib.WordArray = crypt.lib.WordArray.random(16);

    let c = crypt.AES.encrypt(msg, crypt.enc.Utf8.parse(this.decodeUTF8(keyarr1)), {mode: crypt.mode.CBC, 
      padding: crypt.pad.Pkcs7,
      iv: iv});
      // crypt.enc.Utf8.stringify()
    let ivc = iv; ivc.concat(c.ciphertext);
    let m = crypt.HmacSHA256(ivc.toString(), crypt.enc.Utf8.parse(this.decodeUTF8(keyarr2)));
    // let ct = iv.concat(m);
    // return iv.toString(crypt.enc.Utf8) + c.ciphertext.toString(crypt.enc.Utf8) + m.toString(crypt.enc.Utf8);
    let ct: MCiph = {
      iv: iv.toString(),
      m: m.toString(),
      c: c.toString(),
      cW: c.ciphertext.toString(crypt.enc.Utf8)
    }
    // return ct.toString(crypt.enc.Utf8) + JSON.stringify(c);
    return JSON.stringify(ct);
  }

  decryptAESHMAC(msg: string, key: string): string{
    console.log("decrK: " + key);
    let data: MCiph = JSON.parse(msg);
    let keyarr1: Uint8Array = this.encodeUTF8(key).subarray(0, 16);
    let keyarr2: Uint8Array = this.encodeUTF8(key).subarray(16, 32);
    console.log("IV: " + data.iv);
    let iv = crypt.enc.Hex.parse(data.iv);
    let m = crypt.enc.Hex.parse(data.m);
    console.log("IV: " + data.cW);
    let c = crypt.enc.Hex.parse(data.cW);
    let ivc = iv; ivc.concat(c);
    let macV = crypt.HmacSHA256(ivc, crypt.enc.Utf8.parse(this.decodeUTF8(keyarr2)));
    console.log("m: " + m.toString());
    console.log("mV: " + macV.toString());
    if(m.toString() == macV.toString())
      return crypt.AES.decrypt(data.c, crypt.enc.Utf8.parse(this.decodeUTF8(keyarr1)), {
        mode: crypt.mode.CBC, 
        padding: crypt.pad.Pkcs7,
        iv: iv
      }).toString(crypt.enc.Utf8);
    return "undefined";
  }

  encodeUTF8(msg: string): Uint8Array{
    return new TextEncoder().encode(msg);
  }

  decodeUTF8(msg: Uint8Array): string {
    return new TextDecoder().decode(msg);
  }

  hashSHA256(k: string): string{
    return crypt.SHA256(k).toString();
  }

  makeRandom(length: number): string{
    let text = "";
    for (let i = 0; i < length; i++) {
      text += charact.charAt(Math.floor(Math.random() * charact.length));
    }
    return text;
  }

  randomValues(): Uint8Array{
    let arr: Uint8Array = new Uint8Array(32);
    window.crypto.getRandomValues(arr);
    return arr;
  }

  randomValues16(): Uint8Array{
    let arr: Uint8Array = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    return arr;
  }

  StrToArray(str: string): Uint8Array{
    let strArr = str.split(',');
    console.log("S2A: " + strArr[0]);
    let arr: Uint8Array = new Uint8Array(strArr.length);
    for (var i = 0; i < strArr.length; i++) {
      arr[i] = parseInt(strArr[i]);
      
    }
    return arr;
  }

  StrToArrayL(str: string, length: number): Uint8Array{
    // let strArr = str.split(',');
    // console.log("S2A: " + strArr[0]);
    let arr: Uint8Array = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
      arr[i] = parseInt(str[i]);
      
    }
    return arr;
  }

  ArrayToJson(array: Uint8Array) {
    let str = "";
    for (var i = 0; i < array.length; i++) {
      str += String.fromCharCode(array[i]);
    }
    return JSON.parse(str);
  }

  // StringToItnum(str: string): []{

  // }
}
