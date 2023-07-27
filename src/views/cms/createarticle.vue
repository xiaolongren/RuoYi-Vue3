<template>
    <div style="display: flex; flex-direction: row;width: 100%; ">
        <!-- 左边 -->
        <div style="width:360px;margin-top: 30px;">
            <Toolbar style="border-bottom: 1px solid #ccc" :editor="editorRef" :defaultConfig="toolbarConfig"
                :mode="mode" />

            <textarea @input="handleTitleInput" id="tvtitle" class="textarea" style="max-lines: 1;margin-top: 35px;"
                placeholder="请输入标题"></textarea>


            <Editor style="height: 500px; verflow-y: hidden; border-color: #ccc; border-width: 1px;" v-model="valueHtml"
                :defaultConfig="editorConfig" :mode="mode" @onChange="onchange" @onCreated="handleCreated" />
        </div>
        <div style="background-color: #ccc;width: 1px;margin-top: 49px; margin-left: 10px;">

        </div>
        <!-- 中间 -->
        <div style="display: flex;flex-direction: column;margin-left: 16px;;margin-top: 40px;">

            <el-checkbox v-model="isTimeChecked" @change="handleCheckChange">
                定时发布
            </el-checkbox>
            <el-date-picker v-model="time" type="datetime" placeholder="选择日期时间" :picker-options="pickerOptions">
            </el-date-picker>


            <p>目前只有定时发布,才会有消息推送</p>

            <div class="coverdiv" @click="selectCover">
                <input style="z-index: -2;width: 210px;height: 140px; visibility: hidden;" class="hidden" id="input"
                    type="file" accept="image/*" @change="previewFiles($event)">


                <div style="width: 210px;height: 140px;position: absolute;left: 0px;top: 0px;">
                    <img id="ivcover" width="210" height="140" style="padding: 0px; text-align:center;" />

                </div>
                <div id="tips"
                    style="text-align:center;z-index: 0;width: 210px;line-height: 140px; height: 140px; position: absolute;left: 0px;top: 0px; color: black;font-size: 6px; ">
                    添加封面图<span style="font-size: 18px;">+</span>

                </div>

            </div>
            <p style="font-size: 10px;"> 封面图片最佳尺寸920x400(长宽度比2.3:1)
            </p>
            <el-icon style="font-size: 12px;" name="el-icon-plus"></el-icon>

            <el-button type="primary" style="margin-top: 16px
                                            ; width: 210px;" @click="submitarticle">提交</el-button>
        </div>
        <div style="margin-left: 10px;display: flex; flex-direction: column;">
            <div style="height: 40px; "></div>
            <div class="phone-preview">
                <div class="phone-frame">

                    <slot>
                        <div style="margin-left: 10px;margin-right: 10px;margin-top: 8px;">
                            <div id="articletitle">{{ mtitle }}</div>
                            <div style="font-size: 12px;color: rgb(90, 85, 85);margin-top: 8px;">{{ getNowTime() }}</div>

                            <div v-html="valueHtml" id="content"></div>
                        </div>

                        <!-- 其他要显示的内容 -->
                    </slot>



                </div>
            </div>

        </div>

        <el-dialog title="提示" v-model="centerDialogVisible" width="30%" center>
            <span>{{ publishResult }}</span>
            <span slot="footer" class="dialog-footer">
                <div class="button-container">
                    <el-button type="primary" @click="centerDialogVisible = false">确 定</el-button>
                </div>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { createEditor, DomEditor } from '@wangeditor/editor'
import httpRequest from '@/store/maxios.js'
import { formatTimestamp, formatTimestampYMDHS } from '@/utils/dateutil.js';

import { onBeforeUnmount, ref, shallowRef, onMounted, render, watch } from 'vue'
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
                        console.log('token:' + credentials)
                    } catch (e) {
                        console.log(e)
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
        var isTimeChecked = ref(false)
        var time = ref(new Date(Date.now() + 15 * 60 * 1000))
        var ariticle = {}
        var Pic = {}
        var PICS = []
        var picMap = new Map
        var CoverPic = {}
        var publishTime = 0
        const pickerOptions = ref({});




        watchEffect(() => {
            updatePickerOptions(time.value);
        });

        function updatePickerOptions(selectedTime) {
            // 获取当前时间
            const now = new Date();

            // 设置最小时间为当前时间+15分钟
            const minDateTime = new Date(now.getTime() + 15 * 60 * 1000);

            // 设置最大时间为当前时间+7天
            const maxDateTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

            pickerOptions.value = {
                disabledDate(time) {
                    return time.getTime() < minDateTime.getTime() || time.getTime() > maxDateTime.getTime();
                },
            };
        }


        const contentPicUploadCallback = (data, insertImgFn) => {
            var filetype = getFileType(data.Location)

            var url = data.Location.replace("xiyou-1314793197.cos.ap-guangzhou.myqcloud.com", "https://pic.xiyouqingsu.com");
            url = url.replace("." + filetype, ".webp")
            console.log("url:" + url + "  " + filetype);
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
            var fileName = new Date().getTime() + file.name;

            cos.sliceUploadFile({
                Bucket: 'xiyou-1314793197', // 存储桶名称
                Region: 'ap-guangzhou', // 存储桶地域
                Key: 'article/' + fileName, // 文件名称
                Body: file, // 文件
            }, function (err, data) {
                console.log(data);
                if (err) {
                    console.log(err);
                    return;
                }
                setTimeout(function () {
                    contentPicUploadCallback(data, insertImgFn)

                }, 2000);


            });
        }

        const uploadCover = (file) => {


            var coverdiv = document.getElementById("tips")
            coverdiv.style.visibility = "hidden"
            var fileName = new Date().getTime() + file.name;

            cos.sliceUploadFile({
                Bucket: 'xiyou-1314793197', // 存储桶名称
                Region: 'ap-guangzhou', // 存储桶地域
                Key: 'article/' + fileName, // 文件名称
                Body: file, // 文件
            }, function (err, data) {
                if (err) {
                    console.log(err);
                    return;
                }
                // pic["url"] = 
                //  var coverUrl = data.Location.replace("xiyou-1314793197.cos.ap-guangzhou.myqcloud.com", "https://pic.xiyouqingsu.com")
                var filetype = getFileType(data.Location)
                var coverUrl = data.Location.replace("xiyou-1314793197.cos.ap-guangzhou.myqcloud.com", "https://pic.xiyouqingsu.com")
                console.log("第一次替换：" + coverUrl)

                coverUrl = coverUrl.replace("." + filetype, ".webp");
                console.log("第二次替换：" + coverUrl)

                console.log("上传封面结束=====" + coverUrl + "   " + filetype)
                console.log("回来的data" + data.Location)
                // setTimeout(getPicSize(coverUrl), 1000); // 延迟1秒执行
                setTimeout(() => {
                    new Promise(resolve => {
                        resolve(getPicSize(coverUrl));
                    }).then(res => {
                        // 处理结果
                        console.log(res);
                        var width = res.width
                        var height = res.height

                        CoverPic["url"] = coverUrl
                        CoverPic["width"] = width
                        CoverPic["height"] = height
                        //PicEnum.ARTICLE
                        CoverPic["type"] = 7
                        console.log("封面图" + JSON.stringify(CoverPic))
                    }, reson => {

                        console.log(reson)
                    });
                }, 2000);


                // //获取图片尺寸
                // getPicSize(coverUrl).then(res => {
                //     console.log(res);
                //     var width = res.width
                //     var height = res.height

                //     CoverPic["url"] = coverUrl
                //     CoverPic["width"] = width
                //     CoverPic["height"] = height
                //     //PicEnum.ARTICLE
                //     CoverPic["type"] = 7
                //     console.log("封面图" + JSON.stringify(CoverPic))



                // }, reason => {
                //     console.log("获取尺寸出错："+reason);
                //     console.error(reason);
                // })


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
        const editorContent = ""
        const centerDialogVisible = ref(false);
        const publishResult = ref('');

        // 模拟 ajax 异步获取内容
        onMounted(() => {

            setTimeout(() => {

                const toolbar = DomEditor.getToolbar(editorRef.value)

                const curToolbarConfig = toolbar?.getConfig()
                console.log(JSON.stringify(curToolbarConfig?.toolbarKeys))// 当前菜单排序和分组

                valueHtml.value = '<p></p>'


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
            console.log("handleCreated");
            editorRef.value = editor // 记录 editor 实例，重要！



        }
        const onchange = (value) => {

            //  this.editorContent=value.getHtml();
        }
        const handleCheckChange = (checked) => {

            isTimeChecked.value = checked
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



                console.log("上传封面开始=====")
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

            //获取内容
            var content = valueHtml.value
            if (content.length < 100) {

                alert("文章内容太短")
                return
            }
            if (isTimeChecked.value) {
                if (time.value == null) {
                    alert("请选择发布时间")
                } else {
                    publishTime = time.value.getTime();
                }
            }

            console.log(publishTime);
            var title = document.getElementById('tvtitle').value;
            ariticle["title"] = title
            ariticle["content"] = content


            //从html中解析img，过滤掉picMap被删除的pic



            let imgStrs = content.match(/<img.*?>/g)
            console.log("imgStrs:" + imgStrs)

            // 获取每个img url
            if (imgStrs != null) {
                let urls = imgStrs.map(url => {
                    return url.match(/\ssrc=['"](.*?)['"]/)[1]
                }
                )
                console.log("urls:" + urls);

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
                ariticle.imgs = PICS
            }
            ariticle.isOriginal = 1
            ariticle.coverPic = CoverPic

            console.log(JSON.stringify(ariticle))
            var form = new FormData();
            form.append("uid", global.uid)
            form.append("token", global.token)
            if (publishTime > 0)
                form.append("publishTime", publishTime)
            form.append("articleJson", JSON.stringify(ariticle))
            var url = "/content/article/createArticle"
            const config = {
                headers: {
                    token: global.token,
                    uid: global.uid
                }
            };
            httpRequest.post(url, form, config).then(ret => {
                centerDialogVisible.value = true;
                publishResult.value = "发布成功";
                resetData()

            })

        }
        const resetData = () => {
            editorRef.value.clear();

            document.getElementById('tvtitle').value = "";
            CoverPic = {};
            ariticle = {};
            valueHtml.value = '<p></p>';
            document.getElementById("ivcover").src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="; // 透明的图片
            document.getElementById("articletitle").innerHTML = ""; // 
            document.getElementById("content").innerHTML = ""; // 


        }

        return {
            resetData,
            publishResult,
            editorContent,
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
            onchange,
            centerDialogVisible,
            isTimeChecked,
            time,
            handleCheckChange,
            pickerOptions,

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
            mvisible: false,
            mtitle: "",

        }

    },
    methods: {


        handleTitleInput(ev) {
            console.log(ev.target.value);
            this.mtitle = ev.target.value;

        }
        ,
        getNowTime() {

            return formatTimestampYMDHS(Date.now())
        },
        selectCover() {
            var form = new FormData();
            form.append("uid", this.global.uid)
            form.append("token", this.global.token)
            // form.append("articleJson", JSON.stringify(ariticle))
            // var url = "/content/article/createArticle"
            //url="/usergroup/user/login/passwdLogin"
            var url = 'https://app.xiyouqingsu.com/content/article/createArticle'; // url 替换成您自己的后端服务

            // var xmlrequest = new XMLHttpRequest();
            //xmlrequest.open("POST", url, true)
            // xmlrequest.send(form)
            // xmlrequest.send("uid=377&token=c2d2a2dc65a709d5bfd755bfc66917ec")
            document.getElementById("input").click();

        },
        onDirectPublishSelected() {
            alert('onDirectPublishSelected');
            this.publishType = "direct";
        },
        ontimingPublishSelected() {
            alert('ontimingPublishSelected');

            this.publishType = "timing";
        }

    }

}
</script>
<style>
.textarea {
    resize: none;
    max-lines: 1;
    font-family: Tahoma, Arial, 宋体;
    width: 100%;

    font-size: 16pt;
    line-height: 15px;
    font-weight: bold;

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
    width: 210px;
    height: 140px;
    position: relative;
    margin-top: 10px;
    align-items: center;
}

.phone-preview {
    position: relative;
    width: 330px;
    /* 手机屏幕的宽度 */
    height: 620px;
    /* 手机屏幕的高度 */
    margin: 0 auto;
    /* 居中显示 */
    overflow: hidden;
    /* 隐藏超出部分 */
    background-color: #000;
    /* 手机外壳的颜色 */
    border-radius: 20px;
    /* 圆角的大小 */

}

.phone-frame {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 320px;
    /* 手机屏幕内容区域的宽度 */
    height: 568px;
    /* 手机屏幕内容区域的高度 */
    background-color: #fff;
    /* 手机屏幕的颜色 */
    overflow: auto;
    /* 如果内容溢出可滚动 */
}

.dialog-footer {
    display: flex;
    justify-content: center;
    align-items: center;
}

.button-container {
    margin-top: 10px;
    /* 调整按钮容器与对话框底部的间距 */
}
</style>


