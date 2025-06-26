(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();/**
* @vue/shared v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**//*! #__NO_SIDE_EFFECTS__ */function bl(n){const e=Object.create(null);for(const t of n.split(","))e[t]=1;return t=>t in e}const Se={},Nr=[],Ft=()=>{},zm=()=>!1,Ao=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&(n.charCodeAt(2)>122||n.charCodeAt(2)<97),Rl=n=>n.startsWith("onUpdate:"),et=Object.assign,Sl=(n,e)=>{const t=n.indexOf(e);t>-1&&n.splice(t,1)},Wm=Object.prototype.hasOwnProperty,Ie=(n,e)=>Wm.call(n,e),se=Array.isArray,Or=n=>bo(n)==="[object Map]",ad=n=>bo(n)==="[object Set]",le=n=>typeof n=="function",Be=n=>typeof n=="string",Wn=n=>typeof n=="symbol",xe=n=>n!==null&&typeof n=="object",ld=n=>(xe(n)||le(n))&&le(n.then)&&le(n.catch),cd=Object.prototype.toString,bo=n=>cd.call(n),Km=n=>bo(n).slice(8,-1),ud=n=>bo(n)==="[object Object]",Pl=n=>Be(n)&&n!=="NaN"&&n[0]!=="-"&&""+parseInt(n,10)===n,Cs=bl(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Ro=n=>{const e=Object.create(null);return t=>e[t]||(e[t]=n(t))},Gm=/-(\w)/g,Un=Ro(n=>n.replace(Gm,(e,t)=>t?t.toUpperCase():"")),Qm=/\B([A-Z])/g,Kn=Ro(n=>n.replace(Qm,"-$1").toLowerCase()),hd=Ro(n=>n.charAt(0).toUpperCase()+n.slice(1)),ga=Ro(n=>n?`on${hd(n)}`:""),Vn=(n,e)=>!Object.is(n,e),ji=(n,...e)=>{for(let t=0;t<n.length;t++)n[t](...e)},qa=(n,e,t,r=!1)=>{Object.defineProperty(n,e,{configurable:!0,enumerable:!1,writable:r,value:t})},Ha=n=>{const e=parseFloat(n);return isNaN(e)?n:e};let wu;const So=()=>wu||(wu=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function js(n){if(se(n)){const e={};for(let t=0;t<n.length;t++){const r=n[t],s=Be(r)?Zm(r):js(r);if(s)for(const i in s)e[i]=s[i]}return e}else if(Be(n)||xe(n))return n}const Jm=/;(?![^(]*\))/g,Ym=/:([^]+)/,Xm=/\/\*[^]*?\*\//g;function Zm(n){const e={};return n.replace(Xm,"").split(Jm).forEach(t=>{if(t){const r=t.split(Ym);r.length>1&&(e[r[0].trim()]=r[1].trim())}}),e}function $s(n){let e="";if(Be(n))e=n;else if(se(n))for(let t=0;t<n.length;t++){const r=$s(n[t]);r&&(e+=r+" ")}else if(xe(n))for(const t in n)n[t]&&(e+=t+" ");return e.trim()}const eg="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",tg=bl(eg);function dd(n){return!!n||n===""}const fd=n=>!!(n&&n.__v_isRef===!0),rr=n=>Be(n)?n:n==null?"":se(n)||xe(n)&&(n.toString===cd||!le(n.toString))?fd(n)?rr(n.value):JSON.stringify(n,pd,2):String(n),pd=(n,e)=>fd(e)?pd(n,e.value):Or(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((t,[r,s],i)=>(t[_a(r,i)+" =>"]=s,t),{})}:ad(e)?{[`Set(${e.size})`]:[...e.values()].map(t=>_a(t))}:Wn(e)?_a(e):xe(e)&&!se(e)&&!ud(e)?String(e):e,_a=(n,e="")=>{var t;return Wn(n)?`Symbol(${(t=n.description)!=null?t:e})`:n};/**
* @vue/reactivity v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Et;class ng{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=Et,!e&&Et&&(this.index=(Et.scopes||(Et.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].pause();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].resume();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].resume()}}run(e){if(this._active){const t=Et;try{return Et=this,e()}finally{Et=t}}}on(){++this._on===1&&(this.prevScope=Et,Et=this)}off(){this._on>0&&--this._on===0&&(Et=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let t,r;for(t=0,r=this.effects.length;t<r;t++)this.effects[t].stop();for(this.effects.length=0,t=0,r=this.cleanups.length;t<r;t++)this.cleanups[t]();if(this.cleanups.length=0,this.scopes){for(t=0,r=this.scopes.length;t<r;t++)this.scopes[t].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function rg(){return Et}let Ce;const ya=new WeakSet;class md{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Et&&Et.active&&Et.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,ya.has(this)&&(ya.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||_d(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,Iu(this),yd(this);const e=Ce,t=Ut;Ce=this,Ut=!0;try{return this.fn()}finally{vd(this),Ce=e,Ut=t,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)Dl(e);this.deps=this.depsTail=void 0,Iu(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?ya.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){za(this)&&this.run()}get dirty(){return za(this)}}let gd=0,ks,Ds;function _d(n,e=!1){if(n.flags|=8,e){n.next=Ds,Ds=n;return}n.next=ks,ks=n}function Cl(){gd++}function kl(){if(--gd>0)return;if(Ds){let e=Ds;for(Ds=void 0;e;){const t=e.next;e.next=void 0,e.flags&=-9,e=t}}let n;for(;ks;){let e=ks;for(ks=void 0;e;){const t=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(r){n||(n=r)}e=t}}if(n)throw n}function yd(n){for(let e=n.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function vd(n){let e,t=n.depsTail,r=t;for(;r;){const s=r.prevDep;r.version===-1?(r===t&&(t=s),Dl(r),sg(r)):e=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=s}n.deps=e,n.depsTail=t}function za(n){for(let e=n.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(Ed(e.dep.computed)||e.dep.version!==e.version))return!0;return!!n._dirty}function Ed(n){if(n.flags&4&&!(n.flags&16)||(n.flags&=-17,n.globalVersion===qs)||(n.globalVersion=qs,!n.isSSR&&n.flags&128&&(!n.deps&&!n._dirty||!za(n))))return;n.flags|=2;const e=n.dep,t=Ce,r=Ut;Ce=n,Ut=!0;try{yd(n);const s=n.fn(n._value);(e.version===0||Vn(s,n._value))&&(n.flags|=128,n._value=s,e.version++)}catch(s){throw e.version++,s}finally{Ce=t,Ut=r,vd(n),n.flags&=-3}}function Dl(n,e=!1){const{dep:t,prevSub:r,nextSub:s}=n;if(r&&(r.nextSub=s,n.prevSub=void 0),s&&(s.prevSub=r,n.nextSub=void 0),t.subs===n&&(t.subs=r,!r&&t.computed)){t.computed.flags&=-5;for(let i=t.computed.deps;i;i=i.nextDep)Dl(i,!0)}!e&&!--t.sc&&t.map&&t.map.delete(t.key)}function sg(n){const{prevDep:e,nextDep:t}=n;e&&(e.nextDep=t,n.prevDep=void 0),t&&(t.prevDep=e,n.nextDep=void 0)}let Ut=!0;const Td=[];function cn(){Td.push(Ut),Ut=!1}function un(){const n=Td.pop();Ut=n===void 0?!0:n}function Iu(n){const{cleanup:e}=n;if(n.cleanup=void 0,e){const t=Ce;Ce=void 0;try{e()}finally{Ce=t}}}let qs=0;class ig{constructor(e,t){this.sub=e,this.dep=t,this.version=t.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class Vl{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!Ce||!Ut||Ce===this.computed)return;let t=this.activeLink;if(t===void 0||t.sub!==Ce)t=this.activeLink=new ig(Ce,this),Ce.deps?(t.prevDep=Ce.depsTail,Ce.depsTail.nextDep=t,Ce.depsTail=t):Ce.deps=Ce.depsTail=t,wd(t);else if(t.version===-1&&(t.version=this.version,t.nextDep)){const r=t.nextDep;r.prevDep=t.prevDep,t.prevDep&&(t.prevDep.nextDep=r),t.prevDep=Ce.depsTail,t.nextDep=void 0,Ce.depsTail.nextDep=t,Ce.depsTail=t,Ce.deps===t&&(Ce.deps=r)}return t}trigger(e){this.version++,qs++,this.notify(e)}notify(e){Cl();try{for(let t=this.subs;t;t=t.prevSub)t.sub.notify()&&t.sub.dep.notify()}finally{kl()}}}function wd(n){if(n.dep.sc++,n.sub.flags&4){const e=n.dep.computed;if(e&&!n.dep.subs){e.flags|=20;for(let r=e.deps;r;r=r.nextDep)wd(r)}const t=n.dep.subs;t!==n&&(n.prevSub=t,t&&(t.nextSub=n)),n.dep.subs=n}}const Wa=new WeakMap,ar=Symbol(""),Ka=Symbol(""),Hs=Symbol("");function at(n,e,t){if(Ut&&Ce){let r=Wa.get(n);r||Wa.set(n,r=new Map);let s=r.get(t);s||(r.set(t,s=new Vl),s.map=r,s.key=t),s.track()}}function tn(n,e,t,r,s,i){const a=Wa.get(n);if(!a){qs++;return}const l=c=>{c&&c.trigger()};if(Cl(),e==="clear")a.forEach(l);else{const c=se(n),d=c&&Pl(t);if(c&&t==="length"){const f=Number(r);a.forEach((m,E)=>{(E==="length"||E===Hs||!Wn(E)&&E>=f)&&l(m)})}else switch((t!==void 0||a.has(void 0))&&l(a.get(t)),d&&l(a.get(Hs)),e){case"add":c?d&&l(a.get("length")):(l(a.get(ar)),Or(n)&&l(a.get(Ka)));break;case"delete":c||(l(a.get(ar)),Or(n)&&l(a.get(Ka)));break;case"set":Or(n)&&l(a.get(ar));break}}kl()}function Ir(n){const e=we(n);return e===n?e:(at(e,"iterate",Hs),Ot(n)?e:e.map(Je))}function Po(n){return at(n=we(n),"iterate",Hs),n}const og={__proto__:null,[Symbol.iterator](){return va(this,Symbol.iterator,Je)},concat(...n){return Ir(this).concat(...n.map(e=>se(e)?Ir(e):e))},entries(){return va(this,"entries",n=>(n[1]=Je(n[1]),n))},every(n,e){return Zt(this,"every",n,e,void 0,arguments)},filter(n,e){return Zt(this,"filter",n,e,t=>t.map(Je),arguments)},find(n,e){return Zt(this,"find",n,e,Je,arguments)},findIndex(n,e){return Zt(this,"findIndex",n,e,void 0,arguments)},findLast(n,e){return Zt(this,"findLast",n,e,Je,arguments)},findLastIndex(n,e){return Zt(this,"findLastIndex",n,e,void 0,arguments)},forEach(n,e){return Zt(this,"forEach",n,e,void 0,arguments)},includes(...n){return Ea(this,"includes",n)},indexOf(...n){return Ea(this,"indexOf",n)},join(n){return Ir(this).join(n)},lastIndexOf(...n){return Ea(this,"lastIndexOf",n)},map(n,e){return Zt(this,"map",n,e,void 0,arguments)},pop(){return vs(this,"pop")},push(...n){return vs(this,"push",n)},reduce(n,...e){return Au(this,"reduce",n,e)},reduceRight(n,...e){return Au(this,"reduceRight",n,e)},shift(){return vs(this,"shift")},some(n,e){return Zt(this,"some",n,e,void 0,arguments)},splice(...n){return vs(this,"splice",n)},toReversed(){return Ir(this).toReversed()},toSorted(n){return Ir(this).toSorted(n)},toSpliced(...n){return Ir(this).toSpliced(...n)},unshift(...n){return vs(this,"unshift",n)},values(){return va(this,"values",Je)}};function va(n,e,t){const r=Po(n),s=r[e]();return r!==n&&!Ot(n)&&(s._next=s.next,s.next=()=>{const i=s._next();return i.value&&(i.value=t(i.value)),i}),s}const ag=Array.prototype;function Zt(n,e,t,r,s,i){const a=Po(n),l=a!==n&&!Ot(n),c=a[e];if(c!==ag[e]){const m=c.apply(n,i);return l?Je(m):m}let d=t;a!==n&&(l?d=function(m,E){return t.call(this,Je(m),E,n)}:t.length>2&&(d=function(m,E){return t.call(this,m,E,n)}));const f=c.call(a,d,r);return l&&s?s(f):f}function Au(n,e,t,r){const s=Po(n);let i=t;return s!==n&&(Ot(n)?t.length>3&&(i=function(a,l,c){return t.call(this,a,l,c,n)}):i=function(a,l,c){return t.call(this,a,Je(l),c,n)}),s[e](i,...r)}function Ea(n,e,t){const r=we(n);at(r,"iterate",Hs);const s=r[e](...t);return(s===-1||s===!1)&&Ml(t[0])?(t[0]=we(t[0]),r[e](...t)):s}function vs(n,e,t=[]){cn(),Cl();const r=we(n)[e].apply(n,t);return kl(),un(),r}const lg=bl("__proto__,__v_isRef,__isVue"),Id=new Set(Object.getOwnPropertyNames(Symbol).filter(n=>n!=="arguments"&&n!=="caller").map(n=>Symbol[n]).filter(Wn));function cg(n){Wn(n)||(n=String(n));const e=we(this);return at(e,"has",n),e.hasOwnProperty(n)}class Ad{constructor(e=!1,t=!1){this._isReadonly=e,this._isShallow=t}get(e,t,r){if(t==="__v_skip")return e.__v_skip;const s=this._isReadonly,i=this._isShallow;if(t==="__v_isReactive")return!s;if(t==="__v_isReadonly")return s;if(t==="__v_isShallow")return i;if(t==="__v_raw")return r===(s?i?vg:Pd:i?Sd:Rd).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(r)?e:void 0;const a=se(e);if(!s){let c;if(a&&(c=og[t]))return c;if(t==="hasOwnProperty")return cg}const l=Reflect.get(e,t,ct(e)?e:r);return(Wn(t)?Id.has(t):lg(t))||(s||at(e,"get",t),i)?l:ct(l)?a&&Pl(t)?l:l.value:xe(l)?s?Cd(l):Nl(l):l}}class bd extends Ad{constructor(e=!1){super(!1,e)}set(e,t,r,s){let i=e[t];if(!this._isShallow){const c=Bn(i);if(!Ot(r)&&!Bn(r)&&(i=we(i),r=we(r)),!se(e)&&ct(i)&&!ct(r))return c?!1:(i.value=r,!0)}const a=se(e)&&Pl(t)?Number(t)<e.length:Ie(e,t),l=Reflect.set(e,t,r,ct(e)?e:s);return e===we(s)&&(a?Vn(r,i)&&tn(e,"set",t,r):tn(e,"add",t,r)),l}deleteProperty(e,t){const r=Ie(e,t);e[t];const s=Reflect.deleteProperty(e,t);return s&&r&&tn(e,"delete",t,void 0),s}has(e,t){const r=Reflect.has(e,t);return(!Wn(t)||!Id.has(t))&&at(e,"has",t),r}ownKeys(e){return at(e,"iterate",se(e)?"length":ar),Reflect.ownKeys(e)}}class ug extends Ad{constructor(e=!1){super(!0,e)}set(e,t){return!0}deleteProperty(e,t){return!0}}const hg=new bd,dg=new ug,fg=new bd(!0);const Ga=n=>n,Vi=n=>Reflect.getPrototypeOf(n);function pg(n,e,t){return function(...r){const s=this.__v_raw,i=we(s),a=Or(i),l=n==="entries"||n===Symbol.iterator&&a,c=n==="keys"&&a,d=s[n](...r),f=t?Ga:e?eo:Je;return!e&&at(i,"iterate",c?Ka:ar),{next(){const{value:m,done:E}=d.next();return E?{value:m,done:E}:{value:l?[f(m[0]),f(m[1])]:f(m),done:E}},[Symbol.iterator](){return this}}}}function xi(n){return function(...e){return n==="delete"?!1:n==="clear"?void 0:this}}function mg(n,e){const t={get(s){const i=this.__v_raw,a=we(i),l=we(s);n||(Vn(s,l)&&at(a,"get",s),at(a,"get",l));const{has:c}=Vi(a),d=e?Ga:n?eo:Je;if(c.call(a,s))return d(i.get(s));if(c.call(a,l))return d(i.get(l));i!==a&&i.get(s)},get size(){const s=this.__v_raw;return!n&&at(we(s),"iterate",ar),Reflect.get(s,"size",s)},has(s){const i=this.__v_raw,a=we(i),l=we(s);return n||(Vn(s,l)&&at(a,"has",s),at(a,"has",l)),s===l?i.has(s):i.has(s)||i.has(l)},forEach(s,i){const a=this,l=a.__v_raw,c=we(l),d=e?Ga:n?eo:Je;return!n&&at(c,"iterate",ar),l.forEach((f,m)=>s.call(i,d(f),d(m),a))}};return et(t,n?{add:xi("add"),set:xi("set"),delete:xi("delete"),clear:xi("clear")}:{add(s){!e&&!Ot(s)&&!Bn(s)&&(s=we(s));const i=we(this);return Vi(i).has.call(i,s)||(i.add(s),tn(i,"add",s,s)),this},set(s,i){!e&&!Ot(i)&&!Bn(i)&&(i=we(i));const a=we(this),{has:l,get:c}=Vi(a);let d=l.call(a,s);d||(s=we(s),d=l.call(a,s));const f=c.call(a,s);return a.set(s,i),d?Vn(i,f)&&tn(a,"set",s,i):tn(a,"add",s,i),this},delete(s){const i=we(this),{has:a,get:l}=Vi(i);let c=a.call(i,s);c||(s=we(s),c=a.call(i,s)),l&&l.call(i,s);const d=i.delete(s);return c&&tn(i,"delete",s,void 0),d},clear(){const s=we(this),i=s.size!==0,a=s.clear();return i&&tn(s,"clear",void 0,void 0),a}}),["keys","values","entries",Symbol.iterator].forEach(s=>{t[s]=pg(s,n,e)}),t}function xl(n,e){const t=mg(n,e);return(r,s,i)=>s==="__v_isReactive"?!n:s==="__v_isReadonly"?n:s==="__v_raw"?r:Reflect.get(Ie(t,s)&&s in r?t:r,s,i)}const gg={get:xl(!1,!1)},_g={get:xl(!1,!0)},yg={get:xl(!0,!1)};const Rd=new WeakMap,Sd=new WeakMap,Pd=new WeakMap,vg=new WeakMap;function Eg(n){switch(n){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function Tg(n){return n.__v_skip||!Object.isExtensible(n)?0:Eg(Km(n))}function Nl(n){return Bn(n)?n:Ol(n,!1,hg,gg,Rd)}function wg(n){return Ol(n,!1,fg,_g,Sd)}function Cd(n){return Ol(n,!0,dg,yg,Pd)}function Ol(n,e,t,r,s){if(!xe(n)||n.__v_raw&&!(e&&n.__v_isReactive))return n;const i=Tg(n);if(i===0)return n;const a=s.get(n);if(a)return a;const l=new Proxy(n,i===2?r:t);return s.set(n,l),l}function Mr(n){return Bn(n)?Mr(n.__v_raw):!!(n&&n.__v_isReactive)}function Bn(n){return!!(n&&n.__v_isReadonly)}function Ot(n){return!!(n&&n.__v_isShallow)}function Ml(n){return n?!!n.__v_raw:!1}function we(n){const e=n&&n.__v_raw;return e?we(e):n}function Ig(n){return!Ie(n,"__v_skip")&&Object.isExtensible(n)&&qa(n,"__v_skip",!0),n}const Je=n=>xe(n)?Nl(n):n,eo=n=>xe(n)?Cd(n):n;function ct(n){return n?n.__v_isRef===!0:!1}function De(n){return Ag(n,!1)}function Ag(n,e){return ct(n)?n:new bg(n,e)}class bg{constructor(e,t){this.dep=new Vl,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=t?e:we(e),this._value=t?e:Je(e),this.__v_isShallow=t}get value(){return this.dep.track(),this._value}set value(e){const t=this._rawValue,r=this.__v_isShallow||Ot(e)||Bn(e);e=r?e:we(e),Vn(e,t)&&(this._rawValue=e,this._value=r?e:Je(e),this.dep.trigger())}}function Rg(n){return ct(n)?n.value:n}const Sg={get:(n,e,t)=>e==="__v_raw"?n:Rg(Reflect.get(n,e,t)),set:(n,e,t,r)=>{const s=n[e];return ct(s)&&!ct(t)?(s.value=t,!0):Reflect.set(n,e,t,r)}};function kd(n){return Mr(n)?n:new Proxy(n,Sg)}class Pg{constructor(e,t,r){this.fn=e,this.setter=t,this._value=void 0,this.dep=new Vl(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=qs-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!t,this.isSSR=r}notify(){if(this.flags|=16,!(this.flags&8)&&Ce!==this)return _d(this,!0),!0}get value(){const e=this.dep.track();return Ed(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function Cg(n,e,t=!1){let r,s;return le(n)?r=n:(r=n.get,s=n.set),new Pg(r,s,t)}const Ni={},to=new WeakMap;let sr;function kg(n,e=!1,t=sr){if(t){let r=to.get(t);r||to.set(t,r=[]),r.push(n)}}function Dg(n,e,t=Se){const{immediate:r,deep:s,once:i,scheduler:a,augmentJob:l,call:c}=t,d=W=>s?W:Ot(W)||s===!1||s===0?nn(W,1):nn(W);let f,m,E,P,N=!1,B=!1;if(ct(n)?(m=()=>n.value,N=Ot(n)):Mr(n)?(m=()=>d(n),N=!0):se(n)?(B=!0,N=n.some(W=>Mr(W)||Ot(W)),m=()=>n.map(W=>{if(ct(W))return W.value;if(Mr(W))return d(W);if(le(W))return c?c(W,2):W()})):le(n)?e?m=c?()=>c(n,2):n:m=()=>{if(E){cn();try{E()}finally{un()}}const W=sr;sr=f;try{return c?c(n,3,[P]):n(P)}finally{sr=W}}:m=Ft,e&&s){const W=m,de=s===!0?1/0:s;m=()=>nn(W(),de)}const j=rg(),Q=()=>{f.stop(),j&&j.active&&Sl(j.effects,f)};if(i&&e){const W=e;e=(...de)=>{W(...de),Q()}}let J=B?new Array(n.length).fill(Ni):Ni;const X=W=>{if(!(!(f.flags&1)||!f.dirty&&!W))if(e){const de=f.run();if(s||N||(B?de.some((_e,b)=>Vn(_e,J[b])):Vn(de,J))){E&&E();const _e=sr;sr=f;try{const b=[de,J===Ni?void 0:B&&J[0]===Ni?[]:J,P];J=de,c?c(e,3,b):e(...b)}finally{sr=_e}}}else f.run()};return l&&l(X),f=new md(m),f.scheduler=a?()=>a(X,!1):X,P=W=>kg(W,!1,f),E=f.onStop=()=>{const W=to.get(f);if(W){if(c)c(W,4);else for(const de of W)de();to.delete(f)}},e?r?X(!0):J=f.run():a?a(X.bind(null,!0),!0):f.run(),Q.pause=f.pause.bind(f),Q.resume=f.resume.bind(f),Q.stop=Q,Q}function nn(n,e=1/0,t){if(e<=0||!xe(n)||n.__v_skip||(t=t||new Set,t.has(n)))return n;if(t.add(n),e--,ct(n))nn(n.value,e,t);else if(se(n))for(let r=0;r<n.length;r++)nn(n[r],e,t);else if(ad(n)||Or(n))n.forEach(r=>{nn(r,e,t)});else if(ud(n)){for(const r in n)nn(n[r],e,t);for(const r of Object.getOwnPropertySymbols(n))Object.prototype.propertyIsEnumerable.call(n,r)&&nn(n[r],e,t)}return n}/**
* @vue/runtime-core v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function ni(n,e,t,r){try{return r?n(...r):n()}catch(s){Co(s,e,t)}}function Kt(n,e,t,r){if(le(n)){const s=ni(n,e,t,r);return s&&ld(s)&&s.catch(i=>{Co(i,e,t)}),s}if(se(n)){const s=[];for(let i=0;i<n.length;i++)s.push(Kt(n[i],e,t,r));return s}}function Co(n,e,t,r=!0){const s=e?e.vnode:null,{errorHandler:i,throwUnhandledErrorInProduction:a}=e&&e.appContext.config||Se;if(e){let l=e.parent;const c=e.proxy,d=`https://vuejs.org/error-reference/#runtime-${t}`;for(;l;){const f=l.ec;if(f){for(let m=0;m<f.length;m++)if(f[m](n,c,d)===!1)return}l=l.parent}if(i){cn(),ni(i,null,10,[n,c,d]),un();return}}Vg(n,t,s,r,a)}function Vg(n,e,t,r=!0,s=!1){if(s)throw n;console.error(n)}const gt=[];let jt=-1;const Lr=[];let bn=null,Pr=0;const Dd=Promise.resolve();let no=null;function Vd(n){const e=no||Dd;return n?e.then(this?n.bind(this):n):e}function xg(n){let e=jt+1,t=gt.length;for(;e<t;){const r=e+t>>>1,s=gt[r],i=zs(s);i<n||i===n&&s.flags&2?e=r+1:t=r}return e}function Ll(n){if(!(n.flags&1)){const e=zs(n),t=gt[gt.length-1];!t||!(n.flags&2)&&e>=zs(t)?gt.push(n):gt.splice(xg(e),0,n),n.flags|=1,xd()}}function xd(){no||(no=Dd.then(Od))}function Ng(n){se(n)?Lr.push(...n):bn&&n.id===-1?bn.splice(Pr+1,0,n):n.flags&1||(Lr.push(n),n.flags|=1),xd()}function bu(n,e,t=jt+1){for(;t<gt.length;t++){const r=gt[t];if(r&&r.flags&2){if(n&&r.id!==n.uid)continue;gt.splice(t,1),t--,r.flags&4&&(r.flags&=-2),r(),r.flags&4||(r.flags&=-2)}}}function Nd(n){if(Lr.length){const e=[...new Set(Lr)].sort((t,r)=>zs(t)-zs(r));if(Lr.length=0,bn){bn.push(...e);return}for(bn=e,Pr=0;Pr<bn.length;Pr++){const t=bn[Pr];t.flags&4&&(t.flags&=-2),t.flags&8||t(),t.flags&=-2}bn=null,Pr=0}}const zs=n=>n.id==null?n.flags&2?-1:1/0:n.id;function Od(n){const e=Ft;try{for(jt=0;jt<gt.length;jt++){const t=gt[jt];t&&!(t.flags&8)&&(t.flags&4&&(t.flags&=-2),ni(t,t.i,t.i?15:14),t.flags&4||(t.flags&=-2))}}finally{for(;jt<gt.length;jt++){const t=gt[jt];t&&(t.flags&=-2)}jt=-1,gt.length=0,Nd(),no=null,(gt.length||Lr.length)&&Od()}}let Nt=null,Md=null;function ro(n){const e=Nt;return Nt=n,Md=n&&n.type.__scopeId||null,e}function Og(n,e=Nt,t){if(!e||n._n)return n;const r=(...s)=>{r._d&&xu(-1);const i=ro(e);let a;try{a=n(...s)}finally{ro(i),r._d&&xu(1)}return a};return r._n=!0,r._c=!0,r._d=!0,r}function Ar(n,e){if(Nt===null)return n;const t=xo(Nt),r=n.dirs||(n.dirs=[]);for(let s=0;s<e.length;s++){let[i,a,l,c=Se]=e[s];i&&(le(i)&&(i={mounted:i,updated:i}),i.deep&&nn(a),r.push({dir:i,instance:t,value:a,oldValue:void 0,arg:l,modifiers:c}))}return n}function tr(n,e,t,r){const s=n.dirs,i=e&&e.dirs;for(let a=0;a<s.length;a++){const l=s[a];i&&(l.oldValue=i[a].value);let c=l.dir[r];c&&(cn(),Kt(c,t,8,[n.el,l,n,e]),un())}}const Mg=Symbol("_vte"),Lg=n=>n.__isTeleport;function Fl(n,e){n.shapeFlag&6&&n.component?(n.transition=e,Fl(n.component.subTree,e)):n.shapeFlag&128?(n.ssContent.transition=e.clone(n.ssContent),n.ssFallback.transition=e.clone(n.ssFallback)):n.transition=e}function Ld(n){n.ids=[n.ids[0]+n.ids[2]+++"-",0,0]}function Vs(n,e,t,r,s=!1){if(se(n)){n.forEach((N,B)=>Vs(N,e&&(se(e)?e[B]:e),t,r,s));return}if(xs(r)&&!s){r.shapeFlag&512&&r.type.__asyncResolved&&r.component.subTree.component&&Vs(n,e,t,r.component.subTree);return}const i=r.shapeFlag&4?xo(r.component):r.el,a=s?null:i,{i:l,r:c}=n,d=e&&e.r,f=l.refs===Se?l.refs={}:l.refs,m=l.setupState,E=we(m),P=m===Se?()=>!1:N=>Ie(E,N);if(d!=null&&d!==c&&(Be(d)?(f[d]=null,P(d)&&(m[d]=null)):ct(d)&&(d.value=null)),le(c))ni(c,l,12,[a,f]);else{const N=Be(c),B=ct(c);if(N||B){const j=()=>{if(n.f){const Q=N?P(c)?m[c]:f[c]:c.value;s?se(Q)&&Sl(Q,i):se(Q)?Q.includes(i)||Q.push(i):N?(f[c]=[i],P(c)&&(m[c]=f[c])):(c.value=[i],n.k&&(f[n.k]=c.value))}else N?(f[c]=a,P(c)&&(m[c]=a)):B&&(c.value=a,n.k&&(f[n.k]=a))};a?(j.id=-1,St(j,t)):j()}}}So().requestIdleCallback;So().cancelIdleCallback;const xs=n=>!!n.type.__asyncLoader,Fd=n=>n.type.__isKeepAlive;function Fg(n,e){Ud(n,"a",e)}function Ug(n,e){Ud(n,"da",e)}function Ud(n,e,t=_t){const r=n.__wdc||(n.__wdc=()=>{let s=t;for(;s;){if(s.isDeactivated)return;s=s.parent}return n()});if(ko(e,r,t),t){let s=t.parent;for(;s&&s.parent;)Fd(s.parent.vnode)&&Bg(r,e,t,s),s=s.parent}}function Bg(n,e,t,r){const s=ko(e,n,r,!0);jd(()=>{Sl(r[e],s)},t)}function ko(n,e,t=_t,r=!1){if(t){const s=t[n]||(t[n]=[]),i=e.__weh||(e.__weh=(...a)=>{cn();const l=ri(t),c=Kt(e,t,n,a);return l(),un(),c});return r?s.unshift(i):s.push(i),i}}const _n=n=>(e,t=_t)=>{(!Ks||n==="sp")&&ko(n,(...r)=>e(...r),t)},jg=_n("bm"),Bd=_n("m"),$g=_n("bu"),qg=_n("u"),Hg=_n("bum"),jd=_n("um"),zg=_n("sp"),Wg=_n("rtg"),Kg=_n("rtc");function Gg(n,e=_t){ko("ec",n,e)}const Qg=Symbol.for("v-ndc");function br(n,e,t,r){let s;const i=t&&t[r],a=se(n);if(a||Be(n)){const l=a&&Mr(n);let c=!1,d=!1;l&&(c=!Ot(n),d=Bn(n),n=Po(n)),s=new Array(n.length);for(let f=0,m=n.length;f<m;f++)s[f]=e(c?d?eo(Je(n[f])):Je(n[f]):n[f],f,void 0,i&&i[f])}else if(typeof n=="number"){s=new Array(n);for(let l=0;l<n;l++)s[l]=e(l+1,l,void 0,i&&i[l])}else if(xe(n))if(n[Symbol.iterator])s=Array.from(n,(l,c)=>e(l,c,void 0,i&&i[c]));else{const l=Object.keys(n);s=new Array(l.length);for(let c=0,d=l.length;c<d;c++){const f=l[c];s[c]=e(n[f],f,c,i&&i[c])}}else s=[];return t&&(t[r]=s),s}const Qa=n=>n?cf(n)?xo(n):Qa(n.parent):null,Ns=et(Object.create(null),{$:n=>n,$el:n=>n.vnode.el,$data:n=>n.data,$props:n=>n.props,$attrs:n=>n.attrs,$slots:n=>n.slots,$refs:n=>n.refs,$parent:n=>Qa(n.parent),$root:n=>Qa(n.root),$host:n=>n.ce,$emit:n=>n.emit,$options:n=>Ul(n),$forceUpdate:n=>n.f||(n.f=()=>{Ll(n.update)}),$nextTick:n=>n.n||(n.n=Vd.bind(n.proxy)),$watch:n=>__.bind(n)}),Ta=(n,e)=>n!==Se&&!n.__isScriptSetup&&Ie(n,e),Jg={get({_:n},e){if(e==="__v_skip")return!0;const{ctx:t,setupState:r,data:s,props:i,accessCache:a,type:l,appContext:c}=n;let d;if(e[0]!=="$"){const P=a[e];if(P!==void 0)switch(P){case 1:return r[e];case 2:return s[e];case 4:return t[e];case 3:return i[e]}else{if(Ta(r,e))return a[e]=1,r[e];if(s!==Se&&Ie(s,e))return a[e]=2,s[e];if((d=n.propsOptions[0])&&Ie(d,e))return a[e]=3,i[e];if(t!==Se&&Ie(t,e))return a[e]=4,t[e];Ja&&(a[e]=0)}}const f=Ns[e];let m,E;if(f)return e==="$attrs"&&at(n.attrs,"get",""),f(n);if((m=l.__cssModules)&&(m=m[e]))return m;if(t!==Se&&Ie(t,e))return a[e]=4,t[e];if(E=c.config.globalProperties,Ie(E,e))return E[e]},set({_:n},e,t){const{data:r,setupState:s,ctx:i}=n;return Ta(s,e)?(s[e]=t,!0):r!==Se&&Ie(r,e)?(r[e]=t,!0):Ie(n.props,e)||e[0]==="$"&&e.slice(1)in n?!1:(i[e]=t,!0)},has({_:{data:n,setupState:e,accessCache:t,ctx:r,appContext:s,propsOptions:i}},a){let l;return!!t[a]||n!==Se&&Ie(n,a)||Ta(e,a)||(l=i[0])&&Ie(l,a)||Ie(r,a)||Ie(Ns,a)||Ie(s.config.globalProperties,a)},defineProperty(n,e,t){return t.get!=null?n._.accessCache[e]=0:Ie(t,"value")&&this.set(n,e,t.value,null),Reflect.defineProperty(n,e,t)}};function Ru(n){return se(n)?n.reduce((e,t)=>(e[t]=null,e),{}):n}let Ja=!0;function Yg(n){const e=Ul(n),t=n.proxy,r=n.ctx;Ja=!1,e.beforeCreate&&Su(e.beforeCreate,n,"bc");const{data:s,computed:i,methods:a,watch:l,provide:c,inject:d,created:f,beforeMount:m,mounted:E,beforeUpdate:P,updated:N,activated:B,deactivated:j,beforeDestroy:Q,beforeUnmount:J,destroyed:X,unmounted:W,render:de,renderTracked:_e,renderTriggered:b,errorCaptured:g,serverPrefetch:y,expose:w,inheritAttrs:R,components:C,directives:v,filters:fe}=e;if(d&&Xg(d,r,null),a)for(const ce in a){const pe=a[ce];le(pe)&&(r[ce]=pe.bind(t))}if(s){const ce=s.call(t,t);xe(ce)&&(n.data=Nl(ce))}if(Ja=!0,i)for(const ce in i){const pe=i[ce],vt=le(pe)?pe.bind(t,t):le(pe.get)?pe.get.bind(t,t):Ft,Jt=!le(pe)&&le(pe.set)?pe.set.bind(t):Ft,ht=F_({get:vt,set:Jt});Object.defineProperty(r,ce,{enumerable:!0,configurable:!0,get:()=>ht.value,set:Oe=>ht.value=Oe})}if(l)for(const ce in l)$d(l[ce],r,t,ce);if(c){const ce=le(c)?c.call(t):c;Reflect.ownKeys(ce).forEach(pe=>{s_(pe,ce[pe])})}f&&Su(f,n,"c");function ye(ce,pe){se(pe)?pe.forEach(vt=>ce(vt.bind(t))):pe&&ce(pe.bind(t))}if(ye(jg,m),ye(Bd,E),ye($g,P),ye(qg,N),ye(Fg,B),ye(Ug,j),ye(Gg,g),ye(Kg,_e),ye(Wg,b),ye(Hg,J),ye(jd,W),ye(zg,y),se(w))if(w.length){const ce=n.exposed||(n.exposed={});w.forEach(pe=>{Object.defineProperty(ce,pe,{get:()=>t[pe],set:vt=>t[pe]=vt})})}else n.exposed||(n.exposed={});de&&n.render===Ft&&(n.render=de),R!=null&&(n.inheritAttrs=R),C&&(n.components=C),v&&(n.directives=v),y&&Ld(n)}function Xg(n,e,t=Ft){se(n)&&(n=Ya(n));for(const r in n){const s=n[r];let i;xe(s)?"default"in s?i=$i(s.from||r,s.default,!0):i=$i(s.from||r):i=$i(s),ct(i)?Object.defineProperty(e,r,{enumerable:!0,configurable:!0,get:()=>i.value,set:a=>i.value=a}):e[r]=i}}function Su(n,e,t){Kt(se(n)?n.map(r=>r.bind(e.proxy)):n.bind(e.proxy),e,t)}function $d(n,e,t,r){let s=r.includes(".")?tf(t,r):()=>t[r];if(Be(n)){const i=e[n];le(i)&&Ia(s,i)}else if(le(n))Ia(s,n.bind(t));else if(xe(n))if(se(n))n.forEach(i=>$d(i,e,t,r));else{const i=le(n.handler)?n.handler.bind(t):e[n.handler];le(i)&&Ia(s,i,n)}}function Ul(n){const e=n.type,{mixins:t,extends:r}=e,{mixins:s,optionsCache:i,config:{optionMergeStrategies:a}}=n.appContext,l=i.get(e);let c;return l?c=l:!s.length&&!t&&!r?c=e:(c={},s.length&&s.forEach(d=>so(c,d,a,!0)),so(c,e,a)),xe(e)&&i.set(e,c),c}function so(n,e,t,r=!1){const{mixins:s,extends:i}=e;i&&so(n,i,t,!0),s&&s.forEach(a=>so(n,a,t,!0));for(const a in e)if(!(r&&a==="expose")){const l=Zg[a]||t&&t[a];n[a]=l?l(n[a],e[a]):e[a]}return n}const Zg={data:Pu,props:Cu,emits:Cu,methods:bs,computed:bs,beforeCreate:mt,created:mt,beforeMount:mt,mounted:mt,beforeUpdate:mt,updated:mt,beforeDestroy:mt,beforeUnmount:mt,destroyed:mt,unmounted:mt,activated:mt,deactivated:mt,errorCaptured:mt,serverPrefetch:mt,components:bs,directives:bs,watch:t_,provide:Pu,inject:e_};function Pu(n,e){return e?n?function(){return et(le(n)?n.call(this,this):n,le(e)?e.call(this,this):e)}:e:n}function e_(n,e){return bs(Ya(n),Ya(e))}function Ya(n){if(se(n)){const e={};for(let t=0;t<n.length;t++)e[n[t]]=n[t];return e}return n}function mt(n,e){return n?[...new Set([].concat(n,e))]:e}function bs(n,e){return n?et(Object.create(null),n,e):e}function Cu(n,e){return n?se(n)&&se(e)?[...new Set([...n,...e])]:et(Object.create(null),Ru(n),Ru(e??{})):e}function t_(n,e){if(!n)return e;if(!e)return n;const t=et(Object.create(null),n);for(const r in e)t[r]=mt(n[r],e[r]);return t}function qd(){return{app:null,config:{isNativeTag:zm,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let n_=0;function r_(n,e){return function(r,s=null){le(r)||(r=et({},r)),s!=null&&!xe(s)&&(s=null);const i=qd(),a=new WeakSet,l=[];let c=!1;const d=i.app={_uid:n_++,_component:r,_props:s,_container:null,_context:i,_instance:null,version:U_,get config(){return i.config},set config(f){},use(f,...m){return a.has(f)||(f&&le(f.install)?(a.add(f),f.install(d,...m)):le(f)&&(a.add(f),f(d,...m))),d},mixin(f){return i.mixins.includes(f)||i.mixins.push(f),d},component(f,m){return m?(i.components[f]=m,d):i.components[f]},directive(f,m){return m?(i.directives[f]=m,d):i.directives[f]},mount(f,m,E){if(!c){const P=d._ceVNode||ln(r,s);return P.appContext=i,E===!0?E="svg":E===!1&&(E=void 0),m&&e?e(P,f):n(P,f,E),c=!0,d._container=f,f.__vue_app__=d,xo(P.component)}},onUnmount(f){l.push(f)},unmount(){c&&(Kt(l,d._instance,16),n(null,d._container),delete d._container.__vue_app__)},provide(f,m){return i.provides[f]=m,d},runWithContext(f){const m=Fr;Fr=d;try{return f()}finally{Fr=m}}};return d}}let Fr=null;function s_(n,e){if(_t){let t=_t.provides;const r=_t.parent&&_t.parent.provides;r===t&&(t=_t.provides=Object.create(r)),t[n]=e}}function $i(n,e,t=!1){const r=_t||Nt;if(r||Fr){let s=Fr?Fr._context.provides:r?r.parent==null||r.ce?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:void 0;if(s&&n in s)return s[n];if(arguments.length>1)return t&&le(e)?e.call(r&&r.proxy):e}}const Hd={},zd=()=>Object.create(Hd),Wd=n=>Object.getPrototypeOf(n)===Hd;function i_(n,e,t,r=!1){const s={},i=zd();n.propsDefaults=Object.create(null),Kd(n,e,s,i);for(const a in n.propsOptions[0])a in s||(s[a]=void 0);t?n.props=r?s:wg(s):n.type.props?n.props=s:n.props=i,n.attrs=i}function o_(n,e,t,r){const{props:s,attrs:i,vnode:{patchFlag:a}}=n,l=we(s),[c]=n.propsOptions;let d=!1;if((r||a>0)&&!(a&16)){if(a&8){const f=n.vnode.dynamicProps;for(let m=0;m<f.length;m++){let E=f[m];if(Do(n.emitsOptions,E))continue;const P=e[E];if(c)if(Ie(i,E))P!==i[E]&&(i[E]=P,d=!0);else{const N=Un(E);s[N]=Xa(c,l,N,P,n,!1)}else P!==i[E]&&(i[E]=P,d=!0)}}}else{Kd(n,e,s,i)&&(d=!0);let f;for(const m in l)(!e||!Ie(e,m)&&((f=Kn(m))===m||!Ie(e,f)))&&(c?t&&(t[m]!==void 0||t[f]!==void 0)&&(s[m]=Xa(c,l,m,void 0,n,!0)):delete s[m]);if(i!==l)for(const m in i)(!e||!Ie(e,m))&&(delete i[m],d=!0)}d&&tn(n.attrs,"set","")}function Kd(n,e,t,r){const[s,i]=n.propsOptions;let a=!1,l;if(e)for(let c in e){if(Cs(c))continue;const d=e[c];let f;s&&Ie(s,f=Un(c))?!i||!i.includes(f)?t[f]=d:(l||(l={}))[f]=d:Do(n.emitsOptions,c)||(!(c in r)||d!==r[c])&&(r[c]=d,a=!0)}if(i){const c=we(t),d=l||Se;for(let f=0;f<i.length;f++){const m=i[f];t[m]=Xa(s,c,m,d[m],n,!Ie(d,m))}}return a}function Xa(n,e,t,r,s,i){const a=n[t];if(a!=null){const l=Ie(a,"default");if(l&&r===void 0){const c=a.default;if(a.type!==Function&&!a.skipFactory&&le(c)){const{propsDefaults:d}=s;if(t in d)r=d[t];else{const f=ri(s);r=d[t]=c.call(null,e),f()}}else r=c;s.ce&&s.ce._setProp(t,r)}a[0]&&(i&&!l?r=!1:a[1]&&(r===""||r===Kn(t))&&(r=!0))}return r}const a_=new WeakMap;function Gd(n,e,t=!1){const r=t?a_:e.propsCache,s=r.get(n);if(s)return s;const i=n.props,a={},l=[];let c=!1;if(!le(n)){const f=m=>{c=!0;const[E,P]=Gd(m,e,!0);et(a,E),P&&l.push(...P)};!t&&e.mixins.length&&e.mixins.forEach(f),n.extends&&f(n.extends),n.mixins&&n.mixins.forEach(f)}if(!i&&!c)return xe(n)&&r.set(n,Nr),Nr;if(se(i))for(let f=0;f<i.length;f++){const m=Un(i[f]);ku(m)&&(a[m]=Se)}else if(i)for(const f in i){const m=Un(f);if(ku(m)){const E=i[f],P=a[m]=se(E)||le(E)?{type:E}:et({},E),N=P.type;let B=!1,j=!0;if(se(N))for(let Q=0;Q<N.length;++Q){const J=N[Q],X=le(J)&&J.name;if(X==="Boolean"){B=!0;break}else X==="String"&&(j=!1)}else B=le(N)&&N.name==="Boolean";P[0]=B,P[1]=j,(B||Ie(P,"default"))&&l.push(m)}}const d=[a,l];return xe(n)&&r.set(n,d),d}function ku(n){return n[0]!=="$"&&!Cs(n)}const Bl=n=>n[0]==="_"||n==="$stable",jl=n=>se(n)?n.map($t):[$t(n)],l_=(n,e,t)=>{if(e._n)return e;const r=Og((...s)=>jl(e(...s)),t);return r._c=!1,r},Qd=(n,e,t)=>{const r=n._ctx;for(const s in n){if(Bl(s))continue;const i=n[s];if(le(i))e[s]=l_(s,i,r);else if(i!=null){const a=jl(i);e[s]=()=>a}}},Jd=(n,e)=>{const t=jl(e);n.slots.default=()=>t},Yd=(n,e,t)=>{for(const r in e)(t||!Bl(r))&&(n[r]=e[r])},c_=(n,e,t)=>{const r=n.slots=zd();if(n.vnode.shapeFlag&32){const s=e.__;s&&qa(r,"__",s,!0);const i=e._;i?(Yd(r,e,t),t&&qa(r,"_",i,!0)):Qd(e,r)}else e&&Jd(n,e)},u_=(n,e,t)=>{const{vnode:r,slots:s}=n;let i=!0,a=Se;if(r.shapeFlag&32){const l=e._;l?t&&l===1?i=!1:Yd(s,e,t):(i=!e.$stable,Qd(e,s)),a=e}else e&&(Jd(n,e),a={default:1});if(i)for(const l in s)!Bl(l)&&a[l]==null&&delete s[l]},St=A_;function h_(n){return d_(n)}function d_(n,e){const t=So();t.__VUE__=!0;const{insert:r,remove:s,patchProp:i,createElement:a,createText:l,createComment:c,setText:d,setElementText:f,parentNode:m,nextSibling:E,setScopeId:P=Ft,insertStaticContent:N}=n,B=(_,I,x,U=null,A=null,T=null,k=void 0,V=null,M=!!I.dynamicChildren)=>{if(_===I)return;_&&!Es(_,I)&&(U=Vt(_),Oe(_,A,T,!0),_=null),I.patchFlag===-2&&(M=!1,I.dynamicChildren=null);const{type:O,ref:H,shapeFlag:$}=I;switch(O){case Vo:j(_,I,x,U);break;case jn:Q(_,I,x,U);break;case ba:_==null&&J(I,x,U,k);break;case ot:C(_,I,x,U,A,T,k,V,M);break;default:$&1?de(_,I,x,U,A,T,k,V,M):$&6?v(_,I,x,U,A,T,k,V,M):($&64||$&128)&&O.process(_,I,x,U,A,T,k,V,M,ft)}H!=null&&A?Vs(H,_&&_.ref,T,I||_,!I):H==null&&_&&_.ref!=null&&Vs(_.ref,null,T,_,!0)},j=(_,I,x,U)=>{if(_==null)r(I.el=l(I.children),x,U);else{const A=I.el=_.el;I.children!==_.children&&d(A,I.children)}},Q=(_,I,x,U)=>{_==null?r(I.el=c(I.children||""),x,U):I.el=_.el},J=(_,I,x,U)=>{[_.el,_.anchor]=N(_.children,I,x,U,_.el,_.anchor)},X=({el:_,anchor:I},x,U)=>{let A;for(;_&&_!==I;)A=E(_),r(_,x,U),_=A;r(I,x,U)},W=({el:_,anchor:I})=>{let x;for(;_&&_!==I;)x=E(_),s(_),_=x;s(I)},de=(_,I,x,U,A,T,k,V,M)=>{I.type==="svg"?k="svg":I.type==="math"&&(k="mathml"),_==null?_e(I,x,U,A,T,k,V,M):y(_,I,A,T,k,V,M)},_e=(_,I,x,U,A,T,k,V)=>{let M,O;const{props:H,shapeFlag:$,transition:K,dirs:Z}=_;if(M=_.el=a(_.type,T,H&&H.is,H),$&8?f(M,_.children):$&16&&g(_.children,M,null,U,A,wa(_,T),k,V),Z&&tr(_,null,U,"created"),b(M,_,_.scopeId,k,U),H){for(const ae in H)ae!=="value"&&!Cs(ae)&&i(M,ae,null,H[ae],T,U);"value"in H&&i(M,"value",null,H.value,T),(O=H.onVnodeBeforeMount)&&Bt(O,U,_)}Z&&tr(_,null,U,"beforeMount");const ee=f_(A,K);ee&&K.beforeEnter(M),r(M,I,x),((O=H&&H.onVnodeMounted)||ee||Z)&&St(()=>{O&&Bt(O,U,_),ee&&K.enter(M),Z&&tr(_,null,U,"mounted")},A)},b=(_,I,x,U,A)=>{if(x&&P(_,x),U)for(let T=0;T<U.length;T++)P(_,U[T]);if(A){let T=A.subTree;if(I===T||rf(T.type)&&(T.ssContent===I||T.ssFallback===I)){const k=A.vnode;b(_,k,k.scopeId,k.slotScopeIds,A.parent)}}},g=(_,I,x,U,A,T,k,V,M=0)=>{for(let O=M;O<_.length;O++){const H=_[O]=V?Rn(_[O]):$t(_[O]);B(null,H,I,x,U,A,T,k,V)}},y=(_,I,x,U,A,T,k)=>{const V=I.el=_.el;let{patchFlag:M,dynamicChildren:O,dirs:H}=I;M|=_.patchFlag&16;const $=_.props||Se,K=I.props||Se;let Z;if(x&&nr(x,!1),(Z=K.onVnodeBeforeUpdate)&&Bt(Z,x,I,_),H&&tr(I,_,x,"beforeUpdate"),x&&nr(x,!0),($.innerHTML&&K.innerHTML==null||$.textContent&&K.textContent==null)&&f(V,""),O?w(_.dynamicChildren,O,V,x,U,wa(I,A),T):k||pe(_,I,V,null,x,U,wa(I,A),T,!1),M>0){if(M&16)R(V,$,K,x,A);else if(M&2&&$.class!==K.class&&i(V,"class",null,K.class,A),M&4&&i(V,"style",$.style,K.style,A),M&8){const ee=I.dynamicProps;for(let ae=0;ae<ee.length;ae++){const me=ee[ae],We=$[me],je=K[me];(je!==We||me==="value")&&i(V,me,We,je,A,x)}}M&1&&_.children!==I.children&&f(V,I.children)}else!k&&O==null&&R(V,$,K,x,A);((Z=K.onVnodeUpdated)||H)&&St(()=>{Z&&Bt(Z,x,I,_),H&&tr(I,_,x,"updated")},U)},w=(_,I,x,U,A,T,k)=>{for(let V=0;V<I.length;V++){const M=_[V],O=I[V],H=M.el&&(M.type===ot||!Es(M,O)||M.shapeFlag&198)?m(M.el):x;B(M,O,H,null,U,A,T,k,!0)}},R=(_,I,x,U,A)=>{if(I!==x){if(I!==Se)for(const T in I)!Cs(T)&&!(T in x)&&i(_,T,I[T],null,A,U);for(const T in x){if(Cs(T))continue;const k=x[T],V=I[T];k!==V&&T!=="value"&&i(_,T,V,k,A,U)}"value"in x&&i(_,"value",I.value,x.value,A)}},C=(_,I,x,U,A,T,k,V,M)=>{const O=I.el=_?_.el:l(""),H=I.anchor=_?_.anchor:l("");let{patchFlag:$,dynamicChildren:K,slotScopeIds:Z}=I;Z&&(V=V?V.concat(Z):Z),_==null?(r(O,x,U),r(H,x,U),g(I.children||[],x,H,A,T,k,V,M)):$>0&&$&64&&K&&_.dynamicChildren?(w(_.dynamicChildren,K,x,A,T,k,V),(I.key!=null||A&&I===A.subTree)&&Xd(_,I,!0)):pe(_,I,x,H,A,T,k,V,M)},v=(_,I,x,U,A,T,k,V,M)=>{I.slotScopeIds=V,_==null?I.shapeFlag&512?A.ctx.activate(I,x,U,k,M):fe(I,x,U,A,T,k,M):Pe(_,I,M)},fe=(_,I,x,U,A,T,k)=>{const V=_.component=V_(_,U,A);if(Fd(_)&&(V.ctx.renderer=ft),x_(V,!1,k),V.asyncDep){if(A&&A.registerDep(V,ye,k),!_.el){const M=V.subTree=ln(jn);Q(null,M,I,x)}}else ye(V,_,I,x,A,T,k)},Pe=(_,I,x)=>{const U=I.component=_.component;if(w_(_,I,x))if(U.asyncDep&&!U.asyncResolved){ce(U,I,x);return}else U.next=I,U.update();else I.el=_.el,U.vnode=I},ye=(_,I,x,U,A,T,k)=>{const V=()=>{if(_.isMounted){let{next:$,bu:K,u:Z,parent:ee,vnode:ae}=_;{const $e=Zd(_);if($e){$&&($.el=ae.el,ce(_,$,k)),$e.asyncDep.then(()=>{_.isUnmounted||V()});return}}let me=$,We;nr(_,!1),$?($.el=ae.el,ce(_,$,k)):$=ae,K&&ji(K),(We=$.props&&$.props.onVnodeBeforeUpdate)&&Bt(We,ee,$,ae),nr(_,!0);const je=Aa(_),bt=_.subTree;_.subTree=je,B(bt,je,m(bt.el),Vt(bt),_,A,T),$.el=je.el,me===null&&I_(_,je.el),Z&&St(Z,A),(We=$.props&&$.props.onVnodeUpdated)&&St(()=>Bt(We,ee,$,ae),A)}else{let $;const{el:K,props:Z}=I,{bm:ee,m:ae,parent:me,root:We,type:je}=_,bt=xs(I);if(nr(_,!1),ee&&ji(ee),!bt&&($=Z&&Z.onVnodeBeforeMount)&&Bt($,me,I),nr(_,!0),K&&At){const $e=()=>{_.subTree=Aa(_),At(K,_.subTree,_,A,null)};bt&&je.__asyncHydrate?je.__asyncHydrate(K,_,$e):$e()}else{We.ce&&We.ce._def.shadowRoot!==!1&&We.ce._injectChildStyle(je);const $e=_.subTree=Aa(_);B(null,$e,x,U,_,A,T),I.el=$e.el}if(ae&&St(ae,A),!bt&&($=Z&&Z.onVnodeMounted)){const $e=I;St(()=>Bt($,me,$e),A)}(I.shapeFlag&256||me&&xs(me.vnode)&&me.vnode.shapeFlag&256)&&_.a&&St(_.a,A),_.isMounted=!0,I=x=U=null}};_.scope.on();const M=_.effect=new md(V);_.scope.off();const O=_.update=M.run.bind(M),H=_.job=M.runIfDirty.bind(M);H.i=_,H.id=_.uid,M.scheduler=()=>Ll(H),nr(_,!0),O()},ce=(_,I,x)=>{I.component=_;const U=_.vnode.props;_.vnode=I,_.next=null,o_(_,I.props,U,x),u_(_,I.children,x),cn(),bu(_),un()},pe=(_,I,x,U,A,T,k,V,M=!1)=>{const O=_&&_.children,H=_?_.shapeFlag:0,$=I.children,{patchFlag:K,shapeFlag:Z}=I;if(K>0){if(K&128){Jt(O,$,x,U,A,T,k,V,M);return}else if(K&256){vt(O,$,x,U,A,T,k,V,M);return}}Z&8?(H&16&&wt(O,A,T),$!==O&&f(x,$)):H&16?Z&16?Jt(O,$,x,U,A,T,k,V,M):wt(O,A,T,!0):(H&8&&f(x,""),Z&16&&g($,x,U,A,T,k,V,M))},vt=(_,I,x,U,A,T,k,V,M)=>{_=_||Nr,I=I||Nr;const O=_.length,H=I.length,$=Math.min(O,H);let K;for(K=0;K<$;K++){const Z=I[K]=M?Rn(I[K]):$t(I[K]);B(_[K],Z,x,null,A,T,k,V,M)}O>H?wt(_,A,T,!0,!1,$):g(I,x,U,A,T,k,V,M,$)},Jt=(_,I,x,U,A,T,k,V,M)=>{let O=0;const H=I.length;let $=_.length-1,K=H-1;for(;O<=$&&O<=K;){const Z=_[O],ee=I[O]=M?Rn(I[O]):$t(I[O]);if(Es(Z,ee))B(Z,ee,x,null,A,T,k,V,M);else break;O++}for(;O<=$&&O<=K;){const Z=_[$],ee=I[K]=M?Rn(I[K]):$t(I[K]);if(Es(Z,ee))B(Z,ee,x,null,A,T,k,V,M);else break;$--,K--}if(O>$){if(O<=K){const Z=K+1,ee=Z<H?I[Z].el:U;for(;O<=K;)B(null,I[O]=M?Rn(I[O]):$t(I[O]),x,ee,A,T,k,V,M),O++}}else if(O>K)for(;O<=$;)Oe(_[O],A,T,!0),O++;else{const Z=O,ee=O,ae=new Map;for(O=ee;O<=K;O++){const Ke=I[O]=M?Rn(I[O]):$t(I[O]);Ke.key!=null&&ae.set(Ke.key,O)}let me,We=0;const je=K-ee+1;let bt=!1,$e=0;const En=new Array(je);for(O=0;O<je;O++)En[O]=0;for(O=Z;O<=$;O++){const Ke=_[O];if(We>=je){Oe(Ke,A,T,!0);continue}let xt;if(Ke.key!=null)xt=ae.get(Ke.key);else for(me=ee;me<=K;me++)if(En[me-ee]===0&&Es(Ke,I[me])){xt=me;break}xt===void 0?Oe(Ke,A,T,!0):(En[xt-ee]=O+1,xt>=$e?$e=xt:bt=!0,B(Ke,I[xt],x,null,A,T,k,V,M),We++)}const os=bt?p_(En):Nr;for(me=os.length-1,O=je-1;O>=0;O--){const Ke=ee+O,xt=I[Ke],gi=Ke+1<H?I[Ke+1].el:U;En[O]===0?B(null,xt,x,gi,A,T,k,V,M):bt&&(me<0||O!==os[me]?ht(xt,x,gi,2):me--)}}},ht=(_,I,x,U,A=null)=>{const{el:T,type:k,transition:V,children:M,shapeFlag:O}=_;if(O&6){ht(_.component.subTree,I,x,U);return}if(O&128){_.suspense.move(I,x,U);return}if(O&64){k.move(_,I,x,ft);return}if(k===ot){r(T,I,x);for(let $=0;$<M.length;$++)ht(M[$],I,x,U);r(_.anchor,I,x);return}if(k===ba){X(_,I,x);return}if(U!==2&&O&1&&V)if(U===0)V.beforeEnter(T),r(T,I,x),St(()=>V.enter(T),A);else{const{leave:$,delayLeave:K,afterLeave:Z}=V,ee=()=>{_.ctx.isUnmounted?s(T):r(T,I,x)},ae=()=>{$(T,()=>{ee(),Z&&Z()})};K?K(T,ee,ae):ae()}else r(T,I,x)},Oe=(_,I,x,U=!1,A=!1)=>{const{type:T,props:k,ref:V,children:M,dynamicChildren:O,shapeFlag:H,patchFlag:$,dirs:K,cacheIndex:Z}=_;if($===-2&&(A=!1),V!=null&&(cn(),Vs(V,null,x,_,!0),un()),Z!=null&&(I.renderCache[Z]=void 0),H&256){I.ctx.deactivate(_);return}const ee=H&1&&K,ae=!xs(_);let me;if(ae&&(me=k&&k.onVnodeBeforeUnmount)&&Bt(me,I,_),H&6)dt(_.component,x,U);else{if(H&128){_.suspense.unmount(x,U);return}ee&&tr(_,null,I,"beforeUnmount"),H&64?_.type.remove(_,I,x,ft,U):O&&!O.hasOnce&&(T!==ot||$>0&&$&64)?wt(O,I,x,!1,!0):(T===ot&&$&384||!A&&H&16)&&wt(M,I,x),U&&Le(_)}(ae&&(me=k&&k.onVnodeUnmounted)||ee)&&St(()=>{me&&Bt(me,I,_),ee&&tr(_,null,I,"unmounted")},x)},Le=_=>{const{type:I,el:x,anchor:U,transition:A}=_;if(I===ot){is(x,U);return}if(I===ba){W(_);return}const T=()=>{s(x),A&&!A.persisted&&A.afterLeave&&A.afterLeave()};if(_.shapeFlag&1&&A&&!A.persisted){const{leave:k,delayLeave:V}=A,M=()=>k(x,T);V?V(_.el,T,M):M()}else T()},is=(_,I)=>{let x;for(;_!==I;)x=E(_),s(_),_=x;s(I)},dt=(_,I,x)=>{const{bum:U,scope:A,job:T,subTree:k,um:V,m:M,a:O,parent:H,slots:{__:$}}=_;Du(M),Du(O),U&&ji(U),H&&se($)&&$.forEach(K=>{H.renderCache[K]=void 0}),A.stop(),T&&(T.flags|=8,Oe(k,_,I,x)),V&&St(V,I),St(()=>{_.isUnmounted=!0},I),I&&I.pendingBranch&&!I.isUnmounted&&_.asyncDep&&!_.asyncResolved&&_.suspenseId===I.pendingId&&(I.deps--,I.deps===0&&I.resolve())},wt=(_,I,x,U=!1,A=!1,T=0)=>{for(let k=T;k<_.length;k++)Oe(_[k],I,x,U,A)},Vt=_=>{if(_.shapeFlag&6)return Vt(_.component.subTree);if(_.shapeFlag&128)return _.suspense.next();const I=E(_.anchor||_.el),x=I&&I[Mg];return x?E(x):I};let vn=!1;const Jn=(_,I,x)=>{_==null?I._vnode&&Oe(I._vnode,null,null,!0):B(I._vnode||null,_,I,null,null,null,x),I._vnode=_,vn||(vn=!0,bu(),Nd(),vn=!1)},ft={p:B,um:Oe,m:ht,r:Le,mt:fe,mc:g,pc:pe,pbc:w,n:Vt,o:n};let It,At;return e&&([It,At]=e(ft)),{render:Jn,hydrate:It,createApp:r_(Jn,It)}}function wa({type:n,props:e},t){return t==="svg"&&n==="foreignObject"||t==="mathml"&&n==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:t}function nr({effect:n,job:e},t){t?(n.flags|=32,e.flags|=4):(n.flags&=-33,e.flags&=-5)}function f_(n,e){return(!n||n&&!n.pendingBranch)&&e&&!e.persisted}function Xd(n,e,t=!1){const r=n.children,s=e.children;if(se(r)&&se(s))for(let i=0;i<r.length;i++){const a=r[i];let l=s[i];l.shapeFlag&1&&!l.dynamicChildren&&((l.patchFlag<=0||l.patchFlag===32)&&(l=s[i]=Rn(s[i]),l.el=a.el),!t&&l.patchFlag!==-2&&Xd(a,l)),l.type===Vo&&(l.el=a.el),l.type===jn&&!l.el&&(l.el=a.el)}}function p_(n){const e=n.slice(),t=[0];let r,s,i,a,l;const c=n.length;for(r=0;r<c;r++){const d=n[r];if(d!==0){if(s=t[t.length-1],n[s]<d){e[r]=s,t.push(r);continue}for(i=0,a=t.length-1;i<a;)l=i+a>>1,n[t[l]]<d?i=l+1:a=l;d<n[t[i]]&&(i>0&&(e[r]=t[i-1]),t[i]=r)}}for(i=t.length,a=t[i-1];i-- >0;)t[i]=a,a=e[a];return t}function Zd(n){const e=n.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:Zd(e)}function Du(n){if(n)for(let e=0;e<n.length;e++)n[e].flags|=8}const m_=Symbol.for("v-scx"),g_=()=>$i(m_);function Ia(n,e,t){return ef(n,e,t)}function ef(n,e,t=Se){const{immediate:r,deep:s,flush:i,once:a}=t,l=et({},t),c=e&&r||!e&&i!=="post";let d;if(Ks){if(i==="sync"){const P=g_();d=P.__watcherHandles||(P.__watcherHandles=[])}else if(!c){const P=()=>{};return P.stop=Ft,P.resume=Ft,P.pause=Ft,P}}const f=_t;l.call=(P,N,B)=>Kt(P,f,N,B);let m=!1;i==="post"?l.scheduler=P=>{St(P,f&&f.suspense)}:i!=="sync"&&(m=!0,l.scheduler=(P,N)=>{N?P():Ll(P)}),l.augmentJob=P=>{e&&(P.flags|=4),m&&(P.flags|=2,f&&(P.id=f.uid,P.i=f))};const E=Dg(n,e,l);return Ks&&(d?d.push(E):c&&E()),E}function __(n,e,t){const r=this.proxy,s=Be(n)?n.includes(".")?tf(r,n):()=>r[n]:n.bind(r,r);let i;le(e)?i=e:(i=e.handler,t=e);const a=ri(this),l=ef(s,i.bind(r),t);return a(),l}function tf(n,e){const t=e.split(".");return()=>{let r=n;for(let s=0;s<t.length&&r;s++)r=r[t[s]];return r}}const y_=(n,e)=>e==="modelValue"||e==="model-value"?n.modelModifiers:n[`${e}Modifiers`]||n[`${Un(e)}Modifiers`]||n[`${Kn(e)}Modifiers`];function v_(n,e,...t){if(n.isUnmounted)return;const r=n.vnode.props||Se;let s=t;const i=e.startsWith("update:"),a=i&&y_(r,e.slice(7));a&&(a.trim&&(s=t.map(f=>Be(f)?f.trim():f)),a.number&&(s=t.map(Ha)));let l,c=r[l=ga(e)]||r[l=ga(Un(e))];!c&&i&&(c=r[l=ga(Kn(e))]),c&&Kt(c,n,6,s);const d=r[l+"Once"];if(d){if(!n.emitted)n.emitted={};else if(n.emitted[l])return;n.emitted[l]=!0,Kt(d,n,6,s)}}function nf(n,e,t=!1){const r=e.emitsCache,s=r.get(n);if(s!==void 0)return s;const i=n.emits;let a={},l=!1;if(!le(n)){const c=d=>{const f=nf(d,e,!0);f&&(l=!0,et(a,f))};!t&&e.mixins.length&&e.mixins.forEach(c),n.extends&&c(n.extends),n.mixins&&n.mixins.forEach(c)}return!i&&!l?(xe(n)&&r.set(n,null),null):(se(i)?i.forEach(c=>a[c]=null):et(a,i),xe(n)&&r.set(n,a),a)}function Do(n,e){return!n||!Ao(e)?!1:(e=e.slice(2).replace(/Once$/,""),Ie(n,e[0].toLowerCase()+e.slice(1))||Ie(n,Kn(e))||Ie(n,e))}function Aa(n){const{type:e,vnode:t,proxy:r,withProxy:s,propsOptions:[i],slots:a,attrs:l,emit:c,render:d,renderCache:f,props:m,data:E,setupState:P,ctx:N,inheritAttrs:B}=n,j=ro(n);let Q,J;try{if(t.shapeFlag&4){const W=s||r,de=W;Q=$t(d.call(de,W,f,m,P,E,N)),J=l}else{const W=e;Q=$t(W.length>1?W(m,{attrs:l,slots:a,emit:c}):W(m,null)),J=e.props?l:E_(l)}}catch(W){Os.length=0,Co(W,n,1),Q=ln(jn)}let X=Q;if(J&&B!==!1){const W=Object.keys(J),{shapeFlag:de}=X;W.length&&de&7&&(i&&W.some(Rl)&&(J=T_(J,i)),X=qr(X,J,!1,!0))}return t.dirs&&(X=qr(X,null,!1,!0),X.dirs=X.dirs?X.dirs.concat(t.dirs):t.dirs),t.transition&&Fl(X,t.transition),Q=X,ro(j),Q}const E_=n=>{let e;for(const t in n)(t==="class"||t==="style"||Ao(t))&&((e||(e={}))[t]=n[t]);return e},T_=(n,e)=>{const t={};for(const r in n)(!Rl(r)||!(r.slice(9)in e))&&(t[r]=n[r]);return t};function w_(n,e,t){const{props:r,children:s,component:i}=n,{props:a,children:l,patchFlag:c}=e,d=i.emitsOptions;if(e.dirs||e.transition)return!0;if(t&&c>=0){if(c&1024)return!0;if(c&16)return r?Vu(r,a,d):!!a;if(c&8){const f=e.dynamicProps;for(let m=0;m<f.length;m++){const E=f[m];if(a[E]!==r[E]&&!Do(d,E))return!0}}}else return(s||l)&&(!l||!l.$stable)?!0:r===a?!1:r?a?Vu(r,a,d):!0:!!a;return!1}function Vu(n,e,t){const r=Object.keys(e);if(r.length!==Object.keys(n).length)return!0;for(let s=0;s<r.length;s++){const i=r[s];if(e[i]!==n[i]&&!Do(t,i))return!0}return!1}function I_({vnode:n,parent:e},t){for(;e;){const r=e.subTree;if(r.suspense&&r.suspense.activeBranch===n&&(r.el=n.el),r===n)(n=e.vnode).el=t,e=e.parent;else break}}const rf=n=>n.__isSuspense;function A_(n,e){e&&e.pendingBranch?se(n)?e.effects.push(...n):e.effects.push(n):Ng(n)}const ot=Symbol.for("v-fgt"),Vo=Symbol.for("v-txt"),jn=Symbol.for("v-cmt"),ba=Symbol.for("v-stc"),Os=[];let Pt=null;function Te(n=!1){Os.push(Pt=n?null:[])}function b_(){Os.pop(),Pt=Os[Os.length-1]||null}let Ws=1;function xu(n,e=!1){Ws+=n,n<0&&Pt&&e&&(Pt.hasOnce=!0)}function sf(n){return n.dynamicChildren=Ws>0?Pt||Nr:null,b_(),Ws>0&&Pt&&Pt.push(n),n}function be(n,e,t,r,s,i){return sf(z(n,e,t,r,s,i,!0))}function of(n,e,t,r,s){return sf(ln(n,e,t,r,s,!0))}function af(n){return n?n.__v_isVNode===!0:!1}function Es(n,e){return n.type===e.type&&n.key===e.key}const lf=({key:n})=>n??null,qi=({ref:n,ref_key:e,ref_for:t})=>(typeof n=="number"&&(n=""+n),n!=null?Be(n)||ct(n)||le(n)?{i:Nt,r:n,k:e,f:!!t}:n:null);function z(n,e=null,t=null,r=0,s=null,i=n===ot?0:1,a=!1,l=!1){const c={__v_isVNode:!0,__v_skip:!0,type:n,props:e,key:e&&lf(e),ref:e&&qi(e),scopeId:Md,slotScopeIds:null,children:t,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:r,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:Nt};return l?($l(c,t),i&128&&n.normalize(c)):t&&(c.shapeFlag|=Be(t)?8:16),Ws>0&&!a&&Pt&&(c.patchFlag>0||i&6)&&c.patchFlag!==32&&Pt.push(c),c}const ln=R_;function R_(n,e=null,t=null,r=0,s=null,i=!1){if((!n||n===Qg)&&(n=jn),af(n)){const l=qr(n,e,!0);return t&&$l(l,t),Ws>0&&!i&&Pt&&(l.shapeFlag&6?Pt[Pt.indexOf(n)]=l:Pt.push(l)),l.patchFlag=-2,l}if(L_(n)&&(n=n.__vccOpts),e){e=S_(e);let{class:l,style:c}=e;l&&!Be(l)&&(e.class=$s(l)),xe(c)&&(Ml(c)&&!se(c)&&(c=et({},c)),e.style=js(c))}const a=Be(n)?1:rf(n)?128:Lg(n)?64:xe(n)?4:le(n)?2:0;return z(n,e,t,r,s,a,i,!0)}function S_(n){return n?Ml(n)||Wd(n)?et({},n):n:null}function qr(n,e,t=!1,r=!1){const{props:s,ref:i,patchFlag:a,children:l,transition:c}=n,d=e?C_(s||{},e):s,f={__v_isVNode:!0,__v_skip:!0,type:n.type,props:d,key:d&&lf(d),ref:e&&e.ref?t&&i?se(i)?i.concat(qi(e)):[i,qi(e)]:qi(e):i,scopeId:n.scopeId,slotScopeIds:n.slotScopeIds,children:l,target:n.target,targetStart:n.targetStart,targetAnchor:n.targetAnchor,staticCount:n.staticCount,shapeFlag:n.shapeFlag,patchFlag:e&&n.type!==ot?a===-1?16:a|16:a,dynamicProps:n.dynamicProps,dynamicChildren:n.dynamicChildren,appContext:n.appContext,dirs:n.dirs,transition:c,component:n.component,suspense:n.suspense,ssContent:n.ssContent&&qr(n.ssContent),ssFallback:n.ssFallback&&qr(n.ssFallback),el:n.el,anchor:n.anchor,ctx:n.ctx,ce:n.ce};return c&&r&&Fl(f,c.clone(f)),f}function P_(n=" ",e=0){return ln(Vo,null,n,e)}function Ts(n="",e=!1){return e?(Te(),of(jn,null,n)):ln(jn,null,n)}function $t(n){return n==null||typeof n=="boolean"?ln(jn):se(n)?ln(ot,null,n.slice()):af(n)?Rn(n):ln(Vo,null,String(n))}function Rn(n){return n.el===null&&n.patchFlag!==-1||n.memo?n:qr(n)}function $l(n,e){let t=0;const{shapeFlag:r}=n;if(e==null)e=null;else if(se(e))t=16;else if(typeof e=="object")if(r&65){const s=e.default;s&&(s._c&&(s._d=!1),$l(n,s()),s._c&&(s._d=!0));return}else{t=32;const s=e._;!s&&!Wd(e)?e._ctx=Nt:s===3&&Nt&&(Nt.slots._===1?e._=1:(e._=2,n.patchFlag|=1024))}else le(e)?(e={default:e,_ctx:Nt},t=32):(e=String(e),r&64?(t=16,e=[P_(e)]):t=8);n.children=e,n.shapeFlag|=t}function C_(...n){const e={};for(let t=0;t<n.length;t++){const r=n[t];for(const s in r)if(s==="class")e.class!==r.class&&(e.class=$s([e.class,r.class]));else if(s==="style")e.style=js([e.style,r.style]);else if(Ao(s)){const i=e[s],a=r[s];a&&i!==a&&!(se(i)&&i.includes(a))&&(e[s]=i?[].concat(i,a):a)}else s!==""&&(e[s]=r[s])}return e}function Bt(n,e,t,r=null){Kt(n,e,7,[t,r])}const k_=qd();let D_=0;function V_(n,e,t){const r=n.type,s=(e?e.appContext:n.appContext)||k_,i={uid:D_++,vnode:n,type:r,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new ng(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:Gd(r,s),emitsOptions:nf(r,s),emit:null,emitted:null,propsDefaults:Se,inheritAttrs:r.inheritAttrs,ctx:Se,data:Se,props:Se,attrs:Se,slots:Se,refs:Se,setupState:Se,setupContext:null,suspense:t,suspenseId:t?t.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=e?e.root:i,i.emit=v_.bind(null,i),n.ce&&n.ce(i),i}let _t=null,io,Za;{const n=So(),e=(t,r)=>{let s;return(s=n[t])||(s=n[t]=[]),s.push(r),i=>{s.length>1?s.forEach(a=>a(i)):s[0](i)}};io=e("__VUE_INSTANCE_SETTERS__",t=>_t=t),Za=e("__VUE_SSR_SETTERS__",t=>Ks=t)}const ri=n=>{const e=_t;return io(n),n.scope.on(),()=>{n.scope.off(),io(e)}},Nu=()=>{_t&&_t.scope.off(),io(null)};function cf(n){return n.vnode.shapeFlag&4}let Ks=!1;function x_(n,e=!1,t=!1){e&&Za(e);const{props:r,children:s}=n.vnode,i=cf(n);i_(n,r,i,e),c_(n,s,t||e);const a=i?N_(n,e):void 0;return e&&Za(!1),a}function N_(n,e){const t=n.type;n.accessCache=Object.create(null),n.proxy=new Proxy(n.ctx,Jg);const{setup:r}=t;if(r){cn();const s=n.setupContext=r.length>1?M_(n):null,i=ri(n),a=ni(r,n,0,[n.props,s]),l=ld(a);if(un(),i(),(l||n.sp)&&!xs(n)&&Ld(n),l){if(a.then(Nu,Nu),e)return a.then(c=>{Ou(n,c,e)}).catch(c=>{Co(c,n,0)});n.asyncDep=a}else Ou(n,a,e)}else uf(n,e)}function Ou(n,e,t){le(e)?n.type.__ssrInlineRender?n.ssrRender=e:n.render=e:xe(e)&&(n.setupState=kd(e)),uf(n,t)}let Mu;function uf(n,e,t){const r=n.type;if(!n.render){if(!e&&Mu&&!r.render){const s=r.template||Ul(n).template;if(s){const{isCustomElement:i,compilerOptions:a}=n.appContext.config,{delimiters:l,compilerOptions:c}=r,d=et(et({isCustomElement:i,delimiters:l},a),c);r.render=Mu(s,d)}}n.render=r.render||Ft}{const s=ri(n);cn();try{Yg(n)}finally{un(),s()}}}const O_={get(n,e){return at(n,"get",""),n[e]}};function M_(n){const e=t=>{n.exposed=t||{}};return{attrs:new Proxy(n.attrs,O_),slots:n.slots,emit:n.emit,expose:e}}function xo(n){return n.exposed?n.exposeProxy||(n.exposeProxy=new Proxy(kd(Ig(n.exposed)),{get(e,t){if(t in e)return e[t];if(t in Ns)return Ns[t](n)},has(e,t){return t in e||t in Ns}})):n.proxy}function L_(n){return le(n)&&"__vccOpts"in n}const F_=(n,e)=>Cg(n,e,Ks),U_="3.5.17";/**
* @vue/runtime-dom v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let el;const Lu=typeof window<"u"&&window.trustedTypes;if(Lu)try{el=Lu.createPolicy("vue",{createHTML:n=>n})}catch{}const hf=el?n=>el.createHTML(n):n=>n,B_="http://www.w3.org/2000/svg",j_="http://www.w3.org/1998/Math/MathML",en=typeof document<"u"?document:null,Fu=en&&en.createElement("template"),$_={insert:(n,e,t)=>{e.insertBefore(n,t||null)},remove:n=>{const e=n.parentNode;e&&e.removeChild(n)},createElement:(n,e,t,r)=>{const s=e==="svg"?en.createElementNS(B_,n):e==="mathml"?en.createElementNS(j_,n):t?en.createElement(n,{is:t}):en.createElement(n);return n==="select"&&r&&r.multiple!=null&&s.setAttribute("multiple",r.multiple),s},createText:n=>en.createTextNode(n),createComment:n=>en.createComment(n),setText:(n,e)=>{n.nodeValue=e},setElementText:(n,e)=>{n.textContent=e},parentNode:n=>n.parentNode,nextSibling:n=>n.nextSibling,querySelector:n=>en.querySelector(n),setScopeId(n,e){n.setAttribute(e,"")},insertStaticContent(n,e,t,r,s,i){const a=t?t.previousSibling:e.lastChild;if(s&&(s===i||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),t),!(s===i||!(s=s.nextSibling)););else{Fu.innerHTML=hf(r==="svg"?`<svg>${n}</svg>`:r==="mathml"?`<math>${n}</math>`:n);const l=Fu.content;if(r==="svg"||r==="mathml"){const c=l.firstChild;for(;c.firstChild;)l.appendChild(c.firstChild);l.removeChild(c)}e.insertBefore(l,t)}return[a?a.nextSibling:e.firstChild,t?t.previousSibling:e.lastChild]}},q_=Symbol("_vtc");function H_(n,e,t){const r=n[q_];r&&(e=(e?[e,...r]:[...r]).join(" ")),e==null?n.removeAttribute("class"):t?n.setAttribute("class",e):n.className=e}const Uu=Symbol("_vod"),z_=Symbol("_vsh"),W_=Symbol(""),K_=/(^|;)\s*display\s*:/;function G_(n,e,t){const r=n.style,s=Be(t);let i=!1;if(t&&!s){if(e)if(Be(e))for(const a of e.split(";")){const l=a.slice(0,a.indexOf(":")).trim();t[l]==null&&Hi(r,l,"")}else for(const a in e)t[a]==null&&Hi(r,a,"");for(const a in t)a==="display"&&(i=!0),Hi(r,a,t[a])}else if(s){if(e!==t){const a=r[W_];a&&(t+=";"+a),r.cssText=t,i=K_.test(t)}}else e&&n.removeAttribute("style");Uu in n&&(n[Uu]=i?r.display:"",n[z_]&&(r.display="none"))}const Bu=/\s*!important$/;function Hi(n,e,t){if(se(t))t.forEach(r=>Hi(n,e,r));else if(t==null&&(t=""),e.startsWith("--"))n.setProperty(e,t);else{const r=Q_(n,e);Bu.test(t)?n.setProperty(Kn(r),t.replace(Bu,""),"important"):n[r]=t}}const ju=["Webkit","Moz","ms"],Ra={};function Q_(n,e){const t=Ra[e];if(t)return t;let r=Un(e);if(r!=="filter"&&r in n)return Ra[e]=r;r=hd(r);for(let s=0;s<ju.length;s++){const i=ju[s]+r;if(i in n)return Ra[e]=i}return e}const $u="http://www.w3.org/1999/xlink";function qu(n,e,t,r,s,i=tg(e)){r&&e.startsWith("xlink:")?t==null?n.removeAttributeNS($u,e.slice(6,e.length)):n.setAttributeNS($u,e,t):t==null||i&&!dd(t)?n.removeAttribute(e):n.setAttribute(e,i?"":Wn(t)?String(t):t)}function Hu(n,e,t,r,s){if(e==="innerHTML"||e==="textContent"){t!=null&&(n[e]=e==="innerHTML"?hf(t):t);return}const i=n.tagName;if(e==="value"&&i!=="PROGRESS"&&!i.includes("-")){const l=i==="OPTION"?n.getAttribute("value")||"":n.value,c=t==null?n.type==="checkbox"?"on":"":String(t);(l!==c||!("_value"in n))&&(n.value=c),t==null&&n.removeAttribute(e),n._value=t;return}let a=!1;if(t===""||t==null){const l=typeof n[e];l==="boolean"?t=dd(t):t==null&&l==="string"?(t="",a=!0):l==="number"&&(t=0,a=!0)}try{n[e]=t}catch{}a&&n.removeAttribute(s||e)}function Cr(n,e,t,r){n.addEventListener(e,t,r)}function J_(n,e,t,r){n.removeEventListener(e,t,r)}const zu=Symbol("_vei");function Y_(n,e,t,r,s=null){const i=n[zu]||(n[zu]={}),a=i[e];if(r&&a)a.value=r;else{const[l,c]=X_(e);if(r){const d=i[e]=ty(r,s);Cr(n,l,d,c)}else a&&(J_(n,l,a,c),i[e]=void 0)}}const Wu=/(?:Once|Passive|Capture)$/;function X_(n){let e;if(Wu.test(n)){e={};let r;for(;r=n.match(Wu);)n=n.slice(0,n.length-r[0].length),e[r[0].toLowerCase()]=!0}return[n[2]===":"?n.slice(3):Kn(n.slice(2)),e]}let Sa=0;const Z_=Promise.resolve(),ey=()=>Sa||(Z_.then(()=>Sa=0),Sa=Date.now());function ty(n,e){const t=r=>{if(!r._vts)r._vts=Date.now();else if(r._vts<=t.attached)return;Kt(ny(r,t.value),e,5,[r])};return t.value=n,t.attached=ey(),t}function ny(n,e){if(se(e)){const t=n.stopImmediatePropagation;return n.stopImmediatePropagation=()=>{t.call(n),n._stopped=!0},e.map(r=>s=>!s._stopped&&r&&r(s))}else return e}const Ku=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&n.charCodeAt(2)>96&&n.charCodeAt(2)<123,ry=(n,e,t,r,s,i)=>{const a=s==="svg";e==="class"?H_(n,r,a):e==="style"?G_(n,t,r):Ao(e)?Rl(e)||Y_(n,e,t,r,i):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):sy(n,e,r,a))?(Hu(n,e,r),!n.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&qu(n,e,r,a,i,e!=="value")):n._isVueCE&&(/[A-Z]/.test(e)||!Be(r))?Hu(n,Un(e),r,i,e):(e==="true-value"?n._trueValue=r:e==="false-value"&&(n._falseValue=r),qu(n,e,r,a))};function sy(n,e,t,r){if(r)return!!(e==="innerHTML"||e==="textContent"||e in n&&Ku(e)&&le(t));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="form"||e==="list"&&n.tagName==="INPUT"||e==="type"&&n.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=n.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return Ku(e)&&Be(t)?!1:e in n}const Gu=n=>{const e=n.props["onUpdate:modelValue"]||!1;return se(e)?t=>ji(e,t):e};function iy(n){n.target.composing=!0}function Qu(n){const e=n.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const Pa=Symbol("_assign"),Rr={created(n,{modifiers:{lazy:e,trim:t,number:r}},s){n[Pa]=Gu(s);const i=r||s.props&&s.props.type==="number";Cr(n,e?"change":"input",a=>{if(a.target.composing)return;let l=n.value;t&&(l=l.trim()),i&&(l=Ha(l)),n[Pa](l)}),t&&Cr(n,"change",()=>{n.value=n.value.trim()}),e||(Cr(n,"compositionstart",iy),Cr(n,"compositionend",Qu),Cr(n,"change",Qu))},mounted(n,{value:e}){n.value=e??""},beforeUpdate(n,{value:e,oldValue:t,modifiers:{lazy:r,trim:s,number:i}},a){if(n[Pa]=Gu(a),n.composing)return;const l=(i||n.type==="number")&&!/^0\d/.test(n.value)?Ha(n.value):n.value,c=e??"";l!==c&&(document.activeElement===n&&n.type!=="range"&&(r&&e===t||s&&n.value.trim()===c)||(n.value=c))}},oy={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},Sr=(n,e)=>{const t=n._withKeys||(n._withKeys={}),r=e.join(".");return t[r]||(t[r]=s=>{if(!("key"in s))return;const i=Kn(s.key);if(e.some(a=>a===i||oy[a]===i))return n(s)})},ay=et({patchProp:ry},$_);let Ju;function ly(){return Ju||(Ju=h_(ay))}const cy=(...n)=>{const e=ly().createApp(...n),{mount:t}=e;return e.mount=r=>{const s=hy(r);if(!s)return;const i=e._component;!le(i)&&!i.render&&!i.template&&(i.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const a=t(s,!1,uy(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),a},e};function uy(n){if(n instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&n instanceof MathMLElement)return"mathml"}function hy(n){return Be(n)?document.querySelector(n):n}/**
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
 */const df=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},dy=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],a=n[t++],l=n[t++],c=((s&7)<<18|(i&63)<<12|(a&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const i=n[t++],a=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},ff={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],a=s+1<n.length,l=a?n[s+1]:0,c=s+2<n.length,d=c?n[s+2]:0,f=i>>2,m=(i&3)<<4|l>>4;let E=(l&15)<<2|d>>6,P=d&63;c||(P=64,a||(E=64)),r.push(t[f],t[m],t[E],t[P])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(df(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):dy(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],l=s<n.length?t[n.charAt(s)]:0;++s;const d=s<n.length?t[n.charAt(s)]:64;++s;const m=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||l==null||d==null||m==null)throw new fy;const E=i<<2|l>>4;if(r.push(E),d!==64){const P=l<<4&240|d>>2;if(r.push(P),m!==64){const N=d<<6&192|m;r.push(N)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class fy extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const py=function(n){const e=df(n);return ff.encodeByteArray(e,!0)},oo=function(n){return py(n).replace(/\./g,"")},pf=function(n){try{return ff.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */const Dy="FirebaseError";class yn extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Dy,Object.setPrototypeOf(this,yn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,si.prototype.create)}}class si{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?Vy(i,r):"Error",l=`${this.serviceName}: ${a} (${s}).`;return new yn(s,l,r)}}function Vy(n,e){return n.replace(xy,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const xy=/\{\$([^}]+)}/g;function Ny(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function ao(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],a=e[s];if(Yu(i)&&Yu(a)){if(!ao(i,a))return!1}else if(i!==a)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function Yu(n){return n!==null&&typeof n=="object"}/**
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
 */function yt(n){return n&&n._delegate?n._delegate:n}class cr{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const ir="[DEFAULT]";/**
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
 */class Fy{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Ey;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(By(e))try{this.getOrInitializeService({instanceIdentifier:ir})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=ir){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=ir){return this.instances.has(e)}getOptions(e=ir){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,a]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(i);r===l&&a.resolve(s)}return s}onInit(e,t){var r;const s=this.normalizeInstanceIdentifier(t),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const a=this.instances.get(s);return a&&e(a,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Uy(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=ir){return this.component?this.component.multipleInstances?e:ir:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Uy(n){return n===ir?void 0:n}function By(n){return n.instantiationMode==="EAGER"}/**
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
 */var he;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(he||(he={}));const $y={debug:he.DEBUG,verbose:he.VERBOSE,info:he.INFO,warn:he.WARN,error:he.ERROR,silent:he.SILENT},qy=he.INFO,Hy={[he.DEBUG]:"log",[he.VERBOSE]:"log",[he.INFO]:"info",[he.WARN]:"warn",[he.ERROR]:"error"},zy=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=Hy[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class ql{constructor(e){this.name=e,this._logLevel=qy,this._logHandler=zy,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in he))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?$y[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,he.DEBUG,...e),this._logHandler(this,he.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,he.VERBOSE,...e),this._logHandler(this,he.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,he.INFO,...e),this._logHandler(this,he.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,he.WARN,...e),this._logHandler(this,he.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,he.ERROR,...e),this._logHandler(this,he.ERROR,...e)}}const Wy=(n,e)=>e.some(t=>n instanceof t);let Xu,Zu;function Ky(){return Xu||(Xu=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Gy(){return Zu||(Zu=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const yf=new WeakMap,tl=new WeakMap,vf=new WeakMap,ka=new WeakMap,Hl=new WeakMap;function Qy(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",i),n.removeEventListener("error",a)},i=()=>{t(xn(n.result)),s()},a=()=>{r(n.error),s()};n.addEventListener("success",i),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&yf.set(t,n)}).catch(()=>{}),Hl.set(e,n),e}function Jy(n){if(tl.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",a),n.removeEventListener("abort",a)},i=()=>{t(),s()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",i),n.addEventListener("error",a),n.addEventListener("abort",a)});tl.set(n,e)}let nl={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return tl.get(n);if(e==="objectStoreNames")return n.objectStoreNames||vf.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return xn(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function Yy(n){nl=n(nl)}function Xy(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(Da(this),e,...t);return vf.set(r,e.sort?e.sort():[e]),xn(r)}:Gy().includes(n)?function(...e){return n.apply(Da(this),e),xn(yf.get(this))}:function(...e){return xn(n.apply(Da(this),e))}}function Zy(n){return typeof n=="function"?Xy(n):(n instanceof IDBTransaction&&Jy(n),Wy(n,Ky())?new Proxy(n,nl):n)}function xn(n){if(n instanceof IDBRequest)return Qy(n);if(ka.has(n))return ka.get(n);const e=Zy(n);return e!==n&&(ka.set(n,e),Hl.set(e,n)),e}const Da=n=>Hl.get(n);function ev(n,e,{blocked:t,upgrade:r,blocking:s,terminated:i}={}){const a=indexedDB.open(n,e),l=xn(a);return r&&a.addEventListener("upgradeneeded",c=>{r(xn(a.result),c.oldVersion,c.newVersion,xn(a.transaction),c)}),t&&a.addEventListener("blocked",c=>t(c.oldVersion,c.newVersion,c)),l.then(c=>{i&&c.addEventListener("close",()=>i()),s&&c.addEventListener("versionchange",d=>s(d.oldVersion,d.newVersion,d))}).catch(()=>{}),l}const tv=["get","getKey","getAll","getAllKeys","count"],nv=["put","add","delete","clear"],Va=new Map;function eh(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(Va.get(e))return Va.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=nv.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||tv.includes(t)))return;const i=async function(a,...l){const c=this.transaction(a,s?"readwrite":"readonly");let d=c.store;return r&&(d=d.index(l.shift())),(await Promise.all([d[t](...l),s&&c.done]))[0]};return Va.set(e,i),i}Yy(n=>({...n,get:(e,t,r)=>eh(e,t)||n.get(e,t,r),has:(e,t)=>!!eh(e,t)||n.has(e,t)}));/**
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
 */const hn=new ql("@firebase/app"),iv="@firebase/app-compat",ov="@firebase/analytics-compat",av="@firebase/analytics",lv="@firebase/app-check-compat",cv="@firebase/app-check",uv="@firebase/auth",hv="@firebase/auth-compat",dv="@firebase/database",fv="@firebase/data-connect",pv="@firebase/database-compat",mv="@firebase/functions",gv="@firebase/functions-compat",_v="@firebase/installations",yv="@firebase/installations-compat",vv="@firebase/messaging",Ev="@firebase/messaging-compat",Tv="@firebase/performance",wv="@firebase/performance-compat",Iv="@firebase/remote-config",Av="@firebase/remote-config-compat",bv="@firebase/storage",Rv="@firebase/storage-compat",Sv="@firebase/firestore",Pv="@firebase/vertexai-preview",Cv="@firebase/firestore-compat",kv="firebase",Dv="10.14.1";/**
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
 */const sl="[DEFAULT]",Vv={[rl]:"fire-core",[iv]:"fire-core-compat",[av]:"fire-analytics",[ov]:"fire-analytics-compat",[cv]:"fire-app-check",[lv]:"fire-app-check-compat",[uv]:"fire-auth",[hv]:"fire-auth-compat",[dv]:"fire-rtdb",[fv]:"fire-data-connect",[pv]:"fire-rtdb-compat",[mv]:"fire-fn",[gv]:"fire-fn-compat",[_v]:"fire-iid",[yv]:"fire-iid-compat",[vv]:"fire-fcm",[Ev]:"fire-fcm-compat",[Tv]:"fire-perf",[wv]:"fire-perf-compat",[Iv]:"fire-rc",[Av]:"fire-rc-compat",[bv]:"fire-gcs",[Rv]:"fire-gcs-compat",[Sv]:"fire-fst",[Cv]:"fire-fst-compat",[Pv]:"fire-vertex","fire-js":"fire-js",[kv]:"fire-js-all"};/**
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
 */const lo=new Map,xv=new Map,il=new Map;function nh(n,e){try{n.container.addComponent(e)}catch(t){hn.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Hr(n){const e=n.name;if(il.has(e))return hn.debug(`There were multiple attempts to register component ${e}.`),!1;il.set(e,n);for(const t of lo.values())nh(t,n);for(const t of xv.values())nh(t,n);return!0}function zl(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function rn(n){return n.settings!==void 0}/**
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
 */class Ov{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new cr("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Nn.create("app-deleted",{appName:this._name})}}/**
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
 */const Xr=Dv;function Ef(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:sl,automaticDataCollectionEnabled:!1},e),s=r.name;if(typeof s!="string"||!s)throw Nn.create("bad-app-name",{appName:String(s)});if(t||(t=gf()),!t)throw Nn.create("no-options");const i=lo.get(s);if(i){if(ao(t,i.options)&&ao(r,i.config))return i;throw Nn.create("duplicate-app",{appName:s})}const a=new jy(s);for(const c of il.values())a.addComponent(c);const l=new Ov(t,r,a);return lo.set(s,l),l}function Tf(n=sl){const e=lo.get(n);if(!e&&n===sl&&gf())return Ef();if(!e)throw Nn.create("no-app",{appName:n});return e}function On(n,e,t){var r;let s=(r=Vv[n])!==null&&r!==void 0?r:n;t&&(s+=`-${t}`);const i=s.match(/\s|\//),a=e.match(/\s|\//);if(i||a){const l=[`Unable to register library "${s}" with version "${e}":`];i&&l.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&a&&l.push("and"),a&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),hn.warn(l.join(" "));return}Hr(new cr(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const Mv="firebase-heartbeat-database",Lv=1,Gs="firebase-heartbeat-store";let xa=null;function wf(){return xa||(xa=ev(Mv,Lv,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Gs)}catch(t){console.warn(t)}}}}).catch(n=>{throw Nn.create("idb-open",{originalErrorMessage:n.message})})),xa}async function Fv(n){try{const t=(await wf()).transaction(Gs),r=await t.objectStore(Gs).get(If(n));return await t.done,r}catch(e){if(e instanceof yn)hn.warn(e.message);else{const t=Nn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});hn.warn(t.message)}}}async function rh(n,e){try{const r=(await wf()).transaction(Gs,"readwrite");await r.objectStore(Gs).put(e,If(n)),await r.done}catch(t){if(t instanceof yn)hn.warn(t.message);else{const r=Nn.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});hn.warn(r.message)}}}function If(n){return`${n.name}!${n.options.appId}`}/**
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
 */const Uv=1024,Bv=30*24*60*60*1e3;class jv{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new qv(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=sh();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const l=new Date(a.date).valueOf();return Date.now()-l<=Bv}),this._storage.overwrite(this._heartbeatsCache))}catch(r){hn.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=sh(),{heartbeatsToSend:r,unsentEntries:s}=$v(this._heartbeatsCache.heartbeats),i=oo(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return hn.warn(t),""}}}function sh(){return new Date().toISOString().substring(0,10)}function $v(n,e=Uv){const t=[];let r=n.slice();for(const s of n){const i=t.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),ih(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),ih(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class qv{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Cy()?ky().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Fv(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return rh(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return rh(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function ih(n){return oo(JSON.stringify({version:2,heartbeats:n})).length}/**
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
 */function Hv(n){Hr(new cr("platform-logger",e=>new rv(e),"PRIVATE")),Hr(new cr("heartbeat",e=>new jv(e),"PRIVATE")),On(rl,th,n),On(rl,th,"esm2017"),On("fire-js","")}Hv("");var zv="firebase",Wv="10.14.1";/**
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
*/var lr,Af;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(b,g){function y(){}y.prototype=g.prototype,b.D=g.prototype,b.prototype=new y,b.prototype.constructor=b,b.C=function(w,R,C){for(var v=Array(arguments.length-2),fe=2;fe<arguments.length;fe++)v[fe-2]=arguments[fe];return g.prototype[R].apply(w,v)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(b,g,y){y||(y=0);var w=Array(16);if(typeof g=="string")for(var R=0;16>R;++R)w[R]=g.charCodeAt(y++)|g.charCodeAt(y++)<<8|g.charCodeAt(y++)<<16|g.charCodeAt(y++)<<24;else for(R=0;16>R;++R)w[R]=g[y++]|g[y++]<<8|g[y++]<<16|g[y++]<<24;g=b.g[0],y=b.g[1],R=b.g[2];var C=b.g[3],v=g+(C^y&(R^C))+w[0]+3614090360&4294967295;g=y+(v<<7&4294967295|v>>>25),v=C+(R^g&(y^R))+w[1]+3905402710&4294967295,C=g+(v<<12&4294967295|v>>>20),v=R+(y^C&(g^y))+w[2]+606105819&4294967295,R=C+(v<<17&4294967295|v>>>15),v=y+(g^R&(C^g))+w[3]+3250441966&4294967295,y=R+(v<<22&4294967295|v>>>10),v=g+(C^y&(R^C))+w[4]+4118548399&4294967295,g=y+(v<<7&4294967295|v>>>25),v=C+(R^g&(y^R))+w[5]+1200080426&4294967295,C=g+(v<<12&4294967295|v>>>20),v=R+(y^C&(g^y))+w[6]+2821735955&4294967295,R=C+(v<<17&4294967295|v>>>15),v=y+(g^R&(C^g))+w[7]+4249261313&4294967295,y=R+(v<<22&4294967295|v>>>10),v=g+(C^y&(R^C))+w[8]+1770035416&4294967295,g=y+(v<<7&4294967295|v>>>25),v=C+(R^g&(y^R))+w[9]+2336552879&4294967295,C=g+(v<<12&4294967295|v>>>20),v=R+(y^C&(g^y))+w[10]+4294925233&4294967295,R=C+(v<<17&4294967295|v>>>15),v=y+(g^R&(C^g))+w[11]+2304563134&4294967295,y=R+(v<<22&4294967295|v>>>10),v=g+(C^y&(R^C))+w[12]+1804603682&4294967295,g=y+(v<<7&4294967295|v>>>25),v=C+(R^g&(y^R))+w[13]+4254626195&4294967295,C=g+(v<<12&4294967295|v>>>20),v=R+(y^C&(g^y))+w[14]+2792965006&4294967295,R=C+(v<<17&4294967295|v>>>15),v=y+(g^R&(C^g))+w[15]+1236535329&4294967295,y=R+(v<<22&4294967295|v>>>10),v=g+(R^C&(y^R))+w[1]+4129170786&4294967295,g=y+(v<<5&4294967295|v>>>27),v=C+(y^R&(g^y))+w[6]+3225465664&4294967295,C=g+(v<<9&4294967295|v>>>23),v=R+(g^y&(C^g))+w[11]+643717713&4294967295,R=C+(v<<14&4294967295|v>>>18),v=y+(C^g&(R^C))+w[0]+3921069994&4294967295,y=R+(v<<20&4294967295|v>>>12),v=g+(R^C&(y^R))+w[5]+3593408605&4294967295,g=y+(v<<5&4294967295|v>>>27),v=C+(y^R&(g^y))+w[10]+38016083&4294967295,C=g+(v<<9&4294967295|v>>>23),v=R+(g^y&(C^g))+w[15]+3634488961&4294967295,R=C+(v<<14&4294967295|v>>>18),v=y+(C^g&(R^C))+w[4]+3889429448&4294967295,y=R+(v<<20&4294967295|v>>>12),v=g+(R^C&(y^R))+w[9]+568446438&4294967295,g=y+(v<<5&4294967295|v>>>27),v=C+(y^R&(g^y))+w[14]+3275163606&4294967295,C=g+(v<<9&4294967295|v>>>23),v=R+(g^y&(C^g))+w[3]+4107603335&4294967295,R=C+(v<<14&4294967295|v>>>18),v=y+(C^g&(R^C))+w[8]+1163531501&4294967295,y=R+(v<<20&4294967295|v>>>12),v=g+(R^C&(y^R))+w[13]+2850285829&4294967295,g=y+(v<<5&4294967295|v>>>27),v=C+(y^R&(g^y))+w[2]+4243563512&4294967295,C=g+(v<<9&4294967295|v>>>23),v=R+(g^y&(C^g))+w[7]+1735328473&4294967295,R=C+(v<<14&4294967295|v>>>18),v=y+(C^g&(R^C))+w[12]+2368359562&4294967295,y=R+(v<<20&4294967295|v>>>12),v=g+(y^R^C)+w[5]+4294588738&4294967295,g=y+(v<<4&4294967295|v>>>28),v=C+(g^y^R)+w[8]+2272392833&4294967295,C=g+(v<<11&4294967295|v>>>21),v=R+(C^g^y)+w[11]+1839030562&4294967295,R=C+(v<<16&4294967295|v>>>16),v=y+(R^C^g)+w[14]+4259657740&4294967295,y=R+(v<<23&4294967295|v>>>9),v=g+(y^R^C)+w[1]+2763975236&4294967295,g=y+(v<<4&4294967295|v>>>28),v=C+(g^y^R)+w[4]+1272893353&4294967295,C=g+(v<<11&4294967295|v>>>21),v=R+(C^g^y)+w[7]+4139469664&4294967295,R=C+(v<<16&4294967295|v>>>16),v=y+(R^C^g)+w[10]+3200236656&4294967295,y=R+(v<<23&4294967295|v>>>9),v=g+(y^R^C)+w[13]+681279174&4294967295,g=y+(v<<4&4294967295|v>>>28),v=C+(g^y^R)+w[0]+3936430074&4294967295,C=g+(v<<11&4294967295|v>>>21),v=R+(C^g^y)+w[3]+3572445317&4294967295,R=C+(v<<16&4294967295|v>>>16),v=y+(R^C^g)+w[6]+76029189&4294967295,y=R+(v<<23&4294967295|v>>>9),v=g+(y^R^C)+w[9]+3654602809&4294967295,g=y+(v<<4&4294967295|v>>>28),v=C+(g^y^R)+w[12]+3873151461&4294967295,C=g+(v<<11&4294967295|v>>>21),v=R+(C^g^y)+w[15]+530742520&4294967295,R=C+(v<<16&4294967295|v>>>16),v=y+(R^C^g)+w[2]+3299628645&4294967295,y=R+(v<<23&4294967295|v>>>9),v=g+(R^(y|~C))+w[0]+4096336452&4294967295,g=y+(v<<6&4294967295|v>>>26),v=C+(y^(g|~R))+w[7]+1126891415&4294967295,C=g+(v<<10&4294967295|v>>>22),v=R+(g^(C|~y))+w[14]+2878612391&4294967295,R=C+(v<<15&4294967295|v>>>17),v=y+(C^(R|~g))+w[5]+4237533241&4294967295,y=R+(v<<21&4294967295|v>>>11),v=g+(R^(y|~C))+w[12]+1700485571&4294967295,g=y+(v<<6&4294967295|v>>>26),v=C+(y^(g|~R))+w[3]+2399980690&4294967295,C=g+(v<<10&4294967295|v>>>22),v=R+(g^(C|~y))+w[10]+4293915773&4294967295,R=C+(v<<15&4294967295|v>>>17),v=y+(C^(R|~g))+w[1]+2240044497&4294967295,y=R+(v<<21&4294967295|v>>>11),v=g+(R^(y|~C))+w[8]+1873313359&4294967295,g=y+(v<<6&4294967295|v>>>26),v=C+(y^(g|~R))+w[15]+4264355552&4294967295,C=g+(v<<10&4294967295|v>>>22),v=R+(g^(C|~y))+w[6]+2734768916&4294967295,R=C+(v<<15&4294967295|v>>>17),v=y+(C^(R|~g))+w[13]+1309151649&4294967295,y=R+(v<<21&4294967295|v>>>11),v=g+(R^(y|~C))+w[4]+4149444226&4294967295,g=y+(v<<6&4294967295|v>>>26),v=C+(y^(g|~R))+w[11]+3174756917&4294967295,C=g+(v<<10&4294967295|v>>>22),v=R+(g^(C|~y))+w[2]+718787259&4294967295,R=C+(v<<15&4294967295|v>>>17),v=y+(C^(R|~g))+w[9]+3951481745&4294967295,b.g[0]=b.g[0]+g&4294967295,b.g[1]=b.g[1]+(R+(v<<21&4294967295|v>>>11))&4294967295,b.g[2]=b.g[2]+R&4294967295,b.g[3]=b.g[3]+C&4294967295}r.prototype.u=function(b,g){g===void 0&&(g=b.length);for(var y=g-this.blockSize,w=this.B,R=this.h,C=0;C<g;){if(R==0)for(;C<=y;)s(this,b,C),C+=this.blockSize;if(typeof b=="string"){for(;C<g;)if(w[R++]=b.charCodeAt(C++),R==this.blockSize){s(this,w),R=0;break}}else for(;C<g;)if(w[R++]=b[C++],R==this.blockSize){s(this,w),R=0;break}}this.h=R,this.o+=g},r.prototype.v=function(){var b=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);b[0]=128;for(var g=1;g<b.length-8;++g)b[g]=0;var y=8*this.o;for(g=b.length-8;g<b.length;++g)b[g]=y&255,y/=256;for(this.u(b),b=Array(16),g=y=0;4>g;++g)for(var w=0;32>w;w+=8)b[y++]=this.g[g]>>>w&255;return b};function i(b,g){var y=l;return Object.prototype.hasOwnProperty.call(y,b)?y[b]:y[b]=g(b)}function a(b,g){this.h=g;for(var y=[],w=!0,R=b.length-1;0<=R;R--){var C=b[R]|0;w&&C==g||(y[R]=C,w=!1)}this.g=y}var l={};function c(b){return-128<=b&&128>b?i(b,function(g){return new a([g|0],0>g?-1:0)}):new a([b|0],0>b?-1:0)}function d(b){if(isNaN(b)||!isFinite(b))return m;if(0>b)return j(d(-b));for(var g=[],y=1,w=0;b>=y;w++)g[w]=b/y|0,y*=4294967296;return new a(g,0)}function f(b,g){if(b.length==0)throw Error("number format error: empty string");if(g=g||10,2>g||36<g)throw Error("radix out of range: "+g);if(b.charAt(0)=="-")return j(f(b.substring(1),g));if(0<=b.indexOf("-"))throw Error('number format error: interior "-" character');for(var y=d(Math.pow(g,8)),w=m,R=0;R<b.length;R+=8){var C=Math.min(8,b.length-R),v=parseInt(b.substring(R,R+C),g);8>C?(C=d(Math.pow(g,C)),w=w.j(C).add(d(v))):(w=w.j(y),w=w.add(d(v)))}return w}var m=c(0),E=c(1),P=c(16777216);n=a.prototype,n.m=function(){if(B(this))return-j(this).m();for(var b=0,g=1,y=0;y<this.g.length;y++){var w=this.i(y);b+=(0<=w?w:4294967296+w)*g,g*=4294967296}return b},n.toString=function(b){if(b=b||10,2>b||36<b)throw Error("radix out of range: "+b);if(N(this))return"0";if(B(this))return"-"+j(this).toString(b);for(var g=d(Math.pow(b,6)),y=this,w="";;){var R=W(y,g).g;y=Q(y,R.j(g));var C=((0<y.g.length?y.g[0]:y.h)>>>0).toString(b);if(y=R,N(y))return C+w;for(;6>C.length;)C="0"+C;w=C+w}},n.i=function(b){return 0>b?0:b<this.g.length?this.g[b]:this.h};function N(b){if(b.h!=0)return!1;for(var g=0;g<b.g.length;g++)if(b.g[g]!=0)return!1;return!0}function B(b){return b.h==-1}n.l=function(b){return b=Q(this,b),B(b)?-1:N(b)?0:1};function j(b){for(var g=b.g.length,y=[],w=0;w<g;w++)y[w]=~b.g[w];return new a(y,~b.h).add(E)}n.abs=function(){return B(this)?j(this):this},n.add=function(b){for(var g=Math.max(this.g.length,b.g.length),y=[],w=0,R=0;R<=g;R++){var C=w+(this.i(R)&65535)+(b.i(R)&65535),v=(C>>>16)+(this.i(R)>>>16)+(b.i(R)>>>16);w=v>>>16,C&=65535,v&=65535,y[R]=v<<16|C}return new a(y,y[y.length-1]&-2147483648?-1:0)};function Q(b,g){return b.add(j(g))}n.j=function(b){if(N(this)||N(b))return m;if(B(this))return B(b)?j(this).j(j(b)):j(j(this).j(b));if(B(b))return j(this.j(j(b)));if(0>this.l(P)&&0>b.l(P))return d(this.m()*b.m());for(var g=this.g.length+b.g.length,y=[],w=0;w<2*g;w++)y[w]=0;for(w=0;w<this.g.length;w++)for(var R=0;R<b.g.length;R++){var C=this.i(w)>>>16,v=this.i(w)&65535,fe=b.i(R)>>>16,Pe=b.i(R)&65535;y[2*w+2*R]+=v*Pe,J(y,2*w+2*R),y[2*w+2*R+1]+=C*Pe,J(y,2*w+2*R+1),y[2*w+2*R+1]+=v*fe,J(y,2*w+2*R+1),y[2*w+2*R+2]+=C*fe,J(y,2*w+2*R+2)}for(w=0;w<g;w++)y[w]=y[2*w+1]<<16|y[2*w];for(w=g;w<2*g;w++)y[w]=0;return new a(y,0)};function J(b,g){for(;(b[g]&65535)!=b[g];)b[g+1]+=b[g]>>>16,b[g]&=65535,g++}function X(b,g){this.g=b,this.h=g}function W(b,g){if(N(g))throw Error("division by zero");if(N(b))return new X(m,m);if(B(b))return g=W(j(b),g),new X(j(g.g),j(g.h));if(B(g))return g=W(b,j(g)),new X(j(g.g),g.h);if(30<b.g.length){if(B(b)||B(g))throw Error("slowDivide_ only works with positive integers.");for(var y=E,w=g;0>=w.l(b);)y=de(y),w=de(w);var R=_e(y,1),C=_e(w,1);for(w=_e(w,2),y=_e(y,2);!N(w);){var v=C.add(w);0>=v.l(b)&&(R=R.add(y),C=v),w=_e(w,1),y=_e(y,1)}return g=Q(b,R.j(g)),new X(R,g)}for(R=m;0<=b.l(g);){for(y=Math.max(1,Math.floor(b.m()/g.m())),w=Math.ceil(Math.log(y)/Math.LN2),w=48>=w?1:Math.pow(2,w-48),C=d(y),v=C.j(g);B(v)||0<v.l(b);)y-=w,C=d(y),v=C.j(g);N(C)&&(C=E),R=R.add(C),b=Q(b,v)}return new X(R,b)}n.A=function(b){return W(this,b).h},n.and=function(b){for(var g=Math.max(this.g.length,b.g.length),y=[],w=0;w<g;w++)y[w]=this.i(w)&b.i(w);return new a(y,this.h&b.h)},n.or=function(b){for(var g=Math.max(this.g.length,b.g.length),y=[],w=0;w<g;w++)y[w]=this.i(w)|b.i(w);return new a(y,this.h|b.h)},n.xor=function(b){for(var g=Math.max(this.g.length,b.g.length),y=[],w=0;w<g;w++)y[w]=this.i(w)^b.i(w);return new a(y,this.h^b.h)};function de(b){for(var g=b.g.length+1,y=[],w=0;w<g;w++)y[w]=b.i(w)<<1|b.i(w-1)>>>31;return new a(y,b.h)}function _e(b,g){var y=g>>5;g%=32;for(var w=b.g.length-y,R=[],C=0;C<w;C++)R[C]=0<g?b.i(C+y)>>>g|b.i(C+y+1)<<32-g:b.i(C+y);return new a(R,b.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,Af=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=f,lr=a}).apply(typeof oh<"u"?oh:typeof self<"u"?self:typeof window<"u"?window:{});var Oi=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var bf,Rs,Rf,zi,ol,Sf,Pf,Cf;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,u,h){return o==Array.prototype||o==Object.prototype||(o[u]=h.value),o};function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Oi=="object"&&Oi];for(var u=0;u<o.length;++u){var h=o[u];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var r=t(this);function s(o,u){if(u)e:{var h=r;o=o.split(".");for(var p=0;p<o.length-1;p++){var S=o[p];if(!(S in h))break e;h=h[S]}o=o[o.length-1],p=h[o],u=u(p),u!=p&&u!=null&&e(h,o,{configurable:!0,writable:!0,value:u})}}function i(o,u){o instanceof String&&(o+="");var h=0,p=!1,S={next:function(){if(!p&&h<o.length){var D=h++;return{value:u(D,o[D]),done:!1}}return p=!0,{done:!0,value:void 0}}};return S[Symbol.iterator]=function(){return S},S}s("Array.prototype.values",function(o){return o||function(){return i(this,function(u,h){return h})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},l=this||self;function c(o){var u=typeof o;return u=u!="object"?u:o?Array.isArray(o)?"array":u:"null",u=="array"||u=="object"&&typeof o.length=="number"}function d(o){var u=typeof o;return u=="object"&&o!=null||u=="function"}function f(o,u,h){return o.call.apply(o.bind,arguments)}function m(o,u,h){if(!o)throw Error();if(2<arguments.length){var p=Array.prototype.slice.call(arguments,2);return function(){var S=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(S,p),o.apply(u,S)}}return function(){return o.apply(u,arguments)}}function E(o,u,h){return E=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:m,E.apply(null,arguments)}function P(o,u){var h=Array.prototype.slice.call(arguments,1);return function(){var p=h.slice();return p.push.apply(p,arguments),o.apply(this,p)}}function N(o,u){function h(){}h.prototype=u.prototype,o.aa=u.prototype,o.prototype=new h,o.prototype.constructor=o,o.Qb=function(p,S,D){for(var q=Array(arguments.length-2),Re=2;Re<arguments.length;Re++)q[Re-2]=arguments[Re];return u.prototype[S].apply(p,q)}}function B(o){const u=o.length;if(0<u){const h=Array(u);for(let p=0;p<u;p++)h[p]=o[p];return h}return[]}function j(o,u){for(let h=1;h<arguments.length;h++){const p=arguments[h];if(c(p)){const S=o.length||0,D=p.length||0;o.length=S+D;for(let q=0;q<D;q++)o[S+q]=p[q]}else o.push(p)}}class Q{constructor(u,h){this.i=u,this.j=h,this.h=0,this.g=null}get(){let u;return 0<this.h?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function J(o){return/^[\s\xa0]*$/.test(o)}function X(){var o=l.navigator;return o&&(o=o.userAgent)?o:""}function W(o){return W[" "](o),o}W[" "]=function(){};var de=X().indexOf("Gecko")!=-1&&!(X().toLowerCase().indexOf("webkit")!=-1&&X().indexOf("Edge")==-1)&&!(X().indexOf("Trident")!=-1||X().indexOf("MSIE")!=-1)&&X().indexOf("Edge")==-1;function _e(o,u,h){for(const p in o)u.call(h,o[p],p,o)}function b(o,u){for(const h in o)u.call(void 0,o[h],h,o)}function g(o){const u={};for(const h in o)u[h]=o[h];return u}const y="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function w(o,u){let h,p;for(let S=1;S<arguments.length;S++){p=arguments[S];for(h in p)o[h]=p[h];for(let D=0;D<y.length;D++)h=y[D],Object.prototype.hasOwnProperty.call(p,h)&&(o[h]=p[h])}}function R(o){var u=1;o=o.split(":");const h=[];for(;0<u&&o.length;)h.push(o.shift()),u--;return o.length&&h.push(o.join(":")),h}function C(o){l.setTimeout(()=>{throw o},0)}function v(){var o=vt;let u=null;return o.g&&(u=o.g,o.g=o.g.next,o.g||(o.h=null),u.next=null),u}class fe{constructor(){this.h=this.g=null}add(u,h){const p=Pe.get();p.set(u,h),this.h?this.h.next=p:this.g=p,this.h=p}}var Pe=new Q(()=>new ye,o=>o.reset());class ye{constructor(){this.next=this.g=this.h=null}set(u,h){this.h=u,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let ce,pe=!1,vt=new fe,Jt=()=>{const o=l.Promise.resolve(void 0);ce=()=>{o.then(ht)}};var ht=()=>{for(var o;o=v();){try{o.h.call(o.g)}catch(h){C(h)}var u=Pe;u.j(o),100>u.h&&(u.h++,o.next=u.g,u.g=o)}pe=!1};function Oe(){this.s=this.s,this.C=this.C}Oe.prototype.s=!1,Oe.prototype.ma=function(){this.s||(this.s=!0,this.N())},Oe.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Le(o,u){this.type=o,this.g=this.target=u,this.defaultPrevented=!1}Le.prototype.h=function(){this.defaultPrevented=!0};var is=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var o=!1,u=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const h=()=>{};l.addEventListener("test",h,u),l.removeEventListener("test",h,u)}catch{}return o}();function dt(o,u){if(Le.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var h=this.type=o.type,p=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=u,u=o.relatedTarget){if(de){e:{try{W(u.nodeName);var S=!0;break e}catch{}S=!1}S||(u=null)}}else h=="mouseover"?u=o.fromElement:h=="mouseout"&&(u=o.toElement);this.relatedTarget=u,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:wt[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&dt.aa.h.call(this)}}N(dt,Le);var wt={2:"touch",3:"pen",4:"mouse"};dt.prototype.h=function(){dt.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var Vt="closure_listenable_"+(1e6*Math.random()|0),vn=0;function Jn(o,u,h,p,S){this.listener=o,this.proxy=null,this.src=u,this.type=h,this.capture=!!p,this.ha=S,this.key=++vn,this.da=this.fa=!1}function ft(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function It(o){this.src=o,this.g={},this.h=0}It.prototype.add=function(o,u,h,p,S){var D=o.toString();o=this.g[D],o||(o=this.g[D]=[],this.h++);var q=_(o,u,p,S);return-1<q?(u=o[q],h||(u.fa=!1)):(u=new Jn(u,this.src,D,!!p,S),u.fa=h,o.push(u)),u};function At(o,u){var h=u.type;if(h in o.g){var p=o.g[h],S=Array.prototype.indexOf.call(p,u,void 0),D;(D=0<=S)&&Array.prototype.splice.call(p,S,1),D&&(ft(u),o.g[h].length==0&&(delete o.g[h],o.h--))}}function _(o,u,h,p){for(var S=0;S<o.length;++S){var D=o[S];if(!D.da&&D.listener==u&&D.capture==!!h&&D.ha==p)return S}return-1}var I="closure_lm_"+(1e6*Math.random()|0),x={};function U(o,u,h,p,S){if(p&&p.once)return k(o,u,h,p,S);if(Array.isArray(u)){for(var D=0;D<u.length;D++)U(o,u[D],h,p,S);return null}return h=Z(h),o&&o[Vt]?o.K(u,h,d(p)?!!p.capture:!!p,S):A(o,u,h,!1,p,S)}function A(o,u,h,p,S,D){if(!u)throw Error("Invalid event type");var q=d(S)?!!S.capture:!!S,Re=$(o);if(Re||(o[I]=Re=new It(o)),h=Re.add(u,h,p,q,D),h.proxy)return h;if(p=T(),h.proxy=p,p.src=o,p.listener=h,o.addEventListener)is||(S=q),S===void 0&&(S=!1),o.addEventListener(u.toString(),p,S);else if(o.attachEvent)o.attachEvent(O(u.toString()),p);else if(o.addListener&&o.removeListener)o.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return h}function T(){function o(h){return u.call(o.src,o.listener,h)}const u=H;return o}function k(o,u,h,p,S){if(Array.isArray(u)){for(var D=0;D<u.length;D++)k(o,u[D],h,p,S);return null}return h=Z(h),o&&o[Vt]?o.L(u,h,d(p)?!!p.capture:!!p,S):A(o,u,h,!0,p,S)}function V(o,u,h,p,S){if(Array.isArray(u))for(var D=0;D<u.length;D++)V(o,u[D],h,p,S);else p=d(p)?!!p.capture:!!p,h=Z(h),o&&o[Vt]?(o=o.i,u=String(u).toString(),u in o.g&&(D=o.g[u],h=_(D,h,p,S),-1<h&&(ft(D[h]),Array.prototype.splice.call(D,h,1),D.length==0&&(delete o.g[u],o.h--)))):o&&(o=$(o))&&(u=o.g[u.toString()],o=-1,u&&(o=_(u,h,p,S)),(h=-1<o?u[o]:null)&&M(h))}function M(o){if(typeof o!="number"&&o&&!o.da){var u=o.src;if(u&&u[Vt])At(u.i,o);else{var h=o.type,p=o.proxy;u.removeEventListener?u.removeEventListener(h,p,o.capture):u.detachEvent?u.detachEvent(O(h),p):u.addListener&&u.removeListener&&u.removeListener(p),(h=$(u))?(At(h,o),h.h==0&&(h.src=null,u[I]=null)):ft(o)}}}function O(o){return o in x?x[o]:x[o]="on"+o}function H(o,u){if(o.da)o=!0;else{u=new dt(u,this);var h=o.listener,p=o.ha||o.src;o.fa&&M(o),o=h.call(p,u)}return o}function $(o){return o=o[I],o instanceof It?o:null}var K="__closure_events_fn_"+(1e9*Math.random()>>>0);function Z(o){return typeof o=="function"?o:(o[K]||(o[K]=function(u){return o.handleEvent(u)}),o[K])}function ee(){Oe.call(this),this.i=new It(this),this.M=this,this.F=null}N(ee,Oe),ee.prototype[Vt]=!0,ee.prototype.removeEventListener=function(o,u,h,p){V(this,o,u,h,p)};function ae(o,u){var h,p=o.F;if(p)for(h=[];p;p=p.F)h.push(p);if(o=o.M,p=u.type||u,typeof u=="string")u=new Le(u,o);else if(u instanceof Le)u.target=u.target||o;else{var S=u;u=new Le(p,o),w(u,S)}if(S=!0,h)for(var D=h.length-1;0<=D;D--){var q=u.g=h[D];S=me(q,p,!0,u)&&S}if(q=u.g=o,S=me(q,p,!0,u)&&S,S=me(q,p,!1,u)&&S,h)for(D=0;D<h.length;D++)q=u.g=h[D],S=me(q,p,!1,u)&&S}ee.prototype.N=function(){if(ee.aa.N.call(this),this.i){var o=this.i,u;for(u in o.g){for(var h=o.g[u],p=0;p<h.length;p++)ft(h[p]);delete o.g[u],o.h--}}this.F=null},ee.prototype.K=function(o,u,h,p){return this.i.add(String(o),u,!1,h,p)},ee.prototype.L=function(o,u,h,p){return this.i.add(String(o),u,!0,h,p)};function me(o,u,h,p){if(u=o.i.g[String(u)],!u)return!0;u=u.concat();for(var S=!0,D=0;D<u.length;++D){var q=u[D];if(q&&!q.da&&q.capture==h){var Re=q.listener,Ge=q.ha||q.src;q.fa&&At(o.i,q),S=Re.call(Ge,p)!==!1&&S}}return S&&!p.defaultPrevented}function We(o,u,h){if(typeof o=="function")h&&(o=E(o,h));else if(o&&typeof o.handleEvent=="function")o=E(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(u)?-1:l.setTimeout(o,u||0)}function je(o){o.g=We(()=>{o.g=null,o.i&&(o.i=!1,je(o))},o.l);const u=o.h;o.h=null,o.m.apply(null,u)}class bt extends Oe{constructor(u,h){super(),this.m=u,this.l=h,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:je(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function $e(o){Oe.call(this),this.h=o,this.g={}}N($e,Oe);var En=[];function os(o){_e(o.g,function(u,h){this.g.hasOwnProperty(h)&&M(u)},o),o.g={}}$e.prototype.N=function(){$e.aa.N.call(this),os(this)},$e.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Ke=l.JSON.stringify,xt=l.JSON.parse,gi=class{stringify(o){return l.JSON.stringify(o,void 0)}parse(o){return l.JSON.parse(o,void 0)}};function ta(){}ta.prototype.h=null;function Dc(o){return o.h||(o.h=o.i())}function Vc(){}var as={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function na(){Le.call(this,"d")}N(na,Le);function ra(){Le.call(this,"c")}N(ra,Le);var Yn={},xc=null;function _i(){return xc=xc||new ee}Yn.La="serverreachability";function Nc(o){Le.call(this,Yn.La,o)}N(Nc,Le);function ls(o){const u=_i();ae(u,new Nc(u))}Yn.STAT_EVENT="statevent";function Oc(o,u){Le.call(this,Yn.STAT_EVENT,o),this.stat=u}N(Oc,Le);function pt(o){const u=_i();ae(u,new Oc(u,o))}Yn.Ma="timingevent";function Mc(o,u){Le.call(this,Yn.Ma,o),this.size=u}N(Mc,Le);function cs(o,u){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){o()},u)}function us(){this.g=!0}us.prototype.xa=function(){this.g=!1};function wm(o,u,h,p,S,D){o.info(function(){if(o.g)if(D)for(var q="",Re=D.split("&"),Ge=0;Ge<Re.length;Ge++){var ve=Re[Ge].split("=");if(1<ve.length){var nt=ve[0];ve=ve[1];var rt=nt.split("_");q=2<=rt.length&&rt[1]=="type"?q+(nt+"="+ve+"&"):q+(nt+"=redacted&")}}else q=null;else q=D;return"XMLHTTP REQ ("+p+") [attempt "+S+"]: "+u+`
`+h+`
`+q})}function Im(o,u,h,p,S,D,q){o.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+S+"]: "+u+`
`+h+`
`+D+" "+q})}function vr(o,u,h,p){o.info(function(){return"XMLHTTP TEXT ("+u+"): "+bm(o,h)+(p?" "+p:"")})}function Am(o,u){o.info(function(){return"TIMEOUT: "+u})}us.prototype.info=function(){};function bm(o,u){if(!o.g)return u;if(!u)return null;try{var h=JSON.parse(u);if(h){for(o=0;o<h.length;o++)if(Array.isArray(h[o])){var p=h[o];if(!(2>p.length)){var S=p[1];if(Array.isArray(S)&&!(1>S.length)){var D=S[0];if(D!="noop"&&D!="stop"&&D!="close")for(var q=1;q<S.length;q++)S[q]=""}}}}return Ke(h)}catch{return u}}var yi={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Lc={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},sa;function vi(){}N(vi,ta),vi.prototype.g=function(){return new XMLHttpRequest},vi.prototype.i=function(){return{}},sa=new vi;function Tn(o,u,h,p){this.j=o,this.i=u,this.l=h,this.R=p||1,this.U=new $e(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Fc}function Fc(){this.i=null,this.g="",this.h=!1}var Uc={},ia={};function oa(o,u,h){o.L=1,o.v=Ii(Yt(u)),o.m=h,o.P=!0,Bc(o,null)}function Bc(o,u){o.F=Date.now(),Ei(o),o.A=Yt(o.v);var h=o.A,p=o.R;Array.isArray(p)||(p=[String(p)]),eu(h.i,"t",p),o.C=0,h=o.j.J,o.h=new Fc,o.g=yu(o.j,h?u:null,!o.m),0<o.O&&(o.M=new bt(E(o.Y,o,o.g),o.O)),u=o.U,h=o.g,p=o.ca;var S="readystatechange";Array.isArray(S)||(S&&(En[0]=S.toString()),S=En);for(var D=0;D<S.length;D++){var q=U(h,S[D],p||u.handleEvent,!1,u.h||u);if(!q)break;u.g[q.key]=q}u=o.H?g(o.H):{},o.m?(o.u||(o.u="POST"),u["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,u)):(o.u="GET",o.g.ea(o.A,o.u,null,u)),ls(),wm(o.i,o.u,o.A,o.l,o.R,o.m)}Tn.prototype.ca=function(o){o=o.target;const u=this.M;u&&Xt(o)==3?u.j():this.Y(o)},Tn.prototype.Y=function(o){try{if(o==this.g)e:{const rt=Xt(this.g);var u=this.g.Ba();const wr=this.g.Z();if(!(3>rt)&&(rt!=3||this.g&&(this.h.h||this.g.oa()||au(this.g)))){this.J||rt!=4||u==7||(u==8||0>=wr?ls(3):ls(2)),aa(this);var h=this.g.Z();this.X=h;t:if(jc(this)){var p=au(this.g);o="";var S=p.length,D=Xt(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Xn(this),hs(this);var q="";break t}this.h.i=new l.TextDecoder}for(u=0;u<S;u++)this.h.h=!0,o+=this.h.i.decode(p[u],{stream:!(D&&u==S-1)});p.length=0,this.h.g+=o,this.C=0,q=this.h.g}else q=this.g.oa();if(this.o=h==200,Im(this.i,this.u,this.A,this.l,this.R,rt,h),this.o){if(this.T&&!this.K){t:{if(this.g){var Re,Ge=this.g;if((Re=Ge.g?Ge.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!J(Re)){var ve=Re;break t}}ve=null}if(h=ve)vr(this.i,this.l,h,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,la(this,h);else{this.o=!1,this.s=3,pt(12),Xn(this),hs(this);break e}}if(this.P){h=!0;let Lt;for(;!this.J&&this.C<q.length;)if(Lt=Rm(this,q),Lt==ia){rt==4&&(this.s=4,pt(14),h=!1),vr(this.i,this.l,null,"[Incomplete Response]");break}else if(Lt==Uc){this.s=4,pt(15),vr(this.i,this.l,q,"[Invalid Chunk]"),h=!1;break}else vr(this.i,this.l,Lt,null),la(this,Lt);if(jc(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),rt!=4||q.length!=0||this.h.h||(this.s=1,pt(16),h=!1),this.o=this.o&&h,!h)vr(this.i,this.l,q,"[Invalid Chunked Response]"),Xn(this),hs(this);else if(0<q.length&&!this.W){this.W=!0;var nt=this.j;nt.g==this&&nt.ba&&!nt.M&&(nt.j.info("Great, no buffering proxy detected. Bytes received: "+q.length),pa(nt),nt.M=!0,pt(11))}}else vr(this.i,this.l,q,null),la(this,q);rt==4&&Xn(this),this.o&&!this.J&&(rt==4?pu(this.j,this):(this.o=!1,Ei(this)))}else qm(this.g),h==400&&0<q.indexOf("Unknown SID")?(this.s=3,pt(12)):(this.s=0,pt(13)),Xn(this),hs(this)}}}catch{}finally{}};function jc(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function Rm(o,u){var h=o.C,p=u.indexOf(`
`,h);return p==-1?ia:(h=Number(u.substring(h,p)),isNaN(h)?Uc:(p+=1,p+h>u.length?ia:(u=u.slice(p,p+h),o.C=p+h,u)))}Tn.prototype.cancel=function(){this.J=!0,Xn(this)};function Ei(o){o.S=Date.now()+o.I,$c(o,o.I)}function $c(o,u){if(o.B!=null)throw Error("WatchDog timer not null");o.B=cs(E(o.ba,o),u)}function aa(o){o.B&&(l.clearTimeout(o.B),o.B=null)}Tn.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(Am(this.i,this.A),this.L!=2&&(ls(),pt(17)),Xn(this),this.s=2,hs(this)):$c(this,this.S-o)};function hs(o){o.j.G==0||o.J||pu(o.j,o)}function Xn(o){aa(o);var u=o.M;u&&typeof u.ma=="function"&&u.ma(),o.M=null,os(o.U),o.g&&(u=o.g,o.g=null,u.abort(),u.ma())}function la(o,u){try{var h=o.j;if(h.G!=0&&(h.g==o||ca(h.h,o))){if(!o.K&&ca(h.h,o)&&h.G==3){try{var p=h.Da.g.parse(u)}catch{p=null}if(Array.isArray(p)&&p.length==3){var S=p;if(S[0]==0){e:if(!h.u){if(h.g)if(h.g.F+3e3<o.F)Ci(h),Si(h);else break e;fa(h),pt(18)}}else h.za=S[1],0<h.za-h.T&&37500>S[2]&&h.F&&h.v==0&&!h.C&&(h.C=cs(E(h.Za,h),6e3));if(1>=zc(h.h)&&h.ca){try{h.ca()}catch{}h.ca=void 0}}else er(h,11)}else if((o.K||h.g==o)&&Ci(h),!J(u))for(S=h.Da.g.parse(u),u=0;u<S.length;u++){let ve=S[u];if(h.T=ve[0],ve=ve[1],h.G==2)if(ve[0]=="c"){h.K=ve[1],h.ia=ve[2];const nt=ve[3];nt!=null&&(h.la=nt,h.j.info("VER="+h.la));const rt=ve[4];rt!=null&&(h.Aa=rt,h.j.info("SVER="+h.Aa));const wr=ve[5];wr!=null&&typeof wr=="number"&&0<wr&&(p=1.5*wr,h.L=p,h.j.info("backChannelRequestTimeoutMs_="+p)),p=h;const Lt=o.g;if(Lt){const Di=Lt.g?Lt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Di){var D=p.h;D.g||Di.indexOf("spdy")==-1&&Di.indexOf("quic")==-1&&Di.indexOf("h2")==-1||(D.j=D.l,D.g=new Set,D.h&&(ua(D,D.h),D.h=null))}if(p.D){const ma=Lt.g?Lt.g.getResponseHeader("X-HTTP-Session-Id"):null;ma&&(p.ya=ma,ke(p.I,p.D,ma))}}h.G=3,h.l&&h.l.ua(),h.ba&&(h.R=Date.now()-o.F,h.j.info("Handshake RTT: "+h.R+"ms")),p=h;var q=o;if(p.qa=_u(p,p.J?p.ia:null,p.W),q.K){Wc(p.h,q);var Re=q,Ge=p.L;Ge&&(Re.I=Ge),Re.B&&(aa(Re),Ei(Re)),p.g=q}else du(p);0<h.i.length&&Pi(h)}else ve[0]!="stop"&&ve[0]!="close"||er(h,7);else h.G==3&&(ve[0]=="stop"||ve[0]=="close"?ve[0]=="stop"?er(h,7):da(h):ve[0]!="noop"&&h.l&&h.l.ta(ve),h.v=0)}}ls(4)}catch{}}var Sm=class{constructor(o,u){this.g=o,this.map=u}};function qc(o){this.l=o||10,l.PerformanceNavigationTiming?(o=l.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Hc(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function zc(o){return o.h?1:o.g?o.g.size:0}function ca(o,u){return o.h?o.h==u:o.g?o.g.has(u):!1}function ua(o,u){o.g?o.g.add(u):o.h=u}function Wc(o,u){o.h&&o.h==u?o.h=null:o.g&&o.g.has(u)&&o.g.delete(u)}qc.prototype.cancel=function(){if(this.i=Kc(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Kc(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let u=o.i;for(const h of o.g.values())u=u.concat(h.D);return u}return B(o.i)}function Pm(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(c(o)){for(var u=[],h=o.length,p=0;p<h;p++)u.push(o[p]);return u}u=[],h=0;for(p in o)u[h++]=o[p];return u}function Cm(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(c(o)||typeof o=="string"){var u=[];o=o.length;for(var h=0;h<o;h++)u.push(h);return u}u=[],h=0;for(const p in o)u[h++]=p;return u}}}function Gc(o,u){if(o.forEach&&typeof o.forEach=="function")o.forEach(u,void 0);else if(c(o)||typeof o=="string")Array.prototype.forEach.call(o,u,void 0);else for(var h=Cm(o),p=Pm(o),S=p.length,D=0;D<S;D++)u.call(void 0,p[D],h&&h[D],o)}var Qc=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function km(o,u){if(o){o=o.split("&");for(var h=0;h<o.length;h++){var p=o[h].indexOf("="),S=null;if(0<=p){var D=o[h].substring(0,p);S=o[h].substring(p+1)}else D=o[h];u(D,S?decodeURIComponent(S.replace(/\+/g," ")):"")}}}function Zn(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof Zn){this.h=o.h,Ti(this,o.j),this.o=o.o,this.g=o.g,wi(this,o.s),this.l=o.l;var u=o.i,h=new ps;h.i=u.i,u.g&&(h.g=new Map(u.g),h.h=u.h),Jc(this,h),this.m=o.m}else o&&(u=String(o).match(Qc))?(this.h=!1,Ti(this,u[1]||"",!0),this.o=ds(u[2]||""),this.g=ds(u[3]||"",!0),wi(this,u[4]),this.l=ds(u[5]||"",!0),Jc(this,u[6]||"",!0),this.m=ds(u[7]||"")):(this.h=!1,this.i=new ps(null,this.h))}Zn.prototype.toString=function(){var o=[],u=this.j;u&&o.push(fs(u,Yc,!0),":");var h=this.g;return(h||u=="file")&&(o.push("//"),(u=this.o)&&o.push(fs(u,Yc,!0),"@"),o.push(encodeURIComponent(String(h)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.s,h!=null&&o.push(":",String(h))),(h=this.l)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(fs(h,h.charAt(0)=="/"?xm:Vm,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",fs(h,Om)),o.join("")};function Yt(o){return new Zn(o)}function Ti(o,u,h){o.j=h?ds(u,!0):u,o.j&&(o.j=o.j.replace(/:$/,""))}function wi(o,u){if(u){if(u=Number(u),isNaN(u)||0>u)throw Error("Bad port number "+u);o.s=u}else o.s=null}function Jc(o,u,h){u instanceof ps?(o.i=u,Mm(o.i,o.h)):(h||(u=fs(u,Nm)),o.i=new ps(u,o.h))}function ke(o,u,h){o.i.set(u,h)}function Ii(o){return ke(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function ds(o,u){return o?u?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function fs(o,u,h){return typeof o=="string"?(o=encodeURI(o).replace(u,Dm),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function Dm(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Yc=/[#\/\?@]/g,Vm=/[#\?:]/g,xm=/[#\?]/g,Nm=/[#\?@]/g,Om=/#/g;function ps(o,u){this.h=this.g=null,this.i=o||null,this.j=!!u}function wn(o){o.g||(o.g=new Map,o.h=0,o.i&&km(o.i,function(u,h){o.add(decodeURIComponent(u.replace(/\+/g," ")),h)}))}n=ps.prototype,n.add=function(o,u){wn(this),this.i=null,o=Er(this,o);var h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(u),this.h+=1,this};function Xc(o,u){wn(o),u=Er(o,u),o.g.has(u)&&(o.i=null,o.h-=o.g.get(u).length,o.g.delete(u))}function Zc(o,u){return wn(o),u=Er(o,u),o.g.has(u)}n.forEach=function(o,u){wn(this),this.g.forEach(function(h,p){h.forEach(function(S){o.call(u,S,p,this)},this)},this)},n.na=function(){wn(this);const o=Array.from(this.g.values()),u=Array.from(this.g.keys()),h=[];for(let p=0;p<u.length;p++){const S=o[p];for(let D=0;D<S.length;D++)h.push(u[p])}return h},n.V=function(o){wn(this);let u=[];if(typeof o=="string")Zc(this,o)&&(u=u.concat(this.g.get(Er(this,o))));else{o=Array.from(this.g.values());for(let h=0;h<o.length;h++)u=u.concat(o[h])}return u},n.set=function(o,u){return wn(this),this.i=null,o=Er(this,o),Zc(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[u]),this.h+=1,this},n.get=function(o,u){return o?(o=this.V(o),0<o.length?String(o[0]):u):u};function eu(o,u,h){Xc(o,u),0<h.length&&(o.i=null,o.g.set(Er(o,u),B(h)),o.h+=h.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],u=Array.from(this.g.keys());for(var h=0;h<u.length;h++){var p=u[h];const D=encodeURIComponent(String(p)),q=this.V(p);for(p=0;p<q.length;p++){var S=D;q[p]!==""&&(S+="="+encodeURIComponent(String(q[p]))),o.push(S)}}return this.i=o.join("&")};function Er(o,u){return u=String(u),o.j&&(u=u.toLowerCase()),u}function Mm(o,u){u&&!o.j&&(wn(o),o.i=null,o.g.forEach(function(h,p){var S=p.toLowerCase();p!=S&&(Xc(this,p),eu(this,S,h))},o)),o.j=u}function Lm(o,u){const h=new us;if(l.Image){const p=new Image;p.onload=P(In,h,"TestLoadImage: loaded",!0,u,p),p.onerror=P(In,h,"TestLoadImage: error",!1,u,p),p.onabort=P(In,h,"TestLoadImage: abort",!1,u,p),p.ontimeout=P(In,h,"TestLoadImage: timeout",!1,u,p),l.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=o}else u(!1)}function Fm(o,u){const h=new us,p=new AbortController,S=setTimeout(()=>{p.abort(),In(h,"TestPingServer: timeout",!1,u)},1e4);fetch(o,{signal:p.signal}).then(D=>{clearTimeout(S),D.ok?In(h,"TestPingServer: ok",!0,u):In(h,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(S),In(h,"TestPingServer: error",!1,u)})}function In(o,u,h,p,S){try{S&&(S.onload=null,S.onerror=null,S.onabort=null,S.ontimeout=null),p(h)}catch{}}function Um(){this.g=new gi}function Bm(o,u,h){const p=h||"";try{Gc(o,function(S,D){let q=S;d(S)&&(q=Ke(S)),u.push(p+D+"="+encodeURIComponent(q))})}catch(S){throw u.push(p+"type="+encodeURIComponent("_badmap")),S}}function Ai(o){this.l=o.Ub||null,this.j=o.eb||!1}N(Ai,ta),Ai.prototype.g=function(){return new bi(this.l,this.j)},Ai.prototype.i=function(o){return function(){return o}}({});function bi(o,u){ee.call(this),this.D=o,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}N(bi,ee),n=bi.prototype,n.open=function(o,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=u,this.readyState=1,gs(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const u={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(u.body=o),(this.D||l).fetch(new Request(this.A,u)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,ms(this)),this.readyState=0},n.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,gs(this)),this.g&&(this.readyState=3,gs(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;tu(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function tu(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}n.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var u=o.value?o.value:new Uint8Array(0);(u=this.v.decode(u,{stream:!o.done}))&&(this.response=this.responseText+=u)}o.done?ms(this):gs(this),this.readyState==3&&tu(this)}},n.Ra=function(o){this.g&&(this.response=this.responseText=o,ms(this))},n.Qa=function(o){this.g&&(this.response=o,ms(this))},n.ga=function(){this.g&&ms(this)};function ms(o){o.readyState=4,o.l=null,o.j=null,o.v=null,gs(o)}n.setRequestHeader=function(o,u){this.u.append(o,u)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],u=this.h.entries();for(var h=u.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=u.next();return o.join(`\r
`)};function gs(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(bi.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function nu(o){let u="";return _e(o,function(h,p){u+=p,u+=":",u+=h,u+=`\r
`}),u}function ha(o,u,h){e:{for(p in h){var p=!1;break e}p=!0}p||(h=nu(h),typeof o=="string"?h!=null&&encodeURIComponent(String(h)):ke(o,u,h))}function Me(o){ee.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}N(Me,ee);var jm=/^https?$/i,$m=["POST","PUT"];n=Me.prototype,n.Ha=function(o){this.J=o},n.ea=function(o,u,h,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);u=u?u.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():sa.g(),this.v=this.o?Dc(this.o):Dc(sa),this.g.onreadystatechange=E(this.Ea,this);try{this.B=!0,this.g.open(u,String(o),!0),this.B=!1}catch(D){ru(this,D);return}if(o=h||"",h=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var S in p)h.set(S,p[S]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const D of p.keys())h.set(D,p.get(D));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(h.keys()).find(D=>D.toLowerCase()=="content-type"),S=l.FormData&&o instanceof l.FormData,!(0<=Array.prototype.indexOf.call($m,u,void 0))||p||S||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[D,q]of h)this.g.setRequestHeader(D,q);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{ou(this),this.u=!0,this.g.send(o),this.u=!1}catch(D){ru(this,D)}};function ru(o,u){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=u,o.m=5,su(o),Ri(o)}function su(o){o.A||(o.A=!0,ae(o,"complete"),ae(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,ae(this,"complete"),ae(this,"abort"),Ri(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Ri(this,!0)),Me.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?iu(this):this.bb())},n.bb=function(){iu(this)};function iu(o){if(o.h&&typeof a<"u"&&(!o.v[1]||Xt(o)!=4||o.Z()!=2)){if(o.u&&Xt(o)==4)We(o.Ea,0,o);else if(ae(o,"readystatechange"),Xt(o)==4){o.h=!1;try{const q=o.Z();e:switch(q){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break e;default:u=!1}var h;if(!(h=u)){var p;if(p=q===0){var S=String(o.D).match(Qc)[1]||null;!S&&l.self&&l.self.location&&(S=l.self.location.protocol.slice(0,-1)),p=!jm.test(S?S.toLowerCase():"")}h=p}if(h)ae(o,"complete"),ae(o,"success");else{o.m=6;try{var D=2<Xt(o)?o.g.statusText:""}catch{D=""}o.l=D+" ["+o.Z()+"]",su(o)}}finally{Ri(o)}}}}function Ri(o,u){if(o.g){ou(o);const h=o.g,p=o.v[0]?()=>{}:null;o.g=null,o.v=null,u||ae(o,"ready");try{h.onreadystatechange=p}catch{}}}function ou(o){o.I&&(l.clearTimeout(o.I),o.I=null)}n.isActive=function(){return!!this.g};function Xt(o){return o.g?o.g.readyState:0}n.Z=function(){try{return 2<Xt(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(o){if(this.g){var u=this.g.responseText;return o&&u.indexOf(o)==0&&(u=u.substring(o.length)),xt(u)}};function au(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function qm(o){const u={};o=(o.g&&2<=Xt(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<o.length;p++){if(J(o[p]))continue;var h=R(o[p]);const S=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const D=u[S]||[];u[S]=D,D.push(h)}b(u,function(p){return p.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function _s(o,u,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||u}function lu(o){this.Aa=0,this.i=[],this.j=new us,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=_s("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=_s("baseRetryDelayMs",5e3,o),this.cb=_s("retryDelaySeedMs",1e4,o),this.Wa=_s("forwardChannelMaxRetries",2,o),this.wa=_s("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new qc(o&&o.concurrentRequestLimit),this.Da=new Um,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=lu.prototype,n.la=8,n.G=1,n.connect=function(o,u,h,p){pt(0),this.W=o,this.H=u||{},h&&p!==void 0&&(this.H.OSID=h,this.H.OAID=p),this.F=this.X,this.I=_u(this,null,this.W),Pi(this)};function da(o){if(cu(o),o.G==3){var u=o.U++,h=Yt(o.I);if(ke(h,"SID",o.K),ke(h,"RID",u),ke(h,"TYPE","terminate"),ys(o,h),u=new Tn(o,o.j,u),u.L=2,u.v=Ii(Yt(h)),h=!1,l.navigator&&l.navigator.sendBeacon)try{h=l.navigator.sendBeacon(u.v.toString(),"")}catch{}!h&&l.Image&&(new Image().src=u.v,h=!0),h||(u.g=yu(u.j,null),u.g.ea(u.v)),u.F=Date.now(),Ei(u)}gu(o)}function Si(o){o.g&&(pa(o),o.g.cancel(),o.g=null)}function cu(o){Si(o),o.u&&(l.clearTimeout(o.u),o.u=null),Ci(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&l.clearTimeout(o.s),o.s=null)}function Pi(o){if(!Hc(o.h)&&!o.s){o.s=!0;var u=o.Ga;ce||Jt(),pe||(ce(),pe=!0),vt.add(u,o),o.B=0}}function Hm(o,u){return zc(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=u.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=cs(E(o.Ga,o,u),mu(o,o.B)),o.B++,!0)}n.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const S=new Tn(this,this.j,o);let D=this.o;if(this.S&&(D?(D=g(D),w(D,this.S)):D=this.S),this.m!==null||this.O||(S.H=D,D=null),this.P)e:{for(var u=0,h=0;h<this.i.length;h++){t:{var p=this.i[h];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(u+=p,4096<u){u=h;break e}if(u===4096||h===this.i.length-1){u=h+1;break e}}u=1e3}else u=1e3;u=hu(this,S,u),h=Yt(this.I),ke(h,"RID",o),ke(h,"CVER",22),this.D&&ke(h,"X-HTTP-Session-Id",this.D),ys(this,h),D&&(this.O?u="headers="+encodeURIComponent(String(nu(D)))+"&"+u:this.m&&ha(h,this.m,D)),ua(this.h,S),this.Ua&&ke(h,"TYPE","init"),this.P?(ke(h,"$req",u),ke(h,"SID","null"),S.T=!0,oa(S,h,null)):oa(S,h,u),this.G=2}}else this.G==3&&(o?uu(this,o):this.i.length==0||Hc(this.h)||uu(this))};function uu(o,u){var h;u?h=u.l:h=o.U++;const p=Yt(o.I);ke(p,"SID",o.K),ke(p,"RID",h),ke(p,"AID",o.T),ys(o,p),o.m&&o.o&&ha(p,o.m,o.o),h=new Tn(o,o.j,h,o.B+1),o.m===null&&(h.H=o.o),u&&(o.i=u.D.concat(o.i)),u=hu(o,h,1e3),h.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),ua(o.h,h),oa(h,p,u)}function ys(o,u){o.H&&_e(o.H,function(h,p){ke(u,p,h)}),o.l&&Gc({},function(h,p){ke(u,p,h)})}function hu(o,u,h){h=Math.min(o.i.length,h);var p=o.l?E(o.l.Na,o.l,o):null;e:{var S=o.i;let D=-1;for(;;){const q=["count="+h];D==-1?0<h?(D=S[0].g,q.push("ofs="+D)):D=0:q.push("ofs="+D);let Re=!0;for(let Ge=0;Ge<h;Ge++){let ve=S[Ge].g;const nt=S[Ge].map;if(ve-=D,0>ve)D=Math.max(0,S[Ge].g-100),Re=!1;else try{Bm(nt,q,"req"+ve+"_")}catch{p&&p(nt)}}if(Re){p=q.join("&");break e}}}return o=o.i.splice(0,h),u.D=o,p}function du(o){if(!o.g&&!o.u){o.Y=1;var u=o.Fa;ce||Jt(),pe||(ce(),pe=!0),vt.add(u,o),o.v=0}}function fa(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=cs(E(o.Fa,o),mu(o,o.v)),o.v++,!0)}n.Fa=function(){if(this.u=null,fu(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=cs(E(this.ab,this),o)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,pt(10),Si(this),fu(this))};function pa(o){o.A!=null&&(l.clearTimeout(o.A),o.A=null)}function fu(o){o.g=new Tn(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var u=Yt(o.qa);ke(u,"RID","rpc"),ke(u,"SID",o.K),ke(u,"AID",o.T),ke(u,"CI",o.F?"0":"1"),!o.F&&o.ja&&ke(u,"TO",o.ja),ke(u,"TYPE","xmlhttp"),ys(o,u),o.m&&o.o&&ha(u,o.m,o.o),o.L&&(o.g.I=o.L);var h=o.g;o=o.ia,h.L=1,h.v=Ii(Yt(u)),h.m=null,h.P=!0,Bc(h,o)}n.Za=function(){this.C!=null&&(this.C=null,Si(this),fa(this),pt(19))};function Ci(o){o.C!=null&&(l.clearTimeout(o.C),o.C=null)}function pu(o,u){var h=null;if(o.g==u){Ci(o),pa(o),o.g=null;var p=2}else if(ca(o.h,u))h=u.D,Wc(o.h,u),p=1;else return;if(o.G!=0){if(u.o)if(p==1){h=u.m?u.m.length:0,u=Date.now()-u.F;var S=o.B;p=_i(),ae(p,new Mc(p,h)),Pi(o)}else du(o);else if(S=u.s,S==3||S==0&&0<u.X||!(p==1&&Hm(o,u)||p==2&&fa(o)))switch(h&&0<h.length&&(u=o.h,u.i=u.i.concat(h)),S){case 1:er(o,5);break;case 4:er(o,10);break;case 3:er(o,6);break;default:er(o,2)}}}function mu(o,u){let h=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(h*=2),h*u}function er(o,u){if(o.j.info("Error code "+u),u==2){var h=E(o.fb,o),p=o.Xa;const S=!p;p=new Zn(p||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||Ti(p,"https"),Ii(p),S?Lm(p.toString(),h):Fm(p.toString(),h)}else pt(2);o.G=0,o.l&&o.l.sa(u),gu(o),cu(o)}n.fb=function(o){o?(this.j.info("Successfully pinged google.com"),pt(2)):(this.j.info("Failed to ping google.com"),pt(1))};function gu(o){if(o.G=0,o.ka=[],o.l){const u=Kc(o.h);(u.length!=0||o.i.length!=0)&&(j(o.ka,u),j(o.ka,o.i),o.h.i.length=0,B(o.i),o.i.length=0),o.l.ra()}}function _u(o,u,h){var p=h instanceof Zn?Yt(h):new Zn(h);if(p.g!="")u&&(p.g=u+"."+p.g),wi(p,p.s);else{var S=l.location;p=S.protocol,u=u?u+"."+S.hostname:S.hostname,S=+S.port;var D=new Zn(null);p&&Ti(D,p),u&&(D.g=u),S&&wi(D,S),h&&(D.l=h),p=D}return h=o.D,u=o.ya,h&&u&&ke(p,h,u),ke(p,"VER",o.la),ys(o,p),p}function yu(o,u,h){if(u&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return u=o.Ca&&!o.pa?new Me(new Ai({eb:h})):new Me(o.pa),u.Ha(o.J),u}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function vu(){}n=vu.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function ki(){}ki.prototype.g=function(o,u){return new Rt(o,u)};function Rt(o,u){ee.call(this),this.g=new lu(u),this.l=o,this.h=u&&u.messageUrlParams||null,o=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(o?o["X-WebChannel-Content-Type"]=u.messageContentType:o={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.va&&(o?o["X-WebChannel-Client-Profile"]=u.va:o={"X-WebChannel-Client-Profile":u.va}),this.g.S=o,(o=u&&u.Sb)&&!J(o)&&(this.g.m=o),this.v=u&&u.supportsCrossDomainXhr||!1,this.u=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!J(u)&&(this.g.D=u,o=this.h,o!==null&&u in o&&(o=this.h,u in o&&delete o[u])),this.j=new Tr(this)}N(Rt,ee),Rt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Rt.prototype.close=function(){da(this.g)},Rt.prototype.o=function(o){var u=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.u&&(h={},h.__data__=Ke(o),o=h);u.i.push(new Sm(u.Ya++,o)),u.G==3&&Pi(u)},Rt.prototype.N=function(){this.g.l=null,delete this.j,da(this.g),delete this.g,Rt.aa.N.call(this)};function Eu(o){na.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var u=o.__sm__;if(u){e:{for(const h in u){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,u=u!==null&&o in u?u[o]:void 0),this.data=u}else this.data=o}N(Eu,na);function Tu(){ra.call(this),this.status=1}N(Tu,ra);function Tr(o){this.g=o}N(Tr,vu),Tr.prototype.ua=function(){ae(this.g,"a")},Tr.prototype.ta=function(o){ae(this.g,new Eu(o))},Tr.prototype.sa=function(o){ae(this.g,new Tu)},Tr.prototype.ra=function(){ae(this.g,"b")},ki.prototype.createWebChannel=ki.prototype.g,Rt.prototype.send=Rt.prototype.o,Rt.prototype.open=Rt.prototype.m,Rt.prototype.close=Rt.prototype.close,Cf=function(){return new ki},Pf=function(){return _i()},Sf=Yn,ol={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},yi.NO_ERROR=0,yi.TIMEOUT=8,yi.HTTP_ERROR=6,zi=yi,Lc.COMPLETE="complete",Rf=Lc,Vc.EventType=as,as.OPEN="a",as.CLOSE="b",as.ERROR="c",as.MESSAGE="d",ee.prototype.listen=ee.prototype.K,Rs=Vc,Me.prototype.listenOnce=Me.prototype.L,Me.prototype.getLastError=Me.prototype.Ka,Me.prototype.getLastErrorCode=Me.prototype.Ba,Me.prototype.getStatus=Me.prototype.Z,Me.prototype.getResponseJson=Me.prototype.Oa,Me.prototype.getResponseText=Me.prototype.oa,Me.prototype.send=Me.prototype.ea,Me.prototype.setWithCredentials=Me.prototype.Ha,bf=Me}).apply(typeof Oi<"u"?Oi:typeof self<"u"?self:typeof window<"u"?window:{});const ah="@firebase/firestore";/**
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
 */let Zr="10.14.0";/**
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
 */const ur=new ql("@firebase/firestore");function ws(){return ur.logLevel}function G(n,...e){if(ur.logLevel<=he.DEBUG){const t=e.map(Wl);ur.debug(`Firestore (${Zr}): ${n}`,...t)}}function dn(n,...e){if(ur.logLevel<=he.ERROR){const t=e.map(Wl);ur.error(`Firestore (${Zr}): ${n}`,...t)}}function zr(n,...e){if(ur.logLevel<=he.WARN){const t=e.map(Wl);ur.warn(`Firestore (${Zr}): ${n}`,...t)}}function Wl(n){if(typeof n=="string")return n;try{/**
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
 */function re(n="Unexpected state"){const e=`FIRESTORE (${Zr}) INTERNAL ASSERTION FAILED: `+n;throw dn(e),new Error(e)}function Ae(n,e){n||re()}function oe(n,e){return n}/**
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
 */const L={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class Y extends yn{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class kf{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Kv{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(it.UNAUTHENTICATED))}shutdown(){}}class Gv{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class Qv{constructor(e){this.t=e,this.currentUser=it.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){Ae(this.o===void 0);let r=this.i;const s=c=>this.i!==r?(r=this.i,t(c)):Promise.resolve();let i=new Mn;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Mn,e.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const c=i;e.enqueueRetryable(async()=>{await c.promise,await s(this.currentUser)})},l=c=>{G("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(c=>l(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?l(c):(G("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Mn)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(G("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(Ae(typeof r.accessToken=="string"),new kf(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Ae(e===null||typeof e=="string"),new it(e)}}class Jv{constructor(e,t,r){this.l=e,this.h=t,this.P=r,this.type="FirstParty",this.user=it.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class Yv{constructor(e,t,r){this.l=e,this.h=t,this.P=r}getToken(){return Promise.resolve(new Jv(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(it.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Xv{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Zv{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){Ae(this.o===void 0);const r=i=>{i.error!=null&&G("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.R;return this.R=i.token,G("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{G("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):G("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(Ae(typeof t.token=="string"),this.R=t.token,new Xv(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */class Df{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const s=eE(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%e.length))}return r}}function Ee(n,e){return n<e?-1:n>e?1:0}function Wr(n,e,t){return n.length===e.length&&n.every((r,s)=>t(r,e[s]))}/**
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
 */class He{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new Y(L.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new Y(L.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new Y(L.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new Y(L.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return He.fromMillis(Date.now())}static fromDate(e){return He.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*t));return new He(t,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?Ee(this.nanoseconds,e.nanoseconds):Ee(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
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
 */class ie{constructor(e){this.timestamp=e}static fromTimestamp(e){return new ie(e)}static min(){return new ie(new He(0,0))}static max(){return new ie(new He(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */class Qs{constructor(e,t,r){t===void 0?t=0:t>e.length&&re(),r===void 0?r=e.length-t:r>e.length-t&&re(),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Qs.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Qs?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=e.get(s),a=t.get(s);if(i<a)return-1;if(i>a)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class Ve extends Qs{construct(e,t,r){return new Ve(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new Y(L.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(s=>s.length>0))}return new Ve(t)}static emptyPath(){return new Ve([])}}const tE=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Ye extends Qs{construct(e,t,r){return new Ye(e,t,r)}static isValidIdentifier(e){return tE.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Ye.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new Ye(["__name__"])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new Y(L.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;s<e.length;){const l=e[s];if(l==="\\"){if(s+1===e.length)throw new Y(L.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new Y(L.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=c,s+=2}else l==="`"?(a=!a,s++):l!=="."||a?(r+=l,s++):(i(),s++)}if(i(),a)throw new Y(L.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Ye(t)}static emptyPath(){return new Ye([])}}/**
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
 */class te{constructor(e){this.path=e}static fromPath(e){return new te(Ve.fromString(e))}static fromName(e){return new te(Ve.fromString(e).popFirst(5))}static empty(){return new te(Ve.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Ve.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return Ve.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new te(new Ve(e.slice()))}}function nE(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=ie.fromTimestamp(r===1e9?new He(t+1,0):new He(t,r));return new $n(s,te.empty(),e)}function rE(n){return new $n(n.readTime,n.key,-1)}class $n{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new $n(ie.min(),te.empty(),-1)}static max(){return new $n(ie.max(),te.empty(),-1)}}function sE(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=te.comparator(n.documentKey,e.documentKey),t!==0?t:Ee(n.largestBatchId,e.largestBatchId))}/**
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
 */async function oi(n){if(n.code!==L.FAILED_PRECONDITION||n.message!==iE)throw n;G("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class F{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&re(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new F((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof F?t:F.resolve(t)}catch(t){return F.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):F.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):F.reject(t)}static resolve(e){return new F((t,r)=>{t(e)})}static reject(e){return new F((t,r)=>{r(e)})}static waitFor(e){return new F((t,r)=>{let s=0,i=0,a=!1;e.forEach(l=>{++s,l.next(()=>{++i,a&&i===s&&t()},c=>r(c))}),a=!0,i===s&&t()})}static or(e){let t=F.resolve(!1);for(const r of e)t=t.next(s=>s?F.resolve(s):r());return t}static forEach(e,t){const r=[];return e.forEach((s,i)=>{r.push(t.call(this,s,i))}),this.waitFor(r)}static mapArray(e,t){return new F((r,s)=>{const i=e.length,a=new Array(i);let l=0;for(let c=0;c<i;c++){const d=c;t(e[d]).next(f=>{a[d]=f,++l,l===i&&r(a)},f=>s(f))}})}static doWhile(e,t){return new F((r,s)=>{const i=()=>{e()===!0?t().next(()=>{i()},s):r()};i()})}}function aE(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function ai(n){return n.name==="IndexedDbTransactionError"}/**
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
 */function lh(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function _r(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function Vf(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
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
 */class Ne{constructor(e,t){this.comparator=e,this.root=t||Qe.EMPTY}insert(e,t){return new Ne(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Qe.BLACK,null,null))}remove(e){return new Ne(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Qe.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Mi(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Mi(this.root,e,this.comparator,!1)}getReverseIterator(){return new Mi(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Mi(this.root,e,this.comparator,!0)}}class Mi{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Qe{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??Qe.RED,this.left=s??Qe.EMPTY,this.right=i??Qe.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new Qe(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return Qe.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return Qe.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Qe.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Qe.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw re();const e=this.left.check();if(e!==this.right.check())throw re();return e+(this.isRed()?0:1)}}Qe.EMPTY=null,Qe.RED=!0,Qe.BLACK=!1;Qe.EMPTY=new class{constructor(){this.size=0}get key(){throw re()}get value(){throw re()}get color(){throw re()}get left(){throw re()}get right(){throw re()}copy(e,t,r,s,i){return this}insert(e,t,r){return new Qe(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class Ze{constructor(e){this.comparator=e,this.data=new Ne(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new ch(this.data.getIterator())}getIteratorFrom(e){return new ch(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof Ze)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new Ze(this.comparator);return t.data=e,t}}class ch{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */class Ct{constructor(e){this.fields=e,e.sort(Ye.comparator)}static empty(){return new Ct([])}unionWith(e){let t=new Ze(Ye.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Ct(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Wr(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
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
 */class xf extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class tt{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new xf("Invalid base64 string: "+i):i}}(e);return new tt(t)}static fromUint8Array(e){const t=function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i}(e);return new tt(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Ee(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}tt.EMPTY_BYTE_STRING=new tt("");const cE=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function qn(n){if(Ae(!!n),typeof n=="string"){let e=0;const t=cE.exec(n);if(Ae(!!t),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:Fe(n.seconds),nanos:Fe(n.nanos)}}function Fe(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function hr(n){return typeof n=="string"?tt.fromBase64String(n):tt.fromUint8Array(n)}/**
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
 */const Li={mapValue:{fields:{__type__:{stringValue:"__max__"}}}};function dr(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Gl(n)?4:dE(n)?9007199254740991:hE(n)?10:11:re()}function Gt(n,e){if(n===e)return!0;const t=dr(n);if(t!==dr(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Js(n).isEqual(Js(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const a=qn(s.timestampValue),l=qn(i.timestampValue);return a.seconds===l.seconds&&a.nanos===l.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,i){return hr(s.bytesValue).isEqual(hr(i.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,i){return Fe(s.geoPointValue.latitude)===Fe(i.geoPointValue.latitude)&&Fe(s.geoPointValue.longitude)===Fe(i.geoPointValue.longitude)}(n,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return Fe(s.integerValue)===Fe(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const a=Fe(s.doubleValue),l=Fe(i.doubleValue);return a===l?co(a)===co(l):isNaN(a)&&isNaN(l)}return!1}(n,e);case 9:return Wr(n.arrayValue.values||[],e.arrayValue.values||[],Gt);case 10:case 11:return function(s,i){const a=s.mapValue.fields||{},l=i.mapValue.fields||{};if(lh(a)!==lh(l))return!1;for(const c in a)if(a.hasOwnProperty(c)&&(l[c]===void 0||!Gt(a[c],l[c])))return!1;return!0}(n,e);default:return re()}}function Xs(n,e){return(n.values||[]).find(t=>Gt(t,e))!==void 0}function Kr(n,e){if(n===e)return 0;const t=dr(n),r=dr(e);if(t!==r)return Ee(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return Ee(n.booleanValue,e.booleanValue);case 2:return function(i,a){const l=Fe(i.integerValue||i.doubleValue),c=Fe(a.integerValue||a.doubleValue);return l<c?-1:l>c?1:l===c?0:isNaN(l)?isNaN(c)?0:-1:1}(n,e);case 3:return uh(n.timestampValue,e.timestampValue);case 4:return uh(Js(n),Js(e));case 5:return Ee(n.stringValue,e.stringValue);case 6:return function(i,a){const l=hr(i),c=hr(a);return l.compareTo(c)}(n.bytesValue,e.bytesValue);case 7:return function(i,a){const l=i.split("/"),c=a.split("/");for(let d=0;d<l.length&&d<c.length;d++){const f=Ee(l[d],c[d]);if(f!==0)return f}return Ee(l.length,c.length)}(n.referenceValue,e.referenceValue);case 8:return function(i,a){const l=Ee(Fe(i.latitude),Fe(a.latitude));return l!==0?l:Ee(Fe(i.longitude),Fe(a.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return hh(n.arrayValue,e.arrayValue);case 10:return function(i,a){var l,c,d,f;const m=i.fields||{},E=a.fields||{},P=(l=m.value)===null||l===void 0?void 0:l.arrayValue,N=(c=E.value)===null||c===void 0?void 0:c.arrayValue,B=Ee(((d=P==null?void 0:P.values)===null||d===void 0?void 0:d.length)||0,((f=N==null?void 0:N.values)===null||f===void 0?void 0:f.length)||0);return B!==0?B:hh(P,N)}(n.mapValue,e.mapValue);case 11:return function(i,a){if(i===Li.mapValue&&a===Li.mapValue)return 0;if(i===Li.mapValue)return 1;if(a===Li.mapValue)return-1;const l=i.fields||{},c=Object.keys(l),d=a.fields||{},f=Object.keys(d);c.sort(),f.sort();for(let m=0;m<c.length&&m<f.length;++m){const E=Ee(c[m],f[m]);if(E!==0)return E;const P=Kr(l[c[m]],d[f[m]]);if(P!==0)return P}return Ee(c.length,f.length)}(n.mapValue,e.mapValue);default:throw re()}}function uh(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return Ee(n,e);const t=qn(n),r=qn(e),s=Ee(t.seconds,r.seconds);return s!==0?s:Ee(t.nanos,r.nanos)}function hh(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=Kr(t[s],r[s]);if(i)return i}return Ee(t.length,r.length)}function Gr(n){return al(n)}function al(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=qn(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return hr(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return te.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=al(i);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const a of r)i?i=!1:s+=",",s+=`${a}:${al(t.fields[a])}`;return s+"}"}(n.mapValue):re()}function ll(n){return!!n&&"integerValue"in n}function Jl(n){return!!n&&"arrayValue"in n}function dh(n){return!!n&&"nullValue"in n}function fh(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Wi(n){return!!n&&"mapValue"in n}function hE(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="__vector__"}function Ms(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return _r(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=Ms(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Ms(n.arrayValue.values[t]);return e}return Object.assign({},n)}function dE(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
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
 */class Tt{constructor(e){this.value=e}static empty(){return new Tt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Wi(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ms(t)}setAll(e){let t=Ye.emptyPath(),r={},s=[];e.forEach((a,l)=>{if(!t.isImmediateParentOf(l)){const c=this.getFieldsMap(t);this.applyChanges(c,r,s),r={},s=[],t=l.popLast()}a?r[l.lastSegment()]=Ms(a):s.push(l.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());Wi(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Gt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];Wi(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){_r(t,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new Tt(Ms(this.value))}}function Nf(n){const e=[];return _r(n.fields,(t,r)=>{const s=new Ye([t]);if(Wi(r)){const i=Nf(r.mapValue).fields;if(i.length===0)e.push(s);else for(const a of i)e.push(s.child(a))}else e.push(s)}),new Ct(e)}/**
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
 */class lt{constructor(e,t,r,s,i,a,l){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=a,this.documentState=l}static newInvalidDocument(e){return new lt(e,0,ie.min(),ie.min(),ie.min(),Tt.empty(),0)}static newFoundDocument(e,t,r,s){return new lt(e,1,t,ie.min(),r,s,0)}static newNoDocument(e,t){return new lt(e,2,t,ie.min(),ie.min(),Tt.empty(),0)}static newUnknownDocument(e,t){return new lt(e,3,t,ie.min(),ie.min(),Tt.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(ie.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Tt.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Tt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=ie.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof lt&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new lt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class uo{constructor(e,t){this.position=e,this.inclusive=t}}function ph(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],a=n.position[s];if(i.field.isKeyField()?r=te.comparator(te.fromName(a.referenceValue),t.key):r=Kr(a,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function mh(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Gt(n.position[t],e.position[t]))return!1;return!0}/**
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
 */class Of{}class qe extends Of{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new mE(e,t,r):t==="array-contains"?new yE(e,r):t==="in"?new vE(e,r):t==="not-in"?new EE(e,r):t==="array-contains-any"?new TE(e,r):new qe(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new gE(e,r):new _E(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(Kr(t,this.value)):t!==null&&dr(this.value)===dr(t)&&this.matchesComparison(Kr(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return re()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Qt extends Of{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new Qt(e,t)}matches(e){return Mf(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function Mf(n){return n.op==="and"}function Lf(n){return pE(n)&&Mf(n)}function pE(n){for(const e of n.filters)if(e instanceof Qt)return!1;return!0}function cl(n){if(n instanceof qe)return n.field.canonicalString()+n.op.toString()+Gr(n.value);if(Lf(n))return n.filters.map(e=>cl(e)).join(",");{const e=n.filters.map(t=>cl(t)).join(",");return`${n.op}(${e})`}}function Ff(n,e){return n instanceof qe?function(r,s){return s instanceof qe&&r.op===s.op&&r.field.isEqual(s.field)&&Gt(r.value,s.value)}(n,e):n instanceof Qt?function(r,s){return s instanceof Qt&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,a,l)=>i&&Ff(a,s.filters[l]),!0):!1}(n,e):void re()}function Uf(n){return n instanceof qe?function(t){return`${t.field.canonicalString()} ${t.op} ${Gr(t.value)}`}(n):n instanceof Qt?function(t){return t.op.toString()+" {"+t.getFilters().map(Uf).join(" ,")+"}"}(n):"Filter"}class mE extends qe{constructor(e,t,r){super(e,t,r),this.key=te.fromName(r.referenceValue)}matches(e){const t=te.comparator(e.key,this.key);return this.matchesComparison(t)}}class gE extends qe{constructor(e,t){super(e,"in",t),this.keys=Bf("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class _E extends qe{constructor(e,t){super(e,"not-in",t),this.keys=Bf("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Bf(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>te.fromName(r.referenceValue))}class yE extends qe{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Jl(t)&&Xs(t.arrayValue,this.value)}}class vE extends qe{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Xs(this.value.arrayValue,t)}}class EE extends qe{constructor(e,t){super(e,"not-in",t)}matches(e){if(Xs(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!Xs(this.value.arrayValue,t)}}class TE extends qe{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Jl(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Xs(this.value.arrayValue,r))}}/**
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
 */class wE{constructor(e,t=null,r=[],s=[],i=null,a=null,l=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=a,this.endAt=l,this.ue=null}}function gh(n,e=null,t=[],r=[],s=null,i=null,a=null){return new wE(n,e,t,r,s,i,a)}function Yl(n){const e=oe(n);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>cl(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),Oo(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Gr(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Gr(r)).join(",")),e.ue=t}return e.ue}function Xl(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!fE(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Ff(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!mh(n.startAt,e.startAt)&&mh(n.endAt,e.endAt)}function ul(n){return te.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
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
 */class Mo{constructor(e,t=null,r=[],s=[],i=null,a="F",l=null,c=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=a,this.startAt=l,this.endAt=c,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function IE(n,e,t,r,s,i,a,l){return new Mo(n,e,t,r,s,i,a,l)}function jf(n){return new Mo(n)}function _h(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function AE(n){return n.collectionGroup!==null}function Ls(n){const e=oe(n);if(e.ce===null){e.ce=[];const t=new Set;for(const i of e.explicitOrderBy)e.ce.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let l=new Ze(Ye.comparator);return a.filters.forEach(c=>{c.getFlattenedFilters().forEach(d=>{d.isInequality()&&(l=l.add(d.field))})}),l})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.ce.push(new ho(i,r))}),t.has(Ye.keyField().canonicalString())||e.ce.push(new ho(Ye.keyField(),r))}return e.ce}function qt(n){const e=oe(n);return e.le||(e.le=bE(e,Ls(n))),e.le}function bE(n,e){if(n.limitType==="F")return gh(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new ho(s.field,i)});const t=n.endAt?new uo(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new uo(n.startAt.position,n.startAt.inclusive):null;return gh(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function hl(n,e,t){return new Mo(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Lo(n,e){return Xl(qt(n),qt(e))&&n.limitType===e.limitType}function $f(n){return`${Yl(qt(n))}|lt:${n.limitType}`}function kr(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(s=>Uf(s)).join(", ")}]`),Oo(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(s=>Gr(s)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(s=>Gr(s)).join(",")),`Target(${r})`}(qt(n))}; limitType=${n.limitType})`}function Fo(n,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):te.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(n,e)&&function(r,s){for(const i of Ls(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(n,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(n,e)&&function(r,s){return!(r.startAt&&!function(a,l,c){const d=ph(a,l,c);return a.inclusive?d<=0:d<0}(r.startAt,Ls(r),s)||r.endAt&&!function(a,l,c){const d=ph(a,l,c);return a.inclusive?d>=0:d>0}(r.endAt,Ls(r),s))}(n,e)}function RE(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function qf(n){return(e,t)=>{let r=!1;for(const s of Ls(n)){const i=SE(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function SE(n,e,t){const r=n.field.isKeyField()?te.comparator(e.key,t.key):function(i,a,l){const c=a.data.field(i),d=l.data.field(i);return c!==null&&d!==null?Kr(c,d):re()}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return re()}}/**
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
 */class es{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){_r(this.inner,(t,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return Vf(this.inner)}size(){return this.innerSize}}/**
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
 */const PE=new Ne(te.comparator);function fn(){return PE}const Hf=new Ne(te.comparator);function Ss(...n){let e=Hf;for(const t of n)e=e.insert(t.key,t);return e}function zf(n){let e=Hf;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function or(){return Fs()}function Wf(){return Fs()}function Fs(){return new es(n=>n.toString(),(n,e)=>n.isEqual(e))}const CE=new Ne(te.comparator),kE=new Ze(te.comparator);function ue(...n){let e=kE;for(const t of n)e=e.add(t);return e}const DE=new Ze(Ee);function VE(){return DE}/**
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
 */function Zl(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:co(e)?"-0":e}}function Kf(n){return{integerValue:""+n}}function xE(n,e){return lE(e)?Kf(e):Zl(n,e)}/**
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
 */class Uo{constructor(){this._=void 0}}function NE(n,e,t){return n instanceof fo?function(s,i){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Gl(i)&&(i=Ql(i)),i&&(a.fields.__previous_value__=i),{mapValue:a}}(t,e):n instanceof Zs?Qf(n,e):n instanceof ei?Jf(n,e):function(s,i){const a=Gf(s,i),l=yh(a)+yh(s.Pe);return ll(a)&&ll(s.Pe)?Kf(l):Zl(s.serializer,l)}(n,e)}function OE(n,e,t){return n instanceof Zs?Qf(n,e):n instanceof ei?Jf(n,e):t}function Gf(n,e){return n instanceof po?function(r){return ll(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class fo extends Uo{}class Zs extends Uo{constructor(e){super(),this.elements=e}}function Qf(n,e){const t=Yf(e);for(const r of n.elements)t.some(s=>Gt(s,r))||t.push(r);return{arrayValue:{values:t}}}class ei extends Uo{constructor(e){super(),this.elements=e}}function Jf(n,e){let t=Yf(e);for(const r of n.elements)t=t.filter(s=>!Gt(s,r));return{arrayValue:{values:t}}}class po extends Uo{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function yh(n){return Fe(n.integerValue||n.doubleValue)}function Yf(n){return Jl(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}function ME(n,e){return n.field.isEqual(e.field)&&function(r,s){return r instanceof Zs&&s instanceof Zs||r instanceof ei&&s instanceof ei?Wr(r.elements,s.elements,Gt):r instanceof po&&s instanceof po?Gt(r.Pe,s.Pe):r instanceof fo&&s instanceof fo}(n.transform,e.transform)}class LE{constructor(e,t){this.version=e,this.transformResults=t}}class kt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new kt}static exists(e){return new kt(void 0,e)}static updateTime(e){return new kt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Ki(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Bo{}function Xf(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new jo(n.key,kt.none()):new li(n.key,n.data,kt.none());{const t=n.data,r=Tt.empty();let s=new Ze(Ye.comparator);for(let i of e.fields)if(!s.has(i)){let a=t.field(i);a===null&&i.length>1&&(i=i.popLast(),a=t.field(i)),a===null?r.delete(i):r.set(i,a),s=s.add(i)}return new Gn(n.key,r,new Ct(s.toArray()),kt.none())}}function FE(n,e,t){n instanceof li?function(s,i,a){const l=s.value.clone(),c=Eh(s.fieldTransforms,i,a.transformResults);l.setAll(c),i.convertToFoundDocument(a.version,l).setHasCommittedMutations()}(n,e,t):n instanceof Gn?function(s,i,a){if(!Ki(s.precondition,i))return void i.convertToUnknownDocument(a.version);const l=Eh(s.fieldTransforms,i,a.transformResults),c=i.data;c.setAll(Zf(s)),c.setAll(l),i.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(n,e,t):function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function Us(n,e,t,r){return n instanceof li?function(i,a,l,c){if(!Ki(i.precondition,a))return l;const d=i.value.clone(),f=Th(i.fieldTransforms,c,a);return d.setAll(f),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(n,e,t,r):n instanceof Gn?function(i,a,l,c){if(!Ki(i.precondition,a))return l;const d=Th(i.fieldTransforms,c,a),f=a.data;return f.setAll(Zf(i)),f.setAll(d),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),l===null?null:l.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(m=>m.field))}(n,e,t,r):function(i,a,l){return Ki(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):l}(n,e,t)}function UE(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=Gf(r.transform,s||null);i!=null&&(t===null&&(t=Tt.empty()),t.set(r.field,i))}return t||null}function vh(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&Wr(r,s,(i,a)=>ME(i,a))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class li extends Bo{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Gn extends Bo{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Zf(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function Eh(n,e,t){const r=new Map;Ae(n.length===t.length);for(let s=0;s<t.length;s++){const i=n[s],a=i.transform,l=e.data.field(i.field);r.set(i.field,OE(a,l,t[s]))}return r}function Th(n,e,t){const r=new Map;for(const s of n){const i=s.transform,a=t.data.field(s.field);r.set(s.field,NE(i,a,e))}return r}class jo extends Bo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class BE extends Bo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class jE{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&FE(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Us(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Us(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=Wf();return this.mutations.forEach(s=>{const i=e.get(s.key),a=i.overlayedDocument;let l=this.applyToLocalView(a,i.mutatedFields);l=t.has(s.key)?null:l;const c=Xf(a,l);c!==null&&r.set(s.key,c),a.isValidDocument()||a.convertToNoDocument(ie.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),ue())}isEqual(e){return this.batchId===e.batchId&&Wr(this.mutations,e.mutations,(t,r)=>vh(t,r))&&Wr(this.baseMutations,e.baseMutations,(t,r)=>vh(t,r))}}class ec{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){Ae(e.mutations.length===r.length);let s=function(){return CE}();const i=e.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,r[a].version);return new ec(e,t,r,s)}}/**
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
 */var Ue,ge;function HE(n){switch(n){default:return re();case L.CANCELLED:case L.UNKNOWN:case L.DEADLINE_EXCEEDED:case L.RESOURCE_EXHAUSTED:case L.INTERNAL:case L.UNAVAILABLE:case L.UNAUTHENTICATED:return!1;case L.INVALID_ARGUMENT:case L.NOT_FOUND:case L.ALREADY_EXISTS:case L.PERMISSION_DENIED:case L.FAILED_PRECONDITION:case L.ABORTED:case L.OUT_OF_RANGE:case L.UNIMPLEMENTED:case L.DATA_LOSS:return!0}}function ep(n){if(n===void 0)return dn("GRPC error has no .code"),L.UNKNOWN;switch(n){case Ue.OK:return L.OK;case Ue.CANCELLED:return L.CANCELLED;case Ue.UNKNOWN:return L.UNKNOWN;case Ue.DEADLINE_EXCEEDED:return L.DEADLINE_EXCEEDED;case Ue.RESOURCE_EXHAUSTED:return L.RESOURCE_EXHAUSTED;case Ue.INTERNAL:return L.INTERNAL;case Ue.UNAVAILABLE:return L.UNAVAILABLE;case Ue.UNAUTHENTICATED:return L.UNAUTHENTICATED;case Ue.INVALID_ARGUMENT:return L.INVALID_ARGUMENT;case Ue.NOT_FOUND:return L.NOT_FOUND;case Ue.ALREADY_EXISTS:return L.ALREADY_EXISTS;case Ue.PERMISSION_DENIED:return L.PERMISSION_DENIED;case Ue.FAILED_PRECONDITION:return L.FAILED_PRECONDITION;case Ue.ABORTED:return L.ABORTED;case Ue.OUT_OF_RANGE:return L.OUT_OF_RANGE;case Ue.UNIMPLEMENTED:return L.UNIMPLEMENTED;case Ue.DATA_LOSS:return L.DATA_LOSS;default:return re()}}(ge=Ue||(Ue={}))[ge.OK=0]="OK",ge[ge.CANCELLED=1]="CANCELLED",ge[ge.UNKNOWN=2]="UNKNOWN",ge[ge.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ge[ge.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ge[ge.NOT_FOUND=5]="NOT_FOUND",ge[ge.ALREADY_EXISTS=6]="ALREADY_EXISTS",ge[ge.PERMISSION_DENIED=7]="PERMISSION_DENIED",ge[ge.UNAUTHENTICATED=16]="UNAUTHENTICATED",ge[ge.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ge[ge.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ge[ge.ABORTED=10]="ABORTED",ge[ge.OUT_OF_RANGE=11]="OUT_OF_RANGE",ge[ge.UNIMPLEMENTED=12]="UNIMPLEMENTED",ge[ge.INTERNAL=13]="INTERNAL",ge[ge.UNAVAILABLE=14]="UNAVAILABLE",ge[ge.DATA_LOSS=15]="DATA_LOSS";/**
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
 */const WE=new lr([4294967295,4294967295],0);function wh(n){const e=zE().encode(n),t=new Af;return t.update(e),new Uint8Array(t.digest())}function Ih(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new lr([t,r],0),new lr([s,i],0)]}class tc{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new Ps(`Invalid padding: ${t}`);if(r<0)throw new Ps(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Ps(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new Ps(`Invalid padding when bitmap length is 0: ${t}`);this.Ie=8*e.length-t,this.Te=lr.fromNumber(this.Ie)}Ee(e,t,r){let s=e.add(t.multiply(lr.fromNumber(r)));return s.compare(WE)===1&&(s=new lr([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const t=wh(e),[r,s]=Ih(t);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);if(!this.de(a))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new tc(i,s,t);return r.forEach(l=>a.insert(l)),a}insert(e){if(this.Ie===0)return;const t=wh(e),[r,s]=Ih(t);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);this.Ae(a)}}Ae(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class Ps extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class $o{constructor(e,t,r,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,ci.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new $o(ie.min(),s,new Ne(Ee),fn(),ue())}}class ci{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new ci(r,t,ue(),ue(),ue())}}/**
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
 */class Gi{constructor(e,t,r,s){this.Re=e,this.removedTargetIds=t,this.key=r,this.Ve=s}}class tp{constructor(e,t){this.targetId=e,this.me=t}}class np{constructor(e,t,r=tt.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class Ah{constructor(){this.fe=0,this.ge=Rh(),this.pe=tt.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=ue(),t=ue(),r=ue();return this.ge.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:re()}}),new ci(this.pe,this.ye,e,t,r)}Ce(){this.we=!1,this.ge=Rh()}Fe(e,t){this.we=!0,this.ge=this.ge.insert(e,t)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,Ae(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class KE{constructor(e){this.Le=e,this.Be=new Map,this.ke=fn(),this.qe=bh(),this.Qe=new Ne(Ee)}Ke(e){for(const t of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(t,e.Ve):this.Ue(t,e.key,e.Ve);for(const t of e.removedTargetIds)this.Ue(t,e.key,e.Ve)}We(e){this.forEachTarget(e,t=>{const r=this.Ge(t);switch(e.state){case 0:this.ze(t)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(t);break;case 3:this.ze(t)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(t)&&(this.je(t),r.De(e.resumeToken));break;default:re()}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Be.forEach((r,s)=>{this.ze(s)&&t(s)})}He(e){const t=e.targetId,r=e.me.count,s=this.Je(t);if(s){const i=s.target;if(ul(i))if(r===0){const a=new te(i.path);this.Ue(t,a,lt.newNoDocument(a,ie.min()))}else Ae(r===1);else{const a=this.Ye(t);if(a!==r){const l=this.Ze(e),c=l?this.Xe(l,e,a):1;if(c!==0){this.je(t);const d=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(t,d)}}}}}Ze(e){const t=e.me.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let a,l;try{a=hr(r).toUint8Array()}catch(c){if(c instanceof xf)return zr("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{l=new tc(a,s,i)}catch(c){return zr(c instanceof Ps?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return l.Ie===0?null:l}Xe(e,t,r){return t.me.count===r-this.nt(e,t.targetId)?0:2}nt(e,t){const r=this.Le.getRemoteKeysForTarget(t);let s=0;return r.forEach(i=>{const a=this.Le.tt(),l=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(l)||(this.Ue(t,i,null),s++)}),s}rt(e){const t=new Map;this.Be.forEach((i,a)=>{const l=this.Je(a);if(l){if(i.current&&ul(l.target)){const c=new te(l.target.path);this.ke.get(c)!==null||this.it(a,c)||this.Ue(a,c,lt.newNoDocument(c,e))}i.be&&(t.set(a,i.ve()),i.Ce())}});let r=ue();this.qe.forEach((i,a)=>{let l=!0;a.forEachWhile(c=>{const d=this.Je(c);return!d||d.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(i))}),this.ke.forEach((i,a)=>a.setReadTime(e));const s=new $o(e,t,this.Qe,this.ke,r);return this.ke=fn(),this.qe=bh(),this.Qe=new Ne(Ee),s}$e(e,t){if(!this.ze(e))return;const r=this.it(e,t.key)?2:0;this.Ge(e).Fe(t.key,r),this.ke=this.ke.insert(t.key,t),this.qe=this.qe.insert(t.key,this.st(t.key).add(e))}Ue(e,t,r){if(!this.ze(e))return;const s=this.Ge(e);this.it(e,t)?s.Fe(t,1):s.Me(t),this.qe=this.qe.insert(t,this.st(t).delete(e)),r&&(this.ke=this.ke.insert(t,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const t=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let t=this.Be.get(e);return t||(t=new Ah,this.Be.set(e,t)),t}st(e){let t=this.qe.get(e);return t||(t=new Ze(Ee),this.qe=this.qe.insert(e,t)),t}ze(e){const t=this.Je(e)!==null;return t||G("WatchChangeAggregator","Detected inactive target",e),t}Je(e){const t=this.Be.get(e);return t&&t.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new Ah),this.Le.getRemoteKeysForTarget(e).forEach(t=>{this.Ue(e,t,null)})}it(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}}function bh(){return new Ne(te.comparator)}function Rh(){return new Ne(te.comparator)}const GE=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),QE=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),JE=(()=>({and:"AND",or:"OR"}))();class YE{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function dl(n,e){return n.useProto3Json||Oo(e)?e:{value:e}}function mo(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function rp(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function XE(n,e){return mo(n,e.toTimestamp())}function Ht(n){return Ae(!!n),ie.fromTimestamp(function(t){const r=qn(t);return new He(r.seconds,r.nanos)}(n))}function nc(n,e){return fl(n,e).canonicalString()}function fl(n,e){const t=function(s){return new Ve(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function sp(n){const e=Ve.fromString(n);return Ae(cp(e)),e}function pl(n,e){return nc(n.databaseId,e.path)}function Na(n,e){const t=sp(e);if(t.get(1)!==n.databaseId.projectId)throw new Y(L.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new Y(L.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new te(op(t))}function ip(n,e){return nc(n.databaseId,e)}function ZE(n){const e=sp(n);return e.length===4?Ve.emptyPath():op(e)}function ml(n){return new Ve(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function op(n){return Ae(n.length>4&&n.get(4)==="documents"),n.popFirst(5)}function Sh(n,e,t){return{name:pl(n,e),fields:t.value.mapValue.fields}}function eT(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:re()}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(d,f){return d.useProto3Json?(Ae(f===void 0||typeof f=="string"),tt.fromBase64String(f||"")):(Ae(f===void 0||f instanceof Buffer||f instanceof Uint8Array),tt.fromUint8Array(f||new Uint8Array))}(n,e.targetChange.resumeToken),a=e.targetChange.cause,l=a&&function(d){const f=d.code===void 0?L.UNKNOWN:ep(d.code);return new Y(f,d.message||"")}(a);t=new np(r,s,i,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Na(n,r.document.name),i=Ht(r.document.updateTime),a=r.document.createTime?Ht(r.document.createTime):ie.min(),l=new Tt({mapValue:{fields:r.document.fields}}),c=lt.newFoundDocument(s,i,a,l),d=r.targetIds||[],f=r.removedTargetIds||[];t=new Gi(d,f,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Na(n,r.document),i=r.readTime?Ht(r.readTime):ie.min(),a=lt.newNoDocument(s,i),l=r.removedTargetIds||[];t=new Gi([],l,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Na(n,r.document),i=r.removedTargetIds||[];t=new Gi([],i,s,null)}else{if(!("filter"in e))return re();{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,a=new qE(s,i),l=r.targetId;t=new tp(l,a)}}return t}function tT(n,e){let t;if(e instanceof li)t={update:Sh(n,e.key,e.value)};else if(e instanceof jo)t={delete:pl(n,e.key)};else if(e instanceof Gn)t={update:Sh(n,e.key,e.data),updateMask:uT(e.fieldMask)};else{if(!(e instanceof BE))return re();t={verify:pl(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(i,a){const l=a.transform;if(l instanceof fo)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof Zs)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof ei)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof po)return{fieldPath:a.field.canonicalString(),increment:l.Pe};throw re()}(0,r))),e.precondition.isNone||(t.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:XE(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:re()}(n,e.precondition)),t}function nT(n,e){return n&&n.length>0?(Ae(e!==void 0),n.map(t=>function(s,i){let a=s.updateTime?Ht(s.updateTime):Ht(i);return a.isEqual(ie.min())&&(a=Ht(i)),new LE(a,s.transformResults||[])}(t,e))):[]}function rT(n,e){return{documents:[ip(n,e.path)]}}function sT(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=ip(n,s);const i=function(d){if(d.length!==0)return lp(Qt.create(d,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const a=function(d){if(d.length!==0)return d.map(f=>function(E){return{field:Dr(E.field),direction:aT(E.dir)}}(f))}(e.orderBy);a&&(t.structuredQuery.orderBy=a);const l=dl(n,e.limit);return l!==null&&(t.structuredQuery.limit=l),e.startAt&&(t.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(e.endAt)),{_t:t,parent:s}}function iT(n){let e=ZE(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){Ae(r===1);const f=t.from[0];f.allDescendants?s=f.collectionId:e=e.child(f.collectionId)}let i=[];t.where&&(i=function(m){const E=ap(m);return E instanceof Qt&&Lf(E)?E.getFilters():[E]}(t.where));let a=[];t.orderBy&&(a=function(m){return m.map(E=>function(N){return new ho(Vr(N.field),function(j){switch(j){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(N.direction))}(E))}(t.orderBy));let l=null;t.limit&&(l=function(m){let E;return E=typeof m=="object"?m.value:m,Oo(E)?null:E}(t.limit));let c=null;t.startAt&&(c=function(m){const E=!!m.before,P=m.values||[];return new uo(P,E)}(t.startAt));let d=null;return t.endAt&&(d=function(m){const E=!m.before,P=m.values||[];return new uo(P,E)}(t.endAt)),IE(e,s,a,i,l,"F",c,d)}function oT(n,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return re()}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function ap(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Vr(t.unaryFilter.field);return qe.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Vr(t.unaryFilter.field);return qe.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Vr(t.unaryFilter.field);return qe.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Vr(t.unaryFilter.field);return qe.create(a,"!=",{nullValue:"NULL_VALUE"});default:return re()}}(n):n.fieldFilter!==void 0?function(t){return qe.create(Vr(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return re()}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return Qt.create(t.compositeFilter.filters.map(r=>ap(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return re()}}(t.compositeFilter.op))}(n):re()}function aT(n){return GE[n]}function lT(n){return QE[n]}function cT(n){return JE[n]}function Dr(n){return{fieldPath:n.canonicalString()}}function Vr(n){return Ye.fromServerFormat(n.fieldPath)}function lp(n){return n instanceof qe?function(t){if(t.op==="=="){if(fh(t.value))return{unaryFilter:{field:Dr(t.field),op:"IS_NAN"}};if(dh(t.value))return{unaryFilter:{field:Dr(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(fh(t.value))return{unaryFilter:{field:Dr(t.field),op:"IS_NOT_NAN"}};if(dh(t.value))return{unaryFilter:{field:Dr(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Dr(t.field),op:lT(t.op),value:t.value}}}(n):n instanceof Qt?function(t){const r=t.getFilters().map(s=>lp(s));return r.length===1?r[0]:{compositeFilter:{op:cT(t.op),filters:r}}}(n):re()}function uT(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function cp(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
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
 */class Dn{constructor(e,t,r,s,i=ie.min(),a=ie.min(),l=tt.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=l,this.expectedCount=c}withSequenceNumber(e){return new Dn(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Dn(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Dn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Dn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class fT{constructor(){this.un=new pT}addToCollectionParentIndex(e,t){return this.un.add(t),F.resolve()}getCollectionParents(e,t){return F.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return F.resolve()}deleteFieldIndex(e,t){return F.resolve()}deleteAllFieldIndexes(e){return F.resolve()}createTargetIndexes(e,t){return F.resolve()}getDocumentsMatchingTarget(e,t){return F.resolve(null)}getIndexType(e,t){return F.resolve(0)}getFieldIndexes(e,t){return F.resolve([])}getNextCollectionGroupToUpdate(e){return F.resolve(null)}getMinOffset(e,t){return F.resolve($n.min())}getMinOffsetFromCollectionGroup(e,t){return F.resolve($n.min())}updateCollectionGroup(e,t,r){return F.resolve()}updateIndexEntries(e,t){return F.resolve()}}class pT{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new Ze(Ve.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new Ze(Ve.comparator)).toArray()}}/**
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
 */class Qr{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new Qr(0)}static kn(){return new Qr(-1)}}/**
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
 */class mT{constructor(){this.changes=new es(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,lt.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?F.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class _T{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(r!==null&&Us(r.mutation,s,Ct.empty(),He.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,ue()).next(()=>r))}getLocalViewOfDocuments(e,t,r=ue()){const s=or();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,r).next(i=>{let a=Ss();return i.forEach((l,c)=>{a=a.insert(l,c.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const r=or();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,ue()))}populateOverlays(e,t,r){const s=[];return r.forEach(i=>{t.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((a,l)=>{t.set(a,l)})})}computeViews(e,t,r,s){let i=fn();const a=Fs(),l=function(){return Fs()}();return t.forEach((c,d)=>{const f=r.get(d.key);s.has(d.key)&&(f===void 0||f.mutation instanceof Gn)?i=i.insert(d.key,d):f!==void 0?(a.set(d.key,f.mutation.getFieldMask()),Us(f.mutation,d,f.mutation.getFieldMask(),He.now())):a.set(d.key,Ct.empty())}),this.recalculateAndSaveOverlays(e,i).next(c=>(c.forEach((d,f)=>a.set(d,f)),t.forEach((d,f)=>{var m;return l.set(d,new gT(f,(m=a.get(d))!==null&&m!==void 0?m:null))}),l))}recalculateAndSaveOverlays(e,t){const r=Fs();let s=new Ne((a,l)=>a-l),i=ue();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const l of a)l.keys().forEach(c=>{const d=t.get(c);if(d===null)return;let f=r.get(c)||Ct.empty();f=l.applyToLocalView(d,f),r.set(c,f);const m=(s.get(l.batchId)||ue()).add(c);s=s.insert(l.batchId,m)})}).next(()=>{const a=[],l=s.getReverseIterator();for(;l.hasNext();){const c=l.getNext(),d=c.key,f=c.value,m=Wf();f.forEach(E=>{if(!i.has(E)){const P=Xf(t.get(E),r.get(E));P!==null&&m.set(E,P),i=i.add(E)}}),a.push(this.documentOverlayCache.saveOverlays(e,d,m))}return F.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,s){return function(a){return te.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):AE(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next(i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):F.resolve(or());let l=-1,c=i;return a.next(d=>F.forEach(d,(f,m)=>(l<m.largestBatchId&&(l=m.largestBatchId),i.get(f)?F.resolve():this.remoteDocumentCache.getEntry(e,f).next(E=>{c=c.insert(f,E)}))).next(()=>this.populateOverlays(e,d,i)).next(()=>this.computeViews(e,c,d,ue())).next(f=>({batchId:l,changes:zf(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new te(t)).next(r=>{let s=Ss();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let a=Ss();return this.indexManager.getCollectionParents(e,i).next(l=>F.forEach(l,c=>{const d=function(m,E){return new Mo(E,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(t,c.child(i));return this.getDocumentsMatchingCollectionQuery(e,d,r,s).next(f=>{f.forEach((m,E)=>{a=a.insert(m,E)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s))).next(a=>{i.forEach((c,d)=>{const f=d.getKey();a.get(f)===null&&(a=a.insert(f,lt.newInvalidDocument(f)))});let l=Ss();return a.forEach((c,d)=>{const f=i.get(c);f!==void 0&&Us(f.mutation,d,Ct.empty(),He.now()),Fo(t,d)&&(l=l.insert(c,d))}),l})}}/**
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
 */class yT{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return F.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,function(s){return{id:s.id,version:s.version,createTime:Ht(s.createTime)}}(t)),F.resolve()}getNamedQuery(e,t){return F.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,function(s){return{name:s.name,query:dT(s.bundledQuery),readTime:Ht(s.readTime)}}(t)),F.resolve()}}/**
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
 */class vT{constructor(){this.overlays=new Ne(te.comparator),this.Ir=new Map}getOverlay(e,t){return F.resolve(this.overlays.get(t))}getOverlays(e,t){const r=or();return F.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((s,i)=>{this.ht(e,t,i)}),F.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Ir.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(r)),F.resolve()}getOverlaysForCollection(e,t,r){const s=or(),i=t.length+1,a=new te(t.child("")),l=this.overlays.getIteratorFrom(a);for(;l.hasNext();){const c=l.getNext().value,d=c.getKey();if(!t.isPrefixOf(d.path))break;d.path.length===i&&c.largestBatchId>r&&s.set(c.getKey(),c)}return F.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new Ne((d,f)=>d-f);const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===t&&d.largestBatchId>r){let f=i.get(d.largestBatchId);f===null&&(f=or(),i=i.insert(d.largestBatchId,f)),f.set(d.getKey(),d)}}const l=or(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((d,f)=>l.set(d,f)),!(l.size()>=s)););return F.resolve(l)}ht(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.Ir.get(s.largestBatchId).delete(r.key);this.Ir.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new $E(t,r));let i=this.Ir.get(t);i===void 0&&(i=ue(),this.Ir.set(t,i)),this.Ir.set(t,i.add(r.key))}}/**
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
 */class ET{constructor(){this.sessionToken=tt.EMPTY_BYTE_STRING}getSessionToken(e){return F.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,F.resolve()}}/**
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
 */class rc{constructor(){this.Tr=new Ze(ze.Er),this.dr=new Ze(ze.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const r=new ze(e,t);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Vr(new ze(e,t))}mr(e,t){e.forEach(r=>this.removeReference(r,t))}gr(e){const t=new te(new Ve([])),r=new ze(t,e),s=new ze(t,e+1),i=[];return this.dr.forEachInRange([r,s],a=>{this.Vr(a),i.push(a.key)}),i}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new te(new Ve([])),r=new ze(t,e),s=new ze(t,e+1);let i=ue();return this.dr.forEachInRange([r,s],a=>{i=i.add(a.key)}),i}containsKey(e){const t=new ze(e,0),r=this.Tr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class ze{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return te.comparator(e.key,t.key)||Ee(e.wr,t.wr)}static Ar(e,t){return Ee(e.wr,t.wr)||te.comparator(e.key,t.key)}}/**
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
 */class TT{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new Ze(ze.Er)}checkEmpty(e){return F.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new jE(i,t,r,s);this.mutationQueue.push(a);for(const l of s)this.br=this.br.add(new ze(l.key,i)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return F.resolve(a)}lookupMutationBatch(e,t){return F.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.vr(r),i=s<0?0:s;return F.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return F.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return F.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new ze(t,0),s=new ze(t,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([r,s],a=>{const l=this.Dr(a.wr);i.push(l)}),F.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new Ze(Ee);return t.forEach(s=>{const i=new ze(s,0),a=new ze(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,a],l=>{r=r.add(l.wr)})}),F.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;te.isDocumentKey(i)||(i=i.child(""));const a=new ze(new te(i),0);let l=new Ze(Ee);return this.br.forEachWhile(c=>{const d=c.key.path;return!!r.isPrefixOf(d)&&(d.length===s&&(l=l.add(c.wr)),!0)},a),F.resolve(this.Cr(l))}Cr(e){const t=[];return e.forEach(r=>{const s=this.Dr(r);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){Ae(this.Fr(t.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return F.forEach(t.mutations,s=>{const i=new ze(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,t){const r=new ze(t,0),s=this.br.firstAfterOrEqual(r);return F.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,F.resolve()}Fr(e,t){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class wT{constructor(e){this.Mr=e,this.docs=function(){return new Ne(te.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,a=this.Mr(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return F.resolve(r?r.document.mutableCopy():lt.newInvalidDocument(t))}getEntries(e,t){let r=fn();return t.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():lt.newInvalidDocument(s))}),F.resolve(r)}getDocumentsMatchingQuery(e,t,r,s){let i=fn();const a=t.path,l=new te(a.child("")),c=this.docs.getIteratorFrom(l);for(;c.hasNext();){const{key:d,value:{document:f}}=c.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||sE(rE(f),r)<=0||(s.has(f.key)||Fo(t,f))&&(i=i.insert(f.key,f.mutableCopy()))}return F.resolve(i)}getAllFromCollectionGroup(e,t,r,s){re()}Or(e,t){return F.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new IT(this)}getSize(e){return F.resolve(this.size)}}class IT extends mT{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?t.push(this.cr.addEntry(e,s)):this.cr.removeEntry(r)}),F.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}/**
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
 */class AT{constructor(e){this.persistence=e,this.Nr=new es(t=>Yl(t),Xl),this.lastRemoteSnapshotVersion=ie.min(),this.highestTargetId=0,this.Lr=0,this.Br=new rc,this.targetCount=0,this.kr=Qr.Bn()}forEachTarget(e,t){return this.Nr.forEach((r,s)=>t(s)),F.resolve()}getLastRemoteSnapshotVersion(e){return F.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return F.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),F.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Lr&&(this.Lr=t),F.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new Qr(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,F.resolve()}updateTargetData(e,t){return this.Kn(t),F.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,F.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.Nr.forEach((a,l)=>{l.sequenceNumber<=t&&r.get(l.targetId)===null&&(this.Nr.delete(a),i.push(this.removeMatchingKeysForTargetId(e,l.targetId)),s++)}),F.waitFor(i).next(()=>s)}getTargetCount(e){return F.resolve(this.targetCount)}getTargetData(e,t){const r=this.Nr.get(t)||null;return F.resolve(r)}addMatchingKeys(e,t,r){return this.Br.Rr(t,r),F.resolve()}removeMatchingKeys(e,t,r){this.Br.mr(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach(a=>{i.push(s.markPotentiallyOrphaned(e,a))}),F.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),F.resolve()}getMatchingKeysForTargetId(e,t){const r=this.Br.yr(t);return F.resolve(r)}containsKey(e,t){return F.resolve(this.Br.containsKey(t))}}/**
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
 */class bT{constructor(e,t){this.qr={},this.overlays={},this.Qr=new Kl(0),this.Kr=!1,this.Kr=!0,this.$r=new ET,this.referenceDelegate=e(this),this.Ur=new AT(this),this.indexManager=new fT,this.remoteDocumentCache=function(s){return new wT(s)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new hT(t),this.Gr=new yT(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new vT,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.qr[e.toKey()];return r||(r=new TT(t,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,r){G("MemoryPersistence","Starting transaction:",e);const s=new RT(this.Qr.next());return this.referenceDelegate.zr(),r(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(e,t){return F.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,t)))}}class RT extends oE{constructor(e){super(),this.currentSequenceNumber=e}}class sc{constructor(e){this.persistence=e,this.Jr=new rc,this.Yr=null}static Zr(e){return new sc(e)}get Xr(){if(this.Yr)return this.Yr;throw re()}addReference(e,t,r){return this.Jr.addReference(r,t),this.Xr.delete(r.toString()),F.resolve()}removeReference(e,t,r){return this.Jr.removeReference(r,t),this.Xr.add(r.toString()),F.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),F.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach(s=>this.Xr.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>r.removeTargetData(e,t))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return F.forEach(this.Xr,r=>{const s=te.fromPath(r);return this.ei(e,s).next(i=>{i||t.removeEntry(s,ie.min())})}).next(()=>(this.Yr=null,t.apply(e)))}updateLimboDocument(e,t){return this.ei(e,t).next(r=>{r?this.Xr.delete(t.toString()):this.Xr.add(t.toString())})}Wr(e){return 0}ei(e,t){return F.or([()=>F.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}/**
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
 */class ic{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.$i=r,this.Ui=s}static Wi(e,t){let r=ue(),s=ue();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new ic(e,t.fromCache,r,s)}}/**
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
 */class PT{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return Py()?8:aE(ut())>0?6:4}()}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.Yi(e,t).next(a=>{i.result=a}).next(()=>{if(!i.result)return this.Zi(e,t,s,r).next(a=>{i.result=a})}).next(()=>{if(i.result)return;const a=new ST;return this.Xi(e,t,a).next(l=>{if(i.result=l,this.zi)return this.es(e,t,a,l.size)})}).next(()=>i.result)}es(e,t,r,s){return r.documentReadCount<this.ji?(ws()<=he.DEBUG&&G("QueryEngine","SDK will not create cache indexes for query:",kr(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),F.resolve()):(ws()<=he.DEBUG&&G("QueryEngine","Query:",kr(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Hi*s?(ws()<=he.DEBUG&&G("QueryEngine","The SDK decides to create cache indexes for query:",kr(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,qt(t))):F.resolve())}Yi(e,t){if(_h(t))return F.resolve(null);let r=qt(t);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=hl(t,null,"F"),r=qt(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const a=ue(...i);return this.Ji.getDocuments(e,a).next(l=>this.indexManager.getMinOffset(e,r).next(c=>{const d=this.ts(t,l);return this.ns(t,d,a,c.readTime)?this.Yi(e,hl(t,null,"F")):this.rs(e,d,t,c)}))})))}Zi(e,t,r,s){return _h(t)||s.isEqual(ie.min())?F.resolve(null):this.Ji.getDocuments(e,r).next(i=>{const a=this.ts(t,i);return this.ns(t,a,r,s)?F.resolve(null):(ws()<=he.DEBUG&&G("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),kr(t)),this.rs(e,a,t,nE(s,-1)).next(l=>l))})}ts(e,t){let r=new Ze(qf(e));return t.forEach((s,i)=>{Fo(e,i)&&(r=r.add(i))}),r}ns(e,t,r,s){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(e,t,r){return ws()<=he.DEBUG&&G("QueryEngine","Using full collection scan to execute query:",kr(t)),this.Ji.getDocumentsMatchingQuery(e,t,$n.min(),r)}rs(e,t,r,s){return this.Ji.getDocumentsMatchingQuery(e,r,s).next(i=>(t.forEach(a=>{i=i.insert(a.key,a)}),i))}}/**
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
 */class CT{constructor(e,t,r,s){this.persistence=e,this.ss=t,this.serializer=s,this.os=new Ne(Ee),this._s=new es(i=>Yl(i),Xl),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new _T(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.os))}}function kT(n,e,t,r){return new CT(n,e,t,r)}async function up(n,e){const t=oe(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,t.ls(e),t.mutationQueue.getAllMutationBatches(r))).next(i=>{const a=[],l=[];let c=ue();for(const d of s){a.push(d.batchId);for(const f of d.mutations)c=c.add(f.key)}for(const d of i){l.push(d.batchId);for(const f of d.mutations)c=c.add(f.key)}return t.localDocuments.getDocuments(r,c).next(d=>({hs:d,removedBatchIds:a,addedBatchIds:l}))})})}function DT(n,e){const t=oe(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=t.cs.newChangeBuffer({trackRemovals:!0});return function(l,c,d,f){const m=d.batch,E=m.keys();let P=F.resolve();return E.forEach(N=>{P=P.next(()=>f.getEntry(c,N)).next(B=>{const j=d.docVersions.get(N);Ae(j!==null),B.version.compareTo(j)<0&&(m.applyToRemoteDocument(B,d),B.isValidDocument()&&(B.setReadTime(d.commitVersion),f.addEntry(B)))})}),P.next(()=>l.mutationQueue.removeMutationBatch(c,m))}(t,r,e,i).next(()=>i.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let c=ue();for(let d=0;d<l.mutationResults.length;++d)l.mutationResults[d].transformResults.length>0&&(c=c.add(l.batch.mutations[d].key));return c}(e))).next(()=>t.localDocuments.getDocuments(r,s))})}function hp(n){const e=oe(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ur.getLastRemoteSnapshotVersion(t))}function VT(n,e){const t=oe(n),r=e.snapshotVersion;let s=t.os;return t.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const a=t.cs.newChangeBuffer({trackRemovals:!0});s=t.os;const l=[];e.targetChanges.forEach((f,m)=>{const E=s.get(m);if(!E)return;l.push(t.Ur.removeMatchingKeys(i,f.removedDocuments,m).next(()=>t.Ur.addMatchingKeys(i,f.addedDocuments,m)));let P=E.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(m)!==null?P=P.withResumeToken(tt.EMPTY_BYTE_STRING,ie.min()).withLastLimboFreeSnapshotVersion(ie.min()):f.resumeToken.approximateByteSize()>0&&(P=P.withResumeToken(f.resumeToken,r)),s=s.insert(m,P),function(B,j,Q){return B.resumeToken.approximateByteSize()===0||j.snapshotVersion.toMicroseconds()-B.snapshotVersion.toMicroseconds()>=3e8?!0:Q.addedDocuments.size+Q.modifiedDocuments.size+Q.removedDocuments.size>0}(E,P,f)&&l.push(t.Ur.updateTargetData(i,P))});let c=fn(),d=ue();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&l.push(t.persistence.referenceDelegate.updateLimboDocument(i,f))}),l.push(xT(i,a,e.documentUpdates).next(f=>{c=f.Ps,d=f.Is})),!r.isEqual(ie.min())){const f=t.Ur.getLastRemoteSnapshotVersion(i).next(m=>t.Ur.setTargetsMetadata(i,i.currentSequenceNumber,r));l.push(f)}return F.waitFor(l).next(()=>a.apply(i)).next(()=>t.localDocuments.getLocalViewOfDocuments(i,c,d)).next(()=>c)}).then(i=>(t.os=s,i))}function xT(n,e,t){let r=ue(),s=ue();return t.forEach(i=>r=r.add(i)),e.getEntries(n,r).next(i=>{let a=fn();return t.forEach((l,c)=>{const d=i.get(l);c.isFoundDocument()!==d.isFoundDocument()&&(s=s.add(l)),c.isNoDocument()&&c.version.isEqual(ie.min())?(e.removeEntry(l,c.readTime),a=a.insert(l,c)):!d.isValidDocument()||c.version.compareTo(d.version)>0||c.version.compareTo(d.version)===0&&d.hasPendingWrites?(e.addEntry(c),a=a.insert(l,c)):G("LocalStore","Ignoring outdated watch update for ",l,". Current version:",d.version," Watch version:",c.version)}),{Ps:a,Is:s}})}function NT(n,e){const t=oe(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function OT(n,e){const t=oe(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return t.Ur.getTargetData(r,e).next(i=>i?(s=i,F.resolve(s)):t.Ur.allocateTargetId(r).next(a=>(s=new Dn(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.Ur.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=t.os.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.os=t.os.insert(r.targetId,r),t._s.set(e,r.targetId)),r})}async function gl(n,e,t){const r=oe(n),s=r.os.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,a=>r.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!ai(a))throw a;G("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}r.os=r.os.remove(e),r._s.delete(s.target)}function Ph(n,e,t){const r=oe(n);let s=ie.min(),i=ue();return r.persistence.runTransaction("Execute query","readwrite",a=>function(c,d,f){const m=oe(c),E=m._s.get(f);return E!==void 0?F.resolve(m.os.get(E)):m.Ur.getTargetData(d,f)}(r,a,qt(e)).next(l=>{if(l)return s=l.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(a,l.targetId).next(c=>{i=c})}).next(()=>r.ss.getDocumentsMatchingQuery(a,e,t?s:ie.min(),t?i:ue())).next(l=>(MT(r,RE(e),l),{documents:l,Ts:i})))}function MT(n,e,t){let r=n.us.get(e)||ie.min();t.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),n.us.set(e,r)}class Ch{constructor(){this.activeTargetIds=VE()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class LT{constructor(){this.so=new Ch,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,r){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Ch,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class kh{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){G("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){G("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */const st="WebChannelConnection";class jT extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const r=t.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+t.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(t,r,s,i,a){const l=Oa(),c=this.xo(t,r.toUriEncodedString());G("RestConnection",`Sending RPC '${t}' ${l}:`,c,s);const d={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(d,i,a),this.No(t,c,d,s).then(f=>(G("RestConnection",`Received RPC '${t}' ${l}: `,f),f),f=>{throw zr("RestConnection",`RPC '${t}' ${l} failed with error: `,f,"url: ",c,"request:",s),f})}Lo(t,r,s,i,a,l){return this.Mo(t,r,s,i,a)}Oo(t,r,s){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Zr}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((i,a)=>t[a]=i),s&&s.headers.forEach((i,a)=>t[a]=i)}xo(t,r){const s=UT[t];return`${this.Do}/v1/${r}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,r,s){const i=Oa();return new Promise((a,l)=>{const c=new bf;c.setWithCredentials(!0),c.listenOnce(Rf.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case zi.NO_ERROR:const f=c.getResponseJson();G(st,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(f)),a(f);break;case zi.TIMEOUT:G(st,`RPC '${e}' ${i} timed out`),l(new Y(L.DEADLINE_EXCEEDED,"Request time out"));break;case zi.HTTP_ERROR:const m=c.getStatus();if(G(st,`RPC '${e}' ${i} failed with status:`,m,"response text:",c.getResponseText()),m>0){let E=c.getResponseJson();Array.isArray(E)&&(E=E[0]);const P=E==null?void 0:E.error;if(P&&P.status&&P.message){const N=function(j){const Q=j.toLowerCase().replace(/_/g,"-");return Object.values(L).indexOf(Q)>=0?Q:L.UNKNOWN}(P.status);l(new Y(N,P.message))}else l(new Y(L.UNKNOWN,"Server responded with status "+c.getStatus()))}else l(new Y(L.UNAVAILABLE,"Connection failed."));break;default:re()}}finally{G(st,`RPC '${e}' ${i} completed.`)}});const d=JSON.stringify(s);G(st,`RPC '${e}' ${i} sending request:`,s),c.send(t,"POST",d,r,15)})}Bo(e,t,r){const s=Oa(),i=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=Cf(),l=Pf(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(c.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Oo(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const f=i.join("");G(st,`Creating RPC '${e}' stream ${s}: ${f}`,c);const m=a.createWebChannel(f,c);let E=!1,P=!1;const N=new BT({Io:j=>{P?G(st,`Not sending because RPC '${e}' stream ${s} is closed:`,j):(E||(G(st,`Opening RPC '${e}' stream ${s} transport.`),m.open(),E=!0),G(st,`RPC '${e}' stream ${s} sending:`,j),m.send(j))},To:()=>m.close()}),B=(j,Q,J)=>{j.listen(Q,X=>{try{J(X)}catch(W){setTimeout(()=>{throw W},0)}})};return B(m,Rs.EventType.OPEN,()=>{P||(G(st,`RPC '${e}' stream ${s} transport opened.`),N.yo())}),B(m,Rs.EventType.CLOSE,()=>{P||(P=!0,G(st,`RPC '${e}' stream ${s} transport closed`),N.So())}),B(m,Rs.EventType.ERROR,j=>{P||(P=!0,zr(st,`RPC '${e}' stream ${s} transport errored:`,j),N.So(new Y(L.UNAVAILABLE,"The operation could not be completed")))}),B(m,Rs.EventType.MESSAGE,j=>{var Q;if(!P){const J=j.data[0];Ae(!!J);const X=J,W=X.error||((Q=X[0])===null||Q===void 0?void 0:Q.error);if(W){G(st,`RPC '${e}' stream ${s} received error:`,W);const de=W.status;let _e=function(y){const w=Ue[y];if(w!==void 0)return ep(w)}(de),b=W.message;_e===void 0&&(_e=L.INTERNAL,b="Unknown error status: "+de+" with message "+W.message),P=!0,N.So(new Y(_e,b)),m.close()}else G(st,`RPC '${e}' stream ${s} received:`,J),N.bo(J)}}),B(l,Sf.STAT_EVENT,j=>{j.stat===ol.PROXY?G(st,`RPC '${e}' stream ${s} detected buffering proxy`):j.stat===ol.NOPROXY&&G(st,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{N.wo()},0),N}}function Ma(){return typeof document<"u"?document:null}/**
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
 */class dp{constructor(e,t,r=1e3,s=1.5,i=6e4){this.ui=e,this.timerId=t,this.ko=r,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),s=Math.max(0,t-r);s>0&&G("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
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
 */class fp{constructor(e,t,r,s,i,a,l,c){this.ui=e,this.Ho=r,this.Jo=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=l,this.listener=c,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new dp(e,t)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():t&&t.code===L.RESOURCE_EXHAUSTED?(dn(t.toString()),dn("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===L.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.Yo===t&&this.P_(r,s)},r=>{e(()=>{const s=new Y(L.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(s)})})}P_(e,t){const r=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{r(()=>this.I_(s))}),this.stream.onMessage(s=>{r(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return G("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget(()=>this.Yo===e?t():(G("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class $T extends fp{constructor(e,t,r,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}T_(e,t){return this.connection.Bo("Listen",e,t)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const t=eT(this.serializer,e),r=function(i){if(!("targetChange"in i))return ie.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?ie.min():a.readTime?Ht(a.readTime):ie.min()}(e);return this.listener.d_(t,r)}A_(e){const t={};t.database=ml(this.serializer),t.addTarget=function(i,a){let l;const c=a.target;if(l=ul(c)?{documents:rT(i,c)}:{query:sT(i,c)._t},l.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){l.resumeToken=rp(i,a.resumeToken);const d=dl(i,a.expectedCount);d!==null&&(l.expectedCount=d)}else if(a.snapshotVersion.compareTo(ie.min())>0){l.readTime=mo(i,a.snapshotVersion.toTimestamp());const d=dl(i,a.expectedCount);d!==null&&(l.expectedCount=d)}return l}(this.serializer,e);const r=oT(this.serializer,e);r&&(t.labels=r),this.a_(t)}R_(e){const t={};t.database=ml(this.serializer),t.removeTarget=e,this.a_(t)}}class qT extends fp{constructor(e,t,r,s,i,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,a),this.serializer=i}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,t){return this.connection.Bo("Write",e,t)}E_(e){return Ae(!!e.streamToken),this.lastStreamToken=e.streamToken,Ae(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){Ae(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const t=nT(e.writeResults,e.commitTime),r=Ht(e.commitTime);return this.listener.g_(r,t)}p_(){const e={};e.database=ml(this.serializer),this.a_(e)}m_(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>tT(this.serializer,r))};this.a_(t)}}/**
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
 */class HT extends class{}{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new Y(L.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,r,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.Mo(e,fl(t,r),s,i,a)).catch(i=>{throw i.name==="FirebaseError"?(i.code===L.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new Y(L.UNKNOWN,i.toString())})}Lo(e,t,r,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,l])=>this.connection.Lo(e,fl(t,r),s,a,l,i)).catch(a=>{throw a.name==="FirebaseError"?(a.code===L.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new Y(L.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class zT{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(dn(t),this.D_=!1):G("OnlineStateTracker",t)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
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
 */class WT{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(a=>{r.enqueueAndForget(async()=>{yr(this)&&(G("RemoteStore","Restarting streams for network reachability change."),await async function(c){const d=oe(c);d.L_.add(4),await ui(d),d.q_.set("Unknown"),d.L_.delete(4),await Ho(d)}(this))})}),this.q_=new zT(r,s)}}async function Ho(n){if(yr(n))for(const e of n.B_)await e(!0)}async function ui(n){for(const e of n.B_)await e(!1)}function pp(n,e){const t=oe(n);t.N_.has(e.targetId)||(t.N_.set(e.targetId,e),cc(t)?lc(t):ts(t).r_()&&ac(t,e))}function oc(n,e){const t=oe(n),r=ts(t);t.N_.delete(e),r.r_()&&mp(t,e),t.N_.size===0&&(r.r_()?r.o_():yr(t)&&t.q_.set("Unknown"))}function ac(n,e){if(n.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(ie.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}ts(n).A_(e)}function mp(n,e){n.Q_.xe(e),ts(n).R_(e)}function lc(n){n.Q_=new KE({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>n.N_.get(e)||null,tt:()=>n.datastore.serializer.databaseId}),ts(n).start(),n.q_.v_()}function cc(n){return yr(n)&&!ts(n).n_()&&n.N_.size>0}function yr(n){return oe(n).L_.size===0}function gp(n){n.Q_=void 0}async function KT(n){n.q_.set("Online")}async function GT(n){n.N_.forEach((e,t)=>{ac(n,e)})}async function QT(n,e){gp(n),cc(n)?(n.q_.M_(e),lc(n)):n.q_.set("Unknown")}async function JT(n,e,t){if(n.q_.set("Online"),e instanceof np&&e.state===2&&e.cause)try{await async function(s,i){const a=i.cause;for(const l of i.targetIds)s.N_.has(l)&&(await s.remoteSyncer.rejectListen(l,a),s.N_.delete(l),s.Q_.removeTarget(l))}(n,e)}catch(r){G("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await go(n,r)}else if(e instanceof Gi?n.Q_.Ke(e):e instanceof tp?n.Q_.He(e):n.Q_.We(e),!t.isEqual(ie.min()))try{const r=await hp(n.localStore);t.compareTo(r)>=0&&await function(i,a){const l=i.Q_.rt(a);return l.targetChanges.forEach((c,d)=>{if(c.resumeToken.approximateByteSize()>0){const f=i.N_.get(d);f&&i.N_.set(d,f.withResumeToken(c.resumeToken,a))}}),l.targetMismatches.forEach((c,d)=>{const f=i.N_.get(c);if(!f)return;i.N_.set(c,f.withResumeToken(tt.EMPTY_BYTE_STRING,f.snapshotVersion)),mp(i,c);const m=new Dn(f.target,c,d,f.sequenceNumber);ac(i,m)}),i.remoteSyncer.applyRemoteEvent(l)}(n,t)}catch(r){G("RemoteStore","Failed to raise snapshot:",r),await go(n,r)}}async function go(n,e,t){if(!ai(e))throw e;n.L_.add(1),await ui(n),n.q_.set("Offline"),t||(t=()=>hp(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{G("RemoteStore","Retrying IndexedDB access"),await t(),n.L_.delete(1),await Ho(n)})}function _p(n,e){return e().catch(t=>go(n,t,e))}async function zo(n){const e=oe(n),t=Hn(e);let r=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;YT(e);)try{const s=await NT(e.localStore,r);if(s===null){e.O_.length===0&&t.o_();break}r=s.batchId,XT(e,s)}catch(s){await go(e,s)}yp(e)&&vp(e)}function YT(n){return yr(n)&&n.O_.length<10}function XT(n,e){n.O_.push(e);const t=Hn(n);t.r_()&&t.V_&&t.m_(e.mutations)}function yp(n){return yr(n)&&!Hn(n).n_()&&n.O_.length>0}function vp(n){Hn(n).start()}async function ZT(n){Hn(n).p_()}async function ew(n){const e=Hn(n);for(const t of n.O_)e.m_(t.mutations)}async function tw(n,e,t){const r=n.O_.shift(),s=ec.from(r,e,t);await _p(n,()=>n.remoteSyncer.applySuccessfulWrite(s)),await zo(n)}async function nw(n,e){e&&Hn(n).V_&&await async function(r,s){if(function(a){return HE(a)&&a!==L.ABORTED}(s.code)){const i=r.O_.shift();Hn(r).s_(),await _p(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await zo(r)}}(n,e),yp(n)&&vp(n)}async function Dh(n,e){const t=oe(n);t.asyncQueue.verifyOperationInProgress(),G("RemoteStore","RemoteStore received new credentials");const r=yr(t);t.L_.add(3),await ui(t),r&&t.q_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.L_.delete(3),await Ho(t)}async function rw(n,e){const t=oe(n);e?(t.L_.delete(2),await Ho(t)):e||(t.L_.add(2),await ui(t),t.q_.set("Unknown"))}function ts(n){return n.K_||(n.K_=function(t,r,s){const i=oe(t);return i.w_(),new $T(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Eo:KT.bind(null,n),Ro:GT.bind(null,n),mo:QT.bind(null,n),d_:JT.bind(null,n)}),n.B_.push(async e=>{e?(n.K_.s_(),cc(n)?lc(n):n.q_.set("Unknown")):(await n.K_.stop(),gp(n))})),n.K_}function Hn(n){return n.U_||(n.U_=function(t,r,s){const i=oe(t);return i.w_(),new qT(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Eo:()=>Promise.resolve(),Ro:ZT.bind(null,n),mo:nw.bind(null,n),f_:ew.bind(null,n),g_:tw.bind(null,n)}),n.B_.push(async e=>{e?(n.U_.s_(),await zo(n)):(await n.U_.stop(),n.O_.length>0&&(G("RemoteStore",`Stopping write stream with ${n.O_.length} pending writes`),n.O_=[]))})),n.U_}/**
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
 */class uc{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Mn,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const a=Date.now()+r,l=new uc(e,t,a,s,i);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new Y(L.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function hc(n,e){if(dn("AsyncQueue",`${e}: ${n}`),ai(n))return new Y(L.UNAVAILABLE,`${e}: ${n}`);throw n}/**
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
 */class Ur{constructor(e){this.comparator=e?(t,r)=>e(t,r)||te.comparator(t.key,r.key):(t,r)=>te.comparator(t.key,r.key),this.keyedMap=Ss(),this.sortedSet=new Ne(this.comparator)}static emptySet(e){return new Ur(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Ur)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Ur;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
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
 */class Vh{constructor(){this.W_=new Ne(te.comparator)}track(e){const t=e.doc.key,r=this.W_.get(t);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(t,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(t):e.type===1&&r.type===2?this.W_=this.W_.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):re():this.W_=this.W_.insert(t,e)}G_(){const e=[];return this.W_.inorderTraversal((t,r)=>{e.push(r)}),e}}class Jr{constructor(e,t,r,s,i,a,l,c,d){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=l,this.excludesMetadataChanges=c,this.hasCachedResults=d}static fromInitialDocuments(e,t,r,s,i){const a=[];return t.forEach(l=>{a.push({type:0,doc:l})}),new Jr(e,t,Ur.emptySet(t),a,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Lo(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
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
 */class sw{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class iw{constructor(){this.queries=xh(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(t,r){const s=oe(t),i=s.queries;s.queries=xh(),i.forEach((a,l)=>{for(const c of l.j_)c.onError(r)})})(this,new Y(L.ABORTED,"Firestore shutting down"))}}function xh(){return new es(n=>$f(n),Lo)}async function ow(n,e){const t=oe(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.H_()&&e.J_()&&(r=2):(i=new sw,r=e.J_()?0:1);try{switch(r){case 0:i.z_=await t.onListen(s,!0);break;case 1:i.z_=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(a){const l=hc(a,`Initialization of query '${kr(e.query)}' failed`);return void e.onError(l)}t.queries.set(s,i),i.j_.push(e),e.Z_(t.onlineState),i.z_&&e.X_(i.z_)&&dc(t)}async function aw(n,e){const t=oe(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const a=i.j_.indexOf(e);a>=0&&(i.j_.splice(a,1),i.j_.length===0?s=e.J_()?0:1:!i.H_()&&e.J_()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function lw(n,e){const t=oe(n);let r=!1;for(const s of e){const i=s.query,a=t.queries.get(i);if(a){for(const l of a.j_)l.X_(s)&&(r=!0);a.z_=s}}r&&dc(t)}function cw(n,e,t){const r=oe(n),s=r.queries.get(e);if(s)for(const i of s.j_)i.onError(t);r.queries.delete(e)}function dc(n){n.Y_.forEach(e=>{e.next()})}var _l,Nh;(Nh=_l||(_l={})).ea="default",Nh.Cache="cache";class uw{constructor(e,t,r){this.query=e,this.ta=t,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new Jr(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.na?this.ia(e)&&(this.ta.next(e),t=!0):this.sa(e,this.onlineState)&&(this.oa(e),t=!0),this.ra=e,t}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let t=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),t=!0),t}sa(e,t){if(!e.fromCache||!this.J_())return!0;const r=t!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const t=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}oa(e){e=Jr.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==_l.Cache}}/**
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
 */class Ep{constructor(e){this.key=e}}class Tp{constructor(e){this.key=e}}class hw{constructor(e,t){this.query=e,this.Ta=t,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=ue(),this.mutatedKeys=ue(),this.Aa=qf(e),this.Ra=new Ur(this.Aa)}get Va(){return this.Ta}ma(e,t){const r=t?t.fa:new Vh,s=t?t.Ra:this.Ra;let i=t?t.mutatedKeys:this.mutatedKeys,a=s,l=!1;const c=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,d=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((f,m)=>{const E=s.get(f),P=Fo(this.query,m)?m:null,N=!!E&&this.mutatedKeys.has(E.key),B=!!P&&(P.hasLocalMutations||this.mutatedKeys.has(P.key)&&P.hasCommittedMutations);let j=!1;E&&P?E.data.isEqual(P.data)?N!==B&&(r.track({type:3,doc:P}),j=!0):this.ga(E,P)||(r.track({type:2,doc:P}),j=!0,(c&&this.Aa(P,c)>0||d&&this.Aa(P,d)<0)&&(l=!0)):!E&&P?(r.track({type:0,doc:P}),j=!0):E&&!P&&(r.track({type:1,doc:E}),j=!0,(c||d)&&(l=!0)),j&&(P?(a=a.add(P),i=B?i.add(f):i.delete(f)):(a=a.delete(f),i=i.delete(f)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const f=this.query.limitType==="F"?a.last():a.first();a=a.delete(f.key),i=i.delete(f.key),r.track({type:1,doc:f})}return{Ra:a,fa:r,ns:l,mutatedKeys:i}}ga(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const a=e.fa.G_();a.sort((f,m)=>function(P,N){const B=j=>{switch(j){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return re()}};return B(P)-B(N)}(f.type,m.type)||this.Aa(f.doc,m.doc)),this.pa(r),s=s!=null&&s;const l=t&&!s?this.ya():[],c=this.da.size===0&&this.current&&!s?1:0,d=c!==this.Ea;return this.Ea=c,a.length!==0||d?{snapshot:new Jr(this.query,e.Ra,i,a,e.mutatedKeys,c===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:l}:{wa:l}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Vh,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(t=>this.Ta=this.Ta.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ta=this.Ta.delete(t)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=ue(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const t=[];return e.forEach(r=>{this.da.has(r)||t.push(new Tp(r))}),this.da.forEach(r=>{e.has(r)||t.push(new Ep(r))}),t}ba(e){this.Ta=e.Ts,this.da=ue();const t=this.ma(e.documents);return this.applyChanges(t,!0)}Da(){return Jr.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class dw{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class fw{constructor(e){this.key=e,this.va=!1}}class pw{constructor(e,t,r,s,i,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new es(l=>$f(l),Lo),this.Ma=new Map,this.xa=new Set,this.Oa=new Ne(te.comparator),this.Na=new Map,this.La=new rc,this.Ba={},this.ka=new Map,this.qa=Qr.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function mw(n,e,t=!0){const r=Sp(n);let s;const i=r.Fa.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await wp(r,e,t,!0),s}async function gw(n,e){const t=Sp(n);await wp(t,e,!0,!1)}async function wp(n,e,t,r){const s=await OT(n.localStore,qt(e)),i=s.targetId,a=n.sharedClientState.addLocalQueryTarget(i,t);let l;return r&&(l=await _w(n,e,i,a==="current",s.resumeToken)),n.isPrimaryClient&&t&&pp(n.remoteStore,s),l}async function _w(n,e,t,r,s){n.Ka=(m,E,P)=>async function(B,j,Q,J){let X=j.view.ma(Q);X.ns&&(X=await Ph(B.localStore,j.query,!1).then(({documents:b})=>j.view.ma(b,X)));const W=J&&J.targetChanges.get(j.targetId),de=J&&J.targetMismatches.get(j.targetId)!=null,_e=j.view.applyChanges(X,B.isPrimaryClient,W,de);return Mh(B,j.targetId,_e.wa),_e.snapshot}(n,m,E,P);const i=await Ph(n.localStore,e,!0),a=new hw(e,i.Ts),l=a.ma(i.documents),c=ci.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),d=a.applyChanges(l,n.isPrimaryClient,c);Mh(n,t,d.wa);const f=new dw(e,t,a);return n.Fa.set(e,f),n.Ma.has(t)?n.Ma.get(t).push(e):n.Ma.set(t,[e]),d.snapshot}async function yw(n,e,t){const r=oe(n),s=r.Fa.get(e),i=r.Ma.get(s.targetId);if(i.length>1)return r.Ma.set(s.targetId,i.filter(a=>!Lo(a,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await gl(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),t&&oc(r.remoteStore,s.targetId),yl(r,s.targetId)}).catch(oi)):(yl(r,s.targetId),await gl(r.localStore,s.targetId,!0))}async function vw(n,e){const t=oe(n),r=t.Fa.get(e),s=t.Ma.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),oc(t.remoteStore,r.targetId))}async function Ew(n,e,t){const r=Sw(n);try{const s=await function(a,l){const c=oe(a),d=He.now(),f=l.reduce((P,N)=>P.add(N.key),ue());let m,E;return c.persistence.runTransaction("Locally write mutations","readwrite",P=>{let N=fn(),B=ue();return c.cs.getEntries(P,f).next(j=>{N=j,N.forEach((Q,J)=>{J.isValidDocument()||(B=B.add(Q))})}).next(()=>c.localDocuments.getOverlayedDocuments(P,N)).next(j=>{m=j;const Q=[];for(const J of l){const X=UE(J,m.get(J.key).overlayedDocument);X!=null&&Q.push(new Gn(J.key,X,Nf(X.value.mapValue),kt.exists(!0)))}return c.mutationQueue.addMutationBatch(P,d,Q,l)}).next(j=>{E=j;const Q=j.applyToLocalDocumentSet(m,B);return c.documentOverlayCache.saveOverlays(P,j.batchId,Q)})}).then(()=>({batchId:E.batchId,changes:zf(m)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(a,l,c){let d=a.Ba[a.currentUser.toKey()];d||(d=new Ne(Ee)),d=d.insert(l,c),a.Ba[a.currentUser.toKey()]=d}(r,s.batchId,t),await hi(r,s.changes),await zo(r.remoteStore)}catch(s){const i=hc(s,"Failed to persist write");t.reject(i)}}async function Ip(n,e){const t=oe(n);try{const r=await VT(t.localStore,e);e.targetChanges.forEach((s,i)=>{const a=t.Na.get(i);a&&(Ae(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?a.va=!0:s.modifiedDocuments.size>0?Ae(a.va):s.removedDocuments.size>0&&(Ae(a.va),a.va=!1))}),await hi(t,r,e)}catch(r){await oi(r)}}function Oh(n,e,t){const r=oe(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Fa.forEach((i,a)=>{const l=a.view.Z_(e);l.snapshot&&s.push(l.snapshot)}),function(a,l){const c=oe(a);c.onlineState=l;let d=!1;c.queries.forEach((f,m)=>{for(const E of m.j_)E.Z_(l)&&(d=!0)}),d&&dc(c)}(r.eventManager,e),s.length&&r.Ca.d_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function Tw(n,e,t){const r=oe(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Na.get(e),i=s&&s.key;if(i){let a=new Ne(te.comparator);a=a.insert(i,lt.newNoDocument(i,ie.min()));const l=ue().add(i),c=new $o(ie.min(),new Map,new Ne(Ee),a,l);await Ip(r,c),r.Oa=r.Oa.remove(i),r.Na.delete(e),fc(r)}else await gl(r.localStore,e,!1).then(()=>yl(r,e,t)).catch(oi)}async function ww(n,e){const t=oe(n),r=e.batch.batchId;try{const s=await DT(t.localStore,e);bp(t,r,null),Ap(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await hi(t,s)}catch(s){await oi(s)}}async function Iw(n,e,t){const r=oe(n);try{const s=await function(a,l){const c=oe(a);return c.persistence.runTransaction("Reject batch","readwrite-primary",d=>{let f;return c.mutationQueue.lookupMutationBatch(d,l).next(m=>(Ae(m!==null),f=m.keys(),c.mutationQueue.removeMutationBatch(d,m))).next(()=>c.mutationQueue.performConsistencyCheck(d)).next(()=>c.documentOverlayCache.removeOverlaysForBatchId(d,f,l)).next(()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,f)).next(()=>c.localDocuments.getDocuments(d,f))})}(r.localStore,e);bp(r,e,t),Ap(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await hi(r,s)}catch(s){await oi(s)}}function Ap(n,e){(n.ka.get(e)||[]).forEach(t=>{t.resolve()}),n.ka.delete(e)}function bp(n,e,t){const r=oe(n);let s=r.Ba[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.Ba[r.currentUser.toKey()]=s}}function yl(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Ma.get(e))n.Fa.delete(r),t&&n.Ca.$a(r,t);n.Ma.delete(e),n.isPrimaryClient&&n.La.gr(e).forEach(r=>{n.La.containsKey(r)||Rp(n,r)})}function Rp(n,e){n.xa.delete(e.path.canonicalString());const t=n.Oa.get(e);t!==null&&(oc(n.remoteStore,t),n.Oa=n.Oa.remove(e),n.Na.delete(t),fc(n))}function Mh(n,e,t){for(const r of t)r instanceof Ep?(n.La.addReference(r.key,e),Aw(n,r)):r instanceof Tp?(G("SyncEngine","Document no longer in limbo: "+r.key),n.La.removeReference(r.key,e),n.La.containsKey(r.key)||Rp(n,r.key)):re()}function Aw(n,e){const t=e.key,r=t.path.canonicalString();n.Oa.get(t)||n.xa.has(r)||(G("SyncEngine","New document in limbo: "+t),n.xa.add(r),fc(n))}function fc(n){for(;n.xa.size>0&&n.Oa.size<n.maxConcurrentLimboResolutions;){const e=n.xa.values().next().value;n.xa.delete(e);const t=new te(Ve.fromString(e)),r=n.qa.next();n.Na.set(r,new fw(t)),n.Oa=n.Oa.insert(t,r),pp(n.remoteStore,new Dn(qt(jf(t.path)),r,"TargetPurposeLimboResolution",Kl.oe))}}async function hi(n,e,t){const r=oe(n),s=[],i=[],a=[];r.Fa.isEmpty()||(r.Fa.forEach((l,c)=>{a.push(r.Ka(c,e,t).then(d=>{var f;if((d||t)&&r.isPrimaryClient){const m=d?!d.fromCache:(f=t==null?void 0:t.targetChanges.get(c.targetId))===null||f===void 0?void 0:f.current;r.sharedClientState.updateQueryState(c.targetId,m?"current":"not-current")}if(d){s.push(d);const m=ic.Wi(c.targetId,d);i.push(m)}}))}),await Promise.all(a),r.Ca.d_(s),await async function(c,d){const f=oe(c);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>F.forEach(d,E=>F.forEach(E.$i,P=>f.persistence.referenceDelegate.addReference(m,E.targetId,P)).next(()=>F.forEach(E.Ui,P=>f.persistence.referenceDelegate.removeReference(m,E.targetId,P)))))}catch(m){if(!ai(m))throw m;G("LocalStore","Failed to update sequence numbers: "+m)}for(const m of d){const E=m.targetId;if(!m.fromCache){const P=f.os.get(E),N=P.snapshotVersion,B=P.withLastLimboFreeSnapshotVersion(N);f.os=f.os.insert(E,B)}}}(r.localStore,i))}async function bw(n,e){const t=oe(n);if(!t.currentUser.isEqual(e)){G("SyncEngine","User change. New user:",e.toKey());const r=await up(t.localStore,e);t.currentUser=e,function(i,a){i.ka.forEach(l=>{l.forEach(c=>{c.reject(new Y(L.CANCELLED,a))})}),i.ka.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await hi(t,r.hs)}}function Rw(n,e){const t=oe(n),r=t.Na.get(e);if(r&&r.va)return ue().add(r.key);{let s=ue();const i=t.Ma.get(e);if(!i)return s;for(const a of i){const l=t.Fa.get(a);s=s.unionWith(l.view.Va)}return s}}function Sp(n){const e=oe(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Ip.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=Rw.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=Tw.bind(null,e),e.Ca.d_=lw.bind(null,e.eventManager),e.Ca.$a=cw.bind(null,e.eventManager),e}function Sw(n){const e=oe(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=ww.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=Iw.bind(null,e),e}class _o{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=qo(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return kT(this.persistence,new PT,e.initialUser,this.serializer)}Ga(e){return new bT(sc.Zr,this.serializer)}Wa(e){return new LT}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}_o.provider={build:()=>new _o};class vl{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Oh(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=bw.bind(null,this.syncEngine),await rw(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new iw}()}createDatastore(e){const t=qo(e.databaseInfo.databaseId),r=function(i){return new jT(i)}(e.databaseInfo);return function(i,a,l,c){return new HT(i,a,l,c)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,s,i,a,l){return new WT(r,s,i,a,l)}(this.localStore,this.datastore,e.asyncQueue,t=>Oh(this.syncEngine,t,0),function(){return kh.D()?new kh:new FT}())}createSyncEngine(e,t){return function(s,i,a,l,c,d,f){const m=new pw(s,i,a,l,c,d);return f&&(m.Qa=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const i=oe(s);G("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await ui(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}vl.provider={build:()=>new vl};/**
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
 */class Pw{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):dn("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
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
 */class Cw{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=s,this.user=it.UNAUTHENTICATED,this.clientId=Df.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async a=>{G("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(G("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Mn;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=hc(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function La(n,e){n.asyncQueue.verifyOperationInProgress(),G("FirestoreClient","Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async s=>{r.isEqual(s)||(await up(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function Lh(n,e){n.asyncQueue.verifyOperationInProgress();const t=await kw(n);G("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>Dh(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,s)=>Dh(e.remoteStore,s)),n._onlineComponents=e}async function kw(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){G("FirestoreClient","Using user provided OfflineComponentProvider");try{await La(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===L.FAILED_PRECONDITION||s.code===L.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;zr("Error using user provided cache. Falling back to memory cache: "+t),await La(n,new _o)}}else G("FirestoreClient","Using default OfflineComponentProvider"),await La(n,new _o);return n._offlineComponents}async function Pp(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(G("FirestoreClient","Using user provided OnlineComponentProvider"),await Lh(n,n._uninitializedComponentsProvider._online)):(G("FirestoreClient","Using default OnlineComponentProvider"),await Lh(n,new vl))),n._onlineComponents}function Dw(n){return Pp(n).then(e=>e.syncEngine)}async function Vw(n){const e=await Pp(n),t=e.eventManager;return t.onListen=mw.bind(null,e.syncEngine),t.onUnlisten=yw.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=gw.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=vw.bind(null,e.syncEngine),t}function xw(n,e,t={}){const r=new Mn;return n.asyncQueue.enqueueAndForget(async()=>function(i,a,l,c,d){const f=new Pw({next:E=>{f.Za(),a.enqueueAndForget(()=>aw(i,m)),E.fromCache&&c.source==="server"?d.reject(new Y(L.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(E)},error:E=>d.reject(E)}),m=new uw(l,f,{includeMetadataChanges:!0,_a:!0});return ow(i,m)}(await Vw(n),n.asyncQueue,e,t,r)),r.promise}/**
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
 */function kp(n,e,t){if(!t)throw new Y(L.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function Nw(n,e,t,r){if(e===!0&&r===!0)throw new Y(L.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Uh(n){if(!te.isDocumentKey(n))throw new Y(L.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Bh(n){if(te.isDocumentKey(n))throw new Y(L.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function pc(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":re()}function fr(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new Y(L.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=pc(n);throw new Y(L.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
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
 */class jh{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new Y(L.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new Y(L.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Nw("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Cp((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new Y(L.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new Y(L.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new Y(L.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Wo{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new jh({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new Y(L.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new Y(L.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new jh(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Kv;switch(r.type){case"firstParty":return new Yv(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new Y(L.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=Fh.get(t);r&&(G("ComponentProvider","Removing Datastore"),Fh.delete(t),r.terminate())}(this),Promise.resolve()}}function Ow(n,e,t,r={}){var s;const i=(n=fr(n,Wo))._getSettings(),a=`${e}:${t}`;if(i.host!=="firestore.googleapis.com"&&i.host!==a&&zr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),n._setSettings(Object.assign(Object.assign({},i),{host:a,ssl:!1})),r.mockUserToken){let l,c;if(typeof r.mockUserToken=="string")l=r.mockUserToken,c=it.MOCK_USER;else{l=Ty(r.mockUserToken,(s=n._app)===null||s===void 0?void 0:s.options.projectId);const d=r.mockUserToken.sub||r.mockUserToken.user_id;if(!d)throw new Y(L.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");c=new it(d)}n._authCredentials=new Gv(new kf(l,c))}}/**
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
 */class Ko{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Ko(this.firestore,e,this._query)}}class Mt{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Ln(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Mt(this.firestore,e,this._key)}}class Ln extends Ko{constructor(e,t,r){super(e,t,jf(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Mt(this.firestore,null,new te(e))}withConverter(e){return new Ln(this.firestore,e,this._path)}}function Qn(n,e,...t){if(n=yt(n),kp("collection","path",e),n instanceof Wo){const r=Ve.fromString(e,...t);return Bh(r),new Ln(n,null,r)}{if(!(n instanceof Mt||n instanceof Ln))throw new Y(L.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(Ve.fromString(e,...t));return Bh(r),new Ln(n.firestore,null,r)}}function pn(n,e,...t){if(n=yt(n),arguments.length===1&&(e=Df.newId()),kp("doc","path",e),n instanceof Wo){const r=Ve.fromString(e,...t);return Uh(r),new Mt(n,null,new te(r))}{if(!(n instanceof Mt||n instanceof Ln))throw new Y(L.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(Ve.fromString(e,...t));return Uh(r),new Mt(n.firestore,n instanceof Ln?n.converter:null,new te(r))}}/**
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
 */class $h{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new dp(this,"async_queue_retry"),this.Vu=()=>{const r=Ma();r&&G("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const t=Ma();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=Ma();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new Mn;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!ai(e))throw e;G("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const s=function(a){let l=a.message||"";return a.stack&&(l=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),l}(r);throw dn("INTERNAL UNHANDLED ERROR: ",s),r}).then(r=>(this.du=!1,r))));return this.mu=t,t}enqueueAfterDelay(e,t,r){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const s=uc.createAndSchedule(this,e,t,r,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&re()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}class di extends Wo{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new $h,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new $h(e),this._firestoreClient=void 0,await e}}}function Mw(n,e){const t=typeof n=="object"?n:Tf(),r=typeof n=="string"?n:e||"(default)",s=zl(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=vy("firestore");i&&Ow(s,...i)}return s}function mc(n){if(n._terminated)throw new Y(L.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||Lw(n),n._firestoreClient}function Lw(n){var e,t,r;const s=n._freezeSettings(),i=function(l,c,d,f){return new uE(l,c,d,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Cp(f.experimentalLongPollingOptions),f.useFetchStreams)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,s);n._componentsProvider||!((t=s.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),n._firestoreClient=new Cw(n._authCredentials,n._appCheckCredentials,n._queue,i,n._componentsProvider&&function(l){const c=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(c),_online:c}}(n._componentsProvider))}/**
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
 */class Yr{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Yr(tt.fromBase64String(e))}catch(t){throw new Y(L.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Yr(tt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
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
 */class Go{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new Y(L.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Ye(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
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
 */class _c{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new Y(L.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new Y(L.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return Ee(this._lat,e._lat)||Ee(this._long,e._long)}}/**
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
 */const Fw=/^__.*__$/;class Uw{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new Gn(e,this.data,this.fieldMask,t,this.fieldTransforms):new li(e,this.data,t,this.fieldTransforms)}}class Dp{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new Gn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function Vp(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw re()}}class vc{constructor(e,t,r,s,i,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.vu(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new vc(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Fu({path:r,xu:!1});return s.Ou(e),s}Nu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Fu({path:r,xu:!1});return s.vu(),s}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return yo(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(Vp(this.Cu)&&Fw.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class Bw{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||qo(e)}Qu(e,t,r,s=!1){return new vc({Cu:e,methodName:t,qu:r,path:Ye.emptyPath(),xu:!1,ku:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function xp(n){const e=n._freezeSettings(),t=qo(n._databaseId);return new Bw(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Np(n,e,t,r,s,i={}){const a=n.Qu(i.merge||i.mergeFields?2:0,e,t,s);Ec("Data must be an object, but it was:",a,r);const l=Op(r,a);let c,d;if(i.merge)c=new Ct(a.fieldMask),d=a.fieldTransforms;else if(i.mergeFields){const f=[];for(const m of i.mergeFields){const E=El(e,m,t);if(!a.contains(E))throw new Y(L.INVALID_ARGUMENT,`Field '${E}' is specified in your field mask but missing from your input data.`);Lp(f,E)||f.push(E)}c=new Ct(f),d=a.fieldTransforms.filter(m=>c.covers(m.field))}else c=null,d=a.fieldTransforms;return new Uw(new Tt(l),c,d)}class Qo extends gc{_toFieldTransform(e){if(e.Cu!==2)throw e.Cu===1?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Qo}}function jw(n,e,t,r){const s=n.Qu(1,e,t);Ec("Data must be an object, but it was:",s,r);const i=[],a=Tt.empty();_r(r,(c,d)=>{const f=Tc(e,c,t);d=yt(d);const m=s.Nu(f);if(d instanceof Qo)i.push(f);else{const E=Jo(d,m);E!=null&&(i.push(f),a.set(f,E))}});const l=new Ct(i);return new Dp(a,l,s.fieldTransforms)}function $w(n,e,t,r,s,i){const a=n.Qu(1,e,t),l=[El(e,r,t)],c=[s];if(i.length%2!=0)throw new Y(L.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let E=0;E<i.length;E+=2)l.push(El(e,i[E])),c.push(i[E+1]);const d=[],f=Tt.empty();for(let E=l.length-1;E>=0;--E)if(!Lp(d,l[E])){const P=l[E];let N=c[E];N=yt(N);const B=a.Nu(P);if(N instanceof Qo)d.push(P);else{const j=Jo(N,B);j!=null&&(d.push(P),f.set(P,j))}}const m=new Ct(d);return new Dp(f,m,a.fieldTransforms)}function Jo(n,e){if(Mp(n=yt(n)))return Ec("Unsupported field value:",e,n),Op(n,e);if(n instanceof gc)return function(r,s){if(!Vp(s.Cu))throw s.Bu(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Bu(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,s){const i=[];let a=0;for(const l of r){let c=Jo(l,s.Lu(a));c==null&&(c={nullValue:"NULL_VALUE"}),i.push(c),a++}return{arrayValue:{values:i}}}(n,e)}return function(r,s){if((r=yt(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return xE(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=He.fromDate(r);return{timestampValue:mo(s.serializer,i)}}if(r instanceof He){const i=new He(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:mo(s.serializer,i)}}if(r instanceof _c)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Yr)return{bytesValue:rp(s.serializer,r._byteString)};if(r instanceof Mt){const i=s.databaseId,a=r.firestore._databaseId;if(!a.isEqual(i))throw s.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:nc(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof yc)return function(a,l){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(c=>{if(typeof c!="number")throw l.Bu("VectorValues must only contain numeric values.");return Zl(l.serializer,c)})}}}}}}(r,s);throw s.Bu(`Unsupported field value: ${pc(r)}`)}(n,e)}function Op(n,e){const t={};return Vf(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):_r(n,(r,s)=>{const i=Jo(s,e.Mu(r));i!=null&&(t[r]=i)}),{mapValue:{fields:t}}}function Mp(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof He||n instanceof _c||n instanceof Yr||n instanceof Mt||n instanceof gc||n instanceof yc)}function Ec(n,e,t){if(!Mp(t)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(t)){const r=pc(t);throw r==="an object"?e.Bu(n+" a custom object"):e.Bu(n+" "+r)}}function El(n,e,t){if((e=yt(e))instanceof Go)return e._internalPath;if(typeof e=="string")return Tc(n,e);throw yo("Field path arguments must be of type string or ",n,!1,void 0,t)}const qw=new RegExp("[~\\*/\\[\\]]");function Tc(n,e,t){if(e.search(qw)>=0)throw yo(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Go(...e.split("."))._internalPath}catch{throw yo(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function yo(n,e,t,r,s){const i=r&&!r.isEmpty(),a=s!==void 0;let l=`Function ${e}() called with invalid data`;t&&(l+=" (via `toFirestore()`)"),l+=". ";let c="";return(i||a)&&(c+=" (found",i&&(c+=` in field ${r}`),a&&(c+=` in document ${s}`),c+=")"),new Y(L.INVALID_ARGUMENT,l+n+c)}function Lp(n,e){return n.some(t=>t.isEqual(e))}/**
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
 */class Fp{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Mt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Hw(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(Up("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class Hw extends Fp{data(){return super.data()}}function Up(n,e){return typeof e=="string"?Tc(n,e):e instanceof Go?e._internalPath:e._delegate._internalPath}/**
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
 */function zw(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new Y(L.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Ww{convertValue(e,t="none"){switch(dr(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Fe(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(hr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw re()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return _r(e,(s,i)=>{r[s]=this.convertValue(i,t)}),r}convertVectorValue(e){var t,r,s;const i=(s=(r=(t=e.fields)===null||t===void 0?void 0:t.value.arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(a=>Fe(a.doubleValue));return new yc(i)}convertGeoPoint(e){return new _c(Fe(e.latitude),Fe(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Ql(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Js(e));default:return null}}convertTimestamp(e){const t=qn(e);return new He(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=Ve.fromString(e);Ae(cp(r));const s=new Ys(r.get(1),r.get(3)),i=new te(r.popFirst(5));return s.isEqual(t)||dn(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
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
 */class Ui{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Kw extends Fp{constructor(e,t,r,s,i,a){super(e,t,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Qi(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Up("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class Qi extends Kw{data(e={}){return super.data(e)}}class Gw{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Ui(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new Qi(this._firestore,this._userDataWriter,r.key,r,new Ui(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new Y(L.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(l=>{const c=new Qi(s._firestore,s._userDataWriter,l.doc.key,l.doc,new Ui(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);return l.doc,{type:"added",doc:c,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(l=>i||l.type!==3).map(l=>{const c=new Qi(s._firestore,s._userDataWriter,l.doc.key,l.doc,new Ui(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);let d=-1,f=-1;return l.type!==0&&(d=a.indexOf(l.doc.key),a=a.delete(l.doc.key)),l.type!==1&&(a=a.add(l.doc),f=a.indexOf(l.doc.key)),{type:Qw(l.type),doc:c,oldIndex:d,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function Qw(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return re()}}class Jw extends Ww{constructor(e){super(),this.firestore=e}convertBytes(e){return new Yr(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Mt(this.firestore,null,t)}}function ns(n){n=fr(n,Ko);const e=fr(n.firestore,di),t=mc(e),r=new Jw(e);return zw(n._query),xw(t,n._query).then(s=>new Gw(e,r,n,s))}function rs(n,e,t){n=fr(n,Mt);const r=fr(n.firestore,di),s=Bp(n.converter,e,t);return wc(r,[Np(xp(r),"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,kt.none())])}function Tl(n){return wc(fr(n.firestore,di),[new jo(n._key,kt.none())])}function wc(n,e){return function(r,s){const i=new Mn;return r.asyncQueue.enqueueAndForget(async()=>Ew(await Dw(r),s,i)),i.promise}(mc(n),e)}/**
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
 */class Yw{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=xp(e)}set(e,t,r){this._verifyNotCommitted();const s=Fa(e,this._firestore),i=Bp(s.converter,t,r),a=Np(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(a.toMutation(s._key,kt.none())),this}update(e,t,r,...s){this._verifyNotCommitted();const i=Fa(e,this._firestore);let a;return a=typeof(t=yt(t))=="string"||t instanceof Go?$w(this._dataReader,"WriteBatch.update",i._key,t,r,s):jw(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(a.toMutation(i._key,kt.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=Fa(e,this._firestore);return this._mutations=this._mutations.concat(new jo(t._key,kt.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new Y(L.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function Fa(n,e){if((n=yt(n)).firestore!==e)throw new Y(L.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
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
 */function jp(n){return mc(n=fr(n,di)),new Yw(n,e=>wc(n,e))}(function(e,t=!0){(function(s){Zr=s})(Xr),Hr(new cr("firestore",(r,{instanceIdentifier:s,options:i})=>{const a=r.getProvider("app").getImmediate(),l=new di(new Qv(r.getProvider("auth-internal")),new Zv(r.getProvider("app-check-internal")),function(d,f){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new Y(L.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Ys(d.options.projectId,f)}(a,s),a);return i=Object.assign({useFetchStreams:t},i),l._setSettings(i),l},"PUBLIC").setMultipleInstances(!0)),On(ah,"4.7.3",e),On(ah,"4.7.3","esm2017")})();function Ic(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(n);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(n,r[s])&&(t[r[s]]=n[r[s]]);return t}function $p(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Xw=$p,qp=new si("auth","Firebase",$p());/**
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
 */const vo=new ql("@firebase/auth");function Zw(n,...e){vo.logLevel<=he.WARN&&vo.warn(`Auth (${Xr}): ${n}`,...e)}function Ji(n,...e){vo.logLevel<=he.ERROR&&vo.error(`Auth (${Xr}): ${n}`,...e)}/**
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
 */function mn(n,...e){throw Ac(n,...e)}function zt(n,...e){return Ac(n,...e)}function Hp(n,e,t){const r=Object.assign(Object.assign({},Xw()),{[e]:t});return new si("auth","Firebase",r).create(e,{appName:n.name})}function Fn(n){return Hp(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Ac(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return qp.create(n,...e)}function ne(n,e,...t){if(!n)throw Ac(e,...t)}function sn(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Ji(e),new Error(e)}function gn(n,e){n||sn(e)}/**
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
 */class fi{constructor(e,t){this.shortDelay=e,this.longDelay=t,gn(t>e,"Short delay should be less than long delay!"),this.isMobile=wy()||Ry()}get(){return tI()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function bc(n,e){gn(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class zp{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;sn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;sn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;sn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const sI=new fi(3e4,6e4);function Yo(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function ss(n,e,t,r,s={}){return Wp(n,s,async()=>{let i={},a={};r&&(e==="GET"?a=r:i={body:JSON.stringify(r)});const l=ii(Object.assign({key:n.config.apiKey},a)).slice(1),c=await n._getAdditionalHeaders();c["Content-Type"]="application/json",n.languageCode&&(c["X-Firebase-Locale"]=n.languageCode);const d=Object.assign({method:e,headers:c},i);return Ay()||(d.referrerPolicy="no-referrer"),zp.fetch()(Gp(n,n.config.apiHost,t,l),d)})}async function Wp(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},rI),e);try{const s=new iI(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const a=await i.json();if("needConfirmation"in a)throw Bi(n,"account-exists-with-different-credential",a);if(i.ok&&!("errorMessage"in a))return a;{const l=i.ok?a.errorMessage:a.error.message,[c,d]=l.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Bi(n,"credential-already-in-use",a);if(c==="EMAIL_EXISTS")throw Bi(n,"email-already-in-use",a);if(c==="USER_DISABLED")throw Bi(n,"user-disabled",a);const f=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw Hp(n,f,d);mn(n,f)}}catch(s){if(s instanceof yn)throw s;mn(n,"network-request-failed",{message:String(s)})}}async function Kp(n,e,t,r,s={}){const i=await ss(n,e,t,r,s);return"mfaPendingCredential"in i&&mn(n,"multi-factor-auth-required",{_serverResponse:i}),i}function Gp(n,e,t,r){const s=`${e}${t}?${r}`;return n.config.emulator?bc(n.config,s):`${n.config.apiScheme}://${s}`}class iI{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(zt(this.auth,"network-request-failed")),sI.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function Bi(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=zt(n,e,r);return s.customData._tokenResponse=t,s}/**
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
 */async function oI(n,e){return ss(n,"POST","/v1/accounts:delete",e)}async function Qp(n,e){return ss(n,"POST","/v1/accounts:lookup",e)}/**
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
 */function Bs(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function aI(n,e=!1){const t=yt(n),r=await t.getIdToken(e),s=Rc(r);ne(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,a=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Bs(Ua(s.auth_time)),issuedAtTime:Bs(Ua(s.iat)),expirationTime:Bs(Ua(s.exp)),signInProvider:a||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Ua(n){return Number(n)*1e3}function Rc(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Ji("JWT malformed, contained fewer than 3 sections"),null;try{const s=pf(t);return s?JSON.parse(s):(Ji("Failed to decode base64 JWT payload"),null)}catch(s){return Ji("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Hh(n){const e=Rc(n);return ne(e,"internal-error"),ne(typeof e.exp<"u","internal-error"),ne(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function ti(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof yn&&lI(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function lI({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
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
 */async function Eo(n){var e;const t=n.auth,r=await n.getIdToken(),s=await ti(n,Qp(t,{idToken:r}));ne(s==null?void 0:s.users.length,t,"internal-error");const i=s.users[0];n._notifyReloadListener(i);const a=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?Jp(i.providerUserInfo):[],l=hI(n.providerData,a),c=n.isAnonymous,d=!(n.email&&i.passwordHash)&&!(l!=null&&l.length),f=c?d:!1,m={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:l,metadata:new Il(i.createdAt,i.lastLoginAt),isAnonymous:f};Object.assign(n,m)}async function uI(n){const e=yt(n);await Eo(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function hI(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Jp(n){return n.map(e=>{var{providerId:t}=e,r=Ic(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
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
 */async function dI(n,e){const t=await Wp(n,{},async()=>{const r=ii({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,a=Gp(n,s,"/v1/token",`key=${i}`),l=await n._getAdditionalHeaders();return l["Content-Type"]="application/x-www-form-urlencoded",zp.fetch()(a,{method:"POST",headers:l,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function fI(n,e){return ss(n,"POST","/v2/accounts:revokeToken",Yo(n,e))}/**
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
 */class Br{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ne(e.idToken,"internal-error"),ne(typeof e.idToken<"u","internal-error"),ne(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Hh(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){ne(e.length!==0,"internal-error");const t=Hh(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(ne(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await dI(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,a=new Br;return r&&(ne(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(ne(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),i&&(ne(typeof i=="number","internal-error",{appName:e}),a.expirationTime=i),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Br,this.toJSON())}_performRefresh(){return sn("not implemented")}}/**
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
 */function An(n,e){ne(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class on{constructor(e){var{uid:t,auth:r,stsTokenManager:s}=e,i=Ic(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new cI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Il(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await ti(this,this.stsTokenManager.getToken(this.auth,e));return ne(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return aI(this,e)}reload(){return uI(this)}_assign(e){this!==e&&(ne(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new on(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){ne(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await Eo(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(rn(this.auth.app))return Promise.reject(Fn(this.auth));const e=await this.getIdToken();return await ti(this,oI(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,s,i,a,l,c,d,f;const m=(r=t.displayName)!==null&&r!==void 0?r:void 0,E=(s=t.email)!==null&&s!==void 0?s:void 0,P=(i=t.phoneNumber)!==null&&i!==void 0?i:void 0,N=(a=t.photoURL)!==null&&a!==void 0?a:void 0,B=(l=t.tenantId)!==null&&l!==void 0?l:void 0,j=(c=t._redirectEventId)!==null&&c!==void 0?c:void 0,Q=(d=t.createdAt)!==null&&d!==void 0?d:void 0,J=(f=t.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:X,emailVerified:W,isAnonymous:de,providerData:_e,stsTokenManager:b}=t;ne(X&&b,e,"internal-error");const g=Br.fromJSON(this.name,b);ne(typeof X=="string",e,"internal-error"),An(m,e.name),An(E,e.name),ne(typeof W=="boolean",e,"internal-error"),ne(typeof de=="boolean",e,"internal-error"),An(P,e.name),An(N,e.name),An(B,e.name),An(j,e.name),An(Q,e.name),An(J,e.name);const y=new on({uid:X,auth:e,email:E,emailVerified:W,displayName:m,isAnonymous:de,photoURL:N,phoneNumber:P,tenantId:B,stsTokenManager:g,createdAt:Q,lastLoginAt:J});return _e&&Array.isArray(_e)&&(y.providerData=_e.map(w=>Object.assign({},w))),j&&(y._redirectEventId=j),y}static async _fromIdTokenResponse(e,t,r=!1){const s=new Br;s.updateFromServerResponse(t);const i=new on({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await Eo(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];ne(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Jp(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),l=new Br;l.updateFromIdToken(r);const c=new on({uid:s.localId,auth:e,stsTokenManager:l,isAnonymous:a}),d={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Il(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(c,d),c}}/**
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
 */const zh=new Map;function an(n){gn(n instanceof Function,"Expected a class definition");let e=zh.get(n);return e?(gn(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,zh.set(n,e),e)}/**
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
 */function Yi(n,e,t){return`firebase:${n}:${e}:${t}`}class jr{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Yi(this.userKey,s.apiKey,i),this.fullPersistenceKey=Yi("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?on._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new jr(an(Wh),e,r);const s=(await Promise.all(t.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d);let i=s[0]||an(Wh);const a=Yi(r,e.config.apiKey,e.name);let l=null;for(const d of t)try{const f=await d._get(a);if(f){const m=on._fromJSON(e,f);d!==i&&(l=m),i=d;break}}catch{}const c=s.filter(d=>d._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new jr(i,e,r):(i=c[0],l&&await i._set(a,l.toJSON()),await Promise.all(t.map(async d=>{if(d!==i)try{await d._remove(a)}catch{}})),new jr(i,e,r))}}/**
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
 */function om(n,e=[]){let t;switch(n){case"Browser":t=Kh(ut());break;case"Worker":t=`${Kh(ut())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Xr}/${r}`}/**
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
 */async function _I(n,e={}){return ss(n,"GET","/v2/passwordPolicy",Yo(n,e))}/**
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
 */class EI{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Gh(this),this.idTokenSubscription=new Gh(this),this.beforeStateQueue=new gI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=qp,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=an(t)),this._initializationPromise=this.queue(async()=>{var r,s;if(!this._deleted&&(this.persistenceManager=await jr.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Qp(this,{idToken:e}),r=await on._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(rn(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,l=s==null?void 0:s._redirectEventId,c=await this.tryRedirectSignIn(e);(!a||a===l)&&(c!=null&&c.user)&&(s=c.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(a){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return ne(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await Eo(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=nI()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(rn(this.app))return Promise.reject(Fn(this));const t=e?yt(e):null;return t&&ne(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&ne(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return rn(this.app)?Promise.reject(Fn(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return rn(this.app)?Promise.reject(Fn(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(an(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await _I(this),t=new vI(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new si("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await fI(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&an(e)||this._popupRedirectResolver;ne(t,this,"argument-error"),this.redirectPersistenceManager=await jr.create(this,[an(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let a=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(ne(l,this,"internal-error"),l.then(()=>{a||i(this.currentUser)}),typeof t=="function"){const c=e.addObserver(t,r,s);return()=>{a=!0,c()}}else{const c=e.addObserver(t);return()=>{a=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ne(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=om(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(t["X-Firebase-AppCheck"]=s),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&Zw(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function Xo(n){return yt(n)}class Gh{constructor(e){this.auth=e,this.observer=null,this.addObserver=Oy(t=>this.observer=t)}get next(){return ne(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */function bI(n,e){const t=zl(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(ao(i,e??{}))return s;mn(s,"already-initialized")}return t.initialize({options:e})}function RI(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(an);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function SI(n,e,t){const r=Xo(n);ne(r._canInitEmulator,r,"emulator-config-failed"),ne(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!!(t!=null&&t.disableWarnings),i=am(e),{host:a,port:l}=PI(e),c=l===null?"":`:${l}`;r.config.emulator={url:`${i}//${a}${c}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:a,port:l,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})}),s||CI()}function am(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function PI(n){const e=am(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:Qh(r.substr(i.length+1))}}else{const[i,a]=r.split(":");return{host:i,port:Qh(a)}}}function Qh(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function CI(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
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
 */class lm{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return sn("not implemented")}_getIdTokenResponse(e){return sn("not implemented")}_linkToIdToken(e,t){return sn("not implemented")}_getReauthenticationResolver(e){return sn("not implemented")}}/**
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
 */async function $r(n,e){return Kp(n,"POST","/v1/accounts:signInWithIdp",Yo(n,e))}/**
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
 */const kI="http://localhost";class pr extends lm{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new pr(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):mn("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=t,i=Ic(t,["providerId","signInMethod"]);if(!r||!s)return null;const a=new pr(r,s);return a.idToken=i.idToken||void 0,a.accessToken=i.accessToken||void 0,a.secret=i.secret,a.nonce=i.nonce,a.pendingToken=i.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return $r(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,$r(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,$r(e,t)}buildRequest(){const e={requestUri:kI,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=ii(t)}return e}}/**
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
 */class Sn extends pi{constructor(){super("facebook.com")}static credential(e){return pr._fromParams({providerId:Sn.PROVIDER_ID,signInMethod:Sn.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Sn.credentialFromTaggedObject(e)}static credentialFromError(e){return Sn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Sn.credential(e.oauthAccessToken)}catch{return null}}}Sn.FACEBOOK_SIGN_IN_METHOD="facebook.com";Sn.PROVIDER_ID="facebook.com";/**
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
 */class Pn extends pi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return pr._fromParams({providerId:Pn.PROVIDER_ID,signInMethod:Pn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Pn.credentialFromTaggedObject(e)}static credentialFromError(e){return Pn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return Pn.credential(t,r)}catch{return null}}}Pn.GOOGLE_SIGN_IN_METHOD="google.com";Pn.PROVIDER_ID="google.com";/**
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
 */class Cn extends pi{constructor(){super("github.com")}static credential(e){return pr._fromParams({providerId:Cn.PROVIDER_ID,signInMethod:Cn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Cn.credentialFromTaggedObject(e)}static credentialFromError(e){return Cn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Cn.credential(e.oauthAccessToken)}catch{return null}}}Cn.GITHUB_SIGN_IN_METHOD="github.com";Cn.PROVIDER_ID="github.com";/**
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
 */class kn extends pi{constructor(){super("twitter.com")}static credential(e,t){return pr._fromParams({providerId:kn.PROVIDER_ID,signInMethod:kn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return kn.credentialFromTaggedObject(e)}static credentialFromError(e){return kn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return kn.credential(t,r)}catch{return null}}}kn.TWITTER_SIGN_IN_METHOD="twitter.com";kn.PROVIDER_ID="twitter.com";/**
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
 */class zn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await on._fromIdTokenResponse(e,r,s),a=Jh(r);return new zn({user:i,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=Jh(r);return new zn({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function Jh(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
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
 */async function VI(n){var e;if(rn(n.app))return Promise.reject(Fn(n));const t=Xo(n);if(await t._initializationPromise,!((e=t.currentUser)===null||e===void 0)&&e.isAnonymous)return new zn({user:t.currentUser,providerId:null,operationType:"signIn"});const r=await DI(t,{returnSecureToken:!0}),s=await zn._fromIdTokenResponse(t,"signIn",r,!0);return await t._updateCurrentUser(s.user),s}/**
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
 */class To extends yn{constructor(e,t,r,s){var i;super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,To.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new To(e,t,r,s)}}function um(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?To._fromErrorAndOperation(n,i,e,r):i})}async function xI(n,e,t=!1){const r=await ti(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return zn._forOperation(n,"link",r)}/**
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
 */async function NI(n,e,t=!1){const{auth:r}=n;if(rn(r.app))return Promise.reject(Fn(r));const s="reauthenticate";try{const i=await ti(n,um(r,s,e,n),t);ne(i.idToken,r,"internal-error");const a=Rc(i.idToken);ne(a,r,"internal-error");const{sub:l}=a;return ne(n.uid===l,r,"user-mismatch"),zn._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&mn(r,"user-mismatch"),i}}/**
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
 */async function OI(n,e,t=!1){if(rn(n.app))return Promise.reject(Fn(n));const r="signIn",s=await um(n,r,e),i=await zn._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}function MI(n,e,t,r){return yt(n).onIdTokenChanged(e,t,r)}function LI(n,e,t){return yt(n).beforeAuthStateChanged(e,t)}const wo="__sak";/**
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
 */function Wt(){return window}function qI(n){Wt().location.href=n}/**
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
 */function mm(){return typeof Wt().WorkerGlobalScope<"u"&&typeof Wt().importScripts=="function"}async function HI(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function zI(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function WI(){return mm()?self:null}/**
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
 */function ZI(n,e){return e?an(e):(ne(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class kc extends lm{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return $r(e,this._buildIdpRequest())}_linkToIdToken(e,t){return $r(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return $r(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function e0(n){return OI(n.auth,new kc(n),n.bypassAuthState)}function t0(n){const{auth:e,user:t}=n;return ne(t,e,"internal-error"),NI(t,new kc(n),n.bypassAuthState)}async function n0(n){const{auth:e,user:t}=n;return ne(t,e,"internal-error"),xI(t,new kc(n),n.bypassAuthState)}/**
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
 */class vm{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:a,type:l}=e;if(a){this.reject(a);return}const c={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(c))}catch(d){this.reject(d)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return e0;case"linkViaPopup":case"linkViaRedirect":return n0;case"reauthViaPopup":case"reauthViaRedirect":return t0;default:mn(this.auth,"internal-error")}}resolve(e){gn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){gn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const r0=new fi(2e3,1e4);class xr extends vm{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,xr.currentPopupAction&&xr.currentPopupAction.cancel(),xr.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return ne(e,this.auth,"internal-error"),e}async onExecution(){gn(this.filter.length===1,"Popup operations only handle one event");const e=Cc();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(zt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(zt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,xr.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(zt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,r0.get())};e()}}xr.currentPopupAction=null;/**
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
 */const s0="pendingRedirect",Xi=new Map;class i0 extends vm{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Xi.get(this.auth._key());if(!e){try{const r=await o0(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Xi.set(this.auth._key(),e)}return this.bypassAuthState||Xi.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function o0(n,e){const t=c0(e),r=l0(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function a0(n,e){Xi.set(n._key(),e)}function l0(n){return an(n._redirectPersistence)}function c0(n){return Yi(s0,n.config.apiKey,n.name)}async function u0(n,e,t=!1){if(rn(n.app))return Promise.reject(Fn(n));const r=Xo(n),s=ZI(r,e),a=await new i0(r,s,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
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
 */const h0=10*60*1e3;class d0{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!f0(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!Em(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(zt(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=h0&&this.cachedEventUids.clear(),this.cachedEventUids.has(Zh(e))}saveEventToCache(e){this.cachedEventUids.add(Zh(e)),this.lastProcessedEventTime=Date.now()}}function Zh(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function Em({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function f0(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Em(n);default:return!1}}/**
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
 */async function p0(n,e={}){return ss(n,"GET","/v1/projects",e)}/**
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
 */const m0=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,g0=/^https?/;async function _0(n){if(n.config.emulator)return;const{authorizedDomains:e}=await p0(n);for(const t of e)try{if(y0(t))return}catch{}mn(n,"unauthorized-domain")}function y0(n){const e=wl(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!g0.test(t))return!1;if(m0.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
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
 */const v0=new fi(3e4,6e4);function ed(){const n=Wt().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function E0(n){return new Promise((e,t)=>{var r,s,i;function a(){ed(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{ed(),t(zt(n,"network-request-failed"))},timeout:v0.get()})}if(!((s=(r=Wt().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=Wt().gapi)===null||i===void 0)&&i.load)a();else{const l=AI("iframefcb");return Wt()[l]=()=>{gapi.load?a():t(zt(n,"network-request-failed"))},wI(`${II()}?onload=${l}`).catch(c=>t(c))}}).catch(e=>{throw Zi=null,e})}let Zi=null;function T0(n){return Zi=Zi||E0(n),Zi}/**
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
 */const w0=new fi(5e3,15e3),I0="__/auth/iframe",A0="emulator/auth/iframe",b0={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},R0=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function S0(n){const e=n.config;ne(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?bc(e,A0):`https://${n.config.authDomain}/${I0}`,r={apiKey:e.apiKey,appName:n.name,v:Xr},s=R0.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${ii(r).slice(1)}`}async function P0(n){const e=await T0(n),t=Wt().gapi;return ne(t,n,"internal-error"),e.open({where:document.body,url:S0(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:b0,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const a=zt(n,"network-request-failed"),l=Wt().setTimeout(()=>{i(a)},w0.get());function c(){Wt().clearTimeout(l),s(r)}r.ping(c).then(c,()=>{i(a)})}))}/**
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
 */const C0={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},k0=500,D0=600,V0="_blank",x0="http://localhost";class td{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function N0(n,e,t,r=k0,s=D0){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const c=Object.assign(Object.assign({},C0),{width:r.toString(),height:s.toString(),top:i,left:a}),d=ut().toLowerCase();t&&(l=em(d)?V0:t),Xp(d)&&(e=e||x0,c.scrollbars="yes");const f=Object.entries(c).reduce((E,[P,N])=>`${E}${P}=${N},`,"");if(pI(d)&&l!=="_self")return O0(e||"",l),new td(null);const m=window.open(e||"",l,f);ne(m,n,"popup-blocked");try{m.focus()}catch{}return new td(m)}function O0(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
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
 */const M0="__/auth/handler",L0="emulator/auth/handler",F0=encodeURIComponent("fac");async function nd(n,e,t,r,s,i){ne(n.config.authDomain,n,"auth-domain-config-required"),ne(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:Xr,eventId:s};if(e instanceof cm){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",Ny(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,m]of Object.entries(i||{}))a[f]=m}if(e instanceof pi){const f=e.getScopes().filter(m=>m!=="");f.length>0&&(a.scopes=f.join(","))}n.tenantId&&(a.tid=n.tenantId);const l=a;for(const f of Object.keys(l))l[f]===void 0&&delete l[f];const c=await n._getAppCheckToken(),d=c?`#${F0}=${encodeURIComponent(c)}`:"";return`${U0(n)}?${ii(l).slice(1)}${d}`}function U0({config:n}){return n.emulator?bc(n,L0):`https://${n.authDomain}/${M0}`}/**
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
 */const Ba="webStorageSupport";class B0{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=pm,this._completeRedirectFn=u0,this._overrideRedirectResult=a0}async _openPopup(e,t,r,s){var i;gn((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const a=await nd(e,t,r,wl(),s);return N0(e,a,Cc())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await nd(e,t,r,wl(),s);return qI(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(gn(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await P0(e),r=new d0(e);return t.register("authEvent",s=>(ne(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Ba,{type:Ba},s=>{var i;const a=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[Ba];a!==void 0&&t(!!a),mn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=_0(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return im()||Zp()||Sc()}}const j0=B0;var rd="@firebase/auth",sd="1.7.9";/**
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
 */class $0{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){ne(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function q0(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function H0(n){Hr(new cr("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:a,authDomain:l}=r.options;ne(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:a,authDomain:l,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:om(n)},d=new EI(r,s,i,c);return RI(d,t),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Hr(new cr("auth-internal",e=>{const t=Xo(e.getProvider("auth").getImmediate());return(r=>new $0(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),On(rd,sd,q0(n)),On(rd,sd,"esm2017")}/**
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
 */const z0=5*60,W0=_f("authIdTokenMaxAge")||z0;let id=null;const K0=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>W0)return;const s=t==null?void 0:t.token;id!==s&&(id=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function G0(n=Tf()){const e=zl(n,"auth");if(e.isInitialized())return e.getImmediate();const t=bI(n,{popupRedirectResolver:j0,persistence:[XI,BI,pm]}),r=_f("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const a=K0(i.toString());LI(t,a,()=>a(t.currentUser)),MI(t,l=>a(l))}}const s=mf("auth");return s&&SI(t,`http://${s}`),t}function Q0(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}TI({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=zt("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",Q0().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});H0("Browser");const J0={apiKey:"AIzaSyDCqJRmxKiIzuAhgXsmXICCx_O65aujNa0",authDomain:"impro-selector.firebaseapp.com",projectId:"impro-selector",storageBucket:"impro-selector.appspot.com",messagingSenderId:"730278491306",appId:"1:730278491306:web:c966af1179221e91118cd3",measurementId:"G-3NB062D088"},Tm=Ef(J0),Xe=Mw(Tm),Y0=G0(Tm);VI(Y0);let Dt="mock";const mr=[{id:"p1",name:"Alice"},{id:"p2",name:"Bob"},{id:"p3",name:"Charlie"},{id:"p4",name:"David"},{id:"p5",name:"Eva"},{id:"p6",name:"Fanny"},{id:"p7",name:"Georges"},{id:"p8",name:"Hélène"},{id:"p9",name:"Ismaël"},{id:"p10",name:"Jade"},{id:"p11",name:"Karim"},{id:"p12",name:"Léa"},{id:"p13",name:"Marc"},{id:"p14",name:"Nina"},{id:"p15",name:"Oscar"}],gr=[{id:"event1",title:"Apérock Septembre",date:"2025-09-08"},{id:"event2",title:"Match à Cambo",date:"2025-11-25"},{id:"event3",title:"Impro des Familles",date:"2025-12-02"},{id:"event4",title:"Cabaret Surprise",date:"2026-01-20"},{id:"event5",title:"Impro Plage",date:"2026-03-10"}];function X0(n){Dt=n}async function ja(){return(Dt==="firebase"?(await ns(Qn(Xe,"events"))).docs.map(e=>({id:e.id,...e.data()})):gr).sort((e,t)=>{const r=new Date(e.date),s=new Date(t.date);return r<s?-1:r>s?1:e.title.localeCompare(t.title)})}async function $a(){return(Dt==="firebase"?(await ns(Qn(Xe,"players"))).docs.map(e=>({id:e.id,...e.data()})):mr).sort((e,t)=>e.order<t.order?-1:e.order>t.order?1:e.name.localeCompare(t.name))}async function Z0(n){if(Dt==="firebase"){const e=pn(Qn(Xe,"players"));return await rs(e,{name:n}),e.id}else{const e=`p${mr.length+1}`;return mr.push({id:e,name:n}),e}}async function eA(n){if(Dt==="firebase"){await Tl(pn(Xe,"players",n));const e=await ns(Qn(Xe,"availability")),t=jp(Xe);e.forEach(r=>{const s=r.data();if(s[n]!==void 0){const i={...s};delete i[n],t.update(r.ref,i)}}),await t.commit()}else mr=mr.filter(e=>e.id!==n)}async function tA(n,e){if(Dt==="firebase")await rs(pn(Xe,"players",n),{name:e});else{const t=mr.findIndex(r=>r.id===n);t!==-1&&(mr[t]=e)}}async function Is(n,e){if(Dt==="firebase"){const t=await ns(Qn(Xe,"availability")),r={};return t.forEach(s=>{r[s.id]=s.data()}),r}else{const t={};return n.forEach(r=>{t[r.name]={},e.forEach(s=>{t[r.name][s.id]=void 0})}),e.forEach(r=>{const s=[...n].sort(()=>.5-Math.random());s.slice(0,4).forEach(i=>{t[i.name][r.id]=!0}),s.slice(4).forEach(i=>{const a=Math.random();t[i.name][r.id]=a<.4?!0:a<.8?!1:void 0})}),t}}async function As(){if(Dt==="firebase"){const n=await ns(Qn(Xe,"selections")),e={};return n.forEach(t=>{e[t.id]=t.data().players||[]}),e}else return{}}async function od(n,e){Dt==="firebase"&&await rs(pn(Xe,"availability",n),e)}async function nA(n,e){Dt==="firebase"&&await rs(pn(Xe,"selections",n),{players:e})}async function rA(n){if(console.log("Suppression de l'événement:",n),Dt==="firebase")try{console.log("Suppression de l'événement dans Firestore"),await Tl(pn(Xe,"events",n)),console.log("Suppression de la sélection associée"),await Tl(pn(Xe,"selections",n)),console.log("Suppression des disponibilités");const e=await ns(Qn(Xe,"availability")),t=jp(Xe);e.forEach(r=>{const s=r.data();if(s[n]!==void 0){console.log("Mise à jour de la disponibilité pour:",r.id);const i={...s};delete i[n],t.update(r.ref,i)}}),await t.commit(),console.log("Opérations de suppression terminées avec succès")}catch(e){throw console.error("Erreur lors de la suppression:",e),e}else gr=gr.filter(e=>e.id!==n)}async function sA(n){if(Dt==="firebase"){const e=pn(Qn(Xe,"events"));return await rs(e,n),e.id}else{const e=`event${gr.length+1}`;return gr.push({id:e,...n}),e}}async function iA(n,e){if(Dt==="firebase")await rs(pn(Xe,"events",n),e);else{const t=gr.findIndex(r=>r.id===n);t!==-1&&(gr[t]={id:n,...e})}}const oA={class:"relative"},aA={class:"sticky top-0 bg-white z-50 shadow overflow-x-auto"},lA={class:"border-collapse border border-gray-400 w-full table-fixed"},cA={class:"bg-gray-100 text-gray-800 text-sm"},uA={class:"p-3 text-left"},hA={class:"flex flex-col items-center justify-center gap-2"},dA=["onMouseenter","onDblclick"],fA={class:"flex flex-col gap-2"},pA={class:"flex flex-col items-center space-y-1 relative"},mA={key:0,class:"font-semibold text-base text-center whitespace-pre-wrap"},gA={key:1,class:"w-full"},_A={key:2,class:"text-xs text-gray-500"},yA={key:3,class:"w-full"},vA=["onClick"],EA={class:"p-3 text-center"},TA={class:"bg-gray-50"},wA=["onClick"],IA={class:"overflow-x-auto overflow-y-auto max-h-[calc(100vh-100px)]"},AA={class:"table-auto border-collapse border border-gray-400 w-full table-fixed"},bA={class:"border-t"},RA=["data-player-id"],SA={class:"p-3 font-medium text-gray-900 w-[100px] relative group"},PA={key:0,class:"font-semibold text-base whitespace-pre-wrap flex items-center justify-between"},CA=["onDblclick"],kA=["onClick"],DA={key:1,class:"w-full"},VA={class:"p-3 text-center text-gray-700 text-sm w-[100px]"},xA=["title"],NA=["onClick"],OA=["title"],MA=["title"],LA=["title"],FA=["title"],UA={key:0,class:"fixed bottom-4 left-4 bg-green-500 text-white p-4 rounded-lg shadow-lg"},BA={key:1,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"},jA={class:"bg-white p-6 rounded-lg shadow-lg w-96"},$A={class:"mb-4"},qA={class:"mb-4"},HA={key:2,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"},zA={class:"bg-white p-6 rounded-lg shadow-lg w-96"},WA={class:"mb-4"},KA={class:"flex justify-end space-x-2"},GA={key:3,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"},QA={key:4,class:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"},JA={__name:"GridBoard",setup(n){const e=De(!1),t=De(null),r=De(null),s=De(""),i=De(""),a=De(null),l=De(""),c=De(!1),d=De(""),f=De(null);function m(A){f.value=A;const T=document.querySelector(`[data-player-id="${A}"]`);T&&T.scrollIntoView({behavior:"smooth",block:"center"}),E.value=!0,P.value="Nouveau joueur ajouté !",setTimeout(()=>{E.value=!1},3e3)}const E=De(!1),P=De("");async function N(A){t.value=A,e.value=!0}async function B(){e.value=!1;try{await rA(t.value),fe.value=fe.value.filter(A=>A.id!==t.value),await Promise.all([ja(),Is(Pe.value,fe.value),As()]).then(([A,T,k])=>{fe.value=A,ye.value=T,ce.value=k}),t.value=null,E.value=!0,P.value="Événement supprimé avec succès !",setTimeout(()=>{E.value=!1},3e3)}catch(A){console.error("Erreur lors de la suppression de l'événement:",A),alert("Erreur lors de la suppression de l'événement. Veuillez réessayer.")}}function j(){e.value=!1,t.value=null}function Q(A){r.value=A.id,s.value=A.title,i.value=A.date}async function J(){if(!(!r.value||!s.value.trim()||!i.value))try{const A={title:s.value.trim(),date:i.value};await iA(r.value,A),await Promise.all([ja(),Is(Pe.value,fe.value),As()]).then(([T,k,V])=>{fe.value=T,ye.value=k,ce.value=V}),r.value=null,s.value="",i.value="",E.value=!0,P.value="Événement mis à jour avec succès !",setTimeout(()=>{E.value=!1},3e3)}catch(A){console.error("Erreur lors de l'édition de l'événement:",A),alert("Erreur lors de l'édition de l'événement. Veuillez réessayer.")}}function X(A){a.value=A.id,l.value=A.name,Vd(()=>{editPlayerInput.value&&editPlayerInput.value.focus()})}async function W(){if(!(!a.value||!l.value.trim()))try{await tA(a.value,l.value.trim()),await Promise.all([$a(),Is(Pe.value,fe.value),As()]).then(([A,T,k])=>{Pe.value=A,ye.value=T,ce.value=k}),a.value=null,l.value="",E.value=!0,P.value="Joueur mis à jour avec succès !",setTimeout(()=>{E.value=!1},3e3)}catch(A){console.error("Erreur lors de l'édition du joueur:",A),alert("Erreur lors de l'édition du joueur. Veuillez réessayer.")}}function de(){a.value=null,l.value=""}async function _e(){if(d.value.trim())try{const A=d.value.trim(),T=await Z0(A);await Promise.all([$a(),Is(Pe.value,fe.value),As()]).then(([k,V,M])=>{Pe.value=k,ye.value=V,ce.value=M;const O=Pe.value.find($=>$.id===T);m(T);const H=document.querySelector(`[data-player-id="${T}"]`);H&&H.scrollIntoView({behavior:"smooth",block:"center"}),E.value=!0,P.value="Joueur ajouté avec succès ! Vous pouvez maintenant indiquer sa disponibilité.",setTimeout(()=>{E.value=!1},3e3),setTimeout(()=>{E.value=!1,P.value=""},5e3)}),c.value=!1,d.value=""}catch(A){console.error("Erreur lors de l'ajout du joueur:",A),alert("Erreur lors de l'ajout du joueur. Veuillez réessayer.")}}function b(){r.value=null,s.value="",i.value=""}const g=De(null),y=De(!1),w=De(""),R=De("");async function C(){if(!w.value.trim()||!R.value){alert("Veuillez remplir le titre et la date de l'événement");return}const A={title:w.value.trim(),date:R.value};try{const T=await sA(A);fe.value=[...fe.value,{id:T,...A}];const k={};for(const V of Pe.value)k[V.name]=ye.value[V.name]||{},k[V.name][T]=null,await od(V.name,k[V.name]);w.value="",R.value="",y.value=!1,await Promise.resolve()}catch(T){console.error("Erreur lors de la création de l'événement:",T),alert("Erreur lors de la création de l'événement. Veuillez réessayer.")}}function v(){w.value="",R.value="",y.value=!1}const fe=De([]),Pe=De([]),ye=De({}),ce=De({}),pe=De({}),vt=De({});Bd(async()=>{X0("firebase");const[A,T]=await Promise.all([ja(),$a()]),k={},V=T.filter(M=>k[M.name]?!1:(k[M.name]=!0,!0));fe.value=A,Pe.value=V,ye.value=await Is(Pe.value,fe.value),ce.value=await As(),Jn(),ft(),console.log("players (deduplicated):",Pe.value.map(M=>({id:M.id,name:M.name})))});function Jt(A,T){ye.value[A]=ye.value[A]||{};const k=ye.value[A][T];let V;k===void 0?V=!0:k===!0?V=!1:V=void 0,ye.value[A][T]=V,od(A,ye.value[A]),vn(A),ft()}function ht(A,T){var k;return(k=ye.value[A])==null?void 0:k[T]}function Oe(A,T){var M;const k=ce.value[T]||[],V=(M=ye.value[A])==null?void 0:M[T];return k.includes(A)&&V===!0}async function Le(A,T=6){const V=Pe.value.filter(H=>ht(H.name,A)).map(H=>{const $=dt(H.name);return{name:H.name,weight:1/(1+$)}}),M=[],O=[...V];for(;M.length<T&&O.length>0;){const H=O.reduce((Z,ee)=>Z+ee.weight,0);let $=Math.random()*H;const K=O.findIndex(Z=>($-=Z.weight,$<=0));K>=0&&(M.push(O[K].name),O.splice(K,1))}ce.value[A]=M,await nA(A,M),Jn(),ft()}function is(A){var k;return A?(typeof A=="string"?new Date(A):((k=A.toDate)==null?void 0:k.call(A))||A).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}):""}function dt(A){return Object.values(ce.value).filter(T=>T.includes(A)).length}function wt(A){const T=ye.value[A]||{};return Object.values(T).filter(k=>k===!0).length}function Vt(A){const T=wt(A),k=dt(A);return T===0?0:k/T}function vn(A){pe.value[A]={availability:wt(A),selection:dt(A),ratio:Vt(A)}}function Jn(){Pe.value.forEach(A=>vn(A.name))}function ft(A=6){const T={};fe.value.forEach(k=>{const M=Pe.value.filter(H=>ht(H.name,k.id)===!0).map(H=>{const $=dt(H.name);return{name:H.name,weight:1/(1+$)}}),O=M.reduce((H,$)=>H+$.weight,0);M.forEach(H=>{const $=Math.min(1,H.weight/O*A);T[H.name]||(T[H.name]={}),T[H.name][k.id]=Math.round($*100)})}),vt.value=T}function It(A,T){var H,$;const k=A.name,V=ht(k,T),M=Oe(k,T),O=(($=(H=vt.value)==null?void 0:H[k])==null?void 0:$[T])??0;return V===!1?"Non disponible – cliquez pour changer":M?`Sélectionné · Chance estimée : ${O}%`:V===!0?`Disponible · Chance estimée : ${O}%`:"Cliquez pour indiquer votre disponibilité"}const At=De(null),_=De(!1);async function I(){_.value=!1;try{await eA(At.value),Pe.value=Pe.value.filter(A=>A.id!==At.value),At.value=null,E.value=!0,P.value="Joueur supprimé avec succès !",setTimeout(()=>{E.value=!1},3e3)}catch(A){console.error("Erreur lors de la suppression du joueur :",A),alert("Erreur lors de la suppression du joueur. Veuillez réessayer.")}}function x(){_.value=!1,At.value=null}function U(A){At.value=A,_.value=!0}return(A,T)=>(Te(),be(ot,null,[z("div",oA,[z("div",aA,[z("table",lA,[z("colgroup",null,[T[10]||(T[10]=z("col",{style:{width:"10%"}},null,-1)),T[11]||(T[11]=z("col",{style:{width:"10%"}},null,-1)),(Te(!0),be(ot,null,br(fe.value,(k,V)=>(Te(),be("col",{key:V,style:js("width: calc(70% / "+fe.value.length+");")},null,4))),128)),T[12]||(T[12]=z("col",{style:{width:"5%"}},null,-1))]),z("thead",null,[z("tr",cA,[z("th",uA,[z("div",hA,[T[13]||(T[13]=z("span",{class:"text-sm"},"Joueur",-1)),z("button",{onClick:T[0]||(T[0]=k=>c.value=!0),class:"text-sm text-blue-500 hover:text-blue-700 cursor-pointer",title:"Ajoutez un joueur"}," ➕ ")])]),T[14]||(T[14]=z("th",{class:"p-3 text-center"},[z("span",{class:"text-sm"},"📊 Stats")],-1)),(Te(!0),be(ot,null,br(fe.value,k=>(Te(),be("th",{key:k.id,class:"p-3 text-center",onMouseenter:V=>g.value=k.id,onMouseleave:T[3]||(T[3]=V=>g.value=null),onDblclick:V=>Q(k)},[z("div",fA,[z("div",pA,[r.value!==k.id?(Te(),be("div",mA,rr(k.title),1)):(Te(),be("div",gA,[Ar(z("input",{"onUpdate:modelValue":T[1]||(T[1]=V=>s.value=V),type:"text",class:"w-full p-1 border rounded",onKeydown:[Sr(b,["esc"]),Sr(J,["enter"])],ref_for:!0,ref:"editTitleInput"},null,544),[[Rr,s.value]])])),r.value!==k.id?(Te(),be("div",_A,rr(is(k.date)),1)):(Te(),be("div",yA,[Ar(z("input",{"onUpdate:modelValue":T[2]||(T[2]=V=>i.value=V),type:"date",class:"w-full p-1 border rounded",onKeydown:[Sr(b,["esc"]),Sr(J,["enter"])]},null,544),[[Rr,i.value]])])),z("button",{onClick:V=>N(k.id),class:$s(["absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity",{"opacity-100":g.value===k.id}])}," ❌ ",10,vA)])])],40,dA))),128)),z("th",EA,[z("button",{onClick:T[4]||(T[4]=k=>y.value=!0),class:"text-gray-500 hover:text-blue-500",title:"Ajouter un nouvel événement"}," ➕ ")])]),z("tr",TA,[T[15]||(T[15]=z("th",{class:"p-3 text-left w-[100px]"},null,-1)),T[16]||(T[16]=z("th",{class:"p-3 text-center text-sm text-gray-700 w-[100px]"},null,-1)),(Te(!0),be(ot,null,br(fe.value,k=>(Te(),be("th",{key:k.id,class:"p-3 text-center w-40"},[z("button",{onClick:V=>Le(k.id,6),class:"px-2 py-1 rounded-md text-sm bg-white hover:bg-gray-50 hover:border-gray-200 border shadow text-gray-800"}," 🎭 Sélectionner ",8,wA)]))),128)),T[17]||(T[17]=z("th",{class:"p-3"},null,-1))])])])]),z("div",IA,[z("table",AA,[z("colgroup",null,[T[18]||(T[18]=z("col",{style:{width:"10%"}},null,-1)),T[19]||(T[19]=z("col",{style:{width:"10%"}},null,-1)),(Te(!0),be(ot,null,br(fe.value,(k,V)=>(Te(),be("col",{key:V,style:js("width: calc(70% / "+fe.value.length+");")},null,4))),128)),T[20]||(T[20]=z("col",{style:{width:"5%"}},null,-1))]),z("tbody",bA,[(Te(!0),be(ot,null,br(Pe.value,k=>(Te(),be("tr",{key:k.id,class:$s(["odd:bg-white even:bg-gray-50 border-b",{"highlighted-player":k.id===f.value}]),"data-player-id":k.id},[z("td",SA,[a.value!==k.id?(Te(),be("div",PA,[z("span",{onDblclick:V=>X(k)},rr(k.name),41,CA),z("button",{onClick:V=>U(k.id),class:"hidden group-hover:block text-red-500",title:"Supprimer le joueur"}," 🗑️ ",8,kA)])):(Te(),be("div",DA,[Ar(z("input",{"onUpdate:modelValue":T[5]||(T[5]=V=>l.value=V),type:"text",class:"w-full p-1 border rounded",onKeydown:[Sr(de,["esc"]),Sr(W,["enter"])],ref_for:!0,ref:"editPlayerInput"},null,544),[[Rr,l.value]])]))]),z("td",VA,[z("span",{title:`${dt(k.name)} sélection${dt(k.name)>1?"s":""}, ${wt(k.name)} dispo${wt(k.name)>1?"s":""}`},rr(dt(k.name))+"/"+rr(wt(k.name)),9,xA)]),(Te(!0),be(ot,null,br(fe.value,V=>(Te(),be("td",{key:V.id,class:"p-3 text-center cursor-pointer hover:bg-blue-100",onClick:M=>Jt(k.name,V.id)},[Oe(k.name,V.id)?(Te(),be("span",{key:0,title:It(k,V.id)}," 🎭 ",8,OA)):ht(k.name,V.id)?(Te(),be("span",{key:1,title:It(k,V.id)}," ✅ ",8,MA)):ht(k.name,V.id)===!1?(Te(),be("span",{key:2,title:It(k,V.id)}," ❌ ",8,LA)):(Te(),be("span",{key:3,title:It(k,V.id)}," – ",8,FA))],8,NA))),128)),T[21]||(T[21]=z("td",{class:"p-3"},null,-1))],10,RA))),128))])])])]),E.value?(Te(),be("div",UA,rr(P.value),1)):Ts("",!0),y.value?(Te(),be("div",BA,[z("div",jA,[T[24]||(T[24]=z("h2",{class:"text-xl font-bold mb-4"},"Nouvel événement",-1)),z("div",$A,[T[22]||(T[22]=z("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Titre",-1)),Ar(z("input",{"onUpdate:modelValue":T[6]||(T[6]=k=>w.value=k),type:"text",class:"w-full p-2 border rounded focus:ring-2 focus:ring-blue-500",placeholder:"Titre de l'événement"},null,512),[[Rr,w.value]])]),z("div",qA,[T[23]||(T[23]=z("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Date",-1)),Ar(z("input",{"onUpdate:modelValue":T[7]||(T[7]=k=>R.value=k),type:"date",class:"w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"},null,512),[[Rr,R.value]])]),z("div",{class:"flex justify-end space-x-2"},[z("button",{onClick:v,class:"px-4 py-2 text-gray-700 hover:text-gray-900"}," Annuler "),z("button",{onClick:C,class:"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"}," Créer ")])])])):Ts("",!0),c.value?(Te(),be("div",HA,[z("div",zA,[T[26]||(T[26]=z("h2",{class:"text-xl font-bold mb-4"},"Nouveau joueur",-1)),z("div",WA,[T[25]||(T[25]=z("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Nom",-1)),Ar(z("input",{"onUpdate:modelValue":T[8]||(T[8]=k=>d.value=k),type:"text",class:"w-full p-2 border rounded focus:ring-2 focus:ring-blue-500",placeholder:"Nom du joueur"},null,512),[[Rr,d.value]])]),z("div",KA,[z("button",{onClick:T[9]||(T[9]=k=>c.value=!1),class:"px-4 py-2 text-gray-700 hover:text-gray-900"}," Annuler "),z("button",{onClick:_e,class:"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"}," Ajouter ")])])])):Ts("",!0),e.value?(Te(),be("div",GA,[z("div",{class:"bg-white p-6 rounded-lg shadow-lg w-96"},[T[27]||(T[27]=z("h2",{class:"text-xl font-bold mb-4"},"Confirmation",-1)),T[28]||(T[28]=z("p",{class:"mb-4"},"Êtes-vous sûr de vouloir supprimer ?",-1)),z("div",{class:"flex justify-end space-x-2"},[z("button",{onClick:j,class:"px-4 py-2 text-gray-700 hover:text-gray-900"}," Annuler "),z("button",{onClick:B,class:"px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"}," Supprimer ")])])])):Ts("",!0),_.value?(Te(),be("div",QA,[z("div",{class:"bg-white p-4 rounded shadow"},[T[29]||(T[29]=z("p",{class:"mb-4"},"Êtes-vous sûr de vouloir supprimer ce joueur ?",-1)),z("div",{class:"flex justify-end space-x-2"},[z("button",{onClick:x,class:"px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"},"Annuler"),z("button",{onClick:I,class:"px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"},"Supprimer")])])])):Ts("",!0)],64))}},YA={__name:"App",setup(n){return(e,t)=>(Te(),of(JA))}};cy(YA).mount("#app");
