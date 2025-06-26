(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))r(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function r(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();/**
* @vue/shared v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**//*! #__NO_SIDE_EFFECTS__ */function Za(n){const e=Object.create(null);for(const t of n.split(","))e[t]=1;return t=>t in e}const we={},vr=[],bt=()=>{},mg=()=>!1,io=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&(n.charCodeAt(2)>122||n.charCodeAt(2)<97),ec=n=>n.startsWith("onUpdate:"),Ke=Object.assign,tc=(n,e)=>{const t=n.indexOf(e);t>-1&&n.splice(t,1)},_g=Object.prototype.hasOwnProperty,ye=(n,e)=>_g.call(n,e),oe=Array.isArray,Er=n=>so(n)==="[object Map]",Vh=n=>so(n)==="[object Set]",le=n=>typeof n=="function",De=n=>typeof n=="string",Mn=n=>typeof n=="symbol",Re=n=>n!==null&&typeof n=="object",Oh=n=>(Re(n)||le(n))&&le(n.then)&&le(n.catch),Nh=Object.prototype.toString,so=n=>Nh.call(n),yg=n=>so(n).slice(8,-1),xh=n=>so(n)==="[object Object]",nc=n=>De(n)&&n!=="NaN"&&n[0]!=="-"&&""+parseInt(n,10)===n,di=Za(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),oo=n=>{const e=Object.create(null);return t=>e[t]||(e[t]=n(t))},vg=/-(\w)/g,kn=oo(n=>n.replace(vg,(e,t)=>t?t.toUpperCase():"")),Eg=/\B([A-Z])/g,rr=oo(n=>n.replace(Eg,"-$1").toLowerCase()),Mh=oo(n=>n.charAt(0).toUpperCase()+n.slice(1)),Qo=oo(n=>n?`on${Mh(n)}`:""),In=(n,e)=>!Object.is(n,e),Jo=(n,...e)=>{for(let t=0;t<n.length;t++)n[t](...e)},Ea=(n,e,t,r=!1)=>{Object.defineProperty(n,e,{configurable:!0,enumerable:!1,writable:r,value:t})},Tg=n=>{const e=parseFloat(n);return isNaN(e)?n:e};let Jl;const ao=()=>Jl||(Jl=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function rc(n){if(oe(n)){const e={};for(let t=0;t<n.length;t++){const r=n[t],i=De(r)?bg(r):rc(r);if(i)for(const s in i)e[s]=i[s]}return e}else if(De(n)||Re(n))return n}const Ig=/;(?![^(]*\))/g,wg=/:([^]+)/,Ag=/\/\*[^]*?\*\//g;function bg(n){const e={};return n.replace(Ag,"").split(Ig).forEach(t=>{if(t){const r=t.split(wg);r.length>1&&(e[r[0].trim()]=r[1].trim())}}),e}function ic(n){let e="";if(De(n))e=n;else if(oe(n))for(let t=0;t<n.length;t++){const r=ic(n[t]);r&&(e+=r+" ")}else if(Re(n))for(const t in n)n[t]&&(e+=t+" ");return e.trim()}const Rg="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",Sg=Za(Rg);function Lh(n){return!!n||n===""}const Fh=n=>!!(n&&n.__v_isRef===!0),fr=n=>De(n)?n:n==null?"":oe(n)||Re(n)&&(n.toString===Nh||!le(n.toString))?Fh(n)?fr(n.value):JSON.stringify(n,Uh,2):String(n),Uh=(n,e)=>Fh(e)?Uh(n,e.value):Er(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((t,[r,i],s)=>(t[Yo(r,s)+" =>"]=i,t),{})}:Vh(e)?{[`Set(${e.size})`]:[...e.values()].map(t=>Yo(t))}:Mn(e)?Yo(e):Re(e)&&!oe(e)&&!xh(e)?String(e):e,Yo=(n,e="")=>{var t;return Mn(n)?`Symbol(${(t=n.description)!=null?t:e})`:n};/**
* @vue/reactivity v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let ct;class Pg{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=ct,!e&&ct&&(this.index=(ct.scopes||(ct.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].pause();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,t;if(this.scopes)for(e=0,t=this.scopes.length;e<t;e++)this.scopes[e].resume();for(e=0,t=this.effects.length;e<t;e++)this.effects[e].resume()}}run(e){if(this._active){const t=ct;try{return ct=this,e()}finally{ct=t}}}on(){++this._on===1&&(this.prevScope=ct,ct=this)}off(){this._on>0&&--this._on===0&&(ct=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let t,r;for(t=0,r=this.effects.length;t<r;t++)this.effects[t].stop();for(this.effects.length=0,t=0,r=this.cleanups.length;t<r;t++)this.cleanups[t]();if(this.cleanups.length=0,this.scopes){for(t=0,r=this.scopes.length;t<r;t++)this.scopes[t].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const i=this.parent.scopes.pop();i&&i!==this&&(this.parent.scopes[this.index]=i,i.index=this.index)}this.parent=void 0}}}function Cg(){return ct}let Ie;const Xo=new WeakSet;class Bh{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,ct&&ct.active&&ct.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Xo.has(this)&&(Xo.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||$h(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,Yl(this),qh(this);const e=Ie,t=Rt;Ie=this,Rt=!0;try{return this.fn()}finally{Hh(this),Ie=e,Rt=t,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)ac(e);this.deps=this.depsTail=void 0,Yl(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Xo.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Ta(this)&&this.run()}get dirty(){return Ta(this)}}let jh=0,fi,pi;function $h(n,e=!1){if(n.flags|=8,e){n.next=pi,pi=n;return}n.next=fi,fi=n}function sc(){jh++}function oc(){if(--jh>0)return;if(pi){let e=pi;for(pi=void 0;e;){const t=e.next;e.next=void 0,e.flags&=-9,e=t}}let n;for(;fi;){let e=fi;for(fi=void 0;e;){const t=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(r){n||(n=r)}e=t}}if(n)throw n}function qh(n){for(let e=n.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function Hh(n){let e,t=n.depsTail,r=t;for(;r;){const i=r.prevDep;r.version===-1?(r===t&&(t=i),ac(r),kg(r)):e=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=i}n.deps=e,n.depsTail=t}function Ta(n){for(let e=n.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(zh(e.dep.computed)||e.dep.version!==e.version))return!0;return!!n._dirty}function zh(n){if(n.flags&4&&!(n.flags&16)||(n.flags&=-17,n.globalVersion===Ai)||(n.globalVersion=Ai,!n.isSSR&&n.flags&128&&(!n.deps&&!n._dirty||!Ta(n))))return;n.flags|=2;const e=n.dep,t=Ie,r=Rt;Ie=n,Rt=!0;try{qh(n);const i=n.fn(n._value);(e.version===0||In(i,n._value))&&(n.flags|=128,n._value=i,e.version++)}catch(i){throw e.version++,i}finally{Ie=t,Rt=r,Hh(n),n.flags&=-3}}function ac(n,e=!1){const{dep:t,prevSub:r,nextSub:i}=n;if(r&&(r.nextSub=i,n.prevSub=void 0),i&&(i.prevSub=r,n.nextSub=void 0),t.subs===n&&(t.subs=r,!r&&t.computed)){t.computed.flags&=-5;for(let s=t.computed.deps;s;s=s.nextDep)ac(s,!0)}!e&&!--t.sc&&t.map&&t.map.delete(t.key)}function kg(n){const{prevDep:e,nextDep:t}=n;e&&(e.nextDep=t,n.prevDep=void 0),t&&(t.prevDep=e,n.nextDep=void 0)}let Rt=!0;const Wh=[];function Yt(){Wh.push(Rt),Rt=!1}function Xt(){const n=Wh.pop();Rt=n===void 0?!0:n}function Yl(n){const{cleanup:e}=n;if(n.cleanup=void 0,e){const t=Ie;Ie=void 0;try{e()}finally{Ie=t}}}let Ai=0;class Dg{constructor(e,t){this.sub=e,this.dep=t,this.version=t.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class cc{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!Ie||!Rt||Ie===this.computed)return;let t=this.activeLink;if(t===void 0||t.sub!==Ie)t=this.activeLink=new Dg(Ie,this),Ie.deps?(t.prevDep=Ie.depsTail,Ie.depsTail.nextDep=t,Ie.depsTail=t):Ie.deps=Ie.depsTail=t,Kh(t);else if(t.version===-1&&(t.version=this.version,t.nextDep)){const r=t.nextDep;r.prevDep=t.prevDep,t.prevDep&&(t.prevDep.nextDep=r),t.prevDep=Ie.depsTail,t.nextDep=void 0,Ie.depsTail.nextDep=t,Ie.depsTail=t,Ie.deps===t&&(Ie.deps=r)}return t}trigger(e){this.version++,Ai++,this.notify(e)}notify(e){sc();try{for(let t=this.subs;t;t=t.prevSub)t.sub.notify()&&t.sub.dep.notify()}finally{oc()}}}function Kh(n){if(n.dep.sc++,n.sub.flags&4){const e=n.dep.computed;if(e&&!n.dep.subs){e.flags|=20;for(let r=e.deps;r;r=r.nextDep)Kh(r)}const t=n.dep.subs;t!==n&&(n.prevSub=t,t&&(t.nextSub=n)),n.dep.subs=n}}const Ia=new WeakMap,Jn=Symbol(""),wa=Symbol(""),bi=Symbol("");function et(n,e,t){if(Rt&&Ie){let r=Ia.get(n);r||Ia.set(n,r=new Map);let i=r.get(t);i||(r.set(t,i=new cc),i.map=r,i.key=t),i.track()}}function zt(n,e,t,r,i,s){const a=Ia.get(n);if(!a){Ai++;return}const c=u=>{u&&u.trigger()};if(sc(),e==="clear")a.forEach(c);else{const u=oe(n),d=u&&nc(t);if(u&&t==="length"){const f=Number(r);a.forEach((g,I)=>{(I==="length"||I===bi||!Mn(I)&&I>=f)&&c(g)})}else switch((t!==void 0||a.has(void 0))&&c(a.get(t)),d&&c(a.get(bi)),e){case"add":u?d&&c(a.get("length")):(c(a.get(Jn)),Er(n)&&c(a.get(wa)));break;case"delete":u||(c(a.get(Jn)),Er(n)&&c(a.get(wa)));break;case"set":Er(n)&&c(a.get(Jn));break}}oc()}function hr(n){const e=_e(n);return e===n?e:(et(e,"iterate",bi),yt(n)?e:e.map(He))}function co(n){return et(n=_e(n),"iterate",bi),n}const Vg={__proto__:null,[Symbol.iterator](){return Zo(this,Symbol.iterator,He)},concat(...n){return hr(this).concat(...n.map(e=>oe(e)?hr(e):e))},entries(){return Zo(this,"entries",n=>(n[1]=He(n[1]),n))},every(n,e){return qt(this,"every",n,e,void 0,arguments)},filter(n,e){return qt(this,"filter",n,e,t=>t.map(He),arguments)},find(n,e){return qt(this,"find",n,e,He,arguments)},findIndex(n,e){return qt(this,"findIndex",n,e,void 0,arguments)},findLast(n,e){return qt(this,"findLast",n,e,He,arguments)},findLastIndex(n,e){return qt(this,"findLastIndex",n,e,void 0,arguments)},forEach(n,e){return qt(this,"forEach",n,e,void 0,arguments)},includes(...n){return ea(this,"includes",n)},indexOf(...n){return ea(this,"indexOf",n)},join(n){return hr(this).join(n)},lastIndexOf(...n){return ea(this,"lastIndexOf",n)},map(n,e){return qt(this,"map",n,e,void 0,arguments)},pop(){return si(this,"pop")},push(...n){return si(this,"push",n)},reduce(n,...e){return Xl(this,"reduce",n,e)},reduceRight(n,...e){return Xl(this,"reduceRight",n,e)},shift(){return si(this,"shift")},some(n,e){return qt(this,"some",n,e,void 0,arguments)},splice(...n){return si(this,"splice",n)},toReversed(){return hr(this).toReversed()},toSorted(n){return hr(this).toSorted(n)},toSpliced(...n){return hr(this).toSpliced(...n)},unshift(...n){return si(this,"unshift",n)},values(){return Zo(this,"values",He)}};function Zo(n,e,t){const r=co(n),i=r[e]();return r!==n&&!yt(n)&&(i._next=i.next,i.next=()=>{const s=i._next();return s.value&&(s.value=t(s.value)),s}),i}const Og=Array.prototype;function qt(n,e,t,r,i,s){const a=co(n),c=a!==n&&!yt(n),u=a[e];if(u!==Og[e]){const g=u.apply(n,s);return c?He(g):g}let d=t;a!==n&&(c?d=function(g,I){return t.call(this,He(g),I,n)}:t.length>2&&(d=function(g,I){return t.call(this,g,I,n)}));const f=u.call(a,d,r);return c&&i?i(f):f}function Xl(n,e,t,r){const i=co(n);let s=t;return i!==n&&(yt(n)?t.length>3&&(s=function(a,c,u){return t.call(this,a,c,u,n)}):s=function(a,c,u){return t.call(this,a,He(c),u,n)}),i[e](s,...r)}function ea(n,e,t){const r=_e(n);et(r,"iterate",bi);const i=r[e](...t);return(i===-1||i===!1)&&dc(t[0])?(t[0]=_e(t[0]),r[e](...t)):i}function si(n,e,t=[]){Yt(),sc();const r=_e(n)[e].apply(n,t);return oc(),Xt(),r}const Ng=Za("__proto__,__v_isRef,__isVue"),Gh=new Set(Object.getOwnPropertyNames(Symbol).filter(n=>n!=="arguments"&&n!=="caller").map(n=>Symbol[n]).filter(Mn));function xg(n){Mn(n)||(n=String(n));const e=_e(this);return et(e,"has",n),e.hasOwnProperty(n)}class Qh{constructor(e=!1,t=!1){this._isReadonly=e,this._isShallow=t}get(e,t,r){if(t==="__v_skip")return e.__v_skip;const i=this._isReadonly,s=this._isShallow;if(t==="__v_isReactive")return!i;if(t==="__v_isReadonly")return i;if(t==="__v_isShallow")return s;if(t==="__v_raw")return r===(i?s?zg:Zh:s?Xh:Yh).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(r)?e:void 0;const a=oe(e);if(!i){let u;if(a&&(u=Vg[t]))return u;if(t==="hasOwnProperty")return xg}const c=Reflect.get(e,t,nt(e)?e:r);return(Mn(t)?Gh.has(t):Ng(t))||(i||et(e,"get",t),s)?c:nt(c)?a&&nc(t)?c:c.value:Re(c)?i?ed(c):uc(c):c}}class Jh extends Qh{constructor(e=!1){super(!1,e)}set(e,t,r,i){let s=e[t];if(!this._isShallow){const u=Dn(s);if(!yt(r)&&!Dn(r)&&(s=_e(s),r=_e(r)),!oe(e)&&nt(s)&&!nt(r))return u?!1:(s.value=r,!0)}const a=oe(e)&&nc(t)?Number(t)<e.length:ye(e,t),c=Reflect.set(e,t,r,nt(e)?e:i);return e===_e(i)&&(a?In(r,s)&&zt(e,"set",t,r):zt(e,"add",t,r)),c}deleteProperty(e,t){const r=ye(e,t);e[t];const i=Reflect.deleteProperty(e,t);return i&&r&&zt(e,"delete",t,void 0),i}has(e,t){const r=Reflect.has(e,t);return(!Mn(t)||!Gh.has(t))&&et(e,"has",t),r}ownKeys(e){return et(e,"iterate",oe(e)?"length":Jn),Reflect.ownKeys(e)}}class Mg extends Qh{constructor(e=!1){super(!0,e)}set(e,t){return!0}deleteProperty(e,t){return!0}}const Lg=new Jh,Fg=new Mg,Ug=new Jh(!0);const Aa=n=>n,ps=n=>Reflect.getPrototypeOf(n);function Bg(n,e,t){return function(...r){const i=this.__v_raw,s=_e(i),a=Er(s),c=n==="entries"||n===Symbol.iterator&&a,u=n==="keys"&&a,d=i[n](...r),f=t?Aa:e?xs:He;return!e&&et(s,"iterate",u?wa:Jn),{next(){const{value:g,done:I}=d.next();return I?{value:g,done:I}:{value:c?[f(g[0]),f(g[1])]:f(g),done:I}},[Symbol.iterator](){return this}}}}function gs(n){return function(...e){return n==="delete"?!1:n==="clear"?void 0:this}}function jg(n,e){const t={get(i){const s=this.__v_raw,a=_e(s),c=_e(i);n||(In(i,c)&&et(a,"get",i),et(a,"get",c));const{has:u}=ps(a),d=e?Aa:n?xs:He;if(u.call(a,i))return d(s.get(i));if(u.call(a,c))return d(s.get(c));s!==a&&s.get(i)},get size(){const i=this.__v_raw;return!n&&et(_e(i),"iterate",Jn),Reflect.get(i,"size",i)},has(i){const s=this.__v_raw,a=_e(s),c=_e(i);return n||(In(i,c)&&et(a,"has",i),et(a,"has",c)),i===c?s.has(i):s.has(i)||s.has(c)},forEach(i,s){const a=this,c=a.__v_raw,u=_e(c),d=e?Aa:n?xs:He;return!n&&et(u,"iterate",Jn),c.forEach((f,g)=>i.call(s,d(f),d(g),a))}};return Ke(t,n?{add:gs("add"),set:gs("set"),delete:gs("delete"),clear:gs("clear")}:{add(i){!e&&!yt(i)&&!Dn(i)&&(i=_e(i));const s=_e(this);return ps(s).has.call(s,i)||(s.add(i),zt(s,"add",i,i)),this},set(i,s){!e&&!yt(s)&&!Dn(s)&&(s=_e(s));const a=_e(this),{has:c,get:u}=ps(a);let d=c.call(a,i);d||(i=_e(i),d=c.call(a,i));const f=u.call(a,i);return a.set(i,s),d?In(s,f)&&zt(a,"set",i,s):zt(a,"add",i,s),this},delete(i){const s=_e(this),{has:a,get:c}=ps(s);let u=a.call(s,i);u||(i=_e(i),u=a.call(s,i)),c&&c.call(s,i);const d=s.delete(i);return u&&zt(s,"delete",i,void 0),d},clear(){const i=_e(this),s=i.size!==0,a=i.clear();return s&&zt(i,"clear",void 0,void 0),a}}),["keys","values","entries",Symbol.iterator].forEach(i=>{t[i]=Bg(i,n,e)}),t}function lc(n,e){const t=jg(n,e);return(r,i,s)=>i==="__v_isReactive"?!n:i==="__v_isReadonly"?n:i==="__v_raw"?r:Reflect.get(ye(t,i)&&i in r?t:r,i,s)}const $g={get:lc(!1,!1)},qg={get:lc(!1,!0)},Hg={get:lc(!0,!1)};const Yh=new WeakMap,Xh=new WeakMap,Zh=new WeakMap,zg=new WeakMap;function Wg(n){switch(n){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function Kg(n){return n.__v_skip||!Object.isExtensible(n)?0:Wg(yg(n))}function uc(n){return Dn(n)?n:hc(n,!1,Lg,$g,Yh)}function Gg(n){return hc(n,!1,Ug,qg,Xh)}function ed(n){return hc(n,!0,Fg,Hg,Zh)}function hc(n,e,t,r,i){if(!Re(n)||n.__v_raw&&!(e&&n.__v_isReactive))return n;const s=Kg(n);if(s===0)return n;const a=i.get(n);if(a)return a;const c=new Proxy(n,s===2?r:t);return i.set(n,c),c}function Tr(n){return Dn(n)?Tr(n.__v_raw):!!(n&&n.__v_isReactive)}function Dn(n){return!!(n&&n.__v_isReadonly)}function yt(n){return!!(n&&n.__v_isShallow)}function dc(n){return n?!!n.__v_raw:!1}function _e(n){const e=n&&n.__v_raw;return e?_e(e):n}function Qg(n){return!ye(n,"__v_skip")&&Object.isExtensible(n)&&Ea(n,"__v_skip",!0),n}const He=n=>Re(n)?uc(n):n,xs=n=>Re(n)?ed(n):n;function nt(n){return n?n.__v_isRef===!0:!1}function dr(n){return Jg(n,!1)}function Jg(n,e){return nt(n)?n:new Yg(n,e)}class Yg{constructor(e,t){this.dep=new cc,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=t?e:_e(e),this._value=t?e:He(e),this.__v_isShallow=t}get value(){return this.dep.track(),this._value}set value(e){const t=this._rawValue,r=this.__v_isShallow||yt(e)||Dn(e);e=r?e:_e(e),In(e,t)&&(this._rawValue=e,this._value=r?e:He(e),this.dep.trigger())}}function Xg(n){return nt(n)?n.value:n}const Zg={get:(n,e,t)=>e==="__v_raw"?n:Xg(Reflect.get(n,e,t)),set:(n,e,t,r)=>{const i=n[e];return nt(i)&&!nt(t)?(i.value=t,!0):Reflect.set(n,e,t,r)}};function td(n){return Tr(n)?n:new Proxy(n,Zg)}class em{constructor(e,t,r){this.fn=e,this.setter=t,this._value=void 0,this.dep=new cc(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=Ai-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!t,this.isSSR=r}notify(){if(this.flags|=16,!(this.flags&8)&&Ie!==this)return $h(this,!0),!0}get value(){const e=this.dep.track();return zh(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function tm(n,e,t=!1){let r,i;return le(n)?r=n:(r=n.get,i=n.set),new em(r,i,t)}const ms={},Ms=new WeakMap;let Kn;function nm(n,e=!1,t=Kn){if(t){let r=Ms.get(t);r||Ms.set(t,r=[]),r.push(n)}}function rm(n,e,t=we){const{immediate:r,deep:i,once:s,scheduler:a,augmentJob:c,call:u}=t,d=k=>i?k:yt(k)||i===!1||i===0?mn(k,1):mn(k);let f,g,I,S,V=!1,U=!1;if(nt(n)?(g=()=>n.value,V=yt(n)):Tr(n)?(g=()=>d(n),V=!0):oe(n)?(U=!0,V=n.some(k=>Tr(k)||yt(k)),g=()=>n.map(k=>{if(nt(k))return k.value;if(Tr(k))return d(k);if(le(k))return u?u(k,2):k()})):le(n)?e?g=u?()=>u(n,2):n:g=()=>{if(I){Yt();try{I()}finally{Xt()}}const k=Kn;Kn=f;try{return u?u(n,3,[S]):n(S)}finally{Kn=k}}:g=bt,e&&i){const k=g,j=i===!0?1/0:i;g=()=>mn(k(),j)}const B=Cg(),K=()=>{f.stop(),B&&B.active&&tc(B.effects,f)};if(s&&e){const k=e;e=(...j)=>{k(...j),K()}}let J=U?new Array(n.length).fill(ms):ms;const O=k=>{if(!(!(f.flags&1)||!f.dirty&&!k))if(e){const j=f.run();if(i||V||(U?j.some((X,T)=>In(X,J[T])):In(j,J))){I&&I();const X=Kn;Kn=f;try{const T=[j,J===ms?void 0:U&&J[0]===ms?[]:J,S];J=j,u?u(e,3,T):e(...T)}finally{Kn=X}}}else f.run()};return c&&c(O),f=new Bh(g),f.scheduler=a?()=>a(O,!1):O,S=k=>nm(k,!1,f),I=f.onStop=()=>{const k=Ms.get(f);if(k){if(u)u(k,4);else for(const j of k)j();Ms.delete(f)}},e?r?O(!0):J=f.run():a?a(O.bind(null,!0),!0):f.run(),K.pause=f.pause.bind(f),K.resume=f.resume.bind(f),K.stop=K,K}function mn(n,e=1/0,t){if(e<=0||!Re(n)||n.__v_skip||(t=t||new Set,t.has(n)))return n;if(t.add(n),e--,nt(n))mn(n.value,e,t);else if(oe(n))for(let r=0;r<n.length;r++)mn(n[r],e,t);else if(Vh(n)||Er(n))n.forEach(r=>{mn(r,e,t)});else if(xh(n)){for(const r in n)mn(n[r],e,t);for(const r of Object.getOwnPropertySymbols(n))Object.prototype.propertyIsEnumerable.call(n,r)&&mn(n[r],e,t)}return n}/**
* @vue/runtime-core v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function Fi(n,e,t,r){try{return r?n(...r):n()}catch(i){lo(i,e,t)}}function Lt(n,e,t,r){if(le(n)){const i=Fi(n,e,t,r);return i&&Oh(i)&&i.catch(s=>{lo(s,e,t)}),i}if(oe(n)){const i=[];for(let s=0;s<n.length;s++)i.push(Lt(n[s],e,t,r));return i}}function lo(n,e,t,r=!0){const i=e?e.vnode:null,{errorHandler:s,throwUnhandledErrorInProduction:a}=e&&e.appContext.config||we;if(e){let c=e.parent;const u=e.proxy,d=`https://vuejs.org/error-reference/#runtime-${t}`;for(;c;){const f=c.ec;if(f){for(let g=0;g<f.length;g++)if(f[g](n,u,d)===!1)return}c=c.parent}if(s){Yt(),Fi(s,null,10,[n,u,d]),Xt();return}}im(n,t,i,r,a)}function im(n,e,t,r=!0,i=!1){if(i)throw n;console.error(n)}const ot=[];let kt=-1;const Ir=[];let pn=null,pr=0;const nd=Promise.resolve();let Ls=null;function sm(n){const e=Ls||nd;return n?e.then(this?n.bind(this):n):e}function om(n){let e=kt+1,t=ot.length;for(;e<t;){const r=e+t>>>1,i=ot[r],s=Ri(i);s<n||s===n&&i.flags&2?e=r+1:t=r}return e}function fc(n){if(!(n.flags&1)){const e=Ri(n),t=ot[ot.length-1];!t||!(n.flags&2)&&e>=Ri(t)?ot.push(n):ot.splice(om(e),0,n),n.flags|=1,rd()}}function rd(){Ls||(Ls=nd.then(sd))}function am(n){oe(n)?Ir.push(...n):pn&&n.id===-1?pn.splice(pr+1,0,n):n.flags&1||(Ir.push(n),n.flags|=1),rd()}function Zl(n,e,t=kt+1){for(;t<ot.length;t++){const r=ot[t];if(r&&r.flags&2){if(n&&r.id!==n.uid)continue;ot.splice(t,1),t--,r.flags&4&&(r.flags&=-2),r(),r.flags&4||(r.flags&=-2)}}}function id(n){if(Ir.length){const e=[...new Set(Ir)].sort((t,r)=>Ri(t)-Ri(r));if(Ir.length=0,pn){pn.push(...e);return}for(pn=e,pr=0;pr<pn.length;pr++){const t=pn[pr];t.flags&4&&(t.flags&=-2),t.flags&8||t(),t.flags&=-2}pn=null,pr=0}}const Ri=n=>n.id==null?n.flags&2?-1:1/0:n.id;function sd(n){const e=bt;try{for(kt=0;kt<ot.length;kt++){const t=ot[kt];t&&!(t.flags&8)&&(t.flags&4&&(t.flags&=-2),Fi(t,t.i,t.i?15:14),t.flags&4||(t.flags&=-2))}}finally{for(;kt<ot.length;kt++){const t=ot[kt];t&&(t.flags&=-2)}kt=-1,ot.length=0,id(),Ls=null,(ot.length||Ir.length)&&sd()}}let Vt=null,od=null;function Fs(n){const e=Vt;return Vt=n,od=n&&n.type.__scopeId||null,e}function cm(n,e=Vt,t){if(!e||n._n)return n;const r=(...i)=>{r._d&&au(-1);const s=Fs(e);let a;try{a=n(...i)}finally{Fs(s),r._d&&au(1)}return a};return r._n=!0,r._c=!0,r._d=!0,r}function zn(n,e,t,r){const i=n.dirs,s=e&&e.dirs;for(let a=0;a<i.length;a++){const c=i[a];s&&(c.oldValue=s[a].value);let u=c.dir[r];u&&(Yt(),Lt(u,t,8,[n.el,c,n,e]),Xt())}}const lm=Symbol("_vte"),um=n=>n.__isTeleport;function pc(n,e){n.shapeFlag&6&&n.component?(n.transition=e,pc(n.component.subTree,e)):n.shapeFlag&128?(n.ssContent.transition=e.clone(n.ssContent),n.ssFallback.transition=e.clone(n.ssFallback)):n.transition=e}function ad(n){n.ids=[n.ids[0]+n.ids[2]+++"-",0,0]}function gi(n,e,t,r,i=!1){if(oe(n)){n.forEach((V,U)=>gi(V,e&&(oe(e)?e[U]:e),t,r,i));return}if(mi(r)&&!i){r.shapeFlag&512&&r.type.__asyncResolved&&r.component.subTree.component&&gi(n,e,t,r.component.subTree);return}const s=r.shapeFlag&4?vc(r.component):r.el,a=i?null:s,{i:c,r:u}=n,d=e&&e.r,f=c.refs===we?c.refs={}:c.refs,g=c.setupState,I=_e(g),S=g===we?()=>!1:V=>ye(I,V);if(d!=null&&d!==u&&(De(d)?(f[d]=null,S(d)&&(g[d]=null)):nt(d)&&(d.value=null)),le(u))Fi(u,c,12,[a,f]);else{const V=De(u),U=nt(u);if(V||U){const B=()=>{if(n.f){const K=V?S(u)?g[u]:f[u]:u.value;i?oe(K)&&tc(K,s):oe(K)?K.includes(s)||K.push(s):V?(f[u]=[s],S(u)&&(g[u]=f[u])):(u.value=[s],n.k&&(f[n.k]=u.value))}else V?(f[u]=a,S(u)&&(g[u]=a)):U&&(u.value=a,n.k&&(f[n.k]=a))};a?(B.id=-1,dt(B,t)):B()}}}ao().requestIdleCallback;ao().cancelIdleCallback;const mi=n=>!!n.type.__asyncLoader,cd=n=>n.type.__isKeepAlive;function hm(n,e){ld(n,"a",e)}function dm(n,e){ld(n,"da",e)}function ld(n,e,t=at){const r=n.__wdc||(n.__wdc=()=>{let i=t;for(;i;){if(i.isDeactivated)return;i=i.parent}return n()});if(uo(e,r,t),t){let i=t.parent;for(;i&&i.parent;)cd(i.parent.vnode)&&fm(r,e,t,i),i=i.parent}}function fm(n,e,t,r){const i=uo(e,n,r,!0);hd(()=>{tc(r[e],i)},t)}function uo(n,e,t=at,r=!1){if(t){const i=t[n]||(t[n]=[]),s=e.__weh||(e.__weh=(...a)=>{Yt();const c=Ui(t),u=Lt(e,t,n,a);return c(),Xt(),u});return r?i.unshift(s):i.push(s),s}}const sn=n=>(e,t=at)=>{(!Pi||n==="sp")&&uo(n,(...r)=>e(...r),t)},pm=sn("bm"),ud=sn("m"),gm=sn("bu"),mm=sn("u"),_m=sn("bum"),hd=sn("um"),ym=sn("sp"),vm=sn("rtg"),Em=sn("rtc");function Tm(n,e=at){uo("ec",n,e)}const Im=Symbol.for("v-ndc");function ta(n,e,t,r){let i;const s=t&&t[r],a=oe(n);if(a||De(n)){const c=a&&Tr(n);let u=!1,d=!1;c&&(u=!yt(n),d=Dn(n),n=co(n)),i=new Array(n.length);for(let f=0,g=n.length;f<g;f++)i[f]=e(u?d?xs(He(n[f])):He(n[f]):n[f],f,void 0,s&&s[f])}else if(typeof n=="number"){i=new Array(n);for(let c=0;c<n;c++)i[c]=e(c+1,c,void 0,s&&s[c])}else if(Re(n))if(n[Symbol.iterator])i=Array.from(n,(c,u)=>e(c,u,void 0,s&&s[u]));else{const c=Object.keys(n);i=new Array(c.length);for(let u=0,d=c.length;u<d;u++){const f=c[u];i[u]=e(n[f],f,u,s&&s[u])}}else i=[];return t&&(t[r]=i),i}const ba=n=>n?Dd(n)?vc(n):ba(n.parent):null,_i=Ke(Object.create(null),{$:n=>n,$el:n=>n.vnode.el,$data:n=>n.data,$props:n=>n.props,$attrs:n=>n.attrs,$slots:n=>n.slots,$refs:n=>n.refs,$parent:n=>ba(n.parent),$root:n=>ba(n.root),$host:n=>n.ce,$emit:n=>n.emit,$options:n=>gc(n),$forceUpdate:n=>n.f||(n.f=()=>{fc(n.update)}),$nextTick:n=>n.n||(n.n=sm.bind(n.proxy)),$watch:n=>Hm.bind(n)}),na=(n,e)=>n!==we&&!n.__isScriptSetup&&ye(n,e),wm={get({_:n},e){if(e==="__v_skip")return!0;const{ctx:t,setupState:r,data:i,props:s,accessCache:a,type:c,appContext:u}=n;let d;if(e[0]!=="$"){const S=a[e];if(S!==void 0)switch(S){case 1:return r[e];case 2:return i[e];case 4:return t[e];case 3:return s[e]}else{if(na(r,e))return a[e]=1,r[e];if(i!==we&&ye(i,e))return a[e]=2,i[e];if((d=n.propsOptions[0])&&ye(d,e))return a[e]=3,s[e];if(t!==we&&ye(t,e))return a[e]=4,t[e];Ra&&(a[e]=0)}}const f=_i[e];let g,I;if(f)return e==="$attrs"&&et(n.attrs,"get",""),f(n);if((g=c.__cssModules)&&(g=g[e]))return g;if(t!==we&&ye(t,e))return a[e]=4,t[e];if(I=u.config.globalProperties,ye(I,e))return I[e]},set({_:n},e,t){const{data:r,setupState:i,ctx:s}=n;return na(i,e)?(i[e]=t,!0):r!==we&&ye(r,e)?(r[e]=t,!0):ye(n.props,e)||e[0]==="$"&&e.slice(1)in n?!1:(s[e]=t,!0)},has({_:{data:n,setupState:e,accessCache:t,ctx:r,appContext:i,propsOptions:s}},a){let c;return!!t[a]||n!==we&&ye(n,a)||na(e,a)||(c=s[0])&&ye(c,a)||ye(r,a)||ye(_i,a)||ye(i.config.globalProperties,a)},defineProperty(n,e,t){return t.get!=null?n._.accessCache[e]=0:ye(t,"value")&&this.set(n,e,t.value,null),Reflect.defineProperty(n,e,t)}};function eu(n){return oe(n)?n.reduce((e,t)=>(e[t]=null,e),{}):n}let Ra=!0;function Am(n){const e=gc(n),t=n.proxy,r=n.ctx;Ra=!1,e.beforeCreate&&tu(e.beforeCreate,n,"bc");const{data:i,computed:s,methods:a,watch:c,provide:u,inject:d,created:f,beforeMount:g,mounted:I,beforeUpdate:S,updated:V,activated:U,deactivated:B,beforeDestroy:K,beforeUnmount:J,destroyed:O,unmounted:k,render:j,renderTracked:X,renderTriggered:T,errorCaptured:m,serverPrefetch:_,expose:E,inheritAttrs:A,components:R,directives:v,filters:lt}=e;if(d&&bm(d,r,null),a)for(const ve in a){const pe=a[ve];le(pe)&&(r[ve]=pe.bind(t))}if(i){const ve=i.call(t,t);Re(ve)&&(n.data=uc(ve))}if(Ra=!0,s)for(const ve in s){const pe=s[ve],Et=le(pe)?pe.bind(t,t):le(pe.get)?pe.get.bind(t,t):bt,Ln=!le(pe)&&le(pe.set)?pe.set.bind(t):bt,Bt=d_({get:Et,set:Ln});Object.defineProperty(r,ve,{enumerable:!0,configurable:!0,get:()=>Bt.value,set:Ve=>Bt.value=Ve})}if(c)for(const ve in c)dd(c[ve],r,t,ve);if(u){const ve=le(u)?u.call(t):u;Reflect.ownKeys(ve).forEach(pe=>{Dm(pe,ve[pe])})}f&&tu(f,n,"c");function Ue(ve,pe){oe(pe)?pe.forEach(Et=>ve(Et.bind(t))):pe&&ve(pe.bind(t))}if(Ue(pm,g),Ue(ud,I),Ue(gm,S),Ue(mm,V),Ue(hm,U),Ue(dm,B),Ue(Tm,m),Ue(Em,X),Ue(vm,T),Ue(_m,J),Ue(hd,k),Ue(ym,_),oe(E))if(E.length){const ve=n.exposed||(n.exposed={});E.forEach(pe=>{Object.defineProperty(ve,pe,{get:()=>t[pe],set:Et=>t[pe]=Et})})}else n.exposed||(n.exposed={});j&&n.render===bt&&(n.render=j),A!=null&&(n.inheritAttrs=A),R&&(n.components=R),v&&(n.directives=v),_&&ad(n)}function bm(n,e,t=bt){oe(n)&&(n=Sa(n));for(const r in n){const i=n[r];let s;Re(i)?"default"in i?s=ws(i.from||r,i.default,!0):s=ws(i.from||r):s=ws(i),nt(s)?Object.defineProperty(e,r,{enumerable:!0,configurable:!0,get:()=>s.value,set:a=>s.value=a}):e[r]=s}}function tu(n,e,t){Lt(oe(n)?n.map(r=>r.bind(e.proxy)):n.bind(e.proxy),e,t)}function dd(n,e,t,r){let i=r.includes(".")?bd(t,r):()=>t[r];if(De(n)){const s=e[n];le(s)&&ia(i,s)}else if(le(n))ia(i,n.bind(t));else if(Re(n))if(oe(n))n.forEach(s=>dd(s,e,t,r));else{const s=le(n.handler)?n.handler.bind(t):e[n.handler];le(s)&&ia(i,s,n)}}function gc(n){const e=n.type,{mixins:t,extends:r}=e,{mixins:i,optionsCache:s,config:{optionMergeStrategies:a}}=n.appContext,c=s.get(e);let u;return c?u=c:!i.length&&!t&&!r?u=e:(u={},i.length&&i.forEach(d=>Us(u,d,a,!0)),Us(u,e,a)),Re(e)&&s.set(e,u),u}function Us(n,e,t,r=!1){const{mixins:i,extends:s}=e;s&&Us(n,s,t,!0),i&&i.forEach(a=>Us(n,a,t,!0));for(const a in e)if(!(r&&a==="expose")){const c=Rm[a]||t&&t[a];n[a]=c?c(n[a],e[a]):e[a]}return n}const Rm={data:nu,props:ru,emits:ru,methods:ci,computed:ci,beforeCreate:st,created:st,beforeMount:st,mounted:st,beforeUpdate:st,updated:st,beforeDestroy:st,beforeUnmount:st,destroyed:st,unmounted:st,activated:st,deactivated:st,errorCaptured:st,serverPrefetch:st,components:ci,directives:ci,watch:Pm,provide:nu,inject:Sm};function nu(n,e){return e?n?function(){return Ke(le(n)?n.call(this,this):n,le(e)?e.call(this,this):e)}:e:n}function Sm(n,e){return ci(Sa(n),Sa(e))}function Sa(n){if(oe(n)){const e={};for(let t=0;t<n.length;t++)e[n[t]]=n[t];return e}return n}function st(n,e){return n?[...new Set([].concat(n,e))]:e}function ci(n,e){return n?Ke(Object.create(null),n,e):e}function ru(n,e){return n?oe(n)&&oe(e)?[...new Set([...n,...e])]:Ke(Object.create(null),eu(n),eu(e??{})):e}function Pm(n,e){if(!n)return e;if(!e)return n;const t=Ke(Object.create(null),n);for(const r in e)t[r]=st(n[r],e[r]);return t}function fd(){return{app:null,config:{isNativeTag:mg,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let Cm=0;function km(n,e){return function(r,i=null){le(r)||(r=Ke({},r)),i!=null&&!Re(i)&&(i=null);const s=fd(),a=new WeakSet,c=[];let u=!1;const d=s.app={_uid:Cm++,_component:r,_props:i,_container:null,_context:s,_instance:null,version:f_,get config(){return s.config},set config(f){},use(f,...g){return a.has(f)||(f&&le(f.install)?(a.add(f),f.install(d,...g)):le(f)&&(a.add(f),f(d,...g))),d},mixin(f){return s.mixins.includes(f)||s.mixins.push(f),d},component(f,g){return g?(s.components[f]=g,d):s.components[f]},directive(f,g){return g?(s.directives[f]=g,d):s.directives[f]},mount(f,g,I){if(!u){const S=d._ceVNode||wn(r,i);return S.appContext=s,I===!0?I="svg":I===!1&&(I=void 0),g&&e?e(S,f):n(S,f,I),u=!0,d._container=f,f.__vue_app__=d,vc(S.component)}},onUnmount(f){c.push(f)},unmount(){u&&(Lt(c,d._instance,16),n(null,d._container),delete d._container.__vue_app__)},provide(f,g){return s.provides[f]=g,d},runWithContext(f){const g=wr;wr=d;try{return f()}finally{wr=g}}};return d}}let wr=null;function Dm(n,e){if(at){let t=at.provides;const r=at.parent&&at.parent.provides;r===t&&(t=at.provides=Object.create(r)),t[n]=e}}function ws(n,e,t=!1){const r=at||Vt;if(r||wr){let i=wr?wr._context.provides:r?r.parent==null||r.ce?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:void 0;if(i&&n in i)return i[n];if(arguments.length>1)return t&&le(e)?e.call(r&&r.proxy):e}}const pd={},gd=()=>Object.create(pd),md=n=>Object.getPrototypeOf(n)===pd;function Vm(n,e,t,r=!1){const i={},s=gd();n.propsDefaults=Object.create(null),_d(n,e,i,s);for(const a in n.propsOptions[0])a in i||(i[a]=void 0);t?n.props=r?i:Gg(i):n.type.props?n.props=i:n.props=s,n.attrs=s}function Om(n,e,t,r){const{props:i,attrs:s,vnode:{patchFlag:a}}=n,c=_e(i),[u]=n.propsOptions;let d=!1;if((r||a>0)&&!(a&16)){if(a&8){const f=n.vnode.dynamicProps;for(let g=0;g<f.length;g++){let I=f[g];if(ho(n.emitsOptions,I))continue;const S=e[I];if(u)if(ye(s,I))S!==s[I]&&(s[I]=S,d=!0);else{const V=kn(I);i[V]=Pa(u,c,V,S,n,!1)}else S!==s[I]&&(s[I]=S,d=!0)}}}else{_d(n,e,i,s)&&(d=!0);let f;for(const g in c)(!e||!ye(e,g)&&((f=rr(g))===g||!ye(e,f)))&&(u?t&&(t[g]!==void 0||t[f]!==void 0)&&(i[g]=Pa(u,c,g,void 0,n,!0)):delete i[g]);if(s!==c)for(const g in s)(!e||!ye(e,g))&&(delete s[g],d=!0)}d&&zt(n.attrs,"set","")}function _d(n,e,t,r){const[i,s]=n.propsOptions;let a=!1,c;if(e)for(let u in e){if(di(u))continue;const d=e[u];let f;i&&ye(i,f=kn(u))?!s||!s.includes(f)?t[f]=d:(c||(c={}))[f]=d:ho(n.emitsOptions,u)||(!(u in r)||d!==r[u])&&(r[u]=d,a=!0)}if(s){const u=_e(t),d=c||we;for(let f=0;f<s.length;f++){const g=s[f];t[g]=Pa(i,u,g,d[g],n,!ye(d,g))}}return a}function Pa(n,e,t,r,i,s){const a=n[t];if(a!=null){const c=ye(a,"default");if(c&&r===void 0){const u=a.default;if(a.type!==Function&&!a.skipFactory&&le(u)){const{propsDefaults:d}=i;if(t in d)r=d[t];else{const f=Ui(i);r=d[t]=u.call(null,e),f()}}else r=u;i.ce&&i.ce._setProp(t,r)}a[0]&&(s&&!c?r=!1:a[1]&&(r===""||r===rr(t))&&(r=!0))}return r}const Nm=new WeakMap;function yd(n,e,t=!1){const r=t?Nm:e.propsCache,i=r.get(n);if(i)return i;const s=n.props,a={},c=[];let u=!1;if(!le(n)){const f=g=>{u=!0;const[I,S]=yd(g,e,!0);Ke(a,I),S&&c.push(...S)};!t&&e.mixins.length&&e.mixins.forEach(f),n.extends&&f(n.extends),n.mixins&&n.mixins.forEach(f)}if(!s&&!u)return Re(n)&&r.set(n,vr),vr;if(oe(s))for(let f=0;f<s.length;f++){const g=kn(s[f]);iu(g)&&(a[g]=we)}else if(s)for(const f in s){const g=kn(f);if(iu(g)){const I=s[f],S=a[g]=oe(I)||le(I)?{type:I}:Ke({},I),V=S.type;let U=!1,B=!0;if(oe(V))for(let K=0;K<V.length;++K){const J=V[K],O=le(J)&&J.name;if(O==="Boolean"){U=!0;break}else O==="String"&&(B=!1)}else U=le(V)&&V.name==="Boolean";S[0]=U,S[1]=B,(U||ye(S,"default"))&&c.push(g)}}const d=[a,c];return Re(n)&&r.set(n,d),d}function iu(n){return n[0]!=="$"&&!di(n)}const mc=n=>n[0]==="_"||n==="$stable",_c=n=>oe(n)?n.map(Dt):[Dt(n)],xm=(n,e,t)=>{if(e._n)return e;const r=cm((...i)=>_c(e(...i)),t);return r._c=!1,r},vd=(n,e,t)=>{const r=n._ctx;for(const i in n){if(mc(i))continue;const s=n[i];if(le(s))e[i]=xm(i,s,r);else if(s!=null){const a=_c(s);e[i]=()=>a}}},Ed=(n,e)=>{const t=_c(e);n.slots.default=()=>t},Td=(n,e,t)=>{for(const r in e)(t||!mc(r))&&(n[r]=e[r])},Mm=(n,e,t)=>{const r=n.slots=gd();if(n.vnode.shapeFlag&32){const i=e.__;i&&Ea(r,"__",i,!0);const s=e._;s?(Td(r,e,t),t&&Ea(r,"_",s,!0)):vd(e,r)}else e&&Ed(n,e)},Lm=(n,e,t)=>{const{vnode:r,slots:i}=n;let s=!0,a=we;if(r.shapeFlag&32){const c=e._;c?t&&c===1?s=!1:Td(i,e,t):(s=!e.$stable,vd(e,i)),a=e}else e&&(Ed(n,e),a={default:1});if(s)for(const c in i)!mc(c)&&a[c]==null&&delete i[c]},dt=Ym;function Fm(n){return Um(n)}function Um(n,e){const t=ao();t.__VUE__=!0;const{insert:r,remove:i,patchProp:s,createElement:a,createText:c,createComment:u,setText:d,setElementText:f,parentNode:g,nextSibling:I,setScopeId:S=bt,insertStaticContent:V}=n,U=(y,w,C,L=null,D=null,x=null,z=void 0,q=null,$=!!w.dynamicChildren)=>{if(y===w)return;y&&!oi(y,w)&&(L=Pt(y),Ve(y,D,x,!0),y=null),w.patchFlag===-2&&($=!1,w.dynamicChildren=null);const{type:F,ref:Y,shapeFlag:W}=w;switch(F){case fo:B(y,w,C,L);break;case Pr:K(y,w,C,L);break;case oa:y==null&&J(w,C,L,z);break;case mt:R(y,w,C,L,D,x,z,q,$);break;default:W&1?j(y,w,C,L,D,x,z,q,$):W&6?v(y,w,C,L,D,x,z,q,$):(W&64||W&128)&&F.process(y,w,C,L,D,x,z,q,$,Tt)}Y!=null&&D?gi(Y,y&&y.ref,x,w||y,!w):Y==null&&y&&y.ref!=null&&gi(y.ref,null,x,y,!0)},B=(y,w,C,L)=>{if(y==null)r(w.el=c(w.children),C,L);else{const D=w.el=y.el;w.children!==y.children&&d(D,w.children)}},K=(y,w,C,L)=>{y==null?r(w.el=u(w.children||""),C,L):w.el=y.el},J=(y,w,C,L)=>{[y.el,y.anchor]=V(y.children,w,C,L,y.el,y.anchor)},O=({el:y,anchor:w},C,L)=>{let D;for(;y&&y!==w;)D=I(y),r(y,C,L),y=D;r(w,C,L)},k=({el:y,anchor:w})=>{let C;for(;y&&y!==w;)C=I(y),i(y),y=C;i(w)},j=(y,w,C,L,D,x,z,q,$)=>{w.type==="svg"?z="svg":w.type==="math"&&(z="mathml"),y==null?X(w,C,L,D,x,z,q,$):_(y,w,D,x,z,q,$)},X=(y,w,C,L,D,x,z,q)=>{let $,F;const{props:Y,shapeFlag:W,transition:Q,dirs:ne}=y;if($=y.el=a(y.type,x,Y&&Y.is,Y),W&8?f($,y.children):W&16&&m(y.children,$,null,L,D,ra(y,x),z,q),ne&&zn(y,null,L,"created"),T($,y,y.scopeId,z,L),Y){for(const ce in Y)ce!=="value"&&!di(ce)&&s($,ce,null,Y[ce],x,L);"value"in Y&&s($,"value",null,Y.value,x),(F=Y.onVnodeBeforeMount)&&Ct(F,L,y)}ne&&zn(y,null,L,"beforeMount");const te=Bm(D,Q);te&&Q.beforeEnter($),r($,w,C),((F=Y&&Y.onVnodeMounted)||te||ne)&&dt(()=>{F&&Ct(F,L,y),te&&Q.enter($),ne&&zn(y,null,L,"mounted")},D)},T=(y,w,C,L,D)=>{if(C&&S(y,C),L)for(let x=0;x<L.length;x++)S(y,L[x]);if(D){let x=D.subTree;if(w===x||Sd(x.type)&&(x.ssContent===w||x.ssFallback===w)){const z=D.vnode;T(y,z,z.scopeId,z.slotScopeIds,D.parent)}}},m=(y,w,C,L,D,x,z,q,$=0)=>{for(let F=$;F<y.length;F++){const Y=y[F]=q?gn(y[F]):Dt(y[F]);U(null,Y,w,C,L,D,x,z,q)}},_=(y,w,C,L,D,x,z)=>{const q=w.el=y.el;let{patchFlag:$,dynamicChildren:F,dirs:Y}=w;$|=y.patchFlag&16;const W=y.props||we,Q=w.props||we;let ne;if(C&&Wn(C,!1),(ne=Q.onVnodeBeforeUpdate)&&Ct(ne,C,w,y),Y&&zn(w,y,C,"beforeUpdate"),C&&Wn(C,!0),(W.innerHTML&&Q.innerHTML==null||W.textContent&&Q.textContent==null)&&f(q,""),F?E(y.dynamicChildren,F,q,C,L,ra(w,D),x):z||pe(y,w,q,null,C,L,ra(w,D),x,!1),$>0){if($&16)A(q,W,Q,C,D);else if($&2&&W.class!==Q.class&&s(q,"class",null,Q.class,D),$&4&&s(q,"style",W.style,Q.style,D),$&8){const te=w.dynamicProps;for(let ce=0;ce<te.length;ce++){const de=te[ce],Be=W[de],Ne=Q[de];(Ne!==Be||de==="value")&&s(q,de,Be,Ne,D,C)}}$&1&&y.children!==w.children&&f(q,w.children)}else!z&&F==null&&A(q,W,Q,C,D);((ne=Q.onVnodeUpdated)||Y)&&dt(()=>{ne&&Ct(ne,C,w,y),Y&&zn(w,y,C,"updated")},L)},E=(y,w,C,L,D,x,z)=>{for(let q=0;q<w.length;q++){const $=y[q],F=w[q],Y=$.el&&($.type===mt||!oi($,F)||$.shapeFlag&198)?g($.el):C;U($,F,Y,null,L,D,x,z,!0)}},A=(y,w,C,L,D)=>{if(w!==C){if(w!==we)for(const x in w)!di(x)&&!(x in C)&&s(y,x,w[x],null,D,L);for(const x in C){if(di(x))continue;const z=C[x],q=w[x];z!==q&&x!=="value"&&s(y,x,q,z,D,L)}"value"in C&&s(y,"value",w.value,C.value,D)}},R=(y,w,C,L,D,x,z,q,$)=>{const F=w.el=y?y.el:c(""),Y=w.anchor=y?y.anchor:c("");let{patchFlag:W,dynamicChildren:Q,slotScopeIds:ne}=w;ne&&(q=q?q.concat(ne):ne),y==null?(r(F,C,L),r(Y,C,L),m(w.children||[],C,Y,D,x,z,q,$)):W>0&&W&64&&Q&&y.dynamicChildren?(E(y.dynamicChildren,Q,C,D,x,z,q),(w.key!=null||D&&w===D.subTree)&&Id(y,w,!0)):pe(y,w,C,Y,D,x,z,q,$)},v=(y,w,C,L,D,x,z,q,$)=>{w.slotScopeIds=q,y==null?w.shapeFlag&512?D.ctx.activate(w,C,L,z,$):lt(w,C,L,D,x,z,$):an(y,w,$)},lt=(y,w,C,L,D,x,z)=>{const q=y.component=o_(y,L,D);if(cd(y)&&(q.ctx.renderer=Tt),a_(q,!1,z),q.asyncDep){if(D&&D.registerDep(q,Ue,z),!y.el){const $=q.subTree=wn(Pr);K(null,$,w,C)}}else Ue(q,y,w,C,D,x,z)},an=(y,w,C)=>{const L=w.component=y.component;if(Qm(y,w,C))if(L.asyncDep&&!L.asyncResolved){ve(L,w,C);return}else L.next=w,L.update();else w.el=y.el,L.vnode=w},Ue=(y,w,C,L,D,x,z)=>{const q=()=>{if(y.isMounted){let{next:W,bu:Q,u:ne,parent:te,vnode:ce}=y;{const xe=wd(y);if(xe){W&&(W.el=ce.el,ve(y,W,z)),xe.asyncDep.then(()=>{y.isUnmounted||q()});return}}let de=W,Be;Wn(y,!1),W?(W.el=ce.el,ve(y,W,z)):W=ce,Q&&Jo(Q),(Be=W.props&&W.props.onVnodeBeforeUpdate)&&Ct(Be,te,W,ce),Wn(y,!0);const Ne=sa(y),ut=y.subTree;y.subTree=Ne,U(ut,Ne,g(ut.el),Pt(ut),y,D,x),W.el=Ne.el,de===null&&Jm(y,Ne.el),ne&&dt(ne,D),(Be=W.props&&W.props.onVnodeUpdated)&&dt(()=>Ct(Be,te,W,ce),D)}else{let W;const{el:Q,props:ne}=w,{bm:te,m:ce,parent:de,root:Be,type:Ne}=y,ut=mi(w);if(Wn(y,!1),te&&Jo(te),!ut&&(W=ne&&ne.onVnodeBeforeMount)&&Ct(W,de,w),Wn(y,!0),Q&&Bn){const xe=()=>{y.subTree=sa(y),Bn(Q,y.subTree,y,D,null)};ut&&Ne.__asyncHydrate?Ne.__asyncHydrate(Q,y,xe):xe()}else{Be.ce&&Be.ce._def.shadowRoot!==!1&&Be.ce._injectChildStyle(Ne);const xe=y.subTree=sa(y);U(null,xe,C,L,y,D,x),w.el=xe.el}if(ce&&dt(ce,D),!ut&&(W=ne&&ne.onVnodeMounted)){const xe=w;dt(()=>Ct(W,de,xe),D)}(w.shapeFlag&256||de&&mi(de.vnode)&&de.vnode.shapeFlag&256)&&y.a&&dt(y.a,D),y.isMounted=!0,w=C=L=null}};y.scope.on();const $=y.effect=new Bh(q);y.scope.off();const F=y.update=$.run.bind($),Y=y.job=$.runIfDirty.bind($);Y.i=y,Y.id=y.uid,$.scheduler=()=>fc(Y),Wn(y,!0),F()},ve=(y,w,C)=>{w.component=y;const L=y.vnode.props;y.vnode=w,y.next=null,Om(y,w.props,L,C),Lm(y,w.children,C),Yt(),Zl(y),Xt()},pe=(y,w,C,L,D,x,z,q,$=!1)=>{const F=y&&y.children,Y=y?y.shapeFlag:0,W=w.children,{patchFlag:Q,shapeFlag:ne}=w;if(Q>0){if(Q&128){Ln(F,W,C,L,D,x,z,q,$);return}else if(Q&256){Et(F,W,C,L,D,x,z,q,$);return}}ne&8?(Y&16&&Un(F,D,x),W!==F&&f(C,W)):Y&16?ne&16?Ln(F,W,C,L,D,x,z,q,$):Un(F,D,x,!0):(Y&8&&f(C,""),ne&16&&m(W,C,L,D,x,z,q,$))},Et=(y,w,C,L,D,x,z,q,$)=>{y=y||vr,w=w||vr;const F=y.length,Y=w.length,W=Math.min(F,Y);let Q;for(Q=0;Q<W;Q++){const ne=w[Q]=$?gn(w[Q]):Dt(w[Q]);U(y[Q],ne,C,null,D,x,z,q,$)}F>Y?Un(y,D,x,!0,!1,W):m(w,C,L,D,x,z,q,$,W)},Ln=(y,w,C,L,D,x,z,q,$)=>{let F=0;const Y=w.length;let W=y.length-1,Q=Y-1;for(;F<=W&&F<=Q;){const ne=y[F],te=w[F]=$?gn(w[F]):Dt(w[F]);if(oi(ne,te))U(ne,te,C,null,D,x,z,q,$);else break;F++}for(;F<=W&&F<=Q;){const ne=y[W],te=w[Q]=$?gn(w[Q]):Dt(w[Q]);if(oi(ne,te))U(ne,te,C,null,D,x,z,q,$);else break;W--,Q--}if(F>W){if(F<=Q){const ne=Q+1,te=ne<Y?w[ne].el:L;for(;F<=Q;)U(null,w[F]=$?gn(w[F]):Dt(w[F]),C,te,D,x,z,q,$),F++}}else if(F>Q)for(;F<=W;)Ve(y[F],D,x,!0),F++;else{const ne=F,te=F,ce=new Map;for(F=te;F<=Q;F++){const je=w[F]=$?gn(w[F]):Dt(w[F]);je.key!=null&&ce.set(je.key,F)}let de,Be=0;const Ne=Q-te+1;let ut=!1,xe=0;const ln=new Array(Ne);for(F=0;F<Ne;F++)ln[F]=0;for(F=ne;F<=W;F++){const je=y[F];if(Be>=Ne){Ve(je,D,x,!0);continue}let pt;if(je.key!=null)pt=ce.get(je.key);else for(de=te;de<=Q;de++)if(ln[de-te]===0&&oi(je,w[de])){pt=de;break}pt===void 0?Ve(je,D,x,!0):(ln[pt-te]=F+1,pt>=xe?xe=pt:ut=!0,U(je,w[pt],C,null,D,x,z,q,$),Be++)}const Wr=ut?jm(ln):vr;for(de=Wr.length-1,F=Ne-1;F>=0;F--){const je=te+F,pt=w[je],Xi=je+1<Y?w[je+1].el:L;ln[F]===0?U(null,pt,C,Xi,D,x,z,q,$):ut&&(de<0||F!==Wr[de]?Bt(pt,C,Xi,2):de--)}}},Bt=(y,w,C,L,D=null)=>{const{el:x,type:z,transition:q,children:$,shapeFlag:F}=y;if(F&6){Bt(y.component.subTree,w,C,L);return}if(F&128){y.suspense.move(w,C,L);return}if(F&64){z.move(y,w,C,Tt);return}if(z===mt){r(x,w,C);for(let W=0;W<$.length;W++)Bt($[W],w,C,L);r(y.anchor,w,C);return}if(z===oa){O(y,w,C);return}if(L!==2&&F&1&&q)if(L===0)q.beforeEnter(x),r(x,w,C),dt(()=>q.enter(x),D);else{const{leave:W,delayLeave:Q,afterLeave:ne}=q,te=()=>{y.ctx.isUnmounted?i(x):r(x,w,C)},ce=()=>{W(x,()=>{te(),ne&&ne()})};Q?Q(x,te,ce):ce()}else r(x,w,C)},Ve=(y,w,C,L=!1,D=!1)=>{const{type:x,props:z,ref:q,children:$,dynamicChildren:F,shapeFlag:Y,patchFlag:W,dirs:Q,cacheIndex:ne}=y;if(W===-2&&(D=!1),q!=null&&(Yt(),gi(q,null,C,y,!0),Xt()),ne!=null&&(w.renderCache[ne]=void 0),Y&256){w.ctx.deactivate(y);return}const te=Y&1&&Q,ce=!mi(y);let de;if(ce&&(de=z&&z.onVnodeBeforeUnmount)&&Ct(de,w,y),Y&6)Fn(y.component,C,L);else{if(Y&128){y.suspense.unmount(C,L);return}te&&zn(y,null,w,"beforeUnmount"),Y&64?y.type.remove(y,w,C,Tt,L):F&&!F.hasOnce&&(x!==mt||W>0&&W&64)?Un(F,w,C,!1,!0):(x===mt&&W&384||!D&&Y&16)&&Un($,w,C),L&&Oe(y)}(ce&&(de=z&&z.onVnodeUnmounted)||te)&&dt(()=>{de&&Ct(de,w,y),te&&zn(y,null,w,"unmounted")},C)},Oe=y=>{const{type:w,el:C,anchor:L,transition:D}=y;if(w===mt){Oo(C,L);return}if(w===oa){k(y);return}const x=()=>{i(C),D&&!D.persisted&&D.afterLeave&&D.afterLeave()};if(y.shapeFlag&1&&D&&!D.persisted){const{leave:z,delayLeave:q}=D,$=()=>z(C,x);q?q(y.el,x,$):$()}else x()},Oo=(y,w)=>{let C;for(;y!==w;)C=I(y),i(y),y=C;i(w)},Fn=(y,w,C)=>{const{bum:L,scope:D,job:x,subTree:z,um:q,m:$,a:F,parent:Y,slots:{__:W}}=y;su($),su(F),L&&Jo(L),Y&&oe(W)&&W.forEach(Q=>{Y.renderCache[Q]=void 0}),D.stop(),x&&(x.flags|=8,Ve(z,y,w,C)),q&&dt(q,w),dt(()=>{y.isUnmounted=!0},w),w&&w.pendingBranch&&!w.isUnmounted&&y.asyncDep&&!y.asyncResolved&&y.suspenseId===w.pendingId&&(w.deps--,w.deps===0&&w.resolve())},Un=(y,w,C,L=!1,D=!1,x=0)=>{for(let z=x;z<y.length;z++)Ve(y[z],w,C,L,D)},Pt=y=>{if(y.shapeFlag&6)return Pt(y.component.subTree);if(y.shapeFlag&128)return y.suspense.next();const w=I(y.anchor||y.el),C=w&&w[lm];return C?I(C):w};let zr=!1;const Yi=(y,w,C)=>{y==null?w._vnode&&Ve(w._vnode,null,null,!0):U(w._vnode||null,y,w,null,null,null,C),w._vnode=y,zr||(zr=!0,Zl(),id(),zr=!1)},Tt={p:U,um:Ve,m:Bt,r:Oe,mt:lt,mc:m,pc:pe,pbc:E,n:Pt,o:n};let cn,Bn;return e&&([cn,Bn]=e(Tt)),{render:Yi,hydrate:cn,createApp:km(Yi,cn)}}function ra({type:n,props:e},t){return t==="svg"&&n==="foreignObject"||t==="mathml"&&n==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:t}function Wn({effect:n,job:e},t){t?(n.flags|=32,e.flags|=4):(n.flags&=-33,e.flags&=-5)}function Bm(n,e){return(!n||n&&!n.pendingBranch)&&e&&!e.persisted}function Id(n,e,t=!1){const r=n.children,i=e.children;if(oe(r)&&oe(i))for(let s=0;s<r.length;s++){const a=r[s];let c=i[s];c.shapeFlag&1&&!c.dynamicChildren&&((c.patchFlag<=0||c.patchFlag===32)&&(c=i[s]=gn(i[s]),c.el=a.el),!t&&c.patchFlag!==-2&&Id(a,c)),c.type===fo&&(c.el=a.el),c.type===Pr&&!c.el&&(c.el=a.el)}}function jm(n){const e=n.slice(),t=[0];let r,i,s,a,c;const u=n.length;for(r=0;r<u;r++){const d=n[r];if(d!==0){if(i=t[t.length-1],n[i]<d){e[r]=i,t.push(r);continue}for(s=0,a=t.length-1;s<a;)c=s+a>>1,n[t[c]]<d?s=c+1:a=c;d<n[t[s]]&&(s>0&&(e[r]=t[s-1]),t[s]=r)}}for(s=t.length,a=t[s-1];s-- >0;)t[s]=a,a=e[a];return t}function wd(n){const e=n.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:wd(e)}function su(n){if(n)for(let e=0;e<n.length;e++)n[e].flags|=8}const $m=Symbol.for("v-scx"),qm=()=>ws($m);function ia(n,e,t){return Ad(n,e,t)}function Ad(n,e,t=we){const{immediate:r,deep:i,flush:s,once:a}=t,c=Ke({},t),u=e&&r||!e&&s!=="post";let d;if(Pi){if(s==="sync"){const S=qm();d=S.__watcherHandles||(S.__watcherHandles=[])}else if(!u){const S=()=>{};return S.stop=bt,S.resume=bt,S.pause=bt,S}}const f=at;c.call=(S,V,U)=>Lt(S,f,V,U);let g=!1;s==="post"?c.scheduler=S=>{dt(S,f&&f.suspense)}:s!=="sync"&&(g=!0,c.scheduler=(S,V)=>{V?S():fc(S)}),c.augmentJob=S=>{e&&(S.flags|=4),g&&(S.flags|=2,f&&(S.id=f.uid,S.i=f))};const I=rm(n,e,c);return Pi&&(d?d.push(I):u&&I()),I}function Hm(n,e,t){const r=this.proxy,i=De(n)?n.includes(".")?bd(r,n):()=>r[n]:n.bind(r,r);let s;le(e)?s=e:(s=e.handler,t=e);const a=Ui(this),c=Ad(i,s.bind(r),t);return a(),c}function bd(n,e){const t=e.split(".");return()=>{let r=n;for(let i=0;i<t.length&&r;i++)r=r[t[i]];return r}}const zm=(n,e)=>e==="modelValue"||e==="model-value"?n.modelModifiers:n[`${e}Modifiers`]||n[`${kn(e)}Modifiers`]||n[`${rr(e)}Modifiers`];function Wm(n,e,...t){if(n.isUnmounted)return;const r=n.vnode.props||we;let i=t;const s=e.startsWith("update:"),a=s&&zm(r,e.slice(7));a&&(a.trim&&(i=t.map(f=>De(f)?f.trim():f)),a.number&&(i=t.map(Tg)));let c,u=r[c=Qo(e)]||r[c=Qo(kn(e))];!u&&s&&(u=r[c=Qo(rr(e))]),u&&Lt(u,n,6,i);const d=r[c+"Once"];if(d){if(!n.emitted)n.emitted={};else if(n.emitted[c])return;n.emitted[c]=!0,Lt(d,n,6,i)}}function Rd(n,e,t=!1){const r=e.emitsCache,i=r.get(n);if(i!==void 0)return i;const s=n.emits;let a={},c=!1;if(!le(n)){const u=d=>{const f=Rd(d,e,!0);f&&(c=!0,Ke(a,f))};!t&&e.mixins.length&&e.mixins.forEach(u),n.extends&&u(n.extends),n.mixins&&n.mixins.forEach(u)}return!s&&!c?(Re(n)&&r.set(n,null),null):(oe(s)?s.forEach(u=>a[u]=null):Ke(a,s),Re(n)&&r.set(n,a),a)}function ho(n,e){return!n||!io(e)?!1:(e=e.slice(2).replace(/Once$/,""),ye(n,e[0].toLowerCase()+e.slice(1))||ye(n,rr(e))||ye(n,e))}function sa(n){const{type:e,vnode:t,proxy:r,withProxy:i,propsOptions:[s],slots:a,attrs:c,emit:u,render:d,renderCache:f,props:g,data:I,setupState:S,ctx:V,inheritAttrs:U}=n,B=Fs(n);let K,J;try{if(t.shapeFlag&4){const k=i||r,j=k;K=Dt(d.call(j,k,f,g,S,I,V)),J=c}else{const k=e;K=Dt(k.length>1?k(g,{attrs:c,slots:a,emit:u}):k(g,null)),J=e.props?c:Km(c)}}catch(k){yi.length=0,lo(k,n,1),K=wn(Pr)}let O=K;if(J&&U!==!1){const k=Object.keys(J),{shapeFlag:j}=O;k.length&&j&7&&(s&&k.some(ec)&&(J=Gm(J,s)),O=Cr(O,J,!1,!0))}return t.dirs&&(O=Cr(O,null,!1,!0),O.dirs=O.dirs?O.dirs.concat(t.dirs):t.dirs),t.transition&&pc(O,t.transition),K=O,Fs(B),K}const Km=n=>{let e;for(const t in n)(t==="class"||t==="style"||io(t))&&((e||(e={}))[t]=n[t]);return e},Gm=(n,e)=>{const t={};for(const r in n)(!ec(r)||!(r.slice(9)in e))&&(t[r]=n[r]);return t};function Qm(n,e,t){const{props:r,children:i,component:s}=n,{props:a,children:c,patchFlag:u}=e,d=s.emitsOptions;if(e.dirs||e.transition)return!0;if(t&&u>=0){if(u&1024)return!0;if(u&16)return r?ou(r,a,d):!!a;if(u&8){const f=e.dynamicProps;for(let g=0;g<f.length;g++){const I=f[g];if(a[I]!==r[I]&&!ho(d,I))return!0}}}else return(i||c)&&(!c||!c.$stable)?!0:r===a?!1:r?a?ou(r,a,d):!0:!!a;return!1}function ou(n,e,t){const r=Object.keys(e);if(r.length!==Object.keys(n).length)return!0;for(let i=0;i<r.length;i++){const s=r[i];if(e[s]!==n[s]&&!ho(t,s))return!0}return!1}function Jm({vnode:n,parent:e},t){for(;e;){const r=e.subTree;if(r.suspense&&r.suspense.activeBranch===n&&(r.el=n.el),r===n)(n=e.vnode).el=t,e=e.parent;else break}}const Sd=n=>n.__isSuspense;function Ym(n,e){e&&e.pendingBranch?oe(n)?e.effects.push(...n):e.effects.push(n):am(n)}const mt=Symbol.for("v-fgt"),fo=Symbol.for("v-txt"),Pr=Symbol.for("v-cmt"),oa=Symbol.for("v-stc"),yi=[];let ft=null;function gt(n=!1){yi.push(ft=n?null:[])}function Xm(){yi.pop(),ft=yi[yi.length-1]||null}let Si=1;function au(n,e=!1){Si+=n,n<0&&ft&&e&&(ft.hasOnce=!0)}function Pd(n){return n.dynamicChildren=Si>0?ft||vr:null,Xm(),Si>0&&ft&&ft.push(n),n}function wt(n,e,t,r,i,s){return Pd(Xe(n,e,t,r,i,s,!0))}function Zm(n,e,t,r,i){return Pd(wn(n,e,t,r,i,!0))}function Cd(n){return n?n.__v_isVNode===!0:!1}function oi(n,e){return n.type===e.type&&n.key===e.key}const kd=({key:n})=>n??null,As=({ref:n,ref_key:e,ref_for:t})=>(typeof n=="number"&&(n=""+n),n!=null?De(n)||nt(n)||le(n)?{i:Vt,r:n,k:e,f:!!t}:n:null);function Xe(n,e=null,t=null,r=0,i=null,s=n===mt?0:1,a=!1,c=!1){const u={__v_isVNode:!0,__v_skip:!0,type:n,props:e,key:e&&kd(e),ref:e&&As(e),scopeId:od,slotScopeIds:null,children:t,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:s,patchFlag:r,dynamicProps:i,dynamicChildren:null,appContext:null,ctx:Vt};return c?(yc(u,t),s&128&&n.normalize(u)):t&&(u.shapeFlag|=De(t)?8:16),Si>0&&!a&&ft&&(u.patchFlag>0||s&6)&&u.patchFlag!==32&&ft.push(u),u}const wn=e_;function e_(n,e=null,t=null,r=0,i=null,s=!1){if((!n||n===Im)&&(n=Pr),Cd(n)){const c=Cr(n,e,!0);return t&&yc(c,t),Si>0&&!s&&ft&&(c.shapeFlag&6?ft[ft.indexOf(n)]=c:ft.push(c)),c.patchFlag=-2,c}if(h_(n)&&(n=n.__vccOpts),e){e=t_(e);let{class:c,style:u}=e;c&&!De(c)&&(e.class=ic(c)),Re(u)&&(dc(u)&&!oe(u)&&(u=Ke({},u)),e.style=rc(u))}const a=De(n)?1:Sd(n)?128:um(n)?64:Re(n)?4:le(n)?2:0;return Xe(n,e,t,r,i,a,s,!0)}function t_(n){return n?dc(n)||md(n)?Ke({},n):n:null}function Cr(n,e,t=!1,r=!1){const{props:i,ref:s,patchFlag:a,children:c,transition:u}=n,d=e?r_(i||{},e):i,f={__v_isVNode:!0,__v_skip:!0,type:n.type,props:d,key:d&&kd(d),ref:e&&e.ref?t&&s?oe(s)?s.concat(As(e)):[s,As(e)]:As(e):s,scopeId:n.scopeId,slotScopeIds:n.slotScopeIds,children:c,target:n.target,targetStart:n.targetStart,targetAnchor:n.targetAnchor,staticCount:n.staticCount,shapeFlag:n.shapeFlag,patchFlag:e&&n.type!==mt?a===-1?16:a|16:a,dynamicProps:n.dynamicProps,dynamicChildren:n.dynamicChildren,appContext:n.appContext,dirs:n.dirs,transition:u,component:n.component,suspense:n.suspense,ssContent:n.ssContent&&Cr(n.ssContent),ssFallback:n.ssFallback&&Cr(n.ssFallback),el:n.el,anchor:n.anchor,ctx:n.ctx,ce:n.ce};return u&&r&&pc(f,u.clone(f)),f}function n_(n=" ",e=0){return wn(fo,null,n,e)}function Dt(n){return n==null||typeof n=="boolean"?wn(Pr):oe(n)?wn(mt,null,n.slice()):Cd(n)?gn(n):wn(fo,null,String(n))}function gn(n){return n.el===null&&n.patchFlag!==-1||n.memo?n:Cr(n)}function yc(n,e){let t=0;const{shapeFlag:r}=n;if(e==null)e=null;else if(oe(e))t=16;else if(typeof e=="object")if(r&65){const i=e.default;i&&(i._c&&(i._d=!1),yc(n,i()),i._c&&(i._d=!0));return}else{t=32;const i=e._;!i&&!md(e)?e._ctx=Vt:i===3&&Vt&&(Vt.slots._===1?e._=1:(e._=2,n.patchFlag|=1024))}else le(e)?(e={default:e,_ctx:Vt},t=32):(e=String(e),r&64?(t=16,e=[n_(e)]):t=8);n.children=e,n.shapeFlag|=t}function r_(...n){const e={};for(let t=0;t<n.length;t++){const r=n[t];for(const i in r)if(i==="class")e.class!==r.class&&(e.class=ic([e.class,r.class]));else if(i==="style")e.style=rc([e.style,r.style]);else if(io(i)){const s=e[i],a=r[i];a&&s!==a&&!(oe(s)&&s.includes(a))&&(e[i]=s?[].concat(s,a):a)}else i!==""&&(e[i]=r[i])}return e}function Ct(n,e,t,r=null){Lt(n,e,7,[t,r])}const i_=fd();let s_=0;function o_(n,e,t){const r=n.type,i=(e?e.appContext:n.appContext)||i_,s={uid:s_++,vnode:n,type:r,parent:e,appContext:i,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new Pg(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(i.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:yd(r,i),emitsOptions:Rd(r,i),emit:null,emitted:null,propsDefaults:we,inheritAttrs:r.inheritAttrs,ctx:we,data:we,props:we,attrs:we,slots:we,refs:we,setupState:we,setupContext:null,suspense:t,suspenseId:t?t.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return s.ctx={_:s},s.root=e?e.root:s,s.emit=Wm.bind(null,s),n.ce&&n.ce(s),s}let at=null,Bs,Ca;{const n=ao(),e=(t,r)=>{let i;return(i=n[t])||(i=n[t]=[]),i.push(r),s=>{i.length>1?i.forEach(a=>a(s)):i[0](s)}};Bs=e("__VUE_INSTANCE_SETTERS__",t=>at=t),Ca=e("__VUE_SSR_SETTERS__",t=>Pi=t)}const Ui=n=>{const e=at;return Bs(n),n.scope.on(),()=>{n.scope.off(),Bs(e)}},cu=()=>{at&&at.scope.off(),Bs(null)};function Dd(n){return n.vnode.shapeFlag&4}let Pi=!1;function a_(n,e=!1,t=!1){e&&Ca(e);const{props:r,children:i}=n.vnode,s=Dd(n);Vm(n,r,s,e),Mm(n,i,t||e);const a=s?c_(n,e):void 0;return e&&Ca(!1),a}function c_(n,e){const t=n.type;n.accessCache=Object.create(null),n.proxy=new Proxy(n.ctx,wm);const{setup:r}=t;if(r){Yt();const i=n.setupContext=r.length>1?u_(n):null,s=Ui(n),a=Fi(r,n,0,[n.props,i]),c=Oh(a);if(Xt(),s(),(c||n.sp)&&!mi(n)&&ad(n),c){if(a.then(cu,cu),e)return a.then(u=>{lu(n,u,e)}).catch(u=>{lo(u,n,0)});n.asyncDep=a}else lu(n,a,e)}else Vd(n,e)}function lu(n,e,t){le(e)?n.type.__ssrInlineRender?n.ssrRender=e:n.render=e:Re(e)&&(n.setupState=td(e)),Vd(n,t)}let uu;function Vd(n,e,t){const r=n.type;if(!n.render){if(!e&&uu&&!r.render){const i=r.template||gc(n).template;if(i){const{isCustomElement:s,compilerOptions:a}=n.appContext.config,{delimiters:c,compilerOptions:u}=r,d=Ke(Ke({isCustomElement:s,delimiters:c},a),u);r.render=uu(i,d)}}n.render=r.render||bt}{const i=Ui(n);Yt();try{Am(n)}finally{Xt(),i()}}}const l_={get(n,e){return et(n,"get",""),n[e]}};function u_(n){const e=t=>{n.exposed=t||{}};return{attrs:new Proxy(n.attrs,l_),slots:n.slots,emit:n.emit,expose:e}}function vc(n){return n.exposed?n.exposeProxy||(n.exposeProxy=new Proxy(td(Qg(n.exposed)),{get(e,t){if(t in e)return e[t];if(t in _i)return _i[t](n)},has(e,t){return t in e||t in _i}})):n.proxy}function h_(n){return le(n)&&"__vccOpts"in n}const d_=(n,e)=>tm(n,e,Pi),f_="3.5.17";/**
* @vue/runtime-dom v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let ka;const hu=typeof window<"u"&&window.trustedTypes;if(hu)try{ka=hu.createPolicy("vue",{createHTML:n=>n})}catch{}const Od=ka?n=>ka.createHTML(n):n=>n,p_="http://www.w3.org/2000/svg",g_="http://www.w3.org/1998/Math/MathML",Ht=typeof document<"u"?document:null,du=Ht&&Ht.createElement("template"),m_={insert:(n,e,t)=>{e.insertBefore(n,t||null)},remove:n=>{const e=n.parentNode;e&&e.removeChild(n)},createElement:(n,e,t,r)=>{const i=e==="svg"?Ht.createElementNS(p_,n):e==="mathml"?Ht.createElementNS(g_,n):t?Ht.createElement(n,{is:t}):Ht.createElement(n);return n==="select"&&r&&r.multiple!=null&&i.setAttribute("multiple",r.multiple),i},createText:n=>Ht.createTextNode(n),createComment:n=>Ht.createComment(n),setText:(n,e)=>{n.nodeValue=e},setElementText:(n,e)=>{n.textContent=e},parentNode:n=>n.parentNode,nextSibling:n=>n.nextSibling,querySelector:n=>Ht.querySelector(n),setScopeId(n,e){n.setAttribute(e,"")},insertStaticContent(n,e,t,r,i,s){const a=t?t.previousSibling:e.lastChild;if(i&&(i===s||i.nextSibling))for(;e.insertBefore(i.cloneNode(!0),t),!(i===s||!(i=i.nextSibling)););else{du.innerHTML=Od(r==="svg"?`<svg>${n}</svg>`:r==="mathml"?`<math>${n}</math>`:n);const c=du.content;if(r==="svg"||r==="mathml"){const u=c.firstChild;for(;u.firstChild;)c.appendChild(u.firstChild);c.removeChild(u)}e.insertBefore(c,t)}return[a?a.nextSibling:e.firstChild,t?t.previousSibling:e.lastChild]}},__=Symbol("_vtc");function y_(n,e,t){const r=n[__];r&&(e=(e?[e,...r]:[...r]).join(" ")),e==null?n.removeAttribute("class"):t?n.setAttribute("class",e):n.className=e}const fu=Symbol("_vod"),v_=Symbol("_vsh"),E_=Symbol(""),T_=/(^|;)\s*display\s*:/;function I_(n,e,t){const r=n.style,i=De(t);let s=!1;if(t&&!i){if(e)if(De(e))for(const a of e.split(";")){const c=a.slice(0,a.indexOf(":")).trim();t[c]==null&&bs(r,c,"")}else for(const a in e)t[a]==null&&bs(r,a,"");for(const a in t)a==="display"&&(s=!0),bs(r,a,t[a])}else if(i){if(e!==t){const a=r[E_];a&&(t+=";"+a),r.cssText=t,s=T_.test(t)}}else e&&n.removeAttribute("style");fu in n&&(n[fu]=s?r.display:"",n[v_]&&(r.display="none"))}const pu=/\s*!important$/;function bs(n,e,t){if(oe(t))t.forEach(r=>bs(n,e,r));else if(t==null&&(t=""),e.startsWith("--"))n.setProperty(e,t);else{const r=w_(n,e);pu.test(t)?n.setProperty(rr(r),t.replace(pu,""),"important"):n[r]=t}}const gu=["Webkit","Moz","ms"],aa={};function w_(n,e){const t=aa[e];if(t)return t;let r=kn(e);if(r!=="filter"&&r in n)return aa[e]=r;r=Mh(r);for(let i=0;i<gu.length;i++){const s=gu[i]+r;if(s in n)return aa[e]=s}return e}const mu="http://www.w3.org/1999/xlink";function _u(n,e,t,r,i,s=Sg(e)){r&&e.startsWith("xlink:")?t==null?n.removeAttributeNS(mu,e.slice(6,e.length)):n.setAttributeNS(mu,e,t):t==null||s&&!Lh(t)?n.removeAttribute(e):n.setAttribute(e,s?"":Mn(t)?String(t):t)}function yu(n,e,t,r,i){if(e==="innerHTML"||e==="textContent"){t!=null&&(n[e]=e==="innerHTML"?Od(t):t);return}const s=n.tagName;if(e==="value"&&s!=="PROGRESS"&&!s.includes("-")){const c=s==="OPTION"?n.getAttribute("value")||"":n.value,u=t==null?n.type==="checkbox"?"on":"":String(t);(c!==u||!("_value"in n))&&(n.value=u),t==null&&n.removeAttribute(e),n._value=t;return}let a=!1;if(t===""||t==null){const c=typeof n[e];c==="boolean"?t=Lh(t):t==null&&c==="string"?(t="",a=!0):c==="number"&&(t=0,a=!0)}try{n[e]=t}catch{}a&&n.removeAttribute(i||e)}function A_(n,e,t,r){n.addEventListener(e,t,r)}function b_(n,e,t,r){n.removeEventListener(e,t,r)}const vu=Symbol("_vei");function R_(n,e,t,r,i=null){const s=n[vu]||(n[vu]={}),a=s[e];if(r&&a)a.value=r;else{const[c,u]=S_(e);if(r){const d=s[e]=k_(r,i);A_(n,c,d,u)}else a&&(b_(n,c,a,u),s[e]=void 0)}}const Eu=/(?:Once|Passive|Capture)$/;function S_(n){let e;if(Eu.test(n)){e={};let r;for(;r=n.match(Eu);)n=n.slice(0,n.length-r[0].length),e[r[0].toLowerCase()]=!0}return[n[2]===":"?n.slice(3):rr(n.slice(2)),e]}let ca=0;const P_=Promise.resolve(),C_=()=>ca||(P_.then(()=>ca=0),ca=Date.now());function k_(n,e){const t=r=>{if(!r._vts)r._vts=Date.now();else if(r._vts<=t.attached)return;Lt(D_(r,t.value),e,5,[r])};return t.value=n,t.attached=C_(),t}function D_(n,e){if(oe(e)){const t=n.stopImmediatePropagation;return n.stopImmediatePropagation=()=>{t.call(n),n._stopped=!0},e.map(r=>i=>!i._stopped&&r&&r(i))}else return e}const Tu=n=>n.charCodeAt(0)===111&&n.charCodeAt(1)===110&&n.charCodeAt(2)>96&&n.charCodeAt(2)<123,V_=(n,e,t,r,i,s)=>{const a=i==="svg";e==="class"?y_(n,r,a):e==="style"?I_(n,t,r):io(e)?ec(e)||R_(n,e,t,r,s):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):O_(n,e,r,a))?(yu(n,e,r),!n.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&_u(n,e,r,a,s,e!=="value")):n._isVueCE&&(/[A-Z]/.test(e)||!De(r))?yu(n,kn(e),r,s,e):(e==="true-value"?n._trueValue=r:e==="false-value"&&(n._falseValue=r),_u(n,e,r,a))};function O_(n,e,t,r){if(r)return!!(e==="innerHTML"||e==="textContent"||e in n&&Tu(e)&&le(t));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="form"||e==="list"&&n.tagName==="INPUT"||e==="type"&&n.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const i=n.tagName;if(i==="IMG"||i==="VIDEO"||i==="CANVAS"||i==="SOURCE")return!1}return Tu(e)&&De(t)?!1:e in n}const N_=Ke({patchProp:V_},m_);let Iu;function x_(){return Iu||(Iu=Fm(N_))}const M_=(...n)=>{const e=x_().createApp(...n),{mount:t}=e;return e.mount=r=>{const i=F_(r);if(!i)return;const s=e._component;!le(s)&&!s.render&&!s.template&&(s.template=i.innerHTML),i.nodeType===1&&(i.textContent="");const a=t(i,!1,L_(i));return i instanceof Element&&(i.removeAttribute("v-cloak"),i.setAttribute("data-v-app","")),a},e};function L_(n){if(n instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&n instanceof MathMLElement)return"mathml"}function F_(n){return De(n)?document.querySelector(n):n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */const Nd=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let i=n.charCodeAt(r);i<128?e[t++]=i:i<2048?(e[t++]=i>>6|192,e[t++]=i&63|128):(i&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(i=65536+((i&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=i>>18|240,e[t++]=i>>12&63|128,e[t++]=i>>6&63|128,e[t++]=i&63|128):(e[t++]=i>>12|224,e[t++]=i>>6&63|128,e[t++]=i&63|128)}return e},U_=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const i=n[t++];if(i<128)e[r++]=String.fromCharCode(i);else if(i>191&&i<224){const s=n[t++];e[r++]=String.fromCharCode((i&31)<<6|s&63)}else if(i>239&&i<365){const s=n[t++],a=n[t++],c=n[t++],u=((i&7)<<18|(s&63)<<12|(a&63)<<6|c&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const s=n[t++],a=n[t++];e[r++]=String.fromCharCode((i&15)<<12|(s&63)<<6|a&63)}}return e.join("")},xd={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let i=0;i<n.length;i+=3){const s=n[i],a=i+1<n.length,c=a?n[i+1]:0,u=i+2<n.length,d=u?n[i+2]:0,f=s>>2,g=(s&3)<<4|c>>4;let I=(c&15)<<2|d>>6,S=d&63;u||(S=64,a||(I=64)),r.push(t[f],t[g],t[I],t[S])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(Nd(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):U_(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let i=0;i<n.length;){const s=t[n.charAt(i++)],c=i<n.length?t[n.charAt(i)]:0;++i;const d=i<n.length?t[n.charAt(i)]:64;++i;const g=i<n.length?t[n.charAt(i)]:64;if(++i,s==null||c==null||d==null||g==null)throw new B_;const I=s<<2|c>>4;if(r.push(I),d!==64){const S=c<<4&240|d>>2;if(r.push(S),g!==64){const V=d<<6&192|g;r.push(V)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class B_ extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const j_=function(n){const e=Nd(n);return xd.encodeByteArray(e,!0)},js=function(n){return j_(n).replace(/\./g,"")},Md=function(n){try{return xd.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function $_(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const q_=()=>$_().__FIREBASE_DEFAULTS__,H_=()=>{if(typeof process>"u"||typeof process.env>"u")return;const n={}.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},z_=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Md(n[1]);return e&&JSON.parse(e)},po=()=>{try{return q_()||H_()||z_()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},Ld=n=>{var e,t;return(t=(e=po())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},W_=n=>{const e=Ld(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},Fd=()=>{var n;return(n=po())===null||n===void 0?void 0:n.config},Ud=n=>{var e;return(e=po())===null||e===void 0?void 0:e[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K_{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
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
 */function G_(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",i=n.iat||0,s=n.sub||n.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:i,exp:i+3600,auth_time:i,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}}},n),c="";return[js(JSON.stringify(t)),js(JSON.stringify(a)),c].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function Q_(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(rt())}function J_(){var n;const e=(n=po())===null||n===void 0?void 0:n.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function Y_(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function X_(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function Z_(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function ey(){const n=rt();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function ty(){return!J_()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function ny(){try{return typeof indexedDB=="object"}catch{return!1}}function ry(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",i=self.indexedDB.open(r);i.onsuccess=()=>{i.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},i.onupgradeneeded=()=>{t=!1},i.onerror=()=>{var s;e(((s=i.error)===null||s===void 0?void 0:s.message)||"")}}catch(t){e(t)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const iy="FirebaseError";class on extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=iy,Object.setPrototypeOf(this,on.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Bi.prototype.create)}}class Bi{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},i=`${this.service}/${e}`,s=this.errors[e],a=s?sy(s,r):"Error",c=`${this.serviceName}: ${a} (${i}).`;return new on(i,c,r)}}function sy(n,e){return n.replace(oy,(t,r)=>{const i=e[r];return i!=null?String(i):`<${r}?>`})}const oy=/\{\$([^}]+)}/g;function ay(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function $s(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const i of t){if(!r.includes(i))return!1;const s=n[i],a=e[i];if(wu(s)&&wu(a)){if(!$s(s,a))return!1}else if(s!==a)return!1}for(const i of r)if(!t.includes(i))return!1;return!0}function wu(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ji(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(i=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(i))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function cy(n,e){const t=new ly(n,e);return t.subscribe.bind(t)}class ly{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let i;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");uy(e,["next","error","complete"])?i=e:i={next:e,error:t,complete:r},i.next===void 0&&(i.next=la),i.error===void 0&&(i.error=la),i.complete===void 0&&(i.complete=la);const s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?i.error(this.finalError):i.complete()}catch{}}),this.observers.push(i),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function uy(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function la(){}/**
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
 */function St(n){return n&&n._delegate?n._delegate:n}class Xn{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const Gn="[DEFAULT]";/**
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
 */class hy{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new K_;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const i=this.getOrInitializeService({instanceIdentifier:t});i&&r.resolve(i)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),i=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(s){if(i)return null;throw s}else{if(i)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(fy(e))try{this.getOrInitializeService({instanceIdentifier:Gn})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const i=this.normalizeInstanceIdentifier(t);try{const s=this.getOrInitializeService({instanceIdentifier:i});r.resolve(s)}catch{}}}}clearInstance(e=Gn){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Gn){return this.instances.has(e)}getOptions(e=Gn){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const i=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[s,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(s);r===c&&a.resolve(i)}return i}onInit(e,t){var r;const i=this.normalizeInstanceIdentifier(t),s=(r=this.onInitCallbacks.get(i))!==null&&r!==void 0?r:new Set;s.add(e),this.onInitCallbacks.set(i,s);const a=this.instances.get(i);return a&&e(a,i),()=>{s.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const i of r)try{i(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:dy(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Gn){return this.component?this.component.multipleInstances?e:Gn:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function dy(n){return n===Gn?void 0:n}function fy(n){return n.instantiationMode==="EAGER"}/**
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
 */class py{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new hy(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var he;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(he||(he={}));const gy={debug:he.DEBUG,verbose:he.VERBOSE,info:he.INFO,warn:he.WARN,error:he.ERROR,silent:he.SILENT},my=he.INFO,_y={[he.DEBUG]:"log",[he.VERBOSE]:"log",[he.INFO]:"info",[he.WARN]:"warn",[he.ERROR]:"error"},yy=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),i=_y[e];if(i)console[i](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Ec{constructor(e){this.name=e,this._logLevel=my,this._logHandler=yy,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in he))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?gy[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,he.DEBUG,...e),this._logHandler(this,he.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,he.VERBOSE,...e),this._logHandler(this,he.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,he.INFO,...e),this._logHandler(this,he.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,he.WARN,...e),this._logHandler(this,he.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,he.ERROR,...e),this._logHandler(this,he.ERROR,...e)}}const vy=(n,e)=>e.some(t=>n instanceof t);let Au,bu;function Ey(){return Au||(Au=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Ty(){return bu||(bu=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Bd=new WeakMap,Da=new WeakMap,jd=new WeakMap,ua=new WeakMap,Tc=new WeakMap;function Iy(n){const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("success",s),n.removeEventListener("error",a)},s=()=>{t(An(n.result)),i()},a=()=>{r(n.error),i()};n.addEventListener("success",s),n.addEventListener("error",a)});return e.then(t=>{t instanceof IDBCursor&&Bd.set(t,n)}).catch(()=>{}),Tc.set(e,n),e}function wy(n){if(Da.has(n))return;const e=new Promise((t,r)=>{const i=()=>{n.removeEventListener("complete",s),n.removeEventListener("error",a),n.removeEventListener("abort",a)},s=()=>{t(),i()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),i()};n.addEventListener("complete",s),n.addEventListener("error",a),n.addEventListener("abort",a)});Da.set(n,e)}let Va={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Da.get(n);if(e==="objectStoreNames")return n.objectStoreNames||jd.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return An(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function Ay(n){Va=n(Va)}function by(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(ha(this),e,...t);return jd.set(r,e.sort?e.sort():[e]),An(r)}:Ty().includes(n)?function(...e){return n.apply(ha(this),e),An(Bd.get(this))}:function(...e){return An(n.apply(ha(this),e))}}function Ry(n){return typeof n=="function"?by(n):(n instanceof IDBTransaction&&wy(n),vy(n,Ey())?new Proxy(n,Va):n)}function An(n){if(n instanceof IDBRequest)return Iy(n);if(ua.has(n))return ua.get(n);const e=Ry(n);return e!==n&&(ua.set(n,e),Tc.set(e,n)),e}const ha=n=>Tc.get(n);function Sy(n,e,{blocked:t,upgrade:r,blocking:i,terminated:s}={}){const a=indexedDB.open(n,e),c=An(a);return r&&a.addEventListener("upgradeneeded",u=>{r(An(a.result),u.oldVersion,u.newVersion,An(a.transaction),u)}),t&&a.addEventListener("blocked",u=>t(u.oldVersion,u.newVersion,u)),c.then(u=>{s&&u.addEventListener("close",()=>s()),i&&u.addEventListener("versionchange",d=>i(d.oldVersion,d.newVersion,d))}).catch(()=>{}),c}const Py=["get","getKey","getAll","getAllKeys","count"],Cy=["put","add","delete","clear"],da=new Map;function Ru(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(da.get(e))return da.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,i=Cy.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(i||Py.includes(t)))return;const s=async function(a,...c){const u=this.transaction(a,i?"readwrite":"readonly");let d=u.store;return r&&(d=d.index(c.shift())),(await Promise.all([d[t](...c),i&&u.done]))[0]};return da.set(e,s),s}Ay(n=>({...n,get:(e,t,r)=>Ru(e,t)||n.get(e,t,r),has:(e,t)=>!!Ru(e,t)||n.has(e,t)}));/**
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
 */class ky{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(Dy(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function Dy(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Oa="@firebase/app",Su="0.10.13";/**
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
 */const Zt=new Ec("@firebase/app"),Vy="@firebase/app-compat",Oy="@firebase/analytics-compat",Ny="@firebase/analytics",xy="@firebase/app-check-compat",My="@firebase/app-check",Ly="@firebase/auth",Fy="@firebase/auth-compat",Uy="@firebase/database",By="@firebase/data-connect",jy="@firebase/database-compat",$y="@firebase/functions",qy="@firebase/functions-compat",Hy="@firebase/installations",zy="@firebase/installations-compat",Wy="@firebase/messaging",Ky="@firebase/messaging-compat",Gy="@firebase/performance",Qy="@firebase/performance-compat",Jy="@firebase/remote-config",Yy="@firebase/remote-config-compat",Xy="@firebase/storage",Zy="@firebase/storage-compat",ev="@firebase/firestore",tv="@firebase/vertexai-preview",nv="@firebase/firestore-compat",rv="firebase",iv="10.14.1";/**
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
 */const Na="[DEFAULT]",sv={[Oa]:"fire-core",[Vy]:"fire-core-compat",[Ny]:"fire-analytics",[Oy]:"fire-analytics-compat",[My]:"fire-app-check",[xy]:"fire-app-check-compat",[Ly]:"fire-auth",[Fy]:"fire-auth-compat",[Uy]:"fire-rtdb",[By]:"fire-data-connect",[jy]:"fire-rtdb-compat",[$y]:"fire-fn",[qy]:"fire-fn-compat",[Hy]:"fire-iid",[zy]:"fire-iid-compat",[Wy]:"fire-fcm",[Ky]:"fire-fcm-compat",[Gy]:"fire-perf",[Qy]:"fire-perf-compat",[Jy]:"fire-rc",[Yy]:"fire-rc-compat",[Xy]:"fire-gcs",[Zy]:"fire-gcs-compat",[ev]:"fire-fst",[nv]:"fire-fst-compat",[tv]:"fire-vertex","fire-js":"fire-js",[rv]:"fire-js-all"};/**
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
 */const qs=new Map,ov=new Map,xa=new Map;function Pu(n,e){try{n.container.addComponent(e)}catch(t){Zt.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function kr(n){const e=n.name;if(xa.has(e))return Zt.debug(`There were multiple attempts to register component ${e}.`),!1;xa.set(e,n);for(const t of qs.values())Pu(t,n);for(const t of ov.values())Pu(t,n);return!0}function Ic(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function Wt(n){return n.settings!==void 0}/**
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
 */const av={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},bn=new Bi("app","Firebase",av);/**
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
 */class cv{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Xn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw bn.create("app-deleted",{appName:this._name})}}/**
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
 */const Fr=iv;function $d(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Na,automaticDataCollectionEnabled:!1},e),i=r.name;if(typeof i!="string"||!i)throw bn.create("bad-app-name",{appName:String(i)});if(t||(t=Fd()),!t)throw bn.create("no-options");const s=qs.get(i);if(s){if($s(t,s.options)&&$s(r,s.config))return s;throw bn.create("duplicate-app",{appName:i})}const a=new py(i);for(const u of xa.values())a.addComponent(u);const c=new cv(t,r,a);return qs.set(i,c),c}function qd(n=Na){const e=qs.get(n);if(!e&&n===Na&&Fd())return $d();if(!e)throw bn.create("no-app",{appName:n});return e}function Rn(n,e,t){var r;let i=(r=sv[n])!==null&&r!==void 0?r:n;t&&(i+=`-${t}`);const s=i.match(/\s|\//),a=e.match(/\s|\//);if(s||a){const c=[`Unable to register library "${i}" with version "${e}":`];s&&c.push(`library name "${i}" contains illegal characters (whitespace or "/")`),s&&a&&c.push("and"),a&&c.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Zt.warn(c.join(" "));return}kr(new Xn(`${i}-version`,()=>({library:i,version:e}),"VERSION"))}/**
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
 */const lv="firebase-heartbeat-database",uv=1,Ci="firebase-heartbeat-store";let fa=null;function Hd(){return fa||(fa=Sy(lv,uv,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Ci)}catch(t){console.warn(t)}}}}).catch(n=>{throw bn.create("idb-open",{originalErrorMessage:n.message})})),fa}async function hv(n){try{const t=(await Hd()).transaction(Ci),r=await t.objectStore(Ci).get(zd(n));return await t.done,r}catch(e){if(e instanceof on)Zt.warn(e.message);else{const t=bn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Zt.warn(t.message)}}}async function Cu(n,e){try{const r=(await Hd()).transaction(Ci,"readwrite");await r.objectStore(Ci).put(e,zd(n)),await r.done}catch(t){if(t instanceof on)Zt.warn(t.message);else{const r=bn.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Zt.warn(r.message)}}}function zd(n){return`${n.name}!${n.options.appId}`}/**
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
 */const dv=1024,fv=30*24*60*60*1e3;class pv{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new mv(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const i=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),s=ku();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===s||this._heartbeatsCache.heartbeats.some(a=>a.date===s)?void 0:(this._heartbeatsCache.heartbeats.push({date:s,agent:i}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const c=new Date(a.date).valueOf();return Date.now()-c<=fv}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Zt.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=ku(),{heartbeatsToSend:r,unsentEntries:i}=gv(this._heartbeatsCache.heartbeats),s=js(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,i.length>0?(this._heartbeatsCache.heartbeats=i,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),s}catch(t){return Zt.warn(t),""}}}function ku(){return new Date().toISOString().substring(0,10)}function gv(n,e=dv){const t=[];let r=n.slice();for(const i of n){const s=t.find(a=>a.agent===i.agent);if(s){if(s.dates.push(i.date),Du(t)>e){s.dates.pop();break}}else if(t.push({agent:i.agent,dates:[i.date]}),Du(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class mv{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return ny()?ry().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await hv(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return Cu(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const i=await this.read();return Cu(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:i.lastSentHeartbeatDate,heartbeats:[...i.heartbeats,...e.heartbeats]})}else return}}function Du(n){return js(JSON.stringify({version:2,heartbeats:n})).length}/**
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
 */function _v(n){kr(new Xn("platform-logger",e=>new ky(e),"PRIVATE")),kr(new Xn("heartbeat",e=>new pv(e),"PRIVATE")),Rn(Oa,Su,n),Rn(Oa,Su,"esm2017"),Rn("fire-js","")}_v("");var yv="firebase",vv="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Rn(yv,vv,"app");var Vu=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Yn,Wd;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(T,m){function _(){}_.prototype=m.prototype,T.D=m.prototype,T.prototype=new _,T.prototype.constructor=T,T.C=function(E,A,R){for(var v=Array(arguments.length-2),lt=2;lt<arguments.length;lt++)v[lt-2]=arguments[lt];return m.prototype[A].apply(E,v)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function i(T,m,_){_||(_=0);var E=Array(16);if(typeof m=="string")for(var A=0;16>A;++A)E[A]=m.charCodeAt(_++)|m.charCodeAt(_++)<<8|m.charCodeAt(_++)<<16|m.charCodeAt(_++)<<24;else for(A=0;16>A;++A)E[A]=m[_++]|m[_++]<<8|m[_++]<<16|m[_++]<<24;m=T.g[0],_=T.g[1],A=T.g[2];var R=T.g[3],v=m+(R^_&(A^R))+E[0]+3614090360&4294967295;m=_+(v<<7&4294967295|v>>>25),v=R+(A^m&(_^A))+E[1]+3905402710&4294967295,R=m+(v<<12&4294967295|v>>>20),v=A+(_^R&(m^_))+E[2]+606105819&4294967295,A=R+(v<<17&4294967295|v>>>15),v=_+(m^A&(R^m))+E[3]+3250441966&4294967295,_=A+(v<<22&4294967295|v>>>10),v=m+(R^_&(A^R))+E[4]+4118548399&4294967295,m=_+(v<<7&4294967295|v>>>25),v=R+(A^m&(_^A))+E[5]+1200080426&4294967295,R=m+(v<<12&4294967295|v>>>20),v=A+(_^R&(m^_))+E[6]+2821735955&4294967295,A=R+(v<<17&4294967295|v>>>15),v=_+(m^A&(R^m))+E[7]+4249261313&4294967295,_=A+(v<<22&4294967295|v>>>10),v=m+(R^_&(A^R))+E[8]+1770035416&4294967295,m=_+(v<<7&4294967295|v>>>25),v=R+(A^m&(_^A))+E[9]+2336552879&4294967295,R=m+(v<<12&4294967295|v>>>20),v=A+(_^R&(m^_))+E[10]+4294925233&4294967295,A=R+(v<<17&4294967295|v>>>15),v=_+(m^A&(R^m))+E[11]+2304563134&4294967295,_=A+(v<<22&4294967295|v>>>10),v=m+(R^_&(A^R))+E[12]+1804603682&4294967295,m=_+(v<<7&4294967295|v>>>25),v=R+(A^m&(_^A))+E[13]+4254626195&4294967295,R=m+(v<<12&4294967295|v>>>20),v=A+(_^R&(m^_))+E[14]+2792965006&4294967295,A=R+(v<<17&4294967295|v>>>15),v=_+(m^A&(R^m))+E[15]+1236535329&4294967295,_=A+(v<<22&4294967295|v>>>10),v=m+(A^R&(_^A))+E[1]+4129170786&4294967295,m=_+(v<<5&4294967295|v>>>27),v=R+(_^A&(m^_))+E[6]+3225465664&4294967295,R=m+(v<<9&4294967295|v>>>23),v=A+(m^_&(R^m))+E[11]+643717713&4294967295,A=R+(v<<14&4294967295|v>>>18),v=_+(R^m&(A^R))+E[0]+3921069994&4294967295,_=A+(v<<20&4294967295|v>>>12),v=m+(A^R&(_^A))+E[5]+3593408605&4294967295,m=_+(v<<5&4294967295|v>>>27),v=R+(_^A&(m^_))+E[10]+38016083&4294967295,R=m+(v<<9&4294967295|v>>>23),v=A+(m^_&(R^m))+E[15]+3634488961&4294967295,A=R+(v<<14&4294967295|v>>>18),v=_+(R^m&(A^R))+E[4]+3889429448&4294967295,_=A+(v<<20&4294967295|v>>>12),v=m+(A^R&(_^A))+E[9]+568446438&4294967295,m=_+(v<<5&4294967295|v>>>27),v=R+(_^A&(m^_))+E[14]+3275163606&4294967295,R=m+(v<<9&4294967295|v>>>23),v=A+(m^_&(R^m))+E[3]+4107603335&4294967295,A=R+(v<<14&4294967295|v>>>18),v=_+(R^m&(A^R))+E[8]+1163531501&4294967295,_=A+(v<<20&4294967295|v>>>12),v=m+(A^R&(_^A))+E[13]+2850285829&4294967295,m=_+(v<<5&4294967295|v>>>27),v=R+(_^A&(m^_))+E[2]+4243563512&4294967295,R=m+(v<<9&4294967295|v>>>23),v=A+(m^_&(R^m))+E[7]+1735328473&4294967295,A=R+(v<<14&4294967295|v>>>18),v=_+(R^m&(A^R))+E[12]+2368359562&4294967295,_=A+(v<<20&4294967295|v>>>12),v=m+(_^A^R)+E[5]+4294588738&4294967295,m=_+(v<<4&4294967295|v>>>28),v=R+(m^_^A)+E[8]+2272392833&4294967295,R=m+(v<<11&4294967295|v>>>21),v=A+(R^m^_)+E[11]+1839030562&4294967295,A=R+(v<<16&4294967295|v>>>16),v=_+(A^R^m)+E[14]+4259657740&4294967295,_=A+(v<<23&4294967295|v>>>9),v=m+(_^A^R)+E[1]+2763975236&4294967295,m=_+(v<<4&4294967295|v>>>28),v=R+(m^_^A)+E[4]+1272893353&4294967295,R=m+(v<<11&4294967295|v>>>21),v=A+(R^m^_)+E[7]+4139469664&4294967295,A=R+(v<<16&4294967295|v>>>16),v=_+(A^R^m)+E[10]+3200236656&4294967295,_=A+(v<<23&4294967295|v>>>9),v=m+(_^A^R)+E[13]+681279174&4294967295,m=_+(v<<4&4294967295|v>>>28),v=R+(m^_^A)+E[0]+3936430074&4294967295,R=m+(v<<11&4294967295|v>>>21),v=A+(R^m^_)+E[3]+3572445317&4294967295,A=R+(v<<16&4294967295|v>>>16),v=_+(A^R^m)+E[6]+76029189&4294967295,_=A+(v<<23&4294967295|v>>>9),v=m+(_^A^R)+E[9]+3654602809&4294967295,m=_+(v<<4&4294967295|v>>>28),v=R+(m^_^A)+E[12]+3873151461&4294967295,R=m+(v<<11&4294967295|v>>>21),v=A+(R^m^_)+E[15]+530742520&4294967295,A=R+(v<<16&4294967295|v>>>16),v=_+(A^R^m)+E[2]+3299628645&4294967295,_=A+(v<<23&4294967295|v>>>9),v=m+(A^(_|~R))+E[0]+4096336452&4294967295,m=_+(v<<6&4294967295|v>>>26),v=R+(_^(m|~A))+E[7]+1126891415&4294967295,R=m+(v<<10&4294967295|v>>>22),v=A+(m^(R|~_))+E[14]+2878612391&4294967295,A=R+(v<<15&4294967295|v>>>17),v=_+(R^(A|~m))+E[5]+4237533241&4294967295,_=A+(v<<21&4294967295|v>>>11),v=m+(A^(_|~R))+E[12]+1700485571&4294967295,m=_+(v<<6&4294967295|v>>>26),v=R+(_^(m|~A))+E[3]+2399980690&4294967295,R=m+(v<<10&4294967295|v>>>22),v=A+(m^(R|~_))+E[10]+4293915773&4294967295,A=R+(v<<15&4294967295|v>>>17),v=_+(R^(A|~m))+E[1]+2240044497&4294967295,_=A+(v<<21&4294967295|v>>>11),v=m+(A^(_|~R))+E[8]+1873313359&4294967295,m=_+(v<<6&4294967295|v>>>26),v=R+(_^(m|~A))+E[15]+4264355552&4294967295,R=m+(v<<10&4294967295|v>>>22),v=A+(m^(R|~_))+E[6]+2734768916&4294967295,A=R+(v<<15&4294967295|v>>>17),v=_+(R^(A|~m))+E[13]+1309151649&4294967295,_=A+(v<<21&4294967295|v>>>11),v=m+(A^(_|~R))+E[4]+4149444226&4294967295,m=_+(v<<6&4294967295|v>>>26),v=R+(_^(m|~A))+E[11]+3174756917&4294967295,R=m+(v<<10&4294967295|v>>>22),v=A+(m^(R|~_))+E[2]+718787259&4294967295,A=R+(v<<15&4294967295|v>>>17),v=_+(R^(A|~m))+E[9]+3951481745&4294967295,T.g[0]=T.g[0]+m&4294967295,T.g[1]=T.g[1]+(A+(v<<21&4294967295|v>>>11))&4294967295,T.g[2]=T.g[2]+A&4294967295,T.g[3]=T.g[3]+R&4294967295}r.prototype.u=function(T,m){m===void 0&&(m=T.length);for(var _=m-this.blockSize,E=this.B,A=this.h,R=0;R<m;){if(A==0)for(;R<=_;)i(this,T,R),R+=this.blockSize;if(typeof T=="string"){for(;R<m;)if(E[A++]=T.charCodeAt(R++),A==this.blockSize){i(this,E),A=0;break}}else for(;R<m;)if(E[A++]=T[R++],A==this.blockSize){i(this,E),A=0;break}}this.h=A,this.o+=m},r.prototype.v=function(){var T=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);T[0]=128;for(var m=1;m<T.length-8;++m)T[m]=0;var _=8*this.o;for(m=T.length-8;m<T.length;++m)T[m]=_&255,_/=256;for(this.u(T),T=Array(16),m=_=0;4>m;++m)for(var E=0;32>E;E+=8)T[_++]=this.g[m]>>>E&255;return T};function s(T,m){var _=c;return Object.prototype.hasOwnProperty.call(_,T)?_[T]:_[T]=m(T)}function a(T,m){this.h=m;for(var _=[],E=!0,A=T.length-1;0<=A;A--){var R=T[A]|0;E&&R==m||(_[A]=R,E=!1)}this.g=_}var c={};function u(T){return-128<=T&&128>T?s(T,function(m){return new a([m|0],0>m?-1:0)}):new a([T|0],0>T?-1:0)}function d(T){if(isNaN(T)||!isFinite(T))return g;if(0>T)return B(d(-T));for(var m=[],_=1,E=0;T>=_;E++)m[E]=T/_|0,_*=4294967296;return new a(m,0)}function f(T,m){if(T.length==0)throw Error("number format error: empty string");if(m=m||10,2>m||36<m)throw Error("radix out of range: "+m);if(T.charAt(0)=="-")return B(f(T.substring(1),m));if(0<=T.indexOf("-"))throw Error('number format error: interior "-" character');for(var _=d(Math.pow(m,8)),E=g,A=0;A<T.length;A+=8){var R=Math.min(8,T.length-A),v=parseInt(T.substring(A,A+R),m);8>R?(R=d(Math.pow(m,R)),E=E.j(R).add(d(v))):(E=E.j(_),E=E.add(d(v)))}return E}var g=u(0),I=u(1),S=u(16777216);n=a.prototype,n.m=function(){if(U(this))return-B(this).m();for(var T=0,m=1,_=0;_<this.g.length;_++){var E=this.i(_);T+=(0<=E?E:4294967296+E)*m,m*=4294967296}return T},n.toString=function(T){if(T=T||10,2>T||36<T)throw Error("radix out of range: "+T);if(V(this))return"0";if(U(this))return"-"+B(this).toString(T);for(var m=d(Math.pow(T,6)),_=this,E="";;){var A=k(_,m).g;_=K(_,A.j(m));var R=((0<_.g.length?_.g[0]:_.h)>>>0).toString(T);if(_=A,V(_))return R+E;for(;6>R.length;)R="0"+R;E=R+E}},n.i=function(T){return 0>T?0:T<this.g.length?this.g[T]:this.h};function V(T){if(T.h!=0)return!1;for(var m=0;m<T.g.length;m++)if(T.g[m]!=0)return!1;return!0}function U(T){return T.h==-1}n.l=function(T){return T=K(this,T),U(T)?-1:V(T)?0:1};function B(T){for(var m=T.g.length,_=[],E=0;E<m;E++)_[E]=~T.g[E];return new a(_,~T.h).add(I)}n.abs=function(){return U(this)?B(this):this},n.add=function(T){for(var m=Math.max(this.g.length,T.g.length),_=[],E=0,A=0;A<=m;A++){var R=E+(this.i(A)&65535)+(T.i(A)&65535),v=(R>>>16)+(this.i(A)>>>16)+(T.i(A)>>>16);E=v>>>16,R&=65535,v&=65535,_[A]=v<<16|R}return new a(_,_[_.length-1]&-2147483648?-1:0)};function K(T,m){return T.add(B(m))}n.j=function(T){if(V(this)||V(T))return g;if(U(this))return U(T)?B(this).j(B(T)):B(B(this).j(T));if(U(T))return B(this.j(B(T)));if(0>this.l(S)&&0>T.l(S))return d(this.m()*T.m());for(var m=this.g.length+T.g.length,_=[],E=0;E<2*m;E++)_[E]=0;for(E=0;E<this.g.length;E++)for(var A=0;A<T.g.length;A++){var R=this.i(E)>>>16,v=this.i(E)&65535,lt=T.i(A)>>>16,an=T.i(A)&65535;_[2*E+2*A]+=v*an,J(_,2*E+2*A),_[2*E+2*A+1]+=R*an,J(_,2*E+2*A+1),_[2*E+2*A+1]+=v*lt,J(_,2*E+2*A+1),_[2*E+2*A+2]+=R*lt,J(_,2*E+2*A+2)}for(E=0;E<m;E++)_[E]=_[2*E+1]<<16|_[2*E];for(E=m;E<2*m;E++)_[E]=0;return new a(_,0)};function J(T,m){for(;(T[m]&65535)!=T[m];)T[m+1]+=T[m]>>>16,T[m]&=65535,m++}function O(T,m){this.g=T,this.h=m}function k(T,m){if(V(m))throw Error("division by zero");if(V(T))return new O(g,g);if(U(T))return m=k(B(T),m),new O(B(m.g),B(m.h));if(U(m))return m=k(T,B(m)),new O(B(m.g),m.h);if(30<T.g.length){if(U(T)||U(m))throw Error("slowDivide_ only works with positive integers.");for(var _=I,E=m;0>=E.l(T);)_=j(_),E=j(E);var A=X(_,1),R=X(E,1);for(E=X(E,2),_=X(_,2);!V(E);){var v=R.add(E);0>=v.l(T)&&(A=A.add(_),R=v),E=X(E,1),_=X(_,1)}return m=K(T,A.j(m)),new O(A,m)}for(A=g;0<=T.l(m);){for(_=Math.max(1,Math.floor(T.m()/m.m())),E=Math.ceil(Math.log(_)/Math.LN2),E=48>=E?1:Math.pow(2,E-48),R=d(_),v=R.j(m);U(v)||0<v.l(T);)_-=E,R=d(_),v=R.j(m);V(R)&&(R=I),A=A.add(R),T=K(T,v)}return new O(A,T)}n.A=function(T){return k(this,T).h},n.and=function(T){for(var m=Math.max(this.g.length,T.g.length),_=[],E=0;E<m;E++)_[E]=this.i(E)&T.i(E);return new a(_,this.h&T.h)},n.or=function(T){for(var m=Math.max(this.g.length,T.g.length),_=[],E=0;E<m;E++)_[E]=this.i(E)|T.i(E);return new a(_,this.h|T.h)},n.xor=function(T){for(var m=Math.max(this.g.length,T.g.length),_=[],E=0;E<m;E++)_[E]=this.i(E)^T.i(E);return new a(_,this.h^T.h)};function j(T){for(var m=T.g.length+1,_=[],E=0;E<m;E++)_[E]=T.i(E)<<1|T.i(E-1)>>>31;return new a(_,T.h)}function X(T,m){var _=m>>5;m%=32;for(var E=T.g.length-_,A=[],R=0;R<E;R++)A[R]=0<m?T.i(R+_)>>>m|T.i(R+_+1)<<32-m:T.i(R+_);return new a(A,T.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,Wd=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=f,Yn=a}).apply(typeof Vu<"u"?Vu:typeof self<"u"?self:typeof window<"u"?window:{});var _s=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Kd,li,Gd,Rs,Ma,Qd,Jd,Yd;(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,l,h){return o==Array.prototype||o==Object.prototype||(o[l]=h.value),o};function t(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof _s=="object"&&_s];for(var l=0;l<o.length;++l){var h=o[l];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var r=t(this);function i(o,l){if(l)e:{var h=r;o=o.split(".");for(var p=0;p<o.length-1;p++){var b=o[p];if(!(b in h))break e;h=h[b]}o=o[o.length-1],p=h[o],l=l(p),l!=p&&l!=null&&e(h,o,{configurable:!0,writable:!0,value:l})}}function s(o,l){o instanceof String&&(o+="");var h=0,p=!1,b={next:function(){if(!p&&h<o.length){var P=h++;return{value:l(P,o[P]),done:!1}}return p=!0,{done:!0,value:void 0}}};return b[Symbol.iterator]=function(){return b},b}i("Array.prototype.values",function(o){return o||function(){return s(this,function(l,h){return h})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},c=this||self;function u(o){var l=typeof o;return l=l!="object"?l:o?Array.isArray(o)?"array":l:"null",l=="array"||l=="object"&&typeof o.length=="number"}function d(o){var l=typeof o;return l=="object"&&o!=null||l=="function"}function f(o,l,h){return o.call.apply(o.bind,arguments)}function g(o,l,h){if(!o)throw Error();if(2<arguments.length){var p=Array.prototype.slice.call(arguments,2);return function(){var b=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(b,p),o.apply(l,b)}}return function(){return o.apply(l,arguments)}}function I(o,l,h){return I=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?f:g,I.apply(null,arguments)}function S(o,l){var h=Array.prototype.slice.call(arguments,1);return function(){var p=h.slice();return p.push.apply(p,arguments),o.apply(this,p)}}function V(o,l){function h(){}h.prototype=l.prototype,o.aa=l.prototype,o.prototype=new h,o.prototype.constructor=o,o.Qb=function(p,b,P){for(var H=Array(arguments.length-2),Te=2;Te<arguments.length;Te++)H[Te-2]=arguments[Te];return l.prototype[b].apply(p,H)}}function U(o){const l=o.length;if(0<l){const h=Array(l);for(let p=0;p<l;p++)h[p]=o[p];return h}return[]}function B(o,l){for(let h=1;h<arguments.length;h++){const p=arguments[h];if(u(p)){const b=o.length||0,P=p.length||0;o.length=b+P;for(let H=0;H<P;H++)o[b+H]=p[H]}else o.push(p)}}class K{constructor(l,h){this.i=l,this.j=h,this.h=0,this.g=null}get(){let l;return 0<this.h?(this.h--,l=this.g,this.g=l.next,l.next=null):l=this.i(),l}}function J(o){return/^[\s\xa0]*$/.test(o)}function O(){var o=c.navigator;return o&&(o=o.userAgent)?o:""}function k(o){return k[" "](o),o}k[" "]=function(){};var j=O().indexOf("Gecko")!=-1&&!(O().toLowerCase().indexOf("webkit")!=-1&&O().indexOf("Edge")==-1)&&!(O().indexOf("Trident")!=-1||O().indexOf("MSIE")!=-1)&&O().indexOf("Edge")==-1;function X(o,l,h){for(const p in o)l.call(h,o[p],p,o)}function T(o,l){for(const h in o)l.call(void 0,o[h],h,o)}function m(o){const l={};for(const h in o)l[h]=o[h];return l}const _="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function E(o,l){let h,p;for(let b=1;b<arguments.length;b++){p=arguments[b];for(h in p)o[h]=p[h];for(let P=0;P<_.length;P++)h=_[P],Object.prototype.hasOwnProperty.call(p,h)&&(o[h]=p[h])}}function A(o){var l=1;o=o.split(":");const h=[];for(;0<l&&o.length;)h.push(o.shift()),l--;return o.length&&h.push(o.join(":")),h}function R(o){c.setTimeout(()=>{throw o},0)}function v(){var o=Et;let l=null;return o.g&&(l=o.g,o.g=o.g.next,o.g||(o.h=null),l.next=null),l}class lt{constructor(){this.h=this.g=null}add(l,h){const p=an.get();p.set(l,h),this.h?this.h.next=p:this.g=p,this.h=p}}var an=new K(()=>new Ue,o=>o.reset());class Ue{constructor(){this.next=this.g=this.h=null}set(l,h){this.h=l,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let ve,pe=!1,Et=new lt,Ln=()=>{const o=c.Promise.resolve(void 0);ve=()=>{o.then(Bt)}};var Bt=()=>{for(var o;o=v();){try{o.h.call(o.g)}catch(h){R(h)}var l=an;l.j(o),100>l.h&&(l.h++,o.next=l.g,l.g=o)}pe=!1};function Ve(){this.s=this.s,this.C=this.C}Ve.prototype.s=!1,Ve.prototype.ma=function(){this.s||(this.s=!0,this.N())},Ve.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Oe(o,l){this.type=o,this.g=this.target=l,this.defaultPrevented=!1}Oe.prototype.h=function(){this.defaultPrevented=!0};var Oo=function(){if(!c.addEventListener||!Object.defineProperty)return!1;var o=!1,l=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const h=()=>{};c.addEventListener("test",h,l),c.removeEventListener("test",h,l)}catch{}return o}();function Fn(o,l){if(Oe.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var h=this.type=o.type,p=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=l,l=o.relatedTarget){if(j){e:{try{k(l.nodeName);var b=!0;break e}catch{}b=!1}b||(l=null)}}else h=="mouseover"?l=o.fromElement:h=="mouseout"&&(l=o.toElement);this.relatedTarget=l,p?(this.clientX=p.clientX!==void 0?p.clientX:p.pageX,this.clientY=p.clientY!==void 0?p.clientY:p.pageY,this.screenX=p.screenX||0,this.screenY=p.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:Un[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&Fn.aa.h.call(this)}}V(Fn,Oe);var Un={2:"touch",3:"pen",4:"mouse"};Fn.prototype.h=function(){Fn.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var Pt="closure_listenable_"+(1e6*Math.random()|0),zr=0;function Yi(o,l,h,p,b){this.listener=o,this.proxy=null,this.src=l,this.type=h,this.capture=!!p,this.ha=b,this.key=++zr,this.da=this.fa=!1}function Tt(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function cn(o){this.src=o,this.g={},this.h=0}cn.prototype.add=function(o,l,h,p,b){var P=o.toString();o=this.g[P],o||(o=this.g[P]=[],this.h++);var H=y(o,l,p,b);return-1<H?(l=o[H],h||(l.fa=!1)):(l=new Yi(l,this.src,P,!!p,b),l.fa=h,o.push(l)),l};function Bn(o,l){var h=l.type;if(h in o.g){var p=o.g[h],b=Array.prototype.indexOf.call(p,l,void 0),P;(P=0<=b)&&Array.prototype.splice.call(p,b,1),P&&(Tt(l),o.g[h].length==0&&(delete o.g[h],o.h--))}}function y(o,l,h,p){for(var b=0;b<o.length;++b){var P=o[b];if(!P.da&&P.listener==l&&P.capture==!!h&&P.ha==p)return b}return-1}var w="closure_lm_"+(1e6*Math.random()|0),C={};function L(o,l,h,p,b){if(p&&p.once)return z(o,l,h,p,b);if(Array.isArray(l)){for(var P=0;P<l.length;P++)L(o,l[P],h,p,b);return null}return h=ne(h),o&&o[Pt]?o.K(l,h,d(p)?!!p.capture:!!p,b):D(o,l,h,!1,p,b)}function D(o,l,h,p,b,P){if(!l)throw Error("Invalid event type");var H=d(b)?!!b.capture:!!b,Te=W(o);if(Te||(o[w]=Te=new cn(o)),h=Te.add(l,h,p,H,P),h.proxy)return h;if(p=x(),h.proxy=p,p.src=o,p.listener=h,o.addEventListener)Oo||(b=H),b===void 0&&(b=!1),o.addEventListener(l.toString(),p,b);else if(o.attachEvent)o.attachEvent(F(l.toString()),p);else if(o.addListener&&o.removeListener)o.addListener(p);else throw Error("addEventListener and attachEvent are unavailable.");return h}function x(){function o(h){return l.call(o.src,o.listener,h)}const l=Y;return o}function z(o,l,h,p,b){if(Array.isArray(l)){for(var P=0;P<l.length;P++)z(o,l[P],h,p,b);return null}return h=ne(h),o&&o[Pt]?o.L(l,h,d(p)?!!p.capture:!!p,b):D(o,l,h,!0,p,b)}function q(o,l,h,p,b){if(Array.isArray(l))for(var P=0;P<l.length;P++)q(o,l[P],h,p,b);else p=d(p)?!!p.capture:!!p,h=ne(h),o&&o[Pt]?(o=o.i,l=String(l).toString(),l in o.g&&(P=o.g[l],h=y(P,h,p,b),-1<h&&(Tt(P[h]),Array.prototype.splice.call(P,h,1),P.length==0&&(delete o.g[l],o.h--)))):o&&(o=W(o))&&(l=o.g[l.toString()],o=-1,l&&(o=y(l,h,p,b)),(h=-1<o?l[o]:null)&&$(h))}function $(o){if(typeof o!="number"&&o&&!o.da){var l=o.src;if(l&&l[Pt])Bn(l.i,o);else{var h=o.type,p=o.proxy;l.removeEventListener?l.removeEventListener(h,p,o.capture):l.detachEvent?l.detachEvent(F(h),p):l.addListener&&l.removeListener&&l.removeListener(p),(h=W(l))?(Bn(h,o),h.h==0&&(h.src=null,l[w]=null)):Tt(o)}}}function F(o){return o in C?C[o]:C[o]="on"+o}function Y(o,l){if(o.da)o=!0;else{l=new Fn(l,this);var h=o.listener,p=o.ha||o.src;o.fa&&$(o),o=h.call(p,l)}return o}function W(o){return o=o[w],o instanceof cn?o:null}var Q="__closure_events_fn_"+(1e9*Math.random()>>>0);function ne(o){return typeof o=="function"?o:(o[Q]||(o[Q]=function(l){return o.handleEvent(l)}),o[Q])}function te(){Ve.call(this),this.i=new cn(this),this.M=this,this.F=null}V(te,Ve),te.prototype[Pt]=!0,te.prototype.removeEventListener=function(o,l,h,p){q(this,o,l,h,p)};function ce(o,l){var h,p=o.F;if(p)for(h=[];p;p=p.F)h.push(p);if(o=o.M,p=l.type||l,typeof l=="string")l=new Oe(l,o);else if(l instanceof Oe)l.target=l.target||o;else{var b=l;l=new Oe(p,o),E(l,b)}if(b=!0,h)for(var P=h.length-1;0<=P;P--){var H=l.g=h[P];b=de(H,p,!0,l)&&b}if(H=l.g=o,b=de(H,p,!0,l)&&b,b=de(H,p,!1,l)&&b,h)for(P=0;P<h.length;P++)H=l.g=h[P],b=de(H,p,!1,l)&&b}te.prototype.N=function(){if(te.aa.N.call(this),this.i){var o=this.i,l;for(l in o.g){for(var h=o.g[l],p=0;p<h.length;p++)Tt(h[p]);delete o.g[l],o.h--}}this.F=null},te.prototype.K=function(o,l,h,p){return this.i.add(String(o),l,!1,h,p)},te.prototype.L=function(o,l,h,p){return this.i.add(String(o),l,!0,h,p)};function de(o,l,h,p){if(l=o.i.g[String(l)],!l)return!0;l=l.concat();for(var b=!0,P=0;P<l.length;++P){var H=l[P];if(H&&!H.da&&H.capture==h){var Te=H.listener,$e=H.ha||H.src;H.fa&&Bn(o.i,H),b=Te.call($e,p)!==!1&&b}}return b&&!p.defaultPrevented}function Be(o,l,h){if(typeof o=="function")h&&(o=I(o,h));else if(o&&typeof o.handleEvent=="function")o=I(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(l)?-1:c.setTimeout(o,l||0)}function Ne(o){o.g=Be(()=>{o.g=null,o.i&&(o.i=!1,Ne(o))},o.l);const l=o.h;o.h=null,o.m.apply(null,l)}class ut extends Ve{constructor(l,h){super(),this.m=l,this.l=h,this.h=null,this.i=!1,this.g=null}j(l){this.h=arguments,this.g?this.i=!0:Ne(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function xe(o){Ve.call(this),this.h=o,this.g={}}V(xe,Ve);var ln=[];function Wr(o){X(o.g,function(l,h){this.g.hasOwnProperty(h)&&$(l)},o),o.g={}}xe.prototype.N=function(){xe.aa.N.call(this),Wr(this)},xe.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var je=c.JSON.stringify,pt=c.JSON.parse,Xi=class{stringify(o){return c.JSON.stringify(o,void 0)}parse(o){return c.JSON.parse(o,void 0)}};function No(){}No.prototype.h=null;function sl(o){return o.h||(o.h=o.i())}function ol(){}var Kr={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function xo(){Oe.call(this,"d")}V(xo,Oe);function Mo(){Oe.call(this,"c")}V(Mo,Oe);var jn={},al=null;function Zi(){return al=al||new te}jn.La="serverreachability";function cl(o){Oe.call(this,jn.La,o)}V(cl,Oe);function Gr(o){const l=Zi();ce(l,new cl(l))}jn.STAT_EVENT="statevent";function ll(o,l){Oe.call(this,jn.STAT_EVENT,o),this.stat=l}V(ll,Oe);function it(o){const l=Zi();ce(l,new ll(l,o))}jn.Ma="timingevent";function ul(o,l){Oe.call(this,jn.Ma,o),this.size=l}V(ul,Oe);function Qr(o,l){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){o()},l)}function Jr(){this.g=!0}Jr.prototype.xa=function(){this.g=!1};function Kp(o,l,h,p,b,P){o.info(function(){if(o.g)if(P)for(var H="",Te=P.split("&"),$e=0;$e<Te.length;$e++){var ge=Te[$e].split("=");if(1<ge.length){var Qe=ge[0];ge=ge[1];var Je=Qe.split("_");H=2<=Je.length&&Je[1]=="type"?H+(Qe+"="+ge+"&"):H+(Qe+"=redacted&")}}else H=null;else H=P;return"XMLHTTP REQ ("+p+") [attempt "+b+"]: "+l+`
`+h+`
`+H})}function Gp(o,l,h,p,b,P,H){o.info(function(){return"XMLHTTP RESP ("+p+") [ attempt "+b+"]: "+l+`
`+h+`
`+P+" "+H})}function ar(o,l,h,p){o.info(function(){return"XMLHTTP TEXT ("+l+"): "+Jp(o,h)+(p?" "+p:"")})}function Qp(o,l){o.info(function(){return"TIMEOUT: "+l})}Jr.prototype.info=function(){};function Jp(o,l){if(!o.g)return l;if(!l)return null;try{var h=JSON.parse(l);if(h){for(o=0;o<h.length;o++)if(Array.isArray(h[o])){var p=h[o];if(!(2>p.length)){var b=p[1];if(Array.isArray(b)&&!(1>b.length)){var P=b[0];if(P!="noop"&&P!="stop"&&P!="close")for(var H=1;H<b.length;H++)b[H]=""}}}}return je(h)}catch{return l}}var es={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},hl={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Lo;function ts(){}V(ts,No),ts.prototype.g=function(){return new XMLHttpRequest},ts.prototype.i=function(){return{}},Lo=new ts;function un(o,l,h,p){this.j=o,this.i=l,this.l=h,this.R=p||1,this.U=new xe(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new dl}function dl(){this.i=null,this.g="",this.h=!1}var fl={},Fo={};function Uo(o,l,h){o.L=1,o.v=ss(jt(l)),o.m=h,o.P=!0,pl(o,null)}function pl(o,l){o.F=Date.now(),ns(o),o.A=jt(o.v);var h=o.A,p=o.R;Array.isArray(p)||(p=[String(p)]),Pl(h.i,"t",p),o.C=0,h=o.j.J,o.h=new dl,o.g=Wl(o.j,h?l:null,!o.m),0<o.O&&(o.M=new ut(I(o.Y,o,o.g),o.O)),l=o.U,h=o.g,p=o.ca;var b="readystatechange";Array.isArray(b)||(b&&(ln[0]=b.toString()),b=ln);for(var P=0;P<b.length;P++){var H=L(h,b[P],p||l.handleEvent,!1,l.h||l);if(!H)break;l.g[H.key]=H}l=o.H?m(o.H):{},o.m?(o.u||(o.u="POST"),l["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,l)):(o.u="GET",o.g.ea(o.A,o.u,null,l)),Gr(),Kp(o.i,o.u,o.A,o.l,o.R,o.m)}un.prototype.ca=function(o){o=o.target;const l=this.M;l&&$t(o)==3?l.j():this.Y(o)},un.prototype.Y=function(o){try{if(o==this.g)e:{const Je=$t(this.g);var l=this.g.Ba();const ur=this.g.Z();if(!(3>Je)&&(Je!=3||this.g&&(this.h.h||this.g.oa()||xl(this.g)))){this.J||Je!=4||l==7||(l==8||0>=ur?Gr(3):Gr(2)),Bo(this);var h=this.g.Z();this.X=h;t:if(gl(this)){var p=xl(this.g);o="";var b=p.length,P=$t(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){$n(this),Yr(this);var H="";break t}this.h.i=new c.TextDecoder}for(l=0;l<b;l++)this.h.h=!0,o+=this.h.i.decode(p[l],{stream:!(P&&l==b-1)});p.length=0,this.h.g+=o,this.C=0,H=this.h.g}else H=this.g.oa();if(this.o=h==200,Gp(this.i,this.u,this.A,this.l,this.R,Je,h),this.o){if(this.T&&!this.K){t:{if(this.g){var Te,$e=this.g;if((Te=$e.g?$e.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!J(Te)){var ge=Te;break t}}ge=null}if(h=ge)ar(this.i,this.l,h,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,jo(this,h);else{this.o=!1,this.s=3,it(12),$n(this),Yr(this);break e}}if(this.P){h=!0;let It;for(;!this.J&&this.C<H.length;)if(It=Yp(this,H),It==Fo){Je==4&&(this.s=4,it(14),h=!1),ar(this.i,this.l,null,"[Incomplete Response]");break}else if(It==fl){this.s=4,it(15),ar(this.i,this.l,H,"[Invalid Chunk]"),h=!1;break}else ar(this.i,this.l,It,null),jo(this,It);if(gl(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Je!=4||H.length!=0||this.h.h||(this.s=1,it(16),h=!1),this.o=this.o&&h,!h)ar(this.i,this.l,H,"[Invalid Chunked Response]"),$n(this),Yr(this);else if(0<H.length&&!this.W){this.W=!0;var Qe=this.j;Qe.g==this&&Qe.ba&&!Qe.M&&(Qe.j.info("Great, no buffering proxy detected. Bytes received: "+H.length),Ko(Qe),Qe.M=!0,it(11))}}else ar(this.i,this.l,H,null),jo(this,H);Je==4&&$n(this),this.o&&!this.J&&(Je==4?$l(this.j,this):(this.o=!1,ns(this)))}else pg(this.g),h==400&&0<H.indexOf("Unknown SID")?(this.s=3,it(12)):(this.s=0,it(13)),$n(this),Yr(this)}}}catch{}finally{}};function gl(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function Yp(o,l){var h=o.C,p=l.indexOf(`
`,h);return p==-1?Fo:(h=Number(l.substring(h,p)),isNaN(h)?fl:(p+=1,p+h>l.length?Fo:(l=l.slice(p,p+h),o.C=p+h,l)))}un.prototype.cancel=function(){this.J=!0,$n(this)};function ns(o){o.S=Date.now()+o.I,ml(o,o.I)}function ml(o,l){if(o.B!=null)throw Error("WatchDog timer not null");o.B=Qr(I(o.ba,o),l)}function Bo(o){o.B&&(c.clearTimeout(o.B),o.B=null)}un.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(Qp(this.i,this.A),this.L!=2&&(Gr(),it(17)),$n(this),this.s=2,Yr(this)):ml(this,this.S-o)};function Yr(o){o.j.G==0||o.J||$l(o.j,o)}function $n(o){Bo(o);var l=o.M;l&&typeof l.ma=="function"&&l.ma(),o.M=null,Wr(o.U),o.g&&(l=o.g,o.g=null,l.abort(),l.ma())}function jo(o,l){try{var h=o.j;if(h.G!=0&&(h.g==o||$o(h.h,o))){if(!o.K&&$o(h.h,o)&&h.G==3){try{var p=h.Da.g.parse(l)}catch{p=null}if(Array.isArray(p)&&p.length==3){var b=p;if(b[0]==0){e:if(!h.u){if(h.g)if(h.g.F+3e3<o.F)hs(h),ls(h);else break e;Wo(h),it(18)}}else h.za=b[1],0<h.za-h.T&&37500>b[2]&&h.F&&h.v==0&&!h.C&&(h.C=Qr(I(h.Za,h),6e3));if(1>=vl(h.h)&&h.ca){try{h.ca()}catch{}h.ca=void 0}}else Hn(h,11)}else if((o.K||h.g==o)&&hs(h),!J(l))for(b=h.Da.g.parse(l),l=0;l<b.length;l++){let ge=b[l];if(h.T=ge[0],ge=ge[1],h.G==2)if(ge[0]=="c"){h.K=ge[1],h.ia=ge[2];const Qe=ge[3];Qe!=null&&(h.la=Qe,h.j.info("VER="+h.la));const Je=ge[4];Je!=null&&(h.Aa=Je,h.j.info("SVER="+h.Aa));const ur=ge[5];ur!=null&&typeof ur=="number"&&0<ur&&(p=1.5*ur,h.L=p,h.j.info("backChannelRequestTimeoutMs_="+p)),p=h;const It=o.g;if(It){const fs=It.g?It.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(fs){var P=p.h;P.g||fs.indexOf("spdy")==-1&&fs.indexOf("quic")==-1&&fs.indexOf("h2")==-1||(P.j=P.l,P.g=new Set,P.h&&(qo(P,P.h),P.h=null))}if(p.D){const Go=It.g?It.g.getResponseHeader("X-HTTP-Session-Id"):null;Go&&(p.ya=Go,Ae(p.I,p.D,Go))}}h.G=3,h.l&&h.l.ua(),h.ba&&(h.R=Date.now()-o.F,h.j.info("Handshake RTT: "+h.R+"ms")),p=h;var H=o;if(p.qa=zl(p,p.J?p.ia:null,p.W),H.K){El(p.h,H);var Te=H,$e=p.L;$e&&(Te.I=$e),Te.B&&(Bo(Te),ns(Te)),p.g=H}else Bl(p);0<h.i.length&&us(h)}else ge[0]!="stop"&&ge[0]!="close"||Hn(h,7);else h.G==3&&(ge[0]=="stop"||ge[0]=="close"?ge[0]=="stop"?Hn(h,7):zo(h):ge[0]!="noop"&&h.l&&h.l.ta(ge),h.v=0)}}Gr(4)}catch{}}var Xp=class{constructor(o,l){this.g=o,this.map=l}};function _l(o){this.l=o||10,c.PerformanceNavigationTiming?(o=c.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function yl(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function vl(o){return o.h?1:o.g?o.g.size:0}function $o(o,l){return o.h?o.h==l:o.g?o.g.has(l):!1}function qo(o,l){o.g?o.g.add(l):o.h=l}function El(o,l){o.h&&o.h==l?o.h=null:o.g&&o.g.has(l)&&o.g.delete(l)}_l.prototype.cancel=function(){if(this.i=Tl(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Tl(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let l=o.i;for(const h of o.g.values())l=l.concat(h.D);return l}return U(o.i)}function Zp(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(u(o)){for(var l=[],h=o.length,p=0;p<h;p++)l.push(o[p]);return l}l=[],h=0;for(p in o)l[h++]=o[p];return l}function eg(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(u(o)||typeof o=="string"){var l=[];o=o.length;for(var h=0;h<o;h++)l.push(h);return l}l=[],h=0;for(const p in o)l[h++]=p;return l}}}function Il(o,l){if(o.forEach&&typeof o.forEach=="function")o.forEach(l,void 0);else if(u(o)||typeof o=="string")Array.prototype.forEach.call(o,l,void 0);else for(var h=eg(o),p=Zp(o),b=p.length,P=0;P<b;P++)l.call(void 0,p[P],h&&h[P],o)}var wl=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function tg(o,l){if(o){o=o.split("&");for(var h=0;h<o.length;h++){var p=o[h].indexOf("="),b=null;if(0<=p){var P=o[h].substring(0,p);b=o[h].substring(p+1)}else P=o[h];l(P,b?decodeURIComponent(b.replace(/\+/g," ")):"")}}}function qn(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof qn){this.h=o.h,rs(this,o.j),this.o=o.o,this.g=o.g,is(this,o.s),this.l=o.l;var l=o.i,h=new ei;h.i=l.i,l.g&&(h.g=new Map(l.g),h.h=l.h),Al(this,h),this.m=o.m}else o&&(l=String(o).match(wl))?(this.h=!1,rs(this,l[1]||"",!0),this.o=Xr(l[2]||""),this.g=Xr(l[3]||"",!0),is(this,l[4]),this.l=Xr(l[5]||"",!0),Al(this,l[6]||"",!0),this.m=Xr(l[7]||"")):(this.h=!1,this.i=new ei(null,this.h))}qn.prototype.toString=function(){var o=[],l=this.j;l&&o.push(Zr(l,bl,!0),":");var h=this.g;return(h||l=="file")&&(o.push("//"),(l=this.o)&&o.push(Zr(l,bl,!0),"@"),o.push(encodeURIComponent(String(h)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.s,h!=null&&o.push(":",String(h))),(h=this.l)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(Zr(h,h.charAt(0)=="/"?ig:rg,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",Zr(h,og)),o.join("")};function jt(o){return new qn(o)}function rs(o,l,h){o.j=h?Xr(l,!0):l,o.j&&(o.j=o.j.replace(/:$/,""))}function is(o,l){if(l){if(l=Number(l),isNaN(l)||0>l)throw Error("Bad port number "+l);o.s=l}else o.s=null}function Al(o,l,h){l instanceof ei?(o.i=l,ag(o.i,o.h)):(h||(l=Zr(l,sg)),o.i=new ei(l,o.h))}function Ae(o,l,h){o.i.set(l,h)}function ss(o){return Ae(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function Xr(o,l){return o?l?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function Zr(o,l,h){return typeof o=="string"?(o=encodeURI(o).replace(l,ng),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function ng(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var bl=/[#\/\?@]/g,rg=/[#\?:]/g,ig=/[#\?]/g,sg=/[#\?@]/g,og=/#/g;function ei(o,l){this.h=this.g=null,this.i=o||null,this.j=!!l}function hn(o){o.g||(o.g=new Map,o.h=0,o.i&&tg(o.i,function(l,h){o.add(decodeURIComponent(l.replace(/\+/g," ")),h)}))}n=ei.prototype,n.add=function(o,l){hn(this),this.i=null,o=cr(this,o);var h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(l),this.h+=1,this};function Rl(o,l){hn(o),l=cr(o,l),o.g.has(l)&&(o.i=null,o.h-=o.g.get(l).length,o.g.delete(l))}function Sl(o,l){return hn(o),l=cr(o,l),o.g.has(l)}n.forEach=function(o,l){hn(this),this.g.forEach(function(h,p){h.forEach(function(b){o.call(l,b,p,this)},this)},this)},n.na=function(){hn(this);const o=Array.from(this.g.values()),l=Array.from(this.g.keys()),h=[];for(let p=0;p<l.length;p++){const b=o[p];for(let P=0;P<b.length;P++)h.push(l[p])}return h},n.V=function(o){hn(this);let l=[];if(typeof o=="string")Sl(this,o)&&(l=l.concat(this.g.get(cr(this,o))));else{o=Array.from(this.g.values());for(let h=0;h<o.length;h++)l=l.concat(o[h])}return l},n.set=function(o,l){return hn(this),this.i=null,o=cr(this,o),Sl(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[l]),this.h+=1,this},n.get=function(o,l){return o?(o=this.V(o),0<o.length?String(o[0]):l):l};function Pl(o,l,h){Rl(o,l),0<h.length&&(o.i=null,o.g.set(cr(o,l),U(h)),o.h+=h.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],l=Array.from(this.g.keys());for(var h=0;h<l.length;h++){var p=l[h];const P=encodeURIComponent(String(p)),H=this.V(p);for(p=0;p<H.length;p++){var b=P;H[p]!==""&&(b+="="+encodeURIComponent(String(H[p]))),o.push(b)}}return this.i=o.join("&")};function cr(o,l){return l=String(l),o.j&&(l=l.toLowerCase()),l}function ag(o,l){l&&!o.j&&(hn(o),o.i=null,o.g.forEach(function(h,p){var b=p.toLowerCase();p!=b&&(Rl(this,p),Pl(this,b,h))},o)),o.j=l}function cg(o,l){const h=new Jr;if(c.Image){const p=new Image;p.onload=S(dn,h,"TestLoadImage: loaded",!0,l,p),p.onerror=S(dn,h,"TestLoadImage: error",!1,l,p),p.onabort=S(dn,h,"TestLoadImage: abort",!1,l,p),p.ontimeout=S(dn,h,"TestLoadImage: timeout",!1,l,p),c.setTimeout(function(){p.ontimeout&&p.ontimeout()},1e4),p.src=o}else l(!1)}function lg(o,l){const h=new Jr,p=new AbortController,b=setTimeout(()=>{p.abort(),dn(h,"TestPingServer: timeout",!1,l)},1e4);fetch(o,{signal:p.signal}).then(P=>{clearTimeout(b),P.ok?dn(h,"TestPingServer: ok",!0,l):dn(h,"TestPingServer: server error",!1,l)}).catch(()=>{clearTimeout(b),dn(h,"TestPingServer: error",!1,l)})}function dn(o,l,h,p,b){try{b&&(b.onload=null,b.onerror=null,b.onabort=null,b.ontimeout=null),p(h)}catch{}}function ug(){this.g=new Xi}function hg(o,l,h){const p=h||"";try{Il(o,function(b,P){let H=b;d(b)&&(H=je(b)),l.push(p+P+"="+encodeURIComponent(H))})}catch(b){throw l.push(p+"type="+encodeURIComponent("_badmap")),b}}function os(o){this.l=o.Ub||null,this.j=o.eb||!1}V(os,No),os.prototype.g=function(){return new as(this.l,this.j)},os.prototype.i=function(o){return function(){return o}}({});function as(o,l){te.call(this),this.D=o,this.o=l,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}V(as,te),n=as.prototype,n.open=function(o,l){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=l,this.readyState=1,ni(this)},n.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const l={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(l.body=o),(this.D||c).fetch(new Request(this.A,l)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,ti(this)),this.readyState=0},n.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,ni(this)),this.g&&(this.readyState=3,ni(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Cl(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function Cl(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}n.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var l=o.value?o.value:new Uint8Array(0);(l=this.v.decode(l,{stream:!o.done}))&&(this.response=this.responseText+=l)}o.done?ti(this):ni(this),this.readyState==3&&Cl(this)}},n.Ra=function(o){this.g&&(this.response=this.responseText=o,ti(this))},n.Qa=function(o){this.g&&(this.response=o,ti(this))},n.ga=function(){this.g&&ti(this)};function ti(o){o.readyState=4,o.l=null,o.j=null,o.v=null,ni(o)}n.setRequestHeader=function(o,l){this.u.append(o,l)},n.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],l=this.h.entries();for(var h=l.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=l.next();return o.join(`\r
`)};function ni(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(as.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function kl(o){let l="";return X(o,function(h,p){l+=p,l+=":",l+=h,l+=`\r
`}),l}function Ho(o,l,h){e:{for(p in h){var p=!1;break e}p=!0}p||(h=kl(h),typeof o=="string"?h!=null&&encodeURIComponent(String(h)):Ae(o,l,h))}function Pe(o){te.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}V(Pe,te);var dg=/^https?$/i,fg=["POST","PUT"];n=Pe.prototype,n.Ha=function(o){this.J=o},n.ea=function(o,l,h,p){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);l=l?l.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Lo.g(),this.v=this.o?sl(this.o):sl(Lo),this.g.onreadystatechange=I(this.Ea,this);try{this.B=!0,this.g.open(l,String(o),!0),this.B=!1}catch(P){Dl(this,P);return}if(o=h||"",h=new Map(this.headers),p)if(Object.getPrototypeOf(p)===Object.prototype)for(var b in p)h.set(b,p[b]);else if(typeof p.keys=="function"&&typeof p.get=="function")for(const P of p.keys())h.set(P,p.get(P));else throw Error("Unknown input type for opt_headers: "+String(p));p=Array.from(h.keys()).find(P=>P.toLowerCase()=="content-type"),b=c.FormData&&o instanceof c.FormData,!(0<=Array.prototype.indexOf.call(fg,l,void 0))||p||b||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[P,H]of h)this.g.setRequestHeader(P,H);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Nl(this),this.u=!0,this.g.send(o),this.u=!1}catch(P){Dl(this,P)}};function Dl(o,l){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=l,o.m=5,Vl(o),cs(o)}function Vl(o){o.A||(o.A=!0,ce(o,"complete"),ce(o,"error"))}n.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,ce(this,"complete"),ce(this,"abort"),cs(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),cs(this,!0)),Pe.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?Ol(this):this.bb())},n.bb=function(){Ol(this)};function Ol(o){if(o.h&&typeof a<"u"&&(!o.v[1]||$t(o)!=4||o.Z()!=2)){if(o.u&&$t(o)==4)Be(o.Ea,0,o);else if(ce(o,"readystatechange"),$t(o)==4){o.h=!1;try{const H=o.Z();e:switch(H){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var l=!0;break e;default:l=!1}var h;if(!(h=l)){var p;if(p=H===0){var b=String(o.D).match(wl)[1]||null;!b&&c.self&&c.self.location&&(b=c.self.location.protocol.slice(0,-1)),p=!dg.test(b?b.toLowerCase():"")}h=p}if(h)ce(o,"complete"),ce(o,"success");else{o.m=6;try{var P=2<$t(o)?o.g.statusText:""}catch{P=""}o.l=P+" ["+o.Z()+"]",Vl(o)}}finally{cs(o)}}}}function cs(o,l){if(o.g){Nl(o);const h=o.g,p=o.v[0]?()=>{}:null;o.g=null,o.v=null,l||ce(o,"ready");try{h.onreadystatechange=p}catch{}}}function Nl(o){o.I&&(c.clearTimeout(o.I),o.I=null)}n.isActive=function(){return!!this.g};function $t(o){return o.g?o.g.readyState:0}n.Z=function(){try{return 2<$t(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(o){if(this.g){var l=this.g.responseText;return o&&l.indexOf(o)==0&&(l=l.substring(o.length)),pt(l)}};function xl(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function pg(o){const l={};o=(o.g&&2<=$t(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let p=0;p<o.length;p++){if(J(o[p]))continue;var h=A(o[p]);const b=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();const P=l[b]||[];l[b]=P,P.push(h)}T(l,function(p){return p.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function ri(o,l,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||l}function Ml(o){this.Aa=0,this.i=[],this.j=new Jr,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=ri("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=ri("baseRetryDelayMs",5e3,o),this.cb=ri("retryDelaySeedMs",1e4,o),this.Wa=ri("forwardChannelMaxRetries",2,o),this.wa=ri("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new _l(o&&o.concurrentRequestLimit),this.Da=new ug,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=Ml.prototype,n.la=8,n.G=1,n.connect=function(o,l,h,p){it(0),this.W=o,this.H=l||{},h&&p!==void 0&&(this.H.OSID=h,this.H.OAID=p),this.F=this.X,this.I=zl(this,null,this.W),us(this)};function zo(o){if(Ll(o),o.G==3){var l=o.U++,h=jt(o.I);if(Ae(h,"SID",o.K),Ae(h,"RID",l),Ae(h,"TYPE","terminate"),ii(o,h),l=new un(o,o.j,l),l.L=2,l.v=ss(jt(h)),h=!1,c.navigator&&c.navigator.sendBeacon)try{h=c.navigator.sendBeacon(l.v.toString(),"")}catch{}!h&&c.Image&&(new Image().src=l.v,h=!0),h||(l.g=Wl(l.j,null),l.g.ea(l.v)),l.F=Date.now(),ns(l)}Hl(o)}function ls(o){o.g&&(Ko(o),o.g.cancel(),o.g=null)}function Ll(o){ls(o),o.u&&(c.clearTimeout(o.u),o.u=null),hs(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&c.clearTimeout(o.s),o.s=null)}function us(o){if(!yl(o.h)&&!o.s){o.s=!0;var l=o.Ga;ve||Ln(),pe||(ve(),pe=!0),Et.add(l,o),o.B=0}}function gg(o,l){return vl(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=l.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=Qr(I(o.Ga,o,l),ql(o,o.B)),o.B++,!0)}n.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const b=new un(this,this.j,o);let P=this.o;if(this.S&&(P?(P=m(P),E(P,this.S)):P=this.S),this.m!==null||this.O||(b.H=P,P=null),this.P)e:{for(var l=0,h=0;h<this.i.length;h++){t:{var p=this.i[h];if("__data__"in p.map&&(p=p.map.__data__,typeof p=="string")){p=p.length;break t}p=void 0}if(p===void 0)break;if(l+=p,4096<l){l=h;break e}if(l===4096||h===this.i.length-1){l=h+1;break e}}l=1e3}else l=1e3;l=Ul(this,b,l),h=jt(this.I),Ae(h,"RID",o),Ae(h,"CVER",22),this.D&&Ae(h,"X-HTTP-Session-Id",this.D),ii(this,h),P&&(this.O?l="headers="+encodeURIComponent(String(kl(P)))+"&"+l:this.m&&Ho(h,this.m,P)),qo(this.h,b),this.Ua&&Ae(h,"TYPE","init"),this.P?(Ae(h,"$req",l),Ae(h,"SID","null"),b.T=!0,Uo(b,h,null)):Uo(b,h,l),this.G=2}}else this.G==3&&(o?Fl(this,o):this.i.length==0||yl(this.h)||Fl(this))};function Fl(o,l){var h;l?h=l.l:h=o.U++;const p=jt(o.I);Ae(p,"SID",o.K),Ae(p,"RID",h),Ae(p,"AID",o.T),ii(o,p),o.m&&o.o&&Ho(p,o.m,o.o),h=new un(o,o.j,h,o.B+1),o.m===null&&(h.H=o.o),l&&(o.i=l.D.concat(o.i)),l=Ul(o,h,1e3),h.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),qo(o.h,h),Uo(h,p,l)}function ii(o,l){o.H&&X(o.H,function(h,p){Ae(l,p,h)}),o.l&&Il({},function(h,p){Ae(l,p,h)})}function Ul(o,l,h){h=Math.min(o.i.length,h);var p=o.l?I(o.l.Na,o.l,o):null;e:{var b=o.i;let P=-1;for(;;){const H=["count="+h];P==-1?0<h?(P=b[0].g,H.push("ofs="+P)):P=0:H.push("ofs="+P);let Te=!0;for(let $e=0;$e<h;$e++){let ge=b[$e].g;const Qe=b[$e].map;if(ge-=P,0>ge)P=Math.max(0,b[$e].g-100),Te=!1;else try{hg(Qe,H,"req"+ge+"_")}catch{p&&p(Qe)}}if(Te){p=H.join("&");break e}}}return o=o.i.splice(0,h),l.D=o,p}function Bl(o){if(!o.g&&!o.u){o.Y=1;var l=o.Fa;ve||Ln(),pe||(ve(),pe=!0),Et.add(l,o),o.v=0}}function Wo(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=Qr(I(o.Fa,o),ql(o,o.v)),o.v++,!0)}n.Fa=function(){if(this.u=null,jl(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=Qr(I(this.ab,this),o)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,it(10),ls(this),jl(this))};function Ko(o){o.A!=null&&(c.clearTimeout(o.A),o.A=null)}function jl(o){o.g=new un(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var l=jt(o.qa);Ae(l,"RID","rpc"),Ae(l,"SID",o.K),Ae(l,"AID",o.T),Ae(l,"CI",o.F?"0":"1"),!o.F&&o.ja&&Ae(l,"TO",o.ja),Ae(l,"TYPE","xmlhttp"),ii(o,l),o.m&&o.o&&Ho(l,o.m,o.o),o.L&&(o.g.I=o.L);var h=o.g;o=o.ia,h.L=1,h.v=ss(jt(l)),h.m=null,h.P=!0,pl(h,o)}n.Za=function(){this.C!=null&&(this.C=null,ls(this),Wo(this),it(19))};function hs(o){o.C!=null&&(c.clearTimeout(o.C),o.C=null)}function $l(o,l){var h=null;if(o.g==l){hs(o),Ko(o),o.g=null;var p=2}else if($o(o.h,l))h=l.D,El(o.h,l),p=1;else return;if(o.G!=0){if(l.o)if(p==1){h=l.m?l.m.length:0,l=Date.now()-l.F;var b=o.B;p=Zi(),ce(p,new ul(p,h)),us(o)}else Bl(o);else if(b=l.s,b==3||b==0&&0<l.X||!(p==1&&gg(o,l)||p==2&&Wo(o)))switch(h&&0<h.length&&(l=o.h,l.i=l.i.concat(h)),b){case 1:Hn(o,5);break;case 4:Hn(o,10);break;case 3:Hn(o,6);break;default:Hn(o,2)}}}function ql(o,l){let h=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(h*=2),h*l}function Hn(o,l){if(o.j.info("Error code "+l),l==2){var h=I(o.fb,o),p=o.Xa;const b=!p;p=new qn(p||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||rs(p,"https"),ss(p),b?cg(p.toString(),h):lg(p.toString(),h)}else it(2);o.G=0,o.l&&o.l.sa(l),Hl(o),Ll(o)}n.fb=function(o){o?(this.j.info("Successfully pinged google.com"),it(2)):(this.j.info("Failed to ping google.com"),it(1))};function Hl(o){if(o.G=0,o.ka=[],o.l){const l=Tl(o.h);(l.length!=0||o.i.length!=0)&&(B(o.ka,l),B(o.ka,o.i),o.h.i.length=0,U(o.i),o.i.length=0),o.l.ra()}}function zl(o,l,h){var p=h instanceof qn?jt(h):new qn(h);if(p.g!="")l&&(p.g=l+"."+p.g),is(p,p.s);else{var b=c.location;p=b.protocol,l=l?l+"."+b.hostname:b.hostname,b=+b.port;var P=new qn(null);p&&rs(P,p),l&&(P.g=l),b&&is(P,b),h&&(P.l=h),p=P}return h=o.D,l=o.ya,h&&l&&Ae(p,h,l),Ae(p,"VER",o.la),ii(o,p),p}function Wl(o,l,h){if(l&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return l=o.Ca&&!o.pa?new Pe(new os({eb:h})):new Pe(o.pa),l.Ha(o.J),l}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function Kl(){}n=Kl.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function ds(){}ds.prototype.g=function(o,l){return new ht(o,l)};function ht(o,l){te.call(this),this.g=new Ml(l),this.l=o,this.h=l&&l.messageUrlParams||null,o=l&&l.messageHeaders||null,l&&l.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=l&&l.initMessageHeaders||null,l&&l.messageContentType&&(o?o["X-WebChannel-Content-Type"]=l.messageContentType:o={"X-WebChannel-Content-Type":l.messageContentType}),l&&l.va&&(o?o["X-WebChannel-Client-Profile"]=l.va:o={"X-WebChannel-Client-Profile":l.va}),this.g.S=o,(o=l&&l.Sb)&&!J(o)&&(this.g.m=o),this.v=l&&l.supportsCrossDomainXhr||!1,this.u=l&&l.sendRawJson||!1,(l=l&&l.httpSessionIdParam)&&!J(l)&&(this.g.D=l,o=this.h,o!==null&&l in o&&(o=this.h,l in o&&delete o[l])),this.j=new lr(this)}V(ht,te),ht.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},ht.prototype.close=function(){zo(this.g)},ht.prototype.o=function(o){var l=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.u&&(h={},h.__data__=je(o),o=h);l.i.push(new Xp(l.Ya++,o)),l.G==3&&us(l)},ht.prototype.N=function(){this.g.l=null,delete this.j,zo(this.g),delete this.g,ht.aa.N.call(this)};function Gl(o){xo.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var l=o.__sm__;if(l){e:{for(const h in l){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,l=l!==null&&o in l?l[o]:void 0),this.data=l}else this.data=o}V(Gl,xo);function Ql(){Mo.call(this),this.status=1}V(Ql,Mo);function lr(o){this.g=o}V(lr,Kl),lr.prototype.ua=function(){ce(this.g,"a")},lr.prototype.ta=function(o){ce(this.g,new Gl(o))},lr.prototype.sa=function(o){ce(this.g,new Ql)},lr.prototype.ra=function(){ce(this.g,"b")},ds.prototype.createWebChannel=ds.prototype.g,ht.prototype.send=ht.prototype.o,ht.prototype.open=ht.prototype.m,ht.prototype.close=ht.prototype.close,Yd=function(){return new ds},Jd=function(){return Zi()},Qd=jn,Ma={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},es.NO_ERROR=0,es.TIMEOUT=8,es.HTTP_ERROR=6,Rs=es,hl.COMPLETE="complete",Gd=hl,ol.EventType=Kr,Kr.OPEN="a",Kr.CLOSE="b",Kr.ERROR="c",Kr.MESSAGE="d",te.prototype.listen=te.prototype.K,li=ol,Pe.prototype.listenOnce=Pe.prototype.L,Pe.prototype.getLastError=Pe.prototype.Ka,Pe.prototype.getLastErrorCode=Pe.prototype.Ba,Pe.prototype.getStatus=Pe.prototype.Z,Pe.prototype.getResponseJson=Pe.prototype.Oa,Pe.prototype.getResponseText=Pe.prototype.oa,Pe.prototype.send=Pe.prototype.ea,Pe.prototype.setWithCredentials=Pe.prototype.Ha,Kd=Pe}).apply(typeof _s<"u"?_s:typeof self<"u"?self:typeof window<"u"?window:{});const Ou="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ze{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Ze.UNAUTHENTICATED=new Ze(null),Ze.GOOGLE_CREDENTIALS=new Ze("google-credentials-uid"),Ze.FIRST_PARTY=new Ze("first-party-uid"),Ze.MOCK_USER=new Ze("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Ur="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zn=new Ec("@firebase/firestore");function ai(){return Zn.logLevel}function G(n,...e){if(Zn.logLevel<=he.DEBUG){const t=e.map(wc);Zn.debug(`Firestore (${Ur}): ${n}`,...t)}}function en(n,...e){if(Zn.logLevel<=he.ERROR){const t=e.map(wc);Zn.error(`Firestore (${Ur}): ${n}`,...t)}}function Dr(n,...e){if(Zn.logLevel<=he.WARN){const t=e.map(wc);Zn.warn(`Firestore (${Ur}): ${n}`,...t)}}function wc(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
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
 */function ie(n="Unexpected state"){const e=`FIRESTORE (${Ur}) INTERNAL ASSERTION FAILED: `+n;throw en(e),new Error(e)}function Ee(n,e){n||ie()}function ae(n,e){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const M={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class Z extends on{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sn{constructor(){this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xd{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Ev{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable(()=>t(Ze.UNAUTHENTICATED))}shutdown(){}}class Tv{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable(()=>t(this.token.user))}shutdown(){this.changeListener=null}}class Iv{constructor(e){this.t=e,this.currentUser=Ze.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){Ee(this.o===void 0);let r=this.i;const i=u=>this.i!==r?(r=this.i,t(u)):Promise.resolve();let s=new Sn;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new Sn,e.enqueueRetryable(()=>i(this.currentUser))};const a=()=>{const u=s;e.enqueueRetryable(async()=>{await u.promise,await i(this.currentUser)})},c=u=>{G("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(u=>c(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?c(u):(G("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new Sn)}},0),a()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then(r=>this.i!==e?(G("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(Ee(typeof r.accessToken=="string"),new Xd(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Ee(e===null||typeof e=="string"),new Ze(e)}}class wv{constructor(e,t,r){this.l=e,this.h=t,this.P=r,this.type="FirstParty",this.user=Ze.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class Av{constructor(e,t,r){this.l=e,this.h=t,this.P=r}getToken(){return Promise.resolve(new wv(this.l,this.h,this.P))}start(e,t){e.enqueueRetryable(()=>t(Ze.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class bv{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Rv{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,t){Ee(this.o===void 0);const r=s=>{s.error!=null&&G("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);const a=s.token!==this.R;return this.R=s.token,G("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?t(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>r(s))};const i=s=>{G("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(s=>i(s)),setTimeout(()=>{if(!this.appCheck){const s=this.A.getImmediate({optional:!0});s?i(s):G("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(t=>t?(Ee(typeof t.token=="string"),this.R=t.token,new bv(t.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Sv(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zd{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const i=Sv(40);for(let s=0;s<i.length;++s)r.length<20&&i[s]<t&&(r+=e.charAt(i[s]%e.length))}return r}}function me(n,e){return n<e?-1:n>e?1:0}function Vr(n,e,t){return n.length===e.length&&n.every((r,i)=>t(r,e[i]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Le{constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new Z(M.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new Z(M.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<-62135596800)throw new Z(M.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new Z(M.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return Le.fromMillis(Date.now())}static fromDate(e){return Le.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*t));return new Le(t,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?me(this.nanoseconds,e.nanoseconds):me(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class se{constructor(e){this.timestamp=e}static fromTimestamp(e){return new se(e)}static min(){return new se(new Le(0,0))}static max(){return new se(new Le(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ki{constructor(e,t,r){t===void 0?t=0:t>e.length&&ie(),r===void 0?r=e.length-t:r>e.length-t&&ie(),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return ki.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof ki?e.forEach(r=>{t.push(r)}):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let i=0;i<r;i++){const s=e.get(i),a=t.get(i);if(s<a)return-1;if(s>a)return 1}return e.length<t.length?-1:e.length>t.length?1:0}}class be extends ki{construct(e,t,r){return new be(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new Z(M.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter(i=>i.length>0))}return new be(t)}static emptyPath(){return new be([])}}const Pv=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class ze extends ki{construct(e,t,r){return new ze(e,t,r)}static isValidIdentifier(e){return Pv.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),ze.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new ze(["__name__"])}static fromServerFormat(e){const t=[];let r="",i=0;const s=()=>{if(r.length===0)throw new Z(M.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let a=!1;for(;i<e.length;){const c=e[i];if(c==="\\"){if(i+1===e.length)throw new Z(M.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[i+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new Z(M.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,i+=2}else c==="`"?(a=!a,i++):c!=="."||a?(r+=c,i++):(s(),i++)}if(s(),a)throw new Z(M.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new ze(t)}static emptyPath(){return new ze([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ee{constructor(e){this.path=e}static fromPath(e){return new ee(be.fromString(e))}static fromName(e){return new ee(be.fromString(e).popFirst(5))}static empty(){return new ee(be.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&be.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return be.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new ee(new be(e.slice()))}}function Cv(n,e){const t=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,i=se.fromTimestamp(r===1e9?new Le(t+1,0):new Le(t,r));return new Vn(i,ee.empty(),e)}function kv(n){return new Vn(n.readTime,n.key,-1)}class Vn{constructor(e,t,r){this.readTime=e,this.documentKey=t,this.largestBatchId=r}static min(){return new Vn(se.min(),ee.empty(),-1)}static max(){return new Vn(se.max(),ee.empty(),-1)}}function Dv(n,e){let t=n.readTime.compareTo(e.readTime);return t!==0?t:(t=ee.comparator(n.documentKey,e.documentKey),t!==0?t:me(n.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vv="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Ov{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $i(n){if(n.code!==M.FAILED_PRECONDITION||n.message!==Vv)throw n;G("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class N{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(t=>{this.isDone=!0,this.result=t,this.nextCallback&&this.nextCallback(t)},t=>{this.isDone=!0,this.error=t,this.catchCallback&&this.catchCallback(t)})}catch(e){return this.next(void 0,e)}next(e,t){return this.callbackAttached&&ie(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(t,this.error):this.wrapSuccess(e,this.result):new N((r,i)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(r,i)},this.catchCallback=s=>{this.wrapFailure(t,s).next(r,i)}})}toPromise(){return new Promise((e,t)=>{this.next(e,t)})}wrapUserFunction(e){try{const t=e();return t instanceof N?t:N.resolve(t)}catch(t){return N.reject(t)}}wrapSuccess(e,t){return e?this.wrapUserFunction(()=>e(t)):N.resolve(t)}wrapFailure(e,t){return e?this.wrapUserFunction(()=>e(t)):N.reject(t)}static resolve(e){return new N((t,r)=>{t(e)})}static reject(e){return new N((t,r)=>{r(e)})}static waitFor(e){return new N((t,r)=>{let i=0,s=0,a=!1;e.forEach(c=>{++i,c.next(()=>{++s,a&&s===i&&t()},u=>r(u))}),a=!0,s===i&&t()})}static or(e){let t=N.resolve(!1);for(const r of e)t=t.next(i=>i?N.resolve(i):r());return t}static forEach(e,t){const r=[];return e.forEach((i,s)=>{r.push(t.call(this,i,s))}),this.waitFor(r)}static mapArray(e,t){return new N((r,i)=>{const s=e.length,a=new Array(s);let c=0;for(let u=0;u<s;u++){const d=u;t(e[d]).next(f=>{a[d]=f,++c,c===s&&r(a)},f=>i(f))}})}static doWhile(e,t){return new N((r,i)=>{const s=()=>{e()===!0?t().next(()=>{s()},i):r()};s()})}}function Nv(n){const e=n.match(/Android ([\d.]+)/i),t=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(t)}function qi(n){return n.name==="IndexedDbTransactionError"}/**
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
 */class Ac{constructor(e,t){this.previousValue=e,t&&(t.sequenceNumberHandler=r=>this.ie(r),this.se=r=>t.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}Ac.oe=-1;function go(n){return n==null}function Hs(n){return n===0&&1/n==-1/0}function xv(n){return typeof n=="number"&&Number.isInteger(n)&&!Hs(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nu(n){let e=0;for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e++;return e}function Br(n,e){for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&e(t,n[t])}function ef(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Se{constructor(e,t){this.comparator=e,this.root=t||qe.EMPTY}insert(e,t){return new Se(this.comparator,this.root.insert(e,t,this.comparator).copy(null,null,qe.BLACK,null,null))}remove(e){return new Se(this.comparator,this.root.remove(e,this.comparator).copy(null,null,qe.BLACK,null,null))}get(e){let t=this.root;for(;!t.isEmpty();){const r=this.comparator(e,t.key);if(r===0)return t.value;r<0?t=t.left:r>0&&(t=t.right)}return null}indexOf(e){let t=0,r=this.root;for(;!r.isEmpty();){const i=this.comparator(e,r.key);if(i===0)return t+r.left.size;i<0?r=r.left:(t+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((t,r)=>(e(t,r),!1))}toString(){const e=[];return this.inorderTraversal((t,r)=>(e.push(`${t}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new ys(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new ys(this.root,e,this.comparator,!1)}getReverseIterator(){return new ys(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new ys(this.root,e,this.comparator,!0)}}class ys{constructor(e,t,r,i){this.isReverse=i,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=t?r(e.key,t):1,t&&i&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const t={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return t}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class qe{constructor(e,t,r,i,s){this.key=e,this.value=t,this.color=r??qe.RED,this.left=i??qe.EMPTY,this.right=s??qe.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,t,r,i,s){return new qe(e??this.key,t??this.value,r??this.color,i??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,t,r){let i=this;const s=r(e,i.key);return i=s<0?i.copy(null,null,null,i.left.insert(e,t,r),null):s===0?i.copy(null,t,null,null,null):i.copy(null,null,null,null,i.right.insert(e,t,r)),i.fixUp()}removeMin(){if(this.left.isEmpty())return qe.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,t){let r,i=this;if(t(e,i.key)<0)i.left.isEmpty()||i.left.isRed()||i.left.left.isRed()||(i=i.moveRedLeft()),i=i.copy(null,null,null,i.left.remove(e,t),null);else{if(i.left.isRed()&&(i=i.rotateRight()),i.right.isEmpty()||i.right.isRed()||i.right.left.isRed()||(i=i.moveRedRight()),t(e,i.key)===0){if(i.right.isEmpty())return qe.EMPTY;r=i.right.min(),i=i.copy(r.key,r.value,null,null,i.right.removeMin())}i=i.copy(null,null,null,null,i.right.remove(e,t))}return i.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,qe.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,qe.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),t=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,t)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw ie();const e=this.left.check();if(e!==this.right.check())throw ie();return e+(this.isRed()?0:1)}}qe.EMPTY=null,qe.RED=!0,qe.BLACK=!1;qe.EMPTY=new class{constructor(){this.size=0}get key(){throw ie()}get value(){throw ie()}get color(){throw ie()}get left(){throw ie()}get right(){throw ie()}copy(e,t,r,i,s){return this}insert(e,t,r){return new qe(e,t)}remove(e,t){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class We{constructor(e){this.comparator=e,this.data=new Se(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((t,r)=>(e(t),!1))}forEachInRange(e,t){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const i=r.getNext();if(this.comparator(i.key,e[1])>=0)return;t(i.key)}}forEachWhile(e,t){let r;for(r=t!==void 0?this.data.getIteratorFrom(t):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const t=this.data.getIteratorFrom(e);return t.hasNext()?t.getNext().key:null}getIterator(){return new xu(this.data.getIterator())}getIteratorFrom(e){return new xu(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let t=this;return t.size<e.size&&(t=e,e=this),e.forEach(r=>{t=t.add(r)}),t}isEqual(e){if(!(e instanceof We)||this.size!==e.size)return!1;const t=this.data.getIterator(),r=e.data.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(this.comparator(i,s)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(t=>{e.push(t)}),e}toString(){const e=[];return this.forEach(t=>e.push(t)),"SortedSet("+e.toString()+")"}copy(e){const t=new We(this.comparator);return t.data=e,t}}class xu{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class At{constructor(e){this.fields=e,e.sort(ze.comparator)}static empty(){return new At([])}unionWith(e){let t=new We(ze.comparator);for(const r of this.fields)t=t.add(r);for(const r of e)t=t.add(r);return new At(t.toArray())}covers(e){for(const t of this.fields)if(t.isPrefixOf(e))return!0;return!1}isEqual(e){return Vr(this.fields,e.fields,(t,r)=>t.isEqual(r))}}/**
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
 */class tf extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ge{constructor(e){this.binaryString=e}static fromBase64String(e){const t=function(i){try{return atob(i)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new tf("Invalid base64 string: "+s):s}}(e);return new Ge(t)}static fromUint8Array(e){const t=function(i){let s="";for(let a=0;a<i.length;++a)s+=String.fromCharCode(i[a]);return s}(e);return new Ge(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(t){return btoa(t)}(this.binaryString)}toUint8Array(){return function(t){const r=new Uint8Array(t.length);for(let i=0;i<t.length;i++)r[i]=t.charCodeAt(i);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return me(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Ge.EMPTY_BYTE_STRING=new Ge("");const Mv=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function On(n){if(Ee(!!n),typeof n=="string"){let e=0;const t=Mv.exec(n);if(Ee(!!t),t[1]){let i=t[1];i=(i+"000000000").substr(0,9),e=Number(i)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:Ce(n.seconds),nanos:Ce(n.nanos)}}function Ce(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function er(n){return typeof n=="string"?Ge.fromBase64String(n):Ge.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bc(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="server_timestamp"}function Rc(n){const e=n.mapValue.fields.__previous_value__;return bc(e)?Rc(e):e}function Di(n){const e=On(n.mapValue.fields.__local_write_time__.timestampValue);return new Le(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lv{constructor(e,t,r,i,s,a,c,u,d){this.databaseId=e,this.appId=t,this.persistenceKey=r,this.host=i,this.ssl=s,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=u,this.useFetchStreams=d}}class Vi{constructor(e,t){this.projectId=e,this.database=t||"(default)"}static empty(){return new Vi("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof Vi&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const vs={mapValue:{fields:{__type__:{stringValue:"__max__"}}}};function tr(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?bc(n)?4:Uv(n)?9007199254740991:Fv(n)?10:11:ie()}function Ft(n,e){if(n===e)return!0;const t=tr(n);if(t!==tr(e))return!1;switch(t){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===e.booleanValue;case 4:return Di(n).isEqual(Di(e));case 3:return function(i,s){if(typeof i.timestampValue=="string"&&typeof s.timestampValue=="string"&&i.timestampValue.length===s.timestampValue.length)return i.timestampValue===s.timestampValue;const a=On(i.timestampValue),c=On(s.timestampValue);return a.seconds===c.seconds&&a.nanos===c.nanos}(n,e);case 5:return n.stringValue===e.stringValue;case 6:return function(i,s){return er(i.bytesValue).isEqual(er(s.bytesValue))}(n,e);case 7:return n.referenceValue===e.referenceValue;case 8:return function(i,s){return Ce(i.geoPointValue.latitude)===Ce(s.geoPointValue.latitude)&&Ce(i.geoPointValue.longitude)===Ce(s.geoPointValue.longitude)}(n,e);case 2:return function(i,s){if("integerValue"in i&&"integerValue"in s)return Ce(i.integerValue)===Ce(s.integerValue);if("doubleValue"in i&&"doubleValue"in s){const a=Ce(i.doubleValue),c=Ce(s.doubleValue);return a===c?Hs(a)===Hs(c):isNaN(a)&&isNaN(c)}return!1}(n,e);case 9:return Vr(n.arrayValue.values||[],e.arrayValue.values||[],Ft);case 10:case 11:return function(i,s){const a=i.mapValue.fields||{},c=s.mapValue.fields||{};if(Nu(a)!==Nu(c))return!1;for(const u in a)if(a.hasOwnProperty(u)&&(c[u]===void 0||!Ft(a[u],c[u])))return!1;return!0}(n,e);default:return ie()}}function Oi(n,e){return(n.values||[]).find(t=>Ft(t,e))!==void 0}function Or(n,e){if(n===e)return 0;const t=tr(n),r=tr(e);if(t!==r)return me(t,r);switch(t){case 0:case 9007199254740991:return 0;case 1:return me(n.booleanValue,e.booleanValue);case 2:return function(s,a){const c=Ce(s.integerValue||s.doubleValue),u=Ce(a.integerValue||a.doubleValue);return c<u?-1:c>u?1:c===u?0:isNaN(c)?isNaN(u)?0:-1:1}(n,e);case 3:return Mu(n.timestampValue,e.timestampValue);case 4:return Mu(Di(n),Di(e));case 5:return me(n.stringValue,e.stringValue);case 6:return function(s,a){const c=er(s),u=er(a);return c.compareTo(u)}(n.bytesValue,e.bytesValue);case 7:return function(s,a){const c=s.split("/"),u=a.split("/");for(let d=0;d<c.length&&d<u.length;d++){const f=me(c[d],u[d]);if(f!==0)return f}return me(c.length,u.length)}(n.referenceValue,e.referenceValue);case 8:return function(s,a){const c=me(Ce(s.latitude),Ce(a.latitude));return c!==0?c:me(Ce(s.longitude),Ce(a.longitude))}(n.geoPointValue,e.geoPointValue);case 9:return Lu(n.arrayValue,e.arrayValue);case 10:return function(s,a){var c,u,d,f;const g=s.fields||{},I=a.fields||{},S=(c=g.value)===null||c===void 0?void 0:c.arrayValue,V=(u=I.value)===null||u===void 0?void 0:u.arrayValue,U=me(((d=S==null?void 0:S.values)===null||d===void 0?void 0:d.length)||0,((f=V==null?void 0:V.values)===null||f===void 0?void 0:f.length)||0);return U!==0?U:Lu(S,V)}(n.mapValue,e.mapValue);case 11:return function(s,a){if(s===vs.mapValue&&a===vs.mapValue)return 0;if(s===vs.mapValue)return 1;if(a===vs.mapValue)return-1;const c=s.fields||{},u=Object.keys(c),d=a.fields||{},f=Object.keys(d);u.sort(),f.sort();for(let g=0;g<u.length&&g<f.length;++g){const I=me(u[g],f[g]);if(I!==0)return I;const S=Or(c[u[g]],d[f[g]]);if(S!==0)return S}return me(u.length,f.length)}(n.mapValue,e.mapValue);default:throw ie()}}function Mu(n,e){if(typeof n=="string"&&typeof e=="string"&&n.length===e.length)return me(n,e);const t=On(n),r=On(e),i=me(t.seconds,r.seconds);return i!==0?i:me(t.nanos,r.nanos)}function Lu(n,e){const t=n.values||[],r=e.values||[];for(let i=0;i<t.length&&i<r.length;++i){const s=Or(t[i],r[i]);if(s)return s}return me(t.length,r.length)}function Nr(n){return La(n)}function La(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(t){const r=On(t);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(t){return er(t).toBase64()}(n.bytesValue):"referenceValue"in n?function(t){return ee.fromName(t).toString()}(n.referenceValue):"geoPointValue"in n?function(t){return`geo(${t.latitude},${t.longitude})`}(n.geoPointValue):"arrayValue"in n?function(t){let r="[",i=!0;for(const s of t.values||[])i?i=!1:r+=",",r+=La(s);return r+"]"}(n.arrayValue):"mapValue"in n?function(t){const r=Object.keys(t.fields||{}).sort();let i="{",s=!0;for(const a of r)s?s=!1:i+=",",i+=`${a}:${La(t.fields[a])}`;return i+"}"}(n.mapValue):ie()}function Fa(n){return!!n&&"integerValue"in n}function Sc(n){return!!n&&"arrayValue"in n}function Fu(n){return!!n&&"nullValue"in n}function Uu(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Ss(n){return!!n&&"mapValue"in n}function Fv(n){var e,t;return((t=(((e=n==null?void 0:n.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||t===void 0?void 0:t.stringValue)==="__vector__"}function vi(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const e={mapValue:{fields:{}}};return Br(n.mapValue.fields,(t,r)=>e.mapValue.fields[t]=vi(r)),e}if(n.arrayValue){const e={arrayValue:{values:[]}};for(let t=0;t<(n.arrayValue.values||[]).length;++t)e.arrayValue.values[t]=vi(n.arrayValue.values[t]);return e}return Object.assign({},n)}function Uv(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _t{constructor(e){this.value=e}static empty(){return new _t({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let t=this.value;for(let r=0;r<e.length-1;++r)if(t=(t.mapValue.fields||{})[e.get(r)],!Ss(t))return null;return t=(t.mapValue.fields||{})[e.lastSegment()],t||null}}set(e,t){this.getFieldsMap(e.popLast())[e.lastSegment()]=vi(t)}setAll(e){let t=ze.emptyPath(),r={},i=[];e.forEach((a,c)=>{if(!t.isImmediateParentOf(c)){const u=this.getFieldsMap(t);this.applyChanges(u,r,i),r={},i=[],t=c.popLast()}a?r[c.lastSegment()]=vi(a):i.push(c.lastSegment())});const s=this.getFieldsMap(t);this.applyChanges(s,r,i)}delete(e){const t=this.field(e.popLast());Ss(t)&&t.mapValue.fields&&delete t.mapValue.fields[e.lastSegment()]}isEqual(e){return Ft(this.value,e.value)}getFieldsMap(e){let t=this.value;t.mapValue.fields||(t.mapValue={fields:{}});for(let r=0;r<e.length;++r){let i=t.mapValue.fields[e.get(r)];Ss(i)&&i.mapValue.fields||(i={mapValue:{fields:{}}},t.mapValue.fields[e.get(r)]=i),t=i}return t.mapValue.fields}applyChanges(e,t,r){Br(t,(i,s)=>e[i]=s);for(const i of r)delete e[i]}clone(){return new _t(vi(this.value))}}function nf(n){const e=[];return Br(n.fields,(t,r)=>{const i=new ze([t]);if(Ss(r)){const s=nf(r.mapValue).fields;if(s.length===0)e.push(i);else for(const a of s)e.push(i.child(a))}else e.push(i)}),new At(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tt{constructor(e,t,r,i,s,a,c){this.key=e,this.documentType=t,this.version=r,this.readTime=i,this.createTime=s,this.data=a,this.documentState=c}static newInvalidDocument(e){return new tt(e,0,se.min(),se.min(),se.min(),_t.empty(),0)}static newFoundDocument(e,t,r,i){return new tt(e,1,t,se.min(),r,i,0)}static newNoDocument(e,t){return new tt(e,2,t,se.min(),se.min(),_t.empty(),0)}static newUnknownDocument(e,t){return new tt(e,3,t,se.min(),se.min(),_t.empty(),2)}convertToFoundDocument(e,t){return!this.createTime.isEqual(se.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=t,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=_t.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=_t.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=se.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof tt&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new tt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class zs{constructor(e,t){this.position=e,this.inclusive=t}}function Bu(n,e,t){let r=0;for(let i=0;i<n.position.length;i++){const s=e[i],a=n.position[i];if(s.field.isKeyField()?r=ee.comparator(ee.fromName(a.referenceValue),t.key):r=Or(a,t.data.field(s.field)),s.dir==="desc"&&(r*=-1),r!==0)break}return r}function ju(n,e){if(n===null)return e===null;if(e===null||n.inclusive!==e.inclusive||n.position.length!==e.position.length)return!1;for(let t=0;t<n.position.length;t++)if(!Ft(n.position[t],e.position[t]))return!1;return!0}/**
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
 */class Ws{constructor(e,t="asc"){this.field=e,this.dir=t}}function Bv(n,e){return n.dir===e.dir&&n.field.isEqual(e.field)}/**
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
 */class rf{}class Me extends rf{constructor(e,t,r){super(),this.field=e,this.op=t,this.value=r}static create(e,t,r){return e.isKeyField()?t==="in"||t==="not-in"?this.createKeyFieldInFilter(e,t,r):new $v(e,t,r):t==="array-contains"?new zv(e,r):t==="in"?new Wv(e,r):t==="not-in"?new Kv(e,r):t==="array-contains-any"?new Gv(e,r):new Me(e,t,r)}static createKeyFieldInFilter(e,t,r){return t==="in"?new qv(e,r):new Hv(e,r)}matches(e){const t=e.data.field(this.field);return this.op==="!="?t!==null&&this.matchesComparison(Or(t,this.value)):t!==null&&tr(this.value)===tr(t)&&this.matchesComparison(Or(t,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return ie()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Ut extends rf{constructor(e,t){super(),this.filters=e,this.op=t,this.ae=null}static create(e,t){return new Ut(e,t)}matches(e){return sf(this)?this.filters.find(t=>!t.matches(e))===void 0:this.filters.find(t=>t.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,t)=>e.concat(t.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function sf(n){return n.op==="and"}function of(n){return jv(n)&&sf(n)}function jv(n){for(const e of n.filters)if(e instanceof Ut)return!1;return!0}function Ua(n){if(n instanceof Me)return n.field.canonicalString()+n.op.toString()+Nr(n.value);if(of(n))return n.filters.map(e=>Ua(e)).join(",");{const e=n.filters.map(t=>Ua(t)).join(",");return`${n.op}(${e})`}}function af(n,e){return n instanceof Me?function(r,i){return i instanceof Me&&r.op===i.op&&r.field.isEqual(i.field)&&Ft(r.value,i.value)}(n,e):n instanceof Ut?function(r,i){return i instanceof Ut&&r.op===i.op&&r.filters.length===i.filters.length?r.filters.reduce((s,a,c)=>s&&af(a,i.filters[c]),!0):!1}(n,e):void ie()}function cf(n){return n instanceof Me?function(t){return`${t.field.canonicalString()} ${t.op} ${Nr(t.value)}`}(n):n instanceof Ut?function(t){return t.op.toString()+" {"+t.getFilters().map(cf).join(" ,")+"}"}(n):"Filter"}class $v extends Me{constructor(e,t,r){super(e,t,r),this.key=ee.fromName(r.referenceValue)}matches(e){const t=ee.comparator(e.key,this.key);return this.matchesComparison(t)}}class qv extends Me{constructor(e,t){super(e,"in",t),this.keys=lf("in",t)}matches(e){return this.keys.some(t=>t.isEqual(e.key))}}class Hv extends Me{constructor(e,t){super(e,"not-in",t),this.keys=lf("not-in",t)}matches(e){return!this.keys.some(t=>t.isEqual(e.key))}}function lf(n,e){var t;return(((t=e.arrayValue)===null||t===void 0?void 0:t.values)||[]).map(r=>ee.fromName(r.referenceValue))}class zv extends Me{constructor(e,t){super(e,"array-contains",t)}matches(e){const t=e.data.field(this.field);return Sc(t)&&Oi(t.arrayValue,this.value)}}class Wv extends Me{constructor(e,t){super(e,"in",t)}matches(e){const t=e.data.field(this.field);return t!==null&&Oi(this.value.arrayValue,t)}}class Kv extends Me{constructor(e,t){super(e,"not-in",t)}matches(e){if(Oi(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const t=e.data.field(this.field);return t!==null&&!Oi(this.value.arrayValue,t)}}class Gv extends Me{constructor(e,t){super(e,"array-contains-any",t)}matches(e){const t=e.data.field(this.field);return!(!Sc(t)||!t.arrayValue.values)&&t.arrayValue.values.some(r=>Oi(this.value.arrayValue,r))}}/**
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
 */class Qv{constructor(e,t=null,r=[],i=[],s=null,a=null,c=null){this.path=e,this.collectionGroup=t,this.orderBy=r,this.filters=i,this.limit=s,this.startAt=a,this.endAt=c,this.ue=null}}function $u(n,e=null,t=[],r=[],i=null,s=null,a=null){return new Qv(n,e,t,r,i,s,a)}function Pc(n){const e=ae(n);if(e.ue===null){let t=e.path.canonicalString();e.collectionGroup!==null&&(t+="|cg:"+e.collectionGroup),t+="|f:",t+=e.filters.map(r=>Ua(r)).join(","),t+="|ob:",t+=e.orderBy.map(r=>function(s){return s.field.canonicalString()+s.dir}(r)).join(","),go(e.limit)||(t+="|l:",t+=e.limit),e.startAt&&(t+="|lb:",t+=e.startAt.inclusive?"b:":"a:",t+=e.startAt.position.map(r=>Nr(r)).join(",")),e.endAt&&(t+="|ub:",t+=e.endAt.inclusive?"a:":"b:",t+=e.endAt.position.map(r=>Nr(r)).join(",")),e.ue=t}return e.ue}function Cc(n,e){if(n.limit!==e.limit||n.orderBy.length!==e.orderBy.length)return!1;for(let t=0;t<n.orderBy.length;t++)if(!Bv(n.orderBy[t],e.orderBy[t]))return!1;if(n.filters.length!==e.filters.length)return!1;for(let t=0;t<n.filters.length;t++)if(!af(n.filters[t],e.filters[t]))return!1;return n.collectionGroup===e.collectionGroup&&!!n.path.isEqual(e.path)&&!!ju(n.startAt,e.startAt)&&ju(n.endAt,e.endAt)}function Ba(n){return ee.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mo{constructor(e,t=null,r=[],i=[],s=null,a="F",c=null,u=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=i,this.limit=s,this.limitType=a,this.startAt=c,this.endAt=u,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function Jv(n,e,t,r,i,s,a,c){return new mo(n,e,t,r,i,s,a,c)}function uf(n){return new mo(n)}function qu(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function Yv(n){return n.collectionGroup!==null}function Ei(n){const e=ae(n);if(e.ce===null){e.ce=[];const t=new Set;for(const s of e.explicitOrderBy)e.ce.push(s),t.add(s.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new We(ze.comparator);return a.filters.forEach(u=>{u.getFlattenedFilters().forEach(d=>{d.isInequality()&&(c=c.add(d.field))})}),c})(e).forEach(s=>{t.has(s.canonicalString())||s.isKeyField()||e.ce.push(new Ws(s,r))}),t.has(ze.keyField().canonicalString())||e.ce.push(new Ws(ze.keyField(),r))}return e.ce}function Ot(n){const e=ae(n);return e.le||(e.le=Xv(e,Ei(n))),e.le}function Xv(n,e){if(n.limitType==="F")return $u(n.path,n.collectionGroup,e,n.filters,n.limit,n.startAt,n.endAt);{e=e.map(i=>{const s=i.dir==="desc"?"asc":"desc";return new Ws(i.field,s)});const t=n.endAt?new zs(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new zs(n.startAt.position,n.startAt.inclusive):null;return $u(n.path,n.collectionGroup,e,n.filters,n.limit,t,r)}}function ja(n,e,t){return new mo(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),e,t,n.startAt,n.endAt)}function _o(n,e){return Cc(Ot(n),Ot(e))&&n.limitType===e.limitType}function hf(n){return`${Pc(Ot(n))}|lt:${n.limitType}`}function gr(n){return`Query(target=${function(t){let r=t.path.canonicalString();return t.collectionGroup!==null&&(r+=" collectionGroup="+t.collectionGroup),t.filters.length>0&&(r+=`, filters: [${t.filters.map(i=>cf(i)).join(", ")}]`),go(t.limit)||(r+=", limit: "+t.limit),t.orderBy.length>0&&(r+=`, orderBy: [${t.orderBy.map(i=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(i)).join(", ")}]`),t.startAt&&(r+=", startAt: ",r+=t.startAt.inclusive?"b:":"a:",r+=t.startAt.position.map(i=>Nr(i)).join(",")),t.endAt&&(r+=", endAt: ",r+=t.endAt.inclusive?"a:":"b:",r+=t.endAt.position.map(i=>Nr(i)).join(",")),`Target(${r})`}(Ot(n))}; limitType=${n.limitType})`}function yo(n,e){return e.isFoundDocument()&&function(r,i){const s=i.key.path;return r.collectionGroup!==null?i.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(s):ee.isDocumentKey(r.path)?r.path.isEqual(s):r.path.isImmediateParentOf(s)}(n,e)&&function(r,i){for(const s of Ei(r))if(!s.field.isKeyField()&&i.data.field(s.field)===null)return!1;return!0}(n,e)&&function(r,i){for(const s of r.filters)if(!s.matches(i))return!1;return!0}(n,e)&&function(r,i){return!(r.startAt&&!function(a,c,u){const d=Bu(a,c,u);return a.inclusive?d<=0:d<0}(r.startAt,Ei(r),i)||r.endAt&&!function(a,c,u){const d=Bu(a,c,u);return a.inclusive?d>=0:d>0}(r.endAt,Ei(r),i))}(n,e)}function Zv(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function df(n){return(e,t)=>{let r=!1;for(const i of Ei(n)){const s=eE(i,e,t);if(s!==0)return s;r=r||i.field.isKeyField()}return 0}}function eE(n,e,t){const r=n.field.isKeyField()?ee.comparator(e.key,t.key):function(s,a,c){const u=a.data.field(s),d=c.data.field(s);return u!==null&&d!==null?Or(u,d):ie()}(n.field,e,t);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return ie()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jr{constructor(e,t){this.mapKeyFn=e,this.equalsFn=t,this.inner={},this.innerSize=0}get(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r!==void 0){for(const[i,s]of r)if(this.equalsFn(i,e))return s}}has(e){return this.get(e)!==void 0}set(e,t){const r=this.mapKeyFn(e),i=this.inner[r];if(i===void 0)return this.inner[r]=[[e,t]],void this.innerSize++;for(let s=0;s<i.length;s++)if(this.equalsFn(i[s][0],e))return void(i[s]=[e,t]);i.push([e,t]),this.innerSize++}delete(e){const t=this.mapKeyFn(e),r=this.inner[t];if(r===void 0)return!1;for(let i=0;i<r.length;i++)if(this.equalsFn(r[i][0],e))return r.length===1?delete this.inner[t]:r.splice(i,1),this.innerSize--,!0;return!1}forEach(e){Br(this.inner,(t,r)=>{for(const[i,s]of r)e(i,s)})}isEmpty(){return ef(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tE=new Se(ee.comparator);function tn(){return tE}const ff=new Se(ee.comparator);function ui(...n){let e=ff;for(const t of n)e=e.insert(t.key,t);return e}function pf(n){let e=ff;return n.forEach((t,r)=>e=e.insert(t,r.overlayedDocument)),e}function Qn(){return Ti()}function gf(){return Ti()}function Ti(){return new jr(n=>n.toString(),(n,e)=>n.isEqual(e))}const nE=new Se(ee.comparator),rE=new We(ee.comparator);function ue(...n){let e=rE;for(const t of n)e=e.add(t);return e}const iE=new We(me);function sE(){return iE}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kc(n,e){if(n.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Hs(e)?"-0":e}}function mf(n){return{integerValue:""+n}}function oE(n,e){return xv(e)?mf(e):kc(n,e)}/**
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
 */class vo{constructor(){this._=void 0}}function aE(n,e,t){return n instanceof Ks?function(i,s){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:i.seconds,nanos:i.nanoseconds}}}};return s&&bc(s)&&(s=Rc(s)),s&&(a.fields.__previous_value__=s),{mapValue:a}}(t,e):n instanceof Ni?yf(n,e):n instanceof xi?vf(n,e):function(i,s){const a=_f(i,s),c=Hu(a)+Hu(i.Pe);return Fa(a)&&Fa(i.Pe)?mf(c):kc(i.serializer,c)}(n,e)}function cE(n,e,t){return n instanceof Ni?yf(n,e):n instanceof xi?vf(n,e):t}function _f(n,e){return n instanceof Gs?function(r){return Fa(r)||function(s){return!!s&&"doubleValue"in s}(r)}(e)?e:{integerValue:0}:null}class Ks extends vo{}class Ni extends vo{constructor(e){super(),this.elements=e}}function yf(n,e){const t=Ef(e);for(const r of n.elements)t.some(i=>Ft(i,r))||t.push(r);return{arrayValue:{values:t}}}class xi extends vo{constructor(e){super(),this.elements=e}}function vf(n,e){let t=Ef(e);for(const r of n.elements)t=t.filter(i=>!Ft(i,r));return{arrayValue:{values:t}}}class Gs extends vo{constructor(e,t){super(),this.serializer=e,this.Pe=t}}function Hu(n){return Ce(n.integerValue||n.doubleValue)}function Ef(n){return Sc(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}function lE(n,e){return n.field.isEqual(e.field)&&function(r,i){return r instanceof Ni&&i instanceof Ni||r instanceof xi&&i instanceof xi?Vr(r.elements,i.elements,Ft):r instanceof Gs&&i instanceof Gs?Ft(r.Pe,i.Pe):r instanceof Ks&&i instanceof Ks}(n.transform,e.transform)}class uE{constructor(e,t){this.version=e,this.transformResults=t}}class Jt{constructor(e,t){this.updateTime=e,this.exists=t}static none(){return new Jt}static exists(e){return new Jt(void 0,e)}static updateTime(e){return new Jt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Ps(n,e){return n.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(n.updateTime):n.exists===void 0||n.exists===e.isFoundDocument()}class Eo{}function Tf(n,e){if(!n.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return n.isNoDocument()?new wf(n.key,Jt.none()):new Hi(n.key,n.data,Jt.none());{const t=n.data,r=_t.empty();let i=new We(ze.comparator);for(let s of e.fields)if(!i.has(s)){let a=t.field(s);a===null&&s.length>1&&(s=s.popLast(),a=t.field(s)),a===null?r.delete(s):r.set(s,a),i=i.add(s)}return new ir(n.key,r,new At(i.toArray()),Jt.none())}}function hE(n,e,t){n instanceof Hi?function(i,s,a){const c=i.value.clone(),u=Wu(i.fieldTransforms,s,a.transformResults);c.setAll(u),s.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(n,e,t):n instanceof ir?function(i,s,a){if(!Ps(i.precondition,s))return void s.convertToUnknownDocument(a.version);const c=Wu(i.fieldTransforms,s,a.transformResults),u=s.data;u.setAll(If(i)),u.setAll(c),s.convertToFoundDocument(a.version,u).setHasCommittedMutations()}(n,e,t):function(i,s,a){s.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,t)}function Ii(n,e,t,r){return n instanceof Hi?function(s,a,c,u){if(!Ps(s.precondition,a))return c;const d=s.value.clone(),f=Ku(s.fieldTransforms,u,a);return d.setAll(f),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(n,e,t,r):n instanceof ir?function(s,a,c,u){if(!Ps(s.precondition,a))return c;const d=Ku(s.fieldTransforms,u,a),f=a.data;return f.setAll(If(s)),f.setAll(d),a.convertToFoundDocument(a.version,f).setHasLocalMutations(),c===null?null:c.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(g=>g.field))}(n,e,t,r):function(s,a,c){return Ps(s.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c}(n,e,t)}function dE(n,e){let t=null;for(const r of n.fieldTransforms){const i=e.data.field(r.field),s=_f(r.transform,i||null);s!=null&&(t===null&&(t=_t.empty()),t.set(r.field,s))}return t||null}function zu(n,e){return n.type===e.type&&!!n.key.isEqual(e.key)&&!!n.precondition.isEqual(e.precondition)&&!!function(r,i){return r===void 0&&i===void 0||!(!r||!i)&&Vr(r,i,(s,a)=>lE(s,a))}(n.fieldTransforms,e.fieldTransforms)&&(n.type===0?n.value.isEqual(e.value):n.type!==1||n.data.isEqual(e.data)&&n.fieldMask.isEqual(e.fieldMask))}class Hi extends Eo{constructor(e,t,r,i=[]){super(),this.key=e,this.value=t,this.precondition=r,this.fieldTransforms=i,this.type=0}getFieldMask(){return null}}class ir extends Eo{constructor(e,t,r,i,s=[]){super(),this.key=e,this.data=t,this.fieldMask=r,this.precondition=i,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}}function If(n){const e=new Map;return n.fieldMask.fields.forEach(t=>{if(!t.isEmpty()){const r=n.data.field(t);e.set(t,r)}}),e}function Wu(n,e,t){const r=new Map;Ee(n.length===t.length);for(let i=0;i<t.length;i++){const s=n[i],a=s.transform,c=e.data.field(s.field);r.set(s.field,cE(a,c,t[i]))}return r}function Ku(n,e,t){const r=new Map;for(const i of n){const s=i.transform,a=t.data.field(i.field);r.set(i.field,aE(s,a,e))}return r}class wf extends Eo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class fE extends Eo{constructor(e,t){super(),this.key=e,this.precondition=t,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pE{constructor(e,t,r,i){this.batchId=e,this.localWriteTime=t,this.baseMutations=r,this.mutations=i}applyToRemoteDocument(e,t){const r=t.mutationResults;for(let i=0;i<this.mutations.length;i++){const s=this.mutations[i];s.key.isEqual(e.key)&&hE(s,e,r[i])}}applyToLocalView(e,t){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(t=Ii(r,e,t,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(t=Ii(r,e,t,this.localWriteTime));return t}applyToLocalDocumentSet(e,t){const r=gf();return this.mutations.forEach(i=>{const s=e.get(i.key),a=s.overlayedDocument;let c=this.applyToLocalView(a,s.mutatedFields);c=t.has(i.key)?null:c;const u=Tf(a,c);u!==null&&r.set(i.key,u),a.isValidDocument()||a.convertToNoDocument(se.min())}),r}keys(){return this.mutations.reduce((e,t)=>e.add(t.key),ue())}isEqual(e){return this.batchId===e.batchId&&Vr(this.mutations,e.mutations,(t,r)=>zu(t,r))&&Vr(this.baseMutations,e.baseMutations,(t,r)=>zu(t,r))}}class Dc{constructor(e,t,r,i){this.batch=e,this.commitVersion=t,this.mutationResults=r,this.docVersions=i}static from(e,t,r){Ee(e.mutations.length===r.length);let i=function(){return nE}();const s=e.mutations;for(let a=0;a<s.length;a++)i=i.insert(s[a].key,r[a].version);return new Dc(e,t,r,i)}}/**
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
 */class gE{constructor(e,t){this.largestBatchId=e,this.mutation=t}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class mE{constructor(e,t){this.count=e,this.unchangedNames=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ke,fe;function _E(n){switch(n){default:return ie();case M.CANCELLED:case M.UNKNOWN:case M.DEADLINE_EXCEEDED:case M.RESOURCE_EXHAUSTED:case M.INTERNAL:case M.UNAVAILABLE:case M.UNAUTHENTICATED:return!1;case M.INVALID_ARGUMENT:case M.NOT_FOUND:case M.ALREADY_EXISTS:case M.PERMISSION_DENIED:case M.FAILED_PRECONDITION:case M.ABORTED:case M.OUT_OF_RANGE:case M.UNIMPLEMENTED:case M.DATA_LOSS:return!0}}function Af(n){if(n===void 0)return en("GRPC error has no .code"),M.UNKNOWN;switch(n){case ke.OK:return M.OK;case ke.CANCELLED:return M.CANCELLED;case ke.UNKNOWN:return M.UNKNOWN;case ke.DEADLINE_EXCEEDED:return M.DEADLINE_EXCEEDED;case ke.RESOURCE_EXHAUSTED:return M.RESOURCE_EXHAUSTED;case ke.INTERNAL:return M.INTERNAL;case ke.UNAVAILABLE:return M.UNAVAILABLE;case ke.UNAUTHENTICATED:return M.UNAUTHENTICATED;case ke.INVALID_ARGUMENT:return M.INVALID_ARGUMENT;case ke.NOT_FOUND:return M.NOT_FOUND;case ke.ALREADY_EXISTS:return M.ALREADY_EXISTS;case ke.PERMISSION_DENIED:return M.PERMISSION_DENIED;case ke.FAILED_PRECONDITION:return M.FAILED_PRECONDITION;case ke.ABORTED:return M.ABORTED;case ke.OUT_OF_RANGE:return M.OUT_OF_RANGE;case ke.UNIMPLEMENTED:return M.UNIMPLEMENTED;case ke.DATA_LOSS:return M.DATA_LOSS;default:return ie()}}(fe=ke||(ke={}))[fe.OK=0]="OK",fe[fe.CANCELLED=1]="CANCELLED",fe[fe.UNKNOWN=2]="UNKNOWN",fe[fe.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",fe[fe.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",fe[fe.NOT_FOUND=5]="NOT_FOUND",fe[fe.ALREADY_EXISTS=6]="ALREADY_EXISTS",fe[fe.PERMISSION_DENIED=7]="PERMISSION_DENIED",fe[fe.UNAUTHENTICATED=16]="UNAUTHENTICATED",fe[fe.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",fe[fe.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",fe[fe.ABORTED=10]="ABORTED",fe[fe.OUT_OF_RANGE=11]="OUT_OF_RANGE",fe[fe.UNIMPLEMENTED=12]="UNIMPLEMENTED",fe[fe.INTERNAL=13]="INTERNAL",fe[fe.UNAVAILABLE=14]="UNAVAILABLE",fe[fe.DATA_LOSS=15]="DATA_LOSS";/**
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
 */function yE(){return new TextEncoder}/**
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
 */const vE=new Yn([4294967295,4294967295],0);function Gu(n){const e=yE().encode(n),t=new Wd;return t.update(e),new Uint8Array(t.digest())}function Qu(n){const e=new DataView(n.buffer),t=e.getUint32(0,!0),r=e.getUint32(4,!0),i=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new Yn([t,r],0),new Yn([i,s],0)]}class Vc{constructor(e,t,r){if(this.bitmap=e,this.padding=t,this.hashCount=r,t<0||t>=8)throw new hi(`Invalid padding: ${t}`);if(r<0)throw new hi(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new hi(`Invalid hash count: ${r}`);if(e.length===0&&t!==0)throw new hi(`Invalid padding when bitmap length is 0: ${t}`);this.Ie=8*e.length-t,this.Te=Yn.fromNumber(this.Ie)}Ee(e,t,r){let i=e.add(t.multiply(Yn.fromNumber(r)));return i.compare(vE)===1&&(i=new Yn([i.getBits(0),i.getBits(1)],0)),i.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const t=Gu(e),[r,i]=Qu(t);for(let s=0;s<this.hashCount;s++){const a=this.Ee(r,i,s);if(!this.de(a))return!1}return!0}static create(e,t,r){const i=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),a=new Vc(s,i,t);return r.forEach(c=>a.insert(c)),a}insert(e){if(this.Ie===0)return;const t=Gu(e),[r,i]=Qu(t);for(let s=0;s<this.hashCount;s++){const a=this.Ee(r,i,s);this.Ae(a)}}Ae(e){const t=Math.floor(e/8),r=e%8;this.bitmap[t]|=1<<r}}class hi extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class To{constructor(e,t,r,i,s){this.snapshotVersion=e,this.targetChanges=t,this.targetMismatches=r,this.documentUpdates=i,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,t,r){const i=new Map;return i.set(e,zi.createSynthesizedTargetChangeForCurrentChange(e,t,r)),new To(se.min(),i,new Se(me),tn(),ue())}}class zi{constructor(e,t,r,i,s){this.resumeToken=e,this.current=t,this.addedDocuments=r,this.modifiedDocuments=i,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,t,r){return new zi(r,t,ue(),ue(),ue())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Cs{constructor(e,t,r,i){this.Re=e,this.removedTargetIds=t,this.key=r,this.Ve=i}}class bf{constructor(e,t){this.targetId=e,this.me=t}}class Rf{constructor(e,t,r=Ge.EMPTY_BYTE_STRING,i=null){this.state=e,this.targetIds=t,this.resumeToken=r,this.cause=i}}class Ju{constructor(){this.fe=0,this.ge=Xu(),this.pe=Ge.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=ue(),t=ue(),r=ue();return this.ge.forEach((i,s)=>{switch(s){case 0:e=e.add(i);break;case 2:t=t.add(i);break;case 1:r=r.add(i);break;default:ie()}}),new zi(this.pe,this.ye,e,t,r)}Ce(){this.we=!1,this.ge=Xu()}Fe(e,t){this.we=!0,this.ge=this.ge.insert(e,t)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,Ee(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class EE{constructor(e){this.Le=e,this.Be=new Map,this.ke=tn(),this.qe=Yu(),this.Qe=new Se(me)}Ke(e){for(const t of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(t,e.Ve):this.Ue(t,e.key,e.Ve);for(const t of e.removedTargetIds)this.Ue(t,e.key,e.Ve)}We(e){this.forEachTarget(e,t=>{const r=this.Ge(t);switch(e.state){case 0:this.ze(t)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(t);break;case 3:this.ze(t)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(t)&&(this.je(t),r.De(e.resumeToken));break;default:ie()}})}forEachTarget(e,t){e.targetIds.length>0?e.targetIds.forEach(t):this.Be.forEach((r,i)=>{this.ze(i)&&t(i)})}He(e){const t=e.targetId,r=e.me.count,i=this.Je(t);if(i){const s=i.target;if(Ba(s))if(r===0){const a=new ee(s.path);this.Ue(t,a,tt.newNoDocument(a,se.min()))}else Ee(r===1);else{const a=this.Ye(t);if(a!==r){const c=this.Ze(e),u=c?this.Xe(c,e,a):1;if(u!==0){this.je(t);const d=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(t,d)}}}}}Ze(e){const t=e.me.unchangedNames;if(!t||!t.bits)return null;const{bits:{bitmap:r="",padding:i=0},hashCount:s=0}=t;let a,c;try{a=er(r).toUint8Array()}catch(u){if(u instanceof tf)return Dr("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{c=new Vc(a,i,s)}catch(u){return Dr(u instanceof hi?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return c.Ie===0?null:c}Xe(e,t,r){return t.me.count===r-this.nt(e,t.targetId)?0:2}nt(e,t){const r=this.Le.getRemoteKeysForTarget(t);let i=0;return r.forEach(s=>{const a=this.Le.tt(),c=`projects/${a.projectId}/databases/${a.database}/documents/${s.path.canonicalString()}`;e.mightContain(c)||(this.Ue(t,s,null),i++)}),i}rt(e){const t=new Map;this.Be.forEach((s,a)=>{const c=this.Je(a);if(c){if(s.current&&Ba(c.target)){const u=new ee(c.target.path);this.ke.get(u)!==null||this.it(a,u)||this.Ue(a,u,tt.newNoDocument(u,e))}s.be&&(t.set(a,s.ve()),s.Ce())}});let r=ue();this.qe.forEach((s,a)=>{let c=!0;a.forEachWhile(u=>{const d=this.Je(u);return!d||d.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(r=r.add(s))}),this.ke.forEach((s,a)=>a.setReadTime(e));const i=new To(e,t,this.Qe,this.ke,r);return this.ke=tn(),this.qe=Yu(),this.Qe=new Se(me),i}$e(e,t){if(!this.ze(e))return;const r=this.it(e,t.key)?2:0;this.Ge(e).Fe(t.key,r),this.ke=this.ke.insert(t.key,t),this.qe=this.qe.insert(t.key,this.st(t.key).add(e))}Ue(e,t,r){if(!this.ze(e))return;const i=this.Ge(e);this.it(e,t)?i.Fe(t,1):i.Me(t),this.qe=this.qe.insert(t,this.st(t).delete(e)),r&&(this.ke=this.ke.insert(t,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const t=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+t.addedDocuments.size-t.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let t=this.Be.get(e);return t||(t=new Ju,this.Be.set(e,t)),t}st(e){let t=this.qe.get(e);return t||(t=new We(me),this.qe=this.qe.insert(e,t)),t}ze(e){const t=this.Je(e)!==null;return t||G("WatchChangeAggregator","Detected inactive target",e),t}Je(e){const t=this.Be.get(e);return t&&t.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new Ju),this.Le.getRemoteKeysForTarget(e).forEach(t=>{this.Ue(e,t,null)})}it(e,t){return this.Le.getRemoteKeysForTarget(e).has(t)}}function Yu(){return new Se(ee.comparator)}function Xu(){return new Se(ee.comparator)}const TE=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),IE=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),wE=(()=>({and:"AND",or:"OR"}))();class AE{constructor(e,t){this.databaseId=e,this.useProto3Json=t}}function $a(n,e){return n.useProto3Json||go(e)?e:{value:e}}function Qs(n,e){return n.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Sf(n,e){return n.useProto3Json?e.toBase64():e.toUint8Array()}function bE(n,e){return Qs(n,e.toTimestamp())}function Nt(n){return Ee(!!n),se.fromTimestamp(function(t){const r=On(t);return new Le(r.seconds,r.nanos)}(n))}function Oc(n,e){return qa(n,e).canonicalString()}function qa(n,e){const t=function(i){return new be(["projects",i.projectId,"databases",i.database])}(n).child("documents");return e===void 0?t:t.child(e)}function Pf(n){const e=be.fromString(n);return Ee(Of(e)),e}function Ha(n,e){return Oc(n.databaseId,e.path)}function pa(n,e){const t=Pf(e);if(t.get(1)!==n.databaseId.projectId)throw new Z(M.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+t.get(1)+" vs "+n.databaseId.projectId);if(t.get(3)!==n.databaseId.database)throw new Z(M.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+t.get(3)+" vs "+n.databaseId.database);return new ee(kf(t))}function Cf(n,e){return Oc(n.databaseId,e)}function RE(n){const e=Pf(n);return e.length===4?be.emptyPath():kf(e)}function za(n){return new be(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function kf(n){return Ee(n.length>4&&n.get(4)==="documents"),n.popFirst(5)}function Zu(n,e,t){return{name:Ha(n,e),fields:t.value.mapValue.fields}}function SE(n,e){let t;if("targetChange"in e){e.targetChange;const r=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:ie()}(e.targetChange.targetChangeType||"NO_CHANGE"),i=e.targetChange.targetIds||[],s=function(d,f){return d.useProto3Json?(Ee(f===void 0||typeof f=="string"),Ge.fromBase64String(f||"")):(Ee(f===void 0||f instanceof Buffer||f instanceof Uint8Array),Ge.fromUint8Array(f||new Uint8Array))}(n,e.targetChange.resumeToken),a=e.targetChange.cause,c=a&&function(d){const f=d.code===void 0?M.UNKNOWN:Af(d.code);return new Z(f,d.message||"")}(a);t=new Rf(r,i,s,c||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const i=pa(n,r.document.name),s=Nt(r.document.updateTime),a=r.document.createTime?Nt(r.document.createTime):se.min(),c=new _t({mapValue:{fields:r.document.fields}}),u=tt.newFoundDocument(i,s,a,c),d=r.targetIds||[],f=r.removedTargetIds||[];t=new Cs(d,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const i=pa(n,r.document),s=r.readTime?Nt(r.readTime):se.min(),a=tt.newNoDocument(i,s),c=r.removedTargetIds||[];t=new Cs([],c,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const i=pa(n,r.document),s=r.removedTargetIds||[];t=new Cs([],s,i,null)}else{if(!("filter"in e))return ie();{e.filter;const r=e.filter;r.targetId;const{count:i=0,unchangedNames:s}=r,a=new mE(i,s),c=r.targetId;t=new bf(c,a)}}return t}function PE(n,e){let t;if(e instanceof Hi)t={update:Zu(n,e.key,e.value)};else if(e instanceof wf)t={delete:Ha(n,e.key)};else if(e instanceof ir)t={update:Zu(n,e.key,e.data),updateMask:LE(e.fieldMask)};else{if(!(e instanceof fE))return ie();t={verify:Ha(n,e.key)}}return e.fieldTransforms.length>0&&(t.updateTransforms=e.fieldTransforms.map(r=>function(s,a){const c=a.transform;if(c instanceof Ks)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof Ni)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof xi)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof Gs)return{fieldPath:a.field.canonicalString(),increment:c.Pe};throw ie()}(0,r))),e.precondition.isNone||(t.currentDocument=function(i,s){return s.updateTime!==void 0?{updateTime:bE(i,s.updateTime)}:s.exists!==void 0?{exists:s.exists}:ie()}(n,e.precondition)),t}function CE(n,e){return n&&n.length>0?(Ee(e!==void 0),n.map(t=>function(i,s){let a=i.updateTime?Nt(i.updateTime):Nt(s);return a.isEqual(se.min())&&(a=Nt(s)),new uE(a,i.transformResults||[])}(t,e))):[]}function kE(n,e){return{documents:[Cf(n,e.path)]}}function DE(n,e){const t={structuredQuery:{}},r=e.path;let i;e.collectionGroup!==null?(i=r,t.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(i=r.popLast(),t.structuredQuery.from=[{collectionId:r.lastSegment()}]),t.parent=Cf(n,i);const s=function(d){if(d.length!==0)return Vf(Ut.create(d,"and"))}(e.filters);s&&(t.structuredQuery.where=s);const a=function(d){if(d.length!==0)return d.map(f=>function(I){return{field:mr(I.field),direction:NE(I.dir)}}(f))}(e.orderBy);a&&(t.structuredQuery.orderBy=a);const c=$a(n,e.limit);return c!==null&&(t.structuredQuery.limit=c),e.startAt&&(t.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(e.startAt)),e.endAt&&(t.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(e.endAt)),{_t:t,parent:i}}function VE(n){let e=RE(n.parent);const t=n.structuredQuery,r=t.from?t.from.length:0;let i=null;if(r>0){Ee(r===1);const f=t.from[0];f.allDescendants?i=f.collectionId:e=e.child(f.collectionId)}let s=[];t.where&&(s=function(g){const I=Df(g);return I instanceof Ut&&of(I)?I.getFilters():[I]}(t.where));let a=[];t.orderBy&&(a=function(g){return g.map(I=>function(V){return new Ws(_r(V.field),function(B){switch(B){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(V.direction))}(I))}(t.orderBy));let c=null;t.limit&&(c=function(g){let I;return I=typeof g=="object"?g.value:g,go(I)?null:I}(t.limit));let u=null;t.startAt&&(u=function(g){const I=!!g.before,S=g.values||[];return new zs(S,I)}(t.startAt));let d=null;return t.endAt&&(d=function(g){const I=!g.before,S=g.values||[];return new zs(S,I)}(t.endAt)),Jv(e,i,a,s,c,"F",u,d)}function OE(n,e){const t=function(i){switch(i){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return ie()}}(e.purpose);return t==null?null:{"goog-listen-tags":t}}function Df(n){return n.unaryFilter!==void 0?function(t){switch(t.unaryFilter.op){case"IS_NAN":const r=_r(t.unaryFilter.field);return Me.create(r,"==",{doubleValue:NaN});case"IS_NULL":const i=_r(t.unaryFilter.field);return Me.create(i,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const s=_r(t.unaryFilter.field);return Me.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=_r(t.unaryFilter.field);return Me.create(a,"!=",{nullValue:"NULL_VALUE"});default:return ie()}}(n):n.fieldFilter!==void 0?function(t){return Me.create(_r(t.fieldFilter.field),function(i){switch(i){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return ie()}}(t.fieldFilter.op),t.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(t){return Ut.create(t.compositeFilter.filters.map(r=>Df(r)),function(i){switch(i){case"AND":return"and";case"OR":return"or";default:return ie()}}(t.compositeFilter.op))}(n):ie()}function NE(n){return TE[n]}function xE(n){return IE[n]}function ME(n){return wE[n]}function mr(n){return{fieldPath:n.canonicalString()}}function _r(n){return ze.fromServerFormat(n.fieldPath)}function Vf(n){return n instanceof Me?function(t){if(t.op==="=="){if(Uu(t.value))return{unaryFilter:{field:mr(t.field),op:"IS_NAN"}};if(Fu(t.value))return{unaryFilter:{field:mr(t.field),op:"IS_NULL"}}}else if(t.op==="!="){if(Uu(t.value))return{unaryFilter:{field:mr(t.field),op:"IS_NOT_NAN"}};if(Fu(t.value))return{unaryFilter:{field:mr(t.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:mr(t.field),op:xE(t.op),value:t.value}}}(n):n instanceof Ut?function(t){const r=t.getFilters().map(i=>Vf(i));return r.length===1?r[0]:{compositeFilter:{op:ME(t.op),filters:r}}}(n):ie()}function LE(n){const e=[];return n.fields.forEach(t=>e.push(t.canonicalString())),{fieldPaths:e}}function Of(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tn{constructor(e,t,r,i,s=se.min(),a=se.min(),c=Ge.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=t,this.purpose=r,this.sequenceNumber=i,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=c,this.expectedCount=u}withSequenceNumber(e){return new Tn(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,t){return new Tn(this.target,this.targetId,this.purpose,this.sequenceNumber,t,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new Tn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new Tn(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class FE{constructor(e){this.ct=e}}function UE(n){const e=VE({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?ja(e,e.limit,"L"):e}/**
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
 */class BE{constructor(){this.un=new jE}addToCollectionParentIndex(e,t){return this.un.add(t),N.resolve()}getCollectionParents(e,t){return N.resolve(this.un.getEntries(t))}addFieldIndex(e,t){return N.resolve()}deleteFieldIndex(e,t){return N.resolve()}deleteAllFieldIndexes(e){return N.resolve()}createTargetIndexes(e,t){return N.resolve()}getDocumentsMatchingTarget(e,t){return N.resolve(null)}getIndexType(e,t){return N.resolve(0)}getFieldIndexes(e,t){return N.resolve([])}getNextCollectionGroupToUpdate(e){return N.resolve(null)}getMinOffset(e,t){return N.resolve(Vn.min())}getMinOffsetFromCollectionGroup(e,t){return N.resolve(Vn.min())}updateCollectionGroup(e,t,r){return N.resolve()}updateIndexEntries(e,t){return N.resolve()}}class jE{constructor(){this.index={}}add(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t]||new We(be.comparator),s=!i.has(r);return this.index[t]=i.add(r),s}has(e){const t=e.lastSegment(),r=e.popLast(),i=this.index[t];return i&&i.has(r)}getEntries(e){return(this.index[e]||new We(be.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xr{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new xr(0)}static kn(){return new xr(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $E{constructor(){this.changes=new jr(e=>e.toString(),(e,t)=>e.isEqual(t)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,t){this.assertNotApplied(),this.changes.set(e,tt.newInvalidDocument(e).setReadTime(t))}getEntry(e,t){this.assertNotApplied();const r=this.changes.get(t);return r!==void 0?N.resolve(r):this.getFromCache(e,t)}getEntries(e,t){return this.getAllFromCache(e,t)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class qE{constructor(e,t){this.overlayedDocument=e,this.mutatedFields=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class HE{constructor(e,t,r,i){this.remoteDocumentCache=e,this.mutationQueue=t,this.documentOverlayCache=r,this.indexManager=i}getDocument(e,t){let r=null;return this.documentOverlayCache.getOverlay(e,t).next(i=>(r=i,this.remoteDocumentCache.getEntry(e,t))).next(i=>(r!==null&&Ii(r.mutation,i,At.empty(),Le.now()),i))}getDocuments(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.getLocalViewOfDocuments(e,r,ue()).next(()=>r))}getLocalViewOfDocuments(e,t,r=ue()){const i=Qn();return this.populateOverlays(e,i,t).next(()=>this.computeViews(e,t,i,r).next(s=>{let a=ui();return s.forEach((c,u)=>{a=a.insert(c,u.overlayedDocument)}),a}))}getOverlayedDocuments(e,t){const r=Qn();return this.populateOverlays(e,r,t).next(()=>this.computeViews(e,t,r,ue()))}populateOverlays(e,t,r){const i=[];return r.forEach(s=>{t.has(s)||i.push(s)}),this.documentOverlayCache.getOverlays(e,i).next(s=>{s.forEach((a,c)=>{t.set(a,c)})})}computeViews(e,t,r,i){let s=tn();const a=Ti(),c=function(){return Ti()}();return t.forEach((u,d)=>{const f=r.get(d.key);i.has(d.key)&&(f===void 0||f.mutation instanceof ir)?s=s.insert(d.key,d):f!==void 0?(a.set(d.key,f.mutation.getFieldMask()),Ii(f.mutation,d,f.mutation.getFieldMask(),Le.now())):a.set(d.key,At.empty())}),this.recalculateAndSaveOverlays(e,s).next(u=>(u.forEach((d,f)=>a.set(d,f)),t.forEach((d,f)=>{var g;return c.set(d,new qE(f,(g=a.get(d))!==null&&g!==void 0?g:null))}),c))}recalculateAndSaveOverlays(e,t){const r=Ti();let i=new Se((a,c)=>a-c),s=ue();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,t).next(a=>{for(const c of a)c.keys().forEach(u=>{const d=t.get(u);if(d===null)return;let f=r.get(u)||At.empty();f=c.applyToLocalView(d,f),r.set(u,f);const g=(i.get(c.batchId)||ue()).add(u);i=i.insert(c.batchId,g)})}).next(()=>{const a=[],c=i.getReverseIterator();for(;c.hasNext();){const u=c.getNext(),d=u.key,f=u.value,g=gf();f.forEach(I=>{if(!s.has(I)){const S=Tf(t.get(I),r.get(I));S!==null&&g.set(I,S),s=s.add(I)}}),a.push(this.documentOverlayCache.saveOverlays(e,d,g))}return N.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,t){return this.remoteDocumentCache.getEntries(e,t).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,t,r,i){return function(a){return ee.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(t)?this.getDocumentsMatchingDocumentQuery(e,t.path):Yv(t)?this.getDocumentsMatchingCollectionGroupQuery(e,t,r,i):this.getDocumentsMatchingCollectionQuery(e,t,r,i)}getNextDocuments(e,t,r,i){return this.remoteDocumentCache.getAllFromCollectionGroup(e,t,r,i).next(s=>{const a=i-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,t,r.largestBatchId,i-s.size):N.resolve(Qn());let c=-1,u=s;return a.next(d=>N.forEach(d,(f,g)=>(c<g.largestBatchId&&(c=g.largestBatchId),s.get(f)?N.resolve():this.remoteDocumentCache.getEntry(e,f).next(I=>{u=u.insert(f,I)}))).next(()=>this.populateOverlays(e,d,s)).next(()=>this.computeViews(e,u,d,ue())).next(f=>({batchId:c,changes:pf(f)})))})}getDocumentsMatchingDocumentQuery(e,t){return this.getDocument(e,new ee(t)).next(r=>{let i=ui();return r.isFoundDocument()&&(i=i.insert(r.key,r)),i})}getDocumentsMatchingCollectionGroupQuery(e,t,r,i){const s=t.collectionGroup;let a=ui();return this.indexManager.getCollectionParents(e,s).next(c=>N.forEach(c,u=>{const d=function(g,I){return new mo(I,null,g.explicitOrderBy.slice(),g.filters.slice(),g.limit,g.limitType,g.startAt,g.endAt)}(t,u.child(s));return this.getDocumentsMatchingCollectionQuery(e,d,r,i).next(f=>{f.forEach((g,I)=>{a=a.insert(g,I)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,t,r,i){let s;return this.documentOverlayCache.getOverlaysForCollection(e,t.path,r.largestBatchId).next(a=>(s=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,t,r,s,i))).next(a=>{s.forEach((u,d)=>{const f=d.getKey();a.get(f)===null&&(a=a.insert(f,tt.newInvalidDocument(f)))});let c=ui();return a.forEach((u,d)=>{const f=s.get(u);f!==void 0&&Ii(f.mutation,d,At.empty(),Le.now()),yo(t,d)&&(c=c.insert(u,d))}),c})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zE{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,t){return N.resolve(this.hr.get(t))}saveBundleMetadata(e,t){return this.hr.set(t.id,function(i){return{id:i.id,version:i.version,createTime:Nt(i.createTime)}}(t)),N.resolve()}getNamedQuery(e,t){return N.resolve(this.Pr.get(t))}saveNamedQuery(e,t){return this.Pr.set(t.name,function(i){return{name:i.name,query:UE(i.bundledQuery),readTime:Nt(i.readTime)}}(t)),N.resolve()}}/**
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
 */class WE{constructor(){this.overlays=new Se(ee.comparator),this.Ir=new Map}getOverlay(e,t){return N.resolve(this.overlays.get(t))}getOverlays(e,t){const r=Qn();return N.forEach(t,i=>this.getOverlay(e,i).next(s=>{s!==null&&r.set(i,s)})).next(()=>r)}saveOverlays(e,t,r){return r.forEach((i,s)=>{this.ht(e,t,s)}),N.resolve()}removeOverlaysForBatchId(e,t,r){const i=this.Ir.get(r);return i!==void 0&&(i.forEach(s=>this.overlays=this.overlays.remove(s)),this.Ir.delete(r)),N.resolve()}getOverlaysForCollection(e,t,r){const i=Qn(),s=t.length+1,a=new ee(t.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const u=c.getNext().value,d=u.getKey();if(!t.isPrefixOf(d.path))break;d.path.length===s&&u.largestBatchId>r&&i.set(u.getKey(),u)}return N.resolve(i)}getOverlaysForCollectionGroup(e,t,r,i){let s=new Se((d,f)=>d-f);const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===t&&d.largestBatchId>r){let f=s.get(d.largestBatchId);f===null&&(f=Qn(),s=s.insert(d.largestBatchId,f)),f.set(d.getKey(),d)}}const c=Qn(),u=s.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((d,f)=>c.set(d,f)),!(c.size()>=i)););return N.resolve(c)}ht(e,t,r){const i=this.overlays.get(r.key);if(i!==null){const a=this.Ir.get(i.largestBatchId).delete(r.key);this.Ir.set(i.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new gE(t,r));let s=this.Ir.get(t);s===void 0&&(s=ue(),this.Ir.set(t,s)),this.Ir.set(t,s.add(r.key))}}/**
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
 */class KE{constructor(){this.sessionToken=Ge.EMPTY_BYTE_STRING}getSessionToken(e){return N.resolve(this.sessionToken)}setSessionToken(e,t){return this.sessionToken=t,N.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nc{constructor(){this.Tr=new We(Fe.Er),this.dr=new We(Fe.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,t){const r=new Fe(e,t);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,t){e.forEach(r=>this.addReference(r,t))}removeReference(e,t){this.Vr(new Fe(e,t))}mr(e,t){e.forEach(r=>this.removeReference(r,t))}gr(e){const t=new ee(new be([])),r=new Fe(t,e),i=new Fe(t,e+1),s=[];return this.dr.forEachInRange([r,i],a=>{this.Vr(a),s.push(a.key)}),s}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const t=new ee(new be([])),r=new Fe(t,e),i=new Fe(t,e+1);let s=ue();return this.dr.forEachInRange([r,i],a=>{s=s.add(a.key)}),s}containsKey(e){const t=new Fe(e,0),r=this.Tr.firstAfterOrEqual(t);return r!==null&&e.isEqual(r.key)}}class Fe{constructor(e,t){this.key=e,this.wr=t}static Er(e,t){return ee.comparator(e.key,t.key)||me(e.wr,t.wr)}static Ar(e,t){return me(e.wr,t.wr)||ee.comparator(e.key,t.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class GE{constructor(e,t){this.indexManager=e,this.referenceDelegate=t,this.mutationQueue=[],this.Sr=1,this.br=new We(Fe.Er)}checkEmpty(e){return N.resolve(this.mutationQueue.length===0)}addMutationBatch(e,t,r,i){const s=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new pE(s,t,r,i);this.mutationQueue.push(a);for(const c of i)this.br=this.br.add(new Fe(c.key,s)),this.indexManager.addToCollectionParentIndex(e,c.key.path.popLast());return N.resolve(a)}lookupMutationBatch(e,t){return N.resolve(this.Dr(t))}getNextMutationBatchAfterBatchId(e,t){const r=t+1,i=this.vr(r),s=i<0?0:i;return N.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return N.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return N.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,t){const r=new Fe(t,0),i=new Fe(t,Number.POSITIVE_INFINITY),s=[];return this.br.forEachInRange([r,i],a=>{const c=this.Dr(a.wr);s.push(c)}),N.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,t){let r=new We(me);return t.forEach(i=>{const s=new Fe(i,0),a=new Fe(i,Number.POSITIVE_INFINITY);this.br.forEachInRange([s,a],c=>{r=r.add(c.wr)})}),N.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,t){const r=t.path,i=r.length+1;let s=r;ee.isDocumentKey(s)||(s=s.child(""));const a=new Fe(new ee(s),0);let c=new We(me);return this.br.forEachWhile(u=>{const d=u.key.path;return!!r.isPrefixOf(d)&&(d.length===i&&(c=c.add(u.wr)),!0)},a),N.resolve(this.Cr(c))}Cr(e){const t=[];return e.forEach(r=>{const i=this.Dr(r);i!==null&&t.push(i)}),t}removeMutationBatch(e,t){Ee(this.Fr(t.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return N.forEach(t.mutations,i=>{const s=new Fe(i.key,t.batchId);return r=r.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,i.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,t){const r=new Fe(t,0),i=this.br.firstAfterOrEqual(r);return N.resolve(t.isEqual(i&&i.key))}performConsistencyCheck(e){return this.mutationQueue.length,N.resolve()}Fr(e,t){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const t=this.vr(e);return t<0||t>=this.mutationQueue.length?null:this.mutationQueue[t]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class QE{constructor(e){this.Mr=e,this.docs=function(){return new Se(ee.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,t){const r=t.key,i=this.docs.get(r),s=i?i.size:0,a=this.Mr(t);return this.docs=this.docs.insert(r,{document:t.mutableCopy(),size:a}),this.size+=a-s,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const t=this.docs.get(e);t&&(this.docs=this.docs.remove(e),this.size-=t.size)}getEntry(e,t){const r=this.docs.get(t);return N.resolve(r?r.document.mutableCopy():tt.newInvalidDocument(t))}getEntries(e,t){let r=tn();return t.forEach(i=>{const s=this.docs.get(i);r=r.insert(i,s?s.document.mutableCopy():tt.newInvalidDocument(i))}),N.resolve(r)}getDocumentsMatchingQuery(e,t,r,i){let s=tn();const a=t.path,c=new ee(a.child("")),u=this.docs.getIteratorFrom(c);for(;u.hasNext();){const{key:d,value:{document:f}}=u.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||Dv(kv(f),r)<=0||(i.has(f.key)||yo(t,f))&&(s=s.insert(f.key,f.mutableCopy()))}return N.resolve(s)}getAllFromCollectionGroup(e,t,r,i){ie()}Or(e,t){return N.forEach(this.docs,r=>t(r))}newChangeBuffer(e){return new JE(this)}getSize(e){return N.resolve(this.size)}}class JE extends $E{constructor(e){super(),this.cr=e}applyChanges(e){const t=[];return this.changes.forEach((r,i)=>{i.isValidDocument()?t.push(this.cr.addEntry(e,i)):this.cr.removeEntry(r)}),N.waitFor(t)}getFromCache(e,t){return this.cr.getEntry(e,t)}getAllFromCache(e,t){return this.cr.getEntries(e,t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class YE{constructor(e){this.persistence=e,this.Nr=new jr(t=>Pc(t),Cc),this.lastRemoteSnapshotVersion=se.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Nc,this.targetCount=0,this.kr=xr.Bn()}forEachTarget(e,t){return this.Nr.forEach((r,i)=>t(i)),N.resolve()}getLastRemoteSnapshotVersion(e){return N.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return N.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),N.resolve(this.highestTargetId)}setTargetsMetadata(e,t,r){return r&&(this.lastRemoteSnapshotVersion=r),t>this.Lr&&(this.Lr=t),N.resolve()}Kn(e){this.Nr.set(e.target,e);const t=e.targetId;t>this.highestTargetId&&(this.kr=new xr(t),this.highestTargetId=t),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,t){return this.Kn(t),this.targetCount+=1,N.resolve()}updateTargetData(e,t){return this.Kn(t),N.resolve()}removeTargetData(e,t){return this.Nr.delete(t.target),this.Br.gr(t.targetId),this.targetCount-=1,N.resolve()}removeTargets(e,t,r){let i=0;const s=[];return this.Nr.forEach((a,c)=>{c.sequenceNumber<=t&&r.get(c.targetId)===null&&(this.Nr.delete(a),s.push(this.removeMatchingKeysForTargetId(e,c.targetId)),i++)}),N.waitFor(s).next(()=>i)}getTargetCount(e){return N.resolve(this.targetCount)}getTargetData(e,t){const r=this.Nr.get(t)||null;return N.resolve(r)}addMatchingKeys(e,t,r){return this.Br.Rr(t,r),N.resolve()}removeMatchingKeys(e,t,r){this.Br.mr(t,r);const i=this.persistence.referenceDelegate,s=[];return i&&t.forEach(a=>{s.push(i.markPotentiallyOrphaned(e,a))}),N.waitFor(s)}removeMatchingKeysForTargetId(e,t){return this.Br.gr(t),N.resolve()}getMatchingKeysForTargetId(e,t){const r=this.Br.yr(t);return N.resolve(r)}containsKey(e,t){return N.resolve(this.Br.containsKey(t))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class XE{constructor(e,t){this.qr={},this.overlays={},this.Qr=new Ac(0),this.Kr=!1,this.Kr=!0,this.$r=new KE,this.referenceDelegate=e(this),this.Ur=new YE(this),this.indexManager=new BE,this.remoteDocumentCache=function(i){return new QE(i)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new FE(t),this.Gr=new zE(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let t=this.overlays[e.toKey()];return t||(t=new WE,this.overlays[e.toKey()]=t),t}getMutationQueue(e,t){let r=this.qr[e.toKey()];return r||(r=new GE(t,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,t,r){G("MemoryPersistence","Starting transaction:",e);const i=new ZE(this.Qr.next());return this.referenceDelegate.zr(),r(i).next(s=>this.referenceDelegate.jr(i).next(()=>s)).toPromise().then(s=>(i.raiseOnCommittedEvent(),s))}Hr(e,t){return N.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,t)))}}class ZE extends Ov{constructor(e){super(),this.currentSequenceNumber=e}}class xc{constructor(e){this.persistence=e,this.Jr=new Nc,this.Yr=null}static Zr(e){return new xc(e)}get Xr(){if(this.Yr)return this.Yr;throw ie()}addReference(e,t,r){return this.Jr.addReference(r,t),this.Xr.delete(r.toString()),N.resolve()}removeReference(e,t,r){return this.Jr.removeReference(r,t),this.Xr.add(r.toString()),N.resolve()}markPotentiallyOrphaned(e,t){return this.Xr.add(t.toString()),N.resolve()}removeTarget(e,t){this.Jr.gr(t.targetId).forEach(i=>this.Xr.add(i.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,t.targetId).next(i=>{i.forEach(s=>this.Xr.add(s.toString()))}).next(()=>r.removeTargetData(e,t))}zr(){this.Yr=new Set}jr(e){const t=this.persistence.getRemoteDocumentCache().newChangeBuffer();return N.forEach(this.Xr,r=>{const i=ee.fromPath(r);return this.ei(e,i).next(s=>{s||t.removeEntry(i,se.min())})}).next(()=>(this.Yr=null,t.apply(e)))}updateLimboDocument(e,t){return this.ei(e,t).next(r=>{r?this.Xr.delete(t.toString()):this.Xr.add(t.toString())})}Wr(e){return 0}ei(e,t){return N.or([()=>N.resolve(this.Jr.containsKey(t)),()=>this.persistence.getTargetCache().containsKey(e,t),()=>this.persistence.Hr(e,t)])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mc{constructor(e,t,r,i){this.targetId=e,this.fromCache=t,this.$i=r,this.Ui=i}static Wi(e,t){let r=ue(),i=ue();for(const s of t.docChanges)switch(s.type){case 0:r=r.add(s.doc.key);break;case 1:i=i.add(s.doc.key)}return new Mc(e,t.fromCache,r,i)}}/**
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
 */class eT{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class tT{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return ty()?8:Nv(rt())>0?6:4}()}initialize(e,t){this.Ji=e,this.indexManager=t,this.Gi=!0}getDocumentsMatchingQuery(e,t,r,i){const s={result:null};return this.Yi(e,t).next(a=>{s.result=a}).next(()=>{if(!s.result)return this.Zi(e,t,i,r).next(a=>{s.result=a})}).next(()=>{if(s.result)return;const a=new eT;return this.Xi(e,t,a).next(c=>{if(s.result=c,this.zi)return this.es(e,t,a,c.size)})}).next(()=>s.result)}es(e,t,r,i){return r.documentReadCount<this.ji?(ai()<=he.DEBUG&&G("QueryEngine","SDK will not create cache indexes for query:",gr(t),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),N.resolve()):(ai()<=he.DEBUG&&G("QueryEngine","Query:",gr(t),"scans",r.documentReadCount,"local documents and returns",i,"documents as results."),r.documentReadCount>this.Hi*i?(ai()<=he.DEBUG&&G("QueryEngine","The SDK decides to create cache indexes for query:",gr(t),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Ot(t))):N.resolve())}Yi(e,t){if(qu(t))return N.resolve(null);let r=Ot(t);return this.indexManager.getIndexType(e,r).next(i=>i===0?null:(t.limit!==null&&i===1&&(t=ja(t,null,"F"),r=Ot(t)),this.indexManager.getDocumentsMatchingTarget(e,r).next(s=>{const a=ue(...s);return this.Ji.getDocuments(e,a).next(c=>this.indexManager.getMinOffset(e,r).next(u=>{const d=this.ts(t,c);return this.ns(t,d,a,u.readTime)?this.Yi(e,ja(t,null,"F")):this.rs(e,d,t,u)}))})))}Zi(e,t,r,i){return qu(t)||i.isEqual(se.min())?N.resolve(null):this.Ji.getDocuments(e,r).next(s=>{const a=this.ts(t,s);return this.ns(t,a,r,i)?N.resolve(null):(ai()<=he.DEBUG&&G("QueryEngine","Re-using previous result from %s to execute query: %s",i.toString(),gr(t)),this.rs(e,a,t,Cv(i,-1)).next(c=>c))})}ts(e,t){let r=new We(df(e));return t.forEach((i,s)=>{yo(e,s)&&(r=r.add(s))}),r}ns(e,t,r,i){if(e.limit===null)return!1;if(r.size!==t.size)return!0;const s=e.limitType==="F"?t.last():t.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(i)>0)}Xi(e,t,r){return ai()<=he.DEBUG&&G("QueryEngine","Using full collection scan to execute query:",gr(t)),this.Ji.getDocumentsMatchingQuery(e,t,Vn.min(),r)}rs(e,t,r,i){return this.Ji.getDocumentsMatchingQuery(e,r,i).next(s=>(t.forEach(a=>{s=s.insert(a.key,a)}),s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nT{constructor(e,t,r,i){this.persistence=e,this.ss=t,this.serializer=i,this.os=new Se(me),this._s=new jr(s=>Pc(s),Cc),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new HE(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",t=>e.collect(t,this.os))}}function rT(n,e,t,r){return new nT(n,e,t,r)}async function Nf(n,e){const t=ae(n);return await t.persistence.runTransaction("Handle user change","readonly",r=>{let i;return t.mutationQueue.getAllMutationBatches(r).next(s=>(i=s,t.ls(e),t.mutationQueue.getAllMutationBatches(r))).next(s=>{const a=[],c=[];let u=ue();for(const d of i){a.push(d.batchId);for(const f of d.mutations)u=u.add(f.key)}for(const d of s){c.push(d.batchId);for(const f of d.mutations)u=u.add(f.key)}return t.localDocuments.getDocuments(r,u).next(d=>({hs:d,removedBatchIds:a,addedBatchIds:c}))})})}function iT(n,e){const t=ae(n);return t.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const i=e.batch.keys(),s=t.cs.newChangeBuffer({trackRemovals:!0});return function(c,u,d,f){const g=d.batch,I=g.keys();let S=N.resolve();return I.forEach(V=>{S=S.next(()=>f.getEntry(u,V)).next(U=>{const B=d.docVersions.get(V);Ee(B!==null),U.version.compareTo(B)<0&&(g.applyToRemoteDocument(U,d),U.isValidDocument()&&(U.setReadTime(d.commitVersion),f.addEntry(U)))})}),S.next(()=>c.mutationQueue.removeMutationBatch(u,g))}(t,r,e,s).next(()=>s.apply(r)).next(()=>t.mutationQueue.performConsistencyCheck(r)).next(()=>t.documentOverlayCache.removeOverlaysForBatchId(r,i,e.batch.batchId)).next(()=>t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(c){let u=ue();for(let d=0;d<c.mutationResults.length;++d)c.mutationResults[d].transformResults.length>0&&(u=u.add(c.batch.mutations[d].key));return u}(e))).next(()=>t.localDocuments.getDocuments(r,i))})}function xf(n){const e=ae(n);return e.persistence.runTransaction("Get last remote snapshot version","readonly",t=>e.Ur.getLastRemoteSnapshotVersion(t))}function sT(n,e){const t=ae(n),r=e.snapshotVersion;let i=t.os;return t.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{const a=t.cs.newChangeBuffer({trackRemovals:!0});i=t.os;const c=[];e.targetChanges.forEach((f,g)=>{const I=i.get(g);if(!I)return;c.push(t.Ur.removeMatchingKeys(s,f.removedDocuments,g).next(()=>t.Ur.addMatchingKeys(s,f.addedDocuments,g)));let S=I.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(g)!==null?S=S.withResumeToken(Ge.EMPTY_BYTE_STRING,se.min()).withLastLimboFreeSnapshotVersion(se.min()):f.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(f.resumeToken,r)),i=i.insert(g,S),function(U,B,K){return U.resumeToken.approximateByteSize()===0||B.snapshotVersion.toMicroseconds()-U.snapshotVersion.toMicroseconds()>=3e8?!0:K.addedDocuments.size+K.modifiedDocuments.size+K.removedDocuments.size>0}(I,S,f)&&c.push(t.Ur.updateTargetData(s,S))});let u=tn(),d=ue();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&c.push(t.persistence.referenceDelegate.updateLimboDocument(s,f))}),c.push(oT(s,a,e.documentUpdates).next(f=>{u=f.Ps,d=f.Is})),!r.isEqual(se.min())){const f=t.Ur.getLastRemoteSnapshotVersion(s).next(g=>t.Ur.setTargetsMetadata(s,s.currentSequenceNumber,r));c.push(f)}return N.waitFor(c).next(()=>a.apply(s)).next(()=>t.localDocuments.getLocalViewOfDocuments(s,u,d)).next(()=>u)}).then(s=>(t.os=i,s))}function oT(n,e,t){let r=ue(),i=ue();return t.forEach(s=>r=r.add(s)),e.getEntries(n,r).next(s=>{let a=tn();return t.forEach((c,u)=>{const d=s.get(c);u.isFoundDocument()!==d.isFoundDocument()&&(i=i.add(c)),u.isNoDocument()&&u.version.isEqual(se.min())?(e.removeEntry(c,u.readTime),a=a.insert(c,u)):!d.isValidDocument()||u.version.compareTo(d.version)>0||u.version.compareTo(d.version)===0&&d.hasPendingWrites?(e.addEntry(u),a=a.insert(c,u)):G("LocalStore","Ignoring outdated watch update for ",c,". Current version:",d.version," Watch version:",u.version)}),{Ps:a,Is:i}})}function aT(n,e){const t=ae(n);return t.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),t.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function cT(n,e){const t=ae(n);return t.persistence.runTransaction("Allocate target","readwrite",r=>{let i;return t.Ur.getTargetData(r,e).next(s=>s?(i=s,N.resolve(i)):t.Ur.allocateTargetId(r).next(a=>(i=new Tn(e,a,"TargetPurposeListen",r.currentSequenceNumber),t.Ur.addTargetData(r,i).next(()=>i))))}).then(r=>{const i=t.os.get(r.targetId);return(i===null||r.snapshotVersion.compareTo(i.snapshotVersion)>0)&&(t.os=t.os.insert(r.targetId,r),t._s.set(e,r.targetId)),r})}async function Wa(n,e,t){const r=ae(n),i=r.os.get(e),s=t?"readwrite":"readwrite-primary";try{t||await r.persistence.runTransaction("Release target",s,a=>r.persistence.referenceDelegate.removeTarget(a,i))}catch(a){if(!qi(a))throw a;G("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}r.os=r.os.remove(e),r._s.delete(i.target)}function eh(n,e,t){const r=ae(n);let i=se.min(),s=ue();return r.persistence.runTransaction("Execute query","readwrite",a=>function(u,d,f){const g=ae(u),I=g._s.get(f);return I!==void 0?N.resolve(g.os.get(I)):g.Ur.getTargetData(d,f)}(r,a,Ot(e)).next(c=>{if(c)return i=c.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(a,c.targetId).next(u=>{s=u})}).next(()=>r.ss.getDocumentsMatchingQuery(a,e,t?i:se.min(),t?s:ue())).next(c=>(lT(r,Zv(e),c),{documents:c,Ts:s})))}function lT(n,e,t){let r=n.us.get(e)||se.min();t.forEach((i,s)=>{s.readTime.compareTo(r)>0&&(r=s.readTime)}),n.us.set(e,r)}class th{constructor(){this.activeTargetIds=sE()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class uT{constructor(){this.so=new th,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,t,r){}addLocalQueryTarget(e,t=!0){return t&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,t,r){this.oo[e]=t}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new th,Promise.resolve()}handleUserChange(e,t,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class hT{_o(e){}shutdown(){}}/**
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
 */class nh{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){G("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){G("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let Es=null;function ga(){return Es===null?Es=function(){return 268435456+Math.round(2147483648*Math.random())}():Es++,"0x"+Es.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const dT={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fT{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ye="WebChannelConnection";class pT extends class{constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const r=t.ssl?"https":"http",i=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+t.host,this.vo=`projects/${i}/databases/${s}`,this.Co=this.databaseId.database==="(default)"?`project_id=${i}`:`project_id=${i}&database_id=${s}`}get Fo(){return!1}Mo(t,r,i,s,a){const c=ga(),u=this.xo(t,r.toUriEncodedString());G("RestConnection",`Sending RPC '${t}' ${c}:`,u,i);const d={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(d,s,a),this.No(t,u,d,i).then(f=>(G("RestConnection",`Received RPC '${t}' ${c}: `,f),f),f=>{throw Dr("RestConnection",`RPC '${t}' ${c} failed with error: `,f,"url: ",u,"request:",i),f})}Lo(t,r,i,s,a,c){return this.Mo(t,r,i,s,a)}Oo(t,r,i){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Ur}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((s,a)=>t[a]=s),i&&i.headers.forEach((s,a)=>t[a]=s)}xo(t,r){const i=dT[t];return`${this.Do}/v1/${r}:${i}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,t,r,i){const s=ga();return new Promise((a,c)=>{const u=new Kd;u.setWithCredentials(!0),u.listenOnce(Gd.COMPLETE,()=>{try{switch(u.getLastErrorCode()){case Rs.NO_ERROR:const f=u.getResponseJson();G(Ye,`XHR for RPC '${e}' ${s} received:`,JSON.stringify(f)),a(f);break;case Rs.TIMEOUT:G(Ye,`RPC '${e}' ${s} timed out`),c(new Z(M.DEADLINE_EXCEEDED,"Request time out"));break;case Rs.HTTP_ERROR:const g=u.getStatus();if(G(Ye,`RPC '${e}' ${s} failed with status:`,g,"response text:",u.getResponseText()),g>0){let I=u.getResponseJson();Array.isArray(I)&&(I=I[0]);const S=I==null?void 0:I.error;if(S&&S.status&&S.message){const V=function(B){const K=B.toLowerCase().replace(/_/g,"-");return Object.values(M).indexOf(K)>=0?K:M.UNKNOWN}(S.status);c(new Z(V,S.message))}else c(new Z(M.UNKNOWN,"Server responded with status "+u.getStatus()))}else c(new Z(M.UNAVAILABLE,"Connection failed."));break;default:ie()}}finally{G(Ye,`RPC '${e}' ${s} completed.`)}});const d=JSON.stringify(i);G(Ye,`RPC '${e}' ${s} sending request:`,i),u.send(t,"POST",d,r,15)})}Bo(e,t,r){const i=ga(),s=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=Yd(),c=Jd(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(u.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Oo(u.initMessageHeaders,t,r),u.encodeInitMessageHeaders=!0;const f=s.join("");G(Ye,`Creating RPC '${e}' stream ${i}: ${f}`,u);const g=a.createWebChannel(f,u);let I=!1,S=!1;const V=new fT({Io:B=>{S?G(Ye,`Not sending because RPC '${e}' stream ${i} is closed:`,B):(I||(G(Ye,`Opening RPC '${e}' stream ${i} transport.`),g.open(),I=!0),G(Ye,`RPC '${e}' stream ${i} sending:`,B),g.send(B))},To:()=>g.close()}),U=(B,K,J)=>{B.listen(K,O=>{try{J(O)}catch(k){setTimeout(()=>{throw k},0)}})};return U(g,li.EventType.OPEN,()=>{S||(G(Ye,`RPC '${e}' stream ${i} transport opened.`),V.yo())}),U(g,li.EventType.CLOSE,()=>{S||(S=!0,G(Ye,`RPC '${e}' stream ${i} transport closed`),V.So())}),U(g,li.EventType.ERROR,B=>{S||(S=!0,Dr(Ye,`RPC '${e}' stream ${i} transport errored:`,B),V.So(new Z(M.UNAVAILABLE,"The operation could not be completed")))}),U(g,li.EventType.MESSAGE,B=>{var K;if(!S){const J=B.data[0];Ee(!!J);const O=J,k=O.error||((K=O[0])===null||K===void 0?void 0:K.error);if(k){G(Ye,`RPC '${e}' stream ${i} received error:`,k);const j=k.status;let X=function(_){const E=ke[_];if(E!==void 0)return Af(E)}(j),T=k.message;X===void 0&&(X=M.INTERNAL,T="Unknown error status: "+j+" with message "+k.message),S=!0,V.So(new Z(X,T)),g.close()}else G(Ye,`RPC '${e}' stream ${i} received:`,J),V.bo(J)}}),U(c,Qd.STAT_EVENT,B=>{B.stat===Ma.PROXY?G(Ye,`RPC '${e}' stream ${i} detected buffering proxy`):B.stat===Ma.NOPROXY&&G(Ye,`RPC '${e}' stream ${i} detected no buffering proxy`)}),setTimeout(()=>{V.wo()},0),V}}function ma(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Io(n){return new AE(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mf{constructor(e,t,r=1e3,i=1.5,s=6e4){this.ui=e,this.timerId=t,this.ko=r,this.qo=i,this.Qo=s,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const t=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),i=Math.max(0,t-r);i>0&&G("ExponentialBackoff",`Backing off for ${i} ms (base delay: ${this.Ko} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,i,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lf{constructor(e,t,r,i,s,a,c,u){this.ui=e,this.Ho=r,this.Jo=i,this.connection=s,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=u,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new Mf(e,t)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,t){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():t&&t.code===M.RESOURCE_EXHAUSTED?(en(t.toString()),en("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):t&&t.code===M.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(t)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),t=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,i])=>{this.Yo===t&&this.P_(r,i)},r=>{e(()=>{const i=new Z(M.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(i)})})}P_(e,t){const r=this.h_(this.Yo);this.stream=this.T_(e,t),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(i=>{r(()=>this.I_(i))}),this.stream.onMessage(i=>{r(()=>++this.e_==1?this.E_(i):this.onNext(i))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return G("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return t=>{this.ui.enqueueAndForget(()=>this.Yo===e?t():(G("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class gT extends Lf{constructor(e,t,r,i,s,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",t,r,i,a),this.serializer=s}T_(e,t){return this.connection.Bo("Listen",e,t)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const t=SE(this.serializer,e),r=function(s){if(!("targetChange"in s))return se.min();const a=s.targetChange;return a.targetIds&&a.targetIds.length?se.min():a.readTime?Nt(a.readTime):se.min()}(e);return this.listener.d_(t,r)}A_(e){const t={};t.database=za(this.serializer),t.addTarget=function(s,a){let c;const u=a.target;if(c=Ba(u)?{documents:kE(s,u)}:{query:DE(s,u)._t},c.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){c.resumeToken=Sf(s,a.resumeToken);const d=$a(s,a.expectedCount);d!==null&&(c.expectedCount=d)}else if(a.snapshotVersion.compareTo(se.min())>0){c.readTime=Qs(s,a.snapshotVersion.toTimestamp());const d=$a(s,a.expectedCount);d!==null&&(c.expectedCount=d)}return c}(this.serializer,e);const r=OE(this.serializer,e);r&&(t.labels=r),this.a_(t)}R_(e){const t={};t.database=za(this.serializer),t.removeTarget=e,this.a_(t)}}class mT extends Lf{constructor(e,t,r,i,s,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",t,r,i,a),this.serializer=s}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,t){return this.connection.Bo("Write",e,t)}E_(e){return Ee(!!e.streamToken),this.lastStreamToken=e.streamToken,Ee(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){Ee(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const t=CE(e.writeResults,e.commitTime),r=Nt(e.commitTime);return this.listener.g_(r,t)}p_(){const e={};e.database=za(this.serializer),this.a_(e)}m_(e){const t={streamToken:this.lastStreamToken,writes:e.map(r=>PE(this.serializer,r))};this.a_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _T extends class{}{constructor(e,t,r,i){super(),this.authCredentials=e,this.appCheckCredentials=t,this.connection=r,this.serializer=i,this.y_=!1}w_(){if(this.y_)throw new Z(M.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,t,r,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,a])=>this.connection.Mo(e,qa(t,r),i,s,a)).catch(s=>{throw s.name==="FirebaseError"?(s.code===M.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new Z(M.UNKNOWN,s.toString())})}Lo(e,t,r,i,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,c])=>this.connection.Lo(e,qa(t,r),i,a,c,s)).catch(a=>{throw a.name==="FirebaseError"?(a.code===M.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new Z(M.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class yT{constructor(e,t){this.asyncQueue=e,this.onlineStateHandler=t,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const t=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(en(t),this.D_=!1):G("OnlineStateTracker",t)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vT{constructor(e,t,r,i,s){this.localStore=e,this.datastore=t,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=s,this.k_._o(a=>{r.enqueueAndForget(async()=>{sr(this)&&(G("RemoteStore","Restarting streams for network reachability change."),await async function(u){const d=ae(u);d.L_.add(4),await Wi(d),d.q_.set("Unknown"),d.L_.delete(4),await wo(d)}(this))})}),this.q_=new yT(r,i)}}async function wo(n){if(sr(n))for(const e of n.B_)await e(!0)}async function Wi(n){for(const e of n.B_)await e(!1)}function Ff(n,e){const t=ae(n);t.N_.has(e.targetId)||(t.N_.set(e.targetId,e),Bc(t)?Uc(t):$r(t).r_()&&Fc(t,e))}function Lc(n,e){const t=ae(n),r=$r(t);t.N_.delete(e),r.r_()&&Uf(t,e),t.N_.size===0&&(r.r_()?r.o_():sr(t)&&t.q_.set("Unknown"))}function Fc(n,e){if(n.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(se.min())>0){const t=n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(t)}$r(n).A_(e)}function Uf(n,e){n.Q_.xe(e),$r(n).R_(e)}function Uc(n){n.Q_=new EE({getRemoteKeysForTarget:e=>n.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>n.N_.get(e)||null,tt:()=>n.datastore.serializer.databaseId}),$r(n).start(),n.q_.v_()}function Bc(n){return sr(n)&&!$r(n).n_()&&n.N_.size>0}function sr(n){return ae(n).L_.size===0}function Bf(n){n.Q_=void 0}async function ET(n){n.q_.set("Online")}async function TT(n){n.N_.forEach((e,t)=>{Fc(n,e)})}async function IT(n,e){Bf(n),Bc(n)?(n.q_.M_(e),Uc(n)):n.q_.set("Unknown")}async function wT(n,e,t){if(n.q_.set("Online"),e instanceof Rf&&e.state===2&&e.cause)try{await async function(i,s){const a=s.cause;for(const c of s.targetIds)i.N_.has(c)&&(await i.remoteSyncer.rejectListen(c,a),i.N_.delete(c),i.Q_.removeTarget(c))}(n,e)}catch(r){G("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Js(n,r)}else if(e instanceof Cs?n.Q_.Ke(e):e instanceof bf?n.Q_.He(e):n.Q_.We(e),!t.isEqual(se.min()))try{const r=await xf(n.localStore);t.compareTo(r)>=0&&await function(s,a){const c=s.Q_.rt(a);return c.targetChanges.forEach((u,d)=>{if(u.resumeToken.approximateByteSize()>0){const f=s.N_.get(d);f&&s.N_.set(d,f.withResumeToken(u.resumeToken,a))}}),c.targetMismatches.forEach((u,d)=>{const f=s.N_.get(u);if(!f)return;s.N_.set(u,f.withResumeToken(Ge.EMPTY_BYTE_STRING,f.snapshotVersion)),Uf(s,u);const g=new Tn(f.target,u,d,f.sequenceNumber);Fc(s,g)}),s.remoteSyncer.applyRemoteEvent(c)}(n,t)}catch(r){G("RemoteStore","Failed to raise snapshot:",r),await Js(n,r)}}async function Js(n,e,t){if(!qi(e))throw e;n.L_.add(1),await Wi(n),n.q_.set("Offline"),t||(t=()=>xf(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{G("RemoteStore","Retrying IndexedDB access"),await t(),n.L_.delete(1),await wo(n)})}function jf(n,e){return e().catch(t=>Js(n,t,e))}async function Ao(n){const e=ae(n),t=Nn(e);let r=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;AT(e);)try{const i=await aT(e.localStore,r);if(i===null){e.O_.length===0&&t.o_();break}r=i.batchId,bT(e,i)}catch(i){await Js(e,i)}$f(e)&&qf(e)}function AT(n){return sr(n)&&n.O_.length<10}function bT(n,e){n.O_.push(e);const t=Nn(n);t.r_()&&t.V_&&t.m_(e.mutations)}function $f(n){return sr(n)&&!Nn(n).n_()&&n.O_.length>0}function qf(n){Nn(n).start()}async function RT(n){Nn(n).p_()}async function ST(n){const e=Nn(n);for(const t of n.O_)e.m_(t.mutations)}async function PT(n,e,t){const r=n.O_.shift(),i=Dc.from(r,e,t);await jf(n,()=>n.remoteSyncer.applySuccessfulWrite(i)),await Ao(n)}async function CT(n,e){e&&Nn(n).V_&&await async function(r,i){if(function(a){return _E(a)&&a!==M.ABORTED}(i.code)){const s=r.O_.shift();Nn(r).s_(),await jf(r,()=>r.remoteSyncer.rejectFailedWrite(s.batchId,i)),await Ao(r)}}(n,e),$f(n)&&qf(n)}async function rh(n,e){const t=ae(n);t.asyncQueue.verifyOperationInProgress(),G("RemoteStore","RemoteStore received new credentials");const r=sr(t);t.L_.add(3),await Wi(t),r&&t.q_.set("Unknown"),await t.remoteSyncer.handleCredentialChange(e),t.L_.delete(3),await wo(t)}async function kT(n,e){const t=ae(n);e?(t.L_.delete(2),await wo(t)):e||(t.L_.add(2),await Wi(t),t.q_.set("Unknown"))}function $r(n){return n.K_||(n.K_=function(t,r,i){const s=ae(t);return s.w_(),new gT(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(n.datastore,n.asyncQueue,{Eo:ET.bind(null,n),Ro:TT.bind(null,n),mo:IT.bind(null,n),d_:wT.bind(null,n)}),n.B_.push(async e=>{e?(n.K_.s_(),Bc(n)?Uc(n):n.q_.set("Unknown")):(await n.K_.stop(),Bf(n))})),n.K_}function Nn(n){return n.U_||(n.U_=function(t,r,i){const s=ae(t);return s.w_(),new mT(r,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,i)}(n.datastore,n.asyncQueue,{Eo:()=>Promise.resolve(),Ro:RT.bind(null,n),mo:CT.bind(null,n),f_:ST.bind(null,n),g_:PT.bind(null,n)}),n.B_.push(async e=>{e?(n.U_.s_(),await Ao(n)):(await n.U_.stop(),n.O_.length>0&&(G("RemoteStore",`Stopping write stream with ${n.O_.length} pending writes`),n.O_=[]))})),n.U_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jc{constructor(e,t,r,i,s){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=i,this.removalCallback=s,this.deferred=new Sn,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,i,s){const a=Date.now()+r,c=new jc(e,t,a,i,s);return c.start(r),c}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new Z(M.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function $c(n,e){if(en("AsyncQueue",`${e}: ${n}`),qi(n))return new Z(M.UNAVAILABLE,`${e}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ar{constructor(e){this.comparator=e?(t,r)=>e(t,r)||ee.comparator(t.key,r.key):(t,r)=>ee.comparator(t.key,r.key),this.keyedMap=ui(),this.sortedSet=new Se(this.comparator)}static emptySet(e){return new Ar(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const t=this.keyedMap.get(e);return t?this.sortedSet.indexOf(t):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((t,r)=>(e(t),!1))}add(e){const t=this.delete(e.key);return t.copy(t.keyedMap.insert(e.key,e),t.sortedSet.insert(e,null))}delete(e){const t=this.get(e);return t?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(t)):this}isEqual(e){if(!(e instanceof Ar)||this.size!==e.size)return!1;const t=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;t.hasNext();){const i=t.getNext().key,s=r.getNext().key;if(!i.isEqual(s))return!1}return!0}toString(){const e=[];return this.forEach(t=>{e.push(t.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,t){const r=new Ar;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=t,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ih{constructor(){this.W_=new Se(ee.comparator)}track(e){const t=e.doc.key,r=this.W_.get(t);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(t,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(t,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(t,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(t):e.type===1&&r.type===2?this.W_=this.W_.insert(t,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(t,{type:2,doc:e.doc}):ie():this.W_=this.W_.insert(t,e)}G_(){const e=[];return this.W_.inorderTraversal((t,r)=>{e.push(r)}),e}}class Mr{constructor(e,t,r,i,s,a,c,u,d){this.query=e,this.docs=t,this.oldDocs=r,this.docChanges=i,this.mutatedKeys=s,this.fromCache=a,this.syncStateChanged=c,this.excludesMetadataChanges=u,this.hasCachedResults=d}static fromInitialDocuments(e,t,r,i,s){const a=[];return t.forEach(c=>{a.push({type:0,doc:c})}),new Mr(e,t,Ar.emptySet(t),a,r,i,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&_o(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const t=this.docChanges,r=e.docChanges;if(t.length!==r.length)return!1;for(let i=0;i<t.length;i++)if(t[i].type!==r[i].type||!t[i].doc.isEqual(r[i].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DT{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class VT{constructor(){this.queries=sh(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(t,r){const i=ae(t),s=i.queries;i.queries=sh(),s.forEach((a,c)=>{for(const u of c.j_)u.onError(r)})})(this,new Z(M.ABORTED,"Firestore shutting down"))}}function sh(){return new jr(n=>hf(n),_o)}async function OT(n,e){const t=ae(n);let r=3;const i=e.query;let s=t.queries.get(i);s?!s.H_()&&e.J_()&&(r=2):(s=new DT,r=e.J_()?0:1);try{switch(r){case 0:s.z_=await t.onListen(i,!0);break;case 1:s.z_=await t.onListen(i,!1);break;case 2:await t.onFirstRemoteStoreListen(i)}}catch(a){const c=$c(a,`Initialization of query '${gr(e.query)}' failed`);return void e.onError(c)}t.queries.set(i,s),s.j_.push(e),e.Z_(t.onlineState),s.z_&&e.X_(s.z_)&&qc(t)}async function NT(n,e){const t=ae(n),r=e.query;let i=3;const s=t.queries.get(r);if(s){const a=s.j_.indexOf(e);a>=0&&(s.j_.splice(a,1),s.j_.length===0?i=e.J_()?0:1:!s.H_()&&e.J_()&&(i=2))}switch(i){case 0:return t.queries.delete(r),t.onUnlisten(r,!0);case 1:return t.queries.delete(r),t.onUnlisten(r,!1);case 2:return t.onLastRemoteStoreUnlisten(r);default:return}}function xT(n,e){const t=ae(n);let r=!1;for(const i of e){const s=i.query,a=t.queries.get(s);if(a){for(const c of a.j_)c.X_(i)&&(r=!0);a.z_=i}}r&&qc(t)}function MT(n,e,t){const r=ae(n),i=r.queries.get(e);if(i)for(const s of i.j_)s.onError(t);r.queries.delete(e)}function qc(n){n.Y_.forEach(e=>{e.next()})}var Ka,oh;(oh=Ka||(Ka={})).ea="default",oh.Cache="cache";class LT{constructor(e,t,r){this.query=e,this.ta=t,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const i of e.docChanges)i.type!==3&&r.push(i);e=new Mr(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let t=!1;return this.na?this.ia(e)&&(this.ta.next(e),t=!0):this.sa(e,this.onlineState)&&(this.oa(e),t=!0),this.ra=e,t}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let t=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),t=!0),t}sa(e,t){if(!e.fromCache||!this.J_())return!0;const r=t!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||t==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const t=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!t)&&this.options.includeMetadataChanges===!0}oa(e){e=Mr.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==Ka.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hf{constructor(e){this.key=e}}class zf{constructor(e){this.key=e}}class FT{constructor(e,t){this.query=e,this.Ta=t,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=ue(),this.mutatedKeys=ue(),this.Aa=df(e),this.Ra=new Ar(this.Aa)}get Va(){return this.Ta}ma(e,t){const r=t?t.fa:new ih,i=t?t.Ra:this.Ra;let s=t?t.mutatedKeys:this.mutatedKeys,a=i,c=!1;const u=this.query.limitType==="F"&&i.size===this.query.limit?i.last():null,d=this.query.limitType==="L"&&i.size===this.query.limit?i.first():null;if(e.inorderTraversal((f,g)=>{const I=i.get(f),S=yo(this.query,g)?g:null,V=!!I&&this.mutatedKeys.has(I.key),U=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations);let B=!1;I&&S?I.data.isEqual(S.data)?V!==U&&(r.track({type:3,doc:S}),B=!0):this.ga(I,S)||(r.track({type:2,doc:S}),B=!0,(u&&this.Aa(S,u)>0||d&&this.Aa(S,d)<0)&&(c=!0)):!I&&S?(r.track({type:0,doc:S}),B=!0):I&&!S&&(r.track({type:1,doc:I}),B=!0,(u||d)&&(c=!0)),B&&(S?(a=a.add(S),s=U?s.add(f):s.delete(f)):(a=a.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const f=this.query.limitType==="F"?a.last():a.first();a=a.delete(f.key),s=s.delete(f.key),r.track({type:1,doc:f})}return{Ra:a,fa:r,ns:c,mutatedKeys:s}}ga(e,t){return e.hasLocalMutations&&t.hasCommittedMutations&&!t.hasLocalMutations}applyChanges(e,t,r,i){const s=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const a=e.fa.G_();a.sort((f,g)=>function(S,V){const U=B=>{switch(B){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return ie()}};return U(S)-U(V)}(f.type,g.type)||this.Aa(f.doc,g.doc)),this.pa(r),i=i!=null&&i;const c=t&&!i?this.ya():[],u=this.da.size===0&&this.current&&!i?1:0,d=u!==this.Ea;return this.Ea=u,a.length!==0||d?{snapshot:new Mr(this.query,e.Ra,s,a,e.mutatedKeys,u===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:c}:{wa:c}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new ih,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(t=>this.Ta=this.Ta.add(t)),e.modifiedDocuments.forEach(t=>{}),e.removedDocuments.forEach(t=>this.Ta=this.Ta.delete(t)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=ue(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const t=[];return e.forEach(r=>{this.da.has(r)||t.push(new zf(r))}),this.da.forEach(r=>{e.has(r)||t.push(new Hf(r))}),t}ba(e){this.Ta=e.Ts,this.da=ue();const t=this.ma(e.documents);return this.applyChanges(t,!0)}Da(){return Mr.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class UT{constructor(e,t,r){this.query=e,this.targetId=t,this.view=r}}class BT{constructor(e){this.key=e,this.va=!1}}class jT{constructor(e,t,r,i,s,a){this.localStore=e,this.remoteStore=t,this.eventManager=r,this.sharedClientState=i,this.currentUser=s,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new jr(c=>hf(c),_o),this.Ma=new Map,this.xa=new Set,this.Oa=new Se(ee.comparator),this.Na=new Map,this.La=new Nc,this.Ba={},this.ka=new Map,this.qa=xr.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function $T(n,e,t=!0){const r=Yf(n);let i;const s=r.Fa.get(e);return s?(r.sharedClientState.addLocalQueryTarget(s.targetId),i=s.view.Da()):i=await Wf(r,e,t,!0),i}async function qT(n,e){const t=Yf(n);await Wf(t,e,!0,!1)}async function Wf(n,e,t,r){const i=await cT(n.localStore,Ot(e)),s=i.targetId,a=n.sharedClientState.addLocalQueryTarget(s,t);let c;return r&&(c=await HT(n,e,s,a==="current",i.resumeToken)),n.isPrimaryClient&&t&&Ff(n.remoteStore,i),c}async function HT(n,e,t,r,i){n.Ka=(g,I,S)=>async function(U,B,K,J){let O=B.view.ma(K);O.ns&&(O=await eh(U.localStore,B.query,!1).then(({documents:T})=>B.view.ma(T,O)));const k=J&&J.targetChanges.get(B.targetId),j=J&&J.targetMismatches.get(B.targetId)!=null,X=B.view.applyChanges(O,U.isPrimaryClient,k,j);return ch(U,B.targetId,X.wa),X.snapshot}(n,g,I,S);const s=await eh(n.localStore,e,!0),a=new FT(e,s.Ts),c=a.ma(s.documents),u=zi.createSynthesizedTargetChangeForCurrentChange(t,r&&n.onlineState!=="Offline",i),d=a.applyChanges(c,n.isPrimaryClient,u);ch(n,t,d.wa);const f=new UT(e,t,a);return n.Fa.set(e,f),n.Ma.has(t)?n.Ma.get(t).push(e):n.Ma.set(t,[e]),d.snapshot}async function zT(n,e,t){const r=ae(n),i=r.Fa.get(e),s=r.Ma.get(i.targetId);if(s.length>1)return r.Ma.set(i.targetId,s.filter(a=>!_o(a,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(i.targetId),r.sharedClientState.isActiveQueryTarget(i.targetId)||await Wa(r.localStore,i.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(i.targetId),t&&Lc(r.remoteStore,i.targetId),Ga(r,i.targetId)}).catch($i)):(Ga(r,i.targetId),await Wa(r.localStore,i.targetId,!0))}async function WT(n,e){const t=ae(n),r=t.Fa.get(e),i=t.Ma.get(r.targetId);t.isPrimaryClient&&i.length===1&&(t.sharedClientState.removeLocalQueryTarget(r.targetId),Lc(t.remoteStore,r.targetId))}async function KT(n,e,t){const r=eI(n);try{const i=await function(a,c){const u=ae(a),d=Le.now(),f=c.reduce((S,V)=>S.add(V.key),ue());let g,I;return u.persistence.runTransaction("Locally write mutations","readwrite",S=>{let V=tn(),U=ue();return u.cs.getEntries(S,f).next(B=>{V=B,V.forEach((K,J)=>{J.isValidDocument()||(U=U.add(K))})}).next(()=>u.localDocuments.getOverlayedDocuments(S,V)).next(B=>{g=B;const K=[];for(const J of c){const O=dE(J,g.get(J.key).overlayedDocument);O!=null&&K.push(new ir(J.key,O,nf(O.value.mapValue),Jt.exists(!0)))}return u.mutationQueue.addMutationBatch(S,d,K,c)}).next(B=>{I=B;const K=B.applyToLocalDocumentSet(g,U);return u.documentOverlayCache.saveOverlays(S,B.batchId,K)})}).then(()=>({batchId:I.batchId,changes:pf(g)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(i.batchId),function(a,c,u){let d=a.Ba[a.currentUser.toKey()];d||(d=new Se(me)),d=d.insert(c,u),a.Ba[a.currentUser.toKey()]=d}(r,i.batchId,t),await Ki(r,i.changes),await Ao(r.remoteStore)}catch(i){const s=$c(i,"Failed to persist write");t.reject(s)}}async function Kf(n,e){const t=ae(n);try{const r=await sT(t.localStore,e);e.targetChanges.forEach((i,s)=>{const a=t.Na.get(s);a&&(Ee(i.addedDocuments.size+i.modifiedDocuments.size+i.removedDocuments.size<=1),i.addedDocuments.size>0?a.va=!0:i.modifiedDocuments.size>0?Ee(a.va):i.removedDocuments.size>0&&(Ee(a.va),a.va=!1))}),await Ki(t,r,e)}catch(r){await $i(r)}}function ah(n,e,t){const r=ae(n);if(r.isPrimaryClient&&t===0||!r.isPrimaryClient&&t===1){const i=[];r.Fa.forEach((s,a)=>{const c=a.view.Z_(e);c.snapshot&&i.push(c.snapshot)}),function(a,c){const u=ae(a);u.onlineState=c;let d=!1;u.queries.forEach((f,g)=>{for(const I of g.j_)I.Z_(c)&&(d=!0)}),d&&qc(u)}(r.eventManager,e),i.length&&r.Ca.d_(i),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function GT(n,e,t){const r=ae(n);r.sharedClientState.updateQueryState(e,"rejected",t);const i=r.Na.get(e),s=i&&i.key;if(s){let a=new Se(ee.comparator);a=a.insert(s,tt.newNoDocument(s,se.min()));const c=ue().add(s),u=new To(se.min(),new Map,new Se(me),a,c);await Kf(r,u),r.Oa=r.Oa.remove(s),r.Na.delete(e),Hc(r)}else await Wa(r.localStore,e,!1).then(()=>Ga(r,e,t)).catch($i)}async function QT(n,e){const t=ae(n),r=e.batch.batchId;try{const i=await iT(t.localStore,e);Qf(t,r,null),Gf(t,r),t.sharedClientState.updateMutationState(r,"acknowledged"),await Ki(t,i)}catch(i){await $i(i)}}async function JT(n,e,t){const r=ae(n);try{const i=await function(a,c){const u=ae(a);return u.persistence.runTransaction("Reject batch","readwrite-primary",d=>{let f;return u.mutationQueue.lookupMutationBatch(d,c).next(g=>(Ee(g!==null),f=g.keys(),u.mutationQueue.removeMutationBatch(d,g))).next(()=>u.mutationQueue.performConsistencyCheck(d)).next(()=>u.documentOverlayCache.removeOverlaysForBatchId(d,f,c)).next(()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,f)).next(()=>u.localDocuments.getDocuments(d,f))})}(r.localStore,e);Qf(r,e,t),Gf(r,e),r.sharedClientState.updateMutationState(e,"rejected",t),await Ki(r,i)}catch(i){await $i(i)}}function Gf(n,e){(n.ka.get(e)||[]).forEach(t=>{t.resolve()}),n.ka.delete(e)}function Qf(n,e,t){const r=ae(n);let i=r.Ba[r.currentUser.toKey()];if(i){const s=i.get(e);s&&(t?s.reject(t):s.resolve(),i=i.remove(e)),r.Ba[r.currentUser.toKey()]=i}}function Ga(n,e,t=null){n.sharedClientState.removeLocalQueryTarget(e);for(const r of n.Ma.get(e))n.Fa.delete(r),t&&n.Ca.$a(r,t);n.Ma.delete(e),n.isPrimaryClient&&n.La.gr(e).forEach(r=>{n.La.containsKey(r)||Jf(n,r)})}function Jf(n,e){n.xa.delete(e.path.canonicalString());const t=n.Oa.get(e);t!==null&&(Lc(n.remoteStore,t),n.Oa=n.Oa.remove(e),n.Na.delete(t),Hc(n))}function ch(n,e,t){for(const r of t)r instanceof Hf?(n.La.addReference(r.key,e),YT(n,r)):r instanceof zf?(G("SyncEngine","Document no longer in limbo: "+r.key),n.La.removeReference(r.key,e),n.La.containsKey(r.key)||Jf(n,r.key)):ie()}function YT(n,e){const t=e.key,r=t.path.canonicalString();n.Oa.get(t)||n.xa.has(r)||(G("SyncEngine","New document in limbo: "+t),n.xa.add(r),Hc(n))}function Hc(n){for(;n.xa.size>0&&n.Oa.size<n.maxConcurrentLimboResolutions;){const e=n.xa.values().next().value;n.xa.delete(e);const t=new ee(be.fromString(e)),r=n.qa.next();n.Na.set(r,new BT(t)),n.Oa=n.Oa.insert(t,r),Ff(n.remoteStore,new Tn(Ot(uf(t.path)),r,"TargetPurposeLimboResolution",Ac.oe))}}async function Ki(n,e,t){const r=ae(n),i=[],s=[],a=[];r.Fa.isEmpty()||(r.Fa.forEach((c,u)=>{a.push(r.Ka(u,e,t).then(d=>{var f;if((d||t)&&r.isPrimaryClient){const g=d?!d.fromCache:(f=t==null?void 0:t.targetChanges.get(u.targetId))===null||f===void 0?void 0:f.current;r.sharedClientState.updateQueryState(u.targetId,g?"current":"not-current")}if(d){i.push(d);const g=Mc.Wi(u.targetId,d);s.push(g)}}))}),await Promise.all(a),r.Ca.d_(i),await async function(u,d){const f=ae(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",g=>N.forEach(d,I=>N.forEach(I.$i,S=>f.persistence.referenceDelegate.addReference(g,I.targetId,S)).next(()=>N.forEach(I.Ui,S=>f.persistence.referenceDelegate.removeReference(g,I.targetId,S)))))}catch(g){if(!qi(g))throw g;G("LocalStore","Failed to update sequence numbers: "+g)}for(const g of d){const I=g.targetId;if(!g.fromCache){const S=f.os.get(I),V=S.snapshotVersion,U=S.withLastLimboFreeSnapshotVersion(V);f.os=f.os.insert(I,U)}}}(r.localStore,s))}async function XT(n,e){const t=ae(n);if(!t.currentUser.isEqual(e)){G("SyncEngine","User change. New user:",e.toKey());const r=await Nf(t.localStore,e);t.currentUser=e,function(s,a){s.ka.forEach(c=>{c.forEach(u=>{u.reject(new Z(M.CANCELLED,a))})}),s.ka.clear()}(t,"'waitForPendingWrites' promise is rejected due to a user change."),t.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Ki(t,r.hs)}}function ZT(n,e){const t=ae(n),r=t.Na.get(e);if(r&&r.va)return ue().add(r.key);{let i=ue();const s=t.Ma.get(e);if(!s)return i;for(const a of s){const c=t.Fa.get(a);i=i.unionWith(c.view.Va)}return i}}function Yf(n){const e=ae(n);return e.remoteStore.remoteSyncer.applyRemoteEvent=Kf.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=ZT.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=GT.bind(null,e),e.Ca.d_=xT.bind(null,e.eventManager),e.Ca.$a=MT.bind(null,e.eventManager),e}function eI(n){const e=ae(n);return e.remoteStore.remoteSyncer.applySuccessfulWrite=QT.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=JT.bind(null,e),e}class Ys{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Io(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,t){return null}Ha(e,t){return null}za(e){return rT(this.persistence,new tT,e.initialUser,this.serializer)}Ga(e){return new XE(xc.Zr,this.serializer)}Wa(e){return new uT}async terminate(){var e,t;(e=this.gcScheduler)===null||e===void 0||e.stop(),(t=this.indexBackfillerScheduler)===null||t===void 0||t.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Ys.provider={build:()=>new Ys};class Qa{async initialize(e,t){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(t),this.remoteStore=this.createRemoteStore(t),this.eventManager=this.createEventManager(t),this.syncEngine=this.createSyncEngine(t,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>ah(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=XT.bind(null,this.syncEngine),await kT(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new VT}()}createDatastore(e){const t=Io(e.databaseInfo.databaseId),r=function(s){return new pT(s)}(e.databaseInfo);return function(s,a,c,u){return new _T(s,a,c,u)}(e.authCredentials,e.appCheckCredentials,r,t)}createRemoteStore(e){return function(r,i,s,a,c){return new vT(r,i,s,a,c)}(this.localStore,this.datastore,e.asyncQueue,t=>ah(this.syncEngine,t,0),function(){return nh.D()?new nh:new hT}())}createSyncEngine(e,t){return function(i,s,a,c,u,d,f){const g=new jT(i,s,a,c,u,d);return f&&(g.Qa=!0),g}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,t)}async terminate(){var e,t;await async function(i){const s=ae(i);G("RemoteStore","RemoteStore shutting down."),s.L_.add(5),await Wi(s),s.k_.shutdown(),s.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(t=this.eventManager)===null||t===void 0||t.terminate()}}Qa.provider={build:()=>new Qa};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class tI{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):en("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,t){setTimeout(()=>{this.muted||e(t)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nI{constructor(e,t,r,i,s){this.authCredentials=e,this.appCheckCredentials=t,this.asyncQueue=r,this.databaseInfo=i,this.user=Ze.UNAUTHENTICATED,this.clientId=Zd.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(r,async a=>{G("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(G("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Sn;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(t){const r=$c(t,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function _a(n,e){n.asyncQueue.verifyOperationInProgress(),G("FirestoreClient","Initializing OfflineComponentProvider");const t=n.configuration;await e.initialize(t);let r=t.initialUser;n.setCredentialChangeListener(async i=>{r.isEqual(i)||(await Nf(e.localStore,i),r=i)}),e.persistence.setDatabaseDeletedListener(()=>n.terminate()),n._offlineComponents=e}async function lh(n,e){n.asyncQueue.verifyOperationInProgress();const t=await rI(n);G("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(t,n.configuration),n.setCredentialChangeListener(r=>rh(e.remoteStore,r)),n.setAppCheckTokenChangeListener((r,i)=>rh(e.remoteStore,i)),n._onlineComponents=e}async function rI(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){G("FirestoreClient","Using user provided OfflineComponentProvider");try{await _a(n,n._uninitializedComponentsProvider._offline)}catch(e){const t=e;if(!function(i){return i.name==="FirebaseError"?i.code===M.FAILED_PRECONDITION||i.code===M.UNIMPLEMENTED:!(typeof DOMException<"u"&&i instanceof DOMException)||i.code===22||i.code===20||i.code===11}(t))throw t;Dr("Error using user provided cache. Falling back to memory cache: "+t),await _a(n,new Ys)}}else G("FirestoreClient","Using default OfflineComponentProvider"),await _a(n,new Ys);return n._offlineComponents}async function Xf(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(G("FirestoreClient","Using user provided OnlineComponentProvider"),await lh(n,n._uninitializedComponentsProvider._online)):(G("FirestoreClient","Using default OnlineComponentProvider"),await lh(n,new Qa))),n._onlineComponents}function iI(n){return Xf(n).then(e=>e.syncEngine)}async function sI(n){const e=await Xf(n),t=e.eventManager;return t.onListen=$T.bind(null,e.syncEngine),t.onUnlisten=zT.bind(null,e.syncEngine),t.onFirstRemoteStoreListen=qT.bind(null,e.syncEngine),t.onLastRemoteStoreUnlisten=WT.bind(null,e.syncEngine),t}function oI(n,e,t={}){const r=new Sn;return n.asyncQueue.enqueueAndForget(async()=>function(s,a,c,u,d){const f=new tI({next:I=>{f.Za(),a.enqueueAndForget(()=>NT(s,g)),I.fromCache&&u.source==="server"?d.reject(new Z(M.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(I)},error:I=>d.reject(I)}),g=new LT(c,f,{includeMetadataChanges:!0,_a:!0});return OT(s,g)}(await sI(n),n.asyncQueue,e,t,r)),r.promise}/**
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
 */function Zf(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uh=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ep(n,e,t){if(!t)throw new Z(M.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${e}.`)}function aI(n,e,t,r){if(e===!0&&r===!0)throw new Z(M.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function hh(n){if(!ee.isDocumentKey(n))throw new Z(M.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function dh(n){if(ee.isDocumentKey(n))throw new Z(M.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function zc(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":ie()}function Mi(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new Z(M.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=zc(n);throw new Z(M.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fh{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new Z(M.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(t=e.ssl)===null||t===void 0||t;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new Z(M.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}aI("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Zf((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(s){if(s.timeoutSeconds!==void 0){if(isNaN(s.timeoutSeconds))throw new Z(M.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (must not be NaN)`);if(s.timeoutSeconds<5)throw new Z(M.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (minimum allowed value is 5)`);if(s.timeoutSeconds>30)throw new Z(M.INVALID_ARGUMENT,`invalid long polling timeout: ${s.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,i){return r.timeoutSeconds===i.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class bo{constructor(e,t,r,i){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=i,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new fh({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new Z(M.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new Z(M.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new fh(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Ev;switch(r.type){case"firstParty":return new Av(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new Z(M.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(t){const r=uh.get(t);r&&(G("ComponentProvider","Removing Datastore"),uh.delete(t),r.terminate())}(this),Promise.resolve()}}function cI(n,e,t,r={}){var i;const s=(n=Mi(n,bo))._getSettings(),a=`${e}:${t}`;if(s.host!=="firestore.googleapis.com"&&s.host!==a&&Dr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),n._setSettings(Object.assign(Object.assign({},s),{host:a,ssl:!1})),r.mockUserToken){let c,u;if(typeof r.mockUserToken=="string")c=r.mockUserToken,u=Ze.MOCK_USER;else{c=G_(r.mockUserToken,(i=n._app)===null||i===void 0?void 0:i.options.projectId);const d=r.mockUserToken.sub||r.mockUserToken.user_id;if(!d)throw new Z(M.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");u=new Ze(d)}n._authCredentials=new Tv(new Xd(c,u))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ro{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Ro(this.firestore,e,this._query)}}class vt{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Pn(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new vt(this.firestore,e,this._key)}}class Pn extends Ro{constructor(e,t,r){super(e,t,uf(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new vt(this.firestore,null,new ee(e))}withConverter(e){return new Pn(this.firestore,e,this._path)}}function So(n,e,...t){if(n=St(n),ep("collection","path",e),n instanceof bo){const r=be.fromString(e,...t);return dh(r),new Pn(n,null,r)}{if(!(n instanceof vt||n instanceof Pn))throw new Z(M.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(be.fromString(e,...t));return dh(r),new Pn(n.firestore,null,r)}}function tp(n,e,...t){if(n=St(n),arguments.length===1&&(e=Zd.newId()),ep("doc","path",e),n instanceof bo){const r=be.fromString(e,...t);return hh(r),new vt(n,null,new ee(r))}{if(!(n instanceof vt||n instanceof Pn))throw new Z(M.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(be.fromString(e,...t));return hh(r),new vt(n.firestore,n instanceof Pn?n.converter:null,new ee(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ph{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new Mf(this,"async_queue_retry"),this.Vu=()=>{const r=ma();r&&G("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const t=ma();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const t=ma();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const t=new Sn;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(t.resolve,t.reject),t.promise)).then(()=>t.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!qi(e))throw e;G("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const t=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const i=function(a){let c=a.message||"";return a.stack&&(c=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),c}(r);throw en("INTERNAL UNHANDLED ERROR: ",i),r}).then(r=>(this.du=!1,r))));return this.mu=t,t}enqueueAfterDelay(e,t,r){this.fu(),this.Ru.indexOf(e)>-1&&(t=0);const i=jc.createAndSchedule(this,e,t,r,s=>this.yu(s));return this.Tu.push(i),i}fu(){this.Eu&&ie()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const t of this.Tu)if(t.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((t,r)=>t.targetTimeMs-r.targetTimeMs);for(const t of this.Tu)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const t=this.Tu.indexOf(e);this.Tu.splice(t,1)}}class Wc extends bo{constructor(e,t,r,i){super(e,t,r,i),this.type="firestore",this._queue=new ph,this._persistenceKey=(i==null?void 0:i.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new ph(e),this._firestoreClient=void 0,await e}}}function lI(n,e){const t=typeof n=="object"?n:qd(),r=typeof n=="string"?n:e||"(default)",i=Ic(t,"firestore").getImmediate({identifier:r});if(!i._initialized){const s=W_("firestore");s&&cI(i,...s)}return i}function np(n){if(n._terminated)throw new Z(M.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||uI(n),n._firestoreClient}function uI(n){var e,t,r;const i=n._freezeSettings(),s=function(c,u,d,f){return new Lv(c,u,d,f.host,f.ssl,f.experimentalForceLongPolling,f.experimentalAutoDetectLongPolling,Zf(f.experimentalLongPollingOptions),f.useFetchStreams)}(n._databaseId,((e=n._app)===null||e===void 0?void 0:e.options.appId)||"",n._persistenceKey,i);n._componentsProvider||!((t=i.localCache)===null||t===void 0)&&t._offlineComponentProvider&&(!((r=i.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:i.localCache._offlineComponentProvider,_online:i.localCache._onlineComponentProvider}),n._firestoreClient=new nI(n._authCredentials,n._appCheckCredentials,n._queue,s,n._componentsProvider&&function(c){const u=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(u),_online:u}}(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Lr{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Lr(Ge.fromBase64String(e))}catch(t){throw new Z(M.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Lr(Ge.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kc{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new Z(M.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ze(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rp{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gc{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new Z(M.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new Z(M.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return me(this._lat,e._lat)||me(this._long,e._long)}}/**
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
 */class Qc{constructor(e){this._values=(e||[]).map(t=>t)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,i){if(r.length!==i.length)return!1;for(let s=0;s<r.length;++s)if(r[s]!==i[s])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const hI=/^__.*__$/;class dI{constructor(e,t,r){this.data=e,this.fieldMask=t,this.fieldTransforms=r}toMutation(e,t){return this.fieldMask!==null?new ir(e,this.data,this.fieldMask,t,this.fieldTransforms):new Hi(e,this.data,t,this.fieldTransforms)}}function ip(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw ie()}}class Jc{constructor(e,t,r,i,s,a){this.settings=e,this.databaseId=t,this.serializer=r,this.ignoreUndefinedProperties=i,s===void 0&&this.vu(),this.fieldTransforms=s||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new Jc(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.Fu({path:r,xu:!1});return i.Ou(e),i}Nu(e){var t;const r=(t=this.path)===null||t===void 0?void 0:t.child(e),i=this.Fu({path:r,xu:!1});return i.vu(),i}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return Xs(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(t=>e.isPrefixOf(t))!==void 0||this.fieldTransforms.find(t=>e.isPrefixOf(t.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(ip(this.Cu)&&hI.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class fI{constructor(e,t,r){this.databaseId=e,this.ignoreUndefinedProperties=t,this.serializer=r||Io(e)}Qu(e,t,r,i=!1){return new Jc({Cu:e,methodName:t,qu:r,path:ze.emptyPath(),xu:!1,ku:i},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function pI(n){const e=n._freezeSettings(),t=Io(n._databaseId);return new fI(n._databaseId,!!e.ignoreUndefinedProperties,t)}function gI(n,e,t,r,i,s={}){const a=n.Qu(s.merge||s.mergeFields?2:0,e,t,i);cp("Data must be an object, but it was:",a,r);const c=op(r,a);let u,d;if(s.merge)u=new At(a.fieldMask),d=a.fieldTransforms;else if(s.mergeFields){const f=[];for(const g of s.mergeFields){const I=mI(e,g,t);if(!a.contains(I))throw new Z(M.INVALID_ARGUMENT,`Field '${I}' is specified in your field mask but missing from your input data.`);yI(f,I)||f.push(I)}u=new At(f),d=a.fieldTransforms.filter(g=>u.covers(g.field))}else u=null,d=a.fieldTransforms;return new dI(new _t(c),u,d)}function sp(n,e){if(ap(n=St(n)))return cp("Unsupported field value:",e,n),op(n,e);if(n instanceof rp)return function(r,i){if(!ip(i.Cu))throw i.Bu(`${r._methodName}() can only be used with update() and set()`);if(!i.path)throw i.Bu(`${r._methodName}() is not currently supported inside arrays`);const s=r._toFieldTransform(i);s&&i.fieldTransforms.push(s)}(n,e),null;if(n===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),n instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,i){const s=[];let a=0;for(const c of r){let u=sp(c,i.Lu(a));u==null&&(u={nullValue:"NULL_VALUE"}),s.push(u),a++}return{arrayValue:{values:s}}}(n,e)}return function(r,i){if((r=St(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return oE(i.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const s=Le.fromDate(r);return{timestampValue:Qs(i.serializer,s)}}if(r instanceof Le){const s=new Le(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:Qs(i.serializer,s)}}if(r instanceof Gc)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Lr)return{bytesValue:Sf(i.serializer,r._byteString)};if(r instanceof vt){const s=i.databaseId,a=r.firestore._databaseId;if(!a.isEqual(s))throw i.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:Oc(r.firestore._databaseId||i.databaseId,r._key.path)}}if(r instanceof Qc)return function(a,c){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(u=>{if(typeof u!="number")throw c.Bu("VectorValues must only contain numeric values.");return kc(c.serializer,u)})}}}}}}(r,i);throw i.Bu(`Unsupported field value: ${zc(r)}`)}(n,e)}function op(n,e){const t={};return ef(n)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Br(n,(r,i)=>{const s=sp(i,e.Mu(r));s!=null&&(t[r]=s)}),{mapValue:{fields:t}}}function ap(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof Le||n instanceof Gc||n instanceof Lr||n instanceof vt||n instanceof rp||n instanceof Qc)}function cp(n,e,t){if(!ap(t)||!function(i){return typeof i=="object"&&i!==null&&(Object.getPrototypeOf(i)===Object.prototype||Object.getPrototypeOf(i)===null)}(t)){const r=zc(t);throw r==="an object"?e.Bu(n+" a custom object"):e.Bu(n+" "+r)}}function mI(n,e,t){if((e=St(e))instanceof Kc)return e._internalPath;if(typeof e=="string")return lp(n,e);throw Xs("Field path arguments must be of type string or ",n,!1,void 0,t)}const _I=new RegExp("[~\\*/\\[\\]]");function lp(n,e,t){if(e.search(_I)>=0)throw Xs(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,t);try{return new Kc(...e.split("."))._internalPath}catch{throw Xs(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,t)}}function Xs(n,e,t,r,i){const s=r&&!r.isEmpty(),a=i!==void 0;let c=`Function ${e}() called with invalid data`;t&&(c+=" (via `toFirestore()`)"),c+=". ";let u="";return(s||a)&&(u+=" (found",s&&(u+=` in field ${r}`),a&&(u+=` in document ${i}`),u+=")"),new Z(M.INVALID_ARGUMENT,c+n+u)}function yI(n,e){return n.some(t=>t.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class up{constructor(e,t,r,i,s){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=i,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new vt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new vI(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(hp("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class vI extends up{data(){return super.data()}}function hp(n,e){return typeof e=="string"?lp(n,e):e instanceof Kc?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function EI(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new Z(M.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class TI{convertValue(e,t="none"){switch(tr(e)){case 0:return null;case 1:return e.booleanValue;case 2:return Ce(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,t);case 5:return e.stringValue;case 6:return this.convertBytes(er(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,t);case 11:return this.convertObject(e.mapValue,t);case 10:return this.convertVectorValue(e.mapValue);default:throw ie()}}convertObject(e,t){return this.convertObjectMap(e.fields,t)}convertObjectMap(e,t="none"){const r={};return Br(e,(i,s)=>{r[i]=this.convertValue(s,t)}),r}convertVectorValue(e){var t,r,i;const s=(i=(r=(t=e.fields)===null||t===void 0?void 0:t.value.arrayValue)===null||r===void 0?void 0:r.values)===null||i===void 0?void 0:i.map(a=>Ce(a.doubleValue));return new Qc(s)}convertGeoPoint(e){return new Gc(Ce(e.latitude),Ce(e.longitude))}convertArray(e,t){return(e.values||[]).map(r=>this.convertValue(r,t))}convertServerTimestamp(e,t){switch(t){case"previous":const r=Rc(e);return r==null?null:this.convertValue(r,t);case"estimate":return this.convertTimestamp(Di(e));default:return null}}convertTimestamp(e){const t=On(e);return new Le(t.seconds,t.nanos)}convertDocumentKey(e,t){const r=be.fromString(e);Ee(Of(r));const i=new Vi(r.get(1),r.get(3)),s=new ee(r.popFirst(5));return i.isEqual(t)||en(`Document ${s} contains a document reference within a different database (${i.projectId}/${i.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function II(n,e,t){let r;return r=n?t&&(t.merge||t.mergeFields)?n.toFirestore(e,t):n.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ts{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class wI extends up{constructor(e,t,r,i,s,a){super(e,t,r,i,a),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new ks(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(hp("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}}class ks extends wI{data(e={}){return super.data(e)}}class AI{constructor(e,t,r,i){this._firestore=e,this._userDataWriter=t,this._snapshot=i,this.metadata=new Ts(i.hasPendingWrites,i.fromCache),this.query=r}get docs(){const e=[];return this.forEach(t=>e.push(t)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach(r=>{e.call(t,new ks(this._firestore,this._userDataWriter,r.key,r,new Ts(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new Z(M.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=function(i,s){if(i._snapshot.oldDocs.isEmpty()){let a=0;return i._snapshot.docChanges.map(c=>{const u=new ks(i._firestore,i._userDataWriter,c.doc.key,c.doc,new Ts(i._snapshot.mutatedKeys.has(c.doc.key),i._snapshot.fromCache),i.query.converter);return c.doc,{type:"added",doc:u,oldIndex:-1,newIndex:a++}})}{let a=i._snapshot.oldDocs;return i._snapshot.docChanges.filter(c=>s||c.type!==3).map(c=>{const u=new ks(i._firestore,i._userDataWriter,c.doc.key,c.doc,new Ts(i._snapshot.mutatedKeys.has(c.doc.key),i._snapshot.fromCache),i.query.converter);let d=-1,f=-1;return c.type!==0&&(d=a.indexOf(c.doc.key),a=a.delete(c.doc.key)),c.type!==1&&(a=a.add(c.doc),f=a.indexOf(c.doc.key)),{type:bI(c.type),doc:u,oldIndex:d,newIndex:f}})}}(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}}function bI(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return ie()}}class RI extends TI{constructor(e){super(),this.firestore=e}convertBytes(e){return new Lr(e)}convertReference(e){const t=this.convertDocumentKey(e,this.firestore._databaseId);return new vt(this.firestore,null,t)}}function Po(n){n=Mi(n,Ro);const e=Mi(n.firestore,Wc),t=np(e),r=new RI(e);return EI(n._query),oI(t,n._query).then(i=>new AI(e,r,n,i))}function dp(n,e,t){n=Mi(n,vt);const r=Mi(n.firestore,Wc),i=II(n.converter,e,t);return SI(r,[gI(pI(r),"setDoc",n._key,i,n.converter!==null,t).toMutation(n._key,Jt.none())])}function SI(n,e){return function(r,i){const s=new Sn;return r.asyncQueue.enqueueAndForget(async()=>KT(await iI(r),i,s)),s.promise}(np(n),e)}(function(e,t=!0){(function(i){Ur=i})(Fr),kr(new Xn("firestore",(r,{instanceIdentifier:i,options:s})=>{const a=r.getProvider("app").getImmediate(),c=new Wc(new Iv(r.getProvider("auth-internal")),new Rv(r.getProvider("app-check-internal")),function(d,f){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new Z(M.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Vi(d.options.projectId,f)}(a,i),a);return s=Object.assign({useFetchStreams:t},s),c._setSettings(s),c},"PUBLIC").setMultipleInstances(!0)),Rn(Ou,"4.7.3",e),Rn(Ou,"4.7.3","esm2017")})();function Yc(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,r=Object.getOwnPropertySymbols(n);i<r.length;i++)e.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(n,r[i])&&(t[r[i]]=n[r[i]]);return t}function fp(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const PI=fp,pp=new Bi("auth","Firebase",fp());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zs=new Ec("@firebase/auth");function CI(n,...e){Zs.logLevel<=he.WARN&&Zs.warn(`Auth (${Fr}): ${n}`,...e)}function Ds(n,...e){Zs.logLevel<=he.ERROR&&Zs.error(`Auth (${Fr}): ${n}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nn(n,...e){throw Xc(n,...e)}function xt(n,...e){return Xc(n,...e)}function gp(n,e,t){const r=Object.assign(Object.assign({},PI()),{[e]:t});return new Bi("auth","Firebase",r).create(e,{appName:n.name})}function Cn(n){return gp(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Xc(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return pp.create(n,...e)}function re(n,e,...t){if(!n)throw Xc(e,...t)}function Kt(n){const e="INTERNAL ASSERTION FAILED: "+n;throw Ds(e),new Error(e)}function rn(n,e){n||Kt(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ja(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function kI(){return gh()==="http:"||gh()==="https:"}function gh(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function DI(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(kI()||X_()||"connection"in navigator)?navigator.onLine:!0}function VI(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gi{constructor(e,t){this.shortDelay=e,this.longDelay=t,rn(t>e,"Short delay should be less than long delay!"),this.isMobile=Q_()||Z_()}get(){return DI()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zc(n,e){rn(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mp{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Kt("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Kt("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Kt("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const OI={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const NI=new Gi(3e4,6e4);function Co(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function qr(n,e,t,r,i={}){return _p(n,i,async()=>{let s={},a={};r&&(e==="GET"?a=r:s={body:JSON.stringify(r)});const c=ji(Object.assign({key:n.config.apiKey},a)).slice(1),u=await n._getAdditionalHeaders();u["Content-Type"]="application/json",n.languageCode&&(u["X-Firebase-Locale"]=n.languageCode);const d=Object.assign({method:e,headers:u},s);return Y_()||(d.referrerPolicy="no-referrer"),mp.fetch()(vp(n,n.config.apiHost,t,c),d)})}async function _p(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},OI),e);try{const i=new xI(n),s=await Promise.race([t(),i.promise]);i.clearNetworkTimeout();const a=await s.json();if("needConfirmation"in a)throw Is(n,"account-exists-with-different-credential",a);if(s.ok&&!("errorMessage"in a))return a;{const c=s.ok?a.errorMessage:a.error.message,[u,d]=c.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Is(n,"credential-already-in-use",a);if(u==="EMAIL_EXISTS")throw Is(n,"email-already-in-use",a);if(u==="USER_DISABLED")throw Is(n,"user-disabled",a);const f=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(d)throw gp(n,f,d);nn(n,f)}}catch(i){if(i instanceof on)throw i;nn(n,"network-request-failed",{message:String(i)})}}async function yp(n,e,t,r,i={}){const s=await qr(n,e,t,r,i);return"mfaPendingCredential"in s&&nn(n,"multi-factor-auth-required",{_serverResponse:s}),s}function vp(n,e,t,r){const i=`${e}${t}?${r}`;return n.config.emulator?Zc(n.config,i):`${n.config.apiScheme}://${i}`}class xI{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(xt(this.auth,"network-request-failed")),NI.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function Is(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const i=xt(n,e,r);return i.customData._tokenResponse=t,i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function MI(n,e){return qr(n,"POST","/v1/accounts:delete",e)}async function Ep(n,e){return qr(n,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function wi(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function LI(n,e=!1){const t=St(n),r=await t.getIdToken(e),i=el(r);re(i&&i.exp&&i.auth_time&&i.iat,t.auth,"internal-error");const s=typeof i.firebase=="object"?i.firebase:void 0,a=s==null?void 0:s.sign_in_provider;return{claims:i,token:r,authTime:wi(ya(i.auth_time)),issuedAtTime:wi(ya(i.iat)),expirationTime:wi(ya(i.exp)),signInProvider:a||null,signInSecondFactor:(s==null?void 0:s.sign_in_second_factor)||null}}function ya(n){return Number(n)*1e3}function el(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return Ds("JWT malformed, contained fewer than 3 sections"),null;try{const i=Md(t);return i?JSON.parse(i):(Ds("Failed to decode base64 JWT payload"),null)}catch(i){return Ds("Caught error parsing JWT payload as JSON",i==null?void 0:i.toString()),null}}function mh(n){const e=el(n);return re(e,"internal-error"),re(typeof e.exp<"u","internal-error"),re(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Li(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof on&&FI(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function FI({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class UI{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const i=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,i)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ya{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=wi(this.lastLoginAt),this.creationTime=wi(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function eo(n){var e;const t=n.auth,r=await n.getIdToken(),i=await Li(n,Ep(t,{idToken:r}));re(i==null?void 0:i.users.length,t,"internal-error");const s=i.users[0];n._notifyReloadListener(s);const a=!((e=s.providerUserInfo)===null||e===void 0)&&e.length?Tp(s.providerUserInfo):[],c=jI(n.providerData,a),u=n.isAnonymous,d=!(n.email&&s.passwordHash)&&!(c!=null&&c.length),f=u?d:!1,g={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:c,metadata:new Ya(s.createdAt,s.lastLoginAt),isAnonymous:f};Object.assign(n,g)}async function BI(n){const e=St(n);await eo(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function jI(n,e){return[...n.filter(r=>!e.some(i=>i.providerId===r.providerId)),...e]}function Tp(n){return n.map(e=>{var{providerId:t}=e,r=Yc(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $I(n,e){const t=await _p(n,{},async()=>{const r=ji({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:i,apiKey:s}=n.config,a=vp(n,i,"/v1/token",`key=${s}`),c=await n._getAdditionalHeaders();return c["Content-Type"]="application/x-www-form-urlencoded",mp.fetch()(a,{method:"POST",headers:c,body:r})});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function qI(n,e){return qr(n,"POST","/v2/accounts:revokeToken",Co(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class br{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){re(e.idToken,"internal-error"),re(typeof e.idToken<"u","internal-error"),re(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):mh(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){re(e.length!==0,"internal-error");const t=mh(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(re(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:i,expiresIn:s}=await $I(e,t);this.updateTokensAndExpiration(r,i,Number(s))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:i,expirationTime:s}=t,a=new br;return r&&(re(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),i&&(re(typeof i=="string","internal-error",{appName:e}),a.accessToken=i),s&&(re(typeof s=="number","internal-error",{appName:e}),a.expirationTime=s),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new br,this.toJSON())}_performRefresh(){return Kt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fn(n,e){re(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class Gt{constructor(e){var{uid:t,auth:r,stsTokenManager:i}=e,s=Yc(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new UI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=i,this.accessToken=i.accessToken,this.displayName=s.displayName||null,this.email=s.email||null,this.emailVerified=s.emailVerified||!1,this.phoneNumber=s.phoneNumber||null,this.photoURL=s.photoURL||null,this.isAnonymous=s.isAnonymous||!1,this.tenantId=s.tenantId||null,this.providerData=s.providerData?[...s.providerData]:[],this.metadata=new Ya(s.createdAt||void 0,s.lastLoginAt||void 0)}async getIdToken(e){const t=await Li(this,this.stsTokenManager.getToken(this.auth,e));return re(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return LI(this,e)}reload(){return BI(this)}_assign(e){this!==e&&(re(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new Gt(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){re(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await eo(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Wt(this.auth.app))return Promise.reject(Cn(this.auth));const e=await this.getIdToken();return await Li(this,MI(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,i,s,a,c,u,d,f;const g=(r=t.displayName)!==null&&r!==void 0?r:void 0,I=(i=t.email)!==null&&i!==void 0?i:void 0,S=(s=t.phoneNumber)!==null&&s!==void 0?s:void 0,V=(a=t.photoURL)!==null&&a!==void 0?a:void 0,U=(c=t.tenantId)!==null&&c!==void 0?c:void 0,B=(u=t._redirectEventId)!==null&&u!==void 0?u:void 0,K=(d=t.createdAt)!==null&&d!==void 0?d:void 0,J=(f=t.lastLoginAt)!==null&&f!==void 0?f:void 0,{uid:O,emailVerified:k,isAnonymous:j,providerData:X,stsTokenManager:T}=t;re(O&&T,e,"internal-error");const m=br.fromJSON(this.name,T);re(typeof O=="string",e,"internal-error"),fn(g,e.name),fn(I,e.name),re(typeof k=="boolean",e,"internal-error"),re(typeof j=="boolean",e,"internal-error"),fn(S,e.name),fn(V,e.name),fn(U,e.name),fn(B,e.name),fn(K,e.name),fn(J,e.name);const _=new Gt({uid:O,auth:e,email:I,emailVerified:k,displayName:g,isAnonymous:j,photoURL:V,phoneNumber:S,tenantId:U,stsTokenManager:m,createdAt:K,lastLoginAt:J});return X&&Array.isArray(X)&&(_.providerData=X.map(E=>Object.assign({},E))),B&&(_._redirectEventId=B),_}static async _fromIdTokenResponse(e,t,r=!1){const i=new br;i.updateFromServerResponse(t);const s=new Gt({uid:t.localId,auth:e,stsTokenManager:i,isAnonymous:r});return await eo(s),s}static async _fromGetAccountInfoResponse(e,t,r){const i=t.users[0];re(i.localId!==void 0,"internal-error");const s=i.providerUserInfo!==void 0?Tp(i.providerUserInfo):[],a=!(i.email&&i.passwordHash)&&!(s!=null&&s.length),c=new br;c.updateFromIdToken(r);const u=new Gt({uid:i.localId,auth:e,stsTokenManager:c,isAnonymous:a}),d={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:s,metadata:new Ya(i.createdAt,i.lastLoginAt),isAnonymous:!(i.email&&i.passwordHash)&&!(s!=null&&s.length)};return Object.assign(u,d),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _h=new Map;function Qt(n){rn(n instanceof Function,"Expected a class definition");let e=_h.get(n);return e?(rn(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,_h.set(n,e),e)}/**
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
 */class Ip{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Ip.type="NONE";const yh=Ip;/**
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
 */function Vs(n,e,t){return`firebase:${n}:${e}:${t}`}class Rr{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:i,name:s}=this.auth;this.fullUserKey=Vs(this.userKey,i.apiKey,s),this.fullPersistenceKey=Vs("persistence",i.apiKey,s),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?Gt._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new Rr(Qt(yh),e,r);const i=(await Promise.all(t.map(async d=>{if(await d._isAvailable())return d}))).filter(d=>d);let s=i[0]||Qt(yh);const a=Vs(r,e.config.apiKey,e.name);let c=null;for(const d of t)try{const f=await d._get(a);if(f){const g=Gt._fromJSON(e,f);d!==s&&(c=g),s=d;break}}catch{}const u=i.filter(d=>d._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new Rr(s,e,r):(s=u[0],c&&await s._set(a,c.toJSON()),await Promise.all(t.map(async d=>{if(d!==s)try{await d._remove(a)}catch{}})),new Rr(s,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function vh(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Rp(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(wp(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Pp(e))return"Blackberry";if(Cp(e))return"Webos";if(Ap(e))return"Safari";if((e.includes("chrome/")||bp(e))&&!e.includes("edge/"))return"Chrome";if(Sp(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function wp(n=rt()){return/firefox\//i.test(n)}function Ap(n=rt()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function bp(n=rt()){return/crios\//i.test(n)}function Rp(n=rt()){return/iemobile/i.test(n)}function Sp(n=rt()){return/android/i.test(n)}function Pp(n=rt()){return/blackberry/i.test(n)}function Cp(n=rt()){return/webos/i.test(n)}function tl(n=rt()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function HI(n=rt()){var e;return tl(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function zI(){return ey()&&document.documentMode===10}function kp(n=rt()){return tl(n)||Sp(n)||Cp(n)||Pp(n)||/windows phone/i.test(n)||Rp(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dp(n,e=[]){let t;switch(n){case"Browser":t=vh(rt());break;case"Worker":t=`${vh(rt())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${Fr}/${r}`}/**
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
 */class WI{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=s=>new Promise((a,c)=>{try{const u=e(s);a(u)}catch(u){c(u)}});r.onAbort=t,this.queue.push(r);const i=this.queue.length-1;return()=>{this.queue[i]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const i of t)try{i()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function KI(n,e={}){return qr(n,"GET","/v2/passwordPolicy",Co(n,e))}/**
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
 */const GI=6;class QI{constructor(e){var t,r,i,s;const a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=a.minPasswordLength)!==null&&t!==void 0?t:GI,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(i=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&i!==void 0?i:"",this.forceUpgradeOnSignin=(s=e.forceUpgradeOnSignin)!==null&&s!==void 0?s:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,i,s,a,c;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(t=u.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),u.isValid&&(u.isValid=(r=u.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(i=u.containsLowercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(s=u.containsUppercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(a=u.containsNumericCharacter)!==null&&a!==void 0?a:!0),u.isValid&&(u.isValid=(c=u.containsNonAlphanumericCharacter)!==null&&c!==void 0?c:!0),u}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,i=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),i&&(t.meetsMaxPasswordLength=e.length<=i)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let i=0;i<e.length;i++)r=e.charAt(i),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,i,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=i)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JI{constructor(e,t,r,i){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=i,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Eh(this),this.idTokenSubscription=new Eh(this),this.beforeStateQueue=new WI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=pp,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=i.sdkClientVersion}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=Qt(t)),this._initializationPromise=this.queue(async()=>{var r,i;if(!this._deleted&&(this.persistenceManager=await Rr.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((i=this.currentUser)===null||i===void 0?void 0:i.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Ep(this,{idToken:e}),r=await Gt._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(Wt(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(c=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(c,c))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let i=r,s=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,c=i==null?void 0:i._redirectEventId,u=await this.tryRedirectSignIn(e);(!a||a===c)&&(u!=null&&u.user)&&(i=u.user,s=!0)}if(!i)return this.directlySetCurrentUser(null);if(!i._redirectEventId){if(s)try{await this.beforeStateQueue.runMiddleware(i)}catch(a){i=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return i?this.reloadAndSetCurrentUserOrClear(i):this.directlySetCurrentUser(null)}return re(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===i._redirectEventId?this.directlySetCurrentUser(i):this.reloadAndSetCurrentUserOrClear(i)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await eo(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=VI()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Wt(this.app))return Promise.reject(Cn(this));const t=e?St(e):null;return t&&re(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&re(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Wt(this.app)?Promise.reject(Cn(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Wt(this.app)?Promise.reject(Cn(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Qt(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await KI(this),t=new QI(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new Bi("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await qI(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&Qt(e)||this._popupRedirectResolver;re(t,this,"argument-error"),this.redirectPersistenceManager=await Rr.create(this,[Qt(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,i){if(this._deleted)return()=>{};const s=typeof t=="function"?t:t.next.bind(t);let a=!1;const c=this._isInitialized?Promise.resolve():this._initializationPromise;if(re(c,this,"internal-error"),c.then(()=>{a||s(this.currentUser)}),typeof t=="function"){const u=e.addObserver(t,r,i);return()=>{a=!0,u()}}else{const u=e.addObserver(t);return()=>{a=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return re(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Dp(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const i=await this._getAppCheckToken();return i&&(t["X-Firebase-AppCheck"]=i),t}async _getAppCheckToken(){var e;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&CI(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function ko(n){return St(n)}class Eh{constructor(e){this.auth=e,this.observer=null,this.addObserver=cy(t=>this.observer=t)}get next(){return re(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let nl={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function YI(n){nl=n}function XI(n){return nl.loadJS(n)}function ZI(){return nl.gapiScript}function ew(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tw(n,e){const t=Ic(n,"auth");if(t.isInitialized()){const i=t.getImmediate(),s=t.getOptions();if($s(s,e??{}))return i;nn(i,"already-initialized")}return t.initialize({options:e})}function nw(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(Qt);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function rw(n,e,t){const r=ko(n);re(r._canInitEmulator,r,"emulator-config-failed"),re(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const i=!!(t!=null&&t.disableWarnings),s=Vp(e),{host:a,port:c}=iw(e),u=c===null?"":`:${c}`;r.config.emulator={url:`${s}//${a}${u}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:a,port:c,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:i})}),i||sw()}function Vp(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function iw(n){const e=Vp(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",i=/^(\[[^\]]+\])(:|$)/.exec(r);if(i){const s=i[1];return{host:s,port:Th(r.substr(s.length+1))}}else{const[s,a]=r.split(":");return{host:s,port:Th(a)}}}function Th(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function sw(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Op{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Kt("not implemented")}_getIdTokenResponse(e){return Kt("not implemented")}_linkToIdToken(e,t){return Kt("not implemented")}_getReauthenticationResolver(e){return Kt("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Sr(n,e){return yp(n,"POST","/v1/accounts:signInWithIdp",Co(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ow="http://localhost";class nr extends Op{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new nr(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):nn("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:i}=t,s=Yc(t,["providerId","signInMethod"]);if(!r||!i)return null;const a=new nr(r,i);return a.idToken=s.idToken||void 0,a.accessToken=s.accessToken||void 0,a.secret=s.secret,a.nonce=s.nonce,a.pendingToken=s.pendingToken||null,a}_getIdTokenResponse(e){const t=this.buildRequest();return Sr(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,Sr(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,Sr(e,t)}buildRequest(){const e={requestUri:ow,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=ji(t)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Np{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Qi extends Np{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _n extends Qi{constructor(){super("facebook.com")}static credential(e){return nr._fromParams({providerId:_n.PROVIDER_ID,signInMethod:_n.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return _n.credentialFromTaggedObject(e)}static credentialFromError(e){return _n.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return _n.credential(e.oauthAccessToken)}catch{return null}}}_n.FACEBOOK_SIGN_IN_METHOD="facebook.com";_n.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yn extends Qi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return nr._fromParams({providerId:yn.PROVIDER_ID,signInMethod:yn.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return yn.credentialFromTaggedObject(e)}static credentialFromError(e){return yn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return yn.credential(t,r)}catch{return null}}}yn.GOOGLE_SIGN_IN_METHOD="google.com";yn.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vn extends Qi{constructor(){super("github.com")}static credential(e){return nr._fromParams({providerId:vn.PROVIDER_ID,signInMethod:vn.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return vn.credentialFromTaggedObject(e)}static credentialFromError(e){return vn.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return vn.credential(e.oauthAccessToken)}catch{return null}}}vn.GITHUB_SIGN_IN_METHOD="github.com";vn.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class En extends Qi{constructor(){super("twitter.com")}static credential(e,t){return nr._fromParams({providerId:En.PROVIDER_ID,signInMethod:En.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return En.credentialFromTaggedObject(e)}static credentialFromError(e){return En.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return En.credential(t,r)}catch{return null}}}En.TWITTER_SIGN_IN_METHOD="twitter.com";En.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function aw(n,e){return yp(n,"POST","/v1/accounts:signUp",Co(n,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xn{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,i=!1){const s=await Gt._fromIdTokenResponse(e,r,i),a=Ih(r);return new xn({user:s,providerId:a,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const i=Ih(r);return new xn({user:e,providerId:i,_tokenResponse:r,operationType:t})}}function Ih(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function cw(n){var e;if(Wt(n.app))return Promise.reject(Cn(n));const t=ko(n);if(await t._initializationPromise,!((e=t.currentUser)===null||e===void 0)&&e.isAnonymous)return new xn({user:t.currentUser,providerId:null,operationType:"signIn"});const r=await aw(t,{returnSecureToken:!0}),i=await xn._fromIdTokenResponse(t,"signIn",r,!0);return await t._updateCurrentUser(i.user),i}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class to extends on{constructor(e,t,r,i){var s;super(t.code,t.message),this.operationType=r,this.user=i,Object.setPrototypeOf(this,to.prototype),this.customData={appName:e.name,tenantId:(s=e.tenantId)!==null&&s!==void 0?s:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,i){return new to(e,t,r,i)}}function xp(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?to._fromErrorAndOperation(n,s,e,r):s})}async function lw(n,e,t=!1){const r=await Li(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return xn._forOperation(n,"link",r)}/**
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
 */async function uw(n,e,t=!1){const{auth:r}=n;if(Wt(r.app))return Promise.reject(Cn(r));const i="reauthenticate";try{const s=await Li(n,xp(r,i,e,n),t);re(s.idToken,r,"internal-error");const a=el(s.idToken);re(a,r,"internal-error");const{sub:c}=a;return re(n.uid===c,r,"user-mismatch"),xn._forOperation(n,i,s)}catch(s){throw(s==null?void 0:s.code)==="auth/user-not-found"&&nn(r,"user-mismatch"),s}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function hw(n,e,t=!1){if(Wt(n.app))return Promise.reject(Cn(n));const r="signIn",i=await xp(n,r,e),s=await xn._fromIdTokenResponse(n,r,i);return t||await n._updateCurrentUser(s.user),s}function dw(n,e,t,r){return St(n).onIdTokenChanged(e,t,r)}function fw(n,e,t){return St(n).beforeAuthStateChanged(e,t)}const no="__sak";/**
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
 */class Mp{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(no,"1"),this.storage.removeItem(no),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pw=1e3,gw=10;class Lp extends Mp{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=kp(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),i=this.localCache[t];r!==i&&e(t,i,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((a,c,u)=>{this.notifyListeners(a,u)});return}const r=e.key;t?this.detachListener():this.stopPolling();const i=()=>{const a=this.storage.getItem(r);!t&&this.localCache[r]===a||this.notifyListeners(r,a)},s=this.storage.getItem(r);zI()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(i,gw):i()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},pw)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}Lp.type="LOCAL";const mw=Lp;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fp extends Mp{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}Fp.type="SESSION";const Up=Fp;/**
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
 */function _w(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class Do{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(i=>i.isListeningto(e));if(t)return t;const r=new Do(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:i,data:s}=t.data,a=this.handlersMap[i];if(!(a!=null&&a.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:i});const c=Array.from(a).map(async d=>d(t.origin,s)),u=await _w(c);t.ports[0].postMessage({status:"done",eventId:r,eventType:i,response:u})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Do.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function rl(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
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
 */class yw{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const i=typeof MessageChannel<"u"?new MessageChannel:null;if(!i)throw new Error("connection_unavailable");let s,a;return new Promise((c,u)=>{const d=rl("",20);i.port1.start();const f=setTimeout(()=>{u(new Error("unsupported_event"))},r);a={messageChannel:i,onMessage(g){const I=g;if(I.data.eventId===d)switch(I.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),c(I.data.response);break;default:clearTimeout(f),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(a),i.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:d,data:t},[i.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Mt(){return window}function vw(n){Mt().location.href=n}/**
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
 */function Bp(){return typeof Mt().WorkerGlobalScope<"u"&&typeof Mt().importScripts=="function"}async function Ew(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Tw(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function Iw(){return Bp()?self:null}/**
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
 */const jp="firebaseLocalStorageDb",ww=1,ro="firebaseLocalStorage",$p="fbase_key";class Ji{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function Vo(n,e){return n.transaction([ro],e?"readwrite":"readonly").objectStore(ro)}function Aw(){const n=indexedDB.deleteDatabase(jp);return new Ji(n).toPromise()}function Xa(){const n=indexedDB.open(jp,ww);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(ro,{keyPath:$p})}catch(i){t(i)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(ro)?e(r):(r.close(),await Aw(),e(await Xa()))})})}async function wh(n,e,t){const r=Vo(n,!0).put({[$p]:e,value:t});return new Ji(r).toPromise()}async function bw(n,e){const t=Vo(n,!1).get(e),r=await new Ji(t).toPromise();return r===void 0?null:r.value}function Ah(n,e){const t=Vo(n,!0).delete(e);return new Ji(t).toPromise()}const Rw=800,Sw=3;class qp{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Xa(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>Sw)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Bp()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Do._getInstance(Iw()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await Ew(),!this.activeServiceWorker)return;this.sender=new yw(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Tw()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Xa();return await wh(e,no,"1"),await Ah(e,no),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>wh(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>bw(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Ah(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(i=>{const s=Vo(i,!1).getAll();return new Ji(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:i,value:s}of e)r.add(i),JSON.stringify(this.localCache[i])!==JSON.stringify(s)&&(this.notifyListeners(i,s),t.push(i));for(const i of Object.keys(this.localCache))this.localCache[i]&&!r.has(i)&&(this.notifyListeners(i,null),t.push(i));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const i of Array.from(r))i(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),Rw)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}qp.type="LOCAL";const Pw=qp;new Gi(3e4,6e4);/**
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
 */function Cw(n,e){return e?Qt(e):(re(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class il extends Op{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Sr(e,this._buildIdpRequest())}_linkToIdToken(e,t){return Sr(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return Sr(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function kw(n){return hw(n.auth,new il(n),n.bypassAuthState)}function Dw(n){const{auth:e,user:t}=n;return re(t,e,"internal-error"),uw(t,new il(n),n.bypassAuthState)}async function Vw(n){const{auth:e,user:t}=n;return re(t,e,"internal-error"),lw(t,new il(n),n.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hp{constructor(e,t,r,i,s=!1){this.auth=e,this.resolver=r,this.user=i,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:i,tenantId:s,error:a,type:c}=e;if(a){this.reject(a);return}const u={auth:this.auth,requestUri:t,sessionId:r,tenantId:s||void 0,postBody:i||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(c)(u))}catch(d){this.reject(d)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return kw;case"linkViaPopup":case"linkViaRedirect":return Vw;case"reauthViaPopup":case"reauthViaRedirect":return Dw;default:nn(this.auth,"internal-error")}}resolve(e){rn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){rn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ow=new Gi(2e3,1e4);class yr extends Hp{constructor(e,t,r,i,s){super(e,t,i,s),this.provider=r,this.authWindow=null,this.pollId=null,yr.currentPopupAction&&yr.currentPopupAction.cancel(),yr.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return re(e,this.auth,"internal-error"),e}async onExecution(){rn(this.filter.length===1,"Popup operations only handle one event");const e=rl();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(xt(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(xt(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,yr.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(xt(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,Ow.get())};e()}}yr.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nw="pendingRedirect",Os=new Map;class xw extends Hp{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=Os.get(this.auth._key());if(!e){try{const r=await Mw(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}Os.set(this.auth._key(),e)}return this.bypassAuthState||Os.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function Mw(n,e){const t=Uw(e),r=Fw(n);if(!await r._isAvailable())return!1;const i=await r._get(t)==="true";return await r._remove(t),i}function Lw(n,e){Os.set(n._key(),e)}function Fw(n){return Qt(n._redirectPersistence)}function Uw(n){return Vs(Nw,n.config.apiKey,n.name)}async function Bw(n,e,t=!1){if(Wt(n.app))return Promise.reject(Cn(n));const r=ko(n),i=Cw(r,e),a=await new xw(r,i,t).execute();return a&&!t&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jw=10*60*1e3;class $w{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!qw(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!zp(e)){const i=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(xt(this.auth,i))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=jw&&this.cachedEventUids.clear(),this.cachedEventUids.has(bh(e))}saveEventToCache(e){this.cachedEventUids.add(bh(e)),this.lastProcessedEventTime=Date.now()}}function bh(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function zp({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function qw(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return zp(n);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Hw(n,e={}){return qr(n,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zw=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Ww=/^https?/;async function Kw(n){if(n.config.emulator)return;const{authorizedDomains:e}=await Hw(n);for(const t of e)try{if(Gw(t))return}catch{}nn(n,"unauthorized-domain")}function Gw(n){const e=Ja(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const a=new URL(n);return a.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&a.hostname===r}if(!Ww.test(t))return!1;if(zw.test(n))return r===n;const i=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+i+"|"+i+")$","i").test(r)}/**
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
 */const Qw=new Gi(3e4,6e4);function Rh(){const n=Mt().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function Jw(n){return new Promise((e,t)=>{var r,i,s;function a(){Rh(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Rh(),t(xt(n,"network-request-failed"))},timeout:Qw.get()})}if(!((i=(r=Mt().gapi)===null||r===void 0?void 0:r.iframes)===null||i===void 0)&&i.Iframe)e(gapi.iframes.getContext());else if(!((s=Mt().gapi)===null||s===void 0)&&s.load)a();else{const c=ew("iframefcb");return Mt()[c]=()=>{gapi.load?a():t(xt(n,"network-request-failed"))},XI(`${ZI()}?onload=${c}`).catch(u=>t(u))}}).catch(e=>{throw Ns=null,e})}let Ns=null;function Yw(n){return Ns=Ns||Jw(n),Ns}/**
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
 */const Xw=new Gi(5e3,15e3),Zw="__/auth/iframe",e0="emulator/auth/iframe",t0={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},n0=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function r0(n){const e=n.config;re(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Zc(e,e0):`https://${n.config.authDomain}/${Zw}`,r={apiKey:e.apiKey,appName:n.name,v:Fr},i=n0.get(n.config.apiHost);i&&(r.eid=i);const s=n._getFrameworks();return s.length&&(r.fw=s.join(",")),`${t}?${ji(r).slice(1)}`}async function i0(n){const e=await Yw(n),t=Mt().gapi;return re(t,n,"internal-error"),e.open({where:document.body,url:r0(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:t0,dontclear:!0},r=>new Promise(async(i,s)=>{await r.restyle({setHideOnLeave:!1});const a=xt(n,"network-request-failed"),c=Mt().setTimeout(()=>{s(a)},Xw.get());function u(){Mt().clearTimeout(c),i(r)}r.ping(u).then(u,()=>{s(a)})}))}/**
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
 */const s0={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},o0=500,a0=600,c0="_blank",l0="http://localhost";class Sh{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function u0(n,e,t,r=o0,i=a0){const s=Math.max((window.screen.availHeight-i)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let c="";const u=Object.assign(Object.assign({},s0),{width:r.toString(),height:i.toString(),top:s,left:a}),d=rt().toLowerCase();t&&(c=bp(d)?c0:t),wp(d)&&(e=e||l0,u.scrollbars="yes");const f=Object.entries(u).reduce((I,[S,V])=>`${I}${S}=${V},`,"");if(HI(d)&&c!=="_self")return h0(e||"",c),new Sh(null);const g=window.open(e||"",c,f);re(g,n,"popup-blocked");try{g.focus()}catch{}return new Sh(g)}function h0(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
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
 */const d0="__/auth/handler",f0="emulator/auth/handler",p0=encodeURIComponent("fac");async function Ph(n,e,t,r,i,s){re(n.config.authDomain,n,"auth-domain-config-required"),re(n.config.apiKey,n,"invalid-api-key");const a={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:Fr,eventId:i};if(e instanceof Np){e.setDefaultLanguage(n.languageCode),a.providerId=e.providerId||"",ay(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[f,g]of Object.entries(s||{}))a[f]=g}if(e instanceof Qi){const f=e.getScopes().filter(g=>g!=="");f.length>0&&(a.scopes=f.join(","))}n.tenantId&&(a.tid=n.tenantId);const c=a;for(const f of Object.keys(c))c[f]===void 0&&delete c[f];const u=await n._getAppCheckToken(),d=u?`#${p0}=${encodeURIComponent(u)}`:"";return`${g0(n)}?${ji(c).slice(1)}${d}`}function g0({config:n}){return n.emulator?Zc(n,f0):`https://${n.authDomain}/${d0}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const va="webStorageSupport";class m0{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Up,this._completeRedirectFn=Bw,this._overrideRedirectResult=Lw}async _openPopup(e,t,r,i){var s;rn((s=this.eventManagers[e._key()])===null||s===void 0?void 0:s.manager,"_initialize() not called before _openPopup()");const a=await Ph(e,t,r,Ja(),i);return u0(e,a,rl())}async _openRedirect(e,t,r,i){await this._originValidation(e);const s=await Ph(e,t,r,Ja(),i);return vw(s),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:i,promise:s}=this.eventManagers[t];return i?Promise.resolve(i):(rn(s,"If manager is not set, promise should be"),s)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await i0(e),r=new $w(e);return t.register("authEvent",i=>(re(i==null?void 0:i.authEvent,e,"invalid-auth-event"),{status:r.onEvent(i.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(va,{type:va},i=>{var s;const a=(s=i==null?void 0:i[0])===null||s===void 0?void 0:s[va];a!==void 0&&t(!!a),nn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=Kw(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return kp()||Ap()||tl()}}const _0=m0;var Ch="@firebase/auth",kh="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class y0{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){re(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function v0(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function E0(n){kr(new Xn("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),i=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:a,authDomain:c}=r.options;re(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:a,authDomain:c,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Dp(n)},d=new JI(r,i,s,u);return nw(d,t),d},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),kr(new Xn("auth-internal",e=>{const t=ko(e.getProvider("auth").getImmediate());return(r=>new y0(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),Rn(Ch,kh,v0(n)),Rn(Ch,kh,"esm2017")}/**
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
 */const T0=5*60,I0=Ud("authIdTokenMaxAge")||T0;let Dh=null;const w0=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>I0)return;const i=t==null?void 0:t.token;Dh!==i&&(Dh=i,await fetch(n,{method:i?"POST":"DELETE",headers:i?{Authorization:`Bearer ${i}`}:{}}))};function A0(n=qd()){const e=Ic(n,"auth");if(e.isInitialized())return e.getImmediate();const t=tw(n,{popupRedirectResolver:_0,persistence:[Pw,mw,Up]}),r=Ud("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const s=new URL(r,location.origin);if(location.origin===s.origin){const a=w0(s.toString());fw(t,a,()=>a(t.currentUser)),dw(t,c=>a(c))}}const i=Ld("auth");return i&&rw(t,`http://${i}`),t}function b0(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}YI({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=i=>{const s=xt("internal-error");s.customData=i,t(s)},r.type="text/javascript",r.charset="UTF-8",b0().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});E0("Browser");const R0={apiKey:"AIzaSyDCqJRmxKiIzuAhgXsmXICCx_O65aujNa0",authDomain:"impro-selector.firebaseapp.com",projectId:"impro-selector",storageBucket:"impro-selector.appspot.com",messagingSenderId:"730278491306",appId:"1:730278491306:web:c966af1179221e91118cd3",measurementId:"G-3NB062D088"},Wp=$d(R0),Hr=lI(Wp),S0=A0(Wp);cw(S0);let or="mock";const P0=["Alice","Bob","Charlie","David","Eva","Fanny","Georges","Hélène","Ismaël","Jade","Karim","Léa","Marc","Nina","Oscar"],C0=[{id:"event1",title:"Apérock Septembre",date:"2025-09-08"},{id:"event2",title:"Match à Cambo",date:"2025-11-25"},{id:"event3",title:"Impro des Familles",date:"2025-12-02"},{id:"event4",title:"Cabaret Surprise",date:"2026-01-20"},{id:"event5",title:"Impro Plage",date:"2026-03-10"}];function k0(n){or=n}async function D0(){return or==="firebase"?(await Po(So(Hr,"events"))).docs.map(e=>({id:e.id,...e.data()})):C0}async function V0(){return or==="firebase"?(await Po(So(Hr,"players"))).docs.map(e=>({id:e.id,...e.data()})):P0.map((n,e)=>({id:`p${e+1}`,name:n}))}async function O0(n,e){if(or==="firebase"){const t=await Po(So(Hr,"availability")),r={};return t.forEach(i=>{r[i.id]=i.data()}),r}else{const t={};return n.forEach(r=>{t[r.name]={},e.forEach(i=>{t[r.name][i.id]=void 0})}),e.forEach(r=>{const i=[...n].sort(()=>.5-Math.random());i.slice(0,4).forEach(s=>{t[s.name][r.id]=!0}),i.slice(4).forEach(s=>{const a=Math.random();t[s.name][r.id]=a<.4?!0:a<.8?!1:void 0})}),t}}async function N0(){if(or==="firebase"){const n=await Po(So(Hr,"selections")),e={};return n.forEach(t=>{e[t.id]=t.data().players||[]}),e}else return{}}async function x0(n,e){or==="firebase"&&await dp(tp(Hr,"availability",n),e)}async function M0(n,e){or==="firebase"&&await dp(tp(Hr,"selections",n),{players:e})}const L0={class:"table-auto border-collapse border border-gray-400 w-full"},F0={class:"bg-gray-100 text-gray-800 text-sm uppercase tracking-wider"},U0={class:"flex flex-col items-center space-y-1"},B0={class:"font-semibold text-base text-center whitespace-pre-wrap"},j0={class:"text-xs text-gray-500"},$0=["onClick"],q0={class:"p-3 font-medium text-gray-900"},H0={class:"p-3 text-center text-gray-700 text-sm"},z0=["title"],W0=["onClick"],K0=["title"],G0=["title"],Q0=["title"],J0=["title"],Y0=Object.assign({name:"GridBoard"},{__name:"GridBoard",setup(n){const e=dr([]),t=dr([]),r=dr({}),i=dr({}),s=dr({}),a=dr({});ud(async()=>{k0("firebase"),e.value=await D0();const O=await V0(),k={};O.forEach(j=>{k[j.name]||(k[j.name]=j)}),t.value=Object.values(k),console.log("players (deduplicated):",t.value.map(j=>({id:j.id,name:j.name}))),r.value=await O0(t.value,e.value),i.value=await N0(),B(),K()});function c(O,k){r.value[O]=r.value[O]||{};const j=r.value[O][k];let X;j===void 0?X=!0:j===!0?X=!1:X=void 0,r.value[O][k]=X,x0(O,r.value[O]),U(O),K()}function u(O,k){var j;return(j=r.value[O])==null?void 0:j[k]}function d(O,k){var T;const j=i.value[k]||[],X=(T=r.value[O])==null?void 0:T[k];return j.includes(O)&&X===!0}async function f(O,k=6){const X=t.value.filter(_=>u(_.name,O)).map(_=>{const E=I(_.name);return{name:_.name,weight:1/(1+E)}}),T=[],m=[...X];for(;T.length<k&&m.length>0;){const _=m.reduce((R,v)=>R+v.weight,0);let E=Math.random()*_;const A=m.findIndex(R=>(E-=R.weight,E<=0));A>=0&&(T.push(m[A].name),m.splice(A,1))}i.value[O]=T,await M0(O,T),B(),K()}function g(O){var j;return O?(typeof O=="string"?new Date(O):((j=O.toDate)==null?void 0:j.call(O))||O).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}):""}function I(O){return Object.values(i.value).filter(k=>k.includes(O)).length}function S(O){const k=r.value[O]||{};return Object.values(k).filter(j=>j===!0).length}function V(O){const k=S(O),j=I(O);return k===0?0:j/k}function U(O){s.value[O]={availability:S(O),selection:I(O),ratio:V(O)}}function B(){t.value.forEach(O=>U(O.name))}function K(O=6){const k={};e.value.forEach(j=>{const T=t.value.filter(_=>u(_.name,j.id)===!0).map(_=>{const E=I(_.name);return{name:_.name,weight:1/(1+E)}}),m=T.reduce((_,E)=>_+E.weight,0);T.forEach(_=>{const E=Math.min(1,_.weight/m*O);k[_.name]||(k[_.name]={}),k[_.name][j.id]=Math.round(E*100)})}),a.value=k}function J(O,k){var _,E;const j=O.name,X=u(j,k),T=d(j,k),m=((E=(_=a.value)==null?void 0:_[j])==null?void 0:E[k])??0;return X===!1?"Non disponible – cliquez pour changer":T?`Sélectionné · Chance estimée : ${m}%`:X===!0?`Disponible · Chance estimée : ${m}%`:"Cliquez pour indiquer votre disponibilité"}return(O,k)=>(gt(),wt("table",L0,[Xe("thead",null,[Xe("tr",F0,[k[0]||(k[0]=Xe("th",{class:"p-3 text-left"},"Nom",-1)),k[1]||(k[1]=Xe("th",{class:"p-3 text-center text-sm text-gray-700"},"📊 Stats",-1)),(gt(!0),wt(mt,null,ta(e.value,j=>(gt(),wt("th",{key:j.id,class:"p-3 text-center w-48 align-top"},[Xe("div",U0,[Xe("div",B0,fr(j.title),1),Xe("div",j0,fr(g(j.date)),1),Xe("button",{onClick:X=>f(j.id,6),class:"mt-1 px-2 py-1 rounded-md text-sm bg-white hover:bg-gray-50 border shadow text-gray-800"}," 🎭 Sélectionner ",8,$0)])]))),128)),k[2]||(k[2]=Xe("th",{class:"p-3 text-center text-gray-500"},"➕",-1))])]),Xe("tbody",null,[(gt(!0),wt(mt,null,ta(t.value,j=>(gt(),wt("tr",{key:j.id,class:"odd:bg-white even:bg-gray-50 border-b"},[Xe("td",q0,fr(j.name),1),Xe("td",H0,[Xe("span",{title:`${I(j.name)} sélection${I(j.name)>1?"s":""}, ${S(j.name)} dispo${S(j.name)>1?"s":""}`},fr(I(j.name))+"/"+fr(S(j.name)),9,z0)]),(gt(!0),wt(mt,null,ta(e.value,X=>(gt(),wt("td",{key:X.id,class:"p-3 text-center cursor-pointer hover:bg-blue-100",onClick:T=>c(j.name,X.id)},[d(j.name,X.id)?(gt(),wt("span",{key:0,title:J(j,X.id)}," 🎭 ",8,K0)):u(j.name,X.id)?(gt(),wt("span",{key:1,title:J(j,X.id)}," ✅ ",8,G0)):u(j.name,X.id)===!1?(gt(),wt("span",{key:2,title:J(j,X.id)}," ❌ ",8,Q0)):(gt(),wt("span",{key:3,title:J(j,X.id)}," – ",8,J0))],8,W0))),128)),k[3]||(k[3]=Xe("td",{class:"p-3 text-center"},null,-1))]))),128))])]))}}),X0={__name:"App",setup(n){return(e,t)=>(gt(),Zm(Y0))}};M_(X0).mount("#app");
