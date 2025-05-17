import { miniPay } from "@/service/pay.js";
import { openId, login, recharge } from "@/service/login.js";
export function pay(product_id, order_type) {
  const { open_id } = uni.getStorageSync("data");
  return miniPay(open_id, product_id, order_type).then((res) => {
    const data = res.data;
    if (data) {
      show();
    }
    console.log("支付", data);
    return new Promise((resolve, reject) => {
      uni.requestPayment({
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType: data.signType,
        paySign: data.paySign,
        success: (result) => {
          logins().then(resolve).catch(reject);
          uni.hideLoading();
        },
        fail: (err) => {
          if (err.errMsg === "requestPayment:fail cancel") {
            uni.showToast({
              title: "您已取消支付",
              icon: "none",
            });
          } else {
            uni.showToast({
              title: "支付失败: " + err.errMsg,
              icon: "none",
            });
          }
          uni.hideLoading();
        },
      });
    });
  });
}

function show() {
  uni.showLoading({
    title: "支付中...",
    mask: true,
  });
}

export function logins() {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: "weixin", // 微信小程序登录
      success: function (res) {
        if (res.code) {
          // 拿到登录凭证 code
          openId(res.code).then((res) => {
            const yqm = "";
            login(res.openid, yqm)
              .then((res) => {
                const data = res.data;
                uni.setStorageSync("data", data);
                recharge(data.id).then((res) => {
                  if (res.code === 200) {
                    if (res.msg === "非会员页面") {
                      uni.setStorageSync("vip", false);
                    } else {
                      uni.setStorageSync("vip", true);
                    }
                  }
                  resolve();
                });
              })
              .catch((err) => console.error("登录失败", err));
          });
        } else {
          console.log("登录失败：没有code");
        }
      },
      fail: function (err) {
        console.log("登录接口调用失败：", err);
      },
    });
  });
}
