/*TODO: todo:

time sorting

*/


$(document).ready(function () {

    var apiKey = "p6hxx8kswgzu2fvv7qje5rbn"
    var apiSecret = "dxJJqMrbSG"


    //frasier
    var showId = '830135';

    var providers;

    var $selector;
    var city;
    var state;
    var neighborhood;
    var zip;
    var getProvider;

    function getService(zip) {
        cancelRequest();
        console.log('getting service providers for ',zip);
        $selector = $('select');
        $('select option').remove();
        $('.location .copy form').remove();
        $('.feed li').remove();
        providers = [];
        var serviceUrl = 'http://api.rovicorp.com/TVlistings/v9/listings/services/postalcode/' + zip + '/info?locale=en-US&countrycode=US&format=json&apikey=6bnt3uq55nnfe9sxfksgn9ms&callback=?'
        $.getJSON(serviceUrl, function (data) {
            
            var items = [];
            var areaString = "";
            $.each(data.ServicesResult.Services.Service, function (key, service) {
                providers.push(service);
            });


            $selector.change(function (e) {
                cancelRequest();
                providerSelected(e.currentTarget.value);
            });

            //populate service provider lists
            $.each(providers, function (key, service) {
                //console.log(service);
                if (service.City !== 'Eastern Time Zone') $('select').append('<option value=' + service.ServiceId + '>' + service.SystemName + '</option>');
            });


            // $selector.css('display','inline');
            
            providerSelected($selector[0].value);

        });

    }

    function providerSelected(id) {
        //console.log(id, showId);
        
        $('.feed ul li').remove();
        var showUrl = 'http://api.rovicorp.com/TVlistings/v9/listings/programdetails/' + id + '/' + showId + '/info?locale=en-US&duration=1440&include=Program&inprogress=0&format=json&apikey=6bnt3uq55nnfe9sxfksgn9ms&callback=?'
        
        $('.feed').append('<div class="loading"><img src="images/hourglass.gif" /></div>');

        getProvider = $.getJSON(showUrl, function (showData) {
            var airings = showData.ProgramDetailsResult.Schedule.Airings;

            $('.feed .loading').remove();
            var airingModels = [];
            $.each(airings, function (key, airing) {
                var airingDate = $.format.date(airing.AiringTime, "MM/dd/yyyy");

                var airingTime = airing.AiringTime.slice(airing.AiringTime.indexOf('T') + 1, airing.AiringTime.indexOf('T') + 6);

                //console.log(airing);
                var airingModel = {
                    time: airingTime,
                    title: airing.EpisodeTitle,
                    channel: airing.Channel,
                    copy: airing.Copy
                };
                airingModels.push(airingModel);
                if (!airing.EpisodeTitle) {
                    airingModel.title = 'Frasier';
                    airingModel.copy = 'No Episode Information';
                }
            
            });

            
            airingModels.sort(function(a, b) {
                var c = Number(a.time.replace(':',''));
                var d = Number(b.time.replace(':',''));
               return (c > d) ? 1 : -1;
            });

            
            if(airingModels.length > 0){
                $.each(airingModels, function(i, airingModel){
                    airingModel.time = prettifyDate(airingModel.time);
                     $("#airing-template").tmpl(airingModel).appendTo(".feed ul");
                });
                $('.feed li').fadeIn('fast');
                $('.feed li').last().css('border-bottom', 'none');

            } else {
                $('.feed').html('Sorry, no Frasier for you');
            }
        
             getProvider = null;
        }).error(function (e) {
            console.log('error:',e);
            getProvider = null;
        });

    }

    //init();
    var GETZIP = {
        getLocation: function () {
            $('.location .copy').text('locating...');
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(GETZIP.getZipCode, GETZIP.error, {
                    timeout: 7000
                }); //cache it for 10 minutes
            } else {

                GETZIP.error('Geo location not supported');
                $('.location .copy form').show();
            }
        },
        index: 0,
        error: function (msg) {

            if (msg.code) {
                //this is a geolocation error
                switch (msg.code) {
                case 1:
                    //$('.location').text('Permission Denied').fadeOut().fadeIn();
                    showZipForm();
                    break;
                case 2:
                    //$('.location').text('Position Unavailable').fadeOut().fadeIn();
                    showZipForm();
                    break;
                case 3:
                    GETZIP.index++;
                    $('.location copy').text('Timeout... Trying again (' + GETZIP.index + ')').fadeOut().fadeIn();
                    navigator.geolocation.getCurrentPosition(GETZIP.getZipCode, GETZIP.error, {
                        timeout: 7000
                    });
                    break;
                default:
                    //nothing
                }

            } else {
                //this is a text error
                $('#error').text(msg).addClass('failed');
            }

        },

        getZipCode: function (position) {
            var position = position.coords.latitude + "," + position.coords.longitude;
            $.getJSON('proxy.php', {
                path: "http://maps.google.com/maps/api/geocode/json?latlng=" + position + "&sensor=false",
                type: "application/json"
            }, function (json) {
                //Find the zip code of the first result
                if (!(json.status == "OK")) {
                    GETZIP.error('Couldnt determine zipcode from your location');   
                    init();
                    return;
                }
                $(json.results[0].address_components).each(function (i, el) {
	            	if($.inArray('neighborhood',el.types) > -1){
	            		neighborhood = el.short_name;
	                } else if ($.inArray("administrative_area_level_1", el.types) > -1) {
	                    state = el.short_name;
	                } else if ($.inArray('sublocality', el.types) > -1) {
	                    city = el.short_name;
	                } else if ($.inArray("postal_code", el.types) > -1) {
	                    //$('.location').text('Your Zip Code: ' + el.short_name);
	                    getService(el.short_name);
	                    found = true;
	                }
	            });
	            setLocationText();
            });
        },

        getCity: function (zip) {
            $.getJSON('proxy.php', {
                path: "http://maps.google.com/maps/api/geocode/json?address=" + zip + "&sensor=false",
                type: "application/json"
            }, function (json) {
            	 if (!(json.status == "OK")) {
                    GETZIP.error('Zipcode not Found');
                    init();
                    return;
                }
                //GETZIP.processResults(json.results[0].address_components);
                //$(json.results[0].address_components).each(function (i, el) {
                for (var i=json.results[0].address_components.length -1; i > 0; i--){
                    var el = json.results[0].address_components[i];
                    switch(el.types[0]){
                        case 'administrative_area_level_1':
                            state = el.short_name;
                        break;
                        case 'locality':
                            city = el.short_name;
                        break;
                        case 'sublocality':
                            city = el.short_name;
                        break;
                       

                    }

                    
	            };
                 getService(zip);
                found = true;

                setLocationText();
            })
        }
    };

    GETZIP.getLocation();

    showZipForm = function (e) {
        $('.location .copy a').remove();
        $('.location .copy').html('');
        $('.location .input').append('<form>Zipcode: <input value="" type="number" name="zip" min="0" max="99999" /></form>');
        $('.location .input form input').focus();


        $('.location .input form').submit(function (e) {
            console.log('innited without geolocation');
            zip = $('input').val();
            
            GETZIP.getCity(zip);
            return false;
        });
    };
    hideZipForm = function () {
        $('.location .input').html('');
    };
    cancelRequest = function(){
        if(getProvider) {
            $('.feed .loading').remove();
            getProvider.abort();
        }
    }

    setLocationText = function(){
        hideZipForm();
        if(!neighborhood) neighborhood = '';
        if(!city) city = '';
        if(!state) state = '';

        if(neighborhood){
            $('.location .copy').html('<a href="#">'+neighborhood+', '+city + ', ' + state+'&nbsp</a>');
        }else {
            $('.location .copy').html('<a href="#">'+city + ', ' + state+'&nbsp</a>');
        }

        $('.location .copy a').click(function(e){
            showZipForm(e);
        });

        city = undefined;
        state = undefined;
        neighborhood = undefined;
        
    };
    prettifyDate = function(time){
       var timeNum = Number(time.replace(':',''));
       
       if(timeNum < 1200){
            time += 'AM';
            if (time[0] === '0'){
                time = time.substring(1,time.length);
           }
            
       } else {
            timeNum -= 1200;
            var hrs = time.substring(0,2);
            var mins = time.substring(3,5);
            hrs = Number(hrs -12).toString();
            time = hrs + ':' + mins + 'PM';

       }
       
       return time;
    };



});