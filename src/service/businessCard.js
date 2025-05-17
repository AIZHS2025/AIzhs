// 个人名片
import request from "@/utils/service/index.js";

// 上传名片
// /index.php/uploadBusinessCard
export function uploadBusinessCard(id, card) {
  return request({
    url: "/index.php/uploadBusinessCard",
    method: "POST",
    data: {
      id,
      card,
    },
  });
}
