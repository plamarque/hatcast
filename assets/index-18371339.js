(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();/**
* @vue/shared v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**//*! #__NO_SIDE_EFFECTS__ */function Ec(t){const e=Object.create(null);for(const n of t.split(","))e[n]=1;return n=>n in e}const Ge={},ds=[],fn=()=>{},R_=()=>!1,ua=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&(t.charCodeAt(2)>122||t.charCodeAt(2)<97),bc=t=>t.startsWith("onUpdate:"),vt=Object.assign,Tc=(t,e)=>{const n=t.indexOf(e);n>-1&&t.splice(n,1)},S_=Object.prototype.hasOwnProperty,$e=(t,e)=>S_.call(t,e),ye=Array.isArray,fs=t=>ha(t)==="[object Map]",Tf=t=>ha(t)==="[object Set]",Ie=t=>typeof t=="function",pt=t=>typeof t=="string",Rr=t=>typeof t=="symbol",tt=t=>t!==null&&typeof t=="object",If=t=>(tt(t)||Ie(t))&&Ie(t.then)&&Ie(t.catch),Af=Object.prototype.toString,ha=t=>Af.call(t),P_=t=>ha(t).slice(8,-1),Rf=t=>ha(t)==="[object Object]",Ic=t=>pt(t)&&t!=="NaN"&&t[0]!=="-"&&""+parseInt(t,10)===t,ii=Ec(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),da=t=>{const e=Object.create(null);return n=>e[n]||(e[n]=t(n))},C_=/-(\w)/g,cn=da(t=>t.replace(C_,(e,n)=>n?n.toUpperCase():"")),x_=/\B([A-Z])/g,Sr=da(t=>t.replace(x_,"-$1").toLowerCase()),fa=da(t=>t.charAt(0).toUpperCase()+t.slice(1)),ll=da(t=>t?`on${fa(t)}`:""),pr=(t,e)=>!Object.is(t,e),So=(t,...e)=>{for(let n=0;n<t.length;n++)t[n](...e)},Ml=(t,e,n,r=!1)=>{Object.defineProperty(t,e,{configurable:!0,enumerable:!1,writable:r,value:n})},Ll=t=>{const e=parseFloat(t);return isNaN(e)?t:e};let ph;const pa=()=>ph||(ph=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function vi(t){if(ye(t)){const e={};for(let n=0;n<t.length;n++){const r=t[n],s=pt(r)?V_(r):vi(r);if(s)for(const i in s)e[i]=s[i]}return e}else if(pt(t)||tt(t))return t}const k_=/;(?![^(]*\))/g,D_=/:([^]+)/,N_=/\/\*[^]*?\*\//g;function V_(t){const e={};return t.replace(N_,"").split(k_).forEach(n=>{if(n){const r=n.split(D_);r.length>1&&(e[r[0].trim()]=r[1].trim())}}),e}function Li(t){let e="";if(pt(t))e=t;else if(ye(t))for(let n=0;n<t.length;n++){const r=Li(t[n]);r&&(e+=r+" ")}else if(tt(t))for(const n in t)t[n]&&(e+=n+" ");return e.trim()}const O_="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",M_=Ec(O_);function Sf(t){return!!t||t===""}const Pf=t=>!!(t&&t.__v_isRef===!0),nt=t=>pt(t)?t:t==null?"":ye(t)||tt(t)&&(t.toString===Af||!Ie(t.toString))?Pf(t)?nt(t.value):JSON.stringify(t,Cf,2):String(t),Cf=(t,e)=>Pf(e)?Cf(t,e.value):fs(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((n,[r,s],i)=>(n[cl(r,i)+" =>"]=s,n),{})}:Tf(e)?{[`Set(${e.size})`]:[...e.values()].map(n=>cl(n))}:Rr(e)?cl(e):tt(e)&&!ye(e)&&!Rf(e)?String(e):e,cl=(t,e="")=>{var n;return Rr(t)?`Symbol(${(n=t.description)!=null?n:e})`:t};/**
* @vue/reactivity v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Qt;class L_{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=Qt,!e&&Qt&&(this.index=(Qt.scopes||(Qt.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].pause();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].resume();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].resume()}}run(e){if(this._active){const n=Qt;try{return Qt=this,e()}finally{Qt=n}}}on(){++this._on===1&&(this.prevScope=Qt,Qt=this)}off(){this._on>0&&--this._on===0&&(Qt=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let n,r;for(n=0,r=this.effects.length;n<r;n++)this.effects[n].stop();for(this.effects.length=0,n=0,r=this.cleanups.length;n<r;n++)this.cleanups[n]();if(this.cleanups.length=0,this.scopes){for(n=0,r=this.scopes.length;n<r;n++)this.scopes[n].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function F_(){return Qt}let Qe;const ul=new WeakSet;class xf{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Qt&&Qt.active&&Qt.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,ul.has(this)&&(ul.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Df(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,mh(this),Nf(this);const e=Qe,n=pn;Qe=this,pn=!0;try{return this.fn()}finally{Vf(this),Qe=e,pn=n,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)Sc(e);this.deps=this.depsTail=void 0,mh(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?ul.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Fl(this)&&this.run()}get dirty(){return Fl(this)}}let kf=0,oi,ai;function Df(t,e=!1){if(t.flags|=8,e){t.next=ai,ai=t;return}t.next=oi,oi=t}function Ac(){kf++}function Rc(){if(--kf>0)return;if(ai){let e=ai;for(ai=void 0;e;){const n=e.next;e.next=void 0,e.flags&=-9,e=n}}let t;for(;oi;){let e=oi;for(oi=void 0;e;){const n=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(r){t||(t=r)}e=n}}if(t)throw t}function Nf(t){for(let e=t.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function Vf(t){let e,n=t.depsTail,r=n;for(;r;){const s=r.prevDep;r.version===-1?(r===n&&(n=s),Sc(r),U_(r)):e=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=s}t.deps=e,t.depsTail=n}function Fl(t){for(let e=t.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(Of(e.dep.computed)||e.dep.version!==e.version))return!0;return!!t._dirty}function Of(t){if(t.flags&4&&!(t.flags&16)||(t.flags&=-17,t.globalVersion===wi)||(t.globalVersion=wi,!t.isSSR&&t.flags&128&&(!t.deps&&!t._dirty||!Fl(t))))return;t.flags|=2;const e=t.dep,n=Qe,r=pn;Qe=t,pn=!0;try{Nf(t);const s=t.fn(t._value);(e.version===0||pr(s,t._value))&&(t.flags|=128,t._value=s,e.version++)}catch(s){throw e.version++,s}finally{Qe=n,pn=r,Vf(t),t.flags&=-3}}function Sc(t,e=!1){const{dep:n,prevSub:r,nextSub:s}=t;if(r&&(r.nextSub=s,t.prevSub=void 0),s&&(s.prevSub=r,t.nextSub=void 0),n.subs===t&&(n.subs=r,!r&&n.computed)){n.computed.flags&=-5;for(let i=n.computed.deps;i;i=i.nextDep)Sc(i,!0)}!e&&!--n.sc&&n.map&&n.map.delete(n.key)}function U_(t){const{prevDep:e,nextDep:n}=t;e&&(e.nextDep=n,t.prevDep=void 0),n&&(n.prevDep=e,t.nextDep=void 0)}let pn=!0;const Mf=[];function Hn(){Mf.push(pn),pn=!1}function Kn(){const t=Mf.pop();pn=t===void 0?!0:t}function mh(t){const{cleanup:e}=t;if(t.cleanup=void 0,e){const n=Qe;Qe=void 0;try{e()}finally{Qe=n}}}let wi=0;class j_{constructor(e,n){this.sub=e,this.dep=n,this.version=n.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class Pc{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!Qe||!pn||Qe===this.computed)return;let n=this.activeLink;if(n===void 0||n.sub!==Qe)n=this.activeLink=new j_(Qe,this),Qe.deps?(n.prevDep=Qe.depsTail,Qe.depsTail.nextDep=n,Qe.depsTail=n):Qe.deps=Qe.depsTail=n,Lf(n);else if(n.version===-1&&(n.version=this.version,n.nextDep)){const r=n.nextDep;r.prevDep=n.prevDep,n.prevDep&&(n.prevDep.nextDep=r),n.prevDep=Qe.depsTail,n.nextDep=void 0,Qe.depsTail.nextDep=n,Qe.depsTail=n,Qe.deps===n&&(Qe.deps=r)}return n}trigger(e){this.version++,wi++,this.notify(e)}notify(e){Ac();try{for(let n=this.subs;n;n=n.prevSub)n.sub.notify()&&n.sub.dep.notify()}finally{Rc()}}}function Lf(t){if(t.dep.sc++,t.sub.flags&4){const e=t.dep.computed;if(e&&!t.dep.subs){e.flags|=20;for(let r=e.deps;r;r=r.nextDep)Lf(r)}const n=t.dep.subs;n!==t&&(t.prevSub=n,n&&(n.nextSub=t)),t.dep.subs=t}}const Ul=new WeakMap,jr=Symbol(""),jl=Symbol(""),Ei=Symbol("");function Ot(t,e,n){if(pn&&Qe){let r=Ul.get(t);r||Ul.set(t,r=new Map);let s=r.get(n);s||(r.set(n,s=new Pc),s.map=r,s.key=n),s.track()}}function Fn(t,e,n,r,s,i){const a=Ul.get(t);if(!a){wi++;return}const l=c=>{c&&c.trigger()};if(Ac(),e==="clear")a.forEach(l);else{const c=ye(t),h=c&&Ic(n);if(c&&n==="length"){const d=Number(r);a.forEach((p,g)=>{(g==="length"||g===Ei||!Rr(g)&&g>=d)&&l(p)})}else switch((n!==void 0||a.has(void 0))&&l(a.get(n)),h&&l(a.get(Ei)),e){case"add":c?h&&l(a.get("length")):(l(a.get(jr)),fs(t)&&l(a.get(jl)));break;case"delete":c||(l(a.get(jr)),fs(t)&&l(a.get(jl)));break;case"set":fs(t)&&l(a.get(jr));break}}Rc()}function ss(t){const e=Be(t);return e===t?e:(Ot(e,"iterate",Ei),ln(t)?e:e.map(At))}function ma(t){return Ot(t=Be(t),"iterate",Ei),t}const B_={__proto__:null,[Symbol.iterator](){return hl(this,Symbol.iterator,At)},concat(...t){return ss(this).concat(...t.map(e=>ye(e)?ss(e):e))},entries(){return hl(this,"entries",t=>(t[1]=At(t[1]),t))},every(t,e){return On(this,"every",t,e,void 0,arguments)},filter(t,e){return On(this,"filter",t,e,n=>n.map(At),arguments)},find(t,e){return On(this,"find",t,e,At,arguments)},findIndex(t,e){return On(this,"findIndex",t,e,void 0,arguments)},findLast(t,e){return On(this,"findLast",t,e,At,arguments)},findLastIndex(t,e){return On(this,"findLastIndex",t,e,void 0,arguments)},forEach(t,e){return On(this,"forEach",t,e,void 0,arguments)},includes(...t){return dl(this,"includes",t)},indexOf(...t){return dl(this,"indexOf",t)},join(t){return ss(this).join(t)},lastIndexOf(...t){return dl(this,"lastIndexOf",t)},map(t,e){return On(this,"map",t,e,void 0,arguments)},pop(){return Js(this,"pop")},push(...t){return Js(this,"push",t)},reduce(t,...e){return gh(this,"reduce",t,e)},reduceRight(t,...e){return gh(this,"reduceRight",t,e)},shift(){return Js(this,"shift")},some(t,e){return On(this,"some",t,e,void 0,arguments)},splice(...t){return Js(this,"splice",t)},toReversed(){return ss(this).toReversed()},toSorted(t){return ss(this).toSorted(t)},toSpliced(...t){return ss(this).toSpliced(...t)},unshift(...t){return Js(this,"unshift",t)},values(){return hl(this,"values",At)}};function hl(t,e,n){const r=ma(t),s=r[e]();return r!==t&&!ln(t)&&(s._next=s.next,s.next=()=>{const i=s._next();return i.value&&(i.value=n(i.value)),i}),s}const $_=Array.prototype;function On(t,e,n,r,s,i){const a=ma(t),l=a!==t&&!ln(t),c=a[e];if(c!==$_[e]){const p=c.apply(t,i);return l?At(p):p}let h=n;a!==t&&(l?h=function(p,g){return n.call(this,At(p),g,t)}:n.length>2&&(h=function(p,g){return n.call(this,p,g,t)}));const d=c.call(a,h,r);return l&&s?s(d):d}function gh(t,e,n,r){const s=ma(t);let i=n;return s!==t&&(ln(t)?n.length>3&&(i=function(a,l,c){return n.call(this,a,l,c,t)}):i=function(a,l,c){return n.call(this,a,At(l),c,t)}),s[e](i,...r)}function dl(t,e,n){const r=Be(t);Ot(r,"iterate",Ei);const s=r[e](...n);return(s===-1||s===!1)&&kc(n[0])?(n[0]=Be(n[0]),r[e](...n)):s}function Js(t,e,n=[]){Hn(),Ac();const r=Be(t)[e].apply(t,n);return Rc(),Kn(),r}const q_=Ec("__proto__,__v_isRef,__isVue"),Ff=new Set(Object.getOwnPropertyNames(Symbol).filter(t=>t!=="arguments"&&t!=="caller").map(t=>Symbol[t]).filter(Rr));function z_(t){Rr(t)||(t=String(t));const e=Be(this);return Ot(e,"has",t),e.hasOwnProperty(t)}class Uf{constructor(e=!1,n=!1){this._isReadonly=e,this._isShallow=n}get(e,n,r){if(n==="__v_skip")return e.__v_skip;const s=this._isReadonly,i=this._isShallow;if(n==="__v_isReactive")return!s;if(n==="__v_isReadonly")return s;if(n==="__v_isShallow")return i;if(n==="__v_raw")return r===(s?i?ey:qf:i?$f:Bf).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(r)?e:void 0;const a=ye(e);if(!s){let c;if(a&&(c=B_[n]))return c;if(n==="hasOwnProperty")return z_}const l=Reflect.get(e,n,Ft(e)?e:r);return(Rr(n)?Ff.has(n):q_(n))||(s||Ot(e,"get",n),i)?l:Ft(l)?a&&Ic(n)?l:l.value:tt(l)?s?Hf(l):ga(l):l}}class jf extends Uf{constructor(e=!1){super(!1,e)}set(e,n,r,s){let i=e[n];if(!this._isShallow){const c=wr(i);if(!ln(r)&&!wr(r)&&(i=Be(i),r=Be(r)),!ye(e)&&Ft(i)&&!Ft(r))return c?!1:(i.value=r,!0)}const a=ye(e)&&Ic(n)?Number(n)<e.length:$e(e,n),l=Reflect.set(e,n,r,Ft(e)?e:s);return e===Be(s)&&(a?pr(r,i)&&Fn(e,"set",n,r):Fn(e,"add",n,r)),l}deleteProperty(e,n){const r=$e(e,n);e[n];const s=Reflect.deleteProperty(e,n);return s&&r&&Fn(e,"delete",n,void 0),s}has(e,n){const r=Reflect.has(e,n);return(!Rr(n)||!Ff.has(n))&&Ot(e,"has",n),r}ownKeys(e){return Ot(e,"iterate",ye(e)?"length":jr),Reflect.ownKeys(e)}}class H_ extends Uf{constructor(e=!1){super(!0,e)}set(e,n){return!0}deleteProperty(e,n){return!0}}const K_=new jf,W_=new H_,G_=new jf(!0);const Bl=t=>t,_o=t=>Reflect.getPrototypeOf(t);function Q_(t,e,n){return function(...r){const s=this.__v_raw,i=Be(s),a=fs(i),l=t==="entries"||t===Symbol.iterator&&a,c=t==="keys"&&a,h=s[t](...r),d=n?Bl:e?Bo:At;return!e&&Ot(i,"iterate",c?jl:jr),{next(){const{value:p,done:g}=h.next();return g?{value:p,done:g}:{value:l?[d(p[0]),d(p[1])]:d(p),done:g}},[Symbol.iterator](){return this}}}}function yo(t){return function(...e){return t==="delete"?!1:t==="clear"?void 0:this}}function J_(t,e){const n={get(s){const i=this.__v_raw,a=Be(i),l=Be(s);t||(pr(s,l)&&Ot(a,"get",s),Ot(a,"get",l));const{has:c}=_o(a),h=e?Bl:t?Bo:At;if(c.call(a,s))return h(i.get(s));if(c.call(a,l))return h(i.get(l));i!==a&&i.get(s)},get size(){const s=this.__v_raw;return!t&&Ot(Be(s),"iterate",jr),Reflect.get(s,"size",s)},has(s){const i=this.__v_raw,a=Be(i),l=Be(s);return t||(pr(s,l)&&Ot(a,"has",s),Ot(a,"has",l)),s===l?i.has(s):i.has(s)||i.has(l)},forEach(s,i){const a=this,l=a.__v_raw,c=Be(l),h=e?Bl:t?Bo:At;return!t&&Ot(c,"iterate",jr),l.forEach((d,p)=>s.call(i,h(d),h(p),a))}};return vt(n,t?{add:yo("add"),set:yo("set"),delete:yo("delete"),clear:yo("clear")}:{add(s){!e&&!ln(s)&&!wr(s)&&(s=Be(s));const i=Be(this);return _o(i).has.call(i,s)||(i.add(s),Fn(i,"add",s,s)),this},set(s,i){!e&&!ln(i)&&!wr(i)&&(i=Be(i));const a=Be(this),{has:l,get:c}=_o(a);let h=l.call(a,s);h||(s=Be(s),h=l.call(a,s));const d=c.call(a,s);return a.set(s,i),h?pr(i,d)&&Fn(a,"set",s,i):Fn(a,"add",s,i),this},delete(s){const i=Be(this),{has:a,get:l}=_o(i);let c=a.call(i,s);c||(s=Be(s),c=a.call(i,s)),l&&l.call(i,s);const h=i.delete(s);return c&&Fn(i,"delete",s,void 0),h},clear(){const s=Be(this),i=s.size!==0,a=s.clear();return i&&Fn(s,"clear",void 0,void 0),a}}),["keys","values","entries",Symbol.iterator].forEach(s=>{n[s]=Q_(s,t,e)}),n}function Cc(t,e){const n=J_(t,e);return(r,s,i)=>s==="__v_isReactive"?!t:s==="__v_isReadonly"?t:s==="__v_raw"?r:Reflect.get($e(n,s)&&s in r?n:r,s,i)}const Y_={get:Cc(!1,!1)},X_={get:Cc(!1,!0)},Z_={get:Cc(!0,!1)};const Bf=new WeakMap,$f=new WeakMap,qf=new WeakMap,ey=new WeakMap;function ty(t){switch(t){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function ny(t){return t.__v_skip||!Object.isExtensible(t)?0:ty(P_(t))}function ga(t){return wr(t)?t:xc(t,!1,K_,Y_,Bf)}function zf(t){return xc(t,!1,G_,X_,$f)}function Hf(t){return xc(t,!0,W_,Z_,qf)}function xc(t,e,n,r,s){if(!tt(t)||t.__v_raw&&!(e&&t.__v_isReactive))return t;const i=ny(t);if(i===0)return t;const a=s.get(t);if(a)return a;const l=new Proxy(t,i===2?r:n);return s.set(t,l),l}function ps(t){return wr(t)?ps(t.__v_raw):!!(t&&t.__v_isReactive)}function wr(t){return!!(t&&t.__v_isReadonly)}function ln(t){return!!(t&&t.__v_isShallow)}function kc(t){return t?!!t.__v_raw:!1}function Be(t){const e=t&&t.__v_raw;return e?Be(e):t}function ry(t){return!$e(t,"__v_skip")&&Object.isExtensible(t)&&Ml(t,"__v_skip",!0),t}const At=t=>tt(t)?ga(t):t,Bo=t=>tt(t)?Hf(t):t;function Ft(t){return t?t.__v_isRef===!0:!1}function oe(t){return Kf(t,!1)}function sy(t){return Kf(t,!0)}function Kf(t,e){return Ft(t)?t:new iy(t,e)}class iy{constructor(e,n){this.dep=new Pc,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=n?e:Be(e),this._value=n?e:At(e),this.__v_isShallow=n}get value(){return this.dep.track(),this._value}set value(e){const n=this._rawValue,r=this.__v_isShallow||ln(e)||wr(e);e=r?e:Be(e),pr(e,n)&&(this._rawValue=e,this._value=r?e:At(e),this.dep.trigger())}}function ms(t){return Ft(t)?t.value:t}const oy={get:(t,e,n)=>e==="__v_raw"?t:ms(Reflect.get(t,e,n)),set:(t,e,n,r)=>{const s=t[e];return Ft(s)&&!Ft(n)?(s.value=n,!0):Reflect.set(t,e,n,r)}};function Wf(t){return ps(t)?t:new Proxy(t,oy)}class ay{constructor(e,n,r){this.fn=e,this.setter=n,this._value=void 0,this.dep=new Pc(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=wi-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!n,this.isSSR=r}notify(){if(this.flags|=16,!(this.flags&8)&&Qe!==this)return Df(this,!0),!0}get value(){const e=this.dep.track();return Of(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function ly(t,e,n=!1){let r,s;return Ie(t)?r=t:(r=t.get,s=t.set),new ay(r,s,n)}const vo={},$o=new WeakMap;let Lr;function cy(t,e=!1,n=Lr){if(n){let r=$o.get(n);r||$o.set(n,r=[]),r.push(t)}}function uy(t,e,n=Ge){const{immediate:r,deep:s,once:i,scheduler:a,augmentJob:l,call:c}=n,h=W=>s?W:ln(W)||s===!1||s===0?Un(W,1):Un(W);let d,p,g,y,k=!1,N=!1;if(Ft(t)?(p=()=>t.value,k=ln(t)):ps(t)?(p=()=>h(t),k=!0):ye(t)?(N=!0,k=t.some(W=>ps(W)||ln(W)),p=()=>t.map(W=>{if(Ft(W))return W.value;if(ps(W))return h(W);if(Ie(W))return c?c(W,2):W()})):Ie(t)?e?p=c?()=>c(t,2):t:p=()=>{if(g){Hn();try{g()}finally{Kn()}}const W=Lr;Lr=d;try{return c?c(t,3,[y]):t(y)}finally{Lr=W}}:p=fn,e&&s){const W=p,fe=s===!0?1/0:s;p=()=>Un(W(),fe)}const M=F_(),H=()=>{d.stop(),M&&M.active&&Tc(M.effects,d)};if(i&&e){const W=e;e=(...fe)=>{W(...fe),H()}}let z=N?new Array(t.length).fill(vo):vo;const K=W=>{if(!(!(d.flags&1)||!d.dirty&&!W))if(e){const fe=d.run();if(s||k||(N?fe.some((ie,R)=>pr(ie,z[R])):pr(fe,z))){g&&g();const ie=Lr;Lr=d;try{const R=[fe,z===vo?void 0:N&&z[0]===vo?[]:z,y];z=fe,c?c(e,3,R):e(...R)}finally{Lr=ie}}}else d.run()};return l&&l(K),d=new xf(p),d.scheduler=a?()=>a(K,!1):K,y=W=>cy(W,!1,d),g=d.onStop=()=>{const W=$o.get(d);if(W){if(c)c(W,4);else for(const fe of W)fe();$o.delete(d)}},e?r?K(!0):z=d.run():a?a(K.bind(null,!0),!0):d.run(),H.pause=d.pause.bind(d),H.resume=d.resume.bind(d),H.stop=H,H}function Un(t,e=1/0,n){if(e<=0||!tt(t)||t.__v_skip||(n=n||new Set,n.has(t)))return t;if(n.add(t),e--,Ft(t))Un(t.value,e,n);else if(ye(t))for(let r=0;r<t.length;r++)Un(t[r],e,n);else if(Tf(t)||fs(t))t.forEach(r=>{Un(r,e,n)});else if(Rf(t)){for(const r in t)Un(t[r],e,n);for(const r of Object.getOwnPropertySymbols(t))Object.prototype.propertyIsEnumerable.call(t,r)&&Un(t[r],e,n)}return t}/**
* @vue/runtime-core v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function Fi(t,e,n,r){try{return r?t(...r):t()}catch(s){_a(s,e,n)}}function Sn(t,e,n,r){if(Ie(t)){const s=Fi(t,e,n,r);return s&&If(s)&&s.catch(i=>{_a(i,e,n)}),s}if(ye(t)){const s=[];for(let i=0;i<t.length;i++)s.push(Sn(t[i],e,n,r));return s}}function _a(t,e,n,r=!0){const s=e?e.vnode:null,{errorHandler:i,throwUnhandledErrorInProduction:a}=e&&e.appContext.config||Ge;if(e){let l=e.parent;const c=e.proxy,h=`https://vuejs.org/error-reference/#runtime-${n}`;for(;l;){const d=l.ec;if(d){for(let p=0;p<d.length;p++)if(d[p](t,c,h)===!1)return}l=l.parent}if(i){Hn(),Fi(i,null,10,[t,c,h]),Kn();return}}hy(t,n,s,r,a)}function hy(t,e,n,r=!0,s=!1){if(s)throw t;console.error(t)}const Ht=[];let vn=-1;const gs=[];let ir=null,is=0;const Gf=Promise.resolve();let qo=null;function Dc(t){const e=qo||Gf;return t?e.then(this?t.bind(this):t):e}function dy(t){let e=vn+1,n=Ht.length;for(;e<n;){const r=e+n>>>1,s=Ht[r],i=bi(s);i<t||i===t&&s.flags&2?e=r+1:n=r}return e}function Nc(t){if(!(t.flags&1)){const e=bi(t),n=Ht[Ht.length-1];!n||!(t.flags&2)&&e>=bi(n)?Ht.push(t):Ht.splice(dy(e),0,t),t.flags|=1,Qf()}}function Qf(){qo||(qo=Gf.then(Yf))}function fy(t){ye(t)?gs.push(...t):ir&&t.id===-1?ir.splice(is+1,0,t):t.flags&1||(gs.push(t),t.flags|=1),Qf()}function _h(t,e,n=vn+1){for(;n<Ht.length;n++){const r=Ht[n];if(r&&r.flags&2){if(t&&r.id!==t.uid)continue;Ht.splice(n,1),n--,r.flags&4&&(r.flags&=-2),r(),r.flags&4||(r.flags&=-2)}}}function Jf(t){if(gs.length){const e=[...new Set(gs)].sort((n,r)=>bi(n)-bi(r));if(gs.length=0,ir){ir.push(...e);return}for(ir=e,is=0;is<ir.length;is++){const n=ir[is];n.flags&4&&(n.flags&=-2),n.flags&8||n(),n.flags&=-2}ir=null,is=0}}const bi=t=>t.id==null?t.flags&2?-1:1/0:t.id;function Yf(t){const e=fn;try{for(vn=0;vn<Ht.length;vn++){const n=Ht[vn];n&&!(n.flags&8)&&(n.flags&4&&(n.flags&=-2),Fi(n,n.i,n.i?15:14),n.flags&4||(n.flags&=-2))}}finally{for(;vn<Ht.length;vn++){const n=Ht[vn];n&&(n.flags&=-2)}vn=-1,Ht.length=0,Jf(),qo=null,(Ht.length||gs.length)&&Yf()}}let sn=null,Xf=null;function zo(t){const e=sn;return sn=t,Xf=t&&t.type.__scopeId||null,e}function py(t,e=sn,n){if(!e||t._n)return t;const r=(...s)=>{r._d&&Rh(-1);const i=zo(e);let a;try{a=t(...s)}finally{zo(i),r._d&&Rh(1)}return a};return r._n=!0,r._c=!0,r._d=!0,r}function Jt(t,e){if(sn===null)return t;const n=Ea(sn),r=t.dirs||(t.dirs=[]);for(let s=0;s<e.length;s++){let[i,a,l,c=Ge]=e[s];i&&(Ie(i)&&(i={mounted:i,updated:i}),i.deep&&Un(a),r.push({dir:i,instance:n,value:a,oldValue:void 0,arg:l,modifiers:c}))}return t}function Or(t,e,n,r){const s=t.dirs,i=e&&e.dirs;for(let a=0;a<s.length;a++){const l=s[a];i&&(l.oldValue=i[a].value);let c=l.dir[r];c&&(Hn(),Sn(c,n,8,[t.el,l,t,e]),Kn())}}const my=Symbol("_vte"),gy=t=>t.__isTeleport;function Vc(t,e){t.shapeFlag&6&&t.component?(t.transition=e,Vc(t.component.subTree,e)):t.shapeFlag&128?(t.ssContent.transition=e.clone(t.ssContent),t.ssFallback.transition=e.clone(t.ssFallback)):t.transition=e}/*! #__NO_SIDE_EFFECTS__ */function Zf(t,e){return Ie(t)?(()=>vt({name:t.name},e,{setup:t}))():t}function ep(t){t.ids=[t.ids[0]+t.ids[2]+++"-",0,0]}function li(t,e,n,r,s=!1){if(ye(t)){t.forEach((k,N)=>li(k,e&&(ye(e)?e[N]:e),n,r,s));return}if(ci(r)&&!s){r.shapeFlag&512&&r.type.__asyncResolved&&r.component.subTree.component&&li(t,e,n,r.component.subTree);return}const i=r.shapeFlag&4?Ea(r.component):r.el,a=s?null:i,{i:l,r:c}=t,h=e&&e.r,d=l.refs===Ge?l.refs={}:l.refs,p=l.setupState,g=Be(p),y=p===Ge?()=>!1:k=>$e(g,k);if(h!=null&&h!==c&&(pt(h)?(d[h]=null,y(h)&&(p[h]=null)):Ft(h)&&(h.value=null)),Ie(c))Fi(c,l,12,[a,d]);else{const k=pt(c),N=Ft(c);if(k||N){const M=()=>{if(t.f){const H=k?y(c)?p[c]:d[c]:c.value;s?ye(H)&&Tc(H,i):ye(H)?H.includes(i)||H.push(i):k?(d[c]=[i],y(c)&&(p[c]=d[c])):(c.value=[i],t.k&&(d[t.k]=c.value))}else k?(d[c]=a,y(c)&&(p[c]=a)):N&&(c.value=a,t.k&&(d[t.k]=a))};a?(M.id=-1,rn(M,n)):M()}}}pa().requestIdleCallback;pa().cancelIdleCallback;const ci=t=>!!t.type.__asyncLoader,tp=t=>t.type.__isKeepAlive;function _y(t,e){np(t,"a",e)}function yy(t,e){np(t,"da",e)}function np(t,e,n=Lt){const r=t.__wdc||(t.__wdc=()=>{let s=n;for(;s;){if(s.isDeactivated)return;s=s.parent}return t()});if(ya(e,r,n),n){let s=n.parent;for(;s&&s.parent;)tp(s.parent.vnode)&&vy(r,e,n,s),s=s.parent}}function vy(t,e,n,r){const s=ya(e,t,r,!0);rp(()=>{Tc(r[e],s)},n)}function ya(t,e,n=Lt,r=!1){if(n){const s=n[t]||(n[t]=[]),i=e.__weh||(e.__weh=(...a)=>{Hn();const l=Ui(n),c=Sn(e,n,t,a);return l(),Kn(),c});return r?s.unshift(i):s.push(i),i}}const Xn=t=>(e,n=Lt)=>{(!Ii||t==="sp")&&ya(t,(...r)=>e(...r),n)},wy=Xn("bm"),Oc=Xn("m"),Ey=Xn("bu"),by=Xn("u"),Ty=Xn("bum"),rp=Xn("um"),Iy=Xn("sp"),Ay=Xn("rtg"),Ry=Xn("rtc");function Sy(t,e=Lt){ya("ec",t,e)}const sp="components";function Py(t,e){return xy(sp,t,!0,e)||t}const Cy=Symbol.for("v-ndc");function xy(t,e,n=!0,r=!1){const s=sn||Lt;if(s){const i=s.type;if(t===sp){const l=_v(i,!1);if(l&&(l===e||l===cn(e)||l===fa(cn(e))))return i}const a=yh(s[t]||i[t],e)||yh(s.appContext[t],e);return!a&&r?i:a}}function yh(t,e){return t&&(t[e]||t[cn(e)]||t[fa(cn(e))])}function wn(t,e,n,r){let s;const i=n&&n[r],a=ye(t);if(a||pt(t)){const l=a&&ps(t);let c=!1,h=!1;l&&(c=!ln(t),h=wr(t),t=ma(t)),s=new Array(t.length);for(let d=0,p=t.length;d<p;d++)s[d]=e(c?h?Bo(At(t[d])):At(t[d]):t[d],d,void 0,i&&i[d])}else if(typeof t=="number"){s=new Array(t);for(let l=0;l<t;l++)s[l]=e(l+1,l,void 0,i&&i[l])}else if(tt(t))if(t[Symbol.iterator])s=Array.from(t,(l,c)=>e(l,c,void 0,i&&i[c]));else{const l=Object.keys(t);s=new Array(l.length);for(let c=0,h=l.length;c<h;c++){const d=l[c];s[c]=e(t[d],d,c,i&&i[c])}}else s=[];return n&&(n[r]=s),s}const $l=t=>t?Ip(t)?Ea(t):$l(t.parent):null,ui=vt(Object.create(null),{$:t=>t,$el:t=>t.vnode.el,$data:t=>t.data,$props:t=>t.props,$attrs:t=>t.attrs,$slots:t=>t.slots,$refs:t=>t.refs,$parent:t=>$l(t.parent),$root:t=>$l(t.root),$host:t=>t.ce,$emit:t=>t.emit,$options:t=>Mc(t),$forceUpdate:t=>t.f||(t.f=()=>{Nc(t.update)}),$nextTick:t=>t.n||(t.n=Dc.bind(t.proxy)),$watch:t=>Yy.bind(t)}),fl=(t,e)=>t!==Ge&&!t.__isScriptSetup&&$e(t,e),ky={get({_:t},e){if(e==="__v_skip")return!0;const{ctx:n,setupState:r,data:s,props:i,accessCache:a,type:l,appContext:c}=t;let h;if(e[0]!=="$"){const y=a[e];if(y!==void 0)switch(y){case 1:return r[e];case 2:return s[e];case 4:return n[e];case 3:return i[e]}else{if(fl(r,e))return a[e]=1,r[e];if(s!==Ge&&$e(s,e))return a[e]=2,s[e];if((h=t.propsOptions[0])&&$e(h,e))return a[e]=3,i[e];if(n!==Ge&&$e(n,e))return a[e]=4,n[e];ql&&(a[e]=0)}}const d=ui[e];let p,g;if(d)return e==="$attrs"&&Ot(t.attrs,"get",""),d(t);if((p=l.__cssModules)&&(p=p[e]))return p;if(n!==Ge&&$e(n,e))return a[e]=4,n[e];if(g=c.config.globalProperties,$e(g,e))return g[e]},set({_:t},e,n){const{data:r,setupState:s,ctx:i}=t;return fl(s,e)?(s[e]=n,!0):r!==Ge&&$e(r,e)?(r[e]=n,!0):$e(t.props,e)||e[0]==="$"&&e.slice(1)in t?!1:(i[e]=n,!0)},has({_:{data:t,setupState:e,accessCache:n,ctx:r,appContext:s,propsOptions:i}},a){let l;return!!n[a]||t!==Ge&&$e(t,a)||fl(e,a)||(l=i[0])&&$e(l,a)||$e(r,a)||$e(ui,a)||$e(s.config.globalProperties,a)},defineProperty(t,e,n){return n.get!=null?t._.accessCache[e]=0:$e(n,"value")&&this.set(t,e,n.value,null),Reflect.defineProperty(t,e,n)}};function vh(t){return ye(t)?t.reduce((e,n)=>(e[n]=null,e),{}):t}let ql=!0;function Dy(t){const e=Mc(t),n=t.proxy,r=t.ctx;ql=!1,e.beforeCreate&&wh(e.beforeCreate,t,"bc");const{data:s,computed:i,methods:a,watch:l,provide:c,inject:h,created:d,beforeMount:p,mounted:g,beforeUpdate:y,updated:k,activated:N,deactivated:M,beforeDestroy:H,beforeUnmount:z,destroyed:K,unmounted:W,render:fe,renderTracked:ie,renderTriggered:R,errorCaptured:E,serverPrefetch:T,expose:v,inheritAttrs:S,components:P,directives:I,filters:ut}=e;if(h&&Ny(h,r,null),a)for(const Ce in a){const Re=a[Ce];Ie(Re)&&(r[Ce]=Re.bind(n))}if(s){const Ce=s.call(n,n);tt(Ce)&&(t.data=ga(Ce))}if(ql=!0,i)for(const Ce in i){const Re=i[Ce],Bt=Ie(Re)?Re.bind(n,n):Ie(Re.get)?Re.get.bind(n,n):fn,$t=!Ie(Re)&&Ie(Re.set)?Re.set.bind(n):fn,Wt=hn({get:Bt,set:$t});Object.defineProperty(r,Ce,{enumerable:!0,configurable:!0,get:()=>Wt.value,set:qe=>Wt.value=qe})}if(l)for(const Ce in l)ip(l[Ce],r,n,Ce);if(c){const Ce=Ie(c)?c.call(n):c;Reflect.ownKeys(Ce).forEach(Re=>{Po(Re,Ce[Re])})}d&&wh(d,t,"c");function Me(Ce,Re){ye(Re)?Re.forEach(Bt=>Ce(Bt.bind(n))):Re&&Ce(Re.bind(n))}if(Me(wy,p),Me(Oc,g),Me(Ey,y),Me(by,k),Me(_y,N),Me(yy,M),Me(Sy,E),Me(Ry,ie),Me(Ay,R),Me(Ty,z),Me(rp,W),Me(Iy,T),ye(v))if(v.length){const Ce=t.exposed||(t.exposed={});v.forEach(Re=>{Object.defineProperty(Ce,Re,{get:()=>n[Re],set:Bt=>n[Re]=Bt})})}else t.exposed||(t.exposed={});fe&&t.render===fn&&(t.render=fe),S!=null&&(t.inheritAttrs=S),P&&(t.components=P),I&&(t.directives=I),T&&ep(t)}function Ny(t,e,n=fn){ye(t)&&(t=zl(t));for(const r in t){const s=t[r];let i;tt(s)?"default"in s?i=bn(s.from||r,s.default,!0):i=bn(s.from||r):i=bn(s),Ft(i)?Object.defineProperty(e,r,{enumerable:!0,configurable:!0,get:()=>i.value,set:a=>i.value=a}):e[r]=i}}function wh(t,e,n){Sn(ye(t)?t.map(r=>r.bind(e.proxy)):t.bind(e.proxy),e,n)}function ip(t,e,n,r){let s=r.includes(".")?yp(n,r):()=>n[r];if(pt(t)){const i=e[t];Ie(i)&&ys(s,i)}else if(Ie(t))ys(s,t.bind(n));else if(tt(t))if(ye(t))t.forEach(i=>ip(i,e,n,r));else{const i=Ie(t.handler)?t.handler.bind(n):e[t.handler];Ie(i)&&ys(s,i,t)}}function Mc(t){const e=t.type,{mixins:n,extends:r}=e,{mixins:s,optionsCache:i,config:{optionMergeStrategies:a}}=t.appContext,l=i.get(e);let c;return l?c=l:!s.length&&!n&&!r?c=e:(c={},s.length&&s.forEach(h=>Ho(c,h,a,!0)),Ho(c,e,a)),tt(e)&&i.set(e,c),c}function Ho(t,e,n,r=!1){const{mixins:s,extends:i}=e;i&&Ho(t,i,n,!0),s&&s.forEach(a=>Ho(t,a,n,!0));for(const a in e)if(!(r&&a==="expose")){const l=Vy[a]||n&&n[a];t[a]=l?l(t[a],e[a]):e[a]}return t}const Vy={data:Eh,props:bh,emits:bh,methods:ei,computed:ei,beforeCreate:zt,created:zt,beforeMount:zt,mounted:zt,beforeUpdate:zt,updated:zt,beforeDestroy:zt,beforeUnmount:zt,destroyed:zt,unmounted:zt,activated:zt,deactivated:zt,errorCaptured:zt,serverPrefetch:zt,components:ei,directives:ei,watch:My,provide:Eh,inject:Oy};function Eh(t,e){return e?t?function(){return vt(Ie(t)?t.call(this,this):t,Ie(e)?e.call(this,this):e)}:e:t}function Oy(t,e){return ei(zl(t),zl(e))}function zl(t){if(ye(t)){const e={};for(let n=0;n<t.length;n++)e[t[n]]=t[n];return e}return t}function zt(t,e){return t?[...new Set([].concat(t,e))]:e}function ei(t,e){return t?vt(Object.create(null),t,e):e}function bh(t,e){return t?ye(t)&&ye(e)?[...new Set([...t,...e])]:vt(Object.create(null),vh(t),vh(e??{})):e}function My(t,e){if(!t)return e;if(!e)return t;const n=vt(Object.create(null),t);for(const r in e)n[r]=zt(t[r],e[r]);return n}function op(){return{app:null,config:{isNativeTag:R_,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let Ly=0;function Fy(t,e){return function(r,s=null){Ie(r)||(r=vt({},r)),s!=null&&!tt(s)&&(s=null);const i=op(),a=new WeakSet,l=[];let c=!1;const h=i.app={_uid:Ly++,_component:r,_props:s,_container:null,_context:i,_instance:null,version:vv,get config(){return i.config},set config(d){},use(d,...p){return a.has(d)||(d&&Ie(d.install)?(a.add(d),d.install(h,...p)):Ie(d)&&(a.add(d),d(h,...p))),h},mixin(d){return i.mixins.includes(d)||i.mixins.push(d),h},component(d,p){return p?(i.components[d]=p,h):i.components[d]},directive(d,p){return p?(i.directives[d]=p,h):i.directives[d]},mount(d,p,g){if(!c){const y=h._ceVNode||St(r,s);return y.appContext=i,g===!0?g="svg":g===!1&&(g=void 0),p&&e?e(y,d):t(y,d,g),c=!0,h._container=d,d.__vue_app__=h,Ea(y.component)}},onUnmount(d){l.push(d)},unmount(){c&&(Sn(l,h._instance,16),t(null,h._container),delete h._container.__vue_app__)},provide(d,p){return i.provides[d]=p,h},runWithContext(d){const p=_s;_s=h;try{return d()}finally{_s=p}}};return h}}let _s=null;function Po(t,e){if(Lt){let n=Lt.provides;const r=Lt.parent&&Lt.parent.provides;r===n&&(n=Lt.provides=Object.create(r)),n[t]=e}}function bn(t,e,n=!1){const r=Lt||sn;if(r||_s){let s=_s?_s._context.provides:r?r.parent==null||r.ce?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:void 0;if(s&&t in s)return s[t];if(arguments.length>1)return n&&Ie(e)?e.call(r&&r.proxy):e}}const ap={},lp=()=>Object.create(ap),cp=t=>Object.getPrototypeOf(t)===ap;function Uy(t,e,n,r=!1){const s={},i=lp();t.propsDefaults=Object.create(null),up(t,e,s,i);for(const a in t.propsOptions[0])a in s||(s[a]=void 0);n?t.props=r?s:zf(s):t.type.props?t.props=s:t.props=i,t.attrs=i}function jy(t,e,n,r){const{props:s,attrs:i,vnode:{patchFlag:a}}=t,l=Be(s),[c]=t.propsOptions;let h=!1;if((r||a>0)&&!(a&16)){if(a&8){const d=t.vnode.dynamicProps;for(let p=0;p<d.length;p++){let g=d[p];if(va(t.emitsOptions,g))continue;const y=e[g];if(c)if($e(i,g))y!==i[g]&&(i[g]=y,h=!0);else{const k=cn(g);s[k]=Hl(c,l,k,y,t,!1)}else y!==i[g]&&(i[g]=y,h=!0)}}}else{up(t,e,s,i)&&(h=!0);let d;for(const p in l)(!e||!$e(e,p)&&((d=Sr(p))===p||!$e(e,d)))&&(c?n&&(n[p]!==void 0||n[d]!==void 0)&&(s[p]=Hl(c,l,p,void 0,t,!0)):delete s[p]);if(i!==l)for(const p in i)(!e||!$e(e,p))&&(delete i[p],h=!0)}h&&Fn(t.attrs,"set","")}function up(t,e,n,r){const[s,i]=t.propsOptions;let a=!1,l;if(e)for(let c in e){if(ii(c))continue;const h=e[c];let d;s&&$e(s,d=cn(c))?!i||!i.includes(d)?n[d]=h:(l||(l={}))[d]=h:va(t.emitsOptions,c)||(!(c in r)||h!==r[c])&&(r[c]=h,a=!0)}if(i){const c=Be(n),h=l||Ge;for(let d=0;d<i.length;d++){const p=i[d];n[p]=Hl(s,c,p,h[p],t,!$e(h,p))}}return a}function Hl(t,e,n,r,s,i){const a=t[n];if(a!=null){const l=$e(a,"default");if(l&&r===void 0){const c=a.default;if(a.type!==Function&&!a.skipFactory&&Ie(c)){const{propsDefaults:h}=s;if(n in h)r=h[n];else{const d=Ui(s);r=h[n]=c.call(null,e),d()}}else r=c;s.ce&&s.ce._setProp(n,r)}a[0]&&(i&&!l?r=!1:a[1]&&(r===""||r===Sr(n))&&(r=!0))}return r}const By=new WeakMap;function hp(t,e,n=!1){const r=n?By:e.propsCache,s=r.get(t);if(s)return s;const i=t.props,a={},l=[];let c=!1;if(!Ie(t)){const d=p=>{c=!0;const[g,y]=hp(p,e,!0);vt(a,g),y&&l.push(...y)};!n&&e.mixins.length&&e.mixins.forEach(d),t.extends&&d(t.extends),t.mixins&&t.mixins.forEach(d)}if(!i&&!c)return tt(t)&&r.set(t,ds),ds;if(ye(i))for(let d=0;d<i.length;d++){const p=cn(i[d]);Th(p)&&(a[p]=Ge)}else if(i)for(const d in i){const p=cn(d);if(Th(p)){const g=i[d],y=a[p]=ye(g)||Ie(g)?{type:g}:vt({},g),k=y.type;let N=!1,M=!0;if(ye(k))for(let H=0;H<k.length;++H){const z=k[H],K=Ie(z)&&z.name;if(K==="Boolean"){N=!0;break}else K==="String"&&(M=!1)}else N=Ie(k)&&k.name==="Boolean";y[0]=N,y[1]=M,(N||$e(y,"default"))&&l.push(p)}}const h=[a,l];return tt(t)&&r.set(t,h),h}function Th(t){return t[0]!=="$"&&!ii(t)}const Lc=t=>t[0]==="_"||t==="$stable",Fc=t=>ye(t)?t.map(En):[En(t)],$y=(t,e,n)=>{if(e._n)return e;const r=py((...s)=>Fc(e(...s)),n);return r._c=!1,r},dp=(t,e,n)=>{const r=t._ctx;for(const s in t){if(Lc(s))continue;const i=t[s];if(Ie(i))e[s]=$y(s,i,r);else if(i!=null){const a=Fc(i);e[s]=()=>a}}},fp=(t,e)=>{const n=Fc(e);t.slots.default=()=>n},pp=(t,e,n)=>{for(const r in e)(n||!Lc(r))&&(t[r]=e[r])},qy=(t,e,n)=>{const r=t.slots=lp();if(t.vnode.shapeFlag&32){const s=e.__;s&&Ml(r,"__",s,!0);const i=e._;i?(pp(r,e,n),n&&Ml(r,"_",i,!0)):dp(e,r)}else e&&fp(t,e)},zy=(t,e,n)=>{const{vnode:r,slots:s}=t;let i=!0,a=Ge;if(r.shapeFlag&32){const l=e._;l?n&&l===1?i=!1:pp(s,e,n):(i=!e.$stable,dp(e,s)),a=e}else e&&(fp(t,e),a={default:1});if(i)for(const l in s)!Lc(l)&&a[l]==null&&delete s[l]},rn=sv;function Hy(t){return Ky(t)}function Ky(t,e){const n=pa();n.__VUE__=!0;const{insert:r,remove:s,patchProp:i,createElement:a,createText:l,createComment:c,setText:h,setElementText:d,parentNode:p,nextSibling:g,setScopeId:y=fn,insertStaticContent:k}=t,N=(_,w,x,U=null,L=null,j=null,J=void 0,Q=null,G=!!w.dynamicChildren)=>{if(_===w)return;_&&!Ys(_,w)&&(U=O(_),qe(_,L,j,!0),_=null),w.patchFlag===-2&&(G=!1,w.dynamicChildren=null);const{type:$,ref:ae,shapeFlag:X}=w;switch($){case wa:M(_,w,x,U);break;case Er:H(_,w,x,U);break;case Co:_==null&&z(w,x,U,J);break;case lt:P(_,w,x,U,L,j,J,Q,G);break;default:X&1?fe(_,w,x,U,L,j,J,Q,G):X&6?I(_,w,x,U,L,j,J,Q,G):(X&64||X&128)&&$.process(_,w,x,U,L,j,J,Q,G,re)}ae!=null&&L?li(ae,_&&_.ref,j,w||_,!w):ae==null&&_&&_.ref!=null&&li(_.ref,null,j,_,!0)},M=(_,w,x,U)=>{if(_==null)r(w.el=l(w.children),x,U);else{const L=w.el=_.el;w.children!==_.children&&h(L,w.children)}},H=(_,w,x,U)=>{_==null?r(w.el=c(w.children||""),x,U):w.el=_.el},z=(_,w,x,U)=>{[_.el,_.anchor]=k(_.children,w,x,U,_.el,_.anchor)},K=({el:_,anchor:w},x,U)=>{let L;for(;_&&_!==w;)L=g(_),r(_,x,U),_=L;r(w,x,U)},W=({el:_,anchor:w})=>{let x;for(;_&&_!==w;)x=g(_),s(_),_=x;s(w)},fe=(_,w,x,U,L,j,J,Q,G)=>{w.type==="svg"?J="svg":w.type==="math"&&(J="mathml"),_==null?ie(w,x,U,L,j,J,Q,G):T(_,w,L,j,J,Q,G)},ie=(_,w,x,U,L,j,J,Q)=>{let G,$;const{props:ae,shapeFlag:X,transition:ne,dirs:ue}=_;if(G=_.el=a(_.type,j,ae&&ae.is,ae),X&8?d(G,_.children):X&16&&E(_.children,G,null,U,L,pl(_,j),J,Q),ue&&Or(_,null,U,"created"),R(G,_,_.scopeId,J,U),ae){for(const we in ae)we!=="value"&&!ii(we)&&i(G,we,null,ae[we],j,U);"value"in ae&&i(G,"value",null,ae.value,j),($=ae.onVnodeBeforeMount)&&yn($,U,_)}ue&&Or(_,null,U,"beforeMount");const he=Wy(L,ne);he&&ne.beforeEnter(G),r(G,w,x),(($=ae&&ae.onVnodeMounted)||he||ue)&&rn(()=>{$&&yn($,U,_),he&&ne.enter(G),ue&&Or(_,null,U,"mounted")},L)},R=(_,w,x,U,L)=>{if(x&&y(_,x),U)for(let j=0;j<U.length;j++)y(_,U[j]);if(L){let j=L.subTree;if(w===j||wp(j.type)&&(j.ssContent===w||j.ssFallback===w)){const J=L.vnode;R(_,J,J.scopeId,J.slotScopeIds,L.parent)}}},E=(_,w,x,U,L,j,J,Q,G=0)=>{for(let $=G;$<_.length;$++){const ae=_[$]=Q?or(_[$]):En(_[$]);N(null,ae,w,x,U,L,j,J,Q)}},T=(_,w,x,U,L,j,J)=>{const Q=w.el=_.el;let{patchFlag:G,dynamicChildren:$,dirs:ae}=w;G|=_.patchFlag&16;const X=_.props||Ge,ne=w.props||Ge;let ue;if(x&&Mr(x,!1),(ue=ne.onVnodeBeforeUpdate)&&yn(ue,x,w,_),ae&&Or(w,_,x,"beforeUpdate"),x&&Mr(x,!0),(X.innerHTML&&ne.innerHTML==null||X.textContent&&ne.textContent==null)&&d(Q,""),$?v(_.dynamicChildren,$,Q,x,U,pl(w,L),j):J||Re(_,w,Q,null,x,U,pl(w,L),j,!1),G>0){if(G&16)S(Q,X,ne,x,L);else if(G&2&&X.class!==ne.class&&i(Q,"class",null,ne.class,L),G&4&&i(Q,"style",X.style,ne.style,L),G&8){const he=w.dynamicProps;for(let we=0;we<he.length;we++){const xe=he[we],mt=X[xe],it=ne[xe];(it!==mt||xe==="value")&&i(Q,xe,mt,it,L,x)}}G&1&&_.children!==w.children&&d(Q,w.children)}else!J&&$==null&&S(Q,X,ne,x,L);((ue=ne.onVnodeUpdated)||ae)&&rn(()=>{ue&&yn(ue,x,w,_),ae&&Or(w,_,x,"updated")},U)},v=(_,w,x,U,L,j,J)=>{for(let Q=0;Q<w.length;Q++){const G=_[Q],$=w[Q],ae=G.el&&(G.type===lt||!Ys(G,$)||G.shapeFlag&198)?p(G.el):x;N(G,$,ae,null,U,L,j,J,!0)}},S=(_,w,x,U,L)=>{if(w!==x){if(w!==Ge)for(const j in w)!ii(j)&&!(j in x)&&i(_,j,w[j],null,L,U);for(const j in x){if(ii(j))continue;const J=x[j],Q=w[j];J!==Q&&j!=="value"&&i(_,j,Q,J,L,U)}"value"in x&&i(_,"value",w.value,x.value,L)}},P=(_,w,x,U,L,j,J,Q,G)=>{const $=w.el=_?_.el:l(""),ae=w.anchor=_?_.anchor:l("");let{patchFlag:X,dynamicChildren:ne,slotScopeIds:ue}=w;ue&&(Q=Q?Q.concat(ue):ue),_==null?(r($,x,U),r(ae,x,U),E(w.children||[],x,ae,L,j,J,Q,G)):X>0&&X&64&&ne&&_.dynamicChildren?(v(_.dynamicChildren,ne,x,L,j,J,Q),(w.key!=null||L&&w===L.subTree)&&mp(_,w,!0)):Re(_,w,x,ae,L,j,J,Q,G)},I=(_,w,x,U,L,j,J,Q,G)=>{w.slotScopeIds=Q,_==null?w.shapeFlag&512?L.ctx.activate(w,x,U,J,G):ut(w,x,U,L,j,J,G):Pe(_,w,G)},ut=(_,w,x,U,L,j,J)=>{const Q=_.component=dv(_,U,L);if(tp(_)&&(Q.ctx.renderer=re),fv(Q,!1,J),Q.asyncDep){if(L&&L.registerDep(Q,Me,J),!_.el){const G=Q.subTree=St(Er);H(null,G,w,x)}}else Me(Q,_,w,x,L,j,J)},Pe=(_,w,x)=>{const U=w.component=_.component;if(nv(_,w,x))if(U.asyncDep&&!U.asyncResolved){Ce(U,w,x);return}else U.next=w,U.update();else w.el=_.el,U.vnode=w},Me=(_,w,x,U,L,j,J)=>{const Q=()=>{if(_.isMounted){let{next:X,bu:ne,u:ue,parent:he,vnode:we}=_;{const et=gp(_);if(et){X&&(X.el=we.el,Ce(_,X,J)),et.asyncDep.then(()=>{_.isUnmounted||Q()});return}}let xe=X,mt;Mr(_,!1),X?(X.el=we.el,Ce(_,X,J)):X=we,ne&&So(ne),(mt=X.props&&X.props.onVnodeBeforeUpdate)&&yn(mt,he,X,we),Mr(_,!0);const it=ml(_),xt=_.subTree;_.subTree=it,N(xt,it,p(xt.el),O(xt),_,L,j),X.el=it.el,xe===null&&rv(_,it.el),ue&&rn(ue,L),(mt=X.props&&X.props.onVnodeUpdated)&&rn(()=>yn(mt,he,X,we),L)}else{let X;const{el:ne,props:ue}=w,{bm:he,m:we,parent:xe,root:mt,type:it}=_,xt=ci(w);if(Mr(_,!1),he&&So(he),!xt&&(X=ue&&ue.onVnodeBeforeMount)&&yn(X,xe,w),Mr(_,!0),ne&&de){const et=()=>{_.subTree=ml(_),de(ne,_.subTree,_,L,null)};xt&&it.__asyncHydrate?it.__asyncHydrate(ne,_,et):et()}else{mt.ce&&mt.ce._def.shadowRoot!==!1&&mt.ce._injectChildStyle(it);const et=_.subTree=ml(_);N(null,et,x,U,_,L,j),w.el=et.el}if(we&&rn(we,L),!xt&&(X=ue&&ue.onVnodeMounted)){const et=w;rn(()=>yn(X,xe,et),L)}(w.shapeFlag&256||xe&&ci(xe.vnode)&&xe.vnode.shapeFlag&256)&&_.a&&rn(_.a,L),_.isMounted=!0,w=x=U=null}};_.scope.on();const G=_.effect=new xf(Q);_.scope.off();const $=_.update=G.run.bind(G),ae=_.job=G.runIfDirty.bind(G);ae.i=_,ae.id=_.uid,G.scheduler=()=>Nc(ae),Mr(_,!0),$()},Ce=(_,w,x)=>{w.component=_;const U=_.vnode.props;_.vnode=w,_.next=null,jy(_,w.props,U,x),zy(_,w.children,x),Hn(),_h(_),Kn()},Re=(_,w,x,U,L,j,J,Q,G=!1)=>{const $=_&&_.children,ae=_?_.shapeFlag:0,X=w.children,{patchFlag:ne,shapeFlag:ue}=w;if(ne>0){if(ne&128){$t($,X,x,U,L,j,J,Q,G);return}else if(ne&256){Bt($,X,x,U,L,j,J,Q,G);return}}ue&8?(ae&16&&ht($,L,j),X!==$&&d(x,X)):ae&16?ue&16?$t($,X,x,U,L,j,J,Q,G):ht($,L,j,!0):(ae&8&&d(x,""),ue&16&&E(X,x,U,L,j,J,Q,G))},Bt=(_,w,x,U,L,j,J,Q,G)=>{_=_||ds,w=w||ds;const $=_.length,ae=w.length,X=Math.min($,ae);let ne;for(ne=0;ne<X;ne++){const ue=w[ne]=G?or(w[ne]):En(w[ne]);N(_[ne],ue,x,null,L,j,J,Q,G)}$>ae?ht(_,L,j,!0,!1,X):E(w,x,U,L,j,J,Q,G,X)},$t=(_,w,x,U,L,j,J,Q,G)=>{let $=0;const ae=w.length;let X=_.length-1,ne=ae-1;for(;$<=X&&$<=ne;){const ue=_[$],he=w[$]=G?or(w[$]):En(w[$]);if(Ys(ue,he))N(ue,he,x,null,L,j,J,Q,G);else break;$++}for(;$<=X&&$<=ne;){const ue=_[X],he=w[ne]=G?or(w[ne]):En(w[ne]);if(Ys(ue,he))N(ue,he,x,null,L,j,J,Q,G);else break;X--,ne--}if($>X){if($<=ne){const ue=ne+1,he=ue<ae?w[ue].el:U;for(;$<=ne;)N(null,w[$]=G?or(w[$]):En(w[$]),x,he,L,j,J,Q,G),$++}}else if($>ne)for(;$<=X;)qe(_[$],L,j,!0),$++;else{const ue=$,he=$,we=new Map;for($=he;$<=ne;$++){const gt=w[$]=G?or(w[$]):En(w[$]);gt.key!=null&&we.set(gt.key,$)}let xe,mt=0;const it=ne-he+1;let xt=!1,et=0;const tn=new Array(it);for($=0;$<it;$++)tn[$]=0;for($=ue;$<=X;$++){const gt=_[$];if(mt>=it){qe(gt,L,j,!0);continue}let Gt;if(gt.key!=null)Gt=we.get(gt.key);else for(xe=he;xe<=ne;xe++)if(tn[xe-he]===0&&Ys(gt,w[xe])){Gt=xe;break}Gt===void 0?qe(gt,L,j,!0):(tn[Gt-he]=$+1,Gt>=et?et=Gt:xt=!0,N(gt,w[Gt],x,null,L,j,J,Q,G),mt++)}const _n=xt?Gy(tn):ds;for(xe=_n.length-1,$=it-1;$>=0;$--){const gt=he+$,Gt=w[gt],Zr=gt+1<ae?w[gt+1].el:U;tn[$]===0?N(null,Gt,x,Zr,L,j,J,Q,G):xt&&(xe<0||$!==_n[xe]?Wt(Gt,x,Zr,2):xe--)}}},Wt=(_,w,x,U,L=null)=>{const{el:j,type:J,transition:Q,children:G,shapeFlag:$}=_;if($&6){Wt(_.component.subTree,w,x,U);return}if($&128){_.suspense.move(w,x,U);return}if($&64){J.move(_,w,x,re);return}if(J===lt){r(j,w,x);for(let X=0;X<G.length;X++)Wt(G[X],w,x,U);r(_.anchor,w,x);return}if(J===Co){K(_,w,x);return}if(U!==2&&$&1&&Q)if(U===0)Q.beforeEnter(j),r(j,w,x),rn(()=>Q.enter(j),L);else{const{leave:X,delayLeave:ne,afterLeave:ue}=Q,he=()=>{_.ctx.isUnmounted?s(j):r(j,w,x)},we=()=>{X(j,()=>{he(),ue&&ue()})};ne?ne(j,he,we):we()}else r(j,w,x)},qe=(_,w,x,U=!1,L=!1)=>{const{type:j,props:J,ref:Q,children:G,dynamicChildren:$,shapeFlag:ae,patchFlag:X,dirs:ne,cacheIndex:ue}=_;if(X===-2&&(L=!1),Q!=null&&(Hn(),li(Q,null,x,_,!0),Kn()),ue!=null&&(w.renderCache[ue]=void 0),ae&256){w.ctx.deactivate(_);return}const he=ae&1&&ne,we=!ci(_);let xe;if(we&&(xe=J&&J.onVnodeBeforeUnmount)&&yn(xe,w,_),ae&6)wt(_.component,x,U);else{if(ae&128){_.suspense.unmount(x,U);return}he&&Or(_,null,w,"beforeUnmount"),ae&64?_.type.remove(_,w,x,re,U):$&&!$.hasOnce&&(j!==lt||X>0&&X&64)?ht($,w,x,!1,!0):(j===lt&&X&384||!L&&ae&16)&&ht(G,w,x),U&&Ke(_)}(we&&(xe=J&&J.onVnodeUnmounted)||he)&&rn(()=>{xe&&yn(xe,w,_),he&&Or(_,null,w,"unmounted")},x)},Ke=_=>{const{type:w,el:x,anchor:U,transition:L}=_;if(w===lt){qt(x,U);return}if(w===Co){W(_);return}const j=()=>{s(x),L&&!L.persisted&&L.afterLeave&&L.afterLeave()};if(_.shapeFlag&1&&L&&!L.persisted){const{leave:J,delayLeave:Q}=L,G=()=>J(x,j);Q?Q(_.el,j,G):G()}else j()},qt=(_,w)=>{let x;for(;_!==w;)x=g(_),s(_),_=x;s(w)},wt=(_,w,x)=>{const{bum:U,scope:L,job:j,subTree:J,um:Q,m:G,a:$,parent:ae,slots:{__:X}}=_;Ih(G),Ih($),U&&So(U),ae&&ye(X)&&X.forEach(ne=>{ae.renderCache[ne]=void 0}),L.stop(),j&&(j.flags|=8,qe(J,_,w,x)),Q&&rn(Q,w),rn(()=>{_.isUnmounted=!0},w),w&&w.pendingBranch&&!w.isUnmounted&&_.asyncDep&&!_.asyncResolved&&_.suspenseId===w.pendingId&&(w.deps--,w.deps===0&&w.resolve())},ht=(_,w,x,U=!1,L=!1,j=0)=>{for(let J=j;J<_.length;J++)qe(_[J],w,x,U,L)},O=_=>{if(_.shapeFlag&6)return O(_.component.subTree);if(_.shapeFlag&128)return _.suspense.next();const w=g(_.anchor||_.el),x=w&&w[my];return x?g(x):w};let ee=!1;const Z=(_,w,x)=>{_==null?w._vnode&&qe(w._vnode,null,null,!0):N(w._vnode||null,_,w,null,null,null,x),w._vnode=_,ee||(ee=!0,_h(),Jf(),ee=!1)},re={p:N,um:qe,m:Wt,r:Ke,mt:ut,mc:E,pc:Re,pbc:v,n:O,o:t};let Se,de;return e&&([Se,de]=e(re)),{render:Z,hydrate:Se,createApp:Fy(Z,Se)}}function pl({type:t,props:e},n){return n==="svg"&&t==="foreignObject"||n==="mathml"&&t==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:n}function Mr({effect:t,job:e},n){n?(t.flags|=32,e.flags|=4):(t.flags&=-33,e.flags&=-5)}function Wy(t,e){return(!t||t&&!t.pendingBranch)&&e&&!e.persisted}function mp(t,e,n=!1){const r=t.children,s=e.children;if(ye(r)&&ye(s))for(let i=0;i<r.length;i++){const a=r[i];let l=s[i];l.shapeFlag&1&&!l.dynamicChildren&&((l.patchFlag<=0||l.patchFlag===32)&&(l=s[i]=or(s[i]),l.el=a.el),!n&&l.patchFlag!==-2&&mp(a,l)),l.type===wa&&(l.el=a.el),l.type===Er&&!l.el&&(l.el=a.el)}}function Gy(t){const e=t.slice(),n=[0];let r,s,i,a,l;const c=t.length;for(r=0;r<c;r++){const h=t[r];if(h!==0){if(s=n[n.length-1],t[s]<h){e[r]=s,n.push(r);continue}for(i=0,a=n.length-1;i<a;)l=i+a>>1,t[n[l]]<h?i=l+1:a=l;h<t[n[i]]&&(i>0&&(e[r]=n[i-1]),n[i]=r)}}for(i=n.length,a=n[i-1];i-- >0;)n[i]=a,a=e[a];return n}function gp(t){const e=t.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:gp(e)}function Ih(t){if(t)for(let e=0;e<t.length;e++)t[e].flags|=8}const Qy=Symbol.for("v-scx"),Jy=()=>bn(Qy);function ys(t,e,n){return _p(t,e,n)}function _p(t,e,n=Ge){const{immediate:r,deep:s,flush:i,once:a}=n,l=vt({},n),c=e&&r||!e&&i!=="post";let h;if(Ii){if(i==="sync"){const y=Jy();h=y.__watcherHandles||(y.__watcherHandles=[])}else if(!c){const y=()=>{};return y.stop=fn,y.resume=fn,y.pause=fn,y}}const d=Lt;l.call=(y,k,N)=>Sn(y,d,k,N);let p=!1;i==="post"?l.scheduler=y=>{rn(y,d&&d.suspense)}:i!=="sync"&&(p=!0,l.scheduler=(y,k)=>{k?y():Nc(y)}),l.augmentJob=y=>{e&&(y.flags|=4),p&&(y.flags|=2,d&&(y.id=d.uid,y.i=d))};const g=uy(t,e,l);return Ii&&(h?h.push(g):c&&g()),g}function Yy(t,e,n){const r=this.proxy,s=pt(t)?t.includes(".")?yp(r,t):()=>r[t]:t.bind(r,r);let i;Ie(e)?i=e:(i=e.handler,n=e);const a=Ui(this),l=_p(s,i.bind(r),n);return a(),l}function yp(t,e){const n=e.split(".");return()=>{let r=t;for(let s=0;s<n.length&&r;s++)r=r[n[s]];return r}}const Xy=(t,e)=>e==="modelValue"||e==="model-value"?t.modelModifiers:t[`${e}Modifiers`]||t[`${cn(e)}Modifiers`]||t[`${Sr(e)}Modifiers`];function Zy(t,e,...n){if(t.isUnmounted)return;const r=t.vnode.props||Ge;let s=n;const i=e.startsWith("update:"),a=i&&Xy(r,e.slice(7));a&&(a.trim&&(s=n.map(d=>pt(d)?d.trim():d)),a.number&&(s=n.map(Ll)));let l,c=r[l=ll(e)]||r[l=ll(cn(e))];!c&&i&&(c=r[l=ll(Sr(e))]),c&&Sn(c,t,6,s);const h=r[l+"Once"];if(h){if(!t.emitted)t.emitted={};else if(t.emitted[l])return;t.emitted[l]=!0,Sn(h,t,6,s)}}function vp(t,e,n=!1){const r=e.emitsCache,s=r.get(t);if(s!==void 0)return s;const i=t.emits;let a={},l=!1;if(!Ie(t)){const c=h=>{const d=vp(h,e,!0);d&&(l=!0,vt(a,d))};!n&&e.mixins.length&&e.mixins.forEach(c),t.extends&&c(t.extends),t.mixins&&t.mixins.forEach(c)}return!i&&!l?(tt(t)&&r.set(t,null),null):(ye(i)?i.forEach(c=>a[c]=null):vt(a,i),tt(t)&&r.set(t,a),a)}function va(t,e){return!t||!ua(e)?!1:(e=e.slice(2).replace(/Once$/,""),$e(t,e[0].toLowerCase()+e.slice(1))||$e(t,Sr(e))||$e(t,e))}function ml(t){const{type:e,vnode:n,proxy:r,withProxy:s,propsOptions:[i],slots:a,attrs:l,emit:c,render:h,renderCache:d,props:p,data:g,setupState:y,ctx:k,inheritAttrs:N}=t,M=zo(t);let H,z;try{if(n.shapeFlag&4){const W=s||r,fe=W;H=En(h.call(fe,W,d,p,y,g,k)),z=l}else{const W=e;H=En(W.length>1?W(p,{attrs:l,slots:a,emit:c}):W(p,null)),z=e.props?l:ev(l)}}catch(W){hi.length=0,_a(W,t,1),H=St(Er)}let K=H;if(z&&N!==!1){const W=Object.keys(z),{shapeFlag:fe}=K;W.length&&fe&7&&(i&&W.some(bc)&&(z=tv(z,i)),K=Ts(K,z,!1,!0))}return n.dirs&&(K=Ts(K,null,!1,!0),K.dirs=K.dirs?K.dirs.concat(n.dirs):n.dirs),n.transition&&Vc(K,n.transition),H=K,zo(M),H}const ev=t=>{let e;for(const n in t)(n==="class"||n==="style"||ua(n))&&((e||(e={}))[n]=t[n]);return e},tv=(t,e)=>{const n={};for(const r in t)(!bc(r)||!(r.slice(9)in e))&&(n[r]=t[r]);return n};function nv(t,e,n){const{props:r,children:s,component:i}=t,{props:a,children:l,patchFlag:c}=e,h=i.emitsOptions;if(e.dirs||e.transition)return!0;if(n&&c>=0){if(c&1024)return!0;if(c&16)return r?Ah(r,a,h):!!a;if(c&8){const d=e.dynamicProps;for(let p=0;p<d.length;p++){const g=d[p];if(a[g]!==r[g]&&!va(h,g))return!0}}}else return(s||l)&&(!l||!l.$stable)?!0:r===a?!1:r?a?Ah(r,a,h):!0:!!a;return!1}function Ah(t,e,n){const r=Object.keys(e);if(r.length!==Object.keys(t).length)return!0;for(let s=0;s<r.length;s++){const i=r[s];if(e[i]!==t[i]&&!va(n,i))return!0}return!1}function rv({vnode:t,parent:e},n){for(;e;){const r=e.subTree;if(r.suspense&&r.suspense.activeBranch===t&&(r.el=t.el),r===t)(t=e.vnode).el=n,e=e.parent;else break}}const wp=t=>t.__isSuspense;function sv(t,e){e&&e.pendingBranch?ye(t)?e.effects.push(...t):e.effects.push(t):fy(t)}const lt=Symbol.for("v-fgt"),wa=Symbol.for("v-txt"),Er=Symbol.for("v-cmt"),Co=Symbol.for("v-stc"),hi=[];let on=null;function me(t=!1){hi.push(on=t?null:[])}function iv(){hi.pop(),on=hi[hi.length-1]||null}let Ti=1;function Rh(t,e=!1){Ti+=t,t<0&&on&&e&&(on.hasOnce=!0)}function Ep(t){return t.dynamicChildren=Ti>0?on||ds:null,iv(),Ti>0&&on&&on.push(t),t}function Ee(t,e,n,r,s,i){return Ep(b(t,e,n,r,s,i,!0))}function bp(t,e,n,r,s){return Ep(St(t,e,n,r,s,!0))}function Ko(t){return t?t.__v_isVNode===!0:!1}function Ys(t,e){return t.type===e.type&&t.key===e.key}const Tp=({key:t})=>t??null,xo=({ref:t,ref_key:e,ref_for:n})=>(typeof t=="number"&&(t=""+t),t!=null?pt(t)||Ft(t)||Ie(t)?{i:sn,r:t,k:e,f:!!n}:t:null);function b(t,e=null,n=null,r=0,s=null,i=t===lt?0:1,a=!1,l=!1){const c={__v_isVNode:!0,__v_skip:!0,type:t,props:e,key:e&&Tp(e),ref:e&&xo(e),scopeId:Xf,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:r,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:sn};return l?(Uc(c,n),i&128&&t.normalize(c)):n&&(c.shapeFlag|=pt(n)?8:16),Ti>0&&!a&&on&&(c.patchFlag>0||i&6)&&c.patchFlag!==32&&on.push(c),c}const St=ov;function ov(t,e=null,n=null,r=0,s=null,i=!1){if((!t||t===Cy)&&(t=Er),Ko(t)){const l=Ts(t,e,!0);return n&&Uc(l,n),Ti>0&&!i&&on&&(l.shapeFlag&6?on[on.indexOf(t)]=l:on.push(l)),l.patchFlag=-2,l}if(yv(t)&&(t=t.__vccOpts),e){e=av(e);let{class:l,style:c}=e;l&&!pt(l)&&(e.class=Li(l)),tt(c)&&(kc(c)&&!ye(c)&&(c=vt({},c)),e.style=vi(c))}const a=pt(t)?1:wp(t)?128:gy(t)?64:tt(t)?4:Ie(t)?2:0;return b(t,e,n,r,s,a,i,!0)}function av(t){return t?kc(t)||cp(t)?vt({},t):t:null}function Ts(t,e,n=!1,r=!1){const{props:s,ref:i,patchFlag:a,children:l,transition:c}=t,h=e?cv(s||{},e):s,d={__v_isVNode:!0,__v_skip:!0,type:t.type,props:h,key:h&&Tp(h),ref:e&&e.ref?n&&i?ye(i)?i.concat(xo(e)):[i,xo(e)]:xo(e):i,scopeId:t.scopeId,slotScopeIds:t.slotScopeIds,children:l,target:t.target,targetStart:t.targetStart,targetAnchor:t.targetAnchor,staticCount:t.staticCount,shapeFlag:t.shapeFlag,patchFlag:e&&t.type!==lt?a===-1?16:a|16:a,dynamicProps:t.dynamicProps,dynamicChildren:t.dynamicChildren,appContext:t.appContext,dirs:t.dirs,transition:c,component:t.component,suspense:t.suspense,ssContent:t.ssContent&&Ts(t.ssContent),ssFallback:t.ssFallback&&Ts(t.ssFallback),el:t.el,anchor:t.anchor,ctx:t.ctx,ce:t.ce};return c&&r&&Vc(d,c.clone(d)),d}function lv(t=" ",e=0){return St(wa,null,t,e)}function gl(t,e){const n=St(Co,null,t);return n.staticCount=e,n}function Tt(t="",e=!1){return e?(me(),bp(Er,null,t)):St(Er,null,t)}function En(t){return t==null||typeof t=="boolean"?St(Er):ye(t)?St(lt,null,t.slice()):Ko(t)?or(t):St(wa,null,String(t))}function or(t){return t.el===null&&t.patchFlag!==-1||t.memo?t:Ts(t)}function Uc(t,e){let n=0;const{shapeFlag:r}=t;if(e==null)e=null;else if(ye(e))n=16;else if(typeof e=="object")if(r&65){const s=e.default;s&&(s._c&&(s._d=!1),Uc(t,s()),s._c&&(s._d=!0));return}else{n=32;const s=e._;!s&&!cp(e)?e._ctx=sn:s===3&&sn&&(sn.slots._===1?e._=1:(e._=2,t.patchFlag|=1024))}else Ie(e)?(e={default:e,_ctx:sn},n=32):(e=String(e),r&64?(n=16,e=[lv(e)]):n=8);t.children=e,t.shapeFlag|=n}function cv(...t){const e={};for(let n=0;n<t.length;n++){const r=t[n];for(const s in r)if(s==="class")e.class!==r.class&&(e.class=Li([e.class,r.class]));else if(s==="style")e.style=vi([e.style,r.style]);else if(ua(s)){const i=e[s],a=r[s];a&&i!==a&&!(ye(i)&&i.includes(a))&&(e[s]=i?[].concat(i,a):a)}else s!==""&&(e[s]=r[s])}return e}function yn(t,e,n,r=null){Sn(t,e,7,[n,r])}const uv=op();let hv=0;function dv(t,e,n){const r=t.type,s=(e?e.appContext:t.appContext)||uv,i={uid:hv++,vnode:t,type:r,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new L_(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:hp(r,s),emitsOptions:vp(r,s),emit:null,emitted:null,propsDefaults:Ge,inheritAttrs:r.inheritAttrs,ctx:Ge,data:Ge,props:Ge,attrs:Ge,slots:Ge,refs:Ge,setupState:Ge,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=e?e.root:i,i.emit=Zy.bind(null,i),t.ce&&t.ce(i),i}let Lt=null,Wo,Kl;{const t=pa(),e=(n,r)=>{let s;return(s=t[n])||(s=t[n]=[]),s.push(r),i=>{s.length>1?s.forEach(a=>a(i)):s[0](i)}};Wo=e("__VUE_INSTANCE_SETTERS__",n=>Lt=n),Kl=e("__VUE_SSR_SETTERS__",n=>Ii=n)}const Ui=t=>{const e=Lt;return Wo(t),t.scope.on(),()=>{t.scope.off(),Wo(e)}},Sh=()=>{Lt&&Lt.scope.off(),Wo(null)};function Ip(t){return t.vnode.shapeFlag&4}let Ii=!1;function fv(t,e=!1,n=!1){e&&Kl(e);const{props:r,children:s}=t.vnode,i=Ip(t);Uy(t,r,i,e),qy(t,s,n||e);const a=i?pv(t,e):void 0;return e&&Kl(!1),a}function pv(t,e){const n=t.type;t.accessCache=Object.create(null),t.proxy=new Proxy(t.ctx,ky);const{setup:r}=n;if(r){Hn();const s=t.setupContext=r.length>1?gv(t):null,i=Ui(t),a=Fi(r,t,0,[t.props,s]),l=If(a);if(Kn(),i(),(l||t.sp)&&!ci(t)&&ep(t),l){if(a.then(Sh,Sh),e)return a.then(c=>{Ph(t,c,e)}).catch(c=>{_a(c,t,0)});t.asyncDep=a}else Ph(t,a,e)}else Ap(t,e)}function Ph(t,e,n){Ie(e)?t.type.__ssrInlineRender?t.ssrRender=e:t.render=e:tt(e)&&(t.setupState=Wf(e)),Ap(t,n)}let Ch;function Ap(t,e,n){const r=t.type;if(!t.render){if(!e&&Ch&&!r.render){const s=r.template||Mc(t).template;if(s){const{isCustomElement:i,compilerOptions:a}=t.appContext.config,{delimiters:l,compilerOptions:c}=r,h=vt(vt({isCustomElement:i,delimiters:l},a),c);r.render=Ch(s,h)}}t.render=r.render||fn}{const s=Ui(t);Hn();try{Dy(t)}finally{Kn(),s()}}}const mv={get(t,e){return Ot(t,"get",""),t[e]}};function gv(t){const e=n=>{t.exposed=n||{}};return{attrs:new Proxy(t.attrs,mv),slots:t.slots,emit:t.emit,expose:e}}function Ea(t){return t.exposed?t.exposeProxy||(t.exposeProxy=new Proxy(Wf(ry(t.exposed)),{get(e,n){if(n in e)return e[n];if(n in ui)return ui[n](t)},has(e,n){return n in e||n in ui}})):t.proxy}function _v(t,e=!0){return Ie(t)?t.displayName||t.name:t.name||e&&t.__name}function yv(t){return Ie(t)&&"__vccOpts"in t}const hn=(t,e)=>ly(t,e,Ii);function Rp(t,e,n){const r=arguments.length;return r===2?tt(e)&&!ye(e)?Ko(e)?St(t,null,[e]):St(t,e):St(t,null,e):(r>3?n=Array.prototype.slice.call(arguments,2):r===3&&Ko(n)&&(n=[n]),St(t,e,n))}const vv="3.5.17";/**
* @vue/runtime-dom v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Wl;const xh=typeof window<"u"&&window.trustedTypes;if(xh)try{Wl=xh.createPolicy("vue",{createHTML:t=>t})}catch{}const Sp=Wl?t=>Wl.createHTML(t):t=>t,wv="http://www.w3.org/2000/svg",Ev="http://www.w3.org/1998/Math/MathML",Ln=typeof document<"u"?document:null,kh=Ln&&Ln.createElement("template"),bv={insert:(t,e,n)=>{e.insertBefore(t,n||null)},remove:t=>{const e=t.parentNode;e&&e.removeChild(t)},createElement:(t,e,n,r)=>{const s=e==="svg"?Ln.createElementNS(wv,t):e==="mathml"?Ln.createElementNS(Ev,t):n?Ln.createElement(t,{is:n}):Ln.createElement(t);return t==="select"&&r&&r.multiple!=null&&s.setAttribute("multiple",r.multiple),s},createText:t=>Ln.createTextNode(t),createComment:t=>Ln.createComment(t),setText:(t,e)=>{t.nodeValue=e},setElementText:(t,e)=>{t.textContent=e},parentNode:t=>t.parentNode,nextSibling:t=>t.nextSibling,querySelector:t=>Ln.querySelector(t),setScopeId(t,e){t.setAttribute(e,"")},insertStaticContent(t,e,n,r,s,i){const a=n?n.previousSibling:e.lastChild;if(s&&(s===i||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),n),!(s===i||!(s=s.nextSibling)););else{kh.innerHTML=Sp(r==="svg"?`<svg>${t}</svg>`:r==="mathml"?`<math>${t}</math>`:t);const l=kh.content;if(r==="svg"||r==="mathml"){const c=l.firstChild;for(;c.firstChild;)l.appendChild(c.firstChild);l.removeChild(c)}e.insertBefore(l,n)}return[a?a.nextSibling:e.firstChild,n?n.previousSibling:e.lastChild]}},Tv=Symbol("_vtc");function Iv(t,e,n){const r=t[Tv];r&&(e=(e?[e,...r]:[...r]).join(" ")),e==null?t.removeAttribute("class"):n?t.setAttribute("class",e):t.className=e}const Dh=Symbol("_vod"),Av=Symbol("_vsh"),Rv=Symbol(""),Sv=/(^|;)\s*display\s*:/;function Pv(t,e,n){const r=t.style,s=pt(n);let i=!1;if(n&&!s){if(e)if(pt(e))for(const a of e.split(";")){const l=a.slice(0,a.indexOf(":")).trim();n[l]==null&&ko(r,l,"")}else for(const a in e)n[a]==null&&ko(r,a,"");for(const a in n)a==="display"&&(i=!0),ko(r,a,n[a])}else if(s){if(e!==n){const a=r[Rv];a&&(n+=";"+a),r.cssText=n,i=Sv.test(n)}}else e&&t.removeAttribute("style");Dh in t&&(t[Dh]=i?r.display:"",t[Av]&&(r.display="none"))}const Nh=/\s*!important$/;function ko(t,e,n){if(ye(n))n.forEach(r=>ko(t,e,r));else if(n==null&&(n=""),e.startsWith("--"))t.setProperty(e,n);else{const r=Cv(t,e);Nh.test(n)?t.setProperty(Sr(r),n.replace(Nh,""),"important"):t[r]=n}}const Vh=["Webkit","Moz","ms"],_l={};function Cv(t,e){const n=_l[e];if(n)return n;let r=cn(e);if(r!=="filter"&&r in t)return _l[e]=r;r=fa(r);for(let s=0;s<Vh.length;s++){const i=Vh[s]+r;if(i in t)return _l[e]=i}return e}const Oh="http://www.w3.org/1999/xlink";function Mh(t,e,n,r,s,i=M_(e)){r&&e.startsWith("xlink:")?n==null?t.removeAttributeNS(Oh,e.slice(6,e.length)):t.setAttributeNS(Oh,e,n):n==null||i&&!Sf(n)?t.removeAttribute(e):t.setAttribute(e,i?"":Rr(n)?String(n):n)}function Lh(t,e,n,r,s){if(e==="innerHTML"||e==="textContent"){n!=null&&(t[e]=e==="innerHTML"?Sp(n):n);return}const i=t.tagName;if(e==="value"&&i!=="PROGRESS"&&!i.includes("-")){const l=i==="OPTION"?t.getAttribute("value")||"":t.value,c=n==null?t.type==="checkbox"?"on":"":String(n);(l!==c||!("_value"in t))&&(t.value=c),n==null&&t.removeAttribute(e),t._value=n;return}let a=!1;if(n===""||n==null){const l=typeof t[e];l==="boolean"?n=Sf(n):n==null&&l==="string"?(n="",a=!0):l==="number"&&(n=0,a=!0)}try{t[e]=n}catch{}a&&t.removeAttribute(s||e)}function os(t,e,n,r){t.addEventListener(e,n,r)}function xv(t,e,n,r){t.removeEventListener(e,n,r)}const Fh=Symbol("_vei");function kv(t,e,n,r,s=null){const i=t[Fh]||(t[Fh]={}),a=i[e];if(r&&a)a.value=r;else{const[l,c]=Dv(e);if(r){const h=i[e]=Ov(r,s);os(t,l,h,c)}else a&&(xv(t,l,a,c),i[e]=void 0)}}const Uh=/(?:Once|Passive|Capture)$/;function Dv(t){let e;if(Uh.test(t)){e={};let r;for(;r=t.match(Uh);)t=t.slice(0,t.length-r[0].length),e[r[0].toLowerCase()]=!0}return[t[2]===":"?t.slice(3):Sr(t.slice(2)),e]}let yl=0;const Nv=Promise.resolve(),Vv=()=>yl||(Nv.then(()=>yl=0),yl=Date.now());function Ov(t,e){const n=r=>{if(!r._vts)r._vts=Date.now();else if(r._vts<=n.attached)return;Sn(Mv(r,n.value),e,5,[r])};return n.value=t,n.attached=Vv(),n}function Mv(t,e){if(ye(e)){const n=t.stopImmediatePropagation;return t.stopImmediatePropagation=()=>{n.call(t),t._stopped=!0},e.map(r=>s=>!s._stopped&&r&&r(s))}else return e}const jh=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&t.charCodeAt(2)>96&&t.charCodeAt(2)<123,Lv=(t,e,n,r,s,i)=>{const a=s==="svg";e==="class"?Iv(t,r,a):e==="style"?Pv(t,n,r):ua(e)?bc(e)||kv(t,e,n,r,i):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):Fv(t,e,r,a))?(Lh(t,e,r),!t.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&Mh(t,e,r,a,i,e!=="value")):t._isVueCE&&(/[A-Z]/.test(e)||!pt(r))?Lh(t,cn(e),r,i,e):(e==="true-value"?t._trueValue=r:e==="false-value"&&(t._falseValue=r),Mh(t,e,r,a))};function Fv(t,e,n,r){if(r)return!!(e==="innerHTML"||e==="textContent"||e in t&&jh(e)&&Ie(n));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="form"||e==="list"&&t.tagName==="INPUT"||e==="type"&&t.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=t.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return jh(e)&&pt(n)?!1:e in t}const Bh=t=>{const e=t.props["onUpdate:modelValue"]||!1;return ye(e)?n=>So(e,n):e};function Uv(t){t.target.composing=!0}function $h(t){const e=t.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const vl=Symbol("_assign"),Yt={created(t,{modifiers:{lazy:e,trim:n,number:r}},s){t[vl]=Bh(s);const i=r||s.props&&s.props.type==="number";os(t,e?"change":"input",a=>{if(a.target.composing)return;let l=t.value;n&&(l=l.trim()),i&&(l=Ll(l)),t[vl](l)}),n&&os(t,"change",()=>{t.value=t.value.trim()}),e||(os(t,"compositionstart",Uv),os(t,"compositionend",$h),os(t,"change",$h))},mounted(t,{value:e}){t.value=e??""},beforeUpdate(t,{value:e,oldValue:n,modifiers:{lazy:r,trim:s,number:i}},a){if(t[vl]=Bh(a),t.composing)return;const l=(i||t.type==="number")&&!/^0\d/.test(t.value)?Ll(t.value):t.value,c=e??"";l!==c&&(document.activeElement===t&&t.type!=="range"&&(r&&e===n||s&&t.value.trim()===c)||(t.value=c))}},jv=["ctrl","shift","alt","meta"],Bv={stop:t=>t.stopPropagation(),prevent:t=>t.preventDefault(),self:t=>t.target!==t.currentTarget,ctrl:t=>!t.ctrlKey,shift:t=>!t.shiftKey,alt:t=>!t.altKey,meta:t=>!t.metaKey,left:t=>"button"in t&&t.button!==0,middle:t=>"button"in t&&t.button!==1,right:t=>"button"in t&&t.button!==2,exact:(t,e)=>jv.some(n=>t[`${n}Key`]&&!e.includes(n))},jc=(t,e)=>{const n=t._withMods||(t._withMods={}),r=e.join(".");return n[r]||(n[r]=(s,...i)=>{for(let a=0;a<e.length;a++){const l=Bv[e[a]];if(l&&l(s,e))return}return t(s,...i)})},$v={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},ar=(t,e)=>{const n=t._withKeys||(t._withKeys={}),r=e.join(".");return n[r]||(n[r]=s=>{if(!("key"in s))return;const i=Sr(s.key);if(e.some(a=>a===i||$v[a]===i))return t(s)})},qv=vt({patchProp:Lv},bv);let qh;function zv(){return qh||(qh=Hy(qv))}const Hv=(...t)=>{const e=zv().createApp(...t),{mount:n}=e;return e.mount=r=>{const s=Wv(r);if(!s)return;const i=e._component;!Ie(i)&&!i.render&&!i.template&&(i.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const a=n(s,!1,Kv(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),a},e};function Kv(t){if(t instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&t instanceof MathMLElement)return"mathml"}function Wv(t){return pt(t)?document.querySelector(t):t}const Gv={__name:"App",setup(t){return(e,n)=>{const r=Py("router-view");return me(),bp(r)}}};/*!
  * vue-router v4.5.1
  * (c) 2025 Eduardo San Martin Morote
  * @license MIT
  */const as=typeof document<"u";function Pp(t){return typeof t=="object"||"displayName"in t||"props"in t||"__vccOpts"in t}function Qv(t){return t.__esModule||t[Symbol.toStringTag]==="Module"||t.default&&Pp(t.default)}const je=Object.assign;function wl(t,e){const n={};for(const r in e){const s=e[r];n[r]=mn(s)?s.map(t):t(s)}return n}const di=()=>{},mn=Array.isArray,Cp=/#/g,Jv=/&/g,Yv=/\//g,Xv=/=/g,Zv=/\?/g,xp=/\+/g,e0=/%5B/g,t0=/%5D/g,kp=/%5E/g,n0=/%60/g,Dp=/%7B/g,r0=/%7C/g,Np=/%7D/g,s0=/%20/g;function Bc(t){return encodeURI(""+t).replace(r0,"|").replace(e0,"[").replace(t0,"]")}function i0(t){return Bc(t).replace(Dp,"{").replace(Np,"}").replace(kp,"^")}function Gl(t){return Bc(t).replace(xp,"%2B").replace(s0,"+").replace(Cp,"%23").replace(Jv,"%26").replace(n0,"`").replace(Dp,"{").replace(Np,"}").replace(kp,"^")}function o0(t){return Gl(t).replace(Xv,"%3D")}function a0(t){return Bc(t).replace(Cp,"%23").replace(Zv,"%3F")}function l0(t){return t==null?"":a0(t).replace(Yv,"%2F")}function Ai(t){try{return decodeURIComponent(""+t)}catch{}return""+t}const c0=/\/$/,u0=t=>t.replace(c0,"");function El(t,e,n="/"){let r,s={},i="",a="";const l=e.indexOf("#");let c=e.indexOf("?");return l<c&&l>=0&&(c=-1),c>-1&&(r=e.slice(0,c),i=e.slice(c+1,l>-1?l:e.length),s=t(i)),l>-1&&(r=r||e.slice(0,l),a=e.slice(l,e.length)),r=p0(r??e,n),{fullPath:r+(i&&"?")+i+a,path:r,query:s,hash:Ai(a)}}function h0(t,e){const n=e.query?t(e.query):"";return e.path+(n&&"?")+n+(e.hash||"")}function zh(t,e){return!e||!t.toLowerCase().startsWith(e.toLowerCase())?t:t.slice(e.length)||"/"}function d0(t,e,n){const r=e.matched.length-1,s=n.matched.length-1;return r>-1&&r===s&&Is(e.matched[r],n.matched[s])&&Vp(e.params,n.params)&&t(e.query)===t(n.query)&&e.hash===n.hash}function Is(t,e){return(t.aliasOf||t)===(e.aliasOf||e)}function Vp(t,e){if(Object.keys(t).length!==Object.keys(e).length)return!1;for(const n in t)if(!f0(t[n],e[n]))return!1;return!0}function f0(t,e){return mn(t)?Hh(t,e):mn(e)?Hh(e,t):t===e}function Hh(t,e){return mn(e)?t.length===e.length&&t.every((n,r)=>n===e[r]):t.length===1&&t[0]===e}function p0(t,e){if(t.startsWith("/"))return t;if(!t)return e;const n=e.split("/"),r=t.split("/"),s=r[r.length-1];(s===".."||s===".")&&r.push("");let i=n.length-1,a,l;for(a=0;a<r.length;a++)if(l=r[a],l!==".")if(l==="..")i>1&&i--;else break;return n.slice(0,i).join("/")+"/"+r.slice(a).join("/")}const rr={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};var Ri;(function(t){t.pop="pop",t.push="push"})(Ri||(Ri={}));var fi;(function(t){t.back="back",t.forward="forward",t.unknown=""})(fi||(fi={}));function m0(t){if(!t)if(as){const e=document.querySelector("base");t=e&&e.getAttribute("href")||"/",t=t.replace(/^\w+:\/\/[^\/]+/,"")}else t="/";return t[0]!=="/"&&t[0]!=="#"&&(t="/"+t),u0(t)}const g0=/^[^#]+#/;function _0(t,e){return t.replace(g0,"#")+e}function y0(t,e){const n=document.documentElement.getBoundingClientRect(),r=t.getBoundingClientRect();return{behavior:e.behavior,left:r.left-n.left-(e.left||0),top:r.top-n.top-(e.top||0)}}const ba=()=>({left:window.scrollX,top:window.scrollY});function v0(t){let e;if("el"in t){const n=t.el,r=typeof n=="string"&&n.startsWith("#"),s=typeof n=="string"?r?document.getElementById(n.slice(1)):document.querySelector(n):n;if(!s)return;e=y0(s,t)}else e=t;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.scrollX,e.top!=null?e.top:window.scrollY)}function Kh(t,e){return(history.state?history.state.position-e:-1)+t}const Ql=new Map;function w0(t,e){Ql.set(t,e)}function E0(t){const e=Ql.get(t);return Ql.delete(t),e}let b0=()=>location.protocol+"//"+location.host;function Op(t,e){const{pathname:n,search:r,hash:s}=e,i=t.indexOf("#");if(i>-1){let l=s.includes(t.slice(i))?t.slice(i).length:1,c=s.slice(l);return c[0]!=="/"&&(c="/"+c),zh(c,"")}return zh(n,t)+r+s}function T0(t,e,n,r){let s=[],i=[],a=null;const l=({state:g})=>{const y=Op(t,location),k=n.value,N=e.value;let M=0;if(g){if(n.value=y,e.value=g,a&&a===k){a=null;return}M=N?g.position-N.position:0}else r(y);s.forEach(H=>{H(n.value,k,{delta:M,type:Ri.pop,direction:M?M>0?fi.forward:fi.back:fi.unknown})})};function c(){a=n.value}function h(g){s.push(g);const y=()=>{const k=s.indexOf(g);k>-1&&s.splice(k,1)};return i.push(y),y}function d(){const{history:g}=window;g.state&&g.replaceState(je({},g.state,{scroll:ba()}),"")}function p(){for(const g of i)g();i=[],window.removeEventListener("popstate",l),window.removeEventListener("beforeunload",d)}return window.addEventListener("popstate",l),window.addEventListener("beforeunload",d,{passive:!0}),{pauseListeners:c,listen:h,destroy:p}}function Wh(t,e,n,r=!1,s=!1){return{back:t,current:e,forward:n,replaced:r,position:window.history.length,scroll:s?ba():null}}function I0(t){const{history:e,location:n}=window,r={value:Op(t,n)},s={value:e.state};s.value||i(r.value,{back:null,current:r.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function i(c,h,d){const p=t.indexOf("#"),g=p>-1?(n.host&&document.querySelector("base")?t:t.slice(p))+c:b0()+t+c;try{e[d?"replaceState":"pushState"](h,"",g),s.value=h}catch(y){console.error(y),n[d?"replace":"assign"](g)}}function a(c,h){const d=je({},e.state,Wh(s.value.back,c,s.value.forward,!0),h,{position:s.value.position});i(c,d,!0),r.value=c}function l(c,h){const d=je({},s.value,e.state,{forward:c,scroll:ba()});i(d.current,d,!0);const p=je({},Wh(r.value,c,null),{position:d.position+1},h);i(c,p,!1),r.value=c}return{location:r,state:s,push:l,replace:a}}function A0(t){t=m0(t);const e=I0(t),n=T0(t,e.state,e.location,e.replace);function r(i,a=!0){a||n.pauseListeners(),history.go(i)}const s=je({location:"",base:t,go:r,createHref:_0.bind(null,t)},e,n);return Object.defineProperty(s,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(s,"state",{enumerable:!0,get:()=>e.state.value}),s}function R0(t){return typeof t=="string"||t&&typeof t=="object"}function Mp(t){return typeof t=="string"||typeof t=="symbol"}const Lp=Symbol("");var Gh;(function(t){t[t.aborted=4]="aborted",t[t.cancelled=8]="cancelled",t[t.duplicated=16]="duplicated"})(Gh||(Gh={}));function As(t,e){return je(new Error,{type:t,[Lp]:!0},e)}function Mn(t,e){return t instanceof Error&&Lp in t&&(e==null||!!(t.type&e))}const Qh="[^/]+?",S0={sensitive:!1,strict:!1,start:!0,end:!0},P0=/[.+*?^${}()[\]/\\]/g;function C0(t,e){const n=je({},S0,e),r=[];let s=n.start?"^":"";const i=[];for(const h of t){const d=h.length?[]:[90];n.strict&&!h.length&&(s+="/");for(let p=0;p<h.length;p++){const g=h[p];let y=40+(n.sensitive?.25:0);if(g.type===0)p||(s+="/"),s+=g.value.replace(P0,"\\$&"),y+=40;else if(g.type===1){const{value:k,repeatable:N,optional:M,regexp:H}=g;i.push({name:k,repeatable:N,optional:M});const z=H||Qh;if(z!==Qh){y+=10;try{new RegExp(`(${z})`)}catch(W){throw new Error(`Invalid custom RegExp for param "${k}" (${z}): `+W.message)}}let K=N?`((?:${z})(?:/(?:${z}))*)`:`(${z})`;p||(K=M&&h.length<2?`(?:/${K})`:"/"+K),M&&(K+="?"),s+=K,y+=20,M&&(y+=-8),N&&(y+=-20),z===".*"&&(y+=-50)}d.push(y)}r.push(d)}if(n.strict&&n.end){const h=r.length-1;r[h][r[h].length-1]+=.7000000000000001}n.strict||(s+="/?"),n.end?s+="$":n.strict&&!s.endsWith("/")&&(s+="(?:/|$)");const a=new RegExp(s,n.sensitive?"":"i");function l(h){const d=h.match(a),p={};if(!d)return null;for(let g=1;g<d.length;g++){const y=d[g]||"",k=i[g-1];p[k.name]=y&&k.repeatable?y.split("/"):y}return p}function c(h){let d="",p=!1;for(const g of t){(!p||!d.endsWith("/"))&&(d+="/"),p=!1;for(const y of g)if(y.type===0)d+=y.value;else if(y.type===1){const{value:k,repeatable:N,optional:M}=y,H=k in h?h[k]:"";if(mn(H)&&!N)throw new Error(`Provided param "${k}" is an array but it is not repeatable (* or + modifiers)`);const z=mn(H)?H.join("/"):H;if(!z)if(M)g.length<2&&(d.endsWith("/")?d=d.slice(0,-1):p=!0);else throw new Error(`Missing required param "${k}"`);d+=z}}return d||"/"}return{re:a,score:r,keys:i,parse:l,stringify:c}}function x0(t,e){let n=0;for(;n<t.length&&n<e.length;){const r=e[n]-t[n];if(r)return r;n++}return t.length<e.length?t.length===1&&t[0]===40+40?-1:1:t.length>e.length?e.length===1&&e[0]===40+40?1:-1:0}function Fp(t,e){let n=0;const r=t.score,s=e.score;for(;n<r.length&&n<s.length;){const i=x0(r[n],s[n]);if(i)return i;n++}if(Math.abs(s.length-r.length)===1){if(Jh(r))return 1;if(Jh(s))return-1}return s.length-r.length}function Jh(t){const e=t[t.length-1];return t.length>0&&e[e.length-1]<0}const k0={type:0,value:""},D0=/[a-zA-Z0-9_]/;function N0(t){if(!t)return[[]];if(t==="/")return[[k0]];if(!t.startsWith("/"))throw new Error(`Invalid path "${t}"`);function e(y){throw new Error(`ERR (${n})/"${h}": ${y}`)}let n=0,r=n;const s=[];let i;function a(){i&&s.push(i),i=[]}let l=0,c,h="",d="";function p(){h&&(n===0?i.push({type:0,value:h}):n===1||n===2||n===3?(i.length>1&&(c==="*"||c==="+")&&e(`A repeatable param (${h}) must be alone in its segment. eg: '/:ids+.`),i.push({type:1,value:h,regexp:d,repeatable:c==="*"||c==="+",optional:c==="*"||c==="?"})):e("Invalid state to consume buffer"),h="")}function g(){h+=c}for(;l<t.length;){if(c=t[l++],c==="\\"&&n!==2){r=n,n=4;continue}switch(n){case 0:c==="/"?(h&&p(),a()):c===":"?(p(),n=1):g();break;case 4:g(),n=r;break;case 1:c==="("?n=2:D0.test(c)?g():(p(),n=0,c!=="*"&&c!=="?"&&c!=="+"&&l--);break;case 2:c===")"?d[d.length-1]=="\\"?d=d.slice(0,-1)+c:n=3:d+=c;break;case 3:p(),n=0,c!=="*"&&c!=="?"&&c!=="+"&&l--,d="";break;default:e("Unknown state");break}}return n===2&&e(`Unfinished custom RegExp for param "${h}"`),p(),a(),s}function V0(t,e,n){const r=C0(N0(t.path),n),s=je(r,{record:t,parent:e,children:[],alias:[]});return e&&!s.record.aliasOf==!e.record.aliasOf&&e.children.push(s),s}function O0(t,e){const n=[],r=new Map;e=ed({strict:!1,end:!0,sensitive:!1},e);function s(p){return r.get(p)}function i(p,g,y){const k=!y,N=Xh(p);N.aliasOf=y&&y.record;const M=ed(e,p),H=[N];if("alias"in p){const W=typeof p.alias=="string"?[p.alias]:p.alias;for(const fe of W)H.push(Xh(je({},N,{components:y?y.record.components:N.components,path:fe,aliasOf:y?y.record:N})))}let z,K;for(const W of H){const{path:fe}=W;if(g&&fe[0]!=="/"){const ie=g.record.path,R=ie[ie.length-1]==="/"?"":"/";W.path=g.record.path+(fe&&R+fe)}if(z=V0(W,g,M),y?y.alias.push(z):(K=K||z,K!==z&&K.alias.push(z),k&&p.name&&!Zh(z)&&a(p.name)),Up(z)&&c(z),N.children){const ie=N.children;for(let R=0;R<ie.length;R++)i(ie[R],z,y&&y.children[R])}y=y||z}return K?()=>{a(K)}:di}function a(p){if(Mp(p)){const g=r.get(p);g&&(r.delete(p),n.splice(n.indexOf(g),1),g.children.forEach(a),g.alias.forEach(a))}else{const g=n.indexOf(p);g>-1&&(n.splice(g,1),p.record.name&&r.delete(p.record.name),p.children.forEach(a),p.alias.forEach(a))}}function l(){return n}function c(p){const g=F0(p,n);n.splice(g,0,p),p.record.name&&!Zh(p)&&r.set(p.record.name,p)}function h(p,g){let y,k={},N,M;if("name"in p&&p.name){if(y=r.get(p.name),!y)throw As(1,{location:p});M=y.record.name,k=je(Yh(g.params,y.keys.filter(K=>!K.optional).concat(y.parent?y.parent.keys.filter(K=>K.optional):[]).map(K=>K.name)),p.params&&Yh(p.params,y.keys.map(K=>K.name))),N=y.stringify(k)}else if(p.path!=null)N=p.path,y=n.find(K=>K.re.test(N)),y&&(k=y.parse(N),M=y.record.name);else{if(y=g.name?r.get(g.name):n.find(K=>K.re.test(g.path)),!y)throw As(1,{location:p,currentLocation:g});M=y.record.name,k=je({},g.params,p.params),N=y.stringify(k)}const H=[];let z=y;for(;z;)H.unshift(z.record),z=z.parent;return{name:M,path:N,params:k,matched:H,meta:L0(H)}}t.forEach(p=>i(p));function d(){n.length=0,r.clear()}return{addRoute:i,resolve:h,removeRoute:a,clearRoutes:d,getRoutes:l,getRecordMatcher:s}}function Yh(t,e){const n={};for(const r of e)r in t&&(n[r]=t[r]);return n}function Xh(t){const e={path:t.path,redirect:t.redirect,name:t.name,meta:t.meta||{},aliasOf:t.aliasOf,beforeEnter:t.beforeEnter,props:M0(t),children:t.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in t?t.components||null:t.component&&{default:t.component}};return Object.defineProperty(e,"mods",{value:{}}),e}function M0(t){const e={},n=t.props||!1;if("component"in t)e.default=n;else for(const r in t.components)e[r]=typeof n=="object"?n[r]:n;return e}function Zh(t){for(;t;){if(t.record.aliasOf)return!0;t=t.parent}return!1}function L0(t){return t.reduce((e,n)=>je(e,n.meta),{})}function ed(t,e){const n={};for(const r in t)n[r]=r in e?e[r]:t[r];return n}function F0(t,e){let n=0,r=e.length;for(;n!==r;){const i=n+r>>1;Fp(t,e[i])<0?r=i:n=i+1}const s=U0(t);return s&&(r=e.lastIndexOf(s,r-1)),r}function U0(t){let e=t;for(;e=e.parent;)if(Up(e)&&Fp(t,e)===0)return e}function Up({record:t}){return!!(t.name||t.components&&Object.keys(t.components).length||t.redirect)}function j0(t){const e={};if(t===""||t==="?")return e;const r=(t[0]==="?"?t.slice(1):t).split("&");for(let s=0;s<r.length;++s){const i=r[s].replace(xp," "),a=i.indexOf("="),l=Ai(a<0?i:i.slice(0,a)),c=a<0?null:Ai(i.slice(a+1));if(l in e){let h=e[l];mn(h)||(h=e[l]=[h]),h.push(c)}else e[l]=c}return e}function td(t){let e="";for(let n in t){const r=t[n];if(n=o0(n),r==null){r!==void 0&&(e+=(e.length?"&":"")+n);continue}(mn(r)?r.map(i=>i&&Gl(i)):[r&&Gl(r)]).forEach(i=>{i!==void 0&&(e+=(e.length?"&":"")+n,i!=null&&(e+="="+i))})}return e}function B0(t){const e={};for(const n in t){const r=t[n];r!==void 0&&(e[n]=mn(r)?r.map(s=>s==null?null:""+s):r==null?r:""+r)}return e}const $0=Symbol(""),nd=Symbol(""),Ta=Symbol(""),jp=Symbol(""),Jl=Symbol("");function Xs(){let t=[];function e(r){return t.push(r),()=>{const s=t.indexOf(r);s>-1&&t.splice(s,1)}}function n(){t=[]}return{add:e,list:()=>t.slice(),reset:n}}function lr(t,e,n,r,s,i=a=>a()){const a=r&&(r.enterCallbacks[s]=r.enterCallbacks[s]||[]);return()=>new Promise((l,c)=>{const h=g=>{g===!1?c(As(4,{from:n,to:e})):g instanceof Error?c(g):R0(g)?c(As(2,{from:e,to:g})):(a&&r.enterCallbacks[s]===a&&typeof g=="function"&&a.push(g),l())},d=i(()=>t.call(r&&r.instances[s],e,n,h));let p=Promise.resolve(d);t.length<3&&(p=p.then(h)),p.catch(g=>c(g))})}function bl(t,e,n,r,s=i=>i()){const i=[];for(const a of t)for(const l in a.components){let c=a.components[l];if(!(e!=="beforeRouteEnter"&&!a.instances[l]))if(Pp(c)){const d=(c.__vccOpts||c)[e];d&&i.push(lr(d,n,r,a,l,s))}else{let h=c();i.push(()=>h.then(d=>{if(!d)throw new Error(`Couldn't resolve component "${l}" at "${a.path}"`);const p=Qv(d)?d.default:d;a.mods[l]=d,a.components[l]=p;const y=(p.__vccOpts||p)[e];return y&&lr(y,n,r,a,l,s)()}))}}return i}function rd(t){const e=bn(Ta),n=bn(jp),r=hn(()=>{const c=ms(t.to);return e.resolve(c)}),s=hn(()=>{const{matched:c}=r.value,{length:h}=c,d=c[h-1],p=n.matched;if(!d||!p.length)return-1;const g=p.findIndex(Is.bind(null,d));if(g>-1)return g;const y=sd(c[h-2]);return h>1&&sd(d)===y&&p[p.length-1].path!==y?p.findIndex(Is.bind(null,c[h-2])):g}),i=hn(()=>s.value>-1&&W0(n.params,r.value.params)),a=hn(()=>s.value>-1&&s.value===n.matched.length-1&&Vp(n.params,r.value.params));function l(c={}){if(K0(c)){const h=e[ms(t.replace)?"replace":"push"](ms(t.to)).catch(di);return t.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>h),h}return Promise.resolve()}return{route:r,href:hn(()=>r.value.href),isActive:i,isExactActive:a,navigate:l}}function q0(t){return t.length===1?t[0]:t}const z0=Zf({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:rd,setup(t,{slots:e}){const n=ga(rd(t)),{options:r}=bn(Ta),s=hn(()=>({[id(t.activeClass,r.linkActiveClass,"router-link-active")]:n.isActive,[id(t.exactActiveClass,r.linkExactActiveClass,"router-link-exact-active")]:n.isExactActive}));return()=>{const i=e.default&&q0(e.default(n));return t.custom?i:Rp("a",{"aria-current":n.isExactActive?t.ariaCurrentValue:null,href:n.href,onClick:n.navigate,class:s.value},i)}}}),H0=z0;function K0(t){if(!(t.metaKey||t.altKey||t.ctrlKey||t.shiftKey)&&!t.defaultPrevented&&!(t.button!==void 0&&t.button!==0)){if(t.currentTarget&&t.currentTarget.getAttribute){const e=t.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return t.preventDefault&&t.preventDefault(),!0}}function W0(t,e){for(const n in e){const r=e[n],s=t[n];if(typeof r=="string"){if(r!==s)return!1}else if(!mn(s)||s.length!==r.length||r.some((i,a)=>i!==s[a]))return!1}return!0}function sd(t){return t?t.aliasOf?t.aliasOf.path:t.path:""}const id=(t,e,n)=>t??e??n,G0=Zf({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(t,{attrs:e,slots:n}){const r=bn(Jl),s=hn(()=>t.route||r.value),i=bn(nd,0),a=hn(()=>{let h=ms(i);const{matched:d}=s.value;let p;for(;(p=d[h])&&!p.components;)h++;return h}),l=hn(()=>s.value.matched[a.value]);Po(nd,hn(()=>a.value+1)),Po($0,l),Po(Jl,s);const c=oe();return ys(()=>[c.value,l.value,t.name],([h,d,p],[g,y,k])=>{d&&(d.instances[p]=h,y&&y!==d&&h&&h===g&&(d.leaveGuards.size||(d.leaveGuards=y.leaveGuards),d.updateGuards.size||(d.updateGuards=y.updateGuards))),h&&d&&(!y||!Is(d,y)||!g)&&(d.enterCallbacks[p]||[]).forEach(N=>N(h))},{flush:"post"}),()=>{const h=s.value,d=t.name,p=l.value,g=p&&p.components[d];if(!g)return od(n.default,{Component:g,route:h});const y=p.props[d],k=y?y===!0?h.params:typeof y=="function"?y(h):y:null,M=Rp(g,je({},k,e,{onVnodeUnmounted:H=>{H.component.isUnmounted&&(p.instances[d]=null)},ref:c}));return od(n.default,{Component:M,route:h})||M}}});function od(t,e){if(!t)return null;const n=t(e);return n.length===1?n[0]:n}const Q0=G0;function J0(t){const e=O0(t.routes,t),n=t.parseQuery||j0,r=t.stringifyQuery||td,s=t.history,i=Xs(),a=Xs(),l=Xs(),c=sy(rr);let h=rr;as&&t.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const d=wl.bind(null,O=>""+O),p=wl.bind(null,l0),g=wl.bind(null,Ai);function y(O,ee){let Z,re;return Mp(O)?(Z=e.getRecordMatcher(O),re=ee):re=O,e.addRoute(re,Z)}function k(O){const ee=e.getRecordMatcher(O);ee&&e.removeRoute(ee)}function N(){return e.getRoutes().map(O=>O.record)}function M(O){return!!e.getRecordMatcher(O)}function H(O,ee){if(ee=je({},ee||c.value),typeof O=="string"){const w=El(n,O,ee.path),x=e.resolve({path:w.path},ee),U=s.createHref(w.fullPath);return je(w,x,{params:g(x.params),hash:Ai(w.hash),redirectedFrom:void 0,href:U})}let Z;if(O.path!=null)Z=je({},O,{path:El(n,O.path,ee.path).path});else{const w=je({},O.params);for(const x in w)w[x]==null&&delete w[x];Z=je({},O,{params:p(w)}),ee.params=p(ee.params)}const re=e.resolve(Z,ee),Se=O.hash||"";re.params=d(g(re.params));const de=h0(r,je({},O,{hash:i0(Se),path:re.path})),_=s.createHref(de);return je({fullPath:de,hash:Se,query:r===td?B0(O.query):O.query||{}},re,{redirectedFrom:void 0,href:_})}function z(O){return typeof O=="string"?El(n,O,c.value.path):je({},O)}function K(O,ee){if(h!==O)return As(8,{from:ee,to:O})}function W(O){return R(O)}function fe(O){return W(je(z(O),{replace:!0}))}function ie(O){const ee=O.matched[O.matched.length-1];if(ee&&ee.redirect){const{redirect:Z}=ee;let re=typeof Z=="function"?Z(O):Z;return typeof re=="string"&&(re=re.includes("?")||re.includes("#")?re=z(re):{path:re},re.params={}),je({query:O.query,hash:O.hash,params:re.path!=null?{}:O.params},re)}}function R(O,ee){const Z=h=H(O),re=c.value,Se=O.state,de=O.force,_=O.replace===!0,w=ie(Z);if(w)return R(je(z(w),{state:typeof w=="object"?je({},Se,w.state):Se,force:de,replace:_}),ee||Z);const x=Z;x.redirectedFrom=ee;let U;return!de&&d0(r,re,Z)&&(U=As(16,{to:x,from:re}),Wt(re,re,!0,!1)),(U?Promise.resolve(U):v(x,re)).catch(L=>Mn(L)?Mn(L,2)?L:$t(L):Re(L,x,re)).then(L=>{if(L){if(Mn(L,2))return R(je({replace:_},z(L.to),{state:typeof L.to=="object"?je({},Se,L.to.state):Se,force:de}),ee||x)}else L=P(x,re,!0,_,Se);return S(x,re,L),L})}function E(O,ee){const Z=K(O,ee);return Z?Promise.reject(Z):Promise.resolve()}function T(O){const ee=qt.values().next().value;return ee&&typeof ee.runWithContext=="function"?ee.runWithContext(O):O()}function v(O,ee){let Z;const[re,Se,de]=Y0(O,ee);Z=bl(re.reverse(),"beforeRouteLeave",O,ee);for(const w of re)w.leaveGuards.forEach(x=>{Z.push(lr(x,O,ee))});const _=E.bind(null,O,ee);return Z.push(_),ht(Z).then(()=>{Z=[];for(const w of i.list())Z.push(lr(w,O,ee));return Z.push(_),ht(Z)}).then(()=>{Z=bl(Se,"beforeRouteUpdate",O,ee);for(const w of Se)w.updateGuards.forEach(x=>{Z.push(lr(x,O,ee))});return Z.push(_),ht(Z)}).then(()=>{Z=[];for(const w of de)if(w.beforeEnter)if(mn(w.beforeEnter))for(const x of w.beforeEnter)Z.push(lr(x,O,ee));else Z.push(lr(w.beforeEnter,O,ee));return Z.push(_),ht(Z)}).then(()=>(O.matched.forEach(w=>w.enterCallbacks={}),Z=bl(de,"beforeRouteEnter",O,ee,T),Z.push(_),ht(Z))).then(()=>{Z=[];for(const w of a.list())Z.push(lr(w,O,ee));return Z.push(_),ht(Z)}).catch(w=>Mn(w,8)?w:Promise.reject(w))}function S(O,ee,Z){l.list().forEach(re=>T(()=>re(O,ee,Z)))}function P(O,ee,Z,re,Se){const de=K(O,ee);if(de)return de;const _=ee===rr,w=as?history.state:{};Z&&(re||_?s.replace(O.fullPath,je({scroll:_&&w&&w.scroll},Se)):s.push(O.fullPath,Se)),c.value=O,Wt(O,ee,Z,_),$t()}let I;function ut(){I||(I=s.listen((O,ee,Z)=>{if(!wt.listening)return;const re=H(O),Se=ie(re);if(Se){R(je(Se,{replace:!0,force:!0}),re).catch(di);return}h=re;const de=c.value;as&&w0(Kh(de.fullPath,Z.delta),ba()),v(re,de).catch(_=>Mn(_,12)?_:Mn(_,2)?(R(je(z(_.to),{force:!0}),re).then(w=>{Mn(w,20)&&!Z.delta&&Z.type===Ri.pop&&s.go(-1,!1)}).catch(di),Promise.reject()):(Z.delta&&s.go(-Z.delta,!1),Re(_,re,de))).then(_=>{_=_||P(re,de,!1),_&&(Z.delta&&!Mn(_,8)?s.go(-Z.delta,!1):Z.type===Ri.pop&&Mn(_,20)&&s.go(-1,!1)),S(re,de,_)}).catch(di)}))}let Pe=Xs(),Me=Xs(),Ce;function Re(O,ee,Z){$t(O);const re=Me.list();return re.length?re.forEach(Se=>Se(O,ee,Z)):console.error(O),Promise.reject(O)}function Bt(){return Ce&&c.value!==rr?Promise.resolve():new Promise((O,ee)=>{Pe.add([O,ee])})}function $t(O){return Ce||(Ce=!O,ut(),Pe.list().forEach(([ee,Z])=>O?Z(O):ee()),Pe.reset()),O}function Wt(O,ee,Z,re){const{scrollBehavior:Se}=t;if(!as||!Se)return Promise.resolve();const de=!Z&&E0(Kh(O.fullPath,0))||(re||!Z)&&history.state&&history.state.scroll||null;return Dc().then(()=>Se(O,ee,de)).then(_=>_&&v0(_)).catch(_=>Re(_,O,ee))}const qe=O=>s.go(O);let Ke;const qt=new Set,wt={currentRoute:c,listening:!0,addRoute:y,removeRoute:k,clearRoutes:e.clearRoutes,hasRoute:M,getRoutes:N,resolve:H,options:t,push:W,replace:fe,go:qe,back:()=>qe(-1),forward:()=>qe(1),beforeEach:i.add,beforeResolve:a.add,afterEach:l.add,onError:Me.add,isReady:Bt,install(O){const ee=this;O.component("RouterLink",H0),O.component("RouterView",Q0),O.config.globalProperties.$router=ee,Object.defineProperty(O.config.globalProperties,"$route",{enumerable:!0,get:()=>ms(c)}),as&&!Ke&&c.value===rr&&(Ke=!0,W(s.location).catch(Se=>{}));const Z={};for(const Se in rr)Object.defineProperty(Z,Se,{get:()=>c.value[Se],enumerable:!0});O.provide(Ta,ee),O.provide(jp,zf(Z)),O.provide(Jl,c);const re=O.unmount;qt.add(O),O.unmount=function(){qt.delete(O),qt.size<1&&(h=rr,I&&I(),I=null,c.value=rr,Ke=!1,Ce=!1),re()}}};function ht(O){return O.reduce((ee,Z)=>ee.then(()=>T(Z)),Promise.resolve())}return wt}function Y0(t,e){const n=[],r=[],s=[],i=Math.max(e.matched.length,t.matched.length);for(let a=0;a<i;a++){const l=e.matched[a];l&&(t.matched.find(h=>Is(h,l))?r.push(l):n.push(l));const c=t.matched[a];c&&(e.matched.find(h=>Is(h,c))||s.push(c))}return[n,r,s]}function Bp(){return bn(Ta)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */const $p=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=s&63|128):(s&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=s&63|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=s&63|128)}return e},X0=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const s=t[n++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=t[n++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=t[n++],a=t[n++],l=t[n++],c=((s&7)<<18|(i&63)<<12|(a&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const i=t[n++],a=t[n++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},qp={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<t.length;s+=3){const i=t[s],a=s+1<t.length,l=a?t[s+1]:0,c=s+2<t.length,h=c?t[s+2]:0,d=i>>2,p=(i&3)<<4|l>>4;let g=(l&15)<<2|h>>6,y=h&63;c||(y=64,a||(g=64)),r.push(n[d],n[p],n[g],n[y])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray($p(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):X0(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<t.length;){const i=n[t.charAt(s++)],l=s<t.length?n[t.charAt(s)]:0;++s;const h=s<t.length?n[t.charAt(s)]:64;++s;const p=s<t.length?n[t.charAt(s)]:64;if(++s,i==null||l==null||h==null||p==null)throw new Z0;const g=i<<2|l>>4;if(r.push(g),h!==64){const y=l<<4&240|h>>2;if(r.push(y),p!==64){const k=h<<6&192|p;r.push(k)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class Z0 extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const ew=function(t){const e=$p(t);return qp.encodeByteArray(e,!0)},Go=function(t){return ew(t).replace(/\./g,"")},zp=function(t){try{return qp.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function tw(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const nw=()=>tw().__FIREBASE_DEFAULTS__,rw=()=>{if(typeof process>"u"||typeof process.env>"u")return;const t={}.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},sw=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&zp(t[1]);return e&&JSON.parse(e)},Ia=()=>{try{return nw()||rw()||sw()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Hp=t=>{var e,n;return(n=(e=Ia())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[t]},iw=t=>{const e=Hp(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},Kp=()=>{var t;return(t=Ia())===null||t===void 0?void 0:t.config},Wp=t=>{var e;return(e=Ia())===null||e===void 0?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ow{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
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
 */function aw(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",s=t.iat||0,i=t.sub||t.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},t),l="";return[Go(JSON.stringify(n)),Go(JSON.stringify(a)),l].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ut(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function lw(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ut())}function cw(){var t;const e=(t=Ia())===null||t===void 0?void 0:t.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function uw(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function hw(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function dw(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function fw(){const t=Ut();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function pw(){return!cw()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function mw(){try{return typeof indexedDB=="object"}catch{return!1}}function gw(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _w="FirebaseError";class Zn extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=_w,Object.setPrototypeOf(this,Zn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ji.prototype.create)}}class ji{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?yw(i,r):"Error",l=`${this.serviceName}: ${a} (${s}).`;return new Zn(s,l,r)}}function yw(t,e){return t.replace(vw,(n,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const vw=/\{\$([^}]+)}/g;function ww(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Qo(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const s of n){if(!r.includes(s))return!1;const i=t[s],a=e[s];if(ad(i)&&ad(a)){if(!Qo(i,a))return!1}else if(i!==a)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function ad(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Bi(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Ew(t,e){const n=new bw(t,e);return n.subscribe.bind(n)}class bw{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let s;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");Tw(e,["next","error","complete"])?s=e:s={next:e,error:n,complete:r},s.next===void 0&&(s.next=Tl),s.error===void 0&&(s.error=Tl),s.complete===void 0&&(s.complete=Tl);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Tw(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function Tl(){}/**
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
 */function jt(t){return t&&t._delegate?t._delegate:t}class $r{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const Fr="[DEFAULT]";/**
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
 */class Iw{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new ow;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:n});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Rw(e))try{this.getOrInitializeService({instanceIdentifier:Fr})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=Fr){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Fr){return this.instances.has(e)}getOptions(e=Fr){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[i,a]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(i);r===l&&a.resolve(s)}return s}onInit(e,n){var r;const s=this.normalizeInstanceIdentifier(n),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const a=this.instances.get(s);return a&&e(a,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const s of r)try{s(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Aw(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Fr){return this.component?this.component.multipleInstances?e:Fr:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Aw(t){return t===Fr?void 0:t}function Rw(t){return t.instantiationMode==="EAGER"}/**
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
 */class Sw{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Iw(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Ne;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(Ne||(Ne={}));const Pw={debug:Ne.DEBUG,verbose:Ne.VERBOSE,info:Ne.INFO,warn:Ne.WARN,error:Ne.ERROR,silent:Ne.SILENT},Cw=Ne.INFO,xw={[Ne.DEBUG]:"log",[Ne.VERBOSE]:"log",[Ne.INFO]:"info",[Ne.WARN]:"warn",[Ne.ERROR]:"error"},kw=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),s=xw[e];if(s)console[s](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class $c{constructor(e){this.name=e,this._logLevel=Cw,this._logHandler=kw,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Ne))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?Pw[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Ne.DEBUG,...e),this._logHandler(this,Ne.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Ne.VERBOSE,...e),this._logHandler(this,Ne.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Ne.INFO,...e),this._logHandler(this,Ne.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Ne.WARN,...e),this._logHandler(this,Ne.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Ne.ERROR,...e),this._logHandler(this,Ne.ERROR,...e)}}const Dw=(t,e)=>e.some(n=>t instanceof n);let ld,cd;function Nw(){return ld||(ld=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Vw(){return cd||(cd=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Gp=new WeakMap,Yl=new WeakMap,Qp=new WeakMap,Il=new WeakMap,qc=new WeakMap;function Ow(t){const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("success",i),t.removeEventListener("error",a)},i=()=>{n(mr(t.result)),s()},a=()=>{r(t.error),s()};t.addEventListener("success",i),t.addEventListener("error",a)});return e.then(n=>{n instanceof IDBCursor&&Gp.set(n,t)}).catch(()=>{}),qc.set(e,t),e}function Mw(t){if(Yl.has(t))return;const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",a),t.removeEventListener("abort",a)},i=()=>{n(),s()},a=()=>{r(t.error||new DOMException("AbortError","AbortError")),s()};t.addEventListener("complete",i),t.addEventListener("error",a),t.addEventListener("abort",a)});Yl.set(t,e)}let Xl={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return Yl.get(t);if(e==="objectStoreNames")return t.objectStoreNames||Qp.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return mr(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function Lw(t){Xl=t(Xl)}function Fw(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(Al(this),e,...n);return Qp.set(r,e.sort?e.sort():[e]),mr(r)}:Vw().includes(t)?function(...e){return t.apply(Al(this),e),mr(Gp.get(this))}:function(...e){return mr(t.apply(Al(this),e))}}function Uw(t){return typeof t=="function"?Fw(t):(t instanceof IDBTransaction&&Mw(t),Dw(t,Nw())?new Proxy(t,Xl):t)}function mr(t){if(t instanceof IDBRequest)return Ow(t);if(Il.has(t))return Il.get(t);const e=Uw(t);return e!==t&&(Il.set(t,e),qc.set(e,t)),e}const Al=t=>qc.get(t);function jw(t,e,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const a=indexedDB.open(t,e),l=mr(a);return r&&a.addEventListener("upgradeneeded",c=>{r(mr(a.result),c.oldVersion,c.newVersion,mr(a.transaction),c)}),n&&a.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),l.then(c=>{i&&c.addEventListener("close",()=>i()),s&&c.addEventListener("versionchange",h=>s(h.oldVersion,h.newVersion,h))}).catch(()=>{}),l}const Bw=["get","getKey","getAll","getAllKeys","count"],$w=["put","add","delete","clear"],Rl=new Map;function ud(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Rl.get(e))return Rl.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,s=$w.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(s||Bw.includes(n)))return;const i=async function(a,...l){const c=this.transaction(a,s?"readwrite":"readonly");let h=c.store;return r&&(h=h.index(l.shift())),(await Promise.all([h[n](...l),s&&c.done]))[0]};return Rl.set(e,i),i}Lw(t=>({...t,get:(e,n,r)=>ud(e,n)||t.get(e,n,r),has:(e,n)=>!!ud(e,n)||t.has(e,n)}));/**
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
 */class qw{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(zw(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function zw(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Zl="@firebase/app",hd="0.10.13";/**
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
 */const Wn=new $c("@firebase/app"),Hw="@firebase/app-compat",Kw="@firebase/analytics-compat",Ww="@firebase/analytics",Gw="@firebase/app-check-compat",Qw="@firebase/app-check",Jw="@firebase/auth",Yw="@firebase/auth-compat",Xw="@firebase/database",Zw="@firebase/data-connect",eE="@firebase/database-compat",tE="@firebase/functions",nE="@firebase/functions-compat",rE="@firebase/installations",sE="@firebase/installations-compat",iE="@firebase/messaging",oE="@firebase/messaging-compat",aE="@firebase/performance",lE="@firebase/performance-compat",cE="@firebase/remote-config",uE="@firebase/remote-config-compat",hE="@firebase/storage",dE="@firebase/storage-compat",fE="@firebase/firestore",pE="@firebase/vertexai-preview",mE="@firebase/firestore-compat",gE="firebase",_E="10.14.1";/**
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
 */const ec="[DEFAULT]",yE={[Zl]:"fire-core",[Hw]:"fire-core-compat",[Ww]:"fire-analytics",[Kw]:"fire-analytics-compat",[Qw]:"fire-app-check",[Gw]:"fire-app-check-compat",[Jw]:"fire-auth",[Yw]:"fire-auth-compat",[Xw]:"fire-rtdb",[Zw]:"fire-data-connect",[eE]:"fire-rtdb-compat",[tE]:"fire-fn",[nE]:"fire-fn-compat",[rE]:"fire-iid",[sE]:"fire-iid-compat",[iE]:"fire-fcm",[oE]:"fire-fcm-compat",[aE]:"fire-perf",[lE]:"fire-perf-compat",[cE]:"fire-rc",[uE]:"fire-rc-compat",[hE]:"fire-gcs",[dE]:"fire-gcs-compat",[fE]:"fire-fst",[mE]:"fire-fst-compat",[pE]:"fire-vertex","fire-js":"fire-js",[gE]:"fire-js-all"};/**
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
 */const Jo=new Map,vE=new Map,tc=new Map;function dd(t,e){try{t.container.addComponent(e)}catch(n){Wn.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function Rs(t){const e=t.name;if(tc.has(e))return Wn.debug(`There were multiple attempts to register component ${e}.`),!1;tc.set(e,t);for(const n of Jo.values())dd(n,t);for(const n of vE.values())dd(n,t);return!0}function zc(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function jn(t){return t.settings!==void 0}/**
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
 */const wE={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},gr=new ji("app","Firebase",wE);/**
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
 */class EE{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new $r("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw gr.create("app-deleted",{appName:this._name})}}/**
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
 */const Vs=_E;function Jp(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:ec,automaticDataCollectionEnabled:!1},e),s=r.name;if(typeof s!="string"||!s)throw gr.create("bad-app-name",{appName:String(s)});if(n||(n=Kp()),!n)throw gr.create("no-options");const i=Jo.get(s);if(i){if(Qo(n,i.options)&&Qo(r,i.config))return i;throw gr.create("duplicate-app",{appName:s})}const a=new Sw(s);for(const c of tc.values())a.addComponent(c);const l=new EE(n,r,a);return Jo.set(s,l),l}function Yp(t=ec){const e=Jo.get(t);if(!e&&t===ec&&Kp())return Jp();if(!e)throw gr.create("no-app",{appName:t});return e}function _r(t,e,n){var r;let s=(r=yE[t])!==null&&r!==void 0?r:t;n&&(s+=`-${n}`);const i=s.match(/\s|\//),a=e.match(/\s|\//);if(i||a){const l=[`Unable to register library "${s}" with version "${e}":`];i&&l.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&a&&l.push("and"),a&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Wn.warn(l.join(" "));return}Rs(new $r(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const bE="firebase-heartbeat-database",TE=1,Si="firebase-heartbeat-store";let Sl=null;function Xp(){return Sl||(Sl=jw(bE,TE,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Si)}catch(n){console.warn(n)}}}}).catch(t=>{throw gr.create("idb-open",{originalErrorMessage:t.message})})),Sl}async function IE(t){try{const n=(await Xp()).transaction(Si),r=await n.objectStore(Si).get(Zp(t));return await n.done,r}catch(e){if(e instanceof Zn)Wn.warn(e.message);else{const n=gr.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Wn.warn(n.message)}}}async function fd(t,e){try{const r=(await Xp()).transaction(Si,"readwrite");await r.objectStore(Si).put(e,Zp(t)),await r.done}catch(n){if(n instanceof Zn)Wn.warn(n.message);else{const r=gr.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Wn.warn(r.message)}}}function Zp(t){return`${t.name}!${t.options.appId}`}/**
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
 */const AE=1024,RE=30*24*60*60*1e3;class SE{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new CE(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=pd();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const l=new Date(a.date).valueOf();return Date.now()-l<=RE}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Wn.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=pd(),{heartbeatsToSend:r,unsentEntries:s}=PE(this._heartbeatsCache.heartbeats),i=Go(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(n){return Wn.warn(n),""}}}function pd(){return new Date().toISOString().substring(0,10)}function PE(t,e=AE){const n=[];let r=t.slice();for(const s of t){const i=n.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),md(n)>e){i.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),md(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class CE{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return mw()?gw().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await IE(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return fd(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return fd(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function md(t){return Go(JSON.stringify({version:2,heartbeats:t})).length}/**
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
 */function xE(t){Rs(new $r("platform-logger",e=>new qw(e),"PRIVATE")),Rs(new $r("heartbeat",e=>new SE(e),"PRIVATE")),_r(Zl,hd,t),_r(Zl,hd,"esm2017"),_r("fire-js","")}xE("");var kE="firebase",DE="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */_r(kE,DE,"app");var gd=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Br,em;(function(){var t;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(R,E){function T(){}T.prototype=E.prototype,R.D=E.prototype,R.prototype=new T,R.prototype.constructor=R,R.C=function(v,S,P){for(var I=Array(arguments.length-2),ut=2;ut<arguments.length;ut++)I[ut-2]=arguments[ut];return E.prototype[S].apply(v,I)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,n),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(R,E,T){T||(T=0);var v=Array(16);if(typeof E=="string")for(var S=0;16>S;++S)v[S]=E.charCodeAt(T++)|E.charCodeAt(T++)<<8|E.charCodeAt(T++)<<16|E.charCodeAt(T++)<<24;else for(S=0;16>S;++S)v[S]=E[T++]|E[T++]<<8|E[T++]<<16|E[T++]<<24;E=R.g[0],T=R.g[1],S=R.g[2];var P=R.g[3],I=E+(P^T&(S^P))+v[0]+3614090360&4294967295;E=T+(I<<7&4294967295|I>>>25),I=P+(S^E&(T^S))+v[1]+3905402710&4294967295,P=E+(I<<12&4294967295|I>>>20),I=S+(T^P&(E^T))+v[2]+606105819&4294967295,S=P+(I<<17&4294967295|I>>>15),I=T+(E^S&(P^E))+v[3]+3250441966&4294967295,T=S+(I<<22&4294967295|I>>>10),I=E+(P^T&(S^P))+v[4]+4118548399&4294967295,E=T+(I<<7&4294967295|I>>>25),I=P+(S^E&(T^S))+v[5]+1200080426&4294967295,P=E+(I<<12&4294967295|I>>>20),I=S+(T^P&(E^T))+v[6]+2821735955&4294967295,S=P+(I<<17&4294967295|I>>>15),I=T+(E^S&(P^E))+v[7]+4249261313&4294967295,T=S+(I<<22&4294967295|I>>>10),I=E+(P^T&(S^P))+v[8]+1770035416&4294967295,E=T+(I<<7&4294967295|I>>>25),I=P+(S^E&(T^S))+v[9]+2336552879&4294967295,P=E+(I<<12&4294967295|I>>>20),I=S+(T^P&(E^T))+v[10]+4294925233&4294967295,S=P+(I<<17&4294967295|I>>>15),I=T+(E^S&(P^E))+v[11]+2304563134&4294967295,T=S+(I<<22&4294967295|I>>>10),I=E+(P^T&(S^P))+v[12]+1804603682&4294967295,E=T+(I<<7&4294967295|I>>>25),I=P+(S^E&(T^S))+v[13]+4254626195&4294967295,P=E+(I<<12&4294967295|I>>>20),I=S+(T^P&(E^T))+v[14]+2792965006&4294967295,S=P+(I<<17&4294967295|I>>>15),I=T+(E^S&(P^E))+v[15]+1236535329&4294967295,T=S+(I<<22&4294967295|I>>>10),I=E+(S^P&(T^S))+v[1]+4129170786&4294967295,E=T+(I<<5&4294967295|I>>>27),I=P+(T^S&(E^T))+v[6]+3225465664&4294967295,P=E+(I<<9&4294967295|I>>>23),I=S+(E^T&(P^E))+v[11]+643717713&4294967295,S=P+(I<<14&4294967295|I>>>18),I=T+(P^E&(S^P))+v[0]+3921069994&4294967295,T=S+(I<<20&4294967295|I>>>12),I=E+(S^P&(T^S))+v[5]+3593408605&4294967295,E=T+(I<<5&4294967295|I>>>27),I=P+(T^S&(E^T))+v[10]+38016083&4294967295,P=E+(I<<9&4294967295|I>>>23),I=S+(E^T&(P^E))+v[15]+3634488961&4294967295,S=P+(I<<14&4294967295|I>>>18),I=T+(P^E&(S^P))+v[4]+3889429448&4294967295,T=S+(I<<20&4294967295|I>>>12),I=E+(S^P&(T^S))+v[9]+568446438&4294967295,E=T+(I<<5&4294967295|I>>>27),I=P+(T^S&(E^T))+v[14]+3275163606&4294967295,P=E+(I<<9&4294967295|I>>>23),I=S+(E^T&(P^E))+v[3]+4107603335&4294967295,S=P+(I<<14&4294967295|I>>>18),I=T+(P^E&(S^P))+v[8]+1163531501&4294967295,T=S+(I<<20&4294967295|I>>>12),I=E+(S^P&(T^S))+v[13]+2850285829&4294967295,E=T+(I<<5&4294967295|I>>>27),I=P+(T^S&(E^T))+v[2]+4243563512&4294967295,P=E+(I<<9&4294967295|I>>>23),I=S+(E^T&(P^E))+v[7]+1735328473&4294967295,S=P+(I<<14&4294967295|I>>>18),I=T+(P^E&(S^P))+v[12]+2368359562&4294967295,T=S+(I<<20&4294967295|I>>>12),I=E+(T^S^P)+v[5]+4294588738&4294967295,E=T+(I<<4&4294967295|I>>>28),I=P+(E^T^S)+v[8]+2272392833&4294967295,P=E+(I<<11&4294967295|I>>>21),I=S+(P^E^T)+v[11]+1839030562&4294967295,S=P+(I<<16&4294967295|I>>>16),I=T+(S^P^E)+v[14]+4259657740&4294967295,T=S+(I<<23&4294967295|I>>>9),I=E+(T^S^P)+v[1]+2763975236&4294967295,E=T+(I<<4&4294967295|I>>>28),I=P+(E^T^S)+v[4]+1272893353&4294967295,P=E+(I<<11&4294967295|I>>>21),I=S+(P^E^T)+v[7]+4139469664&4294967295,S=P+(I<<16&4294967295|I>>>16),I=T+(S^P^E)+v[10]+3200236656&4294967295,T=S+(I<<23&4294967295|I>>>9),I=E+(T^S^P)+v[13]+681279174&4294967295,E=T+(I<<4&4294967295|I>>>28),I=P+(E^T^S)+v[0]+3936430074&4294967295,P=E+(I<<11&4294967295|I>>>21),I=S+(P^E^T)+v[3]+3572445317&4294967295,S=P+(I<<16&4294967295|I>>>16),I=T+(S^P^E)+v[6]+76029189&4294967295,T=S+(I<<23&4294967295|I>>>9),I=E+(T^S^P)+v[9]+3654602809&4294967295,E=T+(I<<4&4294967295|I>>>28),I=P+(E^T^S)+v[12]+3873151461&4294967295,P=E+(I<<11&4294967295|I>>>21),I=S+(P^E^T)+v[15]+530742520&4294967295,S=P+(I<<16&4294967295|I>>>16),I=T+(S^P^E)+v[2]+3299628645&4294967295,T=S+(I<<23&4294967295|I>>>9),I=E+(S^(T|~P))+v[0]+4096336452&4294967295,E=T+(I<<6&4294967295|I>>>26),I=P+(T^(E|~S))+v[7]+1126891415&4294967295,P=E+(I<<10&4294967295|I>>>22),I=S+(E^(P|~T))+v[14]+2878612391&4294967295,S=P+(I<<15&4294967295|I>>>17),I=T+(P^(S|~E))+v[5]+4237533241&4294967295,T=S+(I<<21&4294967295|I>>>11),I=E+(S^(T|~P))+v[12]+1700485571&4294967295,E=T+(I<<6&4294967295|I>>>26),I=P+(T^(E|~S))+v[3]+2399980690&4294967295,P=E+(I<<10&4294967295|I>>>22),I=S+(E^(P|~T))+v[10]+4293915773&4294967295,S=P+(I<<15&4294967295|I>>>17),I=T+(P^(S|~E))+v[1]+2240044497&4294967295,T=S+(I<<21&4294967295|I>>>11),I=E+(S^(T|~P))+v[8]+1873313359&4294967295,E=T+(I<<6&4294967295|I>>>26),I=P+(T^(E|~S))+v[15]+4264355552&4294967295,P=E+(I<<10&4294967295|I>>>22),I=S+(E^(P|~T))+v[6]+2734768916&4294967295,S=P+(I<<15&4294967295|I>>>17),I=T+(P^(S|~E))+v[13]+1309151649&4294967295,T=S+(I<<21&4294967295|I>>>11),I=E+(S^(T|~P))+v[4]+4149444226&4294967295,E=T+(I<<6&4294967295|I>>>26),I=P+(T^(E|~S))+v[11]+3174756917&4294967295,P=E+(I<<10&4294967295|I>>>22),I=S+(E^(P|~T))+v[2]+718787259&4294967295,S=P+(I<<15&4294967295|I>>>17),I=T+(P^(S|~E))+v[9]+3951481745&4294967295,R.g[0]=R.g[0]+E&4294967295,R.g[1]=R.g[1]+(S+(I<<21&4294967295|I>>>11))&4294967295,R.g[2]=R.g[2]+S&4294967295,R.g[3]=R.g[3]+P&4294967295}r.prototype.u=function(R,E){E===void 0&&(E=R.length);for(var T=E-this.blockSize,v=this.B,S=this.h,P=0;P<E;){if(S==0)for(;P<=T;)s(this,R,P),P+=this.blockSize;if(typeof R=="string"){for(;P<E;)if(v[S++]=R.charCodeAt(P++),S==this.blockSize){s(this,v),S=0;break}}else for(;P<E;)if(v[S++]=R[P++],S==this.blockSize){s(this,v),S=0;break}}this.h=S,this.o+=E},r.prototype.v=function(){var R=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);R[0]=128;for(var E=1;E<R.length-8;++E)R[E]=0;var T=8*this.o;for(E=R.length-8;E<R.length;++E)R[E]=T&255,T/=256;for(this.u(R),R=Array(16),E=T=0;4>E;++E)for(var v=0;32>v;v+=8)R[T++]=this.g[E]>>>v&255;return R};function i(R,E){var T=l;return Object.prototype.hasOwnProperty.call(T,R)?T[R]:T[R]=E(R)}function a(R,E){this.h=E;for(var T=[],v=!0,S=R.length-1;0<=S;S--){var P=R[S]|0;v&&P==E||(T[S]=P,v=!1)}this.g=T}var l={};function c(R){return-128<=R&&128>R?i(R,function(E){return new a([E|0],0>E?-1:0)}):new a([R|0],0>R?-1:0)}function h(R){if(isNaN(R)||!isFinite(R))return p;if(0>R)return M(h(-R));for(var E=[],T=1,v=0;R>=T;v++)E[v]=R/T|0,T*=4294967296;return new a(E,0)}function d(R,E){if(R.length==0)throw Error("number format error: empty string");if(E=E||10,2>E||36<E)throw Error("radix out of range: "+E);if(R.charAt(0)=="-")return M(d(R.substring(1),E));if(0<=R.indexOf("-"))throw Error('number format error: interior "-" character');for(var T=h(Math.pow(E,8)),v=p,S=0;S<R.length;S+=8){var P=Math.min(8,R.length-S),I=parseInt(R.substring(S,S+P),E);8>P?(P=h(Math.pow(E,P)),v=v.j(P).add(h(I))):(v=v.j(T),v=v.add(h(I)))}return v}var p=c(0),g=c(1),y=c(16777216);t=a.prototype,t.m=function(){if(N(this))return-M(this).m();for(var R=0,E=1,T=0;T<this.g.length;T++){var v=this.i(T);R+=(0<=v?v:4294967296+v)*E,E*=4294967296}return R},t.toString=function(R){if(R=R||10,2>R||36<R)throw Error("radix out of range: "+R);if(k(this))return"0";if(N(this))return"-"+M(this).toString(R);for(var E=h(Math.pow(R,6)),T=this,v="";;){var S=W(T,E).g;T=H(T,S.j(E));var P=((0<T.g.length?T.g[0]:T.h)>>>0).toString(R);if(T=S,k(T))return P+v;for(;6>P.length;)P="0"+P;v=P+v}},t.i=function(R){return 0>R?0:R<this.g.length?this.g[R]:this.h};function k(R){if(R.h!=0)return!1;for(var E=0;E<R.g.length;E++)if(R.g[E]!=0)return!1;return!0}function N(R){return R.h==-1}t.l=function(R){return R=H(this,R),N(R)?-1:k(R)?0:1};function M(R){for(var E=R.g.length,T=[],v=0;v<E;v++)T[v]=~R.g[v];return new a(T,~R.h).add(g)}t.abs=function(){return N(this)?M(this):this},t.add=function(R){for(var E=Math.max(this.g.length,R.g.length),T=[],v=0,S=0;S<=E;S++){var P=v+(this.i(S)&65535)+(R.i(S)&65535),I=(P>>>16)+(this.i(S)>>>16)+(R.i(S)>>>16);v=I>>>16,P&=65535,I&=65535,T[S]=I<<16|P}return new a(T,T[T.length-1]&-2147483648?-1:0)};function H(R,E){return R.add(M(E))}t.j=function(R){if(k(this)||k(R))return p;if(N(this))return N(R)?M(this).j(M(R)):M(M(this).j(R));if(N(R))return M(this.j(M(R)));if(0>this.l(y)&&0>R.l(y))return h(this.m()*R.m());for(var E=this.g.length+R.g.length,T=[],v=0;v<2*E;v++)T[v]=0;for(v=0;v<this.g.length;v++)for(var S=0;S<R.g.length;S++){var P=this.i(v)>>>16,I=this.i(v)&65535,ut=R.i(S)>>>16,Pe=R.i(S)&65535;T[2*v+2*S]+=I*Pe,z(T,2*v+2*S),T[2*v+2*S+1]+=P*Pe,z(T,2*v+2*S+1),T[2*v+2*S+1]+=I*ut,z(T,2*v+2*S+1),T[2*v+2*S+2]+=P*ut,z(T,2*v+2*S+2)}for(v=0;v<E;v++)T[v]=T[2*v+1]<<16|T[2*v];for(v=E;v<2*E;v++)T[v]=0;return new a(T,0)};function z(R,E){for(;(R[E]&65535)!=R[E];)R[E+1]+=R[E]>>>16,R[E]&=65535,E++}function K(R,E){this.g=R,this.h=E}function W(R,E){if(k(E))throw Error("division by zero");if(k(R))return new K(p,p);if(N(R))return E=W(M(R),E),new K(M(E.g),M(E.h));if(N(E))return E=W(R,M(E)),new K(M(E.g),E.h);if(30<R.g.length){if(N(R)||N(E))throw Error("slowDivide_ only works with positive integers.");for(var T=g,v=E;0>=v.l(R);)T=fe(T),v=fe(v);var S=ie(T,1),P=ie(v,1);for(v=ie(v,2),T=ie(T,2);!k(v);){var I=P.add(v);0>=I.l(R)&&(S=S.add(T),P=I),v=ie(v,1),T=ie(T,1)}return E=H(R,S.j(E)),new K(S,E)}for(S=p;0<=R.l(E);){for(T=Math.max(1,Math.floor(R.m()/E.m())),v=Math.ceil(Math.log(T)/Math.LN2),v=48>=v?1:Math.pow(2,v-48),P=h(T),I=P.j(E);N(I)||0<I.l(R);)T-=v,P=h(T),I=P.j(E);k(P)&&(P=g),S=S.add(P),R=H(R,I)}return new K(S,R)}t.A=function(R){return W(this,R).h},t.and=function(R){for(var E=Math.max(this.g.length,R.g.length),T=[],v=0;v<E;v++)T[v]=this.i(v)&R.i(v);return new a(T,this.h&R.h)},t.or=function(R){for(var E=Math.max(this.g.length,R.g.length),T=[],v=0;v<E;v++)T[v]=this.i(v)|R.i(v);return new a(T,this.h|R.h)},t.xor=function(R){for(var E=Math.max(this.g.length,R.g.length),T=[],v=0;v<E;v++)T[v]=this.i(v)^R.i(v);return new a(T,this.h^R.h)};function fe(R){for(var E=R.g.length+1,T=[],v=0;v<E;v++)T[v]=R.i(v)<<1|R.i(v-1)>>>31;return new a(T,R.h)}function ie(R,E){var T=E>>5;E%=32;for(var v=R.g.length-T,S=[],P=0;P<v;P++)S[P]=0<E?R.i(P+T)>>>E|R.i(P+T+1)<<32-E:R.i(P+T);return new a(S,R.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,em=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=h,a.fromString=d,Br=a}).apply(typeof gd<"u"?gd:typeof self<"u"?self:typeof window<"u"?window:{});var wo=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var tm,ti,nm,Do,nc,rm,sm,im;(function(){var t,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,u,f){return o==Array.prototype||o==Object.prototype||(o[u]=f.value),o};function n(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof wo=="object"&&wo];for(var u=0;u<o.length;++u){var f=o[u];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var r=n(this);function s(o,u){if(u)e:{var f=r;o=o.split(".");for(var m=0;m<o.length-1;m++){var C=o[m];if(!(C in f))break e;f=f[C]}o=o[o.length-1],m=f[o],u=u(m),u!=m&&u!=null&&e(f,o,{configurable:!0,writable:!0,value:u})}}function i(o,u){o instanceof String&&(o+="");var f=0,m=!1,C={next:function(){if(!m&&f<o.length){var D=f++;return{value:u(D,o[D]),done:!1}}return m=!0,{done:!0,value:void 0}}};return C[Symbol.iterator]=function(){return C},C}s("Array.prototype.values",function(o){return o||function(){return i(this,function(u,f){return f})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},l=this||self;function c(o){var u=typeof o;return u=u!="object"?u:o?Array.isArray(o)?"array":u:"null",u=="array"||u=="object"&&typeof o.length=="number"}function h(o){var u=typeof o;return u=="object"&&o!=null||u=="function"}function d(o,u,f){return o.call.apply(o.bind,arguments)}function p(o,u,f){if(!o)throw Error();if(2<arguments.length){var m=Array.prototype.slice.call(arguments,2);return function(){var C=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(C,m),o.apply(u,C)}}return function(){return o.apply(u,arguments)}}function g(o,u,f){return g=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?d:p,g.apply(null,arguments)}function y(o,u){var f=Array.prototype.slice.call(arguments,1);return function(){var m=f.slice();return m.push.apply(m,arguments),o.apply(this,m)}}function k(o,u){function f(){}f.prototype=u.prototype,o.aa=u.prototype,o.prototype=new f,o.prototype.constructor=o,o.Qb=function(m,C,D){for(var Y=Array(arguments.length-2),We=2;We<arguments.length;We++)Y[We-2]=arguments[We];return u.prototype[C].apply(m,Y)}}function N(o){const u=o.length;if(0<u){const f=Array(u);for(let m=0;m<u;m++)f[m]=o[m];return f}return[]}function M(o,u){for(let f=1;f<arguments.length;f++){const m=arguments[f];if(c(m)){const C=o.length||0,D=m.length||0;o.length=C+D;for(let Y=0;Y<D;Y++)o[C+Y]=m[Y]}else o.push(m)}}class H{constructor(u,f){this.i=u,this.j=f,this.h=0,this.g=null}get(){let u;return 0<this.h?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function z(o){return/^[\s\xa0]*$/.test(o)}function K(){var o=l.navigator;return o&&(o=o.userAgent)?o:""}function W(o){return W[" "](o),o}W[" "]=function(){};var fe=K().indexOf("Gecko")!=-1&&!(K().toLowerCase().indexOf("webkit")!=-1&&K().indexOf("Edge")==-1)&&!(K().indexOf("Trident")!=-1||K().indexOf("MSIE")!=-1)&&K().indexOf("Edge")==-1;function ie(o,u,f){for(const m in o)u.call(f,o[m],m,o)}function R(o,u){for(const f in o)u.call(void 0,o[f],f,o)}function E(o){const u={};for(const f in o)u[f]=o[f];return u}const T="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function v(o,u){let f,m;for(let C=1;C<arguments.length;C++){m=arguments[C];for(f in m)o[f]=m[f];for(let D=0;D<T.length;D++)f=T[D],Object.prototype.hasOwnProperty.call(m,f)&&(o[f]=m[f])}}function S(o){var u=1;o=o.split(":");const f=[];for(;0<u&&o.length;)f.push(o.shift()),u--;return o.length&&f.push(o.join(":")),f}function P(o){l.setTimeout(()=>{throw o},0)}function I(){var o=Bt;let u=null;return o.g&&(u=o.g,o.g=o.g.next,o.g||(o.h=null),u.next=null),u}class ut{constructor(){this.h=this.g=null}add(u,f){const m=Pe.get();m.set(u,f),this.h?this.h.next=m:this.g=m,this.h=m}}var Pe=new H(()=>new Me,o=>o.reset());class Me{constructor(){this.next=this.g=this.h=null}set(u,f){this.h=u,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let Ce,Re=!1,Bt=new ut,$t=()=>{const o=l.Promise.resolve(void 0);Ce=()=>{o.then(Wt)}};var Wt=()=>{for(var o;o=I();){try{o.h.call(o.g)}catch(f){P(f)}var u=Pe;u.j(o),100>u.h&&(u.h++,o.next=u.g,u.g=o)}Re=!1};function qe(){this.s=this.s,this.C=this.C}qe.prototype.s=!1,qe.prototype.ma=function(){this.s||(this.s=!0,this.N())},qe.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Ke(o,u){this.type=o,this.g=this.target=u,this.defaultPrevented=!1}Ke.prototype.h=function(){this.defaultPrevented=!0};var qt=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var o=!1,u=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const f=()=>{};l.addEventListener("test",f,u),l.removeEventListener("test",f,u)}catch{}return o}();function wt(o,u){if(Ke.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var f=this.type=o.type,m=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=u,u=o.relatedTarget){if(fe){e:{try{W(u.nodeName);var C=!0;break e}catch{}C=!1}C||(u=null)}}else f=="mouseover"?u=o.fromElement:f=="mouseout"&&(u=o.toElement);this.relatedTarget=u,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:ht[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&wt.aa.h.call(this)}}k(wt,Ke);var ht={2:"touch",3:"pen",4:"mouse"};wt.prototype.h=function(){wt.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var O="closure_listenable_"+(1e6*Math.random()|0),ee=0;function Z(o,u,f,m,C){this.listener=o,this.proxy=null,this.src=u,this.type=f,this.capture=!!m,this.ha=C,this.key=++ee,this.da=this.fa=!1}function re(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function Se(o){this.src=o,this.g={},this.h=0}Se.prototype.add=function(o,u,f,m,C){var D=o.toString();o=this.g[D],o||(o=this.g[D]=[],this.h++);var Y=_(o,u,m,C);return-1<Y?(u=o[Y],f||(u.fa=!1)):(u=new Z(u,this.src,D,!!m,C),u.fa=f,o.push(u)),u};function de(o,u){var f=u.type;if(f in o.g){var m=o.g[f],C=Array.prototype.indexOf.call(m,u,void 0),D;(D=0<=C)&&Array.prototype.splice.call(m,C,1),D&&(re(u),o.g[f].length==0&&(delete o.g[f],o.h--))}}function _(o,u,f,m){for(var C=0;C<o.length;++C){var D=o[C];if(!D.da&&D.listener==u&&D.capture==!!f&&D.ha==m)return C}return-1}var w="closure_lm_"+(1e6*Math.random()|0),x={};function U(o,u,f,m,C){if(m&&m.once)return J(o,u,f,m,C);if(Array.isArray(u)){for(var D=0;D<u.length;D++)U(o,u[D],f,m,C);return null}return f=ue(f),o&&o[O]?o.K(u,f,h(m)?!!m.capture:!!m,C):L(o,u,f,!1,m,C)}function L(o,u,f,m,C,D){if(!u)throw Error("Invalid event type");var Y=h(C)?!!C.capture:!!C,We=X(o);if(We||(o[w]=We=new Se(o)),f=We.add(u,f,m,Y,D),f.proxy)return f;if(m=j(),f.proxy=m,m.src=o,m.listener=f,o.addEventListener)qt||(C=Y),C===void 0&&(C=!1),o.addEventListener(u.toString(),m,C);else if(o.attachEvent)o.attachEvent($(u.toString()),m);else if(o.addListener&&o.removeListener)o.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return f}function j(){function o(f){return u.call(o.src,o.listener,f)}const u=ae;return o}function J(o,u,f,m,C){if(Array.isArray(u)){for(var D=0;D<u.length;D++)J(o,u[D],f,m,C);return null}return f=ue(f),o&&o[O]?o.L(u,f,h(m)?!!m.capture:!!m,C):L(o,u,f,!0,m,C)}function Q(o,u,f,m,C){if(Array.isArray(u))for(var D=0;D<u.length;D++)Q(o,u[D],f,m,C);else m=h(m)?!!m.capture:!!m,f=ue(f),o&&o[O]?(o=o.i,u=String(u).toString(),u in o.g&&(D=o.g[u],f=_(D,f,m,C),-1<f&&(re(D[f]),Array.prototype.splice.call(D,f,1),D.length==0&&(delete o.g[u],o.h--)))):o&&(o=X(o))&&(u=o.g[u.toString()],o=-1,u&&(o=_(u,f,m,C)),(f=-1<o?u[o]:null)&&G(f))}function G(o){if(typeof o!="number"&&o&&!o.da){var u=o.src;if(u&&u[O])de(u.i,o);else{var f=o.type,m=o.proxy;u.removeEventListener?u.removeEventListener(f,m,o.capture):u.detachEvent?u.detachEvent($(f),m):u.addListener&&u.removeListener&&u.removeListener(m),(f=X(u))?(de(f,o),f.h==0&&(f.src=null,u[w]=null)):re(o)}}}function $(o){return o in x?x[o]:x[o]="on"+o}function ae(o,u){if(o.da)o=!0;else{u=new wt(u,this);var f=o.listener,m=o.ha||o.src;o.fa&&G(o),o=f.call(m,u)}return o}function X(o){return o=o[w],o instanceof Se?o:null}var ne="__closure_events_fn_"+(1e9*Math.random()>>>0);function ue(o){return typeof o=="function"?o:(o[ne]||(o[ne]=function(u){return o.handleEvent(u)}),o[ne])}function he(){qe.call(this),this.i=new Se(this),this.M=this,this.F=null}k(he,qe),he.prototype[O]=!0,he.prototype.removeEventListener=function(o,u,f,m){Q(this,o,u,f,m)};function we(o,u){var f,m=o.F;if(m)for(f=[];m;m=m.F)f.push(m);if(o=o.M,m=u.type||u,typeof u=="string")u=new Ke(u,o);else if(u instanceof Ke)u.target=u.target||o;else{var C=u;u=new Ke(m,o),v(u,C)}if(C=!0,f)for(var D=f.length-1;0<=D;D--){var Y=u.g=f[D];C=xe(Y,m,!0,u)&&C}if(Y=u.g=o,C=xe(Y,m,!0,u)&&C,C=xe(Y,m,!1,u)&&C,f)for(D=0;D<f.length;D++)Y=u.g=f[D],C=xe(Y,m,!1,u)&&C}he.prototype.N=function(){if(he.aa.N.call(this),this.i){var o=this.i,u;for(u in o.g){for(var f=o.g[u],m=0;m<f.length;m++)re(f[m]);delete o.g[u],o.h--}}this.F=null},he.prototype.K=function(o,u,f,m){return this.i.add(String(o),u,!1,f,m)},he.prototype.L=function(o,u,f,m){return this.i.add(String(o),u,!0,f,m)};function xe(o,u,f,m){if(u=o.i.g[String(u)],!u)return!0;u=u.concat();for(var C=!0,D=0;D<u.length;++D){var Y=u[D];if(Y&&!Y.da&&Y.capture==f){var We=Y.listener,bt=Y.ha||Y.src;Y.fa&&de(o.i,Y),C=We.call(bt,m)!==!1&&C}}return C&&!m.defaultPrevented}function mt(o,u,f){if(typeof o=="function")f&&(o=g(o,f));else if(o&&typeof o.handleEvent=="function")o=g(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(u)?-1:l.setTimeout(o,u||0)}function it(o){o.g=mt(()=>{o.g=null,o.i&&(o.i=!1,it(o))},o.l);const u=o.h;o.h=null,o.m.apply(null,u)}class xt extends qe{constructor(u,f){super(),this.m=u,this.l=f,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:it(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function et(o){qe.call(this),this.h=o,this.g={}}k(et,qe);var tn=[];function _n(o){ie(o.g,function(u,f){this.g.hasOwnProperty(f)&&G(u)},o),o.g={}}et.prototype.N=function(){et.aa.N.call(this),_n(this)},et.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var gt=l.JSON.stringify,Gt=l.JSON.parse,Zr=class{stringify(o){return l.JSON.stringify(o,void 0)}parse(o){return l.JSON.parse(o,void 0)}};function js(){}js.prototype.h=null;function Xi(o){return o.h||(o.h=o.i())}function Zi(){}var Cr={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function xn(){Ke.call(this,"d")}k(xn,Ke);function Bs(){Ke.call(this,"c")}k(Bs,Ke);var kn={},eo=null;function es(){return eo=eo||new he}kn.La="serverreachability";function to(o){Ke.call(this,kn.La,o)}k(to,Ke);function xr(o){const u=es();we(u,new to(u))}kn.STAT_EVENT="statevent";function no(o,u){Ke.call(this,kn.STAT_EVENT,o),this.stat=u}k(no,Ke);function Et(o){const u=es();we(u,new no(u,o))}kn.Ma="timingevent";function ro(o,u){Ke.call(this,kn.Ma,o),this.size=u}k(ro,Ke);function kr(o,u){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){o()},u)}function er(){this.g=!0}er.prototype.xa=function(){this.g=!1};function Ja(o,u,f,m,C,D){o.info(function(){if(o.g)if(D)for(var Y="",We=D.split("&"),bt=0;bt<We.length;bt++){var Fe=We[bt].split("=");if(1<Fe.length){var kt=Fe[0];Fe=Fe[1];var Dt=kt.split("_");Y=2<=Dt.length&&Dt[1]=="type"?Y+(kt+"="+Fe+"&"):Y+(kt+"=redacted&")}}else Y=null;else Y=D;return"XMLHTTP REQ ("+m+") [attempt "+C+"]: "+u+`
`+f+`
`+Y})}function Ya(o,u,f,m,C,D,Y){o.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+C+"]: "+u+`
`+f+`
`+D+" "+Y})}function V(o,u,f,m){o.info(function(){return"XMLHTTP TEXT ("+u+"): "+q(o,f)+(m?" "+m:"")})}function A(o,u){o.info(function(){return"TIMEOUT: "+u})}er.prototype.info=function(){};function q(o,u){if(!o.g)return u;if(!u)return null;try{var f=JSON.parse(u);if(f){for(o=0;o<f.length;o++)if(Array.isArray(f[o])){var m=f[o];if(!(2>m.length)){var C=m[1];if(Array.isArray(C)&&!(1>C.length)){var D=C[0];if(D!="noop"&&D!="stop"&&D!="close")for(var Y=1;Y<C.length;Y++)C[Y]=""}}}}return gt(f)}catch{return u}}var Ae={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Oe={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},De;function ve(){}k(ve,js),ve.prototype.g=function(){return new XMLHttpRequest},ve.prototype.i=function(){return{}},De=new ve;function Le(o,u,f,m){this.j=o,this.i=u,this.l=f,this.R=m||1,this.U=new et(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new ot}function ot(){this.i=null,this.g="",this.h=!1}var Dn={},le={};function Ye(o,u,f){o.L=1,o.v=ao(Nn(u)),o.m=f,o.P=!0,Xa(o,null)}function Xa(o,u){o.F=Date.now(),so(o),o.A=Nn(o.v);var f=o.A,m=o.R;Array.isArray(m)||(m=[String(m)]),Ku(f.i,"t",m),o.C=0,f=o.j.J,o.h=new ot,o.g=uh(o.j,f?u:null,!o.m),0<o.O&&(o.M=new xt(g(o.Y,o,o.g),o.O)),u=o.U,f=o.g,m=o.ca;var C="readystatechange";Array.isArray(C)||(C&&(tn[0]=C.toString()),C=tn);for(var D=0;D<C.length;D++){var Y=U(f,C[D],m||u.handleEvent,!1,u.h||u);if(!Y)break;u.g[Y.key]=Y}u=o.H?E(o.H):{},o.m?(o.u||(o.u="POST"),u["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,u)):(o.u="GET",o.g.ea(o.A,o.u,null,u)),xr(),Ja(o.i,o.u,o.A,o.l,o.R,o.m)}Le.prototype.ca=function(o){o=o.target;const u=this.M;u&&Vn(o)==3?u.j():this.Y(o)},Le.prototype.Y=function(o){try{if(o==this.g)e:{const Dt=Vn(this.g);var u=this.g.Ba();const rs=this.g.Z();if(!(3>Dt)&&(Dt!=3||this.g&&(this.h.h||this.g.oa()||Zu(this.g)))){this.J||Dt!=4||u==7||(u==8||0>=rs?xr(3):xr(2)),Za(this);var f=this.g.Z();this.X=f;t:if(Nu(this)){var m=Zu(this.g);o="";var C=m.length,D=Vn(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Dr(this),$s(this);var Y="";break t}this.h.i=new l.TextDecoder}for(u=0;u<C;u++)this.h.h=!0,o+=this.h.i.decode(m[u],{stream:!(D&&u==C-1)});m.length=0,this.h.g+=o,this.C=0,Y=this.h.g}else Y=this.g.oa();if(this.o=f==200,Ya(this.i,this.u,this.A,this.l,this.R,Dt,f),this.o){if(this.T&&!this.K){t:{if(this.g){var We,bt=this.g;if((We=bt.g?bt.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!z(We)){var Fe=We;break t}}Fe=null}if(f=Fe)V(this.i,this.l,f,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,el(this,f);else{this.o=!1,this.s=3,Et(12),Dr(this),$s(this);break e}}if(this.P){f=!0;let un;for(;!this.J&&this.C<Y.length;)if(un=a_(this,Y),un==le){Dt==4&&(this.s=4,Et(14),f=!1),V(this.i,this.l,null,"[Incomplete Response]");break}else if(un==Dn){this.s=4,Et(15),V(this.i,this.l,Y,"[Invalid Chunk]"),f=!1;break}else V(this.i,this.l,un,null),el(this,un);if(Nu(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Dt!=4||Y.length!=0||this.h.h||(this.s=1,Et(16),f=!1),this.o=this.o&&f,!f)V(this.i,this.l,Y,"[Invalid Chunked Response]"),Dr(this),$s(this);else if(0<Y.length&&!this.W){this.W=!0;var kt=this.j;kt.g==this&&kt.ba&&!kt.M&&(kt.j.info("Great, no buffering proxy detected. Bytes received: "+Y.length),ol(kt),kt.M=!0,Et(11))}}else V(this.i,this.l,Y,null),el(this,Y);Dt==4&&Dr(this),this.o&&!this.J&&(Dt==4?oh(this.j,this):(this.o=!1,so(this)))}else I_(this.g),f==400&&0<Y.indexOf("Unknown SID")?(this.s=3,Et(12)):(this.s=0,Et(13)),Dr(this),$s(this)}}}catch{}finally{}};function Nu(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function a_(o,u){var f=o.C,m=u.indexOf(`
`,f);return m==-1?le:(f=Number(u.substring(f,m)),isNaN(f)?Dn:(m+=1,m+f>u.length?le:(u=u.slice(m,m+f),o.C=m+f,u)))}Le.prototype.cancel=function(){this.J=!0,Dr(this)};function so(o){o.S=Date.now()+o.I,Vu(o,o.I)}function Vu(o,u){if(o.B!=null)throw Error("WatchDog timer not null");o.B=kr(g(o.ba,o),u)}function Za(o){o.B&&(l.clearTimeout(o.B),o.B=null)}Le.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(A(this.i,this.A),this.L!=2&&(xr(),Et(17)),Dr(this),this.s=2,$s(this)):Vu(this,this.S-o)};function $s(o){o.j.G==0||o.J||oh(o.j,o)}function Dr(o){Za(o);var u=o.M;u&&typeof u.ma=="function"&&u.ma(),o.M=null,_n(o.U),o.g&&(u=o.g,o.g=null,u.abort(),u.ma())}function el(o,u){try{var f=o.j;if(f.G!=0&&(f.g==o||tl(f.h,o))){if(!o.K&&tl(f.h,o)&&f.G==3){try{var m=f.Da.g.parse(u)}catch{m=null}if(Array.isArray(m)&&m.length==3){var C=m;if(C[0]==0){e:if(!f.u){if(f.g)if(f.g.F+3e3<o.F)po(f),ho(f);else break e;il(f),Et(18)}}else f.za=C[1],0<f.za-f.T&&37500>C[2]&&f.F&&f.v==0&&!f.C&&(f.C=kr(g(f.Za,f),6e3));if(1>=Lu(f.h)&&f.ca){try{f.ca()}catch{}f.ca=void 0}}else Vr(f,11)}else if((o.K||f.g==o)&&po(f),!z(u))for(C=f.Da.g.parse(u),u=0;u<C.length;u++){let Fe=C[u];if(f.T=Fe[0],Fe=Fe[1],f.G==2)if(Fe[0]=="c"){f.K=Fe[1],f.ia=Fe[2];const kt=Fe[3];kt!=null&&(f.la=kt,f.j.info("VER="+f.la));const Dt=Fe[4];Dt!=null&&(f.Aa=Dt,f.j.info("SVER="+f.Aa));const rs=Fe[5];rs!=null&&typeof rs=="number"&&0<rs&&(m=1.5*rs,f.L=m,f.j.info("backChannelRequestTimeoutMs_="+m)),m=f;const un=o.g;if(un){const go=un.g?un.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(go){var D=m.h;D.g||go.indexOf("spdy")==-1&&go.indexOf("quic")==-1&&go.indexOf("h2")==-1||(D.j=D.l,D.g=new Set,D.h&&(nl(D,D.h),D.h=null))}if(m.D){const al=un.g?un.g.getResponseHeader("X-HTTP-Session-Id"):null;al&&(m.ya=al,Xe(m.I,m.D,al))}}f.G=3,f.l&&f.l.ua(),f.ba&&(f.R=Date.now()-o.F,f.j.info("Handshake RTT: "+f.R+"ms")),m=f;var Y=o;if(m.qa=ch(m,m.J?m.ia:null,m.W),Y.K){Fu(m.h,Y);var We=Y,bt=m.L;bt&&(We.I=bt),We.B&&(Za(We),so(We)),m.g=Y}else sh(m);0<f.i.length&&fo(f)}else Fe[0]!="stop"&&Fe[0]!="close"||Vr(f,7);else f.G==3&&(Fe[0]=="stop"||Fe[0]=="close"?Fe[0]=="stop"?Vr(f,7):sl(f):Fe[0]!="noop"&&f.l&&f.l.ta(Fe),f.v=0)}}xr(4)}catch{}}var l_=class{constructor(o,u){this.g=o,this.map=u}};function Ou(o){this.l=o||10,l.PerformanceNavigationTiming?(o=l.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Mu(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Lu(o){return o.h?1:o.g?o.g.size:0}function tl(o,u){return o.h?o.h==u:o.g?o.g.has(u):!1}function nl(o,u){o.g?o.g.add(u):o.h=u}function Fu(o,u){o.h&&o.h==u?o.h=null:o.g&&o.g.has(u)&&o.g.delete(u)}Ou.prototype.cancel=function(){if(this.i=Uu(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Uu(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let u=o.i;for(const f of o.g.values())u=u.concat(f.D);return u}return N(o.i)}function c_(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(c(o)){for(var u=[],f=o.length,m=0;m<f;m++)u.push(o[m]);return u}u=[],f=0;for(m in o)u[f++]=o[m];return u}function u_(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(c(o)||typeof o=="string"){var u=[];o=o.length;for(var f=0;f<o;f++)u.push(f);return u}u=[],f=0;for(const m in o)u[f++]=m;return u}}}function ju(o,u){if(o.forEach&&typeof o.forEach=="function")o.forEach(u,void 0);else if(c(o)||typeof o=="string")Array.prototype.forEach.call(o,u,void 0);else for(var f=u_(o),m=c_(o),C=m.length,D=0;D<C;D++)u.call(void 0,m[D],f&&f[D],o)}var Bu=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function h_(o,u){if(o){o=o.split("&");for(var f=0;f<o.length;f++){var m=o[f].indexOf("="),C=null;if(0<=m){var D=o[f].substring(0,m);C=o[f].substring(m+1)}else D=o[f];u(D,C?decodeURIComponent(C.replace(/\+/g," ")):"")}}}function Nr(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof Nr){this.h=o.h,io(this,o.j),this.o=o.o,this.g=o.g,oo(this,o.s),this.l=o.l;var u=o.i,f=new Hs;f.i=u.i,u.g&&(f.g=new Map(u.g),f.h=u.h),$u(this,f),this.m=o.m}else o&&(u=String(o).match(Bu))?(this.h=!1,io(this,u[1]||"",!0),this.o=qs(u[2]||""),this.g=qs(u[3]||"",!0),oo(this,u[4]),this.l=qs(u[5]||"",!0),$u(this,u[6]||"",!0),this.m=qs(u[7]||"")):(this.h=!1,this.i=new Hs(null,this.h))}Nr.prototype.toString=function(){var o=[],u=this.j;u&&o.push(zs(u,qu,!0),":");var f=this.g;return(f||u=="file")&&(o.push("//"),(u=this.o)&&o.push(zs(u,qu,!0),"@"),o.push(encodeURIComponent(String(f)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.s,f!=null&&o.push(":",String(f))),(f=this.l)&&(this.g&&f.charAt(0)!="/"&&o.push("/"),o.push(zs(f,f.charAt(0)=="/"?p_:f_,!0))),(f=this.i.toString())&&o.push("?",f),(f=this.m)&&o.push("#",zs(f,g_)),o.join("")};function Nn(o){return new Nr(o)}function io(o,u,f){o.j=f?qs(u,!0):u,o.j&&(o.j=o.j.replace(/:$/,""))}function oo(o,u){if(u){if(u=Number(u),isNaN(u)||0>u)throw Error("Bad port number "+u);o.s=u}else o.s=null}function $u(o,u,f){u instanceof Hs?(o.i=u,__(o.i,o.h)):(f||(u=zs(u,m_)),o.i=new Hs(u,o.h))}function Xe(o,u,f){o.i.set(u,f)}function ao(o){return Xe(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function qs(o,u){return o?u?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function zs(o,u,f){return typeof o=="string"?(o=encodeURI(o).replace(u,d_),f&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function d_(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var qu=/[#\/\?@]/g,f_=/[#\?:]/g,p_=/[#\?]/g,m_=/[#\?@]/g,g_=/#/g;function Hs(o,u){this.h=this.g=null,this.i=o||null,this.j=!!u}function tr(o){o.g||(o.g=new Map,o.h=0,o.i&&h_(o.i,function(u,f){o.add(decodeURIComponent(u.replace(/\+/g," ")),f)}))}t=Hs.prototype,t.add=function(o,u){tr(this),this.i=null,o=ts(this,o);var f=this.g.get(o);return f||this.g.set(o,f=[]),f.push(u),this.h+=1,this};function zu(o,u){tr(o),u=ts(o,u),o.g.has(u)&&(o.i=null,o.h-=o.g.get(u).length,o.g.delete(u))}function Hu(o,u){return tr(o),u=ts(o,u),o.g.has(u)}t.forEach=function(o,u){tr(this),this.g.forEach(function(f,m){f.forEach(function(C){o.call(u,C,m,this)},this)},this)},t.na=function(){tr(this);const o=Array.from(this.g.values()),u=Array.from(this.g.keys()),f=[];for(let m=0;m<u.length;m++){const C=o[m];for(let D=0;D<C.length;D++)f.push(u[m])}return f},t.V=function(o){tr(this);let u=[];if(typeof o=="string")Hu(this,o)&&(u=u.concat(this.g.get(ts(this,o))));else{o=Array.from(this.g.values());for(let f=0;f<o.length;f++)u=u.concat(o[f])}return u},t.set=function(o,u){return tr(this),this.i=null,o=ts(this,o),Hu(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[u]),this.h+=1,this},t.get=function(o,u){return o?(o=this.V(o),0<o.length?String(o[0]):u):u};function Ku(o,u,f){zu(o,u),0<f.length&&(o.i=null,o.g.set(ts(o,u),N(f)),o.h+=f.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],u=Array.from(this.g.keys());for(var f=0;f<u.length;f++){var m=u[f];const D=encodeURIComponent(String(m)),Y=this.V(m);for(m=0;m<Y.length;m++){var C=D;Y[m]!==""&&(C+="="+encodeURIComponent(String(Y[m]))),o.push(C)}}return this.i=o.join("&")};function ts(o,u){return u=String(u),o.j&&(u=u.toLowerCase()),u}function __(o,u){u&&!o.j&&(tr(o),o.i=null,o.g.forEach(function(f,m){var C=m.toLowerCase();m!=C&&(zu(this,m),Ku(this,C,f))},o)),o.j=u}function y_(o,u){const f=new er;if(l.Image){const m=new Image;m.onload=y(nr,f,"TestLoadImage: loaded",!0,u,m),m.onerror=y(nr,f,"TestLoadImage: error",!1,u,m),m.onabort=y(nr,f,"TestLoadImage: abort",!1,u,m),m.ontimeout=y(nr,f,"TestLoadImage: timeout",!1,u,m),l.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=o}else u(!1)}function v_(o,u){const f=new er,m=new AbortController,C=setTimeout(()=>{m.abort(),nr(f,"TestPingServer: timeout",!1,u)},1e4);fetch(o,{signal:m.signal}).then(D=>{clearTimeout(C),D.ok?nr(f,"TestPingServer: ok",!0,u):nr(f,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(C),nr(f,"TestPingServer: error",!1,u)})}function nr(o,u,f,m,C){try{C&&(C.onload=null,C.onerror=null,C.onabort=null,C.ontimeout=null),m(f)}catch{}}function w_(){this.g=new Zr}function E_(o,u,f){const m=f||"";try{ju(o,function(C,D){let Y=C;h(C)&&(Y=gt(C)),u.push(m+D+"="+encodeURIComponent(Y))})}catch(C){throw u.push(m+"type="+encodeURIComponent("_badmap")),C}}function lo(o){this.l=o.Ub||null,this.j=o.eb||!1}k(lo,js),lo.prototype.g=function(){return new co(this.l,this.j)},lo.prototype.i=function(o){return function(){return o}}({});function co(o,u){he.call(this),this.D=o,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}k(co,he),t=co.prototype,t.open=function(o,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=u,this.readyState=1,Ws(this)},t.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const u={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(u.body=o),(this.D||l).fetch(new Request(this.A,u)).then(this.Sa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Ks(this)),this.readyState=0},t.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,Ws(this)),this.g&&(this.readyState=3,Ws(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Wu(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function Wu(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}t.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var u=o.value?o.value:new Uint8Array(0);(u=this.v.decode(u,{stream:!o.done}))&&(this.response=this.responseText+=u)}o.done?Ks(this):Ws(this),this.readyState==3&&Wu(this)}},t.Ra=function(o){this.g&&(this.response=this.responseText=o,Ks(this))},t.Qa=function(o){this.g&&(this.response=o,Ks(this))},t.ga=function(){this.g&&Ks(this)};function Ks(o){o.readyState=4,o.l=null,o.j=null,o.v=null,Ws(o)}t.setRequestHeader=function(o,u){this.u.append(o,u)},t.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],u=this.h.entries();for(var f=u.next();!f.done;)f=f.value,o.push(f[0]+": "+f[1]),f=u.next();return o.join(`\r
`)};function Ws(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(co.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Gu(o){let u="";return ie(o,function(f,m){u+=m,u+=":",u+=f,u+=`\r
`}),u}function rl(o,u,f){e:{for(m in f){var m=!1;break e}m=!0}m||(f=Gu(f),typeof o=="string"?f!=null&&encodeURIComponent(String(f)):Xe(o,u,f))}function at(o){he.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}k(at,he);var b_=/^https?$/i,T_=["POST","PUT"];t=at.prototype,t.Ha=function(o){this.J=o},t.ea=function(o,u,f,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);u=u?u.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():De.g(),this.v=this.o?Xi(this.o):Xi(De),this.g.onreadystatechange=g(this.Ea,this);try{this.B=!0,this.g.open(u,String(o),!0),this.B=!1}catch(D){Qu(this,D);return}if(o=f||"",f=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var C in m)f.set(C,m[C]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const D of m.keys())f.set(D,m.get(D));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(f.keys()).find(D=>D.toLowerCase()=="content-type"),C=l.FormData&&o instanceof l.FormData,!(0<=Array.prototype.indexOf.call(T_,u,void 0))||m||C||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[D,Y]of f)this.g.setRequestHeader(D,Y);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Xu(this),this.u=!0,this.g.send(o),this.u=!1}catch(D){Qu(this,D)}};function Qu(o,u){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=u,o.m=5,Ju(o),uo(o)}function Ju(o){o.A||(o.A=!0,we(o,"complete"),we(o,"error"))}t.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,we(this,"complete"),we(this,"abort"),uo(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),uo(this,!0)),at.aa.N.call(this)},t.Ea=function(){this.s||(this.B||this.u||this.j?Yu(this):this.bb())},t.bb=function(){Yu(this)};function Yu(o){if(o.h&&typeof a<"u"&&(!o.v[1]||Vn(o)!=4||o.Z()!=2)){if(o.u&&Vn(o)==4)mt(o.Ea,0,o);else if(we(o,"readystatechange"),Vn(o)==4){o.h=!1;try{const Y=o.Z();e:switch(Y){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break e;default:u=!1}var f;if(!(f=u)){var m;if(m=Y===0){var C=String(o.D).match(Bu)[1]||null;!C&&l.self&&l.self.location&&(C=l.self.location.protocol.slice(0,-1)),m=!b_.test(C?C.toLowerCase():"")}f=m}if(f)we(o,"complete"),we(o,"success");else{o.m=6;try{var D=2<Vn(o)?o.g.statusText:""}catch{D=""}o.l=D+" ["+o.Z()+"]",Ju(o)}}finally{uo(o)}}}}function uo(o,u){if(o.g){Xu(o);const f=o.g,m=o.v[0]?()=>{}:null;o.g=null,o.v=null,u||we(o,"ready");try{f.onreadystatechange=m}catch{}}}function Xu(o){o.I&&(l.clearTimeout(o.I),o.I=null)}t.isActive=function(){return!!this.g};function Vn(o){return o.g?o.g.readyState:0}t.Z=function(){try{return 2<Vn(this)?this.g.status:-1}catch{return-1}},t.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.Oa=function(o){if(this.g){var u=this.g.responseText;return o&&u.indexOf(o)==0&&(u=u.substring(o.length)),Gt(u)}};function Zu(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function I_(o){const u={};o=(o.g&&2<=Vn(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<o.length;m++){if(z(o[m]))continue;var f=S(o[m]);const C=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const D=u[C]||[];u[C]=D,D.push(f)}R(u,function(m){return m.join(", ")})}t.Ba=function(){return this.m},t.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Gs(o,u,f){return f&&f.internalChannelParams&&f.internalChannelParams[o]||u}function eh(o){this.Aa=0,this.i=[],this.j=new er,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Gs("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Gs("baseRetryDelayMs",5e3,o),this.cb=Gs("retryDelaySeedMs",1e4,o),this.Wa=Gs("forwardChannelMaxRetries",2,o),this.wa=Gs("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new Ou(o&&o.concurrentRequestLimit),this.Da=new w_,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}t=eh.prototype,t.la=8,t.G=1,t.connect=function(o,u,f,m){Et(0),this.W=o,this.H=u||{},f&&m!==void 0&&(this.H.OSID=f,this.H.OAID=m),this.F=this.X,this.I=ch(this,null,this.W),fo(this)};function sl(o){if(th(o),o.G==3){var u=o.U++,f=Nn(o.I);if(Xe(f,"SID",o.K),Xe(f,"RID",u),Xe(f,"TYPE","terminate"),Qs(o,f),u=new Le(o,o.j,u),u.L=2,u.v=ao(Nn(f)),f=!1,l.navigator&&l.navigator.sendBeacon)try{f=l.navigator.sendBeacon(u.v.toString(),"")}catch{}!f&&l.Image&&(new Image().src=u.v,f=!0),f||(u.g=uh(u.j,null),u.g.ea(u.v)),u.F=Date.now(),so(u)}lh(o)}function ho(o){o.g&&(ol(o),o.g.cancel(),o.g=null)}function th(o){ho(o),o.u&&(l.clearTimeout(o.u),o.u=null),po(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&l.clearTimeout(o.s),o.s=null)}function fo(o){if(!Mu(o.h)&&!o.s){o.s=!0;var u=o.Ga;Ce||$t(),Re||(Ce(),Re=!0),Bt.add(u,o),o.B=0}}function A_(o,u){return Lu(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=u.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=kr(g(o.Ga,o,u),ah(o,o.B)),o.B++,!0)}t.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const C=new Le(this,this.j,o);let D=this.o;if(this.S&&(D?(D=E(D),v(D,this.S)):D=this.S),this.m!==null||this.O||(C.H=D,D=null),this.P)e:{for(var u=0,f=0;f<this.i.length;f++){t:{var m=this.i[f];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break t}m=void 0}if(m===void 0)break;if(u+=m,4096<u){u=f;break e}if(u===4096||f===this.i.length-1){u=f+1;break e}}u=1e3}else u=1e3;u=rh(this,C,u),f=Nn(this.I),Xe(f,"RID",o),Xe(f,"CVER",22),this.D&&Xe(f,"X-HTTP-Session-Id",this.D),Qs(this,f),D&&(this.O?u="headers="+encodeURIComponent(String(Gu(D)))+"&"+u:this.m&&rl(f,this.m,D)),nl(this.h,C),this.Ua&&Xe(f,"TYPE","init"),this.P?(Xe(f,"$req",u),Xe(f,"SID","null"),C.T=!0,Ye(C,f,null)):Ye(C,f,u),this.G=2}}else this.G==3&&(o?nh(this,o):this.i.length==0||Mu(this.h)||nh(this))};function nh(o,u){var f;u?f=u.l:f=o.U++;const m=Nn(o.I);Xe(m,"SID",o.K),Xe(m,"RID",f),Xe(m,"AID",o.T),Qs(o,m),o.m&&o.o&&rl(m,o.m,o.o),f=new Le(o,o.j,f,o.B+1),o.m===null&&(f.H=o.o),u&&(o.i=u.D.concat(o.i)),u=rh(o,f,1e3),f.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),nl(o.h,f),Ye(f,m,u)}function Qs(o,u){o.H&&ie(o.H,function(f,m){Xe(u,m,f)}),o.l&&ju({},function(f,m){Xe(u,m,f)})}function rh(o,u,f){f=Math.min(o.i.length,f);var m=o.l?g(o.l.Na,o.l,o):null;e:{var C=o.i;let D=-1;for(;;){const Y=["count="+f];D==-1?0<f?(D=C[0].g,Y.push("ofs="+D)):D=0:Y.push("ofs="+D);let We=!0;for(let bt=0;bt<f;bt++){let Fe=C[bt].g;const kt=C[bt].map;if(Fe-=D,0>Fe)D=Math.max(0,C[bt].g-100),We=!1;else try{E_(kt,Y,"req"+Fe+"_")}catch{m&&m(kt)}}if(We){m=Y.join("&");break e}}}return o=o.i.splice(0,f),u.D=o,m}function sh(o){if(!o.g&&!o.u){o.Y=1;var u=o.Fa;Ce||$t(),Re||(Ce(),Re=!0),Bt.add(u,o),o.v=0}}function il(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=kr(g(o.Fa,o),ah(o,o.v)),o.v++,!0)}t.Fa=function(){if(this.u=null,ih(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=kr(g(this.ab,this),o)}},t.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Et(10),ho(this),ih(this))};function ol(o){o.A!=null&&(l.clearTimeout(o.A),o.A=null)}function ih(o){o.g=new Le(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var u=Nn(o.qa);Xe(u,"RID","rpc"),Xe(u,"SID",o.K),Xe(u,"AID",o.T),Xe(u,"CI",o.F?"0":"1"),!o.F&&o.ja&&Xe(u,"TO",o.ja),Xe(u,"TYPE","xmlhttp"),Qs(o,u),o.m&&o.o&&rl(u,o.m,o.o),o.L&&(o.g.I=o.L);var f=o.g;o=o.ia,f.L=1,f.v=ao(Nn(u)),f.m=null,f.P=!0,Xa(f,o)}t.Za=function(){this.C!=null&&(this.C=null,ho(this),il(this),Et(19))};function po(o){o.C!=null&&(l.clearTimeout(o.C),o.C=null)}function oh(o,u){var f=null;if(o.g==u){po(o),ol(o),o.g=null;var m=2}else if(tl(o.h,u))f=u.D,Fu(o.h,u),m=1;else return;if(o.G!=0){if(u.o)if(m==1){f=u.m?u.m.length:0,u=Date.now()-u.F;var C=o.B;m=es(),we(m,new ro(m,f)),fo(o)}else sh(o);else if(C=u.s,C==3||C==0&&0<u.X||!(m==1&&A_(o,u)||m==2&&il(o)))switch(f&&0<f.length&&(u=o.h,u.i=u.i.concat(f)),C){case 1:Vr(o,5);break;case 4:Vr(o,10);break;case 3:Vr(o,6);break;default:Vr(o,2)}}}function ah(o,u){let f=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(f*=2),f*u}function Vr(o,u){if(o.j.info("Error code "+u),u==2){var f=g(o.fb,o),m=o.Xa;const C=!m;m=new Nr(m||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||io(m,"https"),ao(m),C?y_(m.toString(),f):v_(m.toString(),f)}else Et(2);o.G=0,o.l&&o.l.sa(u),lh(o),th(o)}t.fb=function(o){o?(this.j.info("Successfully pinged google.com"),Et(2)):(this.j.info("Failed to ping google.com"),Et(1))};function lh(o){if(o.G=0,o.ka=[],o.l){const u=Uu(o.h);(u.length!=0||o.i.length!=0)&&(M(o.ka,u),M(o.ka,o.i),o.h.i.length=0,N(o.i),o.i.length=0),o.l.ra()}}function ch(o,u,f){var m=f instanceof Nr?Nn(f):new Nr(f);if(m.g!="")u&&(m.g=u+"."+m.g),oo(m,m.s);else{var C=l.location;m=C.protocol,u=u?u+"."+C.hostname:C.hostname,C=+C.port;var D=new Nr(null);m&&io(D,m),u&&(D.g=u),C&&oo(D,C),f&&(D.l=f),m=D}return f=o.D,u=o.ya,f&&u&&Xe(m,f,u),Xe(m,"VER",o.la),Qs(o,m),m}function uh(o,u,f){if(u&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return u=o.Ca&&!o.pa?new at(new lo({eb:f})):new at(o.pa),u.Ha(o.J),u}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function hh(){}t=hh.prototype,t.ua=function(){},t.ta=function(){},t.sa=function(){},t.ra=function(){},t.isActive=function(){return!0},t.Na=function(){};function mo(){}mo.prototype.g=function(o,u){return new nn(o,u)};function nn(o,u){he.call(this),this.g=new eh(u),this.l=o,this.h=u&&u.messageUrlParams||null,o=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(o?o["X-WebChannel-Content-Type"]=u.messageContentType:o={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.va&&(o?o["X-WebChannel-Client-Profile"]=u.va:o={"X-WebChannel-Client-Profile":u.va}),this.g.S=o,(o=u&&u.Sb)&&!z(o)&&(this.g.m=o),this.v=u&&u.supportsCrossDomainXhr||!1,this.u=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!z(u)&&(this.g.D=u,o=this.h,o!==null&&u in o&&(o=this.h,u in o&&delete o[u])),this.j=new ns(this)}k(nn,he),nn.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},nn.prototype.close=function(){sl(this.g)},nn.prototype.o=function(o){var u=this.g;if(typeof o=="string"){var f={};f.__data__=o,o=f}else this.u&&(f={},f.__data__=gt(o),o=f);u.i.push(new l_(u.Ya++,o)),u.G==3&&fo(u)},nn.prototype.N=function(){this.g.l=null,delete this.j,sl(this.g),delete this.g,nn.aa.N.call(this)};function dh(o){xn.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var u=o.__sm__;if(u){e:{for(const f in u){o=f;break e}o=void 0}(this.i=o)&&(o=this.i,u=u!==null&&o in u?u[o]:void 0),this.data=u}else this.data=o}k(dh,xn);function fh(){Bs.call(this),this.status=1}k(fh,Bs);function ns(o){this.g=o}k(ns,hh),ns.prototype.ua=function(){we(this.g,"a")},ns.prototype.ta=function(o){we(this.g,new dh(o))},ns.prototype.sa=function(o){we(this.g,new fh)},ns.prototype.ra=function(){we(this.g,"b")},mo.prototype.createWebChannel=mo.prototype.g,nn.prototype.send=nn.prototype.o,nn.prototype.open=nn.prototype.m,nn.prototype.close=nn.prototype.close,im=function(){return new mo},sm=function(){return es()},rm=kn,nc={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Ae.NO_ERROR=0,Ae.TIMEOUT=8,Ae.HTTP_ERROR=6,Do=Ae,Oe.COMPLETE="complete",nm=Oe,Zi.EventType=Cr,Cr.OPEN="a",Cr.CLOSE="b",Cr.ERROR="c",Cr.MESSAGE="d",he.prototype.listen=he.prototype.K,ti=Zi,at.prototype.listenOnce=at.prototype.L,at.prototype.getLastError=at.prototype.Ka,at.prototype.getLastErrorCode=at.prototype.Ba,at.prototype.getStatus=at.prototype.Z,at.prototype.getResponseJson=at.prototype.Oa,at.prototype.getResponseText=at.prototype.oa,at.prototype.send=at.prototype.ea,at.prototype.setWithCredentials=at.prototype.Ha,tm=at}).apply(typeof wo<"u"?wo:typeof self<"u"?self:typeof window<"u"?window:{});const _d="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vt{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Vt.UNAUTHENTICATED=new Vt(null),Vt.GOOGLE_CREDENTIALS=new Vt("google-credentials-uid"),Vt.FIRST_PARTY=new Vt("first-party-uid"),Vt.MOCK_USER=new Vt("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Os="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qr=new $c("@firebase/firestore");function Zs(){return qr.logLevel}function se(t,...e){if(qr.logLevel<=Ne.DEBUG){const n=e.map(Hc);qr.debug(`Firestore (${Os}): ${t}`,...n)}}function Gn(t,...e){if(qr.logLevel<=Ne.ERROR){const n=e.map(Hc);qr.error(`Firestore (${Os}): ${t}`,...n)}}function Ss(t,...e){if(qr.logLevel<=Ne.WARN){const n=e.map(Hc);qr.warn(`Firestore (${Os}): ${t}`,...n)}}function Hc(t){if(typeof t=="string")return t;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
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
 */function _e(t="Unexpected state"){const e=`FIRESTORE (${Os}) INTERNAL ASSERTION FAILED: `+t;throw Gn(e),new Error(e)}function He(t,e){t||_e()}function Te(t,e){return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const F={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class te extends Zn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zn{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class om{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class NE{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(Vt.UNAUTHENTICATED))}shutdown(){}}class VE{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class OE{constructor(e){this.t=e,this.currentUser=Vt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){He(this.o===void 0);let r=this.i;const s=c=>this.i!==r?(r=this.i,n(c)):Promise.resolve();let i=new zn;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new zn,e.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const c=i;e.enqueueRetryable(async()=>{await c.promise,await s(this.currentUser)})},l=c=>{se("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(c=>l(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?l(c):(se("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new zn)}},0),a()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?(se("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(He(typeof r.accessToken=="string"),new om(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return He(e===null||typeof e=="string"),new Vt(e)}}class ME{constructor(e,n,r){this.l=e,this.h=n,this.P=r,this.type="FirstParty",this.user=Vt.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class LE{constructor(e,n,r){this.l=e,this.h=n,this.P=r}getToken(){return Promise.resolve(new ME(this.l,this.h,this.P))}start(e,n){e.enqueueRetryable(()=>n(Vt.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class FE{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class UE{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,n){He(this.o===void 0);const r=i=>{i.error!=null&&se("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.R;return this.R=i.token,se("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?n(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{se("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):se("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(He(typeof n.token=="string"),this.R=n.token,new FE(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function jE(t){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class am{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const s=jE(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<n&&(r+=e.charAt(s[i]%e.length))}return r}}function Ue(t,e){return t<e?-1:t>e?1:0}function Ps(t,e,n){return t.length===e.length&&t.every((r,s)=>n(r,e[s]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _t{constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new te(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new te(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<-62135596800)throw new te(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new te(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return _t.fromMillis(Date.now())}static fromDate(e){return _t.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*n));return new _t(n,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?Ue(this.nanoseconds,e.nanoseconds):Ue(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class be{constructor(e){this.timestamp=e}static fromTimestamp(e){return new be(e)}static min(){return new be(new _t(0,0))}static max(){return new be(new _t(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pi{constructor(e,n,r){n===void 0?n=0:n>e.length&&_e(),r===void 0?r=e.length-n:r>e.length-n&&_e(),this.segments=e,this.offset=n,this.len=r}get length(){return this.len}isEqual(e){return Pi.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof Pi?e.forEach(r=>{n.push(r)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,r=this.limit();n<r;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const r=Math.min(e.length,n.length);for(let s=0;s<r;s++){const i=e.get(s),a=n.get(s);if(i<a)return-1;if(i>a)return 1}return e.length<n.length?-1:e.length>n.length?1:0}}class Ze extends Pi{construct(e,n,r){return new Ze(e,n,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const n=[];for(const r of e){if(r.indexOf("//")>=0)throw new te(F.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);n.push(...r.split("/").filter(s=>s.length>0))}return new Ze(n)}static emptyPath(){return new Ze([])}}const BE=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Rt extends Pi{construct(e,n,r){return new Rt(e,n,r)}static isValidIdentifier(e){return BE.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Rt.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new Rt(["__name__"])}static fromServerFormat(e){const n=[];let r="",s=0;const i=()=>{if(r.length===0)throw new te(F.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let a=!1;for(;s<e.length;){const l=e[s];if(l==="\\"){if(s+1===e.length)throw new te(F.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new te(F.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=c,s+=2}else l==="`"?(a=!a,s++):l!=="."||a?(r+=l,s++):(i(),s++)}if(i(),a)throw new te(F.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Rt(n)}static emptyPath(){return new Rt([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ce{constructor(e){this.path=e}static fromPath(e){return new ce(Ze.fromString(e))}static fromName(e){return new ce(Ze.fromString(e).popFirst(5))}static empty(){return new ce(Ze.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Ze.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return Ze.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new ce(new Ze(e.slice()))}}function $E(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,s=be.fromTimestamp(r===1e9?new _t(n+1,0):new _t(n,r));return new br(s,ce.empty(),e)}function qE(t){return new br(t.readTime,t.key,-1)}class br{constructor(e,n,r){this.readTime=e,this.documentKey=n,this.largestBatchId=r}static min(){return new br(be.min(),ce.empty(),-1)}static max(){return new br(be.max(),ce.empty(),-1)}}function zE(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=ce.comparator(t.documentKey,e.documentKey),n!==0?n:Ue(t.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const HE="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class KE{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function $i(t){if(t.code!==F.FAILED_PRECONDITION||t.message!==HE)throw t;se("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class B{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&_e(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new B((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(n,i).next(r,s)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{const n=e();return n instanceof B?n:B.resolve(n)}catch(n){return B.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):B.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):B.reject(n)}static resolve(e){return new B((n,r)=>{n(e)})}static reject(e){return new B((n,r)=>{r(e)})}static waitFor(e){return new B((n,r)=>{let s=0,i=0,a=!1;e.forEach(l=>{++s,l.next(()=>{++i,a&&i===s&&n()},c=>r(c))}),a=!0,i===s&&n()})}static or(e){let n=B.resolve(!1);for(const r of e)n=n.next(s=>s?B.resolve(s):r());return n}static forEach(e,n){const r=[];return e.forEach((s,i)=>{r.push(n.call(this,s,i))}),this.waitFor(r)}static mapArray(e,n){return new B((r,s)=>{const i=e.length,a=new Array(i);let l=0;for(let c=0;c<i;c++){const h=c;n(e[h]).next(d=>{a[h]=d,++l,l===i&&r(a)},d=>s(d))}})}static doWhile(e,n){return new B((r,s)=>{const i=()=>{e()===!0?n().next(()=>{i()},s):r()};i()})}}function WE(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function qi(t){return t.name==="IndexedDbTransactionError"}/**
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
 */class Kc{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=r=>this.ie(r),this.se=r=>n.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}Kc.oe=-1;function Aa(t){return t==null}function Yo(t){return t===0&&1/t==-1/0}function GE(t){return typeof t=="number"&&Number.isInteger(t)&&!Yo(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yd(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function Qr(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function lm(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class st{constructor(e,n){this.comparator=e,this.root=n||It.EMPTY}insert(e,n){return new st(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,It.BLACK,null,null))}remove(e){return new st(this.comparator,this.root.remove(e,this.comparator).copy(null,null,It.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(r===0)return n.value;r<0?n=n.left:r>0&&(n=n.right)}return null}indexOf(e){let n=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return n+r.left.size;s<0?r=r.left:(n+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,r)=>(e(n,r),!1))}toString(){const e=[];return this.inorderTraversal((n,r)=>(e.push(`${n}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Eo(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Eo(this.root,e,this.comparator,!1)}getReverseIterator(){return new Eo(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Eo(this.root,e,this.comparator,!0)}}class Eo{constructor(e,n,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=n?r(e.key,n):1,n&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class It{constructor(e,n,r,s,i){this.key=e,this.value=n,this.color=r??It.RED,this.left=s??It.EMPTY,this.right=i??It.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,r,s,i){return new It(e??this.key,n??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,n,r),null):i===0?s.copy(null,n,null,null,null):s.copy(null,null,null,null,s.right.insert(e,n,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return It.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let r,s=this;if(n(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,n),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),n(e,s.key)===0){if(s.right.isEmpty())return It.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,n))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,It.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,It.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw _e();const e=this.left.check();if(e!==this.right.check())throw _e();return e+(this.isRed()?0:1)}}It.EMPTY=null,It.RED=!0,It.BLACK=!1;It.EMPTY=new class{constructor(){this.size=0}get key(){throw _e()}get value(){throw _e()}get color(){throw _e()}get left(){throw _e()}get right(){throw _e()}copy(e,n,r,s,i){return this}insert(e,n,r){return new It(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pt{constructor(e){this.comparator=e,this.data=new st(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,r)=>(e(n),!1))}forEachInRange(e,n){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;n(s.key)}}forEachWhile(e,n){let r;for(r=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new vd(this.data.getIterator())}getIteratorFrom(e){return new vd(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(r=>{n=n.add(r)}),n}isEqual(e){if(!(e instanceof Pt)||this.size!==e.size)return!1;const n=this.data.getIterator(),r=e.data.getIterator();for(;n.hasNext();){const s=n.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(n=>{e.push(n)}),e}toString(){const e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){const n=new Pt(this.comparator);return n.data=e,n}}class vd{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class an{constructor(e){this.fields=e,e.sort(Rt.comparator)}static empty(){return new an([])}unionWith(e){let n=new Pt(Rt.comparator);for(const r of this.fields)n=n.add(r);for(const r of e)n=n.add(r);return new an(n.toArray())}covers(e){for(const n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return Ps(this.fields,e.fields,(n,r)=>n.isEqual(r))}}/**
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
 */class cm extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ct{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new cm("Invalid base64 string: "+i):i}}(e);return new Ct(n)}static fromUint8Array(e){const n=function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i}(e);return new Ct(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const r=new Uint8Array(n.length);for(let s=0;s<n.length;s++)r[s]=n.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Ue(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}Ct.EMPTY_BYTE_STRING=new Ct("");const QE=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Tr(t){if(He(!!t),typeof t=="string"){let e=0;const n=QE.exec(t);if(He(!!n),n[1]){let s=n[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ct(t.seconds),nanos:ct(t.nanos)}}function ct(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function zr(t){return typeof t=="string"?Ct.fromBase64String(t):Ct.fromUint8Array(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wc(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="server_timestamp"}function Gc(t){const e=t.mapValue.fields.__previous_value__;return Wc(e)?Gc(e):e}function Ci(t){const e=Tr(t.mapValue.fields.__local_write_time__.timestampValue);return new _t(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JE{constructor(e,n,r,s,i,a,l,c,h){this.databaseId=e,this.appId=n,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=l,this.longPollingOptions=c,this.useFetchStreams=h}}class xi{constructor(e,n){this.projectId=e,this.database=n||"(default)"}static empty(){return new xi("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof xi&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bo={mapValue:{fields:{__type__:{stringValue:"__max__"}}}};function Hr(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?Wc(t)?4:XE(t)?9007199254740991:YE(t)?10:11:_e()}function Pn(t,e){if(t===e)return!0;const n=Hr(t);if(n!==Hr(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return Ci(t).isEqual(Ci(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const a=Tr(s.timestampValue),l=Tr(i.timestampValue);return a.seconds===l.seconds&&a.nanos===l.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(s,i){return zr(s.bytesValue).isEqual(zr(i.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(s,i){return ct(s.geoPointValue.latitude)===ct(i.geoPointValue.latitude)&&ct(s.geoPointValue.longitude)===ct(i.geoPointValue.longitude)}(t,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return ct(s.integerValue)===ct(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const a=ct(s.doubleValue),l=ct(i.doubleValue);return a===l?Yo(a)===Yo(l):isNaN(a)&&isNaN(l)}return!1}(t,e);case 9:return Ps(t.arrayValue.values||[],e.arrayValue.values||[],Pn);case 10:case 11:return function(s,i){const a=s.mapValue.fields||{},l=i.mapValue.fields||{};if(yd(a)!==yd(l))return!1;for(const c in a)if(a.hasOwnProperty(c)&&(l[c]===void 0||!Pn(a[c],l[c])))return!1;return!0}(t,e);default:return _e()}}function ki(t,e){return(t.values||[]).find(n=>Pn(n,e))!==void 0}function Cs(t,e){if(t===e)return 0;const n=Hr(t),r=Hr(e);if(n!==r)return Ue(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return Ue(t.booleanValue,e.booleanValue);case 2:return function(i,a){const l=ct(i.integerValue||i.doubleValue),c=ct(a.integerValue||a.doubleValue);return l<c?-1:l>c?1:l===c?0:isNaN(l)?isNaN(c)?0:-1:1}(t,e);case 3:return wd(t.timestampValue,e.timestampValue);case 4:return wd(Ci(t),Ci(e));case 5:return Ue(t.stringValue,e.stringValue);case 6:return function(i,a){const l=zr(i),c=zr(a);return l.compareTo(c)}(t.bytesValue,e.bytesValue);case 7:return function(i,a){const l=i.split("/"),c=a.split("/");for(let h=0;h<l.length&&h<c.length;h++){const d=Ue(l[h],c[h]);if(d!==0)return d}return Ue(l.length,c.length)}(t.referenceValue,e.referenceValue);case 8:return function(i,a){const l=Ue(ct(i.latitude),ct(a.latitude));return l!==0?l:Ue(ct(i.longitude),ct(a.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return Ed(t.arrayValue,e.arrayValue);case 10:return function(i,a){var l,c,h,d;const p=i.fields||{},g=a.fields||{},y=(l=p.value)===null||l===void 0?void 0:l.arrayValue,k=(c=g.value)===null||c===void 0?void 0:c.arrayValue,N=Ue(((h=y==null?void 0:y.values)===null||h===void 0?void 0:h.length)||0,((d=k==null?void 0:k.values)===null||d===void 0?void 0:d.length)||0);return N!==0?N:Ed(y,k)}(t.mapValue,e.mapValue);case 11:return function(i,a){if(i===bo.mapValue&&a===bo.mapValue)return 0;if(i===bo.mapValue)return 1;if(a===bo.mapValue)return-1;const l=i.fields||{},c=Object.keys(l),h=a.fields||{},d=Object.keys(h);c.sort(),d.sort();for(let p=0;p<c.length&&p<d.length;++p){const g=Ue(c[p],d[p]);if(g!==0)return g;const y=Cs(l[c[p]],h[d[p]]);if(y!==0)return y}return Ue(c.length,d.length)}(t.mapValue,e.mapValue);default:throw _e()}}function wd(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return Ue(t,e);const n=Tr(t),r=Tr(e),s=Ue(n.seconds,r.seconds);return s!==0?s:Ue(n.nanos,r.nanos)}function Ed(t,e){const n=t.values||[],r=e.values||[];for(let s=0;s<n.length&&s<r.length;++s){const i=Cs(n[s],r[s]);if(i)return i}return Ue(n.length,r.length)}function xs(t){return rc(t)}function rc(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){const r=Tr(n);return`time(${r.seconds},${r.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return zr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return ce.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let r="[",s=!0;for(const i of n.values||[])s?s=!1:r+=",",r+=rc(i);return r+"]"}(t.arrayValue):"mapValue"in t?function(n){const r=Object.keys(n.fields||{}).sort();let s="{",i=!0;for(const a of r)i?i=!1:s+=",",s+=`${a}:${rc(n.fields[a])}`;return s+"}"}(t.mapValue):_e()}function bd(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function sc(t){return!!t&&"integerValue"in t}function Qc(t){return!!t&&"arrayValue"in t}function Td(t){return!!t&&"nullValue"in t}function Id(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function No(t){return!!t&&"mapValue"in t}function YE(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="__vector__"}function pi(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return Qr(t.mapValue.fields,(n,r)=>e.mapValue.fields[n]=pi(r)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=pi(t.arrayValue.values[n]);return e}return Object.assign({},t)}function XE(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xt{constructor(e){this.value=e}static empty(){return new Xt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let r=0;r<e.length-1;++r)if(n=(n.mapValue.fields||{})[e.get(r)],!No(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=pi(n)}setAll(e){let n=Rt.emptyPath(),r={},s=[];e.forEach((a,l)=>{if(!n.isImmediateParentOf(l)){const c=this.getFieldsMap(n);this.applyChanges(c,r,s),r={},s=[],n=l.popLast()}a?r[l.lastSegment()]=pi(a):s.push(l.lastSegment())});const i=this.getFieldsMap(n);this.applyChanges(i,r,s)}delete(e){const n=this.field(e.popLast());No(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return Pn(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=n.mapValue.fields[e.get(r)];No(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},n.mapValue.fields[e.get(r)]=s),n=s}return n.mapValue.fields}applyChanges(e,n,r){Qr(n,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new Xt(pi(this.value))}}function um(t){const e=[];return Qr(t.fields,(n,r)=>{const s=new Rt([n]);if(No(r)){const i=um(r.mapValue).fields;if(i.length===0)e.push(s);else for(const a of i)e.push(s.child(a))}else e.push(s)}),new an(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mt{constructor(e,n,r,s,i,a,l){this.key=e,this.documentType=n,this.version=r,this.readTime=s,this.createTime=i,this.data=a,this.documentState=l}static newInvalidDocument(e){return new Mt(e,0,be.min(),be.min(),be.min(),Xt.empty(),0)}static newFoundDocument(e,n,r,s){return new Mt(e,1,n,be.min(),r,s,0)}static newNoDocument(e,n){return new Mt(e,2,n,be.min(),be.min(),Xt.empty(),0)}static newUnknownDocument(e,n){return new Mt(e,3,n,be.min(),be.min(),Xt.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(be.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Xt.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Xt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=be.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Mt&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Mt(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class Xo{constructor(e,n){this.position=e,this.inclusive=n}}function Ad(t,e,n){let r=0;for(let s=0;s<t.position.length;s++){const i=e[s],a=t.position[s];if(i.field.isKeyField()?r=ce.comparator(ce.fromName(a.referenceValue),n.key):r=Cs(a,n.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function Rd(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!Pn(t.position[n],e.position[n]))return!1;return!0}/**
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
 */class Di{constructor(e,n="asc"){this.field=e,this.dir=n}}function ZE(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}/**
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
 */class hm{}class ft extends hm{constructor(e,n,r){super(),this.field=e,this.op=n,this.value=r}static create(e,n,r){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,r):new tb(e,n,r):n==="array-contains"?new sb(e,r):n==="in"?new ib(e,r):n==="not-in"?new ob(e,r):n==="array-contains-any"?new ab(e,r):new ft(e,n,r)}static createKeyFieldInFilter(e,n,r){return n==="in"?new nb(e,r):new rb(e,r)}matches(e){const n=e.data.field(this.field);return this.op==="!="?n!==null&&this.matchesComparison(Cs(n,this.value)):n!==null&&Hr(this.value)===Hr(n)&&this.matchesComparison(Cs(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return _e()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class gn extends hm{constructor(e,n){super(),this.filters=e,this.op=n,this.ae=null}static create(e,n){return new gn(e,n)}matches(e){return dm(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function dm(t){return t.op==="and"}function fm(t){return eb(t)&&dm(t)}function eb(t){for(const e of t.filters)if(e instanceof gn)return!1;return!0}function ic(t){if(t instanceof ft)return t.field.canonicalString()+t.op.toString()+xs(t.value);if(fm(t))return t.filters.map(e=>ic(e)).join(",");{const e=t.filters.map(n=>ic(n)).join(",");return`${t.op}(${e})`}}function pm(t,e){return t instanceof ft?function(r,s){return s instanceof ft&&r.op===s.op&&r.field.isEqual(s.field)&&Pn(r.value,s.value)}(t,e):t instanceof gn?function(r,s){return s instanceof gn&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,a,l)=>i&&pm(a,s.filters[l]),!0):!1}(t,e):void _e()}function mm(t){return t instanceof ft?function(n){return`${n.field.canonicalString()} ${n.op} ${xs(n.value)}`}(t):t instanceof gn?function(n){return n.op.toString()+" {"+n.getFilters().map(mm).join(" ,")+"}"}(t):"Filter"}class tb extends ft{constructor(e,n,r){super(e,n,r),this.key=ce.fromName(r.referenceValue)}matches(e){const n=ce.comparator(e.key,this.key);return this.matchesComparison(n)}}class nb extends ft{constructor(e,n){super(e,"in",n),this.keys=gm("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}}class rb extends ft{constructor(e,n){super(e,"not-in",n),this.keys=gm("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}}function gm(t,e){var n;return(((n=e.arrayValue)===null||n===void 0?void 0:n.values)||[]).map(r=>ce.fromName(r.referenceValue))}class sb extends ft{constructor(e,n){super(e,"array-contains",n)}matches(e){const n=e.data.field(this.field);return Qc(n)&&ki(n.arrayValue,this.value)}}class ib extends ft{constructor(e,n){super(e,"in",n)}matches(e){const n=e.data.field(this.field);return n!==null&&ki(this.value.arrayValue,n)}}class ob extends ft{constructor(e,n){super(e,"not-in",n)}matches(e){if(ki(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const n=e.data.field(this.field);return n!==null&&!ki(this.value.arrayValue,n)}}class ab extends ft{constructor(e,n){super(e,"array-contains-any",n)}matches(e){const n=e.data.field(this.field);return!(!Qc(n)||!n.arrayValue.values)&&n.arrayValue.values.some(r=>ki(this.value.arrayValue,r))}}/**
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
 */class lb{constructor(e,n=null,r=[],s=[],i=null,a=null,l=null){this.path=e,this.collectionGroup=n,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=a,this.endAt=l,this.ue=null}}function Sd(t,e=null,n=[],r=[],s=null,i=null,a=null){return new lb(t,e,n,r,s,i,a)}function Jc(t){const e=Te(t);if(e.ue===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(r=>ic(r)).join(","),n+="|ob:",n+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),Aa(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(r=>xs(r)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(r=>xs(r)).join(",")),e.ue=n}return e.ue}function Yc(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!ZE(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!pm(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!Rd(t.startAt,e.startAt)&&Rd(t.endAt,e.endAt)}function oc(t){return ce.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ms{constructor(e,n=null,r=[],s=[],i=null,a="F",l=null,c=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=a,this.startAt=l,this.endAt=c,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function cb(t,e,n,r,s,i,a,l){return new Ms(t,e,n,r,s,i,a,l)}function Xc(t){return new Ms(t)}function Pd(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function _m(t){return t.collectionGroup!==null}function mi(t){const e=Te(t);if(e.ce===null){e.ce=[];const n=new Set;for(const i of e.explicitOrderBy)e.ce.push(i),n.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let l=new Pt(Rt.comparator);return a.filters.forEach(c=>{c.getFlattenedFilters().forEach(h=>{h.isInequality()&&(l=l.add(h.field))})}),l})(e).forEach(i=>{n.has(i.canonicalString())||i.isKeyField()||e.ce.push(new Di(i,r))}),n.has(Rt.keyField().canonicalString())||e.ce.push(new Di(Rt.keyField(),r))}return e.ce}function Tn(t){const e=Te(t);return e.le||(e.le=ub(e,mi(t))),e.le}function ub(t,e){if(t.limitType==="F")return Sd(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new Di(s.field,i)});const n=t.endAt?new Xo(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new Xo(t.startAt.position,t.startAt.inclusive):null;return Sd(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}function ac(t,e){const n=t.filters.concat([e]);return new Ms(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function lc(t,e,n){return new Ms(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function Ra(t,e){return Yc(Tn(t),Tn(e))&&t.limitType===e.limitType}function ym(t){return`${Jc(Tn(t))}|lt:${t.limitType}`}function ls(t){return`Query(target=${function(n){let r=n.path.canonicalString();return n.collectionGroup!==null&&(r+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(r+=`, filters: [${n.filters.map(s=>mm(s)).join(", ")}]`),Aa(n.limit)||(r+=", limit: "+n.limit),n.orderBy.length>0&&(r+=`, orderBy: [${n.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),n.startAt&&(r+=", startAt: ",r+=n.startAt.inclusive?"b:":"a:",r+=n.startAt.position.map(s=>xs(s)).join(",")),n.endAt&&(r+=", endAt: ",r+=n.endAt.inclusive?"a:":"b:",r+=n.endAt.position.map(s=>xs(s)).join(",")),`Target(${r})`}(Tn(t))}; limitType=${t.limitType})`}function Sa(t,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):ce.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(t,e)&&function(r,s){for(const i of mi(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(t,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(t,e)&&function(r,s){return!(r.startAt&&!function(a,l,c){const h=Ad(a,l,c);return a.inclusive?h<=0:h<0}(r.startAt,mi(r),s)||r.endAt&&!function(a,l,c){const h=Ad(a,l,c);return a.inclusive?h>=0:h>0}(r.endAt,mi(r),s))}(t,e)}function hb(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function vm(t){return(e,n)=>{let r=!1;for(const s of mi(t)){const i=db(s,e,n);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function db(t,e,n){const r=t.field.isKeyField()?ce.comparator(e.key,n.key):function(i,a,l){const c=a.data.field(i),h=l.data.field(i);return c!==null&&h!==null?Cs(c,h):_e()}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return _e()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ls{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,n){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,n]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,n]);s.push([e,n]),this.innerSize++}delete(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[n]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Qr(this.inner,(n,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return lm(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fb=new st(ce.comparator);function Qn(){return fb}const wm=new st(ce.comparator);function ni(...t){let e=wm;for(const n of t)e=e.insert(n.key,n);return e}function Em(t){let e=wm;return t.forEach((n,r)=>e=e.insert(n,r.overlayedDocument)),e}function Ur(){return gi()}function bm(){return gi()}function gi(){return new Ls(t=>t.toString(),(t,e)=>t.isEqual(e))}const pb=new st(ce.comparator),mb=new Pt(ce.comparator);function ke(...t){let e=mb;for(const n of t)e=e.add(n);return e}const gb=new Pt(Ue);function _b(){return gb}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zc(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Yo(e)?"-0":e}}function Tm(t){return{integerValue:""+t}}function yb(t,e){return GE(e)?Tm(e):Zc(t,e)}/**
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
 */class Pa{constructor(){this._=void 0}}function vb(t,e,n){return t instanceof Ni?function(s,i){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Wc(i)&&(i=Gc(i)),i&&(a.fields.__previous_value__=i),{mapValue:a}}(n,e):t instanceof Vi?Am(t,e):t instanceof Oi?Rm(t,e):function(s,i){const a=Im(s,i),l=Cd(a)+Cd(s.Pe);return sc(a)&&sc(s.Pe)?Tm(l):Zc(s.serializer,l)}(t,e)}function wb(t,e,n){return t instanceof Vi?Am(t,e):t instanceof Oi?Rm(t,e):n}function Im(t,e){return t instanceof Zo?function(r){return sc(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class Ni extends Pa{}class Vi extends Pa{constructor(e){super(),this.elements=e}}function Am(t,e){const n=Sm(e);for(const r of t.elements)n.some(s=>Pn(s,r))||n.push(r);return{arrayValue:{values:n}}}class Oi extends Pa{constructor(e){super(),this.elements=e}}function Rm(t,e){let n=Sm(e);for(const r of t.elements)n=n.filter(s=>!Pn(s,r));return{arrayValue:{values:n}}}class Zo extends Pa{constructor(e,n){super(),this.serializer=e,this.Pe=n}}function Cd(t){return ct(t.integerValue||t.doubleValue)}function Sm(t){return Qc(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Eb{constructor(e,n){this.field=e,this.transform=n}}function bb(t,e){return t.field.isEqual(e.field)&&function(r,s){return r instanceof Vi&&s instanceof Vi||r instanceof Oi&&s instanceof Oi?Ps(r.elements,s.elements,Pn):r instanceof Zo&&s instanceof Zo?Pn(r.Pe,s.Pe):r instanceof Ni&&s instanceof Ni}(t.transform,e.transform)}class Tb{constructor(e,n){this.version=e,this.transformResults=n}}class Zt{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new Zt}static exists(e){return new Zt(void 0,e)}static updateTime(e){return new Zt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function Vo(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}class Ca{}function Pm(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new xa(t.key,Zt.none()):new zi(t.key,t.data,Zt.none());{const n=t.data,r=Xt.empty();let s=new Pt(Rt.comparator);for(let i of e.fields)if(!s.has(i)){let a=n.field(i);a===null&&i.length>1&&(i=i.popLast(),a=n.field(i)),a===null?r.delete(i):r.set(i,a),s=s.add(i)}return new Pr(t.key,r,new an(s.toArray()),Zt.none())}}function Ib(t,e,n){t instanceof zi?function(s,i,a){const l=s.value.clone(),c=kd(s.fieldTransforms,i,a.transformResults);l.setAll(c),i.convertToFoundDocument(a.version,l).setHasCommittedMutations()}(t,e,n):t instanceof Pr?function(s,i,a){if(!Vo(s.precondition,i))return void i.convertToUnknownDocument(a.version);const l=kd(s.fieldTransforms,i,a.transformResults),c=i.data;c.setAll(Cm(s)),c.setAll(l),i.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(t,e,n):function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,n)}function _i(t,e,n,r){return t instanceof zi?function(i,a,l,c){if(!Vo(i.precondition,a))return l;const h=i.value.clone(),d=Dd(i.fieldTransforms,c,a);return h.setAll(d),a.convertToFoundDocument(a.version,h).setHasLocalMutations(),null}(t,e,n,r):t instanceof Pr?function(i,a,l,c){if(!Vo(i.precondition,a))return l;const h=Dd(i.fieldTransforms,c,a),d=a.data;return d.setAll(Cm(i)),d.setAll(h),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),l===null?null:l.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(p=>p.field))}(t,e,n,r):function(i,a,l){return Vo(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):l}(t,e,n)}function Ab(t,e){let n=null;for(const r of t.fieldTransforms){const s=e.data.field(r.field),i=Im(r.transform,s||null);i!=null&&(n===null&&(n=Xt.empty()),n.set(r.field,i))}return n||null}function xd(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&Ps(r,s,(i,a)=>bb(i,a))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class zi extends Ca{constructor(e,n,r,s=[]){super(),this.key=e,this.value=n,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Pr extends Ca{constructor(e,n,r,s,i=[]){super(),this.key=e,this.data=n,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Cm(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function kd(t,e,n){const r=new Map;He(t.length===n.length);for(let s=0;s<n.length;s++){const i=t[s],a=i.transform,l=e.data.field(i.field);r.set(i.field,wb(a,l,n[s]))}return r}function Dd(t,e,n){const r=new Map;for(const s of t){const i=s.transform,a=n.data.field(s.field);r.set(s.field,vb(i,a,e))}return r}class xa extends Ca{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class Rb extends Ca{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sb{constructor(e,n,r,s){this.batchId=e,this.localWriteTime=n,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,n){const r=n.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&Ib(i,e,r[s])}}applyToLocalView(e,n){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(n=_i(r,e,n,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(n=_i(r,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){const r=bm();return this.mutations.forEach(s=>{const i=e.get(s.key),a=i.overlayedDocument;let l=this.applyToLocalView(a,i.mutatedFields);l=n.has(s.key)?null:l;const c=Pm(a,l);c!==null&&r.set(s.key,c),a.isValidDocument()||a.convertToNoDocument(be.min())}),r}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),ke())}isEqual(e){return this.batchId===e.batchId&&Ps(this.mutations,e.mutations,(n,r)=>xd(n,r))&&Ps(this.baseMutations,e.baseMutations,(n,r)=>xd(n,r))}}class eu{constructor(e,n,r,s){this.batch=e,this.commitVersion=n,this.mutationResults=r,this.docVersions=s}static from(e,n,r){He(e.mutations.length===r.length);let s=function(){return pb}();const i=e.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,r[a].version);return new eu(e,n,r,s)}}/**
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
 */class Pb{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class Cb{constructor(e,n){this.count=e,this.unchangedNames=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var dt,Ve;function xb(t){switch(t){default:return _e();case F.CANCELLED:case F.UNKNOWN:case F.DEADLINE_EXCEEDED:case F.RESOURCE_EXHAUSTED:case F.INTERNAL:case F.UNAVAILABLE:case F.UNAUTHENTICATED:return!1;case F.INVALID_ARGUMENT:case F.NOT_FOUND:case F.ALREADY_EXISTS:case F.PERMISSION_DENIED:case F.FAILED_PRECONDITION:case F.ABORTED:case F.OUT_OF_RANGE:case F.UNIMPLEMENTED:case F.DATA_LOSS:return!0}}function xm(t){if(t===void 0)return Gn("GRPC error has no .code"),F.UNKNOWN;switch(t){case dt.OK:return F.OK;case dt.CANCELLED:return F.CANCELLED;case dt.UNKNOWN:return F.UNKNOWN;case dt.DEADLINE_EXCEEDED:return F.DEADLINE_EXCEEDED;case dt.RESOURCE_EXHAUSTED:return F.RESOURCE_EXHAUSTED;case dt.INTERNAL:return F.INTERNAL;case dt.UNAVAILABLE:return F.UNAVAILABLE;case dt.UNAUTHENTICATED:return F.UNAUTHENTICATED;case dt.INVALID_ARGUMENT:return F.INVALID_ARGUMENT;case dt.NOT_FOUND:return F.NOT_FOUND;case dt.ALREADY_EXISTS:return F.ALREADY_EXISTS;case dt.PERMISSION_DENIED:return F.PERMISSION_DENIED;case dt.FAILED_PRECONDITION:return F.FAILED_PRECONDITION;case dt.ABORTED:return F.ABORTED;case dt.OUT_OF_RANGE:return F.OUT_OF_RANGE;case dt.UNIMPLEMENTED:return F.UNIMPLEMENTED;case dt.DATA_LOSS:return F.DATA_LOSS;default:return _e()}}(Ve=dt||(dt={}))[Ve.OK=0]="OK",Ve[Ve.CANCELLED=1]="CANCELLED",Ve[Ve.UNKNOWN=2]="UNKNOWN",Ve[Ve.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Ve[Ve.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Ve[Ve.NOT_FOUND=5]="NOT_FOUND",Ve[Ve.ALREADY_EXISTS=6]="ALREADY_EXISTS",Ve[Ve.PERMISSION_DENIED=7]="PERMISSION_DENIED",Ve[Ve.UNAUTHENTICATED=16]="UNAUTHENTICATED",Ve[Ve.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Ve[Ve.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Ve[Ve.ABORTED=10]="ABORTED",Ve[Ve.OUT_OF_RANGE=11]="OUT_OF_RANGE",Ve[Ve.UNIMPLEMENTED=12]="UNIMPLEMENTED",Ve[Ve.INTERNAL=13]="INTERNAL",Ve[Ve.UNAVAILABLE=14]="UNAVAILABLE",Ve[Ve.DATA_LOSS=15]="DATA_LOSS";/**
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
 */function kb(){return new TextEncoder}/**
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
 */const Db=new Br([4294967295,4294967295],0);function Nd(t){const e=kb().encode(t),n=new em;return n.update(e),new Uint8Array(n.digest())}function Vd(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Br([n,r],0),new Br([s,i],0)]}class tu{constructor(e,n,r){if(this.bitmap=e,this.padding=n,this.hashCount=r,n<0||n>=8)throw new ri(`Invalid padding: ${n}`);if(r<0)throw new ri(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new ri(`Invalid hash count: ${r}`);if(e.length===0&&n!==0)throw new ri(`Invalid padding when bitmap length is 0: ${n}`);this.Ie=8*e.length-n,this.Te=Br.fromNumber(this.Ie)}Ee(e,n,r){let s=e.add(n.multiply(Br.fromNumber(r)));return s.compare(Db)===1&&(s=new Br([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const n=Nd(e),[r,s]=Vd(n);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);if(!this.de(a))return!1}return!0}static create(e,n,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new tu(i,s,n);return r.forEach(l=>a.insert(l)),a}insert(e){if(this.Ie===0)return;const n=Nd(e),[r,s]=Vd(n);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);this.Ae(a)}}Ae(e){const n=Math.floor(e/8),r=e%8;this.bitmap[n]|=1<<r}}class ri extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ka{constructor(e,n,r,s,i){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,n,r){const s=new Map;return s.set(e,Hi.createSynthesizedTargetChangeForCurrentChange(e,n,r)),new ka(be.min(),s,new st(Ue),Qn(),ke())}}class Hi{constructor(e,n,r,s,i){this.resumeToken=e,this.current=n,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,n,r){return new Hi(r,n,ke(),ke(),ke())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oo{constructor(e,n,r,s){this.Re=e,this.removedTargetIds=n,this.key=r,this.Ve=s}}class km{constructor(e,n){this.targetId=e,this.me=n}}class Dm{constructor(e,n,r=Ct.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=n,this.resumeToken=r,this.cause=s}}class Od{constructor(){this.fe=0,this.ge=Ld(),this.pe=Ct.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=ke(),n=ke(),r=ke();return this.ge.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:n=n.add(s);break;case 1:r=r.add(s);break;default:_e()}}),new Hi(this.pe,this.ye,e,n,r)}Ce(){this.we=!1,this.ge=Ld()}Fe(e,n){this.we=!0,this.ge=this.ge.insert(e,n)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,He(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class Nb{constructor(e){this.Le=e,this.Be=new Map,this.ke=Qn(),this.qe=Md(),this.Qe=new st(Ue)}Ke(e){for(const n of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(n,e.Ve):this.Ue(n,e.key,e.Ve);for(const n of e.removedTargetIds)this.Ue(n,e.key,e.Ve)}We(e){this.forEachTarget(e,n=>{const r=this.Ge(n);switch(e.state){case 0:this.ze(n)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(n);break;case 3:this.ze(n)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(n)&&(this.je(n),r.De(e.resumeToken));break;default:_e()}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.Be.forEach((r,s)=>{this.ze(s)&&n(s)})}He(e){const n=e.targetId,r=e.me.count,s=this.Je(n);if(s){const i=s.target;if(oc(i))if(r===0){const a=new ce(i.path);this.Ue(n,a,Mt.newNoDocument(a,be.min()))}else He(r===1);else{const a=this.Ye(n);if(a!==r){const l=this.Ze(e),c=l?this.Xe(l,e,a):1;if(c!==0){this.je(n);const h=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(n,h)}}}}}Ze(e){const n=e.me.unchangedNames;if(!n||!n.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=n;let a,l;try{a=zr(r).toUint8Array()}catch(c){if(c instanceof cm)return Ss("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{l=new tu(a,s,i)}catch(c){return Ss(c instanceof ri?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return l.Ie===0?null:l}Xe(e,n,r){return n.me.count===r-this.nt(e,n.targetId)?0:2}nt(e,n){const r=this.Le.getRemoteKeysForTarget(n);let s=0;return r.forEach(i=>{const a=this.Le.tt(),l=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(l)||(this.Ue(n,i,null),s++)}),s}rt(e){const n=new Map;this.Be.forEach((i,a)=>{const l=this.Je(a);if(l){if(i.current&&oc(l.target)){const c=new ce(l.target.path);this.ke.get(c)!==null||this.it(a,c)||this.Ue(a,c,Mt.newNoDocument(c,e))}i.be&&(n.set(a,i.ve()),i.Ce())}});let r=ke();this.qe.forEach((i,a)=>{let l=!0;a.forEachWhile(c=>{const h=this.Je(c);return!h||h.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(i))}),this.ke.forEach((i,a)=>a.setReadTime(e));const s=new ka(e,n,this.Qe,this.ke,r);return this.ke=Qn(),this.qe=Md(),this.Qe=new st(Ue),s}$e(e,n){if(!this.ze(e))return;const r=this.it(e,n.key)?2:0;this.Ge(e).Fe(n.key,r),this.ke=this.ke.insert(n.key,n),this.qe=this.qe.insert(n.key,this.st(n.key).add(e))}Ue(e,n,r){if(!this.ze(e))return;const s=this.Ge(e);this.it(e,n)?s.Fe(n,1):s.Me(n),this.qe=this.qe.insert(n,this.st(n).delete(e)),r&&(this.ke=this.ke.insert(n,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const n=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let n=this.Be.get(e);return n||(n=new Od,this.Be.set(e,n)),n}st(e){let n=this.qe.get(e);return n||(n=new Pt(Ue),this.qe=this.qe.insert(e,n)),n}ze(e){const n=this.Je(e)!==null;return n||se("WatchChangeAggregator","Detected inactive target",e),n}Je(e){const n=this.Be.get(e);return n&&n.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new Od),this.Le.getRemoteKeysForTarget(e).forEach(n=>{this.Ue(e,n,null)})}it(e,n){return this.Le.getRemoteKeysForTarget(e).has(n)}}function Md(){return new st(ce.comparator)}function Ld(){return new st(ce.comparator)}const Vb=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),Ob=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),Mb=(()=>({and:"AND",or:"OR"}))();class Lb{constructor(e,n){this.databaseId=e,this.useProto3Json=n}}function cc(t,e){return t.useProto3Json||Aa(e)?e:{value:e}}function ea(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Nm(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function Fb(t,e){return ea(t,e.toTimestamp())}function In(t){return He(!!t),be.fromTimestamp(function(n){const r=Tr(n);return new _t(r.seconds,r.nanos)}(t))}function nu(t,e){return uc(t,e).canonicalString()}function uc(t,e){const n=function(s){return new Ze(["projects",s.projectId,"databases",s.database])}(t).child("documents");return e===void 0?n:n.child(e)}function Vm(t){const e=Ze.fromString(t);return He(Um(e)),e}function hc(t,e){return nu(t.databaseId,e.path)}function Pl(t,e){const n=Vm(e);if(n.get(1)!==t.databaseId.projectId)throw new te(F.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new te(F.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new ce(Mm(n))}function Om(t,e){return nu(t.databaseId,e)}function Ub(t){const e=Vm(t);return e.length===4?Ze.emptyPath():Mm(e)}function dc(t){return new Ze(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function Mm(t){return He(t.length>4&&t.get(4)==="documents"),t.popFirst(5)}function Fd(t,e,n){return{name:hc(t,e),fields:n.value.mapValue.fields}}function jb(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:_e()}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(h,d){return h.useProto3Json?(He(d===void 0||typeof d=="string"),Ct.fromBase64String(d||"")):(He(d===void 0||d instanceof Buffer||d instanceof Uint8Array),Ct.fromUint8Array(d||new Uint8Array))}(t,e.targetChange.resumeToken),a=e.targetChange.cause,l=a&&function(h){const d=h.code===void 0?F.UNKNOWN:xm(h.code);return new te(d,h.message||"")}(a);n=new Dm(r,s,i,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Pl(t,r.document.name),i=In(r.document.updateTime),a=r.document.createTime?In(r.document.createTime):be.min(),l=new Xt({mapValue:{fields:r.document.fields}}),c=Mt.newFoundDocument(s,i,a,l),h=r.targetIds||[],d=r.removedTargetIds||[];n=new Oo(h,d,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Pl(t,r.document),i=r.readTime?In(r.readTime):be.min(),a=Mt.newNoDocument(s,i),l=r.removedTargetIds||[];n=new Oo([],l,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Pl(t,r.document),i=r.removedTargetIds||[];n=new Oo([],i,s,null)}else{if(!("filter"in e))return _e();{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,a=new Cb(s,i),l=r.targetId;n=new km(l,a)}}return n}function Bb(t,e){let n;if(e instanceof zi)n={update:Fd(t,e.key,e.value)};else if(e instanceof xa)n={delete:hc(t,e.key)};else if(e instanceof Pr)n={update:Fd(t,e.key,e.data),updateMask:Jb(e.fieldMask)};else{if(!(e instanceof Rb))return _e();n={verify:hc(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(r=>function(i,a){const l=a.transform;if(l instanceof Ni)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof Vi)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof Oi)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof Zo)return{fieldPath:a.field.canonicalString(),increment:l.Pe};throw _e()}(0,r))),e.precondition.isNone||(n.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:Fb(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:_e()}(t,e.precondition)),n}function $b(t,e){return t&&t.length>0?(He(e!==void 0),t.map(n=>function(s,i){let a=s.updateTime?In(s.updateTime):In(i);return a.isEqual(be.min())&&(a=In(i)),new Tb(a,s.transformResults||[])}(n,e))):[]}function qb(t,e){return{documents:[Om(t,e.path)]}}function zb(t,e){const n={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=Om(t,s);const i=function(h){if(h.length!==0)return Fm(gn.create(h,"and"))}(e.filters);i&&(n.structuredQuery.where=i);const a=function(h){if(h.length!==0)return h.map(d=>function(g){return{field:cs(g.field),direction:Wb(g.dir)}}(d))}(e.orderBy);a&&(n.structuredQuery.orderBy=a);const l=cc(t,e.limit);return l!==null&&(n.structuredQuery.limit=l),e.startAt&&(n.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{_t:n,parent:s}}function Hb(t){let e=Ub(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let s=null;if(r>0){He(r===1);const d=n.from[0];d.allDescendants?s=d.collectionId:e=e.child(d.collectionId)}let i=[];n.where&&(i=function(p){const g=Lm(p);return g instanceof gn&&fm(g)?g.getFilters():[g]}(n.where));let a=[];n.orderBy&&(a=function(p){return p.map(g=>function(k){return new Di(us(k.field),function(M){switch(M){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(k.direction))}(g))}(n.orderBy));let l=null;n.limit&&(l=function(p){let g;return g=typeof p=="object"?p.value:p,Aa(g)?null:g}(n.limit));let c=null;n.startAt&&(c=function(p){const g=!!p.before,y=p.values||[];return new Xo(y,g)}(n.startAt));let h=null;return n.endAt&&(h=function(p){const g=!p.before,y=p.values||[];return new Xo(y,g)}(n.endAt)),cb(e,s,a,i,l,"F",c,h)}function Kb(t,e){const n=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return _e()}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function Lm(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":const r=us(n.unaryFilter.field);return ft.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=us(n.unaryFilter.field);return ft.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=us(n.unaryFilter.field);return ft.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=us(n.unaryFilter.field);return ft.create(a,"!=",{nullValue:"NULL_VALUE"});default:return _e()}}(t):t.fieldFilter!==void 0?function(n){return ft.create(us(n.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return _e()}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return gn.create(n.compositeFilter.filters.map(r=>Lm(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return _e()}}(n.compositeFilter.op))}(t):_e()}function Wb(t){return Vb[t]}function Gb(t){return Ob[t]}function Qb(t){return Mb[t]}function cs(t){return{fieldPath:t.canonicalString()}}function us(t){return Rt.fromServerFormat(t.fieldPath)}function Fm(t){return t instanceof ft?function(n){if(n.op==="=="){if(Id(n.value))return{unaryFilter:{field:cs(n.field),op:"IS_NAN"}};if(Td(n.value))return{unaryFilter:{field:cs(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(Id(n.value))return{unaryFilter:{field:cs(n.field),op:"IS_NOT_NAN"}};if(Td(n.value))return{unaryFilter:{field:cs(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:cs(n.field),op:Gb(n.op),value:n.value}}}(t):t instanceof gn?function(n){const r=n.getFilters().map(s=>Fm(s));return r.length===1?r[0]:{compositeFilter:{op:Qb(n.op),filters:r}}}(t):_e()}function Jb(t){const e=[];return t.fields.forEach(n=>e.push(n.canonicalString())),{fieldPaths:e}}function Um(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fr{constructor(e,n,r,s,i=be.min(),a=be.min(),l=Ct.EMPTY_BYTE_STRING,c=null){this.target=e,this.targetId=n,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=l,this.expectedCount=c}withSequenceNumber(e){return new fr(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new fr(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new fr(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new fr(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yb{constructor(e){this.ct=e}}function Xb(t){const e=Hb({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?lc(e,e.limit,"L"):e}/**
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
 */class Zb{constructor(){this.un=new eT}addToCollectionParentIndex(e,n){return this.un.add(n),B.resolve()}getCollectionParents(e,n){return B.resolve(this.un.getEntries(n))}addFieldIndex(e,n){return B.resolve()}deleteFieldIndex(e,n){return B.resolve()}deleteAllFieldIndexes(e){return B.resolve()}createTargetIndexes(e,n){return B.resolve()}getDocumentsMatchingTarget(e,n){return B.resolve(null)}getIndexType(e,n){return B.resolve(0)}getFieldIndexes(e,n){return B.resolve([])}getNextCollectionGroupToUpdate(e){return B.resolve(null)}getMinOffset(e,n){return B.resolve(br.min())}getMinOffsetFromCollectionGroup(e,n){return B.resolve(br.min())}updateCollectionGroup(e,n,r){return B.resolve()}updateIndexEntries(e,n){return B.resolve()}}class eT{constructor(){this.index={}}add(e){const n=e.lastSegment(),r=e.popLast(),s=this.index[n]||new Pt(Ze.comparator),i=!s.has(r);return this.index[n]=s.add(r),i}has(e){const n=e.lastSegment(),r=e.popLast(),s=this.index[n];return s&&s.has(r)}getEntries(e){return(this.index[e]||new Pt(Ze.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ks{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new ks(0)}static kn(){return new ks(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tT{constructor(){this.changes=new Ls(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,Mt.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();const r=this.changes.get(n);return r!==void 0?B.resolve(r):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class nT{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rT{constructor(e,n,r,s){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,n){let r=null;return this.documentOverlayCache.getOverlay(e,n).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,n))).next(s=>(r!==null&&_i(r.mutation,s,an.empty(),_t.now()),s))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.getLocalViewOfDocuments(e,r,ke()).next(()=>r))}getLocalViewOfDocuments(e,n,r=ke()){const s=Ur();return this.populateOverlays(e,s,n).next(()=>this.computeViews(e,n,s,r).next(i=>{let a=ni();return i.forEach((l,c)=>{a=a.insert(l,c.overlayedDocument)}),a}))}getOverlayedDocuments(e,n){const r=Ur();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,ke()))}populateOverlays(e,n,r){const s=[];return r.forEach(i=>{n.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((a,l)=>{n.set(a,l)})})}computeViews(e,n,r,s){let i=Qn();const a=gi(),l=function(){return gi()}();return n.forEach((c,h)=>{const d=r.get(h.key);s.has(h.key)&&(d===void 0||d.mutation instanceof Pr)?i=i.insert(h.key,h):d!==void 0?(a.set(h.key,d.mutation.getFieldMask()),_i(d.mutation,h,d.mutation.getFieldMask(),_t.now())):a.set(h.key,an.empty())}),this.recalculateAndSaveOverlays(e,i).next(c=>(c.forEach((h,d)=>a.set(h,d)),n.forEach((h,d)=>{var p;return l.set(h,new nT(d,(p=a.get(h))!==null&&p!==void 0?p:null))}),l))}recalculateAndSaveOverlays(e,n){const r=gi();let s=new st((a,l)=>a-l),i=ke();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(a=>{for(const l of a)l.keys().forEach(c=>{const h=n.get(c);if(h===null)return;let d=r.get(c)||an.empty();d=l.applyToLocalView(h,d),r.set(c,d);const p=(s.get(l.batchId)||ke()).add(c);s=s.insert(l.batchId,p)})}).next(()=>{const a=[],l=s.getReverseIterator();for(;l.hasNext();){const c=l.getNext(),h=c.key,d=c.value,p=bm();d.forEach(g=>{if(!i.has(g)){const y=Pm(n.get(g),r.get(g));y!==null&&p.set(g,y),i=i.add(g)}}),a.push(this.documentOverlayCache.saveOverlays(e,h,p))}return B.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,n,r,s){return function(a){return ce.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):_m(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,r,s):this.getDocumentsMatchingCollectionQuery(e,n,r,s)}getNextDocuments(e,n,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,r,s).next(i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,r.largestBatchId,s-i.size):B.resolve(Ur());let l=-1,c=i;return a.next(h=>B.forEach(h,(d,p)=>(l<p.largestBatchId&&(l=p.largestBatchId),i.get(d)?B.resolve():this.remoteDocumentCache.getEntry(e,d).next(g=>{c=c.insert(d,g)}))).next(()=>this.populateOverlays(e,h,i)).next(()=>this.computeViews(e,c,h,ke())).next(d=>({batchId:l,changes:Em(d)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new ce(n)).next(r=>{let s=ni();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,n,r,s){const i=n.collectionGroup;let a=ni();return this.indexManager.getCollectionParents(e,i).next(l=>B.forEach(l,c=>{const h=function(p,g){return new Ms(g,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(n,c.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,r,s).next(d=>{d.forEach((p,g)=>{a=a.insert(p,g)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,n,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,r.largestBatchId).next(a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,r,i,s))).next(a=>{i.forEach((c,h)=>{const d=h.getKey();a.get(d)===null&&(a=a.insert(d,Mt.newInvalidDocument(d)))});let l=ni();return a.forEach((c,h)=>{const d=i.get(c);d!==void 0&&_i(d.mutation,h,an.empty(),_t.now()),Sa(n,h)&&(l=l.insert(c,h))}),l})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sT{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,n){return B.resolve(this.hr.get(n))}saveBundleMetadata(e,n){return this.hr.set(n.id,function(s){return{id:s.id,version:s.version,createTime:In(s.createTime)}}(n)),B.resolve()}getNamedQuery(e,n){return B.resolve(this.Pr.get(n))}saveNamedQuery(e,n){return this.Pr.set(n.name,function(s){return{name:s.name,query:Xb(s.bundledQuery),readTime:In(s.readTime)}}(n)),B.resolve()}}/**
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
 */class iT{constructor(){this.overlays=new st(ce.comparator),this.Ir=new Map}getOverlay(e,n){return B.resolve(this.overlays.get(n))}getOverlays(e,n){const r=Ur();return B.forEach(n,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,n,r){return r.forEach((s,i)=>{this.ht(e,n,i)}),B.resolve()}removeOverlaysForBatchId(e,n,r){const s=this.Ir.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(r)),B.resolve()}getOverlaysForCollection(e,n,r){const s=Ur(),i=n.length+1,a=new ce(n.child("")),l=this.overlays.getIteratorFrom(a);for(;l.hasNext();){const c=l.getNext().value,h=c.getKey();if(!n.isPrefixOf(h.path))break;h.path.length===i&&c.largestBatchId>r&&s.set(c.getKey(),c)}return B.resolve(s)}getOverlaysForCollectionGroup(e,n,r,s){let i=new st((h,d)=>h-d);const a=this.overlays.getIterator();for(;a.hasNext();){const h=a.getNext().value;if(h.getKey().getCollectionGroup()===n&&h.largestBatchId>r){let d=i.get(h.largestBatchId);d===null&&(d=Ur(),i=i.insert(h.largestBatchId,d)),d.set(h.getKey(),h)}}const l=Ur(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((h,d)=>l.set(h,d)),!(l.size()>=s)););return B.resolve(l)}ht(e,n,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.Ir.get(s.largestBatchId).delete(r.key);this.Ir.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new Pb(n,r));let i=this.Ir.get(n);i===void 0&&(i=ke(),this.Ir.set(n,i)),this.Ir.set(n,i.add(r.key))}}/**
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
 */class oT{constructor(){this.sessionToken=Ct.EMPTY_BYTE_STRING}getSessionToken(e){return B.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,B.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ru{constructor(){this.Tr=new Pt(yt.Er),this.dr=new Pt(yt.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,n){const r=new yt(e,n);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,n){e.forEach(r=>this.addReference(r,n))}removeReference(e,n){this.Vr(new yt(e,n))}mr(e,n){e.forEach(r=>this.removeReference(r,n))}gr(e){const n=new ce(new Ze([])),r=new yt(n,e),s=new yt(n,e+1),i=[];return this.dr.forEachInRange([r,s],a=>{this.Vr(a),i.push(a.key)}),i}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const n=new ce(new Ze([])),r=new yt(n,e),s=new yt(n,e+1);let i=ke();return this.dr.forEachInRange([r,s],a=>{i=i.add(a.key)}),i}containsKey(e){const n=new yt(e,0),r=this.Tr.firstAfterOrEqual(n);return r!==null&&e.isEqual(r.key)}}class yt{constructor(e,n){this.key=e,this.wr=n}static Er(e,n){return ce.comparator(e.key,n.key)||Ue(e.wr,n.wr)}static Ar(e,n){return Ue(e.wr,n.wr)||ce.comparator(e.key,n.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aT{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Sr=1,this.br=new Pt(yt.Er)}checkEmpty(e){return B.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,r,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new Sb(i,n,r,s);this.mutationQueue.push(a);for(const l of s)this.br=this.br.add(new yt(l.key,i)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return B.resolve(a)}lookupMutationBatch(e,n){return B.resolve(this.Dr(n))}getNextMutationBatchAfterBatchId(e,n){const r=n+1,s=this.vr(r),i=s<0?0:s;return B.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return B.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return B.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){const r=new yt(n,0),s=new yt(n,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([r,s],a=>{const l=this.Dr(a.wr);i.push(l)}),B.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,n){let r=new Pt(Ue);return n.forEach(s=>{const i=new yt(s,0),a=new yt(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,a],l=>{r=r.add(l.wr)})}),B.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,n){const r=n.path,s=r.length+1;let i=r;ce.isDocumentKey(i)||(i=i.child(""));const a=new yt(new ce(i),0);let l=new Pt(Ue);return this.br.forEachWhile(c=>{const h=c.key.path;return!!r.isPrefixOf(h)&&(h.length===s&&(l=l.add(c.wr)),!0)},a),B.resolve(this.Cr(l))}Cr(e){const n=[];return e.forEach(r=>{const s=this.Dr(r);s!==null&&n.push(s)}),n}removeMutationBatch(e,n){He(this.Fr(n.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return B.forEach(n.mutations,s=>{const i=new yt(s.key,n.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,n){const r=new yt(n,0),s=this.br.firstAfterOrEqual(r);return B.resolve(n.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,B.resolve()}Fr(e,n){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const n=this.vr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lT{constructor(e){this.Mr=e,this.docs=function(){return new st(ce.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){const r=n.key,s=this.docs.get(r),i=s?s.size:0,a=this.Mr(n);return this.docs=this.docs.insert(r,{document:n.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){const r=this.docs.get(n);return B.resolve(r?r.document.mutableCopy():Mt.newInvalidDocument(n))}getEntries(e,n){let r=Qn();return n.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():Mt.newInvalidDocument(s))}),B.resolve(r)}getDocumentsMatchingQuery(e,n,r,s){let i=Qn();const a=n.path,l=new ce(a.child("")),c=this.docs.getIteratorFrom(l);for(;c.hasNext();){const{key:h,value:{document:d}}=c.getNext();if(!a.isPrefixOf(h.path))break;h.path.length>a.length+1||zE(qE(d),r)<=0||(s.has(d.key)||Sa(n,d))&&(i=i.insert(d.key,d.mutableCopy()))}return B.resolve(i)}getAllFromCollectionGroup(e,n,r,s){_e()}Or(e,n){return B.forEach(this.docs,r=>n(r))}newChangeBuffer(e){return new cT(this)}getSize(e){return B.resolve(this.size)}}class cT extends tT{constructor(e){super(),this.cr=e}applyChanges(e){const n=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?n.push(this.cr.addEntry(e,s)):this.cr.removeEntry(r)}),B.waitFor(n)}getFromCache(e,n){return this.cr.getEntry(e,n)}getAllFromCache(e,n){return this.cr.getEntries(e,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uT{constructor(e){this.persistence=e,this.Nr=new Ls(n=>Jc(n),Yc),this.lastRemoteSnapshotVersion=be.min(),this.highestTargetId=0,this.Lr=0,this.Br=new ru,this.targetCount=0,this.kr=ks.Bn()}forEachTarget(e,n){return this.Nr.forEach((r,s)=>n(s)),B.resolve()}getLastRemoteSnapshotVersion(e){return B.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return B.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),B.resolve(this.highestTargetId)}setTargetsMetadata(e,n,r){return r&&(this.lastRemoteSnapshotVersion=r),n>this.Lr&&(this.Lr=n),B.resolve()}Kn(e){this.Nr.set(e.target,e);const n=e.targetId;n>this.highestTargetId&&(this.kr=new ks(n),this.highestTargetId=n),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,n){return this.Kn(n),this.targetCount+=1,B.resolve()}updateTargetData(e,n){return this.Kn(n),B.resolve()}removeTargetData(e,n){return this.Nr.delete(n.target),this.Br.gr(n.targetId),this.targetCount-=1,B.resolve()}removeTargets(e,n,r){let s=0;const i=[];return this.Nr.forEach((a,l)=>{l.sequenceNumber<=n&&r.get(l.targetId)===null&&(this.Nr.delete(a),i.push(this.removeMatchingKeysForTargetId(e,l.targetId)),s++)}),B.waitFor(i).next(()=>s)}getTargetCount(e){return B.resolve(this.targetCount)}getTargetData(e,n){const r=this.Nr.get(n)||null;return B.resolve(r)}addMatchingKeys(e,n,r){return this.Br.Rr(n,r),B.resolve()}removeMatchingKeys(e,n,r){this.Br.mr(n,r);const s=this.persistence.referenceDelegate,i=[];return s&&n.forEach(a=>{i.push(s.markPotentiallyOrphaned(e,a))}),B.waitFor(i)}removeMatchingKeysForTargetId(e,n){return this.Br.gr(n),B.resolve()}getMatchingKeysForTargetId(e,n){const r=this.Br.yr(n);return B.resolve(r)}containsKey(e,n){return B.resolve(this.Br.containsKey(n))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hT{constructor(e,n){this.qr={},this.overlays={},this.Qr=new Kc(0),this.Kr=!1,this.Kr=!0,this.$r=new oT,this.referenceDelegate=e(this),this.Ur=new uT(this),this.indexManager=new Zb,this.remoteDocumentCache=function(s){return new lT(s)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new Yb(n),this.Gr=new sT(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new iT,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let r=this.qr[e.toKey()];return r||(r=new aT(n,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,n,r){se("MemoryPersistence","Starting transaction:",e);const s=new dT(this.Qr.next());return this.referenceDelegate.zr(),r(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(e,n){return B.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,n)))}}class dT extends KE{constructor(e){super(),this.currentSequenceNumber=e}}class su{constructor(e){this.persistence=e,this.Jr=new ru,this.Yr=null}static Zr(e){return new su(e)}get Xr(){if(this.Yr)return this.Yr;throw _e()}addReference(e,n,r){return this.Jr.addReference(r,n),this.Xr.delete(r.toString()),B.resolve()}removeReference(e,n,r){return this.Jr.removeReference(r,n),this.Xr.add(r.toString()),B.resolve()}markPotentiallyOrphaned(e,n){return this.Xr.add(n.toString()),B.resolve()}removeTarget(e,n){this.Jr.gr(n.targetId).forEach(s=>this.Xr.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,n.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>r.removeTargetData(e,n))}zr(){this.Yr=new Set}jr(e){const n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return B.forEach(this.Xr,r=>{const s=ce.fromPath(r);return this.ei(e,s).next(i=>{i||n.removeEntry(s,be.min())})}).next(()=>(this.Yr=null,n.apply(e)))}updateLimboDocument(e,n){return this.ei(e,n).next(r=>{r?this.Xr.delete(n.toString()):this.Xr.add(n.toString())})}Wr(e){return 0}ei(e,n){return B.or([()=>B.resolve(this.Jr.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Hr(e,n)])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iu{constructor(e,n,r,s){this.targetId=e,this.fromCache=n,this.$i=r,this.Ui=s}static Wi(e,n){let r=ke(),s=ke();for(const i of n.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new iu(e,n.fromCache,r,s)}}/**
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
 */class fT{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class pT{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return pw()?8:WE(Ut())>0?6:4}()}initialize(e,n){this.Ji=e,this.indexManager=n,this.Gi=!0}getDocumentsMatchingQuery(e,n,r,s){const i={result:null};return this.Yi(e,n).next(a=>{i.result=a}).next(()=>{if(!i.result)return this.Zi(e,n,s,r).next(a=>{i.result=a})}).next(()=>{if(i.result)return;const a=new fT;return this.Xi(e,n,a).next(l=>{if(i.result=l,this.zi)return this.es(e,n,a,l.size)})}).next(()=>i.result)}es(e,n,r,s){return r.documentReadCount<this.ji?(Zs()<=Ne.DEBUG&&se("QueryEngine","SDK will not create cache indexes for query:",ls(n),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),B.resolve()):(Zs()<=Ne.DEBUG&&se("QueryEngine","Query:",ls(n),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Hi*s?(Zs()<=Ne.DEBUG&&se("QueryEngine","The SDK decides to create cache indexes for query:",ls(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Tn(n))):B.resolve())}Yi(e,n){if(Pd(n))return B.resolve(null);let r=Tn(n);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(n.limit!==null&&s===1&&(n=lc(n,null,"F"),r=Tn(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const a=ke(...i);return this.Ji.getDocuments(e,a).next(l=>this.indexManager.getMinOffset(e,r).next(c=>{const h=this.ts(n,l);return this.ns(n,h,a,c.readTime)?this.Yi(e,lc(n,null,"F")):this.rs(e,h,n,c)}))})))}Zi(e,n,r,s){return Pd(n)||s.isEqual(be.min())?B.resolve(null):this.Ji.getDocuments(e,r).next(i=>{const a=this.ts(n,i);return this.ns(n,a,r,s)?B.resolve(null):(Zs()<=Ne.DEBUG&&se("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),ls(n)),this.rs(e,a,n,$E(s,-1)).next(l=>l))})}ts(e,n){let r=new Pt(vm(e));return n.forEach((s,i)=>{Sa(e,i)&&(r=r.add(i))}),r}ns(e,n,r,s){if(e.limit===null)return!1;if(r.size!==n.size)return!0;const i=e.limitType==="F"?n.last():n.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(e,n,r){return Zs()<=Ne.DEBUG&&se("QueryEngine","Using full collection scan to execute query:",ls(n)),this.Ji.getDocumentsMatchingQuery(e,n,br.min(),r)}rs(e,n,r,s){return this.Ji.getDocumentsMatchingQuery(e,r,s).next(i=>(n.forEach(a=>{i=i.insert(a.key,a)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mT{constructor(e,n,r,s){this.persistence=e,this.ss=n,this.serializer=s,this.os=new st(Ue),this._s=new Ls(i=>Jc(i),Yc),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new rT(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.os))}}function gT(t,e,n,r){return new mT(t,e,n,r)}async function jm(t,e){const n=Te(t);return await n.persistence.runTransaction("Handle user change","readonly",r=>{let s;return n.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,n.ls(e),n.mutationQueue.getAllMutationBatches(r))).next(i=>{const a=[],l=[];let c=ke();for(const h of s){a.push(h.batchId);for(const d of h.mutations)c=c.add(d.key)}for(const h of i){l.push(h.batchId);for(const d of h.mutations)c=c.add(d.key)}return n.localDocuments.getDocuments(r,c).next(h=>({hs:h,removedBatchIds:a,addedBatchIds:l}))})})}function _T(t,e){const n=Te(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=n.cs.newChangeBuffer({trackRemovals:!0});return function(l,c,h,d){const p=h.batch,g=p.keys();let y=B.resolve();return g.forEach(k=>{y=y.next(()=>d.getEntry(c,k)).next(N=>{const M=h.docVersions.get(k);He(M!==null),N.version.compareTo(M)<0&&(p.applyToRemoteDocument(N,h),N.isValidDocument()&&(N.setReadTime(h.commitVersion),d.addEntry(N)))})}),y.next(()=>l.mutationQueue.removeMutationBatch(c,p))}(n,r,e,i).next(()=>i.apply(r)).next(()=>n.mutationQueue.performConsistencyCheck(r)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let c=ke();for(let h=0;h<l.mutationResults.length;++h)l.mutationResults[h].transformResults.length>0&&(c=c.add(l.batch.mutations[h].key));return c}(e))).next(()=>n.localDocuments.getDocuments(r,s))})}function Bm(t){const e=Te(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.Ur.getLastRemoteSnapshotVersion(n))}function yT(t,e){const n=Te(t),r=e.snapshotVersion;let s=n.os;return n.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const a=n.cs.newChangeBuffer({trackRemovals:!0});s=n.os;const l=[];e.targetChanges.forEach((d,p)=>{const g=s.get(p);if(!g)return;l.push(n.Ur.removeMatchingKeys(i,d.removedDocuments,p).next(()=>n.Ur.addMatchingKeys(i,d.addedDocuments,p)));let y=g.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(p)!==null?y=y.withResumeToken(Ct.EMPTY_BYTE_STRING,be.min()).withLastLimboFreeSnapshotVersion(be.min()):d.resumeToken.approximateByteSize()>0&&(y=y.withResumeToken(d.resumeToken,r)),s=s.insert(p,y),function(N,M,H){return N.resumeToken.approximateByteSize()===0||M.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=3e8?!0:H.addedDocuments.size+H.modifiedDocuments.size+H.removedDocuments.size>0}(g,y,d)&&l.push(n.Ur.updateTargetData(i,y))});let c=Qn(),h=ke();if(e.documentUpdates.forEach(d=>{e.resolvedLimboDocuments.has(d)&&l.push(n.persistence.referenceDelegate.updateLimboDocument(i,d))}),l.push(vT(i,a,e.documentUpdates).next(d=>{c=d.Ps,h=d.Is})),!r.isEqual(be.min())){const d=n.Ur.getLastRemoteSnapshotVersion(i).next(p=>n.Ur.setTargetsMetadata(i,i.currentSequenceNumber,r));l.push(d)}return B.waitFor(l).next(()=>a.apply(i)).next(()=>n.localDocuments.getLocalViewOfDocuments(i,c,h)).next(()=>c)}).then(i=>(n.os=s,i))}function vT(t,e,n){let r=ke(),s=ke();return n.forEach(i=>r=r.add(i)),e.getEntries(t,r).next(i=>{let a=Qn();return n.forEach((l,c)=>{const h=i.get(l);c.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(l)),c.isNoDocument()&&c.version.isEqual(be.min())?(e.removeEntry(l,c.readTime),a=a.insert(l,c)):!h.isValidDocument()||c.version.compareTo(h.version)>0||c.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(c),a=a.insert(l,c)):se("LocalStore","Ignoring outdated watch update for ",l,". Current version:",h.version," Watch version:",c.version)}),{Ps:a,Is:s}})}function wT(t,e){const n=Te(t);return n.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),n.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function ET(t,e){const n=Te(t);return n.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return n.Ur.getTargetData(r,e).next(i=>i?(s=i,B.resolve(s)):n.Ur.allocateTargetId(r).next(a=>(s=new fr(e,a,"TargetPurposeListen",r.currentSequenceNumber),n.Ur.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=n.os.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(n.os=n.os.insert(r.targetId,r),n._s.set(e,r.targetId)),r})}async function fc(t,e,n){const r=Te(t),s=r.os.get(e),i=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",i,a=>r.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!qi(a))throw a;se("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}r.os=r.os.remove(e),r._s.delete(s.target)}function Ud(t,e,n){const r=Te(t);let s=be.min(),i=ke();return r.persistence.runTransaction("Execute query","readwrite",a=>function(c,h,d){const p=Te(c),g=p._s.get(d);return g!==void 0?B.resolve(p.os.get(g)):p.Ur.getTargetData(h,d)}(r,a,Tn(e)).next(l=>{if(l)return s=l.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(a,l.targetId).next(c=>{i=c})}).next(()=>r.ss.getDocumentsMatchingQuery(a,e,n?s:be.min(),n?i:ke())).next(l=>(bT(r,hb(e),l),{documents:l,Ts:i})))}function bT(t,e,n){let r=t.us.get(e)||be.min();n.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),t.us.set(e,r)}class jd{constructor(){this.activeTargetIds=_b()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class TT{constructor(){this.so=new jd,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,r){}addLocalQueryTarget(e,n=!0){return n&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,n,r){this.oo[e]=n}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new jd,Promise.resolve()}handleUserChange(e,n,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class IT{_o(e){}shutdown(){}}/**
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
 */class Bd{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){se("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){se("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let To=null;function Cl(){return To===null?To=function(){return 268435456+Math.round(2147483648*Math.random())}():To++,"0x"+To.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const AT={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class RT{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Nt="WebChannelConnection";class ST extends class{constructor(n){this.databaseInfo=n,this.databaseId=n.databaseId;const r=n.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+n.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(n,r,s,i,a){const l=Cl(),c=this.xo(n,r.toUriEncodedString());se("RestConnection",`Sending RPC '${n}' ${l}:`,c,s);const h={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(h,i,a),this.No(n,c,h,s).then(d=>(se("RestConnection",`Received RPC '${n}' ${l}: `,d),d),d=>{throw Ss("RestConnection",`RPC '${n}' ${l} failed with error: `,d,"url: ",c,"request:",s),d})}Lo(n,r,s,i,a,l){return this.Mo(n,r,s,i,a)}Oo(n,r,s){n["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+Os}(),n["Content-Type"]="text/plain",this.databaseInfo.appId&&(n["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((i,a)=>n[a]=i),s&&s.headers.forEach((i,a)=>n[a]=i)}xo(n,r){const s=AT[n];return`${this.Do}/v1/${r}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,n,r,s){const i=Cl();return new Promise((a,l)=>{const c=new tm;c.setWithCredentials(!0),c.listenOnce(nm.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case Do.NO_ERROR:const d=c.getResponseJson();se(Nt,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(d)),a(d);break;case Do.TIMEOUT:se(Nt,`RPC '${e}' ${i} timed out`),l(new te(F.DEADLINE_EXCEEDED,"Request time out"));break;case Do.HTTP_ERROR:const p=c.getStatus();if(se(Nt,`RPC '${e}' ${i} failed with status:`,p,"response text:",c.getResponseText()),p>0){let g=c.getResponseJson();Array.isArray(g)&&(g=g[0]);const y=g==null?void 0:g.error;if(y&&y.status&&y.message){const k=function(M){const H=M.toLowerCase().replace(/_/g,"-");return Object.values(F).indexOf(H)>=0?H:F.UNKNOWN}(y.status);l(new te(k,y.message))}else l(new te(F.UNKNOWN,"Server responded with status "+c.getStatus()))}else l(new te(F.UNAVAILABLE,"Connection failed."));break;default:_e()}}finally{se(Nt,`RPC '${e}' ${i} completed.`)}});const h=JSON.stringify(s);se(Nt,`RPC '${e}' ${i} sending request:`,s),c.send(n,"POST",h,r,15)})}Bo(e,n,r){const s=Cl(),i=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=im(),l=sm(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(c.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Oo(c.initMessageHeaders,n,r),c.encodeInitMessageHeaders=!0;const d=i.join("");se(Nt,`Creating RPC '${e}' stream ${s}: ${d}`,c);const p=a.createWebChannel(d,c);let g=!1,y=!1;const k=new RT({Io:M=>{y?se(Nt,`Not sending because RPC '${e}' stream ${s} is closed:`,M):(g||(se(Nt,`Opening RPC '${e}' stream ${s} transport.`),p.open(),g=!0),se(Nt,`RPC '${e}' stream ${s} sending:`,M),p.send(M))},To:()=>p.close()}),N=(M,H,z)=>{M.listen(H,K=>{try{z(K)}catch(W){setTimeout(()=>{throw W},0)}})};return N(p,ti.EventType.OPEN,()=>{y||(se(Nt,`RPC '${e}' stream ${s} transport opened.`),k.yo())}),N(p,ti.EventType.CLOSE,()=>{y||(y=!0,se(Nt,`RPC '${e}' stream ${s} transport closed`),k.So())}),N(p,ti.EventType.ERROR,M=>{y||(y=!0,Ss(Nt,`RPC '${e}' stream ${s} transport errored:`,M),k.So(new te(F.UNAVAILABLE,"The operation could not be completed")))}),N(p,ti.EventType.MESSAGE,M=>{var H;if(!y){const z=M.data[0];He(!!z);const K=z,W=K.error||((H=K[0])===null||H===void 0?void 0:H.error);if(W){se(Nt,`RPC '${e}' stream ${s} received error:`,W);const fe=W.status;let ie=function(T){const v=dt[T];if(v!==void 0)return xm(v)}(fe),R=W.message;ie===void 0&&(ie=F.INTERNAL,R="Unknown error status: "+fe+" with message "+W.message),y=!0,k.So(new te(ie,R)),p.close()}else se(Nt,`RPC '${e}' stream ${s} received:`,z),k.bo(z)}}),N(l,rm.STAT_EVENT,M=>{M.stat===nc.PROXY?se(Nt,`RPC '${e}' stream ${s} detected buffering proxy`):M.stat===nc.NOPROXY&&se(Nt,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{k.wo()},0),k}}function xl(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Da(t){return new Lb(t,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $m{constructor(e,n,r=1e3,s=1.5,i=6e4){this.ui=e,this.timerId=n,this.ko=r,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const n=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),s=Math.max(0,n-r);s>0&&se("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qm{constructor(e,n,r,s,i,a,l,c){this.ui=e,this.Ho=r,this.Jo=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=l,this.listener=c,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new $m(e,n)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,n){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():n&&n.code===F.RESOURCE_EXHAUSTED?(Gn(n.toString()),Gn("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):n&&n.code===F.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(n)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),n=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.Yo===n&&this.P_(r,s)},r=>{e(()=>{const s=new te(F.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(s)})})}P_(e,n){const r=this.h_(this.Yo);this.stream=this.T_(e,n),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{r(()=>this.I_(s))}),this.stream.onMessage(s=>{r(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return se("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return n=>{this.ui.enqueueAndForget(()=>this.Yo===e?n():(se("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class PT extends qm{constructor(e,n,r,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,r,s,a),this.serializer=i}T_(e,n){return this.connection.Bo("Listen",e,n)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const n=jb(this.serializer,e),r=function(i){if(!("targetChange"in i))return be.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?be.min():a.readTime?In(a.readTime):be.min()}(e);return this.listener.d_(n,r)}A_(e){const n={};n.database=dc(this.serializer),n.addTarget=function(i,a){let l;const c=a.target;if(l=oc(c)?{documents:qb(i,c)}:{query:zb(i,c)._t},l.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){l.resumeToken=Nm(i,a.resumeToken);const h=cc(i,a.expectedCount);h!==null&&(l.expectedCount=h)}else if(a.snapshotVersion.compareTo(be.min())>0){l.readTime=ea(i,a.snapshotVersion.toTimestamp());const h=cc(i,a.expectedCount);h!==null&&(l.expectedCount=h)}return l}(this.serializer,e);const r=Kb(this.serializer,e);r&&(n.labels=r),this.a_(n)}R_(e){const n={};n.database=dc(this.serializer),n.removeTarget=e,this.a_(n)}}class CT extends qm{constructor(e,n,r,s,i,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",n,r,s,a),this.serializer=i}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,n){return this.connection.Bo("Write",e,n)}E_(e){return He(!!e.streamToken),this.lastStreamToken=e.streamToken,He(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){He(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const n=$b(e.writeResults,e.commitTime),r=In(e.commitTime);return this.listener.g_(r,n)}p_(){const e={};e.database=dc(this.serializer),this.a_(e)}m_(e){const n={streamToken:this.lastStreamToken,writes:e.map(r=>Bb(this.serializer,r))};this.a_(n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xT extends class{}{constructor(e,n,r,s){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=r,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new te(F.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,n,r,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.Mo(e,uc(n,r),s,i,a)).catch(i=>{throw i.name==="FirebaseError"?(i.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new te(F.UNKNOWN,i.toString())})}Lo(e,n,r,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,l])=>this.connection.Lo(e,uc(n,r),s,a,l,i)).catch(a=>{throw a.name==="FirebaseError"?(a.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new te(F.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class kT{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(Gn(n),this.D_=!1):se("OnlineStateTracker",n)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class DT{constructor(e,n,r,s,i){this.localStore=e,this.datastore=n,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(a=>{r.enqueueAndForget(async()=>{Jr(this)&&(se("RemoteStore","Restarting streams for network reachability change."),await async function(c){const h=Te(c);h.L_.add(4),await Ki(h),h.q_.set("Unknown"),h.L_.delete(4),await Na(h)}(this))})}),this.q_=new kT(r,s)}}async function Na(t){if(Jr(t))for(const e of t.B_)await e(!0)}async function Ki(t){for(const e of t.B_)await e(!1)}function zm(t,e){const n=Te(t);n.N_.has(e.targetId)||(n.N_.set(e.targetId,e),cu(n)?lu(n):Fs(n).r_()&&au(n,e))}function ou(t,e){const n=Te(t),r=Fs(n);n.N_.delete(e),r.r_()&&Hm(n,e),n.N_.size===0&&(r.r_()?r.o_():Jr(n)&&n.q_.set("Unknown"))}function au(t,e){if(t.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(be.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}Fs(t).A_(e)}function Hm(t,e){t.Q_.xe(e),Fs(t).R_(e)}function lu(t){t.Q_=new Nb({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>t.N_.get(e)||null,tt:()=>t.datastore.serializer.databaseId}),Fs(t).start(),t.q_.v_()}function cu(t){return Jr(t)&&!Fs(t).n_()&&t.N_.size>0}function Jr(t){return Te(t).L_.size===0}function Km(t){t.Q_=void 0}async function NT(t){t.q_.set("Online")}async function VT(t){t.N_.forEach((e,n)=>{au(t,e)})}async function OT(t,e){Km(t),cu(t)?(t.q_.M_(e),lu(t)):t.q_.set("Unknown")}async function MT(t,e,n){if(t.q_.set("Online"),e instanceof Dm&&e.state===2&&e.cause)try{await async function(s,i){const a=i.cause;for(const l of i.targetIds)s.N_.has(l)&&(await s.remoteSyncer.rejectListen(l,a),s.N_.delete(l),s.Q_.removeTarget(l))}(t,e)}catch(r){se("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await ta(t,r)}else if(e instanceof Oo?t.Q_.Ke(e):e instanceof km?t.Q_.He(e):t.Q_.We(e),!n.isEqual(be.min()))try{const r=await Bm(t.localStore);n.compareTo(r)>=0&&await function(i,a){const l=i.Q_.rt(a);return l.targetChanges.forEach((c,h)=>{if(c.resumeToken.approximateByteSize()>0){const d=i.N_.get(h);d&&i.N_.set(h,d.withResumeToken(c.resumeToken,a))}}),l.targetMismatches.forEach((c,h)=>{const d=i.N_.get(c);if(!d)return;i.N_.set(c,d.withResumeToken(Ct.EMPTY_BYTE_STRING,d.snapshotVersion)),Hm(i,c);const p=new fr(d.target,c,h,d.sequenceNumber);au(i,p)}),i.remoteSyncer.applyRemoteEvent(l)}(t,n)}catch(r){se("RemoteStore","Failed to raise snapshot:",r),await ta(t,r)}}async function ta(t,e,n){if(!qi(e))throw e;t.L_.add(1),await Ki(t),t.q_.set("Offline"),n||(n=()=>Bm(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{se("RemoteStore","Retrying IndexedDB access"),await n(),t.L_.delete(1),await Na(t)})}function Wm(t,e){return e().catch(n=>ta(t,n,e))}async function Va(t){const e=Te(t),n=Ir(e);let r=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;LT(e);)try{const s=await wT(e.localStore,r);if(s===null){e.O_.length===0&&n.o_();break}r=s.batchId,FT(e,s)}catch(s){await ta(e,s)}Gm(e)&&Qm(e)}function LT(t){return Jr(t)&&t.O_.length<10}function FT(t,e){t.O_.push(e);const n=Ir(t);n.r_()&&n.V_&&n.m_(e.mutations)}function Gm(t){return Jr(t)&&!Ir(t).n_()&&t.O_.length>0}function Qm(t){Ir(t).start()}async function UT(t){Ir(t).p_()}async function jT(t){const e=Ir(t);for(const n of t.O_)e.m_(n.mutations)}async function BT(t,e,n){const r=t.O_.shift(),s=eu.from(r,e,n);await Wm(t,()=>t.remoteSyncer.applySuccessfulWrite(s)),await Va(t)}async function $T(t,e){e&&Ir(t).V_&&await async function(r,s){if(function(a){return xb(a)&&a!==F.ABORTED}(s.code)){const i=r.O_.shift();Ir(r).s_(),await Wm(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await Va(r)}}(t,e),Gm(t)&&Qm(t)}async function $d(t,e){const n=Te(t);n.asyncQueue.verifyOperationInProgress(),se("RemoteStore","RemoteStore received new credentials");const r=Jr(n);n.L_.add(3),await Ki(n),r&&n.q_.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.L_.delete(3),await Na(n)}async function qT(t,e){const n=Te(t);e?(n.L_.delete(2),await Na(n)):e||(n.L_.add(2),await Ki(n),n.q_.set("Unknown"))}function Fs(t){return t.K_||(t.K_=function(n,r,s){const i=Te(n);return i.w_(),new PT(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(t.datastore,t.asyncQueue,{Eo:NT.bind(null,t),Ro:VT.bind(null,t),mo:OT.bind(null,t),d_:MT.bind(null,t)}),t.B_.push(async e=>{e?(t.K_.s_(),cu(t)?lu(t):t.q_.set("Unknown")):(await t.K_.stop(),Km(t))})),t.K_}function Ir(t){return t.U_||(t.U_=function(n,r,s){const i=Te(n);return i.w_(),new CT(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(t.datastore,t.asyncQueue,{Eo:()=>Promise.resolve(),Ro:UT.bind(null,t),mo:$T.bind(null,t),f_:jT.bind(null,t),g_:BT.bind(null,t)}),t.B_.push(async e=>{e?(t.U_.s_(),await Va(t)):(await t.U_.stop(),t.O_.length>0&&(se("RemoteStore",`Stopping write stream with ${t.O_.length} pending writes`),t.O_=[]))})),t.U_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uu{constructor(e,n,r,s,i){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new zn,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,s,i){const a=Date.now()+r,l=new uu(e,n,a,s,i);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new te(F.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function hu(t,e){if(Gn("AsyncQueue",`${e}: ${t}`),qi(t))return new te(F.UNAVAILABLE,`${e}: ${t}`);throw t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vs{constructor(e){this.comparator=e?(n,r)=>e(n,r)||ce.comparator(n.key,r.key):(n,r)=>ce.comparator(n.key,r.key),this.keyedMap=ni(),this.sortedSet=new st(this.comparator)}static emptySet(e){return new vs(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,r)=>(e(n),!1))}add(e){const n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){const n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof vs)||this.size!==e.size)return!1;const n=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;n.hasNext();){const s=n.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){const r=new vs;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=n,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qd{constructor(){this.W_=new st(ce.comparator)}track(e){const n=e.doc.key,r=this.W_.get(n);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(n,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(n,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(n,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(n,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(n):e.type===1&&r.type===2?this.W_=this.W_.insert(n,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(n,{type:2,doc:e.doc}):_e():this.W_=this.W_.insert(n,e)}G_(){const e=[];return this.W_.inorderTraversal((n,r)=>{e.push(r)}),e}}class Ds{constructor(e,n,r,s,i,a,l,c,h){this.query=e,this.docs=n,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=l,this.excludesMetadataChanges=c,this.hasCachedResults=h}static fromInitialDocuments(e,n,r,s,i){const a=[];return n.forEach(l=>{a.push({type:0,doc:l})}),new Ds(e,n,vs.emptySet(n),a,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Ra(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const n=this.docChanges,r=e.docChanges;if(n.length!==r.length)return!1;for(let s=0;s<n.length;s++)if(n[s].type!==r[s].type||!n[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zT{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class HT{constructor(){this.queries=zd(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(n,r){const s=Te(n),i=s.queries;s.queries=zd(),i.forEach((a,l)=>{for(const c of l.j_)c.onError(r)})})(this,new te(F.ABORTED,"Firestore shutting down"))}}function zd(){return new Ls(t=>ym(t),Ra)}async function Jm(t,e){const n=Te(t);let r=3;const s=e.query;let i=n.queries.get(s);i?!i.H_()&&e.J_()&&(r=2):(i=new zT,r=e.J_()?0:1);try{switch(r){case 0:i.z_=await n.onListen(s,!0);break;case 1:i.z_=await n.onListen(s,!1);break;case 2:await n.onFirstRemoteStoreListen(s)}}catch(a){const l=hu(a,`Initialization of query '${ls(e.query)}' failed`);return void e.onError(l)}n.queries.set(s,i),i.j_.push(e),e.Z_(n.onlineState),i.z_&&e.X_(i.z_)&&du(n)}async function Ym(t,e){const n=Te(t),r=e.query;let s=3;const i=n.queries.get(r);if(i){const a=i.j_.indexOf(e);a>=0&&(i.j_.splice(a,1),i.j_.length===0?s=e.J_()?0:1:!i.H_()&&e.J_()&&(s=2))}switch(s){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function KT(t,e){const n=Te(t);let r=!1;for(const s of e){const i=s.query,a=n.queries.get(i);if(a){for(const l of a.j_)l.X_(s)&&(r=!0);a.z_=s}}r&&du(n)}function WT(t,e,n){const r=Te(t),s=r.queries.get(e);if(s)for(const i of s.j_)i.onError(n);r.queries.delete(e)}function du(t){t.Y_.forEach(e=>{e.next()})}var pc,Hd;(Hd=pc||(pc={})).ea="default",Hd.Cache="cache";class Xm{constructor(e,n,r){this.query=e,this.ta=n,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new Ds(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.na?this.ia(e)&&(this.ta.next(e),n=!0):this.sa(e,this.onlineState)&&(this.oa(e),n=!0),this.ra=e,n}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let n=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),n=!0),n}sa(e,n){if(!e.fromCache||!this.J_())return!0;const r=n!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const n=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}oa(e){e=Ds.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==pc.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zm{constructor(e){this.key=e}}class eg{constructor(e){this.key=e}}class GT{constructor(e,n){this.query=e,this.Ta=n,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=ke(),this.mutatedKeys=ke(),this.Aa=vm(e),this.Ra=new vs(this.Aa)}get Va(){return this.Ta}ma(e,n){const r=n?n.fa:new qd,s=n?n.Ra:this.Ra;let i=n?n.mutatedKeys:this.mutatedKeys,a=s,l=!1;const c=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,h=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((d,p)=>{const g=s.get(d),y=Sa(this.query,p)?p:null,k=!!g&&this.mutatedKeys.has(g.key),N=!!y&&(y.hasLocalMutations||this.mutatedKeys.has(y.key)&&y.hasCommittedMutations);let M=!1;g&&y?g.data.isEqual(y.data)?k!==N&&(r.track({type:3,doc:y}),M=!0):this.ga(g,y)||(r.track({type:2,doc:y}),M=!0,(c&&this.Aa(y,c)>0||h&&this.Aa(y,h)<0)&&(l=!0)):!g&&y?(r.track({type:0,doc:y}),M=!0):g&&!y&&(r.track({type:1,doc:g}),M=!0,(c||h)&&(l=!0)),M&&(y?(a=a.add(y),i=N?i.add(d):i.delete(d)):(a=a.delete(d),i=i.delete(d)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const d=this.query.limitType==="F"?a.last():a.first();a=a.delete(d.key),i=i.delete(d.key),r.track({type:1,doc:d})}return{Ra:a,fa:r,ns:l,mutatedKeys:i}}ga(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,r,s){const i=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const a=e.fa.G_();a.sort((d,p)=>function(y,k){const N=M=>{switch(M){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return _e()}};return N(y)-N(k)}(d.type,p.type)||this.Aa(d.doc,p.doc)),this.pa(r),s=s!=null&&s;const l=n&&!s?this.ya():[],c=this.da.size===0&&this.current&&!s?1:0,h=c!==this.Ea;return this.Ea=c,a.length!==0||h?{snapshot:new Ds(this.query,e.Ra,i,a,e.mutatedKeys,c===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:l}:{wa:l}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new qd,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(n=>this.Ta=this.Ta.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Ta=this.Ta.delete(n)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=ke(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const n=[];return e.forEach(r=>{this.da.has(r)||n.push(new eg(r))}),this.da.forEach(r=>{e.has(r)||n.push(new Zm(r))}),n}ba(e){this.Ta=e.Ts,this.da=ke();const n=this.ma(e.documents);return this.applyChanges(n,!0)}Da(){return Ds.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class QT{constructor(e,n,r){this.query=e,this.targetId=n,this.view=r}}class JT{constructor(e){this.key=e,this.va=!1}}class YT{constructor(e,n,r,s,i,a){this.localStore=e,this.remoteStore=n,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new Ls(l=>ym(l),Ra),this.Ma=new Map,this.xa=new Set,this.Oa=new st(ce.comparator),this.Na=new Map,this.La=new ru,this.Ba={},this.ka=new Map,this.qa=ks.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function XT(t,e,n=!0){const r=og(t);let s;const i=r.Fa.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await tg(r,e,n,!0),s}async function ZT(t,e){const n=og(t);await tg(n,e,!0,!1)}async function tg(t,e,n,r){const s=await ET(t.localStore,Tn(e)),i=s.targetId,a=t.sharedClientState.addLocalQueryTarget(i,n);let l;return r&&(l=await eI(t,e,i,a==="current",s.resumeToken)),t.isPrimaryClient&&n&&zm(t.remoteStore,s),l}async function eI(t,e,n,r,s){t.Ka=(p,g,y)=>async function(N,M,H,z){let K=M.view.ma(H);K.ns&&(K=await Ud(N.localStore,M.query,!1).then(({documents:R})=>M.view.ma(R,K)));const W=z&&z.targetChanges.get(M.targetId),fe=z&&z.targetMismatches.get(M.targetId)!=null,ie=M.view.applyChanges(K,N.isPrimaryClient,W,fe);return Wd(N,M.targetId,ie.wa),ie.snapshot}(t,p,g,y);const i=await Ud(t.localStore,e,!0),a=new GT(e,i.Ts),l=a.ma(i.documents),c=Hi.createSynthesizedTargetChangeForCurrentChange(n,r&&t.onlineState!=="Offline",s),h=a.applyChanges(l,t.isPrimaryClient,c);Wd(t,n,h.wa);const d=new QT(e,n,a);return t.Fa.set(e,d),t.Ma.has(n)?t.Ma.get(n).push(e):t.Ma.set(n,[e]),h.snapshot}async function tI(t,e,n){const r=Te(t),s=r.Fa.get(e),i=r.Ma.get(s.targetId);if(i.length>1)return r.Ma.set(s.targetId,i.filter(a=>!Ra(a,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await fc(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),n&&ou(r.remoteStore,s.targetId),mc(r,s.targetId)}).catch($i)):(mc(r,s.targetId),await fc(r.localStore,s.targetId,!0))}async function nI(t,e){const n=Te(t),r=n.Fa.get(e),s=n.Ma.get(r.targetId);n.isPrimaryClient&&s.length===1&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),ou(n.remoteStore,r.targetId))}async function rI(t,e,n){const r=uI(t);try{const s=await function(a,l){const c=Te(a),h=_t.now(),d=l.reduce((y,k)=>y.add(k.key),ke());let p,g;return c.persistence.runTransaction("Locally write mutations","readwrite",y=>{let k=Qn(),N=ke();return c.cs.getEntries(y,d).next(M=>{k=M,k.forEach((H,z)=>{z.isValidDocument()||(N=N.add(H))})}).next(()=>c.localDocuments.getOverlayedDocuments(y,k)).next(M=>{p=M;const H=[];for(const z of l){const K=Ab(z,p.get(z.key).overlayedDocument);K!=null&&H.push(new Pr(z.key,K,um(K.value.mapValue),Zt.exists(!0)))}return c.mutationQueue.addMutationBatch(y,h,H,l)}).next(M=>{g=M;const H=M.applyToLocalDocumentSet(p,N);return c.documentOverlayCache.saveOverlays(y,M.batchId,H)})}).then(()=>({batchId:g.batchId,changes:Em(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(a,l,c){let h=a.Ba[a.currentUser.toKey()];h||(h=new st(Ue)),h=h.insert(l,c),a.Ba[a.currentUser.toKey()]=h}(r,s.batchId,n),await Wi(r,s.changes),await Va(r.remoteStore)}catch(s){const i=hu(s,"Failed to persist write");n.reject(i)}}async function ng(t,e){const n=Te(t);try{const r=await yT(n.localStore,e);e.targetChanges.forEach((s,i)=>{const a=n.Na.get(i);a&&(He(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?a.va=!0:s.modifiedDocuments.size>0?He(a.va):s.removedDocuments.size>0&&(He(a.va),a.va=!1))}),await Wi(n,r,e)}catch(r){await $i(r)}}function Kd(t,e,n){const r=Te(t);if(r.isPrimaryClient&&n===0||!r.isPrimaryClient&&n===1){const s=[];r.Fa.forEach((i,a)=>{const l=a.view.Z_(e);l.snapshot&&s.push(l.snapshot)}),function(a,l){const c=Te(a);c.onlineState=l;let h=!1;c.queries.forEach((d,p)=>{for(const g of p.j_)g.Z_(l)&&(h=!0)}),h&&du(c)}(r.eventManager,e),s.length&&r.Ca.d_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function sI(t,e,n){const r=Te(t);r.sharedClientState.updateQueryState(e,"rejected",n);const s=r.Na.get(e),i=s&&s.key;if(i){let a=new st(ce.comparator);a=a.insert(i,Mt.newNoDocument(i,be.min()));const l=ke().add(i),c=new ka(be.min(),new Map,new st(Ue),a,l);await ng(r,c),r.Oa=r.Oa.remove(i),r.Na.delete(e),fu(r)}else await fc(r.localStore,e,!1).then(()=>mc(r,e,n)).catch($i)}async function iI(t,e){const n=Te(t),r=e.batch.batchId;try{const s=await _T(n.localStore,e);sg(n,r,null),rg(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await Wi(n,s)}catch(s){await $i(s)}}async function oI(t,e,n){const r=Te(t);try{const s=await function(a,l){const c=Te(a);return c.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let d;return c.mutationQueue.lookupMutationBatch(h,l).next(p=>(He(p!==null),d=p.keys(),c.mutationQueue.removeMutationBatch(h,p))).next(()=>c.mutationQueue.performConsistencyCheck(h)).next(()=>c.documentOverlayCache.removeOverlaysForBatchId(h,d,l)).next(()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,d)).next(()=>c.localDocuments.getDocuments(h,d))})}(r.localStore,e);sg(r,e,n),rg(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await Wi(r,s)}catch(s){await $i(s)}}function rg(t,e){(t.ka.get(e)||[]).forEach(n=>{n.resolve()}),t.ka.delete(e)}function sg(t,e,n){const r=Te(t);let s=r.Ba[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(n?i.reject(n):i.resolve(),s=s.remove(e)),r.Ba[r.currentUser.toKey()]=s}}function mc(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Ma.get(e))t.Fa.delete(r),n&&t.Ca.$a(r,n);t.Ma.delete(e),t.isPrimaryClient&&t.La.gr(e).forEach(r=>{t.La.containsKey(r)||ig(t,r)})}function ig(t,e){t.xa.delete(e.path.canonicalString());const n=t.Oa.get(e);n!==null&&(ou(t.remoteStore,n),t.Oa=t.Oa.remove(e),t.Na.delete(n),fu(t))}function Wd(t,e,n){for(const r of n)r instanceof Zm?(t.La.addReference(r.key,e),aI(t,r)):r instanceof eg?(se("SyncEngine","Document no longer in limbo: "+r.key),t.La.removeReference(r.key,e),t.La.containsKey(r.key)||ig(t,r.key)):_e()}function aI(t,e){const n=e.key,r=n.path.canonicalString();t.Oa.get(n)||t.xa.has(r)||(se("SyncEngine","New document in limbo: "+n),t.xa.add(r),fu(t))}function fu(t){for(;t.xa.size>0&&t.Oa.size<t.maxConcurrentLimboResolutions;){const e=t.xa.values().next().value;t.xa.delete(e);const n=new ce(Ze.fromString(e)),r=t.qa.next();t.Na.set(r,new JT(n)),t.Oa=t.Oa.insert(n,r),zm(t.remoteStore,new fr(Tn(Xc(n.path)),r,"TargetPurposeLimboResolution",Kc.oe))}}async function Wi(t,e,n){const r=Te(t),s=[],i=[],a=[];r.Fa.isEmpty()||(r.Fa.forEach((l,c)=>{a.push(r.Ka(c,e,n).then(h=>{var d;if((h||n)&&r.isPrimaryClient){const p=h?!h.fromCache:(d=n==null?void 0:n.targetChanges.get(c.targetId))===null||d===void 0?void 0:d.current;r.sharedClientState.updateQueryState(c.targetId,p?"current":"not-current")}if(h){s.push(h);const p=iu.Wi(c.targetId,h);i.push(p)}}))}),await Promise.all(a),r.Ca.d_(s),await async function(c,h){const d=Te(c);try{await d.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>B.forEach(h,g=>B.forEach(g.$i,y=>d.persistence.referenceDelegate.addReference(p,g.targetId,y)).next(()=>B.forEach(g.Ui,y=>d.persistence.referenceDelegate.removeReference(p,g.targetId,y)))))}catch(p){if(!qi(p))throw p;se("LocalStore","Failed to update sequence numbers: "+p)}for(const p of h){const g=p.targetId;if(!p.fromCache){const y=d.os.get(g),k=y.snapshotVersion,N=y.withLastLimboFreeSnapshotVersion(k);d.os=d.os.insert(g,N)}}}(r.localStore,i))}async function lI(t,e){const n=Te(t);if(!n.currentUser.isEqual(e)){se("SyncEngine","User change. New user:",e.toKey());const r=await jm(n.localStore,e);n.currentUser=e,function(i,a){i.ka.forEach(l=>{l.forEach(c=>{c.reject(new te(F.CANCELLED,a))})}),i.ka.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await Wi(n,r.hs)}}function cI(t,e){const n=Te(t),r=n.Na.get(e);if(r&&r.va)return ke().add(r.key);{let s=ke();const i=n.Ma.get(e);if(!i)return s;for(const a of i){const l=n.Fa.get(a);s=s.unionWith(l.view.Va)}return s}}function og(t){const e=Te(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=ng.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=cI.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=sI.bind(null,e),e.Ca.d_=KT.bind(null,e.eventManager),e.Ca.$a=WT.bind(null,e.eventManager),e}function uI(t){const e=Te(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=iI.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=oI.bind(null,e),e}class na{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Da(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,n){return null}Ha(e,n){return null}za(e){return gT(this.persistence,new pT,e.initialUser,this.serializer)}Ga(e){return new hT(su.Zr,this.serializer)}Wa(e){return new TT}async terminate(){var e,n;(e=this.gcScheduler)===null||e===void 0||e.stop(),(n=this.indexBackfillerScheduler)===null||n===void 0||n.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}na.provider={build:()=>new na};class gc{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Kd(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=lI.bind(null,this.syncEngine),await qT(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new HT}()}createDatastore(e){const n=Da(e.databaseInfo.databaseId),r=function(i){return new ST(i)}(e.databaseInfo);return function(i,a,l,c){return new xT(i,a,l,c)}(e.authCredentials,e.appCheckCredentials,r,n)}createRemoteStore(e){return function(r,s,i,a,l){return new DT(r,s,i,a,l)}(this.localStore,this.datastore,e.asyncQueue,n=>Kd(this.syncEngine,n,0),function(){return Bd.D()?new Bd:new IT}())}createSyncEngine(e,n){return function(s,i,a,l,c,h,d){const p=new YT(s,i,a,l,c,h);return d&&(p.Qa=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){var e,n;await async function(s){const i=Te(s);se("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await Ki(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(n=this.eventManager)===null||n===void 0||n.terminate()}}gc.provider={build:()=>new gc};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class ag{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):Gn("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,n){setTimeout(()=>{this.muted||e(n)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hI{constructor(e,n,r,s,i){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=r,this.databaseInfo=s,this.user=Vt.UNAUTHENTICATED,this.clientId=am.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async a=>{se("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(se("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new zn;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){const r=hu(n,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function kl(t,e){t.asyncQueue.verifyOperationInProgress(),se("FirestoreClient","Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async s=>{r.isEqual(s)||(await jm(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function Gd(t,e){t.asyncQueue.verifyOperationInProgress();const n=await dI(t);se("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(r=>$d(e.remoteStore,r)),t.setAppCheckTokenChangeListener((r,s)=>$d(e.remoteStore,s)),t._onlineComponents=e}async function dI(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){se("FirestoreClient","Using user provided OfflineComponentProvider");try{await kl(t,t._uninitializedComponentsProvider._offline)}catch(e){const n=e;if(!function(s){return s.name==="FirebaseError"?s.code===F.FAILED_PRECONDITION||s.code===F.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(n))throw n;Ss("Error using user provided cache. Falling back to memory cache: "+n),await kl(t,new na)}}else se("FirestoreClient","Using default OfflineComponentProvider"),await kl(t,new na);return t._offlineComponents}async function lg(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(se("FirestoreClient","Using user provided OnlineComponentProvider"),await Gd(t,t._uninitializedComponentsProvider._online)):(se("FirestoreClient","Using default OnlineComponentProvider"),await Gd(t,new gc))),t._onlineComponents}function fI(t){return lg(t).then(e=>e.syncEngine)}async function cg(t){const e=await lg(t),n=e.eventManager;return n.onListen=XT.bind(null,e.syncEngine),n.onUnlisten=tI.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=ZT.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=nI.bind(null,e.syncEngine),n}function pI(t,e,n={}){const r=new zn;return t.asyncQueue.enqueueAndForget(async()=>function(i,a,l,c,h){const d=new ag({next:g=>{d.Za(),a.enqueueAndForget(()=>Ym(i,p));const y=g.docs.has(l);!y&&g.fromCache?h.reject(new te(F.UNAVAILABLE,"Failed to get document because the client is offline.")):y&&g.fromCache&&c&&c.source==="server"?h.reject(new te(F.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):h.resolve(g)},error:g=>h.reject(g)}),p=new Xm(Xc(l.path),d,{includeMetadataChanges:!0,_a:!0});return Jm(i,p)}(await cg(t),t.asyncQueue,e,n,r)),r.promise}function mI(t,e,n={}){const r=new zn;return t.asyncQueue.enqueueAndForget(async()=>function(i,a,l,c,h){const d=new ag({next:g=>{d.Za(),a.enqueueAndForget(()=>Ym(i,p)),g.fromCache&&c.source==="server"?h.reject(new te(F.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(g)},error:g=>h.reject(g)}),p=new Xm(l,d,{includeMetadataChanges:!0,_a:!0});return Jm(i,p)}(await cg(t),t.asyncQueue,e,n,r)),r.promise}/**
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
 */function ug(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qd=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hg(t,e,n){if(!n)throw new te(F.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function gI(t,e,n,r){if(e===!0&&r===!0)throw new te(F.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function Jd(t){if(!ce.isDocumentKey(t))throw new te(F.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function Yd(t){if(ce.isDocumentKey(t))throw new te(F.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function Oa(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":_e()}function Cn(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new te(F.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=Oa(t);throw new te(F.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xd{constructor(e){var n,r;if(e.host===void 0){if(e.ssl!==void 0)throw new te(F.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(n=e.ssl)===null||n===void 0||n;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new te(F.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}gI("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=ug((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new te(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new te(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new te(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Ma{constructor(e,n,r,s){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Xd({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new te(F.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new te(F.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Xd(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new NE;switch(r.type){case"firstParty":return new LE(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new te(F.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=Qd.get(n);r&&(se("ComponentProvider","Removing Datastore"),Qd.delete(n),r.terminate())}(this),Promise.resolve()}}function _I(t,e,n,r={}){var s;const i=(t=Cn(t,Ma))._getSettings(),a=`${e}:${n}`;if(i.host!=="firestore.googleapis.com"&&i.host!==a&&Ss("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),t._setSettings(Object.assign(Object.assign({},i),{host:a,ssl:!1})),r.mockUserToken){let l,c;if(typeof r.mockUserToken=="string")l=r.mockUserToken,c=Vt.MOCK_USER;else{l=aw(r.mockUserToken,(s=t._app)===null||s===void 0?void 0:s.options.projectId);const h=r.mockUserToken.sub||r.mockUserToken.user_id;if(!h)throw new te(F.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");c=new Vt(h)}t._authCredentials=new VE(new om(l,c))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yr{constructor(e,n,r){this.converter=n,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Yr(this.firestore,e,this._query)}}class en{constructor(e,n,r){this.converter=n,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new yr(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new en(this.firestore,e,this._key)}}class yr extends Yr{constructor(e,n,r){super(e,n,Xc(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new en(this.firestore,null,new ce(e))}withConverter(e){return new yr(this.firestore,e,this._path)}}function ze(t,e,...n){if(t=jt(t),hg("collection","path",e),t instanceof Ma){const r=Ze.fromString(e,...n);return Yd(r),new yr(t,null,r)}{if(!(t instanceof en||t instanceof yr))throw new te(F.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Ze.fromString(e,...n));return Yd(r),new yr(t.firestore,null,r)}}function Je(t,e,...n){if(t=jt(t),arguments.length===1&&(e=am.newId()),hg("doc","path",e),t instanceof Ma){const r=Ze.fromString(e,...n);return Jd(r),new en(t,null,new ce(r))}{if(!(t instanceof en||t instanceof yr))throw new te(F.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Ze.fromString(e,...n));return Jd(r),new en(t.firestore,t instanceof yr?t.converter:null,new ce(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zd{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new $m(this,"async_queue_retry"),this.Vu=()=>{const r=xl();r&&se("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const n=xl();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const n=xl();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const n=new zn;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!qi(e))throw e;se("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const n=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const s=function(a){let l=a.message||"";return a.stack&&(l=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),l}(r);throw Gn("INTERNAL UNHANDLED ERROR: ",s),r}).then(r=>(this.du=!1,r))));return this.mu=n,n}enqueueAfterDelay(e,n,r){this.fu(),this.Ru.indexOf(e)>-1&&(n=0);const s=uu.createAndSchedule(this,e,n,r,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&_e()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const n of this.Tu)if(n.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.Tu)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const n=this.Tu.indexOf(e);this.Tu.splice(n,1)}}class Xr extends Ma{constructor(e,n,r,s){super(e,n,r,s),this.type="firestore",this._queue=new Zd,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Zd(e),this._firestoreClient=void 0,await e}}}function yI(t,e){const n=typeof t=="object"?t:Yp(),r=typeof t=="string"?t:e||"(default)",s=zc(n,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=iw("firestore");i&&_I(s,...i)}return s}function La(t){if(t._terminated)throw new te(F.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||vI(t),t._firestoreClient}function vI(t){var e,n,r;const s=t._freezeSettings(),i=function(l,c,h,d){return new JE(l,c,h,d.host,d.ssl,d.experimentalForceLongPolling,d.experimentalAutoDetectLongPolling,ug(d.experimentalLongPollingOptions),d.useFetchStreams)}(t._databaseId,((e=t._app)===null||e===void 0?void 0:e.options.appId)||"",t._persistenceKey,s);t._componentsProvider||!((n=s.localCache)===null||n===void 0)&&n._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(t._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),t._firestoreClient=new hI(t._authCredentials,t._appCheckCredentials,t._queue,i,t._componentsProvider&&function(l){const c=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(c),_online:c}}(t._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ns{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Ns(Ct.fromBase64String(e))}catch(n){throw new te(F.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new Ns(Ct.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fa{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new te(F.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Rt(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ua{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pu{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new te(F.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new te(F.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return Ue(this._lat,e._lat)||Ue(this._long,e._long)}}/**
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
 */class mu{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wI=/^__.*__$/;class EI{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return this.fieldMask!==null?new Pr(e,this.data,this.fieldMask,n,this.fieldTransforms):new zi(e,this.data,n,this.fieldTransforms)}}class dg{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return new Pr(e,this.data,this.fieldMask,n,this.fieldTransforms)}}function fg(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw _e()}}class gu{constructor(e,n,r,s,i,a){this.settings=e,this.databaseId=n,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.vu(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new gu(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),s=this.Fu({path:r,xu:!1});return s.Ou(e),s}Nu(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),s=this.Fu({path:r,xu:!1});return s.vu(),s}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return ra(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(fg(this.Cu)&&wI.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class bI{constructor(e,n,r){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=r||Da(e)}Qu(e,n,r,s=!1){return new gu({Cu:e,methodName:n,qu:r,path:Rt.emptyPath(),xu:!1,ku:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function ja(t){const e=t._freezeSettings(),n=Da(t._databaseId);return new bI(t._databaseId,!!e.ignoreUndefinedProperties,n)}function _u(t,e,n,r,s,i={}){const a=t.Qu(i.merge||i.mergeFields?2:0,e,n,s);vu("Data must be an object, but it was:",a,r);const l=pg(r,a);let c,h;if(i.merge)c=new an(a.fieldMask),h=a.fieldTransforms;else if(i.mergeFields){const d=[];for(const p of i.mergeFields){const g=_c(e,p,n);if(!a.contains(g))throw new te(F.INVALID_ARGUMENT,`Field '${g}' is specified in your field mask but missing from your input data.`);gg(d,g)||d.push(g)}c=new an(d),h=a.fieldTransforms.filter(p=>c.covers(p.field))}else c=null,h=a.fieldTransforms;return new EI(new Xt(l),c,h)}class Ba extends Ua{_toFieldTransform(e){if(e.Cu!==2)throw e.Cu===1?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Ba}}class yu extends Ua{_toFieldTransform(e){return new Eb(e.path,new Ni)}isEqual(e){return e instanceof yu}}function TI(t,e,n,r){const s=t.Qu(1,e,n);vu("Data must be an object, but it was:",s,r);const i=[],a=Xt.empty();Qr(r,(c,h)=>{const d=wu(e,c,n);h=jt(h);const p=s.Nu(d);if(h instanceof Ba)i.push(d);else{const g=Gi(h,p);g!=null&&(i.push(d),a.set(d,g))}});const l=new an(i);return new dg(a,l,s.fieldTransforms)}function II(t,e,n,r,s,i){const a=t.Qu(1,e,n),l=[_c(e,r,n)],c=[s];if(i.length%2!=0)throw new te(F.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let g=0;g<i.length;g+=2)l.push(_c(e,i[g])),c.push(i[g+1]);const h=[],d=Xt.empty();for(let g=l.length-1;g>=0;--g)if(!gg(h,l[g])){const y=l[g];let k=c[g];k=jt(k);const N=a.Nu(y);if(k instanceof Ba)h.push(y);else{const M=Gi(k,N);M!=null&&(h.push(y),d.set(y,M))}}const p=new an(h);return new dg(d,p,a.fieldTransforms)}function AI(t,e,n,r=!1){return Gi(n,t.Qu(r?4:3,e))}function Gi(t,e){if(mg(t=jt(t)))return vu("Unsupported field value:",e,t),pg(t,e);if(t instanceof Ua)return function(r,s){if(!fg(s.Cu))throw s.Bu(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Bu(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,s){const i=[];let a=0;for(const l of r){let c=Gi(l,s.Lu(a));c==null&&(c={nullValue:"NULL_VALUE"}),i.push(c),a++}return{arrayValue:{values:i}}}(t,e)}return function(r,s){if((r=jt(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return yb(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=_t.fromDate(r);return{timestampValue:ea(s.serializer,i)}}if(r instanceof _t){const i=new _t(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:ea(s.serializer,i)}}if(r instanceof pu)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Ns)return{bytesValue:Nm(s.serializer,r._byteString)};if(r instanceof en){const i=s.databaseId,a=r.firestore._databaseId;if(!a.isEqual(i))throw s.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:nu(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof mu)return function(a,l){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(c=>{if(typeof c!="number")throw l.Bu("VectorValues must only contain numeric values.");return Zc(l.serializer,c)})}}}}}}(r,s);throw s.Bu(`Unsupported field value: ${Oa(r)}`)}(t,e)}function pg(t,e){const n={};return lm(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Qr(t,(r,s)=>{const i=Gi(s,e.Mu(r));i!=null&&(n[r]=i)}),{mapValue:{fields:n}}}function mg(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof _t||t instanceof pu||t instanceof Ns||t instanceof en||t instanceof Ua||t instanceof mu)}function vu(t,e,n){if(!mg(n)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(n)){const r=Oa(n);throw r==="an object"?e.Bu(t+" a custom object"):e.Bu(t+" "+r)}}function _c(t,e,n){if((e=jt(e))instanceof Fa)return e._internalPath;if(typeof e=="string")return wu(t,e);throw ra("Field path arguments must be of type string or ",t,!1,void 0,n)}const RI=new RegExp("[~\\*/\\[\\]]");function wu(t,e,n){if(e.search(RI)>=0)throw ra(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new Fa(...e.split("."))._internalPath}catch{throw ra(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function ra(t,e,n,r,s){const i=r&&!r.isEmpty(),a=s!==void 0;let l=`Function ${e}() called with invalid data`;n&&(l+=" (via `toFirestore()`)"),l+=". ";let c="";return(i||a)&&(c+=" (found",i&&(c+=` in field ${r}`),a&&(c+=` in document ${s}`),c+=")"),new te(F.INVALID_ARGUMENT,l+t+c)}function gg(t,e){return t.some(n=>n.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _g{constructor(e,n,r,s,i){this._firestore=e,this._userDataWriter=n,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new en(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new SI(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const n=this._document.data.field($a("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class SI extends _g{data(){return super.data()}}function $a(t,e){return typeof e=="string"?wu(t,e):e instanceof Fa?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function PI(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new te(F.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Eu{}class yg extends Eu{}function vg(t,e,...n){let r=[];e instanceof Eu&&r.push(e),r=r.concat(n),function(i){const a=i.filter(c=>c instanceof bu).length,l=i.filter(c=>c instanceof qa).length;if(a>1||a>0&&l>0)throw new te(F.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)t=s._apply(t);return t}class qa extends yg{constructor(e,n,r){super(),this._field=e,this._op=n,this._value=r,this.type="where"}static _create(e,n,r){return new qa(e,n,r)}_apply(e){const n=this._parse(e);return wg(e._query,n),new Yr(e.firestore,e.converter,ac(e._query,n))}_parse(e){const n=ja(e.firestore);return function(i,a,l,c,h,d,p){let g;if(h.isKeyField()){if(d==="array-contains"||d==="array-contains-any")throw new te(F.INVALID_ARGUMENT,`Invalid Query. You can't perform '${d}' queries on documentId().`);if(d==="in"||d==="not-in"){tf(p,d);const y=[];for(const k of p)y.push(ef(c,i,k));g={arrayValue:{values:y}}}else g=ef(c,i,p)}else d!=="in"&&d!=="not-in"&&d!=="array-contains-any"||tf(p,d),g=AI(l,a,p,d==="in"||d==="not-in");return ft.create(h,d,g)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}}function CI(t,e,n){const r=e,s=$a("where",t);return qa._create(s,r,n)}class bu extends Eu{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new bu(e,n)}_parse(e){const n=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return n.length===1?n[0]:gn.create(n,this._getOperator())}_apply(e){const n=this._parse(e);return n.getFilters().length===0?e:(function(s,i){let a=s;const l=i.getFlattenedFilters();for(const c of l)wg(a,c),a=ac(a,c)}(e._query,n),new Yr(e.firestore,e.converter,ac(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class Tu extends yg{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new Tu(e,n)}_apply(e){const n=function(s,i,a){if(s.startAt!==null)throw new te(F.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new te(F.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Di(i,a)}(e._query,this._field,this._direction);return new Yr(e.firestore,e.converter,function(s,i){const a=s.explicitOrderBy.concat([i]);return new Ms(s.path,s.collectionGroup,a,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,n))}}function xI(t,e="asc"){const n=e,r=$a("orderBy",t);return Tu._create(r,n)}function ef(t,e,n){if(typeof(n=jt(n))=="string"){if(n==="")throw new te(F.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!_m(e)&&n.indexOf("/")!==-1)throw new te(F.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(Ze.fromString(n));if(!ce.isDocumentKey(r))throw new te(F.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return bd(t,new ce(r))}if(n instanceof en)return bd(t,n._key);throw new te(F.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Oa(n)}.`)}function tf(t,e){if(!Array.isArray(t)||t.length===0)throw new te(F.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function wg(t,e){const n=function(s,i){for(const a of s)for(const l of a.getFlattenedFilters())if(i.indexOf(l.op)>=0)return l.op;return null}(t.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new te(F.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new te(F.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}class kI{convertValue(e,n="none"){switch(Hr(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ct(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(zr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw _e()}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){const r={};return Qr(e,(s,i)=>{r[s]=this.convertValue(i,n)}),r}convertVectorValue(e){var n,r,s;const i=(s=(r=(n=e.fields)===null||n===void 0?void 0:n.value.arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(a=>ct(a.doubleValue));return new mu(i)}convertGeoPoint(e){return new pu(ct(e.latitude),ct(e.longitude))}convertArray(e,n){return(e.values||[]).map(r=>this.convertValue(r,n))}convertServerTimestamp(e,n){switch(n){case"previous":const r=Gc(e);return r==null?null:this.convertValue(r,n);case"estimate":return this.convertTimestamp(Ci(e));default:return null}}convertTimestamp(e){const n=Tr(e);return new _t(n.seconds,n.nanos)}convertDocumentKey(e,n){const r=Ze.fromString(e);He(Um(r));const s=new xi(r.get(1),r.get(3)),i=new ce(r.popFirst(5));return s.isEqual(n)||Gn(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Iu(t,e,n){let r;return r=t?n&&(n.merge||n.mergeFields)?t.toFirestore(e,n):t.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class si{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Eg extends _g{constructor(e,n,r,s,i,a){super(e,n,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new Mo(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const r=this._document.data.field($a("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,n.serverTimestamps)}}}class Mo extends Eg{data(e={}){return super.data(e)}}class DI{constructor(e,n,r,s){this._firestore=e,this._userDataWriter=n,this._snapshot=s,this.metadata=new si(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(r=>{e.call(n,new Mo(this._firestore,this._userDataWriter,r.key,r,new si(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new te(F.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(l=>{const c=new Mo(s._firestore,s._userDataWriter,l.doc.key,l.doc,new si(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);return l.doc,{type:"added",doc:c,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(l=>i||l.type!==3).map(l=>{const c=new Mo(s._firestore,s._userDataWriter,l.doc.key,l.doc,new si(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,d=-1;return l.type!==0&&(h=a.indexOf(l.doc.key),a=a.delete(l.doc.key)),l.type!==1&&(a=a.add(l.doc),d=a.indexOf(l.doc.key)),{type:NI(l.type),doc:c,oldIndex:h,newIndex:d}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}}function NI(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return _e()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function VI(t){t=Cn(t,en);const e=Cn(t.firestore,Xr);return pI(La(e),t._key).then(n=>MI(e,t,n))}class bg extends kI{constructor(e){super(),this.firestore=e}convertBytes(e){return new Ns(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new en(this.firestore,null,n)}}function rt(t){t=Cn(t,Yr);const e=Cn(t.firestore,Xr),n=La(e),r=new bg(e);return PI(t._query),mI(n,t._query).then(s=>new DI(e,r,t,s))}function dn(t,e,n){t=Cn(t,en);const r=Cn(t.firestore,Xr),s=Iu(t.converter,e,n);return za(r,[_u(ja(r),"setDoc",t._key,s,t.converter!==null,n).toMutation(t._key,Zt.none())])}function sa(t){return za(Cn(t.firestore,Xr),[new xa(t._key,Zt.none())])}function OI(t,e){const n=Cn(t.firestore,Xr),r=Je(t),s=Iu(t.converter,e);return za(n,[_u(ja(t.firestore),"addDoc",r._key,s,t.converter!==null,{}).toMutation(r._key,Zt.exists(!1))]).then(()=>r)}function za(t,e){return function(r,s){const i=new zn;return r.asyncQueue.enqueueAndForget(async()=>rI(await fI(r),s,i)),i.promise}(La(t),e)}function MI(t,e,n){const r=n.docs.get(e._key),s=new bg(t);return new Eg(t,s,e._key,r,new si(n.hasPendingWrites,n.fromCache),e.converter)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class LI{constructor(e,n){this._firestore=e,this._commitHandler=n,this._mutations=[],this._committed=!1,this._dataReader=ja(e)}set(e,n,r){this._verifyNotCommitted();const s=Dl(e,this._firestore),i=Iu(s.converter,n,r),a=_u(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(a.toMutation(s._key,Zt.none())),this}update(e,n,r,...s){this._verifyNotCommitted();const i=Dl(e,this._firestore);let a;return a=typeof(n=jt(n))=="string"||n instanceof Fa?II(this._dataReader,"WriteBatch.update",i._key,n,r,s):TI(this._dataReader,"WriteBatch.update",i._key,n),this._mutations.push(a.toMutation(i._key,Zt.exists(!0))),this}delete(e){this._verifyNotCommitted();const n=Dl(e,this._firestore);return this._mutations=this._mutations.concat(new xa(n._key,Zt.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new te(F.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function Dl(t,e){if((t=jt(t)).firestore!==e)throw new te(F.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return t}function Tg(){return new yu("serverTimestamp")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ig(t){return La(t=Cn(t,Xr)),new LI(t,e=>za(t,e))}(function(e,n=!0){(function(s){Os=s})(Vs),Rs(new $r("firestore",(r,{instanceIdentifier:s,options:i})=>{const a=r.getProvider("app").getImmediate(),l=new Xr(new OE(r.getProvider("auth-internal")),new UE(r.getProvider("app-check-internal")),function(h,d){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new te(F.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new xi(h.options.projectId,d)}(a,s),a);return i=Object.assign({useFetchStreams:n},i),l._setSettings(i),l},"PUBLIC").setMultipleInstances(!0)),_r(_d,"4.7.3",e),_r(_d,"4.7.3","esm2017")})();function Au(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(t);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(t,r[s])&&(n[r[s]]=t[r[s]]);return n}function Ag(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const FI=Ag,Rg=new ji("auth","Firebase",Ag());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ia=new $c("@firebase/auth");function UI(t,...e){ia.logLevel<=Ne.WARN&&ia.warn(`Auth (${Vs}): ${t}`,...e)}function Lo(t,...e){ia.logLevel<=Ne.ERROR&&ia.error(`Auth (${Vs}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Jn(t,...e){throw Ru(t,...e)}function An(t,...e){return Ru(t,...e)}function Sg(t,e,n){const r=Object.assign(Object.assign({},FI()),{[e]:n});return new ji("auth","Firebase",r).create(e,{appName:t.name})}function vr(t){return Sg(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Ru(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return Rg.create(t,...e)}function ge(t,e,...n){if(!t)throw Ru(e,...n)}function Bn(t){const e="INTERNAL ASSERTION FAILED: "+t;throw Lo(e),new Error(e)}function Yn(t,e){t||Bn(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yc(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.href)||""}function jI(){return nf()==="http:"||nf()==="https:"}function nf(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function BI(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(jI()||hw()||"connection"in navigator)?navigator.onLine:!0}function $I(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qi{constructor(e,n){this.shortDelay=e,this.longDelay=n,Yn(n>e,"Short delay should be less than long delay!"),this.isMobile=lw()||dw()}get(){return BI()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Su(t,e){Yn(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pg{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Bn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Bn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Bn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qI={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zI=new Qi(3e4,6e4);function Ha(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function Us(t,e,n,r,s={}){return Cg(t,s,async()=>{let i={},a={};r&&(e==="GET"?a=r:i={body:JSON.stringify(r)});const l=Bi(Object.assign({key:t.config.apiKey},a)).slice(1),c=await t._getAdditionalHeaders();c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode);const h=Object.assign({method:e,headers:c},i);return uw()||(h.referrerPolicy="no-referrer"),Pg.fetch()(kg(t,t.config.apiHost,n,l),h)})}async function Cg(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},qI),e);try{const s=new HI(t),i=await Promise.race([n(),s.promise]);s.clearNetworkTimeout();const a=await i.json();if("needConfirmation"in a)throw Io(t,"account-exists-with-different-credential",a);if(i.ok&&!("errorMessage"in a))return a;{const l=i.ok?a.errorMessage:a.error.message,[c,h]=l.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw Io(t,"credential-already-in-use",a);if(c==="EMAIL_EXISTS")throw Io(t,"email-already-in-use",a);if(c==="USER_DISABLED")throw Io(t,"user-disabled",a);const d=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw Sg(t,d,h);Jn(t,d)}}catch(s){if(s instanceof Zn)throw s;Jn(t,"network-request-failed",{message:String(s)})}}async function xg(t,e,n,r,s={}){const i=await Us(t,e,n,r,s);return"mfaPendingCredential"in i&&Jn(t,"multi-factor-auth-required",{_serverResponse:i}),i}function kg(t,e,n,r){const s=`${e}${n}?${r}`;return t.config.emulator?Su(t.config,s):`${t.config.apiScheme}://${s}`}class HI{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(An(this.auth,"network-request-failed")),zI.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function Io(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const s=An(t,e,r);return s.customData._tokenResponse=n,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function KI(t,e){return Us(t,"POST","/v1/accounts:delete",e)}async function Dg(t,e){return Us(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function yi(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function WI(t,e=!1){const n=jt(t),r=await n.getIdToken(e),s=Pu(r);ge(s&&s.exp&&s.auth_time&&s.iat,n.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,a=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:yi(Nl(s.auth_time)),issuedAtTime:yi(Nl(s.iat)),expirationTime:yi(Nl(s.exp)),signInProvider:a||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function Nl(t){return Number(t)*1e3}function Pu(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return Lo("JWT malformed, contained fewer than 3 sections"),null;try{const s=zp(n);return s?JSON.parse(s):(Lo("Failed to decode base64 JWT payload"),null)}catch(s){return Lo("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function rf(t){const e=Pu(t);return ge(e,"internal-error"),ge(typeof e.exp<"u","internal-error"),ge(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Mi(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof Zn&&GI(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function GI({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class QI{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vc{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=yi(this.lastLoginAt),this.creationTime=yi(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function oa(t){var e;const n=t.auth,r=await t.getIdToken(),s=await Mi(t,Dg(n,{idToken:r}));ge(s==null?void 0:s.users.length,n,"internal-error");const i=s.users[0];t._notifyReloadListener(i);const a=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?Ng(i.providerUserInfo):[],l=YI(t.providerData,a),c=t.isAnonymous,h=!(t.email&&i.passwordHash)&&!(l!=null&&l.length),d=c?h:!1,p={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:l,metadata:new vc(i.createdAt,i.lastLoginAt),isAnonymous:d};Object.assign(t,p)}async function JI(t){const e=jt(t);await oa(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function YI(t,e){return[...t.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Ng(t){return t.map(e=>{var{providerId:n}=e,r=Au(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function XI(t,e){const n=await Cg(t,{},async()=>{const r=Bi({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=t.config,a=kg(t,s,"/v1/token",`key=${i}`),l=await t._getAdditionalHeaders();return l["Content-Type"]="application/x-www-form-urlencoded",Pg.fetch()(a,{method:"POST",headers:l,body:r})});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function ZI(t,e){return Us(t,"POST","/v2/accounts:revokeToken",Ha(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ws{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ge(e.idToken,"internal-error"),ge(typeof e.idToken<"u","internal-error"),ge(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):rf(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){ge(e.length!==0,"internal-error");const n=rf(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(ge(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:s,expiresIn:i}=await XI(e,n);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:s,expirationTime:i}=n,a=new ws;return r&&(ge(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(ge(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),i&&(ge(typeof i=="number","internal-error",{appName:e}),a.expirationTime=i),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new ws,this.toJSON())}_performRefresh(){return Bn("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function sr(t,e){ge(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class $n{constructor(e){var{uid:n,auth:r,stsTokenManager:s}=e,i=Au(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new QI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new vc(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const n=await Mi(this,this.stsTokenManager.getToken(this.auth,e));return ge(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return WI(this,e)}reload(){return JI(this)}_assign(e){this!==e&&(ge(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new $n(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){ge(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await oa(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(jn(this.auth.app))return Promise.reject(vr(this.auth));const e=await this.getIdToken();return await Mi(this,KI(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,s,i,a,l,c,h,d;const p=(r=n.displayName)!==null&&r!==void 0?r:void 0,g=(s=n.email)!==null&&s!==void 0?s:void 0,y=(i=n.phoneNumber)!==null&&i!==void 0?i:void 0,k=(a=n.photoURL)!==null&&a!==void 0?a:void 0,N=(l=n.tenantId)!==null&&l!==void 0?l:void 0,M=(c=n._redirectEventId)!==null&&c!==void 0?c:void 0,H=(h=n.createdAt)!==null&&h!==void 0?h:void 0,z=(d=n.lastLoginAt)!==null&&d!==void 0?d:void 0,{uid:K,emailVerified:W,isAnonymous:fe,providerData:ie,stsTokenManager:R}=n;ge(K&&R,e,"internal-error");const E=ws.fromJSON(this.name,R);ge(typeof K=="string",e,"internal-error"),sr(p,e.name),sr(g,e.name),ge(typeof W=="boolean",e,"internal-error"),ge(typeof fe=="boolean",e,"internal-error"),sr(y,e.name),sr(k,e.name),sr(N,e.name),sr(M,e.name),sr(H,e.name),sr(z,e.name);const T=new $n({uid:K,auth:e,email:g,emailVerified:W,displayName:p,isAnonymous:fe,photoURL:k,phoneNumber:y,tenantId:N,stsTokenManager:E,createdAt:H,lastLoginAt:z});return ie&&Array.isArray(ie)&&(T.providerData=ie.map(v=>Object.assign({},v))),M&&(T._redirectEventId=M),T}static async _fromIdTokenResponse(e,n,r=!1){const s=new ws;s.updateFromServerResponse(n);const i=new $n({uid:n.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await oa(i),i}static async _fromGetAccountInfoResponse(e,n,r){const s=n.users[0];ge(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Ng(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),l=new ws;l.updateFromIdToken(r);const c=new $n({uid:s.localId,auth:e,stsTokenManager:l,isAnonymous:a}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new vc(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(c,h),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sf=new Map;function qn(t){Yn(t instanceof Function,"Expected a class definition");let e=sf.get(t);return e?(Yn(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,sf.set(t,e),e)}/**
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
 */class Vg{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}Vg.type="NONE";const of=Vg;/**
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
 */function Fo(t,e,n){return`firebase:${t}:${e}:${n}`}class Es{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Fo(this.userKey,s.apiKey,i),this.fullPersistenceKey=Fo("persistence",s.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?$n._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new Es(qn(of),e,r);const s=(await Promise.all(n.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let i=s[0]||qn(of);const a=Fo(r,e.config.apiKey,e.name);let l=null;for(const h of n)try{const d=await h._get(a);if(d){const p=$n._fromJSON(e,d);h!==i&&(l=p),i=h;break}}catch{}const c=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new Es(i,e,r):(i=c[0],l&&await i._set(a,l.toJSON()),await Promise.all(n.map(async h=>{if(h!==i)try{await h._remove(a)}catch{}})),new Es(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function af(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Fg(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Og(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(jg(e))return"Blackberry";if(Bg(e))return"Webos";if(Mg(e))return"Safari";if((e.includes("chrome/")||Lg(e))&&!e.includes("edge/"))return"Chrome";if(Ug(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Og(t=Ut()){return/firefox\//i.test(t)}function Mg(t=Ut()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Lg(t=Ut()){return/crios\//i.test(t)}function Fg(t=Ut()){return/iemobile/i.test(t)}function Ug(t=Ut()){return/android/i.test(t)}function jg(t=Ut()){return/blackberry/i.test(t)}function Bg(t=Ut()){return/webos/i.test(t)}function Cu(t=Ut()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function eA(t=Ut()){var e;return Cu(t)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function tA(){return fw()&&document.documentMode===10}function $g(t=Ut()){return Cu(t)||Ug(t)||Bg(t)||jg(t)||/windows phone/i.test(t)||Fg(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qg(t,e=[]){let n;switch(t){case"Browser":n=af(Ut());break;case"Worker":n=`${af(Ut())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Vs}/${r}`}/**
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
 */class nA{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=i=>new Promise((a,l)=>{try{const c=e(i);a(c)}catch(c){l(c)}});r.onAbort=n,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const s of n)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function rA(t,e={}){return Us(t,"GET","/v2/passwordPolicy",Ha(t,e))}/**
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
 */const sA=6;class iA{constructor(e){var n,r,s,i;const a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=a.minPasswordLength)!==null&&n!==void 0?n:sA,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,s,i,a,l;const c={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,c),this.validatePasswordCharacterOptions(e,c),c.isValid&&(c.isValid=(n=c.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),c.isValid&&(c.isValid=(r=c.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),c.isValid&&(c.isValid=(s=c.containsLowercaseLetter)!==null&&s!==void 0?s:!0),c.isValid&&(c.isValid=(i=c.containsUppercaseLetter)!==null&&i!==void 0?i:!0),c.isValid&&(c.isValid=(a=c.containsNumericCharacter)!==null&&a!==void 0?a:!0),c.isValid&&(c.isValid=(l=c.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),c}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),s&&(n.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oA{constructor(e,n,r,s){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new lf(this),this.idTokenSubscription=new lf(this),this.beforeStateQueue=new nA(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Rg,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=qn(n)),this._initializationPromise=this.queue(async()=>{var r,s;if(!this._deleted&&(this.persistenceManager=await Es.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await Dg(this,{idToken:e}),r=await $n._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(jn(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,l=s==null?void 0:s._redirectEventId,c=await this.tryRedirectSignIn(e);(!a||a===l)&&(c!=null&&c.user)&&(s=c.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(a){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return ge(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await oa(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=$I()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(jn(this.app))return Promise.reject(vr(this));const n=e?jt(e):null;return n&&ge(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&ge(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return jn(this.app)?Promise.reject(vr(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return jn(this.app)?Promise.reject(vr(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(qn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await rA(this),n=new iA(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new ji("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await ZI(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&qn(e)||this._popupRedirectResolver;ge(n,this,"argument-error"),this.redirectPersistenceManager=await Es.create(this,[qn(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,s){if(this._deleted)return()=>{};const i=typeof n=="function"?n:n.next.bind(n);let a=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(ge(l,this,"internal-error"),l.then(()=>{a||i(this.currentUser)}),typeof n=="function"){const c=e.addObserver(n,r,s);return()=>{a=!0,c()}}else{const c=e.addObserver(n);return()=>{a=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ge(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=qg(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(n["X-Firebase-AppCheck"]=s),n}async _getAppCheckToken(){var e;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&UI(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function Ka(t){return jt(t)}class lf{constructor(e){this.auth=e,this.observer=null,this.addObserver=Ew(n=>this.observer=n)}get next(){return ge(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let xu={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function aA(t){xu=t}function lA(t){return xu.loadJS(t)}function cA(){return xu.gapiScript}function uA(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hA(t,e){const n=zc(t,"auth");if(n.isInitialized()){const s=n.getImmediate(),i=n.getOptions();if(Qo(i,e??{}))return s;Jn(s,"already-initialized")}return n.initialize({options:e})}function dA(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(qn);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function fA(t,e,n){const r=Ka(t);ge(r._canInitEmulator,r,"emulator-config-failed"),ge(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!!(n!=null&&n.disableWarnings),i=zg(e),{host:a,port:l}=pA(e),c=l===null?"":`:${l}`;r.config.emulator={url:`${i}//${a}${c}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:a,port:l,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})}),s||mA()}function zg(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function pA(t){const e=zg(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:cf(r.substr(i.length+1))}}else{const[i,a]=r.split(":");return{host:i,port:cf(a)}}}function cf(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function mA(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hg{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return Bn("not implemented")}_getIdTokenResponse(e){return Bn("not implemented")}_linkToIdToken(e,n){return Bn("not implemented")}_getReauthenticationResolver(e){return Bn("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bs(t,e){return xg(t,"POST","/v1/accounts:signInWithIdp",Ha(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gA="http://localhost";class Kr extends Hg{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new Kr(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Jn("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=n,i=Au(n,["providerId","signInMethod"]);if(!r||!s)return null;const a=new Kr(r,s);return a.idToken=i.idToken||void 0,a.accessToken=i.accessToken||void 0,a.secret=i.secret,a.nonce=i.nonce,a.pendingToken=i.pendingToken||null,a}_getIdTokenResponse(e){const n=this.buildRequest();return bs(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,bs(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,bs(e,n)}buildRequest(){const e={requestUri:gA,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Bi(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kg{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Ji extends Kg{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cr extends Ji{constructor(){super("facebook.com")}static credential(e){return Kr._fromParams({providerId:cr.PROVIDER_ID,signInMethod:cr.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return cr.credentialFromTaggedObject(e)}static credentialFromError(e){return cr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return cr.credential(e.oauthAccessToken)}catch{return null}}}cr.FACEBOOK_SIGN_IN_METHOD="facebook.com";cr.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ur extends Ji{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return Kr._fromParams({providerId:ur.PROVIDER_ID,signInMethod:ur.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return ur.credentialFromTaggedObject(e)}static credentialFromError(e){return ur.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return ur.credential(n,r)}catch{return null}}}ur.GOOGLE_SIGN_IN_METHOD="google.com";ur.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hr extends Ji{constructor(){super("github.com")}static credential(e){return Kr._fromParams({providerId:hr.PROVIDER_ID,signInMethod:hr.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return hr.credentialFromTaggedObject(e)}static credentialFromError(e){return hr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return hr.credential(e.oauthAccessToken)}catch{return null}}}hr.GITHUB_SIGN_IN_METHOD="github.com";hr.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dr extends Ji{constructor(){super("twitter.com")}static credential(e,n){return Kr._fromParams({providerId:dr.PROVIDER_ID,signInMethod:dr.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return dr.credentialFromTaggedObject(e)}static credentialFromError(e){return dr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return dr.credential(n,r)}catch{return null}}}dr.TWITTER_SIGN_IN_METHOD="twitter.com";dr.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function _A(t,e){return xg(t,"POST","/v1/accounts:signUp",Ha(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ar{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,s=!1){const i=await $n._fromIdTokenResponse(e,r,s),a=uf(r);return new Ar({user:i,providerId:a,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const s=uf(r);return new Ar({user:e,providerId:s,_tokenResponse:r,operationType:n})}}function uf(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function yA(t){var e;if(jn(t.app))return Promise.reject(vr(t));const n=Ka(t);if(await n._initializationPromise,!((e=n.currentUser)===null||e===void 0)&&e.isAnonymous)return new Ar({user:n.currentUser,providerId:null,operationType:"signIn"});const r=await _A(n,{returnSecureToken:!0}),s=await Ar._fromIdTokenResponse(n,"signIn",r,!0);return await n._updateCurrentUser(s.user),s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aa extends Zn{constructor(e,n,r,s){var i;super(n.code,n.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,aa.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,s){return new aa(e,n,r,s)}}function Wg(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?aa._fromErrorAndOperation(t,i,e,r):i})}async function vA(t,e,n=!1){const r=await Mi(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return Ar._forOperation(t,"link",r)}/**
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
 */async function wA(t,e,n=!1){const{auth:r}=t;if(jn(r.app))return Promise.reject(vr(r));const s="reauthenticate";try{const i=await Mi(t,Wg(r,s,e,t),n);ge(i.idToken,r,"internal-error");const a=Pu(i.idToken);ge(a,r,"internal-error");const{sub:l}=a;return ge(t.uid===l,r,"user-mismatch"),Ar._forOperation(t,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Jn(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function EA(t,e,n=!1){if(jn(t.app))return Promise.reject(vr(t));const r="signIn",s=await Wg(t,r,e),i=await Ar._fromIdTokenResponse(t,r,s);return n||await t._updateCurrentUser(i.user),i}function bA(t,e,n,r){return jt(t).onIdTokenChanged(e,n,r)}function TA(t,e,n){return jt(t).beforeAuthStateChanged(e,n)}const la="__sak";/**
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
 */class Gg{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(la,"1"),this.storage.removeItem(la),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const IA=1e3,AA=10;class Qg extends Gg{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=$g(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),s=this.localCache[n];r!==s&&e(n,s,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((a,l,c)=>{this.notifyListeners(a,c)});return}const r=e.key;n?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!n&&this.localCache[r]===a||this.notifyListeners(r,a)},i=this.storage.getItem(r);tA()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,AA):s()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},IA)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}Qg.type="LOCAL";const RA=Qg;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jg extends Gg{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}Jg.type="SESSION";const Yg=Jg;/**
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
 */function SA(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
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
 */class Wa{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(s=>s.isListeningto(e));if(n)return n;const r=new Wa(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:s,data:i}=n.data,a=this.handlersMap[s];if(!(a!=null&&a.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const l=Array.from(a).map(async h=>h(n.origin,i)),c=await SA(l);n.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:c})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Wa.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ku(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
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
 */class PA{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,a;return new Promise((l,c)=>{const h=ku("",20);s.port1.start();const d=setTimeout(()=>{c(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(p){const g=p;if(g.data.eventId===h)switch(g.data.status){case"ack":clearTimeout(d),i=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),l(g.data.response);break;default:clearTimeout(d),clearTimeout(i),c(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:h,data:n},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rn(){return window}function CA(t){Rn().location.href=t}/**
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
 */function Xg(){return typeof Rn().WorkerGlobalScope<"u"&&typeof Rn().importScripts=="function"}async function xA(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function kA(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)===null||t===void 0?void 0:t.controller)||null}function DA(){return Xg()?self:null}/**
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
 */const Zg="firebaseLocalStorageDb",NA=1,ca="firebaseLocalStorage",e_="fbase_key";class Yi{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function Ga(t,e){return t.transaction([ca],e?"readwrite":"readonly").objectStore(ca)}function VA(){const t=indexedDB.deleteDatabase(Zg);return new Yi(t).toPromise()}function wc(){const t=indexedDB.open(Zg,NA);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(ca,{keyPath:e_})}catch(s){n(s)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(ca)?e(r):(r.close(),await VA(),e(await wc()))})})}async function hf(t,e,n){const r=Ga(t,!0).put({[e_]:e,value:n});return new Yi(r).toPromise()}async function OA(t,e){const n=Ga(t,!1).get(e),r=await new Yi(n).toPromise();return r===void 0?null:r.value}function df(t,e){const n=Ga(t,!0).delete(e);return new Yi(n).toPromise()}const MA=800,LA=3;class t_{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await wc(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>LA)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Xg()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Wa._getInstance(DA()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var e,n;if(this.activeServiceWorker=await xA(),!this.activeServiceWorker)return;this.sender=new PA(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((n=r[0])===null||n===void 0)&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||kA()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await wc();return await hf(e,la,"1"),await df(e,la),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>hf(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>OA(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>df(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=Ga(s,!1).getAll();return new Yi(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),n.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),n.push(s));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),MA)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}t_.type="LOCAL";const FA=t_;new Qi(3e4,6e4);/**
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
 */function UA(t,e){return e?qn(e):(ge(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class Du extends Hg{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return bs(e,this._buildIdpRequest())}_linkToIdToken(e,n){return bs(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return bs(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function jA(t){return EA(t.auth,new Du(t),t.bypassAuthState)}function BA(t){const{auth:e,user:n}=t;return ge(n,e,"internal-error"),wA(n,new Du(t),t.bypassAuthState)}async function $A(t){const{auth:e,user:n}=t;return ge(n,e,"internal-error"),vA(n,new Du(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class n_{constructor(e,n,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:s,tenantId:i,error:a,type:l}=e;if(a){this.reject(a);return}const c={auth:this.auth,requestUri:n,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(c))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return jA;case"linkViaPopup":case"linkViaRedirect":return $A;case"reauthViaPopup":case"reauthViaRedirect":return BA;default:Jn(this.auth,"internal-error")}}resolve(e){Yn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Yn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qA=new Qi(2e3,1e4);class hs extends n_{constructor(e,n,r,s,i){super(e,n,s,i),this.provider=r,this.authWindow=null,this.pollId=null,hs.currentPopupAction&&hs.currentPopupAction.cancel(),hs.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return ge(e,this.auth,"internal-error"),e}async onExecution(){Yn(this.filter.length===1,"Popup operations only handle one event");const e=ku();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(An(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(An(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,hs.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if(!((r=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(An(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,qA.get())};e()}}hs.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zA="pendingRedirect",Uo=new Map;class HA extends n_{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=Uo.get(this.auth._key());if(!e){try{const r=await KA(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}Uo.set(this.auth._key(),e)}return this.bypassAuthState||Uo.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function KA(t,e){const n=QA(e),r=GA(t);if(!await r._isAvailable())return!1;const s=await r._get(n)==="true";return await r._remove(n),s}function WA(t,e){Uo.set(t._key(),e)}function GA(t){return qn(t._redirectPersistence)}function QA(t){return Fo(zA,t.config.apiKey,t.name)}async function JA(t,e,n=!1){if(jn(t.app))return Promise.reject(vr(t));const r=Ka(t),s=UA(r,e),a=await new HA(r,s,n).execute();return a&&!n&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const YA=10*60*1e3;class XA{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!ZA(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!r_(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";n.onError(An(this.auth,s))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=YA&&this.cachedEventUids.clear(),this.cachedEventUids.has(ff(e))}saveEventToCache(e){this.cachedEventUids.add(ff(e)),this.lastProcessedEventTime=Date.now()}}function ff(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function r_({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function ZA(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return r_(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function eR(t,e={}){return Us(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const tR=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,nR=/^https?/;async function rR(t){if(t.config.emulator)return;const{authorizedDomains:e}=await eR(t);for(const n of e)try{if(sR(n))return}catch{}Jn(t,"unauthorized-domain")}function sR(t){const e=yc(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const a=new URL(t);return a.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&a.hostname===r}if(!nR.test(n))return!1;if(tR.test(t))return r===t;const s=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
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
 */const iR=new Qi(3e4,6e4);function pf(){const t=Rn().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function oR(t){return new Promise((e,n)=>{var r,s,i;function a(){pf(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{pf(),n(An(t,"network-request-failed"))},timeout:iR.get()})}if(!((s=(r=Rn().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=Rn().gapi)===null||i===void 0)&&i.load)a();else{const l=uA("iframefcb");return Rn()[l]=()=>{gapi.load?a():n(An(t,"network-request-failed"))},lA(`${cA()}?onload=${l}`).catch(c=>n(c))}}).catch(e=>{throw jo=null,e})}let jo=null;function aR(t){return jo=jo||oR(t),jo}/**
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
 */const lR=new Qi(5e3,15e3),cR="__/auth/iframe",uR="emulator/auth/iframe",hR={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},dR=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function fR(t){const e=t.config;ge(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?Su(e,uR):`https://${t.config.authDomain}/${cR}`,r={apiKey:e.apiKey,appName:t.name,v:Vs},s=dR.get(t.config.apiHost);s&&(r.eid=s);const i=t._getFrameworks();return i.length&&(r.fw=i.join(",")),`${n}?${Bi(r).slice(1)}`}async function pR(t){const e=await aR(t),n=Rn().gapi;return ge(n,t,"internal-error"),e.open({where:document.body,url:fR(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:hR,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const a=An(t,"network-request-failed"),l=Rn().setTimeout(()=>{i(a)},lR.get());function c(){Rn().clearTimeout(l),s(r)}r.ping(c).then(c,()=>{i(a)})}))}/**
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
 */const mR={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},gR=500,_R=600,yR="_blank",vR="http://localhost";class mf{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function wR(t,e,n,r=gR,s=_R){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const c=Object.assign(Object.assign({},mR),{width:r.toString(),height:s.toString(),top:i,left:a}),h=Ut().toLowerCase();n&&(l=Lg(h)?yR:n),Og(h)&&(e=e||vR,c.scrollbars="yes");const d=Object.entries(c).reduce((g,[y,k])=>`${g}${y}=${k},`,"");if(eA(h)&&l!=="_self")return ER(e||"",l),new mf(null);const p=window.open(e||"",l,d);ge(p,t,"popup-blocked");try{p.focus()}catch{}return new mf(p)}function ER(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
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
 */const bR="__/auth/handler",TR="emulator/auth/handler",IR=encodeURIComponent("fac");async function gf(t,e,n,r,s,i){ge(t.config.authDomain,t,"auth-domain-config-required"),ge(t.config.apiKey,t,"invalid-api-key");const a={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:Vs,eventId:s};if(e instanceof Kg){e.setDefaultLanguage(t.languageCode),a.providerId=e.providerId||"",ww(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,p]of Object.entries(i||{}))a[d]=p}if(e instanceof Ji){const d=e.getScopes().filter(p=>p!=="");d.length>0&&(a.scopes=d.join(","))}t.tenantId&&(a.tid=t.tenantId);const l=a;for(const d of Object.keys(l))l[d]===void 0&&delete l[d];const c=await t._getAppCheckToken(),h=c?`#${IR}=${encodeURIComponent(c)}`:"";return`${AR(t)}?${Bi(l).slice(1)}${h}`}function AR({config:t}){return t.emulator?Su(t,TR):`https://${t.authDomain}/${bR}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Vl="webStorageSupport";class RR{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Yg,this._completeRedirectFn=JA,this._overrideRedirectResult=WA}async _openPopup(e,n,r,s){var i;Yn((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const a=await gf(e,n,r,yc(),s);return wR(e,a,ku())}async _openRedirect(e,n,r,s){await this._originValidation(e);const i=await gf(e,n,r,yc(),s);return CA(i),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:s,promise:i}=this.eventManagers[n];return s?Promise.resolve(s):(Yn(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await pR(e),r=new XA(e);return n.register("authEvent",s=>(ge(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(Vl,{type:Vl},s=>{var i;const a=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[Vl];a!==void 0&&n(!!a),Jn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=rR(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return $g()||Mg()||Cu()}}const SR=RR;var _f="@firebase/auth",yf="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class PR{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){ge(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function CR(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function xR(t){Rs(new $r("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:a,authDomain:l}=r.options;ge(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:a,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:qg(t)},h=new oA(r,s,i,c);return dA(h,n),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),Rs(new $r("auth-internal",e=>{const n=Ka(e.getProvider("auth").getImmediate());return(r=>new PR(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),_r(_f,yf,CR(t)),_r(_f,yf,"esm2017")}/**
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
 */const kR=5*60,DR=Wp("authIdTokenMaxAge")||kR;let vf=null;const NR=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>DR)return;const s=n==null?void 0:n.token;vf!==s&&(vf=s,await fetch(t,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function VR(t=Yp()){const e=zc(t,"auth");if(e.isInitialized())return e.getImmediate();const n=hA(t,{popupRedirectResolver:SR,persistence:[FA,RA,Yg]}),r=Wp("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const a=NR(i.toString());TA(n,a,()=>a(n.currentUser)),bA(n,l=>a(l))}}const s=Hp("auth");return s&&fA(n,`http://${s}`),n}function OR(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}aA({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=s=>{const i=An("internal-error");i.customData=s,n(i)},r.type="text/javascript",r.charset="UTF-8",OR().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});xR("Browser");const MR={apiKey:"AIzaSyDCqJRmxKiIzuAhgXsmXICCx_O65aujNa0",authDomain:"impro-selector.firebaseapp.com",projectId:"impro-selector",storageBucket:"impro-selector.appspot.com",messagingSenderId:"730278491306",appId:"1:730278491306:web:c966af1179221e91118cd3",measurementId:"G-3NB062D088"},s_=Jp(MR),pe=yI(s_),LR=VR(s_);yA(LR);const Qa="seasons";async function FR(t,e,n){return await OI(ze(pe,Qa),{name:t,slug:e,pinCode:n,createdAt:Tg()})}async function UR(t){return await sa(Je(pe,Qa,t))}async function Ol(){const t=vg(ze(pe,Qa),xI("createdAt","desc"));return(await rt(t)).docs.map(n=>({id:n.id,...n.data()}))}async function i_(t,e){const n=await VI(Je(pe,Qa,t));return n.exists()?n.data().pinCode===e:!1}const jR={key:0,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},BR={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},$R={class:"text-center mb-6"},qR={class:"text-gray-300"},zR={class:"mb-6"},HR={class:"flex justify-center space-x-3 mb-4"},KR={class:"grid grid-cols-3 gap-3 mb-4"},WR=["onClick"],GR={key:0,class:"mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-center"},QR={class:"flex justify-end space-x-3"},JR=["disabled"],o_={__name:"PinModal",props:{show:{type:Boolean,default:!1},message:{type:String,default:"Veuillez saisir le code PIN à 4 chiffres"},error:{type:String,default:""}},emits:["submit","cancel"],setup(t,{emit:e}){const n=t,r=e,s=oe(""),i=oe("");ys(()=>n.show,g=>{g&&(s.value="",i.value="")});function a(g){s.value.length<4&&(s.value+=g.toString())}function l(){s.value=s.value.slice(0,-1)}function c(){s.value="",i.value=""}function h(){s.value.length===4&&r("submit",s.value)}function d(){r("cancel")}const p=g=>{n.show&&(g.key>="0"&&g.key<="9"?a(parseInt(g.key)):g.key==="Backspace"?l():g.key==="Enter"?h():g.key==="Escape"&&d())};return typeof window<"u"&&window.addEventListener("keydown",p),(g,y)=>t.show?(me(),Ee("div",jR,[b("div",BR,[b("div",$R,[y[1]||(y[1]=b("div",{class:"w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center"},[b("span",{class:"text-2xl"},"🔒")],-1)),y[2]||(y[2]=b("h2",{class:"text-2xl font-bold text-white mb-2"},"Code d'accès requis",-1)),b("p",qR,nt(t.message),1)]),b("div",zR,[b("div",HR,[(me(),Ee(lt,null,wn(4,(k,N)=>b("div",{key:N,class:Li(["w-12 h-12 border-2 border-gray-600 rounded-lg flex items-center justify-center text-2xl font-bold text-white bg-gray-800",{"border-purple-500 bg-purple-900/20":s.value.length>N}])},nt(s.value[N]||"•"),3)),64))]),b("div",KR,[(me(),Ee(lt,null,wn([1,2,3,4,5,6,7,8,9],k=>b("button",{key:k,onClick:N=>a(k),class:"w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-xl transition-all duration-200 hover:scale-105"},nt(k),9,WR)),64)),b("button",{onClick:c,class:"w-12 h-12 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105"}," C "),b("button",{onClick:y[0]||(y[0]=k=>a(0)),class:"w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-xl transition-all duration-200 hover:scale-105"}," 0 "),b("button",{onClick:l,class:"w-12 h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105"}," ← ")])]),i.value||n.error?(me(),Ee("div",GR,nt(i.value||n.error),1)):Tt("",!0),b("div",QR,[b("button",{onClick:d,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),b("button",{onClick:h,disabled:s.value.length!==4,class:"px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"}," Valider ",8,JR)])])])):Tt("",!0)}},YR={class:"min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"},XR={class:"container mx-auto px-4 pb-16"},ZR={class:"flex justify-center mb-12"},eS={class:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto"},tS=["onClick"],nS={class:"text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors"},rS=["onClick"],sS={key:0,class:"text-center py-16"},iS={key:0,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},oS={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},aS={class:"mb-6"},lS={class:"mb-6"},cS={class:"mb-6"},uS={class:"flex justify-end space-x-3"},hS=["disabled"],dS={key:1,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},fS={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},pS={class:"text-center mb-6"},mS={class:"text-gray-300"},gS={__name:"Home",setup(t){const e=oe([]),n=Bp(),r=oe(!1),s=oe(!1),i=oe(""),a=oe(""),l=oe(""),c=oe(null),h=oe(!1),d=oe(null),p=oe("");Oc(async()=>{e.value=await Ol(),console.log("Saisons chargées:",e.value)});function g(T){n.push(`/season/${T}`)}function y(){i.value&&(a.value=i.value.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim("-"))}function k(){l.value=l.value.replace(/[^0-9]/g,""),l.value.length>4&&(l.value=l.value.slice(0,4))}async function N(){if(!i.value.trim()||!a.value.trim()||!l.value.trim()){alert("Veuillez remplir tous les champs, y compris le code PIN à 4 chiffres");return}if(l.value.length!==4){alert("Le code PIN doit contenir exactement 4 chiffres");return}try{await FR(i.value.trim(),a.value.trim(),l.value.trim()),e.value=await Ol(),M()}catch(T){console.error("Erreur lors de la création de la saison:",T),alert("Erreur lors de la création de la saison. Veuillez réessayer.")}}function M(){r.value=!1,i.value="",a.value="",l.value=""}function H(T){c.value=T,s.value=!0}async function z(){s.value=!1,await fe({type:"deleteSeason",data:{seasonId:c.value.id,seasonName:c.value.name}})}function K(){s.value=!1,c.value=null}function W(){return d.value?{deleteSeason:"Suppression de saison - Code PIN requis"}[d.value.type]||"Code PIN requis":"Veuillez saisir le code PIN à 4 chiffres"}async function fe(T){d.value=T,h.value=!0}async function ie(T){var v,S,P;console.log("PIN soumis:",T,"pour l'opération:",d.value);try{const I=((S=(v=d.value)==null?void 0:v.data)==null?void 0:S.seasonId)||((P=c.value)==null?void 0:P.id),ut=await i_(I,T);if(console.log("PIN valide:",ut),ut){console.log("PIN correct, fermeture de la modal et exécution de l'opération"),h.value=!1;const Pe=d.value;d.value=null,console.log("Appel de executePendingOperation avec:",Pe),await E(Pe)}else p.value="Code PIN incorrect",setTimeout(()=>{p.value=""},3e3)}catch(I){console.error("Erreur lors de la vérification du PIN:",I),p.value="Erreur lors de la vérification du code PIN"}}function R(){h.value=!1,d.value=null,p.value=""}async function E(T){if(console.log("executePendingOperation appelé avec:",T),!T){console.log("Aucune opération à exécuter");return}const{type:v,data:S}=T;console.log("Exécution de l'opération:",v,"avec données:",S);try{switch(v){case"deleteSeason":console.log("Suppression de la saison ID:",S.seasonId),await UR(S.seasonId),console.log("Saison supprimée, rechargement de la liste..."),e.value=await Ol(),console.log("Nouvelle liste des saisons:",e.value);break;default:console.log("Type d'opération non reconnu:",v)}}catch(P){console.error("Erreur lors de l'exécution de l'opération:",P),alert("Erreur lors de l'opération. Veuillez réessayer.")}}return(T,v)=>{var S;return me(),Ee("div",YR,[v[20]||(v[20]=b("div",{class:"text-center py-16 px-4"},[b("h1",{class:"text-6xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse"}," Sélections Spectacle "),b("p",{class:"text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"}," Gérez facilement les sélections pour vos spectacles. ")],-1)),b("div",XR,[b("div",ZR,[b("button",{onClick:v[0]||(v[0]=P=>r.value=!0),class:"bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105"}," ✨ Nouvelle saison ")]),b("div",eS,[(me(!0),Ee(lt,null,wn(e.value,P=>(me(),Ee("div",{key:P.id,class:"group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"},[b("div",{onClick:I=>g(P.slug),class:"text-center"},[v[5]||(v[5]=b("div",{class:"w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"},[b("span",{class:"text-2xl"},"🎭")],-1)),b("h2",nS,nt(P.name),1),v[6]||(v[6]=b("div",{class:"w-full bg-gradient-to-r from-transparent via-white/20 to-transparent h-px mb-4"},null,-1)),v[7]||(v[7]=b("p",{class:"text-gray-300 text-sm"}," Cliquez pour accéder ",-1))],8,tS),b("button",{onClick:jc(I=>H(P),["stop"]),class:"absolute top-4 right-4 text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100",title:"Supprimer cette saison"},v[8]||(v[8]=[b("svg",{class:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[b("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})],-1)]),8,rS)]))),128))]),e.value.length===0?(me(),Ee("div",sS,[v[9]||(v[9]=b("div",{class:"w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center"},[b("span",{class:"text-4xl"},"🎪")],-1)),v[10]||(v[10]=b("h3",{class:"text-2xl font-bold text-white mb-4"},"Aucune saison créée",-1)),v[11]||(v[11]=b("p",{class:"text-gray-300 mb-8"},"Commencez par créer votre première saison de spectacles !",-1)),b("button",{onClick:v[1]||(v[1]=P=>r.value=!0),class:"bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-xl hover:shadow-pink-500/25 transition-all duration-300"}," Créer ma première saison ")])):Tt("",!0)]),r.value?(me(),Ee("div",iS,[b("div",oS,[v[16]||(v[16]=b("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✨ Nouvelle saison",-1)),b("div",aS,[v[12]||(v[12]=b("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nom de la saison",-1)),Jt(b("input",{"onUpdate:modelValue":v[2]||(v[2]=P=>i.value=P),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Ex: La Malice 2025-2026",onInput:y},null,544),[[Yt,i.value]])]),b("div",lS,[v[13]||(v[13]=b("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Slug (URL)",-1)),Jt(b("input",{"onUpdate:modelValue":v[3]||(v[3]=P=>a.value=P),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Ex: malice-2025-2026"},null,512),[[Yt,a.value]])]),b("div",cS,[v[14]||(v[14]=b("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Code PIN (4 chiffres)",-1)),Jt(b("input",{"onUpdate:modelValue":v[4]||(v[4]=P=>l.value=P),type:"text",inputmode:"numeric",maxlength:"4",pattern:"[0-9]{4}",autocomplete:"off",autocorrect:"off",autocapitalize:"off",spellcheck:"false",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"1234",onInput:k},null,544),[[Yt,l.value]]),v[15]||(v[15]=b("p",{class:"text-xs text-gray-400 mt-1"},"Ce code protégera les opérations sensibles (suppressions, sélections)",-1))]),b("div",uS,[b("button",{onClick:M,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),b("button",{onClick:N,disabled:!i.value.trim()||!a.value.trim()||!l.value.trim()||l.value.length!==4,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300"}," Créer ",8,hS)])])])):Tt("",!0),s.value?(me(),Ee("div",dS,[b("div",fS,[b("div",pS,[v[17]||(v[17]=b("div",{class:"w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"},[b("span",{class:"text-2xl"},"⚠️")],-1)),v[18]||(v[18]=b("h2",{class:"text-2xl font-bold text-white mb-2"},"Confirmation",-1)),b("p",mS,'Êtes-vous sûr de vouloir supprimer la saison "'+nt((S=c.value)==null?void 0:S.name)+'" ?',1)]),v[19]||(v[19]=b("p",{class:"mb-6 text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-500/20"}," ⚠️ Cette action est irréversible et supprimera toutes les données de cette saison. ",-1)),b("div",{class:"flex justify-end space-x-3"},[b("button",{onClick:K,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),b("button",{onClick:z,class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"}," Supprimer ")])])])):Tt("",!0),St(o_,{show:h.value,message:W(),error:p.value,onSubmit:ie,onCancel:R},null,8,["show","message","error"])])}}};let Kt="mock";const Wr=[{id:"p1",name:"Alice"},{id:"p2",name:"Bob"},{id:"p3",name:"Charlie"},{id:"p4",name:"David"},{id:"p5",name:"Eva"},{id:"p6",name:"Fanny"},{id:"p7",name:"Georges"},{id:"p8",name:"Hélène"},{id:"p9",name:"Ismaël"},{id:"p10",name:"Jade"},{id:"p11",name:"Karim"},{id:"p12",name:"Léa"},{id:"p13",name:"Marc"},{id:"p14",name:"Nina"},{id:"p15",name:"Oscar"}],Gr=[{id:"event1",title:"Apérock Septembre",date:"2025-09-08",description:"Soirée apéro-rock avec ambiance festive"},{id:"event2",title:"Match à Cambo",date:"2025-11-25",description:"Match d'improvisation compétitif à Cambo-les-Bains"},{id:"event3",title:"Impro des Familles",date:"2025-12-02",description:"Spectacle d'improvisation pour toute la famille"},{id:"event4",title:"Cabaret Surprise",date:"2026-01-20",description:"Cabaret avec des surprises et des performances uniques"},{id:"event5",title:"Impro Plage",date:"2026-03-10",description:"Improvisation en plein air avec vue sur la plage"}];function _S(t){Kt=t}async function yS(){if(Kt!=="firebase"||!(await rt(ze(pe,"seasons"))).empty)return;const e=Je(ze(pe,"seasons"));await dn(e,{name:"Malice 2025-2026",slug:"malice-2025-2026",createdAt:Tg()});const n=await rt(ze(pe,"players"));for(const a of n.docs)await dn(Je(e,"players",a.id),a.data());const r=await rt(ze(pe,"events"));for(const a of r.docs)await dn(Je(e,"events",a.id),a.data());const s=await rt(ze(pe,"availability"));for(const a of s.docs)await dn(Je(e,"availability",a.id),a.data());const i=await rt(ze(pe,"selections"));for(const a of i.docs)await dn(Je(e,"selections",a.id),a.data())}async function vS(){Kt==="firebase"&&await yS()}async function wf(t=null){return(Kt==="firebase"?t?(await rt(ze(pe,"seasons",t,"events"))).docs.map(n=>({id:n.id,...n.data()})):(await rt(ze(pe,"events"))).docs.map(n=>({id:n.id,...n.data()})):Gr).sort((n,r)=>{const s=new Date(n.date),i=new Date(r.date);return s<i?-1:s>i?1:n.title.localeCompare(r.title)})}async function Ef(t=null){return(Kt==="firebase"?t?(await rt(ze(pe,"seasons",t,"players"))).docs.map(n=>({id:n.id,...n.data()})):(await rt(ze(pe,"players"))).docs.map(n=>({id:n.id,...n.data()})):Wr).sort((n,r)=>n.order<r.order?-1:n.order>r.order?1:n.name.localeCompare(r.name))}async function wS(t,e=null){if(Kt==="firebase"){const n=Je(e?ze(pe,"seasons",e,"players"):ze(pe,"players"));return await dn(n,{name:t}),n.id}else{const n=`p${Wr.length+1}`;return Wr.push({id:n,name:t}),n}}async function ES(t,e=null){if(Kt==="firebase"){const n=e?Je(pe,"seasons",e,"players",t):Je(pe,"players",t);await sa(n);const r=e?await rt(ze(pe,"seasons",e,"availability")):await rt(ze(pe,"availability")),s=Ig(pe);r.forEach(i=>{const a=i.data();if(a[t]!==void 0){const l={...a};delete l[t],s.update(i.ref,l)}}),await s.commit()}else Wr=Wr.filter(n=>n.id!==t)}async function bS(t,e,n=null){if(Kt==="firebase"){const r=n?Je(pe,"seasons",n,"players",t):Je(pe,"players",t);await dn(r,{name:e})}else{const r=Wr.findIndex(s=>s.id===t);r!==-1&&(Wr[r]=e)}}async function Ao(t,e,n=null){if(Kt==="firebase"){const r=n?await rt(ze(pe,"seasons",n,"availability")):await rt(ze(pe,"availability")),s={};return r.forEach(i=>{s[i.id]=i.data()}),s}else{const r={};return t.forEach(s=>{r[s.name]={},e.forEach(i=>{r[s.name][i.id]=void 0})}),e.forEach(s=>{const i=[...t].sort(()=>.5-Math.random());i.slice(0,4).forEach(a=>{r[a.name][s.id]=!0}),i.slice(4).forEach(a=>{const l=Math.random();r[a.name][s.id]=l<.4?!0:l<.8?!1:void 0})}),r}}async function Ro(t=null){if(Kt==="firebase"){const e=t?await rt(ze(pe,"seasons",t,"selections")):await rt(ze(pe,"selections")),n={};return e.forEach(r=>{n[r.id]=r.data().players||[]}),n}else return{}}async function bf(t,e,n=null){if(Kt==="firebase"){const r=n?Je(pe,"seasons",n,"availability",t):Je(pe,"availability",t);await dn(r,e)}}async function TS(t,e,n=null){if(Kt==="firebase"){const r=n?Je(pe,"seasons",n,"selections",t):Je(pe,"selections",t);await dn(r,{players:e})}}async function IS(t,e=null){if(console.log("Suppression de l'événement:",t),Kt==="firebase")try{console.log("Suppression de l'événement dans Firestore");const n=e?Je(pe,"seasons",e,"events",t):Je(pe,"events",t);await sa(n),console.log("Suppression de la sélection associée");const r=e?Je(pe,"seasons",e,"selections",t):Je(pe,"selections",t);await sa(r),console.log("Suppression des disponibilités");const s=e?await rt(ze(pe,"seasons",e,"availability")):await rt(ze(pe,"availability")),i=Ig(pe);s.forEach(a=>{const l=a.data();if(l[t]!==void 0){console.log("Mise à jour de la disponibilité pour:",a.id);const c={...l};delete c[t],i.update(a.ref,c)}}),await i.commit(),console.log("Opérations de suppression terminées avec succès")}catch(n){throw console.error("Erreur lors de la suppression:",n),n}else Gr=Gr.filter(n=>n.id!==t)}async function AS(t,e=null){if(Kt==="firebase"){const n=Je(e?ze(pe,"seasons",e,"events"):ze(pe,"events"));return await dn(n,t),n.id}else{const n=`event${Gr.length+1}`;return Gr.push({id:n,...t}),n}}async function RS(t,e,n=null){if(Kt==="firebase"){const r=n?Je(pe,"seasons",n,"events",t):Je(pe,"events",t);await dn(r,e)}else{const r=Gr.findIndex(s=>s.id===t);r!==-1&&(Gr[r]={id:t,...e})}}const SS={class:"text-center mb-6"},PS={class:"text-3xl font-bold text-white mb-2"},CS={class:"mb-8"},xS={class:"grid grid-cols-2 gap-4"},kS={class:"bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30"},DS={class:"text-2xl font-bold text-white"},NS={class:"bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-lg border border-cyan-500/30"},VS={class:"text-2xl font-bold text-white"},OS={class:"mt-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30"},MS={class:"text-xl font-bold text-white"},LS={key:1,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},FS={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},US={class:"mb-6"},jS={__name:"PlayerModal",props:{show:{type:Boolean,default:!1},player:{type:Object,default:null},stats:{type:Object,default:()=>({availability:0,selection:0,ratio:0})}},emits:["close","update","delete"],setup(t,{emit:e}){const n=t,r=e,s=oe(!1),i=oe(""),a=oe(null);function l(){r("close")}function c(){var g;i.value=((g=n.player)==null?void 0:g.name)||"",s.value=!0,Dc(()=>{a.value&&a.value.focus()})}function h(){s.value=!1,i.value=""}function d(){var g;i.value.trim()&&(r("update",{playerId:(g=n.player)==null?void 0:g.id,newName:i.value.trim()}),s.value=!1,i.value="")}function p(){var g;r("delete",(g=n.player)==null?void 0:g.id)}return ys(()=>n.show,g=>{g||(s.value=!1,i.value="")}),(g,y)=>{var k;return me(),Ee(lt,null,[t.show?(me(),Ee("div",{key:0,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4",onClick:l},[b("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-2xl",onClick:y[0]||(y[0]=jc(()=>{},["stop"]))},[b("div",SS,[y[2]||(y[2]=b("div",{class:"w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center"},[b("span",{class:"text-3xl"},"👤")],-1)),b("h2",PS,nt((k=t.player)==null?void 0:k.name),1),y[3]||(y[3]=b("p",{class:"text-xl text-purple-300"},"Détails du joueur",-1))]),b("div",CS,[y[7]||(y[7]=b("h3",{class:"text-lg font-semibold text-white mb-4"},"📊 Statistiques",-1)),b("div",xS,[b("div",kS,[b("div",DS,nt(n.stats.availability),1),y[4]||(y[4]=b("div",{class:"text-sm text-gray-300"},"Disponibilités",-1))]),b("div",NS,[b("div",VS,nt(n.stats.selection),1),y[5]||(y[5]=b("div",{class:"text-sm text-gray-300"},"Sélections",-1))])]),b("div",OS,[b("div",MS,nt(n.stats.ratio)+"%",1),y[6]||(y[6]=b("div",{class:"text-sm text-gray-300"},"Taux de sélection",-1))])]),b("div",{class:"flex justify-center space-x-3"},[b("button",{onClick:c,class:"px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center space-x-2"},y[8]||(y[8]=[b("span",null,"✏️",-1),b("span",null,"Modifier",-1)])),b("button",{onClick:p,class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center space-x-2"},y[9]||(y[9]=[b("span",null,"🗑️",-1),b("span",null,"Supprimer",-1)])),b("button",{onClick:l,class:"px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"}," Fermer ")])])])):Tt("",!0),s.value?(me(),Ee("div",LS,[b("div",FS,[y[11]||(y[11]=b("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✏️ Modifier le joueur",-1)),b("div",US,[y[10]||(y[10]=b("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nom",-1)),Jt(b("input",{"onUpdate:modelValue":y[1]||(y[1]=N=>i.value=N),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",onKeydown:[ar(h,["esc"]),ar(d,["enter"])],ref_key:"editNameInput",ref:a},null,544),[[Yt,i.value]])]),b("div",{class:"flex justify-end space-x-3"},[b("button",{onClick:h,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),b("button",{onClick:d,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"}," Sauvegarder ")])])])):Tt("",!0)],64)}}};const BS={class:"min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"},$S={class:"text-center py-8 px-4 relative"},qS={class:"text-4xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"},zS={class:"container mx-auto px-4 pb-16"},HS={class:"sticky top-0 z-50 backdrop-blur-sm bg-black/20 border border-white/20 rounded-t-2xl overflow-hidden"},KS={class:"border-collapse w-full table-fixed"},WS={class:"text-white"},GS={class:"p-4 text-left"},QS={class:"flex flex-col items-center space-y-2"},JS=["onClick"],YS={class:"flex flex-col gap-3"},XS={class:"flex flex-col items-center space-y-2 relative"},ZS={class:"font-bold text-lg text-center whitespace-pre-wrap relative group cursor-pointer"},eP=["title"],tP={class:"bg-black/10"},nP={class:"overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-b-2xl"},rP={class:"table-auto border-collapse w-full table-fixed"},sP=["data-player-id"],iP={class:"p-4 font-medium text-white w-[100px] relative group text-lg"},oP={class:"font-bold text-lg whitespace-pre-wrap flex items-center justify-between"},aP=["onClick","title"],lP=["onClick"],cP={class:"flex items-center justify-center"},uP=["title"],hP=["title"],dP=["title"],fP=["title"],pP={key:0,class:"fixed bottom-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-2xl border border-green-400/30 backdrop-blur-sm z-50"},mP={class:"flex items-center space-x-2"},gP={key:1,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},_P={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},yP={class:"mb-6"},vP={class:"mb-6"},wP={class:"mb-6"},EP={class:"mb-6"},bP={key:2,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},TP={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},IP={class:"mb-6"},AP={class:"flex justify-end space-x-3"},RP={key:3,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},SP={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},PP={class:"flex justify-end space-x-3"},CP={key:4,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},xP={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},kP={class:"flex justify-end space-x-3"},DP={key:5,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},NP={key:6,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},VP={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-2xl"},OP={class:"text-center mb-6"},MP={class:"text-gray-300"},LP={class:"mb-6"},FP={class:"relative"},UP=["title"],jP={key:0,class:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},BP={key:1,class:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},$P={class:"mb-6"},qP={class:"grid grid-cols-2 md:grid-cols-3 gap-3"},zP={class:"text-white font-medium"},HP={class:"text-center mb-6"},KP={class:"text-3xl font-bold text-white mb-2"},WP={class:"text-xl text-purple-300"},GP={key:0,class:"mb-6"},QP={class:"text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-600/50"},JP={class:"mb-6"},YP={class:"grid grid-cols-3 gap-4"},XP={class:"bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30"},ZP={class:"text-2xl font-bold text-white"},eC={class:"bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-lg border border-cyan-500/30"},tC={class:"text-2xl font-bold text-white"},nC={class:"bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30"},rC={class:"text-2xl font-bold text-white"},sC={class:"flex justify-center space-x-3"},iC=["title"],oC={key:8,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},aC={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},lC={class:"mb-6"},cC={class:"mb-6"},uC={class:"mb-6"},hC={class:"mb-6"},dC={__name:"GridBoard",props:{slug:{type:String,required:!0}},setup(t){const e=t,n=Bp();e.slug;const r=oe(""),s=oe(""),i=oe(!1),a=oe(null),l=oe(null),c=oe(""),h=oe(""),d=oe(6),p=oe(!1),g=oe(""),y=oe(null),k=oe(!1),N=oe(null),M=oe(!1),H=oe(null),z=oe(!1),K=oe(null),W=oe(""),fe=oe(!1),ie=oe(null),R=oe(""),E=oe(!1),T=oe(""),v=oe([]),S=oe(""),P=oe(!1),I=oe("Copier le message");function ut(V){y.value=V;const A=document.querySelector(`[data-player-id="${V}"]`);A&&A.scrollIntoView({behavior:"smooth",block:"center"}),Pe.value=!0,Me.value="Nouveau joueur ajouté !",setTimeout(()=>{Pe.value=!1},3e3)}const Pe=oe(!1),Me=oe("");async function Ce(V){await xn({type:"deleteEvent",data:{eventId:V}})}async function Re(V=null){const A=V||a.value;if(console.log("deleteEventConfirmed - eventId param:",V),console.log("deleteEventConfirmed - eventToDelete.value:",a.value),console.log("deleteEventConfirmed - eventIdToDelete:",A),console.log("deleteEventConfirmed - type de eventIdToDelete:",typeof A),!A){console.error("Aucun événement à supprimer");return}try{await IS(A,s.value),de.value=de.value.filter(q=>q.id!==A),await Promise.all([wf(s.value),Ao(_.value,de.value,s.value),Ro(s.value)]).then(([q,Ae,Oe])=>{de.value=q,w.value=Ae,x.value=Oe}),i.value=!1,a.value=null,Pe.value=!0,Me.value="Événement supprimé avec succès !",setTimeout(()=>{Pe.value=!1},3e3)}catch(q){console.error("Erreur lors de la suppression de l'événement:",q),alert("Erreur lors de la suppression de l'événement. Veuillez réessayer.")}}function Bt(){i.value=!1,a.value=null}async function $t(){if(!l.value||!c.value.trim()||!h.value)return;const V=parseInt(d.value);if(isNaN(V)||V<1||V>20){alert("Le nombre de joueurs doit être un nombre entier entre 1 et 20");return}try{const A={title:c.value.trim(),date:h.value,description:R.value.trim()||"",playerCount:V};await RS(l.value,A,s.value),await Promise.all([wf(s.value),Ao(_.value,de.value,s.value),Ro(s.value)]).then(([q,Ae,Oe])=>{de.value=q,w.value=Ae,x.value=Oe}),l.value=null,c.value="",h.value="",R.value="",d.value=6,Pe.value=!0,Me.value="Événement mis à jour avec succès !",setTimeout(()=>{Pe.value=!1},3e3)}catch(A){console.error("Erreur lors de l'édition de l'événement:",A),alert("Erreur lors de l'édition de l'événement. Veuillez réessayer.")}}async function Wt(){if(g.value.trim())try{const V=g.value.trim(),A=await wS(V,s.value);await Promise.all([Ef(s.value),Ao(_.value,de.value,s.value),Ro(s.value)]).then(([q,Ae,Oe])=>{_.value=q,w.value=Ae,x.value=Oe;const De=_.value.find(Le=>Le.id===A);ut(A);const ve=document.querySelector(`[data-player-id="${A}"]`);ve&&ve.scrollIntoView({behavior:"smooth",block:"center"}),Pe.value=!0,Me.value="Joueur ajouté avec succès ! Vous pouvez maintenant indiquer sa disponibilité.",setTimeout(()=>{Pe.value=!1},3e3),setTimeout(()=>{Pe.value=!1,Me.value=""},5e3)}),p.value=!1,g.value=""}catch(V){console.error("Erreur lors de l'ajout du joueur:",V),alert("Erreur lors de l'ajout du joueur. Veuillez réessayer.")}}function qe(){l.value=null,c.value="",h.value="",R.value="",d.value=6}oe(null);const Ke=oe(!1),qt=oe(""),wt=oe(""),ht=oe(""),O=oe(6);async function ee(){if(!qt.value.trim()||!wt.value){alert("Veuillez remplir le titre et la date de l'événement");return}const V=parseInt(O.value);if(isNaN(V)||V<1||V>20){alert("Le nombre de joueurs doit être un nombre entier entre 1 et 20");return}const A={title:qt.value.trim(),date:wt.value,description:ht.value.trim()||"",playerCount:V};await Z(A)}async function Z(V){try{const A=await AS(V,s.value);de.value=[...de.value,{id:A,...V}];const q={};for(const Ae of _.value)q[Ae.name]=w.value[Ae.name]||{},q[Ae.name][A]=null,await bf(Ae.name,q[Ae.name],s.value);qt.value="",wt.value="",ht.value="",O.value=6,Ke.value=!1,await Promise.resolve(),Pe.value=!0,Me.value="Événement créé avec succès !",setTimeout(()=>{Pe.value=!1},3e3)}catch(A){console.error("Erreur lors de la création de l'événement:",A),alert("Erreur lors de la création de l'événement. Veuillez réessayer.")}}function re(){qt.value="",wt.value="",ht.value="",O.value=6,Ke.value=!1}async function Se(){await xn({type:"addEvent",data:{}})}const de=oe([]),_=oe([]),w=oe({}),x=oe({}),U=oe({}),L=oe({});Oc(async()=>{_S("firebase"),await vS();const V=vg(ze(pe,"seasons"),CI("slug","==",e.slug)),A=await rt(V);if(!A.empty){const q=A.docs[0];s.value=q.id,r.value=q.data().name,document.title=`Saison : ${r.value}`}if(s.value){const q=await rt(ze(pe,"seasons",s.value,"players"));_.value=q.docs.map(ot=>({id:ot.id,...ot.data()}));const Ae=await rt(ze(pe,"seasons",s.value,"events"));de.value=Ae.docs.map(ot=>({id:ot.id,...ot.data(),playerCount:ot.data().playerCount||6}));const Oe=await rt(ze(pe,"seasons",s.value,"availability")),De={};Oe.docs.forEach(ot=>{De[ot.id]=ot.data()}),w.value=De;const ve=await rt(ze(pe,"seasons",s.value,"selections")),Le={};ve.docs.forEach(ot=>{Le[ot.id]=ot.data().players||[]}),x.value=Le}it(),xt(),console.log("players (deduplicated):",_.value.map(q=>({id:q.id,name:q.name})))});function j(V,A){const q=_.value.find(ve=>ve.name===V);if(!q){console.error("Joueur non trouvé:",V);return}if(!de.value.find(ve=>ve.id===A)){console.error("Événement non trouvé:",A);return}q.availabilities||(q.availabilities={});const Oe=q.availabilities[A];let De;Oe==="oui"?(De="non",q.availabilities[A]=De):Oe==="non"?(delete q.availabilities[A],De=void 0):(De="oui",q.availabilities[A]=De),De===void 0?w.value[q.name]&&delete w.value[q.name][A]:(w.value[q.name]||(w.value[q.name]={}),w.value[q.name][A]=De==="oui"),bf(q.name,{...q.availabilities},s.value).then(()=>{Pe.value=!0,Me.value="Disponibilité mise à jour avec succès !",setTimeout(()=>{Pe.value=!1},3e3)}).catch(ve=>{console.error("Erreur lors de la mise à jour de la disponibilité:",ve),alert("Erreur lors de la mise à jour de la disponibilité. Veuillez réessayer.")})}function J(V,A){var q;return(q=w.value[V])==null?void 0:q[A]}function Q(V,A){var Oe;const q=x.value[A]||[],Ae=(Oe=w.value[V])==null?void 0:Oe[A];return q.includes(V)&&Ae===!0}async function G(V,A=6){const Ae=_.value.filter(ve=>J(ve.name,V)).map(ve=>{const Le=ne(ve.name);return{name:ve.name,weight:1/(1+Le)}}),Oe=[],De=[...Ae];for(;Oe.length<A&&De.length>0;){const ve=De.reduce((Dn,le)=>Dn+le.weight,0);let Le=Math.random()*ve;const ot=De.findIndex(Dn=>(Le-=Dn.weight,Le<=0));ot>=0&&(Oe.push(De[ot].name),De.splice(ot,1))}x.value[V]=Oe,await TS(V,Oe,s.value),it(),xt()}async function $(V,A=6){await G(V,A);const q=de.value.find(Le=>Le.id===V),Ae=x.value[V]||[],Oe=Ae.length>0,De=X(q.date),ve=Ae.join(", ");Oe?(T.value="Attention, nouvelle sélection effectuée !",S.value=`Attention, nouvelle sélection pour ${q.title} du ${De} : ${ve}`):(T.value="Sélection effectuée avec succès !",S.value=`Sélection pour ${q.title} du ${De} : ${ve}`),v.value=Ae,E.value=!0}function ae(V){var q;return V?(typeof V=="string"?new Date(V):((q=V.toDate)==null?void 0:q.call(V))||V).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}):""}function X(V){var q;return V?(typeof V=="string"?new Date(V):((q=V.toDate)==null?void 0:q.call(V))||V).toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"}):""}function ne(V){return Object.values(x.value).filter(A=>A.includes(V)).length}function ue(V){const A=w.value[V]||{};return Object.values(A).filter(q=>q===!0).length}function he(V){return V?Object.values(w.value).filter(A=>A[V]===!0).length:0}function we(V){return V?(x.value[V]||[]).length:0}function xe(V){const A=ue(V),q=ne(V);return A===0?0:q/A}function mt(V){U.value[V]={availability:ue(V),selection:ne(V),ratio:xe(V)}}function it(){_.value.forEach(V=>mt(V.name))}function xt(){const V={};de.value.forEach(A=>{const q=A.playerCount||6,Oe=_.value.filter(ve=>J(ve.name,A.id)===!0).map(ve=>{const Le=ne(ve.name);return{name:ve.name,weight:1/(1+Le)}}),De=Oe.reduce((ve,Le)=>ve+Le.weight,0);Oe.forEach(ve=>{const Le=Math.min(1,ve.weight/De*q);V[ve.name]||(V[ve.name]={}),V[ve.name][A.id]=Math.round(Le*100)})}),L.value=V}function et(V,A){var ve,Le;const q=V.name,Ae=J(q,A),Oe=Q(q,A),De=((Le=(ve=L.value)==null?void 0:ve[q])==null?void 0:Le[A])??0;return Ae===!1?"Non disponible – cliquez pour changer":Oe?`Sélectionné · Chance estimée : ${De}%`:Ae===!0?`Disponible · Chance estimée : ${De}%`:"Cliquez pour indiquer votre disponibilité"}const tn=oe(null),_n=oe(!1);async function gt(V=null){const A=V||tn.value;if(!A){console.error("Aucun joueur à supprimer");return}try{await ES(A,s.value),_.value=_.value.filter(q=>q.id!==A),_n.value=!1,tn.value=null,Pe.value=!0,Me.value="Joueur supprimé avec succès !",setTimeout(()=>{Pe.value=!1},3e3)}catch(q){console.error("Erreur lors de la suppression du joueur :",q),alert("Erreur lors de la suppression du joueur. Veuillez réessayer.")}}function Gt(){_n.value=!1,tn.value=null}async function Zr(V){er(),await xn({type:"deletePlayer",data:{playerId:V}})}async function js(V,A=null){if(A===null){const q=de.value.find(Ae=>Ae.id===V);A=(q==null?void 0:q.playerCount)||6}x.value[V]&&x.value[V].length>0?await xn({type:"launchSelection",data:{eventId:V,count:A}}):await xn({type:"launchSelection",data:{eventId:V,count:A}})}async function Xi(){if(N.value){const V=de.value.find(q=>q.id===N.value),A=(V==null?void 0:V.playerCount)||6;await $(N.value,A),k.value=!1,N.value=null}}function Zi(){k.value=!1,N.value=null}function Cr(){return K.value?{deleteEvent:"Suppression d'événement - Code PIN requis",addEvent:"Ajout d'événement - Code PIN requis",deletePlayer:"Suppression de joueur - Code PIN requis",launchSelection:"Lancement de sélection - Code PIN requis"}[K.value.type]||"Code PIN requis":"Veuillez saisir le code PIN à 4 chiffres"}async function xn(V){K.value=V,z.value=!0}async function Bs(V){try{if(await i_(s.value,V)){z.value=!1;const q=K.value;K.value=null,await eo(q)}else W.value="Code PIN incorrect",setTimeout(()=>{W.value=""},3e3)}catch(A){console.error("Erreur lors de la vérification du PIN:",A),W.value="Erreur lors de la vérification du code PIN"}}function kn(){z.value=!1,K.value=null,W.value=""}async function eo(V){if(!V)return;const{type:A,data:q}=V;try{switch(A){case"deleteEvent":console.log("executePendingOperation - data.eventId:",q.eventId),console.log("executePendingOperation - type de data.eventId:",typeof q.eventId),a.value=q.eventId,i.value=!0;break;case"addEvent":Ke.value=!0;break;case"deletePlayer":tn.value=q.playerId,_n.value=!0;break;case"launchSelection":x.value[q.eventId]&&x.value[q.eventId].length>0?(N.value=q.eventId,k.value=!0,fe.value=!1):(await $(q.eventId,q.count),fe.value=!1);break}}catch(Ae){console.error("Erreur lors de l'exécution de l'opération:",Ae),Pe.value=!0,Me.value="Erreur lors de l'opération. Veuillez réessayer.",setTimeout(()=>{Pe.value=!1},3e3)}}function es(){n.push("/")}function to(V){ie.value=V,R.value=V.description||"",fe.value=!0}function xr(){fe.value=!1,ie.value=null,R.value=""}function no(){l.value=ie.value.id,c.value=ie.value.title,h.value=ie.value.date,R.value=ie.value.description||"",d.value=ie.value.playerCount||6,fe.value=!1}function Et(){const V=S.value;navigator.clipboard.writeText(V).then(()=>{P.value=!0,I.value="Copié !",setTimeout(()=>{P.value=!1,I.value="Copier le message"},2e3)}).catch(A=>{console.error("Erreur lors de la copie du texte:",A),alert("Impossible de copier le message.")})}function ro(){E.value=!1,T.value="",v.value=[],S.value="",P.value=!1,I.value="Copier le message"}function kr(V){H.value=V,M.value=!0}function er(){M.value=!1,H.value=null}async function Ja({playerId:V,newName:A}){try{await bS(V,A,s.value),await Promise.all([Ef(s.value),Ao(_.value,de.value,s.value),Ro(s.value)]).then(([q,Ae,Oe])=>{if(_.value=q,w.value=Ae,x.value=Oe,H.value&&H.value.id===V){const De=q.find(ve=>ve.id===V);De&&(H.value=De)}}),Pe.value=!0,Me.value="Joueur mis à jour avec succès !",setTimeout(()=>{Pe.value=!1},3e3)}catch(q){console.error("Erreur lors de l'édition du joueur:",q),alert("Erreur lors de l'édition du joueur. Veuillez réessayer.")}}function Ya(V){if(!V)return{availability:0,selection:0,ratio:0};const A=ue(V.name),q=ne(V.name),Ae=A===0?0:Math.round(q/A*100);return{availability:A,selection:q,ratio:Ae}}return(V,A)=>{var q,Ae,Oe,De,ve,Le,ot,Dn;return me(),Ee(lt,null,[b("div",BS,[b("div",$S,[b("button",{onClick:es,class:"absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10",title:"Retour à l'accueil"},A[17]||(A[17]=[b("svg",{class:"w-8 h-8",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[b("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M15 19l-7-7 7-7"})],-1)])),b("h1",qS,nt(r.value?r.value:"Chargement..."),1),A[18]||(A[18]=b("p",{class:"text-gray-300"},"Gestion des sélections et disponibilités",-1))]),b("div",zS,[b("div",HS,[b("table",KS,[b("colgroup",null,[A[19]||(A[19]=b("col",{style:{width:"15%"}},null,-1)),(me(!0),Ee(lt,null,wn(de.value,(le,Ye)=>(me(),Ee("col",{key:Ye,style:vi("width: calc(80% / "+de.value.length+");")},null,4))),128)),A[20]||(A[20]=b("col",{style:{width:"5%"}},null,-1))]),b("thead",null,[b("tr",WS,[b("th",GS,[b("div",QS,[A[22]||(A[22]=b("span",{class:"font-bold text-lg relative group"},[b("span",{class:"border-b-2 border-dashed border-purple-400"}," Joueurs ")],-1)),b("button",{onClick:A[0]||(A[0]=le=>p.value=!0),class:"flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-sm font-medium",title:"Ajouter un nouveau joueur"},A[21]||(A[21]=[b("span",{class:"text-lg"},"➕",-1),b("span",null,"S'ajouter",-1)]))])]),(me(!0),Ee(lt,null,wn(de.value,le=>(me(),Ee("th",{key:le.id,class:"p-4 text-center",onClick:Ye=>to(le)},[b("div",YS,[b("div",XS,[b("div",ZS,[b("span",{class:"hover:border-b-2 hover:border-dashed hover:border-purple-400 transition-colors duration-200 text-white",title:"Cliquez pour voir les détails : "+le.title},nt(ae(le.date)),9,eP)])])])],8,JS))),128)),b("th",{class:"p-4 text-center"},[b("button",{onClick:Se,class:"text-2xl text-purple-400 hover:text-pink-400 hover:scale-110 transition-all duration-200",title:"Ajouter un nouvel événement"}," ✨ ")])]),b("tr",tP,[A[23]||(A[23]=b("th",{class:"p-4 text-left w-[100px]"},null,-1)),(me(!0),Ee(lt,null,wn(de.value,le=>(me(),Ee("th",{key:le.id,class:"p-4 text-center w-40"}))),128)),A[24]||(A[24]=b("th",{class:"p-4"},null,-1))])])])]),b("div",nP,[b("table",rP,[b("colgroup",null,[A[25]||(A[25]=b("col",{style:{width:"15%"}},null,-1)),(me(!0),Ee(lt,null,wn(de.value,(le,Ye)=>(me(),Ee("col",{key:Ye,style:vi("width: calc(80% / "+de.value.length+");")},null,4))),128)),A[26]||(A[26]=b("col",{style:{width:"5%"}},null,-1))]),b("tbody",null,[(me(!0),Ee(lt,null,wn(_.value,le=>(me(),Ee("tr",{key:le.id,class:Li(["border-b border-white/10 hover:bg-white/5 transition-all duration-200",{"highlighted-player":le.id===y.value}]),"data-player-id":le.id},[b("td",iP,[b("div",oP,[b("span",{onClick:Ye=>kr(le),class:"hover:border-b-2 hover:border-dashed hover:border-purple-400 cursor-pointer transition-colors duration-200",title:"Cliquez pour voir les détails : "+le.name},nt(le.name),9,aP)])]),(me(!0),Ee(lt,null,wn(de.value,Ye=>(me(),Ee("td",{key:Ye.id,class:"p-4 text-center cursor-pointer hover:bg-white/10 transition-all duration-200",onClick:Xa=>j(le.name,Ye.id)},[b("div",cP,[Q(le.name,Ye.id)?(me(),Ee("span",{key:0,class:"text-2xl hover:scale-110 transition-transform duration-200",title:et(le,Ye.id)}," 🎭 ",8,uP)):J(le.name,Ye.id)?(me(),Ee("span",{key:1,class:"text-2xl hover:scale-110 transition-transform duration-200",title:et(le,Ye.id)}," ✅ ",8,hP)):J(le.name,Ye.id)===!1?(me(),Ee("span",{key:2,class:"text-2xl hover:scale-110 transition-transform duration-200",title:et(le,Ye.id)}," ❌ ",8,dP)):(me(),Ee("span",{key:3,class:"text-gray-500 hover:text-white transition-colors duration-200",title:et(le,Ye.id)}," – ",8,fP))])],8,lP))),128)),A[27]||(A[27]=b("td",{class:"p-4"},null,-1))],10,sP))),128))])])])])]),Pe.value?(me(),Ee("div",pP,[b("div",mP,[A[28]||(A[28]=b("span",{class:"text-xl"},"✨",-1)),b("span",null,nt(Me.value),1)])])):Tt("",!0),Ke.value?(me(),Ee("div",gP,[b("div",_P,[A[33]||(A[33]=b("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✨ Nouvel événement",-1)),b("div",yP,[A[29]||(A[29]=b("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Titre",-1)),Jt(b("input",{"onUpdate:modelValue":A[1]||(A[1]=le=>qt.value=le),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Titre de l'événement"},null,512),[[Yt,qt.value]])]),b("div",vP,[A[30]||(A[30]=b("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Date",-1)),Jt(b("input",{"onUpdate:modelValue":A[2]||(A[2]=le=>wt.value=le),type:"date",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"},null,512),[[Yt,wt.value]])]),b("div",wP,[A[31]||(A[31]=b("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Description",-1)),Jt(b("textarea",{"onUpdate:modelValue":A[3]||(A[3]=le=>ht.value=le),class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",rows:"3",placeholder:"Description de l'événement (optionnel)"},null,512),[[Yt,ht.value]])]),b("div",EP,[A[32]||(A[32]=b("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nombre de joueurs à sélectionner",-1)),Jt(b("input",{"onUpdate:modelValue":A[4]||(A[4]=le=>O.value=le),type:"number",min:"1",max:"20",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white",placeholder:"6"},null,512),[[Yt,O.value]])]),b("div",{class:"flex justify-end space-x-3"},[b("button",{onClick:re,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),b("button",{onClick:ee,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"}," Créer ")])])])):Tt("",!0),p.value?(me(),Ee("div",bP,[b("div",TP,[A[35]||(A[35]=b("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✨ Nouveau joueur",-1)),b("div",IP,[A[34]||(A[34]=b("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nom",-1)),Jt(b("input",{"onUpdate:modelValue":A[5]||(A[5]=le=>g.value=le),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Nom du joueur"},null,512),[[Yt,g.value]])]),b("div",AP,[b("button",{onClick:A[6]||(A[6]=le=>p.value=!1),class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),b("button",{onClick:Wt,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"}," Ajouter ")])])])):Tt("",!0),i.value?(me(),Ee("div",RP,[b("div",SP,[A[36]||(A[36]=gl('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">⚠️</span></div><h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2><p class="text-gray-300">Êtes-vous sûr de vouloir supprimer cet événement ?</p></div>',1)),b("div",PP,[b("button",{onClick:Bt,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),b("button",{onClick:A[7]||(A[7]=()=>Re()),class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"}," Supprimer ")])])])):Tt("",!0),_n.value?(me(),Ee("div",CP,[b("div",xP,[A[37]||(A[37]=gl('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">⚠️</span></div><h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2><p class="text-gray-300">Êtes-vous sûr de vouloir supprimer ce joueur ?</p></div>',1)),b("div",kP,[b("button",{onClick:Gt,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"},"Annuler"),b("button",{onClick:A[8]||(A[8]=()=>gt()),class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"},"Supprimer")])])])):Tt("",!0),k.value?(me(),Ee("div",DP,[b("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},[A[38]||(A[38]=gl('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">🎭</span></div><h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2><p class="text-gray-300">Attention, toute la sélection sera refaite en fonction des disponibilités actuelles.</p></div><p class="mb-6 text-sm text-yellow-400 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/20"> ⚠️ Pensez à prévenir les gens du changement ! </p>',2)),b("div",{class:"flex justify-end space-x-3"},[b("button",{onClick:Zi,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"},"Annuler"),b("button",{onClick:Xi,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"},"Confirmer")])])])):Tt("",!0),E.value?(me(),Ee("div",NP,[b("div",VP,[b("div",OP,[A[39]||(A[39]=b("div",{class:"w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center"},[b("span",{class:"text-3xl"},"🎉")],-1)),A[40]||(A[40]=b("h2",{class:"text-2xl font-bold text-white mb-2"},"Sélection effectuée !",-1)),b("p",MP,nt(T.value),1)]),b("div",LP,[A[43]||(A[43]=b("h3",{class:"text-lg font-semibold text-white mb-3"},"Message à envoyer :",-1)),b("div",FP,[Jt(b("textarea",{"onUpdate:modelValue":A[9]||(A[9]=le=>S.value=le),class:"w-full p-4 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none",rows:"4",readonly:""},null,512),[[Yt,S.value]]),b("button",{onClick:Et,class:"absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-2 hover:from-purple-600 hover:to-pink-700 transition-all duration-300",title:I.value},[P.value?(me(),Ee("svg",BP,A[42]||(A[42]=[b("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M5 13l4 4L19 7"},null,-1)]))):(me(),Ee("svg",jP,A[41]||(A[41]=[b("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"},null,-1)])))],8,UP)])]),b("div",$P,[A[44]||(A[44]=b("h3",{class:"text-lg font-semibold text-white mb-3"},"Joueurs sélectionnés :",-1)),b("div",qP,[(me(!0),Ee(lt,null,wn(v.value,le=>(me(),Ee("div",{key:le,class:"bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 rounded-lg border border-purple-500/30 text-center"},[b("span",zP,nt(le),1)]))),128))])]),b("div",{class:"flex justify-center"},[b("button",{onClick:ro,class:"px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300"}," Parfait ! 👍 ")])])])):Tt("",!0),fe.value?(me(),Ee("div",{key:7,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4",onClick:xr},[b("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-2xl",onClick:A[12]||(A[12]=jc(()=>{},["stop"]))},[b("div",HP,[A[45]||(A[45]=b("div",{class:"w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center"},[b("span",{class:"text-3xl"},"🎭")],-1)),b("h2",KP,nt((q=ie.value)==null?void 0:q.title),1),b("p",WP,nt(X((Ae=ie.value)==null?void 0:Ae.date)),1)]),(Oe=ie.value)!=null&&Oe.description?(me(),Ee("div",GP,[A[46]||(A[46]=b("h3",{class:"text-lg font-semibold text-white mb-3"},"Description",-1)),b("p",QP,nt(ie.value.description),1)])):Tt("",!0),b("div",JP,[A[50]||(A[50]=b("h3",{class:"text-lg font-semibold text-white mb-3"},"Statistiques",-1)),b("div",YP,[b("div",XP,[b("div",ZP,nt(he((De=ie.value)==null?void 0:De.id)),1),A[47]||(A[47]=b("div",{class:"text-sm text-gray-300"},"Disponibles",-1))]),b("div",eC,[b("div",tC,nt(we((ve=ie.value)==null?void 0:ve.id)),1),A[48]||(A[48]=b("div",{class:"text-sm text-gray-300"},"Sélectionnés",-1))]),b("div",nC,[b("div",rC,nt(((Le=ie.value)==null?void 0:Le.playerCount)||6),1),A[49]||(A[49]=b("div",{class:"text-sm text-gray-300"},"À sélectionner",-1))])])]),b("div",sC,[b("button",{onClick:no,class:"px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center space-x-2"},A[51]||(A[51]=[b("span",null,"✏️",-1),b("span",null,"Modifier",-1)])),b("button",{onClick:A[10]||(A[10]=le=>{var Ye;return js((Ye=ie.value)==null?void 0:Ye.id)}),class:"px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2",title:x.value[(ot=ie.value)==null?void 0:ot.id]&&x.value[(Dn=ie.value)==null?void 0:Dn.id].length>0?"Relancer la sélection":"Lancer la sélection"},A[52]||(A[52]=[b("span",null,"🎭",-1),b("span",null,"Sélection",-1)]),8,iC),b("button",{onClick:A[11]||(A[11]=le=>{var Ye;return Ce((Ye=ie.value)==null?void 0:Ye.id)}),class:"px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center space-x-2"},A[53]||(A[53]=[b("span",null,"🗑️",-1),b("span",null,"Supprimer",-1)]))])])])):Tt("",!0),l.value?(me(),Ee("div",oC,[b("div",aC,[A[58]||(A[58]=b("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✏️ Modifier l'événement",-1)),b("div",lC,[A[54]||(A[54]=b("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Titre",-1)),Jt(b("input",{"onUpdate:modelValue":A[13]||(A[13]=le=>c.value=le),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",onKeydown:[ar(qe,["esc"]),ar($t,["enter"])],ref:"editTitleInput"},null,544),[[Yt,c.value]])]),b("div",cC,[A[55]||(A[55]=b("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Date",-1)),Jt(b("input",{"onUpdate:modelValue":A[14]||(A[14]=le=>h.value=le),type:"date",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white",onKeydown:[ar(qe,["esc"]),ar($t,["enter"])]},null,544),[[Yt,h.value]])]),b("div",uC,[A[56]||(A[56]=b("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Description",-1)),Jt(b("textarea",{"onUpdate:modelValue":A[15]||(A[15]=le=>R.value=le),class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",rows:"3",placeholder:"Description de l'événement (optionnel)",onKeydown:ar(qe,["esc"])},null,544),[[Yt,R.value]])]),b("div",hC,[A[57]||(A[57]=b("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nombre de joueurs à sélectionner",-1)),Jt(b("input",{"onUpdate:modelValue":A[16]||(A[16]=le=>d.value=le),type:"number",min:"1",max:"20",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white",onKeydown:ar(qe,["esc"])},null,544),[[Yt,d.value]])]),b("div",{class:"flex justify-end space-x-3"},[b("button",{onClick:qe,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),b("button",{onClick:$t,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"}," Sauvegarder ")])])])):Tt("",!0),St(o_,{show:z.value,message:Cr(),error:W.value,onSubmit:Bs,onCancel:kn},null,8,["show","message","error"]),St(jS,{show:M.value,player:H.value,stats:Ya(H.value),onClose:er,onUpdate:Ja,onDelete:Zr},null,8,["show","player","stats"])],64)}}},fC=[{path:"/",component:gS},{path:"/season/:slug",component:dC,props:!0}],pC=J0({history:A0("/impro-selector/"),routes:fC});Hv(Gv).use(pC).mount("#app");
