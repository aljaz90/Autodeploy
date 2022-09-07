# Autodeploy
Autodeploy is a script used with Github webhooks it can execute shell scripts on Linux environments when it recieves a ping from Github webhooks. Those scripts can be used for building and deploying your applications on Linux machines.

## Usage

```
npm install
// Set variables PORT, GITHUB_SECRET, PATH_TO_SHELL_SCRIPT, RUN_SCRIPT_WITH_SUDO, WATCH_BRANCHES in app.js
node app.js // or sudo node app.js (if needed)
```

## Requirements

* Node.js v12 or later
