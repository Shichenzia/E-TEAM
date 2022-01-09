'use strict';

const { libs } = nodex;
const { mysql } = libs;


exports.init = async function (args) { 
  console.log('data init.');
  console.log('data init args:', args);
  await mysql.init(args.mysql);
};

exports.findUserByEmail = async function (email) { 
  const sql = `
        select
            *
        from
            t_user
        where
            c_email = '${email}'
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.addUserByEmail = async function ({ id, email, time}) { 
  const sql = `
        INSERT INTO
            t_user
            (c_id, c_email, c_ctime, c_mtime)
        VALUES
            ("${id}", "${email}", "${time}", "${time}")
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.findUserByPhone = async function (phone) { 
  const sql = `
        select
            *
        from
            t_user
        where
            c_phone = '${phone}'
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.addUserByPhone = async function ({ id, phone, time}) { 
  const sql = `
        INSERT INTO
            t_user
            (c_id, c_phone, c_ctime, c_mtime)
        VALUES
            ("${id}", "${phone}", "${time}", "${time}")
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.setUserPass = async function ({ uid, passport, password }) { 
  const sql = `
        UPDATE
            t_user
        SET
            c_username = "${passport}",
            c_password = "${password}"
        WHERE
            c_id = "${uid}"
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.setUserInfo = async function ({ uid, name }) { 
  const sql = `
        UPDATE
            t_user
        SET
            c_name = "${name}"
        WHERE
            c_id = "${uid}"
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.findUserById = async function (id) { 
  const sql = `
        select
            *
        from
            t_user
        where
            c_id = '${id}'
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.getUserListByName = async function ( { name }) { 
  const sql = `
        select
            *
        from
            t_user
        where
            c_name LIKE '%${name}%'
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.authByPass = async function ({ passport, password }) { 
  const sql = `
        select
            *
        from
            t_user
        where
            c_username = '${passport}'
        and
            c_password = '${password}'
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.createGroup = async function ({ name, gid, c_id }) { 
  const sql = `
        INSERT INTO
            t_group
            (c_id, c_name, c_gid)
        VALUES
            ("${c_id}", "${name}", "${gid}")
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.getAllGroupList = async function () { 
  const sql = `
        select
            *
        from
            t_group
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.deleteGroup = async function ({ id }) { 
    const sql = `
        DELETE FROM
            t_group
        WHERE
            c_id = "${id}"
    `;

    return await mysql.query(sql);
};

exports.updateGroup = async function ({ id, gid, name }) { 
    const sql = `
          UPDATE
              t_group
          SET
              c_name = "${name}",
              c_gid = "${gid}"
          WHERE
              c_id = "${id}"
      `;
    const result = await mysql.query(sql);
  
    return result;
};

exports.getGroupListByGid = async function ({ gid }) { 
    const sql = `
          select
              *
          from
              t_group
          where
              c_gid = '${gid}'
      `;
    const result = await mysql.query(sql);
  
    return result;
};

exports.createMember = async function ({ c_id, uid, gid }) { 
  const sql = `
        INSERT INTO
            t_member
            (c_id, c_uid, c_gid)
        VALUES
            ("${c_id}", "${uid}", "${gid}")
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.checkRepetitionAdd = async function ({ uid, gid }) { 
  const sql = `
        select
            *
        from
            t_member
        where
            c_gid = '${gid}' and
            c_uid = '${uid}'
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.listMember = async function () { 
  const sql = `
        select
            m.*, u.c_name, u.c_ctime, u.c_phone, u.c_email, g.c_name as gname
        from t_user u
        inner join t_member m 
            on m.c_uid = u.c_id
        left join t_group g 
            on m.c_gid = g.c_id
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.updateMember = async function ({ c_id, uid, gid }) { 
  const sql = `
        UPDATE
            t_member
        SET
            c_uid = "${uid}",
            c_gid = "${gid}"
        WHERE
            c_id = "${c_id}"
    `;
  const result = await mysql.query(sql);

  return result;
};

exports.deleteMember = async function ({ id }) { 
  const sql = `
      DELETE FROM
          t_member
      WHERE
          c_id = "${id}"
  `;

  return await mysql.query(sql);
};


exports.listMemberByGid = async function ({ gid }) { 
  const sql = `
        select
            m.*, u.c_name
        from t_user u
        inner join t_member m 
            on m.c_uid = u.c_id and m.c_gid = "${gid}"
    `;
  const result = await mysql.query(sql);

  return result;
};



