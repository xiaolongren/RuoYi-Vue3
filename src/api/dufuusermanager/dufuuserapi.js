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
