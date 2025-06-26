(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();/**
* @vue/shared v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**//*! #__NO_SIDE_EFFECTS__ */function _l(n){const e=Object.create(null);for(const t of n.split(","))e[t]=1;return t=>t in e}const Pe={},Pr=[],Mt=()=>{},jm=()=>!1,_o=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&(n.charCodeAt(2)>122||n.charCodeAt(2)<97),yl=n=>n.startsWith("onUpdate:"),rt=Object.assign,vl=(n,e)=>{const t=n.indexOf(e);t>-1&&n.splice(t,1)},$m=Object.prototype.hasOwnProperty,Ae=(n,e)=>$m.call(n,e),ae=Array.isArray,Cr=n=>yo(n)==="[object Map]",sd=n=>yo(n)==="[object Set]",de=n=>typeof n=="function",Be=n=>typeof n=="string",zn=n=>typeof n=="symbol",Ne=n=>n!==null&&typeof n=="object",od=n=>(Ne(n)||de(n))&&de(n.then)&&de(n.catch),ad=Object.prototype.toString,yo=n=>ad.call(n),qm=n=>yo(n).slice(8,-1),ld=n=>yo(n)==="[object Object]",El=n=>Be(n)&&n!=="NaN"&&n[0]!=="-"&&""+parseInt(n,10)===n,vi=_l(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),vo=n=>{const e=Object.create(null);return t=>e[t]||(e[t]=n(t))},Hm=/-(\w)/g,Un=vo(n=>n.replace(Hm,(e,t)=>t?t.toUpperCase():"")),Km=/\B([A-Z])/g,Wn=vo(n=>n.replace(Km,"-$1").toLowerCase()),cd=vo(n=>n.charAt(0).toUpperCase()+n.slice(1)),ha=vo(n=>n?`on${cd(n)}`:""),Vn=(n,e)=>!Object.is(n,e),Os=(n,...e)=>{for(let t=0;t<n.length;t++)n[t](...e)},Ma=(n,e,t,r=!1)=>{Object.defineProperty(n,e,{configurable:!0,enumerable:!1,writable:r,value:t})},La=n=>{const e=parseFloat(n);return isNaN(e)?n:e};let mu;const Eo=()=>mu||(mu=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function Tl(n){if(ae(n)){const e={};for(let t=0;t<n.length;t++){const r=n[t],i=Be(r)?Qm(r):Tl(r);if(i)for(const s in i)e[s]=i[s]}return e}else if(Be(n)||Ne(n))return n}const zm=/;(?![^(]*\))/g,Wm=/:([^]+)/,Gm=/\/\*[^]*?\*\//g;function Qm(n){const e={};return n.replace(Gm,"").split(zm).forEach(t=>{if(t){const r=t.split(Wm);r.length>1&&(e[r[0].trim()]=r[1].trim())}}),e}function To(n){let e="";if(Be(n))e=n;else if(ae(n))for(let t=0;t<n.length;t++){const r=To(n[t]);r&&(e+=r+" ")}else if(Ne(n))for(const t in n)n[t]&&(e+=t+" ");return e.trim()}const Jm="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",Ym=_l(Jm);function ud(n){return!!n||n===""}const hd=n=>!!(n&&n.__v_isRef===!0),Tr=n=>Be(n)?n:n==null?"":ae(n)||Ne(n)&&(n.toString===ad||!de(n.toString))?hd(n)?Tr(n.value):JSON.stringify(n,dd,2):String(n),dd=(n,e)=>hd(e)?dd(n,e.value):Cr(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((t,[r,i],s)=>(t[da(r,s)+" =>"]=i,t),{})}:sd(e)?{[`Set(${e.size})`]:[...e.values()].map(t=>da(t))}:zn(e)?da(e):Ne(e)&&!ae(e)&&!ld(e)?String(e):e,da=(n,e="")=>{var t;return zn(n)?`Symbol(${(t=n.description)!=null?t:e})`:n};/**
* @vue/reactivity v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Et;class Xm{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=Et,!e&&Et&&(this.index=(Et.scopes||(Et.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].pause();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].resume();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].resume()}}run(e){if(this._active){const t=Et;try{return Et=this,e()}finally{Et=t}}}on(){++this._on===1&&(this.prevScope=Et,Et=this)}off(){this._on>0&&--this._on===0&&(Et=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let t,r;for(t=0,r=this.effects.length;t<r;t++)this.effects[t].stop();for(this.effects.length=0,t=0,r=this.cleanups.length;t<r;t++)this.cleanups[t]();if(this.cleanups.length=0,this.scopes){for(t=0,r=this.scopes.length;t<r;t++)this.scopes[t].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const i=this.parent.scopes.pop();i&&i!==this&&(this.parent.scopes[this.index]=i,i.index=this.index)}this.parent=void 0}}}function Zm(){return Et}let Ce;const fa=new WeakSet;class fd{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Et&&Et.active&&Et.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,fa.has(this)&&(fa.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||md(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,gu(this),gd(this);const e=Ce,t=Lt;Ce=this,Lt=!0;try{return this.fn()}finally{_d(this),Ce=e,Lt=t,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)Al(e);this.deps=this.depsTail=void 0,gu(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?fa.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Fa(this)&&this.run()}get dirty(){return Fa(this)}}let pd=0,Ei,Ti;function md(n,e=!1){if(n.flags|=8,e){n.next=Ti,Ti=n;return}n.next=Ei,Ei=n}function Il(){pd++}function wl(){if(--pd>0)return;if(Ti){let e=Ti;for(Ti=void 0;e;){const t=e.next;e.next=void 0,e.flags&=-9,e=t}}let n;for(;Ei;){let e=Ei;for(Ei=void 0;e;){const t=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(r){n||(n=r)}e=t}}if(n)throw n}function gd(n){for(let e=n.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function _d(n){let e,t=n.depsTail,r=t;for(;r;){const i=r.prevDep;r.version===-1?(r===t&&(t=i),Al(r),eg(r)):e=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=i}n.deps=e,n.depsTail=t}function Fa(n){for(let e=n.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(yd(e.dep.computed)||e.dep.version!==e.version))return!0;return!!n._dirty}function yd(n){if(n.flags&4&&!(n.flags&16)||(n.flags&=-17,n.globalVersion===Di)||(n.globalVersion=Di,!n.isSSR&&n.flags&128&&(!n.deps&&!n._dirty||!Fa(n))))return;n.flags|=2;const e=n.dep,t=Ce,r=Lt;Ce=n,Lt=!0;try{gd(n);const i=n.fn(n._value);(e.version===0||Vn(i,n._value))&&(n.flags|=128,n._value=i,e.version++)}catch(i){throw e.version++,i}finally{Ce=t,Lt=r,_d(n),n.flags&=-3}}function Al(n,e=!1){const{dep:t,prevSub:r,nextSub:i}=n;if(r&&(r.nextSub=i,n.prevSub=void 0),i&&(i.prevSub=r,n.nextSub=void 0),t.subs===n&&(t.subs=r,!r&&t.computed)){t.computed.flags&=-5;for(let s=t.computed.deps;s;s=s.nextDep)Al(s,!0)}!e&&!--t.sc&&t.map&&t.map.delete(t.key)}function eg(n){const{prevDep:e,nextDep:t}=n;e&&(e.nextDep=t,n.prevDep=void 0),t&&(t.prevDep=e,n.nextDep=void 0)}let Lt=!0;const vd=[];function cn(){vd.push(Lt),Lt=!1}function un(){const n=vd.pop();Lt=n===void 0?!0:n}function gu(n){const{cleanup:e}=n;if(n.cleanup=void 0,e){const t=Ce;Ce=void 0;try{e()}finally{Ce=t}}}let Di=0;class tg{constructor(e,t){this.sub=e,this.dep=t,this.version=t.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class bl{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!Ce||!Lt||Ce===this.computed)return;let t=this.activeLink;if(t===void 0||t.sub!==Ce)t=this.activeLink=new tg(Ce,this),Ce.deps?(t.prevDep=Ce.depsTail,Ce.depsTail.nextDep=t,Ce.depsTail=t):Ce.deps=Ce.depsTail=t,Ed(t);else if(t.version===-1&&(t.version=this.version,t.nextDep)){const r=t.nextDep;r.prevDep=t.prevDep,t.prevDep&&(t.prevDep.nextDep=r),t.prevDep=Ce.depsTail,t.nextDep=void 0,Ce.depsTail.nextDep=t,Ce.depsTail=t,Ce.deps===t&&(Ce.deps=r)}return t}trigger(e){this.version++,Di++,this.notify(e)}notify(e){Il();try{for(let t=this.subs;t;t=t.prevSub)t.sub.notify()&&t.sub.dep.notify()}finally{wl()}}}function Ed(n){if(n.dep.sc++,n.sub.flags&4){const e=n.dep.computed;if(e&&!n.dep.subs){e.flags|=20;for(let r=e.deps;r;r=r.nextDep)Ed(r)}const t=n.dep.subs;t!==n&&(n.prevSub=t,t&&(t.nextSub=n)),n.dep.subs=n}}const Ua=new WeakMap,sr=Symbol(""),Ba=Symbol(""),Vi=Symbol("");function ut(n,e,t){if(Lt&&Ce){let r=Ua.get(n);r||Ua.set(n,r=new Map);let i=r.get(t);i||(r.set(t,i=new bl),i.map=r,i.key=t),i.track()}}function tn(n,e,t,r,i,s){const a=Ua.get(n);if(!a){Di++;return}const l=c=>{c&&c.trigger()};if(Il(),e==="clear")a.forEach(l);else{const c=ae(n),d=c&&El(t);if(c&&t==="length"){const f=Number(r);a.forEach((m,E)=>{(E==="length"||E===Vi||!zn(E)&&E>=f)&&l(m)})}else switch((t!==void 0||a.has(void 0))&&l(a.get(t)),d&&l(a.get(Vi)),e){case"add":c?d&&l(a.get("length")):(l(a.get(sr)),Cr(n)&&l(a.get(Ba)));break;case"delete":c||(l(a.get(sr)),Cr(n)&&l(a.get(Ba)));break;case"set":Cr(n)&&l(a.get(sr));break}}wl()}function Er(n){const e=we(n);return e===n?e:(ut(e,"iterate",Vi),Nt(n)?e:e.map(et))}function Io(n){return ut(n=we(n),"iterate",Vi),n}const ng={__proto__:null,[Symbol.iterator](){return pa(this,Symbol.iterator,et)},concat(...n){return Er(this).concat(...n.map(e=>ae(e)?Er(e):e))},entries(){return pa(this,"entries",n=>(n[1]=et(n[1]),n))},every(n,e){return Zt(this,"every",n,e,void 0,arguments)},filter(n,e){return Zt(this,"filter",n,e,t=>t.map(et),arguments)},find(n,e){return Zt(this,"find",n,e,et,arguments)},findIndex(n,e){return Zt(this,"findIndex",n,e,void 0,arguments)},findLast(n,e){return Zt(this,"findLast",n,e,et,arguments)},findLastIndex(n,e){return Zt(this,"findLastIndex",n,e,void 0,arguments)},forEach(n,e){return Zt(this,"forEach",n,e,void 0,arguments)},includes(...n){return ma(this,"includes",n)},indexOf(...n){return ma(this,"indexOf",n)},join(n){return Er(this).join(n)},lastIndexOf(...n){return ma(this,"lastIndexOf",n)},map(n,e){return Zt(this,"map",n,e,void 0,arguments)},pop(){return di(this,"pop")},push(...n){return di(this,"push",n)},reduce(n,...e){return _u(this,"reduce",n,e)},reduceRight(n,...e){return _u(this,"reduceRight",n,e)},shift(){return di(this,"shift")},some(n,e){return Zt(this,"some",n,e,void 0,arguments)},splice(...n){return di(this,"splice",n)},toReversed(){return Er(this).toReversed()},toSorted(n){return Er(this).toSorted(n)},toSpliced(...n){return Er(this).toSpliced(...n)},unshift(...n){return di(this,"unshift",n)},values(){return pa(this,"values",et)}};function pa(n,e,t){const r=Io(n),i=r[e]();return r!==n&&!Nt(n)&&(i._next=i.next,i.next=()=>{const s=i._next();return s.value&&(s.value=t(s.value)),s}),i}const rg=Array.prototype;function Zt(n,e,t,r,i,s){const a=Io(n),l=a!==n&&!Nt(n),c=a[e];if(c!==rg[e]){const m=c.apply(n,s);return l?et(m):m}let d=t;a!==n&&(l?d=function(m,E){return t.call(this,et(m),E,n)}:t.length>2&&(d=function(m,E){return t.call(this,m,E,n)}));const f=c.call(a,d,r);return l&&i?i(f):f}function _u(n,e,t,r){const i=Io(n);let s=t;return i!==n&&(Nt(n)?t.length>3&&(s=function(a,l,c){return t.call(this,a,l,c,n)}):s=function(a,l,c){return t.call(this,a,et(l),c,n)}),i[e](s,...r)}function ma(n,e,t){const r=we(n);ut(r,"iterate",Vi);const i=r[e](...t);return(i===-1||i===!1)&&Cl(t[0])?(t[0]=we(t[0]),r[e](...t)):i}function di(n,e,t=[]){cn(),Il();const r=we(n)[e].apply(n,t);return wl(),un(),r}const ig=_l("__proto__,__v_isRef,__isVue"),Td=new Set(Object.getOwnPropertyNames(Symbol).filter(n=>n!=="arguments"&&n!=="caller").map(n=>Symbol[n]).filter(zn));function sg(n){zn(n)||(n=String(n));const e=we(this);return ut(e,"has",n),e.hasOwnProperty(n)}class Id{constructor(e=!1,t=!1){this._isReadonly=e,this._isShallow=t}get(e,t,r){if(t==="__v_skip")return e.__v_skip;const i=this._isReadonly,s=this._isShallow;if(t==="__v_isReactive")return!i;if(t==="__v_isReadonly")return i;if(t==="__v_isShallow")return s;if(t==="__v_raw")return r===(i?s?mg:Rd:s?bd:Ad).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(r)?e:void 0;const a=ae(e);if(!i){let c;if(a&&(c=ng[t]))return c;if(t==="hasOwnProperty")return sg}const l=Reflect.get(e,t,dt(e)?e:r);return(zn(t)?Td.has(t):ig(t))||(i||ut(e,"get",t),s)?l:dt(l)?a&&El(t)?l:l.value:Ne(l)?i?Sd(l):Sl(l):l}}class wd extends Id{constructor(e=!1){super(!1,e)}set(e,t,r,i){let s=e[t];if(!this._isShallow){const c=Bn(s);if(!Nt(r)&&!Bn(r)&&(s=we(s),r=we(r)),!ae(e)&&dt(s)&&!dt(r))return c?!1:(s.value=r,!0)}const a=ae(e)&&El(t)?Number(t)<e.length:Ae(e,t),l=Reflect.set(e,t,r,dt(e)?e:i);return e===we(i)&&(a?Vn(r,s)&&tn(e,"set",t,r):tn(e,"add",t,r)),l}deleteProperty(e,t){const r=Ae(e,t);e[t];const i=Reflect.deleteProperty(e,t);return i&&r&&tn(e,"delete",t,void 0),i}has(e,t){const r=Reflect.has(e,t);return(!zn(t)||!Td.has(t))&&ut(e,"has",t),r}ownKeys(e){return ut(e,"iterate",ae(e)?"length":sr),Reflect.ownKeys(e)}}class og extends Id{constructor(e=!1){super(!0,e)}set(e,t){return!0}deleteProperty(e,t){return!0}}const ag=new wd,lg=new og,cg=new wd(!0);const ja=n=>n,Ts=n=>Reflect.getPrototypeOf(n);function ug(n,e,t){return function(...r){const i=this.__v_raw,s=we(i),a=Cr(s),l=n==="entries"||n===Symbol.iterator&&a,c=n==="keys"&&a,d=i[n](...r),f=t?ja:e?Ws:et;return!e&&ut(s,"iterate",c?Ba:sr),{next(){const{value:m,done:E}=d.next();return E?{value:m,done:E}:{value:l?[f(m[0]),f(m[1])]:f(m),done:E}},[Symbol.iterator](){return this}}}}function Is(n){return function(...e){return n==="delete"?!1:n==="clear"?void 0:this}}function hg(n,e){const t={get(i){const s=this.__v_raw,a=we(s),l=we(i);n||(Vn(i,l)&&ut(a,"get",i),ut(a,"get",l));const{has:c}=Ts(a),d=e?ja:n?Ws:et;if(c.call(a,i))return d(s.get(i));if(c.call(a,l))return d(s.get(l));s!==a&&s.get(i)},get size(){const i=this.__v_raw;return!n&&ut(we(i),"iterate",sr),Reflect.get(i,"size",i)},has(i){const s=this.__v_raw,a=we(s),l=we(i);return n||(Vn(i,l)&&ut(a,"has",i),ut(a,"has",l)),i===l?s.has(i):s.has(i)||s.has(l)},forEach(i,s){const a=this,l=a.__v_raw,c=we(l),d=e?ja:n?Ws:et;return!n&&ut(c,"iterate",sr),l.forEach((f,m)=>i.call(s,d(f),d(m),a))}};return rt(t,n?{add:Is("add"),set:Is("set"),delete:Is("delete"),clear:Is("clear")}:{add(i){!e&&!Nt(i)&&!Bn(i)&&(i=we(i));const s=we(this);return Ts(s).has.call(s,i)||(s.add(i),tn(s,"add",i,i)),this},set(i,s){!e&&!Nt(s)&&!Bn(s)&&(s=we(s));const a=we(this),{has:l,get:c}=Ts(a);let d=l.call(a,i);d||(i=we(i),d=l.call(a,i));const f=c.call(a,i);return a.set(i,s),d?Vn(s,f)&&tn(a,"set",i,s):tn(a,"add",i,s),this},delete(i){const s=we(this),{has:a,get:l}=Ts(s);let c=a.call(s,i);c||(i=we(i),c=a.call(s,i)),l&&l.call(s,i);const d=s.delete(i);return c&&tn(s,"delete",i,void 0),d},clear(){const i=we(this),s=i.size!==0,a=i.clear();return s&&tn(i,"clear",void 0,void 0),a}}),["keys","values","entries",Symbol.iterator].forEach(i=>{t[i]=ug(i,n,e)}),t}function Rl(n,e){const t=hg(n,e);return(r,i,s)=>i==="__v_isReactive"?!n:i==="__v_isReadonly"?n:i==="__v_raw"?r:Reflect.get(Ae(t,i)&&i in r?t:r,i,s)}const dg={get:Rl(!1,!1)},fg={get:Rl(!1,!0)},pg={get:Rl(!0,!1)};const Ad=new WeakMap,bd=new WeakMap,Rd=new WeakMap,mg=new WeakMap;function gg(n){switch(n){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function _g(n){return n.__v_skip||!Object.isExtensible(n)?0:gg(qm(n))}function Sl(n){return Bn(n)?n:Pl(n,!1,ag,dg,Ad)}function yg(n){return Pl(n,!1,cg,fg,bd)}function Sd(n){return Pl(n,!0,lg,pg,Rd)}function Pl(n,e,t,r,i){if(!Ne(n)||n.__v_raw&&!(e&&n.__v_isReactive))return n;const s=_g(n);if(s===0)return n;const a=i.get(n);if(a)return a;const l=new Proxy(n,s===2?r:t);return i.set(n,l),l}function kr(n){return Bn(n)?kr(n.__v_raw):!!(n&&n.__v_isReactive)}function Bn(n){return!!(n&&n.__v_isReadonly)}function Nt(n){return!!(n&&n.__v_isShallow)}function Cl(n){return n?!!n.__v_raw:!1}function we(n){const e=n&&n.__v_raw;return e?we(e):n}function vg(n){return!Ae(n,"__v_skip")&&Object.isExtensible(n)&&Ma(n,"__v_skip",!0),n}const et=n=>Ne(n)?Sl(n):n,Ws=n=>Ne(n)?Sd(n):n;function dt(n){return n?n.__v_isRef===!0:!1}function mt(n){return Eg(n,!1)}function Eg(n,e){return dt(n)?n:new Tg(n,e)}class Tg{constructor(e,t){this.dep=new bl,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=t?e:we(e),this._value=t?e:et(e),this.__v_isShallow=t}get value(){return this.dep.track(),this._value}set value(e){const t=this._rawValue,r=this.__v_isShallow||Nt(e)||Bn(e);e=r?e:we(e),Vn(e,t)&&(this._rawValue=e,this._value=r?e:et(e),this.dep.trigger())}}function Ig(n){return dt(n)?n.value:n}const wg={get:(n,e,t)=>e==="__v_raw"?n:Ig(Reflect.get(n,e,t)),set:(n,e,t,r)=>{const i=n[e];return dt(i)&&!dt(t)?(i.value=t,!0):Reflect.set(n,e,t,r)}};function Pd(n){return kr(n)?n:new Proxy(n,wg)}class Ag{constructor(e,t,r){this.fn=e,this.setter=t,this._value=void 0,this.dep=new bl(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=Di-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!t,this.isSSR=r}notify(){if(this.flags|=16,!(this.flags&8)&&Ce!==this)return md(this,!0),!0}get value(){const e=this.dep.track();return yd(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function bg(n,e,t=!1){let r,i;return de(n)?r=n:(r=n.get,i=n.set),new Ag(r,i,t)}const ws={},Gs=new WeakMap;let nr;function Rg(n,e=!1,t=nr){if(t){let r=Gs.get(t);r||Gs.set(t,r=[]),r.push(n)}}function Sg(n,e,t=Pe){const{immediate:r,deep:i,once:s,scheduler:a,augmentJob:l,call:c}=t,d=H=>i?H:Nt(H)||i===!1||i===0?nn(H,1):nn(H);let f,m,E,R,k=!1,O=!1;if(dt(n)?(m=()=>n.value,k=Nt(n)):kr(n)?(m=()=>d(n),k=!0):ae(n)?(O=!0,k=n.some(H=>kr(H)||Nt(H)),m=()=>n.map(H=>{if(dt(H))return H.value;if(kr(H))return d(H);if(de(H))return c?c(H,2):H()})):de(n)?e?m=c?()=>c(n,2):n:m=()=>{if(E){cn();try{E()}finally{un()}}const H=nr;nr=f;try{return c?c(n,3,[R]):n(R)}finally{nr=H}}:m=Mt,e&&i){const H=m,fe=i===!0?1/0:i;m=()=>nn(H(),fe)}const F=Zm(),Y=()=>{f.stop(),F&&F.active&&vl(F.effects,f)};if(s&&e){const H=e;e=(...fe)=>{H(...fe),Y()}}let G=O?new Array(n.length).fill(ws):ws;const Q=H=>{if(!(!(f.flags&1)||!f.dirty&&!H))if(e){const fe=f.run();if(i||k||(O?fe.some((ve,w)=>Vn(ve,G[w])):Vn(fe,G))){E&&E();const ve=nr;nr=f;try{const w=[fe,G===ws?void 0:O&&G[0]===ws?[]:G,R];G=fe,c?c(e,3,w):e(...w)}finally{nr=ve}}}else f.run()};return l&&l(Q),f=new fd(m),f.scheduler=a?()=>a(Q,!1):Q,R=H=>Rg(H,!1,f),E=f.onStop=()=>{const H=Gs.get(f);if(H){if(c)c(H,4);else for(const fe of H)fe();Gs.delete(f)}},e?r?Q(!0):G=f.run():a?a(Q.bind(null,!0),!0):f.run(),Y.pause=f.pause.bind(f),Y.resume=f.resume.bind(f),Y.stop=Y,Y}function nn(n,e=1/0,t){if(e<=0||!Ne(n)||n.__v_skip||(t=t||new Set,t.has(n)))return n;if(t.add(n),e--,dt(n))nn(n.value,e,t);else if(ae(n))for(let r=0;r<n.length;r++)nn(n[r],e,t);else if(sd(n)||Cr(n))n.forEach(r=>{nn(r,e,t)});else if(ld(n)){for(const r in n)nn(n[r],e,t);for(const r of Object.getOwnPropertySymbols(n))Object.prototype.propertyIsEnumerable.call(n,r)&&nn(n[r],e,t)}return n}/**
* @vue/runtime-core v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function Hi(n,e,t,r){try{return r?n(...r):n()}catch(i){wo(i,e,t)}}function zt(n,e,t,r){if(de(n)){const i=Hi(n,e,t,r);return i&&od(i)&&i.catch(s=>{wo(s,e,t)}),i}if(ae(n)){const i=[];for(let s=0;s<n.length;s++)i.push(zt(n[s],e,t,r));return i}}function wo(n,e,t,r=!0){const i=e?e.vnode:null,{errorHandler:s,throwUnhandledErrorInProduction:a}=e&&e.appContext.config||Pe;if(e){let l=e.parent;const c=e.proxy,d=`https://vuejs.org/error-reference/#runtime-${t}`;for(;l;){const f=l.ec;if(f){for(let m=0;m<f.length;m++)if(f[m](n,c,d)===!1)return}l=l.parent}if(s){cn(),Hi(s,null,10,[n,c,d]),un();return}}Pg(n,t,i,r,a)}function Pg(n,e,t,r=!0,i=!1){if(i)throw n;console.error(n)}const _t=[];let Bt=-1;const Dr=[];let bn=null,Ir=0;const Cd=Promise.resolve();let Qs=null;function Cg(n){const e=Qs||Cd;return n?e.then(this?n.bind(this):n):e}function kg(n){let e=Bt+1,t=_t.length;for(;e<t;){const r=e+t>>>1,i=_t[r],s=Ni(i);s<n||s===n&&i.flags&2?e=r+1:t=r}return e}function kl(n){if(!(n.flags&1)){const e=Ni(n),t=_t[_t.length-1];!t||!(n.flags&2)&&e>=Ni(t)?_t.push(n):_t.splice(kg(e),0,n),n.flags|=1,kd()}}function kd(){Qs||(Qs=Cd.then(Vd))}function Dg(n){ae(n)?Dr.push(...n):bn&&n.id===-1?bn.splice(Ir+1,0,n):n.flags&1||(Dr.push(n),n.flags|=1),kd()}function yu(n,e,t=Bt+1){for(;t<_t.length;t++){const r=_t[t];if(r&&r.flags&2){if(n&&r.id!==n.uid)continue;_t.splice(t,1),t--,r.flags&4&&(r.flags&=-2),r(),r.flags&4||(r.flags&=-2)}}}function Dd(n){if(Dr.length){const e=[...new Set(Dr)].sort((t,r)=>Ni(t)-Ni(r));if(Dr.length=0,bn){bn.push(...e);return}for(bn=e,Ir=0;Ir<bn.length;Ir++){const t=bn[Ir];t.flags&4&&(t.flags&=-2),t.flags&8||t(),t.flags&=-2}bn=null,Ir=0}}const Ni=n=>n.id==null?n.flags&2?-1:1/0:n.id;function Vd(n){const e=Mt;try{for(Bt=0;Bt<_t.length;Bt++){const t=_t[Bt];t&&!(t.flags&8)&&(t.flags&4&&(t.flags&=-2),Hi(t,t.i,t.i?15:14),t.flags&4||(t.flags&=-2))}}finally{for(;Bt<_t.length;Bt++){const t=_t[Bt];t&&(t.flags&=-2)}Bt=-1,_t.length=0,Dd(),Qs=null,(_t.length||Dr.length)&&Vd()}}let Dt=null,Nd=null;function Js(n){const e=Dt;return Dt=n,Nd=n&&n.type.__scopeId||null,e}function Vg(n,e=Dt,t){if(!e||n._n)return n;const r=(...i)=>{r._d&&Ru(-1);const s=Js(e);let a;try{a=n(...i)}finally{Js(s),r._d&&Ru(1)}return a};return r._n=!0,r._c=!0,r._d=!0,r}function As(n,e){if(Dt===null)return n;const t=So(Dt),r=n.dirs||(n.dirs=[]);for(let i=0;i<e.length;i++){let[s,a,l,c=Pe]=e[i];s&&(de(s)&&(s={mounted:s,updated:s}),s.deep&&nn(a),r.push({dir:s,instance:t,value:a,oldValue:void 0,arg:l,modifiers:c}))}return n}function er(n,e,t,r){const i=n.dirs,s=e&&e.dirs;for(let a=0;a<i.length;a++){const l=i[a];s&&(l.oldValue=s[a].value);let c=l.dir[r];c&&(cn(),zt(c,t,8,[n.el,l,n,e]),un())}}const Ng=Symbol("_vte"),Og=n=>n.__isTeleport;function Dl(n,e){n.shapeFlag&6&&n.component?(n.transition=e,Dl(n.component.subTree,e)):n.shapeFlag&128?(n.ssContent.transition=e.clone(n.ssContent),n.ssFallback.transition=e.clone(n.ssFallback)):n.transition=e}function Od(n){n.ids=[n.ids[0]+n.ids[2]+++"-",0,0]}function Ii(n,e,t,r,i=!1){if(ae(n)){n.forEach((k,O)=>Ii(k,e&&(ae(e)?e[O]:e),t,r,i));return}if(wi(r)&&!i){r.shapeFlag&512&&r.type.__asyncResolved&&r.component.subTree.component&&Ii(n,e,t,r.component.subTree);return}const s=r.shapeFlag&4?So(r.component):r.el,a=i?null:s,{i:l,r:c}=n,d=e&&e.r,f=l.refs===Pe?l.refs={}:l.refs,m=l.setupState,E=we(m),R=m===Pe?()=>!1:k=>Ae(E,k);if(d!=null&&d!==c&&(Be(d)?(f[d]=null,R(d)&&(m[d]=null)):dt(d)&&(d.value=null)),de(c))Hi(c,l,12,[a,f]);else{const k=Be(c),O=dt(c);if(k||O){const F=()=>{if(n.f){const Y=k?R(c)?m[c]:f[c]:c.value;i?ae(Y)&&vl(Y,s):ae(Y)?Y.includes(s)||Y.push(s):k?(f[c]=[s],R(c)&&(m[c]=f[c])):(c.value=[s],n.k&&(f[n.k]=c.value))}else k?(f[c]=a,R(c)&&(m[c]=a)):O&&(c.value=a,n.k&&(f[n.k]=a))};a?(F.id=-1,Rt(F,t)):F()}}}Eo().requestIdleCallback;Eo().cancelIdleCallback;const wi=n=>!!n.type.__asyncLoader,xd=n=>n.type.__isKeepAlive;function xg(n,e){Md(n,"a",e)}function Mg(n,e){Md(n,"da",e)}function Md(n,e,t=yt){const r=n.__wdc||(n.__wdc=()=>{let i=t;for(;i;){if(i.isDeactivated)return;i=i.parent}return n()});if(Ao(e,r,t),t){let i=t.parent;for(;i&&i.parent;)xd(i.parent.vnode)&&Lg(r,e,t,i),i=i.parent}}function Lg(n,e,t,r){const i=Ao(e,n,r,!0);Fd(()=>{vl(r[e],i)},t)}function Ao(n,e,t=yt,r=!1){if(t){const i=t[n]||(t[n]=[]),s=e.__weh||(e.__weh=(...a)=>{cn();const l=Ki(t),c=zt(e,t,n,a);return l(),un(),c});return r?i.unshift(s):i.push(s),s}}const gn=n=>(e,t=yt)=>{(!xi||n==="sp")&&Ao(n,(...r)=>e(...r),t)},Fg=gn("bm"),Ld=gn("m"),Ug=gn("bu"),Bg=gn("u"),jg=gn("bum"),Fd=gn("um"),$g=gn("sp"),qg=gn("rtg"),Hg=gn("rtc");function Kg(n,e=yt){Ao("ec",n,e)}const zg=Symbol.for("v-ndc");function bs(n,e,t,r){let i;const s=t&&t[r],a=ae(n);if(a||Be(n)){const l=a&&kr(n);let c=!1,d=!1;l&&(c=!Nt(n),d=Bn(n),n=Io(n)),i=new Array(n.length);for(let f=0,m=n.length;f<m;f++)i[f]=e(c?d?Ws(et(n[f])):et(n[f]):n[f],f,void 0,s&&s[f])}else if(typeof n=="number"){i=new Array(n);for(let l=0;l<n;l++)i[l]=e(l+1,l,void 0,s&&s[l])}else if(Ne(n))if(n[Symbol.iterator])i=Array.from(n,(l,c)=>e(l,c,void 0,s&&s[c]));else{const l=Object.keys(n);i=new Array(l.length);for(let c=0,d=l.length;c<d;c++){const f=l[c];i[c]=e(n[f],f,c,s&&s[c])}}else i=[];return t&&(t[r]=i),i}const $a=n=>n?of(n)?So(n):$a(n.parent):null,Ai=rt(Object.create(null),{$:n=>n,$el:n=>n.vnode.el,$data:n=>n.data,$props:n=>n.props,$attrs:n=>n.attrs,$slots:n=>n.slots,$refs:n=>n.refs,$parent:n=>$a(n.parent),$root:n=>$a(n.root),$host:n=>n.ce,$emit:n=>n.emit,$options:n=>Vl(n),$forceUpdate:n=>n.f||(n.f=()=>{kl(n.update)}),$nextTick:n=>n.n||(n.n=Cg.bind(n.proxy)),$watch:n=>p_.bind(n)}),ga=(n,e)=>n!==Pe&&!n.__isScriptSetup&&Ae(n,e),Wg={get({_:n},e){if(e==="__v_skip")return!0;const{ctx:t,setupState:r,data:i,props:s,accessCache:a,type:l,appContext:c}=n;let d;if(e[0]!=="$"){const R=a[e];if(R!==void 0)switch(R){case 1:return r[e];case 2:return i[e];case 4:return t[e];case 3:return s[e]}else{if(ga(r,e))return a[e]=1,r[e];if(i!==Pe&&Ae(i,e))return a[e]=2,i[e];if((d=n.propsOptions[0])&&Ae(d,e))return a[e]=3,s[e];if(t!==Pe&&Ae(t,e))return a[e]=4,t[e];qa&&(a[e]=0)}}const f=Ai[e];let m,E;if(f)return e==="$attrs"&&ut(n.attrs,"get",""),f(n);if((m=l.__cssModules)&&(m=m[e]))return m;if(t!==Pe&&Ae(t,e))return a[e]=4,t[e];if(E=c.config.globalProperties,Ae(E,e))return E[e]},set({_:n},e,t){const{data:r,setupState:i,ctx:s}=n;return ga(i,e)?(i[e]=t,!0):r!==Pe&&Ae(r,e)?(r[e]=t,!0):Ae(n.props,e)||e[0]==="$"&&e.slice(1)in n?!1:(s[e]=t,!0)},has({_:{data:n,setupState:e,accessCache:t,ctx:r,appContext:i,propsOptions:s}},a){let l;return!!t[a]||n!==Pe&&Ae(n,a)||ga(e,a)||(l=s[0])&&Ae(l,a)||Ae(r,a)||Ae(Ai,a)||Ae(i.config.globalProperties,a)},defineProperty(n,e,t){return t.get!=null?n._.accessCache[e]=0:Ae(t,"value")&&this.set(n,e,t.value,null),Reflect.defineProperty(n,e,t)}};function vu(n){return ae(n)?n.reduce((e,t)=>(e[t]=null,e),{}):n}let qa=!0;function Gg(n){const e=Vl(n),t=n.proxy,r=n.ctx;qa=!1,e.beforeCreate&&Eu(e.beforeCreate,n,"bc");const{data:i,computed:s,methods:a,watch:l,provide:c,inject:d,created:f,beforeMount:m,mounted:E,beforeUpdate:R,updated:k,activated:O,deactivated:F,beforeDestroy:Y,beforeUnmount:G,destroyed:Q,unmounted:H,render:fe,renderTracked:ve,renderTriggered:w,errorCaptured:g,serverPrefetch:v,expose:T,inheritAttrs:A,components:S,directives:y,filters:je}=e;if(d&&Qg(d,r,null),a)for(const Ee in a){const pe=a[Ee];de(pe)&&(r[Ee]=pe.bind(t))}if(i){const Ee=i.call(t,t);Ne(Ee)&&(n.data=Sl(Ee))}if(qa=!0,s)for(const Ee in s){const pe=s[Ee],st=de(pe)?pe.bind(t,t):de(pe.get)?pe.get.bind(t,t):Mt,W=!de(pe)&&de(pe.set)?pe.set.bind(t):Mt,B=x_({get:st,set:W});Object.defineProperty(r,Ee,{enumerable:!0,configurable:!0,get:()=>B.value,set:U=>B.value=U})}if(l)for(const Ee in l)Ud(l[Ee],r,t,Ee);if(c){const Ee=de(c)?c.call(t):c;Reflect.ownKeys(Ee).forEach(pe=>{t_(pe,Ee[pe])})}f&&Eu(f,n,"c");function Fe(Ee,pe){ae(pe)?pe.forEach(st=>Ee(st.bind(t))):pe&&Ee(pe.bind(t))}if(Fe(Fg,m),Fe(Ld,E),Fe(Ug,R),Fe(Bg,k),Fe(xg,O),Fe(Mg,F),Fe(Kg,g),Fe(Hg,ve),Fe(qg,w),Fe(jg,G),Fe(Fd,H),Fe($g,v),ae(T))if(T.length){const Ee=n.exposed||(n.exposed={});T.forEach(pe=>{Object.defineProperty(Ee,pe,{get:()=>t[pe],set:st=>t[pe]=st})})}else n.exposed||(n.exposed={});fe&&n.render===Mt&&(n.render=fe),A!=null&&(n.inheritAttrs=A),S&&(n.components=S),y&&(n.directives=y),v&&Od(n)}function Qg(n,e,t=Mt){ae(n)&&(n=Ha(n));for(const r in n){const i=n[r];let s;Ne(i)?"default"in i?s=xs(i.from||r,i.default,!0):s=xs(i.from||r):s=xs(i),dt(s)?Object.defineProperty(e,r,{enumerable:!0,configurable:!0,get:()=>s.value,set:a=>s.value=a}):e[r]=s}}function Eu(n,e,t){zt(ae(n)?n.map(r=>r.bind(e.proxy)):n.bind(e.proxy),e,t)}function Ud(n,e,t,r){let i=r.includes(".")?Xd(t,r):()=>t[r];if(Be(n)){const s=e[n];de(s)&&ya(i,s)}else if(de(n))ya(i,n.bind(t));else if(Ne(n))if(ae(n))n.forEach(s=>Ud(s,e,t,r));else{const s=de(n.handler)?n.handler.bind(t):e[n.handler];de(s)&&ya(i,s,n)}}function Vl(n){const e=n.type,{mixins:t,extends:r}=e,{mixins:i,optionsCache:s,config:{optionMergeStrategies:a}}=n.appContext,l=s.get(e);let c;return l?c=l:!i.length&&!t&&!r?c=e:(c={},i.length&&i.forEach(d=>Ys(c,d,a,!0)),Ys(c,e,a)),Ne(e)&&s.set(e,c),c}function Ys(n,e,t,r=!1){const{mixins:i,extends:s}=e;s&&Ys(n,s,t,!0),i&&i.forEach(a=>Ys(n,a,t,!0));for(const a in e)if(!(r&&a==="expose")){const l=Jg[a]||t&&t[a];n[a]=l?l(n[a],e[a]):e[a]}return n}const Jg={data:Tu,props:Iu,emits:Iu,methods:mi,computed:mi,beforeCreate:gt,created:gt,beforeMount:gt,mounted:gt,beforeUpdate:gt,updated:gt,beforeDestroy:gt,beforeUnmount:gt,destroyed:gt,unmounted:gt,activated:gt,deactivated:gt,errorCaptured:gt,serverPrefetch:gt,components:mi,directives:mi,watch:Xg,provide:Tu,inject:Yg};function Tu(n,e){return e?n?function(){return rt(de(n)?n.call(this,this):n,de(e)?e.call(this,this):e)}:e:n}function Yg(n,e){return mi(Ha(n),Ha(e))}function Ha(n){if(ae(n)){const e={};for(let t=0;t<n.length;t++)e[n[t]]=n[t];return e}return n}function gt(n,e){return n?[...new Set([].concat(n,e))]:e}function mi(n,e){return n?rt(Object.create(null),n,e):e}function Iu(n,e){return n?ae(n)&&ae(e)?[...new Set([...n,...e])]:rt(Object.create(null),vu(n),vu(e??{})):e}function Xg(n,e){if(!n)return e;if(!e)return n;const t=rt(Object.create(null),n);for(const r in e)t[r]=gt(n[r],e[r]);return t}function Bd(){return{app:null,config:{isNativeTag:jm,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let Zg=0;function e_(n,e){return function(r,i=null){de(r)||(r=rt({},r)),i!=null&&!Ne(i)&&(i=null);const s=Bd(),a=new WeakSet,l=[];let c=!1;const d=s.app={_uid:Zg++,_component:r,_props:i,_container:null,_context:s,_instance:null,version:M_,get config(){return s.config},set config(f){},use(f,...m){return a.has(f)||(f&&de(f.install)?(a.add(f),f.install(d,...m)):de(f)&&(a.add(f),f(d,...m))),d},mixin(f){return s.mixins.includes(f)||s.mixins.push(f),d},component(f,m){return m?(s.components[f]=m,d):s.components[f]},directive(f,m){return m?(s.directives[f]=m,d):s.directives[f]},mount(f,m,E){if(!c){const R=d._ceVNode||ln(r,i);return R.appContext=s,E===!0?E="svg":E===!1&&(E=void 0),m&&e?e(R,f):n(R,f,E),c=!0,d._container=f,f.__vue_app__=d,So(R.component)}},onUnmount(f){l.push(f)},unmount(){c&&(zt(l,d._instance,16),n(null,d._container),delete d._container.__vue_app__)},provide(f,m){return s.provides[f]=m,d},runWithContext(f){const m=Vr;Vr=d;try{return f()}finally{Vr=m}}};return d}}let Vr=null;function t_(n,e){if(yt){let t=yt.provides;const r=yt.parent&&yt.parent.provides;r===t&&(t=yt.provides=Object.create(r)),t[n]=e}}function xs(n,e,t=!1){const r=yt||Dt;if(r||Vr){let i=Vr?Vr._context.provides:r?r.parent==null||r.ce?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:void 0;if(i&&n in i)return i[n];if(arguments.length>1)return t&&de(e)?e.call(r&&r.proxy):e}}const jd={},$d=()=>Object.create(jd),qd=n=>Object.getPrototypeOf(n)===jd;function n_(n,e,t,r=!1){const i={},s=$d();n.propsDefaults=Object.create(null),Hd(n,e,i,s);for(const a in n.propsOptions[0])a in i||(i[a]=void 0);t?n.props=r?i:yg(i):n.type.props?n.props=i:n.props=s,n.attrs=s}function r_(n,e,t,r){const{props:i,attrs:s,vnode:{patchFlag:a}}=n,l=we(i),[c]=n.propsOptions;let d=!1;if((r||a>0)&&!(a&16)){if(a&8){const f=n.vnode.dynamicProps;for(let m=0;m<f.length;m++){let E=f[m];if(bo(n.emitsOptions,E))continue;const R=e[E];if(c)if(Ae(s,E))R!==s[E]&&(s[E]=R,d=!0);else{const k=Un(E);i[k]=Ka(c,l,k,R,n,!1)}else R!==s[E]&&(s[E]=R,d=!0)}}}else{Hd(n,e,i,s)&&(d=!0);let f;for(const m in l)(!e||!Ae(e,m)&&((f=Wn(m))===m||!Ae(e,f)))&&(c?t&&(t[m]!==void 0||t[f]!==void 0)&&(i[m]=Ka(c,l,m,void 0,n,!0)):delete i[m]);if(s!==l)for(const m in s)(!e||!Ae(e,m))&&(delete s[m],d=!0)}d&&tn(n.attrs,"set","")}function Hd(n,e,t,r){const[i,s]=n.propsOptions;let a=!1,l;if(e)for(let c in e){if(vi(c))continue;const d=e[c];let f;i&&Ae(i,f=Un(c))?!s||!s.includes(f)?t[f]=d:(l||(l={}))[f]=d:bo(n.emitsOptions,c)||(!(c in r)||d!==r[c])&&(r[c]=d,a=!0)}if(s){const c=we(t),d=l||Pe;for(let f=0;f<s.length;f++){const m=s[f];t[m]=Ka(i,c,m,d[m],n,!Ae(d,m))}}return a}function Ka(n,e,t,r,i,s){const a=n[t];if(a!=null){const l=Ae(a,"default");if(l&&r===void 0){const c=a.default;if(a.type!==Function&&!a.skipFactory&&de(c)){const{propsDefaults:d}=i;if(t in d)r=d[t];else{const f=Ki(i);r=d[t]=c.call(null,e),f()}}else r=c;i.ce&&i.ce._setProp(t,r)}a[0]&&(s&&!l?r=!1:a[1]&&(r===""||r===Wn(t))&&(r=!0))}return r}const i_=new WeakMap;function Kd(n,e,t=!1){const r=t?i_:e.propsCache,i=r.get(n);if(i)return i;const s=n.props,a={},l=[];let c=!1;if(!de(n)){const f=m=>{c=!0;const[E,R]=Kd(m,e,!0);rt(a,E),R&&l.push(...R)};!t&&e.mixins.length&&e.mixins.forEach(f),n.extends&&f(n.extends),n.mixins&&n.mixins.forEach(f)}if(!s&&!c)return Ne(n)&&r.set(n,Pr),Pr;if(ae(s))for(let f=0;f<s.length;f++){const m=Un(s[f]);wu(m)&&(a[m]=Pe)}else if(s)for(const f in s){const m=Un(f);if(wu(m)){const E=s[f],R=a[m]=ae(E)||de(E)?{type:E}:rt({},E),k=R.type;let O=!1,F=!0;if(ae(k))for(let Y=0;Y<k.length;++Y){const G=k[Y],Q=de(G)&&G.name;if(Q==="Boolean"){O=!0;break}else Q==="String"&&(F=!1)}else O=de(k)&&k.name==="Boolean";R[0]=O,R[1]=F,(O||Ae(R,"default"))&&l.push(m)}}const d=[a,l];return Ne(n)&&r.set(n,d),d}function wu(n){return n[0]!=="$"&&!vi(n)}const Nl=n=>n[0]==="_"||n==="$stable",Ol=n=>ae(n)?n.map(jt):[jt(n)],s_=(n,e,t)=>{if(e._n)return e;const r=Vg((...i)=>Ol(e(...i)),t);return r._c=!1,r},zd=(n,e,t)=>{const r=n._ctx;for(const i in n){if(Nl(i))continue;const s=n[i];if(de(s))e[i]=s_(i,s,r);else if(s!=null){const a=Ol(s);e[i]=()=>a}}},Wd=(n,e)=>{const t=Ol(e);n.slots.default=()=>t},Gd=(n,e,t)=>{for(const r in e)(t||!Nl(r))&&(n[r]=e[r])},o_=(n,e,t)=>{const r=n.slots=$d();if(n.vnode.shapeFlag&32){const i=e.__;i&&Ma(r,"__",i,!0);const s=e._;s?(Gd(r,e,t),t&&Ma(r,"_",s,!0)):zd(e,r)}else e&&Wd(n,e)},a_=(n,e,t)=>{const{vnode:r,slots:i}=n;let s=!0,a=Pe;if(r.shapeFlag&32){const l=e._;l?t&&l===1?s=!1:Gd(i,e,t):(s=!e.$stable,zd(e,i)),a=e}else e&&(Wd(n,e),a={default:1});if(s)for(const l in i)!Nl(l)&&a[l]==null&&delete i[l]},Rt=T_;function l_(n){return c_(n)}function c_(n,e){const t=Eo();t.__VUE__=!0;const{insert:r,remove:i,patchProp:s,createElement:a,createText:l,createComment:c,setText:d,setElementText:f,parentNode:m,nextSibling:E,setScopeId:R=Mt,insertStaticContent:k}=n,O=(_,I,C,M=null,D=null,x=null,K=void 0,$=null,j=!!I.dynamicChildren)=>{if(_===I)return;_&&!fi(_,I)&&(M=De(_),U(_,D,x,!0),_=null),I.patchFlag===-2&&(j=!1,I.dynamicChildren=null);const{type:L,ref:te,shapeFlag:z}=I;switch(L){case Ro:F(_,I,C,M);break;case jn:Y(_,I,C,M);break;case Ea:_==null&&G(I,C,M,K);break;case Tt:S(_,I,C,M,D,x,K,$,j);break;default:z&1?fe(_,I,C,M,D,x,K,$,j):z&6?y(_,I,C,M,D,x,K,$,j):(z&64||z&128)&&L.process(_,I,C,M,D,x,K,$,j,wt)}te!=null&&D?Ii(te,_&&_.ref,x,I||_,!I):te==null&&_&&_.ref!=null&&Ii(_.ref,null,x,_,!0)},F=(_,I,C,M)=>{if(_==null)r(I.el=l(I.children),C,M);else{const D=I.el=_.el;I.children!==_.children&&d(D,I.children)}},Y=(_,I,C,M)=>{_==null?r(I.el=c(I.children||""),C,M):I.el=_.el},G=(_,I,C,M)=>{[_.el,_.anchor]=k(_.children,I,C,M,_.el,_.anchor)},Q=({el:_,anchor:I},C,M)=>{let D;for(;_&&_!==I;)D=E(_),r(_,C,M),_=D;r(I,C,M)},H=({el:_,anchor:I})=>{let C;for(;_&&_!==I;)C=E(_),i(_),_=C;i(I)},fe=(_,I,C,M,D,x,K,$,j)=>{I.type==="svg"?K="svg":I.type==="math"&&(K="mathml"),_==null?ve(I,C,M,D,x,K,$,j):v(_,I,D,x,K,$,j)},ve=(_,I,C,M,D,x,K,$)=>{let j,L;const{props:te,shapeFlag:z,transition:X,dirs:ie}=_;if(j=_.el=a(_.type,x,te&&te.is,te),z&8?f(j,_.children):z&16&&g(_.children,j,null,M,D,_a(_,x),K,$),ie&&er(_,null,M,"created"),w(j,_,_.scopeId,K,M),te){for(const ue in te)ue!=="value"&&!vi(ue)&&s(j,ue,null,te[ue],x,M);"value"in te&&s(j,"value",null,te.value,x),(L=te.onVnodeBeforeMount)&&Ut(L,M,_)}ie&&er(_,null,M,"beforeMount");const re=u_(D,X);re&&X.beforeEnter(j),r(j,I,C),((L=te&&te.onVnodeMounted)||re||ie)&&Rt(()=>{L&&Ut(L,M,_),re&&X.enter(j),ie&&er(_,null,M,"mounted")},D)},w=(_,I,C,M,D)=>{if(C&&R(_,C),M)for(let x=0;x<M.length;x++)R(_,M[x]);if(D){let x=D.subTree;if(I===x||ef(x.type)&&(x.ssContent===I||x.ssFallback===I)){const K=D.vnode;w(_,K,K.scopeId,K.slotScopeIds,D.parent)}}},g=(_,I,C,M,D,x,K,$,j=0)=>{for(let L=j;L<_.length;L++){const te=_[L]=$?Rn(_[L]):jt(_[L]);O(null,te,I,C,M,D,x,K,$)}},v=(_,I,C,M,D,x,K)=>{const $=I.el=_.el;let{patchFlag:j,dynamicChildren:L,dirs:te}=I;j|=_.patchFlag&16;const z=_.props||Pe,X=I.props||Pe;let ie;if(C&&tr(C,!1),(ie=X.onVnodeBeforeUpdate)&&Ut(ie,C,I,_),te&&er(I,_,C,"beforeUpdate"),C&&tr(C,!0),(z.innerHTML&&X.innerHTML==null||z.textContent&&X.textContent==null)&&f($,""),L?T(_.dynamicChildren,L,$,C,M,_a(I,D),x):K||pe(_,I,$,null,C,M,_a(I,D),x,!1),j>0){if(j&16)A($,z,X,C,D);else if(j&2&&z.class!==X.class&&s($,"class",null,X.class,D),j&4&&s($,"style",z.style,X.style,D),j&8){const re=I.dynamicProps;for(let ue=0;ue<re.length;ue++){const _e=re[ue],Je=z[_e],$e=X[_e];($e!==Je||_e==="value")&&s($,_e,Je,$e,D,C)}}j&1&&_.children!==I.children&&f($,I.children)}else!K&&L==null&&A($,z,X,C,D);((ie=X.onVnodeUpdated)||te)&&Rt(()=>{ie&&Ut(ie,C,I,_),te&&er(I,_,C,"updated")},M)},T=(_,I,C,M,D,x,K)=>{for(let $=0;$<I.length;$++){const j=_[$],L=I[$],te=j.el&&(j.type===Tt||!fi(j,L)||j.shapeFlag&198)?m(j.el):C;O(j,L,te,null,M,D,x,K,!0)}},A=(_,I,C,M,D)=>{if(I!==C){if(I!==Pe)for(const x in I)!vi(x)&&!(x in C)&&s(_,x,I[x],null,D,M);for(const x in C){if(vi(x))continue;const K=C[x],$=I[x];K!==$&&x!=="value"&&s(_,x,$,K,D,M)}"value"in C&&s(_,"value",I.value,C.value,D)}},S=(_,I,C,M,D,x,K,$,j)=>{const L=I.el=_?_.el:l(""),te=I.anchor=_?_.anchor:l("");let{patchFlag:z,dynamicChildren:X,slotScopeIds:ie}=I;ie&&($=$?$.concat(ie):ie),_==null?(r(L,C,M),r(te,C,M),g(I.children||[],C,te,D,x,K,$,j)):z>0&&z&64&&X&&_.dynamicChildren?(T(_.dynamicChildren,X,C,D,x,K,$),(I.key!=null||D&&I===D.subTree)&&Qd(_,I,!0)):pe(_,I,C,te,D,x,K,$,j)},y=(_,I,C,M,D,x,K,$,j)=>{I.slotScopeIds=$,_==null?I.shapeFlag&512?D.ctx.activate(I,C,M,K,j):je(I,C,M,D,x,K,j):Ft(_,I,j)},je=(_,I,C,M,D,x,K)=>{const $=_.component=C_(_,M,D);if(xd(_)&&($.ctx.renderer=wt),k_($,!1,K),$.asyncDep){if(D&&D.registerDep($,Fe,K),!_.el){const j=$.subTree=ln(jn);Y(null,j,I,C)}}else Fe($,_,I,C,D,x,K)},Ft=(_,I,C)=>{const M=I.component=_.component;if(v_(_,I,C))if(M.asyncDep&&!M.asyncResolved){Ee(M,I,C);return}else M.next=I,M.update();else I.el=_.el,M.vnode=I},Fe=(_,I,C,M,D,x,K)=>{const $=()=>{if(_.isMounted){let{next:z,bu:X,u:ie,parent:re,vnode:ue}=_;{const qe=Jd(_);if(qe){z&&(z.el=ue.el,Ee(_,z,K)),qe.asyncDep.then(()=>{_.isUnmounted||$()});return}}let _e=z,Je;tr(_,!1),z?(z.el=ue.el,Ee(_,z,K)):z=ue,X&&Os(X),(Je=z.props&&z.props.onVnodeBeforeUpdate)&&Ut(Je,re,z,ue),tr(_,!0);const $e=va(_),At=_.subTree;_.subTree=$e,O(At,$e,m(At.el),De(At),_,D,x),z.el=$e.el,_e===null&&E_(_,$e.el),ie&&Rt(ie,D),(Je=z.props&&z.props.onVnodeUpdated)&&Rt(()=>Ut(Je,re,z,ue),D)}else{let z;const{el:X,props:ie}=I,{bm:re,m:ue,parent:_e,root:Je,type:$e}=_,At=wi(I);if(tr(_,!1),re&&Os(re),!At&&(z=ie&&ie.onVnodeBeforeMount)&&Ut(z,_e,I),tr(_,!0),X&&Qn){const qe=()=>{_.subTree=va(_),Qn(X,_.subTree,_,D,null)};At&&$e.__asyncHydrate?$e.__asyncHydrate(X,_,qe):qe()}else{Je.ce&&Je.ce._def.shadowRoot!==!1&&Je.ce._injectChildStyle($e);const qe=_.subTree=va(_);O(null,qe,C,M,_,D,x),I.el=qe.el}if(ue&&Rt(ue,D),!At&&(z=ie&&ie.onVnodeMounted)){const qe=I;Rt(()=>Ut(z,_e,qe),D)}(I.shapeFlag&256||_e&&wi(_e.vnode)&&_e.vnode.shapeFlag&256)&&_.a&&Rt(_.a,D),_.isMounted=!0,I=C=M=null}};_.scope.on();const j=_.effect=new fd($);_.scope.off();const L=_.update=j.run.bind(j),te=_.job=j.runIfDirty.bind(j);te.i=_,te.id=_.uid,j.scheduler=()=>kl(te),tr(_,!0),L()},Ee=(_,I,C)=>{I.component=_;const M=_.vnode.props;_.vnode=I,_.next=null,r_(_,I.props,M,C),a_(_,I.children,C),cn(),yu(_),un()},pe=(_,I,C,M,D,x,K,$,j=!1)=>{const L=_&&_.children,te=_?_.shapeFlag:0,z=I.children,{patchFlag:X,shapeFlag:ie}=I;if(X>0){if(X&128){W(L,z,C,M,D,x,K,$,j);return}else if(X&256){st(L,z,C,M,D,x,K,$,j);return}}ie&8?(te&16&&be(L,D,x),z!==L&&f(C,z)):te&16?ie&16?W(L,z,C,M,D,x,K,$,j):be(L,D,x,!0):(te&8&&f(C,""),ie&16&&g(z,C,M,D,x,K,$,j))},st=(_,I,C,M,D,x,K,$,j)=>{_=_||Pr,I=I||Pr;const L=_.length,te=I.length,z=Math.min(L,te);let X;for(X=0;X<z;X++){const ie=I[X]=j?Rn(I[X]):jt(I[X]);O(_[X],ie,C,null,D,x,K,$,j)}L>te?be(_,D,x,!0,!1,z):g(I,C,M,D,x,K,$,j,z)},W=(_,I,C,M,D,x,K,$,j)=>{let L=0;const te=I.length;let z=_.length-1,X=te-1;for(;L<=z&&L<=X;){const ie=_[L],re=I[L]=j?Rn(I[L]):jt(I[L]);if(fi(ie,re))O(ie,re,C,null,D,x,K,$,j);else break;L++}for(;L<=z&&L<=X;){const ie=_[z],re=I[X]=j?Rn(I[X]):jt(I[X]);if(fi(ie,re))O(ie,re,C,null,D,x,K,$,j);else break;z--,X--}if(L>z){if(L<=X){const ie=X+1,re=ie<te?I[ie].el:M;for(;L<=X;)O(null,I[L]=j?Rn(I[L]):jt(I[L]),C,re,D,x,K,$,j),L++}}else if(L>X)for(;L<=z;)U(_[L],D,x,!0),L++;else{const ie=L,re=L,ue=new Map;for(L=re;L<=X;L++){const Ye=I[L]=j?Rn(I[L]):jt(I[L]);Ye.key!=null&&ue.set(Ye.key,L)}let _e,Je=0;const $e=X-re+1;let At=!1,qe=0;const En=new Array($e);for(L=0;L<$e;L++)En[L]=0;for(L=ie;L<=z;L++){const Ye=_[L];if(Je>=$e){U(Ye,D,x,!0);continue}let kt;if(Ye.key!=null)kt=ue.get(Ye.key);else for(_e=re;_e<=X;_e++)if(En[_e-re]===0&&fi(Ye,I[_e])){kt=_e;break}kt===void 0?U(Ye,D,x,!0):(En[kt-re]=L+1,kt>=qe?qe=kt:At=!0,O(Ye,I[kt],C,null,D,x,K,$,j),Je++)}const Zr=At?h_(En):Pr;for(_e=Zr.length-1,L=$e-1;L>=0;L--){const Ye=re+L,kt=I[Ye],ss=Ye+1<te?I[Ye+1].el:M;En[L]===0?O(null,kt,C,ss,D,x,K,$,j):At&&(_e<0||L!==Zr[_e]?B(kt,C,ss,2):_e--)}}},B=(_,I,C,M,D=null)=>{const{el:x,type:K,transition:$,children:j,shapeFlag:L}=_;if(L&6){B(_.component.subTree,I,C,M);return}if(L&128){_.suspense.move(I,C,M);return}if(L&64){K.move(_,I,C,wt);return}if(K===Tt){r(x,I,C);for(let z=0;z<j.length;z++)B(j[z],I,C,M);r(_.anchor,I,C);return}if(K===Ea){Q(_,I,C);return}if(M!==2&&L&1&&$)if(M===0)$.beforeEnter(x),r(x,I,C),Rt(()=>$.enter(x),D);else{const{leave:z,delayLeave:X,afterLeave:ie}=$,re=()=>{_.ctx.isUnmounted?i(x):r(x,I,C)},ue=()=>{z(x,()=>{re(),ie&&ie()})};X?X(x,re,ue):ue()}else r(x,I,C)},U=(_,I,C,M=!1,D=!1)=>{const{type:x,props:K,ref:$,children:j,dynamicChildren:L,shapeFlag:te,patchFlag:z,dirs:X,cacheIndex:ie}=_;if(z===-2&&(D=!1),$!=null&&(cn(),Ii($,null,C,_,!0),un()),ie!=null&&(I.renderCache[ie]=void 0),te&256){I.ctx.deactivate(_);return}const re=te&1&&X,ue=!wi(_);let _e;if(ue&&(_e=K&&K.onVnodeBeforeUnmount)&&Ut(_e,I,_),te&6)We(_.component,C,M);else{if(te&128){_.suspense.unmount(C,M);return}re&&er(_,null,I,"beforeUnmount"),te&64?_.type.remove(_,I,C,wt,M):L&&!L.hasOnce&&(x!==Tt||z>0&&z&64)?be(L,I,C,!1,!0):(x===Tt&&z&384||!D&&te&16)&&be(j,I,C),M&&Z(_)}(ue&&(_e=K&&K.onVnodeUnmounted)||re)&&Rt(()=>{_e&&Ut(_e,I,_),re&&er(_,null,I,"unmounted")},C)},Z=_=>{const{type:I,el:C,anchor:M,transition:D}=_;if(I===Tt){Qe(C,M);return}if(I===Ea){H(_);return}const x=()=>{i(C),D&&!D.persisted&&D.afterLeave&&D.afterLeave()};if(_.shapeFlag&1&&D&&!D.persisted){const{leave:K,delayLeave:$}=D,j=()=>K(C,x);$?$(_.el,x,j):j()}else x()},Qe=(_,I)=>{let C;for(;_!==I;)C=E(_),i(_),_=C;i(I)},We=(_,I,C)=>{const{bum:M,scope:D,job:x,subTree:K,um:$,m:j,a:L,parent:te,slots:{__:z}}=_;Au(j),Au(L),M&&Os(M),te&&ae(z)&&z.forEach(X=>{te.renderCache[X]=void 0}),D.stop(),x&&(x.flags|=8,U(K,_,I,C)),$&&Rt($,I),Rt(()=>{_.isUnmounted=!0},I),I&&I.pendingBranch&&!I.isUnmounted&&_.asyncDep&&!_.asyncResolved&&_.suspenseId===I.pendingId&&(I.deps--,I.deps===0&&I.resolve())},be=(_,I,C,M=!1,D=!1,x=0)=>{for(let K=x;K<_.length;K++)U(_[K],I,C,M,D)},De=_=>{if(_.shapeFlag&6)return De(_.component.subTree);if(_.shapeFlag&128)return _.suspense.next();const I=E(_.anchor||_.el),C=I&&I[Ng];return C?E(C):I};let Jt=!1;const yn=(_,I,C)=>{_==null?I._vnode&&U(I._vnode,null,null,!0):O(I._vnode||null,_,I,null,null,null,C),I._vnode=_,Jt||(Jt=!0,yu(),Dd(),Jt=!1)},wt={p:O,um:U,m:B,r:Z,mt:je,mc:g,pc:pe,pbc:T,n:De,o:n};let vn,Qn;return e&&([vn,Qn]=e(wt)),{render:yn,hydrate:vn,createApp:e_(yn,vn)}}function _a({type:n,props:e},t){return t==="svg"&&n==="foreignObject"||t==="mathml"&&n==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:t}function tr({effect:n,job:e},t){t?(n.flags|=32,e.flags|=4):(n.flags&=-33,e.flags&=-5)}function u_(n,e){return(!n||n&&!n.pendingBranch)&&e&&!e.persisted}function Qd(n,e,t=!1){const r=n.children,i=e.children;if(ae(r)&&ae(i))for(let s=0;s<r.length;s++){const a=r[s];let l=i[s];l.shapeFlag&1&&!l.dynamicChildren&&((l.patchFlag<=0||l.patchFlag===32)&&(l=i[s]=Rn(i[s]),l.el=a.el),!t&&l.patchFlag!==-2&&Qd(a,l)),l.type===Ro&&(l.el=a.el),l.type===jn&&!l.el&&(l.el=a.el)}}function h_(n){const e=n.slice(),t=[0];let r,i,s,a,l;const c=n.length;for(r=0;r<c;r++){const d=n[r];if(d!==0){if(i=t[t.length-1],n[i]<d){e[r]=i,t.push(r);continue}for(s=0,a=t.length-1;s<a;)l=s+a>>1,n[t[l]]<d?s=l+1:a=l;d<n[t[s]]&&(s>0&&(e[r]=t[s-1]),t[s]=r)}}for(s=t.length,a=t[s-1];s-- >0;)t[s]=a,a=e[a];return t}function Jd(n){const e=n.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:Jd(e)}function Au(n){if(n)for(let e=0;e<n.length;e++)n[e].flags|=8}const d_=Symbol.for("v-scx"),f_=()=>xs(d_);function ya(n,e,t){return Yd(n,e,t)}function Yd(n,e,t=Pe){const{immediate:r,deep:i,flush:s,once:a}=t,l=rt({},t),c=e&&r||!e&&s!=="post";let d;if(xi){if(s==="sync"){const R=f_();d=R.__watcherHandles||(R.__watcherHandles=[])}else if(!c){const R=()=>{};return R.stop=Mt,R.resume=Mt,R.pause=Mt,R}}const f=yt;l.call=(R,k,O)=>zt(R,f,k,O);let m=!1;s==="post"?l.scheduler=R=>{Rt(R,f&&f.suspense)}:s!=="sync"&&(m=!0,l.scheduler=(R,k)=>{k?R():kl(R)}),l.augmentJob=R=>{e&&(R.flags|=4),m&&(R.flags|=2,f&&(R.id=f.uid,R.i=f))};const E=Sg(n,e,l);return xi&&(d?d.push(E):c&&E()),E}function p_(n,e,t){const r=this.proxy,i=Be(n)?n.includes(".")?Xd(r,n):()=>r[n]:n.bind(r,r);let s;de(e)?s=e:(s=e.handler,t=e);const a=Ki(this),l=Yd(i,s.bind(r),t);return a(),l}function Xd(n,e){const t=e.split(".");return()=>{let r=n;for(let i=0;i<t.length&&r;i++)r=r[t[i]];return r}}const m_=(n,e)=>e==="modelValue"||e==="model-value"?n.modelModifiers:n[`${e}Modifiers`]||n[`${Un(e)}Modifiers`]||n[`${Wn(e)}Modifiers`];function g_(n,e,...t){if(n.isUnmounted)return;const r=n.vnode.props||Pe;let i=t;const s=e.startsWith("update:"),a=s&&m_(r,e.slice(7));a&&(a.trim&&(i=t.map(f=>Be(f)?f.trim():f)),a.number&&(i=t.map(La)));let l,c=r[l=ha(e)]||r[l=ha(Un(e))];!c&&s&&(c=r[l=ha(Wn(e))]),c&&zt(c,n,6,i);const d=r[l+"Once"];if(d){if(!n.emitted)n.emitted={};else if(n.emitted[l])return;n.emitted[l]=!0,zt(d,n,6,i)}}function Zd(n,e,t=!1){const r=e.emitsCache,i=r.get(n);if(i!==void 0)return i;const s=n.emits;let a={},l=!1;if(!de(n)){const c=d=>{const f=Zd(d,e,!0);f&&(l=!0,rt(a,f))};!t&&e.mixins.length&&e.mixins.forEach(c),n.extends&&c(n.extends),n.mixins&&n.mixins.forEach(c)}return!s&&!l?(Ne(n)&&r.set(n,null),null):(ae(s)?s.forEach(c=>a[c]=null):rt(a,s),Ne(n)&&r.set(n,a),a)}function bo(n,e){return!n||!_o(e)?!1:(e=e.slice(2).replace(/Once$/,""),Ae(n,e[0].toLowerCase()+e.slice(1))||Ae(n,Wn(e))||Ae(n,e))}function va(n){const{type:e,vnode:t,proxy:r,withProxy:i,propsOptions:[s],slots:a,attrs:l,emit:c,render:d,renderCache:f,props:m,data:E,setupState:R,ctx:k,inheritAttrs:O}=n,F=Js(n);let Y,G;try{if(t.shapeFlag&4){const H=i||r,fe=H;Y=jt(d.call(fe,H,f,m,R,E,k)),G=l}else{const H=e;Y=jt(H.length>1?H(m,{attrs:l,slots:a,emit:c}):H(m,null)),G=e.props?l:__(l)}}catch(H){bi.length=0,wo(H,n,1),Y=ln(jn)}let Q=Y;if(G&&O!==!1){const H=Object.keys(G),{shapeFlag:fe}=Q;H.length&&fe&7&&(s&&H.some(yl)&&(G=y_(G,s)),Q=Lr(Q,G,!1,!0))}return t.dirs&&(Q=Lr(Q,null,!1,!0),Q.dirs=Q.dirs?Q.dirs.concat(t.dirs):t.dirs),t.transition&&Dl(Q,t.transition),Y=Q,Js(F),Y}const __=n=>{let e;for(const t in n)(t==="class"||t==="style"||_o(t))&&((e||(e={}))[t]=n[t]);return e},y_=(n,e)=>{const t={};for(const r in n)(!yl(r)||!(r.slice(9)in e))&&(t[r]=n[r]);return t};function v_(n,e,t){const{props:r,children:i,component:s}=n,{props:a,children:l,patchFlag:c}=e,d=s.emitsOptions;if(e.dirs||e.transition)return!0;if(t&&c>=0){if(c&1024)return!0;if(c&16)return r?bu(r,a,d):!!a;if(c&8){const f=e.dynamicProps;for(let m=0;m<f.length;m++){const E=f[m];if(a[E]!==r[E]&&!bo(d,E))return!0}}}else return(i||l)&&(!l||!l.$stable)?!0:r===a?!1:r?a?bu(r,a,d):!0:!!a;return!1}function bu(n,e,t){const r=Object.keys(e);if(r.length!==Object.keys(n).length)return!0;for(let i=0;i<r.length;i++){const s=r[i];if(e[s]!==n[s]&&!bo(t,s))return!0}return!1}function E_({vnode:n,parent:e},t){for(;e;){const r=e.subTree;if(r.suspense&&r.suspense.activeBranch===n&&(r.el=n.el),r===n)(n=e.vnode).el=t,e=e.parent;else break}}const ef=n=>n.__isSuspense;function T_(n,e){e&&e.pendingBranch?ae(n)?e.effects.push(...n):e.effects.push(n):Dg(n)}const Tt=Symbol.for("v-fgt"),Ro=Symbol.for("v-txt"),jn=Symbol.for("v-cmt"),Ea=Symbol.for("v-stc"),bi=[];let St=null;function Me(n=!1){bi.push(St=n?null:[])}function I_(){bi.pop(),St=bi[bi.length-1]||null}let Oi=1;function Ru(n,e=!1){Oi+=n,n<0&&St&&e&&(St.hasOnce=!0)}function tf(n){return n.dynamicChildren=Oi>0?St||Pr:null,I_(),Oi>0&&St&&St.push(n),n}function He(n,e,t,r,i,s){return tf(he(n,e,t,r,i,s,!0))}function nf(n,e,t,r,i){return tf(ln(n,e,t,r,i,!0))}function rf(n){return n?n.__v_isVNode===!0:!1}function fi(n,e){return n.type===e.type&&n.key===e.key}const sf=({key:n})=>n??null,Ms=({ref:n,ref_key:e,ref_for:t})=>(typeof n=="number"&&(n=""+n),n!=null?Be(n)||dt(n)||de(n)?{i:Dt,r:n,k:e,f:!!t}:n:null);function he(n,e=null,t=null,r=0,i=null,s=n===Tt?0:1,a=!1,l=!1){const c={__v_isVNode:!0,__v_skip:!0,type:n,props:e,key:e&&sf(e),ref:e&&Ms(e),scopeId:Nd,slotScopeIds:null,children:t,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:s,patchFlag:r,dynamicProps:i,dynamicChildren:null,appContext:null,ctx:Dt};return l?(xl(c,t),s&128&&n.normalize(c)):t&&(c.shapeFlag|=Be(t)?8:16),Oi>0&&!a&&St&&(c.patchFlag>0||s&6)&&c.patchFlag!==32&&St.push(c),c}const ln=w_;function w_(n,e=null,t=null,r=0,i=null,s=!1){if((!n||n===zg)&&(n=jn),rf(n)){const l=Lr(n,e,!0);return t&&xl(l,t),Oi>0&&!s&&St&&(l.shapeFlag&6?St[St.indexOf(n)]=l:St.push(l)),l.patchFlag=-2,l}if(O_(n)&&(n=n.__vccOpts),e){e=A_(e);let{class:l,style:c}=e;l&&!Be(l)&&(e.class=To(l)),Ne(c)&&(Cl(c)&&!ae(c)&&(c=rt({},c)),e.style=Tl(c))}const a=Be(n)?1:ef(n)?128:Og(n)?64:Ne(n)?4:de(n)?2:0;return he(n,e,t,r,i,a,s,!0)}function A_(n){return n?Cl(n)||qd(n)?rt({},n):n:null}function Lr(n,e,t=!1,r=!1){const{props:i,ref:s,patchFlag:a,children:l,transition:c}=n,d=e?R_(i||{},e):i,f={__v_isVNode:!0,__v_skip:!0,type:n.type,props:d,key:d&&sf(d),ref:e&&e.ref?t&&s?ae(s)?s.concat(Ms(e)):[s,Ms(e)]:Ms(e):s,scopeId:n.scopeId,slotScopeIds:n.slotScopeIds,children:l,target:n.target,targetStart:n.targetStart,targetAnchor:n.targetAnchor,staticCount:n.staticCount,shapeFlag:n.shapeFlag,patchFlag:e&&n.type!==Tt?a===-1?16:a|16:a,dynamicProps:n.dynamicProps,dynamicChildren:n.dynamicChildren,appContext:n.appContext,dirs:n.dirs,transition:c,component:n.component,suspense:n.suspense,ssContent:n.ssContent&&Lr(n.ssContent),ssFallback:n.ssFallback&&Lr(n.ssFallback),el:n.el,anchor:n.anchor,ctx:n.ctx,ce:n.ce};return c&&r&&Dl(f,c.clone(f)),f}function b_(n=" ",e=0){return ln(Ro,null,n,e)}function Su(n="",e=!1){return e?(Me(),nf(jn,null,n)):ln(jn,null,n)}function jt(n){return n==null||typeof n=="boolean"?ln(jn):ae(n)?ln(Tt,null,n.slice()):rf(n)?Rn(n):ln(Ro,null,String(n))}function Rn(n){return n.el===null&&n.patchFlag!==-1||n.memo?n:Lr(n)}function xl(n,e){let t=0;const{shapeFlag:r}=n;if(e==null)e=null;else if(ae(e))t=16;else if(typeof e=="object")if(r&65){const i=e.default;i&&(i._c&&(i._d=!1),xl(n,i()),i._c&&(i._d=!0));return}else{t=32;const i=e._;!i&&!qd(e)?e._ctx=Dt:i===3&&Dt&&(Dt.slots._===1?e._=1:(e._=2,n.patchFlag|=1024))}else de(e)?(e={default:e,_ctx:Dt},t=32):(e=String(e),r&64?(t=16,e=[b_(e)]):t=8);n.children=e,n.shapeFlag|=t}function R_(...n){const e={};for(let t=0;t<n.length;t++){const r=n[t];for(const i in r)if(i==="class")e.class!==r.class&&(e.class=To([e.class,r.class]));else if(i==="style")e.style=Tl([e.style,r.style]);else if(_o(i)){const s=e[i],a=r[i];a&&s!==a&&!(ae(s)&&s.includes(a))&&(e[i]=s?[].concat(s,a):a)}else i!==""&&(e[i]=r[i])}return e}function Ut(n,e,t,r=null){zt(n,e,7,[t,r])}const S_=Bd();let P_=0;function C_(n,e,t){const r=n.type,i=(e?e.appContext:n.appContext)||S_,s={uid:P_++,vnode:n,type:r,parent:e,appContext:i,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new Xm(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(i.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:Kd(r,i),emitsOptions:Zd(r,i),emit:null,emitted:null,propsDefaults:Pe,inheritAttrs:r.inheritAttrs,ctx:Pe,data:Pe,props:Pe,attrs:Pe,slots:Pe,refs:Pe,setupState:Pe,setupContext:null,suspense:t,suspenseId:t?t.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return s.ctx={_:s},s.root=e?e.root:s,s.emit=g_.bind(null,s),n.ce&&n.ce(s),s}let yt=null,Xs,za;{const n=Eo(),e=(t,r)=>{let i;return(i=n[t])||(i=n[t]=[]),i.push(r),s=>{i.length>1?i.forEach(a=>a(s)):i[0](s)}};Xs=e("__VUE_INSTANCE_SETTERS__",t=>yt=t),za=e("__VUE_SSR_SETTERS__",t=>xi=t)}const Ki=n=>{const e=yt;return Xs(n),n.scope.on(),()=>{n.scope.off(),Xs(e)}},Pu=()=>{yt&&yt.scope.off(),Xs(null)};function of(n){return n.vnode.shapeFlag&4}let xi=!1;function k_(n,e=!1,t=!1){e&&za(e);const{props:r,children:i}=n.vnode,s=of(n);n_(n,r,s,e),o_(n,i,t||e);const a=s?D_(n,e):void 0;return e&&za(!1),a}function D_(n,e){const t=n.type;n.accessCache=Object.create(null),n.proxy=new Proxy(n.ctx,Wg);const{setup:r}=t;if(r){cn();const i=n.setupContext=r.length>1?N_(n):null,s=Ki(n),a=Hi(r,n,0,[n.props,i]),l=od(a);if(un(),s(),(l||n.sp)&&!wi(n)&&Od(n),l){if(a.then(Pu,Pu),e)return a.then(c=>{Cu(n,c,e)}).catch(c=>{wo(c,n,0)});n.asyncDep=a}else Cu(n,a,e)}else af(n,e)}function Cu(n,e,t){de(e)?n.type.__ssrInlineRender?n.ssrRender=e:n.render=e:Ne(e)&&(n.setupState=Pd(e)),af(n,t)}let ku;function af(n,e,t){const r=n.type;if(!n.render){if(!e&&ku&&!r.render){const i=r.template||Vl(n).template;if(i){const{isCustomElement:s,compilerOptions:a}=n.appContext.config,{delimiters:l,compilerOptions:c}=r,d=rt(rt({isCustomElement:s,delimiters:l},a),c);r.render=ku(i,d)}}n.render=r.render||Mt}{const i=Ki(n);cn();try{Gg(n)}finally{un(),i()}}}const V_={get(n,e){return ut(n,"get",""),n[e]}};function N_(n){const e=t=>{n.exposed=t||{}};return{attrs:new Proxy(n.attrs,V_),slots:n.slots,emit:n.emit,expose:e}}function So(n){return n.exposed?n.exposeProxy||(n.exposeProxy=new Proxy(Pd(vg(n.exposed)),{get(e,t){if(t in e)return e[t];if(t in Ai)return Ai[t](n)},has(e,t){return t in e||t in Ai}})):n.proxy}function O_(n){return de(n)&&"__vccOpts"in n}const x_=(n,e)=>bg(n,e,xi),M_="3.5.17";/**
* @vue/runtime-dom v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Wa;const Du=typeof window<"u"&&window.trustedTypes;if(Du)try{Wa=Du.createPolicy("vue",{createHTML:n=>n})}catch{}const lf=Wa?n=>Wa.createHTML(n):n=>n,L_="http://www.w3.org/2000/svg",F_="http://www.w3.org/1998/Math/MathML",en=typeof document<"u"?document:null,Vu=en&&en.createElement("template"),U_={insert:(n,e,t)=>{e.insertBefore(n,t||null)},remove:n=>{const e=n.parentNode;e&&e.removeChild(n)},createElement:(n,e,t,r)=>{const i=e==="svg"?en.createElementNS(L_,n):e==="mathml"?en.createElementNS(F_,n):t?en.createElement(n,{is:t}):en.createElement(n);return n==="select"&&r&&r.multiple!=null&&i.setAttribute("multiple",r.multiple),i},createText:n=>en.createTextNode(n),createComment:n=>en.createComment(n),setText:(n,e)=>{n.nodeValue=e},setElementText:(n,e)=>{n.textContent=e},parentNode:n=>n.parentNode,nextSibling:n=>n.nextSibling,querySelector:n=>en.querySelector(n),setScopeId(n,e){n.setAttribute(e,"")},insertStaticContent(n,e,t,r,i,s){const a=t?t.previousSibling:e.lastChild;if(i&&(i===s||i.nextSibling))for(;e.insertBefore(i.cloneNode(!0),t),!(i===s||!(i=i.nextSibling)););else{Vu.innerHTML=lf(r==="svg"?`<svg>${n}</svg>`:r==="mathml"?`<math>${n}</math>`:n);const l=Vu.content;if(r==="svg"||r==="mathml"){const c=l.firstChild;for(;c.firstChild;)l.appendChild(c.firstChild);l.removeChild(c)}e.insertBefore(l,t)}return[a?a.nextSibling:e.firstChild,t?t.previousSibling:e.lastChild]}},B_=Symbol("_vtc");function j_(n,e,t){const r=n[B_];r&&(e=(e?[e,...r]:[...r]).join(" ")),e==null?n.removeAttribute("class"):t?n.setAttribute("class",e):n.className=e}const Nu=Symbol("_vod"),$_=Symbol("_vsh"),q_=Symbol(""),H_=/(^|;)\s*display\s*:/;function K_(n,e,t){const r=n.style,i=Be(t);let s=!1;if(t&&!i){if(e)if(Be(e))for(const a of e.split(";")){const l=a.slice(0,a.indexOf(":")).trim();t[l]==null&&Ls(r,l,"")}else for(const a in e)t[a]==null&&Ls(r,a,"");for(const a in t)a==="display"&&(s=!0),Ls(r,a,t[a])}else if(i){if(e!==t){const a=r[q_];a&&(t+=";"+a),r.cssText=t,s=H_.test(t)}}else e&&n.removeAttribute("style");Nu in n&&(n[Nu]=s?r.display:"",n[$_]&&(r.display="none"))}const Ou=/\s*!important$/;function Ls(n,e,t){if(ae(t))t.forEach(r=>Ls(n,e,r));else if(t==null&&(t=""),e.startsWith("--"))n.setProperty(e,t);else{const r=z_(n,e);Ou.test(t)?n.setProperty(Wn(r),t.replace(Ou,""),"important"):n[r]=t}}const xu=["Webkit","Moz","ms"],Ta={};function z_(n,e){const t=Ta[e];if(t)return t;let r=Un(e);if(r!=="filter"&&r in n)return Ta[e]=r;r=cd(r);for(let i=0;i<xu.length;i++){const s=xu[i]+r;if(s in n)return Ta[e]=s}return e}const Mu="http://www.w3.org/1999/xlink";function Lu(n,e,t,r,i,s=Ym(e)){r&&e.startsWith("xlink:")?t==null?n.removeAttributeNS(Mu,e.slice(6,e.length)):n.setAttributeNS(Mu,e,t):t==null||s&&!ud(t)?n.removeAttribute(e):n.setAttribute(e,s?"":zn(t)?String(t):t)}function Fu(n,e,t,r,i){if(e==="innerHTML"||e==="textContent"){t!=null&&(n[e]=e==="innerHTML"?lf(t):t);return}const s=n.tagName;if(e==="value"&&s!=="PROGRESS"&&!s.includes("-")){const l=s==="OPTION"?n.getAttribute("value")||"":n.value,c=t==null?n.type==="checkbox"?"on":"":String(t);(l!==c||!("_value"in n))&&(n.value=c),t==null&&n.removeAttribute(e),n._value=t;return}let a=!1;if(t===""||t==null){const l=typeof n[e];l==="boolean"?t=ud(t):t==null&&l==="string"?(t="",a=!0):l==="number"&&(t=0,a=!0)}try{n[e]=t}catch{}a&&n.removeAttribute(i||e)}function wr(n,e,t,r){n.addEventListener(e,t,r)}function W_(n,e,t,r){n.removeEventListener(e,t,r)}const Uu=Symbol("_vei");function G_(n,e,t,r,i=null){const s=n[Uu]||(n[Uu]={}),a=s[e];if(r&&a)a.value=r;else{const[l,c]=Q_(e);if(r){const d=s[e]=X_(r,i);wr(n,l,d,c)}else a&&(W_(n,l,a,c),s[e]=void 0)}}const Bu=/(?:Once|Passive|Capture)$/;function Q_(n){let e;if(Bu.test(n)){e={};let r;for(;r=n.match(Bu);)n=n.slice(0,n.length-r[0].length),e[r[0].toLowerCase()]=!0}return[n[2]===":"?n.slice(3):Wn(n.slice(2)),e]}let Ia=0;const J_=Promise.resolve(),Y_=()=>Ia||(J_.then(()=>Ia=0),Ia=Date.now());function X_(n,e){const t=r=>{if(!r._vts)r._vts=Date.now();else if(r._vts<=t.attached)return;zt(Z_(r,t.value),e,5,[r])};return t.value=n,t.attached=Y_(),t}function Z_(n,e){if(ae(e)){const t=n.stopImmediatePropagation;return n.stopImmediatePropagation=()=>{t.call(n),n._stopped=!0},e.map(r=>i=>!i._stopped&&r&&r(i))}else return e}const ju=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&n.charCodeAt(2)>96&&n.charCodeAt(2)<123,ey=(n,e,t,r,i,s)=>{const a=i==="svg";e==="class"?j_(n,r,a):e==="style"?K_(n,t,r):_o(e)?yl(e)||G_(n,e,t,r,s):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):ty(n,e,r,a))?(Fu(n,e,r),!n.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&Lu(n,e,r,a,s,e!=="value")):n._isVueCE&&(/[A-Z]/.test(e)||!Be(r))?Fu(n,Un(e),r,s,e):(e==="true-value"?n._trueValue=r:e==="false-value"&&(n._falseValue=r),Lu(n,e,r,a))};function ty(n,e,t,r){if(r)return!!(e==="innerHTML"||e==="textContent"||e in n&&ju(e)&&de(t));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="form"||e==="list"&&n.tagName==="INPUT"||e==="type"&&n.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const i=n.tagName;if(i==="IMG"||i==="VIDEO"||i==="CANVAS"||i==="SOURCE")return!1}return ju(e)&&Be(t)?!1:e in n}const $u=n=>{const e=n.props["onUpdate:modelValue"]||!1;return ae(e)?t=>Os(e,t):e};function ny(n){n.target.composing=!0}function qu(n){const e=n.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const wa=Symbol("_assign"),Rs={created(n,{modifiers:{lazy:e,trim:t,number:r}},i){n[wa]=$u(i);const s=r||i.props&&i.props.type==="number";wr(n,e?"change":"input",a=>{if(a.target.composing)return;let l=n.value;t&&(l=l.trim()),s&&(l=La(l)),n[wa](l)}),t&&wr(n,"change",()=>{n.value=n.value.trim()}),e||(wr(n,"compositionstart",ny),wr(n,"compositionend",qu),wr(n,"change",qu))},mounted(n,{value:e}){n.value=e??""},beforeUpdate(n,{value:e,oldValue:t,modifiers:{lazy:r,trim:i,number:s}},a){if(n[wa]=$u(a),n.composing)return;const l=(s||n.type==="number")&&!/^0\d/.test(n.value)?La(n.value):n.value,c=e??"";l!==c&&(document.activeElement===n&&n.type!=="range"&&(r&&e===t||i&&n.value.trim()===c)||(n.value=c))}},ry=["ctrl","shift","alt","meta"],iy={stop:n=>n.stopPropagation(),prevent:n=>n.preventDefault(),self:n=>n.target!==n.currentTarget,ctrl:n=>!n.ctrlKey,shift:n=>!n.shiftKey,alt:n=>!n.altKey,meta:n=>!n.metaKey,left:n=>"button"in n&&n.button!==0,middle:n=>"button"in n&&n.button!==1,right:n=>"button"in n&&n.button!==2,exact:(n,e)=>ry.some(t=>n[`${t}Key`]&&!e.includes(t))},sy=(n,e)=>{const t=n._withMods||(n._withMods={}),r=e.join(".");return t[r]||(t[r]=(i,...s)=>{for(let a=0;a<e.length;a++){const l=iy[e[a]];if(l&&l(i,e))return}return n(i,...s)})},oy={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},Ss=(n,e)=>{const t=n._withKeys||(n._withKeys={}),r=e.join(".");return t[r]||(t[r]=i=>{if(!("key"in i))return;const s=Wn(i.key);if(e.some(a=>a===s||oy[a]===s))return n(i)})},ay=rt({patchProp:ey},U_);let Hu;function ly(){return Hu||(Hu=l_(ay))}const cy=(...n)=>{const e=ly().createApp(...n),{mount:t}=e;return e.mount=r=>{const i=hy(r);if(!i)return;const s=e._component;!de(s)&&!s.render&&!s.template&&(s.template=i.innerHTML),i.nodeType===1&&(i.textContent="");const a=t(i,!1,uy(i));return i instanceof Element&&(i.removeAttribute("v-cloak"),i.setAttribute("data-v-app","")),a},e};function uy(n){if(n instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&n instanceof MathMLElement)return"mathml"}function hy(n){return Be(n)?document.querySelector(n):n}/**
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
 */const cf=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},dy=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=n[t++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=n[t++],a=n[t++],l=n[t++],c=((i&7)<<18|(s&63)<<12|(a&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const s=n[t++],a=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|a&63)}}return e.join("")},uf={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){const s=n[i],a=i+1<n.length,l=a?n[i+1]:0,c=i+2<n.length,d=c?n[i+2]:0,f=s>>2,m=(s&3)<<4|l>>4;let E=(l&15)<<2|d>>6,R=d&63;c||(R=64,a||(E=64)),r.push(t[f],t[m],t[E],t[R])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(cf(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):dy(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){const s=t[n.charAt(i++)],l=i<n.length?t[n.charAt(i)]:0;++i;const d=i<n.length?t[n.charAt(i)]:64;++i;const m=i<n.length?t[n.charAt(i)]:64;if(++i,s==null||l==null||d==null||m==null)throw new fy;const E=s<<2|l>>4;if(r.push(E),d!==64){const R=l<<4&240|d>>2;if(r.push(R),m!==64){const k=d<<6&192|m;r.push(k)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class fy extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const py=function(n){const e=cf(n);return uf.encodeByteArray(e,!0)},Zs=function(n){return py(n).replace(/\./g,"")},hf=function(n){try{return uf.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */const gy=()=>my().__FIREBASE_DEFAULTS__,_y=()=>{if(typeof process>"u"||typeof process.env>"u")return;const n={}.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},yy=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&hf(n[1]);return e&&JSON.parse(e)},Po=()=>{try{return gy()||_y()||yy()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},df=n=>{var e,t;return(t=(e=Po())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},vy=n=>{const e=df(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},ff=()=>{var n;return(n=Po())===null||n===void 0?void 0:n.config},pf=n=>{var e;return(e=Po())===null||e===void 0?void 0:e[`_${n}`]};/**
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
 */function Ty(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",i=n.iat||0,s=n.sub||n.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}}},n),l="";return[Zs(JSON.stringify(t)),Zs(JSON.stringify(a)),l].join(".")}/**
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
 */function ft(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Iy(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ft())}function wy(){var n;const e=(n=Po())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Ay(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function by(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Ry(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Sy(){const n=ft();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Py(){return!wy()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function Cy(){try{return typeof indexedDB=="object"}catch{return!1}}function ky(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var s;e(((s=i.error)===null||s===void 0?void 0:s.message)||"")}}catch(t){e(t)}})}/**
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
 */const Dy="FirebaseError";class _n extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Dy,Object.setPrototypeOf(this,_n.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,zi.prototype.create)}}class zi{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},i=`${this.service}/${e}`,s=this.errors[e],a=s?Vy(s,r):"Error",l=`${this.serviceName}: ${a} (${i}).`;return new _n(i,l,r)}}function Vy(n,e){return n.replace(Ny,(t,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const Ny=/\{\$([^}]+)}/g;function Oy(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function eo(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const i of t){if(!r.includes(i))return!1;const s=n[i],a=e[i];if(Ku(s)&&Ku(a)){if(!eo(s,a))return!1}else if(s!==a)return!1}for(const i of r)if(!t.includes(i))return!1;return!0}function Ku(n){return n!==null&&typeof n=="object"}/**
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
 */function Wi(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function xy(n,e){const t=new My(n,e);return t.subscribe.bind(t)}class My{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");Ly(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=Aa),i.error===void 0&&(i.error=Aa),i.complete===void 0&&(i.complete=Aa);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Ly(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Aa(){}/**
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
 */function vt(n){return n&&n._delegate?n._delegate:n}class ar{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const rr="[DEFAULT]";/**
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
 */class Fy{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Ey;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(By(e))try{this.getOrInitializeService({instanceIdentifier:rr})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=rr){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=rr){return this.instances.has(e)}getOptions(e=rr){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[s,a]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(s);r===l&&a.resolve(i)}return i}onInit(e,t){var r;const i=this.normalizeInstanceIdentifier(t),s=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;s.add(e),this.onInitCallbacks.set(i,s);const a=this.instances.get(i);return a&&e(a,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Uy(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=rr){return this.component?this.component.multipleInstances?e:rr:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Uy(n){return n===rr?void 0:n}function By(n){return n.instantiationMode==="EAGER"}/**
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
 */var ge;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(ge||(ge={}));const $y={debug:ge.DEBUG,verbose:ge.VERBOSE,info:ge.INFO,warn:ge.WARN,error:ge.ERROR,silent:ge.SILENT},qy=ge.INFO,Hy={[ge.DEBUG]:"log",[ge.VERBOSE]:"log",[ge.INFO]:"info",[ge.WARN]:"warn",[ge.ERROR]:"error"},Ky=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),i=Hy[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Ml{constructor(e){this.name=e,this._logLevel=qy,this._logHandler=Ky,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ge))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?$y[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ge.DEBUG,...e),this._logHandler(this,ge.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ge.VERBOSE,...e),this._logHandler(this,ge.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ge.INFO,...e),this._logHandler(this,ge.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ge.WARN,...e),this._logHandler(this,ge.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ge.ERROR,...e),this._logHandler(this,ge.ERROR,...e)}}const zy=(n,e)=>e.some(t=>n instanceof t);let zu,Wu;function Wy(){return zu||(zu=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Gy(){return Wu||(Wu=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const mf=new WeakMap,Ga=new WeakMap,gf=new WeakMap,ba=new WeakMap,Ll=new WeakMap;function Qy(n){const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("success",s),n.removeEventListener("error",a)},s=()=>{t(Nn(n.result)),i()},a=()=>{r(n.error),i()};n.addEventListener("success",s),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&mf.set(t,n)}).catch(()=>{}),Ll.set(e,n),e}function Jy(n){if(Ga.has(n))return;const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("complete",s),n.removeEventListener("error",a),n.removeEventListener("abort",a)},s=()=>{t(),i()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),i()};n.addEventListener("complete",s),n.addEventListener("error",a),n.addEventListener("abort",a)});Ga.set(n,e)}let Qa={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Ga.get(n);if(e==="objectStoreNames")return n.objectStoreNames||gf.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return Nn(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function Yy(n){Qa=n(Qa)}function Xy(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(Ra(this),e,...t);return gf.set(r,e.sort?e.sort():[e]),Nn(r)}:Gy().includes(n)?function(...e){return n.apply(Ra(this),e),Nn(mf.get(this))}:function(...e){return Nn(n.apply(Ra(this),e))}}function Zy(n){return typeof n=="function"?Xy(n):(n instanceof IDBTransaction&&Jy(n),zy(n,Wy())?new Proxy(n,Qa):n)}function Nn(n){if(n instanceof IDBRequest)return Qy(n);if(ba.has(n))return ba.get(n);const e=Zy(n);return e!==n&&(ba.set(n,e),Ll.set(e,n)),e}const Ra=n=>Ll.get(n);function ev(n,e,{blocked:t,upgrade:r,blocking:i,terminated:s}={}){const a=indexedDB.open(n,e),l=Nn(a);return r&&a.addEventListener("upgradeneeded",c=>{r(Nn(a.result),c.oldVersion,c.newVersion,Nn(a.transaction),c)}),t&&a.addEventListener("blocked",c=>t(c.oldVersion,c.newVersion,c)),l.then(c=>{s&&c.addEventListener("close",()=>s()),i&&c.addEventListener("versionchange",d=>i(d.oldVersion,d.newVersion,d))}).catch(()=>{}),l}const tv=["get","getKey","getAll","getAllKeys","count"],nv=["put","add","delete","clear"],Sa=new Map;function Gu(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(Sa.get(e))return Sa.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,i=nv.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(i||tv.includes(t)))return;const s=async function(a,...l){const c=this.transaction(a,i?"readwrite":"readonly");let d=c.store;return r&&(d=d.index(l.shift())),(await Promise.all([d[t](...l),i&&c.done]))[0]};return Sa.set(e,s),s}Yy(n=>({...n,get:(e,t,r)=>Gu(e,t)||n.get(e,t,r),has:(e,t)=>!!Gu(e,t)||n.has(e,t)}));/**
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
 */class rv{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(iv(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function iv(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Ja="@firebase/app",Qu="0.10.13";/**
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
 */const hn=new Ml("@firebase/app"),sv="@firebase/app-compat",ov="@firebase/analytics-compat",av="@firebase/analytics",lv="@firebase/app-check-compat",cv="@firebase/app-check",uv="@firebase/auth",hv="@firebase/auth-compat",dv="@firebase/database",fv="@firebase/data-connect",pv="@firebase/database-compat",mv="@firebase/functions",gv="@firebase/functions-compat",_v="@firebase/installations",yv="@firebase/installations-compat",vv="@firebase/messaging",Ev="@firebase/messaging-compat",Tv="@firebase/performance",Iv="@firebase/performance-compat",wv="@firebase/remote-config",Av="@firebase/remote-config-compat",bv="@firebase/storage",Rv="@firebase/storage-compat",Sv="@firebase/firestore",Pv="@firebase/vertexai-preview",Cv="@firebase/firestore-compat",kv="firebase",Dv="10.14.1";/**
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
 */const Ya="[DEFAULT]",Vv={[Ja]:"fire-core",[sv]:"fire-core-compat",[av]:"fire-analytics",[ov]:"fire-analytics-compat",[cv]:"fire-app-check",[lv]:"fire-app-check-compat",[uv]:"fire-auth",[hv]:"fire-auth-compat",[dv]:"fire-rtdb",[fv]:"fire-data-connect",[pv]:"fire-rtdb-compat",[mv]:"fire-fn",[gv]:"fire-fn-compat",[_v]:"fire-iid",[yv]:"fire-iid-compat",[vv]:"fire-fcm",[Ev]:"fire-fcm-compat",[Tv]:"fire-perf",[Iv]:"fire-perf-compat",[wv]:"fire-rc",[Av]:"fire-rc-compat",[bv]:"fire-gcs",[Rv]:"fire-gcs-compat",[Sv]:"fire-fst",[Cv]:"fire-fst-compat",[Pv]:"fire-vertex","fire-js":"fire-js",[kv]:"fire-js-all"};/**
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
 */const to=new Map,Nv=new Map,Xa=new Map;function Ju(n,e){try{n.container.addComponent(e)}catch(t){hn.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function Fr(n){const e=n.name;if(Xa.has(e))return hn.debug(`There were multiple attempts to register component ${e}.`),!1;Xa.set(e,n);for(const t of to.values())Ju(t,n);for(const t of Nv.values())Ju(t,n);return!0}function Fl(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function rn(n){return n.settings!==void 0}/**
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
 */const Ov={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},On=new zi("app","Firebase",Ov);/**
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
 */class xv{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new ar("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw On.create("app-deleted",{appName:this._name})}}/**
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
 */const Wr=Dv;function _f(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Ya,automaticDataCollectionEnabled:!1},e),i=r.name;if(typeof i!="string"||!i)throw On.create("bad-app-name",{appName:String(i)});if(t||(t=ff()),!t)throw On.create("no-options");const s=to.get(i);if(s){if(eo(t,s.options)&&eo(r,s.config))return s;throw On.create("duplicate-app",{appName:i})}const a=new jy(i);for(const c of Xa.values())a.addComponent(c);const l=new xv(t,r,a);return to.set(i,l),l}function yf(n=Ya){const e=to.get(n);if(!e&&n===Ya&&ff())return _f();if(!e)throw On.create("no-app",{appName:n});return e}function xn(n,e,t){var r;let i=(r=Vv[n])!==null&&r!==void 0?r:n;t&&(i+=`-${t}`);const s=i.match(/\s|\//),a=e.match(/\s|\//);if(s||a){const l=[`Unable to register library "${i}" with version "${e}":`];s&&l.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&a&&l.push("and"),a&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),hn.warn(l.join(" "));return}Fr(new ar(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
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
 */const Mv="firebase-heartbeat-database",Lv=1,Mi="firebase-heartbeat-store";let Pa=null;function vf(){return Pa||(Pa=ev(Mv,Lv,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Mi)}catch(t){console.warn(t)}}}}).catch(n=>{throw On.create("idb-open",{originalErrorMessage:n.message})})),Pa}async function Fv(n){try{const t=(await vf()).transaction(Mi),r=await t.objectStore(Mi).get(Ef(n));return await t.done,r}catch(e){if(e instanceof _n)hn.warn(e.message);else{const t=On.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});hn.warn(t.message)}}}async function Yu(n,e){try{const r=(await vf()).transaction(Mi,"readwrite");await r.objectStore(Mi).put(e,Ef(n)),await r.done}catch(t){if(t instanceof _n)hn.warn(t.message);else{const r=On.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});hn.warn(r.message)}}}function Ef(n){return`${n.name}!${n.options.appId}`}/**
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
 */const Uv=1024,Bv=30*24*60*60*1e3;class jv{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new qv(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=Xu();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(a=>a.date===s)?void 0:(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const l=new Date(a.date).valueOf();return Date.now()-l<=Bv}),this._storage.overwrite(this._heartbeatsCache))}catch(r){hn.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Xu(),{heartbeatsToSend:r,unsentEntries:i}=$v(this._heartbeatsCache.heartbeats),s=Zs(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return hn.warn(t),""}}}function Xu(){return new Date().toISOString().substring(0,10)}function $v(n,e=Uv){const t=[];let r=n.slice();for(const i of n){const s=t.find(a=>a.agent===i.agent);if(s){if(s.dates.push(i.date),Zu(t)>e){s.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),Zu(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class qv{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Cy()?ky().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Fv(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return Yu(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return Yu(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function Zu(n){return Zs(JSON.stringify({version:2,heartbeats:n})).length}/**
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
 */function Hv(n){Fr(new ar("platform-logger",e=>new rv(e),"PRIVATE")),Fr(new ar("heartbeat",e=>new jv(e),"PRIVATE")),xn(Ja,Qu,n),xn(Ja,Qu,"esm2017"),xn("fire-js","")}Hv("");var Kv="firebase",zv="10.14.1";/**
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
 */xn(Kv,zv,"app");var eh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var or,Tf;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(w,g){function v(){}v.prototype=g.prototype,w.D=g.prototype,w.prototype=new v,w.prototype.constructor=w,w.C=function(T,A,S){for(var y=Array(arguments.length-2),je=2;je<arguments.length;je++)y[je-2]=arguments[je];return g.prototype[A].apply(T,y)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(w,g,v){v||(v=0);var T=Array(16);if(typeof g=="string")for(var A=0;16>A;++A)T[A]=g.charCodeAt(v++)|g.charCodeAt(v++)<<8|g.charCodeAt(v++)<<16|g.charCodeAt(v++)<<24;else for(A=0;16>A;++A)T[A]=g[v++]|g[v++]<<8|g[v++]<<16|g[v++]<<24;g=w.g[0],v=w.g[1],A=w.g[2];var S=w.g[3],y=g+(S^v&(A^S))+T[0]+3614090360&4294967295;g=v+(y<<7&4294967295|y>>>25),y=S+(A^g&(v^A))+T[1]+3905402710&4294967295,S=g+(y<<12&4294967295|y>>>20),y=A+(v^S&(g^v))+T[2]+606105819&4294967295,A=S+(y<<17&4294967295|y>>>15),y=v+(g^A&(S^g))+T[3]+3250441966&4294967295,v=A+(y<<22&4294967295|y>>>10),y=g+(S^v&(A^S))+T[4]+4118548399&4294967295,g=v+(y<<7&4294967295|y>>>25),y=S+(A^g&(v^A))+T[5]+1200080426&4294967295,S=g+(y<<12&4294967295|y>>>20),y=A+(v^S&(g^v))+T[6]+2821735955&4294967295,A=S+(y<<17&4294967295|y>>>15),y=v+(g^A&(S^g))+T[7]+4249261313&4294967295,v=A+(y<<22&4294967295|y>>>10),y=g+(S^v&(A^S))+T[8]+1770035416&4294967295,g=v+(y<<7&4294967295|y>>>25),y=S+(A^g&(v^A))+T[9]+2336552879&4294967295,S=g+(y<<12&4294967295|y>>>20),y=A+(v^S&(g^v))+T[10]+4294925233&4294967295,A=S+(y<<17&4294967295|y>>>15),y=v+(g^A&(S^g))+T[11]+2304563134&4294967295,v=A+(y<<22&4294967295|y>>>10),y=g+(S^v&(A^S))+T[12]+1804603682&4294967295,g=v+(y<<7&4294967295|y>>>25),y=S+(A^g&(v^A))+T[13]+4254626195&4294967295,S=g+(y<<12&4294967295|y>>>20),y=A+(v^S&(g^v))+T[14]+2792965006&4294967295,A=S+(y<<17&4294967295|y>>>15),y=v+(g^A&(S^g))+T[15]+1236535329&4294967295,v=A+(y<<22&4294967295|y>>>10),y=g+(A^S&(v^A))+T[1]+4129170786&4294967295,g=v+(y<<5&4294967295|y>>>27),y=S+(v^A&(g^v))+T[6]+3225465664&4294967295,S=g+(y<<9&4294967295|y>>>23),y=A+(g^v&(S^g))+T[11]+643717713&4294967295,A=S+(y<<14&4294967295|y>>>18),y=v+(S^g&(A^S))+T[0]+3921069994&4294967295,v=A+(y<<20&4294967295|y>>>12),y=g+(A^S&(v^A))+T[5]+3593408605&4294967295,g=v+(y<<5&4294967295|y>>>27),y=S+(v^A&(g^v))+T[10]+38016083&4294967295,S=g+(y<<9&4294967295|y>>>23),y=A+(g^v&(S^g))+T[15]+3634488961&4294967295,A=S+(y<<14&4294967295|y>>>18),y=v+(S^g&(A^S))+T[4]+3889429448&4294967295,v=A+(y<<20&4294967295|y>>>12),y=g+(A^S&(v^A))+T[9]+568446438&4294967295,g=v+(y<<5&4294967295|y>>>27),y=S+(v^A&(g^v))+T[14]+3275163606&4294967295,S=g+(y<<9&4294967295|y>>>23),y=A+(g^v&(S^g))+T[3]+4107603335&4294967295,A=S+(y<<14&4294967295|y>>>18),y=v+(S^g&(A^S))+T[8]+1163531501&4294967295,v=A+(y<<20&4294967295|y>>>12),y=g+(A^S&(v^A))+T[13]+2850285829&4294967295,g=v+(y<<5&4294967295|y>>>27),y=S+(v^A&(g^v))+T[2]+4243563512&4294967295,S=g+(y<<9&4294967295|y>>>23),y=A+(g^v&(S^g))+T[7]+1735328473&4294967295,A=S+(y<<14&4294967295|y>>>18),y=v+(S^g&(A^S))+T[12]+2368359562&4294967295,v=A+(y<<20&4294967295|y>>>12),y=g+(v^A^S)+T[5]+4294588738&4294967295,g=v+(y<<4&4294967295|y>>>28),y=S+(g^v^A)+T[8]+2272392833&4294967295,S=g+(y<<11&4294967295|y>>>21),y=A+(S^g^v)+T[11]+1839030562&4294967295,A=S+(y<<16&4294967295|y>>>16),y=v+(A^S^g)+T[14]+4259657740&4294967295,v=A+(y<<23&4294967295|y>>>9),y=g+(v^A^S)+T[1]+2763975236&4294967295,g=v+(y<<4&4294967295|y>>>28),y=S+(g^v^A)+T[4]+1272893353&4294967295,S=g+(y<<11&4294967295|y>>>21),y=A+(S^g^v)+T[7]+4139469664&4294967295,A=S+(y<<16&4294967295|y>>>16),y=v+(A^S^g)+T[10]+3200236656&4294967295,v=A+(y<<23&4294967295|y>>>9),y=g+(v^A^S)+T[13]+681279174&4294967295,g=v+(y<<4&4294967295|y>>>28),y=S+(g^v^A)+T[0]+3936430074&4294967295,S=g+(y<<11&4294967295|y>>>21),y=A+(S^g^v)+T[3]+3572445317&4294967295,A=S+(y<<16&4294967295|y>>>16),y=v+(A^S^g)+T[6]+76029189&4294967295,v=A+(y<<23&4294967295|y>>>9),y=g+(v^A^S)+T[9]+3654602809&4294967295,g=v+(y<<4&4294967295|y>>>28),y=S+(g^v^A)+T[12]+3873151461&4294967295,S=g+(y<<11&4294967295|y>>>21),y=A+(S^g^v)+T[15]+530742520&4294967295,A=S+(y<<16&4294967295|y>>>16),y=v+(A^S^g)+T[2]+3299628645&4294967295,v=A+(y<<23&4294967295|y>>>9),y=g+(A^(v|~S))+T[0]+4096336452&4294967295,g=v+(y<<6&4294967295|y>>>26),y=S+(v^(g|~A))+T[7]+1126891415&4294967295,S=g+(y<<10&4294967295|y>>>22),y=A+(g^(S|~v))+T[14]+2878612391&4294967295,A=S+(y<<15&4294967295|y>>>17),y=v+(S^(A|~g))+T[5]+4237533241&4294967295,v=A+(y<<21&4294967295|y>>>11),y=g+(A^(v|~S))+T[12]+1700485571&4294967295,g=v+(y<<6&4294967295|y>>>26),y=S+(v^(g|~A))+T[3]+2399980690&4294967295,S=g+(y<<10&4294967295|y>>>22),y=A+(g^(S|~v))+T[10]+4293915773&4294967295,A=S+(y<<15&4294967295|y>>>17),y=v+(S^(A|~g))+T[1]+2240044497&4294967295,v=A+(y<<21&4294967295|y>>>11),y=g+(A^(v|~S))+T[8]+1873313359&4294967295,g=v+(y<<6&4294967295|y>>>26),y=S+(v^(g|~A))+T[15]+4264355552&4294967295,S=g+(y<<10&4294967295|y>>>22),y=A+(g^(S|~v))+T[6]+2734768916&4294967295,A=S+(y<<15&4294967295|y>>>17),y=v+(S^(A|~g))+T[13]+1309151649&4294967295,v=A+(y<<21&4294967295|y>>>11),y=g+(A^(v|~S))+T[4]+4149444226&4294967295,g=v+(y<<6&4294967295|y>>>26),y=S+(v^(g|~A))+T[11]+3174756917&4294967295,S=g+(y<<10&4294967295|y>>>22),y=A+(g^(S|~v))+T[2]+718787259&4294967295,A=S+(y<<15&4294967295|y>>>17),y=v+(S^(A|~g))+T[9]+3951481745&4294967295,w.g[0]=w.g[0]+g&4294967295,w.g[1]=w.g[1]+(A+(y<<21&4294967295|y>>>11))&4294967295,w.g[2]=w.g[2]+A&4294967295,w.g[3]=w.g[3]+S&4294967295}r.prototype.u=function(w,g){g===void 0&&(g=w.length);for(var v=g-this.blockSize,T=this.B,A=this.h,S=0;S<g;){if(A==0)for(;S<=v;)i(this,w,S),S+=this.blockSize;if(typeof w=="string"){for(;S<g;)if(T[A++]=w.charCodeAt(S++),A==this.blockSize){i(this,T),A=0;break}}else for(;S<g;)if(T[A++]=w[S++],A==this.blockSize){i(this,T),A=0;break}}this.h=A,this.o+=g},r.prototype.v=function(){var w=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);w[0]=128;for(var g=1;g<w.length-8;++g)w[g]=0;var v=8*this.o;for(g=w.length-8;g<w.length;++g)w[g]=v&255,v/=256;for(this.u(w),w=Array(16),g=v=0;4>g;++g)for(var T=0;32>T;T+=8)w[v++]=this.g[g]>>>T&255;return w};function s(w,g){var v=l;return Object.prototype.hasOwnProperty.call(v,w)?v[w]:v[w]=g(w)}function a(w,g){this.h=g;for(var v=[],T=!0,A=w.length-1;0<=A;A--){var S=w[A]|0;T&&S==g||(v[A]=S,T=!1)}this.g=v}var l={};function c(w){return-128<=w&&128>w?s(w,function(g){return new a([g|0],0>g?-1:0)}):new a([w|0],0>w?-1:0)}function d(w){if(isNaN(w)||!isFinite(w))return m;if(0>w)return F(d(-w));for(var g=[],v=1,T=0;w>=v;T++)g[T]=w/v|0,v*=4294967296;return new a(g,0)}function f(w,g){if(w.length==0)throw Error("number format error: empty string");if(g=g||10,2>g||36<g)throw Error("radix out of range: "+g);if(w.charAt(0)=="-")return F(f(w.substring(1),g));if(0<=w.indexOf("-"))throw Error('number format error: interior "-" character');for(var v=d(Math.pow(g,8)),T=m,A=0;A<w.length;A+=8){var S=Math.min(8,w.length-A),y=parseInt(w.substring(A,A+S),g);8>S?(S=d(Math.pow(g,S)),T=T.j(S).add(d(y))):(T=T.j(v),T=T.add(d(y)))}return T}var m=c(0),E=c(1),R=c(16777216);n=a.prototype,n.m=function(){if(O(this))return-F(this).m();for(var w=0,g=1,v=0;v<this.g.length;v++){var T=this.i(v);w+=(0<=T?T:4294967296+T)*g,g*=4294967296}return w},n.toString=function(w){if(w=w||10,2>w||36<w)throw Error("radix out of range: "+w);if(k(this))return"0";if(O(this))return"-"+F(this).toString(w);for(var g=d(Math.pow(w,6)),v=this,T="";;){var A=H(v,g).g;v=Y(v,A.j(g));var S=((0<v.g.length?v.g[0]:v.h)>>>0).toString(w);if(v=A,k(v))return S+T;for(;6>S.length;)S="0"+S;T=S+T}},n.i=function(w){return 0>w?0:w<this.g.length?this.g[w]:this.h};function k(w){if(w.h!=0)return!1;for(var g=0;g<w.g.length;g++)if(w.g[g]!=0)return!1;return!0}function O(w){return w.h==-1}n.l=function(w){return w=Y(this,w),O(w)?-1:k(w)?0:1};function F(w){for(var g=w.g.length,v=[],T=0;T<g;T++)v[T]=~w.g[T];return new a(v,~w.h).add(E)}n.abs=function(){return O(this)?F(this):this},n.add=function(w){for(var g=Math.max(this.g.length,w.g.length),v=[],T=0,A=0;A<=g;A++){var S=T+(this.i(A)&65535)+(w.i(A)&65535),y=(S>>>16)+(this.i(A)>>>16)+(w.i(A)>>>16);T=y>>>16,S&=65535,y&=65535,v[A]=y<<16|S}return new a(v,v[v.length-1]&-2147483648?-1:0)};function Y(w,g){return w.add(F(g))}n.j=function(w){if(k(this)||k(w))return m;if(O(this))return O(w)?F(this).j(F(w)):F(F(this).j(w));if(O(w))return F(this.j(F(w)));if(0>this.l(R)&&0>w.l(R))return d(this.m()*w.m());for(var g=this.g.length+w.g.length,v=[],T=0;T<2*g;T++)v[T]=0;for(T=0;T<this.g.length;T++)for(var A=0;A<w.g.length;A++){var S=this.i(T)>>>16,y=this.i(T)&65535,je=w.i(A)>>>16,Ft=w.i(A)&65535;v[2*T+2*A]+=y*Ft,G(v,2*T+2*A),v[2*T+2*A+1]+=S*Ft,G(v,2*T+2*A+1),v[2*T+2*A+1]+=y*je,G(v,2*T+2*A+1),v[2*T+2*A+2]+=S*je,G(v,2*T+2*A+2)}for(T=0;T<g;T++)v[T]=v[2*T+1]<<16|v[2*T];for(T=g;T<2*g;T++)v[T]=0;return new a(v,0)};function G(w,g){for(;(w[g]&65535)!=w[g];)w[g+1]+=w[g]>>>16,w[g]&=65535,g++}function Q(w,g){this.g=w,this.h=g}function H(w,g){if(k(g))throw Error("division by zero");if(k(w))return new Q(m,m);if(O(w))return g=H(F(w),g),new Q(F(g.g),F(g.h));if(O(g))return g=H(w,F(g)),new Q(F(g.g),g.h);if(30<w.g.length){if(O(w)||O(g))throw Error("slowDivide_ only works with positive integers.");for(var v=E,T=g;0>=T.l(w);)v=fe(v),T=fe(T);var A=ve(v,1),S=ve(T,1);for(T=ve(T,2),v=ve(v,2);!k(T);){var y=S.add(T);0>=y.l(w)&&(A=A.add(v),S=y),T=ve(T,1),v=ve(v,1)}return g=Y(w,A.j(g)),new Q(A,g)}for(A=m;0<=w.l(g);){for(v=Math.max(1,Math.floor(w.m()/g.m())),T=Math.ceil(Math.log(v)/Math.LN2),T=48>=T?1:Math.pow(2,T-48),S=d(v),y=S.j(g);O(y)||0<y.l(w);)v-=T,S=d(v),y=S.j(g);k(S)&&(S=E),A=A.add(S),w=Y(w,y)}return new Q(A,w)}n.A=function(w){return H(this,w).h},n.and=function(w){for(var g=Math.max(this.g.length,w.g.length),v=[],T=0;T<g;T++)v[T]=this.i(T)&w.i(T);return new a(v,this.h&w.h)},n.or=function(w){for(var g=Math.max(this.g.length,w.g.length),v=[],T=0;T<g;T++)v[T]=this.i(T)|w.i(T);return new a(v,this.h|w.h)},n.xor=function(w){for(var g=Math.max(this.g.length,w.g.length),v=[],T=0;T<g;T++)v[T]=this.i(T)^w.i(T);return new a(v,this.h^w.h)};function fe(w){for(var g=w.g.length+1,v=[],T=0;T<g;T++)v[T]=w.i(T)<<1|w.i(T-1)>>>31;return new a(v,w.h)}function ve(w,g){var v=g>>5;g%=32;for(var T=w.g.length-v,A=[],S=0;S<T;S++)A[S]=0<g?w.i(S+v)>>>g|w.i(S+v+1)<<32-g:w.i(S+v);return new a(A,w.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,Tf=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=f,or=a}).apply(typeof eh<"u"?eh:typeof self<"u"?self:typeof window<"u"?window:{});var Ps=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var If,gi,wf,Fs,Za,Af,bf,Rf;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,u,h){return o==Array.prototype||o==Object.prototype||(o[u]=h.value),o};function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Ps=="object"&&Ps];for(var u=0;u<o.length;++u){var h=o[u];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var r=t(this);function i(o,u){if(u)e:{var h=r;o=o.split(".");for(var p=0;p<o.length-1;p++){var b=o[p];if(!(b in h))break e;h=h[b]}o=o[o.length-1],p=h[o],u=u(p),u!=p&&u!=null&&e(h,o,{configurable:!0,writable:!0,value:u})}}function s(o,u){o instanceof String&&(o+="");var h=0,p=!1,b={next:function(){if(!p&&h<o.length){var P=h++;return{value:u(P,o[P]),done:!1}}return p=!0,{done:!0,value:void 0}}};return b[Symbol.iterator]=function(){return b},b}i("Array.prototype.values",function(o){return o||function(){return s(this,function(u,h){return h})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},l=this||self;function c(o){var u=typeof o;return u=u!="object"?u:o?Array.isArray(o)?"array":u:"null",u=="array"||u=="object"&&typeof o.length=="number"}function d(o){var u=typeof o;return u=="object"&&o!=null||u=="function"}function f(o,u,h){return o.call.apply(o.bind,arguments)}function m(o,u,h){if(!o)throw Error();if(2<arguments.length){var p=Array.prototype.slice.call(arguments,2);return function(){var b=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(b,p),o.apply(u,b)}}return function(){return o.apply(u,arguments)}}function E(o,u,h){return E=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:m,E.apply(null,arguments)}function R(o,u){var h=Array.prototype.slice.call(arguments,1);return function(){var p=h.slice();return p.push.apply(p,arguments),o.apply(this,p)}}function k(o,u){function h(){}h.prototype=u.prototype,o.aa=u.prototype,o.prototype=new h,o.prototype.constructor=o,o.Qb=function(p,b,P){for(var q=Array(arguments.length-2),Se=2;Se<arguments.length;Se++)q[Se-2]=arguments[Se];return u.prototype[b].apply(p,q)}}function O(o){const u=o.length;if(0<u){const h=Array(u);for(let p=0;p<u;p++)h[p]=o[p];return h}return[]}function F(o,u){for(let h=1;h<arguments.length;h++){const p=arguments[h];if(c(p)){const b=o.length||0,P=p.length||0;o.length=b+P;for(let q=0;q<P;q++)o[b+q]=p[q]}else o.push(p)}}class Y{constructor(u,h){this.i=u,this.j=h,this.h=0,this.g=null}get(){let u;return 0<this.h?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function G(o){return/^[\s\xa0]*$/.test(o)}function Q(){var o=l.navigator;return o&&(o=o.userAgent)?o:""}function H(o){return H[" "](o),o}H[" "]=function(){};var fe=Q().indexOf("Gecko")!=-1&&!(Q().toLowerCase().indexOf("webkit")!=-1&&Q().indexOf("Edge")==-1)&&!(Q().indexOf("Trident")!=-1||Q().indexOf("MSIE")!=-1)&&Q().indexOf("Edge")==-1;function ve(o,u,h){for(const p in o)u.call(h,o[p],p,o)}function w(o,u){for(const h in o)u.call(void 0,o[h],h,o)}function g(o){const u={};for(const h in o)u[h]=o[h];return u}const v="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function T(o,u){let h,p;for(let b=1;b<arguments.length;b++){p=arguments[b];for(h in p)o[h]=p[h];for(let P=0;P<v.length;P++)h=v[P],Object.prototype.hasOwnProperty.call(p,h)&&(o[h]=p[h])}}function A(o){var u=1;o=o.split(":");const h=[];for(;0<u&&o.length;)h.push(o.shift()),u--;return o.length&&h.push(o.join(":")),h}function S(o){l.setTimeout(()=>{throw o},0)}function y(){var o=st;let u=null;return o.g&&(u=o.g,o.g=o.g.next,o.g||(o.h=null),u.next=null),u}class je{constructor(){this.h=this.g=null}add(u,h){const p=Ft.get();p.set(u,h),this.h?this.h.next=p:this.g=p,this.h=p}}var Ft=new Y(()=>new Fe,o=>o.reset());class Fe{constructor(){this.next=this.g=this.h=null}set(u,h){this.h=u,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let Ee,pe=!1,st=new je,W=()=>{const o=l.Promise.resolve(void 0);Ee=()=>{o.then(B)}};var B=()=>{for(var o;o=y();){try{o.h.call(o.g)}catch(h){S(h)}var u=Ft;u.j(o),100>u.h&&(u.h++,o.next=u.g,u.g=o)}pe=!1};function U(){this.s=this.s,this.C=this.C}U.prototype.s=!1,U.prototype.ma=function(){this.s||(this.s=!0,this.N())},U.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Z(o,u){this.type=o,this.g=this.target=u,this.defaultPrevented=!1}Z.prototype.h=function(){this.defaultPrevented=!0};var Qe=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var o=!1,u=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const h=()=>{};l.addEventListener("test",h,u),l.removeEventListener("test",h,u)}catch{}return o}();function We(o,u){if(Z.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var h=this.type=o.type,p=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=u,u=o.relatedTarget){if(fe){e:{try{H(u.nodeName);var b=!0;break e}catch{}b=!1}b||(u=null)}}else h=="mouseover"?u=o.fromElement:h=="mouseout"&&(u=o.toElement);this.relatedTarget=u,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:be[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&We.aa.h.call(this)}}k(We,Z);var be={2:"touch",3:"pen",4:"mouse"};We.prototype.h=function(){We.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var De="closure_listenable_"+(1e6*Math.random()|0),Jt=0;function yn(o,u,h,p,b){this.listener=o,this.proxy=null,this.src=u,this.type=h,this.capture=!!p,this.ha=b,this.key=++Jt,this.da=this.fa=!1}function wt(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function vn(o){this.src=o,this.g={},this.h=0}vn.prototype.add=function(o,u,h,p,b){var P=o.toString();o=this.g[P],o||(o=this.g[P]=[],this.h++);var q=_(o,u,p,b);return-1<q?(u=o[q],h||(u.fa=!1)):(u=new yn(u,this.src,P,!!p,b),u.fa=h,o.push(u)),u};function Qn(o,u){var h=u.type;if(h in o.g){var p=o.g[h],b=Array.prototype.indexOf.call(p,u,void 0),P;(P=0<=b)&&Array.prototype.splice.call(p,b,1),P&&(wt(u),o.g[h].length==0&&(delete o.g[h],o.h--))}}function _(o,u,h,p){for(var b=0;b<o.length;++b){var P=o[b];if(!P.da&&P.listener==u&&P.capture==!!h&&P.ha==p)return b}return-1}var I="closure_lm_"+(1e6*Math.random()|0),C={};function M(o,u,h,p,b){if(p&&p.once)return K(o,u,h,p,b);if(Array.isArray(u)){for(var P=0;P<u.length;P++)M(o,u[P],h,p,b);return null}return h=ie(h),o&&o[De]?o.K(u,h,d(p)?!!p.capture:!!p,b):D(o,u,h,!1,p,b)}function D(o,u,h,p,b,P){if(!u)throw Error("Invalid event type");var q=d(b)?!!b.capture:!!b,Se=z(o);if(Se||(o[I]=Se=new vn(o)),h=Se.add(u,h,p,q,P),h.proxy)return h;if(p=x(),h.proxy=p,p.src=o,p.listener=h,o.addEventListener)Qe||(b=q),b===void 0&&(b=!1),o.addEventListener(u.toString(),p,b);else if(o.attachEvent)o.attachEvent(L(u.toString()),p);else if(o.addListener&&o.removeListener)o.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return h}function x(){function o(h){return u.call(o.src,o.listener,h)}const u=te;return o}function K(o,u,h,p,b){if(Array.isArray(u)){for(var P=0;P<u.length;P++)K(o,u[P],h,p,b);return null}return h=ie(h),o&&o[De]?o.L(u,h,d(p)?!!p.capture:!!p,b):D(o,u,h,!0,p,b)}function $(o,u,h,p,b){if(Array.isArray(u))for(var P=0;P<u.length;P++)$(o,u[P],h,p,b);else p=d(p)?!!p.capture:!!p,h=ie(h),o&&o[De]?(o=o.i,u=String(u).toString(),u in o.g&&(P=o.g[u],h=_(P,h,p,b),-1<h&&(wt(P[h]),Array.prototype.splice.call(P,h,1),P.length==0&&(delete o.g[u],o.h--)))):o&&(o=z(o))&&(u=o.g[u.toString()],o=-1,u&&(o=_(u,h,p,b)),(h=-1<o?u[o]:null)&&j(h))}function j(o){if(typeof o!="number"&&o&&!o.da){var u=o.src;if(u&&u[De])Qn(u.i,o);else{var h=o.type,p=o.proxy;u.removeEventListener?u.removeEventListener(h,p,o.capture):u.detachEvent?u.detachEvent(L(h),p):u.addListener&&u.removeListener&&u.removeListener(p),(h=z(u))?(Qn(h,o),h.h==0&&(h.src=null,u[I]=null)):wt(o)}}}function L(o){return o in C?C[o]:C[o]="on"+o}function te(o,u){if(o.da)o=!0;else{u=new We(u,this);var h=o.listener,p=o.ha||o.src;o.fa&&j(o),o=h.call(p,u)}return o}function z(o){return o=o[I],o instanceof vn?o:null}var X="__closure_events_fn_"+(1e9*Math.random()>>>0);function ie(o){return typeof o=="function"?o:(o[X]||(o[X]=function(u){return o.handleEvent(u)}),o[X])}function re(){U.call(this),this.i=new vn(this),this.M=this,this.F=null}k(re,U),re.prototype[De]=!0,re.prototype.removeEventListener=function(o,u,h,p){$(this,o,u,h,p)};function ue(o,u){var h,p=o.F;if(p)for(h=[];p;p=p.F)h.push(p);if(o=o.M,p=u.type||u,typeof u=="string")u=new Z(u,o);else if(u instanceof Z)u.target=u.target||o;else{var b=u;u=new Z(p,o),T(u,b)}if(b=!0,h)for(var P=h.length-1;0<=P;P--){var q=u.g=h[P];b=_e(q,p,!0,u)&&b}if(q=u.g=o,b=_e(q,p,!0,u)&&b,b=_e(q,p,!1,u)&&b,h)for(P=0;P<h.length;P++)q=u.g=h[P],b=_e(q,p,!1,u)&&b}re.prototype.N=function(){if(re.aa.N.call(this),this.i){var o=this.i,u;for(u in o.g){for(var h=o.g[u],p=0;p<h.length;p++)wt(h[p]);delete o.g[u],o.h--}}this.F=null},re.prototype.K=function(o,u,h,p){return this.i.add(String(o),u,!1,h,p)},re.prototype.L=function(o,u,h,p){return this.i.add(String(o),u,!0,h,p)};function _e(o,u,h,p){if(u=o.i.g[String(u)],!u)return!0;u=u.concat();for(var b=!0,P=0;P<u.length;++P){var q=u[P];if(q&&!q.da&&q.capture==h){var Se=q.listener,Xe=q.ha||q.src;q.fa&&Qn(o.i,q),b=Se.call(Xe,p)!==!1&&b}}return b&&!p.defaultPrevented}function Je(o,u,h){if(typeof o=="function")h&&(o=E(o,h));else if(o&&typeof o.handleEvent=="function")o=E(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(u)?-1:l.setTimeout(o,u||0)}function $e(o){o.g=Je(()=>{o.g=null,o.i&&(o.i=!1,$e(o))},o.l);const u=o.h;o.h=null,o.m.apply(null,u)}class At extends U{constructor(u,h){super(),this.m=u,this.l=h,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:$e(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function qe(o){U.call(this),this.h=o,this.g={}}k(qe,U);var En=[];function Zr(o){ve(o.g,function(u,h){this.g.hasOwnProperty(h)&&j(u)},o),o.g={}}qe.prototype.N=function(){qe.aa.N.call(this),Zr(this)},qe.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Ye=l.JSON.stringify,kt=l.JSON.parse,ss=class{stringify(o){return l.JSON.stringify(o,void 0)}parse(o){return l.JSON.parse(o,void 0)}};function Jo(){}Jo.prototype.h=null;function Ac(o){return o.h||(o.h=o.i())}function bc(){}var ei={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Yo(){Z.call(this,"d")}k(Yo,Z);function Xo(){Z.call(this,"c")}k(Xo,Z);var Jn={},Rc=null;function os(){return Rc=Rc||new re}Jn.La="serverreachability";function Sc(o){Z.call(this,Jn.La,o)}k(Sc,Z);function ti(o){const u=os();ue(u,new Sc(u))}Jn.STAT_EVENT="statevent";function Pc(o,u){Z.call(this,Jn.STAT_EVENT,o),this.stat=u}k(Pc,Z);function pt(o){const u=os();ue(u,new Pc(u,o))}Jn.Ma="timingevent";function Cc(o,u){Z.call(this,Jn.Ma,o),this.size=u}k(Cc,Z);function ni(o,u){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){o()},u)}function ri(){this.g=!0}ri.prototype.xa=function(){this.g=!1};function ym(o,u,h,p,b,P){o.info(function(){if(o.g)if(P)for(var q="",Se=P.split("&"),Xe=0;Xe<Se.length;Xe++){var Te=Se[Xe].split("=");if(1<Te.length){var ot=Te[0];Te=Te[1];var at=ot.split("_");q=2<=at.length&&at[1]=="type"?q+(ot+"="+Te+"&"):q+(ot+"=redacted&")}}else q=null;else q=P;return"XMLHTTP REQ ("+p+") [attempt "+b+"]: "+u+`
`+h+`
`+q})}function vm(o,u,h,p,b,P,q){o.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+b+"]: "+u+`
`+h+`
`+P+" "+q})}function gr(o,u,h,p){o.info(function(){return"XMLHTTP TEXT ("+u+"): "+Tm(o,h)+(p?" "+p:"")})}function Em(o,u){o.info(function(){return"TIMEOUT: "+u})}ri.prototype.info=function(){};function Tm(o,u){if(!o.g)return u;if(!u)return null;try{var h=JSON.parse(u);if(h){for(o=0;o<h.length;o++)if(Array.isArray(h[o])){var p=h[o];if(!(2>p.length)){var b=p[1];if(Array.isArray(b)&&!(1>b.length)){var P=b[0];if(P!="noop"&&P!="stop"&&P!="close")for(var q=1;q<b.length;q++)b[q]=""}}}}return Ye(h)}catch{return u}}var as={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},kc={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Zo;function ls(){}k(ls,Jo),ls.prototype.g=function(){return new XMLHttpRequest},ls.prototype.i=function(){return{}},Zo=new ls;function Tn(o,u,h,p){this.j=o,this.i=u,this.l=h,this.R=p||1,this.U=new qe(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Dc}function Dc(){this.i=null,this.g="",this.h=!1}var Vc={},ea={};function ta(o,u,h){o.L=1,o.v=ds(Yt(u)),o.m=h,o.P=!0,Nc(o,null)}function Nc(o,u){o.F=Date.now(),cs(o),o.A=Yt(o.v);var h=o.A,p=o.R;Array.isArray(p)||(p=[String(p)]),Wc(h.i,"t",p),o.C=0,h=o.j.J,o.h=new Dc,o.g=hu(o.j,h?u:null,!o.m),0<o.O&&(o.M=new At(E(o.Y,o,o.g),o.O)),u=o.U,h=o.g,p=o.ca;var b="readystatechange";Array.isArray(b)||(b&&(En[0]=b.toString()),b=En);for(var P=0;P<b.length;P++){var q=M(h,b[P],p||u.handleEvent,!1,u.h||u);if(!q)break;u.g[q.key]=q}u=o.H?g(o.H):{},o.m?(o.u||(o.u="POST"),u["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,u)):(o.u="GET",o.g.ea(o.A,o.u,null,u)),ti(),ym(o.i,o.u,o.A,o.l,o.R,o.m)}Tn.prototype.ca=function(o){o=o.target;const u=this.M;u&&Xt(o)==3?u.j():this.Y(o)},Tn.prototype.Y=function(o){try{if(o==this.g)e:{const at=Xt(this.g);var u=this.g.Ba();const vr=this.g.Z();if(!(3>at)&&(at!=3||this.g&&(this.h.h||this.g.oa()||eu(this.g)))){this.J||at!=4||u==7||(u==8||0>=vr?ti(3):ti(2)),na(this);var h=this.g.Z();this.X=h;t:if(Oc(this)){var p=eu(this.g);o="";var b=p.length,P=Xt(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Yn(this),ii(this);var q="";break t}this.h.i=new l.TextDecoder}for(u=0;u<b;u++)this.h.h=!0,o+=this.h.i.decode(p[u],{stream:!(P&&u==b-1)});p.length=0,this.h.g+=o,this.C=0,q=this.h.g}else q=this.g.oa();if(this.o=h==200,vm(this.i,this.u,this.A,this.l,this.R,at,h),this.o){if(this.T&&!this.K){t:{if(this.g){var Se,Xe=this.g;if((Se=Xe.g?Xe.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!G(Se)){var Te=Se;break t}}Te=null}if(h=Te)gr(this.i,this.l,h,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,ra(this,h);else{this.o=!1,this.s=3,pt(12),Yn(this),ii(this);break e}}if(this.P){h=!0;let xt;for(;!this.J&&this.C<q.length;)if(xt=Im(this,q),xt==ea){at==4&&(this.s=4,pt(14),h=!1),gr(this.i,this.l,null,"[Incomplete Response]");break}else if(xt==Vc){this.s=4,pt(15),gr(this.i,this.l,q,"[Invalid Chunk]"),h=!1;break}else gr(this.i,this.l,xt,null),ra(this,xt);if(Oc(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),at!=4||q.length!=0||this.h.h||(this.s=1,pt(16),h=!1),this.o=this.o&&h,!h)gr(this.i,this.l,q,"[Invalid Chunked Response]"),Yn(this),ii(this);else if(0<q.length&&!this.W){this.W=!0;var ot=this.j;ot.g==this&&ot.ba&&!ot.M&&(ot.j.info("Great, no buffering proxy detected. Bytes received: "+q.length),ca(ot),ot.M=!0,pt(11))}}else gr(this.i,this.l,q,null),ra(this,q);at==4&&Yn(this),this.o&&!this.J&&(at==4?au(this.j,this):(this.o=!1,cs(this)))}else Um(this.g),h==400&&0<q.indexOf("Unknown SID")?(this.s=3,pt(12)):(this.s=0,pt(13)),Yn(this),ii(this)}}}catch{}finally{}};function Oc(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function Im(o,u){var h=o.C,p=u.indexOf(`
`,h);return p==-1?ea:(h=Number(u.substring(h,p)),isNaN(h)?Vc:(p+=1,p+h>u.length?ea:(u=u.slice(p,p+h),o.C=p+h,u)))}Tn.prototype.cancel=function(){this.J=!0,Yn(this)};function cs(o){o.S=Date.now()+o.I,xc(o,o.I)}function xc(o,u){if(o.B!=null)throw Error("WatchDog timer not null");o.B=ni(E(o.ba,o),u)}function na(o){o.B&&(l.clearTimeout(o.B),o.B=null)}Tn.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(Em(this.i,this.A),this.L!=2&&(ti(),pt(17)),Yn(this),this.s=2,ii(this)):xc(this,this.S-o)};function ii(o){o.j.G==0||o.J||au(o.j,o)}function Yn(o){na(o);var u=o.M;u&&typeof u.ma=="function"&&u.ma(),o.M=null,Zr(o.U),o.g&&(u=o.g,o.g=null,u.abort(),u.ma())}function ra(o,u){try{var h=o.j;if(h.G!=0&&(h.g==o||ia(h.h,o))){if(!o.K&&ia(h.h,o)&&h.G==3){try{var p=h.Da.g.parse(u)}catch{p=null}if(Array.isArray(p)&&p.length==3){var b=p;if(b[0]==0){e:if(!h.u){if(h.g)if(h.g.F+3e3<o.F)ys(h),gs(h);else break e;la(h),pt(18)}}else h.za=b[1],0<h.za-h.T&&37500>b[2]&&h.F&&h.v==0&&!h.C&&(h.C=ni(E(h.Za,h),6e3));if(1>=Fc(h.h)&&h.ca){try{h.ca()}catch{}h.ca=void 0}}else Zn(h,11)}else if((o.K||h.g==o)&&ys(h),!G(u))for(b=h.Da.g.parse(u),u=0;u<b.length;u++){let Te=b[u];if(h.T=Te[0],Te=Te[1],h.G==2)if(Te[0]=="c"){h.K=Te[1],h.ia=Te[2];const ot=Te[3];ot!=null&&(h.la=ot,h.j.info("VER="+h.la));const at=Te[4];at!=null&&(h.Aa=at,h.j.info("SVER="+h.Aa));const vr=Te[5];vr!=null&&typeof vr=="number"&&0<vr&&(p=1.5*vr,h.L=p,h.j.info("backChannelRequestTimeoutMs_="+p)),p=h;const xt=o.g;if(xt){const Es=xt.g?xt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Es){var P=p.h;P.g||Es.indexOf("spdy")==-1&&Es.indexOf("quic")==-1&&Es.indexOf("h2")==-1||(P.j=P.l,P.g=new Set,P.h&&(sa(P,P.h),P.h=null))}if(p.D){const ua=xt.g?xt.g.getResponseHeader("X-HTTP-Session-Id"):null;ua&&(p.ya=ua,ke(p.I,p.D,ua))}}h.G=3,h.l&&h.l.ua(),h.ba&&(h.R=Date.now()-o.F,h.j.info("Handshake RTT: "+h.R+"ms")),p=h;var q=o;if(p.qa=uu(p,p.J?p.ia:null,p.W),q.K){Uc(p.h,q);var Se=q,Xe=p.L;Xe&&(Se.I=Xe),Se.B&&(na(Se),cs(Se)),p.g=q}else su(p);0<h.i.length&&_s(h)}else Te[0]!="stop"&&Te[0]!="close"||Zn(h,7);else h.G==3&&(Te[0]=="stop"||Te[0]=="close"?Te[0]=="stop"?Zn(h,7):aa(h):Te[0]!="noop"&&h.l&&h.l.ta(Te),h.v=0)}}ti(4)}catch{}}var wm=class{constructor(o,u){this.g=o,this.map=u}};function Mc(o){this.l=o||10,l.PerformanceNavigationTiming?(o=l.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Lc(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Fc(o){return o.h?1:o.g?o.g.size:0}function ia(o,u){return o.h?o.h==u:o.g?o.g.has(u):!1}function sa(o,u){o.g?o.g.add(u):o.h=u}function Uc(o,u){o.h&&o.h==u?o.h=null:o.g&&o.g.has(u)&&o.g.delete(u)}Mc.prototype.cancel=function(){if(this.i=Bc(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Bc(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let u=o.i;for(const h of o.g.values())u=u.concat(h.D);return u}return O(o.i)}function Am(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(c(o)){for(var u=[],h=o.length,p=0;p<h;p++)u.push(o[p]);return u}u=[],h=0;for(p in o)u[h++]=o[p];return u}function bm(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(c(o)||typeof o=="string"){var u=[];o=o.length;for(var h=0;h<o;h++)u.push(h);return u}u=[],h=0;for(const p in o)u[h++]=p;return u}}}function jc(o,u){if(o.forEach&&typeof o.forEach=="function")o.forEach(u,void 0);else if(c(o)||typeof o=="string")Array.prototype.forEach.call(o,u,void 0);else for(var h=bm(o),p=Am(o),b=p.length,P=0;P<b;P++)u.call(void 0,p[P],h&&h[P],o)}var $c=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Rm(o,u){if(o){o=o.split("&");for(var h=0;h<o.length;h++){var p=o[h].indexOf("="),b=null;if(0<=p){var P=o[h].substring(0,p);b=o[h].substring(p+1)}else P=o[h];u(P,b?decodeURIComponent(b.replace(/\+/g," ")):"")}}}function Xn(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof Xn){this.h=o.h,us(this,o.j),this.o=o.o,this.g=o.g,hs(this,o.s),this.l=o.l;var u=o.i,h=new ai;h.i=u.i,u.g&&(h.g=new Map(u.g),h.h=u.h),qc(this,h),this.m=o.m}else o&&(u=String(o).match($c))?(this.h=!1,us(this,u[1]||"",!0),this.o=si(u[2]||""),this.g=si(u[3]||"",!0),hs(this,u[4]),this.l=si(u[5]||"",!0),qc(this,u[6]||"",!0),this.m=si(u[7]||"")):(this.h=!1,this.i=new ai(null,this.h))}Xn.prototype.toString=function(){var o=[],u=this.j;u&&o.push(oi(u,Hc,!0),":");var h=this.g;return(h||u=="file")&&(o.push("//"),(u=this.o)&&o.push(oi(u,Hc,!0),"@"),o.push(encodeURIComponent(String(h)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.s,h!=null&&o.push(":",String(h))),(h=this.l)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(oi(h,h.charAt(0)=="/"?Cm:Pm,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",oi(h,Dm)),o.join("")};function Yt(o){return new Xn(o)}function us(o,u,h){o.j=h?si(u,!0):u,o.j&&(o.j=o.j.replace(/:$/,""))}function hs(o,u){if(u){if(u=Number(u),isNaN(u)||0>u)throw Error("Bad port number "+u);o.s=u}else o.s=null}function qc(o,u,h){u instanceof ai?(o.i=u,Vm(o.i,o.h)):(h||(u=oi(u,km)),o.i=new ai(u,o.h))}function ke(o,u,h){o.i.set(u,h)}function ds(o){return ke(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function si(o,u){return o?u?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function oi(o,u,h){return typeof o=="string"?(o=encodeURI(o).replace(u,Sm),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function Sm(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Hc=/[#\/\?@]/g,Pm=/[#\?:]/g,Cm=/[#\?]/g,km=/[#\?@]/g,Dm=/#/g;function ai(o,u){this.h=this.g=null,this.i=o||null,this.j=!!u}function In(o){o.g||(o.g=new Map,o.h=0,o.i&&Rm(o.i,function(u,h){o.add(decodeURIComponent(u.replace(/\+/g," ")),h)}))}n=ai.prototype,n.add=function(o,u){In(this),this.i=null,o=_r(this,o);var h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(u),this.h+=1,this};function Kc(o,u){In(o),u=_r(o,u),o.g.has(u)&&(o.i=null,o.h-=o.g.get(u).length,o.g.delete(u))}function zc(o,u){return In(o),u=_r(o,u),o.g.has(u)}n.forEach=function(o,u){In(this),this.g.forEach(function(h,p){h.forEach(function(b){o.call(u,b,p,this)},this)},this)},n.na=function(){In(this);const o=Array.from(this.g.values()),u=Array.from(this.g.keys()),h=[];for(let p=0;p<u.length;p++){const b=o[p];for(let P=0;P<b.length;P++)h.push(u[p])}return h},n.V=function(o){In(this);let u=[];if(typeof o=="string")zc(this,o)&&(u=u.concat(this.g.get(_r(this,o))));else{o=Array.from(this.g.values());for(let h=0;h<o.length;h++)u=u.concat(o[h])}return u},n.set=function(o,u){return In(this),this.i=null,o=_r(this,o),zc(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[u]),this.h+=1,this},n.get=function(o,u){return o?(o=this.V(o),0<o.length?String(o[0]):u):u};function Wc(o,u,h){Kc(o,u),0<h.length&&(o.i=null,o.g.set(_r(o,u),O(h)),o.h+=h.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],u=Array.from(this.g.keys());for(var h=0;h<u.length;h++){var p=u[h];const P=encodeURIComponent(String(p)),q=this.V(p);for(p=0;p<q.length;p++){var b=P;q[p]!==""&&(b+="="+encodeURIComponent(String(q[p]))),o.push(b)}}return this.i=o.join("&")};function _r(o,u){return u=String(u),o.j&&(u=u.toLowerCase()),u}function Vm(o,u){u&&!o.j&&(In(o),o.i=null,o.g.forEach(function(h,p){var b=p.toLowerCase();p!=b&&(Kc(this,p),Wc(this,b,h))},o)),o.j=u}function Nm(o,u){const h=new ri;if(l.Image){const p=new Image;p.onload=R(wn,h,"TestLoadImage: loaded",!0,u,p),p.onerror=R(wn,h,"TestLoadImage: error",!1,u,p),p.onabort=R(wn,h,"TestLoadImage: abort",!1,u,p),p.ontimeout=R(wn,h,"TestLoadImage: timeout",!1,u,p),l.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=o}else u(!1)}function Om(o,u){const h=new ri,p=new AbortController,b=setTimeout(()=>{p.abort(),wn(h,"TestPingServer: timeout",!1,u)},1e4);fetch(o,{signal:p.signal}).then(P=>{clearTimeout(b),P.ok?wn(h,"TestPingServer: ok",!0,u):wn(h,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(b),wn(h,"TestPingServer: error",!1,u)})}function wn(o,u,h,p,b){try{b&&(b.onload=null,b.onerror=null,b.onabort=null,b.ontimeout=null),p(h)}catch{}}function xm(){this.g=new ss}function Mm(o,u,h){const p=h||"";try{jc(o,function(b,P){let q=b;d(b)&&(q=Ye(b)),u.push(p+P+"="+encodeURIComponent(q))})}catch(b){throw u.push(p+"type="+encodeURIComponent("_badmap")),b}}function fs(o){this.l=o.Ub||null,this.j=o.eb||!1}k(fs,Jo),fs.prototype.g=function(){return new ps(this.l,this.j)},fs.prototype.i=function(o){return function(){return o}}({});function ps(o,u){re.call(this),this.D=o,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}k(ps,re),n=ps.prototype,n.open=function(o,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=u,this.readyState=1,ci(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const u={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(u.body=o),(this.D||l).fetch(new Request(this.A,u)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,li(this)),this.readyState=0},n.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,ci(this)),this.g&&(this.readyState=3,ci(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Gc(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function Gc(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}n.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var u=o.value?o.value:new Uint8Array(0);(u=this.v.decode(u,{stream:!o.done}))&&(this.response=this.responseText+=u)}o.done?li(this):ci(this),this.readyState==3&&Gc(this)}},n.Ra=function(o){this.g&&(this.response=this.responseText=o,li(this))},n.Qa=function(o){this.g&&(this.response=o,li(this))},n.ga=function(){this.g&&li(this)};function li(o){o.readyState=4,o.l=null,o.j=null,o.v=null,ci(o)}n.setRequestHeader=function(o,u){this.u.append(o,u)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],u=this.h.entries();for(var h=u.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=u.next();return o.join(`\r
`)};function ci(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(ps.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Qc(o){let u="";return ve(o,function(h,p){u+=p,u+=":",u+=h,u+=`\r
`}),u}function oa(o,u,h){e:{for(p in h){var p=!1;break e}p=!0}p||(h=Qc(h),typeof o=="string"?h!=null&&encodeURIComponent(String(h)):ke(o,u,h))}function xe(o){re.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}k(xe,re);var Lm=/^https?$/i,Fm=["POST","PUT"];n=xe.prototype,n.Ha=function(o){this.J=o},n.ea=function(o,u,h,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);u=u?u.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Zo.g(),this.v=this.o?Ac(this.o):Ac(Zo),this.g.onreadystatechange=E(this.Ea,this);try{this.B=!0,this.g.open(u,String(o),!0),this.B=!1}catch(P){Jc(this,P);return}if(o=h||"",h=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var b in p)h.set(b,p[b]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const P of p.keys())h.set(P,p.get(P));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(h.keys()).find(P=>P.toLowerCase()=="content-type"),b=l.FormData&&o instanceof l.FormData,!(0<=Array.prototype.indexOf.call(Fm,u,void 0))||p||b||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[P,q]of h)this.g.setRequestHeader(P,q);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Zc(this),this.u=!0,this.g.send(o),this.u=!1}catch(P){Jc(this,P)}};function Jc(o,u){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=u,o.m=5,Yc(o),ms(o)}function Yc(o){o.A||(o.A=!0,ue(o,"complete"),ue(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,ue(this,"complete"),ue(this,"abort"),ms(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),ms(this,!0)),xe.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?Xc(this):this.bb())},n.bb=function(){Xc(this)};function Xc(o){if(o.h&&typeof a<"u"&&(!o.v[1]||Xt(o)!=4||o.Z()!=2)){if(o.u&&Xt(o)==4)Je(o.Ea,0,o);else if(ue(o,"readystatechange"),Xt(o)==4){o.h=!1;try{const q=o.Z();e:switch(q){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break e;default:u=!1}var h;if(!(h=u)){var p;if(p=q===0){var b=String(o.D).match($c)[1]||null;!b&&l.self&&l.self.location&&(b=l.self.location.protocol.slice(0,-1)),p=!Lm.test(b?b.toLowerCase():"")}h=p}if(h)ue(o,"complete"),ue(o,"success");else{o.m=6;try{var P=2<Xt(o)?o.g.statusText:""}catch{P=""}o.l=P+" ["+o.Z()+"]",Yc(o)}}finally{ms(o)}}}}function ms(o,u){if(o.g){Zc(o);const h=o.g,p=o.v[0]?()=>{}:null;o.g=null,o.v=null,u||ue(o,"ready");try{h.onreadystatechange=p}catch{}}}function Zc(o){o.I&&(l.clearTimeout(o.I),o.I=null)}n.isActive=function(){return!!this.g};function Xt(o){return o.g?o.g.readyState:0}n.Z=function(){try{return 2<Xt(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(o){if(this.g){var u=this.g.responseText;return o&&u.indexOf(o)==0&&(u=u.substring(o.length)),kt(u)}};function eu(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function Um(o){const u={};o=(o.g&&2<=Xt(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<o.length;p++){if(G(o[p]))continue;var h=A(o[p]);const b=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const P=u[b]||[];u[b]=P,P.push(h)}w(u,function(p){return p.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function ui(o,u,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||u}function tu(o){this.Aa=0,this.i=[],this.j=new ri,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=ui("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=ui("baseRetryDelayMs",5e3,o),this.cb=ui("retryDelaySeedMs",1e4,o),this.Wa=ui("forwardChannelMaxRetries",2,o),this.wa=ui("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new Mc(o&&o.concurrentRequestLimit),this.Da=new xm,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=tu.prototype,n.la=8,n.G=1,n.connect=function(o,u,h,p){pt(0),this.W=o,this.H=u||{},h&&p!==void 0&&(this.H.OSID=h,this.H.OAID=p),this.F=this.X,this.I=uu(this,null,this.W),_s(this)};function aa(o){if(nu(o),o.G==3){var u=o.U++,h=Yt(o.I);if(ke(h,"SID",o.K),ke(h,"RID",u),ke(h,"TYPE","terminate"),hi(o,h),u=new Tn(o,o.j,u),u.L=2,u.v=ds(Yt(h)),h=!1,l.navigator&&l.navigator.sendBeacon)try{h=l.navigator.sendBeacon(u.v.toString(),"")}catch{}!h&&l.Image&&(new Image().src=u.v,h=!0),h||(u.g=hu(u.j,null),u.g.ea(u.v)),u.F=Date.now(),cs(u)}cu(o)}function gs(o){o.g&&(ca(o),o.g.cancel(),o.g=null)}function nu(o){gs(o),o.u&&(l.clearTimeout(o.u),o.u=null),ys(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&l.clearTimeout(o.s),o.s=null)}function _s(o){if(!Lc(o.h)&&!o.s){o.s=!0;var u=o.Ga;Ee||W(),pe||(Ee(),pe=!0),st.add(u,o),o.B=0}}function Bm(o,u){return Fc(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=u.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=ni(E(o.Ga,o,u),lu(o,o.B)),o.B++,!0)}n.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const b=new Tn(this,this.j,o);let P=this.o;if(this.S&&(P?(P=g(P),T(P,this.S)):P=this.S),this.m!==null||this.O||(b.H=P,P=null),this.P)e:{for(var u=0,h=0;h<this.i.length;h++){t:{var p=this.i[h];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(u+=p,4096<u){u=h;break e}if(u===4096||h===this.i.length-1){u=h+1;break e}}u=1e3}else u=1e3;u=iu(this,b,u),h=Yt(this.I),ke(h,"RID",o),ke(h,"CVER",22),this.D&&ke(h,"X-HTTP-Session-Id",this.D),hi(this,h),P&&(this.O?u="headers="+encodeURIComponent(String(Qc(P)))+"&"+u:this.m&&oa(h,this.m,P)),sa(this.h,b),this.Ua&&ke(h,"TYPE","init"),this.P?(ke(h,"$req",u),ke(h,"SID","null"),b.T=!0,ta(b,h,null)):ta(b,h,u),this.G=2}}else this.G==3&&(o?ru(this,o):this.i.length==0||Lc(this.h)||ru(this))};function ru(o,u){var h;u?h=u.l:h=o.U++;const p=Yt(o.I);ke(p,"SID",o.K),ke(p,"RID",h),ke(p,"AID",o.T),hi(o,p),o.m&&o.o&&oa(p,o.m,o.o),h=new Tn(o,o.j,h,o.B+1),o.m===null&&(h.H=o.o),u&&(o.i=u.D.concat(o.i)),u=iu(o,h,1e3),h.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),sa(o.h,h),ta(h,p,u)}function hi(o,u){o.H&&ve(o.H,function(h,p){ke(u,p,h)}),o.l&&jc({},function(h,p){ke(u,p,h)})}function iu(o,u,h){h=Math.min(o.i.length,h);var p=o.l?E(o.l.Na,o.l,o):null;e:{var b=o.i;let P=-1;for(;;){const q=["count="+h];P==-1?0<h?(P=b[0].g,q.push("ofs="+P)):P=0:q.push("ofs="+P);let Se=!0;for(let Xe=0;Xe<h;Xe++){let Te=b[Xe].g;const ot=b[Xe].map;if(Te-=P,0>Te)P=Math.max(0,b[Xe].g-100),Se=!1;else try{Mm(ot,q,"req"+Te+"_")}catch{p&&p(ot)}}if(Se){p=q.join("&");break e}}}return o=o.i.splice(0,h),u.D=o,p}function su(o){if(!o.g&&!o.u){o.Y=1;var u=o.Fa;Ee||W(),pe||(Ee(),pe=!0),st.add(u,o),o.v=0}}function la(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=ni(E(o.Fa,o),lu(o,o.v)),o.v++,!0)}n.Fa=function(){if(this.u=null,ou(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=ni(E(this.ab,this),o)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,pt(10),gs(this),ou(this))};function ca(o){o.A!=null&&(l.clearTimeout(o.A),o.A=null)}function ou(o){o.g=new Tn(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var u=Yt(o.qa);ke(u,"RID","rpc"),ke(u,"SID",o.K),ke(u,"AID",o.T),ke(u,"CI",o.F?"0":"1"),!o.F&&o.ja&&ke(u,"TO",o.ja),ke(u,"TYPE","xmlhttp"),hi(o,u),o.m&&o.o&&oa(u,o.m,o.o),o.L&&(o.g.I=o.L);var h=o.g;o=o.ia,h.L=1,h.v=ds(Yt(u)),h.m=null,h.P=!0,Nc(h,o)}n.Za=function(){this.C!=null&&(this.C=null,gs(this),la(this),pt(19))};function ys(o){o.C!=null&&(l.clearTimeout(o.C),o.C=null)}function au(o,u){var h=null;if(o.g==u){ys(o),ca(o),o.g=null;var p=2}else if(ia(o.h,u))h=u.D,Uc(o.h,u),p=1;else return;if(o.G!=0){if(u.o)if(p==1){h=u.m?u.m.length:0,u=Date.now()-u.F;var b=o.B;p=os(),ue(p,new Cc(p,h)),_s(o)}else su(o);else if(b=u.s,b==3||b==0&&0<u.X||!(p==1&&Bm(o,u)||p==2&&la(o)))switch(h&&0<h.length&&(u=o.h,u.i=u.i.concat(h)),b){case 1:Zn(o,5);break;case 4:Zn(o,10);break;case 3:Zn(o,6);break;default:Zn(o,2)}}}function lu(o,u){let h=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(h*=2),h*u}function Zn(o,u){if(o.j.info("Error code "+u),u==2){var h=E(o.fb,o),p=o.Xa;const b=!p;p=new Xn(p||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||us(p,"https"),ds(p),b?Nm(p.toString(),h):Om(p.toString(),h)}else pt(2);o.G=0,o.l&&o.l.sa(u),cu(o),nu(o)}n.fb=function(o){o?(this.j.info("Successfully pinged google.com"),pt(2)):(this.j.info("Failed to ping google.com"),pt(1))};function cu(o){if(o.G=0,o.ka=[],o.l){const u=Bc(o.h);(u.length!=0||o.i.length!=0)&&(F(o.ka,u),F(o.ka,o.i),o.h.i.length=0,O(o.i),o.i.length=0),o.l.ra()}}function uu(o,u,h){var p=h instanceof Xn?Yt(h):new Xn(h);if(p.g!="")u&&(p.g=u+"."+p.g),hs(p,p.s);else{var b=l.location;p=b.protocol,u=u?u+"."+b.hostname:b.hostname,b=+b.port;var P=new Xn(null);p&&us(P,p),u&&(P.g=u),b&&hs(P,b),h&&(P.l=h),p=P}return h=o.D,u=o.ya,h&&u&&ke(p,h,u),ke(p,"VER",o.la),hi(o,p),p}function hu(o,u,h){if(u&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return u=o.Ca&&!o.pa?new xe(new fs({eb:h})):new xe(o.pa),u.Ha(o.J),u}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function du(){}n=du.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function vs(){}vs.prototype.g=function(o,u){return new bt(o,u)};function bt(o,u){re.call(this),this.g=new tu(u),this.l=o,this.h=u&&u.messageUrlParams||null,o=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(o?o["X-WebChannel-Content-Type"]=u.messageContentType:o={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.va&&(o?o["X-WebChannel-Client-Profile"]=u.va:o={"X-WebChannel-Client-Profile":u.va}),this.g.S=o,(o=u&&u.Sb)&&!G(o)&&(this.g.m=o),this.v=u&&u.supportsCrossDomainXhr||!1,this.u=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!G(u)&&(this.g.D=u,o=this.h,o!==null&&u in o&&(o=this.h,u in o&&delete o[u])),this.j=new yr(this)}k(bt,re),bt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},bt.prototype.close=function(){aa(this.g)},bt.prototype.o=function(o){var u=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.u&&(h={},h.__data__=Ye(o),o=h);u.i.push(new wm(u.Ya++,o)),u.G==3&&_s(u)},bt.prototype.N=function(){this.g.l=null,delete this.j,aa(this.g),delete this.g,bt.aa.N.call(this)};function fu(o){Yo.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var u=o.__sm__;if(u){e:{for(const h in u){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,u=u!==null&&o in u?u[o]:void 0),this.data=u}else this.data=o}k(fu,Yo);function pu(){Xo.call(this),this.status=1}k(pu,Xo);function yr(o){this.g=o}k(yr,du),yr.prototype.ua=function(){ue(this.g,"a")},yr.prototype.ta=function(o){ue(this.g,new fu(o))},yr.prototype.sa=function(o){ue(this.g,new pu)},yr.prototype.ra=function(){ue(this.g,"b")},vs.prototype.createWebChannel=vs.prototype.g,bt.prototype.send=bt.prototype.o,bt.prototype.open=bt.prototype.m,bt.prototype.close=bt.prototype.close,Rf=function(){return new vs},bf=function(){return os()},Af=Jn,Za={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},as.NO_ERROR=0,as.TIMEOUT=8,as.HTTP_ERROR=6,Fs=as,kc.COMPLETE="complete",wf=kc,bc.EventType=ei,ei.OPEN="a",ei.CLOSE="b",ei.ERROR="c",ei.MESSAGE="d",re.prototype.listen=re.prototype.K,gi=bc,xe.prototype.listenOnce=xe.prototype.L,xe.prototype.getLastError=xe.prototype.Ka,xe.prototype.getLastErrorCode=xe.prototype.Ba,xe.prototype.getStatus=xe.prototype.Z,xe.prototype.getResponseJson=xe.prototype.Oa,xe.prototype.getResponseText=xe.prototype.oa,xe.prototype.send=xe.prototype.ea,xe.prototype.setWithCredentials=xe.prototype.Ha,If=xe}).apply(typeof Ps<"u"?Ps:typeof self<"u"?self:typeof window<"u"?window:{});const th="@firebase/firestore";/**
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
 */class ct{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}ct.UNAUTHENTICATED=new ct(null),ct.GOOGLE_CREDENTIALS=new ct("google-credentials-uid"),ct.FIRST_PARTY=new ct("first-party-uid"),ct.MOCK_USER=new ct("mock-user");/**
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
 */let Gr="10.14.0";/**
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
 */const lr=new Ml("@firebase/firestore");function pi(){return lr.logLevel}function J(n,...e){if(lr.logLevel<=ge.DEBUG){const t=e.map(Ul);lr.debug(`Firestore (${Gr}): ${n}`,...t)}}function dn(n,...e){if(lr.logLevel<=ge.ERROR){const t=e.map(Ul);lr.error(`Firestore (${Gr}): ${n}`,...t)}}function Ur(n,...e){if(lr.logLevel<=ge.WARN){const t=e.map(Ul);lr.warn(`Firestore (${Gr}): ${n}`,...t)}}function Ul(n){if(typeof n=="string")return n;try{/**
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
 */function oe(n="Unexpected state"){const e=`FIRESTORE (${Gr}) INTERNAL ASSERTION FAILED: `+n;throw dn(e),new Error(e)}function Re(n,e){n||oe()}function ce(n,e){return n}/**
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
 */const V={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class ee extends _n{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class Sf{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Wv{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(ct.UNAUTHENTICATED))}shutdown(){}}class Gv{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class Qv{constructor(e){this.t=e,this.currentUser=ct.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){Re(this.o===void 0);let r=this.i;const i=c=>this.i!==r?(r=this.i,t(c)):Promise.resolve();let s=new Mn;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new Mn,e.enqueueRetryable(()=>i(this.currentUser))};const a=()=>{const c=s;e.enqueueRetryable(async()=>{await c.promise,await i(this.currentUser)})},l=c=>{J("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(c=>l(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?l(c):(J("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new Mn)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(J("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(Re(typeof r.accessToken=="string"),new Sf(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Re(e===null||typeof e=="string"),new ct(e)}}class Jv{constructor(e,t,r){this.l=e,this.h=t,this.P=r,this.type="FirstParty",this.user=ct.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class Yv{constructor(e,t,r){this.l=e,this.h=t,this.P=r}getToken(){return Promise.resolve(new Jv(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(ct.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Xv{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Zv{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){Re(this.o===void 0);const r=s=>{s.error!=null&&J("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const a=s.token!==this.R;return this.R=s.token,J("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>r(s))};const i=s=>{J("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){const s=this.A.getImmediate({optional:!0});s?i(s):J("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(Re(typeof t.token=="string"),this.R=t.token,new Xv(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */class Pf{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const i=eE(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<t&&(r+=e.charAt(i[s]%e.length))}return r}}function Ie(n,e){return n<e?-1:n>e?1:0}function Br(n,e,t){return n.length===e.length&&n.every((r,i)=>t(r,e[i]))}/**
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
 */class ze{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new ee(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new ee(V.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new ee(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new ee(V.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return ze.fromMillis(Date.now())}static fromDate(e){return ze.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*t));return new ze(t,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?Ie(this.nanoseconds,e.nanoseconds):Ie(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
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
 */class le{constructor(e){this.timestamp=e}static fromTimestamp(e){return new le(e)}static min(){return new le(new ze(0,0))}static max(){return new le(new ze(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */class Li{constructor(e,t,r){t===void 0?t=0:t>e.length&&oe(),r===void 0?r=e.length-t:r>e.length-t&&oe(),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Li.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Li?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let i=0;i<r;i++){const s=e.get(i),a=t.get(i);if(s<a)return-1;if(s>a)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class Ve extends Li{construct(e,t,r){return new Ve(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new ee(V.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(i=>i.length>0))}return new Ve(t)}static emptyPath(){return new Ve([])}}const tE=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class tt extends Li{construct(e,t,r){return new tt(e,t,r)}static isValidIdentifier(e){return tE.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),tt.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new tt(["__name__"])}static fromServerFormat(e){const t=[];let r="",i=0;const s=()=>{if(r.length===0)throw new ee(V.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;i<e.length;){const l=e[i];if(l==="\\"){if(i+1===e.length)throw new ee(V.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[i+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new ee(V.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=c,i+=2}else l==="`"?(a=!a,i++):l!=="."||a?(r+=l,i++):(s(),i++)}if(s(),a)throw new ee(V.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new tt(t)}static emptyPath(){return new tt([])}}/**
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
 */class ne{constructor(e){this.path=e}static fromPath(e){return new ne(Ve.fromString(e))}static fromName(e){return new ne(Ve.fromString(e).popFirst(5))}static empty(){return new ne(Ve.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Ve.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return Ve.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new ne(new Ve(e.slice()))}}function nE(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,i=le.fromTimestamp(r===1e9?new ze(t+1,0):new ze(t,r));return new $n(i,ne.empty(),e)}function rE(n){return new $n(n.readTime,n.key,-1)}class $n{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new $n(le.min(),ne.empty(),-1)}static max(){return new $n(le.max(),ne.empty(),-1)}}function iE(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=ne.comparator(n.documentKey,e.documentKey),t!==0?t:Ie(n.largestBatchId,e.largestBatchId))}/**
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
 */const sE="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class oE{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
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
 */async function Gi(n){if(n.code!==V.FAILED_PRECONDITION||n.message!==sE)throw n;J("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class N{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&oe(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new N((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(t,s).next(r,i)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof N?t:N.resolve(t)}catch(t){return N.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):N.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):N.reject(t)}static resolve(e){return new N((t,r)=>{t(e)})}static reject(e){return new N((t,r)=>{r(e)})}static waitFor(e){return new N((t,r)=>{let i=0,s=0,a=!1;e.forEach(l=>{++i,l.next(()=>{++s,a&&s===i&&t()},c=>r(c))}),a=!0,s===i&&t()})}static or(e){let t=N.resolve(!1);for(const r of e)t=t.next(i=>i?N.resolve(i):r());return t}static forEach(e,t){const r=[];return e.forEach((i,s)=>{r.push(t.call(this,i,s))}),this.waitFor(r)}static mapArray(e,t){return new N((r,i)=>{const s=e.length,a=new Array(s);let l=0;for(let c=0;c<s;c++){const d=c;t(e[d]).next(f=>{a[d]=f,++l,l===s&&r(a)},f=>i(f))}})}static doWhile(e,t){return new N((r,i)=>{const s=()=>{e()===!0?t().next(()=>{s()},i):r()};s()})}}function aE(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function Qi(n){return n.name==="IndexedDbTransactionError"}/**
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
 */class Bl{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ie(r),this.se=r=>t.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}Bl.oe=-1;function Co(n){return n==null}function no(n){return n===0&&1/n==-1/0}function lE(n){return typeof n=="number"&&Number.isInteger(n)&&!no(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
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
 */function nh(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function pr(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function Cf(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
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
 */class Oe{constructor(e,t){this.comparator=e,this.root=t||Ze.EMPTY}insert(e,t){return new Oe(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,Ze.BLACK,null,null))}remove(e){return new Oe(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ze.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return t+r.left.size;i<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Cs(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Cs(this.root,e,this.comparator,!1)}getReverseIterator(){return new Cs(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Cs(this.root,e,this.comparator,!0)}}class Cs{constructor(e,t,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class Ze{constructor(e,t,r,i,s){this.key=e,this.value=t,this.color=r??Ze.RED,this.left=i??Ze.EMPTY,this.right=s??Ze.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,i,s){return new Ze(e??this.key,t??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,r),null):s===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return Ze.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return Ze.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,Ze.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,Ze.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw oe();const e=this.left.check();if(e!==this.right.check())throw oe();return e+(this.isRed()?0:1)}}Ze.EMPTY=null,Ze.RED=!0,Ze.BLACK=!1;Ze.EMPTY=new class{constructor(){this.size=0}get key(){throw oe()}get value(){throw oe()}get color(){throw oe()}get left(){throw oe()}get right(){throw oe()}copy(e,t,r,i,s){return this}insert(e,t,r){return new Ze(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class nt{constructor(e){this.comparator=e,this.data=new Oe(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new rh(this.data.getIterator())}getIteratorFrom(e){return new rh(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof nt)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new nt(this.comparator);return t.data=e,t}}class rh{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */class Pt{constructor(e){this.fields=e,e.sort(tt.comparator)}static empty(){return new Pt([])}unionWith(e){let t=new nt(tt.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new Pt(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Br(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
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
 */class kf extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class it{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new kf("Invalid base64 string: "+s):s}}(e);return new it(t)}static fromUint8Array(e){const t=function(i){let s="";for(let a=0;a<i.length;++a)s+=String.fromCharCode(i[a]);return s}(e);return new it(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Ie(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}it.EMPTY_BYTE_STRING=new it("");const cE=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function qn(n){if(Re(!!n),typeof n=="string"){let e=0;const t=cE.exec(n);if(Re(!!t),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:Le(n.seconds),nanos:Le(n.nanos)}}function Le(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function cr(n){return typeof n=="string"?it.fromBase64String(n):it.fromUint8Array(n)}/**
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
 */function jl(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function $l(n){const e=n.mapValue.fields.__previous_value__;return jl(e)?$l(e):e}function Fi(n){const e=qn(n.mapValue.fields.__local_write_time__.timestampValue);return new ze(e.seconds,e.nanos)}/**
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
 */class uE{constructor(e,t,r,i,s,a,l,c,d){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=a,this.autoDetectLongPolling=l,this.longPollingOptions=c,this.useFetchStreams=d}}class Ui{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new Ui("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof Ui&&e.projectId===this.projectId&&e.database===this.database}}/**
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
 */const ks={mapValue:{fields:{__type__:{stringValue:"__max__"}}}};function ur(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?jl(n)?4:dE(n)?9007199254740991:hE(n)?10:11:oe()}function Wt(n,e){if(n===e)return!0;const t=ur(n);if(t!==ur(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Fi(n).isEqual(Fi(e));case 3:return function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;const a=qn(i.timestampValue),l=qn(s.timestampValue);return a.seconds===l.seconds&&a.nanos===l.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(i,s){return cr(i.bytesValue).isEqual(cr(s.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(i,s){return Le(i.geoPointValue.latitude)===Le(s.geoPointValue.latitude)&&Le(i.geoPointValue.longitude)===Le(s.geoPointValue.longitude)}(n,e);case 2:return function(i,s){if("integerValue"in i&&"integerValue"in s)return Le(i.integerValue)===Le(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){const a=Le(i.doubleValue),l=Le(s.doubleValue);return a===l?no(a)===no(l):isNaN(a)&&isNaN(l)}return!1}(n,e);case 9:return Br(n.arrayValue.values||[],e.arrayValue.values||[],Wt);case 10:case 11:return function(i,s){const a=i.mapValue.fields||{},l=s.mapValue.fields||{};if(nh(a)!==nh(l))return!1;for(const c in a)if(a.hasOwnProperty(c)&&(l[c]===void 0||!Wt(a[c],l[c])))return!1;return!0}(n,e);default:return oe()}}function Bi(n,e){return(n.values||[]).find(t=>Wt(t,e))!==void 0}function jr(n,e){if(n===e)return 0;const t=ur(n),r=ur(e);if(t!==r)return Ie(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return Ie(n.booleanValue,e.booleanValue);case 2:return function(s,a){const l=Le(s.integerValue||s.doubleValue),c=Le(a.integerValue||a.doubleValue);return l<c?-1:l>c?1:l===c?0:isNaN(l)?isNaN(c)?0:-1:1}(n,e);case 3:return ih(n.timestampValue,e.timestampValue);case 4:return ih(Fi(n),Fi(e));case 5:return Ie(n.stringValue,e.stringValue);case 6:return function(s,a){const l=cr(s),c=cr(a);return l.compareTo(c)}(n.bytesValue,e.bytesValue);case 7:return function(s,a){const l=s.split("/"),c=a.split("/");for(let d=0;d<l.length&&d<c.length;d++){const f=Ie(l[d],c[d]);if(f!==0)return f}return Ie(l.length,c.length)}(n.referenceValue,e.referenceValue);case 8:return function(s,a){const l=Ie(Le(s.latitude),Le(a.latitude));return l!==0?l:Ie(Le(s.longitude),Le(a.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return sh(n.arrayValue,e.arrayValue);case 10:return function(s,a){var l,c,d,f;const m=s.fields||{},E=a.fields||{},R=(l=m.value)===null||l===void 0?void 0:l.arrayValue,k=(c=E.value)===null||c===void 0?void 0:c.arrayValue,O=Ie(((d=R==null?void 0:R.values)===null||d===void 0?void 0:d.length)||0,((f=k==null?void 0:k.values)===null||f===void 0?void 0:f.length)||0);return O!==0?O:sh(R,k)}(n.mapValue,e.mapValue);case 11:return function(s,a){if(s===ks.mapValue&&a===ks.mapValue)return 0;if(s===ks.mapValue)return 1;if(a===ks.mapValue)return-1;const l=s.fields||{},c=Object.keys(l),d=a.fields||{},f=Object.keys(d);c.sort(),f.sort();for(let m=0;m<c.length&&m<f.length;++m){const E=Ie(c[m],f[m]);if(E!==0)return E;const R=jr(l[c[m]],d[f[m]]);if(R!==0)return R}return Ie(c.length,f.length)}(n.mapValue,e.mapValue);default:throw oe()}}function ih(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return Ie(n,e);const t=qn(n),r=qn(e),i=Ie(t.seconds,r.seconds);return i!==0?i:Ie(t.nanos,r.nanos)}function sh(n,e){const t=n.values||[],r=e.values||[];for(let i=0;i<t.length&&i<r.length;++i){const s=jr(t[i],r[i]);if(s)return s}return Ie(t.length,r.length)}function $r(n){return el(n)}function el(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=qn(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return cr(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return ne.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",i=!0;for(const s of t.values||[])i?i=!1:r+=",",r+=el(s);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let i="{",s=!0;for(const a of r)s?s=!1:i+=",",i+=`${a}:${el(t.fields[a])}`;return i+"}"}(n.mapValue):oe()}function tl(n){return!!n&&"integerValue"in n}function ql(n){return!!n&&"arrayValue"in n}function oh(n){return!!n&&"nullValue"in n}function ah(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Us(n){return!!n&&"mapValue"in n}function hE(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="__vector__"}function Ri(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return pr(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=Ri(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=Ri(n.arrayValue.values[t]);return e}return Object.assign({},n)}function dE(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
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
 */class It{constructor(e){this.value=e}static empty(){return new It({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Us(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ri(t)}setAll(e){let t=tt.emptyPath(),r={},i=[];e.forEach((a,l)=>{if(!t.isImmediateParentOf(l)){const c=this.getFieldsMap(t);this.applyChanges(c,r,i),r={},i=[],t=l.popLast()}a?r[l.lastSegment()]=Ri(a):i.push(l.lastSegment())});const s=this.getFieldsMap(t);this.applyChanges(s,r,i)}delete(e){const t=this.field(e.popLast());Us(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Wt(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=t.mapValue.fields[e.get(r)];Us(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,r){pr(t,(i,s)=>e[i]=s);for(const i of r)delete e[i]}clone(){return new It(Ri(this.value))}}function Df(n){const e=[];return pr(n.fields,(t,r)=>{const i=new tt([t]);if(Us(r)){const s=Df(r.mapValue).fields;if(s.length===0)e.push(i);else for(const a of s)e.push(i.child(a))}else e.push(i)}),new Pt(e)}/**
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
 */class ht{constructor(e,t,r,i,s,a,l){this.key=e,this.documentType=t,this.version=r,this.readTime=i,this.createTime=s,this.data=a,this.documentState=l}static newInvalidDocument(e){return new ht(e,0,le.min(),le.min(),le.min(),It.empty(),0)}static newFoundDocument(e,t,r,i){return new ht(e,1,t,le.min(),r,i,0)}static newNoDocument(e,t){return new ht(e,2,t,le.min(),le.min(),It.empty(),0)}static newUnknownDocument(e,t){return new ht(e,3,t,le.min(),le.min(),It.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(le.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=It.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=It.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=le.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof ht&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new ht(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class ro{constructor(e,t){this.position=e,this.inclusive=t}}function lh(n,e,t){let r=0;for(let i=0;i<n.position.length;i++){const s=e[i],a=n.position[i];if(s.field.isKeyField()?r=ne.comparator(ne.fromName(a.referenceValue),t.key):r=jr(a,t.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function ch(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Wt(n.position[t],e.position[t]))return!1;return!0}/**
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
 */class io{constructor(e,t="asc"){this.field=e,this.dir=t}}function fE(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
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
 */class Vf{}class Ke extends Vf{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new mE(e,t,r):t==="array-contains"?new yE(e,r):t==="in"?new vE(e,r):t==="not-in"?new EE(e,r):t==="array-contains-any"?new TE(e,r):new Ke(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new gE(e,r):new _E(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(jr(t,this.value)):t!==null&&ur(this.value)===ur(t)&&this.matchesComparison(jr(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return oe()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Gt extends Vf{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new Gt(e,t)}matches(e){return Nf(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function Nf(n){return n.op==="and"}function Of(n){return pE(n)&&Nf(n)}function pE(n){for(const e of n.filters)if(e instanceof Gt)return!1;return!0}function nl(n){if(n instanceof Ke)return n.field.canonicalString()+n.op.toString()+$r(n.value);if(Of(n))return n.filters.map(e=>nl(e)).join(",");{const e=n.filters.map(t=>nl(t)).join(",");return`${n.op}(${e})`}}function xf(n,e){return n instanceof Ke?function(r,i){return i instanceof Ke&&r.op===i.op&&r.field.isEqual(i.field)&&Wt(r.value,i.value)}(n,e):n instanceof Gt?function(r,i){return i instanceof Gt&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,a,l)=>s&&xf(a,i.filters[l]),!0):!1}(n,e):void oe()}function Mf(n){return n instanceof Ke?function(t){return`${t.field.canonicalString()} ${t.op} ${$r(t.value)}`}(n):n instanceof Gt?function(t){return t.op.toString()+" {"+t.getFilters().map(Mf).join(" ,")+"}"}(n):"Filter"}class mE extends Ke{constructor(e,t,r){super(e,t,r),this.key=ne.fromName(r.referenceValue)}matches(e){const t=ne.comparator(e.key,this.key);return this.matchesComparison(t)}}class gE extends Ke{constructor(e,t){super(e,"in",t),this.keys=Lf("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class _E extends Ke{constructor(e,t){super(e,"not-in",t),this.keys=Lf("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Lf(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>ne.fromName(r.referenceValue))}class yE extends Ke{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return ql(t)&&Bi(t.arrayValue,this.value)}}class vE extends Ke{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Bi(this.value.arrayValue,t)}}class EE extends Ke{constructor(e,t){super(e,"not-in",t)}matches(e){if(Bi(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!Bi(this.value.arrayValue,t)}}class TE extends Ke{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!ql(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Bi(this.value.arrayValue,r))}}/**
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
 */class IE{constructor(e,t=null,r=[],i=[],s=null,a=null,l=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=a,this.endAt=l,this.ue=null}}function uh(n,e=null,t=[],r=[],i=null,s=null,a=null){return new IE(n,e,t,r,i,s,a)}function Hl(n){const e=ce(n);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>nl(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(s){return s.field.canonicalString()+s.dir}(r)).join(","),Co(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>$r(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>$r(r)).join(",")),e.ue=t}return e.ue}function Kl(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!fE(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!xf(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!ch(n.startAt,e.startAt)&&ch(n.endAt,e.endAt)}function rl(n){return ne.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
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
 */class ko{constructor(e,t=null,r=[],i=[],s=null,a="F",l=null,c=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=a,this.startAt=l,this.endAt=c,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function wE(n,e,t,r,i,s,a,l){return new ko(n,e,t,r,i,s,a,l)}function Ff(n){return new ko(n)}function hh(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function AE(n){return n.collectionGroup!==null}function Si(n){const e=ce(n);if(e.ce===null){e.ce=[];const t=new Set;for(const s of e.explicitOrderBy)e.ce.push(s),t.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let l=new nt(tt.comparator);return a.filters.forEach(c=>{c.getFlattenedFilters().forEach(d=>{d.isInequality()&&(l=l.add(d.field))})}),l})(e).forEach(s=>{t.has(s.canonicalString())||s.isKeyField()||e.ce.push(new io(s,r))}),t.has(tt.keyField().canonicalString())||e.ce.push(new io(tt.keyField(),r))}return e.ce}function $t(n){const e=ce(n);return e.le||(e.le=bE(e,Si(n))),e.le}function bE(n,e){if(n.limitType==="F")return uh(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new io(i.field,s)});const t=n.endAt?new ro(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new ro(n.startAt.position,n.startAt.inclusive):null;return uh(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function il(n,e,t){return new ko(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function Do(n,e){return Kl($t(n),$t(e))&&n.limitType===e.limitType}function Uf(n){return`${Hl($t(n))}|lt:${n.limitType}`}function Ar(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(i=>Mf(i)).join(", ")}]`),Co(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(i=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(i)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(i=>$r(i)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(i=>$r(i)).join(",")),`Target(${r})`}($t(n))}; limitType=${n.limitType})`}function Vo(n,e){return e.isFoundDocument()&&function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):ne.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)}(n,e)&&function(r,i){for(const s of Si(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0}(n,e)&&function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0}(n,e)&&function(r,i){return!(r.startAt&&!function(a,l,c){const d=lh(a,l,c);return a.inclusive?d<=0:d<0}(r.startAt,Si(r),i)||r.endAt&&!function(a,l,c){const d=lh(a,l,c);return a.inclusive?d>=0:d>0}(r.endAt,Si(r),i))}(n,e)}function RE(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Bf(n){return(e,t)=>{let r=!1;for(const i of Si(n)){const s=SE(i,e,t);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function SE(n,e,t){const r=n.field.isKeyField()?ne.comparator(e.key,t.key):function(s,a,l){const c=a.data.field(s),d=l.data.field(s);return c!==null&&d!==null?jr(c,d):oe()}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return oe()}}/**
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
 */class Qr{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[t]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){pr(this.inner,(t,r)=>{for(const[i,s]of r)e(i,s)})}isEmpty(){return Cf(this.inner)}size(){return this.innerSize}}/**
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
 */const PE=new Oe(ne.comparator);function fn(){return PE}const jf=new Oe(ne.comparator);function _i(...n){let e=jf;for(const t of n)e=e.insert(t.key,t);return e}function $f(n){let e=jf;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function ir(){return Pi()}function qf(){return Pi()}function Pi(){return new Qr(n=>n.toString(),(n,e)=>n.isEqual(e))}const CE=new Oe(ne.comparator),kE=new nt(ne.comparator);function me(...n){let e=kE;for(const t of n)e=e.add(t);return e}const DE=new nt(Ie);function VE(){return DE}/**
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
 */function zl(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:no(e)?"-0":e}}function Hf(n){return{integerValue:""+n}}function NE(n,e){return lE(e)?Hf(e):zl(n,e)}/**
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
 */class No{constructor(){this._=void 0}}function OE(n,e,t){return n instanceof so?function(i,s){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&jl(s)&&(s=$l(s)),s&&(a.fields.__previous_value__=s),{mapValue:a}}(t,e):n instanceof ji?zf(n,e):n instanceof $i?Wf(n,e):function(i,s){const a=Kf(i,s),l=dh(a)+dh(i.Pe);return tl(a)&&tl(i.Pe)?Hf(l):zl(i.serializer,l)}(n,e)}function xE(n,e,t){return n instanceof ji?zf(n,e):n instanceof $i?Wf(n,e):t}function Kf(n,e){return n instanceof oo?function(r){return tl(r)||function(s){return!!s&&"doubleValue"in s}(r)}(e)?e:{integerValue:0}:null}class so extends No{}class ji extends No{constructor(e){super(),this.elements=e}}function zf(n,e){const t=Gf(e);for(const r of n.elements)t.some(i=>Wt(i,r))||t.push(r);return{arrayValue:{values:t}}}class $i extends No{constructor(e){super(),this.elements=e}}function Wf(n,e){let t=Gf(e);for(const r of n.elements)t=t.filter(i=>!Wt(i,r));return{arrayValue:{values:t}}}class oo extends No{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function dh(n){return Le(n.integerValue||n.doubleValue)}function Gf(n){return ql(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}function ME(n,e){return n.field.isEqual(e.field)&&function(r,i){return r instanceof ji&&i instanceof ji||r instanceof $i&&i instanceof $i?Br(r.elements,i.elements,Wt):r instanceof oo&&i instanceof oo?Wt(r.Pe,i.Pe):r instanceof so&&i instanceof so}(n.transform,e.transform)}class LE{constructor(e,t){this.version=e,this.transformResults=t}}class Ct{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Ct}static exists(e){return new Ct(void 0,e)}static updateTime(e){return new Ct(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Bs(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Oo{}function Qf(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new xo(n.key,Ct.none()):new Ji(n.key,n.data,Ct.none());{const t=n.data,r=It.empty();let i=new nt(tt.comparator);for(let s of e.fields)if(!i.has(s)){let a=t.field(s);a===null&&s.length>1&&(s=s.popLast(),a=t.field(s)),a===null?r.delete(s):r.set(s,a),i=i.add(s)}return new Gn(n.key,r,new Pt(i.toArray()),Ct.none())}}function FE(n,e,t){n instanceof Ji?function(i,s,a){const l=i.value.clone(),c=ph(i.fieldTransforms,s,a.transformResults);l.setAll(c),s.convertToFoundDocument(a.version,l).setHasCommittedMutations()}(n,e,t):n instanceof Gn?function(i,s,a){if(!Bs(i.precondition,s))return void s.convertToUnknownDocument(a.version);const l=ph(i.fieldTransforms,s,a.transformResults),c=s.data;c.setAll(Jf(i)),c.setAll(l),s.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(n,e,t):function(i,s,a){s.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function Ci(n,e,t,r){return n instanceof Ji?function(s,a,l,c){if(!Bs(s.precondition,a))return l;const d=s.value.clone(),f=mh(s.fieldTransforms,c,a);return d.setAll(f),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(n,e,t,r):n instanceof Gn?function(s,a,l,c){if(!Bs(s.precondition,a))return l;const d=mh(s.fieldTransforms,c,a),f=a.data;return f.setAll(Jf(s)),f.setAll(d),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),l===null?null:l.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(m=>m.field))}(n,e,t,r):function(s,a,l){return Bs(s.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):l}(n,e,t)}function UE(n,e){let t=null;for(const r of n.fieldTransforms){const i=e.data.field(r.field),s=Kf(r.transform,i||null);s!=null&&(t===null&&(t=It.empty()),t.set(r.field,s))}return t||null}function fh(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&Br(r,i,(s,a)=>ME(s,a))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Ji extends Oo{constructor(e,t,r,i=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class Gn extends Oo{constructor(e,t,r,i,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function Jf(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function ph(n,e,t){const r=new Map;Re(n.length===t.length);for(let i=0;i<t.length;i++){const s=n[i],a=s.transform,l=e.data.field(s.field);r.set(s.field,xE(a,l,t[i]))}return r}function mh(n,e,t){const r=new Map;for(const i of n){const s=i.transform,a=t.data.field(i.field);r.set(i.field,OE(s,a,e))}return r}class xo extends Oo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class BE extends Oo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class jE{constructor(e,t,r,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&FE(s,e,r[i])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Ci(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Ci(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=qf();return this.mutations.forEach(i=>{const s=e.get(i.key),a=s.overlayedDocument;let l=this.applyToLocalView(a,s.mutatedFields);l=t.has(i.key)?null:l;const c=Qf(a,l);c!==null&&r.set(i.key,c),a.isValidDocument()||a.convertToNoDocument(le.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),me())}isEqual(e){return this.batchId===e.batchId&&Br(this.mutations,e.mutations,(t,r)=>fh(t,r))&&Br(this.baseMutations,e.baseMutations,(t,r)=>fh(t,r))}}class Wl{constructor(e,t,r,i){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=i}static from(e,t,r){Re(e.mutations.length===r.length);let i=function(){return CE}();const s=e.mutations;for(let a=0;a<s.length;a++)i=i.insert(s[a].key,r[a].version);return new Wl(e,t,r,i)}}/**
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
 */var Ue,ye;function HE(n){switch(n){default:return oe();case V.CANCELLED:case V.UNKNOWN:case V.DEADLINE_EXCEEDED:case V.RESOURCE_EXHAUSTED:case V.INTERNAL:case V.UNAVAILABLE:case V.UNAUTHENTICATED:return!1;case V.INVALID_ARGUMENT:case V.NOT_FOUND:case V.ALREADY_EXISTS:case V.PERMISSION_DENIED:case V.FAILED_PRECONDITION:case V.ABORTED:case V.OUT_OF_RANGE:case V.UNIMPLEMENTED:case V.DATA_LOSS:return!0}}function Yf(n){if(n===void 0)return dn("GRPC error has no .code"),V.UNKNOWN;switch(n){case Ue.OK:return V.OK;case Ue.CANCELLED:return V.CANCELLED;case Ue.UNKNOWN:return V.UNKNOWN;case Ue.DEADLINE_EXCEEDED:return V.DEADLINE_EXCEEDED;case Ue.RESOURCE_EXHAUSTED:return V.RESOURCE_EXHAUSTED;case Ue.INTERNAL:return V.INTERNAL;case Ue.UNAVAILABLE:return V.UNAVAILABLE;case Ue.UNAUTHENTICATED:return V.UNAUTHENTICATED;case Ue.INVALID_ARGUMENT:return V.INVALID_ARGUMENT;case Ue.NOT_FOUND:return V.NOT_FOUND;case Ue.ALREADY_EXISTS:return V.ALREADY_EXISTS;case Ue.PERMISSION_DENIED:return V.PERMISSION_DENIED;case Ue.FAILED_PRECONDITION:return V.FAILED_PRECONDITION;case Ue.ABORTED:return V.ABORTED;case Ue.OUT_OF_RANGE:return V.OUT_OF_RANGE;case Ue.UNIMPLEMENTED:return V.UNIMPLEMENTED;case Ue.DATA_LOSS:return V.DATA_LOSS;default:return oe()}}(ye=Ue||(Ue={}))[ye.OK=0]="OK",ye[ye.CANCELLED=1]="CANCELLED",ye[ye.UNKNOWN=2]="UNKNOWN",ye[ye.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",ye[ye.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",ye[ye.NOT_FOUND=5]="NOT_FOUND",ye[ye.ALREADY_EXISTS=6]="ALREADY_EXISTS",ye[ye.PERMISSION_DENIED=7]="PERMISSION_DENIED",ye[ye.UNAUTHENTICATED=16]="UNAUTHENTICATED",ye[ye.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",ye[ye.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",ye[ye.ABORTED=10]="ABORTED",ye[ye.OUT_OF_RANGE=11]="OUT_OF_RANGE",ye[ye.UNIMPLEMENTED=12]="UNIMPLEMENTED",ye[ye.INTERNAL=13]="INTERNAL",ye[ye.UNAVAILABLE=14]="UNAVAILABLE",ye[ye.DATA_LOSS=15]="DATA_LOSS";/**
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
 */function KE(){return new TextEncoder}/**
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
 */const zE=new or([4294967295,4294967295],0);function gh(n){const e=KE().encode(n),t=new Tf;return t.update(e),new Uint8Array(t.digest())}function _h(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new or([t,r],0),new or([i,s],0)]}class Gl{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new yi(`Invalid padding: ${t}`);if(r<0)throw new yi(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new yi(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new yi(`Invalid padding when bitmap length is 0: ${t}`);this.Ie=8*e.length-t,this.Te=or.fromNumber(this.Ie)}Ee(e,t,r){let i=e.add(t.multiply(or.fromNumber(r)));return i.compare(zE)===1&&(i=new or([i.getBits(0),i.getBits(1)],0)),i.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const t=gh(e),[r,i]=_h(t);for(let s=0;s<this.hashCount;s++){const a=this.Ee(r,i,s);if(!this.de(a))return!1}return!0}static create(e,t,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),a=new Gl(s,i,t);return r.forEach(l=>a.insert(l)),a}insert(e){if(this.Ie===0)return;const t=gh(e),[r,i]=_h(t);for(let s=0;s<this.hashCount;s++){const a=this.Ee(r,i,s);this.Ae(a)}}Ae(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class yi extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class Mo{constructor(e,t,r,i,s){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const i=new Map;return i.set(e,Yi.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new Mo(le.min(),i,new Oe(Ie),fn(),me())}}class Yi{constructor(e,t,r,i,s){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new Yi(r,t,me(),me(),me())}}/**
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
 */class js{constructor(e,t,r,i){this.Re=e,this.removedTargetIds=t,this.key=r,this.Ve=i}}class Xf{constructor(e,t){this.targetId=e,this.me=t}}class Zf{constructor(e,t,r=it.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=i}}class yh{constructor(){this.fe=0,this.ge=Eh(),this.pe=it.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=me(),t=me(),r=me();return this.ge.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:r=r.add(i);break;default:oe()}}),new Yi(this.pe,this.ye,e,t,r)}Ce(){this.we=!1,this.ge=Eh()}Fe(e,t){this.we=!0,this.ge=this.ge.insert(e,t)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,Re(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class WE{constructor(e){this.Le=e,this.Be=new Map,this.ke=fn(),this.qe=vh(),this.Qe=new Oe(Ie)}Ke(e){for(const t of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(t,e.Ve):this.Ue(t,e.key,e.Ve);for(const t of e.removedTargetIds)this.Ue(t,e.key,e.Ve)}We(e){this.forEachTarget(e,t=>{const r=this.Ge(t);switch(e.state){case 0:this.ze(t)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(t);break;case 3:this.ze(t)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(t)&&(this.je(t),r.De(e.resumeToken));break;default:oe()}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Be.forEach((r,i)=>{this.ze(i)&&t(i)})}He(e){const t=e.targetId,r=e.me.count,i=this.Je(t);if(i){const s=i.target;if(rl(s))if(r===0){const a=new ne(s.path);this.Ue(t,a,ht.newNoDocument(a,le.min()))}else Re(r===1);else{const a=this.Ye(t);if(a!==r){const l=this.Ze(e),c=l?this.Xe(l,e,a):1;if(c!==0){this.je(t);const d=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(t,d)}}}}}Ze(e){const t=e.me.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=t;let a,l;try{a=cr(r).toUint8Array()}catch(c){if(c instanceof kf)return Ur("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{l=new Gl(a,i,s)}catch(c){return Ur(c instanceof yi?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return l.Ie===0?null:l}Xe(e,t,r){return t.me.count===r-this.nt(e,t.targetId)?0:2}nt(e,t){const r=this.Le.getRemoteKeysForTarget(t);let i=0;return r.forEach(s=>{const a=this.Le.tt(),l=`projects/${a.projectId}/databases/${a.database}/documents/${s.path.canonicalString()}`;e.mightContain(l)||(this.Ue(t,s,null),i++)}),i}rt(e){const t=new Map;this.Be.forEach((s,a)=>{const l=this.Je(a);if(l){if(s.current&&rl(l.target)){const c=new ne(l.target.path);this.ke.get(c)!==null||this.it(a,c)||this.Ue(a,c,ht.newNoDocument(c,e))}s.be&&(t.set(a,s.ve()),s.Ce())}});let r=me();this.qe.forEach((s,a)=>{let l=!0;a.forEachWhile(c=>{const d=this.Je(c);return!d||d.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(s))}),this.ke.forEach((s,a)=>a.setReadTime(e));const i=new Mo(e,t,this.Qe,this.ke,r);return this.ke=fn(),this.qe=vh(),this.Qe=new Oe(Ie),i}$e(e,t){if(!this.ze(e))return;const r=this.it(e,t.key)?2:0;this.Ge(e).Fe(t.key,r),this.ke=this.ke.insert(t.key,t),this.qe=this.qe.insert(t.key,this.st(t.key).add(e))}Ue(e,t,r){if(!this.ze(e))return;const i=this.Ge(e);this.it(e,t)?i.Fe(t,1):i.Me(t),this.qe=this.qe.insert(t,this.st(t).delete(e)),r&&(this.ke=this.ke.insert(t,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const t=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let t=this.Be.get(e);return t||(t=new yh,this.Be.set(e,t)),t}st(e){let t=this.qe.get(e);return t||(t=new nt(Ie),this.qe=this.qe.insert(e,t)),t}ze(e){const t=this.Je(e)!==null;return t||J("WatchChangeAggregator","Detected inactive target",e),t}Je(e){const t=this.Be.get(e);return t&&t.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new yh),this.Le.getRemoteKeysForTarget(e).forEach(t=>{this.Ue(e,t,null)})}it(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}}function vh(){return new Oe(ne.comparator)}function Eh(){return new Oe(ne.comparator)}const GE=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),QE=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),JE=(()=>({and:"AND",or:"OR"}))();class YE{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function sl(n,e){return n.useProto3Json||Co(e)?e:{value:e}}function ao(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function ep(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function XE(n,e){return ao(n,e.toTimestamp())}function qt(n){return Re(!!n),le.fromTimestamp(function(t){const r=qn(t);return new ze(r.seconds,r.nanos)}(n))}function Ql(n,e){return ol(n,e).canonicalString()}function ol(n,e){const t=function(i){return new Ve(["projects",i.projectId,"databases",i.database])}(n).child("documents");return e===void 0?t:t.child(e)}function tp(n){const e=Ve.fromString(n);return Re(op(e)),e}function al(n,e){return Ql(n.databaseId,e.path)}function Ca(n,e){const t=tp(e);if(t.get(1)!==n.databaseId.projectId)throw new ee(V.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new ee(V.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new ne(rp(t))}function np(n,e){return Ql(n.databaseId,e)}function ZE(n){const e=tp(n);return e.length===4?Ve.emptyPath():rp(e)}function ll(n){return new Ve(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function rp(n){return Re(n.length>4&&n.get(4)==="documents"),n.popFirst(5)}function Th(n,e,t){return{name:al(n,e),fields:t.value.mapValue.fields}}function eT(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:oe()}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(d,f){return d.useProto3Json?(Re(f===void 0||typeof f=="string"),it.fromBase64String(f||"")):(Re(f===void 0||f instanceof Buffer||f instanceof Uint8Array),it.fromUint8Array(f||new Uint8Array))}(n,e.targetChange.resumeToken),a=e.targetChange.cause,l=a&&function(d){const f=d.code===void 0?V.UNKNOWN:Yf(d.code);return new ee(f,d.message||"")}(a);t=new Zf(r,i,s,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=Ca(n,r.document.name),s=qt(r.document.updateTime),a=r.document.createTime?qt(r.document.createTime):le.min(),l=new It({mapValue:{fields:r.document.fields}}),c=ht.newFoundDocument(i,s,a,l),d=r.targetIds||[],f=r.removedTargetIds||[];t=new js(d,f,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=Ca(n,r.document),s=r.readTime?qt(r.readTime):le.min(),a=ht.newNoDocument(i,s),l=r.removedTargetIds||[];t=new js([],l,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=Ca(n,r.document),s=r.removedTargetIds||[];t=new js([],s,i,null)}else{if(!("filter"in e))return oe();{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,a=new qE(i,s),l=r.targetId;t=new Xf(l,a)}}return t}function tT(n,e){let t;if(e instanceof Ji)t={update:Th(n,e.key,e.value)};else if(e instanceof xo)t={delete:al(n,e.key)};else if(e instanceof Gn)t={update:Th(n,e.key,e.data),updateMask:uT(e.fieldMask)};else{if(!(e instanceof BE))return oe();t={verify:al(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(s,a){const l=a.transform;if(l instanceof so)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof ji)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof $i)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof oo)return{fieldPath:a.field.canonicalString(),increment:l.Pe};throw oe()}(0,r))),e.precondition.isNone||(t.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:XE(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:oe()}(n,e.precondition)),t}function nT(n,e){return n&&n.length>0?(Re(e!==void 0),n.map(t=>function(i,s){let a=i.updateTime?qt(i.updateTime):qt(s);return a.isEqual(le.min())&&(a=qt(s)),new LE(a,i.transformResults||[])}(t,e))):[]}function rT(n,e){return{documents:[np(n,e.path)]}}function iT(n,e){const t={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=np(n,i);const s=function(d){if(d.length!==0)return sp(Gt.create(d,"and"))}(e.filters);s&&(t.structuredQuery.where=s);const a=function(d){if(d.length!==0)return d.map(f=>function(E){return{field:br(E.field),direction:aT(E.dir)}}(f))}(e.orderBy);a&&(t.structuredQuery.orderBy=a);const l=sl(n,e.limit);return l!==null&&(t.structuredQuery.limit=l),e.startAt&&(t.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(e.endAt)),{_t:t,parent:i}}function sT(n){let e=ZE(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let i=null;if(r>0){Re(r===1);const f=t.from[0];f.allDescendants?i=f.collectionId:e=e.child(f.collectionId)}let s=[];t.where&&(s=function(m){const E=ip(m);return E instanceof Gt&&Of(E)?E.getFilters():[E]}(t.where));let a=[];t.orderBy&&(a=function(m){return m.map(E=>function(k){return new io(Rr(k.field),function(F){switch(F){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(k.direction))}(E))}(t.orderBy));let l=null;t.limit&&(l=function(m){let E;return E=typeof m=="object"?m.value:m,Co(E)?null:E}(t.limit));let c=null;t.startAt&&(c=function(m){const E=!!m.before,R=m.values||[];return new ro(R,E)}(t.startAt));let d=null;return t.endAt&&(d=function(m){const E=!m.before,R=m.values||[];return new ro(R,E)}(t.endAt)),wE(e,i,a,s,l,"F",c,d)}function oT(n,e){const t=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return oe()}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function ip(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Rr(t.unaryFilter.field);return Ke.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=Rr(t.unaryFilter.field);return Ke.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=Rr(t.unaryFilter.field);return Ke.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Rr(t.unaryFilter.field);return Ke.create(a,"!=",{nullValue:"NULL_VALUE"});default:return oe()}}(n):n.fieldFilter!==void 0?function(t){return Ke.create(Rr(t.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return oe()}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return Gt.create(t.compositeFilter.filters.map(r=>ip(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return oe()}}(t.compositeFilter.op))}(n):oe()}function aT(n){return GE[n]}function lT(n){return QE[n]}function cT(n){return JE[n]}function br(n){return{fieldPath:n.canonicalString()}}function Rr(n){return tt.fromServerFormat(n.fieldPath)}function sp(n){return n instanceof Ke?function(t){if(t.op==="=="){if(ah(t.value))return{unaryFilter:{field:br(t.field),op:"IS_NAN"}};if(oh(t.value))return{unaryFilter:{field:br(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(ah(t.value))return{unaryFilter:{field:br(t.field),op:"IS_NOT_NAN"}};if(oh(t.value))return{unaryFilter:{field:br(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:br(t.field),op:lT(t.op),value:t.value}}}(n):n instanceof Gt?function(t){const r=t.getFilters().map(i=>sp(i));return r.length===1?r[0]:{compositeFilter:{op:cT(t.op),filters:r}}}(n):oe()}function uT(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function op(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
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
 */class Dn{constructor(e,t,r,i,s=le.min(),a=le.min(),l=it.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=l,this.expectedCount=c}withSequenceNumber(e){return new Dn(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Dn(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Dn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Dn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class hT{constructor(e){this.ct=e}}function dT(n){const e=sT({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?il(e,e.limit,"L"):e}/**
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
 */class fT{constructor(){this.un=new pT}addToCollectionParentIndex(e,t){return this.un.add(t),N.resolve()}getCollectionParents(e,t){return N.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return N.resolve()}deleteFieldIndex(e,t){return N.resolve()}deleteAllFieldIndexes(e){return N.resolve()}createTargetIndexes(e,t){return N.resolve()}getDocumentsMatchingTarget(e,t){return N.resolve(null)}getIndexType(e,t){return N.resolve(0)}getFieldIndexes(e,t){return N.resolve([])}getNextCollectionGroupToUpdate(e){return N.resolve(null)}getMinOffset(e,t){return N.resolve($n.min())}getMinOffsetFromCollectionGroup(e,t){return N.resolve($n.min())}updateCollectionGroup(e,t,r){return N.resolve()}updateIndexEntries(e,t){return N.resolve()}}class pT{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t]||new nt(Ve.comparator),s=!i.has(r);return this.index[t]=i.add(r),s}has(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t];return i&&i.has(r)}getEntries(e){return(this.index[e]||new nt(Ve.comparator)).toArray()}}/**
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
 */class qr{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new qr(0)}static kn(){return new qr(-1)}}/**
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
 */class mT{constructor(){this.changes=new Qr(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,ht.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?N.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class _T{constructor(e,t,r,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,t))).next(i=>(r!==null&&Ci(r.mutation,i,Pt.empty(),ze.now()),i))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,me()).next(()=>r))}getLocalViewOfDocuments(e,t,r=me()){const i=ir();return this.populateOverlays(e,i,t).next(()=>this.computeViews(e,t,i,r).next(s=>{let a=_i();return s.forEach((l,c)=>{a=a.insert(l,c.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const r=ir();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,me()))}populateOverlays(e,t,r){const i=[];return r.forEach(s=>{t.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((a,l)=>{t.set(a,l)})})}computeViews(e,t,r,i){let s=fn();const a=Pi(),l=function(){return Pi()}();return t.forEach((c,d)=>{const f=r.get(d.key);i.has(d.key)&&(f===void 0||f.mutation instanceof Gn)?s=s.insert(d.key,d):f!==void 0?(a.set(d.key,f.mutation.getFieldMask()),Ci(f.mutation,d,f.mutation.getFieldMask(),ze.now())):a.set(d.key,Pt.empty())}),this.recalculateAndSaveOverlays(e,s).next(c=>(c.forEach((d,f)=>a.set(d,f)),t.forEach((d,f)=>{var m;return l.set(d,new gT(f,(m=a.get(d))!==null&&m!==void 0?m:null))}),l))}recalculateAndSaveOverlays(e,t){const r=Pi();let i=new Oe((a,l)=>a-l),s=me();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const l of a)l.keys().forEach(c=>{const d=t.get(c);if(d===null)return;let f=r.get(c)||Pt.empty();f=l.applyToLocalView(d,f),r.set(c,f);const m=(i.get(l.batchId)||me()).add(c);i=i.insert(l.batchId,m)})}).next(()=>{const a=[],l=i.getReverseIterator();for(;l.hasNext();){const c=l.getNext(),d=c.key,f=c.value,m=qf();f.forEach(E=>{if(!s.has(E)){const R=Qf(t.get(E),r.get(E));R!==null&&m.set(E,R),s=s.add(E)}}),a.push(this.documentOverlayCache.saveOverlays(e,d,m))}return N.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,i){return function(a){return ne.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):AE(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,i):this.getDocumentsMatchingCollectionQuery(e,t,r,i)}getNextDocuments(e,t,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,i).next(s=>{const a=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,i-s.size):N.resolve(ir());let l=-1,c=s;return a.next(d=>N.forEach(d,(f,m)=>(l<m.largestBatchId&&(l=m.largestBatchId),s.get(f)?N.resolve():this.remoteDocumentCache.getEntry(e,f).next(E=>{c=c.insert(f,E)}))).next(()=>this.populateOverlays(e,d,s)).next(()=>this.computeViews(e,c,d,me())).next(f=>({batchId:l,changes:$f(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new ne(t)).next(r=>{let i=_i();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,t,r,i){const s=t.collectionGroup;let a=_i();return this.indexManager.getCollectionParents(e,s).next(l=>N.forEach(l,c=>{const d=function(m,E){return new ko(E,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(t,c.child(s));return this.getDocumentsMatchingCollectionQuery(e,d,r,i).next(f=>{f.forEach((m,E)=>{a=a.insert(m,E)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(a=>(s=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,i))).next(a=>{s.forEach((c,d)=>{const f=d.getKey();a.get(f)===null&&(a=a.insert(f,ht.newInvalidDocument(f)))});let l=_i();return a.forEach((c,d)=>{const f=s.get(c);f!==void 0&&Ci(f.mutation,d,Pt.empty(),ze.now()),Vo(t,d)&&(l=l.insert(c,d))}),l})}}/**
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
 */class yT{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return N.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,function(i){return{id:i.id,version:i.version,createTime:qt(i.createTime)}}(t)),N.resolve()}getNamedQuery(e,t){return N.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,function(i){return{name:i.name,query:dT(i.bundledQuery),readTime:qt(i.readTime)}}(t)),N.resolve()}}/**
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
 */class vT{constructor(){this.overlays=new Oe(ne.comparator),this.Ir=new Map}getOverlay(e,t){return N.resolve(this.overlays.get(t))}getOverlays(e,t){const r=ir();return N.forEach(t,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((i,s)=>{this.ht(e,t,s)}),N.resolve()}removeOverlaysForBatchId(e,t,r){const i=this.Ir.get(r);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.Ir.delete(r)),N.resolve()}getOverlaysForCollection(e,t,r){const i=ir(),s=t.length+1,a=new ne(t.child("")),l=this.overlays.getIteratorFrom(a);for(;l.hasNext();){const c=l.getNext().value,d=c.getKey();if(!t.isPrefixOf(d.path))break;d.path.length===s&&c.largestBatchId>r&&i.set(c.getKey(),c)}return N.resolve(i)}getOverlaysForCollectionGroup(e,t,r,i){let s=new Oe((d,f)=>d-f);const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===t&&d.largestBatchId>r){let f=s.get(d.largestBatchId);f===null&&(f=ir(),s=s.insert(d.largestBatchId,f)),f.set(d.getKey(),d)}}const l=ir(),c=s.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((d,f)=>l.set(d,f)),!(l.size()>=i)););return N.resolve(l)}ht(e,t,r){const i=this.overlays.get(r.key);if(i!==null){const a=this.Ir.get(i.largestBatchId).delete(r.key);this.Ir.set(i.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new $E(t,r));let s=this.Ir.get(t);s===void 0&&(s=me(),this.Ir.set(t,s)),this.Ir.set(t,s.add(r.key))}}/**
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
 */class ET{constructor(){this.sessionToken=it.EMPTY_BYTE_STRING}getSessionToken(e){return N.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,N.resolve()}}/**
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
 */class Jl{constructor(){this.Tr=new nt(Ge.Er),this.dr=new nt(Ge.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const r=new Ge(e,t);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Vr(new Ge(e,t))}mr(e,t){e.forEach(r=>this.removeReference(r,t))}gr(e){const t=new ne(new Ve([])),r=new Ge(t,e),i=new Ge(t,e+1),s=[];return this.dr.forEachInRange([r,i],a=>{this.Vr(a),s.push(a.key)}),s}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new ne(new Ve([])),r=new Ge(t,e),i=new Ge(t,e+1);let s=me();return this.dr.forEachInRange([r,i],a=>{s=s.add(a.key)}),s}containsKey(e){const t=new Ge(e,0),r=this.Tr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class Ge{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return ne.comparator(e.key,t.key)||Ie(e.wr,t.wr)}static Ar(e,t){return Ie(e.wr,t.wr)||ne.comparator(e.key,t.key)}}/**
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
 */class TT{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new nt(Ge.Er)}checkEmpty(e){return N.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,i){const s=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new jE(s,t,r,i);this.mutationQueue.push(a);for(const l of i)this.br=this.br.add(new Ge(l.key,s)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return N.resolve(a)}lookupMutationBatch(e,t){return N.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=this.vr(r),s=i<0?0:i;return N.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return N.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return N.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new Ge(t,0),i=new Ge(t,Number.POSITIVE_INFINITY),s=[];return this.br.forEachInRange([r,i],a=>{const l=this.Dr(a.wr);s.push(l)}),N.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new nt(Ie);return t.forEach(i=>{const s=new Ge(i,0),a=new Ge(i,Number.POSITIVE_INFINITY);this.br.forEachInRange([s,a],l=>{r=r.add(l.wr)})}),N.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1;let s=r;ne.isDocumentKey(s)||(s=s.child(""));const a=new Ge(new ne(s),0);let l=new nt(Ie);return this.br.forEachWhile(c=>{const d=c.key.path;return!!r.isPrefixOf(d)&&(d.length===i&&(l=l.add(c.wr)),!0)},a),N.resolve(this.Cr(l))}Cr(e){const t=[];return e.forEach(r=>{const i=this.Dr(r);i!==null&&t.push(i)}),t}removeMutationBatch(e,t){Re(this.Fr(t.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return N.forEach(t.mutations,i=>{const s=new Ge(i.key,t.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,t){const r=new Ge(t,0),i=this.br.firstAfterOrEqual(r);return N.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,N.resolve()}Fr(e,t){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
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
 */class IT{constructor(e){this.Mr=e,this.docs=function(){return new Oe(ne.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,i=this.docs.get(r),s=i?i.size:0,a=this.Mr(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return N.resolve(r?r.document.mutableCopy():ht.newInvalidDocument(t))}getEntries(e,t){let r=fn();return t.forEach(i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():ht.newInvalidDocument(i))}),N.resolve(r)}getDocumentsMatchingQuery(e,t,r,i){let s=fn();const a=t.path,l=new ne(a.child("")),c=this.docs.getIteratorFrom(l);for(;c.hasNext();){const{key:d,value:{document:f}}=c.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||iE(rE(f),r)<=0||(i.has(f.key)||Vo(t,f))&&(s=s.insert(f.key,f.mutableCopy()))}return N.resolve(s)}getAllFromCollectionGroup(e,t,r,i){oe()}Or(e,t){return N.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new wT(this)}getSize(e){return N.resolve(this.size)}}class wT extends mT{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?t.push(this.cr.addEntry(e,i)):this.cr.removeEntry(r)}),N.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}/**
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
 */class AT{constructor(e){this.persistence=e,this.Nr=new Qr(t=>Hl(t),Kl),this.lastRemoteSnapshotVersion=le.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Jl,this.targetCount=0,this.kr=qr.Bn()}forEachTarget(e,t){return this.Nr.forEach((r,i)=>t(i)),N.resolve()}getLastRemoteSnapshotVersion(e){return N.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return N.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),N.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Lr&&(this.Lr=t),N.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new qr(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,N.resolve()}updateTargetData(e,t){return this.Kn(t),N.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,N.resolve()}removeTargets(e,t,r){let i=0;const s=[];return this.Nr.forEach((a,l)=>{l.sequenceNumber<=t&&r.get(l.targetId)===null&&(this.Nr.delete(a),s.push(this.removeMatchingKeysForTargetId(e,l.targetId)),i++)}),N.waitFor(s).next(()=>i)}getTargetCount(e){return N.resolve(this.targetCount)}getTargetData(e,t){const r=this.Nr.get(t)||null;return N.resolve(r)}addMatchingKeys(e,t,r){return this.Br.Rr(t,r),N.resolve()}removeMatchingKeys(e,t,r){this.Br.mr(t,r);const i=this.persistence.referenceDelegate,s=[];return i&&t.forEach(a=>{s.push(i.markPotentiallyOrphaned(e,a))}),N.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),N.resolve()}getMatchingKeysForTargetId(e,t){const r=this.Br.yr(t);return N.resolve(r)}containsKey(e,t){return N.resolve(this.Br.containsKey(t))}}/**
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
 */class bT{constructor(e,t){this.qr={},this.overlays={},this.Qr=new Bl(0),this.Kr=!1,this.Kr=!0,this.$r=new ET,this.referenceDelegate=e(this),this.Ur=new AT(this),this.indexManager=new fT,this.remoteDocumentCache=function(i){return new IT(i)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new hT(t),this.Gr=new yT(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new vT,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.qr[e.toKey()];return r||(r=new TT(t,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,r){J("MemoryPersistence","Starting transaction:",e);const i=new RT(this.Qr.next());return this.referenceDelegate.zr(),r(i).next(s=>this.referenceDelegate.jr(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}Hr(e,t){return N.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,t)))}}class RT extends oE{constructor(e){super(),this.currentSequenceNumber=e}}class Yl{constructor(e){this.persistence=e,this.Jr=new Jl,this.Yr=null}static Zr(e){return new Yl(e)}get Xr(){if(this.Yr)return this.Yr;throw oe()}addReference(e,t,r){return this.Jr.addReference(r,t),this.Xr.delete(r.toString()),N.resolve()}removeReference(e,t,r){return this.Jr.removeReference(r,t),this.Xr.add(r.toString()),N.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),N.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach(i=>this.Xr.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(i=>{i.forEach(s=>this.Xr.add(s.toString()))}).next(()=>r.removeTargetData(e,t))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return N.forEach(this.Xr,r=>{const i=ne.fromPath(r);return this.ei(e,i).next(s=>{s||t.removeEntry(i,le.min())})}).next(()=>(this.Yr=null,t.apply(e)))}updateLimboDocument(e,t){return this.ei(e,t).next(r=>{r?this.Xr.delete(t.toString()):this.Xr.add(t.toString())})}Wr(e){return 0}ei(e,t){return N.or([()=>N.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}/**
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
 */class Xl{constructor(e,t,r,i){this.targetId=e,this.fromCache=t,this.$i=r,this.Ui=i}static Wi(e,t){let r=me(),i=me();for(const s of t.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new Xl(e,t.fromCache,r,i)}}/**
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
 */class PT{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return Py()?8:aE(ft())>0?6:4}()}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,r,i){const s={result:null};return this.Yi(e,t).next(a=>{s.result=a}).next(()=>{if(!s.result)return this.Zi(e,t,i,r).next(a=>{s.result=a})}).next(()=>{if(s.result)return;const a=new ST;return this.Xi(e,t,a).next(l=>{if(s.result=l,this.zi)return this.es(e,t,a,l.size)})}).next(()=>s.result)}es(e,t,r,i){return r.documentReadCount<this.ji?(pi()<=ge.DEBUG&&J("QueryEngine","SDK will not create cache indexes for query:",Ar(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),N.resolve()):(pi()<=ge.DEBUG&&J("QueryEngine","Query:",Ar(t),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.Hi*i?(pi()<=ge.DEBUG&&J("QueryEngine","The SDK decides to create cache indexes for query:",Ar(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,$t(t))):N.resolve())}Yi(e,t){if(hh(t))return N.resolve(null);let r=$t(t);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(t.limit!==null&&i===1&&(t=il(t,null,"F"),r=$t(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(s=>{const a=me(...s);return this.Ji.getDocuments(e,a).next(l=>this.indexManager.getMinOffset(e,r).next(c=>{const d=this.ts(t,l);return this.ns(t,d,a,c.readTime)?this.Yi(e,il(t,null,"F")):this.rs(e,d,t,c)}))})))}Zi(e,t,r,i){return hh(t)||i.isEqual(le.min())?N.resolve(null):this.Ji.getDocuments(e,r).next(s=>{const a=this.ts(t,s);return this.ns(t,a,r,i)?N.resolve(null):(pi()<=ge.DEBUG&&J("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),Ar(t)),this.rs(e,a,t,nE(i,-1)).next(l=>l))})}ts(e,t){let r=new nt(Bf(e));return t.forEach((i,s)=>{Vo(e,s)&&(r=r.add(s))}),r}ns(e,t,r,i){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const s=e.limitType==="F"?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}Xi(e,t,r){return pi()<=ge.DEBUG&&J("QueryEngine","Using full collection scan to execute query:",Ar(t)),this.Ji.getDocumentsMatchingQuery(e,t,$n.min(),r)}rs(e,t,r,i){return this.Ji.getDocumentsMatchingQuery(e,r,i).next(s=>(t.forEach(a=>{s=s.insert(a.key,a)}),s))}}/**
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
 */class CT{constructor(e,t,r,i){this.persistence=e,this.ss=t,this.serializer=i,this.os=new Oe(Ie),this._s=new Qr(s=>Hl(s),Kl),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new _T(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.os))}}function kT(n,e,t,r){return new CT(n,e,t,r)}async function ap(n,e){const t=ce(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let i;return t.mutationQueue.getAllMutationBatches(r).next(s=>(i=s,t.ls(e),t.mutationQueue.getAllMutationBatches(r))).next(s=>{const a=[],l=[];let c=me();for(const d of i){a.push(d.batchId);for(const f of d.mutations)c=c.add(f.key)}for(const d of s){l.push(d.batchId);for(const f of d.mutations)c=c.add(f.key)}return t.localDocuments.getDocuments(r,c).next(d=>({hs:d,removedBatchIds:a,addedBatchIds:l}))})})}function DT(n,e){const t=ce(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=e.batch.keys(),s=t.cs.newChangeBuffer({trackRemovals:!0});return function(l,c,d,f){const m=d.batch,E=m.keys();let R=N.resolve();return E.forEach(k=>{R=R.next(()=>f.getEntry(c,k)).next(O=>{const F=d.docVersions.get(k);Re(F!==null),O.version.compareTo(F)<0&&(m.applyToRemoteDocument(O,d),O.isValidDocument()&&(O.setReadTime(d.commitVersion),f.addEntry(O)))})}),R.next(()=>l.mutationQueue.removeMutationBatch(c,m))}(t,r,e,s).next(()=>s.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let c=me();for(let d=0;d<l.mutationResults.length;++d)l.mutationResults[d].transformResults.length>0&&(c=c.add(l.batch.mutations[d].key));return c}(e))).next(()=>t.localDocuments.getDocuments(r,i))})}function lp(n){const e=ce(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ur.getLastRemoteSnapshotVersion(t))}function VT(n,e){const t=ce(n),r=e.snapshotVersion;let i=t.os;return t.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{const a=t.cs.newChangeBuffer({trackRemovals:!0});i=t.os;const l=[];e.targetChanges.forEach((f,m)=>{const E=i.get(m);if(!E)return;l.push(t.Ur.removeMatchingKeys(s,f.removedDocuments,m).next(()=>t.Ur.addMatchingKeys(s,f.addedDocuments,m)));let R=E.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(m)!==null?R=R.withResumeToken(it.EMPTY_BYTE_STRING,le.min()).withLastLimboFreeSnapshotVersion(le.min()):f.resumeToken.approximateByteSize()>0&&(R=R.withResumeToken(f.resumeToken,r)),i=i.insert(m,R),function(O,F,Y){return O.resumeToken.approximateByteSize()===0||F.snapshotVersion.toMicroseconds()-O.snapshotVersion.toMicroseconds()>=3e8?!0:Y.addedDocuments.size+Y.modifiedDocuments.size+Y.removedDocuments.size>0}(E,R,f)&&l.push(t.Ur.updateTargetData(s,R))});let c=fn(),d=me();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&l.push(t.persistence.referenceDelegate.updateLimboDocument(s,f))}),l.push(NT(s,a,e.documentUpdates).next(f=>{c=f.Ps,d=f.Is})),!r.isEqual(le.min())){const f=t.Ur.getLastRemoteSnapshotVersion(s).next(m=>t.Ur.setTargetsMetadata(s,s.currentSequenceNumber,r));l.push(f)}return N.waitFor(l).next(()=>a.apply(s)).next(()=>t.localDocuments.getLocalViewOfDocuments(s,c,d)).next(()=>c)}).then(s=>(t.os=i,s))}function NT(n,e,t){let r=me(),i=me();return t.forEach(s=>r=r.add(s)),e.getEntries(n,r).next(s=>{let a=fn();return t.forEach((l,c)=>{const d=s.get(l);c.isFoundDocument()!==d.isFoundDocument()&&(i=i.add(l)),c.isNoDocument()&&c.version.isEqual(le.min())?(e.removeEntry(l,c.readTime),a=a.insert(l,c)):!d.isValidDocument()||c.version.compareTo(d.version)>0||c.version.compareTo(d.version)===0&&d.hasPendingWrites?(e.addEntry(c),a=a.insert(l,c)):J("LocalStore","Ignoring outdated watch update for ",l,". Current version:",d.version," Watch version:",c.version)}),{Ps:a,Is:i}})}function OT(n,e){const t=ce(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function xT(n,e){const t=ce(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return t.Ur.getTargetData(r,e).next(s=>s?(i=s,N.resolve(i)):t.Ur.allocateTargetId(r).next(a=>(i=new Dn(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.Ur.addTargetData(r,i).next(()=>i))))}).then(r=>{const i=t.os.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(t.os=t.os.insert(r.targetId,r),t._s.set(e,r.targetId)),r})}async function cl(n,e,t){const r=ce(n),i=r.os.get(e),s=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",s,a=>r.persistence.referenceDelegate.removeTarget(a,i))}catch(a){if(!Qi(a))throw a;J("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}r.os=r.os.remove(e),r._s.delete(i.target)}function Ih(n,e,t){const r=ce(n);let i=le.min(),s=me();return r.persistence.runTransaction("Execute query","readwrite",a=>function(c,d,f){const m=ce(c),E=m._s.get(f);return E!==void 0?N.resolve(m.os.get(E)):m.Ur.getTargetData(d,f)}(r,a,$t(e)).next(l=>{if(l)return i=l.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(a,l.targetId).next(c=>{s=c})}).next(()=>r.ss.getDocumentsMatchingQuery(a,e,t?i:le.min(),t?s:me())).next(l=>(MT(r,RE(e),l),{documents:l,Ts:s})))}function MT(n,e,t){let r=n.us.get(e)||le.min();t.forEach((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)}),n.us.set(e,r)}class wh{constructor(){this.activeTargetIds=VE()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class LT{constructor(){this.so=new wh,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,r){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new wh,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class Ah{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){J("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){J("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let Ds=null;function ka(){return Ds===null?Ds=function(){return 268435456+Math.round(2147483648*Math.random())}():Ds++,"0x"+Ds.toString(16)}/**
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
 */const lt="WebChannelConnection";class jT extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const r=t.ssl?"https":"http",i=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+t.host,this.vo=`projects/${i}/databases/${s}`,this.Co=this.databaseId.database==="(default)"?`project_id=${i}`:`project_id=${i}&database_id=${s}`}get Fo(){return!1}Mo(t,r,i,s,a){const l=ka(),c=this.xo(t,r.toUriEncodedString());J("RestConnection",`Sending RPC '${t}' ${l}:`,c,i);const d={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(d,s,a),this.No(t,c,d,i).then(f=>(J("RestConnection",`Received RPC '${t}' ${l}: `,f),f),f=>{throw Ur("RestConnection",`RPC '${t}' ${l} failed with error: `,f,"url: ",c,"request:",i),f})}Lo(t,r,i,s,a,l){return this.Mo(t,r,i,s,a)}Oo(t,r,i){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Gr}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((s,a)=>t[a]=s),i&&i.headers.forEach((s,a)=>t[a]=s)}xo(t,r){const i=UT[t];return`${this.Do}/v1/${r}:${i}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,r,i){const s=ka();return new Promise((a,l)=>{const c=new If;c.setWithCredentials(!0),c.listenOnce(wf.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case Fs.NO_ERROR:const f=c.getResponseJson();J(lt,`XHR for RPC '${e}' ${s} received:`,JSON.stringify(f)),a(f);break;case Fs.TIMEOUT:J(lt,`RPC '${e}' ${s} timed out`),l(new ee(V.DEADLINE_EXCEEDED,"Request time out"));break;case Fs.HTTP_ERROR:const m=c.getStatus();if(J(lt,`RPC '${e}' ${s} failed with status:`,m,"response text:",c.getResponseText()),m>0){let E=c.getResponseJson();Array.isArray(E)&&(E=E[0]);const R=E==null?void 0:E.error;if(R&&R.status&&R.message){const k=function(F){const Y=F.toLowerCase().replace(/_/g,"-");return Object.values(V).indexOf(Y)>=0?Y:V.UNKNOWN}(R.status);l(new ee(k,R.message))}else l(new ee(V.UNKNOWN,"Server responded with status "+c.getStatus()))}else l(new ee(V.UNAVAILABLE,"Connection failed."));break;default:oe()}}finally{J(lt,`RPC '${e}' ${s} completed.`)}});const d=JSON.stringify(i);J(lt,`RPC '${e}' ${s} sending request:`,i),c.send(t,"POST",d,r,15)})}Bo(e,t,r){const i=ka(),s=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=Rf(),l=bf(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(c.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Oo(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const f=s.join("");J(lt,`Creating RPC '${e}' stream ${i}: ${f}`,c);const m=a.createWebChannel(f,c);let E=!1,R=!1;const k=new BT({Io:F=>{R?J(lt,`Not sending because RPC '${e}' stream ${i} is closed:`,F):(E||(J(lt,`Opening RPC '${e}' stream ${i} transport.`),m.open(),E=!0),J(lt,`RPC '${e}' stream ${i} sending:`,F),m.send(F))},To:()=>m.close()}),O=(F,Y,G)=>{F.listen(Y,Q=>{try{G(Q)}catch(H){setTimeout(()=>{throw H},0)}})};return O(m,gi.EventType.OPEN,()=>{R||(J(lt,`RPC '${e}' stream ${i} transport opened.`),k.yo())}),O(m,gi.EventType.CLOSE,()=>{R||(R=!0,J(lt,`RPC '${e}' stream ${i} transport closed`),k.So())}),O(m,gi.EventType.ERROR,F=>{R||(R=!0,Ur(lt,`RPC '${e}' stream ${i} transport errored:`,F),k.So(new ee(V.UNAVAILABLE,"The operation could not be completed")))}),O(m,gi.EventType.MESSAGE,F=>{var Y;if(!R){const G=F.data[0];Re(!!G);const Q=G,H=Q.error||((Y=Q[0])===null||Y===void 0?void 0:Y.error);if(H){J(lt,`RPC '${e}' stream ${i} received error:`,H);const fe=H.status;let ve=function(v){const T=Ue[v];if(T!==void 0)return Yf(T)}(fe),w=H.message;ve===void 0&&(ve=V.INTERNAL,w="Unknown error status: "+fe+" with message "+H.message),R=!0,k.So(new ee(ve,w)),m.close()}else J(lt,`RPC '${e}' stream ${i} received:`,G),k.bo(G)}}),O(l,Af.STAT_EVENT,F=>{F.stat===Za.PROXY?J(lt,`RPC '${e}' stream ${i} detected buffering proxy`):F.stat===Za.NOPROXY&&J(lt,`RPC '${e}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{k.wo()},0),k}}function Da(){return typeof document<"u"?document:null}/**
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
 */function Lo(n){return new YE(n,!0)}/**
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
 */class cp{constructor(e,t,r=1e3,i=1.5,s=6e4){this.ui=e,this.timerId=t,this.ko=r,this.qo=i,this.Qo=s,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),i=Math.max(0,t-r);i>0&&J("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,i,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
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
 */class up{constructor(e,t,r,i,s,a,l,c){this.ui=e,this.Ho=r,this.Jo=i,this.connection=s,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=l,this.listener=c,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new cp(e,t)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():t&&t.code===V.RESOURCE_EXHAUSTED?(dn(t.toString()),dn("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===V.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.Yo===t&&this.P_(r,i)},r=>{e(()=>{const i=new ee(V.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(i)})})}P_(e,t){const r=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(i=>{r(()=>this.I_(i))}),this.stream.onMessage(i=>{r(()=>++this.e_==1?this.E_(i):this.onNext(i))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return J("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget(()=>this.Yo===e?t():(J("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class $T extends up{constructor(e,t,r,i,s,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,i,a),this.serializer=s}T_(e,t){return this.connection.Bo("Listen",e,t)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const t=eT(this.serializer,e),r=function(s){if(!("targetChange"in s))return le.min();const a=s.targetChange;return a.targetIds&&a.targetIds.length?le.min():a.readTime?qt(a.readTime):le.min()}(e);return this.listener.d_(t,r)}A_(e){const t={};t.database=ll(this.serializer),t.addTarget=function(s,a){let l;const c=a.target;if(l=rl(c)?{documents:rT(s,c)}:{query:iT(s,c)._t},l.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){l.resumeToken=ep(s,a.resumeToken);const d=sl(s,a.expectedCount);d!==null&&(l.expectedCount=d)}else if(a.snapshotVersion.compareTo(le.min())>0){l.readTime=ao(s,a.snapshotVersion.toTimestamp());const d=sl(s,a.expectedCount);d!==null&&(l.expectedCount=d)}return l}(this.serializer,e);const r=oT(this.serializer,e);r&&(t.labels=r),this.a_(t)}R_(e){const t={};t.database=ll(this.serializer),t.removeTarget=e,this.a_(t)}}class qT extends up{constructor(e,t,r,i,s,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,i,a),this.serializer=s}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,t){return this.connection.Bo("Write",e,t)}E_(e){return Re(!!e.streamToken),this.lastStreamToken=e.streamToken,Re(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){Re(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const t=nT(e.writeResults,e.commitTime),r=qt(e.commitTime);return this.listener.g_(r,t)}p_(){const e={};e.database=ll(this.serializer),this.a_(e)}m_(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>tT(this.serializer,r))};this.a_(t)}}/**
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
 */class HT extends class{}{constructor(e,t,r,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=i,this.y_=!1}w_(){if(this.y_)throw new ee(V.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,r,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,a])=>this.connection.Mo(e,ol(t,r),i,s,a)).catch(s=>{throw s.name==="FirebaseError"?(s.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new ee(V.UNKNOWN,s.toString())})}Lo(e,t,r,i,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,l])=>this.connection.Lo(e,ol(t,r),i,a,l,s)).catch(a=>{throw a.name==="FirebaseError"?(a.code===V.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new ee(V.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class KT{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(dn(t),this.D_=!1):J("OnlineStateTracker",t)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
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
 */class zT{constructor(e,t,r,i,s){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=s,this.k_._o(a=>{r.enqueueAndForget(async()=>{mr(this)&&(J("RemoteStore","Restarting streams for network reachability change."),await async function(c){const d=ce(c);d.L_.add(4),await Xi(d),d.q_.set("Unknown"),d.L_.delete(4),await Fo(d)}(this))})}),this.q_=new KT(r,i)}}async function Fo(n){if(mr(n))for(const e of n.B_)await e(!0)}async function Xi(n){for(const e of n.B_)await e(!1)}function hp(n,e){const t=ce(n);t.N_.has(e.targetId)||(t.N_.set(e.targetId,e),nc(t)?tc(t):Jr(t).r_()&&ec(t,e))}function Zl(n,e){const t=ce(n),r=Jr(t);t.N_.delete(e),r.r_()&&dp(t,e),t.N_.size===0&&(r.r_()?r.o_():mr(t)&&t.q_.set("Unknown"))}function ec(n,e){if(n.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(le.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}Jr(n).A_(e)}function dp(n,e){n.Q_.xe(e),Jr(n).R_(e)}function tc(n){n.Q_=new WE({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>n.N_.get(e)||null,tt:()=>n.datastore.serializer.databaseId}),Jr(n).start(),n.q_.v_()}function nc(n){return mr(n)&&!Jr(n).n_()&&n.N_.size>0}function mr(n){return ce(n).L_.size===0}function fp(n){n.Q_=void 0}async function WT(n){n.q_.set("Online")}async function GT(n){n.N_.forEach((e,t)=>{ec(n,e)})}async function QT(n,e){fp(n),nc(n)?(n.q_.M_(e),tc(n)):n.q_.set("Unknown")}async function JT(n,e,t){if(n.q_.set("Online"),e instanceof Zf&&e.state===2&&e.cause)try{await async function(i,s){const a=s.cause;for(const l of s.targetIds)i.N_.has(l)&&(await i.remoteSyncer.rejectListen(l,a),i.N_.delete(l),i.Q_.removeTarget(l))}(n,e)}catch(r){J("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await lo(n,r)}else if(e instanceof js?n.Q_.Ke(e):e instanceof Xf?n.Q_.He(e):n.Q_.We(e),!t.isEqual(le.min()))try{const r=await lp(n.localStore);t.compareTo(r)>=0&&await function(s,a){const l=s.Q_.rt(a);return l.targetChanges.forEach((c,d)=>{if(c.resumeToken.approximateByteSize()>0){const f=s.N_.get(d);f&&s.N_.set(d,f.withResumeToken(c.resumeToken,a))}}),l.targetMismatches.forEach((c,d)=>{const f=s.N_.get(c);if(!f)return;s.N_.set(c,f.withResumeToken(it.EMPTY_BYTE_STRING,f.snapshotVersion)),dp(s,c);const m=new Dn(f.target,c,d,f.sequenceNumber);ec(s,m)}),s.remoteSyncer.applyRemoteEvent(l)}(n,t)}catch(r){J("RemoteStore","Failed to raise snapshot:",r),await lo(n,r)}}async function lo(n,e,t){if(!Qi(e))throw e;n.L_.add(1),await Xi(n),n.q_.set("Offline"),t||(t=()=>lp(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{J("RemoteStore","Retrying IndexedDB access"),await t(),n.L_.delete(1),await Fo(n)})}function pp(n,e){return e().catch(t=>lo(n,t,e))}async function Uo(n){const e=ce(n),t=Hn(e);let r=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;YT(e);)try{const i=await OT(e.localStore,r);if(i===null){e.O_.length===0&&t.o_();break}r=i.batchId,XT(e,i)}catch(i){await lo(e,i)}mp(e)&&gp(e)}function YT(n){return mr(n)&&n.O_.length<10}function XT(n,e){n.O_.push(e);const t=Hn(n);t.r_()&&t.V_&&t.m_(e.mutations)}function mp(n){return mr(n)&&!Hn(n).n_()&&n.O_.length>0}function gp(n){Hn(n).start()}async function ZT(n){Hn(n).p_()}async function eI(n){const e=Hn(n);for(const t of n.O_)e.m_(t.mutations)}async function tI(n,e,t){const r=n.O_.shift(),i=Wl.from(r,e,t);await pp(n,()=>n.remoteSyncer.applySuccessfulWrite(i)),await Uo(n)}async function nI(n,e){e&&Hn(n).V_&&await async function(r,i){if(function(a){return HE(a)&&a!==V.ABORTED}(i.code)){const s=r.O_.shift();Hn(r).s_(),await pp(r,()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i)),await Uo(r)}}(n,e),mp(n)&&gp(n)}async function bh(n,e){const t=ce(n);t.asyncQueue.verifyOperationInProgress(),J("RemoteStore","RemoteStore received new credentials");const r=mr(t);t.L_.add(3),await Xi(t),r&&t.q_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.L_.delete(3),await Fo(t)}async function rI(n,e){const t=ce(n);e?(t.L_.delete(2),await Fo(t)):e||(t.L_.add(2),await Xi(t),t.q_.set("Unknown"))}function Jr(n){return n.K_||(n.K_=function(t,r,i){const s=ce(t);return s.w_(),new $T(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(n.datastore,n.asyncQueue,{Eo:WT.bind(null,n),Ro:GT.bind(null,n),mo:QT.bind(null,n),d_:JT.bind(null,n)}),n.B_.push(async e=>{e?(n.K_.s_(),nc(n)?tc(n):n.q_.set("Unknown")):(await n.K_.stop(),fp(n))})),n.K_}function Hn(n){return n.U_||(n.U_=function(t,r,i){const s=ce(t);return s.w_(),new qT(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(n.datastore,n.asyncQueue,{Eo:()=>Promise.resolve(),Ro:ZT.bind(null,n),mo:nI.bind(null,n),f_:eI.bind(null,n),g_:tI.bind(null,n)}),n.B_.push(async e=>{e?(n.U_.s_(),await Uo(n)):(await n.U_.stop(),n.O_.length>0&&(J("RemoteStore",`Stopping write stream with ${n.O_.length} pending writes`),n.O_=[]))})),n.U_}/**
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
 */class rc{constructor(e,t,r,i,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new Mn,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,i,s){const a=Date.now()+r,l=new rc(e,t,a,i,s);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new ee(V.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function ic(n,e){if(dn("AsyncQueue",`${e}: ${n}`),Qi(n))return new ee(V.UNAVAILABLE,`${e}: ${n}`);throw n}/**
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
 */class Nr{constructor(e){this.comparator=e?(t,r)=>e(t,r)||ne.comparator(t.key,r.key):(t,r)=>ne.comparator(t.key,r.key),this.keyedMap=_i(),this.sortedSet=new Oe(this.comparator)}static emptySet(e){return new Nr(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Nr)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Nr;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
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
 */class Rh{constructor(){this.W_=new Oe(ne.comparator)}track(e){const t=e.doc.key,r=this.W_.get(t);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(t,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(t):e.type===1&&r.type===2?this.W_=this.W_.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):oe():this.W_=this.W_.insert(t,e)}G_(){const e=[];return this.W_.inorderTraversal((t,r)=>{e.push(r)}),e}}class Hr{constructor(e,t,r,i,s,a,l,c,d){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=a,this.syncStateChanged=l,this.excludesMetadataChanges=c,this.hasCachedResults=d}static fromInitialDocuments(e,t,r,i,s){const a=[];return t.forEach(l=>{a.push({type:0,doc:l})}),new Hr(e,t,Nr.emptySet(t),a,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Do(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==r[i].type||!t[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
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
 */class iI{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class sI{constructor(){this.queries=Sh(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(t,r){const i=ce(t),s=i.queries;i.queries=Sh(),s.forEach((a,l)=>{for(const c of l.j_)c.onError(r)})})(this,new ee(V.ABORTED,"Firestore shutting down"))}}function Sh(){return new Qr(n=>Uf(n),Do)}async function oI(n,e){const t=ce(n);let r=3;const i=e.query;let s=t.queries.get(i);s?!s.H_()&&e.J_()&&(r=2):(s=new iI,r=e.J_()?0:1);try{switch(r){case 0:s.z_=await t.onListen(i,!0);break;case 1:s.z_=await t.onListen(i,!1);break;case 2:await t.onFirstRemoteStoreListen(i)}}catch(a){const l=ic(a,`Initialization of query '${Ar(e.query)}' failed`);return void e.onError(l)}t.queries.set(i,s),s.j_.push(e),e.Z_(t.onlineState),s.z_&&e.X_(s.z_)&&sc(t)}async function aI(n,e){const t=ce(n),r=e.query;let i=3;const s=t.queries.get(r);if(s){const a=s.j_.indexOf(e);a>=0&&(s.j_.splice(a,1),s.j_.length===0?i=e.J_()?0:1:!s.H_()&&e.J_()&&(i=2))}switch(i){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function lI(n,e){const t=ce(n);let r=!1;for(const i of e){const s=i.query,a=t.queries.get(s);if(a){for(const l of a.j_)l.X_(i)&&(r=!0);a.z_=i}}r&&sc(t)}function cI(n,e,t){const r=ce(n),i=r.queries.get(e);if(i)for(const s of i.j_)s.onError(t);r.queries.delete(e)}function sc(n){n.Y_.forEach(e=>{e.next()})}var ul,Ph;(Ph=ul||(ul={})).ea="default",Ph.Cache="cache";class uI{constructor(e,t,r){this.query=e,this.ta=t,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new Hr(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.na?this.ia(e)&&(this.ta.next(e),t=!0):this.sa(e,this.onlineState)&&(this.oa(e),t=!0),this.ra=e,t}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let t=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),t=!0),t}sa(e,t){if(!e.fromCache||!this.J_())return!0;const r=t!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const t=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}oa(e){e=Hr.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==ul.Cache}}/**
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
 */class _p{constructor(e){this.key=e}}class yp{constructor(e){this.key=e}}class hI{constructor(e,t){this.query=e,this.Ta=t,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=me(),this.mutatedKeys=me(),this.Aa=Bf(e),this.Ra=new Nr(this.Aa)}get Va(){return this.Ta}ma(e,t){const r=t?t.fa:new Rh,i=t?t.Ra:this.Ra;let s=t?t.mutatedKeys:this.mutatedKeys,a=i,l=!1;const c=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,d=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((f,m)=>{const E=i.get(f),R=Vo(this.query,m)?m:null,k=!!E&&this.mutatedKeys.has(E.key),O=!!R&&(R.hasLocalMutations||this.mutatedKeys.has(R.key)&&R.hasCommittedMutations);let F=!1;E&&R?E.data.isEqual(R.data)?k!==O&&(r.track({type:3,doc:R}),F=!0):this.ga(E,R)||(r.track({type:2,doc:R}),F=!0,(c&&this.Aa(R,c)>0||d&&this.Aa(R,d)<0)&&(l=!0)):!E&&R?(r.track({type:0,doc:R}),F=!0):E&&!R&&(r.track({type:1,doc:E}),F=!0,(c||d)&&(l=!0)),F&&(R?(a=a.add(R),s=O?s.add(f):s.delete(f)):(a=a.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const f=this.query.limitType==="F"?a.last():a.first();a=a.delete(f.key),s=s.delete(f.key),r.track({type:1,doc:f})}return{Ra:a,fa:r,ns:l,mutatedKeys:s}}ga(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,i){const s=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const a=e.fa.G_();a.sort((f,m)=>function(R,k){const O=F=>{switch(F){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return oe()}};return O(R)-O(k)}(f.type,m.type)||this.Aa(f.doc,m.doc)),this.pa(r),i=i!=null&&i;const l=t&&!i?this.ya():[],c=this.da.size===0&&this.current&&!i?1:0,d=c!==this.Ea;return this.Ea=c,a.length!==0||d?{snapshot:new Hr(this.query,e.Ra,s,a,e.mutatedKeys,c===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:l}:{wa:l}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Rh,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(t=>this.Ta=this.Ta.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ta=this.Ta.delete(t)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=me(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const t=[];return e.forEach(r=>{this.da.has(r)||t.push(new yp(r))}),this.da.forEach(r=>{e.has(r)||t.push(new _p(r))}),t}ba(e){this.Ta=e.Ts,this.da=me();const t=this.ma(e.documents);return this.applyChanges(t,!0)}Da(){return Hr.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class dI{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class fI{constructor(e){this.key=e,this.va=!1}}class pI{constructor(e,t,r,i,s,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new Qr(l=>Uf(l),Do),this.Ma=new Map,this.xa=new Set,this.Oa=new Oe(ne.comparator),this.Na=new Map,this.La=new Jl,this.Ba={},this.ka=new Map,this.qa=qr.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function mI(n,e,t=!0){const r=Ap(n);let i;const s=r.Fa.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.Da()):i=await vp(r,e,t,!0),i}async function gI(n,e){const t=Ap(n);await vp(t,e,!0,!1)}async function vp(n,e,t,r){const i=await xT(n.localStore,$t(e)),s=i.targetId,a=n.sharedClientState.addLocalQueryTarget(s,t);let l;return r&&(l=await _I(n,e,s,a==="current",i.resumeToken)),n.isPrimaryClient&&t&&hp(n.remoteStore,i),l}async function _I(n,e,t,r,i){n.Ka=(m,E,R)=>async function(O,F,Y,G){let Q=F.view.ma(Y);Q.ns&&(Q=await Ih(O.localStore,F.query,!1).then(({documents:w})=>F.view.ma(w,Q)));const H=G&&G.targetChanges.get(F.targetId),fe=G&&G.targetMismatches.get(F.targetId)!=null,ve=F.view.applyChanges(Q,O.isPrimaryClient,H,fe);return kh(O,F.targetId,ve.wa),ve.snapshot}(n,m,E,R);const s=await Ih(n.localStore,e,!0),a=new hI(e,s.Ts),l=a.ma(s.documents),c=Yi.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",i),d=a.applyChanges(l,n.isPrimaryClient,c);kh(n,t,d.wa);const f=new dI(e,t,a);return n.Fa.set(e,f),n.Ma.has(t)?n.Ma.get(t).push(e):n.Ma.set(t,[e]),d.snapshot}async function yI(n,e,t){const r=ce(n),i=r.Fa.get(e),s=r.Ma.get(i.targetId);if(s.length>1)return r.Ma.set(i.targetId,s.filter(a=>!Do(a,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await cl(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),t&&Zl(r.remoteStore,i.targetId),hl(r,i.targetId)}).catch(Gi)):(hl(r,i.targetId),await cl(r.localStore,i.targetId,!0))}async function vI(n,e){const t=ce(n),r=t.Fa.get(e),i=t.Ma.get(r.targetId);t.isPrimaryClient&&i.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),Zl(t.remoteStore,r.targetId))}async function EI(n,e,t){const r=SI(n);try{const i=await function(a,l){const c=ce(a),d=ze.now(),f=l.reduce((R,k)=>R.add(k.key),me());let m,E;return c.persistence.runTransaction("Locally write mutations","readwrite",R=>{let k=fn(),O=me();return c.cs.getEntries(R,f).next(F=>{k=F,k.forEach((Y,G)=>{G.isValidDocument()||(O=O.add(Y))})}).next(()=>c.localDocuments.getOverlayedDocuments(R,k)).next(F=>{m=F;const Y=[];for(const G of l){const Q=UE(G,m.get(G.key).overlayedDocument);Q!=null&&Y.push(new Gn(G.key,Q,Df(Q.value.mapValue),Ct.exists(!0)))}return c.mutationQueue.addMutationBatch(R,d,Y,l)}).next(F=>{E=F;const Y=F.applyToLocalDocumentSet(m,O);return c.documentOverlayCache.saveOverlays(R,F.batchId,Y)})}).then(()=>({batchId:E.batchId,changes:$f(m)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(a,l,c){let d=a.Ba[a.currentUser.toKey()];d||(d=new Oe(Ie)),d=d.insert(l,c),a.Ba[a.currentUser.toKey()]=d}(r,i.batchId,t),await Zi(r,i.changes),await Uo(r.remoteStore)}catch(i){const s=ic(i,"Failed to persist write");t.reject(s)}}async function Ep(n,e){const t=ce(n);try{const r=await VT(t.localStore,e);e.targetChanges.forEach((i,s)=>{const a=t.Na.get(s);a&&(Re(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1),i.addedDocuments.size>0?a.va=!0:i.modifiedDocuments.size>0?Re(a.va):i.removedDocuments.size>0&&(Re(a.va),a.va=!1))}),await Zi(t,r,e)}catch(r){await Gi(r)}}function Ch(n,e,t){const r=ce(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const i=[];r.Fa.forEach((s,a)=>{const l=a.view.Z_(e);l.snapshot&&i.push(l.snapshot)}),function(a,l){const c=ce(a);c.onlineState=l;let d=!1;c.queries.forEach((f,m)=>{for(const E of m.j_)E.Z_(l)&&(d=!0)}),d&&sc(c)}(r.eventManager,e),i.length&&r.Ca.d_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function TI(n,e,t){const r=ce(n);r.sharedClientState.updateQueryState(e,"rejected",t);const i=r.Na.get(e),s=i&&i.key;if(s){let a=new Oe(ne.comparator);a=a.insert(s,ht.newNoDocument(s,le.min()));const l=me().add(s),c=new Mo(le.min(),new Map,new Oe(Ie),a,l);await Ep(r,c),r.Oa=r.Oa.remove(s),r.Na.delete(e),oc(r)}else await cl(r.localStore,e,!1).then(()=>hl(r,e,t)).catch(Gi)}async function II(n,e){const t=ce(n),r=e.batch.batchId;try{const i=await DT(t.localStore,e);Ip(t,r,null),Tp(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Zi(t,i)}catch(i){await Gi(i)}}async function wI(n,e,t){const r=ce(n);try{const i=await function(a,l){const c=ce(a);return c.persistence.runTransaction("Reject batch","readwrite-primary",d=>{let f;return c.mutationQueue.lookupMutationBatch(d,l).next(m=>(Re(m!==null),f=m.keys(),c.mutationQueue.removeMutationBatch(d,m))).next(()=>c.mutationQueue.performConsistencyCheck(d)).next(()=>c.documentOverlayCache.removeOverlaysForBatchId(d,f,l)).next(()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,f)).next(()=>c.localDocuments.getDocuments(d,f))})}(r.localStore,e);Ip(r,e,t),Tp(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Zi(r,i)}catch(i){await Gi(i)}}function Tp(n,e){(n.ka.get(e)||[]).forEach(t=>{t.resolve()}),n.ka.delete(e)}function Ip(n,e,t){const r=ce(n);let i=r.Ba[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(t?s.reject(t):s.resolve(),i=i.remove(e)),r.Ba[r.currentUser.toKey()]=i}}function hl(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Ma.get(e))n.Fa.delete(r),t&&n.Ca.$a(r,t);n.Ma.delete(e),n.isPrimaryClient&&n.La.gr(e).forEach(r=>{n.La.containsKey(r)||wp(n,r)})}function wp(n,e){n.xa.delete(e.path.canonicalString());const t=n.Oa.get(e);t!==null&&(Zl(n.remoteStore,t),n.Oa=n.Oa.remove(e),n.Na.delete(t),oc(n))}function kh(n,e,t){for(const r of t)r instanceof _p?(n.La.addReference(r.key,e),AI(n,r)):r instanceof yp?(J("SyncEngine","Document no longer in limbo: "+r.key),n.La.removeReference(r.key,e),n.La.containsKey(r.key)||wp(n,r.key)):oe()}function AI(n,e){const t=e.key,r=t.path.canonicalString();n.Oa.get(t)||n.xa.has(r)||(J("SyncEngine","New document in limbo: "+t),n.xa.add(r),oc(n))}function oc(n){for(;n.xa.size>0&&n.Oa.size<n.maxConcurrentLimboResolutions;){const e=n.xa.values().next().value;n.xa.delete(e);const t=new ne(Ve.fromString(e)),r=n.qa.next();n.Na.set(r,new fI(t)),n.Oa=n.Oa.insert(t,r),hp(n.remoteStore,new Dn($t(Ff(t.path)),r,"TargetPurposeLimboResolution",Bl.oe))}}async function Zi(n,e,t){const r=ce(n),i=[],s=[],a=[];r.Fa.isEmpty()||(r.Fa.forEach((l,c)=>{a.push(r.Ka(c,e,t).then(d=>{var f;if((d||t)&&r.isPrimaryClient){const m=d?!d.fromCache:(f=t==null?void 0:t.targetChanges.get(c.targetId))===null||f===void 0?void 0:f.current;r.sharedClientState.updateQueryState(c.targetId,m?"current":"not-current")}if(d){i.push(d);const m=Xl.Wi(c.targetId,d);s.push(m)}}))}),await Promise.all(a),r.Ca.d_(i),await async function(c,d){const f=ce(c);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>N.forEach(d,E=>N.forEach(E.$i,R=>f.persistence.referenceDelegate.addReference(m,E.targetId,R)).next(()=>N.forEach(E.Ui,R=>f.persistence.referenceDelegate.removeReference(m,E.targetId,R)))))}catch(m){if(!Qi(m))throw m;J("LocalStore","Failed to update sequence numbers: "+m)}for(const m of d){const E=m.targetId;if(!m.fromCache){const R=f.os.get(E),k=R.snapshotVersion,O=R.withLastLimboFreeSnapshotVersion(k);f.os=f.os.insert(E,O)}}}(r.localStore,s))}async function bI(n,e){const t=ce(n);if(!t.currentUser.isEqual(e)){J("SyncEngine","User change. New user:",e.toKey());const r=await ap(t.localStore,e);t.currentUser=e,function(s,a){s.ka.forEach(l=>{l.forEach(c=>{c.reject(new ee(V.CANCELLED,a))})}),s.ka.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Zi(t,r.hs)}}function RI(n,e){const t=ce(n),r=t.Na.get(e);if(r&&r.va)return me().add(r.key);{let i=me();const s=t.Ma.get(e);if(!s)return i;for(const a of s){const l=t.Fa.get(a);i=i.unionWith(l.view.Va)}return i}}function Ap(n){const e=ce(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Ep.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=RI.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=TI.bind(null,e),e.Ca.d_=lI.bind(null,e.eventManager),e.Ca.$a=cI.bind(null,e.eventManager),e}function SI(n){const e=ce(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=II.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=wI.bind(null,e),e}class co{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Lo(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return kT(this.persistence,new PT,e.initialUser,this.serializer)}Ga(e){return new bT(Yl.Zr,this.serializer)}Wa(e){return new LT}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}co.provider={build:()=>new co};class dl{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Ch(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=bI.bind(null,this.syncEngine),await rI(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new sI}()}createDatastore(e){const t=Lo(e.databaseInfo.databaseId),r=function(s){return new jT(s)}(e.databaseInfo);return function(s,a,l,c){return new HT(s,a,l,c)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,i,s,a,l){return new zT(r,i,s,a,l)}(this.localStore,this.datastore,e.asyncQueue,t=>Ch(this.syncEngine,t,0),function(){return Ah.D()?new Ah:new FT}())}createSyncEngine(e,t){return function(i,s,a,l,c,d,f){const m=new pI(i,s,a,l,c,d);return f&&(m.Qa=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(i){const s=ce(i);J("RemoteStore","RemoteStore shutting down."),s.L_.add(5),await Xi(s),s.k_.shutdown(),s.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}dl.provider={build:()=>new dl};/**
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
 */class PI{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):dn("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
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
 */class CI{constructor(e,t,r,i,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=i,this.user=ct.UNAUTHENTICATED,this.clientId=Pf.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async a=>{J("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(J("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Mn;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=ic(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Va(n,e){n.asyncQueue.verifyOperationInProgress(),J("FirestoreClient","Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async i=>{r.isEqual(i)||(await ap(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function Dh(n,e){n.asyncQueue.verifyOperationInProgress();const t=await kI(n);J("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>bh(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,i)=>bh(e.remoteStore,i)),n._onlineComponents=e}async function kI(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){J("FirestoreClient","Using user provided OfflineComponentProvider");try{await Va(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(i){return i.name==="FirebaseError"?i.code===V.FAILED_PRECONDITION||i.code===V.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(t))throw t;Ur("Error using user provided cache. Falling back to memory cache: "+t),await Va(n,new co)}}else J("FirestoreClient","Using default OfflineComponentProvider"),await Va(n,new co);return n._offlineComponents}async function bp(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(J("FirestoreClient","Using user provided OnlineComponentProvider"),await Dh(n,n._uninitializedComponentsProvider._online)):(J("FirestoreClient","Using default OnlineComponentProvider"),await Dh(n,new dl))),n._onlineComponents}function DI(n){return bp(n).then(e=>e.syncEngine)}async function VI(n){const e=await bp(n),t=e.eventManager;return t.onListen=mI.bind(null,e.syncEngine),t.onUnlisten=yI.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=gI.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=vI.bind(null,e.syncEngine),t}function NI(n,e,t={}){const r=new Mn;return n.asyncQueue.enqueueAndForget(async()=>function(s,a,l,c,d){const f=new PI({next:E=>{f.Za(),a.enqueueAndForget(()=>aI(s,m)),E.fromCache&&c.source==="server"?d.reject(new ee(V.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(E)},error:E=>d.reject(E)}),m=new uI(l,f,{includeMetadataChanges:!0,_a:!0});return oI(s,m)}(await VI(n),n.asyncQueue,e,t,r)),r.promise}/**
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
 */function Rp(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
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
 */const Vh=new Map;/**
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
 */function Sp(n,e,t){if(!t)throw new ee(V.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function OI(n,e,t,r){if(e===!0&&r===!0)throw new ee(V.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Nh(n){if(!ne.isDocumentKey(n))throw new ee(V.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function Oh(n){if(ne.isDocumentKey(n))throw new ee(V.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function ac(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":oe()}function hr(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new ee(V.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=ac(n);throw new ee(V.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
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
 */class xh{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new ee(V.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new ee(V.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}OI("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Rp((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new ee(V.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new ee(V.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new ee(V.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Bo{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new xh({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new ee(V.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new ee(V.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new xh(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Wv;switch(r.type){case"firstParty":return new Yv(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new ee(V.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=Vh.get(t);r&&(J("ComponentProvider","Removing Datastore"),Vh.delete(t),r.terminate())}(this),Promise.resolve()}}function xI(n,e,t,r={}){var i;const s=(n=hr(n,Bo))._getSettings(),a=`${e}:${t}`;if(s.host!=="firestore.googleapis.com"&&s.host!==a&&Ur("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),n._setSettings(Object.assign(Object.assign({},s),{host:a,ssl:!1})),r.mockUserToken){let l,c;if(typeof r.mockUserToken=="string")l=r.mockUserToken,c=ct.MOCK_USER;else{l=Ty(r.mockUserToken,(i=n._app)===null||i===void 0?void 0:i.options.projectId);const d=r.mockUserToken.sub||r.mockUserToken.user_id;if(!d)throw new ee(V.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");c=new ct(d)}n._authCredentials=new Gv(new Sf(l,c))}}/**
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
 */class jo{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new jo(this.firestore,e,this._query)}}class Ot{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Ln(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Ot(this.firestore,e,this._key)}}class Ln extends jo{constructor(e,t,r){super(e,t,Ff(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Ot(this.firestore,null,new ne(e))}withConverter(e){return new Ln(this.firestore,e,this._path)}}function Yr(n,e,...t){if(n=vt(n),Sp("collection","path",e),n instanceof Bo){const r=Ve.fromString(e,...t);return Oh(r),new Ln(n,null,r)}{if(!(n instanceof Ot||n instanceof Ln))throw new ee(V.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(Ve.fromString(e,...t));return Oh(r),new Ln(n.firestore,null,r)}}function Kr(n,e,...t){if(n=vt(n),arguments.length===1&&(e=Pf.newId()),Sp("doc","path",e),n instanceof Bo){const r=Ve.fromString(e,...t);return Nh(r),new Ot(n,null,new ne(r))}{if(!(n instanceof Ot||n instanceof Ln))throw new ee(V.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(Ve.fromString(e,...t));return Nh(r),new Ot(n.firestore,n instanceof Ln?n.converter:null,new ne(r))}}/**
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
 */class Mh{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new cp(this,"async_queue_retry"),this.Vu=()=>{const r=Da();r&&J("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const t=Da();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=Da();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new Mn;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!Qi(e))throw e;J("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const i=function(a){let l=a.message||"";return a.stack&&(l=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),l}(r);throw dn("INTERNAL UNHANDLED ERROR: ",i),r}).then(r=>(this.du=!1,r))));return this.mu=t,t}enqueueAfterDelay(e,t,r){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const i=rc.createAndSchedule(this,e,t,r,s=>this.yu(s));return this.Tu.push(i),i}fu(){this.Eu&&oe()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}class es extends Bo{constructor(e,t,r,i){super(e,t,r,i),this.type="firestore",this._queue=new Mh,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Mh(e),this._firestoreClient=void 0,await e}}}function MI(n,e){const t=typeof n=="object"?n:yf(),r=typeof n=="string"?n:e||"(default)",i=Fl(t,"firestore").getImmediate({identifier:r});if(!i._initialized){const s=vy("firestore");s&&xI(i,...s)}return i}function lc(n){if(n._terminated)throw new ee(V.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||LI(n),n._firestoreClient}function LI(n){var e,t,r;const i=n._freezeSettings(),s=function(l,c,d,f){return new uE(l,c,d,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Rp(f.experimentalLongPollingOptions),f.useFetchStreams)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,i);n._componentsProvider||!((t=i.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=i.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),n._firestoreClient=new CI(n._authCredentials,n._appCheckCredentials,n._queue,s,n._componentsProvider&&function(l){const c=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(c),_online:c}}(n._componentsProvider))}/**
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
 */class zr{constructor(e){this._byteString=e}static fromBase64String(e){try{return new zr(it.fromBase64String(e))}catch(t){throw new ee(V.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new zr(it.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
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
 */class $o{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new ee(V.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new tt(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
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
 */class cc{constructor(e){this._methodName=e}}/**
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
 */class uc{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new ee(V.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new ee(V.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return Ie(this._lat,e._lat)||Ie(this._long,e._long)}}/**
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
 */class hc{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,e._values)}}/**
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
 */const FI=/^__.*__$/;class UI{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new Gn(e,this.data,this.fieldMask,t,this.fieldTransforms):new Ji(e,this.data,t,this.fieldTransforms)}}class Pp{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new Gn(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function Cp(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw oe()}}class dc{constructor(e,t,r,i,s,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.vu(),this.fieldTransforms=s||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new dc(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.Fu({path:r,xu:!1});return i.Ou(e),i}Nu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.Fu({path:r,xu:!1});return i.vu(),i}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return uo(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(Cp(this.Cu)&&FI.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class BI{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Lo(e)}Qu(e,t,r,i=!1){return new dc({Cu:e,methodName:t,qu:r,path:tt.emptyPath(),xu:!1,ku:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function kp(n){const e=n._freezeSettings(),t=Lo(n._databaseId);return new BI(n._databaseId,!!e.ignoreUndefinedProperties,t)}function Dp(n,e,t,r,i,s={}){const a=n.Qu(s.merge||s.mergeFields?2:0,e,t,i);fc("Data must be an object, but it was:",a,r);const l=Vp(r,a);let c,d;if(s.merge)c=new Pt(a.fieldMask),d=a.fieldTransforms;else if(s.mergeFields){const f=[];for(const m of s.mergeFields){const E=fl(e,m,t);if(!a.contains(E))throw new ee(V.INVALID_ARGUMENT,`Field '${E}' is specified in your field mask but missing from your input data.`);Op(f,E)||f.push(E)}c=new Pt(f),d=a.fieldTransforms.filter(m=>c.covers(m.field))}else c=null,d=a.fieldTransforms;return new UI(new It(l),c,d)}class qo extends cc{_toFieldTransform(e){if(e.Cu!==2)throw e.Cu===1?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof qo}}function jI(n,e,t,r){const i=n.Qu(1,e,t);fc("Data must be an object, but it was:",i,r);const s=[],a=It.empty();pr(r,(c,d)=>{const f=pc(e,c,t);d=vt(d);const m=i.Nu(f);if(d instanceof qo)s.push(f);else{const E=Ho(d,m);E!=null&&(s.push(f),a.set(f,E))}});const l=new Pt(s);return new Pp(a,l,i.fieldTransforms)}function $I(n,e,t,r,i,s){const a=n.Qu(1,e,t),l=[fl(e,r,t)],c=[i];if(s.length%2!=0)throw new ee(V.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let E=0;E<s.length;E+=2)l.push(fl(e,s[E])),c.push(s[E+1]);const d=[],f=It.empty();for(let E=l.length-1;E>=0;--E)if(!Op(d,l[E])){const R=l[E];let k=c[E];k=vt(k);const O=a.Nu(R);if(k instanceof qo)d.push(R);else{const F=Ho(k,O);F!=null&&(d.push(R),f.set(R,F))}}const m=new Pt(d);return new Pp(f,m,a.fieldTransforms)}function Ho(n,e){if(Np(n=vt(n)))return fc("Unsupported field value:",e,n),Vp(n,e);if(n instanceof cc)return function(r,i){if(!Cp(i.Cu))throw i.Bu(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.Bu(`${r._methodName}() is not currently supported inside arrays`);const s=r._toFieldTransform(i);s&&i.fieldTransforms.push(s)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,i){const s=[];let a=0;for(const l of r){let c=Ho(l,i.Lu(a));c==null&&(c={nullValue:"NULL_VALUE"}),s.push(c),a++}return{arrayValue:{values:s}}}(n,e)}return function(r,i){if((r=vt(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return NE(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const s=ze.fromDate(r);return{timestampValue:ao(i.serializer,s)}}if(r instanceof ze){const s=new ze(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:ao(i.serializer,s)}}if(r instanceof uc)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof zr)return{bytesValue:ep(i.serializer,r._byteString)};if(r instanceof Ot){const s=i.databaseId,a=r.firestore._databaseId;if(!a.isEqual(s))throw i.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:Ql(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof hc)return function(a,l){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(c=>{if(typeof c!="number")throw l.Bu("VectorValues must only contain numeric values.");return zl(l.serializer,c)})}}}}}}(r,i);throw i.Bu(`Unsupported field value: ${ac(r)}`)}(n,e)}function Vp(n,e){const t={};return Cf(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):pr(n,(r,i)=>{const s=Ho(i,e.Mu(r));s!=null&&(t[r]=s)}),{mapValue:{fields:t}}}function Np(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof ze||n instanceof uc||n instanceof zr||n instanceof Ot||n instanceof cc||n instanceof hc)}function fc(n,e,t){if(!Np(t)||!function(i){return typeof i=="object"&&i!==null&&(Object.getPrototypeOf(i)===Object.prototype||Object.getPrototypeOf(i)===null)}(t)){const r=ac(t);throw r==="an object"?e.Bu(n+" a custom object"):e.Bu(n+" "+r)}}function fl(n,e,t){if((e=vt(e))instanceof $o)return e._internalPath;if(typeof e=="string")return pc(n,e);throw uo("Field path arguments must be of type string or ",n,!1,void 0,t)}const qI=new RegExp("[~\\*/\\[\\]]");function pc(n,e,t){if(e.search(qI)>=0)throw uo(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new $o(...e.split("."))._internalPath}catch{throw uo(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function uo(n,e,t,r,i){const s=r&&!r.isEmpty(),a=i!==void 0;let l=`Function ${e}() called with invalid data`;t&&(l+=" (via `toFirestore()`)"),l+=". ";let c="";return(s||a)&&(c+=" (found",s&&(c+=` in field ${r}`),a&&(c+=` in document ${i}`),c+=")"),new ee(V.INVALID_ARGUMENT,l+n+c)}function Op(n,e){return n.some(t=>t.isEqual(e))}/**
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
 */class xp{constructor(e,t,r,i,s){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Ot(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new HI(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(Mp("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class HI extends xp{data(){return super.data()}}function Mp(n,e){return typeof e=="string"?pc(n,e):e instanceof $o?e._internalPath:e._delegate._internalPath}/**
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
 */function KI(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new ee(V.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class zI{convertValue(e,t="none"){switch(ur(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Le(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(cr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw oe()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return pr(e,(i,s)=>{r[i]=this.convertValue(s,t)}),r}convertVectorValue(e){var t,r,i;const s=(i=(r=(t=e.fields)===null||t===void 0?void 0:t.value.arrayValue)===null||r===void 0?void 0:r.values)===null||i===void 0?void 0:i.map(a=>Le(a.doubleValue));return new hc(s)}convertGeoPoint(e){return new uc(Le(e.latitude),Le(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=$l(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Fi(e));default:return null}}convertTimestamp(e){const t=qn(e);return new ze(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=Ve.fromString(e);Re(op(r));const i=new Ui(r.get(1),r.get(3)),s=new ne(r.popFirst(5));return i.isEqual(t)||dn(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
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
 */function Lp(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}/**
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
 */class Vs{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class WI extends xp{constructor(e,t,r,i,s,a){super(e,t,r,i,a),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new $s(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Mp("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class $s extends WI{data(e={}){return super.data(e)}}class GI{constructor(e,t,r,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new Vs(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new $s(this._firestore,this._userDataWriter,r.key,r,new Vs(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new ee(V.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(i,s){if(i._snapshot.oldDocs.isEmpty()){let a=0;return i._snapshot.docChanges.map(l=>{const c=new $s(i._firestore,i._userDataWriter,l.doc.key,l.doc,new Vs(i._snapshot.mutatedKeys.has(l.doc.key),i._snapshot.fromCache),i.query.converter);return l.doc,{type:"added",doc:c,oldIndex:-1,newIndex:a++}})}{let a=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(l=>s||l.type!==3).map(l=>{const c=new $s(i._firestore,i._userDataWriter,l.doc.key,l.doc,new Vs(i._snapshot.mutatedKeys.has(l.doc.key),i._snapshot.fromCache),i.query.converter);let d=-1,f=-1;return l.type!==0&&(d=a.indexOf(l.doc.key),a=a.delete(l.doc.key)),l.type!==1&&(a=a.add(l.doc),f=a.indexOf(l.doc.key)),{type:QI(l.type),doc:c,oldIndex:d,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function QI(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return oe()}}class JI extends zI{constructor(e){super(),this.firestore=e}convertBytes(e){return new zr(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Ot(this.firestore,null,t)}}function ts(n){n=hr(n,jo);const e=hr(n.firestore,es),t=lc(e),r=new JI(e);return KI(n._query),NI(t,n._query).then(i=>new GI(e,r,n,i))}function Ko(n,e,t){n=hr(n,Ot);const r=hr(n.firestore,es),i=Lp(n.converter,e,t);return mc(r,[Dp(kp(r),"setDoc",n._key,i,n.converter!==null,t).toMutation(n._key,Ct.none())])}function Lh(n){return mc(hr(n.firestore,es),[new xo(n._key,Ct.none())])}function mc(n,e){return function(r,i){const s=new Mn;return r.asyncQueue.enqueueAndForget(async()=>EI(await DI(r),i,s)),s.promise}(lc(n),e)}/**
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
 */class YI{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=kp(e)}set(e,t,r){this._verifyNotCommitted();const i=Na(e,this._firestore),s=Lp(i.converter,t,r),a=Dp(this._dataReader,"WriteBatch.set",i._key,s,i.converter!==null,r);return this._mutations.push(a.toMutation(i._key,Ct.none())),this}update(e,t,r,...i){this._verifyNotCommitted();const s=Na(e,this._firestore);let a;return a=typeof(t=vt(t))=="string"||t instanceof $o?$I(this._dataReader,"WriteBatch.update",s._key,t,r,i):jI(this._dataReader,"WriteBatch.update",s._key,t),this._mutations.push(a.toMutation(s._key,Ct.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=Na(e,this._firestore);return this._mutations=this._mutations.concat(new xo(t._key,Ct.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new ee(V.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function Na(n,e){if((n=vt(n)).firestore!==e)throw new ee(V.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
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
 */function XI(n){return lc(n=hr(n,es)),new YI(n,e=>mc(n,e))}(function(e,t=!0){(function(i){Gr=i})(Wr),Fr(new ar("firestore",(r,{instanceIdentifier:i,options:s})=>{const a=r.getProvider("app").getImmediate(),l=new es(new Qv(r.getProvider("auth-internal")),new Zv(r.getProvider("app-check-internal")),function(d,f){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new ee(V.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Ui(d.options.projectId,f)}(a,i),a);return s=Object.assign({useFetchStreams:t},s),l._setSettings(s),l},"PUBLIC").setMultipleInstances(!0)),xn(th,"4.7.3",e),xn(th,"4.7.3","esm2017")})();function gc(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,r=Object.getOwnPropertySymbols(n);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(n,r[i])&&(t[r[i]]=n[r[i]]);return t}function Fp(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const ZI=Fp,Up=new zi("auth","Firebase",Fp());/**
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
 */const ho=new Ml("@firebase/auth");function ew(n,...e){ho.logLevel<=ge.WARN&&ho.warn(`Auth (${Wr}): ${n}`,...e)}function qs(n,...e){ho.logLevel<=ge.ERROR&&ho.error(`Auth (${Wr}): ${n}`,...e)}/**
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
 */function pn(n,...e){throw _c(n,...e)}function Ht(n,...e){return _c(n,...e)}function Bp(n,e,t){const r=Object.assign(Object.assign({},ZI()),{[e]:t});return new zi("auth","Firebase",r).create(e,{appName:n.name})}function Fn(n){return Bp(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function _c(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Up.create(n,...e)}function se(n,e,...t){if(!n)throw _c(e,...t)}function sn(n){const e="INTERNAL ASSERTION FAILED: "+n;throw qs(e),new Error(e)}function mn(n,e){n||sn(e)}/**
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
 */function pl(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function tw(){return Fh()==="http:"||Fh()==="https:"}function Fh(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
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
 */function nw(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(tw()||by()||"connection"in navigator)?navigator.onLine:!0}function rw(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
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
 */class ns{constructor(e,t){this.shortDelay=e,this.longDelay=t,mn(t>e,"Short delay should be less than long delay!"),this.isMobile=Iy()||Ry()}get(){return nw()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function yc(n,e){mn(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class jp{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;sn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;sn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;sn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const iw={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const sw=new ns(3e4,6e4);function zo(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function Xr(n,e,t,r,i={}){return $p(n,i,async()=>{let s={},a={};r&&(e==="GET"?a=r:s={body:JSON.stringify(r)});const l=Wi(Object.assign({key:n.config.apiKey},a)).slice(1),c=await n._getAdditionalHeaders();c["Content-Type"]="application/json",n.languageCode&&(c["X-Firebase-Locale"]=n.languageCode);const d=Object.assign({method:e,headers:c},s);return Ay()||(d.referrerPolicy="no-referrer"),jp.fetch()(Hp(n,n.config.apiHost,t,l),d)})}async function $p(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},iw),e);try{const i=new ow(n),s=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();const a=await s.json();if("needConfirmation"in a)throw Ns(n,"account-exists-with-different-credential",a);if(s.ok&&!("errorMessage"in a))return a;{const l=s.ok?a.errorMessage:a.error.message,[c,d]=l.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ns(n,"credential-already-in-use",a);if(c==="EMAIL_EXISTS")throw Ns(n,"email-already-in-use",a);if(c==="USER_DISABLED")throw Ns(n,"user-disabled",a);const f=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw Bp(n,f,d);pn(n,f)}}catch(i){if(i instanceof _n)throw i;pn(n,"network-request-failed",{message:String(i)})}}async function qp(n,e,t,r,i={}){const s=await Xr(n,e,t,r,i);return"mfaPendingCredential"in s&&pn(n,"multi-factor-auth-required",{_serverResponse:s}),s}function Hp(n,e,t,r){const i=`${e}${t}?${r}`;return n.config.emulator?yc(n.config,i):`${n.config.apiScheme}://${i}`}class ow{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(Ht(this.auth,"network-request-failed")),sw.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function Ns(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const i=Ht(n,e,r);return i.customData._tokenResponse=t,i}/**
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
 */async function aw(n,e){return Xr(n,"POST","/v1/accounts:delete",e)}async function Kp(n,e){return Xr(n,"POST","/v1/accounts:lookup",e)}/**
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
 */function ki(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function lw(n,e=!1){const t=vt(n),r=await t.getIdToken(e),i=vc(r);se(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,a=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:ki(Oa(i.auth_time)),issuedAtTime:ki(Oa(i.iat)),expirationTime:ki(Oa(i.exp)),signInProvider:a||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function Oa(n){return Number(n)*1e3}function vc(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return qs("JWT malformed, contained fewer than 3 sections"),null;try{const i=hf(t);return i?JSON.parse(i):(qs("Failed to decode base64 JWT payload"),null)}catch(i){return qs("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function Uh(n){const e=vc(n);return se(e,"internal-error"),se(typeof e.exp<"u","internal-error"),se(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function qi(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof _n&&cw(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function cw({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
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
 */class uw{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const i=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class ml{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=ki(this.lastLoginAt),this.creationTime=ki(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function fo(n){var e;const t=n.auth,r=await n.getIdToken(),i=await qi(n,Kp(t,{idToken:r}));se(i==null?void 0:i.users.length,t,"internal-error");const s=i.users[0];n._notifyReloadListener(s);const a=!((e=s.providerUserInfo)===null||e===void 0)&&e.length?zp(s.providerUserInfo):[],l=dw(n.providerData,a),c=n.isAnonymous,d=!(n.email&&s.passwordHash)&&!(l!=null&&l.length),f=c?d:!1,m={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:l,metadata:new ml(s.createdAt,s.lastLoginAt),isAnonymous:f};Object.assign(n,m)}async function hw(n){const e=vt(n);await fo(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function dw(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function zp(n){return n.map(e=>{var{providerId:t}=e,r=gc(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
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
 */async function fw(n,e){const t=await $p(n,{},async()=>{const r=Wi({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=n.config,a=Hp(n,i,"/v1/token",`key=${s}`),l=await n._getAdditionalHeaders();return l["Content-Type"]="application/x-www-form-urlencoded",jp.fetch()(a,{method:"POST",headers:l,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function pw(n,e){return Xr(n,"POST","/v2/accounts:revokeToken",zo(n,e))}/**
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
 */class Or{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){se(e.idToken,"internal-error"),se(typeof e.idToken<"u","internal-error"),se(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Uh(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){se(e.length!==0,"internal-error");const t=Uh(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(se(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:i,expiresIn:s}=await fw(e,t);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:i,expirationTime:s}=t,a=new Or;return r&&(se(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),i&&(se(typeof i=="string","internal-error",{appName:e}),a.accessToken=i),s&&(se(typeof s=="number","internal-error",{appName:e}),a.expirationTime=s),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Or,this.toJSON())}_performRefresh(){return sn("not implemented")}}/**
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
 */function An(n,e){se(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class on{constructor(e){var{uid:t,auth:r,stsTokenManager:i}=e,s=gc(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new uw(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new ml(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await qi(this,this.stsTokenManager.getToken(this.auth,e));return se(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return lw(this,e)}reload(){return hw(this)}_assign(e){this!==e&&(se(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new on(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){se(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await fo(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(rn(this.auth.app))return Promise.reject(Fn(this.auth));const e=await this.getIdToken();return await qi(this,aw(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,i,s,a,l,c,d,f;const m=(r=t.displayName)!==null&&r!==void 0?r:void 0,E=(i=t.email)!==null&&i!==void 0?i:void 0,R=(s=t.phoneNumber)!==null&&s!==void 0?s:void 0,k=(a=t.photoURL)!==null&&a!==void 0?a:void 0,O=(l=t.tenantId)!==null&&l!==void 0?l:void 0,F=(c=t._redirectEventId)!==null&&c!==void 0?c:void 0,Y=(d=t.createdAt)!==null&&d!==void 0?d:void 0,G=(f=t.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:Q,emailVerified:H,isAnonymous:fe,providerData:ve,stsTokenManager:w}=t;se(Q&&w,e,"internal-error");const g=Or.fromJSON(this.name,w);se(typeof Q=="string",e,"internal-error"),An(m,e.name),An(E,e.name),se(typeof H=="boolean",e,"internal-error"),se(typeof fe=="boolean",e,"internal-error"),An(R,e.name),An(k,e.name),An(O,e.name),An(F,e.name),An(Y,e.name),An(G,e.name);const v=new on({uid:Q,auth:e,email:E,emailVerified:H,displayName:m,isAnonymous:fe,photoURL:k,phoneNumber:R,tenantId:O,stsTokenManager:g,createdAt:Y,lastLoginAt:G});return ve&&Array.isArray(ve)&&(v.providerData=ve.map(T=>Object.assign({},T))),F&&(v._redirectEventId=F),v}static async _fromIdTokenResponse(e,t,r=!1){const i=new Or;i.updateFromServerResponse(t);const s=new on({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await fo(s),s}static async _fromGetAccountInfoResponse(e,t,r){const i=t.users[0];se(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?zp(i.providerUserInfo):[],a=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),l=new Or;l.updateFromIdToken(r);const c=new on({uid:i.localId,auth:e,stsTokenManager:l,isAnonymous:a}),d={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new ml(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(c,d),c}}/**
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
 */const Bh=new Map;function an(n){mn(n instanceof Function,"Expected a class definition");let e=Bh.get(n);return e?(mn(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,Bh.set(n,e),e)}/**
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
 */class Wp{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Wp.type="NONE";const jh=Wp;/**
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
 */function Hs(n,e,t){return`firebase:${n}:${e}:${t}`}class xr{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=Hs(this.userKey,i.apiKey,s),this.fullPersistenceKey=Hs("persistence",i.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?on._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new xr(an(jh),e,r);const i=(await Promise.all(t.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d);let s=i[0]||an(jh);const a=Hs(r,e.config.apiKey,e.name);let l=null;for(const d of t)try{const f=await d._get(a);if(f){const m=on._fromJSON(e,f);d!==s&&(l=m),s=d;break}}catch{}const c=i.filter(d=>d._shouldAllowMigration);return!s._shouldAllowMigration||!c.length?new xr(s,e,r):(s=c[0],l&&await s._set(a,l.toJSON()),await Promise.all(t.map(async d=>{if(d!==s)try{await d._remove(a)}catch{}})),new xr(s,e,r))}}/**
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
 */function $h(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Yp(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Gp(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Zp(e))return"Blackberry";if(em(e))return"Webos";if(Qp(e))return"Safari";if((e.includes("chrome/")||Jp(e))&&!e.includes("edge/"))return"Chrome";if(Xp(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Gp(n=ft()){return/firefox\//i.test(n)}function Qp(n=ft()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Jp(n=ft()){return/crios\//i.test(n)}function Yp(n=ft()){return/iemobile/i.test(n)}function Xp(n=ft()){return/android/i.test(n)}function Zp(n=ft()){return/blackberry/i.test(n)}function em(n=ft()){return/webos/i.test(n)}function Ec(n=ft()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function mw(n=ft()){var e;return Ec(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function gw(){return Sy()&&document.documentMode===10}function tm(n=ft()){return Ec(n)||Xp(n)||em(n)||Zp(n)||/windows phone/i.test(n)||Yp(n)}/**
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
 */function nm(n,e=[]){let t;switch(n){case"Browser":t=$h(ft());break;case"Worker":t=`${$h(ft())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Wr}/${r}`}/**
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
 */class _w{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=s=>new Promise((a,l)=>{try{const c=e(s);a(c)}catch(c){l(c)}});r.onAbort=t,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function yw(n,e={}){return Xr(n,"GET","/v2/passwordPolicy",zo(n,e))}/**
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
 */const vw=6;class Ew{constructor(e){var t,r,i,s;const a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=a.minPasswordLength)!==null&&t!==void 0?t:vw,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(s=e.forceUpgradeOnSignin)!==null&&s!==void 0?s:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,i,s,a,l;const c={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,c),this.validatePasswordCharacterOptions(e,c),c.isValid&&(c.isValid=(t=c.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),c.isValid&&(c.isValid=(r=c.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),c.isValid&&(c.isValid=(i=c.containsLowercaseLetter)!==null&&i!==void 0?i:!0),c.isValid&&(c.isValid=(s=c.containsUppercaseLetter)!==null&&s!==void 0?s:!0),c.isValid&&(c.isValid=(a=c.containsNumericCharacter)!==null&&a!==void 0?a:!0),c.isValid&&(c.isValid=(l=c.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),c}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
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
 */class Tw{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new qh(this),this.idTokenSubscription=new qh(this),this.beforeStateQueue=new _w(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Up,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=an(t)),this._initializationPromise=this.queue(async()=>{var r,i;if(!this._deleted&&(this.persistenceManager=await xr.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)===null||i===void 0?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Kp(this,{idToken:e}),r=await on._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(rn(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let i=r,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,l=i==null?void 0:i._redirectEventId,c=await this.tryRedirectSignIn(e);(!a||a===l)&&(c!=null&&c.user)&&(i=c.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(a){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return se(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await fo(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=rw()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(rn(this.app))return Promise.reject(Fn(this));const t=e?vt(e):null;return t&&se(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&se(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return rn(this.app)?Promise.reject(Fn(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return rn(this.app)?Promise.reject(Fn(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(an(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await yw(this),t=new Ew(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new zi("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await pw(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&an(e)||this._popupRedirectResolver;se(t,this,"argument-error"),this.redirectPersistenceManager=await xr.create(this,[an(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};const s=typeof t=="function"?t:t.next.bind(t);let a=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(se(l,this,"internal-error"),l.then(()=>{a||s(this.currentUser)}),typeof t=="function"){const c=e.addObserver(t,r,i);return()=>{a=!0,c()}}else{const c=e.addObserver(t);return()=>{a=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return se(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=nm(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const i=await this._getAppCheckToken();return i&&(t["X-Firebase-AppCheck"]=i),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&ew(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function Wo(n){return vt(n)}class qh{constructor(e){this.auth=e,this.observer=null,this.addObserver=xy(t=>this.observer=t)}get next(){return se(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let Tc={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Iw(n){Tc=n}function ww(n){return Tc.loadJS(n)}function Aw(){return Tc.gapiScript}function bw(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
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
 */function Rw(n,e){const t=Fl(n,"auth");if(t.isInitialized()){const i=t.getImmediate(),s=t.getOptions();if(eo(s,e??{}))return i;pn(i,"already-initialized")}return t.initialize({options:e})}function Sw(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(an);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function Pw(n,e,t){const r=Wo(n);se(r._canInitEmulator,r,"emulator-config-failed"),se(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!!(t!=null&&t.disableWarnings),s=rm(e),{host:a,port:l}=Cw(e),c=l===null?"":`:${l}`;r.config.emulator={url:`${s}//${a}${c}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:a,port:l,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})}),i||kw()}function rm(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function Cw(n){const e=rm(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:Hh(r.substr(s.length+1))}}else{const[s,a]=r.split(":");return{host:s,port:Hh(a)}}}function Hh(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function kw(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
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
 */class im{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return sn("not implemented")}_getIdTokenResponse(e){return sn("not implemented")}_linkToIdToken(e,t){return sn("not implemented")}_getReauthenticationResolver(e){return sn("not implemented")}}/**
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
 */async function Mr(n,e){return qp(n,"POST","/v1/accounts:signInWithIdp",zo(n,e))}/**
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
 */const Dw="http://localhost";class dr extends im{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new dr(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):pn("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i}=t,s=gc(t,["providerId","signInMethod"]);if(!r||!i)return null;const a=new dr(r,i);return a.idToken=s.idToken||void 0,a.accessToken=s.accessToken||void 0,a.secret=s.secret,a.nonce=s.nonce,a.pendingToken=s.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return Mr(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Mr(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Mr(e,t)}buildRequest(){const e={requestUri:Dw,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Wi(t)}return e}}/**
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
 */class sm{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class rs extends sm{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class Sn extends rs{constructor(){super("facebook.com")}static credential(e){return dr._fromParams({providerId:Sn.PROVIDER_ID,signInMethod:Sn.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Sn.credentialFromTaggedObject(e)}static credentialFromError(e){return Sn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Sn.credential(e.oauthAccessToken)}catch{return null}}}Sn.FACEBOOK_SIGN_IN_METHOD="facebook.com";Sn.PROVIDER_ID="facebook.com";/**
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
 */class Pn extends rs{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return dr._fromParams({providerId:Pn.PROVIDER_ID,signInMethod:Pn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return Pn.credentialFromTaggedObject(e)}static credentialFromError(e){return Pn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return Pn.credential(t,r)}catch{return null}}}Pn.GOOGLE_SIGN_IN_METHOD="google.com";Pn.PROVIDER_ID="google.com";/**
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
 */class Cn extends rs{constructor(){super("github.com")}static credential(e){return dr._fromParams({providerId:Cn.PROVIDER_ID,signInMethod:Cn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Cn.credentialFromTaggedObject(e)}static credentialFromError(e){return Cn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Cn.credential(e.oauthAccessToken)}catch{return null}}}Cn.GITHUB_SIGN_IN_METHOD="github.com";Cn.PROVIDER_ID="github.com";/**
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
 */class kn extends rs{constructor(){super("twitter.com")}static credential(e,t){return dr._fromParams({providerId:kn.PROVIDER_ID,signInMethod:kn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return kn.credentialFromTaggedObject(e)}static credentialFromError(e){return kn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return kn.credential(t,r)}catch{return null}}}kn.TWITTER_SIGN_IN_METHOD="twitter.com";kn.PROVIDER_ID="twitter.com";/**
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
 */async function Vw(n,e){return qp(n,"POST","/v1/accounts:signUp",zo(n,e))}/**
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
 */class Kn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,i=!1){const s=await on._fromIdTokenResponse(e,r,i),a=Kh(r);return new Kn({user:s,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const i=Kh(r);return new Kn({user:e,providerId:i,_tokenResponse:r,operationType:t})}}function Kh(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
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
 */async function Nw(n){var e;if(rn(n.app))return Promise.reject(Fn(n));const t=Wo(n);if(await t._initializationPromise,!((e=t.currentUser)===null||e===void 0)&&e.isAnonymous)return new Kn({user:t.currentUser,providerId:null,operationType:"signIn"});const r=await Vw(t,{returnSecureToken:!0}),i=await Kn._fromIdTokenResponse(t,"signIn",r,!0);return await t._updateCurrentUser(i.user),i}/**
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
 */class po extends _n{constructor(e,t,r,i){var s;super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,po.prototype),this.customData={appName:e.name,tenantId:(s=e.tenantId)!==null&&s!==void 0?s:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new po(e,t,r,i)}}function om(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?po._fromErrorAndOperation(n,s,e,r):s})}async function Ow(n,e,t=!1){const r=await qi(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return Kn._forOperation(n,"link",r)}/**
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
 */async function xw(n,e,t=!1){const{auth:r}=n;if(rn(r.app))return Promise.reject(Fn(r));const i="reauthenticate";try{const s=await qi(n,om(r,i,e,n),t);se(s.idToken,r,"internal-error");const a=vc(s.idToken);se(a,r,"internal-error");const{sub:l}=a;return se(n.uid===l,r,"user-mismatch"),Kn._forOperation(n,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&pn(r,"user-mismatch"),s}}/**
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
 */async function Mw(n,e,t=!1){if(rn(n.app))return Promise.reject(Fn(n));const r="signIn",i=await om(n,r,e),s=await Kn._fromIdTokenResponse(n,r,i);return t||await n._updateCurrentUser(s.user),s}function Lw(n,e,t,r){return vt(n).onIdTokenChanged(e,t,r)}function Fw(n,e,t){return vt(n).beforeAuthStateChanged(e,t)}const mo="__sak";/**
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
 */class am{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(mo,"1"),this.storage.removeItem(mo),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const Uw=1e3,Bw=10;class lm extends am{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=tm(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,l,c)=>{this.notifyListeners(a,c)});return}const r=e.key;t?this.detachListener():this.stopPolling();const i=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},s=this.storage.getItem(r);gw()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,Bw):i()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},Uw)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}lm.type="LOCAL";const jw=lm;/**
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
 */class cm extends am{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}cm.type="SESSION";const um=cm;/**
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
 */function $w(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class Go{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;const r=new Go(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:i,data:s}=t.data,a=this.handlersMap[i];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const l=Array.from(a).map(async d=>d(t.origin,s)),c=await $w(l);t.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:c})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Go.receivers=[];/**
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
 */function Ic(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
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
 */class qw{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,a;return new Promise((l,c)=>{const d=Ic("",20);i.port1.start();const f=setTimeout(()=>{c(new Error("unsupported_event"))},r);a={messageChannel:i,onMessage(m){const E=m;if(E.data.eventId===d)switch(E.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),l(E.data.response);break;default:clearTimeout(f),clearTimeout(s),c(new Error("invalid_response"));break}}},this.handlers.add(a),i.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:d,data:t},[i.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
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
 */function Kt(){return window}function Hw(n){Kt().location.href=n}/**
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
 */function hm(){return typeof Kt().WorkerGlobalScope<"u"&&typeof Kt().importScripts=="function"}async function Kw(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function zw(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function Ww(){return hm()?self:null}/**
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
 */const dm="firebaseLocalStorageDb",Gw=1,go="firebaseLocalStorage",fm="fbase_key";class is{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Qo(n,e){return n.transaction([go],e?"readwrite":"readonly").objectStore(go)}function Qw(){const n=indexedDB.deleteDatabase(dm);return new is(n).toPromise()}function gl(){const n=indexedDB.open(dm,Gw);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(go,{keyPath:fm})}catch(i){t(i)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(go)?e(r):(r.close(),await Qw(),e(await gl()))})})}async function zh(n,e,t){const r=Qo(n,!0).put({[fm]:e,value:t});return new is(r).toPromise()}async function Jw(n,e){const t=Qo(n,!1).get(e),r=await new is(t).toPromise();return r===void 0?null:r.value}function Wh(n,e){const t=Qo(n,!0).delete(e);return new is(t).toPromise()}const Yw=800,Xw=3;class pm{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await gl(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>Xw)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return hm()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Go._getInstance(Ww()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await Kw(),!this.activeServiceWorker)return;this.sender=new qw(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||zw()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await gl();return await zh(e,mo,"1"),await Wh(e,mo),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>zh(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>Jw(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Wh(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=Qo(i,!1).getAll();return new is(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Yw)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}pm.type="LOCAL";const Zw=pm;new ns(3e4,6e4);/**
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
 */function e0(n,e){return e?an(e):(se(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class wc extends im{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Mr(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Mr(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Mr(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function t0(n){return Mw(n.auth,new wc(n),n.bypassAuthState)}function n0(n){const{auth:e,user:t}=n;return se(t,e,"internal-error"),xw(t,new wc(n),n.bypassAuthState)}async function r0(n){const{auth:e,user:t}=n;return se(t,e,"internal-error"),Ow(t,new wc(n),n.bypassAuthState)}/**
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
 */class mm{constructor(e,t,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:i,tenantId:s,error:a,type:l}=e;if(a){this.reject(a);return}const c={auth:this.auth,requestUri:t,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(c))}catch(d){this.reject(d)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return t0;case"linkViaPopup":case"linkViaRedirect":return r0;case"reauthViaPopup":case"reauthViaRedirect":return n0;default:pn(this.auth,"internal-error")}}resolve(e){mn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){mn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const i0=new ns(2e3,1e4);class Sr extends mm{constructor(e,t,r,i,s){super(e,t,i,s),this.provider=r,this.authWindow=null,this.pollId=null,Sr.currentPopupAction&&Sr.currentPopupAction.cancel(),Sr.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return se(e,this.auth,"internal-error"),e}async onExecution(){mn(this.filter.length===1,"Popup operations only handle one event");const e=Ic();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Ht(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Ht(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Sr.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Ht(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,i0.get())};e()}}Sr.currentPopupAction=null;/**
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
 */const s0="pendingRedirect",Ks=new Map;class o0 extends mm{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Ks.get(this.auth._key());if(!e){try{const r=await a0(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Ks.set(this.auth._key(),e)}return this.bypassAuthState||Ks.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function a0(n,e){const t=u0(e),r=c0(n);if(!await r._isAvailable())return!1;const i=await r._get(t)==="true";return await r._remove(t),i}function l0(n,e){Ks.set(n._key(),e)}function c0(n){return an(n._redirectPersistence)}function u0(n){return Hs(s0,n.config.apiKey,n.name)}async function h0(n,e,t=!1){if(rn(n.app))return Promise.reject(Fn(n));const r=Wo(n),i=e0(r,e),a=await new o0(r,i,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
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
 */const d0=10*60*1e3;class f0{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!p0(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!gm(e)){const i=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(Ht(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=d0&&this.cachedEventUids.clear(),this.cachedEventUids.has(Gh(e))}saveEventToCache(e){this.cachedEventUids.add(Gh(e)),this.lastProcessedEventTime=Date.now()}}function Gh(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function gm({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function p0(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return gm(n);default:return!1}}/**
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
 */async function m0(n,e={}){return Xr(n,"GET","/v1/projects",e)}/**
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
 */const g0=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,_0=/^https?/;async function y0(n){if(n.config.emulator)return;const{authorizedDomains:e}=await m0(n);for(const t of e)try{if(v0(t))return}catch{}pn(n,"unauthorized-domain")}function v0(n){const e=pl(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!_0.test(t))return!1;if(g0.test(n))return r===n;const i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
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
 */const E0=new ns(3e4,6e4);function Qh(){const n=Kt().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function T0(n){return new Promise((e,t)=>{var r,i,s;function a(){Qh(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Qh(),t(Ht(n,"network-request-failed"))},timeout:E0.get()})}if(!((i=(r=Kt().gapi)===null||r===void 0?void 0:r.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((s=Kt().gapi)===null||s===void 0)&&s.load)a();else{const l=bw("iframefcb");return Kt()[l]=()=>{gapi.load?a():t(Ht(n,"network-request-failed"))},ww(`${Aw()}?onload=${l}`).catch(c=>t(c))}}).catch(e=>{throw zs=null,e})}let zs=null;function I0(n){return zs=zs||T0(n),zs}/**
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
 */const w0=new ns(5e3,15e3),A0="__/auth/iframe",b0="emulator/auth/iframe",R0={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},S0=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function P0(n){const e=n.config;se(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?yc(e,b0):`https://${n.config.authDomain}/${A0}`,r={apiKey:e.apiKey,appName:n.name,v:Wr},i=S0.get(n.config.apiHost);i&&(r.eid=i);const s=n._getFrameworks();return s.length&&(r.fw=s.join(",")),`${t}?${Wi(r).slice(1)}`}async function C0(n){const e=await I0(n),t=Kt().gapi;return se(t,n,"internal-error"),e.open({where:document.body,url:P0(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:R0,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const a=Ht(n,"network-request-failed"),l=Kt().setTimeout(()=>{s(a)},w0.get());function c(){Kt().clearTimeout(l),i(r)}r.ping(c).then(c,()=>{s(a)})}))}/**
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
 */const k0={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},D0=500,V0=600,N0="_blank",O0="http://localhost";class Jh{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function x0(n,e,t,r=D0,i=V0){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const c=Object.assign(Object.assign({},k0),{width:r.toString(),height:i.toString(),top:s,left:a}),d=ft().toLowerCase();t&&(l=Jp(d)?N0:t),Gp(d)&&(e=e||O0,c.scrollbars="yes");const f=Object.entries(c).reduce((E,[R,k])=>`${E}${R}=${k},`,"");if(mw(d)&&l!=="_self")return M0(e||"",l),new Jh(null);const m=window.open(e||"",l,f);se(m,n,"popup-blocked");try{m.focus()}catch{}return new Jh(m)}function M0(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
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
 */const L0="__/auth/handler",F0="emulator/auth/handler",U0=encodeURIComponent("fac");async function Yh(n,e,t,r,i,s){se(n.config.authDomain,n,"auth-domain-config-required"),se(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:Wr,eventId:i};if(e instanceof sm){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",Oy(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,m]of Object.entries(s||{}))a[f]=m}if(e instanceof rs){const f=e.getScopes().filter(m=>m!=="");f.length>0&&(a.scopes=f.join(","))}n.tenantId&&(a.tid=n.tenantId);const l=a;for(const f of Object.keys(l))l[f]===void 0&&delete l[f];const c=await n._getAppCheckToken(),d=c?`#${U0}=${encodeURIComponent(c)}`:"";return`${B0(n)}?${Wi(l).slice(1)}${d}`}function B0({config:n}){return n.emulator?yc(n,F0):`https://${n.authDomain}/${L0}`}/**
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
 */const xa="webStorageSupport";class j0{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=um,this._completeRedirectFn=h0,this._overrideRedirectResult=l0}async _openPopup(e,t,r,i){var s;mn((s=this.eventManagers[e._key()])===null||s===void 0?void 0:s.manager,"_initialize() not called before _openPopup()");const a=await Yh(e,t,r,pl(),i);return x0(e,a,Ic())}async _openRedirect(e,t,r,i){await this._originValidation(e);const s=await Yh(e,t,r,pl(),i);return Hw(s),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:s}=this.eventManagers[t];return i?Promise.resolve(i):(mn(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await C0(e),r=new f0(e);return t.register("authEvent",i=>(se(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(xa,{type:xa},i=>{var s;const a=(s=i==null?void 0:i[0])===null||s===void 0?void 0:s[xa];a!==void 0&&t(!!a),pn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=y0(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return tm()||Qp()||Ec()}}const $0=j0;var Xh="@firebase/auth",Zh="1.7.9";/**
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
 */class q0{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){se(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function H0(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function K0(n){Fr(new ar("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:a,authDomain:l}=r.options;se(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:a,authDomain:l,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:nm(n)},d=new Tw(r,i,s,c);return Sw(d,t),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),Fr(new ar("auth-internal",e=>{const t=Wo(e.getProvider("auth").getImmediate());return(r=>new q0(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),xn(Xh,Zh,H0(n)),xn(Xh,Zh,"esm2017")}/**
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
 */const z0=5*60,W0=pf("authIdTokenMaxAge")||z0;let ed=null;const G0=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>W0)return;const i=t==null?void 0:t.token;ed!==i&&(ed=i,await fetch(n,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function Q0(n=yf()){const e=Fl(n,"auth");if(e.isInitialized())return e.getImmediate();const t=Rw(n,{popupRedirectResolver:$0,persistence:[Zw,jw,um]}),r=pf("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const a=G0(s.toString());Fw(t,a,()=>a(t.currentUser)),Lw(t,l=>a(l))}}const i=df("auth");return i&&Pw(t,`http://${i}`),t}function J0(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}Iw({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{const s=Ht("internal-error");s.customData=i,t(s)},r.type="text/javascript",r.charset="UTF-8",J0().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});K0("Browser");const Y0={apiKey:"AIzaSyDCqJRmxKiIzuAhgXsmXICCx_O65aujNa0",authDomain:"impro-selector.firebaseapp.com",projectId:"impro-selector",storageBucket:"impro-selector.appspot.com",messagingSenderId:"730278491306",appId:"1:730278491306:web:c966af1179221e91118cd3",measurementId:"G-3NB062D088"},_m=_f(Y0),Vt=MI(_m),X0=Q0(_m);Nw(X0);let Qt="mock";const Z0=["Alice","Bob","Charlie","David","Eva","Fanny","Georges","Hélène","Ismaël","Jade","Karim","Léa","Marc","Nina","Oscar"],fr=[{id:"event1",title:"Apérock Septembre",date:"2025-09-08"},{id:"event2",title:"Match à Cambo",date:"2025-11-25"},{id:"event3",title:"Impro des Familles",date:"2025-12-02"},{id:"event4",title:"Cabaret Surprise",date:"2026-01-20"},{id:"event5",title:"Impro Plage",date:"2026-03-10"}];function eA(n){Qt=n}async function td(){return(Qt==="firebase"?(await ts(Yr(Vt,"events"))).docs.map(e=>({id:e.id,...e.data()})):fr).sort((e,t)=>{const r=new Date(e.date),i=new Date(t.date);return r<i?-1:r>i?1:e.title.localeCompare(t.title)})}async function tA(){return Qt==="firebase"?(await ts(Yr(Vt,"players"))).docs.map(e=>({id:e.id,...e.data()})):Z0.map((n,e)=>({id:`p${e+1}`,name:n}))}async function nd(n,e){if(Qt==="firebase"){const t=await ts(Yr(Vt,"availability")),r={};return t.forEach(i=>{r[i.id]=i.data()}),r}else{const t={};return n.forEach(r=>{t[r.name]={},e.forEach(i=>{t[r.name][i.id]=void 0})}),e.forEach(r=>{const i=[...n].sort(()=>.5-Math.random());i.slice(0,4).forEach(s=>{t[s.name][r.id]=!0}),i.slice(4).forEach(s=>{const a=Math.random();t[s.name][r.id]=a<.4?!0:a<.8?!1:void 0})}),t}}async function rd(){if(Qt==="firebase"){const n=await ts(Yr(Vt,"selections")),e={};return n.forEach(t=>{e[t.id]=t.data().players||[]}),e}else return{}}async function id(n,e){Qt==="firebase"&&await Ko(Kr(Vt,"availability",n),e)}async function nA(n,e){Qt==="firebase"&&await Ko(Kr(Vt,"selections",n),{players:e})}async function rA(n){if(console.log("Suppression de l'événement:",n),Qt==="firebase")try{console.log("Suppression de l'événement dans Firestore"),await Lh(Kr(Vt,"events",n)),console.log("Suppression de la sélection associée"),await Lh(Kr(Vt,"selections",n)),console.log("Suppression des disponibilités");const e=await ts(Yr(Vt,"availability")),t=XI(Vt);e.forEach(r=>{const i=r.data();if(i[n]!==void 0){console.log("Mise à jour de la disponibilité pour:",r.id);const s={...i};delete s[n],t.update(r.ref,s)}}),await t.commit(),console.log("Opérations de suppression terminées avec succès")}catch(e){throw console.error("Erreur lors de la suppression:",e),e}else fr=fr.filter(e=>e.id!==n)}async function iA(n){if(Qt==="firebase"){const e=Kr(Yr(Vt,"events"));return await Ko(e,n),e.id}else{const e=`event${fr.length+1}`;return fr.push({id:e,...n}),e}}async function sA(n,e){if(Qt==="firebase")await Ko(Kr(Vt,"events",n),e);else{const t=fr.findIndex(r=>r.id===n);t!==-1&&(fr[t]={id:n,...e})}}const oA={class:"table-auto border-collapse border border-gray-400 w-full"},aA={class:"bg-gray-100 text-gray-800 text-sm uppercase tracking-wider"},lA=["onMouseenter","onDblclick"],cA={class:"flex flex-col items-center space-y-1 relative"},uA={key:0,class:"font-semibold text-base text-center whitespace-pre-wrap"},hA={key:1,class:"w-full"},dA={key:2,class:"text-xs text-gray-500"},fA={key:3,class:"w-full"},pA=["onClick"],mA={class:"p-3 text-center text-gray-500"},gA={class:"bg-gray-50"},_A=["onClick"],yA={class:"border-t"},vA={class:"p-3 font-medium text-gray-900"},EA={class:"p-3 text-center text-gray-700 text-sm"},TA=["title"],IA=["onClick"],wA=["title"],AA=["title"],bA=["title"],RA=["title"],SA={key:0,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"},PA={class:"bg-white rounded-lg p-4 w-96"},CA={class:"mb-4"},kA={class:"mb-4"},DA={key:1,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"},VA=Object.assign({name:"GridBoard"},{__name:"GridBoard",setup(n){const e=mt(!1),t=mt(null),r=mt(null),i=mt(""),s=mt("");async function a(W){t.value=W,e.value=!0}async function l(){if(t.value)try{await rA(t.value),G.value=G.value.filter(W=>W.id!==t.value),await Promise.all([td(),nd(Q.value,G.value),rd()]).then(([W,B,U])=>{G.value=W,H.value=B,fe.value=U}),e.value=!1,t.value=null}catch(W){console.error("Erreur lors de la suppression de l'événement:",W),alert("Erreur lors de la suppression de l'événement. Veuillez réessayer.")}}function c(){e.value=!1,t.value=null}function d(W){r.value=W.id,i.value=W.title,s.value=W.date}async function f(){if(!(!r.value||!i.value.trim()||!s.value))try{const W={title:i.value.trim(),date:s.value};await sA(r.value,W);const B=G.value.findIndex(U=>U.id===r.value);B!==-1&&(G.value[B]={...G.value[B],...W}),r.value=null,i.value="",s.value=""}catch(W){console.error("Erreur lors de l'édition de l'événement:",W),alert("Erreur lors de l'édition de l'événement. Veuillez réessayer.")}}function m(){r.value=null,i.value="",s.value=""}const E=mt(null),R=mt(!1),k=mt(""),O=mt("");async function F(){if(!k.value.trim()||!O.value){alert("Veuillez remplir le titre et la date de l'événement");return}const W={title:k.value.trim(),date:O.value};try{const B=await iA(W);G.value=[...G.value,{id:B,...W}];const U={};for(const Z of Q.value)U[Z.name]=H.value[Z.name]||{},U[Z.name][B]=null,await id(Z.name,U[Z.name]);k.value="",O.value="",R.value=!1,await Promise.resolve()}catch(B){console.error("Erreur lors de la création de l'événement:",B),alert("Erreur lors de la création de l'événement. Veuillez réessayer.")}}function Y(){k.value="",O.value="",R.value=!1}const G=mt([]),Q=mt([]),H=mt({}),fe=mt({}),ve=mt({}),w=mt({});Ld(async()=>{eA("firebase"),G.value=await td();const W=await tA(),B={};W.forEach(U=>{B[U.name]||(B[U.name]=U)}),Q.value=Object.values(B),console.log("players (deduplicated):",Q.value.map(U=>({id:U.id,name:U.name}))),H.value=await nd(Q.value,G.value),fe.value=await rd(),Ee(),pe()});function g(W,B){H.value[W]=H.value[W]||{};const U=H.value[W][B];let Z;U===void 0?Z=!0:U===!0?Z=!1:Z=void 0,H.value[W][B]=Z,id(W,H.value[W]),Fe(W),pe()}function v(W,B){var U;return(U=H.value[W])==null?void 0:U[B]}function T(W,B){var Qe;const U=fe.value[B]||[],Z=(Qe=H.value[W])==null?void 0:Qe[B];return U.includes(W)&&Z===!0}async function A(W,B=6){const Z=Q.value.filter(be=>v(be.name,W)).map(be=>{const De=y(be.name);return{name:be.name,weight:1/(1+De)}}),Qe=[],We=[...Z];for(;Qe.length<B&&We.length>0;){const be=We.reduce((yn,wt)=>yn+wt.weight,0);let De=Math.random()*be;const Jt=We.findIndex(yn=>(De-=yn.weight,De<=0));Jt>=0&&(Qe.push(We[Jt].name),We.splice(Jt,1))}fe.value[W]=Qe,await nA(W,Qe),Ee(),pe()}function S(W){var U;return W?(typeof W=="string"?new Date(W):((U=W.toDate)==null?void 0:U.call(W))||W).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}):""}function y(W){return Object.values(fe.value).filter(B=>B.includes(W)).length}function je(W){const B=H.value[W]||{};return Object.values(B).filter(U=>U===!0).length}function Ft(W){const B=je(W),U=y(W);return B===0?0:U/B}function Fe(W){ve.value[W]={availability:je(W),selection:y(W),ratio:Ft(W)}}function Ee(){Q.value.forEach(W=>Fe(W.name))}function pe(W=6){const B={};G.value.forEach(U=>{const Qe=Q.value.filter(be=>v(be.name,U.id)===!0).map(be=>{const De=y(be.name);return{name:be.name,weight:1/(1+De)}}),We=Qe.reduce((be,De)=>be+De.weight,0);Qe.forEach(be=>{const De=Math.min(1,be.weight/We*W);B[be.name]||(B[be.name]={}),B[be.name][U.id]=Math.round(De*100)})}),w.value=B}function st(W,B){var be,De;const U=W.name,Z=v(U,B),Qe=T(U,B),We=((De=(be=w.value)==null?void 0:be[U])==null?void 0:De[B])??0;return Z===!1?"Non disponible – cliquez pour changer":Qe?`Sélectionné · Chance estimée : ${We}%`:Z===!0?`Disponible · Chance estimée : ${We}%`:"Cliquez pour indiquer votre disponibilité"}return(W,B)=>(Me(),He(Tt,null,[he("table",oA,[he("thead",null,[he("tr",aA,[B[6]||(B[6]=he("th",{class:"p-3 text-left"},"Nom",-1)),B[7]||(B[7]=he("th",{class:"p-3 text-center text-sm text-gray-700"},"📊 Stats",-1)),(Me(!0),He(Tt,null,bs(G.value,U=>(Me(),He("th",{key:U.id,class:"p-3 text-center w-48 align-top",onMouseenter:Z=>E.value=U.id,onMouseleave:B[2]||(B[2]=Z=>E.value=null),onDblclick:Z=>d(U)},[he("div",cA,[r.value!==U.id?(Me(),He("div",uA,Tr(U.title),1)):(Me(),He("div",hA,[As(he("input",{"onUpdate:modelValue":B[0]||(B[0]=Z=>i.value=Z),type:"text",class:"w-full p-1 border rounded",onKeydown:[Ss(m,["esc"]),Ss(f,["enter"])],ref_for:!0,ref:"editTitleInput"},null,544),[[Rs,i.value]])])),r.value!==U.id?(Me(),He("div",dA,Tr(S(U.date)),1)):(Me(),He("div",fA,[As(he("input",{"onUpdate:modelValue":B[1]||(B[1]=Z=>s.value=Z),type:"date",class:"w-full p-1 border rounded",onKeydown:[Ss(m,["esc"]),Ss(f,["enter"])]},null,544),[[Rs,s.value]])])),he("button",{onClick:Z=>a(U.id),class:To(["absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity",{"opacity-100":E.value===U.id}])}," ❌ ",10,pA)])],40,lA))),128)),he("th",mA,[he("button",{onClick:B[3]||(B[3]=U=>R.value=!0),class:"text-gray-500 hover:text-blue-500",title:"Ajouter un nouvel événement"}," ➕ ")])]),he("tr",gA,[B[8]||(B[8]=he("th",{class:"p-3 text-left"},null,-1)),B[9]||(B[9]=he("th",{class:"p-3 text-center"},null,-1)),(Me(!0),He(Tt,null,bs(G.value,U=>(Me(),He("th",{key:U.id,class:"p-3 text-center w-48"},[he("button",{onClick:Z=>A(U.id,6),class:"px-2 py-1 rounded-md text-sm bg-white hover:bg-gray-50 hover:border-gray-200 border shadow text-gray-800"}," 🎭 Sélectionner ",8,_A)]))),128)),B[10]||(B[10]=he("th",{class:"p-3 text-center"},null,-1))])]),he("tbody",yA,[(Me(!0),He(Tt,null,bs(Q.value,U=>(Me(),He("tr",{key:U.id,class:"odd:bg-white even:bg-gray-50 border-b"},[he("td",vA,Tr(U.name),1),he("td",EA,[he("span",{title:`${y(U.name)} sélection${y(U.name)>1?"s":""}, ${je(U.name)} dispo${je(U.name)>1?"s":""}`},Tr(y(U.name))+"/"+Tr(je(U.name)),9,TA)]),(Me(!0),He(Tt,null,bs(G.value,Z=>(Me(),He("td",{key:Z.id,class:"p-3 text-center cursor-pointer hover:bg-blue-100",onClick:Qe=>g(U.name,Z.id)},[T(U.name,Z.id)?(Me(),He("span",{key:0,title:st(U,Z.id)}," 🎭 ",8,wA)):v(U.name,Z.id)?(Me(),He("span",{key:1,title:st(U,Z.id)}," ✅ ",8,AA)):v(U.name,Z.id)===!1?(Me(),He("span",{key:2,title:st(U,Z.id)}," ❌ ",8,bA)):(Me(),He("span",{key:3,title:st(U,Z.id)}," – ",8,RA))],8,IA))),128)),B[11]||(B[11]=he("td",{class:"p-3 text-center"},null,-1))]))),128))])]),R.value?(Me(),He("div",SA,[he("div",PA,[B[15]||(B[15]=he("h2",{class:"text-lg font-bold mb-2"},"Créer un nouvel événement",-1)),he("form",{onSubmit:sy(F,["prevent"])},[he("div",CA,[B[12]||(B[12]=he("label",{for:"title",class:"block text-sm font-medium mb-1"},"Titre de l'événement",-1)),As(he("input",{id:"title","onUpdate:modelValue":B[4]||(B[4]=U=>k.value=U),type:"text",class:"block w-full p-2 border border-gray-300 rounded-lg"},null,512),[[Rs,k.value]])]),he("div",kA,[B[13]||(B[13]=he("label",{for:"date",class:"block text-sm font-medium mb-1"},"Date de l'événement",-1)),As(he("input",{id:"date","onUpdate:modelValue":B[5]||(B[5]=U=>O.value=U),type:"date",class:"block w-full p-2 border border-gray-300 rounded-lg"},null,512),[[Rs,O.value]])]),he("div",{class:"flex justify-between"},[he("button",{onClick:Y,class:"px-4 py-2 bg-gray-200 rounded-lg text-sm"},"Annuler"),B[14]||(B[14]=he("button",{type:"submit",class:"px-4 py-2 bg-blue-500 rounded-lg text-sm text-white"},"Créer",-1))])],32)])])):Su("",!0),e.value?(Me(),He("div",DA,[he("div",{class:"bg-white rounded-lg p-4 w-96"},[B[16]||(B[16]=he("h2",{class:"text-lg font-bold mb-2"},"Supprimer l'événement",-1)),B[17]||(B[17]=he("p",null,"Êtes-vous sûr de vouloir supprimer l'événement ?",-1)),he("div",{class:"flex justify-between"},[he("button",{onClick:c,class:"px-4 py-2 bg-gray-200 rounded-lg text-sm"},"Annuler"),he("button",{onClick:l,class:"px-4 py-2 bg-red-500 rounded-lg text-sm text-white"},"Supprimer")])])])):Su("",!0)],64))}}),NA={__name:"App",setup(n){return(e,t)=>(Me(),nf(VA))}};cy(NA).mount("#app");
