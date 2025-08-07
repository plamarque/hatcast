(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();/**
* @vue/shared v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**//*! #__NO_SIDE_EFFECTS__ */function tc(t){const e=Object.create(null);for(const n of t.split(","))e[n]=1;return n=>n in e}const qe={},Gr=[],Jt=()=>{},h_=()=>!1,zo=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&(t.charCodeAt(2)>122||t.charCodeAt(2)<97),nc=t=>t.startsWith("onUpdate:"),ot=Object.assign,rc=(t,e)=>{const n=t.indexOf(e);n>-1&&t.splice(n,1)},d_=Object.prototype.hasOwnProperty,Fe=(t,e)=>d_.call(t,e),he=Array.isArray,Qr=t=>Wo(t)==="[object Map]",df=t=>Wo(t)==="[object Set]",me=t=>typeof t=="function",tt=t=>typeof t=="string",or=t=>typeof t=="symbol",Ge=t=>t!==null&&typeof t=="object",ff=t=>(Ge(t)||me(t))&&me(t.then)&&me(t.catch),pf=Object.prototype.toString,Wo=t=>pf.call(t),f_=t=>Wo(t).slice(8,-1),mf=t=>Wo(t)==="[object Object]",sc=t=>tt(t)&&t!=="NaN"&&t[0]!=="-"&&""+parseInt(t,10)===t,js=tc(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Ko=t=>{const e=Object.create(null);return n=>e[n]||(e[n]=t(n))},p_=/-(\w)/g,Wt=Ko(t=>t.replace(p_,(e,n)=>n?n.toUpperCase():"")),m_=/\B([A-Z])/g,ar=Ko(t=>t.replace(m_,"-$1").toLowerCase()),Go=Ko(t=>t.charAt(0).toUpperCase()+t.slice(1)),$a=Ko(t=>t?`on${Go(t)}`:""),Kn=(t,e)=>!Object.is(t,e),lo=(t,...e)=>{for(let n=0;n<t.length;n++)t[n](...e)},ml=(t,e,n,r=!1)=>{Object.defineProperty(t,e,{configurable:!0,enumerable:!1,writable:r,value:n})},gl=t=>{const e=parseFloat(t);return isNaN(e)?t:e};let rh;const Qo=()=>rh||(rh=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function ti(t){if(he(t)){const e={};for(let n=0;n<t.length;n++){const r=t[n],s=tt(r)?v_(r):ti(r);if(s)for(const i in s)e[i]=s[i]}return e}else if(tt(t)||Ge(t))return t}const g_=/;(?![^(]*\))/g,__=/:([^]+)/,y_=/\/\*[^]*?\*\//g;function v_(t){const e={};return t.replace(y_,"").split(g_).forEach(n=>{if(n){const r=n.split(__);r.length>1&&(e[r[0].trim()]=r[1].trim())}}),e}function ni(t){let e="";if(tt(t))e=t;else if(he(t))for(let n=0;n<t.length;n++){const r=ni(t[n]);r&&(e+=r+" ")}else if(Ge(t))for(const n in t)t[n]&&(e+=n+" ");return e.trim()}const E_="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",w_=tc(E_);function gf(t){return!!t||t===""}const _f=t=>!!(t&&t.__v_isRef===!0),rn=t=>tt(t)?t:t==null?"":he(t)||Ge(t)&&(t.toString===pf||!me(t.toString))?_f(t)?rn(t.value):JSON.stringify(t,yf,2):String(t),yf=(t,e)=>_f(e)?yf(t,e.value):Qr(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((n,[r,s],i)=>(n[qa(r,i)+" =>"]=s,n),{})}:df(e)?{[`Set(${e.size})`]:[...e.values()].map(n=>qa(n))}:or(e)?qa(e):Ge(e)&&!he(e)&&!mf(e)?String(e):e,qa=(t,e="")=>{var n;return or(t)?`Symbol(${(n=t.description)!=null?n:e})`:t};/**
* @vue/reactivity v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Dt;class T_{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=Dt,!e&&Dt&&(this.index=(Dt.scopes||(Dt.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].pause();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].resume();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].resume()}}run(e){if(this._active){const n=Dt;try{return Dt=this,e()}finally{Dt=n}}}on(){++this._on===1&&(this.prevScope=Dt,Dt=this)}off(){this._on>0&&--this._on===0&&(Dt=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let n,r;for(n=0,r=this.effects.length;n<r;n++)this.effects[n].stop();for(this.effects.length=0,n=0,r=this.cleanups.length;n<r;n++)this.cleanups[n]();if(this.cleanups.length=0,this.scopes){for(n=0,r=this.scopes.length;n<r;n++)this.scopes[n].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function I_(){return Dt}let He;const Ha=new WeakSet;class vf{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Dt&&Dt.active&&Dt.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Ha.has(this)&&(Ha.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||wf(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,sh(this),Tf(this);const e=He,n=Yt;He=this,Yt=!0;try{return this.fn()}finally{If(this),He=e,Yt=n,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)ac(e);this.deps=this.depsTail=void 0,sh(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Ha.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){_l(this)&&this.run()}get dirty(){return _l(this)}}let Ef=0,$s,qs;function wf(t,e=!1){if(t.flags|=8,e){t.next=qs,qs=t;return}t.next=$s,$s=t}function ic(){Ef++}function oc(){if(--Ef>0)return;if(qs){let e=qs;for(qs=void 0;e;){const n=e.next;e.next=void 0,e.flags&=-9,e=n}}let t;for(;$s;){let e=$s;for($s=void 0;e;){const n=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(r){t||(t=r)}e=n}}if(t)throw t}function Tf(t){for(let e=t.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function If(t){let e,n=t.depsTail,r=n;for(;r;){const s=r.prevDep;r.version===-1?(r===n&&(n=s),ac(r),A_(r)):e=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=s}t.deps=e,t.depsTail=n}function _l(t){for(let e=t.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(Af(e.dep.computed)||e.dep.version!==e.version))return!0;return!!t._dirty}function Af(t){if(t.flags&4&&!(t.flags&16)||(t.flags&=-17,t.globalVersion===ri)||(t.globalVersion=ri,!t.isSSR&&t.flags&128&&(!t.deps&&!t._dirty||!_l(t))))return;t.flags|=2;const e=t.dep,n=He,r=Yt;He=t,Yt=!0;try{Tf(t);const s=t.fn(t._value);(e.version===0||Kn(s,t._value))&&(t.flags|=128,t._value=s,e.version++)}catch(s){throw e.version++,s}finally{He=n,Yt=r,If(t),t.flags&=-3}}function ac(t,e=!1){const{dep:n,prevSub:r,nextSub:s}=t;if(r&&(r.nextSub=s,t.prevSub=void 0),s&&(s.prevSub=r,t.nextSub=void 0),n.subs===t&&(n.subs=r,!r&&n.computed)){n.computed.flags&=-5;for(let i=n.computed.deps;i;i=i.nextDep)ac(i,!0)}!e&&!--n.sc&&n.map&&n.map.delete(n.key)}function A_(t){const{prevDep:e,nextDep:n}=t;e&&(e.nextDep=n,t.prevDep=void 0),n&&(n.prevDep=e,t.nextDep=void 0)}let Yt=!0;const bf=[];function bn(){bf.push(Yt),Yt=!1}function Rn(){const t=bf.pop();Yt=t===void 0?!0:t}function sh(t){const{cleanup:e}=t;if(t.cleanup=void 0,e){const n=He;He=void 0;try{e()}finally{He=n}}}let ri=0;class b_{constructor(e,n){this.sub=e,this.dep=n,this.version=n.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class lc{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!He||!Yt||He===this.computed)return;let n=this.activeLink;if(n===void 0||n.sub!==He)n=this.activeLink=new b_(He,this),He.deps?(n.prevDep=He.depsTail,He.depsTail.nextDep=n,He.depsTail=n):He.deps=He.depsTail=n,Rf(n);else if(n.version===-1&&(n.version=this.version,n.nextDep)){const r=n.nextDep;r.prevDep=n.prevDep,n.prevDep&&(n.prevDep.nextDep=r),n.prevDep=He.depsTail,n.nextDep=void 0,He.depsTail.nextDep=n,He.depsTail=n,He.deps===n&&(He.deps=r)}return n}trigger(e){this.version++,ri++,this.notify(e)}notify(e){ic();try{for(let n=this.subs;n;n=n.prevSub)n.sub.notify()&&n.sub.dep.notify()}finally{oc()}}}function Rf(t){if(t.dep.sc++,t.sub.flags&4){const e=t.dep.computed;if(e&&!t.dep.subs){e.flags|=20;for(let r=e.deps;r;r=r.nextDep)Rf(r)}const n=t.dep.subs;n!==t&&(t.prevSub=n,n&&(n.nextSub=t)),t.dep.subs=t}}const yl=new WeakMap,vr=Symbol(""),vl=Symbol(""),si=Symbol("");function wt(t,e,n){if(Yt&&He){let r=yl.get(t);r||yl.set(t,r=new Map);let s=r.get(n);s||(r.set(n,s=new lc),s.map=r,s.key=n),s.track()}}function vn(t,e,n,r,s,i){const a=yl.get(t);if(!a){ri++;return}const l=c=>{c&&c.trigger()};if(ic(),e==="clear")a.forEach(l);else{const c=he(t),h=c&&sc(n);if(c&&n==="length"){const d=Number(r);a.forEach((p,g)=>{(g==="length"||g===si||!or(g)&&g>=d)&&l(p)})}else switch((n!==void 0||a.has(void 0))&&l(a.get(n)),h&&l(a.get(si)),e){case"add":c?h&&l(a.get("length")):(l(a.get(vr)),Qr(t)&&l(a.get(vl)));break;case"delete":c||(l(a.get(vr)),Qr(t)&&l(a.get(vl)));break;case"set":Qr(t)&&l(a.get(vr));break}}oc()}function Mr(t){const e=Le(t);return e===t?e:(wt(e,"iterate",si),zt(t)?e:e.map(ht))}function Jo(t){return wt(t=Le(t),"iterate",si),t}const R_={__proto__:null,[Symbol.iterator](){return za(this,Symbol.iterator,ht)},concat(...t){return Mr(this).concat(...t.map(e=>he(e)?Mr(e):e))},entries(){return za(this,"entries",t=>(t[1]=ht(t[1]),t))},every(t,e){return gn(this,"every",t,e,void 0,arguments)},filter(t,e){return gn(this,"filter",t,e,n=>n.map(ht),arguments)},find(t,e){return gn(this,"find",t,e,ht,arguments)},findIndex(t,e){return gn(this,"findIndex",t,e,void 0,arguments)},findLast(t,e){return gn(this,"findLast",t,e,ht,arguments)},findLastIndex(t,e){return gn(this,"findLastIndex",t,e,void 0,arguments)},forEach(t,e){return gn(this,"forEach",t,e,void 0,arguments)},includes(...t){return Wa(this,"includes",t)},indexOf(...t){return Wa(this,"indexOf",t)},join(t){return Mr(this).join(t)},lastIndexOf(...t){return Wa(this,"lastIndexOf",t)},map(t,e){return gn(this,"map",t,e,void 0,arguments)},pop(){return Vs(this,"pop")},push(...t){return Vs(this,"push",t)},reduce(t,...e){return ih(this,"reduce",t,e)},reduceRight(t,...e){return ih(this,"reduceRight",t,e)},shift(){return Vs(this,"shift")},some(t,e){return gn(this,"some",t,e,void 0,arguments)},splice(...t){return Vs(this,"splice",t)},toReversed(){return Mr(this).toReversed()},toSorted(t){return Mr(this).toSorted(t)},toSpliced(...t){return Mr(this).toSpliced(...t)},unshift(...t){return Vs(this,"unshift",t)},values(){return za(this,"values",ht)}};function za(t,e,n){const r=Jo(t),s=r[e]();return r!==t&&!zt(t)&&(s._next=s.next,s.next=()=>{const i=s._next();return i.value&&(i.value=n(i.value)),i}),s}const S_=Array.prototype;function gn(t,e,n,r,s,i){const a=Jo(t),l=a!==t&&!zt(t),c=a[e];if(c!==S_[e]){const p=c.apply(t,i);return l?ht(p):p}let h=n;a!==t&&(l?h=function(p,g){return n.call(this,ht(p),g,t)}:n.length>2&&(h=function(p,g){return n.call(this,p,g,t)}));const d=c.call(a,h,r);return l&&s?s(d):d}function ih(t,e,n,r){const s=Jo(t);let i=n;return s!==t&&(zt(t)?n.length>3&&(i=function(a,l,c){return n.call(this,a,l,c,t)}):i=function(a,l,c){return n.call(this,a,ht(l),c,t)}),s[e](i,...r)}function Wa(t,e,n){const r=Le(t);wt(r,"iterate",si);const s=r[e](...n);return(s===-1||s===!1)&&hc(n[0])?(n[0]=Le(n[0]),r[e](...n)):s}function Vs(t,e,n=[]){bn(),ic();const r=Le(t)[e].apply(t,n);return oc(),Rn(),r}const P_=tc("__proto__,__v_isRef,__isVue"),Sf=new Set(Object.getOwnPropertyNames(Symbol).filter(t=>t!=="arguments"&&t!=="caller").map(t=>Symbol[t]).filter(or));function C_(t){or(t)||(t=String(t));const e=Le(this);return wt(e,"has",t),e.hasOwnProperty(t)}class Pf{constructor(e=!1,n=!1){this._isReadonly=e,this._isShallow=n}get(e,n,r){if(n==="__v_skip")return e.__v_skip;const s=this._isReadonly,i=this._isShallow;if(n==="__v_isReactive")return!s;if(n==="__v_isReadonly")return s;if(n==="__v_isShallow")return i;if(n==="__v_raw")return r===(s?i?U_:Df:i?xf:kf).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(r)?e:void 0;const a=he(e);if(!s){let c;if(a&&(c=R_[n]))return c;if(n==="hasOwnProperty")return C_}const l=Reflect.get(e,n,At(e)?e:r);return(or(n)?Sf.has(n):P_(n))||(s||wt(e,"get",n),i)?l:At(l)?a&&sc(n)?l:l.value:Ge(l)?s?Nf(l):Yo(l):l}}class Cf extends Pf{constructor(e=!1){super(!1,e)}set(e,n,r,s){let i=e[n];if(!this._isShallow){const c=er(i);if(!zt(r)&&!er(r)&&(i=Le(i),r=Le(r)),!he(e)&&At(i)&&!At(r))return c?!1:(i.value=r,!0)}const a=he(e)&&sc(n)?Number(n)<e.length:Fe(e,n),l=Reflect.set(e,n,r,At(e)?e:s);return e===Le(s)&&(a?Kn(r,i)&&vn(e,"set",n,r):vn(e,"add",n,r)),l}deleteProperty(e,n){const r=Fe(e,n);e[n];const s=Reflect.deleteProperty(e,n);return s&&r&&vn(e,"delete",n,void 0),s}has(e,n){const r=Reflect.has(e,n);return(!or(n)||!Sf.has(n))&&wt(e,"has",n),r}ownKeys(e){return wt(e,"iterate",he(e)?"length":vr),Reflect.ownKeys(e)}}class k_ extends Pf{constructor(e=!1){super(!0,e)}set(e,n){return!0}deleteProperty(e,n){return!0}}const x_=new Cf,D_=new k_,V_=new Cf(!0);const El=t=>t,Yi=t=>Reflect.getPrototypeOf(t);function N_(t,e,n){return function(...r){const s=this.__v_raw,i=Le(s),a=Qr(i),l=t==="entries"||t===Symbol.iterator&&a,c=t==="keys"&&a,h=s[t](...r),d=n?El:e?Io:ht;return!e&&wt(i,"iterate",c?vl:vr),{next(){const{value:p,done:g}=h.next();return g?{value:p,done:g}:{value:l?[d(p[0]),d(p[1])]:d(p),done:g}},[Symbol.iterator](){return this}}}}function Xi(t){return function(...e){return t==="delete"?!1:t==="clear"?void 0:this}}function O_(t,e){const n={get(s){const i=this.__v_raw,a=Le(i),l=Le(s);t||(Kn(s,l)&&wt(a,"get",s),wt(a,"get",l));const{has:c}=Yi(a),h=e?El:t?Io:ht;if(c.call(a,s))return h(i.get(s));if(c.call(a,l))return h(i.get(l));i!==a&&i.get(s)},get size(){const s=this.__v_raw;return!t&&wt(Le(s),"iterate",vr),Reflect.get(s,"size",s)},has(s){const i=this.__v_raw,a=Le(i),l=Le(s);return t||(Kn(s,l)&&wt(a,"has",s),wt(a,"has",l)),s===l?i.has(s):i.has(s)||i.has(l)},forEach(s,i){const a=this,l=a.__v_raw,c=Le(l),h=e?El:t?Io:ht;return!t&&wt(c,"iterate",vr),l.forEach((d,p)=>s.call(i,h(d),h(p),a))}};return ot(n,t?{add:Xi("add"),set:Xi("set"),delete:Xi("delete"),clear:Xi("clear")}:{add(s){!e&&!zt(s)&&!er(s)&&(s=Le(s));const i=Le(this);return Yi(i).has.call(i,s)||(i.add(s),vn(i,"add",s,s)),this},set(s,i){!e&&!zt(i)&&!er(i)&&(i=Le(i));const a=Le(this),{has:l,get:c}=Yi(a);let h=l.call(a,s);h||(s=Le(s),h=l.call(a,s));const d=c.call(a,s);return a.set(s,i),h?Kn(i,d)&&vn(a,"set",s,i):vn(a,"add",s,i),this},delete(s){const i=Le(this),{has:a,get:l}=Yi(i);let c=a.call(i,s);c||(s=Le(s),c=a.call(i,s)),l&&l.call(i,s);const h=i.delete(s);return c&&vn(i,"delete",s,void 0),h},clear(){const s=Le(this),i=s.size!==0,a=s.clear();return i&&vn(s,"clear",void 0,void 0),a}}),["keys","values","entries",Symbol.iterator].forEach(s=>{n[s]=N_(s,t,e)}),n}function cc(t,e){const n=O_(t,e);return(r,s,i)=>s==="__v_isReactive"?!t:s==="__v_isReadonly"?t:s==="__v_raw"?r:Reflect.get(Fe(n,s)&&s in r?n:r,s,i)}const M_={get:cc(!1,!1)},L_={get:cc(!1,!0)},F_={get:cc(!0,!1)};const kf=new WeakMap,xf=new WeakMap,Df=new WeakMap,U_=new WeakMap;function B_(t){switch(t){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function j_(t){return t.__v_skip||!Object.isExtensible(t)?0:B_(f_(t))}function Yo(t){return er(t)?t:uc(t,!1,x_,M_,kf)}function Vf(t){return uc(t,!1,V_,L_,xf)}function Nf(t){return uc(t,!0,D_,F_,Df)}function uc(t,e,n,r,s){if(!Ge(t)||t.__v_raw&&!(e&&t.__v_isReactive))return t;const i=j_(t);if(i===0)return t;const a=s.get(t);if(a)return a;const l=new Proxy(t,i===2?r:n);return s.set(t,l),l}function Jr(t){return er(t)?Jr(t.__v_raw):!!(t&&t.__v_isReactive)}function er(t){return!!(t&&t.__v_isReadonly)}function zt(t){return!!(t&&t.__v_isShallow)}function hc(t){return t?!!t.__v_raw:!1}function Le(t){const e=t&&t.__v_raw;return e?Le(e):t}function $_(t){return!Fe(t,"__v_skip")&&Object.isExtensible(t)&&ml(t,"__v_skip",!0),t}const ht=t=>Ge(t)?Yo(t):t,Io=t=>Ge(t)?Nf(t):t;function At(t){return t?t.__v_isRef===!0:!1}function Oe(t){return Of(t,!1)}function q_(t){return Of(t,!0)}function Of(t,e){return At(t)?t:new H_(t,e)}class H_{constructor(e,n){this.dep=new lc,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=n?e:Le(e),this._value=n?e:ht(e),this.__v_isShallow=n}get value(){return this.dep.track(),this._value}set value(e){const n=this._rawValue,r=this.__v_isShallow||zt(e)||er(e);e=r?e:Le(e),Kn(e,n)&&(this._rawValue=e,this._value=r?e:ht(e),this.dep.trigger())}}function Yr(t){return At(t)?t.value:t}const z_={get:(t,e,n)=>e==="__v_raw"?t:Yr(Reflect.get(t,e,n)),set:(t,e,n,r)=>{const s=t[e];return At(s)&&!At(n)?(s.value=n,!0):Reflect.set(t,e,n,r)}};function Mf(t){return Jr(t)?t:new Proxy(t,z_)}class W_{constructor(e,n,r){this.fn=e,this.setter=n,this._value=void 0,this.dep=new lc(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=ri-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!n,this.isSSR=r}notify(){if(this.flags|=16,!(this.flags&8)&&He!==this)return wf(this,!0),!0}get value(){const e=this.dep.track();return Af(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function K_(t,e,n=!1){let r,s;return me(t)?r=t:(r=t.get,s=t.set),new W_(r,s,n)}const Zi={},Ao=new WeakMap;let mr;function G_(t,e=!1,n=mr){if(n){let r=Ao.get(n);r||Ao.set(n,r=[]),r.push(t)}}function Q_(t,e,n=qe){const{immediate:r,deep:s,once:i,scheduler:a,augmentJob:l,call:c}=n,h=J=>s?J:zt(J)||s===!1||s===0?En(J,1):En(J);let d,p,g,y,x=!1,N=!1;if(At(t)?(p=()=>t.value,x=zt(t)):Jr(t)?(p=()=>h(t),x=!0):he(t)?(N=!0,x=t.some(J=>Jr(J)||zt(J)),p=()=>t.map(J=>{if(At(J))return J.value;if(Jr(J))return h(J);if(me(J))return c?c(J,2):J()})):me(t)?e?p=c?()=>c(t,2):t:p=()=>{if(g){bn();try{g()}finally{Rn()}}const J=mr;mr=d;try{return c?c(t,3,[y]):t(y)}finally{mr=J}}:p=Jt,e&&s){const J=p,ge=s===!0?1/0:s;p=()=>En(J(),ge)}const L=I_(),K=()=>{d.stop(),L&&L.active&&rc(L.effects,d)};if(i&&e){const J=e;e=(...ge)=>{J(...ge),K()}}let U=N?new Array(t.length).fill(Zi):Zi;const H=J=>{if(!(!(d.flags&1)||!d.dirty&&!J))if(e){const ge=d.run();if(s||x||(N?ge.some((ye,I)=>Kn(ye,U[I])):Kn(ge,U))){g&&g();const ye=mr;mr=d;try{const I=[ge,U===Zi?void 0:N&&U[0]===Zi?[]:U,y];U=ge,c?c(e,3,I):e(...I)}finally{mr=ye}}}else d.run()};return l&&l(H),d=new vf(p),d.scheduler=a?()=>a(H,!1):H,y=J=>G_(J,!1,d),g=d.onStop=()=>{const J=Ao.get(d);if(J){if(c)c(J,4);else for(const ge of J)ge();Ao.delete(d)}},e?r?H(!0):U=d.run():a?a(H.bind(null,!0),!0):d.run(),K.pause=d.pause.bind(d),K.resume=d.resume.bind(d),K.stop=K,K}function En(t,e=1/0,n){if(e<=0||!Ge(t)||t.__v_skip||(n=n||new Set,n.has(t)))return t;if(n.add(t),e--,At(t))En(t.value,e,n);else if(he(t))for(let r=0;r<t.length;r++)En(t[r],e,n);else if(df(t)||Qr(t))t.forEach(r=>{En(r,e,n)});else if(mf(t)){for(const r in t)En(t[r],e,n);for(const r of Object.getOwnPropertySymbols(t))Object.prototype.propertyIsEnumerable.call(t,r)&&En(t[r],e,n)}return t}/**
* @vue/runtime-core v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function Ei(t,e,n,r){try{return r?t(...r):t()}catch(s){Xo(s,e,n)}}function hn(t,e,n,r){if(me(t)){const s=Ei(t,e,n,r);return s&&ff(s)&&s.catch(i=>{Xo(i,e,n)}),s}if(he(t)){const s=[];for(let i=0;i<t.length;i++)s.push(hn(t[i],e,n,r));return s}}function Xo(t,e,n,r=!0){const s=e?e.vnode:null,{errorHandler:i,throwUnhandledErrorInProduction:a}=e&&e.appContext.config||qe;if(e){let l=e.parent;const c=e.proxy,h=`https://vuejs.org/error-reference/#runtime-${n}`;for(;l;){const d=l.ec;if(d){for(let p=0;p<d.length;p++)if(d[p](t,c,h)===!1)return}l=l.parent}if(i){bn(),Ei(i,null,10,[t,c,h]),Rn();return}}J_(t,n,s,r,a)}function J_(t,e,n,r=!0,s=!1){if(s)throw t;console.error(t)}const kt=[];let nn=-1;const Xr=[];let Un=null,jr=0;const Lf=Promise.resolve();let bo=null;function dc(t){const e=bo||Lf;return t?e.then(this?t.bind(this):t):e}function Y_(t){let e=nn+1,n=kt.length;for(;e<n;){const r=e+n>>>1,s=kt[r],i=ii(s);i<t||i===t&&s.flags&2?e=r+1:n=r}return e}function fc(t){if(!(t.flags&1)){const e=ii(t),n=kt[kt.length-1];!n||!(t.flags&2)&&e>=ii(n)?kt.push(t):kt.splice(Y_(e),0,t),t.flags|=1,Ff()}}function Ff(){bo||(bo=Lf.then(Bf))}function X_(t){he(t)?Xr.push(...t):Un&&t.id===-1?Un.splice(jr+1,0,t):t.flags&1||(Xr.push(t),t.flags|=1),Ff()}function oh(t,e,n=nn+1){for(;n<kt.length;n++){const r=kt[n];if(r&&r.flags&2){if(t&&r.id!==t.uid)continue;kt.splice(n,1),n--,r.flags&4&&(r.flags&=-2),r(),r.flags&4||(r.flags&=-2)}}}function Uf(t){if(Xr.length){const e=[...new Set(Xr)].sort((n,r)=>ii(n)-ii(r));if(Xr.length=0,Un){Un.push(...e);return}for(Un=e,jr=0;jr<Un.length;jr++){const n=Un[jr];n.flags&4&&(n.flags&=-2),n.flags&8||n(),n.flags&=-2}Un=null,jr=0}}const ii=t=>t.id==null?t.flags&2?-1:1/0:t.id;function Bf(t){const e=Jt;try{for(nn=0;nn<kt.length;nn++){const n=kt[nn];n&&!(n.flags&8)&&(n.flags&4&&(n.flags&=-2),Ei(n,n.i,n.i?15:14),n.flags&4||(n.flags&=-2))}}finally{for(;nn<kt.length;nn++){const n=kt[nn];n&&(n.flags&=-2)}nn=-1,kt.length=0,Uf(),bo=null,(kt.length||Xr.length)&&Bf()}}let Ft=null,jf=null;function Ro(t){const e=Ft;return Ft=t,jf=t&&t.type.__scopeId||null,e}function Z_(t,e=Ft,n){if(!e||t._n)return t;const r=(...s)=>{r._d&&mh(-1);const i=Ro(e);let a;try{a=t(...s)}finally{Ro(i),r._d&&mh(1)}return a};return r._n=!0,r._c=!0,r._d=!0,r}function Lr(t,e){if(Ft===null)return t;const n=na(Ft),r=t.dirs||(t.dirs=[]);for(let s=0;s<e.length;s++){let[i,a,l,c=qe]=e[s];i&&(me(i)&&(i={mounted:i,updated:i}),i.deep&&En(a),r.push({dir:i,instance:n,value:a,oldValue:void 0,arg:l,modifiers:c}))}return t}function fr(t,e,n,r){const s=t.dirs,i=e&&e.dirs;for(let a=0;a<s.length;a++){const l=s[a];i&&(l.oldValue=i[a].value);let c=l.dir[r];c&&(bn(),hn(c,n,8,[t.el,l,t,e]),Rn())}}const ey=Symbol("_vte"),ty=t=>t.__isTeleport;function pc(t,e){t.shapeFlag&6&&t.component?(t.transition=e,pc(t.component.subTree,e)):t.shapeFlag&128?(t.ssContent.transition=e.clone(t.ssContent),t.ssFallback.transition=e.clone(t.ssFallback)):t.transition=e}/*! #__NO_SIDE_EFFECTS__ */function $f(t,e){return me(t)?(()=>ot({name:t.name},e,{setup:t}))():t}function qf(t){t.ids=[t.ids[0]+t.ids[2]+++"-",0,0]}function Hs(t,e,n,r,s=!1){if(he(t)){t.forEach((x,N)=>Hs(x,e&&(he(e)?e[N]:e),n,r,s));return}if(zs(r)&&!s){r.shapeFlag&512&&r.type.__asyncResolved&&r.component.subTree.component&&Hs(t,e,n,r.component.subTree);return}const i=r.shapeFlag&4?na(r.component):r.el,a=s?null:i,{i:l,r:c}=t,h=e&&e.r,d=l.refs===qe?l.refs={}:l.refs,p=l.setupState,g=Le(p),y=p===qe?()=>!1:x=>Fe(g,x);if(h!=null&&h!==c&&(tt(h)?(d[h]=null,y(h)&&(p[h]=null)):At(h)&&(h.value=null)),me(c))Ei(c,l,12,[a,d]);else{const x=tt(c),N=At(c);if(x||N){const L=()=>{if(t.f){const K=x?y(c)?p[c]:d[c]:c.value;s?he(K)&&rc(K,i):he(K)?K.includes(i)||K.push(i):x?(d[c]=[i],y(c)&&(p[c]=d[c])):(c.value=[i],t.k&&(d[t.k]=c.value))}else x?(d[c]=a,y(c)&&(p[c]=a)):N&&(c.value=a,t.k&&(d[t.k]=a))};a?(L.id=-1,Lt(L,n)):L()}}}Qo().requestIdleCallback;Qo().cancelIdleCallback;const zs=t=>!!t.type.__asyncLoader,Hf=t=>t.type.__isKeepAlive;function ny(t,e){zf(t,"a",e)}function ry(t,e){zf(t,"da",e)}function zf(t,e,n=It){const r=t.__wdc||(t.__wdc=()=>{let s=n;for(;s;){if(s.isDeactivated)return;s=s.parent}return t()});if(Zo(e,r,n),n){let s=n.parent;for(;s&&s.parent;)Hf(s.parent.vnode)&&sy(r,e,n,s),s=s.parent}}function sy(t,e,n,r){const s=Zo(e,t,r,!0);Wf(()=>{rc(r[e],s)},n)}function Zo(t,e,n=It,r=!1){if(n){const s=n[t]||(n[t]=[]),i=e.__weh||(e.__weh=(...a)=>{bn();const l=wi(n),c=hn(e,n,t,a);return l(),Rn(),c});return r?s.unshift(i):s.push(i),i}}const Dn=t=>(e,n=It)=>{(!ai||t==="sp")&&Zo(t,(...r)=>e(...r),n)},iy=Dn("bm"),mc=Dn("m"),oy=Dn("bu"),ay=Dn("u"),ly=Dn("bum"),Wf=Dn("um"),cy=Dn("sp"),uy=Dn("rtg"),hy=Dn("rtc");function dy(t,e=It){Zo("ec",t,e)}const Kf="components";function fy(t,e){return my(Kf,t,!0,e)||t}const py=Symbol.for("v-ndc");function my(t,e,n=!0,r=!1){const s=Ft||It;if(s){const i=s.type;if(t===Kf){const l=nv(i,!1);if(l&&(l===e||l===Wt(e)||l===Go(Wt(e))))return i}const a=ah(s[t]||i[t],e)||ah(s.appContext[t],e);return!a&&r?i:a}}function ah(t,e){return t&&(t[e]||t[Wt(e)]||t[Go(Wt(e))])}function gr(t,e,n,r){let s;const i=n&&n[r],a=he(t);if(a||tt(t)){const l=a&&Jr(t);let c=!1,h=!1;l&&(c=!zt(t),h=er(t),t=Jo(t)),s=new Array(t.length);for(let d=0,p=t.length;d<p;d++)s[d]=e(c?h?Io(ht(t[d])):ht(t[d]):t[d],d,void 0,i&&i[d])}else if(typeof t=="number"){s=new Array(t);for(let l=0;l<t;l++)s[l]=e(l+1,l,void 0,i&&i[l])}else if(Ge(t))if(t[Symbol.iterator])s=Array.from(t,(l,c)=>e(l,c,void 0,i&&i[c]));else{const l=Object.keys(t);s=new Array(l.length);for(let c=0,h=l.length;c<h;c++){const d=l[c];s[c]=e(t[d],d,c,i&&i[c])}}else s=[];return n&&(n[r]=s),s}const wl=t=>t?fp(t)?na(t):wl(t.parent):null,Ws=ot(Object.create(null),{$:t=>t,$el:t=>t.vnode.el,$data:t=>t.data,$props:t=>t.props,$attrs:t=>t.attrs,$slots:t=>t.slots,$refs:t=>t.refs,$parent:t=>wl(t.parent),$root:t=>wl(t.root),$host:t=>t.ce,$emit:t=>t.emit,$options:t=>gc(t),$forceUpdate:t=>t.f||(t.f=()=>{fc(t.update)}),$nextTick:t=>t.n||(t.n=dc.bind(t.proxy)),$watch:t=>My.bind(t)}),Ka=(t,e)=>t!==qe&&!t.__isScriptSetup&&Fe(t,e),gy={get({_:t},e){if(e==="__v_skip")return!0;const{ctx:n,setupState:r,data:s,props:i,accessCache:a,type:l,appContext:c}=t;let h;if(e[0]!=="$"){const y=a[e];if(y!==void 0)switch(y){case 1:return r[e];case 2:return s[e];case 4:return n[e];case 3:return i[e]}else{if(Ka(r,e))return a[e]=1,r[e];if(s!==qe&&Fe(s,e))return a[e]=2,s[e];if((h=t.propsOptions[0])&&Fe(h,e))return a[e]=3,i[e];if(n!==qe&&Fe(n,e))return a[e]=4,n[e];Tl&&(a[e]=0)}}const d=Ws[e];let p,g;if(d)return e==="$attrs"&&wt(t.attrs,"get",""),d(t);if((p=l.__cssModules)&&(p=p[e]))return p;if(n!==qe&&Fe(n,e))return a[e]=4,n[e];if(g=c.config.globalProperties,Fe(g,e))return g[e]},set({_:t},e,n){const{data:r,setupState:s,ctx:i}=t;return Ka(s,e)?(s[e]=n,!0):r!==qe&&Fe(r,e)?(r[e]=n,!0):Fe(t.props,e)||e[0]==="$"&&e.slice(1)in t?!1:(i[e]=n,!0)},has({_:{data:t,setupState:e,accessCache:n,ctx:r,appContext:s,propsOptions:i}},a){let l;return!!n[a]||t!==qe&&Fe(t,a)||Ka(e,a)||(l=i[0])&&Fe(l,a)||Fe(r,a)||Fe(Ws,a)||Fe(s.config.globalProperties,a)},defineProperty(t,e,n){return n.get!=null?t._.accessCache[e]=0:Fe(n,"value")&&this.set(t,e,n.value,null),Reflect.defineProperty(t,e,n)}};function lh(t){return he(t)?t.reduce((e,n)=>(e[n]=null,e),{}):t}let Tl=!0;function _y(t){const e=gc(t),n=t.proxy,r=t.ctx;Tl=!1,e.beforeCreate&&ch(e.beforeCreate,t,"bc");const{data:s,computed:i,methods:a,watch:l,provide:c,inject:h,created:d,beforeMount:p,mounted:g,beforeUpdate:y,updated:x,activated:N,deactivated:L,beforeDestroy:K,beforeUnmount:U,destroyed:H,unmounted:J,render:ge,renderTracked:ye,renderTriggered:I,errorCaptured:v,serverPrefetch:T,expose:A,inheritAttrs:b,components:P,directives:w,filters:nt}=e;if(h&&yy(h,r,null),a)for(const ve in a){const Ee=a[ve];me(Ee)&&(r[ve]=Ee.bind(n))}if(s){const ve=s.call(n,n);Ge(ve)&&(t.data=Yo(ve))}if(Tl=!0,i)for(const ve in i){const Ee=i[ve],St=me(Ee)?Ee.bind(n,n):me(Ee.get)?Ee.get.bind(n,n):Jt,ke=!me(Ee)&&me(Ee.set)?Ee.set.bind(n):Jt,Ne=Gt({get:St,set:ke});Object.defineProperty(r,ve,{enumerable:!0,configurable:!0,get:()=>Ne.value,set:we=>Ne.value=we})}if(l)for(const ve in l)Gf(l[ve],r,n,ve);if(c){const ve=me(c)?c.call(n):c;Reflect.ownKeys(ve).forEach(Ee=>{co(Ee,ve[Ee])})}d&&ch(d,t,"c");function je(ve,Ee){he(Ee)?Ee.forEach(St=>ve(St.bind(n))):Ee&&ve(Ee.bind(n))}if(je(iy,p),je(mc,g),je(oy,y),je(ay,x),je(ny,N),je(ry,L),je(dy,v),je(hy,ye),je(uy,I),je(ly,U),je(Wf,J),je(cy,T),he(A))if(A.length){const ve=t.exposed||(t.exposed={});A.forEach(Ee=>{Object.defineProperty(ve,Ee,{get:()=>n[Ee],set:St=>n[Ee]=St})})}else t.exposed||(t.exposed={});ge&&t.render===Jt&&(t.render=ge),b!=null&&(t.inheritAttrs=b),P&&(t.components=P),w&&(t.directives=w),T&&qf(t)}function yy(t,e,n=Jt){he(t)&&(t=Il(t));for(const r in t){const s=t[r];let i;Ge(s)?"default"in s?i=on(s.from||r,s.default,!0):i=on(s.from||r):i=on(s),At(i)?Object.defineProperty(e,r,{enumerable:!0,configurable:!0,get:()=>i.value,set:a=>i.value=a}):e[r]=i}}function ch(t,e,n){hn(he(t)?t.map(r=>r.bind(e.proxy)):t.bind(e.proxy),e,n)}function Gf(t,e,n,r){let s=r.includes(".")?ap(n,r):()=>n[r];if(tt(t)){const i=e[t];me(i)&&uo(s,i)}else if(me(t))uo(s,t.bind(n));else if(Ge(t))if(he(t))t.forEach(i=>Gf(i,e,n,r));else{const i=me(t.handler)?t.handler.bind(n):e[t.handler];me(i)&&uo(s,i,t)}}function gc(t){const e=t.type,{mixins:n,extends:r}=e,{mixins:s,optionsCache:i,config:{optionMergeStrategies:a}}=t.appContext,l=i.get(e);let c;return l?c=l:!s.length&&!n&&!r?c=e:(c={},s.length&&s.forEach(h=>So(c,h,a,!0)),So(c,e,a)),Ge(e)&&i.set(e,c),c}function So(t,e,n,r=!1){const{mixins:s,extends:i}=e;i&&So(t,i,n,!0),s&&s.forEach(a=>So(t,a,n,!0));for(const a in e)if(!(r&&a==="expose")){const l=vy[a]||n&&n[a];t[a]=l?l(t[a],e[a]):e[a]}return t}const vy={data:uh,props:hh,emits:hh,methods:Ls,computed:Ls,beforeCreate:Ct,created:Ct,beforeMount:Ct,mounted:Ct,beforeUpdate:Ct,updated:Ct,beforeDestroy:Ct,beforeUnmount:Ct,destroyed:Ct,unmounted:Ct,activated:Ct,deactivated:Ct,errorCaptured:Ct,serverPrefetch:Ct,components:Ls,directives:Ls,watch:wy,provide:uh,inject:Ey};function uh(t,e){return e?t?function(){return ot(me(t)?t.call(this,this):t,me(e)?e.call(this,this):e)}:e:t}function Ey(t,e){return Ls(Il(t),Il(e))}function Il(t){if(he(t)){const e={};for(let n=0;n<t.length;n++)e[t[n]]=t[n];return e}return t}function Ct(t,e){return t?[...new Set([].concat(t,e))]:e}function Ls(t,e){return t?ot(Object.create(null),t,e):e}function hh(t,e){return t?he(t)&&he(e)?[...new Set([...t,...e])]:ot(Object.create(null),lh(t),lh(e??{})):e}function wy(t,e){if(!t)return e;if(!e)return t;const n=ot(Object.create(null),t);for(const r in e)n[r]=Ct(t[r],e[r]);return n}function Qf(){return{app:null,config:{isNativeTag:h_,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let Ty=0;function Iy(t,e){return function(r,s=null){me(r)||(r=ot({},r)),s!=null&&!Ge(s)&&(s=null);const i=Qf(),a=new WeakSet,l=[];let c=!1;const h=i.app={_uid:Ty++,_component:r,_props:s,_container:null,_context:i,_instance:null,version:sv,get config(){return i.config},set config(d){},use(d,...p){return a.has(d)||(d&&me(d.install)?(a.add(d),d.install(h,...p)):me(d)&&(a.add(d),d(h,...p))),h},mixin(d){return i.mixins.includes(d)||i.mixins.push(d),h},component(d,p){return p?(i.components[d]=p,h):i.components[d]},directive(d,p){return p?(i.directives[d]=p,h):i.directives[d]},mount(d,p,g){if(!c){const y=h._ceVNode||Bt(r,s);return y.appContext=i,g===!0?g="svg":g===!1&&(g=void 0),p&&e?e(y,d):t(y,d,g),c=!0,h._container=d,d.__vue_app__=h,na(y.component)}},onUnmount(d){l.push(d)},unmount(){c&&(hn(l,h._instance,16),t(null,h._container),delete h._container.__vue_app__)},provide(d,p){return i.provides[d]=p,h},runWithContext(d){const p=Zr;Zr=h;try{return d()}finally{Zr=p}}};return h}}let Zr=null;function co(t,e){if(It){let n=It.provides;const r=It.parent&&It.parent.provides;r===n&&(n=It.provides=Object.create(r)),n[t]=e}}function on(t,e,n=!1){const r=It||Ft;if(r||Zr){let s=Zr?Zr._context.provides:r?r.parent==null||r.ce?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:void 0;if(s&&t in s)return s[t];if(arguments.length>1)return n&&me(e)?e.call(r&&r.proxy):e}}const Jf={},Yf=()=>Object.create(Jf),Xf=t=>Object.getPrototypeOf(t)===Jf;function Ay(t,e,n,r=!1){const s={},i=Yf();t.propsDefaults=Object.create(null),Zf(t,e,s,i);for(const a in t.propsOptions[0])a in s||(s[a]=void 0);n?t.props=r?s:Vf(s):t.type.props?t.props=s:t.props=i,t.attrs=i}function by(t,e,n,r){const{props:s,attrs:i,vnode:{patchFlag:a}}=t,l=Le(s),[c]=t.propsOptions;let h=!1;if((r||a>0)&&!(a&16)){if(a&8){const d=t.vnode.dynamicProps;for(let p=0;p<d.length;p++){let g=d[p];if(ea(t.emitsOptions,g))continue;const y=e[g];if(c)if(Fe(i,g))y!==i[g]&&(i[g]=y,h=!0);else{const x=Wt(g);s[x]=Al(c,l,x,y,t,!1)}else y!==i[g]&&(i[g]=y,h=!0)}}}else{Zf(t,e,s,i)&&(h=!0);let d;for(const p in l)(!e||!Fe(e,p)&&((d=ar(p))===p||!Fe(e,d)))&&(c?n&&(n[p]!==void 0||n[d]!==void 0)&&(s[p]=Al(c,l,p,void 0,t,!0)):delete s[p]);if(i!==l)for(const p in i)(!e||!Fe(e,p))&&(delete i[p],h=!0)}h&&vn(t.attrs,"set","")}function Zf(t,e,n,r){const[s,i]=t.propsOptions;let a=!1,l;if(e)for(let c in e){if(js(c))continue;const h=e[c];let d;s&&Fe(s,d=Wt(c))?!i||!i.includes(d)?n[d]=h:(l||(l={}))[d]=h:ea(t.emitsOptions,c)||(!(c in r)||h!==r[c])&&(r[c]=h,a=!0)}if(i){const c=Le(n),h=l||qe;for(let d=0;d<i.length;d++){const p=i[d];n[p]=Al(s,c,p,h[p],t,!Fe(h,p))}}return a}function Al(t,e,n,r,s,i){const a=t[n];if(a!=null){const l=Fe(a,"default");if(l&&r===void 0){const c=a.default;if(a.type!==Function&&!a.skipFactory&&me(c)){const{propsDefaults:h}=s;if(n in h)r=h[n];else{const d=wi(s);r=h[n]=c.call(null,e),d()}}else r=c;s.ce&&s.ce._setProp(n,r)}a[0]&&(i&&!l?r=!1:a[1]&&(r===""||r===ar(n))&&(r=!0))}return r}const Ry=new WeakMap;function ep(t,e,n=!1){const r=n?Ry:e.propsCache,s=r.get(t);if(s)return s;const i=t.props,a={},l=[];let c=!1;if(!me(t)){const d=p=>{c=!0;const[g,y]=ep(p,e,!0);ot(a,g),y&&l.push(...y)};!n&&e.mixins.length&&e.mixins.forEach(d),t.extends&&d(t.extends),t.mixins&&t.mixins.forEach(d)}if(!i&&!c)return Ge(t)&&r.set(t,Gr),Gr;if(he(i))for(let d=0;d<i.length;d++){const p=Wt(i[d]);dh(p)&&(a[p]=qe)}else if(i)for(const d in i){const p=Wt(d);if(dh(p)){const g=i[d],y=a[p]=he(g)||me(g)?{type:g}:ot({},g),x=y.type;let N=!1,L=!0;if(he(x))for(let K=0;K<x.length;++K){const U=x[K],H=me(U)&&U.name;if(H==="Boolean"){N=!0;break}else H==="String"&&(L=!1)}else N=me(x)&&x.name==="Boolean";y[0]=N,y[1]=L,(N||Fe(y,"default"))&&l.push(p)}}const h=[a,l];return Ge(t)&&r.set(t,h),h}function dh(t){return t[0]!=="$"&&!js(t)}const _c=t=>t[0]==="_"||t==="$stable",yc=t=>he(t)?t.map(sn):[sn(t)],Sy=(t,e,n)=>{if(e._n)return e;const r=Z_((...s)=>yc(e(...s)),n);return r._c=!1,r},tp=(t,e,n)=>{const r=t._ctx;for(const s in t){if(_c(s))continue;const i=t[s];if(me(i))e[s]=Sy(s,i,r);else if(i!=null){const a=yc(i);e[s]=()=>a}}},np=(t,e)=>{const n=yc(e);t.slots.default=()=>n},rp=(t,e,n)=>{for(const r in e)(n||!_c(r))&&(t[r]=e[r])},Py=(t,e,n)=>{const r=t.slots=Yf();if(t.vnode.shapeFlag&32){const s=e.__;s&&ml(r,"__",s,!0);const i=e._;i?(rp(r,e,n),n&&ml(r,"_",i,!0)):tp(e,r)}else e&&np(t,e)},Cy=(t,e,n)=>{const{vnode:r,slots:s}=t;let i=!0,a=qe;if(r.shapeFlag&32){const l=e._;l?n&&l===1?i=!1:rp(s,e,n):(i=!e.$stable,tp(e,s)),a=e}else e&&(np(t,e),a={default:1});if(i)for(const l in s)!_c(l)&&a[l]==null&&delete s[l]},Lt=qy;function ky(t){return xy(t)}function xy(t,e){const n=Qo();n.__VUE__=!0;const{insert:r,remove:s,patchProp:i,createElement:a,createText:l,createComment:c,setText:h,setElementText:d,parentNode:p,nextSibling:g,setScopeId:y=Jt,insertStaticContent:x}=t,N=(_,E,C,B=null,M=null,j=null,Y=void 0,G=null,z=!!E.dynamicChildren)=>{if(_===E)return;_&&!Ns(_,E)&&(B=O(_),we(_,M,j,!0),_=null),E.patchFlag===-2&&(z=!1,E.dynamicChildren=null);const{type:q,ref:oe,shapeFlag:Z}=E;switch(q){case ta:L(_,E,C,B);break;case tr:K(_,E,C,B);break;case Ja:_==null&&U(E,C,B,Y);break;case ut:P(_,E,C,B,M,j,Y,G,z);break;default:Z&1?ge(_,E,C,B,M,j,Y,G,z):Z&6?w(_,E,C,B,M,j,Y,G,z):(Z&64||Z&128)&&q.process(_,E,C,B,M,j,Y,G,z,re)}oe!=null&&M?Hs(oe,_&&_.ref,j,E||_,!E):oe==null&&_&&_.ref!=null&&Hs(_.ref,null,j,_,!0)},L=(_,E,C,B)=>{if(_==null)r(E.el=l(E.children),C,B);else{const M=E.el=_.el;E.children!==_.children&&h(M,E.children)}},K=(_,E,C,B)=>{_==null?r(E.el=c(E.children||""),C,B):E.el=_.el},U=(_,E,C,B)=>{[_.el,_.anchor]=x(_.children,E,C,B,_.el,_.anchor)},H=({el:_,anchor:E},C,B)=>{let M;for(;_&&_!==E;)M=g(_),r(_,C,B),_=M;r(E,C,B)},J=({el:_,anchor:E})=>{let C;for(;_&&_!==E;)C=g(_),s(_),_=C;s(E)},ge=(_,E,C,B,M,j,Y,G,z)=>{E.type==="svg"?Y="svg":E.type==="math"&&(Y="mathml"),_==null?ye(E,C,B,M,j,Y,G,z):T(_,E,M,j,Y,G,z)},ye=(_,E,C,B,M,j,Y,G)=>{let z,q;const{props:oe,shapeFlag:Z,transition:se,dirs:V}=_;if(z=_.el=a(_.type,j,oe&&oe.is,oe),Z&8?d(z,_.children):Z&16&&v(_.children,z,null,B,M,Ga(_,j),Y,G),V&&fr(_,null,B,"created"),I(z,_,_.scopeId,Y,B),oe){for(const k in oe)k!=="value"&&!js(k)&&i(z,k,null,oe[k],j,B);"value"in oe&&i(z,"value",null,oe.value,j),(q=oe.onVnodeBeforeMount)&&tn(q,B,_)}V&&fr(_,null,B,"beforeMount");const R=Dy(M,se);R&&se.beforeEnter(z),r(z,E,C),((q=oe&&oe.onVnodeMounted)||R||V)&&Lt(()=>{q&&tn(q,B,_),R&&se.enter(z),V&&fr(_,null,B,"mounted")},M)},I=(_,E,C,B,M)=>{if(C&&y(_,C),B)for(let j=0;j<B.length;j++)y(_,B[j]);if(M){let j=M.subTree;if(E===j||cp(j.type)&&(j.ssContent===E||j.ssFallback===E)){const Y=M.vnode;I(_,Y,Y.scopeId,Y.slotScopeIds,M.parent)}}},v=(_,E,C,B,M,j,Y,G,z=0)=>{for(let q=z;q<_.length;q++){const oe=_[q]=G?Bn(_[q]):sn(_[q]);N(null,oe,E,C,B,M,j,Y,G)}},T=(_,E,C,B,M,j,Y)=>{const G=E.el=_.el;let{patchFlag:z,dynamicChildren:q,dirs:oe}=E;z|=_.patchFlag&16;const Z=_.props||qe,se=E.props||qe;let V;if(C&&pr(C,!1),(V=se.onVnodeBeforeUpdate)&&tn(V,C,E,_),oe&&fr(E,_,C,"beforeUpdate"),C&&pr(C,!0),(Z.innerHTML&&se.innerHTML==null||Z.textContent&&se.textContent==null)&&d(G,""),q?A(_.dynamicChildren,q,G,C,B,Ga(E,M),j):Y||Ee(_,E,G,null,C,B,Ga(E,M),j,!1),z>0){if(z&16)b(G,Z,se,C,M);else if(z&2&&Z.class!==se.class&&i(G,"class",null,se.class,M),z&4&&i(G,"style",Z.style,se.style,M),z&8){const R=E.dynamicProps;for(let k=0;k<R.length;k++){const Q=R[k],Te=Z[Q],_e=se[Q];(_e!==Te||Q==="value")&&i(G,Q,Te,_e,M,C)}}z&1&&_.children!==E.children&&d(G,E.children)}else!Y&&q==null&&b(G,Z,se,C,M);((V=se.onVnodeUpdated)||oe)&&Lt(()=>{V&&tn(V,C,E,_),oe&&fr(E,_,C,"updated")},B)},A=(_,E,C,B,M,j,Y)=>{for(let G=0;G<E.length;G++){const z=_[G],q=E[G],oe=z.el&&(z.type===ut||!Ns(z,q)||z.shapeFlag&198)?p(z.el):C;N(z,q,oe,null,B,M,j,Y,!0)}},b=(_,E,C,B,M)=>{if(E!==C){if(E!==qe)for(const j in E)!js(j)&&!(j in C)&&i(_,j,E[j],null,M,B);for(const j in C){if(js(j))continue;const Y=C[j],G=E[j];Y!==G&&j!=="value"&&i(_,j,G,Y,M,B)}"value"in C&&i(_,"value",E.value,C.value,M)}},P=(_,E,C,B,M,j,Y,G,z)=>{const q=E.el=_?_.el:l(""),oe=E.anchor=_?_.anchor:l("");let{patchFlag:Z,dynamicChildren:se,slotScopeIds:V}=E;V&&(G=G?G.concat(V):V),_==null?(r(q,C,B),r(oe,C,B),v(E.children||[],C,oe,M,j,Y,G,z)):Z>0&&Z&64&&se&&_.dynamicChildren?(A(_.dynamicChildren,se,C,M,j,Y,G),(E.key!=null||M&&E===M.subTree)&&sp(_,E,!0)):Ee(_,E,C,oe,M,j,Y,G,z)},w=(_,E,C,B,M,j,Y,G,z)=>{E.slotScopeIds=G,_==null?E.shapeFlag&512?M.ctx.activate(E,C,B,Y,z):nt(E,C,B,M,j,Y,z):at(_,E,z)},nt=(_,E,C,B,M,j,Y)=>{const G=_.component=Yy(_,B,M);if(Hf(_)&&(G.ctx.renderer=re),Xy(G,!1,Y),G.asyncDep){if(M&&M.registerDep(G,je,Y),!_.el){const z=G.subTree=Bt(tr);K(null,z,E,C)}}else je(G,_,E,C,M,j,Y)},at=(_,E,C)=>{const B=E.component=_.component;if(jy(_,E,C))if(B.asyncDep&&!B.asyncResolved){ve(B,E,C);return}else B.next=E,B.update();else E.el=_.el,B.vnode=E},je=(_,E,C,B,M,j,Y)=>{const G=()=>{if(_.isMounted){let{next:Z,bu:se,u:V,parent:R,vnode:k}=_;{const Ie=ip(_);if(Ie){Z&&(Z.el=k.el,ve(_,Z,Y)),Ie.asyncDep.then(()=>{_.isUnmounted||G()});return}}let Q=Z,Te;pr(_,!1),Z?(Z.el=k.el,ve(_,Z,Y)):Z=k,se&&lo(se),(Te=Z.props&&Z.props.onVnodeBeforeUpdate)&&tn(Te,R,Z,k),pr(_,!0);const _e=Qa(_),le=_.subTree;_.subTree=_e,N(le,_e,p(le.el),O(le),_,M,j),Z.el=_e.el,Q===null&&$y(_,_e.el),V&&Lt(V,M),(Te=Z.props&&Z.props.onVnodeUpdated)&&Lt(()=>tn(Te,R,Z,k),M)}else{let Z;const{el:se,props:V}=E,{bm:R,m:k,parent:Q,root:Te,type:_e}=_,le=zs(E);if(pr(_,!1),R&&lo(R),!le&&(Z=V&&V.onVnodeBeforeMount)&&tn(Z,Q,E),pr(_,!0),se&&Se){const Ie=()=>{_.subTree=Qa(_),Se(se,_.subTree,_,M,null)};le&&_e.__asyncHydrate?_e.__asyncHydrate(se,_,Ie):Ie()}else{Te.ce&&Te.ce._def.shadowRoot!==!1&&Te.ce._injectChildStyle(_e);const Ie=_.subTree=Qa(_);N(null,Ie,C,B,_,M,j),E.el=Ie.el}if(k&&Lt(k,M),!le&&(Z=V&&V.onVnodeMounted)){const Ie=E;Lt(()=>tn(Z,Q,Ie),M)}(E.shapeFlag&256||Q&&zs(Q.vnode)&&Q.vnode.shapeFlag&256)&&_.a&&Lt(_.a,M),_.isMounted=!0,E=C=B=null}};_.scope.on();const z=_.effect=new vf(G);_.scope.off();const q=_.update=z.run.bind(z),oe=_.job=z.runIfDirty.bind(z);oe.i=_,oe.id=_.uid,z.scheduler=()=>fc(oe),pr(_,!0),q()},ve=(_,E,C)=>{E.component=_;const B=_.vnode.props;_.vnode=E,_.next=null,by(_,E.props,B,C),Cy(_,E.children,C),bn(),oh(_),Rn()},Ee=(_,E,C,B,M,j,Y,G,z=!1)=>{const q=_&&_.children,oe=_?_.shapeFlag:0,Z=E.children,{patchFlag:se,shapeFlag:V}=E;if(se>0){if(se&128){ke(q,Z,C,B,M,j,Y,G,z);return}else if(se&256){St(q,Z,C,B,M,j,Y,G,z);return}}V&8?(oe&16&&gt(q,M,j),Z!==q&&d(C,Z)):oe&16?V&16?ke(q,Z,C,B,M,j,Y,G,z):gt(q,M,j,!0):(oe&8&&d(C,""),V&16&&v(Z,C,B,M,j,Y,G,z))},St=(_,E,C,B,M,j,Y,G,z)=>{_=_||Gr,E=E||Gr;const q=_.length,oe=E.length,Z=Math.min(q,oe);let se;for(se=0;se<Z;se++){const V=E[se]=z?Bn(E[se]):sn(E[se]);N(_[se],V,C,null,M,j,Y,G,z)}q>oe?gt(_,M,j,!0,!1,Z):v(E,C,B,M,j,Y,G,z,Z)},ke=(_,E,C,B,M,j,Y,G,z)=>{let q=0;const oe=E.length;let Z=_.length-1,se=oe-1;for(;q<=Z&&q<=se;){const V=_[q],R=E[q]=z?Bn(E[q]):sn(E[q]);if(Ns(V,R))N(V,R,C,null,M,j,Y,G,z);else break;q++}for(;q<=Z&&q<=se;){const V=_[Z],R=E[se]=z?Bn(E[se]):sn(E[se]);if(Ns(V,R))N(V,R,C,null,M,j,Y,G,z);else break;Z--,se--}if(q>Z){if(q<=se){const V=se+1,R=V<oe?E[V].el:B;for(;q<=se;)N(null,E[q]=z?Bn(E[q]):sn(E[q]),C,R,M,j,Y,G,z),q++}}else if(q>se)for(;q<=Z;)we(_[q],M,j,!0),q++;else{const V=q,R=q,k=new Map;for(q=R;q<=se;q++){const rt=E[q]=z?Bn(E[q]):sn(E[q]);rt.key!=null&&k.set(rt.key,q)}let Q,Te=0;const _e=se-R+1;let le=!1,Ie=0;const Ke=new Array(_e);for(q=0;q<_e;q++)Ke[q]=0;for(q=V;q<=Z;q++){const rt=_[q];if(Te>=_e){we(rt,M,j,!0);continue}let Ht;if(rt.key!=null)Ht=k.get(rt.key);else for(Q=R;Q<=se;Q++)if(Ke[Q-R]===0&&Ns(rt,E[Q])){Ht=Q;break}Ht===void 0?we(rt,M,j,!0):(Ke[Ht-R]=q+1,Ht>=Ie?Ie=Ht:le=!0,N(rt,E[Ht],C,null,M,j,Y,G,z),Te++)}const fn=le?Vy(Ke):Gr;for(Q=fn.length-1,q=_e-1;q>=0;q--){const rt=R+q,Ht=E[rt],Oi=rt+1<oe?E[rt+1].el:B;Ke[q]===0?N(null,Ht,C,Oi,M,j,Y,G,z):le&&(Q<0||q!==fn[Q]?Ne(Ht,C,Oi,2):Q--)}}},Ne=(_,E,C,B,M=null)=>{const{el:j,type:Y,transition:G,children:z,shapeFlag:q}=_;if(q&6){Ne(_.component.subTree,E,C,B);return}if(q&128){_.suspense.move(E,C,B);return}if(q&64){Y.move(_,E,C,re);return}if(Y===ut){r(j,E,C);for(let Z=0;Z<z.length;Z++)Ne(z[Z],E,C,B);r(_.anchor,E,C);return}if(Y===Ja){H(_,E,C);return}if(B!==2&&q&1&&G)if(B===0)G.beforeEnter(j),r(j,E,C),Lt(()=>G.enter(j),M);else{const{leave:Z,delayLeave:se,afterLeave:V}=G,R=()=>{_.ctx.isUnmounted?s(j):r(j,E,C)},k=()=>{Z(j,()=>{R(),V&&V()})};se?se(j,R,k):k()}else r(j,E,C)},we=(_,E,C,B=!1,M=!1)=>{const{type:j,props:Y,ref:G,children:z,dynamicChildren:q,shapeFlag:oe,patchFlag:Z,dirs:se,cacheIndex:V}=_;if(Z===-2&&(M=!1),G!=null&&(bn(),Hs(G,null,C,_,!0),Rn()),V!=null&&(E.renderCache[V]=void 0),oe&256){E.ctx.deactivate(_);return}const R=oe&1&&se,k=!zs(_);let Q;if(k&&(Q=Y&&Y.onVnodeBeforeUnmount)&&tn(Q,E,_),oe&6)Ot(_.component,C,B);else{if(oe&128){_.suspense.unmount(C,B);return}R&&fr(_,null,E,"beforeUnmount"),oe&64?_.type.remove(_,E,C,re,B):q&&!q.hasOnce&&(j!==ut||Z>0&&Z&64)?gt(q,E,C,!1,!0):(j===ut&&Z&384||!M&&oe&16)&&gt(z,E,C),B&&Ae(_)}(k&&(Q=Y&&Y.onVnodeUnmounted)||R)&&Lt(()=>{Q&&tn(Q,E,_),R&&fr(_,null,E,"unmounted")},C)},Ae=_=>{const{type:E,el:C,anchor:B,transition:M}=_;if(E===ut){en(C,B);return}if(E===Ja){J(_);return}const j=()=>{s(C),M&&!M.persisted&&M.afterLeave&&M.afterLeave()};if(_.shapeFlag&1&&M&&!M.persisted){const{leave:Y,delayLeave:G}=M,z=()=>Y(C,j);G?G(_.el,j,z):z()}else j()},en=(_,E)=>{let C;for(;_!==E;)C=g(_),s(_),_=C;s(E)},Ot=(_,E,C)=>{const{bum:B,scope:M,job:j,subTree:Y,um:G,m:z,a:q,parent:oe,slots:{__:Z}}=_;fh(z),fh(q),B&&lo(B),oe&&he(Z)&&Z.forEach(se=>{oe.renderCache[se]=void 0}),M.stop(),j&&(j.flags|=8,we(Y,_,E,C)),G&&Lt(G,E),Lt(()=>{_.isUnmounted=!0},E),E&&E.pendingBranch&&!E.isUnmounted&&_.asyncDep&&!_.asyncResolved&&_.suspenseId===E.pendingId&&(E.deps--,E.deps===0&&E.resolve())},gt=(_,E,C,B=!1,M=!1,j=0)=>{for(let Y=j;Y<_.length;Y++)we(_[Y],E,C,B,M)},O=_=>{if(_.shapeFlag&6)return O(_.component.subTree);if(_.shapeFlag&128)return _.suspense.next();const E=g(_.anchor||_.el),C=E&&E[ey];return C?g(C):E};let te=!1;const ee=(_,E,C)=>{_==null?E._vnode&&we(E._vnode,null,null,!0):N(E._vnode||null,_,E,null,null,null,C),E._vnode=_,te||(te=!0,oh(),Uf(),te=!1)},re={p:N,um:we,m:Ne,r:Ae,mt:nt,mc:v,pc:Ee,pbc:A,n:O,o:t};let pe,Se;return e&&([pe,Se]=e(re)),{render:ee,hydrate:pe,createApp:Iy(ee,pe)}}function Ga({type:t,props:e},n){return n==="svg"&&t==="foreignObject"||n==="mathml"&&t==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:n}function pr({effect:t,job:e},n){n?(t.flags|=32,e.flags|=4):(t.flags&=-33,e.flags&=-5)}function Dy(t,e){return(!t||t&&!t.pendingBranch)&&e&&!e.persisted}function sp(t,e,n=!1){const r=t.children,s=e.children;if(he(r)&&he(s))for(let i=0;i<r.length;i++){const a=r[i];let l=s[i];l.shapeFlag&1&&!l.dynamicChildren&&((l.patchFlag<=0||l.patchFlag===32)&&(l=s[i]=Bn(s[i]),l.el=a.el),!n&&l.patchFlag!==-2&&sp(a,l)),l.type===ta&&(l.el=a.el),l.type===tr&&!l.el&&(l.el=a.el)}}function Vy(t){const e=t.slice(),n=[0];let r,s,i,a,l;const c=t.length;for(r=0;r<c;r++){const h=t[r];if(h!==0){if(s=n[n.length-1],t[s]<h){e[r]=s,n.push(r);continue}for(i=0,a=n.length-1;i<a;)l=i+a>>1,t[n[l]]<h?i=l+1:a=l;h<t[n[i]]&&(i>0&&(e[r]=n[i-1]),n[i]=r)}}for(i=n.length,a=n[i-1];i-- >0;)n[i]=a,a=e[a];return n}function ip(t){const e=t.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:ip(e)}function fh(t){if(t)for(let e=0;e<t.length;e++)t[e].flags|=8}const Ny=Symbol.for("v-scx"),Oy=()=>on(Ny);function uo(t,e,n){return op(t,e,n)}function op(t,e,n=qe){const{immediate:r,deep:s,flush:i,once:a}=n,l=ot({},n),c=e&&r||!e&&i!=="post";let h;if(ai){if(i==="sync"){const y=Oy();h=y.__watcherHandles||(y.__watcherHandles=[])}else if(!c){const y=()=>{};return y.stop=Jt,y.resume=Jt,y.pause=Jt,y}}const d=It;l.call=(y,x,N)=>hn(y,d,x,N);let p=!1;i==="post"?l.scheduler=y=>{Lt(y,d&&d.suspense)}:i!=="sync"&&(p=!0,l.scheduler=(y,x)=>{x?y():fc(y)}),l.augmentJob=y=>{e&&(y.flags|=4),p&&(y.flags|=2,d&&(y.id=d.uid,y.i=d))};const g=Q_(t,e,l);return ai&&(h?h.push(g):c&&g()),g}function My(t,e,n){const r=this.proxy,s=tt(t)?t.includes(".")?ap(r,t):()=>r[t]:t.bind(r,r);let i;me(e)?i=e:(i=e.handler,n=e);const a=wi(this),l=op(s,i.bind(r),n);return a(),l}function ap(t,e){const n=e.split(".");return()=>{let r=t;for(let s=0;s<n.length&&r;s++)r=r[n[s]];return r}}const Ly=(t,e)=>e==="modelValue"||e==="model-value"?t.modelModifiers:t[`${e}Modifiers`]||t[`${Wt(e)}Modifiers`]||t[`${ar(e)}Modifiers`];function Fy(t,e,...n){if(t.isUnmounted)return;const r=t.vnode.props||qe;let s=n;const i=e.startsWith("update:"),a=i&&Ly(r,e.slice(7));a&&(a.trim&&(s=n.map(d=>tt(d)?d.trim():d)),a.number&&(s=n.map(gl)));let l,c=r[l=$a(e)]||r[l=$a(Wt(e))];!c&&i&&(c=r[l=$a(ar(e))]),c&&hn(c,t,6,s);const h=r[l+"Once"];if(h){if(!t.emitted)t.emitted={};else if(t.emitted[l])return;t.emitted[l]=!0,hn(h,t,6,s)}}function lp(t,e,n=!1){const r=e.emitsCache,s=r.get(t);if(s!==void 0)return s;const i=t.emits;let a={},l=!1;if(!me(t)){const c=h=>{const d=lp(h,e,!0);d&&(l=!0,ot(a,d))};!n&&e.mixins.length&&e.mixins.forEach(c),t.extends&&c(t.extends),t.mixins&&t.mixins.forEach(c)}return!i&&!l?(Ge(t)&&r.set(t,null),null):(he(i)?i.forEach(c=>a[c]=null):ot(a,i),Ge(t)&&r.set(t,a),a)}function ea(t,e){return!t||!zo(e)?!1:(e=e.slice(2).replace(/Once$/,""),Fe(t,e[0].toLowerCase()+e.slice(1))||Fe(t,ar(e))||Fe(t,e))}function Qa(t){const{type:e,vnode:n,proxy:r,withProxy:s,propsOptions:[i],slots:a,attrs:l,emit:c,render:h,renderCache:d,props:p,data:g,setupState:y,ctx:x,inheritAttrs:N}=t,L=Ro(t);let K,U;try{if(n.shapeFlag&4){const J=s||r,ge=J;K=sn(h.call(ge,J,d,p,y,g,x)),U=l}else{const J=e;K=sn(J.length>1?J(p,{attrs:l,slots:a,emit:c}):J(p,null)),U=e.props?l:Uy(l)}}catch(J){Ks.length=0,Xo(J,t,1),K=Bt(tr)}let H=K;if(U&&N!==!1){const J=Object.keys(U),{shapeFlag:ge}=H;J.length&&ge&7&&(i&&J.some(nc)&&(U=By(U,i)),H=ss(H,U,!1,!0))}return n.dirs&&(H=ss(H,null,!1,!0),H.dirs=H.dirs?H.dirs.concat(n.dirs):n.dirs),n.transition&&pc(H,n.transition),K=H,Ro(L),K}const Uy=t=>{let e;for(const n in t)(n==="class"||n==="style"||zo(n))&&((e||(e={}))[n]=t[n]);return e},By=(t,e)=>{const n={};for(const r in t)(!nc(r)||!(r.slice(9)in e))&&(n[r]=t[r]);return n};function jy(t,e,n){const{props:r,children:s,component:i}=t,{props:a,children:l,patchFlag:c}=e,h=i.emitsOptions;if(e.dirs||e.transition)return!0;if(n&&c>=0){if(c&1024)return!0;if(c&16)return r?ph(r,a,h):!!a;if(c&8){const d=e.dynamicProps;for(let p=0;p<d.length;p++){const g=d[p];if(a[g]!==r[g]&&!ea(h,g))return!0}}}else return(s||l)&&(!l||!l.$stable)?!0:r===a?!1:r?a?ph(r,a,h):!0:!!a;return!1}function ph(t,e,n){const r=Object.keys(e);if(r.length!==Object.keys(t).length)return!0;for(let s=0;s<r.length;s++){const i=r[s];if(e[i]!==t[i]&&!ea(n,i))return!0}return!1}function $y({vnode:t,parent:e},n){for(;e;){const r=e.subTree;if(r.suspense&&r.suspense.activeBranch===t&&(r.el=t.el),r===t)(t=e.vnode).el=n,e=e.parent;else break}}const cp=t=>t.__isSuspense;function qy(t,e){e&&e.pendingBranch?he(t)?e.effects.push(...t):e.effects.push(t):X_(t)}const ut=Symbol.for("v-fgt"),ta=Symbol.for("v-txt"),tr=Symbol.for("v-cmt"),Ja=Symbol.for("v-stc"),Ks=[];let Ut=null;function Ce(t=!1){Ks.push(Ut=t?null:[])}function Hy(){Ks.pop(),Ut=Ks[Ks.length-1]||null}let oi=1;function mh(t,e=!1){oi+=t,t<0&&Ut&&e&&(Ut.hasOnce=!0)}function up(t){return t.dynamicChildren=oi>0?Ut||Gr:null,Hy(),oi>0&&Ut&&Ut.push(t),t}function De(t,e,n,r,s,i){return up(W(t,e,n,r,s,i,!0))}function hp(t,e,n,r,s){return up(Bt(t,e,n,r,s,!0))}function Po(t){return t?t.__v_isVNode===!0:!1}function Ns(t,e){return t.type===e.type&&t.key===e.key}const dp=({key:t})=>t??null,ho=({ref:t,ref_key:e,ref_for:n})=>(typeof t=="number"&&(t=""+t),t!=null?tt(t)||At(t)||me(t)?{i:Ft,r:t,k:e,f:!!n}:t:null);function W(t,e=null,n=null,r=0,s=null,i=t===ut?0:1,a=!1,l=!1){const c={__v_isVNode:!0,__v_skip:!0,type:t,props:e,key:e&&dp(e),ref:e&&ho(e),scopeId:jf,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:r,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:Ft};return l?(vc(c,n),i&128&&t.normalize(c)):n&&(c.shapeFlag|=tt(n)?8:16),oi>0&&!a&&Ut&&(c.patchFlag>0||i&6)&&c.patchFlag!==32&&Ut.push(c),c}const Bt=zy;function zy(t,e=null,n=null,r=0,s=null,i=!1){if((!t||t===py)&&(t=tr),Po(t)){const l=ss(t,e,!0);return n&&vc(l,n),oi>0&&!i&&Ut&&(l.shapeFlag&6?Ut[Ut.indexOf(t)]=l:Ut.push(l)),l.patchFlag=-2,l}if(rv(t)&&(t=t.__vccOpts),e){e=Wy(e);let{class:l,style:c}=e;l&&!tt(l)&&(e.class=ni(l)),Ge(c)&&(hc(c)&&!he(c)&&(c=ot({},c)),e.style=ti(c))}const a=tt(t)?1:cp(t)?128:ty(t)?64:Ge(t)?4:me(t)?2:0;return W(t,e,n,r,s,a,i,!0)}function Wy(t){return t?hc(t)||Xf(t)?ot({},t):t:null}function ss(t,e,n=!1,r=!1){const{props:s,ref:i,patchFlag:a,children:l,transition:c}=t,h=e?Gy(s||{},e):s,d={__v_isVNode:!0,__v_skip:!0,type:t.type,props:h,key:h&&dp(h),ref:e&&e.ref?n&&i?he(i)?i.concat(ho(e)):[i,ho(e)]:ho(e):i,scopeId:t.scopeId,slotScopeIds:t.slotScopeIds,children:l,target:t.target,targetStart:t.targetStart,targetAnchor:t.targetAnchor,staticCount:t.staticCount,shapeFlag:t.shapeFlag,patchFlag:e&&t.type!==ut?a===-1?16:a|16:a,dynamicProps:t.dynamicProps,dynamicChildren:t.dynamicChildren,appContext:t.appContext,dirs:t.dirs,transition:c,component:t.component,suspense:t.suspense,ssContent:t.ssContent&&ss(t.ssContent),ssFallback:t.ssFallback&&ss(t.ssFallback),el:t.el,anchor:t.anchor,ctx:t.ctx,ce:t.ce};return c&&r&&pc(d,c.clone(d)),d}function Ky(t=" ",e=0){return Bt(ta,null,t,e)}function Fr(t="",e=!1){return e?(Ce(),hp(tr,null,t)):Bt(tr,null,t)}function sn(t){return t==null||typeof t=="boolean"?Bt(tr):he(t)?Bt(ut,null,t.slice()):Po(t)?Bn(t):Bt(ta,null,String(t))}function Bn(t){return t.el===null&&t.patchFlag!==-1||t.memo?t:ss(t)}function vc(t,e){let n=0;const{shapeFlag:r}=t;if(e==null)e=null;else if(he(e))n=16;else if(typeof e=="object")if(r&65){const s=e.default;s&&(s._c&&(s._d=!1),vc(t,s()),s._c&&(s._d=!0));return}else{n=32;const s=e._;!s&&!Xf(e)?e._ctx=Ft:s===3&&Ft&&(Ft.slots._===1?e._=1:(e._=2,t.patchFlag|=1024))}else me(e)?(e={default:e,_ctx:Ft},n=32):(e=String(e),r&64?(n=16,e=[Ky(e)]):n=8);t.children=e,t.shapeFlag|=n}function Gy(...t){const e={};for(let n=0;n<t.length;n++){const r=t[n];for(const s in r)if(s==="class")e.class!==r.class&&(e.class=ni([e.class,r.class]));else if(s==="style")e.style=ti([e.style,r.style]);else if(zo(s)){const i=e[s],a=r[s];a&&i!==a&&!(he(i)&&i.includes(a))&&(e[s]=i?[].concat(i,a):a)}else s!==""&&(e[s]=r[s])}return e}function tn(t,e,n,r=null){hn(t,e,7,[n,r])}const Qy=Qf();let Jy=0;function Yy(t,e,n){const r=t.type,s=(e?e.appContext:t.appContext)||Qy,i={uid:Jy++,vnode:t,type:r,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new T_(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:ep(r,s),emitsOptions:lp(r,s),emit:null,emitted:null,propsDefaults:qe,inheritAttrs:r.inheritAttrs,ctx:qe,data:qe,props:qe,attrs:qe,slots:qe,refs:qe,setupState:qe,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=e?e.root:i,i.emit=Fy.bind(null,i),t.ce&&t.ce(i),i}let It=null,Co,bl;{const t=Qo(),e=(n,r)=>{let s;return(s=t[n])||(s=t[n]=[]),s.push(r),i=>{s.length>1?s.forEach(a=>a(i)):s[0](i)}};Co=e("__VUE_INSTANCE_SETTERS__",n=>It=n),bl=e("__VUE_SSR_SETTERS__",n=>ai=n)}const wi=t=>{const e=It;return Co(t),t.scope.on(),()=>{t.scope.off(),Co(e)}},gh=()=>{It&&It.scope.off(),Co(null)};function fp(t){return t.vnode.shapeFlag&4}let ai=!1;function Xy(t,e=!1,n=!1){e&&bl(e);const{props:r,children:s}=t.vnode,i=fp(t);Ay(t,r,i,e),Py(t,s,n||e);const a=i?Zy(t,e):void 0;return e&&bl(!1),a}function Zy(t,e){const n=t.type;t.accessCache=Object.create(null),t.proxy=new Proxy(t.ctx,gy);const{setup:r}=n;if(r){bn();const s=t.setupContext=r.length>1?tv(t):null,i=wi(t),a=Ei(r,t,0,[t.props,s]),l=ff(a);if(Rn(),i(),(l||t.sp)&&!zs(t)&&qf(t),l){if(a.then(gh,gh),e)return a.then(c=>{_h(t,c,e)}).catch(c=>{Xo(c,t,0)});t.asyncDep=a}else _h(t,a,e)}else pp(t,e)}function _h(t,e,n){me(e)?t.type.__ssrInlineRender?t.ssrRender=e:t.render=e:Ge(e)&&(t.setupState=Mf(e)),pp(t,n)}let yh;function pp(t,e,n){const r=t.type;if(!t.render){if(!e&&yh&&!r.render){const s=r.template||gc(t).template;if(s){const{isCustomElement:i,compilerOptions:a}=t.appContext.config,{delimiters:l,compilerOptions:c}=r,h=ot(ot({isCustomElement:i,delimiters:l},a),c);r.render=yh(s,h)}}t.render=r.render||Jt}{const s=wi(t);bn();try{_y(t)}finally{Rn(),s()}}}const ev={get(t,e){return wt(t,"get",""),t[e]}};function tv(t){const e=n=>{t.exposed=n||{}};return{attrs:new Proxy(t.attrs,ev),slots:t.slots,emit:t.emit,expose:e}}function na(t){return t.exposed?t.exposeProxy||(t.exposeProxy=new Proxy(Mf($_(t.exposed)),{get(e,n){if(n in e)return e[n];if(n in Ws)return Ws[n](t)},has(e,n){return n in e||n in Ws}})):t.proxy}function nv(t,e=!0){return me(t)?t.displayName||t.name:t.name||e&&t.__name}function rv(t){return me(t)&&"__vccOpts"in t}const Gt=(t,e)=>K_(t,e,ai);function mp(t,e,n){const r=arguments.length;return r===2?Ge(e)&&!he(e)?Po(e)?Bt(t,null,[e]):Bt(t,e):Bt(t,null,e):(r>3?n=Array.prototype.slice.call(arguments,2):r===3&&Po(n)&&(n=[n]),Bt(t,e,n))}const sv="3.5.17";/**
* @vue/runtime-dom v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Rl;const vh=typeof window<"u"&&window.trustedTypes;if(vh)try{Rl=vh.createPolicy("vue",{createHTML:t=>t})}catch{}const gp=Rl?t=>Rl.createHTML(t):t=>t,iv="http://www.w3.org/2000/svg",ov="http://www.w3.org/1998/Math/MathML",yn=typeof document<"u"?document:null,Eh=yn&&yn.createElement("template"),av={insert:(t,e,n)=>{e.insertBefore(t,n||null)},remove:t=>{const e=t.parentNode;e&&e.removeChild(t)},createElement:(t,e,n,r)=>{const s=e==="svg"?yn.createElementNS(iv,t):e==="mathml"?yn.createElementNS(ov,t):n?yn.createElement(t,{is:n}):yn.createElement(t);return t==="select"&&r&&r.multiple!=null&&s.setAttribute("multiple",r.multiple),s},createText:t=>yn.createTextNode(t),createComment:t=>yn.createComment(t),setText:(t,e)=>{t.nodeValue=e},setElementText:(t,e)=>{t.textContent=e},parentNode:t=>t.parentNode,nextSibling:t=>t.nextSibling,querySelector:t=>yn.querySelector(t),setScopeId(t,e){t.setAttribute(e,"")},insertStaticContent(t,e,n,r,s,i){const a=n?n.previousSibling:e.lastChild;if(s&&(s===i||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),n),!(s===i||!(s=s.nextSibling)););else{Eh.innerHTML=gp(r==="svg"?`<svg>${t}</svg>`:r==="mathml"?`<math>${t}</math>`:t);const l=Eh.content;if(r==="svg"||r==="mathml"){const c=l.firstChild;for(;c.firstChild;)l.appendChild(c.firstChild);l.removeChild(c)}e.insertBefore(l,n)}return[a?a.nextSibling:e.firstChild,n?n.previousSibling:e.lastChild]}},lv=Symbol("_vtc");function cv(t,e,n){const r=t[lv];r&&(e=(e?[e,...r]:[...r]).join(" ")),e==null?t.removeAttribute("class"):n?t.setAttribute("class",e):t.className=e}const wh=Symbol("_vod"),uv=Symbol("_vsh"),hv=Symbol(""),dv=/(^|;)\s*display\s*:/;function fv(t,e,n){const r=t.style,s=tt(n);let i=!1;if(n&&!s){if(e)if(tt(e))for(const a of e.split(";")){const l=a.slice(0,a.indexOf(":")).trim();n[l]==null&&fo(r,l,"")}else for(const a in e)n[a]==null&&fo(r,a,"");for(const a in n)a==="display"&&(i=!0),fo(r,a,n[a])}else if(s){if(e!==n){const a=r[hv];a&&(n+=";"+a),r.cssText=n,i=dv.test(n)}}else e&&t.removeAttribute("style");wh in t&&(t[wh]=i?r.display:"",t[uv]&&(r.display="none"))}const Th=/\s*!important$/;function fo(t,e,n){if(he(n))n.forEach(r=>fo(t,e,r));else if(n==null&&(n=""),e.startsWith("--"))t.setProperty(e,n);else{const r=pv(t,e);Th.test(n)?t.setProperty(ar(r),n.replace(Th,""),"important"):t[r]=n}}const Ih=["Webkit","Moz","ms"],Ya={};function pv(t,e){const n=Ya[e];if(n)return n;let r=Wt(e);if(r!=="filter"&&r in t)return Ya[e]=r;r=Go(r);for(let s=0;s<Ih.length;s++){const i=Ih[s]+r;if(i in t)return Ya[e]=i}return e}const Ah="http://www.w3.org/1999/xlink";function bh(t,e,n,r,s,i=w_(e)){r&&e.startsWith("xlink:")?n==null?t.removeAttributeNS(Ah,e.slice(6,e.length)):t.setAttributeNS(Ah,e,n):n==null||i&&!gf(n)?t.removeAttribute(e):t.setAttribute(e,i?"":or(n)?String(n):n)}function Rh(t,e,n,r,s){if(e==="innerHTML"||e==="textContent"){n!=null&&(t[e]=e==="innerHTML"?gp(n):n);return}const i=t.tagName;if(e==="value"&&i!=="PROGRESS"&&!i.includes("-")){const l=i==="OPTION"?t.getAttribute("value")||"":t.value,c=n==null?t.type==="checkbox"?"on":"":String(n);(l!==c||!("_value"in t))&&(t.value=c),n==null&&t.removeAttribute(e),t._value=n;return}let a=!1;if(n===""||n==null){const l=typeof t[e];l==="boolean"?n=gf(n):n==null&&l==="string"?(n="",a=!0):l==="number"&&(n=0,a=!0)}try{t[e]=n}catch{}a&&t.removeAttribute(s||e)}function $r(t,e,n,r){t.addEventListener(e,n,r)}function mv(t,e,n,r){t.removeEventListener(e,n,r)}const Sh=Symbol("_vei");function gv(t,e,n,r,s=null){const i=t[Sh]||(t[Sh]={}),a=i[e];if(r&&a)a.value=r;else{const[l,c]=_v(e);if(r){const h=i[e]=Ev(r,s);$r(t,l,h,c)}else a&&(mv(t,l,a,c),i[e]=void 0)}}const Ph=/(?:Once|Passive|Capture)$/;function _v(t){let e;if(Ph.test(t)){e={};let r;for(;r=t.match(Ph);)t=t.slice(0,t.length-r[0].length),e[r[0].toLowerCase()]=!0}return[t[2]===":"?t.slice(3):ar(t.slice(2)),e]}let Xa=0;const yv=Promise.resolve(),vv=()=>Xa||(yv.then(()=>Xa=0),Xa=Date.now());function Ev(t,e){const n=r=>{if(!r._vts)r._vts=Date.now();else if(r._vts<=n.attached)return;hn(wv(r,n.value),e,5,[r])};return n.value=t,n.attached=vv(),n}function wv(t,e){if(he(e)){const n=t.stopImmediatePropagation;return t.stopImmediatePropagation=()=>{n.call(t),t._stopped=!0},e.map(r=>s=>!s._stopped&&r&&r(s))}else return e}const Ch=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&t.charCodeAt(2)>96&&t.charCodeAt(2)<123,Tv=(t,e,n,r,s,i)=>{const a=s==="svg";e==="class"?cv(t,r,a):e==="style"?fv(t,n,r):zo(e)?nc(e)||gv(t,e,n,r,i):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):Iv(t,e,r,a))?(Rh(t,e,r),!t.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&bh(t,e,r,a,i,e!=="value")):t._isVueCE&&(/[A-Z]/.test(e)||!tt(r))?Rh(t,Wt(e),r,i,e):(e==="true-value"?t._trueValue=r:e==="false-value"&&(t._falseValue=r),bh(t,e,r,a))};function Iv(t,e,n,r){if(r)return!!(e==="innerHTML"||e==="textContent"||e in t&&Ch(e)&&me(n));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="form"||e==="list"&&t.tagName==="INPUT"||e==="type"&&t.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=t.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return Ch(e)&&tt(n)?!1:e in t}const kh=t=>{const e=t.props["onUpdate:modelValue"]||!1;return he(e)?n=>lo(e,n):e};function Av(t){t.target.composing=!0}function xh(t){const e=t.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const Za=Symbol("_assign"),Ur={created(t,{modifiers:{lazy:e,trim:n,number:r}},s){t[Za]=kh(s);const i=r||s.props&&s.props.type==="number";$r(t,e?"change":"input",a=>{if(a.target.composing)return;let l=t.value;n&&(l=l.trim()),i&&(l=gl(l)),t[Za](l)}),n&&$r(t,"change",()=>{t.value=t.value.trim()}),e||($r(t,"compositionstart",Av),$r(t,"compositionend",xh),$r(t,"change",xh))},mounted(t,{value:e}){t.value=e??""},beforeUpdate(t,{value:e,oldValue:n,modifiers:{lazy:r,trim:s,number:i}},a){if(t[Za]=kh(a),t.composing)return;const l=(i||t.type==="number")&&!/^0\d/.test(t.value)?gl(t.value):t.value,c=e??"";l!==c&&(document.activeElement===t&&t.type!=="range"&&(r&&e===n||s&&t.value.trim()===c)||(t.value=c))}},bv={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},Br=(t,e)=>{const n=t._withKeys||(t._withKeys={}),r=e.join(".");return n[r]||(n[r]=s=>{if(!("key"in s))return;const i=ar(s.key);if(e.some(a=>a===i||bv[a]===i))return t(s)})},Rv=ot({patchProp:Tv},av);let Dh;function Sv(){return Dh||(Dh=ky(Rv))}const Pv=(...t)=>{const e=Sv().createApp(...t),{mount:n}=e;return e.mount=r=>{const s=kv(r);if(!s)return;const i=e._component;!me(i)&&!i.render&&!i.template&&(i.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const a=n(s,!1,Cv(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),a},e};function Cv(t){if(t instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&t instanceof MathMLElement)return"mathml"}function kv(t){return tt(t)?document.querySelector(t):t}const xv={__name:"App",setup(t){return(e,n)=>{const r=fy("router-view");return Ce(),hp(r)}}};/*!
  * vue-router v4.5.1
  * (c) 2025 Eduardo San Martin Morote
  * @license MIT
  */const qr=typeof document<"u";function _p(t){return typeof t=="object"||"displayName"in t||"props"in t||"__vccOpts"in t}function Dv(t){return t.__esModule||t[Symbol.toStringTag]==="Module"||t.default&&_p(t.default)}const Me=Object.assign;function el(t,e){const n={};for(const r in e){const s=e[r];n[r]=Xt(s)?s.map(t):t(s)}return n}const Gs=()=>{},Xt=Array.isArray,yp=/#/g,Vv=/&/g,Nv=/\//g,Ov=/=/g,Mv=/\?/g,vp=/\+/g,Lv=/%5B/g,Fv=/%5D/g,Ep=/%5E/g,Uv=/%60/g,wp=/%7B/g,Bv=/%7C/g,Tp=/%7D/g,jv=/%20/g;function Ec(t){return encodeURI(""+t).replace(Bv,"|").replace(Lv,"[").replace(Fv,"]")}function $v(t){return Ec(t).replace(wp,"{").replace(Tp,"}").replace(Ep,"^")}function Sl(t){return Ec(t).replace(vp,"%2B").replace(jv,"+").replace(yp,"%23").replace(Vv,"%26").replace(Uv,"`").replace(wp,"{").replace(Tp,"}").replace(Ep,"^")}function qv(t){return Sl(t).replace(Ov,"%3D")}function Hv(t){return Ec(t).replace(yp,"%23").replace(Mv,"%3F")}function zv(t){return t==null?"":Hv(t).replace(Nv,"%2F")}function li(t){try{return decodeURIComponent(""+t)}catch{}return""+t}const Wv=/\/$/,Kv=t=>t.replace(Wv,"");function tl(t,e,n="/"){let r,s={},i="",a="";const l=e.indexOf("#");let c=e.indexOf("?");return l<c&&l>=0&&(c=-1),c>-1&&(r=e.slice(0,c),i=e.slice(c+1,l>-1?l:e.length),s=t(i)),l>-1&&(r=r||e.slice(0,l),a=e.slice(l,e.length)),r=Yv(r??e,n),{fullPath:r+(i&&"?")+i+a,path:r,query:s,hash:li(a)}}function Gv(t,e){const n=e.query?t(e.query):"";return e.path+(n&&"?")+n+(e.hash||"")}function Vh(t,e){return!e||!t.toLowerCase().startsWith(e.toLowerCase())?t:t.slice(e.length)||"/"}function Qv(t,e,n){const r=e.matched.length-1,s=n.matched.length-1;return r>-1&&r===s&&is(e.matched[r],n.matched[s])&&Ip(e.params,n.params)&&t(e.query)===t(n.query)&&e.hash===n.hash}function is(t,e){return(t.aliasOf||t)===(e.aliasOf||e)}function Ip(t,e){if(Object.keys(t).length!==Object.keys(e).length)return!1;for(const n in t)if(!Jv(t[n],e[n]))return!1;return!0}function Jv(t,e){return Xt(t)?Nh(t,e):Xt(e)?Nh(e,t):t===e}function Nh(t,e){return Xt(e)?t.length===e.length&&t.every((n,r)=>n===e[r]):t.length===1&&t[0]===e}function Yv(t,e){if(t.startsWith("/"))return t;if(!t)return e;const n=e.split("/"),r=t.split("/"),s=r[r.length-1];(s===".."||s===".")&&r.push("");let i=n.length-1,a,l;for(a=0;a<r.length;a++)if(l=r[a],l!==".")if(l==="..")i>1&&i--;else break;return n.slice(0,i).join("/")+"/"+r.slice(a).join("/")}const Ln={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};var ci;(function(t){t.pop="pop",t.push="push"})(ci||(ci={}));var Qs;(function(t){t.back="back",t.forward="forward",t.unknown=""})(Qs||(Qs={}));function Xv(t){if(!t)if(qr){const e=document.querySelector("base");t=e&&e.getAttribute("href")||"/",t=t.replace(/^\w+:\/\/[^\/]+/,"")}else t="/";return t[0]!=="/"&&t[0]!=="#"&&(t="/"+t),Kv(t)}const Zv=/^[^#]+#/;function eE(t,e){return t.replace(Zv,"#")+e}function tE(t,e){const n=document.documentElement.getBoundingClientRect(),r=t.getBoundingClientRect();return{behavior:e.behavior,left:r.left-n.left-(e.left||0),top:r.top-n.top-(e.top||0)}}const ra=()=>({left:window.scrollX,top:window.scrollY});function nE(t){let e;if("el"in t){const n=t.el,r=typeof n=="string"&&n.startsWith("#"),s=typeof n=="string"?r?document.getElementById(n.slice(1)):document.querySelector(n):n;if(!s)return;e=tE(s,t)}else e=t;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.scrollX,e.top!=null?e.top:window.scrollY)}function Oh(t,e){return(history.state?history.state.position-e:-1)+t}const Pl=new Map;function rE(t,e){Pl.set(t,e)}function sE(t){const e=Pl.get(t);return Pl.delete(t),e}let iE=()=>location.protocol+"//"+location.host;function Ap(t,e){const{pathname:n,search:r,hash:s}=e,i=t.indexOf("#");if(i>-1){let l=s.includes(t.slice(i))?t.slice(i).length:1,c=s.slice(l);return c[0]!=="/"&&(c="/"+c),Vh(c,"")}return Vh(n,t)+r+s}function oE(t,e,n,r){let s=[],i=[],a=null;const l=({state:g})=>{const y=Ap(t,location),x=n.value,N=e.value;let L=0;if(g){if(n.value=y,e.value=g,a&&a===x){a=null;return}L=N?g.position-N.position:0}else r(y);s.forEach(K=>{K(n.value,x,{delta:L,type:ci.pop,direction:L?L>0?Qs.forward:Qs.back:Qs.unknown})})};function c(){a=n.value}function h(g){s.push(g);const y=()=>{const x=s.indexOf(g);x>-1&&s.splice(x,1)};return i.push(y),y}function d(){const{history:g}=window;g.state&&g.replaceState(Me({},g.state,{scroll:ra()}),"")}function p(){for(const g of i)g();i=[],window.removeEventListener("popstate",l),window.removeEventListener("beforeunload",d)}return window.addEventListener("popstate",l),window.addEventListener("beforeunload",d,{passive:!0}),{pauseListeners:c,listen:h,destroy:p}}function Mh(t,e,n,r=!1,s=!1){return{back:t,current:e,forward:n,replaced:r,position:window.history.length,scroll:s?ra():null}}function aE(t){const{history:e,location:n}=window,r={value:Ap(t,n)},s={value:e.state};s.value||i(r.value,{back:null,current:r.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function i(c,h,d){const p=t.indexOf("#"),g=p>-1?(n.host&&document.querySelector("base")?t:t.slice(p))+c:iE()+t+c;try{e[d?"replaceState":"pushState"](h,"",g),s.value=h}catch(y){console.error(y),n[d?"replace":"assign"](g)}}function a(c,h){const d=Me({},e.state,Mh(s.value.back,c,s.value.forward,!0),h,{position:s.value.position});i(c,d,!0),r.value=c}function l(c,h){const d=Me({},s.value,e.state,{forward:c,scroll:ra()});i(d.current,d,!0);const p=Me({},Mh(r.value,c,null),{position:d.position+1},h);i(c,p,!1),r.value=c}return{location:r,state:s,push:l,replace:a}}function lE(t){t=Xv(t);const e=aE(t),n=oE(t,e.state,e.location,e.replace);function r(i,a=!0){a||n.pauseListeners(),history.go(i)}const s=Me({location:"",base:t,go:r,createHref:eE.bind(null,t)},e,n);return Object.defineProperty(s,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(s,"state",{enumerable:!0,get:()=>e.state.value}),s}function cE(t){return typeof t=="string"||t&&typeof t=="object"}function bp(t){return typeof t=="string"||typeof t=="symbol"}const Rp=Symbol("");var Lh;(function(t){t[t.aborted=4]="aborted",t[t.cancelled=8]="cancelled",t[t.duplicated=16]="duplicated"})(Lh||(Lh={}));function os(t,e){return Me(new Error,{type:t,[Rp]:!0},e)}function _n(t,e){return t instanceof Error&&Rp in t&&(e==null||!!(t.type&e))}const Fh="[^/]+?",uE={sensitive:!1,strict:!1,start:!0,end:!0},hE=/[.+*?^${}()[\]/\\]/g;function dE(t,e){const n=Me({},uE,e),r=[];let s=n.start?"^":"";const i=[];for(const h of t){const d=h.length?[]:[90];n.strict&&!h.length&&(s+="/");for(let p=0;p<h.length;p++){const g=h[p];let y=40+(n.sensitive?.25:0);if(g.type===0)p||(s+="/"),s+=g.value.replace(hE,"\\$&"),y+=40;else if(g.type===1){const{value:x,repeatable:N,optional:L,regexp:K}=g;i.push({name:x,repeatable:N,optional:L});const U=K||Fh;if(U!==Fh){y+=10;try{new RegExp(`(${U})`)}catch(J){throw new Error(`Invalid custom RegExp for param "${x}" (${U}): `+J.message)}}let H=N?`((?:${U})(?:/(?:${U}))*)`:`(${U})`;p||(H=L&&h.length<2?`(?:/${H})`:"/"+H),L&&(H+="?"),s+=H,y+=20,L&&(y+=-8),N&&(y+=-20),U===".*"&&(y+=-50)}d.push(y)}r.push(d)}if(n.strict&&n.end){const h=r.length-1;r[h][r[h].length-1]+=.7000000000000001}n.strict||(s+="/?"),n.end?s+="$":n.strict&&!s.endsWith("/")&&(s+="(?:/|$)");const a=new RegExp(s,n.sensitive?"":"i");function l(h){const d=h.match(a),p={};if(!d)return null;for(let g=1;g<d.length;g++){const y=d[g]||"",x=i[g-1];p[x.name]=y&&x.repeatable?y.split("/"):y}return p}function c(h){let d="",p=!1;for(const g of t){(!p||!d.endsWith("/"))&&(d+="/"),p=!1;for(const y of g)if(y.type===0)d+=y.value;else if(y.type===1){const{value:x,repeatable:N,optional:L}=y,K=x in h?h[x]:"";if(Xt(K)&&!N)throw new Error(`Provided param "${x}" is an array but it is not repeatable (* or + modifiers)`);const U=Xt(K)?K.join("/"):K;if(!U)if(L)g.length<2&&(d.endsWith("/")?d=d.slice(0,-1):p=!0);else throw new Error(`Missing required param "${x}"`);d+=U}}return d||"/"}return{re:a,score:r,keys:i,parse:l,stringify:c}}function fE(t,e){let n=0;for(;n<t.length&&n<e.length;){const r=e[n]-t[n];if(r)return r;n++}return t.length<e.length?t.length===1&&t[0]===40+40?-1:1:t.length>e.length?e.length===1&&e[0]===40+40?1:-1:0}function Sp(t,e){let n=0;const r=t.score,s=e.score;for(;n<r.length&&n<s.length;){const i=fE(r[n],s[n]);if(i)return i;n++}if(Math.abs(s.length-r.length)===1){if(Uh(r))return 1;if(Uh(s))return-1}return s.length-r.length}function Uh(t){const e=t[t.length-1];return t.length>0&&e[e.length-1]<0}const pE={type:0,value:""},mE=/[a-zA-Z0-9_]/;function gE(t){if(!t)return[[]];if(t==="/")return[[pE]];if(!t.startsWith("/"))throw new Error(`Invalid path "${t}"`);function e(y){throw new Error(`ERR (${n})/"${h}": ${y}`)}let n=0,r=n;const s=[];let i;function a(){i&&s.push(i),i=[]}let l=0,c,h="",d="";function p(){h&&(n===0?i.push({type:0,value:h}):n===1||n===2||n===3?(i.length>1&&(c==="*"||c==="+")&&e(`A repeatable param (${h}) must be alone in its segment. eg: '/:ids+.`),i.push({type:1,value:h,regexp:d,repeatable:c==="*"||c==="+",optional:c==="*"||c==="?"})):e("Invalid state to consume buffer"),h="")}function g(){h+=c}for(;l<t.length;){if(c=t[l++],c==="\\"&&n!==2){r=n,n=4;continue}switch(n){case 0:c==="/"?(h&&p(),a()):c===":"?(p(),n=1):g();break;case 4:g(),n=r;break;case 1:c==="("?n=2:mE.test(c)?g():(p(),n=0,c!=="*"&&c!=="?"&&c!=="+"&&l--);break;case 2:c===")"?d[d.length-1]=="\\"?d=d.slice(0,-1)+c:n=3:d+=c;break;case 3:p(),n=0,c!=="*"&&c!=="?"&&c!=="+"&&l--,d="";break;default:e("Unknown state");break}}return n===2&&e(`Unfinished custom RegExp for param "${h}"`),p(),a(),s}function _E(t,e,n){const r=dE(gE(t.path),n),s=Me(r,{record:t,parent:e,children:[],alias:[]});return e&&!s.record.aliasOf==!e.record.aliasOf&&e.children.push(s),s}function yE(t,e){const n=[],r=new Map;e=qh({strict:!1,end:!0,sensitive:!1},e);function s(p){return r.get(p)}function i(p,g,y){const x=!y,N=jh(p);N.aliasOf=y&&y.record;const L=qh(e,p),K=[N];if("alias"in p){const J=typeof p.alias=="string"?[p.alias]:p.alias;for(const ge of J)K.push(jh(Me({},N,{components:y?y.record.components:N.components,path:ge,aliasOf:y?y.record:N})))}let U,H;for(const J of K){const{path:ge}=J;if(g&&ge[0]!=="/"){const ye=g.record.path,I=ye[ye.length-1]==="/"?"":"/";J.path=g.record.path+(ge&&I+ge)}if(U=_E(J,g,L),y?y.alias.push(U):(H=H||U,H!==U&&H.alias.push(U),x&&p.name&&!$h(U)&&a(p.name)),Pp(U)&&c(U),N.children){const ye=N.children;for(let I=0;I<ye.length;I++)i(ye[I],U,y&&y.children[I])}y=y||U}return H?()=>{a(H)}:Gs}function a(p){if(bp(p)){const g=r.get(p);g&&(r.delete(p),n.splice(n.indexOf(g),1),g.children.forEach(a),g.alias.forEach(a))}else{const g=n.indexOf(p);g>-1&&(n.splice(g,1),p.record.name&&r.delete(p.record.name),p.children.forEach(a),p.alias.forEach(a))}}function l(){return n}function c(p){const g=wE(p,n);n.splice(g,0,p),p.record.name&&!$h(p)&&r.set(p.record.name,p)}function h(p,g){let y,x={},N,L;if("name"in p&&p.name){if(y=r.get(p.name),!y)throw os(1,{location:p});L=y.record.name,x=Me(Bh(g.params,y.keys.filter(H=>!H.optional).concat(y.parent?y.parent.keys.filter(H=>H.optional):[]).map(H=>H.name)),p.params&&Bh(p.params,y.keys.map(H=>H.name))),N=y.stringify(x)}else if(p.path!=null)N=p.path,y=n.find(H=>H.re.test(N)),y&&(x=y.parse(N),L=y.record.name);else{if(y=g.name?r.get(g.name):n.find(H=>H.re.test(g.path)),!y)throw os(1,{location:p,currentLocation:g});L=y.record.name,x=Me({},g.params,p.params),N=y.stringify(x)}const K=[];let U=y;for(;U;)K.unshift(U.record),U=U.parent;return{name:L,path:N,params:x,matched:K,meta:EE(K)}}t.forEach(p=>i(p));function d(){n.length=0,r.clear()}return{addRoute:i,resolve:h,removeRoute:a,clearRoutes:d,getRoutes:l,getRecordMatcher:s}}function Bh(t,e){const n={};for(const r of e)r in t&&(n[r]=t[r]);return n}function jh(t){const e={path:t.path,redirect:t.redirect,name:t.name,meta:t.meta||{},aliasOf:t.aliasOf,beforeEnter:t.beforeEnter,props:vE(t),children:t.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in t?t.components||null:t.component&&{default:t.component}};return Object.defineProperty(e,"mods",{value:{}}),e}function vE(t){const e={},n=t.props||!1;if("component"in t)e.default=n;else for(const r in t.components)e[r]=typeof n=="object"?n[r]:n;return e}function $h(t){for(;t;){if(t.record.aliasOf)return!0;t=t.parent}return!1}function EE(t){return t.reduce((e,n)=>Me(e,n.meta),{})}function qh(t,e){const n={};for(const r in t)n[r]=r in e?e[r]:t[r];return n}function wE(t,e){let n=0,r=e.length;for(;n!==r;){const i=n+r>>1;Sp(t,e[i])<0?r=i:n=i+1}const s=TE(t);return s&&(r=e.lastIndexOf(s,r-1)),r}function TE(t){let e=t;for(;e=e.parent;)if(Pp(e)&&Sp(t,e)===0)return e}function Pp({record:t}){return!!(t.name||t.components&&Object.keys(t.components).length||t.redirect)}function IE(t){const e={};if(t===""||t==="?")return e;const r=(t[0]==="?"?t.slice(1):t).split("&");for(let s=0;s<r.length;++s){const i=r[s].replace(vp," "),a=i.indexOf("="),l=li(a<0?i:i.slice(0,a)),c=a<0?null:li(i.slice(a+1));if(l in e){let h=e[l];Xt(h)||(h=e[l]=[h]),h.push(c)}else e[l]=c}return e}function Hh(t){let e="";for(let n in t){const r=t[n];if(n=qv(n),r==null){r!==void 0&&(e+=(e.length?"&":"")+n);continue}(Xt(r)?r.map(i=>i&&Sl(i)):[r&&Sl(r)]).forEach(i=>{i!==void 0&&(e+=(e.length?"&":"")+n,i!=null&&(e+="="+i))})}return e}function AE(t){const e={};for(const n in t){const r=t[n];r!==void 0&&(e[n]=Xt(r)?r.map(s=>s==null?null:""+s):r==null?r:""+r)}return e}const bE=Symbol(""),zh=Symbol(""),sa=Symbol(""),Cp=Symbol(""),Cl=Symbol("");function Os(){let t=[];function e(r){return t.push(r),()=>{const s=t.indexOf(r);s>-1&&t.splice(s,1)}}function n(){t=[]}return{add:e,list:()=>t.slice(),reset:n}}function jn(t,e,n,r,s,i=a=>a()){const a=r&&(r.enterCallbacks[s]=r.enterCallbacks[s]||[]);return()=>new Promise((l,c)=>{const h=g=>{g===!1?c(os(4,{from:n,to:e})):g instanceof Error?c(g):cE(g)?c(os(2,{from:e,to:g})):(a&&r.enterCallbacks[s]===a&&typeof g=="function"&&a.push(g),l())},d=i(()=>t.call(r&&r.instances[s],e,n,h));let p=Promise.resolve(d);t.length<3&&(p=p.then(h)),p.catch(g=>c(g))})}function nl(t,e,n,r,s=i=>i()){const i=[];for(const a of t)for(const l in a.components){let c=a.components[l];if(!(e!=="beforeRouteEnter"&&!a.instances[l]))if(_p(c)){const d=(c.__vccOpts||c)[e];d&&i.push(jn(d,n,r,a,l,s))}else{let h=c();i.push(()=>h.then(d=>{if(!d)throw new Error(`Couldn't resolve component "${l}" at "${a.path}"`);const p=Dv(d)?d.default:d;a.mods[l]=d,a.components[l]=p;const y=(p.__vccOpts||p)[e];return y&&jn(y,n,r,a,l,s)()}))}}return i}function Wh(t){const e=on(sa),n=on(Cp),r=Gt(()=>{const c=Yr(t.to);return e.resolve(c)}),s=Gt(()=>{const{matched:c}=r.value,{length:h}=c,d=c[h-1],p=n.matched;if(!d||!p.length)return-1;const g=p.findIndex(is.bind(null,d));if(g>-1)return g;const y=Kh(c[h-2]);return h>1&&Kh(d)===y&&p[p.length-1].path!==y?p.findIndex(is.bind(null,c[h-2])):g}),i=Gt(()=>s.value>-1&&kE(n.params,r.value.params)),a=Gt(()=>s.value>-1&&s.value===n.matched.length-1&&Ip(n.params,r.value.params));function l(c={}){if(CE(c)){const h=e[Yr(t.replace)?"replace":"push"](Yr(t.to)).catch(Gs);return t.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>h),h}return Promise.resolve()}return{route:r,href:Gt(()=>r.value.href),isActive:i,isExactActive:a,navigate:l}}function RE(t){return t.length===1?t[0]:t}const SE=$f({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:Wh,setup(t,{slots:e}){const n=Yo(Wh(t)),{options:r}=on(sa),s=Gt(()=>({[Gh(t.activeClass,r.linkActiveClass,"router-link-active")]:n.isActive,[Gh(t.exactActiveClass,r.linkExactActiveClass,"router-link-exact-active")]:n.isExactActive}));return()=>{const i=e.default&&RE(e.default(n));return t.custom?i:mp("a",{"aria-current":n.isExactActive?t.ariaCurrentValue:null,href:n.href,onClick:n.navigate,class:s.value},i)}}}),PE=SE;function CE(t){if(!(t.metaKey||t.altKey||t.ctrlKey||t.shiftKey)&&!t.defaultPrevented&&!(t.button!==void 0&&t.button!==0)){if(t.currentTarget&&t.currentTarget.getAttribute){const e=t.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return t.preventDefault&&t.preventDefault(),!0}}function kE(t,e){for(const n in e){const r=e[n],s=t[n];if(typeof r=="string"){if(r!==s)return!1}else if(!Xt(s)||s.length!==r.length||r.some((i,a)=>i!==s[a]))return!1}return!0}function Kh(t){return t?t.aliasOf?t.aliasOf.path:t.path:""}const Gh=(t,e,n)=>t??e??n,xE=$f({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(t,{attrs:e,slots:n}){const r=on(Cl),s=Gt(()=>t.route||r.value),i=on(zh,0),a=Gt(()=>{let h=Yr(i);const{matched:d}=s.value;let p;for(;(p=d[h])&&!p.components;)h++;return h}),l=Gt(()=>s.value.matched[a.value]);co(zh,Gt(()=>a.value+1)),co(bE,l),co(Cl,s);const c=Oe();return uo(()=>[c.value,l.value,t.name],([h,d,p],[g,y,x])=>{d&&(d.instances[p]=h,y&&y!==d&&h&&h===g&&(d.leaveGuards.size||(d.leaveGuards=y.leaveGuards),d.updateGuards.size||(d.updateGuards=y.updateGuards))),h&&d&&(!y||!is(d,y)||!g)&&(d.enterCallbacks[p]||[]).forEach(N=>N(h))},{flush:"post"}),()=>{const h=s.value,d=t.name,p=l.value,g=p&&p.components[d];if(!g)return Qh(n.default,{Component:g,route:h});const y=p.props[d],x=y?y===!0?h.params:typeof y=="function"?y(h):y:null,L=mp(g,Me({},x,e,{onVnodeUnmounted:K=>{K.component.isUnmounted&&(p.instances[d]=null)},ref:c}));return Qh(n.default,{Component:L,route:h})||L}}});function Qh(t,e){if(!t)return null;const n=t(e);return n.length===1?n[0]:n}const DE=xE;function VE(t){const e=yE(t.routes,t),n=t.parseQuery||IE,r=t.stringifyQuery||Hh,s=t.history,i=Os(),a=Os(),l=Os(),c=q_(Ln);let h=Ln;qr&&t.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const d=el.bind(null,O=>""+O),p=el.bind(null,zv),g=el.bind(null,li);function y(O,te){let ee,re;return bp(O)?(ee=e.getRecordMatcher(O),re=te):re=O,e.addRoute(re,ee)}function x(O){const te=e.getRecordMatcher(O);te&&e.removeRoute(te)}function N(){return e.getRoutes().map(O=>O.record)}function L(O){return!!e.getRecordMatcher(O)}function K(O,te){if(te=Me({},te||c.value),typeof O=="string"){const E=tl(n,O,te.path),C=e.resolve({path:E.path},te),B=s.createHref(E.fullPath);return Me(E,C,{params:g(C.params),hash:li(E.hash),redirectedFrom:void 0,href:B})}let ee;if(O.path!=null)ee=Me({},O,{path:tl(n,O.path,te.path).path});else{const E=Me({},O.params);for(const C in E)E[C]==null&&delete E[C];ee=Me({},O,{params:p(E)}),te.params=p(te.params)}const re=e.resolve(ee,te),pe=O.hash||"";re.params=d(g(re.params));const Se=Gv(r,Me({},O,{hash:$v(pe),path:re.path})),_=s.createHref(Se);return Me({fullPath:Se,hash:pe,query:r===Hh?AE(O.query):O.query||{}},re,{redirectedFrom:void 0,href:_})}function U(O){return typeof O=="string"?tl(n,O,c.value.path):Me({},O)}function H(O,te){if(h!==O)return os(8,{from:te,to:O})}function J(O){return I(O)}function ge(O){return J(Me(U(O),{replace:!0}))}function ye(O){const te=O.matched[O.matched.length-1];if(te&&te.redirect){const{redirect:ee}=te;let re=typeof ee=="function"?ee(O):ee;return typeof re=="string"&&(re=re.includes("?")||re.includes("#")?re=U(re):{path:re},re.params={}),Me({query:O.query,hash:O.hash,params:re.path!=null?{}:O.params},re)}}function I(O,te){const ee=h=K(O),re=c.value,pe=O.state,Se=O.force,_=O.replace===!0,E=ye(ee);if(E)return I(Me(U(E),{state:typeof E=="object"?Me({},pe,E.state):pe,force:Se,replace:_}),te||ee);const C=ee;C.redirectedFrom=te;let B;return!Se&&Qv(r,re,ee)&&(B=os(16,{to:C,from:re}),Ne(re,re,!0,!1)),(B?Promise.resolve(B):A(C,re)).catch(M=>_n(M)?_n(M,2)?M:ke(M):Ee(M,C,re)).then(M=>{if(M){if(_n(M,2))return I(Me({replace:_},U(M.to),{state:typeof M.to=="object"?Me({},pe,M.to.state):pe,force:Se}),te||C)}else M=P(C,re,!0,_,pe);return b(C,re,M),M})}function v(O,te){const ee=H(O,te);return ee?Promise.reject(ee):Promise.resolve()}function T(O){const te=en.values().next().value;return te&&typeof te.runWithContext=="function"?te.runWithContext(O):O()}function A(O,te){let ee;const[re,pe,Se]=NE(O,te);ee=nl(re.reverse(),"beforeRouteLeave",O,te);for(const E of re)E.leaveGuards.forEach(C=>{ee.push(jn(C,O,te))});const _=v.bind(null,O,te);return ee.push(_),gt(ee).then(()=>{ee=[];for(const E of i.list())ee.push(jn(E,O,te));return ee.push(_),gt(ee)}).then(()=>{ee=nl(pe,"beforeRouteUpdate",O,te);for(const E of pe)E.updateGuards.forEach(C=>{ee.push(jn(C,O,te))});return ee.push(_),gt(ee)}).then(()=>{ee=[];for(const E of Se)if(E.beforeEnter)if(Xt(E.beforeEnter))for(const C of E.beforeEnter)ee.push(jn(C,O,te));else ee.push(jn(E.beforeEnter,O,te));return ee.push(_),gt(ee)}).then(()=>(O.matched.forEach(E=>E.enterCallbacks={}),ee=nl(Se,"beforeRouteEnter",O,te,T),ee.push(_),gt(ee))).then(()=>{ee=[];for(const E of a.list())ee.push(jn(E,O,te));return ee.push(_),gt(ee)}).catch(E=>_n(E,8)?E:Promise.reject(E))}function b(O,te,ee){l.list().forEach(re=>T(()=>re(O,te,ee)))}function P(O,te,ee,re,pe){const Se=H(O,te);if(Se)return Se;const _=te===Ln,E=qr?history.state:{};ee&&(re||_?s.replace(O.fullPath,Me({scroll:_&&E&&E.scroll},pe)):s.push(O.fullPath,pe)),c.value=O,Ne(O,te,ee,_),ke()}let w;function nt(){w||(w=s.listen((O,te,ee)=>{if(!Ot.listening)return;const re=K(O),pe=ye(re);if(pe){I(Me(pe,{replace:!0,force:!0}),re).catch(Gs);return}h=re;const Se=c.value;qr&&rE(Oh(Se.fullPath,ee.delta),ra()),A(re,Se).catch(_=>_n(_,12)?_:_n(_,2)?(I(Me(U(_.to),{force:!0}),re).then(E=>{_n(E,20)&&!ee.delta&&ee.type===ci.pop&&s.go(-1,!1)}).catch(Gs),Promise.reject()):(ee.delta&&s.go(-ee.delta,!1),Ee(_,re,Se))).then(_=>{_=_||P(re,Se,!1),_&&(ee.delta&&!_n(_,8)?s.go(-ee.delta,!1):ee.type===ci.pop&&_n(_,20)&&s.go(-1,!1)),b(re,Se,_)}).catch(Gs)}))}let at=Os(),je=Os(),ve;function Ee(O,te,ee){ke(O);const re=je.list();return re.length?re.forEach(pe=>pe(O,te,ee)):console.error(O),Promise.reject(O)}function St(){return ve&&c.value!==Ln?Promise.resolve():new Promise((O,te)=>{at.add([O,te])})}function ke(O){return ve||(ve=!O,nt(),at.list().forEach(([te,ee])=>O?ee(O):te()),at.reset()),O}function Ne(O,te,ee,re){const{scrollBehavior:pe}=t;if(!qr||!pe)return Promise.resolve();const Se=!ee&&sE(Oh(O.fullPath,0))||(re||!ee)&&history.state&&history.state.scroll||null;return dc().then(()=>pe(O,te,Se)).then(_=>_&&nE(_)).catch(_=>Ee(_,O,te))}const we=O=>s.go(O);let Ae;const en=new Set,Ot={currentRoute:c,listening:!0,addRoute:y,removeRoute:x,clearRoutes:e.clearRoutes,hasRoute:L,getRoutes:N,resolve:K,options:t,push:J,replace:ge,go:we,back:()=>we(-1),forward:()=>we(1),beforeEach:i.add,beforeResolve:a.add,afterEach:l.add,onError:je.add,isReady:St,install(O){const te=this;O.component("RouterLink",PE),O.component("RouterView",DE),O.config.globalProperties.$router=te,Object.defineProperty(O.config.globalProperties,"$route",{enumerable:!0,get:()=>Yr(c)}),qr&&!Ae&&c.value===Ln&&(Ae=!0,J(s.location).catch(pe=>{}));const ee={};for(const pe in Ln)Object.defineProperty(ee,pe,{get:()=>c.value[pe],enumerable:!0});O.provide(sa,te),O.provide(Cp,Vf(ee)),O.provide(Cl,c);const re=O.unmount;en.add(O),O.unmount=function(){en.delete(O),en.size<1&&(h=Ln,w&&w(),w=null,c.value=Ln,Ae=!1,ve=!1),re()}}};function gt(O){return O.reduce((te,ee)=>te.then(()=>T(ee)),Promise.resolve())}return Ot}function NE(t,e){const n=[],r=[],s=[],i=Math.max(e.matched.length,t.matched.length);for(let a=0;a<i;a++){const l=e.matched[a];l&&(t.matched.find(h=>is(h,l))?r.push(l):n.push(l));const c=t.matched[a];c&&(e.matched.find(h=>is(h,c))||s.push(c))}return[n,r,s]}function OE(){return on(sa)}/**
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
 */const kp=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=s&63|128):(s&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=s&63|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=s&63|128)}return e},ME=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const s=t[n++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=t[n++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=t[n++],a=t[n++],l=t[n++],c=((s&7)<<18|(i&63)<<12|(a&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const i=t[n++],a=t[n++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},xp={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<t.length;s+=3){const i=t[s],a=s+1<t.length,l=a?t[s+1]:0,c=s+2<t.length,h=c?t[s+2]:0,d=i>>2,p=(i&3)<<4|l>>4;let g=(l&15)<<2|h>>6,y=h&63;c||(y=64,a||(g=64)),r.push(n[d],n[p],n[g],n[y])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(kp(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):ME(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<t.length;){const i=n[t.charAt(s++)],l=s<t.length?n[t.charAt(s)]:0;++s;const h=s<t.length?n[t.charAt(s)]:64;++s;const p=s<t.length?n[t.charAt(s)]:64;if(++s,i==null||l==null||h==null||p==null)throw new LE;const g=i<<2|l>>4;if(r.push(g),h!==64){const y=l<<4&240|h>>2;if(r.push(y),p!==64){const x=h<<6&192|p;r.push(x)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class LE extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const FE=function(t){const e=kp(t);return xp.encodeByteArray(e,!0)},ko=function(t){return FE(t).replace(/\./g,"")},Dp=function(t){try{return xp.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function UE(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const BE=()=>UE().__FIREBASE_DEFAULTS__,jE=()=>{if(typeof process>"u"||typeof process.env>"u")return;const t={}.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},$E=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Dp(t[1]);return e&&JSON.parse(e)},ia=()=>{try{return BE()||jE()||$E()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Vp=t=>{var e,n;return(n=(e=ia())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[t]},qE=t=>{const e=Vp(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},Np=()=>{var t;return(t=ia())===null||t===void 0?void 0:t.config},Op=t=>{var e;return(e=ia())===null||e===void 0?void 0:e[`_${t}`]};/**
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
 */class HE{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
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
 */function zE(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",s=t.iat||0,i=t.sub||t.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},t),l="";return[ko(JSON.stringify(n)),ko(JSON.stringify(a)),l].join(".")}/**
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
 */function bt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function WE(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(bt())}function KE(){var t;const e=(t=ia())===null||t===void 0?void 0:t.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function GE(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function QE(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function JE(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function YE(){const t=bt();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function XE(){return!KE()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function ZE(){try{return typeof indexedDB=="object"}catch{return!1}}function ew(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(n){e(n)}})}/**
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
 */const tw="FirebaseError";class Vn extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=tw,Object.setPrototypeOf(this,Vn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ti.prototype.create)}}class Ti{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?nw(i,r):"Error",l=`${this.serviceName}: ${a} (${s}).`;return new Vn(s,l,r)}}function nw(t,e){return t.replace(rw,(n,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const rw=/\{\$([^}]+)}/g;function sw(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function xo(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const s of n){if(!r.includes(s))return!1;const i=t[s],a=e[s];if(Jh(i)&&Jh(a)){if(!xo(i,a))return!1}else if(i!==a)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function Jh(t){return t!==null&&typeof t=="object"}/**
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
 */function Ii(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function iw(t,e){const n=new ow(t,e);return n.subscribe.bind(n)}class ow{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let s;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");aw(e,["next","error","complete"])?s=e:s={next:e,error:n,complete:r},s.next===void 0&&(s.next=rl),s.error===void 0&&(s.error=rl),s.complete===void 0&&(s.complete=rl);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function aw(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function rl(){}/**
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
 */function Rt(t){return t&&t._delegate?t._delegate:t}class wr{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const _r="[DEFAULT]";/**
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
 */class lw{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new HE;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:n});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(uw(e))try{this.getOrInitializeService({instanceIdentifier:_r})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=_r){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=_r){return this.instances.has(e)}getOptions(e=_r){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[i,a]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(i);r===l&&a.resolve(s)}return s}onInit(e,n){var r;const s=this.normalizeInstanceIdentifier(n),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const a=this.instances.get(s);return a&&e(a,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const s of r)try{s(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:cw(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=_r){return this.component?this.component.multipleInstances?e:_r:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function cw(t){return t===_r?void 0:t}function uw(t){return t.instantiationMode==="EAGER"}/**
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
 */class hw{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new lw(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var Re;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(Re||(Re={}));const dw={debug:Re.DEBUG,verbose:Re.VERBOSE,info:Re.INFO,warn:Re.WARN,error:Re.ERROR,silent:Re.SILENT},fw=Re.INFO,pw={[Re.DEBUG]:"log",[Re.VERBOSE]:"log",[Re.INFO]:"info",[Re.WARN]:"warn",[Re.ERROR]:"error"},mw=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),s=pw[e];if(s)console[s](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class wc{constructor(e){this.name=e,this._logLevel=fw,this._logHandler=mw,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Re))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?dw[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Re.DEBUG,...e),this._logHandler(this,Re.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Re.VERBOSE,...e),this._logHandler(this,Re.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Re.INFO,...e),this._logHandler(this,Re.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Re.WARN,...e),this._logHandler(this,Re.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Re.ERROR,...e),this._logHandler(this,Re.ERROR,...e)}}const gw=(t,e)=>e.some(n=>t instanceof n);let Yh,Xh;function _w(){return Yh||(Yh=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function yw(){return Xh||(Xh=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Mp=new WeakMap,kl=new WeakMap,Lp=new WeakMap,sl=new WeakMap,Tc=new WeakMap;function vw(t){const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("success",i),t.removeEventListener("error",a)},i=()=>{n(Gn(t.result)),s()},a=()=>{r(t.error),s()};t.addEventListener("success",i),t.addEventListener("error",a)});return e.then(n=>{n instanceof IDBCursor&&Mp.set(n,t)}).catch(()=>{}),Tc.set(e,t),e}function Ew(t){if(kl.has(t))return;const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",a),t.removeEventListener("abort",a)},i=()=>{n(),s()},a=()=>{r(t.error||new DOMException("AbortError","AbortError")),s()};t.addEventListener("complete",i),t.addEventListener("error",a),t.addEventListener("abort",a)});kl.set(t,e)}let xl={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return kl.get(t);if(e==="objectStoreNames")return t.objectStoreNames||Lp.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Gn(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function ww(t){xl=t(xl)}function Tw(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(il(this),e,...n);return Lp.set(r,e.sort?e.sort():[e]),Gn(r)}:yw().includes(t)?function(...e){return t.apply(il(this),e),Gn(Mp.get(this))}:function(...e){return Gn(t.apply(il(this),e))}}function Iw(t){return typeof t=="function"?Tw(t):(t instanceof IDBTransaction&&Ew(t),gw(t,_w())?new Proxy(t,xl):t)}function Gn(t){if(t instanceof IDBRequest)return vw(t);if(sl.has(t))return sl.get(t);const e=Iw(t);return e!==t&&(sl.set(t,e),Tc.set(e,t)),e}const il=t=>Tc.get(t);function Aw(t,e,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const a=indexedDB.open(t,e),l=Gn(a);return r&&a.addEventListener("upgradeneeded",c=>{r(Gn(a.result),c.oldVersion,c.newVersion,Gn(a.transaction),c)}),n&&a.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),l.then(c=>{i&&c.addEventListener("close",()=>i()),s&&c.addEventListener("versionchange",h=>s(h.oldVersion,h.newVersion,h))}).catch(()=>{}),l}const bw=["get","getKey","getAll","getAllKeys","count"],Rw=["put","add","delete","clear"],ol=new Map;function Zh(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(ol.get(e))return ol.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,s=Rw.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(s||bw.includes(n)))return;const i=async function(a,...l){const c=this.transaction(a,s?"readwrite":"readonly");let h=c.store;return r&&(h=h.index(l.shift())),(await Promise.all([h[n](...l),s&&c.done]))[0]};return ol.set(e,i),i}ww(t=>({...t,get:(e,n,r)=>Zh(e,n)||t.get(e,n,r),has:(e,n)=>!!Zh(e,n)||t.has(e,n)}));/**
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
 */class Sw{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(Pw(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function Pw(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Dl="@firebase/app",ed="0.10.13";/**
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
 */const Sn=new wc("@firebase/app"),Cw="@firebase/app-compat",kw="@firebase/analytics-compat",xw="@firebase/analytics",Dw="@firebase/app-check-compat",Vw="@firebase/app-check",Nw="@firebase/auth",Ow="@firebase/auth-compat",Mw="@firebase/database",Lw="@firebase/data-connect",Fw="@firebase/database-compat",Uw="@firebase/functions",Bw="@firebase/functions-compat",jw="@firebase/installations",$w="@firebase/installations-compat",qw="@firebase/messaging",Hw="@firebase/messaging-compat",zw="@firebase/performance",Ww="@firebase/performance-compat",Kw="@firebase/remote-config",Gw="@firebase/remote-config-compat",Qw="@firebase/storage",Jw="@firebase/storage-compat",Yw="@firebase/firestore",Xw="@firebase/vertexai-preview",Zw="@firebase/firestore-compat",eT="firebase",tT="10.14.1";/**
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
 */const Vl="[DEFAULT]",nT={[Dl]:"fire-core",[Cw]:"fire-core-compat",[xw]:"fire-analytics",[kw]:"fire-analytics-compat",[Vw]:"fire-app-check",[Dw]:"fire-app-check-compat",[Nw]:"fire-auth",[Ow]:"fire-auth-compat",[Mw]:"fire-rtdb",[Lw]:"fire-data-connect",[Fw]:"fire-rtdb-compat",[Uw]:"fire-fn",[Bw]:"fire-fn-compat",[jw]:"fire-iid",[$w]:"fire-iid-compat",[qw]:"fire-fcm",[Hw]:"fire-fcm-compat",[zw]:"fire-perf",[Ww]:"fire-perf-compat",[Kw]:"fire-rc",[Gw]:"fire-rc-compat",[Qw]:"fire-gcs",[Jw]:"fire-gcs-compat",[Yw]:"fire-fst",[Zw]:"fire-fst-compat",[Xw]:"fire-vertex","fire-js":"fire-js",[eT]:"fire-js-all"};/**
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
 */const Do=new Map,rT=new Map,Nl=new Map;function td(t,e){try{t.container.addComponent(e)}catch(n){Sn.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function as(t){const e=t.name;if(Nl.has(e))return Sn.debug(`There were multiple attempts to register component ${e}.`),!1;Nl.set(e,t);for(const n of Do.values())td(n,t);for(const n of rT.values())td(n,t);return!0}function Ic(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function wn(t){return t.settings!==void 0}/**
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
 */const sT={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Qn=new Ti("app","Firebase",sT);/**
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
 */class iT{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new wr("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Qn.create("app-deleted",{appName:this._name})}}/**
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
 */const ms=tT;function Fp(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Vl,automaticDataCollectionEnabled:!1},e),s=r.name;if(typeof s!="string"||!s)throw Qn.create("bad-app-name",{appName:String(s)});if(n||(n=Np()),!n)throw Qn.create("no-options");const i=Do.get(s);if(i){if(xo(n,i.options)&&xo(r,i.config))return i;throw Qn.create("duplicate-app",{appName:s})}const a=new hw(s);for(const c of Nl.values())a.addComponent(c);const l=new iT(n,r,a);return Do.set(s,l),l}function Up(t=Vl){const e=Do.get(t);if(!e&&t===Vl&&Np())return Fp();if(!e)throw Qn.create("no-app",{appName:t});return e}function Jn(t,e,n){var r;let s=(r=nT[t])!==null&&r!==void 0?r:t;n&&(s+=`-${n}`);const i=s.match(/\s|\//),a=e.match(/\s|\//);if(i||a){const l=[`Unable to register library "${s}" with version "${e}":`];i&&l.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&a&&l.push("and"),a&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Sn.warn(l.join(" "));return}as(new wr(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const oT="firebase-heartbeat-database",aT=1,ui="firebase-heartbeat-store";let al=null;function Bp(){return al||(al=Aw(oT,aT,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(ui)}catch(n){console.warn(n)}}}}).catch(t=>{throw Qn.create("idb-open",{originalErrorMessage:t.message})})),al}async function lT(t){try{const n=(await Bp()).transaction(ui),r=await n.objectStore(ui).get(jp(t));return await n.done,r}catch(e){if(e instanceof Vn)Sn.warn(e.message);else{const n=Qn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Sn.warn(n.message)}}}async function nd(t,e){try{const r=(await Bp()).transaction(ui,"readwrite");await r.objectStore(ui).put(e,jp(t)),await r.done}catch(n){if(n instanceof Vn)Sn.warn(n.message);else{const r=Qn.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Sn.warn(r.message)}}}function jp(t){return`${t.name}!${t.options.appId}`}/**
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
 */const cT=1024,uT=30*24*60*60*1e3;class hT{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new fT(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=rd();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const l=new Date(a.date).valueOf();return Date.now()-l<=uT}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Sn.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=rd(),{heartbeatsToSend:r,unsentEntries:s}=dT(this._heartbeatsCache.heartbeats),i=ko(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(n){return Sn.warn(n),""}}}function rd(){return new Date().toISOString().substring(0,10)}function dT(t,e=cT){const n=[];let r=t.slice();for(const s of t){const i=n.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),sd(n)>e){i.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),sd(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class fT{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return ZE()?ew().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await lT(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return nd(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return nd(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function sd(t){return ko(JSON.stringify({version:2,heartbeats:t})).length}/**
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
 */function pT(t){as(new wr("platform-logger",e=>new Sw(e),"PRIVATE")),as(new wr("heartbeat",e=>new hT(e),"PRIVATE")),Jn(Dl,ed,t),Jn(Dl,ed,"esm2017"),Jn("fire-js","")}pT("");var mT="firebase",gT="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Jn(mT,gT,"app");var id=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Er,$p;(function(){var t;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(I,v){function T(){}T.prototype=v.prototype,I.D=v.prototype,I.prototype=new T,I.prototype.constructor=I,I.C=function(A,b,P){for(var w=Array(arguments.length-2),nt=2;nt<arguments.length;nt++)w[nt-2]=arguments[nt];return v.prototype[b].apply(A,w)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,n),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(I,v,T){T||(T=0);var A=Array(16);if(typeof v=="string")for(var b=0;16>b;++b)A[b]=v.charCodeAt(T++)|v.charCodeAt(T++)<<8|v.charCodeAt(T++)<<16|v.charCodeAt(T++)<<24;else for(b=0;16>b;++b)A[b]=v[T++]|v[T++]<<8|v[T++]<<16|v[T++]<<24;v=I.g[0],T=I.g[1],b=I.g[2];var P=I.g[3],w=v+(P^T&(b^P))+A[0]+3614090360&4294967295;v=T+(w<<7&4294967295|w>>>25),w=P+(b^v&(T^b))+A[1]+3905402710&4294967295,P=v+(w<<12&4294967295|w>>>20),w=b+(T^P&(v^T))+A[2]+606105819&4294967295,b=P+(w<<17&4294967295|w>>>15),w=T+(v^b&(P^v))+A[3]+3250441966&4294967295,T=b+(w<<22&4294967295|w>>>10),w=v+(P^T&(b^P))+A[4]+4118548399&4294967295,v=T+(w<<7&4294967295|w>>>25),w=P+(b^v&(T^b))+A[5]+1200080426&4294967295,P=v+(w<<12&4294967295|w>>>20),w=b+(T^P&(v^T))+A[6]+2821735955&4294967295,b=P+(w<<17&4294967295|w>>>15),w=T+(v^b&(P^v))+A[7]+4249261313&4294967295,T=b+(w<<22&4294967295|w>>>10),w=v+(P^T&(b^P))+A[8]+1770035416&4294967295,v=T+(w<<7&4294967295|w>>>25),w=P+(b^v&(T^b))+A[9]+2336552879&4294967295,P=v+(w<<12&4294967295|w>>>20),w=b+(T^P&(v^T))+A[10]+4294925233&4294967295,b=P+(w<<17&4294967295|w>>>15),w=T+(v^b&(P^v))+A[11]+2304563134&4294967295,T=b+(w<<22&4294967295|w>>>10),w=v+(P^T&(b^P))+A[12]+1804603682&4294967295,v=T+(w<<7&4294967295|w>>>25),w=P+(b^v&(T^b))+A[13]+4254626195&4294967295,P=v+(w<<12&4294967295|w>>>20),w=b+(T^P&(v^T))+A[14]+2792965006&4294967295,b=P+(w<<17&4294967295|w>>>15),w=T+(v^b&(P^v))+A[15]+1236535329&4294967295,T=b+(w<<22&4294967295|w>>>10),w=v+(b^P&(T^b))+A[1]+4129170786&4294967295,v=T+(w<<5&4294967295|w>>>27),w=P+(T^b&(v^T))+A[6]+3225465664&4294967295,P=v+(w<<9&4294967295|w>>>23),w=b+(v^T&(P^v))+A[11]+643717713&4294967295,b=P+(w<<14&4294967295|w>>>18),w=T+(P^v&(b^P))+A[0]+3921069994&4294967295,T=b+(w<<20&4294967295|w>>>12),w=v+(b^P&(T^b))+A[5]+3593408605&4294967295,v=T+(w<<5&4294967295|w>>>27),w=P+(T^b&(v^T))+A[10]+38016083&4294967295,P=v+(w<<9&4294967295|w>>>23),w=b+(v^T&(P^v))+A[15]+3634488961&4294967295,b=P+(w<<14&4294967295|w>>>18),w=T+(P^v&(b^P))+A[4]+3889429448&4294967295,T=b+(w<<20&4294967295|w>>>12),w=v+(b^P&(T^b))+A[9]+568446438&4294967295,v=T+(w<<5&4294967295|w>>>27),w=P+(T^b&(v^T))+A[14]+3275163606&4294967295,P=v+(w<<9&4294967295|w>>>23),w=b+(v^T&(P^v))+A[3]+4107603335&4294967295,b=P+(w<<14&4294967295|w>>>18),w=T+(P^v&(b^P))+A[8]+1163531501&4294967295,T=b+(w<<20&4294967295|w>>>12),w=v+(b^P&(T^b))+A[13]+2850285829&4294967295,v=T+(w<<5&4294967295|w>>>27),w=P+(T^b&(v^T))+A[2]+4243563512&4294967295,P=v+(w<<9&4294967295|w>>>23),w=b+(v^T&(P^v))+A[7]+1735328473&4294967295,b=P+(w<<14&4294967295|w>>>18),w=T+(P^v&(b^P))+A[12]+2368359562&4294967295,T=b+(w<<20&4294967295|w>>>12),w=v+(T^b^P)+A[5]+4294588738&4294967295,v=T+(w<<4&4294967295|w>>>28),w=P+(v^T^b)+A[8]+2272392833&4294967295,P=v+(w<<11&4294967295|w>>>21),w=b+(P^v^T)+A[11]+1839030562&4294967295,b=P+(w<<16&4294967295|w>>>16),w=T+(b^P^v)+A[14]+4259657740&4294967295,T=b+(w<<23&4294967295|w>>>9),w=v+(T^b^P)+A[1]+2763975236&4294967295,v=T+(w<<4&4294967295|w>>>28),w=P+(v^T^b)+A[4]+1272893353&4294967295,P=v+(w<<11&4294967295|w>>>21),w=b+(P^v^T)+A[7]+4139469664&4294967295,b=P+(w<<16&4294967295|w>>>16),w=T+(b^P^v)+A[10]+3200236656&4294967295,T=b+(w<<23&4294967295|w>>>9),w=v+(T^b^P)+A[13]+681279174&4294967295,v=T+(w<<4&4294967295|w>>>28),w=P+(v^T^b)+A[0]+3936430074&4294967295,P=v+(w<<11&4294967295|w>>>21),w=b+(P^v^T)+A[3]+3572445317&4294967295,b=P+(w<<16&4294967295|w>>>16),w=T+(b^P^v)+A[6]+76029189&4294967295,T=b+(w<<23&4294967295|w>>>9),w=v+(T^b^P)+A[9]+3654602809&4294967295,v=T+(w<<4&4294967295|w>>>28),w=P+(v^T^b)+A[12]+3873151461&4294967295,P=v+(w<<11&4294967295|w>>>21),w=b+(P^v^T)+A[15]+530742520&4294967295,b=P+(w<<16&4294967295|w>>>16),w=T+(b^P^v)+A[2]+3299628645&4294967295,T=b+(w<<23&4294967295|w>>>9),w=v+(b^(T|~P))+A[0]+4096336452&4294967295,v=T+(w<<6&4294967295|w>>>26),w=P+(T^(v|~b))+A[7]+1126891415&4294967295,P=v+(w<<10&4294967295|w>>>22),w=b+(v^(P|~T))+A[14]+2878612391&4294967295,b=P+(w<<15&4294967295|w>>>17),w=T+(P^(b|~v))+A[5]+4237533241&4294967295,T=b+(w<<21&4294967295|w>>>11),w=v+(b^(T|~P))+A[12]+1700485571&4294967295,v=T+(w<<6&4294967295|w>>>26),w=P+(T^(v|~b))+A[3]+2399980690&4294967295,P=v+(w<<10&4294967295|w>>>22),w=b+(v^(P|~T))+A[10]+4293915773&4294967295,b=P+(w<<15&4294967295|w>>>17),w=T+(P^(b|~v))+A[1]+2240044497&4294967295,T=b+(w<<21&4294967295|w>>>11),w=v+(b^(T|~P))+A[8]+1873313359&4294967295,v=T+(w<<6&4294967295|w>>>26),w=P+(T^(v|~b))+A[15]+4264355552&4294967295,P=v+(w<<10&4294967295|w>>>22),w=b+(v^(P|~T))+A[6]+2734768916&4294967295,b=P+(w<<15&4294967295|w>>>17),w=T+(P^(b|~v))+A[13]+1309151649&4294967295,T=b+(w<<21&4294967295|w>>>11),w=v+(b^(T|~P))+A[4]+4149444226&4294967295,v=T+(w<<6&4294967295|w>>>26),w=P+(T^(v|~b))+A[11]+3174756917&4294967295,P=v+(w<<10&4294967295|w>>>22),w=b+(v^(P|~T))+A[2]+718787259&4294967295,b=P+(w<<15&4294967295|w>>>17),w=T+(P^(b|~v))+A[9]+3951481745&4294967295,I.g[0]=I.g[0]+v&4294967295,I.g[1]=I.g[1]+(b+(w<<21&4294967295|w>>>11))&4294967295,I.g[2]=I.g[2]+b&4294967295,I.g[3]=I.g[3]+P&4294967295}r.prototype.u=function(I,v){v===void 0&&(v=I.length);for(var T=v-this.blockSize,A=this.B,b=this.h,P=0;P<v;){if(b==0)for(;P<=T;)s(this,I,P),P+=this.blockSize;if(typeof I=="string"){for(;P<v;)if(A[b++]=I.charCodeAt(P++),b==this.blockSize){s(this,A),b=0;break}}else for(;P<v;)if(A[b++]=I[P++],b==this.blockSize){s(this,A),b=0;break}}this.h=b,this.o+=v},r.prototype.v=function(){var I=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);I[0]=128;for(var v=1;v<I.length-8;++v)I[v]=0;var T=8*this.o;for(v=I.length-8;v<I.length;++v)I[v]=T&255,T/=256;for(this.u(I),I=Array(16),v=T=0;4>v;++v)for(var A=0;32>A;A+=8)I[T++]=this.g[v]>>>A&255;return I};function i(I,v){var T=l;return Object.prototype.hasOwnProperty.call(T,I)?T[I]:T[I]=v(I)}function a(I,v){this.h=v;for(var T=[],A=!0,b=I.length-1;0<=b;b--){var P=I[b]|0;A&&P==v||(T[b]=P,A=!1)}this.g=T}var l={};function c(I){return-128<=I&&128>I?i(I,function(v){return new a([v|0],0>v?-1:0)}):new a([I|0],0>I?-1:0)}function h(I){if(isNaN(I)||!isFinite(I))return p;if(0>I)return L(h(-I));for(var v=[],T=1,A=0;I>=T;A++)v[A]=I/T|0,T*=4294967296;return new a(v,0)}function d(I,v){if(I.length==0)throw Error("number format error: empty string");if(v=v||10,2>v||36<v)throw Error("radix out of range: "+v);if(I.charAt(0)=="-")return L(d(I.substring(1),v));if(0<=I.indexOf("-"))throw Error('number format error: interior "-" character');for(var T=h(Math.pow(v,8)),A=p,b=0;b<I.length;b+=8){var P=Math.min(8,I.length-b),w=parseInt(I.substring(b,b+P),v);8>P?(P=h(Math.pow(v,P)),A=A.j(P).add(h(w))):(A=A.j(T),A=A.add(h(w)))}return A}var p=c(0),g=c(1),y=c(16777216);t=a.prototype,t.m=function(){if(N(this))return-L(this).m();for(var I=0,v=1,T=0;T<this.g.length;T++){var A=this.i(T);I+=(0<=A?A:4294967296+A)*v,v*=4294967296}return I},t.toString=function(I){if(I=I||10,2>I||36<I)throw Error("radix out of range: "+I);if(x(this))return"0";if(N(this))return"-"+L(this).toString(I);for(var v=h(Math.pow(I,6)),T=this,A="";;){var b=J(T,v).g;T=K(T,b.j(v));var P=((0<T.g.length?T.g[0]:T.h)>>>0).toString(I);if(T=b,x(T))return P+A;for(;6>P.length;)P="0"+P;A=P+A}},t.i=function(I){return 0>I?0:I<this.g.length?this.g[I]:this.h};function x(I){if(I.h!=0)return!1;for(var v=0;v<I.g.length;v++)if(I.g[v]!=0)return!1;return!0}function N(I){return I.h==-1}t.l=function(I){return I=K(this,I),N(I)?-1:x(I)?0:1};function L(I){for(var v=I.g.length,T=[],A=0;A<v;A++)T[A]=~I.g[A];return new a(T,~I.h).add(g)}t.abs=function(){return N(this)?L(this):this},t.add=function(I){for(var v=Math.max(this.g.length,I.g.length),T=[],A=0,b=0;b<=v;b++){var P=A+(this.i(b)&65535)+(I.i(b)&65535),w=(P>>>16)+(this.i(b)>>>16)+(I.i(b)>>>16);A=w>>>16,P&=65535,w&=65535,T[b]=w<<16|P}return new a(T,T[T.length-1]&-2147483648?-1:0)};function K(I,v){return I.add(L(v))}t.j=function(I){if(x(this)||x(I))return p;if(N(this))return N(I)?L(this).j(L(I)):L(L(this).j(I));if(N(I))return L(this.j(L(I)));if(0>this.l(y)&&0>I.l(y))return h(this.m()*I.m());for(var v=this.g.length+I.g.length,T=[],A=0;A<2*v;A++)T[A]=0;for(A=0;A<this.g.length;A++)for(var b=0;b<I.g.length;b++){var P=this.i(A)>>>16,w=this.i(A)&65535,nt=I.i(b)>>>16,at=I.i(b)&65535;T[2*A+2*b]+=w*at,U(T,2*A+2*b),T[2*A+2*b+1]+=P*at,U(T,2*A+2*b+1),T[2*A+2*b+1]+=w*nt,U(T,2*A+2*b+1),T[2*A+2*b+2]+=P*nt,U(T,2*A+2*b+2)}for(A=0;A<v;A++)T[A]=T[2*A+1]<<16|T[2*A];for(A=v;A<2*v;A++)T[A]=0;return new a(T,0)};function U(I,v){for(;(I[v]&65535)!=I[v];)I[v+1]+=I[v]>>>16,I[v]&=65535,v++}function H(I,v){this.g=I,this.h=v}function J(I,v){if(x(v))throw Error("division by zero");if(x(I))return new H(p,p);if(N(I))return v=J(L(I),v),new H(L(v.g),L(v.h));if(N(v))return v=J(I,L(v)),new H(L(v.g),v.h);if(30<I.g.length){if(N(I)||N(v))throw Error("slowDivide_ only works with positive integers.");for(var T=g,A=v;0>=A.l(I);)T=ge(T),A=ge(A);var b=ye(T,1),P=ye(A,1);for(A=ye(A,2),T=ye(T,2);!x(A);){var w=P.add(A);0>=w.l(I)&&(b=b.add(T),P=w),A=ye(A,1),T=ye(T,1)}return v=K(I,b.j(v)),new H(b,v)}for(b=p;0<=I.l(v);){for(T=Math.max(1,Math.floor(I.m()/v.m())),A=Math.ceil(Math.log(T)/Math.LN2),A=48>=A?1:Math.pow(2,A-48),P=h(T),w=P.j(v);N(w)||0<w.l(I);)T-=A,P=h(T),w=P.j(v);x(P)&&(P=g),b=b.add(P),I=K(I,w)}return new H(b,I)}t.A=function(I){return J(this,I).h},t.and=function(I){for(var v=Math.max(this.g.length,I.g.length),T=[],A=0;A<v;A++)T[A]=this.i(A)&I.i(A);return new a(T,this.h&I.h)},t.or=function(I){for(var v=Math.max(this.g.length,I.g.length),T=[],A=0;A<v;A++)T[A]=this.i(A)|I.i(A);return new a(T,this.h|I.h)},t.xor=function(I){for(var v=Math.max(this.g.length,I.g.length),T=[],A=0;A<v;A++)T[A]=this.i(A)^I.i(A);return new a(T,this.h^I.h)};function ge(I){for(var v=I.g.length+1,T=[],A=0;A<v;A++)T[A]=I.i(A)<<1|I.i(A-1)>>>31;return new a(T,I.h)}function ye(I,v){var T=v>>5;v%=32;for(var A=I.g.length-T,b=[],P=0;P<A;P++)b[P]=0<v?I.i(P+T)>>>v|I.i(P+T+1)<<32-v:I.i(P+T);return new a(b,I.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,$p=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=h,a.fromString=d,Er=a}).apply(typeof id<"u"?id:typeof self<"u"?self:typeof window<"u"?window:{});var eo=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var qp,Fs,Hp,po,Ol,zp,Wp,Kp;(function(){var t,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,u,f){return o==Array.prototype||o==Object.prototype||(o[u]=f.value),o};function n(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof eo=="object"&&eo];for(var u=0;u<o.length;++u){var f=o[u];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var r=n(this);function s(o,u){if(u)e:{var f=r;o=o.split(".");for(var m=0;m<o.length-1;m++){var S=o[m];if(!(S in f))break e;f=f[S]}o=o[o.length-1],m=f[o],u=u(m),u!=m&&u!=null&&e(f,o,{configurable:!0,writable:!0,value:u})}}function i(o,u){o instanceof String&&(o+="");var f=0,m=!1,S={next:function(){if(!m&&f<o.length){var D=f++;return{value:u(D,o[D]),done:!1}}return m=!0,{done:!0,value:void 0}}};return S[Symbol.iterator]=function(){return S},S}s("Array.prototype.values",function(o){return o||function(){return i(this,function(u,f){return f})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},l=this||self;function c(o){var u=typeof o;return u=u!="object"?u:o?Array.isArray(o)?"array":u:"null",u=="array"||u=="object"&&typeof o.length=="number"}function h(o){var u=typeof o;return u=="object"&&o!=null||u=="function"}function d(o,u,f){return o.call.apply(o.bind,arguments)}function p(o,u,f){if(!o)throw Error();if(2<arguments.length){var m=Array.prototype.slice.call(arguments,2);return function(){var S=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(S,m),o.apply(u,S)}}return function(){return o.apply(u,arguments)}}function g(o,u,f){return g=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?d:p,g.apply(null,arguments)}function y(o,u){var f=Array.prototype.slice.call(arguments,1);return function(){var m=f.slice();return m.push.apply(m,arguments),o.apply(this,m)}}function x(o,u){function f(){}f.prototype=u.prototype,o.aa=u.prototype,o.prototype=new f,o.prototype.constructor=o,o.Qb=function(m,S,D){for(var X=Array(arguments.length-2),$e=2;$e<arguments.length;$e++)X[$e-2]=arguments[$e];return u.prototype[S].apply(m,X)}}function N(o){const u=o.length;if(0<u){const f=Array(u);for(let m=0;m<u;m++)f[m]=o[m];return f}return[]}function L(o,u){for(let f=1;f<arguments.length;f++){const m=arguments[f];if(c(m)){const S=o.length||0,D=m.length||0;o.length=S+D;for(let X=0;X<D;X++)o[S+X]=m[X]}else o.push(m)}}class K{constructor(u,f){this.i=u,this.j=f,this.h=0,this.g=null}get(){let u;return 0<this.h?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function U(o){return/^[\s\xa0]*$/.test(o)}function H(){var o=l.navigator;return o&&(o=o.userAgent)?o:""}function J(o){return J[" "](o),o}J[" "]=function(){};var ge=H().indexOf("Gecko")!=-1&&!(H().toLowerCase().indexOf("webkit")!=-1&&H().indexOf("Edge")==-1)&&!(H().indexOf("Trident")!=-1||H().indexOf("MSIE")!=-1)&&H().indexOf("Edge")==-1;function ye(o,u,f){for(const m in o)u.call(f,o[m],m,o)}function I(o,u){for(const f in o)u.call(void 0,o[f],f,o)}function v(o){const u={};for(const f in o)u[f]=o[f];return u}const T="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function A(o,u){let f,m;for(let S=1;S<arguments.length;S++){m=arguments[S];for(f in m)o[f]=m[f];for(let D=0;D<T.length;D++)f=T[D],Object.prototype.hasOwnProperty.call(m,f)&&(o[f]=m[f])}}function b(o){var u=1;o=o.split(":");const f=[];for(;0<u&&o.length;)f.push(o.shift()),u--;return o.length&&f.push(o.join(":")),f}function P(o){l.setTimeout(()=>{throw o},0)}function w(){var o=St;let u=null;return o.g&&(u=o.g,o.g=o.g.next,o.g||(o.h=null),u.next=null),u}class nt{constructor(){this.h=this.g=null}add(u,f){const m=at.get();m.set(u,f),this.h?this.h.next=m:this.g=m,this.h=m}}var at=new K(()=>new je,o=>o.reset());class je{constructor(){this.next=this.g=this.h=null}set(u,f){this.h=u,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let ve,Ee=!1,St=new nt,ke=()=>{const o=l.Promise.resolve(void 0);ve=()=>{o.then(Ne)}};var Ne=()=>{for(var o;o=w();){try{o.h.call(o.g)}catch(f){P(f)}var u=at;u.j(o),100>u.h&&(u.h++,o.next=u.g,u.g=o)}Ee=!1};function we(){this.s=this.s,this.C=this.C}we.prototype.s=!1,we.prototype.ma=function(){this.s||(this.s=!0,this.N())},we.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Ae(o,u){this.type=o,this.g=this.target=u,this.defaultPrevented=!1}Ae.prototype.h=function(){this.defaultPrevented=!0};var en=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var o=!1,u=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const f=()=>{};l.addEventListener("test",f,u),l.removeEventListener("test",f,u)}catch{}return o}();function Ot(o,u){if(Ae.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var f=this.type=o.type,m=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=u,u=o.relatedTarget){if(ge){e:{try{J(u.nodeName);var S=!0;break e}catch{}S=!1}S||(u=null)}}else f=="mouseover"?u=o.fromElement:f=="mouseout"&&(u=o.toElement);this.relatedTarget=u,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:gt[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&Ot.aa.h.call(this)}}x(Ot,Ae);var gt={2:"touch",3:"pen",4:"mouse"};Ot.prototype.h=function(){Ot.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var O="closure_listenable_"+(1e6*Math.random()|0),te=0;function ee(o,u,f,m,S){this.listener=o,this.proxy=null,this.src=u,this.type=f,this.capture=!!m,this.ha=S,this.key=++te,this.da=this.fa=!1}function re(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function pe(o){this.src=o,this.g={},this.h=0}pe.prototype.add=function(o,u,f,m,S){var D=o.toString();o=this.g[D],o||(o=this.g[D]=[],this.h++);var X=_(o,u,m,S);return-1<X?(u=o[X],f||(u.fa=!1)):(u=new ee(u,this.src,D,!!m,S),u.fa=f,o.push(u)),u};function Se(o,u){var f=u.type;if(f in o.g){var m=o.g[f],S=Array.prototype.indexOf.call(m,u,void 0),D;(D=0<=S)&&Array.prototype.splice.call(m,S,1),D&&(re(u),o.g[f].length==0&&(delete o.g[f],o.h--))}}function _(o,u,f,m){for(var S=0;S<o.length;++S){var D=o[S];if(!D.da&&D.listener==u&&D.capture==!!f&&D.ha==m)return S}return-1}var E="closure_lm_"+(1e6*Math.random()|0),C={};function B(o,u,f,m,S){if(m&&m.once)return Y(o,u,f,m,S);if(Array.isArray(u)){for(var D=0;D<u.length;D++)B(o,u[D],f,m,S);return null}return f=V(f),o&&o[O]?o.K(u,f,h(m)?!!m.capture:!!m,S):M(o,u,f,!1,m,S)}function M(o,u,f,m,S,D){if(!u)throw Error("Invalid event type");var X=h(S)?!!S.capture:!!S,$e=Z(o);if($e||(o[E]=$e=new pe(o)),f=$e.add(u,f,m,X,D),f.proxy)return f;if(m=j(),f.proxy=m,m.src=o,m.listener=f,o.addEventListener)en||(S=X),S===void 0&&(S=!1),o.addEventListener(u.toString(),m,S);else if(o.attachEvent)o.attachEvent(q(u.toString()),m);else if(o.addListener&&o.removeListener)o.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return f}function j(){function o(f){return u.call(o.src,o.listener,f)}const u=oe;return o}function Y(o,u,f,m,S){if(Array.isArray(u)){for(var D=0;D<u.length;D++)Y(o,u[D],f,m,S);return null}return f=V(f),o&&o[O]?o.L(u,f,h(m)?!!m.capture:!!m,S):M(o,u,f,!0,m,S)}function G(o,u,f,m,S){if(Array.isArray(u))for(var D=0;D<u.length;D++)G(o,u[D],f,m,S);else m=h(m)?!!m.capture:!!m,f=V(f),o&&o[O]?(o=o.i,u=String(u).toString(),u in o.g&&(D=o.g[u],f=_(D,f,m,S),-1<f&&(re(D[f]),Array.prototype.splice.call(D,f,1),D.length==0&&(delete o.g[u],o.h--)))):o&&(o=Z(o))&&(u=o.g[u.toString()],o=-1,u&&(o=_(u,f,m,S)),(f=-1<o?u[o]:null)&&z(f))}function z(o){if(typeof o!="number"&&o&&!o.da){var u=o.src;if(u&&u[O])Se(u.i,o);else{var f=o.type,m=o.proxy;u.removeEventListener?u.removeEventListener(f,m,o.capture):u.detachEvent?u.detachEvent(q(f),m):u.addListener&&u.removeListener&&u.removeListener(m),(f=Z(u))?(Se(f,o),f.h==0&&(f.src=null,u[E]=null)):re(o)}}}function q(o){return o in C?C[o]:C[o]="on"+o}function oe(o,u){if(o.da)o=!0;else{u=new Ot(u,this);var f=o.listener,m=o.ha||o.src;o.fa&&z(o),o=f.call(m,u)}return o}function Z(o){return o=o[E],o instanceof pe?o:null}var se="__closure_events_fn_"+(1e9*Math.random()>>>0);function V(o){return typeof o=="function"?o:(o[se]||(o[se]=function(u){return o.handleEvent(u)}),o[se])}function R(){we.call(this),this.i=new pe(this),this.M=this,this.F=null}x(R,we),R.prototype[O]=!0,R.prototype.removeEventListener=function(o,u,f,m){G(this,o,u,f,m)};function k(o,u){var f,m=o.F;if(m)for(f=[];m;m=m.F)f.push(m);if(o=o.M,m=u.type||u,typeof u=="string")u=new Ae(u,o);else if(u instanceof Ae)u.target=u.target||o;else{var S=u;u=new Ae(m,o),A(u,S)}if(S=!0,f)for(var D=f.length-1;0<=D;D--){var X=u.g=f[D];S=Q(X,m,!0,u)&&S}if(X=u.g=o,S=Q(X,m,!0,u)&&S,S=Q(X,m,!1,u)&&S,f)for(D=0;D<f.length;D++)X=u.g=f[D],S=Q(X,m,!1,u)&&S}R.prototype.N=function(){if(R.aa.N.call(this),this.i){var o=this.i,u;for(u in o.g){for(var f=o.g[u],m=0;m<f.length;m++)re(f[m]);delete o.g[u],o.h--}}this.F=null},R.prototype.K=function(o,u,f,m){return this.i.add(String(o),u,!1,f,m)},R.prototype.L=function(o,u,f,m){return this.i.add(String(o),u,!0,f,m)};function Q(o,u,f,m){if(u=o.i.g[String(u)],!u)return!0;u=u.concat();for(var S=!0,D=0;D<u.length;++D){var X=u[D];if(X&&!X.da&&X.capture==f){var $e=X.listener,lt=X.ha||X.src;X.fa&&Se(o.i,X),S=$e.call(lt,m)!==!1&&S}}return S&&!m.defaultPrevented}function Te(o,u,f){if(typeof o=="function")f&&(o=g(o,f));else if(o&&typeof o.handleEvent=="function")o=g(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(u)?-1:l.setTimeout(o,u||0)}function _e(o){o.g=Te(()=>{o.g=null,o.i&&(o.i=!1,_e(o))},o.l);const u=o.h;o.h=null,o.m.apply(null,u)}class le extends we{constructor(u,f){super(),this.m=u,this.l=f,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:_e(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Ie(o){we.call(this),this.h=o,this.g={}}x(Ie,we);var Ke=[];function fn(o){ye(o.g,function(u,f){this.g.hasOwnProperty(f)&&z(u)},o),o.g={}}Ie.prototype.N=function(){Ie.aa.N.call(this),fn(this)},Ie.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var rt=l.JSON.stringify,Ht=l.JSON.parse,Oi=class{stringify(o){return l.JSON.stringify(o,void 0)}parse(o){return l.JSON.parse(o,void 0)}};function Sa(){}Sa.prototype.h=null;function du(o){return o.h||(o.h=o.i())}function fu(){}var ws={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Pa(){Ae.call(this,"d")}x(Pa,Ae);function Ca(){Ae.call(this,"c")}x(Ca,Ae);var cr={},pu=null;function Mi(){return pu=pu||new R}cr.La="serverreachability";function mu(o){Ae.call(this,cr.La,o)}x(mu,Ae);function Ts(o){const u=Mi();k(u,new mu(u))}cr.STAT_EVENT="statevent";function gu(o,u){Ae.call(this,cr.STAT_EVENT,o),this.stat=u}x(gu,Ae);function Pt(o){const u=Mi();k(u,new gu(u,o))}cr.Ma="timingevent";function _u(o,u){Ae.call(this,cr.Ma,o),this.size=u}x(_u,Ae);function Is(o,u){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){o()},u)}function As(){this.g=!0}As.prototype.xa=function(){this.g=!1};function $g(o,u,f,m,S,D){o.info(function(){if(o.g)if(D)for(var X="",$e=D.split("&"),lt=0;lt<$e.length;lt++){var xe=$e[lt].split("=");if(1<xe.length){var _t=xe[0];xe=xe[1];var yt=_t.split("_");X=2<=yt.length&&yt[1]=="type"?X+(_t+"="+xe+"&"):X+(_t+"=redacted&")}}else X=null;else X=D;return"XMLHTTP REQ ("+m+") [attempt "+S+"]: "+u+`
`+f+`
`+X})}function qg(o,u,f,m,S,D,X){o.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+S+"]: "+u+`
`+f+`
`+D+" "+X})}function Dr(o,u,f,m){o.info(function(){return"XMLHTTP TEXT ("+u+"): "+zg(o,f)+(m?" "+m:"")})}function Hg(o,u){o.info(function(){return"TIMEOUT: "+u})}As.prototype.info=function(){};function zg(o,u){if(!o.g)return u;if(!u)return null;try{var f=JSON.parse(u);if(f){for(o=0;o<f.length;o++)if(Array.isArray(f[o])){var m=f[o];if(!(2>m.length)){var S=m[1];if(Array.isArray(S)&&!(1>S.length)){var D=S[0];if(D!="noop"&&D!="stop"&&D!="close")for(var X=1;X<S.length;X++)S[X]=""}}}}return rt(f)}catch{return u}}var Li={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},yu={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},ka;function Fi(){}x(Fi,Sa),Fi.prototype.g=function(){return new XMLHttpRequest},Fi.prototype.i=function(){return{}},ka=new Fi;function Nn(o,u,f,m){this.j=o,this.i=u,this.l=f,this.R=m||1,this.U=new Ie(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new vu}function vu(){this.i=null,this.g="",this.h=!1}var Eu={},xa={};function Da(o,u,f){o.L=1,o.v=$i(pn(u)),o.m=f,o.P=!0,wu(o,null)}function wu(o,u){o.F=Date.now(),Ui(o),o.A=pn(o.v);var f=o.A,m=o.R;Array.isArray(m)||(m=[String(m)]),Ou(f.i,"t",m),o.C=0,f=o.j.J,o.h=new vu,o.g=Zu(o.j,f?u:null,!o.m),0<o.O&&(o.M=new le(g(o.Y,o,o.g),o.O)),u=o.U,f=o.g,m=o.ca;var S="readystatechange";Array.isArray(S)||(S&&(Ke[0]=S.toString()),S=Ke);for(var D=0;D<S.length;D++){var X=B(f,S[D],m||u.handleEvent,!1,u.h||u);if(!X)break;u.g[X.key]=X}u=o.H?v(o.H):{},o.m?(o.u||(o.u="POST"),u["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,u)):(o.u="GET",o.g.ea(o.A,o.u,null,u)),Ts(),$g(o.i,o.u,o.A,o.l,o.R,o.m)}Nn.prototype.ca=function(o){o=o.target;const u=this.M;u&&mn(o)==3?u.j():this.Y(o)},Nn.prototype.Y=function(o){try{if(o==this.g)e:{const yt=mn(this.g);var u=this.g.Ba();const Or=this.g.Z();if(!(3>yt)&&(yt!=3||this.g&&(this.h.h||this.g.oa()||$u(this.g)))){this.J||yt!=4||u==7||(u==8||0>=Or?Ts(3):Ts(2)),Va(this);var f=this.g.Z();this.X=f;t:if(Tu(this)){var m=$u(this.g);o="";var S=m.length,D=mn(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){ur(this),bs(this);var X="";break t}this.h.i=new l.TextDecoder}for(u=0;u<S;u++)this.h.h=!0,o+=this.h.i.decode(m[u],{stream:!(D&&u==S-1)});m.length=0,this.h.g+=o,this.C=0,X=this.h.g}else X=this.g.oa();if(this.o=f==200,qg(this.i,this.u,this.A,this.l,this.R,yt,f),this.o){if(this.T&&!this.K){t:{if(this.g){var $e,lt=this.g;if(($e=lt.g?lt.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!U($e)){var xe=$e;break t}}xe=null}if(f=xe)Dr(this.i,this.l,f,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Na(this,f);else{this.o=!1,this.s=3,Pt(12),ur(this),bs(this);break e}}if(this.P){f=!0;let Kt;for(;!this.J&&this.C<X.length;)if(Kt=Wg(this,X),Kt==xa){yt==4&&(this.s=4,Pt(14),f=!1),Dr(this.i,this.l,null,"[Incomplete Response]");break}else if(Kt==Eu){this.s=4,Pt(15),Dr(this.i,this.l,X,"[Invalid Chunk]"),f=!1;break}else Dr(this.i,this.l,Kt,null),Na(this,Kt);if(Tu(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),yt!=4||X.length!=0||this.h.h||(this.s=1,Pt(16),f=!1),this.o=this.o&&f,!f)Dr(this.i,this.l,X,"[Invalid Chunked Response]"),ur(this),bs(this);else if(0<X.length&&!this.W){this.W=!0;var _t=this.j;_t.g==this&&_t.ba&&!_t.M&&(_t.j.info("Great, no buffering proxy detected. Bytes received: "+X.length),Ba(_t),_t.M=!0,Pt(11))}}else Dr(this.i,this.l,X,null),Na(this,X);yt==4&&ur(this),this.o&&!this.J&&(yt==4?Qu(this.j,this):(this.o=!1,Ui(this)))}else c_(this.g),f==400&&0<X.indexOf("Unknown SID")?(this.s=3,Pt(12)):(this.s=0,Pt(13)),ur(this),bs(this)}}}catch{}finally{}};function Tu(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function Wg(o,u){var f=o.C,m=u.indexOf(`
`,f);return m==-1?xa:(f=Number(u.substring(f,m)),isNaN(f)?Eu:(m+=1,m+f>u.length?xa:(u=u.slice(m,m+f),o.C=m+f,u)))}Nn.prototype.cancel=function(){this.J=!0,ur(this)};function Ui(o){o.S=Date.now()+o.I,Iu(o,o.I)}function Iu(o,u){if(o.B!=null)throw Error("WatchDog timer not null");o.B=Is(g(o.ba,o),u)}function Va(o){o.B&&(l.clearTimeout(o.B),o.B=null)}Nn.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(Hg(this.i,this.A),this.L!=2&&(Ts(),Pt(17)),ur(this),this.s=2,bs(this)):Iu(this,this.S-o)};function bs(o){o.j.G==0||o.J||Qu(o.j,o)}function ur(o){Va(o);var u=o.M;u&&typeof u.ma=="function"&&u.ma(),o.M=null,fn(o.U),o.g&&(u=o.g,o.g=null,u.abort(),u.ma())}function Na(o,u){try{var f=o.j;if(f.G!=0&&(f.g==o||Oa(f.h,o))){if(!o.K&&Oa(f.h,o)&&f.G==3){try{var m=f.Da.g.parse(u)}catch{m=null}if(Array.isArray(m)&&m.length==3){var S=m;if(S[0]==0){e:if(!f.u){if(f.g)if(f.g.F+3e3<o.F)Gi(f),Wi(f);else break e;Ua(f),Pt(18)}}else f.za=S[1],0<f.za-f.T&&37500>S[2]&&f.F&&f.v==0&&!f.C&&(f.C=Is(g(f.Za,f),6e3));if(1>=Ru(f.h)&&f.ca){try{f.ca()}catch{}f.ca=void 0}}else dr(f,11)}else if((o.K||f.g==o)&&Gi(f),!U(u))for(S=f.Da.g.parse(u),u=0;u<S.length;u++){let xe=S[u];if(f.T=xe[0],xe=xe[1],f.G==2)if(xe[0]=="c"){f.K=xe[1],f.ia=xe[2];const _t=xe[3];_t!=null&&(f.la=_t,f.j.info("VER="+f.la));const yt=xe[4];yt!=null&&(f.Aa=yt,f.j.info("SVER="+f.Aa));const Or=xe[5];Or!=null&&typeof Or=="number"&&0<Or&&(m=1.5*Or,f.L=m,f.j.info("backChannelRequestTimeoutMs_="+m)),m=f;const Kt=o.g;if(Kt){const Ji=Kt.g?Kt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Ji){var D=m.h;D.g||Ji.indexOf("spdy")==-1&&Ji.indexOf("quic")==-1&&Ji.indexOf("h2")==-1||(D.j=D.l,D.g=new Set,D.h&&(Ma(D,D.h),D.h=null))}if(m.D){const ja=Kt.g?Kt.g.getResponseHeader("X-HTTP-Session-Id"):null;ja&&(m.ya=ja,ze(m.I,m.D,ja))}}f.G=3,f.l&&f.l.ua(),f.ba&&(f.R=Date.now()-o.F,f.j.info("Handshake RTT: "+f.R+"ms")),m=f;var X=o;if(m.qa=Xu(m,m.J?m.ia:null,m.W),X.K){Su(m.h,X);var $e=X,lt=m.L;lt&&($e.I=lt),$e.B&&(Va($e),Ui($e)),m.g=X}else Ku(m);0<f.i.length&&Ki(f)}else xe[0]!="stop"&&xe[0]!="close"||dr(f,7);else f.G==3&&(xe[0]=="stop"||xe[0]=="close"?xe[0]=="stop"?dr(f,7):Fa(f):xe[0]!="noop"&&f.l&&f.l.ta(xe),f.v=0)}}Ts(4)}catch{}}var Kg=class{constructor(o,u){this.g=o,this.map=u}};function Au(o){this.l=o||10,l.PerformanceNavigationTiming?(o=l.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function bu(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Ru(o){return o.h?1:o.g?o.g.size:0}function Oa(o,u){return o.h?o.h==u:o.g?o.g.has(u):!1}function Ma(o,u){o.g?o.g.add(u):o.h=u}function Su(o,u){o.h&&o.h==u?o.h=null:o.g&&o.g.has(u)&&o.g.delete(u)}Au.prototype.cancel=function(){if(this.i=Pu(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Pu(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let u=o.i;for(const f of o.g.values())u=u.concat(f.D);return u}return N(o.i)}function Gg(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(c(o)){for(var u=[],f=o.length,m=0;m<f;m++)u.push(o[m]);return u}u=[],f=0;for(m in o)u[f++]=o[m];return u}function Qg(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(c(o)||typeof o=="string"){var u=[];o=o.length;for(var f=0;f<o;f++)u.push(f);return u}u=[],f=0;for(const m in o)u[f++]=m;return u}}}function Cu(o,u){if(o.forEach&&typeof o.forEach=="function")o.forEach(u,void 0);else if(c(o)||typeof o=="string")Array.prototype.forEach.call(o,u,void 0);else for(var f=Qg(o),m=Gg(o),S=m.length,D=0;D<S;D++)u.call(void 0,m[D],f&&f[D],o)}var ku=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Jg(o,u){if(o){o=o.split("&");for(var f=0;f<o.length;f++){var m=o[f].indexOf("="),S=null;if(0<=m){var D=o[f].substring(0,m);S=o[f].substring(m+1)}else D=o[f];u(D,S?decodeURIComponent(S.replace(/\+/g," ")):"")}}}function hr(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof hr){this.h=o.h,Bi(this,o.j),this.o=o.o,this.g=o.g,ji(this,o.s),this.l=o.l;var u=o.i,f=new Ps;f.i=u.i,u.g&&(f.g=new Map(u.g),f.h=u.h),xu(this,f),this.m=o.m}else o&&(u=String(o).match(ku))?(this.h=!1,Bi(this,u[1]||"",!0),this.o=Rs(u[2]||""),this.g=Rs(u[3]||"",!0),ji(this,u[4]),this.l=Rs(u[5]||"",!0),xu(this,u[6]||"",!0),this.m=Rs(u[7]||"")):(this.h=!1,this.i=new Ps(null,this.h))}hr.prototype.toString=function(){var o=[],u=this.j;u&&o.push(Ss(u,Du,!0),":");var f=this.g;return(f||u=="file")&&(o.push("//"),(u=this.o)&&o.push(Ss(u,Du,!0),"@"),o.push(encodeURIComponent(String(f)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.s,f!=null&&o.push(":",String(f))),(f=this.l)&&(this.g&&f.charAt(0)!="/"&&o.push("/"),o.push(Ss(f,f.charAt(0)=="/"?Zg:Xg,!0))),(f=this.i.toString())&&o.push("?",f),(f=this.m)&&o.push("#",Ss(f,t_)),o.join("")};function pn(o){return new hr(o)}function Bi(o,u,f){o.j=f?Rs(u,!0):u,o.j&&(o.j=o.j.replace(/:$/,""))}function ji(o,u){if(u){if(u=Number(u),isNaN(u)||0>u)throw Error("Bad port number "+u);o.s=u}else o.s=null}function xu(o,u,f){u instanceof Ps?(o.i=u,n_(o.i,o.h)):(f||(u=Ss(u,e_)),o.i=new Ps(u,o.h))}function ze(o,u,f){o.i.set(u,f)}function $i(o){return ze(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function Rs(o,u){return o?u?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function Ss(o,u,f){return typeof o=="string"?(o=encodeURI(o).replace(u,Yg),f&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function Yg(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Du=/[#\/\?@]/g,Xg=/[#\?:]/g,Zg=/[#\?]/g,e_=/[#\?@]/g,t_=/#/g;function Ps(o,u){this.h=this.g=null,this.i=o||null,this.j=!!u}function On(o){o.g||(o.g=new Map,o.h=0,o.i&&Jg(o.i,function(u,f){o.add(decodeURIComponent(u.replace(/\+/g," ")),f)}))}t=Ps.prototype,t.add=function(o,u){On(this),this.i=null,o=Vr(this,o);var f=this.g.get(o);return f||this.g.set(o,f=[]),f.push(u),this.h+=1,this};function Vu(o,u){On(o),u=Vr(o,u),o.g.has(u)&&(o.i=null,o.h-=o.g.get(u).length,o.g.delete(u))}function Nu(o,u){return On(o),u=Vr(o,u),o.g.has(u)}t.forEach=function(o,u){On(this),this.g.forEach(function(f,m){f.forEach(function(S){o.call(u,S,m,this)},this)},this)},t.na=function(){On(this);const o=Array.from(this.g.values()),u=Array.from(this.g.keys()),f=[];for(let m=0;m<u.length;m++){const S=o[m];for(let D=0;D<S.length;D++)f.push(u[m])}return f},t.V=function(o){On(this);let u=[];if(typeof o=="string")Nu(this,o)&&(u=u.concat(this.g.get(Vr(this,o))));else{o=Array.from(this.g.values());for(let f=0;f<o.length;f++)u=u.concat(o[f])}return u},t.set=function(o,u){return On(this),this.i=null,o=Vr(this,o),Nu(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[u]),this.h+=1,this},t.get=function(o,u){return o?(o=this.V(o),0<o.length?String(o[0]):u):u};function Ou(o,u,f){Vu(o,u),0<f.length&&(o.i=null,o.g.set(Vr(o,u),N(f)),o.h+=f.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],u=Array.from(this.g.keys());for(var f=0;f<u.length;f++){var m=u[f];const D=encodeURIComponent(String(m)),X=this.V(m);for(m=0;m<X.length;m++){var S=D;X[m]!==""&&(S+="="+encodeURIComponent(String(X[m]))),o.push(S)}}return this.i=o.join("&")};function Vr(o,u){return u=String(u),o.j&&(u=u.toLowerCase()),u}function n_(o,u){u&&!o.j&&(On(o),o.i=null,o.g.forEach(function(f,m){var S=m.toLowerCase();m!=S&&(Vu(this,m),Ou(this,S,f))},o)),o.j=u}function r_(o,u){const f=new As;if(l.Image){const m=new Image;m.onload=y(Mn,f,"TestLoadImage: loaded",!0,u,m),m.onerror=y(Mn,f,"TestLoadImage: error",!1,u,m),m.onabort=y(Mn,f,"TestLoadImage: abort",!1,u,m),m.ontimeout=y(Mn,f,"TestLoadImage: timeout",!1,u,m),l.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=o}else u(!1)}function s_(o,u){const f=new As,m=new AbortController,S=setTimeout(()=>{m.abort(),Mn(f,"TestPingServer: timeout",!1,u)},1e4);fetch(o,{signal:m.signal}).then(D=>{clearTimeout(S),D.ok?Mn(f,"TestPingServer: ok",!0,u):Mn(f,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(S),Mn(f,"TestPingServer: error",!1,u)})}function Mn(o,u,f,m,S){try{S&&(S.onload=null,S.onerror=null,S.onabort=null,S.ontimeout=null),m(f)}catch{}}function i_(){this.g=new Oi}function o_(o,u,f){const m=f||"";try{Cu(o,function(S,D){let X=S;h(S)&&(X=rt(S)),u.push(m+D+"="+encodeURIComponent(X))})}catch(S){throw u.push(m+"type="+encodeURIComponent("_badmap")),S}}function qi(o){this.l=o.Ub||null,this.j=o.eb||!1}x(qi,Sa),qi.prototype.g=function(){return new Hi(this.l,this.j)},qi.prototype.i=function(o){return function(){return o}}({});function Hi(o,u){R.call(this),this.D=o,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}x(Hi,R),t=Hi.prototype,t.open=function(o,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=u,this.readyState=1,ks(this)},t.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const u={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(u.body=o),(this.D||l).fetch(new Request(this.A,u)).then(this.Sa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Cs(this)),this.readyState=0},t.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,ks(this)),this.g&&(this.readyState=3,ks(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Mu(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function Mu(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}t.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var u=o.value?o.value:new Uint8Array(0);(u=this.v.decode(u,{stream:!o.done}))&&(this.response=this.responseText+=u)}o.done?Cs(this):ks(this),this.readyState==3&&Mu(this)}},t.Ra=function(o){this.g&&(this.response=this.responseText=o,Cs(this))},t.Qa=function(o){this.g&&(this.response=o,Cs(this))},t.ga=function(){this.g&&Cs(this)};function Cs(o){o.readyState=4,o.l=null,o.j=null,o.v=null,ks(o)}t.setRequestHeader=function(o,u){this.u.append(o,u)},t.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],u=this.h.entries();for(var f=u.next();!f.done;)f=f.value,o.push(f[0]+": "+f[1]),f=u.next();return o.join(`\r
`)};function ks(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(Hi.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Lu(o){let u="";return ye(o,function(f,m){u+=m,u+=":",u+=f,u+=`\r
`}),u}function La(o,u,f){e:{for(m in f){var m=!1;break e}m=!0}m||(f=Lu(f),typeof o=="string"?f!=null&&encodeURIComponent(String(f)):ze(o,u,f))}function Je(o){R.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}x(Je,R);var a_=/^https?$/i,l_=["POST","PUT"];t=Je.prototype,t.Ha=function(o){this.J=o},t.ea=function(o,u,f,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);u=u?u.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():ka.g(),this.v=this.o?du(this.o):du(ka),this.g.onreadystatechange=g(this.Ea,this);try{this.B=!0,this.g.open(u,String(o),!0),this.B=!1}catch(D){Fu(this,D);return}if(o=f||"",f=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var S in m)f.set(S,m[S]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const D of m.keys())f.set(D,m.get(D));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(f.keys()).find(D=>D.toLowerCase()=="content-type"),S=l.FormData&&o instanceof l.FormData,!(0<=Array.prototype.indexOf.call(l_,u,void 0))||m||S||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[D,X]of f)this.g.setRequestHeader(D,X);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{ju(this),this.u=!0,this.g.send(o),this.u=!1}catch(D){Fu(this,D)}};function Fu(o,u){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=u,o.m=5,Uu(o),zi(o)}function Uu(o){o.A||(o.A=!0,k(o,"complete"),k(o,"error"))}t.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,k(this,"complete"),k(this,"abort"),zi(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),zi(this,!0)),Je.aa.N.call(this)},t.Ea=function(){this.s||(this.B||this.u||this.j?Bu(this):this.bb())},t.bb=function(){Bu(this)};function Bu(o){if(o.h&&typeof a<"u"&&(!o.v[1]||mn(o)!=4||o.Z()!=2)){if(o.u&&mn(o)==4)Te(o.Ea,0,o);else if(k(o,"readystatechange"),mn(o)==4){o.h=!1;try{const X=o.Z();e:switch(X){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break e;default:u=!1}var f;if(!(f=u)){var m;if(m=X===0){var S=String(o.D).match(ku)[1]||null;!S&&l.self&&l.self.location&&(S=l.self.location.protocol.slice(0,-1)),m=!a_.test(S?S.toLowerCase():"")}f=m}if(f)k(o,"complete"),k(o,"success");else{o.m=6;try{var D=2<mn(o)?o.g.statusText:""}catch{D=""}o.l=D+" ["+o.Z()+"]",Uu(o)}}finally{zi(o)}}}}function zi(o,u){if(o.g){ju(o);const f=o.g,m=o.v[0]?()=>{}:null;o.g=null,o.v=null,u||k(o,"ready");try{f.onreadystatechange=m}catch{}}}function ju(o){o.I&&(l.clearTimeout(o.I),o.I=null)}t.isActive=function(){return!!this.g};function mn(o){return o.g?o.g.readyState:0}t.Z=function(){try{return 2<mn(this)?this.g.status:-1}catch{return-1}},t.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.Oa=function(o){if(this.g){var u=this.g.responseText;return o&&u.indexOf(o)==0&&(u=u.substring(o.length)),Ht(u)}};function $u(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function c_(o){const u={};o=(o.g&&2<=mn(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<o.length;m++){if(U(o[m]))continue;var f=b(o[m]);const S=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const D=u[S]||[];u[S]=D,D.push(f)}I(u,function(m){return m.join(", ")})}t.Ba=function(){return this.m},t.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function xs(o,u,f){return f&&f.internalChannelParams&&f.internalChannelParams[o]||u}function qu(o){this.Aa=0,this.i=[],this.j=new As,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=xs("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=xs("baseRetryDelayMs",5e3,o),this.cb=xs("retryDelaySeedMs",1e4,o),this.Wa=xs("forwardChannelMaxRetries",2,o),this.wa=xs("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new Au(o&&o.concurrentRequestLimit),this.Da=new i_,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}t=qu.prototype,t.la=8,t.G=1,t.connect=function(o,u,f,m){Pt(0),this.W=o,this.H=u||{},f&&m!==void 0&&(this.H.OSID=f,this.H.OAID=m),this.F=this.X,this.I=Xu(this,null,this.W),Ki(this)};function Fa(o){if(Hu(o),o.G==3){var u=o.U++,f=pn(o.I);if(ze(f,"SID",o.K),ze(f,"RID",u),ze(f,"TYPE","terminate"),Ds(o,f),u=new Nn(o,o.j,u),u.L=2,u.v=$i(pn(f)),f=!1,l.navigator&&l.navigator.sendBeacon)try{f=l.navigator.sendBeacon(u.v.toString(),"")}catch{}!f&&l.Image&&(new Image().src=u.v,f=!0),f||(u.g=Zu(u.j,null),u.g.ea(u.v)),u.F=Date.now(),Ui(u)}Yu(o)}function Wi(o){o.g&&(Ba(o),o.g.cancel(),o.g=null)}function Hu(o){Wi(o),o.u&&(l.clearTimeout(o.u),o.u=null),Gi(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&l.clearTimeout(o.s),o.s=null)}function Ki(o){if(!bu(o.h)&&!o.s){o.s=!0;var u=o.Ga;ve||ke(),Ee||(ve(),Ee=!0),St.add(u,o),o.B=0}}function u_(o,u){return Ru(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=u.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=Is(g(o.Ga,o,u),Ju(o,o.B)),o.B++,!0)}t.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const S=new Nn(this,this.j,o);let D=this.o;if(this.S&&(D?(D=v(D),A(D,this.S)):D=this.S),this.m!==null||this.O||(S.H=D,D=null),this.P)e:{for(var u=0,f=0;f<this.i.length;f++){t:{var m=this.i[f];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break t}m=void 0}if(m===void 0)break;if(u+=m,4096<u){u=f;break e}if(u===4096||f===this.i.length-1){u=f+1;break e}}u=1e3}else u=1e3;u=Wu(this,S,u),f=pn(this.I),ze(f,"RID",o),ze(f,"CVER",22),this.D&&ze(f,"X-HTTP-Session-Id",this.D),Ds(this,f),D&&(this.O?u="headers="+encodeURIComponent(String(Lu(D)))+"&"+u:this.m&&La(f,this.m,D)),Ma(this.h,S),this.Ua&&ze(f,"TYPE","init"),this.P?(ze(f,"$req",u),ze(f,"SID","null"),S.T=!0,Da(S,f,null)):Da(S,f,u),this.G=2}}else this.G==3&&(o?zu(this,o):this.i.length==0||bu(this.h)||zu(this))};function zu(o,u){var f;u?f=u.l:f=o.U++;const m=pn(o.I);ze(m,"SID",o.K),ze(m,"RID",f),ze(m,"AID",o.T),Ds(o,m),o.m&&o.o&&La(m,o.m,o.o),f=new Nn(o,o.j,f,o.B+1),o.m===null&&(f.H=o.o),u&&(o.i=u.D.concat(o.i)),u=Wu(o,f,1e3),f.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),Ma(o.h,f),Da(f,m,u)}function Ds(o,u){o.H&&ye(o.H,function(f,m){ze(u,m,f)}),o.l&&Cu({},function(f,m){ze(u,m,f)})}function Wu(o,u,f){f=Math.min(o.i.length,f);var m=o.l?g(o.l.Na,o.l,o):null;e:{var S=o.i;let D=-1;for(;;){const X=["count="+f];D==-1?0<f?(D=S[0].g,X.push("ofs="+D)):D=0:X.push("ofs="+D);let $e=!0;for(let lt=0;lt<f;lt++){let xe=S[lt].g;const _t=S[lt].map;if(xe-=D,0>xe)D=Math.max(0,S[lt].g-100),$e=!1;else try{o_(_t,X,"req"+xe+"_")}catch{m&&m(_t)}}if($e){m=X.join("&");break e}}}return o=o.i.splice(0,f),u.D=o,m}function Ku(o){if(!o.g&&!o.u){o.Y=1;var u=o.Fa;ve||ke(),Ee||(ve(),Ee=!0),St.add(u,o),o.v=0}}function Ua(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=Is(g(o.Fa,o),Ju(o,o.v)),o.v++,!0)}t.Fa=function(){if(this.u=null,Gu(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=Is(g(this.ab,this),o)}},t.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Pt(10),Wi(this),Gu(this))};function Ba(o){o.A!=null&&(l.clearTimeout(o.A),o.A=null)}function Gu(o){o.g=new Nn(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var u=pn(o.qa);ze(u,"RID","rpc"),ze(u,"SID",o.K),ze(u,"AID",o.T),ze(u,"CI",o.F?"0":"1"),!o.F&&o.ja&&ze(u,"TO",o.ja),ze(u,"TYPE","xmlhttp"),Ds(o,u),o.m&&o.o&&La(u,o.m,o.o),o.L&&(o.g.I=o.L);var f=o.g;o=o.ia,f.L=1,f.v=$i(pn(u)),f.m=null,f.P=!0,wu(f,o)}t.Za=function(){this.C!=null&&(this.C=null,Wi(this),Ua(this),Pt(19))};function Gi(o){o.C!=null&&(l.clearTimeout(o.C),o.C=null)}function Qu(o,u){var f=null;if(o.g==u){Gi(o),Ba(o),o.g=null;var m=2}else if(Oa(o.h,u))f=u.D,Su(o.h,u),m=1;else return;if(o.G!=0){if(u.o)if(m==1){f=u.m?u.m.length:0,u=Date.now()-u.F;var S=o.B;m=Mi(),k(m,new _u(m,f)),Ki(o)}else Ku(o);else if(S=u.s,S==3||S==0&&0<u.X||!(m==1&&u_(o,u)||m==2&&Ua(o)))switch(f&&0<f.length&&(u=o.h,u.i=u.i.concat(f)),S){case 1:dr(o,5);break;case 4:dr(o,10);break;case 3:dr(o,6);break;default:dr(o,2)}}}function Ju(o,u){let f=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(f*=2),f*u}function dr(o,u){if(o.j.info("Error code "+u),u==2){var f=g(o.fb,o),m=o.Xa;const S=!m;m=new hr(m||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||Bi(m,"https"),$i(m),S?r_(m.toString(),f):s_(m.toString(),f)}else Pt(2);o.G=0,o.l&&o.l.sa(u),Yu(o),Hu(o)}t.fb=function(o){o?(this.j.info("Successfully pinged google.com"),Pt(2)):(this.j.info("Failed to ping google.com"),Pt(1))};function Yu(o){if(o.G=0,o.ka=[],o.l){const u=Pu(o.h);(u.length!=0||o.i.length!=0)&&(L(o.ka,u),L(o.ka,o.i),o.h.i.length=0,N(o.i),o.i.length=0),o.l.ra()}}function Xu(o,u,f){var m=f instanceof hr?pn(f):new hr(f);if(m.g!="")u&&(m.g=u+"."+m.g),ji(m,m.s);else{var S=l.location;m=S.protocol,u=u?u+"."+S.hostname:S.hostname,S=+S.port;var D=new hr(null);m&&Bi(D,m),u&&(D.g=u),S&&ji(D,S),f&&(D.l=f),m=D}return f=o.D,u=o.ya,f&&u&&ze(m,f,u),ze(m,"VER",o.la),Ds(o,m),m}function Zu(o,u,f){if(u&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return u=o.Ca&&!o.pa?new Je(new qi({eb:f})):new Je(o.pa),u.Ha(o.J),u}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function eh(){}t=eh.prototype,t.ua=function(){},t.ta=function(){},t.sa=function(){},t.ra=function(){},t.isActive=function(){return!0},t.Na=function(){};function Qi(){}Qi.prototype.g=function(o,u){return new Mt(o,u)};function Mt(o,u){R.call(this),this.g=new qu(u),this.l=o,this.h=u&&u.messageUrlParams||null,o=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(o?o["X-WebChannel-Content-Type"]=u.messageContentType:o={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.va&&(o?o["X-WebChannel-Client-Profile"]=u.va:o={"X-WebChannel-Client-Profile":u.va}),this.g.S=o,(o=u&&u.Sb)&&!U(o)&&(this.g.m=o),this.v=u&&u.supportsCrossDomainXhr||!1,this.u=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!U(u)&&(this.g.D=u,o=this.h,o!==null&&u in o&&(o=this.h,u in o&&delete o[u])),this.j=new Nr(this)}x(Mt,R),Mt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Mt.prototype.close=function(){Fa(this.g)},Mt.prototype.o=function(o){var u=this.g;if(typeof o=="string"){var f={};f.__data__=o,o=f}else this.u&&(f={},f.__data__=rt(o),o=f);u.i.push(new Kg(u.Ya++,o)),u.G==3&&Ki(u)},Mt.prototype.N=function(){this.g.l=null,delete this.j,Fa(this.g),delete this.g,Mt.aa.N.call(this)};function th(o){Pa.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var u=o.__sm__;if(u){e:{for(const f in u){o=f;break e}o=void 0}(this.i=o)&&(o=this.i,u=u!==null&&o in u?u[o]:void 0),this.data=u}else this.data=o}x(th,Pa);function nh(){Ca.call(this),this.status=1}x(nh,Ca);function Nr(o){this.g=o}x(Nr,eh),Nr.prototype.ua=function(){k(this.g,"a")},Nr.prototype.ta=function(o){k(this.g,new th(o))},Nr.prototype.sa=function(o){k(this.g,new nh)},Nr.prototype.ra=function(){k(this.g,"b")},Qi.prototype.createWebChannel=Qi.prototype.g,Mt.prototype.send=Mt.prototype.o,Mt.prototype.open=Mt.prototype.m,Mt.prototype.close=Mt.prototype.close,Kp=function(){return new Qi},Wp=function(){return Mi()},zp=cr,Ol={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Li.NO_ERROR=0,Li.TIMEOUT=8,Li.HTTP_ERROR=6,po=Li,yu.COMPLETE="complete",Hp=yu,fu.EventType=ws,ws.OPEN="a",ws.CLOSE="b",ws.ERROR="c",ws.MESSAGE="d",R.prototype.listen=R.prototype.K,Fs=fu,Je.prototype.listenOnce=Je.prototype.L,Je.prototype.getLastError=Je.prototype.Ka,Je.prototype.getLastErrorCode=Je.prototype.Ba,Je.prototype.getStatus=Je.prototype.Z,Je.prototype.getResponseJson=Je.prototype.Oa,Je.prototype.getResponseText=Je.prototype.oa,Je.prototype.send=Je.prototype.ea,Je.prototype.setWithCredentials=Je.prototype.Ha,qp=Je}).apply(typeof eo<"u"?eo:typeof self<"u"?self:typeof window<"u"?window:{});const od="@firebase/firestore";/**
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
 */const Tr=new wc("@firebase/firestore");function Ms(){return Tr.logLevel}function ie(t,...e){if(Tr.logLevel<=Re.DEBUG){const n=e.map(Ac);Tr.debug(`Firestore (${gs}): ${t}`,...n)}}function Pn(t,...e){if(Tr.logLevel<=Re.ERROR){const n=e.map(Ac);Tr.error(`Firestore (${gs}): ${t}`,...n)}}function ls(t,...e){if(Tr.logLevel<=Re.WARN){const n=e.map(Ac);Tr.warn(`Firestore (${gs}): ${t}`,...n)}}function Ac(t){if(typeof t=="string")return t;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
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
 */function ue(t="Unexpected state"){const e=`FIRESTORE (${gs}) INTERNAL ASSERTION FAILED: `+t;throw Pn(e),new Error(e)}function Be(t,e){t||ue()}function fe(t,e){return t}/**
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
 */const F={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class ne extends Vn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class Yn{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
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
 */class Gp{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class _T{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(Et.UNAUTHENTICATED))}shutdown(){}}class yT{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class vT{constructor(e){this.t=e,this.currentUser=Et.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){Be(this.o===void 0);let r=this.i;const s=c=>this.i!==r?(r=this.i,n(c)):Promise.resolve();let i=new Yn;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Yn,e.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const c=i;e.enqueueRetryable(async()=>{await c.promise,await s(this.currentUser)})},l=c=>{ie("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(c=>l(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?l(c):(ie("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Yn)}},0),a()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?(ie("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(Be(typeof r.accessToken=="string"),new Gp(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Be(e===null||typeof e=="string"),new Et(e)}}class ET{constructor(e,n,r){this.l=e,this.h=n,this.P=r,this.type="FirstParty",this.user=Et.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class wT{constructor(e,n,r){this.l=e,this.h=n,this.P=r}getToken(){return Promise.resolve(new ET(this.l,this.h,this.P))}start(e,n){e.enqueueRetryable(()=>n(Et.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class TT{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class IT{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,n){Be(this.o===void 0);const r=i=>{i.error!=null&&ie("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.R;return this.R=i.token,ie("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?n(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{ie("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):ie("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(Be(typeof n.token=="string"),this.R=n.token,new TT(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function AT(t){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}/**
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
 */class Qp{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const s=AT(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<n&&(r+=e.charAt(s[i]%e.length))}return r}}function Ve(t,e){return t<e?-1:t>e?1:0}function cs(t,e,n){return t.length===e.length&&t.every((r,s)=>n(r,e[s]))}/**
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
 */class st{constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new ne(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new ne(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<-62135596800)throw new ne(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new ne(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return st.fromMillis(Date.now())}static fromDate(e){return st.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*n));return new st(n,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?Ve(this.nanoseconds,e.nanoseconds):Ve(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
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
 */class de{constructor(e){this.timestamp=e}static fromTimestamp(e){return new de(e)}static min(){return new de(new st(0,0))}static max(){return new de(new st(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
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
 */class hi{constructor(e,n,r){n===void 0?n=0:n>e.length&&ue(),r===void 0?r=e.length-n:r>e.length-n&&ue(),this.segments=e,this.offset=n,this.len=r}get length(){return this.len}isEqual(e){return hi.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof hi?e.forEach(r=>{n.push(r)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,r=this.limit();n<r;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const r=Math.min(e.length,n.length);for(let s=0;s<r;s++){const i=e.get(s),a=n.get(s);if(i<a)return-1;if(i>a)return 1}return e.length<n.length?-1:e.length>n.length?1:0}}class We extends hi{construct(e,n,r){return new We(e,n,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const n=[];for(const r of e){if(r.indexOf("//")>=0)throw new ne(F.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);n.push(...r.split("/").filter(s=>s.length>0))}return new We(n)}static emptyPath(){return new We([])}}const bT=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class dt extends hi{construct(e,n,r){return new dt(e,n,r)}static isValidIdentifier(e){return bT.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),dt.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new dt(["__name__"])}static fromServerFormat(e){const n=[];let r="",s=0;const i=()=>{if(r.length===0)throw new ne(F.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let a=!1;for(;s<e.length;){const l=e[s];if(l==="\\"){if(s+1===e.length)throw new ne(F.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new ne(F.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=c,s+=2}else l==="`"?(a=!a,s++):l!=="."||a?(r+=l,s++):(i(),s++)}if(i(),a)throw new ne(F.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new dt(n)}static emptyPath(){return new dt([])}}/**
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
 */class ae{constructor(e){this.path=e}static fromPath(e){return new ae(We.fromString(e))}static fromName(e){return new ae(We.fromString(e).popFirst(5))}static empty(){return new ae(We.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&We.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return We.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new ae(new We(e.slice()))}}function RT(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,s=de.fromTimestamp(r===1e9?new st(n+1,0):new st(n,r));return new nr(s,ae.empty(),e)}function ST(t){return new nr(t.readTime,t.key,-1)}class nr{constructor(e,n,r){this.readTime=e,this.documentKey=n,this.largestBatchId=r}static min(){return new nr(de.min(),ae.empty(),-1)}static max(){return new nr(de.max(),ae.empty(),-1)}}function PT(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=ae.comparator(t.documentKey,e.documentKey),n!==0?n:Ve(t.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const CT="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class kT{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
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
 */async function Ai(t){if(t.code!==F.FAILED_PRECONDITION||t.message!==CT)throw t;ie("LocalStore","Unexpectedly lost primary lease")}/**
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
 */class ${constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&ue(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new $((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(n,i).next(r,s)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{const n=e();return n instanceof $?n:$.resolve(n)}catch(n){return $.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):$.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):$.reject(n)}static resolve(e){return new $((n,r)=>{n(e)})}static reject(e){return new $((n,r)=>{r(e)})}static waitFor(e){return new $((n,r)=>{let s=0,i=0,a=!1;e.forEach(l=>{++s,l.next(()=>{++i,a&&i===s&&n()},c=>r(c))}),a=!0,i===s&&n()})}static or(e){let n=$.resolve(!1);for(const r of e)n=n.next(s=>s?$.resolve(s):r());return n}static forEach(e,n){const r=[];return e.forEach((s,i)=>{r.push(n.call(this,s,i))}),this.waitFor(r)}static mapArray(e,n){return new $((r,s)=>{const i=e.length,a=new Array(i);let l=0;for(let c=0;c<i;c++){const h=c;n(e[h]).next(d=>{a[h]=d,++l,l===i&&r(a)},d=>s(d))}})}static doWhile(e,n){return new $((r,s)=>{const i=()=>{e()===!0?n().next(()=>{i()},s):r()};i()})}}function xT(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function bi(t){return t.name==="IndexedDbTransactionError"}/**
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
 */class bc{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=r=>this.ie(r),this.se=r=>n.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}bc.oe=-1;function oa(t){return t==null}function Vo(t){return t===0&&1/t==-1/0}function DT(t){return typeof t=="number"&&Number.isInteger(t)&&!Vo(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}/**
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
 */function ad(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function Cr(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function Jp(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}/**
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
 */class Qe{constructor(e,n){this.comparator=e,this.root=n||ct.EMPTY}insert(e,n){return new Qe(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,ct.BLACK,null,null))}remove(e){return new Qe(this.comparator,this.root.remove(e,this.comparator).copy(null,null,ct.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(r===0)return n.value;r<0?n=n.left:r>0&&(n=n.right)}return null}indexOf(e){let n=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return n+r.left.size;s<0?r=r.left:(n+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,r)=>(e(n,r),!1))}toString(){const e=[];return this.inorderTraversal((n,r)=>(e.push(`${n}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new to(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new to(this.root,e,this.comparator,!1)}getReverseIterator(){return new to(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new to(this.root,e,this.comparator,!0)}}class to{constructor(e,n,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=n?r(e.key,n):1,n&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class ct{constructor(e,n,r,s,i){this.key=e,this.value=n,this.color=r??ct.RED,this.left=s??ct.EMPTY,this.right=i??ct.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,r,s,i){return new ct(e??this.key,n??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,n,r),null):i===0?s.copy(null,n,null,null,null):s.copy(null,null,null,null,s.right.insert(e,n,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return ct.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let r,s=this;if(n(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,n),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),n(e,s.key)===0){if(s.right.isEmpty())return ct.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,n))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,ct.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,ct.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw ue();const e=this.left.check();if(e!==this.right.check())throw ue();return e+(this.isRed()?0:1)}}ct.EMPTY=null,ct.RED=!0,ct.BLACK=!1;ct.EMPTY=new class{constructor(){this.size=0}get key(){throw ue()}get value(){throw ue()}get color(){throw ue()}get left(){throw ue()}get right(){throw ue()}copy(e,n,r,s,i){return this}insert(e,n,r){return new ct(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
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
 */class pt{constructor(e){this.comparator=e,this.data=new Qe(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,r)=>(e(n),!1))}forEachInRange(e,n){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;n(s.key)}}forEachWhile(e,n){let r;for(r=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new ld(this.data.getIterator())}getIteratorFrom(e){return new ld(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(r=>{n=n.add(r)}),n}isEqual(e){if(!(e instanceof pt)||this.size!==e.size)return!1;const n=this.data.getIterator(),r=e.data.getIterator();for(;n.hasNext();){const s=n.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(n=>{e.push(n)}),e}toString(){const e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){const n=new pt(this.comparator);return n.data=e,n}}class ld{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jt{constructor(e){this.fields=e,e.sort(dt.comparator)}static empty(){return new jt([])}unionWith(e){let n=new pt(dt.comparator);for(const r of this.fields)n=n.add(r);for(const r of e)n=n.add(r);return new jt(n.toArray())}covers(e){for(const n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return cs(this.fields,e.fields,(n,r)=>n.isEqual(r))}}/**
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
 */class Yp extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mt{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new Yp("Invalid base64 string: "+i):i}}(e);return new mt(n)}static fromUint8Array(e){const n=function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i}(e);return new mt(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const r=new Uint8Array(n.length);for(let s=0;s<n.length;s++)r[s]=n.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Ve(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}mt.EMPTY_BYTE_STRING=new mt("");const VT=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function rr(t){if(Be(!!t),typeof t=="string"){let e=0;const n=VT.exec(t);if(Be(!!n),n[1]){let s=n[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:Ye(t.seconds),nanos:Ye(t.nanos)}}function Ye(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function Ir(t){return typeof t=="string"?mt.fromBase64String(t):mt.fromUint8Array(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rc(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="server_timestamp"}function Sc(t){const e=t.mapValue.fields.__previous_value__;return Rc(e)?Sc(e):e}function di(t){const e=rr(t.mapValue.fields.__local_write_time__.timestampValue);return new st(e.seconds,e.nanos)}/**
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
 */class NT{constructor(e,n,r,s,i,a,l,c,h){this.databaseId=e,this.appId=n,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=l,this.longPollingOptions=c,this.useFetchStreams=h}}class fi{constructor(e,n){this.projectId=e,this.database=n||"(default)"}static empty(){return new fi("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof fi&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const no={mapValue:{fields:{__type__:{stringValue:"__max__"}}}};function Ar(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?Rc(t)?4:MT(t)?9007199254740991:OT(t)?10:11:ue()}function dn(t,e){if(t===e)return!0;const n=Ar(t);if(n!==Ar(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return di(t).isEqual(di(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const a=rr(s.timestampValue),l=rr(i.timestampValue);return a.seconds===l.seconds&&a.nanos===l.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(s,i){return Ir(s.bytesValue).isEqual(Ir(i.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(s,i){return Ye(s.geoPointValue.latitude)===Ye(i.geoPointValue.latitude)&&Ye(s.geoPointValue.longitude)===Ye(i.geoPointValue.longitude)}(t,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return Ye(s.integerValue)===Ye(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const a=Ye(s.doubleValue),l=Ye(i.doubleValue);return a===l?Vo(a)===Vo(l):isNaN(a)&&isNaN(l)}return!1}(t,e);case 9:return cs(t.arrayValue.values||[],e.arrayValue.values||[],dn);case 10:case 11:return function(s,i){const a=s.mapValue.fields||{},l=i.mapValue.fields||{};if(ad(a)!==ad(l))return!1;for(const c in a)if(a.hasOwnProperty(c)&&(l[c]===void 0||!dn(a[c],l[c])))return!1;return!0}(t,e);default:return ue()}}function pi(t,e){return(t.values||[]).find(n=>dn(n,e))!==void 0}function us(t,e){if(t===e)return 0;const n=Ar(t),r=Ar(e);if(n!==r)return Ve(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return Ve(t.booleanValue,e.booleanValue);case 2:return function(i,a){const l=Ye(i.integerValue||i.doubleValue),c=Ye(a.integerValue||a.doubleValue);return l<c?-1:l>c?1:l===c?0:isNaN(l)?isNaN(c)?0:-1:1}(t,e);case 3:return cd(t.timestampValue,e.timestampValue);case 4:return cd(di(t),di(e));case 5:return Ve(t.stringValue,e.stringValue);case 6:return function(i,a){const l=Ir(i),c=Ir(a);return l.compareTo(c)}(t.bytesValue,e.bytesValue);case 7:return function(i,a){const l=i.split("/"),c=a.split("/");for(let h=0;h<l.length&&h<c.length;h++){const d=Ve(l[h],c[h]);if(d!==0)return d}return Ve(l.length,c.length)}(t.referenceValue,e.referenceValue);case 8:return function(i,a){const l=Ve(Ye(i.latitude),Ye(a.latitude));return l!==0?l:Ve(Ye(i.longitude),Ye(a.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return ud(t.arrayValue,e.arrayValue);case 10:return function(i,a){var l,c,h,d;const p=i.fields||{},g=a.fields||{},y=(l=p.value)===null||l===void 0?void 0:l.arrayValue,x=(c=g.value)===null||c===void 0?void 0:c.arrayValue,N=Ve(((h=y==null?void 0:y.values)===null||h===void 0?void 0:h.length)||0,((d=x==null?void 0:x.values)===null||d===void 0?void 0:d.length)||0);return N!==0?N:ud(y,x)}(t.mapValue,e.mapValue);case 11:return function(i,a){if(i===no.mapValue&&a===no.mapValue)return 0;if(i===no.mapValue)return 1;if(a===no.mapValue)return-1;const l=i.fields||{},c=Object.keys(l),h=a.fields||{},d=Object.keys(h);c.sort(),d.sort();for(let p=0;p<c.length&&p<d.length;++p){const g=Ve(c[p],d[p]);if(g!==0)return g;const y=us(l[c[p]],h[d[p]]);if(y!==0)return y}return Ve(c.length,d.length)}(t.mapValue,e.mapValue);default:throw ue()}}function cd(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return Ve(t,e);const n=rr(t),r=rr(e),s=Ve(n.seconds,r.seconds);return s!==0?s:Ve(n.nanos,r.nanos)}function ud(t,e){const n=t.values||[],r=e.values||[];for(let s=0;s<n.length&&s<r.length;++s){const i=us(n[s],r[s]);if(i)return i}return Ve(n.length,r.length)}function hs(t){return Ml(t)}function Ml(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){const r=rr(n);return`time(${r.seconds},${r.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return Ir(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return ae.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let r="[",s=!0;for(const i of n.values||[])s?s=!1:r+=",",r+=Ml(i);return r+"]"}(t.arrayValue):"mapValue"in t?function(n){const r=Object.keys(n.fields||{}).sort();let s="{",i=!0;for(const a of r)i?i=!1:s+=",",s+=`${a}:${Ml(n.fields[a])}`;return s+"}"}(t.mapValue):ue()}function hd(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function Ll(t){return!!t&&"integerValue"in t}function Pc(t){return!!t&&"arrayValue"in t}function dd(t){return!!t&&"nullValue"in t}function fd(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function mo(t){return!!t&&"mapValue"in t}function OT(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="__vector__"}function Js(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return Cr(t.mapValue.fields,(n,r)=>e.mapValue.fields[n]=Js(r)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=Js(t.arrayValue.values[n]);return e}return Object.assign({},t)}function MT(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
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
 */class Vt{constructor(e){this.value=e}static empty(){return new Vt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let r=0;r<e.length-1;++r)if(n=(n.mapValue.fields||{})[e.get(r)],!mo(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=Js(n)}setAll(e){let n=dt.emptyPath(),r={},s=[];e.forEach((a,l)=>{if(!n.isImmediateParentOf(l)){const c=this.getFieldsMap(n);this.applyChanges(c,r,s),r={},s=[],n=l.popLast()}a?r[l.lastSegment()]=Js(a):s.push(l.lastSegment())});const i=this.getFieldsMap(n);this.applyChanges(i,r,s)}delete(e){const n=this.field(e.popLast());mo(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return dn(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=n.mapValue.fields[e.get(r)];mo(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},n.mapValue.fields[e.get(r)]=s),n=s}return n.mapValue.fields}applyChanges(e,n,r){Cr(n,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new Vt(Js(this.value))}}function Xp(t){const e=[];return Cr(t.fields,(n,r)=>{const s=new dt([n]);if(mo(r)){const i=Xp(r.mapValue).fields;if(i.length===0)e.push(s);else for(const a of i)e.push(s.child(a))}else e.push(s)}),new jt(e)}/**
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
 */class Tt{constructor(e,n,r,s,i,a,l){this.key=e,this.documentType=n,this.version=r,this.readTime=s,this.createTime=i,this.data=a,this.documentState=l}static newInvalidDocument(e){return new Tt(e,0,de.min(),de.min(),de.min(),Vt.empty(),0)}static newFoundDocument(e,n,r,s){return new Tt(e,1,n,de.min(),r,s,0)}static newNoDocument(e,n){return new Tt(e,2,n,de.min(),de.min(),Vt.empty(),0)}static newUnknownDocument(e,n){return new Tt(e,3,n,de.min(),de.min(),Vt.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(de.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Vt.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Vt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=de.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Tt&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Tt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class No{constructor(e,n){this.position=e,this.inclusive=n}}function pd(t,e,n){let r=0;for(let s=0;s<t.position.length;s++){const i=e[s],a=t.position[s];if(i.field.isKeyField()?r=ae.comparator(ae.fromName(a.referenceValue),n.key):r=us(a,n.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function md(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!dn(t.position[n],e.position[n]))return!1;return!0}/**
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
 */class mi{constructor(e,n="asc"){this.field=e,this.dir=n}}function LT(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}/**
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
 */class Zp{}class et extends Zp{constructor(e,n,r){super(),this.field=e,this.op=n,this.value=r}static create(e,n,r){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,r):new UT(e,n,r):n==="array-contains"?new $T(e,r):n==="in"?new qT(e,r):n==="not-in"?new HT(e,r):n==="array-contains-any"?new zT(e,r):new et(e,n,r)}static createKeyFieldInFilter(e,n,r){return n==="in"?new BT(e,r):new jT(e,r)}matches(e){const n=e.data.field(this.field);return this.op==="!="?n!==null&&this.matchesComparison(us(n,this.value)):n!==null&&Ar(this.value)===Ar(n)&&this.matchesComparison(us(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return ue()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Zt extends Zp{constructor(e,n){super(),this.filters=e,this.op=n,this.ae=null}static create(e,n){return new Zt(e,n)}matches(e){return em(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function em(t){return t.op==="and"}function tm(t){return FT(t)&&em(t)}function FT(t){for(const e of t.filters)if(e instanceof Zt)return!1;return!0}function Fl(t){if(t instanceof et)return t.field.canonicalString()+t.op.toString()+hs(t.value);if(tm(t))return t.filters.map(e=>Fl(e)).join(",");{const e=t.filters.map(n=>Fl(n)).join(",");return`${t.op}(${e})`}}function nm(t,e){return t instanceof et?function(r,s){return s instanceof et&&r.op===s.op&&r.field.isEqual(s.field)&&dn(r.value,s.value)}(t,e):t instanceof Zt?function(r,s){return s instanceof Zt&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,a,l)=>i&&nm(a,s.filters[l]),!0):!1}(t,e):void ue()}function rm(t){return t instanceof et?function(n){return`${n.field.canonicalString()} ${n.op} ${hs(n.value)}`}(t):t instanceof Zt?function(n){return n.op.toString()+" {"+n.getFilters().map(rm).join(" ,")+"}"}(t):"Filter"}class UT extends et{constructor(e,n,r){super(e,n,r),this.key=ae.fromName(r.referenceValue)}matches(e){const n=ae.comparator(e.key,this.key);return this.matchesComparison(n)}}class BT extends et{constructor(e,n){super(e,"in",n),this.keys=sm("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}}class jT extends et{constructor(e,n){super(e,"not-in",n),this.keys=sm("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}}function sm(t,e){var n;return(((n=e.arrayValue)===null||n===void 0?void 0:n.values)||[]).map(r=>ae.fromName(r.referenceValue))}class $T extends et{constructor(e,n){super(e,"array-contains",n)}matches(e){const n=e.data.field(this.field);return Pc(n)&&pi(n.arrayValue,this.value)}}class qT extends et{constructor(e,n){super(e,"in",n)}matches(e){const n=e.data.field(this.field);return n!==null&&pi(this.value.arrayValue,n)}}class HT extends et{constructor(e,n){super(e,"not-in",n)}matches(e){if(pi(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const n=e.data.field(this.field);return n!==null&&!pi(this.value.arrayValue,n)}}class zT extends et{constructor(e,n){super(e,"array-contains-any",n)}matches(e){const n=e.data.field(this.field);return!(!Pc(n)||!n.arrayValue.values)&&n.arrayValue.values.some(r=>pi(this.value.arrayValue,r))}}/**
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
 */class WT{constructor(e,n=null,r=[],s=[],i=null,a=null,l=null){this.path=e,this.collectionGroup=n,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=a,this.endAt=l,this.ue=null}}function gd(t,e=null,n=[],r=[],s=null,i=null,a=null){return new WT(t,e,n,r,s,i,a)}function Cc(t){const e=fe(t);if(e.ue===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(r=>Fl(r)).join(","),n+="|ob:",n+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),oa(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(r=>hs(r)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(r=>hs(r)).join(",")),e.ue=n}return e.ue}function kc(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!LT(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!nm(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!md(t.startAt,e.startAt)&&md(t.endAt,e.endAt)}function Ul(t){return ae.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}/**
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
 */class _s{constructor(e,n=null,r=[],s=[],i=null,a="F",l=null,c=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=a,this.startAt=l,this.endAt=c,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function KT(t,e,n,r,s,i,a,l){return new _s(t,e,n,r,s,i,a,l)}function im(t){return new _s(t)}function _d(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function om(t){return t.collectionGroup!==null}function Ys(t){const e=fe(t);if(e.ce===null){e.ce=[];const n=new Set;for(const i of e.explicitOrderBy)e.ce.push(i),n.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let l=new pt(dt.comparator);return a.filters.forEach(c=>{c.getFlattenedFilters().forEach(h=>{h.isInequality()&&(l=l.add(h.field))})}),l})(e).forEach(i=>{n.has(i.canonicalString())||i.isKeyField()||e.ce.push(new mi(i,r))}),n.has(dt.keyField().canonicalString())||e.ce.push(new mi(dt.keyField(),r))}return e.ce}function an(t){const e=fe(t);return e.le||(e.le=GT(e,Ys(t))),e.le}function GT(t,e){if(t.limitType==="F")return gd(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new mi(s.field,i)});const n=t.endAt?new No(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new No(t.startAt.position,t.startAt.inclusive):null;return gd(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}function Bl(t,e){const n=t.filters.concat([e]);return new _s(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function jl(t,e,n){return new _s(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function aa(t,e){return kc(an(t),an(e))&&t.limitType===e.limitType}function am(t){return`${Cc(an(t))}|lt:${t.limitType}`}function Hr(t){return`Query(target=${function(n){let r=n.path.canonicalString();return n.collectionGroup!==null&&(r+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(r+=`, filters: [${n.filters.map(s=>rm(s)).join(", ")}]`),oa(n.limit)||(r+=", limit: "+n.limit),n.orderBy.length>0&&(r+=`, orderBy: [${n.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),n.startAt&&(r+=", startAt: ",r+=n.startAt.inclusive?"b:":"a:",r+=n.startAt.position.map(s=>hs(s)).join(",")),n.endAt&&(r+=", endAt: ",r+=n.endAt.inclusive?"a:":"b:",r+=n.endAt.position.map(s=>hs(s)).join(",")),`Target(${r})`}(an(t))}; limitType=${t.limitType})`}function la(t,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):ae.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(t,e)&&function(r,s){for(const i of Ys(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(t,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(t,e)&&function(r,s){return!(r.startAt&&!function(a,l,c){const h=pd(a,l,c);return a.inclusive?h<=0:h<0}(r.startAt,Ys(r),s)||r.endAt&&!function(a,l,c){const h=pd(a,l,c);return a.inclusive?h>=0:h>0}(r.endAt,Ys(r),s))}(t,e)}function QT(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function lm(t){return(e,n)=>{let r=!1;for(const s of Ys(t)){const i=JT(s,e,n);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function JT(t,e,n){const r=t.field.isKeyField()?ae.comparator(e.key,n.key):function(i,a,l){const c=a.data.field(i),h=l.data.field(i);return c!==null&&h!==null?us(c,h):ue()}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return ue()}}/**
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
 */class ys{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,n){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,n]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,n]);s.push([e,n]),this.innerSize++}delete(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[n]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Cr(this.inner,(n,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return Jp(this.inner)}size(){return this.innerSize}}/**
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
 */const YT=new Qe(ae.comparator);function Cn(){return YT}const cm=new Qe(ae.comparator);function Us(...t){let e=cm;for(const n of t)e=e.insert(n.key,n);return e}function um(t){let e=cm;return t.forEach((n,r)=>e=e.insert(n,r.overlayedDocument)),e}function yr(){return Xs()}function hm(){return Xs()}function Xs(){return new ys(t=>t.toString(),(t,e)=>t.isEqual(e))}const XT=new Qe(ae.comparator),ZT=new pt(ae.comparator);function be(...t){let e=ZT;for(const n of t)e=e.add(n);return e}const eI=new pt(Ve);function tI(){return eI}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xc(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Vo(e)?"-0":e}}function dm(t){return{integerValue:""+t}}function nI(t,e){return DT(e)?dm(e):xc(t,e)}/**
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
 */class ca{constructor(){this._=void 0}}function rI(t,e,n){return t instanceof gi?function(s,i){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Rc(i)&&(i=Sc(i)),i&&(a.fields.__previous_value__=i),{mapValue:a}}(n,e):t instanceof _i?pm(t,e):t instanceof yi?mm(t,e):function(s,i){const a=fm(s,i),l=yd(a)+yd(s.Pe);return Ll(a)&&Ll(s.Pe)?dm(l):xc(s.serializer,l)}(t,e)}function sI(t,e,n){return t instanceof _i?pm(t,e):t instanceof yi?mm(t,e):n}function fm(t,e){return t instanceof Oo?function(r){return Ll(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class gi extends ca{}class _i extends ca{constructor(e){super(),this.elements=e}}function pm(t,e){const n=gm(e);for(const r of t.elements)n.some(s=>dn(s,r))||n.push(r);return{arrayValue:{values:n}}}class yi extends ca{constructor(e){super(),this.elements=e}}function mm(t,e){let n=gm(e);for(const r of t.elements)n=n.filter(s=>!dn(s,r));return{arrayValue:{values:n}}}class Oo extends ca{constructor(e,n){super(),this.serializer=e,this.Pe=n}}function yd(t){return Ye(t.integerValue||t.doubleValue)}function gm(t){return Pc(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}/**
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
 */class iI{constructor(e,n){this.field=e,this.transform=n}}function oI(t,e){return t.field.isEqual(e.field)&&function(r,s){return r instanceof _i&&s instanceof _i||r instanceof yi&&s instanceof yi?cs(r.elements,s.elements,dn):r instanceof Oo&&s instanceof Oo?dn(r.Pe,s.Pe):r instanceof gi&&s instanceof gi}(t.transform,e.transform)}class aI{constructor(e,n){this.version=e,this.transformResults=n}}class $t{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new $t}static exists(e){return new $t(void 0,e)}static updateTime(e){return new $t(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function go(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}class ua{}function _m(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new ha(t.key,$t.none()):new Ri(t.key,t.data,$t.none());{const n=t.data,r=Vt.empty();let s=new pt(dt.comparator);for(let i of e.fields)if(!s.has(i)){let a=n.field(i);a===null&&i.length>1&&(i=i.popLast(),a=n.field(i)),a===null?r.delete(i):r.set(i,a),s=s.add(i)}return new lr(t.key,r,new jt(s.toArray()),$t.none())}}function lI(t,e,n){t instanceof Ri?function(s,i,a){const l=s.value.clone(),c=Ed(s.fieldTransforms,i,a.transformResults);l.setAll(c),i.convertToFoundDocument(a.version,l).setHasCommittedMutations()}(t,e,n):t instanceof lr?function(s,i,a){if(!go(s.precondition,i))return void i.convertToUnknownDocument(a.version);const l=Ed(s.fieldTransforms,i,a.transformResults),c=i.data;c.setAll(ym(s)),c.setAll(l),i.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(t,e,n):function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,n)}function Zs(t,e,n,r){return t instanceof Ri?function(i,a,l,c){if(!go(i.precondition,a))return l;const h=i.value.clone(),d=wd(i.fieldTransforms,c,a);return h.setAll(d),a.convertToFoundDocument(a.version,h).setHasLocalMutations(),null}(t,e,n,r):t instanceof lr?function(i,a,l,c){if(!go(i.precondition,a))return l;const h=wd(i.fieldTransforms,c,a),d=a.data;return d.setAll(ym(i)),d.setAll(h),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),l===null?null:l.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(p=>p.field))}(t,e,n,r):function(i,a,l){return go(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):l}(t,e,n)}function cI(t,e){let n=null;for(const r of t.fieldTransforms){const s=e.data.field(r.field),i=fm(r.transform,s||null);i!=null&&(n===null&&(n=Vt.empty()),n.set(r.field,i))}return n||null}function vd(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&cs(r,s,(i,a)=>oI(i,a))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class Ri extends ua{constructor(e,n,r,s=[]){super(),this.key=e,this.value=n,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class lr extends ua{constructor(e,n,r,s,i=[]){super(),this.key=e,this.data=n,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function ym(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function Ed(t,e,n){const r=new Map;Be(t.length===n.length);for(let s=0;s<n.length;s++){const i=t[s],a=i.transform,l=e.data.field(i.field);r.set(i.field,sI(a,l,n[s]))}return r}function wd(t,e,n){const r=new Map;for(const s of t){const i=s.transform,a=n.data.field(s.field);r.set(s.field,rI(i,a,e))}return r}class ha extends ua{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class uI extends ua{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
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
 */class hI{constructor(e,n,r,s){this.batchId=e,this.localWriteTime=n,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,n){const r=n.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&lI(i,e,r[s])}}applyToLocalView(e,n){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(n=Zs(r,e,n,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(n=Zs(r,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){const r=hm();return this.mutations.forEach(s=>{const i=e.get(s.key),a=i.overlayedDocument;let l=this.applyToLocalView(a,i.mutatedFields);l=n.has(s.key)?null:l;const c=_m(a,l);c!==null&&r.set(s.key,c),a.isValidDocument()||a.convertToNoDocument(de.min())}),r}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),be())}isEqual(e){return this.batchId===e.batchId&&cs(this.mutations,e.mutations,(n,r)=>vd(n,r))&&cs(this.baseMutations,e.baseMutations,(n,r)=>vd(n,r))}}class Dc{constructor(e,n,r,s){this.batch=e,this.commitVersion=n,this.mutationResults=r,this.docVersions=s}static from(e,n,r){Be(e.mutations.length===r.length);let s=function(){return XT}();const i=e.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,r[a].version);return new Dc(e,n,r,s)}}/**
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
 */class dI{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class fI{constructor(e,n){this.count=e,this.unchangedNames=n}}/**
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
 */var Xe,Pe;function pI(t){switch(t){default:return ue();case F.CANCELLED:case F.UNKNOWN:case F.DEADLINE_EXCEEDED:case F.RESOURCE_EXHAUSTED:case F.INTERNAL:case F.UNAVAILABLE:case F.UNAUTHENTICATED:return!1;case F.INVALID_ARGUMENT:case F.NOT_FOUND:case F.ALREADY_EXISTS:case F.PERMISSION_DENIED:case F.FAILED_PRECONDITION:case F.ABORTED:case F.OUT_OF_RANGE:case F.UNIMPLEMENTED:case F.DATA_LOSS:return!0}}function vm(t){if(t===void 0)return Pn("GRPC error has no .code"),F.UNKNOWN;switch(t){case Xe.OK:return F.OK;case Xe.CANCELLED:return F.CANCELLED;case Xe.UNKNOWN:return F.UNKNOWN;case Xe.DEADLINE_EXCEEDED:return F.DEADLINE_EXCEEDED;case Xe.RESOURCE_EXHAUSTED:return F.RESOURCE_EXHAUSTED;case Xe.INTERNAL:return F.INTERNAL;case Xe.UNAVAILABLE:return F.UNAVAILABLE;case Xe.UNAUTHENTICATED:return F.UNAUTHENTICATED;case Xe.INVALID_ARGUMENT:return F.INVALID_ARGUMENT;case Xe.NOT_FOUND:return F.NOT_FOUND;case Xe.ALREADY_EXISTS:return F.ALREADY_EXISTS;case Xe.PERMISSION_DENIED:return F.PERMISSION_DENIED;case Xe.FAILED_PRECONDITION:return F.FAILED_PRECONDITION;case Xe.ABORTED:return F.ABORTED;case Xe.OUT_OF_RANGE:return F.OUT_OF_RANGE;case Xe.UNIMPLEMENTED:return F.UNIMPLEMENTED;case Xe.DATA_LOSS:return F.DATA_LOSS;default:return ue()}}(Pe=Xe||(Xe={}))[Pe.OK=0]="OK",Pe[Pe.CANCELLED=1]="CANCELLED",Pe[Pe.UNKNOWN=2]="UNKNOWN",Pe[Pe.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Pe[Pe.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Pe[Pe.NOT_FOUND=5]="NOT_FOUND",Pe[Pe.ALREADY_EXISTS=6]="ALREADY_EXISTS",Pe[Pe.PERMISSION_DENIED=7]="PERMISSION_DENIED",Pe[Pe.UNAUTHENTICATED=16]="UNAUTHENTICATED",Pe[Pe.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Pe[Pe.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Pe[Pe.ABORTED=10]="ABORTED",Pe[Pe.OUT_OF_RANGE=11]="OUT_OF_RANGE",Pe[Pe.UNIMPLEMENTED=12]="UNIMPLEMENTED",Pe[Pe.INTERNAL=13]="INTERNAL",Pe[Pe.UNAVAILABLE=14]="UNAVAILABLE",Pe[Pe.DATA_LOSS=15]="DATA_LOSS";/**
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
 */function mI(){return new TextEncoder}/**
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
 */const gI=new Er([4294967295,4294967295],0);function Td(t){const e=mI().encode(t),n=new $p;return n.update(e),new Uint8Array(n.digest())}function Id(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Er([n,r],0),new Er([s,i],0)]}class Vc{constructor(e,n,r){if(this.bitmap=e,this.padding=n,this.hashCount=r,n<0||n>=8)throw new Bs(`Invalid padding: ${n}`);if(r<0)throw new Bs(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new Bs(`Invalid hash count: ${r}`);if(e.length===0&&n!==0)throw new Bs(`Invalid padding when bitmap length is 0: ${n}`);this.Ie=8*e.length-n,this.Te=Er.fromNumber(this.Ie)}Ee(e,n,r){let s=e.add(n.multiply(Er.fromNumber(r)));return s.compare(gI)===1&&(s=new Er([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const n=Td(e),[r,s]=Id(n);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);if(!this.de(a))return!1}return!0}static create(e,n,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new Vc(i,s,n);return r.forEach(l=>a.insert(l)),a}insert(e){if(this.Ie===0)return;const n=Td(e),[r,s]=Id(n);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);this.Ae(a)}}Ae(e){const n=Math.floor(e/8),r=e%8;this.bitmap[n]|=1<<r}}class Bs extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
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
 */class da{constructor(e,n,r,s,i){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,n,r){const s=new Map;return s.set(e,Si.createSynthesizedTargetChangeForCurrentChange(e,n,r)),new da(de.min(),s,new Qe(Ve),Cn(),be())}}class Si{constructor(e,n,r,s,i){this.resumeToken=e,this.current=n,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,n,r){return new Si(r,n,be(),be(),be())}}/**
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
 */class _o{constructor(e,n,r,s){this.Re=e,this.removedTargetIds=n,this.key=r,this.Ve=s}}class Em{constructor(e,n){this.targetId=e,this.me=n}}class wm{constructor(e,n,r=mt.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=n,this.resumeToken=r,this.cause=s}}class Ad{constructor(){this.fe=0,this.ge=Rd(),this.pe=mt.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=be(),n=be(),r=be();return this.ge.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:n=n.add(s);break;case 1:r=r.add(s);break;default:ue()}}),new Si(this.pe,this.ye,e,n,r)}Ce(){this.we=!1,this.ge=Rd()}Fe(e,n){this.we=!0,this.ge=this.ge.insert(e,n)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,Be(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class _I{constructor(e){this.Le=e,this.Be=new Map,this.ke=Cn(),this.qe=bd(),this.Qe=new Qe(Ve)}Ke(e){for(const n of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(n,e.Ve):this.Ue(n,e.key,e.Ve);for(const n of e.removedTargetIds)this.Ue(n,e.key,e.Ve)}We(e){this.forEachTarget(e,n=>{const r=this.Ge(n);switch(e.state){case 0:this.ze(n)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(n);break;case 3:this.ze(n)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(n)&&(this.je(n),r.De(e.resumeToken));break;default:ue()}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.Be.forEach((r,s)=>{this.ze(s)&&n(s)})}He(e){const n=e.targetId,r=e.me.count,s=this.Je(n);if(s){const i=s.target;if(Ul(i))if(r===0){const a=new ae(i.path);this.Ue(n,a,Tt.newNoDocument(a,de.min()))}else Be(r===1);else{const a=this.Ye(n);if(a!==r){const l=this.Ze(e),c=l?this.Xe(l,e,a):1;if(c!==0){this.je(n);const h=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(n,h)}}}}}Ze(e){const n=e.me.unchangedNames;if(!n||!n.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=n;let a,l;try{a=Ir(r).toUint8Array()}catch(c){if(c instanceof Yp)return ls("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{l=new Vc(a,s,i)}catch(c){return ls(c instanceof Bs?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return l.Ie===0?null:l}Xe(e,n,r){return n.me.count===r-this.nt(e,n.targetId)?0:2}nt(e,n){const r=this.Le.getRemoteKeysForTarget(n);let s=0;return r.forEach(i=>{const a=this.Le.tt(),l=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(l)||(this.Ue(n,i,null),s++)}),s}rt(e){const n=new Map;this.Be.forEach((i,a)=>{const l=this.Je(a);if(l){if(i.current&&Ul(l.target)){const c=new ae(l.target.path);this.ke.get(c)!==null||this.it(a,c)||this.Ue(a,c,Tt.newNoDocument(c,e))}i.be&&(n.set(a,i.ve()),i.Ce())}});let r=be();this.qe.forEach((i,a)=>{let l=!0;a.forEachWhile(c=>{const h=this.Je(c);return!h||h.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(i))}),this.ke.forEach((i,a)=>a.setReadTime(e));const s=new da(e,n,this.Qe,this.ke,r);return this.ke=Cn(),this.qe=bd(),this.Qe=new Qe(Ve),s}$e(e,n){if(!this.ze(e))return;const r=this.it(e,n.key)?2:0;this.Ge(e).Fe(n.key,r),this.ke=this.ke.insert(n.key,n),this.qe=this.qe.insert(n.key,this.st(n.key).add(e))}Ue(e,n,r){if(!this.ze(e))return;const s=this.Ge(e);this.it(e,n)?s.Fe(n,1):s.Me(n),this.qe=this.qe.insert(n,this.st(n).delete(e)),r&&(this.ke=this.ke.insert(n,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const n=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let n=this.Be.get(e);return n||(n=new Ad,this.Be.set(e,n)),n}st(e){let n=this.qe.get(e);return n||(n=new pt(Ve),this.qe=this.qe.insert(e,n)),n}ze(e){const n=this.Je(e)!==null;return n||ie("WatchChangeAggregator","Detected inactive target",e),n}Je(e){const n=this.Be.get(e);return n&&n.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new Ad),this.Le.getRemoteKeysForTarget(e).forEach(n=>{this.Ue(e,n,null)})}it(e,n){return this.Le.getRemoteKeysForTarget(e).has(n)}}function bd(){return new Qe(ae.comparator)}function Rd(){return new Qe(ae.comparator)}const yI=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),vI=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),EI=(()=>({and:"AND",or:"OR"}))();class wI{constructor(e,n){this.databaseId=e,this.useProto3Json=n}}function $l(t,e){return t.useProto3Json||oa(e)?e:{value:e}}function Mo(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Tm(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function TI(t,e){return Mo(t,e.toTimestamp())}function ln(t){return Be(!!t),de.fromTimestamp(function(n){const r=rr(n);return new st(r.seconds,r.nanos)}(t))}function Nc(t,e){return ql(t,e).canonicalString()}function ql(t,e){const n=function(s){return new We(["projects",s.projectId,"databases",s.database])}(t).child("documents");return e===void 0?n:n.child(e)}function Im(t){const e=We.fromString(t);return Be(Pm(e)),e}function Hl(t,e){return Nc(t.databaseId,e.path)}function ll(t,e){const n=Im(e);if(n.get(1)!==t.databaseId.projectId)throw new ne(F.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new ne(F.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new ae(bm(n))}function Am(t,e){return Nc(t.databaseId,e)}function II(t){const e=Im(t);return e.length===4?We.emptyPath():bm(e)}function zl(t){return new We(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function bm(t){return Be(t.length>4&&t.get(4)==="documents"),t.popFirst(5)}function Sd(t,e,n){return{name:Hl(t,e),fields:n.value.mapValue.fields}}function AI(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:ue()}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(h,d){return h.useProto3Json?(Be(d===void 0||typeof d=="string"),mt.fromBase64String(d||"")):(Be(d===void 0||d instanceof Buffer||d instanceof Uint8Array),mt.fromUint8Array(d||new Uint8Array))}(t,e.targetChange.resumeToken),a=e.targetChange.cause,l=a&&function(h){const d=h.code===void 0?F.UNKNOWN:vm(h.code);return new ne(d,h.message||"")}(a);n=new wm(r,s,i,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=ll(t,r.document.name),i=ln(r.document.updateTime),a=r.document.createTime?ln(r.document.createTime):de.min(),l=new Vt({mapValue:{fields:r.document.fields}}),c=Tt.newFoundDocument(s,i,a,l),h=r.targetIds||[],d=r.removedTargetIds||[];n=new _o(h,d,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=ll(t,r.document),i=r.readTime?ln(r.readTime):de.min(),a=Tt.newNoDocument(s,i),l=r.removedTargetIds||[];n=new _o([],l,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=ll(t,r.document),i=r.removedTargetIds||[];n=new _o([],i,s,null)}else{if(!("filter"in e))return ue();{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,a=new fI(s,i),l=r.targetId;n=new Em(l,a)}}return n}function bI(t,e){let n;if(e instanceof Ri)n={update:Sd(t,e.key,e.value)};else if(e instanceof ha)n={delete:Hl(t,e.key)};else if(e instanceof lr)n={update:Sd(t,e.key,e.data),updateMask:NI(e.fieldMask)};else{if(!(e instanceof uI))return ue();n={verify:Hl(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(r=>function(i,a){const l=a.transform;if(l instanceof gi)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof _i)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof yi)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof Oo)return{fieldPath:a.field.canonicalString(),increment:l.Pe};throw ue()}(0,r))),e.precondition.isNone||(n.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:TI(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:ue()}(t,e.precondition)),n}function RI(t,e){return t&&t.length>0?(Be(e!==void 0),t.map(n=>function(s,i){let a=s.updateTime?ln(s.updateTime):ln(i);return a.isEqual(de.min())&&(a=ln(i)),new aI(a,s.transformResults||[])}(n,e))):[]}function SI(t,e){return{documents:[Am(t,e.path)]}}function PI(t,e){const n={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=Am(t,s);const i=function(h){if(h.length!==0)return Sm(Zt.create(h,"and"))}(e.filters);i&&(n.structuredQuery.where=i);const a=function(h){if(h.length!==0)return h.map(d=>function(g){return{field:zr(g.field),direction:xI(g.dir)}}(d))}(e.orderBy);a&&(n.structuredQuery.orderBy=a);const l=$l(t,e.limit);return l!==null&&(n.structuredQuery.limit=l),e.startAt&&(n.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{_t:n,parent:s}}function CI(t){let e=II(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let s=null;if(r>0){Be(r===1);const d=n.from[0];d.allDescendants?s=d.collectionId:e=e.child(d.collectionId)}let i=[];n.where&&(i=function(p){const g=Rm(p);return g instanceof Zt&&tm(g)?g.getFilters():[g]}(n.where));let a=[];n.orderBy&&(a=function(p){return p.map(g=>function(x){return new mi(Wr(x.field),function(L){switch(L){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(x.direction))}(g))}(n.orderBy));let l=null;n.limit&&(l=function(p){let g;return g=typeof p=="object"?p.value:p,oa(g)?null:g}(n.limit));let c=null;n.startAt&&(c=function(p){const g=!!p.before,y=p.values||[];return new No(y,g)}(n.startAt));let h=null;return n.endAt&&(h=function(p){const g=!p.before,y=p.values||[];return new No(y,g)}(n.endAt)),KT(e,s,a,i,l,"F",c,h)}function kI(t,e){const n=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return ue()}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function Rm(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":const r=Wr(n.unaryFilter.field);return et.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Wr(n.unaryFilter.field);return et.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Wr(n.unaryFilter.field);return et.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Wr(n.unaryFilter.field);return et.create(a,"!=",{nullValue:"NULL_VALUE"});default:return ue()}}(t):t.fieldFilter!==void 0?function(n){return et.create(Wr(n.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return ue()}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return Zt.create(n.compositeFilter.filters.map(r=>Rm(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return ue()}}(n.compositeFilter.op))}(t):ue()}function xI(t){return yI[t]}function DI(t){return vI[t]}function VI(t){return EI[t]}function zr(t){return{fieldPath:t.canonicalString()}}function Wr(t){return dt.fromServerFormat(t.fieldPath)}function Sm(t){return t instanceof et?function(n){if(n.op==="=="){if(fd(n.value))return{unaryFilter:{field:zr(n.field),op:"IS_NAN"}};if(dd(n.value))return{unaryFilter:{field:zr(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(fd(n.value))return{unaryFilter:{field:zr(n.field),op:"IS_NOT_NAN"}};if(dd(n.value))return{unaryFilter:{field:zr(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:zr(n.field),op:DI(n.op),value:n.value}}}(t):t instanceof Zt?function(n){const r=n.getFilters().map(s=>Sm(s));return r.length===1?r[0]:{compositeFilter:{op:VI(n.op),filters:r}}}(t):ue()}function NI(t){const e=[];return t.fields.forEach(n=>e.push(n.canonicalString())),{fieldPaths:e}}function Pm(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}/**
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
 */class Wn{constructor(e,n,r,s,i=de.min(),a=de.min(),l=mt.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=n,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=l,this.expectedCount=c}withSequenceNumber(e){return new Wn(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new Wn(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Wn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Wn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
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
 */class OI{constructor(e){this.ct=e}}function MI(t){const e=CI({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?jl(e,e.limit,"L"):e}/**
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
 */class LI{constructor(){this.un=new FI}addToCollectionParentIndex(e,n){return this.un.add(n),$.resolve()}getCollectionParents(e,n){return $.resolve(this.un.getEntries(n))}addFieldIndex(e,n){return $.resolve()}deleteFieldIndex(e,n){return $.resolve()}deleteAllFieldIndexes(e){return $.resolve()}createTargetIndexes(e,n){return $.resolve()}getDocumentsMatchingTarget(e,n){return $.resolve(null)}getIndexType(e,n){return $.resolve(0)}getFieldIndexes(e,n){return $.resolve([])}getNextCollectionGroupToUpdate(e){return $.resolve(null)}getMinOffset(e,n){return $.resolve(nr.min())}getMinOffsetFromCollectionGroup(e,n){return $.resolve(nr.min())}updateCollectionGroup(e,n,r){return $.resolve()}updateIndexEntries(e,n){return $.resolve()}}class FI{constructor(){this.index={}}add(e){const n=e.lastSegment(),r=e.popLast(),s=this.index[n]||new pt(We.comparator),i=!s.has(r);return this.index[n]=s.add(r),i}has(e){const n=e.lastSegment(),r=e.popLast(),s=this.index[n];return s&&s.has(r)}getEntries(e){return(this.index[e]||new pt(We.comparator)).toArray()}}/**
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
 */class UI{constructor(){this.changes=new ys(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,Tt.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();const r=this.changes.get(n);return r!==void 0?$.resolve(r):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
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
 */class BI{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}}/**
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
 */class jI{constructor(e,n,r,s){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,n){let r=null;return this.documentOverlayCache.getOverlay(e,n).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,n))).next(s=>(r!==null&&Zs(r.mutation,s,jt.empty(),st.now()),s))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.getLocalViewOfDocuments(e,r,be()).next(()=>r))}getLocalViewOfDocuments(e,n,r=be()){const s=yr();return this.populateOverlays(e,s,n).next(()=>this.computeViews(e,n,s,r).next(i=>{let a=Us();return i.forEach((l,c)=>{a=a.insert(l,c.overlayedDocument)}),a}))}getOverlayedDocuments(e,n){const r=yr();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,be()))}populateOverlays(e,n,r){const s=[];return r.forEach(i=>{n.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((a,l)=>{n.set(a,l)})})}computeViews(e,n,r,s){let i=Cn();const a=Xs(),l=function(){return Xs()}();return n.forEach((c,h)=>{const d=r.get(h.key);s.has(h.key)&&(d===void 0||d.mutation instanceof lr)?i=i.insert(h.key,h):d!==void 0?(a.set(h.key,d.mutation.getFieldMask()),Zs(d.mutation,h,d.mutation.getFieldMask(),st.now())):a.set(h.key,jt.empty())}),this.recalculateAndSaveOverlays(e,i).next(c=>(c.forEach((h,d)=>a.set(h,d)),n.forEach((h,d)=>{var p;return l.set(h,new BI(d,(p=a.get(h))!==null&&p!==void 0?p:null))}),l))}recalculateAndSaveOverlays(e,n){const r=Xs();let s=new Qe((a,l)=>a-l),i=be();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(a=>{for(const l of a)l.keys().forEach(c=>{const h=n.get(c);if(h===null)return;let d=r.get(c)||jt.empty();d=l.applyToLocalView(h,d),r.set(c,d);const p=(s.get(l.batchId)||be()).add(c);s=s.insert(l.batchId,p)})}).next(()=>{const a=[],l=s.getReverseIterator();for(;l.hasNext();){const c=l.getNext(),h=c.key,d=c.value,p=hm();d.forEach(g=>{if(!i.has(g)){const y=_m(n.get(g),r.get(g));y!==null&&p.set(g,y),i=i.add(g)}}),a.push(this.documentOverlayCache.saveOverlays(e,h,p))}return $.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,n,r,s){return function(a){return ae.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):om(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,r,s):this.getDocumentsMatchingCollectionQuery(e,n,r,s)}getNextDocuments(e,n,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,r,s).next(i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,r.largestBatchId,s-i.size):$.resolve(yr());let l=-1,c=i;return a.next(h=>$.forEach(h,(d,p)=>(l<p.largestBatchId&&(l=p.largestBatchId),i.get(d)?$.resolve():this.remoteDocumentCache.getEntry(e,d).next(g=>{c=c.insert(d,g)}))).next(()=>this.populateOverlays(e,h,i)).next(()=>this.computeViews(e,c,h,be())).next(d=>({batchId:l,changes:um(d)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new ae(n)).next(r=>{let s=Us();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,n,r,s){const i=n.collectionGroup;let a=Us();return this.indexManager.getCollectionParents(e,i).next(l=>$.forEach(l,c=>{const h=function(p,g){return new _s(g,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(n,c.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,r,s).next(d=>{d.forEach((p,g)=>{a=a.insert(p,g)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,n,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,r.largestBatchId).next(a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,r,i,s))).next(a=>{i.forEach((c,h)=>{const d=h.getKey();a.get(d)===null&&(a=a.insert(d,Tt.newInvalidDocument(d)))});let l=Us();return a.forEach((c,h)=>{const d=i.get(c);d!==void 0&&Zs(d.mutation,h,jt.empty(),st.now()),la(n,h)&&(l=l.insert(c,h))}),l})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $I{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,n){return $.resolve(this.hr.get(n))}saveBundleMetadata(e,n){return this.hr.set(n.id,function(s){return{id:s.id,version:s.version,createTime:ln(s.createTime)}}(n)),$.resolve()}getNamedQuery(e,n){return $.resolve(this.Pr.get(n))}saveNamedQuery(e,n){return this.Pr.set(n.name,function(s){return{name:s.name,query:MI(s.bundledQuery),readTime:ln(s.readTime)}}(n)),$.resolve()}}/**
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
 */class qI{constructor(){this.overlays=new Qe(ae.comparator),this.Ir=new Map}getOverlay(e,n){return $.resolve(this.overlays.get(n))}getOverlays(e,n){const r=yr();return $.forEach(n,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,n,r){return r.forEach((s,i)=>{this.ht(e,n,i)}),$.resolve()}removeOverlaysForBatchId(e,n,r){const s=this.Ir.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(r)),$.resolve()}getOverlaysForCollection(e,n,r){const s=yr(),i=n.length+1,a=new ae(n.child("")),l=this.overlays.getIteratorFrom(a);for(;l.hasNext();){const c=l.getNext().value,h=c.getKey();if(!n.isPrefixOf(h.path))break;h.path.length===i&&c.largestBatchId>r&&s.set(c.getKey(),c)}return $.resolve(s)}getOverlaysForCollectionGroup(e,n,r,s){let i=new Qe((h,d)=>h-d);const a=this.overlays.getIterator();for(;a.hasNext();){const h=a.getNext().value;if(h.getKey().getCollectionGroup()===n&&h.largestBatchId>r){let d=i.get(h.largestBatchId);d===null&&(d=yr(),i=i.insert(h.largestBatchId,d)),d.set(h.getKey(),h)}}const l=yr(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((h,d)=>l.set(h,d)),!(l.size()>=s)););return $.resolve(l)}ht(e,n,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.Ir.get(s.largestBatchId).delete(r.key);this.Ir.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new dI(n,r));let i=this.Ir.get(n);i===void 0&&(i=be(),this.Ir.set(n,i)),this.Ir.set(n,i.add(r.key))}}/**
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
 */class HI{constructor(){this.sessionToken=mt.EMPTY_BYTE_STRING}getSessionToken(e){return $.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,$.resolve()}}/**
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
 */class Oc{constructor(){this.Tr=new pt(it.Er),this.dr=new pt(it.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,n){const r=new it(e,n);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,n){e.forEach(r=>this.addReference(r,n))}removeReference(e,n){this.Vr(new it(e,n))}mr(e,n){e.forEach(r=>this.removeReference(r,n))}gr(e){const n=new ae(new We([])),r=new it(n,e),s=new it(n,e+1),i=[];return this.dr.forEachInRange([r,s],a=>{this.Vr(a),i.push(a.key)}),i}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const n=new ae(new We([])),r=new it(n,e),s=new it(n,e+1);let i=be();return this.dr.forEachInRange([r,s],a=>{i=i.add(a.key)}),i}containsKey(e){const n=new it(e,0),r=this.Tr.firstAfterOrEqual(n);return r!==null&&e.isEqual(r.key)}}class it{constructor(e,n){this.key=e,this.wr=n}static Er(e,n){return ae.comparator(e.key,n.key)||Ve(e.wr,n.wr)}static Ar(e,n){return Ve(e.wr,n.wr)||ae.comparator(e.key,n.key)}}/**
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
 */class zI{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Sr=1,this.br=new pt(it.Er)}checkEmpty(e){return $.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,r,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new hI(i,n,r,s);this.mutationQueue.push(a);for(const l of s)this.br=this.br.add(new it(l.key,i)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return $.resolve(a)}lookupMutationBatch(e,n){return $.resolve(this.Dr(n))}getNextMutationBatchAfterBatchId(e,n){const r=n+1,s=this.vr(r),i=s<0?0:s;return $.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return $.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return $.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){const r=new it(n,0),s=new it(n,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([r,s],a=>{const l=this.Dr(a.wr);i.push(l)}),$.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,n){let r=new pt(Ve);return n.forEach(s=>{const i=new it(s,0),a=new it(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,a],l=>{r=r.add(l.wr)})}),$.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,n){const r=n.path,s=r.length+1;let i=r;ae.isDocumentKey(i)||(i=i.child(""));const a=new it(new ae(i),0);let l=new pt(Ve);return this.br.forEachWhile(c=>{const h=c.key.path;return!!r.isPrefixOf(h)&&(h.length===s&&(l=l.add(c.wr)),!0)},a),$.resolve(this.Cr(l))}Cr(e){const n=[];return e.forEach(r=>{const s=this.Dr(r);s!==null&&n.push(s)}),n}removeMutationBatch(e,n){Be(this.Fr(n.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return $.forEach(n.mutations,s=>{const i=new it(s.key,n.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,n){const r=new it(n,0),s=this.br.firstAfterOrEqual(r);return $.resolve(n.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,$.resolve()}Fr(e,n){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const n=this.vr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}}/**
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
 */class WI{constructor(e){this.Mr=e,this.docs=function(){return new Qe(ae.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){const r=n.key,s=this.docs.get(r),i=s?s.size:0,a=this.Mr(n);return this.docs=this.docs.insert(r,{document:n.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){const r=this.docs.get(n);return $.resolve(r?r.document.mutableCopy():Tt.newInvalidDocument(n))}getEntries(e,n){let r=Cn();return n.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():Tt.newInvalidDocument(s))}),$.resolve(r)}getDocumentsMatchingQuery(e,n,r,s){let i=Cn();const a=n.path,l=new ae(a.child("")),c=this.docs.getIteratorFrom(l);for(;c.hasNext();){const{key:h,value:{document:d}}=c.getNext();if(!a.isPrefixOf(h.path))break;h.path.length>a.length+1||PT(ST(d),r)<=0||(s.has(d.key)||la(n,d))&&(i=i.insert(d.key,d.mutableCopy()))}return $.resolve(i)}getAllFromCollectionGroup(e,n,r,s){ue()}Or(e,n){return $.forEach(this.docs,r=>n(r))}newChangeBuffer(e){return new KI(this)}getSize(e){return $.resolve(this.size)}}class KI extends UI{constructor(e){super(),this.cr=e}applyChanges(e){const n=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?n.push(this.cr.addEntry(e,s)):this.cr.removeEntry(r)}),$.waitFor(n)}getFromCache(e,n){return this.cr.getEntry(e,n)}getAllFromCache(e,n){return this.cr.getEntries(e,n)}}/**
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
 */class GI{constructor(e){this.persistence=e,this.Nr=new ys(n=>Cc(n),kc),this.lastRemoteSnapshotVersion=de.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Oc,this.targetCount=0,this.kr=ds.Bn()}forEachTarget(e,n){return this.Nr.forEach((r,s)=>n(s)),$.resolve()}getLastRemoteSnapshotVersion(e){return $.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return $.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),$.resolve(this.highestTargetId)}setTargetsMetadata(e,n,r){return r&&(this.lastRemoteSnapshotVersion=r),n>this.Lr&&(this.Lr=n),$.resolve()}Kn(e){this.Nr.set(e.target,e);const n=e.targetId;n>this.highestTargetId&&(this.kr=new ds(n),this.highestTargetId=n),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,n){return this.Kn(n),this.targetCount+=1,$.resolve()}updateTargetData(e,n){return this.Kn(n),$.resolve()}removeTargetData(e,n){return this.Nr.delete(n.target),this.Br.gr(n.targetId),this.targetCount-=1,$.resolve()}removeTargets(e,n,r){let s=0;const i=[];return this.Nr.forEach((a,l)=>{l.sequenceNumber<=n&&r.get(l.targetId)===null&&(this.Nr.delete(a),i.push(this.removeMatchingKeysForTargetId(e,l.targetId)),s++)}),$.waitFor(i).next(()=>s)}getTargetCount(e){return $.resolve(this.targetCount)}getTargetData(e,n){const r=this.Nr.get(n)||null;return $.resolve(r)}addMatchingKeys(e,n,r){return this.Br.Rr(n,r),$.resolve()}removeMatchingKeys(e,n,r){this.Br.mr(n,r);const s=this.persistence.referenceDelegate,i=[];return s&&n.forEach(a=>{i.push(s.markPotentiallyOrphaned(e,a))}),$.waitFor(i)}removeMatchingKeysForTargetId(e,n){return this.Br.gr(n),$.resolve()}getMatchingKeysForTargetId(e,n){const r=this.Br.yr(n);return $.resolve(r)}containsKey(e,n){return $.resolve(this.Br.containsKey(n))}}/**
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
 */class QI{constructor(e,n){this.qr={},this.overlays={},this.Qr=new bc(0),this.Kr=!1,this.Kr=!0,this.$r=new HI,this.referenceDelegate=e(this),this.Ur=new GI(this),this.indexManager=new LI,this.remoteDocumentCache=function(s){return new WI(s)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new OI(n),this.Gr=new $I(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new qI,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let r=this.qr[e.toKey()];return r||(r=new zI(n,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,n,r){ie("MemoryPersistence","Starting transaction:",e);const s=new JI(this.Qr.next());return this.referenceDelegate.zr(),r(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(e,n){return $.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,n)))}}class JI extends kT{constructor(e){super(),this.currentSequenceNumber=e}}class Mc{constructor(e){this.persistence=e,this.Jr=new Oc,this.Yr=null}static Zr(e){return new Mc(e)}get Xr(){if(this.Yr)return this.Yr;throw ue()}addReference(e,n,r){return this.Jr.addReference(r,n),this.Xr.delete(r.toString()),$.resolve()}removeReference(e,n,r){return this.Jr.removeReference(r,n),this.Xr.add(r.toString()),$.resolve()}markPotentiallyOrphaned(e,n){return this.Xr.add(n.toString()),$.resolve()}removeTarget(e,n){this.Jr.gr(n.targetId).forEach(s=>this.Xr.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,n.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>r.removeTargetData(e,n))}zr(){this.Yr=new Set}jr(e){const n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return $.forEach(this.Xr,r=>{const s=ae.fromPath(r);return this.ei(e,s).next(i=>{i||n.removeEntry(s,de.min())})}).next(()=>(this.Yr=null,n.apply(e)))}updateLimboDocument(e,n){return this.ei(e,n).next(r=>{r?this.Xr.delete(n.toString()):this.Xr.add(n.toString())})}Wr(e){return 0}ei(e,n){return $.or([()=>$.resolve(this.Jr.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Hr(e,n)])}}/**
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
 */class Lc{constructor(e,n,r,s){this.targetId=e,this.fromCache=n,this.$i=r,this.Ui=s}static Wi(e,n){let r=be(),s=be();for(const i of n.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Lc(e,n.fromCache,r,s)}}/**
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
 */class YI{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class XI{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return XE()?8:xT(bt())>0?6:4}()}initialize(e,n){this.Ji=e,this.indexManager=n,this.Gi=!0}getDocumentsMatchingQuery(e,n,r,s){const i={result:null};return this.Yi(e,n).next(a=>{i.result=a}).next(()=>{if(!i.result)return this.Zi(e,n,s,r).next(a=>{i.result=a})}).next(()=>{if(i.result)return;const a=new YI;return this.Xi(e,n,a).next(l=>{if(i.result=l,this.zi)return this.es(e,n,a,l.size)})}).next(()=>i.result)}es(e,n,r,s){return r.documentReadCount<this.ji?(Ms()<=Re.DEBUG&&ie("QueryEngine","SDK will not create cache indexes for query:",Hr(n),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),$.resolve()):(Ms()<=Re.DEBUG&&ie("QueryEngine","Query:",Hr(n),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Hi*s?(Ms()<=Re.DEBUG&&ie("QueryEngine","The SDK decides to create cache indexes for query:",Hr(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,an(n))):$.resolve())}Yi(e,n){if(_d(n))return $.resolve(null);let r=an(n);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(n.limit!==null&&s===1&&(n=jl(n,null,"F"),r=an(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const a=be(...i);return this.Ji.getDocuments(e,a).next(l=>this.indexManager.getMinOffset(e,r).next(c=>{const h=this.ts(n,l);return this.ns(n,h,a,c.readTime)?this.Yi(e,jl(n,null,"F")):this.rs(e,h,n,c)}))})))}Zi(e,n,r,s){return _d(n)||s.isEqual(de.min())?$.resolve(null):this.Ji.getDocuments(e,r).next(i=>{const a=this.ts(n,i);return this.ns(n,a,r,s)?$.resolve(null):(Ms()<=Re.DEBUG&&ie("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Hr(n)),this.rs(e,a,n,RT(s,-1)).next(l=>l))})}ts(e,n){let r=new pt(lm(e));return n.forEach((s,i)=>{la(e,i)&&(r=r.add(i))}),r}ns(e,n,r,s){if(e.limit===null)return!1;if(r.size!==n.size)return!0;const i=e.limitType==="F"?n.last():n.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(e,n,r){return Ms()<=Re.DEBUG&&ie("QueryEngine","Using full collection scan to execute query:",Hr(n)),this.Ji.getDocumentsMatchingQuery(e,n,nr.min(),r)}rs(e,n,r,s){return this.Ji.getDocumentsMatchingQuery(e,r,s).next(i=>(n.forEach(a=>{i=i.insert(a.key,a)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ZI{constructor(e,n,r,s){this.persistence=e,this.ss=n,this.serializer=s,this.os=new Qe(Ve),this._s=new ys(i=>Cc(i),kc),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new jI(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.os))}}function e0(t,e,n,r){return new ZI(t,e,n,r)}async function Cm(t,e){const n=fe(t);return await n.persistence.runTransaction("Handle user change","readonly",r=>{let s;return n.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,n.ls(e),n.mutationQueue.getAllMutationBatches(r))).next(i=>{const a=[],l=[];let c=be();for(const h of s){a.push(h.batchId);for(const d of h.mutations)c=c.add(d.key)}for(const h of i){l.push(h.batchId);for(const d of h.mutations)c=c.add(d.key)}return n.localDocuments.getDocuments(r,c).next(h=>({hs:h,removedBatchIds:a,addedBatchIds:l}))})})}function t0(t,e){const n=fe(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=n.cs.newChangeBuffer({trackRemovals:!0});return function(l,c,h,d){const p=h.batch,g=p.keys();let y=$.resolve();return g.forEach(x=>{y=y.next(()=>d.getEntry(c,x)).next(N=>{const L=h.docVersions.get(x);Be(L!==null),N.version.compareTo(L)<0&&(p.applyToRemoteDocument(N,h),N.isValidDocument()&&(N.setReadTime(h.commitVersion),d.addEntry(N)))})}),y.next(()=>l.mutationQueue.removeMutationBatch(c,p))}(n,r,e,i).next(()=>i.apply(r)).next(()=>n.mutationQueue.performConsistencyCheck(r)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let c=be();for(let h=0;h<l.mutationResults.length;++h)l.mutationResults[h].transformResults.length>0&&(c=c.add(l.batch.mutations[h].key));return c}(e))).next(()=>n.localDocuments.getDocuments(r,s))})}function km(t){const e=fe(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.Ur.getLastRemoteSnapshotVersion(n))}function n0(t,e){const n=fe(t),r=e.snapshotVersion;let s=n.os;return n.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const a=n.cs.newChangeBuffer({trackRemovals:!0});s=n.os;const l=[];e.targetChanges.forEach((d,p)=>{const g=s.get(p);if(!g)return;l.push(n.Ur.removeMatchingKeys(i,d.removedDocuments,p).next(()=>n.Ur.addMatchingKeys(i,d.addedDocuments,p)));let y=g.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(p)!==null?y=y.withResumeToken(mt.EMPTY_BYTE_STRING,de.min()).withLastLimboFreeSnapshotVersion(de.min()):d.resumeToken.approximateByteSize()>0&&(y=y.withResumeToken(d.resumeToken,r)),s=s.insert(p,y),function(N,L,K){return N.resumeToken.approximateByteSize()===0||L.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=3e8?!0:K.addedDocuments.size+K.modifiedDocuments.size+K.removedDocuments.size>0}(g,y,d)&&l.push(n.Ur.updateTargetData(i,y))});let c=Cn(),h=be();if(e.documentUpdates.forEach(d=>{e.resolvedLimboDocuments.has(d)&&l.push(n.persistence.referenceDelegate.updateLimboDocument(i,d))}),l.push(r0(i,a,e.documentUpdates).next(d=>{c=d.Ps,h=d.Is})),!r.isEqual(de.min())){const d=n.Ur.getLastRemoteSnapshotVersion(i).next(p=>n.Ur.setTargetsMetadata(i,i.currentSequenceNumber,r));l.push(d)}return $.waitFor(l).next(()=>a.apply(i)).next(()=>n.localDocuments.getLocalViewOfDocuments(i,c,h)).next(()=>c)}).then(i=>(n.os=s,i))}function r0(t,e,n){let r=be(),s=be();return n.forEach(i=>r=r.add(i)),e.getEntries(t,r).next(i=>{let a=Cn();return n.forEach((l,c)=>{const h=i.get(l);c.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(l)),c.isNoDocument()&&c.version.isEqual(de.min())?(e.removeEntry(l,c.readTime),a=a.insert(l,c)):!h.isValidDocument()||c.version.compareTo(h.version)>0||c.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(c),a=a.insert(l,c)):ie("LocalStore","Ignoring outdated watch update for ",l,". Current version:",h.version," Watch version:",c.version)}),{Ps:a,Is:s}})}function s0(t,e){const n=fe(t);return n.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),n.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function i0(t,e){const n=fe(t);return n.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return n.Ur.getTargetData(r,e).next(i=>i?(s=i,$.resolve(s)):n.Ur.allocateTargetId(r).next(a=>(s=new Wn(e,a,"TargetPurposeListen",r.currentSequenceNumber),n.Ur.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=n.os.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(n.os=n.os.insert(r.targetId,r),n._s.set(e,r.targetId)),r})}async function Wl(t,e,n){const r=fe(t),s=r.os.get(e),i=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",i,a=>r.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!bi(a))throw a;ie("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}r.os=r.os.remove(e),r._s.delete(s.target)}function Pd(t,e,n){const r=fe(t);let s=de.min(),i=be();return r.persistence.runTransaction("Execute query","readwrite",a=>function(c,h,d){const p=fe(c),g=p._s.get(d);return g!==void 0?$.resolve(p.os.get(g)):p.Ur.getTargetData(h,d)}(r,a,an(e)).next(l=>{if(l)return s=l.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(a,l.targetId).next(c=>{i=c})}).next(()=>r.ss.getDocumentsMatchingQuery(a,e,n?s:de.min(),n?i:be())).next(l=>(o0(r,QT(e),l),{documents:l,Ts:i})))}function o0(t,e,n){let r=t.us.get(e)||de.min();n.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),t.us.set(e,r)}class Cd{constructor(){this.activeTargetIds=tI()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class a0{constructor(){this.so=new Cd,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,r){}addLocalQueryTarget(e,n=!0){return n&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,n,r){this.oo[e]=n}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Cd,Promise.resolve()}handleUserChange(e,n,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class l0{_o(e){}shutdown(){}}/**
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
 */class kd{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){ie("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){ie("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let ro=null;function cl(){return ro===null?ro=function(){return 268435456+Math.round(2147483648*Math.random())}():ro++,"0x"+ro.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const c0={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
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
 */class u0{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
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
 */const vt="WebChannelConnection";class h0 extends class{constructor(n){this.databaseInfo=n,this.databaseId=n.databaseId;const r=n.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+n.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(n,r,s,i,a){const l=cl(),c=this.xo(n,r.toUriEncodedString());ie("RestConnection",`Sending RPC '${n}' ${l}:`,c,s);const h={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(h,i,a),this.No(n,c,h,s).then(d=>(ie("RestConnection",`Received RPC '${n}' ${l}: `,d),d),d=>{throw ls("RestConnection",`RPC '${n}' ${l} failed with error: `,d,"url: ",c,"request:",s),d})}Lo(n,r,s,i,a,l){return this.Mo(n,r,s,i,a)}Oo(n,r,s){n["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+gs}(),n["Content-Type"]="text/plain",this.databaseInfo.appId&&(n["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((i,a)=>n[a]=i),s&&s.headers.forEach((i,a)=>n[a]=i)}xo(n,r){const s=c0[n];return`${this.Do}/v1/${r}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,n,r,s){const i=cl();return new Promise((a,l)=>{const c=new qp;c.setWithCredentials(!0),c.listenOnce(Hp.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case po.NO_ERROR:const d=c.getResponseJson();ie(vt,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(d)),a(d);break;case po.TIMEOUT:ie(vt,`RPC '${e}' ${i} timed out`),l(new ne(F.DEADLINE_EXCEEDED,"Request time out"));break;case po.HTTP_ERROR:const p=c.getStatus();if(ie(vt,`RPC '${e}' ${i} failed with status:`,p,"response text:",c.getResponseText()),p>0){let g=c.getResponseJson();Array.isArray(g)&&(g=g[0]);const y=g==null?void 0:g.error;if(y&&y.status&&y.message){const x=function(L){const K=L.toLowerCase().replace(/_/g,"-");return Object.values(F).indexOf(K)>=0?K:F.UNKNOWN}(y.status);l(new ne(x,y.message))}else l(new ne(F.UNKNOWN,"Server responded with status "+c.getStatus()))}else l(new ne(F.UNAVAILABLE,"Connection failed."));break;default:ue()}}finally{ie(vt,`RPC '${e}' ${i} completed.`)}});const h=JSON.stringify(s);ie(vt,`RPC '${e}' ${i} sending request:`,s),c.send(n,"POST",h,r,15)})}Bo(e,n,r){const s=cl(),i=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=Kp(),l=Wp(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(c.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Oo(c.initMessageHeaders,n,r),c.encodeInitMessageHeaders=!0;const d=i.join("");ie(vt,`Creating RPC '${e}' stream ${s}: ${d}`,c);const p=a.createWebChannel(d,c);let g=!1,y=!1;const x=new u0({Io:L=>{y?ie(vt,`Not sending because RPC '${e}' stream ${s} is closed:`,L):(g||(ie(vt,`Opening RPC '${e}' stream ${s} transport.`),p.open(),g=!0),ie(vt,`RPC '${e}' stream ${s} sending:`,L),p.send(L))},To:()=>p.close()}),N=(L,K,U)=>{L.listen(K,H=>{try{U(H)}catch(J){setTimeout(()=>{throw J},0)}})};return N(p,Fs.EventType.OPEN,()=>{y||(ie(vt,`RPC '${e}' stream ${s} transport opened.`),x.yo())}),N(p,Fs.EventType.CLOSE,()=>{y||(y=!0,ie(vt,`RPC '${e}' stream ${s} transport closed`),x.So())}),N(p,Fs.EventType.ERROR,L=>{y||(y=!0,ls(vt,`RPC '${e}' stream ${s} transport errored:`,L),x.So(new ne(F.UNAVAILABLE,"The operation could not be completed")))}),N(p,Fs.EventType.MESSAGE,L=>{var K;if(!y){const U=L.data[0];Be(!!U);const H=U,J=H.error||((K=H[0])===null||K===void 0?void 0:K.error);if(J){ie(vt,`RPC '${e}' stream ${s} received error:`,J);const ge=J.status;let ye=function(T){const A=Xe[T];if(A!==void 0)return vm(A)}(ge),I=J.message;ye===void 0&&(ye=F.INTERNAL,I="Unknown error status: "+ge+" with message "+J.message),y=!0,x.So(new ne(ye,I)),p.close()}else ie(vt,`RPC '${e}' stream ${s} received:`,U),x.bo(U)}}),N(l,zp.STAT_EVENT,L=>{L.stat===Ol.PROXY?ie(vt,`RPC '${e}' stream ${s} detected buffering proxy`):L.stat===Ol.NOPROXY&&ie(vt,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{x.wo()},0),x}}function ul(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fa(t){return new wI(t,!0)}/**
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
 */class xm{constructor(e,n,r=1e3,s=1.5,i=6e4){this.ui=e,this.timerId=n,this.ko=r,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const n=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),s=Math.max(0,n-r);s>0&&ie("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
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
 */class Dm{constructor(e,n,r,s,i,a,l,c){this.ui=e,this.Ho=r,this.Jo=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=l,this.listener=c,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new xm(e,n)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,n){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():n&&n.code===F.RESOURCE_EXHAUSTED?(Pn(n.toString()),Pn("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):n&&n.code===F.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(n)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),n=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.Yo===n&&this.P_(r,s)},r=>{e(()=>{const s=new ne(F.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(s)})})}P_(e,n){const r=this.h_(this.Yo);this.stream=this.T_(e,n),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{r(()=>this.I_(s))}),this.stream.onMessage(s=>{r(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return ie("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return n=>{this.ui.enqueueAndForget(()=>this.Yo===e?n():(ie("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class d0 extends Dm{constructor(e,n,r,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,r,s,a),this.serializer=i}T_(e,n){return this.connection.Bo("Listen",e,n)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const n=AI(this.serializer,e),r=function(i){if(!("targetChange"in i))return de.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?de.min():a.readTime?ln(a.readTime):de.min()}(e);return this.listener.d_(n,r)}A_(e){const n={};n.database=zl(this.serializer),n.addTarget=function(i,a){let l;const c=a.target;if(l=Ul(c)?{documents:SI(i,c)}:{query:PI(i,c)._t},l.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){l.resumeToken=Tm(i,a.resumeToken);const h=$l(i,a.expectedCount);h!==null&&(l.expectedCount=h)}else if(a.snapshotVersion.compareTo(de.min())>0){l.readTime=Mo(i,a.snapshotVersion.toTimestamp());const h=$l(i,a.expectedCount);h!==null&&(l.expectedCount=h)}return l}(this.serializer,e);const r=kI(this.serializer,e);r&&(n.labels=r),this.a_(n)}R_(e){const n={};n.database=zl(this.serializer),n.removeTarget=e,this.a_(n)}}class f0 extends Dm{constructor(e,n,r,s,i,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",n,r,s,a),this.serializer=i}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,n){return this.connection.Bo("Write",e,n)}E_(e){return Be(!!e.streamToken),this.lastStreamToken=e.streamToken,Be(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){Be(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const n=RI(e.writeResults,e.commitTime),r=ln(e.commitTime);return this.listener.g_(r,n)}p_(){const e={};e.database=zl(this.serializer),this.a_(e)}m_(e){const n={streamToken:this.lastStreamToken,writes:e.map(r=>bI(this.serializer,r))};this.a_(n)}}/**
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
 */class p0 extends class{}{constructor(e,n,r,s){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=r,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new ne(F.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,n,r,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.Mo(e,ql(n,r),s,i,a)).catch(i=>{throw i.name==="FirebaseError"?(i.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new ne(F.UNKNOWN,i.toString())})}Lo(e,n,r,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,l])=>this.connection.Lo(e,ql(n,r),s,a,l,i)).catch(a=>{throw a.name==="FirebaseError"?(a.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new ne(F.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class m0{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(Pn(n),this.D_=!1):ie("OnlineStateTracker",n)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
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
 */class g0{constructor(e,n,r,s,i){this.localStore=e,this.datastore=n,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(a=>{r.enqueueAndForget(async()=>{kr(this)&&(ie("RemoteStore","Restarting streams for network reachability change."),await async function(c){const h=fe(c);h.L_.add(4),await Pi(h),h.q_.set("Unknown"),h.L_.delete(4),await pa(h)}(this))})}),this.q_=new m0(r,s)}}async function pa(t){if(kr(t))for(const e of t.B_)await e(!0)}async function Pi(t){for(const e of t.B_)await e(!1)}function Vm(t,e){const n=fe(t);n.N_.has(e.targetId)||(n.N_.set(e.targetId,e),jc(n)?Bc(n):vs(n).r_()&&Uc(n,e))}function Fc(t,e){const n=fe(t),r=vs(n);n.N_.delete(e),r.r_()&&Nm(n,e),n.N_.size===0&&(r.r_()?r.o_():kr(n)&&n.q_.set("Unknown"))}function Uc(t,e){if(t.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(de.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}vs(t).A_(e)}function Nm(t,e){t.Q_.xe(e),vs(t).R_(e)}function Bc(t){t.Q_=new _I({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>t.N_.get(e)||null,tt:()=>t.datastore.serializer.databaseId}),vs(t).start(),t.q_.v_()}function jc(t){return kr(t)&&!vs(t).n_()&&t.N_.size>0}function kr(t){return fe(t).L_.size===0}function Om(t){t.Q_=void 0}async function _0(t){t.q_.set("Online")}async function y0(t){t.N_.forEach((e,n)=>{Uc(t,e)})}async function v0(t,e){Om(t),jc(t)?(t.q_.M_(e),Bc(t)):t.q_.set("Unknown")}async function E0(t,e,n){if(t.q_.set("Online"),e instanceof wm&&e.state===2&&e.cause)try{await async function(s,i){const a=i.cause;for(const l of i.targetIds)s.N_.has(l)&&(await s.remoteSyncer.rejectListen(l,a),s.N_.delete(l),s.Q_.removeTarget(l))}(t,e)}catch(r){ie("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Lo(t,r)}else if(e instanceof _o?t.Q_.Ke(e):e instanceof Em?t.Q_.He(e):t.Q_.We(e),!n.isEqual(de.min()))try{const r=await km(t.localStore);n.compareTo(r)>=0&&await function(i,a){const l=i.Q_.rt(a);return l.targetChanges.forEach((c,h)=>{if(c.resumeToken.approximateByteSize()>0){const d=i.N_.get(h);d&&i.N_.set(h,d.withResumeToken(c.resumeToken,a))}}),l.targetMismatches.forEach((c,h)=>{const d=i.N_.get(c);if(!d)return;i.N_.set(c,d.withResumeToken(mt.EMPTY_BYTE_STRING,d.snapshotVersion)),Nm(i,c);const p=new Wn(d.target,c,h,d.sequenceNumber);Uc(i,p)}),i.remoteSyncer.applyRemoteEvent(l)}(t,n)}catch(r){ie("RemoteStore","Failed to raise snapshot:",r),await Lo(t,r)}}async function Lo(t,e,n){if(!bi(e))throw e;t.L_.add(1),await Pi(t),t.q_.set("Offline"),n||(n=()=>km(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{ie("RemoteStore","Retrying IndexedDB access"),await n(),t.L_.delete(1),await pa(t)})}function Mm(t,e){return e().catch(n=>Lo(t,n,e))}async function ma(t){const e=fe(t),n=sr(e);let r=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;w0(e);)try{const s=await s0(e.localStore,r);if(s===null){e.O_.length===0&&n.o_();break}r=s.batchId,T0(e,s)}catch(s){await Lo(e,s)}Lm(e)&&Fm(e)}function w0(t){return kr(t)&&t.O_.length<10}function T0(t,e){t.O_.push(e);const n=sr(t);n.r_()&&n.V_&&n.m_(e.mutations)}function Lm(t){return kr(t)&&!sr(t).n_()&&t.O_.length>0}function Fm(t){sr(t).start()}async function I0(t){sr(t).p_()}async function A0(t){const e=sr(t);for(const n of t.O_)e.m_(n.mutations)}async function b0(t,e,n){const r=t.O_.shift(),s=Dc.from(r,e,n);await Mm(t,()=>t.remoteSyncer.applySuccessfulWrite(s)),await ma(t)}async function R0(t,e){e&&sr(t).V_&&await async function(r,s){if(function(a){return pI(a)&&a!==F.ABORTED}(s.code)){const i=r.O_.shift();sr(r).s_(),await Mm(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await ma(r)}}(t,e),Lm(t)&&Fm(t)}async function xd(t,e){const n=fe(t);n.asyncQueue.verifyOperationInProgress(),ie("RemoteStore","RemoteStore received new credentials");const r=kr(n);n.L_.add(3),await Pi(n),r&&n.q_.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.L_.delete(3),await pa(n)}async function S0(t,e){const n=fe(t);e?(n.L_.delete(2),await pa(n)):e||(n.L_.add(2),await Pi(n),n.q_.set("Unknown"))}function vs(t){return t.K_||(t.K_=function(n,r,s){const i=fe(n);return i.w_(),new d0(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(t.datastore,t.asyncQueue,{Eo:_0.bind(null,t),Ro:y0.bind(null,t),mo:v0.bind(null,t),d_:E0.bind(null,t)}),t.B_.push(async e=>{e?(t.K_.s_(),jc(t)?Bc(t):t.q_.set("Unknown")):(await t.K_.stop(),Om(t))})),t.K_}function sr(t){return t.U_||(t.U_=function(n,r,s){const i=fe(n);return i.w_(),new f0(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(t.datastore,t.asyncQueue,{Eo:()=>Promise.resolve(),Ro:I0.bind(null,t),mo:R0.bind(null,t),f_:A0.bind(null,t),g_:b0.bind(null,t)}),t.B_.push(async e=>{e?(t.U_.s_(),await ma(t)):(await t.U_.stop(),t.O_.length>0&&(ie("RemoteStore",`Stopping write stream with ${t.O_.length} pending writes`),t.O_=[]))})),t.U_}/**
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
 */class $c{constructor(e,n,r,s,i){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Yn,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,s,i){const a=Date.now()+r,l=new $c(e,n,a,s,i);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new ne(F.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function qc(t,e){if(Pn("AsyncQueue",`${e}: ${t}`),bi(t))return new ne(F.UNAVAILABLE,`${e}: ${t}`);throw t}/**
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
 */class es{constructor(e){this.comparator=e?(n,r)=>e(n,r)||ae.comparator(n.key,r.key):(n,r)=>ae.comparator(n.key,r.key),this.keyedMap=Us(),this.sortedSet=new Qe(this.comparator)}static emptySet(e){return new es(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,r)=>(e(n),!1))}add(e){const n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){const n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof es)||this.size!==e.size)return!1;const n=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;n.hasNext();){const s=n.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
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
 */class Dd{constructor(){this.W_=new Qe(ae.comparator)}track(e){const n=e.doc.key,r=this.W_.get(n);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(n,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(n,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(n,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(n,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(n):e.type===1&&r.type===2?this.W_=this.W_.insert(n,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(n,{type:2,doc:e.doc}):ue():this.W_=this.W_.insert(n,e)}G_(){const e=[];return this.W_.inorderTraversal((n,r)=>{e.push(r)}),e}}class fs{constructor(e,n,r,s,i,a,l,c,h){this.query=e,this.docs=n,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=l,this.excludesMetadataChanges=c,this.hasCachedResults=h}static fromInitialDocuments(e,n,r,s,i){const a=[];return n.forEach(l=>{a.push({type:0,doc:l})}),new fs(e,n,es.emptySet(n),a,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&aa(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const n=this.docChanges,r=e.docChanges;if(n.length!==r.length)return!1;for(let s=0;s<n.length;s++)if(n[s].type!==r[s].type||!n[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
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
 */class P0{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class C0{constructor(){this.queries=Vd(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(n,r){const s=fe(n),i=s.queries;s.queries=Vd(),i.forEach((a,l)=>{for(const c of l.j_)c.onError(r)})})(this,new ne(F.ABORTED,"Firestore shutting down"))}}function Vd(){return new ys(t=>am(t),aa)}async function k0(t,e){const n=fe(t);let r=3;const s=e.query;let i=n.queries.get(s);i?!i.H_()&&e.J_()&&(r=2):(i=new P0,r=e.J_()?0:1);try{switch(r){case 0:i.z_=await n.onListen(s,!0);break;case 1:i.z_=await n.onListen(s,!1);break;case 2:await n.onFirstRemoteStoreListen(s)}}catch(a){const l=qc(a,`Initialization of query '${Hr(e.query)}' failed`);return void e.onError(l)}n.queries.set(s,i),i.j_.push(e),e.Z_(n.onlineState),i.z_&&e.X_(i.z_)&&Hc(n)}async function x0(t,e){const n=fe(t),r=e.query;let s=3;const i=n.queries.get(r);if(i){const a=i.j_.indexOf(e);a>=0&&(i.j_.splice(a,1),i.j_.length===0?s=e.J_()?0:1:!i.H_()&&e.J_()&&(s=2))}switch(s){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function D0(t,e){const n=fe(t);let r=!1;for(const s of e){const i=s.query,a=n.queries.get(i);if(a){for(const l of a.j_)l.X_(s)&&(r=!0);a.z_=s}}r&&Hc(n)}function V0(t,e,n){const r=fe(t),s=r.queries.get(e);if(s)for(const i of s.j_)i.onError(n);r.queries.delete(e)}function Hc(t){t.Y_.forEach(e=>{e.next()})}var Kl,Nd;(Nd=Kl||(Kl={})).ea="default",Nd.Cache="cache";class N0{constructor(e,n,r){this.query=e,this.ta=n,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new fs(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.na?this.ia(e)&&(this.ta.next(e),n=!0):this.sa(e,this.onlineState)&&(this.oa(e),n=!0),this.ra=e,n}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let n=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),n=!0),n}sa(e,n){if(!e.fromCache||!this.J_())return!0;const r=n!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const n=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}oa(e){e=fs.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==Kl.Cache}}/**
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
 */class Um{constructor(e){this.key=e}}class Bm{constructor(e){this.key=e}}class O0{constructor(e,n){this.query=e,this.Ta=n,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=be(),this.mutatedKeys=be(),this.Aa=lm(e),this.Ra=new es(this.Aa)}get Va(){return this.Ta}ma(e,n){const r=n?n.fa:new Dd,s=n?n.Ra:this.Ra;let i=n?n.mutatedKeys:this.mutatedKeys,a=s,l=!1;const c=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,h=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((d,p)=>{const g=s.get(d),y=la(this.query,p)?p:null,x=!!g&&this.mutatedKeys.has(g.key),N=!!y&&(y.hasLocalMutations||this.mutatedKeys.has(y.key)&&y.hasCommittedMutations);let L=!1;g&&y?g.data.isEqual(y.data)?x!==N&&(r.track({type:3,doc:y}),L=!0):this.ga(g,y)||(r.track({type:2,doc:y}),L=!0,(c&&this.Aa(y,c)>0||h&&this.Aa(y,h)<0)&&(l=!0)):!g&&y?(r.track({type:0,doc:y}),L=!0):g&&!y&&(r.track({type:1,doc:g}),L=!0,(c||h)&&(l=!0)),L&&(y?(a=a.add(y),i=N?i.add(d):i.delete(d)):(a=a.delete(d),i=i.delete(d)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const d=this.query.limitType==="F"?a.last():a.first();a=a.delete(d.key),i=i.delete(d.key),r.track({type:1,doc:d})}return{Ra:a,fa:r,ns:l,mutatedKeys:i}}ga(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,r,s){const i=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const a=e.fa.G_();a.sort((d,p)=>function(y,x){const N=L=>{switch(L){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return ue()}};return N(y)-N(x)}(d.type,p.type)||this.Aa(d.doc,p.doc)),this.pa(r),s=s!=null&&s;const l=n&&!s?this.ya():[],c=this.da.size===0&&this.current&&!s?1:0,h=c!==this.Ea;return this.Ea=c,a.length!==0||h?{snapshot:new fs(this.query,e.Ra,i,a,e.mutatedKeys,c===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:l}:{wa:l}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Dd,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(n=>this.Ta=this.Ta.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Ta=this.Ta.delete(n)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=be(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const n=[];return e.forEach(r=>{this.da.has(r)||n.push(new Bm(r))}),this.da.forEach(r=>{e.has(r)||n.push(new Um(r))}),n}ba(e){this.Ta=e.Ts,this.da=be();const n=this.ma(e.documents);return this.applyChanges(n,!0)}Da(){return fs.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class M0{constructor(e,n,r){this.query=e,this.targetId=n,this.view=r}}class L0{constructor(e){this.key=e,this.va=!1}}class F0{constructor(e,n,r,s,i,a){this.localStore=e,this.remoteStore=n,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new ys(l=>am(l),aa),this.Ma=new Map,this.xa=new Set,this.Oa=new Qe(ae.comparator),this.Na=new Map,this.La=new Oc,this.Ba={},this.ka=new Map,this.qa=ds.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function U0(t,e,n=!0){const r=Wm(t);let s;const i=r.Fa.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await jm(r,e,n,!0),s}async function B0(t,e){const n=Wm(t);await jm(n,e,!0,!1)}async function jm(t,e,n,r){const s=await i0(t.localStore,an(e)),i=s.targetId,a=t.sharedClientState.addLocalQueryTarget(i,n);let l;return r&&(l=await j0(t,e,i,a==="current",s.resumeToken)),t.isPrimaryClient&&n&&Vm(t.remoteStore,s),l}async function j0(t,e,n,r,s){t.Ka=(p,g,y)=>async function(N,L,K,U){let H=L.view.ma(K);H.ns&&(H=await Pd(N.localStore,L.query,!1).then(({documents:I})=>L.view.ma(I,H)));const J=U&&U.targetChanges.get(L.targetId),ge=U&&U.targetMismatches.get(L.targetId)!=null,ye=L.view.applyChanges(H,N.isPrimaryClient,J,ge);return Md(N,L.targetId,ye.wa),ye.snapshot}(t,p,g,y);const i=await Pd(t.localStore,e,!0),a=new O0(e,i.Ts),l=a.ma(i.documents),c=Si.createSynthesizedTargetChangeForCurrentChange(n,r&&t.onlineState!=="Offline",s),h=a.applyChanges(l,t.isPrimaryClient,c);Md(t,n,h.wa);const d=new M0(e,n,a);return t.Fa.set(e,d),t.Ma.has(n)?t.Ma.get(n).push(e):t.Ma.set(n,[e]),h.snapshot}async function $0(t,e,n){const r=fe(t),s=r.Fa.get(e),i=r.Ma.get(s.targetId);if(i.length>1)return r.Ma.set(s.targetId,i.filter(a=>!aa(a,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await Wl(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),n&&Fc(r.remoteStore,s.targetId),Gl(r,s.targetId)}).catch(Ai)):(Gl(r,s.targetId),await Wl(r.localStore,s.targetId,!0))}async function q0(t,e){const n=fe(t),r=n.Fa.get(e),s=n.Ma.get(r.targetId);n.isPrimaryClient&&s.length===1&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),Fc(n.remoteStore,r.targetId))}async function H0(t,e,n){const r=Y0(t);try{const s=await function(a,l){const c=fe(a),h=st.now(),d=l.reduce((y,x)=>y.add(x.key),be());let p,g;return c.persistence.runTransaction("Locally write mutations","readwrite",y=>{let x=Cn(),N=be();return c.cs.getEntries(y,d).next(L=>{x=L,x.forEach((K,U)=>{U.isValidDocument()||(N=N.add(K))})}).next(()=>c.localDocuments.getOverlayedDocuments(y,x)).next(L=>{p=L;const K=[];for(const U of l){const H=cI(U,p.get(U.key).overlayedDocument);H!=null&&K.push(new lr(U.key,H,Xp(H.value.mapValue),$t.exists(!0)))}return c.mutationQueue.addMutationBatch(y,h,K,l)}).next(L=>{g=L;const K=L.applyToLocalDocumentSet(p,N);return c.documentOverlayCache.saveOverlays(y,L.batchId,K)})}).then(()=>({batchId:g.batchId,changes:um(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(a,l,c){let h=a.Ba[a.currentUser.toKey()];h||(h=new Qe(Ve)),h=h.insert(l,c),a.Ba[a.currentUser.toKey()]=h}(r,s.batchId,n),await Ci(r,s.changes),await ma(r.remoteStore)}catch(s){const i=qc(s,"Failed to persist write");n.reject(i)}}async function $m(t,e){const n=fe(t);try{const r=await n0(n.localStore,e);e.targetChanges.forEach((s,i)=>{const a=n.Na.get(i);a&&(Be(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?a.va=!0:s.modifiedDocuments.size>0?Be(a.va):s.removedDocuments.size>0&&(Be(a.va),a.va=!1))}),await Ci(n,r,e)}catch(r){await Ai(r)}}function Od(t,e,n){const r=fe(t);if(r.isPrimaryClient&&n===0||!r.isPrimaryClient&&n===1){const s=[];r.Fa.forEach((i,a)=>{const l=a.view.Z_(e);l.snapshot&&s.push(l.snapshot)}),function(a,l){const c=fe(a);c.onlineState=l;let h=!1;c.queries.forEach((d,p)=>{for(const g of p.j_)g.Z_(l)&&(h=!0)}),h&&Hc(c)}(r.eventManager,e),s.length&&r.Ca.d_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function z0(t,e,n){const r=fe(t);r.sharedClientState.updateQueryState(e,"rejected",n);const s=r.Na.get(e),i=s&&s.key;if(i){let a=new Qe(ae.comparator);a=a.insert(i,Tt.newNoDocument(i,de.min()));const l=be().add(i),c=new da(de.min(),new Map,new Qe(Ve),a,l);await $m(r,c),r.Oa=r.Oa.remove(i),r.Na.delete(e),zc(r)}else await Wl(r.localStore,e,!1).then(()=>Gl(r,e,n)).catch(Ai)}async function W0(t,e){const n=fe(t),r=e.batch.batchId;try{const s=await t0(n.localStore,e);Hm(n,r,null),qm(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await Ci(n,s)}catch(s){await Ai(s)}}async function K0(t,e,n){const r=fe(t);try{const s=await function(a,l){const c=fe(a);return c.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let d;return c.mutationQueue.lookupMutationBatch(h,l).next(p=>(Be(p!==null),d=p.keys(),c.mutationQueue.removeMutationBatch(h,p))).next(()=>c.mutationQueue.performConsistencyCheck(h)).next(()=>c.documentOverlayCache.removeOverlaysForBatchId(h,d,l)).next(()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,d)).next(()=>c.localDocuments.getDocuments(h,d))})}(r.localStore,e);Hm(r,e,n),qm(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await Ci(r,s)}catch(s){await Ai(s)}}function qm(t,e){(t.ka.get(e)||[]).forEach(n=>{n.resolve()}),t.ka.delete(e)}function Hm(t,e,n){const r=fe(t);let s=r.Ba[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(n?i.reject(n):i.resolve(),s=s.remove(e)),r.Ba[r.currentUser.toKey()]=s}}function Gl(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Ma.get(e))t.Fa.delete(r),n&&t.Ca.$a(r,n);t.Ma.delete(e),t.isPrimaryClient&&t.La.gr(e).forEach(r=>{t.La.containsKey(r)||zm(t,r)})}function zm(t,e){t.xa.delete(e.path.canonicalString());const n=t.Oa.get(e);n!==null&&(Fc(t.remoteStore,n),t.Oa=t.Oa.remove(e),t.Na.delete(n),zc(t))}function Md(t,e,n){for(const r of n)r instanceof Um?(t.La.addReference(r.key,e),G0(t,r)):r instanceof Bm?(ie("SyncEngine","Document no longer in limbo: "+r.key),t.La.removeReference(r.key,e),t.La.containsKey(r.key)||zm(t,r.key)):ue()}function G0(t,e){const n=e.key,r=n.path.canonicalString();t.Oa.get(n)||t.xa.has(r)||(ie("SyncEngine","New document in limbo: "+n),t.xa.add(r),zc(t))}function zc(t){for(;t.xa.size>0&&t.Oa.size<t.maxConcurrentLimboResolutions;){const e=t.xa.values().next().value;t.xa.delete(e);const n=new ae(We.fromString(e)),r=t.qa.next();t.Na.set(r,new L0(n)),t.Oa=t.Oa.insert(n,r),Vm(t.remoteStore,new Wn(an(im(n.path)),r,"TargetPurposeLimboResolution",bc.oe))}}async function Ci(t,e,n){const r=fe(t),s=[],i=[],a=[];r.Fa.isEmpty()||(r.Fa.forEach((l,c)=>{a.push(r.Ka(c,e,n).then(h=>{var d;if((h||n)&&r.isPrimaryClient){const p=h?!h.fromCache:(d=n==null?void 0:n.targetChanges.get(c.targetId))===null||d===void 0?void 0:d.current;r.sharedClientState.updateQueryState(c.targetId,p?"current":"not-current")}if(h){s.push(h);const p=Lc.Wi(c.targetId,h);i.push(p)}}))}),await Promise.all(a),r.Ca.d_(s),await async function(c,h){const d=fe(c);try{await d.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>$.forEach(h,g=>$.forEach(g.$i,y=>d.persistence.referenceDelegate.addReference(p,g.targetId,y)).next(()=>$.forEach(g.Ui,y=>d.persistence.referenceDelegate.removeReference(p,g.targetId,y)))))}catch(p){if(!bi(p))throw p;ie("LocalStore","Failed to update sequence numbers: "+p)}for(const p of h){const g=p.targetId;if(!p.fromCache){const y=d.os.get(g),x=y.snapshotVersion,N=y.withLastLimboFreeSnapshotVersion(x);d.os=d.os.insert(g,N)}}}(r.localStore,i))}async function Q0(t,e){const n=fe(t);if(!n.currentUser.isEqual(e)){ie("SyncEngine","User change. New user:",e.toKey());const r=await Cm(n.localStore,e);n.currentUser=e,function(i,a){i.ka.forEach(l=>{l.forEach(c=>{c.reject(new ne(F.CANCELLED,a))})}),i.ka.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Ci(n,r.hs)}}function J0(t,e){const n=fe(t),r=n.Na.get(e);if(r&&r.va)return be().add(r.key);{let s=be();const i=n.Ma.get(e);if(!i)return s;for(const a of i){const l=n.Fa.get(a);s=s.unionWith(l.view.Va)}return s}}function Wm(t){const e=fe(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=$m.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=J0.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=z0.bind(null,e),e.Ca.d_=D0.bind(null,e.eventManager),e.Ca.$a=V0.bind(null,e.eventManager),e}function Y0(t){const e=fe(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=W0.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=K0.bind(null,e),e}class Fo{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=fa(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,n){return null}Ha(e,n){return null}za(e){return e0(this.persistence,new XI,e.initialUser,this.serializer)}Ga(e){return new QI(Mc.Zr,this.serializer)}Wa(e){return new a0}async terminate(){var e,n;(e=this.gcScheduler)===null||e===void 0||e.stop(),(n=this.indexBackfillerScheduler)===null||n===void 0||n.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Fo.provider={build:()=>new Fo};class Ql{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Od(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=Q0.bind(null,this.syncEngine),await S0(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new C0}()}createDatastore(e){const n=fa(e.databaseInfo.databaseId),r=function(i){return new h0(i)}(e.databaseInfo);return function(i,a,l,c){return new p0(i,a,l,c)}(e.authCredentials,e.appCheckCredentials,r,n)}createRemoteStore(e){return function(r,s,i,a,l){return new g0(r,s,i,a,l)}(this.localStore,this.datastore,e.asyncQueue,n=>Od(this.syncEngine,n,0),function(){return kd.D()?new kd:new l0}())}createSyncEngine(e,n){return function(s,i,a,l,c,h,d){const p=new F0(s,i,a,l,c,h);return d&&(p.Qa=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){var e,n;await async function(s){const i=fe(s);ie("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await Pi(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(n=this.eventManager)===null||n===void 0||n.terminate()}}Ql.provider={build:()=>new Ql};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class X0{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):Pn("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,n){setTimeout(()=>{this.muted||e(n)},0)}}/**
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
 */class Z0{constructor(e,n,r,s,i){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=r,this.databaseInfo=s,this.user=Et.UNAUTHENTICATED,this.clientId=Qp.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async a=>{ie("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(ie("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Yn;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){const r=qc(n,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function hl(t,e){t.asyncQueue.verifyOperationInProgress(),ie("FirestoreClient","Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async s=>{r.isEqual(s)||(await Cm(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function Ld(t,e){t.asyncQueue.verifyOperationInProgress();const n=await eA(t);ie("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(r=>xd(e.remoteStore,r)),t.setAppCheckTokenChangeListener((r,s)=>xd(e.remoteStore,s)),t._onlineComponents=e}async function eA(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){ie("FirestoreClient","Using user provided OfflineComponentProvider");try{await hl(t,t._uninitializedComponentsProvider._offline)}catch(e){const n=e;if(!function(s){return s.name==="FirebaseError"?s.code===F.FAILED_PRECONDITION||s.code===F.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(n))throw n;ls("Error using user provided cache. Falling back to memory cache: "+n),await hl(t,new Fo)}}else ie("FirestoreClient","Using default OfflineComponentProvider"),await hl(t,new Fo);return t._offlineComponents}async function Km(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(ie("FirestoreClient","Using user provided OnlineComponentProvider"),await Ld(t,t._uninitializedComponentsProvider._online)):(ie("FirestoreClient","Using default OnlineComponentProvider"),await Ld(t,new Ql))),t._onlineComponents}function tA(t){return Km(t).then(e=>e.syncEngine)}async function nA(t){const e=await Km(t),n=e.eventManager;return n.onListen=U0.bind(null,e.syncEngine),n.onUnlisten=$0.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=B0.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=q0.bind(null,e.syncEngine),n}function rA(t,e,n={}){const r=new Yn;return t.asyncQueue.enqueueAndForget(async()=>function(i,a,l,c,h){const d=new X0({next:g=>{d.Za(),a.enqueueAndForget(()=>x0(i,p)),g.fromCache&&c.source==="server"?h.reject(new ne(F.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(g)},error:g=>h.reject(g)}),p=new N0(l,d,{includeMetadataChanges:!0,_a:!0});return k0(i,p)}(await nA(t),t.asyncQueue,e,n,r)),r.promise}/**
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
 */function Gm(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fd=new Map;/**
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
 */function Qm(t,e,n){if(!n)throw new ne(F.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function sA(t,e,n,r){if(e===!0&&r===!0)throw new ne(F.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function Ud(t){if(!ae.isDocumentKey(t))throw new ne(F.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function Bd(t){if(ae.isDocumentKey(t))throw new ne(F.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function ga(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":ue()}function br(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new ne(F.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=ga(t);throw new ne(F.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jd{constructor(e){var n,r;if(e.host===void 0){if(e.ssl!==void 0)throw new ne(F.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(n=e.ssl)===null||n===void 0||n;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new ne(F.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}sA("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Gm((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new ne(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new ne(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new ne(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class _a{constructor(e,n,r,s){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new jd({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new ne(F.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new ne(F.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new jd(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new _T;switch(r.type){case"firstParty":return new wT(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new ne(F.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=Fd.get(n);r&&(ie("ComponentProvider","Removing Datastore"),Fd.delete(n),r.terminate())}(this),Promise.resolve()}}function iA(t,e,n,r={}){var s;const i=(t=br(t,_a))._getSettings(),a=`${e}:${n}`;if(i.host!=="firestore.googleapis.com"&&i.host!==a&&ls("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),t._setSettings(Object.assign(Object.assign({},i),{host:a,ssl:!1})),r.mockUserToken){let l,c;if(typeof r.mockUserToken=="string")l=r.mockUserToken,c=Et.MOCK_USER;else{l=zE(r.mockUserToken,(s=t._app)===null||s===void 0?void 0:s.options.projectId);const h=r.mockUserToken.sub||r.mockUserToken.user_id;if(!h)throw new ne(F.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");c=new Et(h)}t._authCredentials=new yT(new Gp(l,c))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xr{constructor(e,n,r){this.converter=n,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new xr(this.firestore,e,this._query)}}class qt{constructor(e,n,r){this.converter=n,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Xn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new qt(this.firestore,e,this._key)}}class Xn extends xr{constructor(e,n,r){super(e,n,im(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new qt(this.firestore,null,new ae(e))}withConverter(e){return new Xn(this.firestore,e,this._path)}}function Ze(t,e,...n){if(t=Rt(t),Qm("collection","path",e),t instanceof _a){const r=We.fromString(e,...n);return Bd(r),new Xn(t,null,r)}{if(!(t instanceof qt||t instanceof Xn))throw new ne(F.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(We.fromString(e,...n));return Bd(r),new Xn(t.firestore,null,r)}}function Nt(t,e,...n){if(t=Rt(t),arguments.length===1&&(e=Qp.newId()),Qm("doc","path",e),t instanceof _a){const r=We.fromString(e,...n);return Ud(r),new qt(t,null,new ae(r))}{if(!(t instanceof qt||t instanceof Xn))throw new ne(F.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(We.fromString(e,...n));return Ud(r),new qt(t.firestore,t instanceof Xn?t.converter:null,new ae(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $d{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new xm(this,"async_queue_retry"),this.Vu=()=>{const r=ul();r&&ie("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const n=ul();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const n=ul();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const n=new Yn;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!bi(e))throw e;ie("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const n=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const s=function(a){let l=a.message||"";return a.stack&&(l=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),l}(r);throw Pn("INTERNAL UNHANDLED ERROR: ",s),r}).then(r=>(this.du=!1,r))));return this.mu=n,n}enqueueAfterDelay(e,n,r){this.fu(),this.Ru.indexOf(e)>-1&&(n=0);const s=$c.createAndSchedule(this,e,n,r,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&ue()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const n of this.Tu)if(n.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.Tu)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const n=this.Tu.indexOf(e);this.Tu.splice(n,1)}}class ki extends _a{constructor(e,n,r,s){super(e,n,r,s),this.type="firestore",this._queue=new $d,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new $d(e),this._firestoreClient=void 0,await e}}}function oA(t,e){const n=typeof t=="object"?t:Up(),r=typeof t=="string"?t:e||"(default)",s=Ic(n,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=qE("firestore");i&&iA(s,...i)}return s}function Wc(t){if(t._terminated)throw new ne(F.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||aA(t),t._firestoreClient}function aA(t){var e,n,r;const s=t._freezeSettings(),i=function(l,c,h,d){return new NT(l,c,h,d.host,d.ssl,d.experimentalForceLongPolling,d.experimentalAutoDetectLongPolling,Gm(d.experimentalLongPollingOptions),d.useFetchStreams)}(t._databaseId,((e=t._app)===null||e===void 0?void 0:e.options.appId)||"",t._persistenceKey,s);t._componentsProvider||!((n=s.localCache)===null||n===void 0)&&n._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(t._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),t._firestoreClient=new Z0(t._authCredentials,t._appCheckCredentials,t._queue,i,t._componentsProvider&&function(l){const c=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(c),_online:c}}(t._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ps{constructor(e){this._byteString=e}static fromBase64String(e){try{return new ps(mt.fromBase64String(e))}catch(n){throw new ne(F.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new ps(mt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ya{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new ne(F.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new dt(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class va{constructor(e){this._methodName=e}}/**
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
 */class Kc{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new ne(F.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new ne(F.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return Ve(this._lat,e._lat)||Ve(this._long,e._long)}}/**
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
 */class Gc{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}}/**
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
 */const lA=/^__.*__$/;class cA{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return this.fieldMask!==null?new lr(e,this.data,this.fieldMask,n,this.fieldTransforms):new Ri(e,this.data,n,this.fieldTransforms)}}class Jm{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return new lr(e,this.data,this.fieldMask,n,this.fieldTransforms)}}function Ym(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw ue()}}class Qc{constructor(e,n,r,s,i,a){this.settings=e,this.databaseId=n,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.vu(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new Qc(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),s=this.Fu({path:r,xu:!1});return s.Ou(e),s}Nu(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),s=this.Fu({path:r,xu:!1});return s.vu(),s}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return Uo(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(Ym(this.Cu)&&lA.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class uA{constructor(e,n,r){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=r||fa(e)}Qu(e,n,r,s=!1){return new Qc({Cu:e,methodName:n,qu:r,path:dt.emptyPath(),xu:!1,ku:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Jc(t){const e=t._freezeSettings(),n=fa(t._databaseId);return new uA(t._databaseId,!!e.ignoreUndefinedProperties,n)}function Xm(t,e,n,r,s,i={}){const a=t.Qu(i.merge||i.mergeFields?2:0,e,n,s);Xc("Data must be an object, but it was:",a,r);const l=Zm(r,a);let c,h;if(i.merge)c=new jt(a.fieldMask),h=a.fieldTransforms;else if(i.mergeFields){const d=[];for(const p of i.mergeFields){const g=Jl(e,p,n);if(!a.contains(g))throw new ne(F.INVALID_ARGUMENT,`Field '${g}' is specified in your field mask but missing from your input data.`);tg(d,g)||d.push(g)}c=new jt(d),h=a.fieldTransforms.filter(p=>c.covers(p.field))}else c=null,h=a.fieldTransforms;return new cA(new Vt(l),c,h)}class Ea extends va{_toFieldTransform(e){if(e.Cu!==2)throw e.Cu===1?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Ea}}class Yc extends va{_toFieldTransform(e){return new iI(e.path,new gi)}isEqual(e){return e instanceof Yc}}function hA(t,e,n,r){const s=t.Qu(1,e,n);Xc("Data must be an object, but it was:",s,r);const i=[],a=Vt.empty();Cr(r,(c,h)=>{const d=Zc(e,c,n);h=Rt(h);const p=s.Nu(d);if(h instanceof Ea)i.push(d);else{const g=xi(h,p);g!=null&&(i.push(d),a.set(d,g))}});const l=new jt(i);return new Jm(a,l,s.fieldTransforms)}function dA(t,e,n,r,s,i){const a=t.Qu(1,e,n),l=[Jl(e,r,n)],c=[s];if(i.length%2!=0)throw new ne(F.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let g=0;g<i.length;g+=2)l.push(Jl(e,i[g])),c.push(i[g+1]);const h=[],d=Vt.empty();for(let g=l.length-1;g>=0;--g)if(!tg(h,l[g])){const y=l[g];let x=c[g];x=Rt(x);const N=a.Nu(y);if(x instanceof Ea)h.push(y);else{const L=xi(x,N);L!=null&&(h.push(y),d.set(y,L))}}const p=new jt(h);return new Jm(d,p,a.fieldTransforms)}function fA(t,e,n,r=!1){return xi(n,t.Qu(r?4:3,e))}function xi(t,e){if(eg(t=Rt(t)))return Xc("Unsupported field value:",e,t),Zm(t,e);if(t instanceof va)return function(r,s){if(!Ym(s.Cu))throw s.Bu(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Bu(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,s){const i=[];let a=0;for(const l of r){let c=xi(l,s.Lu(a));c==null&&(c={nullValue:"NULL_VALUE"}),i.push(c),a++}return{arrayValue:{values:i}}}(t,e)}return function(r,s){if((r=Rt(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return nI(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=st.fromDate(r);return{timestampValue:Mo(s.serializer,i)}}if(r instanceof st){const i=new st(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:Mo(s.serializer,i)}}if(r instanceof Kc)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof ps)return{bytesValue:Tm(s.serializer,r._byteString)};if(r instanceof qt){const i=s.databaseId,a=r.firestore._databaseId;if(!a.isEqual(i))throw s.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:Nc(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof Gc)return function(a,l){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(c=>{if(typeof c!="number")throw l.Bu("VectorValues must only contain numeric values.");return xc(l.serializer,c)})}}}}}}(r,s);throw s.Bu(`Unsupported field value: ${ga(r)}`)}(t,e)}function Zm(t,e){const n={};return Jp(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Cr(t,(r,s)=>{const i=xi(s,e.Mu(r));i!=null&&(n[r]=i)}),{mapValue:{fields:n}}}function eg(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof st||t instanceof Kc||t instanceof ps||t instanceof qt||t instanceof va||t instanceof Gc)}function Xc(t,e,n){if(!eg(n)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(n)){const r=ga(n);throw r==="an object"?e.Bu(t+" a custom object"):e.Bu(t+" "+r)}}function Jl(t,e,n){if((e=Rt(e))instanceof ya)return e._internalPath;if(typeof e=="string")return Zc(t,e);throw Uo("Field path arguments must be of type string or ",t,!1,void 0,n)}const pA=new RegExp("[~\\*/\\[\\]]");function Zc(t,e,n){if(e.search(pA)>=0)throw Uo(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new ya(...e.split("."))._internalPath}catch{throw Uo(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function Uo(t,e,n,r,s){const i=r&&!r.isEmpty(),a=s!==void 0;let l=`Function ${e}() called with invalid data`;n&&(l+=" (via `toFirestore()`)"),l+=". ";let c="";return(i||a)&&(c+=" (found",i&&(c+=` in field ${r}`),a&&(c+=` in document ${s}`),c+=")"),new ne(F.INVALID_ARGUMENT,l+t+c)}function tg(t,e){return t.some(n=>n.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ng{constructor(e,n,r,s,i){this._firestore=e,this._userDataWriter=n,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new qt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new mA(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const n=this._document.data.field(wa("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class mA extends ng{data(){return super.data()}}function wa(t,e){return typeof e=="string"?Zc(t,e):e instanceof ya?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function gA(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new ne(F.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class eu{}class rg extends eu{}function sg(t,e,...n){let r=[];e instanceof eu&&r.push(e),r=r.concat(n),function(i){const a=i.filter(c=>c instanceof tu).length,l=i.filter(c=>c instanceof Ta).length;if(a>1||a>0&&l>0)throw new ne(F.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)t=s._apply(t);return t}class Ta extends rg{constructor(e,n,r){super(),this._field=e,this._op=n,this._value=r,this.type="where"}static _create(e,n,r){return new Ta(e,n,r)}_apply(e){const n=this._parse(e);return ig(e._query,n),new xr(e.firestore,e.converter,Bl(e._query,n))}_parse(e){const n=Jc(e.firestore);return function(i,a,l,c,h,d,p){let g;if(h.isKeyField()){if(d==="array-contains"||d==="array-contains-any")throw new ne(F.INVALID_ARGUMENT,`Invalid Query. You can't perform '${d}' queries on documentId().`);if(d==="in"||d==="not-in"){Hd(p,d);const y=[];for(const x of p)y.push(qd(c,i,x));g={arrayValue:{values:y}}}else g=qd(c,i,p)}else d!=="in"&&d!=="not-in"&&d!=="array-contains-any"||Hd(p,d),g=fA(l,a,p,d==="in"||d==="not-in");return et.create(h,d,g)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}}function _A(t,e,n){const r=e,s=wa("where",t);return Ta._create(s,r,n)}class tu extends eu{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new tu(e,n)}_parse(e){const n=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return n.length===1?n[0]:Zt.create(n,this._getOperator())}_apply(e){const n=this._parse(e);return n.getFilters().length===0?e:(function(s,i){let a=s;const l=i.getFlattenedFilters();for(const c of l)ig(a,c),a=Bl(a,c)}(e._query,n),new xr(e.firestore,e.converter,Bl(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class nu extends rg{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new nu(e,n)}_apply(e){const n=function(s,i,a){if(s.startAt!==null)throw new ne(F.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new ne(F.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new mi(i,a)}(e._query,this._field,this._direction);return new xr(e.firestore,e.converter,function(s,i){const a=s.explicitOrderBy.concat([i]);return new _s(s.path,s.collectionGroup,a,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,n))}}function yA(t,e="asc"){const n=e,r=wa("orderBy",t);return nu._create(r,n)}function qd(t,e,n){if(typeof(n=Rt(n))=="string"){if(n==="")throw new ne(F.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!om(e)&&n.indexOf("/")!==-1)throw new ne(F.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(We.fromString(n));if(!ae.isDocumentKey(r))throw new ne(F.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return hd(t,new ae(r))}if(n instanceof qt)return hd(t,n._key);throw new ne(F.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${ga(n)}.`)}function Hd(t,e){if(!Array.isArray(t)||t.length===0)throw new ne(F.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function ig(t,e){const n=function(s,i){for(const a of s)for(const l of a.getFlattenedFilters())if(i.indexOf(l.op)>=0)return l.op;return null}(t.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new ne(F.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new ne(F.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}class vA{convertValue(e,n="none"){switch(Ar(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Ye(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(Ir(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw ue()}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){const r={};return Cr(e,(s,i)=>{r[s]=this.convertValue(i,n)}),r}convertVectorValue(e){var n,r,s;const i=(s=(r=(n=e.fields)===null||n===void 0?void 0:n.value.arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(a=>Ye(a.doubleValue));return new Gc(i)}convertGeoPoint(e){return new Kc(Ye(e.latitude),Ye(e.longitude))}convertArray(e,n){return(e.values||[]).map(r=>this.convertValue(r,n))}convertServerTimestamp(e,n){switch(n){case"previous":const r=Sc(e);return r==null?null:this.convertValue(r,n);case"estimate":return this.convertTimestamp(di(e));default:return null}}convertTimestamp(e){const n=rr(e);return new st(n.seconds,n.nanos)}convertDocumentKey(e,n){const r=We.fromString(e);Be(Pm(r));const s=new fi(r.get(1),r.get(3)),i=new ae(r.popFirst(5));return s.isEqual(n)||Pn(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function og(t,e,n){let r;return r=t?n&&(n.merge||n.mergeFields)?t.toFirestore(e,n):t.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class so{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class EA extends ng{constructor(e,n,r,s,i,a){super(e,n,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new yo(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const r=this._document.data.field(wa("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,n.serverTimestamps)}}}class yo extends EA{data(e={}){return super.data(e)}}class wA{constructor(e,n,r,s){this._firestore=e,this._userDataWriter=n,this._snapshot=s,this.metadata=new so(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(r=>{e.call(n,new yo(this._firestore,this._userDataWriter,r.key,r,new so(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new ne(F.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(l=>{const c=new yo(s._firestore,s._userDataWriter,l.doc.key,l.doc,new so(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);return l.doc,{type:"added",doc:c,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(l=>i||l.type!==3).map(l=>{const c=new yo(s._firestore,s._userDataWriter,l.doc.key,l.doc,new so(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,d=-1;return l.type!==0&&(h=a.indexOf(l.doc.key),a=a.delete(l.doc.key)),l.type!==1&&(a=a.add(l.doc),d=a.indexOf(l.doc.key)),{type:TA(l.type),doc:c,oldIndex:h,newIndex:d}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}}function TA(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return ue()}}class IA extends vA{constructor(e){super(),this.firestore=e}convertBytes(e){return new ps(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new qt(this.firestore,null,n)}}function ft(t){t=br(t,xr);const e=br(t.firestore,ki),n=Wc(e),r=new IA(e);return gA(t._query),rA(n,t._query).then(s=>new wA(e,r,t,s))}function Qt(t,e,n){t=br(t,qt);const r=br(t.firestore,ki),s=og(t.converter,e,n);return ru(r,[Xm(Jc(r),"setDoc",t._key,s,t.converter!==null,n).toMutation(t._key,$t.none())])}function Yl(t){return ru(br(t.firestore,ki),[new ha(t._key,$t.none())])}function ru(t,e){return function(r,s){const i=new Yn;return r.asyncQueue.enqueueAndForget(async()=>H0(await tA(r),s,i)),i.promise}(Wc(t),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class AA{constructor(e,n){this._firestore=e,this._commitHandler=n,this._mutations=[],this._committed=!1,this._dataReader=Jc(e)}set(e,n,r){this._verifyNotCommitted();const s=dl(e,this._firestore),i=og(s.converter,n,r),a=Xm(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(a.toMutation(s._key,$t.none())),this}update(e,n,r,...s){this._verifyNotCommitted();const i=dl(e,this._firestore);let a;return a=typeof(n=Rt(n))=="string"||n instanceof ya?dA(this._dataReader,"WriteBatch.update",i._key,n,r,s):hA(this._dataReader,"WriteBatch.update",i._key,n),this._mutations.push(a.toMutation(i._key,$t.exists(!0))),this}delete(e){this._verifyNotCommitted();const n=dl(e,this._firestore);return this._mutations=this._mutations.concat(new ha(n._key,$t.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new ne(F.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function dl(t,e){if((t=Rt(t)).firestore!==e)throw new ne(F.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return t}function bA(){return new Yc("serverTimestamp")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ag(t){return Wc(t=br(t,ki)),new AA(t,e=>ru(t,e))}(function(e,n=!0){(function(s){gs=s})(ms),as(new wr("firestore",(r,{instanceIdentifier:s,options:i})=>{const a=r.getProvider("app").getImmediate(),l=new ki(new vT(r.getProvider("auth-internal")),new IT(r.getProvider("app-check-internal")),function(h,d){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new ne(F.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new fi(h.options.projectId,d)}(a,s),a);return i=Object.assign({useFetchStreams:n},i),l._setSettings(i),l},"PUBLIC").setMultipleInstances(!0)),Jn(od,"4.7.3",e),Jn(od,"4.7.3","esm2017")})();function su(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(t);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(t,r[s])&&(n[r[s]]=t[r[s]]);return n}function lg(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const RA=lg,cg=new Ti("auth","Firebase",lg());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bo=new wc("@firebase/auth");function SA(t,...e){Bo.logLevel<=Re.WARN&&Bo.warn(`Auth (${ms}): ${t}`,...e)}function vo(t,...e){Bo.logLevel<=Re.ERROR&&Bo.error(`Auth (${ms}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kn(t,...e){throw iu(t,...e)}function cn(t,...e){return iu(t,...e)}function ug(t,e,n){const r=Object.assign(Object.assign({},RA()),{[e]:n});return new Ti("auth","Firebase",r).create(e,{appName:t.name})}function Zn(t){return ug(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function iu(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return cg.create(t,...e)}function ce(t,e,...n){if(!t)throw iu(e,...n)}function Tn(t){const e="INTERNAL ASSERTION FAILED: "+t;throw vo(e),new Error(e)}function xn(t,e){t||Tn(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xl(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.href)||""}function PA(){return zd()==="http:"||zd()==="https:"}function zd(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function CA(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(PA()||QE()||"connection"in navigator)?navigator.onLine:!0}function kA(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Di{constructor(e,n){this.shortDelay=e,this.longDelay=n,xn(n>e,"Short delay should be less than long delay!"),this.isMobile=WE()||JE()}get(){return CA()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ou(t,e){xn(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hg{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Tn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Tn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Tn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xA={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const DA=new Di(3e4,6e4);function Ia(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function Es(t,e,n,r,s={}){return dg(t,s,async()=>{let i={},a={};r&&(e==="GET"?a=r:i={body:JSON.stringify(r)});const l=Ii(Object.assign({key:t.config.apiKey},a)).slice(1),c=await t._getAdditionalHeaders();c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode);const h=Object.assign({method:e,headers:c},i);return GE()||(h.referrerPolicy="no-referrer"),hg.fetch()(pg(t,t.config.apiHost,n,l),h)})}async function dg(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},xA),e);try{const s=new VA(t),i=await Promise.race([n(),s.promise]);s.clearNetworkTimeout();const a=await i.json();if("needConfirmation"in a)throw io(t,"account-exists-with-different-credential",a);if(i.ok&&!("errorMessage"in a))return a;{const l=i.ok?a.errorMessage:a.error.message,[c,h]=l.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw io(t,"credential-already-in-use",a);if(c==="EMAIL_EXISTS")throw io(t,"email-already-in-use",a);if(c==="USER_DISABLED")throw io(t,"user-disabled",a);const d=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw ug(t,d,h);kn(t,d)}}catch(s){if(s instanceof Vn)throw s;kn(t,"network-request-failed",{message:String(s)})}}async function fg(t,e,n,r,s={}){const i=await Es(t,e,n,r,s);return"mfaPendingCredential"in i&&kn(t,"multi-factor-auth-required",{_serverResponse:i}),i}function pg(t,e,n,r){const s=`${e}${n}?${r}`;return t.config.emulator?ou(t.config,s):`${t.config.apiScheme}://${s}`}class VA{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(cn(this.auth,"network-request-failed")),DA.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function io(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const s=cn(t,e,r);return s.customData._tokenResponse=n,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function NA(t,e){return Es(t,"POST","/v1/accounts:delete",e)}async function mg(t,e){return Es(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ei(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function OA(t,e=!1){const n=Rt(t),r=await n.getIdToken(e),s=au(r);ce(s&&s.exp&&s.auth_time&&s.iat,n.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,a=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:ei(fl(s.auth_time)),issuedAtTime:ei(fl(s.iat)),expirationTime:ei(fl(s.exp)),signInProvider:a||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function fl(t){return Number(t)*1e3}function au(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return vo("JWT malformed, contained fewer than 3 sections"),null;try{const s=Dp(n);return s?JSON.parse(s):(vo("Failed to decode base64 JWT payload"),null)}catch(s){return vo("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Wd(t){const e=au(t);return ce(e,"internal-error"),ce(typeof e.exp<"u","internal-error"),ce(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function vi(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof Vn&&MA(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function MA({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class LA{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zl{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=ei(this.lastLoginAt),this.creationTime=ei(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function jo(t){var e;const n=t.auth,r=await t.getIdToken(),s=await vi(t,mg(n,{idToken:r}));ce(s==null?void 0:s.users.length,n,"internal-error");const i=s.users[0];t._notifyReloadListener(i);const a=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?gg(i.providerUserInfo):[],l=UA(t.providerData,a),c=t.isAnonymous,h=!(t.email&&i.passwordHash)&&!(l!=null&&l.length),d=c?h:!1,p={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:l,metadata:new Zl(i.createdAt,i.lastLoginAt),isAnonymous:d};Object.assign(t,p)}async function FA(t){const e=Rt(t);await jo(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function UA(t,e){return[...t.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function gg(t){return t.map(e=>{var{providerId:n}=e,r=su(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function BA(t,e){const n=await dg(t,{},async()=>{const r=Ii({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=t.config,a=pg(t,s,"/v1/token",`key=${i}`),l=await t._getAdditionalHeaders();return l["Content-Type"]="application/x-www-form-urlencoded",hg.fetch()(a,{method:"POST",headers:l,body:r})});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function jA(t,e){return Es(t,"POST","/v2/accounts:revokeToken",Ia(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ts{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ce(e.idToken,"internal-error"),ce(typeof e.idToken<"u","internal-error"),ce(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Wd(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){ce(e.length!==0,"internal-error");const n=Wd(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(ce(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:s,expiresIn:i}=await BA(e,n);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:s,expirationTime:i}=n,a=new ts;return r&&(ce(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(ce(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),i&&(ce(typeof i=="number","internal-error",{appName:e}),a.expirationTime=i),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new ts,this.toJSON())}_performRefresh(){return Tn("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fn(t,e){ce(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class In{constructor(e){var{uid:n,auth:r,stsTokenManager:s}=e,i=su(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new LA(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Zl(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const n=await vi(this,this.stsTokenManager.getToken(this.auth,e));return ce(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return OA(this,e)}reload(){return FA(this)}_assign(e){this!==e&&(ce(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new In(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){ce(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await jo(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(wn(this.auth.app))return Promise.reject(Zn(this.auth));const e=await this.getIdToken();return await vi(this,NA(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,s,i,a,l,c,h,d;const p=(r=n.displayName)!==null&&r!==void 0?r:void 0,g=(s=n.email)!==null&&s!==void 0?s:void 0,y=(i=n.phoneNumber)!==null&&i!==void 0?i:void 0,x=(a=n.photoURL)!==null&&a!==void 0?a:void 0,N=(l=n.tenantId)!==null&&l!==void 0?l:void 0,L=(c=n._redirectEventId)!==null&&c!==void 0?c:void 0,K=(h=n.createdAt)!==null&&h!==void 0?h:void 0,U=(d=n.lastLoginAt)!==null&&d!==void 0?d:void 0,{uid:H,emailVerified:J,isAnonymous:ge,providerData:ye,stsTokenManager:I}=n;ce(H&&I,e,"internal-error");const v=ts.fromJSON(this.name,I);ce(typeof H=="string",e,"internal-error"),Fn(p,e.name),Fn(g,e.name),ce(typeof J=="boolean",e,"internal-error"),ce(typeof ge=="boolean",e,"internal-error"),Fn(y,e.name),Fn(x,e.name),Fn(N,e.name),Fn(L,e.name),Fn(K,e.name),Fn(U,e.name);const T=new In({uid:H,auth:e,email:g,emailVerified:J,displayName:p,isAnonymous:ge,photoURL:x,phoneNumber:y,tenantId:N,stsTokenManager:v,createdAt:K,lastLoginAt:U});return ye&&Array.isArray(ye)&&(T.providerData=ye.map(A=>Object.assign({},A))),L&&(T._redirectEventId=L),T}static async _fromIdTokenResponse(e,n,r=!1){const s=new ts;s.updateFromServerResponse(n);const i=new In({uid:n.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await jo(i),i}static async _fromGetAccountInfoResponse(e,n,r){const s=n.users[0];ce(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?gg(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),l=new ts;l.updateFromIdToken(r);const c=new In({uid:s.localId,auth:e,stsTokenManager:l,isAnonymous:a}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Zl(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(c,h),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Kd=new Map;function An(t){xn(t instanceof Function,"Expected a class definition");let e=Kd.get(t);return e?(xn(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,Kd.set(t,e),e)}/**
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
 */class _g{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}_g.type="NONE";const Gd=_g;/**
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
 */function Eo(t,e,n){return`firebase:${t}:${e}:${n}`}class ns{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Eo(this.userKey,s.apiKey,i),this.fullPersistenceKey=Eo("persistence",s.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?In._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new ns(An(Gd),e,r);const s=(await Promise.all(n.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let i=s[0]||An(Gd);const a=Eo(r,e.config.apiKey,e.name);let l=null;for(const h of n)try{const d=await h._get(a);if(d){const p=In._fromJSON(e,d);h!==i&&(l=p),i=h;break}}catch{}const c=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new ns(i,e,r):(i=c[0],l&&await i._set(a,l.toJSON()),await Promise.all(n.map(async h=>{if(h!==i)try{await h._remove(a)}catch{}})),new ns(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qd(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(wg(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(yg(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Ig(e))return"Blackberry";if(Ag(e))return"Webos";if(vg(e))return"Safari";if((e.includes("chrome/")||Eg(e))&&!e.includes("edge/"))return"Chrome";if(Tg(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function yg(t=bt()){return/firefox\//i.test(t)}function vg(t=bt()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Eg(t=bt()){return/crios\//i.test(t)}function wg(t=bt()){return/iemobile/i.test(t)}function Tg(t=bt()){return/android/i.test(t)}function Ig(t=bt()){return/blackberry/i.test(t)}function Ag(t=bt()){return/webos/i.test(t)}function lu(t=bt()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function $A(t=bt()){var e;return lu(t)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function qA(){return YE()&&document.documentMode===10}function bg(t=bt()){return lu(t)||Tg(t)||Ag(t)||Ig(t)||/windows phone/i.test(t)||wg(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rg(t,e=[]){let n;switch(t){case"Browser":n=Qd(bt());break;case"Worker":n=`${Qd(bt())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${ms}/${r}`}/**
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
 */class HA{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=i=>new Promise((a,l)=>{try{const c=e(i);a(c)}catch(c){l(c)}});r.onAbort=n,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const s of n)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function zA(t,e={}){return Es(t,"GET","/v2/passwordPolicy",Ia(t,e))}/**
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
 */const WA=6;class KA{constructor(e){var n,r,s,i;const a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=a.minPasswordLength)!==null&&n!==void 0?n:WA,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,s,i,a,l;const c={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,c),this.validatePasswordCharacterOptions(e,c),c.isValid&&(c.isValid=(n=c.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),c.isValid&&(c.isValid=(r=c.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),c.isValid&&(c.isValid=(s=c.containsLowercaseLetter)!==null&&s!==void 0?s:!0),c.isValid&&(c.isValid=(i=c.containsUppercaseLetter)!==null&&i!==void 0?i:!0),c.isValid&&(c.isValid=(a=c.containsNumericCharacter)!==null&&a!==void 0?a:!0),c.isValid&&(c.isValid=(l=c.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),c}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),s&&(n.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GA{constructor(e,n,r,s){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Jd(this),this.idTokenSubscription=new Jd(this),this.beforeStateQueue=new HA(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=cg,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=An(n)),this._initializationPromise=this.queue(async()=>{var r,s;if(!this._deleted&&(this.persistenceManager=await ns.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await mg(this,{idToken:e}),r=await In._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(wn(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,l=s==null?void 0:s._redirectEventId,c=await this.tryRedirectSignIn(e);(!a||a===l)&&(c!=null&&c.user)&&(s=c.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(a){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return ce(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await jo(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=kA()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(wn(this.app))return Promise.reject(Zn(this));const n=e?Rt(e):null;return n&&ce(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&ce(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return wn(this.app)?Promise.reject(Zn(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return wn(this.app)?Promise.reject(Zn(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(An(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await zA(this),n=new KA(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new Ti("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await jA(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&An(e)||this._popupRedirectResolver;ce(n,this,"argument-error"),this.redirectPersistenceManager=await ns.create(this,[An(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,s){if(this._deleted)return()=>{};const i=typeof n=="function"?n:n.next.bind(n);let a=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(ce(l,this,"internal-error"),l.then(()=>{a||i(this.currentUser)}),typeof n=="function"){const c=e.addObserver(n,r,s);return()=>{a=!0,c()}}else{const c=e.addObserver(n);return()=>{a=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ce(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Rg(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(n["X-Firebase-AppCheck"]=s),n}async _getAppCheckToken(){var e;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&SA(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function Aa(t){return Rt(t)}class Jd{constructor(e){this.auth=e,this.observer=null,this.addObserver=iw(n=>this.observer=n)}get next(){return ce(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let cu={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function QA(t){cu=t}function JA(t){return cu.loadJS(t)}function YA(){return cu.gapiScript}function XA(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ZA(t,e){const n=Ic(t,"auth");if(n.isInitialized()){const s=n.getImmediate(),i=n.getOptions();if(xo(i,e??{}))return s;kn(s,"already-initialized")}return n.initialize({options:e})}function eb(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(An);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function tb(t,e,n){const r=Aa(t);ce(r._canInitEmulator,r,"emulator-config-failed"),ce(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!!(n!=null&&n.disableWarnings),i=Sg(e),{host:a,port:l}=nb(e),c=l===null?"":`:${l}`;r.config.emulator={url:`${i}//${a}${c}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:a,port:l,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})}),s||rb()}function Sg(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function nb(t){const e=Sg(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:Yd(r.substr(i.length+1))}}else{const[i,a]=r.split(":");return{host:i,port:Yd(a)}}}function Yd(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function rb(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pg{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return Tn("not implemented")}_getIdTokenResponse(e){return Tn("not implemented")}_linkToIdToken(e,n){return Tn("not implemented")}_getReauthenticationResolver(e){return Tn("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function rs(t,e){return fg(t,"POST","/v1/accounts:signInWithIdp",Ia(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sb="http://localhost";class Rr extends Pg{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new Rr(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):kn("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=n,i=su(n,["providerId","signInMethod"]);if(!r||!s)return null;const a=new Rr(r,s);return a.idToken=i.idToken||void 0,a.accessToken=i.accessToken||void 0,a.secret=i.secret,a.nonce=i.nonce,a.pendingToken=i.pendingToken||null,a}_getIdTokenResponse(e){const n=this.buildRequest();return rs(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,rs(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,rs(e,n)}buildRequest(){const e={requestUri:sb,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Ii(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cg{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Vi extends Cg{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $n extends Vi{constructor(){super("facebook.com")}static credential(e){return Rr._fromParams({providerId:$n.PROVIDER_ID,signInMethod:$n.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return $n.credentialFromTaggedObject(e)}static credentialFromError(e){return $n.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return $n.credential(e.oauthAccessToken)}catch{return null}}}$n.FACEBOOK_SIGN_IN_METHOD="facebook.com";$n.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qn extends Vi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return Rr._fromParams({providerId:qn.PROVIDER_ID,signInMethod:qn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return qn.credentialFromTaggedObject(e)}static credentialFromError(e){return qn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return qn.credential(n,r)}catch{return null}}}qn.GOOGLE_SIGN_IN_METHOD="google.com";qn.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hn extends Vi{constructor(){super("github.com")}static credential(e){return Rr._fromParams({providerId:Hn.PROVIDER_ID,signInMethod:Hn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Hn.credentialFromTaggedObject(e)}static credentialFromError(e){return Hn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Hn.credential(e.oauthAccessToken)}catch{return null}}}Hn.GITHUB_SIGN_IN_METHOD="github.com";Hn.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zn extends Vi{constructor(){super("twitter.com")}static credential(e,n){return Rr._fromParams({providerId:zn.PROVIDER_ID,signInMethod:zn.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return zn.credentialFromTaggedObject(e)}static credentialFromError(e){return zn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return zn.credential(n,r)}catch{return null}}}zn.TWITTER_SIGN_IN_METHOD="twitter.com";zn.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ib(t,e){return fg(t,"POST","/v1/accounts:signUp",Ia(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ir{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,s=!1){const i=await In._fromIdTokenResponse(e,r,s),a=Xd(r);return new ir({user:i,providerId:a,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const s=Xd(r);return new ir({user:e,providerId:s,_tokenResponse:r,operationType:n})}}function Xd(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ob(t){var e;if(wn(t.app))return Promise.reject(Zn(t));const n=Aa(t);if(await n._initializationPromise,!((e=n.currentUser)===null||e===void 0)&&e.isAnonymous)return new ir({user:n.currentUser,providerId:null,operationType:"signIn"});const r=await ib(n,{returnSecureToken:!0}),s=await ir._fromIdTokenResponse(n,"signIn",r,!0);return await n._updateCurrentUser(s.user),s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $o extends Vn{constructor(e,n,r,s){var i;super(n.code,n.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,$o.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,s){return new $o(e,n,r,s)}}function kg(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?$o._fromErrorAndOperation(t,i,e,r):i})}async function ab(t,e,n=!1){const r=await vi(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return ir._forOperation(t,"link",r)}/**
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
 */async function lb(t,e,n=!1){const{auth:r}=t;if(wn(r.app))return Promise.reject(Zn(r));const s="reauthenticate";try{const i=await vi(t,kg(r,s,e,t),n);ce(i.idToken,r,"internal-error");const a=au(i.idToken);ce(a,r,"internal-error");const{sub:l}=a;return ce(t.uid===l,r,"user-mismatch"),ir._forOperation(t,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&kn(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function cb(t,e,n=!1){if(wn(t.app))return Promise.reject(Zn(t));const r="signIn",s=await kg(t,r,e),i=await ir._fromIdTokenResponse(t,r,s);return n||await t._updateCurrentUser(i.user),i}function ub(t,e,n,r){return Rt(t).onIdTokenChanged(e,n,r)}function hb(t,e,n){return Rt(t).beforeAuthStateChanged(e,n)}const qo="__sak";/**
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
 */class xg{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(qo,"1"),this.storage.removeItem(qo),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const db=1e3,fb=10;class Dg extends xg{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=bg(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),s=this.localCache[n];r!==s&&e(n,s,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((a,l,c)=>{this.notifyListeners(a,c)});return}const r=e.key;n?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!n&&this.localCache[r]===a||this.notifyListeners(r,a)},i=this.storage.getItem(r);qA()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,fb):s()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},db)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}Dg.type="LOCAL";const pb=Dg;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vg extends xg{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}Vg.type="SESSION";const Ng=Vg;/**
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
 */function mb(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
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
 */class ba{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(s=>s.isListeningto(e));if(n)return n;const r=new ba(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:s,data:i}=n.data,a=this.handlersMap[s];if(!(a!=null&&a.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const l=Array.from(a).map(async h=>h(n.origin,i)),c=await mb(l);n.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:c})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}ba.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function uu(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
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
 */class gb{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,a;return new Promise((l,c)=>{const h=uu("",20);s.port1.start();const d=setTimeout(()=>{c(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(p){const g=p;if(g.data.eventId===h)switch(g.data.status){case"ack":clearTimeout(d),i=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),l(g.data.response);break;default:clearTimeout(d),clearTimeout(i),c(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:h,data:n},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function un(){return window}function _b(t){un().location.href=t}/**
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
 */function Og(){return typeof un().WorkerGlobalScope<"u"&&typeof un().importScripts=="function"}async function yb(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function vb(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)===null||t===void 0?void 0:t.controller)||null}function Eb(){return Og()?self:null}/**
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
 */const Mg="firebaseLocalStorageDb",wb=1,Ho="firebaseLocalStorage",Lg="fbase_key";class Ni{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function Ra(t,e){return t.transaction([Ho],e?"readwrite":"readonly").objectStore(Ho)}function Tb(){const t=indexedDB.deleteDatabase(Mg);return new Ni(t).toPromise()}function ec(){const t=indexedDB.open(Mg,wb);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(Ho,{keyPath:Lg})}catch(s){n(s)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(Ho)?e(r):(r.close(),await Tb(),e(await ec()))})})}async function Zd(t,e,n){const r=Ra(t,!0).put({[Lg]:e,value:n});return new Ni(r).toPromise()}async function Ib(t,e){const n=Ra(t,!1).get(e),r=await new Ni(n).toPromise();return r===void 0?null:r.value}function ef(t,e){const n=Ra(t,!0).delete(e);return new Ni(n).toPromise()}const Ab=800,bb=3;class Fg{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await ec(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>bb)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Og()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=ba._getInstance(Eb()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var e,n;if(this.activeServiceWorker=await yb(),!this.activeServiceWorker)return;this.sender=new gb(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((n=r[0])===null||n===void 0)&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||vb()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await ec();return await Zd(e,qo,"1"),await ef(e,qo),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>Zd(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>Ib(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>ef(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=Ra(s,!1).getAll();return new Ni(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),n.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),n.push(s));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Ab)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}Fg.type="LOCAL";const Rb=Fg;new Di(3e4,6e4);/**
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
 */function Sb(t,e){return e?An(e):(ce(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class hu extends Pg{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return rs(e,this._buildIdpRequest())}_linkToIdToken(e,n){return rs(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return rs(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function Pb(t){return cb(t.auth,new hu(t),t.bypassAuthState)}function Cb(t){const{auth:e,user:n}=t;return ce(n,e,"internal-error"),lb(n,new hu(t),t.bypassAuthState)}async function kb(t){const{auth:e,user:n}=t;return ce(n,e,"internal-error"),ab(n,new hu(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ug{constructor(e,n,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:s,tenantId:i,error:a,type:l}=e;if(a){this.reject(a);return}const c={auth:this.auth,requestUri:n,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(c))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Pb;case"linkViaPopup":case"linkViaRedirect":return kb;case"reauthViaPopup":case"reauthViaRedirect":return Cb;default:kn(this.auth,"internal-error")}}resolve(e){xn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){xn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xb=new Di(2e3,1e4);class Kr extends Ug{constructor(e,n,r,s,i){super(e,n,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Kr.currentPopupAction&&Kr.currentPopupAction.cancel(),Kr.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return ce(e,this.auth,"internal-error"),e}async onExecution(){xn(this.filter.length===1,"Popup operations only handle one event");const e=uu();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(cn(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(cn(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Kr.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if(!((r=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(cn(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,xb.get())};e()}}Kr.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Db="pendingRedirect",wo=new Map;class Vb extends Ug{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=wo.get(this.auth._key());if(!e){try{const r=await Nb(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}wo.set(this.auth._key(),e)}return this.bypassAuthState||wo.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Nb(t,e){const n=Lb(e),r=Mb(t);if(!await r._isAvailable())return!1;const s=await r._get(n)==="true";return await r._remove(n),s}function Ob(t,e){wo.set(t._key(),e)}function Mb(t){return An(t._redirectPersistence)}function Lb(t){return Eo(Db,t.config.apiKey,t.name)}async function Fb(t,e,n=!1){if(wn(t.app))return Promise.reject(Zn(t));const r=Aa(t),s=Sb(r,e),a=await new Vb(r,s,n).execute();return a&&!n&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ub=10*60*1e3;class Bb{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!jb(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!Bg(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";n.onError(cn(this.auth,s))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Ub&&this.cachedEventUids.clear(),this.cachedEventUids.has(tf(e))}saveEventToCache(e){this.cachedEventUids.add(tf(e)),this.lastProcessedEventTime=Date.now()}}function tf(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function Bg({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function jb(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return Bg(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $b(t,e={}){return Es(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qb=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Hb=/^https?/;async function zb(t){if(t.config.emulator)return;const{authorizedDomains:e}=await $b(t);for(const n of e)try{if(Wb(n))return}catch{}kn(t,"unauthorized-domain")}function Wb(t){const e=Xl(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const a=new URL(t);return a.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&a.hostname===r}if(!Hb.test(n))return!1;if(qb.test(t))return r===t;const s=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
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
 */const Kb=new Di(3e4,6e4);function nf(){const t=un().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function Gb(t){return new Promise((e,n)=>{var r,s,i;function a(){nf(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{nf(),n(cn(t,"network-request-failed"))},timeout:Kb.get()})}if(!((s=(r=un().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=un().gapi)===null||i===void 0)&&i.load)a();else{const l=XA("iframefcb");return un()[l]=()=>{gapi.load?a():n(cn(t,"network-request-failed"))},JA(`${YA()}?onload=${l}`).catch(c=>n(c))}}).catch(e=>{throw To=null,e})}let To=null;function Qb(t){return To=To||Gb(t),To}/**
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
 */const Jb=new Di(5e3,15e3),Yb="__/auth/iframe",Xb="emulator/auth/iframe",Zb={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},eR=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function tR(t){const e=t.config;ce(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?ou(e,Xb):`https://${t.config.authDomain}/${Yb}`,r={apiKey:e.apiKey,appName:t.name,v:ms},s=eR.get(t.config.apiHost);s&&(r.eid=s);const i=t._getFrameworks();return i.length&&(r.fw=i.join(",")),`${n}?${Ii(r).slice(1)}`}async function nR(t){const e=await Qb(t),n=un().gapi;return ce(n,t,"internal-error"),e.open({where:document.body,url:tR(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Zb,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const a=cn(t,"network-request-failed"),l=un().setTimeout(()=>{i(a)},Jb.get());function c(){un().clearTimeout(l),s(r)}r.ping(c).then(c,()=>{i(a)})}))}/**
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
 */const rR={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},sR=500,iR=600,oR="_blank",aR="http://localhost";class rf{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function lR(t,e,n,r=sR,s=iR){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const c=Object.assign(Object.assign({},rR),{width:r.toString(),height:s.toString(),top:i,left:a}),h=bt().toLowerCase();n&&(l=Eg(h)?oR:n),yg(h)&&(e=e||aR,c.scrollbars="yes");const d=Object.entries(c).reduce((g,[y,x])=>`${g}${y}=${x},`,"");if($A(h)&&l!=="_self")return cR(e||"",l),new rf(null);const p=window.open(e||"",l,d);ce(p,t,"popup-blocked");try{p.focus()}catch{}return new rf(p)}function cR(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
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
 */const uR="__/auth/handler",hR="emulator/auth/handler",dR=encodeURIComponent("fac");async function sf(t,e,n,r,s,i){ce(t.config.authDomain,t,"auth-domain-config-required"),ce(t.config.apiKey,t,"invalid-api-key");const a={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:ms,eventId:s};if(e instanceof Cg){e.setDefaultLanguage(t.languageCode),a.providerId=e.providerId||"",sw(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,p]of Object.entries(i||{}))a[d]=p}if(e instanceof Vi){const d=e.getScopes().filter(p=>p!=="");d.length>0&&(a.scopes=d.join(","))}t.tenantId&&(a.tid=t.tenantId);const l=a;for(const d of Object.keys(l))l[d]===void 0&&delete l[d];const c=await t._getAppCheckToken(),h=c?`#${dR}=${encodeURIComponent(c)}`:"";return`${fR(t)}?${Ii(l).slice(1)}${h}`}function fR({config:t}){return t.emulator?ou(t,hR):`https://${t.authDomain}/${uR}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pl="webStorageSupport";class pR{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Ng,this._completeRedirectFn=Fb,this._overrideRedirectResult=Ob}async _openPopup(e,n,r,s){var i;xn((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const a=await sf(e,n,r,Xl(),s);return lR(e,a,uu())}async _openRedirect(e,n,r,s){await this._originValidation(e);const i=await sf(e,n,r,Xl(),s);return _b(i),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:s,promise:i}=this.eventManagers[n];return s?Promise.resolve(s):(xn(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await nR(e),r=new Bb(e);return n.register("authEvent",s=>(ce(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(pl,{type:pl},s=>{var i;const a=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[pl];a!==void 0&&n(!!a),kn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=zb(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return bg()||vg()||lu()}}const mR=pR;var of="@firebase/auth",af="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gR{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){ce(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _R(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function yR(t){as(new wr("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:a,authDomain:l}=r.options;ce(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:a,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Rg(t)},h=new GA(r,s,i,c);return eb(h,n),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),as(new wr("auth-internal",e=>{const n=Aa(e.getProvider("auth").getImmediate());return(r=>new gR(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Jn(of,af,_R(t)),Jn(of,af,"esm2017")}/**
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
 */const vR=5*60,ER=Op("authIdTokenMaxAge")||vR;let lf=null;const wR=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>ER)return;const s=n==null?void 0:n.token;lf!==s&&(lf=s,await fetch(t,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function TR(t=Up()){const e=Ic(t,"auth");if(e.isInitialized())return e.getImmediate();const n=ZA(t,{popupRedirectResolver:mR,persistence:[Rb,pb,Ng]}),r=Op("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const a=wR(i.toString());hb(n,a,()=>a(n.currentUser)),ub(n,l=>a(l))}}const s=Vp("auth");return s&&tb(n,`http://${s}`),n}function IR(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}QA({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=s=>{const i=cn("internal-error");i.customData=s,n(i)},r.type="text/javascript",r.charset="UTF-8",IR().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});yR("Browser");const AR={apiKey:"AIzaSyDCqJRmxKiIzuAhgXsmXICCx_O65aujNa0",authDomain:"impro-selector.firebaseapp.com",projectId:"impro-selector",storageBucket:"impro-selector.appspot.com",messagingSenderId:"730278491306",appId:"1:730278491306:web:c966af1179221e91118cd3",measurementId:"G-3NB062D088"},jg=Fp(AR),Ue=oA(jg),bR=TR(jg);ob(bR);const RR="seasons";async function SR(){const t=sg(Ze(Ue,RR),yA("createdAt","desc"));return(await ft(t)).docs.map(n=>({id:n.id,...n.data()}))}const PR={class:"container mx-auto py-8"},CR={class:"flex flex-wrap gap-6 justify-center"},kR=["onClick"],xR={class:"text-xl font-semibold mb-2 text-center"},DR={class:"text-gray-500 text-center"},VR={__name:"Home",setup(t){const e=Oe([]),n=OE();mc(async()=>{e.value=await SR(),console.log("Saisons chargées:",e.value)});function r(s){n.push(`/season/${s}`)}return(s,i)=>(Ce(),De("div",PR,[i[0]||(i[0]=W("h1",{class:"text-3xl font-bold mb-6 text-center"},"Saisons",-1)),W("div",CR,[(Ce(!0),De(ut,null,gr(e.value,a=>(Ce(),De("div",{key:a.id,class:"bg-white shadow-lg rounded-lg p-6 w-64 cursor-pointer hover:shadow-xl transition",onClick:l=>r(a.slug)},[W("h2",xR,rn(a.name),1),W("p",DR,"Slug : "+rn(a.slug),1)],8,kR))),128))])]))}};let xt="mock";const Sr=[{id:"p1",name:"Alice"},{id:"p2",name:"Bob"},{id:"p3",name:"Charlie"},{id:"p4",name:"David"},{id:"p5",name:"Eva"},{id:"p6",name:"Fanny"},{id:"p7",name:"Georges"},{id:"p8",name:"Hélène"},{id:"p9",name:"Ismaël"},{id:"p10",name:"Jade"},{id:"p11",name:"Karim"},{id:"p12",name:"Léa"},{id:"p13",name:"Marc"},{id:"p14",name:"Nina"},{id:"p15",name:"Oscar"}],Pr=[{id:"event1",title:"Apérock Septembre",date:"2025-09-08"},{id:"event2",title:"Match à Cambo",date:"2025-11-25"},{id:"event3",title:"Impro des Familles",date:"2025-12-02"},{id:"event4",title:"Cabaret Surprise",date:"2026-01-20"},{id:"event5",title:"Impro Plage",date:"2026-03-10"}];function NR(t){xt=t}async function cf(){return(xt==="firebase"?(await ft(Ze(Ue,"events"))).docs.map(e=>({id:e.id,...e.data()})):Pr).sort((e,n)=>{const r=new Date(e.date),s=new Date(n.date);return r<s?-1:r>s?1:e.title.localeCompare(n.title)})}async function uf(){return(xt==="firebase"?(await ft(Ze(Ue,"players"))).docs.map(e=>({id:e.id,...e.data()})):Sr).sort((e,n)=>e.order<n.order?-1:e.order>n.order?1:e.name.localeCompare(n.name))}async function OR(t){if(xt==="firebase"){const e=Nt(Ze(Ue,"players"));return await Qt(e,{name:t}),e.id}else{const e=`p${Sr.length+1}`;return Sr.push({id:e,name:t}),e}}async function MR(t){if(xt==="firebase"){await Yl(Nt(Ue,"players",t));const e=await ft(Ze(Ue,"availability")),n=ag(Ue);e.forEach(r=>{const s=r.data();if(s[t]!==void 0){const i={...s};delete i[t],n.update(r.ref,i)}}),await n.commit()}else Sr=Sr.filter(e=>e.id!==t)}async function LR(t,e){if(xt==="firebase")await Qt(Nt(Ue,"players",t),{name:e});else{const n=Sr.findIndex(r=>r.id===t);n!==-1&&(Sr[n]=e)}}async function oo(t,e){if(xt==="firebase"){const n=await ft(Ze(Ue,"availability")),r={};return n.forEach(s=>{r[s.id]=s.data()}),r}else{const n={};return t.forEach(r=>{n[r.name]={},e.forEach(s=>{n[r.name][s.id]=void 0})}),e.forEach(r=>{const s=[...t].sort(()=>.5-Math.random());s.slice(0,4).forEach(i=>{n[i.name][r.id]=!0}),s.slice(4).forEach(i=>{const a=Math.random();n[i.name][r.id]=a<.4?!0:a<.8?!1:void 0})}),n}}async function ao(){if(xt==="firebase"){const t=await ft(Ze(Ue,"selections")),e={};return t.forEach(n=>{e[n.id]=n.data().players||[]}),e}else return{}}async function hf(t,e){xt==="firebase"&&await Qt(Nt(Ue,"availability",t),e)}async function FR(t,e){xt==="firebase"&&await Qt(Nt(Ue,"selections",t),{players:e})}async function UR(t){if(console.log("Suppression de l'événement:",t),xt==="firebase")try{console.log("Suppression de l'événement dans Firestore"),await Yl(Nt(Ue,"events",t)),console.log("Suppression de la sélection associée"),await Yl(Nt(Ue,"selections",t)),console.log("Suppression des disponibilités");const e=await ft(Ze(Ue,"availability")),n=ag(Ue);e.forEach(r=>{const s=r.data();if(s[t]!==void 0){console.log("Mise à jour de la disponibilité pour:",r.id);const i={...s};delete i[t],n.update(r.ref,i)}}),await n.commit(),console.log("Opérations de suppression terminées avec succès")}catch(e){throw console.error("Erreur lors de la suppression:",e),e}else Pr=Pr.filter(e=>e.id!==t)}async function BR(t){if(xt==="firebase"){const e=Nt(Ze(Ue,"events"));return await Qt(e,t),e.id}else{const e=`event${Pr.length+1}`;return Pr.push({id:e,...t}),e}}async function jR(t,e){if(xt==="firebase")await Qt(Nt(Ue,"events",t),e);else{const n=Pr.findIndex(r=>r.id===t);n!==-1&&(Pr[n]={id:t,...e})}}async function $R(){if(xt!=="firebase"||!(await ft(Ze(Ue,"seasons"))).empty)return;const e=Nt(Ze(Ue,"seasons"));await Qt(e,{name:"Malice 2025-2026",slug:"malice-2025-2026",createdAt:bA()});const n=await ft(Ze(Ue,"players"));for(const a of n.docs)await Qt(Nt(e,"players",a.id),a.data());const r=await ft(Ze(Ue,"events"));for(const a of r.docs)await Qt(Nt(e,"events",a.id),a.data());const s=await ft(Ze(Ue,"availability"));for(const a of s.docs)await Qt(Nt(e,"availability",a.id),a.data());const i=await ft(Ze(Ue,"selections"));for(const a of i.docs)await Qt(Nt(e,"selections",a.id),a.data())}async function qR(){xt==="firebase"&&await $R()}const HR={class:"relative"},zR={class:"text-3xl font-bold text-center my-4"},WR={class:"sticky top-0 bg-white z-50 shadow overflow-x-auto"},KR={class:"border-collapse border border-gray-400 w-full table-fixed"},GR={class:"bg-gray-100 text-gray-800 text-4xl sm:text-base"},QR={class:"p-3 text-left"},JR={class:"flex items-center justify-center space-x-2"},YR=["onMouseenter","onDblclick"],XR={class:"flex flex-col gap-2"},ZR={class:"flex flex-col items-center space-y-1 relative"},eS={key:0,class:"font-semibold text-4xl sm:text-base text-center whitespace-pre-wrap relative group"},tS=["title"],nS={key:1,class:"w-full"},rS=["title"],sS={key:3,class:"w-full"},iS=["onClick"],oS={class:"p-3 text-center"},aS={class:"bg-gray-50"},lS=["onClick","title"],cS={class:"overflow-x-auto overflow-y-auto max-h-[calc(100vh-100px)]"},uS={class:"table-auto border-collapse border border-gray-400 w-full table-fixed"},hS={class:"border-t"},dS=["data-player-id"],fS={class:"p-4 sm:p-3 font-medium text-gray-900 w-[100px] relative group text-4xl sm:text-base"},pS={key:0,class:"font-semibold text-4xl sm:text-base whitespace-pre-wrap flex items-center justify-between"},mS=["onDblclick","title"],gS=["onClick"],_S={key:1,class:"w-full"},yS={class:"p-4 sm:p-3 text-center text-gray-700 text-4xl sm:text-base w-[100px]"},vS=["title"],ES=["onClick"],wS=["title"],TS=["title"],IS=["title"],AS=["title"],bS={key:0,class:"fixed bottom-4 left-4 bg-green-500 text-white p-4 rounded-lg shadow-lg"},RS={key:1,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"},SS={class:"bg-white p-6 rounded-lg shadow-lg w-96"},PS={class:"mb-4"},CS={class:"mb-4"},kS={key:2,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"},xS={class:"bg-white p-6 rounded-lg shadow-lg w-96"},DS={class:"mb-4"},VS={class:"flex justify-end space-x-2"},NS={key:3,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"},OS={key:4,class:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"},MS={key:5,class:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"},LS={__name:"GridBoard",props:{slug:{type:String,required:!0}},setup(t){const n=t.slug,r=Oe(""),s=Oe(""),i=Oe(!1),a=Oe(null),l=Oe(null),c=Oe(""),h=Oe(""),d=Oe(null),p=Oe(""),g=Oe(!1),y=Oe(""),x=Oe(null),N=Oe(!1),L=Oe(null);function K(V){x.value=V;const R=document.querySelector(`[data-player-id="${V}"]`);R&&R.scrollIntoView({behavior:"smooth",block:"center"}),U.value=!0,H.value="Nouveau joueur ajouté !",setTimeout(()=>{U.value=!1},3e3)}const U=Oe(!1),H=Oe("");async function J(V){a.value=V,i.value=!0}async function ge(){i.value=!1;try{await UR(a.value),ke.value=ke.value.filter(V=>V.id!==a.value),await Promise.all([cf(),oo(Ne.value,ke.value),ao()]).then(([V,R,k])=>{ke.value=V,we.value=R,Ae.value=k}),a.value=null,U.value=!0,H.value="Événement supprimé avec succès !",setTimeout(()=>{U.value=!1},3e3)}catch(V){console.error("Erreur lors de la suppression de l'événement:",V),alert("Erreur lors de la suppression de l'événement. Veuillez réessayer.")}}function ye(){i.value=!1,a.value=null}function I(V){l.value=V.id,c.value=V.title,h.value=V.date}async function v(){if(!(!l.value||!c.value.trim()||!h.value))try{const V={title:c.value.trim(),date:h.value};await jR(l.value,V),await Promise.all([cf(),oo(Ne.value,ke.value),ao()]).then(([R,k,Q])=>{ke.value=R,we.value=k,Ae.value=Q}),l.value=null,c.value="",h.value="",U.value=!0,H.value="Événement mis à jour avec succès !",setTimeout(()=>{U.value=!1},3e3)}catch(V){console.error("Erreur lors de l'édition de l'événement:",V),alert("Erreur lors de l'édition de l'événement. Veuillez réessayer.")}}function T(V){d.value=V.id,p.value=V.name,dc(()=>{editPlayerInput.value&&editPlayerInput.value.focus()})}async function A(){if(!(!d.value||!p.value.trim()))try{await LR(d.value,p.value.trim()),await Promise.all([uf(),oo(Ne.value,ke.value),ao()]).then(([V,R,k])=>{Ne.value=V,we.value=R,Ae.value=k}),d.value=null,p.value="",U.value=!0,H.value="Joueur mis à jour avec succès !",setTimeout(()=>{U.value=!1},3e3)}catch(V){console.error("Erreur lors de l'édition du joueur:",V),alert("Erreur lors de l'édition du joueur. Veuillez réessayer.")}}function b(){d.value=null,p.value=""}async function P(){if(y.value.trim())try{const V=y.value.trim(),R=await OR(V);await Promise.all([uf(),oo(Ne.value,ke.value),ao()]).then(([k,Q,Te])=>{Ne.value=k,we.value=Q,Ae.value=Te;const _e=Ne.value.find(Ie=>Ie.id===R);K(R);const le=document.querySelector(`[data-player-id="${R}"]`);le&&le.scrollIntoView({behavior:"smooth",block:"center"}),U.value=!0,H.value="Joueur ajouté avec succès ! Vous pouvez maintenant indiquer sa disponibilité.",setTimeout(()=>{U.value=!1},3e3),setTimeout(()=>{U.value=!1,H.value=""},5e3)}),g.value=!1,y.value=""}catch(V){console.error("Erreur lors de l'ajout du joueur:",V),alert("Erreur lors de l'ajout du joueur. Veuillez réessayer.")}}function w(){l.value=null,c.value="",h.value=""}const nt=Oe(null),at=Oe(!1),je=Oe(""),ve=Oe("");async function Ee(){if(!je.value.trim()||!ve.value){alert("Veuillez remplir le titre et la date de l'événement");return}const V={title:je.value.trim(),date:ve.value};try{const R=await BR(V);ke.value=[...ke.value,{id:R,...V}];const k={};for(const Q of Ne.value)k[Q.name]=we.value[Q.name]||{},k[Q.name][R]=null,await hf(Q.name,k[Q.name]);je.value="",ve.value="",at.value=!1,await Promise.resolve()}catch(R){console.error("Erreur lors de la création de l'événement:",R),alert("Erreur lors de la création de l'événement. Veuillez réessayer.")}}function St(){je.value="",ve.value="",at.value=!1}const ke=Oe([]),Ne=Oe([]),we=Oe({}),Ae=Oe({}),en=Oe({}),Ot=Oe({});mc(async()=>{NR("firebase"),await qR();const V=sg(Ze(Ue,"seasons"),_A("slug","==",n)),R=await ft(V);if(!R.empty){const k=R.docs[0];s.value=k.id,r.value=k.data().name,document.title=`Saison : ${r.value}`}if(s.value){const k=await ft(Ze(Ue,"seasons",s.value,"players"));Ne.value=k.docs.map(Ke=>({id:Ke.id,...Ke.data()}));const Q=await ft(Ze(Ue,"seasons",s.value,"events"));ke.value=Q.docs.map(Ke=>({id:Ke.id,...Ke.data()}));const Te=await ft(Ze(Ue,"seasons",s.value,"availability")),_e={};Te.docs.forEach(Ke=>{_e[Ke.id]=Ke.data()}),we.value=_e;const le=await ft(Ze(Ue,"seasons",s.value,"selections")),Ie={};le.docs.forEach(Ke=>{Ie[Ke.id]=Ke.data().players||[]}),Ae.value=Ie}C(),B(),console.log("players (deduplicated):",Ne.value.map(k=>({id:k.id,name:k.name})))});function gt(V,R){const k=Ne.value.find(le=>le.name===V);if(!k){console.error("Joueur non trouvé:",V);return}if(!ke.value.find(le=>le.id===R)){console.error("Événement non trouvé:",R);return}k.availabilities||(k.availabilities={});const Te=k.availabilities[R];let _e;Te==="oui"?(_e="non",k.availabilities[R]=_e):Te==="non"?(delete k.availabilities[R],_e=void 0):(_e="oui",k.availabilities[R]=_e),_e===void 0?we.value[k.name]&&delete we.value[k.name][R]:(we.value[k.name]||(we.value[k.name]={}),we.value[k.name][R]=_e==="oui"),hf(k.name,{...k.availabilities}).then(()=>{U.value=!0,H.value="Disponibilité mise à jour avec succès !",setTimeout(()=>{U.value=!1},3e3)}).catch(le=>{console.error("Erreur lors de la mise à jour de la disponibilité:",le),alert("Erreur lors de la mise à jour de la disponibilité. Veuillez réessayer.")})}function O(V,R){var k;return(k=we.value[V])==null?void 0:k[R]}function te(V,R){var Te;const k=Ae.value[R]||[],Q=(Te=we.value[V])==null?void 0:Te[R];return k.includes(V)&&Q===!0}async function ee(V,R=6){const Q=Ne.value.filter(le=>O(le.name,V)).map(le=>{const Ie=pe(le.name);return{name:le.name,weight:1/(1+Ie)}}),Te=[],_e=[...Q];for(;Te.length<R&&_e.length>0;){const le=_e.reduce((fn,rt)=>fn+rt.weight,0);let Ie=Math.random()*le;const Ke=_e.findIndex(fn=>(Ie-=fn.weight,Ie<=0));Ke>=0&&(Te.push(_e[Ke].name),_e.splice(Ke,1))}Ae.value[V]=Te,await FR(V,Te),C(),B()}function re(V){var k;return V?(typeof V=="string"?new Date(V):((k=V.toDate)==null?void 0:k.call(V))||V).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}):""}function pe(V){return Object.values(Ae.value).filter(R=>R.includes(V)).length}function Se(V){const R=we.value[V]||{};return Object.values(R).filter(k=>k===!0).length}function _(V){const R=Se(V),k=pe(V);return R===0?0:k/R}function E(V){en.value[V]={availability:Se(V),selection:pe(V),ratio:_(V)}}function C(){Ne.value.forEach(V=>E(V.name))}function B(V=6){const R={};ke.value.forEach(k=>{const Te=Ne.value.filter(le=>O(le.name,k.id)===!0).map(le=>{const Ie=pe(le.name);return{name:le.name,weight:1/(1+Ie)}}),_e=Te.reduce((le,Ie)=>le+Ie.weight,0);Te.forEach(le=>{const Ie=Math.min(1,le.weight/_e*V);R[le.name]||(R[le.name]={}),R[le.name][k.id]=Math.round(Ie*100)})}),Ot.value=R}function M(V,R){var le,Ie;const k=V.name,Q=O(k,R),Te=te(k,R),_e=((Ie=(le=Ot.value)==null?void 0:le[k])==null?void 0:Ie[R])??0;return Q===!1?"Non disponible – cliquez pour changer":Te?`Sélectionné · Chance estimée : ${_e}%`:Q===!0?`Disponible · Chance estimée : ${_e}%`:"Cliquez pour indiquer votre disponibilité"}const j=Oe(null),Y=Oe(!1);async function G(){Y.value=!1;try{await MR(j.value),Ne.value=Ne.value.filter(V=>V.id!==j.value),j.value=null,U.value=!0,H.value="Joueur supprimé avec succès !",setTimeout(()=>{U.value=!1},3e3)}catch(V){console.error("Erreur lors de la suppression du joueur :",V),alert("Erreur lors de la suppression du joueur. Veuillez réessayer.")}}function z(){Y.value=!1,j.value=null}function q(V){j.value=V,Y.value=!0}function oe(V,R=6){Ae.value[V]&&Ae.value[V].length>0?(N.value=!0,L.value=V):ee(V,R)}function Z(){L.value&&(ee(L.value,6),N.value=!1,L.value=null)}function se(){N.value=!1,L.value=null}return(V,R)=>(Ce(),De(ut,null,[W("div",HR,[W("h1",zR,rn(r.value?`Saison : ${r.value}`:""),1),W("div",WR,[W("table",KR,[W("colgroup",null,[R[10]||(R[10]=W("col",{style:{width:"10%"}},null,-1)),R[11]||(R[11]=W("col",{style:{width:"10%"}},null,-1)),(Ce(!0),De(ut,null,gr(ke.value,(k,Q)=>(Ce(),De("col",{key:Q,style:ti("width: calc(70% / "+ke.value.length+");")},null,4))),128)),R[12]||(R[12]=W("col",{style:{width:"5%"}},null,-1))]),W("thead",null,[W("tr",GR,[W("th",QR,[W("div",JR,[R[13]||(R[13]=W("span",{class:"font-semibold text-4xl sm:text-base relative group"},[W("span",{class:"border-b border-dashed border-gray-400"}," Joueur ")],-1)),W("button",{onClick:R[0]||(R[0]=k=>g.value=!0),class:"text-4xl sm:text-base text-blue-500 hover:text-blue-700 cursor-pointer",title:"Ajoutez un joueur"}," ➕ ")])]),R[14]||(R[14]=W("th",{class:"p-3 text-center"},[W("span",{class:"text-4xl sm:text-base"},"📊 Stats")],-1)),(Ce(!0),De(ut,null,gr(ke.value,k=>(Ce(),De("th",{key:k.id,class:"p-3 text-center",onMouseenter:Q=>nt.value=k.id,onMouseleave:R[3]||(R[3]=Q=>nt.value=null),onDblclick:Q=>I(k)},[W("div",XR,[W("div",ZR,[l.value!==k.id?(Ce(),De("div",eS,[W("span",{class:"hover:border-b hover:border-dashed hover:border-gray-400 cursor-help transition-colors duration-200",title:"Double-clic pour modifier : "+k.title+" - "+re(k.date)},rn(k.title),9,tS)])):(Ce(),De("div",nS,[Lr(W("input",{"onUpdate:modelValue":R[1]||(R[1]=Q=>c.value=Q),type:"text",class:"w-full p-1 border rounded",onKeydown:[Br(w,["esc"]),Br(v,["enter"])],ref_for:!0,ref:"editTitleInput"},null,544),[[Ur,c.value]])])),l.value!==k.id?(Ce(),De("div",{key:2,class:"text-xs text-gray-500 cursor-help hover:border-b hover:border-dashed hover:border-gray-400 transition-colors duration-200 inline-block",title:"Double-clic pour modifier : "+k.title+" - "+re(k.date)},rn(re(k.date)),9,rS)):(Ce(),De("div",sS,[Lr(W("input",{"onUpdate:modelValue":R[2]||(R[2]=Q=>h.value=Q),type:"date",class:"w-full p-1 border rounded",onKeydown:[Br(w,["esc"]),Br(v,["enter"])]},null,544),[[Ur,h.value]])])),W("button",{onClick:Q=>J(k.id),class:ni(["absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity",{"opacity-100":nt.value===k.id}])}," ❌ ",10,iS)])])],40,YR))),128)),W("th",oS,[W("button",{onClick:R[4]||(R[4]=k=>at.value=!0),class:"text-gray-500 hover:text-blue-500",title:"Ajouter un nouvel événement"}," ➕ ")])]),W("tr",aS,[R[15]||(R[15]=W("th",{class:"p-3 text-left w-[100px]"},null,-1)),R[16]||(R[16]=W("th",{class:"p-3 text-center text-4xl sm:text-base w-[100px]"},null,-1)),(Ce(!0),De(ut,null,gr(ke.value,k=>(Ce(),De("th",{key:k.id,class:"p-3 text-center w-40"},[W("button",{onClick:Q=>oe(k.id,6),class:"rounded-md text-2xl sm:text-base bg-white hover:bg-gray-50 hover:border-gray-200 border shadow text-gray-800 p-1 w-8 h-8 flex items-center justify-center mx-auto",title:Ae.value[k.id]&&Ae.value[k.id].length>0?"Relancer la sélection":"Lancer la sélection"}," 🎭 ",8,lS)]))),128)),R[17]||(R[17]=W("th",{class:"p-3"},null,-1))])])])]),W("div",cS,[W("table",uS,[W("colgroup",null,[R[18]||(R[18]=W("col",{style:{width:"10%"}},null,-1)),R[19]||(R[19]=W("col",{style:{width:"10%"}},null,-1)),(Ce(!0),De(ut,null,gr(ke.value,(k,Q)=>(Ce(),De("col",{key:Q,style:ti("width: calc(70% / "+ke.value.length+");")},null,4))),128)),R[20]||(R[20]=W("col",{style:{width:"5%"}},null,-1))]),W("tbody",hS,[(Ce(!0),De(ut,null,gr(Ne.value,k=>(Ce(),De("tr",{key:k.id,class:ni(["odd:bg-white even:bg-gray-50 border-b",{"highlighted-player":k.id===x.value}]),"data-player-id":k.id},[W("td",fS,[d.value!==k.id?(Ce(),De("div",pS,[W("span",{onDblclick:Q=>T(k),class:"hover:border-b hover:border-dashed hover:border-gray-400 edit-cursor transition-colors duration-200",title:"Double-clic pour modifier : "+k.name},rn(k.name),41,mS),W("button",{onClick:Q=>q(k.id),class:"hidden group-hover:block text-red-500",title:"Supprimer le joueur"}," 🗑️ ",8,gS)])):(Ce(),De("div",_S,[Lr(W("input",{"onUpdate:modelValue":R[5]||(R[5]=Q=>p.value=Q),type:"text",class:"w-full p-1 border rounded",onKeydown:[Br(b,["esc"]),Br(A,["enter"])],ref_for:!0,ref:"editPlayerInput"},null,544),[[Ur,p.value]])]))]),W("td",yS,[W("span",{title:`${pe(k.name)} sélection${pe(k.name)>1?"s":""}, ${Se(k.name)} dispo${Se(k.name)>1?"s":""}`},rn(pe(k.name))+"/"+rn(Se(k.name)),9,vS)]),(Ce(!0),De(ut,null,gr(ke.value,Q=>(Ce(),De("td",{key:Q.id,class:"p-4 sm:p-3 text-center cursor-pointer hover:bg-blue-100",onClick:Te=>gt(k.name,Q.id)},[te(k.name,Q.id)?(Ce(),De("span",{key:0,title:M(k,Q.id)}," 🎭 ",8,wS)):O(k.name,Q.id)?(Ce(),De("span",{key:1,title:M(k,Q.id)}," ✅ ",8,TS)):O(k.name,Q.id)===!1?(Ce(),De("span",{key:2,title:M(k,Q.id)}," ❌ ",8,IS)):(Ce(),De("span",{key:3,title:M(k,Q.id)}," – ",8,AS))],8,ES))),128)),R[21]||(R[21]=W("td",{class:"p-3"},null,-1))],10,dS))),128))])])])]),U.value?(Ce(),De("div",bS,rn(H.value),1)):Fr("",!0),at.value?(Ce(),De("div",RS,[W("div",SS,[R[24]||(R[24]=W("h2",{class:"text-xl font-bold mb-4"},"Nouvel événement",-1)),W("div",PS,[R[22]||(R[22]=W("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Titre",-1)),Lr(W("input",{"onUpdate:modelValue":R[6]||(R[6]=k=>je.value=k),type:"text",class:"w-full p-2 border rounded focus:ring-2 focus:ring-blue-500",placeholder:"Titre de l'événement"},null,512),[[Ur,je.value]])]),W("div",CS,[R[23]||(R[23]=W("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Date",-1)),Lr(W("input",{"onUpdate:modelValue":R[7]||(R[7]=k=>ve.value=k),type:"date",class:"w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"},null,512),[[Ur,ve.value]])]),W("div",{class:"flex justify-end space-x-2"},[W("button",{onClick:St,class:"px-4 py-2 text-gray-700 hover:text-gray-900"}," Annuler "),W("button",{onClick:Ee,class:"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"}," Créer ")])])])):Fr("",!0),g.value?(Ce(),De("div",kS,[W("div",xS,[R[26]||(R[26]=W("h2",{class:"text-xl font-bold mb-4"},"Nouveau joueur",-1)),W("div",DS,[R[25]||(R[25]=W("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Nom",-1)),Lr(W("input",{"onUpdate:modelValue":R[8]||(R[8]=k=>y.value=k),type:"text",class:"w-full p-2 border rounded focus:ring-2 focus:ring-blue-500",placeholder:"Nom du joueur"},null,512),[[Ur,y.value]])]),W("div",VS,[W("button",{onClick:R[9]||(R[9]=k=>g.value=!1),class:"px-4 py-2 text-gray-700 hover:text-gray-900"}," Annuler "),W("button",{onClick:P,class:"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"}," Ajouter ")])])])):Fr("",!0),i.value?(Ce(),De("div",NS,[W("div",{class:"bg-white p-6 rounded-lg shadow-lg w-96"},[R[27]||(R[27]=W("h2",{class:"text-xl font-bold mb-4"},"Confirmation",-1)),R[28]||(R[28]=W("p",{class:"mb-4"},"Êtes-vous sûr de vouloir supprimer ?",-1)),W("div",{class:"flex justify-end space-x-2"},[W("button",{onClick:ye,class:"px-4 py-2 text-gray-700 hover:text-gray-900"}," Annuler "),W("button",{onClick:ge,class:"px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"}," Supprimer ")])])])):Fr("",!0),Y.value?(Ce(),De("div",OS,[W("div",{class:"bg-white p-4 rounded shadow"},[R[29]||(R[29]=W("p",{class:"mb-4"},"Êtes-vous sûr de vouloir supprimer ce joueur ?",-1)),W("div",{class:"flex justify-end space-x-2"},[W("button",{onClick:z,class:"px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"},"Annuler"),W("button",{onClick:G,class:"px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"},"Supprimer")])])])):Fr("",!0),N.value?(Ce(),De("div",MS,[W("div",{class:"bg-white p-6 rounded-lg shadow-lg w-96"},[R[30]||(R[30]=W("h2",{class:"text-xl font-bold mb-4"},"Confirmation",-1)),R[31]||(R[31]=W("p",{class:"mb-4"},"Attention, toute la sélection sera refaite en fonction des disponibilités actuelles. Pensez à prévenir les gens du changement !",-1)),W("div",{class:"flex justify-end space-x-2"},[W("button",{onClick:se,class:"px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"},"Annuler"),W("button",{onClick:Z,class:"px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded"},"Confirmer")])])])):Fr("",!0)],64))}},FS=[{path:"/",component:VR},{path:"/season/:slug",component:LS,props:!0}],US=VE({history:lE("/impro-selector/"),routes:FS});Pv(xv).use(US).mount("#app");
