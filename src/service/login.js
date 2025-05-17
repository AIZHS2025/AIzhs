// 登录

import request from "@/utils/service/index.js";
/**预注册登录 */
export function login(open_id, parent_id) {
  return request({
    url: "/index.php/login",
    method: "POST",
    data: { open_id, parent_id },
  });
}

/**
 * 获取open_id
 */
export function openId(code) {
  return request({
    url: "/index.php/getopenid",
    method: "POST",
    data: { code },
  });
}

/**
 *用户绑定接口
 * @param {*} open_id
 * @param {*} nickname 昵称
 * @param {*} phone 手机号码
 * @param {*} avatar 头像
 * @returns
 */
export function bindUser(open_id, nickname, phone, avatar) {
  return request({
    url: "/index.php/bind",
    method: "POST",
    data: { open_id, nickname, phone, avatar },
  });
}

/**
 * 判断是否是会员
 * @param {*} id
 * @returns
 */
export function recharge(id) {
  return request({
    url: "/index.php/api/Resource/recharge",
    method: "POST",
    data: { id },
  });
}
