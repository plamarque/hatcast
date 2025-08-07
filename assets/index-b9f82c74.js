(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(s){if(s.ep)return;s.ep=!0;const i=n(s);fetch(s.href,i)}})();/**
* @vue/shared v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**//*! #__NO_SIDE_EFFECTS__ */function sc(t){const e=Object.create(null);for(const n of t.split(","))e[n]=1;return n=>n in e}const He={},Gr=[],Xt=()=>{},p_=()=>!1,Ko=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&(t.charCodeAt(2)>122||t.charCodeAt(2)<97),ic=t=>t.startsWith("onUpdate:"),ct=Object.assign,oc=(t,e)=>{const n=t.indexOf(e);n>-1&&t.splice(n,1)},m_=Object.prototype.hasOwnProperty,Le=(t,e)=>m_.call(t,e),de=Array.isArray,Qr=t=>Wo(t)==="[object Map]",gf=t=>Wo(t)==="[object Set]",me=t=>typeof t=="function",it=t=>typeof t=="string",cr=t=>typeof t=="symbol",Je=t=>t!==null&&typeof t=="object",_f=t=>(Je(t)||me(t))&&me(t.then)&&me(t.catch),yf=Object.prototype.toString,Wo=t=>yf.call(t),g_=t=>Wo(t).slice(8,-1),vf=t=>Wo(t)==="[object Object]",ac=t=>it(t)&&t!=="NaN"&&t[0]!=="-"&&""+parseInt(t,10)===t,$s=sc(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Go=t=>{const e=Object.create(null);return n=>e[n]||(e[n]=t(n))},__=/-(\w)/g,Kt=Go(t=>t.replace(__,(e,n)=>n?n.toUpperCase():"")),y_=/\B([A-Z])/g,ur=Go(t=>t.replace(y_,"-$1").toLowerCase()),Qo=Go(t=>t.charAt(0).toUpperCase()+t.slice(1)),za=Go(t=>t?`on${Qo(t)}`:""),Qn=(t,e)=>!Object.is(t,e),lo=(t,...e)=>{for(let n=0;n<t.length;n++)t[n](...e)},vl=(t,e,n,r=!1)=>{Object.defineProperty(t,e,{configurable:!0,enumerable:!1,writable:r,value:n})},El=t=>{const e=parseFloat(t);return isNaN(e)?t:e};let ah;const Jo=()=>ah||(ah=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function ni(t){if(de(t)){const e={};for(let n=0;n<t.length;n++){const r=t[n],s=it(r)?T_(r):ni(r);if(s)for(const i in s)e[i]=s[i]}return e}else if(it(t)||Je(t))return t}const v_=/;(?![^(]*\))/g,E_=/:([^]+)/,w_=/\/\*[^]*?\*\//g;function T_(t){const e={};return t.replace(w_,"").split(v_).forEach(n=>{if(n){const r=n.split(E_);r.length>1&&(e[r[0].trim()]=r[1].trim())}}),e}function ri(t){let e="";if(it(t))e=t;else if(de(t))for(let n=0;n<t.length;n++){const r=ri(t[n]);r&&(e+=r+" ")}else if(Je(t))for(const n in t)t[n]&&(e+=n+" ");return e.trim()}const I_="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",b_=sc(I_);function Ef(t){return!!t||t===""}const wf=t=>!!(t&&t.__v_isRef===!0),Qt=t=>it(t)?t:t==null?"":de(t)||Je(t)&&(t.toString===yf||!me(t.toString))?wf(t)?Qt(t.value):JSON.stringify(t,Tf,2):String(t),Tf=(t,e)=>wf(e)?Tf(t,e.value):Qr(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((n,[r,s],i)=>(n[Ka(r,i)+" =>"]=s,n),{})}:gf(e)?{[`Set(${e.size})`]:[...e.values()].map(n=>Ka(n))}:cr(e)?Ka(e):Je(e)&&!de(e)&&!vf(e)?String(e):e,Ka=(t,e="")=>{var n;return cr(t)?`Symbol(${(n=t.description)!=null?n:e})`:t};/**
* @vue/reactivity v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Dt;class A_{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=Dt,!e&&Dt&&(this.index=(Dt.scopes||(Dt.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].pause();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].resume();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].resume()}}run(e){if(this._active){const n=Dt;try{return Dt=this,e()}finally{Dt=n}}}on(){++this._on===1&&(this.prevScope=Dt,Dt=this)}off(){this._on>0&&--this._on===0&&(Dt=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let n,r;for(n=0,r=this.effects.length;n<r;n++)this.effects[n].stop();for(this.effects.length=0,n=0,r=this.cleanups.length;n<r;n++)this.cleanups[n]();if(this.cleanups.length=0,this.scopes){for(n=0,r=this.scopes.length;n<r;n++)this.scopes[n].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function R_(){return Dt}let ze;const Wa=new WeakSet;class If{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,Dt&&Dt.active&&Dt.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Wa.has(this)&&(Wa.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Af(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,lh(this),Rf(this);const e=ze,n=Zt;ze=this,Zt=!0;try{return this.fn()}finally{Sf(this),ze=e,Zt=n,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)uc(e);this.deps=this.depsTail=void 0,lh(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Wa.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){wl(this)&&this.run()}get dirty(){return wl(this)}}let bf=0,qs,Hs;function Af(t,e=!1){if(t.flags|=8,e){t.next=Hs,Hs=t;return}t.next=qs,qs=t}function lc(){bf++}function cc(){if(--bf>0)return;if(Hs){let e=Hs;for(Hs=void 0;e;){const n=e.next;e.next=void 0,e.flags&=-9,e=n}}let t;for(;qs;){let e=qs;for(qs=void 0;e;){const n=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(r){t||(t=r)}e=n}}if(t)throw t}function Rf(t){for(let e=t.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function Sf(t){let e,n=t.depsTail,r=n;for(;r;){const s=r.prevDep;r.version===-1?(r===n&&(n=s),uc(r),S_(r)):e=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=s}t.deps=e,t.depsTail=n}function wl(t){for(let e=t.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(Pf(e.dep.computed)||e.dep.version!==e.version))return!0;return!!t._dirty}function Pf(t){if(t.flags&4&&!(t.flags&16)||(t.flags&=-17,t.globalVersion===si)||(t.globalVersion=si,!t.isSSR&&t.flags&128&&(!t.deps&&!t._dirty||!wl(t))))return;t.flags|=2;const e=t.dep,n=ze,r=Zt;ze=t,Zt=!0;try{Rf(t);const s=t.fn(t._value);(e.version===0||Qn(s,t._value))&&(t.flags|=128,t._value=s,e.version++)}catch(s){throw e.version++,s}finally{ze=n,Zt=r,Sf(t),t.flags&=-3}}function uc(t,e=!1){const{dep:n,prevSub:r,nextSub:s}=t;if(r&&(r.nextSub=s,t.prevSub=void 0),s&&(s.prevSub=r,t.nextSub=void 0),n.subs===t&&(n.subs=r,!r&&n.computed)){n.computed.flags&=-5;for(let i=n.computed.deps;i;i=i.nextDep)uc(i,!0)}!e&&!--n.sc&&n.map&&n.map.delete(n.key)}function S_(t){const{prevDep:e,nextDep:n}=t;e&&(e.nextDep=n,t.prevDep=void 0),n&&(n.prevDep=e,t.nextDep=void 0)}let Zt=!0;const Cf=[];function bn(){Cf.push(Zt),Zt=!1}function An(){const t=Cf.pop();Zt=t===void 0?!0:t}function lh(t){const{cleanup:e}=t;if(t.cleanup=void 0,e){const n=ze;ze=void 0;try{e()}finally{ze=n}}}let si=0;class P_{constructor(e,n){this.sub=e,this.dep=n,this.version=n.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class hc{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!ze||!Zt||ze===this.computed)return;let n=this.activeLink;if(n===void 0||n.sub!==ze)n=this.activeLink=new P_(ze,this),ze.deps?(n.prevDep=ze.depsTail,ze.depsTail.nextDep=n,ze.depsTail=n):ze.deps=ze.depsTail=n,kf(n);else if(n.version===-1&&(n.version=this.version,n.nextDep)){const r=n.nextDep;r.prevDep=n.prevDep,n.prevDep&&(n.prevDep.nextDep=r),n.prevDep=ze.depsTail,n.nextDep=void 0,ze.depsTail.nextDep=n,ze.depsTail=n,ze.deps===n&&(ze.deps=r)}return n}trigger(e){this.version++,si++,this.notify(e)}notify(e){lc();try{for(let n=this.subs;n;n=n.prevSub)n.sub.notify()&&n.sub.dep.notify()}finally{cc()}}}function kf(t){if(t.dep.sc++,t.sub.flags&4){const e=t.dep.computed;if(e&&!t.dep.subs){e.flags|=20;for(let r=e.deps;r;r=r.nextDep)kf(r)}const n=t.dep.subs;n!==t&&(t.prevSub=n,n&&(n.nextSub=t)),t.dep.subs=t}}const Tl=new WeakMap,Ir=Symbol(""),Il=Symbol(""),ii=Symbol("");function Tt(t,e,n){if(Zt&&ze){let r=Tl.get(t);r||Tl.set(t,r=new Map);let s=r.get(n);s||(r.set(n,s=new hc),s.map=r,s.key=n),s.track()}}function yn(t,e,n,r,s,i){const a=Tl.get(t);if(!a){si++;return}const l=c=>{c&&c.trigger()};if(lc(),e==="clear")a.forEach(l);else{const c=de(t),h=c&&ac(n);if(c&&n==="length"){const d=Number(r);a.forEach((p,g)=>{(g==="length"||g===ii||!cr(g)&&g>=d)&&l(p)})}else switch((n!==void 0||a.has(void 0))&&l(a.get(n)),h&&l(a.get(ii)),e){case"add":c?h&&l(a.get("length")):(l(a.get(Ir)),Qr(t)&&l(a.get(Il)));break;case"delete":c||(l(a.get(Ir)),Qr(t)&&l(a.get(Il)));break;case"set":Qr(t)&&l(a.get(Ir));break}}cc()}function Ur(t){const e=Me(t);return e===t?e:(Tt(e,"iterate",ii),zt(t)?e:e.map(pt))}function Yo(t){return Tt(t=Me(t),"iterate",ii),t}const C_={__proto__:null,[Symbol.iterator](){return Ga(this,Symbol.iterator,pt)},concat(...t){return Ur(this).concat(...t.map(e=>de(e)?Ur(e):e))},entries(){return Ga(this,"entries",t=>(t[1]=pt(t[1]),t))},every(t,e){return mn(this,"every",t,e,void 0,arguments)},filter(t,e){return mn(this,"filter",t,e,n=>n.map(pt),arguments)},find(t,e){return mn(this,"find",t,e,pt,arguments)},findIndex(t,e){return mn(this,"findIndex",t,e,void 0,arguments)},findLast(t,e){return mn(this,"findLast",t,e,pt,arguments)},findLastIndex(t,e){return mn(this,"findLastIndex",t,e,void 0,arguments)},forEach(t,e){return mn(this,"forEach",t,e,void 0,arguments)},includes(...t){return Qa(this,"includes",t)},indexOf(...t){return Qa(this,"indexOf",t)},join(t){return Ur(this).join(t)},lastIndexOf(...t){return Qa(this,"lastIndexOf",t)},map(t,e){return mn(this,"map",t,e,void 0,arguments)},pop(){return Ns(this,"pop")},push(...t){return Ns(this,"push",t)},reduce(t,...e){return ch(this,"reduce",t,e)},reduceRight(t,...e){return ch(this,"reduceRight",t,e)},shift(){return Ns(this,"shift")},some(t,e){return mn(this,"some",t,e,void 0,arguments)},splice(...t){return Ns(this,"splice",t)},toReversed(){return Ur(this).toReversed()},toSorted(t){return Ur(this).toSorted(t)},toSpliced(...t){return Ur(this).toSpliced(...t)},unshift(...t){return Ns(this,"unshift",t)},values(){return Ga(this,"values",pt)}};function Ga(t,e,n){const r=Yo(t),s=r[e]();return r!==t&&!zt(t)&&(s._next=s.next,s.next=()=>{const i=s._next();return i.value&&(i.value=n(i.value)),i}),s}const k_=Array.prototype;function mn(t,e,n,r,s,i){const a=Yo(t),l=a!==t&&!zt(t),c=a[e];if(c!==k_[e]){const p=c.apply(t,i);return l?pt(p):p}let h=n;a!==t&&(l?h=function(p,g){return n.call(this,pt(p),g,t)}:n.length>2&&(h=function(p,g){return n.call(this,p,g,t)}));const d=c.call(a,h,r);return l&&s?s(d):d}function ch(t,e,n,r){const s=Yo(t);let i=n;return s!==t&&(zt(t)?n.length>3&&(i=function(a,l,c){return n.call(this,a,l,c,t)}):i=function(a,l,c){return n.call(this,a,pt(l),c,t)}),s[e](i,...r)}function Qa(t,e,n){const r=Me(t);Tt(r,"iterate",ii);const s=r[e](...n);return(s===-1||s===!1)&&pc(n[0])?(n[0]=Me(n[0]),r[e](...n)):s}function Ns(t,e,n=[]){bn(),lc();const r=Me(t)[e].apply(t,n);return cc(),An(),r}const x_=sc("__proto__,__v_isRef,__isVue"),xf=new Set(Object.getOwnPropertyNames(Symbol).filter(t=>t!=="arguments"&&t!=="caller").map(t=>Symbol[t]).filter(cr));function D_(t){cr(t)||(t=String(t));const e=Me(this);return Tt(e,"has",t),e.hasOwnProperty(t)}class Df{constructor(e=!1,n=!1){this._isReadonly=e,this._isShallow=n}get(e,n,r){if(n==="__v_skip")return e.__v_skip;const s=this._isReadonly,i=this._isShallow;if(n==="__v_isReactive")return!s;if(n==="__v_isReadonly")return s;if(n==="__v_isShallow")return i;if(n==="__v_raw")return r===(s?i?$_:Mf:i?Of:Nf).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(r)?e:void 0;const a=de(e);if(!s){let c;if(a&&(c=C_[n]))return c;if(n==="hasOwnProperty")return D_}const l=Reflect.get(e,n,At(e)?e:r);return(cr(n)?xf.has(n):x_(n))||(s||Tt(e,"get",n),i)?l:At(l)?a&&ac(n)?l:l.value:Je(l)?s?Ff(l):Xo(l):l}}class Vf extends Df{constructor(e=!1){super(!1,e)}set(e,n,r,s){let i=e[n];if(!this._isShallow){const c=nr(i);if(!zt(r)&&!nr(r)&&(i=Me(i),r=Me(r)),!de(e)&&At(i)&&!At(r))return c?!1:(i.value=r,!0)}const a=de(e)&&ac(n)?Number(n)<e.length:Le(e,n),l=Reflect.set(e,n,r,At(e)?e:s);return e===Me(s)&&(a?Qn(r,i)&&yn(e,"set",n,r):yn(e,"add",n,r)),l}deleteProperty(e,n){const r=Le(e,n);e[n];const s=Reflect.deleteProperty(e,n);return s&&r&&yn(e,"delete",n,void 0),s}has(e,n){const r=Reflect.has(e,n);return(!cr(n)||!xf.has(n))&&Tt(e,"has",n),r}ownKeys(e){return Tt(e,"iterate",de(e)?"length":Ir),Reflect.ownKeys(e)}}class V_ extends Df{constructor(e=!1){super(!0,e)}set(e,n){return!0}deleteProperty(e,n){return!0}}const N_=new Vf,O_=new V_,M_=new Vf(!0);const bl=t=>t,Yi=t=>Reflect.getPrototypeOf(t);function L_(t,e,n){return function(...r){const s=this.__v_raw,i=Me(s),a=Qr(i),l=t==="entries"||t===Symbol.iterator&&a,c=t==="keys"&&a,h=s[t](...r),d=n?bl:e?Io:pt;return!e&&Tt(i,"iterate",c?Il:Ir),{next(){const{value:p,done:g}=h.next();return g?{value:p,done:g}:{value:l?[d(p[0]),d(p[1])]:d(p),done:g}},[Symbol.iterator](){return this}}}}function Xi(t){return function(...e){return t==="delete"?!1:t==="clear"?void 0:this}}function F_(t,e){const n={get(s){const i=this.__v_raw,a=Me(i),l=Me(s);t||(Qn(s,l)&&Tt(a,"get",s),Tt(a,"get",l));const{has:c}=Yi(a),h=e?bl:t?Io:pt;if(c.call(a,s))return h(i.get(s));if(c.call(a,l))return h(i.get(l));i!==a&&i.get(s)},get size(){const s=this.__v_raw;return!t&&Tt(Me(s),"iterate",Ir),Reflect.get(s,"size",s)},has(s){const i=this.__v_raw,a=Me(i),l=Me(s);return t||(Qn(s,l)&&Tt(a,"has",s),Tt(a,"has",l)),s===l?i.has(s):i.has(s)||i.has(l)},forEach(s,i){const a=this,l=a.__v_raw,c=Me(l),h=e?bl:t?Io:pt;return!t&&Tt(c,"iterate",Ir),l.forEach((d,p)=>s.call(i,h(d),h(p),a))}};return ct(n,t?{add:Xi("add"),set:Xi("set"),delete:Xi("delete"),clear:Xi("clear")}:{add(s){!e&&!zt(s)&&!nr(s)&&(s=Me(s));const i=Me(this);return Yi(i).has.call(i,s)||(i.add(s),yn(i,"add",s,s)),this},set(s,i){!e&&!zt(i)&&!nr(i)&&(i=Me(i));const a=Me(this),{has:l,get:c}=Yi(a);let h=l.call(a,s);h||(s=Me(s),h=l.call(a,s));const d=c.call(a,s);return a.set(s,i),h?Qn(i,d)&&yn(a,"set",s,i):yn(a,"add",s,i),this},delete(s){const i=Me(this),{has:a,get:l}=Yi(i);let c=a.call(i,s);c||(s=Me(s),c=a.call(i,s)),l&&l.call(i,s);const h=i.delete(s);return c&&yn(i,"delete",s,void 0),h},clear(){const s=Me(this),i=s.size!==0,a=s.clear();return i&&yn(s,"clear",void 0,void 0),a}}),["keys","values","entries",Symbol.iterator].forEach(s=>{n[s]=L_(s,t,e)}),n}function dc(t,e){const n=F_(t,e);return(r,s,i)=>s==="__v_isReactive"?!t:s==="__v_isReadonly"?t:s==="__v_raw"?r:Reflect.get(Le(n,s)&&s in r?n:r,s,i)}const U_={get:dc(!1,!1)},B_={get:dc(!1,!0)},j_={get:dc(!0,!1)};const Nf=new WeakMap,Of=new WeakMap,Mf=new WeakMap,$_=new WeakMap;function q_(t){switch(t){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function H_(t){return t.__v_skip||!Object.isExtensible(t)?0:q_(g_(t))}function Xo(t){return nr(t)?t:fc(t,!1,N_,U_,Nf)}function Lf(t){return fc(t,!1,M_,B_,Of)}function Ff(t){return fc(t,!0,O_,j_,Mf)}function fc(t,e,n,r,s){if(!Je(t)||t.__v_raw&&!(e&&t.__v_isReactive))return t;const i=H_(t);if(i===0)return t;const a=s.get(t);if(a)return a;const l=new Proxy(t,i===2?r:n);return s.set(t,l),l}function Jr(t){return nr(t)?Jr(t.__v_raw):!!(t&&t.__v_isReactive)}function nr(t){return!!(t&&t.__v_isReadonly)}function zt(t){return!!(t&&t.__v_isShallow)}function pc(t){return t?!!t.__v_raw:!1}function Me(t){const e=t&&t.__v_raw;return e?Me(e):t}function z_(t){return!Le(t,"__v_skip")&&Object.isExtensible(t)&&vl(t,"__v_skip",!0),t}const pt=t=>Je(t)?Xo(t):t,Io=t=>Je(t)?Ff(t):t;function At(t){return t?t.__v_isRef===!0:!1}function Re(t){return Uf(t,!1)}function K_(t){return Uf(t,!0)}function Uf(t,e){return At(t)?t:new W_(t,e)}class W_{constructor(e,n){this.dep=new hc,this.__v_isRef=!0,this.__v_isShallow=!1,this._rawValue=n?e:Me(e),this._value=n?e:pt(e),this.__v_isShallow=n}get value(){return this.dep.track(),this._value}set value(e){const n=this._rawValue,r=this.__v_isShallow||zt(e)||nr(e);e=r?e:Me(e),Qn(e,n)&&(this._rawValue=e,this._value=r?e:pt(e),this.dep.trigger())}}function Yr(t){return At(t)?t.value:t}const G_={get:(t,e,n)=>e==="__v_raw"?t:Yr(Reflect.get(t,e,n)),set:(t,e,n,r)=>{const s=t[e];return At(s)&&!At(n)?(s.value=n,!0):Reflect.set(t,e,n,r)}};function Bf(t){return Jr(t)?t:new Proxy(t,G_)}class Q_{constructor(e,n,r){this.fn=e,this.setter=n,this._value=void 0,this.dep=new hc(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=si-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!n,this.isSSR=r}notify(){if(this.flags|=16,!(this.flags&8)&&ze!==this)return Af(this,!0),!0}get value(){const e=this.dep.track();return Pf(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function J_(t,e,n=!1){let r,s;return me(t)?r=t:(r=t.get,s=t.set),new Q_(r,s,n)}const Zi={},bo=new WeakMap;let vr;function Y_(t,e=!1,n=vr){if(n){let r=bo.get(n);r||bo.set(n,r=[]),r.push(t)}}function X_(t,e,n=He){const{immediate:r,deep:s,once:i,scheduler:a,augmentJob:l,call:c}=n,h=J=>s?J:zt(J)||s===!1||s===0?vn(J,1):vn(J);let d,p,g,y,x=!1,N=!1;if(At(t)?(p=()=>t.value,x=zt(t)):Jr(t)?(p=()=>h(t),x=!0):de(t)?(N=!0,x=t.some(J=>Jr(J)||zt(J)),p=()=>t.map(J=>{if(At(J))return J.value;if(Jr(J))return h(J);if(me(J))return c?c(J,2):J()})):me(t)?e?p=c?()=>c(t,2):t:p=()=>{if(g){bn();try{g()}finally{An()}}const J=vr;vr=d;try{return c?c(t,3,[y]):t(y)}finally{vr=J}}:p=Xt,e&&s){const J=p,ge=s===!0?1/0:s;p=()=>vn(J(),ge)}const O=R_(),q=()=>{d.stop(),O&&O.active&&oc(O.effects,d)};if(i&&e){const J=e;e=(...ge)=>{J(...ge),q()}}let U=N?new Array(t.length).fill(Zi):Zi;const G=J=>{if(!(!(d.flags&1)||!d.dirty&&!J))if(e){const ge=d.run();if(s||x||(N?ge.some((_e,I)=>Qn(_e,U[I])):Qn(ge,U))){g&&g();const _e=vr;vr=d;try{const I=[ge,U===Zi?void 0:N&&U[0]===Zi?[]:U,y];U=ge,c?c(e,3,I):e(...I)}finally{vr=_e}}}else d.run()};return l&&l(G),d=new If(p),d.scheduler=a?()=>a(G,!1):G,y=J=>Y_(J,!1,d),g=d.onStop=()=>{const J=bo.get(d);if(J){if(c)c(J,4);else for(const ge of J)ge();bo.delete(d)}},e?r?G(!0):U=d.run():a?a(G.bind(null,!0),!0):d.run(),q.pause=d.pause.bind(d),q.resume=d.resume.bind(d),q.stop=q,q}function vn(t,e=1/0,n){if(e<=0||!Je(t)||t.__v_skip||(n=n||new Set,n.has(t)))return t;if(n.add(t),e--,At(t))vn(t.value,e,n);else if(de(t))for(let r=0;r<t.length;r++)vn(t[r],e,n);else if(gf(t)||Qr(t))t.forEach(r=>{vn(r,e,n)});else if(vf(t)){for(const r in t)vn(t[r],e,n);for(const r of Object.getOwnPropertySymbols(t))Object.prototype.propertyIsEnumerable.call(t,r)&&vn(t[r],e,n)}return t}/**
* @vue/runtime-core v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function wi(t,e,n,r){try{return r?t(...r):t()}catch(s){Zo(s,e,n)}}function hn(t,e,n,r){if(me(t)){const s=wi(t,e,n,r);return s&&_f(s)&&s.catch(i=>{Zo(i,e,n)}),s}if(de(t)){const s=[];for(let i=0;i<t.length;i++)s.push(hn(t[i],e,n,r));return s}}function Zo(t,e,n,r=!0){const s=e?e.vnode:null,{errorHandler:i,throwUnhandledErrorInProduction:a}=e&&e.appContext.config||He;if(e){let l=e.parent;const c=e.proxy,h=`https://vuejs.org/error-reference/#runtime-${n}`;for(;l;){const d=l.ec;if(d){for(let p=0;p<d.length;p++)if(d[p](t,c,h)===!1)return}l=l.parent}if(i){bn(),wi(i,null,10,[t,c,h]),An();return}}Z_(t,n,s,r,a)}function Z_(t,e,n,r=!0,s=!1){if(s)throw t;console.error(t)}const kt=[];let rn=-1;const Xr=[];let Fn=null,jr=0;const jf=Promise.resolve();let Ao=null;function mc(t){const e=Ao||jf;return t?e.then(this?t.bind(this):t):e}function ey(t){let e=rn+1,n=kt.length;for(;e<n;){const r=e+n>>>1,s=kt[r],i=oi(s);i<t||i===t&&s.flags&2?e=r+1:n=r}return e}function gc(t){if(!(t.flags&1)){const e=oi(t),n=kt[kt.length-1];!n||!(t.flags&2)&&e>=oi(n)?kt.push(t):kt.splice(ey(e),0,t),t.flags|=1,$f()}}function $f(){Ao||(Ao=jf.then(Hf))}function ty(t){de(t)?Xr.push(...t):Fn&&t.id===-1?Fn.splice(jr+1,0,t):t.flags&1||(Xr.push(t),t.flags|=1),$f()}function uh(t,e,n=rn+1){for(;n<kt.length;n++){const r=kt[n];if(r&&r.flags&2){if(t&&r.id!==t.uid)continue;kt.splice(n,1),n--,r.flags&4&&(r.flags&=-2),r(),r.flags&4||(r.flags&=-2)}}}function qf(t){if(Xr.length){const e=[...new Set(Xr)].sort((n,r)=>oi(n)-oi(r));if(Xr.length=0,Fn){Fn.push(...e);return}for(Fn=e,jr=0;jr<Fn.length;jr++){const n=Fn[jr];n.flags&4&&(n.flags&=-2),n.flags&8||n(),n.flags&=-2}Fn=null,jr=0}}const oi=t=>t.id==null?t.flags&2?-1:1/0:t.id;function Hf(t){const e=Xt;try{for(rn=0;rn<kt.length;rn++){const n=kt[rn];n&&!(n.flags&8)&&(n.flags&4&&(n.flags&=-2),wi(n,n.i,n.i?15:14),n.flags&4||(n.flags&=-2))}}finally{for(;rn<kt.length;rn++){const n=kt[rn];n&&(n.flags&=-2)}rn=-1,kt.length=0,qf(),Ao=null,(kt.length||Xr.length)&&Hf()}}let Lt=null,zf=null;function Ro(t){const e=Lt;return Lt=t,zf=t&&t.type.__scopeId||null,e}function ny(t,e=Lt,n){if(!e||t._n)return t;const r=(...s)=>{r._d&&vh(-1);const i=Ro(e);let a;try{a=t(...s)}finally{Ro(i),r._d&&vh(1)}return a};return r._n=!0,r._c=!0,r._d=!0,r}function Un(t,e){if(Lt===null)return t;const n=ra(Lt),r=t.dirs||(t.dirs=[]);for(let s=0;s<e.length;s++){let[i,a,l,c=He]=e[s];i&&(me(i)&&(i={mounted:i,updated:i}),i.deep&&vn(a),r.push({dir:i,instance:n,value:a,oldValue:void 0,arg:l,modifiers:c}))}return t}function _r(t,e,n,r){const s=t.dirs,i=e&&e.dirs;for(let a=0;a<s.length;a++){const l=s[a];i&&(l.oldValue=i[a].value);let c=l.dir[r];c&&(bn(),hn(c,n,8,[t.el,l,t,e]),An())}}const ry=Symbol("_vte"),sy=t=>t.__isTeleport;function _c(t,e){t.shapeFlag&6&&t.component?(t.transition=e,_c(t.component.subTree,e)):t.shapeFlag&128?(t.ssContent.transition=e.clone(t.ssContent),t.ssFallback.transition=e.clone(t.ssFallback)):t.transition=e}/*! #__NO_SIDE_EFFECTS__ */function Kf(t,e){return me(t)?(()=>ct({name:t.name},e,{setup:t}))():t}function Wf(t){t.ids=[t.ids[0]+t.ids[2]+++"-",0,0]}function zs(t,e,n,r,s=!1){if(de(t)){t.forEach((x,N)=>zs(x,e&&(de(e)?e[N]:e),n,r,s));return}if(Ks(r)&&!s){r.shapeFlag&512&&r.type.__asyncResolved&&r.component.subTree.component&&zs(t,e,n,r.component.subTree);return}const i=r.shapeFlag&4?ra(r.component):r.el,a=s?null:i,{i:l,r:c}=t,h=e&&e.r,d=l.refs===He?l.refs={}:l.refs,p=l.setupState,g=Me(p),y=p===He?()=>!1:x=>Le(g,x);if(h!=null&&h!==c&&(it(h)?(d[h]=null,y(h)&&(p[h]=null)):At(h)&&(h.value=null)),me(c))wi(c,l,12,[a,d]);else{const x=it(c),N=At(c);if(x||N){const O=()=>{if(t.f){const q=x?y(c)?p[c]:d[c]:c.value;s?de(q)&&oc(q,i):de(q)?q.includes(i)||q.push(i):x?(d[c]=[i],y(c)&&(p[c]=d[c])):(c.value=[i],t.k&&(d[t.k]=c.value))}else x?(d[c]=a,y(c)&&(p[c]=a)):N&&(c.value=a,t.k&&(d[t.k]=a))};a?(O.id=-1,Mt(O,n)):O()}}}Jo().requestIdleCallback;Jo().cancelIdleCallback;const Ks=t=>!!t.type.__asyncLoader,Gf=t=>t.type.__isKeepAlive;function iy(t,e){Qf(t,"a",e)}function oy(t,e){Qf(t,"da",e)}function Qf(t,e,n=bt){const r=t.__wdc||(t.__wdc=()=>{let s=n;for(;s;){if(s.isDeactivated)return;s=s.parent}return t()});if(ea(e,r,n),n){let s=n.parent;for(;s&&s.parent;)Gf(s.parent.vnode)&&ay(r,e,n,s),s=s.parent}}function ay(t,e,n,r){const s=ea(e,t,r,!0);Jf(()=>{oc(r[e],s)},n)}function ea(t,e,n=bt,r=!1){if(n){const s=n[t]||(n[t]=[]),i=e.__weh||(e.__weh=(...a)=>{bn();const l=Ti(n),c=hn(e,n,t,a);return l(),An(),c});return r?s.unshift(i):s.push(i),i}}const xn=t=>(e,n=bt)=>{(!li||t==="sp")&&ea(t,(...r)=>e(...r),n)},ly=xn("bm"),yc=xn("m"),cy=xn("bu"),uy=xn("u"),hy=xn("bum"),Jf=xn("um"),dy=xn("sp"),fy=xn("rtg"),py=xn("rtc");function my(t,e=bt){ea("ec",t,e)}const Yf="components";function gy(t,e){return yy(Yf,t,!0,e)||t}const _y=Symbol.for("v-ndc");function yy(t,e,n=!0,r=!1){const s=Lt||bt;if(s){const i=s.type;if(t===Yf){const l=iv(i,!1);if(l&&(l===e||l===Kt(e)||l===Qo(Kt(e))))return i}const a=hh(s[t]||i[t],e)||hh(s.appContext[t],e);return!a&&r?i:a}}function hh(t,e){return t&&(t[e]||t[Kt(e)]||t[Qo(Kt(e))])}function Er(t,e,n,r){let s;const i=n&&n[r],a=de(t);if(a||it(t)){const l=a&&Jr(t);let c=!1,h=!1;l&&(c=!zt(t),h=nr(t),t=Yo(t)),s=new Array(t.length);for(let d=0,p=t.length;d<p;d++)s[d]=e(c?h?Io(pt(t[d])):pt(t[d]):t[d],d,void 0,i&&i[d])}else if(typeof t=="number"){s=new Array(t);for(let l=0;l<t;l++)s[l]=e(l+1,l,void 0,i&&i[l])}else if(Je(t))if(t[Symbol.iterator])s=Array.from(t,(l,c)=>e(l,c,void 0,i&&i[c]));else{const l=Object.keys(t);s=new Array(l.length);for(let c=0,h=l.length;c<h;c++){const d=l[c];s[c]=e(t[d],d,c,i&&i[c])}}else s=[];return n&&(n[r]=s),s}const Al=t=>t?_p(t)?ra(t):Al(t.parent):null,Ws=ct(Object.create(null),{$:t=>t,$el:t=>t.vnode.el,$data:t=>t.data,$props:t=>t.props,$attrs:t=>t.attrs,$slots:t=>t.slots,$refs:t=>t.refs,$parent:t=>Al(t.parent),$root:t=>Al(t.root),$host:t=>t.ce,$emit:t=>t.emit,$options:t=>vc(t),$forceUpdate:t=>t.f||(t.f=()=>{gc(t.update)}),$nextTick:t=>t.n||(t.n=mc.bind(t.proxy)),$watch:t=>Uy.bind(t)}),Ja=(t,e)=>t!==He&&!t.__isScriptSetup&&Le(t,e),vy={get({_:t},e){if(e==="__v_skip")return!0;const{ctx:n,setupState:r,data:s,props:i,accessCache:a,type:l,appContext:c}=t;let h;if(e[0]!=="$"){const y=a[e];if(y!==void 0)switch(y){case 1:return r[e];case 2:return s[e];case 4:return n[e];case 3:return i[e]}else{if(Ja(r,e))return a[e]=1,r[e];if(s!==He&&Le(s,e))return a[e]=2,s[e];if((h=t.propsOptions[0])&&Le(h,e))return a[e]=3,i[e];if(n!==He&&Le(n,e))return a[e]=4,n[e];Rl&&(a[e]=0)}}const d=Ws[e];let p,g;if(d)return e==="$attrs"&&Tt(t.attrs,"get",""),d(t);if((p=l.__cssModules)&&(p=p[e]))return p;if(n!==He&&Le(n,e))return a[e]=4,n[e];if(g=c.config.globalProperties,Le(g,e))return g[e]},set({_:t},e,n){const{data:r,setupState:s,ctx:i}=t;return Ja(s,e)?(s[e]=n,!0):r!==He&&Le(r,e)?(r[e]=n,!0):Le(t.props,e)||e[0]==="$"&&e.slice(1)in t?!1:(i[e]=n,!0)},has({_:{data:t,setupState:e,accessCache:n,ctx:r,appContext:s,propsOptions:i}},a){let l;return!!n[a]||t!==He&&Le(t,a)||Ja(e,a)||(l=i[0])&&Le(l,a)||Le(r,a)||Le(Ws,a)||Le(s.config.globalProperties,a)},defineProperty(t,e,n){return n.get!=null?t._.accessCache[e]=0:Le(n,"value")&&this.set(t,e,n.value,null),Reflect.defineProperty(t,e,n)}};function dh(t){return de(t)?t.reduce((e,n)=>(e[n]=null,e),{}):t}let Rl=!0;function Ey(t){const e=vc(t),n=t.proxy,r=t.ctx;Rl=!1,e.beforeCreate&&fh(e.beforeCreate,t,"bc");const{data:s,computed:i,methods:a,watch:l,provide:c,inject:h,created:d,beforeMount:p,mounted:g,beforeUpdate:y,updated:x,activated:N,deactivated:O,beforeDestroy:q,beforeUnmount:U,destroyed:G,unmounted:J,render:ge,renderTracked:_e,renderTriggered:I,errorCaptured:v,serverPrefetch:T,expose:b,inheritAttrs:A,components:P,directives:w,filters:tt}=e;if(h&&wy(h,r,null),a)for(const we in a){const Ee=a[we];me(Ee)&&(r[we]=Ee.bind(n))}if(s){const we=s.call(n,n);Je(we)&&(t.data=Xo(we))}if(Rl=!0,i)for(const we in i){const Ee=i[we],Pe=me(Ee)?Ee.bind(n,n):me(Ee.get)?Ee.get.bind(n,n):Xt,Fe=!me(Ee)&&me(Ee.set)?Ee.set.bind(n):Xt,$e=Jt({get:Pe,set:Fe});Object.defineProperty(r,we,{enumerable:!0,configurable:!0,get:()=>$e.value,set:Te=>$e.value=Te})}if(l)for(const we in l)Xf(l[we],r,n,we);if(c){const we=me(c)?c.call(n):c;Reflect.ownKeys(we).forEach(Ee=>{co(Ee,we[Ee])})}d&&fh(d,t,"c");function je(we,Ee){de(Ee)?Ee.forEach(Pe=>we(Pe.bind(n))):Ee&&we(Ee.bind(n))}if(je(ly,p),je(yc,g),je(cy,y),je(uy,x),je(iy,N),je(oy,O),je(my,v),je(py,_e),je(fy,I),je(hy,U),je(Jf,J),je(dy,T),de(b))if(b.length){const we=t.exposed||(t.exposed={});b.forEach(Ee=>{Object.defineProperty(we,Ee,{get:()=>n[Ee],set:Pe=>n[Ee]=Pe})})}else t.exposed||(t.exposed={});ge&&t.render===Xt&&(t.render=ge),A!=null&&(t.inheritAttrs=A),P&&(t.components=P),w&&(t.directives=w),T&&Wf(t)}function wy(t,e,n=Xt){de(t)&&(t=Sl(t));for(const r in t){const s=t[r];let i;Je(s)?"default"in s?i=on(s.from||r,s.default,!0):i=on(s.from||r):i=on(s),At(i)?Object.defineProperty(e,r,{enumerable:!0,configurable:!0,get:()=>i.value,set:a=>i.value=a}):e[r]=i}}function fh(t,e,n){hn(de(t)?t.map(r=>r.bind(e.proxy)):t.bind(e.proxy),e,n)}function Xf(t,e,n,r){let s=r.includes(".")?hp(n,r):()=>n[r];if(it(t)){const i=e[t];me(i)&&uo(s,i)}else if(me(t))uo(s,t.bind(n));else if(Je(t))if(de(t))t.forEach(i=>Xf(i,e,n,r));else{const i=me(t.handler)?t.handler.bind(n):e[t.handler];me(i)&&uo(s,i,t)}}function vc(t){const e=t.type,{mixins:n,extends:r}=e,{mixins:s,optionsCache:i,config:{optionMergeStrategies:a}}=t.appContext,l=i.get(e);let c;return l?c=l:!s.length&&!n&&!r?c=e:(c={},s.length&&s.forEach(h=>So(c,h,a,!0)),So(c,e,a)),Je(e)&&i.set(e,c),c}function So(t,e,n,r=!1){const{mixins:s,extends:i}=e;i&&So(t,i,n,!0),s&&s.forEach(a=>So(t,a,n,!0));for(const a in e)if(!(r&&a==="expose")){const l=Ty[a]||n&&n[a];t[a]=l?l(t[a],e[a]):e[a]}return t}const Ty={data:ph,props:mh,emits:mh,methods:Fs,computed:Fs,beforeCreate:Ct,created:Ct,beforeMount:Ct,mounted:Ct,beforeUpdate:Ct,updated:Ct,beforeDestroy:Ct,beforeUnmount:Ct,destroyed:Ct,unmounted:Ct,activated:Ct,deactivated:Ct,errorCaptured:Ct,serverPrefetch:Ct,components:Fs,directives:Fs,watch:by,provide:ph,inject:Iy};function ph(t,e){return e?t?function(){return ct(me(t)?t.call(this,this):t,me(e)?e.call(this,this):e)}:e:t}function Iy(t,e){return Fs(Sl(t),Sl(e))}function Sl(t){if(de(t)){const e={};for(let n=0;n<t.length;n++)e[t[n]]=t[n];return e}return t}function Ct(t,e){return t?[...new Set([].concat(t,e))]:e}function Fs(t,e){return t?ct(Object.create(null),t,e):e}function mh(t,e){return t?de(t)&&de(e)?[...new Set([...t,...e])]:ct(Object.create(null),dh(t),dh(e??{})):e}function by(t,e){if(!t)return e;if(!e)return t;const n=ct(Object.create(null),t);for(const r in e)n[r]=Ct(t[r],e[r]);return n}function Zf(){return{app:null,config:{isNativeTag:p_,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let Ay=0;function Ry(t,e){return function(r,s=null){me(r)||(r=ct({},r)),s!=null&&!Je(s)&&(s=null);const i=Zf(),a=new WeakSet,l=[];let c=!1;const h=i.app={_uid:Ay++,_component:r,_props:s,_container:null,_context:i,_instance:null,version:av,get config(){return i.config},set config(d){},use(d,...p){return a.has(d)||(d&&me(d.install)?(a.add(d),d.install(h,...p)):me(d)&&(a.add(d),d(h,...p))),h},mixin(d){return i.mixins.includes(d)||i.mixins.push(d),h},component(d,p){return p?(i.components[d]=p,h):i.components[d]},directive(d,p){return p?(i.directives[d]=p,h):i.directives[d]},mount(d,p,g){if(!c){const y=h._ceVNode||Ut(r,s);return y.appContext=i,g===!0?g="svg":g===!1&&(g=void 0),p&&e?e(y,d):t(y,d,g),c=!0,h._container=d,d.__vue_app__=h,ra(y.component)}},onUnmount(d){l.push(d)},unmount(){c&&(hn(l,h._instance,16),t(null,h._container),delete h._container.__vue_app__)},provide(d,p){return i.provides[d]=p,h},runWithContext(d){const p=Zr;Zr=h;try{return d()}finally{Zr=p}}};return h}}let Zr=null;function co(t,e){if(bt){let n=bt.provides;const r=bt.parent&&bt.parent.provides;r===n&&(n=bt.provides=Object.create(r)),n[t]=e}}function on(t,e,n=!1){const r=bt||Lt;if(r||Zr){let s=Zr?Zr._context.provides:r?r.parent==null||r.ce?r.vnode.appContext&&r.vnode.appContext.provides:r.parent.provides:void 0;if(s&&t in s)return s[t];if(arguments.length>1)return n&&me(e)?e.call(r&&r.proxy):e}}const ep={},tp=()=>Object.create(ep),np=t=>Object.getPrototypeOf(t)===ep;function Sy(t,e,n,r=!1){const s={},i=tp();t.propsDefaults=Object.create(null),rp(t,e,s,i);for(const a in t.propsOptions[0])a in s||(s[a]=void 0);n?t.props=r?s:Lf(s):t.type.props?t.props=s:t.props=i,t.attrs=i}function Py(t,e,n,r){const{props:s,attrs:i,vnode:{patchFlag:a}}=t,l=Me(s),[c]=t.propsOptions;let h=!1;if((r||a>0)&&!(a&16)){if(a&8){const d=t.vnode.dynamicProps;for(let p=0;p<d.length;p++){let g=d[p];if(ta(t.emitsOptions,g))continue;const y=e[g];if(c)if(Le(i,g))y!==i[g]&&(i[g]=y,h=!0);else{const x=Kt(g);s[x]=Pl(c,l,x,y,t,!1)}else y!==i[g]&&(i[g]=y,h=!0)}}}else{rp(t,e,s,i)&&(h=!0);let d;for(const p in l)(!e||!Le(e,p)&&((d=ur(p))===p||!Le(e,d)))&&(c?n&&(n[p]!==void 0||n[d]!==void 0)&&(s[p]=Pl(c,l,p,void 0,t,!0)):delete s[p]);if(i!==l)for(const p in i)(!e||!Le(e,p))&&(delete i[p],h=!0)}h&&yn(t.attrs,"set","")}function rp(t,e,n,r){const[s,i]=t.propsOptions;let a=!1,l;if(e)for(let c in e){if($s(c))continue;const h=e[c];let d;s&&Le(s,d=Kt(c))?!i||!i.includes(d)?n[d]=h:(l||(l={}))[d]=h:ta(t.emitsOptions,c)||(!(c in r)||h!==r[c])&&(r[c]=h,a=!0)}if(i){const c=Me(n),h=l||He;for(let d=0;d<i.length;d++){const p=i[d];n[p]=Pl(s,c,p,h[p],t,!Le(h,p))}}return a}function Pl(t,e,n,r,s,i){const a=t[n];if(a!=null){const l=Le(a,"default");if(l&&r===void 0){const c=a.default;if(a.type!==Function&&!a.skipFactory&&me(c)){const{propsDefaults:h}=s;if(n in h)r=h[n];else{const d=Ti(s);r=h[n]=c.call(null,e),d()}}else r=c;s.ce&&s.ce._setProp(n,r)}a[0]&&(i&&!l?r=!1:a[1]&&(r===""||r===ur(n))&&(r=!0))}return r}const Cy=new WeakMap;function sp(t,e,n=!1){const r=n?Cy:e.propsCache,s=r.get(t);if(s)return s;const i=t.props,a={},l=[];let c=!1;if(!me(t)){const d=p=>{c=!0;const[g,y]=sp(p,e,!0);ct(a,g),y&&l.push(...y)};!n&&e.mixins.length&&e.mixins.forEach(d),t.extends&&d(t.extends),t.mixins&&t.mixins.forEach(d)}if(!i&&!c)return Je(t)&&r.set(t,Gr),Gr;if(de(i))for(let d=0;d<i.length;d++){const p=Kt(i[d]);gh(p)&&(a[p]=He)}else if(i)for(const d in i){const p=Kt(d);if(gh(p)){const g=i[d],y=a[p]=de(g)||me(g)?{type:g}:ct({},g),x=y.type;let N=!1,O=!0;if(de(x))for(let q=0;q<x.length;++q){const U=x[q],G=me(U)&&U.name;if(G==="Boolean"){N=!0;break}else G==="String"&&(O=!1)}else N=me(x)&&x.name==="Boolean";y[0]=N,y[1]=O,(N||Le(y,"default"))&&l.push(p)}}const h=[a,l];return Je(t)&&r.set(t,h),h}function gh(t){return t[0]!=="$"&&!$s(t)}const Ec=t=>t[0]==="_"||t==="$stable",wc=t=>de(t)?t.map(sn):[sn(t)],ky=(t,e,n)=>{if(e._n)return e;const r=ny((...s)=>wc(e(...s)),n);return r._c=!1,r},ip=(t,e,n)=>{const r=t._ctx;for(const s in t){if(Ec(s))continue;const i=t[s];if(me(i))e[s]=ky(s,i,r);else if(i!=null){const a=wc(i);e[s]=()=>a}}},op=(t,e)=>{const n=wc(e);t.slots.default=()=>n},ap=(t,e,n)=>{for(const r in e)(n||!Ec(r))&&(t[r]=e[r])},xy=(t,e,n)=>{const r=t.slots=tp();if(t.vnode.shapeFlag&32){const s=e.__;s&&vl(r,"__",s,!0);const i=e._;i?(ap(r,e,n),n&&vl(r,"_",i,!0)):ip(e,r)}else e&&op(t,e)},Dy=(t,e,n)=>{const{vnode:r,slots:s}=t;let i=!0,a=He;if(r.shapeFlag&32){const l=e._;l?n&&l===1?i=!1:ap(s,e,n):(i=!e.$stable,ip(e,s)),a=e}else e&&(op(t,e),a={default:1});if(i)for(const l in s)!Ec(l)&&a[l]==null&&delete s[l]},Mt=Ky;function Vy(t){return Ny(t)}function Ny(t,e){const n=Jo();n.__VUE__=!0;const{insert:r,remove:s,patchProp:i,createElement:a,createText:l,createComment:c,setText:h,setElementText:d,parentNode:p,nextSibling:g,setScopeId:y=Xt,insertStaticContent:x}=t,N=(_,E,k,j=null,M=null,$=null,Z=void 0,Q=null,W=!!E.dynamicChildren)=>{if(_===E)return;_&&!Os(_,E)&&(j=L(_),Te(_,M,$,!0),_=null),E.patchFlag===-2&&(W=!1,E.dynamicChildren=null);const{type:z,ref:ie,shapeFlag:ee}=E;switch(z){case na:O(_,E,k,j);break;case rr:q(_,E,k,j);break;case Za:_==null&&U(E,k,j,Z);break;case ft:P(_,E,k,j,M,$,Z,Q,W);break;default:ee&1?ge(_,E,k,j,M,$,Z,Q,W):ee&6?w(_,E,k,j,M,$,Z,Q,W):(ee&64||ee&128)&&z.process(_,E,k,j,M,$,Z,Q,W,ne)}ie!=null&&M?zs(ie,_&&_.ref,$,E||_,!E):ie==null&&_&&_.ref!=null&&zs(_.ref,null,$,_,!0)},O=(_,E,k,j)=>{if(_==null)r(E.el=l(E.children),k,j);else{const M=E.el=_.el;E.children!==_.children&&h(M,E.children)}},q=(_,E,k,j)=>{_==null?r(E.el=c(E.children||""),k,j):E.el=_.el},U=(_,E,k,j)=>{[_.el,_.anchor]=x(_.children,E,k,j,_.el,_.anchor)},G=({el:_,anchor:E},k,j)=>{let M;for(;_&&_!==E;)M=g(_),r(_,k,j),_=M;r(E,k,j)},J=({el:_,anchor:E})=>{let k;for(;_&&_!==E;)k=g(_),s(_),_=k;s(E)},ge=(_,E,k,j,M,$,Z,Q,W)=>{E.type==="svg"?Z="svg":E.type==="math"&&(Z="mathml"),_==null?_e(E,k,j,M,$,Z,Q,W):T(_,E,M,$,Z,Q,W)},_e=(_,E,k,j,M,$,Z,Q)=>{let W,z;const{props:ie,shapeFlag:ee,transition:D,dirs:R}=_;if(W=_.el=a(_.type,$,ie&&ie.is,ie),ee&8?d(W,_.children):ee&16&&v(_.children,W,null,j,M,Ya(_,$),Z,Q),R&&_r(_,null,j,"created"),I(W,_,_.scopeId,Z,j),ie){for(const K in ie)K!=="value"&&!$s(K)&&i(W,K,null,ie[K],$,j);"value"in ie&&i(W,"value",null,ie.value,$),(z=ie.onVnodeBeforeMount)&&nn(z,j,_)}R&&_r(_,null,j,"beforeMount");const C=Oy(M,D);C&&D.beforeEnter(W),r(W,E,k),((z=ie&&ie.onVnodeMounted)||C||R)&&Mt(()=>{z&&nn(z,j,_),C&&D.enter(W),R&&_r(_,null,j,"mounted")},M)},I=(_,E,k,j,M)=>{if(k&&y(_,k),j)for(let $=0;$<j.length;$++)y(_,j[$]);if(M){let $=M.subTree;if(E===$||fp($.type)&&($.ssContent===E||$.ssFallback===E)){const Z=M.vnode;I(_,Z,Z.scopeId,Z.slotScopeIds,M.parent)}}},v=(_,E,k,j,M,$,Z,Q,W=0)=>{for(let z=W;z<_.length;z++){const ie=_[z]=Q?jn(_[z]):sn(_[z]);N(null,ie,E,k,j,M,$,Z,Q)}},T=(_,E,k,j,M,$,Z)=>{const Q=E.el=_.el;let{patchFlag:W,dynamicChildren:z,dirs:ie}=E;W|=_.patchFlag&16;const ee=_.props||He,D=E.props||He;let R;if(k&&yr(k,!1),(R=D.onVnodeBeforeUpdate)&&nn(R,k,E,_),ie&&_r(E,_,k,"beforeUpdate"),k&&yr(k,!0),(ee.innerHTML&&D.innerHTML==null||ee.textContent&&D.textContent==null)&&d(Q,""),z?b(_.dynamicChildren,z,Q,k,j,Ya(E,M),$):Z||Ee(_,E,Q,null,k,j,Ya(E,M),$,!1),W>0){if(W&16)A(Q,ee,D,k,M);else if(W&2&&ee.class!==D.class&&i(Q,"class",null,D.class,M),W&4&&i(Q,"style",ee.style,D.style,M),W&8){const C=E.dynamicProps;for(let K=0;K<C.length;K++){const oe=C[K],ve=ee[oe],le=D[oe];(le!==ve||oe==="value")&&i(Q,oe,ve,le,M,k)}}W&1&&_.children!==E.children&&d(Q,E.children)}else!Z&&z==null&&A(Q,ee,D,k,M);((R=D.onVnodeUpdated)||ie)&&Mt(()=>{R&&nn(R,k,E,_),ie&&_r(E,_,k,"updated")},j)},b=(_,E,k,j,M,$,Z)=>{for(let Q=0;Q<E.length;Q++){const W=_[Q],z=E[Q],ie=W.el&&(W.type===ft||!Os(W,z)||W.shapeFlag&198)?p(W.el):k;N(W,z,ie,null,j,M,$,Z,!0)}},A=(_,E,k,j,M)=>{if(E!==k){if(E!==He)for(const $ in E)!$s($)&&!($ in k)&&i(_,$,E[$],null,M,j);for(const $ in k){if($s($))continue;const Z=k[$],Q=E[$];Z!==Q&&$!=="value"&&i(_,$,Q,Z,M,j)}"value"in k&&i(_,"value",E.value,k.value,M)}},P=(_,E,k,j,M,$,Z,Q,W)=>{const z=E.el=_?_.el:l(""),ie=E.anchor=_?_.anchor:l("");let{patchFlag:ee,dynamicChildren:D,slotScopeIds:R}=E;R&&(Q=Q?Q.concat(R):R),_==null?(r(z,k,j),r(ie,k,j),v(E.children||[],k,ie,M,$,Z,Q,W)):ee>0&&ee&64&&D&&_.dynamicChildren?(b(_.dynamicChildren,D,k,M,$,Z,Q),(E.key!=null||M&&E===M.subTree)&&lp(_,E,!0)):Ee(_,E,k,ie,M,$,Z,Q,W)},w=(_,E,k,j,M,$,Z,Q,W)=>{E.slotScopeIds=Q,_==null?E.shapeFlag&512?M.ctx.activate(E,k,j,Z,W):tt(E,k,j,M,$,Z,W):ot(_,E,W)},tt=(_,E,k,j,M,$,Z)=>{const Q=_.component=ev(_,j,M);if(Gf(_)&&(Q.ctx.renderer=ne),tv(Q,!1,Z),Q.asyncDep){if(M&&M.registerDep(Q,je,Z),!_.el){const W=Q.subTree=Ut(rr);q(null,W,E,k)}}else je(Q,_,E,k,M,$,Z)},ot=(_,E,k)=>{const j=E.component=_.component;if(Hy(_,E,k))if(j.asyncDep&&!j.asyncResolved){we(j,E,k);return}else j.next=E,j.update();else E.el=_.el,j.vnode=E},je=(_,E,k,j,M,$,Z)=>{const Q=()=>{if(_.isMounted){let{next:ee,bu:D,u:R,parent:C,vnode:K}=_;{const Ae=cp(_);if(Ae){ee&&(ee.el=K.el,we(_,ee,Z)),Ae.asyncDep.then(()=>{_.isUnmounted||Q()});return}}let oe=ee,ve;yr(_,!1),ee?(ee.el=K.el,we(_,ee,Z)):ee=K,D&&lo(D),(ve=ee.props&&ee.props.onVnodeBeforeUpdate)&&nn(ve,C,ee,K),yr(_,!0);const le=Xa(_),xe=_.subTree;_.subTree=le,N(xe,le,p(xe.el),L(xe),_,M,$),ee.el=le.el,oe===null&&zy(_,le.el),R&&Mt(R,M),(ve=ee.props&&ee.props.onVnodeUpdated)&&Mt(()=>nn(ve,C,ee,K),M)}else{let ee;const{el:D,props:R}=E,{bm:C,m:K,parent:oe,root:ve,type:le}=_,xe=Ks(E);if(yr(_,!1),C&&lo(C),!xe&&(ee=R&&R.onVnodeBeforeMount)&&nn(ee,oe,E),yr(_,!0),D&&Ne){const Ae=()=>{_.subTree=Xa(_),Ne(D,_.subTree,_,M,null)};xe&&le.__asyncHydrate?le.__asyncHydrate(D,_,Ae):Ae()}else{ve.ce&&ve.ce._def.shadowRoot!==!1&&ve.ce._injectChildStyle(le);const Ae=_.subTree=Xa(_);N(null,Ae,k,j,_,M,$),E.el=Ae.el}if(K&&Mt(K,M),!xe&&(ee=R&&R.onVnodeMounted)){const Ae=E;Mt(()=>nn(ee,oe,Ae),M)}(E.shapeFlag&256||oe&&Ks(oe.vnode)&&oe.vnode.shapeFlag&256)&&_.a&&Mt(_.a,M),_.isMounted=!0,E=k=j=null}};_.scope.on();const W=_.effect=new If(Q);_.scope.off();const z=_.update=W.run.bind(W),ie=_.job=W.runIfDirty.bind(W);ie.i=_,ie.id=_.uid,W.scheduler=()=>gc(ie),yr(_,!0),z()},we=(_,E,k)=>{E.component=_;const j=_.vnode.props;_.vnode=E,_.next=null,Py(_,E.props,j,k),Dy(_,E.children,k),bn(),uh(_),An()},Ee=(_,E,k,j,M,$,Z,Q,W=!1)=>{const z=_&&_.children,ie=_?_.shapeFlag:0,ee=E.children,{patchFlag:D,shapeFlag:R}=E;if(D>0){if(D&128){Fe(z,ee,k,j,M,$,Z,Q,W);return}else if(D&256){Pe(z,ee,k,j,M,$,Z,Q,W);return}}R&8?(ie&16&&nt(z,M,$),ee!==z&&d(k,ee)):ie&16?R&16?Fe(z,ee,k,j,M,$,Z,Q,W):nt(z,M,$,!0):(ie&8&&d(k,""),R&16&&v(ee,k,j,M,$,Z,Q,W))},Pe=(_,E,k,j,M,$,Z,Q,W)=>{_=_||Gr,E=E||Gr;const z=_.length,ie=E.length,ee=Math.min(z,ie);let D;for(D=0;D<ee;D++){const R=E[D]=W?jn(E[D]):sn(E[D]);N(_[D],R,k,null,M,$,Z,Q,W)}z>ie?nt(_,M,$,!0,!1,ee):v(E,k,j,M,$,Z,Q,W,ee)},Fe=(_,E,k,j,M,$,Z,Q,W)=>{let z=0;const ie=E.length;let ee=_.length-1,D=ie-1;for(;z<=ee&&z<=D;){const R=_[z],C=E[z]=W?jn(E[z]):sn(E[z]);if(Os(R,C))N(R,C,k,null,M,$,Z,Q,W);else break;z++}for(;z<=ee&&z<=D;){const R=_[ee],C=E[D]=W?jn(E[D]):sn(E[D]);if(Os(R,C))N(R,C,k,null,M,$,Z,Q,W);else break;ee--,D--}if(z>ee){if(z<=D){const R=D+1,C=R<ie?E[R].el:j;for(;z<=D;)N(null,E[z]=W?jn(E[z]):sn(E[z]),k,C,M,$,Z,Q,W),z++}}else if(z>D)for(;z<=ee;)Te(_[z],M,$,!0),z++;else{const R=z,C=z,K=new Map;for(z=C;z<=D;z++){const ut=E[z]=W?jn(E[z]):sn(E[z]);ut.key!=null&&K.set(ut.key,z)}let oe,ve=0;const le=D-C+1;let xe=!1,Ae=0;const qt=new Array(le);for(z=0;z<le;z++)qt[z]=0;for(z=R;z<=ee;z++){const ut=_[z];if(ve>=le){Te(ut,M,$,!0);continue}let Ht;if(ut.key!=null)Ht=K.get(ut.key);else for(oe=C;oe<=D;oe++)if(qt[oe-C]===0&&Os(ut,E[oe])){Ht=oe;break}Ht===void 0?Te(ut,M,$,!0):(qt[Ht-C]=z+1,Ht>=Ae?Ae=Ht:xe=!0,N(ut,E[Ht],k,null,M,$,Z,Q,W),ve++)}const dr=xe?My(qt):Gr;for(oe=dr.length-1,z=le-1;z>=0;z--){const ut=C+z,Ht=E[ut],Oi=ut+1<ie?E[ut+1].el:j;qt[z]===0?N(null,Ht,k,Oi,M,$,Z,Q,W):xe&&(oe<0||z!==dr[oe]?$e(Ht,k,Oi,2):oe--)}}},$e=(_,E,k,j,M=null)=>{const{el:$,type:Z,transition:Q,children:W,shapeFlag:z}=_;if(z&6){$e(_.component.subTree,E,k,j);return}if(z&128){_.suspense.move(E,k,j);return}if(z&64){Z.move(_,E,k,ne);return}if(Z===ft){r($,E,k);for(let ee=0;ee<W.length;ee++)$e(W[ee],E,k,j);r(_.anchor,E,k);return}if(Z===Za){G(_,E,k);return}if(j!==2&&z&1&&Q)if(j===0)Q.beforeEnter($),r($,E,k),Mt(()=>Q.enter($),M);else{const{leave:ee,delayLeave:D,afterLeave:R}=Q,C=()=>{_.ctx.isUnmounted?s($):r($,E,k)},K=()=>{ee($,()=>{C(),R&&R()})};D?D($,C,K):K()}else r($,E,k)},Te=(_,E,k,j=!1,M=!1)=>{const{type:$,props:Z,ref:Q,children:W,dynamicChildren:z,shapeFlag:ie,patchFlag:ee,dirs:D,cacheIndex:R}=_;if(ee===-2&&(M=!1),Q!=null&&(bn(),zs(Q,null,k,_,!0),An()),R!=null&&(E.renderCache[R]=void 0),ie&256){E.ctx.deactivate(_);return}const C=ie&1&&D,K=!Ks(_);let oe;if(K&&(oe=Z&&Z.onVnodeBeforeUnmount)&&nn(oe,E,_),ie&6)$t(_.component,k,j);else{if(ie&128){_.suspense.unmount(k,j);return}C&&_r(_,null,E,"beforeUnmount"),ie&64?_.type.remove(_,E,k,ne,j):z&&!z.hasOnce&&($!==ft||ee>0&&ee&64)?nt(z,E,k,!1,!0):($===ft&&ee&384||!M&&ie&16)&&nt(W,E,k),j&&Ke(_)}(K&&(oe=Z&&Z.onVnodeUnmounted)||C)&&Mt(()=>{oe&&nn(oe,E,_),C&&_r(_,null,E,"unmounted")},k)},Ke=_=>{const{type:E,el:k,anchor:j,transition:M}=_;if(E===ft){Wt(k,j);return}if(E===Za){J(_);return}const $=()=>{s(k),M&&!M.persisted&&M.afterLeave&&M.afterLeave()};if(_.shapeFlag&1&&M&&!M.persisted){const{leave:Z,delayLeave:Q}=M,W=()=>Z(k,$);Q?Q(_.el,$,W):W()}else $()},Wt=(_,E)=>{let k;for(;_!==E;)k=g(_),s(_),_=k;s(E)},$t=(_,E,k)=>{const{bum:j,scope:M,job:$,subTree:Z,um:Q,m:W,a:z,parent:ie,slots:{__:ee}}=_;_h(W),_h(z),j&&lo(j),ie&&de(ee)&&ee.forEach(D=>{ie.renderCache[D]=void 0}),M.stop(),$&&($.flags|=8,Te(Z,_,E,k)),Q&&Mt(Q,E),Mt(()=>{_.isUnmounted=!0},E),E&&E.pendingBranch&&!E.isUnmounted&&_.asyncDep&&!_.asyncResolved&&_.suspenseId===E.pendingId&&(E.deps--,E.deps===0&&E.resolve())},nt=(_,E,k,j=!1,M=!1,$=0)=>{for(let Z=$;Z<_.length;Z++)Te(_[Z],E,k,j,M)},L=_=>{if(_.shapeFlag&6)return L(_.component.subTree);if(_.shapeFlag&128)return _.suspense.next();const E=g(_.anchor||_.el),k=E&&E[ry];return k?g(k):E};let te=!1;const X=(_,E,k)=>{_==null?E._vnode&&Te(E._vnode,null,null,!0):N(E._vnode||null,_,E,null,null,null,k),E._vnode=_,te||(te=!0,uh(),qf(),te=!1)},ne={p:N,um:Te,m:$e,r:Ke,mt:tt,mc:v,pc:Ee,pbc:b,n:L,o:t};let ye,Ne;return e&&([ye,Ne]=e(ne)),{render:X,hydrate:ye,createApp:Ry(X,ye)}}function Ya({type:t,props:e},n){return n==="svg"&&t==="foreignObject"||n==="mathml"&&t==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:n}function yr({effect:t,job:e},n){n?(t.flags|=32,e.flags|=4):(t.flags&=-33,e.flags&=-5)}function Oy(t,e){return(!t||t&&!t.pendingBranch)&&e&&!e.persisted}function lp(t,e,n=!1){const r=t.children,s=e.children;if(de(r)&&de(s))for(let i=0;i<r.length;i++){const a=r[i];let l=s[i];l.shapeFlag&1&&!l.dynamicChildren&&((l.patchFlag<=0||l.patchFlag===32)&&(l=s[i]=jn(s[i]),l.el=a.el),!n&&l.patchFlag!==-2&&lp(a,l)),l.type===na&&(l.el=a.el),l.type===rr&&!l.el&&(l.el=a.el)}}function My(t){const e=t.slice(),n=[0];let r,s,i,a,l;const c=t.length;for(r=0;r<c;r++){const h=t[r];if(h!==0){if(s=n[n.length-1],t[s]<h){e[r]=s,n.push(r);continue}for(i=0,a=n.length-1;i<a;)l=i+a>>1,t[n[l]]<h?i=l+1:a=l;h<t[n[i]]&&(i>0&&(e[r]=n[i-1]),n[i]=r)}}for(i=n.length,a=n[i-1];i-- >0;)n[i]=a,a=e[a];return n}function cp(t){const e=t.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:cp(e)}function _h(t){if(t)for(let e=0;e<t.length;e++)t[e].flags|=8}const Ly=Symbol.for("v-scx"),Fy=()=>on(Ly);function uo(t,e,n){return up(t,e,n)}function up(t,e,n=He){const{immediate:r,deep:s,flush:i,once:a}=n,l=ct({},n),c=e&&r||!e&&i!=="post";let h;if(li){if(i==="sync"){const y=Fy();h=y.__watcherHandles||(y.__watcherHandles=[])}else if(!c){const y=()=>{};return y.stop=Xt,y.resume=Xt,y.pause=Xt,y}}const d=bt;l.call=(y,x,N)=>hn(y,d,x,N);let p=!1;i==="post"?l.scheduler=y=>{Mt(y,d&&d.suspense)}:i!=="sync"&&(p=!0,l.scheduler=(y,x)=>{x?y():gc(y)}),l.augmentJob=y=>{e&&(y.flags|=4),p&&(y.flags|=2,d&&(y.id=d.uid,y.i=d))};const g=X_(t,e,l);return li&&(h?h.push(g):c&&g()),g}function Uy(t,e,n){const r=this.proxy,s=it(t)?t.includes(".")?hp(r,t):()=>r[t]:t.bind(r,r);let i;me(e)?i=e:(i=e.handler,n=e);const a=Ti(this),l=up(s,i.bind(r),n);return a(),l}function hp(t,e){const n=e.split(".");return()=>{let r=t;for(let s=0;s<n.length&&r;s++)r=r[n[s]];return r}}const By=(t,e)=>e==="modelValue"||e==="model-value"?t.modelModifiers:t[`${e}Modifiers`]||t[`${Kt(e)}Modifiers`]||t[`${ur(e)}Modifiers`];function jy(t,e,...n){if(t.isUnmounted)return;const r=t.vnode.props||He;let s=n;const i=e.startsWith("update:"),a=i&&By(r,e.slice(7));a&&(a.trim&&(s=n.map(d=>it(d)?d.trim():d)),a.number&&(s=n.map(El)));let l,c=r[l=za(e)]||r[l=za(Kt(e))];!c&&i&&(c=r[l=za(ur(e))]),c&&hn(c,t,6,s);const h=r[l+"Once"];if(h){if(!t.emitted)t.emitted={};else if(t.emitted[l])return;t.emitted[l]=!0,hn(h,t,6,s)}}function dp(t,e,n=!1){const r=e.emitsCache,s=r.get(t);if(s!==void 0)return s;const i=t.emits;let a={},l=!1;if(!me(t)){const c=h=>{const d=dp(h,e,!0);d&&(l=!0,ct(a,d))};!n&&e.mixins.length&&e.mixins.forEach(c),t.extends&&c(t.extends),t.mixins&&t.mixins.forEach(c)}return!i&&!l?(Je(t)&&r.set(t,null),null):(de(i)?i.forEach(c=>a[c]=null):ct(a,i),Je(t)&&r.set(t,a),a)}function ta(t,e){return!t||!Ko(e)?!1:(e=e.slice(2).replace(/Once$/,""),Le(t,e[0].toLowerCase()+e.slice(1))||Le(t,ur(e))||Le(t,e))}function Xa(t){const{type:e,vnode:n,proxy:r,withProxy:s,propsOptions:[i],slots:a,attrs:l,emit:c,render:h,renderCache:d,props:p,data:g,setupState:y,ctx:x,inheritAttrs:N}=t,O=Ro(t);let q,U;try{if(n.shapeFlag&4){const J=s||r,ge=J;q=sn(h.call(ge,J,d,p,y,g,x)),U=l}else{const J=e;q=sn(J.length>1?J(p,{attrs:l,slots:a,emit:c}):J(p,null)),U=e.props?l:$y(l)}}catch(J){Gs.length=0,Zo(J,t,1),q=Ut(rr)}let G=q;if(U&&N!==!1){const J=Object.keys(U),{shapeFlag:ge}=G;J.length&&ge&7&&(i&&J.some(ic)&&(U=qy(U,i)),G=ss(G,U,!1,!0))}return n.dirs&&(G=ss(G,null,!1,!0),G.dirs=G.dirs?G.dirs.concat(n.dirs):n.dirs),n.transition&&_c(G,n.transition),q=G,Ro(O),q}const $y=t=>{let e;for(const n in t)(n==="class"||n==="style"||Ko(n))&&((e||(e={}))[n]=t[n]);return e},qy=(t,e)=>{const n={};for(const r in t)(!ic(r)||!(r.slice(9)in e))&&(n[r]=t[r]);return n};function Hy(t,e,n){const{props:r,children:s,component:i}=t,{props:a,children:l,patchFlag:c}=e,h=i.emitsOptions;if(e.dirs||e.transition)return!0;if(n&&c>=0){if(c&1024)return!0;if(c&16)return r?yh(r,a,h):!!a;if(c&8){const d=e.dynamicProps;for(let p=0;p<d.length;p++){const g=d[p];if(a[g]!==r[g]&&!ta(h,g))return!0}}}else return(s||l)&&(!l||!l.$stable)?!0:r===a?!1:r?a?yh(r,a,h):!0:!!a;return!1}function yh(t,e,n){const r=Object.keys(e);if(r.length!==Object.keys(t).length)return!0;for(let s=0;s<r.length;s++){const i=r[s];if(e[i]!==t[i]&&!ta(n,i))return!0}return!1}function zy({vnode:t,parent:e},n){for(;e;){const r=e.subTree;if(r.suspense&&r.suspense.activeBranch===t&&(r.el=t.el),r===t)(t=e.vnode).el=n,e=e.parent;else break}}const fp=t=>t.__isSuspense;function Ky(t,e){e&&e.pendingBranch?de(t)?e.effects.push(...t):e.effects.push(t):ty(t)}const ft=Symbol.for("v-fgt"),na=Symbol.for("v-txt"),rr=Symbol.for("v-cmt"),Za=Symbol.for("v-stc"),Gs=[];let Ft=null;function Ie(t=!1){Gs.push(Ft=t?null:[])}function Wy(){Gs.pop(),Ft=Gs[Gs.length-1]||null}let ai=1;function vh(t,e=!1){ai+=t,t<0&&Ft&&e&&(Ft.hasOnce=!0)}function pp(t){return t.dynamicChildren=ai>0?Ft||Gr:null,Wy(),ai>0&&Ft&&Ft.push(t),t}function ke(t,e,n,r,s,i){return pp(B(t,e,n,r,s,i,!0))}function mp(t,e,n,r,s){return pp(Ut(t,e,n,r,s,!0))}function Po(t){return t?t.__v_isVNode===!0:!1}function Os(t,e){return t.type===e.type&&t.key===e.key}const gp=({key:t})=>t??null,ho=({ref:t,ref_key:e,ref_for:n})=>(typeof t=="number"&&(t=""+t),t!=null?it(t)||At(t)||me(t)?{i:Lt,r:t,k:e,f:!!n}:t:null);function B(t,e=null,n=null,r=0,s=null,i=t===ft?0:1,a=!1,l=!1){const c={__v_isVNode:!0,__v_skip:!0,type:t,props:e,key:e&&gp(e),ref:e&&ho(e),scopeId:zf,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:i,patchFlag:r,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:Lt};return l?(Tc(c,n),i&128&&t.normalize(c)):n&&(c.shapeFlag|=it(n)?8:16),ai>0&&!a&&Ft&&(c.patchFlag>0||i&6)&&c.patchFlag!==32&&Ft.push(c),c}const Ut=Gy;function Gy(t,e=null,n=null,r=0,s=null,i=!1){if((!t||t===_y)&&(t=rr),Po(t)){const l=ss(t,e,!0);return n&&Tc(l,n),ai>0&&!i&&Ft&&(l.shapeFlag&6?Ft[Ft.indexOf(t)]=l:Ft.push(l)),l.patchFlag=-2,l}if(ov(t)&&(t=t.__vccOpts),e){e=Qy(e);let{class:l,style:c}=e;l&&!it(l)&&(e.class=ri(l)),Je(c)&&(pc(c)&&!de(c)&&(c=ct({},c)),e.style=ni(c))}const a=it(t)?1:fp(t)?128:sy(t)?64:Je(t)?4:me(t)?2:0;return B(t,e,n,r,s,a,i,!0)}function Qy(t){return t?pc(t)||np(t)?ct({},t):t:null}function ss(t,e,n=!1,r=!1){const{props:s,ref:i,patchFlag:a,children:l,transition:c}=t,h=e?Yy(s||{},e):s,d={__v_isVNode:!0,__v_skip:!0,type:t.type,props:h,key:h&&gp(h),ref:e&&e.ref?n&&i?de(i)?i.concat(ho(e)):[i,ho(e)]:ho(e):i,scopeId:t.scopeId,slotScopeIds:t.slotScopeIds,children:l,target:t.target,targetStart:t.targetStart,targetAnchor:t.targetAnchor,staticCount:t.staticCount,shapeFlag:t.shapeFlag,patchFlag:e&&t.type!==ft?a===-1?16:a|16:a,dynamicProps:t.dynamicProps,dynamicChildren:t.dynamicChildren,appContext:t.appContext,dirs:t.dirs,transition:c,component:t.component,suspense:t.suspense,ssContent:t.ssContent&&ss(t.ssContent),ssFallback:t.ssFallback&&ss(t.ssFallback),el:t.el,anchor:t.anchor,ctx:t.ctx,ce:t.ce};return c&&r&&_c(d,c.clone(d)),d}function Jy(t=" ",e=0){return Ut(na,null,t,e)}function Bn(t="",e=!1){return e?(Ie(),mp(rr,null,t)):Ut(rr,null,t)}function sn(t){return t==null||typeof t=="boolean"?Ut(rr):de(t)?Ut(ft,null,t.slice()):Po(t)?jn(t):Ut(na,null,String(t))}function jn(t){return t.el===null&&t.patchFlag!==-1||t.memo?t:ss(t)}function Tc(t,e){let n=0;const{shapeFlag:r}=t;if(e==null)e=null;else if(de(e))n=16;else if(typeof e=="object")if(r&65){const s=e.default;s&&(s._c&&(s._d=!1),Tc(t,s()),s._c&&(s._d=!0));return}else{n=32;const s=e._;!s&&!np(e)?e._ctx=Lt:s===3&&Lt&&(Lt.slots._===1?e._=1:(e._=2,t.patchFlag|=1024))}else me(e)?(e={default:e,_ctx:Lt},n=32):(e=String(e),r&64?(n=16,e=[Jy(e)]):n=8);t.children=e,t.shapeFlag|=n}function Yy(...t){const e={};for(let n=0;n<t.length;n++){const r=t[n];for(const s in r)if(s==="class")e.class!==r.class&&(e.class=ri([e.class,r.class]));else if(s==="style")e.style=ni([e.style,r.style]);else if(Ko(s)){const i=e[s],a=r[s];a&&i!==a&&!(de(i)&&i.includes(a))&&(e[s]=i?[].concat(i,a):a)}else s!==""&&(e[s]=r[s])}return e}function nn(t,e,n,r=null){hn(t,e,7,[n,r])}const Xy=Zf();let Zy=0;function ev(t,e,n){const r=t.type,s=(e?e.appContext:t.appContext)||Xy,i={uid:Zy++,vnode:t,type:r,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new A_(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:sp(r,s),emitsOptions:dp(r,s),emit:null,emitted:null,propsDefaults:He,inheritAttrs:r.inheritAttrs,ctx:He,data:He,props:He,attrs:He,slots:He,refs:He,setupState:He,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return i.ctx={_:i},i.root=e?e.root:i,i.emit=jy.bind(null,i),t.ce&&t.ce(i),i}let bt=null,Co,Cl;{const t=Jo(),e=(n,r)=>{let s;return(s=t[n])||(s=t[n]=[]),s.push(r),i=>{s.length>1?s.forEach(a=>a(i)):s[0](i)}};Co=e("__VUE_INSTANCE_SETTERS__",n=>bt=n),Cl=e("__VUE_SSR_SETTERS__",n=>li=n)}const Ti=t=>{const e=bt;return Co(t),t.scope.on(),()=>{t.scope.off(),Co(e)}},Eh=()=>{bt&&bt.scope.off(),Co(null)};function _p(t){return t.vnode.shapeFlag&4}let li=!1;function tv(t,e=!1,n=!1){e&&Cl(e);const{props:r,children:s}=t.vnode,i=_p(t);Sy(t,r,i,e),xy(t,s,n||e);const a=i?nv(t,e):void 0;return e&&Cl(!1),a}function nv(t,e){const n=t.type;t.accessCache=Object.create(null),t.proxy=new Proxy(t.ctx,vy);const{setup:r}=n;if(r){bn();const s=t.setupContext=r.length>1?sv(t):null,i=Ti(t),a=wi(r,t,0,[t.props,s]),l=_f(a);if(An(),i(),(l||t.sp)&&!Ks(t)&&Wf(t),l){if(a.then(Eh,Eh),e)return a.then(c=>{wh(t,c,e)}).catch(c=>{Zo(c,t,0)});t.asyncDep=a}else wh(t,a,e)}else yp(t,e)}function wh(t,e,n){me(e)?t.type.__ssrInlineRender?t.ssrRender=e:t.render=e:Je(e)&&(t.setupState=Bf(e)),yp(t,n)}let Th;function yp(t,e,n){const r=t.type;if(!t.render){if(!e&&Th&&!r.render){const s=r.template||vc(t).template;if(s){const{isCustomElement:i,compilerOptions:a}=t.appContext.config,{delimiters:l,compilerOptions:c}=r,h=ct(ct({isCustomElement:i,delimiters:l},a),c);r.render=Th(s,h)}}t.render=r.render||Xt}{const s=Ti(t);bn();try{Ey(t)}finally{An(),s()}}}const rv={get(t,e){return Tt(t,"get",""),t[e]}};function sv(t){const e=n=>{t.exposed=n||{}};return{attrs:new Proxy(t.attrs,rv),slots:t.slots,emit:t.emit,expose:e}}function ra(t){return t.exposed?t.exposeProxy||(t.exposeProxy=new Proxy(Bf(z_(t.exposed)),{get(e,n){if(n in e)return e[n];if(n in Ws)return Ws[n](t)},has(e,n){return n in e||n in Ws}})):t.proxy}function iv(t,e=!0){return me(t)?t.displayName||t.name:t.name||e&&t.__name}function ov(t){return me(t)&&"__vccOpts"in t}const Jt=(t,e)=>J_(t,e,li);function vp(t,e,n){const r=arguments.length;return r===2?Je(e)&&!de(e)?Po(e)?Ut(t,null,[e]):Ut(t,e):Ut(t,null,e):(r>3?n=Array.prototype.slice.call(arguments,2):r===3&&Po(n)&&(n=[n]),Ut(t,e,n))}const av="3.5.17";/**
* @vue/runtime-dom v3.5.17
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let kl;const Ih=typeof window<"u"&&window.trustedTypes;if(Ih)try{kl=Ih.createPolicy("vue",{createHTML:t=>t})}catch{}const Ep=kl?t=>kl.createHTML(t):t=>t,lv="http://www.w3.org/2000/svg",cv="http://www.w3.org/1998/Math/MathML",_n=typeof document<"u"?document:null,bh=_n&&_n.createElement("template"),uv={insert:(t,e,n)=>{e.insertBefore(t,n||null)},remove:t=>{const e=t.parentNode;e&&e.removeChild(t)},createElement:(t,e,n,r)=>{const s=e==="svg"?_n.createElementNS(lv,t):e==="mathml"?_n.createElementNS(cv,t):n?_n.createElement(t,{is:n}):_n.createElement(t);return t==="select"&&r&&r.multiple!=null&&s.setAttribute("multiple",r.multiple),s},createText:t=>_n.createTextNode(t),createComment:t=>_n.createComment(t),setText:(t,e)=>{t.nodeValue=e},setElementText:(t,e)=>{t.textContent=e},parentNode:t=>t.parentNode,nextSibling:t=>t.nextSibling,querySelector:t=>_n.querySelector(t),setScopeId(t,e){t.setAttribute(e,"")},insertStaticContent(t,e,n,r,s,i){const a=n?n.previousSibling:e.lastChild;if(s&&(s===i||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),n),!(s===i||!(s=s.nextSibling)););else{bh.innerHTML=Ep(r==="svg"?`<svg>${t}</svg>`:r==="mathml"?`<math>${t}</math>`:t);const l=bh.content;if(r==="svg"||r==="mathml"){const c=l.firstChild;for(;c.firstChild;)l.appendChild(c.firstChild);l.removeChild(c)}e.insertBefore(l,n)}return[a?a.nextSibling:e.firstChild,n?n.previousSibling:e.lastChild]}},hv=Symbol("_vtc");function dv(t,e,n){const r=t[hv];r&&(e=(e?[e,...r]:[...r]).join(" ")),e==null?t.removeAttribute("class"):n?t.setAttribute("class",e):t.className=e}const Ah=Symbol("_vod"),fv=Symbol("_vsh"),pv=Symbol(""),mv=/(^|;)\s*display\s*:/;function gv(t,e,n){const r=t.style,s=it(n);let i=!1;if(n&&!s){if(e)if(it(e))for(const a of e.split(";")){const l=a.slice(0,a.indexOf(":")).trim();n[l]==null&&fo(r,l,"")}else for(const a in e)n[a]==null&&fo(r,a,"");for(const a in n)a==="display"&&(i=!0),fo(r,a,n[a])}else if(s){if(e!==n){const a=r[pv];a&&(n+=";"+a),r.cssText=n,i=mv.test(n)}}else e&&t.removeAttribute("style");Ah in t&&(t[Ah]=i?r.display:"",t[fv]&&(r.display="none"))}const Rh=/\s*!important$/;function fo(t,e,n){if(de(n))n.forEach(r=>fo(t,e,r));else if(n==null&&(n=""),e.startsWith("--"))t.setProperty(e,n);else{const r=_v(t,e);Rh.test(n)?t.setProperty(ur(r),n.replace(Rh,""),"important"):t[r]=n}}const Sh=["Webkit","Moz","ms"],el={};function _v(t,e){const n=el[e];if(n)return n;let r=Kt(e);if(r!=="filter"&&r in t)return el[e]=r;r=Qo(r);for(let s=0;s<Sh.length;s++){const i=Sh[s]+r;if(i in t)return el[e]=i}return e}const Ph="http://www.w3.org/1999/xlink";function Ch(t,e,n,r,s,i=b_(e)){r&&e.startsWith("xlink:")?n==null?t.removeAttributeNS(Ph,e.slice(6,e.length)):t.setAttributeNS(Ph,e,n):n==null||i&&!Ef(n)?t.removeAttribute(e):t.setAttribute(e,i?"":cr(n)?String(n):n)}function kh(t,e,n,r,s){if(e==="innerHTML"||e==="textContent"){n!=null&&(t[e]=e==="innerHTML"?Ep(n):n);return}const i=t.tagName;if(e==="value"&&i!=="PROGRESS"&&!i.includes("-")){const l=i==="OPTION"?t.getAttribute("value")||"":t.value,c=n==null?t.type==="checkbox"?"on":"":String(n);(l!==c||!("_value"in t))&&(t.value=c),n==null&&t.removeAttribute(e),t._value=n;return}let a=!1;if(n===""||n==null){const l=typeof t[e];l==="boolean"?n=Ef(n):n==null&&l==="string"?(n="",a=!0):l==="number"&&(n=0,a=!0)}try{t[e]=n}catch{}a&&t.removeAttribute(s||e)}function $r(t,e,n,r){t.addEventListener(e,n,r)}function yv(t,e,n,r){t.removeEventListener(e,n,r)}const xh=Symbol("_vei");function vv(t,e,n,r,s=null){const i=t[xh]||(t[xh]={}),a=i[e];if(r&&a)a.value=r;else{const[l,c]=Ev(e);if(r){const h=i[e]=Iv(r,s);$r(t,l,h,c)}else a&&(yv(t,l,a,c),i[e]=void 0)}}const Dh=/(?:Once|Passive|Capture)$/;function Ev(t){let e;if(Dh.test(t)){e={};let r;for(;r=t.match(Dh);)t=t.slice(0,t.length-r[0].length),e[r[0].toLowerCase()]=!0}return[t[2]===":"?t.slice(3):ur(t.slice(2)),e]}let tl=0;const wv=Promise.resolve(),Tv=()=>tl||(wv.then(()=>tl=0),tl=Date.now());function Iv(t,e){const n=r=>{if(!r._vts)r._vts=Date.now();else if(r._vts<=n.attached)return;hn(bv(r,n.value),e,5,[r])};return n.value=t,n.attached=Tv(),n}function bv(t,e){if(de(e)){const n=t.stopImmediatePropagation;return t.stopImmediatePropagation=()=>{n.call(t),t._stopped=!0},e.map(r=>s=>!s._stopped&&r&&r(s))}else return e}const Vh=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&t.charCodeAt(2)>96&&t.charCodeAt(2)<123,Av=(t,e,n,r,s,i)=>{const a=s==="svg";e==="class"?dv(t,r,a):e==="style"?gv(t,n,r):Ko(e)?ic(e)||vv(t,e,n,r,i):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):Rv(t,e,r,a))?(kh(t,e,r),!t.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&Ch(t,e,r,a,i,e!=="value")):t._isVueCE&&(/[A-Z]/.test(e)||!it(r))?kh(t,Kt(e),r,i,e):(e==="true-value"?t._trueValue=r:e==="false-value"&&(t._falseValue=r),Ch(t,e,r,a))};function Rv(t,e,n,r){if(r)return!!(e==="innerHTML"||e==="textContent"||e in t&&Vh(e)&&me(n));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="form"||e==="list"&&t.tagName==="INPUT"||e==="type"&&t.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=t.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return Vh(e)&&it(n)?!1:e in t}const Nh=t=>{const e=t.props["onUpdate:modelValue"]||!1;return de(e)?n=>lo(e,n):e};function Sv(t){t.target.composing=!0}function Oh(t){const e=t.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const nl=Symbol("_assign"),$n={created(t,{modifiers:{lazy:e,trim:n,number:r}},s){t[nl]=Nh(s);const i=r||s.props&&s.props.type==="number";$r(t,e?"change":"input",a=>{if(a.target.composing)return;let l=t.value;n&&(l=l.trim()),i&&(l=El(l)),t[nl](l)}),n&&$r(t,"change",()=>{t.value=t.value.trim()}),e||($r(t,"compositionstart",Sv),$r(t,"compositionend",Oh),$r(t,"change",Oh))},mounted(t,{value:e}){t.value=e??""},beforeUpdate(t,{value:e,oldValue:n,modifiers:{lazy:r,trim:s,number:i}},a){if(t[nl]=Nh(a),t.composing)return;const l=(i||t.type==="number")&&!/^0\d/.test(t.value)?El(t.value):t.value,c=e??"";l!==c&&(document.activeElement===t&&t.type!=="range"&&(r&&e===n||s&&t.value.trim()===c)||(t.value=c))}},Pv=["ctrl","shift","alt","meta"],Cv={stop:t=>t.stopPropagation(),prevent:t=>t.preventDefault(),self:t=>t.target!==t.currentTarget,ctrl:t=>!t.ctrlKey,shift:t=>!t.shiftKey,alt:t=>!t.altKey,meta:t=>!t.metaKey,left:t=>"button"in t&&t.button!==0,middle:t=>"button"in t&&t.button!==1,right:t=>"button"in t&&t.button!==2,exact:(t,e)=>Pv.some(n=>t[`${n}Key`]&&!e.includes(n))},kv=(t,e)=>{const n=t._withMods||(t._withMods={}),r=e.join(".");return n[r]||(n[r]=(s,...i)=>{for(let a=0;a<e.length;a++){const l=Cv[e[a]];if(l&&l(s,e))return}return t(s,...i)})},xv={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},Br=(t,e)=>{const n=t._withKeys||(t._withKeys={}),r=e.join(".");return n[r]||(n[r]=s=>{if(!("key"in s))return;const i=ur(s.key);if(e.some(a=>a===i||xv[a]===i))return t(s)})},Dv=ct({patchProp:Av},uv);let Mh;function Vv(){return Mh||(Mh=Vy(Dv))}const Nv=(...t)=>{const e=Vv().createApp(...t),{mount:n}=e;return e.mount=r=>{const s=Mv(r);if(!s)return;const i=e._component;!me(i)&&!i.render&&!i.template&&(i.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const a=n(s,!1,Ov(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),a},e};function Ov(t){if(t instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&t instanceof MathMLElement)return"mathml"}function Mv(t){return it(t)?document.querySelector(t):t}const Lv={__name:"App",setup(t){return(e,n)=>{const r=gy("router-view");return Ie(),mp(r)}}};/*!
  * vue-router v4.5.1
  * (c) 2025 Eduardo San Martin Morote
  * @license MIT
  */const qr=typeof document<"u";function wp(t){return typeof t=="object"||"displayName"in t||"props"in t||"__vccOpts"in t}function Fv(t){return t.__esModule||t[Symbol.toStringTag]==="Module"||t.default&&wp(t.default)}const Oe=Object.assign;function rl(t,e){const n={};for(const r in e){const s=e[r];n[r]=en(s)?s.map(t):t(s)}return n}const Qs=()=>{},en=Array.isArray,Tp=/#/g,Uv=/&/g,Bv=/\//g,jv=/=/g,$v=/\?/g,Ip=/\+/g,qv=/%5B/g,Hv=/%5D/g,bp=/%5E/g,zv=/%60/g,Ap=/%7B/g,Kv=/%7C/g,Rp=/%7D/g,Wv=/%20/g;function Ic(t){return encodeURI(""+t).replace(Kv,"|").replace(qv,"[").replace(Hv,"]")}function Gv(t){return Ic(t).replace(Ap,"{").replace(Rp,"}").replace(bp,"^")}function xl(t){return Ic(t).replace(Ip,"%2B").replace(Wv,"+").replace(Tp,"%23").replace(Uv,"%26").replace(zv,"`").replace(Ap,"{").replace(Rp,"}").replace(bp,"^")}function Qv(t){return xl(t).replace(jv,"%3D")}function Jv(t){return Ic(t).replace(Tp,"%23").replace($v,"%3F")}function Yv(t){return t==null?"":Jv(t).replace(Bv,"%2F")}function ci(t){try{return decodeURIComponent(""+t)}catch{}return""+t}const Xv=/\/$/,Zv=t=>t.replace(Xv,"");function sl(t,e,n="/"){let r,s={},i="",a="";const l=e.indexOf("#");let c=e.indexOf("?");return l<c&&l>=0&&(c=-1),c>-1&&(r=e.slice(0,c),i=e.slice(c+1,l>-1?l:e.length),s=t(i)),l>-1&&(r=r||e.slice(0,l),a=e.slice(l,e.length)),r=rE(r??e,n),{fullPath:r+(i&&"?")+i+a,path:r,query:s,hash:ci(a)}}function eE(t,e){const n=e.query?t(e.query):"";return e.path+(n&&"?")+n+(e.hash||"")}function Lh(t,e){return!e||!t.toLowerCase().startsWith(e.toLowerCase())?t:t.slice(e.length)||"/"}function tE(t,e,n){const r=e.matched.length-1,s=n.matched.length-1;return r>-1&&r===s&&is(e.matched[r],n.matched[s])&&Sp(e.params,n.params)&&t(e.query)===t(n.query)&&e.hash===n.hash}function is(t,e){return(t.aliasOf||t)===(e.aliasOf||e)}function Sp(t,e){if(Object.keys(t).length!==Object.keys(e).length)return!1;for(const n in t)if(!nE(t[n],e[n]))return!1;return!0}function nE(t,e){return en(t)?Fh(t,e):en(e)?Fh(e,t):t===e}function Fh(t,e){return en(e)?t.length===e.length&&t.every((n,r)=>n===e[r]):t.length===1&&t[0]===e}function rE(t,e){if(t.startsWith("/"))return t;if(!t)return e;const n=e.split("/"),r=t.split("/"),s=r[r.length-1];(s===".."||s===".")&&r.push("");let i=n.length-1,a,l;for(a=0;a<r.length;a++)if(l=r[a],l!==".")if(l==="..")i>1&&i--;else break;return n.slice(0,i).join("/")+"/"+r.slice(a).join("/")}const Mn={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0};var ui;(function(t){t.pop="pop",t.push="push"})(ui||(ui={}));var Js;(function(t){t.back="back",t.forward="forward",t.unknown=""})(Js||(Js={}));function sE(t){if(!t)if(qr){const e=document.querySelector("base");t=e&&e.getAttribute("href")||"/",t=t.replace(/^\w+:\/\/[^\/]+/,"")}else t="/";return t[0]!=="/"&&t[0]!=="#"&&(t="/"+t),Zv(t)}const iE=/^[^#]+#/;function oE(t,e){return t.replace(iE,"#")+e}function aE(t,e){const n=document.documentElement.getBoundingClientRect(),r=t.getBoundingClientRect();return{behavior:e.behavior,left:r.left-n.left-(e.left||0),top:r.top-n.top-(e.top||0)}}const sa=()=>({left:window.scrollX,top:window.scrollY});function lE(t){let e;if("el"in t){const n=t.el,r=typeof n=="string"&&n.startsWith("#"),s=typeof n=="string"?r?document.getElementById(n.slice(1)):document.querySelector(n):n;if(!s)return;e=aE(s,t)}else e=t;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.scrollX,e.top!=null?e.top:window.scrollY)}function Uh(t,e){return(history.state?history.state.position-e:-1)+t}const Dl=new Map;function cE(t,e){Dl.set(t,e)}function uE(t){const e=Dl.get(t);return Dl.delete(t),e}let hE=()=>location.protocol+"//"+location.host;function Pp(t,e){const{pathname:n,search:r,hash:s}=e,i=t.indexOf("#");if(i>-1){let l=s.includes(t.slice(i))?t.slice(i).length:1,c=s.slice(l);return c[0]!=="/"&&(c="/"+c),Lh(c,"")}return Lh(n,t)+r+s}function dE(t,e,n,r){let s=[],i=[],a=null;const l=({state:g})=>{const y=Pp(t,location),x=n.value,N=e.value;let O=0;if(g){if(n.value=y,e.value=g,a&&a===x){a=null;return}O=N?g.position-N.position:0}else r(y);s.forEach(q=>{q(n.value,x,{delta:O,type:ui.pop,direction:O?O>0?Js.forward:Js.back:Js.unknown})})};function c(){a=n.value}function h(g){s.push(g);const y=()=>{const x=s.indexOf(g);x>-1&&s.splice(x,1)};return i.push(y),y}function d(){const{history:g}=window;g.state&&g.replaceState(Oe({},g.state,{scroll:sa()}),"")}function p(){for(const g of i)g();i=[],window.removeEventListener("popstate",l),window.removeEventListener("beforeunload",d)}return window.addEventListener("popstate",l),window.addEventListener("beforeunload",d,{passive:!0}),{pauseListeners:c,listen:h,destroy:p}}function Bh(t,e,n,r=!1,s=!1){return{back:t,current:e,forward:n,replaced:r,position:window.history.length,scroll:s?sa():null}}function fE(t){const{history:e,location:n}=window,r={value:Pp(t,n)},s={value:e.state};s.value||i(r.value,{back:null,current:r.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function i(c,h,d){const p=t.indexOf("#"),g=p>-1?(n.host&&document.querySelector("base")?t:t.slice(p))+c:hE()+t+c;try{e[d?"replaceState":"pushState"](h,"",g),s.value=h}catch(y){console.error(y),n[d?"replace":"assign"](g)}}function a(c,h){const d=Oe({},e.state,Bh(s.value.back,c,s.value.forward,!0),h,{position:s.value.position});i(c,d,!0),r.value=c}function l(c,h){const d=Oe({},s.value,e.state,{forward:c,scroll:sa()});i(d.current,d,!0);const p=Oe({},Bh(r.value,c,null),{position:d.position+1},h);i(c,p,!1),r.value=c}return{location:r,state:s,push:l,replace:a}}function pE(t){t=sE(t);const e=fE(t),n=dE(t,e.state,e.location,e.replace);function r(i,a=!0){a||n.pauseListeners(),history.go(i)}const s=Oe({location:"",base:t,go:r,createHref:oE.bind(null,t)},e,n);return Object.defineProperty(s,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(s,"state",{enumerable:!0,get:()=>e.state.value}),s}function mE(t){return typeof t=="string"||t&&typeof t=="object"}function Cp(t){return typeof t=="string"||typeof t=="symbol"}const kp=Symbol("");var jh;(function(t){t[t.aborted=4]="aborted",t[t.cancelled=8]="cancelled",t[t.duplicated=16]="duplicated"})(jh||(jh={}));function os(t,e){return Oe(new Error,{type:t,[kp]:!0},e)}function gn(t,e){return t instanceof Error&&kp in t&&(e==null||!!(t.type&e))}const $h="[^/]+?",gE={sensitive:!1,strict:!1,start:!0,end:!0},_E=/[.+*?^${}()[\]/\\]/g;function yE(t,e){const n=Oe({},gE,e),r=[];let s=n.start?"^":"";const i=[];for(const h of t){const d=h.length?[]:[90];n.strict&&!h.length&&(s+="/");for(let p=0;p<h.length;p++){const g=h[p];let y=40+(n.sensitive?.25:0);if(g.type===0)p||(s+="/"),s+=g.value.replace(_E,"\\$&"),y+=40;else if(g.type===1){const{value:x,repeatable:N,optional:O,regexp:q}=g;i.push({name:x,repeatable:N,optional:O});const U=q||$h;if(U!==$h){y+=10;try{new RegExp(`(${U})`)}catch(J){throw new Error(`Invalid custom RegExp for param "${x}" (${U}): `+J.message)}}let G=N?`((?:${U})(?:/(?:${U}))*)`:`(${U})`;p||(G=O&&h.length<2?`(?:/${G})`:"/"+G),O&&(G+="?"),s+=G,y+=20,O&&(y+=-8),N&&(y+=-20),U===".*"&&(y+=-50)}d.push(y)}r.push(d)}if(n.strict&&n.end){const h=r.length-1;r[h][r[h].length-1]+=.7000000000000001}n.strict||(s+="/?"),n.end?s+="$":n.strict&&!s.endsWith("/")&&(s+="(?:/|$)");const a=new RegExp(s,n.sensitive?"":"i");function l(h){const d=h.match(a),p={};if(!d)return null;for(let g=1;g<d.length;g++){const y=d[g]||"",x=i[g-1];p[x.name]=y&&x.repeatable?y.split("/"):y}return p}function c(h){let d="",p=!1;for(const g of t){(!p||!d.endsWith("/"))&&(d+="/"),p=!1;for(const y of g)if(y.type===0)d+=y.value;else if(y.type===1){const{value:x,repeatable:N,optional:O}=y,q=x in h?h[x]:"";if(en(q)&&!N)throw new Error(`Provided param "${x}" is an array but it is not repeatable (* or + modifiers)`);const U=en(q)?q.join("/"):q;if(!U)if(O)g.length<2&&(d.endsWith("/")?d=d.slice(0,-1):p=!0);else throw new Error(`Missing required param "${x}"`);d+=U}}return d||"/"}return{re:a,score:r,keys:i,parse:l,stringify:c}}function vE(t,e){let n=0;for(;n<t.length&&n<e.length;){const r=e[n]-t[n];if(r)return r;n++}return t.length<e.length?t.length===1&&t[0]===40+40?-1:1:t.length>e.length?e.length===1&&e[0]===40+40?1:-1:0}function xp(t,e){let n=0;const r=t.score,s=e.score;for(;n<r.length&&n<s.length;){const i=vE(r[n],s[n]);if(i)return i;n++}if(Math.abs(s.length-r.length)===1){if(qh(r))return 1;if(qh(s))return-1}return s.length-r.length}function qh(t){const e=t[t.length-1];return t.length>0&&e[e.length-1]<0}const EE={type:0,value:""},wE=/[a-zA-Z0-9_]/;function TE(t){if(!t)return[[]];if(t==="/")return[[EE]];if(!t.startsWith("/"))throw new Error(`Invalid path "${t}"`);function e(y){throw new Error(`ERR (${n})/"${h}": ${y}`)}let n=0,r=n;const s=[];let i;function a(){i&&s.push(i),i=[]}let l=0,c,h="",d="";function p(){h&&(n===0?i.push({type:0,value:h}):n===1||n===2||n===3?(i.length>1&&(c==="*"||c==="+")&&e(`A repeatable param (${h}) must be alone in its segment. eg: '/:ids+.`),i.push({type:1,value:h,regexp:d,repeatable:c==="*"||c==="+",optional:c==="*"||c==="?"})):e("Invalid state to consume buffer"),h="")}function g(){h+=c}for(;l<t.length;){if(c=t[l++],c==="\\"&&n!==2){r=n,n=4;continue}switch(n){case 0:c==="/"?(h&&p(),a()):c===":"?(p(),n=1):g();break;case 4:g(),n=r;break;case 1:c==="("?n=2:wE.test(c)?g():(p(),n=0,c!=="*"&&c!=="?"&&c!=="+"&&l--);break;case 2:c===")"?d[d.length-1]=="\\"?d=d.slice(0,-1)+c:n=3:d+=c;break;case 3:p(),n=0,c!=="*"&&c!=="?"&&c!=="+"&&l--,d="";break;default:e("Unknown state");break}}return n===2&&e(`Unfinished custom RegExp for param "${h}"`),p(),a(),s}function IE(t,e,n){const r=yE(TE(t.path),n),s=Oe(r,{record:t,parent:e,children:[],alias:[]});return e&&!s.record.aliasOf==!e.record.aliasOf&&e.children.push(s),s}function bE(t,e){const n=[],r=new Map;e=Wh({strict:!1,end:!0,sensitive:!1},e);function s(p){return r.get(p)}function i(p,g,y){const x=!y,N=zh(p);N.aliasOf=y&&y.record;const O=Wh(e,p),q=[N];if("alias"in p){const J=typeof p.alias=="string"?[p.alias]:p.alias;for(const ge of J)q.push(zh(Oe({},N,{components:y?y.record.components:N.components,path:ge,aliasOf:y?y.record:N})))}let U,G;for(const J of q){const{path:ge}=J;if(g&&ge[0]!=="/"){const _e=g.record.path,I=_e[_e.length-1]==="/"?"":"/";J.path=g.record.path+(ge&&I+ge)}if(U=IE(J,g,O),y?y.alias.push(U):(G=G||U,G!==U&&G.alias.push(U),x&&p.name&&!Kh(U)&&a(p.name)),Dp(U)&&c(U),N.children){const _e=N.children;for(let I=0;I<_e.length;I++)i(_e[I],U,y&&y.children[I])}y=y||U}return G?()=>{a(G)}:Qs}function a(p){if(Cp(p)){const g=r.get(p);g&&(r.delete(p),n.splice(n.indexOf(g),1),g.children.forEach(a),g.alias.forEach(a))}else{const g=n.indexOf(p);g>-1&&(n.splice(g,1),p.record.name&&r.delete(p.record.name),p.children.forEach(a),p.alias.forEach(a))}}function l(){return n}function c(p){const g=SE(p,n);n.splice(g,0,p),p.record.name&&!Kh(p)&&r.set(p.record.name,p)}function h(p,g){let y,x={},N,O;if("name"in p&&p.name){if(y=r.get(p.name),!y)throw os(1,{location:p});O=y.record.name,x=Oe(Hh(g.params,y.keys.filter(G=>!G.optional).concat(y.parent?y.parent.keys.filter(G=>G.optional):[]).map(G=>G.name)),p.params&&Hh(p.params,y.keys.map(G=>G.name))),N=y.stringify(x)}else if(p.path!=null)N=p.path,y=n.find(G=>G.re.test(N)),y&&(x=y.parse(N),O=y.record.name);else{if(y=g.name?r.get(g.name):n.find(G=>G.re.test(g.path)),!y)throw os(1,{location:p,currentLocation:g});O=y.record.name,x=Oe({},g.params,p.params),N=y.stringify(x)}const q=[];let U=y;for(;U;)q.unshift(U.record),U=U.parent;return{name:O,path:N,params:x,matched:q,meta:RE(q)}}t.forEach(p=>i(p));function d(){n.length=0,r.clear()}return{addRoute:i,resolve:h,removeRoute:a,clearRoutes:d,getRoutes:l,getRecordMatcher:s}}function Hh(t,e){const n={};for(const r of e)r in t&&(n[r]=t[r]);return n}function zh(t){const e={path:t.path,redirect:t.redirect,name:t.name,meta:t.meta||{},aliasOf:t.aliasOf,beforeEnter:t.beforeEnter,props:AE(t),children:t.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in t?t.components||null:t.component&&{default:t.component}};return Object.defineProperty(e,"mods",{value:{}}),e}function AE(t){const e={},n=t.props||!1;if("component"in t)e.default=n;else for(const r in t.components)e[r]=typeof n=="object"?n[r]:n;return e}function Kh(t){for(;t;){if(t.record.aliasOf)return!0;t=t.parent}return!1}function RE(t){return t.reduce((e,n)=>Oe(e,n.meta),{})}function Wh(t,e){const n={};for(const r in t)n[r]=r in e?e[r]:t[r];return n}function SE(t,e){let n=0,r=e.length;for(;n!==r;){const i=n+r>>1;xp(t,e[i])<0?r=i:n=i+1}const s=PE(t);return s&&(r=e.lastIndexOf(s,r-1)),r}function PE(t){let e=t;for(;e=e.parent;)if(Dp(e)&&xp(t,e)===0)return e}function Dp({record:t}){return!!(t.name||t.components&&Object.keys(t.components).length||t.redirect)}function CE(t){const e={};if(t===""||t==="?")return e;const r=(t[0]==="?"?t.slice(1):t).split("&");for(let s=0;s<r.length;++s){const i=r[s].replace(Ip," "),a=i.indexOf("="),l=ci(a<0?i:i.slice(0,a)),c=a<0?null:ci(i.slice(a+1));if(l in e){let h=e[l];en(h)||(h=e[l]=[h]),h.push(c)}else e[l]=c}return e}function Gh(t){let e="";for(let n in t){const r=t[n];if(n=Qv(n),r==null){r!==void 0&&(e+=(e.length?"&":"")+n);continue}(en(r)?r.map(i=>i&&xl(i)):[r&&xl(r)]).forEach(i=>{i!==void 0&&(e+=(e.length?"&":"")+n,i!=null&&(e+="="+i))})}return e}function kE(t){const e={};for(const n in t){const r=t[n];r!==void 0&&(e[n]=en(r)?r.map(s=>s==null?null:""+s):r==null?r:""+r)}return e}const xE=Symbol(""),Qh=Symbol(""),ia=Symbol(""),Vp=Symbol(""),Vl=Symbol("");function Ms(){let t=[];function e(r){return t.push(r),()=>{const s=t.indexOf(r);s>-1&&t.splice(s,1)}}function n(){t=[]}return{add:e,list:()=>t.slice(),reset:n}}function qn(t,e,n,r,s,i=a=>a()){const a=r&&(r.enterCallbacks[s]=r.enterCallbacks[s]||[]);return()=>new Promise((l,c)=>{const h=g=>{g===!1?c(os(4,{from:n,to:e})):g instanceof Error?c(g):mE(g)?c(os(2,{from:e,to:g})):(a&&r.enterCallbacks[s]===a&&typeof g=="function"&&a.push(g),l())},d=i(()=>t.call(r&&r.instances[s],e,n,h));let p=Promise.resolve(d);t.length<3&&(p=p.then(h)),p.catch(g=>c(g))})}function il(t,e,n,r,s=i=>i()){const i=[];for(const a of t)for(const l in a.components){let c=a.components[l];if(!(e!=="beforeRouteEnter"&&!a.instances[l]))if(wp(c)){const d=(c.__vccOpts||c)[e];d&&i.push(qn(d,n,r,a,l,s))}else{let h=c();i.push(()=>h.then(d=>{if(!d)throw new Error(`Couldn't resolve component "${l}" at "${a.path}"`);const p=Fv(d)?d.default:d;a.mods[l]=d,a.components[l]=p;const y=(p.__vccOpts||p)[e];return y&&qn(y,n,r,a,l,s)()}))}}return i}function Jh(t){const e=on(ia),n=on(Vp),r=Jt(()=>{const c=Yr(t.to);return e.resolve(c)}),s=Jt(()=>{const{matched:c}=r.value,{length:h}=c,d=c[h-1],p=n.matched;if(!d||!p.length)return-1;const g=p.findIndex(is.bind(null,d));if(g>-1)return g;const y=Yh(c[h-2]);return h>1&&Yh(d)===y&&p[p.length-1].path!==y?p.findIndex(is.bind(null,c[h-2])):g}),i=Jt(()=>s.value>-1&&ME(n.params,r.value.params)),a=Jt(()=>s.value>-1&&s.value===n.matched.length-1&&Sp(n.params,r.value.params));function l(c={}){if(OE(c)){const h=e[Yr(t.replace)?"replace":"push"](Yr(t.to)).catch(Qs);return t.viewTransition&&typeof document<"u"&&"startViewTransition"in document&&document.startViewTransition(()=>h),h}return Promise.resolve()}return{route:r,href:Jt(()=>r.value.href),isActive:i,isExactActive:a,navigate:l}}function DE(t){return t.length===1?t[0]:t}const VE=Kf({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"},viewTransition:Boolean},useLink:Jh,setup(t,{slots:e}){const n=Xo(Jh(t)),{options:r}=on(ia),s=Jt(()=>({[Xh(t.activeClass,r.linkActiveClass,"router-link-active")]:n.isActive,[Xh(t.exactActiveClass,r.linkExactActiveClass,"router-link-exact-active")]:n.isExactActive}));return()=>{const i=e.default&&DE(e.default(n));return t.custom?i:vp("a",{"aria-current":n.isExactActive?t.ariaCurrentValue:null,href:n.href,onClick:n.navigate,class:s.value},i)}}}),NE=VE;function OE(t){if(!(t.metaKey||t.altKey||t.ctrlKey||t.shiftKey)&&!t.defaultPrevented&&!(t.button!==void 0&&t.button!==0)){if(t.currentTarget&&t.currentTarget.getAttribute){const e=t.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return t.preventDefault&&t.preventDefault(),!0}}function ME(t,e){for(const n in e){const r=e[n],s=t[n];if(typeof r=="string"){if(r!==s)return!1}else if(!en(s)||s.length!==r.length||r.some((i,a)=>i!==s[a]))return!1}return!0}function Yh(t){return t?t.aliasOf?t.aliasOf.path:t.path:""}const Xh=(t,e,n)=>t??e??n,LE=Kf({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(t,{attrs:e,slots:n}){const r=on(Vl),s=Jt(()=>t.route||r.value),i=on(Qh,0),a=Jt(()=>{let h=Yr(i);const{matched:d}=s.value;let p;for(;(p=d[h])&&!p.components;)h++;return h}),l=Jt(()=>s.value.matched[a.value]);co(Qh,Jt(()=>a.value+1)),co(xE,l),co(Vl,s);const c=Re();return uo(()=>[c.value,l.value,t.name],([h,d,p],[g,y,x])=>{d&&(d.instances[p]=h,y&&y!==d&&h&&h===g&&(d.leaveGuards.size||(d.leaveGuards=y.leaveGuards),d.updateGuards.size||(d.updateGuards=y.updateGuards))),h&&d&&(!y||!is(d,y)||!g)&&(d.enterCallbacks[p]||[]).forEach(N=>N(h))},{flush:"post"}),()=>{const h=s.value,d=t.name,p=l.value,g=p&&p.components[d];if(!g)return Zh(n.default,{Component:g,route:h});const y=p.props[d],x=y?y===!0?h.params:typeof y=="function"?y(h):y:null,O=vp(g,Oe({},x,e,{onVnodeUnmounted:q=>{q.component.isUnmounted&&(p.instances[d]=null)},ref:c}));return Zh(n.default,{Component:O,route:h})||O}}});function Zh(t,e){if(!t)return null;const n=t(e);return n.length===1?n[0]:n}const FE=LE;function UE(t){const e=bE(t.routes,t),n=t.parseQuery||CE,r=t.stringifyQuery||Gh,s=t.history,i=Ms(),a=Ms(),l=Ms(),c=K_(Mn);let h=Mn;qr&&t.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const d=rl.bind(null,L=>""+L),p=rl.bind(null,Yv),g=rl.bind(null,ci);function y(L,te){let X,ne;return Cp(L)?(X=e.getRecordMatcher(L),ne=te):ne=L,e.addRoute(ne,X)}function x(L){const te=e.getRecordMatcher(L);te&&e.removeRoute(te)}function N(){return e.getRoutes().map(L=>L.record)}function O(L){return!!e.getRecordMatcher(L)}function q(L,te){if(te=Oe({},te||c.value),typeof L=="string"){const E=sl(n,L,te.path),k=e.resolve({path:E.path},te),j=s.createHref(E.fullPath);return Oe(E,k,{params:g(k.params),hash:ci(E.hash),redirectedFrom:void 0,href:j})}let X;if(L.path!=null)X=Oe({},L,{path:sl(n,L.path,te.path).path});else{const E=Oe({},L.params);for(const k in E)E[k]==null&&delete E[k];X=Oe({},L,{params:p(E)}),te.params=p(te.params)}const ne=e.resolve(X,te),ye=L.hash||"";ne.params=d(g(ne.params));const Ne=eE(r,Oe({},L,{hash:Gv(ye),path:ne.path})),_=s.createHref(Ne);return Oe({fullPath:Ne,hash:ye,query:r===Gh?kE(L.query):L.query||{}},ne,{redirectedFrom:void 0,href:_})}function U(L){return typeof L=="string"?sl(n,L,c.value.path):Oe({},L)}function G(L,te){if(h!==L)return os(8,{from:te,to:L})}function J(L){return I(L)}function ge(L){return J(Oe(U(L),{replace:!0}))}function _e(L){const te=L.matched[L.matched.length-1];if(te&&te.redirect){const{redirect:X}=te;let ne=typeof X=="function"?X(L):X;return typeof ne=="string"&&(ne=ne.includes("?")||ne.includes("#")?ne=U(ne):{path:ne},ne.params={}),Oe({query:L.query,hash:L.hash,params:ne.path!=null?{}:L.params},ne)}}function I(L,te){const X=h=q(L),ne=c.value,ye=L.state,Ne=L.force,_=L.replace===!0,E=_e(X);if(E)return I(Oe(U(E),{state:typeof E=="object"?Oe({},ye,E.state):ye,force:Ne,replace:_}),te||X);const k=X;k.redirectedFrom=te;let j;return!Ne&&tE(r,ne,X)&&(j=os(16,{to:k,from:ne}),$e(ne,ne,!0,!1)),(j?Promise.resolve(j):b(k,ne)).catch(M=>gn(M)?gn(M,2)?M:Fe(M):Ee(M,k,ne)).then(M=>{if(M){if(gn(M,2))return I(Oe({replace:_},U(M.to),{state:typeof M.to=="object"?Oe({},ye,M.to.state):ye,force:Ne}),te||k)}else M=P(k,ne,!0,_,ye);return A(k,ne,M),M})}function v(L,te){const X=G(L,te);return X?Promise.reject(X):Promise.resolve()}function T(L){const te=Wt.values().next().value;return te&&typeof te.runWithContext=="function"?te.runWithContext(L):L()}function b(L,te){let X;const[ne,ye,Ne]=BE(L,te);X=il(ne.reverse(),"beforeRouteLeave",L,te);for(const E of ne)E.leaveGuards.forEach(k=>{X.push(qn(k,L,te))});const _=v.bind(null,L,te);return X.push(_),nt(X).then(()=>{X=[];for(const E of i.list())X.push(qn(E,L,te));return X.push(_),nt(X)}).then(()=>{X=il(ye,"beforeRouteUpdate",L,te);for(const E of ye)E.updateGuards.forEach(k=>{X.push(qn(k,L,te))});return X.push(_),nt(X)}).then(()=>{X=[];for(const E of Ne)if(E.beforeEnter)if(en(E.beforeEnter))for(const k of E.beforeEnter)X.push(qn(k,L,te));else X.push(qn(E.beforeEnter,L,te));return X.push(_),nt(X)}).then(()=>(L.matched.forEach(E=>E.enterCallbacks={}),X=il(Ne,"beforeRouteEnter",L,te,T),X.push(_),nt(X))).then(()=>{X=[];for(const E of a.list())X.push(qn(E,L,te));return X.push(_),nt(X)}).catch(E=>gn(E,8)?E:Promise.reject(E))}function A(L,te,X){l.list().forEach(ne=>T(()=>ne(L,te,X)))}function P(L,te,X,ne,ye){const Ne=G(L,te);if(Ne)return Ne;const _=te===Mn,E=qr?history.state:{};X&&(ne||_?s.replace(L.fullPath,Oe({scroll:_&&E&&E.scroll},ye)):s.push(L.fullPath,ye)),c.value=L,$e(L,te,X,_),Fe()}let w;function tt(){w||(w=s.listen((L,te,X)=>{if(!$t.listening)return;const ne=q(L),ye=_e(ne);if(ye){I(Oe(ye,{replace:!0,force:!0}),ne).catch(Qs);return}h=ne;const Ne=c.value;qr&&cE(Uh(Ne.fullPath,X.delta),sa()),b(ne,Ne).catch(_=>gn(_,12)?_:gn(_,2)?(I(Oe(U(_.to),{force:!0}),ne).then(E=>{gn(E,20)&&!X.delta&&X.type===ui.pop&&s.go(-1,!1)}).catch(Qs),Promise.reject()):(X.delta&&s.go(-X.delta,!1),Ee(_,ne,Ne))).then(_=>{_=_||P(ne,Ne,!1),_&&(X.delta&&!gn(_,8)?s.go(-X.delta,!1):X.type===ui.pop&&gn(_,20)&&s.go(-1,!1)),A(ne,Ne,_)}).catch(Qs)}))}let ot=Ms(),je=Ms(),we;function Ee(L,te,X){Fe(L);const ne=je.list();return ne.length?ne.forEach(ye=>ye(L,te,X)):console.error(L),Promise.reject(L)}function Pe(){return we&&c.value!==Mn?Promise.resolve():new Promise((L,te)=>{ot.add([L,te])})}function Fe(L){return we||(we=!L,tt(),ot.list().forEach(([te,X])=>L?X(L):te()),ot.reset()),L}function $e(L,te,X,ne){const{scrollBehavior:ye}=t;if(!qr||!ye)return Promise.resolve();const Ne=!X&&uE(Uh(L.fullPath,0))||(ne||!X)&&history.state&&history.state.scroll||null;return mc().then(()=>ye(L,te,Ne)).then(_=>_&&lE(_)).catch(_=>Ee(_,L,te))}const Te=L=>s.go(L);let Ke;const Wt=new Set,$t={currentRoute:c,listening:!0,addRoute:y,removeRoute:x,clearRoutes:e.clearRoutes,hasRoute:O,getRoutes:N,resolve:q,options:t,push:J,replace:ge,go:Te,back:()=>Te(-1),forward:()=>Te(1),beforeEach:i.add,beforeResolve:a.add,afterEach:l.add,onError:je.add,isReady:Pe,install(L){const te=this;L.component("RouterLink",NE),L.component("RouterView",FE),L.config.globalProperties.$router=te,Object.defineProperty(L.config.globalProperties,"$route",{enumerable:!0,get:()=>Yr(c)}),qr&&!Ke&&c.value===Mn&&(Ke=!0,J(s.location).catch(ye=>{}));const X={};for(const ye in Mn)Object.defineProperty(X,ye,{get:()=>c.value[ye],enumerable:!0});L.provide(ia,te),L.provide(Vp,Lf(X)),L.provide(Vl,c);const ne=L.unmount;Wt.add(L),L.unmount=function(){Wt.delete(L),Wt.size<1&&(h=Mn,w&&w(),w=null,c.value=Mn,Ke=!1,we=!1),ne()}}};function nt(L){return L.reduce((te,X)=>te.then(()=>T(X)),Promise.resolve())}return $t}function BE(t,e){const n=[],r=[],s=[],i=Math.max(e.matched.length,t.matched.length);for(let a=0;a<i;a++){const l=e.matched[a];l&&(t.matched.find(h=>is(h,l))?r.push(l):n.push(l));const c=t.matched[a];c&&(e.matched.find(h=>is(h,c))||s.push(c))}return[n,r,s]}function jE(){return on(ia)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */const Np=function(t){const e=[];let n=0;for(let r=0;r<t.length;r++){let s=t.charCodeAt(r);s<128?e[n++]=s:s<2048?(e[n++]=s>>6|192,e[n++]=s&63|128):(s&64512)===55296&&r+1<t.length&&(t.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(t.charCodeAt(++r)&1023),e[n++]=s>>18|240,e[n++]=s>>12&63|128,e[n++]=s>>6&63|128,e[n++]=s&63|128):(e[n++]=s>>12|224,e[n++]=s>>6&63|128,e[n++]=s&63|128)}return e},$E=function(t){const e=[];let n=0,r=0;for(;n<t.length;){const s=t[n++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const i=t[n++];e[r++]=String.fromCharCode((s&31)<<6|i&63)}else if(s>239&&s<365){const i=t[n++],a=t[n++],l=t[n++],c=((s&7)<<18|(i&63)<<12|(a&63)<<6|l&63)-65536;e[r++]=String.fromCharCode(55296+(c>>10)),e[r++]=String.fromCharCode(56320+(c&1023))}else{const i=t[n++],a=t[n++];e[r++]=String.fromCharCode((s&15)<<12|(i&63)<<6|a&63)}}return e.join("")},Op={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();const n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<t.length;s+=3){const i=t[s],a=s+1<t.length,l=a?t[s+1]:0,c=s+2<t.length,h=c?t[s+2]:0,d=i>>2,p=(i&3)<<4|l>>4;let g=(l&15)<<2|h>>6,y=h&63;c||(y=64,a||(g=64)),r.push(n[d],n[p],n[g],n[y])}return r.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(Np(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):$E(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();const n=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<t.length;){const i=n[t.charAt(s++)],l=s<t.length?n[t.charAt(s)]:0;++s;const h=s<t.length?n[t.charAt(s)]:64;++s;const p=s<t.length?n[t.charAt(s)]:64;if(++s,i==null||l==null||h==null||p==null)throw new qE;const g=i<<2|l>>4;if(r.push(g),h!==64){const y=l<<4&240|h>>2;if(r.push(y),p!==64){const x=h<<6&192|p;r.push(x)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}};class qE extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const HE=function(t){const e=Np(t);return Op.encodeByteArray(e,!0)},ko=function(t){return HE(t).replace(/\./g,"")},Mp=function(t){try{return Op.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function zE(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const KE=()=>zE().__FIREBASE_DEFAULTS__,WE=()=>{if(typeof process>"u"||typeof process.env>"u")return;const t={}.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},GE=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=t&&Mp(t[1]);return e&&JSON.parse(e)},oa=()=>{try{return KE()||WE()||GE()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},Lp=t=>{var e,n;return(n=(e=oa())===null||e===void 0?void 0:e.emulatorHosts)===null||n===void 0?void 0:n[t]},QE=t=>{const e=Lp(t);if(!e)return;const n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),r]:[e.substring(0,n),r]},Fp=()=>{var t;return(t=oa())===null||t===void 0?void 0:t.config},Up=t=>{var e;return(e=oa())===null||e===void 0?void 0:e[`_${t}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class JE{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,r)=>{n?this.reject(n):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,r))}}}/**
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
 */function YE(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const n={alg:"none",type:"JWT"},r=e||"demo-project",s=t.iat||0,i=t.sub||t.user_id;if(!i)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:i,user_id:i,firebase:{sign_in_provider:"custom",identities:{}}},t),l="";return[ko(JSON.stringify(n)),ko(JSON.stringify(a)),l].join(".")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Rt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function XE(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Rt())}function ZE(){var t;const e=(t=oa())===null||t===void 0?void 0:t.forceEnvironment;if(e==="node")return!0;if(e==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function ew(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function tw(){const t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function nw(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function rw(){const t=Rt();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function sw(){return!ZE()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function iw(){try{return typeof indexedDB=="object"}catch{return!1}}function ow(){return new Promise((t,e)=>{try{let n=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),n||self.indexedDB.deleteDatabase(r),t(!0)},s.onupgradeneeded=()=>{n=!1},s.onerror=()=>{var i;e(((i=s.error)===null||i===void 0?void 0:i.message)||"")}}catch(n){e(n)}})}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const aw="FirebaseError";class Dn extends Error{constructor(e,n,r){super(n),this.code=e,this.customData=r,this.name=aw,Object.setPrototypeOf(this,Dn.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Ii.prototype.create)}}class Ii{constructor(e,n,r){this.service=e,this.serviceName=n,this.errors=r}create(e,...n){const r=n[0]||{},s=`${this.service}/${e}`,i=this.errors[e],a=i?lw(i,r):"Error",l=`${this.serviceName}: ${a} (${s}).`;return new Dn(s,l,r)}}function lw(t,e){return t.replace(cw,(n,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const cw=/\{\$([^}]+)}/g;function uw(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function xo(t,e){if(t===e)return!0;const n=Object.keys(t),r=Object.keys(e);for(const s of n){if(!r.includes(s))return!1;const i=t[s],a=e[s];if(ed(i)&&ed(a)){if(!xo(i,a))return!1}else if(i!==a)return!1}for(const s of r)if(!n.includes(s))return!1;return!0}function ed(t){return t!==null&&typeof t=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function bi(t){const e=[];for(const[n,r]of Object.entries(t))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function hw(t,e){const n=new dw(t,e);return n.subscribe.bind(n)}class dw{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,r){let s;if(e===void 0&&n===void 0&&r===void 0)throw new Error("Missing Observer.");fw(e,["next","error","complete"])?s=e:s={next:e,error:n,complete:r},s.next===void 0&&(s.next=ol),s.error===void 0&&(s.error=ol),s.complete===void 0&&(s.complete=ol);const i=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),i}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function fw(t,e){if(typeof t!="object"||t===null)return!1;for(const n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function ol(){}/**
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
 */const wr="[DEFAULT]";/**
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
 */class pw{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){const r=new JE;if(this.instancesDeferred.set(n,r),this.isInitialized(n)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:n});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){var n;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(n=e==null?void 0:e.optional)!==null&&n!==void 0?n:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(i){if(s)return null;throw i}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(gw(e))try{this.getOrInitializeService({instanceIdentifier:wr})}catch{}for(const[n,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(n);try{const i=this.getOrInitializeService({instanceIdentifier:s});r.resolve(i)}catch{}}}}clearInstance(e=wr){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=wr){return this.instances.has(e)}getOptions(e=wr){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:n={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:n});for(const[i,a]of this.instancesDeferred.entries()){const l=this.normalizeInstanceIdentifier(i);r===l&&a.resolve(s)}return s}onInit(e,n){var r;const s=this.normalizeInstanceIdentifier(n),i=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;i.add(e),this.onInitCallbacks.set(s,i);const a=this.instances.get(s);return a&&e(a,s),()=>{i.delete(e)}}invokeOnInitCallbacks(e,n){const r=this.onInitCallbacks.get(n);if(r)for(const s of r)try{s(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:mw(e),options:n}),this.instances.set(e,r),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=wr){return this.component?this.component.multipleInstances?e:wr:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function mw(t){return t===wr?void 0:t}function gw(t){return t.instantiationMode==="EAGER"}/**
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
 */class _w{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const n=new pw(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var Se;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(Se||(Se={}));const yw={debug:Se.DEBUG,verbose:Se.VERBOSE,info:Se.INFO,warn:Se.WARN,error:Se.ERROR,silent:Se.SILENT},vw=Se.INFO,Ew={[Se.DEBUG]:"log",[Se.VERBOSE]:"log",[Se.INFO]:"info",[Se.WARN]:"warn",[Se.ERROR]:"error"},ww=(t,e,...n)=>{if(e<t.logLevel)return;const r=new Date().toISOString(),s=Ew[e];if(s)console[s](`[${r}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class bc{constructor(e){this.name=e,this._logLevel=vw,this._logHandler=ww,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Se))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?yw[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Se.DEBUG,...e),this._logHandler(this,Se.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Se.VERBOSE,...e),this._logHandler(this,Se.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Se.INFO,...e),this._logHandler(this,Se.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Se.WARN,...e),this._logHandler(this,Se.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Se.ERROR,...e),this._logHandler(this,Se.ERROR,...e)}}const Tw=(t,e)=>e.some(n=>t instanceof n);let td,nd;function Iw(){return td||(td=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function bw(){return nd||(nd=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Bp=new WeakMap,Nl=new WeakMap,jp=new WeakMap,al=new WeakMap,Ac=new WeakMap;function Aw(t){const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("success",i),t.removeEventListener("error",a)},i=()=>{n(Jn(t.result)),s()},a=()=>{r(t.error),s()};t.addEventListener("success",i),t.addEventListener("error",a)});return e.then(n=>{n instanceof IDBCursor&&Bp.set(n,t)}).catch(()=>{}),Ac.set(e,t),e}function Rw(t){if(Nl.has(t))return;const e=new Promise((n,r)=>{const s=()=>{t.removeEventListener("complete",i),t.removeEventListener("error",a),t.removeEventListener("abort",a)},i=()=>{n(),s()},a=()=>{r(t.error||new DOMException("AbortError","AbortError")),s()};t.addEventListener("complete",i),t.addEventListener("error",a),t.addEventListener("abort",a)});Nl.set(t,e)}let Ol={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return Nl.get(t);if(e==="objectStoreNames")return t.objectStoreNames||jp.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Jn(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function Sw(t){Ol=t(Ol)}function Pw(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){const r=t.call(ll(this),e,...n);return jp.set(r,e.sort?e.sort():[e]),Jn(r)}:bw().includes(t)?function(...e){return t.apply(ll(this),e),Jn(Bp.get(this))}:function(...e){return Jn(t.apply(ll(this),e))}}function Cw(t){return typeof t=="function"?Pw(t):(t instanceof IDBTransaction&&Rw(t),Tw(t,Iw())?new Proxy(t,Ol):t)}function Jn(t){if(t instanceof IDBRequest)return Aw(t);if(al.has(t))return al.get(t);const e=Cw(t);return e!==t&&(al.set(t,e),Ac.set(e,t)),e}const ll=t=>Ac.get(t);function kw(t,e,{blocked:n,upgrade:r,blocking:s,terminated:i}={}){const a=indexedDB.open(t,e),l=Jn(a);return r&&a.addEventListener("upgradeneeded",c=>{r(Jn(a.result),c.oldVersion,c.newVersion,Jn(a.transaction),c)}),n&&a.addEventListener("blocked",c=>n(c.oldVersion,c.newVersion,c)),l.then(c=>{i&&c.addEventListener("close",()=>i()),s&&c.addEventListener("versionchange",h=>s(h.oldVersion,h.newVersion,h))}).catch(()=>{}),l}const xw=["get","getKey","getAll","getAllKeys","count"],Dw=["put","add","delete","clear"],cl=new Map;function rd(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(cl.get(e))return cl.get(e);const n=e.replace(/FromIndex$/,""),r=e!==n,s=Dw.includes(n);if(!(n in(r?IDBIndex:IDBObjectStore).prototype)||!(s||xw.includes(n)))return;const i=async function(a,...l){const c=this.transaction(a,s?"readwrite":"readonly");let h=c.store;return r&&(h=h.index(l.shift())),(await Promise.all([h[n](...l),s&&c.done]))[0]};return cl.set(e,i),i}Sw(t=>({...t,get:(e,n,r)=>rd(e,n)||t.get(e,n,r),has:(e,n)=>!!rd(e,n)||t.has(e,n)}));/**
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
 */class Vw{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(Nw(n)){const r=n.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(n=>n).join(" ")}}function Nw(t){const e=t.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Ml="@firebase/app",sd="0.10.13";/**
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
 */const Rn=new bc("@firebase/app"),Ow="@firebase/app-compat",Mw="@firebase/analytics-compat",Lw="@firebase/analytics",Fw="@firebase/app-check-compat",Uw="@firebase/app-check",Bw="@firebase/auth",jw="@firebase/auth-compat",$w="@firebase/database",qw="@firebase/data-connect",Hw="@firebase/database-compat",zw="@firebase/functions",Kw="@firebase/functions-compat",Ww="@firebase/installations",Gw="@firebase/installations-compat",Qw="@firebase/messaging",Jw="@firebase/messaging-compat",Yw="@firebase/performance",Xw="@firebase/performance-compat",Zw="@firebase/remote-config",eT="@firebase/remote-config-compat",tT="@firebase/storage",nT="@firebase/storage-compat",rT="@firebase/firestore",sT="@firebase/vertexai-preview",iT="@firebase/firestore-compat",oT="firebase",aT="10.14.1";/**
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
 */const Ll="[DEFAULT]",lT={[Ml]:"fire-core",[Ow]:"fire-core-compat",[Lw]:"fire-analytics",[Mw]:"fire-analytics-compat",[Uw]:"fire-app-check",[Fw]:"fire-app-check-compat",[Bw]:"fire-auth",[jw]:"fire-auth-compat",[$w]:"fire-rtdb",[qw]:"fire-data-connect",[Hw]:"fire-rtdb-compat",[zw]:"fire-fn",[Kw]:"fire-fn-compat",[Ww]:"fire-iid",[Gw]:"fire-iid-compat",[Qw]:"fire-fcm",[Jw]:"fire-fcm-compat",[Yw]:"fire-perf",[Xw]:"fire-perf-compat",[Zw]:"fire-rc",[eT]:"fire-rc-compat",[tT]:"fire-gcs",[nT]:"fire-gcs-compat",[rT]:"fire-fst",[iT]:"fire-fst-compat",[sT]:"fire-vertex","fire-js":"fire-js",[oT]:"fire-js-all"};/**
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
 */const Do=new Map,cT=new Map,Fl=new Map;function id(t,e){try{t.container.addComponent(e)}catch(n){Rn.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function as(t){const e=t.name;if(Fl.has(e))return Rn.debug(`There were multiple attempts to register component ${e}.`),!1;Fl.set(e,t);for(const n of Do.values())id(n,t);for(const n of cT.values())id(n,t);return!0}function Rc(t,e){const n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function En(t){return t.settings!==void 0}/**
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
 */const uT={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Yn=new Ii("app","Firebase",uT);/**
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
 */class hT{constructor(e,n,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},n),this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new Ar("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Yn.create("app-deleted",{appName:this._name})}}/**
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
 */const ms=aT;function $p(t,e={}){let n=t;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Ll,automaticDataCollectionEnabled:!1},e),s=r.name;if(typeof s!="string"||!s)throw Yn.create("bad-app-name",{appName:String(s)});if(n||(n=Fp()),!n)throw Yn.create("no-options");const i=Do.get(s);if(i){if(xo(n,i.options)&&xo(r,i.config))return i;throw Yn.create("duplicate-app",{appName:s})}const a=new _w(s);for(const c of Fl.values())a.addComponent(c);const l=new hT(n,r,a);return Do.set(s,l),l}function qp(t=Ll){const e=Do.get(t);if(!e&&t===Ll&&Fp())return $p();if(!e)throw Yn.create("no-app",{appName:t});return e}function Xn(t,e,n){var r;let s=(r=lT[t])!==null&&r!==void 0?r:t;n&&(s+=`-${n}`);const i=s.match(/\s|\//),a=e.match(/\s|\//);if(i||a){const l=[`Unable to register library "${s}" with version "${e}":`];i&&l.push(`library name "${s}" contains illegal characters (whitespace or "/")`),i&&a&&l.push("and"),a&&l.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Rn.warn(l.join(" "));return}as(new Ar(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const dT="firebase-heartbeat-database",fT=1,hi="firebase-heartbeat-store";let ul=null;function Hp(){return ul||(ul=kw(dT,fT,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(hi)}catch(n){console.warn(n)}}}}).catch(t=>{throw Yn.create("idb-open",{originalErrorMessage:t.message})})),ul}async function pT(t){try{const n=(await Hp()).transaction(hi),r=await n.objectStore(hi).get(zp(t));return await n.done,r}catch(e){if(e instanceof Dn)Rn.warn(e.message);else{const n=Yn.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Rn.warn(n.message)}}}async function od(t,e){try{const r=(await Hp()).transaction(hi,"readwrite");await r.objectStore(hi).put(e,zp(t)),await r.done}catch(n){if(n instanceof Dn)Rn.warn(n.message);else{const r=Yn.create("idb-set",{originalErrorMessage:n==null?void 0:n.message});Rn.warn(r.message)}}}function zp(t){return`${t.name}!${t.options.appId}`}/**
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
 */const mT=1024,gT=30*24*60*60*1e3;class _T{constructor(e){this.container=e,this._heartbeatsCache=null;const n=this.container.getProvider("app").getImmediate();this._storage=new vT(n),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,n;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),i=ad();return((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((n=this._heartbeatsCache)===null||n===void 0?void 0:n.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===i||this._heartbeatsCache.heartbeats.some(a=>a.date===i)?void 0:(this._heartbeatsCache.heartbeats.push({date:i,agent:s}),this._heartbeatsCache.heartbeats=this._heartbeatsCache.heartbeats.filter(a=>{const l=new Date(a.date).valueOf();return Date.now()-l<=gT}),this._storage.overwrite(this._heartbeatsCache))}catch(r){Rn.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const n=ad(),{heartbeatsToSend:r,unsentEntries:s}=yT(this._heartbeatsCache.heartbeats),i=ko(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=n,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),i}catch(n){return Rn.warn(n),""}}}function ad(){return new Date().toISOString().substring(0,10)}function yT(t,e=mT){const n=[];let r=t.slice();for(const s of t){const i=n.find(a=>a.agent===s.agent);if(i){if(i.dates.push(s.date),ld(n)>e){i.dates.pop();break}}else if(n.push({agent:s.agent,dates:[s.date]}),ld(n)>e){n.pop();break}r=r.slice(1)}return{heartbeatsToSend:n,unsentEntries:r}}class vT{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return iw()?ow().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const n=await pT(this.app);return n!=null&&n.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return od(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var n;if(await this._canUseIndexedDBPromise){const s=await this.read();return od(this.app,{lastSentHeartbeatDate:(n=e.lastSentHeartbeatDate)!==null&&n!==void 0?n:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function ld(t){return ko(JSON.stringify({version:2,heartbeats:t})).length}/**
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
 */function ET(t){as(new Ar("platform-logger",e=>new Vw(e),"PRIVATE")),as(new Ar("heartbeat",e=>new _T(e),"PRIVATE")),Xn(Ml,sd,t),Xn(Ml,sd,"esm2017"),Xn("fire-js","")}ET("");var wT="firebase",TT="10.14.1";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Xn(wT,TT,"app");var cd=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var br,Kp;(function(){var t;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(I,v){function T(){}T.prototype=v.prototype,I.D=v.prototype,I.prototype=new T,I.prototype.constructor=I,I.C=function(b,A,P){for(var w=Array(arguments.length-2),tt=2;tt<arguments.length;tt++)w[tt-2]=arguments[tt];return v.prototype[A].apply(b,w)}}function n(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,n),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(I,v,T){T||(T=0);var b=Array(16);if(typeof v=="string")for(var A=0;16>A;++A)b[A]=v.charCodeAt(T++)|v.charCodeAt(T++)<<8|v.charCodeAt(T++)<<16|v.charCodeAt(T++)<<24;else for(A=0;16>A;++A)b[A]=v[T++]|v[T++]<<8|v[T++]<<16|v[T++]<<24;v=I.g[0],T=I.g[1],A=I.g[2];var P=I.g[3],w=v+(P^T&(A^P))+b[0]+3614090360&4294967295;v=T+(w<<7&4294967295|w>>>25),w=P+(A^v&(T^A))+b[1]+3905402710&4294967295,P=v+(w<<12&4294967295|w>>>20),w=A+(T^P&(v^T))+b[2]+606105819&4294967295,A=P+(w<<17&4294967295|w>>>15),w=T+(v^A&(P^v))+b[3]+3250441966&4294967295,T=A+(w<<22&4294967295|w>>>10),w=v+(P^T&(A^P))+b[4]+4118548399&4294967295,v=T+(w<<7&4294967295|w>>>25),w=P+(A^v&(T^A))+b[5]+1200080426&4294967295,P=v+(w<<12&4294967295|w>>>20),w=A+(T^P&(v^T))+b[6]+2821735955&4294967295,A=P+(w<<17&4294967295|w>>>15),w=T+(v^A&(P^v))+b[7]+4249261313&4294967295,T=A+(w<<22&4294967295|w>>>10),w=v+(P^T&(A^P))+b[8]+1770035416&4294967295,v=T+(w<<7&4294967295|w>>>25),w=P+(A^v&(T^A))+b[9]+2336552879&4294967295,P=v+(w<<12&4294967295|w>>>20),w=A+(T^P&(v^T))+b[10]+4294925233&4294967295,A=P+(w<<17&4294967295|w>>>15),w=T+(v^A&(P^v))+b[11]+2304563134&4294967295,T=A+(w<<22&4294967295|w>>>10),w=v+(P^T&(A^P))+b[12]+1804603682&4294967295,v=T+(w<<7&4294967295|w>>>25),w=P+(A^v&(T^A))+b[13]+4254626195&4294967295,P=v+(w<<12&4294967295|w>>>20),w=A+(T^P&(v^T))+b[14]+2792965006&4294967295,A=P+(w<<17&4294967295|w>>>15),w=T+(v^A&(P^v))+b[15]+1236535329&4294967295,T=A+(w<<22&4294967295|w>>>10),w=v+(A^P&(T^A))+b[1]+4129170786&4294967295,v=T+(w<<5&4294967295|w>>>27),w=P+(T^A&(v^T))+b[6]+3225465664&4294967295,P=v+(w<<9&4294967295|w>>>23),w=A+(v^T&(P^v))+b[11]+643717713&4294967295,A=P+(w<<14&4294967295|w>>>18),w=T+(P^v&(A^P))+b[0]+3921069994&4294967295,T=A+(w<<20&4294967295|w>>>12),w=v+(A^P&(T^A))+b[5]+3593408605&4294967295,v=T+(w<<5&4294967295|w>>>27),w=P+(T^A&(v^T))+b[10]+38016083&4294967295,P=v+(w<<9&4294967295|w>>>23),w=A+(v^T&(P^v))+b[15]+3634488961&4294967295,A=P+(w<<14&4294967295|w>>>18),w=T+(P^v&(A^P))+b[4]+3889429448&4294967295,T=A+(w<<20&4294967295|w>>>12),w=v+(A^P&(T^A))+b[9]+568446438&4294967295,v=T+(w<<5&4294967295|w>>>27),w=P+(T^A&(v^T))+b[14]+3275163606&4294967295,P=v+(w<<9&4294967295|w>>>23),w=A+(v^T&(P^v))+b[3]+4107603335&4294967295,A=P+(w<<14&4294967295|w>>>18),w=T+(P^v&(A^P))+b[8]+1163531501&4294967295,T=A+(w<<20&4294967295|w>>>12),w=v+(A^P&(T^A))+b[13]+2850285829&4294967295,v=T+(w<<5&4294967295|w>>>27),w=P+(T^A&(v^T))+b[2]+4243563512&4294967295,P=v+(w<<9&4294967295|w>>>23),w=A+(v^T&(P^v))+b[7]+1735328473&4294967295,A=P+(w<<14&4294967295|w>>>18),w=T+(P^v&(A^P))+b[12]+2368359562&4294967295,T=A+(w<<20&4294967295|w>>>12),w=v+(T^A^P)+b[5]+4294588738&4294967295,v=T+(w<<4&4294967295|w>>>28),w=P+(v^T^A)+b[8]+2272392833&4294967295,P=v+(w<<11&4294967295|w>>>21),w=A+(P^v^T)+b[11]+1839030562&4294967295,A=P+(w<<16&4294967295|w>>>16),w=T+(A^P^v)+b[14]+4259657740&4294967295,T=A+(w<<23&4294967295|w>>>9),w=v+(T^A^P)+b[1]+2763975236&4294967295,v=T+(w<<4&4294967295|w>>>28),w=P+(v^T^A)+b[4]+1272893353&4294967295,P=v+(w<<11&4294967295|w>>>21),w=A+(P^v^T)+b[7]+4139469664&4294967295,A=P+(w<<16&4294967295|w>>>16),w=T+(A^P^v)+b[10]+3200236656&4294967295,T=A+(w<<23&4294967295|w>>>9),w=v+(T^A^P)+b[13]+681279174&4294967295,v=T+(w<<4&4294967295|w>>>28),w=P+(v^T^A)+b[0]+3936430074&4294967295,P=v+(w<<11&4294967295|w>>>21),w=A+(P^v^T)+b[3]+3572445317&4294967295,A=P+(w<<16&4294967295|w>>>16),w=T+(A^P^v)+b[6]+76029189&4294967295,T=A+(w<<23&4294967295|w>>>9),w=v+(T^A^P)+b[9]+3654602809&4294967295,v=T+(w<<4&4294967295|w>>>28),w=P+(v^T^A)+b[12]+3873151461&4294967295,P=v+(w<<11&4294967295|w>>>21),w=A+(P^v^T)+b[15]+530742520&4294967295,A=P+(w<<16&4294967295|w>>>16),w=T+(A^P^v)+b[2]+3299628645&4294967295,T=A+(w<<23&4294967295|w>>>9),w=v+(A^(T|~P))+b[0]+4096336452&4294967295,v=T+(w<<6&4294967295|w>>>26),w=P+(T^(v|~A))+b[7]+1126891415&4294967295,P=v+(w<<10&4294967295|w>>>22),w=A+(v^(P|~T))+b[14]+2878612391&4294967295,A=P+(w<<15&4294967295|w>>>17),w=T+(P^(A|~v))+b[5]+4237533241&4294967295,T=A+(w<<21&4294967295|w>>>11),w=v+(A^(T|~P))+b[12]+1700485571&4294967295,v=T+(w<<6&4294967295|w>>>26),w=P+(T^(v|~A))+b[3]+2399980690&4294967295,P=v+(w<<10&4294967295|w>>>22),w=A+(v^(P|~T))+b[10]+4293915773&4294967295,A=P+(w<<15&4294967295|w>>>17),w=T+(P^(A|~v))+b[1]+2240044497&4294967295,T=A+(w<<21&4294967295|w>>>11),w=v+(A^(T|~P))+b[8]+1873313359&4294967295,v=T+(w<<6&4294967295|w>>>26),w=P+(T^(v|~A))+b[15]+4264355552&4294967295,P=v+(w<<10&4294967295|w>>>22),w=A+(v^(P|~T))+b[6]+2734768916&4294967295,A=P+(w<<15&4294967295|w>>>17),w=T+(P^(A|~v))+b[13]+1309151649&4294967295,T=A+(w<<21&4294967295|w>>>11),w=v+(A^(T|~P))+b[4]+4149444226&4294967295,v=T+(w<<6&4294967295|w>>>26),w=P+(T^(v|~A))+b[11]+3174756917&4294967295,P=v+(w<<10&4294967295|w>>>22),w=A+(v^(P|~T))+b[2]+718787259&4294967295,A=P+(w<<15&4294967295|w>>>17),w=T+(P^(A|~v))+b[9]+3951481745&4294967295,I.g[0]=I.g[0]+v&4294967295,I.g[1]=I.g[1]+(A+(w<<21&4294967295|w>>>11))&4294967295,I.g[2]=I.g[2]+A&4294967295,I.g[3]=I.g[3]+P&4294967295}r.prototype.u=function(I,v){v===void 0&&(v=I.length);for(var T=v-this.blockSize,b=this.B,A=this.h,P=0;P<v;){if(A==0)for(;P<=T;)s(this,I,P),P+=this.blockSize;if(typeof I=="string"){for(;P<v;)if(b[A++]=I.charCodeAt(P++),A==this.blockSize){s(this,b),A=0;break}}else for(;P<v;)if(b[A++]=I[P++],A==this.blockSize){s(this,b),A=0;break}}this.h=A,this.o+=v},r.prototype.v=function(){var I=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);I[0]=128;for(var v=1;v<I.length-8;++v)I[v]=0;var T=8*this.o;for(v=I.length-8;v<I.length;++v)I[v]=T&255,T/=256;for(this.u(I),I=Array(16),v=T=0;4>v;++v)for(var b=0;32>b;b+=8)I[T++]=this.g[v]>>>b&255;return I};function i(I,v){var T=l;return Object.prototype.hasOwnProperty.call(T,I)?T[I]:T[I]=v(I)}function a(I,v){this.h=v;for(var T=[],b=!0,A=I.length-1;0<=A;A--){var P=I[A]|0;b&&P==v||(T[A]=P,b=!1)}this.g=T}var l={};function c(I){return-128<=I&&128>I?i(I,function(v){return new a([v|0],0>v?-1:0)}):new a([I|0],0>I?-1:0)}function h(I){if(isNaN(I)||!isFinite(I))return p;if(0>I)return O(h(-I));for(var v=[],T=1,b=0;I>=T;b++)v[b]=I/T|0,T*=4294967296;return new a(v,0)}function d(I,v){if(I.length==0)throw Error("number format error: empty string");if(v=v||10,2>v||36<v)throw Error("radix out of range: "+v);if(I.charAt(0)=="-")return O(d(I.substring(1),v));if(0<=I.indexOf("-"))throw Error('number format error: interior "-" character');for(var T=h(Math.pow(v,8)),b=p,A=0;A<I.length;A+=8){var P=Math.min(8,I.length-A),w=parseInt(I.substring(A,A+P),v);8>P?(P=h(Math.pow(v,P)),b=b.j(P).add(h(w))):(b=b.j(T),b=b.add(h(w)))}return b}var p=c(0),g=c(1),y=c(16777216);t=a.prototype,t.m=function(){if(N(this))return-O(this).m();for(var I=0,v=1,T=0;T<this.g.length;T++){var b=this.i(T);I+=(0<=b?b:4294967296+b)*v,v*=4294967296}return I},t.toString=function(I){if(I=I||10,2>I||36<I)throw Error("radix out of range: "+I);if(x(this))return"0";if(N(this))return"-"+O(this).toString(I);for(var v=h(Math.pow(I,6)),T=this,b="";;){var A=J(T,v).g;T=q(T,A.j(v));var P=((0<T.g.length?T.g[0]:T.h)>>>0).toString(I);if(T=A,x(T))return P+b;for(;6>P.length;)P="0"+P;b=P+b}},t.i=function(I){return 0>I?0:I<this.g.length?this.g[I]:this.h};function x(I){if(I.h!=0)return!1;for(var v=0;v<I.g.length;v++)if(I.g[v]!=0)return!1;return!0}function N(I){return I.h==-1}t.l=function(I){return I=q(this,I),N(I)?-1:x(I)?0:1};function O(I){for(var v=I.g.length,T=[],b=0;b<v;b++)T[b]=~I.g[b];return new a(T,~I.h).add(g)}t.abs=function(){return N(this)?O(this):this},t.add=function(I){for(var v=Math.max(this.g.length,I.g.length),T=[],b=0,A=0;A<=v;A++){var P=b+(this.i(A)&65535)+(I.i(A)&65535),w=(P>>>16)+(this.i(A)>>>16)+(I.i(A)>>>16);b=w>>>16,P&=65535,w&=65535,T[A]=w<<16|P}return new a(T,T[T.length-1]&-2147483648?-1:0)};function q(I,v){return I.add(O(v))}t.j=function(I){if(x(this)||x(I))return p;if(N(this))return N(I)?O(this).j(O(I)):O(O(this).j(I));if(N(I))return O(this.j(O(I)));if(0>this.l(y)&&0>I.l(y))return h(this.m()*I.m());for(var v=this.g.length+I.g.length,T=[],b=0;b<2*v;b++)T[b]=0;for(b=0;b<this.g.length;b++)for(var A=0;A<I.g.length;A++){var P=this.i(b)>>>16,w=this.i(b)&65535,tt=I.i(A)>>>16,ot=I.i(A)&65535;T[2*b+2*A]+=w*ot,U(T,2*b+2*A),T[2*b+2*A+1]+=P*ot,U(T,2*b+2*A+1),T[2*b+2*A+1]+=w*tt,U(T,2*b+2*A+1),T[2*b+2*A+2]+=P*tt,U(T,2*b+2*A+2)}for(b=0;b<v;b++)T[b]=T[2*b+1]<<16|T[2*b];for(b=v;b<2*v;b++)T[b]=0;return new a(T,0)};function U(I,v){for(;(I[v]&65535)!=I[v];)I[v+1]+=I[v]>>>16,I[v]&=65535,v++}function G(I,v){this.g=I,this.h=v}function J(I,v){if(x(v))throw Error("division by zero");if(x(I))return new G(p,p);if(N(I))return v=J(O(I),v),new G(O(v.g),O(v.h));if(N(v))return v=J(I,O(v)),new G(O(v.g),v.h);if(30<I.g.length){if(N(I)||N(v))throw Error("slowDivide_ only works with positive integers.");for(var T=g,b=v;0>=b.l(I);)T=ge(T),b=ge(b);var A=_e(T,1),P=_e(b,1);for(b=_e(b,2),T=_e(T,2);!x(b);){var w=P.add(b);0>=w.l(I)&&(A=A.add(T),P=w),b=_e(b,1),T=_e(T,1)}return v=q(I,A.j(v)),new G(A,v)}for(A=p;0<=I.l(v);){for(T=Math.max(1,Math.floor(I.m()/v.m())),b=Math.ceil(Math.log(T)/Math.LN2),b=48>=b?1:Math.pow(2,b-48),P=h(T),w=P.j(v);N(w)||0<w.l(I);)T-=b,P=h(T),w=P.j(v);x(P)&&(P=g),A=A.add(P),I=q(I,w)}return new G(A,I)}t.A=function(I){return J(this,I).h},t.and=function(I){for(var v=Math.max(this.g.length,I.g.length),T=[],b=0;b<v;b++)T[b]=this.i(b)&I.i(b);return new a(T,this.h&I.h)},t.or=function(I){for(var v=Math.max(this.g.length,I.g.length),T=[],b=0;b<v;b++)T[b]=this.i(b)|I.i(b);return new a(T,this.h|I.h)},t.xor=function(I){for(var v=Math.max(this.g.length,I.g.length),T=[],b=0;b<v;b++)T[b]=this.i(b)^I.i(b);return new a(T,this.h^I.h)};function ge(I){for(var v=I.g.length+1,T=[],b=0;b<v;b++)T[b]=I.i(b)<<1|I.i(b-1)>>>31;return new a(T,I.h)}function _e(I,v){var T=v>>5;v%=32;for(var b=I.g.length-T,A=[],P=0;P<b;P++)A[P]=0<v?I.i(P+T)>>>v|I.i(P+T+1)<<32-v:I.i(P+T);return new a(A,I.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,Kp=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=h,a.fromString=d,br=a}).apply(typeof cd<"u"?cd:typeof self<"u"?self:typeof window<"u"?window:{});var eo=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var Wp,Us,Gp,po,Ul,Qp,Jp,Yp;(function(){var t,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(o,u,f){return o==Array.prototype||o==Object.prototype||(o[u]=f.value),o};function n(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof eo=="object"&&eo];for(var u=0;u<o.length;++u){var f=o[u];if(f&&f.Math==Math)return f}throw Error("Cannot find global object")}var r=n(this);function s(o,u){if(u)e:{var f=r;o=o.split(".");for(var m=0;m<o.length-1;m++){var S=o[m];if(!(S in f))break e;f=f[S]}o=o[o.length-1],m=f[o],u=u(m),u!=m&&u!=null&&e(f,o,{configurable:!0,writable:!0,value:u})}}function i(o,u){o instanceof String&&(o+="");var f=0,m=!1,S={next:function(){if(!m&&f<o.length){var V=f++;return{value:u(V,o[V]),done:!1}}return m=!0,{done:!0,value:void 0}}};return S[Symbol.iterator]=function(){return S},S}s("Array.prototype.values",function(o){return o||function(){return i(this,function(u,f){return f})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},l=this||self;function c(o){var u=typeof o;return u=u!="object"?u:o?Array.isArray(o)?"array":u:"null",u=="array"||u=="object"&&typeof o.length=="number"}function h(o){var u=typeof o;return u=="object"&&o!=null||u=="function"}function d(o,u,f){return o.call.apply(o.bind,arguments)}function p(o,u,f){if(!o)throw Error();if(2<arguments.length){var m=Array.prototype.slice.call(arguments,2);return function(){var S=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(S,m),o.apply(u,S)}}return function(){return o.apply(u,arguments)}}function g(o,u,f){return g=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?d:p,g.apply(null,arguments)}function y(o,u){var f=Array.prototype.slice.call(arguments,1);return function(){var m=f.slice();return m.push.apply(m,arguments),o.apply(this,m)}}function x(o,u){function f(){}f.prototype=u.prototype,o.aa=u.prototype,o.prototype=new f,o.prototype.constructor=o,o.Qb=function(m,S,V){for(var Y=Array(arguments.length-2),qe=2;qe<arguments.length;qe++)Y[qe-2]=arguments[qe];return u.prototype[S].apply(m,Y)}}function N(o){const u=o.length;if(0<u){const f=Array(u);for(let m=0;m<u;m++)f[m]=o[m];return f}return[]}function O(o,u){for(let f=1;f<arguments.length;f++){const m=arguments[f];if(c(m)){const S=o.length||0,V=m.length||0;o.length=S+V;for(let Y=0;Y<V;Y++)o[S+Y]=m[Y]}else o.push(m)}}class q{constructor(u,f){this.i=u,this.j=f,this.h=0,this.g=null}get(){let u;return 0<this.h?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function U(o){return/^[\s\xa0]*$/.test(o)}function G(){var o=l.navigator;return o&&(o=o.userAgent)?o:""}function J(o){return J[" "](o),o}J[" "]=function(){};var ge=G().indexOf("Gecko")!=-1&&!(G().toLowerCase().indexOf("webkit")!=-1&&G().indexOf("Edge")==-1)&&!(G().indexOf("Trident")!=-1||G().indexOf("MSIE")!=-1)&&G().indexOf("Edge")==-1;function _e(o,u,f){for(const m in o)u.call(f,o[m],m,o)}function I(o,u){for(const f in o)u.call(void 0,o[f],f,o)}function v(o){const u={};for(const f in o)u[f]=o[f];return u}const T="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function b(o,u){let f,m;for(let S=1;S<arguments.length;S++){m=arguments[S];for(f in m)o[f]=m[f];for(let V=0;V<T.length;V++)f=T[V],Object.prototype.hasOwnProperty.call(m,f)&&(o[f]=m[f])}}function A(o){var u=1;o=o.split(":");const f=[];for(;0<u&&o.length;)f.push(o.shift()),u--;return o.length&&f.push(o.join(":")),f}function P(o){l.setTimeout(()=>{throw o},0)}function w(){var o=Pe;let u=null;return o.g&&(u=o.g,o.g=o.g.next,o.g||(o.h=null),u.next=null),u}class tt{constructor(){this.h=this.g=null}add(u,f){const m=ot.get();m.set(u,f),this.h?this.h.next=m:this.g=m,this.h=m}}var ot=new q(()=>new je,o=>o.reset());class je{constructor(){this.next=this.g=this.h=null}set(u,f){this.h=u,this.g=f,this.next=null}reset(){this.next=this.g=this.h=null}}let we,Ee=!1,Pe=new tt,Fe=()=>{const o=l.Promise.resolve(void 0);we=()=>{o.then($e)}};var $e=()=>{for(var o;o=w();){try{o.h.call(o.g)}catch(f){P(f)}var u=ot;u.j(o),100>u.h&&(u.h++,o.next=u.g,u.g=o)}Ee=!1};function Te(){this.s=this.s,this.C=this.C}Te.prototype.s=!1,Te.prototype.ma=function(){this.s||(this.s=!0,this.N())},Te.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function Ke(o,u){this.type=o,this.g=this.target=u,this.defaultPrevented=!1}Ke.prototype.h=function(){this.defaultPrevented=!0};var Wt=function(){if(!l.addEventListener||!Object.defineProperty)return!1;var o=!1,u=Object.defineProperty({},"passive",{get:function(){o=!0}});try{const f=()=>{};l.addEventListener("test",f,u),l.removeEventListener("test",f,u)}catch{}return o}();function $t(o,u){if(Ke.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o){var f=this.type=o.type,m=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;if(this.target=o.target||o.srcElement,this.g=u,u=o.relatedTarget){if(ge){e:{try{J(u.nodeName);var S=!0;break e}catch{}S=!1}S||(u=null)}}else f=="mouseover"?u=o.fromElement:f=="mouseout"&&(u=o.toElement);this.relatedTarget=u,m?(this.clientX=m.clientX!==void 0?m.clientX:m.pageX,this.clientY=m.clientY!==void 0?m.clientY:m.pageY,this.screenX=m.screenX||0,this.screenY=m.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=typeof o.pointerType=="string"?o.pointerType:nt[o.pointerType]||"",this.state=o.state,this.i=o,o.defaultPrevented&&$t.aa.h.call(this)}}x($t,Ke);var nt={2:"touch",3:"pen",4:"mouse"};$t.prototype.h=function(){$t.aa.h.call(this);var o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var L="closure_listenable_"+(1e6*Math.random()|0),te=0;function X(o,u,f,m,S){this.listener=o,this.proxy=null,this.src=u,this.type=f,this.capture=!!m,this.ha=S,this.key=++te,this.da=this.fa=!1}function ne(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function ye(o){this.src=o,this.g={},this.h=0}ye.prototype.add=function(o,u,f,m,S){var V=o.toString();o=this.g[V],o||(o=this.g[V]=[],this.h++);var Y=_(o,u,m,S);return-1<Y?(u=o[Y],f||(u.fa=!1)):(u=new X(u,this.src,V,!!m,S),u.fa=f,o.push(u)),u};function Ne(o,u){var f=u.type;if(f in o.g){var m=o.g[f],S=Array.prototype.indexOf.call(m,u,void 0),V;(V=0<=S)&&Array.prototype.splice.call(m,S,1),V&&(ne(u),o.g[f].length==0&&(delete o.g[f],o.h--))}}function _(o,u,f,m){for(var S=0;S<o.length;++S){var V=o[S];if(!V.da&&V.listener==u&&V.capture==!!f&&V.ha==m)return S}return-1}var E="closure_lm_"+(1e6*Math.random()|0),k={};function j(o,u,f,m,S){if(m&&m.once)return Z(o,u,f,m,S);if(Array.isArray(u)){for(var V=0;V<u.length;V++)j(o,u[V],f,m,S);return null}return f=R(f),o&&o[L]?o.K(u,f,h(m)?!!m.capture:!!m,S):M(o,u,f,!1,m,S)}function M(o,u,f,m,S,V){if(!u)throw Error("Invalid event type");var Y=h(S)?!!S.capture:!!S,qe=ee(o);if(qe||(o[E]=qe=new ye(o)),f=qe.add(u,f,m,Y,V),f.proxy)return f;if(m=$(),f.proxy=m,m.src=o,m.listener=f,o.addEventListener)Wt||(S=Y),S===void 0&&(S=!1),o.addEventListener(u.toString(),m,S);else if(o.attachEvent)o.attachEvent(z(u.toString()),m);else if(o.addListener&&o.removeListener)o.addListener(m);else throw Error("addEventListener and attachEvent are unavailable.");return f}function $(){function o(f){return u.call(o.src,o.listener,f)}const u=ie;return o}function Z(o,u,f,m,S){if(Array.isArray(u)){for(var V=0;V<u.length;V++)Z(o,u[V],f,m,S);return null}return f=R(f),o&&o[L]?o.L(u,f,h(m)?!!m.capture:!!m,S):M(o,u,f,!0,m,S)}function Q(o,u,f,m,S){if(Array.isArray(u))for(var V=0;V<u.length;V++)Q(o,u[V],f,m,S);else m=h(m)?!!m.capture:!!m,f=R(f),o&&o[L]?(o=o.i,u=String(u).toString(),u in o.g&&(V=o.g[u],f=_(V,f,m,S),-1<f&&(ne(V[f]),Array.prototype.splice.call(V,f,1),V.length==0&&(delete o.g[u],o.h--)))):o&&(o=ee(o))&&(u=o.g[u.toString()],o=-1,u&&(o=_(u,f,m,S)),(f=-1<o?u[o]:null)&&W(f))}function W(o){if(typeof o!="number"&&o&&!o.da){var u=o.src;if(u&&u[L])Ne(u.i,o);else{var f=o.type,m=o.proxy;u.removeEventListener?u.removeEventListener(f,m,o.capture):u.detachEvent?u.detachEvent(z(f),m):u.addListener&&u.removeListener&&u.removeListener(m),(f=ee(u))?(Ne(f,o),f.h==0&&(f.src=null,u[E]=null)):ne(o)}}}function z(o){return o in k?k[o]:k[o]="on"+o}function ie(o,u){if(o.da)o=!0;else{u=new $t(u,this);var f=o.listener,m=o.ha||o.src;o.fa&&W(o),o=f.call(m,u)}return o}function ee(o){return o=o[E],o instanceof ye?o:null}var D="__closure_events_fn_"+(1e9*Math.random()>>>0);function R(o){return typeof o=="function"?o:(o[D]||(o[D]=function(u){return o.handleEvent(u)}),o[D])}function C(){Te.call(this),this.i=new ye(this),this.M=this,this.F=null}x(C,Te),C.prototype[L]=!0,C.prototype.removeEventListener=function(o,u,f,m){Q(this,o,u,f,m)};function K(o,u){var f,m=o.F;if(m)for(f=[];m;m=m.F)f.push(m);if(o=o.M,m=u.type||u,typeof u=="string")u=new Ke(u,o);else if(u instanceof Ke)u.target=u.target||o;else{var S=u;u=new Ke(m,o),b(u,S)}if(S=!0,f)for(var V=f.length-1;0<=V;V--){var Y=u.g=f[V];S=oe(Y,m,!0,u)&&S}if(Y=u.g=o,S=oe(Y,m,!0,u)&&S,S=oe(Y,m,!1,u)&&S,f)for(V=0;V<f.length;V++)Y=u.g=f[V],S=oe(Y,m,!1,u)&&S}C.prototype.N=function(){if(C.aa.N.call(this),this.i){var o=this.i,u;for(u in o.g){for(var f=o.g[u],m=0;m<f.length;m++)ne(f[m]);delete o.g[u],o.h--}}this.F=null},C.prototype.K=function(o,u,f,m){return this.i.add(String(o),u,!1,f,m)},C.prototype.L=function(o,u,f,m){return this.i.add(String(o),u,!0,f,m)};function oe(o,u,f,m){if(u=o.i.g[String(u)],!u)return!0;u=u.concat();for(var S=!0,V=0;V<u.length;++V){var Y=u[V];if(Y&&!Y.da&&Y.capture==f){var qe=Y.listener,ht=Y.ha||Y.src;Y.fa&&Ne(o.i,Y),S=qe.call(ht,m)!==!1&&S}}return S&&!m.defaultPrevented}function ve(o,u,f){if(typeof o=="function")f&&(o=g(o,f));else if(o&&typeof o.handleEvent=="function")o=g(o.handleEvent,o);else throw Error("Invalid listener argument");return 2147483647<Number(u)?-1:l.setTimeout(o,u||0)}function le(o){o.g=ve(()=>{o.g=null,o.i&&(o.i=!1,le(o))},o.l);const u=o.h;o.h=null,o.m.apply(null,u)}class xe extends Te{constructor(u,f){super(),this.m=u,this.l=f,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:le(this)}N(){super.N(),this.g&&(l.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Ae(o){Te.call(this),this.h=o,this.g={}}x(Ae,Te);var qt=[];function dr(o){_e(o.g,function(u,f){this.g.hasOwnProperty(f)&&W(u)},o),o.g={}}Ae.prototype.N=function(){Ae.aa.N.call(this),dr(this)},Ae.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ut=l.JSON.stringify,Ht=l.JSON.parse,Oi=class{stringify(o){return l.JSON.stringify(o,void 0)}parse(o){return l.JSON.parse(o,void 0)}};function ka(){}ka.prototype.h=null;function gu(o){return o.h||(o.h=o.i())}function _u(){}var Ts={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function xa(){Ke.call(this,"d")}x(xa,Ke);function Da(){Ke.call(this,"c")}x(Da,Ke);var fr={},yu=null;function Mi(){return yu=yu||new C}fr.La="serverreachability";function vu(o){Ke.call(this,fr.La,o)}x(vu,Ke);function Is(o){const u=Mi();K(u,new vu(u))}fr.STAT_EVENT="statevent";function Eu(o,u){Ke.call(this,fr.STAT_EVENT,o),this.stat=u}x(Eu,Ke);function Pt(o){const u=Mi();K(u,new Eu(u,o))}fr.Ma="timingevent";function wu(o,u){Ke.call(this,fr.Ma,o),this.size=u}x(wu,Ke);function bs(o,u){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return l.setTimeout(function(){o()},u)}function As(){this.g=!0}As.prototype.xa=function(){this.g=!1};function zg(o,u,f,m,S,V){o.info(function(){if(o.g)if(V)for(var Y="",qe=V.split("&"),ht=0;ht<qe.length;ht++){var De=qe[ht].split("=");if(1<De.length){var yt=De[0];De=De[1];var vt=yt.split("_");Y=2<=vt.length&&vt[1]=="type"?Y+(yt+"="+De+"&"):Y+(yt+"=redacted&")}}else Y=null;else Y=V;return"XMLHTTP REQ ("+m+") [attempt "+S+"]: "+u+`
`+f+`
`+Y})}function Kg(o,u,f,m,S,V,Y){o.info(function(){return"XMLHTTP RESP ("+m+") [ attempt "+S+"]: "+u+`
`+f+`
`+V+" "+Y})}function Or(o,u,f,m){o.info(function(){return"XMLHTTP TEXT ("+u+"): "+Gg(o,f)+(m?" "+m:"")})}function Wg(o,u){o.info(function(){return"TIMEOUT: "+u})}As.prototype.info=function(){};function Gg(o,u){if(!o.g)return u;if(!u)return null;try{var f=JSON.parse(u);if(f){for(o=0;o<f.length;o++)if(Array.isArray(f[o])){var m=f[o];if(!(2>m.length)){var S=m[1];if(Array.isArray(S)&&!(1>S.length)){var V=S[0];if(V!="noop"&&V!="stop"&&V!="close")for(var Y=1;Y<S.length;Y++)S[Y]=""}}}}return ut(f)}catch{return u}}var Li={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Tu={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Va;function Fi(){}x(Fi,ka),Fi.prototype.g=function(){return new XMLHttpRequest},Fi.prototype.i=function(){return{}},Va=new Fi;function Vn(o,u,f,m){this.j=o,this.i=u,this.l=f,this.R=m||1,this.U=new Ae(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Iu}function Iu(){this.i=null,this.g="",this.h=!1}var bu={},Na={};function Oa(o,u,f){o.L=1,o.v=$i(fn(u)),o.m=f,o.P=!0,Au(o,null)}function Au(o,u){o.F=Date.now(),Ui(o),o.A=fn(o.v);var f=o.A,m=o.R;Array.isArray(m)||(m=[String(m)]),Uu(f.i,"t",m),o.C=0,f=o.j.J,o.h=new Iu,o.g=rh(o.j,f?u:null,!o.m),0<o.O&&(o.M=new xe(g(o.Y,o,o.g),o.O)),u=o.U,f=o.g,m=o.ca;var S="readystatechange";Array.isArray(S)||(S&&(qt[0]=S.toString()),S=qt);for(var V=0;V<S.length;V++){var Y=j(f,S[V],m||u.handleEvent,!1,u.h||u);if(!Y)break;u.g[Y.key]=Y}u=o.H?v(o.H):{},o.m?(o.u||(o.u="POST"),u["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.A,o.u,o.m,u)):(o.u="GET",o.g.ea(o.A,o.u,null,u)),Is(),zg(o.i,o.u,o.A,o.l,o.R,o.m)}Vn.prototype.ca=function(o){o=o.target;const u=this.M;u&&pn(o)==3?u.j():this.Y(o)},Vn.prototype.Y=function(o){try{if(o==this.g)e:{const vt=pn(this.g);var u=this.g.Ba();const Fr=this.g.Z();if(!(3>vt)&&(vt!=3||this.g&&(this.h.h||this.g.oa()||Ku(this.g)))){this.J||vt!=4||u==7||(u==8||0>=Fr?Is(3):Is(2)),Ma(this);var f=this.g.Z();this.X=f;t:if(Ru(this)){var m=Ku(this.g);o="";var S=m.length,V=pn(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){pr(this),Rs(this);var Y="";break t}this.h.i=new l.TextDecoder}for(u=0;u<S;u++)this.h.h=!0,o+=this.h.i.decode(m[u],{stream:!(V&&u==S-1)});m.length=0,this.h.g+=o,this.C=0,Y=this.h.g}else Y=this.g.oa();if(this.o=f==200,Kg(this.i,this.u,this.A,this.l,this.R,vt,f),this.o){if(this.T&&!this.K){t:{if(this.g){var qe,ht=this.g;if((qe=ht.g?ht.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!U(qe)){var De=qe;break t}}De=null}if(f=De)Or(this.i,this.l,f,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,La(this,f);else{this.o=!1,this.s=3,Pt(12),pr(this),Rs(this);break e}}if(this.P){f=!0;let Gt;for(;!this.J&&this.C<Y.length;)if(Gt=Qg(this,Y),Gt==Na){vt==4&&(this.s=4,Pt(14),f=!1),Or(this.i,this.l,null,"[Incomplete Response]");break}else if(Gt==bu){this.s=4,Pt(15),Or(this.i,this.l,Y,"[Invalid Chunk]"),f=!1;break}else Or(this.i,this.l,Gt,null),La(this,Gt);if(Ru(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),vt!=4||Y.length!=0||this.h.h||(this.s=1,Pt(16),f=!1),this.o=this.o&&f,!f)Or(this.i,this.l,Y,"[Invalid Chunked Response]"),pr(this),Rs(this);else if(0<Y.length&&!this.W){this.W=!0;var yt=this.j;yt.g==this&&yt.ba&&!yt.M&&(yt.j.info("Great, no buffering proxy detected. Bytes received: "+Y.length),qa(yt),yt.M=!0,Pt(11))}}else Or(this.i,this.l,Y,null),La(this,Y);vt==4&&pr(this),this.o&&!this.J&&(vt==4?Zu(this.j,this):(this.o=!1,Ui(this)))}else d_(this.g),f==400&&0<Y.indexOf("Unknown SID")?(this.s=3,Pt(12)):(this.s=0,Pt(13)),pr(this),Rs(this)}}}catch{}finally{}};function Ru(o){return o.g?o.u=="GET"&&o.L!=2&&o.j.Ca:!1}function Qg(o,u){var f=o.C,m=u.indexOf(`
`,f);return m==-1?Na:(f=Number(u.substring(f,m)),isNaN(f)?bu:(m+=1,m+f>u.length?Na:(u=u.slice(m,m+f),o.C=m+f,u)))}Vn.prototype.cancel=function(){this.J=!0,pr(this)};function Ui(o){o.S=Date.now()+o.I,Su(o,o.I)}function Su(o,u){if(o.B!=null)throw Error("WatchDog timer not null");o.B=bs(g(o.ba,o),u)}function Ma(o){o.B&&(l.clearTimeout(o.B),o.B=null)}Vn.prototype.ba=function(){this.B=null;const o=Date.now();0<=o-this.S?(Wg(this.i,this.A),this.L!=2&&(Is(),Pt(17)),pr(this),this.s=2,Rs(this)):Su(this,this.S-o)};function Rs(o){o.j.G==0||o.J||Zu(o.j,o)}function pr(o){Ma(o);var u=o.M;u&&typeof u.ma=="function"&&u.ma(),o.M=null,dr(o.U),o.g&&(u=o.g,o.g=null,u.abort(),u.ma())}function La(o,u){try{var f=o.j;if(f.G!=0&&(f.g==o||Fa(f.h,o))){if(!o.K&&Fa(f.h,o)&&f.G==3){try{var m=f.Da.g.parse(u)}catch{m=null}if(Array.isArray(m)&&m.length==3){var S=m;if(S[0]==0){e:if(!f.u){if(f.g)if(f.g.F+3e3<o.F)Gi(f),Ki(f);else break e;$a(f),Pt(18)}}else f.za=S[1],0<f.za-f.T&&37500>S[2]&&f.F&&f.v==0&&!f.C&&(f.C=bs(g(f.Za,f),6e3));if(1>=ku(f.h)&&f.ca){try{f.ca()}catch{}f.ca=void 0}}else gr(f,11)}else if((o.K||f.g==o)&&Gi(f),!U(u))for(S=f.Da.g.parse(u),u=0;u<S.length;u++){let De=S[u];if(f.T=De[0],De=De[1],f.G==2)if(De[0]=="c"){f.K=De[1],f.ia=De[2];const yt=De[3];yt!=null&&(f.la=yt,f.j.info("VER="+f.la));const vt=De[4];vt!=null&&(f.Aa=vt,f.j.info("SVER="+f.Aa));const Fr=De[5];Fr!=null&&typeof Fr=="number"&&0<Fr&&(m=1.5*Fr,f.L=m,f.j.info("backChannelRequestTimeoutMs_="+m)),m=f;const Gt=o.g;if(Gt){const Ji=Gt.g?Gt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Ji){var V=m.h;V.g||Ji.indexOf("spdy")==-1&&Ji.indexOf("quic")==-1&&Ji.indexOf("h2")==-1||(V.j=V.l,V.g=new Set,V.h&&(Ua(V,V.h),V.h=null))}if(m.D){const Ha=Gt.g?Gt.g.getResponseHeader("X-HTTP-Session-Id"):null;Ha&&(m.ya=Ha,We(m.I,m.D,Ha))}}f.G=3,f.l&&f.l.ua(),f.ba&&(f.R=Date.now()-o.F,f.j.info("Handshake RTT: "+f.R+"ms")),m=f;var Y=o;if(m.qa=nh(m,m.J?m.ia:null,m.W),Y.K){xu(m.h,Y);var qe=Y,ht=m.L;ht&&(qe.I=ht),qe.B&&(Ma(qe),Ui(qe)),m.g=Y}else Yu(m);0<f.i.length&&Wi(f)}else De[0]!="stop"&&De[0]!="close"||gr(f,7);else f.G==3&&(De[0]=="stop"||De[0]=="close"?De[0]=="stop"?gr(f,7):ja(f):De[0]!="noop"&&f.l&&f.l.ta(De),f.v=0)}}Is(4)}catch{}}var Jg=class{constructor(o,u){this.g=o,this.map=u}};function Pu(o){this.l=o||10,l.PerformanceNavigationTiming?(o=l.performance.getEntriesByType("navigation"),o=0<o.length&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(l.chrome&&l.chrome.loadTimes&&l.chrome.loadTimes()&&l.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Cu(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function ku(o){return o.h?1:o.g?o.g.size:0}function Fa(o,u){return o.h?o.h==u:o.g?o.g.has(u):!1}function Ua(o,u){o.g?o.g.add(u):o.h=u}function xu(o,u){o.h&&o.h==u?o.h=null:o.g&&o.g.has(u)&&o.g.delete(u)}Pu.prototype.cancel=function(){if(this.i=Du(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const o of this.g.values())o.cancel();this.g.clear()}};function Du(o){if(o.h!=null)return o.i.concat(o.h.D);if(o.g!=null&&o.g.size!==0){let u=o.i;for(const f of o.g.values())u=u.concat(f.D);return u}return N(o.i)}function Yg(o){if(o.V&&typeof o.V=="function")return o.V();if(typeof Map<"u"&&o instanceof Map||typeof Set<"u"&&o instanceof Set)return Array.from(o.values());if(typeof o=="string")return o.split("");if(c(o)){for(var u=[],f=o.length,m=0;m<f;m++)u.push(o[m]);return u}u=[],f=0;for(m in o)u[f++]=o[m];return u}function Xg(o){if(o.na&&typeof o.na=="function")return o.na();if(!o.V||typeof o.V!="function"){if(typeof Map<"u"&&o instanceof Map)return Array.from(o.keys());if(!(typeof Set<"u"&&o instanceof Set)){if(c(o)||typeof o=="string"){var u=[];o=o.length;for(var f=0;f<o;f++)u.push(f);return u}u=[],f=0;for(const m in o)u[f++]=m;return u}}}function Vu(o,u){if(o.forEach&&typeof o.forEach=="function")o.forEach(u,void 0);else if(c(o)||typeof o=="string")Array.prototype.forEach.call(o,u,void 0);else for(var f=Xg(o),m=Yg(o),S=m.length,V=0;V<S;V++)u.call(void 0,m[V],f&&f[V],o)}var Nu=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Zg(o,u){if(o){o=o.split("&");for(var f=0;f<o.length;f++){var m=o[f].indexOf("="),S=null;if(0<=m){var V=o[f].substring(0,m);S=o[f].substring(m+1)}else V=o[f];u(V,S?decodeURIComponent(S.replace(/\+/g," ")):"")}}}function mr(o){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,o instanceof mr){this.h=o.h,Bi(this,o.j),this.o=o.o,this.g=o.g,ji(this,o.s),this.l=o.l;var u=o.i,f=new Cs;f.i=u.i,u.g&&(f.g=new Map(u.g),f.h=u.h),Ou(this,f),this.m=o.m}else o&&(u=String(o).match(Nu))?(this.h=!1,Bi(this,u[1]||"",!0),this.o=Ss(u[2]||""),this.g=Ss(u[3]||"",!0),ji(this,u[4]),this.l=Ss(u[5]||"",!0),Ou(this,u[6]||"",!0),this.m=Ss(u[7]||"")):(this.h=!1,this.i=new Cs(null,this.h))}mr.prototype.toString=function(){var o=[],u=this.j;u&&o.push(Ps(u,Mu,!0),":");var f=this.g;return(f||u=="file")&&(o.push("//"),(u=this.o)&&o.push(Ps(u,Mu,!0),"@"),o.push(encodeURIComponent(String(f)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),f=this.s,f!=null&&o.push(":",String(f))),(f=this.l)&&(this.g&&f.charAt(0)!="/"&&o.push("/"),o.push(Ps(f,f.charAt(0)=="/"?n_:t_,!0))),(f=this.i.toString())&&o.push("?",f),(f=this.m)&&o.push("#",Ps(f,s_)),o.join("")};function fn(o){return new mr(o)}function Bi(o,u,f){o.j=f?Ss(u,!0):u,o.j&&(o.j=o.j.replace(/:$/,""))}function ji(o,u){if(u){if(u=Number(u),isNaN(u)||0>u)throw Error("Bad port number "+u);o.s=u}else o.s=null}function Ou(o,u,f){u instanceof Cs?(o.i=u,i_(o.i,o.h)):(f||(u=Ps(u,r_)),o.i=new Cs(u,o.h))}function We(o,u,f){o.i.set(u,f)}function $i(o){return We(o,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),o}function Ss(o,u){return o?u?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function Ps(o,u,f){return typeof o=="string"?(o=encodeURI(o).replace(u,e_),f&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function e_(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Mu=/[#\/\?@]/g,t_=/[#\?:]/g,n_=/[#\?]/g,r_=/[#\?@]/g,s_=/#/g;function Cs(o,u){this.h=this.g=null,this.i=o||null,this.j=!!u}function Nn(o){o.g||(o.g=new Map,o.h=0,o.i&&Zg(o.i,function(u,f){o.add(decodeURIComponent(u.replace(/\+/g," ")),f)}))}t=Cs.prototype,t.add=function(o,u){Nn(this),this.i=null,o=Mr(this,o);var f=this.g.get(o);return f||this.g.set(o,f=[]),f.push(u),this.h+=1,this};function Lu(o,u){Nn(o),u=Mr(o,u),o.g.has(u)&&(o.i=null,o.h-=o.g.get(u).length,o.g.delete(u))}function Fu(o,u){return Nn(o),u=Mr(o,u),o.g.has(u)}t.forEach=function(o,u){Nn(this),this.g.forEach(function(f,m){f.forEach(function(S){o.call(u,S,m,this)},this)},this)},t.na=function(){Nn(this);const o=Array.from(this.g.values()),u=Array.from(this.g.keys()),f=[];for(let m=0;m<u.length;m++){const S=o[m];for(let V=0;V<S.length;V++)f.push(u[m])}return f},t.V=function(o){Nn(this);let u=[];if(typeof o=="string")Fu(this,o)&&(u=u.concat(this.g.get(Mr(this,o))));else{o=Array.from(this.g.values());for(let f=0;f<o.length;f++)u=u.concat(o[f])}return u},t.set=function(o,u){return Nn(this),this.i=null,o=Mr(this,o),Fu(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[u]),this.h+=1,this},t.get=function(o,u){return o?(o=this.V(o),0<o.length?String(o[0]):u):u};function Uu(o,u,f){Lu(o,u),0<f.length&&(o.i=null,o.g.set(Mr(o,u),N(f)),o.h+=f.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";const o=[],u=Array.from(this.g.keys());for(var f=0;f<u.length;f++){var m=u[f];const V=encodeURIComponent(String(m)),Y=this.V(m);for(m=0;m<Y.length;m++){var S=V;Y[m]!==""&&(S+="="+encodeURIComponent(String(Y[m]))),o.push(S)}}return this.i=o.join("&")};function Mr(o,u){return u=String(u),o.j&&(u=u.toLowerCase()),u}function i_(o,u){u&&!o.j&&(Nn(o),o.i=null,o.g.forEach(function(f,m){var S=m.toLowerCase();m!=S&&(Lu(this,m),Uu(this,S,f))},o)),o.j=u}function o_(o,u){const f=new As;if(l.Image){const m=new Image;m.onload=y(On,f,"TestLoadImage: loaded",!0,u,m),m.onerror=y(On,f,"TestLoadImage: error",!1,u,m),m.onabort=y(On,f,"TestLoadImage: abort",!1,u,m),m.ontimeout=y(On,f,"TestLoadImage: timeout",!1,u,m),l.setTimeout(function(){m.ontimeout&&m.ontimeout()},1e4),m.src=o}else u(!1)}function a_(o,u){const f=new As,m=new AbortController,S=setTimeout(()=>{m.abort(),On(f,"TestPingServer: timeout",!1,u)},1e4);fetch(o,{signal:m.signal}).then(V=>{clearTimeout(S),V.ok?On(f,"TestPingServer: ok",!0,u):On(f,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(S),On(f,"TestPingServer: error",!1,u)})}function On(o,u,f,m,S){try{S&&(S.onload=null,S.onerror=null,S.onabort=null,S.ontimeout=null),m(f)}catch{}}function l_(){this.g=new Oi}function c_(o,u,f){const m=f||"";try{Vu(o,function(S,V){let Y=S;h(S)&&(Y=ut(S)),u.push(m+V+"="+encodeURIComponent(Y))})}catch(S){throw u.push(m+"type="+encodeURIComponent("_badmap")),S}}function qi(o){this.l=o.Ub||null,this.j=o.eb||!1}x(qi,ka),qi.prototype.g=function(){return new Hi(this.l,this.j)},qi.prototype.i=function(o){return function(){return o}}({});function Hi(o,u){C.call(this),this.D=o,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}x(Hi,C),t=Hi.prototype,t.open=function(o,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=o,this.A=u,this.readyState=1,xs(this)},t.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const u={headers:this.u,method:this.B,credentials:this.m,cache:void 0};o&&(u.body=o),(this.D||l).fetch(new Request(this.A,u)).then(this.Sa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,ks(this)),this.readyState=0},t.Sa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,xs(this)),this.g&&(this.readyState=3,xs(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof l.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Bu(this)}else o.text().then(this.Ra.bind(this),this.ga.bind(this))};function Bu(o){o.j.read().then(o.Pa.bind(o)).catch(o.ga.bind(o))}t.Pa=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var u=o.value?o.value:new Uint8Array(0);(u=this.v.decode(u,{stream:!o.done}))&&(this.response=this.responseText+=u)}o.done?ks(this):xs(this),this.readyState==3&&Bu(this)}},t.Ra=function(o){this.g&&(this.response=this.responseText=o,ks(this))},t.Qa=function(o){this.g&&(this.response=o,ks(this))},t.ga=function(){this.g&&ks(this)};function ks(o){o.readyState=4,o.l=null,o.j=null,o.v=null,xs(o)}t.setRequestHeader=function(o,u){this.u.append(o,u)},t.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";const o=[],u=this.h.entries();for(var f=u.next();!f.done;)f=f.value,o.push(f[0]+": "+f[1]),f=u.next();return o.join(`\r
`)};function xs(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(Hi.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function ju(o){let u="";return _e(o,function(f,m){u+=m,u+=":",u+=f,u+=`\r
`}),u}function Ba(o,u,f){e:{for(m in f){var m=!1;break e}m=!0}m||(f=ju(f),typeof o=="string"?f!=null&&encodeURIComponent(String(f)):We(o,u,f))}function Ze(o){C.call(this),this.headers=new Map,this.o=o||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}x(Ze,C);var u_=/^https?$/i,h_=["POST","PUT"];t=Ze.prototype,t.Ha=function(o){this.J=o},t.ea=function(o,u,f,m){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);u=u?u.toUpperCase():"GET",this.D=o,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Va.g(),this.v=this.o?gu(this.o):gu(Va),this.g.onreadystatechange=g(this.Ea,this);try{this.B=!0,this.g.open(u,String(o),!0),this.B=!1}catch(V){$u(this,V);return}if(o=f||"",f=new Map(this.headers),m)if(Object.getPrototypeOf(m)===Object.prototype)for(var S in m)f.set(S,m[S]);else if(typeof m.keys=="function"&&typeof m.get=="function")for(const V of m.keys())f.set(V,m.get(V));else throw Error("Unknown input type for opt_headers: "+String(m));m=Array.from(f.keys()).find(V=>V.toLowerCase()=="content-type"),S=l.FormData&&o instanceof l.FormData,!(0<=Array.prototype.indexOf.call(h_,u,void 0))||m||S||f.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[V,Y]of f)this.g.setRequestHeader(V,Y);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{zu(this),this.u=!0,this.g.send(o),this.u=!1}catch(V){$u(this,V)}};function $u(o,u){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=u,o.m=5,qu(o),zi(o)}function qu(o){o.A||(o.A=!0,K(o,"complete"),K(o,"error"))}t.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=o||7,K(this,"complete"),K(this,"abort"),zi(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),zi(this,!0)),Ze.aa.N.call(this)},t.Ea=function(){this.s||(this.B||this.u||this.j?Hu(this):this.bb())},t.bb=function(){Hu(this)};function Hu(o){if(o.h&&typeof a<"u"&&(!o.v[1]||pn(o)!=4||o.Z()!=2)){if(o.u&&pn(o)==4)ve(o.Ea,0,o);else if(K(o,"readystatechange"),pn(o)==4){o.h=!1;try{const Y=o.Z();e:switch(Y){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break e;default:u=!1}var f;if(!(f=u)){var m;if(m=Y===0){var S=String(o.D).match(Nu)[1]||null;!S&&l.self&&l.self.location&&(S=l.self.location.protocol.slice(0,-1)),m=!u_.test(S?S.toLowerCase():"")}f=m}if(f)K(o,"complete"),K(o,"success");else{o.m=6;try{var V=2<pn(o)?o.g.statusText:""}catch{V=""}o.l=V+" ["+o.Z()+"]",qu(o)}}finally{zi(o)}}}}function zi(o,u){if(o.g){zu(o);const f=o.g,m=o.v[0]?()=>{}:null;o.g=null,o.v=null,u||K(o,"ready");try{f.onreadystatechange=m}catch{}}}function zu(o){o.I&&(l.clearTimeout(o.I),o.I=null)}t.isActive=function(){return!!this.g};function pn(o){return o.g?o.g.readyState:0}t.Z=function(){try{return 2<pn(this)?this.g.status:-1}catch{return-1}},t.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.Oa=function(o){if(this.g){var u=this.g.responseText;return o&&u.indexOf(o)==0&&(u=u.substring(o.length)),Ht(u)}};function Ku(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.H){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function d_(o){const u={};o=(o.g&&2<=pn(o)&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let m=0;m<o.length;m++){if(U(o[m]))continue;var f=A(o[m]);const S=f[0];if(f=f[1],typeof f!="string")continue;f=f.trim();const V=u[S]||[];u[S]=V,V.push(f)}I(u,function(m){return m.join(", ")})}t.Ba=function(){return this.m},t.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Ds(o,u,f){return f&&f.internalChannelParams&&f.internalChannelParams[o]||u}function Wu(o){this.Aa=0,this.i=[],this.j=new As,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Ds("failFast",!1,o),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Ds("baseRetryDelayMs",5e3,o),this.cb=Ds("retryDelaySeedMs",1e4,o),this.Wa=Ds("forwardChannelMaxRetries",2,o),this.wa=Ds("forwardChannelRequestTimeoutMs",2e4,o),this.pa=o&&o.xmlHttpFactory||void 0,this.Xa=o&&o.Tb||void 0,this.Ca=o&&o.useFetchStreams||!1,this.L=void 0,this.J=o&&o.supportsCrossDomainXhr||!1,this.K="",this.h=new Pu(o&&o.concurrentRequestLimit),this.Da=new l_,this.P=o&&o.fastHandshake||!1,this.O=o&&o.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=o&&o.Rb||!1,o&&o.xa&&this.j.xa(),o&&o.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&o&&o.detectBufferingProxy||!1,this.ja=void 0,o&&o.longPollingTimeout&&0<o.longPollingTimeout&&(this.ja=o.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}t=Wu.prototype,t.la=8,t.G=1,t.connect=function(o,u,f,m){Pt(0),this.W=o,this.H=u||{},f&&m!==void 0&&(this.H.OSID=f,this.H.OAID=m),this.F=this.X,this.I=nh(this,null,this.W),Wi(this)};function ja(o){if(Gu(o),o.G==3){var u=o.U++,f=fn(o.I);if(We(f,"SID",o.K),We(f,"RID",u),We(f,"TYPE","terminate"),Vs(o,f),u=new Vn(o,o.j,u),u.L=2,u.v=$i(fn(f)),f=!1,l.navigator&&l.navigator.sendBeacon)try{f=l.navigator.sendBeacon(u.v.toString(),"")}catch{}!f&&l.Image&&(new Image().src=u.v,f=!0),f||(u.g=rh(u.j,null),u.g.ea(u.v)),u.F=Date.now(),Ui(u)}th(o)}function Ki(o){o.g&&(qa(o),o.g.cancel(),o.g=null)}function Gu(o){Ki(o),o.u&&(l.clearTimeout(o.u),o.u=null),Gi(o),o.h.cancel(),o.s&&(typeof o.s=="number"&&l.clearTimeout(o.s),o.s=null)}function Wi(o){if(!Cu(o.h)&&!o.s){o.s=!0;var u=o.Ga;we||Fe(),Ee||(we(),Ee=!0),Pe.add(u,o),o.B=0}}function f_(o,u){return ku(o.h)>=o.h.j-(o.s?1:0)?!1:o.s?(o.i=u.D.concat(o.i),!0):o.G==1||o.G==2||o.B>=(o.Va?0:o.Wa)?!1:(o.s=bs(g(o.Ga,o,u),eh(o,o.B)),o.B++,!0)}t.Ga=function(o){if(this.s)if(this.s=null,this.G==1){if(!o){this.U=Math.floor(1e5*Math.random()),o=this.U++;const S=new Vn(this,this.j,o);let V=this.o;if(this.S&&(V?(V=v(V),b(V,this.S)):V=this.S),this.m!==null||this.O||(S.H=V,V=null),this.P)e:{for(var u=0,f=0;f<this.i.length;f++){t:{var m=this.i[f];if("__data__"in m.map&&(m=m.map.__data__,typeof m=="string")){m=m.length;break t}m=void 0}if(m===void 0)break;if(u+=m,4096<u){u=f;break e}if(u===4096||f===this.i.length-1){u=f+1;break e}}u=1e3}else u=1e3;u=Ju(this,S,u),f=fn(this.I),We(f,"RID",o),We(f,"CVER",22),this.D&&We(f,"X-HTTP-Session-Id",this.D),Vs(this,f),V&&(this.O?u="headers="+encodeURIComponent(String(ju(V)))+"&"+u:this.m&&Ba(f,this.m,V)),Ua(this.h,S),this.Ua&&We(f,"TYPE","init"),this.P?(We(f,"$req",u),We(f,"SID","null"),S.T=!0,Oa(S,f,null)):Oa(S,f,u),this.G=2}}else this.G==3&&(o?Qu(this,o):this.i.length==0||Cu(this.h)||Qu(this))};function Qu(o,u){var f;u?f=u.l:f=o.U++;const m=fn(o.I);We(m,"SID",o.K),We(m,"RID",f),We(m,"AID",o.T),Vs(o,m),o.m&&o.o&&Ba(m,o.m,o.o),f=new Vn(o,o.j,f,o.B+1),o.m===null&&(f.H=o.o),u&&(o.i=u.D.concat(o.i)),u=Ju(o,f,1e3),f.I=Math.round(.5*o.wa)+Math.round(.5*o.wa*Math.random()),Ua(o.h,f),Oa(f,m,u)}function Vs(o,u){o.H&&_e(o.H,function(f,m){We(u,m,f)}),o.l&&Vu({},function(f,m){We(u,m,f)})}function Ju(o,u,f){f=Math.min(o.i.length,f);var m=o.l?g(o.l.Na,o.l,o):null;e:{var S=o.i;let V=-1;for(;;){const Y=["count="+f];V==-1?0<f?(V=S[0].g,Y.push("ofs="+V)):V=0:Y.push("ofs="+V);let qe=!0;for(let ht=0;ht<f;ht++){let De=S[ht].g;const yt=S[ht].map;if(De-=V,0>De)V=Math.max(0,S[ht].g-100),qe=!1;else try{c_(yt,Y,"req"+De+"_")}catch{m&&m(yt)}}if(qe){m=Y.join("&");break e}}}return o=o.i.splice(0,f),u.D=o,m}function Yu(o){if(!o.g&&!o.u){o.Y=1;var u=o.Fa;we||Fe(),Ee||(we(),Ee=!0),Pe.add(u,o),o.v=0}}function $a(o){return o.g||o.u||3<=o.v?!1:(o.Y++,o.u=bs(g(o.Fa,o),eh(o,o.v)),o.v++,!0)}t.Fa=function(){if(this.u=null,Xu(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var o=2*this.R;this.j.info("BP detection timer enabled: "+o),this.A=bs(g(this.ab,this),o)}},t.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Pt(10),Ki(this),Xu(this))};function qa(o){o.A!=null&&(l.clearTimeout(o.A),o.A=null)}function Xu(o){o.g=new Vn(o,o.j,"rpc",o.Y),o.m===null&&(o.g.H=o.o),o.g.O=0;var u=fn(o.qa);We(u,"RID","rpc"),We(u,"SID",o.K),We(u,"AID",o.T),We(u,"CI",o.F?"0":"1"),!o.F&&o.ja&&We(u,"TO",o.ja),We(u,"TYPE","xmlhttp"),Vs(o,u),o.m&&o.o&&Ba(u,o.m,o.o),o.L&&(o.g.I=o.L);var f=o.g;o=o.ia,f.L=1,f.v=$i(fn(u)),f.m=null,f.P=!0,Au(f,o)}t.Za=function(){this.C!=null&&(this.C=null,Ki(this),$a(this),Pt(19))};function Gi(o){o.C!=null&&(l.clearTimeout(o.C),o.C=null)}function Zu(o,u){var f=null;if(o.g==u){Gi(o),qa(o),o.g=null;var m=2}else if(Fa(o.h,u))f=u.D,xu(o.h,u),m=1;else return;if(o.G!=0){if(u.o)if(m==1){f=u.m?u.m.length:0,u=Date.now()-u.F;var S=o.B;m=Mi(),K(m,new wu(m,f)),Wi(o)}else Yu(o);else if(S=u.s,S==3||S==0&&0<u.X||!(m==1&&f_(o,u)||m==2&&$a(o)))switch(f&&0<f.length&&(u=o.h,u.i=u.i.concat(f)),S){case 1:gr(o,5);break;case 4:gr(o,10);break;case 3:gr(o,6);break;default:gr(o,2)}}}function eh(o,u){let f=o.Ta+Math.floor(Math.random()*o.cb);return o.isActive()||(f*=2),f*u}function gr(o,u){if(o.j.info("Error code "+u),u==2){var f=g(o.fb,o),m=o.Xa;const S=!m;m=new mr(m||"//www.google.com/images/cleardot.gif"),l.location&&l.location.protocol=="http"||Bi(m,"https"),$i(m),S?o_(m.toString(),f):a_(m.toString(),f)}else Pt(2);o.G=0,o.l&&o.l.sa(u),th(o),Gu(o)}t.fb=function(o){o?(this.j.info("Successfully pinged google.com"),Pt(2)):(this.j.info("Failed to ping google.com"),Pt(1))};function th(o){if(o.G=0,o.ka=[],o.l){const u=Du(o.h);(u.length!=0||o.i.length!=0)&&(O(o.ka,u),O(o.ka,o.i),o.h.i.length=0,N(o.i),o.i.length=0),o.l.ra()}}function nh(o,u,f){var m=f instanceof mr?fn(f):new mr(f);if(m.g!="")u&&(m.g=u+"."+m.g),ji(m,m.s);else{var S=l.location;m=S.protocol,u=u?u+"."+S.hostname:S.hostname,S=+S.port;var V=new mr(null);m&&Bi(V,m),u&&(V.g=u),S&&ji(V,S),f&&(V.l=f),m=V}return f=o.D,u=o.ya,f&&u&&We(m,f,u),We(m,"VER",o.la),Vs(o,m),m}function rh(o,u,f){if(u&&!o.J)throw Error("Can't create secondary domain capable XhrIo object.");return u=o.Ca&&!o.pa?new Ze(new qi({eb:f})):new Ze(o.pa),u.Ha(o.J),u}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function sh(){}t=sh.prototype,t.ua=function(){},t.ta=function(){},t.sa=function(){},t.ra=function(){},t.isActive=function(){return!0},t.Na=function(){};function Qi(){}Qi.prototype.g=function(o,u){return new Ot(o,u)};function Ot(o,u){C.call(this),this.g=new Wu(u),this.l=o,this.h=u&&u.messageUrlParams||null,o=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(o?o["X-WebChannel-Content-Type"]=u.messageContentType:o={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.va&&(o?o["X-WebChannel-Client-Profile"]=u.va:o={"X-WebChannel-Client-Profile":u.va}),this.g.S=o,(o=u&&u.Sb)&&!U(o)&&(this.g.m=o),this.v=u&&u.supportsCrossDomainXhr||!1,this.u=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!U(u)&&(this.g.D=u,o=this.h,o!==null&&u in o&&(o=this.h,u in o&&delete o[u])),this.j=new Lr(this)}x(Ot,C),Ot.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Ot.prototype.close=function(){ja(this.g)},Ot.prototype.o=function(o){var u=this.g;if(typeof o=="string"){var f={};f.__data__=o,o=f}else this.u&&(f={},f.__data__=ut(o),o=f);u.i.push(new Jg(u.Ya++,o)),u.G==3&&Wi(u)},Ot.prototype.N=function(){this.g.l=null,delete this.j,ja(this.g),delete this.g,Ot.aa.N.call(this)};function ih(o){xa.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var u=o.__sm__;if(u){e:{for(const f in u){o=f;break e}o=void 0}(this.i=o)&&(o=this.i,u=u!==null&&o in u?u[o]:void 0),this.data=u}else this.data=o}x(ih,xa);function oh(){Da.call(this),this.status=1}x(oh,Da);function Lr(o){this.g=o}x(Lr,sh),Lr.prototype.ua=function(){K(this.g,"a")},Lr.prototype.ta=function(o){K(this.g,new ih(o))},Lr.prototype.sa=function(o){K(this.g,new oh)},Lr.prototype.ra=function(){K(this.g,"b")},Qi.prototype.createWebChannel=Qi.prototype.g,Ot.prototype.send=Ot.prototype.o,Ot.prototype.open=Ot.prototype.m,Ot.prototype.close=Ot.prototype.close,Yp=function(){return new Qi},Jp=function(){return Mi()},Qp=fr,Ul={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},Li.NO_ERROR=0,Li.TIMEOUT=8,Li.HTTP_ERROR=6,po=Li,Tu.COMPLETE="complete",Gp=Tu,_u.EventType=Ts,Ts.OPEN="a",Ts.CLOSE="b",Ts.ERROR="c",Ts.MESSAGE="d",C.prototype.listen=C.prototype.K,Us=_u,Ze.prototype.listenOnce=Ze.prototype.L,Ze.prototype.getLastError=Ze.prototype.Ka,Ze.prototype.getLastErrorCode=Ze.prototype.Ba,Ze.prototype.getStatus=Ze.prototype.Z,Ze.prototype.getResponseJson=Ze.prototype.Oa,Ze.prototype.getResponseText=Ze.prototype.oa,Ze.prototype.send=Ze.prototype.ea,Ze.prototype.setWithCredentials=Ze.prototype.Ha,Wp=Ze}).apply(typeof eo<"u"?eo:typeof self<"u"?self:typeof window<"u"?window:{});const ud="@firebase/firestore";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class wt{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}wt.UNAUTHENTICATED=new wt(null),wt.GOOGLE_CREDENTIALS=new wt("google-credentials-uid"),wt.FIRST_PARTY=new wt("first-party-uid"),wt.MOCK_USER=new wt("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */const Rr=new bc("@firebase/firestore");function Ls(){return Rr.logLevel}function se(t,...e){if(Rr.logLevel<=Se.DEBUG){const n=e.map(Sc);Rr.debug(`Firestore (${gs}): ${t}`,...n)}}function Sn(t,...e){if(Rr.logLevel<=Se.ERROR){const n=e.map(Sc);Rr.error(`Firestore (${gs}): ${t}`,...n)}}function ls(t,...e){if(Rr.logLevel<=Se.WARN){const n=e.map(Sc);Rr.warn(`Firestore (${gs}): ${t}`,...n)}}function Sc(t){if(typeof t=="string")return t;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
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
 */function he(t="Unexpected state"){const e=`FIRESTORE (${gs}) INTERNAL ASSERTION FAILED: `+t;throw Sn(e),new Error(e)}function Be(t,e){t||he()}function pe(t,e){return t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const F={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class re extends Dn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class Xp{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class IT{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(wt.UNAUTHENTICATED))}shutdown(){}}class bT{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}}class AT{constructor(e){this.t=e,this.currentUser=wt.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){Be(this.o===void 0);let r=this.i;const s=c=>this.i!==r?(r=this.i,n(c)):Promise.resolve();let i=new Zn;this.o=()=>{this.i++,this.currentUser=this.u(),i.resolve(),i=new Zn,e.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const c=i;e.enqueueRetryable(async()=>{await c.promise,await s(this.currentUser)})},l=c=>{se("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=c,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(c=>l(c)),setTimeout(()=>{if(!this.auth){const c=this.t.getImmediate({optional:!0});c?l(c):(se("FirebaseAuthCredentialsProvider","Auth not yet detected"),i.resolve(),i=new Zn)}},0),a()}getToken(){const e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(r=>this.i!==e?(se("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(Be(typeof r.accessToken=="string"),new Xp(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return Be(e===null||typeof e=="string"),new wt(e)}}class RT{constructor(e,n,r){this.l=e,this.h=n,this.P=r,this.type="FirstParty",this.user=wt.FIRST_PARTY,this.I=new Map}T(){return this.P?this.P():null}get headers(){this.I.set("X-Goog-AuthUser",this.l);const e=this.T();return e&&this.I.set("Authorization",e),this.h&&this.I.set("X-Goog-Iam-Authorization-Token",this.h),this.I}}class ST{constructor(e,n,r){this.l=e,this.h=n,this.P=r}getToken(){return Promise.resolve(new RT(this.l,this.h,this.P))}start(e,n){e.enqueueRetryable(()=>n(wt.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class PT{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class CT{constructor(e){this.A=e,this.forceRefresh=!1,this.appCheck=null,this.R=null}start(e,n){Be(this.o===void 0);const r=i=>{i.error!=null&&se("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${i.error.message}`);const a=i.token!==this.R;return this.R=i.token,se("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?n(i.token):Promise.resolve()};this.o=i=>{e.enqueueRetryable(()=>r(i))};const s=i=>{se("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=i,this.o&&this.appCheck.addTokenListener(this.o)};this.A.onInit(i=>s(i)),setTimeout(()=>{if(!this.appCheck){const i=this.A.getImmediate({optional:!0});i?s(i):se("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(Be(typeof n.token=="string"),this.R=n.token,new PT(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kT(t){const e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let r=0;r<t;r++)n[r]=Math.floor(256*Math.random());return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zp{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=Math.floor(256/e.length)*e.length;let r="";for(;r.length<20;){const s=kT(40);for(let i=0;i<s.length;++i)r.length<20&&s[i]<n&&(r+=e.charAt(s[i]%e.length))}return r}}function Ve(t,e){return t<e?-1:t>e?1:0}function cs(t,e,n){return t.length===e.length&&t.every((r,s)=>n(r,e[s]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class at{constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new re(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new re(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<-62135596800)throw new re(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new re(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}static now(){return at.fromMillis(Date.now())}static fromDate(e){return at.fromMillis(e.getTime())}static fromMillis(e){const n=Math.floor(e/1e3),r=Math.floor(1e6*(e-1e3*n));return new at(n,r)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/1e6}_compareTo(e){return this.seconds===e.seconds?Ve(this.nanoseconds,e.nanoseconds):Ve(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{seconds:this.seconds,nanoseconds:this.nanoseconds}}valueOf(){const e=this.seconds- -62135596800;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class di{constructor(e,n,r){n===void 0?n=0:n>e.length&&he(),r===void 0?r=e.length-n:r>e.length-n&&he(),this.segments=e,this.offset=n,this.len=r}get length(){return this.len}isEqual(e){return di.comparator(this,e)===0}child(e){const n=this.segments.slice(this.offset,this.limit());return e instanceof di?e.forEach(r=>{n.push(r)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,r=this.limit();n<r;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){const r=Math.min(e.length,n.length);for(let s=0;s<r;s++){const i=e.get(s),a=n.get(s);if(i<a)return-1;if(i>a)return 1}return e.length<n.length?-1:e.length>n.length?1:0}}class Ge extends di{construct(e,n,r){return new Ge(e,n,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const n=[];for(const r of e){if(r.indexOf("//")>=0)throw new re(F.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);n.push(...r.split("/").filter(s=>s.length>0))}return new Ge(n)}static emptyPath(){return new Ge([])}}const xT=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class mt extends di{construct(e,n,r){return new mt(e,n,r)}static isValidIdentifier(e){return xT.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),mt.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)==="__name__"}static keyField(){return new mt(["__name__"])}static fromServerFormat(e){const n=[];let r="",s=0;const i=()=>{if(r.length===0)throw new re(F.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(r),r=""};let a=!1;for(;s<e.length;){const l=e[s];if(l==="\\"){if(s+1===e.length)throw new re(F.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const c=e[s+1];if(c!=="\\"&&c!=="."&&c!=="`")throw new re(F.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=c,s+=2}else l==="`"?(a=!a,s++):l!=="."||a?(r+=l,s++):(i(),s++)}if(i(),a)throw new re(F.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new mt(n)}static emptyPath(){return new mt([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ae{constructor(e){this.path=e}static fromPath(e){return new ae(Ge.fromString(e))}static fromName(e){return new ae(Ge.fromString(e).popFirst(5))}static empty(){return new ae(Ge.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&Ge.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return Ge.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new ae(new Ge(e.slice()))}}function DT(t,e){const n=t.toTimestamp().seconds,r=t.toTimestamp().nanoseconds+1,s=fe.fromTimestamp(r===1e9?new at(n+1,0):new at(n,r));return new sr(s,ae.empty(),e)}function VT(t){return new sr(t.readTime,t.key,-1)}class sr{constructor(e,n,r){this.readTime=e,this.documentKey=n,this.largestBatchId=r}static min(){return new sr(fe.min(),ae.empty(),-1)}static max(){return new sr(fe.max(),ae.empty(),-1)}}function NT(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=ae.comparator(t.documentKey,e.documentKey),n!==0?n:Ve(t.largestBatchId,e.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const OT="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class MT{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ai(t){if(t.code!==F.FAILED_PRECONDITION||t.message!==OT)throw t;se("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class H{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&he(),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new H((r,s)=>{this.nextCallback=i=>{this.wrapSuccess(e,i).next(r,s)},this.catchCallback=i=>{this.wrapFailure(n,i).next(r,s)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{const n=e();return n instanceof H?n:H.resolve(n)}catch(n){return H.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):H.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):H.reject(n)}static resolve(e){return new H((n,r)=>{n(e)})}static reject(e){return new H((n,r)=>{r(e)})}static waitFor(e){return new H((n,r)=>{let s=0,i=0,a=!1;e.forEach(l=>{++s,l.next(()=>{++i,a&&i===s&&n()},c=>r(c))}),a=!0,i===s&&n()})}static or(e){let n=H.resolve(!1);for(const r of e)n=n.next(s=>s?H.resolve(s):r());return n}static forEach(e,n){const r=[];return e.forEach((s,i)=>{r.push(n.call(this,s,i))}),this.waitFor(r)}static mapArray(e,n){return new H((r,s)=>{const i=e.length,a=new Array(i);let l=0;for(let c=0;c<i;c++){const h=c;n(e[h]).next(d=>{a[h]=d,++l,l===i&&r(a)},d=>s(d))}})}static doWhile(e,n){return new H((r,s)=>{const i=()=>{e()===!0?n().next(()=>{i()},s):r()};i()})}}function LT(t){const e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function Ri(t){return t.name==="IndexedDbTransactionError"}/**
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
 */class Pc{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=r=>this.ie(r),this.se=r=>n.writeSequenceNumber(r))}ie(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){const e=++this.previousValue;return this.se&&this.se(e),e}}Pc.oe=-1;function aa(t){return t==null}function Vo(t){return t===0&&1/t==-1/0}function FT(t){return typeof t=="number"&&Number.isInteger(t)&&!Vo(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hd(t){let e=0;for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function Dr(t,e){for(const n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function em(t){for(const e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class gt{constructor(e){this.comparator=e,this.data=new Xe(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,r)=>(e(n),!1))}forEachInRange(e,n){const r=this.data.getIteratorFrom(e[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,e[1])>=0)return;n(s.key)}}forEachWhile(e,n){let r;for(r=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();r.hasNext();)if(!e(r.getNext().key))return}firstAfterOrEqual(e){const n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new dd(this.data.getIterator())}getIteratorFrom(e){return new dd(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(r=>{n=n.add(r)}),n}isEqual(e){if(!(e instanceof gt)||this.size!==e.size)return!1;const n=this.data.getIterator(),r=e.data.getIterator();for(;n.hasNext();){const s=n.getNext().key,i=r.getNext().key;if(this.comparator(s,i)!==0)return!1}return!0}toArray(){const e=[];return this.forEach(n=>{e.push(n)}),e}toString(){const e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){const n=new gt(this.comparator);return n.data=e,n}}class dd{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Bt{constructor(e){this.fields=e,e.sort(mt.comparator)}static empty(){return new Bt([])}unionWith(e){let n=new gt(mt.comparator);for(const r of this.fields)n=n.add(r);for(const r of e)n=n.add(r);return new Bt(n.toArray())}covers(e){for(const n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return cs(this.fields,e.fields,(n,r)=>n.isEqual(r))}}/**
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
 */class tm extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _t{constructor(e){this.binaryString=e}static fromBase64String(e){const n=function(s){try{return atob(s)}catch(i){throw typeof DOMException<"u"&&i instanceof DOMException?new tm("Invalid base64 string: "+i):i}}(e);return new _t(n)}static fromUint8Array(e){const n=function(s){let i="";for(let a=0;a<s.length;++a)i+=String.fromCharCode(s[a]);return i}(e);return new _t(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){const r=new Uint8Array(n.length);for(let s=0;s<n.length;s++)r[s]=n.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Ve(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}_t.EMPTY_BYTE_STRING=new _t("");const UT=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function ir(t){if(Be(!!t),typeof t=="string"){let e=0;const n=UT.exec(t);if(Be(!!n),n[1]){let s=n[1];s=(s+"000000000").substr(0,9),e=Number(s)}const r=new Date(t);return{seconds:Math.floor(r.getTime()/1e3),nanos:e}}return{seconds:et(t.seconds),nanos:et(t.nanos)}}function et(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function Sr(t){return typeof t=="string"?_t.fromBase64String(t):_t.fromUint8Array(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cc(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="server_timestamp"}function kc(t){const e=t.mapValue.fields.__previous_value__;return Cc(e)?kc(e):e}function fi(t){const e=ir(t.mapValue.fields.__local_write_time__.timestampValue);return new at(e.seconds,e.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class BT{constructor(e,n,r,s,i,a,l,c,h){this.databaseId=e,this.appId=n,this.persistenceKey=r,this.host=s,this.ssl=i,this.forceLongPolling=a,this.autoDetectLongPolling=l,this.longPollingOptions=c,this.useFetchStreams=h}}class pi{constructor(e,n){this.projectId=e,this.database=n||"(default)"}static empty(){return new pi("","")}get isDefaultDatabase(){return this.database==="(default)"}isEqual(e){return e instanceof pi&&e.projectId===this.projectId&&e.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const no={mapValue:{fields:{__type__:{stringValue:"__max__"}}}};function Pr(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?Cc(t)?4:$T(t)?9007199254740991:jT(t)?10:11:he()}function dn(t,e){if(t===e)return!0;const n=Pr(t);if(n!==Pr(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return fi(t).isEqual(fi(e));case 3:return function(s,i){if(typeof s.timestampValue=="string"&&typeof i.timestampValue=="string"&&s.timestampValue.length===i.timestampValue.length)return s.timestampValue===i.timestampValue;const a=ir(s.timestampValue),l=ir(i.timestampValue);return a.seconds===l.seconds&&a.nanos===l.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(s,i){return Sr(s.bytesValue).isEqual(Sr(i.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(s,i){return et(s.geoPointValue.latitude)===et(i.geoPointValue.latitude)&&et(s.geoPointValue.longitude)===et(i.geoPointValue.longitude)}(t,e);case 2:return function(s,i){if("integerValue"in s&&"integerValue"in i)return et(s.integerValue)===et(i.integerValue);if("doubleValue"in s&&"doubleValue"in i){const a=et(s.doubleValue),l=et(i.doubleValue);return a===l?Vo(a)===Vo(l):isNaN(a)&&isNaN(l)}return!1}(t,e);case 9:return cs(t.arrayValue.values||[],e.arrayValue.values||[],dn);case 10:case 11:return function(s,i){const a=s.mapValue.fields||{},l=i.mapValue.fields||{};if(hd(a)!==hd(l))return!1;for(const c in a)if(a.hasOwnProperty(c)&&(l[c]===void 0||!dn(a[c],l[c])))return!1;return!0}(t,e);default:return he()}}function mi(t,e){return(t.values||[]).find(n=>dn(n,e))!==void 0}function us(t,e){if(t===e)return 0;const n=Pr(t),r=Pr(e);if(n!==r)return Ve(n,r);switch(n){case 0:case 9007199254740991:return 0;case 1:return Ve(t.booleanValue,e.booleanValue);case 2:return function(i,a){const l=et(i.integerValue||i.doubleValue),c=et(a.integerValue||a.doubleValue);return l<c?-1:l>c?1:l===c?0:isNaN(l)?isNaN(c)?0:-1:1}(t,e);case 3:return fd(t.timestampValue,e.timestampValue);case 4:return fd(fi(t),fi(e));case 5:return Ve(t.stringValue,e.stringValue);case 6:return function(i,a){const l=Sr(i),c=Sr(a);return l.compareTo(c)}(t.bytesValue,e.bytesValue);case 7:return function(i,a){const l=i.split("/"),c=a.split("/");for(let h=0;h<l.length&&h<c.length;h++){const d=Ve(l[h],c[h]);if(d!==0)return d}return Ve(l.length,c.length)}(t.referenceValue,e.referenceValue);case 8:return function(i,a){const l=Ve(et(i.latitude),et(a.latitude));return l!==0?l:Ve(et(i.longitude),et(a.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return pd(t.arrayValue,e.arrayValue);case 10:return function(i,a){var l,c,h,d;const p=i.fields||{},g=a.fields||{},y=(l=p.value)===null||l===void 0?void 0:l.arrayValue,x=(c=g.value)===null||c===void 0?void 0:c.arrayValue,N=Ve(((h=y==null?void 0:y.values)===null||h===void 0?void 0:h.length)||0,((d=x==null?void 0:x.values)===null||d===void 0?void 0:d.length)||0);return N!==0?N:pd(y,x)}(t.mapValue,e.mapValue);case 11:return function(i,a){if(i===no.mapValue&&a===no.mapValue)return 0;if(i===no.mapValue)return 1;if(a===no.mapValue)return-1;const l=i.fields||{},c=Object.keys(l),h=a.fields||{},d=Object.keys(h);c.sort(),d.sort();for(let p=0;p<c.length&&p<d.length;++p){const g=Ve(c[p],d[p]);if(g!==0)return g;const y=us(l[c[p]],h[d[p]]);if(y!==0)return y}return Ve(c.length,d.length)}(t.mapValue,e.mapValue);default:throw he()}}function fd(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return Ve(t,e);const n=ir(t),r=ir(e),s=Ve(n.seconds,r.seconds);return s!==0?s:Ve(n.nanos,r.nanos)}function pd(t,e){const n=t.values||[],r=e.values||[];for(let s=0;s<n.length&&s<r.length;++s){const i=us(n[s],r[s]);if(i)return i}return Ve(n.length,r.length)}function hs(t){return Bl(t)}function Bl(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){const r=ir(n);return`time(${r.seconds},${r.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return Sr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return ae.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let r="[",s=!0;for(const i of n.values||[])s?s=!1:r+=",",r+=Bl(i);return r+"]"}(t.arrayValue):"mapValue"in t?function(n){const r=Object.keys(n.fields||{}).sort();let s="{",i=!0;for(const a of r)i?i=!1:s+=",",s+=`${a}:${Bl(n.fields[a])}`;return s+"}"}(t.mapValue):he()}function md(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function jl(t){return!!t&&"integerValue"in t}function xc(t){return!!t&&"arrayValue"in t}function gd(t){return!!t&&"nullValue"in t}function _d(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function mo(t){return!!t&&"mapValue"in t}function jT(t){var e,n;return((n=(((e=t==null?void 0:t.mapValue)===null||e===void 0?void 0:e.fields)||{}).__type__)===null||n===void 0?void 0:n.stringValue)==="__vector__"}function Ys(t){if(t.geoPointValue)return{geoPointValue:Object.assign({},t.geoPointValue)};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:Object.assign({},t.timestampValue)};if(t.mapValue){const e={mapValue:{fields:{}}};return Dr(t.mapValue.fields,(n,r)=>e.mapValue.fields[n]=Ys(r)),e}if(t.arrayValue){const e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=Ys(t.arrayValue.values[n]);return e}return Object.assign({},t)}function $T(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue==="__max__"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Vt{constructor(e){this.value=e}static empty(){return new Vt({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let r=0;r<e.length-1;++r)if(n=(n.mapValue.fields||{})[e.get(r)],!mo(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=Ys(n)}setAll(e){let n=mt.emptyPath(),r={},s=[];e.forEach((a,l)=>{if(!n.isImmediateParentOf(l)){const c=this.getFieldsMap(n);this.applyChanges(c,r,s),r={},s=[],n=l.popLast()}a?r[l.lastSegment()]=Ys(a):s.push(l.lastSegment())});const i=this.getFieldsMap(n);this.applyChanges(i,r,s)}delete(e){const n=this.field(e.popLast());mo(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return dn(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let r=0;r<e.length;++r){let s=n.mapValue.fields[e.get(r)];mo(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},n.mapValue.fields[e.get(r)]=s),n=s}return n.mapValue.fields}applyChanges(e,n,r){Dr(n,(s,i)=>e[s]=i);for(const s of r)delete e[s]}clone(){return new Vt(Ys(this.value))}}function nm(t){const e=[];return Dr(t.fields,(n,r)=>{const s=new mt([n]);if(mo(r)){const i=nm(r.mapValue).fields;if(i.length===0)e.push(s);else for(const a of i)e.push(s.child(a))}else e.push(s)}),new Bt(e)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class No{constructor(e,n){this.position=e,this.inclusive=n}}function yd(t,e,n){let r=0;for(let s=0;s<t.position.length;s++){const i=e[s],a=t.position[s];if(i.field.isKeyField()?r=ae.comparator(ae.fromName(a.referenceValue),n.key):r=us(a,n.data.field(i.field)),i.dir==="desc"&&(r*=-1),r!==0)break}return r}function vd(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!dn(t.position[n],e.position[n]))return!1;return!0}/**
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
 */class gi{constructor(e,n="asc"){this.field=e,this.dir=n}}function qT(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}/**
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
 */class rm{}class st extends rm{constructor(e,n,r){super(),this.field=e,this.op=n,this.value=r}static create(e,n,r){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,r):new zT(e,n,r):n==="array-contains"?new GT(e,r):n==="in"?new QT(e,r):n==="not-in"?new JT(e,r):n==="array-contains-any"?new YT(e,r):new st(e,n,r)}static createKeyFieldInFilter(e,n,r){return n==="in"?new KT(e,r):new WT(e,r)}matches(e){const n=e.data.field(this.field);return this.op==="!="?n!==null&&this.matchesComparison(us(n,this.value)):n!==null&&Pr(this.value)===Pr(n)&&this.matchesComparison(us(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return he()}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class tn extends rm{constructor(e,n){super(),this.filters=e,this.op=n,this.ae=null}static create(e,n){return new tn(e,n)}matches(e){return sm(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.ae!==null||(this.ae=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.ae}getFilters(){return Object.assign([],this.filters)}}function sm(t){return t.op==="and"}function im(t){return HT(t)&&sm(t)}function HT(t){for(const e of t.filters)if(e instanceof tn)return!1;return!0}function $l(t){if(t instanceof st)return t.field.canonicalString()+t.op.toString()+hs(t.value);if(im(t))return t.filters.map(e=>$l(e)).join(",");{const e=t.filters.map(n=>$l(n)).join(",");return`${t.op}(${e})`}}function om(t,e){return t instanceof st?function(r,s){return s instanceof st&&r.op===s.op&&r.field.isEqual(s.field)&&dn(r.value,s.value)}(t,e):t instanceof tn?function(r,s){return s instanceof tn&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((i,a,l)=>i&&om(a,s.filters[l]),!0):!1}(t,e):void he()}function am(t){return t instanceof st?function(n){return`${n.field.canonicalString()} ${n.op} ${hs(n.value)}`}(t):t instanceof tn?function(n){return n.op.toString()+" {"+n.getFilters().map(am).join(" ,")+"}"}(t):"Filter"}class zT extends st{constructor(e,n,r){super(e,n,r),this.key=ae.fromName(r.referenceValue)}matches(e){const n=ae.comparator(e.key,this.key);return this.matchesComparison(n)}}class KT extends st{constructor(e,n){super(e,"in",n),this.keys=lm("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}}class WT extends st{constructor(e,n){super(e,"not-in",n),this.keys=lm("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}}function lm(t,e){var n;return(((n=e.arrayValue)===null||n===void 0?void 0:n.values)||[]).map(r=>ae.fromName(r.referenceValue))}class GT extends st{constructor(e,n){super(e,"array-contains",n)}matches(e){const n=e.data.field(this.field);return xc(n)&&mi(n.arrayValue,this.value)}}class QT extends st{constructor(e,n){super(e,"in",n)}matches(e){const n=e.data.field(this.field);return n!==null&&mi(this.value.arrayValue,n)}}class JT extends st{constructor(e,n){super(e,"not-in",n)}matches(e){if(mi(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const n=e.data.field(this.field);return n!==null&&!mi(this.value.arrayValue,n)}}class YT extends st{constructor(e,n){super(e,"array-contains-any",n)}matches(e){const n=e.data.field(this.field);return!(!xc(n)||!n.arrayValue.values)&&n.arrayValue.values.some(r=>mi(this.value.arrayValue,r))}}/**
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
 */class XT{constructor(e,n=null,r=[],s=[],i=null,a=null,l=null){this.path=e,this.collectionGroup=n,this.orderBy=r,this.filters=s,this.limit=i,this.startAt=a,this.endAt=l,this.ue=null}}function Ed(t,e=null,n=[],r=[],s=null,i=null,a=null){return new XT(t,e,n,r,s,i,a)}function Dc(t){const e=pe(t);if(e.ue===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(r=>$l(r)).join(","),n+="|ob:",n+=e.orderBy.map(r=>function(i){return i.field.canonicalString()+i.dir}(r)).join(","),aa(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(r=>hs(r)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(r=>hs(r)).join(",")),e.ue=n}return e.ue}function Vc(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!qT(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!om(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!vd(t.startAt,e.startAt)&&vd(t.endAt,e.endAt)}function ql(t){return ae.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _s{constructor(e,n=null,r=[],s=[],i=null,a="F",l=null,c=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=r,this.filters=s,this.limit=i,this.limitType=a,this.startAt=l,this.endAt=c,this.ce=null,this.le=null,this.he=null,this.startAt,this.endAt}}function ZT(t,e,n,r,s,i,a,l){return new _s(t,e,n,r,s,i,a,l)}function cm(t){return new _s(t)}function wd(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function um(t){return t.collectionGroup!==null}function Xs(t){const e=pe(t);if(e.ce===null){e.ce=[];const n=new Set;for(const i of e.explicitOrderBy)e.ce.push(i),n.add(i.field.canonicalString());const r=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(a){let l=new gt(mt.comparator);return a.filters.forEach(c=>{c.getFlattenedFilters().forEach(h=>{h.isInequality()&&(l=l.add(h.field))})}),l})(e).forEach(i=>{n.has(i.canonicalString())||i.isKeyField()||e.ce.push(new gi(i,r))}),n.has(mt.keyField().canonicalString())||e.ce.push(new gi(mt.keyField(),r))}return e.ce}function an(t){const e=pe(t);return e.le||(e.le=e0(e,Xs(t))),e.le}function e0(t,e){if(t.limitType==="F")return Ed(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(s=>{const i=s.dir==="desc"?"asc":"desc";return new gi(s.field,i)});const n=t.endAt?new No(t.endAt.position,t.endAt.inclusive):null,r=t.startAt?new No(t.startAt.position,t.startAt.inclusive):null;return Ed(t.path,t.collectionGroup,e,t.filters,t.limit,n,r)}}function Hl(t,e){const n=t.filters.concat([e]);return new _s(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function zl(t,e,n){return new _s(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function la(t,e){return Vc(an(t),an(e))&&t.limitType===e.limitType}function hm(t){return`${Dc(an(t))}|lt:${t.limitType}`}function Hr(t){return`Query(target=${function(n){let r=n.path.canonicalString();return n.collectionGroup!==null&&(r+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(r+=`, filters: [${n.filters.map(s=>am(s)).join(", ")}]`),aa(n.limit)||(r+=", limit: "+n.limit),n.orderBy.length>0&&(r+=`, orderBy: [${n.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),n.startAt&&(r+=", startAt: ",r+=n.startAt.inclusive?"b:":"a:",r+=n.startAt.position.map(s=>hs(s)).join(",")),n.endAt&&(r+=", endAt: ",r+=n.endAt.inclusive?"a:":"b:",r+=n.endAt.position.map(s=>hs(s)).join(",")),`Target(${r})`}(an(t))}; limitType=${t.limitType})`}function ca(t,e){return e.isFoundDocument()&&function(r,s){const i=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(i):ae.isDocumentKey(r.path)?r.path.isEqual(i):r.path.isImmediateParentOf(i)}(t,e)&&function(r,s){for(const i of Xs(r))if(!i.field.isKeyField()&&s.data.field(i.field)===null)return!1;return!0}(t,e)&&function(r,s){for(const i of r.filters)if(!i.matches(s))return!1;return!0}(t,e)&&function(r,s){return!(r.startAt&&!function(a,l,c){const h=yd(a,l,c);return a.inclusive?h<=0:h<0}(r.startAt,Xs(r),s)||r.endAt&&!function(a,l,c){const h=yd(a,l,c);return a.inclusive?h>=0:h>0}(r.endAt,Xs(r),s))}(t,e)}function t0(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function dm(t){return(e,n)=>{let r=!1;for(const s of Xs(t)){const i=n0(s,e,n);if(i!==0)return i;r=r||s.field.isKeyField()}return 0}}function n0(t,e,n){const r=t.field.isKeyField()?ae.comparator(e.key,n.key):function(i,a,l){const c=a.data.field(i),h=l.data.field(i);return c!==null&&h!==null?us(c,h):he()}(t.field,e,n);switch(t.dir){case"asc":return r;case"desc":return-1*r;default:return he()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ys{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r!==void 0){for(const[s,i]of r)if(this.equalsFn(s,e))return i}}has(e){return this.get(e)!==void 0}set(e,n){const r=this.mapKeyFn(e),s=this.inner[r];if(s===void 0)return this.inner[r]=[[e,n]],void this.innerSize++;for(let i=0;i<s.length;i++)if(this.equalsFn(s[i][0],e))return void(s[i]=[e,n]);s.push([e,n]),this.innerSize++}delete(e){const n=this.mapKeyFn(e),r=this.inner[n];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return r.length===1?delete this.inner[n]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(e){Dr(this.inner,(n,r)=>{for(const[s,i]of r)e(s,i)})}isEmpty(){return em(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const r0=new Xe(ae.comparator);function Pn(){return r0}const fm=new Xe(ae.comparator);function Bs(...t){let e=fm;for(const n of t)e=e.insert(n.key,n);return e}function pm(t){let e=fm;return t.forEach((n,r)=>e=e.insert(n,r.overlayedDocument)),e}function Tr(){return Zs()}function mm(){return Zs()}function Zs(){return new ys(t=>t.toString(),(t,e)=>t.isEqual(e))}const s0=new Xe(ae.comparator),i0=new gt(ae.comparator);function be(...t){let e=i0;for(const n of t)e=e.add(n);return e}const o0=new gt(Ve);function a0(){return o0}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Nc(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Vo(e)?"-0":e}}function gm(t){return{integerValue:""+t}}function l0(t,e){return FT(e)?gm(e):Nc(t,e)}/**
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
 */class ua{constructor(){this._=void 0}}function c0(t,e,n){return t instanceof _i?function(s,i){const a={fields:{__type__:{stringValue:"server_timestamp"},__local_write_time__:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return i&&Cc(i)&&(i=kc(i)),i&&(a.fields.__previous_value__=i),{mapValue:a}}(n,e):t instanceof yi?ym(t,e):t instanceof vi?vm(t,e):function(s,i){const a=_m(s,i),l=Td(a)+Td(s.Pe);return jl(a)&&jl(s.Pe)?gm(l):Nc(s.serializer,l)}(t,e)}function u0(t,e,n){return t instanceof yi?ym(t,e):t instanceof vi?vm(t,e):n}function _m(t,e){return t instanceof Oo?function(r){return jl(r)||function(i){return!!i&&"doubleValue"in i}(r)}(e)?e:{integerValue:0}:null}class _i extends ua{}class yi extends ua{constructor(e){super(),this.elements=e}}function ym(t,e){const n=Em(e);for(const r of t.elements)n.some(s=>dn(s,r))||n.push(r);return{arrayValue:{values:n}}}class vi extends ua{constructor(e){super(),this.elements=e}}function vm(t,e){let n=Em(e);for(const r of t.elements)n=n.filter(s=>!dn(s,r));return{arrayValue:{values:n}}}class Oo extends ua{constructor(e,n){super(),this.serializer=e,this.Pe=n}}function Td(t){return et(t.integerValue||t.doubleValue)}function Em(t){return xc(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class h0{constructor(e,n){this.field=e,this.transform=n}}function d0(t,e){return t.field.isEqual(e.field)&&function(r,s){return r instanceof yi&&s instanceof yi||r instanceof vi&&s instanceof vi?cs(r.elements,s.elements,dn):r instanceof Oo&&s instanceof Oo?dn(r.Pe,s.Pe):r instanceof _i&&s instanceof _i}(t.transform,e.transform)}class f0{constructor(e,n){this.version=e,this.transformResults=n}}class Nt{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new Nt}static exists(e){return new Nt(void 0,e)}static updateTime(e){return new Nt(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}}function go(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}class ha{}function wm(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new da(t.key,Nt.none()):new Si(t.key,t.data,Nt.none());{const n=t.data,r=Vt.empty();let s=new gt(mt.comparator);for(let i of e.fields)if(!s.has(i)){let a=n.field(i);a===null&&i.length>1&&(i=i.popLast(),a=n.field(i)),a===null?r.delete(i):r.set(i,a),s=s.add(i)}return new hr(t.key,r,new Bt(s.toArray()),Nt.none())}}function p0(t,e,n){t instanceof Si?function(s,i,a){const l=s.value.clone(),c=bd(s.fieldTransforms,i,a.transformResults);l.setAll(c),i.convertToFoundDocument(a.version,l).setHasCommittedMutations()}(t,e,n):t instanceof hr?function(s,i,a){if(!go(s.precondition,i))return void i.convertToUnknownDocument(a.version);const l=bd(s.fieldTransforms,i,a.transformResults),c=i.data;c.setAll(Tm(s)),c.setAll(l),i.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(t,e,n):function(s,i,a){i.convertToNoDocument(a.version).setHasCommittedMutations()}(0,e,n)}function ei(t,e,n,r){return t instanceof Si?function(i,a,l,c){if(!go(i.precondition,a))return l;const h=i.value.clone(),d=Ad(i.fieldTransforms,c,a);return h.setAll(d),a.convertToFoundDocument(a.version,h).setHasLocalMutations(),null}(t,e,n,r):t instanceof hr?function(i,a,l,c){if(!go(i.precondition,a))return l;const h=Ad(i.fieldTransforms,c,a),d=a.data;return d.setAll(Tm(i)),d.setAll(h),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),l===null?null:l.unionWith(i.fieldMask.fields).unionWith(i.fieldTransforms.map(p=>p.field))}(t,e,n,r):function(i,a,l){return go(i.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):l}(t,e,n)}function m0(t,e){let n=null;for(const r of t.fieldTransforms){const s=e.data.field(r.field),i=_m(r.transform,s||null);i!=null&&(n===null&&(n=Vt.empty()),n.set(r.field,i))}return n||null}function Id(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&cs(r,s,(i,a)=>d0(i,a))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}class Si extends ha{constructor(e,n,r,s=[]){super(),this.key=e,this.value=n,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class hr extends ha{constructor(e,n,r,s,i=[]){super(),this.key=e,this.data=n,this.fieldMask=r,this.precondition=s,this.fieldTransforms=i,this.type=1}getFieldMask(){return this.fieldMask}}function Tm(t){const e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){const r=t.data.field(n);e.set(n,r)}}),e}function bd(t,e,n){const r=new Map;Be(t.length===n.length);for(let s=0;s<n.length;s++){const i=t[s],a=i.transform,l=e.data.field(i.field);r.set(i.field,u0(a,l,n[s]))}return r}function Ad(t,e,n){const r=new Map;for(const s of t){const i=s.transform,a=n.data.field(s.field);r.set(s.field,c0(i,a,e))}return r}class da extends ha{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class g0 extends ha{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _0{constructor(e,n,r,s){this.batchId=e,this.localWriteTime=n,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(e,n){const r=n.mutationResults;for(let s=0;s<this.mutations.length;s++){const i=this.mutations[s];i.key.isEqual(e.key)&&p0(i,e,r[s])}}applyToLocalView(e,n){for(const r of this.baseMutations)r.key.isEqual(e.key)&&(n=ei(r,e,n,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(e.key)&&(n=ei(r,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){const r=mm();return this.mutations.forEach(s=>{const i=e.get(s.key),a=i.overlayedDocument;let l=this.applyToLocalView(a,i.mutatedFields);l=n.has(s.key)?null:l;const c=wm(a,l);c!==null&&r.set(s.key,c),a.isValidDocument()||a.convertToNoDocument(fe.min())}),r}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),be())}isEqual(e){return this.batchId===e.batchId&&cs(this.mutations,e.mutations,(n,r)=>Id(n,r))&&cs(this.baseMutations,e.baseMutations,(n,r)=>Id(n,r))}}class Oc{constructor(e,n,r,s){this.batch=e,this.commitVersion=n,this.mutationResults=r,this.docVersions=s}static from(e,n,r){Be(e.mutations.length===r.length);let s=function(){return s0}();const i=e.mutations;for(let a=0;a<i.length;a++)s=s.insert(i[a].key,r[a].version);return new Oc(e,n,r,s)}}/**
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
 */class y0{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
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
 */class v0{constructor(e,n){this.count=e,this.unchangedNames=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var rt,Ce;function E0(t){switch(t){default:return he();case F.CANCELLED:case F.UNKNOWN:case F.DEADLINE_EXCEEDED:case F.RESOURCE_EXHAUSTED:case F.INTERNAL:case F.UNAVAILABLE:case F.UNAUTHENTICATED:return!1;case F.INVALID_ARGUMENT:case F.NOT_FOUND:case F.ALREADY_EXISTS:case F.PERMISSION_DENIED:case F.FAILED_PRECONDITION:case F.ABORTED:case F.OUT_OF_RANGE:case F.UNIMPLEMENTED:case F.DATA_LOSS:return!0}}function Im(t){if(t===void 0)return Sn("GRPC error has no .code"),F.UNKNOWN;switch(t){case rt.OK:return F.OK;case rt.CANCELLED:return F.CANCELLED;case rt.UNKNOWN:return F.UNKNOWN;case rt.DEADLINE_EXCEEDED:return F.DEADLINE_EXCEEDED;case rt.RESOURCE_EXHAUSTED:return F.RESOURCE_EXHAUSTED;case rt.INTERNAL:return F.INTERNAL;case rt.UNAVAILABLE:return F.UNAVAILABLE;case rt.UNAUTHENTICATED:return F.UNAUTHENTICATED;case rt.INVALID_ARGUMENT:return F.INVALID_ARGUMENT;case rt.NOT_FOUND:return F.NOT_FOUND;case rt.ALREADY_EXISTS:return F.ALREADY_EXISTS;case rt.PERMISSION_DENIED:return F.PERMISSION_DENIED;case rt.FAILED_PRECONDITION:return F.FAILED_PRECONDITION;case rt.ABORTED:return F.ABORTED;case rt.OUT_OF_RANGE:return F.OUT_OF_RANGE;case rt.UNIMPLEMENTED:return F.UNIMPLEMENTED;case rt.DATA_LOSS:return F.DATA_LOSS;default:return he()}}(Ce=rt||(rt={}))[Ce.OK=0]="OK",Ce[Ce.CANCELLED=1]="CANCELLED",Ce[Ce.UNKNOWN=2]="UNKNOWN",Ce[Ce.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Ce[Ce.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Ce[Ce.NOT_FOUND=5]="NOT_FOUND",Ce[Ce.ALREADY_EXISTS=6]="ALREADY_EXISTS",Ce[Ce.PERMISSION_DENIED=7]="PERMISSION_DENIED",Ce[Ce.UNAUTHENTICATED=16]="UNAUTHENTICATED",Ce[Ce.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Ce[Ce.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Ce[Ce.ABORTED=10]="ABORTED",Ce[Ce.OUT_OF_RANGE=11]="OUT_OF_RANGE",Ce[Ce.UNIMPLEMENTED=12]="UNIMPLEMENTED",Ce[Ce.INTERNAL=13]="INTERNAL",Ce[Ce.UNAVAILABLE=14]="UNAVAILABLE",Ce[Ce.DATA_LOSS=15]="DATA_LOSS";/**
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
 */function w0(){return new TextEncoder}/**
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
 */const T0=new br([4294967295,4294967295],0);function Rd(t){const e=w0().encode(t),n=new Kp;return n.update(e),new Uint8Array(n.digest())}function Sd(t){const e=new DataView(t.buffer),n=e.getUint32(0,!0),r=e.getUint32(4,!0),s=e.getUint32(8,!0),i=e.getUint32(12,!0);return[new br([n,r],0),new br([s,i],0)]}class Mc{constructor(e,n,r){if(this.bitmap=e,this.padding=n,this.hashCount=r,n<0||n>=8)throw new js(`Invalid padding: ${n}`);if(r<0)throw new js(`Invalid hash count: ${r}`);if(e.length>0&&this.hashCount===0)throw new js(`Invalid hash count: ${r}`);if(e.length===0&&n!==0)throw new js(`Invalid padding when bitmap length is 0: ${n}`);this.Ie=8*e.length-n,this.Te=br.fromNumber(this.Ie)}Ee(e,n,r){let s=e.add(n.multiply(br.fromNumber(r)));return s.compare(T0)===1&&(s=new br([s.getBits(0),s.getBits(1)],0)),s.modulo(this.Te).toNumber()}de(e){return(this.bitmap[Math.floor(e/8)]&1<<e%8)!=0}mightContain(e){if(this.Ie===0)return!1;const n=Rd(e),[r,s]=Sd(n);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);if(!this.de(a))return!1}return!0}static create(e,n,r){const s=e%8==0?0:8-e%8,i=new Uint8Array(Math.ceil(e/8)),a=new Mc(i,s,n);return r.forEach(l=>a.insert(l)),a}insert(e){if(this.Ie===0)return;const n=Rd(e),[r,s]=Sd(n);for(let i=0;i<this.hashCount;i++){const a=this.Ee(r,s,i);this.Ae(a)}}Ae(e){const n=Math.floor(e/8),r=e%8;this.bitmap[n]|=1<<r}}class js extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class fa{constructor(e,n,r,s,i){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=i}static createSynthesizedRemoteEventForCurrentChange(e,n,r){const s=new Map;return s.set(e,Pi.createSynthesizedTargetChangeForCurrentChange(e,n,r)),new fa(fe.min(),s,new Xe(Ve),Pn(),be())}}class Pi{constructor(e,n,r,s,i){this.resumeToken=e,this.current=n,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=i}static createSynthesizedTargetChangeForCurrentChange(e,n,r){return new Pi(r,n,be(),be(),be())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class _o{constructor(e,n,r,s){this.Re=e,this.removedTargetIds=n,this.key=r,this.Ve=s}}class bm{constructor(e,n){this.targetId=e,this.me=n}}class Am{constructor(e,n,r=_t.EMPTY_BYTE_STRING,s=null){this.state=e,this.targetIds=n,this.resumeToken=r,this.cause=s}}class Pd{constructor(){this.fe=0,this.ge=kd(),this.pe=_t.EMPTY_BYTE_STRING,this.ye=!1,this.we=!0}get current(){return this.ye}get resumeToken(){return this.pe}get Se(){return this.fe!==0}get be(){return this.we}De(e){e.approximateByteSize()>0&&(this.we=!0,this.pe=e)}ve(){let e=be(),n=be(),r=be();return this.ge.forEach((s,i)=>{switch(i){case 0:e=e.add(s);break;case 2:n=n.add(s);break;case 1:r=r.add(s);break;default:he()}}),new Pi(this.pe,this.ye,e,n,r)}Ce(){this.we=!1,this.ge=kd()}Fe(e,n){this.we=!0,this.ge=this.ge.insert(e,n)}Me(e){this.we=!0,this.ge=this.ge.remove(e)}xe(){this.fe+=1}Oe(){this.fe-=1,Be(this.fe>=0)}Ne(){this.we=!0,this.ye=!0}}class I0{constructor(e){this.Le=e,this.Be=new Map,this.ke=Pn(),this.qe=Cd(),this.Qe=new Xe(Ve)}Ke(e){for(const n of e.Re)e.Ve&&e.Ve.isFoundDocument()?this.$e(n,e.Ve):this.Ue(n,e.key,e.Ve);for(const n of e.removedTargetIds)this.Ue(n,e.key,e.Ve)}We(e){this.forEachTarget(e,n=>{const r=this.Ge(n);switch(e.state){case 0:this.ze(n)&&r.De(e.resumeToken);break;case 1:r.Oe(),r.Se||r.Ce(),r.De(e.resumeToken);break;case 2:r.Oe(),r.Se||this.removeTarget(n);break;case 3:this.ze(n)&&(r.Ne(),r.De(e.resumeToken));break;case 4:this.ze(n)&&(this.je(n),r.De(e.resumeToken));break;default:he()}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.Be.forEach((r,s)=>{this.ze(s)&&n(s)})}He(e){const n=e.targetId,r=e.me.count,s=this.Je(n);if(s){const i=s.target;if(ql(i))if(r===0){const a=new ae(i.path);this.Ue(n,a,It.newNoDocument(a,fe.min()))}else Be(r===1);else{const a=this.Ye(n);if(a!==r){const l=this.Ze(e),c=l?this.Xe(l,e,a):1;if(c!==0){this.je(n);const h=c===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Qe=this.Qe.insert(n,h)}}}}}Ze(e){const n=e.me.unchangedNames;if(!n||!n.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:i=0}=n;let a,l;try{a=Sr(r).toUint8Array()}catch(c){if(c instanceof tm)return ls("Decoding the base64 bloom filter in existence filter failed ("+c.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw c}try{l=new Mc(a,s,i)}catch(c){return ls(c instanceof js?"BloomFilter error: ":"Applying bloom filter failed: ",c),null}return l.Ie===0?null:l}Xe(e,n,r){return n.me.count===r-this.nt(e,n.targetId)?0:2}nt(e,n){const r=this.Le.getRemoteKeysForTarget(n);let s=0;return r.forEach(i=>{const a=this.Le.tt(),l=`projects/${a.projectId}/databases/${a.database}/documents/${i.path.canonicalString()}`;e.mightContain(l)||(this.Ue(n,i,null),s++)}),s}rt(e){const n=new Map;this.Be.forEach((i,a)=>{const l=this.Je(a);if(l){if(i.current&&ql(l.target)){const c=new ae(l.target.path);this.ke.get(c)!==null||this.it(a,c)||this.Ue(a,c,It.newNoDocument(c,e))}i.be&&(n.set(a,i.ve()),i.Ce())}});let r=be();this.qe.forEach((i,a)=>{let l=!0;a.forEachWhile(c=>{const h=this.Je(c);return!h||h.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(r=r.add(i))}),this.ke.forEach((i,a)=>a.setReadTime(e));const s=new fa(e,n,this.Qe,this.ke,r);return this.ke=Pn(),this.qe=Cd(),this.Qe=new Xe(Ve),s}$e(e,n){if(!this.ze(e))return;const r=this.it(e,n.key)?2:0;this.Ge(e).Fe(n.key,r),this.ke=this.ke.insert(n.key,n),this.qe=this.qe.insert(n.key,this.st(n.key).add(e))}Ue(e,n,r){if(!this.ze(e))return;const s=this.Ge(e);this.it(e,n)?s.Fe(n,1):s.Me(n),this.qe=this.qe.insert(n,this.st(n).delete(e)),r&&(this.ke=this.ke.insert(n,r))}removeTarget(e){this.Be.delete(e)}Ye(e){const n=this.Ge(e).ve();return this.Le.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}xe(e){this.Ge(e).xe()}Ge(e){let n=this.Be.get(e);return n||(n=new Pd,this.Be.set(e,n)),n}st(e){let n=this.qe.get(e);return n||(n=new gt(Ve),this.qe=this.qe.insert(e,n)),n}ze(e){const n=this.Je(e)!==null;return n||se("WatchChangeAggregator","Detected inactive target",e),n}Je(e){const n=this.Be.get(e);return n&&n.Se?null:this.Le.ot(e)}je(e){this.Be.set(e,new Pd),this.Le.getRemoteKeysForTarget(e).forEach(n=>{this.Ue(e,n,null)})}it(e,n){return this.Le.getRemoteKeysForTarget(e).has(n)}}function Cd(){return new Xe(ae.comparator)}function kd(){return new Xe(ae.comparator)}const b0=(()=>({asc:"ASCENDING",desc:"DESCENDING"}))(),A0=(()=>({"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"}))(),R0=(()=>({and:"AND",or:"OR"}))();class S0{constructor(e,n){this.databaseId=e,this.useProto3Json=n}}function Kl(t,e){return t.useProto3Json||aa(e)?e:{value:e}}function Mo(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function Rm(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function P0(t,e){return Mo(t,e.toTimestamp())}function ln(t){return Be(!!t),fe.fromTimestamp(function(n){const r=ir(n);return new at(r.seconds,r.nanos)}(t))}function Lc(t,e){return Wl(t,e).canonicalString()}function Wl(t,e){const n=function(s){return new Ge(["projects",s.projectId,"databases",s.database])}(t).child("documents");return e===void 0?n:n.child(e)}function Sm(t){const e=Ge.fromString(t);return Be(Dm(e)),e}function Gl(t,e){return Lc(t.databaseId,e.path)}function hl(t,e){const n=Sm(e);if(n.get(1)!==t.databaseId.projectId)throw new re(F.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new re(F.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new ae(Cm(n))}function Pm(t,e){return Lc(t.databaseId,e)}function C0(t){const e=Sm(t);return e.length===4?Ge.emptyPath():Cm(e)}function Ql(t){return new Ge(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function Cm(t){return Be(t.length>4&&t.get(4)==="documents"),t.popFirst(5)}function xd(t,e,n){return{name:Gl(t,e),fields:n.value.mapValue.fields}}function k0(t,e){let n;if("targetChange"in e){e.targetChange;const r=function(h){return h==="NO_CHANGE"?0:h==="ADD"?1:h==="REMOVE"?2:h==="CURRENT"?3:h==="RESET"?4:he()}(e.targetChange.targetChangeType||"NO_CHANGE"),s=e.targetChange.targetIds||[],i=function(h,d){return h.useProto3Json?(Be(d===void 0||typeof d=="string"),_t.fromBase64String(d||"")):(Be(d===void 0||d instanceof Buffer||d instanceof Uint8Array),_t.fromUint8Array(d||new Uint8Array))}(t,e.targetChange.resumeToken),a=e.targetChange.cause,l=a&&function(h){const d=h.code===void 0?F.UNKNOWN:Im(h.code);return new re(d,h.message||"")}(a);n=new Am(r,s,i,l||null)}else if("documentChange"in e){e.documentChange;const r=e.documentChange;r.document,r.document.name,r.document.updateTime;const s=hl(t,r.document.name),i=ln(r.document.updateTime),a=r.document.createTime?ln(r.document.createTime):fe.min(),l=new Vt({mapValue:{fields:r.document.fields}}),c=It.newFoundDocument(s,i,a,l),h=r.targetIds||[],d=r.removedTargetIds||[];n=new _o(h,d,c.key,c)}else if("documentDelete"in e){e.documentDelete;const r=e.documentDelete;r.document;const s=hl(t,r.document),i=r.readTime?ln(r.readTime):fe.min(),a=It.newNoDocument(s,i),l=r.removedTargetIds||[];n=new _o([],l,a.key,a)}else if("documentRemove"in e){e.documentRemove;const r=e.documentRemove;r.document;const s=hl(t,r.document),i=r.removedTargetIds||[];n=new _o([],i,s,null)}else{if(!("filter"in e))return he();{e.filter;const r=e.filter;r.targetId;const{count:s=0,unchangedNames:i}=r,a=new v0(s,i),l=r.targetId;n=new bm(l,a)}}return n}function x0(t,e){let n;if(e instanceof Si)n={update:xd(t,e.key,e.value)};else if(e instanceof da)n={delete:Gl(t,e.key)};else if(e instanceof hr)n={update:xd(t,e.key,e.data),updateMask:B0(e.fieldMask)};else{if(!(e instanceof g0))return he();n={verify:Gl(t,e.key)}}return e.fieldTransforms.length>0&&(n.updateTransforms=e.fieldTransforms.map(r=>function(i,a){const l=a.transform;if(l instanceof _i)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(l instanceof yi)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:l.elements}};if(l instanceof vi)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:l.elements}};if(l instanceof Oo)return{fieldPath:a.field.canonicalString(),increment:l.Pe};throw he()}(0,r))),e.precondition.isNone||(n.currentDocument=function(s,i){return i.updateTime!==void 0?{updateTime:P0(s,i.updateTime)}:i.exists!==void 0?{exists:i.exists}:he()}(t,e.precondition)),n}function D0(t,e){return t&&t.length>0?(Be(e!==void 0),t.map(n=>function(s,i){let a=s.updateTime?ln(s.updateTime):ln(i);return a.isEqual(fe.min())&&(a=ln(i)),new f0(a,s.transformResults||[])}(n,e))):[]}function V0(t,e){return{documents:[Pm(t,e.path)]}}function N0(t,e){const n={structuredQuery:{}},r=e.path;let s;e.collectionGroup!==null?(s=r,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(s=r.popLast(),n.structuredQuery.from=[{collectionId:r.lastSegment()}]),n.parent=Pm(t,s);const i=function(h){if(h.length!==0)return xm(tn.create(h,"and"))}(e.filters);i&&(n.structuredQuery.where=i);const a=function(h){if(h.length!==0)return h.map(d=>function(g){return{field:zr(g.field),direction:L0(g.dir)}}(d))}(e.orderBy);a&&(n.structuredQuery.orderBy=a);const l=Kl(t,e.limit);return l!==null&&(n.structuredQuery.limit=l),e.startAt&&(n.structuredQuery.startAt=function(h){return{before:h.inclusive,values:h.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(h){return{before:!h.inclusive,values:h.position}}(e.endAt)),{_t:n,parent:s}}function O0(t){let e=C0(t.parent);const n=t.structuredQuery,r=n.from?n.from.length:0;let s=null;if(r>0){Be(r===1);const d=n.from[0];d.allDescendants?s=d.collectionId:e=e.child(d.collectionId)}let i=[];n.where&&(i=function(p){const g=km(p);return g instanceof tn&&im(g)?g.getFilters():[g]}(n.where));let a=[];n.orderBy&&(a=function(p){return p.map(g=>function(x){return new gi(Kr(x.field),function(O){switch(O){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(x.direction))}(g))}(n.orderBy));let l=null;n.limit&&(l=function(p){let g;return g=typeof p=="object"?p.value:p,aa(g)?null:g}(n.limit));let c=null;n.startAt&&(c=function(p){const g=!!p.before,y=p.values||[];return new No(y,g)}(n.startAt));let h=null;return n.endAt&&(h=function(p){const g=!p.before,y=p.values||[];return new No(y,g)}(n.endAt)),ZT(e,s,a,i,l,"F",c,h)}function M0(t,e){const n=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return he()}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function km(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":const r=Kr(n.unaryFilter.field);return st.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Kr(n.unaryFilter.field);return st.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const i=Kr(n.unaryFilter.field);return st.create(i,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Kr(n.unaryFilter.field);return st.create(a,"!=",{nullValue:"NULL_VALUE"});default:return he()}}(t):t.fieldFilter!==void 0?function(n){return st.create(Kr(n.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";default:return he()}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return tn.create(n.compositeFilter.filters.map(r=>km(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return he()}}(n.compositeFilter.op))}(t):he()}function L0(t){return b0[t]}function F0(t){return A0[t]}function U0(t){return R0[t]}function zr(t){return{fieldPath:t.canonicalString()}}function Kr(t){return mt.fromServerFormat(t.fieldPath)}function xm(t){return t instanceof st?function(n){if(n.op==="=="){if(_d(n.value))return{unaryFilter:{field:zr(n.field),op:"IS_NAN"}};if(gd(n.value))return{unaryFilter:{field:zr(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(_d(n.value))return{unaryFilter:{field:zr(n.field),op:"IS_NOT_NAN"}};if(gd(n.value))return{unaryFilter:{field:zr(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:zr(n.field),op:F0(n.op),value:n.value}}}(t):t instanceof tn?function(n){const r=n.getFilters().map(s=>xm(s));return r.length===1?r[0]:{compositeFilter:{op:U0(n.op),filters:r}}}(t):he()}function B0(t){const e=[];return t.fields.forEach(n=>e.push(n.canonicalString())),{fieldPaths:e}}function Dm(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class j0{constructor(e){this.ct=e}}function $0(t){const e=O0({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?zl(e,e.limit,"L"):e}/**
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
 */class q0{constructor(){this.un=new H0}addToCollectionParentIndex(e,n){return this.un.add(n),H.resolve()}getCollectionParents(e,n){return H.resolve(this.un.getEntries(n))}addFieldIndex(e,n){return H.resolve()}deleteFieldIndex(e,n){return H.resolve()}deleteAllFieldIndexes(e){return H.resolve()}createTargetIndexes(e,n){return H.resolve()}getDocumentsMatchingTarget(e,n){return H.resolve(null)}getIndexType(e,n){return H.resolve(0)}getFieldIndexes(e,n){return H.resolve([])}getNextCollectionGroupToUpdate(e){return H.resolve(null)}getMinOffset(e,n){return H.resolve(sr.min())}getMinOffsetFromCollectionGroup(e,n){return H.resolve(sr.min())}updateCollectionGroup(e,n,r){return H.resolve()}updateIndexEntries(e,n){return H.resolve()}}class H0{constructor(){this.index={}}add(e){const n=e.lastSegment(),r=e.popLast(),s=this.index[n]||new gt(Ge.comparator),i=!s.has(r);return this.index[n]=s.add(r),i}has(e){const n=e.lastSegment(),r=e.popLast(),s=this.index[n];return s&&s.has(r)}getEntries(e){return(this.index[e]||new gt(Ge.comparator)).toArray()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class z0{constructor(){this.changes=new ys(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,It.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();const r=this.changes.get(n);return r!==void 0?H.resolve(r):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class K0{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class W0{constructor(e,n,r,s){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=r,this.indexManager=s}getDocument(e,n){let r=null;return this.documentOverlayCache.getOverlay(e,n).next(s=>(r=s,this.remoteDocumentCache.getEntry(e,n))).next(s=>(r!==null&&ei(r.mutation,s,Bt.empty(),at.now()),s))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.getLocalViewOfDocuments(e,r,be()).next(()=>r))}getLocalViewOfDocuments(e,n,r=be()){const s=Tr();return this.populateOverlays(e,s,n).next(()=>this.computeViews(e,n,s,r).next(i=>{let a=Bs();return i.forEach((l,c)=>{a=a.insert(l,c.overlayedDocument)}),a}))}getOverlayedDocuments(e,n){const r=Tr();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,be()))}populateOverlays(e,n,r){const s=[];return r.forEach(i=>{n.has(i)||s.push(i)}),this.documentOverlayCache.getOverlays(e,s).next(i=>{i.forEach((a,l)=>{n.set(a,l)})})}computeViews(e,n,r,s){let i=Pn();const a=Zs(),l=function(){return Zs()}();return n.forEach((c,h)=>{const d=r.get(h.key);s.has(h.key)&&(d===void 0||d.mutation instanceof hr)?i=i.insert(h.key,h):d!==void 0?(a.set(h.key,d.mutation.getFieldMask()),ei(d.mutation,h,d.mutation.getFieldMask(),at.now())):a.set(h.key,Bt.empty())}),this.recalculateAndSaveOverlays(e,i).next(c=>(c.forEach((h,d)=>a.set(h,d)),n.forEach((h,d)=>{var p;return l.set(h,new K0(d,(p=a.get(h))!==null&&p!==void 0?p:null))}),l))}recalculateAndSaveOverlays(e,n){const r=Zs();let s=new Xe((a,l)=>a-l),i=be();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(a=>{for(const l of a)l.keys().forEach(c=>{const h=n.get(c);if(h===null)return;let d=r.get(c)||Bt.empty();d=l.applyToLocalView(h,d),r.set(c,d);const p=(s.get(l.batchId)||be()).add(c);s=s.insert(l.batchId,p)})}).next(()=>{const a=[],l=s.getReverseIterator();for(;l.hasNext();){const c=l.getNext(),h=c.key,d=c.value,p=mm();d.forEach(g=>{if(!i.has(g)){const y=wm(n.get(g),r.get(g));y!==null&&p.set(g,y),i=i.add(g)}}),a.push(this.documentOverlayCache.saveOverlays(e,h,p))}return H.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(r=>this.recalculateAndSaveOverlays(e,r))}getDocumentsMatchingQuery(e,n,r,s){return function(a){return ae.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):um(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,r,s):this.getDocumentsMatchingCollectionQuery(e,n,r,s)}getNextDocuments(e,n,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,r,s).next(i=>{const a=s-i.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,r.largestBatchId,s-i.size):H.resolve(Tr());let l=-1,c=i;return a.next(h=>H.forEach(h,(d,p)=>(l<p.largestBatchId&&(l=p.largestBatchId),i.get(d)?H.resolve():this.remoteDocumentCache.getEntry(e,d).next(g=>{c=c.insert(d,g)}))).next(()=>this.populateOverlays(e,h,i)).next(()=>this.computeViews(e,c,h,be())).next(d=>({batchId:l,changes:pm(d)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new ae(n)).next(r=>{let s=Bs();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(e,n,r,s){const i=n.collectionGroup;let a=Bs();return this.indexManager.getCollectionParents(e,i).next(l=>H.forEach(l,c=>{const h=function(p,g){return new _s(g,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(n,c.child(i));return this.getDocumentsMatchingCollectionQuery(e,h,r,s).next(d=>{d.forEach((p,g)=>{a=a.insert(p,g)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(e,n,r,s){let i;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,r.largestBatchId).next(a=>(i=a,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,r,i,s))).next(a=>{i.forEach((c,h)=>{const d=h.getKey();a.get(d)===null&&(a=a.insert(d,It.newInvalidDocument(d)))});let l=Bs();return a.forEach((c,h)=>{const d=i.get(c);d!==void 0&&ei(d.mutation,h,Bt.empty(),at.now()),ca(n,h)&&(l=l.insert(c,h))}),l})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class G0{constructor(e){this.serializer=e,this.hr=new Map,this.Pr=new Map}getBundleMetadata(e,n){return H.resolve(this.hr.get(n))}saveBundleMetadata(e,n){return this.hr.set(n.id,function(s){return{id:s.id,version:s.version,createTime:ln(s.createTime)}}(n)),H.resolve()}getNamedQuery(e,n){return H.resolve(this.Pr.get(n))}saveNamedQuery(e,n){return this.Pr.set(n.name,function(s){return{name:s.name,query:$0(s.bundledQuery),readTime:ln(s.readTime)}}(n)),H.resolve()}}/**
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
 */class Q0{constructor(){this.overlays=new Xe(ae.comparator),this.Ir=new Map}getOverlay(e,n){return H.resolve(this.overlays.get(n))}getOverlays(e,n){const r=Tr();return H.forEach(n,s=>this.getOverlay(e,s).next(i=>{i!==null&&r.set(s,i)})).next(()=>r)}saveOverlays(e,n,r){return r.forEach((s,i)=>{this.ht(e,n,i)}),H.resolve()}removeOverlaysForBatchId(e,n,r){const s=this.Ir.get(r);return s!==void 0&&(s.forEach(i=>this.overlays=this.overlays.remove(i)),this.Ir.delete(r)),H.resolve()}getOverlaysForCollection(e,n,r){const s=Tr(),i=n.length+1,a=new ae(n.child("")),l=this.overlays.getIteratorFrom(a);for(;l.hasNext();){const c=l.getNext().value,h=c.getKey();if(!n.isPrefixOf(h.path))break;h.path.length===i&&c.largestBatchId>r&&s.set(c.getKey(),c)}return H.resolve(s)}getOverlaysForCollectionGroup(e,n,r,s){let i=new Xe((h,d)=>h-d);const a=this.overlays.getIterator();for(;a.hasNext();){const h=a.getNext().value;if(h.getKey().getCollectionGroup()===n&&h.largestBatchId>r){let d=i.get(h.largestBatchId);d===null&&(d=Tr(),i=i.insert(h.largestBatchId,d)),d.set(h.getKey(),h)}}const l=Tr(),c=i.getIterator();for(;c.hasNext()&&(c.getNext().value.forEach((h,d)=>l.set(h,d)),!(l.size()>=s)););return H.resolve(l)}ht(e,n,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.Ir.get(s.largestBatchId).delete(r.key);this.Ir.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new y0(n,r));let i=this.Ir.get(n);i===void 0&&(i=be(),this.Ir.set(n,i)),this.Ir.set(n,i.add(r.key))}}/**
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
 */class J0{constructor(){this.sessionToken=_t.EMPTY_BYTE_STRING}getSessionToken(e){return H.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,H.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Fc{constructor(){this.Tr=new gt(lt.Er),this.dr=new gt(lt.Ar)}isEmpty(){return this.Tr.isEmpty()}addReference(e,n){const r=new lt(e,n);this.Tr=this.Tr.add(r),this.dr=this.dr.add(r)}Rr(e,n){e.forEach(r=>this.addReference(r,n))}removeReference(e,n){this.Vr(new lt(e,n))}mr(e,n){e.forEach(r=>this.removeReference(r,n))}gr(e){const n=new ae(new Ge([])),r=new lt(n,e),s=new lt(n,e+1),i=[];return this.dr.forEachInRange([r,s],a=>{this.Vr(a),i.push(a.key)}),i}pr(){this.Tr.forEach(e=>this.Vr(e))}Vr(e){this.Tr=this.Tr.delete(e),this.dr=this.dr.delete(e)}yr(e){const n=new ae(new Ge([])),r=new lt(n,e),s=new lt(n,e+1);let i=be();return this.dr.forEachInRange([r,s],a=>{i=i.add(a.key)}),i}containsKey(e){const n=new lt(e,0),r=this.Tr.firstAfterOrEqual(n);return r!==null&&e.isEqual(r.key)}}class lt{constructor(e,n){this.key=e,this.wr=n}static Er(e,n){return ae.comparator(e.key,n.key)||Ve(e.wr,n.wr)}static Ar(e,n){return Ve(e.wr,n.wr)||ae.comparator(e.key,n.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Y0{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Sr=1,this.br=new gt(lt.Er)}checkEmpty(e){return H.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,r,s){const i=this.Sr;this.Sr++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new _0(i,n,r,s);this.mutationQueue.push(a);for(const l of s)this.br=this.br.add(new lt(l.key,i)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return H.resolve(a)}lookupMutationBatch(e,n){return H.resolve(this.Dr(n))}getNextMutationBatchAfterBatchId(e,n){const r=n+1,s=this.vr(r),i=s<0?0:s;return H.resolve(this.mutationQueue.length>i?this.mutationQueue[i]:null)}getHighestUnacknowledgedBatchId(){return H.resolve(this.mutationQueue.length===0?-1:this.Sr-1)}getAllMutationBatches(e){return H.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){const r=new lt(n,0),s=new lt(n,Number.POSITIVE_INFINITY),i=[];return this.br.forEachInRange([r,s],a=>{const l=this.Dr(a.wr);i.push(l)}),H.resolve(i)}getAllMutationBatchesAffectingDocumentKeys(e,n){let r=new gt(Ve);return n.forEach(s=>{const i=new lt(s,0),a=new lt(s,Number.POSITIVE_INFINITY);this.br.forEachInRange([i,a],l=>{r=r.add(l.wr)})}),H.resolve(this.Cr(r))}getAllMutationBatchesAffectingQuery(e,n){const r=n.path,s=r.length+1;let i=r;ae.isDocumentKey(i)||(i=i.child(""));const a=new lt(new ae(i),0);let l=new gt(Ve);return this.br.forEachWhile(c=>{const h=c.key.path;return!!r.isPrefixOf(h)&&(h.length===s&&(l=l.add(c.wr)),!0)},a),H.resolve(this.Cr(l))}Cr(e){const n=[];return e.forEach(r=>{const s=this.Dr(r);s!==null&&n.push(s)}),n}removeMutationBatch(e,n){Be(this.Fr(n.batchId,"removed")===0),this.mutationQueue.shift();let r=this.br;return H.forEach(n.mutations,s=>{const i=new lt(s.key,n.batchId);return r=r.delete(i),this.referenceDelegate.markPotentiallyOrphaned(e,s.key)}).next(()=>{this.br=r})}On(e){}containsKey(e,n){const r=new lt(n,0),s=this.br.firstAfterOrEqual(r);return H.resolve(n.isEqual(s&&s.key))}performConsistencyCheck(e){return this.mutationQueue.length,H.resolve()}Fr(e,n){return this.vr(e)}vr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Dr(e){const n=this.vr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class X0{constructor(e){this.Mr=e,this.docs=function(){return new Xe(ae.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){const r=n.key,s=this.docs.get(r),i=s?s.size:0,a=this.Mr(n);return this.docs=this.docs.insert(r,{document:n.mutableCopy(),size:a}),this.size+=a-i,this.indexManager.addToCollectionParentIndex(e,r.path.popLast())}removeEntry(e){const n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){const r=this.docs.get(n);return H.resolve(r?r.document.mutableCopy():It.newInvalidDocument(n))}getEntries(e,n){let r=Pn();return n.forEach(s=>{const i=this.docs.get(s);r=r.insert(s,i?i.document.mutableCopy():It.newInvalidDocument(s))}),H.resolve(r)}getDocumentsMatchingQuery(e,n,r,s){let i=Pn();const a=n.path,l=new ae(a.child("")),c=this.docs.getIteratorFrom(l);for(;c.hasNext();){const{key:h,value:{document:d}}=c.getNext();if(!a.isPrefixOf(h.path))break;h.path.length>a.length+1||NT(VT(d),r)<=0||(s.has(d.key)||ca(n,d))&&(i=i.insert(d.key,d.mutableCopy()))}return H.resolve(i)}getAllFromCollectionGroup(e,n,r,s){he()}Or(e,n){return H.forEach(this.docs,r=>n(r))}newChangeBuffer(e){return new Z0(this)}getSize(e){return H.resolve(this.size)}}class Z0 extends z0{constructor(e){super(),this.cr=e}applyChanges(e){const n=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?n.push(this.cr.addEntry(e,s)):this.cr.removeEntry(r)}),H.waitFor(n)}getFromCache(e,n){return this.cr.getEntry(e,n)}getAllFromCache(e,n){return this.cr.getEntries(e,n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eI{constructor(e){this.persistence=e,this.Nr=new ys(n=>Dc(n),Vc),this.lastRemoteSnapshotVersion=fe.min(),this.highestTargetId=0,this.Lr=0,this.Br=new Fc,this.targetCount=0,this.kr=ds.Bn()}forEachTarget(e,n){return this.Nr.forEach((r,s)=>n(s)),H.resolve()}getLastRemoteSnapshotVersion(e){return H.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return H.resolve(this.Lr)}allocateTargetId(e){return this.highestTargetId=this.kr.next(),H.resolve(this.highestTargetId)}setTargetsMetadata(e,n,r){return r&&(this.lastRemoteSnapshotVersion=r),n>this.Lr&&(this.Lr=n),H.resolve()}Kn(e){this.Nr.set(e.target,e);const n=e.targetId;n>this.highestTargetId&&(this.kr=new ds(n),this.highestTargetId=n),e.sequenceNumber>this.Lr&&(this.Lr=e.sequenceNumber)}addTargetData(e,n){return this.Kn(n),this.targetCount+=1,H.resolve()}updateTargetData(e,n){return this.Kn(n),H.resolve()}removeTargetData(e,n){return this.Nr.delete(n.target),this.Br.gr(n.targetId),this.targetCount-=1,H.resolve()}removeTargets(e,n,r){let s=0;const i=[];return this.Nr.forEach((a,l)=>{l.sequenceNumber<=n&&r.get(l.targetId)===null&&(this.Nr.delete(a),i.push(this.removeMatchingKeysForTargetId(e,l.targetId)),s++)}),H.waitFor(i).next(()=>s)}getTargetCount(e){return H.resolve(this.targetCount)}getTargetData(e,n){const r=this.Nr.get(n)||null;return H.resolve(r)}addMatchingKeys(e,n,r){return this.Br.Rr(n,r),H.resolve()}removeMatchingKeys(e,n,r){this.Br.mr(n,r);const s=this.persistence.referenceDelegate,i=[];return s&&n.forEach(a=>{i.push(s.markPotentiallyOrphaned(e,a))}),H.waitFor(i)}removeMatchingKeysForTargetId(e,n){return this.Br.gr(n),H.resolve()}getMatchingKeysForTargetId(e,n){const r=this.Br.yr(n);return H.resolve(r)}containsKey(e,n){return H.resolve(this.Br.containsKey(n))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tI{constructor(e,n){this.qr={},this.overlays={},this.Qr=new Pc(0),this.Kr=!1,this.Kr=!0,this.$r=new J0,this.referenceDelegate=e(this),this.Ur=new eI(this),this.indexManager=new q0,this.remoteDocumentCache=function(s){return new X0(s)}(r=>this.referenceDelegate.Wr(r)),this.serializer=new j0(n),this.Gr=new G0(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.Kr=!1,Promise.resolve()}get started(){return this.Kr}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new Q0,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let r=this.qr[e.toKey()];return r||(r=new Y0(n,this.referenceDelegate),this.qr[e.toKey()]=r),r}getGlobalsCache(){return this.$r}getTargetCache(){return this.Ur}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Gr}runTransaction(e,n,r){se("MemoryPersistence","Starting transaction:",e);const s=new nI(this.Qr.next());return this.referenceDelegate.zr(),r(s).next(i=>this.referenceDelegate.jr(s).next(()=>i)).toPromise().then(i=>(s.raiseOnCommittedEvent(),i))}Hr(e,n){return H.or(Object.values(this.qr).map(r=>()=>r.containsKey(e,n)))}}class nI extends MT{constructor(e){super(),this.currentSequenceNumber=e}}class Uc{constructor(e){this.persistence=e,this.Jr=new Fc,this.Yr=null}static Zr(e){return new Uc(e)}get Xr(){if(this.Yr)return this.Yr;throw he()}addReference(e,n,r){return this.Jr.addReference(r,n),this.Xr.delete(r.toString()),H.resolve()}removeReference(e,n,r){return this.Jr.removeReference(r,n),this.Xr.add(r.toString()),H.resolve()}markPotentiallyOrphaned(e,n){return this.Xr.add(n.toString()),H.resolve()}removeTarget(e,n){this.Jr.gr(n.targetId).forEach(s=>this.Xr.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(e,n.targetId).next(s=>{s.forEach(i=>this.Xr.add(i.toString()))}).next(()=>r.removeTargetData(e,n))}zr(){this.Yr=new Set}jr(e){const n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return H.forEach(this.Xr,r=>{const s=ae.fromPath(r);return this.ei(e,s).next(i=>{i||n.removeEntry(s,fe.min())})}).next(()=>(this.Yr=null,n.apply(e)))}updateLimboDocument(e,n){return this.ei(e,n).next(r=>{r?this.Xr.delete(n.toString()):this.Xr.add(n.toString())})}Wr(e){return 0}ei(e,n){return H.or([()=>H.resolve(this.Jr.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Hr(e,n)])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class rI{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}}/**
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
 */class sI{constructor(){this.Gi=!1,this.zi=!1,this.ji=100,this.Hi=function(){return sw()?8:LT(Rt())>0?6:4}()}initialize(e,n){this.Ji=e,this.indexManager=n,this.Gi=!0}getDocumentsMatchingQuery(e,n,r,s){const i={result:null};return this.Yi(e,n).next(a=>{i.result=a}).next(()=>{if(!i.result)return this.Zi(e,n,s,r).next(a=>{i.result=a})}).next(()=>{if(i.result)return;const a=new rI;return this.Xi(e,n,a).next(l=>{if(i.result=l,this.zi)return this.es(e,n,a,l.size)})}).next(()=>i.result)}es(e,n,r,s){return r.documentReadCount<this.ji?(Ls()<=Se.DEBUG&&se("QueryEngine","SDK will not create cache indexes for query:",Hr(n),"since it only creates cache indexes for collection contains","more than or equal to",this.ji,"documents"),H.resolve()):(Ls()<=Se.DEBUG&&se("QueryEngine","Query:",Hr(n),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.Hi*s?(Ls()<=Se.DEBUG&&se("QueryEngine","The SDK decides to create cache indexes for query:",Hr(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,an(n))):H.resolve())}Yi(e,n){if(wd(n))return H.resolve(null);let r=an(n);return this.indexManager.getIndexType(e,r).next(s=>s===0?null:(n.limit!==null&&s===1&&(n=zl(n,null,"F"),r=an(n)),this.indexManager.getDocumentsMatchingTarget(e,r).next(i=>{const a=be(...i);return this.Ji.getDocuments(e,a).next(l=>this.indexManager.getMinOffset(e,r).next(c=>{const h=this.ts(n,l);return this.ns(n,h,a,c.readTime)?this.Yi(e,zl(n,null,"F")):this.rs(e,h,n,c)}))})))}Zi(e,n,r,s){return wd(n)||s.isEqual(fe.min())?H.resolve(null):this.Ji.getDocuments(e,r).next(i=>{const a=this.ts(n,i);return this.ns(n,a,r,s)?H.resolve(null):(Ls()<=Se.DEBUG&&se("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Hr(n)),this.rs(e,a,n,DT(s,-1)).next(l=>l))})}ts(e,n){let r=new gt(dm(e));return n.forEach((s,i)=>{ca(e,i)&&(r=r.add(i))}),r}ns(e,n,r,s){if(e.limit===null)return!1;if(r.size!==n.size)return!0;const i=e.limitType==="F"?n.last():n.first();return!!i&&(i.hasPendingWrites||i.version.compareTo(s)>0)}Xi(e,n,r){return Ls()<=Se.DEBUG&&se("QueryEngine","Using full collection scan to execute query:",Hr(n)),this.Ji.getDocumentsMatchingQuery(e,n,sr.min(),r)}rs(e,n,r,s){return this.Ji.getDocumentsMatchingQuery(e,r,s).next(i=>(n.forEach(a=>{i=i.insert(a.key,a)}),i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class iI{constructor(e,n,r,s){this.persistence=e,this.ss=n,this.serializer=s,this.os=new Xe(Ve),this._s=new ys(i=>Dc(i),Vc),this.us=new Map,this.cs=e.getRemoteDocumentCache(),this.Ur=e.getTargetCache(),this.Gr=e.getBundleCache(),this.ls(r)}ls(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new W0(this.cs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.cs.setIndexManager(this.indexManager),this.ss.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.os))}}function oI(t,e,n,r){return new iI(t,e,n,r)}async function Vm(t,e){const n=pe(t);return await n.persistence.runTransaction("Handle user change","readonly",r=>{let s;return n.mutationQueue.getAllMutationBatches(r).next(i=>(s=i,n.ls(e),n.mutationQueue.getAllMutationBatches(r))).next(i=>{const a=[],l=[];let c=be();for(const h of s){a.push(h.batchId);for(const d of h.mutations)c=c.add(d.key)}for(const h of i){l.push(h.batchId);for(const d of h.mutations)c=c.add(d.key)}return n.localDocuments.getDocuments(r,c).next(h=>({hs:h,removedBatchIds:a,addedBatchIds:l}))})})}function aI(t,e){const n=pe(t);return n.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=e.batch.keys(),i=n.cs.newChangeBuffer({trackRemovals:!0});return function(l,c,h,d){const p=h.batch,g=p.keys();let y=H.resolve();return g.forEach(x=>{y=y.next(()=>d.getEntry(c,x)).next(N=>{const O=h.docVersions.get(x);Be(O!==null),N.version.compareTo(O)<0&&(p.applyToRemoteDocument(N,h),N.isValidDocument()&&(N.setReadTime(h.commitVersion),d.addEntry(N)))})}),y.next(()=>l.mutationQueue.removeMutationBatch(c,p))}(n,r,e,i).next(()=>i.apply(r)).next(()=>n.mutationQueue.performConsistencyCheck(r)).next(()=>n.documentOverlayCache.removeOverlaysForBatchId(r,s,e.batch.batchId)).next(()=>n.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(l){let c=be();for(let h=0;h<l.mutationResults.length;++h)l.mutationResults[h].transformResults.length>0&&(c=c.add(l.batch.mutations[h].key));return c}(e))).next(()=>n.localDocuments.getDocuments(r,s))})}function Nm(t){const e=pe(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.Ur.getLastRemoteSnapshotVersion(n))}function lI(t,e){const n=pe(t),r=e.snapshotVersion;let s=n.os;return n.persistence.runTransaction("Apply remote event","readwrite-primary",i=>{const a=n.cs.newChangeBuffer({trackRemovals:!0});s=n.os;const l=[];e.targetChanges.forEach((d,p)=>{const g=s.get(p);if(!g)return;l.push(n.Ur.removeMatchingKeys(i,d.removedDocuments,p).next(()=>n.Ur.addMatchingKeys(i,d.addedDocuments,p)));let y=g.withSequenceNumber(i.currentSequenceNumber);e.targetMismatches.get(p)!==null?y=y.withResumeToken(_t.EMPTY_BYTE_STRING,fe.min()).withLastLimboFreeSnapshotVersion(fe.min()):d.resumeToken.approximateByteSize()>0&&(y=y.withResumeToken(d.resumeToken,r)),s=s.insert(p,y),function(N,O,q){return N.resumeToken.approximateByteSize()===0||O.snapshotVersion.toMicroseconds()-N.snapshotVersion.toMicroseconds()>=3e8?!0:q.addedDocuments.size+q.modifiedDocuments.size+q.removedDocuments.size>0}(g,y,d)&&l.push(n.Ur.updateTargetData(i,y))});let c=Pn(),h=be();if(e.documentUpdates.forEach(d=>{e.resolvedLimboDocuments.has(d)&&l.push(n.persistence.referenceDelegate.updateLimboDocument(i,d))}),l.push(cI(i,a,e.documentUpdates).next(d=>{c=d.Ps,h=d.Is})),!r.isEqual(fe.min())){const d=n.Ur.getLastRemoteSnapshotVersion(i).next(p=>n.Ur.setTargetsMetadata(i,i.currentSequenceNumber,r));l.push(d)}return H.waitFor(l).next(()=>a.apply(i)).next(()=>n.localDocuments.getLocalViewOfDocuments(i,c,h)).next(()=>c)}).then(i=>(n.os=s,i))}function cI(t,e,n){let r=be(),s=be();return n.forEach(i=>r=r.add(i)),e.getEntries(t,r).next(i=>{let a=Pn();return n.forEach((l,c)=>{const h=i.get(l);c.isFoundDocument()!==h.isFoundDocument()&&(s=s.add(l)),c.isNoDocument()&&c.version.isEqual(fe.min())?(e.removeEntry(l,c.readTime),a=a.insert(l,c)):!h.isValidDocument()||c.version.compareTo(h.version)>0||c.version.compareTo(h.version)===0&&h.hasPendingWrites?(e.addEntry(c),a=a.insert(l,c)):se("LocalStore","Ignoring outdated watch update for ",l,". Current version:",h.version," Watch version:",c.version)}),{Ps:a,Is:s}})}function uI(t,e){const n=pe(t);return n.persistence.runTransaction("Get next mutation batch","readonly",r=>(e===void 0&&(e=-1),n.mutationQueue.getNextMutationBatchAfterBatchId(r,e)))}function hI(t,e){const n=pe(t);return n.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return n.Ur.getTargetData(r,e).next(i=>i?(s=i,H.resolve(s)):n.Ur.allocateTargetId(r).next(a=>(s=new Gn(e,a,"TargetPurposeListen",r.currentSequenceNumber),n.Ur.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=n.os.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(n.os=n.os.insert(r.targetId,r),n._s.set(e,r.targetId)),r})}async function Jl(t,e,n){const r=pe(t),s=r.os.get(e),i=n?"readwrite":"readwrite-primary";try{n||await r.persistence.runTransaction("Release target",i,a=>r.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!Ri(a))throw a;se("LocalStore",`Failed to update sequence numbers for target ${e}: ${a}`)}r.os=r.os.remove(e),r._s.delete(s.target)}function Dd(t,e,n){const r=pe(t);let s=fe.min(),i=be();return r.persistence.runTransaction("Execute query","readwrite",a=>function(c,h,d){const p=pe(c),g=p._s.get(d);return g!==void 0?H.resolve(p.os.get(g)):p.Ur.getTargetData(h,d)}(r,a,an(e)).next(l=>{if(l)return s=l.lastLimboFreeSnapshotVersion,r.Ur.getMatchingKeysForTargetId(a,l.targetId).next(c=>{i=c})}).next(()=>r.ss.getDocumentsMatchingQuery(a,e,n?s:fe.min(),n?i:be())).next(l=>(dI(r,t0(e),l),{documents:l,Ts:i})))}function dI(t,e,n){let r=t.us.get(e)||fe.min();n.forEach((s,i)=>{i.readTime.compareTo(r)>0&&(r=i.readTime)}),t.us.set(e,r)}class Vd{constructor(){this.activeTargetIds=a0()}fs(e){this.activeTargetIds=this.activeTargetIds.add(e)}gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Vs(){const e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}}class fI{constructor(){this.so=new Vd,this.oo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,r){}addLocalQueryTarget(e,n=!0){return n&&this.so.fs(e),this.oo[e]||"not-current"}updateQueryState(e,n,r){this.oo[e]=n}removeLocalQueryTarget(e){this.so.gs(e)}isLocalQueryTarget(e){return this.so.activeTargetIds.has(e)}clearQueryState(e){delete this.oo[e]}getAllActiveQueryTargets(){return this.so.activeTargetIds}isActiveQueryTarget(e){return this.so.activeTargetIds.has(e)}start(){return this.so=new Vd,Promise.resolve()}handleUserChange(e,n,r){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}}/**
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
 */class pI{_o(e){}shutdown(){}}/**
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
 */class Nd{constructor(){this.ao=()=>this.uo(),this.co=()=>this.lo(),this.ho=[],this.Po()}_o(e){this.ho.push(e)}shutdown(){window.removeEventListener("online",this.ao),window.removeEventListener("offline",this.co)}Po(){window.addEventListener("online",this.ao),window.addEventListener("offline",this.co)}uo(){se("ConnectivityMonitor","Network connectivity changed: AVAILABLE");for(const e of this.ho)e(0)}lo(){se("ConnectivityMonitor","Network connectivity changed: UNAVAILABLE");for(const e of this.ho)e(1)}static D(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
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
 */let ro=null;function dl(){return ro===null?ro=function(){return 268435456+Math.round(2147483648*Math.random())}():ro++,"0x"+ro.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const mI={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class gI{constructor(e){this.Io=e.Io,this.To=e.To}Eo(e){this.Ao=e}Ro(e){this.Vo=e}mo(e){this.fo=e}onMessage(e){this.po=e}close(){this.To()}send(e){this.Io(e)}yo(){this.Ao()}wo(){this.Vo()}So(e){this.fo(e)}bo(e){this.po(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Et="WebChannelConnection";class _I extends class{constructor(n){this.databaseInfo=n,this.databaseId=n.databaseId;const r=n.ssl?"https":"http",s=encodeURIComponent(this.databaseId.projectId),i=encodeURIComponent(this.databaseId.database);this.Do=r+"://"+n.host,this.vo=`projects/${s}/databases/${i}`,this.Co=this.databaseId.database==="(default)"?`project_id=${s}`:`project_id=${s}&database_id=${i}`}get Fo(){return!1}Mo(n,r,s,i,a){const l=dl(),c=this.xo(n,r.toUriEncodedString());se("RestConnection",`Sending RPC '${n}' ${l}:`,c,s);const h={"google-cloud-resource-prefix":this.vo,"x-goog-request-params":this.Co};return this.Oo(h,i,a),this.No(n,c,h,s).then(d=>(se("RestConnection",`Received RPC '${n}' ${l}: `,d),d),d=>{throw ls("RestConnection",`RPC '${n}' ${l} failed with error: `,d,"url: ",c,"request:",s),d})}Lo(n,r,s,i,a,l){return this.Mo(n,r,s,i,a)}Oo(n,r,s){n["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+gs}(),n["Content-Type"]="text/plain",this.databaseInfo.appId&&(n["X-Firebase-GMPID"]=this.databaseInfo.appId),r&&r.headers.forEach((i,a)=>n[a]=i),s&&s.headers.forEach((i,a)=>n[a]=i)}xo(n,r){const s=mI[n];return`${this.Do}/v1/${r}:${s}`}terminate(){}}{constructor(e){super(e),this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}No(e,n,r,s){const i=dl();return new Promise((a,l)=>{const c=new Wp;c.setWithCredentials(!0),c.listenOnce(Gp.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case po.NO_ERROR:const d=c.getResponseJson();se(Et,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(d)),a(d);break;case po.TIMEOUT:se(Et,`RPC '${e}' ${i} timed out`),l(new re(F.DEADLINE_EXCEEDED,"Request time out"));break;case po.HTTP_ERROR:const p=c.getStatus();if(se(Et,`RPC '${e}' ${i} failed with status:`,p,"response text:",c.getResponseText()),p>0){let g=c.getResponseJson();Array.isArray(g)&&(g=g[0]);const y=g==null?void 0:g.error;if(y&&y.status&&y.message){const x=function(O){const q=O.toLowerCase().replace(/_/g,"-");return Object.values(F).indexOf(q)>=0?q:F.UNKNOWN}(y.status);l(new re(x,y.message))}else l(new re(F.UNKNOWN,"Server responded with status "+c.getStatus()))}else l(new re(F.UNAVAILABLE,"Connection failed."));break;default:he()}}finally{se(Et,`RPC '${e}' ${i} completed.`)}});const h=JSON.stringify(s);se(Et,`RPC '${e}' ${i} sending request:`,s),c.send(n,"POST",h,r,15)})}Bo(e,n,r){const s=dl(),i=[this.Do,"/","google.firestore.v1.Firestore","/",e,"/channel"],a=Yp(),l=Jp(),c={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},h=this.longPollingOptions.timeoutSeconds;h!==void 0&&(c.longPollingTimeout=Math.round(1e3*h)),this.useFetchStreams&&(c.useFetchStreams=!0),this.Oo(c.initMessageHeaders,n,r),c.encodeInitMessageHeaders=!0;const d=i.join("");se(Et,`Creating RPC '${e}' stream ${s}: ${d}`,c);const p=a.createWebChannel(d,c);let g=!1,y=!1;const x=new gI({Io:O=>{y?se(Et,`Not sending because RPC '${e}' stream ${s} is closed:`,O):(g||(se(Et,`Opening RPC '${e}' stream ${s} transport.`),p.open(),g=!0),se(Et,`RPC '${e}' stream ${s} sending:`,O),p.send(O))},To:()=>p.close()}),N=(O,q,U)=>{O.listen(q,G=>{try{U(G)}catch(J){setTimeout(()=>{throw J},0)}})};return N(p,Us.EventType.OPEN,()=>{y||(se(Et,`RPC '${e}' stream ${s} transport opened.`),x.yo())}),N(p,Us.EventType.CLOSE,()=>{y||(y=!0,se(Et,`RPC '${e}' stream ${s} transport closed`),x.So())}),N(p,Us.EventType.ERROR,O=>{y||(y=!0,ls(Et,`RPC '${e}' stream ${s} transport errored:`,O),x.So(new re(F.UNAVAILABLE,"The operation could not be completed")))}),N(p,Us.EventType.MESSAGE,O=>{var q;if(!y){const U=O.data[0];Be(!!U);const G=U,J=G.error||((q=G[0])===null||q===void 0?void 0:q.error);if(J){se(Et,`RPC '${e}' stream ${s} received error:`,J);const ge=J.status;let _e=function(T){const b=rt[T];if(b!==void 0)return Im(b)}(ge),I=J.message;_e===void 0&&(_e=F.INTERNAL,I="Unknown error status: "+ge+" with message "+J.message),y=!0,x.So(new re(_e,I)),p.close()}else se(Et,`RPC '${e}' stream ${s} received:`,U),x.bo(U)}}),N(l,Qp.STAT_EVENT,O=>{O.stat===Ul.PROXY?se(Et,`RPC '${e}' stream ${s} detected buffering proxy`):O.stat===Ul.NOPROXY&&se(Et,`RPC '${e}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{x.wo()},0),x}}function fl(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function pa(t){return new S0(t,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Om{constructor(e,n,r=1e3,s=1.5,i=6e4){this.ui=e,this.timerId=n,this.ko=r,this.qo=s,this.Qo=i,this.Ko=0,this.$o=null,this.Uo=Date.now(),this.reset()}reset(){this.Ko=0}Wo(){this.Ko=this.Qo}Go(e){this.cancel();const n=Math.floor(this.Ko+this.zo()),r=Math.max(0,Date.now()-this.Uo),s=Math.max(0,n-r);s>0&&se("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.Ko} ms, delay with jitter: ${n} ms, last attempt: ${r} ms ago)`),this.$o=this.ui.enqueueAfterDelay(this.timerId,s,()=>(this.Uo=Date.now(),e())),this.Ko*=this.qo,this.Ko<this.ko&&(this.Ko=this.ko),this.Ko>this.Qo&&(this.Ko=this.Qo)}jo(){this.$o!==null&&(this.$o.skipDelay(),this.$o=null)}cancel(){this.$o!==null&&(this.$o.cancel(),this.$o=null)}zo(){return(Math.random()-.5)*this.Ko}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mm{constructor(e,n,r,s,i,a,l,c){this.ui=e,this.Ho=r,this.Jo=s,this.connection=i,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=l,this.listener=c,this.state=0,this.Yo=0,this.Zo=null,this.Xo=null,this.stream=null,this.e_=0,this.t_=new Om(e,n)}n_(){return this.state===1||this.state===5||this.r_()}r_(){return this.state===2||this.state===3}start(){this.e_=0,this.state!==4?this.auth():this.i_()}async stop(){this.n_()&&await this.close(0)}s_(){this.state=0,this.t_.reset()}o_(){this.r_()&&this.Zo===null&&(this.Zo=this.ui.enqueueAfterDelay(this.Ho,6e4,()=>this.__()))}a_(e){this.u_(),this.stream.send(e)}async __(){if(this.r_())return this.close(0)}u_(){this.Zo&&(this.Zo.cancel(),this.Zo=null)}c_(){this.Xo&&(this.Xo.cancel(),this.Xo=null)}async close(e,n){this.u_(),this.c_(),this.t_.cancel(),this.Yo++,e!==4?this.t_.reset():n&&n.code===F.RESOURCE_EXHAUSTED?(Sn(n.toString()),Sn("Using maximum backoff delay to prevent overloading the backend."),this.t_.Wo()):n&&n.code===F.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.l_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.mo(n)}l_(){}auth(){this.state=1;const e=this.h_(this.Yo),n=this.Yo;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.Yo===n&&this.P_(r,s)},r=>{e(()=>{const s=new re(F.UNKNOWN,"Fetching auth token failed: "+r.message);return this.I_(s)})})}P_(e,n){const r=this.h_(this.Yo);this.stream=this.T_(e,n),this.stream.Eo(()=>{r(()=>this.listener.Eo())}),this.stream.Ro(()=>{r(()=>(this.state=2,this.Xo=this.ui.enqueueAfterDelay(this.Jo,1e4,()=>(this.r_()&&(this.state=3),Promise.resolve())),this.listener.Ro()))}),this.stream.mo(s=>{r(()=>this.I_(s))}),this.stream.onMessage(s=>{r(()=>++this.e_==1?this.E_(s):this.onNext(s))})}i_(){this.state=5,this.t_.Go(async()=>{this.state=0,this.start()})}I_(e){return se("PersistentStream",`close with error: ${e}`),this.stream=null,this.close(4,e)}h_(e){return n=>{this.ui.enqueueAndForget(()=>this.Yo===e?n():(se("PersistentStream","stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class yI extends Mm{constructor(e,n,r,s,i,a){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,r,s,a),this.serializer=i}T_(e,n){return this.connection.Bo("Listen",e,n)}E_(e){return this.onNext(e)}onNext(e){this.t_.reset();const n=k0(this.serializer,e),r=function(i){if(!("targetChange"in i))return fe.min();const a=i.targetChange;return a.targetIds&&a.targetIds.length?fe.min():a.readTime?ln(a.readTime):fe.min()}(e);return this.listener.d_(n,r)}A_(e){const n={};n.database=Ql(this.serializer),n.addTarget=function(i,a){let l;const c=a.target;if(l=ql(c)?{documents:V0(i,c)}:{query:N0(i,c)._t},l.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){l.resumeToken=Rm(i,a.resumeToken);const h=Kl(i,a.expectedCount);h!==null&&(l.expectedCount=h)}else if(a.snapshotVersion.compareTo(fe.min())>0){l.readTime=Mo(i,a.snapshotVersion.toTimestamp());const h=Kl(i,a.expectedCount);h!==null&&(l.expectedCount=h)}return l}(this.serializer,e);const r=M0(this.serializer,e);r&&(n.labels=r),this.a_(n)}R_(e){const n={};n.database=Ql(this.serializer),n.removeTarget=e,this.a_(n)}}class vI extends Mm{constructor(e,n,r,s,i,a){super(e,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",n,r,s,a),this.serializer=i}get V_(){return this.e_>0}start(){this.lastStreamToken=void 0,super.start()}l_(){this.V_&&this.m_([])}T_(e,n){return this.connection.Bo("Write",e,n)}E_(e){return Be(!!e.streamToken),this.lastStreamToken=e.streamToken,Be(!e.writeResults||e.writeResults.length===0),this.listener.f_()}onNext(e){Be(!!e.streamToken),this.lastStreamToken=e.streamToken,this.t_.reset();const n=D0(e.writeResults,e.commitTime),r=ln(e.commitTime);return this.listener.g_(r,n)}p_(){const e={};e.database=Ql(this.serializer),this.a_(e)}m_(e){const n={streamToken:this.lastStreamToken,writes:e.map(r=>x0(this.serializer,r))};this.a_(n)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class EI extends class{}{constructor(e,n,r,s){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=r,this.serializer=s,this.y_=!1}w_(){if(this.y_)throw new re(F.FAILED_PRECONDITION,"The client has already been terminated.")}Mo(e,n,r,s){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,a])=>this.connection.Mo(e,Wl(n,r),s,i,a)).catch(i=>{throw i.name==="FirebaseError"?(i.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new re(F.UNKNOWN,i.toString())})}Lo(e,n,r,s,i){return this.w_(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,l])=>this.connection.Lo(e,Wl(n,r),s,a,l,i)).catch(a=>{throw a.name==="FirebaseError"?(a.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new re(F.UNKNOWN,a.toString())})}terminate(){this.y_=!0,this.connection.terminate()}}class wI{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.S_=0,this.b_=null,this.D_=!0}v_(){this.S_===0&&(this.C_("Unknown"),this.b_=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.b_=null,this.F_("Backend didn't respond within 10 seconds."),this.C_("Offline"),Promise.resolve())))}M_(e){this.state==="Online"?this.C_("Unknown"):(this.S_++,this.S_>=1&&(this.x_(),this.F_(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.C_("Offline")))}set(e){this.x_(),this.S_=0,e==="Online"&&(this.D_=!1),this.C_(e)}C_(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}F_(e){const n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.D_?(Sn(n),this.D_=!1):se("OnlineStateTracker",n)}x_(){this.b_!==null&&(this.b_.cancel(),this.b_=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TI{constructor(e,n,r,s,i){this.localStore=e,this.datastore=n,this.asyncQueue=r,this.remoteSyncer={},this.O_=[],this.N_=new Map,this.L_=new Set,this.B_=[],this.k_=i,this.k_._o(a=>{r.enqueueAndForget(async()=>{Vr(this)&&(se("RemoteStore","Restarting streams for network reachability change."),await async function(c){const h=pe(c);h.L_.add(4),await Ci(h),h.q_.set("Unknown"),h.L_.delete(4),await ma(h)}(this))})}),this.q_=new wI(r,s)}}async function ma(t){if(Vr(t))for(const e of t.B_)await e(!0)}async function Ci(t){for(const e of t.B_)await e(!1)}function Lm(t,e){const n=pe(t);n.N_.has(e.targetId)||(n.N_.set(e.targetId,e),Hc(n)?qc(n):vs(n).r_()&&$c(n,e))}function jc(t,e){const n=pe(t),r=vs(n);n.N_.delete(e),r.r_()&&Fm(n,e),n.N_.size===0&&(r.r_()?r.o_():Vr(n)&&n.q_.set("Unknown"))}function $c(t,e){if(t.Q_.xe(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(fe.min())>0){const n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}vs(t).A_(e)}function Fm(t,e){t.Q_.xe(e),vs(t).R_(e)}function qc(t){t.Q_=new I0({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),ot:e=>t.N_.get(e)||null,tt:()=>t.datastore.serializer.databaseId}),vs(t).start(),t.q_.v_()}function Hc(t){return Vr(t)&&!vs(t).n_()&&t.N_.size>0}function Vr(t){return pe(t).L_.size===0}function Um(t){t.Q_=void 0}async function II(t){t.q_.set("Online")}async function bI(t){t.N_.forEach((e,n)=>{$c(t,e)})}async function AI(t,e){Um(t),Hc(t)?(t.q_.M_(e),qc(t)):t.q_.set("Unknown")}async function RI(t,e,n){if(t.q_.set("Online"),e instanceof Am&&e.state===2&&e.cause)try{await async function(s,i){const a=i.cause;for(const l of i.targetIds)s.N_.has(l)&&(await s.remoteSyncer.rejectListen(l,a),s.N_.delete(l),s.Q_.removeTarget(l))}(t,e)}catch(r){se("RemoteStore","Failed to remove targets %s: %s ",e.targetIds.join(","),r),await Lo(t,r)}else if(e instanceof _o?t.Q_.Ke(e):e instanceof bm?t.Q_.He(e):t.Q_.We(e),!n.isEqual(fe.min()))try{const r=await Nm(t.localStore);n.compareTo(r)>=0&&await function(i,a){const l=i.Q_.rt(a);return l.targetChanges.forEach((c,h)=>{if(c.resumeToken.approximateByteSize()>0){const d=i.N_.get(h);d&&i.N_.set(h,d.withResumeToken(c.resumeToken,a))}}),l.targetMismatches.forEach((c,h)=>{const d=i.N_.get(c);if(!d)return;i.N_.set(c,d.withResumeToken(_t.EMPTY_BYTE_STRING,d.snapshotVersion)),Fm(i,c);const p=new Gn(d.target,c,h,d.sequenceNumber);$c(i,p)}),i.remoteSyncer.applyRemoteEvent(l)}(t,n)}catch(r){se("RemoteStore","Failed to raise snapshot:",r),await Lo(t,r)}}async function Lo(t,e,n){if(!Ri(e))throw e;t.L_.add(1),await Ci(t),t.q_.set("Offline"),n||(n=()=>Nm(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{se("RemoteStore","Retrying IndexedDB access"),await n(),t.L_.delete(1),await ma(t)})}function Bm(t,e){return e().catch(n=>Lo(t,n,e))}async function ga(t){const e=pe(t),n=or(e);let r=e.O_.length>0?e.O_[e.O_.length-1].batchId:-1;for(;SI(e);)try{const s=await uI(e.localStore,r);if(s===null){e.O_.length===0&&n.o_();break}r=s.batchId,PI(e,s)}catch(s){await Lo(e,s)}jm(e)&&$m(e)}function SI(t){return Vr(t)&&t.O_.length<10}function PI(t,e){t.O_.push(e);const n=or(t);n.r_()&&n.V_&&n.m_(e.mutations)}function jm(t){return Vr(t)&&!or(t).n_()&&t.O_.length>0}function $m(t){or(t).start()}async function CI(t){or(t).p_()}async function kI(t){const e=or(t);for(const n of t.O_)e.m_(n.mutations)}async function xI(t,e,n){const r=t.O_.shift(),s=Oc.from(r,e,n);await Bm(t,()=>t.remoteSyncer.applySuccessfulWrite(s)),await ga(t)}async function DI(t,e){e&&or(t).V_&&await async function(r,s){if(function(a){return E0(a)&&a!==F.ABORTED}(s.code)){const i=r.O_.shift();or(r).s_(),await Bm(r,()=>r.remoteSyncer.rejectFailedWrite(i.batchId,s)),await ga(r)}}(t,e),jm(t)&&$m(t)}async function Od(t,e){const n=pe(t);n.asyncQueue.verifyOperationInProgress(),se("RemoteStore","RemoteStore received new credentials");const r=Vr(n);n.L_.add(3),await Ci(n),r&&n.q_.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.L_.delete(3),await ma(n)}async function VI(t,e){const n=pe(t);e?(n.L_.delete(2),await ma(n)):e||(n.L_.add(2),await Ci(n),n.q_.set("Unknown"))}function vs(t){return t.K_||(t.K_=function(n,r,s){const i=pe(n);return i.w_(),new yI(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(t.datastore,t.asyncQueue,{Eo:II.bind(null,t),Ro:bI.bind(null,t),mo:AI.bind(null,t),d_:RI.bind(null,t)}),t.B_.push(async e=>{e?(t.K_.s_(),Hc(t)?qc(t):t.q_.set("Unknown")):(await t.K_.stop(),Um(t))})),t.K_}function or(t){return t.U_||(t.U_=function(n,r,s){const i=pe(n);return i.w_(),new vI(r,i.connection,i.authCredentials,i.appCheckCredentials,i.serializer,s)}(t.datastore,t.asyncQueue,{Eo:()=>Promise.resolve(),Ro:CI.bind(null,t),mo:DI.bind(null,t),f_:kI.bind(null,t),g_:xI.bind(null,t)}),t.B_.push(async e=>{e?(t.U_.s_(),await ga(t)):(await t.U_.stop(),t.O_.length>0&&(se("RemoteStore",`Stopping write stream with ${t.O_.length} pending writes`),t.O_=[]))})),t.U_}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zc{constructor(e,n,r,s,i){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=r,this.op=s,this.removalCallback=i,this.deferred=new Zn,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,r,s,i){const a=Date.now()+r,l=new zc(e,n,a,s,i);return l.start(r),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new re(F.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Kc(t,e){if(Sn("AsyncQueue",`${e}: ${t}`),Ri(t))return new re(F.UNAVAILABLE,`${e}: ${t}`);throw t}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class es{constructor(e){this.comparator=e?(n,r)=>e(n,r)||ae.comparator(n.key,r.key):(n,r)=>ae.comparator(n.key,r.key),this.keyedMap=Bs(),this.sortedSet=new Xe(this.comparator)}static emptySet(e){return new es(e.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){const n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,r)=>(e(n),!1))}add(e){const n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){const n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof es)||this.size!==e.size)return!1;const n=this.sortedSet.getIterator(),r=e.sortedSet.getIterator();for(;n.hasNext();){const s=n.getNext().key,i=r.getNext().key;if(!s.isEqual(i))return!1}return!0}toString(){const e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
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
 */class Md{constructor(){this.W_=new Xe(ae.comparator)}track(e){const n=e.doc.key,r=this.W_.get(n);r?e.type!==0&&r.type===3?this.W_=this.W_.insert(n,e):e.type===3&&r.type!==1?this.W_=this.W_.insert(n,{type:r.type,doc:e.doc}):e.type===2&&r.type===2?this.W_=this.W_.insert(n,{type:2,doc:e.doc}):e.type===2&&r.type===0?this.W_=this.W_.insert(n,{type:0,doc:e.doc}):e.type===1&&r.type===0?this.W_=this.W_.remove(n):e.type===1&&r.type===2?this.W_=this.W_.insert(n,{type:1,doc:r.doc}):e.type===0&&r.type===1?this.W_=this.W_.insert(n,{type:2,doc:e.doc}):he():this.W_=this.W_.insert(n,e)}G_(){const e=[];return this.W_.inorderTraversal((n,r)=>{e.push(r)}),e}}class fs{constructor(e,n,r,s,i,a,l,c,h){this.query=e,this.docs=n,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=i,this.fromCache=a,this.syncStateChanged=l,this.excludesMetadataChanges=c,this.hasCachedResults=h}static fromInitialDocuments(e,n,r,s,i){const a=[];return n.forEach(l=>{a.push({type:0,doc:l})}),new fs(e,n,es.emptySet(n),a,r,s,!0,!1,i)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&la(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;const n=this.docChanges,r=e.docChanges;if(n.length!==r.length)return!1;for(let s=0;s<n.length;s++)if(n[s].type!==r[s].type||!n[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class NI{constructor(){this.z_=void 0,this.j_=[]}H_(){return this.j_.some(e=>e.J_())}}class OI{constructor(){this.queries=Ld(),this.onlineState="Unknown",this.Y_=new Set}terminate(){(function(n,r){const s=pe(n),i=s.queries;s.queries=Ld(),i.forEach((a,l)=>{for(const c of l.j_)c.onError(r)})})(this,new re(F.ABORTED,"Firestore shutting down"))}}function Ld(){return new ys(t=>hm(t),la)}async function MI(t,e){const n=pe(t);let r=3;const s=e.query;let i=n.queries.get(s);i?!i.H_()&&e.J_()&&(r=2):(i=new NI,r=e.J_()?0:1);try{switch(r){case 0:i.z_=await n.onListen(s,!0);break;case 1:i.z_=await n.onListen(s,!1);break;case 2:await n.onFirstRemoteStoreListen(s)}}catch(a){const l=Kc(a,`Initialization of query '${Hr(e.query)}' failed`);return void e.onError(l)}n.queries.set(s,i),i.j_.push(e),e.Z_(n.onlineState),i.z_&&e.X_(i.z_)&&Wc(n)}async function LI(t,e){const n=pe(t),r=e.query;let s=3;const i=n.queries.get(r);if(i){const a=i.j_.indexOf(e);a>=0&&(i.j_.splice(a,1),i.j_.length===0?s=e.J_()?0:1:!i.H_()&&e.J_()&&(s=2))}switch(s){case 0:return n.queries.delete(r),n.onUnlisten(r,!0);case 1:return n.queries.delete(r),n.onUnlisten(r,!1);case 2:return n.onLastRemoteStoreUnlisten(r);default:return}}function FI(t,e){const n=pe(t);let r=!1;for(const s of e){const i=s.query,a=n.queries.get(i);if(a){for(const l of a.j_)l.X_(s)&&(r=!0);a.z_=s}}r&&Wc(n)}function UI(t,e,n){const r=pe(t),s=r.queries.get(e);if(s)for(const i of s.j_)i.onError(n);r.queries.delete(e)}function Wc(t){t.Y_.forEach(e=>{e.next()})}var Yl,Fd;(Fd=Yl||(Yl={})).ea="default",Fd.Cache="cache";class BI{constructor(e,n,r){this.query=e,this.ta=n,this.na=!1,this.ra=null,this.onlineState="Unknown",this.options=r||{}}X_(e){if(!this.options.includeMetadataChanges){const r=[];for(const s of e.docChanges)s.type!==3&&r.push(s);e=new fs(e.query,e.docs,e.oldDocs,r,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.na?this.ia(e)&&(this.ta.next(e),n=!0):this.sa(e,this.onlineState)&&(this.oa(e),n=!0),this.ra=e,n}onError(e){this.ta.error(e)}Z_(e){this.onlineState=e;let n=!1;return this.ra&&!this.na&&this.sa(this.ra,e)&&(this.oa(this.ra),n=!0),n}sa(e,n){if(!e.fromCache||!this.J_())return!0;const r=n!=="Offline";return(!this.options._a||!r)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}ia(e){if(e.docChanges.length>0)return!0;const n=this.ra&&this.ra.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}oa(e){e=fs.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.na=!0,this.ta.next(e)}J_(){return this.options.source!==Yl.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qm{constructor(e){this.key=e}}class Hm{constructor(e){this.key=e}}class jI{constructor(e,n){this.query=e,this.Ta=n,this.Ea=null,this.hasCachedResults=!1,this.current=!1,this.da=be(),this.mutatedKeys=be(),this.Aa=dm(e),this.Ra=new es(this.Aa)}get Va(){return this.Ta}ma(e,n){const r=n?n.fa:new Md,s=n?n.Ra:this.Ra;let i=n?n.mutatedKeys:this.mutatedKeys,a=s,l=!1;const c=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,h=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(e.inorderTraversal((d,p)=>{const g=s.get(d),y=ca(this.query,p)?p:null,x=!!g&&this.mutatedKeys.has(g.key),N=!!y&&(y.hasLocalMutations||this.mutatedKeys.has(y.key)&&y.hasCommittedMutations);let O=!1;g&&y?g.data.isEqual(y.data)?x!==N&&(r.track({type:3,doc:y}),O=!0):this.ga(g,y)||(r.track({type:2,doc:y}),O=!0,(c&&this.Aa(y,c)>0||h&&this.Aa(y,h)<0)&&(l=!0)):!g&&y?(r.track({type:0,doc:y}),O=!0):g&&!y&&(r.track({type:1,doc:g}),O=!0,(c||h)&&(l=!0)),O&&(y?(a=a.add(y),i=N?i.add(d):i.delete(d)):(a=a.delete(d),i=i.delete(d)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const d=this.query.limitType==="F"?a.last():a.first();a=a.delete(d.key),i=i.delete(d.key),r.track({type:1,doc:d})}return{Ra:a,fa:r,ns:l,mutatedKeys:i}}ga(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,r,s){const i=this.Ra;this.Ra=e.Ra,this.mutatedKeys=e.mutatedKeys;const a=e.fa.G_();a.sort((d,p)=>function(y,x){const N=O=>{switch(O){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return he()}};return N(y)-N(x)}(d.type,p.type)||this.Aa(d.doc,p.doc)),this.pa(r),s=s!=null&&s;const l=n&&!s?this.ya():[],c=this.da.size===0&&this.current&&!s?1:0,h=c!==this.Ea;return this.Ea=c,a.length!==0||h?{snapshot:new fs(this.query,e.Ra,i,a,e.mutatedKeys,c===0,h,!1,!!r&&r.resumeToken.approximateByteSize()>0),wa:l}:{wa:l}}Z_(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({Ra:this.Ra,fa:new Md,mutatedKeys:this.mutatedKeys,ns:!1},!1)):{wa:[]}}Sa(e){return!this.Ta.has(e)&&!!this.Ra.has(e)&&!this.Ra.get(e).hasLocalMutations}pa(e){e&&(e.addedDocuments.forEach(n=>this.Ta=this.Ta.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Ta=this.Ta.delete(n)),this.current=e.current)}ya(){if(!this.current)return[];const e=this.da;this.da=be(),this.Ra.forEach(r=>{this.Sa(r.key)&&(this.da=this.da.add(r.key))});const n=[];return e.forEach(r=>{this.da.has(r)||n.push(new Hm(r))}),this.da.forEach(r=>{e.has(r)||n.push(new qm(r))}),n}ba(e){this.Ta=e.Ts,this.da=be();const n=this.ma(e.documents);return this.applyChanges(n,!0)}Da(){return fs.fromInitialDocuments(this.query,this.Ra,this.mutatedKeys,this.Ea===0,this.hasCachedResults)}}class $I{constructor(e,n,r){this.query=e,this.targetId=n,this.view=r}}class qI{constructor(e){this.key=e,this.va=!1}}class HI{constructor(e,n,r,s,i,a){this.localStore=e,this.remoteStore=n,this.eventManager=r,this.sharedClientState=s,this.currentUser=i,this.maxConcurrentLimboResolutions=a,this.Ca={},this.Fa=new ys(l=>hm(l),la),this.Ma=new Map,this.xa=new Set,this.Oa=new Xe(ae.comparator),this.Na=new Map,this.La=new Fc,this.Ba={},this.ka=new Map,this.qa=ds.kn(),this.onlineState="Unknown",this.Qa=void 0}get isPrimaryClient(){return this.Qa===!0}}async function zI(t,e,n=!0){const r=Jm(t);let s;const i=r.Fa.get(e);return i?(r.sharedClientState.addLocalQueryTarget(i.targetId),s=i.view.Da()):s=await zm(r,e,n,!0),s}async function KI(t,e){const n=Jm(t);await zm(n,e,!0,!1)}async function zm(t,e,n,r){const s=await hI(t.localStore,an(e)),i=s.targetId,a=t.sharedClientState.addLocalQueryTarget(i,n);let l;return r&&(l=await WI(t,e,i,a==="current",s.resumeToken)),t.isPrimaryClient&&n&&Lm(t.remoteStore,s),l}async function WI(t,e,n,r,s){t.Ka=(p,g,y)=>async function(N,O,q,U){let G=O.view.ma(q);G.ns&&(G=await Dd(N.localStore,O.query,!1).then(({documents:I})=>O.view.ma(I,G)));const J=U&&U.targetChanges.get(O.targetId),ge=U&&U.targetMismatches.get(O.targetId)!=null,_e=O.view.applyChanges(G,N.isPrimaryClient,J,ge);return Bd(N,O.targetId,_e.wa),_e.snapshot}(t,p,g,y);const i=await Dd(t.localStore,e,!0),a=new jI(e,i.Ts),l=a.ma(i.documents),c=Pi.createSynthesizedTargetChangeForCurrentChange(n,r&&t.onlineState!=="Offline",s),h=a.applyChanges(l,t.isPrimaryClient,c);Bd(t,n,h.wa);const d=new $I(e,n,a);return t.Fa.set(e,d),t.Ma.has(n)?t.Ma.get(n).push(e):t.Ma.set(n,[e]),h.snapshot}async function GI(t,e,n){const r=pe(t),s=r.Fa.get(e),i=r.Ma.get(s.targetId);if(i.length>1)return r.Ma.set(s.targetId,i.filter(a=>!la(a,e))),void r.Fa.delete(e);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await Jl(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),n&&jc(r.remoteStore,s.targetId),Xl(r,s.targetId)}).catch(Ai)):(Xl(r,s.targetId),await Jl(r.localStore,s.targetId,!0))}async function QI(t,e){const n=pe(t),r=n.Fa.get(e),s=n.Ma.get(r.targetId);n.isPrimaryClient&&s.length===1&&(n.sharedClientState.removeLocalQueryTarget(r.targetId),jc(n.remoteStore,r.targetId))}async function JI(t,e,n){const r=rb(t);try{const s=await function(a,l){const c=pe(a),h=at.now(),d=l.reduce((y,x)=>y.add(x.key),be());let p,g;return c.persistence.runTransaction("Locally write mutations","readwrite",y=>{let x=Pn(),N=be();return c.cs.getEntries(y,d).next(O=>{x=O,x.forEach((q,U)=>{U.isValidDocument()||(N=N.add(q))})}).next(()=>c.localDocuments.getOverlayedDocuments(y,x)).next(O=>{p=O;const q=[];for(const U of l){const G=m0(U,p.get(U.key).overlayedDocument);G!=null&&q.push(new hr(U.key,G,nm(G.value.mapValue),Nt.exists(!0)))}return c.mutationQueue.addMutationBatch(y,h,q,l)}).next(O=>{g=O;const q=O.applyToLocalDocumentSet(p,N);return c.documentOverlayCache.saveOverlays(y,O.batchId,q)})}).then(()=>({batchId:g.batchId,changes:pm(p)}))}(r.localStore,e);r.sharedClientState.addPendingMutation(s.batchId),function(a,l,c){let h=a.Ba[a.currentUser.toKey()];h||(h=new Xe(Ve)),h=h.insert(l,c),a.Ba[a.currentUser.toKey()]=h}(r,s.batchId,n),await ki(r,s.changes),await ga(r.remoteStore)}catch(s){const i=Kc(s,"Failed to persist write");n.reject(i)}}async function Km(t,e){const n=pe(t);try{const r=await lI(n.localStore,e);e.targetChanges.forEach((s,i)=>{const a=n.Na.get(i);a&&(Be(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1),s.addedDocuments.size>0?a.va=!0:s.modifiedDocuments.size>0?Be(a.va):s.removedDocuments.size>0&&(Be(a.va),a.va=!1))}),await ki(n,r,e)}catch(r){await Ai(r)}}function Ud(t,e,n){const r=pe(t);if(r.isPrimaryClient&&n===0||!r.isPrimaryClient&&n===1){const s=[];r.Fa.forEach((i,a)=>{const l=a.view.Z_(e);l.snapshot&&s.push(l.snapshot)}),function(a,l){const c=pe(a);c.onlineState=l;let h=!1;c.queries.forEach((d,p)=>{for(const g of p.j_)g.Z_(l)&&(h=!0)}),h&&Wc(c)}(r.eventManager,e),s.length&&r.Ca.d_(s),r.onlineState=e,r.isPrimaryClient&&r.sharedClientState.setOnlineState(e)}}async function YI(t,e,n){const r=pe(t);r.sharedClientState.updateQueryState(e,"rejected",n);const s=r.Na.get(e),i=s&&s.key;if(i){let a=new Xe(ae.comparator);a=a.insert(i,It.newNoDocument(i,fe.min()));const l=be().add(i),c=new fa(fe.min(),new Map,new Xe(Ve),a,l);await Km(r,c),r.Oa=r.Oa.remove(i),r.Na.delete(e),Gc(r)}else await Jl(r.localStore,e,!1).then(()=>Xl(r,e,n)).catch(Ai)}async function XI(t,e){const n=pe(t),r=e.batch.batchId;try{const s=await aI(n.localStore,e);Gm(n,r,null),Wm(n,r),n.sharedClientState.updateMutationState(r,"acknowledged"),await ki(n,s)}catch(s){await Ai(s)}}async function ZI(t,e,n){const r=pe(t);try{const s=await function(a,l){const c=pe(a);return c.persistence.runTransaction("Reject batch","readwrite-primary",h=>{let d;return c.mutationQueue.lookupMutationBatch(h,l).next(p=>(Be(p!==null),d=p.keys(),c.mutationQueue.removeMutationBatch(h,p))).next(()=>c.mutationQueue.performConsistencyCheck(h)).next(()=>c.documentOverlayCache.removeOverlaysForBatchId(h,d,l)).next(()=>c.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(h,d)).next(()=>c.localDocuments.getDocuments(h,d))})}(r.localStore,e);Gm(r,e,n),Wm(r,e),r.sharedClientState.updateMutationState(e,"rejected",n),await ki(r,s)}catch(s){await Ai(s)}}function Wm(t,e){(t.ka.get(e)||[]).forEach(n=>{n.resolve()}),t.ka.delete(e)}function Gm(t,e,n){const r=pe(t);let s=r.Ba[r.currentUser.toKey()];if(s){const i=s.get(e);i&&(n?i.reject(n):i.resolve(),s=s.remove(e)),r.Ba[r.currentUser.toKey()]=s}}function Xl(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(const r of t.Ma.get(e))t.Fa.delete(r),n&&t.Ca.$a(r,n);t.Ma.delete(e),t.isPrimaryClient&&t.La.gr(e).forEach(r=>{t.La.containsKey(r)||Qm(t,r)})}function Qm(t,e){t.xa.delete(e.path.canonicalString());const n=t.Oa.get(e);n!==null&&(jc(t.remoteStore,n),t.Oa=t.Oa.remove(e),t.Na.delete(n),Gc(t))}function Bd(t,e,n){for(const r of n)r instanceof qm?(t.La.addReference(r.key,e),eb(t,r)):r instanceof Hm?(se("SyncEngine","Document no longer in limbo: "+r.key),t.La.removeReference(r.key,e),t.La.containsKey(r.key)||Qm(t,r.key)):he()}function eb(t,e){const n=e.key,r=n.path.canonicalString();t.Oa.get(n)||t.xa.has(r)||(se("SyncEngine","New document in limbo: "+n),t.xa.add(r),Gc(t))}function Gc(t){for(;t.xa.size>0&&t.Oa.size<t.maxConcurrentLimboResolutions;){const e=t.xa.values().next().value;t.xa.delete(e);const n=new ae(Ge.fromString(e)),r=t.qa.next();t.Na.set(r,new qI(n)),t.Oa=t.Oa.insert(n,r),Lm(t.remoteStore,new Gn(an(cm(n.path)),r,"TargetPurposeLimboResolution",Pc.oe))}}async function ki(t,e,n){const r=pe(t),s=[],i=[],a=[];r.Fa.isEmpty()||(r.Fa.forEach((l,c)=>{a.push(r.Ka(c,e,n).then(h=>{var d;if((h||n)&&r.isPrimaryClient){const p=h?!h.fromCache:(d=n==null?void 0:n.targetChanges.get(c.targetId))===null||d===void 0?void 0:d.current;r.sharedClientState.updateQueryState(c.targetId,p?"current":"not-current")}if(h){s.push(h);const p=Bc.Wi(c.targetId,h);i.push(p)}}))}),await Promise.all(a),r.Ca.d_(s),await async function(c,h){const d=pe(c);try{await d.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>H.forEach(h,g=>H.forEach(g.$i,y=>d.persistence.referenceDelegate.addReference(p,g.targetId,y)).next(()=>H.forEach(g.Ui,y=>d.persistence.referenceDelegate.removeReference(p,g.targetId,y)))))}catch(p){if(!Ri(p))throw p;se("LocalStore","Failed to update sequence numbers: "+p)}for(const p of h){const g=p.targetId;if(!p.fromCache){const y=d.os.get(g),x=y.snapshotVersion,N=y.withLastLimboFreeSnapshotVersion(x);d.os=d.os.insert(g,N)}}}(r.localStore,i))}async function tb(t,e){const n=pe(t);if(!n.currentUser.isEqual(e)){se("SyncEngine","User change. New user:",e.toKey());const r=await Vm(n.localStore,e);n.currentUser=e,function(i,a){i.ka.forEach(l=>{l.forEach(c=>{c.reject(new re(F.CANCELLED,a))})}),i.ka.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,r.removedBatchIds,r.addedBatchIds),await ki(n,r.hs)}}function nb(t,e){const n=pe(t),r=n.Na.get(e);if(r&&r.va)return be().add(r.key);{let s=be();const i=n.Ma.get(e);if(!i)return s;for(const a of i){const l=n.Fa.get(a);s=s.unionWith(l.view.Va)}return s}}function Jm(t){const e=pe(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=Km.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=nb.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=YI.bind(null,e),e.Ca.d_=FI.bind(null,e.eventManager),e.Ca.$a=UI.bind(null,e.eventManager),e}function rb(t){const e=pe(t);return e.remoteStore.remoteSyncer.applySuccessfulWrite=XI.bind(null,e),e.remoteStore.remoteSyncer.rejectFailedWrite=ZI.bind(null,e),e}class Fo{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=pa(e.databaseInfo.databaseId),this.sharedClientState=this.Wa(e),this.persistence=this.Ga(e),await this.persistence.start(),this.localStore=this.za(e),this.gcScheduler=this.ja(e,this.localStore),this.indexBackfillerScheduler=this.Ha(e,this.localStore)}ja(e,n){return null}Ha(e,n){return null}za(e){return oI(this.persistence,new sI,e.initialUser,this.serializer)}Ga(e){return new tI(Uc.Zr,this.serializer)}Wa(e){return new fI}async terminate(){var e,n;(e=this.gcScheduler)===null||e===void 0||e.stop(),(n=this.indexBackfillerScheduler)===null||n===void 0||n.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Fo.provider={build:()=>new Fo};class Zl{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Ud(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=tb.bind(null,this.syncEngine),await VI(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new OI}()}createDatastore(e){const n=pa(e.databaseInfo.databaseId),r=function(i){return new _I(i)}(e.databaseInfo);return function(i,a,l,c){return new EI(i,a,l,c)}(e.authCredentials,e.appCheckCredentials,r,n)}createRemoteStore(e){return function(r,s,i,a,l){return new TI(r,s,i,a,l)}(this.localStore,this.datastore,e.asyncQueue,n=>Ud(this.syncEngine,n,0),function(){return Nd.D()?new Nd:new pI}())}createSyncEngine(e,n){return function(s,i,a,l,c,h,d){const p=new HI(s,i,a,l,c,h);return d&&(p.Qa=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){var e,n;await async function(s){const i=pe(s);se("RemoteStore","RemoteStore shutting down."),i.L_.add(5),await Ci(i),i.k_.shutdown(),i.q_.set("Unknown")}(this.remoteStore),(e=this.datastore)===null||e===void 0||e.terminate(),(n=this.eventManager)===null||n===void 0||n.terminate()}}Zl.provider={build:()=>new Zl};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class sb{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ya(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ya(this.observer.error,e):Sn("Uncaught Error in snapshot listener:",e.toString()))}Za(){this.muted=!0}Ya(e,n){setTimeout(()=>{this.muted||e(n)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ib{constructor(e,n,r,s,i){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=r,this.databaseInfo=s,this.user=wt.UNAUTHENTICATED,this.clientId=Zp.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=i,this.authCredentials.start(r,async a=>{se("FirestoreClient","Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(se("FirestoreClient","Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();const e=new Zn;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){const r=Kc(n,"Failed to shutdown persistence");e.reject(r)}}),e.promise}}async function pl(t,e){t.asyncQueue.verifyOperationInProgress(),se("FirestoreClient","Initializing OfflineComponentProvider");const n=t.configuration;await e.initialize(n);let r=n.initialUser;t.setCredentialChangeListener(async s=>{r.isEqual(s)||(await Vm(e.localStore,s),r=s)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function jd(t,e){t.asyncQueue.verifyOperationInProgress();const n=await ob(t);se("FirestoreClient","Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(r=>Od(e.remoteStore,r)),t.setAppCheckTokenChangeListener((r,s)=>Od(e.remoteStore,s)),t._onlineComponents=e}async function ob(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){se("FirestoreClient","Using user provided OfflineComponentProvider");try{await pl(t,t._uninitializedComponentsProvider._offline)}catch(e){const n=e;if(!function(s){return s.name==="FirebaseError"?s.code===F.FAILED_PRECONDITION||s.code===F.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(n))throw n;ls("Error using user provided cache. Falling back to memory cache: "+n),await pl(t,new Fo)}}else se("FirestoreClient","Using default OfflineComponentProvider"),await pl(t,new Fo);return t._offlineComponents}async function Ym(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(se("FirestoreClient","Using user provided OnlineComponentProvider"),await jd(t,t._uninitializedComponentsProvider._online)):(se("FirestoreClient","Using default OnlineComponentProvider"),await jd(t,new Zl))),t._onlineComponents}function ab(t){return Ym(t).then(e=>e.syncEngine)}async function lb(t){const e=await Ym(t),n=e.eventManager;return n.onListen=zI.bind(null,e.syncEngine),n.onUnlisten=GI.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=KI.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=QI.bind(null,e.syncEngine),n}function cb(t,e,n={}){const r=new Zn;return t.asyncQueue.enqueueAndForget(async()=>function(i,a,l,c,h){const d=new sb({next:g=>{d.Za(),a.enqueueAndForget(()=>LI(i,p)),g.fromCache&&c.source==="server"?h.reject(new re(F.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):h.resolve(g)},error:g=>h.reject(g)}),p=new BI(l,d,{includeMetadataChanges:!0,_a:!0});return MI(i,p)}(await lb(t),t.asyncQueue,e,n,r)),r.promise}/**
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
 */function Xm(t){const e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const $d=new Map;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zm(t,e,n){if(!n)throw new re(F.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function ub(t,e,n,r){if(e===!0&&r===!0)throw new re(F.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function qd(t){if(!ae.isDocumentKey(t))throw new re(F.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${t} has ${t.length}.`)}function Hd(t){if(ae.isDocumentKey(t))throw new re(F.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function _a(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{const e=function(r){return r.constructor?r.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":he()}function ar(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new re(F.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const n=_a(t);throw new re(F.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zd{constructor(e){var n,r;if(e.host===void 0){if(e.ssl!==void 0)throw new re(F.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host="firestore.googleapis.com",this.ssl=!0}else this.host=e.host,this.ssl=(n=e.ssl)===null||n===void 0||n;if(this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=41943040;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<1048576)throw new re(F.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}ub("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Xm((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(i){if(i.timeoutSeconds!==void 0){if(isNaN(i.timeoutSeconds))throw new re(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (must not be NaN)`);if(i.timeoutSeconds<5)throw new re(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (minimum allowed value is 5)`);if(i.timeoutSeconds>30)throw new re(F.INVALID_ARGUMENT,`invalid long polling timeout: ${i.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class ya{constructor(e,n,r,s){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new zd({}),this._settingsFrozen=!1,this._terminateTask="notTerminated"}get app(){if(!this._app)throw new re(F.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new re(F.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new zd(e),e.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new IT;switch(r.type){case"firstParty":return new ST(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new re(F.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){const r=$d.get(n);r&&(se("ComponentProvider","Removing Datastore"),$d.delete(n),r.terminate())}(this),Promise.resolve()}}function hb(t,e,n,r={}){var s;const i=(t=ar(t,ya))._getSettings(),a=`${e}:${n}`;if(i.host!=="firestore.googleapis.com"&&i.host!==a&&ls("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used."),t._setSettings(Object.assign(Object.assign({},i),{host:a,ssl:!1})),r.mockUserToken){let l,c;if(typeof r.mockUserToken=="string")l=r.mockUserToken,c=wt.MOCK_USER;else{l=YE(r.mockUserToken,(s=t._app)===null||s===void 0?void 0:s.options.projectId);const h=r.mockUserToken.sub||r.mockUserToken.user_id;if(!h)throw new re(F.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");c=new wt(h)}t._authCredentials=new bT(new Xp(l,c))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nr{constructor(e,n,r){this.converter=n,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new Nr(this.firestore,e,this._query)}}class jt{constructor(e,n,r){this.converter=n,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new er(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new jt(this.firestore,e,this._key)}}class er extends Nr{constructor(e,n,r){super(e,n,cm(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new jt(this.firestore,null,new ae(e))}withConverter(e){return new er(this.firestore,e,this._path)}}function Ue(t,e,...n){if(t=St(t),Zm("collection","path",e),t instanceof ya){const r=Ge.fromString(e,...n);return Hd(r),new er(t,null,r)}{if(!(t instanceof jt||t instanceof er))throw new re(F.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Ge.fromString(e,...n));return Hd(r),new er(t.firestore,null,r)}}function Qe(t,e,...n){if(t=St(t),arguments.length===1&&(e=Zp.newId()),Zm("doc","path",e),t instanceof ya){const r=Ge.fromString(e,...n);return qd(r),new jt(t,null,new ae(r))}{if(!(t instanceof jt||t instanceof er))throw new re(F.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=t._path.child(Ge.fromString(e,...n));return qd(r),new jt(t.firestore,t instanceof er?t.converter:null,new ae(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Kd{constructor(e=Promise.resolve()){this.Pu=[],this.Iu=!1,this.Tu=[],this.Eu=null,this.du=!1,this.Au=!1,this.Ru=[],this.t_=new Om(this,"async_queue_retry"),this.Vu=()=>{const r=fl();r&&se("AsyncQueue","Visibility state changed to "+r.visibilityState),this.t_.jo()},this.mu=e;const n=fl();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this.Vu)}get isShuttingDown(){return this.Iu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.fu(),this.gu(e)}enterRestrictedMode(e){if(!this.Iu){this.Iu=!0,this.Au=e||!1;const n=fl();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this.Vu)}}enqueue(e){if(this.fu(),this.Iu)return new Promise(()=>{});const n=new Zn;return this.gu(()=>this.Iu&&this.Au?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Pu.push(e),this.pu()))}async pu(){if(this.Pu.length!==0){try{await this.Pu[0](),this.Pu.shift(),this.t_.reset()}catch(e){if(!Ri(e))throw e;se("AsyncQueue","Operation failed with retryable error: "+e)}this.Pu.length>0&&this.t_.Go(()=>this.pu())}}gu(e){const n=this.mu.then(()=>(this.du=!0,e().catch(r=>{this.Eu=r,this.du=!1;const s=function(a){let l=a.message||"";return a.stack&&(l=a.stack.includes(a.message)?a.stack:a.message+`
`+a.stack),l}(r);throw Sn("INTERNAL UNHANDLED ERROR: ",s),r}).then(r=>(this.du=!1,r))));return this.mu=n,n}enqueueAfterDelay(e,n,r){this.fu(),this.Ru.indexOf(e)>-1&&(n=0);const s=zc.createAndSchedule(this,e,n,r,i=>this.yu(i));return this.Tu.push(s),s}fu(){this.Eu&&he()}verifyOperationInProgress(){}async wu(){let e;do e=this.mu,await e;while(e!==this.mu)}Su(e){for(const n of this.Tu)if(n.timerId===e)return!0;return!1}bu(e){return this.wu().then(()=>{this.Tu.sort((n,r)=>n.targetTimeMs-r.targetTimeMs);for(const n of this.Tu)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.wu()})}Du(e){this.Ru.push(e)}yu(e){const n=this.Tu.indexOf(e);this.Tu.splice(n,1)}}class Es extends ya{constructor(e,n,r,s){super(e,n,r,s),this.type="firestore",this._queue=new Kd,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new Kd(e),this._firestoreClient=void 0,await e}}}function db(t,e){const n=typeof t=="object"?t:qp(),r=typeof t=="string"?t:e||"(default)",s=Rc(n,"firestore").getImmediate({identifier:r});if(!s._initialized){const i=QE("firestore");i&&hb(s,...i)}return s}function Qc(t){if(t._terminated)throw new re(F.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||fb(t),t._firestoreClient}function fb(t){var e,n,r;const s=t._freezeSettings(),i=function(l,c,h,d){return new BT(l,c,h,d.host,d.ssl,d.experimentalForceLongPolling,d.experimentalAutoDetectLongPolling,Xm(d.experimentalLongPollingOptions),d.useFetchStreams)}(t._databaseId,((e=t._app)===null||e===void 0?void 0:e.options.appId)||"",t._persistenceKey,s);t._componentsProvider||!((n=s.localCache)===null||n===void 0)&&n._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(t._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),t._firestoreClient=new ib(t._authCredentials,t._appCheckCredentials,t._queue,i,t._componentsProvider&&function(l){const c=l==null?void 0:l._online.build();return{_offline:l==null?void 0:l._offline.build(c),_online:c}}(t._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ps{constructor(e){this._byteString=e}static fromBase64String(e){try{return new ps(_t.fromBase64String(e))}catch(n){throw new re(F.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new ps(_t.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class va{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new re(F.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new mt(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */class Jc{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new re(F.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new re(F.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}toJSON(){return{latitude:this._lat,longitude:this._long}}_compareTo(e){return Ve(this._lat,e._lat)||Ve(this._long,e._long)}}/**
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
 */class Yc{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(r,s){if(r.length!==s.length)return!1;for(let i=0;i<r.length;++i)if(r[i]!==s[i])return!1;return!0}(this._values,e._values)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pb=/^__.*__$/;class mb{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return this.fieldMask!==null?new hr(e,this.data,this.fieldMask,n,this.fieldTransforms):new Si(e,this.data,n,this.fieldTransforms)}}class eg{constructor(e,n,r){this.data=e,this.fieldMask=n,this.fieldTransforms=r}toMutation(e,n){return new hr(e,this.data,this.fieldMask,n,this.fieldTransforms)}}function tg(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw he()}}class Xc{constructor(e,n,r,s,i,a){this.settings=e,this.databaseId=n,this.serializer=r,this.ignoreUndefinedProperties=s,i===void 0&&this.vu(),this.fieldTransforms=i||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Cu(){return this.settings.Cu}Fu(e){return new Xc(Object.assign(Object.assign({},this.settings),e),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Mu(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),s=this.Fu({path:r,xu:!1});return s.Ou(e),s}Nu(e){var n;const r=(n=this.path)===null||n===void 0?void 0:n.child(e),s=this.Fu({path:r,xu:!1});return s.vu(),s}Lu(e){return this.Fu({path:void 0,xu:!0})}Bu(e){return Uo(e,this.settings.methodName,this.settings.ku||!1,this.path,this.settings.qu)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}vu(){if(this.path)for(let e=0;e<this.path.length;e++)this.Ou(this.path.get(e))}Ou(e){if(e.length===0)throw this.Bu("Document fields must not be empty");if(tg(this.Cu)&&pb.test(e))throw this.Bu('Document fields cannot begin and end with "__"')}}class gb{constructor(e,n,r){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=r||pa(e)}Qu(e,n,r,s=!1){return new Xc({Cu:e,methodName:n,qu:r,path:mt.emptyPath(),xu:!1,ku:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function wa(t){const e=t._freezeSettings(),n=pa(t._databaseId);return new gb(t._databaseId,!!e.ignoreUndefinedProperties,n)}function Zc(t,e,n,r,s,i={}){const a=t.Qu(i.merge||i.mergeFields?2:0,e,n,s);tu("Data must be an object, but it was:",a,r);const l=ng(r,a);let c,h;if(i.merge)c=new Bt(a.fieldMask),h=a.fieldTransforms;else if(i.mergeFields){const d=[];for(const p of i.mergeFields){const g=ec(e,p,n);if(!a.contains(g))throw new re(F.INVALID_ARGUMENT,`Field '${g}' is specified in your field mask but missing from your input data.`);sg(d,g)||d.push(g)}c=new Bt(d),h=a.fieldTransforms.filter(p=>c.covers(p.field))}else c=null,h=a.fieldTransforms;return new mb(new Vt(l),c,h)}class Ta extends Ea{_toFieldTransform(e){if(e.Cu!==2)throw e.Cu===1?e.Bu(`${this._methodName}() can only appear at the top level of your update data`):e.Bu(`${this._methodName}() cannot be used with set() unless you pass {merge:true}`);return e.fieldMask.push(e.path),null}isEqual(e){return e instanceof Ta}}class eu extends Ea{_toFieldTransform(e){return new h0(e.path,new _i)}isEqual(e){return e instanceof eu}}function _b(t,e,n,r){const s=t.Qu(1,e,n);tu("Data must be an object, but it was:",s,r);const i=[],a=Vt.empty();Dr(r,(c,h)=>{const d=nu(e,c,n);h=St(h);const p=s.Nu(d);if(h instanceof Ta)i.push(d);else{const g=xi(h,p);g!=null&&(i.push(d),a.set(d,g))}});const l=new Bt(i);return new eg(a,l,s.fieldTransforms)}function yb(t,e,n,r,s,i){const a=t.Qu(1,e,n),l=[ec(e,r,n)],c=[s];if(i.length%2!=0)throw new re(F.INVALID_ARGUMENT,`Function ${e}() needs to be called with an even number of arguments that alternate between field names and values.`);for(let g=0;g<i.length;g+=2)l.push(ec(e,i[g])),c.push(i[g+1]);const h=[],d=Vt.empty();for(let g=l.length-1;g>=0;--g)if(!sg(h,l[g])){const y=l[g];let x=c[g];x=St(x);const N=a.Nu(y);if(x instanceof Ta)h.push(y);else{const O=xi(x,N);O!=null&&(h.push(y),d.set(y,O))}}const p=new Bt(h);return new eg(d,p,a.fieldTransforms)}function vb(t,e,n,r=!1){return xi(n,t.Qu(r?4:3,e))}function xi(t,e){if(rg(t=St(t)))return tu("Unsupported field value:",e,t),ng(t,e);if(t instanceof Ea)return function(r,s){if(!tg(s.Cu))throw s.Bu(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.Bu(`${r._methodName}() is not currently supported inside arrays`);const i=r._toFieldTransform(s);i&&s.fieldTransforms.push(i)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.xu&&e.Cu!==4)throw e.Bu("Nested arrays are not supported");return function(r,s){const i=[];let a=0;for(const l of r){let c=xi(l,s.Lu(a));c==null&&(c={nullValue:"NULL_VALUE"}),i.push(c),a++}return{arrayValue:{values:i}}}(t,e)}return function(r,s){if((r=St(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return l0(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const i=at.fromDate(r);return{timestampValue:Mo(s.serializer,i)}}if(r instanceof at){const i=new at(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:Mo(s.serializer,i)}}if(r instanceof Jc)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof ps)return{bytesValue:Rm(s.serializer,r._byteString)};if(r instanceof jt){const i=s.databaseId,a=r.firestore._databaseId;if(!a.isEqual(i))throw s.Bu(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${i.projectId}/${i.database}`);return{referenceValue:Lc(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof Yc)return function(a,l){return{mapValue:{fields:{__type__:{stringValue:"__vector__"},value:{arrayValue:{values:a.toArray().map(c=>{if(typeof c!="number")throw l.Bu("VectorValues must only contain numeric values.");return Nc(l.serializer,c)})}}}}}}(r,s);throw s.Bu(`Unsupported field value: ${_a(r)}`)}(t,e)}function ng(t,e){const n={};return em(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):Dr(t,(r,s)=>{const i=xi(s,e.Mu(r));i!=null&&(n[r]=i)}),{mapValue:{fields:n}}}function rg(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof at||t instanceof Jc||t instanceof ps||t instanceof jt||t instanceof Ea||t instanceof Yc)}function tu(t,e,n){if(!rg(n)||!function(s){return typeof s=="object"&&s!==null&&(Object.getPrototypeOf(s)===Object.prototype||Object.getPrototypeOf(s)===null)}(n)){const r=_a(n);throw r==="an object"?e.Bu(t+" a custom object"):e.Bu(t+" "+r)}}function ec(t,e,n){if((e=St(e))instanceof va)return e._internalPath;if(typeof e=="string")return nu(t,e);throw Uo("Field path arguments must be of type string or ",t,!1,void 0,n)}const Eb=new RegExp("[~\\*/\\[\\]]");function nu(t,e,n){if(e.search(Eb)>=0)throw Uo(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new va(...e.split("."))._internalPath}catch{throw Uo(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function Uo(t,e,n,r,s){const i=r&&!r.isEmpty(),a=s!==void 0;let l=`Function ${e}() called with invalid data`;n&&(l+=" (via `toFirestore()`)"),l+=". ";let c="";return(i||a)&&(c+=" (found",i&&(c+=` in field ${r}`),a&&(c+=` in document ${s}`),c+=")"),new re(F.INVALID_ARGUMENT,l+t+c)}function sg(t,e){return t.some(n=>n.isEqual(e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ig{constructor(e,n,r,s,i){this._firestore=e,this._userDataWriter=n,this._key=r,this._document=s,this._converter=i}get id(){return this._key.path.lastSegment()}get ref(){return new jt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new wb(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const n=this._document.data.field(Ia("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}}class wb extends ig{data(){return super.data()}}function Ia(t,e){return typeof e=="string"?nu(t,e):e instanceof va?e._internalPath:e._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tb(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new re(F.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class ru{}class og extends ru{}function ag(t,e,...n){let r=[];e instanceof ru&&r.push(e),r=r.concat(n),function(i){const a=i.filter(c=>c instanceof su).length,l=i.filter(c=>c instanceof ba).length;if(a>1||a>0&&l>0)throw new re(F.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)t=s._apply(t);return t}class ba extends og{constructor(e,n,r){super(),this._field=e,this._op=n,this._value=r,this.type="where"}static _create(e,n,r){return new ba(e,n,r)}_apply(e){const n=this._parse(e);return lg(e._query,n),new Nr(e.firestore,e.converter,Hl(e._query,n))}_parse(e){const n=wa(e.firestore);return function(i,a,l,c,h,d,p){let g;if(h.isKeyField()){if(d==="array-contains"||d==="array-contains-any")throw new re(F.INVALID_ARGUMENT,`Invalid Query. You can't perform '${d}' queries on documentId().`);if(d==="in"||d==="not-in"){Gd(p,d);const y=[];for(const x of p)y.push(Wd(c,i,x));g={arrayValue:{values:y}}}else g=Wd(c,i,p)}else d!=="in"&&d!=="not-in"&&d!=="array-contains-any"||Gd(p,d),g=vb(l,a,p,d==="in"||d==="not-in");return st.create(h,d,g)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}}function Ib(t,e,n){const r=e,s=Ia("where",t);return ba._create(s,r,n)}class su extends ru{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new su(e,n)}_parse(e){const n=this._queryConstraints.map(r=>r._parse(e)).filter(r=>r.getFilters().length>0);return n.length===1?n[0]:tn.create(n,this._getOperator())}_apply(e){const n=this._parse(e);return n.getFilters().length===0?e:(function(s,i){let a=s;const l=i.getFlattenedFilters();for(const c of l)lg(a,c),a=Hl(a,c)}(e._query,n),new Nr(e.firestore,e.converter,Hl(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class iu extends og{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new iu(e,n)}_apply(e){const n=function(s,i,a){if(s.startAt!==null)throw new re(F.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(s.endAt!==null)throw new re(F.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new gi(i,a)}(e._query,this._field,this._direction);return new Nr(e.firestore,e.converter,function(s,i){const a=s.explicitOrderBy.concat([i]);return new _s(s.path,s.collectionGroup,a,s.filters.slice(),s.limit,s.limitType,s.startAt,s.endAt)}(e._query,n))}}function bb(t,e="asc"){const n=e,r=Ia("orderBy",t);return iu._create(r,n)}function Wd(t,e,n){if(typeof(n=St(n))=="string"){if(n==="")throw new re(F.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!um(e)&&n.indexOf("/")!==-1)throw new re(F.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);const r=e.path.child(Ge.fromString(n));if(!ae.isDocumentKey(r))throw new re(F.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return md(t,new ae(r))}if(n instanceof jt)return md(t,n._key);throw new re(F.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${_a(n)}.`)}function Gd(t,e){if(!Array.isArray(t)||t.length===0)throw new re(F.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function lg(t,e){const n=function(s,i){for(const a of s)for(const l of a.getFlattenedFilters())if(i.indexOf(l.op)>=0)return l.op;return null}(t.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new re(F.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new re(F.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}class Ab{convertValue(e,n="none"){switch(Pr(e)){case 0:return null;case 1:return e.booleanValue;case 2:return et(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(Sr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw he()}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){const r={};return Dr(e,(s,i)=>{r[s]=this.convertValue(i,n)}),r}convertVectorValue(e){var n,r,s;const i=(s=(r=(n=e.fields)===null||n===void 0?void 0:n.value.arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(a=>et(a.doubleValue));return new Yc(i)}convertGeoPoint(e){return new Jc(et(e.latitude),et(e.longitude))}convertArray(e,n){return(e.values||[]).map(r=>this.convertValue(r,n))}convertServerTimestamp(e,n){switch(n){case"previous":const r=kc(e);return r==null?null:this.convertValue(r,n);case"estimate":return this.convertTimestamp(fi(e));default:return null}}convertTimestamp(e){const n=ir(e);return new at(n.seconds,n.nanos)}convertDocumentKey(e,n){const r=Ge.fromString(e);Be(Dm(r));const s=new pi(r.get(1),r.get(3)),i=new ae(r.popFirst(5));return s.isEqual(n)||Sn(`Document ${i} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ou(t,e,n){let r;return r=t?n&&(n.merge||n.mergeFields)?t.toFirestore(e,n):t.toFirestore(e):e,r}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class so{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class Rb extends ig{constructor(e,n,r,s,i,a){super(e,n,r,s,a),this._firestore=e,this._firestoreImpl=e,this.metadata=i}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const n=new yo(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){const r=this._document.data.field(Ia("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,n.serverTimestamps)}}}class yo extends Rb{data(e={}){return super.data(e)}}class Sb{constructor(e,n,r,s){this._firestore=e,this._userDataWriter=n,this._snapshot=s,this.metadata=new so(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(r=>{e.call(n,new yo(this._firestore,this._userDataWriter,r.key,r,new so(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){const n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new re(F.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(s,i){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(l=>{const c=new yo(s._firestore,s._userDataWriter,l.doc.key,l.doc,new so(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);return l.doc,{type:"added",doc:c,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(l=>i||l.type!==3).map(l=>{const c=new yo(s._firestore,s._userDataWriter,l.doc.key,l.doc,new so(s._snapshot.mutatedKeys.has(l.doc.key),s._snapshot.fromCache),s.query.converter);let h=-1,d=-1;return l.type!==0&&(h=a.indexOf(l.doc.key),a=a.delete(l.doc.key)),l.type!==1&&(a=a.add(l.doc),d=a.indexOf(l.doc.key)),{type:Pb(l.type),doc:c,oldIndex:h,newIndex:d}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}}function Pb(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return he()}}class Cb extends Ab{constructor(e){super(),this.firestore=e}convertBytes(e){return new ps(e)}convertReference(e){const n=this.convertDocumentKey(e,this.firestore._databaseId);return new jt(this.firestore,null,n)}}function Ye(t){t=ar(t,Nr);const e=ar(t.firestore,Es),n=Qc(e),r=new Cb(e);return Tb(t._query),cb(n,t._query).then(s=>new Sb(e,r,t,s))}function Yt(t,e,n){t=ar(t,jt);const r=ar(t.firestore,Es),s=ou(t.converter,e,n);return Aa(r,[Zc(wa(r),"setDoc",t._key,s,t.converter!==null,n).toMutation(t._key,Nt.none())])}function Bo(t){return Aa(ar(t.firestore,Es),[new da(t._key,Nt.none())])}function kb(t,e){const n=ar(t.firestore,Es),r=Qe(t),s=ou(t.converter,e);return Aa(n,[Zc(wa(t.firestore),"addDoc",r._key,s,t.converter!==null,{}).toMutation(r._key,Nt.exists(!1))]).then(()=>r)}function Aa(t,e){return function(r,s){const i=new Zn;return r.asyncQueue.enqueueAndForget(async()=>JI(await ab(r),s,i)),i.promise}(Qc(t),e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xb{constructor(e,n){this._firestore=e,this._commitHandler=n,this._mutations=[],this._committed=!1,this._dataReader=wa(e)}set(e,n,r){this._verifyNotCommitted();const s=ml(e,this._firestore),i=ou(s.converter,n,r),a=Zc(this._dataReader,"WriteBatch.set",s._key,i,s.converter!==null,r);return this._mutations.push(a.toMutation(s._key,Nt.none())),this}update(e,n,r,...s){this._verifyNotCommitted();const i=ml(e,this._firestore);let a;return a=typeof(n=St(n))=="string"||n instanceof va?yb(this._dataReader,"WriteBatch.update",i._key,n,r,s):_b(this._dataReader,"WriteBatch.update",i._key,n),this._mutations.push(a.toMutation(i._key,Nt.exists(!0))),this}delete(e){this._verifyNotCommitted();const n=ml(e,this._firestore);return this._mutations=this._mutations.concat(new da(n._key,Nt.none())),this}commit(){return this._verifyNotCommitted(),this._committed=!0,this._mutations.length>0?this._commitHandler(this._mutations):Promise.resolve()}_verifyNotCommitted(){if(this._committed)throw new re(F.FAILED_PRECONDITION,"A write batch can no longer be used after commit() has been called.")}}function ml(t,e){if((t=St(t)).firestore!==e)throw new re(F.INVALID_ARGUMENT,"Provided document reference is from a different Firestore instance.");return t}function cg(){return new eu("serverTimestamp")}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ug(t){return Qc(t=ar(t,Es)),new xb(t,e=>Aa(t,e))}(function(e,n=!0){(function(s){gs=s})(ms),as(new Ar("firestore",(r,{instanceIdentifier:s,options:i})=>{const a=r.getProvider("app").getImmediate(),l=new Es(new AT(r.getProvider("auth-internal")),new CT(r.getProvider("app-check-internal")),function(h,d){if(!Object.prototype.hasOwnProperty.apply(h.options,["projectId"]))throw new re(F.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new pi(h.options.projectId,d)}(a,s),a);return i=Object.assign({useFetchStreams:n},i),l._setSettings(i),l},"PUBLIC").setMultipleInstances(!0)),Xn(ud,"4.7.3",e),Xn(ud,"4.7.3","esm2017")})();function au(t,e){var n={};for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&e.indexOf(r)<0&&(n[r]=t[r]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(t);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(t,r[s])&&(n[r[s]]=t[r[s]]);return n}function hg(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const Db=hg,dg=new Ii("auth","Firebase",hg());/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const jo=new bc("@firebase/auth");function Vb(t,...e){jo.logLevel<=Se.WARN&&jo.warn(`Auth (${ms}): ${t}`,...e)}function vo(t,...e){jo.logLevel<=Se.ERROR&&jo.error(`Auth (${ms}): ${t}`,...e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cn(t,...e){throw lu(t,...e)}function cn(t,...e){return lu(t,...e)}function fg(t,e,n){const r=Object.assign(Object.assign({},Db()),{[e]:n});return new Ii("auth","Firebase",r).create(e,{appName:t.name})}function tr(t){return fg(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function lu(t,...e){if(typeof t!="string"){const n=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=t.name),t._errorFactory.create(n,...r)}return dg.create(t,...e)}function ce(t,e,...n){if(!t)throw lu(e,...n)}function wn(t){const e="INTERNAL ASSERTION FAILED: "+t;throw vo(e),new Error(e)}function kn(t,e){t||wn(e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function tc(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.href)||""}function Nb(){return Qd()==="http:"||Qd()==="https:"}function Qd(){var t;return typeof self<"u"&&((t=self.location)===null||t===void 0?void 0:t.protocol)||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ob(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(Nb()||tw()||"connection"in navigator)?navigator.onLine:!0}function Mb(){if(typeof navigator>"u")return null;const t=navigator;return t.languages&&t.languages[0]||t.language||null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Di{constructor(e,n){this.shortDelay=e,this.longDelay=n,kn(n>e,"Short delay should be less than long delay!"),this.isMobile=XE()||nw()}get(){return Ob()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function cu(t,e){kn(t.emulator,"Emulator should always be set here");const{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pg{static initialize(e,n,r){this.fetchImpl=e,n&&(this.headersImpl=n),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;wn("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;wn("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;wn("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Lb={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Fb=new Di(3e4,6e4);function Ra(t,e){return t.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:t.tenantId}):e}async function ws(t,e,n,r,s={}){return mg(t,s,async()=>{let i={},a={};r&&(e==="GET"?a=r:i={body:JSON.stringify(r)});const l=bi(Object.assign({key:t.config.apiKey},a)).slice(1),c=await t._getAdditionalHeaders();c["Content-Type"]="application/json",t.languageCode&&(c["X-Firebase-Locale"]=t.languageCode);const h=Object.assign({method:e,headers:c},i);return ew()||(h.referrerPolicy="no-referrer"),pg.fetch()(_g(t,t.config.apiHost,n,l),h)})}async function mg(t,e,n){t._canInitEmulator=!1;const r=Object.assign(Object.assign({},Lb),e);try{const s=new Ub(t),i=await Promise.race([n(),s.promise]);s.clearNetworkTimeout();const a=await i.json();if("needConfirmation"in a)throw io(t,"account-exists-with-different-credential",a);if(i.ok&&!("errorMessage"in a))return a;{const l=i.ok?a.errorMessage:a.error.message,[c,h]=l.split(" : ");if(c==="FEDERATED_USER_ID_ALREADY_LINKED")throw io(t,"credential-already-in-use",a);if(c==="EMAIL_EXISTS")throw io(t,"email-already-in-use",a);if(c==="USER_DISABLED")throw io(t,"user-disabled",a);const d=r[c]||c.toLowerCase().replace(/[_\s]+/g,"-");if(h)throw fg(t,d,h);Cn(t,d)}}catch(s){if(s instanceof Dn)throw s;Cn(t,"network-request-failed",{message:String(s)})}}async function gg(t,e,n,r,s={}){const i=await ws(t,e,n,r,s);return"mfaPendingCredential"in i&&Cn(t,"multi-factor-auth-required",{_serverResponse:i}),i}function _g(t,e,n,r){const s=`${e}${n}?${r}`;return t.config.emulator?cu(t.config,s):`${t.config.apiScheme}://${s}`}class Ub{constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,r)=>{this.timer=setTimeout(()=>r(cn(this.auth,"network-request-failed")),Fb.get())})}clearNetworkTimeout(){clearTimeout(this.timer)}}function io(t,e,n){const r={appName:t.name};n.email&&(r.email=n.email),n.phoneNumber&&(r.phoneNumber=n.phoneNumber);const s=cn(t,e,r);return s.customData._tokenResponse=n,s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Bb(t,e){return ws(t,"POST","/v1/accounts:delete",e)}async function yg(t,e){return ws(t,"POST","/v1/accounts:lookup",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ti(t){if(t)try{const e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function jb(t,e=!1){const n=St(t),r=await n.getIdToken(e),s=uu(r);ce(s&&s.exp&&s.auth_time&&s.iat,n.auth,"internal-error");const i=typeof s.firebase=="object"?s.firebase:void 0,a=i==null?void 0:i.sign_in_provider;return{claims:s,token:r,authTime:ti(gl(s.auth_time)),issuedAtTime:ti(gl(s.iat)),expirationTime:ti(gl(s.exp)),signInProvider:a||null,signInSecondFactor:(i==null?void 0:i.sign_in_second_factor)||null}}function gl(t){return Number(t)*1e3}function uu(t){const[e,n,r]=t.split(".");if(e===void 0||n===void 0||r===void 0)return vo("JWT malformed, contained fewer than 3 sections"),null;try{const s=Mp(n);return s?JSON.parse(s):(vo("Failed to decode base64 JWT payload"),null)}catch(s){return vo("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function Jd(t){const e=uu(t);return ce(e,"internal-error"),ce(typeof e.exp<"u","internal-error"),ce(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Ei(t,e,n=!1){if(n)return e;try{return await e}catch(r){throw r instanceof Dn&&$b(r)&&t.auth.currentUser===t&&await t.auth.signOut(),r}}function $b({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qb{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var n;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((n=this.user.stsTokenManager.expirationTime)!==null&&n!==void 0?n:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class nc{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=ti(this.lastLoginAt),this.creationTime=ti(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function $o(t){var e;const n=t.auth,r=await t.getIdToken(),s=await Ei(t,yg(n,{idToken:r}));ce(s==null?void 0:s.users.length,n,"internal-error");const i=s.users[0];t._notifyReloadListener(i);const a=!((e=i.providerUserInfo)===null||e===void 0)&&e.length?vg(i.providerUserInfo):[],l=zb(t.providerData,a),c=t.isAnonymous,h=!(t.email&&i.passwordHash)&&!(l!=null&&l.length),d=c?h:!1,p={uid:i.localId,displayName:i.displayName||null,photoURL:i.photoUrl||null,email:i.email||null,emailVerified:i.emailVerified||!1,phoneNumber:i.phoneNumber||null,tenantId:i.tenantId||null,providerData:l,metadata:new nc(i.createdAt,i.lastLoginAt),isAnonymous:d};Object.assign(t,p)}async function Hb(t){const e=St(t);await $o(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function zb(t,e){return[...t.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function vg(t){return t.map(e=>{var{providerId:n}=e,r=au(e,["providerId"]);return{providerId:n,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Kb(t,e){const n=await mg(t,{},async()=>{const r=bi({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:i}=t.config,a=_g(t,s,"/v1/token",`key=${i}`),l=await t._getAdditionalHeaders();return l["Content-Type"]="application/x-www-form-urlencoded",pg.fetch()(a,{method:"POST",headers:l,body:r})});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function Wb(t,e){return ws(t,"POST","/v2/accounts:revokeToken",Ra(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ts{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ce(e.idToken,"internal-error"),ce(typeof e.idToken<"u","internal-error"),ce(typeof e.refreshToken<"u","internal-error");const n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):Jd(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){ce(e.length!==0,"internal-error");const n=Jd(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(ce(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){const{accessToken:r,refreshToken:s,expiresIn:i}=await Kb(e,n);this.updateTokensAndExpiration(r,s,Number(i))}updateTokensAndExpiration(e,n,r){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,n){const{refreshToken:r,accessToken:s,expirationTime:i}=n,a=new ts;return r&&(ce(typeof r=="string","internal-error",{appName:e}),a.refreshToken=r),s&&(ce(typeof s=="string","internal-error",{appName:e}),a.accessToken=s),i&&(ce(typeof i=="number","internal-error",{appName:e}),a.expirationTime=i),a}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new ts,this.toJSON())}_performRefresh(){return wn("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ln(t,e){ce(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}class Tn{constructor(e){var{uid:n,auth:r,stsTokenManager:s}=e,i=au(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new qb(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=n,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=i.displayName||null,this.email=i.email||null,this.emailVerified=i.emailVerified||!1,this.phoneNumber=i.phoneNumber||null,this.photoURL=i.photoURL||null,this.isAnonymous=i.isAnonymous||!1,this.tenantId=i.tenantId||null,this.providerData=i.providerData?[...i.providerData]:[],this.metadata=new nc(i.createdAt||void 0,i.lastLoginAt||void 0)}async getIdToken(e){const n=await Ei(this,this.stsTokenManager.getToken(this.auth,e));return ce(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return jb(this,e)}reload(){return Hb(this)}_assign(e){this!==e&&(ce(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>Object.assign({},n)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const n=new Tn(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return n.metadata._copy(this.metadata),n}_onReload(e){ce(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),n&&await $o(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(En(this.auth.app))return Promise.reject(tr(this.auth));const e=await this.getIdToken();return await Ei(this,Bb(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){var r,s,i,a,l,c,h,d;const p=(r=n.displayName)!==null&&r!==void 0?r:void 0,g=(s=n.email)!==null&&s!==void 0?s:void 0,y=(i=n.phoneNumber)!==null&&i!==void 0?i:void 0,x=(a=n.photoURL)!==null&&a!==void 0?a:void 0,N=(l=n.tenantId)!==null&&l!==void 0?l:void 0,O=(c=n._redirectEventId)!==null&&c!==void 0?c:void 0,q=(h=n.createdAt)!==null&&h!==void 0?h:void 0,U=(d=n.lastLoginAt)!==null&&d!==void 0?d:void 0,{uid:G,emailVerified:J,isAnonymous:ge,providerData:_e,stsTokenManager:I}=n;ce(G&&I,e,"internal-error");const v=ts.fromJSON(this.name,I);ce(typeof G=="string",e,"internal-error"),Ln(p,e.name),Ln(g,e.name),ce(typeof J=="boolean",e,"internal-error"),ce(typeof ge=="boolean",e,"internal-error"),Ln(y,e.name),Ln(x,e.name),Ln(N,e.name),Ln(O,e.name),Ln(q,e.name),Ln(U,e.name);const T=new Tn({uid:G,auth:e,email:g,emailVerified:J,displayName:p,isAnonymous:ge,photoURL:x,phoneNumber:y,tenantId:N,stsTokenManager:v,createdAt:q,lastLoginAt:U});return _e&&Array.isArray(_e)&&(T.providerData=_e.map(b=>Object.assign({},b))),O&&(T._redirectEventId=O),T}static async _fromIdTokenResponse(e,n,r=!1){const s=new ts;s.updateFromServerResponse(n);const i=new Tn({uid:n.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await $o(i),i}static async _fromGetAccountInfoResponse(e,n,r){const s=n.users[0];ce(s.localId!==void 0,"internal-error");const i=s.providerUserInfo!==void 0?vg(s.providerUserInfo):[],a=!(s.email&&s.passwordHash)&&!(i!=null&&i.length),l=new ts;l.updateFromIdToken(r);const c=new Tn({uid:s.localId,auth:e,stsTokenManager:l,isAnonymous:a}),h={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:i,metadata:new nc(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(i!=null&&i.length)};return Object.assign(c,h),c}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yd=new Map;function In(t){kn(t instanceof Function,"Expected a class definition");let e=Yd.get(t);return e?(kn(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,Yd.set(t,e),e)}/**
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
 */class Eg{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){const n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}}Eg.type="NONE";const Xd=Eg;/**
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
 */function Eo(t,e,n){return`firebase:${t}:${e}:${n}`}class ns{constructor(e,n,r){this.persistence=e,this.auth=n,this.userKey=r;const{config:s,name:i}=this.auth;this.fullUserKey=Eo(this.userKey,s.apiKey,i),this.fullPersistenceKey=Eo("persistence",s.apiKey,i),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);return e?Tn._fromJSON(this.auth,e):null}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,r="authUser"){if(!n.length)return new ns(In(Xd),e,r);const s=(await Promise.all(n.map(async h=>{if(await h._isAvailable())return h}))).filter(h=>h);let i=s[0]||In(Xd);const a=Eo(r,e.config.apiKey,e.name);let l=null;for(const h of n)try{const d=await h._get(a);if(d){const p=Tn._fromJSON(e,d);h!==i&&(l=p),i=h;break}}catch{}const c=s.filter(h=>h._shouldAllowMigration);return!i._shouldAllowMigration||!c.length?new ns(i,e,r):(i=c[0],l&&await i._set(a,l.toJSON()),await Promise.all(n.map(async h=>{if(h!==i)try{await h._remove(a)}catch{}})),new ns(i,e,r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Zd(t){const e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(bg(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(wg(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Rg(e))return"Blackberry";if(Sg(e))return"Webos";if(Tg(e))return"Safari";if((e.includes("chrome/")||Ig(e))&&!e.includes("edge/"))return"Chrome";if(Ag(e))return"Android";{const n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=t.match(n);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function wg(t=Rt()){return/firefox\//i.test(t)}function Tg(t=Rt()){const e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Ig(t=Rt()){return/crios\//i.test(t)}function bg(t=Rt()){return/iemobile/i.test(t)}function Ag(t=Rt()){return/android/i.test(t)}function Rg(t=Rt()){return/blackberry/i.test(t)}function Sg(t=Rt()){return/webos/i.test(t)}function hu(t=Rt()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function Gb(t=Rt()){var e;return hu(t)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function Qb(){return rw()&&document.documentMode===10}function Pg(t=Rt()){return hu(t)||Ag(t)||Sg(t)||Rg(t)||/windows phone/i.test(t)||bg(t)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Cg(t,e=[]){let n;switch(t){case"Browser":n=Zd(Rt());break;case"Worker":n=`${Zd(Rt())}-${t}`;break;default:n=t}const r=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${ms}/${r}`}/**
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
 */class Jb{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){const r=i=>new Promise((a,l)=>{try{const c=e(i);a(c)}catch(c){l(c)}});r.onAbort=n,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const n=[];try{for(const r of this.queue)await r(e),r.onAbort&&n.push(r.onAbort)}catch(r){n.reverse();for(const s of n)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function Yb(t,e={}){return ws(t,"GET","/v2/passwordPolicy",Ra(t,e))}/**
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
 */const Xb=6;class Zb{constructor(e){var n,r,s,i;const a=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(n=a.minPasswordLength)!==null&&n!==void 0?n:Xb,a.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=a.maxPasswordLength),a.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=a.containsLowercaseCharacter),a.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=a.containsUppercaseCharacter),a.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=a.containsNumericCharacter),a.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=a.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(i=e.forceUpgradeOnSignin)!==null&&i!==void 0?i:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var n,r,s,i,a,l;const c={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,c),this.validatePasswordCharacterOptions(e,c),c.isValid&&(c.isValid=(n=c.meetsMinPasswordLength)!==null&&n!==void 0?n:!0),c.isValid&&(c.isValid=(r=c.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),c.isValid&&(c.isValid=(s=c.containsLowercaseLetter)!==null&&s!==void 0?s:!0),c.isValid&&(c.isValid=(i=c.containsUppercaseLetter)!==null&&i!==void 0?i:!0),c.isValid&&(c.isValid=(a=c.containsNumericCharacter)!==null&&a!==void 0?a:!0),c.isValid&&(c.isValid=(l=c.containsNonAlphanumericCharacter)!==null&&l!==void 0?l:!0),c}validatePasswordLengthOptions(e,n){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(n.meetsMinPasswordLength=e.length>=r),s&&(n.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(n,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,n,r,s,i){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=i))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class eA{constructor(e,n,r,s){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new ef(this),this.idTokenSubscription=new ef(this),this.beforeStateQueue=new Jb(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=dg,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=In(n)),this._initializationPromise=this.queue(async()=>{var r,s;if(!this._deleted&&(this.persistenceManager=await ns.create(this,e),!this._deleted)){if(!((r=this._popupRedirectResolver)===null||r===void 0)&&r._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=((s=this.currentUser)===null||s===void 0?void 0:s.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const n=await yg(this,{idToken:e}),r=await Tn._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(r)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var n;if(En(this.app)){const a=this.app.settings.authIdToken;return a?new Promise(l=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(a).then(l,l))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,i=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const a=(n=this.redirectUser)===null||n===void 0?void 0:n._redirectEventId,l=s==null?void 0:s._redirectEventId,c=await this.tryRedirectSignIn(e);(!a||a===l)&&(c!=null&&c.user)&&(s=c.user,i=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(i)try{await this.beforeStateQueue.runMiddleware(s)}catch(a){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(a))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return ce(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await $o(e)}catch(n){if((n==null?void 0:n.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=Mb()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(En(this.app))return Promise.reject(tr(this));const n=e?St(e):null;return n&&ce(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&ce(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return En(this.app)?Promise.reject(tr(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return En(this.app)?Promise.reject(tr(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(In(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Yb(this),n=new Zb(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistence(){return this.assertedPersistence.persistence.type}_updateErrorMap(e){this._errorFactory=new Ii("auth","Firebase",e())}onAuthStateChanged(e,n,r){return this.registerStateListener(this.authStateSubscription,e,n,r)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,r){return this.registerStateListener(this.idTokenSubscription,e,n,r)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){const n=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(r.tenantId=this.tenantId),await Wb(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,n){const r=await this.getOrInitRedirectPersistenceManager(n);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const n=e&&In(e)||this._popupRedirectResolver;ce(n,this,"argument-error"),this.redirectPersistenceManager=await ns.create(this,[In(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var n,r;return this._isInitialized&&await this.queue(async()=>{}),((n=this._currentUser)===null||n===void 0?void 0:n._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,n;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(n=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&n!==void 0?n:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,r,s){if(this._deleted)return()=>{};const i=typeof n=="function"?n:n.next.bind(n);let a=!1;const l=this._isInitialized?Promise.resolve():this._initializationPromise;if(ce(l,this,"internal-error"),l.then(()=>{a||i(this.currentUser)}),typeof n=="function"){const c=e.addObserver(n,r,s);return()=>{a=!0,c()}}else{const c=e.addObserver(n);return()=>{a=!0,c()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ce(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Cg(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const n={"X-Client-Version":this.clientVersion};this.app.options.appId&&(n["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(n["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(n["X-Firebase-AppCheck"]=s),n}async _getAppCheckToken(){var e;const n=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return n!=null&&n.error&&Vb(`Error while retrieving App Check token: ${n.error}`),n==null?void 0:n.token}}function Sa(t){return St(t)}class ef{constructor(e){this.auth=e,this.observer=null,this.addObserver=hw(n=>this.observer=n)}get next(){return ce(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let du={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function tA(t){du=t}function nA(t){return du.loadJS(t)}function rA(){return du.gapiScript}function sA(t){return`__${t}${Math.floor(Math.random()*1e6)}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function iA(t,e){const n=Rc(t,"auth");if(n.isInitialized()){const s=n.getImmediate(),i=n.getOptions();if(xo(i,e??{}))return s;Cn(s,"already-initialized")}return n.initialize({options:e})}function oA(t,e){const n=(e==null?void 0:e.persistence)||[],r=(Array.isArray(n)?n:[n]).map(In);e!=null&&e.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function aA(t,e,n){const r=Sa(t);ce(r._canInitEmulator,r,"emulator-config-failed"),ce(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!!(n!=null&&n.disableWarnings),i=kg(e),{host:a,port:l}=lA(e),c=l===null?"":`:${l}`;r.config.emulator={url:`${i}//${a}${c}/`},r.settings.appVerificationDisabledForTesting=!0,r.emulatorConfig=Object.freeze({host:a,port:l,protocol:i.replace(":",""),options:Object.freeze({disableWarnings:s})}),s||cA()}function kg(t){const e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function lA(t){const e=kg(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};const r=n[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const i=s[1];return{host:i,port:tf(r.substr(i.length+1))}}else{const[i,a]=r.split(":");return{host:i,port:tf(a)}}}function tf(t){if(!t)return null;const e=Number(t);return isNaN(e)?null:e}function cA(){function t(){const e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xg{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return wn("not implemented")}_getIdTokenResponse(e){return wn("not implemented")}_linkToIdToken(e,n){return wn("not implemented")}_getReauthenticationResolver(e){return wn("not implemented")}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function rs(t,e){return gg(t,"POST","/v1/accounts:signInWithIdp",Ra(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uA="http://localhost";class Cr extends xg{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const n=new Cr(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):Cn("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const n=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=n,i=au(n,["providerId","signInMethod"]);if(!r||!s)return null;const a=new Cr(r,s);return a.idToken=i.idToken||void 0,a.accessToken=i.accessToken||void 0,a.secret=i.secret,a.nonce=i.nonce,a.pendingToken=i.pendingToken||null,a}_getIdTokenResponse(e){const n=this.buildRequest();return rs(e,n)}_linkToIdToken(e,n){const r=this.buildRequest();return r.idToken=n,rs(e,r)}_getReauthenticationResolver(e){const n=this.buildRequest();return n.autoCreate=!1,rs(e,n)}buildRequest(){const e={requestUri:uA,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=bi(n)}return e}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dg{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Vi extends Dg{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
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
 */async function hA(t,e){return gg(t,"POST","/v1/accounts:signUp",Ra(t,e))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lr{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,r,s=!1){const i=await Tn._fromIdTokenResponse(e,r,s),a=nf(r);return new lr({user:i,providerId:a,_tokenResponse:r,operationType:n})}static async _forOperation(e,n,r){await e._updateTokensIfNecessary(r,!0);const s=nf(r);return new lr({user:e,providerId:s,_tokenResponse:r,operationType:n})}}function nf(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function dA(t){var e;if(En(t.app))return Promise.reject(tr(t));const n=Sa(t);if(await n._initializationPromise,!((e=n.currentUser)===null||e===void 0)&&e.isAnonymous)return new lr({user:n.currentUser,providerId:null,operationType:"signIn"});const r=await hA(n,{returnSecureToken:!0}),s=await lr._fromIdTokenResponse(n,"signIn",r,!0);return await n._updateCurrentUser(s.user),s}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qo extends Dn{constructor(e,n,r,s){var i;super(n.code,n.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,qo.prototype),this.customData={appName:e.name,tenantId:(i=e.tenantId)!==null&&i!==void 0?i:void 0,_serverResponse:n.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,n,r,s){return new qo(e,n,r,s)}}function Vg(t,e,n,r){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(i=>{throw i.code==="auth/multi-factor-auth-required"?qo._fromErrorAndOperation(t,i,e,r):i})}async function fA(t,e,n=!1){const r=await Ei(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return lr._forOperation(t,"link",r)}/**
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
 */async function pA(t,e,n=!1){const{auth:r}=t;if(En(r.app))return Promise.reject(tr(r));const s="reauthenticate";try{const i=await Ei(t,Vg(r,s,e,t),n);ce(i.idToken,r,"internal-error");const a=uu(i.idToken);ce(a,r,"internal-error");const{sub:l}=a;return ce(t.uid===l,r,"user-mismatch"),lr._forOperation(t,s,i)}catch(i){throw(i==null?void 0:i.code)==="auth/user-not-found"&&Cn(r,"user-mismatch"),i}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function mA(t,e,n=!1){if(En(t.app))return Promise.reject(tr(t));const r="signIn",s=await Vg(t,r,e),i=await lr._fromIdTokenResponse(t,r,s);return n||await t._updateCurrentUser(i.user),i}function gA(t,e,n,r){return St(t).onIdTokenChanged(e,n,r)}function _A(t,e,n){return St(t).beforeAuthStateChanged(e,n)}const Ho="__sak";/**
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
 */class Ng{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Ho,"1"),this.storage.removeItem(Ho),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){const n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yA=1e3,vA=10;class Og extends Ng{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Pg(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const n of Object.keys(this.listeners)){const r=this.storage.getItem(n),s=this.localCache[n];r!==s&&e(n,s,r)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((a,l,c)=>{this.notifyListeners(a,c)});return}const r=e.key;n?this.detachListener():this.stopPolling();const s=()=>{const a=this.storage.getItem(r);!n&&this.localCache[r]===a||this.notifyListeners(r,a)},i=this.storage.getItem(r);Qb()&&i!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,vA):s()}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:r}),!0)})},yA)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){const n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}}Og.type="LOCAL";const EA=Og;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mg extends Ng{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}}Mg.type="SESSION";const Lg=Mg;/**
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
 */function wA(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}/**
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
 */class Pa{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const n=this.receivers.find(s=>s.isListeningto(e));if(n)return n;const r=new Pa(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const n=e,{eventId:r,eventType:s,data:i}=n.data,a=this.handlersMap[s];if(!(a!=null&&a.size))return;n.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const l=Array.from(a).map(async h=>h(n.origin,i)),c=await wA(l);n.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:c})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Pa.receivers=[];/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function fu(t="",e=10){let n="";for(let r=0;r<e;r++)n+=Math.floor(Math.random()*10);return t+n}/**
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
 */class TA{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let i,a;return new Promise((l,c)=>{const h=fu("",20);s.port1.start();const d=setTimeout(()=>{c(new Error("unsupported_event"))},r);a={messageChannel:s,onMessage(p){const g=p;if(g.data.eventId===h)switch(g.data.status){case"ack":clearTimeout(d),i=setTimeout(()=>{c(new Error("timeout"))},3e3);break;case"done":clearTimeout(i),l(g.data.response);break;default:clearTimeout(d),clearTimeout(i),c(new Error("invalid_response"));break}}},this.handlers.add(a),s.port1.addEventListener("message",a.onMessage),this.target.postMessage({eventType:e,eventId:h,data:n},[s.port2])}).finally(()=>{a&&this.removeMessageHandler(a)})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function un(){return window}function IA(t){un().location.href=t}/**
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
 */function Fg(){return typeof un().WorkerGlobalScope<"u"&&typeof un().importScripts=="function"}async function bA(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function AA(){var t;return((t=navigator==null?void 0:navigator.serviceWorker)===null||t===void 0?void 0:t.controller)||null}function RA(){return Fg()?self:null}/**
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
 */const Ug="firebaseLocalStorageDb",SA=1,zo="firebaseLocalStorage",Bg="fbase_key";class Ni{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}}function Ca(t,e){return t.transaction([zo],e?"readwrite":"readonly").objectStore(zo)}function PA(){const t=indexedDB.deleteDatabase(Ug);return new Ni(t).toPromise()}function rc(){const t=indexedDB.open(Ug,SA);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{const r=t.result;try{r.createObjectStore(zo,{keyPath:Bg})}catch(s){n(s)}}),t.addEventListener("success",async()=>{const r=t.result;r.objectStoreNames.contains(zo)?e(r):(r.close(),await PA(),e(await rc()))})})}async function rf(t,e,n){const r=Ca(t,!0).put({[Bg]:e,value:n});return new Ni(r).toPromise()}async function CA(t,e){const n=Ca(t,!1).get(e),r=await new Ni(n).toPromise();return r===void 0?null:r.value}function sf(t,e){const n=Ca(t,!0).delete(e);return new Ni(n).toPromise()}const kA=800,xA=3;class jg{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await rc(),this.db)}async _withRetries(e){let n=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(n++>xA)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return Fg()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Pa._getInstance(RA()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){var e,n;if(this.activeServiceWorker=await bA(),!this.activeServiceWorker)return;this.sender=new TA(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((n=r[0])===null||n===void 0)&&n.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||AA()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await rc();return await rf(e,Ho,"1"),await sf(e,Ho),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(r=>rf(r,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){const n=await this._withRetries(r=>CA(r,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>sf(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const i=Ca(s,!1).getAll();return new Ni(i).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const n=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:i}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(i)&&(this.notifyListeners(s,i),n.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),n.push(s));return n}notifyListeners(e,n){this.localCache[e]=n;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),kA)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}jg.type="LOCAL";const DA=jg;new Di(3e4,6e4);/**
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
 */function VA(t,e){return e?In(e):(ce(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}/**
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
 */class pu extends xg{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return rs(e,this._buildIdpRequest())}_linkToIdToken(e,n){return rs(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return rs(e,this._buildIdpRequest())}_buildIdpRequest(e){const n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}}function NA(t){return mA(t.auth,new pu(t),t.bypassAuthState)}function OA(t){const{auth:e,user:n}=t;return ce(n,e,"internal-error"),pA(n,new pu(t),t.bypassAuthState)}async function MA(t){const{auth:e,user:n}=t;return ce(n,e,"internal-error"),fA(n,new pu(t),t.bypassAuthState)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $g{constructor(e,n,r,s,i=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=i,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:n,sessionId:r,postBody:s,tenantId:i,error:a,type:l}=e;if(a){this.reject(a);return}const c={auth:this.auth,requestUri:n,sessionId:r,tenantId:i||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(c))}catch(h){this.reject(h)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return NA;case"linkViaPopup":case"linkViaRedirect":return MA;case"reauthViaPopup":case"reauthViaRedirect":return OA;default:Cn(this.auth,"internal-error")}}resolve(e){kn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){kn(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const LA=new Di(2e3,1e4);class Wr extends $g{constructor(e,n,r,s,i){super(e,n,s,i),this.provider=r,this.authWindow=null,this.pollId=null,Wr.currentPopupAction&&Wr.currentPopupAction.cancel(),Wr.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return ce(e,this.auth,"internal-error"),e}async onExecution(){kn(this.filter.length===1,"Popup operations only handle one event");const e=fu();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(cn(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(cn(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,Wr.currentPopupAction=null}pollUserCancellation(){const e=()=>{var n,r;if(!((r=(n=this.authWindow)===null||n===void 0?void 0:n.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(cn(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,LA.get())};e()}}Wr.currentPopupAction=null;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const FA="pendingRedirect",wo=new Map;class UA extends $g{constructor(e,n,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,r),this.eventId=null}async execute(){let e=wo.get(this.auth._key());if(!e){try{const r=await BA(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(n){e=()=>Promise.reject(n)}wo.set(this.auth._key(),e)}return this.bypassAuthState||wo.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function BA(t,e){const n=qA(e),r=$A(t);if(!await r._isAvailable())return!1;const s=await r._get(n)==="true";return await r._remove(n),s}function jA(t,e){wo.set(t._key(),e)}function $A(t){return In(t._redirectPersistence)}function qA(t){return Eo(FA,t.config.apiKey,t.name)}async function HA(t,e,n=!1){if(En(t.app))return Promise.reject(tr(t));const r=Sa(t),s=VA(r,e),a=await new UA(r,s,n).execute();return a&&!n&&(delete a.user._redirectEventId,await r._persistUserIfCurrent(a.user),await r._setRedirectUser(null,e)),a}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zA=10*60*1e3;class KA{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(n=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!WA(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){var r;if(e.error&&!qg(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";n.onError(cn(this.auth,s))}else n.onAuthEvent(e)}isEventForConsumer(e,n){const r=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=zA&&this.cachedEventUids.clear(),this.cachedEventUids.has(of(e))}saveEventToCache(e){this.cachedEventUids.add(of(e)),this.lastProcessedEventTime=Date.now()}}function of(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function qg({type:t,error:e}){return t==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function WA(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return qg(t);default:return!1}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function GA(t,e={}){return ws(t,"GET","/v1/projects",e)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const QA=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,JA=/^https?/;async function YA(t){if(t.config.emulator)return;const{authorizedDomains:e}=await GA(t);for(const n of e)try{if(XA(n))return}catch{}Cn(t,"unauthorized-domain")}function XA(t){const e=tc(),{protocol:n,hostname:r}=new URL(e);if(t.startsWith("chrome-extension://")){const a=new URL(t);return a.hostname===""&&r===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&a.hostname===r}if(!JA.test(n))return!1;if(QA.test(t))return r===t;const s=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
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
 */const ZA=new Di(3e4,6e4);function af(){const t=un().___jsl;if(t!=null&&t.H){for(const e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function eR(t){return new Promise((e,n)=>{var r,s,i;function a(){af(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{af(),n(cn(t,"network-request-failed"))},timeout:ZA.get()})}if(!((s=(r=un().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((i=un().gapi)===null||i===void 0)&&i.load)a();else{const l=sA("iframefcb");return un()[l]=()=>{gapi.load?a():n(cn(t,"network-request-failed"))},nA(`${rA()}?onload=${l}`).catch(c=>n(c))}}).catch(e=>{throw To=null,e})}let To=null;function tR(t){return To=To||eR(t),To}/**
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
 */const nR=new Di(5e3,15e3),rR="__/auth/iframe",sR="emulator/auth/iframe",iR={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},oR=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function aR(t){const e=t.config;ce(e.authDomain,t,"auth-domain-config-required");const n=e.emulator?cu(e,sR):`https://${t.config.authDomain}/${rR}`,r={apiKey:e.apiKey,appName:t.name,v:ms},s=oR.get(t.config.apiHost);s&&(r.eid=s);const i=t._getFrameworks();return i.length&&(r.fw=i.join(",")),`${n}?${bi(r).slice(1)}`}async function lR(t){const e=await tR(t),n=un().gapi;return ce(n,t,"internal-error"),e.open({where:document.body,url:aR(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:iR,dontclear:!0},r=>new Promise(async(s,i)=>{await r.restyle({setHideOnLeave:!1});const a=cn(t,"network-request-failed"),l=un().setTimeout(()=>{i(a)},nR.get());function c(){un().clearTimeout(l),s(r)}r.ping(c).then(c,()=>{i(a)})}))}/**
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
 */const cR={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},uR=500,hR=600,dR="_blank",fR="http://localhost";class lf{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function pR(t,e,n,r=uR,s=hR){const i=Math.max((window.screen.availHeight-s)/2,0).toString(),a=Math.max((window.screen.availWidth-r)/2,0).toString();let l="";const c=Object.assign(Object.assign({},cR),{width:r.toString(),height:s.toString(),top:i,left:a}),h=Rt().toLowerCase();n&&(l=Ig(h)?dR:n),wg(h)&&(e=e||fR,c.scrollbars="yes");const d=Object.entries(c).reduce((g,[y,x])=>`${g}${y}=${x},`,"");if(Gb(h)&&l!=="_self")return mR(e||"",l),new lf(null);const p=window.open(e||"",l,d);ce(p,t,"popup-blocked");try{p.focus()}catch{}return new lf(p)}function mR(t,e){const n=document.createElement("a");n.href=t,n.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(r)}/**
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
 */const gR="__/auth/handler",_R="emulator/auth/handler",yR=encodeURIComponent("fac");async function cf(t,e,n,r,s,i){ce(t.config.authDomain,t,"auth-domain-config-required"),ce(t.config.apiKey,t,"invalid-api-key");const a={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:r,v:ms,eventId:s};if(e instanceof Dg){e.setDefaultLanguage(t.languageCode),a.providerId=e.providerId||"",uw(e.getCustomParameters())||(a.customParameters=JSON.stringify(e.getCustomParameters()));for(const[d,p]of Object.entries(i||{}))a[d]=p}if(e instanceof Vi){const d=e.getScopes().filter(p=>p!=="");d.length>0&&(a.scopes=d.join(","))}t.tenantId&&(a.tid=t.tenantId);const l=a;for(const d of Object.keys(l))l[d]===void 0&&delete l[d];const c=await t._getAppCheckToken(),h=c?`#${yR}=${encodeURIComponent(c)}`:"";return`${vR(t)}?${bi(l).slice(1)}${h}`}function vR({config:t}){return t.emulator?cu(t,_R):`https://${t.authDomain}/${gR}`}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const _l="webStorageSupport";class ER{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=Lg,this._completeRedirectFn=HA,this._overrideRedirectResult=jA}async _openPopup(e,n,r,s){var i;kn((i=this.eventManagers[e._key()])===null||i===void 0?void 0:i.manager,"_initialize() not called before _openPopup()");const a=await cf(e,n,r,tc(),s);return pR(e,a,fu())}async _openRedirect(e,n,r,s){await this._originValidation(e);const i=await cf(e,n,r,tc(),s);return IA(i),new Promise(()=>{})}_initialize(e){const n=e._key();if(this.eventManagers[n]){const{manager:s,promise:i}=this.eventManagers[n];return s?Promise.resolve(s):(kn(i,"If manager is not set, promise should be"),i)}const r=this.initAndGetManager(e);return this.eventManagers[n]={promise:r},r.catch(()=>{delete this.eventManagers[n]}),r}async initAndGetManager(e){const n=await lR(e),r=new KA(e);return n.register("authEvent",s=>(ce(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=n,r}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(_l,{type:_l},s=>{var i;const a=(i=s==null?void 0:s[0])===null||i===void 0?void 0:i[_l];a!==void 0&&n(!!a),Cn(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=YA(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return Pg()||Tg()||hu()}}const wR=ER;var uf="@firebase/auth",hf="1.7.9";/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class TR{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const n=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){ce(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function IR(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function bR(t){as(new Ar("auth",(e,{options:n})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),i=e.getProvider("app-check-internal"),{apiKey:a,authDomain:l}=r.options;ce(a&&!a.includes(":"),"invalid-api-key",{appName:r.name});const c={apiKey:a,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Cg(t)},h=new eA(r,s,i,c);return oA(h,n),h},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,r)=>{e.getProvider("auth-internal").initialize()})),as(new Ar("auth-internal",e=>{const n=Sa(e.getProvider("auth").getImmediate());return(r=>new TR(r))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Xn(uf,hf,IR(t)),Xn(uf,hf,"esm2017")}/**
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
 */const AR=5*60,RR=Up("authIdTokenMaxAge")||AR;let df=null;const SR=t=>async e=>{const n=e&&await e.getIdTokenResult(),r=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(r&&r>RR)return;const s=n==null?void 0:n.token;df!==s&&(df=s,await fetch(t,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function PR(t=qp()){const e=Rc(t,"auth");if(e.isInitialized())return e.getImmediate();const n=iA(t,{popupRedirectResolver:wR,persistence:[DA,EA,Lg]}),r=Up("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const i=new URL(r,location.origin);if(location.origin===i.origin){const a=SR(i.toString());_A(n,a,()=>a(n.currentUser)),gA(n,l=>a(l))}}const s=Lp("auth");return s&&aA(n,`http://${s}`),n}function CR(){var t,e;return(e=(t=document.getElementsByTagName("head"))===null||t===void 0?void 0:t[0])!==null&&e!==void 0?e:document}tA({loadJS(t){return new Promise((e,n)=>{const r=document.createElement("script");r.setAttribute("src",t),r.onload=e,r.onerror=s=>{const i=cn("internal-error");i.customData=s,n(i)},r.type="text/javascript",r.charset="UTF-8",CR().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});bR("Browser");const kR={apiKey:"AIzaSyDCqJRmxKiIzuAhgXsmXICCx_O65aujNa0",authDomain:"impro-selector.firebaseapp.com",projectId:"impro-selector",storageBucket:"impro-selector.appspot.com",messagingSenderId:"730278491306",appId:"1:730278491306:web:c966af1179221e91118cd3",measurementId:"G-3NB062D088"},Hg=$p(kR),ue=db(Hg),xR=PR(Hg);dA(xR);const mu="seasons";async function DR(t,e){return await kb(Ue(ue,mu),{name:t,slug:e,createdAt:cg()})}async function VR(t){return await Bo(Qe(ue,mu,t))}async function yl(){const t=ag(Ue(ue,mu),bb("createdAt","desc"));return(await Ye(t)).docs.map(n=>({id:n.id,...n.data()}))}const NR={class:"container mx-auto py-8"},OR={class:"flex justify-between items-center mb-6"},MR={class:"flex flex-wrap gap-6 justify-center"},LR=["onClick"],FR={class:"text-xl font-semibold mb-2 text-center"},UR={class:"text-gray-500 text-center"},BR=["onClick"],jR={key:0,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"},$R={class:"bg-white p-6 rounded-lg shadow-lg w-96"},qR={class:"mb-4"},HR={class:"mb-4"},zR={class:"flex justify-end space-x-2"},KR=["disabled"],WR={key:1,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50"},GR={class:"bg-white p-6 rounded-lg shadow-lg w-96"},QR={class:"mb-4"},JR={__name:"Home",setup(t){const e=Re([]),n=jE(),r=Re(!1),s=Re(!1),i=Re(""),a=Re(""),l=Re(null);yc(async()=>{e.value=await yl(),console.log("Saisons chargées:",e.value)});function c(N){n.push(`/season/${N}`)}function h(){i.value&&(a.value=i.value.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").trim("-"))}async function d(){if(!(!i.value.trim()||!a.value.trim()))try{await DR(i.value.trim(),a.value.trim()),e.value=await yl(),p()}catch(N){console.error("Erreur lors de la création de la saison:",N),alert("Erreur lors de la création de la saison. Veuillez réessayer.")}}function p(){r.value=!1,i.value="",a.value=""}function g(N){l.value=N,s.value=!0}async function y(){if(l.value)try{await VR(l.value.id),e.value=await yl(),x()}catch(N){console.error("Erreur lors de la suppression de la saison:",N),alert("Erreur lors de la suppression de la saison. Veuillez réessayer.")}}function x(){s.value=!1,l.value=null}return(N,O)=>{var q;return Ie(),ke("div",NR,[B("div",OR,[O[3]||(O[3]=B("h1",{class:"text-3xl font-bold"},"Saisons",-1)),B("button",{onClick:O[0]||(O[0]=U=>r.value=!0),class:"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"}," Nouvelle saison ")]),B("div",MR,[(Ie(!0),ke(ft,null,Er(e.value,U=>(Ie(),ke("div",{key:U.id,class:"bg-white shadow-lg rounded-lg p-6 w-64 cursor-pointer hover:shadow-xl transition relative"},[B("div",{onClick:G=>c(U.slug)},[B("h2",FR,Qt(U.name),1),B("p",UR,"Slug : "+Qt(U.slug),1)],8,LR),B("button",{onClick:kv(G=>g(U),["stop"]),class:"absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg",title:"Supprimer cette saison"}," 🗑️ ",8,BR)]))),128))]),r.value?(Ie(),ke("div",jR,[B("div",$R,[O[6]||(O[6]=B("h2",{class:"text-xl font-bold mb-4"},"Nouvelle saison",-1)),B("div",qR,[O[4]||(O[4]=B("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Nom de la saison",-1)),Un(B("input",{"onUpdate:modelValue":O[1]||(O[1]=U=>i.value=U),type:"text",class:"w-full p-2 border rounded focus:ring-2 focus:ring-blue-500",placeholder:"Ex: La Malice 2025-2026",onInput:h},null,544),[[$n,i.value]])]),B("div",HR,[O[5]||(O[5]=B("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Slug (URL)",-1)),Un(B("input",{"onUpdate:modelValue":O[2]||(O[2]=U=>a.value=U),type:"text",class:"w-full p-2 border rounded focus:ring-2 focus:ring-blue-500",placeholder:"Ex: malice-2025-2026"},null,512),[[$n,a.value]])]),B("div",zR,[B("button",{onClick:p,class:"px-4 py-2 text-gray-700 hover:text-gray-900"}," Annuler "),B("button",{onClick:d,disabled:!i.value.trim()||!a.value.trim(),class:"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"}," Créer ",8,KR)])])])):Bn("",!0),s.value?(Ie(),ke("div",WR,[B("div",GR,[O[7]||(O[7]=B("h2",{class:"text-xl font-bold mb-4"},"Confirmation",-1)),B("p",QR,'Êtes-vous sûr de vouloir supprimer la saison "'+Qt((q=l.value)==null?void 0:q.name)+'" ?',1),O[8]||(O[8]=B("p",{class:"mb-4 text-sm text-red-600"},"Cette action est irréversible et supprimera toutes les données de cette saison.",-1)),B("div",{class:"flex justify-end space-x-2"},[B("button",{onClick:x,class:"px-4 py-2 text-gray-700 hover:text-gray-900"}," Annuler "),B("button",{onClick:y,class:"px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"}," Supprimer ")])])])):Bn("",!0)])}}};let xt="mock";const kr=[{id:"p1",name:"Alice"},{id:"p2",name:"Bob"},{id:"p3",name:"Charlie"},{id:"p4",name:"David"},{id:"p5",name:"Eva"},{id:"p6",name:"Fanny"},{id:"p7",name:"Georges"},{id:"p8",name:"Hélène"},{id:"p9",name:"Ismaël"},{id:"p10",name:"Jade"},{id:"p11",name:"Karim"},{id:"p12",name:"Léa"},{id:"p13",name:"Marc"},{id:"p14",name:"Nina"},{id:"p15",name:"Oscar"}],xr=[{id:"event1",title:"Apérock Septembre",date:"2025-09-08"},{id:"event2",title:"Match à Cambo",date:"2025-11-25"},{id:"event3",title:"Impro des Familles",date:"2025-12-02"},{id:"event4",title:"Cabaret Surprise",date:"2026-01-20"},{id:"event5",title:"Impro Plage",date:"2026-03-10"}];function YR(t){xt=t}async function XR(){if(xt!=="firebase"||!(await Ye(Ue(ue,"seasons"))).empty)return;const e=Qe(Ue(ue,"seasons"));await Yt(e,{name:"Malice 2025-2026",slug:"malice-2025-2026",createdAt:cg()});const n=await Ye(Ue(ue,"players"));for(const a of n.docs)await Yt(Qe(e,"players",a.id),a.data());const r=await Ye(Ue(ue,"events"));for(const a of r.docs)await Yt(Qe(e,"events",a.id),a.data());const s=await Ye(Ue(ue,"availability"));for(const a of s.docs)await Yt(Qe(e,"availability",a.id),a.data());const i=await Ye(Ue(ue,"selections"));for(const a of i.docs)await Yt(Qe(e,"selections",a.id),a.data())}async function ZR(){xt==="firebase"&&await XR()}async function ff(t=null){return(xt==="firebase"?t?(await Ye(Ue(ue,"seasons",t,"events"))).docs.map(n=>({id:n.id,...n.data()})):(await Ye(Ue(ue,"events"))).docs.map(n=>({id:n.id,...n.data()})):xr).sort((n,r)=>{const s=new Date(n.date),i=new Date(r.date);return s<i?-1:s>i?1:n.title.localeCompare(r.title)})}async function pf(t=null){return(xt==="firebase"?t?(await Ye(Ue(ue,"seasons",t,"players"))).docs.map(n=>({id:n.id,...n.data()})):(await Ye(Ue(ue,"players"))).docs.map(n=>({id:n.id,...n.data()})):kr).sort((n,r)=>n.order<r.order?-1:n.order>r.order?1:n.name.localeCompare(r.name))}async function eS(t,e=null){if(xt==="firebase"){const n=Qe(e?Ue(ue,"seasons",e,"players"):Ue(ue,"players"));return await Yt(n,{name:t}),n.id}else{const n=`p${kr.length+1}`;return kr.push({id:n,name:t}),n}}async function tS(t,e=null){if(xt==="firebase"){const n=e?Qe(ue,"seasons",e,"players",t):Qe(ue,"players",t);await Bo(n);const r=e?await Ye(Ue(ue,"seasons",e,"availability")):await Ye(Ue(ue,"availability")),s=ug(ue);r.forEach(i=>{const a=i.data();if(a[t]!==void 0){const l={...a};delete l[t],s.update(i.ref,l)}}),await s.commit()}else kr=kr.filter(n=>n.id!==t)}async function nS(t,e,n=null){if(xt==="firebase"){const r=n?Qe(ue,"seasons",n,"players",t):Qe(ue,"players",t);await Yt(r,{name:e})}else{const r=kr.findIndex(s=>s.id===t);r!==-1&&(kr[r]=e)}}async function oo(t,e,n=null){if(xt==="firebase"){const r=n?await Ye(Ue(ue,"seasons",n,"availability")):await Ye(Ue(ue,"availability")),s={};return r.forEach(i=>{s[i.id]=i.data()}),s}else{const r={};return t.forEach(s=>{r[s.name]={},e.forEach(i=>{r[s.name][i.id]=void 0})}),e.forEach(s=>{const i=[...t].sort(()=>.5-Math.random());i.slice(0,4).forEach(a=>{r[a.name][s.id]=!0}),i.slice(4).forEach(a=>{const l=Math.random();r[a.name][s.id]=l<.4?!0:l<.8?!1:void 0})}),r}}async function ao(t=null){if(xt==="firebase"){const e=t?await Ye(Ue(ue,"seasons",t,"selections")):await Ye(Ue(ue,"selections")),n={};return e.forEach(r=>{n[r.id]=r.data().players||[]}),n}else return{}}async function mf(t,e,n=null){if(xt==="firebase"){const r=n?Qe(ue,"seasons",n,"availability",t):Qe(ue,"availability",t);await Yt(r,e)}}async function rS(t,e,n=null){if(xt==="firebase"){const r=n?Qe(ue,"seasons",n,"selections",t):Qe(ue,"selections",t);await Yt(r,{players:e})}}async function sS(t,e=null){if(console.log("Suppression de l'événement:",t),xt==="firebase")try{console.log("Suppression de l'événement dans Firestore");const n=e?Qe(ue,"seasons",e,"events",t):Qe(ue,"events",t);await Bo(n),console.log("Suppression de la sélection associée");const r=e?Qe(ue,"seasons",e,"selections",t):Qe(ue,"selections",t);await Bo(r),console.log("Suppression des disponibilités");const s=e?await Ye(Ue(ue,"seasons",e,"availability")):await Ye(Ue(ue,"availability")),i=ug(ue);s.forEach(a=>{const l=a.data();if(l[t]!==void 0){console.log("Mise à jour de la disponibilité pour:",a.id);const c={...l};delete c[t],i.update(a.ref,c)}}),await i.commit(),console.log("Opérations de suppression terminées avec succès")}catch(n){throw console.error("Erreur lors de la suppression:",n),n}else xr=xr.filter(n=>n.id!==t)}async function iS(t,e=null){if(xt==="firebase"){const n=Qe(e?Ue(ue,"seasons",e,"events"):Ue(ue,"events"));return await Yt(n,t),n.id}else{const n=`event${xr.length+1}`;return xr.push({id:n,...t}),n}}async function oS(t,e,n=null){if(xt==="firebase"){const r=n?Qe(ue,"seasons",n,"events",t):Qe(ue,"events",t);await Yt(r,e)}else{const r=xr.findIndex(s=>s.id===t);r!==-1&&(xr[r]={id:t,...e})}}const aS={class:"relative"},lS={class:"text-3xl font-bold text-center my-4"},cS={class:"sticky top-0 bg-white z-50 shadow overflow-x-auto"},uS={class:"border-collapse border border-gray-400 w-full table-fixed"},hS={class:"bg-gray-100 text-gray-800 text-4xl sm:text-base"},dS={class:"p-3 text-left"},fS={class:"flex items-center justify-center space-x-2"},pS=["onMouseenter","onDblclick"],mS={class:"flex flex-col gap-2"},gS={class:"flex flex-col items-center space-y-1 relative"},_S={key:0,class:"font-semibold text-4xl sm:text-base text-center whitespace-pre-wrap relative group"},yS=["title"],vS={key:1,class:"w-full"},ES=["title"],wS={key:3,class:"w-full"},TS=["onClick"],IS={class:"p-3 text-center"},bS={class:"bg-gray-50"},AS=["onClick","title"],RS={class:"overflow-x-auto overflow-y-auto max-h-[calc(100vh-100px)]"},SS={class:"table-auto border-collapse border border-gray-400 w-full table-fixed"},PS={class:"border-t"},CS=["data-player-id"],kS={class:"p-4 sm:p-3 font-medium text-gray-900 w-[100px] relative group text-4xl sm:text-base"},xS={key:0,class:"font-semibold text-4xl sm:text-base whitespace-pre-wrap flex items-center justify-between"},DS=["onDblclick","title"],VS=["onClick"],NS={key:1,class:"w-full"},OS={class:"p-4 sm:p-3 text-center text-gray-700 text-4xl sm:text-base w-[100px]"},MS=["title"],LS=["onClick"],FS=["title"],US=["title"],BS=["title"],jS=["title"],$S={key:0,class:"fixed bottom-4 left-4 bg-green-500 text-white p-4 rounded-lg shadow-lg"},qS={key:1,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"},HS={class:"bg-white p-6 rounded-lg shadow-lg w-96"},zS={class:"mb-4"},KS={class:"mb-4"},WS={key:2,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"},GS={class:"bg-white p-6 rounded-lg shadow-lg w-96"},QS={class:"mb-4"},JS={class:"flex justify-end space-x-2"},YS={key:3,class:"fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center"},XS={key:4,class:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"},ZS={key:5,class:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"},eP={__name:"GridBoard",props:{slug:{type:String,required:!0}},setup(t){const e=t;e.slug;const n=Re(""),r=Re(""),s=Re(!1),i=Re(null),a=Re(null),l=Re(""),c=Re(""),h=Re(null),d=Re(""),p=Re(!1),g=Re(""),y=Re(null),x=Re(!1),N=Re(null);function O(D){y.value=D;const R=document.querySelector(`[data-player-id="${D}"]`);R&&R.scrollIntoView({behavior:"smooth",block:"center"}),q.value=!0,U.value="Nouveau joueur ajouté !",setTimeout(()=>{q.value=!1},3e3)}const q=Re(!1),U=Re("");async function G(D){i.value=D,s.value=!0}async function J(){s.value=!1;try{await sS(i.value,r.value),Pe.value=Pe.value.filter(D=>D.id!==i.value),await Promise.all([ff(r.value),oo(Fe.value,Pe.value,r.value),ao(r.value)]).then(([D,R,C])=>{Pe.value=D,$e.value=R,Te.value=C}),i.value=null,q.value=!0,U.value="Événement supprimé avec succès !",setTimeout(()=>{q.value=!1},3e3)}catch(D){console.error("Erreur lors de la suppression de l'événement:",D),alert("Erreur lors de la suppression de l'événement. Veuillez réessayer.")}}function ge(){s.value=!1,i.value=null}function _e(D){a.value=D.id,l.value=D.title,c.value=D.date}async function I(){if(!(!a.value||!l.value.trim()||!c.value))try{const D={title:l.value.trim(),date:c.value};await oS(a.value,D,r.value),await Promise.all([ff(r.value),oo(Fe.value,Pe.value,r.value),ao(r.value)]).then(([R,C,K])=>{Pe.value=R,$e.value=C,Te.value=K}),a.value=null,l.value="",c.value="",q.value=!0,U.value="Événement mis à jour avec succès !",setTimeout(()=>{q.value=!1},3e3)}catch(D){console.error("Erreur lors de l'édition de l'événement:",D),alert("Erreur lors de l'édition de l'événement. Veuillez réessayer.")}}function v(D){h.value=D.id,d.value=D.name,mc(()=>{editPlayerInput.value&&editPlayerInput.value.focus()})}async function T(){if(!(!h.value||!d.value.trim()))try{await nS(h.value,d.value.trim(),r.value),await Promise.all([pf(r.value),oo(Fe.value,Pe.value,r.value),ao(r.value)]).then(([D,R,C])=>{Fe.value=D,$e.value=R,Te.value=C}),h.value=null,d.value="",q.value=!0,U.value="Joueur mis à jour avec succès !",setTimeout(()=>{q.value=!1},3e3)}catch(D){console.error("Erreur lors de l'édition du joueur:",D),alert("Erreur lors de l'édition du joueur. Veuillez réessayer.")}}function b(){h.value=null,d.value=""}async function A(){if(g.value.trim())try{const D=g.value.trim(),R=await eS(D,r.value);await Promise.all([pf(r.value),oo(Fe.value,Pe.value,r.value),ao(r.value)]).then(([C,K,oe])=>{Fe.value=C,$e.value=K,Te.value=oe;const ve=Fe.value.find(xe=>xe.id===R);O(R);const le=document.querySelector(`[data-player-id="${R}"]`);le&&le.scrollIntoView({behavior:"smooth",block:"center"}),q.value=!0,U.value="Joueur ajouté avec succès ! Vous pouvez maintenant indiquer sa disponibilité.",setTimeout(()=>{q.value=!1},3e3),setTimeout(()=>{q.value=!1,U.value=""},5e3)}),p.value=!1,g.value=""}catch(D){console.error("Erreur lors de l'ajout du joueur:",D),alert("Erreur lors de l'ajout du joueur. Veuillez réessayer.")}}function P(){a.value=null,l.value="",c.value=""}const w=Re(null),tt=Re(!1),ot=Re(""),je=Re("");async function we(){if(!ot.value.trim()||!je.value){alert("Veuillez remplir le titre et la date de l'événement");return}const D={title:ot.value.trim(),date:je.value};try{const R=await iS(D,r.value);Pe.value=[...Pe.value,{id:R,...D}];const C={};for(const K of Fe.value)C[K.name]=$e.value[K.name]||{},C[K.name][R]=null,await mf(K.name,C[K.name],r.value);ot.value="",je.value="",tt.value=!1,await Promise.resolve()}catch(R){console.error("Erreur lors de la création de l'événement:",R),alert("Erreur lors de la création de l'événement. Veuillez réessayer.")}}function Ee(){ot.value="",je.value="",tt.value=!1}const Pe=Re([]),Fe=Re([]),$e=Re({}),Te=Re({}),Ke=Re({}),Wt=Re({});yc(async()=>{YR("firebase"),await ZR();const D=ag(Ue(ue,"seasons"),Ib("slug","==",e.slug)),R=await Ye(D);if(!R.empty){const C=R.docs[0];r.value=C.id,n.value=C.data().name,document.title=`Saison : ${n.value}`}if(r.value){const C=await Ye(Ue(ue,"seasons",r.value,"players"));Fe.value=C.docs.map(Ae=>({id:Ae.id,...Ae.data()}));const K=await Ye(Ue(ue,"seasons",r.value,"events"));Pe.value=K.docs.map(Ae=>({id:Ae.id,...Ae.data()}));const oe=await Ye(Ue(ue,"seasons",r.value,"availability")),ve={};oe.docs.forEach(Ae=>{ve[Ae.id]=Ae.data()}),$e.value=ve;const le=await Ye(Ue(ue,"seasons",r.value,"selections")),xe={};le.docs.forEach(Ae=>{xe[Ae.id]=Ae.data().players||[]}),Te.value=xe}E(),k(),console.log("players (deduplicated):",Fe.value.map(C=>({id:C.id,name:C.name})))});function $t(D,R){const C=Fe.value.find(le=>le.name===D);if(!C){console.error("Joueur non trouvé:",D);return}if(!Pe.value.find(le=>le.id===R)){console.error("Événement non trouvé:",R);return}C.availabilities||(C.availabilities={});const oe=C.availabilities[R];let ve;oe==="oui"?(ve="non",C.availabilities[R]=ve):oe==="non"?(delete C.availabilities[R],ve=void 0):(ve="oui",C.availabilities[R]=ve),ve===void 0?$e.value[C.name]&&delete $e.value[C.name][R]:($e.value[C.name]||($e.value[C.name]={}),$e.value[C.name][R]=ve==="oui"),mf(C.name,{...C.availabilities},r.value).then(()=>{q.value=!0,U.value="Disponibilité mise à jour avec succès !",setTimeout(()=>{q.value=!1},3e3)}).catch(le=>{console.error("Erreur lors de la mise à jour de la disponibilité:",le),alert("Erreur lors de la mise à jour de la disponibilité. Veuillez réessayer.")})}function nt(D,R){var C;return(C=$e.value[D])==null?void 0:C[R]}function L(D,R){var oe;const C=Te.value[R]||[],K=(oe=$e.value[D])==null?void 0:oe[R];return C.includes(D)&&K===!0}async function te(D,R=6){const K=Fe.value.filter(le=>nt(le.name,D)).map(le=>{const xe=ne(le.name);return{name:le.name,weight:1/(1+xe)}}),oe=[],ve=[...K];for(;oe.length<R&&ve.length>0;){const le=ve.reduce((qt,dr)=>qt+dr.weight,0);let xe=Math.random()*le;const Ae=ve.findIndex(qt=>(xe-=qt.weight,xe<=0));Ae>=0&&(oe.push(ve[Ae].name),ve.splice(Ae,1))}Te.value[D]=oe,await rS(D,oe,r.value),E(),k()}function X(D){var C;return D?(typeof D=="string"?new Date(D):((C=D.toDate)==null?void 0:C.call(D))||D).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"}):""}function ne(D){return Object.values(Te.value).filter(R=>R.includes(D)).length}function ye(D){const R=$e.value[D]||{};return Object.values(R).filter(C=>C===!0).length}function Ne(D){const R=ye(D),C=ne(D);return R===0?0:C/R}function _(D){Ke.value[D]={availability:ye(D),selection:ne(D),ratio:Ne(D)}}function E(){Fe.value.forEach(D=>_(D.name))}function k(D=6){const R={};Pe.value.forEach(C=>{const oe=Fe.value.filter(le=>nt(le.name,C.id)===!0).map(le=>{const xe=ne(le.name);return{name:le.name,weight:1/(1+xe)}}),ve=oe.reduce((le,xe)=>le+xe.weight,0);oe.forEach(le=>{const xe=Math.min(1,le.weight/ve*D);R[le.name]||(R[le.name]={}),R[le.name][C.id]=Math.round(xe*100)})}),Wt.value=R}function j(D,R){var le,xe;const C=D.name,K=nt(C,R),oe=L(C,R),ve=((xe=(le=Wt.value)==null?void 0:le[C])==null?void 0:xe[R])??0;return K===!1?"Non disponible – cliquez pour changer":oe?`Sélectionné · Chance estimée : ${ve}%`:K===!0?`Disponible · Chance estimée : ${ve}%`:"Cliquez pour indiquer votre disponibilité"}const M=Re(null),$=Re(!1);async function Z(){$.value=!1;try{await tS(M.value,r.value),Fe.value=Fe.value.filter(D=>D.id!==M.value),M.value=null,q.value=!0,U.value="Joueur supprimé avec succès !",setTimeout(()=>{q.value=!1},3e3)}catch(D){console.error("Erreur lors de la suppression du joueur :",D),alert("Erreur lors de la suppression du joueur. Veuillez réessayer.")}}function Q(){$.value=!1,M.value=null}function W(D){M.value=D,$.value=!0}function z(D,R=6){Te.value[D]&&Te.value[D].length>0?(x.value=!0,N.value=D):te(D,R)}function ie(){N.value&&(te(N.value,6),x.value=!1,N.value=null)}function ee(){x.value=!1,N.value=null}return(D,R)=>(Ie(),ke(ft,null,[B("div",aS,[B("h1",lS,Qt(n.value?`Saison : ${n.value}`:""),1),B("div",cS,[B("table",uS,[B("colgroup",null,[R[10]||(R[10]=B("col",{style:{width:"10%"}},null,-1)),R[11]||(R[11]=B("col",{style:{width:"10%"}},null,-1)),(Ie(!0),ke(ft,null,Er(Pe.value,(C,K)=>(Ie(),ke("col",{key:K,style:ni("width: calc(70% / "+Pe.value.length+");")},null,4))),128)),R[12]||(R[12]=B("col",{style:{width:"5%"}},null,-1))]),B("thead",null,[B("tr",hS,[B("th",dS,[B("div",fS,[R[13]||(R[13]=B("span",{class:"font-semibold text-4xl sm:text-base relative group"},[B("span",{class:"border-b border-dashed border-gray-400"}," Joueur ")],-1)),B("button",{onClick:R[0]||(R[0]=C=>p.value=!0),class:"text-4xl sm:text-base text-blue-500 hover:text-blue-700 cursor-pointer",title:"Ajoutez un joueur"}," ➕ ")])]),R[14]||(R[14]=B("th",{class:"p-3 text-center"},[B("span",{class:"text-4xl sm:text-base"},"📊 Stats")],-1)),(Ie(!0),ke(ft,null,Er(Pe.value,C=>(Ie(),ke("th",{key:C.id,class:"p-3 text-center",onMouseenter:K=>w.value=C.id,onMouseleave:R[3]||(R[3]=K=>w.value=null),onDblclick:K=>_e(C)},[B("div",mS,[B("div",gS,[a.value!==C.id?(Ie(),ke("div",_S,[B("span",{class:"hover:border-b hover:border-dashed hover:border-gray-400 cursor-help transition-colors duration-200",title:"Double-clic pour modifier : "+C.title+" - "+X(C.date)},Qt(C.title),9,yS)])):(Ie(),ke("div",vS,[Un(B("input",{"onUpdate:modelValue":R[1]||(R[1]=K=>l.value=K),type:"text",class:"w-full p-1 border rounded",onKeydown:[Br(P,["esc"]),Br(I,["enter"])],ref_for:!0,ref:"editTitleInput"},null,544),[[$n,l.value]])])),a.value!==C.id?(Ie(),ke("div",{key:2,class:"text-xs text-gray-500 cursor-help hover:border-b hover:border-dashed hover:border-gray-400 transition-colors duration-200 inline-block",title:"Double-clic pour modifier : "+C.title+" - "+X(C.date)},Qt(X(C.date)),9,ES)):(Ie(),ke("div",wS,[Un(B("input",{"onUpdate:modelValue":R[2]||(R[2]=K=>c.value=K),type:"date",class:"w-full p-1 border rounded",onKeydown:[Br(P,["esc"]),Br(I,["enter"])]},null,544),[[$n,c.value]])])),B("button",{onClick:K=>G(C.id),class:ri(["absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity",{"opacity-100":w.value===C.id}])}," ❌ ",10,TS)])])],40,pS))),128)),B("th",IS,[B("button",{onClick:R[4]||(R[4]=C=>tt.value=!0),class:"text-gray-500 hover:text-blue-500",title:"Ajouter un nouvel événement"}," ➕ ")])]),B("tr",bS,[R[15]||(R[15]=B("th",{class:"p-3 text-left w-[100px]"},null,-1)),R[16]||(R[16]=B("th",{class:"p-3 text-center text-4xl sm:text-base w-[100px]"},null,-1)),(Ie(!0),ke(ft,null,Er(Pe.value,C=>(Ie(),ke("th",{key:C.id,class:"p-3 text-center w-40"},[B("button",{onClick:K=>z(C.id,6),class:"rounded-md text-2xl sm:text-base bg-white hover:bg-gray-50 hover:border-gray-200 border shadow text-gray-800 p-1 w-8 h-8 flex items-center justify-center mx-auto",title:Te.value[C.id]&&Te.value[C.id].length>0?"Relancer la sélection":"Lancer la sélection"}," 🎭 ",8,AS)]))),128)),R[17]||(R[17]=B("th",{class:"p-3"},null,-1))])])])]),B("div",RS,[B("table",SS,[B("colgroup",null,[R[18]||(R[18]=B("col",{style:{width:"10%"}},null,-1)),R[19]||(R[19]=B("col",{style:{width:"10%"}},null,-1)),(Ie(!0),ke(ft,null,Er(Pe.value,(C,K)=>(Ie(),ke("col",{key:K,style:ni("width: calc(70% / "+Pe.value.length+");")},null,4))),128)),R[20]||(R[20]=B("col",{style:{width:"5%"}},null,-1))]),B("tbody",PS,[(Ie(!0),ke(ft,null,Er(Fe.value,C=>(Ie(),ke("tr",{key:C.id,class:ri(["odd:bg-white even:bg-gray-50 border-b",{"highlighted-player":C.id===y.value}]),"data-player-id":C.id},[B("td",kS,[h.value!==C.id?(Ie(),ke("div",xS,[B("span",{onDblclick:K=>v(C),class:"hover:border-b hover:border-dashed hover:border-gray-400 edit-cursor transition-colors duration-200",title:"Double-clic pour modifier : "+C.name},Qt(C.name),41,DS),B("button",{onClick:K=>W(C.id),class:"hidden group-hover:block text-red-500",title:"Supprimer le joueur"}," 🗑️ ",8,VS)])):(Ie(),ke("div",NS,[Un(B("input",{"onUpdate:modelValue":R[5]||(R[5]=K=>d.value=K),type:"text",class:"w-full p-1 border rounded",onKeydown:[Br(b,["esc"]),Br(T,["enter"])],ref_for:!0,ref:"editPlayerInput"},null,544),[[$n,d.value]])]))]),B("td",OS,[B("span",{title:`${ne(C.name)} sélection${ne(C.name)>1?"s":""}, ${ye(C.name)} dispo${ye(C.name)>1?"s":""}`},Qt(ne(C.name))+"/"+Qt(ye(C.name)),9,MS)]),(Ie(!0),ke(ft,null,Er(Pe.value,K=>(Ie(),ke("td",{key:K.id,class:"p-4 sm:p-3 text-center cursor-pointer hover:bg-blue-100",onClick:oe=>$t(C.name,K.id)},[L(C.name,K.id)?(Ie(),ke("span",{key:0,title:j(C,K.id)}," 🎭 ",8,FS)):nt(C.name,K.id)?(Ie(),ke("span",{key:1,title:j(C,K.id)}," ✅ ",8,US)):nt(C.name,K.id)===!1?(Ie(),ke("span",{key:2,title:j(C,K.id)}," ❌ ",8,BS)):(Ie(),ke("span",{key:3,title:j(C,K.id)}," – ",8,jS))],8,LS))),128)),R[21]||(R[21]=B("td",{class:"p-3"},null,-1))],10,CS))),128))])])])]),q.value?(Ie(),ke("div",$S,Qt(U.value),1)):Bn("",!0),tt.value?(Ie(),ke("div",qS,[B("div",HS,[R[24]||(R[24]=B("h2",{class:"text-xl font-bold mb-4"},"Nouvel événement",-1)),B("div",zS,[R[22]||(R[22]=B("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Titre",-1)),Un(B("input",{"onUpdate:modelValue":R[6]||(R[6]=C=>ot.value=C),type:"text",class:"w-full p-2 border rounded focus:ring-2 focus:ring-blue-500",placeholder:"Titre de l'événement"},null,512),[[$n,ot.value]])]),B("div",KS,[R[23]||(R[23]=B("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Date",-1)),Un(B("input",{"onUpdate:modelValue":R[7]||(R[7]=C=>je.value=C),type:"date",class:"w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"},null,512),[[$n,je.value]])]),B("div",{class:"flex justify-end space-x-2"},[B("button",{onClick:Ee,class:"px-4 py-2 text-gray-700 hover:text-gray-900"}," Annuler "),B("button",{onClick:we,class:"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"}," Créer ")])])])):Bn("",!0),p.value?(Ie(),ke("div",WS,[B("div",GS,[R[26]||(R[26]=B("h2",{class:"text-xl font-bold mb-4"},"Nouveau joueur",-1)),B("div",QS,[R[25]||(R[25]=B("label",{class:"block text-sm font-medium text-gray-700 mb-1"},"Nom",-1)),Un(B("input",{"onUpdate:modelValue":R[8]||(R[8]=C=>g.value=C),type:"text",class:"w-full p-2 border rounded focus:ring-2 focus:ring-blue-500",placeholder:"Nom du joueur"},null,512),[[$n,g.value]])]),B("div",JS,[B("button",{onClick:R[9]||(R[9]=C=>p.value=!1),class:"px-4 py-2 text-gray-700 hover:text-gray-900"}," Annuler "),B("button",{onClick:A,class:"px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"}," Ajouter ")])])])):Bn("",!0),s.value?(Ie(),ke("div",YS,[B("div",{class:"bg-white p-6 rounded-lg shadow-lg w-96"},[R[27]||(R[27]=B("h2",{class:"text-xl font-bold mb-4"},"Confirmation",-1)),R[28]||(R[28]=B("p",{class:"mb-4"},"Êtes-vous sûr de vouloir supprimer ?",-1)),B("div",{class:"flex justify-end space-x-2"},[B("button",{onClick:ge,class:"px-4 py-2 text-gray-700 hover:text-gray-900"}," Annuler "),B("button",{onClick:J,class:"px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"}," Supprimer ")])])])):Bn("",!0),$.value?(Ie(),ke("div",XS,[B("div",{class:"bg-white p-4 rounded shadow"},[R[29]||(R[29]=B("p",{class:"mb-4"},"Êtes-vous sûr de vouloir supprimer ce joueur ?",-1)),B("div",{class:"flex justify-end space-x-2"},[B("button",{onClick:Q,class:"px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"},"Annuler"),B("button",{onClick:Z,class:"px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"},"Supprimer")])])])):Bn("",!0),x.value?(Ie(),ke("div",ZS,[B("div",{class:"bg-white p-6 rounded-lg shadow-lg w-96"},[R[30]||(R[30]=B("h2",{class:"text-xl font-bold mb-4"},"Confirmation",-1)),R[31]||(R[31]=B("p",{class:"mb-4"},"Attention, toute la sélection sera refaite en fonction des disponibilités actuelles. Pensez à prévenir les gens du changement !",-1)),B("div",{class:"flex justify-end space-x-2"},[B("button",{onClick:ee,class:"px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"},"Annuler"),B("button",{onClick:ie,class:"px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded"},"Confirmer")])])])):Bn("",!0)],64))}},tP=[{path:"/",component:JR},{path:"/season/:slug",component:eP,props:!0}],nP=UE({history:pE("/impro-selector/"),routes:tP});Nv(Lv).use(nP).mount("#app");
