"use strict";

exports.main = async (t, a) => {
  console.log("请求启动，参数:", JSON.stringify(t));
  
  const e = ["token", "bot_id", "user_id"];
  const o = e.filter(a => !t[a]);
  
  if (o.length > 0) {
    return {
      code: 400,
      msg: `缺少必要参数: ${o.join(", ")}`,
      data: null
    };
  }
  
  if (!t.conversation_id && (!t.additional_messages || !Array.isArray(t.additional_messages) || 0 === t.additional_messages.length)) {
    return {
      code: 400,
      msg: "未传会话ID时，必须提供上下文消息",
      data: null
    };
  }
  
  try {
    const a = {
      bot_id: t.bot_id,
      user_id: t.user_id,
      stream: t.stream || false,
      auto_save_history: t.auto_save_history !== false,
      additional_messages: t.additional_messages?.map(t => ({
        role: t.role,
        type: t.type || "question",
        content: t.content,
        content_type: t.content_type || "text",
        meta_data: t.meta_data
      })),
      custom_variables: t.custom_variables,
      parameters: t.parameters
    };
    
    if (t.conversation_id && t.conversation_id.trim()) {
      a.conversation_id = t.conversation_id;
      console.log("包含会话ID:", t.conversation_id);
    } else {
      console.log("首次请求，不包含会话ID");
    }
    
    if (t.meta_data) {
      a.meta_data = t.meta_data;
    }
    
    console.log("构造请求体:", JSON.stringify(a, null, 2));
    
    const e = require("axios");
    const o = await e({
      method: "POST",
      url: "https://api.coze.cn/v3/chat",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${t.token}`
      },
      data: a
    });
    
    console.log("API响应状态:", o.status);
    
    if (200 !== o.status) {
      throw new Error(`API请求失败: ${o.status}`);
    }
    
    const s = o.data;
    console.log("API响应数据:", JSON.stringify(s));
    
    if (0 !== s.code) {
      throw new Error(`业务错误: ${s.msg} (代码: ${s.code})`);
    }
    
    const n = {
      chat_id: s.data?.id,
      conversation_id: s.data?.conversation_id,
      status: s.data?.status,
      usage: s.data?.usage
    };
    
    console.log("返回到前端的数据:", n);
    
    if (t.stream) {
      n.stream_data = s.data;
      console.warn("流式响应需前端特殊处理事件流");
    }
    
    return {
      code: 0,
      msg: "请求成功",
      data: n
    };
  } catch (s) {
    console.error("执行错误:", s);
    return {
      code: 500,
      msg: s.message.includes("API请求失败") ? s.message : `服务端错误: ${s.message}`,
      data: null
    };
  }
};