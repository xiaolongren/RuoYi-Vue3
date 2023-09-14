<template>
  <div class="app-container">

    <el-table v-loading="loading" :data="list.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="width: 100%;">
      <el-table-column label="序号" type="index" align="center">

        <template v-slot="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户" align="center" prop="uid" :show-overflow-tooltip="true" />
      <el-table-column label="更新类型" align="center" prop="showTitle" :show-overflow-tooltip="true" />
      <el-table-column label="更新内容" align="center" prop="showContent" />
      <el-table-column label="时间" align="center" :show-overflow-tooltip="true">
        <template v-slot="scope">
          {{ mformatTimestamp(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" @click="verify(scope.row)">审核</el-button>

        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />

    <el-dialog v-model="dialogVisible" title="详情" :show-close="true" @close="closeDialog">
      <div style="display: flex;flex-direction: row-reverse;">
        <el-button type="primary" @click="mupdateUserInfoSuccess">通过</el-button>
        <div style="width: 20px;"></div>

        <el-button @click="mupdateUserInfoFail">不通过</el-button>
      </div>

      <p></p>
      <div> 更新类型: {{ currentData.showTitle }} </div>
      <p></p>
      <div> 更新内容 :{{ currentData.showContent }} </div>
      <div v-if="currentData.avatarPic!=null">
      <img :src="currentData.avatarPic.url" style="width: 100px; height: 100px;" />


      <div>currentData.avatarPic.url</div>
      </div>
      <p></p>
      <div> 该用户相关资质 </div>
      <div style="font-size: 12px;color: red;"> *昵称/个人介绍/欢迎语中如果涉及相关专业性的职称等，需要提供相关资质证明 </div>

      <div>
        <ImageList :images="imageUrls" :width="500" />
      </div>

      <p></p>


    </el-dialog>
  </div>
</template>

<script>
import { getWaittingVerify, getCredential, updateUserInfoFail, updateUserInfoSuccess } from "@/api/userinfo/updateuserinfo";
import { formatTimestamp, formatTimestampYMDHS } from '@/utils/dateutil.js';
import ImageList from '@/components/ImageList.vue';
export default {
  components: { ImageList },

  inject: ['global'],
  name: "Online",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      pageNum: 1,
      imageUrls: [],
      pageSize: 10,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 200
      },
      dialogVisible: false
    };
  },
  created() {
    this.getList();
  },
  methods: {
    mformatTimestamp(timestamp) {

      return formatTimestamp(timestamp)
    },
    closeDialog() {
      this.dialogVisible = false;
    },
    verify(row) {

      this.currentData = row;
      this.dialogVisible = true;
      this.mgetCredential(row.uid);

    },
    mgetCredential(targetUid) {
      var queryParams = {
        'token': this.global.token,
        'uid': this.global.uid,
        'targetUid': targetUid
      }
      getCredential(queryParams).then(imgs => {
        this.imageUrls = []
        for (var i = 0; i < imgs.length; i++) {
          this.imageUrls[i] = imgs[i].url;
        }
      })
    },
    getList() {
      this.loading = true;
      var mqueryParams = {
        page: 1,
        pageSize: 200,
        uid: this.global.uid,
        token: this.global.token
      }
      getWaittingVerify(mqueryParams).then(response => {
        this.loading = false;

        if (response && response.rows) {
          this.list = response.rows;
          this.total = response.total;
        } else {
          this.list = [];
          this.total = 0;
        }
      }).catch(error => {
        console.error('获取 PK 话题时发生错误:', error);
        this.list = [];
        this.total = 0;
        this.loading = false;
      });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 审核不通过 */
    mupdateUserInfoFail() {
      this.$prompt('请输入未通过审核意见', '审核未通过', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{1,100}$/,
        inputErrorMessage: '请输入未通过审核意见'
      }).then(({ value }) => {

        var query = {
          'id': this.currentData.idData,
          'token': this.global.token,
          'uid': this.global.uid,
          'msg': value
        }
        console.log(this.currentData)
        updateUserInfoFail(query).then((value) => {
          if (value['errorCode'] == 0) {
            let index = this.list.indexOf(this.currentData); // 查找元素的索引
            if (index !== -1) {
              this.list.splice(index, 1); // 从索引位置删除1个元素
            }
            this.dialogVisible = false


          } else {
            alert('操作失败' + value['errorCode']);

          }
        }).catch(() => { })

      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消审核'
        })
      });



    },
    /**
     * 
     *审核通过
     */
    mupdateUserInfoSuccess() {

      this.$modal.confirm('确定要审核通过吗?').then(() => {
        // 确认删除操作
        var query = {
          'id': this.currentData.idData,
          'token': this.global.token,
          'uid': this.global.uid,
        }
        updateUserInfoSuccess(query).then((value) => {
          if (value['errorCode'] == 0) {
            this.dialogVisible=false;
            let index = this.list.indexOf(this.currentData); // 查找元素的索引
            if (index !== -1) {
              this.list.splice(index, 1); // 从索引位置删除1个元素
            }


          } else {
            alert('操作失败' + value['errorCode']);

          }
        });
      }).catch(() => {
        // 取消删除操作
      });

    }

  }
};
</script>

