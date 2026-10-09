(function (root) {
'use strict';
function validateTasks(value) {
  if (!Array.isArray(value)) throw new Error('Backup must contain a task array.');
  const ids = new Set();
  return value.map(task => {
    if (!task || typeof task !== 'object' || !Number.isSafeInteger(task.id) || task.id < 0 || ids.has(task.id) || typeof task.text !== 'string' || !task.text.trim() || task.text.trim().length > 500 || typeof task.completed !== 'boolean' || !Number.isFinite(Date.parse(task.createdAt))) throw new Error('Invalid or duplicate task in backup.');
    ids.add(task.id);
    const result = {id:task.id, text:task.text.trim(), completed:task.completed, createdAt:new Date(task.createdAt).toISOString(), priority:['low','medium','high'].includes(task.priority) ? task.priority : 'medium'};
    for (const key of ['updatedAt','completedAt']) if (task[key] != null) {
      if (!Number.isFinite(Date.parse(task[key]))) throw new Error('Invalid task date.');
      result[key] = new Date(task[key]).toISOString();
    }
    return result;
  });
}
function filterTasks(tasks, search = '', filter = 'all') {
  return tasks.filter(task => task.text.toLowerCase().includes(search.trim().toLowerCase()) && (filter === 'active' ? !task.completed : filter === 'completed' ? task.completed : true));
}
function nextId(tasks, now = Date.now()) { return Math.max(now, ...tasks.map(task => task.id + 1), 0); }
const api = {validateTasks, filterTasks, nextId};
if (typeof module !== 'undefined') module.exports = api;
else root.TaskData = api;
})(globalThis);
