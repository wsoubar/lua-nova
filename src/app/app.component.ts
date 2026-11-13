import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
interface Student { id:string; name:string; grades:Record<string,[number|null,number|null]> }
interface ClassRoom { id:string; year:number; students:Student[] }
interface Data { classes:ClassRoom[]; subjects:string[] }
const KEY='lua-nova-school-data-v1';
const SUBJECTS=['Matemática','Português','Ciências','História','Geografia','Inglês'];
function sample():Data {
 const names=[
 ['Ana Clara Ribeiro','Bruno Martins','Camila Oliveira','Daniel Costa','Eduarda Lima'],
 ['Felipe Santos','Giovana Almeida','Heitor Souza','Isabela Rocha','João Pedro Melo'],
 ['Karen Ferreira','Lucas Carvalho','Mariana Gomes','Nathan Barros','Olívia Duarte'],
 ['Pedro Henrique Alves','Rafaela Nunes','Samuel Correia','Thiago Mendes','Valentina Freitas']
 ];
 return {subjects:[...SUBJECTS],classes:names.map((ns,i)=>({id:String(i+6),year:i+6,students:ns.map((name,j)=>({id:`${i+6}-${j}`,name,grades:Object.fromEntries(SUBJECTS.map(s=>[s,[null,null]])) as Student['grades']}))}))};
}
function load():Data {
 try { const raw=localStorage.getItem(KEY); if(raw){const d=JSON.parse(raw) as Data;if(d.classes&&d.subjects)return d;} } catch {}
 return sample();
}
@Component({selector:'app-root',standalone:true,imports:[FormsModule],templateUrl:'./app.component.html'})
export class AppComponent {
 data=signal<Data>(load()); classId=signal('6'); subject=signal(SUBJECTS[0]); query=signal('');
 classes=computed(()=>this.data().classes);
 current=computed(()=>this.classes().find(c=>c.id===this.classId())??this.classes()[0]);
 students=computed(()=>{const q=this.query().trim().toLocaleLowerCase('pt-BR');return (this.current()?.students??[]).filter(s=>s.name.toLocaleLowerCase('pt-BR').includes(q));});
 total=computed(()=>this.classes().reduce((n,c)=>n+c.students.length,0));
 pending=computed(()=>this.classes().flatMap(c=>c.students).reduce((n,s)=>n+this.data().subjects.reduce((m,sub)=>m+(s.grades[sub]??[null,null]).filter(g=>g===null).length,0),0));
 completion=computed(()=>{const ss=this.current()?.students??[];const done=ss.reduce((n,s)=>n+this.data().subjects.reduce((m,sub)=>m+(s.grades[sub]??[null,null]).filter(g=>g!==null).length,0),0);const all=ss.length*this.data().subjects.length*2;return all?Math.round(done/all*100):0;});
 constructor(){this.persist();}
 average(s:Student,sub=this.subject()):number|null{const g=s.grades[sub]??[null,null];return g[0]===null||g[1]===null?null:(g[0]+g[1])/2;}
 status(s:Student):string{const g=s.grades[this.subject()]??[null,null];const a=this.average(s);return a!==null?(a>=6?'Aprovado':'Atenção'):g.some(x=>x!==null)?'Em andamento':'Pendente';}
 value(s:Student,i:number):number|null{return s.grades[this.subject()]?.[i]??null;}
 setGrade(id:string,i:number,raw:string|number|null):void{const v=raw===''||raw===null?null:Number(raw);if(v!==null&&(!Number.isFinite(v)||v<0||v>10))return;this.data.update(d=>({...d,classes:d.classes.map(c=>({...c,students:c.students.map(s=>{if(s.id!==id)return s;const g=[...(s.grades[this.subject()]??[null,null])] as [number|null,number|null];g[i]=v;return {...s,grades:{...s.grades,[this.subject()]:g}}})}))}));this.persist();}
 persist():void{localStorage.setItem(KEY,JSON.stringify(this.data()));}
 initials(n:string):string{return n.split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase();}
 restore():void{if(confirm('Restaurar os dados de exemplo? As notas lançadas serão apagadas.')){this.data.set(sample());this.persist();}}
}