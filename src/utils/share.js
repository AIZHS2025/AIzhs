export function share(type, title, summary, imageUrl) {
  uni.share({
    provider: "weixin",
    type: type,
    title: title,
    summary: summary,
    imageUrl: imageUrl,
    success() {
      console.log("分享成功");
    },
    fail(err) {
      console.error("分享失败", err);
    },
  });
}
