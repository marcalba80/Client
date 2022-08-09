import { Injectable } from '@angular/core';
import rsa from 'js-crypto-rsa';
import { JsonWebKeyPair } from 'js-crypto-rsa/dist/typedef';
import * as crypt from 'crypto-js';
import { pseudoRandomBytes, randomBytes } from 'crypto';


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
    let keyarr: Uint8Array = this.encodeUTF8(key);
    let keyarr1: Uint8Array = keyarr.subarray(0, 127);
    let keyarr2: Uint8Array = keyarr.subarray(128, 255);
    let iv: crypt.lib.WordArray = crypt.lib.WordArray.random(16);
    
    let c = crypt.AES.encrypt(msg, crypt.enc.Utf8.parse(this.decodeUTF8(keyarr1)), {mode: crypt.mode.CBC, 
      padding: crypt.pad.Pkcs7,
      iv: iv});
    let m = crypt.HmacSHA256(iv.toString(crypt.enc.Utf8) + c.ciphertext.toString(crypt.enc.Utf8), crypt.enc.Utf8.parse(this.decodeUTF8(keyarr2)));
    return iv.toString(crypt.enc.Utf8) + c.ciphertext.toString(crypt.enc.Utf8) + m.toString(crypt.enc.Utf8);
  }

  decryptAES(msg: string, key: string): string | undefined{
    let data = this.encodeUTF8(msg);
    let keyarr1: Uint8Array = this.encodeUTF8(key).subarray(0, 127);
    let keyarr2: Uint8Array = this.encodeUTF8(key).subarray(128, 255);
    let iv = data.subarray(0, 127);
    let m = data.subarray(data.length-256, data.length);
    let c = data.subarray(128, data.length-256);
    let macV = crypt.HmacSHA256(this.decodeUTF8(iv) + this.decodeUTF8(c), crypt.enc.Utf8.parse(this.decodeUTF8(keyarr2)));
    if(this.decodeUTF8(m) == macV.toString(crypt.enc.Utf8))
      return crypt.AES.decrypt(this.decodeUTF8(c), crypt.enc.Utf8.parse(this.decodeUTF8(keyarr1)), {
        mode: crypt.mode.CBC, 
        padding: crypt.pad.Pkcs7,
        iv: crypt.enc.Utf8.parse(this.decodeUTF8(iv))
      }).toString(crypt.enc.Utf8);
    return undefined;
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
