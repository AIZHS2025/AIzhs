import request from "@/utils/service/index.js";
//操盘手
/**
 *获取操盘手的下家列表
 * @param {*} open_id
 * @param {*} page
 * @param {*} quantity
 * @returns
 */
export function getSubordinates(open_id, page, quantity) {
  return request({
    url: "/index.php/getSubordinates",
    method: "POST",
    data: { open_id, page, quantity },
  });
}

/**
 *超盘手获取自己以及下家订单
 * @param {*} id
 * @param {*} page
 * @param {*} quantity 数量
 * @returns
 */
export function getUserAndChildrenOrders(id, page, quantity) {
  return request({
    url: "/index.php/getUserAndChildrenOrders",
    method: "POST",
    data: {
      id,
      page,
      quantity,
    },
  });
}
