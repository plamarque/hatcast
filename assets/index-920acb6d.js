(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();/**
* @vue/shared v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**//*! #__NO_SIDE_EFFECTS__ */function bl(n){const e=Object.create(null);for(const t of n.split(","))e[t]=1;return t=>t in e}const Re={},Mr=[],Mt=()=>{},zm=()=>!1,Ao=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&(n.charCodeAt(2)>122||n.charCodeAt(2)<97),Rl=n=>n.startsWith("onUpdate:"),et=Object.assign,Sl=(n,e)=>{const t=n.indexOf(e);t>-1&&n.splice(t,1)},Wm=Object.prototype.hasOwnProperty,we=(n,e)=>Wm.call(n,e),le=Array.isArray,Lr=n=>bo(n)==="[object Map]",ad=n=>bo(n)==="[object Set]",he=n=>typeof n=="function",je=n=>typeof n=="string",Wn=n=>typeof n=="symbol",Ne=n=>n!==null&&typeof n=="object",ld=n=>(Ne(n)||he(n))&&he(n.then)&&he(n.catch),cd=Object.prototype.toString,bo=n=>cd.call(n),Km=n=>bo(n).slice(8,-1),ud=n=>bo(n)==="[object Object]",Pl=n=>je(n)&&n!=="NaN"&&n[0]!=="-"&&""+parseInt(n,10)===n,Cs=bl(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Ro=n=>{const e=Object.create(null);return t=>e[t]||(e[t]=n(t))},Gm=/-(\w)/g,Un=Ro(n=>n.replace(Gm,(e,t)=>t?t.toUpperCase():"")),Qm=/\B([A-Z])/g,Kn=Ro(n=>n.replace(Qm,"-$1").toLowerCase()),hd=Ro(n=>n.charAt(0).toUpperCase()+n.slice(1)),ga=Ro(n=>n?`on${hd(n)}`:""),xn=(n,e)=>!Object.is(n,e),ji=(n,...e)=>{for(let t=0;t<n.length;t++)n[t](...e)},qa=(n,e,t,r=!1)=>{Object.defineProperty(n,e,{configurable:!0,enumerable:!1,writable:r,value:t})},Ha=n=>{const e=parseFloat(n);return isNaN(e)?n:e};let wu;const So=()=>wu||(wu=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function js(n){if(le(n)){const e={};for(let t=0;t<n.length;t++){const r=n[t],s=je(r)?Zm(r):js(r);if(s)for(const i in s)e[i]=s[i]}return e}else if(je(n)||Ne(n))return n}const Jm=/;(?![^(]*\))/g,Ym=/:([^]+)/,Xm=/\/\*[^]*?\*\//g;function Zm(n){const e={};return n.replace(Xm,"").split(Jm).forEach(t=>{if(t){const r=t.split(Ym);r.length>1&&(e[r[0].trim()]=r[1].trim())}}),e}function $s(n){let e="";if(je(n))e=n;else if(le(n))for(let t=0;t<n.length;t++){const r=$s(n[t]);r&&(e+=r+" ")}else if(Ne(n))for(const t in n)n[t]&&(e+=t+" ");return e.trim()}const eg="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",tg=bl(eg);function dd(n){return!!n||n===""}const fd=n=>!!(n&&n.__v_isRef===!0),nr=n=>je(n)?n:n==null?"":le(n)||Ne(n)&&(n.toString===cd||!he(n.toString))?fd(n)?nr(n.value):JSON.stringify(n,pd,2):String(n),pd=(n,e)=>fd(e)?pd(n,e.value):Lr(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((t,[r,s],i)=>(t[_a(r,i)+" =>"]=s,t),{})}:ad(e)?{[`Set(${e.size})`]:[...e.values()].map(t=>_a(t))}:Wn(e)?_a(e):Ne(e)&&!le(e)&&!ud(e)?String(e):e,_a=(n,e="")=>{var t;return Wn(n)?`Symbol(${(t=n.description)!=null?t:e})`:n};/**
* @vue/reactivity v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let yt;class ng{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=yt,!e&&yt&&(this.index=(yt.scopes||(yt.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].pause();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].resume();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].resume()}}run(e){if(this._active){const t=yt;try{return yt=this,e()}finally{yt=t}}}on(){++this._on===1&&(this.prevScope=yt,yt=this)}off(){this._on>0&&--this._on===0&&(yt=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let t,r;for(t=0,r=this.effects.length;t<r;t++)this.effects[t].stop();for(this.effects.length=0,t=0,r=this.cleanups.length;t<r;t++)this.cleanups[t]();if(this.cleanups.length=0,this.scopes){for(t=0,r=this.scopes.length;t<r;t++)this.scopes[t].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function rg(){return yt}let Pe;const ya=new WeakSet;class md{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,yt&&yt.active&&yt.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,ya.has(this)&&(ya.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||_d(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,Iu(this),yd(this);const e=Pe,t=Lt;Pe=this,Lt=!0;try{return this.fn()}finally{vd(this),Pe=e,Lt=t,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)Dl(e);this.deps=this.depsTail=void 0,Iu(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?ya.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){za(this)&&this.run()}get dirty(){return za(this)}}let gd=0,ks,Ds;function _d(n,e=!1){if(n.flags|=8,e){n.next=Ds,Ds=n;return}n.next=ks,ks=n}function Cl(){gd++}function kl(){if(--gd>0)return;if(Ds){let e=Ds;for(Ds=void 0;e;){const t=e.next;e.next=void 0,e.flags&=-9,e=t}}let n;for(;ks;){let e=ks;for(ks=void 0;e;){const t=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(r){n||(n=r)}e=t}}if(n)throw n}function yd(n){for(let e=n.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function vd(n){let e,t=n.depsTail,r=t;for(;r;){const s=r.prevDep;r.version===-1?(r===t&&(t=s),Dl(r),sg(r)):e=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=s}n.deps=e,n.depsTail=t}function za(n){for(let e=n.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(Ed(e.dep.computed)||e.dep.version!==e.version))return!0;return!!n._dirty}function Ed(n){if(n.flags&4&&!(n.flags&16)||(n.flags&=-17,n.globalVersion===qs)||(n.globalVersion=qs,!n.isSSR&&n.flags&128&&(!n.deps&&!n._dirty||!za(n))))return;n.flags|=2;const e=n.dep,t=Pe,r=Lt;Pe=n,Lt=!0;try{yd(n);const s=n.fn(n._value);(e.version===0||xn(s,n._value))&&(n.flags|=128,n._value=s,e.version++)}catch(s){throw e.version++,s}finally{Pe=t,Lt=r,vd(n),n.flags&=-3}}function Dl(n,e=!1){const{dep:t,prevSub:r,nextSub:s}=n;if(r&&(r.nextSub=s,n.prevSub=void 0),s&&(s.prevSub=r,n.nextSub=void 0),t.subs===n&&(t.subs=r,!r&&t.computed)){t.computed.flags&=-5;for(let i=t.computed.deps;i;i=i.nextDep)Dl(i,!0)}!e&&!--t.sc&&t.map&&t.map.delete(t.key)}function sg(n){const{prevDep:e,nextDep:t}=n;e&&(e.nextDep=t,n.prevDep=void 0),t&&(t.prevDep=e,n.nextDep=void 0)}let Lt=!0;const Td=[];function un(){Td.push(Lt),Lt=!1}function hn(){const n=Td.pop();Lt=n===void 0?!0:n}function Iu(n){const{cleanup:e}=n;if(n.cleanup=void 0,e){const t=Pe;Pe=void 0;try{e()}finally{Pe=t}}}let qs=0;class ig{constructor(e,t){this.sub=e,this.dep=t,this.version=t.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class xl{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!Pe||!Lt||Pe===this.computed)return;let t=this.activeLink;if(t===void 0||t.sub!==Pe)t=this.activeLink=new ig(Pe,this),Pe.deps?(t.prevDep=Pe.depsTail,Pe.depsTail.nextDep=t,Pe.depsTail=t):Pe.deps=Pe.depsTail=t,wd(t);else if(t.version===-1&&(t.version=this.version,t.nextDep)){const r=t.nextDep;r.prevDep=t.prevDep,t.prevDep&&(t.prevDep.nextDep=r),t.prevDep=Pe.depsTail,t.nextDep=void 0,Pe.depsTail.nextDep=t,Pe.depsTail=t,Pe.deps===t&&(Pe.deps=r)}return t}trigger(e){this.version++,qs++,this.notify(e)}notify(e){Cl();try{for(let t=this.subs;t;t=t.prevSub)t.sub.notify()&&t.sub.dep.notify()}finally{kl()}}}function wd(n){if(n.dep.sc++,n.sub.flags&4){const e=n.dep.computed;if(e&&!n.dep.subs){e.flags|=20;for(let r=e.deps;r;r=r.nextDep)wd(r)}const t=n.dep.subs;t!==n&&(n.prevSub=t,t&&(t.nextSub=n)),n.dep.subs=n}}const Wa=new WeakMap,or=Symbol(""),Ka=Symbol(""),Hs=Symbol("");function at(n,e,t){if(Lt&&Pe){let r=Wa.get(n);r||Wa.set(n,r=new Map);let s=r.get(t);s||(r.set(t,s=new xl),s.map=r,s.key=t),s.track()}}function nn(n,e,t,r,s,i){const a=Wa.get(n);if(!a){qs++;return}const l=c=>{c&&c.trigger()};if(Cl(),e==="clear")a.forEach(l);else{const c=le(n),d=c&&Pl(t);if(c&&t==="length"){const f=Number(r);a.forEach((m,E)=>{(E==="length"||E===Hs||!Wn(E)&&E>=f)&&l(m)})}else switch((t!==void 0||a.has(void 0))&&l(a.get(t)),d&&l(a.get(Hs)),e){case"add":c?d&&l(a.get("length")):(l(a.get(or)),Lr(n)&&l(a.get(Ka)));break;case"delete":c||(l(a.get(or)),Lr(n)&&l(a.get(Ka)));break;case"set":Lr(n)&&l(a.get(or));break}}kl()}function Ar(n){const e=Te(n);return e===n?e:(at(e,"iterate",Hs),kt(n)?e:e.map(Je))}function Po(n){return at(n=Te(n),"iterate",Hs),n}const og={__proto__:null,[Symbol.iterator](){return va(this,Symbol.iterator,Je)},concat(...n){return Ar(this).concat(...n.map(e=>le(e)?Ar(e):e))},entries(){return va(this,"entries",n=>(n[1]=Je(n[1]),n))},every(n,e){return en(this,"every",n,e,void 0,arguments)},filter(n,e){return en(this,"filter",n,e,t=>t.map(Je),arguments)},find(n,e){return en(this,"find",n,e,Je,arguments)},findIndex(n,e){return en(this,"findIndex",n,e,void 0,arguments)},findLast(n,e){return en(this,"findLast",n,e,Je,arguments)},findLastIndex(n,e){return en(this,"findLastIndex",n,e,void 0,arguments)},forEach(n,e){return en(this,"forEach",n,e,void 0,arguments)},includes(...n){return Ea(this,"includes",n)},indexOf(...n){return Ea(this,"indexOf",n)},join(n){return Ar(this).join(n)},lastIndexOf(...n){return Ea(this,"lastIndexOf",n)},map(n,e){return en(this,"map",n,e,void 0,arguments)},pop(){return Es(this,"pop")},push(...n){return Es(this,"push",n)},reduce(n,...e){return Au(this,"reduce",n,e)},reduceRight(n,...e){return Au(this,"reduceRight",n,e)},shift(){return Es(this,"shift")},some(n,e){return en(this,"some",n,e,void 0,arguments)},splice(...n){return Es(this,"splice",n)},toReversed(){return Ar(this).toReversed()},toSorted(n){return Ar(this).toSorted(n)},toSpliced(...n){return Ar(this).toSpliced(...n)},unshift(...n){return Es(this,"unshift",n)},values(){return va(this,"values",Je)}};function va(n,e,t){const r=Po(n),s=r[e]();return r!==n&&!kt(n)&&(s._next=s.next,s.next=()=>{const i=s._next();return i.value&&(i.value=t(i.value)),i}),s}const ag=Array.prototype;function en(n,e,t,r,s,i){const a=Po(n),l=a!==n&&!kt(n),c=a[e];if(c!==ag[e]){const m=c.apply(n,i);return l?Je(m):m}let d=t;a!==n&&(l?d=function(m,E){return t.call(this,Je(m),E,n)}:t.length>2&&(d=function(m,E){return t.call(this,m,E,n)}));const f=c.call(a,d,r);return l&&s?s(f):f}function Au(n,e,t,r){const s=Po(n);let i=t;return s!==n&&(kt(n)?t.length>3&&(i=function(a,l,c){return t.call(this,a,l,c,n)}):i=function(a,l,c){return t.call(this,a,Je(l),c,n)}),s[e](i,...r)}function Ea(n,e,t){const r=Te(n);at(r,"iterate",Hs);const s=r[e](...t);return(s===-1||s===!1)&&Ml(t[0])?(t[0]=Te(t[0]),r[e](...t)):s}function Es(n,e,t=[]){un(),Cl();const r=Te(n)[e].apply(n,t);return kl(),hn(),r}const lg=bl("__proto__,__v_isRef,__isVue"),Id=new Set(Object.getOwnPropertyNames(Symbol).filter(n=>n!=="arguments"&&n!=="caller").map(n=>Symbol[n]).filter(Wn));function cg(n){Wn(n)||(n=String(n));const e=Te(this);return at(e,"has",n),e.hasOwnProperty(n)}class Ad{constructor(e=!1,t=!1){this._isReadonly=e,this._isShallow=t}get(e,t,r){if(t==="__v_skip")return e.__v_skip;const s=this._isReadonly,i=this._isShallow;if(t==="__v_isReactive")return!s;if(t==="__v_isReadonly")return s;if(t==="__v_isShallow")return i;if(t==="__v_raw")return r===(s?i?vg:Pd:i?Sd:Rd).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(r)?e:void 0;const a=le(e);if(!s){let c;if(a&&(c=og[t]))return c;if(t==="hasOwnProperty")return cg}const l=Reflect.get(e,t,ct(e)?e:r);return(Wn(t)?Id.has(t):lg(t))||(s||at(e,"get",t),i)?l:ct(l)?a&&Pl(t)?l:l.value:Ne(l)?s?Cd(l):Nl(l):l}}class bd extends Ad{constructor(e=!1){super(!1,e)}set(e,t,r,s){let i=e[t];if(!this._isShallow){const c=Bn(i);if(!kt(r)&&!Bn(r)&&(i=Te(i),r=Te(r)),!le(e)&&ct(i)&&!ct(r))return c?!1:(i.value=r,!0)}const a=le(e)&&Pl(t)?Number(t)<e.length:we(e,t),l=Reflect.set(e,t,r,ct(e)?e:s);return e===Te(s)&&(a?xn(r,i)&&nn(e,"set",t,r):nn(e,"add",t,r)),l}deleteProperty(e,t){const r=we(e,t);e[t];const s=Reflect.deleteProperty(e,t);return s&&r&&nn(e,"delete",t,void 0),s}has(e,t){const r=Reflect.has(e,t);return(!Wn(t)||!Id.has(t))&&at(e,"has",t),r}ownKeys(e){return at(e,"iterate",le(e)?"length":or),Reflect.ownKeys(e)}}class ug extends Ad{constructor(e=!1){super(!0,e)}set(e,t){return!0}deleteProperty(e,t){return!0}}const hg=new bd,dg=new ug,fg=new bd(!0);const Ga=n=>n,xi=n=>Reflect.getPrototypeOf(n);function pg(n,e,t){return function(...r){const s=this.__v_raw,i=Te(s),a=Lr(i),l=n==="entries"||n===Symbol.iterator&&a,c=n==="keys"&&a,d=s[n](...r),f=t?Ga:e?eo:Je;return!e&&at(i,"iterate",c?Ka:or),{next(){const{value:m,done:E}=d.next();return E?{value:m,done:E}:{value:l?[f(m[0]),f(m[1])]:f(m),done:E}},[Symbol.iterator](){return this}}}}function Vi(n){return function(...e){return n==="delete"?!1:n==="clear"?void 0:this}}function mg(n,e){const t={get(s){const i=this.__v_raw,a=Te(i),l=Te(s);n||(xn(s,l)&&at(a,"get",s),at(a,"get",l));const{has:c}=xi(a),d=e?Ga:n?eo:Je;if(c.call(a,s))return d(i.get(s));if(c.call(a,l))return d(i.get(l));i!==a&&i.get(s)},get size(){const s=this.__v_raw;return!n&&at(Te(s),"iterate",or),Reflect.get(s,"size",s)},has(s){const i=this.__v_raw,a=Te(i),l=Te(s);return n||(xn(s,l)&&at(a,"has",s),at(a,"has",l)),s===l?i.has(s):i.has(s)||i.has(l)},forEach(s,i){const a=this,l=a.__v_raw,c=Te(l),d=e?Ga:n?eo:Je;return!n&&at(c,"iterate",or),l.forEach((f,m)=>s.call(i,d(f),d(m),a))}};return et(t,n?{add:Vi("add"),set:Vi("set"),delete:Vi("delete"),clear:Vi("clear")}:{add(s){!e&&!kt(s)&&!Bn(s)&&(s=Te(s));const i=Te(this);return xi(i).has.call(i,s)||(i.add(s),nn(i,"add",s,s)),this},set(s,i){!e&&!kt(i)&&!Bn(i)&&(i=Te(i));const a=Te(this),{has:l,get:c}=xi(a);let d=l.call(a,s);d||(s=Te(s),d=l.call(a,s));const f=c.call(a,s);return a.set(s,i),d?xn(i,f)&&nn(a,"set",s,i):nn(a,"add",s,i),this},delete(s){const i=Te(this),{has:a,get:l}=xi(i);let c=a.call(i,s);c||(s=Te(s),c=a.call(i,s)),l&&l.call(i,s);const d=i.delete(s);return c&&nn(i,"delete",s,void 0),d},clear(){const s=Te(this),i=s.size!==0,a=s.clear();return i&&nn(s,"clear",void 0,void 0),a}}),["keys","values","entries",Symbol.iterator].forEach(s=>{t[s]=pg(s,n,e)}),t}function Vl(n,e){const t=mg(n,e);return(r,s,i)=>s==="__v_isReactive"?!n:s==="__v_isReadonly"?n:s==="__v_raw"?r:Reflect.get(we(t,s)&&s in r?t:r,s,i)}const gg={get:Vl(!1,!1)},_g={get:Vl(!1,!0)},yg={get:Vl(!0,!1)};const Rd=new WeakMap,Sd=new WeakMap,Pd=new WeakMap,vg=new WeakMap;function Eg(n){switch(n){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function Tg(n){return n.__v_skip||!Object.isExtensible(n)?0:Eg(Km(n))}function Nl(n){return Bn(n)?n:Ol(n,!1,hg,gg,Rd)}function wg(n){return Ol(n,!1,fg,_g,Sd)}function Cd(n){return Ol(n,!0,dg,yg,Pd)}function Ol(n,e,t,r,s){if(!Ne(n)||n.__v_raw&&!(e&&n.__v_isReactive))return n;const i=Tg(n);if(i===0)return n;const a=s.get(n);if(a)return a;const l=new Proxy(n,i===2?r:t);return s.set(n,l),l}function Fr(n){return Bn(n)?Fr(n.__v_raw):!!(n&&n.__v_isReactive)}function Bn(n){return!!(n&&n.__v_isReadonly)}function kt(n){return!!(n&&n.__v_isShallow)}function Ml(n){return n?!!n.__v_raw:!1}function Te(n){const e=n&&n.__v_raw;return e?Te(e):n}function Ig(n){return!we(n,"__v_skip")&&Object.isExtensible(n)&&qa(n,"__v_skip",!0),n}const Je=n=>Ne(n)?Nl(n):n,eo=n=>Ne(n)?Cd(n):n;function ct(n){return n?n.__v_isRef===!0:!1}function Se(n){return Ag(n,!1)}function Ag(n,e){return ct(n)?n:new bg(n,e)}class bg{constructor(e,t){this.dep=new xl,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=t?e:Te(e),this._value=t?e:Je(e),this.__v_isShallow=t}get value(){return this.dep.track(),this._value}set value(e){const t=this._rawValue,r=this.__v_isShallow||kt(e)||Bn(e);e=r?e:Te(e),xn(e,t)&&(this._rawValue=e,this._value=r?e:Je(e),this.dep.trigger())}}function Rg(n){return ct(n)?n.value:n}const Sg={get:(n,e,t)=>e==="__v_raw"?n:Rg(Reflect.get(n,e,t)),set:(n,e,t,r)=>{const s=n[e];return ct(s)&&!ct(t)?(s.value=t,!0):Reflect.set(n,e,t,r)}};function kd(n){return Fr(n)?n:new Proxy(n,Sg)}class Pg{constructor(e,t,r){this.fn=e,this.setter=t,this._value=void 0,this.dep=new xl(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=qs-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!t,this.isSSR=r}notify(){if(this.flags|=16,!(this.flags&8)&&Pe!==this)return _d(this,!0),!0}get value(){const e=this.dep.track();return Ed(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function Cg(n,e,t=!1){let r,s;return he(n)?r=n:(r=n.get,s=n.set),new Pg(r,s,t)}const Ni={},to=new WeakMap;let rr;function kg(n,e=!1,t=rr){if(t){let r=to.get(t);r||to.set(t,r=[]),r.push(n)}}function Dg(n,e,t=Re){const{immediate:r,deep:s,once:i,scheduler:a,augmentJob:l,call:c}=t,d=J=>s?J:kt(J)||s===!1||s===0?rn(J,1):rn(J);let f,m,E,k,V=!1,M=!1;if(ct(n)?(m=()=>n.value,V=kt(n)):Fr(n)?(m=()=>d(n),V=!0):le(n)?(M=!0,V=n.some(J=>Fr(J)||kt(J)),m=()=>n.map(J=>{if(ct(J))return J.value;if(Fr(J))return d(J);if(he(J))return c?c(J,2):J()})):he(n)?e?m=c?()=>c(n,2):n:m=()=>{if(E){un();try{E()}finally{hn()}}const J=rr;rr=f;try{return c?c(n,3,[k]):n(k)}finally{rr=J}}:m=Mt,e&&s){const J=m,me=s===!0?1/0:s;m=()=>rn(J(),me)}const j=rg(),X=()=>{f.stop(),j&&j.active&&Sl(j.effects,f)};if(i&&e){const J=e;e=(...me)=>{J(...me),X()}}let ee=M?new Array(n.length).fill(Ni):Ni;const te=J=>{if(!(!(f.flags&1)||!f.dirty&&!J))if(e){const me=f.run();if(s||V||(M?me.some((_e,I)=>xn(_e,ee[I])):xn(me,ee))){E&&E();const _e=rr;rr=f;try{const I=[me,ee===Ni?void 0:M&&ee[0]===Ni?[]:ee,k];ee=me,c?c(e,3,I):e(...I)}finally{rr=_e}}}else f.run()};return l&&l(te),f=new md(m),f.scheduler=a?()=>a(te,!1):te,k=J=>kg(J,!1,f),E=f.onStop=()=>{const J=to.get(f);if(J){if(c)c(J,4);else for(const me of J)me();to.delete(f)}},e?r?te(!0):ee=f.run():a?a(te.bind(null,!0),!0):f.run(),X.pause=f.pause.bind(f),X.resume=f.resume.bind(f),X.stop=X,X}function rn(n,e=1/0,t){if(e<=0||!Ne(n)||n.__v_skip||(t=t||new Set,t.has(n)))return n;if(t.add(n),e--,ct(n))rn(n.value,e,t);else if(le(n))for(let r=0;r<n.length;r++)rn(n[r],e,t);else if(ad(n)||Lr(n))n.forEach(r=>{rn(r,e,t)});else if(ud(n)){for(const r in n)rn(n[r],e,t);for(const r of Object.getOwnPropertySymbols(n))Object.prototype.propertyIsEnumerable.call(n,r)&&rn(n[r],e,t)}return n}/**
* @vue/runtime-core v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function ni(n,e,t,r){try{return r?n(...r):n()}catch(s){Co(s,e,t)}}function Gt(n,e,t,r){if(he(n)){const s=ni(n,e,t,r);return s&&ld(s)&&s.catch(i=>{Co(i,e,t)}),s}if(le(n)){const s=[];for(let i=0;i<n.length;i++)s.push(Gt(n[i],e,t,r));return s}}function Co(n,e,t,r=!0){const s=e?e.vnode:null,{errorHandler:i,throwUnhandledErrorInProduction:a}=e&&e.appContext.config||Re;if(e){let l=e.parent;const c=e.proxy,d=`https://vuejs.org/error-reference/#runtime-${t}`;for(;l;){const f=l.ec;if(f){for(let m=0;m<f.length;m++)if(f[m](n,c,d)===!1)return}l=l.parent}if(i){un(),ni(i,null,10,[n,c,d]),hn();return}}xg(n,t,s,r,a)}function xg(n,e,t,r=!0,s=!1){if(s)throw n;console.error(n)}const mt=[];let $t=-1;const Ur=[];let bn=null,kr=0;const Dd=Promise.resolve();let no=null;function xd(n){const e=no||Dd;return n?e.then(this?n.bind(this):n):e}function Vg(n){let e=$t+1,t=mt.length;for(;e<t;){const r=e+t>>>1,s=mt[r],i=zs(s);i<n||i===n&&s.flags&2?e=r+1:t=r}return e}function Ll(n){if(!(n.flags&1)){const e=zs(n),t=mt[mt.length-1];!t||!(n.flags&2)&&e>=zs(t)?mt.push(n):mt.splice(Vg(e),0,n),n.flags|=1,Vd()}}function Vd(){no||(no=Dd.then(Od))}function Ng(n){le(n)?Ur.push(...n):bn&&n.id===-1?bn.splice(kr+1,0,n):n.flags&1||(Ur.push(n),n.flags|=1),Vd()}function bu(n,e,t=$t+1){for(;t<mt.length;t++){const r=mt[t];if(r&&r.flags&2){if(n&&r.id!==n.uid)continue;mt.splice(t,1),t--,r.flags&4&&(r.flags&=-2),r(),r.flags&4||(r.flags&=-2)}}}function Nd(n){if(Ur.length){const e=[...new Set(Ur)].sort((t,r)=>zs(t)-zs(r));if(Ur.length=0,bn){bn.push(...e);return}for(bn=e,kr=0;kr<bn.length;kr++){const t=bn[kr];t.flags&4&&(t.flags&=-2),t.flags&8||t(),t.flags&=-2}bn=null,kr=0}}const zs=n=>n.id==null?n.flags&2?-1:1/0:n.id;function Od(n){const e=Mt;try{for($t=0;$t<mt.length;$t++){const t=mt[$t];t&&!(t.flags&8)&&(t.flags&4&&(t.flags&=-2),ni(t,t.i,t.i?15:14),t.flags&4||(t.flags&=-2))}}finally{for(;$t<mt.length;$t++){const t=mt[$t];t&&(t.flags&=-2)}$t=-1,mt.length=0,Nd(),no=null,(mt.length||Ur.length)&&Od()}}let Ct=null,Md=null;function ro(n){const e=Ct;return Ct=n,Md=n&&n.type.__scopeId||null,e}function Og(n,e=Ct,t){if(!e||n._n)return n;const r=(...s)=>{r._d&&Vu(-1);const i=ro(e);let a;try{a=n(...s)}finally{ro(i),r._d&&Vu(1)}return a};return r._n=!0,r._c=!0,r._d=!0,r}function br(n,e){if(Ct===null)return n;const t=Vo(Ct),r=n.dirs||(n.dirs=[]);for(let s=0;s<e.length;s++){let[i,a,l,c=Re]=e[s];i&&(he(i)&&(i={mounted:i,updated:i}),i.deep&&rn(a),r.push({dir:i,instance:t,value:a,oldValue:void 0,arg:l,modifiers:c}))}return n}function er(n,e,t,r){const s=n.dirs,i=e&&e.dirs;for(let a=0;a<s.length;a++){const l=s[a];i&&(l.oldValue=i[a].value);let c=l.dir[r];c&&(un(),Gt(c,t,8,[n.el,l,n,e]),hn())}}const Mg=Symbol("_vte"),Lg=n=>n.__isTeleport;function Fl(n,e){n.shapeFlag&6&&n.component?(n.transition=e,Fl(n.component.subTree,e)):n.shapeFlag&128?(n.ssContent.transition=e.clone(n.ssContent),n.ssFallback.transition=e.clone(n.ssFallback)):n.transition=e}function Ld(n){n.ids=[n.ids[0]+n.ids[2]+++"-",0,0]}function xs(n,e,t,r,s=!1){if(le(n)){n.forEach((V,M)=>xs(V,e&&(le(e)?e[M]:e),t,r,s));return}if(Vs(r)&&!s){r.shapeFlag&512&&r.type.__asyncResolved&&r.component.subTree.component&&xs(n,e,t,r.component.subTree);return}const i=r.shapeFlag&4?Vo(r.component):r.el,a=s?null:i,{i:l,r:c}=n,d=e&&e.r,f=l.refs===Re?l.refs={}:l.refs,m=l.setupState,E=Te(m),k=m===Re?()=>!1:V=>we(E,V);if(d!=null&&d!==c&&(je(d)?(f[d]=null,k(d)&&(m[d]=null)):ct(d)&&(d.value=null)),he(c))ni(c,l,12,[a,f]);else{const V=je(c),M=ct(c);if(V||M){const j=()=>{if(n.f){const X=V?k(c)?m[c]:f[c]:c.value;s?le(X)&&Sl(X,i):le(X)?X.includes(i)||X.push(i):V?(f[c]=[i],k(c)&&(m[c]=f[c])):(c.value=[i],n.k&&(f[n.k]=c.value))}else V?(f[c]=a,k(c)&&(m[c]=a)):M&&(c.value=a,n.k&&(f[n.k]=a))};a?(j.id=-1,wt(j,t)):j()}}}So().requestIdleCallback;So().cancelIdleCallback;const Vs=n=>!!n.type.__asyncLoader,Fd=n=>n.type.__isKeepAlive;function Fg(n,e){Ud(n,"a",e)}function Ug(n,e){Ud(n,"da",e)}function Ud(n,e,t=gt){const r=n.__wdc||(n.__wdc=()=>{let s=t;for(;s;){if(s.isDeactivated)return;s=s.parent}return n()});if(ko(e,r,t),t){let s=t.parent;for(;s&&s.parent;)Fd(s.parent.vnode)&&Bg(r,e,t,s),s=s.parent}}function Bg(n,e,t,r){const s=ko(e,n,r,!0);jd(()=>{Sl(r[e],s)},t)}function ko(n,e,t=gt,r=!1){if(t){const s=t[n]||(t[n]=[]),i=e.__weh||(e.__weh=(...a)=>{un();const l=ri(t),c=Gt(e,t,n,a);return l(),hn(),c});return r?s.unshift(i):s.push(i),i}}const yn=n=>(e,t=gt)=>{(!Ks||n==="sp")&&ko(n,(...r)=>e(...r),t)},jg=yn("bm"),Bd=yn("m"),$g=yn("bu"),qg=yn("u"),Hg=yn("bum"),jd=yn("um"),zg=yn("sp"),Wg=yn("rtg"),Kg=yn("rtc");function Gg(n,e=gt){ko("ec",n,e)}const Qg=Symbol.for("v-ndc");function Rr(n,e,t,r){let s;const i=t&&t[r],a=le(n);if(a||je(n)){const l=a&&Fr(n);let c=!1,d=!1;l&&(c=!kt(n),d=Bn(n),n=Po(n)),s=new Array(n.length);for(let f=0,m=n.length;f<m;f++)s[f]=e(c?d?eo(Je(n[f])):Je(n[f]):n[f],f,void 0,i&&i[f])}else if(typeof n=="number"){s=new Array(n);for(let l=0;l<n;l++)s[l]=e(l+1,l,void 0,i&&i[l])}else if(Ne(n))if(n[Symbol.iterator])s=Array.from(n,(l,c)=>e(l,c,void 0,i&&i[c]));else{const l=Object.keys(n);s=new Array(l.length);for(let c=0,d=l.length;c<d;c++){const f=l[c];s[c]=e(n[f],f,c,i&&i[c])}}else s=[];return t&&(t[r]=s),s}const Qa=n=>n?cf(n)?Vo(n):Qa(n.parent):null,Ns=et(Object.create(null),{$:n=>n,$el:n=>n.vnode.el,$data:n=>n.data,$props:n=>n.props,$attrs:n=>n.attrs,$slots:n=>n.slots,$refs:n=>n.refs,$parent:n=>Qa(n.parent),$root:n=>Qa(n.root),$host:n=>n.ce,$emit:n=>n.emit,$options:n=>Ul(n),$forceUpdate:n=>n.f||(n.f=()=>{Ll(n.update)}),$nextTick:n=>n.n||(n.n=xd.bind(n.proxy)),$watch:n=>__.bind(n)}),Ta=(n,e)=>n!==Re&&!n.__isScriptSetup&&we(n,e),Jg={get({_:n},e){if(e==="__v_skip")return!0;const{ctx:t,setupState:r,data:s,props:i,accessCache:a,type:l,appContext:c}=n;let d;if(e[0]!=="$"){const k=a[e];if(k!==void 0)switch(k){case 1:return r[e];case 2:return s[e];case 4:return t[e];case 3:return i[e]}else{if(Ta(r,e))return a[e]=1,r[e];if(s!==Re&&we(s,e))return a[e]=2,s[e];if((d=n.propsOptions[0])&&we(d,e))return a[e]=3,i[e];if(t!==Re&&we(t,e))return a[e]=4,t[e];Ja&&(a[e]=0)}}const f=Ns[e];let m,E;if(f)return e==="$attrs"&&at(n.attrs,"get",""),f(n);if((m=l.__cssModules)&&(m=m[e]))return m;if(t!==Re&&we(t,e))return a[e]=4,t[e];if(E=c.config.globalProperties,we(E,e))return E[e]},set({_:n},e,t){const{data:r,setupState:s,ctx:i}=n;return Ta(s,e)?(s[e]=t,!0):r!==Re&&we(r,e)?(r[e]=t,!0):we(n.props,e)||e[0]==="$"&&e.slice(1)in n?!1:(i[e]=t,!0)},has({_:{data:n,setupState:e,accessCache:t,ctx:r,appContext:s,propsOptions:i}},a){let l;return!!t[a]||n!==Re&&we(n,a)||Ta(e,a)||(l=i[0])&&we(l,a)||we(r,a)||we(Ns,a)||we(s.config.globalProperties,a)},defineProperty(n,e,t){return t.get!=null?n._.accessCache[e]=0:we(t,"value")&&this.set(n,e,t.value,null),Reflect.defineProperty(n,e,t)}};function Ru(n){return le(n)?n.reduce((e,t)=>(e[t]=null,e),{}):n}let Ja=!0;function Yg(n){const e=Ul(n),t=n.proxy,r=n.ctx;Ja=!1,e.beforeCreate&&Su(e.beforeCreate,n,"bc");const{data:s,computed:i,methods:a,watch:l,provide:c,inject:d,created:f,beforeMount:m,mounted:E,beforeUpdate:k,updated:V,activated:M,deactivated:j,beforeDestroy:X,beforeUnmount:ee,destroyed:te,unmounted:J,render:me,renderTracked:_e,renderTriggered:I,errorCaptured:g,serverPrefetch:v,expose:w,inheritAttrs:A,components:C,directives:y,filters:ht}=e;if(d&&Xg(d,r,null),a)for(const se in a){const ie=a[se];he(ie)&&(r[se]=ie.bind(t))}if(s){const se=s.call(t,t);Ne(se)&&(n.data=Nl(se))}if(Ja=!0,i)for(const se in i){const ie=i[se],De=he(ie)?ie.bind(t,t):he(ie.get)?ie.get.bind(t,t):Mt,Yt=!he(ie)&&he(ie.set)?ie.set.bind(t):Mt,St=F_({get:De,set:Yt});Object.defineProperty(r,se,{enumerable:!0,configurable:!0,get:()=>St.value,set:Le=>St.value=Le})}if(l)for(const se in l)$d(l[se],r,t,se);if(c){const se=he(c)?c.call(t):c;Reflect.ownKeys(se).forEach(ie=>{s_(ie,se[ie])})}f&&Su(f,n,"c");function de(se,ie){le(ie)?ie.forEach(De=>se(De.bind(t))):ie&&se(ie.bind(t))}if(de(jg,m),de(Bd,E),de($g,k),de(qg,V),de(Fg,M),de(Ug,j),de(Gg,g),de(Kg,_e),de(Wg,I),de(Hg,ee),de(jd,J),de(zg,v),le(w))if(w.length){const se=n.exposed||(n.exposed={});w.forEach(ie=>{Object.defineProperty(se,ie,{get:()=>t[ie],set:De=>t[ie]=De})})}else n.exposed||(n.exposed={});me&&n.render===Mt&&(n.render=me),A!=null&&(n.inheritAttrs=A),C&&(n.components=C),y&&(n.directives=y),v&&Ld(n)}function Xg(n,e,t=Mt){le(n)&&(n=Ya(n));for(const r in n){const s=n[r];let i;Ne(s)?"default"in s?i=$i(s.from||r,s.default,!0):i=$i(s.from||r):i=$i(s),ct(i)?Object.defineProperty(e,r,{enumerable:!0,configurable:!0,get:()=>i.value,set:a=>i.value=a}):e[r]=i}}function Su(n,e,t){Gt(le(n)?n.map(r=>r.bind(e.proxy)):n.bind(e.proxy),e,t)}function $d(n,e,t,r){let s=r.includes(".")?tf(t,r):()=>t[r];if(je(n)){const i=e[n];he(i)&&Ia(s,i)}else if(he(n))Ia(s,n.bind(t));else if(Ne(n))if(le(n))n.forEach(i=>$d(i,e,t,r));else{const i=he(n.handler)?n.handler.bind(t):e[n.handler];he(i)&&Ia(s,i,n)}}function Ul(n){const e=n.type,{mixins:t,extends:r}=e,{mixins:s,optionsCache:i,config:{optionMergeStrategies:a}}=n.appContext,l=i.get(e);let c;return l?c=l:!s.length&&!t&&!r?c=e:(c={},s.length&&s.forEach(d=>so(c,d,a,!0)),so(c,e,a)),Ne(e)&&i.set(e,c),c}function so(n,e,t,r=!1){const{mixins:s,extends:i}=e;i&&so(n,i,t,!0),s&&s.forEach(a=>so(n,a,t,!0));for(const a in e)if(!(r&&a==="expose")){const l=Zg[a]||t&&t[a];n[a]=l?l(n[a],e[a]):e[a]}return n}const Zg={data:Pu,props:Cu,emits:Cu,methods:bs,computed:bs,beforeCreate:pt,created:pt,beforeMount:pt,mounted:pt,beforeUpdate:pt,updated:pt,beforeDestroy:pt,beforeUnmount:pt,destroyed:pt,unmounted:pt,activated:pt,deactivated:pt,errorCaptured:pt,serverPrefetch:pt,components:bs,directives:bs,watch:t_,provide:Pu,inject:e_};function Pu(n,e){return e?n?function(){return et(he(n)?n.call(this,this):n,he(e)?e.call(this,this):e)}:e:n}function e_(n,e){return bs(Ya(n),Ya(e))}function Ya(n){if(le(n)){const e={};for(let t=0;t<n.length;t++)e[n[t]]=n[t];return e}return n}function pt(n,e){return n?[...new Set([].concat(n,e))]:e}function bs(n,e){return n?et(Object.create(null),n,e):e}function Cu(n,e){return n?le(n)&&le(e)?[...new Set([...n,...e])]:et(Object.create(null),Ru(n),Ru(e??{})):e}function t_(n,e){if(!n)return e;if(!e)return n;const t=et(Object.create(null),n);for(const r in e)t[r]=pt(n[r],e[r]);return t}function qd(){return{app:null,config:{isNativeTag:zm,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let n_=0;function r_(n,e){return function(r,s=null){he(r)||(r=et({},r)),s!=null&&!Ne(s)&&(s=null);const i=qd(),a=new WeakSet,l=[];let c=!1;const d=i.app={_uid:n_++,_component:r,_props:s,_container:null,_context:i,_instance:null,version:U_,get config(){return i.config},set config(f){},use(f,...m){return a.has(f)||(f&&he(f.install)?(a.add(f),f.install(d,...m)):he(f)&&(a.add(f),f(d,...m))),d},mixin(f){return i.mixins.includes(f)||i.mixins.push(f),d},component(f,m){return m?(i.components[f]=m,d):i.components[f]},directive(f,m){return m?(i.directives[f]=m,d):i.directives[f]},mount(f,m,E){if(!c){const k=d._ceVNode||cn(r,s);return k.appContext=i,E===!0?E="svg":E===!1&&(E=void 0),m&&e?e(k,f):n(k,f,E),c=!0,d._container=f,f.__vue_app__=d,Vo(k.component)}},onUnmount(f){l.push(f)},unmount(){c&&(Gt(l,d._instance,16),n(null,d._container),delete d._container.__vue_app__)},provide(f,m){return i.provides[f]=m,d},runWithContext(f){const m=Br;Br=d;try{return f()}finally{Br=m}}};return d}}let Br=null;function s_(n,e){if(gt){let t=gt.provides;const r=gt.parent&&gt.parent.provides;r===t&&(t=gt.provides=Object.create(r)),t[n]=e}}function $i(n,e,t=!1){const r=gt||Ct;if(r||Br){let s=Br?Br._context.provides:r?r.parent==null||r.ce?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:void 0;if(s&&n in s)return s[n];if(arguments.length>1)return t&&he(e)?e.call(r&&r.proxy):e}}const Hd={},zd=()=>Object.create(Hd),Wd=n=>Object.getPrototypeOf(n)===Hd;function i_(n,e,t,r=!1){const s={},i=zd();n.propsDefaults=Object.create(null),Kd(n,e,s,i);for(const a in n.propsOptions[0])a in s||(s[a]=void 0);t?n.props=r?s:wg(s):n.type.props?n.props=s:n.props=i,n.attrs=i}function o_(n,e,t,r){const{props:s,attrs:i,vnode:{patchFlag:a}}=n,l=Te(s),[c]=n.propsOptions;let d=!1;if((r||a>0)&&!(a&16)){if(a&8){const f=n.vnode.dynamicProps;for(let m=0;m<f.length;m++){let E=f[m];if(Do(n.emitsOptions,E))continue;const k=e[E];if(c)if(we(i,E))k!==i[E]&&(i[E]=k,d=!0);else{const V=Un(E);s[V]=Xa(c,l,V,k,n,!1)}else k!==i[E]&&(i[E]=k,d=!0)}}}else{Kd(n,e,s,i)&&(d=!0);let f;for(const m in l)(!e||!we(e,m)&&((f=Kn(m))===m||!we(e,f)))&&(c?t&&(t[m]!==void 0||t[f]!==void 0)&&(s[m]=Xa(c,l,m,void 0,n,!0)):delete s[m]);if(i!==l)for(const m in i)(!e||!we(e,m))&&(delete i[m],d=!0)}d&&nn(n.attrs,"set","")}function Kd(n,e,t,r){const[s,i]=n.propsOptions;let a=!1,l;if(e)for(let c in e){if(Cs(c))continue;const d=e[c];let f;s&&we(s,f=Un(c))?!i||!i.includes(f)?t[f]=d:(l||(l={}))[f]=d:Do(n.emitsOptions,c)||(!(c in r)||d!==r[c])&&(r[c]=d,a=!0)}if(i){const c=Te(t),d=l||Re;for(let f=0;f<i.length;f++){const m=i[f];t[m]=Xa(s,c,m,d[m],n,!we(d,m))}}return a}function Xa(n,e,t,r,s,i){const a=n[t];if(a!=null){const l=we(a,"default");if(l&&r===void 0){const c=a.default;if(a.type!==Function&&!a.skipFactory&&he(c)){const{propsDefaults:d}=s;if(t in d)r=d[t];else{const f=ri(s);r=d[t]=c.call(null,e),f()}}else r=c;s.ce&&s.ce._setProp(t,r)}a[0]&&(i&&!l?r=!1:a[1]&&(r===""||r===Kn(t))&&(r=!0))}return r}const a_=new WeakMap;function Gd(n,e,t=!1){const r=t?a_:e.propsCache,s=r.get(n);if(s)return s;const i=n.props,a={},l=[];let c=!1;if(!he(n)){const f=m=>{c=!0;const[E,k]=Gd(m,e,!0);et(a,E),k&&l.push(...k)};!t&&e.mixins.length&&e.mixins.forEach(f),n.extends&&f(n.extends),n.mixins&&n.mixins.forEach(f)}if(!i&&!c)return Ne(n)&&r.set(n,Mr),Mr;if(le(i))for(let f=0;f<i.length;f++){const m=Un(i[f]);ku(m)&&(a[m]=Re)}else if(i)for(const f in i){const m=Un(f);if(ku(m)){const E=i[f],k=a[m]=le(E)||he(E)?{type:E}:et({},E),V=k.type;let M=!1,j=!0;if(le(V))for(let X=0;X<V.length;++X){const ee=V[X],te=he(ee)&&ee.name;if(te==="Boolean"){M=!0;break}else te==="String"&&(j=!1)}else M=he(V)&&V.name==="Boolean";k[0]=M,k[1]=j,(M||we(k,"default"))&&l.push(m)}}const d=[a,l];return Ne(n)&&r.set(n,d),d}function ku(n){return n[0]!=="$"&&!Cs(n)}const Bl=n=>n[0]==="_"||n==="$stable",jl=n=>le(n)?n.map(qt):[qt(n)],l_=(n,e,t)=>{if(e._n)return e;const r=Og((...s)=>jl(e(...s)),t);return r._c=!1,r},Qd=(n,e,t)=>{const r=n._ctx;for(const s in n){if(Bl(s))continue;const i=n[s];if(he(i))e[s]=l_(s,i,r);else if(i!=null){const a=jl(i);e[s]=()=>a}}},Jd=(n,e)=>{const t=jl(e);n.slots.default=()=>t},Yd=(n,e,t)=>{for(const r in e)(t||!Bl(r))&&(n[r]=e[r])},c_=(n,e,t)=>{const r=n.slots=zd();if(n.vnode.shapeFlag&32){const s=e.__;s&&qa(r,"__",s,!0);const i=e._;i?(Yd(r,e,t),t&&qa(r,"_",i,!0)):Qd(e,r)}else e&&Jd(n,e)},u_=(n,e,t)=>{const{vnode:r,slots:s}=n;let i=!0,a=Re;if(r.shapeFlag&32){const l=e._;l?t&&l===1?i=!1:Yd(s,e,t):(i=!e.$stable,Qd(e,s)),a=e}else e&&(Jd(n,e),a={default:1});if(i)for(const l in s)!Bl(l)&&a[l]==null&&delete s[l]},wt=A_;function h_(n){return d_(n)}function d_(n,e){const t=So();t.__VUE__=!0;const{insert:r,remove:s,patchProp:i,createElement:a,createText:l,createComment:c,setText:d,setElementText:f,parentNode:m,nextSibling:E,setScopeId:k=Mt,insertStaticContent:V}=n,M=(_,T,x,B=null,O=null,L=null,W=void 0,q=null,$=!!T.dynamicChildren)=>{if(_===T)return;_&&!Ts(_,T)&&(B=ze(_),Le(_,O,L,!0),_=null),T.patchFlag===-2&&($=!1,T.dynamicChildren=null);const{type:b,ref:S,shapeFlag:R}=T;switch(b){case xo:j(_,T,x,B);break;case jn:X(_,T,x,B);break;case ba:_==null&&ee(T,x,B,W);break;case ot:C(_,T,x,B,O,L,W,q,$);break;default:R&1?me(_,T,x,B,O,L,W,q,$):R&6?y(_,T,x,B,O,L,W,q,$):(R&64||R&128)&&b.process(_,T,x,B,O,L,W,q,$,Et)}S!=null&&O?xs(S,_&&_.ref,L,T||_,!T):S==null&&_&&_.ref!=null&&xs(_.ref,null,L,_,!0)},j=(_,T,x,B)=>{if(_==null)r(T.el=l(T.children),x,B);else{const O=T.el=_.el;T.children!==_.children&&d(O,T.children)}},X=(_,T,x,B)=>{_==null?r(T.el=c(T.children||""),x,B):T.el=_.el},ee=(_,T,x,B)=>{[_.el,_.anchor]=V(_.children,T,x,B,_.el,_.anchor)},te=({el:_,anchor:T},x,B)=>{let O;for(;_&&_!==T;)O=E(_),r(_,x,B),_=O;r(T,x,B)},J=({el:_,anchor:T})=>{let x;for(;_&&_!==T;)x=E(_),s(_),_=x;s(T)},me=(_,T,x,B,O,L,W,q,$)=>{T.type==="svg"?W="svg":T.type==="math"&&(W="mathml"),_==null?_e(T,x,B,O,L,W,q,$):v(_,T,O,L,W,q,$)},_e=(_,T,x,B,O,L,W,q)=>{let $,b;const{props:S,shapeFlag:R,transition:N,dirs:K}=_;if($=_.el=a(_.type,L,S&&S.is,S),R&8?f($,_.children):R&16&&g(_.children,$,null,B,O,wa(_,L),W,q),K&&er(_,null,B,"created"),I($,_,_.scopeId,W,B),S){for(const G in S)G!=="value"&&!Cs(G)&&i($,G,null,S[G],L,B);"value"in S&&i($,"value",null,S.value,L),(b=S.onVnodeBeforeMount)&&jt(b,B,_)}K&&er(_,null,B,"beforeMount");const Q=f_(O,N);Q&&N.beforeEnter($),r($,T,x),((b=S&&S.onVnodeMounted)||Q||K)&&wt(()=>{b&&jt(b,B,_),Q&&N.enter($),K&&er(_,null,B,"mounted")},O)},I=(_,T,x,B,O)=>{if(x&&k(_,x),B)for(let L=0;L<B.length;L++)k(_,B[L]);if(O){let L=O.subTree;if(T===L||rf(L.type)&&(L.ssContent===T||L.ssFallback===T)){const W=O.vnode;I(_,W,W.scopeId,W.slotScopeIds,O.parent)}}},g=(_,T,x,B,O,L,W,q,$=0)=>{for(let b=$;b<_.length;b++){const S=_[b]=q?Rn(_[b]):qt(_[b]);M(null,S,T,x,B,O,L,W,q)}},v=(_,T,x,B,O,L,W)=>{const q=T.el=_.el;let{patchFlag:$,dynamicChildren:b,dirs:S}=T;$|=_.patchFlag&16;const R=_.props||Re,N=T.props||Re;let K;if(x&&tr(x,!1),(K=N.onVnodeBeforeUpdate)&&jt(K,x,T,_),S&&er(T,_,x,"beforeUpdate"),x&&tr(x,!0),(R.innerHTML&&N.innerHTML==null||R.textContent&&N.textContent==null)&&f(q,""),b?w(_.dynamicChildren,b,q,x,B,wa(T,O),L):W||ie(_,T,q,null,x,B,wa(T,O),L,!1),$>0){if($&16)A(q,R,N,x,O);else if($&2&&R.class!==N.class&&i(q,"class",null,N.class,O),$&4&&i(q,"style",R.style,N.style,O),$&8){const Q=T.dynamicProps;for(let G=0;G<Q.length;G++){const re=Q[G],Fe=R[re],Ve=N[re];(Ve!==Fe||re==="value")&&i(q,re,Fe,Ve,O,x)}}$&1&&_.children!==T.children&&f(q,T.children)}else!W&&b==null&&A(q,R,N,x,O);((K=N.onVnodeUpdated)||S)&&wt(()=>{K&&jt(K,x,T,_),S&&er(T,_,x,"updated")},B)},w=(_,T,x,B,O,L,W)=>{for(let q=0;q<T.length;q++){const $=_[q],b=T[q],S=$.el&&($.type===ot||!Ts($,b)||$.shapeFlag&198)?m($.el):x;M($,b,S,null,B,O,L,W,!0)}},A=(_,T,x,B,O)=>{if(T!==x){if(T!==Re)for(const L in T)!Cs(L)&&!(L in x)&&i(_,L,T[L],null,O,B);for(const L in x){if(Cs(L))continue;const W=x[L],q=T[L];W!==q&&L!=="value"&&i(_,L,q,W,O,B)}"value"in x&&i(_,"value",T.value,x.value,O)}},C=(_,T,x,B,O,L,W,q,$)=>{const b=T.el=_?_.el:l(""),S=T.anchor=_?_.anchor:l("");let{patchFlag:R,dynamicChildren:N,slotScopeIds:K}=T;K&&(q=q?q.concat(K):K),_==null?(r(b,x,B),r(S,x,B),g(T.children||[],x,S,O,L,W,q,$)):R>0&&R&64&&N&&_.dynamicChildren?(w(_.dynamicChildren,N,x,O,L,W,q),(T.key!=null||O&&T===O.subTree)&&Xd(_,T,!0)):ie(_,T,x,S,O,L,W,q,$)},y=(_,T,x,B,O,L,W,q,$)=>{T.slotScopeIds=q,_==null?T.shapeFlag&512?O.ctx.activate(T,x,B,W,$):ht(T,x,B,O,L,W,$):Ft(_,T,$)},ht=(_,T,x,B,O,L,W)=>{const q=_.component=x_(_,B,O);if(Fd(_)&&(q.ctx.renderer=Et),V_(q,!1,W),q.asyncDep){if(O&&O.registerDep(q,de,W),!_.el){const $=q.subTree=cn(jn);X(null,$,T,x)}}else de(q,_,T,x,O,L,W)},Ft=(_,T,x)=>{const B=T.component=_.component;if(w_(_,T,x))if(B.asyncDep&&!B.asyncResolved){se(B,T,x);return}else B.next=T,B.update();else T.el=_.el,B.vnode=T},de=(_,T,x,B,O,L,W)=>{const q=()=>{if(_.isMounted){let{next:R,bu:N,u:K,parent:Q,vnode:G}=_;{const $e=Zd(_);if($e){R&&(R.el=G.el,se(_,R,W)),$e.asyncDep.then(()=>{_.isUnmounted||q()});return}}let re=R,Fe;tr(_,!1),R?(R.el=G.el,se(_,R,W)):R=G,N&&ji(N),(Fe=R.props&&R.props.onVnodeBeforeUpdate)&&jt(Fe,Q,R,G),tr(_,!0);const Ve=Aa(_),dt=_.subTree;_.subTree=Ve,M(dt,Ve,m(dt.el),ze(dt),_,O,L),R.el=Ve.el,re===null&&I_(_,Ve.el),K&&wt(K,O),(Fe=R.props&&R.props.onVnodeUpdated)&&wt(()=>jt(Fe,Q,R,G),O)}else{let R;const{el:N,props:K}=T,{bm:Q,m:G,parent:re,root:Fe,type:Ve}=_,dt=Vs(T);if(tr(_,!1),Q&&ji(Q),!dt&&(R=K&&K.onVnodeBeforeMount)&&jt(R,re,T),tr(_,!0),N&&Bt){const $e=()=>{_.subTree=Aa(_),Bt(N,_.subTree,_,O,null)};dt&&Ve.__asyncHydrate?Ve.__asyncHydrate(N,_,$e):$e()}else{Fe.ce&&Fe.ce._def.shadowRoot!==!1&&Fe.ce._injectChildStyle(Ve);const $e=_.subTree=Aa(_);M(null,$e,x,B,_,O,L),T.el=$e.el}if(G&&wt(G,O),!dt&&(R=K&&K.onVnodeMounted)){const $e=T;wt(()=>jt(R,re,$e),O)}(T.shapeFlag&256||re&&Vs(re.vnode)&&re.vnode.shapeFlag&256)&&_.a&&wt(_.a,O),_.isMounted=!0,T=x=B=null}};_.scope.on();const $=_.effect=new md(q);_.scope.off();const b=_.update=$.run.bind($),S=_.job=$.runIfDirty.bind($);S.i=_,S.id=_.uid,$.scheduler=()=>Ll(S),tr(_,!0),b()},se=(_,T,x)=>{T.component=_;const B=_.vnode.props;_.vnode=T,_.next=null,o_(_,T.props,B,x),u_(_,T.children,x),un(),bu(_),hn()},ie=(_,T,x,B,O,L,W,q,$=!1)=>{const b=_&&_.children,S=_?_.shapeFlag:0,R=T.children,{patchFlag:N,shapeFlag:K}=T;if(N>0){if(N&128){Yt(b,R,x,B,O,L,W,q,$);return}else if(N&256){De(b,R,x,B,O,L,W,q,$);return}}K&8?(S&16&&xt(b,O,L),R!==b&&f(x,R)):S&16?K&16?Yt(b,R,x,B,O,L,W,q,$):xt(b,O,L,!0):(S&8&&f(x,""),K&16&&g(R,x,B,O,L,W,q,$))},De=(_,T,x,B,O,L,W,q,$)=>{_=_||Mr,T=T||Mr;const b=_.length,S=T.length,R=Math.min(b,S);let N;for(N=0;N<R;N++){const K=T[N]=$?Rn(T[N]):qt(T[N]);M(_[N],K,x,null,O,L,W,q,$)}b>S?xt(_,O,L,!0,!1,R):g(T,x,B,O,L,W,q,$,R)},Yt=(_,T,x,B,O,L,W,q,$)=>{let b=0;const S=T.length;let R=_.length-1,N=S-1;for(;b<=R&&b<=N;){const K=_[b],Q=T[b]=$?Rn(T[b]):qt(T[b]);if(Ts(K,Q))M(K,Q,x,null,O,L,W,q,$);else break;b++}for(;b<=R&&b<=N;){const K=_[R],Q=T[N]=$?Rn(T[N]):qt(T[N]);if(Ts(K,Q))M(K,Q,x,null,O,L,W,q,$);else break;R--,N--}if(b>R){if(b<=N){const K=N+1,Q=K<S?T[K].el:B;for(;b<=N;)M(null,T[b]=$?Rn(T[b]):qt(T[b]),x,Q,O,L,W,q,$),b++}}else if(b>N)for(;b<=R;)Le(_[b],O,L,!0),b++;else{const K=b,Q=b,G=new Map;for(b=Q;b<=N;b++){const Ke=T[b]=$?Rn(T[b]):qt(T[b]);Ke.key!=null&&G.set(Ke.key,b)}let re,Fe=0;const Ve=N-Q+1;let dt=!1,$e=0;const En=new Array(Ve);for(b=0;b<Ve;b++)En[b]=0;for(b=K;b<=R;b++){const Ke=_[b];if(Fe>=Ve){Le(Ke,O,L,!0);continue}let Pt;if(Ke.key!=null)Pt=G.get(Ke.key);else for(re=Q;re<=N;re++)if(En[re-Q]===0&&Ts(Ke,T[re])){Pt=re;break}Pt===void 0?Le(Ke,O,L,!0):(En[Pt-Q]=b+1,Pt>=$e?$e=Pt:dt=!0,M(Ke,T[Pt],x,null,O,L,W,q,$),Fe++)}const as=dt?p_(En):Mr;for(re=as.length-1,b=Ve-1;b>=0;b--){const Ke=Q+b,Pt=T[Ke],gi=Ke+1<S?T[Ke+1].el:B;En[b]===0?M(null,Pt,x,gi,O,L,W,q,$):dt&&(re<0||b!==as[re]?St(Pt,x,gi,2):re--)}}},St=(_,T,x,B,O=null)=>{const{el:L,type:W,transition:q,children:$,shapeFlag:b}=_;if(b&6){St(_.component.subTree,T,x,B);return}if(b&128){_.suspense.move(T,x,B);return}if(b&64){W.move(_,T,x,Et);return}if(W===ot){r(L,T,x);for(let R=0;R<$.length;R++)St($[R],T,x,B);r(_.anchor,T,x);return}if(W===ba){te(_,T,x);return}if(B!==2&&b&1&&q)if(B===0)q.beforeEnter(L),r(L,T,x),wt(()=>q.enter(L),O);else{const{leave:R,delayLeave:N,afterLeave:K}=q,Q=()=>{_.ctx.isUnmounted?s(L):r(L,T,x)},G=()=>{R(L,()=>{Q(),K&&K()})};N?N(L,Q,G):G()}else r(L,T,x)},Le=(_,T,x,B=!1,O=!1)=>{const{type:L,props:W,ref:q,children:$,dynamicChildren:b,shapeFlag:S,patchFlag:R,dirs:N,cacheIndex:K}=_;if(R===-2&&(O=!1),q!=null&&(un(),xs(q,null,x,_,!0),hn()),K!=null&&(T.renderCache[K]=void 0),S&256){T.ctx.deactivate(_);return}const Q=S&1&&N,G=!Vs(_);let re;if(G&&(re=W&&W.onVnodeBeforeUnmount)&&jt(re,T,_),S&6)Ut(_.component,x,B);else{if(S&128){_.suspense.unmount(x,B);return}Q&&er(_,null,T,"beforeUnmount"),S&64?_.type.remove(_,T,x,Et,B):b&&!b.hasOnce&&(L!==ot||R>0&&R&64)?xt(b,T,x,!1,!0):(L===ot&&R&384||!O&&S&16)&&xt($,T,x),B&&Ce(_)}(G&&(re=W&&W.onVnodeUnmounted)||Q)&&wt(()=>{re&&jt(re,T,_),Q&&er(_,null,T,"unmounted")},x)},Ce=_=>{const{type:T,el:x,anchor:B,transition:O}=_;if(T===ot){yr(x,B);return}if(T===ba){J(_);return}const L=()=>{s(x),O&&!O.persisted&&O.afterLeave&&O.afterLeave()};if(_.shapeFlag&1&&O&&!O.persisted){const{leave:W,delayLeave:q}=O,$=()=>W(x,L);q?q(_.el,L,$):$()}else L()},yr=(_,T)=>{let x;for(;_!==T;)x=E(_),s(_),_=x;s(T)},Ut=(_,T,x)=>{const{bum:B,scope:O,job:L,subTree:W,um:q,m:$,a:b,parent:S,slots:{__:R}}=_;Du($),Du(b),B&&ji(B),S&&le(R)&&R.forEach(N=>{S.renderCache[N]=void 0}),O.stop(),L&&(L.flags|=8,Le(W,_,T,x)),q&&wt(q,T),wt(()=>{_.isUnmounted=!0},T),T&&T.pendingBranch&&!T.isUnmounted&&_.asyncDep&&!_.asyncResolved&&_.suspenseId===T.pendingId&&(T.deps--,T.deps===0&&T.resolve())},xt=(_,T,x,B=!1,O=!1,L=0)=>{for(let W=L;W<_.length;W++)Le(_[W],T,x,B,O)},ze=_=>{if(_.shapeFlag&6)return ze(_.component.subTree);if(_.shapeFlag&128)return _.suspense.next();const T=E(_.anchor||_.el),x=T&&T[Mg];return x?E(x):T};let Vt=!1;const vr=(_,T,x)=>{_==null?T._vnode&&Le(T._vnode,null,null,!0):M(T._vnode||null,_,T,null,null,null,x),T._vnode=_,Vt||(Vt=!0,bu(),Nd(),Vt=!1)},Et={p:M,um:Le,m:St,r:Ce,mt:ht,mc:g,pc:ie,pbc:w,n:ze,o:n};let Nt,Bt;return e&&([Nt,Bt]=e(Et)),{render:vr,hydrate:Nt,createApp:r_(vr,Nt)}}function wa({type:n,props:e},t){return t==="svg"&&n==="foreignObject"||t==="mathml"&&n==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:t}function tr({effect:n,job:e},t){t?(n.flags|=32,e.flags|=4):(n.flags&=-33,e.flags&=-5)}function f_(n,e){return(!n||n&&!n.pendingBranch)&&e&&!e.persisted}function Xd(n,e,t=!1){const r=n.children,s=e.children;if(le(r)&&le(s))for(let i=0;i<r.length;i++){const a=r[i];let l=s[i];l.shapeFlag&1&&!l.dynamicChildren&&((l.patchFlag<=0||l.patchFlag===32)&&(l=s[i]=Rn(s[i]),l.el=a.el),!t&&l.patchFlag!==-2&&Xd(a,l)),l.type===xo&&(l.el=a.el),l.type===jn&&!l.el&&(l.el=a.el)}}function p_(n){const e=n.slice(),t=[0];let r,s,i,a,l;const c=n.length;for(r=0;r<c;r++){const d=n[r];if(d!==0){if(s=t[t.length-1],n[s]<d){e[r]=s,t.push(r);continue}for(i=0,a=t.length-1;i<a;)l=i+a>>1,n[t[l]]<d?i=l+1:a=l;d<n[t[i]]&&(i>0&&(e[r]=t[i-1]),t[i]=r)}}for(i=t.length,a=t[i-1];i-- >0;)t[i]=a,a=e[a];return t}function Zd(n){const e=n.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:Zd(e)}function Du(n){if(n)for(let e=0;e<n.length;e++)n[e].flags|=8}const m_=Symbol.for("v-scx"),g_=()=>$i(m_);function Ia(n,e,t){return ef(n,e,t)}function ef(n,e,t=Re){const{immediate:r,deep:s,flush:i,once:a}=t,l=et({},t),c=e&&r||!e&&i!=="post";let d;if(Ks){if(i==="sync"){const k=g_();d=k.__watcherHandles||(k.__watcherHandles=[])}else if(!c){const k=()=>{};return k.stop=Mt,k.resume=Mt,k.pause=Mt,k}}const f=gt;l.call=(k,V,M)=>Gt(k,f,V,M);let m=!1;i==="post"?l.scheduler=k=>{wt(k,f&&f.suspense)}:i!=="sync"&&(m=!0,l.scheduler=(k,V)=>{V?k():Ll(k)}),l.augmentJob=k=>{e&&(k.flags|=4),m&&(k.flags|=2,f&&(k.id=f.uid,k.i=f))};const E=Dg(n,e,l);return Ks&&(d?d.push(E):c&&E()),E}function __(n,e,t){const r=this.proxy,s=je(n)?n.includes(".")?tf(r,n):()=>r[n]:n.bind(r,r);let i;he(e)?i=e:(i=e.handler,t=e);const a=ri(this),l=ef(s,i.bind(r),t);return a(),l}function tf(n,e){const t=e.split(".");return()=>{let r=n;for(let s=0;s<t.length&&r;s++)r=r[t[s]];return r}}const y_=(n,e)=>e==="modelValue"||e==="model-value"?n.modelModifiers:n[`${e}Modifiers`]||n[`${Un(e)}Modifiers`]||n[`${Kn(e)}Modifiers`];function v_(n,e,...t){if(n.isUnmounted)return;const r=n.vnode.props||Re;let s=t;const i=e.startsWith("update:"),a=i&&y_(r,e.slice(7));a&&(a.trim&&(s=t.map(f=>je(f)?f.trim():f)),a.number&&(s=t.map(Ha)));let l,c=r[l=ga(e)]||r[l=ga(Un(e))];!c&&i&&(c=r[l=ga(Kn(e))]),c&&Gt(c,n,6,s);const d=r[l+"Once"];if(d){if(!n.emitted)n.emitted={};else if(n.emitted[l])return;n.emitted[l]=!0,Gt(d,n,6,s)}}function nf(n,e,t=!1){const r=e.emitsCache,s=r.get(n);if(s!==void 0)return s;const i=n.emits;let a={},l=!1;if(!he(n)){const c=d=>{const f=nf(d,e,!0);f&&(l=!0,et(a,f))};!t&&e.mixins.length&&e.mixins.forEach(c),n.extends&&c(n.extends),n.mixins&&n.mixins.forEach(c)}return!i&&!l?(Ne(n)&&r.set(n,null),null):(le(i)?i.forEach(c=>a[c]=null):et(a,i),Ne(n)&&r.set(n,a),a)}function Do(n,e){return!n||!Ao(e)?!1:(e=e.slice(2).replace(/Once$/,""),we(n,e[0].toLowerCase()+e.slice(1))||we(n,Kn(e))||we(n,e))}function Aa(n){const{type:e,vnode:t,proxy:r,withProxy:s,propsOptions:[i],slots:a,attrs:l,emit:c,render:d,renderCache:f,props:m,data:E,setupState:k,ctx:V,inheritAttrs:M}=n,j=ro(n);let X,ee;try{if(t.shapeFlag&4){const J=s||r,me=J;X=qt(d.call(me,J,f,m,k,E,V)),ee=l}else{const J=e;X=qt(J.length>1?J(m,{attrs:l,slots:a,emit:c}):J(m,null)),ee=e.props?l:E_(l)}}catch(J){Os.length=0,Co(J,n,1),X=cn(jn)}let te=X;if(ee&&M!==!1){const J=Object.keys(ee),{shapeFlag:me}=te;J.length&&me&7&&(i&&J.some(Rl)&&(ee=T_(ee,i)),te=zr(te,ee,!1,!0))}return t.dirs&&(te=zr(te,null,!1,!0),te.dirs=te.dirs?te.dirs.concat(t.dirs):t.dirs),t.transition&&Fl(te,t.transition),X=te,ro(j),X}const E_=n=>{let e;for(const t in n)(t==="class"||t==="style"||Ao(t))&&((e||(e={}))[t]=n[t]);return e},T_=(n,e)=>{const t={};for(const r in n)(!Rl(r)||!(r.slice(9)in e))&&(t[r]=n[r]);return t};function w_(n,e,t){const{props:r,children:s,component:i}=n,{props:a,children:l,patchFlag:c}=e,d=i.emitsOptions;if(e.dirs||e.transition)return!0;if(t&&c>=0){if(c&1024)return!0;if(c&16)return r?xu(r,a,d):!!a;if(c&8){const f=e.dynamicProps;for(let m=0;m<f.length;m++){const E=f[m];if(a[E]!==r[E]&&!Do(d,E))return!0}}}else return(s||l)&&(!l||!l.$stable)?!0:r===a?!1:r?a?xu(r,a,d):!0:!!a;return!1}function xu(n,e,t){const r=Object.keys(e);if(r.length!==Object.keys(n).length)return!0;for(let s=0;s<r.length;s++){const i=r[s];if(e[i]!==n[i]&&!Do(t,i))return!0}return!1}function I_({vnode:n,parent:e},t){for(;e;){const r=e.subTree;if(r.suspense&&r.suspense.activeBranch===n&&(r.el=n.el),r===n)(n=e.vnode).el=t,e=e.parent;else break}}const rf=n=>n.__isSuspense;function A_(n,e){e&&e.pendingBranch?le(n)?e.effects.push(...n):e.effects.push(n):Ng(n)}const ot=Symbol.for("v-fgt"),xo=Symbol.for("v-txt"),jn=Symbol.for("v-cmt"),ba=Symbol.for("v-stc"),Os=[];let It=null;function Ee(n=!1){Os.push(It=n?null:[])}function b_(){Os.pop(),It=Os[Os.length-1]||null}let Ws=1;function Vu(n,e=!1){Ws+=n,n<0&&It&&e&&(It.hasOnce=!0)}function sf(n){return n.dynamicChildren=Ws>0?It||Mr:null,b_(),Ws>0&&It&&It.push(n),n}function Ie(n,e,t,r,s,i){return sf(z(n,e,t,r,s,i,!0))}function of(n,e,t,r,s){return sf(cn(n,e,t,r,s,!0))}function af(n){return n?n.__v_isVNode===!0:!1}function Ts(n,e){return n.type===e.type&&n.key===e.key}const lf=({key:n})=>n??null,qi=({ref:n,ref_key:e,ref_for:t})=>(typeof n=="number"&&(n=""+n),n!=null?je(n)||ct(n)||he(n)?{i:Ct,r:n,k:e,f:!!t}:n:null);function z(n,e=null,t=null,r=0,s=null,i=n===ot?0:1,a=!1,l=!1){const c={__v_isVNode:!0,__v_skip:!0,type:n,props:e,key:e&&lf(e),ref:e&&qi(e),scopeId:Md,slotScopeIds:null,children:t,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:r,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:Ct};return l?($l(c,t),i&128&&n.normalize(c)):t&&(c.shapeFlag|=je(t)?8:16),Ws>0&&!a&&It&&(c.patchFlag>0||i&6)&&c.patchFlag!==32&&It.push(c),c}const cn=R_;function R_(n,e=null,t=null,r=0,s=null,i=!1){if((!n||n===Qg)&&(n=jn),af(n)){const l=zr(n,e,!0);return t&&$l(l,t),Ws>0&&!i&&It&&(l.shapeFlag&6?It[It.indexOf(n)]=l:It.push(l)),l.patchFlag=-2,l}if(L_(n)&&(n=n.__vccOpts),e){e=S_(e);let{class:l,style:c}=e;l&&!je(l)&&(e.class=$s(l)),Ne(c)&&(Ml(c)&&!le(c)&&(c=et({},c)),e.style=js(c))}const a=je(n)?1:rf(n)?128:Lg(n)?64:Ne(n)?4:he(n)?2:0;return z(n,e,t,r,s,a,i,!0)}function S_(n){return n?Ml(n)||Wd(n)?et({},n):n:null}function zr(n,e,t=!1,r=!1){const{props:s,ref:i,patchFlag:a,children:l,transition:c}=n,d=e?C_(s||{},e):s,f={__v_isVNode:!0,__v_skip:!0,type:n.type,props:d,key:d&&lf(d),ref:e&&e.ref?t&&i?le(i)?i.concat(qi(e)):[i,qi(e)]:qi(e):i,scopeId:n.scopeId,slotScopeIds:n.slotScopeIds,children:l,target:n.target,targetStart:n.targetStart,targetAnchor:n.targetAnchor,staticCount:n.staticCount,shapeFlag:n.shapeFlag,patchFlag:e&&n.type!==ot?a===-1?16:a|16:a,dynamicProps:n.dynamicProps,dynamicChildren:n.dynamicChildren,appContext:n.appContext,dirs:n.dirs,transition:c,component:n.component,suspense:n.suspense,ssContent:n.ssContent&&zr(n.ssContent),ssFallback:n.ssFallback&&zr(n.ssFallback),el:n.el,anchor:n.anchor,ctx:n.ctx,ce:n.ce};return c&&r&&Fl(f,c.clone(f)),f}function P_(n=" ",e=0){return cn(xo,null,n,e)}function Sr(n="",e=!1){return e?(Ee(),of(jn,null,n)):cn(jn,null,n)}function qt(n){return n==null||typeof n=="boolean"?cn(jn):le(n)?cn(ot,null,n.slice()):af(n)?Rn(n):cn(xo,null,String(n))}function Rn(n){return n.el===null&&n.patchFlag!==-1||n.memo?n:zr(n)}function $l(n,e){let t=0;const{shapeFlag:r}=n;if(e==null)e=null;else if(le(e))t=16;else if(typeof e=="object")if(r&65){const s=e.default;s&&(s._c&&(s._d=!1),$l(n,s()),s._c&&(s._d=!0));return}else{t=32;const s=e._;!s&&!Wd(e)?e._ctx=Ct:s===3&&Ct&&(Ct.slots._===1?e._=1:(e._=2,n.patchFlag|=1024))}else he(e)?(e={default:e,_ctx:Ct},t=32):(e=String(e),r&64?(t=16,e=[P_(e)]):t=8);n.children=e,n.shapeFlag|=t}function C_(...n){const e={};for(let t=0;t<n.length;t++){const r=n[t];for(const s in r)if(s==="class")e.class!==r.class&&(e.class=$s([e.class,r.class]));else if(s==="style")e.style=js([e.style,r.style]);else if(Ao(s)){const i=e[s],a=r[s];a&&i!==a&&!(le(i)&&i.includes(a))&&(e[s]=i?[].concat(i,a):a)}else s!==""&&(e[s]=r[s])}return e}function jt(n,e,t,r=null){Gt(n,e,7,[t,r])}const k_=qd();let D_=0;function x_(n,e,t){const r=n.type,s=(e?e.appContext:n.appContext)||k_,i={uid:D_++,vnode:n,type:r,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new ng(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:Gd(r,s),emitsOptions:nf(r,s),emit:null,emitted:null,propsDefaults:Re,inheritAttrs:r.inheritAttrs,ctx:Re,data:Re,props:Re,attrs:Re,slots:Re,refs:Re,setupState:Re,setupContext:null,suspense:t,suspenseId:t?t.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=e?e.root:i,i.emit=v_.bind(null,i),n.ce&&n.ce(i),i}let gt=null,io,Za;{const n=So(),e=(t,r)=>{let s;return(s=n[t])||(s=n[t]=[]),s.push(r),i=>{s.length>1?s.forEach(a=>a(i)):s[0](i)}};io=e("__VUE_INSTANCE_SETTERS__",t=>gt=t),Za=e("__VUE_SSR_SETTERS__",t=>Ks=t)}const ri=n=>{const e=gt;return io(n),n.scope.on(),()=>{n.scope.off(),io(e)}},Nu=()=>{gt&&gt.scope.off(),io(null)};function cf(n){return n.vnode.shapeFlag&4}let Ks=!1;function V_(n,e=!1,t=!1){e&&Za(e);const{props:r,children:s}=n.vnode,i=cf(n);i_(n,r,i,e),c_(n,s,t||e);const a=i?N_(n,e):void 0;return e&&Za(!1),a}function N_(n,e){const t=n.type;n.accessCache=Object.create(null),n.proxy=new Proxy(n.ctx,Jg);const{setup:r}=t;if(r){un();const s=n.setupContext=r.length>1?M_(n):null,i=ri(n),a=ni(r,n,0,[n.props,s]),l=ld(a);if(hn(),i(),(l||n.sp)&&!Vs(n)&&Ld(n),l){if(a.then(Nu,Nu),e)return a.then(c=>{Ou(n,c,e)}).catch(c=>{Co(c,n,0)});n.asyncDep=a}else Ou(n,a,e)}else uf(n,e)}function Ou(n,e,t){he(e)?n.type.__ssrInlineRender?n.ssrRender=e:n.render=e:Ne(e)&&(n.setupState=kd(e)),uf(n,t)}let Mu;function uf(n,e,t){const r=n.type;if(!n.render){if(!e&&Mu&&!r.render){const s=r.template||Ul(n).template;if(s){const{isCustomElement:i,compilerOptions:a}=n.appContext.config,{delimiters:l,compilerOptions:c}=r,d=et(et({isCustomElement:i,delimiters:l},a),c);r.render=Mu(s,d)}}n.render=r.render||Mt}{const s=ri(n);un();try{Yg(n)}finally{hn(),s()}}}const O_={get(n,e){return at(n,"get",""),n[e]}};function M_(n){const e=t=>{n.exposed=t||{}};return{attrs:new Proxy(n.attrs,O_),slots:n.slots,emit:n.emit,expose:e}}function Vo(n){return n.exposed?n.exposeProxy||(n.exposeProxy=new Proxy(kd(Ig(n.exposed)),{get(e,t){if(t in e)return e[t];if(t in Ns)return Ns[t](n)},has(e,t){return t in e||t in Ns}})):n.proxy}function L_(n){return he(n)&&"__vccOpts"in n}const F_=(n,e)=>Cg(n,e,Ks),U_="3.5.17";/**
* @vue/runtime-dom v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let el;const Lu=typeof window<"u"&&window.trustedTypes;if(Lu)try{el=Lu.createPolicy("vue",{createHTML:n=>n})}catch{}const hf=el?n=>el.createHTML(n):n=>n,B_="http://www.w3.org/2000/svg",j_="http://www.w3.org/1998/Math/MathML",tn=typeof document<"u"?document:null,Fu=tn&&tn.createElement("template"),$_={insert:(n,e,t)=>{e.insertBefore(n,t||null)},remove:n=>{const e=n.parentNode;e&&e.removeChild(n)},createElement:(n,e,t,r)=>{const s=e==="svg"?tn.createElementNS(B_,n):e==="mathml"?tn.createElementNS(j_,n):t?tn.createElement(n,{is:t}):tn.createElement(n);return n==="select"&&r&&r.multiple!=null&&s.setAttribute("multiple",r.multiple),s},createText:n=>tn.createTextNode(n),createComment:n=>tn.createComment(n),setText:(n,e)=>{n.nodeValue=e},setElementText:(n,e)=>{n.textContent=e},parentNode:n=>n.parentNode,nextSibling:n=>n.nextSibling,querySelector:n=>tn.querySelector(n),setScopeId(n,e){n.setAttribute(e,"")},insertStaticContent(n,e,t,r,s,i){const a=t?t.previousSibling:e.lastChild;if(s&&(s===i||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),t),!(s===i||!(s=s.nextSibling)););else{Fu.innerHTML=hf(r==="svg"?`<svg>${n}</svg>`:r==="mathml"?`<math>${n}</math>`:n);const l=Fu.content;if(r==="svg"||r==="mathml"){const c=l.firstChild;for(;c.firstChild;)l.appendChild(c.firstChild);l.removeChild(c)}e.insertBefore(l,t)}return[a?a.nextSibling:e.firstChild,t?t.previousSibling:e.lastChild]}},q_=Symbol("_vtc");function H_(n,e,t){const r=n[q_];r&&(e=(e?[e,...r]:[...r]).join(" ")),e==null?n.removeAttribute("class"):t?n.setAttribute("class",e):n.className=e}const Uu=Symbol("_vod"),z_=Symbol("_vsh"),W_=Symbol(""),K_=/(^|;)\s*display\s*:/;function G_(n,e,t){const r=n.style,s=je(t);let i=!1;if(t&&!s){if(e)if(je(e))for(const a of e.split(";")){const l=a.slice(0,a.indexOf(":")).trim();t[l]==null&&Hi(r,l,"")}else for(const a in e)t[a]==null&&Hi(r,a,"");for(const a in t)a==="display"&&(i=!0),Hi(r,a,t[a])}else if(s){if(e!==t){const a=r[W_];a&&(t+=";"+a),r.cssText=t,i=K_.test(t)}}else e&&n.removeAttribute("style");Uu in n&&(n[Uu]=i?r.display:"",n[z_]&&(r.display="none"))}const Bu=/\s*!important$/;function Hi(n,e,t){if(le(t))t.forEach(r=>Hi(n,e,r));else if(t==null&&(t=""),e.startsWith("--"))n.setProperty(e,t);else{const r=Q_(n,e);Bu.test(t)?n.setProperty(Kn(r),t.replace(Bu,""),"important"):n[r]=t}}const ju=["Webkit","Moz","ms"],Ra={};function Q_(n,e){const t=Ra[e];if(t)return t;let r=Un(e);if(r!=="filter"&&r in n)return Ra[e]=r;r=hd(r);for(let s=0;s<ju.length;s++){const i=ju[s]+r;if(i in n)return Ra[e]=i}return e}const $u="http://www.w3.org/1999/xlink";function qu(n,e,t,r,s,i=tg(e)){r&&e.startsWith("xlink:")?t==null?n.removeAttributeNS($u,e.slice(6,e.length)):n.setAttributeNS($u,e,t):t==null||i&&!dd(t)?n.removeAttribute(e):n.setAttribute(e,i?"":Wn(t)?String(t):t)}function Hu(n,e,t,r,s){if(e==="innerHTML"||e==="textContent"){t!=null&&(n[e]=e==="innerHTML"?hf(t):t);return}const i=n.tagName;if(e==="value"&&i!=="PROGRESS"&&!i.includes("-")){const l=i==="OPTION"?n.getAttribute("value")||"":n.value,c=t==null?n.type==="checkbox"?"on":"":String(t);(l!==c||!("_value"in n))&&(n.value=c),t==null&&n.removeAttribute(e),n._value=t;return}let a=!1;if(t===""||t==null){const l=typeof n[e];l==="boolean"?t=dd(t):t==null&&l==="string"?(t="",a=!0):l==="number"&&(t=0,a=!0)}try{n[e]=t}catch{}a&&n.removeAttribute(s||e)}function Dr(n,e,t,r){n.addEventListener(e,t,r)}function J_(n,e,t,r){n.removeEventListener(e,t,r)}const zu=Symbol("_vei");function Y_(n,e,t,r,s=null){const i=n[zu]||(n[zu]={}),a=i[e];if(r&&a)a.value=r;else{const[l,c]=X_(e);if(r){const d=i[e]=ty(r,s);Dr(n,l,d,c)}else a&&(J_(n,l,a,c),i[e]=void 0)}}const Wu=/(?:Once|Passive|Capture)$/;function X_(n){let e;if(Wu.test(n)){e={};let r;for(;r=n.match(Wu);)n=n.slice(0,n.length-r[0].length),e[r[0].toLowerCase()]=!0}return[n[2]===":"?n.slice(3):Kn(n.slice(2)),e]}let Sa=0;const Z_=Promise.resolve(),ey=()=>Sa||(Z_.then(()=>Sa=0),Sa=Date.now());function ty(n,e){const t=r=>{if(!r._vts)r._vts=Date.now();else if(r._vts<=t.attached)return;Gt(ny(r,t.value),e,5,[r])};return t.value=n,t.attached=ey(),t}function ny(n,e){if(le(e)){const t=n.stopImmediatePropagation;return n.stopImmediatePropagation=()=>{t.call(n),n._stopped=!0},e.map(r=>s=>!s._stopped&&r&&r(s))}else return e}const Ku=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&n.charCodeAt(2)>96&&n.charCodeAt(2)<123,ry=(n,e,t,r,s,i)=>{const a=s==="svg";e==="class"?H_(n,r,a):e==="style"?G_(n,t,r):Ao(e)?Rl(e)||Y_(n,e,t,r,i):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):sy(n,e,r,a))?(Hu(n,e,r),!n.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&qu(n,e,r,a,i,e!=="value")):n._isVueCE&&(/[A-Z]/.test(e)||!je(r))?Hu(n,Un(e),r,i,e):(e==="true-value"?n._trueValue=r:e==="false-value"&&(n._falseValue=r),qu(n,e,r,a))};function sy(n,e,t,r){if(r)return!!(e==="innerHTML"||e==="textContent"||e in n&&Ku(e)&&he(t));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="form"||e==="list"&&n.tagName==="INPUT"||e==="type"&&n.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=n.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return Ku(e)&&je(t)?!1:e in n}const Gu=n=>{const e=n.props["onUpdate:modelValue"]||!1;return le(e)?t=>ji(e,t):e};function iy(n){n.target.composing=!0}function Qu(n){const e=n.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const Pa=Symbol("_assign"),Pr={created(n,{modifiers:{lazy:e,trim:t,number:r}},s){n[Pa]=Gu(s);const i=r||s.props&&s.props.type==="number";Dr(n,e?"change":"input",a=>{if(a.target.composing)return;let l=n.value;t&&(l=l.trim()),i&&(l=Ha(l)),n[Pa](l)}),t&&Dr(n,"change",()=>{n.value=n.value.trim()}),e||(Dr(n,"compositionstart",iy),Dr(n,"compositionend",Qu),Dr(n,"change",Qu))},mounted(n,{value:e}){n.value=e??""},beforeUpdate(n,{value:e,oldValue:t,modifiers:{lazy:r,trim:s,number:i}},a){if(n[Pa]=Gu(a),n.composing)return;const l=(i||n.type==="number")&&!/^0\d/.test(n.value)?Ha(n.value):n.value,c=e??"";l!==c&&(document.activeElement===n&&n.type!=="range"&&(r&&e===t||s&&n.value.trim()===c)||(n.value=c))}},oy={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},Cr=(n,e)=>{const t=n._withKeys||(n._withKeys={}),r=e.join(".");return t[r]||(t[r]=s=>{if(!("key"in s))return;const i=Kn(s.key);if(e.some(a=>a===i||oy[a]===i))return n(s)})},ay=et({patchProp:ry},$_);let Ju;function ly(){return Ju||(Ju=h_(ay))}const cy=(...n)=>{const e=ly().createApp(...n),{mount:t}=e;return e.mount=r=>{const s=hy(r);if(!s)return;const i=e._component;!he(i)&&!i.render&&!i.template&&(i.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const a=t(s,!1,uy(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),a},e};function uy(n){if(n instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&n instanceof MathMLElement)return"mathml"}function hy(n){return je(n)?document.querySelector(n):n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const df=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},dy=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],a=n[t++],l=n[t++],c=((s&7)<<18|(i&63)<<12|(a&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const i=n[t++],a=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},ff={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],a=s+1<n.length,l=a?n[s+1]:0,c=s+2<n.length,d=c?n[s+2]:0,f=i>>2,m=(i&3)<<4|l>>4;let E=(l&15)<<2|d>>6,k=d&63;c||(k=64,a||(E=64)),r.push(t[f],t[m],t[E],t[k])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(df(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):dy(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],l=s<n.length?t[n.charAt(s)]:0;++s;const d=s<n.length?t[n.charAt(s)]:64;++s;const m=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||l==null||d==null||m==null)throw new fy;const E=i<<2|l>>4;if(r.push(E),d!==64){const k=l<<4&240|d>>2;if(r.push(k),m!==64){const V=d<<6&192|m;r.push(V)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class fy extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const py=function(n){const e=df(n);return ff.encodeByteArray(e,!0)},oo=function(n){return py(n).replace(/\./g,"")},pf=function(n){try{return ff.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function my(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gy=()=>my().__FIREBASE_DEFAULTS__,_y=()=>{if(typeof process>"u"||typeof process.env>"u")return;const n={}.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},yy=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&pf(n[1]);return e&&JSON.parse(e)},No=()=>{try{return gy()||_y()||yy()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},mf=n=>{var e,t;return(t=(e=No())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},vy=n=>{const e=mf(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},gf=()=>{var n;return(n=No())===null||n===void 0?void 0:n.config},_f=n=>{var e;return(e=No())===null||e===void 0?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ey{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ty(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},n),l="";return[oo(JSON.stringify(t)),oo(JSON.stringify(a)),l].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ut(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function wy(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ut())}function Iy(){var n;const e=(n=No())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Ay(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function by(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Ry(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Sy(){const n=ut();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Py(){return!Iy()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Cy(){try{return typeof indexedDB=="object"}catch{return!1}}function ky(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dy="FirebaseError";class vn extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Dy,Object.setPrototypeOf(this,vn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,si.prototype.create)}}class si{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?xy(i,r):"Error",l=`${this.serviceName}: ${a} (${s}).`;return new vn(s,l,r)}}function xy(n,e){return n.replace(Vy,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const Vy=/\{\$([^}]+)}/g;function Ny(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function ao(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],a=e[s];if(Yu(i)&&Yu(a)){if(!ao(i,a))return!1}else if(i!==a)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Yu(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ii(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Oy(n,e){const t=new My(n,e);return t.subscribe.bind(t)}class My{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Ly(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=Ca),s.error===void 0&&(s.error=Ca),s.complete===void 0&&(s.complete=Ca);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Ly(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Ca(){}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _t(n){return n&&n._delegate?n._delegate:n}class lr{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sr="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fy{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Ey;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(By(e))try{this.getOrInitializeService({instanceIdentifier:sr})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=sr){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=sr){return this.instances.has(e)}getOptions(e=sr){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,a]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(i);r===l&&a.resolve(s)}return s}onInit(e,t){var r;const s=this.normalizeInstanceIdentifier(t),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const a=this.instances.get(s);return a&&e(a,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Uy(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=sr){return this.component?this.component.multipleInstances?e:sr:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Uy(n){return n===sr?void 0:n}function By(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jy{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Fy(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var pe;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(pe||(pe={}));const $y={debug:pe.DEBUG,verbose:pe.VERBOSE,info:pe.INFO,warn:pe.WARN,error:pe.ERROR,silent:pe.SILENT},qy=pe.INFO,Hy={[pe.DEBUG]:"log",[pe.VERBOSE]:"log",[pe.INFO]:"info",[pe.WARN]:"warn",[pe.ERROR]:"error"},zy=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=Hy[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class ql{constructor(e){this.name=e,this._logLevel=qy,this._logHandler=zy,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in pe))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?$y[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,pe.DEBUG,...e),this._logHandler(this,pe.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,pe.VERBOSE,...e),this._logHandler(this,pe.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,pe.INFO,...e),this._logHandler(this,pe.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,pe.WARN,...e),this._logHandler(this,pe.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,pe.ERROR,...e),this._logHandler(this,pe.ERROR,...e)}}const Wy=(n,e)=>e.some(t=>n instanceof t);let Xu,Zu;function Ky(){return Xu||(Xu=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Gy(){return Zu||(Zu=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const yf=new WeakMap,tl=new WeakMap,vf=new WeakMap,ka=new WeakMap,Hl=new WeakMap;function Qy(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",i),n.removeEventListener("error",a)},i=()=>{t(Vn(n.result)),s()},a=()=>{r(n.error),s()};n.addEventListener("success",i),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&yf.set(t,n)}).catch(()=>{}),Hl.set(e,n),e}function Jy(n){if(tl.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",a),n.removeEventListener("abort",a)},i=()=>{t(),s()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",i),n.addEventListener("error",a),n.addEventListener("abort",a)});tl.set(n,e)}let nl={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return tl.get(n);if(e==="objectStoreNames")return n.objectStoreNames||vf.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Vn(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function Yy(n){nl=n(nl)}function Xy(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(Da(this),e,...t);return vf.set(r,e.sort?e.sort():[e]),Vn(r)}:Gy().includes(n)?function(...e){return n.apply(Da(this),e),Vn(yf.get(this))}:function(...e){return Vn(n.apply(Da(this),e))}}function Zy(n){return typeof n=="function"?Xy(n):(n instanceof IDBTransaction&&Jy(n),Wy(n,Ky())?new Proxy(n,nl):n)}function Vn(n){if(n instanceof IDBRequest)return Qy(n);if(ka.has(n))return ka.get(n);const e=Zy(n);return e!==n&&(ka.set(n,e),Hl.set(e,n)),e}const Da=n=>Hl.get(n);function ev(n,e,{blocked:t,upgrade:r,blocking:s,terminated:i}={}){const a=indexedDB.open(n,e),l=Vn(a);return r&&a.addEventListener("upgradeneeded",c=>{r(Vn(a.result),c.oldVersion,c.newVersion,Vn(a.transaction),c)}),t&&a.addEventListener("blocked",c=>t(c.oldVersion,c.newVersion,c)),l.then(c=>{i&&c.addEventListener("close",()=>i()),s&&c.addEventListener("versionchange",d=>s(d.oldVersion,d.newVersion,d))}).catch(()=>{}),l}const tv=["get","getKey","getAll","getAllKeys","count"],nv=["put","add","delete","clear"],xa=new Map;function eh(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(xa.get(e))return xa.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=nv.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||tv.includes(t)))return;const i=async function(a,...l){const c=this.transaction(a,s?"readwrite":"readonly");let d=c.store;return r&&(d=d.index(l.shift())),(await Promise.all([d[t](...l),s&&c.done]))[0]};return xa.set(e,i),i}Yy(n=>({...n,get:(e,t,r)=>eh(e,t)||n.get(e,t,r),has:(e,t)=>!!eh(e,t)||n.has(e,t)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rv{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(sv(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function sv(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const rl="@firebase/app",th="0.10.13";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dn=new ql("@firebase/app"),iv="@firebase/app-compat",ov="@firebase/analytics-compat",av="@firebase/analytics",lv="@firebase/app-check-compat",cv="@firebase/app-check",uv="@firebase/auth",hv="@firebase/auth-compat",dv="@firebase/database",fv="@firebase/data-connect",pv="@firebase/database-compat",mv="@firebase/functions",gv="@firebase/functions-compat",_v="@firebase/installations",yv="@firebase/installations-compat",vv="@firebase/messaging",Ev="@firebase/messaging-compat",Tv="@firebase/performance",wv="@firebase/performance-compat",Iv="@firebase/remote-config",Av="@firebase/remote-config-compat",bv="@firebase/storage",Rv="@firebase/storage-compat",Sv="@firebase/firestore",Pv="@firebase/vertexai-preview",Cv="@firebase/firestore-compat",kv="firebase",Dv="10.14.1";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sl="[DEFAULT]",xv={[rl]:"fire-core",[iv]:"fire-core-compat",[av]:"fire-analytics",[ov]:"fire-analytics-compat",[cv]:"fire-app-check",[lv]:"fire-app-check-compat",[uv]:"fire-auth",[hv]:"fire-auth-compat",[dv]:"fire-rtdb",[fv]:"fire-data-connect",[pv]:"fire-rtdb-compat",[mv]:"fire-fn",[gv]:"fire-fn-compat",[_v]:"fire-iid",[yv]:"fire-iid-compat",[vv]:"fire-fcm",[Ev]:"fire-fcm-compat",[Tv]:"fire-perf",[wv]:"fire-perf-compat",[Iv]:"fire-rc",[Av]:"fire-rc-compat",[bv]:"fire-gcs",[Rv]:"fire-gcs-compat",[Sv]:"fire-fst",[Cv]:"fire-fst-compat",[Pv]:"fire-vertex","fire-js":"fire-js",[kv]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const lo=new Map,Vv=new Map,il=new Map;function nh(n,e){try{n.container.addComponent(e)}catch(t){dn.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Wr(n){const e=n.name;if(il.has(e))return dn.debug(`There were multiple attempts to register component ${e}.`),!1;il.set(e,n);for(const t of lo.values())nh(t,n);for(const t of Vv.values())nh(t,n);return!0}function zl(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function sn(n){return n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nv={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Nn=new si("app","Firebase",Nv);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ov{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new lr("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Nn.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const es=Dv;function Ef(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:sl,automaticDataCollectionEnabled:!1},e),s=r.name;if(typeof s!="string"||!s)throw Nn.create("bad-app-name",{appName:String(s)});if(t||(t=gf()),!t)throw Nn.create("no-options");const i=lo.get(s);if(i){if(ao(t,i.options)&&ao(r,i.config))return i;throw Nn.create("duplicate-app",{appName:s})}const a=new jy(s);for(const c of il.values())a.addComponent(c);const l=new Ov(t,r,a);return lo.set(s,l),l}function Tf(n=sl){const e=lo.get(n);if(!e&&n===sl&&gf())return Ef();if(!e)throw Nn.create("no-app",{appName:n});return e}function On(n,e,t){var r;let s=(r=xv[n])!==null&&r!==void 0?r:n;t&&(s+=`-${t}`);const i=s.match(/\s|\//),a=e.match(/\s|\//);if(i||a){const l=[`Unable to register library "${s}" with version "${e}":`];i&&l.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&a&&l.push("and"),a&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),dn.warn(l.join(" "));return}Wr(new lr(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Mv="firebase-heartbeat-database",Lv=1,Gs="firebase-heartbeat-store";let Va=null;function wf(){return Va||(Va=ev(Mv,Lv,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Gs)}catch(t){console.warn(t)}}}}).catch(n=>{throw Nn.create("idb-open",{originalErrorMessage:n.message})})),Va}async function Fv(n){try{const t=(await wf()).transaction(Gs),r=await t.objectStore(Gs).get(If(n));return await t.done,r}catch(e){if(e instanceof vn)dn.warn(e.message);else{const t=Nn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});dn.warn(t.message)}}}async function rh(n,e){try{const r=(await wf()).transaction(Gs,"readwrite");await r.objectStore(Gs).put(e,If(n)),await r.done}catch(t){if(t instanceof vn)dn.warn(t.message);else{const r=Nn.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});dn.warn(r.message)}}}function If(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Uv=1024,Bv=30*24*60*60*1e3;class jv{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new qv(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=sh();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const l=new Date(a.date).valueOf();return Date.now()-l<=Bv}),this._storage.overwrite(this._heartbeatsCache))}catch(r){dn.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=sh(),{heartbeatsToSend:r,unsentEntries:s}=$v(this._heartbeatsCache.heartbeats),i=oo(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return dn.warn(t),""}}}function sh(){return new Date().toISOString().substring(0,10)}function $v(n,e=Uv){const t=[];let r=n.slice();for(const s of n){const i=t.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),ih(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),ih(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class qv{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Cy()?ky().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Fv(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return rh(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return rh(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function ih(n){return oo(JSON.stringify({version:2,heartbeats:n})).length}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Hv(n){Wr(new lr("platform-logger",e=>new rv(e),"PRIVATE")),Wr(new lr("heartbeat",e=>new jv(e),"PRIVATE")),On(rl,th,n),On(rl,th,"esm2017"),On("fire-js","")}Hv("");var zv="firebase",Wv="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */On(zv,Wv,"app");var oh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var ar,Af;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(I,g){function v(){}v.prototype=g.prototype,I.D=g.prototype,I.prototype=new v,I.prototype.constructor=I,I.C=function(w,A,C){for(var y=Array(arguments.length-2),ht=2;ht<arguments.length;ht++)y[ht-2]=arguments[ht];return g.prototype[A].apply(w,y)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(I,g,v){v||(v=0);var w=Array(16);if(typeof g=="string")for(var A=0;16>A;++A)w[A]=g.charCodeAt(v++)|g.charCodeAt(v++)<<8|g.charCodeAt(v++)<<16|g.charCodeAt(v++)<<24;else for(A=0;16>A;++A)w[A]=g[v++]|g[v++]<<8|g[v++]<<16|g[v++]<<24;g=I.g[0],v=I.g[1],A=I.g[2];var C=I.g[3],y=g+(C^v&(A^C))+w[0]+3614090360&4294967295;g=v+(y<<7&4294967295|y>>>25),y=C+(A^g&(v^A))+w[1]+3905402710&4294967295,C=g+(y<<12&4294967295|y>>>20),y=A+(v^C&(g^v))+w[2]+606105819&4294967295,A=C+(y<<17&4294967295|y>>>15),y=v+(g^A&(C^g))+w[3]+3250441966&4294967295,v=A+(y<<22&4294967295|y>>>10),y=g+(C^v&(A^C))+w[4]+4118548399&4294967295,g=v+(y<<7&4294967295|y>>>25),y=C+(A^g&(v^A))+w[5]+1200080426&4294967295,C=g+(y<<12&4294967295|y>>>20),y=A+(v^C&(g^v))+w[6]+2821735955&4294967295,A=C+(y<<17&4294967295|y>>>15),y=v+(g^A&(C^g))+w[7]+4249261313&4294967295,v=A+(y<<22&4294967295|y>>>10),y=g+(C^v&(A^C))+w[8]+1770035416&4294967295,g=v+(y<<7&4294967295|y>>>25),y=C+(A^g&(v^A))+w[9]+2336552879&4294967295,C=g+(y<<12&4294967295|y>>>20),y=A+(v^C&(g^v))+w[10]+4294925233&4294967295,A=C+(y<<17&4294967295|y>>>15),y=v+(g^A&(C^g))+w[11]+2304563134&4294967295,v=A+(y<<22&4294967295|y>>>10),y=g+(C^v&(A^C))+w[12]+1804603682&4294967295,g=v+(y<<7&4294967295|y>>>25),y=C+(A^g&(v^A))+w[13]+4254626195&4294967295,C=g+(y<<12&4294967295|y>>>20),y=A+(v^C&(g^v))+w[14]+2792965006&4294967295,A=C+(y<<17&4294967295|y>>>15),y=v+(g^A&(C^g))+w[15]+1236535329&4294967295,v=A+(y<<22&4294967295|y>>>10),y=g+(A^C&(v^A))+w[1]+4129170786&4294967295,g=v+(y<<5&4294967295|y>>>27),y=C+(v^A&(g^v))+w[6]+3225465664&4294967295,C=g+(y<<9&4294967295|y>>>23),y=A+(g^v&(C^g))+w[11]+643717713&4294967295,A=C+(y<<14&4294967295|y>>>18),y=v+(C^g&(A^C))+w[0]+3921069994&4294967295,v=A+(y<<20&4294967295|y>>>12),y=g+(A^C&(v^A))+w[5]+3593408605&4294967295,g=v+(y<<5&4294967295|y>>>27),y=C+(v^A&(g^v))+w[10]+38016083&4294967295,C=g+(y<<9&4294967295|y>>>23),y=A+(g^v&(C^g))+w[15]+3634488961&4294967295,A=C+(y<<14&4294967295|y>>>18),y=v+(C^g&(A^C))+w[4]+3889429448&4294967295,v=A+(y<<20&4294967295|y>>>12),y=g+(A^C&(v^A))+w[9]+568446438&4294967295,g=v+(y<<5&4294967295|y>>>27),y=C+(v^A&(g^v))+w[14]+3275163606&4294967295,C=g+(y<<9&4294967295|y>>>23),y=A+(g^v&(C^g))+w[3]+4107603335&4294967295,A=C+(y<<14&4294967295|y>>>18),y=v+(C^g&(A^C))+w[8]+1163531501&4294967295,v=A+(y<<20&4294967295|y>>>12),y=g+(A^C&(v^A))+w[13]+2850285829&4294967295,g=v+(y<<5&4294967295|y>>>27),y=C+(v^A&(g^v))+w[2]+4243563512&4294967295,C=g+(y<<9&4294967295|y>>>23),y=A+(g^v&(C^g))+w[7]+1735328473&4294967295,A=C+(y<<14&4294967295|y>>>18),y=v+(C^g&(A^C))+w[12]+2368359562&4294967295,v=A+(y<<20&4294967295|y>>>12),y=g+(v^A^C)+w[5]+4294588738&4294967295,g=v+(y<<4&4294967295|y>>>28),y=C+(g^v^A)+w[8]+2272392833&4294967295,C=g+(y<<11&4294967295|y>>>21),y=A+(C^g^v)+w[11]+1839030562&4294967295,A=C+(y<<16&4294967295|y>>>16),y=v+(A^C^g)+w[14]+4259657740&4294967295,v=A+(y<<23&4294967295|y>>>9),y=g+(v^A^C)+w[1]+2763975236&4294967295,g=v+(y<<4&4294967295|y>>>28),y=C+(g^v^A)+w[4]+1272893353&4294967295,C=g+(y<<11&4294967295|y>>>21),y=A+(C^g^v)+w[7]+4139469664&4294967295,A=C+(y<<16&4294967295|y>>>16),y=v+(A^C^g)+w[10]+3200236656&4294967295,v=A+(y<<23&4294967295|y>>>9),y=g+(v^A^C)+w[13]+681279174&4294967295,g=v+(y<<4&4294967295|y>>>28),y=C+(g^v^A)+w[0]+3936430074&4294967295,C=g+(y<<11&4294967295|y>>>21),y=A+(C^g^v)+w[3]+3572445317&4294967295,A=C+(y<<16&4294967295|y>>>16),y=v+(A^C^g)+w[6]+76029189&4294967295,v=A+(y<<23&4294967295|y>>>9),y=g+(v^A^C)+w[9]+3654602809&4294967295,g=v+(y<<4&4294967295|y>>>28),y=C+(g^v^A)+w[12]+3873151461&4294967295,C=g+(y<<11&4294967295|y>>>21),y=A+(C^g^v)+w[15]+530742520&4294967295,A=C+(y<<16&4294967295|y>>>16),y=v+(A^C^g)+w[2]+3299628645&4294967295,v=A+(y<<23&4294967295|y>>>9),y=g+(A^(v|~C))+w[0]+4096336452&4294967295,g=v+(y<<6&4294967295|y>>>26),y=C+(v^(g|~A))+w[7]+1126891415&4294967295,C=g+(y<<10&4294967295|y>>>22),y=A+(g^(C|~v))+w[14]+2878612391&4294967295,A=C+(y<<15&4294967295|y>>>17),y=v+(C^(A|~g))+w[5]+4237533241&4294967295,v=A+(y<<21&4294967295|y>>>11),y=g+(A^(v|~C))+w[12]+1700485571&4294967295,g=v+(y<<6&4294967295|y>>>26),y=C+(v^(g|~A))+w[3]+2399980690&4294967295,C=g+(y<<10&4294967295|y>>>22),y=A+(g^(C|~v))+w[10]+4293915773&4294967295,A=C+(y<<15&4294967295|y>>>17),y=v+(C^(A|~g))+w[1]+2240044497&4294967295,v=A+(y<<21&4294967295|y>>>11),y=g+(A^(v|~C))+w[8]+1873313359&4294967295,g=v+(y<<6&4294967295|y>>>26),y=C+(v^(g|~A))+w[15]+4264355552&4294967295,C=g+(y<<10&4294967295|y>>>22),y=A+(g^(C|~v))+w[6]+2734768916&4294967295,A=C+(y<<15&4294967295|y>>>17),y=v+(C^(A|~g))+w[13]+1309151649&4294967295,v=A+(y<<21&4294967295|y>>>11),y=g+(A^(v|~C))+w[4]+4149444226&4294967295,g=v+(y<<6&4294967295|y>>>26),y=C+(v^(g|~A))+w[11]+3174756917&4294967295,C=g+(y<<10&4294967295|y>>>22),y=A+(g^(C|~v))+w[2]+718787259&4294967295,A=C+(y<<15&4294967295|y>>>17),y=v+(C^(A|~g))+w[9]+3951481745&4294967295,I.g[0]=I.g[0]+g&4294967295,I.g[1]=I.g[1]+(A+(y<<21&4294967295|y>>>11))&4294967295,I.g[2]=I.g[2]+A&4294967295,I.g[3]=I.g[3]+C&4294967295}r.prototype.u=function(I,g){g===void 0&&(g=I.length);for(var v=g-this.blockSize,w=this.B,A=this.h,C=0;C<g;){if(A==0)for(;C<=v;)s(this,I,C),C+=this.blockSize;if(typeof I=="string"){for(;C<g;)if(w[A++]=I.charCodeAt(C++),A==this.blockSize){s(this,w),A=0;break}}else for(;C<g;)if(w[A++]=I[C++],A==this.blockSize){s(this,w),A=0;break}}this.h=A,this.o+=g},r.prototype.v=function(){var I=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);I[0]=128;for(var g=1;g<I.length-8;++g)I[g]=0;var v=8*this.o;for(g=I.length-8;g<I.length;++g)I[g]=v&255,v/=256;for(this.u(I),I=Array(16),g=v=0;4>g;++g)for(var w=0;32>w;w+=8)I[v++]=this.g[g]>>>w&255;return I};function i(I,g){var v=l;return Object.prototype.hasOwnProperty.call(v,I)?v[I]:v[I]=g(I)}function a(I,g){this.h=g;for(var v=[],w=!0,A=I.length-1;0<=A;A--){var C=I[A]|0;w&&C==g||(v[A]=C,w=!1)}this.g=v}var l={};function c(I){return-128<=I&&128>I?i(I,function(g){return new a([g|0],0>g?-1:0)}):new a([I|0],0>I?-1:0)}function d(I){if(isNaN(I)||!isFinite(I))return m;if(0>I)return j(d(-I));for(var g=[],v=1,w=0;I>=v;w++)g[w]=I/v|0,v*=4294967296;return new a(g,0)}function f(I,g){if(I.length==0)throw Error("number format error: empty string");if(g=g||10,2>g||36<g)throw Error("radix out of range: "+g);if(I.charAt(0)=="-")return j(f(I.substring(1),g));if(0<=I.indexOf("-"))throw Error('number format error: interior "-" character');for(var v=d(Math.pow(g,8)),w=m,A=0;A<I.length;A+=8){var C=Math.min(8,I.length-A),y=parseInt(I.substring(A,A+C),g);8>C?(C=d(Math.pow(g,C)),w=w.j(C).add(d(y))):(w=w.j(v),w=w.add(d(y)))}return w}var m=c(0),E=c(1),k=c(16777216);n=a.prototype,n.m=function(){if(M(this))return-j(this).m();for(var I=0,g=1,v=0;v<this.g.length;v++){var w=this.i(v);I+=(0<=w?w:4294967296+w)*g,g*=4294967296}return I},n.toString=function(I){if(I=I||10,2>I||36<I)throw Error("radix out of range: "+I);if(V(this))return"0";if(M(this))return"-"+j(this).toString(I);for(var g=d(Math.pow(I,6)),v=this,w="";;){var A=J(v,g).g;v=X(v,A.j(g));var C=((0<v.g.length?v.g[0]:v.h)>>>0).toString(I);if(v=A,V(v))return C+w;for(;6>C.length;)C="0"+C;w=C+w}},n.i=function(I){return 0>I?0:I<this.g.length?this.g[I]:this.h};function V(I){if(I.h!=0)return!1;for(var g=0;g<I.g.length;g++)if(I.g[g]!=0)return!1;return!0}function M(I){return I.h==-1}n.l=function(I){return I=X(this,I),M(I)?-1:V(I)?0:1};function j(I){for(var g=I.g.length,v=[],w=0;w<g;w++)v[w]=~I.g[w];return new a(v,~I.h).add(E)}n.abs=function(){return M(this)?j(this):this},n.add=function(I){for(var g=Math.max(this.g.length,I.g.length),v=[],w=0,A=0;A<=g;A++){var C=w+(this.i(A)&65535)+(I.i(A)&65535),y=(C>>>16)+(this.i(A)>>>16)+(I.i(A)>>>16);w=y>>>16,C&=65535,y&=65535,v[A]=y<<16|C}return new a(v,v[v.length-1]&-2147483648?-1:0)};function X(I,g){return I.add(j(g))}n.j=function(I){if(V(this)||V(I))return m;if(M(this))return M(I)?j(this).j(j(I)):j(j(this).j(I));if(M(I))return j(this.j(j(I)));if(0>this.l(k)&&0>I.l(k))return d(this.m()*I.m());for(var g=this.g.length+I.g.length,v=[],w=0;w<2*g;w++)v[w]=0;for(w=0;w<this.g.length;w++)for(var A=0;A<I.g.length;A++){var C=this.i(w)>>>16,y=this.i(w)&65535,ht=I.i(A)>>>16,Ft=I.i(A)&65535;v[2*w+2*A]+=y*Ft,ee(v,2*w+2*A),v[2*w+2*A+1]+=C*Ft,ee(v,2*w+2*A+1),v[2*w+2*A+1]+=y*ht,ee(v,2*w+2*A+1),v[2*w+2*A+2]+=C*ht,ee(v,2*w+2*A+2)}for(w=0;w<g;w++)v[w]=v[2*w+1]<<16|v[2*w];for(w=g;w<2*g;w++)v[w]=0;return new a(v,0)};function ee(I,g){for(;(I[g]&65535)!=I[g];)I[g+1]+=I[g]>>>16,I[g]&=65535,g++}function te(I,g){this.g=I,this.h=g}function J(I,g){if(V(g))throw Error("division by zero");if(V(I))return new te(m,m);if(M(I))return g=J(j(I),g),new te(j(g.g),j(g.h));if(M(g))return g=J(I,j(g)),new te(j(g.g),g.h);if(30<I.g.length){if(M(I)||M(g))throw Error("slowDivide_ only works with positive integers.");for(var v=E,w=g;0>=w.l(I);)v=me(v),w=me(w);var A=_e(v,1),C=_e(w,1);for(w=_e(w,2),v=_e(v,2);!V(w);){var y=C.add(w);0>=y.l(I)&&(A=A.add(v),C=y),w=_e(w,1),v=_e(v,1)}return g=X(I,A.j(g)),new te(A,g)}for(A=m;0<=I.l(g);){for(v=Math.max(1,Math.floor(I.m()/g.m())),w=Math.ceil(Math.log(v)/Math.LN2),w=48>=w?1:Math.pow(2,w-48),C=d(v),y=C.j(g);M(y)||0<y.l(I);)v-=w,C=d(v),y=C.j(g);V(C)&&(C=E),A=A.add(C),I=X(I,y)}return new te(A,I)}n.A=function(I){return J(this,I).h},n.and=function(I){for(var g=Math.max(this.g.length,I.g.length),v=[],w=0;w<g;w++)v[w]=this.i(w)&I.i(w);return new a(v,this.h&I.h)},n.or=function(I){for(var g=Math.max(this.g.length,I.g.length),v=[],w=0;w<g;w++)v[w]=this.i(w)|I.i(w);return new a(v,this.h|I.h)},n.xor=function(I){for(var g=Math.max(this.g.length,I.g.length),v=[],w=0;w<g;w++)v[w]=this.i(w)^I.i(w);return new a(v,this.h^I.h)};function me(I){for(var g=I.g.length+1,v=[],w=0;w<g;w++)v[w]=I.i(w)<<1|I.i(w-1)>>>31;return new a(v,I.h)}function _e(I,g){var v=g>>5;g%=32;for(var w=I.g.length-v,A=[],C=0;C<w;C++)A[C]=0<g?I.i(C+v)>>>g|I.i(C+v+1)<<32-g:I.i(C+v);return new a(A,I.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,Af=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=f,ar=a}).apply(typeof oh<"u"?oh:typeof self<"u"?self:typeof window<"u"?window:{});var Oi=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var bf,Rs,Rf,zi,ol,Sf,Pf,Cf;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,u,h){return o==Array.prototype||o==Object.prototype||(o[u]=h.value),o};function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Oi=="object"&&Oi];for(var u=0;u<o.length;++u){var h=o[u];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var r=t(this);function s(o,u){if(u)e:{var h=r;o=o.split(".");for(var p=0;p<o.length-1;p++){var P=o[p];if(!(P in h))break e;h=h[P]}o=o[o.length-1],p=h[o],u=u(p),u!=p&&u!=null&&e(h,o,{configurable:!0,writable:!0,value:u})}}function i(o,u){o instanceof String&&(o+="");var h=0,p=!1,P={next:function(){if(!p&&h<o.length){var D=h++;return{value:u(D,o[D]),done:!1}}return p=!0,{done:!0,value:void 0}}};return P[Symbol.iterator]=function(){return P},P}s("Array.prototype.values",function(o){return o||function(){return i(this,function(u,h){return h})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},l=this||self;function c(o){var u=typeof o;return u=u!="object"?u:o?Array.isArray(o)?"array":u:"null",u=="array"||u=="object"&&typeof o.length=="number"}function d(o){var u=typeof o;return u=="object"&&o!=null||u=="function"}function f(o,u,h){return o.call.apply(o.bind,arguments)}function m(o,u,h){if(!o)throw Error();if(2<arguments.length){var p=Array.prototype.slice.call(arguments,2);return function(){var P=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(P,p),o.apply(u,P)}}return function(){return o.apply(u,arguments)}}function E(o,u,h){return E=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:m,E.apply(null,arguments)}function k(o,u){var h=Array.prototype.slice.call(arguments,1);return function(){var p=h.slice();return p.push.apply(p,arguments),o.apply(this,p)}}function V(o,u){function h(){}h.prototype=u.prototype,o.aa=u.prototype,o.prototype=new h,o.prototype.constructor=o,o.Qb=function(p,P,D){for(var H=Array(arguments.length-2),be=2;be<arguments.length;be++)H[be-2]=arguments[be];return u.prototype[P].apply(p,H)}}function M(o){const u=o.length;if(0<u){const h=Array(u);for(let p=0;p<u;p++)h[p]=o[p];return h}return[]}function j(o,u){for(let h=1;h<arguments.length;h++){const p=arguments[h];if(c(p)){const P=o.length||0,D=p.length||0;o.length=P+D;for(let H=0;H<D;H++)o[P+H]=p[H]}else o.push(p)}}class X{constructor(u,h){this.i=u,this.j=h,this.h=0,this.g=null}get(){let u;return 0<this.h?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function ee(o){return/^[\s\xa0]*$/.test(o)}function te(){var o=l.navigator;return o&&(o=o.userAgent)?o:""}function J(o){return J[" "](o),o}J[" "]=function(){};var me=te().indexOf("Gecko")!=-1&&!(te().toLowerCase().indexOf("webkit")!=-1&&te().indexOf("Edge")==-1)&&!(te().indexOf("Trident")!=-1||te().indexOf("MSIE")!=-1)&&te().indexOf("Edge")==-1;function _e(o,u,h){for(const p in o)u.call(h,o[p],p,o)}function I(o,u){for(const h in o)u.call(void 0,o[h],h,o)}function g(o){const u={};for(const h in o)u[h]=o[h];return u}const v="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function w(o,u){let h,p;for(let P=1;P<arguments.length;P++){p=arguments[P];for(h in p)o[h]=p[h];for(let D=0;D<v.length;D++)h=v[D],Object.prototype.hasOwnProperty.call(p,h)&&(o[h]=p[h])}}function A(o){var u=1;o=o.split(":");const h=[];for(;0<u&&o.length;)h.push(o.shift()),u--;return o.length&&h.push(o.join(":")),h}function C(o){l.setTimeout(()=>{throw o},0)}function y(){var o=De;let u=null;return o.g&&(u=o.g,o.g=o.g.next,o.g||(o.h=null),u.next=null),u}class ht{constructor(){this.h=this.g=null}add(u,h){const p=Ft.get();p.set(u,h),this.h?this.h.next=p:this.g=p,this.h=p}}var Ft=new X(()=>new de,o=>o.reset());class de{constructor(){this.next=this.g=this.h=null}set(u,h){this.h=u,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let se,ie=!1,De=new ht,Yt=()=>{const o=l.Promise.resolve(void 0);se=()=>{o.then(St)}};var St=()=>{for(var o;o=y();){try{o.h.call(o.g)}catch(h){C(h)}var u=Ft;u.j(o),100>u.h&&(u.h++,o.next=u.g,u.g=o)}ie=!1};function Le(){this.s=this.s,this.C=this.C}Le.prototype.s=!1,Le.prototype.ma=function(){this.s||(this.s=!0,this.N())},Le.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Ce(o,u){this.type=o,this.g=this.target=u,this.defaultPrevented=!1}Ce.prototype.h=function(){this.defaultPrevented=!0};var yr=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var o=!1,u=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const h=()=>{};l.addEventListener("test",h,u),l.removeEventListener("test",h,u)}catch{}return o}();function Ut(o,u){if(Ce.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var h=this.type=o.type,p=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=u,u=o.relatedTarget){if(me){e:{try{J(u.nodeName);var P=!0;break e}catch{}P=!1}P||(u=null)}}else h=="mouseover"?u=o.fromElement:h=="mouseout"&&(u=o.toElement);this.relatedTarget=u,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:xt[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&Ut.aa.h.call(this)}}V(Ut,Ce);var xt={2:"touch",3:"pen",4:"mouse"};Ut.prototype.h=function(){Ut.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var ze="closure_listenable_"+(1e6*Math.random()|0),Vt=0;function vr(o,u,h,p,P){this.listener=o,this.proxy=null,this.src=u,this.type=h,this.capture=!!p,this.ha=P,this.key=++Vt,this.da=this.fa=!1}function Et(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function Nt(o){this.src=o,this.g={},this.h=0}Nt.prototype.add=function(o,u,h,p,P){var D=o.toString();o=this.g[D],o||(o=this.g[D]=[],this.h++);var H=_(o,u,p,P);return-1<H?(u=o[H],h||(u.fa=!1)):(u=new vr(u,this.src,D,!!p,P),u.fa=h,o.push(u)),u};function Bt(o,u){var h=u.type;if(h in o.g){var p=o.g[h],P=Array.prototype.indexOf.call(p,u,void 0),D;(D=0<=P)&&Array.prototype.splice.call(p,P,1),D&&(Et(u),o.g[h].length==0&&(delete o.g[h],o.h--))}}function _(o,u,h,p){for(var P=0;P<o.length;++P){var D=o[P];if(!D.da&&D.listener==u&&D.capture==!!h&&D.ha==p)return P}return-1}var T="closure_lm_"+(1e6*Math.random()|0),x={};function B(o,u,h,p,P){if(p&&p.once)return W(o,u,h,p,P);if(Array.isArray(u)){for(var D=0;D<u.length;D++)B(o,u[D],h,p,P);return null}return h=K(h),o&&o[ze]?o.K(u,h,d(p)?!!p.capture:!!p,P):O(o,u,h,!1,p,P)}function O(o,u,h,p,P,D){if(!u)throw Error("Invalid event type");var H=d(P)?!!P.capture:!!P,be=R(o);if(be||(o[T]=be=new Nt(o)),h=be.add(u,h,p,H,D),h.proxy)return h;if(p=L(),h.proxy=p,p.src=o,p.listener=h,o.addEventListener)yr||(P=H),P===void 0&&(P=!1),o.addEventListener(u.toString(),p,P);else if(o.attachEvent)o.attachEvent(b(u.toString()),p);else if(o.addListener&&o.removeListener)o.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return h}function L(){function o(h){return u.call(o.src,o.listener,h)}const u=S;return o}function W(o,u,h,p,P){if(Array.isArray(u)){for(var D=0;D<u.length;D++)W(o,u[D],h,p,P);return null}return h=K(h),o&&o[ze]?o.L(u,h,d(p)?!!p.capture:!!p,P):O(o,u,h,!0,p,P)}function q(o,u,h,p,P){if(Array.isArray(u))for(var D=0;D<u.length;D++)q(o,u[D],h,p,P);else p=d(p)?!!p.capture:!!p,h=K(h),o&&o[ze]?(o=o.i,u=String(u).toString(),u in o.g&&(D=o.g[u],h=_(D,h,p,P),-1<h&&(Et(D[h]),Array.prototype.splice.call(D,h,1),D.length==0&&(delete o.g[u],o.h--)))):o&&(o=R(o))&&(u=o.g[u.toString()],o=-1,u&&(o=_(u,h,p,P)),(h=-1<o?u[o]:null)&&$(h))}function $(o){if(typeof o!="number"&&o&&!o.da){var u=o.src;if(u&&u[ze])Bt(u.i,o);else{var h=o.type,p=o.proxy;u.removeEventListener?u.removeEventListener(h,p,o.capture):u.detachEvent?u.detachEvent(b(h),p):u.addListener&&u.removeListener&&u.removeListener(p),(h=R(u))?(Bt(h,o),h.h==0&&(h.src=null,u[T]=null)):Et(o)}}}function b(o){return o in x?x[o]:x[o]="on"+o}function S(o,u){if(o.da)o=!0;else{u=new Ut(u,this);var h=o.listener,p=o.ha||o.src;o.fa&&$(o),o=h.call(p,u)}return o}function R(o){return o=o[T],o instanceof Nt?o:null}var N="__closure_events_fn_"+(1e9*Math.random()>>>0);function K(o){return typeof o=="function"?o:(o[N]||(o[N]=function(u){return o.handleEvent(u)}),o[N])}function Q(){Le.call(this),this.i=new Nt(this),this.M=this,this.F=null}V(Q,Le),Q.prototype[ze]=!0,Q.prototype.removeEventListener=function(o,u,h,p){q(this,o,u,h,p)};function G(o,u){var h,p=o.F;if(p)for(h=[];p;p=p.F)h.push(p);if(o=o.M,p=u.type||u,typeof u=="string")u=new Ce(u,o);else if(u instanceof Ce)u.target=u.target||o;else{var P=u;u=new Ce(p,o),w(u,P)}if(P=!0,h)for(var D=h.length-1;0<=D;D--){var H=u.g=h[D];P=re(H,p,!0,u)&&P}if(H=u.g=o,P=re(H,p,!0,u)&&P,P=re(H,p,!1,u)&&P,h)for(D=0;D<h.length;D++)H=u.g=h[D],P=re(H,p,!1,u)&&P}Q.prototype.N=function(){if(Q.aa.N.call(this),this.i){var o=this.i,u;for(u in o.g){for(var h=o.g[u],p=0;p<h.length;p++)Et(h[p]);delete o.g[u],o.h--}}this.F=null},Q.prototype.K=function(o,u,h,p){return this.i.add(String(o),u,!1,h,p)},Q.prototype.L=function(o,u,h,p){return this.i.add(String(o),u,!0,h,p)};function re(o,u,h,p){if(u=o.i.g[String(u)],!u)return!0;u=u.concat();for(var P=!0,D=0;D<u.length;++D){var H=u[D];if(H&&!H.da&&H.capture==h){var be=H.listener,Ge=H.ha||H.src;H.fa&&Bt(o.i,H),P=be.call(Ge,p)!==!1&&P}}return P&&!p.defaultPrevented}function Fe(o,u,h){if(typeof o=="function")h&&(o=E(o,h));else if(o&&typeof o.handleEvent=="function")o=E(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(u)?-1:l.setTimeout(o,u||0)}function Ve(o){o.g=Fe(()=>{o.g=null,o.i&&(o.i=!1,Ve(o))},o.l);const u=o.h;o.h=null,o.m.apply(null,u)}class dt extends Le{constructor(u,h){super(),this.m=u,this.l=h,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:Ve(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function $e(o){Le.call(this),this.h=o,this.g={}}V($e,Le);var En=[];function as(o){_e(o.g,function(u,h){this.g.hasOwnProperty(h)&&$(u)},o),o.g={}}$e.prototype.N=function(){$e.aa.N.call(this),as(this)},$e.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Ke=l.JSON.stringify,Pt=l.JSON.parse,gi=class{stringify(o){return l.JSON.stringify(o,void 0)}parse(o){return l.JSON.parse(o,void 0)}};function ta(){}ta.prototype.h=null;function Dc(o){return o.h||(o.h=o.i())}function xc(){}var ls={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function na(){Ce.call(this,"d")}V(na,Ce);function ra(){Ce.call(this,"c")}V(ra,Ce);var Jn={},Vc=null;function _i(){return Vc=Vc||new Q}Jn.La="serverreachability";function Nc(o){Ce.call(this,Jn.La,o)}V(Nc,Ce);function cs(o){const u=_i();G(u,new Nc(u))}Jn.STAT_EVENT="statevent";function Oc(o,u){Ce.call(this,Jn.STAT_EVENT,o),this.stat=u}V(Oc,Ce);function ft(o){const u=_i();G(u,new Oc(u,o))}Jn.Ma="timingevent";function Mc(o,u){Ce.call(this,Jn.Ma,o),this.size=u}V(Mc,Ce);function us(o,u){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){o()},u)}function hs(){this.g=!0}hs.prototype.xa=function(){this.g=!1};function wm(o,u,h,p,P,D){o.info(function(){if(o.g)if(D)for(var H="",be=D.split("&"),Ge=0;Ge<be.length;Ge++){var ye=be[Ge].split("=");if(1<ye.length){var nt=ye[0];ye=ye[1];var rt=nt.split("_");H=2<=rt.length&&rt[1]=="type"?H+(nt+"="+ye+"&"):H+(nt+"=redacted&")}}else H=null;else H=D;return"XMLHTTP REQ ("+p+") [attempt "+P+"]: "+u+`
`+h+`
`+H})}function Im(o,u,h,p,P,D,H){o.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+P+"]: "+u+`
`+h+`
`+D+" "+H})}function Er(o,u,h,p){o.info(function(){return"XMLHTTP TEXT ("+u+"): "+bm(o,h)+(p?" "+p:"")})}function Am(o,u){o.info(function(){return"TIMEOUT: "+u})}hs.prototype.info=function(){};function bm(o,u){if(!o.g)return u;if(!u)return null;try{var h=JSON.parse(u);if(h){for(o=0;o<h.length;o++)if(Array.isArray(h[o])){var p=h[o];if(!(2>p.length)){var P=p[1];if(Array.isArray(P)&&!(1>P.length)){var D=P[0];if(D!="noop"&&D!="stop"&&D!="close")for(var H=1;H<P.length;H++)P[H]=""}}}}return Ke(h)}catch{return u}}var yi={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Lc={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},sa;function vi(){}V(vi,ta),vi.prototype.g=function(){return new XMLHttpRequest},vi.prototype.i=function(){return{}},sa=new vi;function Tn(o,u,h,p){this.j=o,this.i=u,this.l=h,this.R=p||1,this.U=new $e(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Fc}function Fc(){this.i=null,this.g="",this.h=!1}var Uc={},ia={};function oa(o,u,h){o.L=1,o.v=Ii(Xt(u)),o.m=h,o.P=!0,Bc(o,null)}function Bc(o,u){o.F=Date.now(),Ei(o),o.A=Xt(o.v);var h=o.A,p=o.R;Array.isArray(p)||(p=[String(p)]),eu(h.i,"t",p),o.C=0,h=o.j.J,o.h=new Fc,o.g=yu(o.j,h?u:null,!o.m),0<o.O&&(o.M=new dt(E(o.Y,o,o.g),o.O)),u=o.U,h=o.g,p=o.ca;var P="readystatechange";Array.isArray(P)||(P&&(En[0]=P.toString()),P=En);for(var D=0;D<P.length;D++){var H=B(h,P[D],p||u.handleEvent,!1,u.h||u);if(!H)break;u.g[H.key]=H}u=o.H?g(o.H):{},o.m?(o.u||(o.u="POST"),u["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,u)):(o.u="GET",o.g.ea(o.A,o.u,null,u)),cs(),wm(o.i,o.u,o.A,o.l,o.R,o.m)}Tn.prototype.ca=function(o){o=o.target;const u=this.M;u&&Zt(o)==3?u.j():this.Y(o)},Tn.prototype.Y=function(o){try{if(o==this.g)e:{const rt=Zt(this.g);var u=this.g.Ba();const Ir=this.g.Z();if(!(3>rt)&&(rt!=3||this.g&&(this.h.h||this.g.oa()||au(this.g)))){this.J||rt!=4||u==7||(u==8||0>=Ir?cs(3):cs(2)),aa(this);var h=this.g.Z();this.X=h;t:if(jc(this)){var p=au(this.g);o="";var P=p.length,D=Zt(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Yn(this),ds(this);var H="";break t}this.h.i=new l.TextDecoder}for(u=0;u<P;u++)this.h.h=!0,o+=this.h.i.decode(p[u],{stream:!(D&&u==P-1)});p.length=0,this.h.g+=o,this.C=0,H=this.h.g}else H=this.g.oa();if(this.o=h==200,Im(this.i,this.u,this.A,this.l,this.R,rt,h),this.o){if(this.T&&!this.K){t:{if(this.g){var be,Ge=this.g;if((be=Ge.g?Ge.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!ee(be)){var ye=be;break t}}ye=null}if(h=ye)Er(this.i,this.l,h,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,la(this,h);else{this.o=!1,this.s=3,ft(12),Yn(this),ds(this);break e}}if(this.P){h=!0;let Ot;for(;!this.J&&this.C<H.length;)if(Ot=Rm(this,H),Ot==ia){rt==4&&(this.s=4,ft(14),h=!1),Er(this.i,this.l,null,"[Incomplete Response]");break}else if(Ot==Uc){this.s=4,ft(15),Er(this.i,this.l,H,"[Invalid Chunk]"),h=!1;break}else Er(this.i,this.l,Ot,null),la(this,Ot);if(jc(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),rt!=4||H.length!=0||this.h.h||(this.s=1,ft(16),h=!1),this.o=this.o&&h,!h)Er(this.i,this.l,H,"[Invalid Chunked Response]"),Yn(this),ds(this);else if(0<H.length&&!this.W){this.W=!0;var nt=this.j;nt.g==this&&nt.ba&&!nt.M&&(nt.j.info("Great, no buffering proxy detected. Bytes received: "+H.length),pa(nt),nt.M=!0,ft(11))}}else Er(this.i,this.l,H,null),la(this,H);rt==4&&Yn(this),this.o&&!this.J&&(rt==4?pu(this.j,this):(this.o=!1,Ei(this)))}else qm(this.g),h==400&&0<H.indexOf("Unknown SID")?(this.s=3,ft(12)):(this.s=0,ft(13)),Yn(this),ds(this)}}}catch{}finally{}};function jc(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function Rm(o,u){var h=o.C,p=u.indexOf(`
`,h);return p==-1?ia:(h=Number(u.substring(h,p)),isNaN(h)?Uc:(p+=1,p+h>u.length?ia:(u=u.slice(p,p+h),o.C=p+h,u)))}Tn.prototype.cancel=function(){this.J=!0,Yn(this)};function Ei(o){o.S=Date.now()+o.I,$c(o,o.I)}function $c(o,u){if(o.B!=null)throw Error("WatchDog timer not null");o.B=us(E(o.ba,o),u)}function aa(o){o.B&&(l.clearTimeout(o.B),o.B=null)}Tn.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(Am(this.i,this.A),this.L!=2&&(cs(),ft(17)),Yn(this),this.s=2,ds(this)):$c(this,this.S-o)};function ds(o){o.j.G==0||o.J||pu(o.j,o)}function Yn(o){aa(o);var u=o.M;u&&typeof u.ma=="function"&&u.ma(),o.M=null,as(o.U),o.g&&(u=o.g,o.g=null,u.abort(),u.ma())}function la(o,u){try{var h=o.j;if(h.G!=0&&(h.g==o||ca(h.h,o))){if(!o.K&&ca(h.h,o)&&h.G==3){try{var p=h.Da.g.parse(u)}catch{p=null}if(Array.isArray(p)&&p.length==3){var P=p;if(P[0]==0){e:if(!h.u){if(h.g)if(h.g.F+3e3<o.F)Ci(h),Si(h);else break e;fa(h),ft(18)}}else h.za=P[1],0<h.za-h.T&&37500>P[2]&&h.F&&h.v==0&&!h.C&&(h.C=us(E(h.Za,h),6e3));if(1>=zc(h.h)&&h.ca){try{h.ca()}catch{}h.ca=void 0}}else Zn(h,11)}else if((o.K||h.g==o)&&Ci(h),!ee(u))for(P=h.Da.g.parse(u),u=0;u<P.length;u++){let ye=P[u];if(h.T=ye[0],ye=ye[1],h.G==2)if(ye[0]=="c"){h.K=ye[1],h.ia=ye[2];const nt=ye[3];nt!=null&&(h.la=nt,h.j.info("VER="+h.la));const rt=ye[4];rt!=null&&(h.Aa=rt,h.j.info("SVER="+h.Aa));const Ir=ye[5];Ir!=null&&typeof Ir=="number"&&0<Ir&&(p=1.5*Ir,h.L=p,h.j.info("backChannelRequestTimeoutMs_="+p)),p=h;const Ot=o.g;if(Ot){const Di=Ot.g?Ot.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Di){var D=p.h;D.g||Di.indexOf("spdy")==-1&&Di.indexOf("quic")==-1&&Di.indexOf("h2")==-1||(D.j=D.l,D.g=new Set,D.h&&(ua(D,D.h),D.h=null))}if(p.D){const ma=Ot.g?Ot.g.getResponseHeader("X-HTTP-Session-Id"):null;ma&&(p.ya=ma,ke(p.I,p.D,ma))}}h.G=3,h.l&&h.l.ua(),h.ba&&(h.R=Date.now()-o.F,h.j.info("Handshake RTT: "+h.R+"ms")),p=h;var H=o;if(p.qa=_u(p,p.J?p.ia:null,p.W),H.K){Wc(p.h,H);var be=H,Ge=p.L;Ge&&(be.I=Ge),be.B&&(aa(be),Ei(be)),p.g=H}else du(p);0<h.i.length&&Pi(h)}else ye[0]!="stop"&&ye[0]!="close"||Zn(h,7);else h.G==3&&(ye[0]=="stop"||ye[0]=="close"?ye[0]=="stop"?Zn(h,7):da(h):ye[0]!="noop"&&h.l&&h.l.ta(ye),h.v=0)}}cs(4)}catch{}}var Sm=class{constructor(o,u){this.g=o,this.map=u}};function qc(o){this.l=o||10,l.PerformanceNavigationTiming?(o=l.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Hc(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function zc(o){return o.h?1:o.g?o.g.size:0}function ca(o,u){return o.h?o.h==u:o.g?o.g.has(u):!1}function ua(o,u){o.g?o.g.add(u):o.h=u}function Wc(o,u){o.h&&o.h==u?o.h=null:o.g&&o.g.has(u)&&o.g.delete(u)}qc.prototype.cancel=function(){if(this.i=Kc(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Kc(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let u=o.i;for(const h of o.g.values())u=u.concat(h.D);return u}return M(o.i)}function Pm(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(c(o)){for(var u=[],h=o.length,p=0;p<h;p++)u.push(o[p]);return u}u=[],h=0;for(p in o)u[h++]=o[p];return u}function Cm(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(c(o)||typeof o=="string"){var u=[];o=o.length;for(var h=0;h<o;h++)u.push(h);return u}u=[],h=0;for(const p in o)u[h++]=p;return u}}}function Gc(o,u){if(o.forEach&&typeof o.forEach=="function")o.forEach(u,void 0);else if(c(o)||typeof o=="string")Array.prototype.forEach.call(o,u,void 0);else for(var h=Cm(o),p=Pm(o),P=p.length,D=0;D<P;D++)u.call(void 0,p[D],h&&h[D],o)}var Qc=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function km(o,u){if(o){o=o.split("&");for(var h=0;h<o.length;h++){var p=o[h].indexOf("="),P=null;if(0<=p){var D=o[h].substring(0,p);P=o[h].substring(p+1)}else D=o[h];u(D,P?decodeURIComponent(P.replace(/\+/g," ")):"")}}}function Xn(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof Xn){this.h=o.h,Ti(this,o.j),this.o=o.o,this.g=o.g,wi(this,o.s),this.l=o.l;var u=o.i,h=new ms;h.i=u.i,u.g&&(h.g=new Map(u.g),h.h=u.h),Jc(this,h),this.m=o.m}else o&&(u=String(o).match(Qc))?(this.h=!1,Ti(this,u[1]||"",!0),this.o=fs(u[2]||""),this.g=fs(u[3]||"",!0),wi(this,u[4]),this.l=fs(u[5]||"",!0),Jc(this,u[6]||"",!0),this.m=fs(u[7]||"")):(this.h=!1,this.i=new ms(null,this.h))}Xn.prototype.toString=function(){var o=[],u=this.j;u&&o.push(ps(u,Yc,!0),":");var h=this.g;return(h||u=="file")&&(o.push("//"),(u=this.o)&&o.push(ps(u,Yc,!0),"@"),o.push(encodeURIComponent(String(h)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.s,h!=null&&o.push(":",String(h))),(h=this.l)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(ps(h,h.charAt(0)=="/"?Vm:xm,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",ps(h,Om)),o.join("")};function Xt(o){return new Xn(o)}function Ti(o,u,h){o.j=h?fs(u,!0):u,o.j&&(o.j=o.j.replace(/:$/,""))}function wi(o,u){if(u){if(u=Number(u),isNaN(u)||0>u)throw Error("Bad port number "+u);o.s=u}else o.s=null}function Jc(o,u,h){u instanceof ms?(o.i=u,Mm(o.i,o.h)):(h||(u=ps(u,Nm)),o.i=new ms(u,o.h))}function ke(o,u,h){o.i.set(u,h)}function Ii(o){return ke(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function fs(o,u){return o?u?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function ps(o,u,h){return typeof o=="string"?(o=encodeURI(o).replace(u,Dm),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function Dm(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Yc=/[#\/\?@]/g,xm=/[#\?:]/g,Vm=/[#\?]/g,Nm=/[#\?@]/g,Om=/#/g;function ms(o,u){this.h=this.g=null,this.i=o||null,this.j=!!u}function wn(o){o.g||(o.g=new Map,o.h=0,o.i&&km(o.i,function(u,h){o.add(decodeURIComponent(u.replace(/\+/g," ")),h)}))}n=ms.prototype,n.add=function(o,u){wn(this),this.i=null,o=Tr(this,o);var h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(u),this.h+=1,this};function Xc(o,u){wn(o),u=Tr(o,u),o.g.has(u)&&(o.i=null,o.h-=o.g.get(u).length,o.g.delete(u))}function Zc(o,u){return wn(o),u=Tr(o,u),o.g.has(u)}n.forEach=function(o,u){wn(this),this.g.forEach(function(h,p){h.forEach(function(P){o.call(u,P,p,this)},this)},this)},n.na=function(){wn(this);const o=Array.from(this.g.values()),u=Array.from(this.g.keys()),h=[];for(let p=0;p<u.length;p++){const P=o[p];for(let D=0;D<P.length;D++)h.push(u[p])}return h},n.V=function(o){wn(this);let u=[];if(typeof o=="string")Zc(this,o)&&(u=u.concat(this.g.get(Tr(this,o))));else{o=Array.from(this.g.values());for(let h=0;h<o.length;h++)u=u.concat(o[h])}return u},n.set=function(o,u){return wn(this),this.i=null,o=Tr(this,o),Zc(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[u]),this.h+=1,this},n.get=function(o,u){return o?(o=this.V(o),0<o.length?String(o[0]):u):u};function eu(o,u,h){Xc(o,u),0<h.length&&(o.i=null,o.g.set(Tr(o,u),M(h)),o.h+=h.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],u=Array.from(this.g.keys());for(var h=0;h<u.length;h++){var p=u[h];const D=encodeURIComponent(String(p)),H=this.V(p);for(p=0;p<H.length;p++){var P=D;H[p]!==""&&(P+="="+encodeURIComponent(String(H[p]))),o.push(P)}}return this.i=o.join("&")};function Tr(o,u){return u=String(u),o.j&&(u=u.toLowerCase()),u}function Mm(o,u){u&&!o.j&&(wn(o),o.i=null,o.g.forEach(function(h,p){var P=p.toLowerCase();p!=P&&(Xc(this,p),eu(this,P,h))},o)),o.j=u}function Lm(o,u){const h=new hs;if(l.Image){const p=new Image;p.onload=k(In,h,"TestLoadImage: loaded",!0,u,p),p.onerror=k(In,h,"TestLoadImage: error",!1,u,p),p.onabort=k(In,h,"TestLoadImage: abort",!1,u,p),p.ontimeout=k(In,h,"TestLoadImage: timeout",!1,u,p),l.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=o}else u(!1)}function Fm(o,u){const h=new hs,p=new AbortController,P=setTimeout(()=>{p.abort(),In(h,"TestPingServer: timeout",!1,u)},1e4);fetch(o,{signal:p.signal}).then(D=>{clearTimeout(P),D.ok?In(h,"TestPingServer: ok",!0,u):In(h,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(P),In(h,"TestPingServer: error",!1,u)})}function In(o,u,h,p,P){try{P&&(P.onload=null,P.onerror=null,P.onabort=null,P.ontimeout=null),p(h)}catch{}}function Um(){this.g=new gi}function Bm(o,u,h){const p=h||"";try{Gc(o,function(P,D){let H=P;d(P)&&(H=Ke(P)),u.push(p+D+"="+encodeURIComponent(H))})}catch(P){throw u.push(p+"type="+encodeURIComponent("_badmap")),P}}function Ai(o){this.l=o.Ub||null,this.j=o.eb||!1}V(Ai,ta),Ai.prototype.g=function(){return new bi(this.l,this.j)},Ai.prototype.i=function(o){return function(){return o}}({});function bi(o,u){Q.call(this),this.D=o,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}V(bi,Q),n=bi.prototype,n.open=function(o,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=u,this.readyState=1,_s(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const u={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(u.body=o),(this.D||l).fetch(new Request(this.A,u)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,gs(this)),this.readyState=0},n.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,_s(this)),this.g&&(this.readyState=3,_s(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;tu(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function tu(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}n.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var u=o.value?o.value:new Uint8Array(0);(u=this.v.decode(u,{stream:!o.done}))&&(this.response=this.responseText+=u)}o.done?gs(this):_s(this),this.readyState==3&&tu(this)}},n.Ra=function(o){this.g&&(this.response=this.responseText=o,gs(this))},n.Qa=function(o){this.g&&(this.response=o,gs(this))},n.ga=function(){this.g&&gs(this)};function gs(o){o.readyState=4,o.l=null,o.j=null,o.v=null,_s(o)}n.setRequestHeader=function(o,u){this.u.append(o,u)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],u=this.h.entries();for(var h=u.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=u.next();return o.join(`\r
`)};function _s(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(bi.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function nu(o){let u="";return _e(o,function(h,p){u+=p,u+=":",u+=h,u+=`\r
`}),u}function ha(o,u,h){e:{for(p in h){var p=!1;break e}p=!0}p||(h=nu(h),typeof o=="string"?h!=null&&encodeURIComponent(String(h)):ke(o,u,h))}function Me(o){Q.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}V(Me,Q);var jm=/^https?$/i,$m=["POST","PUT"];n=Me.prototype,n.Ha=function(o){this.J=o},n.ea=function(o,u,h,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);u=u?u.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():sa.g(),this.v=this.o?Dc(this.o):Dc(sa),this.g.onreadystatechange=E(this.Ea,this);try{this.B=!0,this.g.open(u,String(o),!0),this.B=!1}catch(D){ru(this,D);return}if(o=h||"",h=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var P in p)h.set(P,p[P]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const D of p.keys())h.set(D,p.get(D));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(h.keys()).find(D=>D.toLowerCase()=="content-type"),P=l.FormData&&o instanceof l.FormData,!(0<=Array.prototype.indexOf.call($m,u,void 0))||p||P||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[D,H]of h)this.g.setRequestHeader(D,H);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{ou(this),this.u=!0,this.g.send(o),this.u=!1}catch(D){ru(this,D)}};function ru(o,u){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=u,o.m=5,su(o),Ri(o)}function su(o){o.A||(o.A=!0,G(o,"complete"),G(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,G(this,"complete"),G(this,"abort"),Ri(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Ri(this,!0)),Me.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?iu(this):this.bb())},n.bb=function(){iu(this)};function iu(o){if(o.h&&typeof a<"u"&&(!o.v[1]||Zt(o)!=4||o.Z()!=2)){if(o.u&&Zt(o)==4)Fe(o.Ea,0,o);else if(G(o,"readystatechange"),Zt(o)==4){o.h=!1;try{const H=o.Z();e:switch(H){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break e;default:u=!1}var h;if(!(h=u)){var p;if(p=H===0){var P=String(o.D).match(Qc)[1]||null;!P&&l.self&&l.self.location&&(P=l.self.location.protocol.slice(0,-1)),p=!jm.test(P?P.toLowerCase():"")}h=p}if(h)G(o,"complete"),G(o,"success");else{o.m=6;try{var D=2<Zt(o)?o.g.statusText:""}catch{D=""}o.l=D+" ["+o.Z()+"]",su(o)}}finally{Ri(o)}}}}function Ri(o,u){if(o.g){ou(o);const h=o.g,p=o.v[0]?()=>{}:null;o.g=null,o.v=null,u||G(o,"ready");try{h.onreadystatechange=p}catch{}}}function ou(o){o.I&&(l.clearTimeout(o.I),o.I=null)}n.isActive=function(){return!!this.g};function Zt(o){return o.g?o.g.readyState:0}n.Z=function(){try{return 2<Zt(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(o){if(this.g){var u=this.g.responseText;return o&&u.indexOf(o)==0&&(u=u.substring(o.length)),Pt(u)}};function au(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function qm(o){const u={};o=(o.g&&2<=Zt(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<o.length;p++){if(ee(o[p]))continue;var h=A(o[p]);const P=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const D=u[P]||[];u[P]=D,D.push(h)}I(u,function(p){return p.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function ys(o,u,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||u}function lu(o){this.Aa=0,this.i=[],this.j=new hs,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=ys("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=ys("baseRetryDelayMs",5e3,o),this.cb=ys("retryDelaySeedMs",1e4,o),this.Wa=ys("forwardChannelMaxRetries",2,o),this.wa=ys("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new qc(o&&o.concurrentRequestLimit),this.Da=new Um,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=lu.prototype,n.la=8,n.G=1,n.connect=function(o,u,h,p){ft(0),this.W=o,this.H=u||{},h&&p!==void 0&&(this.H.OSID=h,this.H.OAID=p),this.F=this.X,this.I=_u(this,null,this.W),Pi(this)};function da(o){if(cu(o),o.G==3){var u=o.U++,h=Xt(o.I);if(ke(h,"SID",o.K),ke(h,"RID",u),ke(h,"TYPE","terminate"),vs(o,h),u=new Tn(o,o.j,u),u.L=2,u.v=Ii(Xt(h)),h=!1,l.navigator&&l.navigator.sendBeacon)try{h=l.navigator.sendBeacon(u.v.toString(),"")}catch{}!h&&l.Image&&(new Image().src=u.v,h=!0),h||(u.g=yu(u.j,null),u.g.ea(u.v)),u.F=Date.now(),Ei(u)}gu(o)}function Si(o){o.g&&(pa(o),o.g.cancel(),o.g=null)}function cu(o){Si(o),o.u&&(l.clearTimeout(o.u),o.u=null),Ci(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&l.clearTimeout(o.s),o.s=null)}function Pi(o){if(!Hc(o.h)&&!o.s){o.s=!0;var u=o.Ga;se||Yt(),ie||(se(),ie=!0),De.add(u,o),o.B=0}}function Hm(o,u){return zc(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=u.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=us(E(o.Ga,o,u),mu(o,o.B)),o.B++,!0)}n.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const P=new Tn(this,this.j,o);let D=this.o;if(this.S&&(D?(D=g(D),w(D,this.S)):D=this.S),this.m!==null||this.O||(P.H=D,D=null),this.P)e:{for(var u=0,h=0;h<this.i.length;h++){t:{var p=this.i[h];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(u+=p,4096<u){u=h;break e}if(u===4096||h===this.i.length-1){u=h+1;break e}}u=1e3}else u=1e3;u=hu(this,P,u),h=Xt(this.I),ke(h,"RID",o),ke(h,"CVER",22),this.D&&ke(h,"X-HTTP-Session-Id",this.D),vs(this,h),D&&(this.O?u="headers="+encodeURIComponent(String(nu(D)))+"&"+u:this.m&&ha(h,this.m,D)),ua(this.h,P),this.Ua&&ke(h,"TYPE","init"),this.P?(ke(h,"$req",u),ke(h,"SID","null"),P.T=!0,oa(P,h,null)):oa(P,h,u),this.G=2}}else this.G==3&&(o?uu(this,o):this.i.length==0||Hc(this.h)||uu(this))};function uu(o,u){var h;u?h=u.l:h=o.U++;const p=Xt(o.I);ke(p,"SID",o.K),ke(p,"RID",h),ke(p,"AID",o.T),vs(o,p),o.m&&o.o&&ha(p,o.m,o.o),h=new Tn(o,o.j,h,o.B+1),o.m===null&&(h.H=o.o),u&&(o.i=u.D.concat(o.i)),u=hu(o,h,1e3),h.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),ua(o.h,h),oa(h,p,u)}function vs(o,u){o.H&&_e(o.H,function(h,p){ke(u,p,h)}),o.l&&Gc({},function(h,p){ke(u,p,h)})}function hu(o,u,h){h=Math.min(o.i.length,h);var p=o.l?E(o.l.Na,o.l,o):null;e:{var P=o.i;let D=-1;for(;;){const H=["count="+h];D==-1?0<h?(D=P[0].g,H.push("ofs="+D)):D=0:H.push("ofs="+D);let be=!0;for(let Ge=0;Ge<h;Ge++){let ye=P[Ge].g;const nt=P[Ge].map;if(ye-=D,0>ye)D=Math.max(0,P[Ge].g-100),be=!1;else try{Bm(nt,H,"req"+ye+"_")}catch{p&&p(nt)}}if(be){p=H.join("&");break e}}}return o=o.i.splice(0,h),u.D=o,p}function du(o){if(!o.g&&!o.u){o.Y=1;var u=o.Fa;se||Yt(),ie||(se(),ie=!0),De.add(u,o),o.v=0}}function fa(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=us(E(o.Fa,o),mu(o,o.v)),o.v++,!0)}n.Fa=function(){if(this.u=null,fu(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=us(E(this.ab,this),o)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,ft(10),Si(this),fu(this))};function pa(o){o.A!=null&&(l.clearTimeout(o.A),o.A=null)}function fu(o){o.g=new Tn(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var u=Xt(o.qa);ke(u,"RID","rpc"),ke(u,"SID",o.K),ke(u,"AID",o.T),ke(u,"CI",o.F?"0":"1"),!o.F&&o.ja&&ke(u,"TO",o.ja),ke(u,"TYPE","xmlhttp"),vs(o,u),o.m&&o.o&&ha(u,o.m,o.o),o.L&&(o.g.I=o.L);var h=o.g;o=o.ia,h.L=1,h.v=Ii(Xt(u)),h.m=null,h.P=!0,Bc(h,o)}n.Za=function(){this.C!=null&&(this.C=null,Si(this),fa(this),ft(19))};function Ci(o){o.C!=null&&(l.clearTimeout(o.C),o.C=null)}function pu(o,u){var h=null;if(o.g==u){Ci(o),pa(o),o.g=null;var p=2}else if(ca(o.h,u))h=u.D,Wc(o.h,u),p=1;else return;if(o.G!=0){if(u.o)if(p==1){h=u.m?u.m.length:0,u=Date.now()-u.F;var P=o.B;p=_i(),G(p,new Mc(p,h)),Pi(o)}else du(o);else if(P=u.s,P==3||P==0&&0<u.X||!(p==1&&Hm(o,u)||p==2&&fa(o)))switch(h&&0<h.length&&(u=o.h,u.i=u.i.concat(h)),P){case 1:Zn(o,5);break;case 4:Zn(o,10);break;case 3:Zn(o,6);break;default:Zn(o,2)}}}function mu(o,u){let h=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(h*=2),h*u}function Zn(o,u){if(o.j.info("Error code "+u),u==2){var h=E(o.fb,o),p=o.Xa;const P=!p;p=new Xn(p||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||Ti(p,"https"),Ii(p),P?Lm(p.toString(),h):Fm(p.toString(),h)}else ft(2);o.G=0,o.l&&o.l.sa(u),gu(o),cu(o)}n.fb=function(o){o?(this.j.info("Successfully pinged google.com"),ft(2)):(this.j.info("Failed to ping google.com"),ft(1))};function gu(o){if(o.G=0,o.ka=[],o.l){const u=Kc(o.h);(u.length!=0||o.i.length!=0)&&(j(o.ka,u),j(o.ka,o.i),o.h.i.length=0,M(o.i),o.i.length=0),o.l.ra()}}function _u(o,u,h){var p=h instanceof Xn?Xt(h):new Xn(h);if(p.g!="")u&&(p.g=u+"."+p.g),wi(p,p.s);else{var P=l.location;p=P.protocol,u=u?u+"."+P.hostname:P.hostname,P=+P.port;var D=new Xn(null);p&&Ti(D,p),u&&(D.g=u),P&&wi(D,P),h&&(D.l=h),p=D}return h=o.D,u=o.ya,h&&u&&ke(p,h,u),ke(p,"VER",o.la),vs(o,p),p}function yu(o,u,h){if(u&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return u=o.Ca&&!o.pa?new Me(new Ai({eb:h})):new Me(o.pa),u.Ha(o.J),u}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function vu(){}n=vu.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function ki(){}ki.prototype.g=function(o,u){return new Tt(o,u)};function Tt(o,u){Q.call(this),this.g=new lu(u),this.l=o,this.h=u&&u.messageUrlParams||null,o=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(o?o["X-WebChannel-Content-Type"]=u.messageContentType:o={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.va&&(o?o["X-WebChannel-Client-Profile"]=u.va:o={"X-WebChannel-Client-Profile":u.va}),this.g.S=o,(o=u&&u.Sb)&&!ee(o)&&(this.g.m=o),this.v=u&&u.supportsCrossDomainXhr||!1,this.u=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!ee(u)&&(this.g.D=u,o=this.h,o!==null&&u in o&&(o=this.h,u in o&&delete o[u])),this.j=new wr(this)}V(Tt,Q),Tt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Tt.prototype.close=function(){da(this.g)},Tt.prototype.o=function(o){var u=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.u&&(h={},h.__data__=Ke(o),o=h);u.i.push(new Sm(u.Ya++,o)),u.G==3&&Pi(u)},Tt.prototype.N=function(){this.g.l=null,delete this.j,da(this.g),delete this.g,Tt.aa.N.call(this)};function Eu(o){na.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var u=o.__sm__;if(u){e:{for(const h in u){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,u=u!==null&&o in u?u[o]:void 0),this.data=u}else this.data=o}V(Eu,na);function Tu(){ra.call(this),this.status=1}V(Tu,ra);function wr(o){this.g=o}V(wr,vu),wr.prototype.ua=function(){G(this.g,"a")},wr.prototype.ta=function(o){G(this.g,new Eu(o))},wr.prototype.sa=function(o){G(this.g,new Tu)},wr.prototype.ra=function(){G(this.g,"b")},ki.prototype.createWebChannel=ki.prototype.g,Tt.prototype.send=Tt.prototype.o,Tt.prototype.open=Tt.prototype.m,Tt.prototype.close=Tt.prototype.close,Cf=function(){return new ki},Pf=function(){return _i()},Sf=Jn,ol={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},yi.NO_ERROR=0,yi.TIMEOUT=8,yi.HTTP_ERROR=6,zi=yi,Lc.COMPLETE="complete",Rf=Lc,xc.EventType=ls,ls.OPEN="a",ls.CLOSE="b",ls.ERROR="c",ls.MESSAGE="d",Q.prototype.listen=Q.prototype.K,Rs=xc,Me.prototype.listenOnce=Me.prototype.L,Me.prototype.getLastError=Me.prototype.Ka,Me.prototype.getLastErrorCode=Me.prototype.Ba,Me.prototype.getStatus=Me.prototype.Z,Me.prototype.getResponseJson=Me.prototype.Oa,Me.prototype.getResponseText=Me.prototype.oa,Me.prototype.send=Me.prototype.ea,Me.prototype.setWithCredentials=Me.prototype.Ha,bf=Me}).apply(typeof Oi<"u"?Oi:typeof self<"u"?self:typeof window<"u"?window:{});const ah="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class it{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}it.UNAUTHENTICATED=new it(null),it.GOOGLE_CREDENTIALS=new it("google-credentials-uid"),it.FIRST_PARTY=new it("first-party-uid"),it.MOCK_USER=new it("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let ts="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cr=new ql("@firebase/firestore");function ws(){return cr.logLevel}function Y(n,...e){if(cr.logLevel<=pe.DEBUG){const t=e.map(Wl);cr.debug(`Firestore (${ts}): ${n}`,...t)}}function fn(n,...e){if(cr.logLevel<=pe.ERROR){const t=e.map(Wl);cr.error(`Firestore (${ts}): ${n}`,...t)}}function Kr(n,...e){if(cr.logLevel<=pe.WARN){const t=e.map(Wl);cr.warn(`Firestore (${ts}): ${n}`,...t)}}function Wl(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(t){return JSON.stringify(t)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ae(n="Unexpected state"){const e=`FIRESTORE (${ts}) INTERNAL ASSERTION FAILED: `+n;throw fn(e),new Error(e)}function Ae(n,e){n||ae()}function ue(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const F={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class Z extends vn{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mn{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kf{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Kv{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(it.UNAUTHENTICATED))}shutdown(){}}class Gv{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class Qv{constructor(e){this.t=e,this.currentUser=it.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){Ae(this.o===void 0);let r=this.i;const s=c=>this.i!==r?(r=this.i,t(c)):Promise.resolve();let i=new Mn;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Mn,e.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const c=i;e.enqueueRetryable(async()=>{await c.promise,await s(this.currentUser)})},l=c=>{Y("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(c=>l(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?l(c):(Y("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Mn)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(Y("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(Ae(typeof r.accessToken=="string"),new kf(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Ae(e===null||typeof e=="string"),new it(e)}}class Jv{constructor(e,t,r){this.l=e,this.h=t,this.P=r,this.type="FirstParty",this.user=it.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class Yv{constructor(e,t,r){this.l=e,this.h=t,this.P=r}getToken(){return Promise.resolve(new Jv(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(it.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Xv{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Zv{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){Ae(this.o===void 0);const r=i=>{i.error!=null&&Y("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.R;return this.R=i.token,Y("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{Y("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):Y("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(Ae(typeof t.token=="string"),this.R=t.token,new Xv(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function eE(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Df{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const s=eE(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%e.length))}return r}}function ve(n,e){return n<e?-1:n>e?1:0}function Gr(n,e,t){return n.length===e.length&&n.every((r,s)=>t(r,e[s]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class He{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new Z(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new Z(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new Z(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new Z(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return He.fromMillis(Date.now())}static fromDate(e){return He.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*t));return new He(t,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?ve(this.nanoseconds,e.nanoseconds):ve(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ce{constructor(e){this.timestamp=e}static fromTimestamp(e){return new ce(e)}static min(){return new ce(new He(0,0))}static max(){return new ce(new He(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qs{constructor(e,t,r){t===void 0?t=0:t>e.length&&ae(),r===void 0?r=e.length-t:r>e.length-t&&ae(),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Qs.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Qs?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=e.get(s),a=t.get(s);if(i<a)return-1;if(i>a)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class xe extends Qs{construct(e,t,r){return new xe(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new Z(F.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(s=>s.length>0))}return new xe(t)}static emptyPath(){return new xe([])}}const tE=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Ye extends Qs{construct(e,t,r){return new Ye(e,t,r)}static isValidIdentifier(e){return tE.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Ye.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new Ye(["__name__"])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new Z(F.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;s<e.length;){const l=e[s];if(l==="\\"){if(s+1===e.length)throw new Z(F.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new Z(F.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=c,s+=2}else l==="`"?(a=!a,s++):l!=="."||a?(r+=l,s++):(i(),s++)}if(i(),a)throw new Z(F.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Ye(t)}static emptyPath(){return new Ye([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ne{constructor(e){this.path=e}static fromPath(e){return new ne(xe.fromString(e))}static fromName(e){return new ne(xe.fromString(e).popFirst(5))}static empty(){return new ne(xe.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&xe.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return xe.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new ne(new xe(e.slice()))}}function nE(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=ce.fromTimestamp(r===1e9?new He(t+1,0):new He(t,r));return new $n(s,ne.empty(),e)}function rE(n){return new $n(n.readTime,n.key,-1)}class $n{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new $n(ce.min(),ne.empty(),-1)}static max(){return new $n(ce.max(),ne.empty(),-1)}}function sE(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=ne.comparator(n.documentKey,e.documentKey),t!==0?t:ve(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iE="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class oE{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function oi(n){if(n.code!==F.FAILED_PRECONDITION||n.message!==iE)throw n;Y("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class U{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&ae(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new U((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof U?t:U.resolve(t)}catch(t){return U.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):U.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):U.reject(t)}static resolve(e){return new U((t,r)=>{t(e)})}static reject(e){return new U((t,r)=>{r(e)})}static waitFor(e){return new U((t,r)=>{let s=0,i=0,a=!1;e.forEach(l=>{++s,l.next(()=>{++i,a&&i===s&&t()},c=>r(c))}),a=!0,i===s&&t()})}static or(e){let t=U.resolve(!1);for(const r of e)t=t.next(s=>s?U.resolve(s):r());return t}static forEach(e,t){const r=[];return e.forEach((s,i)=>{r.push(t.call(this,s,i))}),this.waitFor(r)}static mapArray(e,t){return new U((r,s)=>{const i=e.length,a=new Array(i);let l=0;for(let c=0;c<i;c++){const d=c;t(e[d]).next(f=>{a[d]=f,++l,l===i&&r(a)},f=>s(f))}})}static doWhile(e,t){return new U((r,s)=>{const i=()=>{e()===!0?t().next(()=>{i()},s):r()};i()})}}function aE(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function ai(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kl{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ie(r),this.se=r=>t.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}Kl.oe=-1;function Oo(n){return n==null}function co(n){return n===0&&1/n==-1/0}function lE(n){return typeof n=="number"&&Number.isInteger(n)&&!co(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lh(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function gr(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function xf(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oe{constructor(e,t){this.comparator=e,this.root=t||Qe.EMPTY}insert(e,t){return new Oe(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Qe.BLACK,null,null))}remove(e){return new Oe(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Qe.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Mi(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Mi(this.root,e,this.comparator,!1)}getReverseIterator(){return new Mi(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Mi(this.root,e,this.comparator,!0)}}class Mi{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Qe{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??Qe.RED,this.left=s??Qe.EMPTY,this.right=i??Qe.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new Qe(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Qe.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Qe.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Qe.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Qe.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw ae();const e=this.left.check();if(e!==this.right.check())throw ae();return e+(this.isRed()?0:1)}}Qe.EMPTY=null,Qe.RED=!0,Qe.BLACK=!1;Qe.EMPTY=new class{constructor(){this.size=0}get key(){throw ae()}get value(){throw ae()}get color(){throw ae()}get left(){throw ae()}get right(){throw ae()}copy(e,t,r,s,i){return this}insert(e,t,r){return new Qe(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ze{constructor(e){this.comparator=e,this.data=new Oe(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new ch(this.data.getIterator())}getIteratorFrom(e){return new ch(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof Ze)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new Ze(this.comparator);return t.data=e,t}}class ch{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class At{constructor(e){this.fields=e,e.sort(Ye.comparator)}static empty(){return new At([])}unionWith(e){let t=new Ze(Ye.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new At(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Gr(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vf extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tt{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Vf("Invalid base64 string: "+i):i}}(e);return new tt(t)}static fromUint8Array(e){const t=function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i}(e);return new tt(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return ve(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}tt.EMPTY_BYTE_STRING=new tt("");const cE=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function qn(n){if(Ae(!!n),typeof n=="string"){let e=0;const t=cE.exec(n);if(Ae(!!t),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:Ue(n.seconds),nanos:Ue(n.nanos)}}function Ue(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function ur(n){return typeof n=="string"?tt.fromBase64String(n):tt.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gl(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function Ql(n){const e=n.mapValue.fields.__previous_value__;return Gl(e)?Ql(e):e}function Js(n){const e=qn(n.mapValue.fields.__local_write_time__.timestampValue);return new He(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uE{constructor(e,t,r,s,i,a,l,c,d){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=l,this.longPollingOptions=c,this.useFetchStreams=d}}class Ys{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new Ys("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof Ys&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Li={mapValue:{fields:{__type__:{stringValue:"__max__"}}}};function hr(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Gl(n)?4:dE(n)?9007199254740991:hE(n)?10:11:ae()}function Qt(n,e){if(n===e)return!0;const t=hr(n);if(t!==hr(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Js(n).isEqual(Js(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const a=qn(s.timestampValue),l=qn(i.timestampValue);return a.seconds===l.seconds&&a.nanos===l.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,i){return ur(s.bytesValue).isEqual(ur(i.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,i){return Ue(s.geoPointValue.latitude)===Ue(i.geoPointValue.latitude)&&Ue(s.geoPointValue.longitude)===Ue(i.geoPointValue.longitude)}(n,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return Ue(s.integerValue)===Ue(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const a=Ue(s.doubleValue),l=Ue(i.doubleValue);return a===l?co(a)===co(l):isNaN(a)&&isNaN(l)}return!1}(n,e);case 9:return Gr(n.arrayValue.values||[],e.arrayValue.values||[],Qt);case 10:case 11:return function(s,i){const a=s.mapValue.fields||{},l=i.mapValue.fields||{};if(lh(a)!==lh(l))return!1;for(const c in a)if(a.hasOwnProperty(c)&&(l[c]===void 0||!Qt(a[c],l[c])))return!1;return!0}(n,e);default:return ae()}}function Xs(n,e){return(n.values||[]).find(t=>Qt(t,e))!==void 0}function Qr(n,e){if(n===e)return 0;const t=hr(n),r=hr(e);if(t!==r)return ve(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return ve(n.booleanValue,e.booleanValue);case 2:return function(i,a){const l=Ue(i.integerValue||i.doubleValue),c=Ue(a.integerValue||a.doubleValue);return l<c?-1:l>c?1:l===c?0:isNaN(l)?isNaN(c)?0:-1:1}(n,e);case 3:return uh(n.timestampValue,e.timestampValue);case 4:return uh(Js(n),Js(e));case 5:return ve(n.stringValue,e.stringValue);case 6:return function(i,a){const l=ur(i),c=ur(a);return l.compareTo(c)}(n.bytesValue,e.bytesValue);case 7:return function(i,a){const l=i.split("/"),c=a.split("/");for(let d=0;d<l.length&&d<c.length;d++){const f=ve(l[d],c[d]);if(f!==0)return f}return ve(l.length,c.length)}(n.referenceValue,e.referenceValue);case 8:return function(i,a){const l=ve(Ue(i.latitude),Ue(a.latitude));return l!==0?l:ve(Ue(i.longitude),Ue(a.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return hh(n.arrayValue,e.arrayValue);case 10:return function(i,a){var l,c,d,f;const m=i.fields||{},E=a.fields||{},k=(l=m.value)===null||l===void 0?void 0:l.arrayValue,V=(c=E.value)===null||c===void 0?void 0:c.arrayValue,M=ve(((d=k==null?void 0:k.values)===null||d===void 0?void 0:d.length)||0,((f=V==null?void 0:V.values)===null||f===void 0?void 0:f.length)||0);return M!==0?M:hh(k,V)}(n.mapValue,e.mapValue);case 11:return function(i,a){if(i===Li.mapValue&&a===Li.mapValue)return 0;if(i===Li.mapValue)return 1;if(a===Li.mapValue)return-1;const l=i.fields||{},c=Object.keys(l),d=a.fields||{},f=Object.keys(d);c.sort(),f.sort();for(let m=0;m<c.length&&m<f.length;++m){const E=ve(c[m],f[m]);if(E!==0)return E;const k=Qr(l[c[m]],d[f[m]]);if(k!==0)return k}return ve(c.length,f.length)}(n.mapValue,e.mapValue);default:throw ae()}}function uh(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return ve(n,e);const t=qn(n),r=qn(e),s=ve(t.seconds,r.seconds);return s!==0?s:ve(t.nanos,r.nanos)}function hh(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=Qr(t[s],r[s]);if(i)return i}return ve(t.length,r.length)}function Jr(n){return al(n)}function al(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=qn(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return ur(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return ne.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=al(i);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const a of r)i?i=!1:s+=",",s+=`${a}:${al(t.fields[a])}`;return s+"}"}(n.mapValue):ae()}function ll(n){return!!n&&"integerValue"in n}function Jl(n){return!!n&&"arrayValue"in n}function dh(n){return!!n&&"nullValue"in n}function fh(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Wi(n){return!!n&&"mapValue"in n}function hE(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="__vector__"}function Ms(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return gr(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=Ms(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Ms(n.arrayValue.values[t]);return e}return Object.assign({},n)}function dE(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vt{constructor(e){this.value=e}static empty(){return new vt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Wi(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ms(t)}setAll(e){let t=Ye.emptyPath(),r={},s=[];e.forEach((a,l)=>{if(!t.isImmediateParentOf(l)){const c=this.getFieldsMap(t);this.applyChanges(c,r,s),r={},s=[],t=l.popLast()}a?r[l.lastSegment()]=Ms(a):s.push(l.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());Wi(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Qt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];Wi(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){gr(t,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new vt(Ms(this.value))}}function Nf(n){const e=[];return gr(n.fields,(t,r)=>{const s=new Ye([t]);if(Wi(r)){const i=Nf(r.mapValue).fields;if(i.length===0)e.push(s);else for(const a of i)e.push(s.child(a))}else e.push(s)}),new At(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt{constructor(e,t,r,s,i,a,l){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=a,this.documentState=l}static newInvalidDocument(e){return new lt(e,0,ce.min(),ce.min(),ce.min(),vt.empty(),0)}static newFoundDocument(e,t,r,s){return new lt(e,1,t,ce.min(),r,s,0)}static newNoDocument(e,t){return new lt(e,2,t,ce.min(),ce.min(),vt.empty(),0)}static newUnknownDocument(e,t){return new lt(e,3,t,ce.min(),ce.min(),vt.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(ce.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=vt.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=vt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=ce.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof lt&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new lt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uo{constructor(e,t){this.position=e,this.inclusive=t}}function ph(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],a=n.position[s];if(i.field.isKeyField()?r=ne.comparator(ne.fromName(a.referenceValue),t.key):r=Qr(a,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function mh(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Qt(n.position[t],e.position[t]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ho{constructor(e,t="asc"){this.field=e,this.dir=t}}function fE(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Of{}class qe extends Of{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new mE(e,t,r):t==="array-contains"?new yE(e,r):t==="in"?new vE(e,r):t==="not-in"?new EE(e,r):t==="array-contains-any"?new TE(e,r):new qe(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new gE(e,r):new _E(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(Qr(t,this.value)):t!==null&&hr(this.value)===hr(t)&&this.matchesComparison(Qr(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return ae()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Jt extends Of{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new Jt(e,t)}matches(e){return Mf(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function Mf(n){return n.op==="and"}function Lf(n){return pE(n)&&Mf(n)}function pE(n){for(const e of n.filters)if(e instanceof Jt)return!1;return!0}function cl(n){if(n instanceof qe)return n.field.canonicalString()+n.op.toString()+Jr(n.value);if(Lf(n))return n.filters.map(e=>cl(e)).join(",");{const e=n.filters.map(t=>cl(t)).join(",");return`${n.op}(${e})`}}function Ff(n,e){return n instanceof qe?function(r,s){return s instanceof qe&&r.op===s.op&&r.field.isEqual(s.field)&&Qt(r.value,s.value)}(n,e):n instanceof Jt?function(r,s){return s instanceof Jt&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,a,l)=>i&&Ff(a,s.filters[l]),!0):!1}(n,e):void ae()}function Uf(n){return n instanceof qe?function(t){return`${t.field.canonicalString()} ${t.op} ${Jr(t.value)}`}(n):n instanceof Jt?function(t){return t.op.toString()+" {"+t.getFilters().map(Uf).join(" ,")+"}"}(n):"Filter"}class mE extends qe{constructor(e,t,r){super(e,t,r),this.key=ne.fromName(r.referenceValue)}matches(e){const t=ne.comparator(e.key,this.key);return this.matchesComparison(t)}}class gE extends qe{constructor(e,t){super(e,"in",t),this.keys=Bf("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class _E extends qe{constructor(e,t){super(e,"not-in",t),this.keys=Bf("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Bf(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>ne.fromName(r.referenceValue))}class yE extends qe{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Jl(t)&&Xs(t.arrayValue,this.value)}}class vE extends qe{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Xs(this.value.arrayValue,t)}}class EE extends qe{constructor(e,t){super(e,"not-in",t)}matches(e){if(Xs(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!Xs(this.value.arrayValue,t)}}class TE extends qe{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Jl(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Xs(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wE{constructor(e,t=null,r=[],s=[],i=null,a=null,l=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=a,this.endAt=l,this.ue=null}}function gh(n,e=null,t=[],r=[],s=null,i=null,a=null){return new wE(n,e,t,r,s,i,a)}function Yl(n){const e=ue(n);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>cl(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),Oo(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Jr(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Jr(r)).join(",")),e.ue=t}return e.ue}function Xl(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!fE(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Ff(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!mh(n.startAt,e.startAt)&&mh(n.endAt,e.endAt)}function ul(n){return ne.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mo{constructor(e,t=null,r=[],s=[],i=null,a="F",l=null,c=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=a,this.startAt=l,this.endAt=c,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function IE(n,e,t,r,s,i,a,l){return new Mo(n,e,t,r,s,i,a,l)}function jf(n){return new Mo(n)}function _h(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function AE(n){return n.collectionGroup!==null}function Ls(n){const e=ue(n);if(e.ce===null){e.ce=[];const t=new Set;for(const i of e.explicitOrderBy)e.ce.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let l=new Ze(Ye.comparator);return a.filters.forEach(c=>{c.getFlattenedFilters().forEach(d=>{d.isInequality()&&(l=l.add(d.field))})}),l})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.ce.push(new ho(i,r))}),t.has(Ye.keyField().canonicalString())||e.ce.push(new ho(Ye.keyField(),r))}return e.ce}function Ht(n){const e=ue(n);return e.le||(e.le=bE(e,Ls(n))),e.le}function bE(n,e){if(n.limitType==="F")return gh(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new ho(s.field,i)});const t=n.endAt?new uo(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new uo(n.startAt.position,n.startAt.inclusive):null;return gh(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function hl(n,e,t){return new Mo(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Lo(n,e){return Xl(Ht(n),Ht(e))&&n.limitType===e.limitType}function $f(n){return`${Yl(Ht(n))}|lt:${n.limitType}`}function xr(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(s=>Uf(s)).join(", ")}]`),Oo(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(s=>Jr(s)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(s=>Jr(s)).join(",")),`Target(${r})`}(Ht(n))}; limitType=${n.limitType})`}function Fo(n,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):ne.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(n,e)&&function(r,s){for(const i of Ls(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(n,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(n,e)&&function(r,s){return!(r.startAt&&!function(a,l,c){const d=ph(a,l,c);return a.inclusive?d<=0:d<0}(r.startAt,Ls(r),s)||r.endAt&&!function(a,l,c){const d=ph(a,l,c);return a.inclusive?d>=0:d>0}(r.endAt,Ls(r),s))}(n,e)}function RE(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function qf(n){return(e,t)=>{let r=!1;for(const s of Ls(n)){const i=SE(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function SE(n,e,t){const r=n.field.isKeyField()?ne.comparator(e.key,t.key):function(i,a,l){const c=a.data.field(i),d=l.data.field(i);return c!==null&&d!==null?Qr(c,d):ae()}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return ae()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ns{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){gr(this.inner,(t,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return xf(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const PE=new Oe(ne.comparator);function pn(){return PE}const Hf=new Oe(ne.comparator);function Ss(...n){let e=Hf;for(const t of n)e=e.insert(t.key,t);return e}function zf(n){let e=Hf;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function ir(){return Fs()}function Wf(){return Fs()}function Fs(){return new ns(n=>n.toString(),(n,e)=>n.isEqual(e))}const CE=new Oe(ne.comparator),kE=new Ze(ne.comparator);function fe(...n){let e=kE;for(const t of n)e=e.add(t);return e}const DE=new Ze(ve);function xE(){return DE}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zl(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:co(e)?"-0":e}}function Kf(n){return{integerValue:""+n}}function VE(n,e){return lE(e)?Kf(e):Zl(n,e)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Uo{constructor(){this._=void 0}}function NE(n,e,t){return n instanceof fo?function(s,i){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Gl(i)&&(i=Ql(i)),i&&(a.fields.__previous_value__=i),{mapValue:a}}(t,e):n instanceof Zs?Qf(n,e):n instanceof ei?Jf(n,e):function(s,i){const a=Gf(s,i),l=yh(a)+yh(s.Pe);return ll(a)&&ll(s.Pe)?Kf(l):Zl(s.serializer,l)}(n,e)}function OE(n,e,t){return n instanceof Zs?Qf(n,e):n instanceof ei?Jf(n,e):t}function Gf(n,e){return n instanceof po?function(r){return ll(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class fo extends Uo{}class Zs extends Uo{constructor(e){super(),this.elements=e}}function Qf(n,e){const t=Yf(e);for(const r of n.elements)t.some(s=>Qt(s,r))||t.push(r);return{arrayValue:{values:t}}}class ei extends Uo{constructor(e){super(),this.elements=e}}function Jf(n,e){let t=Yf(e);for(const r of n.elements)t=t.filter(s=>!Qt(s,r));return{arrayValue:{values:t}}}class po extends Uo{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function yh(n){return Ue(n.integerValue||n.doubleValue)}function Yf(n){return Jl(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}function ME(n,e){return n.field.isEqual(e.field)&&function(r,s){return r instanceof Zs&&s instanceof Zs||r instanceof ei&&s instanceof ei?Gr(r.elements,s.elements,Qt):r instanceof po&&s instanceof po?Qt(r.Pe,s.Pe):r instanceof fo&&s instanceof fo}(n.transform,e.transform)}class LE{constructor(e,t){this.version=e,this.transformResults=t}}class bt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new bt}static exists(e){return new bt(void 0,e)}static updateTime(e){return new bt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Ki(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Bo{}function Xf(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new jo(n.key,bt.none()):new li(n.key,n.data,bt.none());{const t=n.data,r=vt.empty();let s=new Ze(Ye.comparator);for(let i of e.fields)if(!s.has(i)){let a=t.field(i);a===null&&i.length>1&&(i=i.popLast(),a=t.field(i)),a===null?r.delete(i):r.set(i,a),s=s.add(i)}return new Gn(n.key,r,new At(s.toArray()),bt.none())}}function FE(n,e,t){n instanceof li?function(s,i,a){const l=s.value.clone(),c=Eh(s.fieldTransforms,i,a.transformResults);l.setAll(c),i.convertToFoundDocument(a.version,l).setHasCommittedMutations()}(n,e,t):n instanceof Gn?function(s,i,a){if(!Ki(s.precondition,i))return void i.convertToUnknownDocument(a.version);const l=Eh(s.fieldTransforms,i,a.transformResults),c=i.data;c.setAll(Zf(s)),c.setAll(l),i.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(n,e,t):function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function Us(n,e,t,r){return n instanceof li?function(i,a,l,c){if(!Ki(i.precondition,a))return l;const d=i.value.clone(),f=Th(i.fieldTransforms,c,a);return d.setAll(f),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(n,e,t,r):n instanceof Gn?function(i,a,l,c){if(!Ki(i.precondition,a))return l;const d=Th(i.fieldTransforms,c,a),f=a.data;return f.setAll(Zf(i)),f.setAll(d),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),l===null?null:l.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(m=>m.field))}(n,e,t,r):function(i,a,l){return Ki(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):l}(n,e,t)}function UE(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=Gf(r.transform,s||null);i!=null&&(t===null&&(t=vt.empty()),t.set(r.field,i))}return t||null}function vh(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&Gr(r,s,(i,a)=>ME(i,a))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class li extends Bo{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Gn extends Bo{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Zf(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function Eh(n,e,t){const r=new Map;Ae(n.length===t.length);for(let s=0;s<t.length;s++){const i=n[s],a=i.transform,l=e.data.field(i.field);r.set(i.field,OE(a,l,t[s]))}return r}function Th(n,e,t){const r=new Map;for(const s of n){const i=s.transform,a=t.data.field(s.field);r.set(s.field,NE(i,a,e))}return r}class jo extends Bo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class BE extends Bo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jE{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&FE(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Us(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Us(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=Wf();return this.mutations.forEach(s=>{const i=e.get(s.key),a=i.overlayedDocument;let l=this.applyToLocalView(a,i.mutatedFields);l=t.has(s.key)?null:l;const c=Xf(a,l);c!==null&&r.set(s.key,c),a.isValidDocument()||a.convertToNoDocument(ce.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),fe())}isEqual(e){return this.batchId===e.batchId&&Gr(this.mutations,e.mutations,(t,r)=>vh(t,r))&&Gr(this.baseMutations,e.baseMutations,(t,r)=>vh(t,r))}}class ec{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){Ae(e.mutations.length===r.length);let s=function(){return CE}();const i=e.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,r[a].version);return new ec(e,t,r,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $E{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qE{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Be,ge;function HE(n){switch(n){default:return ae();case F.CANCELLED:case F.UNKNOWN:case F.DEADLINE_EXCEEDED:case F.RESOURCE_EXHAUSTED:case F.INTERNAL:case F.UNAVAILABLE:case F.UNAUTHENTICATED:return!1;case F.INVALID_ARGUMENT:case F.NOT_FOUND:case F.ALREADY_EXISTS:case F.PERMISSION_DENIED:case F.FAILED_PRECONDITION:case F.ABORTED:case F.OUT_OF_RANGE:case F.UNIMPLEMENTED:case F.DATA_LOSS:return!0}}function ep(n){if(n===void 0)return fn("GRPC error has no .code"),F.UNKNOWN;switch(n){case Be.OK:return F.OK;case Be.CANCELLED:return F.CANCELLED;case Be.UNKNOWN:return F.UNKNOWN;case Be.DEADLINE_EXCEEDED:return F.DEADLINE_EXCEEDED;case Be.RESOURCE_EXHAUSTED:return F.RESOURCE_EXHAUSTED;case Be.INTERNAL:return F.INTERNAL;case Be.UNAVAILABLE:return F.UNAVAILABLE;case Be.UNAUTHENTICATED:return F.UNAUTHENTICATED;case Be.INVALID_ARGUMENT:return F.INVALID_ARGUMENT;case Be.NOT_FOUND:return F.NOT_FOUND;case Be.ALREADY_EXISTS:return F.ALREADY_EXISTS;case Be.PERMISSION_DENIED:return F.PERMISSION_DENIED;case Be.FAILED_PRECONDITION:return F.FAILED_PRECONDITION;case Be.ABORTED:return F.ABORTED;case Be.OUT_OF_RANGE:return F.OUT_OF_RANGE;case Be.UNIMPLEMENTED:return F.UNIMPLEMENTED;case Be.DATA_LOSS:return F.DATA_LOSS;default:return ae()}}(ge=Be||(Be={}))[ge.OK=0]="OK",ge[ge.CANCELLED=1]="CANCELLED",ge[ge.UNKNOWN=2]="UNKNOWN",ge[ge.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ge[ge.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ge[ge.NOT_FOUND=5]="NOT_FOUND",ge[ge.ALREADY_EXISTS=6]="ALREADY_EXISTS",ge[ge.PERMISSION_DENIED=7]="PERMISSION_DENIED",ge[ge.UNAUTHENTICATED=16]="UNAUTHENTICATED",ge[ge.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ge[ge.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ge[ge.ABORTED=10]="ABORTED",ge[ge.OUT_OF_RANGE=11]="OUT_OF_RANGE",ge[ge.UNIMPLEMENTED=12]="UNIMPLEMENTED",ge[ge.INTERNAL=13]="INTERNAL",ge[ge.UNAVAILABLE=14]="UNAVAILABLE",ge[ge.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zE(){return new TextEncoder}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WE=new ar([4294967295,4294967295],0);function wh(n){const e=zE().encode(n),t=new Af;return t.update(e),new Uint8Array(t.digest())}function Ih(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new ar([t,r],0),new ar([s,i],0)]}class tc{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Ps(`Invalid padding: ${t}`);if(r<0)throw new Ps(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Ps(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Ps(`Invalid padding when bitmap length is 0: ${t}`);this.Ie=8*e.length-t,this.Te=ar.fromNumber(this.Ie)}Ee(e,t,r){let s=e.add(t.multiply(ar.fromNumber(r)));return s.compare(WE)===1&&(s=new ar([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const t=wh(e),[r,s]=Ih(t);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);if(!this.de(a))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new tc(i,s,t);return r.forEach(l=>a.insert(l)),a}insert(e){if(this.Ie===0)return;const t=wh(e),[r,s]=Ih(t);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);this.Ae(a)}}Ae(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Ps extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $o{constructor(e,t,r,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,ci.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new $o(ce.min(),s,new Oe(ve),pn(),fe())}}class ci{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new ci(r,t,fe(),fe(),fe())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gi{constructor(e,t,r,s){this.Re=e,this.removedTargetIds=t,this.key=r,this.Ve=s}}class tp{constructor(e,t){this.targetId=e,this.me=t}}class np{constructor(e,t,r=tt.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class Ah{constructor(){this.fe=0,this.ge=Rh(),this.pe=tt.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=fe(),t=fe(),r=fe();return this.ge.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:ae()}}),new ci(this.pe,this.ye,e,t,r)}Ce(){this.we=!1,this.ge=Rh()}Fe(e,t){this.we=!0,this.ge=this.ge.insert(e,t)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,Ae(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class KE{constructor(e){this.Le=e,this.Be=new Map,this.ke=pn(),this.qe=bh(),this.Qe=new Oe(ve)}Ke(e){for(const t of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(t,e.Ve):this.Ue(t,e.key,e.Ve);for(const t of e.removedTargetIds)this.Ue(t,e.key,e.Ve)}We(e){this.forEachTarget(e,t=>{const r=this.Ge(t);switch(e.state){case 0:this.ze(t)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(t);break;case 3:this.ze(t)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(t)&&(this.je(t),r.De(e.resumeToken));break;default:ae()}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Be.forEach((r,s)=>{this.ze(s)&&t(s)})}He(e){const t=e.targetId,r=e.me.count,s=this.Je(t);if(s){const i=s.target;if(ul(i))if(r===0){const a=new ne(i.path);this.Ue(t,a,lt.newNoDocument(a,ce.min()))}else Ae(r===1);else{const a=this.Ye(t);if(a!==r){const l=this.Ze(e),c=l?this.Xe(l,e,a):1;if(c!==0){this.je(t);const d=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(t,d)}}}}}Ze(e){const t=e.me.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let a,l;try{a=ur(r).toUint8Array()}catch(c){if(c instanceof Vf)return Kr("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{l=new tc(a,s,i)}catch(c){return Kr(c instanceof Ps?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return l.Ie===0?null:l}Xe(e,t,r){return t.me.count===r-this.nt(e,t.targetId)?0:2}nt(e,t){const r=this.Le.getRemoteKeysForTarget(t);let s=0;return r.forEach(i=>{const a=this.Le.tt(),l=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(l)||(this.Ue(t,i,null),s++)}),s}rt(e){const t=new Map;this.Be.forEach((i,a)=>{const l=this.Je(a);if(l){if(i.current&&ul(l.target)){const c=new ne(l.target.path);this.ke.get(c)!==null||this.it(a,c)||this.Ue(a,c,lt.newNoDocument(c,e))}i.be&&(t.set(a,i.ve()),i.Ce())}});let r=fe();this.qe.forEach((i,a)=>{let l=!0;a.forEachWhile(c=>{const d=this.Je(c);return!d||d.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(i))}),this.ke.forEach((i,a)=>a.setReadTime(e));const s=new $o(e,t,this.Qe,this.ke,r);return this.ke=pn(),this.qe=bh(),this.Qe=new Oe(ve),s}$e(e,t){if(!this.ze(e))return;const r=this.it(e,t.key)?2:0;this.Ge(e).Fe(t.key,r),this.ke=this.ke.insert(t.key,t),this.qe=this.qe.insert(t.key,this.st(t.key).add(e))}Ue(e,t,r){if(!this.ze(e))return;const s=this.Ge(e);this.it(e,t)?s.Fe(t,1):s.Me(t),this.qe=this.qe.insert(t,this.st(t).delete(e)),r&&(this.ke=this.ke.insert(t,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const t=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let t=this.Be.get(e);return t||(t=new Ah,this.Be.set(e,t)),t}st(e){let t=this.qe.get(e);return t||(t=new Ze(ve),this.qe=this.qe.insert(e,t)),t}ze(e){const t=this.Je(e)!==null;return t||Y("WatchChangeAggregator","Detected inactive target",e),t}Je(e){const t=this.Be.get(e);return t&&t.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new Ah),this.Le.getRemoteKeysForTarget(e).forEach(t=>{this.Ue(e,t,null)})}it(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}}function bh(){return new Oe(ne.comparator)}function Rh(){return new Oe(ne.comparator)}const GE=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),QE=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),JE=(()=>({and:"AND",or:"OR"}))();class YE{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function dl(n,e){return n.useProto3Json||Oo(e)?e:{value:e}}function mo(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function rp(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function XE(n,e){return mo(n,e.toTimestamp())}function zt(n){return Ae(!!n),ce.fromTimestamp(function(t){const r=qn(t);return new He(r.seconds,r.nanos)}(n))}function nc(n,e){return fl(n,e).canonicalString()}function fl(n,e){const t=function(s){return new xe(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function sp(n){const e=xe.fromString(n);return Ae(cp(e)),e}function pl(n,e){return nc(n.databaseId,e.path)}function Na(n,e){const t=sp(e);if(t.get(1)!==n.databaseId.projectId)throw new Z(F.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new Z(F.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new ne(op(t))}function ip(n,e){return nc(n.databaseId,e)}function ZE(n){const e=sp(n);return e.length===4?xe.emptyPath():op(e)}function ml(n){return new xe(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function op(n){return Ae(n.length>4&&n.get(4)==="documents"),n.popFirst(5)}function Sh(n,e,t){return{name:pl(n,e),fields:t.value.mapValue.fields}}function eT(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:ae()}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(d,f){return d.useProto3Json?(Ae(f===void 0||typeof f=="string"),tt.fromBase64String(f||"")):(Ae(f===void 0||f instanceof Buffer||f instanceof Uint8Array),tt.fromUint8Array(f||new Uint8Array))}(n,e.targetChange.resumeToken),a=e.targetChange.cause,l=a&&function(d){const f=d.code===void 0?F.UNKNOWN:ep(d.code);return new Z(f,d.message||"")}(a);t=new np(r,s,i,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Na(n,r.document.name),i=zt(r.document.updateTime),a=r.document.createTime?zt(r.document.createTime):ce.min(),l=new vt({mapValue:{fields:r.document.fields}}),c=lt.newFoundDocument(s,i,a,l),d=r.targetIds||[],f=r.removedTargetIds||[];t=new Gi(d,f,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Na(n,r.document),i=r.readTime?zt(r.readTime):ce.min(),a=lt.newNoDocument(s,i),l=r.removedTargetIds||[];t=new Gi([],l,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Na(n,r.document),i=r.removedTargetIds||[];t=new Gi([],i,s,null)}else{if(!("filter"in e))return ae();{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,a=new qE(s,i),l=r.targetId;t=new tp(l,a)}}return t}function tT(n,e){let t;if(e instanceof li)t={update:Sh(n,e.key,e.value)};else if(e instanceof jo)t={delete:pl(n,e.key)};else if(e instanceof Gn)t={update:Sh(n,e.key,e.data),updateMask:uT(e.fieldMask)};else{if(!(e instanceof BE))return ae();t={verify:pl(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(i,a){const l=a.transform;if(l instanceof fo)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof Zs)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof ei)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof po)return{fieldPath:a.field.canonicalString(),increment:l.Pe};throw ae()}(0,r))),e.precondition.isNone||(t.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:XE(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:ae()}(n,e.precondition)),t}function nT(n,e){return n&&n.length>0?(Ae(e!==void 0),n.map(t=>function(s,i){let a=s.updateTime?zt(s.updateTime):zt(i);return a.isEqual(ce.min())&&(a=zt(i)),new LE(a,s.transformResults||[])}(t,e))):[]}function rT(n,e){return{documents:[ip(n,e.path)]}}function sT(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=ip(n,s);const i=function(d){if(d.length!==0)return lp(Jt.create(d,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const a=function(d){if(d.length!==0)return d.map(f=>function(E){return{field:Vr(E.field),direction:aT(E.dir)}}(f))}(e.orderBy);a&&(t.structuredQuery.orderBy=a);const l=dl(n,e.limit);return l!==null&&(t.structuredQuery.limit=l),e.startAt&&(t.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(e.endAt)),{_t:t,parent:s}}function iT(n){let e=ZE(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){Ae(r===1);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let i=[];t.where&&(i=function(m){const E=ap(m);return E instanceof Jt&&Lf(E)?E.getFilters():[E]}(t.where));let a=[];t.orderBy&&(a=function(m){return m.map(E=>function(V){return new ho(Nr(V.field),function(j){switch(j){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(V.direction))}(E))}(t.orderBy));let l=null;t.limit&&(l=function(m){let E;return E=typeof m=="object"?m.value:m,Oo(E)?null:E}(t.limit));let c=null;t.startAt&&(c=function(m){const E=!!m.before,k=m.values||[];return new uo(k,E)}(t.startAt));let d=null;return t.endAt&&(d=function(m){const E=!m.before,k=m.values||[];return new uo(k,E)}(t.endAt)),IE(e,s,a,i,l,"F",c,d)}function oT(n,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return ae()}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function ap(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Nr(t.unaryFilter.field);return qe.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Nr(t.unaryFilter.field);return qe.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Nr(t.unaryFilter.field);return qe.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Nr(t.unaryFilter.field);return qe.create(a,"!=",{nullValue:"NULL_VALUE"});default:return ae()}}(n):n.fieldFilter!==void 0?function(t){return qe.create(Nr(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return ae()}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return Jt.create(t.compositeFilter.filters.map(r=>ap(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return ae()}}(t.compositeFilter.op))}(n):ae()}function aT(n){return GE[n]}function lT(n){return QE[n]}function cT(n){return JE[n]}function Vr(n){return{fieldPath:n.canonicalString()}}function Nr(n){return Ye.fromServerFormat(n.fieldPath)}function lp(n){return n instanceof qe?function(t){if(t.op==="=="){if(fh(t.value))return{unaryFilter:{field:Vr(t.field),op:"IS_NAN"}};if(dh(t.value))return{unaryFilter:{field:Vr(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(fh(t.value))return{unaryFilter:{field:Vr(t.field),op:"IS_NOT_NAN"}};if(dh(t.value))return{unaryFilter:{field:Vr(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Vr(t.field),op:lT(t.op),value:t.value}}}(n):n instanceof Jt?function(t){const r=t.getFilters().map(s=>lp(s));return r.length===1?r[0]:{compositeFilter:{op:cT(t.op),filters:r}}}(n):ae()}function uT(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function cp(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dn{constructor(e,t,r,s,i=ce.min(),a=ce.min(),l=tt.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=l,this.expectedCount=c}withSequenceNumber(e){return new Dn(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Dn(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Dn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Dn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hT{constructor(e){this.ct=e}}function dT(n){const e=iT({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?hl(e,e.limit,"L"):e}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fT{constructor(){this.un=new pT}addToCollectionParentIndex(e,t){return this.un.add(t),U.resolve()}getCollectionParents(e,t){return U.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return U.resolve()}deleteFieldIndex(e,t){return U.resolve()}deleteAllFieldIndexes(e){return U.resolve()}createTargetIndexes(e,t){return U.resolve()}getDocumentsMatchingTarget(e,t){return U.resolve(null)}getIndexType(e,t){return U.resolve(0)}getFieldIndexes(e,t){return U.resolve([])}getNextCollectionGroupToUpdate(e){return U.resolve(null)}getMinOffset(e,t){return U.resolve($n.min())}getMinOffsetFromCollectionGroup(e,t){return U.resolve($n.min())}updateCollectionGroup(e,t,r){return U.resolve()}updateIndexEntries(e,t){return U.resolve()}}class pT{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new Ze(xe.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new Ze(xe.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yr{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new Yr(0)}static kn(){return new Yr(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mT{constructor(){this.changes=new ns(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,lt.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?U.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gT{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _T{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(r!==null&&Us(r.mutation,s,At.empty(),He.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,fe()).next(()=>r))}getLocalViewOfDocuments(e,t,r=fe()){const s=ir();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,r).next(i=>{let a=Ss();return i.forEach((l,c)=>{a=a.insert(l,c.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const r=ir();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,fe()))}populateOverlays(e,t,r){const s=[];return r.forEach(i=>{t.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((a,l)=>{t.set(a,l)})})}computeViews(e,t,r,s){let i=pn();const a=Fs(),l=function(){return Fs()}();return t.forEach((c,d)=>{const f=r.get(d.key);s.has(d.key)&&(f===void 0||f.mutation instanceof Gn)?i=i.insert(d.key,d):f!==void 0?(a.set(d.key,f.mutation.getFieldMask()),Us(f.mutation,d,f.mutation.getFieldMask(),He.now())):a.set(d.key,At.empty())}),this.recalculateAndSaveOverlays(e,i).next(c=>(c.forEach((d,f)=>a.set(d,f)),t.forEach((d,f)=>{var m;return l.set(d,new gT(f,(m=a.get(d))!==null&&m!==void 0?m:null))}),l))}recalculateAndSaveOverlays(e,t){const r=Fs();let s=new Oe((a,l)=>a-l),i=fe();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const l of a)l.keys().forEach(c=>{const d=t.get(c);if(d===null)return;let f=r.get(c)||At.empty();f=l.applyToLocalView(d,f),r.set(c,f);const m=(s.get(l.batchId)||fe()).add(c);s=s.insert(l.batchId,m)})}).next(()=>{const a=[],l=s.getReverseIterator();for(;l.hasNext();){const c=l.getNext(),d=c.key,f=c.value,m=Wf();f.forEach(E=>{if(!i.has(E)){const k=Xf(t.get(E),r.get(E));k!==null&&m.set(E,k),i=i.add(E)}}),a.push(this.documentOverlayCache.saveOverlays(e,d,m))}return U.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,s){return function(a){return ne.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):AE(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next(i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):U.resolve(ir());let l=-1,c=i;return a.next(d=>U.forEach(d,(f,m)=>(l<m.largestBatchId&&(l=m.largestBatchId),i.get(f)?U.resolve():this.remoteDocumentCache.getEntry(e,f).next(E=>{c=c.insert(f,E)}))).next(()=>this.populateOverlays(e,d,i)).next(()=>this.computeViews(e,c,d,fe())).next(f=>({batchId:l,changes:zf(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new ne(t)).next(r=>{let s=Ss();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let a=Ss();return this.indexManager.getCollectionParents(e,i).next(l=>U.forEach(l,c=>{const d=function(m,E){return new Mo(E,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(t,c.child(i));return this.getDocumentsMatchingCollectionQuery(e,d,r,s).next(f=>{f.forEach((m,E)=>{a=a.insert(m,E)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s))).next(a=>{i.forEach((c,d)=>{const f=d.getKey();a.get(f)===null&&(a=a.insert(f,lt.newInvalidDocument(f)))});let l=Ss();return a.forEach((c,d)=>{const f=i.get(c);f!==void 0&&Us(f.mutation,d,At.empty(),He.now()),Fo(t,d)&&(l=l.insert(c,d))}),l})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yT{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return U.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,function(s){return{id:s.id,version:s.version,createTime:zt(s.createTime)}}(t)),U.resolve()}getNamedQuery(e,t){return U.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,function(s){return{name:s.name,query:dT(s.bundledQuery),readTime:zt(s.readTime)}}(t)),U.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vT{constructor(){this.overlays=new Oe(ne.comparator),this.Ir=new Map}getOverlay(e,t){return U.resolve(this.overlays.get(t))}getOverlays(e,t){const r=ir();return U.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((s,i)=>{this.ht(e,t,i)}),U.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Ir.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(r)),U.resolve()}getOverlaysForCollection(e,t,r){const s=ir(),i=t.length+1,a=new ne(t.child("")),l=this.overlays.getIteratorFrom(a);for(;l.hasNext();){const c=l.getNext().value,d=c.getKey();if(!t.isPrefixOf(d.path))break;d.path.length===i&&c.largestBatchId>r&&s.set(c.getKey(),c)}return U.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new Oe((d,f)=>d-f);const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===t&&d.largestBatchId>r){let f=i.get(d.largestBatchId);f===null&&(f=ir(),i=i.insert(d.largestBatchId,f)),f.set(d.getKey(),d)}}const l=ir(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((d,f)=>l.set(d,f)),!(l.size()>=s)););return U.resolve(l)}ht(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.Ir.get(s.largestBatchId).delete(r.key);this.Ir.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new $E(t,r));let i=this.Ir.get(t);i===void 0&&(i=fe(),this.Ir.set(t,i)),this.Ir.set(t,i.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ET{constructor(){this.sessionToken=tt.EMPTY_BYTE_STRING}getSessionToken(e){return U.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,U.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rc{constructor(){this.Tr=new Ze(We.Er),this.dr=new Ze(We.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const r=new We(e,t);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Vr(new We(e,t))}mr(e,t){e.forEach(r=>this.removeReference(r,t))}gr(e){const t=new ne(new xe([])),r=new We(t,e),s=new We(t,e+1),i=[];return this.dr.forEachInRange([r,s],a=>{this.Vr(a),i.push(a.key)}),i}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new ne(new xe([])),r=new We(t,e),s=new We(t,e+1);let i=fe();return this.dr.forEachInRange([r,s],a=>{i=i.add(a.key)}),i}containsKey(e){const t=new We(e,0),r=this.Tr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class We{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return ne.comparator(e.key,t.key)||ve(e.wr,t.wr)}static Ar(e,t){return ve(e.wr,t.wr)||ne.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TT{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new Ze(We.Er)}checkEmpty(e){return U.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new jE(i,t,r,s);this.mutationQueue.push(a);for(const l of s)this.br=this.br.add(new We(l.key,i)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return U.resolve(a)}lookupMutationBatch(e,t){return U.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.vr(r),i=s<0?0:s;return U.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return U.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return U.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new We(t,0),s=new We(t,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([r,s],a=>{const l=this.Dr(a.wr);i.push(l)}),U.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new Ze(ve);return t.forEach(s=>{const i=new We(s,0),a=new We(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,a],l=>{r=r.add(l.wr)})}),U.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;ne.isDocumentKey(i)||(i=i.child(""));const a=new We(new ne(i),0);let l=new Ze(ve);return this.br.forEachWhile(c=>{const d=c.key.path;return!!r.isPrefixOf(d)&&(d.length===s&&(l=l.add(c.wr)),!0)},a),U.resolve(this.Cr(l))}Cr(e){const t=[];return e.forEach(r=>{const s=this.Dr(r);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){Ae(this.Fr(t.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return U.forEach(t.mutations,s=>{const i=new We(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,t){const r=new We(t,0),s=this.br.firstAfterOrEqual(r);return U.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,U.resolve()}Fr(e,t){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wT{constructor(e){this.Mr=e,this.docs=function(){return new Oe(ne.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,a=this.Mr(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return U.resolve(r?r.document.mutableCopy():lt.newInvalidDocument(t))}getEntries(e,t){let r=pn();return t.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():lt.newInvalidDocument(s))}),U.resolve(r)}getDocumentsMatchingQuery(e,t,r,s){let i=pn();const a=t.path,l=new ne(a.child("")),c=this.docs.getIteratorFrom(l);for(;c.hasNext();){const{key:d,value:{document:f}}=c.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||sE(rE(f),r)<=0||(s.has(f.key)||Fo(t,f))&&(i=i.insert(f.key,f.mutableCopy()))}return U.resolve(i)}getAllFromCollectionGroup(e,t,r,s){ae()}Or(e,t){return U.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new IT(this)}getSize(e){return U.resolve(this.size)}}class IT extends mT{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?t.push(this.cr.addEntry(e,s)):this.cr.removeEntry(r)}),U.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AT{constructor(e){this.persistence=e,this.Nr=new ns(t=>Yl(t),Xl),this.lastRemoteSnapshotVersion=ce.min(),this.highestTargetId=0,this.Lr=0,this.Br=new rc,this.targetCount=0,this.kr=Yr.Bn()}forEachTarget(e,t){return this.Nr.forEach((r,s)=>t(s)),U.resolve()}getLastRemoteSnapshotVersion(e){return U.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return U.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),U.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Lr&&(this.Lr=t),U.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new Yr(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,U.resolve()}updateTargetData(e,t){return this.Kn(t),U.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,U.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.Nr.forEach((a,l)=>{l.sequenceNumber<=t&&r.get(l.targetId)===null&&(this.Nr.delete(a),i.push(this.removeMatchingKeysForTargetId(e,l.targetId)),s++)}),U.waitFor(i).next(()=>s)}getTargetCount(e){return U.resolve(this.targetCount)}getTargetData(e,t){const r=this.Nr.get(t)||null;return U.resolve(r)}addMatchingKeys(e,t,r){return this.Br.Rr(t,r),U.resolve()}removeMatchingKeys(e,t,r){this.Br.mr(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach(a=>{i.push(s.markPotentiallyOrphaned(e,a))}),U.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),U.resolve()}getMatchingKeysForTargetId(e,t){const r=this.Br.yr(t);return U.resolve(r)}containsKey(e,t){return U.resolve(this.Br.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bT{constructor(e,t){this.qr={},this.overlays={},this.Qr=new Kl(0),this.Kr=!1,this.Kr=!0,this.$r=new ET,this.referenceDelegate=e(this),this.Ur=new AT(this),this.indexManager=new fT,this.remoteDocumentCache=function(s){return new wT(s)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new hT(t),this.Gr=new yT(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new vT,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.qr[e.toKey()];return r||(r=new TT(t,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,r){Y("MemoryPersistence","Starting transaction:",e);const s=new RT(this.Qr.next());return this.referenceDelegate.zr(),r(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(e,t){return U.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,t)))}}class RT extends oE{constructor(e){super(),this.currentSequenceNumber=e}}class sc{constructor(e){this.persistence=e,this.Jr=new rc,this.Yr=null}static Zr(e){return new sc(e)}get Xr(){if(this.Yr)return this.Yr;throw ae()}addReference(e,t,r){return this.Jr.addReference(r,t),this.Xr.delete(r.toString()),U.resolve()}removeReference(e,t,r){return this.Jr.removeReference(r,t),this.Xr.add(r.toString()),U.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),U.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach(s=>this.Xr.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>r.removeTargetData(e,t))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return U.forEach(this.Xr,r=>{const s=ne.fromPath(r);return this.ei(e,s).next(i=>{i||t.removeEntry(s,ce.min())})}).next(()=>(this.Yr=null,t.apply(e)))}updateLimboDocument(e,t){return this.ei(e,t).next(r=>{r?this.Xr.delete(t.toString()):this.Xr.add(t.toString())})}Wr(e){return 0}ei(e,t){return U.or([()=>U.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ic{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.$i=r,this.Ui=s}static Wi(e,t){let r=fe(),s=fe();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new ic(e,t.fromCache,r,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ST{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PT{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return Py()?8:aE(ut())>0?6:4}()}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.Yi(e,t).next(a=>{i.result=a}).next(()=>{if(!i.result)return this.Zi(e,t,s,r).next(a=>{i.result=a})}).next(()=>{if(i.result)return;const a=new ST;return this.Xi(e,t,a).next(l=>{if(i.result=l,this.zi)return this.es(e,t,a,l.size)})}).next(()=>i.result)}es(e,t,r,s){return r.documentReadCount<this.ji?(ws()<=pe.DEBUG&&Y("QueryEngine","SDK will not create cache indexes for query:",xr(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),U.resolve()):(ws()<=pe.DEBUG&&Y("QueryEngine","Query:",xr(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Hi*s?(ws()<=pe.DEBUG&&Y("QueryEngine","The SDK decides to create cache indexes for query:",xr(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Ht(t))):U.resolve())}Yi(e,t){if(_h(t))return U.resolve(null);let r=Ht(t);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=hl(t,null,"F"),r=Ht(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const a=fe(...i);return this.Ji.getDocuments(e,a).next(l=>this.indexManager.getMinOffset(e,r).next(c=>{const d=this.ts(t,l);return this.ns(t,d,a,c.readTime)?this.Yi(e,hl(t,null,"F")):this.rs(e,d,t,c)}))})))}Zi(e,t,r,s){return _h(t)||s.isEqual(ce.min())?U.resolve(null):this.Ji.getDocuments(e,r).next(i=>{const a=this.ts(t,i);return this.ns(t,a,r,s)?U.resolve(null):(ws()<=pe.DEBUG&&Y("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),xr(t)),this.rs(e,a,t,nE(s,-1)).next(l=>l))})}ts(e,t){let r=new Ze(qf(e));return t.forEach((s,i)=>{Fo(e,i)&&(r=r.add(i))}),r}ns(e,t,r,s){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(e,t,r){return ws()<=pe.DEBUG&&Y("QueryEngine","Using full collection scan to execute query:",xr(t)),this.Ji.getDocumentsMatchingQuery(e,t,$n.min(),r)}rs(e,t,r,s){return this.Ji.getDocumentsMatchingQuery(e,r,s).next(i=>(t.forEach(a=>{i=i.insert(a.key,a)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CT{constructor(e,t,r,s){this.persistence=e,this.ss=t,this.serializer=s,this.os=new Oe(ve),this._s=new ns(i=>Yl(i),Xl),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new _T(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.os))}}function kT(n,e,t,r){return new CT(n,e,t,r)}async function up(n,e){const t=ue(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,t.ls(e),t.mutationQueue.getAllMutationBatches(r))).next(i=>{const a=[],l=[];let c=fe();for(const d of s){a.push(d.batchId);for(const f of d.mutations)c=c.add(f.key)}for(const d of i){l.push(d.batchId);for(const f of d.mutations)c=c.add(f.key)}return t.localDocuments.getDocuments(r,c).next(d=>({hs:d,removedBatchIds:a,addedBatchIds:l}))})})}function DT(n,e){const t=ue(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=t.cs.newChangeBuffer({trackRemovals:!0});return function(l,c,d,f){const m=d.batch,E=m.keys();let k=U.resolve();return E.forEach(V=>{k=k.next(()=>f.getEntry(c,V)).next(M=>{const j=d.docVersions.get(V);Ae(j!==null),M.version.compareTo(j)<0&&(m.applyToRemoteDocument(M,d),M.isValidDocument()&&(M.setReadTime(d.commitVersion),f.addEntry(M)))})}),k.next(()=>l.mutationQueue.removeMutationBatch(c,m))}(t,r,e,i).next(()=>i.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let c=fe();for(let d=0;d<l.mutationResults.length;++d)l.mutationResults[d].transformResults.length>0&&(c=c.add(l.batch.mutations[d].key));return c}(e))).next(()=>t.localDocuments.getDocuments(r,s))})}function hp(n){const e=ue(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ur.getLastRemoteSnapshotVersion(t))}function xT(n,e){const t=ue(n),r=e.snapshotVersion;let s=t.os;return t.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const a=t.cs.newChangeBuffer({trackRemovals:!0});s=t.os;const l=[];e.targetChanges.forEach((f,m)=>{const E=s.get(m);if(!E)return;l.push(t.Ur.removeMatchingKeys(i,f.removedDocuments,m).next(()=>t.Ur.addMatchingKeys(i,f.addedDocuments,m)));let k=E.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(m)!==null?k=k.withResumeToken(tt.EMPTY_BYTE_STRING,ce.min()).withLastLimboFreeSnapshotVersion(ce.min()):f.resumeToken.approximateByteSize()>0&&(k=k.withResumeToken(f.resumeToken,r)),s=s.insert(m,k),function(M,j,X){return M.resumeToken.approximateByteSize()===0||j.snapshotVersion.toMicroseconds()-M.snapshotVersion.toMicroseconds()>=3e8?!0:X.addedDocuments.size+X.modifiedDocuments.size+X.removedDocuments.size>0}(E,k,f)&&l.push(t.Ur.updateTargetData(i,k))});let c=pn(),d=fe();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&l.push(t.persistence.referenceDelegate.updateLimboDocument(i,f))}),l.push(VT(i,a,e.documentUpdates).next(f=>{c=f.Ps,d=f.Is})),!r.isEqual(ce.min())){const f=t.Ur.getLastRemoteSnapshotVersion(i).next(m=>t.Ur.setTargetsMetadata(i,i.currentSequenceNumber,r));l.push(f)}return U.waitFor(l).next(()=>a.apply(i)).next(()=>t.localDocuments.getLocalViewOfDocuments(i,c,d)).next(()=>c)}).then(i=>(t.os=s,i))}function VT(n,e,t){let r=fe(),s=fe();return t.forEach(i=>r=r.add(i)),e.getEntries(n,r).next(i=>{let a=pn();return t.forEach((l,c)=>{const d=i.get(l);c.isFoundDocument()!==d.isFoundDocument()&&(s=s.add(l)),c.isNoDocument()&&c.version.isEqual(ce.min())?(e.removeEntry(l,c.readTime),a=a.insert(l,c)):!d.isValidDocument()||c.version.compareTo(d.version)>0||c.version.compareTo(d.version)===0&&d.hasPendingWrites?(e.addEntry(c),a=a.insert(l,c)):Y("LocalStore","Ignoring outdated watch update for ",l,". Current version:",d.version," Watch version:",c.version)}),{Ps:a,Is:s}})}function NT(n,e){const t=ue(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function OT(n,e){const t=ue(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return t.Ur.getTargetData(r,e).next(i=>i?(s=i,U.resolve(s)):t.Ur.allocateTargetId(r).next(a=>(s=new Dn(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.Ur.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=t.os.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.os=t.os.insert(r.targetId,r),t._s.set(e,r.targetId)),r})}async function gl(n,e,t){const r=ue(n),s=r.os.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,a=>r.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!ai(a))throw a;Y("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}r.os=r.os.remove(e),r._s.delete(s.target)}function Ph(n,e,t){const r=ue(n);let s=ce.min(),i=fe();return r.persistence.runTransaction("Execute query","readwrite",a=>function(c,d,f){const m=ue(c),E=m._s.get(f);return E!==void 0?U.resolve(m.os.get(E)):m.Ur.getTargetData(d,f)}(r,a,Ht(e)).next(l=>{if(l)return s=l.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(a,l.targetId).next(c=>{i=c})}).next(()=>r.ss.getDocumentsMatchingQuery(a,e,t?s:ce.min(),t?i:fe())).next(l=>(MT(r,RE(e),l),{documents:l,Ts:i})))}function MT(n,e,t){let r=n.us.get(e)||ce.min();t.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),n.us.set(e,r)}class Ch{constructor(){this.activeTargetIds=xE()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class LT{constructor(){this.so=new Ch,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,r){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Ch,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FT{_o(e){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kh{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){Y("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){Y("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Fi=null;function Oa(){return Fi===null?Fi=function(){return 268435456+Math.round(2147483648*Math.random())}():Fi++,"0x"+Fi.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const UT={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BT{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const st="WebChannelConnection";class jT extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const r=t.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+t.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(t,r,s,i,a){const l=Oa(),c=this.xo(t,r.toUriEncodedString());Y("RestConnection",`Sending RPC '${t}' ${l}:`,c,s);const d={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(d,i,a),this.No(t,c,d,s).then(f=>(Y("RestConnection",`Received RPC '${t}' ${l}: `,f),f),f=>{throw Kr("RestConnection",`RPC '${t}' ${l} failed with error: `,f,"url: ",c,"request:",s),f})}Lo(t,r,s,i,a,l){return this.Mo(t,r,s,i,a)}Oo(t,r,s){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+ts}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((i,a)=>t[a]=i),s&&s.headers.forEach((i,a)=>t[a]=i)}xo(t,r){const s=UT[t];return`${this.Do}/v1/${r}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,r,s){const i=Oa();return new Promise((a,l)=>{const c=new bf;c.setWithCredentials(!0),c.listenOnce(Rf.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case zi.NO_ERROR:const f=c.getResponseJson();Y(st,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(f)),a(f);break;case zi.TIMEOUT:Y(st,`RPC '${e}' ${i} timed out`),l(new Z(F.DEADLINE_EXCEEDED,"Request time out"));break;case zi.HTTP_ERROR:const m=c.getStatus();if(Y(st,`RPC '${e}' ${i} failed with status:`,m,"response text:",c.getResponseText()),m>0){let E=c.getResponseJson();Array.isArray(E)&&(E=E[0]);const k=E==null?void 0:E.error;if(k&&k.status&&k.message){const V=function(j){const X=j.toLowerCase().replace(/_/g,"-");return Object.values(F).indexOf(X)>=0?X:F.UNKNOWN}(k.status);l(new Z(V,k.message))}else l(new Z(F.UNKNOWN,"Server responded with status "+c.getStatus()))}else l(new Z(F.UNAVAILABLE,"Connection failed."));break;default:ae()}}finally{Y(st,`RPC '${e}' ${i} completed.`)}});const d=JSON.stringify(s);Y(st,`RPC '${e}' ${i} sending request:`,s),c.send(t,"POST",d,r,15)})}Bo(e,t,r){const s=Oa(),i=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=Cf(),l=Pf(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(c.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Oo(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const f=i.join("");Y(st,`Creating RPC '${e}' stream ${s}: ${f}`,c);const m=a.createWebChannel(f,c);let E=!1,k=!1;const V=new BT({Io:j=>{k?Y(st,`Not sending because RPC '${e}' stream ${s} is closed:`,j):(E||(Y(st,`Opening RPC '${e}' stream ${s} transport.`),m.open(),E=!0),Y(st,`RPC '${e}' stream ${s} sending:`,j),m.send(j))},To:()=>m.close()}),M=(j,X,ee)=>{j.listen(X,te=>{try{ee(te)}catch(J){setTimeout(()=>{throw J},0)}})};return M(m,Rs.EventType.OPEN,()=>{k||(Y(st,`RPC '${e}' stream ${s} transport opened.`),V.yo())}),M(m,Rs.EventType.CLOSE,()=>{k||(k=!0,Y(st,`RPC '${e}' stream ${s} transport closed`),V.So())}),M(m,Rs.EventType.ERROR,j=>{k||(k=!0,Kr(st,`RPC '${e}' stream ${s} transport errored:`,j),V.So(new Z(F.UNAVAILABLE,"The operation could not be completed")))}),M(m,Rs.EventType.MESSAGE,j=>{var X;if(!k){const ee=j.data[0];Ae(!!ee);const te=ee,J=te.error||((X=te[0])===null||X===void 0?void 0:X.error);if(J){Y(st,`RPC '${e}' stream ${s} received error:`,J);const me=J.status;let _e=function(v){const w=Be[v];if(w!==void 0)return ep(w)}(me),I=J.message;_e===void 0&&(_e=F.INTERNAL,I="Unknown error status: "+me+" with message "+J.message),k=!0,V.So(new Z(_e,I)),m.close()}else Y(st,`RPC '${e}' stream ${s} received:`,ee),V.bo(ee)}}),M(l,Sf.STAT_EVENT,j=>{j.stat===ol.PROXY?Y(st,`RPC '${e}' stream ${s} detected buffering proxy`):j.stat===ol.NOPROXY&&Y(st,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{V.wo()},0),V}}function Ma(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qo(n){return new YE(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dp{constructor(e,t,r=1e3,s=1.5,i=6e4){this.ui=e,this.timerId=t,this.ko=r,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),s=Math.max(0,t-r);s>0&&Y("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fp{constructor(e,t,r,s,i,a,l,c){this.ui=e,this.Ho=r,this.Jo=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=l,this.listener=c,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new dp(e,t)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():t&&t.code===F.RESOURCE_EXHAUSTED?(fn(t.toString()),fn("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===F.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.Yo===t&&this.P_(r,s)},r=>{e(()=>{const s=new Z(F.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(s)})})}P_(e,t){const r=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{r(()=>this.I_(s))}),this.stream.onMessage(s=>{r(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return Y("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget(()=>this.Yo===e?t():(Y("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class $T extends fp{constructor(e,t,r,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}T_(e,t){return this.connection.Bo("Listen",e,t)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const t=eT(this.serializer,e),r=function(i){if(!("targetChange"in i))return ce.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?ce.min():a.readTime?zt(a.readTime):ce.min()}(e);return this.listener.d_(t,r)}A_(e){const t={};t.database=ml(this.serializer),t.addTarget=function(i,a){let l;const c=a.target;if(l=ul(c)?{documents:rT(i,c)}:{query:sT(i,c)._t},l.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){l.resumeToken=rp(i,a.resumeToken);const d=dl(i,a.expectedCount);d!==null&&(l.expectedCount=d)}else if(a.snapshotVersion.compareTo(ce.min())>0){l.readTime=mo(i,a.snapshotVersion.toTimestamp());const d=dl(i,a.expectedCount);d!==null&&(l.expectedCount=d)}return l}(this.serializer,e);const r=oT(this.serializer,e);r&&(t.labels=r),this.a_(t)}R_(e){const t={};t.database=ml(this.serializer),t.removeTarget=e,this.a_(t)}}class qT extends fp{constructor(e,t,r,s,i,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,t){return this.connection.Bo("Write",e,t)}E_(e){return Ae(!!e.streamToken),this.lastStreamToken=e.streamToken,Ae(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){Ae(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const t=nT(e.writeResults,e.commitTime),r=zt(e.commitTime);return this.listener.g_(r,t)}p_(){const e={};e.database=ml(this.serializer),this.a_(e)}m_(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>tT(this.serializer,r))};this.a_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HT extends class{}{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new Z(F.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,r,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.Mo(e,fl(t,r),s,i,a)).catch(i=>{throw i.name==="FirebaseError"?(i.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new Z(F.UNKNOWN,i.toString())})}Lo(e,t,r,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,l])=>this.connection.Lo(e,fl(t,r),s,a,l,i)).catch(a=>{throw a.name==="FirebaseError"?(a.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new Z(F.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class zT{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(fn(t),this.D_=!1):Y("OnlineStateTracker",t)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WT{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(a=>{r.enqueueAndForget(async()=>{_r(this)&&(Y("RemoteStore","Restarting streams for network reachability change."),await async function(c){const d=ue(c);d.L_.add(4),await ui(d),d.q_.set("Unknown"),d.L_.delete(4),await Ho(d)}(this))})}),this.q_=new zT(r,s)}}async function Ho(n){if(_r(n))for(const e of n.B_)await e(!0)}async function ui(n){for(const e of n.B_)await e(!1)}function pp(n,e){const t=ue(n);t.N_.has(e.targetId)||(t.N_.set(e.targetId,e),cc(t)?lc(t):rs(t).r_()&&ac(t,e))}function oc(n,e){const t=ue(n),r=rs(t);t.N_.delete(e),r.r_()&&mp(t,e),t.N_.size===0&&(r.r_()?r.o_():_r(t)&&t.q_.set("Unknown"))}function ac(n,e){if(n.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(ce.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}rs(n).A_(e)}function mp(n,e){n.Q_.xe(e),rs(n).R_(e)}function lc(n){n.Q_=new KE({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>n.N_.get(e)||null,tt:()=>n.datastore.serializer.databaseId}),rs(n).start(),n.q_.v_()}function cc(n){return _r(n)&&!rs(n).n_()&&n.N_.size>0}function _r(n){return ue(n).L_.size===0}function gp(n){n.Q_=void 0}async function KT(n){n.q_.set("Online")}async function GT(n){n.N_.forEach((e,t)=>{ac(n,e)})}async function QT(n,e){gp(n),cc(n)?(n.q_.M_(e),lc(n)):n.q_.set("Unknown")}async function JT(n,e,t){if(n.q_.set("Online"),e instanceof np&&e.state===2&&e.cause)try{await async function(s,i){const a=i.cause;for(const l of i.targetIds)s.N_.has(l)&&(await s.remoteSyncer.rejectListen(l,a),s.N_.delete(l),s.Q_.removeTarget(l))}(n,e)}catch(r){Y("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await go(n,r)}else if(e instanceof Gi?n.Q_.Ke(e):e instanceof tp?n.Q_.He(e):n.Q_.We(e),!t.isEqual(ce.min()))try{const r=await hp(n.localStore);t.compareTo(r)>=0&&await function(i,a){const l=i.Q_.rt(a);return l.targetChanges.forEach((c,d)=>{if(c.resumeToken.approximateByteSize()>0){const f=i.N_.get(d);f&&i.N_.set(d,f.withResumeToken(c.resumeToken,a))}}),l.targetMismatches.forEach((c,d)=>{const f=i.N_.get(c);if(!f)return;i.N_.set(c,f.withResumeToken(tt.EMPTY_BYTE_STRING,f.snapshotVersion)),mp(i,c);const m=new Dn(f.target,c,d,f.sequenceNumber);ac(i,m)}),i.remoteSyncer.applyRemoteEvent(l)}(n,t)}catch(r){Y("RemoteStore","Failed to raise snapshot:",r),await go(n,r)}}async function go(n,e,t){if(!ai(e))throw e;n.L_.add(1),await ui(n),n.q_.set("Offline"),t||(t=()=>hp(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{Y("RemoteStore","Retrying IndexedDB access"),await t(),n.L_.delete(1),await Ho(n)})}function _p(n,e){return e().catch(t=>go(n,t,e))}async function zo(n){const e=ue(n),t=Hn(e);let r=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;YT(e);)try{const s=await NT(e.localStore,r);if(s===null){e.O_.length===0&&t.o_();break}r=s.batchId,XT(e,s)}catch(s){await go(e,s)}yp(e)&&vp(e)}function YT(n){return _r(n)&&n.O_.length<10}function XT(n,e){n.O_.push(e);const t=Hn(n);t.r_()&&t.V_&&t.m_(e.mutations)}function yp(n){return _r(n)&&!Hn(n).n_()&&n.O_.length>0}function vp(n){Hn(n).start()}async function ZT(n){Hn(n).p_()}async function ew(n){const e=Hn(n);for(const t of n.O_)e.m_(t.mutations)}async function tw(n,e,t){const r=n.O_.shift(),s=ec.from(r,e,t);await _p(n,()=>n.remoteSyncer.applySuccessfulWrite(s)),await zo(n)}async function nw(n,e){e&&Hn(n).V_&&await async function(r,s){if(function(a){return HE(a)&&a!==F.ABORTED}(s.code)){const i=r.O_.shift();Hn(r).s_(),await _p(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await zo(r)}}(n,e),yp(n)&&vp(n)}async function Dh(n,e){const t=ue(n);t.asyncQueue.verifyOperationInProgress(),Y("RemoteStore","RemoteStore received new credentials");const r=_r(t);t.L_.add(3),await ui(t),r&&t.q_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.L_.delete(3),await Ho(t)}async function rw(n,e){const t=ue(n);e?(t.L_.delete(2),await Ho(t)):e||(t.L_.add(2),await ui(t),t.q_.set("Unknown"))}function rs(n){return n.K_||(n.K_=function(t,r,s){const i=ue(t);return i.w_(),new $T(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Eo:KT.bind(null,n),Ro:GT.bind(null,n),mo:QT.bind(null,n),d_:JT.bind(null,n)}),n.B_.push(async e=>{e?(n.K_.s_(),cc(n)?lc(n):n.q_.set("Unknown")):(await n.K_.stop(),gp(n))})),n.K_}function Hn(n){return n.U_||(n.U_=function(t,r,s){const i=ue(t);return i.w_(),new qT(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Eo:()=>Promise.resolve(),Ro:ZT.bind(null,n),mo:nw.bind(null,n),f_:ew.bind(null,n),g_:tw.bind(null,n)}),n.B_.push(async e=>{e?(n.U_.s_(),await zo(n)):(await n.U_.stop(),n.O_.length>0&&(Y("RemoteStore",`Stopping write stream with ${n.O_.length} pending writes`),n.O_=[]))})),n.U_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uc{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Mn,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const a=Date.now()+r,l=new uc(e,t,a,s,i);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new Z(F.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function hc(n,e){if(fn("AsyncQueue",`${e}: ${n}`),ai(n))return new Z(F.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jr{constructor(e){this.comparator=e?(t,r)=>e(t,r)||ne.comparator(t.key,r.key):(t,r)=>ne.comparator(t.key,r.key),this.keyedMap=Ss(),this.sortedSet=new Oe(this.comparator)}static emptySet(e){return new jr(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof jr)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new jr;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xh{constructor(){this.W_=new Oe(ne.comparator)}track(e){const t=e.doc.key,r=this.W_.get(t);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(t,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(t):e.type===1&&r.type===2?this.W_=this.W_.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):ae():this.W_=this.W_.insert(t,e)}G_(){const e=[];return this.W_.inorderTraversal((t,r)=>{e.push(r)}),e}}class Xr{constructor(e,t,r,s,i,a,l,c,d){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=l,this.excludesMetadataChanges=c,this.hasCachedResults=d}static fromInitialDocuments(e,t,r,s,i){const a=[];return t.forEach(l=>{a.push({type:0,doc:l})}),new Xr(e,t,jr.emptySet(t),a,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Lo(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sw{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class iw{constructor(){this.queries=Vh(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(t,r){const s=ue(t),i=s.queries;s.queries=Vh(),i.forEach((a,l)=>{for(const c of l.j_)c.onError(r)})})(this,new Z(F.ABORTED,"Firestore shutting down"))}}function Vh(){return new ns(n=>$f(n),Lo)}async function ow(n,e){const t=ue(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.H_()&&e.J_()&&(r=2):(i=new sw,r=e.J_()?0:1);try{switch(r){case 0:i.z_=await t.onListen(s,!0);break;case 1:i.z_=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(a){const l=hc(a,`Initialization of query '${xr(e.query)}' failed`);return void e.onError(l)}t.queries.set(s,i),i.j_.push(e),e.Z_(t.onlineState),i.z_&&e.X_(i.z_)&&dc(t)}async function aw(n,e){const t=ue(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const a=i.j_.indexOf(e);a>=0&&(i.j_.splice(a,1),i.j_.length===0?s=e.J_()?0:1:!i.H_()&&e.J_()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function lw(n,e){const t=ue(n);let r=!1;for(const s of e){const i=s.query,a=t.queries.get(i);if(a){for(const l of a.j_)l.X_(s)&&(r=!0);a.z_=s}}r&&dc(t)}function cw(n,e,t){const r=ue(n),s=r.queries.get(e);if(s)for(const i of s.j_)i.onError(t);r.queries.delete(e)}function dc(n){n.Y_.forEach(e=>{e.next()})}var _l,Nh;(Nh=_l||(_l={})).ea="default",Nh.Cache="cache";class uw{constructor(e,t,r){this.query=e,this.ta=t,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new Xr(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.na?this.ia(e)&&(this.ta.next(e),t=!0):this.sa(e,this.onlineState)&&(this.oa(e),t=!0),this.ra=e,t}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let t=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),t=!0),t}sa(e,t){if(!e.fromCache||!this.J_())return!0;const r=t!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const t=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}oa(e){e=Xr.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==_l.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ep{constructor(e){this.key=e}}class Tp{constructor(e){this.key=e}}class hw{constructor(e,t){this.query=e,this.Ta=t,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=fe(),this.mutatedKeys=fe(),this.Aa=qf(e),this.Ra=new jr(this.Aa)}get Va(){return this.Ta}ma(e,t){const r=t?t.fa:new xh,s=t?t.Ra:this.Ra;let i=t?t.mutatedKeys:this.mutatedKeys,a=s,l=!1;const c=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,d=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((f,m)=>{const E=s.get(f),k=Fo(this.query,m)?m:null,V=!!E&&this.mutatedKeys.has(E.key),M=!!k&&(k.hasLocalMutations||this.mutatedKeys.has(k.key)&&k.hasCommittedMutations);let j=!1;E&&k?E.data.isEqual(k.data)?V!==M&&(r.track({type:3,doc:k}),j=!0):this.ga(E,k)||(r.track({type:2,doc:k}),j=!0,(c&&this.Aa(k,c)>0||d&&this.Aa(k,d)<0)&&(l=!0)):!E&&k?(r.track({type:0,doc:k}),j=!0):E&&!k&&(r.track({type:1,doc:E}),j=!0,(c||d)&&(l=!0)),j&&(k?(a=a.add(k),i=M?i.add(f):i.delete(f)):(a=a.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const f=this.query.limitType==="F"?a.last():a.first();a=a.delete(f.key),i=i.delete(f.key),r.track({type:1,doc:f})}return{Ra:a,fa:r,ns:l,mutatedKeys:i}}ga(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const a=e.fa.G_();a.sort((f,m)=>function(k,V){const M=j=>{switch(j){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return ae()}};return M(k)-M(V)}(f.type,m.type)||this.Aa(f.doc,m.doc)),this.pa(r),s=s!=null&&s;const l=t&&!s?this.ya():[],c=this.da.size===0&&this.current&&!s?1:0,d=c!==this.Ea;return this.Ea=c,a.length!==0||d?{snapshot:new Xr(this.query,e.Ra,i,a,e.mutatedKeys,c===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:l}:{wa:l}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new xh,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(t=>this.Ta=this.Ta.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ta=this.Ta.delete(t)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=fe(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const t=[];return e.forEach(r=>{this.da.has(r)||t.push(new Tp(r))}),this.da.forEach(r=>{e.has(r)||t.push(new Ep(r))}),t}ba(e){this.Ta=e.Ts,this.da=fe();const t=this.ma(e.documents);return this.applyChanges(t,!0)}Da(){return Xr.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class dw{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class fw{constructor(e){this.key=e,this.va=!1}}class pw{constructor(e,t,r,s,i,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new ns(l=>$f(l),Lo),this.Ma=new Map,this.xa=new Set,this.Oa=new Oe(ne.comparator),this.Na=new Map,this.La=new rc,this.Ba={},this.ka=new Map,this.qa=Yr.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function mw(n,e,t=!0){const r=Sp(n);let s;const i=r.Fa.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await wp(r,e,t,!0),s}async function gw(n,e){const t=Sp(n);await wp(t,e,!0,!1)}async function wp(n,e,t,r){const s=await OT(n.localStore,Ht(e)),i=s.targetId,a=n.sharedClientState.addLocalQueryTarget(i,t);let l;return r&&(l=await _w(n,e,i,a==="current",s.resumeToken)),n.isPrimaryClient&&t&&pp(n.remoteStore,s),l}async function _w(n,e,t,r,s){n.Ka=(m,E,k)=>async function(M,j,X,ee){let te=j.view.ma(X);te.ns&&(te=await Ph(M.localStore,j.query,!1).then(({documents:I})=>j.view.ma(I,te)));const J=ee&&ee.targetChanges.get(j.targetId),me=ee&&ee.targetMismatches.get(j.targetId)!=null,_e=j.view.applyChanges(te,M.isPrimaryClient,J,me);return Mh(M,j.targetId,_e.wa),_e.snapshot}(n,m,E,k);const i=await Ph(n.localStore,e,!0),a=new hw(e,i.Ts),l=a.ma(i.documents),c=ci.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),d=a.applyChanges(l,n.isPrimaryClient,c);Mh(n,t,d.wa);const f=new dw(e,t,a);return n.Fa.set(e,f),n.Ma.has(t)?n.Ma.get(t).push(e):n.Ma.set(t,[e]),d.snapshot}async function yw(n,e,t){const r=ue(n),s=r.Fa.get(e),i=r.Ma.get(s.targetId);if(i.length>1)return r.Ma.set(s.targetId,i.filter(a=>!Lo(a,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await gl(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),t&&oc(r.remoteStore,s.targetId),yl(r,s.targetId)}).catch(oi)):(yl(r,s.targetId),await gl(r.localStore,s.targetId,!0))}async function vw(n,e){const t=ue(n),r=t.Fa.get(e),s=t.Ma.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),oc(t.remoteStore,r.targetId))}async function Ew(n,e,t){const r=Sw(n);try{const s=await function(a,l){const c=ue(a),d=He.now(),f=l.reduce((k,V)=>k.add(V.key),fe());let m,E;return c.persistence.runTransaction("Locally write mutations","readwrite",k=>{let V=pn(),M=fe();return c.cs.getEntries(k,f).next(j=>{V=j,V.forEach((X,ee)=>{ee.isValidDocument()||(M=M.add(X))})}).next(()=>c.localDocuments.getOverlayedDocuments(k,V)).next(j=>{m=j;const X=[];for(const ee of l){const te=UE(ee,m.get(ee.key).overlayedDocument);te!=null&&X.push(new Gn(ee.key,te,Nf(te.value.mapValue),bt.exists(!0)))}return c.mutationQueue.addMutationBatch(k,d,X,l)}).next(j=>{E=j;const X=j.applyToLocalDocumentSet(m,M);return c.documentOverlayCache.saveOverlays(k,j.batchId,X)})}).then(()=>({batchId:E.batchId,changes:zf(m)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(a,l,c){let d=a.Ba[a.currentUser.toKey()];d||(d=new Oe(ve)),d=d.insert(l,c),a.Ba[a.currentUser.toKey()]=d}(r,s.batchId,t),await hi(r,s.changes),await zo(r.remoteStore)}catch(s){const i=hc(s,"Failed to persist write");t.reject(i)}}async function Ip(n,e){const t=ue(n);try{const r=await xT(t.localStore,e);e.targetChanges.forEach((s,i)=>{const a=t.Na.get(i);a&&(Ae(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?a.va=!0:s.modifiedDocuments.size>0?Ae(a.va):s.removedDocuments.size>0&&(Ae(a.va),a.va=!1))}),await hi(t,r,e)}catch(r){await oi(r)}}function Oh(n,e,t){const r=ue(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Fa.forEach((i,a)=>{const l=a.view.Z_(e);l.snapshot&&s.push(l.snapshot)}),function(a,l){const c=ue(a);c.onlineState=l;let d=!1;c.queries.forEach((f,m)=>{for(const E of m.j_)E.Z_(l)&&(d=!0)}),d&&dc(c)}(r.eventManager,e),s.length&&r.Ca.d_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function Tw(n,e,t){const r=ue(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Na.get(e),i=s&&s.key;if(i){let a=new Oe(ne.comparator);a=a.insert(i,lt.newNoDocument(i,ce.min()));const l=fe().add(i),c=new $o(ce.min(),new Map,new Oe(ve),a,l);await Ip(r,c),r.Oa=r.Oa.remove(i),r.Na.delete(e),fc(r)}else await gl(r.localStore,e,!1).then(()=>yl(r,e,t)).catch(oi)}async function ww(n,e){const t=ue(n),r=e.batch.batchId;try{const s=await DT(t.localStore,e);bp(t,r,null),Ap(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await hi(t,s)}catch(s){await oi(s)}}async function Iw(n,e,t){const r=ue(n);try{const s=await function(a,l){const c=ue(a);return c.persistence.runTransaction("Reject batch","readwrite-primary",d=>{let f;return c.mutationQueue.lookupMutationBatch(d,l).next(m=>(Ae(m!==null),f=m.keys(),c.mutationQueue.removeMutationBatch(d,m))).next(()=>c.mutationQueue.performConsistencyCheck(d)).next(()=>c.documentOverlayCache.removeOverlaysForBatchId(d,f,l)).next(()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,f)).next(()=>c.localDocuments.getDocuments(d,f))})}(r.localStore,e);bp(r,e,t),Ap(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await hi(r,s)}catch(s){await oi(s)}}function Ap(n,e){(n.ka.get(e)||[]).forEach(t=>{t.resolve()}),n.ka.delete(e)}function bp(n,e,t){const r=ue(n);let s=r.Ba[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.Ba[r.currentUser.toKey()]=s}}function yl(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Ma.get(e))n.Fa.delete(r),t&&n.Ca.$a(r,t);n.Ma.delete(e),n.isPrimaryClient&&n.La.gr(e).forEach(r=>{n.La.containsKey(r)||Rp(n,r)})}function Rp(n,e){n.xa.delete(e.path.canonicalString());const t=n.Oa.get(e);t!==null&&(oc(n.remoteStore,t),n.Oa=n.Oa.remove(e),n.Na.delete(t),fc(n))}function Mh(n,e,t){for(const r of t)r instanceof Ep?(n.La.addReference(r.key,e),Aw(n,r)):r instanceof Tp?(Y("SyncEngine","Document no longer in limbo: "+r.key),n.La.removeReference(r.key,e),n.La.containsKey(r.key)||Rp(n,r.key)):ae()}function Aw(n,e){const t=e.key,r=t.path.canonicalString();n.Oa.get(t)||n.xa.has(r)||(Y("SyncEngine","New document in limbo: "+t),n.xa.add(r),fc(n))}function fc(n){for(;n.xa.size>0&&n.Oa.size<n.maxConcurrentLimboResolutions;){const e=n.xa.values().next().value;n.xa.delete(e);const t=new ne(xe.fromString(e)),r=n.qa.next();n.Na.set(r,new fw(t)),n.Oa=n.Oa.insert(t,r),pp(n.remoteStore,new Dn(Ht(jf(t.path)),r,"TargetPurposeLimboResolution",Kl.oe))}}async function hi(n,e,t){const r=ue(n),s=[],i=[],a=[];r.Fa.isEmpty()||(r.Fa.forEach((l,c)=>{a.push(r.Ka(c,e,t).then(d=>{var f;if((d||t)&&r.isPrimaryClient){const m=d?!d.fromCache:(f=t==null?void 0:t.targetChanges.get(c.targetId))===null||f===void 0?void 0:f.current;r.sharedClientState.updateQueryState(c.targetId,m?"current":"not-current")}if(d){s.push(d);const m=ic.Wi(c.targetId,d);i.push(m)}}))}),await Promise.all(a),r.Ca.d_(s),await async function(c,d){const f=ue(c);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>U.forEach(d,E=>U.forEach(E.$i,k=>f.persistence.referenceDelegate.addReference(m,E.targetId,k)).next(()=>U.forEach(E.Ui,k=>f.persistence.referenceDelegate.removeReference(m,E.targetId,k)))))}catch(m){if(!ai(m))throw m;Y("LocalStore","Failed to update sequence numbers: "+m)}for(const m of d){const E=m.targetId;if(!m.fromCache){const k=f.os.get(E),V=k.snapshotVersion,M=k.withLastLimboFreeSnapshotVersion(V);f.os=f.os.insert(E,M)}}}(r.localStore,i))}async function bw(n,e){const t=ue(n);if(!t.currentUser.isEqual(e)){Y("SyncEngine","User change. New user:",e.toKey());const r=await up(t.localStore,e);t.currentUser=e,function(i,a){i.ka.forEach(l=>{l.forEach(c=>{c.reject(new Z(F.CANCELLED,a))})}),i.ka.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await hi(t,r.hs)}}function Rw(n,e){const t=ue(n),r=t.Na.get(e);if(r&&r.va)return fe().add(r.key);{let s=fe();const i=t.Ma.get(e);if(!i)return s;for(const a of i){const l=t.Fa.get(a);s=s.unionWith(l.view.Va)}return s}}function Sp(n){const e=ue(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Ip.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=Rw.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=Tw.bind(null,e),e.Ca.d_=lw.bind(null,e.eventManager),e.Ca.$a=cw.bind(null,e.eventManager),e}function Sw(n){const e=ue(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=ww.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=Iw.bind(null,e),e}class _o{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=qo(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return kT(this.persistence,new PT,e.initialUser,this.serializer)}Ga(e){return new bT(sc.Zr,this.serializer)}Wa(e){return new LT}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}_o.provider={build:()=>new _o};class vl{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Oh(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=bw.bind(null,this.syncEngine),await rw(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new iw}()}createDatastore(e){const t=qo(e.databaseInfo.databaseId),r=function(i){return new jT(i)}(e.databaseInfo);return function(i,a,l,c){return new HT(i,a,l,c)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,s,i,a,l){return new WT(r,s,i,a,l)}(this.localStore,this.datastore,e.asyncQueue,t=>Oh(this.syncEngine,t,0),function(){return kh.D()?new kh:new FT}())}createSyncEngine(e,t){return function(s,i,a,l,c,d,f){const m=new pw(s,i,a,l,c,d);return f&&(m.Qa=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const i=ue(s);Y("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await ui(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}vl.provider={build:()=>new vl};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pw{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):fn("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cw{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=s,this.user=it.UNAUTHENTICATED,this.clientId=Df.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async a=>{Y("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(Y("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Mn;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=hc(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function La(n,e){n.asyncQueue.verifyOperationInProgress(),Y("FirestoreClient","Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async s=>{r.isEqual(s)||(await up(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function Lh(n,e){n.asyncQueue.verifyOperationInProgress();const t=await kw(n);Y("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>Dh(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,s)=>Dh(e.remoteStore,s)),n._onlineComponents=e}async function kw(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){Y("FirestoreClient","Using user provided OfflineComponentProvider");try{await La(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===F.FAILED_PRECONDITION||s.code===F.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;Kr("Error using user provided cache. Falling back to memory cache: "+t),await La(n,new _o)}}else Y("FirestoreClient","Using default OfflineComponentProvider"),await La(n,new _o);return n._offlineComponents}async function Pp(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(Y("FirestoreClient","Using user provided OnlineComponentProvider"),await Lh(n,n._uninitializedComponentsProvider._online)):(Y("FirestoreClient","Using default OnlineComponentProvider"),await Lh(n,new vl))),n._onlineComponents}function Dw(n){return Pp(n).then(e=>e.syncEngine)}async function xw(n){const e=await Pp(n),t=e.eventManager;return t.onListen=mw.bind(null,e.syncEngine),t.onUnlisten=yw.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=gw.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=vw.bind(null,e.syncEngine),t}function Vw(n,e,t={}){const r=new Mn;return n.asyncQueue.enqueueAndForget(async()=>function(i,a,l,c,d){const f=new Pw({next:E=>{f.Za(),a.enqueueAndForget(()=>aw(i,m)),E.fromCache&&c.source==="server"?d.reject(new Z(F.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(E)},error:E=>d.reject(E)}),m=new uw(l,f,{includeMetadataChanges:!0,_a:!0});return ow(i,m)}(await xw(n),n.asyncQueue,e,t,r)),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cp(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fh=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kp(n,e,t){if(!t)throw new Z(F.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function Nw(n,e,t,r){if(e===!0&&r===!0)throw new Z(F.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Uh(n){if(!ne.isDocumentKey(n))throw new Z(F.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Bh(n){if(ne.isDocumentKey(n))throw new Z(F.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function pc(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":ae()}function dr(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new Z(F.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=pc(n);throw new Z(F.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jh{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new Z(F.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new Z(F.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Nw("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Cp((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new Z(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new Z(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new Z(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Wo{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new jh({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new Z(F.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new Z(F.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new jh(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Kv;switch(r.type){case"firstParty":return new Yv(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new Z(F.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=Fh.get(t);r&&(Y("ComponentProvider","Removing Datastore"),Fh.delete(t),r.terminate())}(this),Promise.resolve()}}function Ow(n,e,t,r={}){var s;const i=(n=dr(n,Wo))._getSettings(),a=`${e}:${t}`;if(i.host!=="firestore.googleapis.com"&&i.host!==a&&Kr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),n._setSettings(Object.assign(Object.assign({},i),{host:a,ssl:!1})),r.mockUserToken){let l,c;if(typeof r.mockUserToken=="string")l=r.mockUserToken,c=it.MOCK_USER;else{l=Ty(r.mockUserToken,(s=n._app)===null||s===void 0?void 0:s.options.projectId);const d=r.mockUserToken.sub||r.mockUserToken.user_id;if(!d)throw new Z(F.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");c=new it(d)}n._authCredentials=new Gv(new kf(l,c))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ko{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Ko(this.firestore,e,this._query)}}class Dt{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Ln(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Dt(this.firestore,e,this._key)}}class Ln extends Ko{constructor(e,t,r){super(e,t,jf(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Dt(this.firestore,null,new ne(e))}withConverter(e){return new Ln(this.firestore,e,this._path)}}function Qn(n,e,...t){if(n=_t(n),kp("collection","path",e),n instanceof Wo){const r=xe.fromString(e,...t);return Bh(r),new Ln(n,null,r)}{if(!(n instanceof Dt||n instanceof Ln))throw new Z(F.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(xe.fromString(e,...t));return Bh(r),new Ln(n.firestore,null,r)}}function mn(n,e,...t){if(n=_t(n),arguments.length===1&&(e=Df.newId()),kp("doc","path",e),n instanceof Wo){const r=xe.fromString(e,...t);return Uh(r),new Dt(n,null,new ne(r))}{if(!(n instanceof Dt||n instanceof Ln))throw new Z(F.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(xe.fromString(e,...t));return Uh(r),new Dt(n.firestore,n instanceof Ln?n.converter:null,new ne(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $h{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new dp(this,"async_queue_retry"),this.Vu=()=>{const r=Ma();r&&Y("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const t=Ma();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=Ma();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new Mn;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!ai(e))throw e;Y("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const s=function(a){let l=a.message||"";return a.stack&&(l=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),l}(r);throw fn("INTERNAL UNHANDLED ERROR: ",s),r}).then(r=>(this.du=!1,r))));return this.mu=t,t}enqueueAfterDelay(e,t,r){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const s=uc.createAndSchedule(this,e,t,r,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&ae()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}class di extends Wo{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new $h,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new $h(e),this._firestoreClient=void 0,await e}}}function Mw(n,e){const t=typeof n=="object"?n:Tf(),r=typeof n=="string"?n:e||"(default)",s=zl(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=vy("firestore");i&&Ow(s,...i)}return s}function mc(n){if(n._terminated)throw new Z(F.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||Lw(n),n._firestoreClient}function Lw(n){var e,t,r;const s=n._freezeSettings(),i=function(l,c,d,f){return new uE(l,c,d,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Cp(f.experimentalLongPollingOptions),f.useFetchStreams)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,s);n._componentsProvider||!((t=s.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),n._firestoreClient=new Cw(n._authCredentials,n._appCheckCredentials,n._queue,i,n._componentsProvider&&function(l){const c=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(c),_online:c}}(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zr{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Zr(tt.fromBase64String(e))}catch(t){throw new Z(F.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Zr(tt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Go{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new Z(F.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Ye(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gc{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _c{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new Z(F.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new Z(F.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return ve(this._lat,e._lat)||ve(this._long,e._long)}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yc{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fw=/^__.*__$/;class Uw{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new Gn(e,this.data,this.fieldMask,t,this.fieldTransforms):new li(e,this.data,t,this.fieldTransforms)}}class Dp{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new Gn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function xp(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw ae()}}class vc{constructor(e,t,r,s,i,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.vu(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new vc(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Fu({path:r,xu:!1});return s.Ou(e),s}Nu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Fu({path:r,xu:!1});return s.vu(),s}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return yo(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(xp(this.Cu)&&Fw.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class Bw{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||qo(e)}Qu(e,t,r,s=!1){return new vc({Cu:e,methodName:t,qu:r,path:Ye.emptyPath(),xu:!1,ku:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Vp(n){const e=n._freezeSettings(),t=qo(n._databaseId);return new Bw(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Np(n,e,t,r,s,i={}){const a=n.Qu(i.merge||i.mergeFields?2:0,e,t,s);Ec("Data must be an object, but it was:",a,r);const l=Op(r,a);let c,d;if(i.merge)c=new At(a.fieldMask),d=a.fieldTransforms;else if(i.mergeFields){const f=[];for(const m of i.mergeFields){const E=El(e,m,t);if(!a.contains(E))throw new Z(F.INVALID_ARGUMENT,`Field '${E}' is specified in your field mask but missing from your input data.`);Lp(f,E)||f.push(E)}c=new At(f),d=a.fieldTransforms.filter(m=>c.covers(m.field))}else c=null,d=a.fieldTransforms;return new Uw(new vt(l),c,d)}class Qo extends gc{_toFieldTransform(e){if(e.Cu!==2)throw e.Cu===1?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Qo}}function jw(n,e,t,r){const s=n.Qu(1,e,t);Ec("Data must be an object, but it was:",s,r);const i=[],a=vt.empty();gr(r,(c,d)=>{const f=Tc(e,c,t);d=_t(d);const m=s.Nu(f);if(d instanceof Qo)i.push(f);else{const E=Jo(d,m);E!=null&&(i.push(f),a.set(f,E))}});const l=new At(i);return new Dp(a,l,s.fieldTransforms)}function $w(n,e,t,r,s,i){const a=n.Qu(1,e,t),l=[El(e,r,t)],c=[s];if(i.length%2!=0)throw new Z(F.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let E=0;E<i.length;E+=2)l.push(El(e,i[E])),c.push(i[E+1]);const d=[],f=vt.empty();for(let E=l.length-1;E>=0;--E)if(!Lp(d,l[E])){const k=l[E];let V=c[E];V=_t(V);const M=a.Nu(k);if(V instanceof Qo)d.push(k);else{const j=Jo(V,M);j!=null&&(d.push(k),f.set(k,j))}}const m=new At(d);return new Dp(f,m,a.fieldTransforms)}function Jo(n,e){if(Mp(n=_t(n)))return Ec("Unsupported field value:",e,n),Op(n,e);if(n instanceof gc)return function(r,s){if(!xp(s.Cu))throw s.Bu(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Bu(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,s){const i=[];let a=0;for(const l of r){let c=Jo(l,s.Lu(a));c==null&&(c={nullValue:"NULL_VALUE"}),i.push(c),a++}return{arrayValue:{values:i}}}(n,e)}return function(r,s){if((r=_t(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return VE(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=He.fromDate(r);return{timestampValue:mo(s.serializer,i)}}if(r instanceof He){const i=new He(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:mo(s.serializer,i)}}if(r instanceof _c)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Zr)return{bytesValue:rp(s.serializer,r._byteString)};if(r instanceof Dt){const i=s.databaseId,a=r.firestore._databaseId;if(!a.isEqual(i))throw s.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:nc(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof yc)return function(a,l){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(c=>{if(typeof c!="number")throw l.Bu("VectorValues must only contain numeric values.");return Zl(l.serializer,c)})}}}}}}(r,s);throw s.Bu(`Unsupported field value: ${pc(r)}`)}(n,e)}function Op(n,e){const t={};return xf(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):gr(n,(r,s)=>{const i=Jo(s,e.Mu(r));i!=null&&(t[r]=i)}),{mapValue:{fields:t}}}function Mp(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof He||n instanceof _c||n instanceof Zr||n instanceof Dt||n instanceof gc||n instanceof yc)}function Ec(n,e,t){if(!Mp(t)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(t)){const r=pc(t);throw r==="an object"?e.Bu(n+" a custom object"):e.Bu(n+" "+r)}}function El(n,e,t){if((e=_t(e))instanceof Go)return e._internalPath;if(typeof e=="string")return Tc(n,e);throw yo("Field path arguments must be of type string or ",n,!1,void 0,t)}const qw=new RegExp("[~\\*/\\[\\]]");function Tc(n,e,t){if(e.search(qw)>=0)throw yo(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Go(...e.split("."))._internalPath}catch{throw yo(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function yo(n,e,t,r,s){const i=r&&!r.isEmpty(),a=s!==void 0;let l=`Function ${e}() called with invalid data`;t&&(l+=" (via `toFirestore()`)"),l+=". ";let c="";return(i||a)&&(c+=" (found",i&&(c+=` in field ${r}`),a&&(c+=` in document ${s}`),c+=")"),new Z(F.INVALID_ARGUMENT,l+n+c)}function Lp(n,e){return n.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fp{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Dt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Hw(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(Up("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Hw extends Fp{data(){return super.data()}}function Up(n,e){return typeof e=="string"?Tc(n,e):e instanceof Go?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zw(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new Z(F.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Ww{convertValue(e,t="none"){switch(hr(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Ue(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(ur(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw ae()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return gr(e,(s,i)=>{r[s]=this.convertValue(i,t)}),r}convertVectorValue(e){var t,r,s;const i=(s=(r=(t=e.fields)===null||t===void 0?void 0:t.value.arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(a=>Ue(a.doubleValue));return new yc(i)}convertGeoPoint(e){return new _c(Ue(e.latitude),Ue(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Ql(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Js(e));default:return null}}convertTimestamp(e){const t=qn(e);return new He(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=xe.fromString(e);Ae(cp(r));const s=new Ys(r.get(1),r.get(3)),i=new ne(r.popFirst(5));return s.isEqual(t)||fn(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bp(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ui{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Kw extends Fp{constructor(e,t,r,s,i,a){super(e,t,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Qi(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Up("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class Qi extends Kw{data(e={}){return super.data(e)}}class Gw{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Ui(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new Qi(this._firestore,this._userDataWriter,r.key,r,new Ui(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new Z(F.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(l=>{const c=new Qi(s._firestore,s._userDataWriter,l.doc.key,l.doc,new Ui(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);return l.doc,{type:"added",doc:c,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(l=>i||l.type!==3).map(l=>{const c=new Qi(s._firestore,s._userDataWriter,l.doc.key,l.doc,new Ui(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);let d=-1,f=-1;return l.type!==0&&(d=a.indexOf(l.doc.key),a=a.delete(l.doc.key)),l.type!==1&&(a=a.add(l.doc),f=a.indexOf(l.doc.key)),{type:Qw(l.type),doc:c,oldIndex:d,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function Qw(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return ae()}}class Jw extends Ww{constructor(e){super(),this.firestore=e}convertBytes(e){return new Zr(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Dt(this.firestore,null,t)}}function ss(n){n=dr(n,Ko);const e=dr(n.firestore,di),t=mc(e),r=new Jw(e);return zw(n._query),Vw(t,n._query).then(s=>new Gw(e,r,n,s))}function is(n,e,t){n=dr(n,Dt);const r=dr(n.firestore,di),s=Bp(n.converter,e,t);return wc(r,[Np(Vp(r),"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,bt.none())])}function Tl(n){return wc(dr(n.firestore,di),[new jo(n._key,bt.none())])}function wc(n,e){return function(r,s){const i=new Mn;return r.asyncQueue.enqueueAndForget(async()=>Ew(await Dw(r),s,i)),i.promise}(mc(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yw{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=Vp(e)}set(e,t,r){this._verifyNotCommitted();const s=Fa(e,this._firestore),i=Bp(s.converter,t,r),a=Np(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(a.toMutation(s._key,bt.none())),this}update(e,t,r,...s){this._verifyNotCommitted();const i=Fa(e,this._firestore);let a;return a=typeof(t=_t(t))=="string"||t instanceof Go?$w(this._dataReader,"WriteBatch.update",i._key,t,r,s):jw(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(a.toMutation(i._key,bt.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=Fa(e,this._firestore);return this._mutations=this._mutations.concat(new jo(t._key,bt.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new Z(F.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function Fa(n,e){if((n=_t(n)).firestore!==e)throw new Z(F.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jp(n){return mc(n=dr(n,di)),new Yw(n,e=>wc(n,e))}(function(e,t=!0){(function(s){ts=s})(es),Wr(new lr("firestore",(r,{instanceIdentifier:s,options:i})=>{const a=r.getProvider("app").getImmediate(),l=new di(new Qv(r.getProvider("auth-internal")),new Zv(r.getProvider("app-check-internal")),function(d,f){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new Z(F.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Ys(d.options.projectId,f)}(a,s),a);return i=Object.assign({useFetchStreams:t},i),l._setSettings(i),l},"PUBLIC").setMultipleInstances(!0)),On(ah,"4.7.3",e),On(ah,"4.7.3","esm2017")})();function Ic(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(n);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(n,r[s])&&(t[r[s]]=n[r[s]]);return t}function $p(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Xw=$p,qp=new si("auth","Firebase",$p());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vo=new ql("@firebase/auth");function Zw(n,...e){vo.logLevel<=pe.WARN&&vo.warn(`Auth (${es}): ${n}`,...e)}function Ji(n,...e){vo.logLevel<=pe.ERROR&&vo.error(`Auth (${es}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gn(n,...e){throw Ac(n,...e)}function Wt(n,...e){return Ac(n,...e)}function Hp(n,e,t){const r=Object.assign(Object.assign({},Xw()),{[e]:t});return new si("auth","Firebase",r).create(e,{appName:n.name})}function Fn(n){return Hp(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Ac(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return qp.create(n,...e)}function oe(n,e,...t){if(!n)throw Ac(e,...t)}function on(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Ji(e),new Error(e)}function _n(n,e){n||on(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wl(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function eI(){return qh()==="http:"||qh()==="https:"}function qh(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tI(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(eI()||by()||"connection"in navigator)?navigator.onLine:!0}function nI(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fi{constructor(e,t){this.shortDelay=e,this.longDelay=t,_n(t>e,"Short delay should be less than long delay!"),this.isMobile=wy()||Ry()}get(){return tI()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bc(n,e){_n(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zp{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;on("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;on("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;on("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const rI={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sI=new fi(3e4,6e4);function Yo(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function os(n,e,t,r,s={}){return Wp(n,s,async()=>{let i={},a={};r&&(e==="GET"?a=r:i={body:JSON.stringify(r)});const l=ii(Object.assign({key:n.config.apiKey},a)).slice(1),c=await n._getAdditionalHeaders();c["Content-Type"]="application/json",n.languageCode&&(c["X-Firebase-Locale"]=n.languageCode);const d=Object.assign({method:e,headers:c},i);return Ay()||(d.referrerPolicy="no-referrer"),zp.fetch()(Gp(n,n.config.apiHost,t,l),d)})}async function Wp(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},rI),e);try{const s=new iI(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const a=await i.json();if("needConfirmation"in a)throw Bi(n,"account-exists-with-different-credential",a);if(i.ok&&!("errorMessage"in a))return a;{const l=i.ok?a.errorMessage:a.error.message,[c,d]=l.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Bi(n,"credential-already-in-use",a);if(c==="EMAIL_EXISTS")throw Bi(n,"email-already-in-use",a);if(c==="USER_DISABLED")throw Bi(n,"user-disabled",a);const f=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw Hp(n,f,d);gn(n,f)}}catch(s){if(s instanceof vn)throw s;gn(n,"network-request-failed",{message:String(s)})}}async function Kp(n,e,t,r,s={}){const i=await os(n,e,t,r,s);return"mfaPendingCredential"in i&&gn(n,"multi-factor-auth-required",{_serverResponse:i}),i}function Gp(n,e,t,r){const s=`${e}${t}?${r}`;return n.config.emulator?bc(n.config,s):`${n.config.apiScheme}://${s}`}class iI{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(Wt(this.auth,"network-request-failed")),sI.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function Bi(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=Wt(n,e,r);return s.customData._tokenResponse=t,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function oI(n,e){return os(n,"POST","/v1/accounts:delete",e)}async function Qp(n,e){return os(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bs(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function aI(n,e=!1){const t=_t(n),r=await t.getIdToken(e),s=Rc(r);oe(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,a=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Bs(Ua(s.auth_time)),issuedAtTime:Bs(Ua(s.iat)),expirationTime:Bs(Ua(s.exp)),signInProvider:a||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Ua(n){return Number(n)*1e3}function Rc(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Ji("JWT malformed, contained fewer than 3 sections"),null;try{const s=pf(t);return s?JSON.parse(s):(Ji("Failed to decode base64 JWT payload"),null)}catch(s){return Ji("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Hh(n){const e=Rc(n);return oe(e,"internal-error"),oe(typeof e.exp<"u","internal-error"),oe(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ti(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof vn&&lI(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function lI({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cI{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Il{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Bs(this.lastLoginAt),this.creationTime=Bs(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Eo(n){var e;const t=n.auth,r=await n.getIdToken(),s=await ti(n,Qp(t,{idToken:r}));oe(s==null?void 0:s.users.length,t,"internal-error");const i=s.users[0];n._notifyReloadListener(i);const a=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?Jp(i.providerUserInfo):[],l=hI(n.providerData,a),c=n.isAnonymous,d=!(n.email&&i.passwordHash)&&!(l!=null&&l.length),f=c?d:!1,m={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:l,metadata:new Il(i.createdAt,i.lastLoginAt),isAnonymous:f};Object.assign(n,m)}async function uI(n){const e=_t(n);await Eo(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function hI(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Jp(n){return n.map(e=>{var{providerId:t}=e,r=Ic(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dI(n,e){const t=await Wp(n,{},async()=>{const r=ii({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,a=Gp(n,s,"/v1/token",`key=${i}`),l=await n._getAdditionalHeaders();return l["Content-Type"]="application/x-www-form-urlencoded",zp.fetch()(a,{method:"POST",headers:l,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function fI(n,e){return os(n,"POST","/v2/accounts:revokeToken",Yo(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $r{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){oe(e.idToken,"internal-error"),oe(typeof e.idToken<"u","internal-error"),oe(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Hh(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){oe(e.length!==0,"internal-error");const t=Hh(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(oe(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await dI(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,a=new $r;return r&&(oe(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(oe(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),i&&(oe(typeof i=="number","internal-error",{appName:e}),a.expirationTime=i),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new $r,this.toJSON())}_performRefresh(){return on("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function An(n,e){oe(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class an{constructor(e){var{uid:t,auth:r,stsTokenManager:s}=e,i=Ic(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new cI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Il(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await ti(this,this.stsTokenManager.getToken(this.auth,e));return oe(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return aI(this,e)}reload(){return uI(this)}_assign(e){this!==e&&(oe(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new an(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){oe(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await Eo(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(sn(this.auth.app))return Promise.reject(Fn(this.auth));const e=await this.getIdToken();return await ti(this,oI(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,s,i,a,l,c,d,f;const m=(r=t.displayName)!==null&&r!==void 0?r:void 0,E=(s=t.email)!==null&&s!==void 0?s:void 0,k=(i=t.phoneNumber)!==null&&i!==void 0?i:void 0,V=(a=t.photoURL)!==null&&a!==void 0?a:void 0,M=(l=t.tenantId)!==null&&l!==void 0?l:void 0,j=(c=t._redirectEventId)!==null&&c!==void 0?c:void 0,X=(d=t.createdAt)!==null&&d!==void 0?d:void 0,ee=(f=t.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:te,emailVerified:J,isAnonymous:me,providerData:_e,stsTokenManager:I}=t;oe(te&&I,e,"internal-error");const g=$r.fromJSON(this.name,I);oe(typeof te=="string",e,"internal-error"),An(m,e.name),An(E,e.name),oe(typeof J=="boolean",e,"internal-error"),oe(typeof me=="boolean",e,"internal-error"),An(k,e.name),An(V,e.name),An(M,e.name),An(j,e.name),An(X,e.name),An(ee,e.name);const v=new an({uid:te,auth:e,email:E,emailVerified:J,displayName:m,isAnonymous:me,photoURL:V,phoneNumber:k,tenantId:M,stsTokenManager:g,createdAt:X,lastLoginAt:ee});return _e&&Array.isArray(_e)&&(v.providerData=_e.map(w=>Object.assign({},w))),j&&(v._redirectEventId=j),v}static async _fromIdTokenResponse(e,t,r=!1){const s=new $r;s.updateFromServerResponse(t);const i=new an({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await Eo(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];oe(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Jp(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),l=new $r;l.updateFromIdToken(r);const c=new an({uid:s.localId,auth:e,stsTokenManager:l,isAnonymous:a}),d={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Il(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(c,d),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zh=new Map;function ln(n){_n(n instanceof Function,"Expected a class definition");let e=zh.get(n);return e?(_n(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,zh.set(n,e),e)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yp{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Yp.type="NONE";const Wh=Yp;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Yi(n,e,t){return`firebase:${n}:${e}:${t}`}class qr{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Yi(this.userKey,s.apiKey,i),this.fullPersistenceKey=Yi("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?an._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new qr(ln(Wh),e,r);const s=(await Promise.all(t.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d);let i=s[0]||ln(Wh);const a=Yi(r,e.config.apiKey,e.name);let l=null;for(const d of t)try{const f=await d._get(a);if(f){const m=an._fromJSON(e,f);d!==i&&(l=m),i=d;break}}catch{}const c=s.filter(d=>d._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new qr(i,e,r):(i=c[0],l&&await i._set(a,l.toJSON()),await Promise.all(t.map(async d=>{if(d!==i)try{await d._remove(a)}catch{}})),new qr(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kh(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(tm(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Xp(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(rm(e))return"Blackberry";if(sm(e))return"Webos";if(Zp(e))return"Safari";if((e.includes("chrome/")||em(e))&&!e.includes("edge/"))return"Chrome";if(nm(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Xp(n=ut()){return/firefox\//i.test(n)}function Zp(n=ut()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function em(n=ut()){return/crios\//i.test(n)}function tm(n=ut()){return/iemobile/i.test(n)}function nm(n=ut()){return/android/i.test(n)}function rm(n=ut()){return/blackberry/i.test(n)}function sm(n=ut()){return/webos/i.test(n)}function Sc(n=ut()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function pI(n=ut()){var e;return Sc(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function mI(){return Sy()&&document.documentMode===10}function im(n=ut()){return Sc(n)||nm(n)||sm(n)||rm(n)||/windows phone/i.test(n)||tm(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function om(n,e=[]){let t;switch(n){case"Browser":t=Kh(ut());break;case"Worker":t=`${Kh(ut())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${es}/${r}`}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gI{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((a,l)=>{try{const c=e(i);a(c)}catch(c){l(c)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _I(n,e={}){return os(n,"GET","/v2/passwordPolicy",Yo(n,e))}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yI=6;class vI{constructor(e){var t,r,s,i;const a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=a.minPasswordLength)!==null&&t!==void 0?t:yI,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,s,i,a,l;const c={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,c),this.validatePasswordCharacterOptions(e,c),c.isValid&&(c.isValid=(t=c.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),c.isValid&&(c.isValid=(r=c.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),c.isValid&&(c.isValid=(s=c.containsLowercaseLetter)!==null&&s!==void 0?s:!0),c.isValid&&(c.isValid=(i=c.containsUppercaseLetter)!==null&&i!==void 0?i:!0),c.isValid&&(c.isValid=(a=c.containsNumericCharacter)!==null&&a!==void 0?a:!0),c.isValid&&(c.isValid=(l=c.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),c}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class EI{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Gh(this),this.idTokenSubscription=new Gh(this),this.beforeStateQueue=new gI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=qp,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=ln(t)),this._initializationPromise=this.queue(async()=>{var r,s;if(!this._deleted&&(this.persistenceManager=await qr.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Qp(this,{idToken:e}),r=await an._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(sn(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,l=s==null?void 0:s._redirectEventId,c=await this.tryRedirectSignIn(e);(!a||a===l)&&(c!=null&&c.user)&&(s=c.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(a){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return oe(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Eo(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=nI()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(sn(this.app))return Promise.reject(Fn(this));const t=e?_t(e):null;return t&&oe(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&oe(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return sn(this.app)?Promise.reject(Fn(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return sn(this.app)?Promise.reject(Fn(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(ln(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await _I(this),t=new vI(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new si("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await fI(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&ln(e)||this._popupRedirectResolver;oe(t,this,"argument-error"),this.redirectPersistenceManager=await qr.create(this,[ln(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let a=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(oe(l,this,"internal-error"),l.then(()=>{a||i(this.currentUser)}),typeof t=="function"){const c=e.addObserver(t,r,s);return()=>{a=!0,c()}}else{const c=e.addObserver(t);return()=>{a=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return oe(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=om(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(t["X-Firebase-AppCheck"]=s),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&Zw(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function Xo(n){return _t(n)}class Gh{constructor(e){this.auth=e,this.observer=null,this.addObserver=Oy(t=>this.observer=t)}get next(){return oe(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Pc={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function TI(n){Pc=n}function wI(n){return Pc.loadJS(n)}function II(){return Pc.gapiScript}function AI(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bI(n,e){const t=zl(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(ao(i,e??{}))return s;gn(s,"already-initialized")}return t.initialize({options:e})}function RI(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(ln);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function SI(n,e,t){const r=Xo(n);oe(r._canInitEmulator,r,"emulator-config-failed"),oe(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!!(t!=null&&t.disableWarnings),i=am(e),{host:a,port:l}=PI(e),c=l===null?"":`:${l}`;r.config.emulator={url:`${i}//${a}${c}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:a,port:l,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})}),s||CI()}function am(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function PI(n){const e=am(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:Qh(r.substr(i.length+1))}}else{const[i,a]=r.split(":");return{host:i,port:Qh(a)}}}function Qh(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function CI(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lm{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return on("not implemented")}_getIdTokenResponse(e){return on("not implemented")}_linkToIdToken(e,t){return on("not implemented")}_getReauthenticationResolver(e){return on("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hr(n,e){return Kp(n,"POST","/v1/accounts:signInWithIdp",Yo(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kI="http://localhost";class fr extends lm{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new fr(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):gn("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=t,i=Ic(t,["providerId","signInMethod"]);if(!r||!s)return null;const a=new fr(r,s);return a.idToken=i.idToken||void 0,a.accessToken=i.accessToken||void 0,a.secret=i.secret,a.nonce=i.nonce,a.pendingToken=i.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return Hr(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Hr(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Hr(e,t)}buildRequest(){const e={requestUri:kI,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=ii(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cm{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pi extends cm{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sn extends pi{constructor(){super("facebook.com")}static credential(e){return fr._fromParams({providerId:Sn.PROVIDER_ID,signInMethod:Sn.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Sn.credentialFromTaggedObject(e)}static credentialFromError(e){return Sn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Sn.credential(e.oauthAccessToken)}catch{return null}}}Sn.FACEBOOK_SIGN_IN_METHOD="facebook.com";Sn.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pn extends pi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return fr._fromParams({providerId:Pn.PROVIDER_ID,signInMethod:Pn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Pn.credentialFromTaggedObject(e)}static credentialFromError(e){return Pn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return Pn.credential(t,r)}catch{return null}}}Pn.GOOGLE_SIGN_IN_METHOD="google.com";Pn.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cn extends pi{constructor(){super("github.com")}static credential(e){return fr._fromParams({providerId:Cn.PROVIDER_ID,signInMethod:Cn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Cn.credentialFromTaggedObject(e)}static credentialFromError(e){return Cn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Cn.credential(e.oauthAccessToken)}catch{return null}}}Cn.GITHUB_SIGN_IN_METHOD="github.com";Cn.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kn extends pi{constructor(){super("twitter.com")}static credential(e,t){return fr._fromParams({providerId:kn.PROVIDER_ID,signInMethod:kn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return kn.credentialFromTaggedObject(e)}static credentialFromError(e){return kn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return kn.credential(t,r)}catch{return null}}}kn.TWITTER_SIGN_IN_METHOD="twitter.com";kn.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function DI(n,e){return Kp(n,"POST","/v1/accounts:signUp",Yo(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await an._fromIdTokenResponse(e,r,s),a=Jh(r);return new zn({user:i,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=Jh(r);return new zn({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function Jh(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function xI(n){var e;if(sn(n.app))return Promise.reject(Fn(n));const t=Xo(n);if(await t._initializationPromise,!((e=t.currentUser)===null||e===void 0)&&e.isAnonymous)return new zn({user:t.currentUser,providerId:null,operationType:"signIn"});const r=await DI(t,{returnSecureToken:!0}),s=await zn._fromIdTokenResponse(t,"signIn",r,!0);return await t._updateCurrentUser(s.user),s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class To extends vn{constructor(e,t,r,s){var i;super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,To.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new To(e,t,r,s)}}function um(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?To._fromErrorAndOperation(n,i,e,r):i})}async function VI(n,e,t=!1){const r=await ti(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return zn._forOperation(n,"link",r)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function NI(n,e,t=!1){const{auth:r}=n;if(sn(r.app))return Promise.reject(Fn(r));const s="reauthenticate";try{const i=await ti(n,um(r,s,e,n),t);oe(i.idToken,r,"internal-error");const a=Rc(i.idToken);oe(a,r,"internal-error");const{sub:l}=a;return oe(n.uid===l,r,"user-mismatch"),zn._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&gn(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function OI(n,e,t=!1){if(sn(n.app))return Promise.reject(Fn(n));const r="signIn",s=await um(n,r,e),i=await zn._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}function MI(n,e,t,r){return _t(n).onIdTokenChanged(e,t,r)}function LI(n,e,t){return _t(n).beforeAuthStateChanged(e,t)}const wo="__sak";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hm{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(wo,"1"),this.storage.removeItem(wo),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const FI=1e3,UI=10;class dm extends hm{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=im(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,l,c)=>{this.notifyListeners(a,c)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},i=this.storage.getItem(r);mI()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,UI):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},FI)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}dm.type="LOCAL";const BI=dm;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fm extends hm{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}fm.type="SESSION";const pm=fm;/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jI(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zo{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new Zo(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,a=this.handlersMap[s];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const l=Array.from(a).map(async d=>d(t.origin,i)),c=await jI(l);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:c})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Zo.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cc(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $I{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,a;return new Promise((l,c)=>{const d=Cc("",20);s.port1.start();const f=setTimeout(()=>{c(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(m){const E=m;if(E.data.eventId===d)switch(E.data.status){case"ack":clearTimeout(f),i=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),l(E.data.response);break;default:clearTimeout(f),clearTimeout(i),c(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:d,data:t},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kt(){return window}function qI(n){Kt().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mm(){return typeof Kt().WorkerGlobalScope<"u"&&typeof Kt().importScripts=="function"}async function HI(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function zI(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function WI(){return mm()?self:null}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gm="firebaseLocalStorageDb",KI=1,Io="firebaseLocalStorage",_m="fbase_key";class mi{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function ea(n,e){return n.transaction([Io],e?"readwrite":"readonly").objectStore(Io)}function GI(){const n=indexedDB.deleteDatabase(gm);return new mi(n).toPromise()}function Al(){const n=indexedDB.open(gm,KI);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Io,{keyPath:_m})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Io)?e(r):(r.close(),await GI(),e(await Al()))})})}async function Yh(n,e,t){const r=ea(n,!0).put({[_m]:e,value:t});return new mi(r).toPromise()}async function QI(n,e){const t=ea(n,!1).get(e),r=await new mi(t).toPromise();return r===void 0?null:r.value}function Xh(n,e){const t=ea(n,!0).delete(e);return new mi(t).toPromise()}const JI=800,YI=3;class ym{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Al(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>YI)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return mm()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Zo._getInstance(WI()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await HI(),!this.activeServiceWorker)return;this.sender=new $I(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||zI()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Al();return await Yh(e,wo,"1"),await Xh(e,wo),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Yh(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>QI(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Xh(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=ea(s,!1).getAll();return new mi(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),JI)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}ym.type="LOCAL";const XI=ym;new fi(3e4,6e4);/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ZI(n,e){return e?ln(e):(oe(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kc extends lm{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Hr(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Hr(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Hr(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function e0(n){return OI(n.auth,new kc(n),n.bypassAuthState)}function t0(n){const{auth:e,user:t}=n;return oe(t,e,"internal-error"),NI(t,new kc(n),n.bypassAuthState)}async function n0(n){const{auth:e,user:t}=n;return oe(t,e,"internal-error"),VI(t,new kc(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vm{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:a,type:l}=e;if(a){this.reject(a);return}const c={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(c))}catch(d){this.reject(d)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return e0;case"linkViaPopup":case"linkViaRedirect":return n0;case"reauthViaPopup":case"reauthViaRedirect":return t0;default:gn(this.auth,"internal-error")}}resolve(e){_n(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){_n(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const r0=new fi(2e3,1e4);class Or extends vm{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Or.currentPopupAction&&Or.currentPopupAction.cancel(),Or.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return oe(e,this.auth,"internal-error"),e}async onExecution(){_n(this.filter.length===1,"Popup operations only handle one event");const e=Cc();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Wt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Wt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Or.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Wt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,r0.get())};e()}}Or.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const s0="pendingRedirect",Xi=new Map;class i0 extends vm{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Xi.get(this.auth._key());if(!e){try{const r=await o0(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Xi.set(this.auth._key(),e)}return this.bypassAuthState||Xi.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function o0(n,e){const t=c0(e),r=l0(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function a0(n,e){Xi.set(n._key(),e)}function l0(n){return ln(n._redirectPersistence)}function c0(n){return Yi(s0,n.config.apiKey,n.name)}async function u0(n,e,t=!1){if(sn(n.app))return Promise.reject(Fn(n));const r=Xo(n),s=ZI(r,e),a=await new i0(r,s,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const h0=10*60*1e3;class d0{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!f0(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Em(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(Wt(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=h0&&this.cachedEventUids.clear(),this.cachedEventUids.has(Zh(e))}saveEventToCache(e){this.cachedEventUids.add(Zh(e)),this.lastProcessedEventTime=Date.now()}}function Zh(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Em({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function f0(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Em(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function p0(n,e={}){return os(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const m0=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,g0=/^https?/;async function _0(n){if(n.config.emulator)return;const{authorizedDomains:e}=await p0(n);for(const t of e)try{if(y0(t))return}catch{}gn(n,"unauthorized-domain")}function y0(n){const e=wl(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!g0.test(t))return!1;if(m0.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const v0=new fi(3e4,6e4);function ed(){const n=Kt().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function E0(n){return new Promise((e,t)=>{var r,s,i;function a(){ed(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{ed(),t(Wt(n,"network-request-failed"))},timeout:v0.get()})}if(!((s=(r=Kt().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=Kt().gapi)===null||i===void 0)&&i.load)a();else{const l=AI("iframefcb");return Kt()[l]=()=>{gapi.load?a():t(Wt(n,"network-request-failed"))},wI(`${II()}?onload=${l}`).catch(c=>t(c))}}).catch(e=>{throw Zi=null,e})}let Zi=null;function T0(n){return Zi=Zi||E0(n),Zi}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const w0=new fi(5e3,15e3),I0="__/auth/iframe",A0="emulator/auth/iframe",b0={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},R0=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function S0(n){const e=n.config;oe(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?bc(e,A0):`https://${n.config.authDomain}/${I0}`,r={apiKey:e.apiKey,appName:n.name,v:es},s=R0.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${ii(r).slice(1)}`}async function P0(n){const e=await T0(n),t=Kt().gapi;return oe(t,n,"internal-error"),e.open({where:document.body,url:S0(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:b0,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const a=Wt(n,"network-request-failed"),l=Kt().setTimeout(()=>{i(a)},w0.get());function c(){Kt().clearTimeout(l),s(r)}r.ping(c).then(c,()=>{i(a)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const C0={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},k0=500,D0=600,x0="_blank",V0="http://localhost";class td{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function N0(n,e,t,r=k0,s=D0){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const c=Object.assign(Object.assign({},C0),{width:r.toString(),height:s.toString(),top:i,left:a}),d=ut().toLowerCase();t&&(l=em(d)?x0:t),Xp(d)&&(e=e||V0,c.scrollbars="yes");const f=Object.entries(c).reduce((E,[k,V])=>`${E}${k}=${V},`,"");if(pI(d)&&l!=="_self")return O0(e||"",l),new td(null);const m=window.open(e||"",l,f);oe(m,n,"popup-blocked");try{m.focus()}catch{}return new td(m)}function O0(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const M0="__/auth/handler",L0="emulator/auth/handler",F0=encodeURIComponent("fac");async function nd(n,e,t,r,s,i){oe(n.config.authDomain,n,"auth-domain-config-required"),oe(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:es,eventId:s};if(e instanceof cm){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",Ny(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,m]of Object.entries(i||{}))a[f]=m}if(e instanceof pi){const f=e.getScopes().filter(m=>m!=="");f.length>0&&(a.scopes=f.join(","))}n.tenantId&&(a.tid=n.tenantId);const l=a;for(const f of Object.keys(l))l[f]===void 0&&delete l[f];const c=await n._getAppCheckToken(),d=c?`#${F0}=${encodeURIComponent(c)}`:"";return`${U0(n)}?${ii(l).slice(1)}${d}`}function U0({config:n}){return n.emulator?bc(n,L0):`https://${n.authDomain}/${M0}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ba="webStorageSupport";class B0{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=pm,this._completeRedirectFn=u0,this._overrideRedirectResult=a0}async _openPopup(e,t,r,s){var i;_n((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const a=await nd(e,t,r,wl(),s);return N0(e,a,Cc())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await nd(e,t,r,wl(),s);return qI(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(_n(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await P0(e),r=new d0(e);return t.register("authEvent",s=>(oe(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Ba,{type:Ba},s=>{var i;const a=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[Ba];a!==void 0&&t(!!a),gn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=_0(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return im()||Zp()||Sc()}}const j0=B0;var rd="@firebase/auth",sd="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $0{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){oe(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function q0(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function H0(n){Wr(new lr("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:a,authDomain:l}=r.options;oe(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:a,authDomain:l,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:om(n)},d=new EI(r,s,i,c);return RI(d,t),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Wr(new lr("auth-internal",e=>{const t=Xo(e.getProvider("auth").getImmediate());return(r=>new $0(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),On(rd,sd,q0(n)),On(rd,sd,"esm2017")}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const z0=5*60,W0=_f("authIdTokenMaxAge")||z0;let id=null;const K0=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>W0)return;const s=t==null?void 0:t.token;id!==s&&(id=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function G0(n=Tf()){const e=zl(n,"auth");if(e.isInitialized())return e.getImmediate();const t=bI(n,{popupRedirectResolver:j0,persistence:[XI,BI,pm]}),r=_f("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const a=K0(i.toString());LI(t,a,()=>a(t.currentUser)),MI(t,l=>a(l))}}const s=mf("auth");return s&&SI(t,`http://${s}`),t}function Q0(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}TI({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=Wt("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",Q0().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});H0("Browser");const J0={apiKey:"AIzaSyDCqJRmxKiIzuAhgXsmXICCx_O65aujNa0",authDomain:"impro-selector.firebaseapp.com",projectId:"impro-selector",storageBucket:"impro-selector.appspot.com",messagingSenderId:"730278491306",appId:"1:730278491306:web:c966af1179221e91118cd3",measurementId:"G-3NB062D088"},Tm=Ef(J0),Xe=Mw(Tm),Y0=G0(Tm);xI(Y0);let Rt="mock";const pr=[{id:"p1",name:"Alice"},{id:"p2",name:"Bob"},{id:"p3",name:"Charlie"},{id:"p4",name:"David"},{id:"p5",name:"Eva"},{id:"p6",name:"Fanny"},{id:"p7",name:"Georges"},{id:"p8",name:"Hélène"},{id:"p9",name:"Ismaël"},{id:"p10",name:"Jade"},{id:"p11",name:"Karim"},{id:"p12",name:"Léa"},{id:"p13",name:"Marc"},{id:"p14",name:"Nina"},{id:"p15",name:"Oscar"}],mr=[{id:"event1",title:"Apérock Septembre",date:"2025-09-08"},{id:"event2",title:"Match à Cambo",date:"2025-11-25"},{id:"event3",title:"Impro des Familles",date:"2025-12-02"},{id:"event4",title:"Cabaret Surprise",date:"2026-01-20"},{id:"event5",title:"Impro Plage",date:"2026-03-10"}];function X0(n){Rt=n}async function ja(){return(Rt==="firebase"?(await ss(Qn(Xe,"events"))).docs.map(e=>({id:e.id,...e.data()})):mr).sort((e,t)=>{const r=new Date(e.date),s=new Date(t.date);return r<s?-1:r>s?1:e.title.localeCompare(t.title)})}async function $a(){return(Rt==="firebase"?(await ss(Qn(Xe,"players"))).docs.map(e=>({id:e.id,...e.data()})):pr).sort((e,t)=>e.order<t.order?-1:e.order>t.order?1:e.name.localeCompare(t.name))}async function Z0(n){if(Rt==="firebase"){const e=mn(Qn(Xe,"players"));return await is(e,{name:n}),e.id}else{const e=`p${pr.length+1}`;return pr.push({id:e,name:n}),e}}async function eA(n){if(Rt==="firebase"){await Tl(mn(Xe,"players",n));const e=await ss(Qn(Xe,"availability")),t=jp(Xe);e.forEach(r=>{const s=r.data();if(s[n]!==void 0){const i={...s};delete i[n],t.update(r.ref,i)}}),await t.commit()}else pr=pr.filter(e=>e.id!==n)}async function tA(n,e){if(Rt==="firebase")await is(mn(Xe,"players",n),{name:e});else{const t=pr.findIndex(r=>r.id===n);t!==-1&&(pr[t]=e)}}async function Is(n,e){if(Rt==="firebase"){const t=await ss(Qn(Xe,"availability")),r={};return t.forEach(s=>{r[s.id]=s.data()}),r}else{const t={};return n.forEach(r=>{t[r.name]={},e.forEach(s=>{t[r.name][s.id]=void 0})}),e.forEach(r=>{const s=[...n].sort(()=>.5-Math.random());s.slice(0,4).forEach(i=>{t[i.name][r.id]=!0}),s.slice(4).forEach(i=>{const a=Math.random();t[i.name][r.id]=a<.4?!0:a<.8?!1:void 0})}),t}}async function As(){if(Rt==="firebase"){const n=await ss(Qn(Xe,"selections")),e={};return n.forEach(t=>{e[t.id]=t.data().players||[]}),e}else return{}}async function od(n,e){Rt==="firebase"&&await is(mn(Xe,"availability",n),e)}async function nA(n,e){Rt==="firebase"&&await is(mn(Xe,"selections",n),{players:e})}async function rA(n){if(console.log("Suppression de l'événement:",n),Rt==="firebase")try{console.log("Suppression de l'événement dans Firestore"),await Tl(mn(Xe,"events",n)),console.log("Suppression de la sélection associée"),await Tl(mn(Xe,"selections",n)),console.log("Suppression des disponibilités");const e=await ss(Qn(Xe,"availability")),t=jp(Xe);e.forEach(r=>{const s=r.data();if(s[n]!==void 0){console.log("Mise à jour de la disponibilité pour:",r.id);const i={...s};delete i[n],t.update(r.ref,i)}}),await t.commit(),console.log("Opérations de suppression terminées avec succès")}catch(e){throw console.error("Erreur lors de la suppression:",e),e}else mr=mr.filter(e=>e.id!==n)}async function sA(n){if(Rt==="firebase"){const e=mn(Qn(Xe,"events"));return await is(e,n),e.id}else{const e=`event${mr.length+1}`;return mr.push({id:e,...n}),e}}async function iA(n,e){if(Rt==="firebase")await is(mn(Xe,"events",n),e);else{const t=mr.findIndex(r=>r.id===n);t!==-1&&(mr[t]={id:n,...e})}}const oA={class:"relative"},aA={class:"sticky top-0 bg-white z-50 shadow overflow-x-auto"},lA={class:"border-collapse border border-gray-400 w-full table-fixed"},cA={class:"bg-gray-100 text-gray-800 text-4xl sm:text-base"},uA={class:"p-3 text-left"},hA={class:"flex items-center justify-center space-x-2"},dA=["onMouseenter","onDblclick"],fA={class:"flex flex-col gap-2"},pA={class:"flex flex-col items-center space-y-1 relative"},mA={key:0,class:"font-semibold text-4xl sm:text-base text-center whitespace-pre-wrap relative group"},gA=["title"],_A={key:1,class:"w-full"},yA=["title"],vA={key:3,class:"w-full"},EA=["onClick"],TA={class:"p-3 text-center"},wA={class:"bg-gray-50"},IA=["onClick","title"],AA={class:"overflow-x-auto overflow-y-auto max-h-[calc(100vh-100px)]"},bA={class:"table-auto border-collapse border border-gray-400 w-full table-fixed"},RA={class:"border-t"},SA=["data-player-id"],PA={class:"p-4 sm:p-3 font-medium text-gray-900 w-[100px] relative group text-4xl sm:text-base"},CA={key:0,class:"font-semibold text-4xl sm:text-base whitespace-pre-wrap flex items-center justify-between"},kA=["onDblclick","title"],DA=["onClick"],xA={key:1,class:"w-full"},VA={class:"p-4 sm:p-3 text-center text-gray-700 text-4xl sm:text-base w-[100px]"},NA=["title"],OA=["onClick"],MA=["title"],LA=["title"],FA=["title"],UA=["title"],BA={key:0,class:"fixed bottom-4 left-4 bg-green-500 text-white p-4 rounded-lg shadow-lg"},jA={key:1,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"},$A={class:"bg-white p-6 rounded-lg shadow-lg w-96"},qA={class:"mb-4"},HA={class:"mb-4"},zA={key:2,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"},WA={class:"bg-white p-6 rounded-lg shadow-lg w-96"},KA={class:"mb-4"},GA={class:"flex justify-end space-x-2"},QA={key:3,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"},JA={key:4,class:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"},YA={key:5,class:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"},XA={__name:"GridBoard",setup(n){const e=Se(!1),t=Se(null),r=Se(null),s=Se(""),i=Se(""),a=Se(null),l=Se(""),c=Se(!1),d=Se(""),f=Se(null),m=Se(!1),E=Se(null);function k(b){f.value=b;const S=document.querySelector(`[data-player-id="${b}"]`);S&&S.scrollIntoView({behavior:"smooth",block:"center"}),V.value=!0,M.value="Nouveau joueur ajouté !",setTimeout(()=>{V.value=!1},3e3)}const V=Se(!1),M=Se("");async function j(b){t.value=b,e.value=!0}async function X(){e.value=!1;try{await rA(t.value),de.value=de.value.filter(b=>b.id!==t.value),await Promise.all([ja(),Is(se.value,de.value),As()]).then(([b,S,R])=>{de.value=b,ie.value=S,De.value=R}),t.value=null,V.value=!0,M.value="Événement supprimé avec succès !",setTimeout(()=>{V.value=!1},3e3)}catch(b){console.error("Erreur lors de la suppression de l'événement:",b),alert("Erreur lors de la suppression de l'événement. Veuillez réessayer.")}}function ee(){e.value=!1,t.value=null}function te(b){r.value=b.id,s.value=b.title,i.value=b.date}async function J(){if(!(!r.value||!s.value.trim()||!i.value))try{const b={title:s.value.trim(),date:i.value};await iA(r.value,b),await Promise.all([ja(),Is(se.value,de.value),As()]).then(([S,R,N])=>{de.value=S,ie.value=R,De.value=N}),r.value=null,s.value="",i.value="",V.value=!0,M.value="Événement mis à jour avec succès !",setTimeout(()=>{V.value=!1},3e3)}catch(b){console.error("Erreur lors de l'édition de l'événement:",b),alert("Erreur lors de l'édition de l'événement. Veuillez réessayer.")}}function me(b){a.value=b.id,l.value=b.name,xd(()=>{editPlayerInput.value&&editPlayerInput.value.focus()})}async function _e(){if(!(!a.value||!l.value.trim()))try{await tA(a.value,l.value.trim()),await Promise.all([$a(),Is(se.value,de.value),As()]).then(([b,S,R])=>{se.value=b,ie.value=S,De.value=R}),a.value=null,l.value="",V.value=!0,M.value="Joueur mis à jour avec succès !",setTimeout(()=>{V.value=!1},3e3)}catch(b){console.error("Erreur lors de l'édition du joueur:",b),alert("Erreur lors de l'édition du joueur. Veuillez réessayer.")}}function I(){a.value=null,l.value=""}async function g(){if(d.value.trim())try{const b=d.value.trim(),S=await Z0(b);await Promise.all([$a(),Is(se.value,de.value),As()]).then(([R,N,K])=>{se.value=R,ie.value=N,De.value=K;const Q=se.value.find(re=>re.id===S);k(S);const G=document.querySelector(`[data-player-id="${S}"]`);G&&G.scrollIntoView({behavior:"smooth",block:"center"}),V.value=!0,M.value="Joueur ajouté avec succès ! Vous pouvez maintenant indiquer sa disponibilité.",setTimeout(()=>{V.value=!1},3e3),setTimeout(()=>{V.value=!1,M.value=""},5e3)}),c.value=!1,d.value=""}catch(b){console.error("Erreur lors de l'ajout du joueur:",b),alert("Erreur lors de l'ajout du joueur. Veuillez réessayer.")}}function v(){r.value=null,s.value="",i.value=""}const w=Se(null),A=Se(!1),C=Se(""),y=Se("");async function ht(){if(!C.value.trim()||!y.value){alert("Veuillez remplir le titre et la date de l'événement");return}const b={title:C.value.trim(),date:y.value};try{const S=await sA(b);de.value=[...de.value,{id:S,...b}];const R={};for(const N of se.value)R[N.name]=ie.value[N.name]||{},R[N.name][S]=null,await od(N.name,R[N.name]);C.value="",y.value="",A.value=!1,await Promise.resolve()}catch(S){console.error("Erreur lors de la création de l'événement:",S),alert("Erreur lors de la création de l'événement. Veuillez réessayer.")}}function Ft(){C.value="",y.value="",A.value=!1}const de=Se([]),se=Se([]),ie=Se({}),De=Se({}),Yt=Se({}),St=Se({});Bd(async()=>{X0("firebase");const[b,S]=await Promise.all([ja(),$a()]),R={},N=S.filter(K=>R[K.name]?!1:(R[K.name]=!0,!0));de.value=b,se.value=N,ie.value=await Is(se.value,de.value),De.value=await As(),Nt(),Bt(),console.log("players (deduplicated):",se.value.map(K=>({id:K.id,name:K.name})))});function Le(b,S){const R=se.value.find(G=>G.name===b);if(!R){console.error("Joueur non trouvé:",b);return}if(!de.value.find(G=>G.id===S)){console.error("Événement non trouvé:",S);return}R.availabilities||(R.availabilities={});const K=R.availabilities[S];let Q;K==="oui"?(Q="non",R.availabilities[S]=Q):K==="non"?(delete R.availabilities[S],Q=void 0):(Q="oui",R.availabilities[S]=Q),Q===void 0?ie.value[R.name]&&delete ie.value[R.name][S]:(ie.value[R.name]||(ie.value[R.name]={}),ie.value[R.name][S]=Q==="oui"),od(R.name,{...R.availabilities}).then(()=>{V.value=!0,M.value="Disponibilité mise à jour avec succès !",setTimeout(()=>{V.value=!1},3e3)}).catch(G=>{console.error("Erreur lors de la mise à jour de la disponibilité:",G),alert("Erreur lors de la mise à jour de la disponibilité. Veuillez réessayer.")})}function Ce(b,S){var R;return(R=ie.value[b])==null?void 0:R[S]}function yr(b,S){var K;const R=De.value[S]||[],N=(K=ie.value[b])==null?void 0:K[S];return R.includes(b)&&N===!0}async function Ut(b,S=6){const N=se.value.filter(G=>Ce(G.name,b)).map(G=>{const re=ze(G.name);return{name:G.name,weight:1/(1+re)}}),K=[],Q=[...N];for(;K.length<S&&Q.length>0;){const G=Q.reduce((Ve,dt)=>Ve+dt.weight,0);let re=Math.random()*G;const Fe=Q.findIndex(Ve=>(re-=Ve.weight,re<=0));Fe>=0&&(K.push(Q[Fe].name),Q.splice(Fe,1))}De.value[b]=K,await nA(b,K),Nt(),Bt()}function xt(b){var R;return b?(typeof b=="string"?new Date(b):((R=b.toDate)==null?void 0:R.call(b))||b).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}):""}function ze(b){return Object.values(De.value).filter(S=>S.includes(b)).length}function Vt(b){const S=ie.value[b]||{};return Object.values(S).filter(R=>R===!0).length}function vr(b){const S=Vt(b),R=ze(b);return S===0?0:R/S}function Et(b){Yt.value[b]={availability:Vt(b),selection:ze(b),ratio:vr(b)}}function Nt(){se.value.forEach(b=>Et(b.name))}function Bt(b=6){const S={};de.value.forEach(R=>{const K=se.value.filter(G=>Ce(G.name,R.id)===!0).map(G=>{const re=ze(G.name);return{name:G.name,weight:1/(1+re)}}),Q=K.reduce((G,re)=>G+re.weight,0);K.forEach(G=>{const re=Math.min(1,G.weight/Q*b);S[G.name]||(S[G.name]={}),S[G.name][R.id]=Math.round(re*100)})}),St.value=S}function _(b,S){var G,re;const R=b.name,N=Ce(R,S),K=yr(R,S),Q=((re=(G=St.value)==null?void 0:G[R])==null?void 0:re[S])??0;return N===!1?"Non disponible – cliquez pour changer":K?`Sélectionné · Chance estimée : ${Q}%`:N===!0?`Disponible · Chance estimée : ${Q}%`:"Cliquez pour indiquer votre disponibilité"}const T=Se(null),x=Se(!1);async function B(){x.value=!1;try{await eA(T.value),se.value=se.value.filter(b=>b.id!==T.value),T.value=null,V.value=!0,M.value="Joueur supprimé avec succès !",setTimeout(()=>{V.value=!1},3e3)}catch(b){console.error("Erreur lors de la suppression du joueur :",b),alert("Erreur lors de la suppression du joueur. Veuillez réessayer.")}}function O(){x.value=!1,T.value=null}function L(b){T.value=b,x.value=!0}function W(b,S=6){De.value[b]&&De.value[b].length>0?(m.value=!0,E.value=b):Ut(b,S)}function q(){E.value&&(Ut(E.value,6),m.value=!1,E.value=null)}function $(){m.value=!1,E.value=null}return(b,S)=>(Ee(),Ie(ot,null,[z("div",oA,[z("div",aA,[z("table",lA,[z("colgroup",null,[S[10]||(S[10]=z("col",{style:{width:"10%"}},null,-1)),S[11]||(S[11]=z("col",{style:{width:"10%"}},null,-1)),(Ee(!0),Ie(ot,null,Rr(de.value,(R,N)=>(Ee(),Ie("col",{key:N,style:js("width: calc(70% / "+de.value.length+");")},null,4))),128)),S[12]||(S[12]=z("col",{style:{width:"5%"}},null,-1))]),z("thead",null,[z("tr",cA,[z("th",uA,[z("div",hA,[S[13]||(S[13]=z("span",{class:"font-semibold text-4xl sm:text-base relative group"},[z("span",{class:"border-b border-dashed border-gray-400"}," Joueur ")],-1)),z("button",{onClick:S[0]||(S[0]=R=>c.value=!0),class:"text-4xl sm:text-base text-blue-500 hover:text-blue-700 cursor-pointer",title:"Ajoutez un joueur"}," ➕ ")])]),S[14]||(S[14]=z("th",{class:"p-3 text-center"},[z("span",{class:"text-4xl sm:text-base"},"📊 Stats")],-1)),(Ee(!0),Ie(ot,null,Rr(de.value,R=>(Ee(),Ie("th",{key:R.id,class:"p-3 text-center",onMouseenter:N=>w.value=R.id,onMouseleave:S[3]||(S[3]=N=>w.value=null),onDblclick:N=>te(R)},[z("div",fA,[z("div",pA,[r.value!==R.id?(Ee(),Ie("div",mA,[z("span",{class:"hover:border-b hover:border-dashed hover:border-gray-400 cursor-help transition-colors duration-200",title:"Double-clic pour modifier : "+R.title+" - "+xt(R.date)},nr(R.title),9,gA)])):(Ee(),Ie("div",_A,[br(z("input",{"onUpdate:modelValue":S[1]||(S[1]=N=>s.value=N),type:"text",class:"w-full p-1 border rounded",onKeydown:[Cr(v,["esc"]),Cr(J,["enter"])],ref_for:!0,ref:"editTitleInput"},null,544),[[Pr,s.value]])])),r.value!==R.id?(Ee(),Ie("div",{key:2,class:"text-xs text-gray-500 cursor-help hover:border-b hover:border-dashed hover:border-gray-400 transition-colors duration-200 inline-block",title:"Double-clic pour modifier : "+R.title+" - "+xt(R.date)},nr(xt(R.date)),9,yA)):(Ee(),Ie("div",vA,[br(z("input",{"onUpdate:modelValue":S[2]||(S[2]=N=>i.value=N),type:"date",class:"w-full p-1 border rounded",onKeydown:[Cr(v,["esc"]),Cr(J,["enter"])]},null,544),[[Pr,i.value]])])),z("button",{onClick:N=>j(R.id),class:$s(["absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity",{"opacity-100":w.value===R.id}])}," ❌ ",10,EA)])])],40,dA))),128)),z("th",TA,[z("button",{onClick:S[4]||(S[4]=R=>A.value=!0),class:"text-gray-500 hover:text-blue-500",title:"Ajouter un nouvel événement"}," ➕ ")])]),z("tr",wA,[S[15]||(S[15]=z("th",{class:"p-3 text-left w-[100px]"},null,-1)),S[16]||(S[16]=z("th",{class:"p-3 text-center text-4xl sm:text-base w-[100px]"},null,-1)),(Ee(!0),Ie(ot,null,Rr(de.value,R=>(Ee(),Ie("th",{key:R.id,class:"p-3 text-center w-40"},[z("button",{onClick:N=>W(R.id,6),class:"rounded-md text-2xl sm:text-base bg-white hover:bg-gray-50 hover:border-gray-200 border shadow text-gray-800 p-1 w-8 h-8 flex items-center justify-center mx-auto",title:De.value[R.id]&&De.value[R.id].length>0?"Relancer la sélection":"Lancer la sélection"}," 🎭 ",8,IA)]))),128)),S[17]||(S[17]=z("th",{class:"p-3"},null,-1))])])])]),z("div",AA,[z("table",bA,[z("colgroup",null,[S[18]||(S[18]=z("col",{style:{width:"10%"}},null,-1)),S[19]||(S[19]=z("col",{style:{width:"10%"}},null,-1)),(Ee(!0),Ie(ot,null,Rr(de.value,(R,N)=>(Ee(),Ie("col",{key:N,style:js("width: calc(70% / "+de.value.length+");")},null,4))),128)),S[20]||(S[20]=z("col",{style:{width:"5%"}},null,-1))]),z("tbody",RA,[(Ee(!0),Ie(ot,null,Rr(se.value,R=>(Ee(),Ie("tr",{key:R.id,class:$s(["odd:bg-white even:bg-gray-50 border-b",{"highlighted-player":R.id===f.value}]),"data-player-id":R.id},[z("td",PA,[a.value!==R.id?(Ee(),Ie("div",CA,[z("span",{onDblclick:N=>me(R),class:"hover:border-b hover:border-dashed hover:border-gray-400 edit-cursor transition-colors duration-200",title:"Double-clic pour modifier : "+R.name},nr(R.name),41,kA),z("button",{onClick:N=>L(R.id),class:"hidden group-hover:block text-red-500",title:"Supprimer le joueur"}," 🗑️ ",8,DA)])):(Ee(),Ie("div",xA,[br(z("input",{"onUpdate:modelValue":S[5]||(S[5]=N=>l.value=N),type:"text",class:"w-full p-1 border rounded",onKeydown:[Cr(I,["esc"]),Cr(_e,["enter"])],ref_for:!0,ref:"editPlayerInput"},null,544),[[Pr,l.value]])]))]),z("td",VA,[z("span",{title:`${ze(R.name)} sélection${ze(R.name)>1?"s":""}, ${Vt(R.name)} dispo${Vt(R.name)>1?"s":""}`},nr(ze(R.name))+"/"+nr(Vt(R.name)),9,NA)]),(Ee(!0),Ie(ot,null,Rr(de.value,N=>(Ee(),Ie("td",{key:N.id,class:"p-4 sm:p-3 text-center cursor-pointer hover:bg-blue-100",onClick:K=>Le(R.name,N.id)},[yr(R.name,N.id)?(Ee(),Ie("span",{key:0,title:_(R,N.id)}," 🎭 ",8,MA)):Ce(R.name,N.id)?(Ee(),Ie("span",{key:1,title:_(R,N.id)}," ✅ ",8,LA)):Ce(R.name,N.id)===!1?(Ee(),Ie("span",{key:2,title:_(R,N.id)}," ❌ ",8,FA)):(Ee(),Ie("span",{key:3,title:_(R,N.id)}," – ",8,UA))],8,OA))),128)),S[21]||(S[21]=z("td",{class:"p-3"},null,-1))],10,SA))),128))])])])]),V.value?(Ee(),Ie("div",BA,nr(M.value),1)):Sr("",!0),A.value?(Ee(),Ie("div",jA,[z("div",$A,[S[24]||(S[24]=z("h2",{class:"text-xl font-bold mb-4"},"Nouvel événement",-1)),z("div",qA,[S[22]||(S[22]=z("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Titre",-1)),br(z("input",{"onUpdate:modelValue":S[6]||(S[6]=R=>C.value=R),type:"text",class:"w-full p-2 border rounded focus:ring-2 focus:ring-blue-500",placeholder:"Titre de l'événement"},null,512),[[Pr,C.value]])]),z("div",HA,[S[23]||(S[23]=z("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Date",-1)),br(z("input",{"onUpdate:modelValue":S[7]||(S[7]=R=>y.value=R),type:"date",class:"w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"},null,512),[[Pr,y.value]])]),z("div",{class:"flex justify-end space-x-2"},[z("button",{onClick:Ft,class:"px-4 py-2 text-gray-700 hover:text-gray-900"}," Annuler "),z("button",{onClick:ht,class:"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"}," Créer ")])])])):Sr("",!0),c.value?(Ee(),Ie("div",zA,[z("div",WA,[S[26]||(S[26]=z("h2",{class:"text-xl font-bold mb-4"},"Nouveau joueur",-1)),z("div",KA,[S[25]||(S[25]=z("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Nom",-1)),br(z("input",{"onUpdate:modelValue":S[8]||(S[8]=R=>d.value=R),type:"text",class:"w-full p-2 border rounded focus:ring-2 focus:ring-blue-500",placeholder:"Nom du joueur"},null,512),[[Pr,d.value]])]),z("div",GA,[z("button",{onClick:S[9]||(S[9]=R=>c.value=!1),class:"px-4 py-2 text-gray-700 hover:text-gray-900"}," Annuler "),z("button",{onClick:g,class:"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"}," Ajouter ")])])])):Sr("",!0),e.value?(Ee(),Ie("div",QA,[z("div",{class:"bg-white p-6 rounded-lg shadow-lg w-96"},[S[27]||(S[27]=z("h2",{class:"text-xl font-bold mb-4"},"Confirmation",-1)),S[28]||(S[28]=z("p",{class:"mb-4"},"Êtes-vous sûr de vouloir supprimer ?",-1)),z("div",{class:"flex justify-end space-x-2"},[z("button",{onClick:ee,class:"px-4 py-2 text-gray-700 hover:text-gray-900"}," Annuler "),z("button",{onClick:X,class:"px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"}," Supprimer ")])])])):Sr("",!0),x.value?(Ee(),Ie("div",JA,[z("div",{class:"bg-white p-4 rounded shadow"},[S[29]||(S[29]=z("p",{class:"mb-4"},"Êtes-vous sûr de vouloir supprimer ce joueur ?",-1)),z("div",{class:"flex justify-end space-x-2"},[z("button",{onClick:O,class:"px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"},"Annuler"),z("button",{onClick:B,class:"px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"},"Supprimer")])])])):Sr("",!0),m.value?(Ee(),Ie("div",YA,[z("div",{class:"bg-white p-6 rounded-lg shadow-lg w-96"},[S[30]||(S[30]=z("h2",{class:"text-xl font-bold mb-4"},"Confirmation",-1)),S[31]||(S[31]=z("p",{class:"mb-4"},"Attention, toute la sélection sera refaite en fonction des disponibilités actuelles. Pensez à prévenir les gens du changement !",-1)),z("div",{class:"flex justify-end space-x-2"},[z("button",{onClick:$,class:"px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"},"Annuler"),z("button",{onClick:q,class:"px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded"},"Confirmer")])])])):Sr("",!0)],64))}};const ZA={__name:"App",setup(n){return(e,t)=>(Ee(),of(XA))}};cy(ZA).mount("#app");
