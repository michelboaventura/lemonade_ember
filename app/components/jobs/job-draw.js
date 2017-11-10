/* global jsPlumb */
import Component from '@ember/component';
import config from '../../config/environment';
import io from 'npm:socket.io-client';
import Ps from 'npm:perfect-scrollbar';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.set('socket', io(config.webSocketIO.url + config.webSocketIO.namespace, { path:config.webSocketIO.path }, {upgrade: true}));
    this.set('jsplumb', jsPlumb.getInstance({Container: this.elementId, draggable: false}));
  },

  didInsertElement() {
    Ps.initialize(document.getElementById("draw-container"));

    let job = this.get('job');
    let tasks = job.get('workflow.tasks');
    let selectedTask = this.get('selectedTask');
    //Draw flow
    job.get('workflow.flows').forEach((flow) => {
      this.send('addFlow', flow);
    });

    if(!job.get('isCompleted')){
      //Socket-io client
      let socket = this.get('socket');
      var component = this;

      //make connection
      socket.on('connect', () => { socket.emit('join', {room: job.id}); });
      socket.on('connect_error', () => { console.debug('Web socket server offline'); });
      socket.on('disconnect', () => { console.debug('disconnect'); });

      //handle messages
      socket.on('update task', function(frame, server_callback) {
        //        console.log('update task',frame.status, frame);
        frame.status = frame.status.toLowerCase();
        var task = tasks.findBy('id', frame.task.id);
        if(task.step.logs.findBy('id', frame.id) == undefined){
          Ember.set(task, 'step.status', frame.status);
          task.step.logs.pushObject(frame);
          if(frame.type === 'HTML'){
            task.tables.pushObject(frame);
          } else if(frame.type === 'TEXT') {
            task.logs.pushObject(frame);
          }
        }
        if(selectedTask && selectedTask.id === task.id){
          //console.log('update selected Task', selectedTask, '->', task);
          component.set('selectedTask', task);
        }
        if (server_callback){ server_callback(); }
      });

      socket.on('task result', function(frame, server_callback) {
        //console.log('result', frame);
        frame.status = frame.status.toLowerCase();
        var task = tasks.findBy('id', frame.task.id);
        if(task.result == undefined){
          Ember.set(task, 'step.status', frame.status);
          Ember.set(task, 'result', frame);
        }
        if(selectedTask && selectedTask.id === task.id){
          //console.log('update selected Task', selectedTask, '->', task);
          component.set('selectedTask', task);
        }
        if (server_callback){ server_callback(); }
      });

      socket.on('update job', function(frame, server_callback) {
        // console.log('update job', frame);
        job.set('status', frame.status.toLowerCase());
        job.set('status_text', frame.message);
        if (server_callback){ server_callback(); }
      });
    }
  },

  willDestroyElement() {
    this._super(...arguments);
    var socket = this.get('socket');
    let jobId = this.get('job.id');
    socket.emit('leave', { room: jobId });
    socket.emit('disconnect');
    socket.close();
  },

  actions: {
    addFlow(flow) {
      this.get('jsplumb').connect({
        detachable: false,
        uuids: [
          `${flow.source_id}/${flow.source_port}`,
          `${flow.target_id}/${flow.target_port}`
        ]
      });
    },
  }
});
