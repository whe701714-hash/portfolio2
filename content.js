export const folders = [
  {id:'projects', title:'Projects'},
  {id:'snapshot', title:'Snapshot', heading:'设计师速写', notes:['从使用情境着手，先记录行为，再构建设计问题。','在概念草图、比例模型和功能样机之间反复推敲。','个人经历和工作室札记待替换。']},
  {id:'achievements', title:'Achievements', heading:'阶段成果', notes:['这里将收录展览、奖项及团队项目中的个人贡献。']},
  {id:'garden', title:'Garden', heading:'进行中的想法', notes:['收集材料、连接方式和制造工艺的线索。','对照创意实验区，记录下一轮原型要验证的问题。']}
];

const stages = [
  ['设计背景', '界定场景、使用条件和设计目标。'],
  ['用户调研', '记录实际使用动作和使用环境。'],
  ['创意草图', '比较形态、尺寸和操作路径。'],
  ['设计推演', '检查结构、装配和可维护性。'],
  ['三维建模', '用数字模型验证比例和零件关系。'],
  ['最终成果', '用样机和成果图呈现整套方案。']
];

export const projects = [
  {id:'field-light', category:'产品设计', name:'Field Light · 便携灯', summary:'面向临时工作台的照明概念，探索单手定位与携带之间的关系。', cover:1, images:[1,8,4,9,5,1]},
  {id:'reform', category:'材料与工艺', name:'Reform · 再生材料样本', summary:'以不同颗粒尺度探索再生材料的表面表现和成形限制。', cover:2, images:[2,8,4,11,9,2]},
  {id:'transit', category:'交互原型', name:'Transit · 手持工具', summary:'以握持和视线变化为线索，研究移动状态下的实体反馈。', cover:3, images:[3,8,4,9,5,3]},
  {id:'study', category:'造型研究', name:'Contour · 叠放座具', summary:'在叠放与结构稳定性的限制内探索简洁的体量关系。', cover:10, images:[10,8,4,9,5,10]},
  {id:'weave', category:'小批量实验', name:'Fold · 折叠织物', summary:'观察柔性片材的重复折叠与连接方法。', cover:7, images:[7,8,4,11,9,7]}
].map(({images,...project}) => ({...project, stages:stages.map(([name,summary],index)=>({name,summary,image:images[index]}))}));

export const experiments = [
  [4,'概念草图',4,5,38,-7,1.45],[5,'灯具建模',42,4,31,7,1.2],[6,'城市摄影',70,12,25,-4,.93],
  [7,'折叠织物',6,36,29,5,1.03],[2,'表面样本',33,33,37,-5,1.5],[9,'结构研究',63,43,32,6,1.5],
  [3,'手持原型',4,68,37,-4,1.65],[11,'颜色样本',36,64,31,5,1.23],[10,'座具实验',65,72,31,-6,1.42]
];
export const asset = index => 'study-' + index + '.jpg';

