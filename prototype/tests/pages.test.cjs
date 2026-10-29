const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const model=fs.readFileSync(__dirname+'/../dist/model.js','utf8'),app=fs.readFileSync(__dirname+'/../dist/app.js','utf8');
// Rendering smoke tests use a minimal document; browser interactions are checked separately.
for(const mode of ['web','mini','admin']){
 const routes=mode==='admin'?['login','dashboard','jobs','edit/j1','review','sources','runs','ai','dictionary','feedback','users','plans','orders','refunds','ledger']:['jobs','detail/j1','company/青禾科技','favorites','mine','login','about','member','checkout/V1','payment','orders','order','history'];
 test(`${mode} 所有原型页面可渲染`,()=>{for(const route of routes){const nodes={};const context={location:{hash:'#'+mode+'/'+route},localStorage:{getItem:()=>null,setItem(){}},document:{querySelector:k=>nodes[k]??=( {innerHTML:'',classList:{add(){},remove(){}}} ),addEventListener(){}},window:{addEventListener(){},scrollTo(){}},setTimeout(){},clearTimeout(){},console};vm.createContext(context);vm.runInContext(model,context);vm.runInContext(app,context);assert.ok(nodes['#app'].innerHTML.includes('<h1>'),route+' requires main heading');assert.ok(!nodes['#app'].innerHTML.includes('undefined'),route)}})
}
