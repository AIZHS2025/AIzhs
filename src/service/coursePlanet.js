import request from "@/utils/service/index.js";

export function getCoursePlanet() {
  return request({
    url: "/index.php/getCoursePlanet",
    method: "GET",
    data: {},
  });
}
