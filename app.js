const express       = require("express"),
      app           = express(),
      bodyParser    = require("body-parser"),
      crypto        = require("crypto"),
      { execSync }  = require('child_process'),
      PORT	        = 5000,
      GITHUB_SECRET = "",
      sigHeaderName = 'X-Hub-Signature-256',
      sigHashAlg    = 'sha256';

console.log(GITHUB_SECRET)
    
app.use(bodyParser.json({
    verify: (req, res, buf, encoding) => {
        if (buf && buf.length) {
            req.rawBody = buf.toString(encoding || 'utf8');
        }
    },
}));

function verifySecret(req, res, next) {
    if (!req.rawBody) {
        console.log("Body is empty")
        return res.end();
    }

    const sig = Buffer.from(req.get(sigHeaderName) || '', 'utf8');
    const hmac = crypto.createHmac(sigHashAlg, GITHUB_SECRET);
    const digest = Buffer.from(sigHashAlg + '=' + hmac.update(req.rawBody).digest('hex'), 'utf8');
    if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
        console.log("Hashes don't match");
        return res.end();
    }

    return next()
}

app.post("/deploy", verifySecret, (req, res) => {
    try {
        if (req.body.ref.includes("/production")  && req.body.head_commit?.author?.name !== "server@home") {
            console.log("Running script")
            execSync("sudo sh /home/aljaz-adm/Documents/LearnZone/autodeploy.sh");
            console.log("Script executed successfully")
        }
    } 
    catch (error) {
        console.log("Error while executing script");
        console.log(error);
    }

    res.end();
});

app.listen(PORT, () => {
    console.log("[RUN] Running on port " + PORT);
});
