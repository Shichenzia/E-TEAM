'use strict';

const { libs, runtime } = nodex;
const { smtp, authes, fmt, flakes, error, log } = libs;
const { Token, Code } = authes;
const { data } = runtime;

const channelOptions = {
  host: 'smtp.qq.com',
  post: 465,
  secure: true,
  secureContext: true,
  user: '2233801313@qq.com',
  pass: 'fmdcqlrihodcdjgf'
};
const channelObj = new smtp.Channel(channelOptions);
const codeObj = new Code(6, 6000);
const tokenObj = new Token('loginToken', 60000);
const idCreate = flakes.create();


exports.init = async function (args) { 
  console.log('logic init.');
  console.log('logic init args:', args);
  log.init({
    scope: "team",
    server: {
      url: "https://leansocket.tech/api/easegram-logs/add_logs",
      appid: "000ecbd8f11e0000000c",
      secret: "07aa5a84e5571f10daed5addd81c0064",
      interval: 6000
    },
    handler: ()=>{}
  });
};

exports.helloWorld = async function () {
  return 'hello world!';
};

/**
 * 获取验证码
 * @param {String} to 手机号或邮箱号
 * @param {String} type 验证码类型
 * @returns 
 */
exports.makeAuthCode = async function ({ to, type }) {
    if(type === 'email') {
      fmt.required(to,'email',0,30);
      const code =  codeObj.make('email', to);
      await sendEmail(to, code);
    }else if (type === 'sms') {
      fmt.required(to,/^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/,0,30);
      const code =  codeObj.make('sms', to);
      await sendPhone(to, code);
    }else {
      throw error('ERR_TYPE_ERROR', 'type error.');
    }
  return true;
};

/**
 * 邮箱登录 首次登录自动注册
 * @param {String} email 邮箱
 * @param {String} code 验证码
 * @returns 
 */
exports.authByEmail = async function ({ email, code }) {
    fmt.required(code,'string',0,6);
    fmt.required(email,'email',0,30);

    if(!checkCodes(email, 'email', code)) {
      return false;
    }

    let userData = await data.findUserByEmail(email);
    // 没有该邮箱自动注册
    if(!userData[0]) {
        const id = idCreate.get();
        const time = formatDate(new Date());
        await data.addUserByEmail({ id, email, time});
        userData = await data.findUserByEmail(email);
    } 
    const token = tokenObj.make(userData[0].c_id);
    const result = {
        userInfo: userData[0],
        token
    };

    return result;
};

/**
 * 手机号登录 首次登录自动注册
 * @param {String} phone 手机号
 * @param {String} code 验证码
 * @returns 
 */
exports.authByPhone = async function ({ phone, code }) {
  fmt.required(code,'string',0,6);
  fmt.required(phone,/^1(3\d|4[5-9]|5[0-35-9]|6[567]|7[0-8]|8\d|9[0-35-9])\d{8}$/, 0, 11);

  if(!checkCodes(phone, 'sms', code)) {
    return false;
  }

  let userData = await data.findUserByPhone(phone);
  if(!userData[0]) {
      const id = idCreate.get();
      const time = formatDate(new Date());
      await data.addUserByPhone({ id, phone, time});
      userData = await data.findUserByPhone(phone);
  } 
  const token = tokenObj.make(userData[0].c_id);
  const result = {
      userInfo: userData[0],
      token
  };

  return result;
};

/**
 * 账号密码登录
 * @param {String} passport 账号
 * @param {String} password 密码
 * @returns 
 */
exports.authByPass = async function ({ passport, password }) {
    fmt.required(passport, 'string', 1, 64);
    fmt.required(password, 'password', 1, 64);

    const userData = await data.authByPass({ passport, password });
    if(!userData[0]) {
        throw error('ERR_PASSWORD_ERROR', 'Incorrect account password.');
    }
    const token = tokenObj.make(userData[0].c_id);
    const result = {
        userInfo: userData[0],
        token
    };
    return result;
};

/**
 * 设置密码
 * @param {String} passport 作为账号的内容 可以是手机号也可以是邮箱
 * @returns 
 */
exports.setUserPass = async function ({ $_token, passport, password }) {
    fmt.required($_token, 'string', 1, 128);
    fmt.required(passport, 'string', 1, 128);
    fmt.required(password, 'string', 1, 128);
    
    const uid = checkToken($_token);
    await data.setUserPass({ uid, passport, password });
    return true;
};

/**
 * 设置姓名
 * @param {String} name 
 * @returns 
 */
 exports.setUserInfo = async function ({ token, name }) {
  // fmt.required(token, 'string', 0, 128);
  fmt.required(name, 'string', 1, 128);
  
  const uid = checkToken(token);
  await data.setUserInfo({ uid, name });
  return true;
};

exports.checkToken = async function ({ token }) {
  //  fmt.required(token, 'string', 0, 128);

  return checkToken(token);
};

/**
 * 根据token，查询用户信息
 * @param {String} token 
 * @returns 
 */
exports.getUserByToken = async function ({ token }) {

  const uid = checkToken(token);
  return await data.findUserById(uid);
};

/**
 * 根据id，查询用户信息
 * @param {String} uid 用户id
 * @returns 
 */
 exports.getUserById = async function ({ id, token }) {
  fmt.required(id, 'string', 2, 128);

  checkToken(token);
  return await data.findUserById(id);
};

/**
 * 根据name，查询用户列表（模糊查询）
 * @param {String} name 
 * @returns 
 */
 exports.getUserListByName = async function ({ name, token }) {
  // fmt.required(token, 'string', 0, 128);
  fmt.required(name, 'string', 0, 128);

  // 校验token是否有效
  checkToken(token);
  return await data.getUserListByName( { name });
};




/***********************组织架构**********************/


/**
 * 添加部门
 * name 部门名称
 * gid 所属部门Id
 * otherParams 其他额外数据
 * @param {*} param0 
 */
exports.createGroup = async function({ name, gid }) {
    fmt.required(name, 'string', 2, 64);
    fmt.required(gid, 'string', 2, 64);

    const c_id = idCreate.get();
    return await data.createGroup({ name, gid, c_id });
}

/**
 * 修改部门
 * id 修改的部门id
 * gid 上级部门id
 * name 部门名称
 * @param {*} param0 
 */
exports.updateGroup = async function({ id, gid, name }) {
    fmt.required(id, 'string', 2, 64);
    fmt.required(name, 'word', 2, 64);
    fmt.required(gid, 'string', 2, 64);

    return await data.updateGroup({ id, gid, name });
}


/**
 * 删除部门
 * id 删除部门的部门id
 * @param {*} param0 
 */
exports.deleteGroup = async function({ id }) {
    fmt.required(id, 'word', 2, 64);
    return await data.deleteGroup({ id });
}

/**
 * 获取所有部门
 * @param {*} param0 
 */
exports.getAllGroupList = async function() {
    const allGroupList = await data.getAllGroupList();
    const children = recursionGroupChild(allGroupList, "0001");
    const groupTree = {
        c_id: '0001',
        c_name: 'EaseOA',
        c_gid: '0001000',
        children
    };
    return groupTree;
}

/**
 * 获取某部门下所有一级部门列表
 * @param {String} gid 上级部门id 
 */
exports.getGroupListByGid = async function({ gid }) {
    fmt.required(gid, 'word', 2, 64);
    return await data.getGroupListByGid({ gid });
}
  
/**
 * 获取某部门下所有用户
 * @param {*} param0 
 */
exports.getMemberListByGid = async function({gid}) {
    fmt.required(gid, 'word', 2, 64);
    return await data.getMemberListByGid({ gid });
}

/**
 * 添加用户到某部门
 * uid 用户id
 * gid 部门id
 * @param {*} param0 
 */
exports.createMember = async function({ uid, gid }) {
    fmt.required(gid, 'word', 2, 64);
    fmt.required(uid, 'word', 2, 64);

    await checkRepetitionAdd(uid, gid);

    const c_id = idCreate.get();
    return await data.createMember({ c_id, uid, gid });
}

/**
 * 更新成员信息 变更部门
 * c_id id
 * gid 部门id
 * uid 用户id
 * @param {*} param0 
 */
exports.updateMember = async function({c_id, uid, gid }) {
    fmt.required(c_id, 'word', 2, 64);
    fmt.required(gid, 'word', 2, 64);
    fmt.required(uid, 'word', 2, 64);

    await checkRepetitionAdd(uid, gid);

    return await runtime.data.updateMember({ c_id, uid, gid });
}

/**
 * 删除成员
 * @param {*} param0 
 */
exports.deleteMember = async function({ id }) {
    fmt.required(id, 'word', 2, 64);
    return await runtime.data.deleteMember({ id });
}


/**
 * 获取成员列表
 * @param {*} params 
 */
exports.listMember = async function() {
    return await runtime.data.listMember();
}

/**
 * 获取某个部门下的成员列表
 * @param {*} params 
 */
exports.listMemberByGid = async function({ gid }) {
    fmt.required(gid, 'word', 2, 64);

    return await runtime.data.listMemberByGid({ gid });
}


/**********************工具函数************************** */
/**
 * 发送邮件验证码
 * @param {String} to 目标邮件
 * @param {String} code 验证码
 */
 async function sendEmail(to, code) {
  await channelObj.sendQuickly(
    to,
    'EaseOA',
    `【EaseOA】尊敬的用户：您的校验码：${code}(有效期为10分钟), 如果不是您操作，请忽略。同时，工作人员不会索取，请勿泄漏。`
  );
}

/**
* 发送手机验证码
* @param {String} to 目标手机
* @param {String} code 验证码
*/
async function sendPhone(to, code) {
  console.log(to, code);
}

/**
 * 校验邮箱code
 * @param {String} to 要检验的邮箱或手机
 * @param {String} type 校验类型email | sms
 * @param {String} code 要校验的验证码
 * @returns 校验是否通过
 */
function checkCodes(to, type, code) {
    console.log(to, type, code);
    const checkCode = codeObj.check(type, to);
    console.log(checkCode);

    if(checkCode && code === checkCode.code && to === checkCode.to) {
      return true;
    }
    return false;
}

/**
 * 对日期格式进行处理 xxxx-xx-xx xx:xx
 * @param {Date} date 日期
 * @returns {string} 出理后的日期
 */
 function formatDate(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? "0" + m : m;
    var d = date.getDate();
    d = d < 10 ? "0" + d : d;
    var h = date.getHours();
    h = h < 10 ? "0" + h : h;
    var minute = date.getMinutes();
    minute = minute < 10 ? "0" + minute : minute;
    var second = date.getSeconds();
    second = second < 10 ? "0" + second : second;
    return y + "-" + m + "-" + d + " " + h + ":" + minute + ":" + second;
}

function checkToken (token) {
  console.log(token);
  const tokenSession = tokenObj.check(token);
  console.log(tokenSession);
  if(!tokenSession) {
    throw error('ERR_TOKEN_INVALID', 'Token invalid.');
  }
  return tokenSession.data;
}

/**
 * 递归遍历组织，使其生成一个部门数
 * @param {Array} list 部门列表
 * @param {String} id 要生成的某节点下的部门id
 * @returns 
 */
function recursionGroupChild(list, id) {
    const x = list.filter((item) => item.c_gid === id );

    if(x.length < 1 ) {
        return;
    }

    return x.map(item => {
        const children = recursionGroupChild(list, item.c_id);
        return {
            ...item,
            id: item.c_id,
            label: item.c_name,
            value: item.c_id,
            children
        }
    })
}

/**
 * 检查是否有重复的成员被添加
 * @param {String} uid 用户id
 * @param {String} gid 部门id
 */
async function checkRepetitionAdd(uid, gid) {
    let arr = await data.checkRepetitionAdd({ uid, gid });

    if(arr.length !== 0 ) {
        throw error('ERR_MEMBER_REPETITION', 'Member Repetition.');
    }
}
