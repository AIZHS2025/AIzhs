import { getTokenCount } from "@/service/pay.js";
/**
 * 消耗token
 * @returns
 */
export function payToken(id, quantity) {
  return new Promise((resolve, reject) => {
    getTokenCount(id, quantity)
      .then((res) => {
        console.log(res, "0000000");
        let data = uni.getStorageSync("data");
        if (data.token_quantity) {
          console.log("......", res);
          data.token_quantity = res.data;
          uni.setStorageSync("data", data);
        }
        resolve(res.data);
      })
      .catch((err) => {});
  });
}
