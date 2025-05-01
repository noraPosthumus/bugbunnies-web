---
title: "I caught a bad case of Brainrot after using this Dictionary"
author: w1zardess
tags: ["web"]
date: 2025-05-01
---

## Challenge Overview

The challenge first leads us to a website that appears to be a dictionary for Gen-Alpha/brainrot slang. It also allows uploading custom dictionaries.

Luckily for us, we are provided with the source code of the website:
```py
#...
UPLOAD_FOLDER = 'uploads'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def create_uploads_dir(d=None):
    dirname = os.path.join(UPLOAD_FOLDER, ''.join(random.choices(string.ascii_letters, k=30)))
    if d is not None:
        dirname = d
    session['upload_dir'] = dirname
    os.mkdir(dirname)
    os.popen(f'cp flag.txt {dirname}')
    os.popen(f'cp basedict.brainrot {dirname}')

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'user_file' not in request.files:
            return render_template('index.html', error="L + RATIO + YOU FELL OFF")
        user_file = request.files['user_file']
        if not user_file.filename.endswith('.brainrot'):
            return render_template('index.html', error="sorry bruv that aint brainrotted enough")
        if 'upload_dir' not in session:
            create_uploads_dir()
        elif not os.path.isdir(session['upload_dir']):
            create_uploads_dir(session['upload_dir'])
        fname = unquote(user_file.filename)
        if '/' in fname:
            return render_template("index.html", error="dont do that")
        user_file.save(os.path.join(session['upload_dir'], fname))
        return redirect(url_for('dict'))
    return render_template('index.html')

@app.route('/dict')
def dict():
    if 'upload_dir' not in session:
        create_uploads_dir()
    elif not os.path.isdir(session['upload_dir']):
        create_uploads_dir(session['upload_dir'])

    cmd = f"find {session['upload_dir']} -name \\*.brainrot | xargs sort | uniq"
    results = os.popen(cmd).read()
    return render_template('dict.html', results=results.splitlines())
#...
```

## Taking a closer look

We can immediately tell that the bulk of the code is dedicated to handling custom dictionary uploads. It is therefore likely that this feature can be exploited.

On line 25, we can see that a file named `flag.txt` is copied into our upload directory. That’s probably what we need to extract.

Toward the bottom of the code (on line 54), we see that a concatenation of shell commands is used to read the dictionary entries.

## Exploiting the file uplaod

Looking at the man-pages of one of the commands, `xargs`, it mentions that filenames with spaces are incorrectly handled if the `-0` option is not provided. This opens up an interesting opportunity for exploitation:

by uploading a file with a space in the filename, like `flag.txt%20basedict.brainrot` (`%20` gets URL-decoded to a space by the unquote function) it gets interpreted as two seperate files. Xargs then forwards both `flag.txt` and `basedict.brainrot` as arguments to `sort` and then to `uniq`.

After uploading the file with the malicious filename, we can see the flag listed as a dictionary entry.
