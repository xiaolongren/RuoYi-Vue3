import request from '@/utils/request'

/**
 * 限制使用app
 * @param {} targetUid 
 * @param {*} reason 
 * @param {*} durationSeconds 
 * @param {*} uid 
 * @param {*} token 
 * @returns 
 */
 
export function restrictionUse(targetUid,reason,durationSeconds,uid,token) {
  console.log(targetUid+' '+reason+' '+durationSeconds+' '+uid+' '+token);
  return request({
    url: '/cms/usermanager/restrictionUse' ,
    method: 'get',
    params:{'targetUid':targetUid+"",'msg':reason,'durationSeconds':durationSeconds,'token':token,'uid':uid}
  })
}
export function sendSingleMsg(targetUid,msg,uid,token) {
  return request({
    url: '/cms/usermanager/sendNotificationToSingleListener' ,
    method: 'get',
    params:{'targetUid':targetUid+"",'msg':msg,'token':token,'uid':uid}
  })
}
export function sendAllMsg(title,msg,uid,token,mroute) {
  return request({
    url: '/cms/usermanager/sendNotificationToAllListeners' ,
    method: 'get',
    params:{'msg':msg,'title':title,'token':token,'uid':uid,'mroute':mroute}
  })
}
export function addListenerNotification(uid,token,targetUid,title,content,toAll,shouldConfirm){
  return request({
    url: '/cms/usermanager/addListenerNotification' ,
    method: 'post',
    params:{'targetUid':targetUid,'title':title,'token':token,'uid':uid,'content':content,'toAll':toAll,'shouldConfirm':shouldConfirm}
  })
}