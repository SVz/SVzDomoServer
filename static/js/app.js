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
      items: [
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
                Ext.Ajax.request({url: '/'+record.data.Rcode+'/on', , disableCaching: false})
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
                  '<button class="turn {state}" data-id="{Rcode}">On</button>',
                  '<button class="turn {state}" data-id="{Rcode}">Off</button>',
                '</div>',
              '</div>')
        },
        {title: 'Schedule'},
        {title: 'View'}
      ]
    }) 
  }
});

// $('.on').click(function(e) {
//   console.log(e, "zzqdzd")
// })

var on = function(id) {
  $('.off[data-id='+id+']').removeClass('active')
  $('.on[data-id='+id+']').addClass('active')

}