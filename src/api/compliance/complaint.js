import request from '@/utils/request'
export function getcomplaints(page,uid,token) {
    console.log('getcomplaints:'+page+' '+uid+' '+token);
    return request({
      url: '/cms/complain/getComplain',
      method: 'get',
      params: {'uid':uid,'token':token,'page':page,'pageSize':20}
    })
  }
  //    public Result DoneComplaints(@RequestParam int isReportApproved,@RequestParam String id,@RequestParam String reporterMsg,@RequestParam String reportedMsg,@RequestParam String token,@RequestParam String uid ){

  export function donecomplaints(isReportApproved,id,token,uid,reportedMsg,reporterMsg) {
    return request({
      url: '/cms/complain/doneComplaints',
      method: 'post',
      params: {'uid':uid,'token':token,'isReportApproved':isReportApproved,'reportedMsg':reportedMsg,'reporterMsg':reporterMsg}
    })
  }