var pinStore = Ext.create('Ext.data.Store', {
    autoLoad: true,
    fields: ['image', 'name', 'state', 'Rcode', {
      name: 'oncls', convert: function(newValue, model) {
        return model.get('state') == 'on' ? 'active' : ''
      }
    },
    {name: 'offcls', convert: function(newValue, model) {
      return model.get('state') == 'off' ? 'active' : ''
    }}],
    proxy: {
        type: 'ajax',
        // Modify this line with your API key, pretty please...
        url: '/pins.json',
        method: 'GET',

        reader: {
            type: 'json',
            rootProperty: 'pins'
        }
    }
})

var cronStore = Ext.create('Ext.data.Store', {
            autoLoad: true,
            fields: [{name: 'action', convert: function(newValue, model) {
              return newValue.toUpperCase()
            }}, 'activated', 'index', 'pic', 'time', 'hour', 'minute', 'day'],
            proxy: {
              type: 'ajax',
              url: '/scheduler',
              reader: {
                type: 'json',
                rootProperty: 'crons'
              }
            }
          });

Ext.application({
  /**
   * The launch method is called when the browser is ready and the application is ready to
   * launch.
   */
  name: "SVz Domo",
  launch: function() {
    Ext.Viewport.add({
      xtype: "tabpanel",
      fullscreen: true,
      tabBar: {
        layout: { pack: 'center' }
      },
      activeItem : 0,
      items: [
        {
          title: 'Schedule',
          xtype: 'dataview',
          scrollable: {
            direction: 'vertical'
          },
          cls: 'dataview-basic',
          store: cronStore,
          listeners: {
            itemtaphold: function(item, test, toto, model) {
              Ext.Msg.confirm('Delete Entry', 'Confirm deleting this entry ?', function(choice) {
                if(choice === 'yes') {
                  Ext.Ajax.request({
                    url: '/deschedule', disableCaching: false, method: 'GET',
                    params: {id: model.data.index, action: model.data.action.toLowerCase(), cron: model.data.minute + ' ' + model.data.hour + ' * * *'},
                    success: function(response){
                      // pinStore.sync()
                    }
                  });
                  cronStore.removeAt(model.data.xindex)
                }
              })
            }
          },
          items: [
            {
              xtype: 'toolbar', 
              docked: 'bottom',
              scrollable: false,
              items: [
                {xtype: 'spacer'},
                {text: 'Add new entry', ui: 'default',
                  handler: function() {
                    if(!this.picker) {
                      this.picker = Ext.Viewport.add({
                        xtype: 'picker',
                        useTitles: true,
                        slots: [{
                          name: 'obj',
                          store: pinStore,
                          title: 'Object',
                          displayField: 'name',
                          valueField: 'name'
                          // data: [{text: '1', value: 1}, {text: '2', value: 2}, {text: '3', value: 3}]
                        },
                        {
                          name: 'action',
                          title: 'Action',
                          data: [{text: 'ON', value: 'on'}, {text: 'OFF', value: 'off'}] 
                        }],
                        listeners: {
                          change: function(p, lamp, opts) {
                            if(!this.pickerTime) {
                              this.pickerTime = Ext.Viewport.add({
                                xtype: 'picker',
                                useTitles: true,
                                listeners: {
                                  change: function(p, time, opts) {
                                    console.log(lamp, time)
                                    Ext.Ajax.request({
                                      url: '/schedule', disableCaching: false, method: 'GET',
                                      params: {id: pinStore.find('name', lamp.obj), action: lamp.action, cron: time.minute + ' ' + time.hour + ' * * *'},
                                      success: function(response){
                                        // pinStore.sync()
                                      }
                                    });
                                    cronStore.add({action: lamp.action, minute: time.minute, hour: time.hour, pic: pinStore.findRecord('name', lamp.obj).get('image')})
                                  }
                                },
                                slots: [{
                                  name: 'hour',
                                  title: 'Hour',
                                  data: _.map(_.range(24), function(h) {
                                    return {text: h, value: h}
                                  }),
                                  value: 12
                                },
                                {
                                  name: 'minute',
                                  title: 'Minute',
                                  data: _.map(_.range(60), function(h) {
                                    return {text: h, value: h}
                                  }),
                                  value: 30
                                }]
                              }) 
                            }
                            this.pickerTime.show()
                          }
                        }
                      });
                    }
                    this.picker.show()
                  }
                },
                {xtype: 'spacer'}
              ]
            }
          ],
          itemTpl: Ext.create('Ext.XTemplate',
            '<div class="img pin-pic cronz" style="background-image: url(static/img/{pic});"></div>',
              '<div class="content cronz">',
                '<div class="timeclock">',
                  '<div id="clock" class="light">',
                    '<div class="display">',
                    '  <div class="weekdays">',
                    '     <span class="active">MON</span>',
                    '     <span class="active">TUE</span>',
                    '     <span class="active">WED</span>',
                    '     <span class="active">THU</span>',
                    '     <span class="active">FRI</span>',
                    '     <span class="active">SAT</span>',
                    '     <span class="active">SUN</span>',
                    '  </div>',
                    '  <div class="ampm">{action}</div>',
                    '  <div class="alarm"></div>',
                    '  <div class="digits">{hour}:{minute}</div>',
                    '</div>',
                  '</div>',
                '</div>',
              '</div>')
        },
        {
          title: 'Command',
          xtype: 'dataview',
          scrollable: {
            direction: 'vertical'
          },
          listeners: {
            itemtap: function(dataview, index, target, record, evt) {
              var tgt = Ext.get(evt.target)
              if(tgt.hasCls('off')) {
                Ext.Ajax.request({
                    url: '/'+record.data.xindex+"/off", disableCaching: false
                });
              }

              if(tgt.hasCls('on')) {
                Ext.Ajax.request({url: '/'+record.data.xindex+'/on', disableCaching: false})
              }
            }
          },
          cls: 'dataview-basic',
          store: pinStore,
          //itemTpl: '<div class="command-item"><div class="pic"><img class="pic" src="/static/img/{image}"/></div><div class="name">{name}</div></div>'
          itemTpl: Ext.create('Ext.XTemplate',
            '<div class="img pin-pic" style="background-image: url(static/img/{image});"></div>',
              '<div class="content">',
                '<div class="name">',
                  '{name}',
                '</div>',
                '<div class="actions">',
                  '<button class="turn on" data-id="{xindex}">On</button>',
                  '<button class="turn off" data-id="{xindex}">Off</button>',
                '</div>',
              '</div>')
        },
        {title: 'View', html:'<div class="vid-container"><img class="vid" src="http://88.124.156.1:8090/?action=stream" alt="cam stream"/></div>'}
      ]
    }) 
  }
});

