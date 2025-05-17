"use strict";

exports.main = async function(event, context) {
  console.log("请求启动，参数:", JSON.stringify(event));
  
  // 检查必要参数
  const requiredParams = ["token", "bot_id", "user_id"];
  const missingParams = requiredParams.filter(param => !event[param]);
  
  if (missingParams.length > 0) {
    return {
      code: 400,
      msg: `缺少必要参数: ${missingParams.join(", ")}`,
      data: null
    };
  }
  
  // 验证消息参数
  if (!event.conversation_id && (!event.additional_messages || !Array.isArray(event.additional_messages) || event.additional_messages.length === 0)) {
    return {
      code: 400,
      msg: "未传会话ID时，必须提供上下文消息",
      data: null
    };
  }
  
  try {
    // 构建请求体
    const requestBody = {
      bot_id: event.bot_id,
      user_id: event.user_id,
      stream: event.stream || false,
      auto_save_history: event.auto_save_history !== false,
      custom_variables: event.custom_variables,
      parameters: event.parameters
    };
    
    // 安全处理 additional_messages
    if (event.additional_messages && Array.isArray(event.additional_messages)) {
      requestBody.additional_messages = event.additional_messages.map(function(msg) {
        return {
          role: msg.role,
          type: msg.type || "question",
          content: msg.content,
          content_type: msg.content_type || "text",
          meta_data: msg.meta_data
        };
      });
    }
    
    // 添加会话ID
    if (event.conversation_id && event.conversation_id.trim()) {
      requestBody.conversation_id = event.conversation_id;
      console.log("包含会话ID:", event.conversation_id);
    } else {
      console.log("首次请求，不包含会话ID");
    }
    
    // 添加元数据
    if (event.meta_data) {
      requestBody.meta_data = event.meta_data;
    }
    
    console.log("构造请求体:", JSON.stringify(requestBody, null, 2));
    
    // 发送请求
    const axios = require("axios");
    const response = await axios({
      method: "POST",
      url: "https://api.coze.cn/v3/chat",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${event.token}`
      },
      data: requestBody
    });
    
    console.log("API响应状态:", response.status);
    
    // 检查HTTP状态
    if (response.status !== 200) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    // 解析响应
    const apiResponse = response.data;
    console.log("API响应数据:", JSON.stringify(apiResponse));
    
    // 检查业务状态
    if (apiResponse.code !== 0) {
      throw new Error(`业务错误: ${apiResponse.msg} (代码: ${apiResponse.code})`);
    }
    
    // 构建返回结果
    const result = {
      chat_id: apiResponse.data && apiResponse.data.id,
      conversation_id: apiResponse.data && apiResponse.data.conversation_id,
      status: apiResponse.data && apiResponse.data.status,
      usage: apiResponse.data && apiResponse.data.usage
    };
    
    console.log("返回到前端的数据:", result);
    
    // 处理流式响应
    if (event.stream && apiResponse.data) {
      result.stream_data = apiResponse.data;
      console.warn("流式响应需前端特殊处理事件流");
    }
    
    return {
      code: 0,
      msg: "请求成功",
      data: result
    };
  } catch (error) {
    console.error("执行错误:", error);
    return {
      code: 500,
      msg: error.message.includes("API请求失败") ? error.message : `服务端错误: ${error.message}`,
      data: null
    };
  }
} 