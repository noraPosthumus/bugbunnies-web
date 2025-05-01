---
title: "Arrr... I found your Treasure"
author: w1zardess
tags: ["web", "misc"]
date: 2025-05-01
---

## Treasure Map

We're first presented with this map:

![Treasure Map](/assets/images/dawg/map.png)

It tells us the treasure is likely hidden on `umbccd.net`, a domain we recognize from other challenges — clearly owned by the CTF organizers.

## Where to Look?

Opening `umbccd.net` in a browser doesn't get us far — there’s no HTTP server running. But we probably aren’t meant to brute-force ports, or directories on a random domain unless told otherwise. The real treasure must lie elsewhere.

So we turn to the DNS records. And sure enough, we strike gold in the `TXT` record:
```py
"DawgCTF{"

"I52XEIDFOJTGOIDCOMQGYYTIMUQGOZLSNZTGQZLSEB3GMIDPNBSXM4TREBVHK4TFOIQGO5LSEB4HE4TDOJSSAYTTEBTXK4RAEJ5G4ZTHOJSWMIRAOBZGKZ3GEB4XM2LSMY======"

"QXJycnJfMV8="

"V29haCB5b3UgcmVhbGl6ZWQgaXRzIEJhc2U2NCEgS2VlcCB0aGlzIGluIG1pbmQhISE="

"eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJtZXNzYWdlIjoiVGhlIGtleSBpcyBVIiwiaWF0IjoxNzQ0NzY4Njc3fQ."
```

We also notice:

- An `MX` record pointing to `masters.umbccd.net`
- A `LOC` record placing the domain in Havana, Cuba

## Sailing after the clues

Let’s break the `TXT` record down, piece by piece:
- `DawgCTF{` — The flag prefix. We're definitely on the right track.
- A long Base32 string — After decoding and shifting each letter in the alphabet by 13 (ROT13), we get:
    "The rest of your treasure is buried where the keeper of the 'masters' certs lives."
- `QXJycnJfMV8=` — Base64 decoding gives us Arrrr_1_, possibly the start of the flags content.
- Another Base64 string — Decodes to:
    "Woah you realized it's Base64! Keep this in mind!!!"
    Clearly a hint for later.
- A JWT token — When decoded, we get:
```json
{
  "alg": "none",
  "typ": "JWT"
}
{
  "message": "The key is U",
  "iat": 1744768677
}
```

## Digging deeper

Taking the hint from the earlier message ("where the keeper of the masters certs lives"), we investigate the CAA records of `masters.umbccd.net`. Wich leads us to a new domain: `applesause.net`.

Querying the `TXT` records of `applesause.net` returns this:

```py
"Arr, Here is some of my favorite quotes!"

"FYWS4LRAFUXCALJOFYXCALROFUQC4LROEAXC4LRNEAWS4LJOEAWS2LROEAXC2LROEAXC4LRNEAXC2LJOEAXC4LRNEAXC2LJAFUWS4LJAFYXC2LJNEAXC2LJOEAWS4LJAFYXC4LJAFYXC4LRAFYXC2LRAFYXCALROFUQC4LROEAWS2LROEAXC2LROEAXC4LRNEAWS4LROFYQC2LJOFUQC2LROFYWSALJOFYXC2IBNFYXC4LJAFUXC4LRN"

"History isnt behind us. Its beneath our feet, waiting to be uncovered."

"Sometimes the past is the key to the future, you just have to know where to dig."

"The past beats inside me like a second heart."

"The past is a place of reference, not a place of residence."

"Whats past is prologue."

"You cant change the past, but you can learn from it."
```

That long encoded string? It’s Base32-encoded morse code. Decode it and you'll get another Base32 string, which finally decodes to: `[CITY]_[COUNTRY]}`

City and country? We can find these in the `LOC` record on the `umbccd.net` domain.

So far we have: `DawgCTF{Arrrr_1_Havana_Cuba}`.

But something’s still missing in the middle.

## Learning from the past

All those quotes about the past? They’re not just filler. They're telling us to look back in time.

Using DNSHistory.org, we check the historical `TXT` records for all three domains.

There it is:
`OWQeZgohZQoDZGYhCg==`
This Base64-encoded string used to be in `applesause.net`'s `TXT` record.

But what is it? Base64 decoding alone doesn't produce anything human readable. Wait — have we tried XORing it with the key `U` (that we found earlier in the JWT token)? Indeed this is the correct approach and it leads to this: `l1K3_t0_V13t_`.

Piecing it all together, we finally dug up the treasure: `DawgCTF{Arrrr_1_l1K3_t0_V13t_Havana_Cuba}`.

