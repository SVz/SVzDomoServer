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
          store: {
            autoLoad: true,
            fields: [{name: 'action', convert: function(newValue, model) {
              return newValue.toUpperCase()
            }}, 'activated', 'id', 'pic', 'time', 'hour', 'minute', 'day'],
            proxy: {
              type: 'ajax',
              url: '/scheduler',
              reader: {
                type: 'json',
                rootProperty: 'crons'
              }
            }
          },
          itemTpl: Ext.create('Ext.XTemplate',
            '<div class="img pin-pic cronz" style="background-image: url(static/img/{pic});"></div>',
              '<div class="content cronz">',
                '<div class="timeclock">',
                  '<div id="clock" class="light">',
                    '<div class="display">',
                    '  <div class="weekdays">',
                    '     <span class="">MON</span>',
                    '     <span>TUE</span>',
                    '     <span class="active">WED</span>',
                    '     <span>THU</span>',
                    '     <span>FRI</span>',
                    '     <span>SAT</span>',
                    '     <span>SUN</span>',
                    '  </div>',
                    '  <div class="ampm">{action}</div>',
                    '  <div class="alarm"></div>',
                    '  <div class="digits">{hour}:{minute}</div>',
                    '</div>',
                  '</div>',
                '</div>',
              '</div>',
                  {
                      dayIn: function(value){
                          console.log(value)
                          return '';
                      }
                  })
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
                console.log('off')
                Ext.Ajax.request({
                    url: '/'+record.data.Rcode+"/off", disableCaching: false
                });
              }

              if(tgt.hasCls('on')) {
                Ext.Ajax.request({url: '/'+record.data.Rcode+'/on', disableCaching: false})
              }
            }
          },
          cls: 'dataview-basic',
          store: {
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

                      reader: {
                          type: 'json',
                          rootProperty: 'pins'
                      }
                  }
              },
          //itemTpl: '<div class="command-item"><div class="pic"><img class="pic" src="/static/img/{image}"/></div><div class="name">{name}</div></div>'
          itemTpl: Ext.create('Ext.XTemplate',
            '<div class="img pin-pic" style="background-image: url(static/img/{image});"></div>',
              '<div class="content">',
                '<div class="name">',
                  '{name}',
                '</div>',
                '<div class="actions">',
                  '<button class="turn on" data-id="{Rcode}">On</button>',
                  '<button class="turn off" data-id="{Rcode}">Off</button>',
                '</div>',
              '</div>')
        },
        {title: 'View', html:'<div class="vid-container"><img class="vid" src="http://88.124.156.1:8090/?action=stream" alt="cam stream"/></div>'}
      ]
    }) 
  }
});
