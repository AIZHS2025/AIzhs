/**知识星球 */
import request from "@/utils/service/index.js";
/**
 * 
 * @param {*} type  1->   官方资讯     2->社区资讯    3->  ai圈  
 * @returns 
 */
export function getKnowledgePlanetInfo(type) {
    return request({
        url: '/index.php/getKnowledgePlanetInfo',
        method: "GET",
        data: { type }
    })
}