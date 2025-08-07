(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=t(s);fetch(s.href,i)}})();/**
* @vue/shared v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**//*! #__NO_SIDE_EFFECTS__ */function Uh(n){const e=Object.create(null);for(const t of n.split(","))e[t]=1;return t=>t in e}const dt={},Wi=[],Wn=()=>{},Mb=()=>!1,uu=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&(n.charCodeAt(2)>122||n.charCodeAt(2)<97),Bh=n=>n.startsWith("onUpdate:"),Xt=Object.assign,jh=(n,e)=>{const t=n.indexOf(e);t>-1&&n.splice(t,1)},Lb=Object.prototype.hasOwnProperty,et=(n,e)=>Lb.call(n,e),xe=Array.isArray,Qi=n=>du(n)==="[object Map]",D_=n=>du(n)==="[object Set]",Ce=n=>typeof n=="function",jt=n=>typeof n=="string",Rs=n=>typeof n=="symbol",It=n=>n!==null&&typeof n=="object",V_=n=>(It(n)||Ce(n))&&Ce(n.then)&&Ce(n.catch),N_=Object.prototype.toString,du=n=>N_.call(n),Fb=n=>du(n).slice(8,-1),O_=n=>du(n)==="[object Object]",$h=n=>jt(n)&&n!=="NaN"&&n[0]!=="-"&&""+parseInt(n,10)===n,ba=Uh(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),hu=n=>{const e=Object.create(null);return t=>e[t]||(e[t]=n(t))},Ub=/-(\w)/g,$n=hu(n=>n.replace(Ub,(e,t)=>t?t.toUpperCase():"")),Bb=/\B([A-Z])/g,Cs=hu(n=>n.replace(Bb,"-$1").toLowerCase()),fu=hu(n=>n.charAt(0).toUpperCase()+n.slice(1)),md=hu(n=>n?`on${fu(n)}`:""),ms=(n,e)=>!Object.is(n,e),mc=(n,...e)=>{for(let t=0;t<n.length;t++)n[t](...e)},Wd=(n,e,t,r=!1)=>{Object.defineProperty(n,e,{configurable:!0,enumerable:!1,writable:r,value:t})},Qd=n=>{const e=parseFloat(n);return isNaN(e)?n:e};let Wp;const pu=()=>Wp||(Wp=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function Fa(n){if(xe(n)){const e={};for(let t=0;t<n.length;t++){const r=n[t],s=jt(r)?zb(r):Fa(r);if(s)for(const i in s)e[i]=s[i]}return e}else if(jt(n)||It(n))return n}const jb=/;(?![^(]*\))/g,$b=/:([^]+)/,qb=/\/\*[^]*?\*\//g;function zb(n){const e={};return n.replace(qb,"").split(jb).forEach(t=>{if(t){const r=t.split($b);r.length>1&&(e[r[0].trim()]=r[1].trim())}}),e}function cr(n){let e="";if(jt(n))e=n;else if(xe(n))for(let t=0;t<n.length;t++){const r=cr(n[t]);r&&(e+=r+" ")}else if(It(n))for(const t in n)n[t]&&(e+=t+" ");return e.trim()}const Gb="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",Kb=Uh(Gb);function M_(n){return!!n||n===""}const L_=n=>!!(n&&n.__v_isRef===!0),_e=n=>jt(n)?n:n==null?"":xe(n)||It(n)&&(n.toString===N_||!Ce(n.toString))?L_(n)?_e(n.value):JSON.stringify(n,F_,2):String(n),F_=(n,e)=>L_(e)?F_(n,e.value):Qi(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((t,[r,s],i)=>(t[gd(r,i)+" =>"]=s,t),{})}:D_(e)?{[`Set(${e.size})`]:[...e.values()].map(t=>gd(t))}:Rs(e)?gd(e):It(e)&&!xe(e)&&!O_(e)?String(e):e,gd=(n,e="")=>{var t;return Rs(n)?`Symbol(${(t=n.description)!=null?t:e})`:n};/**
* @vue/reactivity v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let xn;class Hb{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=xn,!e&&xn&&(this.index=(xn.scopes||(xn.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].pause();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].resume();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].resume()}}run(e){if(this._active){const t=xn;try{return xn=this,e()}finally{xn=t}}}on(){++this._on===1&&(this.prevScope=xn,xn=this)}off(){this._on>0&&--this._on===0&&(xn=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let t,r;for(t=0,r=this.effects.length;t<r;t++)this.effects[t].stop();for(this.effects.length=0,t=0,r=this.cleanups.length;t<r;t++)this.cleanups[t]();if(this.cleanups.length=0,this.scopes){for(t=0,r=this.scopes.length;t<r;t++)this.scopes[t].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function Wb(){return xn}let ft;const _d=new WeakSet;class U_{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,xn&&xn.active&&xn.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,_d.has(this)&&(_d.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||j_(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,Qp(this),$_(this);const e=ft,t=Qn;ft=this,Qn=!0;try{return this.fn()}finally{q_(this),ft=e,Qn=t,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)Gh(e);this.deps=this.depsTail=void 0,Qp(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?_d.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Jd(this)&&this.run()}get dirty(){return Jd(this)}}let B_=0,Ia,Ea;function j_(n,e=!1){if(n.flags|=8,e){n.next=Ea,Ea=n;return}n.next=Ia,Ia=n}function qh(){B_++}function zh(){if(--B_>0)return;if(Ea){let e=Ea;for(Ea=void 0;e;){const t=e.next;e.next=void 0,e.flags&=-9,e=t}}let n;for(;Ia;){let e=Ia;for(Ia=void 0;e;){const t=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(r){n||(n=r)}e=t}}if(n)throw n}function $_(n){for(let e=n.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function q_(n){let e,t=n.depsTail,r=t;for(;r;){const s=r.prevDep;r.version===-1?(r===t&&(t=s),Gh(r),Qb(r)):e=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=s}n.deps=e,n.depsTail=t}function Jd(n){for(let e=n.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(z_(e.dep.computed)||e.dep.version!==e.version))return!0;return!!n._dirty}function z_(n){if(n.flags&4&&!(n.flags&16)||(n.flags&=-17,n.globalVersion===Ua)||(n.globalVersion=Ua,!n.isSSR&&n.flags&128&&(!n.deps&&!n._dirty||!Jd(n))))return;n.flags|=2;const e=n.dep,t=ft,r=Qn;ft=n,Qn=!0;try{$_(n);const s=n.fn(n._value);(e.version===0||ms(s,n._value))&&(n.flags|=128,n._value=s,e.version++)}catch(s){throw e.version++,s}finally{ft=t,Qn=r,q_(n),n.flags&=-3}}function Gh(n,e=!1){const{dep:t,prevSub:r,nextSub:s}=n;if(r&&(r.nextSub=s,n.prevSub=void 0),s&&(s.prevSub=r,n.nextSub=void 0),t.subs===n&&(t.subs=r,!r&&t.computed)){t.computed.flags&=-5;for(let i=t.computed.deps;i;i=i.nextDep)Gh(i,!0)}!e&&!--t.sc&&t.map&&t.map.delete(t.key)}function Qb(n){const{prevDep:e,nextDep:t}=n;e&&(e.nextDep=t,n.prevDep=void 0),t&&(t.prevDep=e,n.nextDep=void 0)}let Qn=!0;const G_=[];function Dr(){G_.push(Qn),Qn=!1}function Vr(){const n=G_.pop();Qn=n===void 0?!0:n}function Qp(n){const{cleanup:e}=n;if(n.cleanup=void 0,e){const t=ft;ft=void 0;try{e()}finally{ft=t}}}let Ua=0;class Jb{constructor(e,t){this.sub=e,this.dep=t,this.version=t.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class Kh{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!ft||!Qn||ft===this.computed)return;let t=this.activeLink;if(t===void 0||t.sub!==ft)t=this.activeLink=new Jb(ft,this),ft.deps?(t.prevDep=ft.depsTail,ft.depsTail.nextDep=t,ft.depsTail=t):ft.deps=ft.depsTail=t,K_(t);else if(t.version===-1&&(t.version=this.version,t.nextDep)){const r=t.nextDep;r.prevDep=t.prevDep,t.prevDep&&(t.prevDep.nextDep=r),t.prevDep=ft.depsTail,t.nextDep=void 0,ft.depsTail.nextDep=t,ft.depsTail=t,ft.deps===t&&(ft.deps=r)}return t}trigger(e){this.version++,Ua++,this.notify(e)}notify(e){qh();try{for(let t=this.subs;t;t=t.prevSub)t.sub.notify()&&t.sub.dep.notify()}finally{zh()}}}function K_(n){if(n.dep.sc++,n.sub.flags&4){const e=n.dep.computed;if(e&&!n.dep.subs){e.flags|=20;for(let r=e.deps;r;r=r.nextDep)K_(r)}const t=n.dep.subs;t!==n&&(n.prevSub=t,t&&(t.nextSub=n)),n.dep.subs=n}}const Yd=new WeakMap,Xs=Symbol(""),Xd=Symbol(""),Ba=Symbol("");function mn(n,e,t){if(Qn&&ft){let r=Yd.get(n);r||Yd.set(n,r=new Map);let s=r.get(t);s||(r.set(t,s=new Kh),s.map=r,s.key=t),s.track()}}function Ar(n,e,t,r,s,i){const o=Yd.get(n);if(!o){Ua++;return}const a=c=>{c&&c.trigger()};if(qh(),e==="clear")o.forEach(a);else{const c=xe(n),u=c&&$h(t);if(c&&t==="length"){const d=Number(r);o.forEach((f,g)=>{(g==="length"||g===Ba||!Rs(g)&&g>=d)&&a(f)})}else switch((t!==void 0||o.has(void 0))&&a(o.get(t)),u&&a(o.get(Ba)),e){case"add":c?u&&a(o.get("length")):(a(o.get(Xs)),Qi(n)&&a(o.get(Xd)));break;case"delete":c||(a(o.get(Xs)),Qi(n)&&a(o.get(Xd)));break;case"set":Qi(n)&&a(o.get(Xs));break}}zh()}function Mi(n){const e=Ze(n);return e===n?e:(mn(e,"iterate",Ba),jn(n)?e:e.map(on))}function mu(n){return mn(n=Ze(n),"iterate",Ba),n}const Yb={__proto__:null,[Symbol.iterator](){return yd(this,Symbol.iterator,on)},concat(...n){return Mi(this).concat(...n.map(e=>xe(e)?Mi(e):e))},entries(){return yd(this,"entries",n=>(n[1]=on(n[1]),n))},every(n,e){return br(this,"every",n,e,void 0,arguments)},filter(n,e){return br(this,"filter",n,e,t=>t.map(on),arguments)},find(n,e){return br(this,"find",n,e,on,arguments)},findIndex(n,e){return br(this,"findIndex",n,e,void 0,arguments)},findLast(n,e){return br(this,"findLast",n,e,on,arguments)},findLastIndex(n,e){return br(this,"findLastIndex",n,e,void 0,arguments)},forEach(n,e){return br(this,"forEach",n,e,void 0,arguments)},includes(...n){return vd(this,"includes",n)},indexOf(...n){return vd(this,"indexOf",n)},join(n){return Mi(this).join(n)},lastIndexOf(...n){return vd(this,"lastIndexOf",n)},map(n,e){return br(this,"map",n,e,void 0,arguments)},pop(){return ra(this,"pop")},push(...n){return ra(this,"push",n)},reduce(n,...e){return Jp(this,"reduce",n,e)},reduceRight(n,...e){return Jp(this,"reduceRight",n,e)},shift(){return ra(this,"shift")},some(n,e){return br(this,"some",n,e,void 0,arguments)},splice(...n){return ra(this,"splice",n)},toReversed(){return Mi(this).toReversed()},toSorted(n){return Mi(this).toSorted(n)},toSpliced(...n){return Mi(this).toSpliced(...n)},unshift(...n){return ra(this,"unshift",n)},values(){return yd(this,"values",on)}};function yd(n,e,t){const r=mu(n),s=r[e]();return r!==n&&!jn(n)&&(s._next=s.next,s.next=()=>{const i=s._next();return i.value&&(i.value=t(i.value)),i}),s}const Xb=Array.prototype;function br(n,e,t,r,s,i){const o=mu(n),a=o!==n&&!jn(n),c=o[e];if(c!==Xb[e]){const f=c.apply(n,i);return a?on(f):f}let u=t;o!==n&&(a?u=function(f,g){return t.call(this,on(f),g,n)}:t.length>2&&(u=function(f,g){return t.call(this,f,g,n)}));const d=c.call(o,u,r);return a&&s?s(d):d}function Jp(n,e,t,r){const s=mu(n);let i=t;return s!==n&&(jn(n)?t.length>3&&(i=function(o,a,c){return t.call(this,o,a,c,n)}):i=function(o,a,c){return t.call(this,o,on(a),c,n)}),s[e](i,...r)}function vd(n,e,t){const r=Ze(n);mn(r,"iterate",Ba);const s=r[e](...t);return(s===-1||s===!1)&&Qh(t[0])?(t[0]=Ze(t[0]),r[e](...t)):s}function ra(n,e,t=[]){Dr(),qh();const r=Ze(n)[e].apply(n,t);return zh(),Vr(),r}const Zb=Uh("__proto__,__v_isRef,__isVue"),H_=new Set(Object.getOwnPropertyNames(Symbol).filter(n=>n!=="arguments"&&n!=="caller").map(n=>Symbol[n]).filter(Rs));function eI(n){Rs(n)||(n=String(n));const e=Ze(this);return mn(e,"has",n),e.hasOwnProperty(n)}class W_{constructor(e=!1,t=!1){this._isReadonly=e,this._isShallow=t}get(e,t,r){if(t==="__v_skip")return e.__v_skip;const s=this._isReadonly,i=this._isShallow;if(t==="__v_isReactive")return!s;if(t==="__v_isReadonly")return s;if(t==="__v_isShallow")return i;if(t==="__v_raw")return r===(s?i?uI:X_:i?Y_:J_).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(r)?e:void 0;const o=xe(e);if(!s){let c;if(o&&(c=Yb[t]))return c;if(t==="hasOwnProperty")return eI}const a=Reflect.get(e,t,_n(e)?e:r);return(Rs(t)?H_.has(t):Zb(t))||(s||mn(e,"get",t),i)?a:_n(a)?o&&$h(t)?a:a.value:It(a)?s?ey(a):gu(a):a}}class Q_ extends W_{constructor(e=!1){super(!1,e)}set(e,t,r,s){let i=e[t];if(!this._isShallow){const c=vs(i);if(!jn(r)&&!vs(r)&&(i=Ze(i),r=Ze(r)),!xe(e)&&_n(i)&&!_n(r))return c?!1:(i.value=r,!0)}const o=xe(e)&&$h(t)?Number(t)<e.length:et(e,t),a=Reflect.set(e,t,r,_n(e)?e:s);return e===Ze(s)&&(o?ms(r,i)&&Ar(e,"set",t,r):Ar(e,"add",t,r)),a}deleteProperty(e,t){const r=et(e,t);e[t];const s=Reflect.deleteProperty(e,t);return s&&r&&Ar(e,"delete",t,void 0),s}has(e,t){const r=Reflect.has(e,t);return(!Rs(t)||!H_.has(t))&&mn(e,"has",t),r}ownKeys(e){return mn(e,"iterate",xe(e)?"length":Xs),Reflect.ownKeys(e)}}class tI extends W_{constructor(e=!1){super(!0,e)}set(e,t){return!0}deleteProperty(e,t){return!0}}const nI=new Q_,rI=new tI,sI=new Q_(!0);const Zd=n=>n,rc=n=>Reflect.getPrototypeOf(n);function iI(n,e,t){return function(...r){const s=this.__v_raw,i=Ze(s),o=Qi(i),a=n==="entries"||n===Symbol.iterator&&o,c=n==="keys"&&o,u=s[n](...r),d=t?Zd:e?Nc:on;return!e&&mn(i,"iterate",c?Xd:Xs),{next(){const{value:f,done:g}=u.next();return g?{value:f,done:g}:{value:a?[d(f[0]),d(f[1])]:d(f),done:g}},[Symbol.iterator](){return this}}}}function sc(n){return function(...e){return n==="delete"?!1:n==="clear"?void 0:this}}function oI(n,e){const t={get(s){const i=this.__v_raw,o=Ze(i),a=Ze(s);n||(ms(s,a)&&mn(o,"get",s),mn(o,"get",a));const{has:c}=rc(o),u=e?Zd:n?Nc:on;if(c.call(o,s))return u(i.get(s));if(c.call(o,a))return u(i.get(a));i!==o&&i.get(s)},get size(){const s=this.__v_raw;return!n&&mn(Ze(s),"iterate",Xs),Reflect.get(s,"size",s)},has(s){const i=this.__v_raw,o=Ze(i),a=Ze(s);return n||(ms(s,a)&&mn(o,"has",s),mn(o,"has",a)),s===a?i.has(s):i.has(s)||i.has(a)},forEach(s,i){const o=this,a=o.__v_raw,c=Ze(a),u=e?Zd:n?Nc:on;return!n&&mn(c,"iterate",Xs),a.forEach((d,f)=>s.call(i,u(d),u(f),o))}};return Xt(t,n?{add:sc("add"),set:sc("set"),delete:sc("delete"),clear:sc("clear")}:{add(s){!e&&!jn(s)&&!vs(s)&&(s=Ze(s));const i=Ze(this);return rc(i).has.call(i,s)||(i.add(s),Ar(i,"add",s,s)),this},set(s,i){!e&&!jn(i)&&!vs(i)&&(i=Ze(i));const o=Ze(this),{has:a,get:c}=rc(o);let u=a.call(o,s);u||(s=Ze(s),u=a.call(o,s));const d=c.call(o,s);return o.set(s,i),u?ms(i,d)&&Ar(o,"set",s,i):Ar(o,"add",s,i),this},delete(s){const i=Ze(this),{has:o,get:a}=rc(i);let c=o.call(i,s);c||(s=Ze(s),c=o.call(i,s)),a&&a.call(i,s);const u=i.delete(s);return c&&Ar(i,"delete",s,void 0),u},clear(){const s=Ze(this),i=s.size!==0,o=s.clear();return i&&Ar(s,"clear",void 0,void 0),o}}),["keys","values","entries",Symbol.iterator].forEach(s=>{t[s]=iI(s,n,e)}),t}function Hh(n,e){const t=oI(n,e);return(r,s,i)=>s==="__v_isReactive"?!n:s==="__v_isReadonly"?n:s==="__v_raw"?r:Reflect.get(et(t,s)&&s in r?t:r,s,i)}const aI={get:Hh(!1,!1)},lI={get:Hh(!1,!0)},cI={get:Hh(!0,!1)};const J_=new WeakMap,Y_=new WeakMap,X_=new WeakMap,uI=new WeakMap;function dI(n){switch(n){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function hI(n){return n.__v_skip||!Object.isExtensible(n)?0:dI(Fb(n))}function gu(n){return vs(n)?n:Wh(n,!1,nI,aI,J_)}function Z_(n){return Wh(n,!1,sI,lI,Y_)}function ey(n){return Wh(n,!0,rI,cI,X_)}function Wh(n,e,t,r,s){if(!It(n)||n.__v_raw&&!(e&&n.__v_isReactive))return n;const i=hI(n);if(i===0)return n;const o=s.get(n);if(o)return o;const a=new Proxy(n,i===2?r:t);return s.set(n,a),a}function Ji(n){return vs(n)?Ji(n.__v_raw):!!(n&&n.__v_isReactive)}function vs(n){return!!(n&&n.__v_isReadonly)}function jn(n){return!!(n&&n.__v_isShallow)}function Qh(n){return n?!!n.__v_raw:!1}function Ze(n){const e=n&&n.__v_raw;return e?Ze(e):n}function fI(n){return!et(n,"__v_skip")&&Object.isExtensible(n)&&Wd(n,"__v_skip",!0),n}const on=n=>It(n)?gu(n):n,Nc=n=>It(n)?ey(n):n;function _n(n){return n?n.__v_isRef===!0:!1}function K(n){return ty(n,!1)}function pI(n){return ty(n,!0)}function ty(n,e){return _n(n)?n:new mI(n,e)}class mI{constructor(e,t){this.dep=new Kh,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=t?e:Ze(e),this._value=t?e:on(e),this.__v_isShallow=t}get value(){return this.dep.track(),this._value}set value(e){const t=this._rawValue,r=this.__v_isShallow||jn(e)||vs(e);e=r?e:Ze(e),ms(e,t)&&(this._rawValue=e,this._value=r?e:on(e),this.dep.trigger())}}function Yi(n){return _n(n)?n.value:n}const gI={get:(n,e,t)=>e==="__v_raw"?n:Yi(Reflect.get(n,e,t)),set:(n,e,t,r)=>{const s=n[e];return _n(s)&&!_n(t)?(s.value=t,!0):Reflect.set(n,e,t,r)}};function ny(n){return Ji(n)?n:new Proxy(n,gI)}class _I{constructor(e,t,r){this.fn=e,this.setter=t,this._value=void 0,this.dep=new Kh(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=Ua-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!t,this.isSSR=r}notify(){if(this.flags|=16,!(this.flags&8)&&ft!==this)return j_(this,!0),!0}get value(){const e=this.dep.track();return z_(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function yI(n,e,t=!1){let r,s;return Ce(n)?r=n:(r=n.get,s=n.set),new _I(r,s,t)}const ic={},Oc=new WeakMap;let qs;function vI(n,e=!1,t=qs){if(t){let r=Oc.get(t);r||Oc.set(t,r=[]),r.push(n)}}function wI(n,e,t=dt){const{immediate:r,deep:s,once:i,scheduler:o,augmentJob:a,call:c}=t,u=M=>s?M:jn(M)||s===!1||s===0?Pr(M,1):Pr(M);let d,f,g,_,k=!1,T=!1;if(_n(n)?(f=()=>n.value,k=jn(n)):Ji(n)?(f=()=>u(n),k=!0):xe(n)?(T=!0,k=n.some(M=>Ji(M)||jn(M)),f=()=>n.map(M=>{if(_n(M))return M.value;if(Ji(M))return u(M);if(Ce(M))return c?c(M,2):M()})):Ce(n)?e?f=c?()=>c(n,2):n:f=()=>{if(g){Dr();try{g()}finally{Vr()}}const M=qs;qs=d;try{return c?c(n,3,[_]):n(_)}finally{qs=M}}:f=Wn,e&&s){const M=f,q=s===!0?1/0:s;f=()=>Pr(M(),q)}const C=Wb(),F=()=>{d.stop(),C&&C.active&&jh(C.effects,d)};if(i&&e){const M=e;e=(...q)=>{M(...q),F()}}let j=T?new Array(n.length).fill(ic):ic;const L=M=>{if(!(!(d.flags&1)||!d.dirty&&!M))if(e){const q=d.run();if(s||k||(T?q.some((te,x)=>ms(te,j[x])):ms(q,j))){g&&g();const te=qs;qs=d;try{const x=[q,j===ic?void 0:T&&j[0]===ic?[]:j,_];j=q,c?c(e,3,x):e(...x)}finally{qs=te}}}else d.run()};return a&&a(L),d=new U_(f),d.scheduler=o?()=>o(L,!1):L,_=M=>vI(M,!1,d),g=d.onStop=()=>{const M=Oc.get(d);if(M){if(c)c(M,4);else for(const q of M)q();Oc.delete(d)}},e?r?L(!0):j=d.run():o?o(L.bind(null,!0),!0):d.run(),F.pause=d.pause.bind(d),F.resume=d.resume.bind(d),F.stop=F,F}function Pr(n,e=1/0,t){if(e<=0||!It(n)||n.__v_skip||(t=t||new Set,t.has(n)))return n;if(t.add(n),e--,_n(n))Pr(n.value,e,t);else if(xe(n))for(let r=0;r<n.length;r++)Pr(n[r],e,t);else if(D_(n)||Qi(n))n.forEach(r=>{Pr(r,e,t)});else if(O_(n)){for(const r in n)Pr(n[r],e,t);for(const r of Object.getOwnPropertySymbols(n))Object.prototype.propertyIsEnumerable.call(n,r)&&Pr(n[r],e,t)}return n}/**
* @vue/runtime-core v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function ul(n,e,t,r){try{return r?n(...r):n()}catch(s){_u(s,e,t)}}function fr(n,e,t,r){if(Ce(n)){const s=ul(n,e,t,r);return s&&V_(s)&&s.catch(i=>{_u(i,e,t)}),s}if(xe(n)){const s=[];for(let i=0;i<n.length;i++)s.push(fr(n[i],e,t,r));return s}}function _u(n,e,t,r=!0){const s=e?e.vnode:null,{errorHandler:i,throwUnhandledErrorInProduction:o}=e&&e.appContext.config||dt;if(e){let a=e.parent;const c=e.proxy,u=`https://vuejs.org/error-reference/#runtime-${t}`;for(;a;){const d=a.ec;if(d){for(let f=0;f<d.length;f++)if(d[f](n,c,u)===!1)return}a=a.parent}if(i){Dr(),ul(i,null,10,[n,c,u]),Vr();return}}bI(n,t,s,r,o)}function bI(n,e,t,r=!0,s=!1){if(s)throw n;console.error(n)}const En=[];let nr=-1;const Xi=[];let ss=null,ji=0;const ry=Promise.resolve();let Mc=null;function ni(n){const e=Mc||ry;return n?e.then(this?n.bind(this):n):e}function II(n){let e=nr+1,t=En.length;for(;e<t;){const r=e+t>>>1,s=En[r],i=ja(s);i<n||i===n&&s.flags&2?e=r+1:t=r}return e}function Jh(n){if(!(n.flags&1)){const e=ja(n),t=En[En.length-1];!t||!(n.flags&2)&&e>=ja(t)?En.push(n):En.splice(II(e),0,n),n.flags|=1,sy()}}function sy(){Mc||(Mc=ry.then(oy))}function EI(n){xe(n)?Xi.push(...n):ss&&n.id===-1?ss.splice(ji+1,0,n):n.flags&1||(Xi.push(n),n.flags|=1),sy()}function Yp(n,e,t=nr+1){for(;t<En.length;t++){const r=En[t];if(r&&r.flags&2){if(n&&r.id!==n.uid)continue;En.splice(t,1),t--,r.flags&4&&(r.flags&=-2),r(),r.flags&4||(r.flags&=-2)}}}function iy(n){if(Xi.length){const e=[...new Set(Xi)].sort((t,r)=>ja(t)-ja(r));if(Xi.length=0,ss){ss.push(...e);return}for(ss=e,ji=0;ji<ss.length;ji++){const t=ss[ji];t.flags&4&&(t.flags&=-2),t.flags&8||t(),t.flags&=-2}ss=null,ji=0}}const ja=n=>n.id==null?n.flags&2?-1:1/0:n.id;function oy(n){const e=Wn;try{for(nr=0;nr<En.length;nr++){const t=En[nr];t&&!(t.flags&8)&&(t.flags&4&&(t.flags&=-2),ul(t,t.i,t.i?15:14),t.flags&4||(t.flags&=-2))}}finally{for(;nr<En.length;nr++){const t=En[nr];t&&(t.flags&=-2)}nr=-1,En.length=0,iy(),Mc=null,(En.length||Xi.length)&&oy()}}let Fn=null,ay=null;function Lc(n){const e=Fn;return Fn=n,ay=n&&n.type.__scopeId||null,e}function TI(n,e=Fn,t){if(!e||n._n)return n;const r=(...s)=>{r._d&&om(-1);const i=Lc(e);let o;try{o=n(...s)}finally{Lc(i),r._d&&om(1)}return o};return r._n=!0,r._c=!0,r._d=!0,r}function Et(n,e){if(Fn===null)return n;const t=Iu(Fn),r=n.dirs||(n.dirs=[]);for(let s=0;s<e.length;s++){let[i,o,a,c=dt]=e[s];i&&(Ce(i)&&(i={mounted:i,updated:i}),i.deep&&Pr(o),r.push({dir:i,instance:t,value:o,oldValue:void 0,arg:a,modifiers:c}))}return n}function Bs(n,e,t,r){const s=n.dirs,i=e&&e.dirs;for(let o=0;o<s.length;o++){const a=s[o];i&&(a.oldValue=i[o].value);let c=a.dir[r];c&&(Dr(),fr(c,t,8,[n.el,a,n,e]),Vr())}}const AI=Symbol("_vte"),PI=n=>n.__isTeleport;function Yh(n,e){n.shapeFlag&6&&n.component?(n.transition=e,Yh(n.component.subTree,e)):n.shapeFlag&128?(n.ssContent.transition=e.clone(n.ssContent),n.ssFallback.transition=e.clone(n.ssFallback)):n.transition=e}/*! #__NO_SIDE_EFFECTS__ */function ly(n,e){return Ce(n)?(()=>Xt({name:n.name},e,{setup:n}))():n}function cy(n){n.ids=[n.ids[0]+n.ids[2]+++"-",0,0]}function Ta(n,e,t,r,s=!1){if(xe(n)){n.forEach((k,T)=>Ta(k,e&&(xe(e)?e[T]:e),t,r,s));return}if(Aa(r)&&!s){r.shapeFlag&512&&r.type.__asyncResolved&&r.component.subTree.component&&Ta(n,e,t,r.component.subTree);return}const i=r.shapeFlag&4?Iu(r.component):r.el,o=s?null:i,{i:a,r:c}=n,u=e&&e.r,d=a.refs===dt?a.refs={}:a.refs,f=a.setupState,g=Ze(f),_=f===dt?()=>!1:k=>et(g,k);if(u!=null&&u!==c&&(jt(u)?(d[u]=null,_(u)&&(f[u]=null)):_n(u)&&(u.value=null)),Ce(c))ul(c,a,12,[o,d]);else{const k=jt(c),T=_n(c);if(k||T){const C=()=>{if(n.f){const F=k?_(c)?f[c]:d[c]:c.value;s?xe(F)&&jh(F,i):xe(F)?F.includes(i)||F.push(i):k?(d[c]=[i],_(c)&&(f[c]=d[c])):(c.value=[i],n.k&&(d[n.k]=c.value))}else k?(d[c]=o,_(c)&&(f[c]=o)):T&&(c.value=o,n.k&&(d[n.k]=o))};o?(C.id=-1,Mn(C,t)):C()}}}pu().requestIdleCallback;pu().cancelIdleCallback;const Aa=n=>!!n.type.__asyncLoader,uy=n=>n.type.__isKeepAlive;function SI(n,e){dy(n,"a",e)}function xI(n,e){dy(n,"da",e)}function dy(n,e,t=gn){const r=n.__wdc||(n.__wdc=()=>{let s=t;for(;s;){if(s.isDeactivated)return;s=s.parent}return n()});if(yu(e,r,t),t){let s=t.parent;for(;s&&s.parent;)uy(s.parent.vnode)&&RI(r,e,t,s),s=s.parent}}function RI(n,e,t,r){const s=yu(e,n,r,!0);hy(()=>{jh(r[e],s)},t)}function yu(n,e,t=gn,r=!1){if(t){const s=t[n]||(t[n]=[]),i=e.__weh||(e.__weh=(...o)=>{Dr();const a=dl(t),c=fr(e,t,n,o);return a(),Vr(),c});return r?s.unshift(i):s.push(i),i}}const Br=n=>(e,t=gn)=>{(!qa||n==="sp")&&yu(n,(...r)=>e(...r),t)},CI=Br("bm"),vu=Br("m"),kI=Br("bu"),DI=Br("u"),VI=Br("bum"),hy=Br("um"),NI=Br("sp"),OI=Br("rtg"),MI=Br("rtc");function LI(n,e=gn){yu("ec",n,e)}const fy="components";function FI(n,e){return BI(fy,n,!0,e)||n}const UI=Symbol.for("v-ndc");function BI(n,e,t=!0,r=!1){const s=Fn||gn;if(s){const i=s.type;if(n===fy){const a=PE(i,!1);if(a&&(a===e||a===$n(e)||a===fu($n(e))))return i}const o=Xp(s[n]||i[n],e)||Xp(s.appContext[n],e);return!o&&r?i:o}}function Xp(n,e){return n&&(n[e]||n[$n(e)]||n[fu($n(e))])}function rr(n,e,t,r){let s;const i=t&&t[r],o=xe(n);if(o||jt(n)){const a=o&&Ji(n);let c=!1,u=!1;a&&(c=!jn(n),u=vs(n),n=mu(n)),s=new Array(n.length);for(let d=0,f=n.length;d<f;d++)s[d]=e(c?u?Nc(on(n[d])):on(n[d]):n[d],d,void 0,i&&i[d])}else if(typeof n=="number"){s=new Array(n);for(let a=0;a<n;a++)s[a]=e(a+1,a,void 0,i&&i[a])}else if(It(n))if(n[Symbol.iterator])s=Array.from(n,(a,c)=>e(a,c,void 0,i&&i[c]));else{const a=Object.keys(n);s=new Array(a.length);for(let c=0,u=a.length;c<u;c++){const d=a[c];s[c]=e(n[d],d,c,i&&i[c])}}else s=[];return t&&(t[r]=s),s}const eh=n=>n?Vy(n)?Iu(n):eh(n.parent):null,Pa=Xt(Object.create(null),{$:n=>n,$el:n=>n.vnode.el,$data:n=>n.data,$props:n=>n.props,$attrs:n=>n.attrs,$slots:n=>n.slots,$refs:n=>n.refs,$parent:n=>eh(n.parent),$root:n=>eh(n.root),$host:n=>n.ce,$emit:n=>n.emit,$options:n=>Xh(n),$forceUpdate:n=>n.f||(n.f=()=>{Jh(n.update)}),$nextTick:n=>n.n||(n.n=ni.bind(n.proxy)),$watch:n=>aE.bind(n)}),wd=(n,e)=>n!==dt&&!n.__isScriptSetup&&et(n,e),jI={get({_:n},e){if(e==="__v_skip")return!0;const{ctx:t,setupState:r,data:s,props:i,accessCache:o,type:a,appContext:c}=n;let u;if(e[0]!=="$"){const _=o[e];if(_!==void 0)switch(_){case 1:return r[e];case 2:return s[e];case 4:return t[e];case 3:return i[e]}else{if(wd(r,e))return o[e]=1,r[e];if(s!==dt&&et(s,e))return o[e]=2,s[e];if((u=n.propsOptions[0])&&et(u,e))return o[e]=3,i[e];if(t!==dt&&et(t,e))return o[e]=4,t[e];th&&(o[e]=0)}}const d=Pa[e];let f,g;if(d)return e==="$attrs"&&mn(n.attrs,"get",""),d(n);if((f=a.__cssModules)&&(f=f[e]))return f;if(t!==dt&&et(t,e))return o[e]=4,t[e];if(g=c.config.globalProperties,et(g,e))return g[e]},set({_:n},e,t){const{data:r,setupState:s,ctx:i}=n;return wd(s,e)?(s[e]=t,!0):r!==dt&&et(r,e)?(r[e]=t,!0):et(n.props,e)||e[0]==="$"&&e.slice(1)in n?!1:(i[e]=t,!0)},has({_:{data:n,setupState:e,accessCache:t,ctx:r,appContext:s,propsOptions:i}},o){let a;return!!t[o]||n!==dt&&et(n,o)||wd(e,o)||(a=i[0])&&et(a,o)||et(r,o)||et(Pa,o)||et(s.config.globalProperties,o)},defineProperty(n,e,t){return t.get!=null?n._.accessCache[e]=0:et(t,"value")&&this.set(n,e,t.value,null),Reflect.defineProperty(n,e,t)}};function Zp(n){return xe(n)?n.reduce((e,t)=>(e[t]=null,e),{}):n}let th=!0;function $I(n){const e=Xh(n),t=n.proxy,r=n.ctx;th=!1,e.beforeCreate&&em(e.beforeCreate,n,"bc");const{data:s,computed:i,methods:o,watch:a,provide:c,inject:u,created:d,beforeMount:f,mounted:g,beforeUpdate:_,updated:k,activated:T,deactivated:C,beforeDestroy:F,beforeUnmount:j,destroyed:L,unmounted:M,render:q,renderTracked:te,renderTriggered:x,errorCaptured:E,serverPrefetch:S,expose:R,inheritAttrs:w,components:P,directives:I,filters:ke}=e;if(u&&qI(u,r,null),o)for(const Le in o){const De=o[Le];Ce(De)&&(r[Le]=De.bind(t))}if(s){const Le=s.call(t,t);It(Le)&&(n.data=gu(Le))}if(th=!0,i)for(const Le in i){const De=i[Le],Kt=Ce(De)?De.bind(t,t):Ce(De.get)?De.get.bind(t,t):Wn,un=!Ce(De)&&Ce(De.set)?De.set.bind(t):Wn,Zt=an({get:Kt,set:un});Object.defineProperty(r,Le,{enumerable:!0,configurable:!0,get:()=>Zt.value,set:tt=>Zt.value=tt})}if(a)for(const Le in a)py(a[Le],r,t,Le);if(c){const Le=Ce(c)?c.call(t):c;Reflect.ownKeys(Le).forEach(De=>{gc(De,Le[De])})}d&&em(d,n,"c");function He(Le,De){xe(De)?De.forEach(Kt=>Le(Kt.bind(t))):De&&Le(De.bind(t))}if(He(CI,f),He(vu,g),He(kI,_),He(DI,k),He(SI,T),He(xI,C),He(LI,E),He(MI,te),He(OI,x),He(VI,j),He(hy,M),He(NI,S),xe(R))if(R.length){const Le=n.exposed||(n.exposed={});R.forEach(De=>{Object.defineProperty(Le,De,{get:()=>t[De],set:Kt=>t[De]=Kt})})}else n.exposed||(n.exposed={});q&&n.render===Wn&&(n.render=q),w!=null&&(n.inheritAttrs=w),P&&(n.components=P),I&&(n.directives=I),S&&cy(n)}function qI(n,e,t=Wn){xe(n)&&(n=nh(n));for(const r in n){const s=n[r];let i;It(s)?"default"in s?i=Jn(s.from||r,s.default,!0):i=Jn(s.from||r):i=Jn(s),_n(i)?Object.defineProperty(e,r,{enumerable:!0,configurable:!0,get:()=>i.value,set:o=>i.value=o}):e[r]=i}}function em(n,e,t){fr(xe(n)?n.map(r=>r.bind(e.proxy)):n.bind(e.proxy),e,t)}function py(n,e,t,r){let s=r.includes(".")?Sy(t,r):()=>t[r];if(jt(n)){const i=e[n];Ce(i)&&Yn(s,i)}else if(Ce(n))Yn(s,n.bind(t));else if(It(n))if(xe(n))n.forEach(i=>py(i,e,t,r));else{const i=Ce(n.handler)?n.handler.bind(t):e[n.handler];Ce(i)&&Yn(s,i,n)}}function Xh(n){const e=n.type,{mixins:t,extends:r}=e,{mixins:s,optionsCache:i,config:{optionMergeStrategies:o}}=n.appContext,a=i.get(e);let c;return a?c=a:!s.length&&!t&&!r?c=e:(c={},s.length&&s.forEach(u=>Fc(c,u,o,!0)),Fc(c,e,o)),It(e)&&i.set(e,c),c}function Fc(n,e,t,r=!1){const{mixins:s,extends:i}=e;i&&Fc(n,i,t,!0),s&&s.forEach(o=>Fc(n,o,t,!0));for(const o in e)if(!(r&&o==="expose")){const a=zI[o]||t&&t[o];n[o]=a?a(n[o],e[o]):e[o]}return n}const zI={data:tm,props:nm,emits:nm,methods:fa,computed:fa,beforeCreate:bn,created:bn,beforeMount:bn,mounted:bn,beforeUpdate:bn,updated:bn,beforeDestroy:bn,beforeUnmount:bn,destroyed:bn,unmounted:bn,activated:bn,deactivated:bn,errorCaptured:bn,serverPrefetch:bn,components:fa,directives:fa,watch:KI,provide:tm,inject:GI};function tm(n,e){return e?n?function(){return Xt(Ce(n)?n.call(this,this):n,Ce(e)?e.call(this,this):e)}:e:n}function GI(n,e){return fa(nh(n),nh(e))}function nh(n){if(xe(n)){const e={};for(let t=0;t<n.length;t++)e[n[t]]=n[t];return e}return n}function bn(n,e){return n?[...new Set([].concat(n,e))]:e}function fa(n,e){return n?Xt(Object.create(null),n,e):e}function nm(n,e){return n?xe(n)&&xe(e)?[...new Set([...n,...e])]:Xt(Object.create(null),Zp(n),Zp(e??{})):e}function KI(n,e){if(!n)return e;if(!e)return n;const t=Xt(Object.create(null),n);for(const r in e)t[r]=bn(n[r],e[r]);return t}function my(){return{app:null,config:{isNativeTag:Mb,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let HI=0;function WI(n,e){return function(r,s=null){Ce(r)||(r=Xt({},r)),s!=null&&!It(s)&&(s=null);const i=my(),o=new WeakSet,a=[];let c=!1;const u=i.app={_uid:HI++,_component:r,_props:s,_container:null,_context:i,_instance:null,version:xE,get config(){return i.config},set config(d){},use(d,...f){return o.has(d)||(d&&Ce(d.install)?(o.add(d),d.install(u,...f)):Ce(d)&&(o.add(d),d(u,...f))),u},mixin(d){return i.mixins.includes(d)||i.mixins.push(d),u},component(d,f){return f?(i.components[d]=f,u):i.components[d]},directive(d,f){return f?(i.directives[d]=f,u):i.directives[d]},mount(d,f,g){if(!c){const _=u._ceVNode||Bt(r,s);return _.appContext=i,g===!0?g="svg":g===!1&&(g=void 0),f&&e?e(_,d):n(_,d,g),c=!0,u._container=d,d.__vue_app__=u,Iu(_.component)}},onUnmount(d){a.push(d)},unmount(){c&&(fr(a,u._instance,16),n(null,u._container),delete u._container.__vue_app__)},provide(d,f){return i.provides[d]=f,u},runWithContext(d){const f=Zi;Zi=u;try{return d()}finally{Zi=f}}};return u}}let Zi=null;function gc(n,e){if(gn){let t=gn.provides;const r=gn.parent&&gn.parent.provides;r===t&&(t=gn.provides=Object.create(r)),t[n]=e}}function Jn(n,e,t=!1){const r=gn||Fn;if(r||Zi){let s=Zi?Zi._context.provides:r?r.parent==null||r.ce?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:void 0;if(s&&n in s)return s[n];if(arguments.length>1)return t&&Ce(e)?e.call(r&&r.proxy):e}}const gy={},_y=()=>Object.create(gy),yy=n=>Object.getPrototypeOf(n)===gy;function QI(n,e,t,r=!1){const s={},i=_y();n.propsDefaults=Object.create(null),vy(n,e,s,i);for(const o in n.propsOptions[0])o in s||(s[o]=void 0);t?n.props=r?s:Z_(s):n.type.props?n.props=s:n.props=i,n.attrs=i}function JI(n,e,t,r){const{props:s,attrs:i,vnode:{patchFlag:o}}=n,a=Ze(s),[c]=n.propsOptions;let u=!1;if((r||o>0)&&!(o&16)){if(o&8){const d=n.vnode.dynamicProps;for(let f=0;f<d.length;f++){let g=d[f];if(wu(n.emitsOptions,g))continue;const _=e[g];if(c)if(et(i,g))_!==i[g]&&(i[g]=_,u=!0);else{const k=$n(g);s[k]=rh(c,a,k,_,n,!1)}else _!==i[g]&&(i[g]=_,u=!0)}}}else{vy(n,e,s,i)&&(u=!0);let d;for(const f in a)(!e||!et(e,f)&&((d=Cs(f))===f||!et(e,d)))&&(c?t&&(t[f]!==void 0||t[d]!==void 0)&&(s[f]=rh(c,a,f,void 0,n,!0)):delete s[f]);if(i!==a)for(const f in i)(!e||!et(e,f))&&(delete i[f],u=!0)}u&&Ar(n.attrs,"set","")}function vy(n,e,t,r){const[s,i]=n.propsOptions;let o=!1,a;if(e)for(let c in e){if(ba(c))continue;const u=e[c];let d;s&&et(s,d=$n(c))?!i||!i.includes(d)?t[d]=u:(a||(a={}))[d]=u:wu(n.emitsOptions,c)||(!(c in r)||u!==r[c])&&(r[c]=u,o=!0)}if(i){const c=Ze(t),u=a||dt;for(let d=0;d<i.length;d++){const f=i[d];t[f]=rh(s,c,f,u[f],n,!et(u,f))}}return o}function rh(n,e,t,r,s,i){const o=n[t];if(o!=null){const a=et(o,"default");if(a&&r===void 0){const c=o.default;if(o.type!==Function&&!o.skipFactory&&Ce(c)){const{propsDefaults:u}=s;if(t in u)r=u[t];else{const d=dl(s);r=u[t]=c.call(null,e),d()}}else r=c;s.ce&&s.ce._setProp(t,r)}o[0]&&(i&&!a?r=!1:o[1]&&(r===""||r===Cs(t))&&(r=!0))}return r}const YI=new WeakMap;function wy(n,e,t=!1){const r=t?YI:e.propsCache,s=r.get(n);if(s)return s;const i=n.props,o={},a=[];let c=!1;if(!Ce(n)){const d=f=>{c=!0;const[g,_]=wy(f,e,!0);Xt(o,g),_&&a.push(..._)};!t&&e.mixins.length&&e.mixins.forEach(d),n.extends&&d(n.extends),n.mixins&&n.mixins.forEach(d)}if(!i&&!c)return It(n)&&r.set(n,Wi),Wi;if(xe(i))for(let d=0;d<i.length;d++){const f=$n(i[d]);rm(f)&&(o[f]=dt)}else if(i)for(const d in i){const f=$n(d);if(rm(f)){const g=i[d],_=o[f]=xe(g)||Ce(g)?{type:g}:Xt({},g),k=_.type;let T=!1,C=!0;if(xe(k))for(let F=0;F<k.length;++F){const j=k[F],L=Ce(j)&&j.name;if(L==="Boolean"){T=!0;break}else L==="String"&&(C=!1)}else T=Ce(k)&&k.name==="Boolean";_[0]=T,_[1]=C,(T||et(_,"default"))&&a.push(f)}}const u=[o,a];return It(n)&&r.set(n,u),u}function rm(n){return n[0]!=="$"&&!ba(n)}const Zh=n=>n[0]==="_"||n==="$stable",ef=n=>xe(n)?n.map(sr):[sr(n)],XI=(n,e,t)=>{if(e._n)return e;const r=TI((...s)=>ef(e(...s)),t);return r._c=!1,r},by=(n,e,t)=>{const r=n._ctx;for(const s in n){if(Zh(s))continue;const i=n[s];if(Ce(i))e[s]=XI(s,i,r);else if(i!=null){const o=ef(i);e[s]=()=>o}}},Iy=(n,e)=>{const t=ef(e);n.slots.default=()=>t},Ey=(n,e,t)=>{for(const r in e)(t||!Zh(r))&&(n[r]=e[r])},ZI=(n,e,t)=>{const r=n.slots=_y();if(n.vnode.shapeFlag&32){const s=e.__;s&&Wd(r,"__",s,!0);const i=e._;i?(Ey(r,e,t),t&&Wd(r,"_",i,!0)):by(e,r)}else e&&Iy(n,e)},eE=(n,e,t)=>{const{vnode:r,slots:s}=n;let i=!0,o=dt;if(r.shapeFlag&32){const a=e._;a?t&&a===1?i=!1:Ey(s,e,t):(i=!e.$stable,by(e,s)),o=e}else e&&(Iy(n,e),o={default:1});if(i)for(const a in s)!Zh(a)&&o[a]==null&&delete s[a]},Mn=pE;function tE(n){return nE(n)}function nE(n,e){const t=pu();t.__VUE__=!0;const{insert:r,remove:s,patchProp:i,createElement:o,createText:a,createComment:c,setText:u,setElementText:d,parentNode:f,nextSibling:g,setScopeId:_=Wn,insertStaticContent:k}=n,T=(b,A,V,G=null,z=null,Z=null,ue=void 0,se=null,ne=!!A.dynamicChildren)=>{if(b===A)return;b&&!sa(b,A)&&(G=$(b),tt(b,z,Z,!0),b=null),A.patchFlag===-2&&(ne=!1,A.dynamicChildren=null);const{type:X,ref:ye,shapeFlag:oe}=A;switch(X){case bu:C(b,A,V,G);break;case ws:F(b,A,V,G);break;case _c:b==null&&j(A,V,G,ue);break;case Rt:P(b,A,V,G,z,Z,ue,se,ne);break;default:oe&1?q(b,A,V,G,z,Z,ue,se,ne):oe&6?I(b,A,V,G,z,Z,ue,se,ne):(oe&64||oe&128)&&X.process(b,A,V,G,z,Z,ue,se,ne,fe)}ye!=null&&z?Ta(ye,b&&b.ref,Z,A||b,!A):ye==null&&b&&b.ref!=null&&Ta(b.ref,null,Z,b,!0)},C=(b,A,V,G)=>{if(b==null)r(A.el=a(A.children),V,G);else{const z=A.el=b.el;A.children!==b.children&&u(z,A.children)}},F=(b,A,V,G)=>{b==null?r(A.el=c(A.children||""),V,G):A.el=b.el},j=(b,A,V,G)=>{[b.el,b.anchor]=k(b.children,A,V,G,b.el,b.anchor)},L=({el:b,anchor:A},V,G)=>{let z;for(;b&&b!==A;)z=g(b),r(b,V,G),b=z;r(A,V,G)},M=({el:b,anchor:A})=>{let V;for(;b&&b!==A;)V=g(b),s(b),b=V;s(A)},q=(b,A,V,G,z,Z,ue,se,ne)=>{A.type==="svg"?ue="svg":A.type==="math"&&(ue="mathml"),b==null?te(A,V,G,z,Z,ue,se,ne):S(b,A,z,Z,ue,se,ne)},te=(b,A,V,G,z,Z,ue,se)=>{let ne,X;const{props:ye,shapeFlag:oe,transition:me,dirs:Ie}=b;if(ne=b.el=o(b.type,Z,ye&&ye.is,ye),oe&8?d(ne,b.children):oe&16&&E(b.children,ne,null,G,z,bd(b,Z),ue,se),Ie&&Bs(b,null,G,"created"),x(ne,b,b.scopeId,ue,G),ye){for(const Re in ye)Re!=="value"&&!ba(Re)&&i(ne,Re,null,ye[Re],Z,G);"value"in ye&&i(ne,"value",null,ye.value,Z),(X=ye.onVnodeBeforeMount)&&tr(X,G,b)}Ie&&Bs(b,null,G,"beforeMount");const be=rE(z,me);be&&me.beforeEnter(ne),r(ne,A,V),((X=ye&&ye.onVnodeMounted)||be||Ie)&&Mn(()=>{X&&tr(X,G,b),be&&me.enter(ne),Ie&&Bs(b,null,G,"mounted")},z)},x=(b,A,V,G,z)=>{if(V&&_(b,V),G)for(let Z=0;Z<G.length;Z++)_(b,G[Z]);if(z){let Z=z.subTree;if(A===Z||Ry(Z.type)&&(Z.ssContent===A||Z.ssFallback===A)){const ue=z.vnode;x(b,ue,ue.scopeId,ue.slotScopeIds,z.parent)}}},E=(b,A,V,G,z,Z,ue,se,ne=0)=>{for(let X=ne;X<b.length;X++){const ye=b[X]=se?is(b[X]):sr(b[X]);T(null,ye,A,V,G,z,Z,ue,se)}},S=(b,A,V,G,z,Z,ue)=>{const se=A.el=b.el;let{patchFlag:ne,dynamicChildren:X,dirs:ye}=A;ne|=b.patchFlag&16;const oe=b.props||dt,me=A.props||dt;let Ie;if(V&&js(V,!1),(Ie=me.onVnodeBeforeUpdate)&&tr(Ie,V,A,b),ye&&Bs(A,b,V,"beforeUpdate"),V&&js(V,!0),(oe.innerHTML&&me.innerHTML==null||oe.textContent&&me.textContent==null)&&d(se,""),X?R(b.dynamicChildren,X,se,V,G,bd(A,z),Z):ue||De(b,A,se,null,V,G,bd(A,z),Z,!1),ne>0){if(ne&16)w(se,oe,me,V,z);else if(ne&2&&oe.class!==me.class&&i(se,"class",null,me.class,z),ne&4&&i(se,"style",oe.style,me.style,z),ne&8){const be=A.dynamicProps;for(let Re=0;Re<be.length;Re++){const je=be[Re],$t=oe[je],Dt=me[je];(Dt!==$t||je==="value")&&i(se,je,$t,Dt,z,V)}}ne&1&&b.children!==A.children&&d(se,A.children)}else!ue&&X==null&&w(se,oe,me,V,z);((Ie=me.onVnodeUpdated)||ye)&&Mn(()=>{Ie&&tr(Ie,V,A,b),ye&&Bs(A,b,V,"updated")},G)},R=(b,A,V,G,z,Z,ue)=>{for(let se=0;se<A.length;se++){const ne=b[se],X=A[se],ye=ne.el&&(ne.type===Rt||!sa(ne,X)||ne.shapeFlag&198)?f(ne.el):V;T(ne,X,ye,null,G,z,Z,ue,!0)}},w=(b,A,V,G,z)=>{if(A!==V){if(A!==dt)for(const Z in A)!ba(Z)&&!(Z in V)&&i(b,Z,A[Z],null,z,G);for(const Z in V){if(ba(Z))continue;const ue=V[Z],se=A[Z];ue!==se&&Z!=="value"&&i(b,Z,se,ue,z,G)}"value"in V&&i(b,"value",A.value,V.value,z)}},P=(b,A,V,G,z,Z,ue,se,ne)=>{const X=A.el=b?b.el:a(""),ye=A.anchor=b?b.anchor:a("");let{patchFlag:oe,dynamicChildren:me,slotScopeIds:Ie}=A;Ie&&(se=se?se.concat(Ie):Ie),b==null?(r(X,V,G),r(ye,V,G),E(A.children||[],V,ye,z,Z,ue,se,ne)):oe>0&&oe&64&&me&&b.dynamicChildren?(R(b.dynamicChildren,me,V,z,Z,ue,se),(A.key!=null||z&&A===z.subTree)&&Ty(b,A,!0)):De(b,A,V,ye,z,Z,ue,se,ne)},I=(b,A,V,G,z,Z,ue,se,ne)=>{A.slotScopeIds=se,b==null?A.shapeFlag&512?z.ctx.activate(A,V,G,ue,ne):ke(A,V,G,z,Z,ue,ne):ct(b,A,ne)},ke=(b,A,V,G,z,Z,ue)=>{const se=b.component=bE(b,G,z);if(uy(b)&&(se.ctx.renderer=fe),IE(se,!1,ue),se.asyncDep){if(z&&z.registerDep(se,He,ue),!b.el){const ne=se.subTree=Bt(ws);F(null,ne,A,V)}}else He(se,b,A,V,z,Z,ue)},ct=(b,A,V)=>{const G=A.component=b.component;if(hE(b,A,V))if(G.asyncDep&&!G.asyncResolved){Le(G,A,V);return}else G.next=A,G.update();else A.el=b.el,G.vnode=A},He=(b,A,V,G,z,Z,ue)=>{const se=()=>{if(b.isMounted){let{next:oe,bu:me,u:Ie,parent:be,vnode:Re}=b;{const Ve=Ay(b);if(Ve){oe&&(oe.el=Re.el,Le(b,oe,ue)),Ve.asyncDep.then(()=>{b.isUnmounted||se()});return}}let je=oe,$t;js(b,!1),oe?(oe.el=Re.el,Le(b,oe,ue)):oe=Re,me&&mc(me),($t=oe.props&&oe.props.onVnodeBeforeUpdate)&&tr($t,be,oe,Re),js(b,!0);const Dt=Id(b),Oe=b.subTree;b.subTree=Dt,T(Oe,Dt,f(Oe.el),$(Oe),b,z,Z),oe.el=Dt.el,je===null&&fE(b,Dt.el),Ie&&Mn(Ie,z),($t=oe.props&&oe.props.onVnodeUpdated)&&Mn(()=>tr($t,be,oe,Re),z)}else{let oe;const{el:me,props:Ie}=A,{bm:be,m:Re,parent:je,root:$t,type:Dt}=b,Oe=Aa(A);if(js(b,!1),be&&mc(be),!Oe&&(oe=Ie&&Ie.onVnodeBeforeMount)&&tr(oe,je,A),js(b,!0),me&&Je){const Ve=()=>{b.subTree=Id(b),Je(me,b.subTree,b,z,null)};Oe&&Dt.__asyncHydrate?Dt.__asyncHydrate(me,b,Ve):Ve()}else{$t.ce&&$t.ce._def.shadowRoot!==!1&&$t.ce._injectChildStyle(Dt);const Ve=b.subTree=Id(b);T(null,Ve,V,G,b,z,Z),A.el=Ve.el}if(Re&&Mn(Re,z),!Oe&&(oe=Ie&&Ie.onVnodeMounted)){const Ve=A;Mn(()=>tr(oe,je,Ve),z)}(A.shapeFlag&256||je&&Aa(je.vnode)&&je.vnode.shapeFlag&256)&&b.a&&Mn(b.a,z),b.isMounted=!0,A=V=G=null}};b.scope.on();const ne=b.effect=new U_(se);b.scope.off();const X=b.update=ne.run.bind(ne),ye=b.job=ne.runIfDirty.bind(ne);ye.i=b,ye.id=b.uid,ne.scheduler=()=>Jh(ye),js(b,!0),X()},Le=(b,A,V)=>{A.component=b;const G=b.vnode.props;b.vnode=A,b.next=null,JI(b,A.props,G,V),eE(b,A.children,V),Dr(),Yp(b),Vr()},De=(b,A,V,G,z,Z,ue,se,ne=!1)=>{const X=b&&b.children,ye=b?b.shapeFlag:0,oe=A.children,{patchFlag:me,shapeFlag:Ie}=A;if(me>0){if(me&128){un(X,oe,V,G,z,Z,ue,se,ne);return}else if(me&256){Kt(X,oe,V,G,z,Z,ue,se,ne);return}}Ie&8?(ye&16&&Qe(X,z,Z),oe!==X&&d(V,oe)):ye&16?Ie&16?un(X,oe,V,G,z,Z,ue,se,ne):Qe(X,z,Z,!0):(ye&8&&d(V,""),Ie&16&&E(oe,V,G,z,Z,ue,se,ne))},Kt=(b,A,V,G,z,Z,ue,se,ne)=>{b=b||Wi,A=A||Wi;const X=b.length,ye=A.length,oe=Math.min(X,ye);let me;for(me=0;me<oe;me++){const Ie=A[me]=ne?is(A[me]):sr(A[me]);T(b[me],Ie,V,null,z,Z,ue,se,ne)}X>ye?Qe(b,z,Z,!0,!1,oe):E(A,V,G,z,Z,ue,se,ne,oe)},un=(b,A,V,G,z,Z,ue,se,ne)=>{let X=0;const ye=A.length;let oe=b.length-1,me=ye-1;for(;X<=oe&&X<=me;){const Ie=b[X],be=A[X]=ne?is(A[X]):sr(A[X]);if(sa(Ie,be))T(Ie,be,V,null,z,Z,ue,se,ne);else break;X++}for(;X<=oe&&X<=me;){const Ie=b[oe],be=A[me]=ne?is(A[me]):sr(A[me]);if(sa(Ie,be))T(Ie,be,V,null,z,Z,ue,se,ne);else break;oe--,me--}if(X>oe){if(X<=me){const Ie=me+1,be=Ie<ye?A[Ie].el:G;for(;X<=me;)T(null,A[X]=ne?is(A[X]):sr(A[X]),V,be,z,Z,ue,se,ne),X++}}else if(X>me)for(;X<=oe;)tt(b[X],z,Z,!0),X++;else{const Ie=X,be=X,Re=new Map;for(X=be;X<=me;X++){const qt=A[X]=ne?is(A[X]):sr(A[X]);qt.key!=null&&Re.set(qt.key,X)}let je,$t=0;const Dt=me-be+1;let Oe=!1,Ve=0;const at=new Array(Dt);for(X=0;X<Dt;X++)at[X]=0;for(X=Ie;X<=oe;X++){const qt=b[X];if($t>=Dt){tt(qt,z,Z,!0);continue}let wn;if(qt.key!=null)wn=Re.get(qt.key);else for(je=be;je<=me;je++)if(at[je-be]===0&&sa(qt,A[je])){wn=je;break}wn===void 0?tt(qt,z,Z,!0):(at[wn-be]=X+1,wn>=Ve?Ve=wn:Oe=!0,T(qt,A[wn],V,null,z,Z,ue,se,ne),$t++)}const nt=Oe?sE(at):Wi;for(je=nt.length-1,X=Dt-1;X>=0;X--){const qt=be+X,wn=A[qt],Ii=qt+1<ye?A[qt+1].el:G;at[X]===0?T(null,wn,V,Ii,z,Z,ue,se,ne):Oe&&(je<0||X!==nt[je]?Zt(wn,V,Ii,2):je--)}}},Zt=(b,A,V,G,z=null)=>{const{el:Z,type:ue,transition:se,children:ne,shapeFlag:X}=b;if(X&6){Zt(b.component.subTree,A,V,G);return}if(X&128){b.suspense.move(A,V,G);return}if(X&64){ue.move(b,A,V,fe);return}if(ue===Rt){r(Z,A,V);for(let oe=0;oe<ne.length;oe++)Zt(ne[oe],A,V,G);r(b.anchor,A,V);return}if(ue===_c){L(b,A,V);return}if(G!==2&&X&1&&se)if(G===0)se.beforeEnter(Z),r(Z,A,V),Mn(()=>se.enter(Z),z);else{const{leave:oe,delayLeave:me,afterLeave:Ie}=se,be=()=>{b.ctx.isUnmounted?s(Z):r(Z,A,V)},Re=()=>{oe(Z,()=>{be(),Ie&&Ie()})};me?me(Z,be,Re):Re()}else r(Z,A,V)},tt=(b,A,V,G=!1,z=!1)=>{const{type:Z,props:ue,ref:se,children:ne,dynamicChildren:X,shapeFlag:ye,patchFlag:oe,dirs:me,cacheIndex:Ie}=b;if(oe===-2&&(z=!1),se!=null&&(Dr(),Ta(se,null,V,b,!0),Vr()),Ie!=null&&(A.renderCache[Ie]=void 0),ye&256){A.ctx.deactivate(b);return}const be=ye&1&&me,Re=!Aa(b);let je;if(Re&&(je=ue&&ue.onVnodeBeforeUnmount)&&tr(je,A,b),ye&6)en(b.component,V,G);else{if(ye&128){b.suspense.unmount(V,G);return}be&&Bs(b,null,A,"beforeUnmount"),ye&64?b.type.remove(b,A,V,fe,G):X&&!X.hasOnce&&(Z!==Rt||oe>0&&oe&64)?Qe(X,A,V,!1,!0):(Z===Rt&&oe&384||!z&&ye&16)&&Qe(ne,A,V),G&&ot(b)}(Re&&(je=ue&&ue.onVnodeUnmounted)||be)&&Mn(()=>{je&&tr(je,A,b),be&&Bs(b,null,A,"unmounted")},V)},ot=b=>{const{type:A,el:V,anchor:G,transition:z}=b;if(A===Rt){Nn(V,G);return}if(A===_c){M(b);return}const Z=()=>{s(V),z&&!z.persisted&&z.afterLeave&&z.afterLeave()};if(b.shapeFlag&1&&z&&!z.persisted){const{leave:ue,delayLeave:se}=z,ne=()=>ue(V,Z);se?se(b.el,Z,ne):ne()}else Z()},Nn=(b,A)=>{let V;for(;b!==A;)V=g(b),s(b),b=V;s(A)},en=(b,A,V)=>{const{bum:G,scope:z,job:Z,subTree:ue,um:se,m:ne,a:X,parent:ye,slots:{__:oe}}=b;sm(ne),sm(X),G&&mc(G),ye&&xe(oe)&&oe.forEach(me=>{ye.renderCache[me]=void 0}),z.stop(),Z&&(Z.flags|=8,tt(ue,b,A,V)),se&&Mn(se,A),Mn(()=>{b.isUnmounted=!0},A),A&&A.pendingBranch&&!A.isUnmounted&&b.asyncDep&&!b.asyncResolved&&b.suspenseId===A.pendingId&&(A.deps--,A.deps===0&&A.resolve())},Qe=(b,A,V,G=!1,z=!1,Z=0)=>{for(let ue=Z;ue<b.length;ue++)tt(b[ue],A,V,G,z)},$=b=>{if(b.shapeFlag&6)return $(b.component.subTree);if(b.shapeFlag&128)return b.suspense.next();const A=g(b.anchor||b.el),V=A&&A[AI];return V?g(V):A};let ce=!1;const ee=(b,A,V)=>{b==null?A._vnode&&tt(A._vnode,null,null,!0):T(A._vnode||null,b,A,null,null,null,V),A._vnode=b,ce||(ce=!0,Yp(),iy(),ce=!1)},fe={p:T,um:tt,m:Zt,r:ot,mt:ke,mc:E,pc:De,pbc:R,n:$,o:n};let Fe,Je;return e&&([Fe,Je]=e(fe)),{render:ee,hydrate:Fe,createApp:WI(ee,Fe)}}function bd({type:n,props:e},t){return t==="svg"&&n==="foreignObject"||t==="mathml"&&n==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:t}function js({effect:n,job:e},t){t?(n.flags|=32,e.flags|=4):(n.flags&=-33,e.flags&=-5)}function rE(n,e){return(!n||n&&!n.pendingBranch)&&e&&!e.persisted}function Ty(n,e,t=!1){const r=n.children,s=e.children;if(xe(r)&&xe(s))for(let i=0;i<r.length;i++){const o=r[i];let a=s[i];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=s[i]=is(s[i]),a.el=o.el),!t&&a.patchFlag!==-2&&Ty(o,a)),a.type===bu&&(a.el=o.el),a.type===ws&&!a.el&&(a.el=o.el)}}function sE(n){const e=n.slice(),t=[0];let r,s,i,o,a;const c=n.length;for(r=0;r<c;r++){const u=n[r];if(u!==0){if(s=t[t.length-1],n[s]<u){e[r]=s,t.push(r);continue}for(i=0,o=t.length-1;i<o;)a=i+o>>1,n[t[a]]<u?i=a+1:o=a;u<n[t[i]]&&(i>0&&(e[r]=t[i-1]),t[i]=r)}}for(i=t.length,o=t[i-1];i-- >0;)t[i]=o,o=e[o];return t}function Ay(n){const e=n.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:Ay(e)}function sm(n){if(n)for(let e=0;e<n.length;e++)n[e].flags|=8}const iE=Symbol.for("v-scx"),oE=()=>Jn(iE);function Yn(n,e,t){return Py(n,e,t)}function Py(n,e,t=dt){const{immediate:r,deep:s,flush:i,once:o}=t,a=Xt({},t),c=e&&r||!e&&i!=="post";let u;if(qa){if(i==="sync"){const _=oE();u=_.__watcherHandles||(_.__watcherHandles=[])}else if(!c){const _=()=>{};return _.stop=Wn,_.resume=Wn,_.pause=Wn,_}}const d=gn;a.call=(_,k,T)=>fr(_,d,k,T);let f=!1;i==="post"?a.scheduler=_=>{Mn(_,d&&d.suspense)}:i!=="sync"&&(f=!0,a.scheduler=(_,k)=>{k?_():Jh(_)}),a.augmentJob=_=>{e&&(_.flags|=4),f&&(_.flags|=2,d&&(_.id=d.uid,_.i=d))};const g=wI(n,e,a);return qa&&(u?u.push(g):c&&g()),g}function aE(n,e,t){const r=this.proxy,s=jt(n)?n.includes(".")?Sy(r,n):()=>r[n]:n.bind(r,r);let i;Ce(e)?i=e:(i=e.handler,t=e);const o=dl(this),a=Py(s,i.bind(r),t);return o(),a}function Sy(n,e){const t=e.split(".");return()=>{let r=n;for(let s=0;s<t.length&&r;s++)r=r[t[s]];return r}}const lE=(n,e)=>e==="modelValue"||e==="model-value"?n.modelModifiers:n[`${e}Modifiers`]||n[`${$n(e)}Modifiers`]||n[`${Cs(e)}Modifiers`];function cE(n,e,...t){if(n.isUnmounted)return;const r=n.vnode.props||dt;let s=t;const i=e.startsWith("update:"),o=i&&lE(r,e.slice(7));o&&(o.trim&&(s=t.map(d=>jt(d)?d.trim():d)),o.number&&(s=t.map(Qd)));let a,c=r[a=md(e)]||r[a=md($n(e))];!c&&i&&(c=r[a=md(Cs(e))]),c&&fr(c,n,6,s);const u=r[a+"Once"];if(u){if(!n.emitted)n.emitted={};else if(n.emitted[a])return;n.emitted[a]=!0,fr(u,n,6,s)}}function xy(n,e,t=!1){const r=e.emitsCache,s=r.get(n);if(s!==void 0)return s;const i=n.emits;let o={},a=!1;if(!Ce(n)){const c=u=>{const d=xy(u,e,!0);d&&(a=!0,Xt(o,d))};!t&&e.mixins.length&&e.mixins.forEach(c),n.extends&&c(n.extends),n.mixins&&n.mixins.forEach(c)}return!i&&!a?(It(n)&&r.set(n,null),null):(xe(i)?i.forEach(c=>o[c]=null):Xt(o,i),It(n)&&r.set(n,o),o)}function wu(n,e){return!n||!uu(e)?!1:(e=e.slice(2).replace(/Once$/,""),et(n,e[0].toLowerCase()+e.slice(1))||et(n,Cs(e))||et(n,e))}function Id(n){const{type:e,vnode:t,proxy:r,withProxy:s,propsOptions:[i],slots:o,attrs:a,emit:c,render:u,renderCache:d,props:f,data:g,setupState:_,ctx:k,inheritAttrs:T}=n,C=Lc(n);let F,j;try{if(t.shapeFlag&4){const M=s||r,q=M;F=sr(u.call(q,M,d,f,_,g,k)),j=a}else{const M=e;F=sr(M.length>1?M(f,{attrs:a,slots:o,emit:c}):M(f,null)),j=e.props?a:uE(a)}}catch(M){Sa.length=0,_u(M,n,1),F=Bt(ws)}let L=F;if(j&&T!==!1){const M=Object.keys(j),{shapeFlag:q}=L;M.length&&q&7&&(i&&M.some(Bh)&&(j=dE(j,i)),L=ao(L,j,!1,!0))}return t.dirs&&(L=ao(L,null,!1,!0),L.dirs=L.dirs?L.dirs.concat(t.dirs):t.dirs),t.transition&&Yh(L,t.transition),F=L,Lc(C),F}const uE=n=>{let e;for(const t in n)(t==="class"||t==="style"||uu(t))&&((e||(e={}))[t]=n[t]);return e},dE=(n,e)=>{const t={};for(const r in n)(!Bh(r)||!(r.slice(9)in e))&&(t[r]=n[r]);return t};function hE(n,e,t){const{props:r,children:s,component:i}=n,{props:o,children:a,patchFlag:c}=e,u=i.emitsOptions;if(e.dirs||e.transition)return!0;if(t&&c>=0){if(c&1024)return!0;if(c&16)return r?im(r,o,u):!!o;if(c&8){const d=e.dynamicProps;for(let f=0;f<d.length;f++){const g=d[f];if(o[g]!==r[g]&&!wu(u,g))return!0}}}else return(s||a)&&(!a||!a.$stable)?!0:r===o?!1:r?o?im(r,o,u):!0:!!o;return!1}function im(n,e,t){const r=Object.keys(e);if(r.length!==Object.keys(n).length)return!0;for(let s=0;s<r.length;s++){const i=r[s];if(e[i]!==n[i]&&!wu(t,i))return!0}return!1}function fE({vnode:n,parent:e},t){for(;e;){const r=e.subTree;if(r.suspense&&r.suspense.activeBranch===n&&(r.el=n.el),r===n)(n=e.vnode).el=t,e=e.parent;else break}}const Ry=n=>n.__isSuspense;function pE(n,e){e&&e.pendingBranch?xe(n)?e.effects.push(...n):e.effects.push(n):EI(n)}const Rt=Symbol.for("v-fgt"),bu=Symbol.for("v-txt"),ws=Symbol.for("v-cmt"),_c=Symbol.for("v-stc"),Sa=[];let Un=null;function W(n=!1){Sa.push(Un=n?null:[])}function mE(){Sa.pop(),Un=Sa[Sa.length-1]||null}let $a=1;function om(n,e=!1){$a+=n,n<0&&Un&&e&&(Un.hasOnce=!0)}function Cy(n){return n.dynamicChildren=$a>0?Un||Wi:null,mE(),$a>0&&Un&&Un.push(n),n}function Q(n,e,t,r,s,i){return Cy(m(n,e,t,r,s,i,!0))}function ky(n,e,t,r,s){return Cy(Bt(n,e,t,r,s,!0))}function Uc(n){return n?n.__v_isVNode===!0:!1}function sa(n,e){return n.type===e.type&&n.key===e.key}const Dy=({key:n})=>n??null,yc=({ref:n,ref_key:e,ref_for:t})=>(typeof n=="number"&&(n=""+n),n!=null?jt(n)||_n(n)||Ce(n)?{i:Fn,r:n,k:e,f:!!t}:n:null);function m(n,e=null,t=null,r=0,s=null,i=n===Rt?0:1,o=!1,a=!1){const c={__v_isVNode:!0,__v_skip:!0,type:n,props:e,key:e&&Dy(e),ref:e&&yc(e),scopeId:ay,slotScopeIds:null,children:t,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:r,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:Fn};return a?(tf(c,t),i&128&&n.normalize(c)):t&&(c.shapeFlag|=jt(t)?8:16),$a>0&&!o&&Un&&(c.patchFlag>0||i&6)&&c.patchFlag!==32&&Un.push(c),c}const Bt=gE;function gE(n,e=null,t=null,r=0,s=null,i=!1){if((!n||n===UI)&&(n=ws),Uc(n)){const a=ao(n,e,!0);return t&&tf(a,t),$a>0&&!i&&Un&&(a.shapeFlag&6?Un[Un.indexOf(n)]=a:Un.push(a)),a.patchFlag=-2,a}if(SE(n)&&(n=n.__vccOpts),e){e=_E(e);let{class:a,style:c}=e;a&&!jt(a)&&(e.class=cr(a)),It(c)&&(Qh(c)&&!xe(c)&&(c=Xt({},c)),e.style=Fa(c))}const o=jt(n)?1:Ry(n)?128:PI(n)?64:It(n)?4:Ce(n)?2:0;return m(n,e,t,r,s,o,i,!0)}function _E(n){return n?Qh(n)||yy(n)?Xt({},n):n:null}function ao(n,e,t=!1,r=!1){const{props:s,ref:i,patchFlag:o,children:a,transition:c}=n,u=e?yE(s||{},e):s,d={__v_isVNode:!0,__v_skip:!0,type:n.type,props:u,key:u&&Dy(u),ref:e&&e.ref?t&&i?xe(i)?i.concat(yc(e)):[i,yc(e)]:yc(e):i,scopeId:n.scopeId,slotScopeIds:n.slotScopeIds,children:a,target:n.target,targetStart:n.targetStart,targetAnchor:n.targetAnchor,staticCount:n.staticCount,shapeFlag:n.shapeFlag,patchFlag:e&&n.type!==Rt?o===-1?16:o|16:o,dynamicProps:n.dynamicProps,dynamicChildren:n.dynamicChildren,appContext:n.appContext,dirs:n.dirs,transition:c,component:n.component,suspense:n.suspense,ssContent:n.ssContent&&ao(n.ssContent),ssFallback:n.ssFallback&&ao(n.ssFallback),el:n.el,anchor:n.anchor,ctx:n.ctx,ce:n.ce};return c&&r&&Yh(d,c.clone(d)),d}function Tr(n=" ",e=0){return Bt(bu,null,n,e)}function rs(n,e){const t=Bt(_c,null,n);return t.staticCount=e,t}function Ae(n="",e=!1){return e?(W(),ky(ws,null,n)):Bt(ws,null,n)}function sr(n){return n==null||typeof n=="boolean"?Bt(ws):xe(n)?Bt(Rt,null,n.slice()):Uc(n)?is(n):Bt(bu,null,String(n))}function is(n){return n.el===null&&n.patchFlag!==-1||n.memo?n:ao(n)}function tf(n,e){let t=0;const{shapeFlag:r}=n;if(e==null)e=null;else if(xe(e))t=16;else if(typeof e=="object")if(r&65){const s=e.default;s&&(s._c&&(s._d=!1),tf(n,s()),s._c&&(s._d=!0));return}else{t=32;const s=e._;!s&&!yy(e)?e._ctx=Fn:s===3&&Fn&&(Fn.slots._===1?e._=1:(e._=2,n.patchFlag|=1024))}else Ce(e)?(e={default:e,_ctx:Fn},t=32):(e=String(e),r&64?(t=16,e=[Tr(e)]):t=8);n.children=e,n.shapeFlag|=t}function yE(...n){const e={};for(let t=0;t<n.length;t++){const r=n[t];for(const s in r)if(s==="class")e.class!==r.class&&(e.class=cr([e.class,r.class]));else if(s==="style")e.style=Fa([e.style,r.style]);else if(uu(s)){const i=e[s],o=r[s];o&&i!==o&&!(xe(i)&&i.includes(o))&&(e[s]=i?[].concat(i,o):o)}else s!==""&&(e[s]=r[s])}return e}function tr(n,e,t,r=null){fr(n,e,7,[t,r])}const vE=my();let wE=0;function bE(n,e,t){const r=n.type,s=(e?e.appContext:n.appContext)||vE,i={uid:wE++,vnode:n,type:r,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new Hb(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:wy(r,s),emitsOptions:xy(r,s),emit:null,emitted:null,propsDefaults:dt,inheritAttrs:r.inheritAttrs,ctx:dt,data:dt,props:dt,attrs:dt,slots:dt,refs:dt,setupState:dt,setupContext:null,suspense:t,suspenseId:t?t.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=e?e.root:i,i.emit=cE.bind(null,i),n.ce&&n.ce(i),i}let gn=null,Bc,sh;{const n=pu(),e=(t,r)=>{let s;return(s=n[t])||(s=n[t]=[]),s.push(r),i=>{s.length>1?s.forEach(o=>o(i)):s[0](i)}};Bc=e("__VUE_INSTANCE_SETTERS__",t=>gn=t),sh=e("__VUE_SSR_SETTERS__",t=>qa=t)}const dl=n=>{const e=gn;return Bc(n),n.scope.on(),()=>{n.scope.off(),Bc(e)}},am=()=>{gn&&gn.scope.off(),Bc(null)};function Vy(n){return n.vnode.shapeFlag&4}let qa=!1;function IE(n,e=!1,t=!1){e&&sh(e);const{props:r,children:s}=n.vnode,i=Vy(n);QI(n,r,i,e),ZI(n,s,t||e);const o=i?EE(n,e):void 0;return e&&sh(!1),o}function EE(n,e){const t=n.type;n.accessCache=Object.create(null),n.proxy=new Proxy(n.ctx,jI);const{setup:r}=t;if(r){Dr();const s=n.setupContext=r.length>1?AE(n):null,i=dl(n),o=ul(r,n,0,[n.props,s]),a=V_(o);if(Vr(),i(),(a||n.sp)&&!Aa(n)&&cy(n),a){if(o.then(am,am),e)return o.then(c=>{lm(n,c,e)}).catch(c=>{_u(c,n,0)});n.asyncDep=o}else lm(n,o,e)}else Ny(n,e)}function lm(n,e,t){Ce(e)?n.type.__ssrInlineRender?n.ssrRender=e:n.render=e:It(e)&&(n.setupState=ny(e)),Ny(n,t)}let cm;function Ny(n,e,t){const r=n.type;if(!n.render){if(!e&&cm&&!r.render){const s=r.template||Xh(n).template;if(s){const{isCustomElement:i,compilerOptions:o}=n.appContext.config,{delimiters:a,compilerOptions:c}=r,u=Xt(Xt({isCustomElement:i,delimiters:a},o),c);r.render=cm(s,u)}}n.render=r.render||Wn}{const s=dl(n);Dr();try{$I(n)}finally{Vr(),s()}}}const TE={get(n,e){return mn(n,"get",""),n[e]}};function AE(n){const e=t=>{n.exposed=t||{}};return{attrs:new Proxy(n.attrs,TE),slots:n.slots,emit:n.emit,expose:e}}function Iu(n){return n.exposed?n.exposeProxy||(n.exposeProxy=new Proxy(ny(fI(n.exposed)),{get(e,t){if(t in e)return e[t];if(t in Pa)return Pa[t](n)},has(e,t){return t in e||t in Pa}})):n.proxy}function PE(n,e=!0){return Ce(n)?n.displayName||n.name:n.name||e&&n.__name}function SE(n){return Ce(n)&&"__vccOpts"in n}const an=(n,e)=>yI(n,e,qa);function Oy(n,e,t){const r=arguments.length;return r===2?It(e)&&!xe(e)?Uc(e)?Bt(n,null,[e]):Bt(n,e):Bt(n,null,e):(r>3?t=Array.prototype.slice.call(arguments,2):r===3&&Uc(t)&&(t=[t]),Bt(n,e,t))}const xE="3.5.17";/**
* @vue/runtime-dom v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let ih;const um=typeof window<"u"&&window.trustedTypes;if(um)try{ih=um.createPolicy("vue",{createHTML:n=>n})}catch{}const My=ih?n=>ih.createHTML(n):n=>n,RE="http://www.w3.org/2000/svg",CE="http://www.w3.org/1998/Math/MathML",Er=typeof document<"u"?document:null,dm=Er&&Er.createElement("template"),kE={insert:(n,e,t)=>{e.insertBefore(n,t||null)},remove:n=>{const e=n.parentNode;e&&e.removeChild(n)},createElement:(n,e,t,r)=>{const s=e==="svg"?Er.createElementNS(RE,n):e==="mathml"?Er.createElementNS(CE,n):t?Er.createElement(n,{is:t}):Er.createElement(n);return n==="select"&&r&&r.multiple!=null&&s.setAttribute("multiple",r.multiple),s},createText:n=>Er.createTextNode(n),createComment:n=>Er.createComment(n),setText:(n,e)=>{n.nodeValue=e},setElementText:(n,e)=>{n.textContent=e},parentNode:n=>n.parentNode,nextSibling:n=>n.nextSibling,querySelector:n=>Er.querySelector(n),setScopeId(n,e){n.setAttribute(e,"")},insertStaticContent(n,e,t,r,s,i){const o=t?t.previousSibling:e.lastChild;if(s&&(s===i||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),t),!(s===i||!(s=s.nextSibling)););else{dm.innerHTML=My(r==="svg"?`<svg>${n}</svg>`:r==="mathml"?`<math>${n}</math>`:n);const a=dm.content;if(r==="svg"||r==="mathml"){const c=a.firstChild;for(;c.firstChild;)a.appendChild(c.firstChild);a.removeChild(c)}e.insertBefore(a,t)}return[o?o.nextSibling:e.firstChild,t?t.previousSibling:e.lastChild]}},DE=Symbol("_vtc");function VE(n,e,t){const r=n[DE];r&&(e=(e?[e,...r]:[...r]).join(" ")),e==null?n.removeAttribute("class"):t?n.setAttribute("class",e):n.className=e}const hm=Symbol("_vod"),NE=Symbol("_vsh"),OE=Symbol(""),ME=/(^|;)\s*display\s*:/;function LE(n,e,t){const r=n.style,s=jt(t);let i=!1;if(t&&!s){if(e)if(jt(e))for(const o of e.split(";")){const a=o.slice(0,o.indexOf(":")).trim();t[a]==null&&vc(r,a,"")}else for(const o in e)t[o]==null&&vc(r,o,"");for(const o in t)o==="display"&&(i=!0),vc(r,o,t[o])}else if(s){if(e!==t){const o=r[OE];o&&(t+=";"+o),r.cssText=t,i=ME.test(t)}}else e&&n.removeAttribute("style");hm in n&&(n[hm]=i?r.display:"",n[NE]&&(r.display="none"))}const fm=/\s*!important$/;function vc(n,e,t){if(xe(t))t.forEach(r=>vc(n,e,r));else if(t==null&&(t=""),e.startsWith("--"))n.setProperty(e,t);else{const r=FE(n,e);fm.test(t)?n.setProperty(Cs(r),t.replace(fm,""),"important"):n[r]=t}}const pm=["Webkit","Moz","ms"],Ed={};function FE(n,e){const t=Ed[e];if(t)return t;let r=$n(e);if(r!=="filter"&&r in n)return Ed[e]=r;r=fu(r);for(let s=0;s<pm.length;s++){const i=pm[s]+r;if(i in n)return Ed[e]=i}return e}const mm="http://www.w3.org/1999/xlink";function gm(n,e,t,r,s,i=Kb(e)){r&&e.startsWith("xlink:")?t==null?n.removeAttributeNS(mm,e.slice(6,e.length)):n.setAttributeNS(mm,e,t):t==null||i&&!M_(t)?n.removeAttribute(e):n.setAttribute(e,i?"":Rs(t)?String(t):t)}function _m(n,e,t,r,s){if(e==="innerHTML"||e==="textContent"){t!=null&&(n[e]=e==="innerHTML"?My(t):t);return}const i=n.tagName;if(e==="value"&&i!=="PROGRESS"&&!i.includes("-")){const a=i==="OPTION"?n.getAttribute("value")||"":n.value,c=t==null?n.type==="checkbox"?"on":"":String(t);(a!==c||!("_value"in n))&&(n.value=c),t==null&&n.removeAttribute(e),n._value=t;return}let o=!1;if(t===""||t==null){const a=typeof n[e];a==="boolean"?t=M_(t):t==null&&a==="string"?(t="",o=!0):a==="number"&&(t=0,o=!0)}try{n[e]=t}catch{}o&&n.removeAttribute(s||e)}function $i(n,e,t,r){n.addEventListener(e,t,r)}function UE(n,e,t,r){n.removeEventListener(e,t,r)}const ym=Symbol("_vei");function BE(n,e,t,r,s=null){const i=n[ym]||(n[ym]={}),o=i[e];if(r&&o)o.value=r;else{const[a,c]=jE(e);if(r){const u=i[e]=zE(r,s);$i(n,a,u,c)}else o&&(UE(n,a,o,c),i[e]=void 0)}}const vm=/(?:Once|Passive|Capture)$/;function jE(n){let e;if(vm.test(n)){e={};let r;for(;r=n.match(vm);)n=n.slice(0,n.length-r[0].length),e[r[0].toLowerCase()]=!0}return[n[2]===":"?n.slice(3):Cs(n.slice(2)),e]}let Td=0;const $E=Promise.resolve(),qE=()=>Td||($E.then(()=>Td=0),Td=Date.now());function zE(n,e){const t=r=>{if(!r._vts)r._vts=Date.now();else if(r._vts<=t.attached)return;fr(GE(r,t.value),e,5,[r])};return t.value=n,t.attached=qE(),t}function GE(n,e){if(xe(e)){const t=n.stopImmediatePropagation;return n.stopImmediatePropagation=()=>{t.call(n),n._stopped=!0},e.map(r=>s=>!s._stopped&&r&&r(s))}else return e}const wm=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&n.charCodeAt(2)>96&&n.charCodeAt(2)<123,KE=(n,e,t,r,s,i)=>{const o=s==="svg";e==="class"?VE(n,r,o):e==="style"?LE(n,t,r):uu(e)?Bh(e)||BE(n,e,t,r,i):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):HE(n,e,r,o))?(_m(n,e,r),!n.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&gm(n,e,r,o,i,e!=="value")):n._isVueCE&&(/[A-Z]/.test(e)||!jt(r))?_m(n,$n(e),r,i,e):(e==="true-value"?n._trueValue=r:e==="false-value"&&(n._falseValue=r),gm(n,e,r,o))};function HE(n,e,t,r){if(r)return!!(e==="innerHTML"||e==="textContent"||e in n&&wm(e)&&Ce(t));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="form"||e==="list"&&n.tagName==="INPUT"||e==="type"&&n.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=n.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return wm(e)&&jt(t)?!1:e in n}const bm=n=>{const e=n.props["onUpdate:modelValue"]||!1;return xe(e)?t=>mc(e,t):e};function WE(n){n.target.composing=!0}function Im(n){const e=n.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const Ad=Symbol("_assign"),Tt={created(n,{modifiers:{lazy:e,trim:t,number:r}},s){n[Ad]=bm(s);const i=r||s.props&&s.props.type==="number";$i(n,e?"change":"input",o=>{if(o.target.composing)return;let a=n.value;t&&(a=a.trim()),i&&(a=Qd(a)),n[Ad](a)}),t&&$i(n,"change",()=>{n.value=n.value.trim()}),e||($i(n,"compositionstart",WE),$i(n,"compositionend",Im),$i(n,"change",Im))},mounted(n,{value:e}){n.value=e??""},beforeUpdate(n,{value:e,oldValue:t,modifiers:{lazy:r,trim:s,number:i}},o){if(n[Ad]=bm(o),n.composing)return;const a=(i||n.type==="number")&&!/^0\d/.test(n.value)?Qd(n.value):n.value,c=e??"";a!==c&&(document.activeElement===n&&n.type!=="range"&&(r&&e===t||s&&n.value.trim()===c)||(n.value=c))}},QE=["ctrl","shift","alt","meta"],JE={stop:n=>n.stopPropagation(),prevent:n=>n.preventDefault(),self:n=>n.target!==n.currentTarget,ctrl:n=>!n.ctrlKey,shift:n=>!n.shiftKey,alt:n=>!n.altKey,meta:n=>!n.metaKey,left:n=>"button"in n&&n.button!==0,middle:n=>"button"in n&&n.button!==1,right:n=>"button"in n&&n.button!==2,exact:(n,e)=>QE.some(t=>n[`${t}Key`]&&!e.includes(t))},Hn=(n,e)=>{const t=n._withMods||(n._withMods={}),r=e.join(".");return t[r]||(t[r]=(s,...i)=>{for(let o=0;o<e.length;o++){const a=JE[e[o]];if(a&&a(s,e))return}return n(s,...i)})},YE={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},In=(n,e)=>{const t=n._withKeys||(n._withKeys={}),r=e.join(".");return t[r]||(t[r]=s=>{if(!("key"in s))return;const i=Cs(s.key);if(e.some(o=>o===i||YE[o]===i))return n(s)})},XE=Xt({patchProp:KE},kE);let Em;function ZE(){return Em||(Em=tE(XE))}const eT=(...n)=>{const e=ZE().createApp(...n),{mount:t}=e;return e.mount=r=>{const s=nT(r);if(!s)return;const i=e._component;!Ce(i)&&!i.render&&!i.template&&(i.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const o=t(s,!1,tT(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),o},e};function tT(n){if(n instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&n instanceof MathMLElement)return"mathml"}function nT(n){return jt(n)?document.querySelector(n):n}const rT={__name:"App",setup(n){return(e,t)=>{const r=FI("router-view");return W(),ky(r)}}};/*!
  * vue-router v4.5.1
  * (c) 2025 Eduardo San Martin Morote
  * @license MIT
  */const qi=typeof document<"u";function Ly(n){return typeof n=="object"||"displayName"in n||"props"in n||"__vccOpts"in n}function sT(n){return n.__esModule||n[Symbol.toStringTag]==="Module"||n.default&&Ly(n.default)}const Xe=Object.assign;function Pd(n,e){const t={};for(const r in e){const s=e[r];t[r]=Xn(s)?s.map(n):n(s)}return t}const xa=()=>{},Xn=Array.isArray,Fy=/#/g,iT=/&/g,oT=/\//g,aT=/=/g,lT=/\?/g,Uy=/\+/g,cT=/%5B/g,uT=/%5D/g,By=/%5E/g,dT=/%60/g,jy=/%7B/g,hT=/%7C/g,$y=/%7D/g,fT=/%20/g;function nf(n){return encodeURI(""+n).replace(hT,"|").replace(cT,"[").replace(uT,"]")}function pT(n){return nf(n).replace(jy,"{").replace($y,"}").replace(By,"^")}function oh(n){return nf(n).replace(Uy,"%2B").replace(fT,"+").replace(Fy,"%23").replace(iT,"%26").replace(dT,"`").replace(jy,"{").replace($y,"}").replace(By,"^")}function mT(n){return oh(n).replace(aT,"%3D")}function gT(n){return nf(n).replace(Fy,"%23").replace(lT,"%3F")}function _T(n){return n==null?"":gT(n).replace(oT,"%2F")}function za(n){try{return decodeURIComponent(""+n)}catch{}return""+n}const yT=/\/$/,vT=n=>n.replace(yT,"");function Sd(n,e,t="/"){let r,s={},i="",o="";const a=e.indexOf("#");let c=e.indexOf("?");return a<c&&a>=0&&(c=-1),c>-1&&(r=e.slice(0,c),i=e.slice(c+1,a>-1?a:e.length),s=n(i)),a>-1&&(r=r||e.slice(0,a),o=e.slice(a,e.length)),r=ET(r??e,t),{fullPath:r+(i&&"?")+i+o,path:r,query:s,hash:za(o)}}function wT(n,e){const t=e.query?n(e.query):"";return e.path+(t&&"?")+t+(e.hash||"")}function Tm(n,e){return!e||!n.toLowerCase().startsWith(e.toLowerCase())?n:n.slice(e.length)||"/"}function bT(n,e,t){const r=e.matched.length-1,s=t.matched.length-1;return r>-1&&r===s&&lo(e.matched[r],t.matched[s])&&qy(e.params,t.params)&&n(e.query)===n(t.query)&&e.hash===t.hash}function lo(n,e){return(n.aliasOf||n)===(e.aliasOf||e)}function qy(n,e){if(Object.keys(n).length!==Object.keys(e).length)return!1;for(const t in n)if(!IT(n[t],e[t]))return!1;return!0}function IT(n,e){return Xn(n)?Am(n,e):Xn(e)?Am(e,n):n===e}function Am(n,e){return Xn(e)?n.length===e.length&&n.every((t,r)=>t===e[r]):n.length===1&&n[0]===e}function ET(n,e){if(n.startsWith("/"))return n;if(!n)return e;const t=e.split("/"),r=n.split("/"),s=r[r.length-1];(s===".."||s===".")&&r.push("");let i=t.length-1,o,a;for(o=0;o<r.length;o++)if(a=r[o],a!==".")if(a==="..")i>1&&i--;else break;return t.slice(0,i).join("/")+"/"+r.slice(o).join("/")}const Zr={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};var Ga;(function(n){n.pop="pop",n.push="push"})(Ga||(Ga={}));var Ra;(function(n){n.back="back",n.forward="forward",n.unknown=""})(Ra||(Ra={}));function TT(n){if(!n)if(qi){const e=document.querySelector("base");n=e&&e.getAttribute("href")||"/",n=n.replace(/^\w+:\/\/[^\/]+/,"")}else n="/";return n[0]!=="/"&&n[0]!=="#"&&(n="/"+n),vT(n)}const AT=/^[^#]+#/;function PT(n,e){return n.replace(AT,"#")+e}function ST(n,e){const t=document.documentElement.getBoundingClientRect(),r=n.getBoundingClientRect();return{behavior:e.behavior,left:r.left-t.left-(e.left||0),top:r.top-t.top-(e.top||0)}}const Eu=()=>({left:window.scrollX,top:window.scrollY});function xT(n){let e;if("el"in n){const t=n.el,r=typeof t=="string"&&t.startsWith("#"),s=typeof t=="string"?r?document.getElementById(t.slice(1)):document.querySelector(t):t;if(!s)return;e=ST(s,n)}else e=n;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.scrollX,e.top!=null?e.top:window.scrollY)}function Pm(n,e){return(history.state?history.state.position-e:-1)+n}const ah=new Map;function RT(n,e){ah.set(n,e)}function CT(n){const e=ah.get(n);return ah.delete(n),e}let kT=()=>location.protocol+"//"+location.host;function zy(n,e){const{pathname:t,search:r,hash:s}=e,i=n.indexOf("#");if(i>-1){let a=s.includes(n.slice(i))?n.slice(i).length:1,c=s.slice(a);return c[0]!=="/"&&(c="/"+c),Tm(c,"")}return Tm(t,n)+r+s}function DT(n,e,t,r){let s=[],i=[],o=null;const a=({state:g})=>{const _=zy(n,location),k=t.value,T=e.value;let C=0;if(g){if(t.value=_,e.value=g,o&&o===k){o=null;return}C=T?g.position-T.position:0}else r(_);s.forEach(F=>{F(t.value,k,{delta:C,type:Ga.pop,direction:C?C>0?Ra.forward:Ra.back:Ra.unknown})})};function c(){o=t.value}function u(g){s.push(g);const _=()=>{const k=s.indexOf(g);k>-1&&s.splice(k,1)};return i.push(_),_}function d(){const{history:g}=window;g.state&&g.replaceState(Xe({},g.state,{scroll:Eu()}),"")}function f(){for(const g of i)g();i=[],window.removeEventListener("popstate",a),window.removeEventListener("beforeunload",d)}return window.addEventListener("popstate",a),window.addEventListener("beforeunload",d,{passive:!0}),{pauseListeners:c,listen:u,destroy:f}}function Sm(n,e,t,r=!1,s=!1){return{back:n,current:e,forward:t,replaced:r,position:window.history.length,scroll:s?Eu():null}}function VT(n){const{history:e,location:t}=window,r={value:zy(n,t)},s={value:e.state};s.value||i(r.value,{back:null,current:r.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function i(c,u,d){const f=n.indexOf("#"),g=f>-1?(t.host&&document.querySelector("base")?n:n.slice(f))+c:kT()+n+c;try{e[d?"replaceState":"pushState"](u,"",g),s.value=u}catch(_){console.error(_),t[d?"replace":"assign"](g)}}function o(c,u){const d=Xe({},e.state,Sm(s.value.back,c,s.value.forward,!0),u,{position:s.value.position});i(c,d,!0),r.value=c}function a(c,u){const d=Xe({},s.value,e.state,{forward:c,scroll:Eu()});i(d.current,d,!0);const f=Xe({},Sm(r.value,c,null),{position:d.position+1},u);i(c,f,!1),r.value=c}return{location:r,state:s,push:a,replace:o}}function NT(n){n=TT(n);const e=VT(n),t=DT(n,e.state,e.location,e.replace);function r(i,o=!0){o||t.pauseListeners(),history.go(i)}const s=Xe({location:"",base:n,go:r,createHref:PT.bind(null,n)},e,t);return Object.defineProperty(s,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(s,"state",{enumerable:!0,get:()=>e.state.value}),s}function OT(n){return typeof n=="string"||n&&typeof n=="object"}function Gy(n){return typeof n=="string"||typeof n=="symbol"}const Ky=Symbol("");var xm;(function(n){n[n.aborted=4]="aborted",n[n.cancelled=8]="cancelled",n[n.duplicated=16]="duplicated"})(xm||(xm={}));function co(n,e){return Xe(new Error,{type:n,[Ky]:!0},e)}function Ir(n,e){return n instanceof Error&&Ky in n&&(e==null||!!(n.type&e))}const Rm="[^/]+?",MT={sensitive:!1,strict:!1,start:!0,end:!0},LT=/[.+*?^${}()[\]/\\]/g;function FT(n,e){const t=Xe({},MT,e),r=[];let s=t.start?"^":"";const i=[];for(const u of n){const d=u.length?[]:[90];t.strict&&!u.length&&(s+="/");for(let f=0;f<u.length;f++){const g=u[f];let _=40+(t.sensitive?.25:0);if(g.type===0)f||(s+="/"),s+=g.value.replace(LT,"\\$&"),_+=40;else if(g.type===1){const{value:k,repeatable:T,optional:C,regexp:F}=g;i.push({name:k,repeatable:T,optional:C});const j=F||Rm;if(j!==Rm){_+=10;try{new RegExp(`(${j})`)}catch(M){throw new Error(`Invalid custom RegExp for param "${k}" (${j}): `+M.message)}}let L=T?`((?:${j})(?:/(?:${j}))*)`:`(${j})`;f||(L=C&&u.length<2?`(?:/${L})`:"/"+L),C&&(L+="?"),s+=L,_+=20,C&&(_+=-8),T&&(_+=-20),j===".*"&&(_+=-50)}d.push(_)}r.push(d)}if(t.strict&&t.end){const u=r.length-1;r[u][r[u].length-1]+=.7000000000000001}t.strict||(s+="/?"),t.end?s+="$":t.strict&&!s.endsWith("/")&&(s+="(?:/|$)");const o=new RegExp(s,t.sensitive?"":"i");function a(u){const d=u.match(o),f={};if(!d)return null;for(let g=1;g<d.length;g++){const _=d[g]||"",k=i[g-1];f[k.name]=_&&k.repeatable?_.split("/"):_}return f}function c(u){let d="",f=!1;for(const g of n){(!f||!d.endsWith("/"))&&(d+="/"),f=!1;for(const _ of g)if(_.type===0)d+=_.value;else if(_.type===1){const{value:k,repeatable:T,optional:C}=_,F=k in u?u[k]:"";if(Xn(F)&&!T)throw new Error(`Provided param "${k}" is an array but it is not repeatable (* or + modifiers)`);const j=Xn(F)?F.join("/"):F;if(!j)if(C)g.length<2&&(d.endsWith("/")?d=d.slice(0,-1):f=!0);else throw new Error(`Missing required param "${k}"`);d+=j}}return d||"/"}return{re:o,score:r,keys:i,parse:a,stringify:c}}function UT(n,e){let t=0;for(;t<n.length&&t<e.length;){const r=e[t]-n[t];if(r)return r;t++}return n.length<e.length?n.length===1&&n[0]===40+40?-1:1:n.length>e.length?e.length===1&&e[0]===40+40?1:-1:0}function Hy(n,e){let t=0;const r=n.score,s=e.score;for(;t<r.length&&t<s.length;){const i=UT(r[t],s[t]);if(i)return i;t++}if(Math.abs(s.length-r.length)===1){if(Cm(r))return 1;if(Cm(s))return-1}return s.length-r.length}function Cm(n){const e=n[n.length-1];return n.length>0&&e[e.length-1]<0}const BT={type:0,value:""},jT=/[a-zA-Z0-9_]/;function $T(n){if(!n)return[[]];if(n==="/")return[[BT]];if(!n.startsWith("/"))throw new Error(`Invalid path "${n}"`);function e(_){throw new Error(`ERR (${t})/"${u}": ${_}`)}let t=0,r=t;const s=[];let i;function o(){i&&s.push(i),i=[]}let a=0,c,u="",d="";function f(){u&&(t===0?i.push({type:0,value:u}):t===1||t===2||t===3?(i.length>1&&(c==="*"||c==="+")&&e(`A repeatable param (${u}) must be alone in its segment. eg: '/:ids+.`),i.push({type:1,value:u,regexp:d,repeatable:c==="*"||c==="+",optional:c==="*"||c==="?"})):e("Invalid state to consume buffer"),u="")}function g(){u+=c}for(;a<n.length;){if(c=n[a++],c==="\\"&&t!==2){r=t,t=4;continue}switch(t){case 0:c==="/"?(u&&f(),o()):c===":"?(f(),t=1):g();break;case 4:g(),t=r;break;case 1:c==="("?t=2:jT.test(c)?g():(f(),t=0,c!=="*"&&c!=="?"&&c!=="+"&&a--);break;case 2:c===")"?d[d.length-1]=="\\"?d=d.slice(0,-1)+c:t=3:d+=c;break;case 3:f(),t=0,c!=="*"&&c!=="?"&&c!=="+"&&a--,d="";break;default:e("Unknown state");break}}return t===2&&e(`Unfinished custom RegExp for param "${u}"`),f(),o(),s}function qT(n,e,t){const r=FT($T(n.path),t),s=Xe(r,{record:n,parent:e,children:[],alias:[]});return e&&!s.record.aliasOf==!e.record.aliasOf&&e.children.push(s),s}function zT(n,e){const t=[],r=new Map;e=Nm({strict:!1,end:!0,sensitive:!1},e);function s(f){return r.get(f)}function i(f,g,_){const k=!_,T=Dm(f);T.aliasOf=_&&_.record;const C=Nm(e,f),F=[T];if("alias"in f){const M=typeof f.alias=="string"?[f.alias]:f.alias;for(const q of M)F.push(Dm(Xe({},T,{components:_?_.record.components:T.components,path:q,aliasOf:_?_.record:T})))}let j,L;for(const M of F){const{path:q}=M;if(g&&q[0]!=="/"){const te=g.record.path,x=te[te.length-1]==="/"?"":"/";M.path=g.record.path+(q&&x+q)}if(j=qT(M,g,C),_?_.alias.push(j):(L=L||j,L!==j&&L.alias.push(j),k&&f.name&&!Vm(j)&&o(f.name)),Wy(j)&&c(j),T.children){const te=T.children;for(let x=0;x<te.length;x++)i(te[x],j,_&&_.children[x])}_=_||j}return L?()=>{o(L)}:xa}function o(f){if(Gy(f)){const g=r.get(f);g&&(r.delete(f),t.splice(t.indexOf(g),1),g.children.forEach(o),g.alias.forEach(o))}else{const g=t.indexOf(f);g>-1&&(t.splice(g,1),f.record.name&&r.delete(f.record.name),f.children.forEach(o),f.alias.forEach(o))}}function a(){return t}function c(f){const g=HT(f,t);t.splice(g,0,f),f.record.name&&!Vm(f)&&r.set(f.record.name,f)}function u(f,g){let _,k={},T,C;if("name"in f&&f.name){if(_=r.get(f.name),!_)throw co(1,{location:f});C=_.record.name,k=Xe(km(g.params,_.keys.filter(L=>!L.optional).concat(_.parent?_.parent.keys.filter(L=>L.optional):[]).map(L=>L.name)),f.params&&km(f.params,_.keys.map(L=>L.name))),T=_.stringify(k)}else if(f.path!=null)T=f.path,_=t.find(L=>L.re.test(T)),_&&(k=_.parse(T),C=_.record.name);else{if(_=g.name?r.get(g.name):t.find(L=>L.re.test(g.path)),!_)throw co(1,{location:f,currentLocation:g});C=_.record.name,k=Xe({},g.params,f.params),T=_.stringify(k)}const F=[];let j=_;for(;j;)F.unshift(j.record),j=j.parent;return{name:C,path:T,params:k,matched:F,meta:KT(F)}}n.forEach(f=>i(f));function d(){t.length=0,r.clear()}return{addRoute:i,resolve:u,removeRoute:o,clearRoutes:d,getRoutes:a,getRecordMatcher:s}}function km(n,e){const t={};for(const r of e)r in n&&(t[r]=n[r]);return t}function Dm(n){const e={path:n.path,redirect:n.redirect,name:n.name,meta:n.meta||{},aliasOf:n.aliasOf,beforeEnter:n.beforeEnter,props:GT(n),children:n.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in n?n.components||null:n.component&&{default:n.component}};return Object.defineProperty(e,"mods",{value:{}}),e}function GT(n){const e={},t=n.props||!1;if("component"in n)e.default=t;else for(const r in n.components)e[r]=typeof t=="object"?t[r]:t;return e}function Vm(n){for(;n;){if(n.record.aliasOf)return!0;n=n.parent}return!1}function KT(n){return n.reduce((e,t)=>Xe(e,t.meta),{})}function Nm(n,e){const t={};for(const r in n)t[r]=r in e?e[r]:n[r];return t}function HT(n,e){let t=0,r=e.length;for(;t!==r;){const i=t+r>>1;Hy(n,e[i])<0?r=i:t=i+1}const s=WT(n);return s&&(r=e.lastIndexOf(s,r-1)),r}function WT(n){let e=n;for(;e=e.parent;)if(Wy(e)&&Hy(n,e)===0)return e}function Wy({record:n}){return!!(n.name||n.components&&Object.keys(n.components).length||n.redirect)}function QT(n){const e={};if(n===""||n==="?")return e;const r=(n[0]==="?"?n.slice(1):n).split("&");for(let s=0;s<r.length;++s){const i=r[s].replace(Uy," "),o=i.indexOf("="),a=za(o<0?i:i.slice(0,o)),c=o<0?null:za(i.slice(o+1));if(a in e){let u=e[a];Xn(u)||(u=e[a]=[u]),u.push(c)}else e[a]=c}return e}function Om(n){let e="";for(let t in n){const r=n[t];if(t=mT(t),r==null){r!==void 0&&(e+=(e.length?"&":"")+t);continue}(Xn(r)?r.map(i=>i&&oh(i)):[r&&oh(r)]).forEach(i=>{i!==void 0&&(e+=(e.length?"&":"")+t,i!=null&&(e+="="+i))})}return e}function JT(n){const e={};for(const t in n){const r=n[t];r!==void 0&&(e[t]=Xn(r)?r.map(s=>s==null?null:""+s):r==null?r:""+r)}return e}const YT=Symbol(""),Mm=Symbol(""),Tu=Symbol(""),rf=Symbol(""),lh=Symbol("");function ia(){let n=[];function e(r){return n.push(r),()=>{const s=n.indexOf(r);s>-1&&n.splice(s,1)}}function t(){n=[]}return{add:e,list:()=>n.slice(),reset:t}}function os(n,e,t,r,s,i=o=>o()){const o=r&&(r.enterCallbacks[s]=r.enterCallbacks[s]||[]);return()=>new Promise((a,c)=>{const u=g=>{g===!1?c(co(4,{from:t,to:e})):g instanceof Error?c(g):OT(g)?c(co(2,{from:e,to:g})):(o&&r.enterCallbacks[s]===o&&typeof g=="function"&&o.push(g),a())},d=i(()=>n.call(r&&r.instances[s],e,t,u));let f=Promise.resolve(d);n.length<3&&(f=f.then(u)),f.catch(g=>c(g))})}function xd(n,e,t,r,s=i=>i()){const i=[];for(const o of n)for(const a in o.components){let c=o.components[a];if(!(e!=="beforeRouteEnter"&&!o.instances[a]))if(Ly(c)){const d=(c.__vccOpts||c)[e];d&&i.push(os(d,t,r,o,a,s))}else{let u=c();i.push(()=>u.then(d=>{if(!d)throw new Error(`Couldn't resolve component "${a}" at "${o.path}"`);const f=sT(d)?d.default:d;o.mods[a]=d,o.components[a]=f;const _=(f.__vccOpts||f)[e];return _&&os(_,t,r,o,a,s)()}))}}return i}function Lm(n){const e=Jn(Tu),t=Jn(rf),r=an(()=>{const c=Yi(n.to);return e.resolve(c)}),s=an(()=>{const{matched:c}=r.value,{length:u}=c,d=c[u-1],f=t.matched;if(!d||!f.length)return-1;const g=f.findIndex(lo.bind(null,d));if(g>-1)return g;const _=Fm(c[u-2]);return u>1&&Fm(d)===_&&f[f.length-1].path!==_?f.findIndex(lo.bind(null,c[u-2])):g}),i=an(()=>s.value>-1&&nA(t.params,r.value.params)),o=an(()=>s.value>-1&&s.value===t.matched.length-1&&qy(t.params,r.value.params));function a(c={}){if(tA(c)){const u=e[Yi(n.replace)?"replace":"push"](Yi(n.to)).catch(xa);return n.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>u),u}return Promise.resolve()}return{route:r,href:an(()=>r.value.href),isActive:i,isExactActive:o,navigate:a}}function XT(n){return n.length===1?n[0]:n}const ZT=ly({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:Lm,setup(n,{slots:e}){const t=gu(Lm(n)),{options:r}=Jn(Tu),s=an(()=>({[Um(n.activeClass,r.linkActiveClass,"router-link-active")]:t.isActive,[Um(n.exactActiveClass,r.linkExactActiveClass,"router-link-exact-active")]:t.isExactActive}));return()=>{const i=e.default&&XT(e.default(t));return n.custom?i:Oy("a",{"aria-current":t.isExactActive?n.ariaCurrentValue:null,href:t.href,onClick:t.navigate,class:s.value},i)}}}),eA=ZT;function tA(n){if(!(n.metaKey||n.altKey||n.ctrlKey||n.shiftKey)&&!n.defaultPrevented&&!(n.button!==void 0&&n.button!==0)){if(n.currentTarget&&n.currentTarget.getAttribute){const e=n.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return n.preventDefault&&n.preventDefault(),!0}}function nA(n,e){for(const t in e){const r=e[t],s=n[t];if(typeof r=="string"){if(r!==s)return!1}else if(!Xn(s)||s.length!==r.length||r.some((i,o)=>i!==s[o]))return!1}return!0}function Fm(n){return n?n.aliasOf?n.aliasOf.path:n.path:""}const Um=(n,e,t)=>n??e??t,rA=ly({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(n,{attrs:e,slots:t}){const r=Jn(lh),s=an(()=>n.route||r.value),i=Jn(Mm,0),o=an(()=>{let u=Yi(i);const{matched:d}=s.value;let f;for(;(f=d[u])&&!f.components;)u++;return u}),a=an(()=>s.value.matched[o.value]);gc(Mm,an(()=>o.value+1)),gc(YT,a),gc(lh,s);const c=K();return Yn(()=>[c.value,a.value,n.name],([u,d,f],[g,_,k])=>{d&&(d.instances[f]=u,_&&_!==d&&u&&u===g&&(d.leaveGuards.size||(d.leaveGuards=_.leaveGuards),d.updateGuards.size||(d.updateGuards=_.updateGuards))),u&&d&&(!_||!lo(d,_)||!g)&&(d.enterCallbacks[f]||[]).forEach(T=>T(u))},{flush:"post"}),()=>{const u=s.value,d=n.name,f=a.value,g=f&&f.components[d];if(!g)return Bm(t.default,{Component:g,route:u});const _=f.props[d],k=_?_===!0?u.params:typeof _=="function"?_(u):_:null,C=Oy(g,Xe({},k,e,{onVnodeUnmounted:F=>{F.component.isUnmounted&&(f.instances[d]=null)},ref:c}));return Bm(t.default,{Component:C,route:u})||C}}});function Bm(n,e){if(!n)return null;const t=n(e);return t.length===1?t[0]:t}const sA=rA;function iA(n){const e=zT(n.routes,n),t=n.parseQuery||QT,r=n.stringifyQuery||Om,s=n.history,i=ia(),o=ia(),a=ia(),c=pI(Zr);let u=Zr;qi&&n.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const d=Pd.bind(null,$=>""+$),f=Pd.bind(null,_T),g=Pd.bind(null,za);function _($,ce){let ee,fe;return Gy($)?(ee=e.getRecordMatcher($),fe=ce):fe=$,e.addRoute(fe,ee)}function k($){const ce=e.getRecordMatcher($);ce&&e.removeRoute(ce)}function T(){return e.getRoutes().map($=>$.record)}function C($){return!!e.getRecordMatcher($)}function F($,ce){if(ce=Xe({},ce||c.value),typeof $=="string"){const A=Sd(t,$,ce.path),V=e.resolve({path:A.path},ce),G=s.createHref(A.fullPath);return Xe(A,V,{params:g(V.params),hash:za(A.hash),redirectedFrom:void 0,href:G})}let ee;if($.path!=null)ee=Xe({},$,{path:Sd(t,$.path,ce.path).path});else{const A=Xe({},$.params);for(const V in A)A[V]==null&&delete A[V];ee=Xe({},$,{params:f(A)}),ce.params=f(ce.params)}const fe=e.resolve(ee,ce),Fe=$.hash||"";fe.params=d(g(fe.params));const Je=wT(r,Xe({},$,{hash:pT(Fe),path:fe.path})),b=s.createHref(Je);return Xe({fullPath:Je,hash:Fe,query:r===Om?JT($.query):$.query||{}},fe,{redirectedFrom:void 0,href:b})}function j($){return typeof $=="string"?Sd(t,$,c.value.path):Xe({},$)}function L($,ce){if(u!==$)return co(8,{from:ce,to:$})}function M($){return x($)}function q($){return M(Xe(j($),{replace:!0}))}function te($){const ce=$.matched[$.matched.length-1];if(ce&&ce.redirect){const{redirect:ee}=ce;let fe=typeof ee=="function"?ee($):ee;return typeof fe=="string"&&(fe=fe.includes("?")||fe.includes("#")?fe=j(fe):{path:fe},fe.params={}),Xe({query:$.query,hash:$.hash,params:fe.path!=null?{}:$.params},fe)}}function x($,ce){const ee=u=F($),fe=c.value,Fe=$.state,Je=$.force,b=$.replace===!0,A=te(ee);if(A)return x(Xe(j(A),{state:typeof A=="object"?Xe({},Fe,A.state):Fe,force:Je,replace:b}),ce||ee);const V=ee;V.redirectedFrom=ce;let G;return!Je&&bT(r,fe,ee)&&(G=co(16,{to:V,from:fe}),Zt(fe,fe,!0,!1)),(G?Promise.resolve(G):R(V,fe)).catch(z=>Ir(z)?Ir(z,2)?z:un(z):De(z,V,fe)).then(z=>{if(z){if(Ir(z,2))return x(Xe({replace:b},j(z.to),{state:typeof z.to=="object"?Xe({},Fe,z.to.state):Fe,force:Je}),ce||V)}else z=P(V,fe,!0,b,Fe);return w(V,fe,z),z})}function E($,ce){const ee=L($,ce);return ee?Promise.reject(ee):Promise.resolve()}function S($){const ce=Nn.values().next().value;return ce&&typeof ce.runWithContext=="function"?ce.runWithContext($):$()}function R($,ce){let ee;const[fe,Fe,Je]=oA($,ce);ee=xd(fe.reverse(),"beforeRouteLeave",$,ce);for(const A of fe)A.leaveGuards.forEach(V=>{ee.push(os(V,$,ce))});const b=E.bind(null,$,ce);return ee.push(b),Qe(ee).then(()=>{ee=[];for(const A of i.list())ee.push(os(A,$,ce));return ee.push(b),Qe(ee)}).then(()=>{ee=xd(Fe,"beforeRouteUpdate",$,ce);for(const A of Fe)A.updateGuards.forEach(V=>{ee.push(os(V,$,ce))});return ee.push(b),Qe(ee)}).then(()=>{ee=[];for(const A of Je)if(A.beforeEnter)if(Xn(A.beforeEnter))for(const V of A.beforeEnter)ee.push(os(V,$,ce));else ee.push(os(A.beforeEnter,$,ce));return ee.push(b),Qe(ee)}).then(()=>($.matched.forEach(A=>A.enterCallbacks={}),ee=xd(Je,"beforeRouteEnter",$,ce,S),ee.push(b),Qe(ee))).then(()=>{ee=[];for(const A of o.list())ee.push(os(A,$,ce));return ee.push(b),Qe(ee)}).catch(A=>Ir(A,8)?A:Promise.reject(A))}function w($,ce,ee){a.list().forEach(fe=>S(()=>fe($,ce,ee)))}function P($,ce,ee,fe,Fe){const Je=L($,ce);if(Je)return Je;const b=ce===Zr,A=qi?history.state:{};ee&&(fe||b?s.replace($.fullPath,Xe({scroll:b&&A&&A.scroll},Fe)):s.push($.fullPath,Fe)),c.value=$,Zt($,ce,ee,b),un()}let I;function ke(){I||(I=s.listen(($,ce,ee)=>{if(!en.listening)return;const fe=F($),Fe=te(fe);if(Fe){x(Xe(Fe,{replace:!0,force:!0}),fe).catch(xa);return}u=fe;const Je=c.value;qi&&RT(Pm(Je.fullPath,ee.delta),Eu()),R(fe,Je).catch(b=>Ir(b,12)?b:Ir(b,2)?(x(Xe(j(b.to),{force:!0}),fe).then(A=>{Ir(A,20)&&!ee.delta&&ee.type===Ga.pop&&s.go(-1,!1)}).catch(xa),Promise.reject()):(ee.delta&&s.go(-ee.delta,!1),De(b,fe,Je))).then(b=>{b=b||P(fe,Je,!1),b&&(ee.delta&&!Ir(b,8)?s.go(-ee.delta,!1):ee.type===Ga.pop&&Ir(b,20)&&s.go(-1,!1)),w(fe,Je,b)}).catch(xa)}))}let ct=ia(),He=ia(),Le;function De($,ce,ee){un($);const fe=He.list();return fe.length?fe.forEach(Fe=>Fe($,ce,ee)):console.error($),Promise.reject($)}function Kt(){return Le&&c.value!==Zr?Promise.resolve():new Promise(($,ce)=>{ct.add([$,ce])})}function un($){return Le||(Le=!$,ke(),ct.list().forEach(([ce,ee])=>$?ee($):ce()),ct.reset()),$}function Zt($,ce,ee,fe){const{scrollBehavior:Fe}=n;if(!qi||!Fe)return Promise.resolve();const Je=!ee&&CT(Pm($.fullPath,0))||(fe||!ee)&&history.state&&history.state.scroll||null;return ni().then(()=>Fe($,ce,Je)).then(b=>b&&xT(b)).catch(b=>De(b,$,ce))}const tt=$=>s.go($);let ot;const Nn=new Set,en={currentRoute:c,listening:!0,addRoute:_,removeRoute:k,clearRoutes:e.clearRoutes,hasRoute:C,getRoutes:T,resolve:F,options:n,push:M,replace:q,go:tt,back:()=>tt(-1),forward:()=>tt(1),beforeEach:i.add,beforeResolve:o.add,afterEach:a.add,onError:He.add,isReady:Kt,install($){const ce=this;$.component("RouterLink",eA),$.component("RouterView",sA),$.config.globalProperties.$router=ce,Object.defineProperty($.config.globalProperties,"$route",{enumerable:!0,get:()=>Yi(c)}),qi&&!ot&&c.value===Zr&&(ot=!0,M(s.location).catch(Fe=>{}));const ee={};for(const Fe in Zr)Object.defineProperty(ee,Fe,{get:()=>c.value[Fe],enumerable:!0});$.provide(Tu,ce),$.provide(rf,Z_(ee)),$.provide(lh,c);const fe=$.unmount;Nn.add($),$.unmount=function(){Nn.delete($),Nn.size<1&&(u=Zr,I&&I(),I=null,c.value=Zr,ot=!1,Le=!1),fe()}}};function Qe($){return $.reduce((ce,ee)=>ce.then(()=>S(ee)),Promise.resolve())}return en}function oA(n,e){const t=[],r=[],s=[],i=Math.max(e.matched.length,n.matched.length);for(let o=0;o<i;o++){const a=e.matched[o];a&&(n.matched.find(u=>lo(u,a))?r.push(a):t.push(a));const c=n.matched[o];c&&(e.matched.find(u=>lo(u,c))||s.push(c))}return[t,r,s]}function sf(){return Jn(Tu)}function aA(n){return Jn(rf)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */const Qy=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},lA=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=n[t++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=n[t++],o=n[t++],a=n[t++],c=((s&7)<<18|(i&63)<<12|(o&63)<<6|a&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const i=n[t++],o=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Jy={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const i=n[s],o=s+1<n.length,a=o?n[s+1]:0,c=s+2<n.length,u=c?n[s+2]:0,d=i>>2,f=(i&3)<<4|a>>4;let g=(a&15)<<2|u>>6,_=u&63;c||(_=64,o||(g=64)),r.push(t[d],t[f],t[g],t[_])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Qy(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):lA(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const i=t[n.charAt(s++)],a=s<n.length?t[n.charAt(s)]:0;++s;const u=s<n.length?t[n.charAt(s)]:64;++s;const f=s<n.length?t[n.charAt(s)]:64;if(++s,i==null||a==null||u==null||f==null)throw new cA;const g=i<<2|a>>4;if(r.push(g),u!==64){const _=a<<4&240|u>>2;if(r.push(_),f!==64){const k=u<<6&192|f;r.push(k)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class cA extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const uA=function(n){const e=Qy(n);return Jy.encodeByteArray(e,!0)},jc=function(n){return uA(n).replace(/\./g,"")},Yy=function(n){try{return Jy.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function dA(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const hA=()=>dA().__FIREBASE_DEFAULTS__,fA=()=>{if(typeof process>"u"||typeof process.env>"u")return;const n={}.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},pA=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Yy(n[1]);return e&&JSON.parse(e)},Au=()=>{try{return hA()||fA()||pA()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Xy=n=>{var e,t;return(t=(e=Au())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},mA=n=>{const e=Xy(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},Zy=()=>{var n;return(n=Au())===null||n===void 0?void 0:n.config},ev=n=>{var e;return(e=Au())===null||e===void 0?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gA{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
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
 */function _A(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,i=n.sub||n.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},n),a="";return[jc(JSON.stringify(t)),jc(JSON.stringify(o)),a].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function yA(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(zt())}function vA(){var n;const e=(n=Au())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function wA(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function bA(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function IA(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function EA(){const n=zt();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function tv(){return!vA()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function nv(){try{return typeof indexedDB=="object"}catch{return!1}}function TA(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const AA="FirebaseError";class jr extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=AA,Object.setPrototypeOf(this,jr.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,hl.prototype.create)}}class hl{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?PA(i,r):"Error",a=`${this.serviceName}: ${o} (${s}).`;return new jr(s,a,r)}}function PA(n,e){return n.replace(SA,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const SA=/\{\$([^}]+)}/g;function xA(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function bs(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const i=n[s],o=e[s];if(jm(i)&&jm(o)){if(!bs(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function jm(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xo(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function pa(n){const e={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[s,i]=r.split("=");e[decodeURIComponent(s)]=decodeURIComponent(i)}}),e}function ma(n){const e=n.indexOf("?");if(!e)return"";const t=n.indexOf("#",e);return n.substring(e,t>0?t:void 0)}function RA(n,e){const t=new CA(n,e);return t.subscribe.bind(t)}class CA{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");kA(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=Rd),s.error===void 0&&(s.error=Rd),s.complete===void 0&&(s.complete=Rd);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function kA(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function Rd(){}/**
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
 */function we(n){return n&&n._delegate?n._delegate:n}class ri{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const zs="[DEFAULT]";/**
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
 */class DA{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new gA;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(NA(e))try{this.getOrInitializeService({instanceIdentifier:zs})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=zs){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=zs){return this.instances.has(e)}getOptions(e=zs){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[i,o]of this.instancesDeferred.entries()){const a=this.normalizeInstanceIdentifier(i);r===a&&o.resolve(s)}return s}onInit(e,t){var r;const s=this.normalizeInstanceIdentifier(t),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const o=this.instances.get(s);return o&&e(o,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:VA(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=zs){return this.component?this.component.multipleInstances?e:zs:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function VA(n){return n===zs?void 0:n}function NA(n){return n.instantiationMode==="EAGER"}/**
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
 */class OA{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new DA(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var qe;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(qe||(qe={}));const MA={debug:qe.DEBUG,verbose:qe.VERBOSE,info:qe.INFO,warn:qe.WARN,error:qe.ERROR,silent:qe.SILENT},LA=qe.INFO,FA={[qe.DEBUG]:"log",[qe.VERBOSE]:"log",[qe.INFO]:"info",[qe.WARN]:"warn",[qe.ERROR]:"error"},UA=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=FA[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class of{constructor(e){this.name=e,this._logLevel=LA,this._logHandler=UA,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in qe))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?MA[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,qe.DEBUG,...e),this._logHandler(this,qe.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,qe.VERBOSE,...e),this._logHandler(this,qe.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,qe.INFO,...e),this._logHandler(this,qe.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,qe.WARN,...e),this._logHandler(this,qe.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,qe.ERROR,...e),this._logHandler(this,qe.ERROR,...e)}}const BA=(n,e)=>e.some(t=>n instanceof t);let $m,qm;function jA(){return $m||($m=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function $A(){return qm||(qm=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const rv=new WeakMap,ch=new WeakMap,sv=new WeakMap,Cd=new WeakMap,af=new WeakMap;function qA(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",i),n.removeEventListener("error",o)},i=()=>{t(gs(n.result)),s()},o=()=>{r(n.error),s()};n.addEventListener("success",i),n.addEventListener("error",o)});return e.then(t=>{t instanceof IDBCursor&&rv.set(t,n)}).catch(()=>{}),af.set(e,n),e}function zA(n){if(ch.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",i),n.removeEventListener("error",o),n.removeEventListener("abort",o)},i=()=>{t(),s()},o=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",i),n.addEventListener("error",o),n.addEventListener("abort",o)});ch.set(n,e)}let uh={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return ch.get(n);if(e==="objectStoreNames")return n.objectStoreNames||sv.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return gs(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function GA(n){uh=n(uh)}function KA(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(kd(this),e,...t);return sv.set(r,e.sort?e.sort():[e]),gs(r)}:$A().includes(n)?function(...e){return n.apply(kd(this),e),gs(rv.get(this))}:function(...e){return gs(n.apply(kd(this),e))}}function HA(n){return typeof n=="function"?KA(n):(n instanceof IDBTransaction&&zA(n),BA(n,jA())?new Proxy(n,uh):n)}function gs(n){if(n instanceof IDBRequest)return qA(n);if(Cd.has(n))return Cd.get(n);const e=HA(n);return e!==n&&(Cd.set(n,e),af.set(e,n)),e}const kd=n=>af.get(n);function WA(n,e,{blocked:t,upgrade:r,blocking:s,terminated:i}={}){const o=indexedDB.open(n,e),a=gs(o);return r&&o.addEventListener("upgradeneeded",c=>{r(gs(o.result),c.oldVersion,c.newVersion,gs(o.transaction),c)}),t&&o.addEventListener("blocked",c=>t(c.oldVersion,c.newVersion,c)),a.then(c=>{i&&c.addEventListener("close",()=>i()),s&&c.addEventListener("versionchange",u=>s(u.oldVersion,u.newVersion,u))}).catch(()=>{}),a}const QA=["get","getKey","getAll","getAllKeys","count"],JA=["put","add","delete","clear"],Dd=new Map;function zm(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(Dd.get(e))return Dd.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=JA.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||QA.includes(t)))return;const i=async function(o,...a){const c=this.transaction(o,s?"readwrite":"readonly");let u=c.store;return r&&(u=u.index(a.shift())),(await Promise.all([u[t](...a),s&&c.done]))[0]};return Dd.set(e,i),i}GA(n=>({...n,get:(e,t,r)=>zm(e,t)||n.get(e,t,r),has:(e,t)=>!!zm(e,t)||n.has(e,t)}));/**
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
 */class YA{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(XA(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function XA(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const dh="@firebase/app",Gm="0.10.13";/**
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
 */const Nr=new of("@firebase/app"),ZA="@firebase/app-compat",eP="@firebase/analytics-compat",tP="@firebase/analytics",nP="@firebase/app-check-compat",rP="@firebase/app-check",sP="@firebase/auth",iP="@firebase/auth-compat",oP="@firebase/database",aP="@firebase/data-connect",lP="@firebase/database-compat",cP="@firebase/functions",uP="@firebase/functions-compat",dP="@firebase/installations",hP="@firebase/installations-compat",fP="@firebase/messaging",pP="@firebase/messaging-compat",mP="@firebase/performance",gP="@firebase/performance-compat",_P="@firebase/remote-config",yP="@firebase/remote-config-compat",vP="@firebase/storage",wP="@firebase/storage-compat",bP="@firebase/firestore",IP="@firebase/vertexai-preview",EP="@firebase/firestore-compat",TP="firebase",AP="10.14.1";/**
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
 */const $c="[DEFAULT]",PP={[dh]:"fire-core",[ZA]:"fire-core-compat",[tP]:"fire-analytics",[eP]:"fire-analytics-compat",[rP]:"fire-app-check",[nP]:"fire-app-check-compat",[sP]:"fire-auth",[iP]:"fire-auth-compat",[oP]:"fire-rtdb",[aP]:"fire-data-connect",[lP]:"fire-rtdb-compat",[cP]:"fire-fn",[uP]:"fire-fn-compat",[dP]:"fire-iid",[hP]:"fire-iid-compat",[fP]:"fire-fcm",[pP]:"fire-fcm-compat",[mP]:"fire-perf",[gP]:"fire-perf-compat",[_P]:"fire-rc",[yP]:"fire-rc-compat",[vP]:"fire-gcs",[wP]:"fire-gcs-compat",[bP]:"fire-fst",[EP]:"fire-fst-compat",[IP]:"fire-vertex","fire-js":"fire-js",[TP]:"fire-js-all"};/**
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
 */const qc=new Map,SP=new Map,hh=new Map;function Km(n,e){try{n.container.addComponent(e)}catch(t){Nr.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function uo(n){const e=n.name;if(hh.has(e))return Nr.debug(`There were multiple attempts to register component ${e}.`),!1;hh.set(e,n);for(const t of qc.values())Km(t,n);for(const t of SP.values())Km(t,n);return!0}function fl(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function xP(n,e,t=$c){fl(n,e).clearInstance(t)}function Ot(n){return n.settings!==void 0}/**
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
 */const RP={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},_s=new hl("app","Firebase",RP);/**
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
 */class CP{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new ri("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw _s.create("app-deleted",{appName:this._name})}}/**
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
 */const Ro=AP;function iv(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:$c,automaticDataCollectionEnabled:!1},e),s=r.name;if(typeof s!="string"||!s)throw _s.create("bad-app-name",{appName:String(s)});if(t||(t=Zy()),!t)throw _s.create("no-options");const i=qc.get(s);if(i){if(bs(t,i.options)&&bs(r,i.config))return i;throw _s.create("duplicate-app",{appName:s})}const o=new OA(s);for(const c of hh.values())o.addComponent(c);const a=new CP(t,r,o);return qc.set(s,a),a}function ov(n=$c){const e=qc.get(n);if(!e&&n===$c&&Zy())return iv();if(!e)throw _s.create("no-app",{appName:n});return e}function ys(n,e,t){var r;let s=(r=PP[n])!==null&&r!==void 0?r:n;t&&(s+=`-${t}`);const i=s.match(/\s|\//),o=e.match(/\s|\//);if(i||o){const a=[`Unable to register library "${s}" with version "${e}":`];i&&a.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&o&&a.push("and"),o&&a.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Nr.warn(a.join(" "));return}uo(new ri(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const kP="firebase-heartbeat-database",DP=1,Ka="firebase-heartbeat-store";let Vd=null;function av(){return Vd||(Vd=WA(kP,DP,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Ka)}catch(t){console.warn(t)}}}}).catch(n=>{throw _s.create("idb-open",{originalErrorMessage:n.message})})),Vd}async function VP(n){try{const t=(await av()).transaction(Ka),r=await t.objectStore(Ka).get(lv(n));return await t.done,r}catch(e){if(e instanceof jr)Nr.warn(e.message);else{const t=_s.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Nr.warn(t.message)}}}async function Hm(n,e){try{const r=(await av()).transaction(Ka,"readwrite");await r.objectStore(Ka).put(e,lv(n)),await r.done}catch(t){if(t instanceof jr)Nr.warn(t.message);else{const r=_s.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Nr.warn(r.message)}}}function lv(n){return`${n.name}!${n.options.appId}`}/**
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
 */const NP=1024,OP=30*24*60*60*1e3;class MP{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new FP(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=Wm();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(o=>{const a=new Date(o.date).valueOf();return Date.now()-a<=OP}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Nr.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=Wm(),{heartbeatsToSend:r,unsentEntries:s}=LP(this._heartbeatsCache.heartbeats),i=jc(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(t){return Nr.warn(t),""}}}function Wm(){return new Date().toISOString().substring(0,10)}function LP(n,e=NP){const t=[];let r=n.slice();for(const s of n){const i=t.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),Qm(t)>e){i.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),Qm(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class FP{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return nv()?TA().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await VP(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return Hm(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return Hm(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function Qm(n){return jc(JSON.stringify({version:2,heartbeats:n})).length}/**
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
 */function UP(n){uo(new ri("platform-logger",e=>new YA(e),"PRIVATE")),uo(new ri("heartbeat",e=>new MP(e),"PRIVATE")),ys(dh,Gm,n),ys(dh,Gm,"esm2017"),ys("fire-js","")}UP("");var BP="firebase",jP="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ys(BP,jP,"app");var Jm=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Zs,cv;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(x,E){function S(){}S.prototype=E.prototype,x.D=E.prototype,x.prototype=new S,x.prototype.constructor=x,x.C=function(R,w,P){for(var I=Array(arguments.length-2),ke=2;ke<arguments.length;ke++)I[ke-2]=arguments[ke];return E.prototype[w].apply(R,I)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(x,E,S){S||(S=0);var R=Array(16);if(typeof E=="string")for(var w=0;16>w;++w)R[w]=E.charCodeAt(S++)|E.charCodeAt(S++)<<8|E.charCodeAt(S++)<<16|E.charCodeAt(S++)<<24;else for(w=0;16>w;++w)R[w]=E[S++]|E[S++]<<8|E[S++]<<16|E[S++]<<24;E=x.g[0],S=x.g[1],w=x.g[2];var P=x.g[3],I=E+(P^S&(w^P))+R[0]+3614090360&4294967295;E=S+(I<<7&4294967295|I>>>25),I=P+(w^E&(S^w))+R[1]+3905402710&4294967295,P=E+(I<<12&4294967295|I>>>20),I=w+(S^P&(E^S))+R[2]+606105819&4294967295,w=P+(I<<17&4294967295|I>>>15),I=S+(E^w&(P^E))+R[3]+3250441966&4294967295,S=w+(I<<22&4294967295|I>>>10),I=E+(P^S&(w^P))+R[4]+4118548399&4294967295,E=S+(I<<7&4294967295|I>>>25),I=P+(w^E&(S^w))+R[5]+1200080426&4294967295,P=E+(I<<12&4294967295|I>>>20),I=w+(S^P&(E^S))+R[6]+2821735955&4294967295,w=P+(I<<17&4294967295|I>>>15),I=S+(E^w&(P^E))+R[7]+4249261313&4294967295,S=w+(I<<22&4294967295|I>>>10),I=E+(P^S&(w^P))+R[8]+1770035416&4294967295,E=S+(I<<7&4294967295|I>>>25),I=P+(w^E&(S^w))+R[9]+2336552879&4294967295,P=E+(I<<12&4294967295|I>>>20),I=w+(S^P&(E^S))+R[10]+4294925233&4294967295,w=P+(I<<17&4294967295|I>>>15),I=S+(E^w&(P^E))+R[11]+2304563134&4294967295,S=w+(I<<22&4294967295|I>>>10),I=E+(P^S&(w^P))+R[12]+1804603682&4294967295,E=S+(I<<7&4294967295|I>>>25),I=P+(w^E&(S^w))+R[13]+4254626195&4294967295,P=E+(I<<12&4294967295|I>>>20),I=w+(S^P&(E^S))+R[14]+2792965006&4294967295,w=P+(I<<17&4294967295|I>>>15),I=S+(E^w&(P^E))+R[15]+1236535329&4294967295,S=w+(I<<22&4294967295|I>>>10),I=E+(w^P&(S^w))+R[1]+4129170786&4294967295,E=S+(I<<5&4294967295|I>>>27),I=P+(S^w&(E^S))+R[6]+3225465664&4294967295,P=E+(I<<9&4294967295|I>>>23),I=w+(E^S&(P^E))+R[11]+643717713&4294967295,w=P+(I<<14&4294967295|I>>>18),I=S+(P^E&(w^P))+R[0]+3921069994&4294967295,S=w+(I<<20&4294967295|I>>>12),I=E+(w^P&(S^w))+R[5]+3593408605&4294967295,E=S+(I<<5&4294967295|I>>>27),I=P+(S^w&(E^S))+R[10]+38016083&4294967295,P=E+(I<<9&4294967295|I>>>23),I=w+(E^S&(P^E))+R[15]+3634488961&4294967295,w=P+(I<<14&4294967295|I>>>18),I=S+(P^E&(w^P))+R[4]+3889429448&4294967295,S=w+(I<<20&4294967295|I>>>12),I=E+(w^P&(S^w))+R[9]+568446438&4294967295,E=S+(I<<5&4294967295|I>>>27),I=P+(S^w&(E^S))+R[14]+3275163606&4294967295,P=E+(I<<9&4294967295|I>>>23),I=w+(E^S&(P^E))+R[3]+4107603335&4294967295,w=P+(I<<14&4294967295|I>>>18),I=S+(P^E&(w^P))+R[8]+1163531501&4294967295,S=w+(I<<20&4294967295|I>>>12),I=E+(w^P&(S^w))+R[13]+2850285829&4294967295,E=S+(I<<5&4294967295|I>>>27),I=P+(S^w&(E^S))+R[2]+4243563512&4294967295,P=E+(I<<9&4294967295|I>>>23),I=w+(E^S&(P^E))+R[7]+1735328473&4294967295,w=P+(I<<14&4294967295|I>>>18),I=S+(P^E&(w^P))+R[12]+2368359562&4294967295,S=w+(I<<20&4294967295|I>>>12),I=E+(S^w^P)+R[5]+4294588738&4294967295,E=S+(I<<4&4294967295|I>>>28),I=P+(E^S^w)+R[8]+2272392833&4294967295,P=E+(I<<11&4294967295|I>>>21),I=w+(P^E^S)+R[11]+1839030562&4294967295,w=P+(I<<16&4294967295|I>>>16),I=S+(w^P^E)+R[14]+4259657740&4294967295,S=w+(I<<23&4294967295|I>>>9),I=E+(S^w^P)+R[1]+2763975236&4294967295,E=S+(I<<4&4294967295|I>>>28),I=P+(E^S^w)+R[4]+1272893353&4294967295,P=E+(I<<11&4294967295|I>>>21),I=w+(P^E^S)+R[7]+4139469664&4294967295,w=P+(I<<16&4294967295|I>>>16),I=S+(w^P^E)+R[10]+3200236656&4294967295,S=w+(I<<23&4294967295|I>>>9),I=E+(S^w^P)+R[13]+681279174&4294967295,E=S+(I<<4&4294967295|I>>>28),I=P+(E^S^w)+R[0]+3936430074&4294967295,P=E+(I<<11&4294967295|I>>>21),I=w+(P^E^S)+R[3]+3572445317&4294967295,w=P+(I<<16&4294967295|I>>>16),I=S+(w^P^E)+R[6]+76029189&4294967295,S=w+(I<<23&4294967295|I>>>9),I=E+(S^w^P)+R[9]+3654602809&4294967295,E=S+(I<<4&4294967295|I>>>28),I=P+(E^S^w)+R[12]+3873151461&4294967295,P=E+(I<<11&4294967295|I>>>21),I=w+(P^E^S)+R[15]+530742520&4294967295,w=P+(I<<16&4294967295|I>>>16),I=S+(w^P^E)+R[2]+3299628645&4294967295,S=w+(I<<23&4294967295|I>>>9),I=E+(w^(S|~P))+R[0]+4096336452&4294967295,E=S+(I<<6&4294967295|I>>>26),I=P+(S^(E|~w))+R[7]+1126891415&4294967295,P=E+(I<<10&4294967295|I>>>22),I=w+(E^(P|~S))+R[14]+2878612391&4294967295,w=P+(I<<15&4294967295|I>>>17),I=S+(P^(w|~E))+R[5]+4237533241&4294967295,S=w+(I<<21&4294967295|I>>>11),I=E+(w^(S|~P))+R[12]+1700485571&4294967295,E=S+(I<<6&4294967295|I>>>26),I=P+(S^(E|~w))+R[3]+2399980690&4294967295,P=E+(I<<10&4294967295|I>>>22),I=w+(E^(P|~S))+R[10]+4293915773&4294967295,w=P+(I<<15&4294967295|I>>>17),I=S+(P^(w|~E))+R[1]+2240044497&4294967295,S=w+(I<<21&4294967295|I>>>11),I=E+(w^(S|~P))+R[8]+1873313359&4294967295,E=S+(I<<6&4294967295|I>>>26),I=P+(S^(E|~w))+R[15]+4264355552&4294967295,P=E+(I<<10&4294967295|I>>>22),I=w+(E^(P|~S))+R[6]+2734768916&4294967295,w=P+(I<<15&4294967295|I>>>17),I=S+(P^(w|~E))+R[13]+1309151649&4294967295,S=w+(I<<21&4294967295|I>>>11),I=E+(w^(S|~P))+R[4]+4149444226&4294967295,E=S+(I<<6&4294967295|I>>>26),I=P+(S^(E|~w))+R[11]+3174756917&4294967295,P=E+(I<<10&4294967295|I>>>22),I=w+(E^(P|~S))+R[2]+718787259&4294967295,w=P+(I<<15&4294967295|I>>>17),I=S+(P^(w|~E))+R[9]+3951481745&4294967295,x.g[0]=x.g[0]+E&4294967295,x.g[1]=x.g[1]+(w+(I<<21&4294967295|I>>>11))&4294967295,x.g[2]=x.g[2]+w&4294967295,x.g[3]=x.g[3]+P&4294967295}r.prototype.u=function(x,E){E===void 0&&(E=x.length);for(var S=E-this.blockSize,R=this.B,w=this.h,P=0;P<E;){if(w==0)for(;P<=S;)s(this,x,P),P+=this.blockSize;if(typeof x=="string"){for(;P<E;)if(R[w++]=x.charCodeAt(P++),w==this.blockSize){s(this,R),w=0;break}}else for(;P<E;)if(R[w++]=x[P++],w==this.blockSize){s(this,R),w=0;break}}this.h=w,this.o+=E},r.prototype.v=function(){var x=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);x[0]=128;for(var E=1;E<x.length-8;++E)x[E]=0;var S=8*this.o;for(E=x.length-8;E<x.length;++E)x[E]=S&255,S/=256;for(this.u(x),x=Array(16),E=S=0;4>E;++E)for(var R=0;32>R;R+=8)x[S++]=this.g[E]>>>R&255;return x};function i(x,E){var S=a;return Object.prototype.hasOwnProperty.call(S,x)?S[x]:S[x]=E(x)}function o(x,E){this.h=E;for(var S=[],R=!0,w=x.length-1;0<=w;w--){var P=x[w]|0;R&&P==E||(S[w]=P,R=!1)}this.g=S}var a={};function c(x){return-128<=x&&128>x?i(x,function(E){return new o([E|0],0>E?-1:0)}):new o([x|0],0>x?-1:0)}function u(x){if(isNaN(x)||!isFinite(x))return f;if(0>x)return C(u(-x));for(var E=[],S=1,R=0;x>=S;R++)E[R]=x/S|0,S*=4294967296;return new o(E,0)}function d(x,E){if(x.length==0)throw Error("number format error: empty string");if(E=E||10,2>E||36<E)throw Error("radix out of range: "+E);if(x.charAt(0)=="-")return C(d(x.substring(1),E));if(0<=x.indexOf("-"))throw Error('number format error: interior "-" character');for(var S=u(Math.pow(E,8)),R=f,w=0;w<x.length;w+=8){var P=Math.min(8,x.length-w),I=parseInt(x.substring(w,w+P),E);8>P?(P=u(Math.pow(E,P)),R=R.j(P).add(u(I))):(R=R.j(S),R=R.add(u(I)))}return R}var f=c(0),g=c(1),_=c(16777216);n=o.prototype,n.m=function(){if(T(this))return-C(this).m();for(var x=0,E=1,S=0;S<this.g.length;S++){var R=this.i(S);x+=(0<=R?R:4294967296+R)*E,E*=4294967296}return x},n.toString=function(x){if(x=x||10,2>x||36<x)throw Error("radix out of range: "+x);if(k(this))return"0";if(T(this))return"-"+C(this).toString(x);for(var E=u(Math.pow(x,6)),S=this,R="";;){var w=M(S,E).g;S=F(S,w.j(E));var P=((0<S.g.length?S.g[0]:S.h)>>>0).toString(x);if(S=w,k(S))return P+R;for(;6>P.length;)P="0"+P;R=P+R}},n.i=function(x){return 0>x?0:x<this.g.length?this.g[x]:this.h};function k(x){if(x.h!=0)return!1;for(var E=0;E<x.g.length;E++)if(x.g[E]!=0)return!1;return!0}function T(x){return x.h==-1}n.l=function(x){return x=F(this,x),T(x)?-1:k(x)?0:1};function C(x){for(var E=x.g.length,S=[],R=0;R<E;R++)S[R]=~x.g[R];return new o(S,~x.h).add(g)}n.abs=function(){return T(this)?C(this):this},n.add=function(x){for(var E=Math.max(this.g.length,x.g.length),S=[],R=0,w=0;w<=E;w++){var P=R+(this.i(w)&65535)+(x.i(w)&65535),I=(P>>>16)+(this.i(w)>>>16)+(x.i(w)>>>16);R=I>>>16,P&=65535,I&=65535,S[w]=I<<16|P}return new o(S,S[S.length-1]&-2147483648?-1:0)};function F(x,E){return x.add(C(E))}n.j=function(x){if(k(this)||k(x))return f;if(T(this))return T(x)?C(this).j(C(x)):C(C(this).j(x));if(T(x))return C(this.j(C(x)));if(0>this.l(_)&&0>x.l(_))return u(this.m()*x.m());for(var E=this.g.length+x.g.length,S=[],R=0;R<2*E;R++)S[R]=0;for(R=0;R<this.g.length;R++)for(var w=0;w<x.g.length;w++){var P=this.i(R)>>>16,I=this.i(R)&65535,ke=x.i(w)>>>16,ct=x.i(w)&65535;S[2*R+2*w]+=I*ct,j(S,2*R+2*w),S[2*R+2*w+1]+=P*ct,j(S,2*R+2*w+1),S[2*R+2*w+1]+=I*ke,j(S,2*R+2*w+1),S[2*R+2*w+2]+=P*ke,j(S,2*R+2*w+2)}for(R=0;R<E;R++)S[R]=S[2*R+1]<<16|S[2*R];for(R=E;R<2*E;R++)S[R]=0;return new o(S,0)};function j(x,E){for(;(x[E]&65535)!=x[E];)x[E+1]+=x[E]>>>16,x[E]&=65535,E++}function L(x,E){this.g=x,this.h=E}function M(x,E){if(k(E))throw Error("division by zero");if(k(x))return new L(f,f);if(T(x))return E=M(C(x),E),new L(C(E.g),C(E.h));if(T(E))return E=M(x,C(E)),new L(C(E.g),E.h);if(30<x.g.length){if(T(x)||T(E))throw Error("slowDivide_ only works with positive integers.");for(var S=g,R=E;0>=R.l(x);)S=q(S),R=q(R);var w=te(S,1),P=te(R,1);for(R=te(R,2),S=te(S,2);!k(R);){var I=P.add(R);0>=I.l(x)&&(w=w.add(S),P=I),R=te(R,1),S=te(S,1)}return E=F(x,w.j(E)),new L(w,E)}for(w=f;0<=x.l(E);){for(S=Math.max(1,Math.floor(x.m()/E.m())),R=Math.ceil(Math.log(S)/Math.LN2),R=48>=R?1:Math.pow(2,R-48),P=u(S),I=P.j(E);T(I)||0<I.l(x);)S-=R,P=u(S),I=P.j(E);k(P)&&(P=g),w=w.add(P),x=F(x,I)}return new L(w,x)}n.A=function(x){return M(this,x).h},n.and=function(x){for(var E=Math.max(this.g.length,x.g.length),S=[],R=0;R<E;R++)S[R]=this.i(R)&x.i(R);return new o(S,this.h&x.h)},n.or=function(x){for(var E=Math.max(this.g.length,x.g.length),S=[],R=0;R<E;R++)S[R]=this.i(R)|x.i(R);return new o(S,this.h|x.h)},n.xor=function(x){for(var E=Math.max(this.g.length,x.g.length),S=[],R=0;R<E;R++)S[R]=this.i(R)^x.i(R);return new o(S,this.h^x.h)};function q(x){for(var E=x.g.length+1,S=[],R=0;R<E;R++)S[R]=x.i(R)<<1|x.i(R-1)>>>31;return new o(S,x.h)}function te(x,E){var S=E>>5;E%=32;for(var R=x.g.length-S,w=[],P=0;P<R;P++)w[P]=0<E?x.i(P+S)>>>E|x.i(P+S+1)<<32-E:x.i(P+S);return new o(w,x.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,cv=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.A,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=u,o.fromString=d,Zs=o}).apply(typeof Jm<"u"?Jm:typeof self<"u"?self:typeof window<"u"?window:{});var oc=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var uv,ga,dv,wc,fh,hv,fv,pv;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(l,h,p){return l==Array.prototype||l==Object.prototype||(l[h]=p.value),l};function t(l){l=[typeof globalThis=="object"&&globalThis,l,typeof window=="object"&&window,typeof self=="object"&&self,typeof oc=="object"&&oc];for(var h=0;h<l.length;++h){var p=l[h];if(p&&p.Math==Math)return p}throw Error("Cannot find global object")}var r=t(this);function s(l,h){if(h)e:{var p=r;l=l.split(".");for(var y=0;y<l.length-1;y++){var N=l[y];if(!(N in p))break e;p=p[N]}l=l[l.length-1],y=p[l],h=h(y),h!=y&&h!=null&&e(p,l,{configurable:!0,writable:!0,value:h})}}function i(l,h){l instanceof String&&(l+="");var p=0,y=!1,N={next:function(){if(!y&&p<l.length){var B=p++;return{value:h(B,l[B]),done:!1}}return y=!0,{done:!0,value:void 0}}};return N[Symbol.iterator]=function(){return N},N}s("Array.prototype.values",function(l){return l||function(){return i(this,function(h,p){return p})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var o=o||{},a=this||self;function c(l){var h=typeof l;return h=h!="object"?h:l?Array.isArray(l)?"array":h:"null",h=="array"||h=="object"&&typeof l.length=="number"}function u(l){var h=typeof l;return h=="object"&&l!=null||h=="function"}function d(l,h,p){return l.call.apply(l.bind,arguments)}function f(l,h,p){if(!l)throw Error();if(2<arguments.length){var y=Array.prototype.slice.call(arguments,2);return function(){var N=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(N,y),l.apply(h,N)}}return function(){return l.apply(h,arguments)}}function g(l,h,p){return g=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?d:f,g.apply(null,arguments)}function _(l,h){var p=Array.prototype.slice.call(arguments,1);return function(){var y=p.slice();return y.push.apply(y,arguments),l.apply(this,y)}}function k(l,h){function p(){}p.prototype=h.prototype,l.aa=h.prototype,l.prototype=new p,l.prototype.constructor=l,l.Qb=function(y,N,B){for(var le=Array(arguments.length-2),ut=2;ut<arguments.length;ut++)le[ut-2]=arguments[ut];return h.prototype[N].apply(y,le)}}function T(l){const h=l.length;if(0<h){const p=Array(h);for(let y=0;y<h;y++)p[y]=l[y];return p}return[]}function C(l,h){for(let p=1;p<arguments.length;p++){const y=arguments[p];if(c(y)){const N=l.length||0,B=y.length||0;l.length=N+B;for(let le=0;le<B;le++)l[N+le]=y[le]}else l.push(y)}}class F{constructor(h,p){this.i=h,this.j=p,this.h=0,this.g=null}get(){let h;return 0<this.h?(this.h--,h=this.g,this.g=h.next,h.next=null):h=this.i(),h}}function j(l){return/^[\s\xa0]*$/.test(l)}function L(){var l=a.navigator;return l&&(l=l.userAgent)?l:""}function M(l){return M[" "](l),l}M[" "]=function(){};var q=L().indexOf("Gecko")!=-1&&!(L().toLowerCase().indexOf("webkit")!=-1&&L().indexOf("Edge")==-1)&&!(L().indexOf("Trident")!=-1||L().indexOf("MSIE")!=-1)&&L().indexOf("Edge")==-1;function te(l,h,p){for(const y in l)h.call(p,l[y],y,l)}function x(l,h){for(const p in l)h.call(void 0,l[p],p,l)}function E(l){const h={};for(const p in l)h[p]=l[p];return h}const S="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function R(l,h){let p,y;for(let N=1;N<arguments.length;N++){y=arguments[N];for(p in y)l[p]=y[p];for(let B=0;B<S.length;B++)p=S[B],Object.prototype.hasOwnProperty.call(y,p)&&(l[p]=y[p])}}function w(l){var h=1;l=l.split(":");const p=[];for(;0<h&&l.length;)p.push(l.shift()),h--;return l.length&&p.push(l.join(":")),p}function P(l){a.setTimeout(()=>{throw l},0)}function I(){var l=Kt;let h=null;return l.g&&(h=l.g,l.g=l.g.next,l.g||(l.h=null),h.next=null),h}class ke{constructor(){this.h=this.g=null}add(h,p){const y=ct.get();y.set(h,p),this.h?this.h.next=y:this.g=y,this.h=y}}var ct=new F(()=>new He,l=>l.reset());class He{constructor(){this.next=this.g=this.h=null}set(h,p){this.h=h,this.g=p,this.next=null}reset(){this.next=this.g=this.h=null}}let Le,De=!1,Kt=new ke,un=()=>{const l=a.Promise.resolve(void 0);Le=()=>{l.then(Zt)}};var Zt=()=>{for(var l;l=I();){try{l.h.call(l.g)}catch(p){P(p)}var h=ct;h.j(l),100>h.h&&(h.h++,l.next=h.g,h.g=l)}De=!1};function tt(){this.s=this.s,this.C=this.C}tt.prototype.s=!1,tt.prototype.ma=function(){this.s||(this.s=!0,this.N())},tt.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function ot(l,h){this.type=l,this.g=this.target=h,this.defaultPrevented=!1}ot.prototype.h=function(){this.defaultPrevented=!0};var Nn=function(){if(!a.addEventListener||!Object.defineProperty)return!1;var l=!1,h=Object.defineProperty({},"passive",{get:function(){l=!0}});try{const p=()=>{};a.addEventListener("test",p,h),a.removeEventListener("test",p,h)}catch{}return l}();function en(l,h){if(ot.call(this,l?l.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,l){var p=this.type=l.type,y=l.changedTouches&&l.changedTouches.length?l.changedTouches[0]:null;if(this.target=l.target||l.srcElement,this.g=h,h=l.relatedTarget){if(q){e:{try{M(h.nodeName);var N=!0;break e}catch{}N=!1}N||(h=null)}}else p=="mouseover"?h=l.fromElement:p=="mouseout"&&(h=l.toElement);this.relatedTarget=h,y?(this.clientX=y.clientX!==void 0?y.clientX:y.pageX,this.clientY=y.clientY!==void 0?y.clientY:y.pageY,this.screenX=y.screenX||0,this.screenY=y.screenY||0):(this.clientX=l.clientX!==void 0?l.clientX:l.pageX,this.clientY=l.clientY!==void 0?l.clientY:l.pageY,this.screenX=l.screenX||0,this.screenY=l.screenY||0),this.button=l.button,this.key=l.key||"",this.ctrlKey=l.ctrlKey,this.altKey=l.altKey,this.shiftKey=l.shiftKey,this.metaKey=l.metaKey,this.pointerId=l.pointerId||0,this.pointerType=typeof l.pointerType=="string"?l.pointerType:Qe[l.pointerType]||"",this.state=l.state,this.i=l,l.defaultPrevented&&en.aa.h.call(this)}}k(en,ot);var Qe={2:"touch",3:"pen",4:"mouse"};en.prototype.h=function(){en.aa.h.call(this);var l=this.i;l.preventDefault?l.preventDefault():l.returnValue=!1};var $="closure_listenable_"+(1e6*Math.random()|0),ce=0;function ee(l,h,p,y,N){this.listener=l,this.proxy=null,this.src=h,this.type=p,this.capture=!!y,this.ha=N,this.key=++ce,this.da=this.fa=!1}function fe(l){l.da=!0,l.listener=null,l.proxy=null,l.src=null,l.ha=null}function Fe(l){this.src=l,this.g={},this.h=0}Fe.prototype.add=function(l,h,p,y,N){var B=l.toString();l=this.g[B],l||(l=this.g[B]=[],this.h++);var le=b(l,h,y,N);return-1<le?(h=l[le],p||(h.fa=!1)):(h=new ee(h,this.src,B,!!y,N),h.fa=p,l.push(h)),h};function Je(l,h){var p=h.type;if(p in l.g){var y=l.g[p],N=Array.prototype.indexOf.call(y,h,void 0),B;(B=0<=N)&&Array.prototype.splice.call(y,N,1),B&&(fe(h),l.g[p].length==0&&(delete l.g[p],l.h--))}}function b(l,h,p,y){for(var N=0;N<l.length;++N){var B=l[N];if(!B.da&&B.listener==h&&B.capture==!!p&&B.ha==y)return N}return-1}var A="closure_lm_"+(1e6*Math.random()|0),V={};function G(l,h,p,y,N){if(y&&y.once)return ue(l,h,p,y,N);if(Array.isArray(h)){for(var B=0;B<h.length;B++)G(l,h[B],p,y,N);return null}return p=Ie(p),l&&l[$]?l.K(h,p,u(y)?!!y.capture:!!y,N):z(l,h,p,!1,y,N)}function z(l,h,p,y,N,B){if(!h)throw Error("Invalid event type");var le=u(N)?!!N.capture:!!N,ut=oe(l);if(ut||(l[A]=ut=new Fe(l)),p=ut.add(h,p,y,le,B),p.proxy)return p;if(y=Z(),p.proxy=y,y.src=l,y.listener=p,l.addEventListener)Nn||(N=le),N===void 0&&(N=!1),l.addEventListener(h.toString(),y,N);else if(l.attachEvent)l.attachEvent(X(h.toString()),y);else if(l.addListener&&l.removeListener)l.addListener(y);else throw Error("addEventListener and attachEvent are unavailable.");return p}function Z(){function l(p){return h.call(l.src,l.listener,p)}const h=ye;return l}function ue(l,h,p,y,N){if(Array.isArray(h)){for(var B=0;B<h.length;B++)ue(l,h[B],p,y,N);return null}return p=Ie(p),l&&l[$]?l.L(h,p,u(y)?!!y.capture:!!y,N):z(l,h,p,!0,y,N)}function se(l,h,p,y,N){if(Array.isArray(h))for(var B=0;B<h.length;B++)se(l,h[B],p,y,N);else y=u(y)?!!y.capture:!!y,p=Ie(p),l&&l[$]?(l=l.i,h=String(h).toString(),h in l.g&&(B=l.g[h],p=b(B,p,y,N),-1<p&&(fe(B[p]),Array.prototype.splice.call(B,p,1),B.length==0&&(delete l.g[h],l.h--)))):l&&(l=oe(l))&&(h=l.g[h.toString()],l=-1,h&&(l=b(h,p,y,N)),(p=-1<l?h[l]:null)&&ne(p))}function ne(l){if(typeof l!="number"&&l&&!l.da){var h=l.src;if(h&&h[$])Je(h.i,l);else{var p=l.type,y=l.proxy;h.removeEventListener?h.removeEventListener(p,y,l.capture):h.detachEvent?h.detachEvent(X(p),y):h.addListener&&h.removeListener&&h.removeListener(y),(p=oe(h))?(Je(p,l),p.h==0&&(p.src=null,h[A]=null)):fe(l)}}}function X(l){return l in V?V[l]:V[l]="on"+l}function ye(l,h){if(l.da)l=!0;else{h=new en(h,this);var p=l.listener,y=l.ha||l.src;l.fa&&ne(l),l=p.call(y,h)}return l}function oe(l){return l=l[A],l instanceof Fe?l:null}var me="__closure_events_fn_"+(1e9*Math.random()>>>0);function Ie(l){return typeof l=="function"?l:(l[me]||(l[me]=function(h){return l.handleEvent(h)}),l[me])}function be(){tt.call(this),this.i=new Fe(this),this.M=this,this.F=null}k(be,tt),be.prototype[$]=!0,be.prototype.removeEventListener=function(l,h,p,y){se(this,l,h,p,y)};function Re(l,h){var p,y=l.F;if(y)for(p=[];y;y=y.F)p.push(y);if(l=l.M,y=h.type||h,typeof h=="string")h=new ot(h,l);else if(h instanceof ot)h.target=h.target||l;else{var N=h;h=new ot(y,l),R(h,N)}if(N=!0,p)for(var B=p.length-1;0<=B;B--){var le=h.g=p[B];N=je(le,y,!0,h)&&N}if(le=h.g=l,N=je(le,y,!0,h)&&N,N=je(le,y,!1,h)&&N,p)for(B=0;B<p.length;B++)le=h.g=p[B],N=je(le,y,!1,h)&&N}be.prototype.N=function(){if(be.aa.N.call(this),this.i){var l=this.i,h;for(h in l.g){for(var p=l.g[h],y=0;y<p.length;y++)fe(p[y]);delete l.g[h],l.h--}}this.F=null},be.prototype.K=function(l,h,p,y){return this.i.add(String(l),h,!1,p,y)},be.prototype.L=function(l,h,p,y){return this.i.add(String(l),h,!0,p,y)};function je(l,h,p,y){if(h=l.i.g[String(h)],!h)return!0;h=h.concat();for(var N=!0,B=0;B<h.length;++B){var le=h[B];if(le&&!le.da&&le.capture==p){var ut=le.listener,rn=le.ha||le.src;le.fa&&Je(l.i,le),N=ut.call(rn,y)!==!1&&N}}return N&&!y.defaultPrevented}function $t(l,h,p){if(typeof l=="function")p&&(l=g(l,p));else if(l&&typeof l.handleEvent=="function")l=g(l.handleEvent,l);else throw Error("Invalid listener argument");return 2147483647<Number(h)?-1:a.setTimeout(l,h||0)}function Dt(l){l.g=$t(()=>{l.g=null,l.i&&(l.i=!1,Dt(l))},l.l);const h=l.h;l.h=null,l.m.apply(null,h)}class Oe extends tt{constructor(h,p){super(),this.m=h,this.l=p,this.h=null,this.i=!1,this.g=null}j(h){this.h=arguments,this.g?this.i=!0:Dt(this)}N(){super.N(),this.g&&(a.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Ve(l){tt.call(this),this.h=l,this.g={}}k(Ve,tt);var at=[];function nt(l){te(l.g,function(h,p){this.g.hasOwnProperty(p)&&ne(h)},l),l.g={}}Ve.prototype.N=function(){Ve.aa.N.call(this),nt(this)},Ve.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var qt=a.JSON.stringify,wn=a.JSON.parse,Ii=class{stringify(l){return a.JSON.stringify(l,void 0)}parse(l){return a.JSON.parse(l,void 0)}};function Ms(){}Ms.prototype.h=null;function Pn(l){return l.h||(l.h=l.i())}function $o(){}var Ls={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function Ei(){ot.call(this,"d")}k(Ei,ot);function qo(){ot.call(this,"c")}k(qo,ot);var mr={},gr=null;function Wr(){return gr=gr||new be}mr.La="serverreachability";function Fs(l){ot.call(this,mr.La,l)}k(Fs,ot);function Qr(l){const h=Wr();Re(h,new Fs(h))}mr.STAT_EVENT="statevent";function Ml(l,h){ot.call(this,mr.STAT_EVENT,l),this.stat=h}k(Ml,ot);function tn(l){const h=Wr();Re(h,new Ml(h,l))}mr.Ma="timingevent";function zo(l,h){ot.call(this,mr.Ma,l),this.size=h}k(zo,ot);function Jr(l,h){if(typeof l!="function")throw Error("Fn must not be null and must be a function");return a.setTimeout(function(){l()},h)}function Zn(){this.g=!0}Zn.prototype.xa=function(){this.g=!1};function Ti(l,h,p,y,N,B){l.info(function(){if(l.g)if(B)for(var le="",ut=B.split("&"),rn=0;rn<ut.length;rn++){var We=ut[rn].split("=");if(1<We.length){var dn=We[0];We=We[1];var hn=dn.split("_");le=2<=hn.length&&hn[1]=="type"?le+(dn+"="+We+"&"):le+(dn+"=redacted&")}}else le=null;else le=B;return"XMLHTTP REQ ("+y+") [attempt "+N+"]: "+h+`
`+p+`
`+le})}function Ai(l,h,p,y,N,B,le){l.info(function(){return"XMLHTTP RESP ("+y+") [ attempt "+N+"]: "+h+`
`+p+`
`+B+" "+le})}function Yr(l,h,p,y){l.info(function(){return"XMLHTTP TEXT ("+h+"): "+od(l,p)+(y?" "+y:"")})}function id(l,h){l.info(function(){return"TIMEOUT: "+h})}Zn.prototype.info=function(){};function od(l,h){if(!l.g)return h;if(!h)return null;try{var p=JSON.parse(h);if(p){for(l=0;l<p.length;l++)if(Array.isArray(p[l])){var y=p[l];if(!(2>y.length)){var N=y[1];if(Array.isArray(N)&&!(1>N.length)){var B=N[0];if(B!="noop"&&B!="stop"&&B!="close")for(var le=1;le<N.length;le++)N[le]=""}}}}return qt(p)}catch{return h}}var Pi={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Ll={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Go;function _r(){}k(_r,Ms),_r.prototype.g=function(){return new XMLHttpRequest},_r.prototype.i=function(){return{}},Go=new _r;function er(l,h,p,y){this.j=l,this.i=h,this.l=p,this.R=y||1,this.U=new Ve(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Fl}function Fl(){this.i=null,this.g="",this.h=!1}var Ul={},Ko={};function Si(l,h,p){l.L=1,l.v=Te(Gn(h)),l.m=p,l.P=!0,Bl(l,null)}function Bl(l,h){l.F=Date.now(),xi(l),l.A=Gn(l.v);var p=l.A,y=l.R;Array.isArray(y)||(y=[String(y)]),Wl(p.i,"t",y),l.C=0,p=l.j.J,l.h=new Fl,l.g=zp(l.j,p?h:null,!l.m),0<l.O&&(l.M=new Oe(g(l.Y,l,l.g),l.O)),h=l.U,p=l.g,y=l.ca;var N="readystatechange";Array.isArray(N)||(N&&(at[0]=N.toString()),N=at);for(var B=0;B<N.length;B++){var le=G(p,N[B],y||h.handleEvent,!1,h.h||h);if(!le)break;h.g[le.key]=le}h=l.H?E(l.H):{},l.m?(l.u||(l.u="POST"),h["Content-Type"]="application/x-www-form-urlencoded",l.g.ea(l.A,l.u,l.m,h)):(l.u="GET",l.g.ea(l.A,l.u,null,h)),Qr(),Ti(l.i,l.u,l.A,l.l,l.R,l.m)}er.prototype.ca=function(l){l=l.target;const h=this.M;h&&wr(l)==3?h.j():this.Y(l)},er.prototype.Y=function(l){try{if(l==this.g)e:{const hn=wr(this.g);var h=this.g.Ba();const Oi=this.g.Z();if(!(3>hn)&&(hn!=3||this.g&&(this.h.h||this.g.oa()||Vp(this.g)))){this.J||hn!=4||h==7||(h==8||0>=Oi?Qr(3):Qr(2)),Wo(this);var p=this.g.Z();this.X=p;t:if(Ho(this)){var y=Vp(this.g);l="";var N=y.length,B=wr(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){yr(this),Sn(this);var le="";break t}this.h.i=new a.TextDecoder}for(h=0;h<N;h++)this.h.h=!0,l+=this.h.i.decode(y[h],{stream:!(B&&h==N-1)});y.length=0,this.h.g+=l,this.C=0,le=this.h.g}else le=this.g.oa();if(this.o=p==200,Ai(this.i,this.u,this.A,this.l,this.R,hn,p),this.o){if(this.T&&!this.K){t:{if(this.g){var ut,rn=this.g;if((ut=rn.g?rn.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!j(ut)){var We=ut;break t}}We=null}if(p=We)Yr(this.i,this.l,p,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Qo(this,p);else{this.o=!1,this.s=3,tn(12),yr(this),Sn(this);break e}}if(this.P){p=!0;let Kn;for(;!this.J&&this.C<le.length;)if(Kn=ad(this,le),Kn==Ko){hn==4&&(this.s=4,tn(14),p=!1),Yr(this.i,this.l,null,"[Incomplete Response]");break}else if(Kn==Ul){this.s=4,tn(15),Yr(this.i,this.l,le,"[Invalid Chunk]"),p=!1;break}else Yr(this.i,this.l,Kn,null),Qo(this,Kn);if(Ho(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),hn!=4||le.length!=0||this.h.h||(this.s=1,tn(16),p=!1),this.o=this.o&&p,!p)Yr(this.i,this.l,le,"[Invalid Chunked Response]"),yr(this),Sn(this);else if(0<le.length&&!this.W){this.W=!0;var dn=this.j;dn.g==this&&dn.ba&&!dn.M&&(dn.j.info("Great, no buffering proxy detected. Bytes received: "+le.length),fd(dn),dn.M=!0,tn(11))}}else Yr(this.i,this.l,le,null),Qo(this,le);hn==4&&yr(this),this.o&&!this.J&&(hn==4?Bp(this.j,this):(this.o=!1,xi(this)))}else Nb(this.g),p==400&&0<le.indexOf("Unknown SID")?(this.s=3,tn(12)):(this.s=0,tn(13)),yr(this),Sn(this)}}}catch{}finally{}};function Ho(l){return l.g?l.u=="GET"&&l.L!=2&&l.j.Ca:!1}function ad(l,h){var p=l.C,y=h.indexOf(`
`,p);return y==-1?Ko:(p=Number(h.substring(p,y)),isNaN(p)?Ul:(y+=1,y+p>h.length?Ko:(h=h.slice(y,y+p),l.C=y+p,h)))}er.prototype.cancel=function(){this.J=!0,yr(this)};function xi(l){l.S=Date.now()+l.I,jl(l,l.I)}function jl(l,h){if(l.B!=null)throw Error("WatchDog timer not null");l.B=Jr(g(l.ba,l),h)}function Wo(l){l.B&&(a.clearTimeout(l.B),l.B=null)}er.prototype.ba=function(){this.B=null;const l=Date.now();0<=l-this.S?(id(this.i,this.A),this.L!=2&&(Qr(),tn(17)),yr(this),this.s=2,Sn(this)):jl(this,this.S-l)};function Sn(l){l.j.G==0||l.J||Bp(l.j,l)}function yr(l){Wo(l);var h=l.M;h&&typeof h.ma=="function"&&h.ma(),l.M=null,nt(l.U),l.g&&(h=l.g,l.g=null,h.abort(),h.ma())}function Qo(l,h){try{var p=l.j;if(p.G!=0&&(p.g==l||Yo(p.h,l))){if(!l.K&&Yo(p.h,l)&&p.G==3){try{var y=p.Da.g.parse(h)}catch{y=null}if(Array.isArray(y)&&y.length==3){var N=y;if(N[0]==0){e:if(!p.u){if(p.g)if(p.g.F+3e3<l.F)ec(p),Xl(p);else break e;hd(p),tn(18)}}else p.za=N[1],0<p.za-p.T&&37500>N[2]&&p.F&&p.v==0&&!p.C&&(p.C=Jr(g(p.Za,p),6e3));if(1>=Jo(p.h)&&p.ca){try{p.ca()}catch{}p.ca=void 0}}else Us(p,11)}else if((l.K||p.g==l)&&ec(p),!j(h))for(N=p.Da.g.parse(h),h=0;h<N.length;h++){let We=N[h];if(p.T=We[0],We=We[1],p.G==2)if(We[0]=="c"){p.K=We[1],p.ia=We[2];const dn=We[3];dn!=null&&(p.la=dn,p.j.info("VER="+p.la));const hn=We[4];hn!=null&&(p.Aa=hn,p.j.info("SVER="+p.Aa));const Oi=We[5];Oi!=null&&typeof Oi=="number"&&0<Oi&&(y=1.5*Oi,p.L=y,p.j.info("backChannelRequestTimeoutMs_="+y)),y=p;const Kn=l.g;if(Kn){const nc=Kn.g?Kn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(nc){var B=y.h;B.g||nc.indexOf("spdy")==-1&&nc.indexOf("quic")==-1&&nc.indexOf("h2")==-1||(B.j=B.l,B.g=new Set,B.h&&(Xo(B,B.h),B.h=null))}if(y.D){const pd=Kn.g?Kn.g.getResponseHeader("X-HTTP-Session-Id"):null;pd&&(y.ya=pd,de(y.I,y.D,pd))}}p.G=3,p.l&&p.l.ua(),p.ba&&(p.R=Date.now()-l.F,p.j.info("Handshake RTT: "+p.R+"ms")),y=p;var le=l;if(y.qa=qp(y,y.J?y.ia:null,y.W),le.K){zl(y.h,le);var ut=le,rn=y.L;rn&&(ut.I=rn),ut.B&&(Wo(ut),xi(ut)),y.g=le}else Fp(y);0<p.i.length&&Zl(p)}else We[0]!="stop"&&We[0]!="close"||Us(p,7);else p.G==3&&(We[0]=="stop"||We[0]=="close"?We[0]=="stop"?Us(p,7):dd(p):We[0]!="noop"&&p.l&&p.l.ta(We),p.v=0)}}Qr(4)}catch{}}var ld=class{constructor(l,h){this.g=l,this.map=h}};function $l(l){this.l=l||10,a.PerformanceNavigationTiming?(l=a.performance.getEntriesByType("navigation"),l=0<l.length&&(l[0].nextHopProtocol=="hq"||l[0].nextHopProtocol=="h2")):l=!!(a.chrome&&a.chrome.loadTimes&&a.chrome.loadTimes()&&a.chrome.loadTimes().wasFetchedViaSpdy),this.j=l?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function ql(l){return l.h?!0:l.g?l.g.size>=l.j:!1}function Jo(l){return l.h?1:l.g?l.g.size:0}function Yo(l,h){return l.h?l.h==h:l.g?l.g.has(h):!1}function Xo(l,h){l.g?l.g.add(h):l.h=h}function zl(l,h){l.h&&l.h==h?l.h=null:l.g&&l.g.has(h)&&l.g.delete(h)}$l.prototype.cancel=function(){if(this.i=Ri(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const l of this.g.values())l.cancel();this.g.clear()}};function Ri(l){if(l.h!=null)return l.i.concat(l.h.D);if(l.g!=null&&l.g.size!==0){let h=l.i;for(const p of l.g.values())h=h.concat(p.D);return h}return T(l.i)}function cd(l){if(l.V&&typeof l.V=="function")return l.V();if(typeof Map<"u"&&l instanceof Map||typeof Set<"u"&&l instanceof Set)return Array.from(l.values());if(typeof l=="string")return l.split("");if(c(l)){for(var h=[],p=l.length,y=0;y<p;y++)h.push(l[y]);return h}h=[],p=0;for(y in l)h[p++]=l[y];return h}function Gl(l){if(l.na&&typeof l.na=="function")return l.na();if(!l.V||typeof l.V!="function"){if(typeof Map<"u"&&l instanceof Map)return Array.from(l.keys());if(!(typeof Set<"u"&&l instanceof Set)){if(c(l)||typeof l=="string"){var h=[];l=l.length;for(var p=0;p<l;p++)h.push(p);return h}h=[],p=0;for(const y in l)h[p++]=y;return h}}}function Kl(l,h){if(l.forEach&&typeof l.forEach=="function")l.forEach(h,void 0);else if(c(l)||typeof l=="string")Array.prototype.forEach.call(l,h,void 0);else for(var p=Gl(l),y=cd(l),N=y.length,B=0;B<N;B++)h.call(void 0,y[B],p&&p[B],l)}var Ci=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Hl(l,h){if(l){l=l.split("&");for(var p=0;p<l.length;p++){var y=l[p].indexOf("="),N=null;if(0<=y){var B=l[p].substring(0,y);N=l[p].substring(y+1)}else B=l[p];h(B,N?decodeURIComponent(N.replace(/\+/g," ")):"")}}}function vr(l){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,l instanceof vr){this.h=l.h,D(this,l.j),this.o=l.o,this.g=l.g,v(this,l.s),this.l=l.l;var h=l.i,p=new Me;p.i=h.i,h.g&&(p.g=new Map(h.g),p.h=h.h),H(this,p),this.m=l.m}else l&&(h=String(l).match(Ci))?(this.h=!1,D(this,h[1]||"",!0),this.o=$e(h[2]||""),this.g=$e(h[3]||"",!0),v(this,h[4]),this.l=$e(h[5]||"",!0),H(this,h[6]||"",!0),this.m=$e(h[7]||"")):(this.h=!1,this.i=new Me(null,this.h))}vr.prototype.toString=function(){var l=[],h=this.j;h&&l.push(Se(h,rt,!0),":");var p=this.g;return(p||h=="file")&&(l.push("//"),(h=this.o)&&l.push(Se(h,rt,!0),"@"),l.push(encodeURIComponent(String(p)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),p=this.s,p!=null&&l.push(":",String(p))),(p=this.l)&&(this.g&&p.charAt(0)!="/"&&l.push("/"),l.push(Se(p,p.charAt(0)=="/"?Vt:nn,!0))),(p=this.i.toString())&&l.push("?",p),(p=this.m)&&l.push("#",Se(p,ie)),l.join("")};function Gn(l){return new vr(l)}function D(l,h,p){l.j=p?$e(h,!0):h,l.j&&(l.j=l.j.replace(/:$/,""))}function v(l,h){if(h){if(h=Number(h),isNaN(h)||0>h)throw Error("Bad port number "+h);l.s=h}else l.s=null}function H(l,h,p){h instanceof Me?(l.i=h,Sb(l.i,l.h)):(p||(h=Se(h,yt)),l.i=new Me(h,l.h))}function de(l,h,p){l.i.set(h,p)}function Te(l){return de(l,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),l}function $e(l,h){return l?h?decodeURI(l.replace(/%25/g,"%2525")):decodeURIComponent(l):""}function Se(l,h,p){return typeof l=="string"?(l=encodeURI(l).replace(h,Ye),p&&(l=l.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),l):null}function Ye(l){return l=l.charCodeAt(0),"%"+(l>>4&15).toString(16)+(l&15).toString(16)}var rt=/[#\/\?@]/g,nn=/[#\?:]/g,Vt=/[#\?]/g,yt=/[#\?@]/g,ie=/#/g;function Me(l,h){this.h=this.g=null,this.i=l||null,this.j=!!h}function Ht(l){l.g||(l.g=new Map,l.h=0,l.i&&Hl(l.i,function(h,p){l.add(decodeURIComponent(h.replace(/\+/g," ")),p)}))}n=Me.prototype,n.add=function(l,h){Ht(this),this.i=null,l=Vi(this,l);var p=this.g.get(l);return p||this.g.set(l,p=[]),p.push(h),this.h+=1,this};function ki(l,h){Ht(l),h=Vi(l,h),l.g.has(h)&&(l.i=null,l.h-=l.g.get(h).length,l.g.delete(h))}function Di(l,h){return Ht(l),h=Vi(l,h),l.g.has(h)}n.forEach=function(l,h){Ht(this),this.g.forEach(function(p,y){p.forEach(function(N){l.call(h,N,y,this)},this)},this)},n.na=function(){Ht(this);const l=Array.from(this.g.values()),h=Array.from(this.g.keys()),p=[];for(let y=0;y<h.length;y++){const N=l[y];for(let B=0;B<N.length;B++)p.push(h[y])}return p},n.V=function(l){Ht(this);let h=[];if(typeof l=="string")Di(this,l)&&(h=h.concat(this.g.get(Vi(this,l))));else{l=Array.from(this.g.values());for(let p=0;p<l.length;p++)h=h.concat(l[p])}return h},n.set=function(l,h){return Ht(this),this.i=null,l=Vi(this,l),Di(this,l)&&(this.h-=this.g.get(l).length),this.g.set(l,[h]),this.h+=1,this},n.get=function(l,h){return l?(l=this.V(l),0<l.length?String(l[0]):h):h};function Wl(l,h,p){ki(l,h),0<p.length&&(l.i=null,l.g.set(Vi(l,h),T(p)),l.h+=p.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const l=[],h=Array.from(this.g.keys());for(var p=0;p<h.length;p++){var y=h[p];const B=encodeURIComponent(String(y)),le=this.V(y);for(y=0;y<le.length;y++){var N=B;le[y]!==""&&(N+="="+encodeURIComponent(String(le[y]))),l.push(N)}}return this.i=l.join("&")};function Vi(l,h){return h=String(h),l.j&&(h=h.toLowerCase()),h}function Sb(l,h){h&&!l.j&&(Ht(l),l.i=null,l.g.forEach(function(p,y){var N=y.toLowerCase();y!=N&&(ki(this,y),Wl(this,N,p))},l)),l.j=h}function xb(l,h){const p=new Zn;if(a.Image){const y=new Image;y.onload=_(Xr,p,"TestLoadImage: loaded",!0,h,y),y.onerror=_(Xr,p,"TestLoadImage: error",!1,h,y),y.onabort=_(Xr,p,"TestLoadImage: abort",!1,h,y),y.ontimeout=_(Xr,p,"TestLoadImage: timeout",!1,h,y),a.setTimeout(function(){y.ontimeout&&y.ontimeout()},1e4),y.src=l}else h(!1)}function Rb(l,h){const p=new Zn,y=new AbortController,N=setTimeout(()=>{y.abort(),Xr(p,"TestPingServer: timeout",!1,h)},1e4);fetch(l,{signal:y.signal}).then(B=>{clearTimeout(N),B.ok?Xr(p,"TestPingServer: ok",!0,h):Xr(p,"TestPingServer: server error",!1,h)}).catch(()=>{clearTimeout(N),Xr(p,"TestPingServer: error",!1,h)})}function Xr(l,h,p,y,N){try{N&&(N.onload=null,N.onerror=null,N.onabort=null,N.ontimeout=null),y(p)}catch{}}function Cb(){this.g=new Ii}function kb(l,h,p){const y=p||"";try{Kl(l,function(N,B){let le=N;u(N)&&(le=qt(N)),h.push(y+B+"="+encodeURIComponent(le))})}catch(N){throw h.push(y+"type="+encodeURIComponent("_badmap")),N}}function Ql(l){this.l=l.Ub||null,this.j=l.eb||!1}k(Ql,Ms),Ql.prototype.g=function(){return new Jl(this.l,this.j)},Ql.prototype.i=function(l){return function(){return l}}({});function Jl(l,h){be.call(this),this.D=l,this.o=h,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}k(Jl,be),n=Jl.prototype,n.open=function(l,h){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=l,this.A=h,this.readyState=1,ea(this)},n.send=function(l){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const h={headers:this.u,method:this.B,credentials:this.m,cache:void 0};l&&(h.body=l),(this.D||a).fetch(new Request(this.A,h)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Zo(this)),this.readyState=0},n.Sa=function(l){if(this.g&&(this.l=l,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=l.headers,this.readyState=2,ea(this)),this.g&&(this.readyState=3,ea(this),this.g)))if(this.responseType==="arraybuffer")l.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof a.ReadableStream<"u"&&"body"in l){if(this.j=l.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Sp(this)}else l.text().then(this.Ra.bind(this),this.ga.bind(this))};function Sp(l){l.j.read().then(l.Pa.bind(l)).catch(l.ga.bind(l))}n.Pa=function(l){if(this.g){if(this.o&&l.value)this.response.push(l.value);else if(!this.o){var h=l.value?l.value:new Uint8Array(0);(h=this.v.decode(h,{stream:!l.done}))&&(this.response=this.responseText+=h)}l.done?Zo(this):ea(this),this.readyState==3&&Sp(this)}},n.Ra=function(l){this.g&&(this.response=this.responseText=l,Zo(this))},n.Qa=function(l){this.g&&(this.response=l,Zo(this))},n.ga=function(){this.g&&Zo(this)};function Zo(l){l.readyState=4,l.l=null,l.j=null,l.v=null,ea(l)}n.setRequestHeader=function(l,h){this.u.append(l,h)},n.getResponseHeader=function(l){return this.h&&this.h.get(l.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const l=[],h=this.h.entries();for(var p=h.next();!p.done;)p=p.value,l.push(p[0]+": "+p[1]),p=h.next();return l.join(`\r
`)};function ea(l){l.onreadystatechange&&l.onreadystatechange.call(l)}Object.defineProperty(Jl.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(l){this.m=l?"include":"same-origin"}});function xp(l){let h="";return te(l,function(p,y){h+=y,h+=":",h+=p,h+=`\r
`}),h}function ud(l,h,p){e:{for(y in p){var y=!1;break e}y=!0}y||(p=xp(p),typeof l=="string"?p!=null&&encodeURIComponent(String(p)):de(l,h,p))}function xt(l){be.call(this),this.headers=new Map,this.o=l||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}k(xt,be);var Db=/^https?$/i,Vb=["POST","PUT"];n=xt.prototype,n.Ha=function(l){this.J=l},n.ea=function(l,h,p,y){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+l);h=h?h.toUpperCase():"GET",this.D=l,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Go.g(),this.v=this.o?Pn(this.o):Pn(Go),this.g.onreadystatechange=g(this.Ea,this);try{this.B=!0,this.g.open(h,String(l),!0),this.B=!1}catch(B){Rp(this,B);return}if(l=p||"",p=new Map(this.headers),y)if(Object.getPrototypeOf(y)===Object.prototype)for(var N in y)p.set(N,y[N]);else if(typeof y.keys=="function"&&typeof y.get=="function")for(const B of y.keys())p.set(B,y.get(B));else throw Error("Unknown input type for opt_headers: "+String(y));y=Array.from(p.keys()).find(B=>B.toLowerCase()=="content-type"),N=a.FormData&&l instanceof a.FormData,!(0<=Array.prototype.indexOf.call(Vb,h,void 0))||y||N||p.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[B,le]of p)this.g.setRequestHeader(B,le);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Dp(this),this.u=!0,this.g.send(l),this.u=!1}catch(B){Rp(this,B)}};function Rp(l,h){l.h=!1,l.g&&(l.j=!0,l.g.abort(),l.j=!1),l.l=h,l.m=5,Cp(l),Yl(l)}function Cp(l){l.A||(l.A=!0,Re(l,"complete"),Re(l,"error"))}n.abort=function(l){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=l||7,Re(this,"complete"),Re(this,"abort"),Yl(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),Yl(this,!0)),xt.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?kp(this):this.bb())},n.bb=function(){kp(this)};function kp(l){if(l.h&&typeof o<"u"&&(!l.v[1]||wr(l)!=4||l.Z()!=2)){if(l.u&&wr(l)==4)$t(l.Ea,0,l);else if(Re(l,"readystatechange"),wr(l)==4){l.h=!1;try{const le=l.Z();e:switch(le){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var h=!0;break e;default:h=!1}var p;if(!(p=h)){var y;if(y=le===0){var N=String(l.D).match(Ci)[1]||null;!N&&a.self&&a.self.location&&(N=a.self.location.protocol.slice(0,-1)),y=!Db.test(N?N.toLowerCase():"")}p=y}if(p)Re(l,"complete"),Re(l,"success");else{l.m=6;try{var B=2<wr(l)?l.g.statusText:""}catch{B=""}l.l=B+" ["+l.Z()+"]",Cp(l)}}finally{Yl(l)}}}}function Yl(l,h){if(l.g){Dp(l);const p=l.g,y=l.v[0]?()=>{}:null;l.g=null,l.v=null,h||Re(l,"ready");try{p.onreadystatechange=y}catch{}}}function Dp(l){l.I&&(a.clearTimeout(l.I),l.I=null)}n.isActive=function(){return!!this.g};function wr(l){return l.g?l.g.readyState:0}n.Z=function(){try{return 2<wr(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(l){if(this.g){var h=this.g.responseText;return l&&h.indexOf(l)==0&&(h=h.substring(l.length)),wn(h)}};function Vp(l){try{if(!l.g)return null;if("response"in l.g)return l.g.response;switch(l.H){case"":case"text":return l.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in l.g)return l.g.mozResponseArrayBuffer}return null}catch{return null}}function Nb(l){const h={};l=(l.g&&2<=wr(l)&&l.g.getAllResponseHeaders()||"").split(`\r
`);for(let y=0;y<l.length;y++){if(j(l[y]))continue;var p=w(l[y]);const N=p[0];if(p=p[1],typeof p!="string")continue;p=p.trim();const B=h[N]||[];h[N]=B,B.push(p)}x(h,function(y){return y.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function ta(l,h,p){return p&&p.internalChannelParams&&p.internalChannelParams[l]||h}function Np(l){this.Aa=0,this.i=[],this.j=new Zn,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=ta("failFast",!1,l),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=ta("baseRetryDelayMs",5e3,l),this.cb=ta("retryDelaySeedMs",1e4,l),this.Wa=ta("forwardChannelMaxRetries",2,l),this.wa=ta("forwardChannelRequestTimeoutMs",2e4,l),this.pa=l&&l.xmlHttpFactory||void 0,this.Xa=l&&l.Tb||void 0,this.Ca=l&&l.useFetchStreams||!1,this.L=void 0,this.J=l&&l.supportsCrossDomainXhr||!1,this.K="",this.h=new $l(l&&l.concurrentRequestLimit),this.Da=new Cb,this.P=l&&l.fastHandshake||!1,this.O=l&&l.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=l&&l.Rb||!1,l&&l.xa&&this.j.xa(),l&&l.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&l&&l.detectBufferingProxy||!1,this.ja=void 0,l&&l.longPollingTimeout&&0<l.longPollingTimeout&&(this.ja=l.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=Np.prototype,n.la=8,n.G=1,n.connect=function(l,h,p,y){tn(0),this.W=l,this.H=h||{},p&&y!==void 0&&(this.H.OSID=p,this.H.OAID=y),this.F=this.X,this.I=qp(this,null,this.W),Zl(this)};function dd(l){if(Op(l),l.G==3){var h=l.U++,p=Gn(l.I);if(de(p,"SID",l.K),de(p,"RID",h),de(p,"TYPE","terminate"),na(l,p),h=new er(l,l.j,h),h.L=2,h.v=Te(Gn(p)),p=!1,a.navigator&&a.navigator.sendBeacon)try{p=a.navigator.sendBeacon(h.v.toString(),"")}catch{}!p&&a.Image&&(new Image().src=h.v,p=!0),p||(h.g=zp(h.j,null),h.g.ea(h.v)),h.F=Date.now(),xi(h)}$p(l)}function Xl(l){l.g&&(fd(l),l.g.cancel(),l.g=null)}function Op(l){Xl(l),l.u&&(a.clearTimeout(l.u),l.u=null),ec(l),l.h.cancel(),l.s&&(typeof l.s=="number"&&a.clearTimeout(l.s),l.s=null)}function Zl(l){if(!ql(l.h)&&!l.s){l.s=!0;var h=l.Ga;Le||un(),De||(Le(),De=!0),Kt.add(h,l),l.B=0}}function Ob(l,h){return Jo(l.h)>=l.h.j-(l.s?1:0)?!1:l.s?(l.i=h.D.concat(l.i),!0):l.G==1||l.G==2||l.B>=(l.Va?0:l.Wa)?!1:(l.s=Jr(g(l.Ga,l,h),jp(l,l.B)),l.B++,!0)}n.Ga=function(l){if(this.s)if(this.s=null,this.G==1){if(!l){this.U=Math.floor(1e5*Math.random()),l=this.U++;const N=new er(this,this.j,l);let B=this.o;if(this.S&&(B?(B=E(B),R(B,this.S)):B=this.S),this.m!==null||this.O||(N.H=B,B=null),this.P)e:{for(var h=0,p=0;p<this.i.length;p++){t:{var y=this.i[p];if("__data__"in y.map&&(y=y.map.__data__,typeof y=="string")){y=y.length;break t}y=void 0}if(y===void 0)break;if(h+=y,4096<h){h=p;break e}if(h===4096||p===this.i.length-1){h=p+1;break e}}h=1e3}else h=1e3;h=Lp(this,N,h),p=Gn(this.I),de(p,"RID",l),de(p,"CVER",22),this.D&&de(p,"X-HTTP-Session-Id",this.D),na(this,p),B&&(this.O?h="headers="+encodeURIComponent(String(xp(B)))+"&"+h:this.m&&ud(p,this.m,B)),Xo(this.h,N),this.Ua&&de(p,"TYPE","init"),this.P?(de(p,"$req",h),de(p,"SID","null"),N.T=!0,Si(N,p,null)):Si(N,p,h),this.G=2}}else this.G==3&&(l?Mp(this,l):this.i.length==0||ql(this.h)||Mp(this))};function Mp(l,h){var p;h?p=h.l:p=l.U++;const y=Gn(l.I);de(y,"SID",l.K),de(y,"RID",p),de(y,"AID",l.T),na(l,y),l.m&&l.o&&ud(y,l.m,l.o),p=new er(l,l.j,p,l.B+1),l.m===null&&(p.H=l.o),h&&(l.i=h.D.concat(l.i)),h=Lp(l,p,1e3),p.I=Math.round(.5*l.wa)+Math.round(.5*l.wa*Math.random()),Xo(l.h,p),Si(p,y,h)}function na(l,h){l.H&&te(l.H,function(p,y){de(h,y,p)}),l.l&&Kl({},function(p,y){de(h,y,p)})}function Lp(l,h,p){p=Math.min(l.i.length,p);var y=l.l?g(l.l.Na,l.l,l):null;e:{var N=l.i;let B=-1;for(;;){const le=["count="+p];B==-1?0<p?(B=N[0].g,le.push("ofs="+B)):B=0:le.push("ofs="+B);let ut=!0;for(let rn=0;rn<p;rn++){let We=N[rn].g;const dn=N[rn].map;if(We-=B,0>We)B=Math.max(0,N[rn].g-100),ut=!1;else try{kb(dn,le,"req"+We+"_")}catch{y&&y(dn)}}if(ut){y=le.join("&");break e}}}return l=l.i.splice(0,p),h.D=l,y}function Fp(l){if(!l.g&&!l.u){l.Y=1;var h=l.Fa;Le||un(),De||(Le(),De=!0),Kt.add(h,l),l.v=0}}function hd(l){return l.g||l.u||3<=l.v?!1:(l.Y++,l.u=Jr(g(l.Fa,l),jp(l,l.v)),l.v++,!0)}n.Fa=function(){if(this.u=null,Up(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var l=2*this.R;this.j.info("BP detection timer enabled: "+l),this.A=Jr(g(this.ab,this),l)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,tn(10),Xl(this),Up(this))};function fd(l){l.A!=null&&(a.clearTimeout(l.A),l.A=null)}function Up(l){l.g=new er(l,l.j,"rpc",l.Y),l.m===null&&(l.g.H=l.o),l.g.O=0;var h=Gn(l.qa);de(h,"RID","rpc"),de(h,"SID",l.K),de(h,"AID",l.T),de(h,"CI",l.F?"0":"1"),!l.F&&l.ja&&de(h,"TO",l.ja),de(h,"TYPE","xmlhttp"),na(l,h),l.m&&l.o&&ud(h,l.m,l.o),l.L&&(l.g.I=l.L);var p=l.g;l=l.ia,p.L=1,p.v=Te(Gn(h)),p.m=null,p.P=!0,Bl(p,l)}n.Za=function(){this.C!=null&&(this.C=null,Xl(this),hd(this),tn(19))};function ec(l){l.C!=null&&(a.clearTimeout(l.C),l.C=null)}function Bp(l,h){var p=null;if(l.g==h){ec(l),fd(l),l.g=null;var y=2}else if(Yo(l.h,h))p=h.D,zl(l.h,h),y=1;else return;if(l.G!=0){if(h.o)if(y==1){p=h.m?h.m.length:0,h=Date.now()-h.F;var N=l.B;y=Wr(),Re(y,new zo(y,p)),Zl(l)}else Fp(l);else if(N=h.s,N==3||N==0&&0<h.X||!(y==1&&Ob(l,h)||y==2&&hd(l)))switch(p&&0<p.length&&(h=l.h,h.i=h.i.concat(p)),N){case 1:Us(l,5);break;case 4:Us(l,10);break;case 3:Us(l,6);break;default:Us(l,2)}}}function jp(l,h){let p=l.Ta+Math.floor(Math.random()*l.cb);return l.isActive()||(p*=2),p*h}function Us(l,h){if(l.j.info("Error code "+h),h==2){var p=g(l.fb,l),y=l.Xa;const N=!y;y=new vr(y||"//www.google.com/images/cleardot.gif"),a.location&&a.location.protocol=="http"||D(y,"https"),Te(y),N?xb(y.toString(),p):Rb(y.toString(),p)}else tn(2);l.G=0,l.l&&l.l.sa(h),$p(l),Op(l)}n.fb=function(l){l?(this.j.info("Successfully pinged google.com"),tn(2)):(this.j.info("Failed to ping google.com"),tn(1))};function $p(l){if(l.G=0,l.ka=[],l.l){const h=Ri(l.h);(h.length!=0||l.i.length!=0)&&(C(l.ka,h),C(l.ka,l.i),l.h.i.length=0,T(l.i),l.i.length=0),l.l.ra()}}function qp(l,h,p){var y=p instanceof vr?Gn(p):new vr(p);if(y.g!="")h&&(y.g=h+"."+y.g),v(y,y.s);else{var N=a.location;y=N.protocol,h=h?h+"."+N.hostname:N.hostname,N=+N.port;var B=new vr(null);y&&D(B,y),h&&(B.g=h),N&&v(B,N),p&&(B.l=p),y=B}return p=l.D,h=l.ya,p&&h&&de(y,p,h),de(y,"VER",l.la),na(l,y),y}function zp(l,h,p){if(h&&!l.J)throw Error("Can't create secondary domain capable XhrIo object.");return h=l.Ca&&!l.pa?new xt(new Ql({eb:p})):new xt(l.pa),h.Ha(l.J),h}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Gp(){}n=Gp.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function tc(){}tc.prototype.g=function(l,h){return new On(l,h)};function On(l,h){be.call(this),this.g=new Np(h),this.l=l,this.h=h&&h.messageUrlParams||null,l=h&&h.messageHeaders||null,h&&h.clientProtocolHeaderRequired&&(l?l["X-Client-Protocol"]="webchannel":l={"X-Client-Protocol":"webchannel"}),this.g.o=l,l=h&&h.initMessageHeaders||null,h&&h.messageContentType&&(l?l["X-WebChannel-Content-Type"]=h.messageContentType:l={"X-WebChannel-Content-Type":h.messageContentType}),h&&h.va&&(l?l["X-WebChannel-Client-Profile"]=h.va:l={"X-WebChannel-Client-Profile":h.va}),this.g.S=l,(l=h&&h.Sb)&&!j(l)&&(this.g.m=l),this.v=h&&h.supportsCrossDomainXhr||!1,this.u=h&&h.sendRawJson||!1,(h=h&&h.httpSessionIdParam)&&!j(h)&&(this.g.D=h,l=this.h,l!==null&&h in l&&(l=this.h,h in l&&delete l[h])),this.j=new Ni(this)}k(On,be),On.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},On.prototype.close=function(){dd(this.g)},On.prototype.o=function(l){var h=this.g;if(typeof l=="string"){var p={};p.__data__=l,l=p}else this.u&&(p={},p.__data__=qt(l),l=p);h.i.push(new ld(h.Ya++,l)),h.G==3&&Zl(h)},On.prototype.N=function(){this.g.l=null,delete this.j,dd(this.g),delete this.g,On.aa.N.call(this)};function Kp(l){Ei.call(this),l.__headers__&&(this.headers=l.__headers__,this.statusCode=l.__status__,delete l.__headers__,delete l.__status__);var h=l.__sm__;if(h){e:{for(const p in h){l=p;break e}l=void 0}(this.i=l)&&(l=this.i,h=h!==null&&l in h?h[l]:void 0),this.data=h}else this.data=l}k(Kp,Ei);function Hp(){qo.call(this),this.status=1}k(Hp,qo);function Ni(l){this.g=l}k(Ni,Gp),Ni.prototype.ua=function(){Re(this.g,"a")},Ni.prototype.ta=function(l){Re(this.g,new Kp(l))},Ni.prototype.sa=function(l){Re(this.g,new Hp)},Ni.prototype.ra=function(){Re(this.g,"b")},tc.prototype.createWebChannel=tc.prototype.g,On.prototype.send=On.prototype.o,On.prototype.open=On.prototype.m,On.prototype.close=On.prototype.close,pv=function(){return new tc},fv=function(){return Wr()},hv=mr,fh={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Pi.NO_ERROR=0,Pi.TIMEOUT=8,Pi.HTTP_ERROR=6,wc=Pi,Ll.COMPLETE="complete",dv=Ll,$o.EventType=Ls,Ls.OPEN="a",Ls.CLOSE="b",Ls.ERROR="c",Ls.MESSAGE="d",be.prototype.listen=be.prototype.K,ga=$o,xt.prototype.listenOnce=xt.prototype.L,xt.prototype.getLastError=xt.prototype.Ka,xt.prototype.getLastErrorCode=xt.prototype.Ba,xt.prototype.getStatus=xt.prototype.Z,xt.prototype.getResponseJson=xt.prototype.Oa,xt.prototype.getResponseText=xt.prototype.oa,xt.prototype.send=xt.prototype.ea,xt.prototype.setWithCredentials=xt.prototype.Ha,uv=xt}).apply(typeof oc<"u"?oc:typeof self<"u"?self:typeof window<"u"?window:{});const Ym="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qt{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Qt.UNAUTHENTICATED=new Qt(null),Qt.GOOGLE_CREDENTIALS=new Qt("google-credentials-uid"),Qt.FIRST_PARTY=new Qt("first-party-uid"),Qt.MOCK_USER=new Qt("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Co="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Is=new of("@firebase/firestore");function zi(){return Is.logLevel}function GM(n){Is.setLogLevel(n)}function J(n,...e){if(Is.logLevel<=qe.DEBUG){const t=e.map(lf);Is.debug(`Firestore (${Co}): ${n}`,...t)}}function Nt(n,...e){if(Is.logLevel<=qe.ERROR){const t=e.map(lf);Is.error(`Firestore (${Co}): ${n}`,...t)}}function qn(n,...e){if(Is.logLevel<=qe.WARN){const t=e.map(lf);Is.warn(`Firestore (${Co}): ${n}`,...t)}}function lf(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
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
 */function pe(n="Unexpected state"){const e=`FIRESTORE (${Co}) INTERNAL ASSERTION FAILED: `+n;throw Nt(e),new Error(e)}function ge(n,e){n||pe()}function KM(n,e){n||pe()}function ae(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const U={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class Y extends jr{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jt{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mv{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class $P{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Qt.UNAUTHENTICATED))}shutdown(){}}class qP{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class zP{constructor(e){this.t=e,this.currentUser=Qt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){ge(this.o===void 0);let r=this.i;const s=c=>this.i!==r?(r=this.i,t(c)):Promise.resolve();let i=new Jt;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Jt,e.enqueueRetryable(()=>s(this.currentUser))};const o=()=>{const c=i;e.enqueueRetryable(async()=>{await c.promise,await s(this.currentUser)})},a=c=>{J("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(c=>a(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?a(c):(J("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Jt)}},0),o()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(J("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(ge(typeof r.accessToken=="string"),new mv(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return ge(e===null||typeof e=="string"),new Qt(e)}}class GP{constructor(e,t,r){this.l=e,this.h=t,this.P=r,this.type="FirstParty",this.user=Qt.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class KP{constructor(e,t,r){this.l=e,this.h=t,this.P=r}getToken(){return Promise.resolve(new GP(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(Qt.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class gv{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class HP{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){ge(this.o===void 0);const r=i=>{i.error!=null&&J("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.R;return this.R=i.token,J("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?t(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{J("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):J("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(ge(typeof t.token=="string"),this.R=t.token,new gv(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}class HM{getToken(){return Promise.resolve(new gv(""))}invalidateToken(){}start(e,t){}shutdown(){}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function WP(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _v{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const s=WP(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<t&&(r+=e.charAt(s[i]%e.length))}return r}}function Pe(n,e){return n<e?-1:n>e?1:0}function ho(n,e,t){return n.length===e.length&&n.every((r,s)=>t(r,e[s]))}function yv(n){return n+"\0"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pt{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new Y(U.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new Y(U.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new Y(U.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new Y(U.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return Pt.fromMillis(Date.now())}static fromDate(e){return Pt.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*t));return new Pt(t,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?Pe(this.nanoseconds,e.nanoseconds):Pe(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ve{constructor(e){this.timestamp=e}static fromTimestamp(e){return new ve(e)}static min(){return new ve(new Pt(0,0))}static max(){return new ve(new Pt(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ha{constructor(e,t,r){t===void 0?t=0:t>e.length&&pe(),r===void 0?r=e.length-t:r>e.length-t&&pe(),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return Ha.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof Ha?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const i=e.get(s),o=t.get(s);if(i<o)return-1;if(i>o)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class ze extends Ha{construct(e,t,r){return new ze(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new Y(U.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(s=>s.length>0))}return new ze(t)}static emptyPath(){return new ze([])}}const QP=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class wt extends Ha{construct(e,t,r){return new wt(e,t,r)}static isValidIdentifier(e){return QP.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),wt.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new wt(["__name__"])}static fromServerFormat(e){const t=[];let r="",s=0;const i=()=>{if(r.length===0)throw new Y(U.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let o=!1;for(;s<e.length;){const a=e[s];if(a==="\\"){if(s+1===e.length)throw new Y(U.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new Y(U.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=c,s+=2}else a==="`"?(o=!o,s++):a!=="."||o?(r+=a,s++):(i(),s++)}if(i(),o)throw new Y(U.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new wt(t)}static emptyPath(){return new wt([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class he{constructor(e){this.path=e}static fromPath(e){return new he(ze.fromString(e))}static fromName(e){return new he(ze.fromString(e).popFirst(5))}static empty(){return new he(ze.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ze.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return ze.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new he(new ze(e.slice()))}}/**
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
 */class fo{constructor(e,t,r,s){this.indexId=e,this.collectionGroup=t,this.fields=r,this.indexState=s}}function ph(n){return n.fields.find(e=>e.kind===2)}function Gs(n){return n.fields.filter(e=>e.kind!==2)}function JP(n,e){let t=Pe(n.collectionGroup,e.collectionGroup);if(t!==0)return t;for(let r=0;r<Math.min(n.fields.length,e.fields.length);++r)if(t=YP(n.fields[r],e.fields[r]),t!==0)return t;return Pe(n.fields.length,e.fields.length)}fo.UNKNOWN_ID=-1;class ei{constructor(e,t){this.fieldPath=e,this.kind=t}}function YP(n,e){const t=wt.comparator(n.fieldPath,e.fieldPath);return t!==0?t:Pe(n.kind,e.kind)}class po{constructor(e,t){this.sequenceNumber=e,this.offset=t}static empty(){return new po(0,Bn.min())}}function vv(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=ve.fromTimestamp(r===1e9?new Pt(t+1,0):new Pt(t,r));return new Bn(s,he.empty(),e)}function wv(n){return new Bn(n.readTime,n.key,-1)}class Bn{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new Bn(ve.min(),he.empty(),-1)}static max(){return new Bn(ve.max(),he.empty(),-1)}}function cf(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=he.comparator(n.documentKey,e.documentKey),t!==0?t:Pe(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bv="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Iv{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ks(n){if(n.code!==U.FAILED_PRECONDITION||n.message!==bv)throw n;J("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class O{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&pe(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new O((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(t,i).next(r,s)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof O?t:O.resolve(t)}catch(t){return O.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):O.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):O.reject(t)}static resolve(e){return new O((t,r)=>{t(e)})}static reject(e){return new O((t,r)=>{r(e)})}static waitFor(e){return new O((t,r)=>{let s=0,i=0,o=!1;e.forEach(a=>{++s,a.next(()=>{++i,o&&i===s&&t()},c=>r(c))}),o=!0,i===s&&t()})}static or(e){let t=O.resolve(!1);for(const r of e)t=t.next(s=>s?O.resolve(s):r());return t}static forEach(e,t){const r=[];return e.forEach((s,i)=>{r.push(t.call(this,s,i))}),this.waitFor(r)}static mapArray(e,t){return new O((r,s)=>{const i=e.length,o=new Array(i);let a=0;for(let c=0;c<i;c++){const u=c;t(e[u]).next(d=>{o[u]=d,++a,a===i&&r(o)},d=>s(d))}})}static doWhile(e,t){return new O((r,s)=>{const i=()=>{e()===!0?t().next(()=>{i()},s):r()};i()})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pu{constructor(e,t){this.action=e,this.transaction=t,this.aborted=!1,this.V=new Jt,this.transaction.oncomplete=()=>{this.V.resolve()},this.transaction.onabort=()=>{t.error?this.V.reject(new Ca(e,t.error)):this.V.resolve()},this.transaction.onerror=r=>{const s=uf(r.target.error);this.V.reject(new Ca(e,s))}}static open(e,t,r,s){try{return new Pu(t,e.transaction(s,r))}catch(i){throw new Ca(t,i)}}get m(){return this.V.promise}abort(e){e&&this.V.reject(e),this.aborted||(J("SimpleDb","Aborting transaction:",e?e.message:"Client-initiated abort"),this.aborted=!0,this.transaction.abort())}g(){const e=this.transaction;this.aborted||typeof e.commit!="function"||e.commit()}store(e){const t=this.transaction.objectStore(e);return new ZP(t)}}class ur{constructor(e,t,r){this.name=e,this.version=t,this.p=r,ur.S(zt())===12.2&&Nt("Firestore persistence suffers from a bug in iOS 12.2 Safari that may cause your app to stop working. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.")}static delete(e){return J("SimpleDb","Removing database:",e),Ks(window.indexedDB.deleteDatabase(e)).toPromise()}static D(){if(!nv())return!1;if(ur.v())return!0;const e=zt(),t=ur.S(e),r=0<t&&t<10,s=Ev(e),i=0<s&&s<4.5;return!(e.indexOf("MSIE ")>0||e.indexOf("Trident/")>0||e.indexOf("Edge/")>0||r||i)}static v(){var e;return typeof process<"u"&&((e=process.__PRIVATE_env)===null||e===void 0?void 0:e.C)==="YES"}static F(e,t){return e.store(t)}static S(e){const t=e.match(/i(?:phone|pad|pod) os ([\d_]+)/i),r=t?t[1].split("_").slice(0,2).join("."):"-1";return Number(r)}async M(e){return this.db||(J("SimpleDb","Opening database:",this.name),this.db=await new Promise((t,r)=>{const s=indexedDB.open(this.name,this.version);s.onsuccess=i=>{const o=i.target.result;t(o)},s.onblocked=()=>{r(new Ca(e,"Cannot upgrade IndexedDB schema while another tab is open. Close all tabs that access Firestore and reload this page to proceed."))},s.onerror=i=>{const o=i.target.error;o.name==="VersionError"?r(new Y(U.FAILED_PRECONDITION,"A newer version of the Firestore SDK was previously used and so the persisted data is not compatible with the version of the SDK you are now using. The SDK will operate with persistence disabled. If you need persistence, please re-upgrade to a newer version of the SDK or else clear the persisted IndexedDB data for your app to start fresh.")):o.name==="InvalidStateError"?r(new Y(U.FAILED_PRECONDITION,"Unable to open an IndexedDB connection. This could be due to running in a private browsing session on a browser whose private browsing sessions do not support IndexedDB: "+o)):r(new Ca(e,o))},s.onupgradeneeded=i=>{J("SimpleDb",'Database "'+this.name+'" requires upgrade from version:',i.oldVersion);const o=i.target.result;this.p.O(o,s.transaction,i.oldVersion,this.version).next(()=>{J("SimpleDb","Database upgrade to version "+this.version+" complete")})}})),this.N&&(this.db.onversionchange=t=>this.N(t)),this.db}L(e){this.N=e,this.db&&(this.db.onversionchange=t=>e(t))}async runTransaction(e,t,r,s){const i=t==="readonly";let o=0;for(;;){++o;try{this.db=await this.M(e);const a=Pu.open(this.db,e,i?"readonly":"readwrite",r),c=s(a).next(u=>(a.g(),u)).catch(u=>(a.abort(u),O.reject(u))).toPromise();return c.catch(()=>{}),await a.m,c}catch(a){const c=a,u=c.name!=="FirebaseError"&&o<3;if(J("SimpleDb","Transaction failed with error:",c.message,"Retrying:",u),this.close(),!u)return Promise.reject(c)}}}close(){this.db&&this.db.close(),this.db=void 0}}function Ev(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}class XP{constructor(e){this.B=e,this.k=!1,this.q=null}get isDone(){return this.k}get K(){return this.q}set cursor(e){this.B=e}done(){this.k=!0}$(e){this.q=e}delete(){return Ks(this.B.delete())}}class Ca extends Y{constructor(e,t){super(U.UNAVAILABLE,`IndexedDB transaction '${e}' failed: ${t}`),this.name="IndexedDbTransactionError"}}function Ds(n){return n.name==="IndexedDbTransactionError"}class ZP{constructor(e){this.store=e}put(e,t){let r;return t!==void 0?(J("SimpleDb","PUT",this.store.name,e,t),r=this.store.put(t,e)):(J("SimpleDb","PUT",this.store.name,"<auto-key>",e),r=this.store.put(e)),Ks(r)}add(e){return J("SimpleDb","ADD",this.store.name,e,e),Ks(this.store.add(e))}get(e){return Ks(this.store.get(e)).next(t=>(t===void 0&&(t=null),J("SimpleDb","GET",this.store.name,e,t),t))}delete(e){return J("SimpleDb","DELETE",this.store.name,e),Ks(this.store.delete(e))}count(){return J("SimpleDb","COUNT",this.store.name),Ks(this.store.count())}U(e,t){const r=this.options(e,t),s=r.index?this.store.index(r.index):this.store;if(typeof s.getAll=="function"){const i=s.getAll(r.range);return new O((o,a)=>{i.onerror=c=>{a(c.target.error)},i.onsuccess=c=>{o(c.target.result)}})}{const i=this.cursor(r),o=[];return this.W(i,(a,c)=>{o.push(c)}).next(()=>o)}}G(e,t){const r=this.store.getAll(e,t===null?void 0:t);return new O((s,i)=>{r.onerror=o=>{i(o.target.error)},r.onsuccess=o=>{s(o.target.result)}})}j(e,t){J("SimpleDb","DELETE ALL",this.store.name);const r=this.options(e,t);r.H=!1;const s=this.cursor(r);return this.W(s,(i,o,a)=>a.delete())}J(e,t){let r;t?r=e:(r={},t=e);const s=this.cursor(r);return this.W(s,t)}Y(e){const t=this.cursor({});return new O((r,s)=>{t.onerror=i=>{const o=uf(i.target.error);s(o)},t.onsuccess=i=>{const o=i.target.result;o?e(o.primaryKey,o.value).next(a=>{a?o.continue():r()}):r()}})}W(e,t){const r=[];return new O((s,i)=>{e.onerror=o=>{i(o.target.error)},e.onsuccess=o=>{const a=o.target.result;if(!a)return void s();const c=new XP(a),u=t(a.primaryKey,a.value,c);if(u instanceof O){const d=u.catch(f=>(c.done(),O.reject(f)));r.push(d)}c.isDone?s():c.K===null?a.continue():a.continue(c.K)}}).next(()=>O.waitFor(r))}options(e,t){let r;return e!==void 0&&(typeof e=="string"?r=e:t=e),{index:r,range:t}}cursor(e){let t="next";if(e.reverse&&(t="prev"),e.index){const r=this.store.index(e.index);return e.H?r.openKeyCursor(e.range,t):r.openCursor(e.range,t)}return this.store.openCursor(e.range,t)}}function Ks(n){return new O((e,t)=>{n.onsuccess=r=>{const s=r.target.result;e(s)},n.onerror=r=>{const s=uf(r.target.error);t(s)}})}let Xm=!1;function uf(n){const e=ur.S(zt());if(e>=12.2&&e<13){const t="An internal error was encountered in the Indexed Database server";if(n.message.indexOf(t)>=0){const r=new Y("internal",`IOS_INDEXEDDB_BUG1: IndexedDb has thrown '${t}'. This is likely due to an unavoidable bug in iOS. See https://stackoverflow.com/q/56496296/110915 for details and a potential workaround.`);return Xm||(Xm=!0,setTimeout(()=>{throw r},0)),r}}return n}class eS{constructor(e,t){this.asyncQueue=e,this.Z=t,this.task=null}start(){this.X(15e3)}stop(){this.task&&(this.task.cancel(),this.task=null)}get started(){return this.task!==null}X(e){J("IndexBackfiller",`Scheduled in ${e}ms`),this.task=this.asyncQueue.enqueueAfterDelay("index_backfill",e,async()=>{this.task=null;try{J("IndexBackfiller",`Documents written: ${await this.Z.ee()}`)}catch(t){Ds(t)?J("IndexBackfiller","Ignoring IndexedDB error during index backfill: ",t):await ks(t)}await this.X(6e4)})}}class tS{constructor(e,t){this.localStore=e,this.persistence=t}async ee(e=50){return this.persistence.runTransaction("Backfill Indexes","readwrite-primary",t=>this.te(t,e))}te(e,t){const r=new Set;let s=t,i=!0;return O.doWhile(()=>i===!0&&s>0,()=>this.localStore.indexManager.getNextCollectionGroupToUpdate(e).next(o=>{if(o!==null&&!r.has(o))return J("IndexBackfiller",`Processing collection: ${o}`),this.ne(e,o,s).next(a=>{s-=a,r.add(o)});i=!1})).next(()=>t-s)}ne(e,t,r){return this.localStore.indexManager.getMinOffsetFromCollectionGroup(e,t).next(s=>this.localStore.localDocuments.getNextDocuments(e,t,s,r).next(i=>{const o=i.changes;return this.localStore.indexManager.updateIndexEntries(e,o).next(()=>this.re(s,i)).next(a=>(J("IndexBackfiller",`Updating offset: ${a}`),this.localStore.indexManager.updateCollectionGroup(e,t,a))).next(()=>o.size)}))}re(e,t){let r=e;return t.changes.forEach((s,i)=>{const o=wv(i);cf(o,r)>0&&(r=o)}),new Bn(r.readTime,r.documentKey,Math.max(t.batchId,e.largestBatchId))}}/**
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
 */class Cn{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ie(r),this.se=r=>t.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}Cn.oe=-1;function pl(n){return n==null}function Wa(n){return n===0&&1/n==-1/0}function Tv(n){return typeof n=="number"&&Number.isInteger(n)&&!Wa(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yn(n){let e="";for(let t=0;t<n.length;t++)e.length>0&&(e=Zm(e)),e=nS(n.get(t),e);return Zm(e)}function nS(n,e){let t=e;const r=n.length;for(let s=0;s<r;s++){const i=n.charAt(s);switch(i){case"\0":t+="";break;case"":t+="";break;default:t+=i}}return t}function Zm(n){return n+""}function or(n){const e=n.length;if(ge(e>=2),e===2)return ge(n.charAt(0)===""&&n.charAt(1)===""),ze.emptyPath();const t=e-2,r=[];let s="";for(let i=0;i<e;){const o=n.indexOf("",i);switch((o<0||o>t)&&pe(),n.charAt(o+1)){case"":const a=n.substring(i,o);let c;s.length===0?c=a:(s+=a,c=s,s=""),r.push(c);break;case"":s+=n.substring(i,o),s+="\0";break;case"":s+=n.substring(i,o+1);break;default:pe()}i=o+2}return new ze(r)}/**
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
 */const eg=["userId","batchId"];/**
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
 */function bc(n,e){return[n,yn(e)]}function Av(n,e,t){return[n,yn(e),t]}const rS={},sS=["prefixPath","collectionGroup","readTime","documentId"],iS=["prefixPath","collectionGroup","documentId"],oS=["collectionGroup","readTime","prefixPath","documentId"],aS=["canonicalId","targetId"],lS=["targetId","path"],cS=["path","targetId"],uS=["collectionId","parent"],dS=["indexId","uid"],hS=["uid","sequenceNumber"],fS=["indexId","uid","arrayValue","directionalValue","orderedDocumentKey","documentKey"],pS=["indexId","uid","orderedDocumentKey"],mS=["userId","collectionPath","documentId"],gS=["userId","collectionPath","largestBatchId"],_S=["userId","collectionGroup","largestBatchId"],Pv=["mutationQueues","mutations","documentMutations","remoteDocuments","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries"],yS=[...Pv,"documentOverlays"],Sv=["mutationQueues","mutations","documentMutations","remoteDocumentsV14","targets","owner","targetGlobal","targetDocuments","clientMetadata","remoteDocumentGlobal","collectionParents","bundles","namedQueries","documentOverlays"],xv=Sv,df=[...xv,"indexConfiguration","indexState","indexEntries"],vS=df,wS=[...df,"globals"];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mh extends Iv{constructor(e,t){super(),this._e=e,this.currentSequenceNumber=t}}function Gt(n,e){const t=ae(n);return ur.F(t._e,e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tg(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Vs(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function Rv(n,e){const t=[];for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&t.push(e(n[r],r,n));return t}function Cv(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pt{constructor(e,t){this.comparator=e,this.root=t||sn.EMPTY}insert(e,t){return new pt(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,sn.BLACK,null,null))}remove(e){return new pt(this.comparator,this.root.remove(e,this.comparator).copy(null,null,sn.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return t+r.left.size;s<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new ac(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new ac(this.root,e,this.comparator,!1)}getReverseIterator(){return new ac(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new ac(this.root,e,this.comparator,!0)}}class ac{constructor(e,t,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=t?r(e.key,t):1,t&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class sn{constructor(e,t,r,s,i){this.key=e,this.value=t,this.color=r??sn.RED,this.left=s??sn.EMPTY,this.right=i??sn.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,s,i){return new sn(e??this.key,t??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,t,r),null):i===0?s.copy(null,t,null,null,null):s.copy(null,null,null,null,s.right.insert(e,t,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return sn.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,s=this;if(t(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,t),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),t(e,s.key)===0){if(s.right.isEmpty())return sn.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,t))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,sn.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,sn.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw pe();const e=this.left.check();if(e!==this.right.check())throw pe();return e+(this.isRed()?0:1)}}sn.EMPTY=null,sn.RED=!0,sn.BLACK=!1;sn.EMPTY=new class{constructor(){this.size=0}get key(){throw pe()}get value(){throw pe()}get color(){throw pe()}get left(){throw pe()}get right(){throw pe()}copy(e,t,r,s,i){return this}insert(e,t,r){return new sn(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lt{constructor(e){this.comparator=e,this.data=new pt(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;t(s.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new ng(this.data.getIterator())}getIteratorFrom(e){return new ng(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof lt)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new lt(this.comparator);return t.data=e,t}}class ng{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}function Li(n){return n.hasNext()?n.getNext():void 0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kn{constructor(e){this.fields=e,e.sort(wt.comparator)}static empty(){return new kn([])}unionWith(e){let t=new lt(wt.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new kn(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return ho(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
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
 */class kv extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function QM(){return typeof atob<"u"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ct{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new kv("Invalid base64 string: "+i):i}}(e);return new Ct(t)}static fromUint8Array(e){const t=function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i}(e);return new Ct(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Pe(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Ct.EMPTY_BYTE_STRING=new Ct("");const bS=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Or(n){if(ge(!!n),typeof n=="string"){let e=0;const t=bS.exec(n);if(ge(!!t),t[1]){let s=t[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:vt(n.seconds),nanos:vt(n.nanos)}}function vt(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function Mr(n){return typeof n=="string"?Ct.fromBase64String(n):Ct.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Su(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function xu(n){const e=n.mapValue.fields.__previous_value__;return Su(e)?xu(e):e}function Qa(n){const e=Or(n.mapValue.fields.__local_write_time__.timestampValue);return new Pt(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class IS{constructor(e,t,r,s,i,o,a,c,u){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=a,this.longPollingOptions=c,this.useFetchStreams=u}}class si{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new si("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof si&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ps={mapValue:{fields:{__type__:{stringValue:"__max__"}}}},Ic={nullValue:"NULL_VALUE"};function Es(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Su(n)?4:Dv(n)?9007199254740991:Ru(n)?10:11:pe()}function pr(n,e){if(n===e)return!0;const t=Es(n);if(t!==Es(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Qa(n).isEqual(Qa(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const o=Or(s.timestampValue),a=Or(i.timestampValue);return o.seconds===a.seconds&&o.nanos===a.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(s,i){return Mr(s.bytesValue).isEqual(Mr(i.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(s,i){return vt(s.geoPointValue.latitude)===vt(i.geoPointValue.latitude)&&vt(s.geoPointValue.longitude)===vt(i.geoPointValue.longitude)}(n,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return vt(s.integerValue)===vt(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const o=vt(s.doubleValue),a=vt(i.doubleValue);return o===a?Wa(o)===Wa(a):isNaN(o)&&isNaN(a)}return!1}(n,e);case 9:return ho(n.arrayValue.values||[],e.arrayValue.values||[],pr);case 10:case 11:return function(s,i){const o=s.mapValue.fields||{},a=i.mapValue.fields||{};if(tg(o)!==tg(a))return!1;for(const c in o)if(o.hasOwnProperty(c)&&(a[c]===void 0||!pr(o[c],a[c])))return!1;return!0}(n,e);default:return pe()}}function Ja(n,e){return(n.values||[]).find(t=>pr(t,e))!==void 0}function Ts(n,e){if(n===e)return 0;const t=Es(n),r=Es(e);if(t!==r)return Pe(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return Pe(n.booleanValue,e.booleanValue);case 2:return function(i,o){const a=vt(i.integerValue||i.doubleValue),c=vt(o.integerValue||o.doubleValue);return a<c?-1:a>c?1:a===c?0:isNaN(a)?isNaN(c)?0:-1:1}(n,e);case 3:return rg(n.timestampValue,e.timestampValue);case 4:return rg(Qa(n),Qa(e));case 5:return Pe(n.stringValue,e.stringValue);case 6:return function(i,o){const a=Mr(i),c=Mr(o);return a.compareTo(c)}(n.bytesValue,e.bytesValue);case 7:return function(i,o){const a=i.split("/"),c=o.split("/");for(let u=0;u<a.length&&u<c.length;u++){const d=Pe(a[u],c[u]);if(d!==0)return d}return Pe(a.length,c.length)}(n.referenceValue,e.referenceValue);case 8:return function(i,o){const a=Pe(vt(i.latitude),vt(o.latitude));return a!==0?a:Pe(vt(i.longitude),vt(o.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return sg(n.arrayValue,e.arrayValue);case 10:return function(i,o){var a,c,u,d;const f=i.fields||{},g=o.fields||{},_=(a=f.value)===null||a===void 0?void 0:a.arrayValue,k=(c=g.value)===null||c===void 0?void 0:c.arrayValue,T=Pe(((u=_==null?void 0:_.values)===null||u===void 0?void 0:u.length)||0,((d=k==null?void 0:k.values)===null||d===void 0?void 0:d.length)||0);return T!==0?T:sg(_,k)}(n.mapValue,e.mapValue);case 11:return function(i,o){if(i===ps.mapValue&&o===ps.mapValue)return 0;if(i===ps.mapValue)return 1;if(o===ps.mapValue)return-1;const a=i.fields||{},c=Object.keys(a),u=o.fields||{},d=Object.keys(u);c.sort(),d.sort();for(let f=0;f<c.length&&f<d.length;++f){const g=Pe(c[f],d[f]);if(g!==0)return g;const _=Ts(a[c[f]],u[d[f]]);if(_!==0)return _}return Pe(c.length,d.length)}(n.mapValue,e.mapValue);default:throw pe()}}function rg(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return Pe(n,e);const t=Or(n),r=Or(e),s=Pe(t.seconds,r.seconds);return s!==0?s:Pe(t.nanos,r.nanos)}function sg(n,e){const t=n.values||[],r=e.values||[];for(let s=0;s<t.length&&s<r.length;++s){const i=Ts(t[s],r[s]);if(i)return i}return Pe(t.length,r.length)}function mo(n){return gh(n)}function gh(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=Or(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return Mr(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return he.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",s=!0;for(const i of t.values||[])s?s=!1:r+=",",r+=gh(i);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let s="{",i=!0;for(const o of r)i?i=!1:s+=",",s+=`${o}:${gh(t.fields[o])}`;return s+"}"}(n.mapValue):pe()}function Ec(n){switch(Es(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const e=xu(n);return e?16+Ec(e):16;case 5:return 2*n.stringValue.length;case 6:return Mr(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((s,i)=>s+Ec(i),0)}(n.arrayValue);case 10:case 11:return function(r){let s=0;return Vs(r.fields,(i,o)=>{s+=i.length+Ec(o)}),s}(n.mapValue);default:throw pe()}}function ii(n,e){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${e.path.canonicalString()}`}}function _h(n){return!!n&&"integerValue"in n}function Ya(n){return!!n&&"arrayValue"in n}function ig(n){return!!n&&"nullValue"in n}function og(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Tc(n){return!!n&&"mapValue"in n}function Ru(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="__vector__"}function ka(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return Vs(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=ka(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=ka(n.arrayValue.values[t]);return e}return Object.assign({},n)}function Dv(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}const Vv={mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{}}}}};function ES(n){return"nullValue"in n?Ic:"booleanValue"in n?{booleanValue:!1}:"integerValue"in n||"doubleValue"in n?{doubleValue:NaN}:"timestampValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"stringValue"in n?{stringValue:""}:"bytesValue"in n?{bytesValue:""}:"referenceValue"in n?ii(si.empty(),he.empty()):"geoPointValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"arrayValue"in n?{arrayValue:{}}:"mapValue"in n?Ru(n)?Vv:{mapValue:{}}:pe()}function TS(n){return"nullValue"in n?{booleanValue:!1}:"booleanValue"in n?{doubleValue:NaN}:"integerValue"in n||"doubleValue"in n?{timestampValue:{seconds:Number.MIN_SAFE_INTEGER}}:"timestampValue"in n?{stringValue:""}:"stringValue"in n?{bytesValue:""}:"bytesValue"in n?ii(si.empty(),he.empty()):"referenceValue"in n?{geoPointValue:{latitude:-90,longitude:-180}}:"geoPointValue"in n?{arrayValue:{}}:"arrayValue"in n?Vv:"mapValue"in n?Ru(n)?{mapValue:{}}:ps:pe()}function ag(n,e){const t=Ts(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?-1:!n.inclusive&&e.inclusive?1:0}function lg(n,e){const t=Ts(n.value,e.value);return t!==0?t:n.inclusive&&!e.inclusive?1:!n.inclusive&&e.inclusive?-1:0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ln{constructor(e){this.value=e}static empty(){return new ln({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Tc(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=ka(t)}setAll(e){let t=wt.emptyPath(),r={},s=[];e.forEach((o,a)=>{if(!t.isImmediateParentOf(a)){const c=this.getFieldsMap(t);this.applyChanges(c,r,s),r={},s=[],t=a.popLast()}o?r[a.lastSegment()]=ka(o):s.push(a.lastSegment())});const i=this.getFieldsMap(t);this.applyChanges(i,r,s)}delete(e){const t=this.field(e.popLast());Tc(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return pr(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=t.mapValue.fields[e.get(r)];Tc(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=s),t=s}return t.mapValue.fields}applyChanges(e,t,r){Vs(t,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new ln(ka(this.value))}}function Nv(n){const e=[];return Vs(n.fields,(t,r)=>{const s=new wt([t]);if(Tc(r)){const i=Nv(r.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)}),new kn(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mt{constructor(e,t,r,s,i,o,a){this.key=e,this.documentType=t,this.version=r,this.readTime=s,this.createTime=i,this.data=o,this.documentState=a}static newInvalidDocument(e){return new mt(e,0,ve.min(),ve.min(),ve.min(),ln.empty(),0)}static newFoundDocument(e,t,r,s){return new mt(e,1,t,ve.min(),r,s,0)}static newNoDocument(e,t){return new mt(e,2,t,ve.min(),ve.min(),ln.empty(),0)}static newUnknownDocument(e,t){return new mt(e,3,t,ve.min(),ve.min(),ln.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(ve.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=ln.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=ln.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=ve.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof mt&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new mt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class As{constructor(e,t){this.position=e,this.inclusive=t}}function cg(n,e,t){let r=0;for(let s=0;s<n.position.length;s++){const i=e[s],o=n.position[s];if(i.field.isKeyField()?r=he.comparator(he.fromName(o.referenceValue),t.key):r=Ts(o,t.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function ug(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!pr(n.position[t],e.position[t]))return!1;return!0}/**
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
 */class Xa{constructor(e,t="asc"){this.field=e,this.dir=t}}function AS(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
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
 */class Ov{}class Ge extends Ov{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new PS(e,t,r):t==="array-contains"?new RS(e,r):t==="in"?new jv(e,r):t==="not-in"?new CS(e,r):t==="array-contains-any"?new kS(e,r):new Ge(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new SS(e,r):new xS(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(Ts(t,this.value)):t!==null&&Es(this.value)===Es(t)&&this.matchesComparison(Ts(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return pe()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class it extends Ov{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new it(e,t)}matches(e){return go(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function go(n){return n.op==="and"}function yh(n){return n.op==="or"}function hf(n){return Mv(n)&&go(n)}function Mv(n){for(const e of n.filters)if(e instanceof it)return!1;return!0}function vh(n){if(n instanceof Ge)return n.field.canonicalString()+n.op.toString()+mo(n.value);if(hf(n))return n.filters.map(e=>vh(e)).join(",");{const e=n.filters.map(t=>vh(t)).join(",");return`${n.op}(${e})`}}function Lv(n,e){return n instanceof Ge?function(r,s){return s instanceof Ge&&r.op===s.op&&r.field.isEqual(s.field)&&pr(r.value,s.value)}(n,e):n instanceof it?function(r,s){return s instanceof it&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,o,a)=>i&&Lv(o,s.filters[a]),!0):!1}(n,e):void pe()}function Fv(n,e){const t=n.filters.concat(e);return it.create(t,n.op)}function Uv(n){return n instanceof Ge?function(t){return`${t.field.canonicalString()} ${t.op} ${mo(t.value)}`}(n):n instanceof it?function(t){return t.op.toString()+" {"+t.getFilters().map(Uv).join(" ,")+"}"}(n):"Filter"}class PS extends Ge{constructor(e,t,r){super(e,t,r),this.key=he.fromName(r.referenceValue)}matches(e){const t=he.comparator(e.key,this.key);return this.matchesComparison(t)}}class SS extends Ge{constructor(e,t){super(e,"in",t),this.keys=Bv("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class xS extends Ge{constructor(e,t){super(e,"not-in",t),this.keys=Bv("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function Bv(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>he.fromName(r.referenceValue))}class RS extends Ge{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Ya(t)&&Ja(t.arrayValue,this.value)}}class jv extends Ge{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Ja(this.value.arrayValue,t)}}class CS extends Ge{constructor(e,t){super(e,"not-in",t)}matches(e){if(Ja(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!Ja(this.value.arrayValue,t)}}class kS extends Ge{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Ya(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Ja(this.value.arrayValue,r))}}/**
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
 */class DS{constructor(e,t=null,r=[],s=[],i=null,o=null,a=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=o,this.endAt=a,this.ue=null}}function wh(n,e=null,t=[],r=[],s=null,i=null,o=null){return new DS(n,e,t,r,s,i,o)}function oi(n){const e=ae(n);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>vh(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),pl(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>mo(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>mo(r)).join(",")),e.ue=t}return e.ue}function ml(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!AS(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!Lv(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!ug(n.startAt,e.startAt)&&ug(n.endAt,e.endAt)}function zc(n){return he.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}function Gc(n,e){return n.filters.filter(t=>t instanceof Ge&&t.field.isEqual(e))}function dg(n,e,t){let r=Ic,s=!0;for(const i of Gc(n,e)){let o=Ic,a=!0;switch(i.op){case"<":case"<=":o=ES(i.value);break;case"==":case"in":case">=":o=i.value;break;case">":o=i.value,a=!1;break;case"!=":case"not-in":o=Ic}ag({value:r,inclusive:s},{value:o,inclusive:a})<0&&(r=o,s=a)}if(t!==null){for(let i=0;i<n.orderBy.length;++i)if(n.orderBy[i].field.isEqual(e)){const o=t.position[i];ag({value:r,inclusive:s},{value:o,inclusive:t.inclusive})<0&&(r=o,s=t.inclusive);break}}return{value:r,inclusive:s}}function hg(n,e,t){let r=ps,s=!0;for(const i of Gc(n,e)){let o=ps,a=!0;switch(i.op){case">=":case">":o=TS(i.value),a=!1;break;case"==":case"in":case"<=":o=i.value;break;case"<":o=i.value,a=!1;break;case"!=":case"not-in":o=ps}lg({value:r,inclusive:s},{value:o,inclusive:a})>0&&(r=o,s=a)}if(t!==null){for(let i=0;i<n.orderBy.length;++i)if(n.orderBy[i].field.isEqual(e)){const o=t.position[i];lg({value:r,inclusive:s},{value:o,inclusive:t.inclusive})>0&&(r=o,s=t.inclusive);break}}return{value:r,inclusive:s}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $r{constructor(e,t=null,r=[],s=[],i=null,o="F",a=null,c=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=o,this.startAt=a,this.endAt=c,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function $v(n,e,t,r,s,i,o,a){return new $r(n,e,t,r,s,i,o,a)}function ko(n){return new $r(n)}function fg(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function ff(n){return n.collectionGroup!==null}function eo(n){const e=ae(n);if(e.ce===null){e.ce=[];const t=new Set;for(const i of e.explicitOrderBy)e.ce.push(i),t.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let a=new lt(wt.comparator);return o.filters.forEach(c=>{c.getFlattenedFilters().forEach(u=>{u.isInequality()&&(a=a.add(u.field))})}),a})(e).forEach(i=>{t.has(i.canonicalString())||i.isKeyField()||e.ce.push(new Xa(i,r))}),t.has(wt.keyField().canonicalString())||e.ce.push(new Xa(wt.keyField(),r))}return e.ce}function vn(n){const e=ae(n);return e.le||(e.le=zv(e,eo(n))),e.le}function qv(n){const e=ae(n);return e.he||(e.he=zv(e,n.explicitOrderBy)),e.he}function zv(n,e){if(n.limitType==="F")return wh(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new Xa(s.field,i)});const t=n.endAt?new As(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new As(n.startAt.position,n.startAt.inclusive):null;return wh(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function bh(n,e){const t=n.filters.concat([e]);return new $r(n.path,n.collectionGroup,n.explicitOrderBy.slice(),t,n.limit,n.limitType,n.startAt,n.endAt)}function Kc(n,e,t){return new $r(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function gl(n,e){return ml(vn(n),vn(e))&&n.limitType===e.limitType}function Gv(n){return`${oi(vn(n))}|lt:${n.limitType}`}function Gi(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(s=>Uv(s)).join(", ")}]`),pl(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(s=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(s)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(s=>mo(s)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(s=>mo(s)).join(",")),`Target(${r})`}(vn(n))}; limitType=${n.limitType})`}function _l(n,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):he.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(n,e)&&function(r,s){for(const i of eo(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(n,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(n,e)&&function(r,s){return!(r.startAt&&!function(o,a,c){const u=cg(o,a,c);return o.inclusive?u<=0:u<0}(r.startAt,eo(r),s)||r.endAt&&!function(o,a,c){const u=cg(o,a,c);return o.inclusive?u>=0:u>0}(r.endAt,eo(r),s))}(n,e)}function Kv(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function Hv(n){return(e,t)=>{let r=!1;for(const s of eo(n)){const i=VS(s,e,t);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function VS(n,e,t){const r=n.field.isKeyField()?he.comparator(e.key,t.key):function(i,o,a){const c=o.data.field(i),u=a.data.field(i);return c!==null&&u!==null?Ts(c,u):pe()}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return pe()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qr{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,t]);s.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[t]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Vs(this.inner,(t,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return Cv(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const NS=new pt(he.comparator);function Dn(){return NS}const Wv=new pt(he.comparator);function _a(...n){let e=Wv;for(const t of n)e=e.insert(t.key,t);return e}function Qv(n){let e=Wv;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function ar(){return Da()}function Jv(){return Da()}function Da(){return new qr(n=>n.toString(),(n,e)=>n.isEqual(e))}const OS=new pt(he.comparator),MS=new lt(he.comparator);function Ne(...n){let e=MS;for(const t of n)e=e.add(t);return e}const LS=new lt(Pe);function pf(){return LS}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function mf(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Wa(e)?"-0":e}}function Yv(n){return{integerValue:""+n}}function Xv(n,e){return Tv(e)?Yv(e):mf(n,e)}/**
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
 */class Cu{constructor(){this._=void 0}}function FS(n,e,t){return n instanceof _o?function(s,i){const o={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Su(i)&&(i=xu(i)),i&&(o.fields.__previous_value__=i),{mapValue:o}}(t,e):n instanceof ai?e0(n,e):n instanceof li?t0(n,e):function(s,i){const o=Zv(s,i),a=pg(o)+pg(s.Pe);return _h(o)&&_h(s.Pe)?Yv(a):mf(s.serializer,a)}(n,e)}function US(n,e,t){return n instanceof ai?e0(n,e):n instanceof li?t0(n,e):t}function Zv(n,e){return n instanceof yo?function(r){return _h(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class _o extends Cu{}class ai extends Cu{constructor(e){super(),this.elements=e}}function e0(n,e){const t=n0(e);for(const r of n.elements)t.some(s=>pr(s,r))||t.push(r);return{arrayValue:{values:t}}}class li extends Cu{constructor(e){super(),this.elements=e}}function t0(n,e){let t=n0(e);for(const r of n.elements)t=t.filter(s=>!pr(s,r));return{arrayValue:{values:t}}}class yo extends Cu{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function pg(n){return vt(n.integerValue||n.doubleValue)}function n0(n){return Ya(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yl{constructor(e,t){this.field=e,this.transform=t}}function BS(n,e){return n.field.isEqual(e.field)&&function(r,s){return r instanceof ai&&s instanceof ai||r instanceof li&&s instanceof li?ho(r.elements,s.elements,pr):r instanceof yo&&s instanceof yo?pr(r.Pe,s.Pe):r instanceof _o&&s instanceof _o}(n.transform,e.transform)}class jS{constructor(e,t){this.version=e,this.transformResults=t}}class bt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new bt}static exists(e){return new bt(void 0,e)}static updateTime(e){return new bt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Ac(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class ku{}function r0(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new Vo(n.key,bt.none()):new Do(n.key,n.data,bt.none());{const t=n.data,r=ln.empty();let s=new lt(wt.comparator);for(let i of e.fields)if(!s.has(i)){let o=t.field(i);o===null&&i.length>1&&(i=i.popLast(),o=t.field(i)),o===null?r.delete(i):r.set(i,o),s=s.add(i)}return new zr(n.key,r,new kn(s.toArray()),bt.none())}}function $S(n,e,t){n instanceof Do?function(s,i,o){const a=s.value.clone(),c=gg(s.fieldTransforms,i,o.transformResults);a.setAll(c),i.convertToFoundDocument(o.version,a).setHasCommittedMutations()}(n,e,t):n instanceof zr?function(s,i,o){if(!Ac(s.precondition,i))return void i.convertToUnknownDocument(o.version);const a=gg(s.fieldTransforms,i,o.transformResults),c=i.data;c.setAll(s0(s)),c.setAll(a),i.convertToFoundDocument(o.version,c).setHasCommittedMutations()}(n,e,t):function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,t)}function Va(n,e,t,r){return n instanceof Do?function(i,o,a,c){if(!Ac(i.precondition,o))return a;const u=i.value.clone(),d=_g(i.fieldTransforms,c,o);return u.setAll(d),o.convertToFoundDocument(o.version,u).setHasLocalMutations(),null}(n,e,t,r):n instanceof zr?function(i,o,a,c){if(!Ac(i.precondition,o))return a;const u=_g(i.fieldTransforms,c,o),d=o.data;return d.setAll(s0(i)),d.setAll(u),o.convertToFoundDocument(o.version,d).setHasLocalMutations(),a===null?null:a.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(f=>f.field))}(n,e,t,r):function(i,o,a){return Ac(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):a}(n,e,t)}function qS(n,e){let t=null;for(const r of n.fieldTransforms){const s=e.data.field(r.field),i=Zv(r.transform,s||null);i!=null&&(t===null&&(t=ln.empty()),t.set(r.field,i))}return t||null}function mg(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&ho(r,s,(i,o)=>BS(i,o))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Do extends ku{constructor(e,t,r,s=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class zr extends ku{constructor(e,t,r,s,i=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function s0(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function gg(n,e,t){const r=new Map;ge(n.length===t.length);for(let s=0;s<t.length;s++){const i=n[s],o=i.transform,a=e.data.field(i.field);r.set(i.field,US(o,a,t[s]))}return r}function _g(n,e,t){const r=new Map;for(const s of n){const i=s.transform,o=t.data.field(s.field);r.set(s.field,FS(i,o,e))}return r}class Vo extends ku{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class gf extends ku{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _f{constructor(e,t,r,s){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&$S(i,e,r[s])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Va(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Va(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=Jv();return this.mutations.forEach(s=>{const i=e.get(s.key),o=i.overlayedDocument;let a=this.applyToLocalView(o,i.mutatedFields);a=t.has(s.key)?null:a;const c=r0(o,a);c!==null&&r.set(s.key,c),o.isValidDocument()||o.convertToNoDocument(ve.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),Ne())}isEqual(e){return this.batchId===e.batchId&&ho(this.mutations,e.mutations,(t,r)=>mg(t,r))&&ho(this.baseMutations,e.baseMutations,(t,r)=>mg(t,r))}}class yf{constructor(e,t,r,s){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=s}static from(e,t,r){ge(e.mutations.length===r.length);let s=function(){return OS}();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,r[o].version);return new yf(e,t,r,s)}}/**
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
 */class vf{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
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
 */class i0{constructor(e,t,r){this.alias=e,this.aggregateType=t,this.fieldPath=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zS{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Ft,Ke;function o0(n){switch(n){default:return pe();case U.CANCELLED:case U.UNKNOWN:case U.DEADLINE_EXCEEDED:case U.RESOURCE_EXHAUSTED:case U.INTERNAL:case U.UNAVAILABLE:case U.UNAUTHENTICATED:return!1;case U.INVALID_ARGUMENT:case U.NOT_FOUND:case U.ALREADY_EXISTS:case U.PERMISSION_DENIED:case U.FAILED_PRECONDITION:case U.ABORTED:case U.OUT_OF_RANGE:case U.UNIMPLEMENTED:case U.DATA_LOSS:return!0}}function a0(n){if(n===void 0)return Nt("GRPC error has no .code"),U.UNKNOWN;switch(n){case Ft.OK:return U.OK;case Ft.CANCELLED:return U.CANCELLED;case Ft.UNKNOWN:return U.UNKNOWN;case Ft.DEADLINE_EXCEEDED:return U.DEADLINE_EXCEEDED;case Ft.RESOURCE_EXHAUSTED:return U.RESOURCE_EXHAUSTED;case Ft.INTERNAL:return U.INTERNAL;case Ft.UNAVAILABLE:return U.UNAVAILABLE;case Ft.UNAUTHENTICATED:return U.UNAUTHENTICATED;case Ft.INVALID_ARGUMENT:return U.INVALID_ARGUMENT;case Ft.NOT_FOUND:return U.NOT_FOUND;case Ft.ALREADY_EXISTS:return U.ALREADY_EXISTS;case Ft.PERMISSION_DENIED:return U.PERMISSION_DENIED;case Ft.FAILED_PRECONDITION:return U.FAILED_PRECONDITION;case Ft.ABORTED:return U.ABORTED;case Ft.OUT_OF_RANGE:return U.OUT_OF_RANGE;case Ft.UNIMPLEMENTED:return U.UNIMPLEMENTED;case Ft.DATA_LOSS:return U.DATA_LOSS;default:return pe()}}(Ke=Ft||(Ft={}))[Ke.OK=0]="OK",Ke[Ke.CANCELLED=1]="CANCELLED",Ke[Ke.UNKNOWN=2]="UNKNOWN",Ke[Ke.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Ke[Ke.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Ke[Ke.NOT_FOUND=5]="NOT_FOUND",Ke[Ke.ALREADY_EXISTS=6]="ALREADY_EXISTS",Ke[Ke.PERMISSION_DENIED=7]="PERMISSION_DENIED",Ke[Ke.UNAUTHENTICATED=16]="UNAUTHENTICATED",Ke[Ke.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Ke[Ke.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Ke[Ke.ABORTED=10]="ABORTED",Ke[Ke.OUT_OF_RANGE=11]="OUT_OF_RANGE",Ke[Ke.UNIMPLEMENTED=12]="UNIMPLEMENTED",Ke[Ke.INTERNAL=13]="INTERNAL",Ke[Ke.UNAVAILABLE=14]="UNAVAILABLE",Ke[Ke.DATA_LOSS=15]="DATA_LOSS";/**
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
 */let Hc=null;/**
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
 */function l0(){return new TextEncoder}/**
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
 */const GS=new Zs([4294967295,4294967295],0);function yg(n){const e=l0().encode(n),t=new cv;return t.update(e),new Uint8Array(t.digest())}function vg(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Zs([t,r],0),new Zs([s,i],0)]}class wf{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new ya(`Invalid padding: ${t}`);if(r<0)throw new ya(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new ya(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new ya(`Invalid padding when bitmap length is 0: ${t}`);this.Ie=8*e.length-t,this.Te=Zs.fromNumber(this.Ie)}Ee(e,t,r){let s=e.add(t.multiply(Zs.fromNumber(r)));return s.compare(GS)===1&&(s=new Zs([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const t=yg(e),[r,s]=vg(t);for(let i=0;i<this.hashCount;i++){const o=this.Ee(r,s,i);if(!this.de(o))return!1}return!0}static create(e,t,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new wf(i,s,t);return r.forEach(a=>o.insert(a)),o}insert(e){if(this.Ie===0)return;const t=yg(e),[r,s]=vg(t);for(let i=0;i<this.hashCount;i++){const o=this.Ee(r,s,i);this.Ae(o)}}Ae(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class ya extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vl{constructor(e,t,r,s,i){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const s=new Map;return s.set(e,wl.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new vl(ve.min(),s,new pt(Pe),Dn(),Ne())}}class wl{constructor(e,t,r,s,i){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new wl(r,t,Ne(),Ne(),Ne())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pc{constructor(e,t,r,s){this.Re=e,this.removedTargetIds=t,this.key=r,this.Ve=s}}class c0{constructor(e,t){this.targetId=e,this.me=t}}class u0{constructor(e,t,r=Ct.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=s}}class wg{constructor(){this.fe=0,this.ge=Ig(),this.pe=Ct.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=Ne(),t=Ne(),r=Ne();return this.ge.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:t=t.add(s);break;case 1:r=r.add(s);break;default:pe()}}),new wl(this.pe,this.ye,e,t,r)}Ce(){this.we=!1,this.ge=Ig()}Fe(e,t){this.we=!0,this.ge=this.ge.insert(e,t)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,ge(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class KS{constructor(e){this.Le=e,this.Be=new Map,this.ke=Dn(),this.qe=bg(),this.Qe=new pt(Pe)}Ke(e){for(const t of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(t,e.Ve):this.Ue(t,e.key,e.Ve);for(const t of e.removedTargetIds)this.Ue(t,e.key,e.Ve)}We(e){this.forEachTarget(e,t=>{const r=this.Ge(t);switch(e.state){case 0:this.ze(t)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(t);break;case 3:this.ze(t)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(t)&&(this.je(t),r.De(e.resumeToken));break;default:pe()}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Be.forEach((r,s)=>{this.ze(s)&&t(s)})}He(e){const t=e.targetId,r=e.me.count,s=this.Je(t);if(s){const i=s.target;if(zc(i))if(r===0){const o=new he(i.path);this.Ue(t,o,mt.newNoDocument(o,ve.min()))}else ge(r===1);else{const o=this.Ye(t);if(o!==r){const a=this.Ze(e),c=a?this.Xe(a,e,o):1;if(c!==0){this.je(t);const u=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(t,u)}Hc==null||Hc.et(function(d,f,g,_,k){var T,C,F,j,L,M;const q={localCacheCount:d,existenceFilterCount:f.count,databaseId:g.database,projectId:g.projectId},te=f.unchangedNames;return te&&(q.bloomFilter={applied:k===0,hashCount:(T=te==null?void 0:te.hashCount)!==null&&T!==void 0?T:0,bitmapLength:(j=(F=(C=te==null?void 0:te.bits)===null||C===void 0?void 0:C.bitmap)===null||F===void 0?void 0:F.length)!==null&&j!==void 0?j:0,padding:(M=(L=te==null?void 0:te.bits)===null||L===void 0?void 0:L.padding)!==null&&M!==void 0?M:0,mightContain:x=>{var E;return(E=_==null?void 0:_.mightContain(x))!==null&&E!==void 0&&E}}),q}(o,e.me,this.Le.tt(),a,c))}}}}Ze(e){const t=e.me.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=t;let o,a;try{o=Mr(r).toUint8Array()}catch(c){if(c instanceof kv)return qn("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{a=new wf(o,s,i)}catch(c){return qn(c instanceof ya?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return a.Ie===0?null:a}Xe(e,t,r){return t.me.count===r-this.nt(e,t.targetId)?0:2}nt(e,t){const r=this.Le.getRemoteKeysForTarget(t);let s=0;return r.forEach(i=>{const o=this.Le.tt(),a=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(a)||(this.Ue(t,i,null),s++)}),s}rt(e){const t=new Map;this.Be.forEach((i,o)=>{const a=this.Je(o);if(a){if(i.current&&zc(a.target)){const c=new he(a.target.path);this.ke.get(c)!==null||this.it(o,c)||this.Ue(o,c,mt.newNoDocument(c,e))}i.be&&(t.set(o,i.ve()),i.Ce())}});let r=Ne();this.qe.forEach((i,o)=>{let a=!0;o.forEachWhile(c=>{const u=this.Je(c);return!u||u.purpose==="TargetPurposeLimboResolution"||(a=!1,!1)}),a&&(r=r.add(i))}),this.ke.forEach((i,o)=>o.setReadTime(e));const s=new vl(e,t,this.Qe,this.ke,r);return this.ke=Dn(),this.qe=bg(),this.Qe=new pt(Pe),s}$e(e,t){if(!this.ze(e))return;const r=this.it(e,t.key)?2:0;this.Ge(e).Fe(t.key,r),this.ke=this.ke.insert(t.key,t),this.qe=this.qe.insert(t.key,this.st(t.key).add(e))}Ue(e,t,r){if(!this.ze(e))return;const s=this.Ge(e);this.it(e,t)?s.Fe(t,1):s.Me(t),this.qe=this.qe.insert(t,this.st(t).delete(e)),r&&(this.ke=this.ke.insert(t,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const t=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let t=this.Be.get(e);return t||(t=new wg,this.Be.set(e,t)),t}st(e){let t=this.qe.get(e);return t||(t=new lt(Pe),this.qe=this.qe.insert(e,t)),t}ze(e){const t=this.Je(e)!==null;return t||J("WatchChangeAggregator","Detected inactive target",e),t}Je(e){const t=this.Be.get(e);return t&&t.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new wg),this.Le.getRemoteKeysForTarget(e).forEach(t=>{this.Ue(e,t,null)})}it(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}}function bg(){return new pt(he.comparator)}function Ig(){return new pt(he.comparator)}const HS=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),WS=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),QS=(()=>({and:"AND",or:"OR"}))();class JS{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function Ih(n,e){return n.useProto3Json||pl(e)?e:{value:e}}function vo(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function d0(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function YS(n,e){return vo(n,e.toTimestamp())}function Mt(n){return ge(!!n),ve.fromTimestamp(function(t){const r=Or(t);return new Pt(r.seconds,r.nanos)}(n))}function bf(n,e){return Eh(n,e).canonicalString()}function Eh(n,e){const t=function(s){return new ze(["projects",s.projectId,"databases",s.database])}(n).child("documents");return e===void 0?t:t.child(e)}function h0(n){const e=ze.fromString(n);return ge(I0(e)),e}function Za(n,e){return bf(n.databaseId,e.path)}function dr(n,e){const t=h0(e);if(t.get(1)!==n.databaseId.projectId)throw new Y(U.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new Y(U.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new he(m0(t))}function f0(n,e){return bf(n.databaseId,e)}function p0(n){const e=h0(n);return e.length===4?ze.emptyPath():m0(e)}function Th(n){return new ze(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function m0(n){return ge(n.length>4&&n.get(4)==="documents"),n.popFirst(5)}function Eg(n,e,t){return{name:Za(n,e),fields:t.value.mapValue.fields}}function g0(n,e,t){const r=dr(n,e.name),s=Mt(e.updateTime),i=e.createTime?Mt(e.createTime):ve.min(),o=new ln({mapValue:{fields:e.fields}}),a=mt.newFoundDocument(r,s,i,o);return t&&a.setHasCommittedMutations(),t?a.setHasCommittedMutations():a}function XS(n,e){return"found"in e?function(r,s){ge(!!s.found),s.found.name,s.found.updateTime;const i=dr(r,s.found.name),o=Mt(s.found.updateTime),a=s.found.createTime?Mt(s.found.createTime):ve.min(),c=new ln({mapValue:{fields:s.found.fields}});return mt.newFoundDocument(i,o,a,c)}(n,e):"missing"in e?function(r,s){ge(!!s.missing),ge(!!s.readTime);const i=dr(r,s.missing),o=Mt(s.readTime);return mt.newNoDocument(i,o)}(n,e):pe()}function ZS(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(u){return u==="NO_CHANGE"?0:u==="ADD"?1:u==="REMOVE"?2:u==="CURRENT"?3:u==="RESET"?4:pe()}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(u,d){return u.useProto3Json?(ge(d===void 0||typeof d=="string"),Ct.fromBase64String(d||"")):(ge(d===void 0||d instanceof Buffer||d instanceof Uint8Array),Ct.fromUint8Array(d||new Uint8Array))}(n,e.targetChange.resumeToken),o=e.targetChange.cause,a=o&&function(u){const d=u.code===void 0?U.UNKNOWN:a0(u.code);return new Y(d,u.message||"")}(o);t=new u0(r,s,i,a||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=dr(n,r.document.name),i=Mt(r.document.updateTime),o=r.document.createTime?Mt(r.document.createTime):ve.min(),a=new ln({mapValue:{fields:r.document.fields}}),c=mt.newFoundDocument(s,i,o,a),u=r.targetIds||[],d=r.removedTargetIds||[];t=new Pc(u,d,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=dr(n,r.document),i=r.readTime?Mt(r.readTime):ve.min(),o=mt.newNoDocument(s,i),a=r.removedTargetIds||[];t=new Pc([],a,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=dr(n,r.document),i=r.removedTargetIds||[];t=new Pc([],i,s,null)}else{if(!("filter"in e))return pe();{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,o=new zS(s,i),a=r.targetId;t=new c0(a,o)}}return t}function el(n,e){let t;if(e instanceof Do)t={update:Eg(n,e.key,e.value)};else if(e instanceof Vo)t={delete:Za(n,e.key)};else if(e instanceof zr)t={update:Eg(n,e.key,e.data),updateMask:ix(e.fieldMask)};else{if(!(e instanceof gf))return pe();t={verify:Za(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(i,o){const a=o.transform;if(a instanceof _o)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(a instanceof ai)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:a.elements}};if(a instanceof li)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:a.elements}};if(a instanceof yo)return{fieldPath:o.field.canonicalString(),increment:a.Pe};throw pe()}(0,r))),e.precondition.isNone||(t.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:YS(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:pe()}(n,e.precondition)),t}function Ah(n,e){const t=e.currentDocument?function(i){return i.updateTime!==void 0?bt.updateTime(Mt(i.updateTime)):i.exists!==void 0?bt.exists(i.exists):bt.none()}(e.currentDocument):bt.none(),r=e.updateTransforms?e.updateTransforms.map(s=>function(o,a){let c=null;if("setToServerValue"in a)ge(a.setToServerValue==="REQUEST_TIME"),c=new _o;else if("appendMissingElements"in a){const d=a.appendMissingElements.values||[];c=new ai(d)}else if("removeAllFromArray"in a){const d=a.removeAllFromArray.values||[];c=new li(d)}else"increment"in a?c=new yo(o,a.increment):pe();const u=wt.fromServerFormat(a.fieldPath);return new yl(u,c)}(n,s)):[];if(e.update){e.update.name;const s=dr(n,e.update.name),i=new ln({mapValue:{fields:e.update.fields}});if(e.updateMask){const o=function(c){const u=c.fieldPaths||[];return new kn(u.map(d=>wt.fromServerFormat(d)))}(e.updateMask);return new zr(s,i,o,t,r)}return new Do(s,i,t,r)}if(e.delete){const s=dr(n,e.delete);return new Vo(s,t)}if(e.verify){const s=dr(n,e.verify);return new gf(s,t)}return pe()}function ex(n,e){return n&&n.length>0?(ge(e!==void 0),n.map(t=>function(s,i){let o=s.updateTime?Mt(s.updateTime):Mt(i);return o.isEqual(ve.min())&&(o=Mt(i)),new jS(o,s.transformResults||[])}(t,e))):[]}function _0(n,e){return{documents:[f0(n,e.path)]}}function Du(n,e){const t={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=f0(n,s);const i=function(u){if(u.length!==0)return b0(it.create(u,"and"))}(e.filters);i&&(t.structuredQuery.where=i);const o=function(u){if(u.length!==0)return u.map(d=>function(g){return{field:as(g.field),direction:nx(g.dir)}}(d))}(e.orderBy);o&&(t.structuredQuery.orderBy=o);const a=Ih(n,e.limit);return a!==null&&(t.structuredQuery.limit=a),e.startAt&&(t.structuredQuery.startAt=function(u){return{before:u.inclusive,values:u.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(u){return{before:!u.inclusive,values:u.position}}(e.endAt)),{_t:t,parent:s}}function y0(n,e,t,r){const{_t:s,parent:i}=Du(n,e),o={},a=[];let c=0;return t.forEach(u=>{const d=r?u.alias:"aggregate_"+c++;o[d]=u.alias,u.aggregateType==="count"?a.push({alias:d,count:{}}):u.aggregateType==="avg"?a.push({alias:d,avg:{field:as(u.fieldPath)}}):u.aggregateType==="sum"&&a.push({alias:d,sum:{field:as(u.fieldPath)}})}),{request:{structuredAggregationQuery:{aggregations:a,structuredQuery:s.structuredQuery},parent:s.parent},ut:o,parent:i}}function v0(n){let e=p0(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let s=null;if(r>0){ge(r===1);const d=t.from[0];d.allDescendants?s=d.collectionId:e=e.child(d.collectionId)}let i=[];t.where&&(i=function(f){const g=w0(f);return g instanceof it&&hf(g)?g.getFilters():[g]}(t.where));let o=[];t.orderBy&&(o=function(f){return f.map(g=>function(k){return new Xa(Ki(k.field),function(C){switch(C){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(k.direction))}(g))}(t.orderBy));let a=null;t.limit&&(a=function(f){let g;return g=typeof f=="object"?f.value:f,pl(g)?null:g}(t.limit));let c=null;t.startAt&&(c=function(f){const g=!!f.before,_=f.values||[];return new As(_,g)}(t.startAt));let u=null;return t.endAt&&(u=function(f){const g=!f.before,_=f.values||[];return new As(_,g)}(t.endAt)),$v(e,s,o,i,a,"F",c,u)}function tx(n,e){const t=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return pe()}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function w0(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=Ki(t.unaryFilter.field);return Ge.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Ki(t.unaryFilter.field);return Ge.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Ki(t.unaryFilter.field);return Ge.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=Ki(t.unaryFilter.field);return Ge.create(o,"!=",{nullValue:"NULL_VALUE"});default:return pe()}}(n):n.fieldFilter!==void 0?function(t){return Ge.create(Ki(t.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return pe()}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return it.create(t.compositeFilter.filters.map(r=>w0(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return pe()}}(t.compositeFilter.op))}(n):pe()}function nx(n){return HS[n]}function rx(n){return WS[n]}function sx(n){return QS[n]}function as(n){return{fieldPath:n.canonicalString()}}function Ki(n){return wt.fromServerFormat(n.fieldPath)}function b0(n){return n instanceof Ge?function(t){if(t.op==="=="){if(og(t.value))return{unaryFilter:{field:as(t.field),op:"IS_NAN"}};if(ig(t.value))return{unaryFilter:{field:as(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(og(t.value))return{unaryFilter:{field:as(t.field),op:"IS_NOT_NAN"}};if(ig(t.value))return{unaryFilter:{field:as(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:as(t.field),op:rx(t.op),value:t.value}}}(n):n instanceof it?function(t){const r=t.getFilters().map(s=>b0(s));return r.length===1?r[0]:{compositeFilter:{op:sx(t.op),filters:r}}}(n):pe()}function ix(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function I0(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sr{constructor(e,t,r,s,i=ve.min(),o=ve.min(),a=Ct.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=a,this.expectedCount=c}withSequenceNumber(e){return new Sr(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Sr(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Sr(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Sr(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class E0{constructor(e){this.ct=e}}function ox(n,e){let t;if(e.document)t=g0(n.ct,e.document,!!e.hasCommittedMutations);else if(e.noDocument){const r=he.fromSegments(e.noDocument.path),s=ui(e.noDocument.readTime);t=mt.newNoDocument(r,s),e.hasCommittedMutations&&t.setHasCommittedMutations()}else{if(!e.unknownDocument)return pe();{const r=he.fromSegments(e.unknownDocument.path),s=ui(e.unknownDocument.version);t=mt.newUnknownDocument(r,s)}}return e.readTime&&t.setReadTime(function(s){const i=new Pt(s[0],s[1]);return ve.fromTimestamp(i)}(e.readTime)),t}function Tg(n,e){const t=e.key,r={prefixPath:t.getCollectionPath().popLast().toArray(),collectionGroup:t.collectionGroup,documentId:t.path.lastSegment(),readTime:Wc(e.readTime),hasCommittedMutations:e.hasCommittedMutations};if(e.isFoundDocument())r.document=function(i,o){return{name:Za(i,o.key),fields:o.data.value.mapValue.fields,updateTime:vo(i,o.version.toTimestamp()),createTime:vo(i,o.createTime.toTimestamp())}}(n.ct,e);else if(e.isNoDocument())r.noDocument={path:t.path.toArray(),readTime:ci(e.version)};else{if(!e.isUnknownDocument())return pe();r.unknownDocument={path:t.path.toArray(),version:ci(e.version)}}return r}function Wc(n){const e=n.toTimestamp();return[e.seconds,e.nanoseconds]}function ci(n){const e=n.toTimestamp();return{seconds:e.seconds,nanoseconds:e.nanoseconds}}function ui(n){const e=new Pt(n.seconds,n.nanoseconds);return ve.fromTimestamp(e)}function Hs(n,e){const t=(e.baseMutations||[]).map(i=>Ah(n.ct,i));for(let i=0;i<e.mutations.length-1;++i){const o=e.mutations[i];if(i+1<e.mutations.length&&e.mutations[i+1].transform!==void 0){const a=e.mutations[i+1];o.updateTransforms=a.transform.fieldTransforms,e.mutations.splice(i+1,1),++i}}const r=e.mutations.map(i=>Ah(n.ct,i)),s=Pt.fromMillis(e.localWriteTimeMs);return new _f(e.batchId,s,t,r)}function va(n){const e=ui(n.readTime),t=n.lastLimboFreeSnapshotVersion!==void 0?ui(n.lastLimboFreeSnapshotVersion):ve.min();let r;return r=function(i){return i.documents!==void 0}(n.query)?function(i){return ge(i.documents.length===1),vn(ko(p0(i.documents[0])))}(n.query):function(i){return vn(v0(i))}(n.query),new Sr(r,n.targetId,"TargetPurposeListen",n.lastListenSequenceNumber,e,t,Ct.fromBase64String(n.resumeToken))}function T0(n,e){const t=ci(e.snapshotVersion),r=ci(e.lastLimboFreeSnapshotVersion);let s;s=zc(e.target)?_0(n.ct,e.target):Du(n.ct,e.target)._t;const i=e.resumeToken.toBase64();return{targetId:e.targetId,canonicalId:oi(e.target),readTime:t,resumeToken:i,lastListenSequenceNumber:e.sequenceNumber,lastLimboFreeSnapshotVersion:r,query:s}}function If(n){const e=v0({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?Kc(e,e.limit,"L"):e}function Nd(n,e){return new vf(e.largestBatchId,Ah(n.ct,e.overlayMutation))}function Ag(n,e){const t=e.path.lastSegment();return[n,yn(e.path.popLast()),t]}function Pg(n,e,t,r){return{indexId:n,uid:e,sequenceNumber:t,readTime:ci(r.readTime),documentKey:yn(r.documentKey.path),largestBatchId:r.largestBatchId}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ax{getBundleMetadata(e,t){return Sg(e).get(t).next(r=>{if(r)return function(i){return{id:i.bundleId,createTime:ui(i.createTime),version:i.version}}(r)})}saveBundleMetadata(e,t){return Sg(e).put(function(s){return{bundleId:s.id,createTime:ci(Mt(s.createTime)),version:s.version}}(t))}getNamedQuery(e,t){return xg(e).get(t).next(r=>{if(r)return function(i){return{name:i.name,query:If(i.bundledQuery),readTime:ui(i.readTime)}}(r)})}saveNamedQuery(e,t){return xg(e).put(function(s){return{name:s.name,readTime:ci(Mt(s.readTime)),bundledQuery:s.bundledQuery}}(t))}}function Sg(n){return Gt(n,"bundles")}function xg(n){return Gt(n,"namedQueries")}/**
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
 */class Vu{constructor(e,t){this.serializer=e,this.userId=t}static lt(e,t){const r=t.uid||"";return new Vu(e,r)}getOverlay(e,t){return oa(e).get(Ag(this.userId,t)).next(r=>r?Nd(this.serializer,r):null)}getOverlays(e,t){const r=ar();return O.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,t,r){const s=[];return r.forEach((i,o)=>{const a=new vf(t,o);s.push(this.ht(e,a))}),O.waitFor(s)}removeOverlaysForBatchId(e,t,r){const s=new Set;t.forEach(o=>s.add(yn(o.getCollectionPath())));const i=[];return s.forEach(o=>{const a=IDBKeyRange.bound([this.userId,o,r],[this.userId,o,r+1],!1,!0);i.push(oa(e).j("collectionPathOverlayIndex",a))}),O.waitFor(i)}getOverlaysForCollection(e,t,r){const s=ar(),i=yn(t),o=IDBKeyRange.bound([this.userId,i,r],[this.userId,i,Number.POSITIVE_INFINITY],!0);return oa(e).U("collectionPathOverlayIndex",o).next(a=>{for(const c of a){const u=Nd(this.serializer,c);s.set(u.getKey(),u)}return s})}getOverlaysForCollectionGroup(e,t,r,s){const i=ar();let o;const a=IDBKeyRange.bound([this.userId,t,r],[this.userId,t,Number.POSITIVE_INFINITY],!0);return oa(e).J({index:"collectionGroupOverlayIndex",range:a},(c,u,d)=>{const f=Nd(this.serializer,u);i.size()<s||f.largestBatchId===o?(i.set(f.getKey(),f),o=f.largestBatchId):d.done()}).next(()=>i)}ht(e,t){return oa(e).put(function(s,i,o){const[a,c,u]=Ag(i,o.mutation.key);return{userId:i,collectionPath:c,documentId:u,collectionGroup:o.mutation.key.getCollectionGroup(),largestBatchId:o.largestBatchId,overlayMutation:el(s.ct,o.mutation)}}(this.serializer,this.userId,t))}}function oa(n){return Gt(n,"documentOverlays")}/**
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
 */class lx{Pt(e){return Gt(e,"globals")}getSessionToken(e){return this.Pt(e).get("sessionToken").next(t=>{const r=t==null?void 0:t.value;return r?Ct.fromUint8Array(r):Ct.EMPTY_BYTE_STRING})}setSessionToken(e,t){return this.Pt(e).put({name:"sessionToken",value:t.toUint8Array()})}}/**
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
 */class Ws{constructor(){}It(e,t){this.Tt(e,t),t.Et()}Tt(e,t){if("nullValue"in e)this.dt(t,5);else if("booleanValue"in e)this.dt(t,10),t.At(e.booleanValue?1:0);else if("integerValue"in e)this.dt(t,15),t.At(vt(e.integerValue));else if("doubleValue"in e){const r=vt(e.doubleValue);isNaN(r)?this.dt(t,13):(this.dt(t,15),Wa(r)?t.At(0):t.At(r))}else if("timestampValue"in e){let r=e.timestampValue;this.dt(t,20),typeof r=="string"&&(r=Or(r)),t.Rt(`${r.seconds||""}`),t.At(r.nanos||0)}else if("stringValue"in e)this.Vt(e.stringValue,t),this.ft(t);else if("bytesValue"in e)this.dt(t,30),t.gt(Mr(e.bytesValue)),this.ft(t);else if("referenceValue"in e)this.yt(e.referenceValue,t);else if("geoPointValue"in e){const r=e.geoPointValue;this.dt(t,45),t.At(r.latitude||0),t.At(r.longitude||0)}else"mapValue"in e?Dv(e)?this.dt(t,Number.MAX_SAFE_INTEGER):Ru(e)?this.wt(e.mapValue,t):(this.St(e.mapValue,t),this.ft(t)):"arrayValue"in e?(this.bt(e.arrayValue,t),this.ft(t)):pe()}Vt(e,t){this.dt(t,25),this.Dt(e,t)}Dt(e,t){t.Rt(e)}St(e,t){const r=e.fields||{};this.dt(t,55);for(const s of Object.keys(r))this.Vt(s,t),this.Tt(r[s],t)}wt(e,t){var r,s;const i=e.fields||{};this.dt(t,53);const o="value",a=((s=(r=i[o].arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.length)||0;this.dt(t,15),t.At(vt(a)),this.Vt(o,t),this.Tt(i[o],t)}bt(e,t){const r=e.values||[];this.dt(t,50);for(const s of r)this.Tt(s,t)}yt(e,t){this.dt(t,37),he.fromName(e).path.forEach(r=>{this.dt(t,60),this.Dt(r,t)})}dt(e,t){e.At(t)}ft(e){e.At(2)}}Ws.vt=new Ws;function cx(n){if(n===0)return 8;let e=0;return!(n>>4)&&(e+=4,n<<=4),!(n>>6)&&(e+=2,n<<=2),!(n>>7)&&(e+=1),e}function Rg(n){const e=64-function(r){let s=0;for(let i=0;i<8;++i){const o=cx(255&r[i]);if(s+=o,o!==8)break}return s}(n);return Math.ceil(e/8)}class ux{constructor(){this.buffer=new Uint8Array(1024),this.position=0}Ct(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.Ft(r.value),r=t.next();this.Mt()}xt(e){const t=e[Symbol.iterator]();let r=t.next();for(;!r.done;)this.Ot(r.value),r=t.next();this.Nt()}Lt(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.Ft(r);else if(r<2048)this.Ft(960|r>>>6),this.Ft(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Ft(480|r>>>12),this.Ft(128|63&r>>>6),this.Ft(128|63&r);else{const s=t.codePointAt(0);this.Ft(240|s>>>18),this.Ft(128|63&s>>>12),this.Ft(128|63&s>>>6),this.Ft(128|63&s)}}this.Mt()}Bt(e){for(const t of e){const r=t.charCodeAt(0);if(r<128)this.Ot(r);else if(r<2048)this.Ot(960|r>>>6),this.Ot(128|63&r);else if(t<"\uD800"||"\uDBFF"<t)this.Ot(480|r>>>12),this.Ot(128|63&r>>>6),this.Ot(128|63&r);else{const s=t.codePointAt(0);this.Ot(240|s>>>18),this.Ot(128|63&s>>>12),this.Ot(128|63&s>>>6),this.Ot(128|63&s)}}this.Nt()}kt(e){const t=this.qt(e),r=Rg(t);this.Qt(1+r),this.buffer[this.position++]=255&r;for(let s=t.length-r;s<t.length;++s)this.buffer[this.position++]=255&t[s]}Kt(e){const t=this.qt(e),r=Rg(t);this.Qt(1+r),this.buffer[this.position++]=~(255&r);for(let s=t.length-r;s<t.length;++s)this.buffer[this.position++]=~(255&t[s])}$t(){this.Ut(255),this.Ut(255)}Wt(){this.Gt(255),this.Gt(255)}reset(){this.position=0}seed(e){this.Qt(e.length),this.buffer.set(e,this.position),this.position+=e.length}zt(){return this.buffer.slice(0,this.position)}qt(e){const t=function(i){const o=new DataView(new ArrayBuffer(8));return o.setFloat64(0,i,!1),new Uint8Array(o.buffer)}(e),r=(128&t[0])!=0;t[0]^=r?255:128;for(let s=1;s<t.length;++s)t[s]^=r?255:0;return t}Ft(e){const t=255&e;t===0?(this.Ut(0),this.Ut(255)):t===255?(this.Ut(255),this.Ut(0)):this.Ut(t)}Ot(e){const t=255&e;t===0?(this.Gt(0),this.Gt(255)):t===255?(this.Gt(255),this.Gt(0)):this.Gt(e)}Mt(){this.Ut(0),this.Ut(1)}Nt(){this.Gt(0),this.Gt(1)}Ut(e){this.Qt(1),this.buffer[this.position++]=e}Gt(e){this.Qt(1),this.buffer[this.position++]=~e}Qt(e){const t=e+this.position;if(t<=this.buffer.length)return;let r=2*this.buffer.length;r<t&&(r=t);const s=new Uint8Array(r);s.set(this.buffer),this.buffer=s}}class dx{constructor(e){this.jt=e}gt(e){this.jt.Ct(e)}Rt(e){this.jt.Lt(e)}At(e){this.jt.kt(e)}Et(){this.jt.$t()}}class hx{constructor(e){this.jt=e}gt(e){this.jt.xt(e)}Rt(e){this.jt.Bt(e)}At(e){this.jt.Kt(e)}Et(){this.jt.Wt()}}class aa{constructor(){this.jt=new ux,this.Ht=new dx(this.jt),this.Jt=new hx(this.jt)}seed(e){this.jt.seed(e)}Yt(e){return e===0?this.Ht:this.Jt}zt(){return this.jt.zt()}reset(){this.jt.reset()}}/**
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
 */class Qs{constructor(e,t,r,s){this.indexId=e,this.documentKey=t,this.arrayValue=r,this.directionalValue=s}Zt(){const e=this.directionalValue.length,t=e===0||this.directionalValue[e-1]===255?e+1:e,r=new Uint8Array(t);return r.set(this.directionalValue,0),t!==e?r.set([0],this.directionalValue.length):++r[r.length-1],new Qs(this.indexId,this.documentKey,this.arrayValue,r)}}function es(n,e){let t=n.indexId-e.indexId;return t!==0?t:(t=Cg(n.arrayValue,e.arrayValue),t!==0?t:(t=Cg(n.directionalValue,e.directionalValue),t!==0?t:he.comparator(n.documentKey,e.documentKey)))}function Cg(n,e){for(let t=0;t<n.length&&t<e.length;++t){const r=n[t]-e[t];if(r!==0)return r}return n.length-e.length}/**
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
 */class kg{constructor(e){this.Xt=new lt((t,r)=>wt.comparator(t.field,r.field)),this.collectionId=e.collectionGroup!=null?e.collectionGroup:e.path.lastSegment(),this.en=e.orderBy,this.tn=[];for(const t of e.filters){const r=t;r.isInequality()?this.Xt=this.Xt.add(r):this.tn.push(r)}}get nn(){return this.Xt.size>1}rn(e){if(ge(e.collectionGroup===this.collectionId),this.nn)return!1;const t=ph(e);if(t!==void 0&&!this.sn(t))return!1;const r=Gs(e);let s=new Set,i=0,o=0;for(;i<r.length&&this.sn(r[i]);++i)s=s.add(r[i].fieldPath.canonicalString());if(i===r.length)return!0;if(this.Xt.size>0){const a=this.Xt.getIterator().getNext();if(!s.has(a.field.canonicalString())){const c=r[i];if(!this.on(a,c)||!this._n(this.en[o++],c))return!1}++i}for(;i<r.length;++i){const a=r[i];if(o>=this.en.length||!this._n(this.en[o++],a))return!1}return!0}an(){if(this.nn)return null;let e=new lt(wt.comparator);const t=[];for(const r of this.tn)if(!r.field.isKeyField())if(r.op==="array-contains"||r.op==="array-contains-any")t.push(new ei(r.field,2));else{if(e.has(r.field))continue;e=e.add(r.field),t.push(new ei(r.field,0))}for(const r of this.en)r.field.isKeyField()||e.has(r.field)||(e=e.add(r.field),t.push(new ei(r.field,r.dir==="asc"?0:1)));return new fo(fo.UNKNOWN_ID,this.collectionId,t,po.empty())}sn(e){for(const t of this.tn)if(this.on(t,e))return!0;return!1}on(e,t){if(e===void 0||!e.field.isEqual(t.fieldPath))return!1;const r=e.op==="array-contains"||e.op==="array-contains-any";return t.kind===2===r}_n(e,t){return!!e.field.isEqual(t.fieldPath)&&(t.kind===0&&e.dir==="asc"||t.kind===1&&e.dir==="desc")}}/**
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
 */function A0(n){var e,t;if(ge(n instanceof Ge||n instanceof it),n instanceof Ge){if(n instanceof jv){const s=((t=(e=n.value.arrayValue)===null||e===void 0?void 0:e.values)===null||t===void 0?void 0:t.map(i=>Ge.create(n.field,"==",i)))||[];return it.create(s,"or")}return n}const r=n.filters.map(s=>A0(s));return it.create(r,n.op)}function fx(n){if(n.getFilters().length===0)return[];const e=xh(A0(n));return ge(P0(e)),Ph(e)||Sh(e)?[e]:e.getFilters()}function Ph(n){return n instanceof Ge}function Sh(n){return n instanceof it&&hf(n)}function P0(n){return Ph(n)||Sh(n)||function(t){if(t instanceof it&&yh(t)){for(const r of t.getFilters())if(!Ph(r)&&!Sh(r))return!1;return!0}return!1}(n)}function xh(n){if(ge(n instanceof Ge||n instanceof it),n instanceof Ge)return n;if(n.filters.length===1)return xh(n.filters[0]);const e=n.filters.map(r=>xh(r));let t=it.create(e,n.op);return t=Qc(t),P0(t)?t:(ge(t instanceof it),ge(go(t)),ge(t.filters.length>1),t.filters.reduce((r,s)=>Ef(r,s)))}function Ef(n,e){let t;return ge(n instanceof Ge||n instanceof it),ge(e instanceof Ge||e instanceof it),t=n instanceof Ge?e instanceof Ge?function(s,i){return it.create([s,i],"and")}(n,e):Dg(n,e):e instanceof Ge?Dg(e,n):function(s,i){if(ge(s.filters.length>0&&i.filters.length>0),go(s)&&go(i))return Fv(s,i.getFilters());const o=yh(s)?s:i,a=yh(s)?i:s,c=o.filters.map(u=>Ef(u,a));return it.create(c,"or")}(n,e),Qc(t)}function Dg(n,e){if(go(e))return Fv(e,n.getFilters());{const t=e.filters.map(r=>Ef(n,r));return it.create(t,"or")}}function Qc(n){if(ge(n instanceof Ge||n instanceof it),n instanceof Ge)return n;const e=n.getFilters();if(e.length===1)return Qc(e[0]);if(Mv(n))return n;const t=e.map(s=>Qc(s)),r=[];return t.forEach(s=>{s instanceof Ge?r.push(s):s instanceof it&&(s.op===n.op?r.push(...s.filters):r.push(s))}),r.length===1?r[0]:it.create(r,n.op)}/**
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
 */class px{constructor(){this.un=new Tf}addToCollectionParentIndex(e,t){return this.un.add(t),O.resolve()}getCollectionParents(e,t){return O.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return O.resolve()}deleteFieldIndex(e,t){return O.resolve()}deleteAllFieldIndexes(e){return O.resolve()}createTargetIndexes(e,t){return O.resolve()}getDocumentsMatchingTarget(e,t){return O.resolve(null)}getIndexType(e,t){return O.resolve(0)}getFieldIndexes(e,t){return O.resolve([])}getNextCollectionGroupToUpdate(e){return O.resolve(null)}getMinOffset(e,t){return O.resolve(Bn.min())}getMinOffsetFromCollectionGroup(e,t){return O.resolve(Bn.min())}updateCollectionGroup(e,t,r){return O.resolve()}updateIndexEntries(e,t){return O.resolve()}}class Tf{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t]||new lt(ze.comparator),i=!s.has(r);return this.index[t]=s.add(r),i}has(e){const t=e.lastSegment(),r=e.popLast(),s=this.index[t];return s&&s.has(r)}getEntries(e){return(this.index[e]||new lt(ze.comparator)).toArray()}}/**
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
 */const lc=new Uint8Array(0);class mx{constructor(e,t){this.databaseId=t,this.cn=new Tf,this.ln=new qr(r=>oi(r),(r,s)=>ml(r,s)),this.uid=e.uid||""}addToCollectionParentIndex(e,t){if(!this.cn.has(t)){const r=t.lastSegment(),s=t.popLast();e.addOnCommittedListener(()=>{this.cn.add(t)});const i={collectionId:r,parent:yn(s)};return Vg(e).put(i)}return O.resolve()}getCollectionParents(e,t){const r=[],s=IDBKeyRange.bound([t,""],[yv(t),""],!1,!0);return Vg(e).U(s).next(i=>{for(const o of i){if(o.collectionId!==t)break;r.push(or(o.parent))}return r})}addFieldIndex(e,t){const r=la(e),s=function(a){return{indexId:a.indexId,collectionGroup:a.collectionGroup,fields:a.fields.map(c=>[c.fieldPath.canonicalString(),c.kind])}}(t);delete s.indexId;const i=r.add(s);if(t.indexState){const o=Ui(e);return i.next(a=>{o.put(Pg(a,this.uid,t.indexState.sequenceNumber,t.indexState.offset))})}return i.next()}deleteFieldIndex(e,t){const r=la(e),s=Ui(e),i=Fi(e);return r.delete(t.indexId).next(()=>s.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0))).next(()=>i.delete(IDBKeyRange.bound([t.indexId],[t.indexId+1],!1,!0)))}deleteAllFieldIndexes(e){const t=la(e),r=Fi(e),s=Ui(e);return t.j().next(()=>r.j()).next(()=>s.j())}createTargetIndexes(e,t){return O.forEach(this.hn(t),r=>this.getIndexType(e,r).next(s=>{if(s===0||s===1){const i=new kg(r).an();if(i!=null)return this.addFieldIndex(e,i)}}))}getDocumentsMatchingTarget(e,t){const r=Fi(e);let s=!0;const i=new Map;return O.forEach(this.hn(t),o=>this.Pn(e,o).next(a=>{s&&(s=!!a),i.set(o,a)})).next(()=>{if(s){let o=Ne();const a=[];return O.forEach(i,(c,u)=>{J("IndexedDbIndexManager",`Using index ${function(L){return`id=${L.indexId}|cg=${L.collectionGroup}|f=${L.fields.map(M=>`${M.fieldPath}:${M.kind}`).join(",")}`}(c)} to execute ${oi(t)}`);const d=function(L,M){const q=ph(M);if(q===void 0)return null;for(const te of Gc(L,q.fieldPath))switch(te.op){case"array-contains-any":return te.value.arrayValue.values||[];case"array-contains":return[te.value]}return null}(u,c),f=function(L,M){const q=new Map;for(const te of Gs(M))for(const x of Gc(L,te.fieldPath))switch(x.op){case"==":case"in":q.set(te.fieldPath.canonicalString(),x.value);break;case"not-in":case"!=":return q.set(te.fieldPath.canonicalString(),x.value),Array.from(q.values())}return null}(u,c),g=function(L,M){const q=[];let te=!0;for(const x of Gs(M)){const E=x.kind===0?dg(L,x.fieldPath,L.startAt):hg(L,x.fieldPath,L.startAt);q.push(E.value),te&&(te=E.inclusive)}return new As(q,te)}(u,c),_=function(L,M){const q=[];let te=!0;for(const x of Gs(M)){const E=x.kind===0?hg(L,x.fieldPath,L.endAt):dg(L,x.fieldPath,L.endAt);q.push(E.value),te&&(te=E.inclusive)}return new As(q,te)}(u,c),k=this.In(c,u,g),T=this.In(c,u,_),C=this.Tn(c,u,f),F=this.En(c.indexId,d,k,g.inclusive,T,_.inclusive,C);return O.forEach(F,j=>r.G(j,t.limit).next(L=>{L.forEach(M=>{const q=he.fromSegments(M.documentKey);o.has(q)||(o=o.add(q),a.push(q))})}))}).next(()=>a)}return O.resolve(null)})}hn(e){let t=this.ln.get(e);return t||(e.filters.length===0?t=[e]:t=fx(it.create(e.filters,"and")).map(r=>wh(e.path,e.collectionGroup,e.orderBy,r.getFilters(),e.limit,e.startAt,e.endAt)),this.ln.set(e,t),t)}En(e,t,r,s,i,o,a){const c=(t!=null?t.length:1)*Math.max(r.length,i.length),u=c/(t!=null?t.length:1),d=[];for(let f=0;f<c;++f){const g=t?this.dn(t[f/u]):lc,_=this.An(e,g,r[f%u],s),k=this.Rn(e,g,i[f%u],o),T=a.map(C=>this.An(e,g,C,!0));d.push(...this.createRange(_,k,T))}return d}An(e,t,r,s){const i=new Qs(e,he.empty(),t,r);return s?i:i.Zt()}Rn(e,t,r,s){const i=new Qs(e,he.empty(),t,r);return s?i.Zt():i}Pn(e,t){const r=new kg(t),s=t.collectionGroup!=null?t.collectionGroup:t.path.lastSegment();return this.getFieldIndexes(e,s).next(i=>{let o=null;for(const a of i)r.rn(a)&&(!o||a.fields.length>o.fields.length)&&(o=a);return o})}getIndexType(e,t){let r=2;const s=this.hn(t);return O.forEach(s,i=>this.Pn(e,i).next(o=>{o?r!==0&&o.fields.length<function(c){let u=new lt(wt.comparator),d=!1;for(const f of c.filters)for(const g of f.getFlattenedFilters())g.field.isKeyField()||(g.op==="array-contains"||g.op==="array-contains-any"?d=!0:u=u.add(g.field));for(const f of c.orderBy)f.field.isKeyField()||(u=u.add(f.field));return u.size+(d?1:0)}(i)&&(r=1):r=0})).next(()=>function(o){return o.limit!==null}(t)&&s.length>1&&r===2?1:r)}Vn(e,t){const r=new aa;for(const s of Gs(e)){const i=t.data.field(s.fieldPath);if(i==null)return null;const o=r.Yt(s.kind);Ws.vt.It(i,o)}return r.zt()}dn(e){const t=new aa;return Ws.vt.It(e,t.Yt(0)),t.zt()}mn(e,t){const r=new aa;return Ws.vt.It(ii(this.databaseId,t),r.Yt(function(i){const o=Gs(i);return o.length===0?0:o[o.length-1].kind}(e))),r.zt()}Tn(e,t,r){if(r===null)return[];let s=[];s.push(new aa);let i=0;for(const o of Gs(e)){const a=r[i++];for(const c of s)if(this.fn(t,o.fieldPath)&&Ya(a))s=this.gn(s,o,a);else{const u=c.Yt(o.kind);Ws.vt.It(a,u)}}return this.pn(s)}In(e,t,r){return this.Tn(e,t,r.position)}pn(e){const t=[];for(let r=0;r<e.length;++r)t[r]=e[r].zt();return t}gn(e,t,r){const s=[...e],i=[];for(const o of r.arrayValue.values||[])for(const a of s){const c=new aa;c.seed(a.zt()),Ws.vt.It(o,c.Yt(t.kind)),i.push(c)}return i}fn(e,t){return!!e.filters.find(r=>r instanceof Ge&&r.field.isEqual(t)&&(r.op==="in"||r.op==="not-in"))}getFieldIndexes(e,t){const r=la(e),s=Ui(e);return(t?r.U("collectionGroupIndex",IDBKeyRange.bound(t,t)):r.U()).next(i=>{const o=[];return O.forEach(i,a=>s.get([a.indexId,this.uid]).next(c=>{o.push(function(d,f){const g=f?new po(f.sequenceNumber,new Bn(ui(f.readTime),new he(or(f.documentKey)),f.largestBatchId)):po.empty(),_=d.fields.map(([k,T])=>new ei(wt.fromServerFormat(k),T));return new fo(d.indexId,d.collectionGroup,_,g)}(a,c))})).next(()=>o)})}getNextCollectionGroupToUpdate(e){return this.getFieldIndexes(e).next(t=>t.length===0?null:(t.sort((r,s)=>{const i=r.indexState.sequenceNumber-s.indexState.sequenceNumber;return i!==0?i:Pe(r.collectionGroup,s.collectionGroup)}),t[0].collectionGroup))}updateCollectionGroup(e,t,r){const s=la(e),i=Ui(e);return this.yn(e).next(o=>s.U("collectionGroupIndex",IDBKeyRange.bound(t,t)).next(a=>O.forEach(a,c=>i.put(Pg(c.indexId,this.uid,o,r)))))}updateIndexEntries(e,t){const r=new Map;return O.forEach(t,(s,i)=>{const o=r.get(s.collectionGroup);return(o?O.resolve(o):this.getFieldIndexes(e,s.collectionGroup)).next(a=>(r.set(s.collectionGroup,a),O.forEach(a,c=>this.wn(e,s,c).next(u=>{const d=this.Sn(i,c);return u.isEqual(d)?O.resolve():this.bn(e,i,c,u,d)}))))})}Dn(e,t,r,s){return Fi(e).put({indexId:s.indexId,uid:this.uid,arrayValue:s.arrayValue,directionalValue:s.directionalValue,orderedDocumentKey:this.mn(r,t.key),documentKey:t.key.path.toArray()})}vn(e,t,r,s){return Fi(e).delete([s.indexId,this.uid,s.arrayValue,s.directionalValue,this.mn(r,t.key),t.key.path.toArray()])}wn(e,t,r){const s=Fi(e);let i=new lt(es);return s.J({index:"documentKeyIndex",range:IDBKeyRange.only([r.indexId,this.uid,this.mn(r,t)])},(o,a)=>{i=i.add(new Qs(r.indexId,t,a.arrayValue,a.directionalValue))}).next(()=>i)}Sn(e,t){let r=new lt(es);const s=this.Vn(t,e);if(s==null)return r;const i=ph(t);if(i!=null){const o=e.data.field(i.fieldPath);if(Ya(o))for(const a of o.arrayValue.values||[])r=r.add(new Qs(t.indexId,e.key,this.dn(a),s))}else r=r.add(new Qs(t.indexId,e.key,lc,s));return r}bn(e,t,r,s,i){J("IndexedDbIndexManager","Updating index entries for document '%s'",t.key);const o=[];return function(c,u,d,f,g){const _=c.getIterator(),k=u.getIterator();let T=Li(_),C=Li(k);for(;T||C;){let F=!1,j=!1;if(T&&C){const L=d(T,C);L<0?j=!0:L>0&&(F=!0)}else T!=null?j=!0:F=!0;F?(f(C),C=Li(k)):j?(g(T),T=Li(_)):(T=Li(_),C=Li(k))}}(s,i,es,a=>{o.push(this.Dn(e,t,r,a))},a=>{o.push(this.vn(e,t,r,a))}),O.waitFor(o)}yn(e){let t=1;return Ui(e).J({index:"sequenceNumberIndex",reverse:!0,range:IDBKeyRange.upperBound([this.uid,Number.MAX_SAFE_INTEGER])},(r,s,i)=>{i.done(),t=s.sequenceNumber+1}).next(()=>t)}createRange(e,t,r){r=r.sort((o,a)=>es(o,a)).filter((o,a,c)=>!a||es(o,c[a-1])!==0);const s=[];s.push(e);for(const o of r){const a=es(o,e),c=es(o,t);if(a===0)s[0]=e.Zt();else if(a>0&&c<0)s.push(o),s.push(o.Zt());else if(c>0)break}s.push(t);const i=[];for(let o=0;o<s.length;o+=2){if(this.Cn(s[o],s[o+1]))return[];const a=[s[o].indexId,this.uid,s[o].arrayValue,s[o].directionalValue,lc,[]],c=[s[o+1].indexId,this.uid,s[o+1].arrayValue,s[o+1].directionalValue,lc,[]];i.push(IDBKeyRange.bound(a,c))}return i}Cn(e,t){return es(e,t)>0}getMinOffsetFromCollectionGroup(e,t){return this.getFieldIndexes(e,t).next(Ng)}getMinOffset(e,t){return O.mapArray(this.hn(t),r=>this.Pn(e,r).next(s=>s||pe())).next(Ng)}}function Vg(n){return Gt(n,"collectionParents")}function Fi(n){return Gt(n,"indexEntries")}function la(n){return Gt(n,"indexConfiguration")}function Ui(n){return Gt(n,"indexState")}function Ng(n){ge(n.length!==0);let e=n[0].indexState.offset,t=e.largestBatchId;for(let r=1;r<n.length;r++){const s=n[r].indexState.offset;cf(s,e)<0&&(e=s),t<s.largestBatchId&&(t=s.largestBatchId)}return new Bn(e.readTime,e.documentKey,t)}/**
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
 */const Og={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0};class pn{constructor(e,t,r){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=t,this.maximumSequenceNumbersToCollect=r}static withCacheSize(e){return new pn(e,pn.DEFAULT_COLLECTION_PERCENTILE,pn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function S0(n,e,t){const r=n.store("mutations"),s=n.store("documentMutations"),i=[],o=IDBKeyRange.only(t.batchId);let a=0;const c=r.J({range:o},(d,f,g)=>(a++,g.delete()));i.push(c.next(()=>{ge(a===1)}));const u=[];for(const d of t.mutations){const f=Av(e,d.key.path,t.batchId);i.push(s.delete(f)),u.push(d.key)}return O.waitFor(i).next(()=>u)}function Jc(n){if(!n)return 0;let e;if(n.document)e=n.document;else if(n.unknownDocument)e=n.unknownDocument;else{if(!n.noDocument)throw pe();e=n.noDocument}return JSON.stringify(e).length}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */pn.DEFAULT_COLLECTION_PERCENTILE=10,pn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,pn.DEFAULT=new pn(41943040,pn.DEFAULT_COLLECTION_PERCENTILE,pn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),pn.DISABLED=new pn(-1,0,0);class Nu{constructor(e,t,r,s){this.userId=e,this.serializer=t,this.indexManager=r,this.referenceDelegate=s,this.Fn={}}static lt(e,t,r,s){ge(e.uid!=="");const i=e.isAuthenticated()?e.uid:"";return new Nu(i,t,r,s)}checkEmpty(e){let t=!0;const r=IDBKeyRange.bound([this.userId,Number.NEGATIVE_INFINITY],[this.userId,Number.POSITIVE_INFINITY]);return ts(e).J({index:"userMutationsIndex",range:r},(s,i,o)=>{t=!1,o.done()}).next(()=>t)}addMutationBatch(e,t,r,s){const i=Hi(e),o=ts(e);return o.add({}).next(a=>{ge(typeof a=="number");const c=new _f(a,t,r,s),u=function(_,k,T){const C=T.baseMutations.map(j=>el(_.ct,j)),F=T.mutations.map(j=>el(_.ct,j));return{userId:k,batchId:T.batchId,localWriteTimeMs:T.localWriteTime.toMillis(),baseMutations:C,mutations:F}}(this.serializer,this.userId,c),d=[];let f=new lt((g,_)=>Pe(g.canonicalString(),_.canonicalString()));for(const g of s){const _=Av(this.userId,g.key.path,a);f=f.add(g.key.path.popLast()),d.push(o.put(u)),d.push(i.put(_,rS))}return f.forEach(g=>{d.push(this.indexManager.addToCollectionParentIndex(e,g))}),e.addOnCommittedListener(()=>{this.Fn[a]=c.keys()}),O.waitFor(d).next(()=>c)})}lookupMutationBatch(e,t){return ts(e).get(t).next(r=>r?(ge(r.userId===this.userId),Hs(this.serializer,r)):null)}Mn(e,t){return this.Fn[t]?O.resolve(this.Fn[t]):this.lookupMutationBatch(e,t).next(r=>{if(r){const s=r.keys();return this.Fn[t]=s,s}return null})}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=IDBKeyRange.lowerBound([this.userId,r]);let i=null;return ts(e).J({index:"userMutationsIndex",range:s},(o,a,c)=>{a.userId===this.userId&&(ge(a.batchId>=r),i=Hs(this.serializer,a)),c.done()}).next(()=>i)}getHighestUnacknowledgedBatchId(e){const t=IDBKeyRange.upperBound([this.userId,Number.POSITIVE_INFINITY]);let r=-1;return ts(e).J({index:"userMutationsIndex",range:t,reverse:!0},(s,i,o)=>{r=i.batchId,o.done()}).next(()=>r)}getAllMutationBatches(e){const t=IDBKeyRange.bound([this.userId,-1],[this.userId,Number.POSITIVE_INFINITY]);return ts(e).U("userMutationsIndex",t).next(r=>r.map(s=>Hs(this.serializer,s)))}getAllMutationBatchesAffectingDocumentKey(e,t){const r=bc(this.userId,t.path),s=IDBKeyRange.lowerBound(r),i=[];return Hi(e).J({range:s},(o,a,c)=>{const[u,d,f]=o,g=or(d);if(u===this.userId&&t.path.isEqual(g))return ts(e).get(f).next(_=>{if(!_)throw pe();ge(_.userId===this.userId),i.push(Hs(this.serializer,_))});c.done()}).next(()=>i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new lt(Pe);const s=[];return t.forEach(i=>{const o=bc(this.userId,i.path),a=IDBKeyRange.lowerBound(o),c=Hi(e).J({range:a},(u,d,f)=>{const[g,_,k]=u,T=or(_);g===this.userId&&i.path.isEqual(T)?r=r.add(k):f.done()});s.push(c)}),O.waitFor(s).next(()=>this.xn(e,r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1,i=bc(this.userId,r),o=IDBKeyRange.lowerBound(i);let a=new lt(Pe);return Hi(e).J({range:o},(c,u,d)=>{const[f,g,_]=c,k=or(g);f===this.userId&&r.isPrefixOf(k)?k.length===s&&(a=a.add(_)):d.done()}).next(()=>this.xn(e,a))}xn(e,t){const r=[],s=[];return t.forEach(i=>{s.push(ts(e).get(i).next(o=>{if(o===null)throw pe();ge(o.userId===this.userId),r.push(Hs(this.serializer,o))}))}),O.waitFor(s).next(()=>r)}removeMutationBatch(e,t){return S0(e._e,this.userId,t).next(r=>(e.addOnCommittedListener(()=>{this.On(t.batchId)}),O.forEach(r,s=>this.referenceDelegate.markPotentiallyOrphaned(e,s))))}On(e){delete this.Fn[e]}performConsistencyCheck(e){return this.checkEmpty(e).next(t=>{if(!t)return O.resolve();const r=IDBKeyRange.lowerBound(function(o){return[o]}(this.userId)),s=[];return Hi(e).J({range:r},(i,o,a)=>{if(i[0]===this.userId){const c=or(i[1]);s.push(c)}else a.done()}).next(()=>{ge(s.length===0)})})}containsKey(e,t){return x0(e,this.userId,t)}Nn(e){return R0(e).get(this.userId).next(t=>t||{userId:this.userId,lastAcknowledgedBatchId:-1,lastStreamToken:""})}}function x0(n,e,t){const r=bc(e,t.path),s=r[1],i=IDBKeyRange.lowerBound(r);let o=!1;return Hi(n).J({range:i,H:!0},(a,c,u)=>{const[d,f,g]=a;d===e&&f===s&&(o=!0),u.done()}).next(()=>o)}function ts(n){return Gt(n,"mutations")}function Hi(n){return Gt(n,"documentMutations")}function R0(n){return Gt(n,"mutationQueues")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class di{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new di(0)}static kn(){return new di(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gx{constructor(e,t){this.referenceDelegate=e,this.serializer=t}allocateTargetId(e){return this.qn(e).next(t=>{const r=new di(t.highestTargetId);return t.highestTargetId=r.next(),this.Qn(e,t).next(()=>t.highestTargetId)})}getLastRemoteSnapshotVersion(e){return this.qn(e).next(t=>ve.fromTimestamp(new Pt(t.lastRemoteSnapshotVersion.seconds,t.lastRemoteSnapshotVersion.nanoseconds)))}getHighestSequenceNumber(e){return this.qn(e).next(t=>t.highestListenSequenceNumber)}setTargetsMetadata(e,t,r){return this.qn(e).next(s=>(s.highestListenSequenceNumber=t,r&&(s.lastRemoteSnapshotVersion=r.toTimestamp()),t>s.highestListenSequenceNumber&&(s.highestListenSequenceNumber=t),this.Qn(e,s)))}addTargetData(e,t){return this.Kn(e,t).next(()=>this.qn(e).next(r=>(r.targetCount+=1,this.$n(t,r),this.Qn(e,r))))}updateTargetData(e,t){return this.Kn(e,t)}removeTargetData(e,t){return this.removeMatchingKeysForTargetId(e,t.targetId).next(()=>Bi(e).delete(t.targetId)).next(()=>this.qn(e)).next(r=>(ge(r.targetCount>0),r.targetCount-=1,this.Qn(e,r)))}removeTargets(e,t,r){let s=0;const i=[];return Bi(e).J((o,a)=>{const c=va(a);c.sequenceNumber<=t&&r.get(c.targetId)===null&&(s++,i.push(this.removeTargetData(e,c)))}).next(()=>O.waitFor(i)).next(()=>s)}forEachTarget(e,t){return Bi(e).J((r,s)=>{const i=va(s);t(i)})}qn(e){return Mg(e).get("targetGlobalKey").next(t=>(ge(t!==null),t))}Qn(e,t){return Mg(e).put("targetGlobalKey",t)}Kn(e,t){return Bi(e).put(T0(this.serializer,t))}$n(e,t){let r=!1;return e.targetId>t.highestTargetId&&(t.highestTargetId=e.targetId,r=!0),e.sequenceNumber>t.highestListenSequenceNumber&&(t.highestListenSequenceNumber=e.sequenceNumber,r=!0),r}getTargetCount(e){return this.qn(e).next(t=>t.targetCount)}getTargetData(e,t){const r=oi(t),s=IDBKeyRange.bound([r,Number.NEGATIVE_INFINITY],[r,Number.POSITIVE_INFINITY]);let i=null;return Bi(e).J({range:s,index:"queryTargetsIndex"},(o,a,c)=>{const u=va(a);ml(t,u.target)&&(i=u,c.done())}).next(()=>i)}addMatchingKeys(e,t,r){const s=[],i=ls(e);return t.forEach(o=>{const a=yn(o.path);s.push(i.put({targetId:r,path:a})),s.push(this.referenceDelegate.addReference(e,r,o))}),O.waitFor(s)}removeMatchingKeys(e,t,r){const s=ls(e);return O.forEach(t,i=>{const o=yn(i.path);return O.waitFor([s.delete([r,o]),this.referenceDelegate.removeReference(e,r,i)])})}removeMatchingKeysForTargetId(e,t){const r=ls(e),s=IDBKeyRange.bound([t],[t+1],!1,!0);return r.delete(s)}getMatchingKeysForTargetId(e,t){const r=IDBKeyRange.bound([t],[t+1],!1,!0),s=ls(e);let i=Ne();return s.J({range:r,H:!0},(o,a,c)=>{const u=or(o[1]),d=new he(u);i=i.add(d)}).next(()=>i)}containsKey(e,t){const r=yn(t.path),s=IDBKeyRange.bound([r],[yv(r)],!1,!0);let i=0;return ls(e).J({index:"documentTargetsIndex",H:!0,range:s},([o,a],c,u)=>{o!==0&&(i++,u.done())}).next(()=>i>0)}ot(e,t){return Bi(e).get(t).next(r=>r?va(r):null)}}function Bi(n){return Gt(n,"targets")}function Mg(n){return Gt(n,"targetGlobal")}function ls(n){return Gt(n,"targetDocuments")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Lg([n,e],[t,r]){const s=Pe(n,t);return s===0?Pe(e,r):s}class _x{constructor(e){this.Un=e,this.buffer=new lt(Lg),this.Wn=0}Gn(){return++this.Wn}zn(e){const t=[e,this.Gn()];if(this.buffer.size<this.Un)this.buffer=this.buffer.add(t);else{const r=this.buffer.last();Lg(t,r)<0&&(this.buffer=this.buffer.delete(r).add(t))}}get maxValue(){return this.buffer.last()[0]}}class C0{constructor(e,t,r){this.garbageCollector=e,this.asyncQueue=t,this.localStore=r,this.jn=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Hn(6e4)}stop(){this.jn&&(this.jn.cancel(),this.jn=null)}get started(){return this.jn!==null}Hn(e){J("LruGarbageCollector",`Garbage collection scheduled in ${e}ms`),this.jn=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.jn=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(t){Ds(t)?J("LruGarbageCollector","Ignoring IndexedDB error during garbage collection: ",t):await ks(t)}await this.Hn(3e5)})}}class yx{constructor(e,t){this.Jn=e,this.params=t}calculateTargetCount(e,t){return this.Jn.Yn(e).next(r=>Math.floor(t/100*r))}nthSequenceNumber(e,t){if(t===0)return O.resolve(Cn.oe);const r=new _x(t);return this.Jn.forEachTarget(e,s=>r.zn(s.sequenceNumber)).next(()=>this.Jn.Zn(e,s=>r.zn(s))).next(()=>r.maxValue)}removeTargets(e,t,r){return this.Jn.removeTargets(e,t,r)}removeOrphanedDocuments(e,t){return this.Jn.removeOrphanedDocuments(e,t)}collect(e,t){return this.params.cacheSizeCollectionThreshold===-1?(J("LruGarbageCollector","Garbage collection skipped; disabled"),O.resolve(Og)):this.getCacheSize(e).next(r=>r<this.params.cacheSizeCollectionThreshold?(J("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Og):this.Xn(e,t))}getCacheSize(e){return this.Jn.getCacheSize(e)}Xn(e,t){let r,s,i,o,a,c,u;const d=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(f=>(f>this.params.maximumSequenceNumbersToCollect?(J("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${f}`),s=this.params.maximumSequenceNumbersToCollect):s=f,o=Date.now(),this.nthSequenceNumber(e,s))).next(f=>(r=f,a=Date.now(),this.removeTargets(e,r,t))).next(f=>(i=f,c=Date.now(),this.removeOrphanedDocuments(e,r))).next(f=>(u=Date.now(),zi()<=qe.DEBUG&&J("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${o-d}ms
	Determined least recently used ${s} in `+(a-o)+`ms
	Removed ${i} targets in `+(c-a)+`ms
	Removed ${f} documents in `+(u-c)+`ms
Total Duration: ${u-d}ms`),O.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:i,documentsRemoved:f})))}}function k0(n,e){return new yx(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vx{constructor(e,t){this.db=e,this.garbageCollector=k0(this,t)}Yn(e){const t=this.er(e);return this.db.getTargetCache().getTargetCount(e).next(r=>t.next(s=>r+s))}er(e){let t=0;return this.Zn(e,r=>{t++}).next(()=>t)}forEachTarget(e,t){return this.db.getTargetCache().forEachTarget(e,t)}Zn(e,t){return this.tr(e,(r,s)=>t(s))}addReference(e,t,r){return cc(e,r)}removeReference(e,t,r){return cc(e,r)}removeTargets(e,t,r){return this.db.getTargetCache().removeTargets(e,t,r)}markPotentiallyOrphaned(e,t){return cc(e,t)}nr(e,t){return function(s,i){let o=!1;return R0(s).Y(a=>x0(s,a,i).next(c=>(c&&(o=!0),O.resolve(!c)))).next(()=>o)}(e,t)}removeOrphanedDocuments(e,t){const r=this.db.getRemoteDocumentCache().newChangeBuffer(),s=[];let i=0;return this.tr(e,(o,a)=>{if(a<=t){const c=this.nr(e,o).next(u=>{if(!u)return i++,r.getEntry(e,o).next(()=>(r.removeEntry(o,ve.min()),ls(e).delete(function(f){return[0,yn(f.path)]}(o))))});s.push(c)}}).next(()=>O.waitFor(s)).next(()=>r.apply(e)).next(()=>i)}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.db.getTargetCache().updateTargetData(e,r)}updateLimboDocument(e,t){return cc(e,t)}tr(e,t){const r=ls(e);let s,i=Cn.oe;return r.J({index:"documentTargetsIndex"},([o,a],{path:c,sequenceNumber:u})=>{o===0?(i!==Cn.oe&&t(new he(or(s)),i),i=u,s=c):i=Cn.oe}).next(()=>{i!==Cn.oe&&t(new he(or(s)),i)})}getCacheSize(e){return this.db.getRemoteDocumentCache().getSize(e)}}function cc(n,e){return ls(n).put(function(r,s){return{targetId:0,path:yn(r.path),sequenceNumber:s}}(e,n.currentSequenceNumber))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class D0{constructor(){this.changes=new qr(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,mt.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?O.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wx{constructor(e){this.serializer=e}setIndexManager(e){this.indexManager=e}addEntry(e,t,r){return $s(e).put(r)}removeEntry(e,t,r){return $s(e).delete(function(i,o){const a=i.path.toArray();return[a.slice(0,a.length-2),a[a.length-2],Wc(o),a[a.length-1]]}(t,r))}updateMetadata(e,t){return this.getMetadata(e).next(r=>(r.byteSize+=t,this.rr(e,r)))}getEntry(e,t){let r=mt.newInvalidDocument(t);return $s(e).J({index:"documentKeyIndex",range:IDBKeyRange.only(ca(t))},(s,i)=>{r=this.ir(t,i)}).next(()=>r)}sr(e,t){let r={size:0,document:mt.newInvalidDocument(t)};return $s(e).J({index:"documentKeyIndex",range:IDBKeyRange.only(ca(t))},(s,i)=>{r={document:this.ir(t,i),size:Jc(i)}}).next(()=>r)}getEntries(e,t){let r=Dn();return this._r(e,t,(s,i)=>{const o=this.ir(s,i);r=r.insert(s,o)}).next(()=>r)}ar(e,t){let r=Dn(),s=new pt(he.comparator);return this._r(e,t,(i,o)=>{const a=this.ir(i,o);r=r.insert(i,a),s=s.insert(i,Jc(o))}).next(()=>({documents:r,ur:s}))}_r(e,t,r){if(t.isEmpty())return O.resolve();let s=new lt(Bg);t.forEach(c=>s=s.add(c));const i=IDBKeyRange.bound(ca(s.first()),ca(s.last())),o=s.getIterator();let a=o.getNext();return $s(e).J({index:"documentKeyIndex",range:i},(c,u,d)=>{const f=he.fromSegments([...u.prefixPath,u.collectionGroup,u.documentId]);for(;a&&Bg(a,f)<0;)r(a,null),a=o.getNext();a&&a.isEqual(f)&&(r(a,u),a=o.hasNext()?o.getNext():null),a?d.$(ca(a)):d.done()}).next(()=>{for(;a;)r(a,null),a=o.hasNext()?o.getNext():null})}getDocumentsMatchingQuery(e,t,r,s,i){const o=t.path,a=[o.popLast().toArray(),o.lastSegment(),Wc(r.readTime),r.documentKey.path.isEmpty()?"":r.documentKey.path.lastSegment()],c=[o.popLast().toArray(),o.lastSegment(),[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],""];return $s(e).U(IDBKeyRange.bound(a,c,!0)).next(u=>{i==null||i.incrementDocumentReadCount(u.length);let d=Dn();for(const f of u){const g=this.ir(he.fromSegments(f.prefixPath.concat(f.collectionGroup,f.documentId)),f);g.isFoundDocument()&&(_l(t,g)||s.has(g.key))&&(d=d.insert(g.key,g))}return d})}getAllFromCollectionGroup(e,t,r,s){let i=Dn();const o=Ug(t,r),a=Ug(t,Bn.max());return $s(e).J({index:"collectionGroupIndex",range:IDBKeyRange.bound(o,a,!0)},(c,u,d)=>{const f=this.ir(he.fromSegments(u.prefixPath.concat(u.collectionGroup,u.documentId)),u);i=i.insert(f.key,f),i.size===s&&d.done()}).next(()=>i)}newChangeBuffer(e){return new bx(this,!!e&&e.trackRemovals)}getSize(e){return this.getMetadata(e).next(t=>t.byteSize)}getMetadata(e){return Fg(e).get("remoteDocumentGlobalKey").next(t=>(ge(!!t),t))}rr(e,t){return Fg(e).put("remoteDocumentGlobalKey",t)}ir(e,t){if(t){const r=ox(this.serializer,t);if(!(r.isNoDocument()&&r.version.isEqual(ve.min())))return r}return mt.newInvalidDocument(e)}}function V0(n){return new wx(n)}class bx extends D0{constructor(e,t){super(),this.cr=e,this.trackRemovals=t,this.lr=new qr(r=>r.toString(),(r,s)=>r.isEqual(s))}applyChanges(e){const t=[];let r=0,s=new lt((i,o)=>Pe(i.canonicalString(),o.canonicalString()));return this.changes.forEach((i,o)=>{const a=this.lr.get(i);if(t.push(this.cr.removeEntry(e,i,a.readTime)),o.isValidDocument()){const c=Tg(this.cr.serializer,o);s=s.add(i.path.popLast());const u=Jc(c);r+=u-a.size,t.push(this.cr.addEntry(e,i,c))}else if(r-=a.size,this.trackRemovals){const c=Tg(this.cr.serializer,o.convertToNoDocument(ve.min()));t.push(this.cr.addEntry(e,i,c))}}),s.forEach(i=>{t.push(this.cr.indexManager.addToCollectionParentIndex(e,i))}),t.push(this.cr.updateMetadata(e,r)),O.waitFor(t)}getFromCache(e,t){return this.cr.sr(e,t).next(r=>(this.lr.set(t,{size:r.size,readTime:r.document.readTime}),r.document))}getAllFromCache(e,t){return this.cr.ar(e,t).next(({documents:r,ur:s})=>(s.forEach((i,o)=>{this.lr.set(i,{size:o,readTime:r.get(i).readTime})}),r))}}function Fg(n){return Gt(n,"remoteDocumentGlobal")}function $s(n){return Gt(n,"remoteDocumentsV14")}function ca(n){const e=n.path.toArray();return[e.slice(0,e.length-2),e[e.length-2],e[e.length-1]]}function Ug(n,e){const t=e.documentKey.path.toArray();return[n,Wc(e.readTime),t.slice(0,t.length-2),t.length>0?t[t.length-1]:""]}function Bg(n,e){const t=n.path.toArray(),r=e.path.toArray();let s=0;for(let i=0;i<t.length-2&&i<r.length-2;++i)if(s=Pe(t[i],r[i]),s)return s;return s=Pe(t.length,r.length),s||(s=Pe(t[t.length-2],r[r.length-2]),s||Pe(t[t.length-1],r[r.length-1]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class Ix{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N0{constructor(e,t,r,s){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,t))).next(s=>(r!==null&&Va(r.mutation,s,kn.empty(),Pt.now()),s))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,Ne()).next(()=>r))}getLocalViewOfDocuments(e,t,r=Ne()){const s=ar();return this.populateOverlays(e,s,t).next(()=>this.computeViews(e,t,s,r).next(i=>{let o=_a();return i.forEach((a,c)=>{o=o.insert(a,c.overlayedDocument)}),o}))}getOverlayedDocuments(e,t){const r=ar();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,Ne()))}populateOverlays(e,t,r){const s=[];return r.forEach(i=>{t.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((o,a)=>{t.set(o,a)})})}computeViews(e,t,r,s){let i=Dn();const o=Da(),a=function(){return Da()}();return t.forEach((c,u)=>{const d=r.get(u.key);s.has(u.key)&&(d===void 0||d.mutation instanceof zr)?i=i.insert(u.key,u):d!==void 0?(o.set(u.key,d.mutation.getFieldMask()),Va(d.mutation,u,d.mutation.getFieldMask(),Pt.now())):o.set(u.key,kn.empty())}),this.recalculateAndSaveOverlays(e,i).next(c=>(c.forEach((u,d)=>o.set(u,d)),t.forEach((u,d)=>{var f;return a.set(u,new Ix(d,(f=o.get(u))!==null&&f!==void 0?f:null))}),a))}recalculateAndSaveOverlays(e,t){const r=Da();let s=new pt((o,a)=>o-a),i=Ne();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(o=>{for(const a of o)a.keys().forEach(c=>{const u=t.get(c);if(u===null)return;let d=r.get(c)||kn.empty();d=a.applyToLocalView(u,d),r.set(c,d);const f=(s.get(a.batchId)||Ne()).add(c);s=s.insert(a.batchId,f)})}).next(()=>{const o=[],a=s.getReverseIterator();for(;a.hasNext();){const c=a.getNext(),u=c.key,d=c.value,f=Jv();d.forEach(g=>{if(!i.has(g)){const _=r0(t.get(g),r.get(g));_!==null&&f.set(g,_),i=i.add(g)}}),o.push(this.documentOverlayCache.saveOverlays(e,u,f))}return O.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,s){return function(o){return he.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):ff(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,s):this.getDocumentsMatchingCollectionQuery(e,t,r,s)}getNextDocuments(e,t,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,s).next(i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,s-i.size):O.resolve(ar());let a=-1,c=i;return o.next(u=>O.forEach(u,(d,f)=>(a<f.largestBatchId&&(a=f.largestBatchId),i.get(d)?O.resolve():this.remoteDocumentCache.getEntry(e,d).next(g=>{c=c.insert(d,g)}))).next(()=>this.populateOverlays(e,u,i)).next(()=>this.computeViews(e,c,u,Ne())).next(d=>({batchId:a,changes:Qv(d)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new he(t)).next(r=>{let s=_a();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,t,r,s){const i=t.collectionGroup;let o=_a();return this.indexManager.getCollectionParents(e,i).next(a=>O.forEach(a,c=>{const u=function(f,g){return new $r(g,null,f.explicitOrderBy.slice(),f.filters.slice(),f.limit,f.limitType,f.startAt,f.endAt)}(t,c.child(i));return this.getDocumentsMatchingCollectionQuery(e,u,r,s).next(d=>{d.forEach((f,g)=>{o=o.insert(f,g)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,t,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,i,s))).next(o=>{i.forEach((c,u)=>{const d=u.getKey();o.get(d)===null&&(o=o.insert(d,mt.newInvalidDocument(d)))});let a=_a();return o.forEach((c,u)=>{const d=i.get(c);d!==void 0&&Va(d.mutation,u,kn.empty(),Pt.now()),_l(t,u)&&(a=a.insert(c,u))}),a})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ex{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return O.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,function(s){return{id:s.id,version:s.version,createTime:Mt(s.createTime)}}(t)),O.resolve()}getNamedQuery(e,t){return O.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,function(s){return{name:s.name,query:If(s.bundledQuery),readTime:Mt(s.readTime)}}(t)),O.resolve()}}/**
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
 */class Tx{constructor(){this.overlays=new pt(he.comparator),this.Ir=new Map}getOverlay(e,t){return O.resolve(this.overlays.get(t))}getOverlays(e,t){const r=ar();return O.forEach(t,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((s,i)=>{this.ht(e,t,i)}),O.resolve()}removeOverlaysForBatchId(e,t,r){const s=this.Ir.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(r)),O.resolve()}getOverlaysForCollection(e,t,r){const s=ar(),i=t.length+1,o=new he(t.child("")),a=this.overlays.getIteratorFrom(o);for(;a.hasNext();){const c=a.getNext().value,u=c.getKey();if(!t.isPrefixOf(u.path))break;u.path.length===i&&c.largestBatchId>r&&s.set(c.getKey(),c)}return O.resolve(s)}getOverlaysForCollectionGroup(e,t,r,s){let i=new pt((u,d)=>u-d);const o=this.overlays.getIterator();for(;o.hasNext();){const u=o.getNext().value;if(u.getKey().getCollectionGroup()===t&&u.largestBatchId>r){let d=i.get(u.largestBatchId);d===null&&(d=ar(),i=i.insert(u.largestBatchId,d)),d.set(u.getKey(),u)}}const a=ar(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((u,d)=>a.set(u,d)),!(a.size()>=s)););return O.resolve(a)}ht(e,t,r){const s=this.overlays.get(r.key);if(s!==null){const o=this.Ir.get(s.largestBatchId).delete(r.key);this.Ir.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new vf(t,r));let i=this.Ir.get(t);i===void 0&&(i=Ne(),this.Ir.set(t,i)),this.Ir.set(t,i.add(r.key))}}/**
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
 */class Ax{constructor(){this.sessionToken=Ct.EMPTY_BYTE_STRING}getSessionToken(e){return O.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,O.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Af{constructor(){this.Tr=new lt(Wt.Er),this.dr=new lt(Wt.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const r=new Wt(e,t);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Vr(new Wt(e,t))}mr(e,t){e.forEach(r=>this.removeReference(r,t))}gr(e){const t=new he(new ze([])),r=new Wt(t,e),s=new Wt(t,e+1),i=[];return this.dr.forEachInRange([r,s],o=>{this.Vr(o),i.push(o.key)}),i}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new he(new ze([])),r=new Wt(t,e),s=new Wt(t,e+1);let i=Ne();return this.dr.forEachInRange([r,s],o=>{i=i.add(o.key)}),i}containsKey(e){const t=new Wt(e,0),r=this.Tr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class Wt{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return he.comparator(e.key,t.key)||Pe(e.wr,t.wr)}static Ar(e,t){return Pe(e.wr,t.wr)||he.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Px{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new lt(Wt.Er)}checkEmpty(e){return O.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new _f(i,t,r,s);this.mutationQueue.push(o);for(const a of s)this.br=this.br.add(new Wt(a.key,i)),this.indexManager.addToCollectionParentIndex(e,a.key.path.popLast());return O.resolve(o)}lookupMutationBatch(e,t){return O.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,s=this.vr(r),i=s<0?0:s;return O.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return O.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return O.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new Wt(t,0),s=new Wt(t,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([r,s],o=>{const a=this.Dr(o.wr);i.push(a)}),O.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new lt(Pe);return t.forEach(s=>{const i=new Wt(s,0),o=new Wt(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,o],a=>{r=r.add(a.wr)})}),O.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,s=r.length+1;let i=r;he.isDocumentKey(i)||(i=i.child(""));const o=new Wt(new he(i),0);let a=new lt(Pe);return this.br.forEachWhile(c=>{const u=c.key.path;return!!r.isPrefixOf(u)&&(u.length===s&&(a=a.add(c.wr)),!0)},o),O.resolve(this.Cr(a))}Cr(e){const t=[];return e.forEach(r=>{const s=this.Dr(r);s!==null&&t.push(s)}),t}removeMutationBatch(e,t){ge(this.Fr(t.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return O.forEach(t.mutations,s=>{const i=new Wt(s.key,t.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,t){const r=new Wt(t,0),s=this.br.firstAfterOrEqual(r);return O.resolve(t.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,O.resolve()}Fr(e,t){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sx{constructor(e){this.Mr=e,this.docs=function(){return new pt(he.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,s=this.docs.get(r),i=s?s.size:0,o=this.Mr(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return O.resolve(r?r.document.mutableCopy():mt.newInvalidDocument(t))}getEntries(e,t){let r=Dn();return t.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():mt.newInvalidDocument(s))}),O.resolve(r)}getDocumentsMatchingQuery(e,t,r,s){let i=Dn();const o=t.path,a=new he(o.child("")),c=this.docs.getIteratorFrom(a);for(;c.hasNext();){const{key:u,value:{document:d}}=c.getNext();if(!o.isPrefixOf(u.path))break;u.path.length>o.length+1||cf(wv(d),r)<=0||(s.has(d.key)||_l(t,d))&&(i=i.insert(d.key,d.mutableCopy()))}return O.resolve(i)}getAllFromCollectionGroup(e,t,r,s){pe()}Or(e,t){return O.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new xx(this)}getSize(e){return O.resolve(this.size)}}class xx extends D0{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?t.push(this.cr.addEntry(e,s)):this.cr.removeEntry(r)}),O.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rx{constructor(e){this.persistence=e,this.Nr=new qr(t=>oi(t),ml),this.lastRemoteSnapshotVersion=ve.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Af,this.targetCount=0,this.kr=di.Bn()}forEachTarget(e,t){return this.Nr.forEach((r,s)=>t(s)),O.resolve()}getLastRemoteSnapshotVersion(e){return O.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return O.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),O.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Lr&&(this.Lr=t),O.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new di(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,O.resolve()}updateTargetData(e,t){return this.Kn(t),O.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,O.resolve()}removeTargets(e,t,r){let s=0;const i=[];return this.Nr.forEach((o,a)=>{a.sequenceNumber<=t&&r.get(a.targetId)===null&&(this.Nr.delete(o),i.push(this.removeMatchingKeysForTargetId(e,a.targetId)),s++)}),O.waitFor(i).next(()=>s)}getTargetCount(e){return O.resolve(this.targetCount)}getTargetData(e,t){const r=this.Nr.get(t)||null;return O.resolve(r)}addMatchingKeys(e,t,r){return this.Br.Rr(t,r),O.resolve()}removeMatchingKeys(e,t,r){this.Br.mr(t,r);const s=this.persistence.referenceDelegate,i=[];return s&&t.forEach(o=>{i.push(s.markPotentiallyOrphaned(e,o))}),O.waitFor(i)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),O.resolve()}getMatchingKeysForTargetId(e,t){const r=this.Br.yr(t);return O.resolve(r)}containsKey(e,t){return O.resolve(this.Br.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pf{constructor(e,t){this.qr={},this.overlays={},this.Qr=new Cn(0),this.Kr=!1,this.Kr=!0,this.$r=new Ax,this.referenceDelegate=e(this),this.Ur=new Rx(this),this.indexManager=new px,this.remoteDocumentCache=function(s){return new Sx(s)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new E0(t),this.Gr=new Ex(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new Tx,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.qr[e.toKey()];return r||(r=new Px(t,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,r){J("MemoryPersistence","Starting transaction:",e);const s=new Cx(this.Qr.next());return this.referenceDelegate.zr(),r(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(e,t){return O.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,t)))}}class Cx extends Iv{constructor(e){super(),this.currentSequenceNumber=e}}class Ou{constructor(e){this.persistence=e,this.Jr=new Af,this.Yr=null}static Zr(e){return new Ou(e)}get Xr(){if(this.Yr)return this.Yr;throw pe()}addReference(e,t,r){return this.Jr.addReference(r,t),this.Xr.delete(r.toString()),O.resolve()}removeReference(e,t,r){return this.Jr.removeReference(r,t),this.Xr.add(r.toString()),O.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),O.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach(s=>this.Xr.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>r.removeTargetData(e,t))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return O.forEach(this.Xr,r=>{const s=he.fromPath(r);return this.ei(e,s).next(i=>{i||t.removeEntry(s,ve.min())})}).next(()=>(this.Yr=null,t.apply(e)))}updateLimboDocument(e,t){return this.ei(e,t).next(r=>{r?this.Xr.delete(t.toString()):this.Xr.add(t.toString())})}Wr(e){return 0}ei(e,t){return O.or([()=>O.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}class Yc{constructor(e,t){this.persistence=e,this.ti=new qr(r=>yn(r.path),(r,s)=>r.isEqual(s)),this.garbageCollector=k0(this,t)}static Zr(e,t){return new Yc(e,t)}zr(){}jr(e){return O.resolve()}forEachTarget(e,t){return this.persistence.getTargetCache().forEachTarget(e,t)}Yn(e){const t=this.er(e);return this.persistence.getTargetCache().getTargetCount(e).next(r=>t.next(s=>r+s))}er(e){let t=0;return this.Zn(e,r=>{t++}).next(()=>t)}Zn(e,t){return O.forEach(this.ti,(r,s)=>this.nr(e,r,s).next(i=>i?O.resolve():t(s)))}removeTargets(e,t,r){return this.persistence.getTargetCache().removeTargets(e,t,r)}removeOrphanedDocuments(e,t){let r=0;const s=this.persistence.getRemoteDocumentCache(),i=s.newChangeBuffer();return s.Or(e,o=>this.nr(e,o,t).next(a=>{a||(r++,i.removeEntry(o,ve.min()))})).next(()=>i.apply(e)).next(()=>r)}markPotentiallyOrphaned(e,t){return this.ti.set(t,e.currentSequenceNumber),O.resolve()}removeTarget(e,t){const r=t.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,r)}addReference(e,t,r){return this.ti.set(r,e.currentSequenceNumber),O.resolve()}removeReference(e,t,r){return this.ti.set(r,e.currentSequenceNumber),O.resolve()}updateLimboDocument(e,t){return this.ti.set(t,e.currentSequenceNumber),O.resolve()}Wr(e){let t=e.key.toString().length;return e.isFoundDocument()&&(t+=Ec(e.data.value)),t}nr(e,t,r){return O.or([()=>this.persistence.Hr(e,t),()=>this.persistence.getTargetCache().containsKey(e,t),()=>{const s=this.ti.get(t);return O.resolve(s!==void 0&&s>r)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kx{constructor(e){this.serializer=e}O(e,t,r,s){const i=new Pu("createOrUpgrade",t);r<1&&s>=1&&(function(c){c.createObjectStore("owner")}(e),function(c){c.createObjectStore("mutationQueues",{keyPath:"userId"}),c.createObjectStore("mutations",{keyPath:"batchId",autoIncrement:!0}).createIndex("userMutationsIndex",eg,{unique:!0}),c.createObjectStore("documentMutations")}(e),jg(e),function(c){c.createObjectStore("remoteDocuments")}(e));let o=O.resolve();return r<3&&s>=3&&(r!==0&&(function(c){c.deleteObjectStore("targetDocuments"),c.deleteObjectStore("targets"),c.deleteObjectStore("targetGlobal")}(e),jg(e)),o=o.next(()=>function(c){const u=c.store("targetGlobal"),d={highestTargetId:0,highestListenSequenceNumber:0,lastRemoteSnapshotVersion:ve.min().toTimestamp(),targetCount:0};return u.put("targetGlobalKey",d)}(i))),r<4&&s>=4&&(r!==0&&(o=o.next(()=>function(c,u){return u.store("mutations").U().next(d=>{c.deleteObjectStore("mutations"),c.createObjectStore("mutations",{keyPath:"batchId",autoIncrement:!0}).createIndex("userMutationsIndex",eg,{unique:!0});const f=u.store("mutations"),g=d.map(_=>f.put(_));return O.waitFor(g)})}(e,i))),o=o.next(()=>{(function(c){c.createObjectStore("clientMetadata",{keyPath:"clientId"})})(e)})),r<5&&s>=5&&(o=o.next(()=>this.ni(i))),r<6&&s>=6&&(o=o.next(()=>(function(c){c.createObjectStore("remoteDocumentGlobal")}(e),this.ri(i)))),r<7&&s>=7&&(o=o.next(()=>this.ii(i))),r<8&&s>=8&&(o=o.next(()=>this.si(e,i))),r<9&&s>=9&&(o=o.next(()=>{(function(c){c.objectStoreNames.contains("remoteDocumentChanges")&&c.deleteObjectStore("remoteDocumentChanges")})(e)})),r<10&&s>=10&&(o=o.next(()=>this.oi(i))),r<11&&s>=11&&(o=o.next(()=>{(function(c){c.createObjectStore("bundles",{keyPath:"bundleId"})})(e),function(c){c.createObjectStore("namedQueries",{keyPath:"name"})}(e)})),r<12&&s>=12&&(o=o.next(()=>{(function(c){const u=c.createObjectStore("documentOverlays",{keyPath:mS});u.createIndex("collectionPathOverlayIndex",gS,{unique:!1}),u.createIndex("collectionGroupOverlayIndex",_S,{unique:!1})})(e)})),r<13&&s>=13&&(o=o.next(()=>function(c){const u=c.createObjectStore("remoteDocumentsV14",{keyPath:sS});u.createIndex("documentKeyIndex",iS),u.createIndex("collectionGroupIndex",oS)}(e)).next(()=>this._i(e,i)).next(()=>e.deleteObjectStore("remoteDocuments"))),r<14&&s>=14&&(o=o.next(()=>this.ai(e,i))),r<15&&s>=15&&(o=o.next(()=>function(c){c.createObjectStore("indexConfiguration",{keyPath:"indexId",autoIncrement:!0}).createIndex("collectionGroupIndex","collectionGroup",{unique:!1}),c.createObjectStore("indexState",{keyPath:dS}).createIndex("sequenceNumberIndex",hS,{unique:!1}),c.createObjectStore("indexEntries",{keyPath:fS}).createIndex("documentKeyIndex",pS,{unique:!1})}(e))),r<16&&s>=16&&(o=o.next(()=>{t.objectStore("indexState").clear()}).next(()=>{t.objectStore("indexEntries").clear()})),r<17&&s>=17&&(o=o.next(()=>{(function(c){c.createObjectStore("globals",{keyPath:"name"})})(e)})),o}ri(e){let t=0;return e.store("remoteDocuments").J((r,s)=>{t+=Jc(s)}).next(()=>{const r={byteSize:t};return e.store("remoteDocumentGlobal").put("remoteDocumentGlobalKey",r)})}ni(e){const t=e.store("mutationQueues"),r=e.store("mutations");return t.U().next(s=>O.forEach(s,i=>{const o=IDBKeyRange.bound([i.userId,-1],[i.userId,i.lastAcknowledgedBatchId]);return r.U("userMutationsIndex",o).next(a=>O.forEach(a,c=>{ge(c.userId===i.userId);const u=Hs(this.serializer,c);return S0(e,i.userId,u).next(()=>{})}))}))}ii(e){const t=e.store("targetDocuments"),r=e.store("remoteDocuments");return e.store("targetGlobal").get("targetGlobalKey").next(s=>{const i=[];return r.J((o,a)=>{const c=new ze(o),u=function(f){return[0,yn(f)]}(c);i.push(t.get(u).next(d=>d?O.resolve():(f=>t.put({targetId:0,path:yn(f),sequenceNumber:s.highestListenSequenceNumber}))(c)))}).next(()=>O.waitFor(i))})}si(e,t){e.createObjectStore("collectionParents",{keyPath:uS});const r=t.store("collectionParents"),s=new Tf,i=o=>{if(s.add(o)){const a=o.lastSegment(),c=o.popLast();return r.put({collectionId:a,parent:yn(c)})}};return t.store("remoteDocuments").J({H:!0},(o,a)=>{const c=new ze(o);return i(c.popLast())}).next(()=>t.store("documentMutations").J({H:!0},([o,a,c],u)=>{const d=or(a);return i(d.popLast())}))}oi(e){const t=e.store("targets");return t.J((r,s)=>{const i=va(s),o=T0(this.serializer,i);return t.put(o)})}_i(e,t){const r=t.store("remoteDocuments"),s=[];return r.J((i,o)=>{const a=t.store("remoteDocumentsV14"),c=function(f){return f.document?new he(ze.fromString(f.document.name).popFirst(5)):f.noDocument?he.fromSegments(f.noDocument.path):f.unknownDocument?he.fromSegments(f.unknownDocument.path):pe()}(o).path.toArray(),u={prefixPath:c.slice(0,c.length-2),collectionGroup:c[c.length-2],documentId:c[c.length-1],readTime:o.readTime||[0,0],unknownDocument:o.unknownDocument,noDocument:o.noDocument,document:o.document,hasCommittedMutations:!!o.hasCommittedMutations};s.push(a.put(u))}).next(()=>O.waitFor(s))}ai(e,t){const r=t.store("mutations"),s=V0(this.serializer),i=new Pf(Ou.Zr,this.serializer.ct);return r.U().next(o=>{const a=new Map;return o.forEach(c=>{var u;let d=(u=a.get(c.userId))!==null&&u!==void 0?u:Ne();Hs(this.serializer,c).keys().forEach(f=>d=d.add(f)),a.set(c.userId,d)}),O.forEach(a,(c,u)=>{const d=new Qt(u),f=Vu.lt(this.serializer,d),g=i.getIndexManager(d),_=Nu.lt(d,this.serializer,g,i.referenceDelegate);return new N0(s,_,f,g).recalculateAndSaveOverlaysForDocumentKeys(new mh(t,Cn.oe),c).next()})})}}function jg(n){n.createObjectStore("targetDocuments",{keyPath:lS}).createIndex("documentTargetsIndex",cS,{unique:!0}),n.createObjectStore("targets",{keyPath:"targetId"}).createIndex("queryTargetsIndex",aS,{unique:!0}),n.createObjectStore("targetGlobal")}const Od="Failed to obtain exclusive access to the persistence layer. To allow shared access, multi-tab synchronization has to be enabled in all tabs. If you are using `experimentalForceOwningTab:true`, make sure that only one tab has persistence enabled at any given time.";class Sf{constructor(e,t,r,s,i,o,a,c,u,d,f=17){if(this.allowTabSynchronization=e,this.persistenceKey=t,this.clientId=r,this.ui=i,this.window=o,this.document=a,this.ci=u,this.li=d,this.hi=f,this.Qr=null,this.Kr=!1,this.isPrimary=!1,this.networkEnabled=!0,this.Pi=null,this.inForeground=!1,this.Ii=null,this.Ti=null,this.Ei=Number.NEGATIVE_INFINITY,this.di=g=>Promise.resolve(),!Sf.D())throw new Y(U.UNIMPLEMENTED,"This platform is either missing IndexedDB or is known to have an incomplete implementation. Offline persistence has been disabled.");this.referenceDelegate=new vx(this,s),this.Ai=t+"main",this.serializer=new E0(c),this.Ri=new ur(this.Ai,this.hi,new kx(this.serializer)),this.$r=new lx,this.Ur=new gx(this.referenceDelegate,this.serializer),this.remoteDocumentCache=V0(this.serializer),this.Gr=new ax,this.window&&this.window.localStorage?this.Vi=this.window.localStorage:(this.Vi=null,d===!1&&Nt("IndexedDbPersistence","LocalStorage is unavailable. As a result, persistence may not work reliably. In particular enablePersistence() could fail immediately after refreshing the page."))}start(){return this.mi().then(()=>{if(!this.isPrimary&&!this.allowTabSynchronization)throw new Y(U.FAILED_PRECONDITION,Od);return this.fi(),this.gi(),this.pi(),this.runTransaction("getHighestListenSequenceNumber","readonly",e=>this.Ur.getHighestSequenceNumber(e))}).then(e=>{this.Qr=new Cn(e,this.ci)}).then(()=>{this.Kr=!0}).catch(e=>(this.Ri&&this.Ri.close(),Promise.reject(e)))}yi(e){return this.di=async t=>{if(this.started)return e(t)},e(this.isPrimary)}setDatabaseDeletedListener(e){this.Ri.L(async t=>{t.newVersion===null&&await e()})}setNetworkEnabled(e){this.networkEnabled!==e&&(this.networkEnabled=e,this.ui.enqueueAndForget(async()=>{this.started&&await this.mi()}))}mi(){return this.runTransaction("updateClientMetadataAndTryBecomePrimary","readwrite",e=>uc(e).put({clientId:this.clientId,updateTimeMs:Date.now(),networkEnabled:this.networkEnabled,inForeground:this.inForeground}).next(()=>{if(this.isPrimary)return this.wi(e).next(t=>{t||(this.isPrimary=!1,this.ui.enqueueRetryable(()=>this.di(!1)))})}).next(()=>this.Si(e)).next(t=>this.isPrimary&&!t?this.bi(e).next(()=>!1):!!t&&this.Di(e).next(()=>!0))).catch(e=>{if(Ds(e))return J("IndexedDbPersistence","Failed to extend owner lease: ",e),this.isPrimary;if(!this.allowTabSynchronization)throw e;return J("IndexedDbPersistence","Releasing owner lease after error during lease refresh",e),!1}).then(e=>{this.isPrimary!==e&&this.ui.enqueueRetryable(()=>this.di(e)),this.isPrimary=e})}wi(e){return ua(e).get("owner").next(t=>O.resolve(this.vi(t)))}Ci(e){return uc(e).delete(this.clientId)}async Fi(){if(this.isPrimary&&!this.Mi(this.Ei,18e5)){this.Ei=Date.now();const e=await this.runTransaction("maybeGarbageCollectMultiClientState","readwrite-primary",t=>{const r=Gt(t,"clientMetadata");return r.U().next(s=>{const i=this.xi(s,18e5),o=s.filter(a=>i.indexOf(a)===-1);return O.forEach(o,a=>r.delete(a.clientId)).next(()=>o)})}).catch(()=>[]);if(this.Vi)for(const t of e)this.Vi.removeItem(this.Oi(t.clientId))}}pi(){this.Ti=this.ui.enqueueAfterDelay("client_metadata_refresh",4e3,()=>this.mi().then(()=>this.Fi()).then(()=>this.pi()))}vi(e){return!!e&&e.ownerId===this.clientId}Si(e){return this.li?O.resolve(!0):ua(e).get("owner").next(t=>{if(t!==null&&this.Mi(t.leaseTimestampMs,5e3)&&!this.Ni(t.ownerId)){if(this.vi(t)&&this.networkEnabled)return!0;if(!this.vi(t)){if(!t.allowTabSynchronization)throw new Y(U.FAILED_PRECONDITION,Od);return!1}}return!(!this.networkEnabled||!this.inForeground)||uc(e).U().next(r=>this.xi(r,5e3).find(s=>{if(this.clientId!==s.clientId){const i=!this.networkEnabled&&s.networkEnabled,o=!this.inForeground&&s.inForeground,a=this.networkEnabled===s.networkEnabled;if(i||o&&a)return!0}return!1})===void 0)}).next(t=>(this.isPrimary!==t&&J("IndexedDbPersistence",`Client ${t?"is":"is not"} eligible for a primary lease.`),t))}async shutdown(){this.Kr=!1,this.Li(),this.Ti&&(this.Ti.cancel(),this.Ti=null),this.Bi(),this.ki(),await this.Ri.runTransaction("shutdown","readwrite",["owner","clientMetadata"],e=>{const t=new mh(e,Cn.oe);return this.bi(t).next(()=>this.Ci(t))}),this.Ri.close(),this.qi()}xi(e,t){return e.filter(r=>this.Mi(r.updateTimeMs,t)&&!this.Ni(r.clientId))}Qi(){return this.runTransaction("getActiveClients","readonly",e=>uc(e).U().next(t=>this.xi(t,18e5).map(r=>r.clientId)))}get started(){return this.Kr}getGlobalsCache(){return this.$r}getMutationQueue(e,t){return Nu.lt(e,this.serializer,t,this.referenceDelegate)}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getIndexManager(e){return new mx(e,this.serializer.ct.databaseId)}getDocumentOverlayCache(e){return Vu.lt(this.serializer,e)}getBundleCache(){return this.Gr}runTransaction(e,t,r){J("IndexedDbPersistence","Starting transaction:",e);const s=t==="readonly"?"readonly":"readwrite",i=function(c){return c===17?wS:c===16?vS:c===15?df:c===14?xv:c===13?Sv:c===12?yS:c===11?Pv:void pe()}(this.hi);let o;return this.Ri.runTransaction(e,s,i,a=>(o=new mh(a,this.Qr?this.Qr.next():Cn.oe),t==="readwrite-primary"?this.wi(o).next(c=>!!c||this.Si(o)).next(c=>{if(!c)throw Nt(`Failed to obtain primary lease for action '${e}'.`),this.isPrimary=!1,this.ui.enqueueRetryable(()=>this.di(!1)),new Y(U.FAILED_PRECONDITION,bv);return r(o)}).next(c=>this.Di(o).next(()=>c)):this.Ki(o).next(()=>r(o)))).then(a=>(o.raiseOnCommittedEvent(),a))}Ki(e){return ua(e).get("owner").next(t=>{if(t!==null&&this.Mi(t.leaseTimestampMs,5e3)&&!this.Ni(t.ownerId)&&!this.vi(t)&&!(this.li||this.allowTabSynchronization&&t.allowTabSynchronization))throw new Y(U.FAILED_PRECONDITION,Od)})}Di(e){const t={ownerId:this.clientId,allowTabSynchronization:this.allowTabSynchronization,leaseTimestampMs:Date.now()};return ua(e).put("owner",t)}static D(){return ur.D()}bi(e){const t=ua(e);return t.get("owner").next(r=>this.vi(r)?(J("IndexedDbPersistence","Releasing primary lease."),t.delete("owner")):O.resolve())}Mi(e,t){const r=Date.now();return!(e<r-t)&&(!(e>r)||(Nt(`Detected an update time that is in the future: ${e} > ${r}`),!1))}fi(){this.document!==null&&typeof this.document.addEventListener=="function"&&(this.Ii=()=>{this.ui.enqueueAndForget(()=>(this.inForeground=this.document.visibilityState==="visible",this.mi()))},this.document.addEventListener("visibilitychange",this.Ii),this.inForeground=this.document.visibilityState==="visible")}Bi(){this.Ii&&(this.document.removeEventListener("visibilitychange",this.Ii),this.Ii=null)}gi(){var e;typeof((e=this.window)===null||e===void 0?void 0:e.addEventListener)=="function"&&(this.Pi=()=>{this.Li();const t=/(?:Version|Mobile)\/1[456]/;tv()&&(navigator.appVersion.match(t)||navigator.userAgent.match(t))&&this.ui.enterRestrictedMode(!0),this.ui.enqueueAndForget(()=>this.shutdown())},this.window.addEventListener("pagehide",this.Pi))}ki(){this.Pi&&(this.window.removeEventListener("pagehide",this.Pi),this.Pi=null)}Ni(e){var t;try{const r=((t=this.Vi)===null||t===void 0?void 0:t.getItem(this.Oi(e)))!==null;return J("IndexedDbPersistence",`Client '${e}' ${r?"is":"is not"} zombied in LocalStorage`),r}catch(r){return Nt("IndexedDbPersistence","Failed to get zombied client id.",r),!1}}Li(){if(this.Vi)try{this.Vi.setItem(this.Oi(this.clientId),String(Date.now()))}catch(e){Nt("Failed to set zombie client id.",e)}}qi(){if(this.Vi)try{this.Vi.removeItem(this.Oi(this.clientId))}catch{}}Oi(e){return`firestore_zombie_${this.persistenceKey}_${e}`}}function ua(n){return Gt(n,"owner")}function uc(n){return Gt(n,"clientMetadata")}function xf(n,e){let t=n.projectId;return n.isDefaultDatabase||(t+="."+n.database),"firestore/"+e+"/"+t+"/"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rf{constructor(e,t,r,s){this.targetId=e,this.fromCache=t,this.$i=r,this.Ui=s}static Wi(e,t){let r=Ne(),s=Ne();for(const i of t.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new Rf(e,t.fromCache,r,s)}}/**
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
 */class Dx{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class O0{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return tv()?8:Ev(zt())>0?6:4}()}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,r,s){const i={result:null};return this.Yi(e,t).next(o=>{i.result=o}).next(()=>{if(!i.result)return this.Zi(e,t,s,r).next(o=>{i.result=o})}).next(()=>{if(i.result)return;const o=new Dx;return this.Xi(e,t,o).next(a=>{if(i.result=a,this.zi)return this.es(e,t,o,a.size)})}).next(()=>i.result)}es(e,t,r,s){return r.documentReadCount<this.ji?(zi()<=qe.DEBUG&&J("QueryEngine","SDK will not create cache indexes for query:",Gi(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),O.resolve()):(zi()<=qe.DEBUG&&J("QueryEngine","Query:",Gi(t),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Hi*s?(zi()<=qe.DEBUG&&J("QueryEngine","The SDK decides to create cache indexes for query:",Gi(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,vn(t))):O.resolve())}Yi(e,t){if(fg(t))return O.resolve(null);let r=vn(t);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(t.limit!==null&&s===1&&(t=Kc(t,null,"F"),r=vn(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const o=Ne(...i);return this.Ji.getDocuments(e,o).next(a=>this.indexManager.getMinOffset(e,r).next(c=>{const u=this.ts(t,a);return this.ns(t,u,o,c.readTime)?this.Yi(e,Kc(t,null,"F")):this.rs(e,u,t,c)}))})))}Zi(e,t,r,s){return fg(t)||s.isEqual(ve.min())?O.resolve(null):this.Ji.getDocuments(e,r).next(i=>{const o=this.ts(t,i);return this.ns(t,o,r,s)?O.resolve(null):(zi()<=qe.DEBUG&&J("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Gi(t)),this.rs(e,o,t,vv(s,-1)).next(a=>a))})}ts(e,t){let r=new lt(Hv(e));return t.forEach((s,i)=>{_l(e,i)&&(r=r.add(i))}),r}ns(e,t,r,s){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const i=e.limitType==="F"?t.last():t.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(e,t,r){return zi()<=qe.DEBUG&&J("QueryEngine","Using full collection scan to execute query:",Gi(t)),this.Ji.getDocumentsMatchingQuery(e,t,Bn.min(),r)}rs(e,t,r,s){return this.Ji.getDocumentsMatchingQuery(e,r,s).next(i=>(t.forEach(o=>{i=i.insert(o.key,o)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vx{constructor(e,t,r,s){this.persistence=e,this.ss=t,this.serializer=s,this.os=new pt(Pe),this._s=new qr(i=>oi(i),ml),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new N0(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.os))}}function M0(n,e,t,r){return new Vx(n,e,t,r)}async function L0(n,e){const t=ae(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let s;return t.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,t.ls(e),t.mutationQueue.getAllMutationBatches(r))).next(i=>{const o=[],a=[];let c=Ne();for(const u of s){o.push(u.batchId);for(const d of u.mutations)c=c.add(d.key)}for(const u of i){a.push(u.batchId);for(const d of u.mutations)c=c.add(d.key)}return t.localDocuments.getDocuments(r,c).next(u=>({hs:u,removedBatchIds:o,addedBatchIds:a}))})})}function Nx(n,e){const t=ae(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=t.cs.newChangeBuffer({trackRemovals:!0});return function(a,c,u,d){const f=u.batch,g=f.keys();let _=O.resolve();return g.forEach(k=>{_=_.next(()=>d.getEntry(c,k)).next(T=>{const C=u.docVersions.get(k);ge(C!==null),T.version.compareTo(C)<0&&(f.applyToRemoteDocument(T,u),T.isValidDocument()&&(T.setReadTime(u.commitVersion),d.addEntry(T)))})}),_.next(()=>a.mutationQueue.removeMutationBatch(c,f))}(t,r,e,i).next(()=>i.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(a){let c=Ne();for(let u=0;u<a.mutationResults.length;++u)a.mutationResults[u].transformResults.length>0&&(c=c.add(a.batch.mutations[u].key));return c}(e))).next(()=>t.localDocuments.getDocuments(r,s))})}function F0(n){const e=ae(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ur.getLastRemoteSnapshotVersion(t))}function Ox(n,e){const t=ae(n),r=e.snapshotVersion;let s=t.os;return t.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const o=t.cs.newChangeBuffer({trackRemovals:!0});s=t.os;const a=[];e.targetChanges.forEach((d,f)=>{const g=s.get(f);if(!g)return;a.push(t.Ur.removeMatchingKeys(i,d.removedDocuments,f).next(()=>t.Ur.addMatchingKeys(i,d.addedDocuments,f)));let _=g.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(f)!==null?_=_.withResumeToken(Ct.EMPTY_BYTE_STRING,ve.min()).withLastLimboFreeSnapshotVersion(ve.min()):d.resumeToken.approximateByteSize()>0&&(_=_.withResumeToken(d.resumeToken,r)),s=s.insert(f,_),function(T,C,F){return T.resumeToken.approximateByteSize()===0||C.snapshotVersion.toMicroseconds()-T.snapshotVersion.toMicroseconds()>=3e8?!0:F.addedDocuments.size+F.modifiedDocuments.size+F.removedDocuments.size>0}(g,_,d)&&a.push(t.Ur.updateTargetData(i,_))});let c=Dn(),u=Ne();if(e.documentUpdates.forEach(d=>{e.resolvedLimboDocuments.has(d)&&a.push(t.persistence.referenceDelegate.updateLimboDocument(i,d))}),a.push(U0(i,o,e.documentUpdates).next(d=>{c=d.Ps,u=d.Is})),!r.isEqual(ve.min())){const d=t.Ur.getLastRemoteSnapshotVersion(i).next(f=>t.Ur.setTargetsMetadata(i,i.currentSequenceNumber,r));a.push(d)}return O.waitFor(a).next(()=>o.apply(i)).next(()=>t.localDocuments.getLocalViewOfDocuments(i,c,u)).next(()=>c)}).then(i=>(t.os=s,i))}function U0(n,e,t){let r=Ne(),s=Ne();return t.forEach(i=>r=r.add(i)),e.getEntries(n,r).next(i=>{let o=Dn();return t.forEach((a,c)=>{const u=i.get(a);c.isFoundDocument()!==u.isFoundDocument()&&(s=s.add(a)),c.isNoDocument()&&c.version.isEqual(ve.min())?(e.removeEntry(a,c.readTime),o=o.insert(a,c)):!u.isValidDocument()||c.version.compareTo(u.version)>0||c.version.compareTo(u.version)===0&&u.hasPendingWrites?(e.addEntry(c),o=o.insert(a,c)):J("LocalStore","Ignoring outdated watch update for ",a,". Current version:",u.version," Watch version:",c.version)}),{Ps:o,Is:s}})}function Mx(n,e){const t=ae(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function wo(n,e){const t=ae(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return t.Ur.getTargetData(r,e).next(i=>i?(s=i,O.resolve(s)):t.Ur.allocateTargetId(r).next(o=>(s=new Sr(e,o,"TargetPurposeListen",r.currentSequenceNumber),t.Ur.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=t.os.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(t.os=t.os.insert(r.targetId,r),t._s.set(e,r.targetId)),r})}async function bo(n,e,t){const r=ae(n),s=r.os.get(e),i=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",i,o=>r.persistence.referenceDelegate.removeTarget(o,s))}catch(o){if(!Ds(o))throw o;J("LocalStore",`Failed to update sequence numbers for target ${e}: ${o}`)}r.os=r.os.remove(e),r._s.delete(s.target)}function Xc(n,e,t){const r=ae(n);let s=ve.min(),i=Ne();return r.persistence.runTransaction("Execute query","readwrite",o=>function(c,u,d){const f=ae(c),g=f._s.get(d);return g!==void 0?O.resolve(f.os.get(g)):f.Ur.getTargetData(u,d)}(r,o,vn(e)).next(a=>{if(a)return s=a.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(o,a.targetId).next(c=>{i=c})}).next(()=>r.ss.getDocumentsMatchingQuery(o,e,t?s:ve.min(),t?i:Ne())).next(a=>($0(r,Kv(e),a),{documents:a,Ts:i})))}function B0(n,e){const t=ae(n),r=ae(t.Ur),s=t.os.get(e);return s?Promise.resolve(s.target):t.persistence.runTransaction("Get target data","readonly",i=>r.ot(i,e).next(o=>o?o.target:null))}function j0(n,e){const t=ae(n),r=t.us.get(e)||ve.min();return t.persistence.runTransaction("Get new document changes","readonly",s=>t.cs.getAllFromCollectionGroup(s,e,vv(r,-1),Number.MAX_SAFE_INTEGER)).then(s=>($0(t,e,s),s))}function $0(n,e,t){let r=n.us.get(e)||ve.min();t.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),n.us.set(e,r)}async function Lx(n,e,t,r){const s=ae(n);let i=Ne(),o=Dn();for(const u of t){const d=e.Es(u.metadata.name);u.document&&(i=i.add(d));const f=e.ds(u);f.setReadTime(e.As(u.metadata.readTime)),o=o.insert(d,f)}const a=s.cs.newChangeBuffer({trackRemovals:!0}),c=await wo(s,function(d){return vn(ko(ze.fromString(`__bundle__/docs/${d}`)))}(r));return s.persistence.runTransaction("Apply bundle documents","readwrite",u=>U0(u,a,o).next(d=>(a.apply(u),d)).next(d=>s.Ur.removeMatchingKeysForTargetId(u,c.targetId).next(()=>s.Ur.addMatchingKeys(u,i,c.targetId)).next(()=>s.localDocuments.getLocalViewOfDocuments(u,d.Ps,d.Is)).next(()=>d.Ps)))}async function Fx(n,e,t=Ne()){const r=await wo(n,vn(If(e.bundledQuery))),s=ae(n);return s.persistence.runTransaction("Save named query","readwrite",i=>{const o=Mt(e.readTime);if(r.snapshotVersion.compareTo(o)>=0)return s.Gr.saveNamedQuery(i,e);const a=r.withResumeToken(Ct.EMPTY_BYTE_STRING,o);return s.os=s.os.insert(a.targetId,a),s.Ur.updateTargetData(i,a).next(()=>s.Ur.removeMatchingKeysForTargetId(i,r.targetId)).next(()=>s.Ur.addMatchingKeys(i,t,r.targetId)).next(()=>s.Gr.saveNamedQuery(i,e))})}function $g(n,e){return`firestore_clients_${n}_${e}`}function qg(n,e,t){let r=`firestore_mutations_${n}_${t}`;return e.isAuthenticated()&&(r+=`_${e.uid}`),r}function Md(n,e){return`firestore_targets_${n}_${e}`}class Zc{constructor(e,t,r,s){this.user=e,this.batchId=t,this.state=r,this.error=s}static Rs(e,t,r){const s=JSON.parse(r);let i,o=typeof s=="object"&&["pending","acknowledged","rejected"].indexOf(s.state)!==-1&&(s.error===void 0||typeof s.error=="object");return o&&s.error&&(o=typeof s.error.message=="string"&&typeof s.error.code=="string",o&&(i=new Y(s.error.code,s.error.message))),o?new Zc(e,t,s.state,i):(Nt("SharedClientState",`Failed to parse mutation state for ID '${t}': ${r}`),null)}Vs(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class Na{constructor(e,t,r){this.targetId=e,this.state=t,this.error=r}static Rs(e,t){const r=JSON.parse(t);let s,i=typeof r=="object"&&["not-current","current","rejected"].indexOf(r.state)!==-1&&(r.error===void 0||typeof r.error=="object");return i&&r.error&&(i=typeof r.error.message=="string"&&typeof r.error.code=="string",i&&(s=new Y(r.error.code,r.error.message))),i?new Na(e,r.state,s):(Nt("SharedClientState",`Failed to parse target state for ID '${e}': ${t}`),null)}Vs(){const e={state:this.state,updateTimeMs:Date.now()};return this.error&&(e.error={code:this.error.code,message:this.error.message}),JSON.stringify(e)}}class eu{constructor(e,t){this.clientId=e,this.activeTargetIds=t}static Rs(e,t){const r=JSON.parse(t);let s=typeof r=="object"&&r.activeTargetIds instanceof Array,i=pf();for(let o=0;s&&o<r.activeTargetIds.length;++o)s=Tv(r.activeTargetIds[o]),i=i.add(r.activeTargetIds[o]);return s?new eu(e,i):(Nt("SharedClientState",`Failed to parse client data for instance '${e}': ${t}`),null)}}class Cf{constructor(e,t){this.clientId=e,this.onlineState=t}static Rs(e){const t=JSON.parse(e);return typeof t=="object"&&["Unknown","Online","Offline"].indexOf(t.onlineState)!==-1&&typeof t.clientId=="string"?new Cf(t.clientId,t.onlineState):(Nt("SharedClientState",`Failed to parse online state: ${e}`),null)}}class Rh{constructor(){this.activeTargetIds=pf()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class Ld{constructor(e,t,r,s,i){this.window=e,this.ui=t,this.persistenceKey=r,this.ps=s,this.syncEngine=null,this.onlineStateHandler=null,this.sequenceNumberHandler=null,this.ys=this.ws.bind(this),this.Ss=new pt(Pe),this.started=!1,this.bs=[];const o=r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");this.storage=this.window.localStorage,this.currentUser=i,this.Ds=$g(this.persistenceKey,this.ps),this.vs=function(c){return`firestore_sequence_number_${c}`}(this.persistenceKey),this.Ss=this.Ss.insert(this.ps,new Rh),this.Cs=new RegExp(`^firestore_clients_${o}_([^_]*)$`),this.Fs=new RegExp(`^firestore_mutations_${o}_(\\d+)(?:_(.*))?$`),this.Ms=new RegExp(`^firestore_targets_${o}_(\\d+)$`),this.xs=function(c){return`firestore_online_state_${c}`}(this.persistenceKey),this.Os=function(c){return`firestore_bundle_loaded_v2_${c}`}(this.persistenceKey),this.window.addEventListener("storage",this.ys)}static D(e){return!(!e||!e.localStorage)}async start(){const e=await this.syncEngine.Qi();for(const r of e){if(r===this.ps)continue;const s=this.getItem($g(this.persistenceKey,r));if(s){const i=eu.Rs(r,s);i&&(this.Ss=this.Ss.insert(i.clientId,i))}}this.Ns();const t=this.storage.getItem(this.xs);if(t){const r=this.Ls(t);r&&this.Bs(r)}for(const r of this.bs)this.ws(r);this.bs=[],this.window.addEventListener("pagehide",()=>this.shutdown()),this.started=!0}writeSequenceNumber(e){this.setItem(this.vs,JSON.stringify(e))}getAllActiveQueryTargets(){return this.ks(this.Ss)}isActiveQueryTarget(e){let t=!1;return this.Ss.forEach((r,s)=>{s.activeTargetIds.has(e)&&(t=!0)}),t}addPendingMutation(e){this.qs(e,"pending")}updateMutationState(e,t,r){this.qs(e,t,r),this.Qs(e)}addLocalQueryTarget(e,t=!0){let r="not-current";if(this.isActiveQueryTarget(e)){const s=this.storage.getItem(Md(this.persistenceKey,e));if(s){const i=Na.Rs(e,s);i&&(r=i.state)}}return t&&this.Ks.fs(e),this.Ns(),r}removeLocalQueryTarget(e){this.Ks.gs(e),this.Ns()}isLocalQueryTarget(e){return this.Ks.activeTargetIds.has(e)}clearQueryState(e){this.removeItem(Md(this.persistenceKey,e))}updateQueryState(e,t,r){this.$s(e,t,r)}handleUserChange(e,t,r){t.forEach(s=>{this.Qs(s)}),this.currentUser=e,r.forEach(s=>{this.addPendingMutation(s)})}setOnlineState(e){this.Us(e)}notifyBundleLoaded(e){this.Ws(e)}shutdown(){this.started&&(this.window.removeEventListener("storage",this.ys),this.removeItem(this.Ds),this.started=!1)}getItem(e){const t=this.storage.getItem(e);return J("SharedClientState","READ",e,t),t}setItem(e,t){J("SharedClientState","SET",e,t),this.storage.setItem(e,t)}removeItem(e){J("SharedClientState","REMOVE",e),this.storage.removeItem(e)}ws(e){const t=e;if(t.storageArea===this.storage){if(J("SharedClientState","EVENT",t.key,t.newValue),t.key===this.Ds)return void Nt("Received WebStorage notification for local change. Another client might have garbage-collected our state");this.ui.enqueueRetryable(async()=>{if(this.started){if(t.key!==null){if(this.Cs.test(t.key)){if(t.newValue==null){const r=this.Gs(t.key);return this.zs(r,null)}{const r=this.js(t.key,t.newValue);if(r)return this.zs(r.clientId,r)}}else if(this.Fs.test(t.key)){if(t.newValue!==null){const r=this.Hs(t.key,t.newValue);if(r)return this.Js(r)}}else if(this.Ms.test(t.key)){if(t.newValue!==null){const r=this.Ys(t.key,t.newValue);if(r)return this.Zs(r)}}else if(t.key===this.xs){if(t.newValue!==null){const r=this.Ls(t.newValue);if(r)return this.Bs(r)}}else if(t.key===this.vs){const r=function(i){let o=Cn.oe;if(i!=null)try{const a=JSON.parse(i);ge(typeof a=="number"),o=a}catch(a){Nt("SharedClientState","Failed to read sequence number from WebStorage",a)}return o}(t.newValue);r!==Cn.oe&&this.sequenceNumberHandler(r)}else if(t.key===this.Os){const r=this.Xs(t.newValue);await Promise.all(r.map(s=>this.syncEngine.eo(s)))}}}else this.bs.push(t)})}}get Ks(){return this.Ss.get(this.ps)}Ns(){this.setItem(this.Ds,this.Ks.Vs())}qs(e,t,r){const s=new Zc(this.currentUser,e,t,r),i=qg(this.persistenceKey,this.currentUser,e);this.setItem(i,s.Vs())}Qs(e){const t=qg(this.persistenceKey,this.currentUser,e);this.removeItem(t)}Us(e){const t={clientId:this.ps,onlineState:e};this.storage.setItem(this.xs,JSON.stringify(t))}$s(e,t,r){const s=Md(this.persistenceKey,e),i=new Na(e,t,r);this.setItem(s,i.Vs())}Ws(e){const t=JSON.stringify(Array.from(e));this.setItem(this.Os,t)}Gs(e){const t=this.Cs.exec(e);return t?t[1]:null}js(e,t){const r=this.Gs(e);return eu.Rs(r,t)}Hs(e,t){const r=this.Fs.exec(e),s=Number(r[1]),i=r[2]!==void 0?r[2]:null;return Zc.Rs(new Qt(i),s,t)}Ys(e,t){const r=this.Ms.exec(e),s=Number(r[1]);return Na.Rs(s,t)}Ls(e){return Cf.Rs(e)}Xs(e){return JSON.parse(e)}async Js(e){if(e.user.uid===this.currentUser.uid)return this.syncEngine.no(e.batchId,e.state,e.error);J("SharedClientState",`Ignoring mutation for non-active user ${e.user.uid}`)}Zs(e){return this.syncEngine.ro(e.targetId,e.state,e.error)}zs(e,t){const r=t?this.Ss.insert(e,t):this.Ss.remove(e),s=this.ks(this.Ss),i=this.ks(r),o=[],a=[];return i.forEach(c=>{s.has(c)||o.push(c)}),s.forEach(c=>{i.has(c)||a.push(c)}),this.syncEngine.io(o,a).then(()=>{this.Ss=r})}Bs(e){this.Ss.get(e.clientId)&&this.onlineStateHandler(e.onlineState)}ks(e){let t=pf();return e.forEach((r,s)=>{t=t.unionWith(s.activeTargetIds)}),t}}class q0{constructor(){this.so=new Rh,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,r){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Rh,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class Ux{_o(e){}shutdown(){}}/**
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
 */class zg{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){J("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){J("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let dc=null;function Fd(){return dc===null?dc=function(){return 268435456+Math.round(2147483648*Math.random())}():dc++,"0x"+dc.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Bx={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jx{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fn="WebChannelConnection";class $x extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const r=t.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+t.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(t,r,s,i,o){const a=Fd(),c=this.xo(t,r.toUriEncodedString());J("RestConnection",`Sending RPC '${t}' ${a}:`,c,s);const u={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(u,i,o),this.No(t,c,u,s).then(d=>(J("RestConnection",`Received RPC '${t}' ${a}: `,d),d),d=>{throw qn("RestConnection",`RPC '${t}' ${a} failed with error: `,d,"url: ",c,"request:",s),d})}Lo(t,r,s,i,o,a){return this.Mo(t,r,s,i,o)}Oo(t,r,s){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Co}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((i,o)=>t[o]=i),s&&s.headers.forEach((i,o)=>t[o]=i)}xo(t,r){const s=Bx[t];return`${this.Do}/v1/${r}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,r,s){const i=Fd();return new Promise((o,a)=>{const c=new uv;c.setWithCredentials(!0),c.listenOnce(dv.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case wc.NO_ERROR:const d=c.getResponseJson();J(fn,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(d)),o(d);break;case wc.TIMEOUT:J(fn,`RPC '${e}' ${i} timed out`),a(new Y(U.DEADLINE_EXCEEDED,"Request time out"));break;case wc.HTTP_ERROR:const f=c.getStatus();if(J(fn,`RPC '${e}' ${i} failed with status:`,f,"response text:",c.getResponseText()),f>0){let g=c.getResponseJson();Array.isArray(g)&&(g=g[0]);const _=g==null?void 0:g.error;if(_&&_.status&&_.message){const k=function(C){const F=C.toLowerCase().replace(/_/g,"-");return Object.values(U).indexOf(F)>=0?F:U.UNKNOWN}(_.status);a(new Y(k,_.message))}else a(new Y(U.UNKNOWN,"Server responded with status "+c.getStatus()))}else a(new Y(U.UNAVAILABLE,"Connection failed."));break;default:pe()}}finally{J(fn,`RPC '${e}' ${i} completed.`)}});const u=JSON.stringify(s);J(fn,`RPC '${e}' ${i} sending request:`,s),c.send(t,"POST",u,r,15)})}Bo(e,t,r){const s=Fd(),i=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=pv(),a=fv(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(c.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Oo(c.initMessageHeaders,t,r),c.encodeInitMessageHeaders=!0;const d=i.join("");J(fn,`Creating RPC '${e}' stream ${s}: ${d}`,c);const f=o.createWebChannel(d,c);let g=!1,_=!1;const k=new jx({Io:C=>{_?J(fn,`Not sending because RPC '${e}' stream ${s} is closed:`,C):(g||(J(fn,`Opening RPC '${e}' stream ${s} transport.`),f.open(),g=!0),J(fn,`RPC '${e}' stream ${s} sending:`,C),f.send(C))},To:()=>f.close()}),T=(C,F,j)=>{C.listen(F,L=>{try{j(L)}catch(M){setTimeout(()=>{throw M},0)}})};return T(f,ga.EventType.OPEN,()=>{_||(J(fn,`RPC '${e}' stream ${s} transport opened.`),k.yo())}),T(f,ga.EventType.CLOSE,()=>{_||(_=!0,J(fn,`RPC '${e}' stream ${s} transport closed`),k.So())}),T(f,ga.EventType.ERROR,C=>{_||(_=!0,qn(fn,`RPC '${e}' stream ${s} transport errored:`,C),k.So(new Y(U.UNAVAILABLE,"The operation could not be completed")))}),T(f,ga.EventType.MESSAGE,C=>{var F;if(!_){const j=C.data[0];ge(!!j);const L=j,M=L.error||((F=L[0])===null||F===void 0?void 0:F.error);if(M){J(fn,`RPC '${e}' stream ${s} received error:`,M);const q=M.status;let te=function(S){const R=Ft[S];if(R!==void 0)return a0(R)}(q),x=M.message;te===void 0&&(te=U.INTERNAL,x="Unknown error status: "+q+" with message "+M.message),_=!0,k.So(new Y(te,x)),f.close()}else J(fn,`RPC '${e}' stream ${s} received:`,j),k.bo(j)}}),T(a,hv.STAT_EVENT,C=>{C.stat===fh.PROXY?J(fn,`RPC '${e}' stream ${s} detected buffering proxy`):C.stat===fh.NOPROXY&&J(fn,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{k.wo()},0),k}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function z0(){return typeof window<"u"?window:null}function Sc(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bl(n){return new JS(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kf{constructor(e,t,r=1e3,s=1.5,i=6e4){this.ui=e,this.timerId=t,this.ko=r,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),s=Math.max(0,t-r);s>0&&J("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G0{constructor(e,t,r,s,i,o,a,c){this.ui=e,this.Ho=r,this.Jo=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=a,this.listener=c,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new kf(e,t)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():t&&t.code===U.RESOURCE_EXHAUSTED?(Nt(t.toString()),Nt("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===U.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.Yo===t&&this.P_(r,s)},r=>{e(()=>{const s=new Y(U.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(s)})})}P_(e,t){const r=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{r(()=>this.I_(s))}),this.stream.onMessage(s=>{r(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return J("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget(()=>this.Yo===e?t():(J("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class qx extends G0{constructor(e,t,r,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}T_(e,t){return this.connection.Bo("Listen",e,t)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const t=ZS(this.serializer,e),r=function(i){if(!("targetChange"in i))return ve.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?ve.min():o.readTime?Mt(o.readTime):ve.min()}(e);return this.listener.d_(t,r)}A_(e){const t={};t.database=Th(this.serializer),t.addTarget=function(i,o){let a;const c=o.target;if(a=zc(c)?{documents:_0(i,c)}:{query:Du(i,c)._t},a.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){a.resumeToken=d0(i,o.resumeToken);const u=Ih(i,o.expectedCount);u!==null&&(a.expectedCount=u)}else if(o.snapshotVersion.compareTo(ve.min())>0){a.readTime=vo(i,o.snapshotVersion.toTimestamp());const u=Ih(i,o.expectedCount);u!==null&&(a.expectedCount=u)}return a}(this.serializer,e);const r=tx(this.serializer,e);r&&(t.labels=r),this.a_(t)}R_(e){const t={};t.database=Th(this.serializer),t.removeTarget=e,this.a_(t)}}class zx extends G0{constructor(e,t,r,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,s,o),this.serializer=i}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,t){return this.connection.Bo("Write",e,t)}E_(e){return ge(!!e.streamToken),this.lastStreamToken=e.streamToken,ge(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){ge(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const t=ex(e.writeResults,e.commitTime),r=Mt(e.commitTime);return this.listener.g_(r,t)}p_(){const e={};e.database=Th(this.serializer),this.a_(e)}m_(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>el(this.serializer,r))};this.a_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gx extends class{}{constructor(e,t,r,s){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new Y(U.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,r,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.Mo(e,Eh(t,r),s,i,o)).catch(i=>{throw i.name==="FirebaseError"?(i.code===U.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new Y(U.UNKNOWN,i.toString())})}Lo(e,t,r,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,a])=>this.connection.Lo(e,Eh(t,r),s,o,a,i)).catch(o=>{throw o.name==="FirebaseError"?(o.code===U.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new Y(U.UNKNOWN,o.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class Kx{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(Nt(t),this.D_=!1):J("OnlineStateTracker",t)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hx{constructor(e,t,r,s,i){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(o=>{r.enqueueAndForget(async()=>{Ns(this)&&(J("RemoteStore","Restarting streams for network reachability change."),await async function(c){const u=ae(c);u.L_.add(4),await No(u),u.q_.set("Unknown"),u.L_.delete(4),await Il(u)}(this))})}),this.q_=new Kx(r,s)}}async function Il(n){if(Ns(n))for(const e of n.B_)await e(!0)}async function No(n){for(const e of n.B_)await e(!1)}function Mu(n,e){const t=ae(n);t.N_.has(e.targetId)||(t.N_.set(e.targetId,e),Nf(t)?Vf(t):Mo(t).r_()&&Df(t,e))}function Io(n,e){const t=ae(n),r=Mo(t);t.N_.delete(e),r.r_()&&K0(t,e),t.N_.size===0&&(r.r_()?r.o_():Ns(t)&&t.q_.set("Unknown"))}function Df(n,e){if(n.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(ve.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}Mo(n).A_(e)}function K0(n,e){n.Q_.xe(e),Mo(n).R_(e)}function Vf(n){n.Q_=new KS({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>n.N_.get(e)||null,tt:()=>n.datastore.serializer.databaseId}),Mo(n).start(),n.q_.v_()}function Nf(n){return Ns(n)&&!Mo(n).n_()&&n.N_.size>0}function Ns(n){return ae(n).L_.size===0}function H0(n){n.Q_=void 0}async function Wx(n){n.q_.set("Online")}async function Qx(n){n.N_.forEach((e,t)=>{Df(n,e)})}async function Jx(n,e){H0(n),Nf(n)?(n.q_.M_(e),Vf(n)):n.q_.set("Unknown")}async function Yx(n,e,t){if(n.q_.set("Online"),e instanceof u0&&e.state===2&&e.cause)try{await async function(s,i){const o=i.cause;for(const a of i.targetIds)s.N_.has(a)&&(await s.remoteSyncer.rejectListen(a,o),s.N_.delete(a),s.Q_.removeTarget(a))}(n,e)}catch(r){J("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await tu(n,r)}else if(e instanceof Pc?n.Q_.Ke(e):e instanceof c0?n.Q_.He(e):n.Q_.We(e),!t.isEqual(ve.min()))try{const r=await F0(n.localStore);t.compareTo(r)>=0&&await function(i,o){const a=i.Q_.rt(o);return a.targetChanges.forEach((c,u)=>{if(c.resumeToken.approximateByteSize()>0){const d=i.N_.get(u);d&&i.N_.set(u,d.withResumeToken(c.resumeToken,o))}}),a.targetMismatches.forEach((c,u)=>{const d=i.N_.get(c);if(!d)return;i.N_.set(c,d.withResumeToken(Ct.EMPTY_BYTE_STRING,d.snapshotVersion)),K0(i,c);const f=new Sr(d.target,c,u,d.sequenceNumber);Df(i,f)}),i.remoteSyncer.applyRemoteEvent(a)}(n,t)}catch(r){J("RemoteStore","Failed to raise snapshot:",r),await tu(n,r)}}async function tu(n,e,t){if(!Ds(e))throw e;n.L_.add(1),await No(n),n.q_.set("Offline"),t||(t=()=>F0(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{J("RemoteStore","Retrying IndexedDB access"),await t(),n.L_.delete(1),await Il(n)})}function W0(n,e){return e().catch(t=>tu(n,t,e))}async function Oo(n){const e=ae(n),t=Ps(e);let r=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;Xx(e);)try{const s=await Mx(e.localStore,r);if(s===null){e.O_.length===0&&t.o_();break}r=s.batchId,Zx(e,s)}catch(s){await tu(e,s)}Q0(e)&&J0(e)}function Xx(n){return Ns(n)&&n.O_.length<10}function Zx(n,e){n.O_.push(e);const t=Ps(n);t.r_()&&t.V_&&t.m_(e.mutations)}function Q0(n){return Ns(n)&&!Ps(n).n_()&&n.O_.length>0}function J0(n){Ps(n).start()}async function eR(n){Ps(n).p_()}async function tR(n){const e=Ps(n);for(const t of n.O_)e.m_(t.mutations)}async function nR(n,e,t){const r=n.O_.shift(),s=yf.from(r,e,t);await W0(n,()=>n.remoteSyncer.applySuccessfulWrite(s)),await Oo(n)}async function rR(n,e){e&&Ps(n).V_&&await async function(r,s){if(function(o){return o0(o)&&o!==U.ABORTED}(s.code)){const i=r.O_.shift();Ps(r).s_(),await W0(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await Oo(r)}}(n,e),Q0(n)&&J0(n)}async function Gg(n,e){const t=ae(n);t.asyncQueue.verifyOperationInProgress(),J("RemoteStore","RemoteStore received new credentials");const r=Ns(t);t.L_.add(3),await No(t),r&&t.q_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.L_.delete(3),await Il(t)}async function Ch(n,e){const t=ae(n);e?(t.L_.delete(2),await Il(t)):e||(t.L_.add(2),await No(t),t.q_.set("Unknown"))}function Mo(n){return n.K_||(n.K_=function(t,r,s){const i=ae(t);return i.w_(),new qx(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Eo:Wx.bind(null,n),Ro:Qx.bind(null,n),mo:Jx.bind(null,n),d_:Yx.bind(null,n)}),n.B_.push(async e=>{e?(n.K_.s_(),Nf(n)?Vf(n):n.q_.set("Unknown")):(await n.K_.stop(),H0(n))})),n.K_}function Ps(n){return n.U_||(n.U_=function(t,r,s){const i=ae(t);return i.w_(),new zx(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(n.datastore,n.asyncQueue,{Eo:()=>Promise.resolve(),Ro:eR.bind(null,n),mo:rR.bind(null,n),f_:tR.bind(null,n),g_:nR.bind(null,n)}),n.B_.push(async e=>{e?(n.U_.s_(),await Oo(n)):(await n.U_.stop(),n.O_.length>0&&(J("RemoteStore",`Stopping write stream with ${n.O_.length} pending writes`),n.O_=[]))})),n.U_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Of{constructor(e,t,r,s,i){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Jt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,i){const o=Date.now()+r,a=new Of(e,t,o,s,i);return a.start(r),a}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new Y(U.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Lo(n,e){if(Nt("AsyncQueue",`${e}: ${n}`),Ds(n))return new Y(U.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class to{constructor(e){this.comparator=e?(t,r)=>e(t,r)||he.comparator(t.key,r.key):(t,r)=>he.comparator(t.key,r.key),this.keyedMap=_a(),this.sortedSet=new pt(this.comparator)}static emptySet(e){return new to(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof to)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const s=t.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new to;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kg{constructor(){this.W_=new pt(he.comparator)}track(e){const t=e.doc.key,r=this.W_.get(t);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(t,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(t):e.type===1&&r.type===2?this.W_=this.W_.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):pe():this.W_=this.W_.insert(t,e)}G_(){const e=[];return this.W_.inorderTraversal((t,r)=>{e.push(r)}),e}}class Eo{constructor(e,t,r,s,i,o,a,c,u){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=a,this.excludesMetadataChanges=c,this.hasCachedResults=u}static fromInitialDocuments(e,t,r,s,i){const o=[];return t.forEach(a=>{o.push({type:0,doc:a})}),new Eo(e,t,to.emptySet(t),o,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&gl(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let s=0;s<t.length;s++)if(t[s].type!==r[s].type||!t[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sR{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class iR{constructor(){this.queries=Hg(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(t,r){const s=ae(t),i=s.queries;s.queries=Hg(),i.forEach((o,a)=>{for(const c of a.j_)c.onError(r)})})(this,new Y(U.ABORTED,"Firestore shutting down"))}}function Hg(){return new qr(n=>Gv(n),gl)}async function Mf(n,e){const t=ae(n);let r=3;const s=e.query;let i=t.queries.get(s);i?!i.H_()&&e.J_()&&(r=2):(i=new sR,r=e.J_()?0:1);try{switch(r){case 0:i.z_=await t.onListen(s,!0);break;case 1:i.z_=await t.onListen(s,!1);break;case 2:await t.onFirstRemoteStoreListen(s)}}catch(o){const a=Lo(o,`Initialization of query '${Gi(e.query)}' failed`);return void e.onError(a)}t.queries.set(s,i),i.j_.push(e),e.Z_(t.onlineState),i.z_&&e.X_(i.z_)&&Ff(t)}async function Lf(n,e){const t=ae(n),r=e.query;let s=3;const i=t.queries.get(r);if(i){const o=i.j_.indexOf(e);o>=0&&(i.j_.splice(o,1),i.j_.length===0?s=e.J_()?0:1:!i.H_()&&e.J_()&&(s=2))}switch(s){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function oR(n,e){const t=ae(n);let r=!1;for(const s of e){const i=s.query,o=t.queries.get(i);if(o){for(const a of o.j_)a.X_(s)&&(r=!0);o.z_=s}}r&&Ff(t)}function aR(n,e,t){const r=ae(n),s=r.queries.get(e);if(s)for(const i of s.j_)i.onError(t);r.queries.delete(e)}function Ff(n){n.Y_.forEach(e=>{e.next()})}var kh,Wg;(Wg=kh||(kh={})).ea="default",Wg.Cache="cache";class Uf{constructor(e,t,r){this.query=e,this.ta=t,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new Eo(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.na?this.ia(e)&&(this.ta.next(e),t=!0):this.sa(e,this.onlineState)&&(this.oa(e),t=!0),this.ra=e,t}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let t=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),t=!0),t}sa(e,t){if(!e.fromCache||!this.J_())return!0;const r=t!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const t=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}oa(e){e=Eo.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==kh.Cache}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lR{constructor(e,t){this.aa=e,this.byteLength=t}ua(){return"metadata"in this.aa}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qg{constructor(e){this.serializer=e}Es(e){return dr(this.serializer,e)}ds(e){return e.metadata.exists?g0(this.serializer,e.document,!1):mt.newNoDocument(this.Es(e.metadata.name),this.As(e.metadata.readTime))}As(e){return Mt(e)}}class cR{constructor(e,t,r){this.ca=e,this.localStore=t,this.serializer=r,this.queries=[],this.documents=[],this.collectionGroups=new Set,this.progress=Y0(e)}la(e){this.progress.bytesLoaded+=e.byteLength;let t=this.progress.documentsLoaded;if(e.aa.namedQuery)this.queries.push(e.aa.namedQuery);else if(e.aa.documentMetadata){this.documents.push({metadata:e.aa.documentMetadata}),e.aa.documentMetadata.exists||++t;const r=ze.fromString(e.aa.documentMetadata.name);this.collectionGroups.add(r.get(r.length-2))}else e.aa.document&&(this.documents[this.documents.length-1].document=e.aa.document,++t);return t!==this.progress.documentsLoaded?(this.progress.documentsLoaded=t,Object.assign({},this.progress)):null}ha(e){const t=new Map,r=new Qg(this.serializer);for(const s of e)if(s.metadata.queries){const i=r.Es(s.metadata.name);for(const o of s.metadata.queries){const a=(t.get(o)||Ne()).add(i);t.set(o,a)}}return t}async complete(){const e=await Lx(this.localStore,new Qg(this.serializer),this.documents,this.ca.id),t=this.ha(this.documents);for(const r of this.queries)await Fx(this.localStore,r,t.get(r.name));return this.progress.taskState="Success",{progress:this.progress,Pa:this.collectionGroups,Ia:e}}}function Y0(n){return{taskState:"Running",documentsLoaded:0,bytesLoaded:0,totalDocuments:n.totalDocuments,totalBytes:n.totalBytes}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class X0{constructor(e){this.key=e}}class Z0{constructor(e){this.key=e}}class ew{constructor(e,t){this.query=e,this.Ta=t,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=Ne(),this.mutatedKeys=Ne(),this.Aa=Hv(e),this.Ra=new to(this.Aa)}get Va(){return this.Ta}ma(e,t){const r=t?t.fa:new Kg,s=t?t.Ra:this.Ra;let i=t?t.mutatedKeys:this.mutatedKeys,o=s,a=!1;const c=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,u=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((d,f)=>{const g=s.get(d),_=_l(this.query,f)?f:null,k=!!g&&this.mutatedKeys.has(g.key),T=!!_&&(_.hasLocalMutations||this.mutatedKeys.has(_.key)&&_.hasCommittedMutations);let C=!1;g&&_?g.data.isEqual(_.data)?k!==T&&(r.track({type:3,doc:_}),C=!0):this.ga(g,_)||(r.track({type:2,doc:_}),C=!0,(c&&this.Aa(_,c)>0||u&&this.Aa(_,u)<0)&&(a=!0)):!g&&_?(r.track({type:0,doc:_}),C=!0):g&&!_&&(r.track({type:1,doc:g}),C=!0,(c||u)&&(a=!0)),C&&(_?(o=o.add(_),i=T?i.add(d):i.delete(d)):(o=o.delete(d),i=i.delete(d)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const d=this.query.limitType==="F"?o.last():o.first();o=o.delete(d.key),i=i.delete(d.key),r.track({type:1,doc:d})}return{Ra:o,fa:r,ns:a,mutatedKeys:i}}ga(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,s){const i=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const o=e.fa.G_();o.sort((d,f)=>function(_,k){const T=C=>{switch(C){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return pe()}};return T(_)-T(k)}(d.type,f.type)||this.Aa(d.doc,f.doc)),this.pa(r),s=s!=null&&s;const a=t&&!s?this.ya():[],c=this.da.size===0&&this.current&&!s?1:0,u=c!==this.Ea;return this.Ea=c,o.length!==0||u?{snapshot:new Eo(this.query,e.Ra,i,o,e.mutatedKeys,c===0,u,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:a}:{wa:a}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Kg,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(t=>this.Ta=this.Ta.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ta=this.Ta.delete(t)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=Ne(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const t=[];return e.forEach(r=>{this.da.has(r)||t.push(new Z0(r))}),this.da.forEach(r=>{e.has(r)||t.push(new X0(r))}),t}ba(e){this.Ta=e.Ts,this.da=Ne();const t=this.ma(e.documents);return this.applyChanges(t,!0)}Da(){return Eo.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class uR{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class dR{constructor(e){this.key=e,this.va=!1}}class hR{constructor(e,t,r,s,i,o){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Ca={},this.Fa=new qr(a=>Gv(a),gl),this.Ma=new Map,this.xa=new Set,this.Oa=new pt(he.comparator),this.Na=new Map,this.La=new Af,this.Ba={},this.ka=new Map,this.qa=di.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function fR(n,e,t=!0){const r=Lu(n);let s;const i=r.Fa.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await tw(r,e,t,!0),s}async function pR(n,e){const t=Lu(n);await tw(t,e,!0,!1)}async function tw(n,e,t,r){const s=await wo(n.localStore,vn(e)),i=s.targetId,o=n.sharedClientState.addLocalQueryTarget(i,t);let a;return r&&(a=await Bf(n,e,i,o==="current",s.resumeToken)),n.isPrimaryClient&&t&&Mu(n.remoteStore,s),a}async function Bf(n,e,t,r,s){n.Ka=(f,g,_)=>async function(T,C,F,j){let L=C.view.ma(F);L.ns&&(L=await Xc(T.localStore,C.query,!1).then(({documents:x})=>C.view.ma(x,L)));const M=j&&j.targetChanges.get(C.targetId),q=j&&j.targetMismatches.get(C.targetId)!=null,te=C.view.applyChanges(L,T.isPrimaryClient,M,q);return Dh(T,C.targetId,te.wa),te.snapshot}(n,f,g,_);const i=await Xc(n.localStore,e,!0),o=new ew(e,i.Ts),a=o.ma(i.documents),c=wl.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",s),u=o.applyChanges(a,n.isPrimaryClient,c);Dh(n,t,u.wa);const d=new uR(e,t,o);return n.Fa.set(e,d),n.Ma.has(t)?n.Ma.get(t).push(e):n.Ma.set(t,[e]),u.snapshot}async function mR(n,e,t){const r=ae(n),s=r.Fa.get(e),i=r.Ma.get(s.targetId);if(i.length>1)return r.Ma.set(s.targetId,i.filter(o=>!gl(o,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await bo(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),t&&Io(r.remoteStore,s.targetId),To(r,s.targetId)}).catch(ks)):(To(r,s.targetId),await bo(r.localStore,s.targetId,!0))}async function gR(n,e){const t=ae(n),r=t.Fa.get(e),s=t.Ma.get(r.targetId);t.isPrimaryClient&&s.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),Io(t.remoteStore,r.targetId))}async function _R(n,e,t){const r=zf(n);try{const s=await function(o,a){const c=ae(o),u=Pt.now(),d=a.reduce((_,k)=>_.add(k.key),Ne());let f,g;return c.persistence.runTransaction("Locally write mutations","readwrite",_=>{let k=Dn(),T=Ne();return c.cs.getEntries(_,d).next(C=>{k=C,k.forEach((F,j)=>{j.isValidDocument()||(T=T.add(F))})}).next(()=>c.localDocuments.getOverlayedDocuments(_,k)).next(C=>{f=C;const F=[];for(const j of a){const L=qS(j,f.get(j.key).overlayedDocument);L!=null&&F.push(new zr(j.key,L,Nv(L.value.mapValue),bt.exists(!0)))}return c.mutationQueue.addMutationBatch(_,u,F,a)}).next(C=>{g=C;const F=C.applyToLocalDocumentSet(f,T);return c.documentOverlayCache.saveOverlays(_,C.batchId,F)})}).then(()=>({batchId:g.batchId,changes:Qv(f)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(o,a,c){let u=o.Ba[o.currentUser.toKey()];u||(u=new pt(Pe)),u=u.insert(a,c),o.Ba[o.currentUser.toKey()]=u}(r,s.batchId,t),await Gr(r,s.changes),await Oo(r.remoteStore)}catch(s){const i=Lo(s,"Failed to persist write");t.reject(i)}}async function nw(n,e){const t=ae(n);try{const r=await Ox(t.localStore,e);e.targetChanges.forEach((s,i)=>{const o=t.Na.get(i);o&&(ge(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?o.va=!0:s.modifiedDocuments.size>0?ge(o.va):s.removedDocuments.size>0&&(ge(o.va),o.va=!1))}),await Gr(t,r,e)}catch(r){await ks(r)}}function Jg(n,e,t){const r=ae(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const s=[];r.Fa.forEach((i,o)=>{const a=o.view.Z_(e);a.snapshot&&s.push(a.snapshot)}),function(o,a){const c=ae(o);c.onlineState=a;let u=!1;c.queries.forEach((d,f)=>{for(const g of f.j_)g.Z_(a)&&(u=!0)}),u&&Ff(c)}(r.eventManager,e),s.length&&r.Ca.d_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function yR(n,e,t){const r=ae(n);r.sharedClientState.updateQueryState(e,"rejected",t);const s=r.Na.get(e),i=s&&s.key;if(i){let o=new pt(he.comparator);o=o.insert(i,mt.newNoDocument(i,ve.min()));const a=Ne().add(i),c=new vl(ve.min(),new Map,new pt(Pe),o,a);await nw(r,c),r.Oa=r.Oa.remove(i),r.Na.delete(e),qf(r)}else await bo(r.localStore,e,!1).then(()=>To(r,e,t)).catch(ks)}async function vR(n,e){const t=ae(n),r=e.batch.batchId;try{const s=await Nx(t.localStore,e);$f(t,r,null),jf(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Gr(t,s)}catch(s){await ks(s)}}async function wR(n,e,t){const r=ae(n);try{const s=await function(o,a){const c=ae(o);return c.persistence.runTransaction("Reject batch","readwrite-primary",u=>{let d;return c.mutationQueue.lookupMutationBatch(u,a).next(f=>(ge(f!==null),d=f.keys(),c.mutationQueue.removeMutationBatch(u,f))).next(()=>c.mutationQueue.performConsistencyCheck(u)).next(()=>c.documentOverlayCache.removeOverlaysForBatchId(u,d,a)).next(()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(u,d)).next(()=>c.localDocuments.getDocuments(u,d))})}(r.localStore,e);$f(r,e,t),jf(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Gr(r,s)}catch(s){await ks(s)}}async function bR(n,e){const t=ae(n);Ns(t.remoteStore)||J("SyncEngine","The network is disabled. The task returned by 'awaitPendingWrites()' will not complete until the network is enabled.");try{const r=await function(o){const a=ae(o);return a.persistence.runTransaction("Get highest unacknowledged batch id","readonly",c=>a.mutationQueue.getHighestUnacknowledgedBatchId(c))}(t.localStore);if(r===-1)return void e.resolve();const s=t.ka.get(r)||[];s.push(e),t.ka.set(r,s)}catch(r){const s=Lo(r,"Initialization of waitForPendingWrites() operation failed");e.reject(s)}}function jf(n,e){(n.ka.get(e)||[]).forEach(t=>{t.resolve()}),n.ka.delete(e)}function $f(n,e,t){const r=ae(n);let s=r.Ba[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(t?i.reject(t):i.resolve(),s=s.remove(e)),r.Ba[r.currentUser.toKey()]=s}}function To(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Ma.get(e))n.Fa.delete(r),t&&n.Ca.$a(r,t);n.Ma.delete(e),n.isPrimaryClient&&n.La.gr(e).forEach(r=>{n.La.containsKey(r)||rw(n,r)})}function rw(n,e){n.xa.delete(e.path.canonicalString());const t=n.Oa.get(e);t!==null&&(Io(n.remoteStore,t),n.Oa=n.Oa.remove(e),n.Na.delete(t),qf(n))}function Dh(n,e,t){for(const r of t)r instanceof X0?(n.La.addReference(r.key,e),IR(n,r)):r instanceof Z0?(J("SyncEngine","Document no longer in limbo: "+r.key),n.La.removeReference(r.key,e),n.La.containsKey(r.key)||rw(n,r.key)):pe()}function IR(n,e){const t=e.key,r=t.path.canonicalString();n.Oa.get(t)||n.xa.has(r)||(J("SyncEngine","New document in limbo: "+t),n.xa.add(r),qf(n))}function qf(n){for(;n.xa.size>0&&n.Oa.size<n.maxConcurrentLimboResolutions;){const e=n.xa.values().next().value;n.xa.delete(e);const t=new he(ze.fromString(e)),r=n.qa.next();n.Na.set(r,new dR(t)),n.Oa=n.Oa.insert(t,r),Mu(n.remoteStore,new Sr(vn(ko(t.path)),r,"TargetPurposeLimboResolution",Cn.oe))}}async function Gr(n,e,t){const r=ae(n),s=[],i=[],o=[];r.Fa.isEmpty()||(r.Fa.forEach((a,c)=>{o.push(r.Ka(c,e,t).then(u=>{var d;if((u||t)&&r.isPrimaryClient){const f=u?!u.fromCache:(d=t==null?void 0:t.targetChanges.get(c.targetId))===null||d===void 0?void 0:d.current;r.sharedClientState.updateQueryState(c.targetId,f?"current":"not-current")}if(u){s.push(u);const f=Rf.Wi(c.targetId,u);i.push(f)}}))}),await Promise.all(o),r.Ca.d_(s),await async function(c,u){const d=ae(c);try{await d.persistence.runTransaction("notifyLocalViewChanges","readwrite",f=>O.forEach(u,g=>O.forEach(g.$i,_=>d.persistence.referenceDelegate.addReference(f,g.targetId,_)).next(()=>O.forEach(g.Ui,_=>d.persistence.referenceDelegate.removeReference(f,g.targetId,_)))))}catch(f){if(!Ds(f))throw f;J("LocalStore","Failed to update sequence numbers: "+f)}for(const f of u){const g=f.targetId;if(!f.fromCache){const _=d.os.get(g),k=_.snapshotVersion,T=_.withLastLimboFreeSnapshotVersion(k);d.os=d.os.insert(g,T)}}}(r.localStore,i))}async function ER(n,e){const t=ae(n);if(!t.currentUser.isEqual(e)){J("SyncEngine","User change. New user:",e.toKey());const r=await L0(t.localStore,e);t.currentUser=e,function(i,o){i.ka.forEach(a=>{a.forEach(c=>{c.reject(new Y(U.CANCELLED,o))})}),i.ka.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Gr(t,r.hs)}}function TR(n,e){const t=ae(n),r=t.Na.get(e);if(r&&r.va)return Ne().add(r.key);{let s=Ne();const i=t.Ma.get(e);if(!i)return s;for(const o of i){const a=t.Fa.get(o);s=s.unionWith(a.view.Va)}return s}}async function AR(n,e){const t=ae(n),r=await Xc(t.localStore,e.query,!0),s=e.view.ba(r);return t.isPrimaryClient&&Dh(t,e.targetId,s.wa),s}async function PR(n,e){const t=ae(n);return j0(t.localStore,e).then(r=>Gr(t,r))}async function SR(n,e,t,r){const s=ae(n),i=await function(a,c){const u=ae(a),d=ae(u.mutationQueue);return u.persistence.runTransaction("Lookup mutation documents","readonly",f=>d.Mn(f,c).next(g=>g?u.localDocuments.getDocuments(f,g):O.resolve(null)))}(s.localStore,e);i!==null?(t==="pending"?await Oo(s.remoteStore):t==="acknowledged"||t==="rejected"?($f(s,e,r||null),jf(s,e),function(a,c){ae(ae(a).mutationQueue).On(c)}(s.localStore,e)):pe(),await Gr(s,i)):J("SyncEngine","Cannot apply mutation batch with id: "+e)}async function xR(n,e){const t=ae(n);if(Lu(t),zf(t),e===!0&&t.Qa!==!0){const r=t.sharedClientState.getAllActiveQueryTargets(),s=await Yg(t,r.toArray());t.Qa=!0,await Ch(t.remoteStore,!0);for(const i of s)Mu(t.remoteStore,i)}else if(e===!1&&t.Qa!==!1){const r=[];let s=Promise.resolve();t.Ma.forEach((i,o)=>{t.sharedClientState.isLocalQueryTarget(o)?r.push(o):s=s.then(()=>(To(t,o),bo(t.localStore,o,!0))),Io(t.remoteStore,o)}),await s,await Yg(t,r),function(o){const a=ae(o);a.Na.forEach((c,u)=>{Io(a.remoteStore,u)}),a.La.pr(),a.Na=new Map,a.Oa=new pt(he.comparator)}(t),t.Qa=!1,await Ch(t.remoteStore,!1)}}async function Yg(n,e,t){const r=ae(n),s=[],i=[];for(const o of e){let a;const c=r.Ma.get(o);if(c&&c.length!==0){a=await wo(r.localStore,vn(c[0]));for(const u of c){const d=r.Fa.get(u),f=await AR(r,d);f.snapshot&&i.push(f.snapshot)}}else{const u=await B0(r.localStore,o);a=await wo(r.localStore,u),await Bf(r,sw(u),o,!1,a.resumeToken)}s.push(a)}return r.Ca.d_(i),s}function sw(n){return $v(n.path,n.collectionGroup,n.orderBy,n.filters,n.limit,"F",n.startAt,n.endAt)}function RR(n){return function(t){return ae(ae(t).persistence).Qi()}(ae(n).localStore)}async function CR(n,e,t,r){const s=ae(n);if(s.Qa)return void J("SyncEngine","Ignoring unexpected query state notification.");const i=s.Ma.get(e);if(i&&i.length>0)switch(t){case"current":case"not-current":{const o=await j0(s.localStore,Kv(i[0])),a=vl.createSynthesizedRemoteEventForCurrentChange(e,t==="current",Ct.EMPTY_BYTE_STRING);await Gr(s,o,a);break}case"rejected":await bo(s.localStore,e,!0),To(s,e,r);break;default:pe()}}async function kR(n,e,t){const r=Lu(n);if(r.Qa){for(const s of e){if(r.Ma.has(s)&&r.sharedClientState.isActiveQueryTarget(s)){J("SyncEngine","Adding an already active target "+s);continue}const i=await B0(r.localStore,s),o=await wo(r.localStore,i);await Bf(r,sw(i),o.targetId,!1,o.resumeToken),Mu(r.remoteStore,o)}for(const s of t)r.Ma.has(s)&&await bo(r.localStore,s,!1).then(()=>{Io(r.remoteStore,s),To(r,s)}).catch(ks)}}function Lu(n){const e=ae(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=nw.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=TR.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=yR.bind(null,e),e.Ca.d_=oR.bind(null,e.eventManager),e.Ca.$a=aR.bind(null,e.eventManager),e}function zf(n){const e=ae(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=vR.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=wR.bind(null,e),e}function DR(n,e,t){const r=ae(n);(async function(i,o,a){try{const c=await o.getMetadata();if(await function(_,k){const T=ae(_),C=Mt(k.createTime);return T.persistence.runTransaction("hasNewerBundle","readonly",F=>T.Gr.getBundleMetadata(F,k.id)).then(F=>!!F&&F.createTime.compareTo(C)>=0)}(i.localStore,c))return await o.close(),a._completeWith(function(_){return{taskState:"Success",documentsLoaded:_.totalDocuments,bytesLoaded:_.totalBytes,totalDocuments:_.totalDocuments,totalBytes:_.totalBytes}}(c)),Promise.resolve(new Set);a._updateProgress(Y0(c));const u=new cR(c,i.localStore,o.serializer);let d=await o.Ua();for(;d;){const g=await u.la(d);g&&a._updateProgress(g),d=await o.Ua()}const f=await u.complete();return await Gr(i,f.Ia,void 0),await function(_,k){const T=ae(_);return T.persistence.runTransaction("Save bundle","readwrite",C=>T.Gr.saveBundleMetadata(C,k))}(i.localStore,c),a._completeWith(f.progress),Promise.resolve(f.Pa)}catch(c){return qn("SyncEngine",`Loading bundle failed with ${c}`),a._failWith(c),Promise.resolve(new Set)}})(r,e,t).then(s=>{r.sharedClientState.notifyBundleLoaded(s)})}class Ss{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=bl(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return M0(this.persistence,new O0,e.initialUser,this.serializer)}Ga(e){return new Pf(Ou.Zr,this.serializer)}Wa(e){return new q0}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Ss.provider={build:()=>new Ss};class VR extends Ss{constructor(e){super(),this.cacheSizeBytes=e}ja(e,t){ge(this.persistence.referenceDelegate instanceof Yc);const r=this.persistence.referenceDelegate.garbageCollector;return new C0(r,e.asyncQueue,t)}Ga(e){const t=this.cacheSizeBytes!==void 0?pn.withCacheSize(this.cacheSizeBytes):pn.DEFAULT;return new Pf(r=>Yc.Zr(r,t),this.serializer)}}class Gf extends Ss{constructor(e,t,r){super(),this.Ja=e,this.cacheSizeBytes=t,this.forceOwnership=r,this.kind="persistent",this.synchronizeTabs=!1}async initialize(e){await super.initialize(e),await this.Ja.initialize(this,e),await zf(this.Ja.syncEngine),await Oo(this.Ja.remoteStore),await this.persistence.yi(()=>(this.gcScheduler&&!this.gcScheduler.started&&this.gcScheduler.start(),this.indexBackfillerScheduler&&!this.indexBackfillerScheduler.started&&this.indexBackfillerScheduler.start(),Promise.resolve()))}za(e){return M0(this.persistence,new O0,e.initialUser,this.serializer)}ja(e,t){const r=this.persistence.referenceDelegate.garbageCollector;return new C0(r,e.asyncQueue,t)}Ha(e,t){const r=new tS(t,this.persistence);return new eS(e.asyncQueue,r)}Ga(e){const t=xf(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey),r=this.cacheSizeBytes!==void 0?pn.withCacheSize(this.cacheSizeBytes):pn.DEFAULT;return new Sf(this.synchronizeTabs,t,e.clientId,r,e.asyncQueue,z0(),Sc(),this.serializer,this.sharedClientState,!!this.forceOwnership)}Wa(e){return new q0}}class iw extends Gf{constructor(e,t){super(e,t,!1),this.Ja=e,this.cacheSizeBytes=t,this.synchronizeTabs=!0}async initialize(e){await super.initialize(e);const t=this.Ja.syncEngine;this.sharedClientState instanceof Ld&&(this.sharedClientState.syncEngine={no:SR.bind(null,t),ro:CR.bind(null,t),io:kR.bind(null,t),Qi:RR.bind(null,t),eo:PR.bind(null,t)},await this.sharedClientState.start()),await this.persistence.yi(async r=>{await xR(this.Ja.syncEngine,r),this.gcScheduler&&(r&&!this.gcScheduler.started?this.gcScheduler.start():r||this.gcScheduler.stop()),this.indexBackfillerScheduler&&(r&&!this.indexBackfillerScheduler.started?this.indexBackfillerScheduler.start():r||this.indexBackfillerScheduler.stop())})}Wa(e){const t=z0();if(!Ld.D(t))throw new Y(U.UNIMPLEMENTED,"IndexedDB persistence is only available on platforms that support LocalStorage.");const r=xf(e.databaseInfo.databaseId,e.databaseInfo.persistenceKey);return new Ld(t,e.asyncQueue,r,e.clientId,e.initialUser)}}class xs{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Jg(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=ER.bind(null,this.syncEngine),await Ch(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new iR}()}createDatastore(e){const t=bl(e.databaseInfo.databaseId),r=function(i){return new $x(i)}(e.databaseInfo);return function(i,o,a,c){return new Gx(i,o,a,c)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,s,i,o,a){return new Hx(r,s,i,o,a)}(this.localStore,this.datastore,e.asyncQueue,t=>Jg(this.syncEngine,t,0),function(){return zg.D()?new zg:new Ux}())}createSyncEngine(e,t){return function(s,i,o,a,c,u,d){const f=new hR(s,i,o,a,c,u);return d&&(f.Qa=!0),f}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(s){const i=ae(s);J("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await No(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}xs.provider={build:()=>new xs};function Xg(n,e=10240){let t=0;return{async read(){if(t<n.byteLength){const r={value:n.slice(t,t+e),done:!1};return t+=e,r}return{done:!0}},async cancel(){},releaseLock(){},closed:Promise.resolve()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class Fu{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):Nt("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class NR{constructor(e,t){this.Xa=e,this.serializer=t,this.metadata=new Jt,this.buffer=new Uint8Array,this.eu=function(){return new TextDecoder("utf-8")}(),this.tu().then(r=>{r&&r.ua()?this.metadata.resolve(r.aa.metadata):this.metadata.reject(new Error(`The first element of the bundle is not a metadata, it is
             ${JSON.stringify(r==null?void 0:r.aa)}`))},r=>this.metadata.reject(r))}close(){return this.Xa.cancel()}async getMetadata(){return this.metadata.promise}async Ua(){return await this.getMetadata(),this.tu()}async tu(){const e=await this.nu();if(e===null)return null;const t=this.eu.decode(e),r=Number(t);isNaN(r)&&this.ru(`length string (${t}) is not valid number`);const s=await this.iu(r);return new lR(JSON.parse(s),e.length+r)}su(){return this.buffer.findIndex(e=>e==="{".charCodeAt(0))}async nu(){for(;this.su()<0&&!await this.ou(););if(this.buffer.length===0)return null;const e=this.su();e<0&&this.ru("Reached the end of bundle when a length string is expected.");const t=this.buffer.slice(0,e);return this.buffer=this.buffer.slice(e),t}async iu(e){for(;this.buffer.length<e;)await this.ou()&&this.ru("Reached the end of bundle when more is expected.");const t=this.eu.decode(this.buffer.slice(0,e));return this.buffer=this.buffer.slice(e),t}ru(e){throw this.Xa.cancel(),new Error(`Invalid bundle format: ${e}`)}async ou(){const e=await this.Xa.read();if(!e.done){const t=new Uint8Array(this.buffer.length+e.value.length);t.set(this.buffer),t.set(e.value,this.buffer.length),this.buffer=t}return e.done}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OR{constructor(e){this.datastore=e,this.readVersions=new Map,this.mutations=[],this.committed=!1,this.lastTransactionError=null,this.writtenDocs=new Set}async lookup(e){if(this.ensureCommitNotCalled(),this.mutations.length>0)throw this.lastTransactionError=new Y(U.INVALID_ARGUMENT,"Firestore transactions require all reads to be executed before all writes."),this.lastTransactionError;const t=await async function(s,i){const o=ae(s),a={documents:i.map(f=>Za(o.serializer,f))},c=await o.Lo("BatchGetDocuments",o.serializer.databaseId,ze.emptyPath(),a,i.length),u=new Map;c.forEach(f=>{const g=XS(o.serializer,f);u.set(g.key.toString(),g)});const d=[];return i.forEach(f=>{const g=u.get(f.toString());ge(!!g),d.push(g)}),d}(this.datastore,e);return t.forEach(r=>this.recordVersion(r)),t}set(e,t){this.write(t.toMutation(e,this.precondition(e))),this.writtenDocs.add(e.toString())}update(e,t){try{this.write(t.toMutation(e,this.preconditionForUpdate(e)))}catch(r){this.lastTransactionError=r}this.writtenDocs.add(e.toString())}delete(e){this.write(new Vo(e,this.precondition(e))),this.writtenDocs.add(e.toString())}async commit(){if(this.ensureCommitNotCalled(),this.lastTransactionError)throw this.lastTransactionError;const e=this.readVersions;this.mutations.forEach(t=>{e.delete(t.key.toString())}),e.forEach((t,r)=>{const s=he.fromPath(r);this.mutations.push(new gf(s,this.precondition(s)))}),await async function(r,s){const i=ae(r),o={writes:s.map(a=>el(i.serializer,a))};await i.Mo("Commit",i.serializer.databaseId,ze.emptyPath(),o)}(this.datastore,this.mutations),this.committed=!0}recordVersion(e){let t;if(e.isFoundDocument())t=e.version;else{if(!e.isNoDocument())throw pe();t=ve.min()}const r=this.readVersions.get(e.key.toString());if(r){if(!t.isEqual(r))throw new Y(U.ABORTED,"Document version changed between two reads.")}else this.readVersions.set(e.key.toString(),t)}precondition(e){const t=this.readVersions.get(e.toString());return!this.writtenDocs.has(e.toString())&&t?t.isEqual(ve.min())?bt.exists(!1):bt.updateTime(t):bt.none()}preconditionForUpdate(e){const t=this.readVersions.get(e.toString());if(!this.writtenDocs.has(e.toString())&&t){if(t.isEqual(ve.min()))throw new Y(U.INVALID_ARGUMENT,"Can't update a document that doesn't exist.");return bt.updateTime(t)}return bt.exists(!0)}write(e){this.ensureCommitNotCalled(),this.mutations.push(e)}ensureCommitNotCalled(){}}/**
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
 */class MR{constructor(e,t,r,s,i){this.asyncQueue=e,this.datastore=t,this.options=r,this.updateFunction=s,this.deferred=i,this._u=r.maxAttempts,this.t_=new kf(this.asyncQueue,"transaction_retry")}au(){this._u-=1,this.uu()}uu(){this.t_.Go(async()=>{const e=new OR(this.datastore),t=this.cu(e);t&&t.then(r=>{this.asyncQueue.enqueueAndForget(()=>e.commit().then(()=>{this.deferred.resolve(r)}).catch(s=>{this.lu(s)}))}).catch(r=>{this.lu(r)})})}cu(e){try{const t=this.updateFunction(e);return!pl(t)&&t.catch&&t.then?t:(this.deferred.reject(Error("Transaction callback must return a Promise")),null)}catch(t){return this.deferred.reject(t),null}}lu(e){this._u>0&&this.hu(e)?(this._u-=1,this.asyncQueue.enqueueAndForget(()=>(this.uu(),Promise.resolve()))):this.deferred.reject(e)}hu(e){if(e.name==="FirebaseError"){const t=e.code;return t==="aborted"||t==="failed-precondition"||t==="already-exists"||!o0(t)}return!1}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class LR{constructor(e,t,r,s,i){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=s,this.user=Qt.UNAUTHENTICATED,this.clientId=_v.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async o=>{J("FirestoreClient","Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(J("FirestoreClient","Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Jt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=Lo(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Ud(n,e){n.asyncQueue.verifyOperationInProgress(),J("FirestoreClient","Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async s=>{r.isEqual(s)||(await L0(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function Zg(n,e){n.asyncQueue.verifyOperationInProgress();const t=await Kf(n);J("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>Gg(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,s)=>Gg(e.remoteStore,s)),n._onlineComponents=e}async function Kf(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){J("FirestoreClient","Using user provided OfflineComponentProvider");try{await Ud(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(s){return s.name==="FirebaseError"?s.code===U.FAILED_PRECONDITION||s.code===U.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(t))throw t;qn("Error using user provided cache. Falling back to memory cache: "+t),await Ud(n,new Ss)}}else J("FirestoreClient","Using default OfflineComponentProvider"),await Ud(n,new Ss);return n._offlineComponents}async function Uu(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(J("FirestoreClient","Using user provided OnlineComponentProvider"),await Zg(n,n._uninitializedComponentsProvider._online)):(J("FirestoreClient","Using default OnlineComponentProvider"),await Zg(n,new xs))),n._onlineComponents}function ow(n){return Kf(n).then(e=>e.persistence)}function Fo(n){return Kf(n).then(e=>e.localStore)}function aw(n){return Uu(n).then(e=>e.remoteStore)}function Hf(n){return Uu(n).then(e=>e.syncEngine)}function lw(n){return Uu(n).then(e=>e.datastore)}async function Ao(n){const e=await Uu(n),t=e.eventManager;return t.onListen=fR.bind(null,e.syncEngine),t.onUnlisten=mR.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=pR.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=gR.bind(null,e.syncEngine),t}function FR(n){return n.asyncQueue.enqueue(async()=>{const e=await ow(n),t=await aw(n);return e.setNetworkEnabled(!0),function(s){const i=ae(s);return i.L_.delete(0),Il(i)}(t)})}function UR(n){return n.asyncQueue.enqueue(async()=>{const e=await ow(n),t=await aw(n);return e.setNetworkEnabled(!1),async function(s){const i=ae(s);i.L_.add(0),await No(i),i.q_.set("Offline")}(t)})}function BR(n,e){const t=new Jt;return n.asyncQueue.enqueueAndForget(async()=>async function(s,i,o){try{const a=await function(u,d){const f=ae(u);return f.persistence.runTransaction("read document","readonly",g=>f.localDocuments.getDocument(g,d))}(s,i);a.isFoundDocument()?o.resolve(a):a.isNoDocument()?o.resolve(null):o.reject(new Y(U.UNAVAILABLE,"Failed to get document from cache. (However, this document may exist on the server. Run again without setting 'source' in the GetOptions to attempt to retrieve the document from the server.)"))}catch(a){const c=Lo(a,`Failed to get document '${i} from cache`);o.reject(c)}}(await Fo(n),e,t)),t.promise}function cw(n,e,t={}){const r=new Jt;return n.asyncQueue.enqueueAndForget(async()=>function(i,o,a,c,u){const d=new Fu({next:g=>{d.Za(),o.enqueueAndForget(()=>Lf(i,f));const _=g.docs.has(a);!_&&g.fromCache?u.reject(new Y(U.UNAVAILABLE,"Failed to get document because the client is offline.")):_&&g.fromCache&&c&&c.source==="server"?u.reject(new Y(U.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):u.resolve(g)},error:g=>u.reject(g)}),f=new Uf(ko(a.path),d,{includeMetadataChanges:!0,_a:!0});return Mf(i,f)}(await Ao(n),n.asyncQueue,e,t,r)),r.promise}function jR(n,e){const t=new Jt;return n.asyncQueue.enqueueAndForget(async()=>async function(s,i,o){try{const a=await Xc(s,i,!0),c=new ew(i,a.Ts),u=c.ma(a.documents),d=c.applyChanges(u,!1);o.resolve(d.snapshot)}catch(a){const c=Lo(a,`Failed to execute query '${i} against cache`);o.reject(c)}}(await Fo(n),e,t)),t.promise}function uw(n,e,t={}){const r=new Jt;return n.asyncQueue.enqueueAndForget(async()=>function(i,o,a,c,u){const d=new Fu({next:g=>{d.Za(),o.enqueueAndForget(()=>Lf(i,f)),g.fromCache&&c.source==="server"?u.reject(new Y(U.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):u.resolve(g)},error:g=>u.reject(g)}),f=new Uf(a,d,{includeMetadataChanges:!0,_a:!0});return Mf(i,f)}(await Ao(n),n.asyncQueue,e,t,r)),r.promise}function $R(n,e,t){const r=new Jt;return n.asyncQueue.enqueueAndForget(async()=>{try{const s=await lw(n);r.resolve(async function(o,a,c){var u;const d=ae(o),{request:f,ut:g,parent:_}=y0(d.serializer,qv(a),c);d.connection.Fo||delete f.parent;const k=(await d.Lo("RunAggregationQuery",d.serializer.databaseId,_,f,1)).filter(C=>!!C.result);ge(k.length===1);const T=(u=k[0].result)===null||u===void 0?void 0:u.aggregateFields;return Object.keys(T).reduce((C,F)=>(C[g[F]]=T[F],C),{})}(s,e,t))}catch(s){r.reject(s)}}),r.promise}function qR(n,e){const t=new Fu(e);return n.asyncQueue.enqueueAndForget(async()=>function(s,i){ae(s).Y_.add(i),i.next()}(await Ao(n),t)),()=>{t.Za(),n.asyncQueue.enqueueAndForget(async()=>function(s,i){ae(s).Y_.delete(i)}(await Ao(n),t))}}function zR(n,e,t,r){const s=function(o,a){let c;return c=typeof o=="string"?l0().encode(o):o,function(d,f){return new NR(d,f)}(function(d,f){if(d instanceof Uint8Array)return Xg(d,f);if(d instanceof ArrayBuffer)return Xg(new Uint8Array(d),f);if(d instanceof ReadableStream)return d.getReader();throw new Error("Source of `toByteStreamReader` has to be a ArrayBuffer or ReadableStream")}(c),a)}(t,bl(e));n.asyncQueue.enqueueAndForget(async()=>{DR(await Hf(n),s,r)})}function GR(n,e){return n.asyncQueue.enqueue(async()=>function(r,s){const i=ae(r);return i.persistence.runTransaction("Get named query","readonly",o=>i.Gr.getNamedQuery(o,s))}(await Fo(n),e))}function KR(n,e){return n.asyncQueue.enqueue(async()=>async function(r,s){const i=ae(r),o=i.indexManager,a=[];return i.persistence.runTransaction("Configure indexes","readwrite",c=>o.getFieldIndexes(c).next(u=>function(f,g,_,k,T){f=[...f],g=[...g],f.sort(_),g.sort(_);const C=f.length,F=g.length;let j=0,L=0;for(;j<F&&L<C;){const M=_(f[L],g[j]);M<0?T(f[L++]):M>0?k(g[j++]):(j++,L++)}for(;j<F;)k(g[j++]);for(;L<C;)T(f[L++])}(u,s,JP,d=>{a.push(o.addFieldIndex(c,d))},d=>{a.push(o.deleteFieldIndex(c,d))})).next(()=>O.waitFor(a)))}(await Fo(n),e))}function HR(n,e){return n.asyncQueue.enqueue(async()=>function(r,s){ae(r).ss.zi=s}(await Fo(n),e))}function WR(n){return n.asyncQueue.enqueue(async()=>function(t){const r=ae(t),s=r.indexManager;return r.persistence.runTransaction("Delete All Indexes","readwrite",i=>s.deleteAllFieldIndexes(i))}(await Fo(n)))}/**
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
 */function dw(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const e_=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wf(n,e,t){if(!t)throw new Y(U.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function QR(n,e,t,r){if(e===!0&&r===!0)throw new Y(U.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function t_(n){if(!he.isDocumentKey(n))throw new Y(U.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function n_(n){if(he.isDocumentKey(n))throw new Y(U.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function Bu(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":pe()}function Be(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new Y(U.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=Bu(n);throw new Y(U.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}function hw(n,e){if(e<=0)throw new Y(U.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${e}.`)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class r_{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new Y(U.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new Y(U.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}QR("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=dw((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new Y(U.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new Y(U.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new Y(U.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class El{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new r_({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new Y(U.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new Y(U.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new r_(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new $P;switch(r.type){case"firstParty":return new KP(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new Y(U.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=e_.get(t);r&&(J("ComponentProvider","Removing Datastore"),e_.delete(t),r.terminate())}(this),Promise.resolve()}}function JR(n,e,t,r={}){var s;const i=(n=Be(n,El))._getSettings(),o=`${e}:${t}`;if(i.host!=="firestore.googleapis.com"&&i.host!==o&&qn("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),n._setSettings(Object.assign(Object.assign({},i),{host:o,ssl:!1})),r.mockUserToken){let a,c;if(typeof r.mockUserToken=="string")a=r.mockUserToken,c=Qt.MOCK_USER;else{a=_A(r.mockUserToken,(s=n._app)===null||s===void 0?void 0:s.options.projectId);const u=r.mockUserToken.sub||r.mockUserToken.user_id;if(!u)throw new Y(U.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");c=new Qt(u)}n._authCredentials=new qP(new mv(a,c))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cn{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new cn(this.firestore,e,this._query)}}class Lt{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new hr(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new Lt(this.firestore,e,this._key)}}class hr extends cn{constructor(e,t,r){super(e,t,ko(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new Lt(this.firestore,null,new he(e))}withConverter(e){return new hr(this.firestore,e,this._path)}}function st(n,e,...t){if(n=we(n),Wf("collection","path",e),n instanceof El){const r=ze.fromString(e,...t);return n_(r),new hr(n,null,r)}{if(!(n instanceof Lt||n instanceof hr))throw new Y(U.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ze.fromString(e,...t));return n_(r),new hr(n.firestore,null,r)}}function XM(n,e){if(n=Be(n,El),Wf("collectionGroup","collection id",e),e.indexOf("/")>=0)throw new Y(U.INVALID_ARGUMENT,`Invalid collection ID '${e}' passed to function collectionGroup(). Collection IDs must not contain '/'.`);return new cn(n,null,function(r){return new $r(ze.emptyPath(),r)}(e))}function Ue(n,e,...t){if(n=we(n),arguments.length===1&&(e=_v.newId()),Wf("doc","path",e),n instanceof El){const r=ze.fromString(e,...t);return t_(r),new Lt(n,null,new he(r))}{if(!(n instanceof Lt||n instanceof hr))throw new Y(U.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(ze.fromString(e,...t));return t_(r),new Lt(n.firestore,n instanceof hr?n.converter:null,new he(r))}}function ZM(n,e){return n=we(n),e=we(e),(n instanceof Lt||n instanceof hr)&&(e instanceof Lt||e instanceof hr)&&n.firestore===e.firestore&&n.path===e.path&&n.converter===e.converter}function fw(n,e){return n=we(n),e=we(e),n instanceof cn&&e instanceof cn&&n.firestore===e.firestore&&gl(n._query,e._query)&&n.converter===e.converter}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class s_{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new kf(this,"async_queue_retry"),this.Vu=()=>{const r=Sc();r&&J("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const t=Sc();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=Sc();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new Jt;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!Ds(e))throw e;J("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const s=function(o){let a=o.message||"";return o.stack&&(a=o.stack.includes(o.message)?o.stack:o.message+`
`+o.stack),a}(r);throw Nt("INTERNAL UNHANDLED ERROR: ",s),r}).then(r=>(this.du=!1,r))));return this.mu=t,t}enqueueAfterDelay(e,t,r){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const s=Of.createAndSchedule(this,e,t,r,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&pe()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}function Vh(n){return function(t,r){if(typeof t!="object"||t===null)return!1;const s=t;for(const i of r)if(i in s&&typeof s[i]=="function")return!0;return!1}(n,["next","error","complete"])}class YR{constructor(){this._progressObserver={},this._taskCompletionResolver=new Jt,this._lastProgress={taskState:"Running",totalBytes:0,totalDocuments:0,bytesLoaded:0,documentsLoaded:0}}onProgress(e,t,r){this._progressObserver={next:e,error:t,complete:r}}catch(e){return this._taskCompletionResolver.promise.catch(e)}then(e,t){return this._taskCompletionResolver.promise.then(e,t)}_completeWith(e){this._updateProgress(e),this._progressObserver.complete&&this._progressObserver.complete(),this._taskCompletionResolver.resolve(e)}_failWith(e){this._lastProgress.taskState="Error",this._progressObserver.next&&this._progressObserver.next(this._lastProgress),this._progressObserver.error&&this._progressObserver.error(e),this._taskCompletionResolver.reject(e)}_updateProgress(e){this._lastProgress=e,this._progressObserver.next&&this._progressObserver.next(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eL=-1;class ht extends El{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new s_,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new s_(e),this._firestoreClient=void 0,await e}}}function tL(n,e,t){t||(t="(default)");const r=fl(n,"firestore");if(r.isInitialized(t)){const s=r.getImmediate({identifier:t}),i=r.getOptions(t);if(bs(i,e))return s;throw new Y(U.FAILED_PRECONDITION,"initializeFirestore() has already been called with different options. To avoid this error, call initializeFirestore() with the same options as when it was originally called, or call getFirestore() to return the already initialized instance.")}if(e.cacheSizeBytes!==void 0&&e.localCache!==void 0)throw new Y(U.INVALID_ARGUMENT,"cache and cacheSizeBytes cannot be specified at the same time as cacheSizeBytes willbe deprecated. Instead, specify the cache size in the cache object");if(e.cacheSizeBytes!==void 0&&e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new Y(U.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");return r.initialize({options:e,instanceIdentifier:t})}function XR(n,e){const t=typeof n=="object"?n:ov(),r=typeof n=="string"?n:e||"(default)",s=fl(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=mA("firestore");i&&JR(s,...i)}return s}function St(n){if(n._terminated)throw new Y(U.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||pw(n),n._firestoreClient}function pw(n){var e,t,r;const s=n._freezeSettings(),i=function(a,c,u,d){return new IS(a,c,u,d.host,d.ssl,d.experimentalForceLongPolling,d.experimentalAutoDetectLongPolling,dw(d.experimentalLongPollingOptions),d.useFetchStreams)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,s);n._componentsProvider||!((t=s.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),n._firestoreClient=new LR(n._authCredentials,n._appCheckCredentials,n._queue,i,n._componentsProvider&&function(a){const c=a==null?void 0:a._online.build();return{_offline:a==null?void 0:a._offline.build(c),_online:c}}(n._componentsProvider))}function nL(n,e){qn("enableIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const t=n._freezeSettings();return mw(n,xs.provider,{build:r=>new Gf(r,t.cacheSizeBytes,e==null?void 0:e.forceOwnership)}),Promise.resolve()}async function rL(n){qn("enableMultiTabIndexedDbPersistence() will be deprecated in the future, you can use `FirestoreSettings.cache` instead.");const e=n._freezeSettings();mw(n,xs.provider,{build:t=>new iw(t,e.cacheSizeBytes)})}function mw(n,e,t){if((n=Be(n,ht))._firestoreClient||n._terminated)throw new Y(U.FAILED_PRECONDITION,"Firestore has already been started and persistence can no longer be enabled. You can only enable persistence before calling any other methods on a Firestore object.");if(n._componentsProvider||n._getSettings().localCache)throw new Y(U.FAILED_PRECONDITION,"SDK cache is already specified.");n._componentsProvider={_online:e,_offline:t},pw(n)}function sL(n){if(n._initialized&&!n._terminated)throw new Y(U.FAILED_PRECONDITION,"Persistence can only be cleared before a Firestore instance is initialized or after it is terminated.");const e=new Jt;return n._queue.enqueueAndForgetEvenWhileRestricted(async()=>{try{await async function(r){if(!ur.D())return Promise.resolve();const s=r+"main";await ur.delete(s)}(xf(n._databaseId,n._persistenceKey)),e.resolve()}catch(t){e.reject(t)}}),e.promise}function iL(n){return function(t){const r=new Jt;return t.asyncQueue.enqueueAndForget(async()=>bR(await Hf(t),r)),r.promise}(St(n=Be(n,ht)))}function oL(n){return FR(St(n=Be(n,ht)))}function aL(n){return UR(St(n=Be(n,ht)))}function lL(n){return xP(n.app,"firestore",n._databaseId.database),n._delete()}function cL(n,e){const t=St(n=Be(n,ht)),r=new YR;return zR(t,n._databaseId,e,r),r}function uL(n,e){return GR(St(n=Be(n,ht)),e).then(t=>t?new cn(n,null,t.query):null)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class tl{constructor(e="count",t){this._internalFieldPath=t,this.type="AggregateField",this.aggregateType=e}}class ZR{constructor(e,t,r){this._userDataWriter=t,this._data=r,this.type="AggregateQuerySnapshot",this.query=e}data(){return this._userDataWriter.convertObjectMap(this._data)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hi{constructor(e){this._byteString=e}static fromBase64String(e){try{return new hi(Ct.fromBase64String(e))}catch(t){throw new Y(U.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new hi(Ct.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mi{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new Y(U.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new wt(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}function dL(){return new mi("__name__")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gi{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qf{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new Y(U.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new Y(U.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return Pe(this._lat,e._lat)||Pe(this._long,e._long)}}/**
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
 */class ju{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eC=/^__.*__$/;class tC{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new zr(e,this.data,this.fieldMask,t,this.fieldTransforms):new Do(e,this.data,t,this.fieldTransforms)}}class gw{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return new zr(e,this.data,this.fieldMask,t,this.fieldTransforms)}}function _w(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw pe()}}class $u{constructor(e,t,r,s,i,o){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.vu(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new $u(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Fu({path:r,xu:!1});return s.Ou(e),s}Nu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),s=this.Fu({path:r,xu:!1});return s.vu(),s}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return nu(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(_w(this.Cu)&&eC.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class nC{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||bl(e)}Qu(e,t,r,s=!1){return new $u({Cu:e,methodName:t,qu:r,path:wt.emptyPath(),xu:!1,ku:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function _i(n){const e=n._freezeSettings(),t=bl(n._databaseId);return new nC(n._databaseId,!!e.ignoreUndefinedProperties,t)}function qu(n,e,t,r,s,i={}){const o=n.Qu(i.merge||i.mergeFields?2:0,e,t,s);np("Data must be an object, but it was:",o,r);const a=ww(r,o);let c,u;if(i.merge)c=new kn(o.fieldMask),u=o.fieldTransforms;else if(i.mergeFields){const d=[];for(const f of i.mergeFields){const g=nl(e,f,t);if(!o.contains(g))throw new Y(U.INVALID_ARGUMENT,`Field '${g}' is specified in your field mask but missing from your input data.`);Iw(d,g)||d.push(g)}c=new kn(d),u=o.fieldTransforms.filter(f=>c.covers(f.field))}else c=null,u=o.fieldTransforms;return new tC(new ln(a),c,u)}class Tl extends gi{_toFieldTransform(e){if(e.Cu!==2)throw e.Cu===1?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Tl}}function yw(n,e,t){return new $u({Cu:3,qu:e.settings.qu,methodName:n._methodName,xu:t},e.databaseId,e.serializer,e.ignoreUndefinedProperties)}class Jf extends gi{_toFieldTransform(e){return new yl(e.path,new _o)}isEqual(e){return e instanceof Jf}}class Yf extends gi{constructor(e,t){super(e),this.Ku=t}_toFieldTransform(e){const t=yw(this,e,!0),r=this.Ku.map(i=>yi(i,t)),s=new ai(r);return new yl(e.path,s)}isEqual(e){return e instanceof Yf&&bs(this.Ku,e.Ku)}}class Xf extends gi{constructor(e,t){super(e),this.Ku=t}_toFieldTransform(e){const t=yw(this,e,!0),r=this.Ku.map(i=>yi(i,t)),s=new li(r);return new yl(e.path,s)}isEqual(e){return e instanceof Xf&&bs(this.Ku,e.Ku)}}class Zf extends gi{constructor(e,t){super(e),this.$u=t}_toFieldTransform(e){const t=new yo(e.serializer,Xv(e.serializer,this.$u));return new yl(e.path,t)}isEqual(e){return e instanceof Zf&&this.$u===e.$u}}function ep(n,e,t,r){const s=n.Qu(1,e,t);np("Data must be an object, but it was:",s,r);const i=[],o=ln.empty();Vs(r,(c,u)=>{const d=zu(e,c,t);u=we(u);const f=s.Nu(d);if(u instanceof Tl)i.push(d);else{const g=yi(u,f);g!=null&&(i.push(d),o.set(d,g))}});const a=new kn(i);return new gw(o,a,s.fieldTransforms)}function tp(n,e,t,r,s,i){const o=n.Qu(1,e,t),a=[nl(e,r,t)],c=[s];if(i.length%2!=0)throw new Y(U.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let g=0;g<i.length;g+=2)a.push(nl(e,i[g])),c.push(i[g+1]);const u=[],d=ln.empty();for(let g=a.length-1;g>=0;--g)if(!Iw(u,a[g])){const _=a[g];let k=c[g];k=we(k);const T=o.Nu(_);if(k instanceof Tl)u.push(_);else{const C=yi(k,T);C!=null&&(u.push(_),d.set(_,C))}}const f=new kn(u);return new gw(d,f,o.fieldTransforms)}function vw(n,e,t,r=!1){return yi(t,n.Qu(r?4:3,e))}function yi(n,e){if(bw(n=we(n)))return np("Unsupported field value:",e,n),ww(n,e);if(n instanceof gi)return function(r,s){if(!_w(s.Cu))throw s.Bu(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Bu(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,s){const i=[];let o=0;for(const a of r){let c=yi(a,s.Lu(o));c==null&&(c={nullValue:"NULL_VALUE"}),i.push(c),o++}return{arrayValue:{values:i}}}(n,e)}return function(r,s){if((r=we(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return Xv(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=Pt.fromDate(r);return{timestampValue:vo(s.serializer,i)}}if(r instanceof Pt){const i=new Pt(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:vo(s.serializer,i)}}if(r instanceof Qf)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof hi)return{bytesValue:d0(s.serializer,r._byteString)};if(r instanceof Lt){const i=s.databaseId,o=r.firestore._databaseId;if(!o.isEqual(i))throw s.Bu(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:bf(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof ju)return function(o,a){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:o.toArray().map(c=>{if(typeof c!="number")throw a.Bu("VectorValues must only contain numeric values.");return mf(a.serializer,c)})}}}}}}(r,s);throw s.Bu(`Unsupported field value: ${Bu(r)}`)}(n,e)}function ww(n,e){const t={};return Cv(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Vs(n,(r,s)=>{const i=yi(s,e.Mu(r));i!=null&&(t[r]=i)}),{mapValue:{fields:t}}}function bw(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof Pt||n instanceof Qf||n instanceof hi||n instanceof Lt||n instanceof gi||n instanceof ju)}function np(n,e,t){if(!bw(t)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(t)){const r=Bu(t);throw r==="an object"?e.Bu(n+" a custom object"):e.Bu(n+" "+r)}}function nl(n,e,t){if((e=we(e))instanceof mi)return e._internalPath;if(typeof e=="string")return zu(n,e);throw nu("Field path arguments must be of type string or ",n,!1,void 0,t)}const rC=new RegExp("[~\\*/\\[\\]]");function zu(n,e,t){if(e.search(rC)>=0)throw nu(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new mi(...e.split("."))._internalPath}catch{throw nu(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function nu(n,e,t,r,s){const i=r&&!r.isEmpty(),o=s!==void 0;let a=`Function ${e}() called with invalid data`;t&&(a+=" (via `toFirestore()`)"),a+=". ";let c="";return(i||o)&&(c+=" (found",i&&(c+=` in field ${r}`),o&&(c+=` in document ${s}`),c+=")"),new Y(U.INVALID_ARGUMENT,a+n+c)}function Iw(n,e){return n.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rl{constructor(e,t,r,s,i){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new Lt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new sC(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(Gu("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class sC extends rl{data(){return super.data()}}function Gu(n,e){return typeof e=="string"?zu(n,e):e instanceof mi?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ew(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new Y(U.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class rp{}class Al extends rp{}function Tw(n,e,...t){let r=[];e instanceof rp&&r.push(e),r=r.concat(t),function(i){const o=i.filter(c=>c instanceof Uo).length,a=i.filter(c=>c instanceof Pl).length;if(o>1||o>0&&a>0)throw new Y(U.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)n=s._apply(n);return n}class Pl extends Al{constructor(e,t,r){super(),this._field=e,this._op=t,this._value=r,this.type="where"}static _create(e,t,r){return new Pl(e,t,r)}_apply(e){const t=this._parse(e);return Pw(e._query,t),new cn(e.firestore,e.converter,bh(e._query,t))}_parse(e){const t=_i(e.firestore);return function(i,o,a,c,u,d,f){let g;if(u.isKeyField()){if(d==="array-contains"||d==="array-contains-any")throw new Y(U.INVALID_ARGUMENT,`Invalid Query. You can't perform '${d}' queries on documentId().`);if(d==="in"||d==="not-in"){o_(f,d);const _=[];for(const k of f)_.push(i_(c,i,k));g={arrayValue:{values:_}}}else g=i_(c,i,f)}else d!=="in"&&d!=="not-in"&&d!=="array-contains-any"||o_(f,d),g=vw(a,o,f,d==="in"||d==="not-in");return Ge.create(u,d,g)}(e._query,"where",t,e.firestore._databaseId,this._field,this._op,this._value)}}function iC(n,e,t){const r=e,s=Gu("where",n);return Pl._create(s,r,t)}class Uo extends rp{constructor(e,t){super(),this.type=e,this._queryConstraints=t}static _create(e,t){return new Uo(e,t)}_parse(e){const t=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return t.length===1?t[0]:it.create(t,this._getOperator())}_apply(e){const t=this._parse(e);return t.getFilters().length===0?e:(function(s,i){let o=s;const a=i.getFlattenedFilters();for(const c of a)Pw(o,c),o=bh(o,c)}(e._query,t),new cn(e.firestore,e.converter,bh(e._query,t)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}function hL(...n){return n.forEach(e=>Sw("or",e)),Uo._create("or",n)}function fL(...n){return n.forEach(e=>Sw("and",e)),Uo._create("and",n)}class sp extends Al{constructor(e,t){super(),this._field=e,this._direction=t,this.type="orderBy"}static _create(e,t){return new sp(e,t)}_apply(e){const t=function(s,i,o){if(s.startAt!==null)throw new Y(U.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new Y(U.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Xa(i,o)}(e._query,this._field,this._direction);return new cn(e.firestore,e.converter,function(s,i){const o=s.explicitOrderBy.concat([i]);return new $r(s.path,s.collectionGroup,o,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,t))}}function oC(n,e="asc"){const t=e,r=Gu("orderBy",n);return sp._create(r,t)}class Ku extends Al{constructor(e,t,r){super(),this.type=e,this._limit=t,this._limitType=r}static _create(e,t,r){return new Ku(e,t,r)}_apply(e){return new cn(e.firestore,e.converter,Kc(e._query,this._limit,this._limitType))}}function pL(n){return hw("limit",n),Ku._create("limit",n,"F")}function mL(n){return hw("limitToLast",n),Ku._create("limitToLast",n,"L")}class Hu extends Al{constructor(e,t,r){super(),this.type=e,this._docOrFields=t,this._inclusive=r}static _create(e,t,r){return new Hu(e,t,r)}_apply(e){const t=Aw(e,this.type,this._docOrFields,this._inclusive);return new cn(e.firestore,e.converter,function(s,i){return new $r(s.path,s.collectionGroup,s.explicitOrderBy.slice(),s.filters.slice(),s.limit,s.limitType,i,s.endAt)}(e._query,t))}}function gL(...n){return Hu._create("startAt",n,!0)}function _L(...n){return Hu._create("startAfter",n,!1)}class Wu extends Al{constructor(e,t,r){super(),this.type=e,this._docOrFields=t,this._inclusive=r}static _create(e,t,r){return new Wu(e,t,r)}_apply(e){const t=Aw(e,this.type,this._docOrFields,this._inclusive);return new cn(e.firestore,e.converter,function(s,i){return new $r(s.path,s.collectionGroup,s.explicitOrderBy.slice(),s.filters.slice(),s.limit,s.limitType,s.startAt,i)}(e._query,t))}}function yL(...n){return Wu._create("endBefore",n,!1)}function vL(...n){return Wu._create("endAt",n,!0)}function Aw(n,e,t,r){if(t[0]=we(t[0]),t[0]instanceof rl)return function(i,o,a,c,u){if(!c)throw new Y(U.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${a}().`);const d=[];for(const f of eo(i))if(f.field.isKeyField())d.push(ii(o,c.key));else{const g=c.data.field(f.field);if(Su(g))throw new Y(U.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+f.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(g===null){const _=f.field.canonicalString();throw new Y(U.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${_}' (used as the orderBy) does not exist.`)}d.push(g)}return new As(d,u)}(n._query,n.firestore._databaseId,e,t[0]._document,r);{const s=_i(n.firestore);return function(o,a,c,u,d,f){const g=o.explicitOrderBy;if(d.length>g.length)throw new Y(U.INVALID_ARGUMENT,`Too many arguments provided to ${u}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);const _=[];for(let k=0;k<d.length;k++){const T=d[k];if(g[k].field.isKeyField()){if(typeof T!="string")throw new Y(U.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${u}(), but got a ${typeof T}`);if(!ff(o)&&T.indexOf("/")!==-1)throw new Y(U.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${u}() must be a plain document ID, but '${T}' contains a slash.`);const C=o.path.child(ze.fromString(T));if(!he.isDocumentKey(C))throw new Y(U.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${u}() must result in a valid document path, but '${C}' is not because it contains an odd number of segments.`);const F=new he(C);_.push(ii(a,F))}else{const C=vw(c,u,T);_.push(C)}}return new As(_,f)}(n._query,n.firestore._databaseId,s,e,t,r)}}function i_(n,e,t){if(typeof(t=we(t))=="string"){if(t==="")throw new Y(U.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!ff(e)&&t.indexOf("/")!==-1)throw new Y(U.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${t}' contains a '/' character.`);const r=e.path.child(ze.fromString(t));if(!he.isDocumentKey(r))throw new Y(U.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return ii(n,new he(r))}if(t instanceof Lt)return ii(n,t._key);throw new Y(U.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Bu(t)}.`)}function o_(n,e){if(!Array.isArray(n)||n.length===0)throw new Y(U.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Pw(n,e){const t=function(s,i){for(const o of s)for(const a of o.getFlattenedFilters())if(i.indexOf(a.op)>=0)return a.op;return null}(n.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(t!==null)throw t===e.op?new Y(U.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new Y(U.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${t.toString()}' filters.`)}function Sw(n,e){if(!(e instanceof Pl||e instanceof Uo))throw new Y(U.INVALID_ARGUMENT,`Function ${n}() requires AppliableConstraints created with a call to 'where(...)', 'or(...)', or 'and(...)'.`)}class xw{convertValue(e,t="none"){switch(Es(e)){case 0:return null;case 1:return e.booleanValue;case 2:return vt(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(Mr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw pe()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return Vs(e,(s,i)=>{r[s]=this.convertValue(i,t)}),r}convertVectorValue(e){var t,r,s;const i=(s=(r=(t=e.fields)===null||t===void 0?void 0:t.value.arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(o=>vt(o.doubleValue));return new ju(i)}convertGeoPoint(e){return new Qf(vt(e.latitude),vt(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=xu(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Qa(e));default:return null}}convertTimestamp(e){const t=Or(e);return new Pt(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=ze.fromString(e);ge(I0(r));const s=new si(r.get(1),r.get(3)),i=new he(r.popFirst(5));return s.isEqual(t)||Nt(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qu(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}class aC extends xw{constructor(e){super(),this.firestore=e}convertBytes(e){return new hi(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Lt(this.firestore,null,t)}}/**
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
 */function wL(n){return new tl("sum",nl("sum",n))}function bL(n){return new tl("avg",nl("average",n))}function lC(){return new tl("count")}function IL(n,e){var t,r;return n instanceof tl&&e instanceof tl&&n.aggregateType===e.aggregateType&&((t=n._internalFieldPath)===null||t===void 0?void 0:t.canonicalString())===((r=e._internalFieldPath)===null||r===void 0?void 0:r.canonicalString())}function EL(n,e){return fw(n.query,e.query)&&bs(n.data(),e.data())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Js{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Po extends rl{constructor(e,t,r,s,i,o){super(e,t,r,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new xc(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(Gu("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class xc extends Po{data(e={}){return super.data(e)}}class So{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new Js(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new xc(this._firestore,this._userDataWriter,r.key,r,new Js(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new Y(U.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map(a=>{const c=new xc(s._firestore,s._userDataWriter,a.doc.key,a.doc,new Js(s._snapshot.mutatedKeys.has(a.doc.key),s._snapshot.fromCache),s.query.converter);return a.doc,{type:"added",doc:c,oldIndex:-1,newIndex:o++}})}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(a=>i||a.type!==3).map(a=>{const c=new xc(s._firestore,s._userDataWriter,a.doc.key,a.doc,new Js(s._snapshot.mutatedKeys.has(a.doc.key),s._snapshot.fromCache),s.query.converter);let u=-1,d=-1;return a.type!==0&&(u=o.indexOf(a.doc.key),o=o.delete(a.doc.key)),a.type!==1&&(o=o.add(a.doc),d=o.indexOf(a.doc.key)),{type:cC(a.type),doc:c,oldIndex:u,newIndex:d}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function cC(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return pe()}}function TL(n,e){return n instanceof Po&&e instanceof Po?n._firestore===e._firestore&&n._key.isEqual(e._key)&&(n._document===null?e._document===null:n._document.isEqual(e._document))&&n._converter===e._converter:n instanceof So&&e instanceof So&&n._firestore===e._firestore&&fw(n.query,e.query)&&n.metadata.isEqual(e.metadata)&&n._snapshot.isEqual(e._snapshot)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ju(n){n=Be(n,Lt);const e=Be(n.firestore,ht);return cw(St(e),n._key).then(t=>ip(e,n,t))}class Os extends xw{constructor(e){super(),this.firestore=e}convertBytes(e){return new hi(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new Lt(this.firestore,null,t)}}function AL(n){n=Be(n,Lt);const e=Be(n.firestore,ht),t=St(e),r=new Os(e);return BR(t,n._key).then(s=>new Po(e,r,n._key,s,new Js(s!==null&&s.hasLocalMutations,!0),n.converter))}function PL(n){n=Be(n,Lt);const e=Be(n.firestore,ht);return cw(St(e),n._key,{source:"server"}).then(t=>ip(e,n,t))}function At(n){n=Be(n,cn);const e=Be(n.firestore,ht),t=St(e),r=new Os(e);return Ew(n._query),uw(t,n._query).then(s=>new So(e,r,n,s))}function SL(n){n=Be(n,cn);const e=Be(n.firestore,ht),t=St(e),r=new Os(e);return jR(t,n._query).then(s=>new So(e,r,n,s))}function xL(n){n=Be(n,cn);const e=Be(n.firestore,ht),t=St(e),r=new Os(e);return uw(t,n._query,{source:"server"}).then(s=>new So(e,r,n,s))}function Ln(n,e,t){n=Be(n,Lt);const r=Be(n.firestore,ht),s=Qu(n.converter,e,t);return Sl(r,[qu(_i(r),"setDoc",n._key,s,n.converter!==null,t).toMutation(n._key,bt.none())])}function RL(n,e,t,...r){n=Be(n,Lt);const s=Be(n.firestore,ht),i=_i(s);let o;return o=typeof(e=we(e))=="string"||e instanceof mi?tp(i,"updateDoc",n._key,e,t,r):ep(i,"updateDoc",n._key,e),Sl(s,[o.toMutation(n._key,bt.exists(!0))])}function ru(n){return Sl(Be(n.firestore,ht),[new Vo(n._key,bt.none())])}function uC(n,e){const t=Be(n.firestore,ht),r=Ue(n),s=Qu(n.converter,e);return Sl(t,[qu(_i(n.firestore),"addDoc",r._key,s,n.converter!==null,{}).toMutation(r._key,bt.exists(!1))]).then(()=>r)}function CL(n,...e){var t,r,s;n=we(n);let i={includeMetadataChanges:!1,source:"default"},o=0;typeof e[o]!="object"||Vh(e[o])||(i=e[o],o++);const a={includeMetadataChanges:i.includeMetadataChanges,source:i.source};if(Vh(e[o])){const f=e[o];e[o]=(t=f.next)===null||t===void 0?void 0:t.bind(f),e[o+1]=(r=f.error)===null||r===void 0?void 0:r.bind(f),e[o+2]=(s=f.complete)===null||s===void 0?void 0:s.bind(f)}let c,u,d;if(n instanceof Lt)u=Be(n.firestore,ht),d=ko(n._key.path),c={next:f=>{e[o]&&e[o](ip(u,n,f))},error:e[o+1],complete:e[o+2]};else{const f=Be(n,cn);u=Be(f.firestore,ht),d=f._query;const g=new Os(u);c={next:_=>{e[o]&&e[o](new So(u,g,f,_))},error:e[o+1],complete:e[o+2]},Ew(n._query)}return function(g,_,k,T){const C=new Fu(T),F=new Uf(_,C,k);return g.asyncQueue.enqueueAndForget(async()=>Mf(await Ao(g),F)),()=>{C.Za(),g.asyncQueue.enqueueAndForget(async()=>Lf(await Ao(g),F))}}(St(u),d,a,c)}function kL(n,e){return qR(St(n=Be(n,ht)),Vh(e)?e:{next:e})}function Sl(n,e){return function(r,s){const i=new Jt;return r.asyncQueue.enqueueAndForget(async()=>_R(await Hf(r),s,i)),i.promise}(St(n),e)}function ip(n,e,t){const r=t.docs.get(e._key),s=new Os(n);return new Po(n,s,e._key,r,new Js(t.hasPendingWrites,t.fromCache),e.converter)}/**
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
 */function DL(n){return dC(n,{count:lC()})}function dC(n,e){const t=Be(n.firestore,ht),r=St(t),s=Rv(e,(i,o)=>new i0(o,i.aggregateType,i._internalFieldPath));return $R(r,n._query,s).then(i=>function(a,c,u){const d=new Os(a);return new ZR(c,d,u)}(t,n,i))}class hC{constructor(e){this.kind="memory",this._onlineComponentProvider=xs.provider,e!=null&&e.garbageCollector?this._offlineComponentProvider=e.garbageCollector._offlineComponentProvider:this._offlineComponentProvider=Ss.provider}toJSON(){return{kind:this.kind}}}class fC{constructor(e){let t;this.kind="persistent",e!=null&&e.tabManager?(e.tabManager._initialize(e),t=e.tabManager):(t=yC(void 0),t._initialize(e)),this._onlineComponentProvider=t._onlineComponentProvider,this._offlineComponentProvider=t._offlineComponentProvider}toJSON(){return{kind:this.kind}}}class pC{constructor(){this.kind="memoryEager",this._offlineComponentProvider=Ss.provider}toJSON(){return{kind:this.kind}}}class mC{constructor(e){this.kind="memoryLru",this._offlineComponentProvider={build:()=>new VR(e)}}toJSON(){return{kind:this.kind}}}function VL(){return new pC}function NL(n){return new mC(n==null?void 0:n.cacheSizeBytes)}function OL(n){return new hC(n)}function ML(n){return new fC(n)}class gC{constructor(e){this.forceOwnership=e,this.kind="persistentSingleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=xs.provider,this._offlineComponentProvider={build:t=>new Gf(t,e==null?void 0:e.cacheSizeBytes,this.forceOwnership)}}}class _C{constructor(){this.kind="PersistentMultipleTab"}toJSON(){return{kind:this.kind}}_initialize(e){this._onlineComponentProvider=xs.provider,this._offlineComponentProvider={build:t=>new iw(t,e==null?void 0:e.cacheSizeBytes)}}}function yC(n){return new gC(n==null?void 0:n.forceOwnership)}function LL(){return new _C}/**
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
 */const vC={maxAttempts:5};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wC{constructor(e,t){this._firestore=e,this._commitHandler=t,this._mutations=[],this._committed=!1,this._dataReader=_i(e)}set(e,t,r){this._verifyNotCommitted();const s=cs(e,this._firestore),i=Qu(s.converter,t,r),o=qu(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(o.toMutation(s._key,bt.none())),this}update(e,t,r,...s){this._verifyNotCommitted();const i=cs(e,this._firestore);let o;return o=typeof(t=we(t))=="string"||t instanceof mi?tp(this._dataReader,"WriteBatch.update",i._key,t,r,s):ep(this._dataReader,"WriteBatch.update",i._key,t),this._mutations.push(o.toMutation(i._key,bt.exists(!0))),this}delete(e){this._verifyNotCommitted();const t=cs(e,this._firestore);return this._mutations=this._mutations.concat(new Vo(t._key,bt.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new Y(U.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function cs(n,e){if((n=we(n)).firestore!==e)throw new Y(U.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bC extends class{constructor(t,r){this._firestore=t,this._transaction=r,this._dataReader=_i(t)}get(t){const r=cs(t,this._firestore),s=new aC(this._firestore);return this._transaction.lookup([r._key]).then(i=>{if(!i||i.length!==1)return pe();const o=i[0];if(o.isFoundDocument())return new rl(this._firestore,s,o.key,o,r.converter);if(o.isNoDocument())return new rl(this._firestore,s,r._key,null,r.converter);throw pe()})}set(t,r,s){const i=cs(t,this._firestore),o=Qu(i.converter,r,s),a=qu(this._dataReader,"Transaction.set",i._key,o,i.converter!==null,s);return this._transaction.set(i._key,a),this}update(t,r,s,...i){const o=cs(t,this._firestore);let a;return a=typeof(r=we(r))=="string"||r instanceof mi?tp(this._dataReader,"Transaction.update",o._key,r,s,i):ep(this._dataReader,"Transaction.update",o._key,r),this._transaction.update(o._key,a),this}delete(t){const r=cs(t,this._firestore);return this._transaction.delete(r._key),this}}{constructor(e,t){super(e,t),this._firestore=e}get(e){const t=cs(e,this._firestore),r=new Os(this._firestore);return super.get(e).then(s=>new Po(this._firestore,r,t._key,s._document,new Js(!1,!1),t.converter))}}function UL(n,e,t){n=Be(n,ht);const r=Object.assign(Object.assign({},vC),t);return function(i){if(i.maxAttempts<1)throw new Y(U.INVALID_ARGUMENT,"Max attempts must be at least 1")}(r),function(i,o,a){const c=new Jt;return i.asyncQueue.enqueueAndForget(async()=>{const u=await lw(i);new MR(i.asyncQueue,u,a,o,c).au()}),c.promise}(St(n),s=>e(new bC(n,s)),r)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function BL(){return new Tl("deleteField")}function Rw(){return new Jf("serverTimestamp")}function jL(...n){return new Yf("arrayUnion",n)}function $L(...n){return new Xf("arrayRemove",n)}function qL(n){return new Zf("increment",n)}function zL(n){return new ju(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cw(n){return St(n=Be(n,ht)),new wC(n,e=>Sl(n,e))}/**
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
 */function GL(n,e){const t=St(n=Be(n,ht));if(!t._uninitializedComponentsProvider||t._uninitializedComponentsProvider._offline.kind==="memory")return qn("Cannot enable indexes when persistence is disabled"),Promise.resolve();const r=function(i){const o=typeof i=="string"?function(u){try{return JSON.parse(u)}catch(d){throw new Y(U.INVALID_ARGUMENT,"Failed to parse JSON: "+(d==null?void 0:d.message))}}(i):i,a=[];if(Array.isArray(o.indexes))for(const c of o.indexes){const u=a_(c,"collectionGroup"),d=[];if(Array.isArray(c.fields))for(const f of c.fields){const g=zu("setIndexConfiguration",a_(f,"fieldPath"));f.arrayConfig==="CONTAINS"?d.push(new ei(g,2)):f.order==="ASCENDING"?d.push(new ei(g,0)):f.order==="DESCENDING"&&d.push(new ei(g,1))}a.push(new fo(fo.UNKNOWN_ID,u,d,po.empty()))}return a}(e);return KR(t,r)}function a_(n,e){if(typeof n[e]!="string")throw new Y(U.INVALID_ARGUMENT,"Missing string value for: "+e);return n[e]}/**
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
 */class IC{constructor(e){this._firestore=e,this.type="PersistentCacheIndexManager"}}function KL(n){var e;n=Be(n,ht);const t=l_.get(n);if(t)return t;if(((e=St(n)._uninitializedComponentsProvider)===null||e===void 0?void 0:e._offline.kind)!=="persistent")return null;const r=new IC(n);return l_.set(n,r),r}function HL(n){kw(n,!0)}function WL(n){kw(n,!1)}function QL(n){WR(St(n._firestore)).then(e=>J("deleting all persistent cache indexes succeeded")).catch(e=>qn("deleting all persistent cache indexes failed",e))}function kw(n,e){HR(St(n._firestore),e).then(t=>J(`setting persistent cache index auto creation isEnabled=${e} succeeded`)).catch(t=>qn(`setting persistent cache index auto creation isEnabled=${e} failed`,t))}const l_=new WeakMap;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function JL(n){var e;const t=(e=St(Be(n.firestore,ht))._onlineComponents)===null||e===void 0?void 0:e.datastore.serializer;return t===void 0?null:Du(t,vn(n._query))._t}function YL(n,e){var t;const r=Rv(e,(i,o)=>new i0(o,i.aggregateType,i._internalFieldPath)),s=(t=St(Be(n.firestore,ht))._onlineComponents)===null||t===void 0?void 0:t.datastore.serializer;return s===void 0?null:y0(s,qv(n._query),r,!0).request}/**
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
 */class XL{constructor(){throw new Error("instances of this class should not be created")}static onExistenceFilterMismatch(e){return op.instance.onExistenceFilterMismatch(e)}}class op{constructor(){this.Uu=new Map}static get instance(){return hc||(hc=new op,function(t){if(Hc)throw new Error("a TestingHooksSpi instance is already set");Hc=t}(hc)),hc}et(e){this.Uu.forEach(t=>t(e))}onExistenceFilterMismatch(e){const t=Symbol(),r=this.Uu;return r.set(t,e),()=>r.delete(t)}}let hc=null;(function(e,t=!0){(function(s){Co=s})(Ro),uo(new ri("firestore",(r,{instanceIdentifier:s,options:i})=>{const o=r.getProvider("app").getImmediate(),a=new ht(new zP(r.getProvider("auth-internal")),new HP(r.getProvider("app-check-internal")),function(u,d){if(!Object.prototype.hasOwnProperty.apply(u.options,["projectId"]))throw new Y(U.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new si(u.options.projectId,d)}(o,s),o);return i=Object.assign({useFetchStreams:t},i),a._setSettings(i),a},"PUBLIC").setMultipleInstances(!0)),ys(Ym,"4.7.3",e),ys(Ym,"4.7.3","esm2017")})();function ap(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(n);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(n,r[s])&&(t[r[s]]=n[r[s]]);return t}/**
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
 */const ZL={PHONE:"phone",TOTP:"totp"},eF={FACEBOOK:"facebook.com",GITHUB:"github.com",GOOGLE:"google.com",PASSWORD:"password",PHONE:"phone",TWITTER:"twitter.com"},tF={EMAIL_LINK:"emailLink",EMAIL_PASSWORD:"password",FACEBOOK:"facebook.com",GITHUB:"github.com",GOOGLE:"google.com",PHONE:"phone",TWITTER:"twitter.com"},nF={LINK:"link",REAUTHENTICATE:"reauthenticate",SIGN_IN:"signIn"},rF={EMAIL_SIGNIN:"EMAIL_SIGNIN",PASSWORD_RESET:"PASSWORD_RESET",RECOVER_EMAIL:"RECOVER_EMAIL",REVERT_SECOND_FACTOR_ADDITION:"REVERT_SECOND_FACTOR_ADDITION",VERIFY_AND_CHANGE_EMAIL:"VERIFY_AND_CHANGE_EMAIL",VERIFY_EMAIL:"VERIFY_EMAIL"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function EC(){return{"admin-restricted-operation":"This operation is restricted to administrators only.","argument-error":"","app-not-authorized":"This app, identified by the domain where it's hosted, is not authorized to use Firebase Authentication with the provided API key. Review your key configuration in the Google API console.","app-not-installed":"The requested mobile application corresponding to the identifier (Android package name or iOS bundle ID) provided is not installed on this device.","captcha-check-failed":"The reCAPTCHA response token provided is either invalid, expired, already used or the domain associated with it does not match the list of whitelisted domains.","code-expired":"The SMS code has expired. Please re-send the verification code to try again.","cordova-not-ready":"Cordova framework is not ready.","cors-unsupported":"This browser is not supported.","credential-already-in-use":"This credential is already associated with a different user account.","custom-token-mismatch":"The custom token corresponds to a different audience.","requires-recent-login":"This operation is sensitive and requires recent authentication. Log in again before retrying this request.","dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK.","dynamic-link-not-activated":"Please activate Dynamic Links in the Firebase Console and agree to the terms and conditions.","email-change-needs-verification":"Multi-factor users must always have a verified email.","email-already-in-use":"The email address is already in use by another account.","emulator-config-failed":'Auth instance has already been used to make a network call. Auth can no longer be configured to use the emulator. Try calling "connectAuthEmulator()" sooner.',"expired-action-code":"The action code has expired.","cancelled-popup-request":"This operation has been cancelled due to another conflicting popup being opened.","internal-error":"An internal AuthError has occurred.","invalid-app-credential":"The phone verification request contains an invalid application verifier. The reCAPTCHA token response is either invalid or expired.","invalid-app-id":"The mobile app identifier is not registered for the current project.","invalid-user-token":"This user's credential isn't valid for this project. This can happen if the user's token has been tampered with, or if the user isn't for the project associated with this API key.","invalid-auth-event":"An internal AuthError has occurred.","invalid-verification-code":"The SMS verification code used to create the phone auth credential is invalid. Please resend the verification code sms and be sure to use the verification code provided by the user.","invalid-continue-uri":"The continue URL provided in the request is invalid.","invalid-cordova-configuration":"The following Cordova plugins must be installed to enable OAuth sign-in: cordova-plugin-buildinfo, cordova-universal-links-plugin, cordova-plugin-browsertab, cordova-plugin-inappbrowser and cordova-plugin-customurlscheme.","invalid-custom-token":"The custom token format is incorrect. Please check the documentation.","invalid-dynamic-link-domain":"The provided dynamic link domain is not configured or authorized for the current project.","invalid-email":"The email address is badly formatted.","invalid-emulator-scheme":"Emulator URL must start with a valid scheme (http:// or https://).","invalid-api-key":"Your API key is invalid, please check you have copied it correctly.","invalid-cert-hash":"The SHA-1 certificate hash provided is invalid.","invalid-credential":"The supplied auth credential is incorrect, malformed or has expired.","invalid-message-payload":"The email template corresponding to this action contains invalid characters in its message. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-multi-factor-session":"The request does not contain a valid proof of first factor successful sign-in.","invalid-oauth-provider":"EmailAuthProvider is not supported for this operation. This operation only supports OAuth providers.","invalid-oauth-client-id":"The OAuth client ID provided is either invalid or does not match the specified API key.","unauthorized-domain":"This domain is not authorized for OAuth operations for your Firebase project. Edit the list of authorized domains from the Firebase console.","invalid-action-code":"The action code is invalid. This can happen if the code is malformed, expired, or has already been used.","wrong-password":"The password is invalid or the user does not have a password.","invalid-persistence-type":"The specified persistence type is invalid. It can only be local, session or none.","invalid-phone-number":"The format of the phone number provided is incorrect. Please enter the phone number in a format that can be parsed into E.164 format. E.164 phone numbers are written in the format [+][country code][subscriber number including area code].","invalid-provider-id":"The specified provider ID is invalid.","invalid-recipient-email":"The email corresponding to this action failed to send as the provided recipient email address is invalid.","invalid-sender":"The email template corresponding to this action contains an invalid sender email or name. Please fix by going to the Auth email templates section in the Firebase Console.","invalid-verification-id":"The verification ID used to create the phone auth credential is invalid.","invalid-tenant-id":"The Auth instance's tenant ID is invalid.","login-blocked":"Login blocked by user-provided method: {$originalMessage}","missing-android-pkg-name":"An Android Package Name must be provided if the Android App is required to be installed.","auth-domain-config-required":"Be sure to include authDomain when calling firebase.initializeApp(), by following the instructions in the Firebase console.","missing-app-credential":"The phone verification request is missing an application verifier assertion. A reCAPTCHA response token needs to be provided.","missing-verification-code":"The phone auth credential was created with an empty SMS verification code.","missing-continue-uri":"A continue URL must be provided in the request.","missing-iframe-start":"An internal AuthError has occurred.","missing-ios-bundle-id":"An iOS Bundle ID must be provided if an App Store ID is provided.","missing-or-invalid-nonce":"The request does not contain a valid nonce. This can occur if the SHA-256 hash of the provided raw nonce does not match the hashed nonce in the ID token payload.","missing-password":"A non-empty password must be provided","missing-multi-factor-info":"No second factor identifier is provided.","missing-multi-factor-session":"The request is missing proof of first factor successful sign-in.","missing-phone-number":"To send verification codes, provide a phone number for the recipient.","missing-verification-id":"The phone auth credential was created with an empty verification ID.","app-deleted":"This instance of FirebaseApp has been deleted.","multi-factor-info-not-found":"The user does not have a second factor matching the identifier provided.","multi-factor-auth-required":"Proof of ownership of a second factor is required to complete sign-in.","account-exists-with-different-credential":"An account already exists with the same email address but different sign-in credentials. Sign in using a provider associated with this email address.","network-request-failed":"A network AuthError (such as timeout, interrupted connection or unreachable host) has occurred.","no-auth-event":"An internal AuthError has occurred.","no-such-provider":"User was not linked to an account with the given provider.","null-user":"A null user object was provided as the argument for an operation which requires a non-null user object.","operation-not-allowed":"The given sign-in provider is disabled for this Firebase project. Enable it in the Firebase console, under the sign-in method tab of the Auth section.","operation-not-supported-in-this-environment":'This operation is not supported in the environment this application is running on. "location.protocol" must be http, https or chrome-extension and web storage must be enabled.',"popup-blocked":"Unable to establish a connection with the popup. It may have been blocked by the browser.","popup-closed-by-user":"The popup has been closed by the user before finalizing the operation.","provider-already-linked":"User can only be linked to one identity for the given provider.","quota-exceeded":"The project's quota for this operation has been exceeded.","redirect-cancelled-by-user":"The redirect operation has been cancelled by the user before finalizing.","redirect-operation-pending":"A redirect sign-in operation is already pending.","rejected-credential":"The request contains malformed or mismatching credentials.","second-factor-already-in-use":"The second factor is already enrolled on this account.","maximum-second-factor-count-exceeded":"The maximum allowed number of second factors on a user has been exceeded.","tenant-id-mismatch":"The provided tenant ID does not match the Auth instance's tenant ID",timeout:"The operation has timed out.","user-token-expired":"The user's credential is no longer valid. The user must sign in again.","too-many-requests":"We have blocked all requests from this device due to unusual activity. Try again later.","unauthorized-continue-uri":"The domain of the continue URL is not whitelisted.  Please whitelist the domain in the Firebase console.","unsupported-first-factor":"Enrolling a second factor or signing in with a multi-factor account requires sign-in with a supported first factor.","unsupported-persistence-type":"The current environment does not support the specified persistence type.","unsupported-tenant-operation":"This operation is not supported in a multi-tenant context.","unverified-email":"The operation requires a verified email.","user-cancelled":"The user did not grant your application the permissions it requested.","user-not-found":"There is no user record corresponding to this identifier. The user may have been deleted.","user-disabled":"The user account has been disabled by an administrator.","user-mismatch":"The supplied credentials do not correspond to the previously signed in user.","user-signed-out":"","weak-password":"The password must be 6 characters long or more.","web-storage-unsupported":"This browser is not supported or 3rd party cookies and data may be disabled.","already-initialized":"initializeAuth() has already been called with different options. To avoid this error, call initializeAuth() with the same options as when it was originally called, or call getAuth() to return the already initialized instance.","missing-recaptcha-token":"The reCAPTCHA token is missing when sending request to the backend.","invalid-recaptcha-token":"The reCAPTCHA token is invalid when sending request to the backend.","invalid-recaptcha-action":"The reCAPTCHA action is invalid when sending request to the backend.","recaptcha-not-enabled":"reCAPTCHA Enterprise integration is not enabled for this project.","missing-client-type":"The reCAPTCHA client type is missing when sending request to the backend.","missing-recaptcha-version":"The reCAPTCHA version is missing when sending request to the backend.","invalid-req-type":"Invalid request parameters.","invalid-recaptcha-version":"The reCAPTCHA version is invalid when sending request to the backend.","unsupported-password-policy-schema-version":"The password policy received from the backend uses a schema version that is not supported by this version of the Firebase SDK.","password-does-not-meet-requirements":"The password does not meet the requirements."}}function Dw(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const sF=EC,TC=Dw,Vw=new hl("auth","Firebase",Dw()),iF={ADMIN_ONLY_OPERATION:"auth/admin-restricted-operation",ARGUMENT_ERROR:"auth/argument-error",APP_NOT_AUTHORIZED:"auth/app-not-authorized",APP_NOT_INSTALLED:"auth/app-not-installed",CAPTCHA_CHECK_FAILED:"auth/captcha-check-failed",CODE_EXPIRED:"auth/code-expired",CORDOVA_NOT_READY:"auth/cordova-not-ready",CORS_UNSUPPORTED:"auth/cors-unsupported",CREDENTIAL_ALREADY_IN_USE:"auth/credential-already-in-use",CREDENTIAL_MISMATCH:"auth/custom-token-mismatch",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"auth/requires-recent-login",DEPENDENT_SDK_INIT_BEFORE_AUTH:"auth/dependent-sdk-initialized-before-auth",DYNAMIC_LINK_NOT_ACTIVATED:"auth/dynamic-link-not-activated",EMAIL_CHANGE_NEEDS_VERIFICATION:"auth/email-change-needs-verification",EMAIL_EXISTS:"auth/email-already-in-use",EMULATOR_CONFIG_FAILED:"auth/emulator-config-failed",EXPIRED_OOB_CODE:"auth/expired-action-code",EXPIRED_POPUP_REQUEST:"auth/cancelled-popup-request",INTERNAL_ERROR:"auth/internal-error",INVALID_API_KEY:"auth/invalid-api-key",INVALID_APP_CREDENTIAL:"auth/invalid-app-credential",INVALID_APP_ID:"auth/invalid-app-id",INVALID_AUTH:"auth/invalid-user-token",INVALID_AUTH_EVENT:"auth/invalid-auth-event",INVALID_CERT_HASH:"auth/invalid-cert-hash",INVALID_CODE:"auth/invalid-verification-code",INVALID_CONTINUE_URI:"auth/invalid-continue-uri",INVALID_CORDOVA_CONFIGURATION:"auth/invalid-cordova-configuration",INVALID_CUSTOM_TOKEN:"auth/invalid-custom-token",INVALID_DYNAMIC_LINK_DOMAIN:"auth/invalid-dynamic-link-domain",INVALID_EMAIL:"auth/invalid-email",INVALID_EMULATOR_SCHEME:"auth/invalid-emulator-scheme",INVALID_IDP_RESPONSE:"auth/invalid-credential",INVALID_LOGIN_CREDENTIALS:"auth/invalid-credential",INVALID_MESSAGE_PAYLOAD:"auth/invalid-message-payload",INVALID_MFA_SESSION:"auth/invalid-multi-factor-session",INVALID_OAUTH_CLIENT_ID:"auth/invalid-oauth-client-id",INVALID_OAUTH_PROVIDER:"auth/invalid-oauth-provider",INVALID_OOB_CODE:"auth/invalid-action-code",INVALID_ORIGIN:"auth/unauthorized-domain",INVALID_PASSWORD:"auth/wrong-password",INVALID_PERSISTENCE:"auth/invalid-persistence-type",INVALID_PHONE_NUMBER:"auth/invalid-phone-number",INVALID_PROVIDER_ID:"auth/invalid-provider-id",INVALID_RECIPIENT_EMAIL:"auth/invalid-recipient-email",INVALID_SENDER:"auth/invalid-sender",INVALID_SESSION_INFO:"auth/invalid-verification-id",INVALID_TENANT_ID:"auth/invalid-tenant-id",MFA_INFO_NOT_FOUND:"auth/multi-factor-info-not-found",MFA_REQUIRED:"auth/multi-factor-auth-required",MISSING_ANDROID_PACKAGE_NAME:"auth/missing-android-pkg-name",MISSING_APP_CREDENTIAL:"auth/missing-app-credential",MISSING_AUTH_DOMAIN:"auth/auth-domain-config-required",MISSING_CODE:"auth/missing-verification-code",MISSING_CONTINUE_URI:"auth/missing-continue-uri",MISSING_IFRAME_START:"auth/missing-iframe-start",MISSING_IOS_BUNDLE_ID:"auth/missing-ios-bundle-id",MISSING_OR_INVALID_NONCE:"auth/missing-or-invalid-nonce",MISSING_MFA_INFO:"auth/missing-multi-factor-info",MISSING_MFA_SESSION:"auth/missing-multi-factor-session",MISSING_PHONE_NUMBER:"auth/missing-phone-number",MISSING_SESSION_INFO:"auth/missing-verification-id",MODULE_DESTROYED:"auth/app-deleted",NEED_CONFIRMATION:"auth/account-exists-with-different-credential",NETWORK_REQUEST_FAILED:"auth/network-request-failed",NULL_USER:"auth/null-user",NO_AUTH_EVENT:"auth/no-auth-event",NO_SUCH_PROVIDER:"auth/no-such-provider",OPERATION_NOT_ALLOWED:"auth/operation-not-allowed",OPERATION_NOT_SUPPORTED:"auth/operation-not-supported-in-this-environment",POPUP_BLOCKED:"auth/popup-blocked",POPUP_CLOSED_BY_USER:"auth/popup-closed-by-user",PROVIDER_ALREADY_LINKED:"auth/provider-already-linked",QUOTA_EXCEEDED:"auth/quota-exceeded",REDIRECT_CANCELLED_BY_USER:"auth/redirect-cancelled-by-user",REDIRECT_OPERATION_PENDING:"auth/redirect-operation-pending",REJECTED_CREDENTIAL:"auth/rejected-credential",SECOND_FACTOR_ALREADY_ENROLLED:"auth/second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"auth/maximum-second-factor-count-exceeded",TENANT_ID_MISMATCH:"auth/tenant-id-mismatch",TIMEOUT:"auth/timeout",TOKEN_EXPIRED:"auth/user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"auth/too-many-requests",UNAUTHORIZED_DOMAIN:"auth/unauthorized-continue-uri",UNSUPPORTED_FIRST_FACTOR:"auth/unsupported-first-factor",UNSUPPORTED_PERSISTENCE:"auth/unsupported-persistence-type",UNSUPPORTED_TENANT_OPERATION:"auth/unsupported-tenant-operation",UNVERIFIED_EMAIL:"auth/unverified-email",USER_CANCELLED:"auth/user-cancelled",USER_DELETED:"auth/user-not-found",USER_DISABLED:"auth/user-disabled",USER_MISMATCH:"auth/user-mismatch",USER_SIGNED_OUT:"auth/user-signed-out",WEAK_PASSWORD:"auth/weak-password",WEB_STORAGE_UNSUPPORTED:"auth/web-storage-unsupported",ALREADY_INITIALIZED:"auth/already-initialized",RECAPTCHA_NOT_ENABLED:"auth/recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"auth/missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"auth/invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"auth/invalid-recaptcha-action",MISSING_CLIENT_TYPE:"auth/missing-client-type",MISSING_RECAPTCHA_VERSION:"auth/missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"auth/invalid-recaptcha-version",INVALID_REQ_TYPE:"auth/invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const su=new of("@firebase/auth");function AC(n,...e){su.logLevel<=qe.WARN&&su.warn(`Auth (${Ro}): ${n}`,...e)}function Rc(n,...e){su.logLevel<=qe.ERROR&&su.error(`Auth (${Ro}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vn(n,...e){throw cp(n,...e)}function Tn(n,...e){return cp(n,...e)}function lp(n,e,t){const r=Object.assign(Object.assign({},TC()),{[e]:t});return new hl("auth","Firebase",r).create(e,{appName:n.name})}function Yt(n){return lp(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Bo(n,e,t){const r=t;if(!(e instanceof r))throw r.name!==e.constructor.name&&Vn(n,"argument-error"),lp(n,"argument-error",`Type of ${e.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`)}function cp(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Vw.create(n,...e)}function re(n,e,...t){if(!n)throw cp(e,...t)}function lr(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Rc(e),new Error(e)}function Lr(n,e){n||lr(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sl(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function up(){return c_()==="http:"||c_()==="https:"}function c_(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function PC(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(up()||bA()||"connection"in navigator)?navigator.onLine:!0}function SC(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xl{constructor(e,t){this.shortDelay=e,this.longDelay=t,Lr(t>e,"Short delay should be less than long delay!"),this.isMobile=yA()||IA()}get(){return PC()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function dp(n,e){Lr(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nw{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;lr("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;lr("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;lr("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xC={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const RC=new xl(3e4,6e4);function gt(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function _t(n,e,t,r,s={}){return Ow(n,s,async()=>{let i={},o={};r&&(e==="GET"?o=r:i={body:JSON.stringify(r)});const a=xo(Object.assign({key:n.config.apiKey},o)).slice(1),c=await n._getAdditionalHeaders();c["Content-Type"]="application/json",n.languageCode&&(c["X-Firebase-Locale"]=n.languageCode);const u=Object.assign({method:e,headers:c},i);return wA()||(u.referrerPolicy="no-referrer"),Nw.fetch()(Mw(n,n.config.apiHost,t,a),u)})}async function Ow(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},xC),e);try{const s=new kC(n),i=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw wa(n,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const a=i.ok?o.errorMessage:o.error.message,[c,u]=a.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw wa(n,"credential-already-in-use",o);if(c==="EMAIL_EXISTS")throw wa(n,"email-already-in-use",o);if(c==="USER_DISABLED")throw wa(n,"user-disabled",o);const d=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(u)throw lp(n,d,u);Vn(n,d)}}catch(s){if(s instanceof jr)throw s;Vn(n,"network-request-failed",{message:String(s)})}}async function Kr(n,e,t,r,s={}){const i=await _t(n,e,t,r,s);return"mfaPendingCredential"in i&&Vn(n,"multi-factor-auth-required",{_serverResponse:i}),i}function Mw(n,e,t,r){const s=`${e}${t}?${r}`;return n.config.emulator?dp(n.config,s):`${n.config.apiScheme}://${s}`}function CC(n){switch(n){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}class kC{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(Tn(this.auth,"network-request-failed")),RC.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function wa(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=Tn(n,e,r);return s.customData._tokenResponse=t,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function u_(n){return n!==void 0&&n.getResponse!==void 0}function d_(n){return n!==void 0&&n.enterprise!==void 0}class Lw{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(const t of this.recaptchaEnforcementState)if(t.provider&&t.provider===e)return CC(t.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function DC(n){return(await _t(n,"GET","/v1/recaptchaParams")).recaptchaSiteKey||""}async function Fw(n,e){return _t(n,"GET","/v2/recaptchaConfig",gt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function VC(n,e){return _t(n,"POST","/v1/accounts:delete",e)}async function NC(n,e){return _t(n,"POST","/v1/accounts:update",e)}async function Uw(n,e){return _t(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Oa(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oF(n,e=!1){return we(n).getIdToken(e)}async function OC(n,e=!1){const t=we(n),r=await t.getIdToken(e),s=Yu(r);re(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Oa(Bd(s.auth_time)),issuedAtTime:Oa(Bd(s.iat)),expirationTime:Oa(Bd(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Bd(n){return Number(n)*1e3}function Yu(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Rc("JWT malformed, contained fewer than 3 sections"),null;try{const s=Yy(t);return s?JSON.parse(s):(Rc("Failed to decode base64 JWT payload"),null)}catch(s){return Rc("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function h_(n){const e=Yu(n);return re(e,"internal-error"),re(typeof e.exp<"u","internal-error"),re(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Fr(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof jr&&MC(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function MC({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class LC{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nh{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Oa(this.lastLoginAt),this.creationTime=Oa(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function il(n){var e;const t=n.auth,r=await n.getIdToken(),s=await Fr(n,Uw(t,{idToken:r}));re(s==null?void 0:s.users.length,t,"internal-error");const i=s.users[0];n._notifyReloadListener(i);const o=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?Bw(i.providerUserInfo):[],a=UC(n.providerData,o),c=n.isAnonymous,u=!(n.email&&i.passwordHash)&&!(a!=null&&a.length),d=c?u:!1,f={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:a,metadata:new Nh(i.createdAt,i.lastLoginAt),isAnonymous:d};Object.assign(n,f)}async function FC(n){const e=we(n);await il(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function UC(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Bw(n){return n.map(e=>{var{providerId:t}=e,r=ap(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function BC(n,e){const t=await Ow(n,{},async()=>{const r=xo({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=n.config,o=Mw(n,s,"/v1/token",`key=${i}`),a=await n._getAdditionalHeaders();return a["Content-Type"]="application/x-www-form-urlencoded",Nw.fetch()(o,{method:"POST",headers:a,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function jC(n,e){return _t(n,"POST","/v2/accounts:revokeToken",gt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class no{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){re(e.idToken,"internal-error"),re(typeof e.idToken<"u","internal-error"),re(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):h_(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){re(e.length!==0,"internal-error");const t=h_(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(re(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:i}=await BC(e,t);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:i}=t,o=new no;return r&&(re(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),s&&(re(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(re(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new no,this.toJSON())}_performRefresh(){return lr("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ns(n,e){re(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class xr{constructor(e){var{uid:t,auth:r,stsTokenManager:s}=e,i=ap(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new LC(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Nh(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const t=await Fr(this,this.stsTokenManager.getToken(this.auth,e));return re(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return OC(this,e)}reload(){return FC(this)}_assign(e){this!==e&&(re(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new xr(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){re(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await il(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Ot(this.auth.app))return Promise.reject(Yt(this.auth));const e=await this.getIdToken();return await Fr(this,VC(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,s,i,o,a,c,u,d;const f=(r=t.displayName)!==null&&r!==void 0?r:void 0,g=(s=t.email)!==null&&s!==void 0?s:void 0,_=(i=t.phoneNumber)!==null&&i!==void 0?i:void 0,k=(o=t.photoURL)!==null&&o!==void 0?o:void 0,T=(a=t.tenantId)!==null&&a!==void 0?a:void 0,C=(c=t._redirectEventId)!==null&&c!==void 0?c:void 0,F=(u=t.createdAt)!==null&&u!==void 0?u:void 0,j=(d=t.lastLoginAt)!==null&&d!==void 0?d:void 0,{uid:L,emailVerified:M,isAnonymous:q,providerData:te,stsTokenManager:x}=t;re(L&&x,e,"internal-error");const E=no.fromJSON(this.name,x);re(typeof L=="string",e,"internal-error"),ns(f,e.name),ns(g,e.name),re(typeof M=="boolean",e,"internal-error"),re(typeof q=="boolean",e,"internal-error"),ns(_,e.name),ns(k,e.name),ns(T,e.name),ns(C,e.name),ns(F,e.name),ns(j,e.name);const S=new xr({uid:L,auth:e,email:g,emailVerified:M,displayName:f,isAnonymous:q,photoURL:k,phoneNumber:_,tenantId:T,stsTokenManager:E,createdAt:F,lastLoginAt:j});return te&&Array.isArray(te)&&(S.providerData=te.map(R=>Object.assign({},R))),C&&(S._redirectEventId=C),S}static async _fromIdTokenResponse(e,t,r=!1){const s=new no;s.updateFromServerResponse(t);const i=new xr({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await il(i),i}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];re(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Bw(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),a=new no;a.updateFromIdToken(r);const c=new xr({uid:s.localId,auth:e,stsTokenManager:a,isAnonymous:o}),u={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Nh(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(c,u),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const f_=new Map;function Rr(n){Lr(n instanceof Function,"Expected a class definition");let e=f_.get(n);return e?(Lr(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,f_.set(n,e),e)}/**
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
 */class jw{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}jw.type="NONE";const p_=jw;/**
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
 */function Cc(n,e,t){return`firebase:${n}:${e}:${t}`}class ro{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Cc(this.userKey,s.apiKey,i),this.fullPersistenceKey=Cc("persistence",s.apiKey,i),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?xr._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new ro(Rr(p_),e,r);const s=(await Promise.all(t.map(async u=>{if(await u._isAvailable())return u}))).filter(u=>u);let i=s[0]||Rr(p_);const o=Cc(r,e.config.apiKey,e.name);let a=null;for(const u of t)try{const d=await u._get(o);if(d){const f=xr._fromJSON(e,d);u!==i&&(a=f),i=u;break}}catch{}const c=s.filter(u=>u._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new ro(i,e,r):(i=c[0],a&&await i._set(o,a.toJSON()),await Promise.all(t.map(async u=>{if(u!==i)try{await u._remove(o)}catch{}})),new ro(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function m_(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Gw(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if($w(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Hw(e))return"Blackberry";if(Ww(e))return"Webos";if(qw(e))return"Safari";if((e.includes("chrome/")||zw(e))&&!e.includes("edge/"))return"Chrome";if(Kw(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function $w(n=zt()){return/firefox\//i.test(n)}function qw(n=zt()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function zw(n=zt()){return/crios\//i.test(n)}function Gw(n=zt()){return/iemobile/i.test(n)}function Kw(n=zt()){return/android/i.test(n)}function Hw(n=zt()){return/blackberry/i.test(n)}function Ww(n=zt()){return/webos/i.test(n)}function hp(n=zt()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function $C(n=zt()){var e;return hp(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function qC(){return EA()&&document.documentMode===10}function Qw(n=zt()){return hp(n)||Kw(n)||Ww(n)||Hw(n)||/windows phone/i.test(n)||Gw(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jw(n,e=[]){let t;switch(n){case"Browser":t=m_(zt());break;case"Worker":t=`${m_(zt())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Ro}/${r}`}/**
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
 */class zC{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=i=>new Promise((o,a)=>{try{const c=e(i);o(c)}catch(c){a(c)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function GC(n,e={}){return _t(n,"GET","/v2/passwordPolicy",gt(n,e))}/**
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
 */const KC=6;class HC{constructor(e){var t,r,s,i;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=o.minPasswordLength)!==null&&t!==void 0?t:KC,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,s,i,o,a;const c={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,c),this.validatePasswordCharacterOptions(e,c),c.isValid&&(c.isValid=(t=c.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),c.isValid&&(c.isValid=(r=c.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),c.isValid&&(c.isValid=(s=c.containsLowercaseLetter)!==null&&s!==void 0?s:!0),c.isValid&&(c.isValid=(i=c.containsUppercaseLetter)!==null&&i!==void 0?i:!0),c.isValid&&(c.isValid=(o=c.containsNumericCharacter)!==null&&o!==void 0?o:!0),c.isValid&&(c.isValid=(a=c.containsNonAlphanumericCharacter)!==null&&a!==void 0?a:!0),c}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WC{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new g_(this),this.idTokenSubscription=new g_(this),this.beforeStateQueue=new zC(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Vw,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Rr(t)),this._initializationPromise=this.queue(async()=>{var r,s;if(!this._deleted&&(this.persistenceManager=await ro.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Uw(this,{idToken:e}),r=await xr._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(Ot(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(a=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(a,a))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,a=s==null?void 0:s._redirectEventId,c=await this.tryRedirectSignIn(e);(!o||o===a)&&(c!=null&&c.user)&&(s=c.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(o){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return re(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await il(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=SC()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Ot(this.app))return Promise.reject(Yt(this));const t=e?we(e):null;return t&&re(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&re(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Ot(this.app)?Promise.reject(Yt(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Ot(this.app)?Promise.reject(Yt(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Rr(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await GC(this),t=new HC(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new hl("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await jC(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Rr(e)||this._popupRedirectResolver;re(t,this,"argument-error"),this.redirectPersistenceManager=await ro.create(this,[Rr(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const i=typeof t=="function"?t:t.next.bind(t);let o=!1;const a=this._isInitialized?Promise.resolve():this._initializationPromise;if(re(a,this,"internal-error"),a.then(()=>{o||i(this.currentUser)}),typeof t=="function"){const c=e.addObserver(t,r,s);return()=>{o=!0,c()}}else{const c=e.addObserver(t);return()=>{o=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return re(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Jw(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(t["X-Firebase-AppCheck"]=s),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&AC(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function kt(n){return we(n)}class g_{constructor(e){this.auth=e,this.observer=null,this.addObserver=RA(t=>this.observer=t)}get next(){return re(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Rl={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function QC(n){Rl=n}function fp(n){return Rl.loadJS(n)}function JC(){return Rl.recaptchaV2Script}function YC(){return Rl.recaptchaEnterpriseScript}function XC(){return Rl.gapiScript}function Yw(n){return`__${n}${Math.floor(Math.random()*1e6)}`}const ZC="recaptcha-enterprise",e1="NO_RECAPTCHA";class Xw{constructor(e){this.type=ZC,this.auth=kt(e)}async verify(e="verify",t=!1){async function r(i){if(!t){if(i.tenantId==null&&i._agentRecaptchaConfig!=null)return i._agentRecaptchaConfig.siteKey;if(i.tenantId!=null&&i._tenantRecaptchaConfigs[i.tenantId]!==void 0)return i._tenantRecaptchaConfigs[i.tenantId].siteKey}return new Promise(async(o,a)=>{Fw(i,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(c=>{if(c.recaptchaKey===void 0)a(new Error("recaptcha Enterprise site key undefined"));else{const u=new Lw(c);return i.tenantId==null?i._agentRecaptchaConfig=u:i._tenantRecaptchaConfigs[i.tenantId]=u,o(u.siteKey)}}).catch(c=>{a(c)})})}function s(i,o,a){const c=window.grecaptcha;d_(c)?c.enterprise.ready(()=>{c.enterprise.execute(i,{action:e}).then(u=>{o(u)}).catch(()=>{o(e1)})}):a(Error("No reCAPTCHA enterprise script loaded."))}return new Promise((i,o)=>{r(this.auth).then(a=>{if(!t&&d_(window.grecaptcha))s(a,i,o);else{if(typeof window>"u"){o(new Error("RecaptchaVerifier is only supported in browser"));return}let c=YC();c.length!==0&&(c+=a),fp(c).then(()=>{s(a,i,o)}).catch(u=>{o(u)})}}).catch(a=>{o(a)})})}}async function __(n,e,t,r=!1){const s=new Xw(n);let i;try{i=await s.verify(t)}catch{i=await s.verify(t,!0)}const o=Object.assign({},e);return r?Object.assign(o,{captchaResp:i}):Object.assign(o,{captchaResponse:i}),Object.assign(o,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(o,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),o}async function ol(n,e,t,r){var s;if(!((s=n._getRecaptchaConfig())===null||s===void 0)&&s.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){const i=await __(n,e,t,t==="getOobCode");return r(n,i)}else return r(n,e).catch(async i=>{if(i.code==="auth/missing-recaptcha-token"){console.log(`${t} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);const o=await __(n,e,t,t==="getOobCode");return r(n,o)}else return Promise.reject(i)})}async function t1(n){const e=kt(n),t=await Fw(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),r=new Lw(t);e.tenantId==null?e._agentRecaptchaConfig=r:e._tenantRecaptchaConfigs[e.tenantId]=r,r.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")&&new Xw(e).verify()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function n1(n,e){const t=fl(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),i=t.getOptions();if(bs(i,e??{}))return s;Vn(s,"already-initialized")}return t.initialize({options:e})}function r1(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(Rr);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function s1(n,e,t){const r=kt(n);re(r._canInitEmulator,r,"emulator-config-failed"),re(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!!(t!=null&&t.disableWarnings),i=Zw(e),{host:o,port:a}=i1(e),c=a===null?"":`:${a}`;r.config.emulator={url:`${i}//${o}${c}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:o,port:a,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})}),s||o1()}function Zw(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function i1(n){const e=Zw(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:y_(r.substr(i.length+1))}}else{const[i,o]=r.split(":");return{host:i,port:y_(o)}}}function y_(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function o1(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cl{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return lr("not implemented")}_getIdTokenResponse(e){return lr("not implemented")}_linkToIdToken(e,t){return lr("not implemented")}_getReauthenticationResolver(e){return lr("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function eb(n,e){return _t(n,"POST","/v1/accounts:resetPassword",gt(n,e))}async function a1(n,e){return _t(n,"POST","/v1/accounts:update",e)}async function l1(n,e){return _t(n,"POST","/v1/accounts:signUp",e)}async function c1(n,e){return _t(n,"POST","/v1/accounts:update",gt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function u1(n,e){return Kr(n,"POST","/v1/accounts:signInWithPassword",gt(n,e))}async function Xu(n,e){return _t(n,"POST","/v1/accounts:sendOobCode",gt(n,e))}async function d1(n,e){return Xu(n,e)}async function h1(n,e){return Xu(n,e)}async function f1(n,e){return Xu(n,e)}async function p1(n,e){return Xu(n,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function m1(n,e){return Kr(n,"POST","/v1/accounts:signInWithEmailLink",gt(n,e))}async function g1(n,e){return Kr(n,"POST","/v1/accounts:signInWithEmailLink",gt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class al extends Cl{constructor(e,t,r,s=null){super("password",r),this._email=e,this._password=t,this._tenantId=s}static _fromEmailAndPassword(e,t){return new al(e,t,"password")}static _fromEmailAndCode(e,t,r=null){return new al(e,t,"emailLink",r)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;if(t!=null&&t.email&&(t!=null&&t.password)){if(t.signInMethod==="password")return this._fromEmailAndPassword(t.email,t.password);if(t.signInMethod==="emailLink")return this._fromEmailAndCode(t.email,t.password,t.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":const t={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return ol(e,t,"signInWithPassword",u1);case"emailLink":return m1(e,{email:this._email,oobCode:this._password});default:Vn(e,"internal-error")}}async _linkToIdToken(e,t){switch(this.signInMethod){case"password":const r={idToken:t,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return ol(e,r,"signUpPassword",l1);case"emailLink":return g1(e,{idToken:t,email:this._email,oobCode:this._password});default:Vn(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function kr(n,e){return Kr(n,"POST","/v1/accounts:signInWithIdp",gt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _1="http://localhost";class Ur extends Cl{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new Ur(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Vn("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=t,i=ap(t,["providerId","signInMethod"]);if(!r||!s)return null;const o=new Ur(r,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const t=this.buildRequest();return kr(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,kr(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,kr(e,t)}buildRequest(){const e={requestUri:_1,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=xo(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function y1(n,e){return _t(n,"POST","/v1/accounts:sendVerificationCode",gt(n,e))}async function v1(n,e){return Kr(n,"POST","/v1/accounts:signInWithPhoneNumber",gt(n,e))}async function w1(n,e){const t=await Kr(n,"POST","/v1/accounts:signInWithPhoneNumber",gt(n,e));if(t.temporaryProof)throw wa(n,"account-exists-with-different-credential",t);return t}const b1={USER_NOT_FOUND:"user-not-found"};async function I1(n,e){const t=Object.assign(Object.assign({},e),{operation:"REAUTH"});return Kr(n,"POST","/v1/accounts:signInWithPhoneNumber",gt(n,t),b1)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ti extends Cl{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,t){return new ti({verificationId:e,verificationCode:t})}static _fromTokenResponse(e,t){return new ti({phoneNumber:e,temporaryProof:t})}_getIdTokenResponse(e){return v1(e,this._makeVerificationRequest())}_linkToIdToken(e,t){return w1(e,Object.assign({idToken:t},this._makeVerificationRequest()))}_getReauthenticationResolver(e){return I1(e,this._makeVerificationRequest())}_makeVerificationRequest(){const{temporaryProof:e,phoneNumber:t,verificationId:r,verificationCode:s}=this.params;return e&&t?{temporaryProof:e,phoneNumber:t}:{sessionInfo:r,code:s}}toJSON(){const e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));const{verificationId:t,verificationCode:r,phoneNumber:s,temporaryProof:i}=e;return!r&&!t&&!s&&!i?null:new ti({verificationId:t,verificationCode:r,phoneNumber:s,temporaryProof:i})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function E1(n){switch(n){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function T1(n){const e=pa(ma(n)).link,t=e?pa(ma(e)).deep_link_id:null,r=pa(ma(n)).deep_link_id;return(r?pa(ma(r)).link:null)||r||t||e||n}class kl{constructor(e){var t,r,s,i,o,a;const c=pa(ma(e)),u=(t=c.apiKey)!==null&&t!==void 0?t:null,d=(r=c.oobCode)!==null&&r!==void 0?r:null,f=E1((s=c.mode)!==null&&s!==void 0?s:null);re(u&&d&&f,"argument-error"),this.apiKey=u,this.operation=f,this.code=d,this.continueUrl=(i=c.continueUrl)!==null&&i!==void 0?i:null,this.languageCode=(o=c.languageCode)!==null&&o!==void 0?o:null,this.tenantId=(a=c.tenantId)!==null&&a!==void 0?a:null}static parseLink(e){const t=T1(e);try{return new kl(t)}catch{return null}}}function aF(n){return kl.parseLink(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vi{constructor(){this.providerId=vi.PROVIDER_ID}static credential(e,t){return al._fromEmailAndPassword(e,t)}static credentialWithLink(e,t){const r=kl.parseLink(t);return re(r,"argument-error"),al._fromEmailAndCode(e,r.code,r.tenantId)}}vi.PROVIDER_ID="password";vi.EMAIL_PASSWORD_SIGN_IN_METHOD="password";vi.EMAIL_LINK_SIGN_IN_METHOD="emailLink";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hr{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class jo extends Hr{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}class kc extends jo{static credentialFromJSON(e){const t=typeof e=="string"?JSON.parse(e):e;return re("providerId"in t&&"signInMethod"in t,"argument-error"),Ur._fromParams(t)}credential(e){return this._credential(Object.assign(Object.assign({},e),{nonce:e.rawNonce}))}_credential(e){return re(e.idToken||e.accessToken,"argument-error"),Ur._fromParams(Object.assign(Object.assign({},e),{providerId:this.providerId,signInMethod:this.providerId}))}static credentialFromResult(e){return kc.oauthCredentialFromTaggedObject(e)}static credentialFromError(e){return kc.oauthCredentialFromTaggedObject(e.customData||{})}static oauthCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r,oauthTokenSecret:s,pendingToken:i,nonce:o,providerId:a}=e;if(!r&&!s&&!t&&!i||!a)return null;try{return new kc(a)._credential({idToken:t,accessToken:r,nonce:o,pendingToken:i})}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class us extends jo{constructor(){super("facebook.com")}static credential(e){return Ur._fromParams({providerId:us.PROVIDER_ID,signInMethod:us.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return us.credentialFromTaggedObject(e)}static credentialFromError(e){return us.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return us.credential(e.oauthAccessToken)}catch{return null}}}us.FACEBOOK_SIGN_IN_METHOD="facebook.com";us.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ds extends jo{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return Ur._fromParams({providerId:ds.PROVIDER_ID,signInMethod:ds.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return ds.credentialFromTaggedObject(e)}static credentialFromError(e){return ds.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return ds.credential(t,r)}catch{return null}}}ds.GOOGLE_SIGN_IN_METHOD="google.com";ds.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hs extends jo{constructor(){super("github.com")}static credential(e){return Ur._fromParams({providerId:hs.PROVIDER_ID,signInMethod:hs.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return hs.credentialFromTaggedObject(e)}static credentialFromError(e){return hs.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return hs.credential(e.oauthAccessToken)}catch{return null}}}hs.GITHUB_SIGN_IN_METHOD="github.com";hs.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const A1="http://localhost";class ll extends Cl{constructor(e,t){super(e,e),this.pendingToken=t}_getIdTokenResponse(e){const t=this.buildRequest();return kr(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,kr(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,kr(e,t)}toJSON(){return{signInMethod:this.signInMethod,providerId:this.providerId,pendingToken:this.pendingToken}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s,pendingToken:i}=t;return!r||!s||!i||r!==s?null:new ll(r,i)}static _create(e,t){return new ll(e,t)}buildRequest(){return{requestUri:A1,returnSecureToken:!0,pendingToken:this.pendingToken}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const P1="saml.";class Oh extends Hr{constructor(e){re(e.startsWith(P1),"argument-error"),super(e)}static credentialFromResult(e){return Oh.samlCredentialFromTaggedObject(e)}static credentialFromError(e){return Oh.samlCredentialFromTaggedObject(e.customData||{})}static credentialFromJSON(e){const t=ll.fromJSON(e);return re(t,"argument-error"),t}static samlCredentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{pendingToken:t,providerId:r}=e;if(!t||!r)return null;try{return ll._create(r,t)}catch{return null}}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fs extends jo{constructor(){super("twitter.com")}static credential(e,t){return Ur._fromParams({providerId:fs.PROVIDER_ID,signInMethod:fs.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return fs.credentialFromTaggedObject(e)}static credentialFromError(e){return fs.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return fs.credential(t,r)}catch{return null}}}fs.TWITTER_SIGN_IN_METHOD="twitter.com";fs.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function tb(n,e){return Kr(n,"POST","/v1/accounts:signUp",gt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const i=await xr._fromIdTokenResponse(e,r,s),o=v_(r);return new zn({user:i,providerId:o,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=v_(r);return new zn({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function v_(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function S1(n){var e;if(Ot(n.app))return Promise.reject(Yt(n));const t=kt(n);if(await t._initializationPromise,!((e=t.currentUser)===null||e===void 0)&&e.isAnonymous)return new zn({user:t.currentUser,providerId:null,operationType:"signIn"});const r=await tb(t,{returnSecureToken:!0}),s=await zn._fromIdTokenResponse(t,"signIn",r,!0);return await t._updateCurrentUser(s.user),s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iu extends jr{constructor(e,t,r,s){var i;super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,iu.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new iu(e,t,r,s)}}function nb(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?iu._fromErrorAndOperation(n,i,e,r):i})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rb(n){return new Set(n.map(({providerId:e})=>e).filter(e=>!!e))}/**
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
 */async function lF(n,e){const t=we(n);await Zu(!0,t,e);const{providerUserInfo:r}=await NC(t.auth,{idToken:await t.getIdToken(),deleteProvider:[e]}),s=rb(r||[]);return t.providerData=t.providerData.filter(i=>s.has(i.providerId)),s.has("phone")||(t.phoneNumber=null),await t.auth._persistUserIfCurrent(t),t}async function pp(n,e,t=!1){const r=await Fr(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return zn._forOperation(n,"link",r)}async function Zu(n,e,t){await il(e);const r=rb(e.providerData),s=n===!1?"provider-already-linked":"no-such-provider";re(r.has(t)===n,e.auth,s)}/**
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
 */async function sb(n,e,t=!1){const{auth:r}=n;if(Ot(r.app))return Promise.reject(Yt(r));const s="reauthenticate";try{const i=await Fr(n,nb(r,s,e,n),t);re(i.idToken,r,"internal-error");const o=Yu(i.idToken);re(o,r,"internal-error");const{sub:a}=o;return re(n.uid===a,r,"user-mismatch"),zn._forOperation(n,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Vn(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ib(n,e,t=!1){if(Ot(n.app))return Promise.reject(Yt(n));const r="signIn",s=await nb(n,r,e),i=await zn._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(i.user),i}async function mp(n,e){return ib(kt(n),e)}async function x1(n,e){const t=we(n);return await Zu(!1,t,e.providerId),pp(t,e)}async function R1(n,e){return sb(we(n),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function C1(n,e){return Kr(n,"POST","/v1/accounts:signInWithCustomToken",gt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function cF(n,e){if(Ot(n.app))return Promise.reject(Yt(n));const t=kt(n),r=await C1(t,{token:e,returnSecureToken:!0}),s=await zn._fromIdTokenResponse(t,"signIn",r);return await t._updateCurrentUser(s.user),s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dl{constructor(e,t){this.factorId=e,this.uid=t.mfaEnrollmentId,this.enrollmentTime=new Date(t.enrolledAt).toUTCString(),this.displayName=t.displayName}static _fromServerResponse(e,t){return"phoneInfo"in t?gp._fromServerResponse(e,t):"totpInfo"in t?_p._fromServerResponse(e,t):Vn(e,"internal-error")}}class gp extends Dl{constructor(e){super("phone",e),this.phoneNumber=e.phoneInfo}static _fromServerResponse(e,t){return new gp(t)}}class _p extends Dl{constructor(e){super("totp",e)}static _fromServerResponse(e,t){return new _p(t)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ed(n,e,t){var r;re(((r=t.url)===null||r===void 0?void 0:r.length)>0,n,"invalid-continue-uri"),re(typeof t.dynamicLinkDomain>"u"||t.dynamicLinkDomain.length>0,n,"invalid-dynamic-link-domain"),e.continueUrl=t.url,e.dynamicLinkDomain=t.dynamicLinkDomain,e.canHandleCodeInApp=t.handleCodeInApp,t.iOS&&(re(t.iOS.bundleId.length>0,n,"missing-ios-bundle-id"),e.iOSBundleId=t.iOS.bundleId),t.android&&(re(t.android.packageName.length>0,n,"missing-android-pkg-name"),e.androidInstallApp=t.android.installApp,e.androidMinimumVersionCode=t.android.minimumVersion,e.androidPackageName=t.android.packageName)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yp(n){const e=kt(n);e._getPasswordPolicyInternal()&&await e._updatePasswordPolicy()}async function k1(n,e,t){const r=kt(n),s={requestType:"PASSWORD_RESET",email:e,clientType:"CLIENT_TYPE_WEB"};t&&ed(r,s,t),await ol(r,s,"getOobCode",h1)}async function D1(n,e,t){await eb(we(n),{oobCode:e,newPassword:t}).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&yp(n),r})}async function uF(n,e){await c1(we(n),{oobCode:e})}async function V1(n,e){const t=we(n),r=await eb(t,{oobCode:e}),s=r.requestType;switch(re(s,t,"internal-error"),s){case"EMAIL_SIGNIN":break;case"VERIFY_AND_CHANGE_EMAIL":re(r.newEmail,t,"internal-error");break;case"REVERT_SECOND_FACTOR_ADDITION":re(r.mfaInfo,t,"internal-error");default:re(r.email,t,"internal-error")}let i=null;return r.mfaInfo&&(i=Dl._fromServerResponse(kt(t),r.mfaInfo)),{data:{email:(r.requestType==="VERIFY_AND_CHANGE_EMAIL"?r.newEmail:r.email)||null,previousEmail:(r.requestType==="VERIFY_AND_CHANGE_EMAIL"?r.email:r.newEmail)||null,multiFactorInfo:i},operation:s}}async function dF(n,e){const{data:t}=await V1(we(n),e);return t.email}async function N1(n,e,t){if(Ot(n.app))return Promise.reject(Yt(n));const r=kt(n),o=await ol(r,{returnSecureToken:!0,email:e,password:t,clientType:"CLIENT_TYPE_WEB"},"signUpPassword",tb).catch(c=>{throw c.code==="auth/password-does-not-meet-requirements"&&yp(n),c}),a=await zn._fromIdTokenResponse(r,"signIn",o);return await r._updateCurrentUser(a.user),a}function O1(n,e,t){return Ot(n.app)?Promise.reject(Yt(n)):mp(we(n),vi.credential(e,t)).catch(async r=>{throw r.code==="auth/password-does-not-meet-requirements"&&yp(n),r})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hF(n,e,t){const r=kt(n),s={requestType:"EMAIL_SIGNIN",email:e,clientType:"CLIENT_TYPE_WEB"};function i(o,a){re(a.handleCodeInApp,r,"argument-error"),a&&ed(r,o,a)}i(s,t),await ol(r,s,"getOobCode",f1)}function fF(n,e){const t=kl.parseLink(e);return(t==null?void 0:t.operation)==="EMAIL_SIGNIN"}async function pF(n,e,t){if(Ot(n.app))return Promise.reject(Yt(n));const r=we(n),s=vi.credentialWithLink(e,t||sl());return re(s._tenantId===(r.tenantId||null),r,"tenant-id-mismatch"),mp(r,s)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function M1(n,e){return _t(n,"POST","/v1/accounts:createAuthUri",gt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function mF(n,e){const t=up()?sl():"http://localhost",r={identifier:e,continueUri:t},{signinMethods:s}=await M1(we(n),r);return s||[]}async function gF(n,e){const t=we(n),s={requestType:"VERIFY_EMAIL",idToken:await n.getIdToken()};e&&ed(t.auth,s,e);const{email:i}=await d1(t.auth,s);i!==n.email&&await n.reload()}async function _F(n,e,t){const r=we(n),i={requestType:"VERIFY_AND_CHANGE_EMAIL",idToken:await n.getIdToken(),newEmail:e};t&&ed(r.auth,i,t);const{email:o}=await p1(r.auth,i);o!==n.email&&await n.reload()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function L1(n,e){return _t(n,"POST","/v1/accounts:update",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yF(n,{displayName:e,photoURL:t}){if(e===void 0&&t===void 0)return;const r=we(n),i={idToken:await r.getIdToken(),displayName:e,photoUrl:t,returnSecureToken:!0},o=await Fr(r,L1(r.auth,i));r.displayName=o.displayName||null,r.photoURL=o.photoUrl||null;const a=r.providerData.find(({providerId:c})=>c==="password");a&&(a.displayName=r.displayName,a.photoURL=r.photoURL),await r._updateTokensIfNecessary(o)}function vF(n,e){const t=we(n);return Ot(t.auth.app)?Promise.reject(Yt(t.auth)):ob(t,e,null)}function F1(n,e){return ob(we(n),null,e)}async function ob(n,e,t){const{auth:r}=n,i={idToken:await n.getIdToken(),returnSecureToken:!0};e&&(i.email=e),t&&(i.password=t);const o=await Fr(n,a1(r,i));await n._updateTokensIfNecessary(o,!0)}/**
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
 */function U1(n){var e,t;if(!n)return null;const{providerId:r}=n,s=n.rawUserInfo?JSON.parse(n.rawUserInfo):{},i=n.isNewUser||n.kind==="identitytoolkit#SignupNewUserResponse";if(!r&&(n!=null&&n.idToken)){const o=(t=(e=Yu(n.idToken))===null||e===void 0?void 0:e.firebase)===null||t===void 0?void 0:t.sign_in_provider;if(o){const a=o!=="anonymous"&&o!=="custom"?o:null;return new so(i,a)}}if(!r)return null;switch(r){case"facebook.com":return new B1(i,s);case"github.com":return new j1(i,s);case"google.com":return new $1(i,s);case"twitter.com":return new q1(i,s,n.screenName||null);case"custom":case"anonymous":return new so(i,null);default:return new so(i,r,s)}}class so{constructor(e,t,r={}){this.isNewUser=e,this.providerId=t,this.profile=r}}class ab extends so{constructor(e,t,r,s){super(e,t,r),this.username=s}}class B1 extends so{constructor(e,t){super(e,"facebook.com",t)}}class j1 extends ab{constructor(e,t){super(e,"github.com",t,typeof(t==null?void 0:t.login)=="string"?t==null?void 0:t.login:null)}}class $1 extends so{constructor(e,t){super(e,"google.com",t)}}class q1 extends ab{constructor(e,t,r){super(e,"twitter.com",t,r)}}function wF(n){const{user:e,_tokenResponse:t}=n;return e.isAnonymous&&!t?{providerId:null,isNewUser:!1,profile:null}:U1(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bF(n,e){return we(n).setPersistence(e)}function IF(n){return t1(n)}async function EF(n,e){return kt(n).validatePassword(e)}function z1(n,e,t,r){return we(n).onIdTokenChanged(e,t,r)}function G1(n,e,t){return we(n).beforeAuthStateChanged(e,t)}function TF(n,e,t,r){return we(n).onAuthStateChanged(e,t,r)}function AF(n){we(n).useDeviceLanguage()}function PF(n,e){return we(n).updateCurrentUser(e)}function SF(n){return we(n).signOut()}function xF(n,e){return kt(n).revokeAccessToken(e)}async function RF(n){return we(n).delete()}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ys{constructor(e,t,r){this.type=e,this.credential=t,this.user=r}static _fromIdtoken(e,t){return new Ys("enroll",e,t)}static _fromMfaPendingCredential(e){return new Ys("signin",e)}toJSON(){return{multiFactorSession:{[this.type==="enroll"?"idToken":"pendingCredential"]:this.credential}}}static fromJSON(e){var t,r;if(e!=null&&e.multiFactorSession){if(!((t=e.multiFactorSession)===null||t===void 0)&&t.pendingCredential)return Ys._fromMfaPendingCredential(e.multiFactorSession.pendingCredential);if(!((r=e.multiFactorSession)===null||r===void 0)&&r.idToken)return Ys._fromIdtoken(e.multiFactorSession.idToken)}return null}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vp{constructor(e,t,r){this.session=e,this.hints=t,this.signInResolver=r}static _fromError(e,t){const r=kt(e),s=t.customData._serverResponse,i=(s.mfaInfo||[]).map(a=>Dl._fromServerResponse(r,a));re(s.mfaPendingCredential,r,"internal-error");const o=Ys._fromMfaPendingCredential(s.mfaPendingCredential);return new vp(o,i,async a=>{const c=await a._process(r,o);delete s.mfaInfo,delete s.mfaPendingCredential;const u=Object.assign(Object.assign({},s),{idToken:c.idToken,refreshToken:c.refreshToken});switch(t.operationType){case"signIn":const d=await zn._fromIdTokenResponse(r,t.operationType,u);return await r._updateCurrentUser(d.user),d;case"reauthenticate":return re(t.user,r,"internal-error"),zn._forOperation(t.user,t.operationType,u);default:Vn(r,"internal-error")}})}async resolveSignIn(e){const t=e;return this.signInResolver(t)}}function CF(n,e){var t;const r=we(n),s=e;return re(e.customData.operationType,r,"argument-error"),re((t=s.customData._serverResponse)===null||t===void 0?void 0:t.mfaPendingCredential,r,"argument-error"),vp._fromError(r,s)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function K1(n,e){return _t(n,"POST","/v2/accounts/mfaEnrollment:start",gt(n,e))}function H1(n,e){return _t(n,"POST","/v2/accounts/mfaEnrollment:finalize",gt(n,e))}function W1(n,e){return _t(n,"POST","/v2/accounts/mfaEnrollment:start",gt(n,e))}function Q1(n,e){return _t(n,"POST","/v2/accounts/mfaEnrollment:finalize",gt(n,e))}function J1(n,e){return _t(n,"POST","/v2/accounts/mfaEnrollment:withdraw",gt(n,e))}class wp{constructor(e){this.user=e,this.enrolledFactors=[],e._onReload(t=>{t.mfaInfo&&(this.enrolledFactors=t.mfaInfo.map(r=>Dl._fromServerResponse(e.auth,r)))})}static _fromUser(e){return new wp(e)}async getSession(){return Ys._fromIdtoken(await this.user.getIdToken(),this.user)}async enroll(e,t){const r=e,s=await this.getSession(),i=await Fr(this.user,r._process(this.user.auth,s,t));return await this.user._updateTokensIfNecessary(i),this.user.reload()}async unenroll(e){const t=typeof e=="string"?e:e.uid,r=await this.user.getIdToken();try{const s=await Fr(this.user,J1(this.user.auth,{idToken:r,mfaEnrollmentId:t}));this.enrolledFactors=this.enrolledFactors.filter(({uid:i})=>i!==t),await this.user._updateTokensIfNecessary(s),await this.user.reload()}catch(s){throw s}}}const jd=new WeakMap;function kF(n){const e=we(n);return jd.has(e)||jd.set(e,wp._fromUser(e)),jd.get(e)}const ou="__sak";/**
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
 */class lb{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(ou,"1"),this.storage.removeItem(ou),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Y1=1e3,X1=10;class cb extends lb{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Qw(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((o,a,c)=>{this.notifyListeners(o,c)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(r);!t&&this.localCache[r]===o||this.notifyListeners(r,o)},i=this.storage.getItem(r);qC()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,X1):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},Y1)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}cb.type="LOCAL";const Z1=cb;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ub extends lb{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}ub.type="SESSION";const db=ub;/**
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
 */function ek(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class td{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new td(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:i}=t.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const a=Array.from(o).map(async u=>u(t.origin,i)),c=await ek(a);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:c})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}td.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nd(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
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
 */class tk{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((a,c)=>{const u=nd("",20);s.port1.start();const d=setTimeout(()=>{c(new Error("unsupported_event"))},r);o={messageChannel:s,onMessage(f){const g=f;if(g.data.eventId===u)switch(g.data.status){case"ack":clearTimeout(d),i=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),a(g.data.response);break;default:clearTimeout(d),clearTimeout(i),c(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:u,data:t},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ut(){return window}function nk(n){Ut().location.href=n}/**
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
 */function bp(){return typeof Ut().WorkerGlobalScope<"u"&&typeof Ut().importScripts=="function"}async function rk(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function sk(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function ik(){return bp()?self:null}/**
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
 */const hb="firebaseLocalStorageDb",ok=1,au="firebaseLocalStorage",fb="fbase_key";class Vl{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function rd(n,e){return n.transaction([au],e?"readwrite":"readonly").objectStore(au)}function ak(){const n=indexedDB.deleteDatabase(hb);return new Vl(n).toPromise()}function Mh(){const n=indexedDB.open(hb,ok);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(au,{keyPath:fb})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(au)?e(r):(r.close(),await ak(),e(await Mh()))})})}async function w_(n,e,t){const r=rd(n,!0).put({[fb]:e,value:t});return new Vl(r).toPromise()}async function lk(n,e){const t=rd(n,!1).get(e),r=await new Vl(t).toPromise();return r===void 0?null:r.value}function b_(n,e){const t=rd(n,!0).delete(e);return new Vl(t).toPromise()}const ck=800,uk=3;class pb{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Mh(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>uk)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return bp()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=td._getInstance(ik()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await rk(),!this.activeServiceWorker)return;this.sender=new tk(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||sk()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Mh();return await w_(e,ou,"1"),await b_(e,ou),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>w_(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>lk(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>b_(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=rd(s,!1).getAll();return new Vl(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),ck)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}pb.type="LOCAL";const dk=pb;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hk(n,e){return _t(n,"POST","/v2/accounts/mfaSignIn:start",gt(n,e))}function fk(n,e){return _t(n,"POST","/v2/accounts/mfaSignIn:finalize",gt(n,e))}function pk(n,e){return _t(n,"POST","/v2/accounts/mfaSignIn:finalize",gt(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mk=500,gk=6e4,fc=1e12;class _k{constructor(e){this.auth=e,this.counter=fc,this._widgets=new Map}render(e,t){const r=this.counter;return this._widgets.set(r,new yk(e,this.auth.name,t||{})),this.counter++,r}reset(e){var t;const r=e||fc;(t=this._widgets.get(r))===null||t===void 0||t.delete(),this._widgets.delete(r)}getResponse(e){var t;const r=e||fc;return((t=this._widgets.get(r))===null||t===void 0?void 0:t.getResponse())||""}async execute(e){var t;const r=e||fc;return(t=this._widgets.get(r))===null||t===void 0||t.execute(),""}}class yk{constructor(e,t,r){this.params=r,this.timerId=null,this.deleted=!1,this.responseToken=null,this.clickHandler=()=>{this.execute()};const s=typeof e=="string"?document.getElementById(e):e;re(s,"argument-error",{appName:t}),this.container=s,this.isVisible=this.params.size!=="invisible",this.isVisible?this.execute():this.container.addEventListener("click",this.clickHandler)}getResponse(){return this.checkIfDeleted(),this.responseToken}delete(){this.checkIfDeleted(),this.deleted=!0,this.timerId&&(clearTimeout(this.timerId),this.timerId=null),this.container.removeEventListener("click",this.clickHandler)}execute(){this.checkIfDeleted(),!this.timerId&&(this.timerId=window.setTimeout(()=>{this.responseToken=vk(50);const{callback:e,"expired-callback":t}=this.params;if(e)try{e(this.responseToken)}catch{}this.timerId=window.setTimeout(()=>{if(this.timerId=null,this.responseToken=null,t)try{t()}catch{}this.isVisible&&this.execute()},gk)},mk))}checkIfDeleted(){if(this.deleted)throw new Error("reCAPTCHA mock was already deleted!")}}function vk(n){const e=[],t="1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";for(let r=0;r<n;r++)e.push(t.charAt(Math.floor(Math.random()*t.length)));return e.join("")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $d=Yw("rcb"),wk=new xl(3e4,6e4);class bk{constructor(){var e;this.hostLanguage="",this.counter=0,this.librarySeparatelyLoaded=!!(!((e=Ut().grecaptcha)===null||e===void 0)&&e.render)}load(e,t=""){return re(Ik(t),e,"argument-error"),this.shouldResolveImmediately(t)&&u_(Ut().grecaptcha)?Promise.resolve(Ut().grecaptcha):new Promise((r,s)=>{const i=Ut().setTimeout(()=>{s(Tn(e,"network-request-failed"))},wk.get());Ut()[$d]=()=>{Ut().clearTimeout(i),delete Ut()[$d];const a=Ut().grecaptcha;if(!a||!u_(a)){s(Tn(e,"internal-error"));return}const c=a.render;a.render=(u,d)=>{const f=c(u,d);return this.counter++,f},this.hostLanguage=t,r(a)};const o=`${JC()}?${xo({onload:$d,render:"explicit",hl:t})}`;fp(o).catch(()=>{clearTimeout(i),s(Tn(e,"internal-error"))})})}clearedOneInstance(){this.counter--}shouldResolveImmediately(e){var t;return!!(!((t=Ut().grecaptcha)===null||t===void 0)&&t.render)&&(e===this.hostLanguage||this.counter>0||this.librarySeparatelyLoaded)}}function Ik(n){return n.length<=6&&/^\s*[a-zA-Z0-9\-]*\s*$/.test(n)}class Ek{async load(e){return new _k(e)}clearedOneInstance(){}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mb="recaptcha",Tk={theme:"light",type:"image"};class DF{constructor(e,t,r=Object.assign({},Tk)){this.parameters=r,this.type=mb,this.destroyed=!1,this.widgetId=null,this.tokenChangeListeners=new Set,this.renderPromise=null,this.recaptcha=null,this.auth=kt(e),this.isInvisible=this.parameters.size==="invisible",re(typeof document<"u",this.auth,"operation-not-supported-in-this-environment");const s=typeof t=="string"?document.getElementById(t):t;re(s,this.auth,"argument-error"),this.container=s,this.parameters.callback=this.makeTokenCallback(this.parameters.callback),this._recaptchaLoader=this.auth.settings.appVerificationDisabledForTesting?new Ek:new bk,this.validateStartingState()}async verify(){this.assertNotDestroyed();const e=await this.render(),t=this.getAssertedRecaptcha(),r=t.getResponse(e);return r||new Promise(s=>{const i=o=>{o&&(this.tokenChangeListeners.delete(i),s(o))};this.tokenChangeListeners.add(i),this.isInvisible&&t.execute(e)})}render(){try{this.assertNotDestroyed()}catch(e){return Promise.reject(e)}return this.renderPromise?this.renderPromise:(this.renderPromise=this.makeRenderPromise().catch(e=>{throw this.renderPromise=null,e}),this.renderPromise)}_reset(){this.assertNotDestroyed(),this.widgetId!==null&&this.getAssertedRecaptcha().reset(this.widgetId)}clear(){this.assertNotDestroyed(),this.destroyed=!0,this._recaptchaLoader.clearedOneInstance(),this.isInvisible||this.container.childNodes.forEach(e=>{this.container.removeChild(e)})}validateStartingState(){re(!this.parameters.sitekey,this.auth,"argument-error"),re(this.isInvisible||!this.container.hasChildNodes(),this.auth,"argument-error"),re(typeof document<"u",this.auth,"operation-not-supported-in-this-environment")}makeTokenCallback(e){return t=>{if(this.tokenChangeListeners.forEach(r=>r(t)),typeof e=="function")e(t);else if(typeof e=="string"){const r=Ut()[e];typeof r=="function"&&r(t)}}}assertNotDestroyed(){re(!this.destroyed,this.auth,"internal-error")}async makeRenderPromise(){if(await this.init(),!this.widgetId){let e=this.container;if(!this.isInvisible){const t=document.createElement("div");e.appendChild(t),e=t}this.widgetId=this.getAssertedRecaptcha().render(e,this.parameters)}return this.widgetId}async init(){re(up()&&!bp(),this.auth,"internal-error"),await Ak(),this.recaptcha=await this._recaptchaLoader.load(this.auth,this.auth.languageCode||void 0);const e=await DC(this.auth);re(e,this.auth,"internal-error"),this.parameters.sitekey=e}getAssertedRecaptcha(){return re(this.recaptcha,this.auth,"internal-error"),this.recaptcha}}function Ak(){let n=null;return new Promise(e=>{if(document.readyState==="complete"){e();return}n=()=>e(),window.addEventListener("load",n)}).catch(e=>{throw n&&window.removeEventListener("load",n),e})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ip{constructor(e,t){this.verificationId=e,this.onConfirmation=t}confirm(e){const t=ti._fromVerification(this.verificationId,e);return this.onConfirmation(t)}}async function VF(n,e,t){if(Ot(n.app))return Promise.reject(Yt(n));const r=kt(n),s=await sd(r,e,we(t));return new Ip(s,i=>mp(r,i))}async function NF(n,e,t){const r=we(n);await Zu(!1,r,"phone");const s=await sd(r.auth,e,we(t));return new Ip(s,i=>x1(r,i))}async function OF(n,e,t){const r=we(n);if(Ot(r.auth.app))return Promise.reject(Yt(r.auth));const s=await sd(r.auth,e,we(t));return new Ip(s,i=>R1(r,i))}async function sd(n,e,t){var r;const s=await t.verify();try{re(typeof s=="string",n,"argument-error"),re(t.type===mb,n,"argument-error");let i;if(typeof e=="string"?i={phoneNumber:e}:i=e,"session"in i){const o=i.session;if("phoneNumber"in i)return re(o.type==="enroll",n,"internal-error"),(await K1(n,{idToken:o.credential,phoneEnrollmentInfo:{phoneNumber:i.phoneNumber,recaptchaToken:s}})).phoneSessionInfo.sessionInfo;{re(o.type==="signin",n,"internal-error");const a=((r=i.multiFactorHint)===null||r===void 0?void 0:r.uid)||i.multiFactorUid;return re(a,n,"missing-multi-factor-info"),(await hk(n,{mfaPendingCredential:o.credential,mfaEnrollmentId:a,phoneSignInInfo:{recaptchaToken:s}})).phoneResponseInfo.sessionInfo}}else{const{sessionInfo:o}=await y1(n,{phoneNumber:i.phoneNumber,recaptchaToken:s});return o}}finally{t._reset()}}async function MF(n,e){const t=we(n);if(Ot(t.auth.app))return Promise.reject(Yt(t.auth));await pp(t,e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class io{constructor(e){this.providerId=io.PROVIDER_ID,this.auth=kt(e)}verifyPhoneNumber(e,t){return sd(this.auth,e,we(t))}static credential(e,t){return ti._fromVerification(e,t)}static credentialFromResult(e){const t=e;return io.credentialFromTaggedObject(t)}static credentialFromError(e){return io.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{phoneNumber:t,temporaryProof:r}=e;return t&&r?ti._fromTokenResponse(t,r):null}}io.PROVIDER_ID="phone";io.PHONE_SIGN_IN_METHOD="phone";/**
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
 */function wi(n,e){return e?Rr(e):(re(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class Ep extends Cl{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return kr(e,this._buildIdpRequest())}_linkToIdToken(e,t){return kr(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return kr(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function Pk(n){return ib(n.auth,new Ep(n),n.bypassAuthState)}function Sk(n){const{auth:e,user:t}=n;return re(t,e,"internal-error"),sb(t,new Ep(n),n.bypassAuthState)}async function xk(n){const{auth:e,user:t}=n;return re(t,e,"internal-error"),pp(t,new Ep(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gb{constructor(e,t,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:i,error:o,type:a}=e;if(o){this.reject(o);return}const c={auth:this.auth,requestUri:t,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(a)(c))}catch(u){this.reject(u)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return Pk;case"linkViaPopup":case"linkViaRedirect":return xk;case"reauthViaPopup":case"reauthViaRedirect":return Sk;default:Vn(this.auth,"internal-error")}}resolve(e){Lr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Lr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Rk=new xl(2e3,1e4);async function LF(n,e,t){if(Ot(n.app))return Promise.reject(Tn(n,"operation-not-supported-in-this-environment"));const r=kt(n);Bo(n,e,Hr);const s=wi(r,t);return new Cr(r,"signInViaPopup",e,s).executeNotNull()}async function FF(n,e,t){const r=we(n);if(Ot(r.auth.app))return Promise.reject(Tn(r.auth,"operation-not-supported-in-this-environment"));Bo(r.auth,e,Hr);const s=wi(r.auth,t);return new Cr(r.auth,"reauthViaPopup",e,s,r).executeNotNull()}async function UF(n,e,t){const r=we(n);Bo(r.auth,e,Hr);const s=wi(r.auth,t);return new Cr(r.auth,"linkViaPopup",e,s,r).executeNotNull()}class Cr extends gb{constructor(e,t,r,s,i){super(e,t,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Cr.currentPopupAction&&Cr.currentPopupAction.cancel(),Cr.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return re(e,this.auth,"internal-error"),e}async onExecution(){Lr(this.filter.length===1,"Popup operations only handle one event");const e=nd();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(Tn(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Tn(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Cr.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Tn(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,Rk.get())};e()}}Cr.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ck="pendingRedirect",Dc=new Map;class kk extends gb{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Dc.get(this.auth._key());if(!e){try{const r=await Dk(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Dc.set(this.auth._key(),e)}return this.bypassAuthState||Dc.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Dk(n,e){const t=yb(e),r=_b(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}async function Tp(n,e){return _b(n)._set(yb(e),"true")}function Vk(n,e){Dc.set(n._key(),e)}function _b(n){return Rr(n._redirectPersistence)}function yb(n){return Cc(Ck,n.config.apiKey,n.name)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function BF(n,e,t){return Nk(n,e,t)}async function Nk(n,e,t){if(Ot(n.app))return Promise.reject(Yt(n));const r=kt(n);Bo(n,e,Hr),await r._initializationPromise;const s=wi(r,t);return await Tp(s,r),s._openRedirect(r,e,"signInViaRedirect")}function jF(n,e,t){return Ok(n,e,t)}async function Ok(n,e,t){const r=we(n);if(Bo(r.auth,e,Hr),Ot(r.auth.app))return Promise.reject(Yt(r.auth));await r.auth._initializationPromise;const s=wi(r.auth,t);await Tp(s,r.auth);const i=await wb(r);return s._openRedirect(r.auth,e,"reauthViaRedirect",i)}function $F(n,e,t){return Mk(n,e,t)}async function Mk(n,e,t){const r=we(n);Bo(r.auth,e,Hr),await r.auth._initializationPromise;const s=wi(r.auth,t);await Zu(!1,r,e.providerId),await Tp(s,r.auth);const i=await wb(r);return s._openRedirect(r.auth,e,"linkViaRedirect",i)}async function qF(n,e){return await kt(n)._initializationPromise,vb(n,e,!1)}async function vb(n,e,t=!1){if(Ot(n.app))return Promise.reject(Yt(n));const r=kt(n),s=wi(r,e),o=await new kk(r,s,t).execute();return o&&!t&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}async function wb(n){const e=nd(`${n.uid}:::`);return n._redirectEventId=e,await n.auth._setRedirectUser(n),await n.auth._persistUserIfCurrent(n),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lk=10*60*1e3;class Fk{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!Uk(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!bb(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(Tn(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=Lk&&this.cachedEventUids.clear(),this.cachedEventUids.has(I_(e))}saveEventToCache(e){this.cachedEventUids.add(I_(e)),this.lastProcessedEventTime=Date.now()}}function I_(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function bb({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function Uk(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return bb(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Bk(n,e={}){return _t(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jk=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,$k=/^https?/;async function qk(n){if(n.config.emulator)return;const{authorizedDomains:e}=await Bk(n);for(const t of e)try{if(zk(t))return}catch{}Vn(n,"unauthorized-domain")}function zk(n){const e=sl(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const o=new URL(n);return o.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&o.hostname===r}if(!$k.test(t))return!1;if(jk.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
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
 */const Gk=new xl(3e4,6e4);function E_(){const n=Ut().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function Kk(n){return new Promise((e,t)=>{var r,s,i;function o(){E_(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{E_(),t(Tn(n,"network-request-failed"))},timeout:Gk.get()})}if(!((s=(r=Ut().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=Ut().gapi)===null||i===void 0)&&i.load)o();else{const a=Yw("iframefcb");return Ut()[a]=()=>{gapi.load?o():t(Tn(n,"network-request-failed"))},fp(`${XC()}?onload=${a}`).catch(c=>t(c))}}).catch(e=>{throw Vc=null,e})}let Vc=null;function Hk(n){return Vc=Vc||Kk(n),Vc}/**
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
 */const Wk=new xl(5e3,15e3),Qk="__/auth/iframe",Jk="emulator/auth/iframe",Yk={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Xk=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Zk(n){const e=n.config;re(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?dp(e,Jk):`https://${n.config.authDomain}/${Qk}`,r={apiKey:e.apiKey,appName:n.name,v:Ro},s=Xk.get(n.config.apiHost);s&&(r.eid=s);const i=n._getFrameworks();return i.length&&(r.fw=i.join(",")),`${t}?${xo(r).slice(1)}`}async function eD(n){const e=await Hk(n),t=Ut().gapi;return re(t,n,"internal-error"),e.open({where:document.body,url:Zk(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Yk,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const o=Tn(n,"network-request-failed"),a=Ut().setTimeout(()=>{i(o)},Wk.get());function c(){Ut().clearTimeout(a),s(r)}r.ping(c).then(c,()=>{i(o)})}))}/**
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
 */const tD={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},nD=500,rD=600,sD="_blank",iD="http://localhost";class T_{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function oD(n,e,t,r=nD,s=rD){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let a="";const c=Object.assign(Object.assign({},tD),{width:r.toString(),height:s.toString(),top:i,left:o}),u=zt().toLowerCase();t&&(a=zw(u)?sD:t),$w(u)&&(e=e||iD,c.scrollbars="yes");const d=Object.entries(c).reduce((g,[_,k])=>`${g}${_}=${k},`,"");if($C(u)&&a!=="_self")return aD(e||"",a),new T_(null);const f=window.open(e||"",a,d);re(f,n,"popup-blocked");try{f.focus()}catch{}return new T_(f)}function aD(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
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
 */const lD="__/auth/handler",cD="emulator/auth/handler",uD=encodeURIComponent("fac");async function A_(n,e,t,r,s,i){re(n.config.authDomain,n,"auth-domain-config-required"),re(n.config.apiKey,n,"invalid-api-key");const o={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:Ro,eventId:s};if(e instanceof Hr){e.setDefaultLanguage(n.languageCode),o.providerId=e.providerId||"",xA(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,f]of Object.entries(i||{}))o[d]=f}if(e instanceof jo){const d=e.getScopes().filter(f=>f!=="");d.length>0&&(o.scopes=d.join(","))}n.tenantId&&(o.tid=n.tenantId);const a=o;for(const d of Object.keys(a))a[d]===void 0&&delete a[d];const c=await n._getAppCheckToken(),u=c?`#${uD}=${encodeURIComponent(c)}`:"";return`${dD(n)}?${xo(a).slice(1)}${u}`}function dD({config:n}){return n.emulator?dp(n,cD):`https://${n.authDomain}/${lD}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qd="webStorageSupport";class hD{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=db,this._completeRedirectFn=vb,this._overrideRedirectResult=Vk}async _openPopup(e,t,r,s){var i;Lr((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const o=await A_(e,t,r,sl(),s);return oD(e,o,nd())}async _openRedirect(e,t,r,s){await this._originValidation(e);const i=await A_(e,t,r,sl(),s);return nk(i),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:i}=this.eventManagers[t];return s?Promise.resolve(s):(Lr(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await eD(e),r=new Fk(e);return t.register("authEvent",s=>(re(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(qd,{type:qd},s=>{var i;const o=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[qd];o!==void 0&&t(!!o),Vn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=qk(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Qw()||qw()||hp()}}const fD=hD;class Ib{constructor(e){this.factorId=e}_process(e,t,r){switch(t.type){case"enroll":return this._finalizeEnroll(e,t.credential,r);case"signin":return this._finalizeSignIn(e,t.credential);default:return lr("unexpected MultiFactorSessionType")}}}class Ap extends Ib{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new Ap(e)}_finalizeEnroll(e,t,r){return H1(e,{idToken:t,displayName:r,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,t){return fk(e,{mfaPendingCredential:t,phoneVerificationInfo:this.credential._makeVerificationRequest()})}}class pD{constructor(){}static assertion(e){return Ap._fromCredential(e)}}pD.FACTOR_ID="phone";class mD{static assertionForEnrollment(e,t){return cl._fromSecret(e,t)}static assertionForSignIn(e,t){return cl._fromEnrollmentId(e,t)}static async generateSecret(e){var t;const r=e;re(typeof((t=r.user)===null||t===void 0?void 0:t.auth)<"u","internal-error");const s=await W1(r.user.auth,{idToken:r.credential,totpEnrollmentInfo:{}});return Pp._fromStartTotpMfaEnrollmentResponse(s,r.user.auth)}}mD.FACTOR_ID="totp";class cl extends Ib{constructor(e,t,r){super("totp"),this.otp=e,this.enrollmentId=t,this.secret=r}static _fromSecret(e,t){return new cl(t,void 0,e)}static _fromEnrollmentId(e,t){return new cl(t,e)}async _finalizeEnroll(e,t,r){return re(typeof this.secret<"u",e,"argument-error"),Q1(e,{idToken:t,displayName:r,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,t){re(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");const r={verificationCode:this.otp};return pk(e,{mfaPendingCredential:t,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:r})}}class Pp{constructor(e,t,r,s,i,o,a){this.sessionInfo=o,this.auth=a,this.secretKey=e,this.hashingAlgorithm=t,this.codeLength=r,this.codeIntervalSeconds=s,this.enrollmentCompletionDeadline=i}static _fromStartTotpMfaEnrollmentResponse(e,t){return new Pp(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,t)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,t){var r;let s=!1;return(pc(e)||pc(t))&&(s=!0),s&&(pc(e)&&(e=((r=this.auth.currentUser)===null||r===void 0?void 0:r.email)||"unknownuser"),pc(t)&&(t=this.auth.name)),`otpauth://totp/${t}:${e}?secret=${this.secretKey}&issuer=${t}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}}function pc(n){return typeof n>"u"||(n==null?void 0:n.length)===0}var P_="@firebase/auth",S_="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gD{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){re(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _D(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function yD(n){uo(new ri("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:a}=r.options;re(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:o,authDomain:a,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Jw(n)},u=new WC(r,s,i,c);return r1(u,t),u},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),uo(new ri("auth-internal",e=>{const t=kt(e.getProvider("auth").getImmediate());return(r=>new gD(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),ys(P_,S_,_D(n)),ys(P_,S_,"esm2017")}/**
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
 */const vD=5*60,wD=ev("authIdTokenMaxAge")||vD;let x_=null;const bD=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>wD)return;const s=t==null?void 0:t.token;x_!==s&&(x_=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function ID(n=ov()){const e=fl(n,"auth");if(e.isInitialized())return e.getImmediate();const t=n1(n,{popupRedirectResolver:fD,persistence:[dk,Z1,db]}),r=ev("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const o=bD(i.toString());G1(t,o,()=>o(t.currentUser)),z1(t,a=>o(a))}}const s=Xy("auth");return s&&s1(t,`http://${s}`),t}function ED(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}QC({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const i=Tn("internal-error");i.customData=s,t(i)},r.type="text/javascript",r.charset="UTF-8",ED().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});yD("Browser");const TD={apiKey:"AIzaSyDCqJRmxKiIzuAhgXsmXICCx_O65aujNa0",authDomain:"impro-selector.firebaseapp.com",projectId:"impro-selector",storageBucket:"impro-selector.appspot.com",messagingSenderId:"730278491306",appId:"1:730278491306:web:c966af1179221e91118cd3",measurementId:"G-3NB062D088"},Eb=iv(TD),Ee=XR(Eb),bi=ID(Eb);S1(bi);async function AD(n,e){try{return(await N1(bi,n,e)).user}catch(t){throw t}}async function PD(n,e){try{return(await O1(bi,n,e)).user}catch(t){throw t}}async function SD(n){try{await k1(bi,n)}catch(e){throw e}}async function xD(n){try{const e=bi.currentUser;if(e)await F1(e,n);else throw new Error("Aucun utilisateur connecté")}catch(e){throw e}}const Ma=Object.freeze(Object.defineProperty({__proto__:null,auth:bi,createPlayerAccount:AD,db:Ee,resetPlayerPassword:SD,signInPlayer:PD,updatePlayerPassword:xD},Symbol.toStringTag,{value:"Module"})),Nl="seasons";async function RD(n,e,t){return await uC(st(Ee,Nl),{name:n,slug:e,pinCode:t,createdAt:Rw()})}async function CD(n){return await ru(Ue(Ee,Nl,n))}async function zd(){const n=Tw(st(Ee,Nl),oC("createdAt","desc"));return(await At(n)).docs.map(t=>({id:t.id,...t.data()}))}async function lu(n,e){const t=await Ju(Ue(Ee,Nl,n));return t.exists()?t.data().pinCode===e:!1}async function Lh(n){const e=await Ju(Ue(Ee,Nl,n));return e.exists()?e.data().pinCode:null}const Gd=10*60*1e3,Kd="impro_selector_pin_session";class kD{constructor(){this.sessionData=this.loadSession()}loadSession(){try{const e=localStorage.getItem(Kd);if(e){const t=JSON.parse(e);if(t.timestamp&&Date.now()-t.timestamp<Gd)return t;this.clearSession()}}catch(e){console.error("Erreur lors du chargement de la session PIN:",e)}return null}saveSession(e,t){try{const r={seasonId:e,pinCode:t,timestamp:Date.now()};localStorage.setItem(Kd,JSON.stringify(r)),this.sessionData=r}catch(r){console.error("Erreur lors de la sauvegarde de la session PIN:",r)}}isPinCached(e){return this.sessionData?this.sessionData.seasonId===e&&this.sessionData.timestamp&&Date.now()-this.sessionData.timestamp<Gd:!1}getCachedPin(e){return this.isPinCached(e)?this.sessionData.pinCode:null}clearSession(){try{localStorage.removeItem(Kd),this.sessionData=null}catch(e){console.error("Erreur lors de la suppression de la session PIN:",e)}}getTimeRemaining(){if(!this.sessionData||!this.sessionData.timestamp)return 0;const e=Date.now()-this.sessionData.timestamp,t=Gd-e;return Math.max(0,Math.ceil(t/(60*1e3)))}isExpiringSoon(){return this.getTimeRemaining()<=2}}const Rn=new kD,DD={key:0,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"},VD={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},ND={class:"text-center mb-6"},OD={class:"text-gray-300"},MD={key:0,class:"mt-2 p-2 bg-green-900/20 border border-green-500/30 rounded-lg"},LD={class:"text-sm text-green-400"},FD={class:"mb-4 flex justify-center"},UD={class:"flex bg-gray-800 rounded-lg p-1"},BD={key:0,class:"mb-6"},jD={class:"mb-4"},$D={key:1,class:"mb-6"},qD={class:"flex justify-center space-x-3 mb-4"},zD={class:"grid grid-cols-3 gap-3 mb-4"},GD=["onClick"],KD={key:2,class:"mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-center"},HD={class:"flex justify-end space-x-3"},WD=["disabled"],Tb={__name:"PinModal",props:{show:{type:Boolean,default:!1},message:{type:String,default:"Veuillez saisir le code PIN à 4 chiffres"},error:{type:String,default:""},sessionInfo:{type:Object,default:null}},emits:["submit","cancel"],setup(n,{emit:e}){const t=n,r=e,s=K(""),i=K(""),o=K("direct"),a=K(null);Yn(()=>t.show,T=>{T&&(s.value="",i.value="",o.value==="direct"&&ni(()=>{var C;(C=a.value)==null||C.focus()}))}),Yn(o,T=>{T==="direct"&&t.show&&ni(()=>{var C;(C=a.value)==null||C.focus()})});function c(){s.value=s.value.replace(/[^0-9]/g,""),s.value.length>4&&(s.value=s.value.slice(0,4))}function u(T){s.value.length<4&&(s.value+=T.toString())}function d(){s.value=s.value.slice(0,-1)}function f(){s.value="",i.value=""}function g(){s.value.length===4&&r("submit",s.value)}function _(){r("cancel")}const k=T=>{t.show&&(T.key>="0"&&T.key<="9"?o.value==="keypad"&&u(parseInt(T.key)):T.key==="Backspace"?o.value==="keypad"&&d():T.key==="Enter"?g():T.key==="Escape"&&_())};return typeof window<"u"&&window.addEventListener("keydown",k),(T,C)=>n.show?(W(),Q("div",DD,[m("div",VD,[m("div",ND,[C[4]||(C[4]=m("div",{class:"w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center"},[m("span",{class:"text-2xl"},"🔒")],-1)),C[5]||(C[5]=m("h2",{class:"text-2xl font-bold text-white mb-2"},"Code d'accès requis",-1)),m("p",OD,_e(n.message),1),n.sessionInfo?(W(),Q("div",MD,[m("p",LD," Session active : "+_e(n.sessionInfo.timeRemaining)+" min restantes ",1)])):Ae("",!0)]),m("div",FD,[m("div",UD,[m("button",{onClick:C[0]||(C[0]=F=>o.value="direct"),class:cr(["px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",o.value==="direct"?"bg-purple-600 text-white":"text-gray-400 hover:text-white"])}," Saisie directe ",2),m("button",{onClick:C[1]||(C[1]=F=>o.value="keypad"),class:cr(["px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",o.value==="keypad"?"bg-purple-600 text-white":"text-gray-400 hover:text-white"])}," Pavé numérique ",2)])]),o.value==="direct"?(W(),Q("div",BD,[m("div",jD,[C[6]||(C[6]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Code PIN",-1)),Et(m("input",{"onUpdate:modelValue":C[2]||(C[2]=F=>s.value=F),type:"password",maxlength:"4",pattern:"[0-9]{4}",autocomplete:"off",autocorrect:"off",autocapitalize:"off",spellcheck:"false",class:"w-full p-4 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-center text-2xl font-mono tracking-widest",placeholder:"••••",onInput:c,onKeydown:[In(g,["enter"]),In(_,["escape"])],ref_key:"pinInput",ref:a},null,544),[[Tt,s.value]])]),C[7]||(C[7]=m("p",{class:"text-xs text-gray-400 text-center"},"Tapez directement votre code PIN à 4 chiffres",-1))])):(W(),Q("div",$D,[m("div",qD,[(W(),Q(Rt,null,rr(4,(F,j)=>m("div",{key:j,class:cr(["w-12 h-12 border-2 border-gray-600 rounded-lg flex items-center justify-center text-2xl font-bold text-white bg-gray-800",{"border-purple-500 bg-purple-900/20":s.value.length>j}])},_e(s.value[j]||"•"),3)),64))]),m("div",zD,[(W(),Q(Rt,null,rr([1,2,3,4,5,6,7,8,9],F=>m("button",{key:F,onClick:j=>u(F),class:"w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-xl transition-all duration-200 hover:scale-105"},_e(F),9,GD)),64)),m("button",{onClick:f,class:"w-12 h-12 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105"}," C "),m("button",{onClick:C[3]||(C[3]=F=>u(0)),class:"w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-xl transition-all duration-200 hover:scale-105"}," 0 "),m("button",{onClick:d,class:"w-12 h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105"}," ← ")])])),i.value||t.error?(W(),Q("div",KD,_e(i.value||t.error),1)):Ae("",!0),m("div",HD,[m("button",{onClick:_,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),m("button",{onClick:g,disabled:s.value.length!==4,class:"px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"}," Valider ",8,WD)])])])):Ae("",!0)}},QD={class:"min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"},JD={class:"container mx-auto px-4 pb-16"},YD={class:"flex justify-center mb-12"},XD={class:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto"},ZD=["onClick"],eV={class:"text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors"},tV=["onClick"],nV={key:0,class:"text-center py-16"},rV={key:0,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},sV={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},iV={class:"mb-6"},oV={class:"mb-6"},aV={class:"mb-6"},lV={class:"flex justify-end space-x-3"},cV=["disabled"],uV={key:1,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},dV={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},hV={class:"text-center mb-6"},fV={class:"text-gray-300"},pV={__name:"Home",setup(n){const e=K([]),t=sf(),r=K(!1),s=K(!1),i=K(""),o=K(""),a=K(""),c=K(null),u=K(!1),d=K(null),f=K("");vu(async()=>{e.value=await zd(),console.log("Saisons chargées:",e.value)});function g(R){t.push(`/season/${R}`)}function _(){i.value&&(o.value=i.value.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim("-"))}function k(){a.value=a.value.replace(/[^0-9]/g,""),a.value.length>4&&(a.value=a.value.slice(0,4))}async function T(){if(!i.value.trim()||!o.value.trim()||!a.value.trim()){alert("Veuillez remplir tous les champs, y compris le code PIN à 4 chiffres");return}if(a.value.length!==4){alert("Le code PIN doit contenir exactement 4 chiffres");return}try{await RD(i.value.trim(),o.value.trim(),a.value.trim()),e.value=await zd(),C()}catch(R){console.error("Erreur lors de la création de la saison:",R),alert("Erreur lors de la création de la saison. Veuillez réessayer.")}}function C(){r.value=!1,i.value="",o.value="",a.value=""}function F(R){c.value=R,s.value=!0}async function j(){s.value=!1,await q({type:"deleteSeason",data:{seasonId:c.value.id,seasonName:c.value.name}})}function L(){s.value=!1,c.value=null}function M(){return d.value?{deleteSeason:"Suppression de saison - Code PIN requis"}[d.value.type]||"Code PIN requis":"Veuillez saisir le code PIN à 4 chiffres"}async function q(R){if(Rn.isPinCached(c.value.id)){const w=Rn.getCachedPin(c.value.id);if(console.log("PIN en cache trouvé, utilisation automatique"),await lu(c.value.id,w)){await S(R);return}else Rn.clearSession()}d.value=R,u.value=!0}async function te(R){var w,P,I;console.log("PIN soumis:",R,"pour l'opération:",d.value);try{const ke=((P=(w=d.value)==null?void 0:w.data)==null?void 0:P.seasonId)||((I=c.value)==null?void 0:I.id),ct=await lu(ke,R);if(console.log("PIN valide:",ct),ct){Rn.saveSession(ke,R),console.log("PIN correct, fermeture de la modal et exécution de l'opération"),u.value=!1;const He=d.value;d.value=null,console.log("Appel de executePendingOperation avec:",He),await S(He)}else f.value="Code PIN incorrect",setTimeout(()=>{f.value=""},3e3)}catch(ke){console.error("Erreur lors de la vérification du PIN:",ke),f.value="Erreur lors de la vérification du code PIN"}}function x(){u.value=!1,d.value=null,f.value=""}function E(){return c.value&&Rn.isPinCached(c.value.id)?{timeRemaining:Rn.getTimeRemaining(),isExpiringSoon:Rn.isExpiringSoon()}:null}async function S(R){if(console.log("executePendingOperation appelé avec:",R),!R){console.log("Aucune opération à exécuter");return}const{type:w,data:P}=R;console.log("Exécution de l'opération:",w,"avec données:",P);try{switch(w){case"deleteSeason":console.log("Suppression de la saison ID:",P.seasonId),await CD(P.seasonId),console.log("Saison supprimée, rechargement de la liste..."),e.value=await zd(),console.log("Nouvelle liste des saisons:",e.value);break;default:console.log("Type d'opération non reconnu:",w)}}catch(I){console.error("Erreur lors de l'exécution de l'opération:",I),alert("Erreur lors de l'opération. Veuillez réessayer.")}}return(R,w)=>{var P;return W(),Q("div",QD,[w[20]||(w[20]=m("div",{class:"text-center py-16 px-4"},[m("h1",{class:"text-6xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse"}," Sélections Spectacle "),m("p",{class:"text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"}," Gérez facilement les sélections pour vos spectacles. ")],-1)),m("div",JD,[m("div",YD,[m("button",{onClick:w[0]||(w[0]=I=>r.value=!0),class:"bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105"}," ✨ Nouvelle saison ")]),m("div",XD,[(W(!0),Q(Rt,null,rr(e.value,I=>(W(),Q("div",{key:I.id,class:"group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"},[m("div",{onClick:ke=>g(I.slug),class:"text-center"},[w[5]||(w[5]=m("div",{class:"w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"},[m("span",{class:"text-2xl"},"🎭")],-1)),m("h2",eV,_e(I.name),1),w[6]||(w[6]=m("div",{class:"w-full bg-gradient-to-r from-transparent via-white/20 to-transparent h-px mb-4"},null,-1)),w[7]||(w[7]=m("p",{class:"text-gray-300 text-sm"}," Cliquez pour accéder ",-1))],8,ZD),m("button",{onClick:Hn(ke=>F(I),["stop"]),class:"absolute top-4 right-4 text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100",title:"Supprimer cette saison"},w[8]||(w[8]=[m("svg",{class:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[m("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})],-1)]),8,tV)]))),128))]),e.value.length===0?(W(),Q("div",nV,[w[9]||(w[9]=m("div",{class:"w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center"},[m("span",{class:"text-4xl"},"🎪")],-1)),w[10]||(w[10]=m("h3",{class:"text-2xl font-bold text-white mb-4"},"Aucune saison créée",-1)),w[11]||(w[11]=m("p",{class:"text-gray-300 mb-8"},"Commencez par créer votre première saison de spectacles !",-1)),m("button",{onClick:w[1]||(w[1]=I=>r.value=!0),class:"bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-xl hover:shadow-pink-500/25 transition-all duration-300"}," Créer ma première saison ")])):Ae("",!0)]),r.value?(W(),Q("div",rV,[m("div",sV,[w[16]||(w[16]=m("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✨ Nouvelle saison",-1)),m("div",iV,[w[12]||(w[12]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nom de la saison",-1)),Et(m("input",{"onUpdate:modelValue":w[2]||(w[2]=I=>i.value=I),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Ex: La Malice 2025-2026",onInput:_},null,544),[[Tt,i.value]])]),m("div",oV,[w[13]||(w[13]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Slug (URL)",-1)),Et(m("input",{"onUpdate:modelValue":w[3]||(w[3]=I=>o.value=I),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Ex: malice-2025-2026"},null,512),[[Tt,o.value]])]),m("div",aV,[w[14]||(w[14]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Code PIN (4 chiffres)",-1)),Et(m("input",{"onUpdate:modelValue":w[4]||(w[4]=I=>a.value=I),type:"text",inputmode:"numeric",maxlength:"4",pattern:"[0-9]{4}",autocomplete:"off",autocorrect:"off",autocapitalize:"off",spellcheck:"false",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"1234",onInput:k},null,544),[[Tt,a.value]]),w[15]||(w[15]=m("p",{class:"text-xs text-gray-400 mt-1"},"Ce code protégera les opérations sensibles (suppressions, sélections)",-1))]),m("div",lV,[m("button",{onClick:C,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),m("button",{onClick:T,disabled:!i.value.trim()||!o.value.trim()||!a.value.trim()||a.value.length!==4,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300"}," Créer ",8,cV)])])])):Ae("",!0),s.value?(W(),Q("div",uV,[m("div",dV,[m("div",hV,[w[17]||(w[17]=m("div",{class:"w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"},[m("span",{class:"text-2xl"},"⚠️")],-1)),w[18]||(w[18]=m("h2",{class:"text-2xl font-bold text-white mb-2"},"Confirmation",-1)),m("p",fV,'Êtes-vous sûr de vouloir supprimer la saison "'+_e((P=c.value)==null?void 0:P.name)+'" ?',1)]),w[19]||(w[19]=m("p",{class:"mb-6 text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-500/20"}," ⚠️ Cette action est irréversible et supprimera toutes les données de cette saison. ",-1)),m("div",{class:"flex justify-end space-x-3"},[m("button",{onClick:L,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),m("button",{onClick:j,class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"}," Supprimer ")])])])):Ae("",!0),Bt(Tb,{show:u.value,message:M(),error:f.value,"session-info":E(),onSubmit:te,onCancel:x},null,8,["show","message","error","session-info"])])}}};let An="mock";const fi=[{id:"p1",name:"Alice"},{id:"p2",name:"Bob"},{id:"p3",name:"Charlie"},{id:"p4",name:"David"},{id:"p5",name:"Eva"},{id:"p6",name:"Fanny"},{id:"p7",name:"Georges"},{id:"p8",name:"Hélène"},{id:"p9",name:"Ismaël"},{id:"p10",name:"Jade"},{id:"p11",name:"Karim"},{id:"p12",name:"Léa"},{id:"p13",name:"Marc"},{id:"p14",name:"Nina"},{id:"p15",name:"Oscar"}],pi=[{id:"event1",title:"Apérock Septembre",date:"2025-09-08",description:"Soirée apéro-rock avec ambiance festive"},{id:"event2",title:"Match à Cambo",date:"2025-11-25",description:"Match d'improvisation compétitif à Cambo-les-Bains"},{id:"event3",title:"Impro des Familles",date:"2025-12-02",description:"Spectacle d'improvisation pour toute la famille"},{id:"event4",title:"Cabaret Surprise",date:"2026-01-20",description:"Cabaret avec des surprises et des performances uniques"},{id:"event5",title:"Impro Plage",date:"2026-03-10",description:"Improvisation en plein air avec vue sur la plage"}];function mV(n){An=n}async function gV(){if(An!=="firebase"||!(await At(st(Ee,"seasons"))).empty)return;const e=Ue(st(Ee,"seasons"));await Ln(e,{name:"Malice 2025-2026",slug:"malice-2025-2026",createdAt:Rw()});const t=await At(st(Ee,"players"));for(const o of t.docs)await Ln(Ue(e,"players",o.id),o.data());const r=await At(st(Ee,"events"));for(const o of r.docs)await Ln(Ue(e,"events",o.id),o.data());const s=await At(st(Ee,"availability"));for(const o of s.docs)await Ln(Ue(e,"availability",o.id),o.data());const i=await At(st(Ee,"selections"));for(const o of i.docs)await Ln(Ue(e,"selections",o.id),o.data())}async function _V(){An==="firebase"&&await gV()}async function R_(n=null){return(An==="firebase"?n?(await At(st(Ee,"seasons",n,"events"))).docs.map(t=>({id:t.id,...t.data()})):(await At(st(Ee,"events"))).docs.map(t=>({id:t.id,...t.data()})):pi).sort((t,r)=>{const s=new Date(t.date),i=new Date(r.date);return s<i?-1:s>i?1:t.title.localeCompare(r.title)})}async function Hd(n=null){return(An==="firebase"?n?(await At(st(Ee,"seasons",n,"players"))).docs.map(t=>({id:t.id,...t.data()})):(await At(st(Ee,"players"))).docs.map(t=>({id:t.id,...t.data()})):fi).sort((t,r)=>t.order<r.order?-1:t.order>r.order?1:t.name.localeCompare(r.name))}async function yV(n,e=null){if(An==="firebase"){const t=Ue(e?st(Ee,"seasons",e,"players"):st(Ee,"players"));return await Ln(t,{name:n}),t.id}else{const t=`p${fi.length+1}`;return fi.push({id:t,name:n}),t}}async function vV(n,e=null){if(An==="firebase"){const t=e?Ue(Ee,"seasons",e,"players",n):Ue(Ee,"players",n);await ru(t);const r=e?await At(st(Ee,"seasons",e,"availability")):await At(st(Ee,"availability")),s=Cw(Ee);r.forEach(i=>{const o=i.data();if(o[n]!==void 0){const a={...o};delete a[n],s.update(i.ref,a)}}),await s.commit()}else fi=fi.filter(t=>t.id!==n)}async function wV(n,e,t=null){if(An==="firebase"){const r=t?Ue(Ee,"seasons",t,"players",n):Ue(Ee,"players",n);await Ln(r,{name:e})}else{const r=fi.findIndex(s=>s.id===n);r!==-1&&(fi[r]=e)}}async function da(n,e,t=null){if(An==="firebase"){const r=t?await At(st(Ee,"seasons",t,"availability")):await At(st(Ee,"availability")),s={};return r.forEach(i=>{s[i.id]=i.data()}),s}else{const r={};return n.forEach(s=>{r[s.name]={},e.forEach(i=>{r[s.name][i.id]=void 0})}),e.forEach(s=>{const i=[...n].sort(()=>.5-Math.random());i.slice(0,4).forEach(o=>{r[o.name][s.id]=!0}),i.slice(4).forEach(o=>{const a=Math.random();r[o.name][s.id]=a<.4?!0:a<.8?!1:void 0})}),r}}async function ha(n=null){if(An==="firebase"){const e=n?await At(st(Ee,"seasons",n,"selections")):await At(st(Ee,"selections")),t={};return e.forEach(r=>{t[r.id]=r.data().players||[]}),t}else return{}}async function C_(n,e,t=null){if(An==="firebase"){const r=t?Ue(Ee,"seasons",t,"availability",n):Ue(Ee,"availability",n);await Ln(r,e)}}async function bV(n,e,t=null){if(An==="firebase"){const r=t?Ue(Ee,"seasons",t,"selections",n):Ue(Ee,"selections",n);await Ln(r,{players:e})}}async function IV(n,e=null){if(console.log("Suppression de l'événement:",n),An==="firebase")try{console.log("Suppression de l'événement dans Firestore");const t=e?Ue(Ee,"seasons",e,"events",n):Ue(Ee,"events",n);await ru(t),console.log("Suppression de la sélection associée");const r=e?Ue(Ee,"seasons",e,"selections",n):Ue(Ee,"selections",n);await ru(r),console.log("Suppression des disponibilités");const s=e?await At(st(Ee,"seasons",e,"availability")):await At(st(Ee,"availability")),i=Cw(Ee);s.forEach(o=>{const a=o.data();if(a[n]!==void 0){console.log("Mise à jour de la disponibilité pour:",o.id);const c={...a};delete c[n],i.update(o.ref,c)}}),await i.commit(),console.log("Opérations de suppression terminées avec succès")}catch(t){throw console.error("Erreur lors de la suppression:",t),t}else pi=pi.filter(t=>t.id!==n)}async function EV(n,e=null){if(An==="firebase"){const t=Ue(e?st(Ee,"seasons",e,"events"):st(Ee,"events"));return await Ln(t,n),t.id}else{const t=`event${pi.length+1}`;return pi.push({id:t,...n}),t}}async function TV(n,e,t=null){if(An==="firebase"){const r=t?Ue(Ee,"seasons",t,"events",n):Ue(Ee,"events",n);await Ln(r,e)}else{const r=pi.findIndex(s=>s.id===n);r!==-1&&(pi[r]={id:n,...e})}}const AV="modulepreload",PV=function(n){return"/impro-selector/"+n},k_={},ir=function(e,t,r){if(!t||t.length===0)return e();const s=document.getElementsByTagName("link");return Promise.all(t.map(i=>{if(i=PV(i),i in k_)return;k_[i]=!0;const o=i.endsWith(".css"),a=o?'[rel="stylesheet"]':"";if(!!r)for(let d=s.length-1;d>=0;d--){const f=s[d];if(f.href===i&&(!o||f.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${i}"]${a}`))return;const u=document.createElement("link");if(u.rel=o?"stylesheet":AV,o||(u.as="script",u.crossOrigin=""),u.href=i,document.head.appendChild(u),o)return new Promise((d,f)=>{u.addEventListener("load",d),u.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${i}`)))})})).then(()=>e()).catch(i=>{const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=i,window.dispatchEvent(o),!o.defaultPrevented)throw i})};class SV{constructor(){this.sessions=new Map,this.sessionDuration=10*60*1e3}isPasswordCached(e){const t=this.sessions.get(e);return t?Date.now()-t.timestamp>this.sessionDuration?(this.sessions.delete(e),!1):!0:!1}getCachedPassword(e){const t=this.sessions.get(e);return t?Date.now()-t.timestamp>this.sessionDuration?(this.sessions.delete(e),null):t.password:null}saveSession(e,t){this.sessions.set(e,{password:t,timestamp:Date.now()})}clearSession(e){this.sessions.delete(e)}clearExpiredSessions(){const e=Date.now();for(const[t,r]of this.sessions.entries())e-r.timestamp>this.sessionDuration&&this.sessions.delete(t)}clearAllSessions(){this.sessions.clear()}}const Ab=new SV;function Pb(n){let e=0;for(let t=0;t<n.length;t++){const r=n.charCodeAt(t);e=(e<<5)-e+r,e=e&e}return e.toString()}async function xV(n,e,t,r=null){try{console.log("🔍 [DEBUG] Début protectPlayer:",{playerId:n,email:e,seasonId:r});const s=await Ol(n,r);if(s&&s.isProtected)throw new Error("Ce joueur est déjà protégé");const{collection:i,query:o,where:a,getDocs:c}=await ir(()=>import("./index.esm-5b6e403e.js"),[]),{db:u}=await ir(()=>Promise.resolve().then(()=>Ma),void 0),d=r?i(u,"seasons",r,"playerProtection"):i(u,"playerProtection"),f=o(d,a("email","==",e)),g=await c(f);if(!g.empty&&g.docs.find(L=>L.id!==n))throw new Error("Cette adresse email est déjà utilisée par un autre joueur");console.log("🔍 [DEBUG] Création du compte Firebase Auth...");const{createUserWithEmailAndPassword:_}=await ir(()=>import("./index.esm-456a655a.js"),[]),{auth:k}=await ir(()=>Promise.resolve().then(()=>Ma),void 0),T=await _(k,e,t);console.log("🔍 [DEBUG] Compte Firebase Auth créé:",T.user.uid);const C=Pb(t),F=r?Ue(u,"seasons",r,"playerProtection",n):Ue(u,"playerProtection",n);return await Ln(F,{playerId:n,email:e,passwordHash:C,firebaseUid:T.user.uid,isProtected:!0,createdAt:new Date}),console.log("🔍 [DEBUG] Protection sauvegardée dans Firestore"),{success:!0}}catch(s){throw console.error("❌ [ERROR] Erreur lors de la protection du joueur:",s),s}}async function RV(n,e=null){try{const t=e?Ue(Ee,"seasons",e,"playerProtection",n):Ue(Ee,"playerProtection",n),r=await Ol(n,e),s=(r==null?void 0:r.email)||"";return await Ln(t,{playerId:n,email:s,isProtected:!1,updatedAt:new Date}),{success:!0,email:s}}catch(t){throw console.error("Erreur lors de la suppression de la protection:",t),t}}async function oo(n,e=null){try{const t=e?Ue(Ee,"seasons",e,"playerProtection",n):Ue(Ee,"playerProtection",n),r=await Ju(t);return r.exists()?r.data().isProtected===!0:!1}catch(t){return console.error("Erreur lors de la vérification de protection:",t),!1}}async function Ol(n,e=null){try{const t=e?Ue(Ee,"seasons",e,"playerProtection",n):Ue(Ee,"playerProtection",n),r=await Ju(t);return r.exists()?r.data():null}catch(t){return console.error("Erreur lors de la récupération des données de protection:",t),null}}async function CV(n,e=null){try{const t=await Ol(n,e);return(t==null?void 0:t.email)||""}catch(t){return console.error("Erreur lors de la récupération de l'email:",t),""}}async function cu(n,e,t=null){try{const r=await Ol(n,t);if(!r||!r.isProtected)return!1;const s=Pb(e),i=r.passwordHash===s;return i&&Ab.saveSession(n,e),i}catch(r){return console.error("Erreur lors de la vérification du mot de passe:",r),!1}}function La(n){return Ab.isPasswordCached(n)}async function Fh(n,e=null){try{console.log("🔍 [DEBUG] Début sendPasswordResetEmail:",{playerId:n,seasonId:e});const t=await Ol(n,e);if(console.log("🔍 [DEBUG] Protection data:",t),!t||!t.isProtected)throw new Error("Joueur non protégé");if(console.log("🔍 [DEBUG] Email à utiliser:",t.email),t.firebaseUid){console.log("🔍 [DEBUG] Utilisation du compte Firebase Auth existant");const{sendPasswordResetEmail:r}=await ir(()=>import("./index.esm-456a655a.js"),[]),{auth:s}=await ir(()=>Promise.resolve().then(()=>Ma),void 0);console.log("🔍 [DEBUG] Tentative d'envoi d'email à:",t.email),await r(s,t.email),console.log("🔍 [DEBUG] Email envoyé avec succès via Firebase Auth!"),console.log("🔍 [DEBUG] Vérifiez votre boîte mail:",t.email)}else{console.log("🔍 [DEBUG] Pas de compte Firebase Auth, création temporaire...");const{createUserWithEmailAndPassword:r,sendPasswordResetEmail:s}=await ir(()=>import("./index.esm-456a655a.js"),[]),{auth:i}=await ir(()=>Promise.resolve().then(()=>Ma),void 0),o=Math.random().toString(36).slice(-8)+"A1!";try{const a=await r(i,t.email,o);console.log("🔍 [DEBUG] Compte temporaire créé:",a.user.uid),await s(i,t.email),console.log("🔍 [DEBUG] Email envoyé avec succès!");const{updateDoc:c}=await ir(()=>import("./index.esm-5b6e403e.js"),[]),{db:u}=await ir(()=>Promise.resolve().then(()=>Ma),void 0),d=e?Ue(u,"seasons",e,"playerProtection",n):Ue(u,"playerProtection",n);await c(d,{firebaseUid:a.user.uid})}catch(a){if(a.code==="auth/email-already-in-use")console.log("🔍 [DEBUG] Email déjà utilisé, tentative d'envoi direct..."),await s(i,t.email),console.log("🔍 [DEBUG] Email envoyé avec succès!");else throw a}}return{success:!0,message:"Email de réinitialisation envoyé ! Vérifiez votre boîte de réception."}}catch(t){throw console.error("❌ [ERROR] Erreur lors de l'envoi de l'email de réinitialisation:",t),console.error("❌ [ERROR] Code d'erreur:",t.code),console.error("❌ [ERROR] Message d'erreur:",t.message),t.code==="auth/user-not-found"?new Error("Aucun compte trouvé avec cette adresse email"):t.code==="auth/too-many-requests"?new Error("Trop de tentatives. Veuillez réessayer plus tard"):t.code==="auth/invalid-email"?new Error("Adresse email invalide"):new Error(`Erreur lors de l'envoi de l'email: ${t.message}`)}}const kV={class:"text-center mb-6"},DV={class:"text-lg text-gray-300"},VV={class:"mb-6"},NV={class:"flex items-center space-x-3"},OV={class:"text-2xl"},MV={class:"font-semibold text-white"},LV={class:"text-sm text-gray-300"},FV={class:"mb-6"},UV={key:0,class:"mt-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-sm text-gray-300 space-y-1"},BV={key:0,class:"mb-6"},jV={class:"space-y-4"},$V=["disabled"],qV={key:0,class:"animate-spin"},zV={key:1},GV={key:1,class:"mb-6"},KV={key:0,class:"space-y-4 mb-4"},HV=["disabled"],WV={key:0,class:"animate-spin"},QV={key:1},JV=["disabled"],YV={key:2,class:"mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"},XV={class:"text-red-300 text-sm"},ZV={key:3,class:"mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"},eN={class:"text-green-300 text-sm"},tN={__name:"PlayerProtectionModal",props:{show:{type:Boolean,default:!1},player:{type:Object,default:null},seasonId:{type:String,default:null}},emits:["close","update"],setup(n,{emit:e}){const t=n,r=e,s=K(!1),i=K(""),o=K(""),a=K(""),c=K(!1),u=K(""),d=K(""),f=K(!1),g=K(!1),_=K(""),k=an(()=>i.value&&o.value&&a.value&&o.value===a.value&&o.value.length>=6&&i.value.includes("@"));async function T(){var M;if((M=t.player)!=null&&M.id&&(s.value=await oo(t.player.id,t.seasonId),!s.value)){const q=await CV(t.player.id,t.seasonId);q&&(i.value=q)}}async function C(){if(k.value){c.value=!0,u.value="",d.value="";try{await xV(t.player.id,i.value,o.value,t.seasonId),d.value="Protection activée avec succès !",s.value=!0,i.value="",o.value="",a.value="",r("update")}catch(M){console.error("Erreur lors de l'activation de la protection:",M),M.message&&M.message.includes("email")?u.value="Cette adresse email est déjà utilisée par un autre joueur.":u.value="Erreur lors de l'activation de la protection. Veuillez réessayer."}finally{c.value=!1}}}function F(){g.value=!0,_.value="",u.value=""}async function j(){if(_.value){c.value=!0,u.value="",d.value="";try{if(!await cu(t.player.id,_.value,t.seasonId)){u.value="Mot de passe incorrect. Veuillez réessayer.";return}const q=await RV(t.player.id,t.seasonId);d.value="Protection désactivée avec succès !",s.value=!1,g.value=!1,_.value="",q.email&&(i.value=q.email),r("update")}catch(M){console.error("Erreur lors de la désactivation de la protection:",M),u.value="Erreur lors de la désactivation de la protection. Veuillez réessayer."}finally{c.value=!1}}}function L(){r("close")}return Yn(()=>t.player,()=>{t.show&&t.player&&T()},{immediate:!0}),Yn(()=>t.show,M=>{M&&t.player&&(o.value="",a.value="",u.value="",d.value="",f.value=!1,g.value=!1,_.value="",T())}),(M,q)=>{var te;return n.show?(W(),Q("div",{key:0,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4",onClick:L},[m("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md",onClick:q[6]||(q[6]=Hn(()=>{},["stop"]))},[m("div",kV,[q[7]||(q[7]=m("div",{class:"w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center"},[m("span",{class:"text-2xl"},"🔒")],-1)),q[8]||(q[8]=m("h2",{class:"text-2xl font-bold text-white mb-2"},"Protection du joueur",-1)),m("p",DV,_e((te=n.player)==null?void 0:te.name),1)]),m("div",VV,[m("div",{class:cr(["flex items-center justify-between p-4 rounded-lg",s.value?"bg-green-500/20 border border-green-500/30":"bg-gray-500/20 border border-gray-500/30"])},[m("div",NV,[m("span",OV,_e(s.value?"🔒":"🔓"),1),m("div",null,[m("div",MV,_e(s.value?"Protégé":"Non protégé"),1),m("div",LV,_e(s.value?"Modifications sécurisées":"Modifications libres"),1)])])],2)]),m("div",FV,[m("button",{onClick:q[0]||(q[0]=x=>f.value=!f.value),class:"w-full p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all duration-200 flex items-center justify-between"},[q[9]||(q[9]=m("h3",{class:"text-sm font-semibold text-blue-300"},"💡 Pourquoi protéger son joueur ?",-1)),m("span",{class:cr(["text-blue-300 transition-transform duration-200",{"rotate-180":f.value}])},"▼",2)]),f.value?(W(),Q("div",UV,q[10]||(q[10]=[m("div",null,[Tr("• "),m("span",{class:"text-blue-300"},"Protection des disponibilités :"),Tr(" Seul vous pouvez modifier vos disponibilités")],-1),m("div",null,[Tr("• "),m("span",{class:"text-blue-300"},"Protection du nom :"),Tr(" Seul vous pouvez changer votre nom de joueur")],-1),m("div",null,[Tr("• "),m("span",{class:"text-blue-300"},"Email requis :"),Tr(" Permet de réinitialiser le mot de passe en cas d'oubli")],-1)]))):Ae("",!0)]),s.value?Ae("",!0):(W(),Q("div",BV,[q[14]||(q[14]=m("h3",{class:"text-lg font-semibold text-white mb-4"},"🔐 Activer la protection",-1)),m("div",jV,[m("div",null,[q[11]||(q[11]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Adresse email",-1)),Et(m("input",{"onUpdate:modelValue":q[1]||(q[1]=x=>i.value=x),type:"email",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"votre@email.com"},null,512),[[Tt,i.value]])]),m("div",null,[q[12]||(q[12]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Mot de passe",-1)),Et(m("input",{"onUpdate:modelValue":q[2]||(q[2]=x=>o.value=x),type:"password",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Mot de passe sécurisé"},null,512),[[Tt,o.value]])]),m("div",null,[q[13]||(q[13]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Confirmer le mot de passe",-1)),Et(m("input",{"onUpdate:modelValue":q[3]||(q[3]=x=>a.value=x),type:"password",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Confirmer le mot de passe"},null,512),[[Tt,a.value]])])]),m("button",{onClick:C,disabled:!k.value||c.value,class:"w-full mt-4 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"},[c.value?(W(),Q("span",qV,"⏳")):(W(),Q("span",zV,"🔒")),m("span",null,_e(c.value?"Activation...":"Activer la protection"),1)],8,$V)])),s.value?(W(),Q("div",GV,[q[17]||(q[17]=m("h3",{class:"text-lg font-semibold text-white mb-4"},"🔓 Désactiver la protection",-1)),q[18]||(q[18]=m("p",{class:"text-sm text-gray-300 mb-4"}," Attention : désactiver la protection supprimera définitivement le mot de passe et l'email associés. ",-1)),g.value?(W(),Q("div",KV,[m("div",null,[q[15]||(q[15]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Mot de passe de confirmation",-1)),Et(m("input",{"onUpdate:modelValue":q[4]||(q[4]=x=>_.value=x),type:"password",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Entrez le mot de passe pour confirmer"},null,512),[[Tt,_.value]])]),m("button",{onClick:j,disabled:!_.value||c.value,class:"w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"},[c.value?(W(),Q("span",WV,"⏳")):(W(),Q("span",QV,"🔓")),m("span",null,_e(c.value?"Désactivation...":"Confirmer la désactivation"),1)],8,HV),m("button",{onClick:q[5]||(q[5]=x=>g.value=!1),class:"w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"}," Annuler ")])):Ae("",!0),g.value?Ae("",!0):(W(),Q("button",{key:1,onClick:F,disabled:c.value,class:"w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"},q[16]||(q[16]=[m("span",null,"🔓",-1),m("span",null,"Désactiver la protection",-1)]),8,JV))])):Ae("",!0),u.value?(W(),Q("div",YV,[m("div",XV,_e(u.value),1)])):Ae("",!0),d.value?(W(),Q("div",ZV,[m("div",eN,_e(d.value),1)])):Ae("",!0),m("div",{class:"flex justify-center"},[m("button",{onClick:L,class:"px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"}," Fermer ")])])])):Ae("",!0)}}},nN={class:"text-center mb-6"},rN={class:"text-lg text-gray-300"},sN={class:"mb-6"},iN={class:"space-y-4"},oN=["disabled"],aN={key:0,class:"animate-spin"},lN={key:1},cN={class:"mb-6 text-center"},uN={key:0,class:"mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"},dN={class:"text-red-300 text-sm"},hN={class:"text-center mb-6"},fN={class:"text-lg text-gray-300"},pN={class:"mb-6"},mN=["disabled"],gN={key:0,class:"animate-spin"},_N={key:1},yN={key:0,class:"mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"},vN={class:"text-red-300 text-sm"},wN={key:1,class:"mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"},bN={class:"text-green-300 text-sm"},IN={class:"flex justify-center"},EN={__name:"PasswordVerificationModal",props:{show:{type:Boolean,default:!1},player:{type:Object,default:null},seasonId:{type:String,default:null}},emits:["close","verified"],setup(n,{emit:e}){const t=n,r=e,s=K(""),i=K(!1),o=K(""),a=K(!1),c=K(""),u=K(""),d=K(null);async function f(){if(s.value){i.value=!0,o.value="";try{const k=await Lh(t.seasonId);if(s.value===k){r("verified",{type:"season_pin"}),_();return}await cu(t.player.id,s.value,t.seasonId)?(r("verified",{type:"player_password"}),_()):o.value="Mot de passe incorrect. Veuillez réessayer."}catch(k){console.error("Erreur lors de la vérification:",k),o.value="Erreur lors de la vérification. Veuillez réessayer."}finally{i.value=!1}}}async function g(){i.value=!0,c.value="",u.value="";try{const k=await Fh(t.player.id,t.seasonId);u.value=k.message||"Email de réinitialisation envoyé ! Vérifiez votre boîte de réception."}catch(k){console.error("Erreur lors de l'envoi de l'email:",k),c.value="Erreur lors de l'envoi de l'email. Veuillez réessayer."}finally{i.value=!1}}function _(){r("close"),s.value="",o.value="",a.value=!1,c.value="",u.value=""}return Yn(()=>t.show,k=>{k&&ni(()=>{d.value&&d.value.focus()})}),(k,T)=>{var C,F;return W(),Q(Rt,null,[n.show?(W(),Q("div",{key:0,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4",onClick:_},[m("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md",onClick:T[2]||(T[2]=Hn(()=>{},["stop"]))},[m("div",nN,[T[6]||(T[6]=m("div",{class:"w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center"},[m("span",{class:"text-2xl"},"🔐")],-1)),T[7]||(T[7]=m("h2",{class:"text-2xl font-bold text-white mb-2"},"Vérification requise",-1)),m("p",rN,_e((C=n.player)==null?void 0:C.name),1),T[8]||(T[8]=m("p",{class:"text-sm text-gray-400 mt-2"},"Ce joueur est protégé par mot de passe",-1))]),m("div",sN,[m("div",iN,[m("div",null,[T[9]||(T[9]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Mot de passe du joueur",-1)),Et(m("input",{"onUpdate:modelValue":T[0]||(T[0]=j=>s.value=j),type:"password",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Entrez le mot de passe",onKeydown:In(f,["enter"]),ref_key:"passwordInput",ref:d},null,544),[[Tt,s.value]])])]),m("button",{onClick:f,disabled:!s.value||i.value,class:"w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"},[i.value?(W(),Q("span",aN,"⏳")):(W(),Q("span",lN,"🔓")),m("span",null,_e(i.value?"Vérification...":"Vérifier"),1)],8,oN)]),m("div",cN,[m("button",{onClick:T[1]||(T[1]=j=>a.value=!0),class:"text-sm text-blue-400 hover:text-blue-300 transition-colors underline"}," Mot de passe oublié ? ")]),o.value?(W(),Q("div",uN,[m("div",dN,_e(o.value),1)])):Ae("",!0),m("div",{class:"flex justify-center"},[m("button",{onClick:_,class:"px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"}," Annuler ")])])])):Ae("",!0),a.value?(W(),Q("div",{key:1,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4",onClick:T[5]||(T[5]=j=>a.value=!1)},[m("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md",onClick:T[4]||(T[4]=Hn(()=>{},["stop"]))},[m("div",hN,[T[10]||(T[10]=m("div",{class:"w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center"},[m("span",{class:"text-2xl"},"📧")],-1)),T[11]||(T[11]=m("h2",{class:"text-2xl font-bold text-white mb-2"},"Mot de passe oublié",-1)),m("p",fN,_e((F=n.player)==null?void 0:F.name),1)]),m("div",pN,[T[12]||(T[12]=m("p",{class:"text-sm text-gray-300 mb-4"}," Un email de réinitialisation sera envoyé à l'adresse associée à ce joueur. ",-1)),m("button",{onClick:g,disabled:i.value,class:"w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"},[i.value?(W(),Q("span",gN,"⏳")):(W(),Q("span",_N,"📧")),m("span",null,_e(i.value?"Envoi...":"Envoyer l'email"),1)],8,mN)]),c.value?(W(),Q("div",yN,[m("div",vN,_e(c.value),1)])):Ae("",!0),u.value?(W(),Q("div",wN,[m("div",bN,_e(u.value),1)])):Ae("",!0),m("div",IN,[m("button",{onClick:T[3]||(T[3]=j=>a.value=!1),class:"px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"}," Fermer ")])])])):Ae("",!0)],64)}}},TN={class:"text-center mb-6"},AN={class:"text-3xl font-bold text-white mb-2"},PN={class:"mb-8"},SN={class:"grid grid-cols-2 gap-4"},xN={class:"bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30"},RN={class:"text-2xl font-bold text-white"},CN={class:"bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-lg border border-cyan-500/30"},kN={class:"text-2xl font-bold text-white"},DN={class:"mt-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30"},VN={class:"text-xl font-bold text-white"},NN={class:"flex justify-center space-x-3"},ON={key:1,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[90] p-4"},MN={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},LN={class:"mb-6"},FN={__name:"PlayerModal",props:{show:{type:Boolean,default:!1},player:{type:Object,default:null},stats:{type:Object,default:()=>({availability:0,selection:0,ratio:0})},seasonId:{type:String,default:null}},emits:["close","update","delete","refresh"],setup(n,{emit:e}){const t=n,r=e,s=K(!1),i=K(""),o=K(null),a=K(!1),c=K(!1),u=K(null);function d(){r("close")}function f(){var L;i.value=((L=t.player)==null?void 0:L.name)||"",s.value=!0,ni(()=>{o.value&&o.value.focus()})}function g(){s.value=!1,i.value=""}async function _(){var M,q;if(!i.value.trim())return;if(await oo((M=t.player)==null?void 0:M.id,t.seasonId)){La((q=t.player)==null?void 0:q.id)?k():(u.value="update",c.value=!0);return}k()}function k(){var L;r("update",{playerId:(L=t.player)==null?void 0:L.id,newName:i.value.trim()}),s.value=!1,i.value=""}async function T(){var M,q;if(await oo((M=t.player)==null?void 0:M.id,t.seasonId)){La((q=t.player)==null?void 0:q.id)?C():(u.value="delete",c.value=!0);return}C()}function C(){var L;r("delete",(L=t.player)==null?void 0:L.id)}function F(){r("refresh")}function j(L){u.value==="update"?k():u.value==="delete"&&C(),u.value=null}return Yn(()=>t.show,L=>{L||(s.value=!1,i.value="",u.value=null)}),(L,M)=>{var q;return W(),Q(Rt,null,[n.show?(W(),Q("div",{key:0,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4",onClick:d},[m("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-2xl",onClick:M[1]||(M[1]=Hn(()=>{},["stop"]))},[m("div",TN,[M[5]||(M[5]=m("div",{class:"w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center"},[m("span",{class:"text-3xl"},"👤")],-1)),m("h2",AN,_e((q=n.player)==null?void 0:q.name),1),M[6]||(M[6]=m("p",{class:"text-xl text-purple-300"},"Détails du joueur",-1))]),m("div",PN,[M[10]||(M[10]=m("h3",{class:"text-lg font-semibold text-white mb-4"},"📊 Statistiques",-1)),m("div",SN,[m("div",xN,[m("div",RN,_e(t.stats.availability),1),M[7]||(M[7]=m("div",{class:"text-sm text-gray-300"},"Disponibilités",-1))]),m("div",CN,[m("div",kN,_e(t.stats.selection),1),M[8]||(M[8]=m("div",{class:"text-sm text-gray-300"},"Sélections",-1))])]),m("div",DN,[m("div",VN,_e(t.stats.ratio)+"%",1),M[9]||(M[9]=m("div",{class:"text-sm text-gray-300"},"Taux de sélection",-1))])]),m("div",NN,[m("button",{onClick:f,class:"px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center space-x-2"},M[11]||(M[11]=[m("span",null,"✏️",-1),m("span",null,"Modifier",-1)])),m("button",{onClick:M[0]||(M[0]=te=>a.value=!0),class:"px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 flex items-center space-x-2"},M[12]||(M[12]=[m("span",null,"🔒",-1),m("span",null,"Protection",-1)])),m("button",{onClick:T,class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center space-x-2"},M[13]||(M[13]=[m("span",null,"🗑️",-1),m("span",null,"Supprimer",-1)])),m("button",{onClick:d,class:"px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"}," Fermer ")])])])):Ae("",!0),s.value?(W(),Q("div",ON,[m("div",MN,[M[15]||(M[15]=m("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✏️ Modifier le joueur",-1)),m("div",LN,[M[14]||(M[14]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nom",-1)),Et(m("input",{"onUpdate:modelValue":M[2]||(M[2]=te=>i.value=te),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",onKeydown:[In(g,["esc"]),In(_,["enter"])],ref_key:"editNameInput",ref:o},null,544),[[Tt,i.value]])]),m("div",{class:"flex justify-end space-x-3"},[m("button",{onClick:g,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),m("button",{onClick:_,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"}," Sauvegarder ")])])])):Ae("",!0),Bt(tN,{show:a.value,player:n.player,seasonId:n.seasonId,onClose:M[3]||(M[3]=te=>a.value=!1),onUpdate:F},null,8,["show","player","seasonId"]),Bt(EN,{show:c.value,player:n.player,seasonId:n.seasonId,onClose:M[4]||(M[4]=te=>c.value=!1),onVerified:j},null,8,["show","player","seasonId"])],64)}}},UN={class:"text-center mb-6"},BN={class:"text-3xl font-bold text-white mb-2"},jN={class:"text-xl text-purple-300"},$N={class:"mb-6"},qN={class:"grid grid-cols-3 gap-4"},zN={class:"bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30"},GN={class:"text-2xl font-bold text-white"},KN={class:"bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30"},HN={class:"text-2xl font-bold text-white"},WN={class:"bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-lg border border-cyan-500/30"},QN={class:"text-2xl font-bold text-white"},JN={key:0,class:"mb-6"},YN={class:"flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20"},XN={class:"flex-1"},ZN={class:"text-blue-300 text-sm font-medium"},eO={key:1,class:"mb-6"},tO={class:"flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20"},nO={class:"flex-1"},rO={class:"text-yellow-200 text-sm"},sO={key:2,class:"mb-6"},iO={class:"grid grid-cols-2 md:grid-cols-3 gap-3 mb-4"},oO={class:"text-white font-medium"},aO={key:0,class:"text-purple-400 mr-2"},lO={key:1,class:"text-green-400 mr-2"},cO={key:2,class:"text-red-400 mr-2"},uO={key:3,class:"text-gray-400 mr-2"},dO={class:"mb-4"},hO={class:"relative"},fO=["value"],pO=["title"],mO={key:0,class:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},gO={key:1,class:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},_O={key:3,class:"mb-6"},yO={class:"text-center p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20"},vO={class:"text-4xl mb-4"},wO={class:"text-xl font-semibold text-white mb-2"},bO={class:"text-gray-300"},IO={class:"flex justify-center space-x-3"},EO=["disabled","title"],TO={__name:"SelectionModal",props:{show:{type:Boolean,default:!1},event:{type:Object,default:null},currentSelection:{type:Array,default:()=>[]},availableCount:{type:Number,default:0},selectedCount:{type:Number,default:0},playerAvailability:{type:Object,default:()=>({})}},emits:["close","selection","perfect"],setup(n,{expose:e,emit:t}){const r=n,s=t,i=K(!1),o=K("Copier le message"),a=K(!1),c=K(""),u=K(!1),d=an(()=>r.currentSelection&&r.currentSelection.length>0),f=an(()=>{var ke;if(!d.value)return!1;const w=r.currentSelection.some(ct=>!L(ct)),P=((ke=r.event)==null?void 0:ke.playerCount)||6,I=r.availableCount<P;return w||I}),g=an(()=>{var I;if(!f.value)return"";const w=r.currentSelection.filter(ke=>!L(ke)),P=((I=r.event)==null?void 0:I.playerCount)||6;return w.length>0?w.length===1?`${w[0]} n'est plus disponible. Veuillez relancer la sélection.`:`${w.length} joueurs ne sont plus disponibles. Veuillez relancer la sélection.`:r.availableCount<P?`Seulement ${r.availableCount} joueurs disponibles pour ${P} requis. Veuillez attendre plus de disponibilités ou ajuster le nombre de joueurs à sélectionner.`:"Sélection incomplète"}),_=an(()=>{if(!r.event||!d.value)return"";const w=k(r.event.date),P=r.currentSelection.join(", ");return`Sélection pour ${r.event.title} du ${w} : ${P}`});Yn(()=>r.show,w=>{w&&(i.value=!1,o.value="Copier le message",a.value=!1,c.value="",u.value=!1)});function k(w){var I;return w?(typeof w=="string"?new Date(w):((I=w.toDate)==null?void 0:I.call(w))||w).toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"}):""}function T(){const w=_.value;navigator.clipboard.writeText(w).then(()=>{i.value=!0,o.value="Copié !",setTimeout(()=>{i.value=!1,o.value="Copier le message"},2e3)}).catch(P=>{console.error("Erreur lors de la copie du texte:",P),alert("Impossible de copier le message.")})}function C(){s("selection")}function F(){s("perfect")}function j(){s("close")}function L(w){return r.playerAvailability[w]===!0}function M(w){return r.playerAvailability[w]===!1}function q(w){return r.currentSelection.includes(w)&&L(w)}function te(){var P;const w=((P=r.event)==null?void 0:P.playerCount)||6;return r.availableCount===0||r.availableCount<w?"⚠️":"🎲"}function x(){var P;const w=((P=r.event)==null?void 0:P.playerCount)||6;return r.availableCount===0?"Aucun joueur disponible":r.availableCount<w?"Pas assez de joueurs disponibles":"Aucune sélection effectuée"}function E(){var P;const w=((P=r.event)==null?void 0:P.playerCount)||6;return r.availableCount===0?"Aucun joueur n'est disponible pour cet événement. Veuillez d'abord indiquer les disponibilités.":r.availableCount<w?`Seulement ${r.availableCount} joueurs disponibles pour ${w} requis. Veuillez attendre plus de disponibilités ou ajuster le nombre de joueurs à sélectionner.`:'Cliquez sur "Sélection Auto" pour lancer le tirage automatique des joueurs'}function S(w=!1,P=!1){if(u.value=w,w){const I=k(r.event.date),ke=r.currentSelection.join(", ");P?c.value=`Sélection mise à jour pour ${r.event.title} du ${I} : ${ke}`:c.value=`Nouvelle sélection pour ${r.event.title} du ${I} : ${ke}`}else c.value="Sélection effectuée avec succès !";a.value=!0,setTimeout(()=>{a.value=!1},8e3)}function R(){a.value=!1}return e({showSuccess:S}),(w,P)=>{var I,ke,ct;return n.show?(W(),Q("div",{key:0,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4",onClick:j},[m("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-2xl",onClick:P[0]||(P[0]=Hn(()=>{},["stop"]))},[m("div",UN,[P[1]||(P[1]=m("div",{class:"w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center"},[m("span",{class:"text-3xl"},"🎭")],-1)),m("h2",BN,"Sélection pour "+_e((I=n.event)==null?void 0:I.title),1),m("p",jN,_e(k((ke=n.event)==null?void 0:ke.date)),1)]),m("div",$N,[m("div",qN,[m("div",zN,[m("div",GN,_e(((ct=n.event)==null?void 0:ct.playerCount)||6),1),P[2]||(P[2]=m("div",{class:"text-sm text-gray-300"},"À sélectionner",-1))]),m("div",KN,[m("div",HN,_e(n.availableCount),1),P[3]||(P[3]=m("div",{class:"text-sm text-gray-300"},"Disponibles",-1))]),m("div",WN,[m("div",QN,_e(n.selectedCount),1),P[4]||(P[4]=m("div",{class:"text-sm text-gray-300"},"Sélectionnés",-1))])])]),a.value?(W(),Q("div",JN,[m("div",YN,[P[6]||(P[6]=m("div",{class:"text-blue-400 text-xl"},"✨",-1)),m("div",XN,[m("p",ZN,_e(c.value),1)]),m("button",{onClick:R,class:"text-blue-400 hover:text-blue-300 transition-colors",title:"Fermer le message"},P[5]||(P[5]=[m("svg",{class:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[m("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M6 18L18 6M6 6l12 12"})],-1)]))])])):Ae("",!0),f.value?(W(),Q("div",eO,[m("div",tO,[P[8]||(P[8]=m("div",{class:"text-yellow-400 text-xl"},"⚠️",-1)),m("div",nO,[P[7]||(P[7]=m("h3",{class:"text-yellow-300 text-sm font-semibold mb-1"},"Sélection incomplète",-1)),m("p",rO,_e(g.value),1)])])])):Ae("",!0),d.value?(W(),Q("div",sO,[P[12]||(P[12]=m("h3",{class:"text-lg font-semibold text-white mb-3"},"Joueurs sélectionnés :",-1)),m("div",iO,[(W(!0),Q(Rt,null,rr(n.currentSelection,He=>(W(),Q("div",{key:He,class:cr(["bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 rounded-lg border border-green-500/30 text-center",{"from-red-500/20 to-red-600/20 border-red-500/30":!L(He),"from-yellow-500/20 to-orange-500/20 border-yellow-500/30":M(He)}])},[m("span",oO,[q(He)?(W(),Q("span",aO,"🎭")):L(He)?(W(),Q("span",lO,"✅")):M(He)?(W(),Q("span",cO,"❌")):(W(),Q("span",uO,"–")),Tr(" "+_e(He),1)])],2))),128))]),m("div",dO,[P[11]||(P[11]=m("h4",{class:"text-md font-semibold text-white mb-2"},"Message à envoyer :",-1)),m("div",hO,[m("textarea",{value:_.value,class:"w-full p-4 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none",rows:"3",readonly:""},null,8,fO),m("button",{onClick:T,class:"absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-2 hover:from-purple-600 hover:to-pink-700 transition-all duration-300",title:o.value},[i.value?(W(),Q("svg",gO,P[10]||(P[10]=[m("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M5 13l4 4L19 7"},null,-1)]))):(W(),Q("svg",mO,P[9]||(P[9]=[m("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"},null,-1)])))],8,pO)])])])):(W(),Q("div",_O,[m("div",yO,[m("div",vO,_e(te()),1),m("h3",wO,_e(x()),1),m("p",bO,_e(E()),1)])])),m("div",IO,[m("button",{onClick:C,disabled:n.availableCount===0,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed",title:n.availableCount===0?"Aucun joueur disponible":d.value?"Relancer la sélection automatique":"Lancer la sélection automatique"},P[13]||(P[13]=[m("span",null,"✨",-1),m("span",null,"Sélection Auto",-1)]),8,EO),d.value?(W(),Q("button",{key:0,onClick:F,class:"px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2"},P[14]||(P[14]=[m("span",null,"👍",-1),m("span",null,"Parfait",-1)]))):Ae("",!0)])])])):Ae("",!0)}}};const AO={class:"min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"},PO={class:"text-center py-8 px-4 relative"},SO={class:"text-4xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"},xO={class:"container mx-auto px-4 pb-16"},RO={class:"sticky top-0 z-50 backdrop-blur-sm bg-black/20 border border-white/20 rounded-t-2xl overflow-hidden"},CO={class:"border-collapse w-full table-fixed"},kO={class:"text-white"},DO={class:"p-4 text-left"},VO={class:"flex flex-col items-center space-y-2"},NO=["onClick"],OO={class:"flex flex-col gap-3"},MO={class:"flex flex-col items-center space-y-2"},LO={class:"font-bold text-lg text-center whitespace-pre-wrap relative group cursor-pointer"},FO=["title"],UO=["title","onClick"],BO=["title","onClick"],jO={class:"bg-black/10"},$O={class:"overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-b-2xl"},qO={class:"table-auto border-collapse w-full table-fixed"},zO=["data-player-id"],GO={class:"p-4 font-medium text-white w-[100px] relative group text-lg"},KO={class:"font-bold text-lg whitespace-pre-wrap flex items-center"},HO={key:0,class:"text-yellow-400 mr-1 text-sm",title:"Joueur protégé par mot de passe"},WO=["onClick","title"],QO=["onClick"],JO={class:"flex items-center justify-center"},YO=["title"],XO=["title"],ZO=["title"],e2=["title"],t2={key:0,class:"fixed bottom-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-2xl border border-green-400/30 backdrop-blur-sm z-50"},n2={class:"flex items-center space-x-2"},r2={key:1,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"},s2={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},i2={class:"mb-6"},o2={class:"mb-6"},a2={class:"mb-6"},l2={class:"mb-6"},c2={key:2,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"},u2={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},d2={class:"mb-6"},h2={class:"flex justify-end space-x-3"},f2={key:3,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"},p2={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},m2={class:"flex justify-end space-x-3"},g2={key:4,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"},_2={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},y2={class:"flex justify-end space-x-3"},v2={key:5,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[95] p-4"},w2={class:"text-center mb-6"},b2={class:"text-3xl font-bold text-white mb-2"},I2={class:"text-xl text-purple-300"},E2={key:0,class:"mb-6"},T2={class:"text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-600/50"},A2={class:"mb-6"},P2={class:"grid grid-cols-3 gap-4"},S2={class:"bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30"},x2={class:"text-2xl font-bold text-white"},R2={class:"bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-lg border border-cyan-500/30"},C2={class:"text-2xl font-bold text-white"},k2={class:"bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30"},D2={class:"text-2xl font-bold text-white"},V2={class:"flex justify-center space-x-3"},N2={key:7,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[90] p-4"},O2={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},M2={class:"mb-6"},L2={class:"mb-6"},F2={class:"mb-6"},U2={class:"mb-6"},B2={key:8,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4"},j2={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},$2={class:"mb-6"},q2={class:"space-y-4"},z2=["disabled"],G2={key:0,class:"animate-spin"},K2={key:1},H2={class:"mb-6 text-center"},W2={key:0,class:"mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"},Q2={class:"text-red-300 text-sm"},J2={key:9,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[110] p-4"},Y2={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},X2={class:"mb-6"},Z2={class:"space-y-4"},eM=["disabled"],tM={key:0,class:"animate-spin"},nM={key:1},rM={class:"mb-6 text-center"},sM={key:0,class:"mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"},iM={class:"text-red-300 text-sm"},oM={class:"mb-6"},aM=["disabled"],lM={key:0,class:"animate-spin"},cM={key:1},uM={key:0,class:"mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"},dM={class:"text-red-300 text-sm"},hM={key:1,class:"mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"},fM={class:"text-green-300 text-sm"},pM={class:"flex justify-center"},mM={class:"mb-6"},gM=["disabled"],_M={key:0,class:"animate-spin"},yM={key:1},vM={key:0,class:"mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"},wM={class:"text-red-300 text-sm"},bM={key:1,class:"mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"},IM={class:"text-green-300 text-sm"},EM={class:"flex justify-center"},TM={__name:"GridBoard",props:{slug:{type:String,required:!0}},setup(n){const e=n,t=sf();e.slug;const r=K(""),s=K(""),i=K(!1),o=K(null),a=K(null),c=K(""),u=K(""),d=K(6),f=K(!1),g=K(""),_=K(null),k=K(!1),T=K(null),C=K(!1),F=K(null),j=K(!1),L=K(null),M=K(""),q=K(!1),te=K(null),x=K(""),E=K(""),S=K(!1),R=K(null),w=K(!1),P=K(null),I=K(""),ke=K(""),ct=K(!1),He=K(null),Le=K(!1),De=K(!1),Kt=K(""),un=K(""),Zt=K(!1),tt=K(!1),ot=K(""),Nn=K(""),en=K(!1),Qe=K(null),$=K(""),ce=K(!1),ee=K(null),fe=K(null),Fe=K(new Set);function Je(D){_.value=D;const v=document.querySelector(`[data-player-id="${D}"]`);v&&v.scrollIntoView({behavior:"smooth",block:"center"}),V.value=!0,G.value="Nouveau joueur ajouté !",setTimeout(()=>{V.value=!1},3e3)}function b(D){return Fe.value.has(D)}async function A(){if(!s.value)return;const D=new Set;for(const v of Ve.value)await oo(v.id,s.value)&&D.add(v.id);Fe.value=D}const V=K(!1),G=K("");async function z(D){await _r({type:"deleteEvent",data:{eventId:D}})}async function Z(D=null){const v=D||o.value;if(console.log("deleteEventConfirmed - eventId param:",D),console.log("deleteEventConfirmed - eventToDelete.value:",o.value),console.log("deleteEventConfirmed - eventIdToDelete:",v),console.log("deleteEventConfirmed - type de eventIdToDelete:",typeof v),!v){console.error("Aucun événement à supprimer");return}try{await IV(v,s.value),Oe.value=Oe.value.filter(H=>H.id!==v),await Promise.all([R_(s.value),da(Ve.value,Oe.value,s.value),ha(s.value)]).then(([H,de,Te])=>{Oe.value=H,at.value=de,nt.value=Te}),i.value=!1,o.value=null,V.value=!0,G.value="Événement supprimé avec succès !",setTimeout(()=>{V.value=!1},3e3)}catch(H){console.error("Erreur lors de la suppression de l'événement:",H),alert("Erreur lors de la suppression de l'événement. Veuillez réessayer.")}}function ue(){i.value=!1,o.value=null}async function se(){if(!a.value||!c.value.trim()||!u.value)return;const D=parseInt(d.value);if(isNaN(D)||D<1||D>20){alert("Le nombre de joueurs doit être un nombre entier entre 1 et 20");return}try{const v={title:c.value.trim(),date:u.value,description:$.value.trim()||"",playerCount:D};await TV(a.value,v,s.value),await Promise.all([R_(s.value),da(Ve.value,Oe.value,s.value),ha(s.value)]).then(([H,de,Te])=>{Oe.value=H,at.value=de,nt.value=Te}),a.value=null,c.value="",u.value="",$.value="",d.value=6,V.value=!0,G.value="Événement mis à jour avec succès !",setTimeout(()=>{V.value=!1},3e3)}catch(v){console.error("Erreur lors de l'édition de l'événement:",v),alert("Erreur lors de l'édition de l'événement. Veuillez réessayer.")}}async function ne(){if(g.value.trim())try{const D=g.value.trim(),v=await yV(D,s.value);await Promise.all([Hd(s.value),da(Ve.value,Oe.value,s.value),ha(s.value)]).then(([H,de,Te])=>{Ve.value=H,at.value=de,nt.value=Te,A();const $e=Ve.value.find(Ye=>Ye.id===v);Je(v);const Se=document.querySelector(`[data-player-id="${v}"]`);Se&&Se.scrollIntoView({behavior:"smooth",block:"center"}),V.value=!0,G.value="Joueur ajouté avec succès ! Vous pouvez maintenant indiquer sa disponibilité.",setTimeout(()=>{V.value=!1},3e3),setTimeout(()=>{V.value=!1,G.value=""},5e3)}),f.value=!1,g.value=""}catch(D){console.error("Erreur lors de l'ajout du joueur:",D),alert("Erreur lors de l'ajout du joueur. Veuillez réessayer.")}}function X(){a.value=null,c.value="",u.value="",$.value="",d.value=6}K(null);const ye=K(!1),oe=K(""),me=K(""),Ie=K(""),be=K(6);async function Re(){if(!oe.value.trim()||!me.value){alert("Veuillez remplir le titre et la date de l'événement");return}const D=parseInt(be.value);if(isNaN(D)||D<1||D>20){alert("Le nombre de joueurs doit être un nombre entier entre 1 et 20");return}const v={title:oe.value.trim(),date:me.value,description:Ie.value.trim()||"",playerCount:D};await je(v)}async function je(D){try{const v=await EV(D,s.value);Oe.value=[...Oe.value,{id:v,...D}];const H={};for(const de of Ve.value)H[de.name]=at.value[de.name]||{},H[de.name][v]=null,await C_(de.name,H[de.name],s.value);oe.value="",me.value="",Ie.value="",be.value=6,ye.value=!1,await Promise.resolve(),V.value=!0,G.value="Événement créé avec succès !",setTimeout(()=>{V.value=!1},3e3)}catch(v){console.error("Erreur lors de la création de l'événement:",v),alert("Erreur lors de la création de l'événement. Veuillez réessayer.")}}function $t(){oe.value="",me.value="",Ie.value="",be.value=6,ye.value=!1}async function Dt(){await _r({type:"addEvent",data:{}})}const Oe=K([]),Ve=K([]),at=K({}),nt=K({}),qt=K({}),wn=K({});vu(async()=>{mV("firebase"),await _V();const D=Tw(st(Ee,"seasons"),iC("slug","==",e.slug)),v=await At(D);if(!v.empty){const H=v.docs[0];s.value=H.id,r.value=H.data().name,document.title=`Saison : ${r.value}`}if(s.value){const H=await At(st(Ee,"seasons",s.value,"players"));Ve.value=H.docs.map(rt=>({id:rt.id,...rt.data()})),await A();const de=await At(st(Ee,"seasons",s.value,"events"));Oe.value=de.docs.map(rt=>({id:rt.id,...rt.data(),playerCount:rt.data().playerCount||6}));const Te=await At(st(Ee,"seasons",s.value,"availability")),$e={};Te.docs.forEach(rt=>{const nn=rt.data(),Vt={};Object.keys(nn).forEach(yt=>{const ie=nn[yt];ie==="oui"?Vt[yt]=!0:ie==="non"?Vt[yt]=!1:Vt[yt]=ie}),$e[rt.id]=Vt}),at.value=$e;const Se=await At(st(Ee,"seasons",s.value,"selections")),Ye={};Se.docs.forEach(rt=>{Ye[rt.id]=rt.data().players||[]}),nt.value=Ye}zo(),Jr(),console.log("players (deduplicated):",Ve.value.map(H=>({id:H.id,name:H.name}))),console.log("availability loaded:",at.value)});async function Ii(D,v){const H=Ve.value.find($e=>$e.name===D);if(!H){console.error("Joueur non trouvé:",D);return}if(!Oe.value.find($e=>$e.id===v)){console.error("Événement non trouvé:",v);return}if(await oo(H.id,s.value)){La(H.id)?Ms(H,v):await Fl({type:"toggleAvailability",data:{player:H,eventId:v}});return}Ms(H,v)}function Ms(D,v){var Te;const H=(Te=at.value[D.name])==null?void 0:Te[v];console.log(`toggleAvailability - ${D.name} pour ${v}:`,H);let de;H===!0?de=!1:H===!1?de=void 0:de=!0,de===void 0?at.value[D.name]&&delete at.value[D.name][v]:(at.value[D.name]||(at.value[D.name]={}),at.value[D.name][v]=de),C_(D.name,at.value[D.name],s.value).then(()=>{V.value=!0,G.value="Disponibilité mise à jour avec succès !",setTimeout(()=>{V.value=!1},3e3)}).catch($e=>{console.error("Erreur lors de la mise à jour de la disponibilité:",$e),alert("Erreur lors de la mise à jour de la disponibilité. Veuillez réessayer.")})}function Pn(D,v){var H;return(H=at.value[D])==null?void 0:H[v]}function $o(D,v){var Te;const H=nt.value[v]||[],de=(Te=at.value[D])==null?void 0:Te[v];return H.includes(D)&&de===!0}async function Ls(D,v=6){const H=Oe.value.find(Se=>Se.id===D),de=(H==null?void 0:H.playerCount)||6,Te=nt.value[D]||[];if(Te.length>0&&Te.every(Se=>Pn(Se,D))){console.log("Tous les joueurs sélectionnés sont disponibles, nouveau tirage complet");const Ye=Ve.value.filter(Vt=>Pn(Vt.name,D)).map(Vt=>{const yt=gr(Vt.name);return{name:Vt.name,weight:1/(1+yt)}}),rt=[],nn=[...Ye];for(;rt.length<de&&nn.length>0;){const Vt=nn.reduce((Me,Ht)=>Me+Ht.weight,0);let yt=Math.random()*Vt;const ie=nn.findIndex(Me=>(yt-=Me.weight,yt<=0));ie>=0&&(rt.push(nn[ie].name),nn.splice(ie,1))}nt.value[D]=rt}else{const Se=Te.filter(rt=>Pn(rt,D)),Ye=de-Se.length;if(Ye<=0)nt.value[D]=Se;else{const rt=new Set(Se),Vt=Ve.value.filter(Me=>Pn(Me.name,D)&&!rt.has(Me.name)).map(Me=>{const Ht=gr(Me.name);return{name:Me.name,weight:1/(1+Ht)}}),yt=[],ie=[...Vt];for(;yt.length<Ye&&ie.length>0;){const Me=ie.reduce((Di,Wl)=>Di+Wl.weight,0);let Ht=Math.random()*Me;const ki=ie.findIndex(Di=>(Ht-=Di.weight,Ht<=0));ki>=0&&(yt.push(ie[ki].name),ie.splice(ki,1))}nt.value[D]=[...Se,...yt]}}await bV(D,nt.value[D],s.value),zo(),Jr()}async function Ei(D,v=6){var Se,Ye,rt,nn,Vt;console.log("tirerProtected appelé avec eventId:",D),console.log("showSelectionModal.value AVANT:",ce.value),console.log("selectionModalEvent.value?.id AVANT:",(Se=ee.value)==null?void 0:Se.id);const H=ce.value,de=(Ye=ee.value)==null?void 0:Ye.id,Te=nt.value[D]&&nt.value[D].length>0,$e=Te?[...nt.value[D]]:[];if(await Ls(D,v),console.log("showSelectionModal.value APRÈS tirage:",ce.value),console.log("selectionModalEvent.value?.id APRÈS tirage:",(rt=ee.value)==null?void 0:rt.id),H&&!ce.value&&(console.log("Restauration de la popin de sélection..."),ce.value=!0,ee.value=Oe.value.find(yt=>yt.id===de)),ce.value&&((nn=ee.value)==null?void 0:nn.id)===D)if(console.log("Popin de sélection ouverte, mise à jour..."),await ni(),fe.value&&fe.value.showSuccess){console.log("Appel de showSuccess sur la popin de sélection");const yt=nt.value[D]||[],ie=$e.filter(Ht=>yt.includes(Ht)),Me=ie.length>0&&ie.length<$e.length;fe.value.showSuccess(Te,Me)}else console.log("selectionModalRef.value:",fe.value),console.log("showSuccess disponible:",(Vt=fe.value)==null?void 0:Vt.showSuccess);else console.log("Popin de sélection fermée, affichage message global"),V.value=!0,Oe.value.find(yt=>yt.id===D),nt.value[D],Te?G.value="Sélection mise à jour avec succès !":G.value="Sélection effectuée avec succès !",setTimeout(()=>{V.value=!1},3e3)}function qo(D){var H;return D?(typeof D=="string"?new Date(D):((H=D.toDate)==null?void 0:H.call(D))||D).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}):""}function mr(D){var H;return D?(typeof D=="string"?new Date(D):((H=D.toDate)==null?void 0:H.call(D))||D).toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"}):""}function gr(D){return Object.values(nt.value).filter(v=>v.includes(D)).length}function Wr(D){const v=at.value[D]||{};return Object.values(v).filter(H=>H===!0).length}function Fs(D){return D?Object.values(at.value).filter(v=>v[D]===!0).length:0}function Qr(D){return D?(nt.value[D]||[]).length:0}function Ml(D){const v=Wr(D),H=gr(D);return v===0?0:H/v}function tn(D){qt.value[D]={availability:Wr(D),selection:gr(D),ratio:Ml(D)}}function zo(){Ve.value.forEach(D=>tn(D.name))}function Jr(){const D={};Oe.value.forEach(v=>{const H=v.playerCount||6,Te=Ve.value.filter(Se=>Pn(Se.name,v.id)===!0).map(Se=>{const Ye=gr(Se.name);return{name:Se.name,weight:1/(1+Ye)}}),$e=Te.reduce((Se,Ye)=>Se+Ye.weight,0);Te.forEach(Se=>{const Ye=Math.min(1,Se.weight/$e*H);D[Se.name]||(D[Se.name]={}),D[Se.name][v.id]=Math.round(Ye*100)})}),wn.value=D}function Zn(D,v){var Se,Ye;const H=D.name,de=Pn(H,v),Te=$o(H,v),$e=((Ye=(Se=wn.value)==null?void 0:Se[H])==null?void 0:Ye[v])??0;return de===!1?"Non disponible – cliquez pour changer":Te?`Sélectionné · Chance estimée : ${$e}%`:de===!0?`Disponible · Chance estimée : ${$e}%`:"Cliquez pour indiquer votre disponibilité"}const Ti=K(null),Ai=K(!1);async function Yr(D=null){const v=D||Ti.value;if(!v){console.error("Aucun joueur à supprimer");return}try{await vV(v,s.value),Ve.value=Ve.value.filter(H=>H.id!==v),Ai.value=!1,Ti.value=null,V.value=!0,G.value="Joueur supprimé avec succès !",setTimeout(()=>{V.value=!1},3e3)}catch(H){console.error("Erreur lors de la suppression du joueur :",H),alert("Erreur lors de la suppression du joueur. Veuillez réessayer.")}}function id(){Ai.value=!1,Ti.value=null}async function od(D){Jo(),await oo(D,s.value)?await er({type:"deletePlayer",data:{playerId:D}}):await _r({type:"deletePlayer",data:{playerId:D}})}async function Pi(){if(T.value){const D=Oe.value.find(H=>H.id===T.value),v=(D==null?void 0:D.playerCount)||6;await Ei(T.value,v),k.value=!1,T.value=null}}function Ll(){k.value=!1,T.value=null}function Go(){return L.value?{deleteEvent:"Suppression d'événement - Code PIN requis",addEvent:"Ajout d'événement - Code PIN requis",deletePlayer:"Suppression de joueur - Code PIN requis",launchSelection:"Lancement de sélection - Code PIN requis"}[L.value.type]||"Code PIN requis":"Veuillez saisir le code PIN à 4 chiffres"}async function _r(D){if(Rn.isPinCached(s.value)){const v=Rn.getCachedPin(s.value);if(console.log("PIN en cache trouvé, utilisation automatique"),await lu(s.value,v)){await Sn(D);return}else Rn.clearSession()}L.value=D,j.value=!0}async function er(D){const v=D.data.playerId;if(La(v)){console.log("Mot de passe du joueur en cache trouvé, utilisation automatique"),await Sn(D);return}te.value=D,q.value=!0}async function Fl(D){const v=D.data.player.id;if(La(v)){console.log("Mot de passe du joueur en cache trouvé, utilisation automatique"),await Sn(D);return}P.value=D,w.value=!0}async function Ul(D){try{if(await lu(s.value,D)){Rn.saveSession(s.value,D),j.value=!1;const H=L.value;L.value=null,await Sn(H)}else M.value="Code PIN incorrect",setTimeout(()=>{M.value=""},3e3)}catch(v){console.error("Erreur lors de la vérification du PIN:",v),M.value="Erreur lors de la vérification du code PIN"}}function Ko(){j.value=!1,L.value=null,M.value=""}async function Si(D){if(D){S.value=!0,x.value="";try{const v=te.value.data.playerId,H=await Lh(s.value);if(D===H){q.value=!1;const Te=te.value;te.value=null,E.value="",await Sn(Te);return}if(await cu(v,D,s.value)){q.value=!1;const Te=te.value;te.value=null,E.value="",await Sn(Te)}else x.value="Mot de passe incorrect",setTimeout(()=>{x.value=""},3e3)}catch(v){console.error("Erreur lors de la vérification du mot de passe:",v),x.value="Erreur lors de la vérification du mot de passe"}finally{S.value=!1}}}function Bl(){q.value=!1,te.value=null,x.value="",E.value="",S.value=!1}async function Ho(D){if(D){ct.value=!0,I.value="";try{const v=P.value.data.player,H=await Lh(s.value);if(D===H){w.value=!1;const Te=P.value;P.value=null,ke.value="",await Sn(Te);return}if(await cu(v.id,D,s.value)){w.value=!1;const Te=P.value;P.value=null,ke.value="",await Sn(Te)}else I.value="Mot de passe incorrect",setTimeout(()=>{I.value=""},3e3)}catch(v){console.error("Erreur lors de la vérification du mot de passe:",v),I.value="Erreur lors de la vérification du mot de passe"}finally{ct.value=!1}}}function ad(){w.value=!1,P.value=null,I.value="",ke.value="",ct.value=!1}async function xi(){De.value=!0,Kt.value="",un.value="";try{const D=P.value.data.player,v=await Fh(D.id,s.value);un.value=v.message||"Email de réinitialisation envoyé ! Vérifiez votre boîte de réception."}catch(D){console.error("Erreur lors de l'envoi de l'email:",D),Kt.value="Erreur lors de l'envoi de l'email. Veuillez réessayer."}finally{De.value=!1}}async function jl(){tt.value=!0,ot.value="",Nn.value="";try{const D=te.value.data.playerId,v=await Fh(D,s.value);Nn.value=v.message||"Email de réinitialisation envoyé ! Vérifiez votre boîte de réception."}catch(D){console.error("Erreur lors de l'envoi de l'email:",D),ot.value="Erreur lors de l'envoi de l'email. Veuillez réessayer."}finally{tt.value=!1}}function Wo(){return Rn.isPinCached(s.value)?{timeRemaining:Rn.getTimeRemaining(),isExpiringSoon:Rn.isExpiringSoon()}:null}async function Sn(D){if(!D)return;const{type:v,data:H}=D;try{switch(v){case"deleteEvent":console.log("executePendingOperation - data.eventId:",H.eventId),console.log("executePendingOperation - type de data.eventId:",typeof H.eventId),o.value=H.eventId,i.value=!0;break;case"addEvent":ye.value=!0;break;case"deletePlayer":Ti.value=H.playerId,Ai.value=!0;break;case"launchSelection":nt.value[H.eventId]&&nt.value[H.eventId].length>0?(T.value=H.eventId,k.value=!0,en.value=!1):(await Ei(H.eventId,H.count),en.value=!1);break;case"toggleAvailability":Ms(H.player,H.eventId);break}}catch(de){console.error("Erreur lors de l'exécution de l'opération:",de),V.value=!0,G.value="Erreur lors de l'opération. Veuillez réessayer.",setTimeout(()=>{V.value=!1},3e3)}}function yr(){t.push("/")}function Qo(D){Qe.value=D,$.value=D.description||"",en.value=!0}function ld(){en.value=!1,Qe.value=null,$.value=""}function $l(){a.value=Qe.value.id,c.value=Qe.value.title,u.value=Qe.value.date,$.value=Qe.value.description||"",d.value=Qe.value.playerCount||6,en.value=!1}function ql(D){F.value=D,C.value=!0}function Jo(){C.value=!1,F.value=null}async function Yo({playerId:D,newName:v}){try{await wV(D,v,s.value),await Promise.all([Hd(s.value),da(Ve.value,Oe.value,s.value),ha(s.value)]).then(([H,de,Te])=>{if(Ve.value=H,at.value=de,nt.value=Te,A(),F.value&&F.value.id===D){const $e=H.find(Se=>Se.id===D);$e&&(F.value=$e)}}),V.value=!0,G.value="Joueur mis à jour avec succès !",setTimeout(()=>{V.value=!1},3e3)}catch(H){console.error("Erreur lors de l'édition du joueur:",H),alert("Erreur lors de l'édition du joueur. Veuillez réessayer.")}}async function Xo(){try{await Promise.all([Hd(s.value),da(Ve.value,Oe.value,s.value),ha(s.value)]).then(([D,v,H])=>{if(Ve.value=D,at.value=v,nt.value=H,A(),F.value){const de=D.find(Te=>Te.id===F.value.id);de&&(F.value=de)}}),V.value=!0,G.value="Données mises à jour !",setTimeout(()=>{V.value=!1},3e3)}catch(D){console.error("Erreur lors du rafraîchissement:",D)}}function zl(D){if(!D)return{availability:0,selection:0,ratio:0};const v=Wr(D.name),H=gr(D.name),de=v===0?0:Math.round(H/v*100);return{availability:v,selection:H,ratio:de}}function Ri(D){const v=nt.value[D]||[],H=Oe.value.find($e=>$e.id===D),de=(H==null?void 0:H.playerCount)||6,Te=Fs(D);if(v.length>0){const $e=v.some(Ye=>!Pn(Ye,D)),Se=Te<de;if($e||Se)return{type:"incomplete",hasUnavailablePlayers:$e,hasInsufficientPlayers:Se,unavailablePlayers:v.filter(Ye=>!Pn(Ye,D)),availableCount:Te,requiredCount:de}}return Te<de?{type:"insufficient",availableCount:Te,requiredCount:de}:v.length===0?{type:"ready",availableCount:Te,requiredCount:de}:{type:"complete",availableCount:Te,requiredCount:de}}function cd(D){const v=Ri(D);return v.type==="incomplete"||v.type==="insufficient"}function Gl(D){const v=Ri(D);switch(v.type){case"incomplete":return v.hasUnavailablePlayers?v.unavailablePlayers.length===1?`Sélection incomplète : ${v.unavailablePlayers[0]} n'est plus disponible`:`Sélection incomplète : ${v.unavailablePlayers.length} joueurs ne sont plus disponibles`:`Sélection incomplète : ${v.availableCount} joueurs disponibles pour ${v.requiredCount} requis`;case"insufficient":return`Pas assez de joueurs : ${v.availableCount} disponibles pour ${v.requiredCount} requis`;case"ready":return`Prêt pour la sélection : ${v.availableCount} joueurs disponibles`;case"complete":return`Sélection complète : ${v.availableCount} joueurs disponibles`;default:return""}}function Kl(D){if(!D)return{};const v={};return Ve.value.forEach(H=>{v[H.name]=Pn(H.name,D)}),v}function Ci(D){ee.value=D,ce.value=!0}function Hl(){ce.value=!1,ee.value=null}async function vr(){if(!ee.value)return;const D=ee.value.id,v=ee.value.playerCount||6;if(Fs(D)===0){V.value=!0,G.value="Aucun joueur disponible pour cet événement",setTimeout(()=>{V.value=!1},3e3);return}await _r({type:"launchSelection",data:{eventId:D,count:v}})}function Gn(){Hl(),V.value=!0,G.value="Sélection validée !",setTimeout(()=>{V.value=!1},3e3)}return(D,v)=>{var H,de,Te,$e,Se,Ye,rt,nn,Vt,yt;return W(),Q(Rt,null,[m("div",AO,[m("div",PO,[m("button",{onClick:yr,class:"absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10",title:"Retour à l'accueil"},v[30]||(v[30]=[m("svg",{class:"w-8 h-8",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[m("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M15 19l-7-7 7-7"})],-1)])),m("h1",SO,_e(r.value?r.value:"Chargement..."),1),v[31]||(v[31]=m("p",{class:"text-gray-300"},"Gestion des sélections et disponibilités",-1))]),m("div",xO,[m("div",RO,[m("table",CO,[m("colgroup",null,[v[32]||(v[32]=m("col",{style:{width:"15%"}},null,-1)),(W(!0),Q(Rt,null,rr(Oe.value,(ie,Me)=>(W(),Q("col",{key:Me,style:Fa("width: calc(80% / "+Oe.value.length+");")},null,4))),128)),v[33]||(v[33]=m("col",{style:{width:"5%"}},null,-1))]),m("thead",null,[m("tr",kO,[m("th",DO,[m("div",VO,[v[35]||(v[35]=m("span",{class:"font-bold text-lg relative group"},[m("span",{class:"border-b-2 border-dashed border-purple-400"}," Joueurs ")],-1)),m("button",{onClick:v[0]||(v[0]=ie=>f.value=!0),class:"flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-sm font-medium",title:"Ajouter un nouveau joueur"},v[34]||(v[34]=[m("span",{class:"text-lg"},"➕",-1),m("span",null,"S'ajouter",-1)]))])]),(W(!0),Q(Rt,null,rr(Oe.value,ie=>(W(),Q("th",{key:ie.id,class:"p-4 text-center",onClick:Me=>Qo(ie)},[m("div",OO,[m("div",MO,[m("div",LO,[m("span",{class:"hover:border-b-2 hover:border-dashed hover:border-purple-400 transition-colors duration-200 text-white",title:"Cliquez pour voir les détails : "+ie.title},_e(qo(ie.date)),9,FO)]),cd(ie.id)?(W(),Q("div",{key:0,class:"w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-400 transition-colors duration-200",title:Gl(ie.id)+" - Cliquez pour ouvrir la sélection",onClick:Hn(Me=>Ci(ie),["stop"])},v[36]||(v[36]=[m("span",{class:"text-xs text-white font-bold"},"⚠️",-1)]),8,UO)):Ri(ie.id).type==="ready"?(W(),Q("div",{key:1,class:"w-4 h-4 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors duration-200",title:Gl(ie.id)+" - Cliquez pour ouvrir la sélection",onClick:Hn(Me=>Ci(ie),["stop"])},v[37]||(v[37]=[m("span",{class:"text-xs text-white font-bold"},"🎲",-1)]),8,BO)):Ae("",!0)])])],8,NO))),128)),m("th",{class:"p-4 text-center"},[m("button",{onClick:Dt,class:"text-2xl text-purple-400 hover:text-pink-400 hover:scale-110 transition-all duration-200",title:"Ajouter un nouvel événement"}," ✨ ")])]),m("tr",jO,[v[38]||(v[38]=m("th",{class:"p-4 text-left w-[100px]"},null,-1)),(W(!0),Q(Rt,null,rr(Oe.value,ie=>(W(),Q("th",{key:ie.id,class:"p-4 text-center w-40"}))),128)),v[39]||(v[39]=m("th",{class:"p-4"},null,-1))])])])]),m("div",$O,[m("table",qO,[m("colgroup",null,[v[40]||(v[40]=m("col",{style:{width:"15%"}},null,-1)),(W(!0),Q(Rt,null,rr(Oe.value,(ie,Me)=>(W(),Q("col",{key:Me,style:Fa("width: calc(80% / "+Oe.value.length+");")},null,4))),128)),v[41]||(v[41]=m("col",{style:{width:"5%"}},null,-1))]),m("tbody",null,[(W(!0),Q(Rt,null,rr(Ve.value,ie=>(W(),Q("tr",{key:ie.id,class:cr(["border-b border-white/10 hover:bg-white/5 transition-all duration-200",{"highlighted-player":ie.id===_.value}]),"data-player-id":ie.id},[m("td",GO,[m("div",KO,[b(ie.id)?(W(),Q("span",HO," 🔒 ")):Ae("",!0),m("span",{onClick:Me=>ql(ie),class:"hover:border-b-2 hover:border-dashed hover:border-purple-400 cursor-pointer transition-colors duration-200",title:"Cliquez pour voir les détails : "+ie.name},_e(ie.name),9,WO)])]),(W(!0),Q(Rt,null,rr(Oe.value,Me=>(W(),Q("td",{key:Me.id,class:"p-4 text-center cursor-pointer hover:bg-white/10 transition-all duration-200",onClick:Ht=>Ii(ie.name,Me.id)},[m("div",JO,[$o(ie.name,Me.id)?(W(),Q("span",{key:0,class:"text-2xl hover:scale-110 transition-transform duration-200",title:Zn(ie,Me.id)}," 🎭 ",8,YO)):Pn(ie.name,Me.id)?(W(),Q("span",{key:1,class:"text-2xl hover:scale-110 transition-transform duration-200",title:Zn(ie,Me.id)}," ✅ ",8,XO)):Pn(ie.name,Me.id)===!1?(W(),Q("span",{key:2,class:"text-2xl hover:scale-110 transition-transform duration-200",title:Zn(ie,Me.id)}," ❌ ",8,ZO)):(W(),Q("span",{key:3,class:"text-gray-500 hover:text-white transition-colors duration-200",title:Zn(ie,Me.id)}," – ",8,e2))])],8,QO))),128)),v[42]||(v[42]=m("td",{class:"p-4"},null,-1))],10,zO))),128))])])])])]),V.value?(W(),Q("div",t2,[m("div",n2,[v[43]||(v[43]=m("span",{class:"text-xl"},"✨",-1)),m("span",null,_e(G.value),1)])])):Ae("",!0),ye.value?(W(),Q("div",r2,[m("div",s2,[v[48]||(v[48]=m("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✨ Nouvel événement",-1)),m("div",i2,[v[44]||(v[44]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Titre",-1)),Et(m("input",{"onUpdate:modelValue":v[1]||(v[1]=ie=>oe.value=ie),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Titre de l'événement"},null,512),[[Tt,oe.value]])]),m("div",o2,[v[45]||(v[45]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Date",-1)),Et(m("input",{"onUpdate:modelValue":v[2]||(v[2]=ie=>me.value=ie),type:"date",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"},null,512),[[Tt,me.value]])]),m("div",a2,[v[46]||(v[46]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Description",-1)),Et(m("textarea",{"onUpdate:modelValue":v[3]||(v[3]=ie=>Ie.value=ie),class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",rows:"3",placeholder:"Description de l'événement (optionnel)"},null,512),[[Tt,Ie.value]])]),m("div",l2,[v[47]||(v[47]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nombre de joueurs à sélectionner",-1)),Et(m("input",{"onUpdate:modelValue":v[4]||(v[4]=ie=>be.value=ie),type:"number",min:"1",max:"20",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white",placeholder:"6"},null,512),[[Tt,be.value]])]),m("div",{class:"flex justify-end space-x-3"},[m("button",{onClick:$t,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),m("button",{onClick:Re,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"}," Créer ")])])])):Ae("",!0),f.value?(W(),Q("div",c2,[m("div",u2,[v[50]||(v[50]=m("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✨ Nouveau joueur",-1)),m("div",d2,[v[49]||(v[49]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nom",-1)),Et(m("input",{"onUpdate:modelValue":v[5]||(v[5]=ie=>g.value=ie),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Nom du joueur"},null,512),[[Tt,g.value]])]),m("div",h2,[m("button",{onClick:v[6]||(v[6]=ie=>f.value=!1),class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),m("button",{onClick:ne,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"}," Ajouter ")])])])):Ae("",!0),i.value?(W(),Q("div",f2,[m("div",p2,[v[51]||(v[51]=rs('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">⚠️</span></div><h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2><p class="text-gray-300">Êtes-vous sûr de vouloir supprimer cet événement ?</p></div>',1)),m("div",m2,[m("button",{onClick:ue,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),m("button",{onClick:v[7]||(v[7]=()=>Z()),class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"}," Supprimer ")])])])):Ae("",!0),Ai.value?(W(),Q("div",g2,[m("div",_2,[v[52]||(v[52]=rs('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">⚠️</span></div><h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2><p class="text-gray-300">Êtes-vous sûr de vouloir supprimer ce joueur ?</p></div>',1)),m("div",y2,[m("button",{onClick:id,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"},"Annuler"),m("button",{onClick:v[8]||(v[8]=()=>Yr()),class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"},"Supprimer")])])])):Ae("",!0),k.value?(W(),Q("div",v2,[m("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},[v[53]||(v[53]=rs('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">🎭</span></div><h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2><p class="text-gray-300">Attention, toute la sélection sera refaite en fonction des disponibilités actuelles.</p></div><p class="mb-6 text-sm text-yellow-400 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/20"> ⚠️ Pensez à prévenir les gens du changement ! </p>',2)),m("div",{class:"flex justify-end space-x-3"},[m("button",{onClick:Ll,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"},"Annuler"),m("button",{onClick:Pi,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"},"Confirmer")])])])):Ae("",!0),en.value?(W(),Q("div",{key:6,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4",onClick:ld},[m("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-2xl",onClick:v[11]||(v[11]=Hn(()=>{},["stop"]))},[m("div",w2,[v[54]||(v[54]=m("div",{class:"w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center"},[m("span",{class:"text-3xl"},"🎭")],-1)),m("h2",b2,_e((H=Qe.value)==null?void 0:H.title),1),m("p",I2,_e(mr((de=Qe.value)==null?void 0:de.date)),1)]),(Te=Qe.value)!=null&&Te.description?(W(),Q("div",E2,[v[55]||(v[55]=m("h3",{class:"text-lg font-semibold text-white mb-3"},"Description",-1)),m("p",T2,_e(Qe.value.description),1)])):Ae("",!0),m("div",A2,[v[59]||(v[59]=m("h3",{class:"text-lg font-semibold text-white mb-3"},"Statistiques",-1)),m("div",P2,[m("div",S2,[m("div",x2,_e(Fs(($e=Qe.value)==null?void 0:$e.id)),1),v[56]||(v[56]=m("div",{class:"text-sm text-gray-300"},"Disponibles",-1))]),m("div",R2,[m("div",C2,_e(Qr((Se=Qe.value)==null?void 0:Se.id)),1),v[57]||(v[57]=m("div",{class:"text-sm text-gray-300"},"Sélectionnés",-1))]),m("div",k2,[m("div",D2,_e(((Ye=Qe.value)==null?void 0:Ye.playerCount)||6),1),v[58]||(v[58]=m("div",{class:"text-sm text-gray-300"},"À sélectionner",-1))])])]),m("div",V2,[m("button",{onClick:$l,class:"px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center space-x-2"},v[60]||(v[60]=[m("span",null,"✏️",-1),m("span",null,"Modifier",-1)])),m("button",{onClick:v[9]||(v[9]=ie=>Ci(Qe.value)),class:"px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2",title:"Gérer la sélection"},v[61]||(v[61]=[m("span",null,"🎭",-1),m("span",null,"Sélection",-1)])),m("button",{onClick:v[10]||(v[10]=ie=>{var Me;return z((Me=Qe.value)==null?void 0:Me.id)}),class:"px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center space-x-2"},v[62]||(v[62]=[m("span",null,"🗑️",-1),m("span",null,"Supprimer",-1)]))])])])):Ae("",!0),a.value?(W(),Q("div",N2,[m("div",O2,[v[67]||(v[67]=m("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✏️ Modifier l'événement",-1)),m("div",M2,[v[63]||(v[63]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Titre",-1)),Et(m("input",{"onUpdate:modelValue":v[12]||(v[12]=ie=>c.value=ie),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",onKeydown:[In(X,["esc"]),In(se,["enter"])],ref:"editTitleInput"},null,544),[[Tt,c.value]])]),m("div",L2,[v[64]||(v[64]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Date",-1)),Et(m("input",{"onUpdate:modelValue":v[13]||(v[13]=ie=>u.value=ie),type:"date",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white",onKeydown:[In(X,["esc"]),In(se,["enter"])]},null,544),[[Tt,u.value]])]),m("div",F2,[v[65]||(v[65]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Description",-1)),Et(m("textarea",{"onUpdate:modelValue":v[14]||(v[14]=ie=>$.value=ie),class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",rows:"3",placeholder:"Description de l'événement (optionnel)",onKeydown:In(X,["esc"])},null,544),[[Tt,$.value]])]),m("div",U2,[v[66]||(v[66]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nombre de joueurs à sélectionner",-1)),Et(m("input",{"onUpdate:modelValue":v[15]||(v[15]=ie=>d.value=ie),type:"number",min:"1",max:"20",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white",onKeydown:In(X,["esc"])},null,544),[[Tt,d.value]])]),m("div",{class:"flex justify-end space-x-3"},[m("button",{onClick:X,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),m("button",{onClick:se,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"}," Sauvegarder ")])])])):Ae("",!0),Bt(Tb,{show:j.value,message:Go(),error:M.value,"session-info":Wo(),onSubmit:Ul,onCancel:Ko},null,8,["show","message","error","session-info"]),q.value?(W(),Q("div",B2,[m("div",j2,[v[69]||(v[69]=rs('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">🔐</span></div><h2 class="text-2xl font-bold text-white mb-2">Vérification requise</h2><p class="text-lg text-gray-300">Suppression de joueur protégé</p><p class="text-sm text-gray-400 mt-2">Ce joueur est protégé par mot de passe</p></div>',1)),m("div",$2,[m("div",q2,[m("div",null,[v[68]||(v[68]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Mot de passe du joueur",-1)),Et(m("input",{"onUpdate:modelValue":v[16]||(v[16]=ie=>E.value=ie),type:"password",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Entrez le mot de passe",onKeydown:v[17]||(v[17]=In(ie=>Si(E.value),["enter"])),ref_key:"playerPasswordInputRef",ref:R},null,544),[[Tt,E.value]])])]),m("button",{onClick:v[18]||(v[18]=ie=>Si(E.value)),disabled:!E.value||S.value,class:"w-full mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"},[S.value?(W(),Q("span",G2,"⏳")):(W(),Q("span",K2,"🔓")),m("span",null,_e(S.value?"Vérification...":"Vérifier et supprimer"),1)],8,z2)]),m("div",H2,[m("button",{onClick:v[19]||(v[19]=ie=>Zt.value=!0),class:"text-sm text-red-400 hover:text-red-300 transition-colors underline"}," Mot de passe oublié ? ")]),x.value?(W(),Q("div",W2,[m("div",Q2,_e(x.value),1)])):Ae("",!0),m("div",{class:"flex justify-center"},[m("button",{onClick:Bl,class:"px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"}," Annuler ")])])])):Ae("",!0),w.value?(W(),Q("div",J2,[m("div",Y2,[v[71]||(v[71]=rs('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">🔐</span></div><h2 class="text-2xl font-bold text-white mb-2">Vérification requise</h2><p class="text-lg text-gray-300">Modification de disponibilité</p><p class="text-sm text-gray-400 mt-2">Ce joueur est protégé par mot de passe</p></div>',1)),m("div",X2,[m("div",Z2,[m("div",null,[v[70]||(v[70]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Mot de passe du joueur",-1)),Et(m("input",{"onUpdate:modelValue":v[20]||(v[20]=ie=>ke.value=ie),type:"password",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Entrez le mot de passe",onKeydown:v[21]||(v[21]=In(ie=>Ho(ke.value),["enter"])),ref_key:"availabilityPasswordInputRef",ref:He},null,544),[[Tt,ke.value]])])]),m("button",{onClick:v[22]||(v[22]=ie=>Ho(ke.value)),disabled:!ke.value||ct.value,class:"w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"},[ct.value?(W(),Q("span",tM,"⏳")):(W(),Q("span",nM,"🔓")),m("span",null,_e(ct.value?"Vérification...":"Vérifier et modifier"),1)],8,eM)]),m("div",rM,[m("button",{onClick:v[23]||(v[23]=ie=>Le.value=!0),class:"text-sm text-blue-400 hover:text-blue-300 transition-colors underline"}," Mot de passe oublié ? ")]),I.value?(W(),Q("div",sM,[m("div",iM,_e(I.value),1)])):Ae("",!0),m("div",{class:"flex justify-center"},[m("button",{onClick:ad,class:"px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"}," Annuler ")])])])):Ae("",!0),Le.value?(W(),Q("div",{key:10,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4",onClick:v[26]||(v[26]=ie=>Le.value=!1)},[m("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md",onClick:v[25]||(v[25]=Hn(()=>{},["stop"]))},[v[73]||(v[73]=rs('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">📧</span></div><h2 class="text-2xl font-bold text-white mb-2">Mot de passe oublié</h2><p class="text-lg text-gray-300">Modification de disponibilité</p></div>',1)),m("div",oM,[v[72]||(v[72]=m("p",{class:"text-sm text-gray-300 mb-4"}," Un email de réinitialisation sera envoyé à l'adresse associée à ce joueur. ",-1)),m("button",{onClick:xi,disabled:De.value,class:"w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"},[De.value?(W(),Q("span",lM,"⏳")):(W(),Q("span",cM,"📧")),m("span",null,_e(De.value?"Envoi...":"Envoyer l'email"),1)],8,aM)]),Kt.value?(W(),Q("div",uM,[m("div",dM,_e(Kt.value),1)])):Ae("",!0),un.value?(W(),Q("div",hM,[m("div",fM,_e(un.value),1)])):Ae("",!0),m("div",pM,[m("button",{onClick:v[24]||(v[24]=ie=>Le.value=!1),class:"px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"}," Fermer ")])])])):Ae("",!0),Zt.value?(W(),Q("div",{key:11,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[120] p-4",onClick:v[29]||(v[29]=ie=>Zt.value=!1)},[m("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md",onClick:v[28]||(v[28]=Hn(()=>{},["stop"]))},[v[75]||(v[75]=rs('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">📧</span></div><h2 class="text-2xl font-bold text-white mb-2">Mot de passe oublié</h2><p class="text-lg text-gray-300">Suppression de joueur protégé</p></div>',1)),m("div",mM,[v[74]||(v[74]=m("p",{class:"text-sm text-gray-300 mb-4"}," Un email de réinitialisation sera envoyé à l'adresse associée à ce joueur. ",-1)),m("button",{onClick:jl,disabled:tt.value,class:"w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"},[tt.value?(W(),Q("span",_M,"⏳")):(W(),Q("span",yM,"📧")),m("span",null,_e(tt.value?"Envoi...":"Envoyer l'email"),1)],8,gM)]),ot.value?(W(),Q("div",vM,[m("div",wM,_e(ot.value),1)])):Ae("",!0),Nn.value?(W(),Q("div",bM,[m("div",IM,_e(Nn.value),1)])):Ae("",!0),m("div",EM,[m("button",{onClick:v[27]||(v[27]=ie=>Zt.value=!1),class:"px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"}," Fermer ")])])])):Ae("",!0),Bt(FN,{show:C.value,player:F.value,stats:zl(F.value),seasonId:s.value,onClose:Jo,onUpdate:Yo,onDelete:od,onRefresh:Xo},null,8,["show","player","stats","seasonId"]),Bt(TO,{ref_key:"selectionModalRef",ref:fe,show:ce.value,event:ee.value,"current-selection":nt.value[(rt=ee.value)==null?void 0:rt.id]||[],"available-count":Fs((nn=ee.value)==null?void 0:nn.id),"selected-count":Qr((Vt=ee.value)==null?void 0:Vt.id),"player-availability":Kl((yt=ee.value)==null?void 0:yt.id),onClose:Hl,onSelection:vr,onPerfect:Gn},null,8,["show","event","current-selection","available-count","selected-count","player-availability"])],64)}}},AM={class:"min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4"},PM={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},SM={key:0,class:"text-center py-8"},xM={key:1,class:"text-center py-8"},RM={class:"text-gray-300 mb-6"},CM={key:2,class:"space-y-6"},kM={class:"text-center"},DM={class:"text-gray-300"},VM={class:"font-semibold text-white"},NM={class:"space-y-4"},OM=["disabled"],MM={key:0,class:"animate-spin"},LM={key:1},FM={key:0,class:"p-4 bg-red-500/20 border border-red-500/30 rounded-lg"},UM={class:"text-red-300 text-sm"},BM={key:1,class:"p-4 bg-green-500/20 border border-green-500/30 rounded-lg"},jM={class:"text-green-300 text-sm"},$M={__name:"PasswordReset",setup(n){const e=aA(),t=sf(),r=K(!0),s=K(""),i=K(""),o=K(""),a=K(""),c=K(""),u=K(!1),d=K(""),f=K(""),g=an(()=>a.value&&c.value&&a.value===c.value&&a.value.length>=6);vu(async()=>{try{const{oobCode:T}=e.query;if(console.log("🔍 [DEBUG] Token reçu:",T),!T){s.value="Lien de réinitialisation incomplet",r.value=!1;return}o.value=T,i.value="patrice.lamarque+ron@gmail.com",r.value=!1}catch(T){console.error("Erreur lors de la vérification du lien:",T),s.value="Erreur lors de la vérification du lien",r.value=!1}});async function _(){if(g.value){u.value=!0,d.value="",f.value="";try{await D1(bi,o.value,a.value),f.value="Mot de passe réinitialisé avec succès !",setTimeout(()=>{k()},3e3)}catch(T){console.error("Erreur lors de la réinitialisation:",T),T.code==="auth/weak-password"?d.value="Le mot de passe doit contenir au moins 6 caractères":T.code==="auth/invalid-action-code"?d.value="Lien de réinitialisation invalide ou expiré":d.value="Erreur lors de la réinitialisation. Veuillez réessayer."}finally{u.value=!1}}}function k(){t.push("/")}return(T,C)=>(W(),Q("div",AM,[m("div",PM,[C[8]||(C[8]=rs('<div class="text-center mb-6"><div class="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-3xl">🔑</span></div><h1 class="text-3xl font-bold text-white mb-2">Réinitialisation</h1><p class="text-lg text-gray-300">Nouveau mot de passe</p></div>',1)),r.value?(W(),Q("div",SM,C[2]||(C[2]=[m("div",{class:"animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"},null,-1),m("p",{class:"text-gray-300"},"Vérification du lien...",-1)]))):s.value?(W(),Q("div",xM,[C[3]||(C[3]=m("div",{class:"w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"},[m("span",{class:"text-2xl"},"❌")],-1)),C[4]||(C[4]=m("h2",{class:"text-xl font-bold text-white mb-2"},"Lien invalide",-1)),m("p",RM,_e(s.value),1),m("button",{onClick:k,class:"px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"}," Retour à l'accueil ")])):i.value?(W(),Q("div",CM,[m("div",kM,[m("p",DM,[C[5]||(C[5]=Tr("Email : ")),m("span",VM,_e(i.value),1)])]),m("div",NM,[m("div",null,[C[6]||(C[6]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nouveau mot de passe",-1)),Et(m("input",{"onUpdate:modelValue":C[0]||(C[0]=F=>a.value=F),type:"password",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Nouveau mot de passe",onKeydown:In(_,["enter"])},null,544),[[Tt,a.value]])]),m("div",null,[C[7]||(C[7]=m("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Confirmer le mot de passe",-1)),Et(m("input",{"onUpdate:modelValue":C[1]||(C[1]=F=>c.value=F),type:"password",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Confirmer le mot de passe",onKeydown:In(_,["enter"])},null,544),[[Tt,c.value]])])]),m("button",{onClick:_,disabled:!g.value||u.value,class:"w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"},[u.value?(W(),Q("span",MM,"⏳")):(W(),Q("span",LM,"🔑")),m("span",null,_e(u.value?"Réinitialisation...":"Réinitialiser le mot de passe"),1)],8,OM),d.value?(W(),Q("div",FM,[m("div",UM,_e(d.value),1)])):Ae("",!0),f.value?(W(),Q("div",BM,[m("div",jM,_e(f.value),1)])):Ae("",!0)])):Ae("",!0)])]))}},qM=[{path:"/",component:pV},{path:"/season/:slug",component:TM,props:!0},{path:"/reset-password",component:$M}],zM=iA({history:NT("/impro-selector/"),routes:qM});eT(rT).use(zM).mount("#app");export{st as $,xw as A,hi as B,hr as C,Lt as D,YL as E,mi as F,Qf as G,JL as H,QM as I,qn as J,QR as K,YR as L,uC as M,IL as N,EL as O,IC as P,cn as Q,fL as R,eL as S,Pt as T,$L as U,ju as V,wC as W,jL as X,bL as Y,sL as Z,_v as _,tl as a,kl as a$,XM as a0,JR as a1,lC as a2,QL as a3,ru as a4,BL as a5,aL as a6,WL as a7,Ue as a8,dL as a9,uL as aA,CL as aB,kL as aC,hL as aD,oC as aE,ML as aF,LL as aG,yC as aH,Tw as aI,fw as aJ,ZM as aK,UL as aL,Rw as aM,Ln as aN,GL as aO,GM as aP,TL as aQ,_L as aR,gL as aS,wL as aT,lL as aU,RL as aV,zL as aW,iL as aX,iC as aY,Cw as aZ,rF as a_,nL as aa,rL as ab,oL as ac,HL as ad,vL as ae,yL as af,St as ag,Sl as ah,dC as ai,DL as aj,Ju as ak,AL as al,PL as am,At as an,SL as ao,xL as ap,XR as aq,KL as ar,qL as as,tL as at,pL as au,mL as av,cL as aw,VL as ax,OL as ay,NL as az,ZR as b,S1 as b$,Cl as b0,iF as b1,al as b2,vi as b3,us as b4,ZL as b5,hs as b6,ds as b7,Ur as b8,kc as b9,OC as bA,CF as bB,qF as bC,p_ as bD,dk as bE,n1 as bF,IF as bG,fF as bH,x1 as bI,NF as bJ,UF as bK,$F as bL,kF as bM,TF as bN,z1 as bO,aF as bP,TC as bQ,R1 as bR,OF as bS,FF as bT,jF as bU,FC as bV,xF as bW,gF as bX,k1 as bY,hF as bZ,bF as b_,nF as ba,ti as bb,io as bc,pD as bd,eF as be,DF as bf,Oh as bg,tF as bh,mD as bi,Pp as bj,fs as bk,uF as bl,G1 as bm,Z1 as bn,fD as bo,db as bp,V1 as bq,D1 as br,s1 as bs,N1 as bt,sF as bu,RF as bv,mF as bw,wF as bx,ID as by,oF as bz,Po as c,mp as c0,cF as c1,O1 as c2,pF as c3,VF as c4,LF as c5,BF as c6,SF as c7,lF as c8,PF as c9,vF as ca,F1 as cb,MF as cc,yF as cd,AF as ce,EF as cf,_F as cg,dF as ch,gi as d,ht as e,Y as f,Uo as g,Al as h,xc as i,Wu as j,Pl as k,Ku as l,sp as m,So as n,Hu as o,Js as p,bC as q,Ct as r,si as s,he as t,HM as u,$P as v,wt as w,XL as x,Be as y,KM as z};
