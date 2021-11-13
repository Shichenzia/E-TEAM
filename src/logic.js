'use strict';

exports.init = async function (args) { 
  console.log('logic init.');
  console.log('logic init args:', args);
};

exports.helloWorld = async function () {
  return 'hello world!';
};