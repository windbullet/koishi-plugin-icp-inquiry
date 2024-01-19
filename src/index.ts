import { Context, Logger, Schema } from 'koishi'

export const name = 'icp-inquiry'

export interface Config {
  noDomain: boolean
}

export const Config: Schema<Config> = Schema.object({
  noDomain: Schema.boolean()
    .default(false)
    .description("查询结果中不带有解析后的实际域名（官方QQ机器人兼容选项）"),
})

export function apply(ctx: Context, config: Config) {
  ctx.command('ICP查询 <domain:text>')
    .action(async ({ session }, domain) => {
      let data
      let logger = new Logger('icp-inquiry')
      try {
        data = await ctx.http.get(`https://www.mxnzp.com/api/beian/search?domain=${Buffer.from(domain).toString('base64')}&app_id=lbbdxxocqrnmepny&app_secret=X5S72qcf5XFkGtdRaD4AGHNiTGRrJYT5`)
      } catch (e) {
        logger.warn("api请求失败 " + e.stack)
      }
      if (data.code === 1) {
        session.send(`
${config.noDomain ? '' : '实际域名：' + data.data.domain}
所属单位：${data.data.unit}
类型：${data.data.type}
备案号：${data.data.icpCode}
${data.data.name === "" ? "" : '网站名称：' + data.data.name}
审核时间：${data.data.passTime}
        `)
      } else if (data.code === 10083) {
        session.send('该域名未备案或已取消备案')
      } else {
        session.send(data.msg)
      }
    })
}
