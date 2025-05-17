import request from "@/utils/service/index.js";
// /index.php/api/Resource/selectsGoods

export function selectsGoods(type) {
  return request({
    url: `/index.php/api/Resource/selectsGoods?type=${type}`,
    method: "POST",
    // params: { id },
  });
}
