var require = (function() {
    var sss_url = 'http://kedemo.know-center.tugraz.at:8080/SSSClientSide_Rella/';
    //var sss_url = 'http://localhost/sm/lib/SocialSemanticServer/SSSClientSide/';
    return {
        baseUrl: 'js',
        paths: {
            'sss.jsutils' : sss_url + "JSUtilities/JSGlobals",
            'sss.globals' : sss_url + "SSSClientInterfaceGlobals/globals/SSGlobals",
            'sss.varu' : sss_url + "SSSClientInterfaceGlobals/globals/SSVarU",
            'sss.conn.entity' : sss_url + "SSSClientInterfaceREST/connectors/SSEntityConns",
            'sss.conn.userevent' : sss_url + "SSSClientInterfaceREST/connectors/SSUserEventConns",
            'sss.conn.learnep' : sss_url + "SSSClientInterfaceREST/connectors/SSLearnEpConns",
            'sss.conn.colls' : sss_url + "SSSClientInterfaceREST/connectors/SSCollConns",
            //'sss.conn.entity' : 'mockup/SSResourceConns', 
            //'sss.conn.userevent' : 'mockup/SSUserEventConns', 
            //'sss.conn.learnep' : 'mockup/SSLearnEpConns', 
            'vie' : 'vendors/VIE/vie',
            'backbone' : 'vendors/backbone/backbone-min',
            'underscore' : 'vendors/underscore/underscore-min',
            'jquery' : 'vendors/jquery/js/jquery-1.9.1',
            'jquery-ui' : 'vendors/jquery/js/jquery-ui-1.10.3.custom.min',
            'logger' : 'vendors/logger'
        },
        shim: {
            'logger' : { 
                'exports' : 'Logger'
            },
            'sss.conn.userevent' : [ 'sss.jsutils', 'sss.globals', 'sss.varu', 'logger'],
            'sss.conn.entity' : [ 'sss.jsutils', 'sss.globals', 'sss.varu', 'logger'],
            'sss.conn.learnep' : [ 'sss.jsutils', 'sss.globals', 'sss.varu', 'logger'],
            'sss.conn.colls' : [ 'sss.jsutils', 'sss.globals', 'sss.varu', 'logger'],
            'vie' : {
                'deps' : ['backbone', 'jquery', 'underscore'],
                'exports' : 'VIE'
            },
            'backbone' : {
                'deps': ['underscore', 'jquery'],
                'exports' : 'Backbone'
            },
            'underscore' : {
                'exports' : '_'
            }
        }
    };
}());


