(function(root) {
  'use strict';
  const DAY = 86400000;
  const plans = {普通:1,V1:20,V2:100,V3:200};
  const seedJobs = [
    ['j1','Java 后端开发工程师','青禾科技','成都','互联网','3–5年','本科','18–28K','开发','社招',['Java','Spring Boot','MySQL'],'青','green'],
    ['j2','数据产品经理','远山零售','杭州','零售','3–5年','本科','20–30K','产品','社招',['数据产品','用户增长','SQL'],'远','blue'],
    ['j3','前端开发工程师','星澜数科','上海','互联网','1–3年','本科','15–25K','开发','社招',['Vue','TypeScript','可视化'],'星','purple'],
    ['j4','品牌运营专员','拾光生活','成都','消费品','1–3年','大专','8–12K','运营','社招',['内容运营','品牌','社群'],'拾','orange'],
    ['j5','算法实习生','青禾科技','成都','互联网','应届/实习','本科','200–300元/天','算法','实习',['Python','机器学习','数据分析'],'青','green'],
    ['j6','供应链分析师','远山零售','杭州','零售','1–3年','本科','未披露','供应链','社招',['供应链','SQL','分析'],'远','blue'],
    ['j7','测试开发工程师','星澜数科','上海','互联网','3–5年','本科','18–26K','测试','社招',['自动化','Python','质量保障'],'星','purple'],
    ['j8','软件开发管培生','云帆制造','深圳','制造','应届/实习','本科','10–16K','开发','校招',['Java','工程实践','培养计划'],'云','orange'],
    ['j9','资深产品设计师','拾光生活','成都','消费品','5年以上','本科','22–32K','设计','社招',['交互设计','设计系统','Figma'],'拾','orange'],
    ['j10','Java 后端开发工程师','云帆制造','深圳','制造','3–5年','本科','18–26K','开发','社招',['Java','设备平台','SQL'],'云','orange']
  ];
  function seed() {
    return {version:1,now:Date.parse('2026-10-29T10:00:00+08:00'),logged:false,adminLogged:true,user:'林同学',member:'普通',until:0,used:{},unlocks:{},favorites:[],credits:[],orders:[],feedback:[],ledger:[],paymentAvailable:true,failNext:false,
      jobs:seedJobs.map((x,i)=>({id:x[0],title:x[1],company:x[2],city:x[3],industry:x[4],exp:x[5],education:x[6],salary:x[7],category:x[8],type:x[9],tags:x[10],letter:x[11],tone:x[12],published:i!==8,status:i===6?'已结束':'在招',source:i%2?'企业招聘官网 B':'企业招聘官网 A',verified:'2026-10-29 09:10',reason:i===8?'经验字段需人工确认':'',description:'参与核心业务系统的设计与迭代，与产品、设计及业务团队共同推进需求落地。关注系统质量，持续改善用户体验与交付效率。',requirements:'具备相关岗位经验，能够独立分析问题并清晰沟通。有团队协作意识，重视专业能力与持续学习。',summary:'这是一条用于演示的岗位信息。工作地点、经验要求和职责均为虚构样例，不对应真实招聘机会。'})),
      sources:[{id:'s1',name:'企业招聘官网 A',url:'https://careers.example.com',schedule:'每日 09:00',enabled:true,status:'正常',last:'今天 09:10'},{id:'s2',name:'企业招聘官网 B',url:'https://jobs.example.com',schedule:'每日 09:30',enabled:true,status:'正常',last:'今天 09:35'},{id:'s3',name:'校园招聘示例源',url:'https://campus.example.com',schedule:'每日 10:00',enabled:false,status:'已暂停',last:'昨日 10:05'}],
      runs:[{id:'TASK-1029-01',source:'企业招聘官网 A',status:'成功',found:5,added:3,updated:2,time:'今天 09:10'},{id:'TASK-1029-02',source:'企业招聘官网 B',status:'失败',found:0,added:0,updated:0,time:'今天 09:35'}],ai:{model:'模型待接入',review:true},dictionary:{industry:['互联网','零售','消费品','制造'],category:['开发','产品','运营','算法','供应链','测试','设计']},planEnabled:{V1:true,V2:true,V3:true}};
  }
  function day(s) {return new Date(s.now+8*3600000).toISOString().slice(0,10);}
  function tier(s) {return s.member!=='普通'&&s.until>s.now?s.member:'普通';}
  function balance(s) {return {tier:tier(s),limit:plans[tier(s)],used:s.used[day(s)]||0,base:Math.max(0,plans[tier(s)]-(s.used[day(s)]||0)),credit:s.credits.filter(c=>c.expires>s.now&&!c.used).length};}
  function unlock(s,id) {
    if(!s.logged)return 'login';
    if(s.unlocks[id])return 'repeat';
    const j=s.jobs.find(j=>j.id===id);
    if(!j||!j.published||j.status!=='在招')return 'unavailable';
    if(s.failNext){s.failNext=false;return 'failed';}
    const b=balance(s);if(!b.base&&!b.credit)return 'quota';
    let kind='基础额度';const credit=s.credits.filter(c=>!c.used&&c.expires>s.now).sort((a,b)=>a.expires-b.expires)[0];
    if(credit){credit.used=true;kind='补偿额度';}else s.used[day(s)]=(s.used[day(s)]||0)+1;
    s.unlocks[id]={time:s.now,kind};s.ledger.unshift({id:'L'+s.now+'-'+id,job:id,time:s.now,kind,amount:-1});return 'ok';
  }
  function order(s,level) {
    if(!s.logged)return {error:'login'};
    if(!s.paymentAvailable)return {error:'当前环境暂不支持购买'};
    if(!s.planEnabled[level])return {error:'套餐暂未上架'};
    const active=tier(s);if(active!=='普通'&&active!==level)return {error:'有效期内仅支持同级续费，跨级方案待定'};
    const pending=s.orders.find(o=>o.status==='待支付'||o.status==='确认中');if(pending)return {order:pending};
    const o={id:'DEMO-'+String(s.orders.length+1).padStart(4,'0'),level,created:s.now,status:'待支付',grant:false,refund:'',start:0,end:0,price:'价格待定'};s.orders.unshift(o);return {order:o};
  }
  function grant(s,id) {
    const o=s.orders.find(o=>o.id===id);if(!o||o.status!=='已支付'||o.refund==='退款成功')return false;if(o.grant)return true;
    const active=tier(s);if(active!=='普通'&&active!==o.level){o.problem='等级冲突，待人工处理';return false;}
    o.start=Math.max(s.now,s.until);o.end=o.start+30*DAY;o.grant=true;s.member=o.level;s.until=o.end;return true;
  }
  function pay(s,id,result) {
    const o=s.orders.find(o=>o.id===id);if(!o||o.status==='已关闭')return false;
    if(o.status==='已支付'){if(result==='success')grant(s,id);return true;}
    if(result==='cancel'||result==='fail'){o.status='待支付';o.last=result;return true;}
    if(result==='pending'){o.status='确认中';return true;}
    o.status='已支付';o.last=result;if(result==='success')grant(s,id);return true;
  }
  function report(s,id,reason,note) {
    if(!s.logged)return null;const existing=s.feedback.find(f=>f.job===id&&f.status==='待处理');if(existing)return existing;
    const f={id:'FB-'+(s.feedback.length+1),job:id,reason,note,time:s.now,status:'待处理',compensated:false};s.feedback.unshift(f);return f;
  }
  function compensate(s,id) {
    const f=s.feedback.find(f=>f.id===id);if(!f||!s.unlocks[f.job]||f.compensated||s.credits.some(c=>c.job===f.job))return false;
    f.status='已补偿';f.compensated=true;s.credits.push({id:'CR-'+id,job:f.job,expires:s.now+7*DAY,used:false});s.ledger.unshift({id:'L-'+id,job:f.job,time:s.now,kind:'补偿到账',amount:1});return true;
  }
  function refund(s,id,result) {
    const o=s.orders.find(o=>o.id===id);if(!o||o.status!=='已支付'||o.refund==='退款成功')return false;
    if(result==='request'){o.refund='已申请';return true;}if(result==='reject'){o.refund='申请未通过';return true;}
    if(result==='processing'){o.refund='渠道处理中';return true;}if(result==='fail'){o.refund='退款异常';return true;}
    if(result==='success'){
      if(o.start<=s.now&&o.grant){o.refund='需人工核算';return false;}
      o.refund='退款成功';o.grant=false;
      let cursor=s.now;const valid=s.orders.filter(x=>x.grant&&x.refund!=='退款成功').sort((a,b)=>a.start-b.start);
      for(const x of valid){if(x.start<=s.now){cursor=Math.max(cursor,x.end);}else{const duration=x.end-x.start;x.start=cursor;x.end=cursor+duration;cursor=x.end;}}
      s.until=cursor;s.member=valid.length?valid[0].level:'普通';return true;
    }return false;
  }
  const api={DAY,plans,seed,day,tier,balance,unlock,order,grant,pay,report,compensate,refund};
  if(typeof module!=='undefined')module.exports=api;root.JobModel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
