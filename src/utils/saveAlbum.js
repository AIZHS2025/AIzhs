// 保存网络图片到相册
export function saveAlbum(imageUrl) {
  return new Promise((resolve, reject) => {
    // 1. 申请权限
    uni.authorize({
      scope: "scope.writePhotosAlbum",
      success() {
        // 2. 下载图片
        uni.downloadFile({
          url: imageUrl,
          success(res) {
            if (res.statusCode === 200) {
              // 3. 保存到相册
              uni.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success() {
                  uni.showToast({ title: "保存成功", icon: "success" });
                  resolve("保存成功");
                },
                fail(err) {
                  uni.showToast({ title: "保存失败", icon: "none" });
                  reject(err);
                },
              });
            } else {
              reject("图片下载失败");
            }
          },
          fail(err) {
            reject(err);
          },
        });
      },
      fail() {
        // 授权失败，提示用户去设置权限
        uni.showModal({
          title: "提示",
          content: "需要授权保存到相册权限",
          success(res) {
            if (res.confirm) {
              uni.openSetting();
            }
          },
        });
        reject("未授权");
      },
    });
  });
}
