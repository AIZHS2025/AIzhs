/**上传图片 */
export function uploadPictures() {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      sizeType: ["original", "compressed"],
      sourceType: ["album", "camera"],
      success: (chooseImageRes) => {
        const tempFilePath = chooseImageRes.tempFilePaths[0];
        uni.getFileSystemManager().readFile({
          filePath: tempFilePath,
          encoding: "base64",
          success: (readRes) => {
            const base64Data = "data:image/jpeg;base64," + readRes.data;
            resolve(base64Data); // 成功返回base64
          },
          fail: (err) => {
            console.error("读取Base64失败", err);
            reject(err);
          },
        });
      },
      fail: (err) => {
        console.error("选择图片失败", err);
        reject(err);
      },
    });
  });
}
