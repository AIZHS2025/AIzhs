const baseUrl = "https://www.aizhs.top"; // 统一管理域名

function request({
  url,
  method = "GET",
  data = {},
  header = {},
  timeout = 5000,
}) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: baseUrl + url,
      method,
      timeout,
      data,
      header: {
        "content-type": "application/x-www-form-urlencoded", // 默认格式
        ...header,
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          uni.showToast({
            title: "服务器错误",
            icon: "none",
          });
          reject(res);
        }
      },
      fail: (err) => {
        uni.showToast({
          title: "请求失败",
          icon: "none",
        });
        reject(err);
      },
    });
  });
}

export default request;
