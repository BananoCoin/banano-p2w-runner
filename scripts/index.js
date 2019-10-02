#!/usr/bin/env node
'use strict';

// libraries
const http = require('http');
const path = require('path');
const chalk = require('chalk');
const express = require('express');
const fs = require('fs');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bananojs = require('@bananocoin/bananojs');

// modules
const config = require('../config.json');
const game = require('./game.js');
const util = require('./util.js');
const home = require('./home.js');

// constants
const sessionState = {};

// variables

// functions
const checkPendingAndStartGamePeriodically = async () => {
  // console.log('checkPendingAndStartGamePeriodically');
  game.checkPendingAndStartGame().then(() => {
    // console.log('setTimeout', 'checkPendingAndStartGamePeriodically', config.checkPendingTimerMs);
    setTimeout(checkPendingAndStartGamePeriodically, config.checkPendingTimerMs);
  });
};

// app initialization
const init = async () => {
  const loggingUtil = {};
  loggingUtil.log = console.log;
  loggingUtil.debug = () => {};
  // loggingUtil.debug = console.log;
  loggingUtil.trace = () => {};
  // loggingUtil.trace = console.trace;

  util.init(config, loggingUtil);
  game.init(config, loggingUtil);
  home.init(config, loggingUtil);

  bananojs.setBananodeApiUrl(config.bananodeUrl);

  const serverWalletSeed = config.seed;
  const serverPrivateKey = bananojs.getPrivateKey(serverWalletSeed, 0);
  const serverPublicKey = bananojs.getPublicKey(serverPrivateKey);
  const serverAccount = bananojs.getAccount(serverPublicKey);

  loggingUtil.log(util.getDate(), 'serverAccount', serverAccount);

  checkPendingAndStartGamePeriodically();
  // setInterval(game.checkPendingAndStartGame, config.checkPendingTimerMs);

  const app = express();

  app.engine('handlebars', exphbs({
    defaultLayout: 'main',
  }));
  app.set('view engine', 'handlebars');

  app.use(express.static('static-html'));
  app.use(express.urlencoded({
    limit: '50mb',
    extended: true,
  }));
  app.use(bodyParser.json({
    limit: '50mb',
    extended: true,
  }));

  app.use(cookieParser(config.cookieSecret));

  app.get('/', async (req, res) => {
    res.render('p2w-runner', home.getData(sessionState, req, res));
  });

  app.post('/', async (req, res) => {
    const action = req.body.action;
    if (action == 'login') {
      const sessionKey = util.getSessionKeyFromCookie(req, res);
      if (sessionState[sessionKey] == undefined) {
        sessionState[sessionKey] = {};
      }
      sessionState[sessionKey].account = req.body.account;
    }
    if (action == 'logout') {
      const sessionKey = util.getSessionKeyFromCookie(req, res);
      delete sessionState[sessionKey];
    }
    res.redirect(302, '/');
  });


  app.get('/faq', async (req, res) => {
    res.render('faq', home.getData(sessionState, req, res));
  });

  app.post('/faq', async (req, res) => {
    res.redirect(302, '/faq');
  });

  const server = http.createServer(app);

  const serverInstance = server.listen(config.port, (err) => {
    if (err) {
      console.error(err);
    }
    console.log(util.getDate(), `banano-p2w-runner listening on PORT ${chalk.blue.bold(config.port)}`);
  });

  const io = require('socket.io')(server);
  io.on('connection', (socket) => {
    socket.on('npmStop', () => {
      socket.emit('npmStopAck');
      socket.disconnect(true);
      process.exit(0);
    });
  });
};

init();
