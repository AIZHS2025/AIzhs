import request from "@/utils/service/index.js";
//支付
/**
 *微信支付拉起接口
 * @param {*} open_id
 * @param {*} product_id
 * @returns
 */
export function miniPay(open_id, product_id, order_type) {
  return request({
    url: "/index.php/miniPay",
    method: "POST",
    data: { open_id, product_id, order_type },
  });
}

/**
 *根据输入的id和token值变化,整理剩余token值接口
 * @param {*} id //用户id
 * @returns
 */
export function getTokenCount(id,quantity) {
  return request({
    url: "/index.php/api/Resource/getTokenCount",
    method: "POST",
    data: {id,quantity},
  });
}

/**
 * 退款 接口
 * @param {*} out_trade_no //订单号
 * @param {*} reason //描述
 * @returns
 */
export function refund(out_trade_no, reason) {
  return request({
    url: "/index.php/refund",
    method: "POST",
    data: { out_trade_no, reason },
  });
}

/**
 *用户提现
 * @param {*} user_id
 * @param {*} amount
 * @returns
 */
export function withdraw(user_id, amount) {
  return request({
    url: "/index.php/withdraw",
    data: { user_id, amount },
  });
}
