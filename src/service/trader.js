import request from "@/utils/service/index.js";

/**
 *获取操盘手个人信息卡接口
 * @param {*} user_id
 * @returns
 */
export function getOperatorDataCardData(user_id) {
  return request({
    url: "/index.php/getOperatorDataCardData",
    method: "GET",
    data: { user_id },
  });
}

/**
 * 获取操盘手的团队数据
 * @param {*} user_id
 * @returns
 */
export function getUserInviteeOrderStats(user_id) {
  return request({
    url: "/index.php/getUserInviteeOrderStats",
    method: "GET",
    data: { user_id },
  });
}

/**
 * 超盘手获取自己以及下家订单
 * @param {*} id
 * @param {*} page
 * @param {*} quantity
 * @returns
 */
export function getUserAndChildrenOrders(id, page, quantity) {
  return request({
    url: "/index.php/getUserAndChildrenOrders",
    method: "POST",
    data: { id, page, quantity },
  });
}

/**
 * 操盘手获取个人的推广小程序码
 * @param {*} invite_code
 * @returns
 */
export function getWxCode(invite_code) {
  return request({
    url: "/index.php/getWxCode",
    method: "GET",
    data: { invite_code },
  });
}

/**
 * 操盘手获取佣金页面信息
 * @returns
 */
export function getUserCommissionDetail(user_id) {
  return request({
    url: "/index.php/getUserCommissionDetail",
    method: "GET",
    data: { user_id },
  });
}
