$(document).ready(function() {

	var apiKey = "p6hxx8kswgzu2fvv7qje5rbn"
	var apiSecret = "dxJJqMrbSG"
	
	
	//frasier
	var showId = '830135';

	var providers = [];

	function init(){
		$('.container').append('<form>Zipcode: <input value="11217" type="number" name="zip" maxlength="5" /></form>');
		$('form').submit(function(e) {
		  console.log('innited without geolocation');
		  getService($('input').val());
		  return false;
		});
	}


	function getService(zip){
		console.log(zip);
		var serviceUrl = 'http://api.rovicorp.com/TVlistings/v9/listings/services/postalcode/'+zip+'/info?locale=en-US&countrycode=US&format=json&apikey=6bnt3uq55nnfe9sxfksgn9ms&callback=?'
		$.getJSON(serviceUrl, function(data) {
			var items = [];
			var areaString = "";
			$.each(data.ServicesResult.Services.Service, function(key, service) {
				providers.push(service);
			});
			$('.container').append('<select>');

			$('select').change(function(e) {
				providerSelected(e.currentTarget.value);
			});

			//populate service provider lists
			$.each(providers, function(key, service) {
				console.log(service);
				  if(service.City !== 'Eastern Time Zone') $('select').append('<option value='+service.ServiceId+'>'+service.SystemName+'</option>');
			});

			$('.container').append('</select>');

			
		});

	}
	function providerSelected(id){
		console.log(id,showId);

		var showUrl = 'http://api.rovicorp.com/TVlistings/v9/listings/programdetails/'+id+'/'+showId+'/info?locale=en-US&duration=10080&imagecount=5&include=Program&inprogress=0&format=json&apikey=6bnt3uq55nnfe9sxfksgn9ms&callback=?'
		$('.container').append('<div class="contents">loading, may take a while</div>');
		$.getJSON(showUrl, function(showData) {
			var airings = showData.ProgramDetailsResult.Schedule.Airings;
			$('.contents').html('<ul class="listings"></ul>');
			$.each(airings,function(key,airing){
				console.log(airing);
				$('.listings').append('<li>'+$.format.date(airing.AiringTime,"MM/dd/yyyy")+' on channel '+airing.Channel+' <br/> '+airing.Copy+'</li><hr>	');
			})


			//$('.container').append()
		}).error(function(){
			console.log('error:'+e);
		})

	}

	//init();
	var GETZIP = {
      getLocation: function(){
         $('#status').text('searching...');
         if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(GETZIP.getZipCode, GETZIP.error, {timeout: 7000});//cache it for 10 minutes
         }else{
            GETZIP.error('Geo location not supported');
         }
      },
      index: 0,
      error: function(msg) {
      	init();
         if(msg.code){
            //this is a geolocation error
            switch(msg.code){
            case 1:
               $("#status").text('Permission Denied').fadeOut().fadeIn();
               break;
            case 2:
               $("#status").text('Position Unavailable').fadeOut().fadeIn();
               break;
            case 3:
               GETZIP.index++;
               $("#status").text('Timeout... Trying again (' + GETZIP.index + ')').fadeOut().fadeIn();
               navigator.geolocation.getCurrentPosition(GETZIP.getZipCode, GETZIP.error, {timeout: 7000});
               break;
            default:
               //nothing
            }

         }else{
            //this is a text error
            $('#error').text(msg).addClass('failed');
         }
 
      },
 
      getZipCode: function(position){
         var position = position.coords.latitude + "," + position.coords.longitude;
         $.getJSON('proxy.php',{
            path : "http://maps.google.com/maps/api/geocode/json?latlng="+position+"&sensor=false",
            type: "application/json"
         }, function(json){
            //Find the zip code of the first result
            if(!(json.status == "OK")){
               GETZIP.error('Zip Code not Found');
               init();
               return;
            }
            var found = false;
            $(json.results[0].address_components).each(function(i, el){
               if($.inArray("postal_code", el.types) > -1){
                  $("#status").text('Your Zip Code: ' + el.short_name);
                  getService(el.short_name);
                  found = true;
                  return;
               }
            });
            if(!found){
               GETZIP.error('Zip Code not Found');
            }
         });
      }
   }
   GETZIP.getLocation();

	
});