---
title: "How I found the Seeds"
author: w1zardess
tags: ["misc", "crypto"]
date: 2025-04-30
---

## Challenge:

> can u help Alice find her seeds in the bin? She's pretty sure the bin hasn't been dumped since it was generated.

Two files are provided:
- secret.bin — this holds the encrypted message
- secret.py — the script that created it

Here's a look at secret.py:
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

So, what’s happening here?

The plaintext (which is the flag) is encrypted by XORing it byte-by-byte with a keystream of random bytes. These random bytes are generated using Python’s `random`-module, which is used with a seed — in this case, the current unix timestamp (as an integer).

Since the seed is based on `int(time.time())`, it only changes once per second. That means there’s a small window of possible values — especially if we assume this file was generated recently. Even better, `time.time()` is predictable and linear, so we can brute-force seeds by trying different timestamps.

## Our attack plan:

- Guess a time close to when secret.bin was created.

- For each possible second (seed), generate the keystream.

- XOR the keystream with the ciphertext.

- Check if the result looks like a valid flag.

## Implementation

Here’s the brute-force script I wrote to do just that:
```py
import random
import base64
import time

plaintext = ""
try_time = 1744600040

while not plaintext.startswith("UMDCTF{") and try_time < time.time():

    seed = int(try_time)
    random.seed(seed)

    ciphertext = base64.b64decode("EEeot8r8yDf8nXGyvyndCCEjYQY8Cv8a80XO3D0wAOE3Kw==") # this is the secret.bin as base64
    keystream = bytes([random.getrandbits(8) for _ in range(len(ciphertext))])
    try:
        plaintext = bytes([p ^ k for p, k in zip(ciphertext, keystream)]).decode()
    except UnicodeDecodeError:
        pass
    finally:
        try_time += 1

print(plaintext)
```

This script starts at a guessed timestamp and moves forward in time, one second at a time, generating possible seeds until the output starts with `UMDCTF{`. Once we hit that, we know we’ve found the seeds and successfully decrypted the message.
