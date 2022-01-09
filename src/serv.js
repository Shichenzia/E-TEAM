'use strict';

const { libs, runtime } = nodex;
const { http } = libs;
const { logic } = runtime;

exports.init = async function (args) {
  console.log('serv init.');
  console.log('serv init args:', args);
  console.log('runtime:', runtime);

  const app = http.webapp(args);

  app.route(router => {
    router.get('/', http.handler(logic.helloWorld));

    router.post('/make_auth_code', http.handler(logic.makeAuthCode));
    router.post('/auth_by_email', http.handler(logic.authByEmail));
    router.post('/auth_by_phone', http.handler(logic.authByPhone));
    router.post('/auth_by_pass', http.handler(logic.authByPass));
    router.post('/set_user_pass', http.handler(logic.setUserPass));
    router.post('/set_user_info', http.handler(logic.setUserInfo));
    router.post('/check_token', http.handler(logic.checkToken));
    router.post('/get_user_by_token', http.handler(logic.getUserByToken));
    router.post('/get_user_by_id', http.handler(logic.getUserById));
    router.post('/get_user_list_by_name', http.handler(logic.getUserListByName));

    router.post('/get_all_group_list', http.handler(logic.getAllGroupList));
    router.post('/get_group_list_by_gid', http.handler(logic.getGroupListByGid));
    router.post('/create_group', http.handler(logic.createGroup));
    router.post('/delete_group', http.handler(logic.deleteGroup));
    router.post('/update_group', http.handler(logic.updateGroup));

    router.post('/create_member', http.handler(logic.createMember));
    router.post('/list_member', http.handler(logic.listMember));
    router.post('/list_member_by_gid', http.handler(logic.listMemberByGid));
    router.post('/update_member', http.handler(logic.updateMember));
    router.post('/delete_member', http.handler(logic.deleteMember));



  });

  app.start();
};
