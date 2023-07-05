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
                <el-form-item label="评论内容" prop="field105">
                    <el-input v-model="formData.field105" placeholder="请输入评论内容" clearable :style="{ width: '100%' }">
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
                <template slot-scope="scope">
                    <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
                </template>
            </el-table-column>
            <el-table-column label="用户" align="center" prop="nickName" :show-overflow-tooltip="true" />
            <el-table-column label="评论内容" align="center" prop="content" :show-overflow-tooltip="true" />
            <el-table-column label="时间" align="center" :show-overflow-tooltip="true">
                <template slot-scope="scope">
                    {{ mformatTimestamp(scope.row.createTime) }}
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template slot-scope="scope">

                    <el-button size="mini" type="text" @click="mdelete(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />
    </div>
</template>
<script>
import { searchComment,deleteComment } from "@/api/cms/comment";
import { formatTimestamp } from '@/utils/dateutil.js';


export default {
    // FEED(1,"动态"),
    // Comment(2,"评论"),
    // TREEHOLE(3,"treehole"),
    // CARD_WORDS(4,"图文卡片"),
    // QUESTION_ANSWER(5,"问题回答"),
    // QUESTION(6,"问题"),
    // PK_COMMENT(7,"pk观点"),
    // ARTICLE(8,"文章");
    components: {},
    props: [],
    data() {
        return {

            // 遮罩层
            loading: false,
            // 总条数
            total: 0,
            // 表格数据
            list: [],
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
                    required: true,
                    message: '请输入评论内容',
                    trigger: 'blur'
                }],
                field104: [{
                    required: true,
                    message: '请输入用户Id',
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
                targetUid: "",
            },
        }
    },
    computed: {},
    watch: {},
    created() { },
    mounted() { },
    methods: {
        mformatTimestamp(timestamp) {

            return formatTimestamp(timestamp)
        },
        submitForm() {
            this.$refs['elForm'].validate(valid => {
                if (!valid) return

                this.queryParams.page = this.pageNum,
                    this.queryParams.targetUid = this.formData.field104
                this.queryParams.contentType = this.formData.field103
                this.queryParams.keyword = this.formData.field105,
                    // alert(JSON.stringify(this.queryParams) ),

                    searchComment(this.queryParams).then(response => {
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
        mdelete(row) {
           
            return  deleteComment(row.idData,this.formData.field103).then(value => {
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
  