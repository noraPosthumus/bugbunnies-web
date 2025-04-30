---
title: "My Brain rotted reading this Dictionary"
author: w1zardess
tags: ["web"]
date: 2025-04-30
---

The challenge first leads us to a Website that appears to be a dictionary for gen-alpha/brainrot slang. The websites allows to upload custom dictionaries as well. Lucky for us we are also provided the source code of the website.

```py
# ...

app = Flask(__name__)
app.secret_key = os.urandom(32)
app.config['MAX_CONTENT_LENGTH'] = 1000

# Directory to save uploaded files and images
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



if __name__ == '__main__':
    app.run(debug=False, host="0.0.0.0")

```

We can immidiately tell that the largest portion of the code is dedicated to handling custom dictionary uploads. It is therefore likely that this feature can be exploited.

On line 25 we can see that a file named `flag.txt` is copied into our upload directory. That's probably what we need to extract. Towards the bottom of the code (on line 54) we see that a concatenation of cmd commands are used to read the dictionary entries. Looking at the manual pages for the `xargs` command it mentions that filenames with spaces are incorrectly handled if the `-0` option is not provided. We can exploit this by uploading a file with a space in the filename like this: `flag.txt basedict.brainrot`. Now xargs treats this as two seperate filenames and forwards both flag.txt and basedict.brainrot to sort and then finally to uniq. After uploading the file with the malicous filename we can see the flag listed as a dictionary item.
