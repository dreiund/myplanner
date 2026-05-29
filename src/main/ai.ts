import { getSetting, DEEPSEEK_API_KEY, REPORTER_NAME } from './db/settings'

interface GenerateInput {
  granularity: string
  dateRange: { start: string; end: string }
  tasks: string
  reviewContent: string
  stats: string
  feedback?: string
}

const WORD_LIMITS: Record<string, string> = {
  daily: '100-200字以内',
  weekly: '300-400字以内',
  monthly: '500字左右',
  quarterly: '深度长篇',
  annual: '深度长篇'
}

function buildPrompt(input: GenerateInput): string {
  const reporter = getSetting(REPORTER_NAME) || ''
  const label = { daily: '日报', weekly: '周报', monthly: '月报', quarterly: '季报', annual: '年报' }[input.granularity]
  if (input.granularity === 'weekly') {
    return `你是一个个人效率助手，请根据以下数据生成一份周报。

时间范围：${input.dateRange.start} 至 ${input.dateRange.end}
字数要求：${WORD_LIMITS['weekly']}

【每日任务详情】
${input.tasks || '无任务数据'}

【复盘总结】
${input.reviewContent || '无复盘内容'}

【任务反馈】（完成每个任务时填写的问题和优化建议）
${input.feedback || '无反馈数据'}

【统计数据】
${input.stats || '无统计数据'}

请严格按以下 Markdown 格式输出周报：

# 周报 - ${input.dateRange.start} ~ ${input.dateRange.end}
**汇报人：** ${reporter}

## 一、本周进展

事项：
- （根据已完成的任务，每个事项用简洁的一句话概括，按日或按类别组织）

## 二、需要关注的问题

- 问题
1. （根据任务反馈中遇到的问题提炼关键问题）
2. ...

- 处理方法
1. （针对上述问题的处理建议，需要具体可行）
2. ...

## 三、下一周的计划

1. （根据本周未完成的任务和复盘总结，合理推断下一周应推进的事项）
2. ...
3. ...

要求：
- 「事项」根据实际完成的任务填充，每项一句话，突出成果
- 「需要关注的问题」根据任务反馈（遇到的问题+优化建议）提炼关键问题，处理方法要具体可行
- 「下一周的计划」基于本周未完成事项和复盘内容合理推断
- 如果用到的数据不足，相关部分可以简写
- 简洁有力，用数据和事实说话`
  }
  if (input.granularity === 'daily') {
    return `你是一个个人效率助手，请根据以下数据生成一份日报。

时间范围：${input.dateRange.start} 至 ${input.dateRange.end}
字数要求：${WORD_LIMITS[input.granularity] || '500字左右'}

【任务数据】
${input.tasks || '无任务数据'}

【复盘总结】
${input.reviewContent || '无复盘内容'}

【任务反馈】（完成每个任务时填写的问题和优化建议）
${input.feedback || '无反馈数据'}

【统计数据】
${input.stats || '无统计数据'}

请严格按以下 Markdown 格式输出日报：

# 日报 - ${input.dateRange.start}
**汇报人：** ${reporter}

## 一、今日进展

事项：
- （根据已完成的任务，每行一个事项，用简洁的一句话概括）

## 二、需要关注的问题

- 问题
1. （根据任务反馈中遇到的问题提炼）
2. ...

- 处理方法
1. （针对上述问题的处理建议，需要具体可行）
2. ...

要求：
- 「事项」根据实际完成的任务填充，每项一句话，突出成果
- 「需要关注的问题」根据任务反馈（遇到的问题+优化建议）提炼关键问题，处理方法要具体可行
- 如果用到的数据不足，相关部分可以简写
- 简洁有力，用数据和事实说话`
  }
  return `你是一个个人效率助手，请根据以下数据生成一份${label}。
时间范围：${input.dateRange.start} 至 ${input.dateRange.end}
字数要求：${WORD_LIMITS[input.granularity] || '500字左右'}

【任务数据】
${input.tasks || '无任务数据'}

【复盘总结】
${input.reviewContent || '无复盘内容'}

【任务反馈】（完成每个任务时填写的问题和优化建议）
${input.feedback || '无反馈数据'}

【统计数据】
${input.stats || '无统计数据'}

请严格按以下 Markdown 格式输出${label}：

# ${label} - ${input.dateRange.start} ~ ${input.dateRange.end}
**汇报人：** ${reporter}

## 一、总体概述
（根据任务完成情况概述本周期进展）

## 二、关键成果/亮点
- （列出主要完成的事项和成果）

## 三、待改进之处
- （根据任务反馈和完成任务中存在的问题提炼）

## 四、下一步计划
- （合理推断下一周期应推进的事项）

要求：
- 简洁有力，用数据和事实说话
- 如果用到的数据不足，相关部分可以简写`
}

export async function generateReport(input: GenerateInput): Promise<string> {
  const apiKey = getSetting(DEEPSEEK_API_KEY)
  if (!apiKey) throw new Error('未配置 DeepSeek API Key，请在设置中配置')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const resp = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个专业的个人效率报告生成助手。' },
          { role: 'user', content: buildPrompt(input) }
        ],
        temperature: 0.7,
        max_tokens: input.granularity === 'quarterly' || input.granularity === 'annual' ? 4000 : 2000
      }),
      signal: controller.signal
    })
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      throw new Error((err as { error?: { message?: string } }).error?.message || `API 请求失败 (${resp.status})`)
    }
    const data = await resp.json() as { choices: { message: { content: string } }[] }
    const choice = data.choices?.[0]
    if (!choice?.message?.content) {
      throw new Error('API 返回为空，请重试')
    }
    return choice.message.content
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('请求超时，请检查网络后重试')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
