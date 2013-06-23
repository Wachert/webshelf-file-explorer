
Ext.define('DirectoryListing.controller.Authentication', {
    extend: 'Ext.app.Controller',

    views: [ 'LoginWindow' ],
    stores: [  ],

    refs: [
        { ref: 'loginWindow', selector: 'window[xid=loginwindow]' },
        { ref: 'fileWindow', selector: 'window[xid=filewindow]' },
        { ref: 'form', selector: 'window[xid=loginwindow] form' }
    ],

    cachedLoginStatus: null,

   init: function() {

        this.control({
            'window[xid=loginwindow]': {
               afterrender: this.onWindowRendered
            },
            'window[xid=loginwindow] toolbar button[xid=do-login]': {
               click: this.onLoginClicked
            },
            scope:this
        });

        this.application.on({
           'logout': this.globalLogout,
           'checkloginstatus': this.globalCheckLoginStatus,
           scope: this
        });

   },

   globalLogout: function() {
      var me = this;
      Ext.Ajax.request({
          url: 'ajax.php?controller=authentication&action=logout',
          success: function(response, opts) {
             me.application.fireEvent('checkloginstatus');
             Msg.show("Success", "Logout successfull.");
          },
          failure: function(response, opts) {
              Msg.show("Failure", "Logout failed.");
          }
      });
   },

   globalCheckLoginStatus: function() {
      var me = this;
      Ext.Ajax.request({
          url: 'ajax.php?controller=authentication&action=getuserstatus',
          success: function(response, opts) {
             var json = Ext.decode(response.responseText);

             if(json.result.loggedin==true && (me.cachedLoginStatus==false || me.cachedLoginStatus==null)) {
                me.application.fireEvent('loggedin', json.result.username);
             } else if(json.result.loggedin==false && (me.cachedLoginStatus==true || me.cachedLoginStatus==null)) {
                me.application.fireEvent('loggedout');
             }

             me.cachedLoginStatus = json.result.loggedin;

          },
          failure: function(response, opts) {
              Msg.show("Failure", "Could not check user status.");
          }
      });
   },

   onWindowRendered: function(win) {
      console.log('focus!')
      win.child('form').getForm().findField('args[username]').focus(true, true);
   },

   onLoginClicked: function(btn) {
      var me = this;
      var win = this.getLoginWindow();
      var form = this.getForm();

      form.getForm().submit({
         clientValidation: true,
         url: 'ajax.php?controller=authentication&action=login',
         success: function(form, action) {
            Msg.show("Success", "Login successfull.");
            me.application.fireEvent('checkloginstatus');
            win.close();
         },
         failure: function(form, action) {
            Msg.show("Failure", "Login failed.");
            me.application.fireEvent('checkloginstatus');
         }
      });

   }


});