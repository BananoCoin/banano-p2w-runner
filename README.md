# banano-p2w-runner

# on your vps you must have the following:

  nodejs <https://nodejs.org/en/download/package-manager/>

  screen <https://linuxize.com/post/how-to-use-linux-screen/>

# run the following command to install:

  git clone <https://github.com/coranos/banano-p2w-runner.git>

  npm install

# setup configuration

  copy config-sample.json to config.json

  edit config.json and fill in:

  "cookieSecret": "",
  "seed": "",
  "representative": ""

# run the following command to start:

  npm start;

# go to this url to see the home page:

  <http://localhost:8282/>

## to run in background, use the command:

  npm run screenstart;

## to stop, use the command:

  npm stop;

### to stop and restart, use the command:

  npm run screenrestart;

### todo:
