(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();/**
* @vue/shared v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**//*! #__NO_SIDE_EFFECTS__ */function ic(t){const e=Object.create(null);for(const n of t.split(","))e[n]=1;return n=>n in e}const He={},Gr=[],Yt=()=>{},m_=()=>!1,Wo=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&(t.charCodeAt(2)>122||t.charCodeAt(2)<97),oc=t=>t.startsWith("onUpdate:"),ct=Object.assign,ac=(t,e)=>{const n=t.indexOf(e);n>-1&&t.splice(n,1)},g_=Object.prototype.hasOwnProperty,Le=(t,e)=>g_.call(t,e),de=Array.isArray,Qr=t=>Go(t)==="[object Map]",_f=t=>Go(t)==="[object Set]",me=t=>typeof t=="function",it=t=>typeof t=="string",cr=t=>typeof t=="symbol",Je=t=>t!==null&&typeof t=="object",yf=t=>(Je(t)||me(t))&&me(t.then)&&me(t.catch),vf=Object.prototype.toString,Go=t=>vf.call(t),__=t=>Go(t).slice(8,-1),wf=t=>Go(t)==="[object Object]",lc=t=>it(t)&&t!=="NaN"&&t[0]!=="-"&&""+parseInt(t,10)===t,$s=ic(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Qo=t=>{const e=Object.create(null);return n=>e[n]||(e[n]=t(n))},y_=/-(\w)/g,Kt=Qo(t=>t.replace(y_,(e,n)=>n?n.toUpperCase():"")),v_=/\B([A-Z])/g,ur=Qo(t=>t.replace(v_,"-$1").toLowerCase()),Jo=Qo(t=>t.charAt(0).toUpperCase()+t.slice(1)),Ka=Qo(t=>t?`on${Jo(t)}`:""),Qn=(t,e)=>!Object.is(t,e),lo=(t,...e)=>{for(let n=0;n<t.length;n++)t[n](...e)},wl=(t,e,n,r=!1)=>{Object.defineProperty(t,e,{configurable:!0,enumerable:!1,writable:r,value:n})},El=t=>{const e=parseFloat(t);return isNaN(e)?t:e};let lh;const Yo=()=>lh||(lh=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function ni(t){if(de(t)){const e={};for(let n=0;n<t.length;n++){const r=t[n],s=it(r)?I_(r):ni(r);if(s)for(const i in s)e[i]=s[i]}return e}else if(it(t)||Je(t))return t}const w_=/;(?![^(]*\))/g,E_=/:([^]+)/,T_=/\/\*[^]*?\*\//g;function I_(t){const e={};return t.replace(T_,"").split(w_).forEach(n=>{if(n){const r=n.split(E_);r.length>1&&(e[r[0].trim()]=r[1].trim())}}),e}function ri(t){let e="";if(it(t))e=t;else if(de(t))for(let n=0;n<t.length;n++){const r=ri(t[n]);r&&(e+=r+" ")}else if(Je(t))for(const n in t)t[n]&&(e+=n+" ");return e.trim()}const b_="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",A_=ic(b_);function Ef(t){return!!t||t===""}const Tf=t=>!!(t&&t.__v_isRef===!0),rn=t=>it(t)?t:t==null?"":de(t)||Je(t)&&(t.toString===vf||!me(t.toString))?Tf(t)?rn(t.value):JSON.stringify(t,If,2):String(t),If=(t,e)=>Tf(e)?If(t,e.value):Qr(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((n,[r,s],i)=>(n[Wa(r,i)+" =>"]=s,n),{})}:_f(e)?{[`Set(${e.size})`]:[...e.values()].map(n=>Wa(n))}:cr(e)?Wa(e):Je(e)&&!de(e)&&!wf(e)?String(e):e,Wa=(t,e="")=>{var n;return cr(t)?`Symbol(${(n=t.description)!=null?n:e})`:t};/**
* @vue/reactivity v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Dt;class R_{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=Dt,!e&&Dt&&(this.index=(Dt.scopes||(Dt.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].pause();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].resume();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].resume()}}run(e){if(this._active){const n=Dt;try{return Dt=this,e()}finally{Dt=n}}}on(){++this._on===1&&(this.prevScope=Dt,Dt=this)}off(){this._on>0&&--this._on===0&&(Dt=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let n,r;for(n=0,r=this.effects.length;n<r;n++)this.effects[n].stop();for(this.effects.length=0,n=0,r=this.cleanups.length;n<r;n++)this.cleanups[n]();if(this.cleanups.length=0,this.scopes){for(n=0,r=this.scopes.length;n<r;n++)this.scopes[n].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function S_(){return Dt}let ze;const Ga=new WeakSet;class bf{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Dt&&Dt.active&&Dt.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Ga.has(this)&&(Ga.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Rf(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,ch(this),Sf(this);const e=ze,n=Xt;ze=this,Xt=!0;try{return this.fn()}finally{Pf(this),ze=e,Xt=n,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)hc(e);this.deps=this.depsTail=void 0,ch(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Ga.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Tl(this)&&this.run()}get dirty(){return Tl(this)}}let Af=0,qs,Hs;function Rf(t,e=!1){if(t.flags|=8,e){t.next=Hs,Hs=t;return}t.next=qs,qs=t}function cc(){Af++}function uc(){if(--Af>0)return;if(Hs){let e=Hs;for(Hs=void 0;e;){const n=e.next;e.next=void 0,e.flags&=-9,e=n}}let t;for(;qs;){let e=qs;for(qs=void 0;e;){const n=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(r){t||(t=r)}e=n}}if(t)throw t}function Sf(t){for(let e=t.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function Pf(t){let e,n=t.depsTail,r=n;for(;r;){const s=r.prevDep;r.version===-1?(r===n&&(n=s),hc(r),P_(r)):e=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=s}t.deps=e,t.depsTail=n}function Tl(t){for(let e=t.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(Cf(e.dep.computed)||e.dep.version!==e.version))return!0;return!!t._dirty}function Cf(t){if(t.flags&4&&!(t.flags&16)||(t.flags&=-17,t.globalVersion===si)||(t.globalVersion=si,!t.isSSR&&t.flags&128&&(!t.deps&&!t._dirty||!Tl(t))))return;t.flags|=2;const e=t.dep,n=ze,r=Xt;ze=t,Xt=!0;try{Sf(t);const s=t.fn(t._value);(e.version===0||Qn(s,t._value))&&(t.flags|=128,t._value=s,e.version++)}catch(s){throw e.version++,s}finally{ze=n,Xt=r,Pf(t),t.flags&=-3}}function hc(t,e=!1){const{dep:n,prevSub:r,nextSub:s}=t;if(r&&(r.nextSub=s,t.prevSub=void 0),s&&(s.prevSub=r,t.nextSub=void 0),n.subs===t&&(n.subs=r,!r&&n.computed)){n.computed.flags&=-5;for(let i=n.computed.deps;i;i=i.nextDep)hc(i,!0)}!e&&!--n.sc&&n.map&&n.map.delete(n.key)}function P_(t){const{prevDep:e,nextDep:n}=t;e&&(e.nextDep=n,t.prevDep=void 0),n&&(n.prevDep=e,t.nextDep=void 0)}let Xt=!0;const xf=[];function An(){xf.push(Xt),Xt=!1}function Rn(){const t=xf.pop();Xt=t===void 0?!0:t}function ch(t){const{cleanup:e}=t;if(t.cleanup=void 0,e){const n=ze;ze=void 0;try{e()}finally{ze=n}}}let si=0;class C_{constructor(e,n){this.sub=e,this.dep=n,this.version=n.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class dc{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!ze||!Xt||ze===this.computed)return;let n=this.activeLink;if(n===void 0||n.sub!==ze)n=this.activeLink=new C_(ze,this),ze.deps?(n.prevDep=ze.depsTail,ze.depsTail.nextDep=n,ze.depsTail=n):ze.deps=ze.depsTail=n,kf(n);else if(n.version===-1&&(n.version=this.version,n.nextDep)){const r=n.nextDep;r.prevDep=n.prevDep,n.prevDep&&(n.prevDep.nextDep=r),n.prevDep=ze.depsTail,n.nextDep=void 0,ze.depsTail.nextDep=n,ze.depsTail=n,ze.deps===n&&(ze.deps=r)}return n}trigger(e){this.version++,si++,this.notify(e)}notify(e){cc();try{for(let n=this.subs;n;n=n.prevSub)n.sub.notify()&&n.sub.dep.notify()}finally{uc()}}}function kf(t){if(t.dep.sc++,t.sub.flags&4){const e=t.dep.computed;if(e&&!t.dep.subs){e.flags|=20;for(let r=e.deps;r;r=r.nextDep)kf(r)}const n=t.dep.subs;n!==t&&(t.prevSub=n,n&&(n.nextSub=t)),t.dep.subs=t}}const Il=new WeakMap,Ir=Symbol(""),bl=Symbol(""),ii=Symbol("");function Tt(t,e,n){if(Xt&&ze){let r=Il.get(t);r||Il.set(t,r=new Map);let s=r.get(n);s||(r.set(n,s=new dc),s.map=r,s.key=n),s.track()}}function vn(t,e,n,r,s,i){const a=Il.get(t);if(!a){si++;return}const l=c=>{c&&c.trigger()};if(cc(),e==="clear")a.forEach(l);else{const c=de(t),h=c&&lc(n);if(c&&n==="length"){const d=Number(r);a.forEach((p,g)=>{(g==="length"||g===ii||!cr(g)&&g>=d)&&l(p)})}else switch((n!==void 0||a.has(void 0))&&l(a.get(n)),h&&l(a.get(ii)),e){case"add":c?h&&l(a.get("length")):(l(a.get(Ir)),Qr(t)&&l(a.get(bl)));break;case"delete":c||(l(a.get(Ir)),Qr(t)&&l(a.get(bl)));break;case"set":Qr(t)&&l(a.get(Ir));break}}uc()}function Ur(t){const e=Me(t);return e===t?e:(Tt(e,"iterate",ii),zt(t)?e:e.map(pt))}function Xo(t){return Tt(t=Me(t),"iterate",ii),t}const x_={__proto__:null,[Symbol.iterator](){return Qa(this,Symbol.iterator,pt)},concat(...t){return Ur(this).concat(...t.map(e=>de(e)?Ur(e):e))},entries(){return Qa(this,"entries",t=>(t[1]=pt(t[1]),t))},every(t,e){return mn(this,"every",t,e,void 0,arguments)},filter(t,e){return mn(this,"filter",t,e,n=>n.map(pt),arguments)},find(t,e){return mn(this,"find",t,e,pt,arguments)},findIndex(t,e){return mn(this,"findIndex",t,e,void 0,arguments)},findLast(t,e){return mn(this,"findLast",t,e,pt,arguments)},findLastIndex(t,e){return mn(this,"findLastIndex",t,e,void 0,arguments)},forEach(t,e){return mn(this,"forEach",t,e,void 0,arguments)},includes(...t){return Ja(this,"includes",t)},indexOf(...t){return Ja(this,"indexOf",t)},join(t){return Ur(this).join(t)},lastIndexOf(...t){return Ja(this,"lastIndexOf",t)},map(t,e){return mn(this,"map",t,e,void 0,arguments)},pop(){return Ns(this,"pop")},push(...t){return Ns(this,"push",t)},reduce(t,...e){return uh(this,"reduce",t,e)},reduceRight(t,...e){return uh(this,"reduceRight",t,e)},shift(){return Ns(this,"shift")},some(t,e){return mn(this,"some",t,e,void 0,arguments)},splice(...t){return Ns(this,"splice",t)},toReversed(){return Ur(this).toReversed()},toSorted(t){return Ur(this).toSorted(t)},toSpliced(...t){return Ur(this).toSpliced(...t)},unshift(...t){return Ns(this,"unshift",t)},values(){return Qa(this,"values",pt)}};function Qa(t,e,n){const r=Xo(t),s=r[e]();return r!==t&&!zt(t)&&(s._next=s.next,s.next=()=>{const i=s._next();return i.value&&(i.value=n(i.value)),i}),s}const k_=Array.prototype;function mn(t,e,n,r,s,i){const a=Xo(t),l=a!==t&&!zt(t),c=a[e];if(c!==k_[e]){const p=c.apply(t,i);return l?pt(p):p}let h=n;a!==t&&(l?h=function(p,g){return n.call(this,pt(p),g,t)}:n.length>2&&(h=function(p,g){return n.call(this,p,g,t)}));const d=c.call(a,h,r);return l&&s?s(d):d}function uh(t,e,n,r){const s=Xo(t);let i=n;return s!==t&&(zt(t)?n.length>3&&(i=function(a,l,c){return n.call(this,a,l,c,t)}):i=function(a,l,c){return n.call(this,a,pt(l),c,t)}),s[e](i,...r)}function Ja(t,e,n){const r=Me(t);Tt(r,"iterate",ii);const s=r[e](...n);return(s===-1||s===!1)&&mc(n[0])?(n[0]=Me(n[0]),r[e](...n)):s}function Ns(t,e,n=[]){An(),cc();const r=Me(t)[e].apply(t,n);return uc(),Rn(),r}const D_=ic("__proto__,__v_isRef,__isVue"),Df=new Set(Object.getOwnPropertyNames(Symbol).filter(t=>t!=="arguments"&&t!=="caller").map(t=>Symbol[t]).filter(cr));function V_(t){cr(t)||(t=String(t));const e=Me(this);return Tt(e,"has",t),e.hasOwnProperty(t)}class Vf{constructor(e=!1,n=!1){this._isReadonly=e,this._isShallow=n}get(e,n,r){if(n==="__v_skip")return e.__v_skip;const s=this._isReadonly,i=this._isShallow;if(n==="__v_isReactive")return!s;if(n==="__v_isReadonly")return s;if(n==="__v_isShallow")return i;if(n==="__v_raw")return r===(s?i?q_:Lf:i?Mf:Of).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(r)?e:void 0;const a=de(e);if(!s){let c;if(a&&(c=x_[n]))return c;if(n==="hasOwnProperty")return V_}const l=Reflect.get(e,n,At(e)?e:r);return(cr(n)?Df.has(n):D_(n))||(s||Tt(e,"get",n),i)?l:At(l)?a&&lc(n)?l:l.value:Je(l)?s?Uf(l):Zo(l):l}}class Nf extends Vf{constructor(e=!1){super(!1,e)}set(e,n,r,s){let i=e[n];if(!this._isShallow){const c=nr(i);if(!zt(r)&&!nr(r)&&(i=Me(i),r=Me(r)),!de(e)&&At(i)&&!At(r))return c?!1:(i.value=r,!0)}const a=de(e)&&lc(n)?Number(n)<e.length:Le(e,n),l=Reflect.set(e,n,r,At(e)?e:s);return e===Me(s)&&(a?Qn(r,i)&&vn(e,"set",n,r):vn(e,"add",n,r)),l}deleteProperty(e,n){const r=Le(e,n);e[n];const s=Reflect.deleteProperty(e,n);return s&&r&&vn(e,"delete",n,void 0),s}has(e,n){const r=Reflect.has(e,n);return(!cr(n)||!Df.has(n))&&Tt(e,"has",n),r}ownKeys(e){return Tt(e,"iterate",de(e)?"length":Ir),Reflect.ownKeys(e)}}class N_ extends Vf{constructor(e=!1){super(!0,e)}set(e,n){return!0}deleteProperty(e,n){return!0}}const O_=new Nf,M_=new N_,L_=new Nf(!0);const Al=t=>t,Yi=t=>Reflect.getPrototypeOf(t);function F_(t,e,n){return function(...r){const s=this.__v_raw,i=Me(s),a=Qr(i),l=t==="entries"||t===Symbol.iterator&&a,c=t==="keys"&&a,h=s[t](...r),d=n?Al:e?bo:pt;return!e&&Tt(i,"iterate",c?bl:Ir),{next(){const{value:p,done:g}=h.next();return g?{value:p,done:g}:{value:l?[d(p[0]),d(p[1])]:d(p),done:g}},[Symbol.iterator](){return this}}}}function Xi(t){return function(...e){return t==="delete"?!1:t==="clear"?void 0:this}}function U_(t,e){const n={get(s){const i=this.__v_raw,a=Me(i),l=Me(s);t||(Qn(s,l)&&Tt(a,"get",s),Tt(a,"get",l));const{has:c}=Yi(a),h=e?Al:t?bo:pt;if(c.call(a,s))return h(i.get(s));if(c.call(a,l))return h(i.get(l));i!==a&&i.get(s)},get size(){const s=this.__v_raw;return!t&&Tt(Me(s),"iterate",Ir),Reflect.get(s,"size",s)},has(s){const i=this.__v_raw,a=Me(i),l=Me(s);return t||(Qn(s,l)&&Tt(a,"has",s),Tt(a,"has",l)),s===l?i.has(s):i.has(s)||i.has(l)},forEach(s,i){const a=this,l=a.__v_raw,c=Me(l),h=e?Al:t?bo:pt;return!t&&Tt(c,"iterate",Ir),l.forEach((d,p)=>s.call(i,h(d),h(p),a))}};return ct(n,t?{add:Xi("add"),set:Xi("set"),delete:Xi("delete"),clear:Xi("clear")}:{add(s){!e&&!zt(s)&&!nr(s)&&(s=Me(s));const i=Me(this);return Yi(i).has.call(i,s)||(i.add(s),vn(i,"add",s,s)),this},set(s,i){!e&&!zt(i)&&!nr(i)&&(i=Me(i));const a=Me(this),{has:l,get:c}=Yi(a);let h=l.call(a,s);h||(s=Me(s),h=l.call(a,s));const d=c.call(a,s);return a.set(s,i),h?Qn(i,d)&&vn(a,"set",s,i):vn(a,"add",s,i),this},delete(s){const i=Me(this),{has:a,get:l}=Yi(i);let c=a.call(i,s);c||(s=Me(s),c=a.call(i,s)),l&&l.call(i,s);const h=i.delete(s);return c&&vn(i,"delete",s,void 0),h},clear(){const s=Me(this),i=s.size!==0,a=s.clear();return i&&vn(s,"clear",void 0,void 0),a}}),["keys","values","entries",Symbol.iterator].forEach(s=>{n[s]=F_(s,t,e)}),n}function fc(t,e){const n=U_(t,e);return(r,s,i)=>s==="__v_isReactive"?!t:s==="__v_isReadonly"?t:s==="__v_raw"?r:Reflect.get(Le(n,s)&&s in r?n:r,s,i)}const j_={get:fc(!1,!1)},B_={get:fc(!1,!0)},$_={get:fc(!0,!1)};const Of=new WeakMap,Mf=new WeakMap,Lf=new WeakMap,q_=new WeakMap;function H_(t){switch(t){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function z_(t){return t.__v_skip||!Object.isExtensible(t)?0:H_(__(t))}function Zo(t){return nr(t)?t:pc(t,!1,O_,j_,Of)}function Ff(t){return pc(t,!1,L_,B_,Mf)}function Uf(t){return pc(t,!0,M_,$_,Lf)}function pc(t,e,n,r,s){if(!Je(t)||t.__v_raw&&!(e&&t.__v_isReactive))return t;const i=z_(t);if(i===0)return t;const a=s.get(t);if(a)return a;const l=new Proxy(t,i===2?r:n);return s.set(t,l),l}function Jr(t){return nr(t)?Jr(t.__v_raw):!!(t&&t.__v_isReactive)}function nr(t){return!!(t&&t.__v_isReadonly)}function zt(t){return!!(t&&t.__v_isShallow)}function mc(t){return t?!!t.__v_raw:!1}function Me(t){const e=t&&t.__v_raw;return e?Me(e):t}function K_(t){return!Le(t,"__v_skip")&&Object.isExtensible(t)&&wl(t,"__v_skip",!0),t}const pt=t=>Je(t)?Zo(t):t,bo=t=>Je(t)?Uf(t):t;function At(t){return t?t.__v_isRef===!0:!1}function Se(t){return jf(t,!1)}function W_(t){return jf(t,!0)}function jf(t,e){return At(t)?t:new G_(t,e)}class G_{constructor(e,n){this.dep=new dc,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=n?e:Me(e),this._value=n?e:pt(e),this.__v_isShallow=n}get value(){return this.dep.track(),this._value}set value(e){const n=this._rawValue,r=this.__v_isShallow||zt(e)||nr(e);e=r?e:Me(e),Qn(e,n)&&(this._rawValue=e,this._value=r?e:pt(e),this.dep.trigger())}}function Yr(t){return At(t)?t.value:t}const Q_={get:(t,e,n)=>e==="__v_raw"?t:Yr(Reflect.get(t,e,n)),set:(t,e,n,r)=>{const s=t[e];return At(s)&&!At(n)?(s.value=n,!0):Reflect.set(t,e,n,r)}};function Bf(t){return Jr(t)?t:new Proxy(t,Q_)}class J_{constructor(e,n,r){this.fn=e,this.setter=n,this._value=void 0,this.dep=new dc(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=si-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!n,this.isSSR=r}notify(){if(this.flags|=16,!(this.flags&8)&&ze!==this)return Rf(this,!0),!0}get value(){const e=this.dep.track();return Cf(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function Y_(t,e,n=!1){let r,s;return me(t)?r=t:(r=t.get,s=t.set),new J_(r,s,n)}const Zi={},Ao=new WeakMap;let vr;function X_(t,e=!1,n=vr){if(n){let r=Ao.get(n);r||Ao.set(n,r=[]),r.push(t)}}function Z_(t,e,n=He){const{immediate:r,deep:s,once:i,scheduler:a,augmentJob:l,call:c}=n,h=J=>s?J:zt(J)||s===!1||s===0?wn(J,1):wn(J);let d,p,g,y,D=!1,O=!1;if(At(t)?(p=()=>t.value,D=zt(t)):Jr(t)?(p=()=>h(t),D=!0):de(t)?(O=!0,D=t.some(J=>Jr(J)||zt(J)),p=()=>t.map(J=>{if(At(J))return J.value;if(Jr(J))return h(J);if(me(J))return c?c(J,2):J()})):me(t)?e?p=c?()=>c(t,2):t:p=()=>{if(g){An();try{g()}finally{Rn()}}const J=vr;vr=d;try{return c?c(t,3,[y]):t(y)}finally{vr=J}}:p=Yt,e&&s){const J=p,ge=s===!0?1/0:s;p=()=>wn(J(),ge)}const x=S_(),q=()=>{d.stop(),x&&x.active&&ac(x.effects,d)};if(i&&e){const J=e;e=(...ge)=>{J(...ge),q()}}let j=O?new Array(t.length).fill(Zi):Zi;const G=J=>{if(!(!(d.flags&1)||!d.dirty&&!J))if(e){const ge=d.run();if(s||D||(O?ge.some((_e,I)=>Qn(_e,j[I])):Qn(ge,j))){g&&g();const _e=vr;vr=d;try{const I=[ge,j===Zi?void 0:O&&j[0]===Zi?[]:j,y];j=ge,c?c(e,3,I):e(...I)}finally{vr=_e}}}else d.run()};return l&&l(G),d=new bf(p),d.scheduler=a?()=>a(G,!1):G,y=J=>X_(J,!1,d),g=d.onStop=()=>{const J=Ao.get(d);if(J){if(c)c(J,4);else for(const ge of J)ge();Ao.delete(d)}},e?r?G(!0):j=d.run():a?a(G.bind(null,!0),!0):d.run(),q.pause=d.pause.bind(d),q.resume=d.resume.bind(d),q.stop=q,q}function wn(t,e=1/0,n){if(e<=0||!Je(t)||t.__v_skip||(n=n||new Set,n.has(t)))return t;if(n.add(t),e--,At(t))wn(t.value,e,n);else if(de(t))for(let r=0;r<t.length;r++)wn(t[r],e,n);else if(_f(t)||Qr(t))t.forEach(r=>{wn(r,e,n)});else if(wf(t)){for(const r in t)wn(t[r],e,n);for(const r of Object.getOwnPropertySymbols(t))Object.prototype.propertyIsEnumerable.call(t,r)&&wn(t[r],e,n)}return t}/**
* @vue/runtime-core v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function Ei(t,e,n,r){try{return r?t(...r):t()}catch(s){ea(s,e,n)}}function hn(t,e,n,r){if(me(t)){const s=Ei(t,e,n,r);return s&&yf(s)&&s.catch(i=>{ea(i,e,n)}),s}if(de(t)){const s=[];for(let i=0;i<t.length;i++)s.push(hn(t[i],e,n,r));return s}}function ea(t,e,n,r=!0){const s=e?e.vnode:null,{errorHandler:i,throwUnhandledErrorInProduction:a}=e&&e.appContext.config||He;if(e){let l=e.parent;const c=e.proxy,h=`https://vuejs.org/error-reference/#runtime-${n}`;for(;l;){const d=l.ec;if(d){for(let p=0;p<d.length;p++)if(d[p](t,c,h)===!1)return}l=l.parent}if(i){An(),Ei(i,null,10,[t,c,h]),Rn();return}}ey(t,n,s,r,a)}function ey(t,e,n,r=!0,s=!1){if(s)throw t;console.error(t)}const xt=[];let nn=-1;const Xr=[];let Un=null,Br=0;const $f=Promise.resolve();let Ro=null;function gc(t){const e=Ro||$f;return t?e.then(this?t.bind(this):t):e}function ty(t){let e=nn+1,n=xt.length;for(;e<n;){const r=e+n>>>1,s=xt[r],i=oi(s);i<t||i===t&&s.flags&2?e=r+1:n=r}return e}function _c(t){if(!(t.flags&1)){const e=oi(t),n=xt[xt.length-1];!n||!(t.flags&2)&&e>=oi(n)?xt.push(t):xt.splice(ty(e),0,t),t.flags|=1,qf()}}function qf(){Ro||(Ro=$f.then(zf))}function ny(t){de(t)?Xr.push(...t):Un&&t.id===-1?Un.splice(Br+1,0,t):t.flags&1||(Xr.push(t),t.flags|=1),qf()}function hh(t,e,n=nn+1){for(;n<xt.length;n++){const r=xt[n];if(r&&r.flags&2){if(t&&r.id!==t.uid)continue;xt.splice(n,1),n--,r.flags&4&&(r.flags&=-2),r(),r.flags&4||(r.flags&=-2)}}}function Hf(t){if(Xr.length){const e=[...new Set(Xr)].sort((n,r)=>oi(n)-oi(r));if(Xr.length=0,Un){Un.push(...e);return}for(Un=e,Br=0;Br<Un.length;Br++){const n=Un[Br];n.flags&4&&(n.flags&=-2),n.flags&8||n(),n.flags&=-2}Un=null,Br=0}}const oi=t=>t.id==null?t.flags&2?-1:1/0:t.id;function zf(t){const e=Yt;try{for(nn=0;nn<xt.length;nn++){const n=xt[nn];n&&!(n.flags&8)&&(n.flags&4&&(n.flags&=-2),Ei(n,n.i,n.i?15:14),n.flags&4||(n.flags&=-2))}}finally{for(;nn<xt.length;nn++){const n=xt[nn];n&&(n.flags&=-2)}nn=-1,xt.length=0,Hf(),Ro=null,(xt.length||Xr.length)&&zf()}}let Ft=null,Kf=null;function So(t){const e=Ft;return Ft=t,Kf=t&&t.type.__scopeId||null,e}function ry(t,e=Ft,n){if(!e||t._n)return t;const r=(...s)=>{r._d&&wh(-1);const i=So(e);let a;try{a=t(...s)}finally{So(i),r._d&&wh(1)}return a};return r._n=!0,r._c=!0,r._d=!0,r}function jn(t,e){if(Ft===null)return t;const n=sa(Ft),r=t.dirs||(t.dirs=[]);for(let s=0;s<e.length;s++){let[i,a,l,c=He]=e[s];i&&(me(i)&&(i={mounted:i,updated:i}),i.deep&&wn(a),r.push({dir:i,instance:n,value:a,oldValue:void 0,arg:l,modifiers:c}))}return t}function _r(t,e,n,r){const s=t.dirs,i=e&&e.dirs;for(let a=0;a<s.length;a++){const l=s[a];i&&(l.oldValue=i[a].value);let c=l.dir[r];c&&(An(),hn(c,n,8,[t.el,l,t,e]),Rn())}}const sy=Symbol("_vte"),iy=t=>t.__isTeleport;function yc(t,e){t.shapeFlag&6&&t.component?(t.transition=e,yc(t.component.subTree,e)):t.shapeFlag&128?(t.ssContent.transition=e.clone(t.ssContent),t.ssFallback.transition=e.clone(t.ssFallback)):t.transition=e}/*! #__NO_SIDE_EFFECTS__ */function Wf(t,e){return me(t)?(()=>ct({name:t.name},e,{setup:t}))():t}function Gf(t){t.ids=[t.ids[0]+t.ids[2]+++"-",0,0]}function zs(t,e,n,r,s=!1){if(de(t)){t.forEach((D,O)=>zs(D,e&&(de(e)?e[O]:e),n,r,s));return}if(Ks(r)&&!s){r.shapeFlag&512&&r.type.__asyncResolved&&r.component.subTree.component&&zs(t,e,n,r.component.subTree);return}const i=r.shapeFlag&4?sa(r.component):r.el,a=s?null:i,{i:l,r:c}=t,h=e&&e.r,d=l.refs===He?l.refs={}:l.refs,p=l.setupState,g=Me(p),y=p===He?()=>!1:D=>Le(g,D);if(h!=null&&h!==c&&(it(h)?(d[h]=null,y(h)&&(p[h]=null)):At(h)&&(h.value=null)),me(c))Ei(c,l,12,[a,d]);else{const D=it(c),O=At(c);if(D||O){const x=()=>{if(t.f){const q=D?y(c)?p[c]:d[c]:c.value;s?de(q)&&ac(q,i):de(q)?q.includes(i)||q.push(i):D?(d[c]=[i],y(c)&&(p[c]=d[c])):(c.value=[i],t.k&&(d[t.k]=c.value))}else D?(d[c]=a,y(c)&&(p[c]=a)):O&&(c.value=a,t.k&&(d[t.k]=a))};a?(x.id=-1,Lt(x,n)):x()}}}Yo().requestIdleCallback;Yo().cancelIdleCallback;const Ks=t=>!!t.type.__asyncLoader,Qf=t=>t.type.__isKeepAlive;function oy(t,e){Jf(t,"a",e)}function ay(t,e){Jf(t,"da",e)}function Jf(t,e,n=bt){const r=t.__wdc||(t.__wdc=()=>{let s=n;for(;s;){if(s.isDeactivated)return;s=s.parent}return t()});if(ta(e,r,n),n){let s=n.parent;for(;s&&s.parent;)Qf(s.parent.vnode)&&ly(r,e,n,s),s=s.parent}}function ly(t,e,n,r){const s=ta(e,t,r,!0);Yf(()=>{ac(r[e],s)},n)}function ta(t,e,n=bt,r=!1){if(n){const s=n[t]||(n[t]=[]),i=e.__weh||(e.__weh=(...a)=>{An();const l=Ti(n),c=hn(e,n,t,a);return l(),Rn(),c});return r?s.unshift(i):s.push(i),i}}const Dn=t=>(e,n=bt)=>{(!li||t==="sp")&&ta(t,(...r)=>e(...r),n)},cy=Dn("bm"),vc=Dn("m"),uy=Dn("bu"),hy=Dn("u"),dy=Dn("bum"),Yf=Dn("um"),fy=Dn("sp"),py=Dn("rtg"),my=Dn("rtc");function gy(t,e=bt){ta("ec",t,e)}const Xf="components";function _y(t,e){return vy(Xf,t,!0,e)||t}const yy=Symbol.for("v-ndc");function vy(t,e,n=!0,r=!1){const s=Ft||bt;if(s){const i=s.type;if(t===Xf){const l=ov(i,!1);if(l&&(l===e||l===Kt(e)||l===Jo(Kt(e))))return i}const a=dh(s[t]||i[t],e)||dh(s.appContext[t],e);return!a&&r?i:a}}function dh(t,e){return t&&(t[e]||t[Kt(e)]||t[Jo(Kt(e))])}function wr(t,e,n,r){let s;const i=n&&n[r],a=de(t);if(a||it(t)){const l=a&&Jr(t);let c=!1,h=!1;l&&(c=!zt(t),h=nr(t),t=Xo(t)),s=new Array(t.length);for(let d=0,p=t.length;d<p;d++)s[d]=e(c?h?bo(pt(t[d])):pt(t[d]):t[d],d,void 0,i&&i[d])}else if(typeof t=="number"){s=new Array(t);for(let l=0;l<t;l++)s[l]=e(l+1,l,void 0,i&&i[l])}else if(Je(t))if(t[Symbol.iterator])s=Array.from(t,(l,c)=>e(l,c,void 0,i&&i[c]));else{const l=Object.keys(t);s=new Array(l.length);for(let c=0,h=l.length;c<h;c++){const d=l[c];s[c]=e(t[d],d,c,i&&i[c])}}else s=[];return n&&(n[r]=s),s}const Rl=t=>t?yp(t)?sa(t):Rl(t.parent):null,Ws=ct(Object.create(null),{$:t=>t,$el:t=>t.vnode.el,$data:t=>t.data,$props:t=>t.props,$attrs:t=>t.attrs,$slots:t=>t.slots,$refs:t=>t.refs,$parent:t=>Rl(t.parent),$root:t=>Rl(t.root),$host:t=>t.ce,$emit:t=>t.emit,$options:t=>wc(t),$forceUpdate:t=>t.f||(t.f=()=>{_c(t.update)}),$nextTick:t=>t.n||(t.n=gc.bind(t.proxy)),$watch:t=>jy.bind(t)}),Ya=(t,e)=>t!==He&&!t.__isScriptSetup&&Le(t,e),wy={get({_:t},e){if(e==="__v_skip")return!0;const{ctx:n,setupState:r,data:s,props:i,accessCache:a,type:l,appContext:c}=t;let h;if(e[0]!=="$"){const y=a[e];if(y!==void 0)switch(y){case 1:return r[e];case 2:return s[e];case 4:return n[e];case 3:return i[e]}else{if(Ya(r,e))return a[e]=1,r[e];if(s!==He&&Le(s,e))return a[e]=2,s[e];if((h=t.propsOptions[0])&&Le(h,e))return a[e]=3,i[e];if(n!==He&&Le(n,e))return a[e]=4,n[e];Sl&&(a[e]=0)}}const d=Ws[e];let p,g;if(d)return e==="$attrs"&&Tt(t.attrs,"get",""),d(t);if((p=l.__cssModules)&&(p=p[e]))return p;if(n!==He&&Le(n,e))return a[e]=4,n[e];if(g=c.config.globalProperties,Le(g,e))return g[e]},set({_:t},e,n){const{data:r,setupState:s,ctx:i}=t;return Ya(s,e)?(s[e]=n,!0):r!==He&&Le(r,e)?(r[e]=n,!0):Le(t.props,e)||e[0]==="$"&&e.slice(1)in t?!1:(i[e]=n,!0)},has({_:{data:t,setupState:e,accessCache:n,ctx:r,appContext:s,propsOptions:i}},a){let l;return!!n[a]||t!==He&&Le(t,a)||Ya(e,a)||(l=i[0])&&Le(l,a)||Le(r,a)||Le(Ws,a)||Le(s.config.globalProperties,a)},defineProperty(t,e,n){return n.get!=null?t._.accessCache[e]=0:Le(n,"value")&&this.set(t,e,n.value,null),Reflect.defineProperty(t,e,n)}};function fh(t){return de(t)?t.reduce((e,n)=>(e[n]=null,e),{}):t}let Sl=!0;function Ey(t){const e=wc(t),n=t.proxy,r=t.ctx;Sl=!1,e.beforeCreate&&ph(e.beforeCreate,t,"bc");const{data:s,computed:i,methods:a,watch:l,provide:c,inject:h,created:d,beforeMount:p,mounted:g,beforeUpdate:y,updated:D,activated:O,deactivated:x,beforeDestroy:q,beforeUnmount:j,destroyed:G,unmounted:J,render:ge,renderTracked:_e,renderTriggered:I,errorCaptured:v,serverPrefetch:T,expose:b,inheritAttrs:A,components:P,directives:E,filters:tt}=e;if(h&&Ty(h,r,null),a)for(const Te in a){const we=a[Te];me(we)&&(r[Te]=we.bind(n))}if(s){const Te=s.call(n,n);Je(Te)&&(t.data=Zo(Te))}if(Sl=!0,i)for(const Te in i){const we=i[Te],Ce=me(we)?we.bind(n,n):me(we.get)?we.get.bind(n,n):Yt,Fe=!me(we)&&me(we.set)?we.set.bind(n):Yt,$e=Qt({get:Ce,set:Fe});Object.defineProperty(r,Te,{enumerable:!0,configurable:!0,get:()=>$e.value,set:Ie=>$e.value=Ie})}if(l)for(const Te in l)Zf(l[Te],r,n,Te);if(c){const Te=me(c)?c.call(n):c;Reflect.ownKeys(Te).forEach(we=>{co(we,Te[we])})}d&&ph(d,t,"c");function Be(Te,we){de(we)?we.forEach(Ce=>Te(Ce.bind(n))):we&&Te(we.bind(n))}if(Be(cy,p),Be(vc,g),Be(uy,y),Be(hy,D),Be(oy,O),Be(ay,x),Be(gy,v),Be(my,_e),Be(py,I),Be(dy,j),Be(Yf,J),Be(fy,T),de(b))if(b.length){const Te=t.exposed||(t.exposed={});b.forEach(we=>{Object.defineProperty(Te,we,{get:()=>n[we],set:Ce=>n[we]=Ce})})}else t.exposed||(t.exposed={});ge&&t.render===Yt&&(t.render=ge),A!=null&&(t.inheritAttrs=A),P&&(t.components=P),E&&(t.directives=E),T&&Gf(t)}function Ty(t,e,n=Yt){de(t)&&(t=Pl(t));for(const r in t){const s=t[r];let i;Je(s)?"default"in s?i=on(s.from||r,s.default,!0):i=on(s.from||r):i=on(s),At(i)?Object.defineProperty(e,r,{enumerable:!0,configurable:!0,get:()=>i.value,set:a=>i.value=a}):e[r]=i}}function ph(t,e,n){hn(de(t)?t.map(r=>r.bind(e.proxy)):t.bind(e.proxy),e,n)}function Zf(t,e,n,r){let s=r.includes(".")?dp(n,r):()=>n[r];if(it(t)){const i=e[t];me(i)&&uo(s,i)}else if(me(t))uo(s,t.bind(n));else if(Je(t))if(de(t))t.forEach(i=>Zf(i,e,n,r));else{const i=me(t.handler)?t.handler.bind(n):e[t.handler];me(i)&&uo(s,i,t)}}function wc(t){const e=t.type,{mixins:n,extends:r}=e,{mixins:s,optionsCache:i,config:{optionMergeStrategies:a}}=t.appContext,l=i.get(e);let c;return l?c=l:!s.length&&!n&&!r?c=e:(c={},s.length&&s.forEach(h=>Po(c,h,a,!0)),Po(c,e,a)),Je(e)&&i.set(e,c),c}function Po(t,e,n,r=!1){const{mixins:s,extends:i}=e;i&&Po(t,i,n,!0),s&&s.forEach(a=>Po(t,a,n,!0));for(const a in e)if(!(r&&a==="expose")){const l=Iy[a]||n&&n[a];t[a]=l?l(t[a],e[a]):e[a]}return t}const Iy={data:mh,props:gh,emits:gh,methods:Fs,computed:Fs,beforeCreate:Ct,created:Ct,beforeMount:Ct,mounted:Ct,beforeUpdate:Ct,updated:Ct,beforeDestroy:Ct,beforeUnmount:Ct,destroyed:Ct,unmounted:Ct,activated:Ct,deactivated:Ct,errorCaptured:Ct,serverPrefetch:Ct,components:Fs,directives:Fs,watch:Ay,provide:mh,inject:by};function mh(t,e){return e?t?function(){return ct(me(t)?t.call(this,this):t,me(e)?e.call(this,this):e)}:e:t}function by(t,e){return Fs(Pl(t),Pl(e))}function Pl(t){if(de(t)){const e={};for(let n=0;n<t.length;n++)e[t[n]]=t[n];return e}return t}function Ct(t,e){return t?[...new Set([].concat(t,e))]:e}function Fs(t,e){return t?ct(Object.create(null),t,e):e}function gh(t,e){return t?de(t)&&de(e)?[...new Set([...t,...e])]:ct(Object.create(null),fh(t),fh(e??{})):e}function Ay(t,e){if(!t)return e;if(!e)return t;const n=ct(Object.create(null),t);for(const r in e)n[r]=Ct(t[r],e[r]);return n}function ep(){return{app:null,config:{isNativeTag:m_,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let Ry=0;function Sy(t,e){return function(r,s=null){me(r)||(r=ct({},r)),s!=null&&!Je(s)&&(s=null);const i=ep(),a=new WeakSet,l=[];let c=!1;const h=i.app={_uid:Ry++,_component:r,_props:s,_container:null,_context:i,_instance:null,version:lv,get config(){return i.config},set config(d){},use(d,...p){return a.has(d)||(d&&me(d.install)?(a.add(d),d.install(h,...p)):me(d)&&(a.add(d),d(h,...p))),h},mixin(d){return i.mixins.includes(d)||i.mixins.push(d),h},component(d,p){return p?(i.components[d]=p,h):i.components[d]},directive(d,p){return p?(i.directives[d]=p,h):i.directives[d]},mount(d,p,g){if(!c){const y=h._ceVNode||Nt(r,s);return y.appContext=i,g===!0?g="svg":g===!1&&(g=void 0),p&&e?e(y,d):t(y,d,g),c=!0,h._container=d,d.__vue_app__=h,sa(y.component)}},onUnmount(d){l.push(d)},unmount(){c&&(hn(l,h._instance,16),t(null,h._container),delete h._container.__vue_app__)},provide(d,p){return i.provides[d]=p,h},runWithContext(d){const p=Zr;Zr=h;try{return d()}finally{Zr=p}}};return h}}let Zr=null;function co(t,e){if(bt){let n=bt.provides;const r=bt.parent&&bt.parent.provides;r===n&&(n=bt.provides=Object.create(r)),n[t]=e}}function on(t,e,n=!1){const r=bt||Ft;if(r||Zr){let s=Zr?Zr._context.provides:r?r.parent==null||r.ce?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:void 0;if(s&&t in s)return s[t];if(arguments.length>1)return n&&me(e)?e.call(r&&r.proxy):e}}const tp={},np=()=>Object.create(tp),rp=t=>Object.getPrototypeOf(t)===tp;function Py(t,e,n,r=!1){const s={},i=np();t.propsDefaults=Object.create(null),sp(t,e,s,i);for(const a in t.propsOptions[0])a in s||(s[a]=void 0);n?t.props=r?s:Ff(s):t.type.props?t.props=s:t.props=i,t.attrs=i}function Cy(t,e,n,r){const{props:s,attrs:i,vnode:{patchFlag:a}}=t,l=Me(s),[c]=t.propsOptions;let h=!1;if((r||a>0)&&!(a&16)){if(a&8){const d=t.vnode.dynamicProps;for(let p=0;p<d.length;p++){let g=d[p];if(na(t.emitsOptions,g))continue;const y=e[g];if(c)if(Le(i,g))y!==i[g]&&(i[g]=y,h=!0);else{const D=Kt(g);s[D]=Cl(c,l,D,y,t,!1)}else y!==i[g]&&(i[g]=y,h=!0)}}}else{sp(t,e,s,i)&&(h=!0);let d;for(const p in l)(!e||!Le(e,p)&&((d=ur(p))===p||!Le(e,d)))&&(c?n&&(n[p]!==void 0||n[d]!==void 0)&&(s[p]=Cl(c,l,p,void 0,t,!0)):delete s[p]);if(i!==l)for(const p in i)(!e||!Le(e,p))&&(delete i[p],h=!0)}h&&vn(t.attrs,"set","")}function sp(t,e,n,r){const[s,i]=t.propsOptions;let a=!1,l;if(e)for(let c in e){if($s(c))continue;const h=e[c];let d;s&&Le(s,d=Kt(c))?!i||!i.includes(d)?n[d]=h:(l||(l={}))[d]=h:na(t.emitsOptions,c)||(!(c in r)||h!==r[c])&&(r[c]=h,a=!0)}if(i){const c=Me(n),h=l||He;for(let d=0;d<i.length;d++){const p=i[d];n[p]=Cl(s,c,p,h[p],t,!Le(h,p))}}return a}function Cl(t,e,n,r,s,i){const a=t[n];if(a!=null){const l=Le(a,"default");if(l&&r===void 0){const c=a.default;if(a.type!==Function&&!a.skipFactory&&me(c)){const{propsDefaults:h}=s;if(n in h)r=h[n];else{const d=Ti(s);r=h[n]=c.call(null,e),d()}}else r=c;s.ce&&s.ce._setProp(n,r)}a[0]&&(i&&!l?r=!1:a[1]&&(r===""||r===ur(n))&&(r=!0))}return r}const xy=new WeakMap;function ip(t,e,n=!1){const r=n?xy:e.propsCache,s=r.get(t);if(s)return s;const i=t.props,a={},l=[];let c=!1;if(!me(t)){const d=p=>{c=!0;const[g,y]=ip(p,e,!0);ct(a,g),y&&l.push(...y)};!n&&e.mixins.length&&e.mixins.forEach(d),t.extends&&d(t.extends),t.mixins&&t.mixins.forEach(d)}if(!i&&!c)return Je(t)&&r.set(t,Gr),Gr;if(de(i))for(let d=0;d<i.length;d++){const p=Kt(i[d]);_h(p)&&(a[p]=He)}else if(i)for(const d in i){const p=Kt(d);if(_h(p)){const g=i[d],y=a[p]=de(g)||me(g)?{type:g}:ct({},g),D=y.type;let O=!1,x=!0;if(de(D))for(let q=0;q<D.length;++q){const j=D[q],G=me(j)&&j.name;if(G==="Boolean"){O=!0;break}else G==="String"&&(x=!1)}else O=me(D)&&D.name==="Boolean";y[0]=O,y[1]=x,(O||Le(y,"default"))&&l.push(p)}}const h=[a,l];return Je(t)&&r.set(t,h),h}function _h(t){return t[0]!=="$"&&!$s(t)}const Ec=t=>t[0]==="_"||t==="$stable",Tc=t=>de(t)?t.map(sn):[sn(t)],ky=(t,e,n)=>{if(e._n)return e;const r=ry((...s)=>Tc(e(...s)),n);return r._c=!1,r},op=(t,e,n)=>{const r=t._ctx;for(const s in t){if(Ec(s))continue;const i=t[s];if(me(i))e[s]=ky(s,i,r);else if(i!=null){const a=Tc(i);e[s]=()=>a}}},ap=(t,e)=>{const n=Tc(e);t.slots.default=()=>n},lp=(t,e,n)=>{for(const r in e)(n||!Ec(r))&&(t[r]=e[r])},Dy=(t,e,n)=>{const r=t.slots=np();if(t.vnode.shapeFlag&32){const s=e.__;s&&wl(r,"__",s,!0);const i=e._;i?(lp(r,e,n),n&&wl(r,"_",i,!0)):op(e,r)}else e&&ap(t,e)},Vy=(t,e,n)=>{const{vnode:r,slots:s}=t;let i=!0,a=He;if(r.shapeFlag&32){const l=e._;l?n&&l===1?i=!1:lp(s,e,n):(i=!e.$stable,op(e,s)),a=e}else e&&(ap(t,e),a={default:1});if(i)for(const l in s)!Ec(l)&&a[l]==null&&delete s[l]},Lt=Wy;function Ny(t){return Oy(t)}function Oy(t,e){const n=Yo();n.__VUE__=!0;const{insert:r,remove:s,patchProp:i,createElement:a,createText:l,createComment:c,setText:h,setElementText:d,parentNode:p,nextSibling:g,setScopeId:y=Yt,insertStaticContent:D}=t,O=(_,w,k,B=null,L=null,$=null,Z=void 0,Q=null,W=!!w.dynamicChildren)=>{if(_===w)return;_&&!Os(_,w)&&(B=F(_),Ie(_,L,$,!0),_=null),w.patchFlag===-2&&(W=!1,w.dynamicChildren=null);const{type:z,ref:ie,shapeFlag:ee}=w;switch(z){case ra:x(_,w,k,B);break;case rr:q(_,w,k,B);break;case ho:_==null&&j(w,k,B,Z);break;case ft:P(_,w,k,B,L,$,Z,Q,W);break;default:ee&1?ge(_,w,k,B,L,$,Z,Q,W):ee&6?E(_,w,k,B,L,$,Z,Q,W):(ee&64||ee&128)&&z.process(_,w,k,B,L,$,Z,Q,W,ne)}ie!=null&&L?zs(ie,_&&_.ref,$,w||_,!w):ie==null&&_&&_.ref!=null&&zs(_.ref,null,$,_,!0)},x=(_,w,k,B)=>{if(_==null)r(w.el=l(w.children),k,B);else{const L=w.el=_.el;w.children!==_.children&&h(L,w.children)}},q=(_,w,k,B)=>{_==null?r(w.el=c(w.children||""),k,B):w.el=_.el},j=(_,w,k,B)=>{[_.el,_.anchor]=D(_.children,w,k,B,_.el,_.anchor)},G=({el:_,anchor:w},k,B)=>{let L;for(;_&&_!==w;)L=g(_),r(_,k,B),_=L;r(w,k,B)},J=({el:_,anchor:w})=>{let k;for(;_&&_!==w;)k=g(_),s(_),_=k;s(w)},ge=(_,w,k,B,L,$,Z,Q,W)=>{w.type==="svg"?Z="svg":w.type==="math"&&(Z="mathml"),_==null?_e(w,k,B,L,$,Z,Q,W):T(_,w,L,$,Z,Q,W)},_e=(_,w,k,B,L,$,Z,Q)=>{let W,z;const{props:ie,shapeFlag:ee,transition:V,dirs:R}=_;if(W=_.el=a(_.type,$,ie&&ie.is,ie),ee&8?d(W,_.children):ee&16&&v(_.children,W,null,B,L,Xa(_,$),Z,Q),R&&_r(_,null,B,"created"),I(W,_,_.scopeId,Z,B),ie){for(const K in ie)K!=="value"&&!$s(K)&&i(W,K,null,ie[K],$,B);"value"in ie&&i(W,"value",null,ie.value,$),(z=ie.onVnodeBeforeMount)&&tn(z,B,_)}R&&_r(_,null,B,"beforeMount");const C=My(L,V);C&&V.beforeEnter(W),r(W,w,k),((z=ie&&ie.onVnodeMounted)||C||R)&&Lt(()=>{z&&tn(z,B,_),C&&V.enter(W),R&&_r(_,null,B,"mounted")},L)},I=(_,w,k,B,L)=>{if(k&&y(_,k),B)for(let $=0;$<B.length;$++)y(_,B[$]);if(L){let $=L.subTree;if(w===$||pp($.type)&&($.ssContent===w||$.ssFallback===w)){const Z=L.vnode;I(_,Z,Z.scopeId,Z.slotScopeIds,L.parent)}}},v=(_,w,k,B,L,$,Z,Q,W=0)=>{for(let z=W;z<_.length;z++){const ie=_[z]=Q?Bn(_[z]):sn(_[z]);O(null,ie,w,k,B,L,$,Z,Q)}},T=(_,w,k,B,L,$,Z)=>{const Q=w.el=_.el;let{patchFlag:W,dynamicChildren:z,dirs:ie}=w;W|=_.patchFlag&16;const ee=_.props||He,V=w.props||He;let R;if(k&&yr(k,!1),(R=V.onVnodeBeforeUpdate)&&tn(R,k,w,_),ie&&_r(w,_,k,"beforeUpdate"),k&&yr(k,!0),(ee.innerHTML&&V.innerHTML==null||ee.textContent&&V.textContent==null)&&d(Q,""),z?b(_.dynamicChildren,z,Q,k,B,Xa(w,L),$):Z||we(_,w,Q,null,k,B,Xa(w,L),$,!1),W>0){if(W&16)A(Q,ee,V,k,L);else if(W&2&&ee.class!==V.class&&i(Q,"class",null,V.class,L),W&4&&i(Q,"style",ee.style,V.style,L),W&8){const C=w.dynamicProps;for(let K=0;K<C.length;K++){const oe=C[K],ve=ee[oe],le=V[oe];(le!==ve||oe==="value")&&i(Q,oe,ve,le,L,k)}}W&1&&_.children!==w.children&&d(Q,w.children)}else!Z&&z==null&&A(Q,ee,V,k,L);((R=V.onVnodeUpdated)||ie)&&Lt(()=>{R&&tn(R,k,w,_),ie&&_r(w,_,k,"updated")},B)},b=(_,w,k,B,L,$,Z)=>{for(let Q=0;Q<w.length;Q++){const W=_[Q],z=w[Q],ie=W.el&&(W.type===ft||!Os(W,z)||W.shapeFlag&198)?p(W.el):k;O(W,z,ie,null,B,L,$,Z,!0)}},A=(_,w,k,B,L)=>{if(w!==k){if(w!==He)for(const $ in w)!$s($)&&!($ in k)&&i(_,$,w[$],null,L,B);for(const $ in k){if($s($))continue;const Z=k[$],Q=w[$];Z!==Q&&$!=="value"&&i(_,$,Q,Z,L,B)}"value"in k&&i(_,"value",w.value,k.value,L)}},P=(_,w,k,B,L,$,Z,Q,W)=>{const z=w.el=_?_.el:l(""),ie=w.anchor=_?_.anchor:l("");let{patchFlag:ee,dynamicChildren:V,slotScopeIds:R}=w;R&&(Q=Q?Q.concat(R):R),_==null?(r(z,k,B),r(ie,k,B),v(w.children||[],k,ie,L,$,Z,Q,W)):ee>0&&ee&64&&V&&_.dynamicChildren?(b(_.dynamicChildren,V,k,L,$,Z,Q),(w.key!=null||L&&w===L.subTree)&&cp(_,w,!0)):we(_,w,k,ie,L,$,Z,Q,W)},E=(_,w,k,B,L,$,Z,Q,W)=>{w.slotScopeIds=Q,_==null?w.shapeFlag&512?L.ctx.activate(w,k,B,Z,W):tt(w,k,B,L,$,Z,W):ot(_,w,W)},tt=(_,w,k,B,L,$,Z)=>{const Q=_.component=tv(_,B,L);if(Qf(_)&&(Q.ctx.renderer=ne),nv(Q,!1,Z),Q.asyncDep){if(L&&L.registerDep(Q,Be,Z),!_.el){const W=Q.subTree=Nt(rr);q(null,W,w,k)}}else Be(Q,_,w,k,L,$,Z)},ot=(_,w,k)=>{const B=w.component=_.component;if(zy(_,w,k))if(B.asyncDep&&!B.asyncResolved){Te(B,w,k);return}else B.next=w,B.update();else w.el=_.el,B.vnode=w},Be=(_,w,k,B,L,$,Z)=>{const Q=()=>{if(_.isMounted){let{next:ee,bu:V,u:R,parent:C,vnode:K}=_;{const Ae=up(_);if(Ae){ee&&(ee.el=K.el,Te(_,ee,Z)),Ae.asyncDep.then(()=>{_.isUnmounted||Q()});return}}let oe=ee,ve;yr(_,!1),ee?(ee.el=K.el,Te(_,ee,Z)):ee=K,V&&lo(V),(ve=ee.props&&ee.props.onVnodeBeforeUpdate)&&tn(ve,C,ee,K),yr(_,!0);const le=Za(_),ke=_.subTree;_.subTree=le,O(ke,le,p(ke.el),F(ke),_,L,$),ee.el=le.el,oe===null&&Ky(_,le.el),R&&Lt(R,L),(ve=ee.props&&ee.props.onVnodeUpdated)&&Lt(()=>tn(ve,C,ee,K),L)}else{let ee;const{el:V,props:R}=w,{bm:C,m:K,parent:oe,root:ve,type:le}=_,ke=Ks(w);if(yr(_,!1),C&&lo(C),!ke&&(ee=R&&R.onVnodeBeforeMount)&&tn(ee,oe,w),yr(_,!0),V&&Ne){const Ae=()=>{_.subTree=Za(_),Ne(V,_.subTree,_,L,null)};ke&&le.__asyncHydrate?le.__asyncHydrate(V,_,Ae):Ae()}else{ve.ce&&ve.ce._def.shadowRoot!==!1&&ve.ce._injectChildStyle(le);const Ae=_.subTree=Za(_);O(null,Ae,k,B,_,L,$),w.el=Ae.el}if(K&&Lt(K,L),!ke&&(ee=R&&R.onVnodeMounted)){const Ae=w;Lt(()=>tn(ee,oe,Ae),L)}(w.shapeFlag&256||oe&&Ks(oe.vnode)&&oe.vnode.shapeFlag&256)&&_.a&&Lt(_.a,L),_.isMounted=!0,w=k=B=null}};_.scope.on();const W=_.effect=new bf(Q);_.scope.off();const z=_.update=W.run.bind(W),ie=_.job=W.runIfDirty.bind(W);ie.i=_,ie.id=_.uid,W.scheduler=()=>_c(ie),yr(_,!0),z()},Te=(_,w,k)=>{w.component=_;const B=_.vnode.props;_.vnode=w,_.next=null,Cy(_,w.props,B,k),Vy(_,w.children,k),An(),hh(_),Rn()},we=(_,w,k,B,L,$,Z,Q,W=!1)=>{const z=_&&_.children,ie=_?_.shapeFlag:0,ee=w.children,{patchFlag:V,shapeFlag:R}=w;if(V>0){if(V&128){Fe(z,ee,k,B,L,$,Z,Q,W);return}else if(V&256){Ce(z,ee,k,B,L,$,Z,Q,W);return}}R&8?(ie&16&&nt(z,L,$),ee!==z&&d(k,ee)):ie&16?R&16?Fe(z,ee,k,B,L,$,Z,Q,W):nt(z,L,$,!0):(ie&8&&d(k,""),R&16&&v(ee,k,B,L,$,Z,Q,W))},Ce=(_,w,k,B,L,$,Z,Q,W)=>{_=_||Gr,w=w||Gr;const z=_.length,ie=w.length,ee=Math.min(z,ie);let V;for(V=0;V<ee;V++){const R=w[V]=W?Bn(w[V]):sn(w[V]);O(_[V],R,k,null,L,$,Z,Q,W)}z>ie?nt(_,L,$,!0,!1,ee):v(w,k,B,L,$,Z,Q,W,ee)},Fe=(_,w,k,B,L,$,Z,Q,W)=>{let z=0;const ie=w.length;let ee=_.length-1,V=ie-1;for(;z<=ee&&z<=V;){const R=_[z],C=w[z]=W?Bn(w[z]):sn(w[z]);if(Os(R,C))O(R,C,k,null,L,$,Z,Q,W);else break;z++}for(;z<=ee&&z<=V;){const R=_[ee],C=w[V]=W?Bn(w[V]):sn(w[V]);if(Os(R,C))O(R,C,k,null,L,$,Z,Q,W);else break;ee--,V--}if(z>ee){if(z<=V){const R=V+1,C=R<ie?w[R].el:B;for(;z<=V;)O(null,w[z]=W?Bn(w[z]):sn(w[z]),k,C,L,$,Z,Q,W),z++}}else if(z>V)for(;z<=ee;)Ie(_[z],L,$,!0),z++;else{const R=z,C=z,K=new Map;for(z=C;z<=V;z++){const ut=w[z]=W?Bn(w[z]):sn(w[z]);ut.key!=null&&K.set(ut.key,z)}let oe,ve=0;const le=V-C+1;let ke=!1,Ae=0;const qt=new Array(le);for(z=0;z<le;z++)qt[z]=0;for(z=R;z<=ee;z++){const ut=_[z];if(ve>=le){Ie(ut,L,$,!0);continue}let Ht;if(ut.key!=null)Ht=K.get(ut.key);else for(oe=C;oe<=V;oe++)if(qt[oe-C]===0&&Os(ut,w[oe])){Ht=oe;break}Ht===void 0?Ie(ut,L,$,!0):(qt[Ht-C]=z+1,Ht>=Ae?Ae=Ht:ke=!0,O(ut,w[Ht],k,null,L,$,Z,Q,W),ve++)}const dr=ke?Ly(qt):Gr;for(oe=dr.length-1,z=le-1;z>=0;z--){const ut=C+z,Ht=w[ut],Oi=ut+1<ie?w[ut+1].el:B;qt[z]===0?O(null,Ht,k,Oi,L,$,Z,Q,W):ke&&(oe<0||z!==dr[oe]?$e(Ht,k,Oi,2):oe--)}}},$e=(_,w,k,B,L=null)=>{const{el:$,type:Z,transition:Q,children:W,shapeFlag:z}=_;if(z&6){$e(_.component.subTree,w,k,B);return}if(z&128){_.suspense.move(w,k,B);return}if(z&64){Z.move(_,w,k,ne);return}if(Z===ft){r($,w,k);for(let ee=0;ee<W.length;ee++)$e(W[ee],w,k,B);r(_.anchor,w,k);return}if(Z===ho){G(_,w,k);return}if(B!==2&&z&1&&Q)if(B===0)Q.beforeEnter($),r($,w,k),Lt(()=>Q.enter($),L);else{const{leave:ee,delayLeave:V,afterLeave:R}=Q,C=()=>{_.ctx.isUnmounted?s($):r($,w,k)},K=()=>{ee($,()=>{C(),R&&R()})};V?V($,C,K):K()}else r($,w,k)},Ie=(_,w,k,B=!1,L=!1)=>{const{type:$,props:Z,ref:Q,children:W,dynamicChildren:z,shapeFlag:ie,patchFlag:ee,dirs:V,cacheIndex:R}=_;if(ee===-2&&(L=!1),Q!=null&&(An(),zs(Q,null,k,_,!0),Rn()),R!=null&&(w.renderCache[R]=void 0),ie&256){w.ctx.deactivate(_);return}const C=ie&1&&V,K=!Ks(_);let oe;if(K&&(oe=Z&&Z.onVnodeBeforeUnmount)&&tn(oe,w,_),ie&6)$t(_.component,k,B);else{if(ie&128){_.suspense.unmount(k,B);return}C&&_r(_,null,w,"beforeUnmount"),ie&64?_.type.remove(_,w,k,ne,B):z&&!z.hasOnce&&($!==ft||ee>0&&ee&64)?nt(z,w,k,!1,!0):($===ft&&ee&384||!L&&ie&16)&&nt(W,w,k),B&&Ke(_)}(K&&(oe=Z&&Z.onVnodeUnmounted)||C)&&Lt(()=>{oe&&tn(oe,w,_),C&&_r(_,null,w,"unmounted")},k)},Ke=_=>{const{type:w,el:k,anchor:B,transition:L}=_;if(w===ft){Wt(k,B);return}if(w===ho){J(_);return}const $=()=>{s(k),L&&!L.persisted&&L.afterLeave&&L.afterLeave()};if(_.shapeFlag&1&&L&&!L.persisted){const{leave:Z,delayLeave:Q}=L,W=()=>Z(k,$);Q?Q(_.el,$,W):W()}else $()},Wt=(_,w)=>{let k;for(;_!==w;)k=g(_),s(_),_=k;s(w)},$t=(_,w,k)=>{const{bum:B,scope:L,job:$,subTree:Z,um:Q,m:W,a:z,parent:ie,slots:{__:ee}}=_;yh(W),yh(z),B&&lo(B),ie&&de(ee)&&ee.forEach(V=>{ie.renderCache[V]=void 0}),L.stop(),$&&($.flags|=8,Ie(Z,_,w,k)),Q&&Lt(Q,w),Lt(()=>{_.isUnmounted=!0},w),w&&w.pendingBranch&&!w.isUnmounted&&_.asyncDep&&!_.asyncResolved&&_.suspenseId===w.pendingId&&(w.deps--,w.deps===0&&w.resolve())},nt=(_,w,k,B=!1,L=!1,$=0)=>{for(let Z=$;Z<_.length;Z++)Ie(_[Z],w,k,B,L)},F=_=>{if(_.shapeFlag&6)return F(_.component.subTree);if(_.shapeFlag&128)return _.suspense.next();const w=g(_.anchor||_.el),k=w&&w[sy];return k?g(k):w};let te=!1;const X=(_,w,k)=>{_==null?w._vnode&&Ie(w._vnode,null,null,!0):O(w._vnode||null,_,w,null,null,null,k),w._vnode=_,te||(te=!0,hh(),Hf(),te=!1)},ne={p:O,um:Ie,m:$e,r:Ke,mt:tt,mc:v,pc:we,pbc:b,n:F,o:t};let ye,Ne;return e&&([ye,Ne]=e(ne)),{render:X,hydrate:ye,createApp:Sy(X,ye)}}function Xa({type:t,props:e},n){return n==="svg"&&t==="foreignObject"||n==="mathml"&&t==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:n}function yr({effect:t,job:e},n){n?(t.flags|=32,e.flags|=4):(t.flags&=-33,e.flags&=-5)}function My(t,e){return(!t||t&&!t.pendingBranch)&&e&&!e.persisted}function cp(t,e,n=!1){const r=t.children,s=e.children;if(de(r)&&de(s))for(let i=0;i<r.length;i++){const a=r[i];let l=s[i];l.shapeFlag&1&&!l.dynamicChildren&&((l.patchFlag<=0||l.patchFlag===32)&&(l=s[i]=Bn(s[i]),l.el=a.el),!n&&l.patchFlag!==-2&&cp(a,l)),l.type===ra&&(l.el=a.el),l.type===rr&&!l.el&&(l.el=a.el)}}function Ly(t){const e=t.slice(),n=[0];let r,s,i,a,l;const c=t.length;for(r=0;r<c;r++){const h=t[r];if(h!==0){if(s=n[n.length-1],t[s]<h){e[r]=s,n.push(r);continue}for(i=0,a=n.length-1;i<a;)l=i+a>>1,t[n[l]]<h?i=l+1:a=l;h<t[n[i]]&&(i>0&&(e[r]=n[i-1]),n[i]=r)}}for(i=n.length,a=n[i-1];i-- >0;)n[i]=a,a=e[a];return n}function up(t){const e=t.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:up(e)}function yh(t){if(t)for(let e=0;e<t.length;e++)t[e].flags|=8}const Fy=Symbol.for("v-scx"),Uy=()=>on(Fy);function uo(t,e,n){return hp(t,e,n)}function hp(t,e,n=He){const{immediate:r,deep:s,flush:i,once:a}=n,l=ct({},n),c=e&&r||!e&&i!=="post";let h;if(li){if(i==="sync"){const y=Uy();h=y.__watcherHandles||(y.__watcherHandles=[])}else if(!c){const y=()=>{};return y.stop=Yt,y.resume=Yt,y.pause=Yt,y}}const d=bt;l.call=(y,D,O)=>hn(y,d,D,O);let p=!1;i==="post"?l.scheduler=y=>{Lt(y,d&&d.suspense)}:i!=="sync"&&(p=!0,l.scheduler=(y,D)=>{D?y():_c(y)}),l.augmentJob=y=>{e&&(y.flags|=4),p&&(y.flags|=2,d&&(y.id=d.uid,y.i=d))};const g=Z_(t,e,l);return li&&(h?h.push(g):c&&g()),g}function jy(t,e,n){const r=this.proxy,s=it(t)?t.includes(".")?dp(r,t):()=>r[t]:t.bind(r,r);let i;me(e)?i=e:(i=e.handler,n=e);const a=Ti(this),l=hp(s,i.bind(r),n);return a(),l}function dp(t,e){const n=e.split(".");return()=>{let r=t;for(let s=0;s<n.length&&r;s++)r=r[n[s]];return r}}const By=(t,e)=>e==="modelValue"||e==="model-value"?t.modelModifiers:t[`${e}Modifiers`]||t[`${Kt(e)}Modifiers`]||t[`${ur(e)}Modifiers`];function $y(t,e,...n){if(t.isUnmounted)return;const r=t.vnode.props||He;let s=n;const i=e.startsWith("update:"),a=i&&By(r,e.slice(7));a&&(a.trim&&(s=n.map(d=>it(d)?d.trim():d)),a.number&&(s=n.map(El)));let l,c=r[l=Ka(e)]||r[l=Ka(Kt(e))];!c&&i&&(c=r[l=Ka(ur(e))]),c&&hn(c,t,6,s);const h=r[l+"Once"];if(h){if(!t.emitted)t.emitted={};else if(t.emitted[l])return;t.emitted[l]=!0,hn(h,t,6,s)}}function fp(t,e,n=!1){const r=e.emitsCache,s=r.get(t);if(s!==void 0)return s;const i=t.emits;let a={},l=!1;if(!me(t)){const c=h=>{const d=fp(h,e,!0);d&&(l=!0,ct(a,d))};!n&&e.mixins.length&&e.mixins.forEach(c),t.extends&&c(t.extends),t.mixins&&t.mixins.forEach(c)}return!i&&!l?(Je(t)&&r.set(t,null),null):(de(i)?i.forEach(c=>a[c]=null):ct(a,i),Je(t)&&r.set(t,a),a)}function na(t,e){return!t||!Wo(e)?!1:(e=e.slice(2).replace(/Once$/,""),Le(t,e[0].toLowerCase()+e.slice(1))||Le(t,ur(e))||Le(t,e))}function Za(t){const{type:e,vnode:n,proxy:r,withProxy:s,propsOptions:[i],slots:a,attrs:l,emit:c,render:h,renderCache:d,props:p,data:g,setupState:y,ctx:D,inheritAttrs:O}=t,x=So(t);let q,j;try{if(n.shapeFlag&4){const J=s||r,ge=J;q=sn(h.call(ge,J,d,p,y,g,D)),j=l}else{const J=e;q=sn(J.length>1?J(p,{attrs:l,slots:a,emit:c}):J(p,null)),j=e.props?l:qy(l)}}catch(J){Gs.length=0,ea(J,t,1),q=Nt(rr)}let G=q;if(j&&O!==!1){const J=Object.keys(j),{shapeFlag:ge}=G;J.length&&ge&7&&(i&&J.some(oc)&&(j=Hy(j,i)),G=ss(G,j,!1,!0))}return n.dirs&&(G=ss(G,null,!1,!0),G.dirs=G.dirs?G.dirs.concat(n.dirs):n.dirs),n.transition&&yc(G,n.transition),q=G,So(x),q}const qy=t=>{let e;for(const n in t)(n==="class"||n==="style"||Wo(n))&&((e||(e={}))[n]=t[n]);return e},Hy=(t,e)=>{const n={};for(const r in t)(!oc(r)||!(r.slice(9)in e))&&(n[r]=t[r]);return n};function zy(t,e,n){const{props:r,children:s,component:i}=t,{props:a,children:l,patchFlag:c}=e,h=i.emitsOptions;if(e.dirs||e.transition)return!0;if(n&&c>=0){if(c&1024)return!0;if(c&16)return r?vh(r,a,h):!!a;if(c&8){const d=e.dynamicProps;for(let p=0;p<d.length;p++){const g=d[p];if(a[g]!==r[g]&&!na(h,g))return!0}}}else return(s||l)&&(!l||!l.$stable)?!0:r===a?!1:r?a?vh(r,a,h):!0:!!a;return!1}function vh(t,e,n){const r=Object.keys(e);if(r.length!==Object.keys(t).length)return!0;for(let s=0;s<r.length;s++){const i=r[s];if(e[i]!==t[i]&&!na(n,i))return!0}return!1}function Ky({vnode:t,parent:e},n){for(;e;){const r=e.subTree;if(r.suspense&&r.suspense.activeBranch===t&&(r.el=t.el),r===t)(t=e.vnode).el=n,e=e.parent;else break}}const pp=t=>t.__isSuspense;function Wy(t,e){e&&e.pendingBranch?de(t)?e.effects.push(...t):e.effects.push(t):ny(t)}const ft=Symbol.for("v-fgt"),ra=Symbol.for("v-txt"),rr=Symbol.for("v-cmt"),ho=Symbol.for("v-stc"),Gs=[];let Ut=null;function Ee(t=!1){Gs.push(Ut=t?null:[])}function Gy(){Gs.pop(),Ut=Gs[Gs.length-1]||null}let ai=1;function wh(t,e=!1){ai+=t,t<0&&Ut&&e&&(Ut.hasOnce=!0)}function mp(t){return t.dynamicChildren=ai>0?Ut||Gr:null,Gy(),ai>0&&Ut&&Ut.push(t),t}function Re(t,e,n,r,s,i){return mp(M(t,e,n,r,s,i,!0))}function gp(t,e,n,r,s){return mp(Nt(t,e,n,r,s,!0))}function Co(t){return t?t.__v_isVNode===!0:!1}function Os(t,e){return t.type===e.type&&t.key===e.key}const _p=({key:t})=>t??null,fo=({ref:t,ref_key:e,ref_for:n})=>(typeof t=="number"&&(t=""+t),t!=null?it(t)||At(t)||me(t)?{i:Ft,r:t,k:e,f:!!n}:t:null);function M(t,e=null,n=null,r=0,s=null,i=t===ft?0:1,a=!1,l=!1){const c={__v_isVNode:!0,__v_skip:!0,type:t,props:e,key:e&&_p(e),ref:e&&fo(e),scopeId:Kf,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:r,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:Ft};return l?(Ic(c,n),i&128&&t.normalize(c)):n&&(c.shapeFlag|=it(n)?8:16),ai>0&&!a&&Ut&&(c.patchFlag>0||i&6)&&c.patchFlag!==32&&Ut.push(c),c}const Nt=Qy;function Qy(t,e=null,n=null,r=0,s=null,i=!1){if((!t||t===yy)&&(t=rr),Co(t)){const l=ss(t,e,!0);return n&&Ic(l,n),ai>0&&!i&&Ut&&(l.shapeFlag&6?Ut[Ut.indexOf(t)]=l:Ut.push(l)),l.patchFlag=-2,l}if(av(t)&&(t=t.__vccOpts),e){e=Jy(e);let{class:l,style:c}=e;l&&!it(l)&&(e.class=ri(l)),Je(c)&&(mc(c)&&!de(c)&&(c=ct({},c)),e.style=ni(c))}const a=it(t)?1:pp(t)?128:iy(t)?64:Je(t)?4:me(t)?2:0;return M(t,e,n,r,s,a,i,!0)}function Jy(t){return t?mc(t)||rp(t)?ct({},t):t:null}function ss(t,e,n=!1,r=!1){const{props:s,ref:i,patchFlag:a,children:l,transition:c}=t,h=e?Xy(s||{},e):s,d={__v_isVNode:!0,__v_skip:!0,type:t.type,props:h,key:h&&_p(h),ref:e&&e.ref?n&&i?de(i)?i.concat(fo(e)):[i,fo(e)]:fo(e):i,scopeId:t.scopeId,slotScopeIds:t.slotScopeIds,children:l,target:t.target,targetStart:t.targetStart,targetAnchor:t.targetAnchor,staticCount:t.staticCount,shapeFlag:t.shapeFlag,patchFlag:e&&t.type!==ft?a===-1?16:a|16:a,dynamicProps:t.dynamicProps,dynamicChildren:t.dynamicChildren,appContext:t.appContext,dirs:t.dirs,transition:c,component:t.component,suspense:t.suspense,ssContent:t.ssContent&&ss(t.ssContent),ssFallback:t.ssFallback&&ss(t.ssFallback),el:t.el,anchor:t.anchor,ctx:t.ctx,ce:t.ce};return c&&r&&yc(d,c.clone(d)),d}function Yy(t=" ",e=0){return Nt(ra,null,t,e)}function el(t,e){const n=Nt(ho,null,t);return n.staticCount=e,n}function yn(t="",e=!1){return e?(Ee(),gp(rr,null,t)):Nt(rr,null,t)}function sn(t){return t==null||typeof t=="boolean"?Nt(rr):de(t)?Nt(ft,null,t.slice()):Co(t)?Bn(t):Nt(ra,null,String(t))}function Bn(t){return t.el===null&&t.patchFlag!==-1||t.memo?t:ss(t)}function Ic(t,e){let n=0;const{shapeFlag:r}=t;if(e==null)e=null;else if(de(e))n=16;else if(typeof e=="object")if(r&65){const s=e.default;s&&(s._c&&(s._d=!1),Ic(t,s()),s._c&&(s._d=!0));return}else{n=32;const s=e._;!s&&!rp(e)?e._ctx=Ft:s===3&&Ft&&(Ft.slots._===1?e._=1:(e._=2,t.patchFlag|=1024))}else me(e)?(e={default:e,_ctx:Ft},n=32):(e=String(e),r&64?(n=16,e=[Yy(e)]):n=8);t.children=e,t.shapeFlag|=n}function Xy(...t){const e={};for(let n=0;n<t.length;n++){const r=t[n];for(const s in r)if(s==="class")e.class!==r.class&&(e.class=ri([e.class,r.class]));else if(s==="style")e.style=ni([e.style,r.style]);else if(Wo(s)){const i=e[s],a=r[s];a&&i!==a&&!(de(i)&&i.includes(a))&&(e[s]=i?[].concat(i,a):a)}else s!==""&&(e[s]=r[s])}return e}function tn(t,e,n,r=null){hn(t,e,7,[n,r])}const Zy=ep();let ev=0;function tv(t,e,n){const r=t.type,s=(e?e.appContext:t.appContext)||Zy,i={uid:ev++,vnode:t,type:r,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new R_(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:ip(r,s),emitsOptions:fp(r,s),emit:null,emitted:null,propsDefaults:He,inheritAttrs:r.inheritAttrs,ctx:He,data:He,props:He,attrs:He,slots:He,refs:He,setupState:He,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=e?e.root:i,i.emit=$y.bind(null,i),t.ce&&t.ce(i),i}let bt=null,xo,xl;{const t=Yo(),e=(n,r)=>{let s;return(s=t[n])||(s=t[n]=[]),s.push(r),i=>{s.length>1?s.forEach(a=>a(i)):s[0](i)}};xo=e("__VUE_INSTANCE_SETTERS__",n=>bt=n),xl=e("__VUE_SSR_SETTERS__",n=>li=n)}const Ti=t=>{const e=bt;return xo(t),t.scope.on(),()=>{t.scope.off(),xo(e)}},Eh=()=>{bt&&bt.scope.off(),xo(null)};function yp(t){return t.vnode.shapeFlag&4}let li=!1;function nv(t,e=!1,n=!1){e&&xl(e);const{props:r,children:s}=t.vnode,i=yp(t);Py(t,r,i,e),Dy(t,s,n||e);const a=i?rv(t,e):void 0;return e&&xl(!1),a}function rv(t,e){const n=t.type;t.accessCache=Object.create(null),t.proxy=new Proxy(t.ctx,wy);const{setup:r}=n;if(r){An();const s=t.setupContext=r.length>1?iv(t):null,i=Ti(t),a=Ei(r,t,0,[t.props,s]),l=yf(a);if(Rn(),i(),(l||t.sp)&&!Ks(t)&&Gf(t),l){if(a.then(Eh,Eh),e)return a.then(c=>{Th(t,c,e)}).catch(c=>{ea(c,t,0)});t.asyncDep=a}else Th(t,a,e)}else vp(t,e)}function Th(t,e,n){me(e)?t.type.__ssrInlineRender?t.ssrRender=e:t.render=e:Je(e)&&(t.setupState=Bf(e)),vp(t,n)}let Ih;function vp(t,e,n){const r=t.type;if(!t.render){if(!e&&Ih&&!r.render){const s=r.template||wc(t).template;if(s){const{isCustomElement:i,compilerOptions:a}=t.appContext.config,{delimiters:l,compilerOptions:c}=r,h=ct(ct({isCustomElement:i,delimiters:l},a),c);r.render=Ih(s,h)}}t.render=r.render||Yt}{const s=Ti(t);An();try{Ey(t)}finally{Rn(),s()}}}const sv={get(t,e){return Tt(t,"get",""),t[e]}};function iv(t){const e=n=>{t.exposed=n||{}};return{attrs:new Proxy(t.attrs,sv),slots:t.slots,emit:t.emit,expose:e}}function sa(t){return t.exposed?t.exposeProxy||(t.exposeProxy=new Proxy(Bf(K_(t.exposed)),{get(e,n){if(n in e)return e[n];if(n in Ws)return Ws[n](t)},has(e,n){return n in e||n in Ws}})):t.proxy}function ov(t,e=!0){return me(t)?t.displayName||t.name:t.name||e&&t.__name}function av(t){return me(t)&&"__vccOpts"in t}const Qt=(t,e)=>Y_(t,e,li);function wp(t,e,n){const r=arguments.length;return r===2?Je(e)&&!de(e)?Co(e)?Nt(t,null,[e]):Nt(t,e):Nt(t,null,e):(r>3?n=Array.prototype.slice.call(arguments,2):r===3&&Co(n)&&(n=[n]),Nt(t,e,n))}const lv="3.5.17";/**
* @vue/runtime-dom v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let kl;const bh=typeof window<"u"&&window.trustedTypes;if(bh)try{kl=bh.createPolicy("vue",{createHTML:t=>t})}catch{}const Ep=kl?t=>kl.createHTML(t):t=>t,cv="http://www.w3.org/2000/svg",uv="http://www.w3.org/1998/Math/MathML",_n=typeof document<"u"?document:null,Ah=_n&&_n.createElement("template"),hv={insert:(t,e,n)=>{e.insertBefore(t,n||null)},remove:t=>{const e=t.parentNode;e&&e.removeChild(t)},createElement:(t,e,n,r)=>{const s=e==="svg"?_n.createElementNS(cv,t):e==="mathml"?_n.createElementNS(uv,t):n?_n.createElement(t,{is:n}):_n.createElement(t);return t==="select"&&r&&r.multiple!=null&&s.setAttribute("multiple",r.multiple),s},createText:t=>_n.createTextNode(t),createComment:t=>_n.createComment(t),setText:(t,e)=>{t.nodeValue=e},setElementText:(t,e)=>{t.textContent=e},parentNode:t=>t.parentNode,nextSibling:t=>t.nextSibling,querySelector:t=>_n.querySelector(t),setScopeId(t,e){t.setAttribute(e,"")},insertStaticContent(t,e,n,r,s,i){const a=n?n.previousSibling:e.lastChild;if(s&&(s===i||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),n),!(s===i||!(s=s.nextSibling)););else{Ah.innerHTML=Ep(r==="svg"?`<svg>${t}</svg>`:r==="mathml"?`<math>${t}</math>`:t);const l=Ah.content;if(r==="svg"||r==="mathml"){const c=l.firstChild;for(;c.firstChild;)l.appendChild(c.firstChild);l.removeChild(c)}e.insertBefore(l,n)}return[a?a.nextSibling:e.firstChild,n?n.previousSibling:e.lastChild]}},dv=Symbol("_vtc");function fv(t,e,n){const r=t[dv];r&&(e=(e?[e,...r]:[...r]).join(" ")),e==null?t.removeAttribute("class"):n?t.setAttribute("class",e):t.className=e}const Rh=Symbol("_vod"),pv=Symbol("_vsh"),mv=Symbol(""),gv=/(^|;)\s*display\s*:/;function _v(t,e,n){const r=t.style,s=it(n);let i=!1;if(n&&!s){if(e)if(it(e))for(const a of e.split(";")){const l=a.slice(0,a.indexOf(":")).trim();n[l]==null&&po(r,l,"")}else for(const a in e)n[a]==null&&po(r,a,"");for(const a in n)a==="display"&&(i=!0),po(r,a,n[a])}else if(s){if(e!==n){const a=r[mv];a&&(n+=";"+a),r.cssText=n,i=gv.test(n)}}else e&&t.removeAttribute("style");Rh in t&&(t[Rh]=i?r.display:"",t[pv]&&(r.display="none"))}const Sh=/\s*!important$/;function po(t,e,n){if(de(n))n.forEach(r=>po(t,e,r));else if(n==null&&(n=""),e.startsWith("--"))t.setProperty(e,n);else{const r=yv(t,e);Sh.test(n)?t.setProperty(ur(r),n.replace(Sh,""),"important"):t[r]=n}}const Ph=["Webkit","Moz","ms"],tl={};function yv(t,e){const n=tl[e];if(n)return n;let r=Kt(e);if(r!=="filter"&&r in t)return tl[e]=r;r=Jo(r);for(let s=0;s<Ph.length;s++){const i=Ph[s]+r;if(i in t)return tl[e]=i}return e}const Ch="http://www.w3.org/1999/xlink";function xh(t,e,n,r,s,i=A_(e)){r&&e.startsWith("xlink:")?n==null?t.removeAttributeNS(Ch,e.slice(6,e.length)):t.setAttributeNS(Ch,e,n):n==null||i&&!Ef(n)?t.removeAttribute(e):t.setAttribute(e,i?"":cr(n)?String(n):n)}function kh(t,e,n,r,s){if(e==="innerHTML"||e==="textContent"){n!=null&&(t[e]=e==="innerHTML"?Ep(n):n);return}const i=t.tagName;if(e==="value"&&i!=="PROGRESS"&&!i.includes("-")){const l=i==="OPTION"?t.getAttribute("value")||"":t.value,c=n==null?t.type==="checkbox"?"on":"":String(n);(l!==c||!("_value"in t))&&(t.value=c),n==null&&t.removeAttribute(e),t._value=n;return}let a=!1;if(n===""||n==null){const l=typeof t[e];l==="boolean"?n=Ef(n):n==null&&l==="string"?(n="",a=!0):l==="number"&&(n=0,a=!0)}try{t[e]=n}catch{}a&&t.removeAttribute(s||e)}function $r(t,e,n,r){t.addEventListener(e,n,r)}function vv(t,e,n,r){t.removeEventListener(e,n,r)}const Dh=Symbol("_vei");function wv(t,e,n,r,s=null){const i=t[Dh]||(t[Dh]={}),a=i[e];if(r&&a)a.value=r;else{const[l,c]=Ev(e);if(r){const h=i[e]=bv(r,s);$r(t,l,h,c)}else a&&(vv(t,l,a,c),i[e]=void 0)}}const Vh=/(?:Once|Passive|Capture)$/;function Ev(t){let e;if(Vh.test(t)){e={};let r;for(;r=t.match(Vh);)t=t.slice(0,t.length-r[0].length),e[r[0].toLowerCase()]=!0}return[t[2]===":"?t.slice(3):ur(t.slice(2)),e]}let nl=0;const Tv=Promise.resolve(),Iv=()=>nl||(Tv.then(()=>nl=0),nl=Date.now());function bv(t,e){const n=r=>{if(!r._vts)r._vts=Date.now();else if(r._vts<=n.attached)return;hn(Av(r,n.value),e,5,[r])};return n.value=t,n.attached=Iv(),n}function Av(t,e){if(de(e)){const n=t.stopImmediatePropagation;return t.stopImmediatePropagation=()=>{n.call(t),t._stopped=!0},e.map(r=>s=>!s._stopped&&r&&r(s))}else return e}const Nh=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&t.charCodeAt(2)>96&&t.charCodeAt(2)<123,Rv=(t,e,n,r,s,i)=>{const a=s==="svg";e==="class"?fv(t,r,a):e==="style"?_v(t,n,r):Wo(e)?oc(e)||wv(t,e,n,r,i):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):Sv(t,e,r,a))?(kh(t,e,r),!t.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&xh(t,e,r,a,i,e!=="value")):t._isVueCE&&(/[A-Z]/.test(e)||!it(r))?kh(t,Kt(e),r,i,e):(e==="true-value"?t._trueValue=r:e==="false-value"&&(t._falseValue=r),xh(t,e,r,a))};function Sv(t,e,n,r){if(r)return!!(e==="innerHTML"||e==="textContent"||e in t&&Nh(e)&&me(n));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="form"||e==="list"&&t.tagName==="INPUT"||e==="type"&&t.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=t.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return Nh(e)&&it(n)?!1:e in t}const Oh=t=>{const e=t.props["onUpdate:modelValue"]||!1;return de(e)?n=>lo(e,n):e};function Pv(t){t.target.composing=!0}function Mh(t){const e=t.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const rl=Symbol("_assign"),$n={created(t,{modifiers:{lazy:e,trim:n,number:r}},s){t[rl]=Oh(s);const i=r||s.props&&s.props.type==="number";$r(t,e?"change":"input",a=>{if(a.target.composing)return;let l=t.value;n&&(l=l.trim()),i&&(l=El(l)),t[rl](l)}),n&&$r(t,"change",()=>{t.value=t.value.trim()}),e||($r(t,"compositionstart",Pv),$r(t,"compositionend",Mh),$r(t,"change",Mh))},mounted(t,{value:e}){t.value=e??""},beforeUpdate(t,{value:e,oldValue:n,modifiers:{lazy:r,trim:s,number:i}},a){if(t[rl]=Oh(a),t.composing)return;const l=(i||t.type==="number")&&!/^0\d/.test(t.value)?El(t.value):t.value,c=e??"";l!==c&&(document.activeElement===t&&t.type!=="range"&&(r&&e===n||s&&t.value.trim()===c)||(t.value=c))}},Cv=["ctrl","shift","alt","meta"],xv={stop:t=>t.stopPropagation(),prevent:t=>t.preventDefault(),self:t=>t.target!==t.currentTarget,ctrl:t=>!t.ctrlKey,shift:t=>!t.shiftKey,alt:t=>!t.altKey,meta:t=>!t.metaKey,left:t=>"button"in t&&t.button!==0,middle:t=>"button"in t&&t.button!==1,right:t=>"button"in t&&t.button!==2,exact:(t,e)=>Cv.some(n=>t[`${n}Key`]&&!e.includes(n))},kv=(t,e)=>{const n=t._withMods||(t._withMods={}),r=e.join(".");return n[r]||(n[r]=(s,...i)=>{for(let a=0;a<e.length;a++){const l=xv[e[a]];if(l&&l(s,e))return}return t(s,...i)})},Dv={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},jr=(t,e)=>{const n=t._withKeys||(t._withKeys={}),r=e.join(".");return n[r]||(n[r]=s=>{if(!("key"in s))return;const i=ur(s.key);if(e.some(a=>a===i||Dv[a]===i))return t(s)})},Vv=ct({patchProp:Rv},hv);let Lh;function Nv(){return Lh||(Lh=Ny(Vv))}const Ov=(...t)=>{const e=Nv().createApp(...t),{mount:n}=e;return e.mount=r=>{const s=Lv(r);if(!s)return;const i=e._component;!me(i)&&!i.render&&!i.template&&(i.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const a=n(s,!1,Mv(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),a},e};function Mv(t){if(t instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&t instanceof MathMLElement)return"mathml"}function Lv(t){return it(t)?document.querySelector(t):t}const Fv={__name:"App",setup(t){return(e,n)=>{const r=_y("router-view");return Ee(),gp(r)}}};/*!
  * vue-router v4.5.1
  * (c) 2025 Eduardo San Martin Morote
  * @license MIT
  */const qr=typeof document<"u";function Tp(t){return typeof t=="object"||"displayName"in t||"props"in t||"__vccOpts"in t}function Uv(t){return t.__esModule||t[Symbol.toStringTag]==="Module"||t.default&&Tp(t.default)}const Oe=Object.assign;function sl(t,e){const n={};for(const r in e){const s=e[r];n[r]=Zt(s)?s.map(t):t(s)}return n}const Qs=()=>{},Zt=Array.isArray,Ip=/#/g,jv=/&/g,Bv=/\//g,$v=/=/g,qv=/\?/g,bp=/\+/g,Hv=/%5B/g,zv=/%5D/g,Ap=/%5E/g,Kv=/%60/g,Rp=/%7B/g,Wv=/%7C/g,Sp=/%7D/g,Gv=/%20/g;function bc(t){return encodeURI(""+t).replace(Wv,"|").replace(Hv,"[").replace(zv,"]")}function Qv(t){return bc(t).replace(Rp,"{").replace(Sp,"}").replace(Ap,"^")}function Dl(t){return bc(t).replace(bp,"%2B").replace(Gv,"+").replace(Ip,"%23").replace(jv,"%26").replace(Kv,"`").replace(Rp,"{").replace(Sp,"}").replace(Ap,"^")}function Jv(t){return Dl(t).replace($v,"%3D")}function Yv(t){return bc(t).replace(Ip,"%23").replace(qv,"%3F")}function Xv(t){return t==null?"":Yv(t).replace(Bv,"%2F")}function ci(t){try{return decodeURIComponent(""+t)}catch{}return""+t}const Zv=/\/$/,e0=t=>t.replace(Zv,"");function il(t,e,n="/"){let r,s={},i="",a="";const l=e.indexOf("#");let c=e.indexOf("?");return l<c&&l>=0&&(c=-1),c>-1&&(r=e.slice(0,c),i=e.slice(c+1,l>-1?l:e.length),s=t(i)),l>-1&&(r=r||e.slice(0,l),a=e.slice(l,e.length)),r=s0(r??e,n),{fullPath:r+(i&&"?")+i+a,path:r,query:s,hash:ci(a)}}function t0(t,e){const n=e.query?t(e.query):"";return e.path+(n&&"?")+n+(e.hash||"")}function Fh(t,e){return!e||!t.toLowerCase().startsWith(e.toLowerCase())?t:t.slice(e.length)||"/"}function n0(t,e,n){const r=e.matched.length-1,s=n.matched.length-1;return r>-1&&r===s&&is(e.matched[r],n.matched[s])&&Pp(e.params,n.params)&&t(e.query)===t(n.query)&&e.hash===n.hash}function is(t,e){return(t.aliasOf||t)===(e.aliasOf||e)}function Pp(t,e){if(Object.keys(t).length!==Object.keys(e).length)return!1;for(const n in t)if(!r0(t[n],e[n]))return!1;return!0}function r0(t,e){return Zt(t)?Uh(t,e):Zt(e)?Uh(e,t):t===e}function Uh(t,e){return Zt(e)?t.length===e.length&&t.every((n,r)=>n===e[r]):t.length===1&&t[0]===e}function s0(t,e){if(t.startsWith("/"))return t;if(!t)return e;const n=e.split("/"),r=t.split("/"),s=r[r.length-1];(s===".."||s===".")&&r.push("");let i=n.length-1,a,l;for(a=0;a<r.length;a++)if(l=r[a],l!==".")if(l==="..")i>1&&i--;else break;return n.slice(0,i).join("/")+"/"+r.slice(a).join("/")}const Ln={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};var ui;(function(t){t.pop="pop",t.push="push"})(ui||(ui={}));var Js;(function(t){t.back="back",t.forward="forward",t.unknown=""})(Js||(Js={}));function i0(t){if(!t)if(qr){const e=document.querySelector("base");t=e&&e.getAttribute("href")||"/",t=t.replace(/^\w+:\/\/[^\/]+/,"")}else t="/";return t[0]!=="/"&&t[0]!=="#"&&(t="/"+t),e0(t)}const o0=/^[^#]+#/;function a0(t,e){return t.replace(o0,"#")+e}function l0(t,e){const n=document.documentElement.getBoundingClientRect(),r=t.getBoundingClientRect();return{behavior:e.behavior,left:r.left-n.left-(e.left||0),top:r.top-n.top-(e.top||0)}}const ia=()=>({left:window.scrollX,top:window.scrollY});function c0(t){let e;if("el"in t){const n=t.el,r=typeof n=="string"&&n.startsWith("#"),s=typeof n=="string"?r?document.getElementById(n.slice(1)):document.querySelector(n):n;if(!s)return;e=l0(s,t)}else e=t;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.scrollX,e.top!=null?e.top:window.scrollY)}function jh(t,e){return(history.state?history.state.position-e:-1)+t}const Vl=new Map;function u0(t,e){Vl.set(t,e)}function h0(t){const e=Vl.get(t);return Vl.delete(t),e}let d0=()=>location.protocol+"//"+location.host;function Cp(t,e){const{pathname:n,search:r,hash:s}=e,i=t.indexOf("#");if(i>-1){let l=s.includes(t.slice(i))?t.slice(i).length:1,c=s.slice(l);return c[0]!=="/"&&(c="/"+c),Fh(c,"")}return Fh(n,t)+r+s}function f0(t,e,n,r){let s=[],i=[],a=null;const l=({state:g})=>{const y=Cp(t,location),D=n.value,O=e.value;let x=0;if(g){if(n.value=y,e.value=g,a&&a===D){a=null;return}x=O?g.position-O.position:0}else r(y);s.forEach(q=>{q(n.value,D,{delta:x,type:ui.pop,direction:x?x>0?Js.forward:Js.back:Js.unknown})})};function c(){a=n.value}function h(g){s.push(g);const y=()=>{const D=s.indexOf(g);D>-1&&s.splice(D,1)};return i.push(y),y}function d(){const{history:g}=window;g.state&&g.replaceState(Oe({},g.state,{scroll:ia()}),"")}function p(){for(const g of i)g();i=[],window.removeEventListener("popstate",l),window.removeEventListener("beforeunload",d)}return window.addEventListener("popstate",l),window.addEventListener("beforeunload",d,{passive:!0}),{pauseListeners:c,listen:h,destroy:p}}function Bh(t,e,n,r=!1,s=!1){return{back:t,current:e,forward:n,replaced:r,position:window.history.length,scroll:s?ia():null}}function p0(t){const{history:e,location:n}=window,r={value:Cp(t,n)},s={value:e.state};s.value||i(r.value,{back:null,current:r.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function i(c,h,d){const p=t.indexOf("#"),g=p>-1?(n.host&&document.querySelector("base")?t:t.slice(p))+c:d0()+t+c;try{e[d?"replaceState":"pushState"](h,"",g),s.value=h}catch(y){console.error(y),n[d?"replace":"assign"](g)}}function a(c,h){const d=Oe({},e.state,Bh(s.value.back,c,s.value.forward,!0),h,{position:s.value.position});i(c,d,!0),r.value=c}function l(c,h){const d=Oe({},s.value,e.state,{forward:c,scroll:ia()});i(d.current,d,!0);const p=Oe({},Bh(r.value,c,null),{position:d.position+1},h);i(c,p,!1),r.value=c}return{location:r,state:s,push:l,replace:a}}function m0(t){t=i0(t);const e=p0(t),n=f0(t,e.state,e.location,e.replace);function r(i,a=!0){a||n.pauseListeners(),history.go(i)}const s=Oe({location:"",base:t,go:r,createHref:a0.bind(null,t)},e,n);return Object.defineProperty(s,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(s,"state",{enumerable:!0,get:()=>e.state.value}),s}function g0(t){return typeof t=="string"||t&&typeof t=="object"}function xp(t){return typeof t=="string"||typeof t=="symbol"}const kp=Symbol("");var $h;(function(t){t[t.aborted=4]="aborted",t[t.cancelled=8]="cancelled",t[t.duplicated=16]="duplicated"})($h||($h={}));function os(t,e){return Oe(new Error,{type:t,[kp]:!0},e)}function gn(t,e){return t instanceof Error&&kp in t&&(e==null||!!(t.type&e))}const qh="[^/]+?",_0={sensitive:!1,strict:!1,start:!0,end:!0},y0=/[.+*?^${}()[\]/\\]/g;function v0(t,e){const n=Oe({},_0,e),r=[];let s=n.start?"^":"";const i=[];for(const h of t){const d=h.length?[]:[90];n.strict&&!h.length&&(s+="/");for(let p=0;p<h.length;p++){const g=h[p];let y=40+(n.sensitive?.25:0);if(g.type===0)p||(s+="/"),s+=g.value.replace(y0,"\\$&"),y+=40;else if(g.type===1){const{value:D,repeatable:O,optional:x,regexp:q}=g;i.push({name:D,repeatable:O,optional:x});const j=q||qh;if(j!==qh){y+=10;try{new RegExp(`(${j})`)}catch(J){throw new Error(`Invalid custom RegExp for param "${D}" (${j}): `+J.message)}}let G=O?`((?:${j})(?:/(?:${j}))*)`:`(${j})`;p||(G=x&&h.length<2?`(?:/${G})`:"/"+G),x&&(G+="?"),s+=G,y+=20,x&&(y+=-8),O&&(y+=-20),j===".*"&&(y+=-50)}d.push(y)}r.push(d)}if(n.strict&&n.end){const h=r.length-1;r[h][r[h].length-1]+=.7000000000000001}n.strict||(s+="/?"),n.end?s+="$":n.strict&&!s.endsWith("/")&&(s+="(?:/|$)");const a=new RegExp(s,n.sensitive?"":"i");function l(h){const d=h.match(a),p={};if(!d)return null;for(let g=1;g<d.length;g++){const y=d[g]||"",D=i[g-1];p[D.name]=y&&D.repeatable?y.split("/"):y}return p}function c(h){let d="",p=!1;for(const g of t){(!p||!d.endsWith("/"))&&(d+="/"),p=!1;for(const y of g)if(y.type===0)d+=y.value;else if(y.type===1){const{value:D,repeatable:O,optional:x}=y,q=D in h?h[D]:"";if(Zt(q)&&!O)throw new Error(`Provided param "${D}" is an array but it is not repeatable (* or + modifiers)`);const j=Zt(q)?q.join("/"):q;if(!j)if(x)g.length<2&&(d.endsWith("/")?d=d.slice(0,-1):p=!0);else throw new Error(`Missing required param "${D}"`);d+=j}}return d||"/"}return{re:a,score:r,keys:i,parse:l,stringify:c}}function w0(t,e){let n=0;for(;n<t.length&&n<e.length;){const r=e[n]-t[n];if(r)return r;n++}return t.length<e.length?t.length===1&&t[0]===40+40?-1:1:t.length>e.length?e.length===1&&e[0]===40+40?1:-1:0}function Dp(t,e){let n=0;const r=t.score,s=e.score;for(;n<r.length&&n<s.length;){const i=w0(r[n],s[n]);if(i)return i;n++}if(Math.abs(s.length-r.length)===1){if(Hh(r))return 1;if(Hh(s))return-1}return s.length-r.length}function Hh(t){const e=t[t.length-1];return t.length>0&&e[e.length-1]<0}const E0={type:0,value:""},T0=/[a-zA-Z0-9_]/;function I0(t){if(!t)return[[]];if(t==="/")return[[E0]];if(!t.startsWith("/"))throw new Error(`Invalid path "${t}"`);function e(y){throw new Error(`ERR (${n})/"${h}": ${y}`)}let n=0,r=n;const s=[];let i;function a(){i&&s.push(i),i=[]}let l=0,c,h="",d="";function p(){h&&(n===0?i.push({type:0,value:h}):n===1||n===2||n===3?(i.length>1&&(c==="*"||c==="+")&&e(`A repeatable param (${h}) must be alone in its segment. eg: '/:ids+.`),i.push({type:1,value:h,regexp:d,repeatable:c==="*"||c==="+",optional:c==="*"||c==="?"})):e("Invalid state to consume buffer"),h="")}function g(){h+=c}for(;l<t.length;){if(c=t[l++],c==="\\"&&n!==2){r=n,n=4;continue}switch(n){case 0:c==="/"?(h&&p(),a()):c===":"?(p(),n=1):g();break;case 4:g(),n=r;break;case 1:c==="("?n=2:T0.test(c)?g():(p(),n=0,c!=="*"&&c!=="?"&&c!=="+"&&l--);break;case 2:c===")"?d[d.length-1]=="\\"?d=d.slice(0,-1)+c:n=3:d+=c;break;case 3:p(),n=0,c!=="*"&&c!=="?"&&c!=="+"&&l--,d="";break;default:e("Unknown state");break}}return n===2&&e(`Unfinished custom RegExp for param "${h}"`),p(),a(),s}function b0(t,e,n){const r=v0(I0(t.path),n),s=Oe(r,{record:t,parent:e,children:[],alias:[]});return e&&!s.record.aliasOf==!e.record.aliasOf&&e.children.push(s),s}function A0(t,e){const n=[],r=new Map;e=Gh({strict:!1,end:!0,sensitive:!1},e);function s(p){return r.get(p)}function i(p,g,y){const D=!y,O=Kh(p);O.aliasOf=y&&y.record;const x=Gh(e,p),q=[O];if("alias"in p){const J=typeof p.alias=="string"?[p.alias]:p.alias;for(const ge of J)q.push(Kh(Oe({},O,{components:y?y.record.components:O.components,path:ge,aliasOf:y?y.record:O})))}let j,G;for(const J of q){const{path:ge}=J;if(g&&ge[0]!=="/"){const _e=g.record.path,I=_e[_e.length-1]==="/"?"":"/";J.path=g.record.path+(ge&&I+ge)}if(j=b0(J,g,x),y?y.alias.push(j):(G=G||j,G!==j&&G.alias.push(j),D&&p.name&&!Wh(j)&&a(p.name)),Vp(j)&&c(j),O.children){const _e=O.children;for(let I=0;I<_e.length;I++)i(_e[I],j,y&&y.children[I])}y=y||j}return G?()=>{a(G)}:Qs}function a(p){if(xp(p)){const g=r.get(p);g&&(r.delete(p),n.splice(n.indexOf(g),1),g.children.forEach(a),g.alias.forEach(a))}else{const g=n.indexOf(p);g>-1&&(n.splice(g,1),p.record.name&&r.delete(p.record.name),p.children.forEach(a),p.alias.forEach(a))}}function l(){return n}function c(p){const g=P0(p,n);n.splice(g,0,p),p.record.name&&!Wh(p)&&r.set(p.record.name,p)}function h(p,g){let y,D={},O,x;if("name"in p&&p.name){if(y=r.get(p.name),!y)throw os(1,{location:p});x=y.record.name,D=Oe(zh(g.params,y.keys.filter(G=>!G.optional).concat(y.parent?y.parent.keys.filter(G=>G.optional):[]).map(G=>G.name)),p.params&&zh(p.params,y.keys.map(G=>G.name))),O=y.stringify(D)}else if(p.path!=null)O=p.path,y=n.find(G=>G.re.test(O)),y&&(D=y.parse(O),x=y.record.name);else{if(y=g.name?r.get(g.name):n.find(G=>G.re.test(g.path)),!y)throw os(1,{location:p,currentLocation:g});x=y.record.name,D=Oe({},g.params,p.params),O=y.stringify(D)}const q=[];let j=y;for(;j;)q.unshift(j.record),j=j.parent;return{name:x,path:O,params:D,matched:q,meta:S0(q)}}t.forEach(p=>i(p));function d(){n.length=0,r.clear()}return{addRoute:i,resolve:h,removeRoute:a,clearRoutes:d,getRoutes:l,getRecordMatcher:s}}function zh(t,e){const n={};for(const r of e)r in t&&(n[r]=t[r]);return n}function Kh(t){const e={path:t.path,redirect:t.redirect,name:t.name,meta:t.meta||{},aliasOf:t.aliasOf,beforeEnter:t.beforeEnter,props:R0(t),children:t.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in t?t.components||null:t.component&&{default:t.component}};return Object.defineProperty(e,"mods",{value:{}}),e}function R0(t){const e={},n=t.props||!1;if("component"in t)e.default=n;else for(const r in t.components)e[r]=typeof n=="object"?n[r]:n;return e}function Wh(t){for(;t;){if(t.record.aliasOf)return!0;t=t.parent}return!1}function S0(t){return t.reduce((e,n)=>Oe(e,n.meta),{})}function Gh(t,e){const n={};for(const r in t)n[r]=r in e?e[r]:t[r];return n}function P0(t,e){let n=0,r=e.length;for(;n!==r;){const i=n+r>>1;Dp(t,e[i])<0?r=i:n=i+1}const s=C0(t);return s&&(r=e.lastIndexOf(s,r-1)),r}function C0(t){let e=t;for(;e=e.parent;)if(Vp(e)&&Dp(t,e)===0)return e}function Vp({record:t}){return!!(t.name||t.components&&Object.keys(t.components).length||t.redirect)}function x0(t){const e={};if(t===""||t==="?")return e;const r=(t[0]==="?"?t.slice(1):t).split("&");for(let s=0;s<r.length;++s){const i=r[s].replace(bp," "),a=i.indexOf("="),l=ci(a<0?i:i.slice(0,a)),c=a<0?null:ci(i.slice(a+1));if(l in e){let h=e[l];Zt(h)||(h=e[l]=[h]),h.push(c)}else e[l]=c}return e}function Qh(t){let e="";for(let n in t){const r=t[n];if(n=Jv(n),r==null){r!==void 0&&(e+=(e.length?"&":"")+n);continue}(Zt(r)?r.map(i=>i&&Dl(i)):[r&&Dl(r)]).forEach(i=>{i!==void 0&&(e+=(e.length?"&":"")+n,i!=null&&(e+="="+i))})}return e}function k0(t){const e={};for(const n in t){const r=t[n];r!==void 0&&(e[n]=Zt(r)?r.map(s=>s==null?null:""+s):r==null?r:""+r)}return e}const D0=Symbol(""),Jh=Symbol(""),oa=Symbol(""),Np=Symbol(""),Nl=Symbol("");function Ms(){let t=[];function e(r){return t.push(r),()=>{const s=t.indexOf(r);s>-1&&t.splice(s,1)}}function n(){t=[]}return{add:e,list:()=>t.slice(),reset:n}}function qn(t,e,n,r,s,i=a=>a()){const a=r&&(r.enterCallbacks[s]=r.enterCallbacks[s]||[]);return()=>new Promise((l,c)=>{const h=g=>{g===!1?c(os(4,{from:n,to:e})):g instanceof Error?c(g):g0(g)?c(os(2,{from:e,to:g})):(a&&r.enterCallbacks[s]===a&&typeof g=="function"&&a.push(g),l())},d=i(()=>t.call(r&&r.instances[s],e,n,h));let p=Promise.resolve(d);t.length<3&&(p=p.then(h)),p.catch(g=>c(g))})}function ol(t,e,n,r,s=i=>i()){const i=[];for(const a of t)for(const l in a.components){let c=a.components[l];if(!(e!=="beforeRouteEnter"&&!a.instances[l]))if(Tp(c)){const d=(c.__vccOpts||c)[e];d&&i.push(qn(d,n,r,a,l,s))}else{let h=c();i.push(()=>h.then(d=>{if(!d)throw new Error(`Couldn't resolve component "${l}" at "${a.path}"`);const p=Uv(d)?d.default:d;a.mods[l]=d,a.components[l]=p;const y=(p.__vccOpts||p)[e];return y&&qn(y,n,r,a,l,s)()}))}}return i}function Yh(t){const e=on(oa),n=on(Np),r=Qt(()=>{const c=Yr(t.to);return e.resolve(c)}),s=Qt(()=>{const{matched:c}=r.value,{length:h}=c,d=c[h-1],p=n.matched;if(!d||!p.length)return-1;const g=p.findIndex(is.bind(null,d));if(g>-1)return g;const y=Xh(c[h-2]);return h>1&&Xh(d)===y&&p[p.length-1].path!==y?p.findIndex(is.bind(null,c[h-2])):g}),i=Qt(()=>s.value>-1&&L0(n.params,r.value.params)),a=Qt(()=>s.value>-1&&s.value===n.matched.length-1&&Pp(n.params,r.value.params));function l(c={}){if(M0(c)){const h=e[Yr(t.replace)?"replace":"push"](Yr(t.to)).catch(Qs);return t.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>h),h}return Promise.resolve()}return{route:r,href:Qt(()=>r.value.href),isActive:i,isExactActive:a,navigate:l}}function V0(t){return t.length===1?t[0]:t}const N0=Wf({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:Yh,setup(t,{slots:e}){const n=Zo(Yh(t)),{options:r}=on(oa),s=Qt(()=>({[Zh(t.activeClass,r.linkActiveClass,"router-link-active")]:n.isActive,[Zh(t.exactActiveClass,r.linkExactActiveClass,"router-link-exact-active")]:n.isExactActive}));return()=>{const i=e.default&&V0(e.default(n));return t.custom?i:wp("a",{"aria-current":n.isExactActive?t.ariaCurrentValue:null,href:n.href,onClick:n.navigate,class:s.value},i)}}}),O0=N0;function M0(t){if(!(t.metaKey||t.altKey||t.ctrlKey||t.shiftKey)&&!t.defaultPrevented&&!(t.button!==void 0&&t.button!==0)){if(t.currentTarget&&t.currentTarget.getAttribute){const e=t.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return t.preventDefault&&t.preventDefault(),!0}}function L0(t,e){for(const n in e){const r=e[n],s=t[n];if(typeof r=="string"){if(r!==s)return!1}else if(!Zt(s)||s.length!==r.length||r.some((i,a)=>i!==s[a]))return!1}return!0}function Xh(t){return t?t.aliasOf?t.aliasOf.path:t.path:""}const Zh=(t,e,n)=>t??e??n,F0=Wf({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(t,{attrs:e,slots:n}){const r=on(Nl),s=Qt(()=>t.route||r.value),i=on(Jh,0),a=Qt(()=>{let h=Yr(i);const{matched:d}=s.value;let p;for(;(p=d[h])&&!p.components;)h++;return h}),l=Qt(()=>s.value.matched[a.value]);co(Jh,Qt(()=>a.value+1)),co(D0,l),co(Nl,s);const c=Se();return uo(()=>[c.value,l.value,t.name],([h,d,p],[g,y,D])=>{d&&(d.instances[p]=h,y&&y!==d&&h&&h===g&&(d.leaveGuards.size||(d.leaveGuards=y.leaveGuards),d.updateGuards.size||(d.updateGuards=y.updateGuards))),h&&d&&(!y||!is(d,y)||!g)&&(d.enterCallbacks[p]||[]).forEach(O=>O(h))},{flush:"post"}),()=>{const h=s.value,d=t.name,p=l.value,g=p&&p.components[d];if(!g)return ed(n.default,{Component:g,route:h});const y=p.props[d],D=y?y===!0?h.params:typeof y=="function"?y(h):y:null,x=wp(g,Oe({},D,e,{onVnodeUnmounted:q=>{q.component.isUnmounted&&(p.instances[d]=null)},ref:c}));return ed(n.default,{Component:x,route:h})||x}}});function ed(t,e){if(!t)return null;const n=t(e);return n.length===1?n[0]:n}const U0=F0;function j0(t){const e=A0(t.routes,t),n=t.parseQuery||x0,r=t.stringifyQuery||Qh,s=t.history,i=Ms(),a=Ms(),l=Ms(),c=W_(Ln);let h=Ln;qr&&t.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const d=sl.bind(null,F=>""+F),p=sl.bind(null,Xv),g=sl.bind(null,ci);function y(F,te){let X,ne;return xp(F)?(X=e.getRecordMatcher(F),ne=te):ne=F,e.addRoute(ne,X)}function D(F){const te=e.getRecordMatcher(F);te&&e.removeRoute(te)}function O(){return e.getRoutes().map(F=>F.record)}function x(F){return!!e.getRecordMatcher(F)}function q(F,te){if(te=Oe({},te||c.value),typeof F=="string"){const w=il(n,F,te.path),k=e.resolve({path:w.path},te),B=s.createHref(w.fullPath);return Oe(w,k,{params:g(k.params),hash:ci(w.hash),redirectedFrom:void 0,href:B})}let X;if(F.path!=null)X=Oe({},F,{path:il(n,F.path,te.path).path});else{const w=Oe({},F.params);for(const k in w)w[k]==null&&delete w[k];X=Oe({},F,{params:p(w)}),te.params=p(te.params)}const ne=e.resolve(X,te),ye=F.hash||"";ne.params=d(g(ne.params));const Ne=t0(r,Oe({},F,{hash:Qv(ye),path:ne.path})),_=s.createHref(Ne);return Oe({fullPath:Ne,hash:ye,query:r===Qh?k0(F.query):F.query||{}},ne,{redirectedFrom:void 0,href:_})}function j(F){return typeof F=="string"?il(n,F,c.value.path):Oe({},F)}function G(F,te){if(h!==F)return os(8,{from:te,to:F})}function J(F){return I(F)}function ge(F){return J(Oe(j(F),{replace:!0}))}function _e(F){const te=F.matched[F.matched.length-1];if(te&&te.redirect){const{redirect:X}=te;let ne=typeof X=="function"?X(F):X;return typeof ne=="string"&&(ne=ne.includes("?")||ne.includes("#")?ne=j(ne):{path:ne},ne.params={}),Oe({query:F.query,hash:F.hash,params:ne.path!=null?{}:F.params},ne)}}function I(F,te){const X=h=q(F),ne=c.value,ye=F.state,Ne=F.force,_=F.replace===!0,w=_e(X);if(w)return I(Oe(j(w),{state:typeof w=="object"?Oe({},ye,w.state):ye,force:Ne,replace:_}),te||X);const k=X;k.redirectedFrom=te;let B;return!Ne&&n0(r,ne,X)&&(B=os(16,{to:k,from:ne}),$e(ne,ne,!0,!1)),(B?Promise.resolve(B):b(k,ne)).catch(L=>gn(L)?gn(L,2)?L:Fe(L):we(L,k,ne)).then(L=>{if(L){if(gn(L,2))return I(Oe({replace:_},j(L.to),{state:typeof L.to=="object"?Oe({},ye,L.to.state):ye,force:Ne}),te||k)}else L=P(k,ne,!0,_,ye);return A(k,ne,L),L})}function v(F,te){const X=G(F,te);return X?Promise.reject(X):Promise.resolve()}function T(F){const te=Wt.values().next().value;return te&&typeof te.runWithContext=="function"?te.runWithContext(F):F()}function b(F,te){let X;const[ne,ye,Ne]=B0(F,te);X=ol(ne.reverse(),"beforeRouteLeave",F,te);for(const w of ne)w.leaveGuards.forEach(k=>{X.push(qn(k,F,te))});const _=v.bind(null,F,te);return X.push(_),nt(X).then(()=>{X=[];for(const w of i.list())X.push(qn(w,F,te));return X.push(_),nt(X)}).then(()=>{X=ol(ye,"beforeRouteUpdate",F,te);for(const w of ye)w.updateGuards.forEach(k=>{X.push(qn(k,F,te))});return X.push(_),nt(X)}).then(()=>{X=[];for(const w of Ne)if(w.beforeEnter)if(Zt(w.beforeEnter))for(const k of w.beforeEnter)X.push(qn(k,F,te));else X.push(qn(w.beforeEnter,F,te));return X.push(_),nt(X)}).then(()=>(F.matched.forEach(w=>w.enterCallbacks={}),X=ol(Ne,"beforeRouteEnter",F,te,T),X.push(_),nt(X))).then(()=>{X=[];for(const w of a.list())X.push(qn(w,F,te));return X.push(_),nt(X)}).catch(w=>gn(w,8)?w:Promise.reject(w))}function A(F,te,X){l.list().forEach(ne=>T(()=>ne(F,te,X)))}function P(F,te,X,ne,ye){const Ne=G(F,te);if(Ne)return Ne;const _=te===Ln,w=qr?history.state:{};X&&(ne||_?s.replace(F.fullPath,Oe({scroll:_&&w&&w.scroll},ye)):s.push(F.fullPath,ye)),c.value=F,$e(F,te,X,_),Fe()}let E;function tt(){E||(E=s.listen((F,te,X)=>{if(!$t.listening)return;const ne=q(F),ye=_e(ne);if(ye){I(Oe(ye,{replace:!0,force:!0}),ne).catch(Qs);return}h=ne;const Ne=c.value;qr&&u0(jh(Ne.fullPath,X.delta),ia()),b(ne,Ne).catch(_=>gn(_,12)?_:gn(_,2)?(I(Oe(j(_.to),{force:!0}),ne).then(w=>{gn(w,20)&&!X.delta&&X.type===ui.pop&&s.go(-1,!1)}).catch(Qs),Promise.reject()):(X.delta&&s.go(-X.delta,!1),we(_,ne,Ne))).then(_=>{_=_||P(ne,Ne,!1),_&&(X.delta&&!gn(_,8)?s.go(-X.delta,!1):X.type===ui.pop&&gn(_,20)&&s.go(-1,!1)),A(ne,Ne,_)}).catch(Qs)}))}let ot=Ms(),Be=Ms(),Te;function we(F,te,X){Fe(F);const ne=Be.list();return ne.length?ne.forEach(ye=>ye(F,te,X)):console.error(F),Promise.reject(F)}function Ce(){return Te&&c.value!==Ln?Promise.resolve():new Promise((F,te)=>{ot.add([F,te])})}function Fe(F){return Te||(Te=!F,tt(),ot.list().forEach(([te,X])=>F?X(F):te()),ot.reset()),F}function $e(F,te,X,ne){const{scrollBehavior:ye}=t;if(!qr||!ye)return Promise.resolve();const Ne=!X&&h0(jh(F.fullPath,0))||(ne||!X)&&history.state&&history.state.scroll||null;return gc().then(()=>ye(F,te,Ne)).then(_=>_&&c0(_)).catch(_=>we(_,F,te))}const Ie=F=>s.go(F);let Ke;const Wt=new Set,$t={currentRoute:c,listening:!0,addRoute:y,removeRoute:D,clearRoutes:e.clearRoutes,hasRoute:x,getRoutes:O,resolve:q,options:t,push:J,replace:ge,go:Ie,back:()=>Ie(-1),forward:()=>Ie(1),beforeEach:i.add,beforeResolve:a.add,afterEach:l.add,onError:Be.add,isReady:Ce,install(F){const te=this;F.component("RouterLink",O0),F.component("RouterView",U0),F.config.globalProperties.$router=te,Object.defineProperty(F.config.globalProperties,"$route",{enumerable:!0,get:()=>Yr(c)}),qr&&!Ke&&c.value===Ln&&(Ke=!0,J(s.location).catch(ye=>{}));const X={};for(const ye in Ln)Object.defineProperty(X,ye,{get:()=>c.value[ye],enumerable:!0});F.provide(oa,te),F.provide(Np,Ff(X)),F.provide(Nl,c);const ne=F.unmount;Wt.add(F),F.unmount=function(){Wt.delete(F),Wt.size<1&&(h=Ln,E&&E(),E=null,c.value=Ln,Ke=!1,Te=!1),ne()}}};function nt(F){return F.reduce((te,X)=>te.then(()=>T(X)),Promise.resolve())}return $t}function B0(t,e){const n=[],r=[],s=[],i=Math.max(e.matched.length,t.matched.length);for(let a=0;a<i;a++){const l=e.matched[a];l&&(t.matched.find(h=>is(h,l))?r.push(l):n.push(l));const c=t.matched[a];c&&(e.matched.find(h=>is(h,c))||s.push(c))}return[n,r,s]}function $0(){return on(oa)}/**
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
 */const Op=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=s&63|128):(s&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=s&63|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=s&63|128)}return e},q0=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const s=t[n++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=t[n++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=t[n++],a=t[n++],l=t[n++],c=((s&7)<<18|(i&63)<<12|(a&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const i=t[n++],a=t[n++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},Mp={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<t.length;s+=3){const i=t[s],a=s+1<t.length,l=a?t[s+1]:0,c=s+2<t.length,h=c?t[s+2]:0,d=i>>2,p=(i&3)<<4|l>>4;let g=(l&15)<<2|h>>6,y=h&63;c||(y=64,a||(g=64)),r.push(n[d],n[p],n[g],n[y])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Op(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):q0(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<t.length;){const i=n[t.charAt(s++)],l=s<t.length?n[t.charAt(s)]:0;++s;const h=s<t.length?n[t.charAt(s)]:64;++s;const p=s<t.length?n[t.charAt(s)]:64;if(++s,i==null||l==null||h==null||p==null)throw new H0;const g=i<<2|l>>4;if(r.push(g),h!==64){const y=l<<4&240|h>>2;if(r.push(y),p!==64){const D=h<<6&192|p;r.push(D)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class H0 extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const z0=function(t){const e=Op(t);return Mp.encodeByteArray(e,!0)},ko=function(t){return z0(t).replace(/\./g,"")},Lp=function(t){try{return Mp.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function K0(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const W0=()=>K0().__FIREBASE_DEFAULTS__,G0=()=>{if(typeof process>"u"||typeof process.env>"u")return;const t={}.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},Q0=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Lp(t[1]);return e&&JSON.parse(e)},aa=()=>{try{return W0()||G0()||Q0()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Fp=t=>{var e,n;return(n=(e=aa())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[t]},J0=t=>{const e=Fp(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},Up=()=>{var t;return(t=aa())===null||t===void 0?void 0:t.config},jp=t=>{var e;return(e=aa())===null||e===void 0?void 0:e[`_${t}`]};/**
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
 */class Y0{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
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
 */function X0(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",s=t.iat||0,i=t.sub||t.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},t),l="";return[ko(JSON.stringify(n)),ko(JSON.stringify(a)),l].join(".")}/**
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
 */function Rt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Z0(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Rt())}function ew(){var t;const e=(t=aa())===null||t===void 0?void 0:t.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function tw(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function nw(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function rw(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function sw(){const t=Rt();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function iw(){return!ew()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function ow(){try{return typeof indexedDB=="object"}catch{return!1}}function aw(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(n){e(n)}})}/**
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
 */const lw="FirebaseError";class Vn extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=lw,Object.setPrototypeOf(this,Vn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ii.prototype.create)}}class Ii{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?cw(i,r):"Error",l=`${this.serviceName}: ${a} (${s}).`;return new Vn(s,l,r)}}function cw(t,e){return t.replace(uw,(n,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const uw=/\{\$([^}]+)}/g;function hw(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Do(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const s of n){if(!r.includes(s))return!1;const i=t[s],a=e[s];if(td(i)&&td(a)){if(!Do(i,a))return!1}else if(i!==a)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function td(t){return t!==null&&typeof t=="object"}/**
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
 */function bi(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function dw(t,e){const n=new fw(t,e);return n.subscribe.bind(n)}class fw{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let s;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");pw(e,["next","error","complete"])?s=e:s={next:e,error:n,complete:r},s.next===void 0&&(s.next=al),s.error===void 0&&(s.error=al),s.complete===void 0&&(s.complete=al);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function pw(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function al(){}/**
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
 */function St(t){return t&&t._delegate?t._delegate:t}class Ar{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const Er="[DEFAULT]";/**
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
 */class mw{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new Y0;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:n});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(_w(e))try{this.getOrInitializeService({instanceIdentifier:Er})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=Er){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Er){return this.instances.has(e)}getOptions(e=Er){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[i,a]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(i);r===l&&a.resolve(s)}return s}onInit(e,n){var r;const s=this.normalizeInstanceIdentifier(n),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const a=this.instances.get(s);return a&&e(a,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const s of r)try{s(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:gw(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Er){return this.component?this.component.multipleInstances?e:Er:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function gw(t){return t===Er?void 0:t}function _w(t){return t.instantiationMode==="EAGER"}/**
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
 */class yw{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new mw(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var Pe;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(Pe||(Pe={}));const vw={debug:Pe.DEBUG,verbose:Pe.VERBOSE,info:Pe.INFO,warn:Pe.WARN,error:Pe.ERROR,silent:Pe.SILENT},ww=Pe.INFO,Ew={[Pe.DEBUG]:"log",[Pe.VERBOSE]:"log",[Pe.INFO]:"info",[Pe.WARN]:"warn",[Pe.ERROR]:"error"},Tw=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),s=Ew[e];if(s)console[s](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Ac{constructor(e){this.name=e,this._logLevel=ww,this._logHandler=Tw,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Pe))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?vw[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Pe.DEBUG,...e),this._logHandler(this,Pe.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Pe.VERBOSE,...e),this._logHandler(this,Pe.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Pe.INFO,...e),this._logHandler(this,Pe.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Pe.WARN,...e),this._logHandler(this,Pe.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Pe.ERROR,...e),this._logHandler(this,Pe.ERROR,...e)}}const Iw=(t,e)=>e.some(n=>t instanceof n);let nd,rd;function bw(){return nd||(nd=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Aw(){return rd||(rd=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Bp=new WeakMap,Ol=new WeakMap,$p=new WeakMap,ll=new WeakMap,Rc=new WeakMap;function Rw(t){const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("success",i),t.removeEventListener("error",a)},i=()=>{n(Jn(t.result)),s()},a=()=>{r(t.error),s()};t.addEventListener("success",i),t.addEventListener("error",a)});return e.then(n=>{n instanceof IDBCursor&&Bp.set(n,t)}).catch(()=>{}),Rc.set(e,t),e}function Sw(t){if(Ol.has(t))return;const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",a),t.removeEventListener("abort",a)},i=()=>{n(),s()},a=()=>{r(t.error||new DOMException("AbortError","AbortError")),s()};t.addEventListener("complete",i),t.addEventListener("error",a),t.addEventListener("abort",a)});Ol.set(t,e)}let Ml={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return Ol.get(t);if(e==="objectStoreNames")return t.objectStoreNames||$p.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Jn(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function Pw(t){Ml=t(Ml)}function Cw(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(cl(this),e,...n);return $p.set(r,e.sort?e.sort():[e]),Jn(r)}:Aw().includes(t)?function(...e){return t.apply(cl(this),e),Jn(Bp.get(this))}:function(...e){return Jn(t.apply(cl(this),e))}}function xw(t){return typeof t=="function"?Cw(t):(t instanceof IDBTransaction&&Sw(t),Iw(t,bw())?new Proxy(t,Ml):t)}function Jn(t){if(t instanceof IDBRequest)return Rw(t);if(ll.has(t))return ll.get(t);const e=xw(t);return e!==t&&(ll.set(t,e),Rc.set(e,t)),e}const cl=t=>Rc.get(t);function kw(t,e,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const a=indexedDB.open(t,e),l=Jn(a);return r&&a.addEventListener("upgradeneeded",c=>{r(Jn(a.result),c.oldVersion,c.newVersion,Jn(a.transaction),c)}),n&&a.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),l.then(c=>{i&&c.addEventListener("close",()=>i()),s&&c.addEventListener("versionchange",h=>s(h.oldVersion,h.newVersion,h))}).catch(()=>{}),l}const Dw=["get","getKey","getAll","getAllKeys","count"],Vw=["put","add","delete","clear"],ul=new Map;function sd(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(ul.get(e))return ul.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,s=Vw.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(s||Dw.includes(n)))return;const i=async function(a,...l){const c=this.transaction(a,s?"readwrite":"readonly");let h=c.store;return r&&(h=h.index(l.shift())),(await Promise.all([h[n](...l),s&&c.done]))[0]};return ul.set(e,i),i}Pw(t=>({...t,get:(e,n,r)=>sd(e,n)||t.get(e,n,r),has:(e,n)=>!!sd(e,n)||t.has(e,n)}));/**
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
 */class Nw{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(Ow(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function Ow(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Ll="@firebase/app",id="0.10.13";/**
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
 */const Sn=new Ac("@firebase/app"),Mw="@firebase/app-compat",Lw="@firebase/analytics-compat",Fw="@firebase/analytics",Uw="@firebase/app-check-compat",jw="@firebase/app-check",Bw="@firebase/auth",$w="@firebase/auth-compat",qw="@firebase/database",Hw="@firebase/data-connect",zw="@firebase/database-compat",Kw="@firebase/functions",Ww="@firebase/functions-compat",Gw="@firebase/installations",Qw="@firebase/installations-compat",Jw="@firebase/messaging",Yw="@firebase/messaging-compat",Xw="@firebase/performance",Zw="@firebase/performance-compat",eE="@firebase/remote-config",tE="@firebase/remote-config-compat",nE="@firebase/storage",rE="@firebase/storage-compat",sE="@firebase/firestore",iE="@firebase/vertexai-preview",oE="@firebase/firestore-compat",aE="firebase",lE="10.14.1";/**
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
 */const Fl="[DEFAULT]",cE={[Ll]:"fire-core",[Mw]:"fire-core-compat",[Fw]:"fire-analytics",[Lw]:"fire-analytics-compat",[jw]:"fire-app-check",[Uw]:"fire-app-check-compat",[Bw]:"fire-auth",[$w]:"fire-auth-compat",[qw]:"fire-rtdb",[Hw]:"fire-data-connect",[zw]:"fire-rtdb-compat",[Kw]:"fire-fn",[Ww]:"fire-fn-compat",[Gw]:"fire-iid",[Qw]:"fire-iid-compat",[Jw]:"fire-fcm",[Yw]:"fire-fcm-compat",[Xw]:"fire-perf",[Zw]:"fire-perf-compat",[eE]:"fire-rc",[tE]:"fire-rc-compat",[nE]:"fire-gcs",[rE]:"fire-gcs-compat",[sE]:"fire-fst",[oE]:"fire-fst-compat",[iE]:"fire-vertex","fire-js":"fire-js",[aE]:"fire-js-all"};/**
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
 */const Vo=new Map,uE=new Map,Ul=new Map;function od(t,e){try{t.container.addComponent(e)}catch(n){Sn.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function as(t){const e=t.name;if(Ul.has(e))return Sn.debug(`There were multiple attempts to register component ${e}.`),!1;Ul.set(e,t);for(const n of Vo.values())od(n,t);for(const n of uE.values())od(n,t);return!0}function Sc(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function En(t){return t.settings!==void 0}/**
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
 */const hE={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Yn=new Ii("app","Firebase",hE);/**
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
 */class dE{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Ar("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Yn.create("app-deleted",{appName:this._name})}}/**
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
 */const ms=lE;function qp(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Fl,automaticDataCollectionEnabled:!1},e),s=r.name;if(typeof s!="string"||!s)throw Yn.create("bad-app-name",{appName:String(s)});if(n||(n=Up()),!n)throw Yn.create("no-options");const i=Vo.get(s);if(i){if(Do(n,i.options)&&Do(r,i.config))return i;throw Yn.create("duplicate-app",{appName:s})}const a=new yw(s);for(const c of Ul.values())a.addComponent(c);const l=new dE(n,r,a);return Vo.set(s,l),l}function Hp(t=Fl){const e=Vo.get(t);if(!e&&t===Fl&&Up())return qp();if(!e)throw Yn.create("no-app",{appName:t});return e}function Xn(t,e,n){var r;let s=(r=cE[t])!==null&&r!==void 0?r:t;n&&(s+=`-${n}`);const i=s.match(/\s|\//),a=e.match(/\s|\//);if(i||a){const l=[`Unable to register library "${s}" with version "${e}":`];i&&l.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&a&&l.push("and"),a&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Sn.warn(l.join(" "));return}as(new Ar(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const fE="firebase-heartbeat-database",pE=1,hi="firebase-heartbeat-store";let hl=null;function zp(){return hl||(hl=kw(fE,pE,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(hi)}catch(n){console.warn(n)}}}}).catch(t=>{throw Yn.create("idb-open",{originalErrorMessage:t.message})})),hl}async function mE(t){try{const n=(await zp()).transaction(hi),r=await n.objectStore(hi).get(Kp(t));return await n.done,r}catch(e){if(e instanceof Vn)Sn.warn(e.message);else{const n=Yn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Sn.warn(n.message)}}}async function ad(t,e){try{const r=(await zp()).transaction(hi,"readwrite");await r.objectStore(hi).put(e,Kp(t)),await r.done}catch(n){if(n instanceof Vn)Sn.warn(n.message);else{const r=Yn.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Sn.warn(r.message)}}}function Kp(t){return`${t.name}!${t.options.appId}`}/**
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
 */const gE=1024,_E=30*24*60*60*1e3;class yE{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new wE(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=ld();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const l=new Date(a.date).valueOf();return Date.now()-l<=_E}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Sn.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=ld(),{heartbeatsToSend:r,unsentEntries:s}=vE(this._heartbeatsCache.heartbeats),i=ko(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(n){return Sn.warn(n),""}}}function ld(){return new Date().toISOString().substring(0,10)}function vE(t,e=gE){const n=[];let r=t.slice();for(const s of t){const i=n.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),cd(n)>e){i.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),cd(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class wE{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return ow()?aw().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await mE(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return ad(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return ad(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function cd(t){return ko(JSON.stringify({version:2,heartbeats:t})).length}/**
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
 */function EE(t){as(new Ar("platform-logger",e=>new Nw(e),"PRIVATE")),as(new Ar("heartbeat",e=>new yE(e),"PRIVATE")),Xn(Ll,id,t),Xn(Ll,id,"esm2017"),Xn("fire-js","")}EE("");var TE="firebase",IE="10.14.1";/**
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
 */Xn(TE,IE,"app");var ud=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var br,Wp;(function(){var t;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(I,v){function T(){}T.prototype=v.prototype,I.D=v.prototype,I.prototype=new T,I.prototype.constructor=I,I.C=function(b,A,P){for(var E=Array(arguments.length-2),tt=2;tt<arguments.length;tt++)E[tt-2]=arguments[tt];return v.prototype[A].apply(b,E)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,n),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(I,v,T){T||(T=0);var b=Array(16);if(typeof v=="string")for(var A=0;16>A;++A)b[A]=v.charCodeAt(T++)|v.charCodeAt(T++)<<8|v.charCodeAt(T++)<<16|v.charCodeAt(T++)<<24;else for(A=0;16>A;++A)b[A]=v[T++]|v[T++]<<8|v[T++]<<16|v[T++]<<24;v=I.g[0],T=I.g[1],A=I.g[2];var P=I.g[3],E=v+(P^T&(A^P))+b[0]+3614090360&4294967295;v=T+(E<<7&4294967295|E>>>25),E=P+(A^v&(T^A))+b[1]+3905402710&4294967295,P=v+(E<<12&4294967295|E>>>20),E=A+(T^P&(v^T))+b[2]+606105819&4294967295,A=P+(E<<17&4294967295|E>>>15),E=T+(v^A&(P^v))+b[3]+3250441966&4294967295,T=A+(E<<22&4294967295|E>>>10),E=v+(P^T&(A^P))+b[4]+4118548399&4294967295,v=T+(E<<7&4294967295|E>>>25),E=P+(A^v&(T^A))+b[5]+1200080426&4294967295,P=v+(E<<12&4294967295|E>>>20),E=A+(T^P&(v^T))+b[6]+2821735955&4294967295,A=P+(E<<17&4294967295|E>>>15),E=T+(v^A&(P^v))+b[7]+4249261313&4294967295,T=A+(E<<22&4294967295|E>>>10),E=v+(P^T&(A^P))+b[8]+1770035416&4294967295,v=T+(E<<7&4294967295|E>>>25),E=P+(A^v&(T^A))+b[9]+2336552879&4294967295,P=v+(E<<12&4294967295|E>>>20),E=A+(T^P&(v^T))+b[10]+4294925233&4294967295,A=P+(E<<17&4294967295|E>>>15),E=T+(v^A&(P^v))+b[11]+2304563134&4294967295,T=A+(E<<22&4294967295|E>>>10),E=v+(P^T&(A^P))+b[12]+1804603682&4294967295,v=T+(E<<7&4294967295|E>>>25),E=P+(A^v&(T^A))+b[13]+4254626195&4294967295,P=v+(E<<12&4294967295|E>>>20),E=A+(T^P&(v^T))+b[14]+2792965006&4294967295,A=P+(E<<17&4294967295|E>>>15),E=T+(v^A&(P^v))+b[15]+1236535329&4294967295,T=A+(E<<22&4294967295|E>>>10),E=v+(A^P&(T^A))+b[1]+4129170786&4294967295,v=T+(E<<5&4294967295|E>>>27),E=P+(T^A&(v^T))+b[6]+3225465664&4294967295,P=v+(E<<9&4294967295|E>>>23),E=A+(v^T&(P^v))+b[11]+643717713&4294967295,A=P+(E<<14&4294967295|E>>>18),E=T+(P^v&(A^P))+b[0]+3921069994&4294967295,T=A+(E<<20&4294967295|E>>>12),E=v+(A^P&(T^A))+b[5]+3593408605&4294967295,v=T+(E<<5&4294967295|E>>>27),E=P+(T^A&(v^T))+b[10]+38016083&4294967295,P=v+(E<<9&4294967295|E>>>23),E=A+(v^T&(P^v))+b[15]+3634488961&4294967295,A=P+(E<<14&4294967295|E>>>18),E=T+(P^v&(A^P))+b[4]+3889429448&4294967295,T=A+(E<<20&4294967295|E>>>12),E=v+(A^P&(T^A))+b[9]+568446438&4294967295,v=T+(E<<5&4294967295|E>>>27),E=P+(T^A&(v^T))+b[14]+3275163606&4294967295,P=v+(E<<9&4294967295|E>>>23),E=A+(v^T&(P^v))+b[3]+4107603335&4294967295,A=P+(E<<14&4294967295|E>>>18),E=T+(P^v&(A^P))+b[8]+1163531501&4294967295,T=A+(E<<20&4294967295|E>>>12),E=v+(A^P&(T^A))+b[13]+2850285829&4294967295,v=T+(E<<5&4294967295|E>>>27),E=P+(T^A&(v^T))+b[2]+4243563512&4294967295,P=v+(E<<9&4294967295|E>>>23),E=A+(v^T&(P^v))+b[7]+1735328473&4294967295,A=P+(E<<14&4294967295|E>>>18),E=T+(P^v&(A^P))+b[12]+2368359562&4294967295,T=A+(E<<20&4294967295|E>>>12),E=v+(T^A^P)+b[5]+4294588738&4294967295,v=T+(E<<4&4294967295|E>>>28),E=P+(v^T^A)+b[8]+2272392833&4294967295,P=v+(E<<11&4294967295|E>>>21),E=A+(P^v^T)+b[11]+1839030562&4294967295,A=P+(E<<16&4294967295|E>>>16),E=T+(A^P^v)+b[14]+4259657740&4294967295,T=A+(E<<23&4294967295|E>>>9),E=v+(T^A^P)+b[1]+2763975236&4294967295,v=T+(E<<4&4294967295|E>>>28),E=P+(v^T^A)+b[4]+1272893353&4294967295,P=v+(E<<11&4294967295|E>>>21),E=A+(P^v^T)+b[7]+4139469664&4294967295,A=P+(E<<16&4294967295|E>>>16),E=T+(A^P^v)+b[10]+3200236656&4294967295,T=A+(E<<23&4294967295|E>>>9),E=v+(T^A^P)+b[13]+681279174&4294967295,v=T+(E<<4&4294967295|E>>>28),E=P+(v^T^A)+b[0]+3936430074&4294967295,P=v+(E<<11&4294967295|E>>>21),E=A+(P^v^T)+b[3]+3572445317&4294967295,A=P+(E<<16&4294967295|E>>>16),E=T+(A^P^v)+b[6]+76029189&4294967295,T=A+(E<<23&4294967295|E>>>9),E=v+(T^A^P)+b[9]+3654602809&4294967295,v=T+(E<<4&4294967295|E>>>28),E=P+(v^T^A)+b[12]+3873151461&4294967295,P=v+(E<<11&4294967295|E>>>21),E=A+(P^v^T)+b[15]+530742520&4294967295,A=P+(E<<16&4294967295|E>>>16),E=T+(A^P^v)+b[2]+3299628645&4294967295,T=A+(E<<23&4294967295|E>>>9),E=v+(A^(T|~P))+b[0]+4096336452&4294967295,v=T+(E<<6&4294967295|E>>>26),E=P+(T^(v|~A))+b[7]+1126891415&4294967295,P=v+(E<<10&4294967295|E>>>22),E=A+(v^(P|~T))+b[14]+2878612391&4294967295,A=P+(E<<15&4294967295|E>>>17),E=T+(P^(A|~v))+b[5]+4237533241&4294967295,T=A+(E<<21&4294967295|E>>>11),E=v+(A^(T|~P))+b[12]+1700485571&4294967295,v=T+(E<<6&4294967295|E>>>26),E=P+(T^(v|~A))+b[3]+2399980690&4294967295,P=v+(E<<10&4294967295|E>>>22),E=A+(v^(P|~T))+b[10]+4293915773&4294967295,A=P+(E<<15&4294967295|E>>>17),E=T+(P^(A|~v))+b[1]+2240044497&4294967295,T=A+(E<<21&4294967295|E>>>11),E=v+(A^(T|~P))+b[8]+1873313359&4294967295,v=T+(E<<6&4294967295|E>>>26),E=P+(T^(v|~A))+b[15]+4264355552&4294967295,P=v+(E<<10&4294967295|E>>>22),E=A+(v^(P|~T))+b[6]+2734768916&4294967295,A=P+(E<<15&4294967295|E>>>17),E=T+(P^(A|~v))+b[13]+1309151649&4294967295,T=A+(E<<21&4294967295|E>>>11),E=v+(A^(T|~P))+b[4]+4149444226&4294967295,v=T+(E<<6&4294967295|E>>>26),E=P+(T^(v|~A))+b[11]+3174756917&4294967295,P=v+(E<<10&4294967295|E>>>22),E=A+(v^(P|~T))+b[2]+718787259&4294967295,A=P+(E<<15&4294967295|E>>>17),E=T+(P^(A|~v))+b[9]+3951481745&4294967295,I.g[0]=I.g[0]+v&4294967295,I.g[1]=I.g[1]+(A+(E<<21&4294967295|E>>>11))&4294967295,I.g[2]=I.g[2]+A&4294967295,I.g[3]=I.g[3]+P&4294967295}r.prototype.u=function(I,v){v===void 0&&(v=I.length);for(var T=v-this.blockSize,b=this.B,A=this.h,P=0;P<v;){if(A==0)for(;P<=T;)s(this,I,P),P+=this.blockSize;if(typeof I=="string"){for(;P<v;)if(b[A++]=I.charCodeAt(P++),A==this.blockSize){s(this,b),A=0;break}}else for(;P<v;)if(b[A++]=I[P++],A==this.blockSize){s(this,b),A=0;break}}this.h=A,this.o+=v},r.prototype.v=function(){var I=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);I[0]=128;for(var v=1;v<I.length-8;++v)I[v]=0;var T=8*this.o;for(v=I.length-8;v<I.length;++v)I[v]=T&255,T/=256;for(this.u(I),I=Array(16),v=T=0;4>v;++v)for(var b=0;32>b;b+=8)I[T++]=this.g[v]>>>b&255;return I};function i(I,v){var T=l;return Object.prototype.hasOwnProperty.call(T,I)?T[I]:T[I]=v(I)}function a(I,v){this.h=v;for(var T=[],b=!0,A=I.length-1;0<=A;A--){var P=I[A]|0;b&&P==v||(T[A]=P,b=!1)}this.g=T}var l={};function c(I){return-128<=I&&128>I?i(I,function(v){return new a([v|0],0>v?-1:0)}):new a([I|0],0>I?-1:0)}function h(I){if(isNaN(I)||!isFinite(I))return p;if(0>I)return x(h(-I));for(var v=[],T=1,b=0;I>=T;b++)v[b]=I/T|0,T*=4294967296;return new a(v,0)}function d(I,v){if(I.length==0)throw Error("number format error: empty string");if(v=v||10,2>v||36<v)throw Error("radix out of range: "+v);if(I.charAt(0)=="-")return x(d(I.substring(1),v));if(0<=I.indexOf("-"))throw Error('number format error: interior "-" character');for(var T=h(Math.pow(v,8)),b=p,A=0;A<I.length;A+=8){var P=Math.min(8,I.length-A),E=parseInt(I.substring(A,A+P),v);8>P?(P=h(Math.pow(v,P)),b=b.j(P).add(h(E))):(b=b.j(T),b=b.add(h(E)))}return b}var p=c(0),g=c(1),y=c(16777216);t=a.prototype,t.m=function(){if(O(this))return-x(this).m();for(var I=0,v=1,T=0;T<this.g.length;T++){var b=this.i(T);I+=(0<=b?b:4294967296+b)*v,v*=4294967296}return I},t.toString=function(I){if(I=I||10,2>I||36<I)throw Error("radix out of range: "+I);if(D(this))return"0";if(O(this))return"-"+x(this).toString(I);for(var v=h(Math.pow(I,6)),T=this,b="";;){var A=J(T,v).g;T=q(T,A.j(v));var P=((0<T.g.length?T.g[0]:T.h)>>>0).toString(I);if(T=A,D(T))return P+b;for(;6>P.length;)P="0"+P;b=P+b}},t.i=function(I){return 0>I?0:I<this.g.length?this.g[I]:this.h};function D(I){if(I.h!=0)return!1;for(var v=0;v<I.g.length;v++)if(I.g[v]!=0)return!1;return!0}function O(I){return I.h==-1}t.l=function(I){return I=q(this,I),O(I)?-1:D(I)?0:1};function x(I){for(var v=I.g.length,T=[],b=0;b<v;b++)T[b]=~I.g[b];return new a(T,~I.h).add(g)}t.abs=function(){return O(this)?x(this):this},t.add=function(I){for(var v=Math.max(this.g.length,I.g.length),T=[],b=0,A=0;A<=v;A++){var P=b+(this.i(A)&65535)+(I.i(A)&65535),E=(P>>>16)+(this.i(A)>>>16)+(I.i(A)>>>16);b=E>>>16,P&=65535,E&=65535,T[A]=E<<16|P}return new a(T,T[T.length-1]&-2147483648?-1:0)};function q(I,v){return I.add(x(v))}t.j=function(I){if(D(this)||D(I))return p;if(O(this))return O(I)?x(this).j(x(I)):x(x(this).j(I));if(O(I))return x(this.j(x(I)));if(0>this.l(y)&&0>I.l(y))return h(this.m()*I.m());for(var v=this.g.length+I.g.length,T=[],b=0;b<2*v;b++)T[b]=0;for(b=0;b<this.g.length;b++)for(var A=0;A<I.g.length;A++){var P=this.i(b)>>>16,E=this.i(b)&65535,tt=I.i(A)>>>16,ot=I.i(A)&65535;T[2*b+2*A]+=E*ot,j(T,2*b+2*A),T[2*b+2*A+1]+=P*ot,j(T,2*b+2*A+1),T[2*b+2*A+1]+=E*tt,j(T,2*b+2*A+1),T[2*b+2*A+2]+=P*tt,j(T,2*b+2*A+2)}for(b=0;b<v;b++)T[b]=T[2*b+1]<<16|T[2*b];for(b=v;b<2*v;b++)T[b]=0;return new a(T,0)};function j(I,v){for(;(I[v]&65535)!=I[v];)I[v+1]+=I[v]>>>16,I[v]&=65535,v++}function G(I,v){this.g=I,this.h=v}function J(I,v){if(D(v))throw Error("division by zero");if(D(I))return new G(p,p);if(O(I))return v=J(x(I),v),new G(x(v.g),x(v.h));if(O(v))return v=J(I,x(v)),new G(x(v.g),v.h);if(30<I.g.length){if(O(I)||O(v))throw Error("slowDivide_ only works with positive integers.");for(var T=g,b=v;0>=b.l(I);)T=ge(T),b=ge(b);var A=_e(T,1),P=_e(b,1);for(b=_e(b,2),T=_e(T,2);!D(b);){var E=P.add(b);0>=E.l(I)&&(A=A.add(T),P=E),b=_e(b,1),T=_e(T,1)}return v=q(I,A.j(v)),new G(A,v)}for(A=p;0<=I.l(v);){for(T=Math.max(1,Math.floor(I.m()/v.m())),b=Math.ceil(Math.log(T)/Math.LN2),b=48>=b?1:Math.pow(2,b-48),P=h(T),E=P.j(v);O(E)||0<E.l(I);)T-=b,P=h(T),E=P.j(v);D(P)&&(P=g),A=A.add(P),I=q(I,E)}return new G(A,I)}t.A=function(I){return J(this,I).h},t.and=function(I){for(var v=Math.max(this.g.length,I.g.length),T=[],b=0;b<v;b++)T[b]=this.i(b)&I.i(b);return new a(T,this.h&I.h)},t.or=function(I){for(var v=Math.max(this.g.length,I.g.length),T=[],b=0;b<v;b++)T[b]=this.i(b)|I.i(b);return new a(T,this.h|I.h)},t.xor=function(I){for(var v=Math.max(this.g.length,I.g.length),T=[],b=0;b<v;b++)T[b]=this.i(b)^I.i(b);return new a(T,this.h^I.h)};function ge(I){for(var v=I.g.length+1,T=[],b=0;b<v;b++)T[b]=I.i(b)<<1|I.i(b-1)>>>31;return new a(T,I.h)}function _e(I,v){var T=v>>5;v%=32;for(var b=I.g.length-T,A=[],P=0;P<b;P++)A[P]=0<v?I.i(P+T)>>>v|I.i(P+T+1)<<32-v:I.i(P+T);return new a(A,I.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,Wp=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=h,a.fromString=d,br=a}).apply(typeof ud<"u"?ud:typeof self<"u"?self:typeof window<"u"?window:{});var eo=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Gp,Us,Qp,mo,jl,Jp,Yp,Xp;(function(){var t,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,u,f){return o==Array.prototype||o==Object.prototype||(o[u]=f.value),o};function n(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof eo=="object"&&eo];for(var u=0;u<o.length;++u){var f=o[u];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var r=n(this);function s(o,u){if(u)e:{var f=r;o=o.split(".");for(var m=0;m<o.length-1;m++){var S=o[m];if(!(S in f))break e;f=f[S]}o=o[o.length-1],m=f[o],u=u(m),u!=m&&u!=null&&e(f,o,{configurable:!0,writable:!0,value:u})}}function i(o,u){o instanceof String&&(o+="");var f=0,m=!1,S={next:function(){if(!m&&f<o.length){var N=f++;return{value:u(N,o[N]),done:!1}}return m=!0,{done:!0,value:void 0}}};return S[Symbol.iterator]=function(){return S},S}s("Array.prototype.values",function(o){return o||function(){return i(this,function(u,f){return f})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},l=this||self;function c(o){var u=typeof o;return u=u!="object"?u:o?Array.isArray(o)?"array":u:"null",u=="array"||u=="object"&&typeof o.length=="number"}function h(o){var u=typeof o;return u=="object"&&o!=null||u=="function"}function d(o,u,f){return o.call.apply(o.bind,arguments)}function p(o,u,f){if(!o)throw Error();if(2<arguments.length){var m=Array.prototype.slice.call(arguments,2);return function(){var S=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(S,m),o.apply(u,S)}}return function(){return o.apply(u,arguments)}}function g(o,u,f){return g=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?d:p,g.apply(null,arguments)}function y(o,u){var f=Array.prototype.slice.call(arguments,1);return function(){var m=f.slice();return m.push.apply(m,arguments),o.apply(this,m)}}function D(o,u){function f(){}f.prototype=u.prototype,o.aa=u.prototype,o.prototype=new f,o.prototype.constructor=o,o.Qb=function(m,S,N){for(var Y=Array(arguments.length-2),qe=2;qe<arguments.length;qe++)Y[qe-2]=arguments[qe];return u.prototype[S].apply(m,Y)}}function O(o){const u=o.length;if(0<u){const f=Array(u);for(let m=0;m<u;m++)f[m]=o[m];return f}return[]}function x(o,u){for(let f=1;f<arguments.length;f++){const m=arguments[f];if(c(m)){const S=o.length||0,N=m.length||0;o.length=S+N;for(let Y=0;Y<N;Y++)o[S+Y]=m[Y]}else o.push(m)}}class q{constructor(u,f){this.i=u,this.j=f,this.h=0,this.g=null}get(){let u;return 0<this.h?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function j(o){return/^[\s\xa0]*$/.test(o)}function G(){var o=l.navigator;return o&&(o=o.userAgent)?o:""}function J(o){return J[" "](o),o}J[" "]=function(){};var ge=G().indexOf("Gecko")!=-1&&!(G().toLowerCase().indexOf("webkit")!=-1&&G().indexOf("Edge")==-1)&&!(G().indexOf("Trident")!=-1||G().indexOf("MSIE")!=-1)&&G().indexOf("Edge")==-1;function _e(o,u,f){for(const m in o)u.call(f,o[m],m,o)}function I(o,u){for(const f in o)u.call(void 0,o[f],f,o)}function v(o){const u={};for(const f in o)u[f]=o[f];return u}const T="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function b(o,u){let f,m;for(let S=1;S<arguments.length;S++){m=arguments[S];for(f in m)o[f]=m[f];for(let N=0;N<T.length;N++)f=T[N],Object.prototype.hasOwnProperty.call(m,f)&&(o[f]=m[f])}}function A(o){var u=1;o=o.split(":");const f=[];for(;0<u&&o.length;)f.push(o.shift()),u--;return o.length&&f.push(o.join(":")),f}function P(o){l.setTimeout(()=>{throw o},0)}function E(){var o=Ce;let u=null;return o.g&&(u=o.g,o.g=o.g.next,o.g||(o.h=null),u.next=null),u}class tt{constructor(){this.h=this.g=null}add(u,f){const m=ot.get();m.set(u,f),this.h?this.h.next=m:this.g=m,this.h=m}}var ot=new q(()=>new Be,o=>o.reset());class Be{constructor(){this.next=this.g=this.h=null}set(u,f){this.h=u,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let Te,we=!1,Ce=new tt,Fe=()=>{const o=l.Promise.resolve(void 0);Te=()=>{o.then($e)}};var $e=()=>{for(var o;o=E();){try{o.h.call(o.g)}catch(f){P(f)}var u=ot;u.j(o),100>u.h&&(u.h++,o.next=u.g,u.g=o)}we=!1};function Ie(){this.s=this.s,this.C=this.C}Ie.prototype.s=!1,Ie.prototype.ma=function(){this.s||(this.s=!0,this.N())},Ie.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Ke(o,u){this.type=o,this.g=this.target=u,this.defaultPrevented=!1}Ke.prototype.h=function(){this.defaultPrevented=!0};var Wt=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var o=!1,u=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const f=()=>{};l.addEventListener("test",f,u),l.removeEventListener("test",f,u)}catch{}return o}();function $t(o,u){if(Ke.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var f=this.type=o.type,m=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=u,u=o.relatedTarget){if(ge){e:{try{J(u.nodeName);var S=!0;break e}catch{}S=!1}S||(u=null)}}else f=="mouseover"?u=o.fromElement:f=="mouseout"&&(u=o.toElement);this.relatedTarget=u,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:nt[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&$t.aa.h.call(this)}}D($t,Ke);var nt={2:"touch",3:"pen",4:"mouse"};$t.prototype.h=function(){$t.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var F="closure_listenable_"+(1e6*Math.random()|0),te=0;function X(o,u,f,m,S){this.listener=o,this.proxy=null,this.src=u,this.type=f,this.capture=!!m,this.ha=S,this.key=++te,this.da=this.fa=!1}function ne(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function ye(o){this.src=o,this.g={},this.h=0}ye.prototype.add=function(o,u,f,m,S){var N=o.toString();o=this.g[N],o||(o=this.g[N]=[],this.h++);var Y=_(o,u,m,S);return-1<Y?(u=o[Y],f||(u.fa=!1)):(u=new X(u,this.src,N,!!m,S),u.fa=f,o.push(u)),u};function Ne(o,u){var f=u.type;if(f in o.g){var m=o.g[f],S=Array.prototype.indexOf.call(m,u,void 0),N;(N=0<=S)&&Array.prototype.splice.call(m,S,1),N&&(ne(u),o.g[f].length==0&&(delete o.g[f],o.h--))}}function _(o,u,f,m){for(var S=0;S<o.length;++S){var N=o[S];if(!N.da&&N.listener==u&&N.capture==!!f&&N.ha==m)return S}return-1}var w="closure_lm_"+(1e6*Math.random()|0),k={};function B(o,u,f,m,S){if(m&&m.once)return Z(o,u,f,m,S);if(Array.isArray(u)){for(var N=0;N<u.length;N++)B(o,u[N],f,m,S);return null}return f=R(f),o&&o[F]?o.K(u,f,h(m)?!!m.capture:!!m,S):L(o,u,f,!1,m,S)}function L(o,u,f,m,S,N){if(!u)throw Error("Invalid event type");var Y=h(S)?!!S.capture:!!S,qe=ee(o);if(qe||(o[w]=qe=new ye(o)),f=qe.add(u,f,m,Y,N),f.proxy)return f;if(m=$(),f.proxy=m,m.src=o,m.listener=f,o.addEventListener)Wt||(S=Y),S===void 0&&(S=!1),o.addEventListener(u.toString(),m,S);else if(o.attachEvent)o.attachEvent(z(u.toString()),m);else if(o.addListener&&o.removeListener)o.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return f}function $(){function o(f){return u.call(o.src,o.listener,f)}const u=ie;return o}function Z(o,u,f,m,S){if(Array.isArray(u)){for(var N=0;N<u.length;N++)Z(o,u[N],f,m,S);return null}return f=R(f),o&&o[F]?o.L(u,f,h(m)?!!m.capture:!!m,S):L(o,u,f,!0,m,S)}function Q(o,u,f,m,S){if(Array.isArray(u))for(var N=0;N<u.length;N++)Q(o,u[N],f,m,S);else m=h(m)?!!m.capture:!!m,f=R(f),o&&o[F]?(o=o.i,u=String(u).toString(),u in o.g&&(N=o.g[u],f=_(N,f,m,S),-1<f&&(ne(N[f]),Array.prototype.splice.call(N,f,1),N.length==0&&(delete o.g[u],o.h--)))):o&&(o=ee(o))&&(u=o.g[u.toString()],o=-1,u&&(o=_(u,f,m,S)),(f=-1<o?u[o]:null)&&W(f))}function W(o){if(typeof o!="number"&&o&&!o.da){var u=o.src;if(u&&u[F])Ne(u.i,o);else{var f=o.type,m=o.proxy;u.removeEventListener?u.removeEventListener(f,m,o.capture):u.detachEvent?u.detachEvent(z(f),m):u.addListener&&u.removeListener&&u.removeListener(m),(f=ee(u))?(Ne(f,o),f.h==0&&(f.src=null,u[w]=null)):ne(o)}}}function z(o){return o in k?k[o]:k[o]="on"+o}function ie(o,u){if(o.da)o=!0;else{u=new $t(u,this);var f=o.listener,m=o.ha||o.src;o.fa&&W(o),o=f.call(m,u)}return o}function ee(o){return o=o[w],o instanceof ye?o:null}var V="__closure_events_fn_"+(1e9*Math.random()>>>0);function R(o){return typeof o=="function"?o:(o[V]||(o[V]=function(u){return o.handleEvent(u)}),o[V])}function C(){Ie.call(this),this.i=new ye(this),this.M=this,this.F=null}D(C,Ie),C.prototype[F]=!0,C.prototype.removeEventListener=function(o,u,f,m){Q(this,o,u,f,m)};function K(o,u){var f,m=o.F;if(m)for(f=[];m;m=m.F)f.push(m);if(o=o.M,m=u.type||u,typeof u=="string")u=new Ke(u,o);else if(u instanceof Ke)u.target=u.target||o;else{var S=u;u=new Ke(m,o),b(u,S)}if(S=!0,f)for(var N=f.length-1;0<=N;N--){var Y=u.g=f[N];S=oe(Y,m,!0,u)&&S}if(Y=u.g=o,S=oe(Y,m,!0,u)&&S,S=oe(Y,m,!1,u)&&S,f)for(N=0;N<f.length;N++)Y=u.g=f[N],S=oe(Y,m,!1,u)&&S}C.prototype.N=function(){if(C.aa.N.call(this),this.i){var o=this.i,u;for(u in o.g){for(var f=o.g[u],m=0;m<f.length;m++)ne(f[m]);delete o.g[u],o.h--}}this.F=null},C.prototype.K=function(o,u,f,m){return this.i.add(String(o),u,!1,f,m)},C.prototype.L=function(o,u,f,m){return this.i.add(String(o),u,!0,f,m)};function oe(o,u,f,m){if(u=o.i.g[String(u)],!u)return!0;u=u.concat();for(var S=!0,N=0;N<u.length;++N){var Y=u[N];if(Y&&!Y.da&&Y.capture==f){var qe=Y.listener,ht=Y.ha||Y.src;Y.fa&&Ne(o.i,Y),S=qe.call(ht,m)!==!1&&S}}return S&&!m.defaultPrevented}function ve(o,u,f){if(typeof o=="function")f&&(o=g(o,f));else if(o&&typeof o.handleEvent=="function")o=g(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(u)?-1:l.setTimeout(o,u||0)}function le(o){o.g=ve(()=>{o.g=null,o.i&&(o.i=!1,le(o))},o.l);const u=o.h;o.h=null,o.m.apply(null,u)}class ke extends Ie{constructor(u,f){super(),this.m=u,this.l=f,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:le(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Ae(o){Ie.call(this),this.h=o,this.g={}}D(Ae,Ie);var qt=[];function dr(o){_e(o.g,function(u,f){this.g.hasOwnProperty(f)&&W(u)},o),o.g={}}Ae.prototype.N=function(){Ae.aa.N.call(this),dr(this)},Ae.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ut=l.JSON.stringify,Ht=l.JSON.parse,Oi=class{stringify(o){return l.JSON.stringify(o,void 0)}parse(o){return l.JSON.parse(o,void 0)}};function ka(){}ka.prototype.h=null;function _u(o){return o.h||(o.h=o.i())}function yu(){}var Ts={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Da(){Ke.call(this,"d")}D(Da,Ke);function Va(){Ke.call(this,"c")}D(Va,Ke);var fr={},vu=null;function Mi(){return vu=vu||new C}fr.La="serverreachability";function wu(o){Ke.call(this,fr.La,o)}D(wu,Ke);function Is(o){const u=Mi();K(u,new wu(u))}fr.STAT_EVENT="statevent";function Eu(o,u){Ke.call(this,fr.STAT_EVENT,o),this.stat=u}D(Eu,Ke);function Pt(o){const u=Mi();K(u,new Eu(u,o))}fr.Ma="timingevent";function Tu(o,u){Ke.call(this,fr.Ma,o),this.size=u}D(Tu,Ke);function bs(o,u){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){o()},u)}function As(){this.g=!0}As.prototype.xa=function(){this.g=!1};function Kg(o,u,f,m,S,N){o.info(function(){if(o.g)if(N)for(var Y="",qe=N.split("&"),ht=0;ht<qe.length;ht++){var De=qe[ht].split("=");if(1<De.length){var yt=De[0];De=De[1];var vt=yt.split("_");Y=2<=vt.length&&vt[1]=="type"?Y+(yt+"="+De+"&"):Y+(yt+"=redacted&")}}else Y=null;else Y=N;return"XMLHTTP REQ ("+m+") [attempt "+S+"]: "+u+`
`+f+`
`+Y})}function Wg(o,u,f,m,S,N,Y){o.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+S+"]: "+u+`
`+f+`
`+N+" "+Y})}function Or(o,u,f,m){o.info(function(){return"XMLHTTP TEXT ("+u+"): "+Qg(o,f)+(m?" "+m:"")})}function Gg(o,u){o.info(function(){return"TIMEOUT: "+u})}As.prototype.info=function(){};function Qg(o,u){if(!o.g)return u;if(!u)return null;try{var f=JSON.parse(u);if(f){for(o=0;o<f.length;o++)if(Array.isArray(f[o])){var m=f[o];if(!(2>m.length)){var S=m[1];if(Array.isArray(S)&&!(1>S.length)){var N=S[0];if(N!="noop"&&N!="stop"&&N!="close")for(var Y=1;Y<S.length;Y++)S[Y]=""}}}}return ut(f)}catch{return u}}var Li={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Iu={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Na;function Fi(){}D(Fi,ka),Fi.prototype.g=function(){return new XMLHttpRequest},Fi.prototype.i=function(){return{}},Na=new Fi;function Nn(o,u,f,m){this.j=o,this.i=u,this.l=f,this.R=m||1,this.U=new Ae(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new bu}function bu(){this.i=null,this.g="",this.h=!1}var Au={},Oa={};function Ma(o,u,f){o.L=1,o.v=$i(fn(u)),o.m=f,o.P=!0,Ru(o,null)}function Ru(o,u){o.F=Date.now(),Ui(o),o.A=fn(o.v);var f=o.A,m=o.R;Array.isArray(m)||(m=[String(m)]),ju(f.i,"t",m),o.C=0,f=o.j.J,o.h=new bu,o.g=sh(o.j,f?u:null,!o.m),0<o.O&&(o.M=new ke(g(o.Y,o,o.g),o.O)),u=o.U,f=o.g,m=o.ca;var S="readystatechange";Array.isArray(S)||(S&&(qt[0]=S.toString()),S=qt);for(var N=0;N<S.length;N++){var Y=B(f,S[N],m||u.handleEvent,!1,u.h||u);if(!Y)break;u.g[Y.key]=Y}u=o.H?v(o.H):{},o.m?(o.u||(o.u="POST"),u["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,u)):(o.u="GET",o.g.ea(o.A,o.u,null,u)),Is(),Kg(o.i,o.u,o.A,o.l,o.R,o.m)}Nn.prototype.ca=function(o){o=o.target;const u=this.M;u&&pn(o)==3?u.j():this.Y(o)},Nn.prototype.Y=function(o){try{if(o==this.g)e:{const vt=pn(this.g);var u=this.g.Ba();const Fr=this.g.Z();if(!(3>vt)&&(vt!=3||this.g&&(this.h.h||this.g.oa()||Wu(this.g)))){this.J||vt!=4||u==7||(u==8||0>=Fr?Is(3):Is(2)),La(this);var f=this.g.Z();this.X=f;t:if(Su(this)){var m=Wu(this.g);o="";var S=m.length,N=pn(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){pr(this),Rs(this);var Y="";break t}this.h.i=new l.TextDecoder}for(u=0;u<S;u++)this.h.h=!0,o+=this.h.i.decode(m[u],{stream:!(N&&u==S-1)});m.length=0,this.h.g+=o,this.C=0,Y=this.h.g}else Y=this.g.oa();if(this.o=f==200,Wg(this.i,this.u,this.A,this.l,this.R,vt,f),this.o){if(this.T&&!this.K){t:{if(this.g){var qe,ht=this.g;if((qe=ht.g?ht.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!j(qe)){var De=qe;break t}}De=null}if(f=De)Or(this.i,this.l,f,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Fa(this,f);else{this.o=!1,this.s=3,Pt(12),pr(this),Rs(this);break e}}if(this.P){f=!0;let Gt;for(;!this.J&&this.C<Y.length;)if(Gt=Jg(this,Y),Gt==Oa){vt==4&&(this.s=4,Pt(14),f=!1),Or(this.i,this.l,null,"[Incomplete Response]");break}else if(Gt==Au){this.s=4,Pt(15),Or(this.i,this.l,Y,"[Invalid Chunk]"),f=!1;break}else Or(this.i,this.l,Gt,null),Fa(this,Gt);if(Su(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),vt!=4||Y.length!=0||this.h.h||(this.s=1,Pt(16),f=!1),this.o=this.o&&f,!f)Or(this.i,this.l,Y,"[Invalid Chunked Response]"),pr(this),Rs(this);else if(0<Y.length&&!this.W){this.W=!0;var yt=this.j;yt.g==this&&yt.ba&&!yt.M&&(yt.j.info("Great, no buffering proxy detected. Bytes received: "+Y.length),Ha(yt),yt.M=!0,Pt(11))}}else Or(this.i,this.l,Y,null),Fa(this,Y);vt==4&&pr(this),this.o&&!this.J&&(vt==4?eh(this.j,this):(this.o=!1,Ui(this)))}else f_(this.g),f==400&&0<Y.indexOf("Unknown SID")?(this.s=3,Pt(12)):(this.s=0,Pt(13)),pr(this),Rs(this)}}}catch{}finally{}};function Su(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function Jg(o,u){var f=o.C,m=u.indexOf(`
`,f);return m==-1?Oa:(f=Number(u.substring(f,m)),isNaN(f)?Au:(m+=1,m+f>u.length?Oa:(u=u.slice(m,m+f),o.C=m+f,u)))}Nn.prototype.cancel=function(){this.J=!0,pr(this)};function Ui(o){o.S=Date.now()+o.I,Pu(o,o.I)}function Pu(o,u){if(o.B!=null)throw Error("WatchDog timer not null");o.B=bs(g(o.ba,o),u)}function La(o){o.B&&(l.clearTimeout(o.B),o.B=null)}Nn.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(Gg(this.i,this.A),this.L!=2&&(Is(),Pt(17)),pr(this),this.s=2,Rs(this)):Pu(this,this.S-o)};function Rs(o){o.j.G==0||o.J||eh(o.j,o)}function pr(o){La(o);var u=o.M;u&&typeof u.ma=="function"&&u.ma(),o.M=null,dr(o.U),o.g&&(u=o.g,o.g=null,u.abort(),u.ma())}function Fa(o,u){try{var f=o.j;if(f.G!=0&&(f.g==o||Ua(f.h,o))){if(!o.K&&Ua(f.h,o)&&f.G==3){try{var m=f.Da.g.parse(u)}catch{m=null}if(Array.isArray(m)&&m.length==3){var S=m;if(S[0]==0){e:if(!f.u){if(f.g)if(f.g.F+3e3<o.F)Gi(f),Ki(f);else break e;qa(f),Pt(18)}}else f.za=S[1],0<f.za-f.T&&37500>S[2]&&f.F&&f.v==0&&!f.C&&(f.C=bs(g(f.Za,f),6e3));if(1>=ku(f.h)&&f.ca){try{f.ca()}catch{}f.ca=void 0}}else gr(f,11)}else if((o.K||f.g==o)&&Gi(f),!j(u))for(S=f.Da.g.parse(u),u=0;u<S.length;u++){let De=S[u];if(f.T=De[0],De=De[1],f.G==2)if(De[0]=="c"){f.K=De[1],f.ia=De[2];const yt=De[3];yt!=null&&(f.la=yt,f.j.info("VER="+f.la));const vt=De[4];vt!=null&&(f.Aa=vt,f.j.info("SVER="+f.Aa));const Fr=De[5];Fr!=null&&typeof Fr=="number"&&0<Fr&&(m=1.5*Fr,f.L=m,f.j.info("backChannelRequestTimeoutMs_="+m)),m=f;const Gt=o.g;if(Gt){const Ji=Gt.g?Gt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Ji){var N=m.h;N.g||Ji.indexOf("spdy")==-1&&Ji.indexOf("quic")==-1&&Ji.indexOf("h2")==-1||(N.j=N.l,N.g=new Set,N.h&&(ja(N,N.h),N.h=null))}if(m.D){const za=Gt.g?Gt.g.getResponseHeader("X-HTTP-Session-Id"):null;za&&(m.ya=za,We(m.I,m.D,za))}}f.G=3,f.l&&f.l.ua(),f.ba&&(f.R=Date.now()-o.F,f.j.info("Handshake RTT: "+f.R+"ms")),m=f;var Y=o;if(m.qa=rh(m,m.J?m.ia:null,m.W),Y.K){Du(m.h,Y);var qe=Y,ht=m.L;ht&&(qe.I=ht),qe.B&&(La(qe),Ui(qe)),m.g=Y}else Xu(m);0<f.i.length&&Wi(f)}else De[0]!="stop"&&De[0]!="close"||gr(f,7);else f.G==3&&(De[0]=="stop"||De[0]=="close"?De[0]=="stop"?gr(f,7):$a(f):De[0]!="noop"&&f.l&&f.l.ta(De),f.v=0)}}Is(4)}catch{}}var Yg=class{constructor(o,u){this.g=o,this.map=u}};function Cu(o){this.l=o||10,l.PerformanceNavigationTiming?(o=l.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function xu(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function ku(o){return o.h?1:o.g?o.g.size:0}function Ua(o,u){return o.h?o.h==u:o.g?o.g.has(u):!1}function ja(o,u){o.g?o.g.add(u):o.h=u}function Du(o,u){o.h&&o.h==u?o.h=null:o.g&&o.g.has(u)&&o.g.delete(u)}Cu.prototype.cancel=function(){if(this.i=Vu(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Vu(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let u=o.i;for(const f of o.g.values())u=u.concat(f.D);return u}return O(o.i)}function Xg(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(c(o)){for(var u=[],f=o.length,m=0;m<f;m++)u.push(o[m]);return u}u=[],f=0;for(m in o)u[f++]=o[m];return u}function Zg(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(c(o)||typeof o=="string"){var u=[];o=o.length;for(var f=0;f<o;f++)u.push(f);return u}u=[],f=0;for(const m in o)u[f++]=m;return u}}}function Nu(o,u){if(o.forEach&&typeof o.forEach=="function")o.forEach(u,void 0);else if(c(o)||typeof o=="string")Array.prototype.forEach.call(o,u,void 0);else for(var f=Zg(o),m=Xg(o),S=m.length,N=0;N<S;N++)u.call(void 0,m[N],f&&f[N],o)}var Ou=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function e_(o,u){if(o){o=o.split("&");for(var f=0;f<o.length;f++){var m=o[f].indexOf("="),S=null;if(0<=m){var N=o[f].substring(0,m);S=o[f].substring(m+1)}else N=o[f];u(N,S?decodeURIComponent(S.replace(/\+/g," ")):"")}}}function mr(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof mr){this.h=o.h,ji(this,o.j),this.o=o.o,this.g=o.g,Bi(this,o.s),this.l=o.l;var u=o.i,f=new Cs;f.i=u.i,u.g&&(f.g=new Map(u.g),f.h=u.h),Mu(this,f),this.m=o.m}else o&&(u=String(o).match(Ou))?(this.h=!1,ji(this,u[1]||"",!0),this.o=Ss(u[2]||""),this.g=Ss(u[3]||"",!0),Bi(this,u[4]),this.l=Ss(u[5]||"",!0),Mu(this,u[6]||"",!0),this.m=Ss(u[7]||"")):(this.h=!1,this.i=new Cs(null,this.h))}mr.prototype.toString=function(){var o=[],u=this.j;u&&o.push(Ps(u,Lu,!0),":");var f=this.g;return(f||u=="file")&&(o.push("//"),(u=this.o)&&o.push(Ps(u,Lu,!0),"@"),o.push(encodeURIComponent(String(f)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.s,f!=null&&o.push(":",String(f))),(f=this.l)&&(this.g&&f.charAt(0)!="/"&&o.push("/"),o.push(Ps(f,f.charAt(0)=="/"?r_:n_,!0))),(f=this.i.toString())&&o.push("?",f),(f=this.m)&&o.push("#",Ps(f,i_)),o.join("")};function fn(o){return new mr(o)}function ji(o,u,f){o.j=f?Ss(u,!0):u,o.j&&(o.j=o.j.replace(/:$/,""))}function Bi(o,u){if(u){if(u=Number(u),isNaN(u)||0>u)throw Error("Bad port number "+u);o.s=u}else o.s=null}function Mu(o,u,f){u instanceof Cs?(o.i=u,o_(o.i,o.h)):(f||(u=Ps(u,s_)),o.i=new Cs(u,o.h))}function We(o,u,f){o.i.set(u,f)}function $i(o){return We(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function Ss(o,u){return o?u?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function Ps(o,u,f){return typeof o=="string"?(o=encodeURI(o).replace(u,t_),f&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function t_(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Lu=/[#\/\?@]/g,n_=/[#\?:]/g,r_=/[#\?]/g,s_=/[#\?@]/g,i_=/#/g;function Cs(o,u){this.h=this.g=null,this.i=o||null,this.j=!!u}function On(o){o.g||(o.g=new Map,o.h=0,o.i&&e_(o.i,function(u,f){o.add(decodeURIComponent(u.replace(/\+/g," ")),f)}))}t=Cs.prototype,t.add=function(o,u){On(this),this.i=null,o=Mr(this,o);var f=this.g.get(o);return f||this.g.set(o,f=[]),f.push(u),this.h+=1,this};function Fu(o,u){On(o),u=Mr(o,u),o.g.has(u)&&(o.i=null,o.h-=o.g.get(u).length,o.g.delete(u))}function Uu(o,u){return On(o),u=Mr(o,u),o.g.has(u)}t.forEach=function(o,u){On(this),this.g.forEach(function(f,m){f.forEach(function(S){o.call(u,S,m,this)},this)},this)},t.na=function(){On(this);const o=Array.from(this.g.values()),u=Array.from(this.g.keys()),f=[];for(let m=0;m<u.length;m++){const S=o[m];for(let N=0;N<S.length;N++)f.push(u[m])}return f},t.V=function(o){On(this);let u=[];if(typeof o=="string")Uu(this,o)&&(u=u.concat(this.g.get(Mr(this,o))));else{o=Array.from(this.g.values());for(let f=0;f<o.length;f++)u=u.concat(o[f])}return u},t.set=function(o,u){return On(this),this.i=null,o=Mr(this,o),Uu(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[u]),this.h+=1,this},t.get=function(o,u){return o?(o=this.V(o),0<o.length?String(o[0]):u):u};function ju(o,u,f){Fu(o,u),0<f.length&&(o.i=null,o.g.set(Mr(o,u),O(f)),o.h+=f.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],u=Array.from(this.g.keys());for(var f=0;f<u.length;f++){var m=u[f];const N=encodeURIComponent(String(m)),Y=this.V(m);for(m=0;m<Y.length;m++){var S=N;Y[m]!==""&&(S+="="+encodeURIComponent(String(Y[m]))),o.push(S)}}return this.i=o.join("&")};function Mr(o,u){return u=String(u),o.j&&(u=u.toLowerCase()),u}function o_(o,u){u&&!o.j&&(On(o),o.i=null,o.g.forEach(function(f,m){var S=m.toLowerCase();m!=S&&(Fu(this,m),ju(this,S,f))},o)),o.j=u}function a_(o,u){const f=new As;if(l.Image){const m=new Image;m.onload=y(Mn,f,"TestLoadImage: loaded",!0,u,m),m.onerror=y(Mn,f,"TestLoadImage: error",!1,u,m),m.onabort=y(Mn,f,"TestLoadImage: abort",!1,u,m),m.ontimeout=y(Mn,f,"TestLoadImage: timeout",!1,u,m),l.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=o}else u(!1)}function l_(o,u){const f=new As,m=new AbortController,S=setTimeout(()=>{m.abort(),Mn(f,"TestPingServer: timeout",!1,u)},1e4);fetch(o,{signal:m.signal}).then(N=>{clearTimeout(S),N.ok?Mn(f,"TestPingServer: ok",!0,u):Mn(f,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(S),Mn(f,"TestPingServer: error",!1,u)})}function Mn(o,u,f,m,S){try{S&&(S.onload=null,S.onerror=null,S.onabort=null,S.ontimeout=null),m(f)}catch{}}function c_(){this.g=new Oi}function u_(o,u,f){const m=f||"";try{Nu(o,function(S,N){let Y=S;h(S)&&(Y=ut(S)),u.push(m+N+"="+encodeURIComponent(Y))})}catch(S){throw u.push(m+"type="+encodeURIComponent("_badmap")),S}}function qi(o){this.l=o.Ub||null,this.j=o.eb||!1}D(qi,ka),qi.prototype.g=function(){return new Hi(this.l,this.j)},qi.prototype.i=function(o){return function(){return o}}({});function Hi(o,u){C.call(this),this.D=o,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}D(Hi,C),t=Hi.prototype,t.open=function(o,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=u,this.readyState=1,ks(this)},t.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const u={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(u.body=o),(this.D||l).fetch(new Request(this.A,u)).then(this.Sa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,xs(this)),this.readyState=0},t.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,ks(this)),this.g&&(this.readyState=3,ks(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Bu(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function Bu(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}t.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var u=o.value?o.value:new Uint8Array(0);(u=this.v.decode(u,{stream:!o.done}))&&(this.response=this.responseText+=u)}o.done?xs(this):ks(this),this.readyState==3&&Bu(this)}},t.Ra=function(o){this.g&&(this.response=this.responseText=o,xs(this))},t.Qa=function(o){this.g&&(this.response=o,xs(this))},t.ga=function(){this.g&&xs(this)};function xs(o){o.readyState=4,o.l=null,o.j=null,o.v=null,ks(o)}t.setRequestHeader=function(o,u){this.u.append(o,u)},t.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],u=this.h.entries();for(var f=u.next();!f.done;)f=f.value,o.push(f[0]+": "+f[1]),f=u.next();return o.join(`\r
`)};function ks(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(Hi.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function $u(o){let u="";return _e(o,function(f,m){u+=m,u+=":",u+=f,u+=`\r
`}),u}function Ba(o,u,f){e:{for(m in f){var m=!1;break e}m=!0}m||(f=$u(f),typeof o=="string"?f!=null&&encodeURIComponent(String(f)):We(o,u,f))}function Ze(o){C.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}D(Ze,C);var h_=/^https?$/i,d_=["POST","PUT"];t=Ze.prototype,t.Ha=function(o){this.J=o},t.ea=function(o,u,f,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);u=u?u.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Na.g(),this.v=this.o?_u(this.o):_u(Na),this.g.onreadystatechange=g(this.Ea,this);try{this.B=!0,this.g.open(u,String(o),!0),this.B=!1}catch(N){qu(this,N);return}if(o=f||"",f=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var S in m)f.set(S,m[S]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const N of m.keys())f.set(N,m.get(N));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(f.keys()).find(N=>N.toLowerCase()=="content-type"),S=l.FormData&&o instanceof l.FormData,!(0<=Array.prototype.indexOf.call(d_,u,void 0))||m||S||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[N,Y]of f)this.g.setRequestHeader(N,Y);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Ku(this),this.u=!0,this.g.send(o),this.u=!1}catch(N){qu(this,N)}};function qu(o,u){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=u,o.m=5,Hu(o),zi(o)}function Hu(o){o.A||(o.A=!0,K(o,"complete"),K(o,"error"))}t.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,K(this,"complete"),K(this,"abort"),zi(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),zi(this,!0)),Ze.aa.N.call(this)},t.Ea=function(){this.s||(this.B||this.u||this.j?zu(this):this.bb())},t.bb=function(){zu(this)};function zu(o){if(o.h&&typeof a<"u"&&(!o.v[1]||pn(o)!=4||o.Z()!=2)){if(o.u&&pn(o)==4)ve(o.Ea,0,o);else if(K(o,"readystatechange"),pn(o)==4){o.h=!1;try{const Y=o.Z();e:switch(Y){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break e;default:u=!1}var f;if(!(f=u)){var m;if(m=Y===0){var S=String(o.D).match(Ou)[1]||null;!S&&l.self&&l.self.location&&(S=l.self.location.protocol.slice(0,-1)),m=!h_.test(S?S.toLowerCase():"")}f=m}if(f)K(o,"complete"),K(o,"success");else{o.m=6;try{var N=2<pn(o)?o.g.statusText:""}catch{N=""}o.l=N+" ["+o.Z()+"]",Hu(o)}}finally{zi(o)}}}}function zi(o,u){if(o.g){Ku(o);const f=o.g,m=o.v[0]?()=>{}:null;o.g=null,o.v=null,u||K(o,"ready");try{f.onreadystatechange=m}catch{}}}function Ku(o){o.I&&(l.clearTimeout(o.I),o.I=null)}t.isActive=function(){return!!this.g};function pn(o){return o.g?o.g.readyState:0}t.Z=function(){try{return 2<pn(this)?this.g.status:-1}catch{return-1}},t.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.Oa=function(o){if(this.g){var u=this.g.responseText;return o&&u.indexOf(o)==0&&(u=u.substring(o.length)),Ht(u)}};function Wu(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function f_(o){const u={};o=(o.g&&2<=pn(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<o.length;m++){if(j(o[m]))continue;var f=A(o[m]);const S=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const N=u[S]||[];u[S]=N,N.push(f)}I(u,function(m){return m.join(", ")})}t.Ba=function(){return this.m},t.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Ds(o,u,f){return f&&f.internalChannelParams&&f.internalChannelParams[o]||u}function Gu(o){this.Aa=0,this.i=[],this.j=new As,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Ds("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Ds("baseRetryDelayMs",5e3,o),this.cb=Ds("retryDelaySeedMs",1e4,o),this.Wa=Ds("forwardChannelMaxRetries",2,o),this.wa=Ds("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new Cu(o&&o.concurrentRequestLimit),this.Da=new c_,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}t=Gu.prototype,t.la=8,t.G=1,t.connect=function(o,u,f,m){Pt(0),this.W=o,this.H=u||{},f&&m!==void 0&&(this.H.OSID=f,this.H.OAID=m),this.F=this.X,this.I=rh(this,null,this.W),Wi(this)};function $a(o){if(Qu(o),o.G==3){var u=o.U++,f=fn(o.I);if(We(f,"SID",o.K),We(f,"RID",u),We(f,"TYPE","terminate"),Vs(o,f),u=new Nn(o,o.j,u),u.L=2,u.v=$i(fn(f)),f=!1,l.navigator&&l.navigator.sendBeacon)try{f=l.navigator.sendBeacon(u.v.toString(),"")}catch{}!f&&l.Image&&(new Image().src=u.v,f=!0),f||(u.g=sh(u.j,null),u.g.ea(u.v)),u.F=Date.now(),Ui(u)}nh(o)}function Ki(o){o.g&&(Ha(o),o.g.cancel(),o.g=null)}function Qu(o){Ki(o),o.u&&(l.clearTimeout(o.u),o.u=null),Gi(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&l.clearTimeout(o.s),o.s=null)}function Wi(o){if(!xu(o.h)&&!o.s){o.s=!0;var u=o.Ga;Te||Fe(),we||(Te(),we=!0),Ce.add(u,o),o.B=0}}function p_(o,u){return ku(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=u.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=bs(g(o.Ga,o,u),th(o,o.B)),o.B++,!0)}t.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const S=new Nn(this,this.j,o);let N=this.o;if(this.S&&(N?(N=v(N),b(N,this.S)):N=this.S),this.m!==null||this.O||(S.H=N,N=null),this.P)e:{for(var u=0,f=0;f<this.i.length;f++){t:{var m=this.i[f];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break t}m=void 0}if(m===void 0)break;if(u+=m,4096<u){u=f;break e}if(u===4096||f===this.i.length-1){u=f+1;break e}}u=1e3}else u=1e3;u=Yu(this,S,u),f=fn(this.I),We(f,"RID",o),We(f,"CVER",22),this.D&&We(f,"X-HTTP-Session-Id",this.D),Vs(this,f),N&&(this.O?u="headers="+encodeURIComponent(String($u(N)))+"&"+u:this.m&&Ba(f,this.m,N)),ja(this.h,S),this.Ua&&We(f,"TYPE","init"),this.P?(We(f,"$req",u),We(f,"SID","null"),S.T=!0,Ma(S,f,null)):Ma(S,f,u),this.G=2}}else this.G==3&&(o?Ju(this,o):this.i.length==0||xu(this.h)||Ju(this))};function Ju(o,u){var f;u?f=u.l:f=o.U++;const m=fn(o.I);We(m,"SID",o.K),We(m,"RID",f),We(m,"AID",o.T),Vs(o,m),o.m&&o.o&&Ba(m,o.m,o.o),f=new Nn(o,o.j,f,o.B+1),o.m===null&&(f.H=o.o),u&&(o.i=u.D.concat(o.i)),u=Yu(o,f,1e3),f.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),ja(o.h,f),Ma(f,m,u)}function Vs(o,u){o.H&&_e(o.H,function(f,m){We(u,m,f)}),o.l&&Nu({},function(f,m){We(u,m,f)})}function Yu(o,u,f){f=Math.min(o.i.length,f);var m=o.l?g(o.l.Na,o.l,o):null;e:{var S=o.i;let N=-1;for(;;){const Y=["count="+f];N==-1?0<f?(N=S[0].g,Y.push("ofs="+N)):N=0:Y.push("ofs="+N);let qe=!0;for(let ht=0;ht<f;ht++){let De=S[ht].g;const yt=S[ht].map;if(De-=N,0>De)N=Math.max(0,S[ht].g-100),qe=!1;else try{u_(yt,Y,"req"+De+"_")}catch{m&&m(yt)}}if(qe){m=Y.join("&");break e}}}return o=o.i.splice(0,f),u.D=o,m}function Xu(o){if(!o.g&&!o.u){o.Y=1;var u=o.Fa;Te||Fe(),we||(Te(),we=!0),Ce.add(u,o),o.v=0}}function qa(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=bs(g(o.Fa,o),th(o,o.v)),o.v++,!0)}t.Fa=function(){if(this.u=null,Zu(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=bs(g(this.ab,this),o)}},t.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Pt(10),Ki(this),Zu(this))};function Ha(o){o.A!=null&&(l.clearTimeout(o.A),o.A=null)}function Zu(o){o.g=new Nn(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var u=fn(o.qa);We(u,"RID","rpc"),We(u,"SID",o.K),We(u,"AID",o.T),We(u,"CI",o.F?"0":"1"),!o.F&&o.ja&&We(u,"TO",o.ja),We(u,"TYPE","xmlhttp"),Vs(o,u),o.m&&o.o&&Ba(u,o.m,o.o),o.L&&(o.g.I=o.L);var f=o.g;o=o.ia,f.L=1,f.v=$i(fn(u)),f.m=null,f.P=!0,Ru(f,o)}t.Za=function(){this.C!=null&&(this.C=null,Ki(this),qa(this),Pt(19))};function Gi(o){o.C!=null&&(l.clearTimeout(o.C),o.C=null)}function eh(o,u){var f=null;if(o.g==u){Gi(o),Ha(o),o.g=null;var m=2}else if(Ua(o.h,u))f=u.D,Du(o.h,u),m=1;else return;if(o.G!=0){if(u.o)if(m==1){f=u.m?u.m.length:0,u=Date.now()-u.F;var S=o.B;m=Mi(),K(m,new Tu(m,f)),Wi(o)}else Xu(o);else if(S=u.s,S==3||S==0&&0<u.X||!(m==1&&p_(o,u)||m==2&&qa(o)))switch(f&&0<f.length&&(u=o.h,u.i=u.i.concat(f)),S){case 1:gr(o,5);break;case 4:gr(o,10);break;case 3:gr(o,6);break;default:gr(o,2)}}}function th(o,u){let f=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(f*=2),f*u}function gr(o,u){if(o.j.info("Error code "+u),u==2){var f=g(o.fb,o),m=o.Xa;const S=!m;m=new mr(m||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||ji(m,"https"),$i(m),S?a_(m.toString(),f):l_(m.toString(),f)}else Pt(2);o.G=0,o.l&&o.l.sa(u),nh(o),Qu(o)}t.fb=function(o){o?(this.j.info("Successfully pinged google.com"),Pt(2)):(this.j.info("Failed to ping google.com"),Pt(1))};function nh(o){if(o.G=0,o.ka=[],o.l){const u=Vu(o.h);(u.length!=0||o.i.length!=0)&&(x(o.ka,u),x(o.ka,o.i),o.h.i.length=0,O(o.i),o.i.length=0),o.l.ra()}}function rh(o,u,f){var m=f instanceof mr?fn(f):new mr(f);if(m.g!="")u&&(m.g=u+"."+m.g),Bi(m,m.s);else{var S=l.location;m=S.protocol,u=u?u+"."+S.hostname:S.hostname,S=+S.port;var N=new mr(null);m&&ji(N,m),u&&(N.g=u),S&&Bi(N,S),f&&(N.l=f),m=N}return f=o.D,u=o.ya,f&&u&&We(m,f,u),We(m,"VER",o.la),Vs(o,m),m}function sh(o,u,f){if(u&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return u=o.Ca&&!o.pa?new Ze(new qi({eb:f})):new Ze(o.pa),u.Ha(o.J),u}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function ih(){}t=ih.prototype,t.ua=function(){},t.ta=function(){},t.sa=function(){},t.ra=function(){},t.isActive=function(){return!0},t.Na=function(){};function Qi(){}Qi.prototype.g=function(o,u){return new Mt(o,u)};function Mt(o,u){C.call(this),this.g=new Gu(u),this.l=o,this.h=u&&u.messageUrlParams||null,o=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(o?o["X-WebChannel-Content-Type"]=u.messageContentType:o={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.va&&(o?o["X-WebChannel-Client-Profile"]=u.va:o={"X-WebChannel-Client-Profile":u.va}),this.g.S=o,(o=u&&u.Sb)&&!j(o)&&(this.g.m=o),this.v=u&&u.supportsCrossDomainXhr||!1,this.u=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!j(u)&&(this.g.D=u,o=this.h,o!==null&&u in o&&(o=this.h,u in o&&delete o[u])),this.j=new Lr(this)}D(Mt,C),Mt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Mt.prototype.close=function(){$a(this.g)},Mt.prototype.o=function(o){var u=this.g;if(typeof o=="string"){var f={};f.__data__=o,o=f}else this.u&&(f={},f.__data__=ut(o),o=f);u.i.push(new Yg(u.Ya++,o)),u.G==3&&Wi(u)},Mt.prototype.N=function(){this.g.l=null,delete this.j,$a(this.g),delete this.g,Mt.aa.N.call(this)};function oh(o){Da.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var u=o.__sm__;if(u){e:{for(const f in u){o=f;break e}o=void 0}(this.i=o)&&(o=this.i,u=u!==null&&o in u?u[o]:void 0),this.data=u}else this.data=o}D(oh,Da);function ah(){Va.call(this),this.status=1}D(ah,Va);function Lr(o){this.g=o}D(Lr,ih),Lr.prototype.ua=function(){K(this.g,"a")},Lr.prototype.ta=function(o){K(this.g,new oh(o))},Lr.prototype.sa=function(o){K(this.g,new ah)},Lr.prototype.ra=function(){K(this.g,"b")},Qi.prototype.createWebChannel=Qi.prototype.g,Mt.prototype.send=Mt.prototype.o,Mt.prototype.open=Mt.prototype.m,Mt.prototype.close=Mt.prototype.close,Xp=function(){return new Qi},Yp=function(){return Mi()},Jp=fr,jl={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Li.NO_ERROR=0,Li.TIMEOUT=8,Li.HTTP_ERROR=6,mo=Li,Iu.COMPLETE="complete",Qp=Iu,yu.EventType=Ts,Ts.OPEN="a",Ts.CLOSE="b",Ts.ERROR="c",Ts.MESSAGE="d",C.prototype.listen=C.prototype.K,Us=yu,Ze.prototype.listenOnce=Ze.prototype.L,Ze.prototype.getLastError=Ze.prototype.Ka,Ze.prototype.getLastErrorCode=Ze.prototype.Ba,Ze.prototype.getStatus=Ze.prototype.Z,Ze.prototype.getResponseJson=Ze.prototype.Oa,Ze.prototype.getResponseText=Ze.prototype.oa,Ze.prototype.send=Ze.prototype.ea,Ze.prototype.setWithCredentials=Ze.prototype.Ha,Gp=Ze}).apply(typeof eo<"u"?eo:typeof self<"u"?self:typeof window<"u"?window:{});const hd="@firebase/firestore";/**
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
 */class Et{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Et.UNAUTHENTICATED=new Et(null),Et.GOOGLE_CREDENTIALS=new Et("google-credentials-uid"),Et.FIRST_PARTY=new Et("first-party-uid"),Et.MOCK_USER=new Et("mock-user");/**
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
 */let gs="10.14.0";/**
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
 */const Rr=new Ac("@firebase/firestore");function Ls(){return Rr.logLevel}function se(t,...e){if(Rr.logLevel<=Pe.DEBUG){const n=e.map(Pc);Rr.debug(`Firestore (${gs}): ${t}`,...n)}}function Pn(t,...e){if(Rr.logLevel<=Pe.ERROR){const n=e.map(Pc);Rr.error(`Firestore (${gs}): ${t}`,...n)}}function ls(t,...e){if(Rr.logLevel<=Pe.WARN){const n=e.map(Pc);Rr.warn(`Firestore (${gs}): ${t}`,...n)}}function Pc(t){if(typeof t=="string")return t;try{/**
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
*/return function(n){return JSON.stringify(n)}(t)}catch{return t}}/**
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
 */function he(t="Unexpected state"){const e=`FIRESTORE (${gs}) INTERNAL ASSERTION FAILED: `+t;throw Pn(e),new Error(e)}function je(t,e){t||he()}function pe(t,e){return t}/**
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
 */const U={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class re extends Vn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class Zn{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
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
 */class Zp{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class bE{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(Et.UNAUTHENTICATED))}shutdown(){}}class AE{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class RE{constructor(e){this.t=e,this.currentUser=Et.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){je(this.o===void 0);let r=this.i;const s=c=>this.i!==r?(r=this.i,n(c)):Promise.resolve();let i=new Zn;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Zn,e.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const c=i;e.enqueueRetryable(async()=>{await c.promise,await s(this.currentUser)})},l=c=>{se("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(c=>l(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?l(c):(se("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Zn)}},0),a()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?(se("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(je(typeof r.accessToken=="string"),new Zp(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return je(e===null||typeof e=="string"),new Et(e)}}class SE{constructor(e,n,r){this.l=e,this.h=n,this.P=r,this.type="FirstParty",this.user=Et.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class PE{constructor(e,n,r){this.l=e,this.h=n,this.P=r}getToken(){return Promise.resolve(new SE(this.l,this.h,this.P))}start(e,n){e.enqueueRetryable(()=>n(Et.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class CE{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class xE{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,n){je(this.o===void 0);const r=i=>{i.error!=null&&se("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.R;return this.R=i.token,se("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?n(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{se("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):se("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(je(typeof n.token=="string"),this.R=n.token,new CE(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */function kE(t){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}/**
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
 */class em{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const s=kE(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<n&&(r+=e.charAt(s[i]%e.length))}return r}}function Ve(t,e){return t<e?-1:t>e?1:0}function cs(t,e,n){return t.length===e.length&&t.every((r,s)=>n(r,e[s]))}/**
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
 */class at{constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new re(U.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new re(U.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<-62135596800)throw new re(U.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new re(U.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return at.fromMillis(Date.now())}static fromDate(e){return at.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*n));return new at(n,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?Ve(this.nanoseconds,e.nanoseconds):Ve(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
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
 */class fe{constructor(e){this.timestamp=e}static fromTimestamp(e){return new fe(e)}static min(){return new fe(new at(0,0))}static max(){return new fe(new at(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */class di{constructor(e,n,r){n===void 0?n=0:n>e.length&&he(),r===void 0?r=e.length-n:r>e.length-n&&he(),this.segments=e,this.offset=n,this.len=r}get length(){return this.len}isEqual(e){return di.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof di?e.forEach(r=>{n.push(r)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,r=this.limit();n<r;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const r=Math.min(e.length,n.length);for(let s=0;s<r;s++){const i=e.get(s),a=n.get(s);if(i<a)return-1;if(i>a)return 1}return e.length<n.length?-1:e.length>n.length?1:0}}class Ge extends di{construct(e,n,r){return new Ge(e,n,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const n=[];for(const r of e){if(r.indexOf("//")>=0)throw new re(U.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);n.push(...r.split("/").filter(s=>s.length>0))}return new Ge(n)}static emptyPath(){return new Ge([])}}const DE=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class mt extends di{construct(e,n,r){return new mt(e,n,r)}static isValidIdentifier(e){return DE.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),mt.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new mt(["__name__"])}static fromServerFormat(e){const n=[];let r="",s=0;const i=()=>{if(r.length===0)throw new re(U.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let a=!1;for(;s<e.length;){const l=e[s];if(l==="\\"){if(s+1===e.length)throw new re(U.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new re(U.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=c,s+=2}else l==="`"?(a=!a,s++):l!=="."||a?(r+=l,s++):(i(),s++)}if(i(),a)throw new re(U.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new mt(n)}static emptyPath(){return new mt([])}}/**
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
 */class ae{constructor(e){this.path=e}static fromPath(e){return new ae(Ge.fromString(e))}static fromName(e){return new ae(Ge.fromString(e).popFirst(5))}static empty(){return new ae(Ge.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Ge.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return Ge.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new ae(new Ge(e.slice()))}}function VE(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,s=fe.fromTimestamp(r===1e9?new at(n+1,0):new at(n,r));return new sr(s,ae.empty(),e)}function NE(t){return new sr(t.readTime,t.key,-1)}class sr{constructor(e,n,r){this.readTime=e,this.documentKey=n,this.largestBatchId=r}static min(){return new sr(fe.min(),ae.empty(),-1)}static max(){return new sr(fe.max(),ae.empty(),-1)}}function OE(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=ae.comparator(t.documentKey,e.documentKey),n!==0?n:Ve(t.largestBatchId,e.largestBatchId))}/**
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
 */const ME="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class LE{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
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
 */async function Ai(t){if(t.code!==U.FAILED_PRECONDITION||t.message!==ME)throw t;se("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class H{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&he(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new H((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(n,i).next(r,s)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{const n=e();return n instanceof H?n:H.resolve(n)}catch(n){return H.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):H.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):H.reject(n)}static resolve(e){return new H((n,r)=>{n(e)})}static reject(e){return new H((n,r)=>{r(e)})}static waitFor(e){return new H((n,r)=>{let s=0,i=0,a=!1;e.forEach(l=>{++s,l.next(()=>{++i,a&&i===s&&n()},c=>r(c))}),a=!0,i===s&&n()})}static or(e){let n=H.resolve(!1);for(const r of e)n=n.next(s=>s?H.resolve(s):r());return n}static forEach(e,n){const r=[];return e.forEach((s,i)=>{r.push(n.call(this,s,i))}),this.waitFor(r)}static mapArray(e,n){return new H((r,s)=>{const i=e.length,a=new Array(i);let l=0;for(let c=0;c<i;c++){const h=c;n(e[h]).next(d=>{a[h]=d,++l,l===i&&r(a)},d=>s(d))}})}static doWhile(e,n){return new H((r,s)=>{const i=()=>{e()===!0?n().next(()=>{i()},s):r()};i()})}}function FE(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function Ri(t){return t.name==="IndexedDbTransactionError"}/**
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
 */class Cc{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=r=>this.ie(r),this.se=r=>n.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}Cc.oe=-1;function la(t){return t==null}function No(t){return t===0&&1/t==-1/0}function UE(t){return typeof t=="number"&&Number.isInteger(t)&&!No(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}/**
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
 */function dd(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function Dr(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function tm(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}/**
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
 */class Xe{constructor(e,n){this.comparator=e,this.root=n||dt.EMPTY}insert(e,n){return new Xe(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,dt.BLACK,null,null))}remove(e){return new Xe(this.comparator,this.root.remove(e,this.comparator).copy(null,null,dt.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(r===0)return n.value;r<0?n=n.left:r>0&&(n=n.right)}return null}indexOf(e){let n=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return n+r.left.size;s<0?r=r.left:(n+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,r)=>(e(n,r),!1))}toString(){const e=[];return this.inorderTraversal((n,r)=>(e.push(`${n}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new to(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new to(this.root,e,this.comparator,!1)}getReverseIterator(){return new to(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new to(this.root,e,this.comparator,!0)}}class to{constructor(e,n,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=n?r(e.key,n):1,n&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class dt{constructor(e,n,r,s,i){this.key=e,this.value=n,this.color=r??dt.RED,this.left=s??dt.EMPTY,this.right=i??dt.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,r,s,i){return new dt(e??this.key,n??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,n,r),null):i===0?s.copy(null,n,null,null,null):s.copy(null,null,null,null,s.right.insert(e,n,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return dt.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let r,s=this;if(n(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,n),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),n(e,s.key)===0){if(s.right.isEmpty())return dt.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,n))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,dt.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,dt.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw he();const e=this.left.check();if(e!==this.right.check())throw he();return e+(this.isRed()?0:1)}}dt.EMPTY=null,dt.RED=!0,dt.BLACK=!1;dt.EMPTY=new class{constructor(){this.size=0}get key(){throw he()}get value(){throw he()}get color(){throw he()}get left(){throw he()}get right(){throw he()}copy(e,n,r,s,i){return this}insert(e,n,r){return new dt(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class gt{constructor(e){this.comparator=e,this.data=new Xe(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,r)=>(e(n),!1))}forEachInRange(e,n){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;n(s.key)}}forEachWhile(e,n){let r;for(r=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new fd(this.data.getIterator())}getIteratorFrom(e){return new fd(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(r=>{n=n.add(r)}),n}isEqual(e){if(!(e instanceof gt)||this.size!==e.size)return!1;const n=this.data.getIterator(),r=e.data.getIterator();for(;n.hasNext();){const s=n.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(n=>{e.push(n)}),e}toString(){const e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){const n=new gt(this.comparator);return n.data=e,n}}class fd{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
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
 */class jt{constructor(e){this.fields=e,e.sort(mt.comparator)}static empty(){return new jt([])}unionWith(e){let n=new gt(mt.comparator);for(const r of this.fields)n=n.add(r);for(const r of e)n=n.add(r);return new jt(n.toArray())}covers(e){for(const n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return cs(this.fields,e.fields,(n,r)=>n.isEqual(r))}}/**
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
 */class nm extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class _t{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new nm("Invalid base64 string: "+i):i}}(e);return new _t(n)}static fromUint8Array(e){const n=function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i}(e);return new _t(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const r=new Uint8Array(n.length);for(let s=0;s<n.length;s++)r[s]=n.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Ve(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}_t.EMPTY_BYTE_STRING=new _t("");const jE=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function ir(t){if(je(!!t),typeof t=="string"){let e=0;const n=jE.exec(t);if(je(!!n),n[1]){let s=n[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:et(t.seconds),nanos:et(t.nanos)}}function et(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function Sr(t){return typeof t=="string"?_t.fromBase64String(t):_t.fromUint8Array(t)}/**
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
 */function xc(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="server_timestamp"}function kc(t){const e=t.mapValue.fields.__previous_value__;return xc(e)?kc(e):e}function fi(t){const e=ir(t.mapValue.fields.__local_write_time__.timestampValue);return new at(e.seconds,e.nanos)}/**
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
 */class BE{constructor(e,n,r,s,i,a,l,c,h){this.databaseId=e,this.appId=n,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=l,this.longPollingOptions=c,this.useFetchStreams=h}}class pi{constructor(e,n){this.projectId=e,this.database=n||"(default)"}static empty(){return new pi("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof pi&&e.projectId===this.projectId&&e.database===this.database}}/**
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
 */const no={mapValue:{fields:{__type__:{stringValue:"__max__"}}}};function Pr(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?xc(t)?4:qE(t)?9007199254740991:$E(t)?10:11:he()}function dn(t,e){if(t===e)return!0;const n=Pr(t);if(n!==Pr(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return fi(t).isEqual(fi(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const a=ir(s.timestampValue),l=ir(i.timestampValue);return a.seconds===l.seconds&&a.nanos===l.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(s,i){return Sr(s.bytesValue).isEqual(Sr(i.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(s,i){return et(s.geoPointValue.latitude)===et(i.geoPointValue.latitude)&&et(s.geoPointValue.longitude)===et(i.geoPointValue.longitude)}(t,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return et(s.integerValue)===et(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const a=et(s.doubleValue),l=et(i.doubleValue);return a===l?No(a)===No(l):isNaN(a)&&isNaN(l)}return!1}(t,e);case 9:return cs(t.arrayValue.values||[],e.arrayValue.values||[],dn);case 10:case 11:return function(s,i){const a=s.mapValue.fields||{},l=i.mapValue.fields||{};if(dd(a)!==dd(l))return!1;for(const c in a)if(a.hasOwnProperty(c)&&(l[c]===void 0||!dn(a[c],l[c])))return!1;return!0}(t,e);default:return he()}}function mi(t,e){return(t.values||[]).find(n=>dn(n,e))!==void 0}function us(t,e){if(t===e)return 0;const n=Pr(t),r=Pr(e);if(n!==r)return Ve(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return Ve(t.booleanValue,e.booleanValue);case 2:return function(i,a){const l=et(i.integerValue||i.doubleValue),c=et(a.integerValue||a.doubleValue);return l<c?-1:l>c?1:l===c?0:isNaN(l)?isNaN(c)?0:-1:1}(t,e);case 3:return pd(t.timestampValue,e.timestampValue);case 4:return pd(fi(t),fi(e));case 5:return Ve(t.stringValue,e.stringValue);case 6:return function(i,a){const l=Sr(i),c=Sr(a);return l.compareTo(c)}(t.bytesValue,e.bytesValue);case 7:return function(i,a){const l=i.split("/"),c=a.split("/");for(let h=0;h<l.length&&h<c.length;h++){const d=Ve(l[h],c[h]);if(d!==0)return d}return Ve(l.length,c.length)}(t.referenceValue,e.referenceValue);case 8:return function(i,a){const l=Ve(et(i.latitude),et(a.latitude));return l!==0?l:Ve(et(i.longitude),et(a.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return md(t.arrayValue,e.arrayValue);case 10:return function(i,a){var l,c,h,d;const p=i.fields||{},g=a.fields||{},y=(l=p.value)===null||l===void 0?void 0:l.arrayValue,D=(c=g.value)===null||c===void 0?void 0:c.arrayValue,O=Ve(((h=y==null?void 0:y.values)===null||h===void 0?void 0:h.length)||0,((d=D==null?void 0:D.values)===null||d===void 0?void 0:d.length)||0);return O!==0?O:md(y,D)}(t.mapValue,e.mapValue);case 11:return function(i,a){if(i===no.mapValue&&a===no.mapValue)return 0;if(i===no.mapValue)return 1;if(a===no.mapValue)return-1;const l=i.fields||{},c=Object.keys(l),h=a.fields||{},d=Object.keys(h);c.sort(),d.sort();for(let p=0;p<c.length&&p<d.length;++p){const g=Ve(c[p],d[p]);if(g!==0)return g;const y=us(l[c[p]],h[d[p]]);if(y!==0)return y}return Ve(c.length,d.length)}(t.mapValue,e.mapValue);default:throw he()}}function pd(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return Ve(t,e);const n=ir(t),r=ir(e),s=Ve(n.seconds,r.seconds);return s!==0?s:Ve(n.nanos,r.nanos)}function md(t,e){const n=t.values||[],r=e.values||[];for(let s=0;s<n.length&&s<r.length;++s){const i=us(n[s],r[s]);if(i)return i}return Ve(n.length,r.length)}function hs(t){return Bl(t)}function Bl(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){const r=ir(n);return`time(${r.seconds},${r.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return Sr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return ae.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let r="[",s=!0;for(const i of n.values||[])s?s=!1:r+=",",r+=Bl(i);return r+"]"}(t.arrayValue):"mapValue"in t?function(n){const r=Object.keys(n.fields||{}).sort();let s="{",i=!0;for(const a of r)i?i=!1:s+=",",s+=`${a}:${Bl(n.fields[a])}`;return s+"}"}(t.mapValue):he()}function gd(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function $l(t){return!!t&&"integerValue"in t}function Dc(t){return!!t&&"arrayValue"in t}function _d(t){return!!t&&"nullValue"in t}function yd(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function go(t){return!!t&&"mapValue"in t}function $E(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="__vector__"}function Ys(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return Dr(t.mapValue.fields,(n,r)=>e.mapValue.fields[n]=Ys(r)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=Ys(t.arrayValue.values[n]);return e}return Object.assign({},t)}function qE(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
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
 */class Vt{constructor(e){this.value=e}static empty(){return new Vt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let r=0;r<e.length-1;++r)if(n=(n.mapValue.fields||{})[e.get(r)],!go(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ys(n)}setAll(e){let n=mt.emptyPath(),r={},s=[];e.forEach((a,l)=>{if(!n.isImmediateParentOf(l)){const c=this.getFieldsMap(n);this.applyChanges(c,r,s),r={},s=[],n=l.popLast()}a?r[l.lastSegment()]=Ys(a):s.push(l.lastSegment())});const i=this.getFieldsMap(n);this.applyChanges(i,r,s)}delete(e){const n=this.field(e.popLast());go(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return dn(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=n.mapValue.fields[e.get(r)];go(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},n.mapValue.fields[e.get(r)]=s),n=s}return n.mapValue.fields}applyChanges(e,n,r){Dr(n,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new Vt(Ys(this.value))}}function rm(t){const e=[];return Dr(t.fields,(n,r)=>{const s=new mt([n]);if(go(r)){const i=rm(r.mapValue).fields;if(i.length===0)e.push(s);else for(const a of i)e.push(s.child(a))}else e.push(s)}),new jt(e)}/**
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
 */class It{constructor(e,n,r,s,i,a,l){this.key=e,this.documentType=n,this.version=r,this.readTime=s,this.createTime=i,this.data=a,this.documentState=l}static newInvalidDocument(e){return new It(e,0,fe.min(),fe.min(),fe.min(),Vt.empty(),0)}static newFoundDocument(e,n,r,s){return new It(e,1,n,fe.min(),r,s,0)}static newNoDocument(e,n){return new It(e,2,n,fe.min(),fe.min(),Vt.empty(),0)}static newUnknownDocument(e,n){return new It(e,3,n,fe.min(),fe.min(),Vt.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(fe.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Vt.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Vt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=fe.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof It&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new It(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class Oo{constructor(e,n){this.position=e,this.inclusive=n}}function vd(t,e,n){let r=0;for(let s=0;s<t.position.length;s++){const i=e[s],a=t.position[s];if(i.field.isKeyField()?r=ae.comparator(ae.fromName(a.referenceValue),n.key):r=us(a,n.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function wd(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!dn(t.position[n],e.position[n]))return!1;return!0}/**
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
 */class gi{constructor(e,n="asc"){this.field=e,this.dir=n}}function HE(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}/**
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
 */class sm{}class st extends sm{constructor(e,n,r){super(),this.field=e,this.op=n,this.value=r}static create(e,n,r){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,r):new KE(e,n,r):n==="array-contains"?new QE(e,r):n==="in"?new JE(e,r):n==="not-in"?new YE(e,r):n==="array-contains-any"?new XE(e,r):new st(e,n,r)}static createKeyFieldInFilter(e,n,r){return n==="in"?new WE(e,r):new GE(e,r)}matches(e){const n=e.data.field(this.field);return this.op==="!="?n!==null&&this.matchesComparison(us(n,this.value)):n!==null&&Pr(this.value)===Pr(n)&&this.matchesComparison(us(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return he()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class en extends sm{constructor(e,n){super(),this.filters=e,this.op=n,this.ae=null}static create(e,n){return new en(e,n)}matches(e){return im(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function im(t){return t.op==="and"}function om(t){return zE(t)&&im(t)}function zE(t){for(const e of t.filters)if(e instanceof en)return!1;return!0}function ql(t){if(t instanceof st)return t.field.canonicalString()+t.op.toString()+hs(t.value);if(om(t))return t.filters.map(e=>ql(e)).join(",");{const e=t.filters.map(n=>ql(n)).join(",");return`${t.op}(${e})`}}function am(t,e){return t instanceof st?function(r,s){return s instanceof st&&r.op===s.op&&r.field.isEqual(s.field)&&dn(r.value,s.value)}(t,e):t instanceof en?function(r,s){return s instanceof en&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,a,l)=>i&&am(a,s.filters[l]),!0):!1}(t,e):void he()}function lm(t){return t instanceof st?function(n){return`${n.field.canonicalString()} ${n.op} ${hs(n.value)}`}(t):t instanceof en?function(n){return n.op.toString()+" {"+n.getFilters().map(lm).join(" ,")+"}"}(t):"Filter"}class KE extends st{constructor(e,n,r){super(e,n,r),this.key=ae.fromName(r.referenceValue)}matches(e){const n=ae.comparator(e.key,this.key);return this.matchesComparison(n)}}class WE extends st{constructor(e,n){super(e,"in",n),this.keys=cm("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}}class GE extends st{constructor(e,n){super(e,"not-in",n),this.keys=cm("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}}function cm(t,e){var n;return(((n=e.arrayValue)===null||n===void 0?void 0:n.values)||[]).map(r=>ae.fromName(r.referenceValue))}class QE extends st{constructor(e,n){super(e,"array-contains",n)}matches(e){const n=e.data.field(this.field);return Dc(n)&&mi(n.arrayValue,this.value)}}class JE extends st{constructor(e,n){super(e,"in",n)}matches(e){const n=e.data.field(this.field);return n!==null&&mi(this.value.arrayValue,n)}}class YE extends st{constructor(e,n){super(e,"not-in",n)}matches(e){if(mi(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const n=e.data.field(this.field);return n!==null&&!mi(this.value.arrayValue,n)}}class XE extends st{constructor(e,n){super(e,"array-contains-any",n)}matches(e){const n=e.data.field(this.field);return!(!Dc(n)||!n.arrayValue.values)&&n.arrayValue.values.some(r=>mi(this.value.arrayValue,r))}}/**
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
 */class ZE{constructor(e,n=null,r=[],s=[],i=null,a=null,l=null){this.path=e,this.collectionGroup=n,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=a,this.endAt=l,this.ue=null}}function Ed(t,e=null,n=[],r=[],s=null,i=null,a=null){return new ZE(t,e,n,r,s,i,a)}function Vc(t){const e=pe(t);if(e.ue===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(r=>ql(r)).join(","),n+="|ob:",n+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),la(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(r=>hs(r)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(r=>hs(r)).join(",")),e.ue=n}return e.ue}function Nc(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!HE(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!am(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!wd(t.startAt,e.startAt)&&wd(t.endAt,e.endAt)}function Hl(t){return ae.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}/**
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
 */class _s{constructor(e,n=null,r=[],s=[],i=null,a="F",l=null,c=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=a,this.startAt=l,this.endAt=c,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function eT(t,e,n,r,s,i,a,l){return new _s(t,e,n,r,s,i,a,l)}function um(t){return new _s(t)}function Td(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function hm(t){return t.collectionGroup!==null}function Xs(t){const e=pe(t);if(e.ce===null){e.ce=[];const n=new Set;for(const i of e.explicitOrderBy)e.ce.push(i),n.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let l=new gt(mt.comparator);return a.filters.forEach(c=>{c.getFlattenedFilters().forEach(h=>{h.isInequality()&&(l=l.add(h.field))})}),l})(e).forEach(i=>{n.has(i.canonicalString())||i.isKeyField()||e.ce.push(new gi(i,r))}),n.has(mt.keyField().canonicalString())||e.ce.push(new gi(mt.keyField(),r))}return e.ce}function an(t){const e=pe(t);return e.le||(e.le=tT(e,Xs(t))),e.le}function tT(t,e){if(t.limitType==="F")return Ed(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new gi(s.field,i)});const n=t.endAt?new Oo(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new Oo(t.startAt.position,t.startAt.inclusive):null;return Ed(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}function zl(t,e){const n=t.filters.concat([e]);return new _s(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function Kl(t,e,n){return new _s(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function ca(t,e){return Nc(an(t),an(e))&&t.limitType===e.limitType}function dm(t){return`${Vc(an(t))}|lt:${t.limitType}`}function Hr(t){return`Query(target=${function(n){let r=n.path.canonicalString();return n.collectionGroup!==null&&(r+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(r+=`, filters: [${n.filters.map(s=>lm(s)).join(", ")}]`),la(n.limit)||(r+=", limit: "+n.limit),n.orderBy.length>0&&(r+=`, orderBy: [${n.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),n.startAt&&(r+=", startAt: ",r+=n.startAt.inclusive?"b:":"a:",r+=n.startAt.position.map(s=>hs(s)).join(",")),n.endAt&&(r+=", endAt: ",r+=n.endAt.inclusive?"a:":"b:",r+=n.endAt.position.map(s=>hs(s)).join(",")),`Target(${r})`}(an(t))}; limitType=${t.limitType})`}function ua(t,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):ae.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(t,e)&&function(r,s){for(const i of Xs(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(t,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(t,e)&&function(r,s){return!(r.startAt&&!function(a,l,c){const h=vd(a,l,c);return a.inclusive?h<=0:h<0}(r.startAt,Xs(r),s)||r.endAt&&!function(a,l,c){const h=vd(a,l,c);return a.inclusive?h>=0:h>0}(r.endAt,Xs(r),s))}(t,e)}function nT(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function fm(t){return(e,n)=>{let r=!1;for(const s of Xs(t)){const i=rT(s,e,n);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function rT(t,e,n){const r=t.field.isKeyField()?ae.comparator(e.key,n.key):function(i,a,l){const c=a.data.field(i),h=l.data.field(i);return c!==null&&h!==null?us(c,h):he()}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return he()}}/**
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
 */class ys{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,n){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,n]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,n]);s.push([e,n]),this.innerSize++}delete(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[n]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Dr(this.inner,(n,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return tm(this.inner)}size(){return this.innerSize}}/**
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
 */const sT=new Xe(ae.comparator);function Cn(){return sT}const pm=new Xe(ae.comparator);function js(...t){let e=pm;for(const n of t)e=e.insert(n.key,n);return e}function mm(t){let e=pm;return t.forEach((n,r)=>e=e.insert(n,r.overlayedDocument)),e}function Tr(){return Zs()}function gm(){return Zs()}function Zs(){return new ys(t=>t.toString(),(t,e)=>t.isEqual(e))}const iT=new Xe(ae.comparator),oT=new gt(ae.comparator);function be(...t){let e=oT;for(const n of t)e=e.add(n);return e}const aT=new gt(Ve);function lT(){return aT}/**
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
 */function Oc(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:No(e)?"-0":e}}function _m(t){return{integerValue:""+t}}function cT(t,e){return UE(e)?_m(e):Oc(t,e)}/**
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
 */class ha{constructor(){this._=void 0}}function uT(t,e,n){return t instanceof _i?function(s,i){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&xc(i)&&(i=kc(i)),i&&(a.fields.__previous_value__=i),{mapValue:a}}(n,e):t instanceof yi?vm(t,e):t instanceof vi?wm(t,e):function(s,i){const a=ym(s,i),l=Id(a)+Id(s.Pe);return $l(a)&&$l(s.Pe)?_m(l):Oc(s.serializer,l)}(t,e)}function hT(t,e,n){return t instanceof yi?vm(t,e):t instanceof vi?wm(t,e):n}function ym(t,e){return t instanceof Mo?function(r){return $l(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class _i extends ha{}class yi extends ha{constructor(e){super(),this.elements=e}}function vm(t,e){const n=Em(e);for(const r of t.elements)n.some(s=>dn(s,r))||n.push(r);return{arrayValue:{values:n}}}class vi extends ha{constructor(e){super(),this.elements=e}}function wm(t,e){let n=Em(e);for(const r of t.elements)n=n.filter(s=>!dn(s,r));return{arrayValue:{values:n}}}class Mo extends ha{constructor(e,n){super(),this.serializer=e,this.Pe=n}}function Id(t){return et(t.integerValue||t.doubleValue)}function Em(t){return Dc(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}/**
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
 */class dT{constructor(e,n){this.field=e,this.transform=n}}function fT(t,e){return t.field.isEqual(e.field)&&function(r,s){return r instanceof yi&&s instanceof yi||r instanceof vi&&s instanceof vi?cs(r.elements,s.elements,dn):r instanceof Mo&&s instanceof Mo?dn(r.Pe,s.Pe):r instanceof _i&&s instanceof _i}(t.transform,e.transform)}class pT{constructor(e,n){this.version=e,this.transformResults=n}}class Ot{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new Ot}static exists(e){return new Ot(void 0,e)}static updateTime(e){return new Ot(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function _o(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}class da{}function Tm(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new fa(t.key,Ot.none()):new Si(t.key,t.data,Ot.none());{const n=t.data,r=Vt.empty();let s=new gt(mt.comparator);for(let i of e.fields)if(!s.has(i)){let a=n.field(i);a===null&&i.length>1&&(i=i.popLast(),a=n.field(i)),a===null?r.delete(i):r.set(i,a),s=s.add(i)}return new hr(t.key,r,new jt(s.toArray()),Ot.none())}}function mT(t,e,n){t instanceof Si?function(s,i,a){const l=s.value.clone(),c=Ad(s.fieldTransforms,i,a.transformResults);l.setAll(c),i.convertToFoundDocument(a.version,l).setHasCommittedMutations()}(t,e,n):t instanceof hr?function(s,i,a){if(!_o(s.precondition,i))return void i.convertToUnknownDocument(a.version);const l=Ad(s.fieldTransforms,i,a.transformResults),c=i.data;c.setAll(Im(s)),c.setAll(l),i.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(t,e,n):function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,n)}function ei(t,e,n,r){return t instanceof Si?function(i,a,l,c){if(!_o(i.precondition,a))return l;const h=i.value.clone(),d=Rd(i.fieldTransforms,c,a);return h.setAll(d),a.convertToFoundDocument(a.version,h).setHasLocalMutations(),null}(t,e,n,r):t instanceof hr?function(i,a,l,c){if(!_o(i.precondition,a))return l;const h=Rd(i.fieldTransforms,c,a),d=a.data;return d.setAll(Im(i)),d.setAll(h),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),l===null?null:l.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(p=>p.field))}(t,e,n,r):function(i,a,l){return _o(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):l}(t,e,n)}function gT(t,e){let n=null;for(const r of t.fieldTransforms){const s=e.data.field(r.field),i=ym(r.transform,s||null);i!=null&&(n===null&&(n=Vt.empty()),n.set(r.field,i))}return n||null}function bd(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&cs(r,s,(i,a)=>fT(i,a))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class Si extends da{constructor(e,n,r,s=[]){super(),this.key=e,this.value=n,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class hr extends da{constructor(e,n,r,s,i=[]){super(),this.key=e,this.data=n,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Im(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function Ad(t,e,n){const r=new Map;je(t.length===n.length);for(let s=0;s<n.length;s++){const i=t[s],a=i.transform,l=e.data.field(i.field);r.set(i.field,hT(a,l,n[s]))}return r}function Rd(t,e,n){const r=new Map;for(const s of t){const i=s.transform,a=n.data.field(s.field);r.set(s.field,uT(i,a,e))}return r}class fa extends da{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class _T extends da{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class yT{constructor(e,n,r,s){this.batchId=e,this.localWriteTime=n,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,n){const r=n.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&mT(i,e,r[s])}}applyToLocalView(e,n){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(n=ei(r,e,n,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(n=ei(r,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){const r=gm();return this.mutations.forEach(s=>{const i=e.get(s.key),a=i.overlayedDocument;let l=this.applyToLocalView(a,i.mutatedFields);l=n.has(s.key)?null:l;const c=Tm(a,l);c!==null&&r.set(s.key,c),a.isValidDocument()||a.convertToNoDocument(fe.min())}),r}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),be())}isEqual(e){return this.batchId===e.batchId&&cs(this.mutations,e.mutations,(n,r)=>bd(n,r))&&cs(this.baseMutations,e.baseMutations,(n,r)=>bd(n,r))}}class Mc{constructor(e,n,r,s){this.batch=e,this.commitVersion=n,this.mutationResults=r,this.docVersions=s}static from(e,n,r){je(e.mutations.length===r.length);let s=function(){return iT}();const i=e.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,r[a].version);return new Mc(e,n,r,s)}}/**
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
 */class vT{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class wT{constructor(e,n){this.count=e,this.unchangedNames=n}}/**
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
 */var rt,xe;function ET(t){switch(t){default:return he();case U.CANCELLED:case U.UNKNOWN:case U.DEADLINE_EXCEEDED:case U.RESOURCE_EXHAUSTED:case U.INTERNAL:case U.UNAVAILABLE:case U.UNAUTHENTICATED:return!1;case U.INVALID_ARGUMENT:case U.NOT_FOUND:case U.ALREADY_EXISTS:case U.PERMISSION_DENIED:case U.FAILED_PRECONDITION:case U.ABORTED:case U.OUT_OF_RANGE:case U.UNIMPLEMENTED:case U.DATA_LOSS:return!0}}function bm(t){if(t===void 0)return Pn("GRPC error has no .code"),U.UNKNOWN;switch(t){case rt.OK:return U.OK;case rt.CANCELLED:return U.CANCELLED;case rt.UNKNOWN:return U.UNKNOWN;case rt.DEADLINE_EXCEEDED:return U.DEADLINE_EXCEEDED;case rt.RESOURCE_EXHAUSTED:return U.RESOURCE_EXHAUSTED;case rt.INTERNAL:return U.INTERNAL;case rt.UNAVAILABLE:return U.UNAVAILABLE;case rt.UNAUTHENTICATED:return U.UNAUTHENTICATED;case rt.INVALID_ARGUMENT:return U.INVALID_ARGUMENT;case rt.NOT_FOUND:return U.NOT_FOUND;case rt.ALREADY_EXISTS:return U.ALREADY_EXISTS;case rt.PERMISSION_DENIED:return U.PERMISSION_DENIED;case rt.FAILED_PRECONDITION:return U.FAILED_PRECONDITION;case rt.ABORTED:return U.ABORTED;case rt.OUT_OF_RANGE:return U.OUT_OF_RANGE;case rt.UNIMPLEMENTED:return U.UNIMPLEMENTED;case rt.DATA_LOSS:return U.DATA_LOSS;default:return he()}}(xe=rt||(rt={}))[xe.OK=0]="OK",xe[xe.CANCELLED=1]="CANCELLED",xe[xe.UNKNOWN=2]="UNKNOWN",xe[xe.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",xe[xe.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",xe[xe.NOT_FOUND=5]="NOT_FOUND",xe[xe.ALREADY_EXISTS=6]="ALREADY_EXISTS",xe[xe.PERMISSION_DENIED=7]="PERMISSION_DENIED",xe[xe.UNAUTHENTICATED=16]="UNAUTHENTICATED",xe[xe.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",xe[xe.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",xe[xe.ABORTED=10]="ABORTED",xe[xe.OUT_OF_RANGE=11]="OUT_OF_RANGE",xe[xe.UNIMPLEMENTED=12]="UNIMPLEMENTED",xe[xe.INTERNAL=13]="INTERNAL",xe[xe.UNAVAILABLE=14]="UNAVAILABLE",xe[xe.DATA_LOSS=15]="DATA_LOSS";/**
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
 */function TT(){return new TextEncoder}/**
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
 */const IT=new br([4294967295,4294967295],0);function Sd(t){const e=TT().encode(t),n=new Wp;return n.update(e),new Uint8Array(n.digest())}function Pd(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new br([n,r],0),new br([s,i],0)]}class Lc{constructor(e,n,r){if(this.bitmap=e,this.padding=n,this.hashCount=r,n<0||n>=8)throw new Bs(`Invalid padding: ${n}`);if(r<0)throw new Bs(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Bs(`Invalid hash count: ${r}`);if(e.length===0&&n!==0)throw new Bs(`Invalid padding when bitmap length is 0: ${n}`);this.Ie=8*e.length-n,this.Te=br.fromNumber(this.Ie)}Ee(e,n,r){let s=e.add(n.multiply(br.fromNumber(r)));return s.compare(IT)===1&&(s=new br([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const n=Sd(e),[r,s]=Pd(n);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);if(!this.de(a))return!1}return!0}static create(e,n,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new Lc(i,s,n);return r.forEach(l=>a.insert(l)),a}insert(e){if(this.Ie===0)return;const n=Sd(e),[r,s]=Pd(n);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);this.Ae(a)}}Ae(e){const n=Math.floor(e/8),r=e%8;this.bitmap[n]|=1<<r}}class Bs extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class pa{constructor(e,n,r,s,i){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,n,r){const s=new Map;return s.set(e,Pi.createSynthesizedTargetChangeForCurrentChange(e,n,r)),new pa(fe.min(),s,new Xe(Ve),Cn(),be())}}class Pi{constructor(e,n,r,s,i){this.resumeToken=e,this.current=n,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,n,r){return new Pi(r,n,be(),be(),be())}}/**
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
 */class yo{constructor(e,n,r,s){this.Re=e,this.removedTargetIds=n,this.key=r,this.Ve=s}}class Am{constructor(e,n){this.targetId=e,this.me=n}}class Rm{constructor(e,n,r=_t.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=n,this.resumeToken=r,this.cause=s}}class Cd{constructor(){this.fe=0,this.ge=kd(),this.pe=_t.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=be(),n=be(),r=be();return this.ge.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:n=n.add(s);break;case 1:r=r.add(s);break;default:he()}}),new Pi(this.pe,this.ye,e,n,r)}Ce(){this.we=!1,this.ge=kd()}Fe(e,n){this.we=!0,this.ge=this.ge.insert(e,n)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,je(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class bT{constructor(e){this.Le=e,this.Be=new Map,this.ke=Cn(),this.qe=xd(),this.Qe=new Xe(Ve)}Ke(e){for(const n of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(n,e.Ve):this.Ue(n,e.key,e.Ve);for(const n of e.removedTargetIds)this.Ue(n,e.key,e.Ve)}We(e){this.forEachTarget(e,n=>{const r=this.Ge(n);switch(e.state){case 0:this.ze(n)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(n);break;case 3:this.ze(n)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(n)&&(this.je(n),r.De(e.resumeToken));break;default:he()}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.Be.forEach((r,s)=>{this.ze(s)&&n(s)})}He(e){const n=e.targetId,r=e.me.count,s=this.Je(n);if(s){const i=s.target;if(Hl(i))if(r===0){const a=new ae(i.path);this.Ue(n,a,It.newNoDocument(a,fe.min()))}else je(r===1);else{const a=this.Ye(n);if(a!==r){const l=this.Ze(e),c=l?this.Xe(l,e,a):1;if(c!==0){this.je(n);const h=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(n,h)}}}}}Ze(e){const n=e.me.unchangedNames;if(!n||!n.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=n;let a,l;try{a=Sr(r).toUint8Array()}catch(c){if(c instanceof nm)return ls("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{l=new Lc(a,s,i)}catch(c){return ls(c instanceof Bs?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return l.Ie===0?null:l}Xe(e,n,r){return n.me.count===r-this.nt(e,n.targetId)?0:2}nt(e,n){const r=this.Le.getRemoteKeysForTarget(n);let s=0;return r.forEach(i=>{const a=this.Le.tt(),l=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(l)||(this.Ue(n,i,null),s++)}),s}rt(e){const n=new Map;this.Be.forEach((i,a)=>{const l=this.Je(a);if(l){if(i.current&&Hl(l.target)){const c=new ae(l.target.path);this.ke.get(c)!==null||this.it(a,c)||this.Ue(a,c,It.newNoDocument(c,e))}i.be&&(n.set(a,i.ve()),i.Ce())}});let r=be();this.qe.forEach((i,a)=>{let l=!0;a.forEachWhile(c=>{const h=this.Je(c);return!h||h.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(i))}),this.ke.forEach((i,a)=>a.setReadTime(e));const s=new pa(e,n,this.Qe,this.ke,r);return this.ke=Cn(),this.qe=xd(),this.Qe=new Xe(Ve),s}$e(e,n){if(!this.ze(e))return;const r=this.it(e,n.key)?2:0;this.Ge(e).Fe(n.key,r),this.ke=this.ke.insert(n.key,n),this.qe=this.qe.insert(n.key,this.st(n.key).add(e))}Ue(e,n,r){if(!this.ze(e))return;const s=this.Ge(e);this.it(e,n)?s.Fe(n,1):s.Me(n),this.qe=this.qe.insert(n,this.st(n).delete(e)),r&&(this.ke=this.ke.insert(n,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const n=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let n=this.Be.get(e);return n||(n=new Cd,this.Be.set(e,n)),n}st(e){let n=this.qe.get(e);return n||(n=new gt(Ve),this.qe=this.qe.insert(e,n)),n}ze(e){const n=this.Je(e)!==null;return n||se("WatchChangeAggregator","Detected inactive target",e),n}Je(e){const n=this.Be.get(e);return n&&n.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new Cd),this.Le.getRemoteKeysForTarget(e).forEach(n=>{this.Ue(e,n,null)})}it(e,n){return this.Le.getRemoteKeysForTarget(e).has(n)}}function xd(){return new Xe(ae.comparator)}function kd(){return new Xe(ae.comparator)}const AT=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),RT=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),ST=(()=>({and:"AND",or:"OR"}))();class PT{constructor(e,n){this.databaseId=e,this.useProto3Json=n}}function Wl(t,e){return t.useProto3Json||la(e)?e:{value:e}}function Lo(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Sm(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function CT(t,e){return Lo(t,e.toTimestamp())}function ln(t){return je(!!t),fe.fromTimestamp(function(n){const r=ir(n);return new at(r.seconds,r.nanos)}(t))}function Fc(t,e){return Gl(t,e).canonicalString()}function Gl(t,e){const n=function(s){return new Ge(["projects",s.projectId,"databases",s.database])}(t).child("documents");return e===void 0?n:n.child(e)}function Pm(t){const e=Ge.fromString(t);return je(Vm(e)),e}function Ql(t,e){return Fc(t.databaseId,e.path)}function dl(t,e){const n=Pm(e);if(n.get(1)!==t.databaseId.projectId)throw new re(U.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new re(U.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new ae(xm(n))}function Cm(t,e){return Fc(t.databaseId,e)}function xT(t){const e=Pm(t);return e.length===4?Ge.emptyPath():xm(e)}function Jl(t){return new Ge(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function xm(t){return je(t.length>4&&t.get(4)==="documents"),t.popFirst(5)}function Dd(t,e,n){return{name:Ql(t,e),fields:n.value.mapValue.fields}}function kT(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:he()}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(h,d){return h.useProto3Json?(je(d===void 0||typeof d=="string"),_t.fromBase64String(d||"")):(je(d===void 0||d instanceof Buffer||d instanceof Uint8Array),_t.fromUint8Array(d||new Uint8Array))}(t,e.targetChange.resumeToken),a=e.targetChange.cause,l=a&&function(h){const d=h.code===void 0?U.UNKNOWN:bm(h.code);return new re(d,h.message||"")}(a);n=new Rm(r,s,i,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=dl(t,r.document.name),i=ln(r.document.updateTime),a=r.document.createTime?ln(r.document.createTime):fe.min(),l=new Vt({mapValue:{fields:r.document.fields}}),c=It.newFoundDocument(s,i,a,l),h=r.targetIds||[],d=r.removedTargetIds||[];n=new yo(h,d,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=dl(t,r.document),i=r.readTime?ln(r.readTime):fe.min(),a=It.newNoDocument(s,i),l=r.removedTargetIds||[];n=new yo([],l,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=dl(t,r.document),i=r.removedTargetIds||[];n=new yo([],i,s,null)}else{if(!("filter"in e))return he();{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,a=new wT(s,i),l=r.targetId;n=new Am(l,a)}}return n}function DT(t,e){let n;if(e instanceof Si)n={update:Dd(t,e.key,e.value)};else if(e instanceof fa)n={delete:Ql(t,e.key)};else if(e instanceof hr)n={update:Dd(t,e.key,e.data),updateMask:BT(e.fieldMask)};else{if(!(e instanceof _T))return he();n={verify:Ql(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(r=>function(i,a){const l=a.transform;if(l instanceof _i)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof yi)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof vi)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof Mo)return{fieldPath:a.field.canonicalString(),increment:l.Pe};throw he()}(0,r))),e.precondition.isNone||(n.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:CT(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:he()}(t,e.precondition)),n}function VT(t,e){return t&&t.length>0?(je(e!==void 0),t.map(n=>function(s,i){let a=s.updateTime?ln(s.updateTime):ln(i);return a.isEqual(fe.min())&&(a=ln(i)),new pT(a,s.transformResults||[])}(n,e))):[]}function NT(t,e){return{documents:[Cm(t,e.path)]}}function OT(t,e){const n={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=Cm(t,s);const i=function(h){if(h.length!==0)return Dm(en.create(h,"and"))}(e.filters);i&&(n.structuredQuery.where=i);const a=function(h){if(h.length!==0)return h.map(d=>function(g){return{field:zr(g.field),direction:FT(g.dir)}}(d))}(e.orderBy);a&&(n.structuredQuery.orderBy=a);const l=Wl(t,e.limit);return l!==null&&(n.structuredQuery.limit=l),e.startAt&&(n.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{_t:n,parent:s}}function MT(t){let e=xT(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let s=null;if(r>0){je(r===1);const d=n.from[0];d.allDescendants?s=d.collectionId:e=e.child(d.collectionId)}let i=[];n.where&&(i=function(p){const g=km(p);return g instanceof en&&om(g)?g.getFilters():[g]}(n.where));let a=[];n.orderBy&&(a=function(p){return p.map(g=>function(D){return new gi(Kr(D.field),function(x){switch(x){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(D.direction))}(g))}(n.orderBy));let l=null;n.limit&&(l=function(p){let g;return g=typeof p=="object"?p.value:p,la(g)?null:g}(n.limit));let c=null;n.startAt&&(c=function(p){const g=!!p.before,y=p.values||[];return new Oo(y,g)}(n.startAt));let h=null;return n.endAt&&(h=function(p){const g=!p.before,y=p.values||[];return new Oo(y,g)}(n.endAt)),eT(e,s,a,i,l,"F",c,h)}function LT(t,e){const n=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return he()}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function km(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":const r=Kr(n.unaryFilter.field);return st.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Kr(n.unaryFilter.field);return st.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Kr(n.unaryFilter.field);return st.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Kr(n.unaryFilter.field);return st.create(a,"!=",{nullValue:"NULL_VALUE"});default:return he()}}(t):t.fieldFilter!==void 0?function(n){return st.create(Kr(n.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return he()}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return en.create(n.compositeFilter.filters.map(r=>km(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return he()}}(n.compositeFilter.op))}(t):he()}function FT(t){return AT[t]}function UT(t){return RT[t]}function jT(t){return ST[t]}function zr(t){return{fieldPath:t.canonicalString()}}function Kr(t){return mt.fromServerFormat(t.fieldPath)}function Dm(t){return t instanceof st?function(n){if(n.op==="=="){if(yd(n.value))return{unaryFilter:{field:zr(n.field),op:"IS_NAN"}};if(_d(n.value))return{unaryFilter:{field:zr(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(yd(n.value))return{unaryFilter:{field:zr(n.field),op:"IS_NOT_NAN"}};if(_d(n.value))return{unaryFilter:{field:zr(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:zr(n.field),op:UT(n.op),value:n.value}}}(t):t instanceof en?function(n){const r=n.getFilters().map(s=>Dm(s));return r.length===1?r[0]:{compositeFilter:{op:jT(n.op),filters:r}}}(t):he()}function BT(t){const e=[];return t.fields.forEach(n=>e.push(n.canonicalString())),{fieldPaths:e}}function Vm(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}/**
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
 */class Gn{constructor(e,n,r,s,i=fe.min(),a=fe.min(),l=_t.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=n,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=l,this.expectedCount=c}withSequenceNumber(e){return new Gn(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new Gn(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Gn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Gn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class $T{constructor(e){this.ct=e}}function qT(t){const e=MT({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?Kl(e,e.limit,"L"):e}/**
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
 */class HT{constructor(){this.un=new zT}addToCollectionParentIndex(e,n){return this.un.add(n),H.resolve()}getCollectionParents(e,n){return H.resolve(this.un.getEntries(n))}addFieldIndex(e,n){return H.resolve()}deleteFieldIndex(e,n){return H.resolve()}deleteAllFieldIndexes(e){return H.resolve()}createTargetIndexes(e,n){return H.resolve()}getDocumentsMatchingTarget(e,n){return H.resolve(null)}getIndexType(e,n){return H.resolve(0)}getFieldIndexes(e,n){return H.resolve([])}getNextCollectionGroupToUpdate(e){return H.resolve(null)}getMinOffset(e,n){return H.resolve(sr.min())}getMinOffsetFromCollectionGroup(e,n){return H.resolve(sr.min())}updateCollectionGroup(e,n,r){return H.resolve()}updateIndexEntries(e,n){return H.resolve()}}class zT{constructor(){this.index={}}add(e){const n=e.lastSegment(),r=e.popLast(),s=this.index[n]||new gt(Ge.comparator),i=!s.has(r);return this.index[n]=s.add(r),i}has(e){const n=e.lastSegment(),r=e.popLast(),s=this.index[n];return s&&s.has(r)}getEntries(e){return(this.index[e]||new gt(Ge.comparator)).toArray()}}/**
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
 */class ds{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new ds(0)}static kn(){return new ds(-1)}}/**
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
 */class KT{constructor(){this.changes=new ys(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,It.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();const r=this.changes.get(n);return r!==void 0?H.resolve(r):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class WT{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}}/**
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
 */class GT{constructor(e,n,r,s){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,n){let r=null;return this.documentOverlayCache.getOverlay(e,n).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,n))).next(s=>(r!==null&&ei(r.mutation,s,jt.empty(),at.now()),s))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.getLocalViewOfDocuments(e,r,be()).next(()=>r))}getLocalViewOfDocuments(e,n,r=be()){const s=Tr();return this.populateOverlays(e,s,n).next(()=>this.computeViews(e,n,s,r).next(i=>{let a=js();return i.forEach((l,c)=>{a=a.insert(l,c.overlayedDocument)}),a}))}getOverlayedDocuments(e,n){const r=Tr();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,be()))}populateOverlays(e,n,r){const s=[];return r.forEach(i=>{n.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((a,l)=>{n.set(a,l)})})}computeViews(e,n,r,s){let i=Cn();const a=Zs(),l=function(){return Zs()}();return n.forEach((c,h)=>{const d=r.get(h.key);s.has(h.key)&&(d===void 0||d.mutation instanceof hr)?i=i.insert(h.key,h):d!==void 0?(a.set(h.key,d.mutation.getFieldMask()),ei(d.mutation,h,d.mutation.getFieldMask(),at.now())):a.set(h.key,jt.empty())}),this.recalculateAndSaveOverlays(e,i).next(c=>(c.forEach((h,d)=>a.set(h,d)),n.forEach((h,d)=>{var p;return l.set(h,new WT(d,(p=a.get(h))!==null&&p!==void 0?p:null))}),l))}recalculateAndSaveOverlays(e,n){const r=Zs();let s=new Xe((a,l)=>a-l),i=be();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(a=>{for(const l of a)l.keys().forEach(c=>{const h=n.get(c);if(h===null)return;let d=r.get(c)||jt.empty();d=l.applyToLocalView(h,d),r.set(c,d);const p=(s.get(l.batchId)||be()).add(c);s=s.insert(l.batchId,p)})}).next(()=>{const a=[],l=s.getReverseIterator();for(;l.hasNext();){const c=l.getNext(),h=c.key,d=c.value,p=gm();d.forEach(g=>{if(!i.has(g)){const y=Tm(n.get(g),r.get(g));y!==null&&p.set(g,y),i=i.add(g)}}),a.push(this.documentOverlayCache.saveOverlays(e,h,p))}return H.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,n,r,s){return function(a){return ae.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):hm(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,r,s):this.getDocumentsMatchingCollectionQuery(e,n,r,s)}getNextDocuments(e,n,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,r,s).next(i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,r.largestBatchId,s-i.size):H.resolve(Tr());let l=-1,c=i;return a.next(h=>H.forEach(h,(d,p)=>(l<p.largestBatchId&&(l=p.largestBatchId),i.get(d)?H.resolve():this.remoteDocumentCache.getEntry(e,d).next(g=>{c=c.insert(d,g)}))).next(()=>this.populateOverlays(e,h,i)).next(()=>this.computeViews(e,c,h,be())).next(d=>({batchId:l,changes:mm(d)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new ae(n)).next(r=>{let s=js();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,n,r,s){const i=n.collectionGroup;let a=js();return this.indexManager.getCollectionParents(e,i).next(l=>H.forEach(l,c=>{const h=function(p,g){return new _s(g,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(n,c.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,r,s).next(d=>{d.forEach((p,g)=>{a=a.insert(p,g)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,n,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,r.largestBatchId).next(a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,r,i,s))).next(a=>{i.forEach((c,h)=>{const d=h.getKey();a.get(d)===null&&(a=a.insert(d,It.newInvalidDocument(d)))});let l=js();return a.forEach((c,h)=>{const d=i.get(c);d!==void 0&&ei(d.mutation,h,jt.empty(),at.now()),ua(n,h)&&(l=l.insert(c,h))}),l})}}/**
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
 */class QT{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,n){return H.resolve(this.hr.get(n))}saveBundleMetadata(e,n){return this.hr.set(n.id,function(s){return{id:s.id,version:s.version,createTime:ln(s.createTime)}}(n)),H.resolve()}getNamedQuery(e,n){return H.resolve(this.Pr.get(n))}saveNamedQuery(e,n){return this.Pr.set(n.name,function(s){return{name:s.name,query:qT(s.bundledQuery),readTime:ln(s.readTime)}}(n)),H.resolve()}}/**
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
 */class JT{constructor(){this.overlays=new Xe(ae.comparator),this.Ir=new Map}getOverlay(e,n){return H.resolve(this.overlays.get(n))}getOverlays(e,n){const r=Tr();return H.forEach(n,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,n,r){return r.forEach((s,i)=>{this.ht(e,n,i)}),H.resolve()}removeOverlaysForBatchId(e,n,r){const s=this.Ir.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(r)),H.resolve()}getOverlaysForCollection(e,n,r){const s=Tr(),i=n.length+1,a=new ae(n.child("")),l=this.overlays.getIteratorFrom(a);for(;l.hasNext();){const c=l.getNext().value,h=c.getKey();if(!n.isPrefixOf(h.path))break;h.path.length===i&&c.largestBatchId>r&&s.set(c.getKey(),c)}return H.resolve(s)}getOverlaysForCollectionGroup(e,n,r,s){let i=new Xe((h,d)=>h-d);const a=this.overlays.getIterator();for(;a.hasNext();){const h=a.getNext().value;if(h.getKey().getCollectionGroup()===n&&h.largestBatchId>r){let d=i.get(h.largestBatchId);d===null&&(d=Tr(),i=i.insert(h.largestBatchId,d)),d.set(h.getKey(),h)}}const l=Tr(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((h,d)=>l.set(h,d)),!(l.size()>=s)););return H.resolve(l)}ht(e,n,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.Ir.get(s.largestBatchId).delete(r.key);this.Ir.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new vT(n,r));let i=this.Ir.get(n);i===void 0&&(i=be(),this.Ir.set(n,i)),this.Ir.set(n,i.add(r.key))}}/**
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
 */class YT{constructor(){this.sessionToken=_t.EMPTY_BYTE_STRING}getSessionToken(e){return H.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,H.resolve()}}/**
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
 */class Uc{constructor(){this.Tr=new gt(lt.Er),this.dr=new gt(lt.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,n){const r=new lt(e,n);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,n){e.forEach(r=>this.addReference(r,n))}removeReference(e,n){this.Vr(new lt(e,n))}mr(e,n){e.forEach(r=>this.removeReference(r,n))}gr(e){const n=new ae(new Ge([])),r=new lt(n,e),s=new lt(n,e+1),i=[];return this.dr.forEachInRange([r,s],a=>{this.Vr(a),i.push(a.key)}),i}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const n=new ae(new Ge([])),r=new lt(n,e),s=new lt(n,e+1);let i=be();return this.dr.forEachInRange([r,s],a=>{i=i.add(a.key)}),i}containsKey(e){const n=new lt(e,0),r=this.Tr.firstAfterOrEqual(n);return r!==null&&e.isEqual(r.key)}}class lt{constructor(e,n){this.key=e,this.wr=n}static Er(e,n){return ae.comparator(e.key,n.key)||Ve(e.wr,n.wr)}static Ar(e,n){return Ve(e.wr,n.wr)||ae.comparator(e.key,n.key)}}/**
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
 */class XT{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Sr=1,this.br=new gt(lt.Er)}checkEmpty(e){return H.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,r,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new yT(i,n,r,s);this.mutationQueue.push(a);for(const l of s)this.br=this.br.add(new lt(l.key,i)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return H.resolve(a)}lookupMutationBatch(e,n){return H.resolve(this.Dr(n))}getNextMutationBatchAfterBatchId(e,n){const r=n+1,s=this.vr(r),i=s<0?0:s;return H.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return H.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return H.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){const r=new lt(n,0),s=new lt(n,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([r,s],a=>{const l=this.Dr(a.wr);i.push(l)}),H.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,n){let r=new gt(Ve);return n.forEach(s=>{const i=new lt(s,0),a=new lt(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,a],l=>{r=r.add(l.wr)})}),H.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,n){const r=n.path,s=r.length+1;let i=r;ae.isDocumentKey(i)||(i=i.child(""));const a=new lt(new ae(i),0);let l=new gt(Ve);return this.br.forEachWhile(c=>{const h=c.key.path;return!!r.isPrefixOf(h)&&(h.length===s&&(l=l.add(c.wr)),!0)},a),H.resolve(this.Cr(l))}Cr(e){const n=[];return e.forEach(r=>{const s=this.Dr(r);s!==null&&n.push(s)}),n}removeMutationBatch(e,n){je(this.Fr(n.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return H.forEach(n.mutations,s=>{const i=new lt(s.key,n.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,n){const r=new lt(n,0),s=this.br.firstAfterOrEqual(r);return H.resolve(n.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,H.resolve()}Fr(e,n){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const n=this.vr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}}/**
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
 */class ZT{constructor(e){this.Mr=e,this.docs=function(){return new Xe(ae.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){const r=n.key,s=this.docs.get(r),i=s?s.size:0,a=this.Mr(n);return this.docs=this.docs.insert(r,{document:n.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){const r=this.docs.get(n);return H.resolve(r?r.document.mutableCopy():It.newInvalidDocument(n))}getEntries(e,n){let r=Cn();return n.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():It.newInvalidDocument(s))}),H.resolve(r)}getDocumentsMatchingQuery(e,n,r,s){let i=Cn();const a=n.path,l=new ae(a.child("")),c=this.docs.getIteratorFrom(l);for(;c.hasNext();){const{key:h,value:{document:d}}=c.getNext();if(!a.isPrefixOf(h.path))break;h.path.length>a.length+1||OE(NE(d),r)<=0||(s.has(d.key)||ua(n,d))&&(i=i.insert(d.key,d.mutableCopy()))}return H.resolve(i)}getAllFromCollectionGroup(e,n,r,s){he()}Or(e,n){return H.forEach(this.docs,r=>n(r))}newChangeBuffer(e){return new eI(this)}getSize(e){return H.resolve(this.size)}}class eI extends KT{constructor(e){super(),this.cr=e}applyChanges(e){const n=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?n.push(this.cr.addEntry(e,s)):this.cr.removeEntry(r)}),H.waitFor(n)}getFromCache(e,n){return this.cr.getEntry(e,n)}getAllFromCache(e,n){return this.cr.getEntries(e,n)}}/**
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
 */class tI{constructor(e){this.persistence=e,this.Nr=new ys(n=>Vc(n),Nc),this.lastRemoteSnapshotVersion=fe.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Uc,this.targetCount=0,this.kr=ds.Bn()}forEachTarget(e,n){return this.Nr.forEach((r,s)=>n(s)),H.resolve()}getLastRemoteSnapshotVersion(e){return H.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return H.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),H.resolve(this.highestTargetId)}setTargetsMetadata(e,n,r){return r&&(this.lastRemoteSnapshotVersion=r),n>this.Lr&&(this.Lr=n),H.resolve()}Kn(e){this.Nr.set(e.target,e);const n=e.targetId;n>this.highestTargetId&&(this.kr=new ds(n),this.highestTargetId=n),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,n){return this.Kn(n),this.targetCount+=1,H.resolve()}updateTargetData(e,n){return this.Kn(n),H.resolve()}removeTargetData(e,n){return this.Nr.delete(n.target),this.Br.gr(n.targetId),this.targetCount-=1,H.resolve()}removeTargets(e,n,r){let s=0;const i=[];return this.Nr.forEach((a,l)=>{l.sequenceNumber<=n&&r.get(l.targetId)===null&&(this.Nr.delete(a),i.push(this.removeMatchingKeysForTargetId(e,l.targetId)),s++)}),H.waitFor(i).next(()=>s)}getTargetCount(e){return H.resolve(this.targetCount)}getTargetData(e,n){const r=this.Nr.get(n)||null;return H.resolve(r)}addMatchingKeys(e,n,r){return this.Br.Rr(n,r),H.resolve()}removeMatchingKeys(e,n,r){this.Br.mr(n,r);const s=this.persistence.referenceDelegate,i=[];return s&&n.forEach(a=>{i.push(s.markPotentiallyOrphaned(e,a))}),H.waitFor(i)}removeMatchingKeysForTargetId(e,n){return this.Br.gr(n),H.resolve()}getMatchingKeysForTargetId(e,n){const r=this.Br.yr(n);return H.resolve(r)}containsKey(e,n){return H.resolve(this.Br.containsKey(n))}}/**
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
 */class nI{constructor(e,n){this.qr={},this.overlays={},this.Qr=new Cc(0),this.Kr=!1,this.Kr=!0,this.$r=new YT,this.referenceDelegate=e(this),this.Ur=new tI(this),this.indexManager=new HT,this.remoteDocumentCache=function(s){return new ZT(s)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new $T(n),this.Gr=new QT(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new JT,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let r=this.qr[e.toKey()];return r||(r=new XT(n,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,n,r){se("MemoryPersistence","Starting transaction:",e);const s=new rI(this.Qr.next());return this.referenceDelegate.zr(),r(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(e,n){return H.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,n)))}}class rI extends LE{constructor(e){super(),this.currentSequenceNumber=e}}class jc{constructor(e){this.persistence=e,this.Jr=new Uc,this.Yr=null}static Zr(e){return new jc(e)}get Xr(){if(this.Yr)return this.Yr;throw he()}addReference(e,n,r){return this.Jr.addReference(r,n),this.Xr.delete(r.toString()),H.resolve()}removeReference(e,n,r){return this.Jr.removeReference(r,n),this.Xr.add(r.toString()),H.resolve()}markPotentiallyOrphaned(e,n){return this.Xr.add(n.toString()),H.resolve()}removeTarget(e,n){this.Jr.gr(n.targetId).forEach(s=>this.Xr.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,n.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>r.removeTargetData(e,n))}zr(){this.Yr=new Set}jr(e){const n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return H.forEach(this.Xr,r=>{const s=ae.fromPath(r);return this.ei(e,s).next(i=>{i||n.removeEntry(s,fe.min())})}).next(()=>(this.Yr=null,n.apply(e)))}updateLimboDocument(e,n){return this.ei(e,n).next(r=>{r?this.Xr.delete(n.toString()):this.Xr.add(n.toString())})}Wr(e){return 0}ei(e,n){return H.or([()=>H.resolve(this.Jr.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Hr(e,n)])}}/**
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
 */class Bc{constructor(e,n,r,s){this.targetId=e,this.fromCache=n,this.$i=r,this.Ui=s}static Wi(e,n){let r=be(),s=be();for(const i of n.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Bc(e,n.fromCache,r,s)}}/**
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
 */class sI{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class iI{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return iw()?8:FE(Rt())>0?6:4}()}initialize(e,n){this.Ji=e,this.indexManager=n,this.Gi=!0}getDocumentsMatchingQuery(e,n,r,s){const i={result:null};return this.Yi(e,n).next(a=>{i.result=a}).next(()=>{if(!i.result)return this.Zi(e,n,s,r).next(a=>{i.result=a})}).next(()=>{if(i.result)return;const a=new sI;return this.Xi(e,n,a).next(l=>{if(i.result=l,this.zi)return this.es(e,n,a,l.size)})}).next(()=>i.result)}es(e,n,r,s){return r.documentReadCount<this.ji?(Ls()<=Pe.DEBUG&&se("QueryEngine","SDK will not create cache indexes for query:",Hr(n),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),H.resolve()):(Ls()<=Pe.DEBUG&&se("QueryEngine","Query:",Hr(n),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Hi*s?(Ls()<=Pe.DEBUG&&se("QueryEngine","The SDK decides to create cache indexes for query:",Hr(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,an(n))):H.resolve())}Yi(e,n){if(Td(n))return H.resolve(null);let r=an(n);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(n.limit!==null&&s===1&&(n=Kl(n,null,"F"),r=an(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const a=be(...i);return this.Ji.getDocuments(e,a).next(l=>this.indexManager.getMinOffset(e,r).next(c=>{const h=this.ts(n,l);return this.ns(n,h,a,c.readTime)?this.Yi(e,Kl(n,null,"F")):this.rs(e,h,n,c)}))})))}Zi(e,n,r,s){return Td(n)||s.isEqual(fe.min())?H.resolve(null):this.Ji.getDocuments(e,r).next(i=>{const a=this.ts(n,i);return this.ns(n,a,r,s)?H.resolve(null):(Ls()<=Pe.DEBUG&&se("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Hr(n)),this.rs(e,a,n,VE(s,-1)).next(l=>l))})}ts(e,n){let r=new gt(fm(e));return n.forEach((s,i)=>{ua(e,i)&&(r=r.add(i))}),r}ns(e,n,r,s){if(e.limit===null)return!1;if(r.size!==n.size)return!0;const i=e.limitType==="F"?n.last():n.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(e,n,r){return Ls()<=Pe.DEBUG&&se("QueryEngine","Using full collection scan to execute query:",Hr(n)),this.Ji.getDocumentsMatchingQuery(e,n,sr.min(),r)}rs(e,n,r,s){return this.Ji.getDocumentsMatchingQuery(e,r,s).next(i=>(n.forEach(a=>{i=i.insert(a.key,a)}),i))}}/**
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
 */class oI{constructor(e,n,r,s){this.persistence=e,this.ss=n,this.serializer=s,this.os=new Xe(Ve),this._s=new ys(i=>Vc(i),Nc),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new GT(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.os))}}function aI(t,e,n,r){return new oI(t,e,n,r)}async function Nm(t,e){const n=pe(t);return await n.persistence.runTransaction("Handle user change","readonly",r=>{let s;return n.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,n.ls(e),n.mutationQueue.getAllMutationBatches(r))).next(i=>{const a=[],l=[];let c=be();for(const h of s){a.push(h.batchId);for(const d of h.mutations)c=c.add(d.key)}for(const h of i){l.push(h.batchId);for(const d of h.mutations)c=c.add(d.key)}return n.localDocuments.getDocuments(r,c).next(h=>({hs:h,removedBatchIds:a,addedBatchIds:l}))})})}function lI(t,e){const n=pe(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=n.cs.newChangeBuffer({trackRemovals:!0});return function(l,c,h,d){const p=h.batch,g=p.keys();let y=H.resolve();return g.forEach(D=>{y=y.next(()=>d.getEntry(c,D)).next(O=>{const x=h.docVersions.get(D);je(x!==null),O.version.compareTo(x)<0&&(p.applyToRemoteDocument(O,h),O.isValidDocument()&&(O.setReadTime(h.commitVersion),d.addEntry(O)))})}),y.next(()=>l.mutationQueue.removeMutationBatch(c,p))}(n,r,e,i).next(()=>i.apply(r)).next(()=>n.mutationQueue.performConsistencyCheck(r)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let c=be();for(let h=0;h<l.mutationResults.length;++h)l.mutationResults[h].transformResults.length>0&&(c=c.add(l.batch.mutations[h].key));return c}(e))).next(()=>n.localDocuments.getDocuments(r,s))})}function Om(t){const e=pe(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.Ur.getLastRemoteSnapshotVersion(n))}function cI(t,e){const n=pe(t),r=e.snapshotVersion;let s=n.os;return n.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const a=n.cs.newChangeBuffer({trackRemovals:!0});s=n.os;const l=[];e.targetChanges.forEach((d,p)=>{const g=s.get(p);if(!g)return;l.push(n.Ur.removeMatchingKeys(i,d.removedDocuments,p).next(()=>n.Ur.addMatchingKeys(i,d.addedDocuments,p)));let y=g.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(p)!==null?y=y.withResumeToken(_t.EMPTY_BYTE_STRING,fe.min()).withLastLimboFreeSnapshotVersion(fe.min()):d.resumeToken.approximateByteSize()>0&&(y=y.withResumeToken(d.resumeToken,r)),s=s.insert(p,y),function(O,x,q){return O.resumeToken.approximateByteSize()===0||x.snapshotVersion.toMicroseconds()-O.snapshotVersion.toMicroseconds()>=3e8?!0:q.addedDocuments.size+q.modifiedDocuments.size+q.removedDocuments.size>0}(g,y,d)&&l.push(n.Ur.updateTargetData(i,y))});let c=Cn(),h=be();if(e.documentUpdates.forEach(d=>{e.resolvedLimboDocuments.has(d)&&l.push(n.persistence.referenceDelegate.updateLimboDocument(i,d))}),l.push(uI(i,a,e.documentUpdates).next(d=>{c=d.Ps,h=d.Is})),!r.isEqual(fe.min())){const d=n.Ur.getLastRemoteSnapshotVersion(i).next(p=>n.Ur.setTargetsMetadata(i,i.currentSequenceNumber,r));l.push(d)}return H.waitFor(l).next(()=>a.apply(i)).next(()=>n.localDocuments.getLocalViewOfDocuments(i,c,h)).next(()=>c)}).then(i=>(n.os=s,i))}function uI(t,e,n){let r=be(),s=be();return n.forEach(i=>r=r.add(i)),e.getEntries(t,r).next(i=>{let a=Cn();return n.forEach((l,c)=>{const h=i.get(l);c.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(l)),c.isNoDocument()&&c.version.isEqual(fe.min())?(e.removeEntry(l,c.readTime),a=a.insert(l,c)):!h.isValidDocument()||c.version.compareTo(h.version)>0||c.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(c),a=a.insert(l,c)):se("LocalStore","Ignoring outdated watch update for ",l,". Current version:",h.version," Watch version:",c.version)}),{Ps:a,Is:s}})}function hI(t,e){const n=pe(t);return n.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),n.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function dI(t,e){const n=pe(t);return n.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return n.Ur.getTargetData(r,e).next(i=>i?(s=i,H.resolve(s)):n.Ur.allocateTargetId(r).next(a=>(s=new Gn(e,a,"TargetPurposeListen",r.currentSequenceNumber),n.Ur.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=n.os.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(n.os=n.os.insert(r.targetId,r),n._s.set(e,r.targetId)),r})}async function Yl(t,e,n){const r=pe(t),s=r.os.get(e),i=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",i,a=>r.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!Ri(a))throw a;se("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}r.os=r.os.remove(e),r._s.delete(s.target)}function Vd(t,e,n){const r=pe(t);let s=fe.min(),i=be();return r.persistence.runTransaction("Execute query","readwrite",a=>function(c,h,d){const p=pe(c),g=p._s.get(d);return g!==void 0?H.resolve(p.os.get(g)):p.Ur.getTargetData(h,d)}(r,a,an(e)).next(l=>{if(l)return s=l.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(a,l.targetId).next(c=>{i=c})}).next(()=>r.ss.getDocumentsMatchingQuery(a,e,n?s:fe.min(),n?i:be())).next(l=>(fI(r,nT(e),l),{documents:l,Ts:i})))}function fI(t,e,n){let r=t.us.get(e)||fe.min();n.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),t.us.set(e,r)}class Nd{constructor(){this.activeTargetIds=lT()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class pI{constructor(){this.so=new Nd,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,r){}addLocalQueryTarget(e,n=!0){return n&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,n,r){this.oo[e]=n}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Nd,Promise.resolve()}handleUserChange(e,n,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class mI{_o(e){}shutdown(){}}/**
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
 */class Od{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){se("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){se("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let ro=null;function fl(){return ro===null?ro=function(){return 268435456+Math.round(2147483648*Math.random())}():ro++,"0x"+ro.toString(16)}/**
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
 */const gI={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
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
 */class _I{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
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
 */const wt="WebChannelConnection";class yI extends class{constructor(n){this.databaseInfo=n,this.databaseId=n.databaseId;const r=n.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+n.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(n,r,s,i,a){const l=fl(),c=this.xo(n,r.toUriEncodedString());se("RestConnection",`Sending RPC '${n}' ${l}:`,c,s);const h={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(h,i,a),this.No(n,c,h,s).then(d=>(se("RestConnection",`Received RPC '${n}' ${l}: `,d),d),d=>{throw ls("RestConnection",`RPC '${n}' ${l} failed with error: `,d,"url: ",c,"request:",s),d})}Lo(n,r,s,i,a,l){return this.Mo(n,r,s,i,a)}Oo(n,r,s){n["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+gs}(),n["Content-Type"]="text/plain",this.databaseInfo.appId&&(n["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((i,a)=>n[a]=i),s&&s.headers.forEach((i,a)=>n[a]=i)}xo(n,r){const s=gI[n];return`${this.Do}/v1/${r}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,n,r,s){const i=fl();return new Promise((a,l)=>{const c=new Gp;c.setWithCredentials(!0),c.listenOnce(Qp.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case mo.NO_ERROR:const d=c.getResponseJson();se(wt,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(d)),a(d);break;case mo.TIMEOUT:se(wt,`RPC '${e}' ${i} timed out`),l(new re(U.DEADLINE_EXCEEDED,"Request time out"));break;case mo.HTTP_ERROR:const p=c.getStatus();if(se(wt,`RPC '${e}' ${i} failed with status:`,p,"response text:",c.getResponseText()),p>0){let g=c.getResponseJson();Array.isArray(g)&&(g=g[0]);const y=g==null?void 0:g.error;if(y&&y.status&&y.message){const D=function(x){const q=x.toLowerCase().replace(/_/g,"-");return Object.values(U).indexOf(q)>=0?q:U.UNKNOWN}(y.status);l(new re(D,y.message))}else l(new re(U.UNKNOWN,"Server responded with status "+c.getStatus()))}else l(new re(U.UNAVAILABLE,"Connection failed."));break;default:he()}}finally{se(wt,`RPC '${e}' ${i} completed.`)}});const h=JSON.stringify(s);se(wt,`RPC '${e}' ${i} sending request:`,s),c.send(n,"POST",h,r,15)})}Bo(e,n,r){const s=fl(),i=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=Xp(),l=Yp(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(c.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Oo(c.initMessageHeaders,n,r),c.encodeInitMessageHeaders=!0;const d=i.join("");se(wt,`Creating RPC '${e}' stream ${s}: ${d}`,c);const p=a.createWebChannel(d,c);let g=!1,y=!1;const D=new _I({Io:x=>{y?se(wt,`Not sending because RPC '${e}' stream ${s} is closed:`,x):(g||(se(wt,`Opening RPC '${e}' stream ${s} transport.`),p.open(),g=!0),se(wt,`RPC '${e}' stream ${s} sending:`,x),p.send(x))},To:()=>p.close()}),O=(x,q,j)=>{x.listen(q,G=>{try{j(G)}catch(J){setTimeout(()=>{throw J},0)}})};return O(p,Us.EventType.OPEN,()=>{y||(se(wt,`RPC '${e}' stream ${s} transport opened.`),D.yo())}),O(p,Us.EventType.CLOSE,()=>{y||(y=!0,se(wt,`RPC '${e}' stream ${s} transport closed`),D.So())}),O(p,Us.EventType.ERROR,x=>{y||(y=!0,ls(wt,`RPC '${e}' stream ${s} transport errored:`,x),D.So(new re(U.UNAVAILABLE,"The operation could not be completed")))}),O(p,Us.EventType.MESSAGE,x=>{var q;if(!y){const j=x.data[0];je(!!j);const G=j,J=G.error||((q=G[0])===null||q===void 0?void 0:q.error);if(J){se(wt,`RPC '${e}' stream ${s} received error:`,J);const ge=J.status;let _e=function(T){const b=rt[T];if(b!==void 0)return bm(b)}(ge),I=J.message;_e===void 0&&(_e=U.INTERNAL,I="Unknown error status: "+ge+" with message "+J.message),y=!0,D.So(new re(_e,I)),p.close()}else se(wt,`RPC '${e}' stream ${s} received:`,j),D.bo(j)}}),O(l,Jp.STAT_EVENT,x=>{x.stat===jl.PROXY?se(wt,`RPC '${e}' stream ${s} detected buffering proxy`):x.stat===jl.NOPROXY&&se(wt,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{D.wo()},0),D}}function pl(){return typeof document<"u"?document:null}/**
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
 */function ma(t){return new PT(t,!0)}/**
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
 */class Mm{constructor(e,n,r=1e3,s=1.5,i=6e4){this.ui=e,this.timerId=n,this.ko=r,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const n=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),s=Math.max(0,n-r);s>0&&se("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
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
 */class Lm{constructor(e,n,r,s,i,a,l,c){this.ui=e,this.Ho=r,this.Jo=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=l,this.listener=c,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new Mm(e,n)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,n){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():n&&n.code===U.RESOURCE_EXHAUSTED?(Pn(n.toString()),Pn("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):n&&n.code===U.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(n)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),n=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.Yo===n&&this.P_(r,s)},r=>{e(()=>{const s=new re(U.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(s)})})}P_(e,n){const r=this.h_(this.Yo);this.stream=this.T_(e,n),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{r(()=>this.I_(s))}),this.stream.onMessage(s=>{r(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return se("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return n=>{this.ui.enqueueAndForget(()=>this.Yo===e?n():(se("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class vI extends Lm{constructor(e,n,r,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,r,s,a),this.serializer=i}T_(e,n){return this.connection.Bo("Listen",e,n)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const n=kT(this.serializer,e),r=function(i){if(!("targetChange"in i))return fe.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?fe.min():a.readTime?ln(a.readTime):fe.min()}(e);return this.listener.d_(n,r)}A_(e){const n={};n.database=Jl(this.serializer),n.addTarget=function(i,a){let l;const c=a.target;if(l=Hl(c)?{documents:NT(i,c)}:{query:OT(i,c)._t},l.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){l.resumeToken=Sm(i,a.resumeToken);const h=Wl(i,a.expectedCount);h!==null&&(l.expectedCount=h)}else if(a.snapshotVersion.compareTo(fe.min())>0){l.readTime=Lo(i,a.snapshotVersion.toTimestamp());const h=Wl(i,a.expectedCount);h!==null&&(l.expectedCount=h)}return l}(this.serializer,e);const r=LT(this.serializer,e);r&&(n.labels=r),this.a_(n)}R_(e){const n={};n.database=Jl(this.serializer),n.removeTarget=e,this.a_(n)}}class wI extends Lm{constructor(e,n,r,s,i,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",n,r,s,a),this.serializer=i}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,n){return this.connection.Bo("Write",e,n)}E_(e){return je(!!e.streamToken),this.lastStreamToken=e.streamToken,je(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){je(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const n=VT(e.writeResults,e.commitTime),r=ln(e.commitTime);return this.listener.g_(r,n)}p_(){const e={};e.database=Jl(this.serializer),this.a_(e)}m_(e){const n={streamToken:this.lastStreamToken,writes:e.map(r=>DT(this.serializer,r))};this.a_(n)}}/**
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
 */class EI extends class{}{constructor(e,n,r,s){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=r,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new re(U.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,n,r,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.Mo(e,Gl(n,r),s,i,a)).catch(i=>{throw i.name==="FirebaseError"?(i.code===U.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new re(U.UNKNOWN,i.toString())})}Lo(e,n,r,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,l])=>this.connection.Lo(e,Gl(n,r),s,a,l,i)).catch(a=>{throw a.name==="FirebaseError"?(a.code===U.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new re(U.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class TI{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(Pn(n),this.D_=!1):se("OnlineStateTracker",n)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
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
 */class II{constructor(e,n,r,s,i){this.localStore=e,this.datastore=n,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(a=>{r.enqueueAndForget(async()=>{Vr(this)&&(se("RemoteStore","Restarting streams for network reachability change."),await async function(c){const h=pe(c);h.L_.add(4),await Ci(h),h.q_.set("Unknown"),h.L_.delete(4),await ga(h)}(this))})}),this.q_=new TI(r,s)}}async function ga(t){if(Vr(t))for(const e of t.B_)await e(!0)}async function Ci(t){for(const e of t.B_)await e(!1)}function Fm(t,e){const n=pe(t);n.N_.has(e.targetId)||(n.N_.set(e.targetId,e),zc(n)?Hc(n):vs(n).r_()&&qc(n,e))}function $c(t,e){const n=pe(t),r=vs(n);n.N_.delete(e),r.r_()&&Um(n,e),n.N_.size===0&&(r.r_()?r.o_():Vr(n)&&n.q_.set("Unknown"))}function qc(t,e){if(t.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(fe.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}vs(t).A_(e)}function Um(t,e){t.Q_.xe(e),vs(t).R_(e)}function Hc(t){t.Q_=new bT({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>t.N_.get(e)||null,tt:()=>t.datastore.serializer.databaseId}),vs(t).start(),t.q_.v_()}function zc(t){return Vr(t)&&!vs(t).n_()&&t.N_.size>0}function Vr(t){return pe(t).L_.size===0}function jm(t){t.Q_=void 0}async function bI(t){t.q_.set("Online")}async function AI(t){t.N_.forEach((e,n)=>{qc(t,e)})}async function RI(t,e){jm(t),zc(t)?(t.q_.M_(e),Hc(t)):t.q_.set("Unknown")}async function SI(t,e,n){if(t.q_.set("Online"),e instanceof Rm&&e.state===2&&e.cause)try{await async function(s,i){const a=i.cause;for(const l of i.targetIds)s.N_.has(l)&&(await s.remoteSyncer.rejectListen(l,a),s.N_.delete(l),s.Q_.removeTarget(l))}(t,e)}catch(r){se("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Fo(t,r)}else if(e instanceof yo?t.Q_.Ke(e):e instanceof Am?t.Q_.He(e):t.Q_.We(e),!n.isEqual(fe.min()))try{const r=await Om(t.localStore);n.compareTo(r)>=0&&await function(i,a){const l=i.Q_.rt(a);return l.targetChanges.forEach((c,h)=>{if(c.resumeToken.approximateByteSize()>0){const d=i.N_.get(h);d&&i.N_.set(h,d.withResumeToken(c.resumeToken,a))}}),l.targetMismatches.forEach((c,h)=>{const d=i.N_.get(c);if(!d)return;i.N_.set(c,d.withResumeToken(_t.EMPTY_BYTE_STRING,d.snapshotVersion)),Um(i,c);const p=new Gn(d.target,c,h,d.sequenceNumber);qc(i,p)}),i.remoteSyncer.applyRemoteEvent(l)}(t,n)}catch(r){se("RemoteStore","Failed to raise snapshot:",r),await Fo(t,r)}}async function Fo(t,e,n){if(!Ri(e))throw e;t.L_.add(1),await Ci(t),t.q_.set("Offline"),n||(n=()=>Om(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{se("RemoteStore","Retrying IndexedDB access"),await n(),t.L_.delete(1),await ga(t)})}function Bm(t,e){return e().catch(n=>Fo(t,n,e))}async function _a(t){const e=pe(t),n=or(e);let r=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;PI(e);)try{const s=await hI(e.localStore,r);if(s===null){e.O_.length===0&&n.o_();break}r=s.batchId,CI(e,s)}catch(s){await Fo(e,s)}$m(e)&&qm(e)}function PI(t){return Vr(t)&&t.O_.length<10}function CI(t,e){t.O_.push(e);const n=or(t);n.r_()&&n.V_&&n.m_(e.mutations)}function $m(t){return Vr(t)&&!or(t).n_()&&t.O_.length>0}function qm(t){or(t).start()}async function xI(t){or(t).p_()}async function kI(t){const e=or(t);for(const n of t.O_)e.m_(n.mutations)}async function DI(t,e,n){const r=t.O_.shift(),s=Mc.from(r,e,n);await Bm(t,()=>t.remoteSyncer.applySuccessfulWrite(s)),await _a(t)}async function VI(t,e){e&&or(t).V_&&await async function(r,s){if(function(a){return ET(a)&&a!==U.ABORTED}(s.code)){const i=r.O_.shift();or(r).s_(),await Bm(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await _a(r)}}(t,e),$m(t)&&qm(t)}async function Md(t,e){const n=pe(t);n.asyncQueue.verifyOperationInProgress(),se("RemoteStore","RemoteStore received new credentials");const r=Vr(n);n.L_.add(3),await Ci(n),r&&n.q_.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.L_.delete(3),await ga(n)}async function NI(t,e){const n=pe(t);e?(n.L_.delete(2),await ga(n)):e||(n.L_.add(2),await Ci(n),n.q_.set("Unknown"))}function vs(t){return t.K_||(t.K_=function(n,r,s){const i=pe(n);return i.w_(),new vI(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(t.datastore,t.asyncQueue,{Eo:bI.bind(null,t),Ro:AI.bind(null,t),mo:RI.bind(null,t),d_:SI.bind(null,t)}),t.B_.push(async e=>{e?(t.K_.s_(),zc(t)?Hc(t):t.q_.set("Unknown")):(await t.K_.stop(),jm(t))})),t.K_}function or(t){return t.U_||(t.U_=function(n,r,s){const i=pe(n);return i.w_(),new wI(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(t.datastore,t.asyncQueue,{Eo:()=>Promise.resolve(),Ro:xI.bind(null,t),mo:VI.bind(null,t),f_:kI.bind(null,t),g_:DI.bind(null,t)}),t.B_.push(async e=>{e?(t.U_.s_(),await _a(t)):(await t.U_.stop(),t.O_.length>0&&(se("RemoteStore",`Stopping write stream with ${t.O_.length} pending writes`),t.O_=[]))})),t.U_}/**
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
 */class Kc{constructor(e,n,r,s,i){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Zn,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,s,i){const a=Date.now()+r,l=new Kc(e,n,a,s,i);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new re(U.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Wc(t,e){if(Pn("AsyncQueue",`${e}: ${t}`),Ri(t))return new re(U.UNAVAILABLE,`${e}: ${t}`);throw t}/**
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
 */class es{constructor(e){this.comparator=e?(n,r)=>e(n,r)||ae.comparator(n.key,r.key):(n,r)=>ae.comparator(n.key,r.key),this.keyedMap=js(),this.sortedSet=new Xe(this.comparator)}static emptySet(e){return new es(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,r)=>(e(n),!1))}add(e){const n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){const n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof es)||this.size!==e.size)return!1;const n=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;n.hasNext();){const s=n.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){const r=new es;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=n,r}}/**
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
 */class Ld{constructor(){this.W_=new Xe(ae.comparator)}track(e){const n=e.doc.key,r=this.W_.get(n);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(n,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(n,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(n,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(n,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(n):e.type===1&&r.type===2?this.W_=this.W_.insert(n,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(n,{type:2,doc:e.doc}):he():this.W_=this.W_.insert(n,e)}G_(){const e=[];return this.W_.inorderTraversal((n,r)=>{e.push(r)}),e}}class fs{constructor(e,n,r,s,i,a,l,c,h){this.query=e,this.docs=n,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=l,this.excludesMetadataChanges=c,this.hasCachedResults=h}static fromInitialDocuments(e,n,r,s,i){const a=[];return n.forEach(l=>{a.push({type:0,doc:l})}),new fs(e,n,es.emptySet(n),a,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&ca(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const n=this.docChanges,r=e.docChanges;if(n.length!==r.length)return!1;for(let s=0;s<n.length;s++)if(n[s].type!==r[s].type||!n[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
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
 */class OI{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class MI{constructor(){this.queries=Fd(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(n,r){const s=pe(n),i=s.queries;s.queries=Fd(),i.forEach((a,l)=>{for(const c of l.j_)c.onError(r)})})(this,new re(U.ABORTED,"Firestore shutting down"))}}function Fd(){return new ys(t=>dm(t),ca)}async function LI(t,e){const n=pe(t);let r=3;const s=e.query;let i=n.queries.get(s);i?!i.H_()&&e.J_()&&(r=2):(i=new OI,r=e.J_()?0:1);try{switch(r){case 0:i.z_=await n.onListen(s,!0);break;case 1:i.z_=await n.onListen(s,!1);break;case 2:await n.onFirstRemoteStoreListen(s)}}catch(a){const l=Wc(a,`Initialization of query '${Hr(e.query)}' failed`);return void e.onError(l)}n.queries.set(s,i),i.j_.push(e),e.Z_(n.onlineState),i.z_&&e.X_(i.z_)&&Gc(n)}async function FI(t,e){const n=pe(t),r=e.query;let s=3;const i=n.queries.get(r);if(i){const a=i.j_.indexOf(e);a>=0&&(i.j_.splice(a,1),i.j_.length===0?s=e.J_()?0:1:!i.H_()&&e.J_()&&(s=2))}switch(s){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function UI(t,e){const n=pe(t);let r=!1;for(const s of e){const i=s.query,a=n.queries.get(i);if(a){for(const l of a.j_)l.X_(s)&&(r=!0);a.z_=s}}r&&Gc(n)}function jI(t,e,n){const r=pe(t),s=r.queries.get(e);if(s)for(const i of s.j_)i.onError(n);r.queries.delete(e)}function Gc(t){t.Y_.forEach(e=>{e.next()})}var Xl,Ud;(Ud=Xl||(Xl={})).ea="default",Ud.Cache="cache";class BI{constructor(e,n,r){this.query=e,this.ta=n,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new fs(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.na?this.ia(e)&&(this.ta.next(e),n=!0):this.sa(e,this.onlineState)&&(this.oa(e),n=!0),this.ra=e,n}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let n=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),n=!0),n}sa(e,n){if(!e.fromCache||!this.J_())return!0;const r=n!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const n=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}oa(e){e=fs.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==Xl.Cache}}/**
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
 */class Hm{constructor(e){this.key=e}}class zm{constructor(e){this.key=e}}class $I{constructor(e,n){this.query=e,this.Ta=n,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=be(),this.mutatedKeys=be(),this.Aa=fm(e),this.Ra=new es(this.Aa)}get Va(){return this.Ta}ma(e,n){const r=n?n.fa:new Ld,s=n?n.Ra:this.Ra;let i=n?n.mutatedKeys:this.mutatedKeys,a=s,l=!1;const c=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,h=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((d,p)=>{const g=s.get(d),y=ua(this.query,p)?p:null,D=!!g&&this.mutatedKeys.has(g.key),O=!!y&&(y.hasLocalMutations||this.mutatedKeys.has(y.key)&&y.hasCommittedMutations);let x=!1;g&&y?g.data.isEqual(y.data)?D!==O&&(r.track({type:3,doc:y}),x=!0):this.ga(g,y)||(r.track({type:2,doc:y}),x=!0,(c&&this.Aa(y,c)>0||h&&this.Aa(y,h)<0)&&(l=!0)):!g&&y?(r.track({type:0,doc:y}),x=!0):g&&!y&&(r.track({type:1,doc:g}),x=!0,(c||h)&&(l=!0)),x&&(y?(a=a.add(y),i=O?i.add(d):i.delete(d)):(a=a.delete(d),i=i.delete(d)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const d=this.query.limitType==="F"?a.last():a.first();a=a.delete(d.key),i=i.delete(d.key),r.track({type:1,doc:d})}return{Ra:a,fa:r,ns:l,mutatedKeys:i}}ga(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,r,s){const i=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const a=e.fa.G_();a.sort((d,p)=>function(y,D){const O=x=>{switch(x){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return he()}};return O(y)-O(D)}(d.type,p.type)||this.Aa(d.doc,p.doc)),this.pa(r),s=s!=null&&s;const l=n&&!s?this.ya():[],c=this.da.size===0&&this.current&&!s?1:0,h=c!==this.Ea;return this.Ea=c,a.length!==0||h?{snapshot:new fs(this.query,e.Ra,i,a,e.mutatedKeys,c===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:l}:{wa:l}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Ld,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(n=>this.Ta=this.Ta.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Ta=this.Ta.delete(n)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=be(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const n=[];return e.forEach(r=>{this.da.has(r)||n.push(new zm(r))}),this.da.forEach(r=>{e.has(r)||n.push(new Hm(r))}),n}ba(e){this.Ta=e.Ts,this.da=be();const n=this.ma(e.documents);return this.applyChanges(n,!0)}Da(){return fs.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class qI{constructor(e,n,r){this.query=e,this.targetId=n,this.view=r}}class HI{constructor(e){this.key=e,this.va=!1}}class zI{constructor(e,n,r,s,i,a){this.localStore=e,this.remoteStore=n,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new ys(l=>dm(l),ca),this.Ma=new Map,this.xa=new Set,this.Oa=new Xe(ae.comparator),this.Na=new Map,this.La=new Uc,this.Ba={},this.ka=new Map,this.qa=ds.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function KI(t,e,n=!0){const r=Ym(t);let s;const i=r.Fa.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await Km(r,e,n,!0),s}async function WI(t,e){const n=Ym(t);await Km(n,e,!0,!1)}async function Km(t,e,n,r){const s=await dI(t.localStore,an(e)),i=s.targetId,a=t.sharedClientState.addLocalQueryTarget(i,n);let l;return r&&(l=await GI(t,e,i,a==="current",s.resumeToken)),t.isPrimaryClient&&n&&Fm(t.remoteStore,s),l}async function GI(t,e,n,r,s){t.Ka=(p,g,y)=>async function(O,x,q,j){let G=x.view.ma(q);G.ns&&(G=await Vd(O.localStore,x.query,!1).then(({documents:I})=>x.view.ma(I,G)));const J=j&&j.targetChanges.get(x.targetId),ge=j&&j.targetMismatches.get(x.targetId)!=null,_e=x.view.applyChanges(G,O.isPrimaryClient,J,ge);return Bd(O,x.targetId,_e.wa),_e.snapshot}(t,p,g,y);const i=await Vd(t.localStore,e,!0),a=new $I(e,i.Ts),l=a.ma(i.documents),c=Pi.createSynthesizedTargetChangeForCurrentChange(n,r&&t.onlineState!=="Offline",s),h=a.applyChanges(l,t.isPrimaryClient,c);Bd(t,n,h.wa);const d=new qI(e,n,a);return t.Fa.set(e,d),t.Ma.has(n)?t.Ma.get(n).push(e):t.Ma.set(n,[e]),h.snapshot}async function QI(t,e,n){const r=pe(t),s=r.Fa.get(e),i=r.Ma.get(s.targetId);if(i.length>1)return r.Ma.set(s.targetId,i.filter(a=>!ca(a,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await Yl(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),n&&$c(r.remoteStore,s.targetId),Zl(r,s.targetId)}).catch(Ai)):(Zl(r,s.targetId),await Yl(r.localStore,s.targetId,!0))}async function JI(t,e){const n=pe(t),r=n.Fa.get(e),s=n.Ma.get(r.targetId);n.isPrimaryClient&&s.length===1&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),$c(n.remoteStore,r.targetId))}async function YI(t,e,n){const r=sb(t);try{const s=await function(a,l){const c=pe(a),h=at.now(),d=l.reduce((y,D)=>y.add(D.key),be());let p,g;return c.persistence.runTransaction("Locally write mutations","readwrite",y=>{let D=Cn(),O=be();return c.cs.getEntries(y,d).next(x=>{D=x,D.forEach((q,j)=>{j.isValidDocument()||(O=O.add(q))})}).next(()=>c.localDocuments.getOverlayedDocuments(y,D)).next(x=>{p=x;const q=[];for(const j of l){const G=gT(j,p.get(j.key).overlayedDocument);G!=null&&q.push(new hr(j.key,G,rm(G.value.mapValue),Ot.exists(!0)))}return c.mutationQueue.addMutationBatch(y,h,q,l)}).next(x=>{g=x;const q=x.applyToLocalDocumentSet(p,O);return c.documentOverlayCache.saveOverlays(y,x.batchId,q)})}).then(()=>({batchId:g.batchId,changes:mm(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(a,l,c){let h=a.Ba[a.currentUser.toKey()];h||(h=new Xe(Ve)),h=h.insert(l,c),a.Ba[a.currentUser.toKey()]=h}(r,s.batchId,n),await xi(r,s.changes),await _a(r.remoteStore)}catch(s){const i=Wc(s,"Failed to persist write");n.reject(i)}}async function Wm(t,e){const n=pe(t);try{const r=await cI(n.localStore,e);e.targetChanges.forEach((s,i)=>{const a=n.Na.get(i);a&&(je(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?a.va=!0:s.modifiedDocuments.size>0?je(a.va):s.removedDocuments.size>0&&(je(a.va),a.va=!1))}),await xi(n,r,e)}catch(r){await Ai(r)}}function jd(t,e,n){const r=pe(t);if(r.isPrimaryClient&&n===0||!r.isPrimaryClient&&n===1){const s=[];r.Fa.forEach((i,a)=>{const l=a.view.Z_(e);l.snapshot&&s.push(l.snapshot)}),function(a,l){const c=pe(a);c.onlineState=l;let h=!1;c.queries.forEach((d,p)=>{for(const g of p.j_)g.Z_(l)&&(h=!0)}),h&&Gc(c)}(r.eventManager,e),s.length&&r.Ca.d_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function XI(t,e,n){const r=pe(t);r.sharedClientState.updateQueryState(e,"rejected",n);const s=r.Na.get(e),i=s&&s.key;if(i){let a=new Xe(ae.comparator);a=a.insert(i,It.newNoDocument(i,fe.min()));const l=be().add(i),c=new pa(fe.min(),new Map,new Xe(Ve),a,l);await Wm(r,c),r.Oa=r.Oa.remove(i),r.Na.delete(e),Qc(r)}else await Yl(r.localStore,e,!1).then(()=>Zl(r,e,n)).catch(Ai)}async function ZI(t,e){const n=pe(t),r=e.batch.batchId;try{const s=await lI(n.localStore,e);Qm(n,r,null),Gm(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await xi(n,s)}catch(s){await Ai(s)}}async function eb(t,e,n){const r=pe(t);try{const s=await function(a,l){const c=pe(a);return c.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let d;return c.mutationQueue.lookupMutationBatch(h,l).next(p=>(je(p!==null),d=p.keys(),c.mutationQueue.removeMutationBatch(h,p))).next(()=>c.mutationQueue.performConsistencyCheck(h)).next(()=>c.documentOverlayCache.removeOverlaysForBatchId(h,d,l)).next(()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,d)).next(()=>c.localDocuments.getDocuments(h,d))})}(r.localStore,e);Qm(r,e,n),Gm(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await xi(r,s)}catch(s){await Ai(s)}}function Gm(t,e){(t.ka.get(e)||[]).forEach(n=>{n.resolve()}),t.ka.delete(e)}function Qm(t,e,n){const r=pe(t);let s=r.Ba[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(n?i.reject(n):i.resolve(),s=s.remove(e)),r.Ba[r.currentUser.toKey()]=s}}function Zl(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Ma.get(e))t.Fa.delete(r),n&&t.Ca.$a(r,n);t.Ma.delete(e),t.isPrimaryClient&&t.La.gr(e).forEach(r=>{t.La.containsKey(r)||Jm(t,r)})}function Jm(t,e){t.xa.delete(e.path.canonicalString());const n=t.Oa.get(e);n!==null&&($c(t.remoteStore,n),t.Oa=t.Oa.remove(e),t.Na.delete(n),Qc(t))}function Bd(t,e,n){for(const r of n)r instanceof Hm?(t.La.addReference(r.key,e),tb(t,r)):r instanceof zm?(se("SyncEngine","Document no longer in limbo: "+r.key),t.La.removeReference(r.key,e),t.La.containsKey(r.key)||Jm(t,r.key)):he()}function tb(t,e){const n=e.key,r=n.path.canonicalString();t.Oa.get(n)||t.xa.has(r)||(se("SyncEngine","New document in limbo: "+n),t.xa.add(r),Qc(t))}function Qc(t){for(;t.xa.size>0&&t.Oa.size<t.maxConcurrentLimboResolutions;){const e=t.xa.values().next().value;t.xa.delete(e);const n=new ae(Ge.fromString(e)),r=t.qa.next();t.Na.set(r,new HI(n)),t.Oa=t.Oa.insert(n,r),Fm(t.remoteStore,new Gn(an(um(n.path)),r,"TargetPurposeLimboResolution",Cc.oe))}}async function xi(t,e,n){const r=pe(t),s=[],i=[],a=[];r.Fa.isEmpty()||(r.Fa.forEach((l,c)=>{a.push(r.Ka(c,e,n).then(h=>{var d;if((h||n)&&r.isPrimaryClient){const p=h?!h.fromCache:(d=n==null?void 0:n.targetChanges.get(c.targetId))===null||d===void 0?void 0:d.current;r.sharedClientState.updateQueryState(c.targetId,p?"current":"not-current")}if(h){s.push(h);const p=Bc.Wi(c.targetId,h);i.push(p)}}))}),await Promise.all(a),r.Ca.d_(s),await async function(c,h){const d=pe(c);try{await d.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>H.forEach(h,g=>H.forEach(g.$i,y=>d.persistence.referenceDelegate.addReference(p,g.targetId,y)).next(()=>H.forEach(g.Ui,y=>d.persistence.referenceDelegate.removeReference(p,g.targetId,y)))))}catch(p){if(!Ri(p))throw p;se("LocalStore","Failed to update sequence numbers: "+p)}for(const p of h){const g=p.targetId;if(!p.fromCache){const y=d.os.get(g),D=y.snapshotVersion,O=y.withLastLimboFreeSnapshotVersion(D);d.os=d.os.insert(g,O)}}}(r.localStore,i))}async function nb(t,e){const n=pe(t);if(!n.currentUser.isEqual(e)){se("SyncEngine","User change. New user:",e.toKey());const r=await Nm(n.localStore,e);n.currentUser=e,function(i,a){i.ka.forEach(l=>{l.forEach(c=>{c.reject(new re(U.CANCELLED,a))})}),i.ka.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await xi(n,r.hs)}}function rb(t,e){const n=pe(t),r=n.Na.get(e);if(r&&r.va)return be().add(r.key);{let s=be();const i=n.Ma.get(e);if(!i)return s;for(const a of i){const l=n.Fa.get(a);s=s.unionWith(l.view.Va)}return s}}function Ym(t){const e=pe(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=Wm.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=rb.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=XI.bind(null,e),e.Ca.d_=UI.bind(null,e.eventManager),e.Ca.$a=jI.bind(null,e.eventManager),e}function sb(t){const e=pe(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=ZI.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=eb.bind(null,e),e}class Uo{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=ma(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,n){return null}Ha(e,n){return null}za(e){return aI(this.persistence,new iI,e.initialUser,this.serializer)}Ga(e){return new nI(jc.Zr,this.serializer)}Wa(e){return new pI}async terminate(){var e,n;(e=this.gcScheduler)===null||e===void 0||e.stop(),(n=this.indexBackfillerScheduler)===null||n===void 0||n.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Uo.provider={build:()=>new Uo};class ec{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>jd(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=nb.bind(null,this.syncEngine),await NI(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new MI}()}createDatastore(e){const n=ma(e.databaseInfo.databaseId),r=function(i){return new yI(i)}(e.databaseInfo);return function(i,a,l,c){return new EI(i,a,l,c)}(e.authCredentials,e.appCheckCredentials,r,n)}createRemoteStore(e){return function(r,s,i,a,l){return new II(r,s,i,a,l)}(this.localStore,this.datastore,e.asyncQueue,n=>jd(this.syncEngine,n,0),function(){return Od.D()?new Od:new mI}())}createSyncEngine(e,n){return function(s,i,a,l,c,h,d){const p=new zI(s,i,a,l,c,h);return d&&(p.Qa=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){var e,n;await async function(s){const i=pe(s);se("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await Ci(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(n=this.eventManager)===null||n===void 0||n.terminate()}}ec.provider={build:()=>new ec};/**
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
 */class ib{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):Pn("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,n){setTimeout(()=>{this.muted||e(n)},0)}}/**
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
 */class ob{constructor(e,n,r,s,i){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=r,this.databaseInfo=s,this.user=Et.UNAUTHENTICATED,this.clientId=em.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async a=>{se("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(se("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Zn;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){const r=Wc(n,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function ml(t,e){t.asyncQueue.verifyOperationInProgress(),se("FirestoreClient","Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async s=>{r.isEqual(s)||(await Nm(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function $d(t,e){t.asyncQueue.verifyOperationInProgress();const n=await ab(t);se("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(r=>Md(e.remoteStore,r)),t.setAppCheckTokenChangeListener((r,s)=>Md(e.remoteStore,s)),t._onlineComponents=e}async function ab(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){se("FirestoreClient","Using user provided OfflineComponentProvider");try{await ml(t,t._uninitializedComponentsProvider._offline)}catch(e){const n=e;if(!function(s){return s.name==="FirebaseError"?s.code===U.FAILED_PRECONDITION||s.code===U.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(n))throw n;ls("Error using user provided cache. Falling back to memory cache: "+n),await ml(t,new Uo)}}else se("FirestoreClient","Using default OfflineComponentProvider"),await ml(t,new Uo);return t._offlineComponents}async function Xm(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(se("FirestoreClient","Using user provided OnlineComponentProvider"),await $d(t,t._uninitializedComponentsProvider._online)):(se("FirestoreClient","Using default OnlineComponentProvider"),await $d(t,new ec))),t._onlineComponents}function lb(t){return Xm(t).then(e=>e.syncEngine)}async function cb(t){const e=await Xm(t),n=e.eventManager;return n.onListen=KI.bind(null,e.syncEngine),n.onUnlisten=QI.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=WI.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=JI.bind(null,e.syncEngine),n}function ub(t,e,n={}){const r=new Zn;return t.asyncQueue.enqueueAndForget(async()=>function(i,a,l,c,h){const d=new ib({next:g=>{d.Za(),a.enqueueAndForget(()=>FI(i,p)),g.fromCache&&c.source==="server"?h.reject(new re(U.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(g)},error:g=>h.reject(g)}),p=new BI(l,d,{includeMetadataChanges:!0,_a:!0});return LI(i,p)}(await cb(t),t.asyncQueue,e,n,r)),r.promise}/**
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
 */function Zm(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
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
 */const qd=new Map;/**
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
 */function eg(t,e,n){if(!n)throw new re(U.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function hb(t,e,n,r){if(e===!0&&r===!0)throw new re(U.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function Hd(t){if(!ae.isDocumentKey(t))throw new re(U.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function zd(t){if(ae.isDocumentKey(t))throw new re(U.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function ya(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":he()}function ar(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new re(U.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=ya(t);throw new re(U.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}/**
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
 */class Kd{constructor(e){var n,r;if(e.host===void 0){if(e.ssl!==void 0)throw new re(U.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(n=e.ssl)===null||n===void 0||n;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new re(U.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}hb("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Zm((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new re(U.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new re(U.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new re(U.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class va{constructor(e,n,r,s){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Kd({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new re(U.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new re(U.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Kd(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new bE;switch(r.type){case"firstParty":return new PE(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new re(U.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=qd.get(n);r&&(se("ComponentProvider","Removing Datastore"),qd.delete(n),r.terminate())}(this),Promise.resolve()}}function db(t,e,n,r={}){var s;const i=(t=ar(t,va))._getSettings(),a=`${e}:${n}`;if(i.host!=="firestore.googleapis.com"&&i.host!==a&&ls("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),t._setSettings(Object.assign(Object.assign({},i),{host:a,ssl:!1})),r.mockUserToken){let l,c;if(typeof r.mockUserToken=="string")l=r.mockUserToken,c=Et.MOCK_USER;else{l=X0(r.mockUserToken,(s=t._app)===null||s===void 0?void 0:s.options.projectId);const h=r.mockUserToken.sub||r.mockUserToken.user_id;if(!h)throw new re(U.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");c=new Et(h)}t._authCredentials=new AE(new Zp(l,c))}}/**
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
 */class Nr{constructor(e,n,r){this.converter=n,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Nr(this.firestore,e,this._query)}}class Bt{constructor(e,n,r){this.converter=n,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new er(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Bt(this.firestore,e,this._key)}}class er extends Nr{constructor(e,n,r){super(e,n,um(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Bt(this.firestore,null,new ae(e))}withConverter(e){return new er(this.firestore,e,this._path)}}function Ue(t,e,...n){if(t=St(t),eg("collection","path",e),t instanceof va){const r=Ge.fromString(e,...n);return zd(r),new er(t,null,r)}{if(!(t instanceof Bt||t instanceof er))throw new re(U.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Ge.fromString(e,...n));return zd(r),new er(t.firestore,null,r)}}function Qe(t,e,...n){if(t=St(t),arguments.length===1&&(e=em.newId()),eg("doc","path",e),t instanceof va){const r=Ge.fromString(e,...n);return Hd(r),new Bt(t,null,new ae(r))}{if(!(t instanceof Bt||t instanceof er))throw new re(U.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Ge.fromString(e,...n));return Hd(r),new Bt(t.firestore,t instanceof er?t.converter:null,new ae(r))}}/**
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
 */class Wd{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new Mm(this,"async_queue_retry"),this.Vu=()=>{const r=pl();r&&se("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const n=pl();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const n=pl();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const n=new Zn;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!Ri(e))throw e;se("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const n=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const s=function(a){let l=a.message||"";return a.stack&&(l=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),l}(r);throw Pn("INTERNAL UNHANDLED ERROR: ",s),r}).then(r=>(this.du=!1,r))));return this.mu=n,n}enqueueAfterDelay(e,n,r){this.fu(),this.Ru.indexOf(e)>-1&&(n=0);const s=Kc.createAndSchedule(this,e,n,r,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&he()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const n of this.Tu)if(n.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.Tu)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const n=this.Tu.indexOf(e);this.Tu.splice(n,1)}}class ws extends va{constructor(e,n,r,s){super(e,n,r,s),this.type="firestore",this._queue=new Wd,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Wd(e),this._firestoreClient=void 0,await e}}}function fb(t,e){const n=typeof t=="object"?t:Hp(),r=typeof t=="string"?t:e||"(default)",s=Sc(n,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=J0("firestore");i&&db(s,...i)}return s}function Jc(t){if(t._terminated)throw new re(U.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||pb(t),t._firestoreClient}function pb(t){var e,n,r;const s=t._freezeSettings(),i=function(l,c,h,d){return new BE(l,c,h,d.host,d.ssl,d.experimentalForceLongPolling,d.experimentalAutoDetectLongPolling,Zm(d.experimentalLongPollingOptions),d.useFetchStreams)}(t._databaseId,((e=t._app)===null||e===void 0?void 0:e.options.appId)||"",t._persistenceKey,s);t._componentsProvider||!((n=s.localCache)===null||n===void 0)&&n._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(t._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),t._firestoreClient=new ob(t._authCredentials,t._appCheckCredentials,t._queue,i,t._componentsProvider&&function(l){const c=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(c),_online:c}}(t._componentsProvider))}/**
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
 */class ps{constructor(e){this._byteString=e}static fromBase64String(e){try{return new ps(_t.fromBase64String(e))}catch(n){throw new re(U.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new ps(_t.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
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
 */class wa{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new re(U.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new mt(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
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
 */class Ea{constructor(e){this._methodName=e}}/**
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
 */class Yc{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new re(U.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new re(U.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return Ve(this._lat,e._lat)||Ve(this._long,e._long)}}/**
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
 */class Xc{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}}/**
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
 */const mb=/^__.*__$/;class gb{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return this.fieldMask!==null?new hr(e,this.data,this.fieldMask,n,this.fieldTransforms):new Si(e,this.data,n,this.fieldTransforms)}}class tg{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return new hr(e,this.data,this.fieldMask,n,this.fieldTransforms)}}function ng(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw he()}}class Zc{constructor(e,n,r,s,i,a){this.settings=e,this.databaseId=n,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.vu(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new Zc(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),s=this.Fu({path:r,xu:!1});return s.Ou(e),s}Nu(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),s=this.Fu({path:r,xu:!1});return s.vu(),s}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return jo(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(ng(this.Cu)&&mb.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class _b{constructor(e,n,r){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=r||ma(e)}Qu(e,n,r,s=!1){return new Zc({Cu:e,methodName:n,qu:r,path:mt.emptyPath(),xu:!1,ku:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Ta(t){const e=t._freezeSettings(),n=ma(t._databaseId);return new _b(t._databaseId,!!e.ignoreUndefinedProperties,n)}function eu(t,e,n,r,s,i={}){const a=t.Qu(i.merge||i.mergeFields?2:0,e,n,s);nu("Data must be an object, but it was:",a,r);const l=rg(r,a);let c,h;if(i.merge)c=new jt(a.fieldMask),h=a.fieldTransforms;else if(i.mergeFields){const d=[];for(const p of i.mergeFields){const g=tc(e,p,n);if(!a.contains(g))throw new re(U.INVALID_ARGUMENT,`Field '${g}' is specified in your field mask but missing from your input data.`);ig(d,g)||d.push(g)}c=new jt(d),h=a.fieldTransforms.filter(p=>c.covers(p.field))}else c=null,h=a.fieldTransforms;return new gb(new Vt(l),c,h)}class Ia extends Ea{_toFieldTransform(e){if(e.Cu!==2)throw e.Cu===1?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Ia}}class tu extends Ea{_toFieldTransform(e){return new dT(e.path,new _i)}isEqual(e){return e instanceof tu}}function yb(t,e,n,r){const s=t.Qu(1,e,n);nu("Data must be an object, but it was:",s,r);const i=[],a=Vt.empty();Dr(r,(c,h)=>{const d=ru(e,c,n);h=St(h);const p=s.Nu(d);if(h instanceof Ia)i.push(d);else{const g=ki(h,p);g!=null&&(i.push(d),a.set(d,g))}});const l=new jt(i);return new tg(a,l,s.fieldTransforms)}function vb(t,e,n,r,s,i){const a=t.Qu(1,e,n),l=[tc(e,r,n)],c=[s];if(i.length%2!=0)throw new re(U.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let g=0;g<i.length;g+=2)l.push(tc(e,i[g])),c.push(i[g+1]);const h=[],d=Vt.empty();for(let g=l.length-1;g>=0;--g)if(!ig(h,l[g])){const y=l[g];let D=c[g];D=St(D);const O=a.Nu(y);if(D instanceof Ia)h.push(y);else{const x=ki(D,O);x!=null&&(h.push(y),d.set(y,x))}}const p=new jt(h);return new tg(d,p,a.fieldTransforms)}function wb(t,e,n,r=!1){return ki(n,t.Qu(r?4:3,e))}function ki(t,e){if(sg(t=St(t)))return nu("Unsupported field value:",e,t),rg(t,e);if(t instanceof Ea)return function(r,s){if(!ng(s.Cu))throw s.Bu(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Bu(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,s){const i=[];let a=0;for(const l of r){let c=ki(l,s.Lu(a));c==null&&(c={nullValue:"NULL_VALUE"}),i.push(c),a++}return{arrayValue:{values:i}}}(t,e)}return function(r,s){if((r=St(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return cT(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=at.fromDate(r);return{timestampValue:Lo(s.serializer,i)}}if(r instanceof at){const i=new at(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:Lo(s.serializer,i)}}if(r instanceof Yc)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof ps)return{bytesValue:Sm(s.serializer,r._byteString)};if(r instanceof Bt){const i=s.databaseId,a=r.firestore._databaseId;if(!a.isEqual(i))throw s.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:Fc(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof Xc)return function(a,l){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(c=>{if(typeof c!="number")throw l.Bu("VectorValues must only contain numeric values.");return Oc(l.serializer,c)})}}}}}}(r,s);throw s.Bu(`Unsupported field value: ${ya(r)}`)}(t,e)}function rg(t,e){const n={};return tm(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Dr(t,(r,s)=>{const i=ki(s,e.Mu(r));i!=null&&(n[r]=i)}),{mapValue:{fields:n}}}function sg(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof at||t instanceof Yc||t instanceof ps||t instanceof Bt||t instanceof Ea||t instanceof Xc)}function nu(t,e,n){if(!sg(n)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(n)){const r=ya(n);throw r==="an object"?e.Bu(t+" a custom object"):e.Bu(t+" "+r)}}function tc(t,e,n){if((e=St(e))instanceof wa)return e._internalPath;if(typeof e=="string")return ru(t,e);throw jo("Field path arguments must be of type string or ",t,!1,void 0,n)}const Eb=new RegExp("[~\\*/\\[\\]]");function ru(t,e,n){if(e.search(Eb)>=0)throw jo(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new wa(...e.split("."))._internalPath}catch{throw jo(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function jo(t,e,n,r,s){const i=r&&!r.isEmpty(),a=s!==void 0;let l=`Function ${e}() called with invalid data`;n&&(l+=" (via `toFirestore()`)"),l+=". ";let c="";return(i||a)&&(c+=" (found",i&&(c+=` in field ${r}`),a&&(c+=` in document ${s}`),c+=")"),new re(U.INVALID_ARGUMENT,l+t+c)}function ig(t,e){return t.some(n=>n.isEqual(e))}/**
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
 */class og{constructor(e,n,r,s,i){this._firestore=e,this._userDataWriter=n,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Bt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new Tb(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const n=this._document.data.field(ba("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class Tb extends og{data(){return super.data()}}function ba(t,e){return typeof e=="string"?ru(t,e):e instanceof wa?e._internalPath:e._delegate._internalPath}/**
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
 */function Ib(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new re(U.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class su{}class ag extends su{}function lg(t,e,...n){let r=[];e instanceof su&&r.push(e),r=r.concat(n),function(i){const a=i.filter(c=>c instanceof iu).length,l=i.filter(c=>c instanceof Aa).length;if(a>1||a>0&&l>0)throw new re(U.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)t=s._apply(t);return t}class Aa extends ag{constructor(e,n,r){super(),this._field=e,this._op=n,this._value=r,this.type="where"}static _create(e,n,r){return new Aa(e,n,r)}_apply(e){const n=this._parse(e);return cg(e._query,n),new Nr(e.firestore,e.converter,zl(e._query,n))}_parse(e){const n=Ta(e.firestore);return function(i,a,l,c,h,d,p){let g;if(h.isKeyField()){if(d==="array-contains"||d==="array-contains-any")throw new re(U.INVALID_ARGUMENT,`Invalid Query. You can't perform '${d}' queries on documentId().`);if(d==="in"||d==="not-in"){Qd(p,d);const y=[];for(const D of p)y.push(Gd(c,i,D));g={arrayValue:{values:y}}}else g=Gd(c,i,p)}else d!=="in"&&d!=="not-in"&&d!=="array-contains-any"||Qd(p,d),g=wb(l,a,p,d==="in"||d==="not-in");return st.create(h,d,g)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}}function bb(t,e,n){const r=e,s=ba("where",t);return Aa._create(s,r,n)}class iu extends su{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new iu(e,n)}_parse(e){const n=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return n.length===1?n[0]:en.create(n,this._getOperator())}_apply(e){const n=this._parse(e);return n.getFilters().length===0?e:(function(s,i){let a=s;const l=i.getFlattenedFilters();for(const c of l)cg(a,c),a=zl(a,c)}(e._query,n),new Nr(e.firestore,e.converter,zl(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class ou extends ag{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new ou(e,n)}_apply(e){const n=function(s,i,a){if(s.startAt!==null)throw new re(U.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new re(U.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new gi(i,a)}(e._query,this._field,this._direction);return new Nr(e.firestore,e.converter,function(s,i){const a=s.explicitOrderBy.concat([i]);return new _s(s.path,s.collectionGroup,a,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,n))}}function Ab(t,e="asc"){const n=e,r=ba("orderBy",t);return ou._create(r,n)}function Gd(t,e,n){if(typeof(n=St(n))=="string"){if(n==="")throw new re(U.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!hm(e)&&n.indexOf("/")!==-1)throw new re(U.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(Ge.fromString(n));if(!ae.isDocumentKey(r))throw new re(U.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return gd(t,new ae(r))}if(n instanceof Bt)return gd(t,n._key);throw new re(U.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ya(n)}.`)}function Qd(t,e){if(!Array.isArray(t)||t.length===0)throw new re(U.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function cg(t,e){const n=function(s,i){for(const a of s)for(const l of a.getFlattenedFilters())if(i.indexOf(l.op)>=0)return l.op;return null}(t.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new re(U.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new re(U.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}class Rb{convertValue(e,n="none"){switch(Pr(e)){case 0:return null;case 1:return e.booleanValue;case 2:return et(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(Sr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw he()}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){const r={};return Dr(e,(s,i)=>{r[s]=this.convertValue(i,n)}),r}convertVectorValue(e){var n,r,s;const i=(s=(r=(n=e.fields)===null||n===void 0?void 0:n.value.arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(a=>et(a.doubleValue));return new Xc(i)}convertGeoPoint(e){return new Yc(et(e.latitude),et(e.longitude))}convertArray(e,n){return(e.values||[]).map(r=>this.convertValue(r,n))}convertServerTimestamp(e,n){switch(n){case"previous":const r=kc(e);return r==null?null:this.convertValue(r,n);case"estimate":return this.convertTimestamp(fi(e));default:return null}}convertTimestamp(e){const n=ir(e);return new at(n.seconds,n.nanos)}convertDocumentKey(e,n){const r=Ge.fromString(e);je(Vm(r));const s=new pi(r.get(1),r.get(3)),i=new ae(r.popFirst(5));return s.isEqual(n)||Pn(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),i}}/**
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
 */function au(t,e,n){let r;return r=t?n&&(n.merge||n.mergeFields)?t.toFirestore(e,n):t.toFirestore(e):e,r}/**
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
 */class so{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Sb extends og{constructor(e,n,r,s,i,a){super(e,n,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new vo(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const r=this._document.data.field(ba("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,n.serverTimestamps)}}}class vo extends Sb{data(e={}){return super.data(e)}}class Pb{constructor(e,n,r,s){this._firestore=e,this._userDataWriter=n,this._snapshot=s,this.metadata=new so(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(r=>{e.call(n,new vo(this._firestore,this._userDataWriter,r.key,r,new so(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new re(U.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(l=>{const c=new vo(s._firestore,s._userDataWriter,l.doc.key,l.doc,new so(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);return l.doc,{type:"added",doc:c,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(l=>i||l.type!==3).map(l=>{const c=new vo(s._firestore,s._userDataWriter,l.doc.key,l.doc,new so(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,d=-1;return l.type!==0&&(h=a.indexOf(l.doc.key),a=a.delete(l.doc.key)),l.type!==1&&(a=a.add(l.doc),d=a.indexOf(l.doc.key)),{type:Cb(l.type),doc:c,oldIndex:h,newIndex:d}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}}function Cb(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return he()}}class xb extends Rb{constructor(e){super(),this.firestore=e}convertBytes(e){return new ps(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new Bt(this.firestore,null,n)}}function Ye(t){t=ar(t,Nr);const e=ar(t.firestore,ws),n=Jc(e),r=new xb(e);return Ib(t._query),ub(n,t._query).then(s=>new Pb(e,r,t,s))}function Jt(t,e,n){t=ar(t,Bt);const r=ar(t.firestore,ws),s=au(t.converter,e,n);return Ra(r,[eu(Ta(r),"setDoc",t._key,s,t.converter!==null,n).toMutation(t._key,Ot.none())])}function Bo(t){return Ra(ar(t.firestore,ws),[new fa(t._key,Ot.none())])}function kb(t,e){const n=ar(t.firestore,ws),r=Qe(t),s=au(t.converter,e);return Ra(n,[eu(Ta(t.firestore),"addDoc",r._key,s,t.converter!==null,{}).toMutation(r._key,Ot.exists(!1))]).then(()=>r)}function Ra(t,e){return function(r,s){const i=new Zn;return r.asyncQueue.enqueueAndForget(async()=>YI(await lb(r),s,i)),i.promise}(Jc(t),e)}/**
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
 */class Db{constructor(e,n){this._firestore=e,this._commitHandler=n,this._mutations=[],this._committed=!1,this._dataReader=Ta(e)}set(e,n,r){this._verifyNotCommitted();const s=gl(e,this._firestore),i=au(s.converter,n,r),a=eu(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(a.toMutation(s._key,Ot.none())),this}update(e,n,r,...s){this._verifyNotCommitted();const i=gl(e,this._firestore);let a;return a=typeof(n=St(n))=="string"||n instanceof wa?vb(this._dataReader,"WriteBatch.update",i._key,n,r,s):yb(this._dataReader,"WriteBatch.update",i._key,n),this._mutations.push(a.toMutation(i._key,Ot.exists(!0))),this}delete(e){this._verifyNotCommitted();const n=gl(e,this._firestore);return this._mutations=this._mutations.concat(new fa(n._key,Ot.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new re(U.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function gl(t,e){if((t=St(t)).firestore!==e)throw new re(U.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return t}function ug(){return new tu("serverTimestamp")}/**
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
 */function hg(t){return Jc(t=ar(t,ws)),new Db(t,e=>Ra(t,e))}(function(e,n=!0){(function(s){gs=s})(ms),as(new Ar("firestore",(r,{instanceIdentifier:s,options:i})=>{const a=r.getProvider("app").getImmediate(),l=new ws(new RE(r.getProvider("auth-internal")),new xE(r.getProvider("app-check-internal")),function(h,d){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new re(U.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new pi(h.options.projectId,d)}(a,s),a);return i=Object.assign({useFetchStreams:n},i),l._setSettings(i),l},"PUBLIC").setMultipleInstances(!0)),Xn(hd,"4.7.3",e),Xn(hd,"4.7.3","esm2017")})();function lu(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(t);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(t,r[s])&&(n[r[s]]=t[r[s]]);return n}function dg(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Vb=dg,fg=new Ii("auth","Firebase",dg());/**
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
 */const $o=new Ac("@firebase/auth");function Nb(t,...e){$o.logLevel<=Pe.WARN&&$o.warn(`Auth (${ms}): ${t}`,...e)}function wo(t,...e){$o.logLevel<=Pe.ERROR&&$o.error(`Auth (${ms}): ${t}`,...e)}/**
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
 */function xn(t,...e){throw cu(t,...e)}function cn(t,...e){return cu(t,...e)}function pg(t,e,n){const r=Object.assign(Object.assign({},Vb()),{[e]:n});return new Ii("auth","Firebase",r).create(e,{appName:t.name})}function tr(t){return pg(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function cu(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return fg.create(t,...e)}function ce(t,e,...n){if(!t)throw cu(e,...n)}function Tn(t){const e="INTERNAL ASSERTION FAILED: "+t;throw wo(e),new Error(e)}function kn(t,e){t||Tn(e)}/**
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
 */function nc(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.href)||""}function Ob(){return Jd()==="http:"||Jd()==="https:"}function Jd(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
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
 */function Mb(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Ob()||nw()||"connection"in navigator)?navigator.onLine:!0}function Lb(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
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
 */class Di{constructor(e,n){this.shortDelay=e,this.longDelay=n,kn(n>e,"Short delay should be less than long delay!"),this.isMobile=Z0()||rw()}get(){return Mb()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function uu(t,e){kn(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
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
 */class mg{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Tn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Tn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Tn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const Fb={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const Ub=new Di(3e4,6e4);function Sa(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function Es(t,e,n,r,s={}){return gg(t,s,async()=>{let i={},a={};r&&(e==="GET"?a=r:i={body:JSON.stringify(r)});const l=bi(Object.assign({key:t.config.apiKey},a)).slice(1),c=await t._getAdditionalHeaders();c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode);const h=Object.assign({method:e,headers:c},i);return tw()||(h.referrerPolicy="no-referrer"),mg.fetch()(yg(t,t.config.apiHost,n,l),h)})}async function gg(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},Fb),e);try{const s=new jb(t),i=await Promise.race([n(),s.promise]);s.clearNetworkTimeout();const a=await i.json();if("needConfirmation"in a)throw io(t,"account-exists-with-different-credential",a);if(i.ok&&!("errorMessage"in a))return a;{const l=i.ok?a.errorMessage:a.error.message,[c,h]=l.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw io(t,"credential-already-in-use",a);if(c==="EMAIL_EXISTS")throw io(t,"email-already-in-use",a);if(c==="USER_DISABLED")throw io(t,"user-disabled",a);const d=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw pg(t,d,h);xn(t,d)}}catch(s){if(s instanceof Vn)throw s;xn(t,"network-request-failed",{message:String(s)})}}async function _g(t,e,n,r,s={}){const i=await Es(t,e,n,r,s);return"mfaPendingCredential"in i&&xn(t,"multi-factor-auth-required",{_serverResponse:i}),i}function yg(t,e,n,r){const s=`${e}${n}?${r}`;return t.config.emulator?uu(t.config,s):`${t.config.apiScheme}://${s}`}class jb{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(cn(this.auth,"network-request-failed")),Ub.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function io(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const s=cn(t,e,r);return s.customData._tokenResponse=n,s}/**
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
 */async function Bb(t,e){return Es(t,"POST","/v1/accounts:delete",e)}async function vg(t,e){return Es(t,"POST","/v1/accounts:lookup",e)}/**
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
 */function ti(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function $b(t,e=!1){const n=St(t),r=await n.getIdToken(e),s=hu(r);ce(s&&s.exp&&s.auth_time&&s.iat,n.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,a=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:ti(_l(s.auth_time)),issuedAtTime:ti(_l(s.iat)),expirationTime:ti(_l(s.exp)),signInProvider:a||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function _l(t){return Number(t)*1e3}function hu(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return wo("JWT malformed, contained fewer than 3 sections"),null;try{const s=Lp(n);return s?JSON.parse(s):(wo("Failed to decode base64 JWT payload"),null)}catch(s){return wo("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Yd(t){const e=hu(t);return ce(e,"internal-error"),ce(typeof e.exp<"u","internal-error"),ce(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function wi(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof Vn&&qb(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function qb({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
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
 */class Hb{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class rc{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=ti(this.lastLoginAt),this.creationTime=ti(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function qo(t){var e;const n=t.auth,r=await t.getIdToken(),s=await wi(t,vg(n,{idToken:r}));ce(s==null?void 0:s.users.length,n,"internal-error");const i=s.users[0];t._notifyReloadListener(i);const a=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?wg(i.providerUserInfo):[],l=Kb(t.providerData,a),c=t.isAnonymous,h=!(t.email&&i.passwordHash)&&!(l!=null&&l.length),d=c?h:!1,p={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:l,metadata:new rc(i.createdAt,i.lastLoginAt),isAnonymous:d};Object.assign(t,p)}async function zb(t){const e=St(t);await qo(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function Kb(t,e){return[...t.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function wg(t){return t.map(e=>{var{providerId:n}=e,r=lu(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
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
 */async function Wb(t,e){const n=await gg(t,{},async()=>{const r=bi({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=t.config,a=yg(t,s,"/v1/token",`key=${i}`),l=await t._getAdditionalHeaders();return l["Content-Type"]="application/x-www-form-urlencoded",mg.fetch()(a,{method:"POST",headers:l,body:r})});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function Gb(t,e){return Es(t,"POST","/v2/accounts:revokeToken",Sa(t,e))}/**
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
 */class ts{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ce(e.idToken,"internal-error"),ce(typeof e.idToken<"u","internal-error"),ce(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Yd(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){ce(e.length!==0,"internal-error");const n=Yd(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(ce(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:s,expiresIn:i}=await Wb(e,n);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:s,expirationTime:i}=n,a=new ts;return r&&(ce(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(ce(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),i&&(ce(typeof i=="number","internal-error",{appName:e}),a.expirationTime=i),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new ts,this.toJSON())}_performRefresh(){return Tn("not implemented")}}/**
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
 */function Fn(t,e){ce(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class In{constructor(e){var{uid:n,auth:r,stsTokenManager:s}=e,i=lu(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new Hb(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new rc(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const n=await wi(this,this.stsTokenManager.getToken(this.auth,e));return ce(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return $b(this,e)}reload(){return zb(this)}_assign(e){this!==e&&(ce(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new In(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){ce(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await qo(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(En(this.auth.app))return Promise.reject(tr(this.auth));const e=await this.getIdToken();return await wi(this,Bb(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,s,i,a,l,c,h,d;const p=(r=n.displayName)!==null&&r!==void 0?r:void 0,g=(s=n.email)!==null&&s!==void 0?s:void 0,y=(i=n.phoneNumber)!==null&&i!==void 0?i:void 0,D=(a=n.photoURL)!==null&&a!==void 0?a:void 0,O=(l=n.tenantId)!==null&&l!==void 0?l:void 0,x=(c=n._redirectEventId)!==null&&c!==void 0?c:void 0,q=(h=n.createdAt)!==null&&h!==void 0?h:void 0,j=(d=n.lastLoginAt)!==null&&d!==void 0?d:void 0,{uid:G,emailVerified:J,isAnonymous:ge,providerData:_e,stsTokenManager:I}=n;ce(G&&I,e,"internal-error");const v=ts.fromJSON(this.name,I);ce(typeof G=="string",e,"internal-error"),Fn(p,e.name),Fn(g,e.name),ce(typeof J=="boolean",e,"internal-error"),ce(typeof ge=="boolean",e,"internal-error"),Fn(y,e.name),Fn(D,e.name),Fn(O,e.name),Fn(x,e.name),Fn(q,e.name),Fn(j,e.name);const T=new In({uid:G,auth:e,email:g,emailVerified:J,displayName:p,isAnonymous:ge,photoURL:D,phoneNumber:y,tenantId:O,stsTokenManager:v,createdAt:q,lastLoginAt:j});return _e&&Array.isArray(_e)&&(T.providerData=_e.map(b=>Object.assign({},b))),x&&(T._redirectEventId=x),T}static async _fromIdTokenResponse(e,n,r=!1){const s=new ts;s.updateFromServerResponse(n);const i=new In({uid:n.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await qo(i),i}static async _fromGetAccountInfoResponse(e,n,r){const s=n.users[0];ce(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?wg(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),l=new ts;l.updateFromIdToken(r);const c=new In({uid:s.localId,auth:e,stsTokenManager:l,isAnonymous:a}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new rc(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(c,h),c}}/**
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
 */const Xd=new Map;function bn(t){kn(t instanceof Function,"Expected a class definition");let e=Xd.get(t);return e?(kn(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,Xd.set(t,e),e)}/**
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
 */class Eg{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}Eg.type="NONE";const Zd=Eg;/**
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
 */function Eo(t,e,n){return`firebase:${t}:${e}:${n}`}class ns{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Eo(this.userKey,s.apiKey,i),this.fullPersistenceKey=Eo("persistence",s.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?In._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new ns(bn(Zd),e,r);const s=(await Promise.all(n.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let i=s[0]||bn(Zd);const a=Eo(r,e.config.apiKey,e.name);let l=null;for(const h of n)try{const d=await h._get(a);if(d){const p=In._fromJSON(e,d);h!==i&&(l=p),i=h;break}}catch{}const c=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new ns(i,e,r):(i=c[0],l&&await i._set(a,l.toJSON()),await Promise.all(n.map(async h=>{if(h!==i)try{await h._remove(a)}catch{}})),new ns(i,e,r))}}/**
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
 */function ef(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Ag(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Tg(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Sg(e))return"Blackberry";if(Pg(e))return"Webos";if(Ig(e))return"Safari";if((e.includes("chrome/")||bg(e))&&!e.includes("edge/"))return"Chrome";if(Rg(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Tg(t=Rt()){return/firefox\//i.test(t)}function Ig(t=Rt()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function bg(t=Rt()){return/crios\//i.test(t)}function Ag(t=Rt()){return/iemobile/i.test(t)}function Rg(t=Rt()){return/android/i.test(t)}function Sg(t=Rt()){return/blackberry/i.test(t)}function Pg(t=Rt()){return/webos/i.test(t)}function du(t=Rt()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function Qb(t=Rt()){var e;return du(t)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function Jb(){return sw()&&document.documentMode===10}function Cg(t=Rt()){return du(t)||Rg(t)||Pg(t)||Sg(t)||/windows phone/i.test(t)||Ag(t)}/**
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
 */function xg(t,e=[]){let n;switch(t){case"Browser":n=ef(Rt());break;case"Worker":n=`${ef(Rt())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${ms}/${r}`}/**
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
 */class Yb{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=i=>new Promise((a,l)=>{try{const c=e(i);a(c)}catch(c){l(c)}});r.onAbort=n,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const s of n)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function Xb(t,e={}){return Es(t,"GET","/v2/passwordPolicy",Sa(t,e))}/**
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
 */const Zb=6;class eA{constructor(e){var n,r,s,i;const a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=a.minPasswordLength)!==null&&n!==void 0?n:Zb,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,s,i,a,l;const c={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,c),this.validatePasswordCharacterOptions(e,c),c.isValid&&(c.isValid=(n=c.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),c.isValid&&(c.isValid=(r=c.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),c.isValid&&(c.isValid=(s=c.containsLowercaseLetter)!==null&&s!==void 0?s:!0),c.isValid&&(c.isValid=(i=c.containsUppercaseLetter)!==null&&i!==void 0?i:!0),c.isValid&&(c.isValid=(a=c.containsNumericCharacter)!==null&&a!==void 0?a:!0),c.isValid&&(c.isValid=(l=c.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),c}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),s&&(n.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
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
 */class tA{constructor(e,n,r,s){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new tf(this),this.idTokenSubscription=new tf(this),this.beforeStateQueue=new Yb(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=fg,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=bn(n)),this._initializationPromise=this.queue(async()=>{var r,s;if(!this._deleted&&(this.persistenceManager=await ns.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await vg(this,{idToken:e}),r=await In._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(En(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,l=s==null?void 0:s._redirectEventId,c=await this.tryRedirectSignIn(e);(!a||a===l)&&(c!=null&&c.user)&&(s=c.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(a){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return ce(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await qo(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Lb()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(En(this.app))return Promise.reject(tr(this));const n=e?St(e):null;return n&&ce(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&ce(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return En(this.app)?Promise.reject(tr(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return En(this.app)?Promise.reject(tr(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(bn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Xb(this),n=new eA(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new Ii("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await Gb(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&bn(e)||this._popupRedirectResolver;ce(n,this,"argument-error"),this.redirectPersistenceManager=await ns.create(this,[bn(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,s){if(this._deleted)return()=>{};const i=typeof n=="function"?n:n.next.bind(n);let a=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(ce(l,this,"internal-error"),l.then(()=>{a||i(this.currentUser)}),typeof n=="function"){const c=e.addObserver(n,r,s);return()=>{a=!0,c()}}else{const c=e.addObserver(n);return()=>{a=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ce(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=xg(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(n["X-Firebase-AppCheck"]=s),n}async _getAppCheckToken(){var e;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&Nb(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function Pa(t){return St(t)}class tf{constructor(e){this.auth=e,this.observer=null,this.addObserver=dw(n=>this.observer=n)}get next(){return ce(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let fu={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function nA(t){fu=t}function rA(t){return fu.loadJS(t)}function sA(){return fu.gapiScript}function iA(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
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
 */function oA(t,e){const n=Sc(t,"auth");if(n.isInitialized()){const s=n.getImmediate(),i=n.getOptions();if(Do(i,e??{}))return s;xn(s,"already-initialized")}return n.initialize({options:e})}function aA(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(bn);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function lA(t,e,n){const r=Pa(t);ce(r._canInitEmulator,r,"emulator-config-failed"),ce(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!!(n!=null&&n.disableWarnings),i=kg(e),{host:a,port:l}=cA(e),c=l===null?"":`:${l}`;r.config.emulator={url:`${i}//${a}${c}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:a,port:l,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})}),s||uA()}function kg(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function cA(t){const e=kg(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:nf(r.substr(i.length+1))}}else{const[i,a]=r.split(":");return{host:i,port:nf(a)}}}function nf(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function uA(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
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
 */class Dg{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return Tn("not implemented")}_getIdTokenResponse(e){return Tn("not implemented")}_linkToIdToken(e,n){return Tn("not implemented")}_getReauthenticationResolver(e){return Tn("not implemented")}}/**
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
 */async function rs(t,e){return _g(t,"POST","/v1/accounts:signInWithIdp",Sa(t,e))}/**
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
 */const hA="http://localhost";class Cr extends Dg{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new Cr(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):xn("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=n,i=lu(n,["providerId","signInMethod"]);if(!r||!s)return null;const a=new Cr(r,s);return a.idToken=i.idToken||void 0,a.accessToken=i.accessToken||void 0,a.secret=i.secret,a.nonce=i.nonce,a.pendingToken=i.pendingToken||null,a}_getIdTokenResponse(e){const n=this.buildRequest();return rs(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,rs(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,rs(e,n)}buildRequest(){const e={requestUri:hA,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=bi(n)}return e}}/**
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
 */class Vg{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Vi extends Vg{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class Hn extends Vi{constructor(){super("facebook.com")}static credential(e){return Cr._fromParams({providerId:Hn.PROVIDER_ID,signInMethod:Hn.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Hn.credentialFromTaggedObject(e)}static credentialFromError(e){return Hn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Hn.credential(e.oauthAccessToken)}catch{return null}}}Hn.FACEBOOK_SIGN_IN_METHOD="facebook.com";Hn.PROVIDER_ID="facebook.com";/**
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
 */class zn extends Vi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return Cr._fromParams({providerId:zn.PROVIDER_ID,signInMethod:zn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return zn.credentialFromTaggedObject(e)}static credentialFromError(e){return zn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return zn.credential(n,r)}catch{return null}}}zn.GOOGLE_SIGN_IN_METHOD="google.com";zn.PROVIDER_ID="google.com";/**
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
 */class Kn extends Vi{constructor(){super("github.com")}static credential(e){return Cr._fromParams({providerId:Kn.PROVIDER_ID,signInMethod:Kn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Kn.credentialFromTaggedObject(e)}static credentialFromError(e){return Kn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Kn.credential(e.oauthAccessToken)}catch{return null}}}Kn.GITHUB_SIGN_IN_METHOD="github.com";Kn.PROVIDER_ID="github.com";/**
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
 */class Wn extends Vi{constructor(){super("twitter.com")}static credential(e,n){return Cr._fromParams({providerId:Wn.PROVIDER_ID,signInMethod:Wn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return Wn.credentialFromTaggedObject(e)}static credentialFromError(e){return Wn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return Wn.credential(n,r)}catch{return null}}}Wn.TWITTER_SIGN_IN_METHOD="twitter.com";Wn.PROVIDER_ID="twitter.com";/**
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
 */async function dA(t,e){return _g(t,"POST","/v1/accounts:signUp",Sa(t,e))}/**
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
 */class lr{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,s=!1){const i=await In._fromIdTokenResponse(e,r,s),a=rf(r);return new lr({user:i,providerId:a,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const s=rf(r);return new lr({user:e,providerId:s,_tokenResponse:r,operationType:n})}}function rf(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
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
 */async function fA(t){var e;if(En(t.app))return Promise.reject(tr(t));const n=Pa(t);if(await n._initializationPromise,!((e=n.currentUser)===null||e===void 0)&&e.isAnonymous)return new lr({user:n.currentUser,providerId:null,operationType:"signIn"});const r=await dA(n,{returnSecureToken:!0}),s=await lr._fromIdTokenResponse(n,"signIn",r,!0);return await n._updateCurrentUser(s.user),s}/**
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
 */class Ho extends Vn{constructor(e,n,r,s){var i;super(n.code,n.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,Ho.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,s){return new Ho(e,n,r,s)}}function Ng(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?Ho._fromErrorAndOperation(t,i,e,r):i})}async function pA(t,e,n=!1){const r=await wi(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return lr._forOperation(t,"link",r)}/**
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
 */async function mA(t,e,n=!1){const{auth:r}=t;if(En(r.app))return Promise.reject(tr(r));const s="reauthenticate";try{const i=await wi(t,Ng(r,s,e,t),n);ce(i.idToken,r,"internal-error");const a=hu(i.idToken);ce(a,r,"internal-error");const{sub:l}=a;return ce(t.uid===l,r,"user-mismatch"),lr._forOperation(t,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&xn(r,"user-mismatch"),i}}/**
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
 */async function gA(t,e,n=!1){if(En(t.app))return Promise.reject(tr(t));const r="signIn",s=await Ng(t,r,e),i=await lr._fromIdTokenResponse(t,r,s);return n||await t._updateCurrentUser(i.user),i}function _A(t,e,n,r){return St(t).onIdTokenChanged(e,n,r)}function yA(t,e,n){return St(t).beforeAuthStateChanged(e,n)}const zo="__sak";/**
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
 */class Og{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(zo,"1"),this.storage.removeItem(zo),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const vA=1e3,wA=10;class Mg extends Og{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Cg(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),s=this.localCache[n];r!==s&&e(n,s,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((a,l,c)=>{this.notifyListeners(a,c)});return}const r=e.key;n?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!n&&this.localCache[r]===a||this.notifyListeners(r,a)},i=this.storage.getItem(r);Jb()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,wA):s()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},vA)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}Mg.type="LOCAL";const EA=Mg;/**
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
 */class Lg extends Og{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}Lg.type="SESSION";const Fg=Lg;/**
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
 */function TA(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
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
 */class Ca{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(s=>s.isListeningto(e));if(n)return n;const r=new Ca(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:s,data:i}=n.data,a=this.handlersMap[s];if(!(a!=null&&a.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const l=Array.from(a).map(async h=>h(n.origin,i)),c=await TA(l);n.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:c})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Ca.receivers=[];/**
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
 */function pu(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
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
 */class IA{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,a;return new Promise((l,c)=>{const h=pu("",20);s.port1.start();const d=setTimeout(()=>{c(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(p){const g=p;if(g.data.eventId===h)switch(g.data.status){case"ack":clearTimeout(d),i=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),l(g.data.response);break;default:clearTimeout(d),clearTimeout(i),c(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:h,data:n},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
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
 */function un(){return window}function bA(t){un().location.href=t}/**
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
 */function Ug(){return typeof un().WorkerGlobalScope<"u"&&typeof un().importScripts=="function"}async function AA(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function RA(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)===null||t===void 0?void 0:t.controller)||null}function SA(){return Ug()?self:null}/**
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
 */const jg="firebaseLocalStorageDb",PA=1,Ko="firebaseLocalStorage",Bg="fbase_key";class Ni{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function xa(t,e){return t.transaction([Ko],e?"readwrite":"readonly").objectStore(Ko)}function CA(){const t=indexedDB.deleteDatabase(jg);return new Ni(t).toPromise()}function sc(){const t=indexedDB.open(jg,PA);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(Ko,{keyPath:Bg})}catch(s){n(s)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(Ko)?e(r):(r.close(),await CA(),e(await sc()))})})}async function sf(t,e,n){const r=xa(t,!0).put({[Bg]:e,value:n});return new Ni(r).toPromise()}async function xA(t,e){const n=xa(t,!1).get(e),r=await new Ni(n).toPromise();return r===void 0?null:r.value}function of(t,e){const n=xa(t,!0).delete(e);return new Ni(n).toPromise()}const kA=800,DA=3;class $g{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await sc(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>DA)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Ug()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Ca._getInstance(SA()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var e,n;if(this.activeServiceWorker=await AA(),!this.activeServiceWorker)return;this.sender=new IA(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((n=r[0])===null||n===void 0)&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||RA()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await sc();return await sf(e,zo,"1"),await of(e,zo),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>sf(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>xA(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>of(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=xa(s,!1).getAll();return new Ni(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),n.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),n.push(s));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),kA)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}$g.type="LOCAL";const VA=$g;new Di(3e4,6e4);/**
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
 */function NA(t,e){return e?bn(e):(ce(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class mu extends Dg{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return rs(e,this._buildIdpRequest())}_linkToIdToken(e,n){return rs(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return rs(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function OA(t){return gA(t.auth,new mu(t),t.bypassAuthState)}function MA(t){const{auth:e,user:n}=t;return ce(n,e,"internal-error"),mA(n,new mu(t),t.bypassAuthState)}async function LA(t){const{auth:e,user:n}=t;return ce(n,e,"internal-error"),pA(n,new mu(t),t.bypassAuthState)}/**
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
 */class qg{constructor(e,n,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:s,tenantId:i,error:a,type:l}=e;if(a){this.reject(a);return}const c={auth:this.auth,requestUri:n,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(c))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return OA;case"linkViaPopup":case"linkViaRedirect":return LA;case"reauthViaPopup":case"reauthViaRedirect":return MA;default:xn(this.auth,"internal-error")}}resolve(e){kn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){kn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const FA=new Di(2e3,1e4);class Wr extends qg{constructor(e,n,r,s,i){super(e,n,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Wr.currentPopupAction&&Wr.currentPopupAction.cancel(),Wr.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return ce(e,this.auth,"internal-error"),e}async onExecution(){kn(this.filter.length===1,"Popup operations only handle one event");const e=pu();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(cn(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(cn(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Wr.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if(!((r=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(cn(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,FA.get())};e()}}Wr.currentPopupAction=null;/**
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
 */const UA="pendingRedirect",To=new Map;class jA extends qg{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=To.get(this.auth._key());if(!e){try{const r=await BA(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}To.set(this.auth._key(),e)}return this.bypassAuthState||To.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function BA(t,e){const n=HA(e),r=qA(t);if(!await r._isAvailable())return!1;const s=await r._get(n)==="true";return await r._remove(n),s}function $A(t,e){To.set(t._key(),e)}function qA(t){return bn(t._redirectPersistence)}function HA(t){return Eo(UA,t.config.apiKey,t.name)}async function zA(t,e,n=!1){if(En(t.app))return Promise.reject(tr(t));const r=Pa(t),s=NA(r,e),a=await new jA(r,s,n).execute();return a&&!n&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
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
 */const KA=10*60*1e3;class WA{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!GA(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!Hg(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";n.onError(cn(this.auth,s))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=KA&&this.cachedEventUids.clear(),this.cachedEventUids.has(af(e))}saveEventToCache(e){this.cachedEventUids.add(af(e)),this.lastProcessedEventTime=Date.now()}}function af(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function Hg({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function GA(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Hg(t);default:return!1}}/**
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
 */async function QA(t,e={}){return Es(t,"GET","/v1/projects",e)}/**
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
 */const JA=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,YA=/^https?/;async function XA(t){if(t.config.emulator)return;const{authorizedDomains:e}=await QA(t);for(const n of e)try{if(ZA(n))return}catch{}xn(t,"unauthorized-domain")}function ZA(t){const e=nc(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const a=new URL(t);return a.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&a.hostname===r}if(!YA.test(n))return!1;if(JA.test(t))return r===t;const s=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
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
 */const eR=new Di(3e4,6e4);function lf(){const t=un().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function tR(t){return new Promise((e,n)=>{var r,s,i;function a(){lf(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{lf(),n(cn(t,"network-request-failed"))},timeout:eR.get()})}if(!((s=(r=un().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=un().gapi)===null||i===void 0)&&i.load)a();else{const l=iA("iframefcb");return un()[l]=()=>{gapi.load?a():n(cn(t,"network-request-failed"))},rA(`${sA()}?onload=${l}`).catch(c=>n(c))}}).catch(e=>{throw Io=null,e})}let Io=null;function nR(t){return Io=Io||tR(t),Io}/**
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
 */const rR=new Di(5e3,15e3),sR="__/auth/iframe",iR="emulator/auth/iframe",oR={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},aR=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function lR(t){const e=t.config;ce(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?uu(e,iR):`https://${t.config.authDomain}/${sR}`,r={apiKey:e.apiKey,appName:t.name,v:ms},s=aR.get(t.config.apiHost);s&&(r.eid=s);const i=t._getFrameworks();return i.length&&(r.fw=i.join(",")),`${n}?${bi(r).slice(1)}`}async function cR(t){const e=await nR(t),n=un().gapi;return ce(n,t,"internal-error"),e.open({where:document.body,url:lR(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:oR,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const a=cn(t,"network-request-failed"),l=un().setTimeout(()=>{i(a)},rR.get());function c(){un().clearTimeout(l),s(r)}r.ping(c).then(c,()=>{i(a)})}))}/**
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
 */const uR={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},hR=500,dR=600,fR="_blank",pR="http://localhost";class cf{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function mR(t,e,n,r=hR,s=dR){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const c=Object.assign(Object.assign({},uR),{width:r.toString(),height:s.toString(),top:i,left:a}),h=Rt().toLowerCase();n&&(l=bg(h)?fR:n),Tg(h)&&(e=e||pR,c.scrollbars="yes");const d=Object.entries(c).reduce((g,[y,D])=>`${g}${y}=${D},`,"");if(Qb(h)&&l!=="_self")return gR(e||"",l),new cf(null);const p=window.open(e||"",l,d);ce(p,t,"popup-blocked");try{p.focus()}catch{}return new cf(p)}function gR(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
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
 */const _R="__/auth/handler",yR="emulator/auth/handler",vR=encodeURIComponent("fac");async function uf(t,e,n,r,s,i){ce(t.config.authDomain,t,"auth-domain-config-required"),ce(t.config.apiKey,t,"invalid-api-key");const a={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:ms,eventId:s};if(e instanceof Vg){e.setDefaultLanguage(t.languageCode),a.providerId=e.providerId||"",hw(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,p]of Object.entries(i||{}))a[d]=p}if(e instanceof Vi){const d=e.getScopes().filter(p=>p!=="");d.length>0&&(a.scopes=d.join(","))}t.tenantId&&(a.tid=t.tenantId);const l=a;for(const d of Object.keys(l))l[d]===void 0&&delete l[d];const c=await t._getAppCheckToken(),h=c?`#${vR}=${encodeURIComponent(c)}`:"";return`${wR(t)}?${bi(l).slice(1)}${h}`}function wR({config:t}){return t.emulator?uu(t,yR):`https://${t.authDomain}/${_R}`}/**
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
 */const yl="webStorageSupport";class ER{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Fg,this._completeRedirectFn=zA,this._overrideRedirectResult=$A}async _openPopup(e,n,r,s){var i;kn((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const a=await uf(e,n,r,nc(),s);return mR(e,a,pu())}async _openRedirect(e,n,r,s){await this._originValidation(e);const i=await uf(e,n,r,nc(),s);return bA(i),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:s,promise:i}=this.eventManagers[n];return s?Promise.resolve(s):(kn(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await cR(e),r=new WA(e);return n.register("authEvent",s=>(ce(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(yl,{type:yl},s=>{var i;const a=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[yl];a!==void 0&&n(!!a),xn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=XA(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return Cg()||Ig()||du()}}const TR=ER;var hf="@firebase/auth",df="1.7.9";/**
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
 */class IR{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){ce(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function bR(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function AR(t){as(new Ar("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:a,authDomain:l}=r.options;ce(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:a,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:xg(t)},h=new tA(r,s,i,c);return aA(h,n),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),as(new Ar("auth-internal",e=>{const n=Pa(e.getProvider("auth").getImmediate());return(r=>new IR(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Xn(hf,df,bR(t)),Xn(hf,df,"esm2017")}/**
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
 */const RR=5*60,SR=jp("authIdTokenMaxAge")||RR;let ff=null;const PR=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>SR)return;const s=n==null?void 0:n.token;ff!==s&&(ff=s,await fetch(t,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function CR(t=Hp()){const e=Sc(t,"auth");if(e.isInitialized())return e.getImmediate();const n=oA(t,{popupRedirectResolver:TR,persistence:[VA,EA,Fg]}),r=jp("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const a=PR(i.toString());yA(n,a,()=>a(n.currentUser)),_A(n,l=>a(l))}}const s=Fp("auth");return s&&lA(n,`http://${s}`),n}function xR(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}nA({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=s=>{const i=cn("internal-error");i.customData=s,n(i)},r.type="text/javascript",r.charset="UTF-8",xR().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});AR("Browser");const kR={apiKey:"AIzaSyDCqJRmxKiIzuAhgXsmXICCx_O65aujNa0",authDomain:"impro-selector.firebaseapp.com",projectId:"impro-selector",storageBucket:"impro-selector.appspot.com",messagingSenderId:"730278491306",appId:"1:730278491306:web:c966af1179221e91118cd3",measurementId:"G-3NB062D088"},zg=qp(kR),ue=fb(zg),DR=CR(zg);fA(DR);const gu="seasons";async function VR(t,e){return await kb(Ue(ue,gu),{name:t,slug:e,createdAt:ug()})}async function NR(t){return await Bo(Qe(ue,gu,t))}async function vl(){const t=lg(Ue(ue,gu),Ab("createdAt","desc"));return(await Ye(t)).docs.map(n=>({id:n.id,...n.data()}))}const OR={class:"min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"},MR={class:"container mx-auto px-4 pb-16"},LR={class:"flex justify-center mb-12"},FR={class:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto"},UR=["onClick"],jR={class:"text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors"},BR=["onClick"],$R={key:0,class:"text-center py-16"},qR={key:0,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},HR={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},zR={class:"mb-6"},KR={class:"mb-6"},WR={class:"flex justify-end space-x-3"},GR=["disabled"],QR={key:1,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},JR={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},YR={class:"text-center mb-6"},XR={class:"text-gray-300"},ZR={__name:"Home",setup(t){const e=Se([]),n=$0(),r=Se(!1),s=Se(!1),i=Se(""),a=Se(""),l=Se(null);vc(async()=>{e.value=await vl(),console.log("Saisons chargées:",e.value)});function c(O){n.push(`/season/${O}`)}function h(){i.value&&(a.value=i.value.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim("-"))}async function d(){if(!(!i.value.trim()||!a.value.trim()))try{await VR(i.value.trim(),a.value.trim()),e.value=await vl(),p()}catch(O){console.error("Erreur lors de la création de la saison:",O),alert("Erreur lors de la création de la saison. Veuillez réessayer.")}}function p(){r.value=!1,i.value="",a.value=""}function g(O){l.value=O,s.value=!0}async function y(){if(l.value)try{await NR(l.value.id),e.value=await vl(),D()}catch(O){console.error("Erreur lors de la suppression de la saison:",O),alert("Erreur lors de la suppression de la saison. Veuillez réessayer.")}}function D(){s.value=!1,l.value=null}return(O,x)=>{var q;return Ee(),Re("div",OR,[x[17]||(x[17]=M("div",{class:"text-center py-16 px-4"},[M("h1",{class:"text-6xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse"}," Sélections Spectacle "),M("p",{class:"text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"}," Gérez facilement les sélections pour vos spectacles. ")],-1)),M("div",MR,[M("div",LR,[M("button",{onClick:x[0]||(x[0]=j=>r.value=!0),class:"bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105"}," ✨ Nouvelle saison ")]),M("div",FR,[(Ee(!0),Re(ft,null,wr(e.value,j=>(Ee(),Re("div",{key:j.id,class:"group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"},[M("div",{onClick:G=>c(j.slug),class:"text-center"},[x[4]||(x[4]=M("div",{class:"w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"},[M("span",{class:"text-2xl"},"🎭")],-1)),M("h2",jR,rn(j.name),1),x[5]||(x[5]=M("div",{class:"w-full bg-gradient-to-r from-transparent via-white/20 to-transparent h-px mb-4"},null,-1)),x[6]||(x[6]=M("p",{class:"text-gray-300 text-sm"}," Cliquez pour accéder ",-1))],8,UR),M("button",{onClick:kv(G=>g(j),["stop"]),class:"absolute top-4 right-4 text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100",title:"Supprimer cette saison"},x[7]||(x[7]=[M("svg",{class:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[M("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})],-1)]),8,BR)]))),128))]),e.value.length===0?(Ee(),Re("div",$R,[x[8]||(x[8]=M("div",{class:"w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center"},[M("span",{class:"text-4xl"},"🎪")],-1)),x[9]||(x[9]=M("h3",{class:"text-2xl font-bold text-white mb-4"},"Aucune saison créée",-1)),x[10]||(x[10]=M("p",{class:"text-gray-300 mb-8"},"Commencez par créer votre première saison de spectacles !",-1)),M("button",{onClick:x[1]||(x[1]=j=>r.value=!0),class:"bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-xl hover:shadow-pink-500/25 transition-all duration-300"}," Créer ma première saison ")])):yn("",!0)]),r.value?(Ee(),Re("div",qR,[M("div",HR,[x[13]||(x[13]=M("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✨ Nouvelle saison",-1)),M("div",zR,[x[11]||(x[11]=M("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nom de la saison",-1)),jn(M("input",{"onUpdate:modelValue":x[2]||(x[2]=j=>i.value=j),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Ex: La Malice 2025-2026",onInput:h},null,544),[[$n,i.value]])]),M("div",KR,[x[12]||(x[12]=M("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Slug (URL)",-1)),jn(M("input",{"onUpdate:modelValue":x[3]||(x[3]=j=>a.value=j),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Ex: malice-2025-2026"},null,512),[[$n,a.value]])]),M("div",WR,[M("button",{onClick:p,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),M("button",{onClick:d,disabled:!i.value.trim()||!a.value.trim(),class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300"}," Créer ",8,GR)])])])):yn("",!0),s.value?(Ee(),Re("div",QR,[M("div",JR,[M("div",YR,[x[14]||(x[14]=M("div",{class:"w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"},[M("span",{class:"text-2xl"},"⚠️")],-1)),x[15]||(x[15]=M("h2",{class:"text-2xl font-bold text-white mb-2"},"Confirmation",-1)),M("p",XR,'Êtes-vous sûr de vouloir supprimer la saison "'+rn((q=l.value)==null?void 0:q.name)+'" ?',1)]),x[16]||(x[16]=M("p",{class:"mb-6 text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-500/20"}," ⚠️ Cette action est irréversible et supprimera toutes les données de cette saison. ",-1)),M("div",{class:"flex justify-end space-x-3"},[M("button",{onClick:D,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),M("button",{onClick:y,class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"}," Supprimer ")])])])):yn("",!0)])}}};let kt="mock";const xr=[{id:"p1",name:"Alice"},{id:"p2",name:"Bob"},{id:"p3",name:"Charlie"},{id:"p4",name:"David"},{id:"p5",name:"Eva"},{id:"p6",name:"Fanny"},{id:"p7",name:"Georges"},{id:"p8",name:"Hélène"},{id:"p9",name:"Ismaël"},{id:"p10",name:"Jade"},{id:"p11",name:"Karim"},{id:"p12",name:"Léa"},{id:"p13",name:"Marc"},{id:"p14",name:"Nina"},{id:"p15",name:"Oscar"}],kr=[{id:"event1",title:"Apérock Septembre",date:"2025-09-08"},{id:"event2",title:"Match à Cambo",date:"2025-11-25"},{id:"event3",title:"Impro des Familles",date:"2025-12-02"},{id:"event4",title:"Cabaret Surprise",date:"2026-01-20"},{id:"event5",title:"Impro Plage",date:"2026-03-10"}];function eS(t){kt=t}async function tS(){if(kt!=="firebase"||!(await Ye(Ue(ue,"seasons"))).empty)return;const e=Qe(Ue(ue,"seasons"));await Jt(e,{name:"Malice 2025-2026",slug:"malice-2025-2026",createdAt:ug()});const n=await Ye(Ue(ue,"players"));for(const a of n.docs)await Jt(Qe(e,"players",a.id),a.data());const r=await Ye(Ue(ue,"events"));for(const a of r.docs)await Jt(Qe(e,"events",a.id),a.data());const s=await Ye(Ue(ue,"availability"));for(const a of s.docs)await Jt(Qe(e,"availability",a.id),a.data());const i=await Ye(Ue(ue,"selections"));for(const a of i.docs)await Jt(Qe(e,"selections",a.id),a.data())}async function nS(){kt==="firebase"&&await tS()}async function pf(t=null){return(kt==="firebase"?t?(await Ye(Ue(ue,"seasons",t,"events"))).docs.map(n=>({id:n.id,...n.data()})):(await Ye(Ue(ue,"events"))).docs.map(n=>({id:n.id,...n.data()})):kr).sort((n,r)=>{const s=new Date(n.date),i=new Date(r.date);return s<i?-1:s>i?1:n.title.localeCompare(r.title)})}async function mf(t=null){return(kt==="firebase"?t?(await Ye(Ue(ue,"seasons",t,"players"))).docs.map(n=>({id:n.id,...n.data()})):(await Ye(Ue(ue,"players"))).docs.map(n=>({id:n.id,...n.data()})):xr).sort((n,r)=>n.order<r.order?-1:n.order>r.order?1:n.name.localeCompare(r.name))}async function rS(t,e=null){if(kt==="firebase"){const n=Qe(e?Ue(ue,"seasons",e,"players"):Ue(ue,"players"));return await Jt(n,{name:t}),n.id}else{const n=`p${xr.length+1}`;return xr.push({id:n,name:t}),n}}async function sS(t,e=null){if(kt==="firebase"){const n=e?Qe(ue,"seasons",e,"players",t):Qe(ue,"players",t);await Bo(n);const r=e?await Ye(Ue(ue,"seasons",e,"availability")):await Ye(Ue(ue,"availability")),s=hg(ue);r.forEach(i=>{const a=i.data();if(a[t]!==void 0){const l={...a};delete l[t],s.update(i.ref,l)}}),await s.commit()}else xr=xr.filter(n=>n.id!==t)}async function iS(t,e,n=null){if(kt==="firebase"){const r=n?Qe(ue,"seasons",n,"players",t):Qe(ue,"players",t);await Jt(r,{name:e})}else{const r=xr.findIndex(s=>s.id===t);r!==-1&&(xr[r]=e)}}async function oo(t,e,n=null){if(kt==="firebase"){const r=n?await Ye(Ue(ue,"seasons",n,"availability")):await Ye(Ue(ue,"availability")),s={};return r.forEach(i=>{s[i.id]=i.data()}),s}else{const r={};return t.forEach(s=>{r[s.name]={},e.forEach(i=>{r[s.name][i.id]=void 0})}),e.forEach(s=>{const i=[...t].sort(()=>.5-Math.random());i.slice(0,4).forEach(a=>{r[a.name][s.id]=!0}),i.slice(4).forEach(a=>{const l=Math.random();r[a.name][s.id]=l<.4?!0:l<.8?!1:void 0})}),r}}async function ao(t=null){if(kt==="firebase"){const e=t?await Ye(Ue(ue,"seasons",t,"selections")):await Ye(Ue(ue,"selections")),n={};return e.forEach(r=>{n[r.id]=r.data().players||[]}),n}else return{}}async function gf(t,e,n=null){if(kt==="firebase"){const r=n?Qe(ue,"seasons",n,"availability",t):Qe(ue,"availability",t);await Jt(r,e)}}async function oS(t,e,n=null){if(kt==="firebase"){const r=n?Qe(ue,"seasons",n,"selections",t):Qe(ue,"selections",t);await Jt(r,{players:e})}}async function aS(t,e=null){if(console.log("Suppression de l'événement:",t),kt==="firebase")try{console.log("Suppression de l'événement dans Firestore");const n=e?Qe(ue,"seasons",e,"events",t):Qe(ue,"events",t);await Bo(n),console.log("Suppression de la sélection associée");const r=e?Qe(ue,"seasons",e,"selections",t):Qe(ue,"selections",t);await Bo(r),console.log("Suppression des disponibilités");const s=e?await Ye(Ue(ue,"seasons",e,"availability")):await Ye(Ue(ue,"availability")),i=hg(ue);s.forEach(a=>{const l=a.data();if(l[t]!==void 0){console.log("Mise à jour de la disponibilité pour:",a.id);const c={...l};delete c[t],i.update(a.ref,c)}}),await i.commit(),console.log("Opérations de suppression terminées avec succès")}catch(n){throw console.error("Erreur lors de la suppression:",n),n}else kr=kr.filter(n=>n.id!==t)}async function lS(t,e=null){if(kt==="firebase"){const n=Qe(e?Ue(ue,"seasons",e,"events"):Ue(ue,"events"));return await Jt(n,t),n.id}else{const n=`event${kr.length+1}`;return kr.push({id:n,...t}),n}}async function cS(t,e,n=null){if(kt==="firebase"){const r=n?Qe(ue,"seasons",n,"events",t):Qe(ue,"events",t);await Jt(r,e)}else{const r=kr.findIndex(s=>s.id===t);r!==-1&&(kr[r]={id:t,...e})}}const uS={class:"min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"},hS={class:"text-center py-8 px-4"},dS={class:"text-4xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"},fS={class:"container mx-auto px-4 pb-16"},pS={class:"sticky top-0 z-50 backdrop-blur-sm bg-black/20 border border-white/20 rounded-t-2xl overflow-hidden"},mS={class:"border-collapse w-full table-fixed"},gS={class:"text-white"},_S={class:"p-4 text-left"},yS={class:"flex items-center justify-center space-x-3"},vS=["onMouseenter","onDblclick"],wS={class:"flex flex-col gap-3"},ES={class:"flex flex-col items-center space-y-2 relative"},TS={key:0,class:"font-bold text-lg text-center whitespace-pre-wrap relative group"},IS=["title"],bS={key:1,class:"w-full"},AS=["title"],RS={key:3,class:"w-full"},SS=["onClick"],PS={class:"p-4 text-center"},CS={class:"bg-black/10"},xS=["onClick","title"],kS={class:"overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-b-2xl"},DS={class:"table-auto border-collapse w-full table-fixed"},VS=["data-player-id"],NS={class:"p-4 font-medium text-white w-[100px] relative group text-lg"},OS={key:0,class:"font-bold text-lg whitespace-pre-wrap flex items-center justify-between"},MS=["onDblclick","title"],LS=["onClick"],FS={key:1,class:"w-full"},US={class:"p-4 text-center text-gray-300 text-lg w-[100px]"},jS=["title"],BS=["onClick"],$S={class:"flex items-center justify-center"},qS=["title"],HS=["title"],zS=["title"],KS=["title"],WS={key:0,class:"fixed bottom-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-2xl border border-green-400/30 backdrop-blur-sm z-50"},GS={class:"flex items-center space-x-2"},QS={key:1,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},JS={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},YS={class:"mb-6"},XS={class:"mb-6"},ZS={key:2,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},eP={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},tP={class:"mb-6"},nP={class:"flex justify-end space-x-3"},rP={key:3,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},sP={key:4,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},iP={key:5,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},oP={__name:"GridBoard",props:{slug:{type:String,required:!0}},setup(t){const e=t;e.slug;const n=Se(""),r=Se(""),s=Se(!1),i=Se(null),a=Se(null),l=Se(""),c=Se(""),h=Se(null),d=Se(""),p=Se(!1),g=Se(""),y=Se(null),D=Se(!1),O=Se(null);function x(V){y.value=V;const R=document.querySelector(`[data-player-id="${V}"]`);R&&R.scrollIntoView({behavior:"smooth",block:"center"}),q.value=!0,j.value="Nouveau joueur ajouté !",setTimeout(()=>{q.value=!1},3e3)}const q=Se(!1),j=Se("");async function G(V){i.value=V,s.value=!0}async function J(){s.value=!1;try{await aS(i.value,r.value),Ce.value=Ce.value.filter(V=>V.id!==i.value),await Promise.all([pf(r.value),oo(Fe.value,Ce.value,r.value),ao(r.value)]).then(([V,R,C])=>{Ce.value=V,$e.value=R,Ie.value=C}),i.value=null,q.value=!0,j.value="Événement supprimé avec succès !",setTimeout(()=>{q.value=!1},3e3)}catch(V){console.error("Erreur lors de la suppression de l'événement:",V),alert("Erreur lors de la suppression de l'événement. Veuillez réessayer.")}}function ge(){s.value=!1,i.value=null}function _e(V){a.value=V.id,l.value=V.title,c.value=V.date}async function I(){if(!(!a.value||!l.value.trim()||!c.value))try{const V={title:l.value.trim(),date:c.value};await cS(a.value,V,r.value),await Promise.all([pf(r.value),oo(Fe.value,Ce.value,r.value),ao(r.value)]).then(([R,C,K])=>{Ce.value=R,$e.value=C,Ie.value=K}),a.value=null,l.value="",c.value="",q.value=!0,j.value="Événement mis à jour avec succès !",setTimeout(()=>{q.value=!1},3e3)}catch(V){console.error("Erreur lors de l'édition de l'événement:",V),alert("Erreur lors de l'édition de l'événement. Veuillez réessayer.")}}function v(V){h.value=V.id,d.value=V.name,gc(()=>{editPlayerInput.value&&editPlayerInput.value.focus()})}async function T(){if(!(!h.value||!d.value.trim()))try{await iS(h.value,d.value.trim(),r.value),await Promise.all([mf(r.value),oo(Fe.value,Ce.value,r.value),ao(r.value)]).then(([V,R,C])=>{Fe.value=V,$e.value=R,Ie.value=C}),h.value=null,d.value="",q.value=!0,j.value="Joueur mis à jour avec succès !",setTimeout(()=>{q.value=!1},3e3)}catch(V){console.error("Erreur lors de l'édition du joueur:",V),alert("Erreur lors de l'édition du joueur. Veuillez réessayer.")}}function b(){h.value=null,d.value=""}async function A(){if(g.value.trim())try{const V=g.value.trim(),R=await rS(V,r.value);await Promise.all([mf(r.value),oo(Fe.value,Ce.value,r.value),ao(r.value)]).then(([C,K,oe])=>{Fe.value=C,$e.value=K,Ie.value=oe;const ve=Fe.value.find(ke=>ke.id===R);x(R);const le=document.querySelector(`[data-player-id="${R}"]`);le&&le.scrollIntoView({behavior:"smooth",block:"center"}),q.value=!0,j.value="Joueur ajouté avec succès ! Vous pouvez maintenant indiquer sa disponibilité.",setTimeout(()=>{q.value=!1},3e3),setTimeout(()=>{q.value=!1,j.value=""},5e3)}),p.value=!1,g.value=""}catch(V){console.error("Erreur lors de l'ajout du joueur:",V),alert("Erreur lors de l'ajout du joueur. Veuillez réessayer.")}}function P(){a.value=null,l.value="",c.value=""}const E=Se(null),tt=Se(!1),ot=Se(""),Be=Se("");async function Te(){if(!ot.value.trim()||!Be.value){alert("Veuillez remplir le titre et la date de l'événement");return}const V={title:ot.value.trim(),date:Be.value};try{const R=await lS(V,r.value);Ce.value=[...Ce.value,{id:R,...V}];const C={};for(const K of Fe.value)C[K.name]=$e.value[K.name]||{},C[K.name][R]=null,await gf(K.name,C[K.name],r.value);ot.value="",Be.value="",tt.value=!1,await Promise.resolve()}catch(R){console.error("Erreur lors de la création de l'événement:",R),alert("Erreur lors de la création de l'événement. Veuillez réessayer.")}}function we(){ot.value="",Be.value="",tt.value=!1}const Ce=Se([]),Fe=Se([]),$e=Se({}),Ie=Se({}),Ke=Se({}),Wt=Se({});vc(async()=>{eS("firebase"),await nS();const V=lg(Ue(ue,"seasons"),bb("slug","==",e.slug)),R=await Ye(V);if(!R.empty){const C=R.docs[0];r.value=C.id,n.value=C.data().name,document.title=`Saison : ${n.value}`}if(r.value){const C=await Ye(Ue(ue,"seasons",r.value,"players"));Fe.value=C.docs.map(Ae=>({id:Ae.id,...Ae.data()}));const K=await Ye(Ue(ue,"seasons",r.value,"events"));Ce.value=K.docs.map(Ae=>({id:Ae.id,...Ae.data()}));const oe=await Ye(Ue(ue,"seasons",r.value,"availability")),ve={};oe.docs.forEach(Ae=>{ve[Ae.id]=Ae.data()}),$e.value=ve;const le=await Ye(Ue(ue,"seasons",r.value,"selections")),ke={};le.docs.forEach(Ae=>{ke[Ae.id]=Ae.data().players||[]}),Ie.value=ke}w(),k(),console.log("players (deduplicated):",Fe.value.map(C=>({id:C.id,name:C.name})))});function $t(V,R){const C=Fe.value.find(le=>le.name===V);if(!C){console.error("Joueur non trouvé:",V);return}if(!Ce.value.find(le=>le.id===R)){console.error("Événement non trouvé:",R);return}C.availabilities||(C.availabilities={});const oe=C.availabilities[R];let ve;oe==="oui"?(ve="non",C.availabilities[R]=ve):oe==="non"?(delete C.availabilities[R],ve=void 0):(ve="oui",C.availabilities[R]=ve),ve===void 0?$e.value[C.name]&&delete $e.value[C.name][R]:($e.value[C.name]||($e.value[C.name]={}),$e.value[C.name][R]=ve==="oui"),gf(C.name,{...C.availabilities},r.value).then(()=>{q.value=!0,j.value="Disponibilité mise à jour avec succès !",setTimeout(()=>{q.value=!1},3e3)}).catch(le=>{console.error("Erreur lors de la mise à jour de la disponibilité:",le),alert("Erreur lors de la mise à jour de la disponibilité. Veuillez réessayer.")})}function nt(V,R){var C;return(C=$e.value[V])==null?void 0:C[R]}function F(V,R){var oe;const C=Ie.value[R]||[],K=(oe=$e.value[V])==null?void 0:oe[R];return C.includes(V)&&K===!0}async function te(V,R=6){const K=Fe.value.filter(le=>nt(le.name,V)).map(le=>{const ke=ne(le.name);return{name:le.name,weight:1/(1+ke)}}),oe=[],ve=[...K];for(;oe.length<R&&ve.length>0;){const le=ve.reduce((qt,dr)=>qt+dr.weight,0);let ke=Math.random()*le;const Ae=ve.findIndex(qt=>(ke-=qt.weight,ke<=0));Ae>=0&&(oe.push(ve[Ae].name),ve.splice(Ae,1))}Ie.value[V]=oe,await oS(V,oe,r.value),w(),k()}function X(V){var C;return V?(typeof V=="string"?new Date(V):((C=V.toDate)==null?void 0:C.call(V))||V).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}):""}function ne(V){return Object.values(Ie.value).filter(R=>R.includes(V)).length}function ye(V){const R=$e.value[V]||{};return Object.values(R).filter(C=>C===!0).length}function Ne(V){const R=ye(V),C=ne(V);return R===0?0:C/R}function _(V){Ke.value[V]={availability:ye(V),selection:ne(V),ratio:Ne(V)}}function w(){Fe.value.forEach(V=>_(V.name))}function k(V=6){const R={};Ce.value.forEach(C=>{const oe=Fe.value.filter(le=>nt(le.name,C.id)===!0).map(le=>{const ke=ne(le.name);return{name:le.name,weight:1/(1+ke)}}),ve=oe.reduce((le,ke)=>le+ke.weight,0);oe.forEach(le=>{const ke=Math.min(1,le.weight/ve*V);R[le.name]||(R[le.name]={}),R[le.name][C.id]=Math.round(ke*100)})}),Wt.value=R}function B(V,R){var le,ke;const C=V.name,K=nt(C,R),oe=F(C,R),ve=((ke=(le=Wt.value)==null?void 0:le[C])==null?void 0:ke[R])??0;return K===!1?"Non disponible – cliquez pour changer":oe?`Sélectionné · Chance estimée : ${ve}%`:K===!0?`Disponible · Chance estimée : ${ve}%`:"Cliquez pour indiquer votre disponibilité"}const L=Se(null),$=Se(!1);async function Z(){$.value=!1;try{await sS(L.value,r.value),Fe.value=Fe.value.filter(V=>V.id!==L.value),L.value=null,q.value=!0,j.value="Joueur supprimé avec succès !",setTimeout(()=>{q.value=!1},3e3)}catch(V){console.error("Erreur lors de la suppression du joueur :",V),alert("Erreur lors de la suppression du joueur. Veuillez réessayer.")}}function Q(){$.value=!1,L.value=null}function W(V){L.value=V,$.value=!0}function z(V,R=6){Ie.value[V]&&Ie.value[V].length>0?(D.value=!0,O.value=V):te(V,R)}function ie(){O.value&&(te(O.value,6),D.value=!1,O.value=null)}function ee(){D.value=!1,O.value=null}return(V,R)=>(Ee(),Re(ft,null,[M("div",uS,[M("div",hS,[M("h1",dS,rn(n.value?n.value:"Chargement..."),1),R[10]||(R[10]=M("p",{class:"text-gray-300"},"Gestion des sélections et disponibilités",-1))]),M("div",fS,[M("div",pS,[M("table",mS,[M("colgroup",null,[R[11]||(R[11]=M("col",{style:{width:"10%"}},null,-1)),R[12]||(R[12]=M("col",{style:{width:"10%"}},null,-1)),(Ee(!0),Re(ft,null,wr(Ce.value,(C,K)=>(Ee(),Re("col",{key:K,style:ni("width: calc(70% / "+Ce.value.length+");")},null,4))),128)),R[13]||(R[13]=M("col",{style:{width:"5%"}},null,-1))]),M("thead",null,[M("tr",gS,[M("th",_S,[M("div",yS,[R[14]||(R[14]=M("span",{class:"font-bold text-lg relative group"},[M("span",{class:"border-b-2 border-dashed border-purple-400"}," Joueur ")],-1)),M("button",{onClick:R[0]||(R[0]=C=>p.value=!0),class:"text-2xl text-purple-400 hover:text-pink-400 hover:scale-110 transition-all duration-200 cursor-pointer",title:"Ajoutez un joueur"}," ✨ ")])]),R[15]||(R[15]=M("th",{class:"p-4 text-center"},[M("span",{class:"text-lg font-bold"},"📊 Stats")],-1)),(Ee(!0),Re(ft,null,wr(Ce.value,C=>(Ee(),Re("th",{key:C.id,class:"p-4 text-center",onMouseenter:K=>E.value=C.id,onMouseleave:R[3]||(R[3]=K=>E.value=null),onDblclick:K=>_e(C)},[M("div",wS,[M("div",ES,[a.value!==C.id?(Ee(),Re("div",TS,[M("span",{class:"hover:border-b-2 hover:border-dashed hover:border-purple-400 cursor-help transition-colors duration-200 text-white",title:"Double-clic pour modifier : "+C.title+" - "+X(C.date)},rn(C.title),9,IS)])):(Ee(),Re("div",bS,[jn(M("input",{"onUpdate:modelValue":R[1]||(R[1]=K=>l.value=K),type:"text",class:"w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",onKeydown:[jr(P,["esc"]),jr(I,["enter"])],ref_for:!0,ref:"editTitleInput"},null,544),[[$n,l.value]])])),a.value!==C.id?(Ee(),Re("div",{key:2,class:"text-sm text-gray-300 cursor-help hover:border-b hover:border-dashed hover:border-purple-400 transition-colors duration-200 inline-block",title:"Double-clic pour modifier : "+C.title+" - "+X(C.date)},rn(X(C.date)),9,AS)):(Ee(),Re("div",RS,[jn(M("input",{"onUpdate:modelValue":R[2]||(R[2]=K=>c.value=K),type:"date",class:"w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white",onKeydown:[jr(P,["esc"]),jr(I,["enter"])]},null,544),[[$n,c.value]])])),M("button",{onClick:K=>G(C.id),class:ri(["absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg",{"opacity-100":E.value===C.id}])}," ✕ ",10,SS)])])],40,vS))),128)),M("th",PS,[M("button",{onClick:R[4]||(R[4]=C=>tt.value=!0),class:"text-2xl text-purple-400 hover:text-pink-400 hover:scale-110 transition-all duration-200",title:"Ajouter un nouvel événement"}," ✨ ")])]),M("tr",CS,[R[16]||(R[16]=M("th",{class:"p-4 text-left w-[100px]"},null,-1)),R[17]||(R[17]=M("th",{class:"p-4 text-center text-lg w-[100px]"},null,-1)),(Ee(!0),Re(ft,null,wr(Ce.value,C=>(Ee(),Re("th",{key:C.id,class:"p-4 text-center w-40"},[M("button",{onClick:K=>z(C.id,6),class:"rounded-full text-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-pink-500/25 p-3 w-12 h-12 flex items-center justify-center mx-auto transition-all duration-300 transform hover:scale-110",title:Ie.value[C.id]&&Ie.value[C.id].length>0?"Relancer la sélection":"Lancer la sélection"}," 🎭 ",8,xS)]))),128)),R[18]||(R[18]=M("th",{class:"p-4"},null,-1))])])])]),M("div",kS,[M("table",DS,[M("colgroup",null,[R[19]||(R[19]=M("col",{style:{width:"10%"}},null,-1)),R[20]||(R[20]=M("col",{style:{width:"10%"}},null,-1)),(Ee(!0),Re(ft,null,wr(Ce.value,(C,K)=>(Ee(),Re("col",{key:K,style:ni("width: calc(70% / "+Ce.value.length+");")},null,4))),128)),R[21]||(R[21]=M("col",{style:{width:"5%"}},null,-1))]),M("tbody",null,[(Ee(!0),Re(ft,null,wr(Fe.value,C=>(Ee(),Re("tr",{key:C.id,class:ri(["border-b border-white/10 hover:bg-white/5 transition-all duration-200",{"highlighted-player":C.id===y.value}]),"data-player-id":C.id},[M("td",NS,[h.value!==C.id?(Ee(),Re("div",OS,[M("span",{onDblclick:K=>v(C),class:"hover:border-b-2 hover:border-dashed hover:border-purple-400 edit-cursor transition-colors duration-200",title:"Double-clic pour modifier : "+C.name},rn(C.name),41,MS),M("button",{onClick:K=>W(C.id),class:"hidden group-hover:block text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-200",title:"Supprimer le joueur"},R[22]||(R[22]=[M("svg",{class:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[M("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})],-1)]),8,LS)])):(Ee(),Re("div",FS,[jn(M("input",{"onUpdate:modelValue":R[5]||(R[5]=K=>d.value=K),type:"text",class:"w-full p-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",onKeydown:[jr(b,["esc"]),jr(T,["enter"])],ref_for:!0,ref:"editPlayerInput"},null,544),[[$n,d.value]])]))]),M("td",US,[M("span",{class:"bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-3 py-1 rounded-full border border-purple-500/30",title:`${ne(C.name)} sélection${ne(C.name)>1?"s":""}, ${ye(C.name)} dispo${ye(C.name)>1?"s":""}`},rn(ne(C.name))+"/"+rn(ye(C.name)),9,jS)]),(Ee(!0),Re(ft,null,wr(Ce.value,K=>(Ee(),Re("td",{key:K.id,class:"p-4 text-center cursor-pointer hover:bg-white/10 transition-all duration-200",onClick:oe=>$t(C.name,K.id)},[M("div",$S,[F(C.name,K.id)?(Ee(),Re("span",{key:0,class:"text-2xl hover:scale-110 transition-transform duration-200",title:B(C,K.id)}," 🎭 ",8,qS)):nt(C.name,K.id)?(Ee(),Re("span",{key:1,class:"text-2xl hover:scale-110 transition-transform duration-200",title:B(C,K.id)}," ✅ ",8,HS)):nt(C.name,K.id)===!1?(Ee(),Re("span",{key:2,class:"text-2xl hover:scale-110 transition-transform duration-200",title:B(C,K.id)}," ❌ ",8,zS)):(Ee(),Re("span",{key:3,class:"text-gray-500 hover:text-white transition-colors duration-200",title:B(C,K.id)}," – ",8,KS))])],8,BS))),128)),R[23]||(R[23]=M("td",{class:"p-4"},null,-1))],10,VS))),128))])])])])]),q.value?(Ee(),Re("div",WS,[M("div",GS,[R[24]||(R[24]=M("span",{class:"text-xl"},"✨",-1)),M("span",null,rn(j.value),1)])])):yn("",!0),tt.value?(Ee(),Re("div",QS,[M("div",JS,[R[27]||(R[27]=M("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✨ Nouvel événement",-1)),M("div",YS,[R[25]||(R[25]=M("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Titre",-1)),jn(M("input",{"onUpdate:modelValue":R[6]||(R[6]=C=>ot.value=C),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Titre de l'événement"},null,512),[[$n,ot.value]])]),M("div",XS,[R[26]||(R[26]=M("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Date",-1)),jn(M("input",{"onUpdate:modelValue":R[7]||(R[7]=C=>Be.value=C),type:"date",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"},null,512),[[$n,Be.value]])]),M("div",{class:"flex justify-end space-x-3"},[M("button",{onClick:we,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),M("button",{onClick:Te,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"}," Créer ")])])])):yn("",!0),p.value?(Ee(),Re("div",ZS,[M("div",eP,[R[29]||(R[29]=M("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✨ Nouveau joueur",-1)),M("div",tP,[R[28]||(R[28]=M("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nom",-1)),jn(M("input",{"onUpdate:modelValue":R[8]||(R[8]=C=>g.value=C),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Nom du joueur"},null,512),[[$n,g.value]])]),M("div",nP,[M("button",{onClick:R[9]||(R[9]=C=>p.value=!1),class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),M("button",{onClick:A,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"}," Ajouter ")])])])):yn("",!0),s.value?(Ee(),Re("div",rP,[M("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},[R[30]||(R[30]=el('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">⚠️</span></div><h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2><p class="text-gray-300">Êtes-vous sûr de vouloir supprimer cet événement ?</p></div>',1)),M("div",{class:"flex justify-end space-x-3"},[M("button",{onClick:ge,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),M("button",{onClick:J,class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"}," Supprimer ")])])])):yn("",!0),$.value?(Ee(),Re("div",sP,[M("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},[R[31]||(R[31]=el('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">⚠️</span></div><h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2><p class="text-gray-300">Êtes-vous sûr de vouloir supprimer ce joueur ?</p></div>',1)),M("div",{class:"flex justify-end space-x-3"},[M("button",{onClick:Q,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"},"Annuler"),M("button",{onClick:Z,class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"},"Supprimer")])])])):yn("",!0),D.value?(Ee(),Re("div",iP,[M("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},[R[32]||(R[32]=el('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">🎭</span></div><h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2><p class="text-gray-300">Attention, toute la sélection sera refaite en fonction des disponibilités actuelles.</p></div><p class="mb-6 text-sm text-yellow-400 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/20"> ⚠️ Pensez à prévenir les gens du changement ! </p>',2)),M("div",{class:"flex justify-end space-x-3"},[M("button",{onClick:ee,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"},"Annuler"),M("button",{onClick:ie,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"},"Confirmer")])])])):yn("",!0)],64))}},aP=[{path:"/",component:ZR},{path:"/season/:slug",component:oP,props:!0}],lP=j0({history:m0("/impro-selector/"),routes:aP});Ov(Fv).use(lP).mount("#app");
