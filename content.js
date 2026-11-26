export const folders = [
  {id:'projects', title:'Projects'},
  {id:'snapshot', title:'Snapshot', heading:'设计师速写', notes:['观察用户如何找到信息、完成任务与理解反馈。','用流程图、线框与可交互原型检验设计假设。','个人经历和设计札记待替换。']},
  {id:'achievements', title:'Achievements', heading:'阶段成果', notes:['这里将收录展览、奖项及团队项目中的个人贡献。']},
  {id:'garden', title:'Garden', heading:'进行中的想法', notes:['探索界面动效、图标系统和创意编程。','记录下一轮原型需要验证的问题。']}
];

const digitalStages = [
  ['设计背景', '界定服务场景和用户目标。'],
  ['用户研究', '整理任务路径、痛点及待验证假设。'],
  ['信息架构', '梳理层级、导航与内容关系。'],
  ['交互推演', '比较操作流程、反馈和异常状态。'],
  ['界面与原型', '用高保真界面和可交互原型验证方案。'],
  ['最终成果', '呈现关键界面和完整使用路径。']
];
const physicalStages = [
  ['设计背景', '梳理日常使用场景和产品目标。'],
  ['用户研究', '观察握持、携带和取放行为。'],
  ['概念草图', '比较产品轮廓和部件位置。'],
  ['交互推演', '检查操作顺序与反馈。'],
  ['形态原型', '以示例图展示产品结构及状态。'],
  ['最终成果', '呈现产品使用情境和最终概念。']
];

export const projects = [
  {id:'commute',category:'UI/UX设计',name:'Wayfind · 城市出行',summary:'将出行路线、换乘与到站状态放在同一条任务路径中。',year:'2026',tools:['Figma','Prototype'],cover:1,images:[1,8,4,9,5,1],placeholder:true,link:''},
  {id:'travel',category:'UI/UX设计',name:'Pulse · 行程助手',summary:'为碎片化出行信息建立更易理解的进度与提醒界面。',year:'2026',tools:['Figma','Research'],cover:4,images:[4,8,5,9,2,4],placeholder:true,link:''},
  {id:'focus',category:'交互设计',name:'Focus Flow · 专注原型',summary:'探索状态反馈与渐进式引导，减少启停专注任务时的操作负担。',year:'2026',tools:['Prototype','Motion'],cover:2,images:[2,8,4,9,5,2],placeholder:true,link:''},
  {id:'motion',category:'交互设计',name:'Signal · 状态动效',summary:'通过节奏、位置和颜色设计可感知的轻量级系统反馈。',year:'2026',tools:['Motion','Figma'],cover:8,images:[8,2,5,9,4,8],placeholder:true,link:''},
  {id:'workspace',category:'数字产品',name:'Dayline · 协作工作台',summary:'为多人任务梳理项目、待办和进度三个层级。',year:'2026',tools:['IA','UI Design'],cover:3,images:[3,8,4,9,5,3],placeholder:true,link:''},
  {id:'library',category:'数字产品',name:'Signal Library · 内容系统',summary:'让复杂资料库在清晰分类与快速筛选之间保持平衡。',year:'2026',tools:['UX','Figma'],cover:6,images:[6,8,4,9,5,6],placeholder:true,link:''},
  {id:'remote',category:'实体产品设计',name:'Loop · 桌面控制器',summary:'研究少量实体输入如何清晰映射到数字状态。',year:'2025',tools:['Prototype','Physical UX'],cover:10,images:[10,8,4,9,10,10],placeholder:true,link:''},
  {id:'play',category:'创意实验',name:'Shape Lab · 动态图形',summary:'用几何图形探索视觉反馈和动效节奏。',year:'2026',tools:['Creative Code','Motion'],cover:7,images:[7,8,4,9,11,7],placeholder:true,link:''},
  {id:'icons',category:'创意实验',name:'Icon Motion · 图标练习',summary:'为一组小型图标建立连贯的过渡和状态语言。',year:'2026',tools:['SVG','Motion'],cover:11,images:[11,8,6,9,5,11],placeholder:true,link:''}
].map(({images,...project}) => ({
  ...project,
  stages:(project.category === '实体产品设计' ? physicalStages : digitalStages)
    .map(([name,summary],index)=>({name,summary,image:images[index]}))
}));

export const experiments = [
  [4,'界面结构',4,5,38,-7,1.45],[5,'界面练习',42,4,31,7,1.2],[6,'图标设计',70,12,25,-4,.93],
  [7,'矢量插画',6,36,29,5,1.03],[2,'动效实验',33,33,37,-5,1.5],[9,'交互状态',63,43,32,6,1.5],
  [3,'网页练习',4,68,37,-4,1.65],[11,'创意编程',36,64,31,5,1.23],[10,'实体控制器',65,72,31,-6,1.42]
];
export const asset = index => 'assets/vector-' + index + '.svg';
