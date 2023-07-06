<template>
  <div class="app-container">
    <!-- <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" label-width="68px">
      <el-form-item label="登录地址" prop="ipaddr">
        <el-input
          v-model="queryParams.ipaddr"
          placeholder="请输入登录地址"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户名称" prop="userName">
        <el-input
          v-model="queryParams.userName"
          placeholder="请输入用户名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>

    </el-form> -->
    <el-table v-loading="loading" :data="list.slice((pageNum - 1) * pageSize, pageNum * pageSize)" style="width: 100%;">
      <el-table-column label="序号" type="index" align="center">
        <template v-slot="scope">
          <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户" align="center" prop="userVo.nick" :show-overflow-tooltip="true" />
      <el-table-column label="PK话题" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="观点" align="center" prop="redStandpoint" />
      <el-table-column label="时间" align="center" prop="createTime" :show-overflow-tooltip="true" />

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template v-slot="scope">
          <el-button size="mini" type="text" @click="mpassRequestListener(scope.row)">审核通过</el-button>

          <el-button size="mini" type="text" @click="mrefuseRequestListener(scope.row)">不通过</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="pageNum" :limit.sync="pageSize" />
  </div>
</template>

<script>
import { getWaiting4ReviewPKTopics, passRequestListener, refuseRequestListener } from "@/api/compliance/pk";

export default {
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
      pageSize: 10,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 200
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询登录日志列表 */
    getList() {
      this.loading = true;
      getWaiting4ReviewPKTopics(this.queryParams).then(response => {
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
    mrefuseRequestListener(row) {
      this.$prompt('请输入未通过审核意见', '审核未通过', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^.{1,100}$/,
        inputErrorMessage: '请输入未通过审核意见'
      }).then(({ value }) => {

        passRequestListener(row.idData, value).then((value) => {
          if (value['errorCode'] == 0) {
            let index = this.list.indexOf(row); // 查找元素的索引
            if (index !== -1) {
              this.list.splice(index, 1); // 从索引位置删除1个元素
            }


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


      // this.$modal.confirm('审核不通过？').then(function () {
      //   console.log("??:" + JSON.stringify(row));
      //   return refuseRequestListener(row.idData, "测试")
      // }).then((value) => {
      //   if (value['errorCode'] == 0) {
      //     let index = this.list.indexOf(row); // 查找元素的索引
      //     if (index !== -1) {
      //       this.list.splice(index, 1); // 从索引位置删除1个元素
      //     }


      //   } else {
      //     alert('操作失败' + value['errorCode']);

      //   }
      // }).catch(() => { });
    },
    /**
     * 
     *审核通过
     */
    mpassRequestListener(row) {
      this.$modal.confirm('确认审核通过？').then(function () {
        return passRequestListener(row.idData)
      }).then((value) => {
        if (value['errorCode'] == 0) {
          let index = this.list.indexOf(row); // 查找元素的索引
          if (index !== -1) {
            this.list.splice(index, 1); // 从索引位置删除1个元素
          }


        } else {
          alert('操作失败' + value['errorCode']);

        }
      }).catch(() => { });
    }

  }
};
</script>

