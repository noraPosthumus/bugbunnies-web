---
title: "How I found the Seeds"
author: w1zardess
tags: ["misc", "crypto"]
date: 2025-04-30
---

Challenge:

> can u help Alice find her seeds in the bin? She's pretty sure the bin hasn't been dumped since it was generated.

Two files are provided:
- secret.bin (the secret message to decrypt)
- secret.py (includes the script used to generate secret.bin)

```py
import random
import time

seed = int(time.time())
random.seed(seed)

plaintext = b"UMDCTF{REDACTED}"
keystream = bytes([random.getrandbits(8) for _ in range(len(plaintext))])
ciphertext = bytes([p ^ k for p, k in zip(plaintext, keystream)])

with open("secret.bin", "wb") as f:
    f.write(ciphertext)
```

We can see that the message is encrypted by XORing each byte with a randomly generated number. The random numbers are generated with a time based seed. Because the time is casted to `int` there is only a limited amount of possible seeds, especially as we can assume the message was encrypted recently. I wrote this script to brute force seeds until the message made sense.

```

```
