(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&r(o)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();/**
* @vue/shared v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**//*! #__NO_SIDE_EFFECTS__ */function xu(t){const e=Object.create(null);for(const n of t.split(","))e[n]=1;return n=>n in e}const Qe={},ys=[],mn=()=>{},x_=()=>!1,va=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&(t.charCodeAt(2)>122||t.charCodeAt(2)<97),ku=t=>t.startsWith("onUpdate:"),Tt=Object.assign,Du=(t,e)=>{const n=t.indexOf(e);n>-1&&t.splice(n,1)},k_=Object.prototype.hasOwnProperty,ze=(t,e)=>k_.call(t,e),be=Array.isArray,ws=t=>ya(t)==="[object Map]",Pf=t=>ya(t)==="[object Set]",Re=t=>typeof t=="function",mt=t=>typeof t=="string",kr=t=>typeof t=="symbol",nt=t=>t!==null&&typeof t=="object",Cf=t=>(nt(t)||Re(t))&&Re(t.then)&&Re(t.catch),xf=Object.prototype.toString,ya=t=>xf.call(t),D_=t=>ya(t).slice(8,-1),kf=t=>ya(t)==="[object Object]",Nu=t=>mt(t)&&t!=="NaN"&&t[0]!=="-"&&""+parseInt(t,10)===t,fi=xu(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),wa=t=>{const e=Object.create(null);return n=>e[n]||(e[n]=t(n))},N_=/-(\w)/g,hn=wa(t=>t.replace(N_,(e,n)=>n?n.toUpperCase():"")),V_=/\B([A-Z])/g,Dr=wa(t=>t.replace(V_,"-$1").toLowerCase()),ba=wa(t=>t.charAt(0).toUpperCase()+t.slice(1)),ml=wa(t=>t?`on${ba(t)}`:""),_r=(t,e)=>!Object.is(t,e),Vo=(t,...e)=>{for(let n=0;n<t.length;n++)t[n](...e)},Hl=(t,e,n,r=!1)=>{Object.defineProperty(t,e,{configurable:!0,enumerable:!1,writable:r,value:n})},Kl=t=>{const e=parseFloat(t);return isNaN(e)?t:e};let yh;const Ea=()=>yh||(yh=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function Ri(t){if(be(t)){const e={};for(let n=0;n<t.length;n++){const r=t[n],s=mt(r)?F_(r):Ri(r);if(s)for(const i in s)e[i]=s[i]}return e}else if(mt(t)||nt(t))return t}const O_=/;(?![^(]*\))/g,M_=/:([^]+)/,L_=/\/\*[^]*?\*\//g;function F_(t){const e={};return t.replace(L_,"").split(O_).forEach(n=>{if(n){const r=n.split(M_);r.length>1&&(e[r[0].trim()]=r[1].trim())}}),e}function vr(t){let e="";if(mt(t))e=t;else if(be(t))for(let n=0;n<t.length;n++){const r=vr(t[n]);r&&(e+=r+" ")}else if(nt(t))for(const n in t)t[n]&&(e+=n+" ");return e.trim()}const U_="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",j_=xu(U_);function Df(t){return!!t||t===""}const Nf=t=>!!(t&&t.__v_isRef===!0),Me=t=>mt(t)?t:t==null?"":be(t)||nt(t)&&(t.toString===xf||!Re(t.toString))?Nf(t)?Me(t.value):JSON.stringify(t,Vf,2):String(t),Vf=(t,e)=>Nf(e)?Vf(t,e.value):ws(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((n,[r,s],i)=>(n[gl(r,i)+" =>"]=s,n),{})}:Pf(e)?{[`Set(${e.size})`]:[...e.values()].map(n=>gl(n))}:kr(e)?gl(e):nt(e)&&!be(e)&&!kf(e)?String(e):e,gl=(t,e="")=>{var n;return kr(t)?`Symbol(${(n=t.description)!=null?n:e})`:t};/**
* @vue/reactivity v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Qt;class $_{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=Qt,!e&&Qt&&(this.index=(Qt.scopes||(Qt.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].pause();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].resume();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].resume()}}run(e){if(this._active){const n=Qt;try{return Qt=this,e()}finally{Qt=n}}}on(){++this._on===1&&(this.prevScope=Qt,Qt=this)}off(){this._on>0&&--this._on===0&&(Qt=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let n,r;for(n=0,r=this.effects.length;n<r;n++)this.effects[n].stop();for(this.effects.length=0,n=0,r=this.cleanups.length;n<r;n++)this.cleanups[n]();if(this.cleanups.length=0,this.scopes){for(n=0,r=this.scopes.length;n<r;n++)this.scopes[n].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function B_(){return Qt}let Ye;const _l=new WeakSet;class Of{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Qt&&Qt.active&&Qt.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,_l.has(this)&&(_l.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Lf(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,wh(this),Ff(this);const e=Ye,n=gn;Ye=this,gn=!0;try{return this.fn()}finally{Uf(this),Ye=e,gn=n,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)Mu(e);this.deps=this.depsTail=void 0,wh(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?_l.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Wl(this)&&this.run()}get dirty(){return Wl(this)}}let Mf=0,pi,mi;function Lf(t,e=!1){if(t.flags|=8,e){t.next=mi,mi=t;return}t.next=pi,pi=t}function Vu(){Mf++}function Ou(){if(--Mf>0)return;if(mi){let e=mi;for(mi=void 0;e;){const n=e.next;e.next=void 0,e.flags&=-9,e=n}}let t;for(;pi;){let e=pi;for(pi=void 0;e;){const n=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(r){t||(t=r)}e=n}}if(t)throw t}function Ff(t){for(let e=t.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function Uf(t){let e,n=t.depsTail,r=n;for(;r;){const s=r.prevDep;r.version===-1?(r===n&&(n=s),Mu(r),q_(r)):e=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=s}t.deps=e,t.depsTail=n}function Wl(t){for(let e=t.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(jf(e.dep.computed)||e.dep.version!==e.version))return!0;return!!t._dirty}function jf(t){if(t.flags&4&&!(t.flags&16)||(t.flags&=-17,t.globalVersion===Pi)||(t.globalVersion=Pi,!t.isSSR&&t.flags&128&&(!t.deps&&!t._dirty||!Wl(t))))return;t.flags|=2;const e=t.dep,n=Ye,r=gn;Ye=t,gn=!0;try{Ff(t);const s=t.fn(t._value);(e.version===0||_r(s,t._value))&&(t.flags|=128,t._value=s,e.version++)}catch(s){throw e.version++,s}finally{Ye=n,gn=r,Uf(t),t.flags&=-3}}function Mu(t,e=!1){const{dep:n,prevSub:r,nextSub:s}=t;if(r&&(r.nextSub=s,t.prevSub=void 0),s&&(s.prevSub=r,t.nextSub=void 0),n.subs===t&&(n.subs=r,!r&&n.computed)){n.computed.flags&=-5;for(let i=n.computed.deps;i;i=i.nextDep)Mu(i,!0)}!e&&!--n.sc&&n.map&&n.map.delete(n.key)}function q_(t){const{prevDep:e,nextDep:n}=t;e&&(e.nextDep=n,t.prevDep=void 0),n&&(n.prevDep=e,t.nextDep=void 0)}let gn=!0;const $f=[];function Wn(){$f.push(gn),gn=!1}function Gn(){const t=$f.pop();gn=t===void 0?!0:t}function wh(t){const{cleanup:e}=t;if(t.cleanup=void 0,e){const n=Ye;Ye=void 0;try{e()}finally{Ye=n}}}let Pi=0;class z_{constructor(e,n){this.sub=e,this.dep=n,this.version=n.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class Lu{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!Ye||!gn||Ye===this.computed)return;let n=this.activeLink;if(n===void 0||n.sub!==Ye)n=this.activeLink=new z_(Ye,this),Ye.deps?(n.prevDep=Ye.depsTail,Ye.depsTail.nextDep=n,Ye.depsTail=n):Ye.deps=Ye.depsTail=n,Bf(n);else if(n.version===-1&&(n.version=this.version,n.nextDep)){const r=n.nextDep;r.prevDep=n.prevDep,n.prevDep&&(n.prevDep.nextDep=r),n.prevDep=Ye.depsTail,n.nextDep=void 0,Ye.depsTail.nextDep=n,Ye.depsTail=n,Ye.deps===n&&(Ye.deps=r)}return n}trigger(e){this.version++,Pi++,this.notify(e)}notify(e){Vu();try{for(let n=this.subs;n;n=n.prevSub)n.sub.notify()&&n.sub.dep.notify()}finally{Ou()}}}function Bf(t){if(t.dep.sc++,t.sub.flags&4){const e=t.dep.computed;if(e&&!t.dep.subs){e.flags|=20;for(let r=e.deps;r;r=r.nextDep)Bf(r)}const n=t.dep.subs;n!==t&&(t.prevSub=n,n&&(n.nextSub=t)),t.dep.subs=t}}const Gl=new WeakMap,Hr=Symbol(""),Ql=Symbol(""),Ci=Symbol("");function Lt(t,e,n){if(gn&&Ye){let r=Gl.get(t);r||Gl.set(t,r=new Map);let s=r.get(n);s||(r.set(n,s=new Lu),s.map=r,s.key=n),s.track()}}function jn(t,e,n,r,s,i){const o=Gl.get(t);if(!o){Pi++;return}const l=u=>{u&&u.trigger()};if(Vu(),e==="clear")o.forEach(l);else{const u=be(t),h=u&&Nu(n);if(u&&n==="length"){const d=Number(r);o.forEach((p,g)=>{(g==="length"||g===Ci||!kr(g)&&g>=d)&&l(p)})}else switch((n!==void 0||o.has(void 0))&&l(o.get(n)),h&&l(o.get(Ci)),e){case"add":u?h&&l(o.get("length")):(l(o.get(Hr)),ws(t)&&l(o.get(Ql)));break;case"delete":u||(l(o.get(Hr)),ws(t)&&l(o.get(Ql)));break;case"set":ws(t)&&l(o.get(Hr));break}}Ou()}function hs(t){const e=qe(t);return e===t?e:(Lt(e,"iterate",Ci),cn(t)?e:e.map(Rt))}function Ta(t){return Lt(t=qe(t),"iterate",Ci),t}const H_={__proto__:null,[Symbol.iterator](){return vl(this,Symbol.iterator,Rt)},concat(...t){return hs(this).concat(...t.map(e=>be(e)?hs(e):e))},entries(){return vl(this,"entries",t=>(t[1]=Rt(t[1]),t))},every(t,e){return Ln(this,"every",t,e,void 0,arguments)},filter(t,e){return Ln(this,"filter",t,e,n=>n.map(Rt),arguments)},find(t,e){return Ln(this,"find",t,e,Rt,arguments)},findIndex(t,e){return Ln(this,"findIndex",t,e,void 0,arguments)},findLast(t,e){return Ln(this,"findLast",t,e,Rt,arguments)},findLastIndex(t,e){return Ln(this,"findLastIndex",t,e,void 0,arguments)},forEach(t,e){return Ln(this,"forEach",t,e,void 0,arguments)},includes(...t){return yl(this,"includes",t)},indexOf(...t){return yl(this,"indexOf",t)},join(t){return hs(this).join(t)},lastIndexOf(...t){return yl(this,"lastIndexOf",t)},map(t,e){return Ln(this,"map",t,e,void 0,arguments)},pop(){return si(this,"pop")},push(...t){return si(this,"push",t)},reduce(t,...e){return bh(this,"reduce",t,e)},reduceRight(t,...e){return bh(this,"reduceRight",t,e)},shift(){return si(this,"shift")},some(t,e){return Ln(this,"some",t,e,void 0,arguments)},splice(...t){return si(this,"splice",t)},toReversed(){return hs(this).toReversed()},toSorted(t){return hs(this).toSorted(t)},toSpliced(...t){return hs(this).toSpliced(...t)},unshift(...t){return si(this,"unshift",t)},values(){return vl(this,"values",Rt)}};function vl(t,e,n){const r=Ta(t),s=r[e]();return r!==t&&!cn(t)&&(s._next=s.next,s.next=()=>{const i=s._next();return i.value&&(i.value=n(i.value)),i}),s}const K_=Array.prototype;function Ln(t,e,n,r,s,i){const o=Ta(t),l=o!==t&&!cn(t),u=o[e];if(u!==K_[e]){const p=u.apply(t,i);return l?Rt(p):p}let h=n;o!==t&&(l?h=function(p,g){return n.call(this,Rt(p),g,t)}:n.length>2&&(h=function(p,g){return n.call(this,p,g,t)}));const d=u.call(o,h,r);return l&&s?s(d):d}function bh(t,e,n,r){const s=Ta(t);let i=n;return s!==t&&(cn(t)?n.length>3&&(i=function(o,l,u){return n.call(this,o,l,u,t)}):i=function(o,l,u){return n.call(this,o,Rt(l),u,t)}),s[e](i,...r)}function yl(t,e,n){const r=qe(t);Lt(r,"iterate",Ci);const s=r[e](...n);return(s===-1||s===!1)&&ju(n[0])?(n[0]=qe(n[0]),r[e](...n)):s}function si(t,e,n=[]){Wn(),Vu();const r=qe(t)[e].apply(t,n);return Ou(),Gn(),r}const W_=xu("__proto__,__v_isRef,__isVue"),qf=new Set(Object.getOwnPropertyNames(Symbol).filter(t=>t!=="arguments"&&t!=="caller").map(t=>Symbol[t]).filter(kr));function G_(t){kr(t)||(t=String(t));const e=qe(this);return Lt(e,"has",t),e.hasOwnProperty(t)}class zf{constructor(e=!1,n=!1){this._isReadonly=e,this._isShallow=n}get(e,n,r){if(n==="__v_skip")return e.__v_skip;const s=this._isReadonly,i=this._isShallow;if(n==="__v_isReactive")return!s;if(n==="__v_isReadonly")return s;if(n==="__v_isShallow")return i;if(n==="__v_raw")return r===(s?i?sv:Gf:i?Wf:Kf).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(r)?e:void 0;const o=be(e);if(!s){let u;if(o&&(u=H_[n]))return u;if(n==="hasOwnProperty")return G_}const l=Reflect.get(e,n,jt(e)?e:r);return(kr(n)?qf.has(n):W_(n))||(s||Lt(e,"get",n),i)?l:jt(l)?o&&Nu(n)?l:l.value:nt(l)?s?Jf(l):Ia(l):l}}class Hf extends zf{constructor(e=!1){super(!1,e)}set(e,n,r,s){let i=e[n];if(!this._isShallow){const u=Ar(i);if(!cn(r)&&!Ar(r)&&(i=qe(i),r=qe(r)),!be(e)&&jt(i)&&!jt(r))return u?!1:(i.value=r,!0)}const o=be(e)&&Nu(n)?Number(n)<e.length:ze(e,n),l=Reflect.set(e,n,r,jt(e)?e:s);return e===qe(s)&&(o?_r(r,i)&&jn(e,"set",n,r):jn(e,"add",n,r)),l}deleteProperty(e,n){const r=ze(e,n);e[n];const s=Reflect.deleteProperty(e,n);return s&&r&&jn(e,"delete",n,void 0),s}has(e,n){const r=Reflect.has(e,n);return(!kr(n)||!qf.has(n))&&Lt(e,"has",n),r}ownKeys(e){return Lt(e,"iterate",be(e)?"length":Hr),Reflect.ownKeys(e)}}class Q_ extends zf{constructor(e=!1){super(!0,e)}set(e,n){return!0}deleteProperty(e,n){return!0}}const J_=new Hf,Y_=new Q_,X_=new Hf(!0);const Jl=t=>t,Io=t=>Reflect.getPrototypeOf(t);function Z_(t,e,n){return function(...r){const s=this.__v_raw,i=qe(s),o=ws(i),l=t==="entries"||t===Symbol.iterator&&o,u=t==="keys"&&o,h=s[t](...r),d=n?Jl:e?Go:Rt;return!e&&Lt(i,"iterate",u?Ql:Hr),{next(){const{value:p,done:g}=h.next();return g?{value:p,done:g}:{value:l?[d(p[0]),d(p[1])]:d(p),done:g}},[Symbol.iterator](){return this}}}}function Ao(t){return function(...e){return t==="delete"?!1:t==="clear"?void 0:this}}function ev(t,e){const n={get(s){const i=this.__v_raw,o=qe(i),l=qe(s);t||(_r(s,l)&&Lt(o,"get",s),Lt(o,"get",l));const{has:u}=Io(o),h=e?Jl:t?Go:Rt;if(u.call(o,s))return h(i.get(s));if(u.call(o,l))return h(i.get(l));i!==o&&i.get(s)},get size(){const s=this.__v_raw;return!t&&Lt(qe(s),"iterate",Hr),Reflect.get(s,"size",s)},has(s){const i=this.__v_raw,o=qe(i),l=qe(s);return t||(_r(s,l)&&Lt(o,"has",s),Lt(o,"has",l)),s===l?i.has(s):i.has(s)||i.has(l)},forEach(s,i){const o=this,l=o.__v_raw,u=qe(l),h=e?Jl:t?Go:Rt;return!t&&Lt(u,"iterate",Hr),l.forEach((d,p)=>s.call(i,h(d),h(p),o))}};return Tt(n,t?{add:Ao("add"),set:Ao("set"),delete:Ao("delete"),clear:Ao("clear")}:{add(s){!e&&!cn(s)&&!Ar(s)&&(s=qe(s));const i=qe(this);return Io(i).has.call(i,s)||(i.add(s),jn(i,"add",s,s)),this},set(s,i){!e&&!cn(i)&&!Ar(i)&&(i=qe(i));const o=qe(this),{has:l,get:u}=Io(o);let h=l.call(o,s);h||(s=qe(s),h=l.call(o,s));const d=u.call(o,s);return o.set(s,i),h?_r(i,d)&&jn(o,"set",s,i):jn(o,"add",s,i),this},delete(s){const i=qe(this),{has:o,get:l}=Io(i);let u=o.call(i,s);u||(s=qe(s),u=o.call(i,s)),l&&l.call(i,s);const h=i.delete(s);return u&&jn(i,"delete",s,void 0),h},clear(){const s=qe(this),i=s.size!==0,o=s.clear();return i&&jn(s,"clear",void 0,void 0),o}}),["keys","values","entries",Symbol.iterator].forEach(s=>{n[s]=Z_(s,t,e)}),n}function Fu(t,e){const n=ev(t,e);return(r,s,i)=>s==="__v_isReactive"?!t:s==="__v_isReadonly"?t:s==="__v_raw"?r:Reflect.get(ze(n,s)&&s in r?n:r,s,i)}const tv={get:Fu(!1,!1)},nv={get:Fu(!1,!0)},rv={get:Fu(!0,!1)};const Kf=new WeakMap,Wf=new WeakMap,Gf=new WeakMap,sv=new WeakMap;function iv(t){switch(t){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function ov(t){return t.__v_skip||!Object.isExtensible(t)?0:iv(D_(t))}function Ia(t){return Ar(t)?t:Uu(t,!1,J_,tv,Kf)}function Qf(t){return Uu(t,!1,X_,nv,Wf)}function Jf(t){return Uu(t,!0,Y_,rv,Gf)}function Uu(t,e,n,r,s){if(!nt(t)||t.__v_raw&&!(e&&t.__v_isReactive))return t;const i=ov(t);if(i===0)return t;const o=s.get(t);if(o)return o;const l=new Proxy(t,i===2?r:n);return s.set(t,l),l}function bs(t){return Ar(t)?bs(t.__v_raw):!!(t&&t.__v_isReactive)}function Ar(t){return!!(t&&t.__v_isReadonly)}function cn(t){return!!(t&&t.__v_isShallow)}function ju(t){return t?!!t.__v_raw:!1}function qe(t){const e=t&&t.__v_raw;return e?qe(e):t}function av(t){return!ze(t,"__v_skip")&&Object.isExtensible(t)&&Hl(t,"__v_skip",!0),t}const Rt=t=>nt(t)?Ia(t):t,Go=t=>nt(t)?Jf(t):t;function jt(t){return t?t.__v_isRef===!0:!1}function se(t){return Yf(t,!1)}function lv(t){return Yf(t,!0)}function Yf(t,e){return jt(t)?t:new uv(t,e)}class uv{constructor(e,n){this.dep=new Lu,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=n?e:qe(e),this._value=n?e:Rt(e),this.__v_isShallow=n}get value(){return this.dep.track(),this._value}set value(e){const n=this._rawValue,r=this.__v_isShallow||cn(e)||Ar(e);e=r?e:qe(e),_r(e,n)&&(this._rawValue=e,this._value=r?e:Rt(e),this.dep.trigger())}}function Es(t){return jt(t)?t.value:t}const cv={get:(t,e,n)=>e==="__v_raw"?t:Es(Reflect.get(t,e,n)),set:(t,e,n,r)=>{const s=t[e];return jt(s)&&!jt(n)?(s.value=n,!0):Reflect.set(t,e,n,r)}};function Xf(t){return bs(t)?t:new Proxy(t,cv)}class hv{constructor(e,n,r){this.fn=e,this.setter=n,this._value=void 0,this.dep=new Lu(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=Pi-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!n,this.isSSR=r}notify(){if(this.flags|=16,!(this.flags&8)&&Ye!==this)return Lf(this,!0),!0}get value(){const e=this.dep.track();return jf(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function dv(t,e,n=!1){let r,s;return Re(t)?r=t:(r=t.get,s=t.set),new hv(r,s,n)}const So={},Qo=new WeakMap;let Br;function fv(t,e=!1,n=Br){if(n){let r=Qo.get(n);r||Qo.set(n,r=[]),r.push(t)}}function pv(t,e,n=Qe){const{immediate:r,deep:s,once:i,scheduler:o,augmentJob:l,call:u}=n,h=G=>s?G:cn(G)||s===!1||s===0?$n(G,1):$n(G);let d,p,g,v,x=!1,D=!1;if(jt(t)?(p=()=>t.value,x=cn(t)):bs(t)?(p=()=>h(t),x=!0):be(t)?(D=!0,x=t.some(G=>bs(G)||cn(G)),p=()=>t.map(G=>{if(jt(G))return G.value;if(bs(G))return h(G);if(Re(G))return u?u(G,2):G()})):Re(t)?e?p=u?()=>u(t,2):t:p=()=>{if(g){Wn();try{g()}finally{Gn()}}const G=Br;Br=d;try{return u?u(t,3,[v]):t(v)}finally{Br=G}}:p=mn,e&&s){const G=p,fe=s===!0?1/0:s;p=()=>$n(G(),fe)}const N=B_(),j=()=>{d.stop(),N&&N.active&&Du(N.effects,d)};if(i&&e){const G=e;e=(...fe)=>{G(...fe),j()}}let B=D?new Array(t.length).fill(So):So;const W=G=>{if(!(!(d.flags&1)||!d.dirty&&!G))if(e){const fe=d.run();if(s||x||(D?fe.some((oe,P)=>_r(oe,B[P])):_r(fe,B))){g&&g();const oe=Br;Br=d;try{const P=[fe,B===So?void 0:D&&B[0]===So?[]:B,v];B=fe,u?u(e,3,P):e(...P)}finally{Br=oe}}}else d.run()};return l&&l(W),d=new Of(p),d.scheduler=o?()=>o(W,!1):W,v=G=>fv(G,!1,d),g=d.onStop=()=>{const G=Qo.get(d);if(G){if(u)u(G,4);else for(const fe of G)fe();Qo.delete(d)}},e?r?W(!0):B=d.run():o?o(W.bind(null,!0),!0):d.run(),j.pause=d.pause.bind(d),j.resume=d.resume.bind(d),j.stop=j,j}function $n(t,e=1/0,n){if(e<=0||!nt(t)||t.__v_skip||(n=n||new Set,n.has(t)))return t;if(n.add(t),e--,jt(t))$n(t.value,e,n);else if(be(t))for(let r=0;r<t.length;r++)$n(t[r],e,n);else if(Pf(t)||ws(t))t.forEach(r=>{$n(r,e,n)});else if(kf(t)){for(const r in t)$n(t[r],e,n);for(const r of Object.getOwnPropertySymbols(t))Object.prototype.propertyIsEnumerable.call(t,r)&&$n(t[r],e,n)}return t}/**
* @vue/runtime-core v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function Hi(t,e,n,r){try{return r?t(...r):t()}catch(s){Aa(s,e,n)}}function xn(t,e,n,r){if(Re(t)){const s=Hi(t,e,n,r);return s&&Cf(s)&&s.catch(i=>{Aa(i,e,n)}),s}if(be(t)){const s=[];for(let i=0;i<t.length;i++)s.push(xn(t[i],e,n,r));return s}}function Aa(t,e,n,r=!0){const s=e?e.vnode:null,{errorHandler:i,throwUnhandledErrorInProduction:o}=e&&e.appContext.config||Qe;if(e){let l=e.parent;const u=e.proxy,h=`https://vuejs.org/error-reference/#runtime-${n}`;for(;l;){const d=l.ec;if(d){for(let p=0;p<d.length;p++)if(d[p](t,u,h)===!1)return}l=l.parent}if(i){Wn(),Hi(i,null,10,[t,u,h]),Gn();return}}mv(t,n,s,r,o)}function mv(t,e,n,r=!0,s=!1){if(s)throw t;console.error(t)}const zt=[];let bn=-1;const Ts=[];let ur=null,ds=0;const Zf=Promise.resolve();let Jo=null;function xs(t){const e=Jo||Zf;return t?e.then(this?t.bind(this):t):e}function gv(t){let e=bn+1,n=zt.length;for(;e<n;){const r=e+n>>>1,s=zt[r],i=xi(s);i<t||i===t&&s.flags&2?e=r+1:n=r}return e}function $u(t){if(!(t.flags&1)){const e=xi(t),n=zt[zt.length-1];!n||!(t.flags&2)&&e>=xi(n)?zt.push(t):zt.splice(gv(e),0,t),t.flags|=1,ep()}}function ep(){Jo||(Jo=Zf.then(np))}function _v(t){be(t)?Ts.push(...t):ur&&t.id===-1?ur.splice(ds+1,0,t):t.flags&1||(Ts.push(t),t.flags|=1),ep()}function Eh(t,e,n=bn+1){for(;n<zt.length;n++){const r=zt[n];if(r&&r.flags&2){if(t&&r.id!==t.uid)continue;zt.splice(n,1),n--,r.flags&4&&(r.flags&=-2),r(),r.flags&4||(r.flags&=-2)}}}function tp(t){if(Ts.length){const e=[...new Set(Ts)].sort((n,r)=>xi(n)-xi(r));if(Ts.length=0,ur){ur.push(...e);return}for(ur=e,ds=0;ds<ur.length;ds++){const n=ur[ds];n.flags&4&&(n.flags&=-2),n.flags&8||n(),n.flags&=-2}ur=null,ds=0}}const xi=t=>t.id==null?t.flags&2?-1:1/0:t.id;function np(t){const e=mn;try{for(bn=0;bn<zt.length;bn++){const n=zt[bn];n&&!(n.flags&8)&&(n.flags&4&&(n.flags&=-2),Hi(n,n.i,n.i?15:14),n.flags&4||(n.flags&=-2))}}finally{for(;bn<zt.length;bn++){const n=zt[bn];n&&(n.flags&=-2)}bn=-1,zt.length=0,tp(),Jo=null,(zt.length||Ts.length)&&np()}}let sn=null,rp=null;function Yo(t){const e=sn;return sn=t,rp=t&&t.type.__scopeId||null,e}function vv(t,e=sn,n){if(!e||t._n)return t;const r=(...s)=>{r._d&&kh(-1);const i=Yo(e);let o;try{o=t(...s)}finally{Yo(i),r._d&&kh(1)}return o};return r._n=!0,r._c=!0,r._d=!0,r}function Jt(t,e){if(sn===null)return t;const n=Ca(sn),r=t.dirs||(t.dirs=[]);for(let s=0;s<e.length;s++){let[i,o,l,u=Qe]=e[s];i&&(Re(i)&&(i={mounted:i,updated:i}),i.deep&&$n(o),r.push({dir:i,instance:n,value:o,oldValue:void 0,arg:l,modifiers:u}))}return t}function jr(t,e,n,r){const s=t.dirs,i=e&&e.dirs;for(let o=0;o<s.length;o++){const l=s[o];i&&(l.oldValue=i[o].value);let u=l.dir[r];u&&(Wn(),xn(u,n,8,[t.el,l,t,e]),Gn())}}const yv=Symbol("_vte"),wv=t=>t.__isTeleport;function Bu(t,e){t.shapeFlag&6&&t.component?(t.transition=e,Bu(t.component.subTree,e)):t.shapeFlag&128?(t.ssContent.transition=e.clone(t.ssContent),t.ssFallback.transition=e.clone(t.ssFallback)):t.transition=e}/*! #__NO_SIDE_EFFECTS__ */function sp(t,e){return Re(t)?(()=>Tt({name:t.name},e,{setup:t}))():t}function ip(t){t.ids=[t.ids[0]+t.ids[2]+++"-",0,0]}function gi(t,e,n,r,s=!1){if(be(t)){t.forEach((x,D)=>gi(x,e&&(be(e)?e[D]:e),n,r,s));return}if(_i(r)&&!s){r.shapeFlag&512&&r.type.__asyncResolved&&r.component.subTree.component&&gi(t,e,n,r.component.subTree);return}const i=r.shapeFlag&4?Ca(r.component):r.el,o=s?null:i,{i:l,r:u}=t,h=e&&e.r,d=l.refs===Qe?l.refs={}:l.refs,p=l.setupState,g=qe(p),v=p===Qe?()=>!1:x=>ze(g,x);if(h!=null&&h!==u&&(mt(h)?(d[h]=null,v(h)&&(p[h]=null)):jt(h)&&(h.value=null)),Re(u))Hi(u,l,12,[o,d]);else{const x=mt(u),D=jt(u);if(x||D){const N=()=>{if(t.f){const j=x?v(u)?p[u]:d[u]:u.value;s?be(j)&&Du(j,i):be(j)?j.includes(i)||j.push(i):x?(d[u]=[i],v(u)&&(p[u]=d[u])):(u.value=[i],t.k&&(d[t.k]=u.value))}else x?(d[u]=o,v(u)&&(p[u]=o)):D&&(u.value=o,t.k&&(d[t.k]=o))};o?(N.id=-1,rn(N,n)):N()}}}Ea().requestIdleCallback;Ea().cancelIdleCallback;const _i=t=>!!t.type.__asyncLoader,op=t=>t.type.__isKeepAlive;function bv(t,e){ap(t,"a",e)}function Ev(t,e){ap(t,"da",e)}function ap(t,e,n=Ut){const r=t.__wdc||(t.__wdc=()=>{let s=n;for(;s;){if(s.isDeactivated)return;s=s.parent}return t()});if(Sa(e,r,n),n){let s=n.parent;for(;s&&s.parent;)op(s.parent.vnode)&&Tv(r,e,n,s),s=s.parent}}function Tv(t,e,n,r){const s=Sa(e,t,r,!0);lp(()=>{Du(r[e],s)},n)}function Sa(t,e,n=Ut,r=!1){if(n){const s=n[t]||(n[t]=[]),i=e.__weh||(e.__weh=(...o)=>{Wn();const l=Ki(n),u=xn(e,n,t,o);return l(),Gn(),u});return r?s.unshift(i):s.push(i),i}}const er=t=>(e,n=Ut)=>{(!Di||t==="sp")&&Sa(t,(...r)=>e(...r),n)},Iv=er("bm"),qu=er("m"),Av=er("bu"),Sv=er("u"),Rv=er("bum"),lp=er("um"),Pv=er("sp"),Cv=er("rtg"),xv=er("rtc");function kv(t,e=Ut){Sa("ec",t,e)}const up="components";function Dv(t,e){return Vv(up,t,!0,e)||t}const Nv=Symbol.for("v-ndc");function Vv(t,e,n=!0,r=!1){const s=sn||Ut;if(s){const i=s.type;if(t===up){const l=wy(i,!1);if(l&&(l===e||l===hn(e)||l===ba(hn(e))))return i}const o=Th(s[t]||i[t],e)||Th(s.appContext[t],e);return!o&&r?i:o}}function Th(t,e){return t&&(t[e]||t[hn(e)]||t[ba(hn(e))])}function En(t,e,n,r){let s;const i=n&&n[r],o=be(t);if(o||mt(t)){const l=o&&bs(t);let u=!1,h=!1;l&&(u=!cn(t),h=Ar(t),t=Ta(t)),s=new Array(t.length);for(let d=0,p=t.length;d<p;d++)s[d]=e(u?h?Go(Rt(t[d])):Rt(t[d]):t[d],d,void 0,i&&i[d])}else if(typeof t=="number"){s=new Array(t);for(let l=0;l<t;l++)s[l]=e(l+1,l,void 0,i&&i[l])}else if(nt(t))if(t[Symbol.iterator])s=Array.from(t,(l,u)=>e(l,u,void 0,i&&i[u]));else{const l=Object.keys(t);s=new Array(l.length);for(let u=0,h=l.length;u<h;u++){const d=l[u];s[u]=e(t[d],d,u,i&&i[u])}}else s=[];return n&&(n[r]=s),s}const Yl=t=>t?xp(t)?Ca(t):Yl(t.parent):null,vi=Tt(Object.create(null),{$:t=>t,$el:t=>t.vnode.el,$data:t=>t.data,$props:t=>t.props,$attrs:t=>t.attrs,$slots:t=>t.slots,$refs:t=>t.refs,$parent:t=>Yl(t.parent),$root:t=>Yl(t.root),$host:t=>t.ce,$emit:t=>t.emit,$options:t=>zu(t),$forceUpdate:t=>t.f||(t.f=()=>{$u(t.update)}),$nextTick:t=>t.n||(t.n=xs.bind(t.proxy)),$watch:t=>ty.bind(t)}),wl=(t,e)=>t!==Qe&&!t.__isScriptSetup&&ze(t,e),Ov={get({_:t},e){if(e==="__v_skip")return!0;const{ctx:n,setupState:r,data:s,props:i,accessCache:o,type:l,appContext:u}=t;let h;if(e[0]!=="$"){const v=o[e];if(v!==void 0)switch(v){case 1:return r[e];case 2:return s[e];case 4:return n[e];case 3:return i[e]}else{if(wl(r,e))return o[e]=1,r[e];if(s!==Qe&&ze(s,e))return o[e]=2,s[e];if((h=t.propsOptions[0])&&ze(h,e))return o[e]=3,i[e];if(n!==Qe&&ze(n,e))return o[e]=4,n[e];Xl&&(o[e]=0)}}const d=vi[e];let p,g;if(d)return e==="$attrs"&&Lt(t.attrs,"get",""),d(t);if((p=l.__cssModules)&&(p=p[e]))return p;if(n!==Qe&&ze(n,e))return o[e]=4,n[e];if(g=u.config.globalProperties,ze(g,e))return g[e]},set({_:t},e,n){const{data:r,setupState:s,ctx:i}=t;return wl(s,e)?(s[e]=n,!0):r!==Qe&&ze(r,e)?(r[e]=n,!0):ze(t.props,e)||e[0]==="$"&&e.slice(1)in t?!1:(i[e]=n,!0)},has({_:{data:t,setupState:e,accessCache:n,ctx:r,appContext:s,propsOptions:i}},o){let l;return!!n[o]||t!==Qe&&ze(t,o)||wl(e,o)||(l=i[0])&&ze(l,o)||ze(r,o)||ze(vi,o)||ze(s.config.globalProperties,o)},defineProperty(t,e,n){return n.get!=null?t._.accessCache[e]=0:ze(n,"value")&&this.set(t,e,n.value,null),Reflect.defineProperty(t,e,n)}};function Ih(t){return be(t)?t.reduce((e,n)=>(e[n]=null,e),{}):t}let Xl=!0;function Mv(t){const e=zu(t),n=t.proxy,r=t.ctx;Xl=!1,e.beforeCreate&&Ah(e.beforeCreate,t,"bc");const{data:s,computed:i,methods:o,watch:l,provide:u,inject:h,created:d,beforeMount:p,mounted:g,beforeUpdate:v,updated:x,activated:D,deactivated:N,beforeDestroy:j,beforeUnmount:B,destroyed:W,unmounted:G,render:fe,renderTracked:oe,renderTriggered:P,errorCaptured:E,serverPrefetch:I,expose:S,inheritAttrs:y,components:T,directives:w,filters:Le}=e;if(h&&Lv(h,r,null),o)for(const Ce in o){const xe=o[Ce];Re(xe)&&(r[Ce]=xe.bind(n))}if(s){const Ce=s.call(n,n);nt(Ce)&&(t.data=Ia(Ce))}if(Xl=!0,i)for(const Ce in i){const xe=i[Ce],gt=Re(xe)?xe.bind(n,n):Re(xe.get)?xe.get.bind(n,n):mn,kt=!Re(xe)&&Re(xe.set)?xe.set.bind(n):mn,_t=Ht({get:gt,set:kt});Object.defineProperty(r,Ce,{enumerable:!0,configurable:!0,get:()=>_t.value,set:$e=>_t.value=$e})}if(l)for(const Ce in l)cp(l[Ce],r,n,Ce);if(u){const Ce=Re(u)?u.call(n):u;Reflect.ownKeys(Ce).forEach(xe=>{Oo(xe,Ce[xe])})}d&&Ah(d,t,"c");function Oe(Ce,xe){be(xe)?xe.forEach(gt=>Ce(gt.bind(n))):xe&&Ce(xe.bind(n))}if(Oe(Iv,p),Oe(qu,g),Oe(Av,v),Oe(Sv,x),Oe(bv,D),Oe(Ev,N),Oe(kv,E),Oe(xv,oe),Oe(Cv,P),Oe(Rv,B),Oe(lp,G),Oe(Pv,I),be(S))if(S.length){const Ce=t.exposed||(t.exposed={});S.forEach(xe=>{Object.defineProperty(Ce,xe,{get:()=>n[xe],set:gt=>n[xe]=gt})})}else t.exposed||(t.exposed={});fe&&t.render===mn&&(t.render=fe),y!=null&&(t.inheritAttrs=y),T&&(t.components=T),w&&(t.directives=w),I&&ip(t)}function Lv(t,e,n=mn){be(t)&&(t=Zl(t));for(const r in t){const s=t[r];let i;nt(s)?"default"in s?i=An(s.from||r,s.default,!0):i=An(s.from||r):i=An(s),jt(i)?Object.defineProperty(e,r,{enumerable:!0,configurable:!0,get:()=>i.value,set:o=>i.value=o}):e[r]=i}}function Ah(t,e,n){xn(be(t)?t.map(r=>r.bind(e.proxy)):t.bind(e.proxy),e,n)}function cp(t,e,n,r){let s=r.includes(".")?Tp(n,r):()=>n[r];if(mt(t)){const i=e[t];Re(i)&&yr(s,i)}else if(Re(t))yr(s,t.bind(n));else if(nt(t))if(be(t))t.forEach(i=>cp(i,e,n,r));else{const i=Re(t.handler)?t.handler.bind(n):e[t.handler];Re(i)&&yr(s,i,t)}}function zu(t){const e=t.type,{mixins:n,extends:r}=e,{mixins:s,optionsCache:i,config:{optionMergeStrategies:o}}=t.appContext,l=i.get(e);let u;return l?u=l:!s.length&&!n&&!r?u=e:(u={},s.length&&s.forEach(h=>Xo(u,h,o,!0)),Xo(u,e,o)),nt(e)&&i.set(e,u),u}function Xo(t,e,n,r=!1){const{mixins:s,extends:i}=e;i&&Xo(t,i,n,!0),s&&s.forEach(o=>Xo(t,o,n,!0));for(const o in e)if(!(r&&o==="expose")){const l=Fv[o]||n&&n[o];t[o]=l?l(t[o],e[o]):e[o]}return t}const Fv={data:Sh,props:Rh,emits:Rh,methods:li,computed:li,beforeCreate:qt,created:qt,beforeMount:qt,mounted:qt,beforeUpdate:qt,updated:qt,beforeDestroy:qt,beforeUnmount:qt,destroyed:qt,unmounted:qt,activated:qt,deactivated:qt,errorCaptured:qt,serverPrefetch:qt,components:li,directives:li,watch:jv,provide:Sh,inject:Uv};function Sh(t,e){return e?t?function(){return Tt(Re(t)?t.call(this,this):t,Re(e)?e.call(this,this):e)}:e:t}function Uv(t,e){return li(Zl(t),Zl(e))}function Zl(t){if(be(t)){const e={};for(let n=0;n<t.length;n++)e[t[n]]=t[n];return e}return t}function qt(t,e){return t?[...new Set([].concat(t,e))]:e}function li(t,e){return t?Tt(Object.create(null),t,e):e}function Rh(t,e){return t?be(t)&&be(e)?[...new Set([...t,...e])]:Tt(Object.create(null),Ih(t),Ih(e??{})):e}function jv(t,e){if(!t)return e;if(!e)return t;const n=Tt(Object.create(null),t);for(const r in e)n[r]=qt(t[r],e[r]);return n}function hp(){return{app:null,config:{isNativeTag:x_,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let $v=0;function Bv(t,e){return function(r,s=null){Re(r)||(r=Tt({},r)),s!=null&&!nt(s)&&(s=null);const i=hp(),o=new WeakSet,l=[];let u=!1;const h=i.app={_uid:$v++,_component:r,_props:s,_container:null,_context:i,_instance:null,version:Ey,get config(){return i.config},set config(d){},use(d,...p){return o.has(d)||(d&&Re(d.install)?(o.add(d),d.install(h,...p)):Re(d)&&(o.add(d),d(h,...p))),h},mixin(d){return i.mixins.includes(d)||i.mixins.push(d),h},component(d,p){return p?(i.components[d]=p,h):i.components[d]},directive(d,p){return p?(i.directives[d]=p,h):i.directives[d]},mount(d,p,g){if(!u){const v=h._ceVNode||Et(r,s);return v.appContext=i,g===!0?g="svg":g===!1&&(g=void 0),p&&e?e(v,d):t(v,d,g),u=!0,h._container=d,d.__vue_app__=h,Ca(v.component)}},onUnmount(d){l.push(d)},unmount(){u&&(xn(l,h._instance,16),t(null,h._container),delete h._container.__vue_app__)},provide(d,p){return i.provides[d]=p,h},runWithContext(d){const p=Is;Is=h;try{return d()}finally{Is=p}}};return h}}let Is=null;function Oo(t,e){if(Ut){let n=Ut.provides;const r=Ut.parent&&Ut.parent.provides;r===n&&(n=Ut.provides=Object.create(r)),n[t]=e}}function An(t,e,n=!1){const r=Ut||sn;if(r||Is){let s=Is?Is._context.provides:r?r.parent==null||r.ce?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:void 0;if(s&&t in s)return s[t];if(arguments.length>1)return n&&Re(e)?e.call(r&&r.proxy):e}}const dp={},fp=()=>Object.create(dp),pp=t=>Object.getPrototypeOf(t)===dp;function qv(t,e,n,r=!1){const s={},i=fp();t.propsDefaults=Object.create(null),mp(t,e,s,i);for(const o in t.propsOptions[0])o in s||(s[o]=void 0);n?t.props=r?s:Qf(s):t.type.props?t.props=s:t.props=i,t.attrs=i}function zv(t,e,n,r){const{props:s,attrs:i,vnode:{patchFlag:o}}=t,l=qe(s),[u]=t.propsOptions;let h=!1;if((r||o>0)&&!(o&16)){if(o&8){const d=t.vnode.dynamicProps;for(let p=0;p<d.length;p++){let g=d[p];if(Ra(t.emitsOptions,g))continue;const v=e[g];if(u)if(ze(i,g))v!==i[g]&&(i[g]=v,h=!0);else{const x=hn(g);s[x]=eu(u,l,x,v,t,!1)}else v!==i[g]&&(i[g]=v,h=!0)}}}else{mp(t,e,s,i)&&(h=!0);let d;for(const p in l)(!e||!ze(e,p)&&((d=Dr(p))===p||!ze(e,d)))&&(u?n&&(n[p]!==void 0||n[d]!==void 0)&&(s[p]=eu(u,l,p,void 0,t,!0)):delete s[p]);if(i!==l)for(const p in i)(!e||!ze(e,p))&&(delete i[p],h=!0)}h&&jn(t.attrs,"set","")}function mp(t,e,n,r){const[s,i]=t.propsOptions;let o=!1,l;if(e)for(let u in e){if(fi(u))continue;const h=e[u];let d;s&&ze(s,d=hn(u))?!i||!i.includes(d)?n[d]=h:(l||(l={}))[d]=h:Ra(t.emitsOptions,u)||(!(u in r)||h!==r[u])&&(r[u]=h,o=!0)}if(i){const u=qe(n),h=l||Qe;for(let d=0;d<i.length;d++){const p=i[d];n[p]=eu(s,u,p,h[p],t,!ze(h,p))}}return o}function eu(t,e,n,r,s,i){const o=t[n];if(o!=null){const l=ze(o,"default");if(l&&r===void 0){const u=o.default;if(o.type!==Function&&!o.skipFactory&&Re(u)){const{propsDefaults:h}=s;if(n in h)r=h[n];else{const d=Ki(s);r=h[n]=u.call(null,e),d()}}else r=u;s.ce&&s.ce._setProp(n,r)}o[0]&&(i&&!l?r=!1:o[1]&&(r===""||r===Dr(n))&&(r=!0))}return r}const Hv=new WeakMap;function gp(t,e,n=!1){const r=n?Hv:e.propsCache,s=r.get(t);if(s)return s;const i=t.props,o={},l=[];let u=!1;if(!Re(t)){const d=p=>{u=!0;const[g,v]=gp(p,e,!0);Tt(o,g),v&&l.push(...v)};!n&&e.mixins.length&&e.mixins.forEach(d),t.extends&&d(t.extends),t.mixins&&t.mixins.forEach(d)}if(!i&&!u)return nt(t)&&r.set(t,ys),ys;if(be(i))for(let d=0;d<i.length;d++){const p=hn(i[d]);Ph(p)&&(o[p]=Qe)}else if(i)for(const d in i){const p=hn(d);if(Ph(p)){const g=i[d],v=o[p]=be(g)||Re(g)?{type:g}:Tt({},g),x=v.type;let D=!1,N=!0;if(be(x))for(let j=0;j<x.length;++j){const B=x[j],W=Re(B)&&B.name;if(W==="Boolean"){D=!0;break}else W==="String"&&(N=!1)}else D=Re(x)&&x.name==="Boolean";v[0]=D,v[1]=N,(D||ze(v,"default"))&&l.push(p)}}const h=[o,l];return nt(t)&&r.set(t,h),h}function Ph(t){return t[0]!=="$"&&!fi(t)}const Hu=t=>t[0]==="_"||t==="$stable",Ku=t=>be(t)?t.map(Tn):[Tn(t)],Kv=(t,e,n)=>{if(e._n)return e;const r=vv((...s)=>Ku(e(...s)),n);return r._c=!1,r},_p=(t,e,n)=>{const r=t._ctx;for(const s in t){if(Hu(s))continue;const i=t[s];if(Re(i))e[s]=Kv(s,i,r);else if(i!=null){const o=Ku(i);e[s]=()=>o}}},vp=(t,e)=>{const n=Ku(e);t.slots.default=()=>n},yp=(t,e,n)=>{for(const r in e)(n||!Hu(r))&&(t[r]=e[r])},Wv=(t,e,n)=>{const r=t.slots=fp();if(t.vnode.shapeFlag&32){const s=e.__;s&&Hl(r,"__",s,!0);const i=e._;i?(yp(r,e,n),n&&Hl(r,"_",i,!0)):_p(e,r)}else e&&vp(t,e)},Gv=(t,e,n)=>{const{vnode:r,slots:s}=t;let i=!0,o=Qe;if(r.shapeFlag&32){const l=e._;l?n&&l===1?i=!1:yp(s,e,n):(i=!e.$stable,_p(e,s)),o=e}else e&&(vp(t,e),o={default:1});if(i)for(const l in s)!Hu(l)&&o[l]==null&&delete s[l]},rn=ly;function Qv(t){return Jv(t)}function Jv(t,e){const n=Ea();n.__VUE__=!0;const{insert:r,remove:s,patchProp:i,createElement:o,createText:l,createComment:u,setText:h,setElementText:d,parentNode:p,nextSibling:g,setScopeId:v=mn,insertStaticContent:x}=t,D=(b,A,k,U=null,M=null,z=null,ee=void 0,J=null,Q=!!A.dynamicChildren)=>{if(b===A)return;b&&!ii(b,A)&&(U=L(b),$e(b,M,z,!0),b=null),A.patchFlag===-2&&(Q=!1,A.dynamicChildren=null);const{type:q,ref:le,shapeFlag:X}=A;switch(q){case Pa:N(b,A,k,U);break;case Sr:j(b,A,k,U);break;case Mo:b==null&&B(A,k,U,ee);break;case dt:T(b,A,k,U,M,z,ee,J,Q);break;default:X&1?fe(b,A,k,U,M,z,ee,J,Q):X&6?w(b,A,k,U,M,z,ee,J,Q):(X&64||X&128)&&q.process(b,A,k,U,M,z,ee,J,Q,Y)}le!=null&&M?gi(le,b&&b.ref,z,A||b,!A):le==null&&b&&b.ref!=null&&gi(b.ref,null,z,b,!0)},N=(b,A,k,U)=>{if(b==null)r(A.el=l(A.children),k,U);else{const M=A.el=b.el;A.children!==b.children&&h(M,A.children)}},j=(b,A,k,U)=>{b==null?r(A.el=u(A.children||""),k,U):A.el=b.el},B=(b,A,k,U)=>{[b.el,b.anchor]=x(b.children,A,k,U,b.el,b.anchor)},W=({el:b,anchor:A},k,U)=>{let M;for(;b&&b!==A;)M=g(b),r(b,k,U),b=M;r(A,k,U)},G=({el:b,anchor:A})=>{let k;for(;b&&b!==A;)k=g(b),s(b),b=k;s(A)},fe=(b,A,k,U,M,z,ee,J,Q)=>{A.type==="svg"?ee="svg":A.type==="math"&&(ee="mathml"),b==null?oe(A,k,U,M,z,ee,J,Q):I(b,A,M,z,ee,J,Q)},oe=(b,A,k,U,M,z,ee,J)=>{let Q,q;const{props:le,shapeFlag:X,transition:re,dirs:me}=b;if(Q=b.el=o(b.type,z,le&&le.is,le),X&8?d(Q,b.children):X&16&&E(b.children,Q,null,U,M,bl(b,z),ee,J),me&&jr(b,null,U,"created"),P(Q,b,b.scopeId,ee,U),le){for(const Te in le)Te!=="value"&&!fi(Te)&&i(Q,Te,null,le[Te],z,U);"value"in le&&i(Q,"value",null,le.value,z),(q=le.onVnodeBeforeMount)&&wn(q,U,b)}me&&jr(b,null,U,"beforeMount");const de=Yv(M,re);de&&re.beforeEnter(Q),r(Q,A,k),((q=le&&le.onVnodeMounted)||de||me)&&rn(()=>{q&&wn(q,U,b),de&&re.enter(Q),me&&jr(b,null,U,"mounted")},M)},P=(b,A,k,U,M)=>{if(k&&v(b,k),U)for(let z=0;z<U.length;z++)v(b,U[z]);if(M){let z=M.subTree;if(A===z||Ap(z.type)&&(z.ssContent===A||z.ssFallback===A)){const ee=M.vnode;P(b,ee,ee.scopeId,ee.slotScopeIds,M.parent)}}},E=(b,A,k,U,M,z,ee,J,Q=0)=>{for(let q=Q;q<b.length;q++){const le=b[q]=J?cr(b[q]):Tn(b[q]);D(null,le,A,k,U,M,z,ee,J)}},I=(b,A,k,U,M,z,ee)=>{const J=A.el=b.el;let{patchFlag:Q,dynamicChildren:q,dirs:le}=A;Q|=b.patchFlag&16;const X=b.props||Qe,re=A.props||Qe;let me;if(k&&$r(k,!1),(me=re.onVnodeBeforeUpdate)&&wn(me,k,A,b),le&&jr(A,b,k,"beforeUpdate"),k&&$r(k,!0),(X.innerHTML&&re.innerHTML==null||X.textContent&&re.textContent==null)&&d(J,""),q?S(b.dynamicChildren,q,J,k,U,bl(A,M),z):ee||xe(b,A,J,null,k,U,bl(A,M),z,!1),Q>0){if(Q&16)y(J,X,re,k,M);else if(Q&2&&X.class!==re.class&&i(J,"class",null,re.class,M),Q&4&&i(J,"style",X.style,re.style,M),Q&8){const de=A.dynamicProps;for(let Te=0;Te<de.length;Te++){const ke=de[Te],at=X[ke],tt=re[ke];(tt!==at||ke==="value")&&i(J,ke,at,tt,M,k)}}Q&1&&b.children!==A.children&&d(J,A.children)}else!ee&&q==null&&y(J,X,re,k,M);((me=re.onVnodeUpdated)||le)&&rn(()=>{me&&wn(me,k,A,b),le&&jr(A,b,k,"updated")},U)},S=(b,A,k,U,M,z,ee)=>{for(let J=0;J<A.length;J++){const Q=b[J],q=A[J],le=Q.el&&(Q.type===dt||!ii(Q,q)||Q.shapeFlag&198)?p(Q.el):k;D(Q,q,le,null,U,M,z,ee,!0)}},y=(b,A,k,U,M)=>{if(A!==k){if(A!==Qe)for(const z in A)!fi(z)&&!(z in k)&&i(b,z,A[z],null,M,U);for(const z in k){if(fi(z))continue;const ee=k[z],J=A[z];ee!==J&&z!=="value"&&i(b,z,J,ee,M,U)}"value"in k&&i(b,"value",A.value,k.value,M)}},T=(b,A,k,U,M,z,ee,J,Q)=>{const q=A.el=b?b.el:l(""),le=A.anchor=b?b.anchor:l("");let{patchFlag:X,dynamicChildren:re,slotScopeIds:me}=A;me&&(J=J?J.concat(me):me),b==null?(r(q,k,U),r(le,k,U),E(A.children||[],k,le,M,z,ee,J,Q)):X>0&&X&64&&re&&b.dynamicChildren?(S(b.dynamicChildren,re,k,M,z,ee,J),(A.key!=null||M&&A===M.subTree)&&wp(b,A,!0)):xe(b,A,k,le,M,z,ee,J,Q)},w=(b,A,k,U,M,z,ee,J,Q)=>{A.slotScopeIds=J,b==null?A.shapeFlag&512?M.ctx.activate(A,k,U,ee,Q):Le(A,k,U,M,z,ee,Q):ot(b,A,Q)},Le=(b,A,k,U,M,z,ee)=>{const J=b.component=my(b,U,M);if(op(b)&&(J.ctx.renderer=Y),gy(J,!1,ee),J.asyncDep){if(M&&M.registerDep(J,Oe,ee),!b.el){const Q=J.subTree=Et(Sr);j(null,Q,A,k)}}else Oe(J,b,A,k,M,z,ee)},ot=(b,A,k)=>{const U=A.component=b.component;if(oy(b,A,k))if(U.asyncDep&&!U.asyncResolved){Ce(U,A,k);return}else U.next=A,U.update();else A.el=b.el,U.vnode=A},Oe=(b,A,k,U,M,z,ee)=>{const J=()=>{if(b.isMounted){let{next:X,bu:re,u:me,parent:de,vnode:Te}=b;{const ct=bp(b);if(ct){X&&(X.el=Te.el,Ce(b,X,ee)),ct.asyncDep.then(()=>{b.isUnmounted||J()});return}}let ke=X,at;$r(b,!1),X?(X.el=Te.el,Ce(b,X,ee)):X=Te,re&&Vo(re),(at=X.props&&X.props.onVnodeBeforeUpdate)&&wn(at,de,X,Te),$r(b,!0);const tt=El(b),wt=b.subTree;b.subTree=tt,D(wt,tt,p(wt.el),L(wt),b,M,z),X.el=tt.el,ke===null&&ay(b,tt.el),me&&rn(me,M),(at=X.props&&X.props.onVnodeUpdated)&&rn(()=>wn(at,de,X,Te),M)}else{let X;const{el:re,props:me}=A,{bm:de,m:Te,parent:ke,root:at,type:tt}=b,wt=_i(A);if($r(b,!1),de&&Vo(de),!wt&&(X=me&&me.onVnodeBeforeMount)&&wn(X,ke,A),$r(b,!0),re&&Ee){const ct=()=>{b.subTree=El(b),Ee(re,b.subTree,b,M,null)};wt&&tt.__asyncHydrate?tt.__asyncHydrate(re,b,ct):ct()}else{at.ce&&at.ce._def.shadowRoot!==!1&&at.ce._injectChildStyle(tt);const ct=b.subTree=El(b);D(null,ct,k,U,b,M,z),A.el=ct.el}if(Te&&rn(Te,M),!wt&&(X=me&&me.onVnodeMounted)){const ct=A;rn(()=>wn(X,ke,ct),M)}(A.shapeFlag&256||ke&&_i(ke.vnode)&&ke.vnode.shapeFlag&256)&&b.a&&rn(b.a,M),b.isMounted=!0,A=k=U=null}};b.scope.on();const Q=b.effect=new Of(J);b.scope.off();const q=b.update=Q.run.bind(Q),le=b.job=Q.runIfDirty.bind(Q);le.i=b,le.id=b.uid,Q.scheduler=()=>$u(le),$r(b,!0),q()},Ce=(b,A,k)=>{A.component=b;const U=b.vnode.props;b.vnode=A,b.next=null,zv(b,A.props,U,k),Gv(b,A.children,k),Wn(),Eh(b),Gn()},xe=(b,A,k,U,M,z,ee,J,Q=!1)=>{const q=b&&b.children,le=b?b.shapeFlag:0,X=A.children,{patchFlag:re,shapeFlag:me}=A;if(re>0){if(re&128){kt(q,X,k,U,M,z,ee,J,Q);return}else if(re&256){gt(q,X,k,U,M,z,ee,J,Q);return}}me&8?(le&16&&Dt(q,M,z),X!==q&&d(k,X)):le&16?me&16?kt(q,X,k,U,M,z,ee,J,Q):Dt(q,M,z,!0):(le&8&&d(k,""),me&16&&E(X,k,U,M,z,ee,J,Q))},gt=(b,A,k,U,M,z,ee,J,Q)=>{b=b||ys,A=A||ys;const q=b.length,le=A.length,X=Math.min(q,le);let re;for(re=0;re<X;re++){const me=A[re]=Q?cr(A[re]):Tn(A[re]);D(b[re],me,k,null,M,z,ee,J,Q)}q>le?Dt(b,M,z,!0,!1,X):E(A,k,U,M,z,ee,J,Q,X)},kt=(b,A,k,U,M,z,ee,J,Q)=>{let q=0;const le=A.length;let X=b.length-1,re=le-1;for(;q<=X&&q<=re;){const me=b[q],de=A[q]=Q?cr(A[q]):Tn(A[q]);if(ii(me,de))D(me,de,k,null,M,z,ee,J,Q);else break;q++}for(;q<=X&&q<=re;){const me=b[X],de=A[re]=Q?cr(A[re]):Tn(A[re]);if(ii(me,de))D(me,de,k,null,M,z,ee,J,Q);else break;X--,re--}if(q>X){if(q<=re){const me=re+1,de=me<le?A[me].el:U;for(;q<=re;)D(null,A[q]=Q?cr(A[q]):Tn(A[q]),k,de,M,z,ee,J,Q),q++}}else if(q>re)for(;q<=X;)$e(b[q],M,z,!0),q++;else{const me=q,de=q,Te=new Map;for(q=de;q<=re;q++){const vt=A[q]=Q?cr(A[q]):Tn(A[q]);vt.key!=null&&Te.set(vt.key,q)}let ke,at=0;const tt=re-de+1;let wt=!1,ct=0;const yn=new Array(tt);for(q=0;q<tt;q++)yn[q]=0;for(q=me;q<=X;q++){const vt=b[q];if(at>=tt){$e(vt,M,z,!0);continue}let Gt;if(vt.key!=null)Gt=Te.get(vt.key);else for(ke=de;ke<=re;ke++)if(yn[ke-de]===0&&ii(vt,A[ke])){Gt=ke;break}Gt===void 0?$e(vt,M,z,!0):(yn[Gt-de]=q+1,Gt>=ct?ct=Gt:wt=!0,D(vt,A[Gt],k,null,M,z,ee,J,Q),at++)}const Vr=wt?Xv(yn):ys;for(ke=Vr.length-1,q=tt-1;q>=0;q--){const vt=de+q,Gt=A[vt],ss=vt+1<le?A[vt+1].el:U;yn[q]===0?D(null,Gt,k,ss,M,z,ee,J,Q):wt&&(ke<0||q!==Vr[ke]?_t(Gt,k,ss,2):ke--)}}},_t=(b,A,k,U,M=null)=>{const{el:z,type:ee,transition:J,children:Q,shapeFlag:q}=b;if(q&6){_t(b.component.subTree,A,k,U);return}if(q&128){b.suspense.move(A,k,U);return}if(q&64){ee.move(b,A,k,Y);return}if(ee===dt){r(z,A,k);for(let X=0;X<Q.length;X++)_t(Q[X],A,k,U);r(b.anchor,A,k);return}if(ee===Mo){W(b,A,k);return}if(U!==2&&q&1&&J)if(U===0)J.beforeEnter(z),r(z,A,k),rn(()=>J.enter(z),M);else{const{leave:X,delayLeave:re,afterLeave:me}=J,de=()=>{b.ctx.isUnmounted?s(z):r(z,A,k)},Te=()=>{X(z,()=>{de(),me&&me()})};re?re(z,de,Te):Te()}else r(z,A,k)},$e=(b,A,k,U=!1,M=!1)=>{const{type:z,props:ee,ref:J,children:Q,dynamicChildren:q,shapeFlag:le,patchFlag:X,dirs:re,cacheIndex:me}=b;if(X===-2&&(M=!1),J!=null&&(Wn(),gi(J,null,k,b,!0),Gn()),me!=null&&(A.renderCache[me]=void 0),le&256){A.ctx.deactivate(b);return}const de=le&1&&re,Te=!_i(b);let ke;if(Te&&(ke=ee&&ee.onVnodeBeforeUnmount)&&wn(ke,A,b),le&6)ln(b.component,k,U);else{if(le&128){b.suspense.unmount(k,U);return}de&&jr(b,null,A,"beforeUnmount"),le&64?b.type.remove(b,A,k,Y,U):q&&!q.hasOnce&&(z!==dt||X>0&&X&64)?Dt(q,A,k,!1,!0):(z===dt&&X&384||!M&&le&16)&&Dt(Q,A,k),U&&He(b)}(Te&&(ke=ee&&ee.onVnodeUnmounted)||de)&&rn(()=>{ke&&wn(ke,A,b),de&&jr(b,null,A,"unmounted")},k)},He=b=>{const{type:A,el:k,anchor:U,transition:M}=b;if(A===dt){Wt(k,U);return}if(A===Mo){G(b);return}const z=()=>{s(k),M&&!M.persisted&&M.afterLeave&&M.afterLeave()};if(b.shapeFlag&1&&M&&!M.persisted){const{leave:ee,delayLeave:J}=M,Q=()=>ee(k,z);J?J(b.el,z,Q):Q()}else z()},Wt=(b,A)=>{let k;for(;b!==A;)k=g(b),s(b),b=k;s(A)},ln=(b,A,k)=>{const{bum:U,scope:M,job:z,subTree:ee,um:J,m:Q,a:q,parent:le,slots:{__:X}}=b;Ch(Q),Ch(q),U&&Vo(U),le&&be(X)&&X.forEach(re=>{le.renderCache[re]=void 0}),M.stop(),z&&(z.flags|=8,$e(ee,b,A,k)),J&&rn(J,A),rn(()=>{b.isUnmounted=!0},A),A&&A.pendingBranch&&!A.isUnmounted&&b.asyncDep&&!b.asyncResolved&&b.suspenseId===A.pendingId&&(A.deps--,A.deps===0&&A.resolve())},Dt=(b,A,k,U=!1,M=!1,z=0)=>{for(let ee=z;ee<b.length;ee++)$e(b[ee],A,k,U,M)},L=b=>{if(b.shapeFlag&6)return L(b.component.subTree);if(b.shapeFlag&128)return b.suspense.next();const A=g(b.anchor||b.el),k=A&&A[yv];return k?g(k):A};let te=!1;const H=(b,A,k)=>{b==null?A._vnode&&$e(A._vnode,null,null,!0):D(A._vnode||null,b,A,null,null,null,k),A._vnode=b,te||(te=!0,Eh(),tp(),te=!1)},Y={p:D,um:$e,m:_t,r:He,mt:Le,mc:E,pc:xe,pbc:S,n:L,o:t};let pe,Ee;return e&&([pe,Ee]=e(Y)),{render:H,hydrate:pe,createApp:Bv(H,pe)}}function bl({type:t,props:e},n){return n==="svg"&&t==="foreignObject"||n==="mathml"&&t==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:n}function $r({effect:t,job:e},n){n?(t.flags|=32,e.flags|=4):(t.flags&=-33,e.flags&=-5)}function Yv(t,e){return(!t||t&&!t.pendingBranch)&&e&&!e.persisted}function wp(t,e,n=!1){const r=t.children,s=e.children;if(be(r)&&be(s))for(let i=0;i<r.length;i++){const o=r[i];let l=s[i];l.shapeFlag&1&&!l.dynamicChildren&&((l.patchFlag<=0||l.patchFlag===32)&&(l=s[i]=cr(s[i]),l.el=o.el),!n&&l.patchFlag!==-2&&wp(o,l)),l.type===Pa&&(l.el=o.el),l.type===Sr&&!l.el&&(l.el=o.el)}}function Xv(t){const e=t.slice(),n=[0];let r,s,i,o,l;const u=t.length;for(r=0;r<u;r++){const h=t[r];if(h!==0){if(s=n[n.length-1],t[s]<h){e[r]=s,n.push(r);continue}for(i=0,o=n.length-1;i<o;)l=i+o>>1,t[n[l]]<h?i=l+1:o=l;h<t[n[i]]&&(i>0&&(e[r]=n[i-1]),n[i]=r)}}for(i=n.length,o=n[i-1];i-- >0;)n[i]=o,o=e[o];return n}function bp(t){const e=t.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:bp(e)}function Ch(t){if(t)for(let e=0;e<t.length;e++)t[e].flags|=8}const Zv=Symbol.for("v-scx"),ey=()=>An(Zv);function yr(t,e,n){return Ep(t,e,n)}function Ep(t,e,n=Qe){const{immediate:r,deep:s,flush:i,once:o}=n,l=Tt({},n),u=e&&r||!e&&i!=="post";let h;if(Di){if(i==="sync"){const v=ey();h=v.__watcherHandles||(v.__watcherHandles=[])}else if(!u){const v=()=>{};return v.stop=mn,v.resume=mn,v.pause=mn,v}}const d=Ut;l.call=(v,x,D)=>xn(v,d,x,D);let p=!1;i==="post"?l.scheduler=v=>{rn(v,d&&d.suspense)}:i!=="sync"&&(p=!0,l.scheduler=(v,x)=>{x?v():$u(v)}),l.augmentJob=v=>{e&&(v.flags|=4),p&&(v.flags|=2,d&&(v.id=d.uid,v.i=d))};const g=pv(t,e,l);return Di&&(h?h.push(g):u&&g()),g}function ty(t,e,n){const r=this.proxy,s=mt(t)?t.includes(".")?Tp(r,t):()=>r[t]:t.bind(r,r);let i;Re(e)?i=e:(i=e.handler,n=e);const o=Ki(this),l=Ep(s,i.bind(r),n);return o(),l}function Tp(t,e){const n=e.split(".");return()=>{let r=t;for(let s=0;s<n.length&&r;s++)r=r[n[s]];return r}}const ny=(t,e)=>e==="modelValue"||e==="model-value"?t.modelModifiers:t[`${e}Modifiers`]||t[`${hn(e)}Modifiers`]||t[`${Dr(e)}Modifiers`];function ry(t,e,...n){if(t.isUnmounted)return;const r=t.vnode.props||Qe;let s=n;const i=e.startsWith("update:"),o=i&&ny(r,e.slice(7));o&&(o.trim&&(s=n.map(d=>mt(d)?d.trim():d)),o.number&&(s=n.map(Kl)));let l,u=r[l=ml(e)]||r[l=ml(hn(e))];!u&&i&&(u=r[l=ml(Dr(e))]),u&&xn(u,t,6,s);const h=r[l+"Once"];if(h){if(!t.emitted)t.emitted={};else if(t.emitted[l])return;t.emitted[l]=!0,xn(h,t,6,s)}}function Ip(t,e,n=!1){const r=e.emitsCache,s=r.get(t);if(s!==void 0)return s;const i=t.emits;let o={},l=!1;if(!Re(t)){const u=h=>{const d=Ip(h,e,!0);d&&(l=!0,Tt(o,d))};!n&&e.mixins.length&&e.mixins.forEach(u),t.extends&&u(t.extends),t.mixins&&t.mixins.forEach(u)}return!i&&!l?(nt(t)&&r.set(t,null),null):(be(i)?i.forEach(u=>o[u]=null):Tt(o,i),nt(t)&&r.set(t,o),o)}function Ra(t,e){return!t||!va(e)?!1:(e=e.slice(2).replace(/Once$/,""),ze(t,e[0].toLowerCase()+e.slice(1))||ze(t,Dr(e))||ze(t,e))}function El(t){const{type:e,vnode:n,proxy:r,withProxy:s,propsOptions:[i],slots:o,attrs:l,emit:u,render:h,renderCache:d,props:p,data:g,setupState:v,ctx:x,inheritAttrs:D}=t,N=Yo(t);let j,B;try{if(n.shapeFlag&4){const G=s||r,fe=G;j=Tn(h.call(fe,G,d,p,v,g,x)),B=l}else{const G=e;j=Tn(G.length>1?G(p,{attrs:l,slots:o,emit:u}):G(p,null)),B=e.props?l:sy(l)}}catch(G){yi.length=0,Aa(G,t,1),j=Et(Sr)}let W=j;if(B&&D!==!1){const G=Object.keys(B),{shapeFlag:fe}=W;G.length&&fe&7&&(i&&G.some(ku)&&(B=iy(B,i)),W=ks(W,B,!1,!0))}return n.dirs&&(W=ks(W,null,!1,!0),W.dirs=W.dirs?W.dirs.concat(n.dirs):n.dirs),n.transition&&Bu(W,n.transition),j=W,Yo(N),j}const sy=t=>{let e;for(const n in t)(n==="class"||n==="style"||va(n))&&((e||(e={}))[n]=t[n]);return e},iy=(t,e)=>{const n={};for(const r in t)(!ku(r)||!(r.slice(9)in e))&&(n[r]=t[r]);return n};function oy(t,e,n){const{props:r,children:s,component:i}=t,{props:o,children:l,patchFlag:u}=e,h=i.emitsOptions;if(e.dirs||e.transition)return!0;if(n&&u>=0){if(u&1024)return!0;if(u&16)return r?xh(r,o,h):!!o;if(u&8){const d=e.dynamicProps;for(let p=0;p<d.length;p++){const g=d[p];if(o[g]!==r[g]&&!Ra(h,g))return!0}}}else return(s||l)&&(!l||!l.$stable)?!0:r===o?!1:r?o?xh(r,o,h):!0:!!o;return!1}function xh(t,e,n){const r=Object.keys(e);if(r.length!==Object.keys(t).length)return!0;for(let s=0;s<r.length;s++){const i=r[s];if(e[i]!==t[i]&&!Ra(n,i))return!0}return!1}function ay({vnode:t,parent:e},n){for(;e;){const r=e.subTree;if(r.suspense&&r.suspense.activeBranch===t&&(r.el=t.el),r===t)(t=e.vnode).el=n,e=e.parent;else break}}const Ap=t=>t.__isSuspense;function ly(t,e){e&&e.pendingBranch?be(t)?e.effects.push(...t):e.effects.push(t):_v(t)}const dt=Symbol.for("v-fgt"),Pa=Symbol.for("v-txt"),Sr=Symbol.for("v-cmt"),Mo=Symbol.for("v-stc"),yi=[];let on=null;function ae(t=!1){yi.push(on=t?null:[])}function uy(){yi.pop(),on=yi[yi.length-1]||null}let ki=1;function kh(t,e=!1){ki+=t,t<0&&on&&e&&(on.hasOnce=!0)}function Sp(t){return t.dynamicChildren=ki>0?on||ys:null,uy(),ki>0&&on&&on.push(t),t}function ue(t,e,n,r,s,i){return Sp(_(t,e,n,r,s,i,!0))}function Rp(t,e,n,r,s){return Sp(Et(t,e,n,r,s,!0))}function Zo(t){return t?t.__v_isVNode===!0:!1}function ii(t,e){return t.type===e.type&&t.key===e.key}const Pp=({key:t})=>t??null,Lo=({ref:t,ref_key:e,ref_for:n})=>(typeof t=="number"&&(t=""+t),t!=null?mt(t)||jt(t)||Re(t)?{i:sn,r:t,k:e,f:!!n}:t:null);function _(t,e=null,n=null,r=0,s=null,i=t===dt?0:1,o=!1,l=!1){const u={__v_isVNode:!0,__v_skip:!0,type:t,props:e,key:e&&Pp(e),ref:e&&Lo(e),scopeId:rp,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:r,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:sn};return l?(Wu(u,n),i&128&&t.normalize(u)):n&&(u.shapeFlag|=mt(n)?8:16),ki>0&&!o&&on&&(u.patchFlag>0||i&6)&&u.patchFlag!==32&&on.push(u),u}const Et=cy;function cy(t,e=null,n=null,r=0,s=null,i=!1){if((!t||t===Nv)&&(t=Sr),Zo(t)){const l=ks(t,e,!0);return n&&Wu(l,n),ki>0&&!i&&on&&(l.shapeFlag&6?on[on.indexOf(t)]=l:on.push(l)),l.patchFlag=-2,l}if(by(t)&&(t=t.__vccOpts),e){e=hy(e);let{class:l,style:u}=e;l&&!mt(l)&&(e.class=vr(l)),nt(u)&&(ju(u)&&!be(u)&&(u=Tt({},u)),e.style=Ri(u))}const o=mt(t)?1:Ap(t)?128:wv(t)?64:nt(t)?4:Re(t)?2:0;return _(t,e,n,r,s,o,i,!0)}function hy(t){return t?ju(t)||pp(t)?Tt({},t):t:null}function ks(t,e,n=!1,r=!1){const{props:s,ref:i,patchFlag:o,children:l,transition:u}=t,h=e?dy(s||{},e):s,d={__v_isVNode:!0,__v_skip:!0,type:t.type,props:h,key:h&&Pp(h),ref:e&&e.ref?n&&i?be(i)?i.concat(Lo(e)):[i,Lo(e)]:Lo(e):i,scopeId:t.scopeId,slotScopeIds:t.slotScopeIds,children:l,target:t.target,targetStart:t.targetStart,targetAnchor:t.targetAnchor,staticCount:t.staticCount,shapeFlag:t.shapeFlag,patchFlag:e&&t.type!==dt?o===-1?16:o|16:o,dynamicProps:t.dynamicProps,dynamicChildren:t.dynamicChildren,appContext:t.appContext,dirs:t.dirs,transition:u,component:t.component,suspense:t.suspense,ssContent:t.ssContent&&ks(t.ssContent),ssFallback:t.ssFallback&&ks(t.ssFallback),el:t.el,anchor:t.anchor,ctx:t.ctx,ce:t.ce};return u&&r&&Bu(d,u.clone(d)),d}function Cp(t=" ",e=0){return Et(Pa,null,t,e)}function Tl(t,e){const n=Et(Mo,null,t);return n.staticCount=e,n}function ut(t="",e=!1){return e?(ae(),Rp(Sr,null,t)):Et(Sr,null,t)}function Tn(t){return t==null||typeof t=="boolean"?Et(Sr):be(t)?Et(dt,null,t.slice()):Zo(t)?cr(t):Et(Pa,null,String(t))}function cr(t){return t.el===null&&t.patchFlag!==-1||t.memo?t:ks(t)}function Wu(t,e){let n=0;const{shapeFlag:r}=t;if(e==null)e=null;else if(be(e))n=16;else if(typeof e=="object")if(r&65){const s=e.default;s&&(s._c&&(s._d=!1),Wu(t,s()),s._c&&(s._d=!0));return}else{n=32;const s=e._;!s&&!pp(e)?e._ctx=sn:s===3&&sn&&(sn.slots._===1?e._=1:(e._=2,t.patchFlag|=1024))}else Re(e)?(e={default:e,_ctx:sn},n=32):(e=String(e),r&64?(n=16,e=[Cp(e)]):n=8);t.children=e,t.shapeFlag|=n}function dy(...t){const e={};for(let n=0;n<t.length;n++){const r=t[n];for(const s in r)if(s==="class")e.class!==r.class&&(e.class=vr([e.class,r.class]));else if(s==="style")e.style=Ri([e.style,r.style]);else if(va(s)){const i=e[s],o=r[s];o&&i!==o&&!(be(i)&&i.includes(o))&&(e[s]=i?[].concat(i,o):o)}else s!==""&&(e[s]=r[s])}return e}function wn(t,e,n,r=null){xn(t,e,7,[n,r])}const fy=hp();let py=0;function my(t,e,n){const r=t.type,s=(e?e.appContext:t.appContext)||fy,i={uid:py++,vnode:t,type:r,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new $_(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:gp(r,s),emitsOptions:Ip(r,s),emit:null,emitted:null,propsDefaults:Qe,inheritAttrs:r.inheritAttrs,ctx:Qe,data:Qe,props:Qe,attrs:Qe,slots:Qe,refs:Qe,setupState:Qe,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=e?e.root:i,i.emit=ry.bind(null,i),t.ce&&t.ce(i),i}let Ut=null,ea,tu;{const t=Ea(),e=(n,r)=>{let s;return(s=t[n])||(s=t[n]=[]),s.push(r),i=>{s.length>1?s.forEach(o=>o(i)):s[0](i)}};ea=e("__VUE_INSTANCE_SETTERS__",n=>Ut=n),tu=e("__VUE_SSR_SETTERS__",n=>Di=n)}const Ki=t=>{const e=Ut;return ea(t),t.scope.on(),()=>{t.scope.off(),ea(e)}},Dh=()=>{Ut&&Ut.scope.off(),ea(null)};function xp(t){return t.vnode.shapeFlag&4}let Di=!1;function gy(t,e=!1,n=!1){e&&tu(e);const{props:r,children:s}=t.vnode,i=xp(t);qv(t,r,i,e),Wv(t,s,n||e);const o=i?_y(t,e):void 0;return e&&tu(!1),o}function _y(t,e){const n=t.type;t.accessCache=Object.create(null),t.proxy=new Proxy(t.ctx,Ov);const{setup:r}=n;if(r){Wn();const s=t.setupContext=r.length>1?yy(t):null,i=Ki(t),o=Hi(r,t,0,[t.props,s]),l=Cf(o);if(Gn(),i(),(l||t.sp)&&!_i(t)&&ip(t),l){if(o.then(Dh,Dh),e)return o.then(u=>{Nh(t,u,e)}).catch(u=>{Aa(u,t,0)});t.asyncDep=o}else Nh(t,o,e)}else kp(t,e)}function Nh(t,e,n){Re(e)?t.type.__ssrInlineRender?t.ssrRender=e:t.render=e:nt(e)&&(t.setupState=Xf(e)),kp(t,n)}let Vh;function kp(t,e,n){const r=t.type;if(!t.render){if(!e&&Vh&&!r.render){const s=r.template||zu(t).template;if(s){const{isCustomElement:i,compilerOptions:o}=t.appContext.config,{delimiters:l,compilerOptions:u}=r,h=Tt(Tt({isCustomElement:i,delimiters:l},o),u);r.render=Vh(s,h)}}t.render=r.render||mn}{const s=Ki(t);Wn();try{Mv(t)}finally{Gn(),s()}}}const vy={get(t,e){return Lt(t,"get",""),t[e]}};function yy(t){const e=n=>{t.exposed=n||{}};return{attrs:new Proxy(t.attrs,vy),slots:t.slots,emit:t.emit,expose:e}}function Ca(t){return t.exposed?t.exposeProxy||(t.exposeProxy=new Proxy(Xf(av(t.exposed)),{get(e,n){if(n in e)return e[n];if(n in vi)return vi[n](t)},has(e,n){return n in e||n in vi}})):t.proxy}function wy(t,e=!0){return Re(t)?t.displayName||t.name:t.name||e&&t.__name}function by(t){return Re(t)&&"__vccOpts"in t}const Ht=(t,e)=>dv(t,e,Di);function Dp(t,e,n){const r=arguments.length;return r===2?nt(e)&&!be(e)?Zo(e)?Et(t,null,[e]):Et(t,e):Et(t,null,e):(r>3?n=Array.prototype.slice.call(arguments,2):r===3&&Zo(n)&&(n=[n]),Et(t,e,n))}const Ey="3.5.17";/**
* @vue/runtime-dom v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let nu;const Oh=typeof window<"u"&&window.trustedTypes;if(Oh)try{nu=Oh.createPolicy("vue",{createHTML:t=>t})}catch{}const Np=nu?t=>nu.createHTML(t):t=>t,Ty="http://www.w3.org/2000/svg",Iy="http://www.w3.org/1998/Math/MathML",Un=typeof document<"u"?document:null,Mh=Un&&Un.createElement("template"),Ay={insert:(t,e,n)=>{e.insertBefore(t,n||null)},remove:t=>{const e=t.parentNode;e&&e.removeChild(t)},createElement:(t,e,n,r)=>{const s=e==="svg"?Un.createElementNS(Ty,t):e==="mathml"?Un.createElementNS(Iy,t):n?Un.createElement(t,{is:n}):Un.createElement(t);return t==="select"&&r&&r.multiple!=null&&s.setAttribute("multiple",r.multiple),s},createText:t=>Un.createTextNode(t),createComment:t=>Un.createComment(t),setText:(t,e)=>{t.nodeValue=e},setElementText:(t,e)=>{t.textContent=e},parentNode:t=>t.parentNode,nextSibling:t=>t.nextSibling,querySelector:t=>Un.querySelector(t),setScopeId(t,e){t.setAttribute(e,"")},insertStaticContent(t,e,n,r,s,i){const o=n?n.previousSibling:e.lastChild;if(s&&(s===i||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),n),!(s===i||!(s=s.nextSibling)););else{Mh.innerHTML=Np(r==="svg"?`<svg>${t}</svg>`:r==="mathml"?`<math>${t}</math>`:t);const l=Mh.content;if(r==="svg"||r==="mathml"){const u=l.firstChild;for(;u.firstChild;)l.appendChild(u.firstChild);l.removeChild(u)}e.insertBefore(l,n)}return[o?o.nextSibling:e.firstChild,n?n.previousSibling:e.lastChild]}},Sy=Symbol("_vtc");function Ry(t,e,n){const r=t[Sy];r&&(e=(e?[e,...r]:[...r]).join(" ")),e==null?t.removeAttribute("class"):n?t.setAttribute("class",e):t.className=e}const Lh=Symbol("_vod"),Py=Symbol("_vsh"),Cy=Symbol(""),xy=/(^|;)\s*display\s*:/;function ky(t,e,n){const r=t.style,s=mt(n);let i=!1;if(n&&!s){if(e)if(mt(e))for(const o of e.split(";")){const l=o.slice(0,o.indexOf(":")).trim();n[l]==null&&Fo(r,l,"")}else for(const o in e)n[o]==null&&Fo(r,o,"");for(const o in n)o==="display"&&(i=!0),Fo(r,o,n[o])}else if(s){if(e!==n){const o=r[Cy];o&&(n+=";"+o),r.cssText=n,i=xy.test(n)}}else e&&t.removeAttribute("style");Lh in t&&(t[Lh]=i?r.display:"",t[Py]&&(r.display="none"))}const Fh=/\s*!important$/;function Fo(t,e,n){if(be(n))n.forEach(r=>Fo(t,e,r));else if(n==null&&(n=""),e.startsWith("--"))t.setProperty(e,n);else{const r=Dy(t,e);Fh.test(n)?t.setProperty(Dr(r),n.replace(Fh,""),"important"):t[r]=n}}const Uh=["Webkit","Moz","ms"],Il={};function Dy(t,e){const n=Il[e];if(n)return n;let r=hn(e);if(r!=="filter"&&r in t)return Il[e]=r;r=ba(r);for(let s=0;s<Uh.length;s++){const i=Uh[s]+r;if(i in t)return Il[e]=i}return e}const jh="http://www.w3.org/1999/xlink";function $h(t,e,n,r,s,i=j_(e)){r&&e.startsWith("xlink:")?n==null?t.removeAttributeNS(jh,e.slice(6,e.length)):t.setAttributeNS(jh,e,n):n==null||i&&!Df(n)?t.removeAttribute(e):t.setAttribute(e,i?"":kr(n)?String(n):n)}function Bh(t,e,n,r,s){if(e==="innerHTML"||e==="textContent"){n!=null&&(t[e]=e==="innerHTML"?Np(n):n);return}const i=t.tagName;if(e==="value"&&i!=="PROGRESS"&&!i.includes("-")){const l=i==="OPTION"?t.getAttribute("value")||"":t.value,u=n==null?t.type==="checkbox"?"on":"":String(n);(l!==u||!("_value"in t))&&(t.value=u),n==null&&t.removeAttribute(e),t._value=n;return}let o=!1;if(n===""||n==null){const l=typeof t[e];l==="boolean"?n=Df(n):n==null&&l==="string"?(n="",o=!0):l==="number"&&(n=0,o=!0)}try{t[e]=n}catch{}o&&t.removeAttribute(s||e)}function fs(t,e,n,r){t.addEventListener(e,n,r)}function Ny(t,e,n,r){t.removeEventListener(e,n,r)}const qh=Symbol("_vei");function Vy(t,e,n,r,s=null){const i=t[qh]||(t[qh]={}),o=i[e];if(r&&o)o.value=r;else{const[l,u]=Oy(e);if(r){const h=i[e]=Fy(r,s);fs(t,l,h,u)}else o&&(Ny(t,l,o,u),i[e]=void 0)}}const zh=/(?:Once|Passive|Capture)$/;function Oy(t){let e;if(zh.test(t)){e={};let r;for(;r=t.match(zh);)t=t.slice(0,t.length-r[0].length),e[r[0].toLowerCase()]=!0}return[t[2]===":"?t.slice(3):Dr(t.slice(2)),e]}let Al=0;const My=Promise.resolve(),Ly=()=>Al||(My.then(()=>Al=0),Al=Date.now());function Fy(t,e){const n=r=>{if(!r._vts)r._vts=Date.now();else if(r._vts<=n.attached)return;xn(Uy(r,n.value),e,5,[r])};return n.value=t,n.attached=Ly(),n}function Uy(t,e){if(be(e)){const n=t.stopImmediatePropagation;return t.stopImmediatePropagation=()=>{n.call(t),t._stopped=!0},e.map(r=>s=>!s._stopped&&r&&r(s))}else return e}const Hh=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&t.charCodeAt(2)>96&&t.charCodeAt(2)<123,jy=(t,e,n,r,s,i)=>{const o=s==="svg";e==="class"?Ry(t,r,o):e==="style"?ky(t,n,r):va(e)?ku(e)||Vy(t,e,n,r,i):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):$y(t,e,r,o))?(Bh(t,e,r),!t.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&$h(t,e,r,o,i,e!=="value")):t._isVueCE&&(/[A-Z]/.test(e)||!mt(r))?Bh(t,hn(e),r,i,e):(e==="true-value"?t._trueValue=r:e==="false-value"&&(t._falseValue=r),$h(t,e,r,o))};function $y(t,e,n,r){if(r)return!!(e==="innerHTML"||e==="textContent"||e in t&&Hh(e)&&Re(n));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="form"||e==="list"&&t.tagName==="INPUT"||e==="type"&&t.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=t.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return Hh(e)&&mt(n)?!1:e in t}const Kh=t=>{const e=t.props["onUpdate:modelValue"]||!1;return be(e)?n=>Vo(e,n):e};function By(t){t.target.composing=!0}function Wh(t){const e=t.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const Sl=Symbol("_assign"),Yt={created(t,{modifiers:{lazy:e,trim:n,number:r}},s){t[Sl]=Kh(s);const i=r||s.props&&s.props.type==="number";fs(t,e?"change":"input",o=>{if(o.target.composing)return;let l=t.value;n&&(l=l.trim()),i&&(l=Kl(l)),t[Sl](l)}),n&&fs(t,"change",()=>{t.value=t.value.trim()}),e||(fs(t,"compositionstart",By),fs(t,"compositionend",Wh),fs(t,"change",Wh))},mounted(t,{value:e}){t.value=e??""},beforeUpdate(t,{value:e,oldValue:n,modifiers:{lazy:r,trim:s,number:i}},o){if(t[Sl]=Kh(o),t.composing)return;const l=(i||t.type==="number")&&!/^0\d/.test(t.value)?Kl(t.value):t.value,u=e??"";l!==u&&(document.activeElement===t&&t.type!=="range"&&(r&&e===n||s&&t.value.trim()===u)||(t.value=u))}},qy=["ctrl","shift","alt","meta"],zy={stop:t=>t.stopPropagation(),prevent:t=>t.preventDefault(),self:t=>t.target!==t.currentTarget,ctrl:t=>!t.ctrlKey,shift:t=>!t.shiftKey,alt:t=>!t.altKey,meta:t=>!t.metaKey,left:t=>"button"in t&&t.button!==0,middle:t=>"button"in t&&t.button!==1,right:t=>"button"in t&&t.button!==2,exact:(t,e)=>qy.some(n=>t[`${n}Key`]&&!e.includes(n))},As=(t,e)=>{const n=t._withMods||(t._withMods={}),r=e.join(".");return n[r]||(n[r]=(s,...i)=>{for(let o=0;o<e.length;o++){const l=zy[e[o]];if(l&&l(s,e))return}return t(s,...i)})},Hy={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},In=(t,e)=>{const n=t._withKeys||(t._withKeys={}),r=e.join(".");return n[r]||(n[r]=s=>{if(!("key"in s))return;const i=Dr(s.key);if(e.some(o=>o===i||Hy[o]===i))return t(s)})},Ky=Tt({patchProp:jy},Ay);let Gh;function Wy(){return Gh||(Gh=Qv(Ky))}const Gy=(...t)=>{const e=Wy().createApp(...t),{mount:n}=e;return e.mount=r=>{const s=Jy(r);if(!s)return;const i=e._component;!Re(i)&&!i.render&&!i.template&&(i.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const o=n(s,!1,Qy(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),o},e};function Qy(t){if(t instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&t instanceof MathMLElement)return"mathml"}function Jy(t){return mt(t)?document.querySelector(t):t}const Yy={__name:"App",setup(t){return(e,n)=>{const r=Dv("router-view");return ae(),Rp(r)}}};/*!
  * vue-router v4.5.1
  * (c) 2025 Eduardo San Martin Morote
  * @license MIT
  */const ps=typeof document<"u";function Vp(t){return typeof t=="object"||"displayName"in t||"props"in t||"__vccOpts"in t}function Xy(t){return t.__esModule||t[Symbol.toStringTag]==="Module"||t.default&&Vp(t.default)}const Be=Object.assign;function Rl(t,e){const n={};for(const r in e){const s=e[r];n[r]=_n(s)?s.map(t):t(s)}return n}const wi=()=>{},_n=Array.isArray,Op=/#/g,Zy=/&/g,e0=/\//g,t0=/=/g,n0=/\?/g,Mp=/\+/g,r0=/%5B/g,s0=/%5D/g,Lp=/%5E/g,i0=/%60/g,Fp=/%7B/g,o0=/%7C/g,Up=/%7D/g,a0=/%20/g;function Gu(t){return encodeURI(""+t).replace(o0,"|").replace(r0,"[").replace(s0,"]")}function l0(t){return Gu(t).replace(Fp,"{").replace(Up,"}").replace(Lp,"^")}function ru(t){return Gu(t).replace(Mp,"%2B").replace(a0,"+").replace(Op,"%23").replace(Zy,"%26").replace(i0,"`").replace(Fp,"{").replace(Up,"}").replace(Lp,"^")}function u0(t){return ru(t).replace(t0,"%3D")}function c0(t){return Gu(t).replace(Op,"%23").replace(n0,"%3F")}function h0(t){return t==null?"":c0(t).replace(e0,"%2F")}function Ni(t){try{return decodeURIComponent(""+t)}catch{}return""+t}const d0=/\/$/,f0=t=>t.replace(d0,"");function Pl(t,e,n="/"){let r,s={},i="",o="";const l=e.indexOf("#");let u=e.indexOf("?");return l<u&&l>=0&&(u=-1),u>-1&&(r=e.slice(0,u),i=e.slice(u+1,l>-1?l:e.length),s=t(i)),l>-1&&(r=r||e.slice(0,l),o=e.slice(l,e.length)),r=_0(r??e,n),{fullPath:r+(i&&"?")+i+o,path:r,query:s,hash:Ni(o)}}function p0(t,e){const n=e.query?t(e.query):"";return e.path+(n&&"?")+n+(e.hash||"")}function Qh(t,e){return!e||!t.toLowerCase().startsWith(e.toLowerCase())?t:t.slice(e.length)||"/"}function m0(t,e,n){const r=e.matched.length-1,s=n.matched.length-1;return r>-1&&r===s&&Ds(e.matched[r],n.matched[s])&&jp(e.params,n.params)&&t(e.query)===t(n.query)&&e.hash===n.hash}function Ds(t,e){return(t.aliasOf||t)===(e.aliasOf||e)}function jp(t,e){if(Object.keys(t).length!==Object.keys(e).length)return!1;for(const n in t)if(!g0(t[n],e[n]))return!1;return!0}function g0(t,e){return _n(t)?Jh(t,e):_n(e)?Jh(e,t):t===e}function Jh(t,e){return _n(e)?t.length===e.length&&t.every((n,r)=>n===e[r]):t.length===1&&t[0]===e}function _0(t,e){if(t.startsWith("/"))return t;if(!t)return e;const n=e.split("/"),r=t.split("/"),s=r[r.length-1];(s===".."||s===".")&&r.push("");let i=n.length-1,o,l;for(o=0;o<r.length;o++)if(l=r[o],l!==".")if(l==="..")i>1&&i--;else break;return n.slice(0,i).join("/")+"/"+r.slice(o).join("/")}const ar={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};var Vi;(function(t){t.pop="pop",t.push="push"})(Vi||(Vi={}));var bi;(function(t){t.back="back",t.forward="forward",t.unknown=""})(bi||(bi={}));function v0(t){if(!t)if(ps){const e=document.querySelector("base");t=e&&e.getAttribute("href")||"/",t=t.replace(/^\w+:\/\/[^\/]+/,"")}else t="/";return t[0]!=="/"&&t[0]!=="#"&&(t="/"+t),f0(t)}const y0=/^[^#]+#/;function w0(t,e){return t.replace(y0,"#")+e}function b0(t,e){const n=document.documentElement.getBoundingClientRect(),r=t.getBoundingClientRect();return{behavior:e.behavior,left:r.left-n.left-(e.left||0),top:r.top-n.top-(e.top||0)}}const xa=()=>({left:window.scrollX,top:window.scrollY});function E0(t){let e;if("el"in t){const n=t.el,r=typeof n=="string"&&n.startsWith("#"),s=typeof n=="string"?r?document.getElementById(n.slice(1)):document.querySelector(n):n;if(!s)return;e=b0(s,t)}else e=t;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.scrollX,e.top!=null?e.top:window.scrollY)}function Yh(t,e){return(history.state?history.state.position-e:-1)+t}const su=new Map;function T0(t,e){su.set(t,e)}function I0(t){const e=su.get(t);return su.delete(t),e}let A0=()=>location.protocol+"//"+location.host;function $p(t,e){const{pathname:n,search:r,hash:s}=e,i=t.indexOf("#");if(i>-1){let l=s.includes(t.slice(i))?t.slice(i).length:1,u=s.slice(l);return u[0]!=="/"&&(u="/"+u),Qh(u,"")}return Qh(n,t)+r+s}function S0(t,e,n,r){let s=[],i=[],o=null;const l=({state:g})=>{const v=$p(t,location),x=n.value,D=e.value;let N=0;if(g){if(n.value=v,e.value=g,o&&o===x){o=null;return}N=D?g.position-D.position:0}else r(v);s.forEach(j=>{j(n.value,x,{delta:N,type:Vi.pop,direction:N?N>0?bi.forward:bi.back:bi.unknown})})};function u(){o=n.value}function h(g){s.push(g);const v=()=>{const x=s.indexOf(g);x>-1&&s.splice(x,1)};return i.push(v),v}function d(){const{history:g}=window;g.state&&g.replaceState(Be({},g.state,{scroll:xa()}),"")}function p(){for(const g of i)g();i=[],window.removeEventListener("popstate",l),window.removeEventListener("beforeunload",d)}return window.addEventListener("popstate",l),window.addEventListener("beforeunload",d,{passive:!0}),{pauseListeners:u,listen:h,destroy:p}}function Xh(t,e,n,r=!1,s=!1){return{back:t,current:e,forward:n,replaced:r,position:window.history.length,scroll:s?xa():null}}function R0(t){const{history:e,location:n}=window,r={value:$p(t,n)},s={value:e.state};s.value||i(r.value,{back:null,current:r.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function i(u,h,d){const p=t.indexOf("#"),g=p>-1?(n.host&&document.querySelector("base")?t:t.slice(p))+u:A0()+t+u;try{e[d?"replaceState":"pushState"](h,"",g),s.value=h}catch(v){console.error(v),n[d?"replace":"assign"](g)}}function o(u,h){const d=Be({},e.state,Xh(s.value.back,u,s.value.forward,!0),h,{position:s.value.position});i(u,d,!0),r.value=u}function l(u,h){const d=Be({},s.value,e.state,{forward:u,scroll:xa()});i(d.current,d,!0);const p=Be({},Xh(r.value,u,null),{position:d.position+1},h);i(u,p,!1),r.value=u}return{location:r,state:s,push:l,replace:o}}function P0(t){t=v0(t);const e=R0(t),n=S0(t,e.state,e.location,e.replace);function r(i,o=!0){o||n.pauseListeners(),history.go(i)}const s=Be({location:"",base:t,go:r,createHref:w0.bind(null,t)},e,n);return Object.defineProperty(s,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(s,"state",{enumerable:!0,get:()=>e.state.value}),s}function C0(t){return typeof t=="string"||t&&typeof t=="object"}function Bp(t){return typeof t=="string"||typeof t=="symbol"}const qp=Symbol("");var Zh;(function(t){t[t.aborted=4]="aborted",t[t.cancelled=8]="cancelled",t[t.duplicated=16]="duplicated"})(Zh||(Zh={}));function Ns(t,e){return Be(new Error,{type:t,[qp]:!0},e)}function Fn(t,e){return t instanceof Error&&qp in t&&(e==null||!!(t.type&e))}const ed="[^/]+?",x0={sensitive:!1,strict:!1,start:!0,end:!0},k0=/[.+*?^${}()[\]/\\]/g;function D0(t,e){const n=Be({},x0,e),r=[];let s=n.start?"^":"";const i=[];for(const h of t){const d=h.length?[]:[90];n.strict&&!h.length&&(s+="/");for(let p=0;p<h.length;p++){const g=h[p];let v=40+(n.sensitive?.25:0);if(g.type===0)p||(s+="/"),s+=g.value.replace(k0,"\\$&"),v+=40;else if(g.type===1){const{value:x,repeatable:D,optional:N,regexp:j}=g;i.push({name:x,repeatable:D,optional:N});const B=j||ed;if(B!==ed){v+=10;try{new RegExp(`(${B})`)}catch(G){throw new Error(`Invalid custom RegExp for param "${x}" (${B}): `+G.message)}}let W=D?`((?:${B})(?:/(?:${B}))*)`:`(${B})`;p||(W=N&&h.length<2?`(?:/${W})`:"/"+W),N&&(W+="?"),s+=W,v+=20,N&&(v+=-8),D&&(v+=-20),B===".*"&&(v+=-50)}d.push(v)}r.push(d)}if(n.strict&&n.end){const h=r.length-1;r[h][r[h].length-1]+=.7000000000000001}n.strict||(s+="/?"),n.end?s+="$":n.strict&&!s.endsWith("/")&&(s+="(?:/|$)");const o=new RegExp(s,n.sensitive?"":"i");function l(h){const d=h.match(o),p={};if(!d)return null;for(let g=1;g<d.length;g++){const v=d[g]||"",x=i[g-1];p[x.name]=v&&x.repeatable?v.split("/"):v}return p}function u(h){let d="",p=!1;for(const g of t){(!p||!d.endsWith("/"))&&(d+="/"),p=!1;for(const v of g)if(v.type===0)d+=v.value;else if(v.type===1){const{value:x,repeatable:D,optional:N}=v,j=x in h?h[x]:"";if(_n(j)&&!D)throw new Error(`Provided param "${x}" is an array but it is not repeatable (* or + modifiers)`);const B=_n(j)?j.join("/"):j;if(!B)if(N)g.length<2&&(d.endsWith("/")?d=d.slice(0,-1):p=!0);else throw new Error(`Missing required param "${x}"`);d+=B}}return d||"/"}return{re:o,score:r,keys:i,parse:l,stringify:u}}function N0(t,e){let n=0;for(;n<t.length&&n<e.length;){const r=e[n]-t[n];if(r)return r;n++}return t.length<e.length?t.length===1&&t[0]===40+40?-1:1:t.length>e.length?e.length===1&&e[0]===40+40?1:-1:0}function zp(t,e){let n=0;const r=t.score,s=e.score;for(;n<r.length&&n<s.length;){const i=N0(r[n],s[n]);if(i)return i;n++}if(Math.abs(s.length-r.length)===1){if(td(r))return 1;if(td(s))return-1}return s.length-r.length}function td(t){const e=t[t.length-1];return t.length>0&&e[e.length-1]<0}const V0={type:0,value:""},O0=/[a-zA-Z0-9_]/;function M0(t){if(!t)return[[]];if(t==="/")return[[V0]];if(!t.startsWith("/"))throw new Error(`Invalid path "${t}"`);function e(v){throw new Error(`ERR (${n})/"${h}": ${v}`)}let n=0,r=n;const s=[];let i;function o(){i&&s.push(i),i=[]}let l=0,u,h="",d="";function p(){h&&(n===0?i.push({type:0,value:h}):n===1||n===2||n===3?(i.length>1&&(u==="*"||u==="+")&&e(`A repeatable param (${h}) must be alone in its segment. eg: '/:ids+.`),i.push({type:1,value:h,regexp:d,repeatable:u==="*"||u==="+",optional:u==="*"||u==="?"})):e("Invalid state to consume buffer"),h="")}function g(){h+=u}for(;l<t.length;){if(u=t[l++],u==="\\"&&n!==2){r=n,n=4;continue}switch(n){case 0:u==="/"?(h&&p(),o()):u===":"?(p(),n=1):g();break;case 4:g(),n=r;break;case 1:u==="("?n=2:O0.test(u)?g():(p(),n=0,u!=="*"&&u!=="?"&&u!=="+"&&l--);break;case 2:u===")"?d[d.length-1]=="\\"?d=d.slice(0,-1)+u:n=3:d+=u;break;case 3:p(),n=0,u!=="*"&&u!=="?"&&u!=="+"&&l--,d="";break;default:e("Unknown state");break}}return n===2&&e(`Unfinished custom RegExp for param "${h}"`),p(),o(),s}function L0(t,e,n){const r=D0(M0(t.path),n),s=Be(r,{record:t,parent:e,children:[],alias:[]});return e&&!s.record.aliasOf==!e.record.aliasOf&&e.children.push(s),s}function F0(t,e){const n=[],r=new Map;e=id({strict:!1,end:!0,sensitive:!1},e);function s(p){return r.get(p)}function i(p,g,v){const x=!v,D=rd(p);D.aliasOf=v&&v.record;const N=id(e,p),j=[D];if("alias"in p){const G=typeof p.alias=="string"?[p.alias]:p.alias;for(const fe of G)j.push(rd(Be({},D,{components:v?v.record.components:D.components,path:fe,aliasOf:v?v.record:D})))}let B,W;for(const G of j){const{path:fe}=G;if(g&&fe[0]!=="/"){const oe=g.record.path,P=oe[oe.length-1]==="/"?"":"/";G.path=g.record.path+(fe&&P+fe)}if(B=L0(G,g,N),v?v.alias.push(B):(W=W||B,W!==B&&W.alias.push(B),x&&p.name&&!sd(B)&&o(p.name)),Hp(B)&&u(B),D.children){const oe=D.children;for(let P=0;P<oe.length;P++)i(oe[P],B,v&&v.children[P])}v=v||B}return W?()=>{o(W)}:wi}function o(p){if(Bp(p)){const g=r.get(p);g&&(r.delete(p),n.splice(n.indexOf(g),1),g.children.forEach(o),g.alias.forEach(o))}else{const g=n.indexOf(p);g>-1&&(n.splice(g,1),p.record.name&&r.delete(p.record.name),p.children.forEach(o),p.alias.forEach(o))}}function l(){return n}function u(p){const g=$0(p,n);n.splice(g,0,p),p.record.name&&!sd(p)&&r.set(p.record.name,p)}function h(p,g){let v,x={},D,N;if("name"in p&&p.name){if(v=r.get(p.name),!v)throw Ns(1,{location:p});N=v.record.name,x=Be(nd(g.params,v.keys.filter(W=>!W.optional).concat(v.parent?v.parent.keys.filter(W=>W.optional):[]).map(W=>W.name)),p.params&&nd(p.params,v.keys.map(W=>W.name))),D=v.stringify(x)}else if(p.path!=null)D=p.path,v=n.find(W=>W.re.test(D)),v&&(x=v.parse(D),N=v.record.name);else{if(v=g.name?r.get(g.name):n.find(W=>W.re.test(g.path)),!v)throw Ns(1,{location:p,currentLocation:g});N=v.record.name,x=Be({},g.params,p.params),D=v.stringify(x)}const j=[];let B=v;for(;B;)j.unshift(B.record),B=B.parent;return{name:N,path:D,params:x,matched:j,meta:j0(j)}}t.forEach(p=>i(p));function d(){n.length=0,r.clear()}return{addRoute:i,resolve:h,removeRoute:o,clearRoutes:d,getRoutes:l,getRecordMatcher:s}}function nd(t,e){const n={};for(const r of e)r in t&&(n[r]=t[r]);return n}function rd(t){const e={path:t.path,redirect:t.redirect,name:t.name,meta:t.meta||{},aliasOf:t.aliasOf,beforeEnter:t.beforeEnter,props:U0(t),children:t.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in t?t.components||null:t.component&&{default:t.component}};return Object.defineProperty(e,"mods",{value:{}}),e}function U0(t){const e={},n=t.props||!1;if("component"in t)e.default=n;else for(const r in t.components)e[r]=typeof n=="object"?n[r]:n;return e}function sd(t){for(;t;){if(t.record.aliasOf)return!0;t=t.parent}return!1}function j0(t){return t.reduce((e,n)=>Be(e,n.meta),{})}function id(t,e){const n={};for(const r in t)n[r]=r in e?e[r]:t[r];return n}function $0(t,e){let n=0,r=e.length;for(;n!==r;){const i=n+r>>1;zp(t,e[i])<0?r=i:n=i+1}const s=B0(t);return s&&(r=e.lastIndexOf(s,r-1)),r}function B0(t){let e=t;for(;e=e.parent;)if(Hp(e)&&zp(t,e)===0)return e}function Hp({record:t}){return!!(t.name||t.components&&Object.keys(t.components).length||t.redirect)}function q0(t){const e={};if(t===""||t==="?")return e;const r=(t[0]==="?"?t.slice(1):t).split("&");for(let s=0;s<r.length;++s){const i=r[s].replace(Mp," "),o=i.indexOf("="),l=Ni(o<0?i:i.slice(0,o)),u=o<0?null:Ni(i.slice(o+1));if(l in e){let h=e[l];_n(h)||(h=e[l]=[h]),h.push(u)}else e[l]=u}return e}function od(t){let e="";for(let n in t){const r=t[n];if(n=u0(n),r==null){r!==void 0&&(e+=(e.length?"&":"")+n);continue}(_n(r)?r.map(i=>i&&ru(i)):[r&&ru(r)]).forEach(i=>{i!==void 0&&(e+=(e.length?"&":"")+n,i!=null&&(e+="="+i))})}return e}function z0(t){const e={};for(const n in t){const r=t[n];r!==void 0&&(e[n]=_n(r)?r.map(s=>s==null?null:""+s):r==null?r:""+r)}return e}const H0=Symbol(""),ad=Symbol(""),ka=Symbol(""),Kp=Symbol(""),iu=Symbol("");function oi(){let t=[];function e(r){return t.push(r),()=>{const s=t.indexOf(r);s>-1&&t.splice(s,1)}}function n(){t=[]}return{add:e,list:()=>t.slice(),reset:n}}function hr(t,e,n,r,s,i=o=>o()){const o=r&&(r.enterCallbacks[s]=r.enterCallbacks[s]||[]);return()=>new Promise((l,u)=>{const h=g=>{g===!1?u(Ns(4,{from:n,to:e})):g instanceof Error?u(g):C0(g)?u(Ns(2,{from:e,to:g})):(o&&r.enterCallbacks[s]===o&&typeof g=="function"&&o.push(g),l())},d=i(()=>t.call(r&&r.instances[s],e,n,h));let p=Promise.resolve(d);t.length<3&&(p=p.then(h)),p.catch(g=>u(g))})}function Cl(t,e,n,r,s=i=>i()){const i=[];for(const o of t)for(const l in o.components){let u=o.components[l];if(!(e!=="beforeRouteEnter"&&!o.instances[l]))if(Vp(u)){const d=(u.__vccOpts||u)[e];d&&i.push(hr(d,n,r,o,l,s))}else{let h=u();i.push(()=>h.then(d=>{if(!d)throw new Error(`Couldn't resolve component "${l}" at "${o.path}"`);const p=Xy(d)?d.default:d;o.mods[l]=d,o.components[l]=p;const v=(p.__vccOpts||p)[e];return v&&hr(v,n,r,o,l,s)()}))}}return i}function ld(t){const e=An(ka),n=An(Kp),r=Ht(()=>{const u=Es(t.to);return e.resolve(u)}),s=Ht(()=>{const{matched:u}=r.value,{length:h}=u,d=u[h-1],p=n.matched;if(!d||!p.length)return-1;const g=p.findIndex(Ds.bind(null,d));if(g>-1)return g;const v=ud(u[h-2]);return h>1&&ud(d)===v&&p[p.length-1].path!==v?p.findIndex(Ds.bind(null,u[h-2])):g}),i=Ht(()=>s.value>-1&&J0(n.params,r.value.params)),o=Ht(()=>s.value>-1&&s.value===n.matched.length-1&&jp(n.params,r.value.params));function l(u={}){if(Q0(u)){const h=e[Es(t.replace)?"replace":"push"](Es(t.to)).catch(wi);return t.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>h),h}return Promise.resolve()}return{route:r,href:Ht(()=>r.value.href),isActive:i,isExactActive:o,navigate:l}}function K0(t){return t.length===1?t[0]:t}const W0=sp({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:ld,setup(t,{slots:e}){const n=Ia(ld(t)),{options:r}=An(ka),s=Ht(()=>({[cd(t.activeClass,r.linkActiveClass,"router-link-active")]:n.isActive,[cd(t.exactActiveClass,r.linkExactActiveClass,"router-link-exact-active")]:n.isExactActive}));return()=>{const i=e.default&&K0(e.default(n));return t.custom?i:Dp("a",{"aria-current":n.isExactActive?t.ariaCurrentValue:null,href:n.href,onClick:n.navigate,class:s.value},i)}}}),G0=W0;function Q0(t){if(!(t.metaKey||t.altKey||t.ctrlKey||t.shiftKey)&&!t.defaultPrevented&&!(t.button!==void 0&&t.button!==0)){if(t.currentTarget&&t.currentTarget.getAttribute){const e=t.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return t.preventDefault&&t.preventDefault(),!0}}function J0(t,e){for(const n in e){const r=e[n],s=t[n];if(typeof r=="string"){if(r!==s)return!1}else if(!_n(s)||s.length!==r.length||r.some((i,o)=>i!==s[o]))return!1}return!0}function ud(t){return t?t.aliasOf?t.aliasOf.path:t.path:""}const cd=(t,e,n)=>t??e??n,Y0=sp({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(t,{attrs:e,slots:n}){const r=An(iu),s=Ht(()=>t.route||r.value),i=An(ad,0),o=Ht(()=>{let h=Es(i);const{matched:d}=s.value;let p;for(;(p=d[h])&&!p.components;)h++;return h}),l=Ht(()=>s.value.matched[o.value]);Oo(ad,Ht(()=>o.value+1)),Oo(H0,l),Oo(iu,s);const u=se();return yr(()=>[u.value,l.value,t.name],([h,d,p],[g,v,x])=>{d&&(d.instances[p]=h,v&&v!==d&&h&&h===g&&(d.leaveGuards.size||(d.leaveGuards=v.leaveGuards),d.updateGuards.size||(d.updateGuards=v.updateGuards))),h&&d&&(!v||!Ds(d,v)||!g)&&(d.enterCallbacks[p]||[]).forEach(D=>D(h))},{flush:"post"}),()=>{const h=s.value,d=t.name,p=l.value,g=p&&p.components[d];if(!g)return hd(n.default,{Component:g,route:h});const v=p.props[d],x=v?v===!0?h.params:typeof v=="function"?v(h):v:null,N=Dp(g,Be({},x,e,{onVnodeUnmounted:j=>{j.component.isUnmounted&&(p.instances[d]=null)},ref:u}));return hd(n.default,{Component:N,route:h})||N}}});function hd(t,e){if(!t)return null;const n=t(e);return n.length===1?n[0]:n}const X0=Y0;function Z0(t){const e=F0(t.routes,t),n=t.parseQuery||q0,r=t.stringifyQuery||od,s=t.history,i=oi(),o=oi(),l=oi(),u=lv(ar);let h=ar;ps&&t.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const d=Rl.bind(null,L=>""+L),p=Rl.bind(null,h0),g=Rl.bind(null,Ni);function v(L,te){let H,Y;return Bp(L)?(H=e.getRecordMatcher(L),Y=te):Y=L,e.addRoute(Y,H)}function x(L){const te=e.getRecordMatcher(L);te&&e.removeRoute(te)}function D(){return e.getRoutes().map(L=>L.record)}function N(L){return!!e.getRecordMatcher(L)}function j(L,te){if(te=Be({},te||u.value),typeof L=="string"){const A=Pl(n,L,te.path),k=e.resolve({path:A.path},te),U=s.createHref(A.fullPath);return Be(A,k,{params:g(k.params),hash:Ni(A.hash),redirectedFrom:void 0,href:U})}let H;if(L.path!=null)H=Be({},L,{path:Pl(n,L.path,te.path).path});else{const A=Be({},L.params);for(const k in A)A[k]==null&&delete A[k];H=Be({},L,{params:p(A)}),te.params=p(te.params)}const Y=e.resolve(H,te),pe=L.hash||"";Y.params=d(g(Y.params));const Ee=p0(r,Be({},L,{hash:l0(pe),path:Y.path})),b=s.createHref(Ee);return Be({fullPath:Ee,hash:pe,query:r===od?z0(L.query):L.query||{}},Y,{redirectedFrom:void 0,href:b})}function B(L){return typeof L=="string"?Pl(n,L,u.value.path):Be({},L)}function W(L,te){if(h!==L)return Ns(8,{from:te,to:L})}function G(L){return P(L)}function fe(L){return G(Be(B(L),{replace:!0}))}function oe(L){const te=L.matched[L.matched.length-1];if(te&&te.redirect){const{redirect:H}=te;let Y=typeof H=="function"?H(L):H;return typeof Y=="string"&&(Y=Y.includes("?")||Y.includes("#")?Y=B(Y):{path:Y},Y.params={}),Be({query:L.query,hash:L.hash,params:Y.path!=null?{}:L.params},Y)}}function P(L,te){const H=h=j(L),Y=u.value,pe=L.state,Ee=L.force,b=L.replace===!0,A=oe(H);if(A)return P(Be(B(A),{state:typeof A=="object"?Be({},pe,A.state):pe,force:Ee,replace:b}),te||H);const k=H;k.redirectedFrom=te;let U;return!Ee&&m0(r,Y,H)&&(U=Ns(16,{to:k,from:Y}),_t(Y,Y,!0,!1)),(U?Promise.resolve(U):S(k,Y)).catch(M=>Fn(M)?Fn(M,2)?M:kt(M):xe(M,k,Y)).then(M=>{if(M){if(Fn(M,2))return P(Be({replace:b},B(M.to),{state:typeof M.to=="object"?Be({},pe,M.to.state):pe,force:Ee}),te||k)}else M=T(k,Y,!0,b,pe);return y(k,Y,M),M})}function E(L,te){const H=W(L,te);return H?Promise.reject(H):Promise.resolve()}function I(L){const te=Wt.values().next().value;return te&&typeof te.runWithContext=="function"?te.runWithContext(L):L()}function S(L,te){let H;const[Y,pe,Ee]=ew(L,te);H=Cl(Y.reverse(),"beforeRouteLeave",L,te);for(const A of Y)A.leaveGuards.forEach(k=>{H.push(hr(k,L,te))});const b=E.bind(null,L,te);return H.push(b),Dt(H).then(()=>{H=[];for(const A of i.list())H.push(hr(A,L,te));return H.push(b),Dt(H)}).then(()=>{H=Cl(pe,"beforeRouteUpdate",L,te);for(const A of pe)A.updateGuards.forEach(k=>{H.push(hr(k,L,te))});return H.push(b),Dt(H)}).then(()=>{H=[];for(const A of Ee)if(A.beforeEnter)if(_n(A.beforeEnter))for(const k of A.beforeEnter)H.push(hr(k,L,te));else H.push(hr(A.beforeEnter,L,te));return H.push(b),Dt(H)}).then(()=>(L.matched.forEach(A=>A.enterCallbacks={}),H=Cl(Ee,"beforeRouteEnter",L,te,I),H.push(b),Dt(H))).then(()=>{H=[];for(const A of o.list())H.push(hr(A,L,te));return H.push(b),Dt(H)}).catch(A=>Fn(A,8)?A:Promise.reject(A))}function y(L,te,H){l.list().forEach(Y=>I(()=>Y(L,te,H)))}function T(L,te,H,Y,pe){const Ee=W(L,te);if(Ee)return Ee;const b=te===ar,A=ps?history.state:{};H&&(Y||b?s.replace(L.fullPath,Be({scroll:b&&A&&A.scroll},pe)):s.push(L.fullPath,pe)),u.value=L,_t(L,te,H,b),kt()}let w;function Le(){w||(w=s.listen((L,te,H)=>{if(!ln.listening)return;const Y=j(L),pe=oe(Y);if(pe){P(Be(pe,{replace:!0,force:!0}),Y).catch(wi);return}h=Y;const Ee=u.value;ps&&T0(Yh(Ee.fullPath,H.delta),xa()),S(Y,Ee).catch(b=>Fn(b,12)?b:Fn(b,2)?(P(Be(B(b.to),{force:!0}),Y).then(A=>{Fn(A,20)&&!H.delta&&H.type===Vi.pop&&s.go(-1,!1)}).catch(wi),Promise.reject()):(H.delta&&s.go(-H.delta,!1),xe(b,Y,Ee))).then(b=>{b=b||T(Y,Ee,!1),b&&(H.delta&&!Fn(b,8)?s.go(-H.delta,!1):H.type===Vi.pop&&Fn(b,20)&&s.go(-1,!1)),y(Y,Ee,b)}).catch(wi)}))}let ot=oi(),Oe=oi(),Ce;function xe(L,te,H){kt(L);const Y=Oe.list();return Y.length?Y.forEach(pe=>pe(L,te,H)):console.error(L),Promise.reject(L)}function gt(){return Ce&&u.value!==ar?Promise.resolve():new Promise((L,te)=>{ot.add([L,te])})}function kt(L){return Ce||(Ce=!L,Le(),ot.list().forEach(([te,H])=>L?H(L):te()),ot.reset()),L}function _t(L,te,H,Y){const{scrollBehavior:pe}=t;if(!ps||!pe)return Promise.resolve();const Ee=!H&&I0(Yh(L.fullPath,0))||(Y||!H)&&history.state&&history.state.scroll||null;return xs().then(()=>pe(L,te,Ee)).then(b=>b&&E0(b)).catch(b=>xe(b,L,te))}const $e=L=>s.go(L);let He;const Wt=new Set,ln={currentRoute:u,listening:!0,addRoute:v,removeRoute:x,clearRoutes:e.clearRoutes,hasRoute:N,getRoutes:D,resolve:j,options:t,push:G,replace:fe,go:$e,back:()=>$e(-1),forward:()=>$e(1),beforeEach:i.add,beforeResolve:o.add,afterEach:l.add,onError:Oe.add,isReady:gt,install(L){const te=this;L.component("RouterLink",G0),L.component("RouterView",X0),L.config.globalProperties.$router=te,Object.defineProperty(L.config.globalProperties,"$route",{enumerable:!0,get:()=>Es(u)}),ps&&!He&&u.value===ar&&(He=!0,G(s.location).catch(pe=>{}));const H={};for(const pe in ar)Object.defineProperty(H,pe,{get:()=>u.value[pe],enumerable:!0});L.provide(ka,te),L.provide(Kp,Qf(H)),L.provide(iu,u);const Y=L.unmount;Wt.add(L),L.unmount=function(){Wt.delete(L),Wt.size<1&&(h=ar,w&&w(),w=null,u.value=ar,He=!1,Ce=!1),Y()}}};function Dt(L){return L.reduce((te,H)=>te.then(()=>I(H)),Promise.resolve())}return ln}function ew(t,e){const n=[],r=[],s=[],i=Math.max(e.matched.length,t.matched.length);for(let o=0;o<i;o++){const l=e.matched[o];l&&(t.matched.find(h=>Ds(h,l))?r.push(l):n.push(l));const u=t.matched[o];u&&(e.matched.find(h=>Ds(h,u))||s.push(u))}return[n,r,s]}function Wp(){return An(ka)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */const Gp=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=s&63|128):(s&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=s&63|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=s&63|128)}return e},tw=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const s=t[n++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=t[n++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=t[n++],o=t[n++],l=t[n++],u=((s&7)<<18|(i&63)<<12|(o&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(u>>10)),e[r++]=String.fromCharCode(56320+(u&1023))}else{const i=t[n++],o=t[n++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|o&63)}}return e.join("")},Qp={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<t.length;s+=3){const i=t[s],o=s+1<t.length,l=o?t[s+1]:0,u=s+2<t.length,h=u?t[s+2]:0,d=i>>2,p=(i&3)<<4|l>>4;let g=(l&15)<<2|h>>6,v=h&63;u||(v=64,o||(g=64)),r.push(n[d],n[p],n[g],n[v])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Gp(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):tw(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<t.length;){const i=n[t.charAt(s++)],l=s<t.length?n[t.charAt(s)]:0;++s;const h=s<t.length?n[t.charAt(s)]:64;++s;const p=s<t.length?n[t.charAt(s)]:64;if(++s,i==null||l==null||h==null||p==null)throw new nw;const g=i<<2|l>>4;if(r.push(g),h!==64){const v=l<<4&240|h>>2;if(r.push(v),p!==64){const x=h<<6&192|p;r.push(x)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class nw extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const rw=function(t){const e=Gp(t);return Qp.encodeByteArray(e,!0)},ta=function(t){return rw(t).replace(/\./g,"")},Jp=function(t){try{return Qp.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function sw(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const iw=()=>sw().__FIREBASE_DEFAULTS__,ow=()=>{if(typeof process>"u"||typeof process.env>"u")return;const t={}.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},aw=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Jp(t[1]);return e&&JSON.parse(e)},Da=()=>{try{return iw()||ow()||aw()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Yp=t=>{var e,n;return(n=(e=Da())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[t]},lw=t=>{const e=Yp(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},Xp=()=>{var t;return(t=Da())===null||t===void 0?void 0:t.config},Zp=t=>{var e;return(e=Da())===null||e===void 0?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uw{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
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
 */function cw(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",s=t.iat||0,i=t.sub||t.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const o=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},t),l="";return[ta(JSON.stringify(n)),ta(JSON.stringify(o)),l].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function $t(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function hw(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test($t())}function dw(){var t;const e=(t=Da())===null||t===void 0?void 0:t.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function fw(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function pw(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function mw(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function gw(){const t=$t();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function _w(){return!dw()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function vw(){try{return typeof indexedDB=="object"}catch{return!1}}function yw(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ww="FirebaseError";class tr extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=ww,Object.setPrototypeOf(this,tr.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Wi.prototype.create)}}class Wi{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},s=`${this.service}/${e}`,i=this.errors[e],o=i?bw(i,r):"Error",l=`${this.serviceName}: ${o} (${s}).`;return new tr(s,l,r)}}function bw(t,e){return t.replace(Ew,(n,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const Ew=/\{\$([^}]+)}/g;function Tw(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function na(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const s of n){if(!r.includes(s))return!1;const i=t[s],o=e[s];if(dd(i)&&dd(o)){if(!na(i,o))return!1}else if(i!==o)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function dd(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Gi(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function Iw(t,e){const n=new Aw(t,e);return n.subscribe.bind(n)}class Aw{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let s;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");Sw(e,["next","error","complete"])?s=e:s={next:e,error:n,complete:r},s.next===void 0&&(s.next=xl),s.error===void 0&&(s.error=xl),s.complete===void 0&&(s.complete=xl);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Sw(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function xl(){}/**
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
 */function Bt(t){return t&&t._delegate?t._delegate:t}class Wr{constructor(e,n,r){this.name=e,this.instanceFactory=n,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const qr="[DEFAULT]";/**
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
 */class Rw{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new uw;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:n});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(Cw(e))try{this.getOrInitializeService({instanceIdentifier:qr})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=qr){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=qr){return this.instances.has(e)}getOptions(e=qr){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[i,o]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(i);r===l&&o.resolve(s)}return s}onInit(e,n){var r;const s=this.normalizeInstanceIdentifier(n),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const o=this.instances.get(s);return o&&e(o,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const s of r)try{s(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Pw(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=qr){return this.component?this.component.multipleInstances?e:qr:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Pw(t){return t===qr?void 0:t}function Cw(t){return t.instantiationMode==="EAGER"}/**
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
 */class xw{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new Rw(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Ne;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(Ne||(Ne={}));const kw={debug:Ne.DEBUG,verbose:Ne.VERBOSE,info:Ne.INFO,warn:Ne.WARN,error:Ne.ERROR,silent:Ne.SILENT},Dw=Ne.INFO,Nw={[Ne.DEBUG]:"log",[Ne.VERBOSE]:"log",[Ne.INFO]:"info",[Ne.WARN]:"warn",[Ne.ERROR]:"error"},Vw=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),s=Nw[e];if(s)console[s](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Qu{constructor(e){this.name=e,this._logLevel=Dw,this._logHandler=Vw,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Ne))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?kw[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Ne.DEBUG,...e),this._logHandler(this,Ne.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Ne.VERBOSE,...e),this._logHandler(this,Ne.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Ne.INFO,...e),this._logHandler(this,Ne.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Ne.WARN,...e),this._logHandler(this,Ne.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Ne.ERROR,...e),this._logHandler(this,Ne.ERROR,...e)}}const Ow=(t,e)=>e.some(n=>t instanceof n);let fd,pd;function Mw(){return fd||(fd=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function Lw(){return pd||(pd=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const em=new WeakMap,ou=new WeakMap,tm=new WeakMap,kl=new WeakMap,Ju=new WeakMap;function Fw(t){const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("success",i),t.removeEventListener("error",o)},i=()=>{n(wr(t.result)),s()},o=()=>{r(t.error),s()};t.addEventListener("success",i),t.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&em.set(n,t)}).catch(()=>{}),Ju.set(e,t),e}function Uw(t){if(ou.has(t))return;const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",o),t.removeEventListener("abort",o)},i=()=>{n(),s()},o=()=>{r(t.error||new DOMException("AbortError","AbortError")),s()};t.addEventListener("complete",i),t.addEventListener("error",o),t.addEventListener("abort",o)});ou.set(t,e)}let au={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return ou.get(t);if(e==="objectStoreNames")return t.objectStoreNames||tm.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return wr(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function jw(t){au=t(au)}function $w(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(Dl(this),e,...n);return tm.set(r,e.sort?e.sort():[e]),wr(r)}:Lw().includes(t)?function(...e){return t.apply(Dl(this),e),wr(em.get(this))}:function(...e){return wr(t.apply(Dl(this),e))}}function Bw(t){return typeof t=="function"?$w(t):(t instanceof IDBTransaction&&Uw(t),Ow(t,Mw())?new Proxy(t,au):t)}function wr(t){if(t instanceof IDBRequest)return Fw(t);if(kl.has(t))return kl.get(t);const e=Bw(t);return e!==t&&(kl.set(t,e),Ju.set(e,t)),e}const Dl=t=>Ju.get(t);function qw(t,e,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const o=indexedDB.open(t,e),l=wr(o);return r&&o.addEventListener("upgradeneeded",u=>{r(wr(o.result),u.oldVersion,u.newVersion,wr(o.transaction),u)}),n&&o.addEventListener("blocked",u=>n(u.oldVersion,u.newVersion,u)),l.then(u=>{i&&u.addEventListener("close",()=>i()),s&&u.addEventListener("versionchange",h=>s(h.oldVersion,h.newVersion,h))}).catch(()=>{}),l}const zw=["get","getKey","getAll","getAllKeys","count"],Hw=["put","add","delete","clear"],Nl=new Map;function md(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(Nl.get(e))return Nl.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,s=Hw.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(s||zw.includes(n)))return;const i=async function(o,...l){const u=this.transaction(o,s?"readwrite":"readonly");let h=u.store;return r&&(h=h.index(l.shift())),(await Promise.all([h[n](...l),s&&u.done]))[0]};return Nl.set(e,i),i}jw(t=>({...t,get:(e,n,r)=>md(e,n)||t.get(e,n,r),has:(e,n)=>!!md(e,n)||t.has(e,n)}));/**
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
 */class Kw{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(Ww(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function Ww(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const lu="@firebase/app",gd="0.10.13";/**
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
 */const Qn=new Qu("@firebase/app"),Gw="@firebase/app-compat",Qw="@firebase/analytics-compat",Jw="@firebase/analytics",Yw="@firebase/app-check-compat",Xw="@firebase/app-check",Zw="@firebase/auth",eb="@firebase/auth-compat",tb="@firebase/database",nb="@firebase/data-connect",rb="@firebase/database-compat",sb="@firebase/functions",ib="@firebase/functions-compat",ob="@firebase/installations",ab="@firebase/installations-compat",lb="@firebase/messaging",ub="@firebase/messaging-compat",cb="@firebase/performance",hb="@firebase/performance-compat",db="@firebase/remote-config",fb="@firebase/remote-config-compat",pb="@firebase/storage",mb="@firebase/storage-compat",gb="@firebase/firestore",_b="@firebase/vertexai-preview",vb="@firebase/firestore-compat",yb="firebase",wb="10.14.1";/**
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
 */const uu="[DEFAULT]",bb={[lu]:"fire-core",[Gw]:"fire-core-compat",[Jw]:"fire-analytics",[Qw]:"fire-analytics-compat",[Xw]:"fire-app-check",[Yw]:"fire-app-check-compat",[Zw]:"fire-auth",[eb]:"fire-auth-compat",[tb]:"fire-rtdb",[nb]:"fire-data-connect",[rb]:"fire-rtdb-compat",[sb]:"fire-fn",[ib]:"fire-fn-compat",[ob]:"fire-iid",[ab]:"fire-iid-compat",[lb]:"fire-fcm",[ub]:"fire-fcm-compat",[cb]:"fire-perf",[hb]:"fire-perf-compat",[db]:"fire-rc",[fb]:"fire-rc-compat",[pb]:"fire-gcs",[mb]:"fire-gcs-compat",[gb]:"fire-fst",[vb]:"fire-fst-compat",[_b]:"fire-vertex","fire-js":"fire-js",[yb]:"fire-js-all"};/**
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
 */const ra=new Map,Eb=new Map,cu=new Map;function _d(t,e){try{t.container.addComponent(e)}catch(n){Qn.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function Vs(t){const e=t.name;if(cu.has(e))return Qn.debug(`There were multiple attempts to register component ${e}.`),!1;cu.set(e,t);for(const n of ra.values())_d(n,t);for(const n of Eb.values())_d(n,t);return!0}function Yu(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Bn(t){return t.settings!==void 0}/**
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
 */const Tb={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},br=new Wi("app","Firebase",Tb);/**
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
 */class Ib{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Wr("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw br.create("app-deleted",{appName:this._name})}}/**
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
 */const Bs=wb;function nm(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:uu,automaticDataCollectionEnabled:!1},e),s=r.name;if(typeof s!="string"||!s)throw br.create("bad-app-name",{appName:String(s)});if(n||(n=Xp()),!n)throw br.create("no-options");const i=ra.get(s);if(i){if(na(n,i.options)&&na(r,i.config))return i;throw br.create("duplicate-app",{appName:s})}const o=new xw(s);for(const u of cu.values())o.addComponent(u);const l=new Ib(n,r,o);return ra.set(s,l),l}function rm(t=uu){const e=ra.get(t);if(!e&&t===uu&&Xp())return nm();if(!e)throw br.create("no-app",{appName:t});return e}function Er(t,e,n){var r;let s=(r=bb[t])!==null&&r!==void 0?r:t;n&&(s+=`-${n}`);const i=s.match(/\s|\//),o=e.match(/\s|\//);if(i||o){const l=[`Unable to register library "${s}" with version "${e}":`];i&&l.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&o&&l.push("and"),o&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Qn.warn(l.join(" "));return}Vs(new Wr(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const Ab="firebase-heartbeat-database",Sb=1,Oi="firebase-heartbeat-store";let Vl=null;function sm(){return Vl||(Vl=qw(Ab,Sb,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Oi)}catch(n){console.warn(n)}}}}).catch(t=>{throw br.create("idb-open",{originalErrorMessage:t.message})})),Vl}async function Rb(t){try{const n=(await sm()).transaction(Oi),r=await n.objectStore(Oi).get(im(t));return await n.done,r}catch(e){if(e instanceof tr)Qn.warn(e.message);else{const n=br.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Qn.warn(n.message)}}}async function vd(t,e){try{const r=(await sm()).transaction(Oi,"readwrite");await r.objectStore(Oi).put(e,im(t)),await r.done}catch(n){if(n instanceof tr)Qn.warn(n.message);else{const r=br.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Qn.warn(r.message)}}}function im(t){return`${t.name}!${t.options.appId}`}/**
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
 */const Pb=1024,Cb=30*24*60*60*1e3;class xb{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new Db(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=yd();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(o=>o.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(o=>{const l=new Date(o.date).valueOf();return Date.now()-l<=Cb}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Qn.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=yd(),{heartbeatsToSend:r,unsentEntries:s}=kb(this._heartbeatsCache.heartbeats),i=ta(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(n){return Qn.warn(n),""}}}function yd(){return new Date().toISOString().substring(0,10)}function kb(t,e=Pb){const n=[];let r=t.slice();for(const s of t){const i=n.find(o=>o.agent===s.agent);if(i){if(i.dates.push(s.date),wd(n)>e){i.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),wd(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class Db{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return vw()?yw().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await Rb(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return vd(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return vd(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function wd(t){return ta(JSON.stringify({version:2,heartbeats:t})).length}/**
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
 */function Nb(t){Vs(new Wr("platform-logger",e=>new Kw(e),"PRIVATE")),Vs(new Wr("heartbeat",e=>new xb(e),"PRIVATE")),Er(lu,gd,t),Er(lu,gd,"esm2017"),Er("fire-js","")}Nb("");var Vb="firebase",Ob="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Er(Vb,Ob,"app");var bd=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Kr,om;(function(){var t;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(P,E){function I(){}I.prototype=E.prototype,P.D=E.prototype,P.prototype=new I,P.prototype.constructor=P,P.C=function(S,y,T){for(var w=Array(arguments.length-2),Le=2;Le<arguments.length;Le++)w[Le-2]=arguments[Le];return E.prototype[y].apply(S,w)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,n),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(P,E,I){I||(I=0);var S=Array(16);if(typeof E=="string")for(var y=0;16>y;++y)S[y]=E.charCodeAt(I++)|E.charCodeAt(I++)<<8|E.charCodeAt(I++)<<16|E.charCodeAt(I++)<<24;else for(y=0;16>y;++y)S[y]=E[I++]|E[I++]<<8|E[I++]<<16|E[I++]<<24;E=P.g[0],I=P.g[1],y=P.g[2];var T=P.g[3],w=E+(T^I&(y^T))+S[0]+3614090360&4294967295;E=I+(w<<7&4294967295|w>>>25),w=T+(y^E&(I^y))+S[1]+3905402710&4294967295,T=E+(w<<12&4294967295|w>>>20),w=y+(I^T&(E^I))+S[2]+606105819&4294967295,y=T+(w<<17&4294967295|w>>>15),w=I+(E^y&(T^E))+S[3]+3250441966&4294967295,I=y+(w<<22&4294967295|w>>>10),w=E+(T^I&(y^T))+S[4]+4118548399&4294967295,E=I+(w<<7&4294967295|w>>>25),w=T+(y^E&(I^y))+S[5]+1200080426&4294967295,T=E+(w<<12&4294967295|w>>>20),w=y+(I^T&(E^I))+S[6]+2821735955&4294967295,y=T+(w<<17&4294967295|w>>>15),w=I+(E^y&(T^E))+S[7]+4249261313&4294967295,I=y+(w<<22&4294967295|w>>>10),w=E+(T^I&(y^T))+S[8]+1770035416&4294967295,E=I+(w<<7&4294967295|w>>>25),w=T+(y^E&(I^y))+S[9]+2336552879&4294967295,T=E+(w<<12&4294967295|w>>>20),w=y+(I^T&(E^I))+S[10]+4294925233&4294967295,y=T+(w<<17&4294967295|w>>>15),w=I+(E^y&(T^E))+S[11]+2304563134&4294967295,I=y+(w<<22&4294967295|w>>>10),w=E+(T^I&(y^T))+S[12]+1804603682&4294967295,E=I+(w<<7&4294967295|w>>>25),w=T+(y^E&(I^y))+S[13]+4254626195&4294967295,T=E+(w<<12&4294967295|w>>>20),w=y+(I^T&(E^I))+S[14]+2792965006&4294967295,y=T+(w<<17&4294967295|w>>>15),w=I+(E^y&(T^E))+S[15]+1236535329&4294967295,I=y+(w<<22&4294967295|w>>>10),w=E+(y^T&(I^y))+S[1]+4129170786&4294967295,E=I+(w<<5&4294967295|w>>>27),w=T+(I^y&(E^I))+S[6]+3225465664&4294967295,T=E+(w<<9&4294967295|w>>>23),w=y+(E^I&(T^E))+S[11]+643717713&4294967295,y=T+(w<<14&4294967295|w>>>18),w=I+(T^E&(y^T))+S[0]+3921069994&4294967295,I=y+(w<<20&4294967295|w>>>12),w=E+(y^T&(I^y))+S[5]+3593408605&4294967295,E=I+(w<<5&4294967295|w>>>27),w=T+(I^y&(E^I))+S[10]+38016083&4294967295,T=E+(w<<9&4294967295|w>>>23),w=y+(E^I&(T^E))+S[15]+3634488961&4294967295,y=T+(w<<14&4294967295|w>>>18),w=I+(T^E&(y^T))+S[4]+3889429448&4294967295,I=y+(w<<20&4294967295|w>>>12),w=E+(y^T&(I^y))+S[9]+568446438&4294967295,E=I+(w<<5&4294967295|w>>>27),w=T+(I^y&(E^I))+S[14]+3275163606&4294967295,T=E+(w<<9&4294967295|w>>>23),w=y+(E^I&(T^E))+S[3]+4107603335&4294967295,y=T+(w<<14&4294967295|w>>>18),w=I+(T^E&(y^T))+S[8]+1163531501&4294967295,I=y+(w<<20&4294967295|w>>>12),w=E+(y^T&(I^y))+S[13]+2850285829&4294967295,E=I+(w<<5&4294967295|w>>>27),w=T+(I^y&(E^I))+S[2]+4243563512&4294967295,T=E+(w<<9&4294967295|w>>>23),w=y+(E^I&(T^E))+S[7]+1735328473&4294967295,y=T+(w<<14&4294967295|w>>>18),w=I+(T^E&(y^T))+S[12]+2368359562&4294967295,I=y+(w<<20&4294967295|w>>>12),w=E+(I^y^T)+S[5]+4294588738&4294967295,E=I+(w<<4&4294967295|w>>>28),w=T+(E^I^y)+S[8]+2272392833&4294967295,T=E+(w<<11&4294967295|w>>>21),w=y+(T^E^I)+S[11]+1839030562&4294967295,y=T+(w<<16&4294967295|w>>>16),w=I+(y^T^E)+S[14]+4259657740&4294967295,I=y+(w<<23&4294967295|w>>>9),w=E+(I^y^T)+S[1]+2763975236&4294967295,E=I+(w<<4&4294967295|w>>>28),w=T+(E^I^y)+S[4]+1272893353&4294967295,T=E+(w<<11&4294967295|w>>>21),w=y+(T^E^I)+S[7]+4139469664&4294967295,y=T+(w<<16&4294967295|w>>>16),w=I+(y^T^E)+S[10]+3200236656&4294967295,I=y+(w<<23&4294967295|w>>>9),w=E+(I^y^T)+S[13]+681279174&4294967295,E=I+(w<<4&4294967295|w>>>28),w=T+(E^I^y)+S[0]+3936430074&4294967295,T=E+(w<<11&4294967295|w>>>21),w=y+(T^E^I)+S[3]+3572445317&4294967295,y=T+(w<<16&4294967295|w>>>16),w=I+(y^T^E)+S[6]+76029189&4294967295,I=y+(w<<23&4294967295|w>>>9),w=E+(I^y^T)+S[9]+3654602809&4294967295,E=I+(w<<4&4294967295|w>>>28),w=T+(E^I^y)+S[12]+3873151461&4294967295,T=E+(w<<11&4294967295|w>>>21),w=y+(T^E^I)+S[15]+530742520&4294967295,y=T+(w<<16&4294967295|w>>>16),w=I+(y^T^E)+S[2]+3299628645&4294967295,I=y+(w<<23&4294967295|w>>>9),w=E+(y^(I|~T))+S[0]+4096336452&4294967295,E=I+(w<<6&4294967295|w>>>26),w=T+(I^(E|~y))+S[7]+1126891415&4294967295,T=E+(w<<10&4294967295|w>>>22),w=y+(E^(T|~I))+S[14]+2878612391&4294967295,y=T+(w<<15&4294967295|w>>>17),w=I+(T^(y|~E))+S[5]+4237533241&4294967295,I=y+(w<<21&4294967295|w>>>11),w=E+(y^(I|~T))+S[12]+1700485571&4294967295,E=I+(w<<6&4294967295|w>>>26),w=T+(I^(E|~y))+S[3]+2399980690&4294967295,T=E+(w<<10&4294967295|w>>>22),w=y+(E^(T|~I))+S[10]+4293915773&4294967295,y=T+(w<<15&4294967295|w>>>17),w=I+(T^(y|~E))+S[1]+2240044497&4294967295,I=y+(w<<21&4294967295|w>>>11),w=E+(y^(I|~T))+S[8]+1873313359&4294967295,E=I+(w<<6&4294967295|w>>>26),w=T+(I^(E|~y))+S[15]+4264355552&4294967295,T=E+(w<<10&4294967295|w>>>22),w=y+(E^(T|~I))+S[6]+2734768916&4294967295,y=T+(w<<15&4294967295|w>>>17),w=I+(T^(y|~E))+S[13]+1309151649&4294967295,I=y+(w<<21&4294967295|w>>>11),w=E+(y^(I|~T))+S[4]+4149444226&4294967295,E=I+(w<<6&4294967295|w>>>26),w=T+(I^(E|~y))+S[11]+3174756917&4294967295,T=E+(w<<10&4294967295|w>>>22),w=y+(E^(T|~I))+S[2]+718787259&4294967295,y=T+(w<<15&4294967295|w>>>17),w=I+(T^(y|~E))+S[9]+3951481745&4294967295,P.g[0]=P.g[0]+E&4294967295,P.g[1]=P.g[1]+(y+(w<<21&4294967295|w>>>11))&4294967295,P.g[2]=P.g[2]+y&4294967295,P.g[3]=P.g[3]+T&4294967295}r.prototype.u=function(P,E){E===void 0&&(E=P.length);for(var I=E-this.blockSize,S=this.B,y=this.h,T=0;T<E;){if(y==0)for(;T<=I;)s(this,P,T),T+=this.blockSize;if(typeof P=="string"){for(;T<E;)if(S[y++]=P.charCodeAt(T++),y==this.blockSize){s(this,S),y=0;break}}else for(;T<E;)if(S[y++]=P[T++],y==this.blockSize){s(this,S),y=0;break}}this.h=y,this.o+=E},r.prototype.v=function(){var P=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);P[0]=128;for(var E=1;E<P.length-8;++E)P[E]=0;var I=8*this.o;for(E=P.length-8;E<P.length;++E)P[E]=I&255,I/=256;for(this.u(P),P=Array(16),E=I=0;4>E;++E)for(var S=0;32>S;S+=8)P[I++]=this.g[E]>>>S&255;return P};function i(P,E){var I=l;return Object.prototype.hasOwnProperty.call(I,P)?I[P]:I[P]=E(P)}function o(P,E){this.h=E;for(var I=[],S=!0,y=P.length-1;0<=y;y--){var T=P[y]|0;S&&T==E||(I[y]=T,S=!1)}this.g=I}var l={};function u(P){return-128<=P&&128>P?i(P,function(E){return new o([E|0],0>E?-1:0)}):new o([P|0],0>P?-1:0)}function h(P){if(isNaN(P)||!isFinite(P))return p;if(0>P)return N(h(-P));for(var E=[],I=1,S=0;P>=I;S++)E[S]=P/I|0,I*=4294967296;return new o(E,0)}function d(P,E){if(P.length==0)throw Error("number format error: empty string");if(E=E||10,2>E||36<E)throw Error("radix out of range: "+E);if(P.charAt(0)=="-")return N(d(P.substring(1),E));if(0<=P.indexOf("-"))throw Error('number format error: interior "-" character');for(var I=h(Math.pow(E,8)),S=p,y=0;y<P.length;y+=8){var T=Math.min(8,P.length-y),w=parseInt(P.substring(y,y+T),E);8>T?(T=h(Math.pow(E,T)),S=S.j(T).add(h(w))):(S=S.j(I),S=S.add(h(w)))}return S}var p=u(0),g=u(1),v=u(16777216);t=o.prototype,t.m=function(){if(D(this))return-N(this).m();for(var P=0,E=1,I=0;I<this.g.length;I++){var S=this.i(I);P+=(0<=S?S:4294967296+S)*E,E*=4294967296}return P},t.toString=function(P){if(P=P||10,2>P||36<P)throw Error("radix out of range: "+P);if(x(this))return"0";if(D(this))return"-"+N(this).toString(P);for(var E=h(Math.pow(P,6)),I=this,S="";;){var y=G(I,E).g;I=j(I,y.j(E));var T=((0<I.g.length?I.g[0]:I.h)>>>0).toString(P);if(I=y,x(I))return T+S;for(;6>T.length;)T="0"+T;S=T+S}},t.i=function(P){return 0>P?0:P<this.g.length?this.g[P]:this.h};function x(P){if(P.h!=0)return!1;for(var E=0;E<P.g.length;E++)if(P.g[E]!=0)return!1;return!0}function D(P){return P.h==-1}t.l=function(P){return P=j(this,P),D(P)?-1:x(P)?0:1};function N(P){for(var E=P.g.length,I=[],S=0;S<E;S++)I[S]=~P.g[S];return new o(I,~P.h).add(g)}t.abs=function(){return D(this)?N(this):this},t.add=function(P){for(var E=Math.max(this.g.length,P.g.length),I=[],S=0,y=0;y<=E;y++){var T=S+(this.i(y)&65535)+(P.i(y)&65535),w=(T>>>16)+(this.i(y)>>>16)+(P.i(y)>>>16);S=w>>>16,T&=65535,w&=65535,I[y]=w<<16|T}return new o(I,I[I.length-1]&-2147483648?-1:0)};function j(P,E){return P.add(N(E))}t.j=function(P){if(x(this)||x(P))return p;if(D(this))return D(P)?N(this).j(N(P)):N(N(this).j(P));if(D(P))return N(this.j(N(P)));if(0>this.l(v)&&0>P.l(v))return h(this.m()*P.m());for(var E=this.g.length+P.g.length,I=[],S=0;S<2*E;S++)I[S]=0;for(S=0;S<this.g.length;S++)for(var y=0;y<P.g.length;y++){var T=this.i(S)>>>16,w=this.i(S)&65535,Le=P.i(y)>>>16,ot=P.i(y)&65535;I[2*S+2*y]+=w*ot,B(I,2*S+2*y),I[2*S+2*y+1]+=T*ot,B(I,2*S+2*y+1),I[2*S+2*y+1]+=w*Le,B(I,2*S+2*y+1),I[2*S+2*y+2]+=T*Le,B(I,2*S+2*y+2)}for(S=0;S<E;S++)I[S]=I[2*S+1]<<16|I[2*S];for(S=E;S<2*E;S++)I[S]=0;return new o(I,0)};function B(P,E){for(;(P[E]&65535)!=P[E];)P[E+1]+=P[E]>>>16,P[E]&=65535,E++}function W(P,E){this.g=P,this.h=E}function G(P,E){if(x(E))throw Error("division by zero");if(x(P))return new W(p,p);if(D(P))return E=G(N(P),E),new W(N(E.g),N(E.h));if(D(E))return E=G(P,N(E)),new W(N(E.g),E.h);if(30<P.g.length){if(D(P)||D(E))throw Error("slowDivide_ only works with positive integers.");for(var I=g,S=E;0>=S.l(P);)I=fe(I),S=fe(S);var y=oe(I,1),T=oe(S,1);for(S=oe(S,2),I=oe(I,2);!x(S);){var w=T.add(S);0>=w.l(P)&&(y=y.add(I),T=w),S=oe(S,1),I=oe(I,1)}return E=j(P,y.j(E)),new W(y,E)}for(y=p;0<=P.l(E);){for(I=Math.max(1,Math.floor(P.m()/E.m())),S=Math.ceil(Math.log(I)/Math.LN2),S=48>=S?1:Math.pow(2,S-48),T=h(I),w=T.j(E);D(w)||0<w.l(P);)I-=S,T=h(I),w=T.j(E);x(T)&&(T=g),y=y.add(T),P=j(P,w)}return new W(y,P)}t.A=function(P){return G(this,P).h},t.and=function(P){for(var E=Math.max(this.g.length,P.g.length),I=[],S=0;S<E;S++)I[S]=this.i(S)&P.i(S);return new o(I,this.h&P.h)},t.or=function(P){for(var E=Math.max(this.g.length,P.g.length),I=[],S=0;S<E;S++)I[S]=this.i(S)|P.i(S);return new o(I,this.h|P.h)},t.xor=function(P){for(var E=Math.max(this.g.length,P.g.length),I=[],S=0;S<E;S++)I[S]=this.i(S)^P.i(S);return new o(I,this.h^P.h)};function fe(P){for(var E=P.g.length+1,I=[],S=0;S<E;S++)I[S]=P.i(S)<<1|P.i(S-1)>>>31;return new o(I,P.h)}function oe(P,E){var I=E>>5;E%=32;for(var S=P.g.length-I,y=[],T=0;T<S;T++)y[T]=0<E?P.i(T+I)>>>E|P.i(T+I+1)<<32-E:P.i(T+I);return new o(y,P.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,om=r,o.prototype.add=o.prototype.add,o.prototype.multiply=o.prototype.j,o.prototype.modulo=o.prototype.A,o.prototype.compare=o.prototype.l,o.prototype.toNumber=o.prototype.m,o.prototype.toString=o.prototype.toString,o.prototype.getBits=o.prototype.i,o.fromNumber=h,o.fromString=d,Kr=o}).apply(typeof bd<"u"?bd:typeof self<"u"?self:typeof window<"u"?window:{});var Ro=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var am,ui,lm,Uo,hu,um,cm,hm;(function(){var t,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,c,f){return a==Array.prototype||a==Object.prototype||(a[c]=f.value),a};function n(a){a=[typeof globalThis=="object"&&globalThis,a,typeof window=="object"&&window,typeof self=="object"&&self,typeof Ro=="object"&&Ro];for(var c=0;c<a.length;++c){var f=a[c];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var r=n(this);function s(a,c){if(c)e:{var f=r;a=a.split(".");for(var m=0;m<a.length-1;m++){var C=a[m];if(!(C in f))break e;f=f[C]}a=a[a.length-1],m=f[a],c=c(m),c!=m&&c!=null&&e(f,a,{configurable:!0,writable:!0,value:c})}}function i(a,c){a instanceof String&&(a+="");var f=0,m=!1,C={next:function(){if(!m&&f<a.length){var O=f++;return{value:c(O,a[O]),done:!1}}return m=!0,{done:!0,value:void 0}}};return C[Symbol.iterator]=function(){return C},C}s("Array.prototype.values",function(a){return a||function(){return i(this,function(c,f){return f})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var o=o||{},l=this||self;function u(a){var c=typeof a;return c=c!="object"?c:a?Array.isArray(a)?"array":c:"null",c=="array"||c=="object"&&typeof a.length=="number"}function h(a){var c=typeof a;return c=="object"&&a!=null||c=="function"}function d(a,c,f){return a.call.apply(a.bind,arguments)}function p(a,c,f){if(!a)throw Error();if(2<arguments.length){var m=Array.prototype.slice.call(arguments,2);return function(){var C=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(C,m),a.apply(c,C)}}return function(){return a.apply(c,arguments)}}function g(a,c,f){return g=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?d:p,g.apply(null,arguments)}function v(a,c){var f=Array.prototype.slice.call(arguments,1);return function(){var m=f.slice();return m.push.apply(m,arguments),a.apply(this,m)}}function x(a,c){function f(){}f.prototype=c.prototype,a.aa=c.prototype,a.prototype=new f,a.prototype.constructor=a,a.Qb=function(m,C,O){for(var Z=Array(arguments.length-2),Ge=2;Ge<arguments.length;Ge++)Z[Ge-2]=arguments[Ge];return c.prototype[C].apply(m,Z)}}function D(a){const c=a.length;if(0<c){const f=Array(c);for(let m=0;m<c;m++)f[m]=a[m];return f}return[]}function N(a,c){for(let f=1;f<arguments.length;f++){const m=arguments[f];if(u(m)){const C=a.length||0,O=m.length||0;a.length=C+O;for(let Z=0;Z<O;Z++)a[C+Z]=m[Z]}else a.push(m)}}class j{constructor(c,f){this.i=c,this.j=f,this.h=0,this.g=null}get(){let c;return 0<this.h?(this.h--,c=this.g,this.g=c.next,c.next=null):c=this.i(),c}}function B(a){return/^[\s\xa0]*$/.test(a)}function W(){var a=l.navigator;return a&&(a=a.userAgent)?a:""}function G(a){return G[" "](a),a}G[" "]=function(){};var fe=W().indexOf("Gecko")!=-1&&!(W().toLowerCase().indexOf("webkit")!=-1&&W().indexOf("Edge")==-1)&&!(W().indexOf("Trident")!=-1||W().indexOf("MSIE")!=-1)&&W().indexOf("Edge")==-1;function oe(a,c,f){for(const m in a)c.call(f,a[m],m,a)}function P(a,c){for(const f in a)c.call(void 0,a[f],f,a)}function E(a){const c={};for(const f in a)c[f]=a[f];return c}const I="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function S(a,c){let f,m;for(let C=1;C<arguments.length;C++){m=arguments[C];for(f in m)a[f]=m[f];for(let O=0;O<I.length;O++)f=I[O],Object.prototype.hasOwnProperty.call(m,f)&&(a[f]=m[f])}}function y(a){var c=1;a=a.split(":");const f=[];for(;0<c&&a.length;)f.push(a.shift()),c--;return a.length&&f.push(a.join(":")),f}function T(a){l.setTimeout(()=>{throw a},0)}function w(){var a=gt;let c=null;return a.g&&(c=a.g,a.g=a.g.next,a.g||(a.h=null),c.next=null),c}class Le{constructor(){this.h=this.g=null}add(c,f){const m=ot.get();m.set(c,f),this.h?this.h.next=m:this.g=m,this.h=m}}var ot=new j(()=>new Oe,a=>a.reset());class Oe{constructor(){this.next=this.g=this.h=null}set(c,f){this.h=c,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let Ce,xe=!1,gt=new Le,kt=()=>{const a=l.Promise.resolve(void 0);Ce=()=>{a.then(_t)}};var _t=()=>{for(var a;a=w();){try{a.h.call(a.g)}catch(f){T(f)}var c=ot;c.j(a),100>c.h&&(c.h++,a.next=c.g,c.g=a)}xe=!1};function $e(){this.s=this.s,this.C=this.C}$e.prototype.s=!1,$e.prototype.ma=function(){this.s||(this.s=!0,this.N())},$e.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function He(a,c){this.type=a,this.g=this.target=c,this.defaultPrevented=!1}He.prototype.h=function(){this.defaultPrevented=!0};var Wt=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var a=!1,c=Object.defineProperty({},"passive",{get:function(){a=!0}});try{const f=()=>{};l.addEventListener("test",f,c),l.removeEventListener("test",f,c)}catch{}return a}();function ln(a,c){if(He.call(this,a?a.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,a){var f=this.type=a.type,m=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;if(this.target=a.target||a.srcElement,this.g=c,c=a.relatedTarget){if(fe){e:{try{G(c.nodeName);var C=!0;break e}catch{}C=!1}C||(c=null)}}else f=="mouseover"?c=a.fromElement:f=="mouseout"&&(c=a.toElement);this.relatedTarget=c,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0),this.button=a.button,this.key=a.key||"",this.ctrlKey=a.ctrlKey,this.altKey=a.altKey,this.shiftKey=a.shiftKey,this.metaKey=a.metaKey,this.pointerId=a.pointerId||0,this.pointerType=typeof a.pointerType=="string"?a.pointerType:Dt[a.pointerType]||"",this.state=a.state,this.i=a,a.defaultPrevented&&ln.aa.h.call(this)}}x(ln,He);var Dt={2:"touch",3:"pen",4:"mouse"};ln.prototype.h=function(){ln.aa.h.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var L="closure_listenable_"+(1e6*Math.random()|0),te=0;function H(a,c,f,m,C){this.listener=a,this.proxy=null,this.src=c,this.type=f,this.capture=!!m,this.ha=C,this.key=++te,this.da=this.fa=!1}function Y(a){a.da=!0,a.listener=null,a.proxy=null,a.src=null,a.ha=null}function pe(a){this.src=a,this.g={},this.h=0}pe.prototype.add=function(a,c,f,m,C){var O=a.toString();a=this.g[O],a||(a=this.g[O]=[],this.h++);var Z=b(a,c,m,C);return-1<Z?(c=a[Z],f||(c.fa=!1)):(c=new H(c,this.src,O,!!m,C),c.fa=f,a.push(c)),c};function Ee(a,c){var f=c.type;if(f in a.g){var m=a.g[f],C=Array.prototype.indexOf.call(m,c,void 0),O;(O=0<=C)&&Array.prototype.splice.call(m,C,1),O&&(Y(c),a.g[f].length==0&&(delete a.g[f],a.h--))}}function b(a,c,f,m){for(var C=0;C<a.length;++C){var O=a[C];if(!O.da&&O.listener==c&&O.capture==!!f&&O.ha==m)return C}return-1}var A="closure_lm_"+(1e6*Math.random()|0),k={};function U(a,c,f,m,C){if(m&&m.once)return ee(a,c,f,m,C);if(Array.isArray(c)){for(var O=0;O<c.length;O++)U(a,c[O],f,m,C);return null}return f=me(f),a&&a[L]?a.K(c,f,h(m)?!!m.capture:!!m,C):M(a,c,f,!1,m,C)}function M(a,c,f,m,C,O){if(!c)throw Error("Invalid event type");var Z=h(C)?!!C.capture:!!C,Ge=X(a);if(Ge||(a[A]=Ge=new pe(a)),f=Ge.add(c,f,m,Z,O),f.proxy)return f;if(m=z(),f.proxy=m,m.src=a,m.listener=f,a.addEventListener)Wt||(C=Z),C===void 0&&(C=!1),a.addEventListener(c.toString(),m,C);else if(a.attachEvent)a.attachEvent(q(c.toString()),m);else if(a.addListener&&a.removeListener)a.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return f}function z(){function a(f){return c.call(a.src,a.listener,f)}const c=le;return a}function ee(a,c,f,m,C){if(Array.isArray(c)){for(var O=0;O<c.length;O++)ee(a,c[O],f,m,C);return null}return f=me(f),a&&a[L]?a.L(c,f,h(m)?!!m.capture:!!m,C):M(a,c,f,!0,m,C)}function J(a,c,f,m,C){if(Array.isArray(c))for(var O=0;O<c.length;O++)J(a,c[O],f,m,C);else m=h(m)?!!m.capture:!!m,f=me(f),a&&a[L]?(a=a.i,c=String(c).toString(),c in a.g&&(O=a.g[c],f=b(O,f,m,C),-1<f&&(Y(O[f]),Array.prototype.splice.call(O,f,1),O.length==0&&(delete a.g[c],a.h--)))):a&&(a=X(a))&&(c=a.g[c.toString()],a=-1,c&&(a=b(c,f,m,C)),(f=-1<a?c[a]:null)&&Q(f))}function Q(a){if(typeof a!="number"&&a&&!a.da){var c=a.src;if(c&&c[L])Ee(c.i,a);else{var f=a.type,m=a.proxy;c.removeEventListener?c.removeEventListener(f,m,a.capture):c.detachEvent?c.detachEvent(q(f),m):c.addListener&&c.removeListener&&c.removeListener(m),(f=X(c))?(Ee(f,a),f.h==0&&(f.src=null,c[A]=null)):Y(a)}}}function q(a){return a in k?k[a]:k[a]="on"+a}function le(a,c){if(a.da)a=!0;else{c=new ln(c,this);var f=a.listener,m=a.ha||a.src;a.fa&&Q(a),a=f.call(m,c)}return a}function X(a){return a=a[A],a instanceof pe?a:null}var re="__closure_events_fn_"+(1e9*Math.random()>>>0);function me(a){return typeof a=="function"?a:(a[re]||(a[re]=function(c){return a.handleEvent(c)}),a[re])}function de(){$e.call(this),this.i=new pe(this),this.M=this,this.F=null}x(de,$e),de.prototype[L]=!0,de.prototype.removeEventListener=function(a,c,f,m){J(this,a,c,f,m)};function Te(a,c){var f,m=a.F;if(m)for(f=[];m;m=m.F)f.push(m);if(a=a.M,m=c.type||c,typeof c=="string")c=new He(c,a);else if(c instanceof He)c.target=c.target||a;else{var C=c;c=new He(m,a),S(c,C)}if(C=!0,f)for(var O=f.length-1;0<=O;O--){var Z=c.g=f[O];C=ke(Z,m,!0,c)&&C}if(Z=c.g=a,C=ke(Z,m,!0,c)&&C,C=ke(Z,m,!1,c)&&C,f)for(O=0;O<f.length;O++)Z=c.g=f[O],C=ke(Z,m,!1,c)&&C}de.prototype.N=function(){if(de.aa.N.call(this),this.i){var a=this.i,c;for(c in a.g){for(var f=a.g[c],m=0;m<f.length;m++)Y(f[m]);delete a.g[c],a.h--}}this.F=null},de.prototype.K=function(a,c,f,m){return this.i.add(String(a),c,!1,f,m)},de.prototype.L=function(a,c,f,m){return this.i.add(String(a),c,!0,f,m)};function ke(a,c,f,m){if(c=a.i.g[String(c)],!c)return!0;c=c.concat();for(var C=!0,O=0;O<c.length;++O){var Z=c[O];if(Z&&!Z.da&&Z.capture==f){var Ge=Z.listener,At=Z.ha||Z.src;Z.fa&&Ee(a.i,Z),C=Ge.call(At,m)!==!1&&C}}return C&&!m.defaultPrevented}function at(a,c,f){if(typeof a=="function")f&&(a=g(a,f));else if(a&&typeof a.handleEvent=="function")a=g(a.handleEvent,a);else throw Error("Invalid listener argument");return 2147483647<Number(c)?-1:l.setTimeout(a,c||0)}function tt(a){a.g=at(()=>{a.g=null,a.i&&(a.i=!1,tt(a))},a.l);const c=a.h;a.h=null,a.m.apply(null,c)}class wt extends $e{constructor(c,f){super(),this.m=c,this.l=f,this.h=null,this.i=!1,this.g=null}j(c){this.h=arguments,this.g?this.i=!0:tt(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function ct(a){$e.call(this),this.h=a,this.g={}}x(ct,$e);var yn=[];function Vr(a){oe(a.g,function(c,f){this.g.hasOwnProperty(f)&&Q(c)},a),a.g={}}ct.prototype.N=function(){ct.aa.N.call(this),Vr(this)},ct.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var vt=l.JSON.stringify,Gt=l.JSON.parse,ss=class{stringify(a){return l.JSON.stringify(a,void 0)}parse(a){return l.JSON.parse(a,void 0)}};function nr(){}nr.prototype.h=null;function io(a){return a.h||(a.h=a.i())}function oo(){}var Or={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function is(){He.call(this,"d")}x(is,He);function Gs(){He.call(this,"c")}x(Gs,He);var Nn={},ao=null;function os(){return ao=ao||new de}Nn.La="serverreachability";function lo(a){He.call(this,Nn.La,a)}x(lo,He);function rr(a){const c=os();Te(c,new lo(c))}Nn.STAT_EVENT="statevent";function uo(a,c){He.call(this,Nn.STAT_EVENT,a),this.stat=c}x(uo,He);function It(a){const c=os();Te(c,new uo(c,a))}Nn.Ma="timingevent";function as(a,c){He.call(this,Nn.Ma,a),this.size=c}x(as,He);function Mr(a,c){if(typeof a!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){a()},c)}function sr(){this.g=!0}sr.prototype.xa=function(){this.g=!1};function sl(a,c,f,m,C,O){a.info(function(){if(a.g)if(O)for(var Z="",Ge=O.split("&"),At=0;At<Ge.length;At++){var Ue=Ge[At].split("=");if(1<Ue.length){var Nt=Ue[0];Ue=Ue[1];var Vt=Nt.split("_");Z=2<=Vt.length&&Vt[1]=="type"?Z+(Nt+"="+Ue+"&"):Z+(Nt+"=redacted&")}}else Z=null;else Z=O;return"XMLHTTP REQ ("+m+") [attempt "+C+"]: "+c+`
`+f+`
`+Z})}function Qs(a,c,f,m,C,O,Z){a.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+C+"]: "+c+`
`+f+`
`+O+" "+Z})}function Vn(a,c,f,m){a.info(function(){return"XMLHTTP TEXT ("+c+"): "+ol(a,f)+(m?" "+m:"")})}function il(a,c){a.info(function(){return"TIMEOUT: "+c})}sr.prototype.info=function(){};function ol(a,c){if(!a.g)return c;if(!c)return null;try{var f=JSON.parse(c);if(f){for(a=0;a<f.length;a++)if(Array.isArray(f[a])){var m=f[a];if(!(2>m.length)){var C=m[1];if(Array.isArray(C)&&!(1>C.length)){var O=C[0];if(O!="noop"&&O!="stop"&&O!="close")for(var Z=1;Z<C.length;Z++)C[Z]=""}}}}return vt(f)}catch{return c}}var V={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},R={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},$;function Ie(){}x(Ie,nr),Ie.prototype.g=function(){return new XMLHttpRequest},Ie.prototype.i=function(){return{}},$=new Ie;function ge(a,c,f,m){this.j=a,this.i=c,this.l=f,this.R=m||1,this.U=new ct(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Pe}function Pe(){this.i=null,this.g="",this.h=!1}var ve={},Fe={};function Je(a,c,f){a.L=1,a.v=mo(On(c)),a.m=f,a.P=!0,un(a,null)}function un(a,c){a.F=Date.now(),ce(a),a.A=On(a.v);var f=a.A,m=a.R;Array.isArray(m)||(m=[String(m)]),Yc(f.i,"t",m),a.C=0,f=a.j.J,a.h=new Pe,a.g=mh(a.j,f?c:null,!a.m),0<a.O&&(a.M=new wt(g(a.Y,a,a.g),a.O)),c=a.U,f=a.g,m=a.ca;var C="readystatechange";Array.isArray(C)||(C&&(yn[0]=C.toString()),C=yn);for(var O=0;O<C.length;O++){var Z=U(f,C[O],m||c.handleEvent,!1,c.h||c);if(!Z)break;c.g[Z.key]=Z}c=a.H?E(a.H):{},a.m?(a.u||(a.u="POST"),c["Content-Type"]="application/x-www-form-urlencoded",a.g.ea(a.A,a.u,a.m,c)):(a.u="GET",a.g.ea(a.A,a.u,null,c)),rr(),sl(a.i,a.u,a.A,a.l,a.R,a.m)}ge.prototype.ca=function(a){a=a.target;const c=this.M;c&&Mn(a)==3?c.j():this.Y(a)},ge.prototype.Y=function(a){try{if(a==this.g)e:{const Vt=Mn(this.g);var c=this.g.Ba();const cs=this.g.Z();if(!(3>Vt)&&(Vt!=3||this.g&&(this.h.h||this.g.oa()||sh(this.g)))){this.J||Vt!=4||c==7||(c==8||0>=cs?rr(3):rr(2)),ho(this);var f=this.g.Z();this.X=f;t:if(dn(this)){var m=sh(this.g);a="";var C=m.length,O=Mn(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Lr(this),Js(this);var Z="";break t}this.h.i=new l.TextDecoder}for(c=0;c<C;c++)this.h.h=!0,a+=this.h.i.decode(m[c],{stream:!(O&&c==C-1)});m.length=0,this.h.g+=a,this.C=0,Z=this.h.g}else Z=this.g.oa();if(this.o=f==200,Qs(this.i,this.u,this.A,this.l,this.R,Vt,f),this.o){if(this.T&&!this.K){t:{if(this.g){var Ge,At=this.g;if((Ge=At.g?At.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!B(Ge)){var Ue=Ge;break t}}Ue=null}if(f=Ue)Vn(this.i,this.l,f,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,al(this,f);else{this.o=!1,this.s=3,It(12),Lr(this),Js(this);break e}}if(this.P){f=!0;let fn;for(;!this.J&&this.C<Z.length;)if(fn=co(this,Z),fn==Fe){Vt==4&&(this.s=4,It(14),f=!1),Vn(this.i,this.l,null,"[Incomplete Response]");break}else if(fn==ve){this.s=4,It(15),Vn(this.i,this.l,Z,"[Invalid Chunk]"),f=!1;break}else Vn(this.i,this.l,fn,null),al(this,fn);if(dn(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),Vt!=4||Z.length!=0||this.h.h||(this.s=1,It(16),f=!1),this.o=this.o&&f,!f)Vn(this.i,this.l,Z,"[Invalid Chunked Response]"),Lr(this),Js(this);else if(0<Z.length&&!this.W){this.W=!0;var Nt=this.j;Nt.g==this&&Nt.ba&&!Nt.M&&(Nt.j.info("Great, no buffering proxy detected. Bytes received: "+Z.length),fl(Nt),Nt.M=!0,It(11))}}else Vn(this.i,this.l,Z,null),al(this,Z);Vt==4&&Lr(this),this.o&&!this.J&&(Vt==4?hh(this.j,this):(this.o=!1,ce(this)))}else P_(this.g),f==400&&0<Z.indexOf("Unknown SID")?(this.s=3,It(12)):(this.s=0,It(13)),Lr(this),Js(this)}}}catch{}finally{}};function dn(a){return a.g?a.u=="GET"&&a.L!=2&&a.j.Ca:!1}function co(a,c){var f=a.C,m=c.indexOf(`
`,f);return m==-1?Fe:(f=Number(c.substring(f,m)),isNaN(f)?ve:(m+=1,m+f>c.length?Fe:(c=c.slice(m,m+f),a.C=m+f,c)))}ge.prototype.cancel=function(){this.J=!0,Lr(this)};function ce(a){a.S=Date.now()+a.I,rt(a,a.I)}function rt(a,c){if(a.B!=null)throw Error("WatchDog timer not null");a.B=Mr(g(a.ba,a),c)}function ho(a){a.B&&(l.clearTimeout(a.B),a.B=null)}ge.prototype.ba=function(){this.B=null;const a=Date.now();0<=a-this.S?(il(this.i,this.A),this.L!=2&&(rr(),It(17)),Lr(this),this.s=2,Js(this)):rt(this,this.S-a)};function Js(a){a.j.G==0||a.J||hh(a.j,a)}function Lr(a){ho(a);var c=a.M;c&&typeof c.ma=="function"&&c.ma(),a.M=null,Vr(a.U),a.g&&(c=a.g,a.g=null,c.abort(),c.ma())}function al(a,c){try{var f=a.j;if(f.G!=0&&(f.g==a||ll(f.h,a))){if(!a.K&&ll(f.h,a)&&f.G==3){try{var m=f.Da.g.parse(c)}catch{m=null}if(Array.isArray(m)&&m.length==3){var C=m;if(C[0]==0){e:if(!f.u){if(f.g)if(f.g.F+3e3<a.F)bo(f),yo(f);else break e;dl(f),It(18)}}else f.za=C[1],0<f.za-f.T&&37500>C[2]&&f.F&&f.v==0&&!f.C&&(f.C=Mr(g(f.Za,f),6e3));if(1>=Bc(f.h)&&f.ca){try{f.ca()}catch{}f.ca=void 0}}else Ur(f,11)}else if((a.K||f.g==a)&&bo(f),!B(c))for(C=f.Da.g.parse(c),c=0;c<C.length;c++){let Ue=C[c];if(f.T=Ue[0],Ue=Ue[1],f.G==2)if(Ue[0]=="c"){f.K=Ue[1],f.ia=Ue[2];const Nt=Ue[3];Nt!=null&&(f.la=Nt,f.j.info("VER="+f.la));const Vt=Ue[4];Vt!=null&&(f.Aa=Vt,f.j.info("SVER="+f.Aa));const cs=Ue[5];cs!=null&&typeof cs=="number"&&0<cs&&(m=1.5*cs,f.L=m,f.j.info("backChannelRequestTimeoutMs_="+m)),m=f;const fn=a.g;if(fn){const To=fn.g?fn.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(To){var O=m.h;O.g||To.indexOf("spdy")==-1&&To.indexOf("quic")==-1&&To.indexOf("h2")==-1||(O.j=O.l,O.g=new Set,O.h&&(ul(O,O.h),O.h=null))}if(m.D){const pl=fn.g?fn.g.getResponseHeader("X-HTTP-Session-Id"):null;pl&&(m.ya=pl,Ze(m.I,m.D,pl))}}f.G=3,f.l&&f.l.ua(),f.ba&&(f.R=Date.now()-a.F,f.j.info("Handshake RTT: "+f.R+"ms")),m=f;var Z=a;if(m.qa=ph(m,m.J?m.ia:null,m.W),Z.K){qc(m.h,Z);var Ge=Z,At=m.L;At&&(Ge.I=At),Ge.B&&(ho(Ge),ce(Ge)),m.g=Z}else uh(m);0<f.i.length&&wo(f)}else Ue[0]!="stop"&&Ue[0]!="close"||Ur(f,7);else f.G==3&&(Ue[0]=="stop"||Ue[0]=="close"?Ue[0]=="stop"?Ur(f,7):hl(f):Ue[0]!="noop"&&f.l&&f.l.ta(Ue),f.v=0)}}rr(4)}catch{}}var d_=class{constructor(a,c){this.g=a,this.map=c}};function jc(a){this.l=a||10,l.PerformanceNavigationTiming?(a=l.performance.getEntriesByType("navigation"),a=0<a.length&&(a[0].nextHopProtocol=="hq"||a[0].nextHopProtocol=="h2")):a=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=a?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function $c(a){return a.h?!0:a.g?a.g.size>=a.j:!1}function Bc(a){return a.h?1:a.g?a.g.size:0}function ll(a,c){return a.h?a.h==c:a.g?a.g.has(c):!1}function ul(a,c){a.g?a.g.add(c):a.h=c}function qc(a,c){a.h&&a.h==c?a.h=null:a.g&&a.g.has(c)&&a.g.delete(c)}jc.prototype.cancel=function(){if(this.i=zc(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const a of this.g.values())a.cancel();this.g.clear()}};function zc(a){if(a.h!=null)return a.i.concat(a.h.D);if(a.g!=null&&a.g.size!==0){let c=a.i;for(const f of a.g.values())c=c.concat(f.D);return c}return D(a.i)}function f_(a){if(a.V&&typeof a.V=="function")return a.V();if(typeof Map<"u"&&a instanceof Map||typeof Set<"u"&&a instanceof Set)return Array.from(a.values());if(typeof a=="string")return a.split("");if(u(a)){for(var c=[],f=a.length,m=0;m<f;m++)c.push(a[m]);return c}c=[],f=0;for(m in a)c[f++]=a[m];return c}function p_(a){if(a.na&&typeof a.na=="function")return a.na();if(!a.V||typeof a.V!="function"){if(typeof Map<"u"&&a instanceof Map)return Array.from(a.keys());if(!(typeof Set<"u"&&a instanceof Set)){if(u(a)||typeof a=="string"){var c=[];a=a.length;for(var f=0;f<a;f++)c.push(f);return c}c=[],f=0;for(const m in a)c[f++]=m;return c}}}function Hc(a,c){if(a.forEach&&typeof a.forEach=="function")a.forEach(c,void 0);else if(u(a)||typeof a=="string")Array.prototype.forEach.call(a,c,void 0);else for(var f=p_(a),m=f_(a),C=m.length,O=0;O<C;O++)c.call(void 0,m[O],f&&f[O],a)}var Kc=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function m_(a,c){if(a){a=a.split("&");for(var f=0;f<a.length;f++){var m=a[f].indexOf("="),C=null;if(0<=m){var O=a[f].substring(0,m);C=a[f].substring(m+1)}else O=a[f];c(O,C?decodeURIComponent(C.replace(/\+/g," ")):"")}}}function Fr(a){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,a instanceof Fr){this.h=a.h,fo(this,a.j),this.o=a.o,this.g=a.g,po(this,a.s),this.l=a.l;var c=a.i,f=new Zs;f.i=c.i,c.g&&(f.g=new Map(c.g),f.h=c.h),Wc(this,f),this.m=a.m}else a&&(c=String(a).match(Kc))?(this.h=!1,fo(this,c[1]||"",!0),this.o=Ys(c[2]||""),this.g=Ys(c[3]||"",!0),po(this,c[4]),this.l=Ys(c[5]||"",!0),Wc(this,c[6]||"",!0),this.m=Ys(c[7]||"")):(this.h=!1,this.i=new Zs(null,this.h))}Fr.prototype.toString=function(){var a=[],c=this.j;c&&a.push(Xs(c,Gc,!0),":");var f=this.g;return(f||c=="file")&&(a.push("//"),(c=this.o)&&a.push(Xs(c,Gc,!0),"@"),a.push(encodeURIComponent(String(f)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.s,f!=null&&a.push(":",String(f))),(f=this.l)&&(this.g&&f.charAt(0)!="/"&&a.push("/"),a.push(Xs(f,f.charAt(0)=="/"?v_:__,!0))),(f=this.i.toString())&&a.push("?",f),(f=this.m)&&a.push("#",Xs(f,w_)),a.join("")};function On(a){return new Fr(a)}function fo(a,c,f){a.j=f?Ys(c,!0):c,a.j&&(a.j=a.j.replace(/:$/,""))}function po(a,c){if(c){if(c=Number(c),isNaN(c)||0>c)throw Error("Bad port number "+c);a.s=c}else a.s=null}function Wc(a,c,f){c instanceof Zs?(a.i=c,b_(a.i,a.h)):(f||(c=Xs(c,y_)),a.i=new Zs(c,a.h))}function Ze(a,c,f){a.i.set(c,f)}function mo(a){return Ze(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),a}function Ys(a,c){return a?c?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}function Xs(a,c,f){return typeof a=="string"?(a=encodeURI(a).replace(c,g_),f&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}function g_(a){return a=a.charCodeAt(0),"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var Gc=/[#\/\?@]/g,__=/[#\?:]/g,v_=/[#\?]/g,y_=/[#\?@]/g,w_=/#/g;function Zs(a,c){this.h=this.g=null,this.i=a||null,this.j=!!c}function ir(a){a.g||(a.g=new Map,a.h=0,a.i&&m_(a.i,function(c,f){a.add(decodeURIComponent(c.replace(/\+/g," ")),f)}))}t=Zs.prototype,t.add=function(a,c){ir(this),this.i=null,a=ls(this,a);var f=this.g.get(a);return f||this.g.set(a,f=[]),f.push(c),this.h+=1,this};function Qc(a,c){ir(a),c=ls(a,c),a.g.has(c)&&(a.i=null,a.h-=a.g.get(c).length,a.g.delete(c))}function Jc(a,c){return ir(a),c=ls(a,c),a.g.has(c)}t.forEach=function(a,c){ir(this),this.g.forEach(function(f,m){f.forEach(function(C){a.call(c,C,m,this)},this)},this)},t.na=function(){ir(this);const a=Array.from(this.g.values()),c=Array.from(this.g.keys()),f=[];for(let m=0;m<c.length;m++){const C=a[m];for(let O=0;O<C.length;O++)f.push(c[m])}return f},t.V=function(a){ir(this);let c=[];if(typeof a=="string")Jc(this,a)&&(c=c.concat(this.g.get(ls(this,a))));else{a=Array.from(this.g.values());for(let f=0;f<a.length;f++)c=c.concat(a[f])}return c},t.set=function(a,c){return ir(this),this.i=null,a=ls(this,a),Jc(this,a)&&(this.h-=this.g.get(a).length),this.g.set(a,[c]),this.h+=1,this},t.get=function(a,c){return a?(a=this.V(a),0<a.length?String(a[0]):c):c};function Yc(a,c,f){Qc(a,c),0<f.length&&(a.i=null,a.g.set(ls(a,c),D(f)),a.h+=f.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const a=[],c=Array.from(this.g.keys());for(var f=0;f<c.length;f++){var m=c[f];const O=encodeURIComponent(String(m)),Z=this.V(m);for(m=0;m<Z.length;m++){var C=O;Z[m]!==""&&(C+="="+encodeURIComponent(String(Z[m]))),a.push(C)}}return this.i=a.join("&")};function ls(a,c){return c=String(c),a.j&&(c=c.toLowerCase()),c}function b_(a,c){c&&!a.j&&(ir(a),a.i=null,a.g.forEach(function(f,m){var C=m.toLowerCase();m!=C&&(Qc(this,m),Yc(this,C,f))},a)),a.j=c}function E_(a,c){const f=new sr;if(l.Image){const m=new Image;m.onload=v(or,f,"TestLoadImage: loaded",!0,c,m),m.onerror=v(or,f,"TestLoadImage: error",!1,c,m),m.onabort=v(or,f,"TestLoadImage: abort",!1,c,m),m.ontimeout=v(or,f,"TestLoadImage: timeout",!1,c,m),l.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=a}else c(!1)}function T_(a,c){const f=new sr,m=new AbortController,C=setTimeout(()=>{m.abort(),or(f,"TestPingServer: timeout",!1,c)},1e4);fetch(a,{signal:m.signal}).then(O=>{clearTimeout(C),O.ok?or(f,"TestPingServer: ok",!0,c):or(f,"TestPingServer: server error",!1,c)}).catch(()=>{clearTimeout(C),or(f,"TestPingServer: error",!1,c)})}function or(a,c,f,m,C){try{C&&(C.onload=null,C.onerror=null,C.onabort=null,C.ontimeout=null),m(f)}catch{}}function I_(){this.g=new ss}function A_(a,c,f){const m=f||"";try{Hc(a,function(C,O){let Z=C;h(C)&&(Z=vt(C)),c.push(m+O+"="+encodeURIComponent(Z))})}catch(C){throw c.push(m+"type="+encodeURIComponent("_badmap")),C}}function go(a){this.l=a.Ub||null,this.j=a.eb||!1}x(go,nr),go.prototype.g=function(){return new _o(this.l,this.j)},go.prototype.i=function(a){return function(){return a}}({});function _o(a,c){de.call(this),this.D=a,this.o=c,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}x(_o,de),t=_o.prototype,t.open=function(a,c){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=a,this.A=c,this.readyState=1,ti(this)},t.send=function(a){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const c={headers:this.u,method:this.B,credentials:this.m,cache:void 0};a&&(c.body=a),(this.D||l).fetch(new Request(this.A,c)).then(this.Sa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,ei(this)),this.readyState=0},t.Sa=function(a){if(this.g&&(this.l=a,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=a.headers,this.readyState=2,ti(this)),this.g&&(this.readyState=3,ti(this),this.g)))if(this.responseType==="arraybuffer")a.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in a){if(this.j=a.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Xc(this)}else a.text().then(this.Ra.bind(this),this.ga.bind(this))};function Xc(a){a.j.read().then(a.Pa.bind(a)).catch(a.ga.bind(a))}t.Pa=function(a){if(this.g){if(this.o&&a.value)this.response.push(a.value);else if(!this.o){var c=a.value?a.value:new Uint8Array(0);(c=this.v.decode(c,{stream:!a.done}))&&(this.response=this.responseText+=c)}a.done?ei(this):ti(this),this.readyState==3&&Xc(this)}},t.Ra=function(a){this.g&&(this.response=this.responseText=a,ei(this))},t.Qa=function(a){this.g&&(this.response=a,ei(this))},t.ga=function(){this.g&&ei(this)};function ei(a){a.readyState=4,a.l=null,a.j=null,a.v=null,ti(a)}t.setRequestHeader=function(a,c){this.u.append(a,c)},t.getResponseHeader=function(a){return this.h&&this.h.get(a.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const a=[],c=this.h.entries();for(var f=c.next();!f.done;)f=f.value,a.push(f[0]+": "+f[1]),f=c.next();return a.join(`\r
`)};function ti(a){a.onreadystatechange&&a.onreadystatechange.call(a)}Object.defineProperty(_o.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(a){this.m=a?"include":"same-origin"}});function Zc(a){let c="";return oe(a,function(f,m){c+=m,c+=":",c+=f,c+=`\r
`}),c}function cl(a,c,f){e:{for(m in f){var m=!1;break e}m=!0}m||(f=Zc(f),typeof a=="string"?f!=null&&encodeURIComponent(String(f)):Ze(a,c,f))}function lt(a){de.call(this),this.headers=new Map,this.o=a||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}x(lt,de);var S_=/^https?$/i,R_=["POST","PUT"];t=lt.prototype,t.Ha=function(a){this.J=a},t.ea=function(a,c,f,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+a);c=c?c.toUpperCase():"GET",this.D=a,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():$.g(),this.v=this.o?io(this.o):io($),this.g.onreadystatechange=g(this.Ea,this);try{this.B=!0,this.g.open(c,String(a),!0),this.B=!1}catch(O){eh(this,O);return}if(a=f||"",f=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var C in m)f.set(C,m[C]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const O of m.keys())f.set(O,m.get(O));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(f.keys()).find(O=>O.toLowerCase()=="content-type"),C=l.FormData&&a instanceof l.FormData,!(0<=Array.prototype.indexOf.call(R_,c,void 0))||m||C||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[O,Z]of f)this.g.setRequestHeader(O,Z);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{rh(this),this.u=!0,this.g.send(a),this.u=!1}catch(O){eh(this,O)}};function eh(a,c){a.h=!1,a.g&&(a.j=!0,a.g.abort(),a.j=!1),a.l=c,a.m=5,th(a),vo(a)}function th(a){a.A||(a.A=!0,Te(a,"complete"),Te(a,"error"))}t.abort=function(a){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=a||7,Te(this,"complete"),Te(this,"abort"),vo(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),vo(this,!0)),lt.aa.N.call(this)},t.Ea=function(){this.s||(this.B||this.u||this.j?nh(this):this.bb())},t.bb=function(){nh(this)};function nh(a){if(a.h&&typeof o<"u"&&(!a.v[1]||Mn(a)!=4||a.Z()!=2)){if(a.u&&Mn(a)==4)at(a.Ea,0,a);else if(Te(a,"readystatechange"),Mn(a)==4){a.h=!1;try{const Z=a.Z();e:switch(Z){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break e;default:c=!1}var f;if(!(f=c)){var m;if(m=Z===0){var C=String(a.D).match(Kc)[1]||null;!C&&l.self&&l.self.location&&(C=l.self.location.protocol.slice(0,-1)),m=!S_.test(C?C.toLowerCase():"")}f=m}if(f)Te(a,"complete"),Te(a,"success");else{a.m=6;try{var O=2<Mn(a)?a.g.statusText:""}catch{O=""}a.l=O+" ["+a.Z()+"]",th(a)}}finally{vo(a)}}}}function vo(a,c){if(a.g){rh(a);const f=a.g,m=a.v[0]?()=>{}:null;a.g=null,a.v=null,c||Te(a,"ready");try{f.onreadystatechange=m}catch{}}}function rh(a){a.I&&(l.clearTimeout(a.I),a.I=null)}t.isActive=function(){return!!this.g};function Mn(a){return a.g?a.g.readyState:0}t.Z=function(){try{return 2<Mn(this)?this.g.status:-1}catch{return-1}},t.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.Oa=function(a){if(this.g){var c=this.g.responseText;return a&&c.indexOf(a)==0&&(c=c.substring(a.length)),Gt(c)}};function sh(a){try{if(!a.g)return null;if("response"in a.g)return a.g.response;switch(a.H){case"":case"text":return a.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in a.g)return a.g.mozResponseArrayBuffer}return null}catch{return null}}function P_(a){const c={};a=(a.g&&2<=Mn(a)&&a.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<a.length;m++){if(B(a[m]))continue;var f=y(a[m]);const C=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const O=c[C]||[];c[C]=O,O.push(f)}P(c,function(m){return m.join(", ")})}t.Ba=function(){return this.m},t.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function ni(a,c,f){return f&&f.internalChannelParams&&f.internalChannelParams[a]||c}function ih(a){this.Aa=0,this.i=[],this.j=new sr,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=ni("failFast",!1,a),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=ni("baseRetryDelayMs",5e3,a),this.cb=ni("retryDelaySeedMs",1e4,a),this.Wa=ni("forwardChannelMaxRetries",2,a),this.wa=ni("forwardChannelRequestTimeoutMs",2e4,a),this.pa=a&&a.xmlHttpFactory||void 0,this.Xa=a&&a.Tb||void 0,this.Ca=a&&a.useFetchStreams||!1,this.L=void 0,this.J=a&&a.supportsCrossDomainXhr||!1,this.K="",this.h=new jc(a&&a.concurrentRequestLimit),this.Da=new I_,this.P=a&&a.fastHandshake||!1,this.O=a&&a.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=a&&a.Rb||!1,a&&a.xa&&this.j.xa(),a&&a.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&a&&a.detectBufferingProxy||!1,this.ja=void 0,a&&a.longPollingTimeout&&0<a.longPollingTimeout&&(this.ja=a.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}t=ih.prototype,t.la=8,t.G=1,t.connect=function(a,c,f,m){It(0),this.W=a,this.H=c||{},f&&m!==void 0&&(this.H.OSID=f,this.H.OAID=m),this.F=this.X,this.I=ph(this,null,this.W),wo(this)};function hl(a){if(oh(a),a.G==3){var c=a.U++,f=On(a.I);if(Ze(f,"SID",a.K),Ze(f,"RID",c),Ze(f,"TYPE","terminate"),ri(a,f),c=new ge(a,a.j,c),c.L=2,c.v=mo(On(f)),f=!1,l.navigator&&l.navigator.sendBeacon)try{f=l.navigator.sendBeacon(c.v.toString(),"")}catch{}!f&&l.Image&&(new Image().src=c.v,f=!0),f||(c.g=mh(c.j,null),c.g.ea(c.v)),c.F=Date.now(),ce(c)}fh(a)}function yo(a){a.g&&(fl(a),a.g.cancel(),a.g=null)}function oh(a){yo(a),a.u&&(l.clearTimeout(a.u),a.u=null),bo(a),a.h.cancel(),a.s&&(typeof a.s=="number"&&l.clearTimeout(a.s),a.s=null)}function wo(a){if(!$c(a.h)&&!a.s){a.s=!0;var c=a.Ga;Ce||kt(),xe||(Ce(),xe=!0),gt.add(c,a),a.B=0}}function C_(a,c){return Bc(a.h)>=a.h.j-(a.s?1:0)?!1:a.s?(a.i=c.D.concat(a.i),!0):a.G==1||a.G==2||a.B>=(a.Va?0:a.Wa)?!1:(a.s=Mr(g(a.Ga,a,c),dh(a,a.B)),a.B++,!0)}t.Ga=function(a){if(this.s)if(this.s=null,this.G==1){if(!a){this.U=Math.floor(1e5*Math.random()),a=this.U++;const C=new ge(this,this.j,a);let O=this.o;if(this.S&&(O?(O=E(O),S(O,this.S)):O=this.S),this.m!==null||this.O||(C.H=O,O=null),this.P)e:{for(var c=0,f=0;f<this.i.length;f++){t:{var m=this.i[f];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break t}m=void 0}if(m===void 0)break;if(c+=m,4096<c){c=f;break e}if(c===4096||f===this.i.length-1){c=f+1;break e}}c=1e3}else c=1e3;c=lh(this,C,c),f=On(this.I),Ze(f,"RID",a),Ze(f,"CVER",22),this.D&&Ze(f,"X-HTTP-Session-Id",this.D),ri(this,f),O&&(this.O?c="headers="+encodeURIComponent(String(Zc(O)))+"&"+c:this.m&&cl(f,this.m,O)),ul(this.h,C),this.Ua&&Ze(f,"TYPE","init"),this.P?(Ze(f,"$req",c),Ze(f,"SID","null"),C.T=!0,Je(C,f,null)):Je(C,f,c),this.G=2}}else this.G==3&&(a?ah(this,a):this.i.length==0||$c(this.h)||ah(this))};function ah(a,c){var f;c?f=c.l:f=a.U++;const m=On(a.I);Ze(m,"SID",a.K),Ze(m,"RID",f),Ze(m,"AID",a.T),ri(a,m),a.m&&a.o&&cl(m,a.m,a.o),f=new ge(a,a.j,f,a.B+1),a.m===null&&(f.H=a.o),c&&(a.i=c.D.concat(a.i)),c=lh(a,f,1e3),f.I=Math.round(.5*a.wa)+Math.round(.5*a.wa*Math.random()),ul(a.h,f),Je(f,m,c)}function ri(a,c){a.H&&oe(a.H,function(f,m){Ze(c,m,f)}),a.l&&Hc({},function(f,m){Ze(c,m,f)})}function lh(a,c,f){f=Math.min(a.i.length,f);var m=a.l?g(a.l.Na,a.l,a):null;e:{var C=a.i;let O=-1;for(;;){const Z=["count="+f];O==-1?0<f?(O=C[0].g,Z.push("ofs="+O)):O=0:Z.push("ofs="+O);let Ge=!0;for(let At=0;At<f;At++){let Ue=C[At].g;const Nt=C[At].map;if(Ue-=O,0>Ue)O=Math.max(0,C[At].g-100),Ge=!1;else try{A_(Nt,Z,"req"+Ue+"_")}catch{m&&m(Nt)}}if(Ge){m=Z.join("&");break e}}}return a=a.i.splice(0,f),c.D=a,m}function uh(a){if(!a.g&&!a.u){a.Y=1;var c=a.Fa;Ce||kt(),xe||(Ce(),xe=!0),gt.add(c,a),a.v=0}}function dl(a){return a.g||a.u||3<=a.v?!1:(a.Y++,a.u=Mr(g(a.Fa,a),dh(a,a.v)),a.v++,!0)}t.Fa=function(){if(this.u=null,ch(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var a=2*this.R;this.j.info("BP detection timer enabled: "+a),this.A=Mr(g(this.ab,this),a)}},t.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,It(10),yo(this),ch(this))};function fl(a){a.A!=null&&(l.clearTimeout(a.A),a.A=null)}function ch(a){a.g=new ge(a,a.j,"rpc",a.Y),a.m===null&&(a.g.H=a.o),a.g.O=0;var c=On(a.qa);Ze(c,"RID","rpc"),Ze(c,"SID",a.K),Ze(c,"AID",a.T),Ze(c,"CI",a.F?"0":"1"),!a.F&&a.ja&&Ze(c,"TO",a.ja),Ze(c,"TYPE","xmlhttp"),ri(a,c),a.m&&a.o&&cl(c,a.m,a.o),a.L&&(a.g.I=a.L);var f=a.g;a=a.ia,f.L=1,f.v=mo(On(c)),f.m=null,f.P=!0,un(f,a)}t.Za=function(){this.C!=null&&(this.C=null,yo(this),dl(this),It(19))};function bo(a){a.C!=null&&(l.clearTimeout(a.C),a.C=null)}function hh(a,c){var f=null;if(a.g==c){bo(a),fl(a),a.g=null;var m=2}else if(ll(a.h,c))f=c.D,qc(a.h,c),m=1;else return;if(a.G!=0){if(c.o)if(m==1){f=c.m?c.m.length:0,c=Date.now()-c.F;var C=a.B;m=os(),Te(m,new as(m,f)),wo(a)}else uh(a);else if(C=c.s,C==3||C==0&&0<c.X||!(m==1&&C_(a,c)||m==2&&dl(a)))switch(f&&0<f.length&&(c=a.h,c.i=c.i.concat(f)),C){case 1:Ur(a,5);break;case 4:Ur(a,10);break;case 3:Ur(a,6);break;default:Ur(a,2)}}}function dh(a,c){let f=a.Ta+Math.floor(Math.random()*a.cb);return a.isActive()||(f*=2),f*c}function Ur(a,c){if(a.j.info("Error code "+c),c==2){var f=g(a.fb,a),m=a.Xa;const C=!m;m=new Fr(m||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||fo(m,"https"),mo(m),C?E_(m.toString(),f):T_(m.toString(),f)}else It(2);a.G=0,a.l&&a.l.sa(c),fh(a),oh(a)}t.fb=function(a){a?(this.j.info("Successfully pinged google.com"),It(2)):(this.j.info("Failed to ping google.com"),It(1))};function fh(a){if(a.G=0,a.ka=[],a.l){const c=zc(a.h);(c.length!=0||a.i.length!=0)&&(N(a.ka,c),N(a.ka,a.i),a.h.i.length=0,D(a.i),a.i.length=0),a.l.ra()}}function ph(a,c,f){var m=f instanceof Fr?On(f):new Fr(f);if(m.g!="")c&&(m.g=c+"."+m.g),po(m,m.s);else{var C=l.location;m=C.protocol,c=c?c+"."+C.hostname:C.hostname,C=+C.port;var O=new Fr(null);m&&fo(O,m),c&&(O.g=c),C&&po(O,C),f&&(O.l=f),m=O}return f=a.D,c=a.ya,f&&c&&Ze(m,f,c),Ze(m,"VER",a.la),ri(a,m),m}function mh(a,c,f){if(c&&!a.J)throw Error("Can't create secondary domain capable XhrIo object.");return c=a.Ca&&!a.pa?new lt(new go({eb:f})):new lt(a.pa),c.Ha(a.J),c}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function gh(){}t=gh.prototype,t.ua=function(){},t.ta=function(){},t.sa=function(){},t.ra=function(){},t.isActive=function(){return!0},t.Na=function(){};function Eo(){}Eo.prototype.g=function(a,c){return new nn(a,c)};function nn(a,c){de.call(this),this.g=new ih(c),this.l=a,this.h=c&&c.messageUrlParams||null,a=c&&c.messageHeaders||null,c&&c.clientProtocolHeaderRequired&&(a?a["X-Client-Protocol"]="webchannel":a={"X-Client-Protocol":"webchannel"}),this.g.o=a,a=c&&c.initMessageHeaders||null,c&&c.messageContentType&&(a?a["X-WebChannel-Content-Type"]=c.messageContentType:a={"X-WebChannel-Content-Type":c.messageContentType}),c&&c.va&&(a?a["X-WebChannel-Client-Profile"]=c.va:a={"X-WebChannel-Client-Profile":c.va}),this.g.S=a,(a=c&&c.Sb)&&!B(a)&&(this.g.m=a),this.v=c&&c.supportsCrossDomainXhr||!1,this.u=c&&c.sendRawJson||!1,(c=c&&c.httpSessionIdParam)&&!B(c)&&(this.g.D=c,a=this.h,a!==null&&c in a&&(a=this.h,c in a&&delete a[c])),this.j=new us(this)}x(nn,de),nn.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},nn.prototype.close=function(){hl(this.g)},nn.prototype.o=function(a){var c=this.g;if(typeof a=="string"){var f={};f.__data__=a,a=f}else this.u&&(f={},f.__data__=vt(a),a=f);c.i.push(new d_(c.Ya++,a)),c.G==3&&wo(c)},nn.prototype.N=function(){this.g.l=null,delete this.j,hl(this.g),delete this.g,nn.aa.N.call(this)};function _h(a){is.call(this),a.__headers__&&(this.headers=a.__headers__,this.statusCode=a.__status__,delete a.__headers__,delete a.__status__);var c=a.__sm__;if(c){e:{for(const f in c){a=f;break e}a=void 0}(this.i=a)&&(a=this.i,c=c!==null&&a in c?c[a]:void 0),this.data=c}else this.data=a}x(_h,is);function vh(){Gs.call(this),this.status=1}x(vh,Gs);function us(a){this.g=a}x(us,gh),us.prototype.ua=function(){Te(this.g,"a")},us.prototype.ta=function(a){Te(this.g,new _h(a))},us.prototype.sa=function(a){Te(this.g,new vh)},us.prototype.ra=function(){Te(this.g,"b")},Eo.prototype.createWebChannel=Eo.prototype.g,nn.prototype.send=nn.prototype.o,nn.prototype.open=nn.prototype.m,nn.prototype.close=nn.prototype.close,hm=function(){return new Eo},cm=function(){return os()},um=Nn,hu={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},V.NO_ERROR=0,V.TIMEOUT=8,V.HTTP_ERROR=6,Uo=V,R.COMPLETE="complete",lm=R,oo.EventType=Or,Or.OPEN="a",Or.CLOSE="b",Or.ERROR="c",Or.MESSAGE="d",de.prototype.listen=de.prototype.K,ui=oo,lt.prototype.listenOnce=lt.prototype.L,lt.prototype.getLastError=lt.prototype.Ka,lt.prototype.getLastErrorCode=lt.prototype.Ba,lt.prototype.getStatus=lt.prototype.Z,lt.prototype.getResponseJson=lt.prototype.Oa,lt.prototype.getResponseText=lt.prototype.oa,lt.prototype.send=lt.prototype.ea,lt.prototype.setWithCredentials=lt.prototype.Ha,am=lt}).apply(typeof Ro<"u"?Ro:typeof self<"u"?self:typeof window<"u"?window:{});const Ed="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mt{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Mt.UNAUTHENTICATED=new Mt(null),Mt.GOOGLE_CREDENTIALS=new Mt("google-credentials-uid"),Mt.FIRST_PARTY=new Mt("first-party-uid"),Mt.MOCK_USER=new Mt("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let qs="10.14.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gr=new Qu("@firebase/firestore");function ai(){return Gr.logLevel}function ie(t,...e){if(Gr.logLevel<=Ne.DEBUG){const n=e.map(Xu);Gr.debug(`Firestore (${qs}): ${t}`,...n)}}function Jn(t,...e){if(Gr.logLevel<=Ne.ERROR){const n=e.map(Xu);Gr.error(`Firestore (${qs}): ${t}`,...n)}}function Os(t,...e){if(Gr.logLevel<=Ne.WARN){const n=e.map(Xu);Gr.warn(`Firestore (${qs}): ${t}`,...n)}}function Xu(t){if(typeof t=="string")return t;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
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
 */function we(t="Unexpected state"){const e=`FIRESTORE (${qs}) INTERNAL ASSERTION FAILED: `+t;throw Jn(e),new Error(e)}function We(t,e){t||we()}function Se(t,e){return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const F={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class ne extends tr{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kn{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dm{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class Mb{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(Mt.UNAUTHENTICATED))}shutdown(){}}class Lb{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class Fb{constructor(e){this.t=e,this.currentUser=Mt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){We(this.o===void 0);let r=this.i;const s=u=>this.i!==r?(r=this.i,n(u)):Promise.resolve();let i=new Kn;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Kn,e.enqueueRetryable(()=>s(this.currentUser))};const o=()=>{const u=i;e.enqueueRetryable(async()=>{await u.promise,await s(this.currentUser)})},l=u=>{ie("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),o())};this.t.onInit(u=>l(u)),setTimeout(()=>{if(!this.auth){const u=this.t.getImmediate({optional:!0});u?l(u):(ie("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Kn)}},0),o()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?(ie("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(We(typeof r.accessToken=="string"),new dm(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return We(e===null||typeof e=="string"),new Mt(e)}}class Ub{constructor(e,n,r){this.l=e,this.h=n,this.P=r,this.type="FirstParty",this.user=Mt.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class jb{constructor(e,n,r){this.l=e,this.h=n,this.P=r}getToken(){return Promise.resolve(new Ub(this.l,this.h,this.P))}start(e,n){e.enqueueRetryable(()=>n(Mt.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class $b{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Bb{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,n){We(this.o===void 0);const r=i=>{i.error!=null&&ie("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const o=i.token!==this.R;return this.R=i.token,ie("FirebaseAppCheckTokenProvider",`Received ${o?"new":"existing"} token.`),o?n(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{ie("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):ie("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(We(typeof n.token=="string"),this.R=n.token,new $b(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function qb(t){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fm{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const s=qb(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<n&&(r+=e.charAt(s[i]%e.length))}return r}}function je(t,e){return t<e?-1:t>e?1:0}function Ms(t,e,n){return t.length===e.length&&t.every((r,s)=>n(r,e[s]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yt{constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new ne(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new ne(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<-62135596800)throw new ne(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new ne(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return yt.fromMillis(Date.now())}static fromDate(e){return yt.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*n));return new yt(n,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?je(this.nanoseconds,e.nanoseconds):je(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ae{constructor(e){this.timestamp=e}static fromTimestamp(e){return new Ae(e)}static min(){return new Ae(new yt(0,0))}static max(){return new Ae(new yt(253402300799,999999999))}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mi{constructor(e,n,r){n===void 0?n=0:n>e.length&&we(),r===void 0?r=e.length-n:r>e.length-n&&we(),this.segments=e,this.offset=n,this.len=r}get length(){return this.len}isEqual(e){return Mi.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof Mi?e.forEach(r=>{n.push(r)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,r=this.limit();n<r;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const r=Math.min(e.length,n.length);for(let s=0;s<r;s++){const i=e.get(s),o=n.get(s);if(i<o)return-1;if(i>o)return 1}return e.length<n.length?-1:e.length>n.length?1:0}}class et extends Mi{construct(e,n,r){return new et(e,n,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const n=[];for(const r of e){if(r.indexOf("//")>=0)throw new ne(F.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);n.push(...r.split("/").filter(s=>s.length>0))}return new et(n)}static emptyPath(){return new et([])}}const zb=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Pt extends Mi{construct(e,n,r){return new Pt(e,n,r)}static isValidIdentifier(e){return zb.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Pt.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new Pt(["__name__"])}static fromServerFormat(e){const n=[];let r="",s=0;const i=()=>{if(r.length===0)throw new ne(F.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let o=!1;for(;s<e.length;){const l=e[s];if(l==="\\"){if(s+1===e.length)throw new ne(F.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const u=e[s+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new ne(F.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=u,s+=2}else l==="`"?(o=!o,s++):l!=="."||o?(r+=l,s++):(i(),s++)}if(i(),o)throw new ne(F.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Pt(n)}static emptyPath(){return new Pt([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class he{constructor(e){this.path=e}static fromPath(e){return new he(et.fromString(e))}static fromName(e){return new he(et.fromString(e).popFirst(5))}static empty(){return new he(et.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&et.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return et.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new he(new et(e.slice()))}}function Hb(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,s=Ae.fromTimestamp(r===1e9?new yt(n+1,0):new yt(n,r));return new Rr(s,he.empty(),e)}function Kb(t){return new Rr(t.readTime,t.key,-1)}class Rr{constructor(e,n,r){this.readTime=e,this.documentKey=n,this.largestBatchId=r}static min(){return new Rr(Ae.min(),he.empty(),-1)}static max(){return new Rr(Ae.max(),he.empty(),-1)}}function Wb(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=he.comparator(t.documentKey,e.documentKey),n!==0?n:je(t.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gb="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Qb{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Qi(t){if(t.code!==F.FAILED_PRECONDITION||t.message!==Gb)throw t;ie("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class K{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&we(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new K((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(n,i).next(r,s)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{const n=e();return n instanceof K?n:K.resolve(n)}catch(n){return K.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):K.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):K.reject(n)}static resolve(e){return new K((n,r)=>{n(e)})}static reject(e){return new K((n,r)=>{r(e)})}static waitFor(e){return new K((n,r)=>{let s=0,i=0,o=!1;e.forEach(l=>{++s,l.next(()=>{++i,o&&i===s&&n()},u=>r(u))}),o=!0,i===s&&n()})}static or(e){let n=K.resolve(!1);for(const r of e)n=n.next(s=>s?K.resolve(s):r());return n}static forEach(e,n){const r=[];return e.forEach((s,i)=>{r.push(n.call(this,s,i))}),this.waitFor(r)}static mapArray(e,n){return new K((r,s)=>{const i=e.length,o=new Array(i);let l=0;for(let u=0;u<i;u++){const h=u;n(e[h]).next(d=>{o[h]=d,++l,l===i&&r(o)},d=>s(d))}})}static doWhile(e,n){return new K((r,s)=>{const i=()=>{e()===!0?n().next(()=>{i()},s):r()};i()})}}function Jb(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function Ji(t){return t.name==="IndexedDbTransactionError"}/**
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
 */class Zu{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=r=>this.ie(r),this.se=r=>n.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}Zu.oe=-1;function Na(t){return t==null}function sa(t){return t===0&&1/t==-1/0}function Yb(t){return typeof t=="number"&&Number.isInteger(t)&&!sa(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Td(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function es(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function pm(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class it{constructor(e,n){this.comparator=e,this.root=n||St.EMPTY}insert(e,n){return new it(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,St.BLACK,null,null))}remove(e){return new it(this.comparator,this.root.remove(e,this.comparator).copy(null,null,St.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){const r=this.comparator(e,n.key);if(r===0)return n.value;r<0?n=n.left:r>0&&(n=n.right)}return null}indexOf(e){let n=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(e,r.key);if(s===0)return n+r.left.size;s<0?r=r.left:(n+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,r)=>(e(n,r),!1))}toString(){const e=[];return this.inorderTraversal((n,r)=>(e.push(`${n}:${r}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Po(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Po(this.root,e,this.comparator,!1)}getReverseIterator(){return new Po(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Po(this.root,e,this.comparator,!0)}}class Po{constructor(e,n,r,s){this.isReverse=s,this.nodeStack=[];let i=1;for(;!e.isEmpty();)if(i=n?r(e.key,n):1,n&&s&&(i*=-1),i<0)e=this.isReverse?e.left:e.right;else{if(i===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop();const n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}}class St{constructor(e,n,r,s,i){this.key=e,this.value=n,this.color=r??St.RED,this.left=s??St.EMPTY,this.right=i??St.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,r,s,i){return new St(e??this.key,n??this.value,r??this.color,s??this.left,i??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,r){let s=this;const i=r(e,s.key);return s=i<0?s.copy(null,null,null,s.left.insert(e,n,r),null):i===0?s.copy(null,n,null,null,null):s.copy(null,null,null,null,s.right.insert(e,n,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return St.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let r,s=this;if(n(e,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(e,n),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),n(e,s.key)===0){if(s.right.isEmpty())return St.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(e,n))}return s.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){const e=this.copy(null,null,St.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){const e=this.copy(null,null,St.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){const e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){const e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed()||this.right.isRed())throw we();const e=this.left.check();if(e!==this.right.check())throw we();return e+(this.isRed()?0:1)}}St.EMPTY=null,St.RED=!0,St.BLACK=!1;St.EMPTY=new class{constructor(){this.size=0}get key(){throw we()}get value(){throw we()}get color(){throw we()}get left(){throw we()}get right(){throw we()}copy(e,n,r,s,i){return this}insert(e,n,r){return new St(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ct{constructor(e){this.comparator=e,this.data=new it(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,r)=>(e(n),!1))}forEachInRange(e,n){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;n(s.key)}}forEachWhile(e,n){let r;for(r=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new Id(this.data.getIterator())}getIteratorFrom(e){return new Id(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(r=>{n=n.add(r)}),n}isEqual(e){if(!(e instanceof Ct)||this.size!==e.size)return!1;const n=this.data.getIterator(),r=e.data.getIterator();for(;n.hasNext();){const s=n.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(n=>{e.push(n)}),e}toString(){const e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){const n=new Ct(this.comparator);return n.data=e,n}}class Id{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class an{constructor(e){this.fields=e,e.sort(Pt.comparator)}static empty(){return new an([])}unionWith(e){let n=new Ct(Pt.comparator);for(const r of this.fields)n=n.add(r);for(const r of e)n=n.add(r);return new an(n.toArray())}covers(e){for(const n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return Ms(this.fields,e.fields,(n,r)=>n.isEqual(r))}}/**
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
 */class mm extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xt{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new mm("Invalid base64 string: "+i):i}}(e);return new xt(n)}static fromUint8Array(e){const n=function(s){let i="";for(let o=0;o<s.length;++o)i+=String.fromCharCode(s[o]);return i}(e);return new xt(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const r=new Uint8Array(n.length);for(let s=0;s<n.length;s++)r[s]=n.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return je(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}xt.EMPTY_BYTE_STRING=new xt("");const Xb=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Pr(t){if(We(!!t),typeof t=="string"){let e=0;const n=Xb.exec(t);if(We(!!n),n[1]){let s=n[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:ht(t.seconds),nanos:ht(t.nanos)}}function ht(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function Qr(t){return typeof t=="string"?xt.fromBase64String(t):xt.fromUint8Array(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ec(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="server_timestamp"}function tc(t){const e=t.mapValue.fields.__previous_value__;return ec(e)?tc(e):e}function Li(t){const e=Pr(t.mapValue.fields.__local_write_time__.timestampValue);return new yt(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zb{constructor(e,n,r,s,i,o,l,u,h){this.databaseId=e,this.appId=n,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=o,this.autoDetectLongPolling=l,this.longPollingOptions=u,this.useFetchStreams=h}}class Fi{constructor(e,n){this.projectId=e,this.database=n||"(default)"}static empty(){return new Fi("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof Fi&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Co={mapValue:{fields:{__type__:{stringValue:"__max__"}}}};function Jr(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?ec(t)?4:tE(t)?9007199254740991:eE(t)?10:11:we()}function kn(t,e){if(t===e)return!0;const n=Jr(t);if(n!==Jr(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return Li(t).isEqual(Li(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const o=Pr(s.timestampValue),l=Pr(i.timestampValue);return o.seconds===l.seconds&&o.nanos===l.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(s,i){return Qr(s.bytesValue).isEqual(Qr(i.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(s,i){return ht(s.geoPointValue.latitude)===ht(i.geoPointValue.latitude)&&ht(s.geoPointValue.longitude)===ht(i.geoPointValue.longitude)}(t,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return ht(s.integerValue)===ht(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const o=ht(s.doubleValue),l=ht(i.doubleValue);return o===l?sa(o)===sa(l):isNaN(o)&&isNaN(l)}return!1}(t,e);case 9:return Ms(t.arrayValue.values||[],e.arrayValue.values||[],kn);case 10:case 11:return function(s,i){const o=s.mapValue.fields||{},l=i.mapValue.fields||{};if(Td(o)!==Td(l))return!1;for(const u in o)if(o.hasOwnProperty(u)&&(l[u]===void 0||!kn(o[u],l[u])))return!1;return!0}(t,e);default:return we()}}function Ui(t,e){return(t.values||[]).find(n=>kn(n,e))!==void 0}function Ls(t,e){if(t===e)return 0;const n=Jr(t),r=Jr(e);if(n!==r)return je(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return je(t.booleanValue,e.booleanValue);case 2:return function(i,o){const l=ht(i.integerValue||i.doubleValue),u=ht(o.integerValue||o.doubleValue);return l<u?-1:l>u?1:l===u?0:isNaN(l)?isNaN(u)?0:-1:1}(t,e);case 3:return Ad(t.timestampValue,e.timestampValue);case 4:return Ad(Li(t),Li(e));case 5:return je(t.stringValue,e.stringValue);case 6:return function(i,o){const l=Qr(i),u=Qr(o);return l.compareTo(u)}(t.bytesValue,e.bytesValue);case 7:return function(i,o){const l=i.split("/"),u=o.split("/");for(let h=0;h<l.length&&h<u.length;h++){const d=je(l[h],u[h]);if(d!==0)return d}return je(l.length,u.length)}(t.referenceValue,e.referenceValue);case 8:return function(i,o){const l=je(ht(i.latitude),ht(o.latitude));return l!==0?l:je(ht(i.longitude),ht(o.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return Sd(t.arrayValue,e.arrayValue);case 10:return function(i,o){var l,u,h,d;const p=i.fields||{},g=o.fields||{},v=(l=p.value)===null||l===void 0?void 0:l.arrayValue,x=(u=g.value)===null||u===void 0?void 0:u.arrayValue,D=je(((h=v==null?void 0:v.values)===null||h===void 0?void 0:h.length)||0,((d=x==null?void 0:x.values)===null||d===void 0?void 0:d.length)||0);return D!==0?D:Sd(v,x)}(t.mapValue,e.mapValue);case 11:return function(i,o){if(i===Co.mapValue&&o===Co.mapValue)return 0;if(i===Co.mapValue)return 1;if(o===Co.mapValue)return-1;const l=i.fields||{},u=Object.keys(l),h=o.fields||{},d=Object.keys(h);u.sort(),d.sort();for(let p=0;p<u.length&&p<d.length;++p){const g=je(u[p],d[p]);if(g!==0)return g;const v=Ls(l[u[p]],h[d[p]]);if(v!==0)return v}return je(u.length,d.length)}(t.mapValue,e.mapValue);default:throw we()}}function Ad(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return je(t,e);const n=Pr(t),r=Pr(e),s=je(n.seconds,r.seconds);return s!==0?s:je(n.nanos,r.nanos)}function Sd(t,e){const n=t.values||[],r=e.values||[];for(let s=0;s<n.length&&s<r.length;++s){const i=Ls(n[s],r[s]);if(i)return i}return je(n.length,r.length)}function Fs(t){return du(t)}function du(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){const r=Pr(n);return`time(${r.seconds},${r.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return Qr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return he.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let r="[",s=!0;for(const i of n.values||[])s?s=!1:r+=",",r+=du(i);return r+"]"}(t.arrayValue):"mapValue"in t?function(n){const r=Object.keys(n.fields||{}).sort();let s="{",i=!0;for(const o of r)i?i=!1:s+=",",s+=`${o}:${du(n.fields[o])}`;return s+"}"}(t.mapValue):we()}function Rd(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function fu(t){return!!t&&"integerValue"in t}function nc(t){return!!t&&"arrayValue"in t}function Pd(t){return!!t&&"nullValue"in t}function Cd(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function jo(t){return!!t&&"mapValue"in t}function eE(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="__vector__"}function Ei(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return es(t.mapValue.fields,(n,r)=>e.mapValue.fields[n]=Ei(r)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=Ei(t.arrayValue.values[n]);return e}return Object.assign({},t)}function tE(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zt{constructor(e){this.value=e}static empty(){return new Zt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let r=0;r<e.length-1;++r)if(n=(n.mapValue.fields||{})[e.get(r)],!jo(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ei(n)}setAll(e){let n=Pt.emptyPath(),r={},s=[];e.forEach((o,l)=>{if(!n.isImmediateParentOf(l)){const u=this.getFieldsMap(n);this.applyChanges(u,r,s),r={},s=[],n=l.popLast()}o?r[l.lastSegment()]=Ei(o):s.push(l.lastSegment())});const i=this.getFieldsMap(n);this.applyChanges(i,r,s)}delete(e){const n=this.field(e.popLast());jo(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return kn(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=n.mapValue.fields[e.get(r)];jo(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},n.mapValue.fields[e.get(r)]=s),n=s}return n.mapValue.fields}applyChanges(e,n,r){es(n,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new Zt(Ei(this.value))}}function gm(t){const e=[];return es(t.fields,(n,r)=>{const s=new Pt([n]);if(jo(r)){const i=gm(r.mapValue).fields;if(i.length===0)e.push(s);else for(const o of i)e.push(s.child(o))}else e.push(s)}),new an(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ft{constructor(e,n,r,s,i,o,l){this.key=e,this.documentType=n,this.version=r,this.readTime=s,this.createTime=i,this.data=o,this.documentState=l}static newInvalidDocument(e){return new Ft(e,0,Ae.min(),Ae.min(),Ae.min(),Zt.empty(),0)}static newFoundDocument(e,n,r,s){return new Ft(e,1,n,Ae.min(),r,s,0)}static newNoDocument(e,n){return new Ft(e,2,n,Ae.min(),Ae.min(),Zt.empty(),0)}static newUnknownDocument(e,n){return new Ft(e,3,n,Ae.min(),Ae.min(),Zt.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(Ae.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Zt.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Zt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=Ae.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof Ft&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new Ft(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
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
 */class ia{constructor(e,n){this.position=e,this.inclusive=n}}function xd(t,e,n){let r=0;for(let s=0;s<t.position.length;s++){const i=e[s],o=t.position[s];if(i.field.isKeyField()?r=he.comparator(he.fromName(o.referenceValue),n.key):r=Ls(o,n.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function kd(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!kn(t.position[n],e.position[n]))return!1;return!0}/**
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
 */class ji{constructor(e,n="asc"){this.field=e,this.dir=n}}function nE(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}/**
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
 */class _m{}class pt extends _m{constructor(e,n,r){super(),this.field=e,this.op=n,this.value=r}static create(e,n,r){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,r):new sE(e,n,r):n==="array-contains"?new aE(e,r):n==="in"?new lE(e,r):n==="not-in"?new uE(e,r):n==="array-contains-any"?new cE(e,r):new pt(e,n,r)}static createKeyFieldInFilter(e,n,r){return n==="in"?new iE(e,r):new oE(e,r)}matches(e){const n=e.data.field(this.field);return this.op==="!="?n!==null&&this.matchesComparison(Ls(n,this.value)):n!==null&&Jr(this.value)===Jr(n)&&this.matchesComparison(Ls(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return we()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class vn extends _m{constructor(e,n){super(),this.filters=e,this.op=n,this.ae=null}static create(e,n){return new vn(e,n)}matches(e){return vm(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function vm(t){return t.op==="and"}function ym(t){return rE(t)&&vm(t)}function rE(t){for(const e of t.filters)if(e instanceof vn)return!1;return!0}function pu(t){if(t instanceof pt)return t.field.canonicalString()+t.op.toString()+Fs(t.value);if(ym(t))return t.filters.map(e=>pu(e)).join(",");{const e=t.filters.map(n=>pu(n)).join(",");return`${t.op}(${e})`}}function wm(t,e){return t instanceof pt?function(r,s){return s instanceof pt&&r.op===s.op&&r.field.isEqual(s.field)&&kn(r.value,s.value)}(t,e):t instanceof vn?function(r,s){return s instanceof vn&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,o,l)=>i&&wm(o,s.filters[l]),!0):!1}(t,e):void we()}function bm(t){return t instanceof pt?function(n){return`${n.field.canonicalString()} ${n.op} ${Fs(n.value)}`}(t):t instanceof vn?function(n){return n.op.toString()+" {"+n.getFilters().map(bm).join(" ,")+"}"}(t):"Filter"}class sE extends pt{constructor(e,n,r){super(e,n,r),this.key=he.fromName(r.referenceValue)}matches(e){const n=he.comparator(e.key,this.key);return this.matchesComparison(n)}}class iE extends pt{constructor(e,n){super(e,"in",n),this.keys=Em("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}}class oE extends pt{constructor(e,n){super(e,"not-in",n),this.keys=Em("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}}function Em(t,e){var n;return(((n=e.arrayValue)===null||n===void 0?void 0:n.values)||[]).map(r=>he.fromName(r.referenceValue))}class aE extends pt{constructor(e,n){super(e,"array-contains",n)}matches(e){const n=e.data.field(this.field);return nc(n)&&Ui(n.arrayValue,this.value)}}class lE extends pt{constructor(e,n){super(e,"in",n)}matches(e){const n=e.data.field(this.field);return n!==null&&Ui(this.value.arrayValue,n)}}class uE extends pt{constructor(e,n){super(e,"not-in",n)}matches(e){if(Ui(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const n=e.data.field(this.field);return n!==null&&!Ui(this.value.arrayValue,n)}}class cE extends pt{constructor(e,n){super(e,"array-contains-any",n)}matches(e){const n=e.data.field(this.field);return!(!nc(n)||!n.arrayValue.values)&&n.arrayValue.values.some(r=>Ui(this.value.arrayValue,r))}}/**
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
 */class hE{constructor(e,n=null,r=[],s=[],i=null,o=null,l=null){this.path=e,this.collectionGroup=n,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=o,this.endAt=l,this.ue=null}}function Dd(t,e=null,n=[],r=[],s=null,i=null,o=null){return new hE(t,e,n,r,s,i,o)}function rc(t){const e=Se(t);if(e.ue===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(r=>pu(r)).join(","),n+="|ob:",n+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),Na(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(r=>Fs(r)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(r=>Fs(r)).join(",")),e.ue=n}return e.ue}function sc(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!nE(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!wm(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!kd(t.startAt,e.startAt)&&kd(t.endAt,e.endAt)}function mu(t){return he.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zs{constructor(e,n=null,r=[],s=[],i=null,o="F",l=null,u=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=o,this.startAt=l,this.endAt=u,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function dE(t,e,n,r,s,i,o,l){return new zs(t,e,n,r,s,i,o,l)}function ic(t){return new zs(t)}function Nd(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function Tm(t){return t.collectionGroup!==null}function Ti(t){const e=Se(t);if(e.ce===null){e.ce=[];const n=new Set;for(const i of e.explicitOrderBy)e.ce.push(i),n.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(o){let l=new Ct(Pt.comparator);return o.filters.forEach(u=>{u.getFlattenedFilters().forEach(h=>{h.isInequality()&&(l=l.add(h.field))})}),l})(e).forEach(i=>{n.has(i.canonicalString())||i.isKeyField()||e.ce.push(new ji(i,r))}),n.has(Pt.keyField().canonicalString())||e.ce.push(new ji(Pt.keyField(),r))}return e.ce}function Sn(t){const e=Se(t);return e.le||(e.le=fE(e,Ti(t))),e.le}function fE(t,e){if(t.limitType==="F")return Dd(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new ji(s.field,i)});const n=t.endAt?new ia(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new ia(t.startAt.position,t.startAt.inclusive):null;return Dd(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}function gu(t,e){const n=t.filters.concat([e]);return new zs(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function _u(t,e,n){return new zs(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function Va(t,e){return sc(Sn(t),Sn(e))&&t.limitType===e.limitType}function Im(t){return`${rc(Sn(t))}|lt:${t.limitType}`}function ms(t){return`Query(target=${function(n){let r=n.path.canonicalString();return n.collectionGroup!==null&&(r+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(r+=`, filters: [${n.filters.map(s=>bm(s)).join(", ")}]`),Na(n.limit)||(r+=", limit: "+n.limit),n.orderBy.length>0&&(r+=`, orderBy: [${n.orderBy.map(s=>function(o){return`${o.field.canonicalString()} (${o.dir})`}(s)).join(", ")}]`),n.startAt&&(r+=", startAt: ",r+=n.startAt.inclusive?"b:":"a:",r+=n.startAt.position.map(s=>Fs(s)).join(",")),n.endAt&&(r+=", endAt: ",r+=n.endAt.inclusive?"a:":"b:",r+=n.endAt.position.map(s=>Fs(s)).join(",")),`Target(${r})`}(Sn(t))}; limitType=${t.limitType})`}function Oa(t,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):he.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(t,e)&&function(r,s){for(const i of Ti(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(t,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(t,e)&&function(r,s){return!(r.startAt&&!function(o,l,u){const h=xd(o,l,u);return o.inclusive?h<=0:h<0}(r.startAt,Ti(r),s)||r.endAt&&!function(o,l,u){const h=xd(o,l,u);return o.inclusive?h>=0:h>0}(r.endAt,Ti(r),s))}(t,e)}function pE(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function Am(t){return(e,n)=>{let r=!1;for(const s of Ti(t)){const i=mE(s,e,n);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function mE(t,e,n){const r=t.field.isKeyField()?he.comparator(e.key,n.key):function(i,o,l){const u=o.data.field(i),h=l.data.field(i);return u!==null&&h!==null?Ls(u,h):we()}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return we()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hs{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,n){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,n]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,n]);s.push([e,n]),this.innerSize++}delete(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[n]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){es(this.inner,(n,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return pm(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const gE=new it(he.comparator);function Yn(){return gE}const Sm=new it(he.comparator);function ci(...t){let e=Sm;for(const n of t)e=e.insert(n.key,n);return e}function Rm(t){let e=Sm;return t.forEach((n,r)=>e=e.insert(n,r.overlayedDocument)),e}function zr(){return Ii()}function Pm(){return Ii()}function Ii(){return new Hs(t=>t.toString(),(t,e)=>t.isEqual(e))}const _E=new it(he.comparator),vE=new Ct(he.comparator);function De(...t){let e=vE;for(const n of t)e=e.add(n);return e}const yE=new Ct(je);function wE(){return yE}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function oc(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:sa(e)?"-0":e}}function Cm(t){return{integerValue:""+t}}function bE(t,e){return Yb(e)?Cm(e):oc(t,e)}/**
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
 */class Ma{constructor(){this._=void 0}}function EE(t,e,n){return t instanceof $i?function(s,i){const o={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&ec(i)&&(i=tc(i)),i&&(o.fields.__previous_value__=i),{mapValue:o}}(n,e):t instanceof Bi?km(t,e):t instanceof qi?Dm(t,e):function(s,i){const o=xm(s,i),l=Vd(o)+Vd(s.Pe);return fu(o)&&fu(s.Pe)?Cm(l):oc(s.serializer,l)}(t,e)}function TE(t,e,n){return t instanceof Bi?km(t,e):t instanceof qi?Dm(t,e):n}function xm(t,e){return t instanceof oa?function(r){return fu(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class $i extends Ma{}class Bi extends Ma{constructor(e){super(),this.elements=e}}function km(t,e){const n=Nm(e);for(const r of t.elements)n.some(s=>kn(s,r))||n.push(r);return{arrayValue:{values:n}}}class qi extends Ma{constructor(e){super(),this.elements=e}}function Dm(t,e){let n=Nm(e);for(const r of t.elements)n=n.filter(s=>!kn(s,r));return{arrayValue:{values:n}}}class oa extends Ma{constructor(e,n){super(),this.serializer=e,this.Pe=n}}function Vd(t){return ht(t.integerValue||t.doubleValue)}function Nm(t){return nc(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class IE{constructor(e,n){this.field=e,this.transform=n}}function AE(t,e){return t.field.isEqual(e.field)&&function(r,s){return r instanceof Bi&&s instanceof Bi||r instanceof qi&&s instanceof qi?Ms(r.elements,s.elements,kn):r instanceof oa&&s instanceof oa?kn(r.Pe,s.Pe):r instanceof $i&&s instanceof $i}(t.transform,e.transform)}class SE{constructor(e,n){this.version=e,this.transformResults=n}}class en{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new en}static exists(e){return new en(void 0,e)}static updateTime(e){return new en(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function $o(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}class La{}function Vm(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new Fa(t.key,en.none()):new Yi(t.key,t.data,en.none());{const n=t.data,r=Zt.empty();let s=new Ct(Pt.comparator);for(let i of e.fields)if(!s.has(i)){let o=n.field(i);o===null&&i.length>1&&(i=i.popLast(),o=n.field(i)),o===null?r.delete(i):r.set(i,o),s=s.add(i)}return new Nr(t.key,r,new an(s.toArray()),en.none())}}function RE(t,e,n){t instanceof Yi?function(s,i,o){const l=s.value.clone(),u=Md(s.fieldTransforms,i,o.transformResults);l.setAll(u),i.convertToFoundDocument(o.version,l).setHasCommittedMutations()}(t,e,n):t instanceof Nr?function(s,i,o){if(!$o(s.precondition,i))return void i.convertToUnknownDocument(o.version);const l=Md(s.fieldTransforms,i,o.transformResults),u=i.data;u.setAll(Om(s)),u.setAll(l),i.convertToFoundDocument(o.version,u).setHasCommittedMutations()}(t,e,n):function(s,i,o){i.convertToNoDocument(o.version).setHasCommittedMutations()}(0,e,n)}function Ai(t,e,n,r){return t instanceof Yi?function(i,o,l,u){if(!$o(i.precondition,o))return l;const h=i.value.clone(),d=Ld(i.fieldTransforms,u,o);return h.setAll(d),o.convertToFoundDocument(o.version,h).setHasLocalMutations(),null}(t,e,n,r):t instanceof Nr?function(i,o,l,u){if(!$o(i.precondition,o))return l;const h=Ld(i.fieldTransforms,u,o),d=o.data;return d.setAll(Om(i)),d.setAll(h),o.convertToFoundDocument(o.version,d).setHasLocalMutations(),l===null?null:l.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(p=>p.field))}(t,e,n,r):function(i,o,l){return $o(i.precondition,o)?(o.convertToNoDocument(o.version).setHasLocalMutations(),null):l}(t,e,n)}function PE(t,e){let n=null;for(const r of t.fieldTransforms){const s=e.data.field(r.field),i=xm(r.transform,s||null);i!=null&&(n===null&&(n=Zt.empty()),n.set(r.field,i))}return n||null}function Od(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&Ms(r,s,(i,o)=>AE(i,o))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class Yi extends La{constructor(e,n,r,s=[]){super(),this.key=e,this.value=n,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Nr extends La{constructor(e,n,r,s,i=[]){super(),this.key=e,this.data=n,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Om(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function Md(t,e,n){const r=new Map;We(t.length===n.length);for(let s=0;s<n.length;s++){const i=t[s],o=i.transform,l=e.data.field(i.field);r.set(i.field,TE(o,l,n[s]))}return r}function Ld(t,e,n){const r=new Map;for(const s of t){const i=s.transform,o=n.data.field(s.field);r.set(s.field,EE(i,o,e))}return r}class Fa extends La{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class CE extends La{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xE{constructor(e,n,r,s){this.batchId=e,this.localWriteTime=n,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,n){const r=n.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&RE(i,e,r[s])}}applyToLocalView(e,n){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(n=Ai(r,e,n,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(n=Ai(r,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){const r=Pm();return this.mutations.forEach(s=>{const i=e.get(s.key),o=i.overlayedDocument;let l=this.applyToLocalView(o,i.mutatedFields);l=n.has(s.key)?null:l;const u=Vm(o,l);u!==null&&r.set(s.key,u),o.isValidDocument()||o.convertToNoDocument(Ae.min())}),r}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),De())}isEqual(e){return this.batchId===e.batchId&&Ms(this.mutations,e.mutations,(n,r)=>Od(n,r))&&Ms(this.baseMutations,e.baseMutations,(n,r)=>Od(n,r))}}class ac{constructor(e,n,r,s){this.batch=e,this.commitVersion=n,this.mutationResults=r,this.docVersions=s}static from(e,n,r){We(e.mutations.length===r.length);let s=function(){return _E}();const i=e.mutations;for(let o=0;o<i.length;o++)s=s.insert(i[o].key,r[o].version);return new ac(e,n,r,s)}}/**
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
 */class kE{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class DE{constructor(e,n){this.count=e,this.unchangedNames=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ft,Ve;function NE(t){switch(t){default:return we();case F.CANCELLED:case F.UNKNOWN:case F.DEADLINE_EXCEEDED:case F.RESOURCE_EXHAUSTED:case F.INTERNAL:case F.UNAVAILABLE:case F.UNAUTHENTICATED:return!1;case F.INVALID_ARGUMENT:case F.NOT_FOUND:case F.ALREADY_EXISTS:case F.PERMISSION_DENIED:case F.FAILED_PRECONDITION:case F.ABORTED:case F.OUT_OF_RANGE:case F.UNIMPLEMENTED:case F.DATA_LOSS:return!0}}function Mm(t){if(t===void 0)return Jn("GRPC error has no .code"),F.UNKNOWN;switch(t){case ft.OK:return F.OK;case ft.CANCELLED:return F.CANCELLED;case ft.UNKNOWN:return F.UNKNOWN;case ft.DEADLINE_EXCEEDED:return F.DEADLINE_EXCEEDED;case ft.RESOURCE_EXHAUSTED:return F.RESOURCE_EXHAUSTED;case ft.INTERNAL:return F.INTERNAL;case ft.UNAVAILABLE:return F.UNAVAILABLE;case ft.UNAUTHENTICATED:return F.UNAUTHENTICATED;case ft.INVALID_ARGUMENT:return F.INVALID_ARGUMENT;case ft.NOT_FOUND:return F.NOT_FOUND;case ft.ALREADY_EXISTS:return F.ALREADY_EXISTS;case ft.PERMISSION_DENIED:return F.PERMISSION_DENIED;case ft.FAILED_PRECONDITION:return F.FAILED_PRECONDITION;case ft.ABORTED:return F.ABORTED;case ft.OUT_OF_RANGE:return F.OUT_OF_RANGE;case ft.UNIMPLEMENTED:return F.UNIMPLEMENTED;case ft.DATA_LOSS:return F.DATA_LOSS;default:return we()}}(Ve=ft||(ft={}))[Ve.OK=0]="OK",Ve[Ve.CANCELLED=1]="CANCELLED",Ve[Ve.UNKNOWN=2]="UNKNOWN",Ve[Ve.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Ve[Ve.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Ve[Ve.NOT_FOUND=5]="NOT_FOUND",Ve[Ve.ALREADY_EXISTS=6]="ALREADY_EXISTS",Ve[Ve.PERMISSION_DENIED=7]="PERMISSION_DENIED",Ve[Ve.UNAUTHENTICATED=16]="UNAUTHENTICATED",Ve[Ve.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Ve[Ve.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Ve[Ve.ABORTED=10]="ABORTED",Ve[Ve.OUT_OF_RANGE=11]="OUT_OF_RANGE",Ve[Ve.UNIMPLEMENTED=12]="UNIMPLEMENTED",Ve[Ve.INTERNAL=13]="INTERNAL",Ve[Ve.UNAVAILABLE=14]="UNAVAILABLE",Ve[Ve.DATA_LOSS=15]="DATA_LOSS";/**
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
 */function VE(){return new TextEncoder}/**
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
 */const OE=new Kr([4294967295,4294967295],0);function Fd(t){const e=VE().encode(t),n=new om;return n.update(e),new Uint8Array(n.digest())}function Ud(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new Kr([n,r],0),new Kr([s,i],0)]}class lc{constructor(e,n,r){if(this.bitmap=e,this.padding=n,this.hashCount=r,n<0||n>=8)throw new hi(`Invalid padding: ${n}`);if(r<0)throw new hi(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new hi(`Invalid hash count: ${r}`);if(e.length===0&&n!==0)throw new hi(`Invalid padding when bitmap length is 0: ${n}`);this.Ie=8*e.length-n,this.Te=Kr.fromNumber(this.Ie)}Ee(e,n,r){let s=e.add(n.multiply(Kr.fromNumber(r)));return s.compare(OE)===1&&(s=new Kr([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const n=Fd(e),[r,s]=Ud(n);for(let i=0;i<this.hashCount;i++){const o=this.Ee(r,s,i);if(!this.de(o))return!1}return!0}static create(e,n,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),o=new lc(i,s,n);return r.forEach(l=>o.insert(l)),o}insert(e){if(this.Ie===0)return;const n=Fd(e),[r,s]=Ud(n);for(let i=0;i<this.hashCount;i++){const o=this.Ee(r,s,i);this.Ae(o)}}Ae(e){const n=Math.floor(e/8),r=e%8;this.bitmap[n]|=1<<r}}class hi extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ua{constructor(e,n,r,s,i){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,n,r){const s=new Map;return s.set(e,Xi.createSynthesizedTargetChangeForCurrentChange(e,n,r)),new Ua(Ae.min(),s,new it(je),Yn(),De())}}class Xi{constructor(e,n,r,s,i){this.resumeToken=e,this.current=n,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,n,r){return new Xi(r,n,De(),De(),De())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bo{constructor(e,n,r,s){this.Re=e,this.removedTargetIds=n,this.key=r,this.Ve=s}}class Lm{constructor(e,n){this.targetId=e,this.me=n}}class Fm{constructor(e,n,r=xt.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=n,this.resumeToken=r,this.cause=s}}class jd{constructor(){this.fe=0,this.ge=Bd(),this.pe=xt.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=De(),n=De(),r=De();return this.ge.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:n=n.add(s);break;case 1:r=r.add(s);break;default:we()}}),new Xi(this.pe,this.ye,e,n,r)}Ce(){this.we=!1,this.ge=Bd()}Fe(e,n){this.we=!0,this.ge=this.ge.insert(e,n)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,We(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class ME{constructor(e){this.Le=e,this.Be=new Map,this.ke=Yn(),this.qe=$d(),this.Qe=new it(je)}Ke(e){for(const n of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(n,e.Ve):this.Ue(n,e.key,e.Ve);for(const n of e.removedTargetIds)this.Ue(n,e.key,e.Ve)}We(e){this.forEachTarget(e,n=>{const r=this.Ge(n);switch(e.state){case 0:this.ze(n)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(n);break;case 3:this.ze(n)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(n)&&(this.je(n),r.De(e.resumeToken));break;default:we()}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.Be.forEach((r,s)=>{this.ze(s)&&n(s)})}He(e){const n=e.targetId,r=e.me.count,s=this.Je(n);if(s){const i=s.target;if(mu(i))if(r===0){const o=new he(i.path);this.Ue(n,o,Ft.newNoDocument(o,Ae.min()))}else We(r===1);else{const o=this.Ye(n);if(o!==r){const l=this.Ze(e),u=l?this.Xe(l,e,o):1;if(u!==0){this.je(n);const h=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(n,h)}}}}}Ze(e){const n=e.me.unchangedNames;if(!n||!n.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=n;let o,l;try{o=Qr(r).toUint8Array()}catch(u){if(u instanceof mm)return Os("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{l=new lc(o,s,i)}catch(u){return Os(u instanceof hi?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return l.Ie===0?null:l}Xe(e,n,r){return n.me.count===r-this.nt(e,n.targetId)?0:2}nt(e,n){const r=this.Le.getRemoteKeysForTarget(n);let s=0;return r.forEach(i=>{const o=this.Le.tt(),l=`projects/${o.projectId}/databases/${o.database}/documents/${i.path.canonicalString()}`;e.mightContain(l)||(this.Ue(n,i,null),s++)}),s}rt(e){const n=new Map;this.Be.forEach((i,o)=>{const l=this.Je(o);if(l){if(i.current&&mu(l.target)){const u=new he(l.target.path);this.ke.get(u)!==null||this.it(o,u)||this.Ue(o,u,Ft.newNoDocument(u,e))}i.be&&(n.set(o,i.ve()),i.Ce())}});let r=De();this.qe.forEach((i,o)=>{let l=!0;o.forEachWhile(u=>{const h=this.Je(u);return!h||h.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(i))}),this.ke.forEach((i,o)=>o.setReadTime(e));const s=new Ua(e,n,this.Qe,this.ke,r);return this.ke=Yn(),this.qe=$d(),this.Qe=new it(je),s}$e(e,n){if(!this.ze(e))return;const r=this.it(e,n.key)?2:0;this.Ge(e).Fe(n.key,r),this.ke=this.ke.insert(n.key,n),this.qe=this.qe.insert(n.key,this.st(n.key).add(e))}Ue(e,n,r){if(!this.ze(e))return;const s=this.Ge(e);this.it(e,n)?s.Fe(n,1):s.Me(n),this.qe=this.qe.insert(n,this.st(n).delete(e)),r&&(this.ke=this.ke.insert(n,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const n=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let n=this.Be.get(e);return n||(n=new jd,this.Be.set(e,n)),n}st(e){let n=this.qe.get(e);return n||(n=new Ct(je),this.qe=this.qe.insert(e,n)),n}ze(e){const n=this.Je(e)!==null;return n||ie("WatchChangeAggregator","Detected inactive target",e),n}Je(e){const n=this.Be.get(e);return n&&n.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new jd),this.Le.getRemoteKeysForTarget(e).forEach(n=>{this.Ue(e,n,null)})}it(e,n){return this.Le.getRemoteKeysForTarget(e).has(n)}}function $d(){return new it(he.comparator)}function Bd(){return new it(he.comparator)}const LE=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),FE=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),UE=(()=>({and:"AND",or:"OR"}))();class jE{constructor(e,n){this.databaseId=e,this.useProto3Json=n}}function vu(t,e){return t.useProto3Json||Na(e)?e:{value:e}}function aa(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Um(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function $E(t,e){return aa(t,e.toTimestamp())}function Rn(t){return We(!!t),Ae.fromTimestamp(function(n){const r=Pr(n);return new yt(r.seconds,r.nanos)}(t))}function uc(t,e){return yu(t,e).canonicalString()}function yu(t,e){const n=function(s){return new et(["projects",s.projectId,"databases",s.database])}(t).child("documents");return e===void 0?n:n.child(e)}function jm(t){const e=et.fromString(t);return We(Hm(e)),e}function wu(t,e){return uc(t.databaseId,e.path)}function Ol(t,e){const n=jm(e);if(n.get(1)!==t.databaseId.projectId)throw new ne(F.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new ne(F.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new he(Bm(n))}function $m(t,e){return uc(t.databaseId,e)}function BE(t){const e=jm(t);return e.length===4?et.emptyPath():Bm(e)}function bu(t){return new et(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function Bm(t){return We(t.length>4&&t.get(4)==="documents"),t.popFirst(5)}function qd(t,e,n){return{name:wu(t,e),fields:n.value.mapValue.fields}}function qE(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:we()}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(h,d){return h.useProto3Json?(We(d===void 0||typeof d=="string"),xt.fromBase64String(d||"")):(We(d===void 0||d instanceof Buffer||d instanceof Uint8Array),xt.fromUint8Array(d||new Uint8Array))}(t,e.targetChange.resumeToken),o=e.targetChange.cause,l=o&&function(h){const d=h.code===void 0?F.UNKNOWN:Mm(h.code);return new ne(d,h.message||"")}(o);n=new Fm(r,s,i,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=Ol(t,r.document.name),i=Rn(r.document.updateTime),o=r.document.createTime?Rn(r.document.createTime):Ae.min(),l=new Zt({mapValue:{fields:r.document.fields}}),u=Ft.newFoundDocument(s,i,o,l),h=r.targetIds||[],d=r.removedTargetIds||[];n=new Bo(h,d,u.key,u)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=Ol(t,r.document),i=r.readTime?Rn(r.readTime):Ae.min(),o=Ft.newNoDocument(s,i),l=r.removedTargetIds||[];n=new Bo([],l,o.key,o)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=Ol(t,r.document),i=r.removedTargetIds||[];n=new Bo([],i,s,null)}else{if(!("filter"in e))return we();{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,o=new DE(s,i),l=r.targetId;n=new Lm(l,o)}}return n}function zE(t,e){let n;if(e instanceof Yi)n={update:qd(t,e.key,e.value)};else if(e instanceof Fa)n={delete:wu(t,e.key)};else if(e instanceof Nr)n={update:qd(t,e.key,e.data),updateMask:ZE(e.fieldMask)};else{if(!(e instanceof CE))return we();n={verify:wu(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(r=>function(i,o){const l=o.transform;if(l instanceof $i)return{fieldPath:o.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof Bi)return{fieldPath:o.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof qi)return{fieldPath:o.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof oa)return{fieldPath:o.field.canonicalString(),increment:l.Pe};throw we()}(0,r))),e.precondition.isNone||(n.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:$E(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:we()}(t,e.precondition)),n}function HE(t,e){return t&&t.length>0?(We(e!==void 0),t.map(n=>function(s,i){let o=s.updateTime?Rn(s.updateTime):Rn(i);return o.isEqual(Ae.min())&&(o=Rn(i)),new SE(o,s.transformResults||[])}(n,e))):[]}function KE(t,e){return{documents:[$m(t,e.path)]}}function WE(t,e){const n={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=$m(t,s);const i=function(h){if(h.length!==0)return zm(vn.create(h,"and"))}(e.filters);i&&(n.structuredQuery.where=i);const o=function(h){if(h.length!==0)return h.map(d=>function(g){return{field:gs(g.field),direction:JE(g.dir)}}(d))}(e.orderBy);o&&(n.structuredQuery.orderBy=o);const l=vu(t,e.limit);return l!==null&&(n.structuredQuery.limit=l),e.startAt&&(n.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{_t:n,parent:s}}function GE(t){let e=BE(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let s=null;if(r>0){We(r===1);const d=n.from[0];d.allDescendants?s=d.collectionId:e=e.child(d.collectionId)}let i=[];n.where&&(i=function(p){const g=qm(p);return g instanceof vn&&ym(g)?g.getFilters():[g]}(n.where));let o=[];n.orderBy&&(o=function(p){return p.map(g=>function(x){return new ji(_s(x.field),function(N){switch(N){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(x.direction))}(g))}(n.orderBy));let l=null;n.limit&&(l=function(p){let g;return g=typeof p=="object"?p.value:p,Na(g)?null:g}(n.limit));let u=null;n.startAt&&(u=function(p){const g=!!p.before,v=p.values||[];return new ia(v,g)}(n.startAt));let h=null;return n.endAt&&(h=function(p){const g=!p.before,v=p.values||[];return new ia(v,g)}(n.endAt)),dE(e,s,o,i,l,"F",u,h)}function QE(t,e){const n=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return we()}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function qm(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":const r=_s(n.unaryFilter.field);return pt.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=_s(n.unaryFilter.field);return pt.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=_s(n.unaryFilter.field);return pt.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const o=_s(n.unaryFilter.field);return pt.create(o,"!=",{nullValue:"NULL_VALUE"});default:return we()}}(t):t.fieldFilter!==void 0?function(n){return pt.create(_s(n.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return we()}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return vn.create(n.compositeFilter.filters.map(r=>qm(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return we()}}(n.compositeFilter.op))}(t):we()}function JE(t){return LE[t]}function YE(t){return FE[t]}function XE(t){return UE[t]}function gs(t){return{fieldPath:t.canonicalString()}}function _s(t){return Pt.fromServerFormat(t.fieldPath)}function zm(t){return t instanceof pt?function(n){if(n.op==="=="){if(Cd(n.value))return{unaryFilter:{field:gs(n.field),op:"IS_NAN"}};if(Pd(n.value))return{unaryFilter:{field:gs(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(Cd(n.value))return{unaryFilter:{field:gs(n.field),op:"IS_NOT_NAN"}};if(Pd(n.value))return{unaryFilter:{field:gs(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:gs(n.field),op:YE(n.op),value:n.value}}}(t):t instanceof vn?function(n){const r=n.getFilters().map(s=>zm(s));return r.length===1?r[0]:{compositeFilter:{op:XE(n.op),filters:r}}}(t):we()}function ZE(t){const e=[];return t.fields.forEach(n=>e.push(n.canonicalString())),{fieldPaths:e}}function Hm(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gr{constructor(e,n,r,s,i=Ae.min(),o=Ae.min(),l=xt.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=n,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=i,this.lastLimboFreeSnapshotVersion=o,this.resumeToken=l,this.expectedCount=u}withSequenceNumber(e){return new gr(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new gr(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new gr(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new gr(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eT{constructor(e){this.ct=e}}function tT(t){const e=GE({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?_u(e,e.limit,"L"):e}/**
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
 */class nT{constructor(){this.un=new rT}addToCollectionParentIndex(e,n){return this.un.add(n),K.resolve()}getCollectionParents(e,n){return K.resolve(this.un.getEntries(n))}addFieldIndex(e,n){return K.resolve()}deleteFieldIndex(e,n){return K.resolve()}deleteAllFieldIndexes(e){return K.resolve()}createTargetIndexes(e,n){return K.resolve()}getDocumentsMatchingTarget(e,n){return K.resolve(null)}getIndexType(e,n){return K.resolve(0)}getFieldIndexes(e,n){return K.resolve([])}getNextCollectionGroupToUpdate(e){return K.resolve(null)}getMinOffset(e,n){return K.resolve(Rr.min())}getMinOffsetFromCollectionGroup(e,n){return K.resolve(Rr.min())}updateCollectionGroup(e,n,r){return K.resolve()}updateIndexEntries(e,n){return K.resolve()}}class rT{constructor(){this.index={}}add(e){const n=e.lastSegment(),r=e.popLast(),s=this.index[n]||new Ct(et.comparator),i=!s.has(r);return this.index[n]=s.add(r),i}has(e){const n=e.lastSegment(),r=e.popLast(),s=this.index[n];return s&&s.has(r)}getEntries(e){return(this.index[e]||new Ct(et.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Us{constructor(e){this.Ln=e}next(){return this.Ln+=2,this.Ln}static Bn(){return new Us(0)}static kn(){return new Us(-1)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sT{constructor(){this.changes=new Hs(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,Ft.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();const r=this.changes.get(n);return r!==void 0?K.resolve(r):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class iT{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class oT{constructor(e,n,r,s){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,n){let r=null;return this.documentOverlayCache.getOverlay(e,n).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,n))).next(s=>(r!==null&&Ai(r.mutation,s,an.empty(),yt.now()),s))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.getLocalViewOfDocuments(e,r,De()).next(()=>r))}getLocalViewOfDocuments(e,n,r=De()){const s=zr();return this.populateOverlays(e,s,n).next(()=>this.computeViews(e,n,s,r).next(i=>{let o=ci();return i.forEach((l,u)=>{o=o.insert(l,u.overlayedDocument)}),o}))}getOverlayedDocuments(e,n){const r=zr();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,De()))}populateOverlays(e,n,r){const s=[];return r.forEach(i=>{n.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((o,l)=>{n.set(o,l)})})}computeViews(e,n,r,s){let i=Yn();const o=Ii(),l=function(){return Ii()}();return n.forEach((u,h)=>{const d=r.get(h.key);s.has(h.key)&&(d===void 0||d.mutation instanceof Nr)?i=i.insert(h.key,h):d!==void 0?(o.set(h.key,d.mutation.getFieldMask()),Ai(d.mutation,h,d.mutation.getFieldMask(),yt.now())):o.set(h.key,an.empty())}),this.recalculateAndSaveOverlays(e,i).next(u=>(u.forEach((h,d)=>o.set(h,d)),n.forEach((h,d)=>{var p;return l.set(h,new iT(d,(p=o.get(h))!==null&&p!==void 0?p:null))}),l))}recalculateAndSaveOverlays(e,n){const r=Ii();let s=new it((o,l)=>o-l),i=De();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(o=>{for(const l of o)l.keys().forEach(u=>{const h=n.get(u);if(h===null)return;let d=r.get(u)||an.empty();d=l.applyToLocalView(h,d),r.set(u,d);const p=(s.get(l.batchId)||De()).add(u);s=s.insert(l.batchId,p)})}).next(()=>{const o=[],l=s.getReverseIterator();for(;l.hasNext();){const u=l.getNext(),h=u.key,d=u.value,p=Pm();d.forEach(g=>{if(!i.has(g)){const v=Vm(n.get(g),r.get(g));v!==null&&p.set(g,v),i=i.add(g)}}),o.push(this.documentOverlayCache.saveOverlays(e,h,p))}return K.waitFor(o)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,n,r,s){return function(o){return he.isDocumentKey(o.path)&&o.collectionGroup===null&&o.filters.length===0}(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):Tm(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,r,s):this.getDocumentsMatchingCollectionQuery(e,n,r,s)}getNextDocuments(e,n,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,r,s).next(i=>{const o=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,r.largestBatchId,s-i.size):K.resolve(zr());let l=-1,u=i;return o.next(h=>K.forEach(h,(d,p)=>(l<p.largestBatchId&&(l=p.largestBatchId),i.get(d)?K.resolve():this.remoteDocumentCache.getEntry(e,d).next(g=>{u=u.insert(d,g)}))).next(()=>this.populateOverlays(e,h,i)).next(()=>this.computeViews(e,u,h,De())).next(d=>({batchId:l,changes:Rm(d)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new he(n)).next(r=>{let s=ci();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,n,r,s){const i=n.collectionGroup;let o=ci();return this.indexManager.getCollectionParents(e,i).next(l=>K.forEach(l,u=>{const h=function(p,g){return new zs(g,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(n,u.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,r,s).next(d=>{d.forEach((p,g)=>{o=o.insert(p,g)})})}).next(()=>o))}getDocumentsMatchingCollectionQuery(e,n,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,r.largestBatchId).next(o=>(i=o,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,r,i,s))).next(o=>{i.forEach((u,h)=>{const d=h.getKey();o.get(d)===null&&(o=o.insert(d,Ft.newInvalidDocument(d)))});let l=ci();return o.forEach((u,h)=>{const d=i.get(u);d!==void 0&&Ai(d.mutation,h,an.empty(),yt.now()),Oa(n,h)&&(l=l.insert(u,h))}),l})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class aT{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,n){return K.resolve(this.hr.get(n))}saveBundleMetadata(e,n){return this.hr.set(n.id,function(s){return{id:s.id,version:s.version,createTime:Rn(s.createTime)}}(n)),K.resolve()}getNamedQuery(e,n){return K.resolve(this.Pr.get(n))}saveNamedQuery(e,n){return this.Pr.set(n.name,function(s){return{name:s.name,query:tT(s.bundledQuery),readTime:Rn(s.readTime)}}(n)),K.resolve()}}/**
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
 */class lT{constructor(){this.overlays=new it(he.comparator),this.Ir=new Map}getOverlay(e,n){return K.resolve(this.overlays.get(n))}getOverlays(e,n){const r=zr();return K.forEach(n,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,n,r){return r.forEach((s,i)=>{this.ht(e,n,i)}),K.resolve()}removeOverlaysForBatchId(e,n,r){const s=this.Ir.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(r)),K.resolve()}getOverlaysForCollection(e,n,r){const s=zr(),i=n.length+1,o=new he(n.child("")),l=this.overlays.getIteratorFrom(o);for(;l.hasNext();){const u=l.getNext().value,h=u.getKey();if(!n.isPrefixOf(h.path))break;h.path.length===i&&u.largestBatchId>r&&s.set(u.getKey(),u)}return K.resolve(s)}getOverlaysForCollectionGroup(e,n,r,s){let i=new it((h,d)=>h-d);const o=this.overlays.getIterator();for(;o.hasNext();){const h=o.getNext().value;if(h.getKey().getCollectionGroup()===n&&h.largestBatchId>r){let d=i.get(h.largestBatchId);d===null&&(d=zr(),i=i.insert(h.largestBatchId,d)),d.set(h.getKey(),h)}}const l=zr(),u=i.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((h,d)=>l.set(h,d)),!(l.size()>=s)););return K.resolve(l)}ht(e,n,r){const s=this.overlays.get(r.key);if(s!==null){const o=this.Ir.get(s.largestBatchId).delete(r.key);this.Ir.set(s.largestBatchId,o)}this.overlays=this.overlays.insert(r.key,new kE(n,r));let i=this.Ir.get(n);i===void 0&&(i=De(),this.Ir.set(n,i)),this.Ir.set(n,i.add(r.key))}}/**
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
 */class uT{constructor(){this.sessionToken=xt.EMPTY_BYTE_STRING}getSessionToken(e){return K.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,K.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cc{constructor(){this.Tr=new Ct(bt.Er),this.dr=new Ct(bt.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,n){const r=new bt(e,n);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,n){e.forEach(r=>this.addReference(r,n))}removeReference(e,n){this.Vr(new bt(e,n))}mr(e,n){e.forEach(r=>this.removeReference(r,n))}gr(e){const n=new he(new et([])),r=new bt(n,e),s=new bt(n,e+1),i=[];return this.dr.forEachInRange([r,s],o=>{this.Vr(o),i.push(o.key)}),i}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const n=new he(new et([])),r=new bt(n,e),s=new bt(n,e+1);let i=De();return this.dr.forEachInRange([r,s],o=>{i=i.add(o.key)}),i}containsKey(e){const n=new bt(e,0),r=this.Tr.firstAfterOrEqual(n);return r!==null&&e.isEqual(r.key)}}class bt{constructor(e,n){this.key=e,this.wr=n}static Er(e,n){return he.comparator(e.key,n.key)||je(e.wr,n.wr)}static Ar(e,n){return je(e.wr,n.wr)||he.comparator(e.key,n.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class cT{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Sr=1,this.br=new Ct(bt.Er)}checkEmpty(e){return K.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,r,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const o=new xE(i,n,r,s);this.mutationQueue.push(o);for(const l of s)this.br=this.br.add(new bt(l.key,i)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return K.resolve(o)}lookupMutationBatch(e,n){return K.resolve(this.Dr(n))}getNextMutationBatchAfterBatchId(e,n){const r=n+1,s=this.vr(r),i=s<0?0:s;return K.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return K.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return K.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){const r=new bt(n,0),s=new bt(n,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([r,s],o=>{const l=this.Dr(o.wr);i.push(l)}),K.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,n){let r=new Ct(je);return n.forEach(s=>{const i=new bt(s,0),o=new bt(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,o],l=>{r=r.add(l.wr)})}),K.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,n){const r=n.path,s=r.length+1;let i=r;he.isDocumentKey(i)||(i=i.child(""));const o=new bt(new he(i),0);let l=new Ct(je);return this.br.forEachWhile(u=>{const h=u.key.path;return!!r.isPrefixOf(h)&&(h.length===s&&(l=l.add(u.wr)),!0)},o),K.resolve(this.Cr(l))}Cr(e){const n=[];return e.forEach(r=>{const s=this.Dr(r);s!==null&&n.push(s)}),n}removeMutationBatch(e,n){We(this.Fr(n.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return K.forEach(n.mutations,s=>{const i=new bt(s.key,n.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,n){const r=new bt(n,0),s=this.br.firstAfterOrEqual(r);return K.resolve(n.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,K.resolve()}Fr(e,n){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const n=this.vr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hT{constructor(e){this.Mr=e,this.docs=function(){return new it(he.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){const r=n.key,s=this.docs.get(r),i=s?s.size:0,o=this.Mr(n);return this.docs=this.docs.insert(r,{document:n.mutableCopy(),size:o}),this.size+=o-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){const r=this.docs.get(n);return K.resolve(r?r.document.mutableCopy():Ft.newInvalidDocument(n))}getEntries(e,n){let r=Yn();return n.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():Ft.newInvalidDocument(s))}),K.resolve(r)}getDocumentsMatchingQuery(e,n,r,s){let i=Yn();const o=n.path,l=new he(o.child("")),u=this.docs.getIteratorFrom(l);for(;u.hasNext();){const{key:h,value:{document:d}}=u.getNext();if(!o.isPrefixOf(h.path))break;h.path.length>o.length+1||Wb(Kb(d),r)<=0||(s.has(d.key)||Oa(n,d))&&(i=i.insert(d.key,d.mutableCopy()))}return K.resolve(i)}getAllFromCollectionGroup(e,n,r,s){we()}Or(e,n){return K.forEach(this.docs,r=>n(r))}newChangeBuffer(e){return new dT(this)}getSize(e){return K.resolve(this.size)}}class dT extends sT{constructor(e){super(),this.cr=e}applyChanges(e){const n=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?n.push(this.cr.addEntry(e,s)):this.cr.removeEntry(r)}),K.waitFor(n)}getFromCache(e,n){return this.cr.getEntry(e,n)}getAllFromCache(e,n){return this.cr.getEntries(e,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fT{constructor(e){this.persistence=e,this.Nr=new Hs(n=>rc(n),sc),this.lastRemoteSnapshotVersion=Ae.min(),this.highestTargetId=0,this.Lr=0,this.Br=new cc,this.targetCount=0,this.kr=Us.Bn()}forEachTarget(e,n){return this.Nr.forEach((r,s)=>n(s)),K.resolve()}getLastRemoteSnapshotVersion(e){return K.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return K.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),K.resolve(this.highestTargetId)}setTargetsMetadata(e,n,r){return r&&(this.lastRemoteSnapshotVersion=r),n>this.Lr&&(this.Lr=n),K.resolve()}Kn(e){this.Nr.set(e.target,e);const n=e.targetId;n>this.highestTargetId&&(this.kr=new Us(n),this.highestTargetId=n),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,n){return this.Kn(n),this.targetCount+=1,K.resolve()}updateTargetData(e,n){return this.Kn(n),K.resolve()}removeTargetData(e,n){return this.Nr.delete(n.target),this.Br.gr(n.targetId),this.targetCount-=1,K.resolve()}removeTargets(e,n,r){let s=0;const i=[];return this.Nr.forEach((o,l)=>{l.sequenceNumber<=n&&r.get(l.targetId)===null&&(this.Nr.delete(o),i.push(this.removeMatchingKeysForTargetId(e,l.targetId)),s++)}),K.waitFor(i).next(()=>s)}getTargetCount(e){return K.resolve(this.targetCount)}getTargetData(e,n){const r=this.Nr.get(n)||null;return K.resolve(r)}addMatchingKeys(e,n,r){return this.Br.Rr(n,r),K.resolve()}removeMatchingKeys(e,n,r){this.Br.mr(n,r);const s=this.persistence.referenceDelegate,i=[];return s&&n.forEach(o=>{i.push(s.markPotentiallyOrphaned(e,o))}),K.waitFor(i)}removeMatchingKeysForTargetId(e,n){return this.Br.gr(n),K.resolve()}getMatchingKeysForTargetId(e,n){const r=this.Br.yr(n);return K.resolve(r)}containsKey(e,n){return K.resolve(this.Br.containsKey(n))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pT{constructor(e,n){this.qr={},this.overlays={},this.Qr=new Zu(0),this.Kr=!1,this.Kr=!0,this.$r=new uT,this.referenceDelegate=e(this),this.Ur=new fT(this),this.indexManager=new nT,this.remoteDocumentCache=function(s){return new hT(s)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new eT(n),this.Gr=new aT(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new lT,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let r=this.qr[e.toKey()];return r||(r=new cT(n,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,n,r){ie("MemoryPersistence","Starting transaction:",e);const s=new mT(this.Qr.next());return this.referenceDelegate.zr(),r(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(e,n){return K.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,n)))}}class mT extends Qb{constructor(e){super(),this.currentSequenceNumber=e}}class hc{constructor(e){this.persistence=e,this.Jr=new cc,this.Yr=null}static Zr(e){return new hc(e)}get Xr(){if(this.Yr)return this.Yr;throw we()}addReference(e,n,r){return this.Jr.addReference(r,n),this.Xr.delete(r.toString()),K.resolve()}removeReference(e,n,r){return this.Jr.removeReference(r,n),this.Xr.add(r.toString()),K.resolve()}markPotentiallyOrphaned(e,n){return this.Xr.add(n.toString()),K.resolve()}removeTarget(e,n){this.Jr.gr(n.targetId).forEach(s=>this.Xr.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,n.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>r.removeTargetData(e,n))}zr(){this.Yr=new Set}jr(e){const n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return K.forEach(this.Xr,r=>{const s=he.fromPath(r);return this.ei(e,s).next(i=>{i||n.removeEntry(s,Ae.min())})}).next(()=>(this.Yr=null,n.apply(e)))}updateLimboDocument(e,n){return this.ei(e,n).next(r=>{r?this.Xr.delete(n.toString()):this.Xr.add(n.toString())})}Wr(e){return 0}ei(e,n){return K.or([()=>K.resolve(this.Jr.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Hr(e,n)])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dc{constructor(e,n,r,s){this.targetId=e,this.fromCache=n,this.$i=r,this.Ui=s}static Wi(e,n){let r=De(),s=De();for(const i of n.docChanges)switch(i.type){case 0:r=r.add(i.doc.key);break;case 1:s=s.add(i.doc.key)}return new dc(e,n.fromCache,r,s)}}/**
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
 */class gT{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class _T{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return _w()?8:Jb($t())>0?6:4}()}initialize(e,n){this.Ji=e,this.indexManager=n,this.Gi=!0}getDocumentsMatchingQuery(e,n,r,s){const i={result:null};return this.Yi(e,n).next(o=>{i.result=o}).next(()=>{if(!i.result)return this.Zi(e,n,s,r).next(o=>{i.result=o})}).next(()=>{if(i.result)return;const o=new gT;return this.Xi(e,n,o).next(l=>{if(i.result=l,this.zi)return this.es(e,n,o,l.size)})}).next(()=>i.result)}es(e,n,r,s){return r.documentReadCount<this.ji?(ai()<=Ne.DEBUG&&ie("QueryEngine","SDK will not create cache indexes for query:",ms(n),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),K.resolve()):(ai()<=Ne.DEBUG&&ie("QueryEngine","Query:",ms(n),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Hi*s?(ai()<=Ne.DEBUG&&ie("QueryEngine","The SDK decides to create cache indexes for query:",ms(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Sn(n))):K.resolve())}Yi(e,n){if(Nd(n))return K.resolve(null);let r=Sn(n);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(n.limit!==null&&s===1&&(n=_u(n,null,"F"),r=Sn(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const o=De(...i);return this.Ji.getDocuments(e,o).next(l=>this.indexManager.getMinOffset(e,r).next(u=>{const h=this.ts(n,l);return this.ns(n,h,o,u.readTime)?this.Yi(e,_u(n,null,"F")):this.rs(e,h,n,u)}))})))}Zi(e,n,r,s){return Nd(n)||s.isEqual(Ae.min())?K.resolve(null):this.Ji.getDocuments(e,r).next(i=>{const o=this.ts(n,i);return this.ns(n,o,r,s)?K.resolve(null):(ai()<=Ne.DEBUG&&ie("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),ms(n)),this.rs(e,o,n,Hb(s,-1)).next(l=>l))})}ts(e,n){let r=new Ct(Am(e));return n.forEach((s,i)=>{Oa(e,i)&&(r=r.add(i))}),r}ns(e,n,r,s){if(e.limit===null)return!1;if(r.size!==n.size)return!0;const i=e.limitType==="F"?n.last():n.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(e,n,r){return ai()<=Ne.DEBUG&&ie("QueryEngine","Using full collection scan to execute query:",ms(n)),this.Ji.getDocumentsMatchingQuery(e,n,Rr.min(),r)}rs(e,n,r,s){return this.Ji.getDocumentsMatchingQuery(e,r,s).next(i=>(n.forEach(o=>{i=i.insert(o.key,o)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vT{constructor(e,n,r,s){this.persistence=e,this.ss=n,this.serializer=s,this.os=new it(je),this._s=new Hs(i=>rc(i),sc),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new oT(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.os))}}function yT(t,e,n,r){return new vT(t,e,n,r)}async function Km(t,e){const n=Se(t);return await n.persistence.runTransaction("Handle user change","readonly",r=>{let s;return n.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,n.ls(e),n.mutationQueue.getAllMutationBatches(r))).next(i=>{const o=[],l=[];let u=De();for(const h of s){o.push(h.batchId);for(const d of h.mutations)u=u.add(d.key)}for(const h of i){l.push(h.batchId);for(const d of h.mutations)u=u.add(d.key)}return n.localDocuments.getDocuments(r,u).next(h=>({hs:h,removedBatchIds:o,addedBatchIds:l}))})})}function wT(t,e){const n=Se(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=n.cs.newChangeBuffer({trackRemovals:!0});return function(l,u,h,d){const p=h.batch,g=p.keys();let v=K.resolve();return g.forEach(x=>{v=v.next(()=>d.getEntry(u,x)).next(D=>{const N=h.docVersions.get(x);We(N!==null),D.version.compareTo(N)<0&&(p.applyToRemoteDocument(D,h),D.isValidDocument()&&(D.setReadTime(h.commitVersion),d.addEntry(D)))})}),v.next(()=>l.mutationQueue.removeMutationBatch(u,p))}(n,r,e,i).next(()=>i.apply(r)).next(()=>n.mutationQueue.performConsistencyCheck(r)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let u=De();for(let h=0;h<l.mutationResults.length;++h)l.mutationResults[h].transformResults.length>0&&(u=u.add(l.batch.mutations[h].key));return u}(e))).next(()=>n.localDocuments.getDocuments(r,s))})}function Wm(t){const e=Se(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.Ur.getLastRemoteSnapshotVersion(n))}function bT(t,e){const n=Se(t),r=e.snapshotVersion;let s=n.os;return n.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const o=n.cs.newChangeBuffer({trackRemovals:!0});s=n.os;const l=[];e.targetChanges.forEach((d,p)=>{const g=s.get(p);if(!g)return;l.push(n.Ur.removeMatchingKeys(i,d.removedDocuments,p).next(()=>n.Ur.addMatchingKeys(i,d.addedDocuments,p)));let v=g.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(p)!==null?v=v.withResumeToken(xt.EMPTY_BYTE_STRING,Ae.min()).withLastLimboFreeSnapshotVersion(Ae.min()):d.resumeToken.approximateByteSize()>0&&(v=v.withResumeToken(d.resumeToken,r)),s=s.insert(p,v),function(D,N,j){return D.resumeToken.approximateByteSize()===0||N.snapshotVersion.toMicroseconds()-D.snapshotVersion.toMicroseconds()>=3e8?!0:j.addedDocuments.size+j.modifiedDocuments.size+j.removedDocuments.size>0}(g,v,d)&&l.push(n.Ur.updateTargetData(i,v))});let u=Yn(),h=De();if(e.documentUpdates.forEach(d=>{e.resolvedLimboDocuments.has(d)&&l.push(n.persistence.referenceDelegate.updateLimboDocument(i,d))}),l.push(ET(i,o,e.documentUpdates).next(d=>{u=d.Ps,h=d.Is})),!r.isEqual(Ae.min())){const d=n.Ur.getLastRemoteSnapshotVersion(i).next(p=>n.Ur.setTargetsMetadata(i,i.currentSequenceNumber,r));l.push(d)}return K.waitFor(l).next(()=>o.apply(i)).next(()=>n.localDocuments.getLocalViewOfDocuments(i,u,h)).next(()=>u)}).then(i=>(n.os=s,i))}function ET(t,e,n){let r=De(),s=De();return n.forEach(i=>r=r.add(i)),e.getEntries(t,r).next(i=>{let o=Yn();return n.forEach((l,u)=>{const h=i.get(l);u.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(l)),u.isNoDocument()&&u.version.isEqual(Ae.min())?(e.removeEntry(l,u.readTime),o=o.insert(l,u)):!h.isValidDocument()||u.version.compareTo(h.version)>0||u.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(u),o=o.insert(l,u)):ie("LocalStore","Ignoring outdated watch update for ",l,". Current version:",h.version," Watch version:",u.version)}),{Ps:o,Is:s}})}function TT(t,e){const n=Se(t);return n.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),n.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function IT(t,e){const n=Se(t);return n.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return n.Ur.getTargetData(r,e).next(i=>i?(s=i,K.resolve(s)):n.Ur.allocateTargetId(r).next(o=>(s=new gr(e,o,"TargetPurposeListen",r.currentSequenceNumber),n.Ur.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=n.os.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(n.os=n.os.insert(r.targetId,r),n._s.set(e,r.targetId)),r})}async function Eu(t,e,n){const r=Se(t),s=r.os.get(e),i=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",i,o=>r.persistence.referenceDelegate.removeTarget(o,s))}catch(o){if(!Ji(o))throw o;ie("LocalStore",`Failed to update sequence numbers for target ${e}: ${o}`)}r.os=r.os.remove(e),r._s.delete(s.target)}function zd(t,e,n){const r=Se(t);let s=Ae.min(),i=De();return r.persistence.runTransaction("Execute query","readwrite",o=>function(u,h,d){const p=Se(u),g=p._s.get(d);return g!==void 0?K.resolve(p.os.get(g)):p.Ur.getTargetData(h,d)}(r,o,Sn(e)).next(l=>{if(l)return s=l.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(o,l.targetId).next(u=>{i=u})}).next(()=>r.ss.getDocumentsMatchingQuery(o,e,n?s:Ae.min(),n?i:De())).next(l=>(AT(r,pE(e),l),{documents:l,Ts:i})))}function AT(t,e,n){let r=t.us.get(e)||Ae.min();n.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),t.us.set(e,r)}class Hd{constructor(){this.activeTargetIds=wE()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class ST{constructor(){this.so=new Hd,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,r){}addLocalQueryTarget(e,n=!0){return n&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,n,r){this.oo[e]=n}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Hd,Promise.resolve()}handleUserChange(e,n,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class RT{_o(e){}shutdown(){}}/**
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
 */class Kd{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){ie("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){ie("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let xo=null;function Ml(){return xo===null?xo=function(){return 268435456+Math.round(2147483648*Math.random())}():xo++,"0x"+xo.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const PT={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class CT{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ot="WebChannelConnection";class xT extends class{constructor(n){this.databaseInfo=n,this.databaseId=n.databaseId;const r=n.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+n.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(n,r,s,i,o){const l=Ml(),u=this.xo(n,r.toUriEncodedString());ie("RestConnection",`Sending RPC '${n}' ${l}:`,u,s);const h={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(h,i,o),this.No(n,u,h,s).then(d=>(ie("RestConnection",`Received RPC '${n}' ${l}: `,d),d),d=>{throw Os("RestConnection",`RPC '${n}' ${l} failed with error: `,d,"url: ",u,"request:",s),d})}Lo(n,r,s,i,o,l){return this.Mo(n,r,s,i,o)}Oo(n,r,s){n["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+qs}(),n["Content-Type"]="text/plain",this.databaseInfo.appId&&(n["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((i,o)=>n[o]=i),s&&s.headers.forEach((i,o)=>n[o]=i)}xo(n,r){const s=PT[n];return`${this.Do}/v1/${r}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,n,r,s){const i=Ml();return new Promise((o,l)=>{const u=new am;u.setWithCredentials(!0),u.listenOnce(lm.COMPLETE,()=>{try{switch(u.getLastErrorCode()){case Uo.NO_ERROR:const d=u.getResponseJson();ie(Ot,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(d)),o(d);break;case Uo.TIMEOUT:ie(Ot,`RPC '${e}' ${i} timed out`),l(new ne(F.DEADLINE_EXCEEDED,"Request time out"));break;case Uo.HTTP_ERROR:const p=u.getStatus();if(ie(Ot,`RPC '${e}' ${i} failed with status:`,p,"response text:",u.getResponseText()),p>0){let g=u.getResponseJson();Array.isArray(g)&&(g=g[0]);const v=g==null?void 0:g.error;if(v&&v.status&&v.message){const x=function(N){const j=N.toLowerCase().replace(/_/g,"-");return Object.values(F).indexOf(j)>=0?j:F.UNKNOWN}(v.status);l(new ne(x,v.message))}else l(new ne(F.UNKNOWN,"Server responded with status "+u.getStatus()))}else l(new ne(F.UNAVAILABLE,"Connection failed."));break;default:we()}}finally{ie(Ot,`RPC '${e}' ${i} completed.`)}});const h=JSON.stringify(s);ie(Ot,`RPC '${e}' ${i} sending request:`,s),u.send(n,"POST",h,r,15)})}Bo(e,n,r){const s=Ml(),i=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],o=hm(),l=cm(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(u.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Oo(u.initMessageHeaders,n,r),u.encodeInitMessageHeaders=!0;const d=i.join("");ie(Ot,`Creating RPC '${e}' stream ${s}: ${d}`,u);const p=o.createWebChannel(d,u);let g=!1,v=!1;const x=new CT({Io:N=>{v?ie(Ot,`Not sending because RPC '${e}' stream ${s} is closed:`,N):(g||(ie(Ot,`Opening RPC '${e}' stream ${s} transport.`),p.open(),g=!0),ie(Ot,`RPC '${e}' stream ${s} sending:`,N),p.send(N))},To:()=>p.close()}),D=(N,j,B)=>{N.listen(j,W=>{try{B(W)}catch(G){setTimeout(()=>{throw G},0)}})};return D(p,ui.EventType.OPEN,()=>{v||(ie(Ot,`RPC '${e}' stream ${s} transport opened.`),x.yo())}),D(p,ui.EventType.CLOSE,()=>{v||(v=!0,ie(Ot,`RPC '${e}' stream ${s} transport closed`),x.So())}),D(p,ui.EventType.ERROR,N=>{v||(v=!0,Os(Ot,`RPC '${e}' stream ${s} transport errored:`,N),x.So(new ne(F.UNAVAILABLE,"The operation could not be completed")))}),D(p,ui.EventType.MESSAGE,N=>{var j;if(!v){const B=N.data[0];We(!!B);const W=B,G=W.error||((j=W[0])===null||j===void 0?void 0:j.error);if(G){ie(Ot,`RPC '${e}' stream ${s} received error:`,G);const fe=G.status;let oe=function(I){const S=ft[I];if(S!==void 0)return Mm(S)}(fe),P=G.message;oe===void 0&&(oe=F.INTERNAL,P="Unknown error status: "+fe+" with message "+G.message),v=!0,x.So(new ne(oe,P)),p.close()}else ie(Ot,`RPC '${e}' stream ${s} received:`,B),x.bo(B)}}),D(l,um.STAT_EVENT,N=>{N.stat===hu.PROXY?ie(Ot,`RPC '${e}' stream ${s} detected buffering proxy`):N.stat===hu.NOPROXY&&ie(Ot,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{x.wo()},0),x}}function Ll(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ja(t){return new jE(t,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gm{constructor(e,n,r=1e3,s=1.5,i=6e4){this.ui=e,this.timerId=n,this.ko=r,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const n=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),s=Math.max(0,n-r);s>0&&ie("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qm{constructor(e,n,r,s,i,o,l,u){this.ui=e,this.Ho=r,this.Jo=s,this.connection=i,this.authCredentialsProvider=o,this.appCheckCredentialsProvider=l,this.listener=u,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new Gm(e,n)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,n){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():n&&n.code===F.RESOURCE_EXHAUSTED?(Jn(n.toString()),Jn("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):n&&n.code===F.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(n)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),n=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.Yo===n&&this.P_(r,s)},r=>{e(()=>{const s=new ne(F.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(s)})})}P_(e,n){const r=this.h_(this.Yo);this.stream=this.T_(e,n),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{r(()=>this.I_(s))}),this.stream.onMessage(s=>{r(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return ie("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return n=>{this.ui.enqueueAndForget(()=>this.Yo===e?n():(ie("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class kT extends Qm{constructor(e,n,r,s,i,o){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,r,s,o),this.serializer=i}T_(e,n){return this.connection.Bo("Listen",e,n)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const n=qE(this.serializer,e),r=function(i){if(!("targetChange"in i))return Ae.min();const o=i.targetChange;return o.targetIds&&o.targetIds.length?Ae.min():o.readTime?Rn(o.readTime):Ae.min()}(e);return this.listener.d_(n,r)}A_(e){const n={};n.database=bu(this.serializer),n.addTarget=function(i,o){let l;const u=o.target;if(l=mu(u)?{documents:KE(i,u)}:{query:WE(i,u)._t},l.targetId=o.targetId,o.resumeToken.approximateByteSize()>0){l.resumeToken=Um(i,o.resumeToken);const h=vu(i,o.expectedCount);h!==null&&(l.expectedCount=h)}else if(o.snapshotVersion.compareTo(Ae.min())>0){l.readTime=aa(i,o.snapshotVersion.toTimestamp());const h=vu(i,o.expectedCount);h!==null&&(l.expectedCount=h)}return l}(this.serializer,e);const r=QE(this.serializer,e);r&&(n.labels=r),this.a_(n)}R_(e){const n={};n.database=bu(this.serializer),n.removeTarget=e,this.a_(n)}}class DT extends Qm{constructor(e,n,r,s,i,o){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",n,r,s,o),this.serializer=i}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,n){return this.connection.Bo("Write",e,n)}E_(e){return We(!!e.streamToken),this.lastStreamToken=e.streamToken,We(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){We(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const n=HE(e.writeResults,e.commitTime),r=Rn(e.commitTime);return this.listener.g_(r,n)}p_(){const e={};e.database=bu(this.serializer),this.a_(e)}m_(e){const n={streamToken:this.lastStreamToken,writes:e.map(r=>zE(this.serializer,r))};this.a_(n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class NT extends class{}{constructor(e,n,r,s){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=r,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new ne(F.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,n,r,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,o])=>this.connection.Mo(e,yu(n,r),s,i,o)).catch(i=>{throw i.name==="FirebaseError"?(i.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new ne(F.UNKNOWN,i.toString())})}Lo(e,n,r,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,l])=>this.connection.Lo(e,yu(n,r),s,o,l,i)).catch(o=>{throw o.name==="FirebaseError"?(o.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new ne(F.UNKNOWN,o.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class VT{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(Jn(n),this.D_=!1):ie("OnlineStateTracker",n)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class OT{constructor(e,n,r,s,i){this.localStore=e,this.datastore=n,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(o=>{r.enqueueAndForget(async()=>{ts(this)&&(ie("RemoteStore","Restarting streams for network reachability change."),await async function(u){const h=Se(u);h.L_.add(4),await Zi(h),h.q_.set("Unknown"),h.L_.delete(4),await $a(h)}(this))})}),this.q_=new VT(r,s)}}async function $a(t){if(ts(t))for(const e of t.B_)await e(!0)}async function Zi(t){for(const e of t.B_)await e(!1)}function Jm(t,e){const n=Se(t);n.N_.has(e.targetId)||(n.N_.set(e.targetId,e),gc(n)?mc(n):Ks(n).r_()&&pc(n,e))}function fc(t,e){const n=Se(t),r=Ks(n);n.N_.delete(e),r.r_()&&Ym(n,e),n.N_.size===0&&(r.r_()?r.o_():ts(n)&&n.q_.set("Unknown"))}function pc(t,e){if(t.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(Ae.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}Ks(t).A_(e)}function Ym(t,e){t.Q_.xe(e),Ks(t).R_(e)}function mc(t){t.Q_=new ME({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>t.N_.get(e)||null,tt:()=>t.datastore.serializer.databaseId}),Ks(t).start(),t.q_.v_()}function gc(t){return ts(t)&&!Ks(t).n_()&&t.N_.size>0}function ts(t){return Se(t).L_.size===0}function Xm(t){t.Q_=void 0}async function MT(t){t.q_.set("Online")}async function LT(t){t.N_.forEach((e,n)=>{pc(t,e)})}async function FT(t,e){Xm(t),gc(t)?(t.q_.M_(e),mc(t)):t.q_.set("Unknown")}async function UT(t,e,n){if(t.q_.set("Online"),e instanceof Fm&&e.state===2&&e.cause)try{await async function(s,i){const o=i.cause;for(const l of i.targetIds)s.N_.has(l)&&(await s.remoteSyncer.rejectListen(l,o),s.N_.delete(l),s.Q_.removeTarget(l))}(t,e)}catch(r){ie("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await la(t,r)}else if(e instanceof Bo?t.Q_.Ke(e):e instanceof Lm?t.Q_.He(e):t.Q_.We(e),!n.isEqual(Ae.min()))try{const r=await Wm(t.localStore);n.compareTo(r)>=0&&await function(i,o){const l=i.Q_.rt(o);return l.targetChanges.forEach((u,h)=>{if(u.resumeToken.approximateByteSize()>0){const d=i.N_.get(h);d&&i.N_.set(h,d.withResumeToken(u.resumeToken,o))}}),l.targetMismatches.forEach((u,h)=>{const d=i.N_.get(u);if(!d)return;i.N_.set(u,d.withResumeToken(xt.EMPTY_BYTE_STRING,d.snapshotVersion)),Ym(i,u);const p=new gr(d.target,u,h,d.sequenceNumber);pc(i,p)}),i.remoteSyncer.applyRemoteEvent(l)}(t,n)}catch(r){ie("RemoteStore","Failed to raise snapshot:",r),await la(t,r)}}async function la(t,e,n){if(!Ji(e))throw e;t.L_.add(1),await Zi(t),t.q_.set("Offline"),n||(n=()=>Wm(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{ie("RemoteStore","Retrying IndexedDB access"),await n(),t.L_.delete(1),await $a(t)})}function Zm(t,e){return e().catch(n=>la(t,n,e))}async function Ba(t){const e=Se(t),n=Cr(e);let r=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;jT(e);)try{const s=await TT(e.localStore,r);if(s===null){e.O_.length===0&&n.o_();break}r=s.batchId,$T(e,s)}catch(s){await la(e,s)}eg(e)&&tg(e)}function jT(t){return ts(t)&&t.O_.length<10}function $T(t,e){t.O_.push(e);const n=Cr(t);n.r_()&&n.V_&&n.m_(e.mutations)}function eg(t){return ts(t)&&!Cr(t).n_()&&t.O_.length>0}function tg(t){Cr(t).start()}async function BT(t){Cr(t).p_()}async function qT(t){const e=Cr(t);for(const n of t.O_)e.m_(n.mutations)}async function zT(t,e,n){const r=t.O_.shift(),s=ac.from(r,e,n);await Zm(t,()=>t.remoteSyncer.applySuccessfulWrite(s)),await Ba(t)}async function HT(t,e){e&&Cr(t).V_&&await async function(r,s){if(function(o){return NE(o)&&o!==F.ABORTED}(s.code)){const i=r.O_.shift();Cr(r).s_(),await Zm(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await Ba(r)}}(t,e),eg(t)&&tg(t)}async function Wd(t,e){const n=Se(t);n.asyncQueue.verifyOperationInProgress(),ie("RemoteStore","RemoteStore received new credentials");const r=ts(n);n.L_.add(3),await Zi(n),r&&n.q_.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.L_.delete(3),await $a(n)}async function KT(t,e){const n=Se(t);e?(n.L_.delete(2),await $a(n)):e||(n.L_.add(2),await Zi(n),n.q_.set("Unknown"))}function Ks(t){return t.K_||(t.K_=function(n,r,s){const i=Se(n);return i.w_(),new kT(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(t.datastore,t.asyncQueue,{Eo:MT.bind(null,t),Ro:LT.bind(null,t),mo:FT.bind(null,t),d_:UT.bind(null,t)}),t.B_.push(async e=>{e?(t.K_.s_(),gc(t)?mc(t):t.q_.set("Unknown")):(await t.K_.stop(),Xm(t))})),t.K_}function Cr(t){return t.U_||(t.U_=function(n,r,s){const i=Se(n);return i.w_(),new DT(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(t.datastore,t.asyncQueue,{Eo:()=>Promise.resolve(),Ro:BT.bind(null,t),mo:HT.bind(null,t),f_:qT.bind(null,t),g_:zT.bind(null,t)}),t.B_.push(async e=>{e?(t.U_.s_(),await Ba(t)):(await t.U_.stop(),t.O_.length>0&&(ie("RemoteStore",`Stopping write stream with ${t.O_.length} pending writes`),t.O_=[]))})),t.U_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _c{constructor(e,n,r,s,i){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Kn,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(o=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,s,i){const o=Date.now()+r,l=new _c(e,n,o,s,i);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new ne(F.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function vc(t,e){if(Jn("AsyncQueue",`${e}: ${t}`),Ji(t))return new ne(F.UNAVAILABLE,`${e}: ${t}`);throw t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ss{constructor(e){this.comparator=e?(n,r)=>e(n,r)||he.comparator(n.key,r.key):(n,r)=>he.comparator(n.key,r.key),this.keyedMap=ci(),this.sortedSet=new it(this.comparator)}static emptySet(e){return new Ss(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,r)=>(e(n),!1))}add(e){const n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){const n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof Ss)||this.size!==e.size)return!1;const n=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;n.hasNext();){const s=n.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){const r=new Ss;return r.comparator=this.comparator,r.keyedMap=e,r.sortedSet=n,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gd{constructor(){this.W_=new it(he.comparator)}track(e){const n=e.doc.key,r=this.W_.get(n);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(n,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(n,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(n,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(n,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(n):e.type===1&&r.type===2?this.W_=this.W_.insert(n,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(n,{type:2,doc:e.doc}):we():this.W_=this.W_.insert(n,e)}G_(){const e=[];return this.W_.inorderTraversal((n,r)=>{e.push(r)}),e}}class js{constructor(e,n,r,s,i,o,l,u,h){this.query=e,this.docs=n,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=o,this.syncStateChanged=l,this.excludesMetadataChanges=u,this.hasCachedResults=h}static fromInitialDocuments(e,n,r,s,i){const o=[];return n.forEach(l=>{o.push({type:0,doc:l})}),new js(e,n,Ss.emptySet(n),o,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Va(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const n=this.docChanges,r=e.docChanges;if(n.length!==r.length)return!1;for(let s=0;s<n.length;s++)if(n[s].type!==r[s].type||!n[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class WT{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class GT{constructor(){this.queries=Qd(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(n,r){const s=Se(n),i=s.queries;s.queries=Qd(),i.forEach((o,l)=>{for(const u of l.j_)u.onError(r)})})(this,new ne(F.ABORTED,"Firestore shutting down"))}}function Qd(){return new Hs(t=>Im(t),Va)}async function ng(t,e){const n=Se(t);let r=3;const s=e.query;let i=n.queries.get(s);i?!i.H_()&&e.J_()&&(r=2):(i=new WT,r=e.J_()?0:1);try{switch(r){case 0:i.z_=await n.onListen(s,!0);break;case 1:i.z_=await n.onListen(s,!1);break;case 2:await n.onFirstRemoteStoreListen(s)}}catch(o){const l=vc(o,`Initialization of query '${ms(e.query)}' failed`);return void e.onError(l)}n.queries.set(s,i),i.j_.push(e),e.Z_(n.onlineState),i.z_&&e.X_(i.z_)&&yc(n)}async function rg(t,e){const n=Se(t),r=e.query;let s=3;const i=n.queries.get(r);if(i){const o=i.j_.indexOf(e);o>=0&&(i.j_.splice(o,1),i.j_.length===0?s=e.J_()?0:1:!i.H_()&&e.J_()&&(s=2))}switch(s){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function QT(t,e){const n=Se(t);let r=!1;for(const s of e){const i=s.query,o=n.queries.get(i);if(o){for(const l of o.j_)l.X_(s)&&(r=!0);o.z_=s}}r&&yc(n)}function JT(t,e,n){const r=Se(t),s=r.queries.get(e);if(s)for(const i of s.j_)i.onError(n);r.queries.delete(e)}function yc(t){t.Y_.forEach(e=>{e.next()})}var Tu,Jd;(Jd=Tu||(Tu={})).ea="default",Jd.Cache="cache";class sg{constructor(e,n,r){this.query=e,this.ta=n,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new js(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.na?this.ia(e)&&(this.ta.next(e),n=!0):this.sa(e,this.onlineState)&&(this.oa(e),n=!0),this.ra=e,n}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let n=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),n=!0),n}sa(e,n){if(!e.fromCache||!this.J_())return!0;const r=n!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const n=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}oa(e){e=js.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==Tu.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ig{constructor(e){this.key=e}}class og{constructor(e){this.key=e}}class YT{constructor(e,n){this.query=e,this.Ta=n,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=De(),this.mutatedKeys=De(),this.Aa=Am(e),this.Ra=new Ss(this.Aa)}get Va(){return this.Ta}ma(e,n){const r=n?n.fa:new Gd,s=n?n.Ra:this.Ra;let i=n?n.mutatedKeys:this.mutatedKeys,o=s,l=!1;const u=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,h=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((d,p)=>{const g=s.get(d),v=Oa(this.query,p)?p:null,x=!!g&&this.mutatedKeys.has(g.key),D=!!v&&(v.hasLocalMutations||this.mutatedKeys.has(v.key)&&v.hasCommittedMutations);let N=!1;g&&v?g.data.isEqual(v.data)?x!==D&&(r.track({type:3,doc:v}),N=!0):this.ga(g,v)||(r.track({type:2,doc:v}),N=!0,(u&&this.Aa(v,u)>0||h&&this.Aa(v,h)<0)&&(l=!0)):!g&&v?(r.track({type:0,doc:v}),N=!0):g&&!v&&(r.track({type:1,doc:g}),N=!0,(u||h)&&(l=!0)),N&&(v?(o=o.add(v),i=D?i.add(d):i.delete(d)):(o=o.delete(d),i=i.delete(d)))}),this.query.limit!==null)for(;o.size>this.query.limit;){const d=this.query.limitType==="F"?o.last():o.first();o=o.delete(d.key),i=i.delete(d.key),r.track({type:1,doc:d})}return{Ra:o,fa:r,ns:l,mutatedKeys:i}}ga(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,r,s){const i=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const o=e.fa.G_();o.sort((d,p)=>function(v,x){const D=N=>{switch(N){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return we()}};return D(v)-D(x)}(d.type,p.type)||this.Aa(d.doc,p.doc)),this.pa(r),s=s!=null&&s;const l=n&&!s?this.ya():[],u=this.da.size===0&&this.current&&!s?1:0,h=u!==this.Ea;return this.Ea=u,o.length!==0||h?{snapshot:new js(this.query,e.Ra,i,o,e.mutatedKeys,u===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:l}:{wa:l}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Gd,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(n=>this.Ta=this.Ta.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Ta=this.Ta.delete(n)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=De(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const n=[];return e.forEach(r=>{this.da.has(r)||n.push(new og(r))}),this.da.forEach(r=>{e.has(r)||n.push(new ig(r))}),n}ba(e){this.Ta=e.Ts,this.da=De();const n=this.ma(e.documents);return this.applyChanges(n,!0)}Da(){return js.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class XT{constructor(e,n,r){this.query=e,this.targetId=n,this.view=r}}class ZT{constructor(e){this.key=e,this.va=!1}}class eI{constructor(e,n,r,s,i,o){this.localStore=e,this.remoteStore=n,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=o,this.Ca={},this.Fa=new Hs(l=>Im(l),Va),this.Ma=new Map,this.xa=new Set,this.Oa=new it(he.comparator),this.Na=new Map,this.La=new cc,this.Ba={},this.ka=new Map,this.qa=Us.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function tI(t,e,n=!0){const r=dg(t);let s;const i=r.Fa.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await ag(r,e,n,!0),s}async function nI(t,e){const n=dg(t);await ag(n,e,!0,!1)}async function ag(t,e,n,r){const s=await IT(t.localStore,Sn(e)),i=s.targetId,o=t.sharedClientState.addLocalQueryTarget(i,n);let l;return r&&(l=await rI(t,e,i,o==="current",s.resumeToken)),t.isPrimaryClient&&n&&Jm(t.remoteStore,s),l}async function rI(t,e,n,r,s){t.Ka=(p,g,v)=>async function(D,N,j,B){let W=N.view.ma(j);W.ns&&(W=await zd(D.localStore,N.query,!1).then(({documents:P})=>N.view.ma(P,W)));const G=B&&B.targetChanges.get(N.targetId),fe=B&&B.targetMismatches.get(N.targetId)!=null,oe=N.view.applyChanges(W,D.isPrimaryClient,G,fe);return Xd(D,N.targetId,oe.wa),oe.snapshot}(t,p,g,v);const i=await zd(t.localStore,e,!0),o=new YT(e,i.Ts),l=o.ma(i.documents),u=Xi.createSynthesizedTargetChangeForCurrentChange(n,r&&t.onlineState!=="Offline",s),h=o.applyChanges(l,t.isPrimaryClient,u);Xd(t,n,h.wa);const d=new XT(e,n,o);return t.Fa.set(e,d),t.Ma.has(n)?t.Ma.get(n).push(e):t.Ma.set(n,[e]),h.snapshot}async function sI(t,e,n){const r=Se(t),s=r.Fa.get(e),i=r.Ma.get(s.targetId);if(i.length>1)return r.Ma.set(s.targetId,i.filter(o=>!Va(o,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await Eu(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),n&&fc(r.remoteStore,s.targetId),Iu(r,s.targetId)}).catch(Qi)):(Iu(r,s.targetId),await Eu(r.localStore,s.targetId,!0))}async function iI(t,e){const n=Se(t),r=n.Fa.get(e),s=n.Ma.get(r.targetId);n.isPrimaryClient&&s.length===1&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),fc(n.remoteStore,r.targetId))}async function oI(t,e,n){const r=fI(t);try{const s=await function(o,l){const u=Se(o),h=yt.now(),d=l.reduce((v,x)=>v.add(x.key),De());let p,g;return u.persistence.runTransaction("Locally write mutations","readwrite",v=>{let x=Yn(),D=De();return u.cs.getEntries(v,d).next(N=>{x=N,x.forEach((j,B)=>{B.isValidDocument()||(D=D.add(j))})}).next(()=>u.localDocuments.getOverlayedDocuments(v,x)).next(N=>{p=N;const j=[];for(const B of l){const W=PE(B,p.get(B.key).overlayedDocument);W!=null&&j.push(new Nr(B.key,W,gm(W.value.mapValue),en.exists(!0)))}return u.mutationQueue.addMutationBatch(v,h,j,l)}).next(N=>{g=N;const j=N.applyToLocalDocumentSet(p,D);return u.documentOverlayCache.saveOverlays(v,N.batchId,j)})}).then(()=>({batchId:g.batchId,changes:Rm(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(o,l,u){let h=o.Ba[o.currentUser.toKey()];h||(h=new it(je)),h=h.insert(l,u),o.Ba[o.currentUser.toKey()]=h}(r,s.batchId,n),await eo(r,s.changes),await Ba(r.remoteStore)}catch(s){const i=vc(s,"Failed to persist write");n.reject(i)}}async function lg(t,e){const n=Se(t);try{const r=await bT(n.localStore,e);e.targetChanges.forEach((s,i)=>{const o=n.Na.get(i);o&&(We(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?o.va=!0:s.modifiedDocuments.size>0?We(o.va):s.removedDocuments.size>0&&(We(o.va),o.va=!1))}),await eo(n,r,e)}catch(r){await Qi(r)}}function Yd(t,e,n){const r=Se(t);if(r.isPrimaryClient&&n===0||!r.isPrimaryClient&&n===1){const s=[];r.Fa.forEach((i,o)=>{const l=o.view.Z_(e);l.snapshot&&s.push(l.snapshot)}),function(o,l){const u=Se(o);u.onlineState=l;let h=!1;u.queries.forEach((d,p)=>{for(const g of p.j_)g.Z_(l)&&(h=!0)}),h&&yc(u)}(r.eventManager,e),s.length&&r.Ca.d_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function aI(t,e,n){const r=Se(t);r.sharedClientState.updateQueryState(e,"rejected",n);const s=r.Na.get(e),i=s&&s.key;if(i){let o=new it(he.comparator);o=o.insert(i,Ft.newNoDocument(i,Ae.min()));const l=De().add(i),u=new Ua(Ae.min(),new Map,new it(je),o,l);await lg(r,u),r.Oa=r.Oa.remove(i),r.Na.delete(e),wc(r)}else await Eu(r.localStore,e,!1).then(()=>Iu(r,e,n)).catch(Qi)}async function lI(t,e){const n=Se(t),r=e.batch.batchId;try{const s=await wT(n.localStore,e);cg(n,r,null),ug(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await eo(n,s)}catch(s){await Qi(s)}}async function uI(t,e,n){const r=Se(t);try{const s=await function(o,l){const u=Se(o);return u.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let d;return u.mutationQueue.lookupMutationBatch(h,l).next(p=>(We(p!==null),d=p.keys(),u.mutationQueue.removeMutationBatch(h,p))).next(()=>u.mutationQueue.performConsistencyCheck(h)).next(()=>u.documentOverlayCache.removeOverlaysForBatchId(h,d,l)).next(()=>u.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,d)).next(()=>u.localDocuments.getDocuments(h,d))})}(r.localStore,e);cg(r,e,n),ug(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await eo(r,s)}catch(s){await Qi(s)}}function ug(t,e){(t.ka.get(e)||[]).forEach(n=>{n.resolve()}),t.ka.delete(e)}function cg(t,e,n){const r=Se(t);let s=r.Ba[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(n?i.reject(n):i.resolve(),s=s.remove(e)),r.Ba[r.currentUser.toKey()]=s}}function Iu(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Ma.get(e))t.Fa.delete(r),n&&t.Ca.$a(r,n);t.Ma.delete(e),t.isPrimaryClient&&t.La.gr(e).forEach(r=>{t.La.containsKey(r)||hg(t,r)})}function hg(t,e){t.xa.delete(e.path.canonicalString());const n=t.Oa.get(e);n!==null&&(fc(t.remoteStore,n),t.Oa=t.Oa.remove(e),t.Na.delete(n),wc(t))}function Xd(t,e,n){for(const r of n)r instanceof ig?(t.La.addReference(r.key,e),cI(t,r)):r instanceof og?(ie("SyncEngine","Document no longer in limbo: "+r.key),t.La.removeReference(r.key,e),t.La.containsKey(r.key)||hg(t,r.key)):we()}function cI(t,e){const n=e.key,r=n.path.canonicalString();t.Oa.get(n)||t.xa.has(r)||(ie("SyncEngine","New document in limbo: "+n),t.xa.add(r),wc(t))}function wc(t){for(;t.xa.size>0&&t.Oa.size<t.maxConcurrentLimboResolutions;){const e=t.xa.values().next().value;t.xa.delete(e);const n=new he(et.fromString(e)),r=t.qa.next();t.Na.set(r,new ZT(n)),t.Oa=t.Oa.insert(n,r),Jm(t.remoteStore,new gr(Sn(ic(n.path)),r,"TargetPurposeLimboResolution",Zu.oe))}}async function eo(t,e,n){const r=Se(t),s=[],i=[],o=[];r.Fa.isEmpty()||(r.Fa.forEach((l,u)=>{o.push(r.Ka(u,e,n).then(h=>{var d;if((h||n)&&r.isPrimaryClient){const p=h?!h.fromCache:(d=n==null?void 0:n.targetChanges.get(u.targetId))===null||d===void 0?void 0:d.current;r.sharedClientState.updateQueryState(u.targetId,p?"current":"not-current")}if(h){s.push(h);const p=dc.Wi(u.targetId,h);i.push(p)}}))}),await Promise.all(o),r.Ca.d_(s),await async function(u,h){const d=Se(u);try{await d.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>K.forEach(h,g=>K.forEach(g.$i,v=>d.persistence.referenceDelegate.addReference(p,g.targetId,v)).next(()=>K.forEach(g.Ui,v=>d.persistence.referenceDelegate.removeReference(p,g.targetId,v)))))}catch(p){if(!Ji(p))throw p;ie("LocalStore","Failed to update sequence numbers: "+p)}for(const p of h){const g=p.targetId;if(!p.fromCache){const v=d.os.get(g),x=v.snapshotVersion,D=v.withLastLimboFreeSnapshotVersion(x);d.os=d.os.insert(g,D)}}}(r.localStore,i))}async function hI(t,e){const n=Se(t);if(!n.currentUser.isEqual(e)){ie("SyncEngine","User change. New user:",e.toKey());const r=await Km(n.localStore,e);n.currentUser=e,function(i,o){i.ka.forEach(l=>{l.forEach(u=>{u.reject(new ne(F.CANCELLED,o))})}),i.ka.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await eo(n,r.hs)}}function dI(t,e){const n=Se(t),r=n.Na.get(e);if(r&&r.va)return De().add(r.key);{let s=De();const i=n.Ma.get(e);if(!i)return s;for(const o of i){const l=n.Fa.get(o);s=s.unionWith(l.view.Va)}return s}}function dg(t){const e=Se(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=lg.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=dI.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=aI.bind(null,e),e.Ca.d_=QT.bind(null,e.eventManager),e.Ca.$a=JT.bind(null,e.eventManager),e}function fI(t){const e=Se(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=lI.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=uI.bind(null,e),e}class ua{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=ja(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,n){return null}Ha(e,n){return null}za(e){return yT(this.persistence,new _T,e.initialUser,this.serializer)}Ga(e){return new pT(hc.Zr,this.serializer)}Wa(e){return new ST}async terminate(){var e,n;(e=this.gcScheduler)===null||e===void 0||e.stop(),(n=this.indexBackfillerScheduler)===null||n===void 0||n.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}ua.provider={build:()=>new ua};class Au{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Yd(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=hI.bind(null,this.syncEngine),await KT(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new GT}()}createDatastore(e){const n=ja(e.databaseInfo.databaseId),r=function(i){return new xT(i)}(e.databaseInfo);return function(i,o,l,u){return new NT(i,o,l,u)}(e.authCredentials,e.appCheckCredentials,r,n)}createRemoteStore(e){return function(r,s,i,o,l){return new OT(r,s,i,o,l)}(this.localStore,this.datastore,e.asyncQueue,n=>Yd(this.syncEngine,n,0),function(){return Kd.D()?new Kd:new RT}())}createSyncEngine(e,n){return function(s,i,o,l,u,h,d){const p=new eI(s,i,o,l,u,h);return d&&(p.Qa=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){var e,n;await async function(s){const i=Se(s);ie("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await Zi(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(n=this.eventManager)===null||n===void 0||n.terminate()}}Au.provider={build:()=>new Au};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class fg{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):Jn("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,n){setTimeout(()=>{this.muted||e(n)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pI{constructor(e,n,r,s,i){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=r,this.databaseInfo=s,this.user=Mt.UNAUTHENTICATED,this.clientId=fm.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async o=>{ie("FirestoreClient","Received user=",o.uid),await this.authCredentialListener(o),this.user=o}),this.appCheckCredentials.start(r,o=>(ie("FirestoreClient","Received new app check token=",o),this.appCheckCredentialListener(o,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Kn;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){const r=vc(n,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function Fl(t,e){t.asyncQueue.verifyOperationInProgress(),ie("FirestoreClient","Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async s=>{r.isEqual(s)||(await Km(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function Zd(t,e){t.asyncQueue.verifyOperationInProgress();const n=await mI(t);ie("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(r=>Wd(e.remoteStore,r)),t.setAppCheckTokenChangeListener((r,s)=>Wd(e.remoteStore,s)),t._onlineComponents=e}async function mI(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){ie("FirestoreClient","Using user provided OfflineComponentProvider");try{await Fl(t,t._uninitializedComponentsProvider._offline)}catch(e){const n=e;if(!function(s){return s.name==="FirebaseError"?s.code===F.FAILED_PRECONDITION||s.code===F.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(n))throw n;Os("Error using user provided cache. Falling back to memory cache: "+n),await Fl(t,new ua)}}else ie("FirestoreClient","Using default OfflineComponentProvider"),await Fl(t,new ua);return t._offlineComponents}async function pg(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(ie("FirestoreClient","Using user provided OnlineComponentProvider"),await Zd(t,t._uninitializedComponentsProvider._online)):(ie("FirestoreClient","Using default OnlineComponentProvider"),await Zd(t,new Au))),t._onlineComponents}function gI(t){return pg(t).then(e=>e.syncEngine)}async function mg(t){const e=await pg(t),n=e.eventManager;return n.onListen=tI.bind(null,e.syncEngine),n.onUnlisten=sI.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=nI.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=iI.bind(null,e.syncEngine),n}function _I(t,e,n={}){const r=new Kn;return t.asyncQueue.enqueueAndForget(async()=>function(i,o,l,u,h){const d=new fg({next:g=>{d.Za(),o.enqueueAndForget(()=>rg(i,p));const v=g.docs.has(l);!v&&g.fromCache?h.reject(new ne(F.UNAVAILABLE,"Failed to get document because the client is offline.")):v&&g.fromCache&&u&&u.source==="server"?h.reject(new ne(F.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):h.resolve(g)},error:g=>h.reject(g)}),p=new sg(ic(l.path),d,{includeMetadataChanges:!0,_a:!0});return ng(i,p)}(await mg(t),t.asyncQueue,e,n,r)),r.promise}function vI(t,e,n={}){const r=new Kn;return t.asyncQueue.enqueueAndForget(async()=>function(i,o,l,u,h){const d=new fg({next:g=>{d.Za(),o.enqueueAndForget(()=>rg(i,p)),g.fromCache&&u.source==="server"?h.reject(new ne(F.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(g)},error:g=>h.reject(g)}),p=new sg(l,d,{includeMetadataChanges:!0,_a:!0});return ng(i,p)}(await mg(t),t.asyncQueue,e,n,r)),r.promise}/**
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
 */function gg(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ef=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _g(t,e,n){if(!n)throw new ne(F.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function yI(t,e,n,r){if(e===!0&&r===!0)throw new ne(F.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function tf(t){if(!he.isDocumentKey(t))throw new ne(F.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function nf(t){if(he.isDocumentKey(t))throw new ne(F.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function qa(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":we()}function Dn(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new ne(F.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=qa(t);throw new ne(F.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rf{constructor(e){var n,r;if(e.host===void 0){if(e.ssl!==void 0)throw new ne(F.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(n=e.ssl)===null||n===void 0||n;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new ne(F.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}yI("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=gg((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new ne(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new ne(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new ne(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class za{constructor(e,n,r,s){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new rf({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new ne(F.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new ne(F.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new rf(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new Mb;switch(r.type){case"firstParty":return new jb(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new ne(F.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=ef.get(n);r&&(ie("ComponentProvider","Removing Datastore"),ef.delete(n),r.terminate())}(this),Promise.resolve()}}function wI(t,e,n,r={}){var s;const i=(t=Dn(t,za))._getSettings(),o=`${e}:${n}`;if(i.host!=="firestore.googleapis.com"&&i.host!==o&&Os("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),t._setSettings(Object.assign(Object.assign({},i),{host:o,ssl:!1})),r.mockUserToken){let l,u;if(typeof r.mockUserToken=="string")l=r.mockUserToken,u=Mt.MOCK_USER;else{l=cw(r.mockUserToken,(s=t._app)===null||s===void 0?void 0:s.options.projectId);const h=r.mockUserToken.sub||r.mockUserToken.user_id;if(!h)throw new ne(F.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");u=new Mt(h)}t._authCredentials=new Lb(new dm(l,u))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ns{constructor(e,n,r){this.converter=n,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new ns(this.firestore,e,this._query)}}class tn{constructor(e,n,r){this.converter=n,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new Tr(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new tn(this.firestore,e,this._key)}}class Tr extends ns{constructor(e,n,r){super(e,n,ic(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new tn(this.firestore,null,new he(e))}withConverter(e){return new Tr(this.firestore,e,this._path)}}function Ke(t,e,...n){if(t=Bt(t),_g("collection","path",e),t instanceof za){const r=et.fromString(e,...n);return nf(r),new Tr(t,null,r)}{if(!(t instanceof tn||t instanceof Tr))throw new ne(F.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(et.fromString(e,...n));return nf(r),new Tr(t.firestore,null,r)}}function Xe(t,e,...n){if(t=Bt(t),arguments.length===1&&(e=fm.newId()),_g("doc","path",e),t instanceof za){const r=et.fromString(e,...n);return tf(r),new tn(t,null,new he(r))}{if(!(t instanceof tn||t instanceof Tr))throw new ne(F.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(et.fromString(e,...n));return tf(r),new tn(t.firestore,t instanceof Tr?t.converter:null,new he(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sf{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new Gm(this,"async_queue_retry"),this.Vu=()=>{const r=Ll();r&&ie("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const n=Ll();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const n=Ll();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const n=new Kn;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!Ji(e))throw e;ie("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const n=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const s=function(o){let l=o.message||"";return o.stack&&(l=o.stack.includes(o.message)?o.stack:o.message+`
`+o.stack),l}(r);throw Jn("INTERNAL UNHANDLED ERROR: ",s),r}).then(r=>(this.du=!1,r))));return this.mu=n,n}enqueueAfterDelay(e,n,r){this.fu(),this.Ru.indexOf(e)>-1&&(n=0);const s=_c.createAndSchedule(this,e,n,r,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&we()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const n of this.Tu)if(n.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.Tu)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const n=this.Tu.indexOf(e);this.Tu.splice(n,1)}}class rs extends za{constructor(e,n,r,s){super(e,n,r,s),this.type="firestore",this._queue=new sf,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new sf(e),this._firestoreClient=void 0,await e}}}function bI(t,e){const n=typeof t=="object"?t:rm(),r=typeof t=="string"?t:e||"(default)",s=Yu(n,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=lw("firestore");i&&wI(s,...i)}return s}function Ha(t){if(t._terminated)throw new ne(F.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||EI(t),t._firestoreClient}function EI(t){var e,n,r;const s=t._freezeSettings(),i=function(l,u,h,d){return new Zb(l,u,h,d.host,d.ssl,d.experimentalForceLongPolling,d.experimentalAutoDetectLongPolling,gg(d.experimentalLongPollingOptions),d.useFetchStreams)}(t._databaseId,((e=t._app)===null||e===void 0?void 0:e.options.appId)||"",t._persistenceKey,s);t._componentsProvider||!((n=s.localCache)===null||n===void 0)&&n._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(t._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),t._firestoreClient=new pI(t._authCredentials,t._appCheckCredentials,t._queue,i,t._componentsProvider&&function(l){const u=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(u),_online:u}}(t._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $s{constructor(e){this._byteString=e}static fromBase64String(e){try{return new $s(xt.fromBase64String(e))}catch(n){throw new ne(F.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new $s(xt.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ka{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new ne(F.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Pt(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wa{constructor(e){this._methodName=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class bc{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new ne(F.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new ne(F.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return je(this._lat,e._lat)||je(this._long,e._long)}}/**
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
 */class Ec{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const TI=/^__.*__$/;class II{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return this.fieldMask!==null?new Nr(e,this.data,this.fieldMask,n,this.fieldTransforms):new Yi(e,this.data,n,this.fieldTransforms)}}class vg{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return new Nr(e,this.data,this.fieldMask,n,this.fieldTransforms)}}function yg(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw we()}}class Tc{constructor(e,n,r,s,i,o){this.settings=e,this.databaseId=n,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.vu(),this.fieldTransforms=i||[],this.fieldMask=o||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new Tc(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),s=this.Fu({path:r,xu:!1});return s.Ou(e),s}Nu(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),s=this.Fu({path:r,xu:!1});return s.vu(),s}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return ca(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(yg(this.Cu)&&TI.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class AI{constructor(e,n,r){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=r||ja(e)}Qu(e,n,r,s=!1){return new Tc({Cu:e,methodName:n,qu:r,path:Pt.emptyPath(),xu:!1,ku:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function Ga(t){const e=t._freezeSettings(),n=ja(t._databaseId);return new AI(t._databaseId,!!e.ignoreUndefinedProperties,n)}function Ic(t,e,n,r,s,i={}){const o=t.Qu(i.merge||i.mergeFields?2:0,e,n,s);Sc("Data must be an object, but it was:",o,r);const l=wg(r,o);let u,h;if(i.merge)u=new an(o.fieldMask),h=o.fieldTransforms;else if(i.mergeFields){const d=[];for(const p of i.mergeFields){const g=Su(e,p,n);if(!o.contains(g))throw new ne(F.INVALID_ARGUMENT,`Field '${g}' is specified in your field mask but missing from your input data.`);Eg(d,g)||d.push(g)}u=new an(d),h=o.fieldTransforms.filter(p=>u.covers(p.field))}else u=null,h=o.fieldTransforms;return new II(new Zt(l),u,h)}class Qa extends Wa{_toFieldTransform(e){if(e.Cu!==2)throw e.Cu===1?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Qa}}class Ac extends Wa{_toFieldTransform(e){return new IE(e.path,new $i)}isEqual(e){return e instanceof Ac}}function SI(t,e,n,r){const s=t.Qu(1,e,n);Sc("Data must be an object, but it was:",s,r);const i=[],o=Zt.empty();es(r,(u,h)=>{const d=Rc(e,u,n);h=Bt(h);const p=s.Nu(d);if(h instanceof Qa)i.push(d);else{const g=to(h,p);g!=null&&(i.push(d),o.set(d,g))}});const l=new an(i);return new vg(o,l,s.fieldTransforms)}function RI(t,e,n,r,s,i){const o=t.Qu(1,e,n),l=[Su(e,r,n)],u=[s];if(i.length%2!=0)throw new ne(F.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let g=0;g<i.length;g+=2)l.push(Su(e,i[g])),u.push(i[g+1]);const h=[],d=Zt.empty();for(let g=l.length-1;g>=0;--g)if(!Eg(h,l[g])){const v=l[g];let x=u[g];x=Bt(x);const D=o.Nu(v);if(x instanceof Qa)h.push(v);else{const N=to(x,D);N!=null&&(h.push(v),d.set(v,N))}}const p=new an(h);return new vg(d,p,o.fieldTransforms)}function PI(t,e,n,r=!1){return to(n,t.Qu(r?4:3,e))}function to(t,e){if(bg(t=Bt(t)))return Sc("Unsupported field value:",e,t),wg(t,e);if(t instanceof Wa)return function(r,s){if(!yg(s.Cu))throw s.Bu(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Bu(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,s){const i=[];let o=0;for(const l of r){let u=to(l,s.Lu(o));u==null&&(u={nullValue:"NULL_VALUE"}),i.push(u),o++}return{arrayValue:{values:i}}}(t,e)}return function(r,s){if((r=Bt(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return bE(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=yt.fromDate(r);return{timestampValue:aa(s.serializer,i)}}if(r instanceof yt){const i=new yt(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:aa(s.serializer,i)}}if(r instanceof bc)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof $s)return{bytesValue:Um(s.serializer,r._byteString)};if(r instanceof tn){const i=s.databaseId,o=r.firestore._databaseId;if(!o.isEqual(i))throw s.Bu(`Document reference is for database ${o.projectId}/${o.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:uc(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof Ec)return function(o,l){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:o.toArray().map(u=>{if(typeof u!="number")throw l.Bu("VectorValues must only contain numeric values.");return oc(l.serializer,u)})}}}}}}(r,s);throw s.Bu(`Unsupported field value: ${qa(r)}`)}(t,e)}function wg(t,e){const n={};return pm(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):es(t,(r,s)=>{const i=to(s,e.Mu(r));i!=null&&(n[r]=i)}),{mapValue:{fields:n}}}function bg(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof yt||t instanceof bc||t instanceof $s||t instanceof tn||t instanceof Wa||t instanceof Ec)}function Sc(t,e,n){if(!bg(n)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(n)){const r=qa(n);throw r==="an object"?e.Bu(t+" a custom object"):e.Bu(t+" "+r)}}function Su(t,e,n){if((e=Bt(e))instanceof Ka)return e._internalPath;if(typeof e=="string")return Rc(t,e);throw ca("Field path arguments must be of type string or ",t,!1,void 0,n)}const CI=new RegExp("[~\\*/\\[\\]]");function Rc(t,e,n){if(e.search(CI)>=0)throw ca(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new Ka(...e.split("."))._internalPath}catch{throw ca(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function ca(t,e,n,r,s){const i=r&&!r.isEmpty(),o=s!==void 0;let l=`Function ${e}() called with invalid data`;n&&(l+=" (via `toFirestore()`)"),l+=". ";let u="";return(i||o)&&(u+=" (found",i&&(u+=` in field ${r}`),o&&(u+=` in document ${s}`),u+=")"),new ne(F.INVALID_ARGUMENT,l+t+u)}function Eg(t,e){return t.some(n=>n.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Tg{constructor(e,n,r,s,i){this._firestore=e,this._userDataWriter=n,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new tn(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new xI(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const n=this._document.data.field(Ja("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class xI extends Tg{data(){return super.data()}}function Ja(t,e){return typeof e=="string"?Rc(t,e):e instanceof Ka?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kI(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new ne(F.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class Pc{}class Ig extends Pc{}function Ag(t,e,...n){let r=[];e instanceof Pc&&r.push(e),r=r.concat(n),function(i){const o=i.filter(u=>u instanceof Cc).length,l=i.filter(u=>u instanceof Ya).length;if(o>1||o>0&&l>0)throw new ne(F.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)t=s._apply(t);return t}class Ya extends Ig{constructor(e,n,r){super(),this._field=e,this._op=n,this._value=r,this.type="where"}static _create(e,n,r){return new Ya(e,n,r)}_apply(e){const n=this._parse(e);return Sg(e._query,n),new ns(e.firestore,e.converter,gu(e._query,n))}_parse(e){const n=Ga(e.firestore);return function(i,o,l,u,h,d,p){let g;if(h.isKeyField()){if(d==="array-contains"||d==="array-contains-any")throw new ne(F.INVALID_ARGUMENT,`Invalid Query. You can't perform '${d}' queries on documentId().`);if(d==="in"||d==="not-in"){af(p,d);const v=[];for(const x of p)v.push(of(u,i,x));g={arrayValue:{values:v}}}else g=of(u,i,p)}else d!=="in"&&d!=="not-in"&&d!=="array-contains-any"||af(p,d),g=PI(l,o,p,d==="in"||d==="not-in");return pt.create(h,d,g)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}}function DI(t,e,n){const r=e,s=Ja("where",t);return Ya._create(s,r,n)}class Cc extends Pc{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new Cc(e,n)}_parse(e){const n=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return n.length===1?n[0]:vn.create(n,this._getOperator())}_apply(e){const n=this._parse(e);return n.getFilters().length===0?e:(function(s,i){let o=s;const l=i.getFlattenedFilters();for(const u of l)Sg(o,u),o=gu(o,u)}(e._query,n),new ns(e.firestore,e.converter,gu(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class xc extends Ig{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new xc(e,n)}_apply(e){const n=function(s,i,o){if(s.startAt!==null)throw new ne(F.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new ne(F.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new ji(i,o)}(e._query,this._field,this._direction);return new ns(e.firestore,e.converter,function(s,i){const o=s.explicitOrderBy.concat([i]);return new zs(s.path,s.collectionGroup,o,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,n))}}function NI(t,e="asc"){const n=e,r=Ja("orderBy",t);return xc._create(r,n)}function of(t,e,n){if(typeof(n=Bt(n))=="string"){if(n==="")throw new ne(F.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Tm(e)&&n.indexOf("/")!==-1)throw new ne(F.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(et.fromString(n));if(!he.isDocumentKey(r))throw new ne(F.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Rd(t,new he(r))}if(n instanceof tn)return Rd(t,n._key);throw new ne(F.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${qa(n)}.`)}function af(t,e){if(!Array.isArray(t)||t.length===0)throw new ne(F.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function Sg(t,e){const n=function(s,i){for(const o of s)for(const l of o.getFlattenedFilters())if(i.indexOf(l.op)>=0)return l.op;return null}(t.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new ne(F.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new ne(F.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}class VI{convertValue(e,n="none"){switch(Jr(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ht(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(Qr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw we()}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){const r={};return es(e,(s,i)=>{r[s]=this.convertValue(i,n)}),r}convertVectorValue(e){var n,r,s;const i=(s=(r=(n=e.fields)===null||n===void 0?void 0:n.value.arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(o=>ht(o.doubleValue));return new Ec(i)}convertGeoPoint(e){return new bc(ht(e.latitude),ht(e.longitude))}convertArray(e,n){return(e.values||[]).map(r=>this.convertValue(r,n))}convertServerTimestamp(e,n){switch(n){case"previous":const r=tc(e);return r==null?null:this.convertValue(r,n);case"estimate":return this.convertTimestamp(Li(e));default:return null}}convertTimestamp(e){const n=Pr(e);return new yt(n.seconds,n.nanos)}convertDocumentKey(e,n){const r=et.fromString(e);We(Hm(r));const s=new Fi(r.get(1),r.get(3)),i=new he(r.popFirst(5));return s.isEqual(n)||Jn(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kc(t,e,n){let r;return r=t?n&&(n.merge||n.mergeFields)?t.toFirestore(e,n):t.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class di{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Rg extends Tg{constructor(e,n,r,s,i,o){super(e,n,r,s,o),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new qo(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const r=this._document.data.field(Ja("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,n.serverTimestamps)}}}class qo extends Rg{data(e={}){return super.data(e)}}class OI{constructor(e,n,r,s){this._firestore=e,this._userDataWriter=n,this._snapshot=s,this.metadata=new di(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(r=>{e.call(n,new qo(this._firestore,this._userDataWriter,r.key,r,new di(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new ne(F.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let o=0;return s._snapshot.docChanges.map(l=>{const u=new qo(s._firestore,s._userDataWriter,l.doc.key,l.doc,new di(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);return l.doc,{type:"added",doc:u,oldIndex:-1,newIndex:o++}})}{let o=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(l=>i||l.type!==3).map(l=>{const u=new qo(s._firestore,s._userDataWriter,l.doc.key,l.doc,new di(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,d=-1;return l.type!==0&&(h=o.indexOf(l.doc.key),o=o.delete(l.doc.key)),l.type!==1&&(o=o.add(l.doc),d=o.indexOf(l.doc.key)),{type:MI(l.type),doc:u,oldIndex:h,newIndex:d}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}}function MI(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return we()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function LI(t){t=Dn(t,tn);const e=Dn(t.firestore,rs);return _I(Ha(e),t._key).then(n=>UI(e,t,n))}class Pg extends VI{constructor(e){super(),this.firestore=e}convertBytes(e){return new $s(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new tn(this.firestore,null,n)}}function st(t){t=Dn(t,ns);const e=Dn(t.firestore,rs),n=Ha(e),r=new Pg(e);return kI(t._query),vI(n,t._query).then(s=>new OI(e,r,t,s))}function pn(t,e,n){t=Dn(t,tn);const r=Dn(t.firestore,rs),s=kc(t.converter,e,n);return Xa(r,[Ic(Ga(r),"setDoc",t._key,s,t.converter!==null,n).toMutation(t._key,en.none())])}function ha(t){return Xa(Dn(t.firestore,rs),[new Fa(t._key,en.none())])}function FI(t,e){const n=Dn(t.firestore,rs),r=Xe(t),s=kc(t.converter,e);return Xa(n,[Ic(Ga(t.firestore),"addDoc",r._key,s,t.converter!==null,{}).toMutation(r._key,en.exists(!1))]).then(()=>r)}function Xa(t,e){return function(r,s){const i=new Kn;return r.asyncQueue.enqueueAndForget(async()=>oI(await gI(r),s,i)),i.promise}(Ha(t),e)}function UI(t,e,n){const r=n.docs.get(e._key),s=new Pg(t);return new Rg(t,s,e._key,r,new di(n.hasPendingWrites,n.fromCache),e.converter)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class jI{constructor(e,n){this._firestore=e,this._commitHandler=n,this._mutations=[],this._committed=!1,this._dataReader=Ga(e)}set(e,n,r){this._verifyNotCommitted();const s=Ul(e,this._firestore),i=kc(s.converter,n,r),o=Ic(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(o.toMutation(s._key,en.none())),this}update(e,n,r,...s){this._verifyNotCommitted();const i=Ul(e,this._firestore);let o;return o=typeof(n=Bt(n))=="string"||n instanceof Ka?RI(this._dataReader,"WriteBatch.update",i._key,n,r,s):SI(this._dataReader,"WriteBatch.update",i._key,n),this._mutations.push(o.toMutation(i._key,en.exists(!0))),this}delete(e){this._verifyNotCommitted();const n=Ul(e,this._firestore);return this._mutations=this._mutations.concat(new Fa(n._key,en.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new ne(F.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function Ul(t,e){if((t=Bt(t)).firestore!==e)throw new ne(F.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return t}function Cg(){return new Ac("serverTimestamp")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xg(t){return Ha(t=Dn(t,rs)),new jI(t,e=>Xa(t,e))}(function(e,n=!0){(function(s){qs=s})(Bs),Vs(new Wr("firestore",(r,{instanceIdentifier:s,options:i})=>{const o=r.getProvider("app").getImmediate(),l=new rs(new Fb(r.getProvider("auth-internal")),new Bb(r.getProvider("app-check-internal")),function(h,d){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new ne(F.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new Fi(h.options.projectId,d)}(o,s),o);return i=Object.assign({useFetchStreams:n},i),l._setSettings(i),l},"PUBLIC").setMultipleInstances(!0)),Er(Ed,"4.7.3",e),Er(Ed,"4.7.3","esm2017")})();function Dc(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(t);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(t,r[s])&&(n[r[s]]=t[r[s]]);return n}function kg(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const $I=kg,Dg=new Wi("auth","Firebase",kg());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const da=new Qu("@firebase/auth");function BI(t,...e){da.logLevel<=Ne.WARN&&da.warn(`Auth (${Bs}): ${t}`,...e)}function zo(t,...e){da.logLevel<=Ne.ERROR&&da.error(`Auth (${Bs}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Xn(t,...e){throw Nc(t,...e)}function Pn(t,...e){return Nc(t,...e)}function Ng(t,e,n){const r=Object.assign(Object.assign({},$I()),{[e]:n});return new Wi("auth","Firebase",r).create(e,{appName:t.name})}function Ir(t){return Ng(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Nc(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return Dg.create(t,...e)}function ye(t,e,...n){if(!t)throw Nc(e,...n)}function qn(t){const e="INTERNAL ASSERTION FAILED: "+t;throw zo(e),new Error(e)}function Zn(t,e){t||qn(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ru(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.href)||""}function qI(){return lf()==="http:"||lf()==="https:"}function lf(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function zI(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(qI()||pw()||"connection"in navigator)?navigator.onLine:!0}function HI(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class no{constructor(e,n){this.shortDelay=e,this.longDelay=n,Zn(n>e,"Short delay should be less than long delay!"),this.isMobile=hw()||mw()}get(){return zI()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Vc(t,e){Zn(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vg{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;qn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;qn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;qn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const KI={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WI=new no(3e4,6e4);function Za(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function Ws(t,e,n,r,s={}){return Og(t,s,async()=>{let i={},o={};r&&(e==="GET"?o=r:i={body:JSON.stringify(r)});const l=Gi(Object.assign({key:t.config.apiKey},o)).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);const h=Object.assign({method:e,headers:u},i);return fw()||(h.referrerPolicy="no-referrer"),Vg.fetch()(Lg(t,t.config.apiHost,n,l),h)})}async function Og(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},KI),e);try{const s=new GI(t),i=await Promise.race([n(),s.promise]);s.clearNetworkTimeout();const o=await i.json();if("needConfirmation"in o)throw ko(t,"account-exists-with-different-credential",o);if(i.ok&&!("errorMessage"in o))return o;{const l=i.ok?o.errorMessage:o.error.message,[u,h]=l.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw ko(t,"credential-already-in-use",o);if(u==="EMAIL_EXISTS")throw ko(t,"email-already-in-use",o);if(u==="USER_DISABLED")throw ko(t,"user-disabled",o);const d=r[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw Ng(t,d,h);Xn(t,d)}}catch(s){if(s instanceof tr)throw s;Xn(t,"network-request-failed",{message:String(s)})}}async function Mg(t,e,n,r,s={}){const i=await Ws(t,e,n,r,s);return"mfaPendingCredential"in i&&Xn(t,"multi-factor-auth-required",{_serverResponse:i}),i}function Lg(t,e,n,r){const s=`${e}${n}?${r}`;return t.config.emulator?Vc(t.config,s):`${t.config.apiScheme}://${s}`}class GI{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(Pn(this.auth,"network-request-failed")),WI.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function ko(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const s=Pn(t,e,r);return s.customData._tokenResponse=n,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function QI(t,e){return Ws(t,"POST","/v1/accounts:delete",e)}async function Fg(t,e){return Ws(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Si(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function JI(t,e=!1){const n=Bt(t),r=await n.getIdToken(e),s=Oc(r);ye(s&&s.exp&&s.auth_time&&s.iat,n.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,o=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:Si(jl(s.auth_time)),issuedAtTime:Si(jl(s.iat)),expirationTime:Si(jl(s.exp)),signInProvider:o||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function jl(t){return Number(t)*1e3}function Oc(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return zo("JWT malformed, contained fewer than 3 sections"),null;try{const s=Jp(n);return s?JSON.parse(s):(zo("Failed to decode base64 JWT payload"),null)}catch(s){return zo("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function uf(t){const e=Oc(t);return ye(e,"internal-error"),ye(typeof e.exp<"u","internal-error"),ye(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function zi(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof tr&&YI(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function YI({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class XI{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pu{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=Si(this.lastLoginAt),this.creationTime=Si(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function fa(t){var e;const n=t.auth,r=await t.getIdToken(),s=await zi(t,Fg(n,{idToken:r}));ye(s==null?void 0:s.users.length,n,"internal-error");const i=s.users[0];t._notifyReloadListener(i);const o=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?Ug(i.providerUserInfo):[],l=eA(t.providerData,o),u=t.isAnonymous,h=!(t.email&&i.passwordHash)&&!(l!=null&&l.length),d=u?h:!1,p={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:l,metadata:new Pu(i.createdAt,i.lastLoginAt),isAnonymous:d};Object.assign(t,p)}async function ZI(t){const e=Bt(t);await fa(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function eA(t,e){return[...t.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function Ug(t){return t.map(e=>{var{providerId:n}=e,r=Dc(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function tA(t,e){const n=await Og(t,{},async()=>{const r=Gi({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=t.config,o=Lg(t,s,"/v1/token",`key=${i}`),l=await t._getAdditionalHeaders();return l["Content-Type"]="application/x-www-form-urlencoded",Vg.fetch()(o,{method:"POST",headers:l,body:r})});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function nA(t,e){return Ws(t,"POST","/v2/accounts:revokeToken",Za(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rs{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ye(e.idToken,"internal-error"),ye(typeof e.idToken<"u","internal-error"),ye(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):uf(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){ye(e.length!==0,"internal-error");const n=uf(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(ye(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:s,expiresIn:i}=await tA(e,n);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:s,expirationTime:i}=n,o=new Rs;return r&&(ye(typeof r=="string","internal-error",{appName:e}),o.refreshToken=r),s&&(ye(typeof s=="string","internal-error",{appName:e}),o.accessToken=s),i&&(ye(typeof i=="number","internal-error",{appName:e}),o.expirationTime=i),o}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new Rs,this.toJSON())}_performRefresh(){return qn("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lr(t,e){ye(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class zn{constructor(e){var{uid:n,auth:r,stsTokenManager:s}=e,i=Dc(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new XI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new Pu(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const n=await zi(this,this.stsTokenManager.getToken(this.auth,e));return ye(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return JI(this,e)}reload(){return ZI(this)}_assign(e){this!==e&&(ye(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new zn(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){ye(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await fa(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Bn(this.auth.app))return Promise.reject(Ir(this.auth));const e=await this.getIdToken();return await zi(this,QI(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,s,i,o,l,u,h,d;const p=(r=n.displayName)!==null&&r!==void 0?r:void 0,g=(s=n.email)!==null&&s!==void 0?s:void 0,v=(i=n.phoneNumber)!==null&&i!==void 0?i:void 0,x=(o=n.photoURL)!==null&&o!==void 0?o:void 0,D=(l=n.tenantId)!==null&&l!==void 0?l:void 0,N=(u=n._redirectEventId)!==null&&u!==void 0?u:void 0,j=(h=n.createdAt)!==null&&h!==void 0?h:void 0,B=(d=n.lastLoginAt)!==null&&d!==void 0?d:void 0,{uid:W,emailVerified:G,isAnonymous:fe,providerData:oe,stsTokenManager:P}=n;ye(W&&P,e,"internal-error");const E=Rs.fromJSON(this.name,P);ye(typeof W=="string",e,"internal-error"),lr(p,e.name),lr(g,e.name),ye(typeof G=="boolean",e,"internal-error"),ye(typeof fe=="boolean",e,"internal-error"),lr(v,e.name),lr(x,e.name),lr(D,e.name),lr(N,e.name),lr(j,e.name),lr(B,e.name);const I=new zn({uid:W,auth:e,email:g,emailVerified:G,displayName:p,isAnonymous:fe,photoURL:x,phoneNumber:v,tenantId:D,stsTokenManager:E,createdAt:j,lastLoginAt:B});return oe&&Array.isArray(oe)&&(I.providerData=oe.map(S=>Object.assign({},S))),N&&(I._redirectEventId=N),I}static async _fromIdTokenResponse(e,n,r=!1){const s=new Rs;s.updateFromServerResponse(n);const i=new zn({uid:n.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await fa(i),i}static async _fromGetAccountInfoResponse(e,n,r){const s=n.users[0];ye(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?Ug(s.providerUserInfo):[],o=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),l=new Rs;l.updateFromIdToken(r);const u=new zn({uid:s.localId,auth:e,stsTokenManager:l,isAnonymous:o}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new Pu(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(u,h),u}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const cf=new Map;function Hn(t){Zn(t instanceof Function,"Expected a class definition");let e=cf.get(t);return e?(Zn(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,cf.set(t,e),e)}/**
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
 */class jg{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}jg.type="NONE";const hf=jg;/**
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
 */function Ho(t,e,n){return`firebase:${t}:${e}:${n}`}class Ps{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Ho(this.userKey,s.apiKey,i),this.fullPersistenceKey=Ho("persistence",s.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?zn._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new Ps(Hn(hf),e,r);const s=(await Promise.all(n.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let i=s[0]||Hn(hf);const o=Ho(r,e.config.apiKey,e.name);let l=null;for(const h of n)try{const d=await h._get(o);if(d){const p=zn._fromJSON(e,d);h!==i&&(l=p),i=h;break}}catch{}const u=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!u.length?new Ps(i,e,r):(i=u[0],l&&await i._set(o,l.toJSON()),await Promise.all(n.map(async h=>{if(h!==i)try{await h._remove(o)}catch{}})),new Ps(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function df(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(zg(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if($g(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Kg(e))return"Blackberry";if(Wg(e))return"Webos";if(Bg(e))return"Safari";if((e.includes("chrome/")||qg(e))&&!e.includes("edge/"))return"Chrome";if(Hg(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function $g(t=$t()){return/firefox\//i.test(t)}function Bg(t=$t()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function qg(t=$t()){return/crios\//i.test(t)}function zg(t=$t()){return/iemobile/i.test(t)}function Hg(t=$t()){return/android/i.test(t)}function Kg(t=$t()){return/blackberry/i.test(t)}function Wg(t=$t()){return/webos/i.test(t)}function Mc(t=$t()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function rA(t=$t()){var e;return Mc(t)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function sA(){return gw()&&document.documentMode===10}function Gg(t=$t()){return Mc(t)||Hg(t)||Wg(t)||Kg(t)||/windows phone/i.test(t)||zg(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Qg(t,e=[]){let n;switch(t){case"Browser":n=df($t());break;case"Worker":n=`${df($t())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Bs}/${r}`}/**
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
 */class iA{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=i=>new Promise((o,l)=>{try{const u=e(i);o(u)}catch(u){l(u)}});r.onAbort=n,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const s of n)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function oA(t,e={}){return Ws(t,"GET","/v2/passwordPolicy",Za(t,e))}/**
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
 */const aA=6;class lA{constructor(e){var n,r,s,i;const o=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=o.minPasswordLength)!==null&&n!==void 0?n:aA,o.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=o.maxPasswordLength),o.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=o.containsLowercaseCharacter),o.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=o.containsUppercaseCharacter),o.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=o.containsNumericCharacter),o.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=o.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,s,i,o,l;const u={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,u),this.validatePasswordCharacterOptions(e,u),u.isValid&&(u.isValid=(n=u.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),u.isValid&&(u.isValid=(r=u.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),u.isValid&&(u.isValid=(s=u.containsLowercaseLetter)!==null&&s!==void 0?s:!0),u.isValid&&(u.isValid=(i=u.containsUppercaseLetter)!==null&&i!==void 0?i:!0),u.isValid&&(u.isValid=(o=u.containsNumericCharacter)!==null&&o!==void 0?o:!0),u.isValid&&(u.isValid=(l=u.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),u}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),s&&(n.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class uA{constructor(e,n,r,s){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new ff(this),this.idTokenSubscription=new ff(this),this.beforeStateQueue=new iA(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Dg,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Hn(n)),this._initializationPromise=this.queue(async()=>{var r,s;if(!this._deleted&&(this.persistenceManager=await Ps.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await Fg(this,{idToken:e}),r=await zn._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(Bn(this.app)){const o=this.app.settings.authIdToken;return o?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(o).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const o=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,l=s==null?void 0:s._redirectEventId,u=await this.tryRedirectSignIn(e);(!o||o===l)&&(u!=null&&u.user)&&(s=u.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(o){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(o))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return ye(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await fa(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=HI()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Bn(this.app))return Promise.reject(Ir(this));const n=e?Bt(e):null;return n&&ye(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&ye(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Bn(this.app)?Promise.reject(Ir(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Bn(this.app)?Promise.reject(Ir(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Hn(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await oA(this),n=new lA(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new Wi("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await nA(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&Hn(e)||this._popupRedirectResolver;ye(n,this,"argument-error"),this.redirectPersistenceManager=await Ps.create(this,[Hn(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,s){if(this._deleted)return()=>{};const i=typeof n=="function"?n:n.next.bind(n);let o=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(ye(l,this,"internal-error"),l.then(()=>{o||i(this.currentUser)}),typeof n=="function"){const u=e.addObserver(n,r,s);return()=>{o=!0,u()}}else{const u=e.addObserver(n);return()=>{o=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ye(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Qg(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(n["X-Firebase-AppCheck"]=s),n}async _getAppCheckToken(){var e;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&BI(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function el(t){return Bt(t)}class ff{constructor(e){this.auth=e,this.observer=null,this.addObserver=Iw(n=>this.observer=n)}get next(){return ye(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Lc={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function cA(t){Lc=t}function hA(t){return Lc.loadJS(t)}function dA(){return Lc.gapiScript}function fA(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pA(t,e){const n=Yu(t,"auth");if(n.isInitialized()){const s=n.getImmediate(),i=n.getOptions();if(na(i,e??{}))return s;Xn(s,"already-initialized")}return n.initialize({options:e})}function mA(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(Hn);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function gA(t,e,n){const r=el(t);ye(r._canInitEmulator,r,"emulator-config-failed"),ye(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!!(n!=null&&n.disableWarnings),i=Jg(e),{host:o,port:l}=_A(e),u=l===null?"":`:${l}`;r.config.emulator={url:`${i}//${o}${u}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:o,port:l,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})}),s||vA()}function Jg(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function _A(t){const e=Jg(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:pf(r.substr(i.length+1))}}else{const[i,o]=r.split(":");return{host:i,port:pf(o)}}}function pf(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function vA(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yg{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return qn("not implemented")}_getIdTokenResponse(e){return qn("not implemented")}_linkToIdToken(e,n){return qn("not implemented")}_getReauthenticationResolver(e){return qn("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Cs(t,e){return Mg(t,"POST","/v1/accounts:signInWithIdp",Za(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yA="http://localhost";class Yr extends Yg{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new Yr(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Xn("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=n,i=Dc(n,["providerId","signInMethod"]);if(!r||!s)return null;const o=new Yr(r,s);return o.idToken=i.idToken||void 0,o.accessToken=i.accessToken||void 0,o.secret=i.secret,o.nonce=i.nonce,o.pendingToken=i.pendingToken||null,o}_getIdTokenResponse(e){const n=this.buildRequest();return Cs(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,Cs(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,Cs(e,n)}buildRequest(){const e={requestUri:yA,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Gi(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Xg{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class ro extends Xg{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dr extends ro{constructor(){super("facebook.com")}static credential(e){return Yr._fromParams({providerId:dr.PROVIDER_ID,signInMethod:dr.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return dr.credentialFromTaggedObject(e)}static credentialFromError(e){return dr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return dr.credential(e.oauthAccessToken)}catch{return null}}}dr.FACEBOOK_SIGN_IN_METHOD="facebook.com";dr.PROVIDER_ID="facebook.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fr extends ro{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return Yr._fromParams({providerId:fr.PROVIDER_ID,signInMethod:fr.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return fr.credentialFromTaggedObject(e)}static credentialFromError(e){return fr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:n,oauthAccessToken:r}=e;if(!n&&!r)return null;try{return fr.credential(n,r)}catch{return null}}}fr.GOOGLE_SIGN_IN_METHOD="google.com";fr.PROVIDER_ID="google.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pr extends ro{constructor(){super("github.com")}static credential(e){return Yr._fromParams({providerId:pr.PROVIDER_ID,signInMethod:pr.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return pr.credentialFromTaggedObject(e)}static credentialFromError(e){return pr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return pr.credential(e.oauthAccessToken)}catch{return null}}}pr.GITHUB_SIGN_IN_METHOD="github.com";pr.PROVIDER_ID="github.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class mr extends ro{constructor(){super("twitter.com")}static credential(e,n){return Yr._fromParams({providerId:mr.PROVIDER_ID,signInMethod:mr.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return mr.credentialFromTaggedObject(e)}static credentialFromError(e){return mr.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:n,oauthTokenSecret:r}=e;if(!n||!r)return null;try{return mr.credential(n,r)}catch{return null}}}mr.TWITTER_SIGN_IN_METHOD="twitter.com";mr.PROVIDER_ID="twitter.com";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function wA(t,e){return Mg(t,"POST","/v1/accounts:signUp",Za(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xr{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,s=!1){const i=await zn._fromIdTokenResponse(e,r,s),o=mf(r);return new xr({user:i,providerId:o,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const s=mf(r);return new xr({user:e,providerId:s,_tokenResponse:r,operationType:n})}}function mf(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function bA(t){var e;if(Bn(t.app))return Promise.reject(Ir(t));const n=el(t);if(await n._initializationPromise,!((e=n.currentUser)===null||e===void 0)&&e.isAnonymous)return new xr({user:n.currentUser,providerId:null,operationType:"signIn"});const r=await wA(n,{returnSecureToken:!0}),s=await xr._fromIdTokenResponse(n,"signIn",r,!0);return await n._updateCurrentUser(s.user),s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pa extends tr{constructor(e,n,r,s){var i;super(n.code,n.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,pa.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,s){return new pa(e,n,r,s)}}function Zg(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?pa._fromErrorAndOperation(t,i,e,r):i})}async function EA(t,e,n=!1){const r=await zi(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return xr._forOperation(t,"link",r)}/**
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
 */async function TA(t,e,n=!1){const{auth:r}=t;if(Bn(r.app))return Promise.reject(Ir(r));const s="reauthenticate";try{const i=await zi(t,Zg(r,s,e,t),n);ye(i.idToken,r,"internal-error");const o=Oc(i.idToken);ye(o,r,"internal-error");const{sub:l}=o;return ye(t.uid===l,r,"user-mismatch"),xr._forOperation(t,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Xn(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function IA(t,e,n=!1){if(Bn(t.app))return Promise.reject(Ir(t));const r="signIn",s=await Zg(t,r,e),i=await xr._fromIdTokenResponse(t,r,s);return n||await t._updateCurrentUser(i.user),i}function AA(t,e,n,r){return Bt(t).onIdTokenChanged(e,n,r)}function SA(t,e,n){return Bt(t).beforeAuthStateChanged(e,n)}const ma="__sak";/**
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
 */class e_{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(ma,"1"),this.storage.removeItem(ma),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const RA=1e3,PA=10;class t_ extends e_{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Gg(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),s=this.localCache[n];r!==s&&e(n,s,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((o,l,u)=>{this.notifyListeners(o,u)});return}const r=e.key;n?this.detachListener():this.stopPolling();const s=()=>{const o=this.storage.getItem(r);!n&&this.localCache[r]===o||this.notifyListeners(r,o)},i=this.storage.getItem(r);sA()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,PA):s()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},RA)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}t_.type="LOCAL";const CA=t_;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class n_ extends e_{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}n_.type="SESSION";const r_=n_;/**
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
 */function xA(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
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
 */class tl{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(s=>s.isListeningto(e));if(n)return n;const r=new tl(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:s,data:i}=n.data,o=this.handlersMap[s];if(!(o!=null&&o.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const l=Array.from(o).map(async h=>h(n.origin,i)),u=await xA(l);n.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:u})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}tl.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Fc(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
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
 */class kA{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,o;return new Promise((l,u)=>{const h=Fc("",20);s.port1.start();const d=setTimeout(()=>{u(new Error("unsupported_event"))},r);o={messageChannel:s,onMessage(p){const g=p;if(g.data.eventId===h)switch(g.data.status){case"ack":clearTimeout(d),i=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),l(g.data.response);break;default:clearTimeout(d),clearTimeout(i),u(new Error("invalid_response"));break}}},this.handlers.add(o),s.port1.addEventListener("message",o.onMessage),this.target.postMessage({eventType:e,eventId:h,data:n},[s.port2])}).finally(()=>{o&&this.removeMessageHandler(o)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cn(){return window}function DA(t){Cn().location.href=t}/**
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
 */function s_(){return typeof Cn().WorkerGlobalScope<"u"&&typeof Cn().importScripts=="function"}async function NA(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function VA(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)===null||t===void 0?void 0:t.controller)||null}function OA(){return s_()?self:null}/**
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
 */const i_="firebaseLocalStorageDb",MA=1,ga="firebaseLocalStorage",o_="fbase_key";class so{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function nl(t,e){return t.transaction([ga],e?"readwrite":"readonly").objectStore(ga)}function LA(){const t=indexedDB.deleteDatabase(i_);return new so(t).toPromise()}function Cu(){const t=indexedDB.open(i_,MA);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(ga,{keyPath:o_})}catch(s){n(s)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(ga)?e(r):(r.close(),await LA(),e(await Cu()))})})}async function gf(t,e,n){const r=nl(t,!0).put({[o_]:e,value:n});return new so(r).toPromise()}async function FA(t,e){const n=nl(t,!1).get(e),r=await new so(n).toPromise();return r===void 0?null:r.value}function _f(t,e){const n=nl(t,!0).delete(e);return new so(n).toPromise()}const UA=800,jA=3;class a_{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await Cu(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>jA)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return s_()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=tl._getInstance(OA()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var e,n;if(this.activeServiceWorker=await NA(),!this.activeServiceWorker)return;this.sender=new kA(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((n=r[0])===null||n===void 0)&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||VA()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await Cu();return await gf(e,ma,"1"),await _f(e,ma),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>gf(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>FA(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>_f(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=nl(s,!1).getAll();return new so(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),n.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),n.push(s));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),UA)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}a_.type="LOCAL";const $A=a_;new no(3e4,6e4);/**
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
 */function BA(t,e){return e?Hn(e):(ye(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class Uc extends Yg{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Cs(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Cs(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Cs(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function qA(t){return IA(t.auth,new Uc(t),t.bypassAuthState)}function zA(t){const{auth:e,user:n}=t;return ye(n,e,"internal-error"),TA(n,new Uc(t),t.bypassAuthState)}async function HA(t){const{auth:e,user:n}=t;return ye(n,e,"internal-error"),EA(n,new Uc(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class l_{constructor(e,n,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:s,tenantId:i,error:o,type:l}=e;if(o){this.reject(o);return}const u={auth:this.auth,requestUri:n,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(u))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return qA;case"linkViaPopup":case"linkViaRedirect":return HA;case"reauthViaPopup":case"reauthViaRedirect":return zA;default:Xn(this.auth,"internal-error")}}resolve(e){Zn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Zn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const KA=new no(2e3,1e4);class vs extends l_{constructor(e,n,r,s,i){super(e,n,s,i),this.provider=r,this.authWindow=null,this.pollId=null,vs.currentPopupAction&&vs.currentPopupAction.cancel(),vs.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return ye(e,this.auth,"internal-error"),e}async onExecution(){Zn(this.filter.length===1,"Popup operations only handle one event");const e=Fc();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(Pn(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(Pn(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,vs.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if(!((r=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(Pn(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,KA.get())};e()}}vs.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const WA="pendingRedirect",Ko=new Map;class GA extends l_{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=Ko.get(this.auth._key());if(!e){try{const r=await QA(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}Ko.set(this.auth._key(),e)}return this.bypassAuthState||Ko.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function QA(t,e){const n=XA(e),r=YA(t);if(!await r._isAvailable())return!1;const s=await r._get(n)==="true";return await r._remove(n),s}function JA(t,e){Ko.set(t._key(),e)}function YA(t){return Hn(t._redirectPersistence)}function XA(t){return Ho(WA,t.config.apiKey,t.name)}async function ZA(t,e,n=!1){if(Bn(t.app))return Promise.reject(Ir(t));const r=el(t),s=BA(r,e),o=await new GA(r,s,n).execute();return o&&!n&&(delete o.user._redirectEventId,await r._persistUserIfCurrent(o.user),await r._setRedirectUser(null,e)),o}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const eS=10*60*1e3;class tS{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!nS(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!u_(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";n.onError(Pn(this.auth,s))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=eS&&this.cachedEventUids.clear(),this.cachedEventUids.has(vf(e))}saveEventToCache(e){this.cachedEventUids.add(vf(e)),this.lastProcessedEventTime=Date.now()}}function vf(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function u_({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function nS(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return u_(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function rS(t,e={}){return Ws(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sS=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,iS=/^https?/;async function oS(t){if(t.config.emulator)return;const{authorizedDomains:e}=await rS(t);for(const n of e)try{if(aS(n))return}catch{}Xn(t,"unauthorized-domain")}function aS(t){const e=Ru(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const o=new URL(t);return o.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&o.hostname===r}if(!iS.test(n))return!1;if(sS.test(t))return r===t;const s=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
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
 */const lS=new no(3e4,6e4);function yf(){const t=Cn().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function uS(t){return new Promise((e,n)=>{var r,s,i;function o(){yf(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{yf(),n(Pn(t,"network-request-failed"))},timeout:lS.get()})}if(!((s=(r=Cn().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=Cn().gapi)===null||i===void 0)&&i.load)o();else{const l=fA("iframefcb");return Cn()[l]=()=>{gapi.load?o():n(Pn(t,"network-request-failed"))},hA(`${dA()}?onload=${l}`).catch(u=>n(u))}}).catch(e=>{throw Wo=null,e})}let Wo=null;function cS(t){return Wo=Wo||uS(t),Wo}/**
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
 */const hS=new no(5e3,15e3),dS="__/auth/iframe",fS="emulator/auth/iframe",pS={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},mS=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function gS(t){const e=t.config;ye(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?Vc(e,fS):`https://${t.config.authDomain}/${dS}`,r={apiKey:e.apiKey,appName:t.name,v:Bs},s=mS.get(t.config.apiHost);s&&(r.eid=s);const i=t._getFrameworks();return i.length&&(r.fw=i.join(",")),`${n}?${Gi(r).slice(1)}`}async function _S(t){const e=await cS(t),n=Cn().gapi;return ye(n,t,"internal-error"),e.open({where:document.body,url:gS(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:pS,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const o=Pn(t,"network-request-failed"),l=Cn().setTimeout(()=>{i(o)},hS.get());function u(){Cn().clearTimeout(l),s(r)}r.ping(u).then(u,()=>{i(o)})}))}/**
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
 */const vS={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},yS=500,wS=600,bS="_blank",ES="http://localhost";class wf{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function TS(t,e,n,r=yS,s=wS){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),o=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const u=Object.assign(Object.assign({},vS),{width:r.toString(),height:s.toString(),top:i,left:o}),h=$t().toLowerCase();n&&(l=qg(h)?bS:n),$g(h)&&(e=e||ES,u.scrollbars="yes");const d=Object.entries(u).reduce((g,[v,x])=>`${g}${v}=${x},`,"");if(rA(h)&&l!=="_self")return IS(e||"",l),new wf(null);const p=window.open(e||"",l,d);ye(p,t,"popup-blocked");try{p.focus()}catch{}return new wf(p)}function IS(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
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
 */const AS="__/auth/handler",SS="emulator/auth/handler",RS=encodeURIComponent("fac");async function bf(t,e,n,r,s,i){ye(t.config.authDomain,t,"auth-domain-config-required"),ye(t.config.apiKey,t,"invalid-api-key");const o={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:Bs,eventId:s};if(e instanceof Xg){e.setDefaultLanguage(t.languageCode),o.providerId=e.providerId||"",Tw(e.getCustomParameters())||(o.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,p]of Object.entries(i||{}))o[d]=p}if(e instanceof ro){const d=e.getScopes().filter(p=>p!=="");d.length>0&&(o.scopes=d.join(","))}t.tenantId&&(o.tid=t.tenantId);const l=o;for(const d of Object.keys(l))l[d]===void 0&&delete l[d];const u=await t._getAppCheckToken(),h=u?`#${RS}=${encodeURIComponent(u)}`:"";return`${PS(t)}?${Gi(l).slice(1)}${h}`}function PS({config:t}){return t.emulator?Vc(t,SS):`https://${t.authDomain}/${AS}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $l="webStorageSupport";class CS{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=r_,this._completeRedirectFn=ZA,this._overrideRedirectResult=JA}async _openPopup(e,n,r,s){var i;Zn((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const o=await bf(e,n,r,Ru(),s);return TS(e,o,Fc())}async _openRedirect(e,n,r,s){await this._originValidation(e);const i=await bf(e,n,r,Ru(),s);return DA(i),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:s,promise:i}=this.eventManagers[n];return s?Promise.resolve(s):(Zn(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await _S(e),r=new tS(e);return n.register("authEvent",s=>(ye(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send($l,{type:$l},s=>{var i;const o=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[$l];o!==void 0&&n(!!o),Xn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=oS(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return Gg()||Bg()||Mc()}}const xS=CS;var Ef="@firebase/auth",Tf="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kS{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){ye(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function DS(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function NS(t){Vs(new Wr("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:o,authDomain:l}=r.options;ye(o&&!o.includes(":"),"invalid-api-key",{appName:r.name});const u={apiKey:o,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Qg(t)},h=new uA(r,s,i,u);return mA(h,n),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),Vs(new Wr("auth-internal",e=>{const n=el(e.getProvider("auth").getImmediate());return(r=>new kS(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Er(Ef,Tf,DS(t)),Er(Ef,Tf,"esm2017")}/**
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
 */const VS=5*60,OS=Zp("authIdTokenMaxAge")||VS;let If=null;const MS=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>OS)return;const s=n==null?void 0:n.token;If!==s&&(If=s,await fetch(t,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function LS(t=rm()){const e=Yu(t,"auth");if(e.isInitialized())return e.getImmediate();const n=pA(t,{popupRedirectResolver:xS,persistence:[$A,CA,r_]}),r=Zp("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const o=MS(i.toString());SA(n,o,()=>o(n.currentUser)),AA(n,l=>o(l))}}const s=Yp("auth");return s&&gA(n,`http://${s}`),n}function FS(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}cA({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=s=>{const i=Pn("internal-error");i.customData=s,n(i)},r.type="text/javascript",r.charset="UTF-8",FS().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});NS("Browser");const US={apiKey:"AIzaSyDCqJRmxKiIzuAhgXsmXICCx_O65aujNa0",authDomain:"impro-selector.firebaseapp.com",projectId:"impro-selector",storageBucket:"impro-selector.appspot.com",messagingSenderId:"730278491306",appId:"1:730278491306:web:c966af1179221e91118cd3",measurementId:"G-3NB062D088"},c_=nm(US),_e=bI(c_),jS=LS(c_);bA(jS);const rl="seasons";async function $S(t,e,n){return await FI(Ke(_e,rl),{name:t,slug:e,pinCode:n,createdAt:Cg()})}async function BS(t){return await ha(Xe(_e,rl,t))}async function Bl(){const t=Ag(Ke(_e,rl),NI("createdAt","desc"));return(await st(t)).docs.map(n=>({id:n.id,...n.data()}))}async function _a(t,e){const n=await LI(Xe(_e,rl,t));return n.exists()?n.data().pinCode===e:!1}const ql=10*60*1e3,zl="impro_selector_pin_session";class qS{constructor(){this.sessionData=this.loadSession()}loadSession(){try{const e=localStorage.getItem(zl);if(e){const n=JSON.parse(e);if(n.timestamp&&Date.now()-n.timestamp<ql)return n;this.clearSession()}}catch(e){console.error("Erreur lors du chargement de la session PIN:",e)}return null}saveSession(e,n){try{const r={seasonId:e,pinCode:n,timestamp:Date.now()};localStorage.setItem(zl,JSON.stringify(r)),this.sessionData=r}catch(r){console.error("Erreur lors de la sauvegarde de la session PIN:",r)}}isPinCached(e){return this.sessionData?this.sessionData.seasonId===e&&this.sessionData.timestamp&&Date.now()-this.sessionData.timestamp<ql:!1}getCachedPin(e){return this.isPinCached(e)?this.sessionData.pinCode:null}clearSession(){try{localStorage.removeItem(zl),this.sessionData=null}catch(e){console.error("Erreur lors de la suppression de la session PIN:",e)}}getTimeRemaining(){if(!this.sessionData||!this.sessionData.timestamp)return 0;const e=Date.now()-this.sessionData.timestamp,n=ql-e;return Math.max(0,Math.ceil(n/(60*1e3)))}isExpiringSoon(){return this.getTimeRemaining()<=2}}const Xt=new qS,zS={key:0,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"},HS={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},KS={class:"text-center mb-6"},WS={class:"text-gray-300"},GS={key:0,class:"mt-2 p-2 bg-green-900/20 border border-green-500/30 rounded-lg"},QS={class:"text-sm text-green-400"},JS={class:"mb-4 flex justify-center"},YS={class:"flex bg-gray-800 rounded-lg p-1"},XS={key:0,class:"mb-6"},ZS={class:"mb-4"},eR={key:1,class:"mb-6"},tR={class:"flex justify-center space-x-3 mb-4"},nR={class:"grid grid-cols-3 gap-3 mb-4"},rR=["onClick"],sR={key:2,class:"mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-center"},iR={class:"flex justify-end space-x-3"},oR=["disabled"],h_={__name:"PinModal",props:{show:{type:Boolean,default:!1},message:{type:String,default:"Veuillez saisir le code PIN à 4 chiffres"},error:{type:String,default:""},sessionInfo:{type:Object,default:null}},emits:["submit","cancel"],setup(t,{emit:e}){const n=t,r=e,s=se(""),i=se(""),o=se("direct"),l=se(null);yr(()=>n.show,D=>{D&&(s.value="",i.value="",o.value==="direct"&&xs(()=>{var N;(N=l.value)==null||N.focus()}))}),yr(o,D=>{D==="direct"&&n.show&&xs(()=>{var N;(N=l.value)==null||N.focus()})});function u(){s.value=s.value.replace(/[^0-9]/g,""),s.value.length>4&&(s.value=s.value.slice(0,4))}function h(D){s.value.length<4&&(s.value+=D.toString())}function d(){s.value=s.value.slice(0,-1)}function p(){s.value="",i.value=""}function g(){s.value.length===4&&r("submit",s.value)}function v(){r("cancel")}const x=D=>{n.show&&(D.key>="0"&&D.key<="9"?o.value==="keypad"&&h(parseInt(D.key)):D.key==="Backspace"?o.value==="keypad"&&d():D.key==="Enter"?g():D.key==="Escape"&&v())};return typeof window<"u"&&window.addEventListener("keydown",x),(D,N)=>t.show?(ae(),ue("div",zS,[_("div",HS,[_("div",KS,[N[4]||(N[4]=_("div",{class:"w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center"},[_("span",{class:"text-2xl"},"🔒")],-1)),N[5]||(N[5]=_("h2",{class:"text-2xl font-bold text-white mb-2"},"Code d'accès requis",-1)),_("p",WS,Me(t.message),1),t.sessionInfo?(ae(),ue("div",GS,[_("p",QS," Session active : "+Me(t.sessionInfo.timeRemaining)+" min restantes ",1)])):ut("",!0)]),_("div",JS,[_("div",YS,[_("button",{onClick:N[0]||(N[0]=j=>o.value="direct"),class:vr(["px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",o.value==="direct"?"bg-purple-600 text-white":"text-gray-400 hover:text-white"])}," Saisie directe ",2),_("button",{onClick:N[1]||(N[1]=j=>o.value="keypad"),class:vr(["px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",o.value==="keypad"?"bg-purple-600 text-white":"text-gray-400 hover:text-white"])}," Pavé numérique ",2)])]),o.value==="direct"?(ae(),ue("div",XS,[_("div",ZS,[N[6]||(N[6]=_("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Code PIN",-1)),Jt(_("input",{"onUpdate:modelValue":N[2]||(N[2]=j=>s.value=j),type:"password",maxlength:"4",pattern:"[0-9]{4}",autocomplete:"off",autocorrect:"off",autocapitalize:"off",spellcheck:"false",class:"w-full p-4 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-center text-2xl font-mono tracking-widest",placeholder:"••••",onInput:u,onKeydown:[In(g,["enter"]),In(v,["escape"])],ref_key:"pinInput",ref:l},null,544),[[Yt,s.value]])]),N[7]||(N[7]=_("p",{class:"text-xs text-gray-400 text-center"},"Tapez directement votre code PIN à 4 chiffres",-1))])):(ae(),ue("div",eR,[_("div",tR,[(ae(),ue(dt,null,En(4,(j,B)=>_("div",{key:B,class:vr(["w-12 h-12 border-2 border-gray-600 rounded-lg flex items-center justify-center text-2xl font-bold text-white bg-gray-800",{"border-purple-500 bg-purple-900/20":s.value.length>B}])},Me(s.value[B]||"•"),3)),64))]),_("div",nR,[(ae(),ue(dt,null,En([1,2,3,4,5,6,7,8,9],j=>_("button",{key:j,onClick:B=>h(j),class:"w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-xl transition-all duration-200 hover:scale-105"},Me(j),9,rR)),64)),_("button",{onClick:p,class:"w-12 h-12 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105"}," C "),_("button",{onClick:N[3]||(N[3]=j=>h(0)),class:"w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-xl transition-all duration-200 hover:scale-105"}," 0 "),_("button",{onClick:d,class:"w-12 h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105"}," ← ")])])),i.value||n.error?(ae(),ue("div",sR,Me(i.value||n.error),1)):ut("",!0),_("div",iR,[_("button",{onClick:v,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),_("button",{onClick:g,disabled:s.value.length!==4,class:"px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"}," Valider ",8,oR)])])])):ut("",!0)}},aR={class:"min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"},lR={class:"container mx-auto px-4 pb-16"},uR={class:"flex justify-center mb-12"},cR={class:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto"},hR=["onClick"],dR={class:"text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors"},fR=["onClick"],pR={key:0,class:"text-center py-16"},mR={key:0,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},gR={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},_R={class:"mb-6"},vR={class:"mb-6"},yR={class:"mb-6"},wR={class:"flex justify-end space-x-3"},bR=["disabled"],ER={key:1,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"},TR={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},IR={class:"text-center mb-6"},AR={class:"text-gray-300"},SR={__name:"Home",setup(t){const e=se([]),n=Wp(),r=se(!1),s=se(!1),i=se(""),o=se(""),l=se(""),u=se(null),h=se(!1),d=se(null),p=se("");qu(async()=>{e.value=await Bl(),console.log("Saisons chargées:",e.value)});function g(S){n.push(`/season/${S}`)}function v(){i.value&&(o.value=i.value.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim("-"))}function x(){l.value=l.value.replace(/[^0-9]/g,""),l.value.length>4&&(l.value=l.value.slice(0,4))}async function D(){if(!i.value.trim()||!o.value.trim()||!l.value.trim()){alert("Veuillez remplir tous les champs, y compris le code PIN à 4 chiffres");return}if(l.value.length!==4){alert("Le code PIN doit contenir exactement 4 chiffres");return}try{await $S(i.value.trim(),o.value.trim(),l.value.trim()),e.value=await Bl(),N()}catch(S){console.error("Erreur lors de la création de la saison:",S),alert("Erreur lors de la création de la saison. Veuillez réessayer.")}}function N(){r.value=!1,i.value="",o.value="",l.value=""}function j(S){u.value=S,s.value=!0}async function B(){s.value=!1,await fe({type:"deleteSeason",data:{seasonId:u.value.id,seasonName:u.value.name}})}function W(){s.value=!1,u.value=null}function G(){return d.value?{deleteSeason:"Suppression de saison - Code PIN requis"}[d.value.type]||"Code PIN requis":"Veuillez saisir le code PIN à 4 chiffres"}async function fe(S){if(Xt.isPinCached(u.value.id)){const y=Xt.getCachedPin(u.value.id);if(console.log("PIN en cache trouvé, utilisation automatique"),await _a(u.value.id,y)){await I(S);return}else Xt.clearSession()}d.value=S,h.value=!0}async function oe(S){var y,T,w;console.log("PIN soumis:",S,"pour l'opération:",d.value);try{const Le=((T=(y=d.value)==null?void 0:y.data)==null?void 0:T.seasonId)||((w=u.value)==null?void 0:w.id),ot=await _a(Le,S);if(console.log("PIN valide:",ot),ot){Xt.saveSession(Le,S),console.log("PIN correct, fermeture de la modal et exécution de l'opération"),h.value=!1;const Oe=d.value;d.value=null,console.log("Appel de executePendingOperation avec:",Oe),await I(Oe)}else p.value="Code PIN incorrect",setTimeout(()=>{p.value=""},3e3)}catch(Le){console.error("Erreur lors de la vérification du PIN:",Le),p.value="Erreur lors de la vérification du code PIN"}}function P(){h.value=!1,d.value=null,p.value=""}function E(){return u.value&&Xt.isPinCached(u.value.id)?{timeRemaining:Xt.getTimeRemaining(),isExpiringSoon:Xt.isExpiringSoon()}:null}async function I(S){if(console.log("executePendingOperation appelé avec:",S),!S){console.log("Aucune opération à exécuter");return}const{type:y,data:T}=S;console.log("Exécution de l'opération:",y,"avec données:",T);try{switch(y){case"deleteSeason":console.log("Suppression de la saison ID:",T.seasonId),await BS(T.seasonId),console.log("Saison supprimée, rechargement de la liste..."),e.value=await Bl(),console.log("Nouvelle liste des saisons:",e.value);break;default:console.log("Type d'opération non reconnu:",y)}}catch(w){console.error("Erreur lors de l'exécution de l'opération:",w),alert("Erreur lors de l'opération. Veuillez réessayer.")}}return(S,y)=>{var T;return ae(),ue("div",aR,[y[20]||(y[20]=_("div",{class:"text-center py-16 px-4"},[_("h1",{class:"text-6xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse"}," Sélections Spectacle "),_("p",{class:"text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed"}," Gérez facilement les sélections pour vos spectacles. ")],-1)),_("div",lR,[_("div",uR,[_("button",{onClick:y[0]||(y[0]=w=>r.value=!0),class:"bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105"}," ✨ Nouvelle saison ")]),_("div",cR,[(ae(!0),ue(dt,null,En(e.value,w=>(ae(),ue("div",{key:w.id,class:"group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"},[_("div",{onClick:Le=>g(w.slug),class:"text-center"},[y[5]||(y[5]=_("div",{class:"w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"},[_("span",{class:"text-2xl"},"🎭")],-1)),_("h2",dR,Me(w.name),1),y[6]||(y[6]=_("div",{class:"w-full bg-gradient-to-r from-transparent via-white/20 to-transparent h-px mb-4"},null,-1)),y[7]||(y[7]=_("p",{class:"text-gray-300 text-sm"}," Cliquez pour accéder ",-1))],8,hR),_("button",{onClick:As(Le=>j(w),["stop"]),class:"absolute top-4 right-4 text-red-400 hover:text-red-300 hover:scale-110 transition-all duration-200 opacity-0 group-hover:opacity-100",title:"Supprimer cette saison"},y[8]||(y[8]=[_("svg",{class:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[_("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"})],-1)]),8,fR)]))),128))]),e.value.length===0?(ae(),ue("div",pR,[y[9]||(y[9]=_("div",{class:"w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center"},[_("span",{class:"text-4xl"},"🎪")],-1)),y[10]||(y[10]=_("h3",{class:"text-2xl font-bold text-white mb-4"},"Aucune saison créée",-1)),y[11]||(y[11]=_("p",{class:"text-gray-300 mb-8"},"Commencez par créer votre première saison de spectacles !",-1)),_("button",{onClick:y[1]||(y[1]=w=>r.value=!0),class:"bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-xl hover:shadow-pink-500/25 transition-all duration-300"}," Créer ma première saison ")])):ut("",!0)]),r.value?(ae(),ue("div",mR,[_("div",gR,[y[16]||(y[16]=_("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✨ Nouvelle saison",-1)),_("div",_R,[y[12]||(y[12]=_("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nom de la saison",-1)),Jt(_("input",{"onUpdate:modelValue":y[2]||(y[2]=w=>i.value=w),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Ex: La Malice 2025-2026",onInput:v},null,544),[[Yt,i.value]])]),_("div",vR,[y[13]||(y[13]=_("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Slug (URL)",-1)),Jt(_("input",{"onUpdate:modelValue":y[3]||(y[3]=w=>o.value=w),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Ex: malice-2025-2026"},null,512),[[Yt,o.value]])]),_("div",yR,[y[14]||(y[14]=_("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Code PIN (4 chiffres)",-1)),Jt(_("input",{"onUpdate:modelValue":y[4]||(y[4]=w=>l.value=w),type:"text",inputmode:"numeric",maxlength:"4",pattern:"[0-9]{4}",autocomplete:"off",autocorrect:"off",autocapitalize:"off",spellcheck:"false",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"1234",onInput:x},null,544),[[Yt,l.value]]),y[15]||(y[15]=_("p",{class:"text-xs text-gray-400 mt-1"},"Ce code protégera les opérations sensibles (suppressions, sélections)",-1))]),_("div",wR,[_("button",{onClick:N,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),_("button",{onClick:D,disabled:!i.value.trim()||!o.value.trim()||!l.value.trim()||l.value.length!==4,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300"}," Créer ",8,bR)])])])):ut("",!0),s.value?(ae(),ue("div",ER,[_("div",TR,[_("div",IR,[y[17]||(y[17]=_("div",{class:"w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"},[_("span",{class:"text-2xl"},"⚠️")],-1)),y[18]||(y[18]=_("h2",{class:"text-2xl font-bold text-white mb-2"},"Confirmation",-1)),_("p",AR,'Êtes-vous sûr de vouloir supprimer la saison "'+Me((T=u.value)==null?void 0:T.name)+'" ?',1)]),y[19]||(y[19]=_("p",{class:"mb-6 text-sm text-red-400 bg-red-900/20 p-3 rounded-lg border border-red-500/20"}," ⚠️ Cette action est irréversible et supprimera toutes les données de cette saison. ",-1)),_("div",{class:"flex justify-end space-x-3"},[_("button",{onClick:W,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),_("button",{onClick:B,class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"}," Supprimer ")])])])):ut("",!0),Et(h_,{show:h.value,message:G(),error:p.value,"session-info":E(),onSubmit:oe,onCancel:P},null,8,["show","message","error","session-info"])])}}};let Kt="mock";const Xr=[{id:"p1",name:"Alice"},{id:"p2",name:"Bob"},{id:"p3",name:"Charlie"},{id:"p4",name:"David"},{id:"p5",name:"Eva"},{id:"p6",name:"Fanny"},{id:"p7",name:"Georges"},{id:"p8",name:"Hélène"},{id:"p9",name:"Ismaël"},{id:"p10",name:"Jade"},{id:"p11",name:"Karim"},{id:"p12",name:"Léa"},{id:"p13",name:"Marc"},{id:"p14",name:"Nina"},{id:"p15",name:"Oscar"}],Zr=[{id:"event1",title:"Apérock Septembre",date:"2025-09-08",description:"Soirée apéro-rock avec ambiance festive"},{id:"event2",title:"Match à Cambo",date:"2025-11-25",description:"Match d'improvisation compétitif à Cambo-les-Bains"},{id:"event3",title:"Impro des Familles",date:"2025-12-02",description:"Spectacle d'improvisation pour toute la famille"},{id:"event4",title:"Cabaret Surprise",date:"2026-01-20",description:"Cabaret avec des surprises et des performances uniques"},{id:"event5",title:"Impro Plage",date:"2026-03-10",description:"Improvisation en plein air avec vue sur la plage"}];function RR(t){Kt=t}async function PR(){if(Kt!=="firebase"||!(await st(Ke(_e,"seasons"))).empty)return;const e=Xe(Ke(_e,"seasons"));await pn(e,{name:"Malice 2025-2026",slug:"malice-2025-2026",createdAt:Cg()});const n=await st(Ke(_e,"players"));for(const o of n.docs)await pn(Xe(e,"players",o.id),o.data());const r=await st(Ke(_e,"events"));for(const o of r.docs)await pn(Xe(e,"events",o.id),o.data());const s=await st(Ke(_e,"availability"));for(const o of s.docs)await pn(Xe(e,"availability",o.id),o.data());const i=await st(Ke(_e,"selections"));for(const o of i.docs)await pn(Xe(e,"selections",o.id),o.data())}async function CR(){Kt==="firebase"&&await PR()}async function Af(t=null){return(Kt==="firebase"?t?(await st(Ke(_e,"seasons",t,"events"))).docs.map(n=>({id:n.id,...n.data()})):(await st(Ke(_e,"events"))).docs.map(n=>({id:n.id,...n.data()})):Zr).sort((n,r)=>{const s=new Date(n.date),i=new Date(r.date);return s<i?-1:s>i?1:n.title.localeCompare(r.title)})}async function Sf(t=null){return(Kt==="firebase"?t?(await st(Ke(_e,"seasons",t,"players"))).docs.map(n=>({id:n.id,...n.data()})):(await st(Ke(_e,"players"))).docs.map(n=>({id:n.id,...n.data()})):Xr).sort((n,r)=>n.order<r.order?-1:n.order>r.order?1:n.name.localeCompare(r.name))}async function xR(t,e=null){if(Kt==="firebase"){const n=Xe(e?Ke(_e,"seasons",e,"players"):Ke(_e,"players"));return await pn(n,{name:t}),n.id}else{const n=`p${Xr.length+1}`;return Xr.push({id:n,name:t}),n}}async function kR(t,e=null){if(Kt==="firebase"){const n=e?Xe(_e,"seasons",e,"players",t):Xe(_e,"players",t);await ha(n);const r=e?await st(Ke(_e,"seasons",e,"availability")):await st(Ke(_e,"availability")),s=xg(_e);r.forEach(i=>{const o=i.data();if(o[t]!==void 0){const l={...o};delete l[t],s.update(i.ref,l)}}),await s.commit()}else Xr=Xr.filter(n=>n.id!==t)}async function DR(t,e,n=null){if(Kt==="firebase"){const r=n?Xe(_e,"seasons",n,"players",t):Xe(_e,"players",t);await pn(r,{name:e})}else{const r=Xr.findIndex(s=>s.id===t);r!==-1&&(Xr[r]=e)}}async function Do(t,e,n=null){if(Kt==="firebase"){const r=n?await st(Ke(_e,"seasons",n,"availability")):await st(Ke(_e,"availability")),s={};return r.forEach(i=>{s[i.id]=i.data()}),s}else{const r={};return t.forEach(s=>{r[s.name]={},e.forEach(i=>{r[s.name][i.id]=void 0})}),e.forEach(s=>{const i=[...t].sort(()=>.5-Math.random());i.slice(0,4).forEach(o=>{r[o.name][s.id]=!0}),i.slice(4).forEach(o=>{const l=Math.random();r[o.name][s.id]=l<.4?!0:l<.8?!1:void 0})}),r}}async function No(t=null){if(Kt==="firebase"){const e=t?await st(Ke(_e,"seasons",t,"selections")):await st(Ke(_e,"selections")),n={};return e.forEach(r=>{n[r.id]=r.data().players||[]}),n}else return{}}async function Rf(t,e,n=null){if(Kt==="firebase"){const r=n?Xe(_e,"seasons",n,"availability",t):Xe(_e,"availability",t);await pn(r,e)}}async function NR(t,e,n=null){if(Kt==="firebase"){const r=n?Xe(_e,"seasons",n,"selections",t):Xe(_e,"selections",t);await pn(r,{players:e})}}async function VR(t,e=null){if(console.log("Suppression de l'événement:",t),Kt==="firebase")try{console.log("Suppression de l'événement dans Firestore");const n=e?Xe(_e,"seasons",e,"events",t):Xe(_e,"events",t);await ha(n),console.log("Suppression de la sélection associée");const r=e?Xe(_e,"seasons",e,"selections",t):Xe(_e,"selections",t);await ha(r),console.log("Suppression des disponibilités");const s=e?await st(Ke(_e,"seasons",e,"availability")):await st(Ke(_e,"availability")),i=xg(_e);s.forEach(o=>{const l=o.data();if(l[t]!==void 0){console.log("Mise à jour de la disponibilité pour:",o.id);const u={...l};delete u[t],i.update(o.ref,u)}}),await i.commit(),console.log("Opérations de suppression terminées avec succès")}catch(n){throw console.error("Erreur lors de la suppression:",n),n}else Zr=Zr.filter(n=>n.id!==t)}async function OR(t,e=null){if(Kt==="firebase"){const n=Xe(e?Ke(_e,"seasons",e,"events"):Ke(_e,"events"));return await pn(n,t),n.id}else{const n=`event${Zr.length+1}`;return Zr.push({id:n,...t}),n}}async function MR(t,e,n=null){if(Kt==="firebase"){const r=n?Xe(_e,"seasons",n,"events",t):Xe(_e,"events",t);await pn(r,e)}else{const r=Zr.findIndex(s=>s.id===t);r!==-1&&(Zr[r]={id:t,...e})}}const LR={class:"text-center mb-6"},FR={class:"text-3xl font-bold text-white mb-2"},UR={class:"mb-8"},jR={class:"grid grid-cols-2 gap-4"},$R={class:"bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30"},BR={class:"text-2xl font-bold text-white"},qR={class:"bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-lg border border-cyan-500/30"},zR={class:"text-2xl font-bold text-white"},HR={class:"mt-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30"},KR={class:"text-xl font-bold text-white"},WR={key:1,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[90] p-4"},GR={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},QR={class:"mb-6"},JR={__name:"PlayerModal",props:{show:{type:Boolean,default:!1},player:{type:Object,default:null},stats:{type:Object,default:()=>({availability:0,selection:0,ratio:0})}},emits:["close","update","delete"],setup(t,{emit:e}){const n=t,r=e,s=se(!1),i=se(""),o=se(null);function l(){r("close")}function u(){var g;i.value=((g=n.player)==null?void 0:g.name)||"",s.value=!0,xs(()=>{o.value&&o.value.focus()})}function h(){s.value=!1,i.value=""}function d(){var g;i.value.trim()&&(r("update",{playerId:(g=n.player)==null?void 0:g.id,newName:i.value.trim()}),s.value=!1,i.value="")}function p(){var g;r("delete",(g=n.player)==null?void 0:g.id)}return yr(()=>n.show,g=>{g||(s.value=!1,i.value="")}),(g,v)=>{var x;return ae(),ue(dt,null,[t.show?(ae(),ue("div",{key:0,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4",onClick:l},[_("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-2xl",onClick:v[0]||(v[0]=As(()=>{},["stop"]))},[_("div",LR,[v[2]||(v[2]=_("div",{class:"w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center"},[_("span",{class:"text-3xl"},"👤")],-1)),_("h2",FR,Me((x=t.player)==null?void 0:x.name),1),v[3]||(v[3]=_("p",{class:"text-xl text-purple-300"},"Détails du joueur",-1))]),_("div",UR,[v[7]||(v[7]=_("h3",{class:"text-lg font-semibold text-white mb-4"},"📊 Statistiques",-1)),_("div",jR,[_("div",$R,[_("div",BR,Me(n.stats.availability),1),v[4]||(v[4]=_("div",{class:"text-sm text-gray-300"},"Disponibilités",-1))]),_("div",qR,[_("div",zR,Me(n.stats.selection),1),v[5]||(v[5]=_("div",{class:"text-sm text-gray-300"},"Sélections",-1))])]),_("div",HR,[_("div",KR,Me(n.stats.ratio)+"%",1),v[6]||(v[6]=_("div",{class:"text-sm text-gray-300"},"Taux de sélection",-1))])]),_("div",{class:"flex justify-center space-x-3"},[_("button",{onClick:u,class:"px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center space-x-2"},v[8]||(v[8]=[_("span",null,"✏️",-1),_("span",null,"Modifier",-1)])),_("button",{onClick:p,class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center space-x-2"},v[9]||(v[9]=[_("span",null,"🗑️",-1),_("span",null,"Supprimer",-1)])),_("button",{onClick:l,class:"px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300"}," Fermer ")])])])):ut("",!0),s.value?(ae(),ue("div",WR,[_("div",GR,[v[11]||(v[11]=_("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✏️ Modifier le joueur",-1)),_("div",QR,[v[10]||(v[10]=_("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nom",-1)),Jt(_("input",{"onUpdate:modelValue":v[1]||(v[1]=D=>i.value=D),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",onKeydown:[In(h,["esc"]),In(d,["enter"])],ref_key:"editNameInput",ref:o},null,544),[[Yt,i.value]])]),_("div",{class:"flex justify-end space-x-3"},[_("button",{onClick:h,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),_("button",{onClick:d,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"}," Sauvegarder ")])])])):ut("",!0)],64)}}},YR={class:"text-center mb-6"},XR={class:"text-3xl font-bold text-white mb-2"},ZR={class:"text-xl text-purple-300"},eP={class:"mb-6"},tP={class:"grid grid-cols-3 gap-4"},nP={class:"bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30"},rP={class:"text-2xl font-bold text-white"},sP={class:"bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30"},iP={class:"text-2xl font-bold text-white"},oP={class:"bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-lg border border-cyan-500/30"},aP={class:"text-2xl font-bold text-white"},lP={key:0,class:"mb-6"},uP={class:"flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20"},cP={class:"flex-1"},hP={class:"text-blue-300 text-sm font-medium"},dP={key:1,class:"mb-6"},fP={class:"flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20"},pP={class:"flex-1"},mP={class:"text-yellow-200 text-sm"},gP={key:2,class:"mb-6"},_P={class:"grid grid-cols-2 md:grid-cols-3 gap-3 mb-4"},vP={class:"text-white font-medium"},yP={key:0,class:"text-purple-400 mr-2"},wP={key:1,class:"text-green-400 mr-2"},bP={key:2,class:"text-red-400 mr-2"},EP={key:3,class:"text-gray-400 mr-2"},TP={class:"mb-4"},IP={class:"relative"},AP=["value"],SP=["title"],RP={key:0,class:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},PP={key:1,class:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},CP={key:3,class:"mb-6"},xP={class:"text-center p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20"},kP={class:"text-4xl mb-4"},DP={class:"text-xl font-semibold text-white mb-2"},NP={class:"text-gray-300"},VP={class:"flex justify-center space-x-3"},OP=["disabled","title"],MP={__name:"SelectionModal",props:{show:{type:Boolean,default:!1},event:{type:Object,default:null},currentSelection:{type:Array,default:()=>[]},availableCount:{type:Number,default:0},selectedCount:{type:Number,default:0},playerAvailability:{type:Object,default:()=>({})}},emits:["close","selection","perfect"],setup(t,{expose:e,emit:n}){const r=t,s=n,i=se(!1),o=se("Copier le message"),l=se(!1),u=se(""),h=se(!1),d=Ht(()=>r.currentSelection&&r.currentSelection.length>0),p=Ht(()=>{var Le;if(!d.value)return!1;const y=r.currentSelection.some(ot=>!W(ot)),T=((Le=r.event)==null?void 0:Le.playerCount)||6,w=r.availableCount<T;return y||w}),g=Ht(()=>{var w;if(!p.value)return"";const y=r.currentSelection.filter(Le=>!W(Le)),T=((w=r.event)==null?void 0:w.playerCount)||6;return y.length>0?y.length===1?`${y[0]} n'est plus disponible. Veuillez relancer la sélection.`:`${y.length} joueurs ne sont plus disponibles. Veuillez relancer la sélection.`:r.availableCount<T?`Seulement ${r.availableCount} joueurs disponibles pour ${T} requis. Veuillez attendre plus de disponibilités ou ajuster le nombre de joueurs à sélectionner.`:"Sélection incomplète"}),v=Ht(()=>{if(!r.event||!d.value)return"";const y=x(r.event.date),T=r.currentSelection.join(", ");return`Sélection pour ${r.event.title} du ${y} : ${T}`});yr(()=>r.show,y=>{y&&(i.value=!1,o.value="Copier le message",l.value=!1,u.value="",h.value=!1)});function x(y){var w;return y?(typeof y=="string"?new Date(y):((w=y.toDate)==null?void 0:w.call(y))||y).toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"}):""}function D(){const y=v.value;navigator.clipboard.writeText(y).then(()=>{i.value=!0,o.value="Copié !",setTimeout(()=>{i.value=!1,o.value="Copier le message"},2e3)}).catch(T=>{console.error("Erreur lors de la copie du texte:",T),alert("Impossible de copier le message.")})}function N(){s("selection")}function j(){s("perfect")}function B(){s("close")}function W(y){return r.playerAvailability[y]===!0}function G(y){return r.playerAvailability[y]===!1}function fe(y){return r.currentSelection.includes(y)&&W(y)}function oe(){var T;const y=((T=r.event)==null?void 0:T.playerCount)||6;return r.availableCount===0||r.availableCount<y?"⚠️":"🎲"}function P(){var T;const y=((T=r.event)==null?void 0:T.playerCount)||6;return r.availableCount===0?"Aucun joueur disponible":r.availableCount<y?"Pas assez de joueurs disponibles":"Aucune sélection effectuée"}function E(){var T;const y=((T=r.event)==null?void 0:T.playerCount)||6;return r.availableCount===0?"Aucun joueur n'est disponible pour cet événement. Veuillez d'abord indiquer les disponibilités.":r.availableCount<y?`Seulement ${r.availableCount} joueurs disponibles pour ${y} requis. Veuillez attendre plus de disponibilités ou ajuster le nombre de joueurs à sélectionner.`:'Cliquez sur "Sélection Auto" pour lancer le tirage automatique des joueurs'}function I(y=!1){if(h.value=y,y){const T=x(r.event.date),w=r.currentSelection.join(", ");u.value=`Nouvelle sélection pour ${r.event.title} du ${T} : ${w}`}else u.value="Sélection effectuée avec succès !";l.value=!0,setTimeout(()=>{l.value=!1},8e3)}function S(){l.value=!1}return e({showSuccess:I}),(y,T)=>{var w,Le,ot;return t.show?(ae(),ue("div",{key:0,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4",onClick:B},[_("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-2xl",onClick:T[0]||(T[0]=As(()=>{},["stop"]))},[_("div",YR,[T[1]||(T[1]=_("div",{class:"w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center"},[_("span",{class:"text-3xl"},"🎭")],-1)),_("h2",XR,"Sélection pour "+Me((w=t.event)==null?void 0:w.title),1),_("p",ZR,Me(x((Le=t.event)==null?void 0:Le.date)),1)]),_("div",eP,[_("div",tP,[_("div",nP,[_("div",rP,Me(((ot=t.event)==null?void 0:ot.playerCount)||6),1),T[2]||(T[2]=_("div",{class:"text-sm text-gray-300"},"À sélectionner",-1))]),_("div",sP,[_("div",iP,Me(t.availableCount),1),T[3]||(T[3]=_("div",{class:"text-sm text-gray-300"},"Disponibles",-1))]),_("div",oP,[_("div",aP,Me(t.selectedCount),1),T[4]||(T[4]=_("div",{class:"text-sm text-gray-300"},"Sélectionnés",-1))])])]),l.value?(ae(),ue("div",lP,[_("div",uP,[T[6]||(T[6]=_("div",{class:"text-blue-400 text-xl"},"✨",-1)),_("div",cP,[_("p",hP,Me(u.value),1)]),_("button",{onClick:S,class:"text-blue-400 hover:text-blue-300 transition-colors",title:"Fermer le message"},T[5]||(T[5]=[_("svg",{class:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[_("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M6 18L18 6M6 6l12 12"})],-1)]))])])):ut("",!0),p.value?(ae(),ue("div",dP,[_("div",fP,[T[8]||(T[8]=_("div",{class:"text-yellow-400 text-xl"},"⚠️",-1)),_("div",pP,[T[7]||(T[7]=_("h3",{class:"text-yellow-300 text-sm font-semibold mb-1"},"Sélection incomplète",-1)),_("p",mP,Me(g.value),1)])])])):ut("",!0),d.value?(ae(),ue("div",gP,[T[12]||(T[12]=_("h3",{class:"text-lg font-semibold text-white mb-3"},"Joueurs sélectionnés :",-1)),_("div",_P,[(ae(!0),ue(dt,null,En(t.currentSelection,Oe=>(ae(),ue("div",{key:Oe,class:vr(["bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-3 rounded-lg border border-green-500/30 text-center",{"from-red-500/20 to-red-600/20 border-red-500/30":!W(Oe),"from-yellow-500/20 to-orange-500/20 border-yellow-500/30":G(Oe)}])},[_("span",vP,[fe(Oe)?(ae(),ue("span",yP,"🎭")):W(Oe)?(ae(),ue("span",wP,"✅")):G(Oe)?(ae(),ue("span",bP,"❌")):(ae(),ue("span",EP,"–")),Cp(" "+Me(Oe),1)])],2))),128))]),_("div",TP,[T[11]||(T[11]=_("h4",{class:"text-md font-semibold text-white mb-2"},"Message à envoyer :",-1)),_("div",IP,[_("textarea",{value:v.value,class:"w-full p-4 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none",rows:"3",readonly:""},null,8,AP),_("button",{onClick:D,class:"absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-2 hover:from-purple-600 hover:to-pink-700 transition-all duration-300",title:o.value},[i.value?(ae(),ue("svg",PP,T[10]||(T[10]=[_("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M5 13l4 4L19 7"},null,-1)]))):(ae(),ue("svg",RP,T[9]||(T[9]=[_("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"},null,-1)])))],8,SP)])])])):(ae(),ue("div",CP,[_("div",xP,[_("div",kP,Me(oe()),1),_("h3",DP,Me(P()),1),_("p",NP,Me(E()),1)])])),_("div",VP,[_("button",{onClick:N,disabled:t.availableCount===0,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed",title:t.availableCount===0?"Aucun joueur disponible":d.value?"Relancer la sélection automatique":"Lancer la sélection automatique"},T[13]||(T[13]=[_("span",null,"✨",-1),_("span",null,"Sélection Auto",-1)]),8,OP),d.value?(ae(),ue("button",{key:0,onClick:j,class:"px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center space-x-2"},T[14]||(T[14]=[_("span",null,"👍",-1),_("span",null,"Parfait",-1)]))):ut("",!0)])])])):ut("",!0)}}};const LP={class:"min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"},FP={class:"text-center py-8 px-4 relative"},UP={class:"text-4xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"},jP={class:"container mx-auto px-4 pb-16"},$P={class:"sticky top-0 z-50 backdrop-blur-sm bg-black/20 border border-white/20 rounded-t-2xl overflow-hidden"},BP={class:"border-collapse w-full table-fixed"},qP={class:"text-white"},zP={class:"p-4 text-left"},HP={class:"flex flex-col items-center space-y-2"},KP=["onClick"],WP={class:"flex flex-col gap-3"},GP={class:"flex flex-col items-center space-y-2"},QP={class:"font-bold text-lg text-center whitespace-pre-wrap relative group cursor-pointer"},JP=["title"],YP=["title","onClick"],XP=["title","onClick"],ZP={class:"bg-black/10"},eC={class:"overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/20 rounded-b-2xl"},tC={class:"table-auto border-collapse w-full table-fixed"},nC=["data-player-id"],rC={class:"p-4 font-medium text-white w-[100px] relative group text-lg"},sC={class:"font-bold text-lg whitespace-pre-wrap flex items-center justify-between"},iC=["onClick","title"],oC=["onClick"],aC={class:"flex items-center justify-center"},lC=["title"],uC=["title"],cC=["title"],hC=["title"],dC={key:0,class:"fixed bottom-4 left-4 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow-2xl border border-green-400/30 backdrop-blur-sm z-50"},fC={class:"flex items-center space-x-2"},pC={key:1,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"},mC={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},gC={class:"mb-6"},_C={class:"mb-6"},vC={class:"mb-6"},yC={class:"mb-6"},wC={key:2,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"},bC={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},EC={class:"mb-6"},TC={class:"flex justify-end space-x-3"},IC={key:3,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"},AC={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},SC={class:"flex justify-end space-x-3"},RC={key:4,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"},PC={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},CC={class:"flex justify-end space-x-3"},xC={key:5,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[95] p-4"},kC={class:"text-center mb-6"},DC={class:"text-3xl font-bold text-white mb-2"},NC={class:"text-xl text-purple-300"},VC={key:0,class:"mb-6"},OC={class:"text-gray-300 bg-gray-800/50 p-4 rounded-lg border border-gray-600/50"},MC={class:"mb-6"},LC={class:"grid grid-cols-3 gap-4"},FC={class:"bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-4 rounded-lg border border-purple-500/30"},UC={class:"text-2xl font-bold text-white"},jC={class:"bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-lg border border-cyan-500/30"},$C={class:"text-2xl font-bold text-white"},BC={class:"bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-4 rounded-lg border border-green-500/30"},qC={class:"text-2xl font-bold text-white"},zC={class:"flex justify-center space-x-3"},HC={key:7,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[90] p-4"},KC={class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},WC={class:"mb-6"},GC={class:"mb-6"},QC={class:"mb-6"},JC={class:"mb-6"},YC={__name:"GridBoard",props:{slug:{type:String,required:!0}},setup(t){const e=t,n=Wp();e.slug;const r=se(""),s=se(""),i=se(!1),o=se(null),l=se(null),u=se(""),h=se(""),d=se(6),p=se(!1),g=se(""),v=se(null),x=se(!1),D=se(null),N=se(!1),j=se(null),B=se(!1),W=se(null),G=se(""),fe=se(!1),oe=se(null),P=se(""),E=se(!1),I=se(null),S=se(null);function y(V){v.value=V;const R=document.querySelector(`[data-player-id="${V}"]`);R&&R.scrollIntoView({behavior:"smooth",block:"center"}),T.value=!0,w.value="Nouveau joueur ajouté !",setTimeout(()=>{T.value=!1},3e3)}const T=se(!1),w=se("");async function Le(V){await nr({type:"deleteEvent",data:{eventId:V}})}async function ot(V=null){const R=V||o.value;if(console.log("deleteEventConfirmed - eventId param:",V),console.log("deleteEventConfirmed - eventToDelete.value:",o.value),console.log("deleteEventConfirmed - eventIdToDelete:",R),console.log("deleteEventConfirmed - type de eventIdToDelete:",typeof R),!R){console.error("Aucun événement à supprimer");return}try{await VR(R,s.value),H.value=H.value.filter($=>$.id!==R),await Promise.all([Af(s.value),Do(Y.value,H.value,s.value),No(s.value)]).then(([$,Ie,ge])=>{H.value=$,pe.value=Ie,Ee.value=ge}),i.value=!1,o.value=null,T.value=!0,w.value="Événement supprimé avec succès !",setTimeout(()=>{T.value=!1},3e3)}catch($){console.error("Erreur lors de la suppression de l'événement:",$),alert("Erreur lors de la suppression de l'événement. Veuillez réessayer.")}}function Oe(){i.value=!1,o.value=null}async function Ce(){if(!l.value||!u.value.trim()||!h.value)return;const V=parseInt(d.value);if(isNaN(V)||V<1||V>20){alert("Le nombre de joueurs doit être un nombre entier entre 1 et 20");return}try{const R={title:u.value.trim(),date:h.value,description:P.value.trim()||"",playerCount:V};await MR(l.value,R,s.value),await Promise.all([Af(s.value),Do(Y.value,H.value,s.value),No(s.value)]).then(([$,Ie,ge])=>{H.value=$,pe.value=Ie,Ee.value=ge}),l.value=null,u.value="",h.value="",P.value="",d.value=6,T.value=!0,w.value="Événement mis à jour avec succès !",setTimeout(()=>{T.value=!1},3e3)}catch(R){console.error("Erreur lors de l'édition de l'événement:",R),alert("Erreur lors de l'édition de l'événement. Veuillez réessayer.")}}async function xe(){if(g.value.trim())try{const V=g.value.trim(),R=await xR(V,s.value);await Promise.all([Sf(s.value),Do(Y.value,H.value,s.value),No(s.value)]).then(([$,Ie,ge])=>{Y.value=$,pe.value=Ie,Ee.value=ge;const Pe=Y.value.find(Fe=>Fe.id===R);y(R);const ve=document.querySelector(`[data-player-id="${R}"]`);ve&&ve.scrollIntoView({behavior:"smooth",block:"center"}),T.value=!0,w.value="Joueur ajouté avec succès ! Vous pouvez maintenant indiquer sa disponibilité.",setTimeout(()=>{T.value=!1},3e3),setTimeout(()=>{T.value=!1,w.value=""},5e3)}),p.value=!1,g.value=""}catch(V){console.error("Erreur lors de l'ajout du joueur:",V),alert("Erreur lors de l'ajout du joueur. Veuillez réessayer.")}}function gt(){l.value=null,u.value="",h.value="",P.value="",d.value=6}se(null);const kt=se(!1),_t=se(""),$e=se(""),He=se(""),Wt=se(6);async function ln(){if(!_t.value.trim()||!$e.value){alert("Veuillez remplir le titre et la date de l'événement");return}const V=parseInt(Wt.value);if(isNaN(V)||V<1||V>20){alert("Le nombre de joueurs doit être un nombre entier entre 1 et 20");return}const R={title:_t.value.trim(),date:$e.value,description:He.value.trim()||"",playerCount:V};await Dt(R)}async function Dt(V){try{const R=await OR(V,s.value);H.value=[...H.value,{id:R,...V}];const $={};for(const Ie of Y.value)$[Ie.name]=pe.value[Ie.name]||{},$[Ie.name][R]=null,await Rf(Ie.name,$[Ie.name],s.value);_t.value="",$e.value="",He.value="",Wt.value=6,kt.value=!1,await Promise.resolve(),T.value=!0,w.value="Événement créé avec succès !",setTimeout(()=>{T.value=!1},3e3)}catch(R){console.error("Erreur lors de la création de l'événement:",R),alert("Erreur lors de la création de l'événement. Veuillez réessayer.")}}function L(){_t.value="",$e.value="",He.value="",Wt.value=6,kt.value=!1}async function te(){await nr({type:"addEvent",data:{}})}const H=se([]),Y=se([]),pe=se({}),Ee=se({}),b=se({}),A=se({});qu(async()=>{RR("firebase"),await CR();const V=Ag(Ke(_e,"seasons"),DI("slug","==",e.slug)),R=await st(V);if(!R.empty){const $=R.docs[0];s.value=$.id,r.value=$.data().name,document.title=`Saison : ${r.value}`}if(s.value){const $=await st(Ke(_e,"seasons",s.value,"players"));Y.value=$.docs.map(Je=>({id:Je.id,...Je.data()}));const Ie=await st(Ke(_e,"seasons",s.value,"events"));H.value=Ie.docs.map(Je=>({id:Je.id,...Je.data(),playerCount:Je.data().playerCount||6}));const ge=await st(Ke(_e,"seasons",s.value,"availability")),Pe={};ge.docs.forEach(Je=>{Pe[Je.id]=Je.data()}),pe.value=Pe;const ve=await st(Ke(_e,"seasons",s.value,"selections")),Fe={};ve.docs.forEach(Je=>{Fe[Je.id]=Je.data().players||[]}),Ee.value=Fe}Te(),ke(),console.log("players (deduplicated):",Y.value.map($=>({id:$.id,name:$.name})))});function k(V,R){const $=Y.value.find(ve=>ve.name===V);if(!$){console.error("Joueur non trouvé:",V);return}if(!H.value.find(ve=>ve.id===R)){console.error("Événement non trouvé:",R);return}$.availabilities||($.availabilities={});const ge=$.availabilities[R];let Pe;ge==="oui"?(Pe="non",$.availabilities[R]=Pe):ge==="non"?(delete $.availabilities[R],Pe=void 0):(Pe="oui",$.availabilities[R]=Pe),Pe===void 0?pe.value[$.name]&&delete pe.value[$.name][R]:(pe.value[$.name]||(pe.value[$.name]={}),pe.value[$.name][R]=Pe==="oui"),Rf($.name,{...$.availabilities},s.value).then(()=>{T.value=!0,w.value="Disponibilité mise à jour avec succès !",setTimeout(()=>{T.value=!1},3e3)}).catch(ve=>{console.error("Erreur lors de la mise à jour de la disponibilité:",ve),alert("Erreur lors de la mise à jour de la disponibilité. Veuillez réessayer.")})}function U(V,R){var $;return($=pe.value[V])==null?void 0:$[R]}function M(V,R){var ge;const $=Ee.value[R]||[],Ie=(ge=pe.value[V])==null?void 0:ge[R];return $.includes(V)&&Ie===!0}async function z(V,R=6){const Ie=Y.value.filter(ve=>U(ve.name,V)).map(ve=>{const Fe=q(ve.name);return{name:ve.name,weight:1/(1+Fe)}}),ge=[],Pe=[...Ie];for(;ge.length<R&&Pe.length>0;){const ve=Pe.reduce((un,dn)=>un+dn.weight,0);let Fe=Math.random()*ve;const Je=Pe.findIndex(un=>(Fe-=un.weight,Fe<=0));Je>=0&&(ge.push(Pe[Je].name),Pe.splice(Je,1))}Ee.value[V]=ge,await NR(V,ge,s.value),Te(),ke()}async function ee(V,R=6){var Pe,ve,Fe,Je,un;console.log("tirerProtected appelé avec eventId:",V),console.log("showSelectionModal.value AVANT:",E.value),console.log("selectionModalEvent.value?.id AVANT:",(Pe=I.value)==null?void 0:Pe.id);const $=E.value,Ie=(ve=I.value)==null?void 0:ve.id,ge=Ee.value[V]&&Ee.value[V].length>0;await z(V,R),console.log("showSelectionModal.value APRÈS tirage:",E.value),console.log("selectionModalEvent.value?.id APRÈS tirage:",(Fe=I.value)==null?void 0:Fe.id),$&&!E.value&&(console.log("Restauration de la popin de sélection..."),E.value=!0,I.value=H.value.find(dn=>dn.id===Ie)),E.value&&((Je=I.value)==null?void 0:Je.id)===V?(console.log("Popin de sélection ouverte, mise à jour..."),await xs(),S.value&&S.value.showSuccess?(console.log("Appel de showSuccess sur la popin de sélection"),S.value.showSuccess(ge)):(console.log("selectionModalRef.value:",S.value),console.log("showSuccess disponible:",(un=S.value)==null?void 0:un.showSuccess))):(console.log("Popin de sélection fermée, affichage message global"),T.value=!0,H.value.find(dn=>dn.id===V),Ee.value[V],ge?w.value="Nouvelle sélection effectuée avec succès !":w.value="Sélection effectuée avec succès !",setTimeout(()=>{T.value=!1},3e3))}function J(V){var $;return V?(typeof V=="string"?new Date(V):(($=V.toDate)==null?void 0:$.call(V))||V).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}):""}function Q(V){var $;return V?(typeof V=="string"?new Date(V):(($=V.toDate)==null?void 0:$.call(V))||V).toLocaleDateString("fr-FR",{weekday:"long",year:"numeric",month:"long",day:"numeric"}):""}function q(V){return Object.values(Ee.value).filter(R=>R.includes(V)).length}function le(V){const R=pe.value[V]||{};return Object.values(R).filter($=>$===!0).length}function X(V){return V?Object.values(pe.value).filter(R=>R[V]===!0).length:0}function re(V){return V?(Ee.value[V]||[]).length:0}function me(V){const R=le(V),$=q(V);return R===0?0:$/R}function de(V){b.value[V]={availability:le(V),selection:q(V),ratio:me(V)}}function Te(){Y.value.forEach(V=>de(V.name))}function ke(){const V={};H.value.forEach(R=>{const $=R.playerCount||6,ge=Y.value.filter(ve=>U(ve.name,R.id)===!0).map(ve=>{const Fe=q(ve.name);return{name:ve.name,weight:1/(1+Fe)}}),Pe=ge.reduce((ve,Fe)=>ve+Fe.weight,0);ge.forEach(ve=>{const Fe=Math.min(1,ve.weight/Pe*$);V[ve.name]||(V[ve.name]={}),V[ve.name][R.id]=Math.round(Fe*100)})}),A.value=V}function at(V,R){var ve,Fe;const $=V.name,Ie=U($,R),ge=M($,R),Pe=((Fe=(ve=A.value)==null?void 0:ve[$])==null?void 0:Fe[R])??0;return Ie===!1?"Non disponible – cliquez pour changer":ge?`Sélectionné · Chance estimée : ${Pe}%`:Ie===!0?`Disponible · Chance estimée : ${Pe}%`:"Cliquez pour indiquer votre disponibilité"}const tt=se(null),wt=se(!1);async function ct(V=null){const R=V||tt.value;if(!R){console.error("Aucun joueur à supprimer");return}try{await kR(R,s.value),Y.value=Y.value.filter($=>$.id!==R),wt.value=!1,tt.value=null,T.value=!0,w.value="Joueur supprimé avec succès !",setTimeout(()=>{T.value=!1},3e3)}catch($){console.error("Erreur lors de la suppression du joueur :",$),alert("Erreur lors de la suppression du joueur. Veuillez réessayer.")}}function yn(){wt.value=!1,tt.value=null}async function Vr(V){rr(),await nr({type:"deletePlayer",data:{playerId:V}})}async function vt(){if(D.value){const V=H.value.find($=>$.id===D.value),R=(V==null?void 0:V.playerCount)||6;await ee(D.value,R),x.value=!1,D.value=null}}function Gt(){x.value=!1,D.value=null}function ss(){return W.value?{deleteEvent:"Suppression d'événement - Code PIN requis",addEvent:"Ajout d'événement - Code PIN requis",deletePlayer:"Suppression de joueur - Code PIN requis",launchSelection:"Lancement de sélection - Code PIN requis"}[W.value.type]||"Code PIN requis":"Veuillez saisir le code PIN à 4 chiffres"}async function nr(V){if(Xt.isPinCached(s.value)){const R=Xt.getCachedPin(s.value);if(console.log("PIN en cache trouvé, utilisation automatique"),await _a(s.value,R)){await is(V);return}else Xt.clearSession()}W.value=V,B.value=!0}async function io(V){try{if(await _a(s.value,V)){Xt.saveSession(s.value,V),B.value=!1;const $=W.value;W.value=null,await is($)}else G.value="Code PIN incorrect",setTimeout(()=>{G.value=""},3e3)}catch(R){console.error("Erreur lors de la vérification du PIN:",R),G.value="Erreur lors de la vérification du code PIN"}}function oo(){B.value=!1,W.value=null,G.value=""}function Or(){return Xt.isPinCached(s.value)?{timeRemaining:Xt.getTimeRemaining(),isExpiringSoon:Xt.isExpiringSoon()}:null}async function is(V){if(!V)return;const{type:R,data:$}=V;try{switch(R){case"deleteEvent":console.log("executePendingOperation - data.eventId:",$.eventId),console.log("executePendingOperation - type de data.eventId:",typeof $.eventId),o.value=$.eventId,i.value=!0;break;case"addEvent":kt.value=!0;break;case"deletePlayer":tt.value=$.playerId,wt.value=!0;break;case"launchSelection":Ee.value[$.eventId]&&Ee.value[$.eventId].length>0?(D.value=$.eventId,x.value=!0,fe.value=!1):(await ee($.eventId,$.count),fe.value=!1);break}}catch(Ie){console.error("Erreur lors de l'exécution de l'opération:",Ie),T.value=!0,w.value="Erreur lors de l'opération. Veuillez réessayer.",setTimeout(()=>{T.value=!1},3e3)}}function Gs(){n.push("/")}function Nn(V){oe.value=V,P.value=V.description||"",fe.value=!0}function ao(){fe.value=!1,oe.value=null,P.value=""}function os(){l.value=oe.value.id,u.value=oe.value.title,h.value=oe.value.date,P.value=oe.value.description||"",d.value=oe.value.playerCount||6,fe.value=!1}function lo(V){j.value=V,N.value=!0}function rr(){N.value=!1,j.value=null}async function uo({playerId:V,newName:R}){try{await DR(V,R,s.value),await Promise.all([Sf(s.value),Do(Y.value,H.value,s.value),No(s.value)]).then(([$,Ie,ge])=>{if(Y.value=$,pe.value=Ie,Ee.value=ge,j.value&&j.value.id===V){const Pe=$.find(ve=>ve.id===V);Pe&&(j.value=Pe)}}),T.value=!0,w.value="Joueur mis à jour avec succès !",setTimeout(()=>{T.value=!1},3e3)}catch($){console.error("Erreur lors de l'édition du joueur:",$),alert("Erreur lors de l'édition du joueur. Veuillez réessayer.")}}function It(V){if(!V)return{availability:0,selection:0,ratio:0};const R=le(V.name),$=q(V.name),Ie=R===0?0:Math.round($/R*100);return{availability:R,selection:$,ratio:Ie}}function as(V){const R=Ee.value[V]||[],$=H.value.find(Pe=>Pe.id===V),Ie=($==null?void 0:$.playerCount)||6,ge=X(V);if(R.length>0){const Pe=R.some(Fe=>!U(Fe,V)),ve=ge<Ie;if(Pe||ve)return{type:"incomplete",hasUnavailablePlayers:Pe,hasInsufficientPlayers:ve,unavailablePlayers:R.filter(Fe=>!U(Fe,V)),availableCount:ge,requiredCount:Ie}}return ge<Ie?{type:"insufficient",availableCount:ge,requiredCount:Ie}:R.length===0?{type:"ready",availableCount:ge,requiredCount:Ie}:{type:"complete",availableCount:ge,requiredCount:Ie}}function Mr(V){const R=as(V);return R.type==="incomplete"||R.type==="insufficient"}function sr(V){const R=as(V);switch(R.type){case"incomplete":return R.hasUnavailablePlayers?R.unavailablePlayers.length===1?`Sélection incomplète : ${R.unavailablePlayers[0]} n'est plus disponible`:`Sélection incomplète : ${R.unavailablePlayers.length} joueurs ne sont plus disponibles`:`Sélection incomplète : ${R.availableCount} joueurs disponibles pour ${R.requiredCount} requis`;case"insufficient":return`Pas assez de joueurs : ${R.availableCount} disponibles pour ${R.requiredCount} requis`;case"ready":return`Prêt pour la sélection : ${R.availableCount} joueurs disponibles`;case"complete":return`Sélection complète : ${R.availableCount} joueurs disponibles`;default:return""}}function sl(V){if(!V)return{};const R={};return Y.value.forEach($=>{R[$.name]=U($.name,V)}),R}function Qs(V){I.value=V,E.value=!0}function Vn(){E.value=!1,I.value=null}async function il(){if(!I.value)return;const V=I.value.id,R=I.value.playerCount||6;if(X(V)===0){T.value=!0,w.value="Aucun joueur disponible pour cet événement",setTimeout(()=>{T.value=!1},3e3);return}await nr({type:"launchSelection",data:{eventId:V,count:R}})}function ol(){Vn(),T.value=!0,w.value="Sélection validée !",setTimeout(()=>{T.value=!1},3e3)}return(V,R)=>{var $,Ie,ge,Pe,ve,Fe,Je,un,dn,co;return ae(),ue(dt,null,[_("div",LP,[_("div",FP,[_("button",{onClick:Gs,class:"absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-purple-300 transition-colors duration-200 p-2 rounded-full hover:bg-white/10",title:"Retour à l'accueil"},R[16]||(R[16]=[_("svg",{class:"w-8 h-8",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24"},[_("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M15 19l-7-7 7-7"})],-1)])),_("h1",UP,Me(r.value?r.value:"Chargement..."),1),R[17]||(R[17]=_("p",{class:"text-gray-300"},"Gestion des sélections et disponibilités",-1))]),_("div",jP,[_("div",$P,[_("table",BP,[_("colgroup",null,[R[18]||(R[18]=_("col",{style:{width:"15%"}},null,-1)),(ae(!0),ue(dt,null,En(H.value,(ce,rt)=>(ae(),ue("col",{key:rt,style:Ri("width: calc(80% / "+H.value.length+");")},null,4))),128)),R[19]||(R[19]=_("col",{style:{width:"5%"}},null,-1))]),_("thead",null,[_("tr",qP,[_("th",zP,[_("div",HP,[R[21]||(R[21]=_("span",{class:"font-bold text-lg relative group"},[_("span",{class:"border-b-2 border-dashed border-purple-400"}," Joueurs ")],-1)),_("button",{onClick:R[0]||(R[0]=ce=>p.value=!0),class:"flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer text-sm font-medium",title:"Ajouter un nouveau joueur"},R[20]||(R[20]=[_("span",{class:"text-lg"},"➕",-1),_("span",null,"S'ajouter",-1)]))])]),(ae(!0),ue(dt,null,En(H.value,ce=>(ae(),ue("th",{key:ce.id,class:"p-4 text-center",onClick:rt=>Nn(ce)},[_("div",WP,[_("div",GP,[_("div",QP,[_("span",{class:"hover:border-b-2 hover:border-dashed hover:border-purple-400 transition-colors duration-200 text-white",title:"Cliquez pour voir les détails : "+ce.title},Me(J(ce.date)),9,JP)]),Mr(ce.id)?(ae(),ue("div",{key:0,class:"w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-400 transition-colors duration-200",title:sr(ce.id)+" - Cliquez pour ouvrir la sélection",onClick:As(rt=>Qs(ce),["stop"])},R[22]||(R[22]=[_("span",{class:"text-xs text-white font-bold"},"⚠️",-1)]),8,YP)):as(ce.id).type==="ready"?(ae(),ue("div",{key:1,class:"w-4 h-4 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-400 transition-colors duration-200",title:sr(ce.id)+" - Cliquez pour ouvrir la sélection",onClick:As(rt=>Qs(ce),["stop"])},R[23]||(R[23]=[_("span",{class:"text-xs text-white font-bold"},"🎲",-1)]),8,XP)):ut("",!0)])])],8,KP))),128)),_("th",{class:"p-4 text-center"},[_("button",{onClick:te,class:"text-2xl text-purple-400 hover:text-pink-400 hover:scale-110 transition-all duration-200",title:"Ajouter un nouvel événement"}," ✨ ")])]),_("tr",ZP,[R[24]||(R[24]=_("th",{class:"p-4 text-left w-[100px]"},null,-1)),(ae(!0),ue(dt,null,En(H.value,ce=>(ae(),ue("th",{key:ce.id,class:"p-4 text-center w-40"}))),128)),R[25]||(R[25]=_("th",{class:"p-4"},null,-1))])])])]),_("div",eC,[_("table",tC,[_("colgroup",null,[R[26]||(R[26]=_("col",{style:{width:"15%"}},null,-1)),(ae(!0),ue(dt,null,En(H.value,(ce,rt)=>(ae(),ue("col",{key:rt,style:Ri("width: calc(80% / "+H.value.length+");")},null,4))),128)),R[27]||(R[27]=_("col",{style:{width:"5%"}},null,-1))]),_("tbody",null,[(ae(!0),ue(dt,null,En(Y.value,ce=>(ae(),ue("tr",{key:ce.id,class:vr(["border-b border-white/10 hover:bg-white/5 transition-all duration-200",{"highlighted-player":ce.id===v.value}]),"data-player-id":ce.id},[_("td",rC,[_("div",sC,[_("span",{onClick:rt=>lo(ce),class:"hover:border-b-2 hover:border-dashed hover:border-purple-400 cursor-pointer transition-colors duration-200",title:"Cliquez pour voir les détails : "+ce.name},Me(ce.name),9,iC)])]),(ae(!0),ue(dt,null,En(H.value,rt=>(ae(),ue("td",{key:rt.id,class:"p-4 text-center cursor-pointer hover:bg-white/10 transition-all duration-200",onClick:ho=>k(ce.name,rt.id)},[_("div",aC,[M(ce.name,rt.id)?(ae(),ue("span",{key:0,class:"text-2xl hover:scale-110 transition-transform duration-200",title:at(ce,rt.id)}," 🎭 ",8,lC)):U(ce.name,rt.id)?(ae(),ue("span",{key:1,class:"text-2xl hover:scale-110 transition-transform duration-200",title:at(ce,rt.id)}," ✅ ",8,uC)):U(ce.name,rt.id)===!1?(ae(),ue("span",{key:2,class:"text-2xl hover:scale-110 transition-transform duration-200",title:at(ce,rt.id)}," ❌ ",8,cC)):(ae(),ue("span",{key:3,class:"text-gray-500 hover:text-white transition-colors duration-200",title:at(ce,rt.id)}," – ",8,hC))])],8,oC))),128)),R[28]||(R[28]=_("td",{class:"p-4"},null,-1))],10,nC))),128))])])])])]),T.value?(ae(),ue("div",dC,[_("div",fC,[R[29]||(R[29]=_("span",{class:"text-xl"},"✨",-1)),_("span",null,Me(w.value),1)])])):ut("",!0),kt.value?(ae(),ue("div",pC,[_("div",mC,[R[34]||(R[34]=_("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✨ Nouvel événement",-1)),_("div",gC,[R[30]||(R[30]=_("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Titre",-1)),Jt(_("input",{"onUpdate:modelValue":R[1]||(R[1]=ce=>_t.value=ce),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Titre de l'événement"},null,512),[[Yt,_t.value]])]),_("div",_C,[R[31]||(R[31]=_("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Date",-1)),Jt(_("input",{"onUpdate:modelValue":R[2]||(R[2]=ce=>$e.value=ce),type:"date",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"},null,512),[[Yt,$e.value]])]),_("div",vC,[R[32]||(R[32]=_("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Description",-1)),Jt(_("textarea",{"onUpdate:modelValue":R[3]||(R[3]=ce=>He.value=ce),class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",rows:"3",placeholder:"Description de l'événement (optionnel)"},null,512),[[Yt,He.value]])]),_("div",yC,[R[33]||(R[33]=_("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nombre de joueurs à sélectionner",-1)),Jt(_("input",{"onUpdate:modelValue":R[4]||(R[4]=ce=>Wt.value=ce),type:"number",min:"1",max:"20",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white",placeholder:"6"},null,512),[[Yt,Wt.value]])]),_("div",{class:"flex justify-end space-x-3"},[_("button",{onClick:L,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),_("button",{onClick:ln,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"}," Créer ")])])])):ut("",!0),p.value?(ae(),ue("div",wC,[_("div",bC,[R[36]||(R[36]=_("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✨ Nouveau joueur",-1)),_("div",EC,[R[35]||(R[35]=_("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nom",-1)),Jt(_("input",{"onUpdate:modelValue":R[5]||(R[5]=ce=>g.value=ce),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",placeholder:"Nom du joueur"},null,512),[[Yt,g.value]])]),_("div",TC,[_("button",{onClick:R[6]||(R[6]=ce=>p.value=!1),class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),_("button",{onClick:xe,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"}," Ajouter ")])])])):ut("",!0),i.value?(ae(),ue("div",IC,[_("div",AC,[R[37]||(R[37]=Tl('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">⚠️</span></div><h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2><p class="text-gray-300">Êtes-vous sûr de vouloir supprimer cet événement ?</p></div>',1)),_("div",SC,[_("button",{onClick:Oe,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),_("button",{onClick:R[7]||(R[7]=()=>ot()),class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"}," Supprimer ")])])])):ut("",!0),wt.value?(ae(),ue("div",RC,[_("div",PC,[R[38]||(R[38]=Tl('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">⚠️</span></div><h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2><p class="text-gray-300">Êtes-vous sûr de vouloir supprimer ce joueur ?</p></div>',1)),_("div",CC,[_("button",{onClick:yn,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"},"Annuler"),_("button",{onClick:R[8]||(R[8]=()=>ct()),class:"px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300"},"Supprimer")])])])):ut("",!0),x.value?(ae(),ue("div",xC,[_("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md"},[R[39]||(R[39]=Tl('<div class="text-center mb-6"><div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center"><span class="text-2xl">🎭</span></div><h2 class="text-2xl font-bold text-white mb-2">Confirmation</h2><p class="text-gray-300">Attention, toute la sélection sera refaite en fonction des disponibilités actuelles.</p></div><p class="mb-6 text-sm text-yellow-400 bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/20"> ⚠️ Pensez à prévenir les gens du changement ! </p>',2)),_("div",{class:"flex justify-end space-x-3"},[_("button",{onClick:Gt,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"},"Annuler"),_("button",{onClick:vt,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"},"Confirmer")])])])):ut("",!0),fe.value?(ae(),ue("div",{key:6,class:"fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[80] p-4",onClick:ao},[_("div",{class:"bg-gradient-to-br from-gray-900 to-gray-800 border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-2xl",onClick:R[11]||(R[11]=As(()=>{},["stop"]))},[_("div",kC,[R[40]||(R[40]=_("div",{class:"w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center"},[_("span",{class:"text-3xl"},"🎭")],-1)),_("h2",DC,Me(($=oe.value)==null?void 0:$.title),1),_("p",NC,Me(Q((Ie=oe.value)==null?void 0:Ie.date)),1)]),(ge=oe.value)!=null&&ge.description?(ae(),ue("div",VC,[R[41]||(R[41]=_("h3",{class:"text-lg font-semibold text-white mb-3"},"Description",-1)),_("p",OC,Me(oe.value.description),1)])):ut("",!0),_("div",MC,[R[45]||(R[45]=_("h3",{class:"text-lg font-semibold text-white mb-3"},"Statistiques",-1)),_("div",LC,[_("div",FC,[_("div",UC,Me(X((Pe=oe.value)==null?void 0:Pe.id)),1),R[42]||(R[42]=_("div",{class:"text-sm text-gray-300"},"Disponibles",-1))]),_("div",jC,[_("div",$C,Me(re((ve=oe.value)==null?void 0:ve.id)),1),R[43]||(R[43]=_("div",{class:"text-sm text-gray-300"},"Sélectionnés",-1))]),_("div",BC,[_("div",qC,Me(((Fe=oe.value)==null?void 0:Fe.playerCount)||6),1),R[44]||(R[44]=_("div",{class:"text-sm text-gray-300"},"À sélectionner",-1))])])]),_("div",zC,[_("button",{onClick:os,class:"px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 flex items-center space-x-2"},R[46]||(R[46]=[_("span",null,"✏️",-1),_("span",null,"Modifier",-1)])),_("button",{onClick:R[9]||(R[9]=ce=>Qs(oe.value)),class:"px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2",title:"Gérer la sélection"},R[47]||(R[47]=[_("span",null,"🎭",-1),_("span",null,"Sélection",-1)])),_("button",{onClick:R[10]||(R[10]=ce=>{var rt;return Le((rt=oe.value)==null?void 0:rt.id)}),class:"px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center space-x-2"},R[48]||(R[48]=[_("span",null,"🗑️",-1),_("span",null,"Supprimer",-1)]))])])])):ut("",!0),l.value?(ae(),ue("div",HC,[_("div",KC,[R[53]||(R[53]=_("h2",{class:"text-2xl font-bold mb-6 text-white text-center"},"✏️ Modifier l'événement",-1)),_("div",WC,[R[49]||(R[49]=_("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Titre",-1)),Jt(_("input",{"onUpdate:modelValue":R[12]||(R[12]=ce=>u.value=ce),type:"text",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",onKeydown:[In(gt,["esc"]),In(Ce,["enter"])],ref:"editTitleInput"},null,544),[[Yt,u.value]])]),_("div",GC,[R[50]||(R[50]=_("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Date",-1)),Jt(_("input",{"onUpdate:modelValue":R[13]||(R[13]=ce=>h.value=ce),type:"date",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white",onKeydown:[In(gt,["esc"]),In(Ce,["enter"])]},null,544),[[Yt,h.value]])]),_("div",QC,[R[51]||(R[51]=_("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Description",-1)),Jt(_("textarea",{"onUpdate:modelValue":R[14]||(R[14]=ce=>P.value=ce),class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400",rows:"3",placeholder:"Description de l'événement (optionnel)",onKeydown:In(gt,["esc"])},null,544),[[Yt,P.value]])]),_("div",JC,[R[52]||(R[52]=_("label",{class:"block text-sm font-medium text-gray-300 mb-2"},"Nombre de joueurs à sélectionner",-1)),Jt(_("input",{"onUpdate:modelValue":R[15]||(R[15]=ce=>d.value=ce),type:"number",min:"1",max:"20",class:"w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white",onKeydown:In(gt,["esc"])},null,544),[[Yt,d.value]])]),_("div",{class:"flex justify-end space-x-3"},[_("button",{onClick:gt,class:"px-6 py-3 text-gray-300 hover:text-white transition-colors"}," Annuler "),_("button",{onClick:Ce,class:"px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300"}," Sauvegarder ")])])])):ut("",!0),Et(h_,{show:B.value,message:ss(),error:G.value,"session-info":Or(),onSubmit:io,onCancel:oo},null,8,["show","message","error","session-info"]),Et(JR,{show:N.value,player:j.value,stats:It(j.value),onClose:rr,onUpdate:uo,onDelete:Vr},null,8,["show","player","stats"]),Et(MP,{ref_key:"selectionModalRef",ref:S,show:E.value,event:I.value,"current-selection":Ee.value[(Je=I.value)==null?void 0:Je.id]||[],"available-count":X((un=I.value)==null?void 0:un.id),"selected-count":re((dn=I.value)==null?void 0:dn.id),"player-availability":sl((co=I.value)==null?void 0:co.id),onClose:Vn,onSelection:il,onPerfect:ol},null,8,["show","event","current-selection","available-count","selected-count","player-availability"])],64)}}},XC=[{path:"/",component:SR},{path:"/season/:slug",component:YC,props:!0}],ZC=Z0({history:P0("/impro-selector/"),routes:XC});Gy(Yy).use(ZC).mount("#app");
