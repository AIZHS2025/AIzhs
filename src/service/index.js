/**
 *热门课程和知识星球 查询接口
 * @param {*} type
 * @returns
 */

//首页
import request from "@/utils/service/index.js";
//热门课程 ｜ 知识星球 (列表查询)
export function postPopularCourses(type) {
  return request({
    url: "/index.php/api/Resource/postPopularCourses",
    method: "POST",
    data: { type },
  });
}

// 根据id和type查询资讯详情
export function plantInformation(id) {
  return request({
    url: "/index.php/api/Resource/plantInformation",
    method: "POST",
    data: { id },
  });
}
// /index.php/getHomePageResources
// 首页
export function getHomePageResources() {
  return request({
    url: '/index.php/getHomePageResources',
    method: "GET",
    dataL: {}
  })
}
