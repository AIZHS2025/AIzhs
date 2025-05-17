'use strict';

// 引入微信云开发 SDK
const cloud = require('wx-server-sdk');
const https = require('https');

// 初始化云环境
cloud.init({
	env: 'cloud1-5gszljn762dc4719'  // 直接使用环境ID
});

// HTTPS请求辅助函数
function httpsRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          let result = data;
          // 尝试解析JSON
          try {
            result = JSON.parse(data);
          } catch (e) {
            console.warn('响应不是JSON格式:', e.message);
          }
          
          resolve({
            statusCode: res.statusCode,
            data: result,
            headers: res.headers
          });
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

/**
 * Coze API 工作进程云函数
 * 用于查询任务执行状态和结果
 */
exports.main = async (event, context) => {
	console.log('coze_worker调用', event);
	
	// 检查必要参数
	if (!event.token || !event.workflowId || !event.execute_id) {
		return {
			code: 400,
			msg: '缺少必要参数',
			data: null
		};
	}

	try {
		// 构建请求URL
		const hostname = 'api.coze.cn';
		const path = `/v1/workflows/${event.workflowId}/run_histories/${event.execute_id}`;
		console.log('请求URL:', `https://${hostname}${path}`);
		
		// 构建Authorization头
		const accessToken = event.token;
		console.log('使用访问令牌:', accessToken.substring(0, 5) + '*****' + accessToken.substring(accessToken.length-5));
		
		// 设置请求选项
		const options = {
			hostname: hostname,
			port: 443,
			path: path,
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${accessToken}`,
				'Accept': 'application/json'
			}
		};
		
		// 发送请求
		const response = await httpsRequest(options);
		
		console.log('查询任务执行状态响应码:', response.statusCode);
		
		// 检查响应状态码
		if (response.statusCode !== 200) {
			console.error('响应状态码错误:', response.statusCode);
			throw new Error(`查询任务执行状态失败，HTTP状态码: ${response.statusCode}`);
		}
		
		// 解析响应数据
		let result = response.data;
		
		// 检查API响应状态
		if (result.code !== 0) {
			console.error('API返回错误:', result.code, result.msg);
			throw new Error(`API返回错误: ${result.msg || '未知错误'}`);
		}
		
		// 从返回的数据结构中提取任务信息
		const taskInfo = result.data && result.data.length > 0 ? result.data[0] : null;
		if (!taskInfo) {
			console.error('API返回数据格式异常，未找到任务信息');
			throw new Error('API返回数据格式异常，未找到任务信息');
		}
		
		console.log('任务状态:', taskInfo.execute_status);
		
		// 解析输出数据，如果有的话
		let outputData = null;
		let imageUrls = [];
		
		try {
			if (taskInfo.output) {
				// 尝试解析输出数据
				const parsedOutput = JSON.parse(taskInfo.output);
				
				if (parsedOutput && parsedOutput.Output && parsedOutput.Output !== "null") {
					try {
						outputData = JSON.parse(parsedOutput.Output);
						
						// 检查是否包含图片URL
						if (outputData && Array.isArray(outputData.picture_urls)) {
							imageUrls = outputData.picture_urls;
						}
					} catch (innerError) {
						console.warn('解析输出数据内容时出错:', innerError);
					}
				}
			}
		} catch (outputError) {
			console.warn('解析输出数据时出错:', outputError);
		}
		
		// 如果状态是成功但没有图片URLs，尝试从其他地方查找
		if (taskInfo.execute_status === 'Success' && imageUrls.length === 0) {
			try {
				// 检查其他可能的位置
				if (taskInfo.result && taskInfo.result.picture_urls) {
					imageUrls = taskInfo.result.picture_urls;
				}
			} catch (e) {
				console.warn('尝试查找备用图片URL时出错:', e);
			}
		}
		
		// 返回查询结果
		return {
			code: 0,
			msg: '查询任务执行状态成功',
			data: {
				taskId: event.execute_id,
				status: taskInfo.execute_status,
				image_urls: imageUrls,
				debug_url: taskInfo.debug_url || null,
				error: taskInfo.error_code !== "0" ? taskInfo.error_code : null,
				createTime: taskInfo.create_time,
				updateTime: taskInfo.update_time,
				rawOutput: outputData,
				originalData: taskInfo
			}
		};
	} catch (error) {
		console.error('查询任务执行状态失败:', error);
		return {
			code: 500,
			msg: '查询任务执行状态失败: ' + error.message,
			data: null
		};
	}
};