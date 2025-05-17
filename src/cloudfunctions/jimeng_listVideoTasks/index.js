// jimeng_listVideoTasks 云函数
const cloud = require('wx-server-sdk')
const axios = require('axios')
const API_KEY = '23aea507-eff1-46b0-bd43-8cf816be694b'

cloud.init()

exports.main = async (event, context) => {
  const {
    page_num = 1,
    page_size = 10,
    status,
    task_ids,
    model
  } = event

  try {
    let queryParams = [
      `page_num=${page_num}`,
      `page_size=${page_size}`
    ]

    if (status) queryParams.push(`filter.status=${status}`)
    if (task_ids) queryParams.push(`filter.task_ids=${task_ids}`)
    if (model) queryParams.push(`filter.model=${model}`)

    const url = `https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks?${queryParams.join('&')}`

    const response = await axios({
      method: 'get',
      url: url,
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    })

    return {
      code: 200,
      data: response.data
    }

  } catch (error) {
    console.error('获取任务列表失败:', error)
    return {
      code: 500,
      message: error.message || '获取任务列表失败'
    }
  }
}