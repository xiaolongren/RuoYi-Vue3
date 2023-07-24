<template>
    <div>
        <p></p>

        <el-form ref="elForm" :model="formData" :rules="rules" size="medium" label-width="100px">
            <el-row type="flex" justify="start" align="top" :gutter="17">
                <el-form-item label="内容类型" prop="field103">
                    <el-select v-model="formData.field103" placeholder="请选择内容类型" clearable :style="{ width: '100%' }">
                        <el-option v-for="(item, index) in field103Options" :key="index" :label="item.label"
                            :value="item.value" :disabled="item.disabled"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="内容关键字" prop="field105">
                    <el-input v-model="formData.field105" placeholder="请输入内容关键字" clearable :style="{ width: '100%' }">
                    </el-input>
                </el-form-item>
                <el-form-item label="用户Id" prop="field104">
                    <el-input v-model="formData.field104" placeholder="请输入用户Id" clearable :style="{ width: '100%' }">
                    </el-input>
                </el-form-item>
            </el-row>
            <el-form-item size="large">
                <el-button type="primary" @click="submitForm">搜索</el-button>
                <el-button @click="resetForm">重置</el-button>
            </el-form-item>
        </el-form>
        <el-table v-loading="loading" :data="list.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="width: 100%;">
            <el-table-column label="序号" type="index" align="center">
                <template v-slot="scope">
                    <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column label="用户" align="center" prop="nick" :show-overflow-tooltip="true" />
            <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true" />
            <el-table-column label="内容" align="center" prop="content" :show-overflow-tooltip="true" />
            <el-table-column label="时间" align="center" :show-overflow-tooltip="true">
                <template v-slot="scope">
                    {{ mformatTimestamp(scope.row.createTime) }}
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template v-slot="scope">

                    <el-button size="mini" type="text" @click="showDetail(scope.row)">详情</el-button>
                    <el-button size="mini" type="text" @click="mdelete(scope.row)">删除</el-button>

                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />

        <el-dialog v-model="dialogVisible" title="详情" :show-close="true" @close="closeDialog">
            <p></p>
            <div> 标题：{{ currentData.title }} </div>
            <div> 内容：{{ currentData.content }} </div>
            <div> 图片 </div>
            <div>
                <ImageList :images="imageUrls" :width="500" />
                
            </div>

            <p></p>


        </el-dialog>
    </div>
</template>
<script>
import { searchContent ,deleteContent} from "@/api/cms/content.js";
import ImageList from '@/components/ImageList.vue';

import { formatTimestamp ,formatTimestampYMDHS} from '@/utils/dateutil.js';

export default {
    inject: ['global'],
    // FEED(1,"动态"),
    // Comment(2,"评论"),
    // TREEHOLE(3,"treehole"),
    // CARD_WORDS(4,"图文卡片"),
    // QUESTION_ANSWER(5,"问题回答"),
    // QUESTION(6,"问题"),
    // PK_COMMENT(7,"pk观点"),
    // ARTICLE(8,"文章");
    components: { ImageList },
    props: [],
    data() {
        return {
            imageUrls: [],
            currentData: {},
            // 遮罩层
            loading: false,
            // 总条数
            total: 0,
            // 表格数据
            list: [],
            dialogVisible: false,
            pageNum: 1,
            pageSize: 10,
            formData: {
                field103: undefined,
                field105: undefined,
                field104: undefined,
            },
            rules: {
                field103: [{
                    required: true,
                    message: '请选择内容类型',
                    trigger: 'change'
                }],
                field105: [{
                    required: false,
                    message: '请输入评论内容',
                    trigger: 'blur'
                }],
                field104: [{
                    required: false,
                    message: '请输入用户Id',
                    trigger: 'blur'
                }, {
                    validator: (rule, value, callback) => {
                        const regex = /^\d+$/; // 正则表达式，匹配数字
                        if (value != null &&value!=''&& !regex.test(value)) {
                            callback(new Error('请输入有效的用户ID(数字)'));
                        } else {
                            callback();
                        }
                    },
                    trigger: 'blur'
                }],
            },
            field103Options: [{
                "label": "动态",
                "value": 1
            }, {
                "label": "PK",
                "value": 7
            }, {
                "label": "问答",
                "value": 6,

            }, {
                "label": "文章",
                "value": 8,

            }],
            queryParams: {
                page: 1,
                pageSize: 10,
                keyword: "",
                contentType: "",
                targetUid: 0,
            },
        }
    },
    computed: {},
    watch: {},
    created() { },
    mounted() { },
    methods: {
        closeDialog() {
            this.currentData = null;
            this.dialogVisible = false;
        },
        mformatTimestamp(timestamp) {

            return formatTimestamp(timestamp)
        },
        submitForm() {
            var uid = this.formData.field104;
            var keyword = this.formData.field105;
            if ((uid == null || uid.trim().length == 0) && (keyword == null || keyword.trim().length == 0)) {
                alert("用户id和内容关键字至少一个不为空")

                return
            }
            this.$refs['elForm'].validate(valid => {
                if (!valid) return

                this.queryParams.page = this.pageNum,
                this.queryParams.targetUid = this.formData.field104 == null ? "0" : this.formData.field104
                this.queryParams.contentType = this.formData.field103
                this.queryParams.keyword = this.formData.field105 == null ? "" : this.formData.field105,
                console.log(this.formData.field104)

                    searchContent(this.queryParams).then(response => {
                        this.loading = false;

                        if (response && response.rows) {
                            this.list = response.rows;
                            this.total = response.total;
                        } else {
                            this.list = [];
                            this.total = 0;
                        }

                    })
            })
        },
        resetForm() {
            this.$refs['elForm'].resetFields()
        },
        showDetail(row) {
            this.dialogVisible = true;
            this.currentData = JSON.parse(row.orgData)
            this.imageUrls=[]
            for (var i = 0; i < this.currentData.pics.length; i++) {
                this.imageUrls[i] = this.currentData.pics[i].url;
            }

        },
        mdelete(row) {


            console.log(this.global.uid);
            var query={
                 'id':JSON.parse(row.orgData).idData,
                 'uid':this.global.uid,
                 'token':this.global.token,
                 'contentType':this.queryParams.contentType
            }
            return deleteContent(query).then(value=>{
                    if (value.errorCode == 0) {
                    let index = this.list.indexOf(row); // 查找元素的索引
                    if (index !== -1) {
                        this.list.splice(index, 1); // 从索引位置删除1个元素
                    }
                } else {
                    alert("删除失败")
                }
            });

            
        }
    }
}

</script>
<style></style>
  