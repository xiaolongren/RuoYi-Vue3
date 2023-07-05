import request from '@/utils/request'

// 查询在线用户列表
export function getWaiting4ReviewListener() {
  return request({
    url: '/compliance/listener/getWaiting4ReviewListener',
    method: 'get',
    params: {'verifyStatus':0}
  })
}

// 审核通过
export function passRequestListener(pkid) {

  return request({
    url: '/compliance/pk/passPKTopic',
    method: 'post',
    params:{'id':pkid+""}
   })
}
export function refuseRequestListener(pkid,msg) {
  console.log(pkid);
  return request({
    url: '/compliance/pk/refusePKTopic' ,
    method: 'post',
    params:{'id':pkid+"",'msg':msg}
  })
}
export function verifyIdCard(listenerRequestId){
  return request({
    url: '/compliance/listener/verifyIdCard',
    method: 'get',
    params: {'listenerRequestId':listenerRequestId}
  })
  
  
}
export function verifyIdCardPhone(listenerRequestId){
  return request({
    url:'/compliance/listener/verifyIdCardPhone',
    method: 'get',
    params: {'listenerRequestId':listenerRequestId}

  })
}
export function verifySuccess(listenerRequestId){

  return request({
    url: '/compliance/listener/verifySuccess',
    method: 'get',
    params: {'listenerRequestId':listenerRequestId}
  })
}
