import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
interface Student { id:string; name:string; grades:Record<string,(number|null)[]> }
interface ClassRoom { id:string; year:number; students:Student[] }
interface Data { classes:ClassRoom[]; subjects:string[]; passingAverage:number; assessmentCount:number }
const KEY='lua-nova-school-data-v1';
const DEFAULT_PASSING_AVERAGE=6;
const DEFAULT_ASSESSMENT_COUNT=2;
function validAssessmentCount(value:unknown):value is number {
 return typeof value==='number'&&Number.isInteger(value)&&value>=1&&value<=4;
}
function validPassingAverage(value:unknown):value is number {
 return typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=10&&Math.abs(value*10-Math.round(value*10))<1e-9;
}
const SUBJECTS=['Matemática','Português','Ciências','História','Geografia','Inglês'];
function sample():Data {
 const names=[
 ['Ana Clara Ribeiro','Bruno Martins','Camila Oliveira','Daniel Costa','Eduarda Lima'],
 ['Felipe Santos','Giovana Almeida','Heitor Souza','Isabela Rocha','João Pedro Melo'],
 ['Karen Ferreira','Lucas Carvalho','Mariana Gomes','Nathan Barros','Olívia Duarte'],
 ['Pedro Henrique Alves','Rafaela Nunes','Samuel Correia','Thiago Mendes','Valentina Freitas']
 ];
 return {assessmentCount:DEFAULT_ASSESSMENT_COUNT,passingAverage:DEFAULT_PASSING_AVERAGE,subjects:[...SUBJECTS],classes:names.map((ns,i)=>({id:String(i+6),year:i+6,students:ns.map((name,j)=>({id:`${i+6}-${j}`,name,grades:Object.fromEntries(SUBJECTS.map(s=>[s,[null,null]])) as Student['grades']}))}))};
}
function load():Data {
 try { const raw=localStorage.getItem(KEY); if(raw){const d=JSON.parse(raw) as Data;if(d.classes&&d.subjects)return {...d,assessmentCount:validAssessmentCount(d.assessmentCount)?d.assessmentCount:DEFAULT_ASSESSMENT_COUNT,passingAverage:validPassingAverage(d.passingAverage)?d.passingAverage:DEFAULT_PASSING_AVERAGE};} } catch {}
 return sample();
}
@Component({selector:'app-root',standalone:true,imports:[FormsModule],templateUrl:'./app.component.html'})
export class AppComponent {
 data=signal<Data>(load()); classId=signal('6'); subject=signal(SUBJECTS[0]); query=signal('');
 activeView=signal<'overview'|'settings'>('overview');
 assessmentOptions=[1,2,3,4];
 assessmentCount=computed(()=>this.data().assessmentCount);
 assessmentIndexes=computed(()=>Array.from({length:this.assessmentCount()},(_,i)=>i));
 assessmentCountDraft=signal<number|null>(this.data().assessmentCount);
 assessmentCountInvalid=computed(()=>!validAssessmentCount(this.assessmentCountDraft()));
 settingsChanged=computed(()=>this.passingAverageDraft()!==this.passingAverage()||this.assessmentCountDraft()!==this.assessmentCount());
 passingAverage=computed(()=>this.data().passingAverage);
 passingAverageDraft=signal<number|null>(this.data().passingAverage);
 passingAverageInvalid=computed(()=>!validPassingAverage(this.passingAverageDraft()));
 saveError=signal('');
 settingsMessage=signal('');
 classes=computed(()=>this.data().classes);
 current=computed(()=>this.classes().find(c=>c.id===this.classId())??this.classes()[0]);
 students=computed(()=>{const q=this.query().trim().toLocaleLowerCase('pt-BR');return (this.current()?.students??[]).filter(s=>s.name.toLocaleLowerCase('pt-BR').includes(q));});
 total=computed(()=>this.classes().reduce((n,c)=>n+c.students.length,0));
 pending=computed(()=>this.classes().flatMap(c=>c.students).reduce((n,s)=>n+this.data().subjects.reduce((m,sub)=>m+this.activeGrades(s,sub).filter(g=>g===null).length,0),0));
 completion=computed(()=>{const ss=this.current()?.students??[];const done=ss.reduce((n,s)=>n+this.data().subjects.reduce((m,sub)=>m+this.activeGrades(s,sub).filter(g=>g!==null).length,0),0);const all=ss.length*this.data().subjects.length*this.assessmentCount();return all?Math.round(done/all*100):0;});
 constructor(){this.persist();}
 activeGrades(s:Student,sub=this.subject()):(number|null)[]{return this.assessmentIndexes().map(i=>s.grades[sub]?.[i]??null);}
 average(s:Student,sub=this.subject()):number|null{const grades=this.activeGrades(s,sub);return grades.some(g=>g===null)?null:grades.reduce<number>((sum,g)=>sum+(g??0),0)/this.assessmentCount();}
 status(s:Student):string{const grades=this.activeGrades(s);const average=this.average(s);return average!==null?(average>=this.passingAverage()?'Aprovado':'Atenção'):grades.some(g=>g!==null)?'Em andamento':'Pendente';}
 value(s:Student,i:number):number|null{return s.grades[this.subject()]?.[i]??null;}
 setGrade(id:string,i:number,raw:string|number|null):void{if(!Number.isInteger(i)||i<0||i>=this.assessmentCount())return;const v=raw===''||raw===null?null:Number(raw);if(v!==null&&(!Number.isFinite(v)||v<0||v>10))return;this.data.update(d=>({...d,classes:d.classes.map(c=>({...c,students:c.students.map(s=>{if(s.id!==id)return s;const stored=s.grades[this.subject()]??[];const g=Array.from({length:Math.max(stored.length,this.assessmentCount())},(_,index)=>stored[index]??null);g[i]=v;return {...s,grades:{...s.grades,[this.subject()]:g}}})}))}));this.persist();}
 setPassingAverageDraft(value:number|null):void{this.passingAverageDraft.set(value);this.settingsMessage.set('');}
 setAssessmentCountDraft(value:number|null):void{this.assessmentCountDraft.set(value);this.settingsMessage.set('');}
 applySettings():void{
  const passingAverage=this.passingAverageDraft();
  const assessmentCount=this.assessmentCountDraft();
  if(!validPassingAverage(passingAverage)||!validAssessmentCount(assessmentCount)||!this.settingsChanged())return;
  this.data.update(d=>({...d,passingAverage,assessmentCount}));
  this.settingsMessage.set(this.persist()?'Configurações aplicadas e salvas neste navegador.':'');
 }
 persist():boolean{
  try{localStorage.setItem(KEY,JSON.stringify(this.data()));this.saveError.set('');return true;}
  catch{this.saveError.set('Não foi possível salvar as alterações neste navegador. Elas podem ser perdidas ao recarregar a página.');return false;}
 }
 initials(n:string):string{return n.split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase();}
 restore():void{if(confirm('Restaurar os dados de exemplo? As notas lançadas serão apagadas e as configurações voltarão para média mínima 6 e 2 avaliações.')){this.data.set(sample());this.passingAverageDraft.set(DEFAULT_PASSING_AVERAGE);this.assessmentCountDraft.set(DEFAULT_ASSESSMENT_COUNT);this.settingsMessage.set('');this.persist();}}
}
