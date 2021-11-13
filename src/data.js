'use strict';

const { libs } = nodex;
const { mysql } = libs;


exports.init = async function (args) { 
  console.log('data init.');
  console.log('data init args:', args);
  await mysql.init(args.mysql);
};
