---
title: "Arrr Where's My Treasure"
author: w1zardess
tags: ["web", "misc"]
date: 2025-04-23
---

We are first presented by this map:


It tells us that the treasure is likely hidden on `umbccd.net` (which we know is owned by the CTF organizers as they have reused this domain to host other challenges).

Looking at the DNS records of `umbccd.net` we get this TXT record:

```py
"DawgCTF{"

"I52XEIDFOJTGOIDCOMQGYYTIMUQGOZLSNZTGQZLSEB3GMIDPNBSXM4TREBVHK4TFOIQGO5LSEB4HE4TDOJSSAYTTEBTXK4RAEJ5G4ZTHOJSWMIRAOBZGKZ3GEB4XM2LSMY======"

"QXJycnJfMV8="

"V29haCB5b3UgcmVhbGl6ZWQgaXRzIEJhc2U2NCEgS2VlcCB0aGlzIGluIG1pbmQhISE="

"eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJtZXNzYWdlIjoiVGhlIGtleSBpcyBVIiwiaWF0IjoxNzQ0NzY4Njc3fQ."
```

As well as an MX record pointing to `masters.umbccd.net` and a LOC record pointing to a location in Havanna Cuba.

The first string of the TXT matches the Flag prefix of DawgCTF. It is followed by a string that is encoded in Base32 and then rotated 13 letters (Rot13) and says: `The rest of your treasure is buried where the keeper of the "masters" certs lives`. Then we get `Arrrr_1_` by Base64 decoding the next part. This is likely the beginning of the flag. The next string is also Base64 and translates to: `Woah you realized its Base64! Keep this in mind!!!`. The last part is a JWT token that translates to:

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

Looking at the hint from the second string, talking about the masters cert, we dig for the CAA records on the previosly discovered `masters.umbccd.net.` subdomain. This reveals the next target: `applesause.net`.

In the TXT records of `applesause.net` we see:

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

The unreadable part can be decoded using Base32, which reveals morse code. Decoding the morse code gives us a second Base32 encoded string which reads: `[CITY]_[COUNTRY]}`.

City and country? We can find these in the LOC record on the `umbccd.net`domain.

So far we have: `DawgCTF{Arrrr_1_Havana_Cuba}`.

Clearly there is something missing in the middle.

The quotes we got from the TXT records are all about the past and history. So we look at the [DNS history](https://dnshistory.org/historical-dns-records/txt/applesause.net) of all three domains and we find that the TXT record of `applesause.net` once said: `OWQeZgohZQoDZGYhCg==`.
This is Base64 encoded and XORed with the key `U` which we found as a JWT in the TXT record of `umbccd.net`. It is the last part of the flag: `l1K3_t0_V13t_`.

Solved! The final flag is `DawgCTF{Arrrr_1_l1K3_t0_V13t_Havana_Cuba}`.

