module.exports = (ctx) => {
  const register = () => {
    ctx.helper.uploader.register('cloudreve-uploader', {
      handle: uploader,
      name: 'luke9012图床(基于Cloudreve)',
      config: config
    })
  }
  const config = ctx => {
    let userConfig = ctx.getConfig('picBed.cloudreve-uploader')
    if (!userConfig) {
      userConfig = {}
    }
    return [
      {
        name: 'host',
        type: 'input',
        default: userConfig.host,
        required: true,
        message: '服务地址',
        alias: '服务地址'
      },
      {
        name: 'path',
        type: 'input',
        default: userConfig.path,
        required: false,
        message: '自定义保存路径',
        alias: '保存路径'
      }
    ]
  }
  const uploader = async function (ctx) {
    let userConfig = ctx.getConfig('picBed.cloudreve-uploader')
    if (!userConfig) {
      throw new Error(`未配置参数, 请先配置上传参数`)
    }
    const host = userConfig.host
    const path = userConfig.path
    try {
      let imgList = ctx.output
      for (let i in imgList) {
        let image = imgList[i]
        const lastModified = Date.now();
        
        let file_data = image.buffer
        if (!file_data && image.base64Image) {
          file_data = Buffer.from(image.base64Image, 'base64')
        }
        const fileSize = file_data.length;
        const publicHeaders = {
          'content-type': 'multipart/form-data'
        }
        const fd = {
          data: {
            value: file_data,
            options: {filename: image.fileName}
          },
          last_modified: lastModified,
          file_size: fileSize,
          up_path: path,
          filename: image.fileName,
        }
        let body = await ctx.Request.request({
          method: 'post',
          url: `${host}/source_url`,
          headers: {
            ...publicHeaders
          },
          formData: fd
        })
        
        delete image.base64Image
        delete image.buffer
        console.log(`body: ${body}`)
        body = JSON.parse(body)
        if (body.code === 200) {
          image.imgUrl = body.msg
          console.log("send success")
        } else {
          console.log("send error")
        }
      }
    } catch (err) {
      console.log(`error: ${err.stack}`)
    }
  }
  return {
    register,
    uploader: 'cloudreve-uploader'
  }
}
