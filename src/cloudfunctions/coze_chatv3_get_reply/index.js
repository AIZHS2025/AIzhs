'use strict';

// 模块级工具函数前置声明
function parseContent(message) {
    try {
        if (message.content_type === 'object_string') {
            return JSON.parse(message.content);
        }
        if (message.type === 'verbose') {
            const verboseData = JSON.parse(message.content);
            return verboseData.msg_type === 'generate_answer_finish' 
                ? '[END_OF_STREAM]' 
                : verboseData;
        }
        return message.content;
    } catch (e) {
        return message.content;
    }
}

function getFinalAnswer(messages) {
    const answers = messages
        .filter(msg => msg.type === 'answer')
        .map(msg => msg.content);
    return answers.join('\n');
}

/**
 * 获取智能体完整回复的云函数
 * 支持流式/非流式结果处理，自动过滤中间过程消息
 */
exports.main = async (event, context) => {
    console.log('请求参数:', JSON.stringify(event));

    // 增强参数校验
    const requiredParams = ['token', 'conversation_id', 'chat_id'];
    const missingParams = requiredParams.filter(param => !event[param] || (typeof event[param] === 'string' && !event[param].trim()));
    if (missingParams.length > 0) {
        return { 
            code: 400, 
            msg: `缺少必要参数或参数为空: ${missingParams.join(', ')}`,
            data: null 
        };
    }

    try {
        // 构造API请求
        const apiUrl = `https://api.coze.cn/v3/chat/message/list?${new URLSearchParams({
            conversation_id: event.conversation_id,
            chat_id: event.chat_id
        })}`;

        console.log('API请求URL:', apiUrl);

        // 使用axios发送请求
        const axios = require('axios');
        const response = await axios({
            method: 'GET',
            url: apiUrl,
            headers: {
                'Authorization': `Bearer ${event.token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('API响应状态:', response.status);
        
        // 处理HTTP错误
        if (response.status !== 200) {
            throw new Error(`API请求失败: ${response.status}`);
        }

        const result = response.data;
        console.log('API响应数据:', JSON.stringify(result));
        
        // 处理业务错误
        if (result.code !== 0) {
            return {
                code: result.code || 500,
                msg: `业务错误: ${result.msg}`,
                data: null
            };
        }

        // 消息处理流水线（已修复）
        const processedMessages = result.data
            .filter(msg => 
                msg.type === 'answer' ||  
                msg.type === 'verbose' ||
                msg.type === 'tool_response'
            )
            .map(msg => ({
                message_id: msg.id,
                type: msg.type,
                content: parseContent(msg), // 直接调用模块函数
                timestamp: msg.created_at
            }));

        // 提取最终答案
        const finalAnswer = getFinalAnswer(result.data);
        console.log("最终回复:", finalAnswer);

        // 构造标准化响应
        const responseData = {
            messages: processedMessages,
            final_answer: finalAnswer,
            raw_data: event.include_raw ? result.data : undefined
        };

        console.log('返回到前端的数据:', {
            messages: processedMessages.length,
            has_final_answer: !!finalAnswer
        });

        return {
            code: 0,
            msg: '获取成功',
            data: responseData
        };

    } catch (error) {
        console.error('执行错误:', error);
        return {
            code: 500,
            msg: error.message.includes('API') ? error.message : `服务端错误: ${error.message}`,
            data: null
        };
    }
};