// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, false);

var exitCode = 0;


// Cordova is ready
//
function onDeviceReady() {
    document.addEventListener("backbutton", function (e) {
        /*if ($.mobile.activePage.is('#mappage')) {
           
        }
        else {
    
            //navigator.app.backHistory()
        }*/
        exitCode++;

        if (exitCode >= 2) {
            e.preventDefault();
            navigator.app.exitApp();
        } else {
            $.mobile.loading('show', {
                text: '再按一次退出程序',
                textonly: true,
                textVisible: true,
                theme: 'b',
                html: ""
            });
            setTimeout(function () {
                $.mobile.loading('hide');
                exitCode--;
            }, 5000);
            e.preventDefault();
            return false;
        }
    }, false);
}
$(document).bind("mobileinit", function () {
    // Make your jQuery Mobile framework configuration changes here!

    $.mobile.pushStateEnabled = false;
    $.mobile.zoom.enabled = false;
    $.mobile.buttonMarkup.hoverDelay = 0; //defaults 200
    $.mobile.defaultDialogTransition = 'slide';
    $.mobile.defaultPageTransition = 'slide';
});

$('#mappage').live('pageshow', function () {
    var the_height = ($(window).height() - $(this).find('[data-role="header"]').height() - $(this).find('[data-role="footer"]').height());
    $(this).height($(window).height()).find('[data-role="content"]').height(the_height);
    if (map) {
        google.maps.event.trigger(map, 'resize');
    }
    console.log("mappage pageshow");
});

$(document).bind("pageinit", function () {
    // Make your jQuery Mobile framework configuration changes here!

    $.mobile.allowCrossDomainPages = true;

    initialize();

    $("#btnLoad").bind("click", function () {
        $.mobile.loading('show', {
            text: '正在加载通讯录...',
            textVisible: true,
            theme: 'b',
            html: ""
        });
        getContacts();
    });
});
function getContacts() {
    // find all contacts with 'Bob' in any name field
    var options = new ContactFindOptions();
    options.filter = "";
    options.multiple = true;
    var fields = ["displayName", "name", "phoneNumbers"];
    navigator.contacts.find(fields, onSuccess, onError, options);
}
// onSuccess: Get a snapshot of the current contacts
//
function onSuccess(contacts) {
    $("#listview").empty();
    for (var i = 0; i < contacts.length; i++) {
        try {
            var name = contacts[i].displayName;
            console.log("Display Name = " + name);

            var rand = Math.random();
            var rand2 = Math.random();

            var pos = new google.maps.LatLng(rand > 0.5 ? 31.2219 - rand : 31.2219 + rand, rand2 > 0.5 ? 121.47982 - rand2 : 121.47982 + rand2);
            var phoneNumber = getPhoneNumber(contacts[i].phoneNumbers);
            createMarker(pos, name, name + "\n" + phoneNumber, i);
            $("#listview").append('<li><a href="#">' + name + '</a></li>');
        } catch (e) { }
    }
    $('#listview').listview('refresh');
    $.mobile.loading('hide');
}

// onError: Failed to get the contacts
//
function onError(contactError) {
    alert('onError!');
}
function getPhoneNumber(phoneNumbers) {
    var result = "";
    for (var j = 0; j < phoneNumbers.length; j++) {
        result += "Type: " + phoneNumbers[j].type + "\n" +
                "Value: " + phoneNumbers[j].value + "\n" +
                "Preferred: " + phoneNumbers[j].pref;
    }
    return result;
}
var map, gInfowindow, oCluster;
function initialize() {

    var myLatlng = new google.maps.LatLng(31.221908232069964, 121.47982349414065);
    var myOptions = {
        zoom: 8,
        center: myLatlng,
        mapTypeControlOptions: {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID]
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        navigationControl: true,
        scaleControl: true,
        streetViewControl: false,
        scrollwheel: true
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    gInfowindow = new google.maps.InfoWindow();
    google.maps.event.trigger(map, 'resize');

    oCluster = new MarkerClusterer(
            map, [], {
                gridSize: 70,
                maxZoom: 15,
                styles: [{
                    'url': "images/balloon_s_n.png",
                    'height': 32,
                    'width': 32
                },
                {
                    'url': "images/balloon_l_n.png",
                    'height': 48,
                    'width': 48
                }]
            });
}

// creates the marker object
function createMarker(point, title, html, id) {
    var marker = new google.maps.Marker({
        position: point,
        title: title,
        map: map,
        icon: new google.maps.MarkerImage("images/marker2.png", new google.maps.Size(21, 21)) 
        //animation: google.maps.Animation.DROP
    });

    marker.html = html;
    marker.id = id;

    google.maps.event.addListener(marker, 'click', function () {
        // load up the proper info window
        gInfowindow.setContent(this.html);
        gInfowindow.open(map, this);
    });

    oCluster.addMarker(marker);
    return marker;
}