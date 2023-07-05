<template>
    <div style="display: flex; flex-direction: row;width: 100%; ">
        <div style="margin-left: 220px;width: 50%;margin-top: 30px;">
            <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig"
                :mode="mode" />
            <Editor style="height: 500px; verflow-y: hidden; border-color: #ccc; border-width: 1px;" v-model="valueHtml"
                :defaultConfig="editorConfig" :mode="mode" @onCreated="handleCreated" />
        </div>
        <div style="background-color: #ccc;width: 1px;margin-top: 69px; margin-left: 10px;">

        </div>
        <div style="margin-left: 10px;display: flex; flex-direction: column;">
            <textarea id="tvtitle" class="textarea" style="max-lines: 1;margin-top: 35px;">请输入标题</textarea>
            <div class="coverdiv" @click="selectCover">
                <input style="z-index: -2;width: 300px;height: 200px; visibility: hidden;" class="hidden" id="input"
                    type="file" accept="image/*" @change="previewFiles($event)">


                <div style="width: 300px;height: 200px;position: absolute;left: 0px;top: 0px;">
                    <img id="ivcover" width="300" height="200" style="padding: 0px; text-align:center;" />

                </div>
                <div id="tips"
                    style="text-align:center;z-index: 0;width: 300px;line-height: 200px; height: 200px; position: absolute;left: 0px;top: 0px; color: black;font-size: 14px;">
                    <p style="font-size: 12px;">
                        点击上传封面图片 最佳尺寸 600x400(长宽度比3:2)
                    </p>
                </div>

            </div>
            <button title="提交" @click="submitarticle" style="margin-top: 16px
                                            ; width: 300px;">提交</button>

        </div>

    </div>
</template>

<script>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { createEditor, DomEditor } from '@wangeditor/editor'
import httpRequest from '@/store/maxios.js'

import { onBeforeUnmount, ref, shallowRef, onMounted, render } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import COS from 'cos-js-sdk-v5';

import getFileNameAndExtension from '@uppy/utils/lib/getFileNameAndExtension';
import { inject } from 'vue';

export default {
    components: { Editor, Toolbar },
    setup() {
        const global = inject('global')
        //============================cos start=================
        // 存储桶名称，由 bucketname-appid 组成，appid 必须填入，可以在 COS 控制台查看存储桶名称。 https://console.cloud.tencent.com/cos5/bucket
        const Bucket = 'xiyou-1314793197';  /* 存储桶，必须字段 */

        // 存储桶 region 可以在 COS 控制台指定存储桶的概览页查看 https://console.cloud.tencent.com/cos5/bucket/ 
        // 关于地域的详情见 https://cloud.tencent.com/document/product/436/6224
        const Region = 'ap-guangzhou';     /* 存储桶所在地域，必须字段 */

        // 初始化实例
      // 初始化实例
      const cos = new COS({
            // getAuthorization 必选参数
            getAuthorization: function (options, callback) {
                // 初始化时不会调用，只有调用 cos 方法（例如 cos.putObject）时才会进入
                // 异步获取临时密钥
                // 服务端 JS 和 PHP 例子：https://github.com/tencentyun/cos-js-sdk-v5/blob/master/server/
                // 服务端其他语言参考 COS STS SDK ：https://github.com/tencentyun/qcloud-cos-sts-sdk
                // STS 详细文档指引看：https://cloud.tencent.com/document/product/436/14048

                var url = 'https://app.xiyouqingsu.com/content/media/auth/getTencentOssToken?bucket=' + Bucket + "&uid=" + global.uid + "&token=" + global.token; // url 替换成您自己的后端服务
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.onload = function (e) {
                    try {
                        var data = JSON.parse(e.target.responseText);
                        var credentials = data.credentials;
                    } catch (e) {
                    }
                    if (!data || !credentials) {
                        return console.error('credentials invalid:\n' + JSON.stringify(data, null, 2))
                    };
                    callback({
                        TmpSecretId: credentials.tmpSecretId,
                        TmpSecretKey: credentials.tmpSecretKey,
                        SecurityToken: credentials.sessionToken,
                        // 建议返回服务器时间作为签名的开始时间，避免用户浏览器本地时间偏差过大导致签名错误
                        StartTime: data.startTime, // 时间戳，单位秒，如：1580000000
                        ExpiredTime: data.expiredTime, // 时间戳，单位秒，如：1580000000
                    });
                };
                xhr.send();
            }
        });
        var coverUrl = null
        var ariticle = {}
        var Pic = {}
        var PICS = []
        var picMap = new Map
        var CoverPic = {}
        const contentPicUploadCallback = (data, insertImgFn) => {
            var filetype = getFileType(data.Location)
            var url = data.Location.replace("xiyou-1314793197.cos.ap-guangzhou.myqcloud.com", "https://pic.xiyouqingsu.com").replace("." + filetype, ".webp")
            insertImgFn(url); // 插入返回的url地址
            //获取图片尺寸
            getPicSize(url).then(res => {
                console.log(res);
                var width = res.width
                var height = res.height

                var pic = {}
                pic["url"] = url;//data.Location.replace("xiyou-1314793197.cos.ap-guangzhou.myqcloud.com", "https://pic.xiyouqingsu.com")
                pic["width"] = width
                pic["height"] = height
                //PicEnum.ARTICLE
                pic["type"] = 7
                picMap.set(pic["url"], pic)



            }, reason => {
                console.error(reason);
            })
        }

        const customUploadImg = (file, insertImgFn) => {
            console.log(file)

            cos.sliceUploadFile({
                Bucket: 'xiyou-1314793197', // 存储桶名称
                Region: 'ap-guangzhou', // 存储桶地域
                Key: 'article/' + file.name, // 文件名称
                Body: file, // 文件
            }, function (err, data) {
                if (err) {
                    console.log(err);
                    return;
                }

             //  contentPicUploadCallback(data, insertImgFn)

            });
        }
        const uploadCover = (file) => {


            var coverdiv = document.getElementById("tips")
            coverdiv.style.visibility = "hidden"

            cos.sliceUploadFile({
                Bucket: 'xiyou-1314793197', // 存储桶名称
                Region: 'ap-guangzhou', // 存储桶地域
                Key: 'article/' + file.name, // 文件名称
                Body: file, // 文件
            }, function (err, data) {
                if (err) {
                    console.log(err);
                    return;
                }
                // pic["url"] = 
                //  var coverUrl = data.Location.replace("xiyou-1314793197.cos.ap-guangzhou.myqcloud.com", "https://pic.xiyouqingsu.com")
                var filetype = getFileType(data.Location)
                var coverUrl = data.Location.replace("xiyou-1314793197.cos.ap-guangzhou.myqcloud.com", "https://pic.xiyouqingsu.com").replace("." + filetype, ".webp")

                console.log(coverUrl)
                //获取图片尺寸
                getPicSize(coverUrl).then(res => {
                    console.log(res);
                    var width = res.width
                    var height = res.height

                    CoverPic["url"] = coverUrl
                    CoverPic["width"] = width
                    CoverPic["height"] = height
                    //PicEnum.ARTICLE
                    CoverPic["type"] = 7
                    console.log("封面图" + JSON.stringify(CoverPic))



                }, reason => {
                    console.error(reason);
                })


            });

        }
        const getFileType = (url) => {

            var filename
            if (url.indexOf('/') > 0) {
                if (url.indexOf('?') > 0) {
                    url = url.split('?')[0];
                }
                //如果包含有"/"号 从最后一个"/"号+1的位置开始截取字符串
                filename = url.substring(
                    url.lastIndexOf('/') + 1,
                    url.length
                );
            }
            return filename.split(".")[1]

        }
        const getPicSize = async (file) => {

            return new Promise((resolve, reject) => {
                let img = new Image();
                img.src = file;
                console.log("file:" + file)
                if (img.complete) {
                    const { width, height } = img;
                    resolve({
                        width,
                        height
                    });
                } else {
                    let timeOut = setTimeout(() => {
                        reject("图片加载失败！");
                    }, 10000);
                    img.onload = function () {
                        const { width, height } = img;
                        window.clearTimeout(timeOut);
                        resolve({
                            width,
                            height
                        });
                    }
                }
            })



        }
        //============================cos end=================

        // 编辑器实例，必须用 shallowRef
        const editorRef = shallowRef()

        // 内容 HTML
        const valueHtml = ref('<p>hello</p>')
        const picWidthMap = new Map
        const picHeightMap = new Map



        // 模拟 ajax 异步获取内容
        onMounted(() => {

            setTimeout(() => {

                const toolbar = DomEditor.getToolbar(editorRef.value)

                const curToolbarConfig = toolbar?.getConfig()
                console.log(JSON.stringify(curToolbarConfig?.toolbarKeys))// 当前菜单排序和分组

                valueHtml.value = '<p>模拟 Ajax 异步设置内容</p>'

                editorRef.value.getMenuConfig("uploadImage").customUpload = customUploadImg;


            }, 1500)


        })

        // const editor = createEditor({
        //     html: '<p><br></p>',
        //     mode: 'default', // or 'simple'
        // })


        const toolbarConfig = {
            toolbarKeys: [
                // 菜单 key
                'headerSelect',

                // 分割线


                // 菜单 key
                'bold', 'italic',
                'underline',

                // 菜单组，包含多个菜单
                {
                    key: 'group-more-style', // 必填，要以 group 开头
                    title: '更多样式', // 必填
                    iconSvg: '<svg>....</svg>', // 可选
                    menuKeys: ["through", "code", "clearStyle"] // 下级菜单 key ，必填
                },
                'divider',
                {
                    key: 'group-more-style',
                    title: '图片',
                    menuKeys: ["uploadImage"]

                },
                {
                    key: "group-justify",
                    title: "对齐",
                    iconSvg: "<svg viewBox=\"0 0 1024 1024\"><path d=\"M768 793.6v102.4H51.2v-102.4h716.8z m204.8-230.4v102.4H51.2v-102.4h921.6z m-204.8-230.4v102.4H51.2v-102.4h716.8zM972.8 102.4v102.4H51.2V102.4h921.6z\"></path></svg>",
                    menuKeys: ["justifyLeft", "justifyCenter"]
                },
                "bulletedList",
                "numberedList"

            ]
        }
        const editorConfig = {
            placeholder: '请输入内容...'

        }

        // 组件销毁时，也及时销毁编辑器
        onBeforeUnmount(() => {
            const editor = editorRef.value
            if (editor == null) return
            editor.destroy()
        })

        const handleCreated = (editor) => {
            editorRef.value = editor // 记录 editor 实例，重要！
        }

        //选择封面
        const previewFiles = (e) => {

            console.log(e.target.files)
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.readAsDataURL(file);
            console.log(reader)
            reader.onload = function (e) {

                var image = document.getElementById("ivcover");
                //.     console.log(this.result)
                image.src = this.result;



                uploadCover(file)
            };


            if (file.size / 1024 / 1024 > 1.5) {
                alert('图片大于1.5M,请上传小于1.5M的图片');
                return;
            }

        }

        const submitarticle = () => {

            console.log(document.getElementById('tvtitle').value)
            if (document.getElementById('tvtitle').value.trim() === "" || document.getElementById('tvtitle').value.trim() === "请输入标题") {

                alert('请输入标题')
                return
            }

            else if (CoverPic == null) {

                alert('请选择封面图')
                return
            }

            const editor = editorRef.value
            //获取内容
            var content = editor.getHtml()
            var title = document.getElementById('tvtitle').value;
            ariticle["title"] = title
            ariticle["content"] = content

            //从html中解析img，过滤掉picMap被删除的pic



            let imgStrs = content.match(/<img.*?>/g)
            console.log("imgStrs:"+imgStrs)

            // 获取每个img url
            if (imgStrs != null) {
                let urls = imgStrs.map(url => {
                    return url.match(/\ssrc=['"](.*?)['"]/)[1]
                }
                )
                console.log("urls:"+urls);

                for (var i = 0; i < urls.length; i++) {
                    console.log("src:::" + urls[i]);
                    var mpic = picMap.get(urls[i])
                    console.log("mpic:::" + picMap.size);

                    console.log("mpic:::" + mpic);

                    if (mpic != null) {
                        PICS.push(mpic)
                        console.log(JSON.stringify(PICS))

                    }

                }
            }


            if (PICS.size > 0) {
                ariticle.imgs= PICS
            }
            ariticle.isOriginal=1
            ariticle.coverPic= CoverPic

            console.log(JSON.stringify(ariticle))
            var form = new FormData();
            form.append("uid", global.uid)
            form.append("token", global.token)
            form.append("articleJson", JSON.stringify(ariticle))
            var url = "/content/article/createArticle"
            const config = {
                headers: {
                    token: global.token,
                    uid: global.uid
                }
            };
            // httpRequest.post(url, form, config).then(ret => {
            //     console.log(ret.data);
            //    // this.users = ret.data;
            // })





        }

        return {
            editorRef,
            valueHtml,
            mode: 'default', // 或 'simple'
            toolbarConfig,
            editorConfig,
            coverUrl,
            global,
            CoverPic,
            handleCreated,
            submitarticle,
            previewFiles,


        };
    }
    ,
    onMounted() {
        //console(editorRef)
        // this.initcos()
    },
    data() {

        return {
            cos: null,
            mvisible: false
        }

    },
    methods: {

        selectCover() {
            var form = new FormData();
            form.append("uid", this.global.uid)
            form.append("token", this.global.token)
            // form.append("articleJson", JSON.stringify(ariticle))
            var url = "/content/article/createArticle"
            //url="/usergroup/user/login/passwdLogin"
            var url = 'https://app.xiyouqingsu.com/content/article/createArticle'; // url 替换成您自己的后端服务

            var xmlrequest = new XMLHttpRequest();
             xmlrequest.open("POST",url,true)
             xmlrequest.send(form)
            xmlrequest.send("uid=377&token=c2d2a2dc65a709d5bfd755bfc66917ec")
            document.getElementById("input").click();

        }

    }

}
</script>
<style>
.textarea {
    resize: none;
    max-lines: 1;
    font-family: Tahoma, Arial, 宋体;
    width: 400px;

    font-size: 8pt;
    line-height: 15px;

    COLOR: #000000;

    border-top-style: none;

    border-right-style: none;

    border-bottom-style: dashed;

    border-left-style: none;

    border-bottom-color: #000000;

    border-top-width: 0px;

    border-right-width: 0px;

    border-bottom-width: 1px;

    border-left-width: 0px;

    outline: none;


}

.coverdiv {
    background-color: gainsboro;
    width: 300px;
    height: 200px;
    position: relative;
    margin-top: 10px;
    align-items: center;
}
</style>


