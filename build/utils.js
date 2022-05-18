
// 配置devserver
const httpsReg = /^https:\/\//
export function createProxy(list = []) {
  const rst = {}
  for (const [prefix, target] of list) {
    const isHttps = httpsReg.test(target)

    // https://github.com/http-party/node-http-proxy#options
    rst[prefix] = {
      target: target,
      changeOrigin: true,
      ws: true,
      rewrite: (path) => path.replace(new RegExp(`^${prefix}`), ''),
      // https is require secure=false
      ...(isHttps ? { secure: false } : {}),
    }
  }
  return rst
}

// 在vite项目中，以VITE_ 为前缀的环境变量可以通过 import.meta.env.xxx的方式访问，.env文件的环境变量会在所有环境中加载，但是优先级更低，会被当前模式下的同名变量覆盖
// 但是，在node环境中（如vite.config.js文件），并不能通过import.meta.env.xxx这种方式使用环境变量，但我们却有这样的需求，因此我们需要处理一下，让node环境也可以使用我们定义的环境变量
export function wrapperEnv(envOptions) {
    if (!envOptions) return {}
    const rst = {}
  
    for (const key in envOptions) {
      let val = envOptions[key]
      if (['true', 'false'].includes(val)) {
        val = val === 'true'
      }
      if (['VITE_PORT'].includes(key)) {
        val = +val
      }
      if (key === 'VITE_PROXY' && val) {
        try {
          val = JSON.parse(val.replace(/'/g, '"'))
        } catch (error) {
          val = ''
        }
      }
      rst[key] = val
      if (typeof key === 'string') {
        process.env[key] = val
      } else if (typeof key === 'object') {
        process.env[key] = JSON.stringify(val)
      }
    }
    return rst
  }
  