<template>
  <div class="app-container">
    
   <div @click="showSendAllMsgDialog">发消息给全体倾师</div>
      
   <div @click="showSendSingleMsgDialog">发消息给单个</div>


     

    <el-dialog v-model="showAllDialog" title="给全体倾听师发消息" :show-close="true" @close="closeDialog">
      <div>
        <div>
         标题  <p></p>
         <el-input v-model="allmsgTitle" :rows="1" type="textarea" placeholder="Please input" ></el-input>

        </div>
         
        <div>
         消息内容  <p></p>
         <el-input v-model="allmsg" :rows="1" type="textarea" placeholder="内容" ></el-input>
         <!-- <el-input v-model="allmsgRoute" :rows="1" type="textarea" placeholder="路由" ></el-input> -->

        </div>

        是否必须确认
        <el-checkbox v-model="requireConfirmation" @change="handleCheckboxChange">是</el-checkbox>
        <div>
      
        </div>
      </div>
      <p></p>
      <div style="flex-direction: row ;display: flex; align-items: center;justify-content: center;">
        <el-button @click="addToAllListenerNotification">提交</el-button>

      </div>


    </el-dialog>


    <!-- 给单个倾听师发消息-->
    <el-dialog v-model="showSingleDialog" title="给单个倾听师发消息" :show-close="true" @close="closeDialog">
      <div>
        <div>
         倾听师Uid  <p></p>
         <el-input v-model="targetUid" :rows="1" type="textarea" placeholder="Please input" ></el-input>

        </div>
        <div>
         标题  <p></p>
         <el-input v-model="singleTitle" :rows="1" type="textarea" placeholder="Please input" ></el-input>

        </div>
        <div>
         消息内容  <p></p>
         <el-input v-model="singlemsg" :rows="1" type="textarea" placeholder="Please input" ></el-input>

        </div>

        <div>
      是否必须确认
      <el-checkbox v-model="requireConfirmation" @change="handleCheckboxChange">是</el-checkbox>
    </div>
        
      </div>
      <p></p>
      <div style="flex-direction: row ;display: flex; align-items: center;justify-content: center;">
        <el-button @click="addToSingleListenerNotification">提交</el-button>
      </div>
    </el-dialog>
   

  </div>
</template>

<script>
import { donecomplaints, getcomplaints } from "@/api/compliance/complaint.js";
import { formatTimestamp, formatTimestampYMDHS } from '@/utils/dateutil.js';
import ImageList from '@/components/ImageList.vue';
import {addListenerNotification} from "@/api/dufuusermanager/dufuuserapi.js"

export default {
  inject: ['global'],
  components: { ImageList },


  name: "Online",
  data() {
    return {
      targetUid: "",
      reason: "",
      duration:"",
      allmsgRoute:"",
      allmsgTitle:"",
      singleTitle:"",
      isPassedChecked: false,
      isDeleteChecked: false,
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 表格数据
      list: [],
      imageUrls: [],
      pageNum: 1,
      pageSize: 10,
      dialogVisible: false,
      userdialogVisible: false,
      processdialogVisible: false,
      showRestriction:false,
      showSingleDialog:false,
      showAllDialog:false,
      allmsg:'',
      singlemsg:'',
      requireConfirmation: false,

    
      processRow: null,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 200
      }
    };
  },
  created() {
   },
  methods: {
    handleCheckboxChange(){

      console.log("requireConfirmation:"+this.requireConfirmation)

    },
    showSendAllMsgDialog(){
      this.showAllDialog=true;

    },
    showSendSingleMsgDialog(){
this.showSingleDialog=true;
    },
    addToSingleListenerNotification(){
      addListenerNotification(this.global.uid,this.global.token,this.targetUid,this.singleTitle,this.singlemsg,0,this.requireConfirmation?1:0).then(value => {
        if (value.errorCode == 0) {
          if (value.data == 1) {
             this.showSingleDialog=false;
             this.requireConfirmation=false;
             this.targetUid=0;
             this.singleTitle='';
             this.singlemsg='';
          }
        }else{
          alert(value.errorMsg)

        }
      })

      
    },
    addToAllListenerNotification(){
      addListenerNotification(this.global.uid,this.global.token,0,this.allmsgTitle,this.allmsg,1,this.requireConfirmation?1:0).then(value => {
        if (value.errorCode == 0) {
          if (value.data == 1) {
             this.showAllDialog=false;
             this.requireConfirmation=false;
             this.allmsg='';
             this.allmsgTitle='';
             this.targetUid=0;
          }
        }else{
          alert(value.errorMsg)
        }
      })
    },

  },

     
 
    
   
    
  
};
</script>

