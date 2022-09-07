const express                = require("express"),
      app                    = express(),
      bodyParser             = require("body-parser"),
      crypto                 = require("crypto"),
      { execSync }           = require('child_process'),
      SIG_HEADER_NAME        = 'X-Hub-Signature-256',
      SIG_HASH_ALG           = 'sha256',
      // Config variables
      PORT	                 = 5000, // Set the port on which it will listen for GitHub webhook requests
      GITHUB_SECRET          = "",   // Set your GitHub webhook secret
      PATH_TO_SHELL_SCRIPT   = "",   // Set path to the shell script which will be executed
      RUN_SCRIPT_WITH_SUDO   = false,
      WATCH_BRANCHES         = [];   // Enter branch names to listen only for events on those brances or leave empty to listen on all branches
    
app.use(bodyParser.json({
    verify: (req, res, buf, encoding) => {
        if (buf && buf.length) {
            req.rawBody = buf.toString(encoding || 'utf8');
        }
    },
}));

function verifySecret(req, res, next) {
    if (!req.rawBody) {
        console.log("[ERROR] Request recieved: No payload");
        return res.end();
    }

    const sig = Buffer.from(req.get(SIG_HEADER_NAME) || '', 'utf8');
    const hmac = crypto.createHmac(SIG_HASH_ALG, GITHUB_SECRET);
    const digest = Buffer.from(SIG_HASH_ALG + '=' + hmac.update(req.rawBody).digest('hex'), 'utf8');
    if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
        console.log("[WARN] Request recieved: Hashes don't match!");
        return res.status(401).send("401 Unauthorized").end();
    }

    return next()
}

app.post("/deploy", verifySecret, (req, res) => {
    res.status(200).send("OK");

    try {
        let branch = req.body.ref.split("/")[2];

        if (WATCH_BRANCHES.length === 0 || WATCH_BRANCHES.includes(branch)) {
            console.log("[INFO] Request recieved: branch match: Running script")
            let commandToRun = `sh ${PATH_TO_SHELL_SCRIPT}`;
            if (RUN_SCRIPT_WITH_SUDO) {
                commandToRun = "sudo " + commandToRun;
            }
    	    
            execSync(commandToRun);
        }
    } 
    catch (error) {
        console.log("[ERROR] An error occured while trying to execute the script");
        console.log(error);
    }
});

app.listen(PORT, () => {
    console.log("[INFO] Running on port " + PORT);
});
