const {test} = require('node:test');
const assert = require('node:assert/strict');
const {validateTasks,filterTasks,nextId} = require('../task-data.js');
const task = {id:1,text:'  Read docs  ',completed:false,createdAt:'2026-10-09T12:00:00Z'};
test('stored data is normalized without mutating input',()=>{assert.equal(validateTasks([task])[0].text,'Read docs');assert.equal(task.text,'  Read docs  ');});
test('malformed storage and injected identifiers are rejected',()=>{for(const value of [{},[null],[{...task,id:'1)alert(1)'}],[{...task,text:' '}],[{...task,completed:'false'}],[{...task,createdAt:'bad'}],[task,task]]) assert.throws(()=>validateTasks(value));});
test('search and status filters combine',()=>{const tasks=validateTasks([task,{...task,id:2,text:'Buy tea',completed:true}]); assert.equal(filterTasks(tasks,'DOC','active').length,1);assert.equal(filterTasks(tasks,'doc','completed').length,0);assert.equal(filterTasks(tasks,'','completed')[0].id,2);});
test('same-millisecond additions have distinct IDs',()=>{assert.equal(nextId([{id:100},{id:101}],100),102);});
